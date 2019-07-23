sap.ui.define(["jquery.sap.global", 
	"sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/ActionSheet",
	"sap/m/Dialog",
	"sap/m/Popover",
	"sap/suite/ui/generic/template/lib/deletionHelper",
	"sap/suite/ui/generic/template/lib/routingHelper",
	"sap/suite/ui/generic/template/lib/SaveScenarioHandler",
	"sap/suite/ui/generic/template/lib/ContextBookkeeping",
	"sap/suite/ui/generic/template/lib/CRUDHelper",
	"sap/suite/ui/generic/template/lib/StatePreserver",
	"sap/suite/ui/generic/template/lib/testableHelper",
	"sap/base/Log"
	],
	function(jQuery, BaseObject, Device, JSONModel, MessageToast, ActionSheet, Dialog, Popover, deletionHelper, 
		routingHelper, SaveScenarioHandler, ContextBookkeeping, CRUDHelper, StatePreserver, testableHelper, Log) {
		"use strict";

		var sContentDensityClass = (testableHelper.testableStatic(function(bTouch, oBody) {
			var sCozyClass = "sapUiSizeCozy",
				sCompactClass = "sapUiSizeCompact";
			if (oBody.hasClass(sCozyClass) || oBody.hasClass(sCompactClass)) { // density class is already set by the FLP
				return "";
			} else {
				return bTouch ? sCozyClass : sCompactClass;
			}
		}, "Application_determineContentDensityClass")(Device.support.touch, jQuery(document.body)));

		function getContentDensityClass() {
			return sContentDensityClass;
		}

		// defines a dependency from oControl to a parent
		function fnAttachControlToParent(oControl, oParent) {
			jQuery.sap.syncStyleClass(sContentDensityClass, oParent, oControl);
			oParent.addDependent(oControl);
		}

		// Expose selected private static functions to unit tests
		/* eslint-disable */
		var fnAttachControlToParent = testableHelper.testableStatic(fnAttachControlToParent, "Application_attachControlToParent");
		/* eslint-enable */

		/* An instance of this class represents a Smart Template based application. Thus, there is a one-to-one relationship between
		 * instances of this class and instances of sap.suite.ui.generic.template.lib.AppComponent.
		 * However, this class is only used inside the sap.suite.ui.generic.template.lib package. It is not accessible to template developers
		 * or breakout developers.
		 * Instances of this class are generated in sap.suite.ui.generic.template.lib.TemplateAssembler.
		 * Note that TemplateAssembler also possesses a reference to the instance of this class which represents the app currently
		 * running.
		 * oTemplateContract: An object which is used for communication between this class and the AppComponent and its helper classes.
		 *                    See documentation of AppComponent for more details.
		 * Note that this class injects its api to these classes into the template contract object.
		 * Currently this class supports two use cases:
		 * 1. For non-draft apps it contains the information whether the app is currently in display or in edit state (methods set/getEditableNDC)
		 * 2. A 'navigation' model is supported. Thereby, we consider navigation to take place each time a route name or a route pattern is changed (but not when only the parameters added to the route are changed)
		 */
		function getMethods(oTemplateContract) {

			var oContextBookkeeping = new ContextBookkeeping(oTemplateContract.oAppComponent);
			var bEtagsAvailable;
			var mNavigationProperties = Object.create(null);   // filled on demand

			function isComponentActive(oComponent){
				var aActiveComponents = oTemplateContract.oNavigationControllerProxy.getActiveComponents();
				return aActiveComponents.indexOf(oComponent.getId()) >= 0;
			}

			var bIsWaitingForSideEffectExecution = false;

			function fnAddSideEffectPromise(oPromise){
				oTemplateContract.fnAddSideEffectPromise(oPromise);
			}
			
			// Executes fnFunction as soon as all side-effects have been executed.
			function fnPerformAfterSideEffectExecution(fnFunction, bBusyCheck){
				
				if (bIsWaitingForSideEffectExecution){
					return;   // do not let two operation wait for side effect execution
				}
				var aRunningSideEffectExecutions = jQuery.grep(oTemplateContract.aRunningSideEffectExecutions, function(oEntry){return !!oEntry;});
				if (aRunningSideEffectExecutions.length){
					bIsWaitingForSideEffectExecution = true;
					Promise.all(aRunningSideEffectExecutions).then(function(){
						bIsWaitingForSideEffectExecution = false;
						fnPerformAfterSideEffectExecution(fnFunction, bBusyCheck);
					});
				} else if (!(bBusyCheck && oTemplateContract.oBusyHelper.isBusy())){
					fnFunction();
				}
			}

			function fnMakeBusyAware(oControl) {
				var sOpenFunction;
				if (oControl instanceof Dialog) {
					sOpenFunction = "open";
				} else if (oControl instanceof Popover || oControl instanceof ActionSheet) {
					sOpenFunction = "openBy";
				}
				if (sOpenFunction) {
					var fnOpenFunction = oControl[sOpenFunction];
					oControl[sOpenFunction] = function() {
						var myArguments = arguments;
						fnPerformAfterSideEffectExecution(function(){
							if (!oTemplateContract.oBusyHelper.isBusy()) { // suppress dialogs while being busy
								oTemplateContract.oBusyHelper.getUnbusy().then(function() { // but the busy dialog may still not have been removed
									fnOpenFunction.apply(oControl, myArguments);
								});
							}
						});
					};
				}
			}

			var mFragmentStores = {};

			function getDialogFragmentForView(oView, sName, oFragmentController, sModel, fnOnFragmentCreated) {
				oView = oView || oTemplateContract.oNavigationHost;
				var sViewId = oView.getId();
				var mFragmentStore = mFragmentStores[sViewId] || (mFragmentStores[sViewId] = {});
				var oFragment = mFragmentStore[sName];
				if (!oFragment) {
					oFragment = sap.ui.xmlfragment(sViewId, sName, oFragmentController);
					fnAttachControlToParent(oFragment, oView);
					var oModel;
					if (sModel) {
						oModel = new JSONModel();
						oFragment.setModel(oModel, sModel);
					}
					(fnOnFragmentCreated || jQuery.noop)(oFragment, oModel);
					mFragmentStore[sName] = oFragment;
					fnMakeBusyAware(oFragment);
				}
				return oFragment;
			}

			function getOperationEndedPromise() {
				return new Promise(function(fnResolve) {
					oTemplateContract.oNavigationObserver.getProcessFinished(true).then(function(){
						oTemplateContract.oBusyHelper.getUnbusy().then(fnResolve);
					});
				});
			}

			function setBackNavigation(fnBackNavigation) {
				oTemplateContract.oShellServicePromise.then(function(oShellService){
					oShellService.setBackNavigation(fnBackNavigation);
				});
			}

			var bIsEditable = false;

			function setEditableNDC(isEditable) {
				if (bIsEditable && !isEditable){
					var oModel = oTemplateContract.oAppComponent.getModel();
					oModel.resetChanges();
				}
				bIsEditable = isEditable;
			}
			
			// Returns a create context for the specified entity set which is already filled with the given predefined values
			function createNonDraft(sEntitySet, vPredefinedValues) {
				return CRUDHelper.createNonDraft("/" + sEntitySet, oTemplateContract.oAppComponent.getModel(), setEditableNDC, vPredefinedValues);
			}

			// This function indicates if a new HistoryEntry is required.
			// A new HistoryEntry is only required if the user navigates to an object which will be displayed in a new column.
			// If the object will be displayed in a column which is already visible no HistoryEntry is required
			function isNewHistoryEntryRequired(oTargetContext, sNavigationProperty){
				if (!oTemplateContract.oFlexibleColumnLayoutHandler){
					return true;
				}
				var oTarget = routingHelper.determineNavigationPath(oTargetContext, sNavigationProperty);
				return oTemplateContract.oFlexibleColumnLayoutHandler.isNewHistoryEntryRequired(oTarget);
			}

			function fnRegisterStateChanger(oStateChanger){
				oTemplateContract.aStateChangers.push(oStateChanger);
			}
			
			// Note: This is the prepareDeletion-method exposed by the ApplicationProxy
			// The prepareDeletion-method of Application is actually the same as the prepareDeletion-method of deletionHelper.
			// That method internally calls the prepareDeletion-method of ApplicationProxy (i.e. this function).
			function fnPrepareDeletion(sPath, oPromise){
				oPromise.then(function(){
					oContextBookkeeping.adaptAfterObjectDeleted(sPath);	
				});
			}

			function fnBuildSections(sEntitySet, bOnlyEntitySetNames, aSections){
				var oTreeNode = oTemplateContract.mEntityTree[sEntitySet];
				var sNewEntry;
				if (oTreeNode.navigationProperty && oTreeNode.parent){
					sNewEntry = bOnlyEntitySetNames ? oTreeNode.entitySet : oTreeNode.navigationProperty;
				} else {
					sNewEntry = sEntitySet;
				}
				if (aSections.indexOf(sNewEntry) < 0){
					aSections.unshift(sNewEntry);
					if (oTreeNode.navigationProperty && oTreeNode.parent){
						fnBuildSections(oTreeNode.parent, bOnlyEntitySetNames, aSections);
					}
				}
			}

			function getSections(sEntitySet, bOnlyEntitySetNames){
				var aRet = [];
				fnBuildSections(sEntitySet, bOnlyEntitySetNames, aRet);
				return aRet;
			}

			function getBreadCrumbInfo(sEntitySet){
				var aSections = getSections(sEntitySet);
				// remove the last one - this is the current shown section
				aSections.pop();
				var sPath = "";
				var delimiter = "";
				var aRet = [];
				for (var i = 0; i < aSections.length; i++){
					sPath = sPath + delimiter + aSections[i];
					aRet.push(sPath);
					delimiter = "/";
				}
				return aRet;
			}

			function getHierarchySectionsFromCurrentHash(){
				var sHash = oTemplateContract.oNavigationControllerProxy.oHashChanger.getHash();
						// remove query part if there's one
				var	sPath = sHash.split("?")[0];
				var aSections = sPath.split("/");

				if (aSections[0] === "" || aSections[0] === "#") {
					// Path started with a / - remove first section
					aSections.splice(0, 1);
				}
				return aSections;
			}
			
			// This method returns an object that provides information about the fullscreen up-links from a currently active detail page (pages with view level > 0).
			// sEntitySet is the entity set of this detail page. It is assumed that this page is currently active.
			// bIncludeRoot: The information about the up link to the root is requested (note that it is partly created anycase)
			// bIncludeMe: The information whether the up link to this detail page is also required
			// The object returned by this method contains to properties: aInfoObjects and aInfoObjectPromises.
			// aInfoObjects at position i contains an info object for the up link to page of level i.
			// Thereby, the entry for i = 0 exists even if bIncludeRoot is false.
			// The highest index in aInfoObjects is the level of this page (if bIncludeMe is truthy) resp. of its parent (if bIncludeMe is faulty).
			// The entries of array aInfoObjects are objects containing the folllowing properties:
			// - link: the expanded link without parameters that points to the detail page of this level (for i > 0 it starts with a "/")
			// - section: the section of the current url belonging to this level (only if the level is >0)
			// - entitySet: the (name of the) entity set belonging to this level
			// - mAppStates: a map parameter -> array of values, which represents the url parameters which should be used when navigating up to this level
			// - fullLink: like link, but with parameters
			// IMPORTANT: The properties mAppStates and fullLink will be determined asynchronously. Therefore, they must not be evaluated directly.
			// For this purpose the property aInfoObjectPromises of the returned object contains a corresponding array of Promises.
			// Each Promise will be resolved to the corresponding entry of aInfoObjects as soon as mAppStates and fullLink are available.
			// In case bIncludeRoot is faulty aInfoObjectPromises will not contain an entry at index 0.
			function getLinkToUpperLayersInfo(bIncludeRoot, bIncludeMe, sEntitySet){
				var aInfoObjects = [];
				var oCurrentIdentity = oTemplateContract.oNavigationControllerProxy.getCurrentIdentity();
				
				
				
				var oCurrentNode = oCurrentIdentity.treeNode;
				var aSections = getHierarchySectionsFromCurrentHash();
				var iUpTo = oCurrentNode.level - (bIncludeMe ? 0 : 1);
				var sLink = "";
				var sDelimiter = "";
				for (var i = 0; i <= iUpTo; i++){
					var oInfoObject = {
						link: sLink
					};
					if (i > 0){
						oInfoObject.section = aSections[i - 1]; // Note that aSections does not have an entry for the root
					}
					aInfoObjects.push(oInfoObject);
					if (i < iUpTo){ // allready build the link for the next step (if this is not already the last)
						sLink = sLink + sDelimiter + aSections[i];
						sDelimiter = "/";
					}
				}
				var aInfoObjectPromises = [];
				var fnAddUpperLayerLink = function(oNode){
					var oInfoObject = aInfoObjects[oNode.level];
					oInfoObject.entitySet = oNode.entitySet;
					oInfoObject.mAppStates = Object.create(null);
					var oAppStatePromise = oTemplateContract.oNavigationControllerProxy.getApplicableStateForComponentAddedPromise(oNode.componentId, oInfoObject.link, oInfoObject.mAppStates);
					aInfoObjectPromises[oNode.level] = oAppStatePromise.then(function(){
						if (oTemplateContract.oFlexibleColumnLayoutHandler){
							oTemplateContract.oFlexibleColumnLayoutHandler.adaptBreadCrumbUrlParameters(oInfoObject.mAppStates, oNode);
						}
						oInfoObject.fullLink = oTemplateContract.oNavigationControllerProxy.concatPathAndAppStates(oInfoObject.link, oInfoObject.mAppStates);
						return oInfoObject;
					});
				};
				if (bIncludeMe){
					fnAddUpperLayerLink(oCurrentNode);
				}
				for (var iLastLevel = bIncludeRoot ? 0 : 1; oCurrentNode.level > iLastLevel;){
					oCurrentNode = oTemplateContract.mRoutingTree[oCurrentNode.parentRoute];
					fnAddUpperLayerLink(oCurrentNode);	
				}
				return {
					aInfoObjects: aInfoObjects,
					aInfoObjectPromises: aInfoObjectPromises
				};
			}

			function getResourceBundleForEditPromise(){
				var aActiveComponents = oTemplateContract.oNavigationControllerProxy.getActiveComponents();
				var iMinViewLevel = 0;
				var oComponent;
				for (var i = 0; i < aActiveComponents.length; i++){
					var oRegistryEntry = oTemplateContract.componentRegistry[aActiveComponents[i]];
					if (oRegistryEntry.viewLevel > 0 && (iMinViewLevel === 0 || oRegistryEntry.viewLevel < iMinViewLevel)){
						iMinViewLevel = oRegistryEntry.viewLevel;
						oComponent = oRegistryEntry.oComponent;
					}
				}
				var oComponentPromise = oComponent ? Promise.resolve(oComponent) : oTemplateContract.oNavigationControllerProxy.getRootComponentPromise();
				return oComponentPromise.then(function(oComp){
					return oComp.getModel("i18n").getResourceBundle();
				});
			}

			function getAppTitle() {
				return oTemplateContract.oNavigationControllerProxy.getAppTitle();
			}

			function fnSubTitleForViewLevelChanged(iViewLevel, sBreadCrumbText){
				oTemplateContract.oNavigationControllerProxy.subTitleForViewLevelChanged(iViewLevel, sBreadCrumbText);
			}

			function getCurrentKeys(iViewLevel){
				return oTemplateContract.oNavigationControllerProxy.getCurrentKeys(iViewLevel);
			}

			function getPathForViewLevelOneIfVisible() {
				for (var sComponentId in oTemplateContract.componentRegistry){
					var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
					if (oRegistryEntry.viewLevel === 1) {
						if (isComponentActive(oRegistryEntry.oComponent)) {
							var oElementBinding = oRegistryEntry.oComponent.getComponentContainer().getElementBinding();
							return oElementBinding && oElementBinding.getPath();
						} else {
							return null;
						}
					}
				}
				return null;
			}
			
			function getTreeNode(oComponentRegistryEntry){
				if (oComponentRegistryEntry.viewLevel){
					var sEntitySet = oComponentRegistryEntry.oComponent.getEntitySet();
					return oTemplateContract.mEntityTree[sEntitySet];
				}
				return oTemplateContract.mRoutingTree.root;
			}

			function fnNavigateRoute(sRouteName, sKey, oComponentRegistryEntry, sEmbeddedKey, bReplace){
				var oTreeNode = getTreeNode(oComponentRegistryEntry);
				var bIsEmbedded = false;
				var sFullRouteName;
				var bWithKey = true;
				for (var i = 0; i < oTreeNode.children.length && !sFullRouteName; i++){
					var sChild = oTreeNode.children[i];
					var oChildNode = oTemplateContract.mEntityTree[sChild];
					if (oChildNode[oComponentRegistryEntry.viewLevel ? "navigationProperty" : "sRouteName"] === sRouteName){
						sFullRouteName = oChildNode.sRouteName;
						bWithKey = !oChildNode.noKey;
					}
				}
				if (sEmbeddedKey && !sFullRouteName){
					var oEmbeddedComponent = oTreeNode.embeddedComponents[sEmbeddedKey];
					if (oEmbeddedComponent){
						for (var j = 0; j < oEmbeddedComponent.pages.length && !bIsEmbedded; j++){
							var oPage = oEmbeddedComponent.pages[j];
							if (oPage.navigationProperty === sRouteName ){
								bIsEmbedded = true;
								sFullRouteName = oComponentRegistryEntry.route + "/" + sEmbeddedKey + "/" + sRouteName;
								bWithKey = !(oPage.routingSpec && oPage.routingSpec.noKey);
							}
						}
					}
				}
				if (sFullRouteName){
					var sInfix = bIsEmbedded ? sEmbeddedKey + routingHelper.getPatternDelimiter() : "";
					var sKeyClause = bWithKey ? "(" + sKey + ")" : "";
					var sSuffix = sInfix + sRouteName + sKeyClause;
					oTemplateContract.oNavigationControllerProxy.navigateToSuffix(sSuffix, oComponentRegistryEntry.viewLevel + 1, sFullRouteName, bReplace);
				}
			}

			var oGlobalObject;
			function getCommunicationObject(oComponent, iLevel){
				var i = iLevel || 0;
				if (i > 0){
					// This is only allowed for ReuseComponents, which is not handled here
					return null;
				}
				var sEntitySet = oComponent.getEntitySet();
				var oTreeNode = oTemplateContract.mEntityTree[sEntitySet];
				var oRet = oTreeNode && oTreeNode.communicationObject;
				for (; i < 0 && oRet; ){
					oTreeNode = oTemplateContract.mEntityTree[oTreeNode.parent];
					if (oTreeNode.communicationObject !== oRet){
						i++;
						oRet = oTreeNode.communicationObject;
					}
				}
				if (i < 0 || oRet){
					return oRet;
				}
				oGlobalObject = oGlobalObject || {};
				return oGlobalObject;
			}

			function getForwardNavigationProperty(iViewLevel){
				for (var sKey in oTemplateContract.mEntityTree) {
					if (oTemplateContract.mEntityTree[sKey].navigationProperty && (oTemplateContract.mEntityTree[sKey].level === iViewLevel + 1)) {
						return oTemplateContract.mEntityTree[sKey].navigationProperty;
					}
				}
			}

			function getMaxColumnCountInFCL(){
				return oTemplateContract.oFlexibleColumnLayoutHandler ? oTemplateContract.oFlexibleColumnLayoutHandler.getMaxColumnCountInFCL() : false;
			}

			// This method is called when a draft modification is done. It enables all interested active components to mark their draft as modified
			function fnMarkCurrentDraftAsModified(){
				// All active components get the chance to declare one path as the path to be marked as modified
				var aActiveComponents = oTemplateContract.oNavigationControllerProxy.getActiveComponents();
				for (var i = 0; i < aActiveComponents.length; i++){
					var sComponentId = aActiveComponents[i];
					var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
					var sModifiedPath = oRegistryEntry.methods.currentDraftModified && oRegistryEntry.methods.currentDraftModified();
					if (sModifiedPath){
						oContextBookkeeping.markDraftAsModified(sModifiedPath);
					}
				}
			}

			/*
			 * Check if entity sets (service) used are etag enabled
			 *
			 *@returns {boolean} return true to skip the model refresh, when:
								a) at least one entity set is etag enabled 
								b) model does not contain any contexts yet
			 *@private
			*/
			
			function fnCheckEtags() {
				if (bEtagsAvailable !== undefined) {
					return bEtagsAvailable;
				}
				var oEntity, sEtag, oContext, sEntitySet, sPath, oEntitySet, bEmptyModel = true;
				var oModel = oTemplateContract.oAppComponent.getModel();
				var oMetaModel = oModel.getMetaModel();
				//This will be improved. Waiting for an official model API to get contexts
				var mContexts = oModel.mContexts;
				for (oContext in mContexts) {
					bEmptyModel = false;
					sPath = mContexts[oContext].sPath;
					sEntitySet = sPath && sPath.substring(1, sPath.indexOf('('));
					oEntitySet = sEntitySet && oMetaModel.getODataEntitySet(sEntitySet);
					if (oEntitySet) {
						oEntity = oModel.getProperty(sPath);
						sEtag = oEntity && oModel.getETag(undefined, undefined, oEntity) || null;
						if (sEtag) {
							bEtagsAvailable = true;
							return bEtagsAvailable;
						}
					}
				}
				// if mContexts is an empty object, return true but do not alter bEtagsAvailable
				if (bEmptyModel) {
					return true;
				}
				bEtagsAvailable = false;
				return bEtagsAvailable;
			}

			function fnRefreshAllComponents(mExceptions) {
				var i, sId, oRegistryEntry;
				var aAllComponents = oTemplateContract.oNavigationControllerProxy.getAllComponents(); // get all components
				for (i = 0; i < aAllComponents.length; i++) {
					sId = aAllComponents[i];
					if (!mExceptions || !mExceptions[sId]){
						oRegistryEntry = oTemplateContract.componentRegistry[sId];
						oRegistryEntry.utils.refreshBinding(true);
					}
				}
			}
			
			function setStoredTargetLayoutToFullscreen(iLevel){
				if (oTemplateContract.oFlexibleColumnLayoutHandler){
					oTemplateContract.oFlexibleColumnLayoutHandler.setStoredTargetLayoutToFullscreen(iLevel);	
				}
			}
			
			// Call this function, when paginator info is no longer reliable due to some cross navigation
			function fnInvalidatePaginatorInfo(){
				oTemplateContract.oPaginatorInfo = {};
			}
			
			function getStatePreserver(oSettings){
				return new StatePreserver(oTemplateContract, oSettings);	
			}
			
			function getSaveScenarioHandler(oController, oCommonUtils){
				return new SaveScenarioHandler(oTemplateContract, oController, oCommonUtils);	
			}
			
			// returns meta data of the specified navigation property for the specified entity set if it exists. Otherwise it returns a faulty value.
			function getNavigationProperty(sEntitySet, sNavProperty){
				var mMyNavigationProperties = mNavigationProperties[sEntitySet];
				if (!mMyNavigationProperties){
					mMyNavigationProperties = Object.create(null);
					mNavigationProperties[sEntitySet] = mMyNavigationProperties;
					var oModel = oTemplateContract.oAppComponent.getModel();
					var oMetaModel = oModel.getMetaModel();
					var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
					var oEntityType = oEntitySet && oMetaModel.getODataEntityType(oEntitySet.entityType);
					var aNavigationProperty = (oEntityType && oEntityType.navigationProperty) || [];
					for (var i = 0; i < aNavigationProperty.length; i++){
						var oNavigationProperty = aNavigationProperty[i];
						mMyNavigationProperties[oNavigationProperty.name] = oNavigationProperty;
					}
				}
				return mMyNavigationProperties[sNavProperty];
			}
			
			function fnSwitchToDraft(oDraftContext){
				var oSwitchToSiblingPromise = oTemplateContract.oNavigationControllerProxy.getSwitchToSiblingPromise(oDraftContext);
				oTemplateContract.oBusyHelper.setBusy(oSwitchToSiblingPromise.then(function(fnNavigate){
					fnNavigate();
				}));
			}
			
			function getNavigateAfterCancelPromise(oActive){
				var oActiveObject = oActive && oActive.getObject();
				var bIsActiveEntity = oActiveObject && oActiveObject.IsActiveEntity;
				if (!bIsActiveEntity){ // create draft
					return Promise.resolve(deletionHelper.getNavigateAfterDeletionOfCreateDraft(oTemplateContract));
				}
				return oTemplateContract.oNavigationControllerProxy.getSwitchToSiblingPromise(oActive).then(function(fnNavigate){
					return function(){
						// The active context is invalidated as the DraftAdministrativeData of the context(the active context) has changed after draft deletion.
						// This is done to keep the DraftAdministrativeData of the record updated.
						var oModel = oActive.getModel();
						oModel.invalidateEntry(oActive);
						fnNavigate();
					};
				});
			}
			
			function fnNavigateAfterActivation(oActiveContext){
				oTemplateContract.oNavigationControllerProxy.navigateAfterActivation(oActiveContext);
			}

			oTemplateContract.oApplicationProxy = { // inject own api for AppComponent into the Template Contract. Other classes (NavigationController, BusyHelper) will call these functions accordingly.
				getDraftSiblingPromise: oContextBookkeeping.getDraftSiblingPromise,
				getSiblingPromise: oContextBookkeeping.getSiblingPromise,
				getAlternativeContextPromise: oContextBookkeeping.getAlternativeContextPromise,
				getPathOfLastShownDraftRoot: oContextBookkeeping.getPathOfLastShownDraftRoot,
				areTwoKnownPathesIdentical: oContextBookkeeping.areTwoKnownPathesIdentical,

				getResourceBundleForEditPromise: getResourceBundleForEditPromise,

				getHierarchySectionsFromCurrentHash: getHierarchySectionsFromCurrentHash,
				getLinkToUpperLayersInfo: getLinkToUpperLayersInfo,
				getContentDensityClass: getContentDensityClass,
				setEditableNDC: setEditableNDC,
				getDialogFragment: getDialogFragmentForView.bind(null, null),
				destroyView: function(sViewId){
					delete mFragmentStores[sViewId];
				},
				markCurrentDraftAsModified: fnMarkCurrentDraftAsModified,
				prepareDeletion: fnPrepareDeletion,
				performAfterSideEffectExecution: fnPerformAfterSideEffectExecution
			};

			return {
				setEditableNDC: setEditableNDC,
				getEditableNDC: function() {
					return bIsEditable;
				},
				createNonDraft: createNonDraft,
				getContentDensityClass: getContentDensityClass,
				attachControlToParent: fnAttachControlToParent,
				getDialogFragmentForView: getDialogFragmentForView,
				getBusyHelper: function() {
					return oTemplateContract.oBusyHelper;
				},
				addSideEffectPromise: fnAddSideEffectPromise,
				performAfterSideEffectExecution: fnPerformAfterSideEffectExecution,
				isComponentActive: isComponentActive,
				showMessageToast: function() {
					var myArguments = arguments;
					var fnMessageToast = function() {
						Log.info("Show message toast");
						MessageToast.show.apply(MessageToast, myArguments);
					};
					Promise.all([getOperationEndedPromise(true), oTemplateContract.oBusyHelper.getUnbusy()]).then(fnMessageToast);
				},
				setBackNavigation: setBackNavigation,
				isNewHistoryEntryRequired: isNewHistoryEntryRequired,
				registerStateChanger: fnRegisterStateChanger,
				getDraftSiblingPromise: oContextBookkeeping.getDraftSiblingPromise,
				registerContext: oContextBookkeeping.registerContext,
				activationStarted: oContextBookkeeping.activationStarted,
				cancellationStarted: oContextBookkeeping.cancellationStarted,
				editingStarted: oContextBookkeeping.editingStarted,
				getBreadCrumbInfo: getBreadCrumbInfo,
				getSections: getSections,
				getHierarchySectionsFromCurrentHash: getHierarchySectionsFromCurrentHash,
				getLinkToUpperLayersInfo: getLinkToUpperLayersInfo,
				getAppTitle: getAppTitle,
				subTitleForViewLevelChanged: fnSubTitleForViewLevelChanged,
				getCurrentKeys: getCurrentKeys,
				getPathForViewLevelOneIfVisible: getPathForViewLevelOneIfVisible,
				getCommunicationObject: getCommunicationObject,
				navigateRoute: fnNavigateRoute,
				getForwardNavigationProperty: getForwardNavigationProperty,
				getMaxColumnCountInFCL: getMaxColumnCountInFCL,
				markCurrentDraftAsModified: fnMarkCurrentDraftAsModified,
				checkEtags: fnCheckEtags,
				refreshAllComponents: fnRefreshAllComponents,
				getIsDraftModified: oContextBookkeeping.getIsDraftModified,
				prepareDeletion: deletionHelper.prepareDeletion.bind(null, oTemplateContract),
				setStoredTargetLayoutToFullscreen: setStoredTargetLayoutToFullscreen,
				invalidatePaginatorInfo: fnInvalidatePaginatorInfo,
				getStatePreserver: getStatePreserver,
				getSaveScenarioHandler: getSaveScenarioHandler,
				getNavigationProperty: getNavigationProperty,
				switchToDraft: fnSwitchToDraft,
				getNavigateAfterCancelPromise: getNavigateAfterCancelPromise,
				navigateAfterActivation: fnNavigateAfterActivation
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.lib.Application", {
			constructor: function(oTemplateContract) {
				jQuery.extend(this, getMethods(oTemplateContract));
			}
		});
	});