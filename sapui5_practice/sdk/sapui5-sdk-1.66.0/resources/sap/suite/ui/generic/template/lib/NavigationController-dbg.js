/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// ------------------------------------------------------------------------------------------------------------
// This class handles inner app navigation for Smart Template based apps.
// The class exposes its services in two ways:
// 1. There is a public API providing the navigation methods navigateToRoot, navigateToContext, navigateToMessagePage, and navigateBack
//    to Template developers and even Breakout developers.
// 2. A richer object oNavigationControllerProxy is created (see constructor) which is used by the core classes of the SmartTemplate framework.
//    This object allows more detailed interaction with navigation.

// Moreover, this class is responsible for handling the route matched events occuring within a Smart Template based App.

// Within this class we differentiate between a number of different scenarios for navigation/url-changes:
// 1. A state change is a change of the url which does not lead to a new route, but just modifies the encoding of the internal state of one view in the
//    url. Whenever a route matched event occurs it is first checked, whether this corresponds to a state change.
//    If this is true, we do not consider it as a navigation and all further handling of the url within this class is stopped.
//    It is assumed that the state change is totally controlled by the component that has initiated the state change.
//    Note that agents might register themselves as possible state changers via sap.suite.ui.generic.template.lib.Application.registerStateChanger.
//    A new url is passed to the registered state changers one after the other (method isStateChange). If any of those returns true the processing
//    of the url is stopped.
// 2. Illegal urls: The user enters a url which belongs to this App but not to a legal route. This is not considered as a navigation.
// 3. Back navigation: Back navigation can be triggered by the user pressing the browser-back button (then we have no control), the user pressing the
//    back button within the App, or programmatically (e.g. after cancelling an action).
// 4. Programmatic (forward) navigation: The program logic often demands the navigation to be triggerd programmatically. Such navigation is always forwarded to
//    function fnNavigate. Note that this function automatically performs a back navigation, when the navigation target is the same as the last history entry.
//    Note that it is also possible to navigate programmatically to the MessagePage. However, this does not change the url and is therefore not considered as navigation.
// 5. Manual navigation: The user can navigate inside the running App by modifying the url manually (more probable: by selecting a bookmark/history entry
//    which leads to some other place within the App). Note that in this case the navigation may be totally uncontrolled within the App.
// 6. Follow-up navigation: In some cases a navigation directly triggers another navigation. For the user only one navigation step is performed although the url changes several times.
//    In principle there are two scenarios for the follow-up navigation:
//    a) The url-change is performed programmatically. The target url is 'nearly' identical with a url contained in the history.
//       This means that these two urls only differ regarding query parameters representing the state of the ui
//       In this case we try to perform the navigation as a (possibly multiple) backward navigation followed by a (replacing) forward navigation.
//       The follow-up forward navigation is already prepared before the backward navigation is triggered.
//       The decision whether such a follow-up navigation is really needed will be done, when the route-matched event is processed.
//    b) The need for follow-up navigation is detected when a route-matched event is processed. In this case the url-change may have been performed programmatically
//       or manually. This case, e.g. applies when the url points to a draft which has meanwhile been activated.
// 7. Pseudo navigation: The url is not changed, but the set of views to be displayed changes. This can happen, when the message page is displayed or when the
//    user changes the size of the browser in an FCL-based App.
//
// We also use the notion of 'logical navigation steps'.
// Cases 3, 4, and 5 are considered to be logical navigation steps.
// 2 is no logical navigation step, but will be forwarded to 7 (message page displayed).
// State changes (1), follow-up navigation (6), and pseudo navigation (7) will not create a new logical navigation step. However, they will be used to update the information
// current logical navigation step.
// ------------------------------------------------------------------------------------------------------------
sap.ui.define(["jquery.sap.global",
	"sap/ui/base/Object",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/History",
	"sap/ui/core/library",
	"sap/suite/ui/generic/template/lib/ProcessObserver",
	"sap/suite/ui/generic/template/lib/routingHelper",
	"sap/suite/ui/generic/template/lib/TemplateComponent",
	"sap/suite/ui/generic/template/lib/testableHelper",
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/base/Log"
], function(jQuery, BaseObject, ComponentContainer, HashChanger, History, coreLibrary,ProcessObserver, routingHelper,
	TemplateComponent, testableHelper, ControlPersonalizationAPI, Log) {
	"use strict";
	// shortcut for sap.ui.core.routing.HistoryDirection
	var HistoryDirection = coreLibrary.routing.HistoryDirection;
	var oHistory = History.getInstance();

	function removeQueryInRouteName(sRouteName) {
		// remove query in sRouteName
		var checkForQuery = sRouteName.substring(sRouteName.length - 5, sRouteName.length);
		if (checkForQuery === "query") {
			return sRouteName.substring(0, sRouteName.length - 5);
		}
		return sRouteName;
	}


	// Private static methods

	// The part of the url specifying in detail the target within the App is called the hash. Note that this hash sometimes comes with a leading "/", sometimes without. Both
	// representations are equivalent. This function creates a normalized representation (always containing the leading "/"). Below this representation is called "normalized hash".
	function fnNormalizeHash(sHash) {
		if (sHash.indexOf("/") === 0){
			return sHash;
		}
		return "/" + sHash;
	}

	function fnAppStates2ParString(oAppStates){
		var sDelimiter = "";
		var sRet = "";
		var aPars = Object.keys(oAppStates).sort();
		aPars.forEach(function(sPar){
			var vValue = oAppStates[sPar];
			if (jQuery.isArray(vValue)){
				var aValues = vValue.sort();
				for (var i = 0; i < aValues.length; i++){
					var sValue = aValues[i];
					sRet = sRet + sDelimiter + sPar + "=" + sValue;
					sDelimiter = "&";
				}
			} else {
				sRet = sRet + sDelimiter + sPar + "=" + vValue;
			}
		});
		return sRet;
	}

	function fnConcatPathAndPars(sPath, sPars){
		sPath = sPath || "";
		// use "?" or "/?" as delimiter, depending on whether sPath already ends with a "/"
		var sDelim = (sPath.charAt(sPath.length - 1) === "/") ? "?" : "/?";
		return sPath + (sPars ? sDelim + sPars : "");
	}

	function fnConcatPathAndAppStates(sPath, oAppStates){
		var sPars = fnAppStates2ParString(oAppStates);
		return fnConcatPathAndPars(sPath, sPars);
	}

	/*
	 * Creates a new ComponentContainer with template from routing configuration
	 * @param {Object}oAppComponentg - the application component
	 * @param {Object} oRouteConfig - the route configuration
	 * @returns {sap.ui.core.ComponentContainer} instance of the component container
	 */
	function fnCreateComponentInstance(oTemplateContract, oRouteConfig, fnComponentCreateResolve) {
		var oTreeNode = oTemplateContract.mRoutingTree[oRouteConfig.name];
		var sTemplate = oRouteConfig.template;
		var sEntitySet = oRouteConfig.entitySet;
		var iViewLevel = oTreeNode.level;
		var iObserverIndex = -1;
		if (oTemplateContract.oFlexibleColumnLayoutHandler){
			iObserverIndex = iViewLevel < 3 ? iViewLevel : 0;
		}
		var oNavigationObserver = iObserverIndex < 0 ? oTemplateContract.oNavigationObserver : oTemplateContract.aNavigationObservers[iObserverIndex];
		var oHeaderLoadingObserver = new ProcessObserver();
		var oLoadingObserverParent = iObserverIndex < 0 ? oTemplateContract.oHeaderLoadingObserver : oTemplateContract.aHeaderLoadingObservers[iObserverIndex];
		oLoadingObserverParent.addObserver(oHeaderLoadingObserver);
		var oPreprocessorsData = {};
		var oSettings = {
			appComponent: oTemplateContract.oAppComponent,
			isLeaf: !oRouteConfig.pages || !oRouteConfig.pages.length,
			entitySet: sEntitySet,
			navigationProperty: oRouteConfig.navigationProperty,
			componentData: {
				registryEntry: {
					oAppComponent: oTemplateContract.oAppComponent,
					componentCreateResolve: fnComponentCreateResolve,
					route: oRouteConfig.name,
					routeConfig: oRouteConfig,
					viewLevel: oTreeNode.level,
					routingSpec: oRouteConfig.routingSpec,
					oNavigationObserver: oNavigationObserver,
					oHeaderLoadingObserver: oHeaderLoadingObserver,
					preprocessorsData: oPreprocessorsData
				}
			}
		};

		if (oRouteConfig.component.settings) {
			// consider component specific settings from app descriptor
			jQuery.extend(oSettings, oRouteConfig.component.settings);
		}

		var oComponentContainer;
		// Note: settings are passed to Component and to ComponentContainer. This has to be revisited.
		oTemplateContract.oAppComponent.runAsOwner(function() {
			try {
				var oComponentPromise = sap.ui.core.Component.create({
					name: sTemplate,
					settings: oSettings,
					handleValidation: true,
					manifest: true
				});

				var oLoadedPromise;

				oComponentContainer = new ComponentContainer({
					propagateModel: true,
					width: "100%",
					height: "100%",
					settings: oSettings
				});

				oLoadedPromise = oComponentPromise.then(function(oComponent) {
					oComponentContainer.setComponent(oComponent);
					var oTreeNode = oTemplateContract.mRoutingTree[oRouteConfig.name];
					oTreeNode.componentId = oComponent.getId();
					return oComponentContainer;
				});


				// add the 'loaded' function to make the component container behave the same as a view
				oComponentContainer.loaded = function() {
					return oLoadedPromise;
				};
			} catch (e) {
				throw new Error("Component " + sTemplate + " could not be loaded");
			}
		});
		return oComponentContainer;
	}

	// Definition of instance methods
	function getMethods(oTemplateContract, oNavigationControllerProxy) {

		/* support templating QUnit tests */
		testableHelper.testable(fnCreateComponentInstance, "fnCreateComponentInstance");

		var mMessagePageParams = {};
		// oCurrentHash contains some information about the current navigation state. A new instance is created for each logical navigation step (when the url is caught).
		// The old instance is pushed onto aPreviousHashes (see below) at this moment.
		var oCurrentHash = { // The initial instance represents the time before the app was started.
			iHashChangeCount: 0, // the value of this property is increased with each logical navigation step. It is used to identify the logical navigation steps.
			backTarget: 0,   // the hashChangeCount of the logical navigation step that will be reached via back navigation. Value of 0 means, that back will leave the app.
			aCurrentKeys: [], // an array of length viewLevel + 1 (viewLevel being the current hierarchy level) containing the hierarchical key
			componentsDisplayed: Object.create(null) // a map which maps routes onto a number indicating their 'display state' of the corresponding template component:
									// * 1: Component is currently visible
									// * 2: Component is logically shown with this url, but not physically (this applies for the end column of an FCL which has been hidden
									//      due to use of ThreeColumnsBeginExpandedEndHidden or ThreeColumnsMidExpandedEndHidden layout)
									// * 3: Component would be shown with this url, but is hidden due to current browser size and orientation (only relevant in FCL)
									// * 4: Component is logically shown by this route, but not by this url. This applies for second or first column in FCL whic are not shown due to
									//      the current layout on this device. On desktop this only happens, when a fullscreen layout is chosen. On other devices it might also apply to other layouts.
									// * 5: Component is logically shown, but has been replaced by an error page.
									// * 6: Component is logically shown, but an error page is shown in a previous column (only relevant in FCL)
		};
		// The following properties are added to the currentHash during runtime
		// - oEvent           A copy of the route-matched event that was used to come here. The initial instance of oCurrentHash can be identified by the fact that this property is faulty.
		// - hash:            The (normalized) hash of the current url
		// - targetHash:      If the logical step is navigated away via fnNavigate: (normalized) hash that is navigated to
		// - LeaveByBack:     Information whether the logical navigation step was left via back functionality
		// - LeaveByReplace   Information whether the logical navigation step was removed from history
		// - backwardingInfo: This property is truthy in case the logical step was left via a 'complex' back navigation.
		//                    A complex back navigation can navigate more then one step back and it can be followed by a follow-up
		//                    forward navigation (in order to adjust state)
		//                    backwardingInfo contains the following properties
		//					  * count: number of back navigations that is performed at once. Note that complex back navigations always end within the navigation history of this app.
		//				      * targetHash: The (normalized) hash that finally should be reached
		// - forwardingInfo:  This property is only set temporarily. It is added (in fnHandleRouteMatched) in the following cases
		//                    * If oCurrentHash.backwardingInfo is truthy, a new logical navigation step is started. Therefore, a new instance for oCurrentHash
		//                      is created. Property targetHash is copied from backwardingInfo of the previous instance into
		//                      forwardingInfo of the new instance.
		//                      Moreover, properties bIsProgrammatic and bIsBack of forwardingInfo are set to true and properties componentsDisplayed and iHashChangeCount are set to the same value as
		//                      in the enclosing oCurrentHash.
		//                    * The current url points to a context that is not valid anymore. Method ContextBookkeeping.getAlternativeContextPromise has delivered
		//                      (a Promise to) an alternative context which should be navigated to. In this case only properties bIsProgrammatic, bIsBack, and
		//                      iHashChangeCount are set. bIsProgrammatic contains information whether the logical navigation was triggered programmatically.
		//                      bIsBack contains the information whether the logical navigation step was reached by backward navigation.
		//                      componentsDisplayed is set to the same value as in the enclosing oCurrentHash.
		//                    The property is removed again when the final physical navigation step of a logical navigation step has been performed.

		var aPreviousHashes = []; // array of previous instances of oCurrentHash. Length is always be identical to oCurrentHash.iHashChangeCount. iHashChangeCount of each entry is equal to its position.

		var oActivationPromise = Promise.resolve(); // Enables to wait for the end of the current activation of all components

		// Variables needed to build the navigation menu
		var aBreadCrumbTexts = [];
		var aNavigationMenue = [];

		/* get all pages that may be created for functional testing */
		function fnGetAllPages() {
			var oRouter = oNavigationControllerProxy.oRouter,
				oTargets = oRouter.getTargets()._mTargets,
				aAllPages = [];

			Object.keys(oTargets).forEach(function(sTargetKey) {
				var oTarget = oTargets[sTargetKey],
					oOptions = oTarget._oOptions,
					oRoute = oRouter.getRoute(oOptions.viewName),
					oConfig = oRoute && oRoute._oConfig;
				if (oConfig && (!oConfig.navigation || !oConfig.navigation.display)) {
					aAllPages.push({
						oConfig: oConfig
					});
				}
			});
			return aAllPages;
		}

		/* get configurations of all pages defined in the manifest in QUnit tests */
		testableHelper.testable(fnGetAllPages, "fnGetAllPages");

		/* create page(s) of an application for testing result of templating or view creation */
		function fnCreatePages(vPages /* optional array or single object of page configurations as created in fnGetAllPages */) {
			var aPages = vPages || fnGetAllPages();
			if (!Array.isArray(aPages)) {
				aPages = [aPages];
			}
			aPages.forEach(function(oPage) {
				oPage.oComponentContainer = fnCreateComponentInstance(oTemplateContract, oPage.oConfig, function(){} );
			});

			return aPages;
		}

		/* support templating all pages in QUnit tests */
		testableHelper.testable(fnCreatePages, "fnCreatePages");

		function getRootComponentPromise(){
			// Make sure that the loading of the root component starts
			var oViews = oNavigationControllerProxy.oRouter.getViews();
			oViews.getView({
				viewName: "root"
			});
			return oTemplateContract.mRouteToTemplateComponentPromise.root;
		}

		function getAppTitle(){
			return oNavigationControllerProxy.oAppComponent.getManifestEntry("sap.app").title;
		}

		// This method returns a Promise.
		// When this Promise is resolved, some parameter information has been added to mAppStates
		// More precisely, the key(s) having been added are parameter names that are used to store state information of the component within the url
		// The corresponding value for such a parameter is an array that contains all possible values for this parameter
		// sPath may be faulty, which means, that the binding path for the corresponding component has not changed.
		// Otherwise sPath denotes the expanded binding path that will be used for the component.
		// Edge case: sComponentId is faulty, then a resolved Promise is returned
		function getApplicableStateForComponentAddedPromise(sComponentId, sPath, mAppStates){
			var oComponentRegistryEntry = sComponentId && oTemplateContract.componentRegistry[sComponentId];
			var getUrlParameterInfo = oComponentRegistryEntry && oComponentRegistryEntry.methods.getUrlParameterInfo;
			return getUrlParameterInfo ? oComponentRegistryEntry.viewRegistered.then(function(){
				var sPathNormalized = sPath && fnNormalizeHash(sPath); // if sPath is faulty the same holds for sPathNormalized. Otherwise sPathNormalized will be the normalized version of sPath.
				return getUrlParameterInfo(sPathNormalized, oCurrentHash.componentsDisplayed[oComponentRegistryEntry.route] === 1).then(function(mNewPars){
					jQuery.extend(mAppStates, mNewPars);
				});
			}) : Promise.resolve();
		}

		// Begin: Helper methods for creating the navigation menu

		function fnAddUrlParameterInfoForRoute(sRoute, mAppStates, sPath) {
			var oTreeNode = oTemplateContract.mRoutingTree[sRoute];
			return getApplicableStateForComponentAddedPromise(oTreeNode.componentId, sPath, mAppStates);
		}

		function setHierarchy(aHierarchy){
			for (var i = 0; i < aHierarchy.length; i++){
				if (aHierarchy[i].title !== aBreadCrumbTexts[aHierarchy.length - i - 1] || ""){ // only case tilte != subtitle should be considerd
					aHierarchy[i].subtitle = aBreadCrumbTexts[aHierarchy.length - i - 1] || "";
				}
			}
			aNavigationMenue = aHierarchy;
			oTemplateContract.oShellServicePromise.then(function(oShellService){
				oShellService.setHierarchy(aHierarchy);
			});
		}

		function fnSubTitleForViewLevelChanged(iViewLevel, sBreadCrumbText){
			aBreadCrumbTexts[iViewLevel] = sBreadCrumbText;

			var oNavigationMenueEntry = aNavigationMenue[aNavigationMenue.length - iViewLevel - 1];
			if (oNavigationMenueEntry){
				if (oNavigationMenueEntry.title !== sBreadCrumbText){ // only case tilte != subtitle should be considerd
					oNavigationMenueEntry.subtitle = sBreadCrumbText;
				}
				oTemplateContract.oShellServicePromise.then(function(oShellService) {
					oShellService.setHierarchy(aNavigationMenue);
				});
			}
		}

		var oCurrentTitleProvider;

		function fnHandleNavigationMenu(){
			if (!(oCurrentTitleProvider instanceof TemplateComponent)){ // error page -> currently no navigation menu
				setHierarchy([]); // error page -> currently no
				return;
			}

			var sEntitySet = oCurrentTitleProvider.getEntitySet();
			var oTreeNode = oNavigationControllerProxy.oTemplateContract.mEntityTree[sEntitySet];
			if (!oTreeNode || oTreeNode.componentId !== oCurrentTitleProvider.getId()){ // root page -> empty navigation menu
				setHierarchy([]);
				return;
			}
			var bIncludeMe = oTemplateContract.oFlexibleColumnLayoutHandler && oTreeNode.level < 3 && !oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/FCL/isVisuallyFullScreen");
			var oUpperLinkInfo = oTemplateContract.oApplicationProxy.getLinkToUpperLayersInfo(true, bIncludeMe, sEntitySet);
			Promise.all(oUpperLinkInfo.aInfoObjectPromises).then(function(aInfoObjects){
				var aHierarchy = [];
				var sLocationHash = location.hash;
				var indexOfQM = sLocationHash.indexOf("?");
				var sDelimiter = (indexOfQM !== -1 && indexOfQM < sLocationHash.indexOf("&")) ? "?" : "&";
				var sCurrentIntent = sLocationHash.split(sDelimiter)[0] + "&/";
				for (var i = aInfoObjects.length - 1; i >= 0; i--){
					var oInfoObject = aInfoObjects[i];
					var oHierarchyEntry = {
						intent: sCurrentIntent + oInfoObject.fullLink
					};
					aHierarchy.push(oHierarchyEntry);
					if (i === 0){
						oHierarchyEntry.title = getAppTitle();
					} else {
						var oTreeNode = oNavigationControllerProxy.oTemplateContract.mEntityTree[oInfoObject.entitySet];
						oHierarchyEntry.title = oTreeNode.headerTitle;
						oHierarchyEntry.icon = oTreeNode.titleIconUrl;
					}
				}
				setHierarchy(aHierarchy);
			});
		}

		// End: Helper methods for creating the navigation menu

		function fnSetTitleForComponent(isAppTitlePrefered, oTitleProvider){
			var sTitle;
			if (!isAppTitlePrefered && oTitleProvider instanceof TemplateComponent){
				var oRegistryEntry = oTitleProvider && oTemplateContract.componentRegistry[oTitleProvider.getId()];
				var fnGetTitle = oRegistryEntry && oRegistryEntry.methods.getTitle;
				sTitle = fnGetTitle && fnGetTitle();
			} else if (!isAppTitlePrefered && oTitleProvider && oTitleProvider.title){
				sTitle = oTitleProvider.title;
			}
			sTitle = sTitle || getAppTitle();
			oCurrentTitleProvider = oTitleProvider;

			oTemplateContract.oShellServicePromise.then(function (oShellService) {
				oShellService.setTitle(sTitle);
				fnHandleNavigationMenu();
			});
		}

		// This method is called when all views have been set to their places
		function fnAfterActivationImpl(oTitleProvider){
			var aPageDataLoadedPromises = [oTemplateContract.oPagesDataLoadedObserver.getProcessFinished(true)];
			var oActiveComponent = null;
			var iCurrentHashCount = oCurrentHash.iHashChangeCount;
			var maxActiveViewLevel = -1;
			for (var sComponentId in oTemplateContract.componentRegistry){
				var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
				var oMessageButtonHelper = oRegistryEntry.oControllerUtils && oRegistryEntry.oControllerUtils.oServices.oTemplateCapabilities.oMessageButtonHelper;
				var bIsActive = oCurrentHash.componentsDisplayed[oRegistryEntry.route] === 1;
				var oTemplatePrivateModel = oRegistryEntry.utils.getTemplatePrivateModel();
				oTemplatePrivateModel.setProperty("/generic/isActive", bIsActive);
				if (bIsActive){
					aPageDataLoadedPromises.push(oRegistryEntry.oViewRenderedPromise);
					if (oRegistryEntry.viewLevel > maxActiveViewLevel){
						maxActiveViewLevel = oRegistryEntry.viewLevel;
						oActiveComponent = oRegistryEntry.oComponent;
					}
				} else {
					oRegistryEntry.utils.suspendBinding();
				}
				if (oMessageButtonHelper){
					oMessageButtonHelper.setEnabled(bIsActive);
				}
			}

			var isAppTitlePrefered = oTemplateContract.oFlexibleColumnLayoutHandler && oTemplateContract.oFlexibleColumnLayoutHandler.isAppTitlePrefered();
			fnSetTitleForComponent(isAppTitlePrefered, oTitleProvider || oActiveComponent);

			Promise.all(aPageDataLoadedPromises).then(function(){
				if (iCurrentHashCount === oCurrentHash.iHashChangeCount && jQuery.isEmptyObject(mMessagePageParams)){
					oTemplateContract.oAppComponent.firePageDataLoaded();
				}
			});
		}

		// Default call
		var fnAfterActivation = fnAfterActivationImpl.bind(null, null); // do not pass a TitleProvider/forward to fnAfterActivationImpl

		function getAncestorTreeNodePath(oTreeNode, iUpToLevel){
			var aRet = [];
			for (var oNode = oTreeNode; oNode.level >= iUpToLevel; oNode = oTemplateContract.mRoutingTree[oNode.parentRoute]){
				aRet.push(oNode);
			}
			return aRet.reverse();
		}
		
		function fnDeterminePathForKeys(oTreeNode, aKeys, bForRoute){
			if (oTreeNode.level === 0) { 
				return null;
			}
			var sPath = bForRoute ? oTreeNode.pattern : oTreeNode.contextPath;
			if (!sPath){
				return null;
			}
			if (sPath.indexOf("/") !== 0) {
				sPath = "/" + sPath;
			}
			for (var i = 1; i < aKeys.length; i++){
				sPath = sPath.replace("{keys" + i + "}", aKeys[i]);
			}
			return sPath;			
		}

		// Start: navigation methods
		var oRoutingOptions;
		var oCurrentIdentity;
		
		// Allow setting the current idfentity by unit tests
		testableHelper.testable(function(oIdentity){
			oCurrentIdentity = oIdentity;
			aPreviousHashes.push(oCurrentHash);
			oCurrentHash = {
				backTarget: 0
			};
		}, "setCurrentIdentity");
		
		function getCurrentIdentity(){
			return oCurrentIdentity;
		}
		
		function areParameterValuesEqual(vValue1, vValue2){
			if (jQuery.isArray(vValue1) && vValue1.length < 2){
				vValue1 = vValue1[0];
			}
			if (jQuery.isArray(vValue2) && vValue2.length < 2){
				vValue2 = vValue2[0];
			}
			if (jQuery.isArray(vValue1)){
				if (jQuery.isArray(vValue2)){
					if (vValue1.length === vValue2.length){
						vValue1 = vValue1.sort();
						vValue2 = vValue2.sort();
						return vValue1.every(function(sValue, i){
							return sValue === vValue2[i];
						});
					}
					return false;
				}
				return false;
			}
			return vValue2 === vValue1;
		}
		
		function isIdentityReached(oIdentity){
			if (!oCurrentIdentity || oCurrentIdentity.treeNode !== oIdentity.treeNode){
				return false;
			}
			for (var oAncestralNode = oIdentity.treeNode; oAncestralNode.level > 0; oAncestralNode = oTemplateContract.mRoutingTree[oAncestralNode.parentRoute]){
				if (!oAncestralNode.noKey && oIdentity.keys[oAncestralNode.level] !== oCurrentIdentity.keys[oAncestralNode.level]){
					return false;
				}
			}
			if (jQuery.isEmptyObject(oIdentity.appStates) !== jQuery.isEmptyObject(oCurrentIdentity.appStates)){
				return false;
			}
			if (jQuery.isEmptyObject(oIdentity.appStates)){
				return true;
			}
			var oUnion = jQuery.extend(Object.create(null), oIdentity.appStates, oCurrentIdentity.appStates);
			for (var sPar in oUnion){
				if (!areParameterValuesEqual(oIdentity.appStates[sPar], oCurrentIdentity.appStates[sPar])){
					return false;
				}
			}
			return true;
		}
		
		// Helper method for fnNavigateToRoute
		// The target route information is assumed to be contained in oRoutingOptions
		function fnNavigateToRouteImpl(bReplace){
			var oParameters = Object.create(null);
			for (var oAncestralNode = oRoutingOptions.identity.treeNode; oAncestralNode.level > 0; oAncestralNode = oTemplateContract.mRoutingTree[oAncestralNode.parentRoute]){
				if (!oAncestralNode.noKey){
					oParameters["keys" + oAncestralNode.level] = oRoutingOptions.identity.keys[oAncestralNode.level];
				}
			}
			var bIsQuery = !jQuery.isEmptyObject(oRoutingOptions.identity.appStates);
			var sEffectiveRoute = oRoutingOptions.identity.treeNode.sRouteName + (bIsQuery ? "query" : "");
			if (bIsQuery){
				oParameters["query"] = oRoutingOptions.identity.appStates;
			}
			oNavigationControllerProxy.oRouter.navTo(sEffectiveRoute, oParameters, bReplace);
		}
		
		//  new navigation. Should replace old navigation logic.
		//  oOptions is optional. If it is not provided we assume that oRoutingOptions is already set and should contain the correct value.
		//  However, in this case mode is taken as 1.
		//  This is the follow-up navigation scenario.
		//  properties of oOptions:
		// - identity
		//   ~ treeNode : the treeNode that is navigated to
		//   ~ keys     : array of keys for the route
		//   ~ appStates: map of app states
		// - mode: integer. Possible values:
		//         negative value: Do as many steps back. Then (if necessary) do a replace to reach the final identity.
		//         0: forward navigation
		//         1: replace navigation
		function fnNavigateToRoute(oOptions){
			var iMode;
			if (oOptions){
				if (oRoutingOptions || (oCurrentIdentity && oCurrentIdentity.preset)){ // still another navigation going on -> route matched will be called anyway
					oRoutingOptions = { // reassign the running navigation to the new identity
						identity: oOptions.identity,
						followUpNeeded: true
					};
					return;
				}
				if (oOptions.identity && isIdentityReached(oOptions.identity)){ // target identity already reached -> no navigation needed
					return;
				}
				iMode = oOptions.mode;
				oRoutingOptions = oOptions;
			} else {
				iMode = 1;
			}
			oRoutingOptions.followUpNeeded = iMode < 0;
			// todo: check if the navigation will do something
			oTemplateContract.oBusyHelper.setBusyReason("HashChange", true);
			if (iMode < 0){
				window.history.go(iMode);
			} else {
				fnNavigateToRouteImpl(iMode === 1);
			}
		}
		
		function fnFillCurrentIdentity(oEvent){
			var oPreviousIdentity = oCurrentIdentity;
			if (oRoutingOptions && oRoutingOptions.identity && !oRoutingOptions.followUpNeeded){
				oCurrentIdentity = oRoutingOptions.identity;
				oCurrentIdentity.previousIdentity = oPreviousIdentity;
				return;
			}
			oCurrentIdentity = Object.create(null);
			oCurrentIdentity.previousIdentity = oPreviousIdentity;
			var oRouteConfig = oEvent.getParameter("config");
			var sRoute = removeQueryInRouteName(oRouteConfig.name);
			oCurrentIdentity.treeNode = oTemplateContract.mRoutingTree[sRoute];
			var oArguments = oEvent.getParameter("arguments");
			oCurrentIdentity.appStates = oArguments["?query"] || Object.create(null);
			oCurrentIdentity.keys = [""];
			for (var oCurrentNode = oCurrentIdentity.treeNode; oCurrentNode.level > 0; oCurrentNode = oTemplateContract.mRoutingTree[oCurrentNode.parentRoute]){
				oCurrentIdentity.keys[oCurrentNode.level] = oCurrentNode.noKey ? "" : oArguments["keys" + oCurrentNode.level];
			}
		}
		
		function fnNavigateByExchangingQueryParam(sQueryParam, vValue){
			var oOptions = {
				identity: {
					treeNode: oCurrentIdentity.treeNode,
					keys: oCurrentIdentity.keys,
					appStates: jQuery.extend(Object.create(null), oCurrentIdentity.appStates)
				},
				mode: 1
			};
			if (jQuery.isArray(vValue) && vValue.length < 2){
				vValue = vValue[0];
			}
			if (vValue){
				oOptions.identity.appStates[sQueryParam] = vValue;
			} else {
				delete oOptions.identity.appStates[sQueryParam];
			}
			fnNavigateToRoute(oOptions);
		}
		
		// This method is called, when we switch from active to inactive or the other way around
		// oSiblingContext is the target context. It is assumed that we are currently displaying its sibling (and in FCL possibly descendants of that).
		// The method returns a Promise that resolves to the options that should be used for navigating to the sibling
		function getSwitchToSiblingPromise(oSiblingContext){
			var oTarget = routingHelper.determineNavigationPath(oSiblingContext);
			var oOptions = {
				identity: {
					keys: ["", oTarget.key],
					appStates: Object.create(null)
				},
				mode: 1
			};
			var fnRet = fnNavigateToRoute.bind(null, oOptions);
			if (oCurrentIdentity.treeNode.level === 1){ // no child pages open -> navigation is easy
				oOptions.identity.treeNode = oCurrentIdentity.treeNode;
				jQuery.extend(oOptions.identity.appStates, oCurrentIdentity.appStates);
				return Promise.resolve(fnRet);
			}

			var aTreeNodes = getAncestorTreeNodePath(oCurrentIdentity.treeNode, 2);
			var aSiblingPromises = aTreeNodes.map(function(oTreeNode){
				var sContextPath = fnDeterminePathForKeys(oTreeNode, oCurrentIdentity.keys);
				var oSiblingPromise = oTemplateContract.oApplicationProxy.getSiblingPromise(sContextPath);
				return oSiblingPromise.then(function(oSiblingContext){ return oSiblingContext; }, jQuery.noop);
			});
			var oAllSiblingPromises = Promise.all(aSiblingPromises);
			return oAllSiblingPromises.then(function(aSiblingContexts){
				var oTargetNode = oTemplateContract.mEntityTree[oTarget.entitySet];
				for (var j = 0; aSiblingContexts[j]; j++){
					oTargetNode = aTreeNodes[j];
					oTarget = routingHelper.determineNavigationPath(aSiblingContexts[j], oTargetNode.navigationProperty);
					oOptions.identity.keys.push(oTarget.key);
				}
				oOptions.identity.treeNode = oTargetNode;
				if (oTargetNode === oCurrentIdentity.treeNode){ // no columns need to be closed -> navigate by leaving appStates as is
					jQuery.extend(oOptions.identity.appStates, oCurrentIdentity.appStates);
					return fnRet;					
				}
				var oAppStatePromise = oTemplateContract.oFlexibleColumnLayoutHandler.getAppStatesPromiseForColumnClose(oTargetNode, oOptions.identity.appStates);                   
				return oAppStatePromise.then(function(){
					return fnRet;
				});
			});
		}
		
		function getIdentitiesEquivalentPromise(oHistoricIdentity, oNewIdentity){
			if ((oHistoricIdentity && oHistoricIdentity.treeNode) !== oNewIdentity.treeNode){
				return Promise.resolve(false);
			}
			if (oTemplateContract.oFlexibleColumnLayoutHandler && !oTemplateContract.oFlexibleColumnLayoutHandler.areIdentitiesLayoutEquivalent(oHistoricIdentity, oNewIdentity)){
				return Promise.resolve(false);
			}
			var bKeysEqual = true;
			var sCompareRoute = oHistoricIdentity.treeNode.sRouteName;
			for (var oCurrentNode = oHistoricIdentity.treeNode; oCurrentNode.level > 0; oCurrentNode = oTemplateContract.mRoutingTree[oCurrentNode.parentRoute]){
				var bKeyEqual = oCurrentNode.noKey || oHistoricIdentity.keys[oCurrentNode.level] === oNewIdentity.keys[oCurrentNode.level];
				if (!bKeyEqual && oCurrentNode.noOData){
					return Promise.resolve(false);
				}
				bKeysEqual = bKeysEqual && bKeyEqual;
				if (oCurrentNode.noOData){
					sCompareRoute = oCurrentNode.parentRoute;
				}
			}
			if (bKeysEqual){
				return Promise.resolve(true);
			}
			// If keys are not equal they may still define the same object in draft scenarios
			var oCompareNode = oTemplateContract.mRoutingTree[sCompareRoute];
			var aHistoricCompareKeys = oHistoricIdentity.keys.slice(0, oCompareNode.level + 1);
			var aNewCompareKeys = oNewIdentity.keys.slice(0, oCompareNode.level + 1);
			var sHistoricContextPath = fnDeterminePathForKeys(oCompareNode, aHistoricCompareKeys);
			var sNewContextPath = fnDeterminePathForKeys(oCompareNode, aNewCompareKeys);
			return oTemplateContract.oApplicationProxy.areTwoKnownPathesIdentical(sHistoricContextPath, sNewContextPath, oCompareNode.level === 1);
		}
		
		function fnNavigateToIdentity(oNewIdentity, bReplace){
			var oCandidateHash = aPreviousHashes[oCurrentHash.backTarget];
			var iCandidateCount = -1;
			if (oNewIdentity.treeNode.level === 0 || (oTemplateContract.oFlexibleColumnLayoutHandler && oNewIdentity.treeNode.fCLLevel === 0)){
				for (; oCandidateHash.backTarget > 0 && oCandidateHash.identity.treeNode.level > oNewIdentity.treeNode.level; iCandidateCount--){
					oCandidateHash = aPreviousHashes[oCandidateHash.backTarget];
				}
			}
			var oIdentitiesEquivalentPromise = getIdentitiesEquivalentPromise(oCandidateHash.identity, oNewIdentity);
			var oRet = oIdentitiesEquivalentPromise.then(function(bEquivalent){
				var iMode = bEquivalent ? iCandidateCount : (0 + !!bReplace);
				var oOptions = {
					identity: oNewIdentity,
					mode: iMode
				};
				fnNavigateToRoute(oOptions);
			});
			oTemplateContract.oBusyHelper.setBusy(oRet);
		}
		
		// This delivers an identity for navigating to the given context via the given navigation property. The result will only contain properties treeNode and keys (but not appState)
		function getTargetIdentityForContext(oContext, sNavigationProperty){
			var oRet = {
				keys: [""]
			};
			if (oContext){
				var oTarget = routingHelper.determineNavigationPath(oContext, sNavigationProperty);
				oRet.treeNode = oTemplateContract.mEntityTree[oTarget.entitySet];
				for (var i = 1; i < oRet.treeNode.level; i++){
					oRet.keys.push(oCurrentIdentity.keys[i]);
				}
				oRet.keys.push(oTarget.key);
			} else {
				oRet.treeNode = oTemplateContract.mRoutingTree["root"];
			}
			return oRet;
		}
		
		// Perform the navigation after activation. oActiveContext might be faulty. In this case the navigation should take us to the root page.
		// Otherwise we should be taken to the active object page. All sub-object pages should be closed (sine it is currently not possible to keep them open reliably).
		function fnNavigateAfterActivation(oActiveContext){
			var oTargetIdentity = getTargetIdentityForContext(oActiveContext);
			oTargetIdentity.appStates = Object.create(null);
			var oOptions;
			if (oTargetIdentity.treeNode === oCurrentIdentity.treeNode){ // just reuse old appStates
				jQuery.extend(oTargetIdentity.appStates, oCurrentIdentity.appStates);
				oOptions = {
					identity: oTargetIdentity,
					mode: 1
				};
				fnNavigateToRoute(oOptions);
				return;
			}
			// If we reach this point we know that the target node is different from the current node. There ar two possible scenarios for this:
			// 1. Close main object page according to manifest setting
			// 2. Close sub object page columns in FCL
			var oAppStatePromise = oTargetIdentity.treeNode.fCLLevel === 0 ? getApplicableStateForComponentAddedPromise(oTargetIdentity.treeNode.componentId, null, oTargetIdentity.appStates) : oTemplateContract.oFlexibleColumnLayoutHandler.getAppStatesPromiseForColumnClose(oTargetIdentity.treeNode, oTargetIdentity.appStates);
			oTemplateContract.oBusyHelper.setBusy(oAppStatePromise.then(fnNavigateToIdentity.bind(null, oTargetIdentity, true)));
		}
		
		function fnNavigateBack(iSteps){
			Log.info("Navigate back");
			if (oCurrentHash.backTarget && fnNormalizeHash(oHistory.getPreviousHash() || "") !== fnNormalizeHash(oCurrentHash.hash)){
				oTemplateContract.oBusyHelper.setBusyReason("HashChange", true);
			}
			// If oCurrentHash contains a forwardingInfo this back navigation is part of a complex back navigation.
			// In this case oCurrentHash already represents the target hash (which was created when the complex navigation started).
			// Otherwise oCurrentHash still represents the source hash. In this case we notify that the hash was left via back navigation.
			oCurrentHash.LeaveByBack = !oCurrentHash.forwardingInfo;
			if (oCurrentHash.LeaveByBack){
				oCurrentHash.backSteps = iSteps;
			}
			window.history.go(-iSteps);
		}

		/*
		 * Sets/Replaces the hash via the router/hash changer
		 * @param {string} sHash - the hash string
		 * @param {boolean} bReplace - whether the hash should be replaced
		 * @param {boolean} bKeepVariantId - keep variant id in URL (save/edit/cancel case)
		 */
		function fnNavigate(sHash, bReplace, iTargetLevel, bKeepVariantId) {
			var oConfig = oTemplateContract.oAppComponent.getConfig();
			var bObjectPageDynamicHeaderTitleWithVM = oConfig && oConfig.settings && oConfig.settings.objectPageDynamicHeaderTitleWithVM;
			if (!bObjectPageDynamicHeaderTitleWithVM) {
				if (oConfig && oConfig.settings && oConfig.settings.objectPageHeaderType === "Dynamic") {
					bObjectPageDynamicHeaderTitleWithVM = (oConfig && oConfig.settings && oConfig.settings.objectPageVariantManagement === "VendorLayer") ? true : false;
				}
			}
			var bVendorLayer;
			var oUriParameters = jQuery.sap.getUriParameters();
			if (oUriParameters.mParams["sap-ui-layer"]) {
				var aUiLayer = oUriParameters.mParams["sap-ui-layer"];
				for (var i = 0; i < aUiLayer.length; i++) {
					if (aUiLayer[i].toUpperCase() === "VENDOR") {
						bVendorLayer = true;
						break;
					}
				}
			}
			sHash = fnNormalizeHash(sHash || "");
			Log.info("Navigate to hash: " + sHash);
			if (sHash === oCurrentHash.hash){
				Log.info("Navigation suppressed since hash is the current hash");
				return; // ignore navigation that does nothing
			}
			oCurrentHash.targetHash = sHash;
			if (oCurrentHash.backTarget && fnNormalizeHash(oHistory.getPreviousHash() || "") === sHash){
				fnNavigateBack(1);
				return;
			}
			if (oCurrentHash.oEvent) {
				var iCurrentLevel = oCurrentHash.oEvent.getParameter("config").viewLevel;
			}
			if (bObjectPageDynamicHeaderTitleWithVM && bVendorLayer) {
				if (!bKeepVariantId) {
					if (!oTemplateContract.oFlexibleColumnLayoutHandler) {
						ControlPersonalizationAPI.clearVariantParameterInURL();
					} else {
						if (iCurrentLevel >= iTargetLevel) {
							if (iTargetLevel === 1) {
								ControlPersonalizationAPI.clearVariantParameterInURL();
							} else if (iTargetLevel === 2) {
								var oRegistryEntry;
								for ( var sComponentId in oTemplateContract.componentRegistry) {
									if (oTemplateContract.componentRegistry[sComponentId].viewLevel === 2) {
										oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
										break;
									}
								}
								var oSubObjectPageVariantManagementControl = oRegistryEntry.oController.byId("template::ObjectPage::ObjectPageVariant");
								ControlPersonalizationAPI.clearVariantParameterInURL(oSubObjectPageVariantManagementControl);
							}
						}
					}
				}
			}
			oTemplateContract.oBusyHelper.setBusyReason("HashChange", true);
			oCurrentHash.LeaveByReplace = bReplace;
			if (bReplace) {
				oNavigationControllerProxy.oHashChanger.replaceHash(sHash);
			} else {
				oNavigationControllerProxy.oHashChanger.setHash(sHash);
			}
		}

		function fnNavigateToParStringPromise(sPath, oParStringPromise, iTargetLevel, bReplace, oBackwardingInfo, bKeepVariantId){
			var oRet = oParStringPromise.then(function(sPars){
				sPath = fnConcatPathAndPars(sPath, sPars);
				if (oBackwardingInfo){
					oCurrentHash.backwardingInfo = {
						count: oBackwardingInfo.count,
						index: oBackwardingInfo.index,
						targetHash: fnNormalizeHash(sPath)
					};
					fnNavigateBack(oBackwardingInfo.count);
				} else {
					fnNavigate(sPath, bReplace, iTargetLevel, bKeepVariantId);
				}
				return sPath;
			});
			oTemplateContract.oBusyHelper.setBusy(oRet);
			return oRet;
		}

		// Returns information about the number of steps back that needs to be performed to back to viewLevel = 0 (the root)
		// In case there is no ViewLevel 0 object, method will behave based on the bIncludeAncestorComponent argument. If this
		// param is passed as true method will return backward navigation with number of back steps needed for navigating to a
		// complete different object in history or backward navigation will contain the number of steps one have to perform to
		// go out of this app which ideally should be the ancestor component/page.
		// @Param {boolean} bIncludeAncestorComponent - If true indicates that caller is interested in
		// 		finding the RootComponent or the ancestor component/page before launching the Root Object Page
		// @Param {string} sHashToSkip - Hash of the object whose ancestor component (which was not the object with this hash or its
		// sub objects of the same)	needs to be found
		// @Return {JSON} - Return object with backward information.
		// 		count - Number of back steps needed
		// 		index - Index in aPreviousHashes pointing to the corresponding target step
		// 		routeName - In case the object is found in the aPreviousHases. In case component is started by cross app, value will be undefined
		// 	Return value will be null if there is no View Level 0 Component in the aPreviousHash array, if called with
		// argument bIncludeAncestorComponent false
		function getBackToRootInfo(bIncludeAncestorComponent, sHashToSkip){
			var iCount, index, oBackwardingInfo, oHash, oConfig, iViewLevel;
			iCount = 0;
			index = oCurrentHash.iHashChangeCount;
			oBackwardingInfo = null;
			for (oHash = oCurrentHash; oHash.oEvent; iCount++){
				oConfig = oHash.oEvent.getParameter("config");
				iViewLevel = oConfig ? oConfig.viewLevel : -1;
				// In case the Navigation to detail page has come from LR/ALP method will find one of the back target
				// is View Level zero object and returns the BackNavigationInfo. one instance of View Level 1 detail page (SalesOrder 512)
				// could have been also launched by another instance of View Level 1 detail page (Sales Order 634). In such a case
				// the oHash.hash will not start with sHashToSkip and whenever such a case is found (means when SO 634 is found in history)
				// and the method is called with bIncludeAncestorComponent true, returns the current information as BackNavigationInfo
				if (iViewLevel === 0 || (bIncludeAncestorComponent && fnNormalizeHash(oHash.hash).indexOf(sHashToSkip) !== 0)) {
					oBackwardingInfo = {
						count: iCount,
						index: index,
						routeName: oConfig ? oConfig.name : undefined
					};
					break;
				}

				if (oHash.backTarget === 0){
					// The aPreviousHash array has been parsed and view component at level 0 or an ancestor is not found.
					// Check whether method is called with bIncludeAncestorComponent true, then return the backward count
					// as one more than the current which should load the previous url used by the browser.
					if (bIncludeAncestorComponent) {
						oBackwardingInfo = {
							count: iCount + 1,
							index: index,
							routeName: undefined
						};
					}
					break;
				}

				index = oHash.backTarget;
				oHash = aPreviousHashes[index];
			}

			return oBackwardingInfo;
		}

		// Returns information whether the specified navigation should be performed by one or more back navigations.
		// If this is not the case a faulty object is returned.
		// Otherwise an object is returned which contains two attributes:
		// count: number of back steps needed
		// index: index in aPreviousHashes pointing to the corresponding target step
		function fnGetBackwardingInfoForTarget(bReplace, sPath, iTargetLevel){
			if (iTargetLevel === 0){
				return getBackToRootInfo();
			}
			var oPreviousHash = aPreviousHashes[oCurrentHash.backTarget];
			return oPreviousHash && oPreviousHash.hash && fnNormalizeHash(oPreviousHash.hash.split("?")[0]) === fnNormalizeHash(sPath) && {
				count: 1,
				index: oCurrentHash.backTarget
			};
		}

		// Navigates to the root page. Thereby it restores the iappstate the root page was left (if we have already been there)
		function fnNavigateToRoot(bReplace) {
			if (oCurrentIdentity.treeNode.level === 0){
				return;
			}
			var oTargetIdentity = {
				treeNode: oTemplateContract.mRoutingTree["root"],
				keys: [""],
				appStates: Object.create(null)
			};
			var oAppStatePromise = oTemplateContract.oFlexibleColumnLayoutHandler ? oTemplateContract.oFlexibleColumnLayoutHandler.getAppStatesPromiseForColumnClose(oTargetIdentity.treeNode, oTargetIdentity.appStates) : fnAddUrlParameterInfoForRoute("root", oTargetIdentity.appStates);                
			oAppStatePromise.then(fnNavigateToIdentity.bind(null, oTargetIdentity, bReplace));
			oTemplateContract.oBusyHelper.setBusy(oAppStatePromise);
		}

		/*
		 * Method should be called when the root object is been deleted. Internally decides the navigation path
		 */
		function fnNavigateBackToAncestorComponent() {
			var oBackwardingInfo, sHash;
			if (oTemplateContract.oFlexibleColumnLayoutHandler) {
				// FCL use case: Where the sub object is opened and the main object is being deleted
				// oCurrentHash will point to the sub Object Hash. Pick up the Main Object hash from previous hash Array
				var oEvent = oCurrentHash.oEvent;
				var oRouteConfig = oEvent.getParameter("config");
				var sRoute = oRouteConfig.name;
				var oTreeNode = oTemplateContract.mRoutingTree[removeQueryInRouteName(sRoute)];
				while (oTreeNode.level > 1) {
					oTreeNode = oTemplateContract.mRoutingTree[removeQueryInRouteName(oTreeNode.parentRoute)];
				}
				sHash = routingHelper.determinePath(oTreeNode, oEvent);
			} else {
				sHash = oCurrentHash.hash;
			}
			sHash = sHash.split("?")[0];
			oBackwardingInfo = getBackToRootInfo(true, sHash);
			if (oBackwardingInfo.routeName === "root" && oTemplateContract.oFlexibleColumnLayoutHandler) {
				// In case the back navigation is done in a FCL enabled App & the ancestor component is Root (LR)
				// back navigation may not be enough as the iAppState may change if the Filter is changed when the
				// detail page is opened. Hash is replaced in this scenario and will not be part of the navigation history
				fnNavigateToRoot(true);
			} else {
				// Just do a back navigation and this should take the app back to the ancestor component
				fnNavigateBack(oBackwardingInfo.count);
			}
		}

		function getTargetComponentPromises(oTarget){
			var sRouteName = oTemplateContract.mEntityTree[oTarget.entitySet].sRouteName;
			var oComponentPromise = oTemplateContract.mRouteToTemplateComponentPromise[sRouteName];
			return [oComponentPromise];
		}

		// This method is called before a navigation to a context is executed.
		// aTargetComponentPromises is an array of Promises. Each of these Promises will be resolved to a component which will be displayed in the target of the navigation.
		// If this component provides method presetDisplayMode this method will be called in order to preset the given displayMode for this component as early as possible.
		function fnPresetDisplayMode(aTargetComponentPromises, iDisplayMode){
			var mComponentsDisplayed = oCurrentHash.componentsDisplayed; // store the reference. fnPreset will be called asynchronously. At that point in time oCurrentHash might already represent the new logical navigation step
			var fnPreset = function(oComponent){
				var oRegistryEntry = oTemplateContract.componentRegistry[oComponent.getId()];
				(oRegistryEntry.methods.presetDisplayMode || jQuery.noop)(iDisplayMode, mComponentsDisplayed[oRegistryEntry.route] === 1);
			};
			for (var i = 0; i < aTargetComponentPromises.length; i++){
				var oTargetPromise = aTargetComponentPromises[i];
				oTargetPromise.then(fnPreset);
			}
		}

		function getTargetLevel(oTarget) {
			var oTargetTreeNode = oTarget && oTemplateContract.mEntityTree[oTarget.entitySet];
			var iTargetLevel = oTargetTreeNode ? oTargetTreeNode.level : 1;
			return iTargetLevel;
		}


		function fnAddSuffixToCurrentHash(sSuffix, iViewLevel){
			var aParts = oTemplateContract.oApplicationProxy.getHierarchySectionsFromCurrentHash();
			var sRet = sSuffix;
			for (var i = iViewLevel - 2; i >= 0; i--){
				sRet = aParts[i] + "/" + sRet;
			}
			return "/" + sRet;
		}

		function fnNavigateToPath(sRoute, sPath, iTargetLevel, bReplace, bKeepVariantId){
			var oAppStates = {};
			var oFCLPromise = oTemplateContract.oFlexibleColumnLayoutHandler && oTemplateContract.oFlexibleColumnLayoutHandler.getFCLAppStatesPromise(sRoute, oAppStates);
			var oTargetPromise = fnAddUrlParameterInfoForRoute(sRoute, oAppStates, sPath);
			var oParStringPromise = (oFCLPromise ? Promise.all([oFCLPromise, oTargetPromise]) : oTargetPromise).then(fnAppStates2ParString.bind(null, oAppStates));
			var oBackwardingInfo = fnGetBackwardingInfoForTarget(bReplace, sPath, iTargetLevel);
			var oNavigationPromise = fnNavigateToParStringPromise(sPath, oParStringPromise, iTargetLevel, bReplace, oBackwardingInfo, bKeepVariantId);
			oTemplateContract.oBusyHelper.setBusy(oNavigationPromise);
			return oNavigationPromise;
		}

		function fnNavigateToSuffix(sSuffix, iViewLevel, sRoute, bReplace){
			var sPath = fnAddSuffixToCurrentHash(sSuffix, iViewLevel);
			fnNavigateToPath(sRoute, sPath, iViewLevel, bReplace);
		}

		// vTargetContext is either a string or an object. Only in the second case sNavigationProperty may be used.
		function fnNavigateToContextImpl(vTargetContext, sNavigationProperty, bReplace, iDisplayMode, oQuery, bKeepVariantId) {
			var sPath;
			var iTargetLevel, sRoute, aParts;
			var aTargetComponentPromises = [];
			if (typeof vTargetContext === "string"){
				sPath = vTargetContext;
				var sNormalizedPath = fnNormalizeHash(sPath);
				if (sNormalizedPath === "/"){
					iTargetLevel = 0;
				} else {
					aParts = sNormalizedPath.split("/");
					iTargetLevel = aParts.length - 1;
				}
				switch (iTargetLevel){
					case 0: sRoute = "root";
						break;
					case 1: sRoute = aParts[1].split("(")[0];
						break;
					default:
						sRoute = "";
						var sSlash = "";
						for (var i = 0; i < iTargetLevel; i++){
							var sPart = aParts[i + 1];
							var iIndex = sPart.indexOf("(");
							if (iIndex > 0){
								sPart = sPart.substring(0, iIndex);
							}
							sRoute = sRoute + sSlash + sPart;
							sSlash = "/";
						}
						sRoute = sRoute.replace("---", "/"); // for embedded components
				}
			} else {
			// get the navigation path from binding context
				var oTarget = routingHelper.determineNavigationPath(vTargetContext, sNavigationProperty);
				iTargetLevel = getTargetLevel(oTarget);
				sPath = oTarget.path;
				aTargetComponentPromises = getTargetComponentPromises(oTarget);
				sRoute = oTemplateContract.mEntityTree[oTarget.entitySet].sRouteName;
			}
			if (sNavigationProperty) {
				sPath = fnAddSuffixToCurrentHash(sPath, iTargetLevel);
			}
			fnPresetDisplayMode(aTargetComponentPromises, iDisplayMode || 0);
			// navigate to context
			if (oQuery){
				sPath = fnConcatPathAndAppStates(sPath, oQuery);
				fnNavigate(sPath, bReplace, iTargetLevel ,bKeepVariantId);
				return Promise.resolve(sPath);
			} else {
				return fnNavigateToPath(sRoute, sPath, iTargetLevel, bReplace, bKeepVariantId);
			}
		}

		function fnNavigateToContext(vTargetContext, sNavigationProperty, bReplace, iDisplayMode, bKeepVariantId) {
			return fnNavigateToContextImpl(vTargetContext, sNavigationProperty, bReplace, iDisplayMode, undefined, bKeepVariantId);
		}

		function setVisibilityOfRoute(sRoute, iVisibility){
			oCurrentHash.componentsDisplayed[sRoute] = iVisibility;
			var oTreeNode = oTemplateContract.mRoutingTree[sRoute];
			var sComponentId = oTreeNode.componentId;
			if (sComponentId){
				var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
				var oTemplatePrivateModel = oRegistryEntry.utils.getTemplatePrivateModel();
				oTemplatePrivateModel.setProperty("/generic/isActive", iVisibility === 1);
			}
		}

		function fnTransferMessageParametersToGlobalModelAndDisplayMessage(mParameters) {
			var sEntitySet, sText, oEntitySet, oEntityType, oHeaderInfo, sIcon = null,
				oMetaModel, sDescription;
			if (mParameters) {
				sEntitySet = mParameters.entitySet;
				sText = mParameters.text;
				sIcon = mParameters.icon;
				sDescription = mParameters.description;
			}

			if (sEntitySet) {
				oMetaModel = oTemplateContract.oAppComponent.getModel().getMetaModel();
				if (oMetaModel) {
					oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
					oHeaderInfo = oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"];
				}
				if (oHeaderInfo && oHeaderInfo.TypeImageUrl && oHeaderInfo.TypeImageUrl.String) {
					sIcon = oHeaderInfo.TypeImageUrl.String;
				}
			}

			oTemplateContract.oShellServicePromise.then(function(oShellService) {
				if (oShellService.setBackNavigation) {
					oShellService.setBackNavigation(undefined);
				}
			});
			oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/messagePage", {
				text: sText,
				icon: sIcon,
				description: sDescription
			});

			if (oTemplateContract.oFlexibleColumnLayoutHandler){
				oTemplateContract.oFlexibleColumnLayoutHandler.displayMessagePage(mParameters, oCurrentHash.componentsDisplayed);
			} else {
				var oTargets = oNavigationControllerProxy.oRouter.getTargets();
				oTargets.display("messagePage");
				for (var sRoute in oCurrentHash.componentsDisplayed){ // there should only be one match
					setVisibilityOfRoute(sRoute, 5); // mark the component as being replaced by an error page
				}
			}
			fnAfterActivationImpl(mParameters);
		}

		function fnShowStoredMessage(){
			if (!jQuery.isEmptyObject(mMessagePageParams)){
				var mParameters = null;
				for (var i = 0; !mParameters; i++){
					mParameters = mMessagePageParams[i];
				}
				mMessagePageParams = {};
				fnTransferMessageParametersToGlobalModelAndDisplayMessage(mParameters);
			}
		}

		function fnNavigateToMessagePage(mParameters) {
			if (oNavigationControllerProxy.oTemplateContract.oFlexibleColumnLayoutHandler){
				mParameters.viewLevel = mParameters.viewLevel || 0;
				mMessagePageParams[mParameters.viewLevel] = mParameters;
				var oLoadedFinishedPromise = Promise.all([oActivationPromise, oNavigationControllerProxy.oTemplateContract.oPagesDataLoadedObserver.getProcessFinished(true)]);
				oLoadedFinishedPromise.then(fnShowStoredMessage);
				oLoadedFinishedPromise.then(oTemplateContract.oBusyHelper.setBusyReason.bind(null, "HashChange", false));
				return;
			}
			fnTransferMessageParametersToGlobalModelAndDisplayMessage(mParameters);
			oTemplateContract.oBusyHelper.setBusyReason("HashChange", false);
		}

		// End: Navigation methods

		function getActiveComponents(){
			var aRet = [];
			for (var sComponentId in oTemplateContract.componentRegistry){
				var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
				if (oCurrentHash.componentsDisplayed[oRegistryEntry.route] === 1){ // component is currently active
					aRet.push(sComponentId);
				}
			}
			return aRet;
		}

		function getAllComponents() {
			var aRet = [];
			for (var sComponentId in oTemplateContract.componentRegistry){
				aRet.push(sComponentId);
			}
			return aRet;
		}

		function getCurrentKeys(iViewLevel){
			return oCurrentIdentity.keys.slice(0, iViewLevel + 1);
		}

		function getCurrentHash(iToLevel){
			var sRet = "";
			var sHash = oCurrentHash.hash;
			var aParts = sHash.split("/");
			var sDelim = "";
			for (var i = 0; i <= iToLevel; i++){
				sRet = sRet + sDelim + aParts[i];
				sDelim = "/";
			}
			return sRet;
		}

		function getActivationInfo(){
			return oCurrentHash;
		}

		// For routing event oEvent this function provides information about routes on upper levels.
		// iLevel should be the absolute level the information is requested for.
		function getAncestralRoute(oEvent, iLevel){
			if (iLevel === 0){
				return {
					name: "root",
					pattern: ""
				};
			}
			var oConfig =  oEvent.getParameter("config");
			var iViewLevel = oConfig.viewLevel;
			if (iViewLevel < iLevel){
				return null;
			}
			var mEntityTree = oTemplateContract.mEntityTree;
			var sEntitySet = oConfig.entitySet;
			var oTreeNode;
			for (var j = iViewLevel; j >= iLevel; j--){
				oTreeNode = mEntityTree[sEntitySet];
				sEntitySet = oTreeNode.parent;
			}
			return {
				name: oTreeNode.sRouteName,
				pattern: oTreeNode.pattern
			};
		}

		// Start: Handling url-changes

		/*
		 * calls onActivate on the specified view, if it exists
		 * @param {Object} oView - the view
		 * @param {string} sPath - the path in the model
		 * @param {boolean} bDelayedActivate - optional boolean flag, true if activate is (re-)triggered delayed
		 */
		function fnActivateOneComponent(sPath, oActivationInfo, oComponent) {
			var sComponentId = oComponent.getId();
			var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
			var sRoute = oRegistryEntry.route;
			var iCurrentActivity = oActivationInfo.componentsDisplayed[sRoute];
			var bIsComponentCurrentlyActive = iCurrentActivity === 1;
			oCurrentHash.componentsDisplayed[sRoute] = 1;
			// trigger onActivate on the component instance
			// if Component is assembled without TemplateAssembler it could be that oComponent.onActivate is undefined
			// e.g. an application has an own implementation of Component
			// however, we do not consider this as a relevant case anymore - just keeping the comment in case any app breaks here
			var oRet = oComponent.onActivate(sPath, bIsComponentCurrentlyActive) || Promise.resolve();
			return Promise.all([oRet, oRegistryEntry.viewRegistered]).then(function(){
				oRegistryEntry.aKeys = getCurrentKeys(oRegistryEntry.viewLevel);
			});
		}

		/*
		 * calls onActivate on the specified view, if it exists. Only used in the Non-FCL case
		 * @param {Object} oView - the view
		 * @param {string} sPath - the path in the model
		 * @param {boolean} bDelayedActivate - optional boolean flag, true if activate is (re-)triggered delayed
		 */
		function fnActivateComponent(sPath, oActivationInfo, oComponent) {
			return fnActivateOneComponent(sPath, oActivationInfo, oComponent).then(fnAfterActivation);
		}

		function fnAdaptPaginatorInfoAfterNavigation(oEvent, bIsProgrammatic, bIsBack){
			var oNewPaginatorInfo = {};
			if (bIsProgrammatic || bIsBack){
				var iViewLevel = oEvent.getParameter("config").viewLevel;
				for (var iLevel = 0; iLevel < iViewLevel; iLevel++){
					oNewPaginatorInfo[iLevel] = oTemplateContract.oPaginatorInfo[iLevel];
				}
			}
			oTemplateContract.oPaginatorInfo = oNewPaginatorInfo;
		}

		function fnGetAlternativeContextPromise(sPath){
			return oTemplateContract.oApplicationProxy.getAlternativeContextPromise(sPath);
		}

		function fnHandleBeforeRouteMatched(oEvent){
			fnFillCurrentIdentity(oEvent);
			oCurrentIdentity.preset = true;
			if (oTemplateContract.oFlexibleColumnLayoutHandler){
				oTemplateContract.oFlexibleColumnLayoutHandler.handleBeforeRouteMatched(oEvent, oCurrentIdentity);
			}
		}

		// This handler is registered at the route matched event of the router. It is thus called whenever the url changes within the App (if the new url is legal)
		function fnHandleRouteMatchedImpl(oEvent) {
			if (oCurrentIdentity && oCurrentIdentity.preset){
				delete oCurrentIdentity.preset;
			} else {
				fnFillCurrentIdentity(oEvent);
			}
			if (oRoutingOptions && oRoutingOptions.followUpNeeded && oRoutingOptions.identity && !isIdentityReached(oRoutingOptions.identity)){
				fnNavigateToRoute(); // execute the follow-up navigation
				return;
			}
			oTemplateContract.oBusyHelper.setBusyReason("HashChange", false);
			var iViewLevel = oEvent.getParameter("config").viewLevel;
			var sHash = fnNormalizeHash(oNavigationControllerProxy.oHashChanger.getHash() || "");
			Log.info("Route matched with hash " + sHash);
			var oPreviousHash; // will be oCurrentHash soon
			if (oCurrentHash.backwardingInfo){   // then this is the back step of a 'complex back navigation'
				// Store oCurrentHash in aPreviousHashes and create a new instance of oCurrentHash for the newly started logical navigation step
				oPreviousHash = oCurrentHash;
				oPreviousHash.identity = oCurrentIdentity.previousIdentity;
				delete oCurrentIdentity.previousIdentity;
				aPreviousHashes.push(oPreviousHash);
				var iNewHashChangeCount = oPreviousHash.iHashChangeCount + 1;
				oCurrentHash = {
					iHashChangeCount: iNewHashChangeCount,
					forwardingInfo: {
						bIsProgrammatic: true,
						bIsBack: true,
						iHashChangeCount: iNewHashChangeCount,
						targetHash: oPreviousHash.backwardingInfo.targetHash,
						componentsDisplayed: oPreviousHash.componentsDisplayed
					},
					backTarget: aPreviousHashes[oPreviousHash.backwardingInfo.index].backTarget,
					componentsDisplayed: Object.create(null)
				};
			}
			if (oCurrentHash.forwardingInfo && oCurrentHash.forwardingInfo.targetHash && oCurrentHash.forwardingInfo.targetHash !== sHash){ // This can be either, because we are processing a follow-up of a complex back navigation or we are processing a follow-up navigation to an alternative context
				oCurrentHash.hash = sHash;
				var sTargetHash = oCurrentHash.forwardingInfo.targetHash;
				delete oCurrentHash.forwardingInfo.targetHash; // the targetHash will be reached with next physical navigation step -> remove the property
				fnNavigate(sTargetHash, true);
				return; // fnHandleRouteMatched will be called with the new url, so leave further processing to that call
			}
			var oRouteConfig = oEvent.getParameter("config");
			var sPath = routingHelper.determinePath(oCurrentIdentity.treeNode, oEvent);
			// State changers may identify the hash change as something which can be handled by them internally. In this case we do not need to run the whole mechanism.
			// Since isStateChange is allowed to have side-effects we call all StateChangers (currently only one exists).
			var bIsStateChange = false;
			for (var i = 0; i < oTemplateContract.aStateChangers.length; i++){
				var oStateChanger = oTemplateContract.aStateChangers[i];
				if (oStateChanger.isStateChange(oEvent)){
					bIsStateChange = true;
				}
			}

			if (bIsStateChange){
				oRoutingOptions = null;
				oCurrentHash.hash = sHash;
				// If state was changed rebuild the navigation menu because AppState is needed in the URL
				fnHandleNavigationMenu();
				if (oTemplateContract.oFlexibleColumnLayoutHandler){
					oTemplateContract.oFlexibleColumnLayoutHandler.handleRouteMatched(oEvent, oRouteConfig, sPath);
				}
				return;
			}
			// When we come here, then we can be sure that:
			// - if oCurrentHash contains a forwardingInfo, we have reached the targetHash
			// - the url-change was not triggered by a state changer.
			// At this point in time oCurrentHash may still represent the previous logical navigation step or already represent the current logical navigation step.
			// These two scenarios can be distinguished via property forwardingInfo of oCurrentHash. If this property is faulty the first option applies.
			oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/routeLevel", iViewLevel);
			// oActivationInfo is an object that will be passed to helper functions that deal with follow-up activities.
			// It contains the following properties:
			// - iHashChangeCount the current hashChangeCount
			// - bIsProgrammatic  information whether the logical navigation was triggered programmatically
			// - bIsBack          information whether the logical navigation step was reached by backward navigation
			// - componentsDisplayed: Map that contains information about the components currently displayed (see oCurrentHash)
			var oActivationInfo = oCurrentHash.forwardingInfo; // If there is a forwardingInfo it already provides the required properties
			delete oCurrentHash.forwardingInfo;
			if (!oActivationInfo){ // then we have to create oActivationInfo AND a new instance for oCurrentHash
				oActivationInfo = {
					componentsDisplayed: oCurrentHash.componentsDisplayed
				};
				var iPreviousHashChangeCount = oCurrentHash.iHashChangeCount;
				oActivationInfo.iHashChangeCount = iPreviousHashChangeCount + 1;
				var sDirection = oHistory.getDirection();
				if (oRoutingOptions){
					oActivationInfo.bIsProgrammatic = !!oRoutingOptions.identity;
					oActivationInfo.bIsBack = oRoutingOptions.mode < 0;
					if (oActivationInfo.bIsBack){
						oCurrentHash.backSteps = 0 - oRoutingOptions.mode;
					}
					oActivationInfo.bIsForward = !oActivationInfo.bIsBack && (sDirection === HistoryDirection.Forwards);
					oCurrentHash.LeaveByReplace = oRoutingOptions.mode === 1;
				} else {
					oActivationInfo.bIsProgrammatic = (sHash === oCurrentHash.targetHash);
					oActivationInfo.bIsBack = !!(oCurrentHash.LeaveByBack || (!oActivationInfo.bIsProgrammatic && (sDirection === HistoryDirection.Backwards)));
					oActivationInfo.bIsForward = !oActivationInfo.bIsBack && (sDirection === HistoryDirection.Forwards);
					oCurrentHash.LeaveByReplace = oActivationInfo.bIsProgrammatic && oCurrentHash.LeaveByReplace;
				}
				oCurrentHash.LeaveByBack = oActivationInfo.bIsBack;
				oPreviousHash = oCurrentHash;
				oPreviousHash.identity = oCurrentIdentity.previousIdentity;
				delete oCurrentIdentity.previousIdentity;				
				aPreviousHashes.push(oPreviousHash);
				oCurrentHash = {
					iHashChangeCount: oActivationInfo.iHashChangeCount,
					componentsDisplayed: Object.create(null)
				};
				// identify the back target
				if (oPreviousHash.LeaveByReplace){
					oCurrentHash.backTarget = oPreviousHash.backTarget; // url is replaced  -> back target remains unchanged
				} else if (oActivationInfo.bIsBack){
					var iBackTarget = oPreviousHash.backTarget;
					for (var iSteps = oPreviousHash.backSteps || 1; iSteps > 0; iSteps--){
						iBackTarget = aPreviousHashes[iBackTarget].backTarget;
					}
					oCurrentHash.backTarget = iBackTarget;
				} else {
					oCurrentHash.backTarget = iPreviousHashChangeCount;	// last url is back target
				}
			}
			oRoutingOptions = null;
			oCurrentHash.oEvent = oEvent;
			oCurrentHash.hash = sHash;

			// During back navigation the link we are navigating to might have been made obsolete during the runtime of the App. This would happen in the following cases:
			// - Link points to a draft, but the draft has been activated or cancelled meanwhile.
			// - Link points to an active entity. Meanwhile, a own draft for this active entity exists, and needs to be redirected to draft.
			// - Link points to an object which has been deleted meanwhile.
			// Whereas we cannot do anything in the third case (thus, a message page will be displayed then), in the first two cases we want to
			// automatically forward the user to the correct instance.
			// In order to achieve this, we use method fnGetAlternativeContextPromise which may provide an alternative context to navigate to.
			// However, there are two limitations for that:
			// - In general the functionality only covers activation/cancellation/draft-creation actions which have been performed within this session.
			//   These actions have been registered within class ContextBookkeeping.
			// - For hashes pointing to item level (viewLevel > 1) it is currently not possible to determine the alternative path. Therefore, the determination
			//   whether an alternative context is required is done on root object level. Thus, the root object is navigated to, if one of the cases above is
			//   discovered.
			// fnAfterAlternateContextIsFound is executed after the alternate context is found.

			var fnAfterAlternateContextIsFound = function(oAlternativeContextInfo){
				var oKeys = oEvent.getParameter("arguments");
				if (oAlternativeContextInfo){ // then one of the cases described above occurs
					var oQuery = oKeys["?query"]; // We want to navigate to another context, but the query parameters should stay the same
					oCurrentHash.forwardingInfo = oActivationInfo; // Note: This is the second scenario for forwardingInfo as described in the comment for oCurrentHash (see above)
					fnNavigateToContextImpl(oAlternativeContextInfo.context, null, true, oAlternativeContextInfo.iDisplayMode, oQuery || {}); // Navigate to the other context
					return; // note that fnHandleRouteMatched will be called again
				}
				// When we reach this point, the logical navigation step has reached its final url.
				// Now we have to adapt the state of the application
				setHierarchy([]);
				fnAdaptPaginatorInfoAfterNavigation(oEvent, oActivationInfo.bIsProgrammatic, oActivationInfo.bIsBack);

				if (oTemplateContract.oFlexibleColumnLayoutHandler){
					oActivationPromise = oTemplateContract.oFlexibleColumnLayoutHandler.handleRouteMatched(oEvent, oRouteConfig, sPath, oActivationInfo);
				} else {

					if (iViewLevel === 0 || oActivationInfo.bIsBack || !oActivationInfo.bIsProgrammatic){
						oTemplateContract.oApplicationProxy.setEditableNDC(false);
					}

					var sRoute = oRouteConfig.target;   // Note: Route and targetnames are identical
					var oComponentPromise = oTemplateContract.mRouteToTemplateComponentPromise[sRoute];
					oActivationPromise = new Promise(function(fnResolve, fnReject){
						oComponentPromise.then(function(oComponent){
							fnActivateComponent(sPath, oActivationInfo, oComponent).then(fnResolve, fnReject);
						});
					});
				}
				oTemplateContract.oBusyHelper.setBusy(oActivationPromise);
			};

			if (oActivationInfo.bIsBack) {
				// sTestPath is the path for which we check, whether one of the cases described above, occurs. As discussed above, for viewLevel > 1 we
				// cannot use sPath (which points to the item), but must use the corresponding path pointing to the root.
				var sTestPath = iViewLevel < 2 ? sPath : routingHelper.determinePath(oTemplateContract.mRoutingTree[getAncestralRoute(oEvent, 1).name], oEvent);
				oTemplateContract.oBusyHelper.setBusy(fnGetAlternativeContextPromise(sTestPath).then(fnAfterAlternateContextIsFound));
			} else {
				fnAfterAlternateContextIsFound();
			}
		}

		// This handler is registered at the route matched event of the router. It is thus called whenever the url changes within the App (if the new url is legal)
		function fnHandleRouteMatched(oEvent) {
			oEvent = jQuery.extend({}, oEvent); // as this handler works asynchronously and events are pooled by UI5, we create a defensive copy
			oTemplateContract.oStatePreserversAvailablePromise.then(fnHandleRouteMatchedImpl.bind(null, oEvent), oTemplateContract.oBusyHelper.setBusyReason.bind(null, "HashChange", false));
		}

		// Event handler fired by router when no matching route is found
		function fnHandleBypassed() {
			fnNavigateToMessagePage({
				title: oTemplateContract.getText("ST_ERROR"),
				text:  oTemplateContract.getText("ST_GENERIC_UNKNOWN_NAVIGATION_TARGET"),
				description: ""
			});
		}

		if (oTemplateContract.sRoutingType === "f"){
			oNavigationControllerProxy.oRouter.attachBeforeRouteMatched(fnHandleBeforeRouteMatched);
		}

		oNavigationControllerProxy.oRouter.attachRouteMatched(fnHandleRouteMatched);

		oNavigationControllerProxy.oRouter.attachBypassed(fnHandleBypassed);

		// End: Handling url-changes

		// Expose methods via NavigationController proxy
		oNavigationControllerProxy.removeQueryInRouteName = removeQueryInRouteName;
		oNavigationControllerProxy.concatPathAndAppStates = fnConcatPathAndAppStates;
		oNavigationControllerProxy.navigate = fnNavigate;
		oNavigationControllerProxy.getAncestralRoute = getAncestralRoute;
		oNavigationControllerProxy.activateOneComponent = fnActivateOneComponent;
		oNavigationControllerProxy.afterActivation = fnAfterActivation;
		oNavigationControllerProxy.addUrlParameterInfoForRoute = fnAddUrlParameterInfoForRoute;
		oNavigationControllerProxy.getApplicableStateForComponentAddedPromise = getApplicableStateForComponentAddedPromise;
		oNavigationControllerProxy.setVisibilityOfRoute = setVisibilityOfRoute;
		oNavigationControllerProxy.getActiveComponents = getActiveComponents;
		oNavigationControllerProxy.getAllComponents = getAllComponents;
		oNavigationControllerProxy.getRootComponentPromise = getRootComponentPromise;
		oNavigationControllerProxy.getActivationInfo = getActivationInfo;
		oNavigationControllerProxy.getCurrentKeys = getCurrentKeys;
		oNavigationControllerProxy.getCurrentHash = getCurrentHash;
		oNavigationControllerProxy.getAppTitle = getAppTitle;
		oNavigationControllerProxy.subTitleForViewLevelChanged = fnSubTitleForViewLevelChanged;
		oNavigationControllerProxy.navigateToSuffix = fnNavigateToSuffix;
		oNavigationControllerProxy.navigateByExchangingQueryParam = fnNavigateByExchangingQueryParam;
		oNavigationControllerProxy.navigateBackToAncestorComponent = fnNavigateBackToAncestorComponent;
		
		oNavigationControllerProxy.getSwitchToSiblingPromise = getSwitchToSiblingPromise;
		oNavigationControllerProxy.getCurrentIdentity = getCurrentIdentity;
		oNavigationControllerProxy.navigateToIdentity = fnNavigateToIdentity;
		oNavigationControllerProxy.navigateAfterActivation = fnNavigateAfterActivation;

		// to allow AppComponent to trigger retemplating - for designtime tools only
		oNavigationControllerProxy.createComponentInstance = fnCreateComponentInstance;

		return {
			/**
			* Navigates to the root view.
			*
			* @public
			* @param {boolean} bReplace If this is true the navigation/hash will be replaced
			*/
			navigateToRoot: fnNavigateToRoot,

			/**
			 * Navigates to the specified context.
			 *
			 * @public
			 * @param {Object} oTargetContext - The context to navigate to (or null - e.g. when the navigationProperty should be appended to the current path)
			 * @param {string} sNavigationProperty - The navigation property
			 * @param {boolean} bReplace If this is true the navigation/hash will be replaced
			 */
			navigateToContext: fnNavigateToContext,
			/**
			 * Navigates to the message page and shows the specified content.
			 *
			 * @public
			 * @param {Object} mParameters - The parameters for message page
			 */
			navigateToMessagePage: fnNavigateToMessagePage,

			/**
			 * Navigate back
			 *
			 * @public
			 */
			navigateBack: fnNavigateBack.bind(null, 1)
		};
	}

	function constructor(oNavigationController, oTemplateContract){
		var oNavigationControllerProxy = {
			oAppComponent: oTemplateContract.oAppComponent,
			oRouter: oTemplateContract.oAppComponent.getRouter(),
			oTemplateContract: oTemplateContract,
			oHashChanger: HashChanger.getInstance(),
			mRouteToComponentResolve: {}
		};

		oTemplateContract.oNavigationControllerProxy = oNavigationControllerProxy;
		var oFinishedPromise = new Promise(function(fnResolve){
			// remark: In case of inbound navigation with edit-mode and an existing draft, this promise will be resolved
			// before the initialization is actually finished.
			// This is necessary to be able to show the unsavedChanges-Dialog
			oNavigationControllerProxy.fnInitializationResolve = fnResolve;
		});
		oTemplateContract.oBusyHelper.setBusy(oFinishedPromise);
		jQuery.extend(oNavigationController, getMethods(oTemplateContract, oNavigationControllerProxy));
		jQuery.extend(oNavigationControllerProxy, oNavigationController);
		// TODO: this has to be clarified and fixed
		oNavigationControllerProxy.oRouter._oViews._getViewWithGlobalId = function(oView) {
			/*
			 * check, whether the component for the given viewname has already been created
			 * by searching in componentRegistry - if yes, just return the existing one
			 * (instead of a view, also a component container can be returned)
			 */
			oView.viewName = oView.name || oView.viewName;
			for (var key in oTemplateContract.componentRegistry){
				if (oTemplateContract.componentRegistry[key].route === oView.viewName){
					return oTemplateContract.componentRegistry[key].oComponent.getComponentContainer();
				}
			}

			var oRoute = oNavigationControllerProxy.oRouter.getRoute(oView.viewName);
			var oContainer;
			if (oRoute && oRoute._oConfig) {
				oContainer = fnCreateComponentInstance(oTemplateContract, oRoute._oConfig, oNavigationControllerProxy.mRouteToComponentResolve[oView.viewName]);
			} else {
				oContainer = sap.ui.view({
					viewName: oView.viewName,
					type: oView.type,
					height: "100%"
				});
			}
			if (oView.viewName === "root") {
				oTemplateContract.rootContainer = oContainer;
			}

			return oContainer.loaded();
		};
		routingHelper.startupRouter(oNavigationControllerProxy);
	}

	/*
	 * Handles all navigation and routing-related tasks for the application.
	 *
	 * @class The NavigationController class creates and initializes a new navigation controller with the given
	 *        {@link sap.suite.ui.generic.template.lib.AppComponent AppComponent}.
	 * @param {sap.suite.ui.generic.template.lib.AppComponent} oAppComponent The AppComponent instance
	 * @public
	 * @extends sap.ui.base.Object
	 * @version 1.66.0
	 * @since 1.30.0
	 * @alias sap.suite.ui.generic.template.lib.NavigationController
	 */
	var NavigationController = BaseObject.extend("sap.suite.ui.generic.template.lib.NavigationController", {
		metadata: {
			library: "sap.suite.ui.generic.template"
		},
		constructor: function(oTemplateContract) {
			// inherit from base object.
			BaseObject.apply(this, arguments);
			testableHelper.testableStatic(constructor, "NavigationController")(this, oTemplateContract);
		}
	});

	NavigationController._sChanges = "Changes";
	return NavigationController;
});
