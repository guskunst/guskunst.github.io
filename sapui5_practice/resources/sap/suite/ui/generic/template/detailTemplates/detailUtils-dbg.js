sap.ui.define(["jquery.sap.global", "sap/ui/core/routing/HashChanger", "sap/suite/ui/generic/template/extensionAPI/NavigationController",
	"sap/suite/ui/generic/template/lib/MessageButtonHelper",  "sap/suite/ui/generic/template/lib/testableHelper", "sap/suite/ui/generic/template/detailTemplates/PaginatorButtonsHelper",
		"sap/suite/ui/generic/template/ObjectPage/extensionAPI/DraftTransactionController", "sap/suite/ui/generic/template/ObjectPage/extensionAPI/NonDraftTransactionController",	
	"sap/m/DraftIndicator"], 
	function(jQuery, HashChanger, NavigationController, MessageButtonHelper, testableHelper, PaginatorButtonsHelper, DraftTransactionController, NonDraftTransactionController) {
		"use strict";
		
		var DraftIndicatorState = sap.m.DraftIndicatorState; // namespace cannot be imported by sap.ui.define
		
		function getComponentBase(oComponent, oComponentUtils, oViewProxy){
			function init(){
				var oTemplatePrivateModel = oComponentUtils.getTemplatePrivateModel();
				oTemplatePrivateModel.setProperty("/objectPage", {
					displayMode: 0, // 0 = unknown, 1 = display, 2 = edit, 4 = add, 6 = change (edit or add)
					headerInfo: { // contains information about title and subtitle of the page
						objectTitle: "",
						objectSubtitle: ""
					}
				});
				oComponentUtils.setStatePreserverPromise(oViewProxy);
			}
			
			function onActivate(sBindingPath, bIsComponentCurrentlyActive) {
				// preliminary: in draft case maybe on first time property is not set
				if (!oComponentUtils.isDraftEnabled()){
					var oUIModel = oComponent.getModel("ui");
					var oTemplatePrivateModel = oComponentUtils.getTemplatePrivateModel();
					var bCreateMode = oComponentUtils.isNonDraftCreate();
					oUIModel.setProperty("/createMode", bCreateMode);
					if (bCreateMode || oComponentUtils.getEditableNDC()) {
						oUIModel.setProperty("/editable", true);
						oTemplatePrivateModel.setProperty("/objectPage/displayMode", bCreateMode ? 4 : 2);
					} else {
						oUIModel.setProperty("/editable", false);
						oTemplatePrivateModel.setProperty("/objectPage/displayMode", 1);
					}
				}
				(oViewProxy.onComponentActivate || jQuery.noop)(sBindingPath, bIsComponentCurrentlyActive);
			}
			
			// This method is called when a new binding context has been retrieved for this Component.
			// If the entity is draft enabled this happens whenever a different instance is displayed or the edit status changes.
			// If the entity is not draft enabled this only happens when a different instance is displayed.
			// It does not happen when changing to edit mode or creating a new instance. In this case the adjustment of the JSON models is already done in onActivate.
			function updateBindingContext() {
				var oBindingContext = oComponent.getBindingContext();
				var oContextInfo = oComponentUtils.registerContext(oBindingContext);
				// set draft status to blank according to UI decision
				var oTemplatePrivateGlobal = oComponent.getModel("_templPrivGlobal");
				oTemplatePrivateGlobal.setProperty("/generic/draftIndicatorState", DraftIndicatorState.Clear);

				(oViewProxy.getHeaderInfoTitleForNavigationMenue || jQuery.noop)();
				(oViewProxy.applyHeaderContextToSmartTablesDynamicColumnHide || jQuery.noop)(oBindingContext);

				var oUIModel = oComponent.getModel("ui");
				var bIsEditable;
				var oTemplatePrivateModel = oComponentUtils.getTemplatePrivateModel();
				if (oContextInfo.bIsDraft) {
					bIsEditable = true;
					oUIModel.setProperty("/enabled", true);
					oTemplatePrivateModel.setProperty("/objectPage/displayMode", oContextInfo.bIsCreate ? 4 : 2);
				} else {
					bIsEditable = oComponentUtils.getEditableNDC();
					oTemplatePrivateModel.setProperty("/objectPage/displayMode", bIsEditable ? 2 : 1);
					// enable the buttons
					oUIModel.setProperty("/enabled", true);
				}
				oUIModel.setProperty("/createMode", oContextInfo.bIsCreate);
				oUIModel.setProperty("/editable", bIsEditable);
			}
			
			// This method is called by the framework, when some saving action has been observed. In this case it returns the context path for the
			// current draft root (if we are in draft mode).  This will cause this draft to be marked as modified.
			function fnCurrentDraftModified(){
				return oComponentUtils.getDraftRootPath();
			}
			
			function fnNavigateUp(){
				oViewProxy.navigateUp();	
			}
			
			function getUrlParameterInfo(sPath, bAlreadyVisible) {
				return oViewProxy.oStatePreserverPromise.then(function(oStatePreserver){
					return oStatePreserver.getUrlParameterInfo(sPath, bAlreadyVisible);
				});
			}
			
			// checks whether this view has a reason to prevent saving. If yes a message is returned
			function getMessageFilters(bOnlyValidation){
				return 	oViewProxy.getMessageFilters(bOnlyValidation);
			}
			
			function getScrollFunction(aControlIds){
				return oViewProxy.getScrollFunction && oViewProxy.getScrollFunction(aControlIds);	
			}
			
			return {
				init: init,
				onActivate: onActivate,
				getTitle: oComponentUtils.getTitleFromTreeNode,
				updateBindingContext: updateBindingContext,
				currentDraftModified: fnCurrentDraftModified,
				navigateUp: fnNavigateUp,
				getUrlParameterInfo: getUrlParameterInfo,
				getMessageFilters: getMessageFilters,
				getScrollFunction: getScrollFunction
			};
		}
		
		function getControllerBase(oViewProxy, oTemplateUtils, oController){
			
			var oControllerBase;
			var sLinkUp;
			
			var oPaginatorButtonsHelper; // initialized in onInit, if needed
			
			var oHashChanger; // initialized on first use
			function fnGetHashChangerInstance() {
				return oHashChanger || HashChanger.getInstance();
			}
			
			function fnCreateBreadCrumbLinkHandler(j, oMyLink){
				return function(){
					oTemplateUtils.oServices.oApplication.subTitleForViewLevelChanged(j, oMyLink.getText());
				};
			}
			
			// this method is called, when the editablity status is changed
			function setEditable(bIsEditable) {
				var bIsNonDraft = !oTemplateUtils.oComponentUtils.isDraftEnabled();
				// Setting editable to false is done immidiately
				// Setting editable to true is (in draft case) postponed until the header data are read (method updateBindingContext).
				if (bIsNonDraft || !bIsEditable){
					var oUIModel = oController.getView().getModel("ui");
					oUIModel.setProperty("/editable", bIsEditable);
				}
				if (bIsNonDraft) {
					oTemplateUtils.oComponentUtils.setEditableNDC(bIsEditable);
				}
			}
			
			function fnOnBack() {
				oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft(function() {
					// only for Non-Draft the editable must be set to false
					var bIsDraft = oTemplateUtils.oComponentUtils.isDraftEnabled();
					if (!bIsDraft){
						setEditable(false);
					}
					oTemplateUtils.oServices.oNavigationController.navigateBack();
				}, jQuery.noop, oControllerBase.state);
			}
			
			function fnAdaptBreadCrumbLink(oLink, oInfoObject){
				var oHashChng = fnGetHashChangerInstance();
				var sLink = oInfoObject.fullLink;
				var sHash = oHashChng.hrefForAppSpecificHash ? oHashChng.hrefForAppSpecificHash(sLink) : "#/" + sLink;
				oLink.setHref(sHash);
			}
			
			function fnAdaptLinksToUpperLevels(){
				var oUpperLinkInfo = oTemplateUtils.oServices.oApplication.getLinkToUpperLayersInfo(false, false, oController.getOwnerComponent().getEntitySet());
				// adapt the link to the upper page immidiately
				sLinkUp = oUpperLinkInfo.aInfoObjects[oUpperLinkInfo.aInfoObjects.length - 1].link;
				// Now ensure that the breadcrumbs will be updtated. This will be done (partly) asynchronously
				var aBreadCrumbs = oViewProxy.aBreadCrumbs;
				if (!aBreadCrumbs){ 
					return;
				}
				var oBusyHelper = oTemplateUtils.oServices.oApplication.getBusyHelper();
				// Note that there is an offset of 1 between aBreadCrumbs and the arrays contained in oUpperLinkInfo, since the later ones still have the root page at index 0.
				for (var i = 0; i < aBreadCrumbs.length; i++){
					var oLink = aBreadCrumbs[i];  // the breadcrumb link to adapt
					var oInfoObject = oUpperLinkInfo.aInfoObjects[i + 1];
					var oLinkInfo = oTemplateUtils.oCommonUtils.getControlInformation(oLink);
					oLinkInfo.internalHash = oInfoObject.link;					
					var sEntitySet = oInfoObject.entitySet;                        
					// this will ensure that the correct href is set for oLink asynchronously.
					oBusyHelper.setBusy(oUpperLinkInfo.aInfoObjectPromises[i + 1].then(fnAdaptBreadCrumbLink.bind(null, oLink)));
					// now we (synchronously) define an element binding for oLink. The purpose for this is, that the relative binding which has been defined for the text property of oLink
					// will be updated automatically.
					// Thereby, this context binding is set to the canonical url. This one is derived from the expanded url by just taking the corresponding section of the binding and replace the
					// navigation property by the entity set.
					// The assumption that this works is actually also used at other places in the code.
					// Note that the element binding will not trigger a backend request on its own. So the data will only be available, when the corresponding page has already been visited.
					// For this reason the binding for the text-property of oLink contains a fallback.
					var aParts = oInfoObject.section.split("(");
					var sCanonicalUrl = "/" + sEntitySet + "(" + aParts[1];
					var oTextBindingInfo = oLink.getBindingInfo("text") || {};
					oTextBindingInfo.events = {
						change: fnCreateBreadCrumbLinkHandler(i + 1, oLink)
					};
					oLink.bindElement({
						path: sCanonicalUrl
					});					
				}
			}			
			
			function getApplyChangesPromise(oControl){
				var oContext = oControl.getBindingContext();
				var sHash = fnGetHashChangerInstance().getHash();
				return oTemplateUtils.oServices.oApplicationController.propertyChanged(sHash, oContext);
			}
			
			function fnNavigateUp(){
				if (sLinkUp){
					oTemplateUtils.oServices.oNavigationController.navigateToContext(sLinkUp, "", true);
				} else {
					oTemplateUtils.oServices.oNavigationController.navigateToRoot(true);
				}
			}
			
			// Event handler for the Apply button. Only visible in draft scenarios and not on the object root.
			function fnApplyAndUpImpl(oControl) {
				var oBusyHelper = oTemplateUtils.oServices.oApplication.getBusyHelper();
				var oUIModel = oController.getView().getModel("ui");
				var oTemplatePrivateGlobalModel = oController.getOwnerComponent().getModel("_templPrivGlobal");
				var oApplyPromise = getApplyChangesPromise(oControl).then(function(oReponse){
					if (!oControllerBase.fclInfo.isContainedInFCL || oTemplatePrivateGlobalModel.getProperty("/generic/FCL/isVisuallyFullScreen")){
						fnNavigateUp();
					}
					//the toast is shown independent of FCL
					//the next statement should not be deleted but a comment!!
//						oTemplateUtils.oServices.oApplication.showMessageToast(oTemplateUtils.oCommonUtils.getText("ST_CHANGES_APPLIED"));
				}, function(){
					oBusyHelper.getUnbusy().then(function(oReponse){
						if (!oControllerBase.fclInfo.isContainedInFCL || oTemplatePrivateGlobalModel.getProperty("/generic/FCL/isVisuallyFullScreen")) {
							oTemplateUtils.oCommonUtils.processDataLossTechnicalErrorConfirmation(function() {
								fnNavigateUp();
								oUIModel.setProperty("/enabled", true); //in case you leave the page set this
							}, jQuery.noop, oControllerBase.state);
						} else {
						//if the UI show FCL, one object next to the other, then another popup is needed						
						oTemplateUtils.oCommonUtils.processDataLossTechnicalErrorConfirmation(jQuery.noop, jQuery.noop, oControllerBase.state, "StayOnPage");
						}
					});
				});
				oBusyHelper.setBusy(oApplyPromise);
			}
			
			// Event handler for the Apply button. Only visible in draft scenarios and not on the object root.
			function fnApplyAndUp(oEvent) {
				var oControl = oEvent.getSource();
				oControllerBase.state.saveScenarioHandler.handleSaveScenario(2, fnApplyAndUpImpl.bind(null, oControl));
			}
			
			function onShowMessages() {
				oControllerBase.state.messageButtonHelper.toggleMessagePopover();
			}
			
			function getMessageFilters(bOnlyValidation){
				return oControllerBase.state.messageButtonHelper && oControllerBase.state.messageButtonHelper.getMessageFilters(bOnlyValidation);
			}
			
			function getNavigationControllerFunction(){
				var oNavigationController;
				return function(){
					oNavigationController = oNavigationController || new NavigationController(oTemplateUtils, oController, oControllerBase.state);
					return oNavigationController;
				};
			}
			
			function getTransactionControllerFunction() {
				var oTransactionController;
				return function(){
					if (!oTransactionController) {
						var Class = oTemplateUtils.oComponentUtils.isDraftEnabled() ? DraftTransactionController : NonDraftTransactionController;
						oTransactionController = new Class(oTemplateUtils, oController, oControllerBase.state);
					}
					return oTransactionController;
				};
			}
			
			function handleShowNextObject(){
				oPaginatorButtonsHelper.handleShowNextObject();
			}
			
			function handleShowPrevObject(){
				oPaginatorButtonsHelper.handleShowPrevObject();
			}
			
			// Expose selected private functions to unit tests
			/* eslint-disable */
			var fnGetHashChangerInstance = testableHelper.testable(fnGetHashChangerInstance, "getHashChangerInstance");
			var fnAdaptLinksToUpperLevels = testableHelper.testable(fnAdaptLinksToUpperLevels, "adaptLinksToUpperLevels");
			/* eslint-enable */
			
			oControllerBase = {
				onInit: function(oRequiredControls, fnPrepareAllMessagesForNavigation){
					if (!oRequiredControls || oRequiredControls.footerBar){
						var bIsODataBased = oTemplateUtils.oComponentUtils.isODataBased();
						var oMessageButtonHost = {
							controller: oController,
							prepareAllMessagesForNavigation: fnPrepareAllMessagesForNavigation
						};
						oControllerBase.state.messageButtonHelper = new MessageButtonHelper(oTemplateUtils.oCommonUtils, oMessageButtonHost, bIsODataBased);
						oControllerBase.state.saveScenarioHandler = oTemplateUtils.oServices.oApplication.getSaveScenarioHandler(oController, oTemplateUtils.oCommonUtils);
						oTemplateUtils.oServices.oTemplateCapabilities.oMessageButtonHelper = oControllerBase.state.messageButtonHelper;
					}
					if (!oRequiredControls || oRequiredControls.paginatorButtons){
						oPaginatorButtonsHelper = new PaginatorButtonsHelper(oControllerBase, oController, oTemplateUtils);
					}
					oViewProxy.getScrollFunction = function(aControlIds){
						var sControlId = oTemplateUtils.oCommonUtils.getPositionableControlId(aControlIds);
						return sControlId && oTemplateUtils.oCommonUtils.focusControl.bind(null, sControlId);
					};
				},
				handlers: {
					handleShowNextObject: handleShowNextObject,
					handleShowPrevObject: handleShowPrevObject,
					onShowMessages: onShowMessages,
					applyAndUp: fnApplyAndUp,
					onBack: fnOnBack
				},
				extensionAPI: {
					getNavigationControllerFunction: getNavigationControllerFunction,
					getTransactionControllerFunction: getTransactionControllerFunction
				},
				fclInfo: {
					isContainedInFCL: false	
				},
				state: {},
				onComponentActivate: function(sBindingPath, bIsComponentCurrentlyActive){
					if (oControllerBase.state.messageButtonHelper){
						oControllerBase.state.messageButtonHelper.adaptToContext(sBindingPath);
					}
					oTemplateUtils.oComponentUtils.setBackNavigation(fnOnBack);
					fnAdaptLinksToUpperLevels();
					// set visibility of up/down buttons
					if (oPaginatorButtonsHelper){
                        oPaginatorButtonsHelper.computeAndSetVisibleParamsForNavigationBtns();
					}
					oViewProxy.oStatePreserverPromise.then(function(oStatePreserver){
						oStatePreserver.applyAppState(sBindingPath, bIsComponentCurrentlyActive);
					});
				}
			};
			
			oViewProxy.navigateUp = fnNavigateUp;
			oViewProxy.setEditable = setEditable;
			oViewProxy.getMessageFilters = getMessageFilters;
			
			var oFclProxy = oTemplateUtils.oComponentUtils.getFclProxy();
			if (oFclProxy.oActionButtonHandlers){
				oControllerBase.handlers.fclActionButtonHandlers = oFclProxy.oActionButtonHandlers;
				oControllerBase.fclInfo.isContainedInFCL = true;
			}
			oControllerBase.stateChanged = function(){
				oViewProxy.oStatePreserverPromise.then(function(oStatePreserver){
					oStatePreserver.stateChanged();
				});
			};
			return oControllerBase;
		}
		
		return {
			getComponentBase: getComponentBase,
			getControllerBase: getControllerBase
		};
	});