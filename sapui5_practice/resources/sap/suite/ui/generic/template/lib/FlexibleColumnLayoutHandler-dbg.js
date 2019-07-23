sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "sap/f/FlexibleColumnLayoutSemanticHelper", "sap/f/library"],
	function(jQuery, BaseObject, FlexibleColumnLayoutSemanticHelper, fioriLibrary) {
		"use strict";

		// shortcut for sap.f.LayoutType
		var LayoutType = fioriLibrary.LayoutType;

		// routing helper is not part of sap.ui.define in order to avoid cyclic dependencies
		function onRoutingHelper(fnOnRoutingHelper){
			sap.ui.require(["sap/suite/ui/generic/template/lib/routingHelper"], fnOnRoutingHelper);
		}

		var oResolvedPromise = Promise.resolve(); // constant for a trivial resolved Promise

		var iDefaultColumn = 2;

		var aColumnNames = ["begin", "mid", "end"];

		var aMessagePageTargets = ["messagePageBeginColumn", "messagePageMidColumn", "messagePageEndColumn"];

		function tVL(iFCLLevel){
			return aColumnNames[iFCLLevel] ? iFCLLevel : iDefaultColumn;
		}

		function getPagesAggregation(iFCLLevel){
			return 	aColumnNames[tVL(iFCLLevel)] + "ColumnPages";
		}

		function createMessagePageTargets(fnCreateAdditionalMessageTarget){
			for (var i = 0; i < aColumnNames.length; i++){
				fnCreateAdditionalMessageTarget(aMessagePageTargets[i], getPagesAggregation(i));
			}
		}

		function getTargetForMessagePage(iViewLevel){
			return aMessagePageTargets[tVL(iViewLevel)];
		}

		function getColumnForFCLLevel(iFCLLevel){
			return 	aColumnNames[tVL(iFCLLevel)];
		}

		function getItemsArrayFromTable(oTable) {
			var aItems;
			if (oTable instanceof sap.ui.table.Table) {
				aItems = oTable.getRows();
			} else if (oTable instanceof sap.m.Table) {
				aItems = oTable.getItems();
			}
			return aItems;
		}

		function getFirstItemInTable(oTable) {
			// Returns the first item of the list which is not a grouping item. Returns a faulty value if list is empty.
			var aItems = getItemsArrayFromTable(oTable);
			var vRet = aItems ? aItems[0] : false;
			return vRet;
		}
		
		function getFCLLayoutFromStateObject(oStateObject){
			return (oStateObject && (jQuery.isArray(oStateObject.FCLLayout) ? oStateObject.FCLLayout.sort()[0] : oStateObject.FCLLayout)) || "";
		}

		function getMethods(oFlexibleColumnLayout, oNavigationControllerProxy) {
			var oManifestEntryGenricApp = oNavigationControllerProxy.oTemplateContract.oAppComponent.getConfig();
			var oFCLSettings = oManifestEntryGenricApp.settings.flexibleColumnLayout; // if this is not truthy the instance will not be created
			var oFlexibleColumnLayoutSemanticHelper = FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFlexibleColumnLayout, oFCLSettings);
			var oDefaultUiLayouts = oFlexibleColumnLayoutSemanticHelper.getDefaultLayouts();
			var oLastRoute;
			var oUiState;
			var sCurrentLayout;
			var sStoredTargetLayout;
			var iMessagePageColumn = -1;

			var oTemplateContract =	oNavigationControllerProxy.oTemplateContract;

			// it is possible to use the FCL with 3 columns which is the default. But you can also have 2 columns as maximum. Further views are displayed in fullscreen mode
			var iMaxColumnCountInFCL = sap.ui.Device.system.phone ? 1 : (oFCLSettings.maxColumnsCount || 3);

			// if this is true we trigger a search in list report on startup and load the first entry for the second column. This is basically the master/detail mode.
			var bLoadListAndFirstEntryOnStartup = iMaxColumnCountInFCL > 1 && oFCLSettings.initialColumnsCount === 2;

			// if this is true we load the next item in the second column after the current object is deleted. If this is false we close the column.
			var bDisplayNextObjectAfterDelete = oFCLSettings.displayNextObjectAfterDelete === true;

			function isMultipleColumn(oTreeNode){
				return oTreeNode.fCLLevel === 1 || oTreeNode.fCLLevel === 2 || (oTreeNode.level === 0 && bLoadListAndFirstEntryOnStartup);
			}

			function getPreferedColumnCount(oTreeNode){
				if (oTreeNode.fCLLevel === 3 || (oTreeNode.fCLLevel === 0 && oTreeNode.level > 0)) { // if oTreeNode.fCLLevel === oTreeNode.level === 0 we still have to consider initialColumnsCount
					return 1;
				}
				var initialColumnsCount = oFCLSettings.initialColumnsCount || 1;
				var iRet = Math.max(oTreeNode.fCLLevel + 1, initialColumnsCount);
				return sap.ui.Device.system.tablet && iRet > 2 ? 2 : iRet;
			}

			// Adapts the route and returns the control aggregation
			function fnAdaptRoutingInfo(oRoute, sTargetName, aPredecessorTargets, oTreeNode) {
				var iPreferedColumnCount = getPreferedColumnCount(oTreeNode);
				// Note: If oTreeNode.fCLLevel === 2 and iPreferredColumnCount === 2 (tablet case)
				// still all 3 columns should be available although only 2 of them will be visible at the same time.
				oRoute.showBeginColumn = oTreeNode.fCLLevel === 0 || iPreferedColumnCount > 1;
				oRoute.showMidColumn = oTreeNode.fCLLevel === 1 || iPreferedColumnCount > 1;
				oRoute.showEndColumn = oTreeNode.fCLLevel > 1;

				if (iPreferedColumnCount === 1){
					oRoute.target = sTargetName;
				} else if (oTreeNode.level === 0){ // master detail case
					oRoute.target = [sTargetName, oRoute.pages[0].entitySet];
				} else {
					oRoute.target = aPredecessorTargets.concat([sTargetName]);
				}

				return getPagesAggregation(oTreeNode.fCLLevel);
			}

			function isLayoutDefault(sLayout, sRoute){
				// temporary solution
				if (sLayout === LayoutType.OneColumn && bLoadListAndFirstEntryOnStartup){
					return false;
				}

				var oRouteConfig = sRoute && oTemplateContract.mRoutingTree[oNavigationControllerProxy.removeQueryInRouteName(sRoute)];
				var sDefaulLayout = oRouteConfig && oRouteConfig.defaultLayoutType;
				if (sDefaulLayout){
					return sLayout === sDefaulLayout;
				}
				return sLayout === oDefaultUiLayouts.defaultLayoutType || sLayout === oDefaultUiLayouts.defaultTwoColumnLayoutType || sLayout === oDefaultUiLayouts.defaultThreeColumnLayoutType;
			}

			function activateView(oActivationInfo, sPath, sRouteName) {
				var oPromise = oTemplateContract.mRouteToTemplateComponentPromise[sRouteName];
				if (oPromise) {
					return oPromise.then(function(oComponent) {
						return oNavigationControllerProxy.activateOneComponent(sPath, oActivationInfo, oComponent);
					});
				}
				return oResolvedPromise;
			}

			// Returns a Promise that resolves to an object that may have the following three attributes: begin, middle, end.
			// The availability of the attributes depends on the availability of the corresponding column according to the current view level.
			// Each of the attributes will be an object with the following attributes:
			// - route: Name of the route leading to the view in this column
			// - path: The OData path that this view should be bound to
			// - isVisible: The information whether this column is really visible
			// Note that this function relies on the fact that oLastRoute and oUiState already have been set correctly.
			function fnDetermineRoutesAndPathes(bForRoute){
				var fnPromise = function(fnResolve, fnReject){
					if (!oLastRoute){ //this is the case if this method is called before first route matched (due to resize)
						fnReject();
						return;
					}
					onRoutingHelper(function(routingHelper){
						var oRet = {};
						var sRoute = oNavigationControllerProxy.removeQueryInRouteName(oLastRoute.event.getParameter("config").name);
						var bPerformAnalysis = true;
						for (var oTreeNode = oTemplateContract.mRoutingTree[sRoute]; bPerformAnalysis; oTreeNode = oTemplateContract.mRoutingTree[oTreeNode.parentRoute]){
							var iFCLLevel = oTreeNode.fCLLevel;
							var sPar = getColumnForFCLLevel(iFCLLevel);
							oRet[sPar] = {
								route: oTreeNode.sRouteName,
								path: routingHelper.determinePath(oTreeNode, oLastRoute.event, bForRoute) || "",
								isVisible: iFCLLevel > 2 || oUiState.columnsVisibility[sPar + "Column"]
							};
							bPerformAnalysis = iFCLLevel === 1 || iFCLLevel === 2;
						}
						fnResolve(oRet);
					});
				};
				return new Promise(fnPromise);
			}

			function fnAdaptToRouteOrVisibilityChange(oActivationInfo, oVisibilityChanged){
				var oRoutesAndPathesPromise = fnDetermineRoutesAndPathes();
				return oRoutesAndPathesPromise.then(function(oRoutesAndPathes){
					var aActivationPromises = [];
					oVisibilityChanged = oVisibilityChanged || oRoutesAndPathes;
					for (var sColumn in oVisibilityChanged){
						var oColumnInfo = oRoutesAndPathes[sColumn];
						if (oColumnInfo.isVisible){
							aActivationPromises.push(activateView(oActivationInfo, oColumnInfo.path, oColumnInfo.route));
						} else {
							var iRouteLevel = oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/routeLevel");
							var oTreeNode = oTemplateContract.mRoutingTree[oColumnInfo.route];
							var iVisibility = (iRouteLevel === oTreeNode.level) ? 2 : (3 + isFullscreenLayout(sCurrentLayout));
							oNavigationControllerProxy.setVisibilityOfRoute(oColumnInfo.route, iVisibility);
						}
					}
					return Promise.all(aActivationPromises).then(oNavigationControllerProxy.afterActivation);
				});
			}

			function fnAdaptToVisibilityChange(oVisibilityChanged){
				var oActivationInfo = oNavigationControllerProxy.getActivationInfo();
				fnAdaptToRouteOrVisibilityChange(oActivationInfo, oVisibilityChanged);
			}

			function isVisuallyFullscreen(){
				return !(oUiState.columnsVisibility.beginColumn ? oUiState.columnsVisibility.midColumn :  oUiState.columnsVisibility.midColumn && oUiState.columnsVisibility.endColumn);
			}

			function fnAdaptLayout(bChangedRoute){
				var oNewUiState = oFlexibleColumnLayoutSemanticHelper.getCurrentUIState();
				var oVisibilityChanged = {};
				oVisibilityChanged.end = oUiState && (oUiState.columnsVisibility.endColumn !== oNewUiState.columnsVisibility.endColumn);
				oVisibilityChanged.mid = oUiState && (oUiState.columnsVisibility.midColumn !== oNewUiState.columnsVisibility.midColumn);
				oVisibilityChanged.begin = oUiState && (oUiState.columnsVisibility.beginColumn !== oNewUiState.columnsVisibility.beginColumn);
				oUiState = oNewUiState;

				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/midActionButtons", {
					fullScreen: oUiState.actionButtonsInfo.midColumn.fullScreen !== null,
					exitFullScreen: oUiState.actionButtonsInfo.midColumn.exitFullScreen !== null,
					closeColumn: oUiState.actionButtonsInfo.midColumn.closeColumn !== null
				});
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/endActionButtons", {
					fullScreen: oUiState.actionButtonsInfo.endColumn.fullScreen !== null,
					exitFullScreen: oUiState.actionButtonsInfo.endColumn.exitFullScreen !== null,
					closeColumn: oUiState.actionButtonsInfo.endColumn.closeColumn !== null
				});
				var oCurrentIdentity = oNavigationControllerProxy.getCurrentIdentity();
				var oCurrentTreeNode = oCurrentIdentity && oCurrentIdentity.treeNode;
				if (oCurrentIdentity){
					var bIsVisuallyFullscreen = isVisuallyFullscreen();
					var iHighestViewLevel = oCurrentTreeNode.level - (oCurrentTreeNode.fCLLevel === 2 && !oUiState.columnsVisibility.endColumn);
					var iLowestDetailViewLevel = iHighestViewLevel - (iHighestViewLevel > 1 && !bIsVisuallyFullscreen) - (oUiState.columnsVisibility.endColumn && oUiState.columnsVisibility.beginColumn && iHighestViewLevel > 2);				
					oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/isVisuallyFullScreen", bIsVisuallyFullscreen);
					oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/highestViewLevel", iHighestViewLevel);
					oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/lowestDetailViewLevel", iLowestDetailViewLevel);
				}
				if (oCurrentIdentity && sCurrentLayout !== oUiState.layout){
					var sLayoutInAppState = isLayoutDefault(oUiState.layout, oCurrentTreeNode.sRouteName) ? null : oUiState.layout;
					oNavigationControllerProxy.navigateByExchangingQueryParam("FCLLayout", sLayoutInAppState);
				} else if ((oVisibilityChanged.begin || oVisibilityChanged.mid || oVisibilityChanged.end) && !bChangedRoute){
					fnAdaptToVisibilityChange(oVisibilityChanged);
				}
			}

			function fnHandleBeforeRouteMatched(oEvent, oCurrentIdentity){
				oEvent = jQuery.extend({}, oEvent); // as this handler works partially asynchronous and events are pooled by UI5, we create a defensive copy
				var sRoute = oEvent.getParameter("name");
				oLastRoute = {
					name: sRoute,
					arguments: oEvent.getParameter("arguments"),
					event: oEvent
				};
				if (isMultipleColumn(oCurrentIdentity.treeNode)){
					sCurrentLayout = (getFCLLayoutFromStateObject(oCurrentIdentity.appStates)) || oCurrentIdentity.treeNode.defaultLayoutType;
					if (!sCurrentLayout){
						switch (oCurrentIdentity.treeNode.fCLLevel){
							case 0: // since isMultiColumn this means master detail mode
								var oColumnsVisibility = oFlexibleColumnLayoutSemanticHelper.getNextUIState(0).columnsVisibility;
								if (oColumnsVisibility.midColumn) { // normal case
									sCurrentLayout = oDefaultUiLayouts.defaultTwoColumnLayoutType;
								} else { // this is the case if we have a desktop browser in size S
									sCurrentLayout = oDefaultUiLayouts.defaultLayoutType;
									oNavigationControllerProxy.navigateByExchangingQueryParam("FCLLayout", sCurrentLayout);
								}
								break;
							case 1:
								sCurrentLayout = oDefaultUiLayouts.defaultTwoColumnLayoutType;
								break;
							case 2:
								sCurrentLayout = oDefaultUiLayouts.defaultThreeColumnLayoutType;
						}
					}
				} else {
					sCurrentLayout = oCurrentIdentity.treeNode.fCLLevel === 0 ? oDefaultUiLayouts.defaultLayoutType : LayoutType.EndColumnFullScreen;
				}
				oFlexibleColumnLayout.setLayout(sCurrentLayout);
			}

			// we expect oEvent to be a cloned version of UI5 event
			// if oActivationInfo is truthy this function returns a Promise that indicates when the context pathes have been set for the columns
			// if oActivationInfo is faulty this method is called within a state change (see NavigationController for details).
			// In this case the context pathes remain unchanged. However, still some state must be adjusted.
			function fnHandleRouteMatched(oEvent, oRouteConfig, sPath, oActivationInfo) {
				iMessagePageColumn = -1;

				oLastRoute.path = sPath;
				oLastRoute.routeConfig = oRouteConfig;

				if (oActivationInfo){
					fnAdaptLayout(true);
					return fnAdaptToRouteOrVisibilityChange(oActivationInfo);
				}
			}
			
			function getLayoutForTreeNode(sLayout, oTreeNode){
				return sLayout
					|| oTreeNode.defaultLayoutType
					|| oFlexibleColumnLayoutSemanticHelper.getNextUIState(oTreeNode.fCLLevel).layout;
			}

			function getAppStateFromLayout(sLayout, sRoute){
				return isLayoutDefault(sLayout, sRoute) ? {}  : {
					FCLLayout: [sLayout]
				};
			}

			function isFullscreenLayout(sLayout){
				return sLayout === LayoutType.EndColumnFullScreen || sLayout === LayoutType.MidColumnFullScreen;
			}
			
			function isHidingLayout(sLayout){
				return sLayout === LayoutType.ThreeColumnsBeginExpandedEndHidden || sLayout === LayoutType.ThreeColumnsMidExpandedEndHidden;
			}
			
			function addStatePromiseForTreeNode(oTreeNode, aKeys, aPromises, mAppStates){
				if (!oTreeNode.componentId){
					return;
				}
				var sPath = null; // to be improved?
				var oHelperPromise = oNavigationControllerProxy.getApplicableStateForComponentAddedPromise(oTreeNode.componentId, sPath, mAppStates);
				aPromises.push(oHelperPromise);
			}
			
			function getAppStatePromiseForTarget(oTargetNode, sTargetLayout, aKeys){
				var mAppStates = getAppStateFromLayout(sTargetLayout, oTargetNode.sRouteName);
				var aRet = [];
				if (!isHidingLayout(sTargetLayout)){
					addStatePromiseForTreeNode(oTargetNode, aKeys, aRet, mAppStates);
				}
				if (!isFullscreenLayout(sTargetLayout)){
					for (var oCurrentTreeNode = oTargetNode; oCurrentTreeNode.fCLLevel > 0;){
						oCurrentTreeNode = oTemplateContract.mRoutingTree[oCurrentTreeNode.parentRoute];
						addStatePromiseForTreeNode(oCurrentTreeNode, aKeys, aRet, mAppStates);
					}
				}
				return Promise.all(aRet).then(function(){
					return mAppStates;
				});
			}
			
			// oTreeNode represents an ancestor of the currently open column.
			// We want to close columns, so that the column for oTreeNode is the last column.
			// For that mAppStates must be filled.
			// The method returns a Promise which is resolved, when this has happened.
			function getAppStatesPromiseForColumnClose(oTreeNode, mAppStates){
				var sTargetLayout = oTreeNode.fCLLevel === 1 ? oUiState.actionButtonsInfo.endColumn.closeColumn : LayoutType.OneColumn;
				jQuery.extend(mAppStates, getAppStateFromLayout(sTargetLayout, oTreeNode.sRouteName));
				var aRet = [];
				for (var oNode = oTreeNode; oNode; oNode = oNode.fCLLevel && oTemplateContract.mRoutingTree[oNode.parentRoute]){
					aRet.push(oNavigationControllerProxy.addUrlParameterInfoForRoute(oNode.sRouteName, mAppStates));
				}
				return Promise.all(aRet);
			}
			
			function getFullscreenLayout(iViewLevel){
				if (iViewLevel === 0){
					return LayoutType.OneColumn;
				} else if (iViewLevel === 1){
					return LayoutType.MidColumnFullScreen;
				} else if (iViewLevel === 2){
					return LayoutType.EndColumnFullScreen;
				} else {
					return "";
				}
			}
			
			function getFCLAppStatesPromise(sRoute, oAppStates){
				var oTreeNode = oTemplateContract.mRoutingTree[sRoute];
				if (!isMultipleColumn(oTreeNode)) {
					return null;
				}
				var sNextUiLayout = getLayoutForTreeNode(sStoredTargetLayout, oTreeNode);
				jQuery.extend(oAppStates, getAppStateFromLayout(sNextUiLayout, sRoute));
				sStoredTargetLayout = null;
				if (isFullscreenLayout(sNextUiLayout)){
					return null;
				}
				var aRet = [];
				for (var i = oTreeNode.fCLLevel; i > 0; i--){
					var sCurrentRoute = oTreeNode.parentRoute;
					aRet.push(oNavigationControllerProxy.addUrlParameterInfoForRoute(sCurrentRoute, oAppStates));
					oTreeNode = oTemplateContract.mRoutingTree[sCurrentRoute];
				}
				return Promise.all(aRet);
			}
			
			// This function checks whether the two given identities are equivalent from the FCL layout perspective
			function areIdentitiesLayoutEquivalent(oHistoricIdentity, oNewIdentity){
				if (oHistoricIdentity.treeNode.fCLLevel === 0 ||  oHistoricIdentity.treeNode.fCLLevel === 3){
					return true;
				}
				var sHistoricLayout = getLayoutForTreeNode(getFCLLayoutFromStateObject(oHistoricIdentity.appStates), oHistoricIdentity.treeNode);
				var sNewLayout = getLayoutForTreeNode(getFCLLayoutFromStateObject(oNewIdentity.appStates), oNewIdentity.treeNode);
				return isFullscreenLayout(sHistoricLayout) === isFullscreenLayout(sNewLayout);
			}

			// Common Event Handlers fon FCL Action Buttons
			function onActionButtonPressed(oTreeNode, sActionName, bCloseColumn){
				oTemplateContract.oApplicationProxy.performAfterSideEffectExecution(function(){
					var sAffectedColumn = getColumnForFCLLevel(oTreeNode.fCLLevel);
					var sTargetLayout = oUiState.actionButtonsInfo[sAffectedColumn + "Column"][sActionName];
					var oTargetNode = bCloseColumn ? oTemplateContract.mRoutingTree[oTreeNode.parentRoute] : oTreeNode;
					var oCurrentIdentity = oNavigationControllerProxy.getCurrentIdentity();
					var oAppStatePromise = getAppStatePromiseForTarget(oTargetNode, sTargetLayout, oCurrentIdentity.keys);
					var oNavigatePromise = oAppStatePromise.then(function(mAppStates){
						oNavigationControllerProxy.navigateToIdentity({
							treeNode: oTargetNode,
							keys: (oTargetNode === oCurrentIdentity.treeNode) ? oCurrentIdentity.keys : oCurrentIdentity.keys.slice(0, oTargetNode.level + 1),
							appStates: mAppStates
						});                     	
					});
					oTemplateContract.oBusyHelper.setBusy(oNavigatePromise);
				}, true);				
			}

			function getActionButtonHandlers(oTreeNode) {
				return {
					onCloseColumnPressed: onActionButtonPressed.bind(null, oTreeNode, "closeColumn", true),
					onFullscreenColumnPressed: onActionButtonPressed.bind(null, oTreeNode, "fullScreen", false),
					onExitFullscreenColumnPressed: onActionButtonPressed.bind(null, oTreeNode, "exitFullScreen", false)					
				};
			}

			/******************************************
			 * end: Event Handlers for common FCL Action Buttons
			 *******************************************/

			oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL", { });

			// This function indicates if a new HistoryEntry is required.
			// A new HistoryEntry is only required if the user navigates to an object which will be displayed in a new column.
			// If the object will be displayed in a column which is already visible no HistoryEntry is required
			function isNewHistoryEntryRequired(oTarget){
				var oTargetTreeNode = oTemplateContract.mEntityTree[oTarget.entitySet];
				var oCurrentIdentity = oTemplateContract.oNavigationControllerProxy.getCurrentIdentity();
				var oCurrentNode = oCurrentIdentity.treeNode;
				return oTargetTreeNode.level > oCurrentNode.level;
			}

			function fnCloseRightColumns(iViewLevel) {
				sCurrentLayout = oFlexibleColumnLayoutSemanticHelper.getNextUIState(iViewLevel).layout;
				oFlexibleColumnLayout.setLayout(sCurrentLayout);
			}

			function isAppTitlePrefered(){
				return !isVisuallyFullscreen();
			}

			function fnDisplayMessagePage(mParameters, mComponentsDisplayed){
				var iFCLMessageLevel = 0;
				for (var sRoute in mComponentsDisplayed){
					var oTreeNode = oTemplateContract.mRoutingTree[sRoute];
					if (oTreeNode.level >= mParameters.viewLevel && mComponentsDisplayed[sRoute] === 1){
						if (oTreeNode.level === mParameters.viewLevel){
							iFCLMessageLevel = oTreeNode.fCLLevel;                         
						}
						mComponentsDisplayed[sRoute] = 5 + (oTreeNode.level > mParameters.viewLevel);
					}
				}
				iMessagePageColumn = tVL(iFCLMessageLevel);
				fnCloseRightColumns(iFCLMessageLevel);
				var oTargets = oNavigationControllerProxy.oRouter.getTargets();
				var sTarget = getTargetForMessagePage(iFCLMessageLevel);
				oTargets.display(sTarget);				
				
			}

			// Is the view on level iViewLevel displayed and is it not the MessagePage
			function isLevelActive(iViewLevel){
				if (iViewLevel < iMessagePageColumn || iMessagePageColumn < 0){
					return oUiState.columnsVisibility[getColumnForFCLLevel(iViewLevel) + "Column"];
				}
				return false;
			}

			function fnAdaptBreadCrumbUrlParameters(oAppStates, oTreeNode){
				if (!isMultipleColumn(oTreeNode)){
					return;
				}
				var sLayout = getFullscreenLayout(oTreeNode.level);
				if (isLayoutDefault(sLayout, oTreeNode.sRouteName)){
					return;
				}
				oAppStates.FCLLayout = [sLayout];
			}

			function getMaxColumnCountInFCL(){
				return iMaxColumnCountInFCL;
			}

			function handleListReceived(oItem, fnNavigateToItem){
				if (!bLoadListAndFirstEntryOnStartup) {
					return;
				}
				var bNavigateToFirstListItem = false;
				var oColumnsVisibility = oFlexibleColumnLayoutSemanticHelper.getNextUIState(0).columnsVisibility;
				if (oColumnsVisibility.midColumn) {
					var oCurrentIdentity = oNavigationControllerProxy.getCurrentIdentity();
					var oCurrentTreeNode = oCurrentIdentity && oCurrentIdentity.treeNode;
					bNavigateToFirstListItem = oCurrentTreeNode && oCurrentTreeNode.level === 0 && getFCLLayoutFromStateObject(oCurrentIdentity.appStates) !== LayoutType.OneColumn;
				}
				if (bNavigateToFirstListItem) {
					if (oItem) {
						fnNavigateToItem(oItem);
					} else { // closeSecondColumn
						oNavigationControllerProxy.navigateByExchangingQueryParam("FCLLayout", LayoutType.OneColumn);
					}
				}
			}

			function isNextObjectLoadedAfterDelete(){
				return bDisplayNextObjectAfterDelete;
			}

			function isListAndFirstEntryLoadedOnStartup(){
				return bLoadListAndFirstEntryOnStartup;
			}

			function handleDataReceived(oTable, fnNavigateToListItemProgrammatically) {
				 // then the list was refreshed or the app has been started
				var oItem = getFirstItemInTable(oTable);
				handleListReceived(oItem, fnNavigateToListItemProgrammatically);
			}

			function setStoredTargetLayoutToFullscreen(iLevel){
				if (iLevel > 2){
					sStoredTargetLayout = "";
				} else {
					sStoredTargetLayout = getFullscreenLayout(iLevel);
				}
			}

			function getFclProxy(oTreeNode) {
				var oRet = {};
				if (oTreeNode.fCLLevel === 1 || oTreeNode.fCLLevel === 2){
					oRet.oActionButtonHandlers = getActionButtonHandlers(oTreeNode);
				}
				if (oTreeNode.level === 0){
					oRet.handleDataReceived = (isListAndFirstEntryLoadedOnStartup && isListAndFirstEntryLoadedOnStartup()) ? handleDataReceived : jQuery.noop;
					oRet.isListAndFirstEntryLoadedOnStartup = isListAndFirstEntryLoadedOnStartup;
				}
				return oRet;
			}

			oFlexibleColumnLayout.attachStateChange(fnAdaptLayout.bind(null, false));

			return {
				adaptRoutingInfo: fnAdaptRoutingInfo,
				createMessagePageTargets: createMessagePageTargets,
				displayMessagePage: fnDisplayMessagePage,
				isLevelActive: isLevelActive,
				handleBeforeRouteMatched: fnHandleBeforeRouteMatched,
				handleRouteMatched: fnHandleRouteMatched,
				areIdentitiesLayoutEquivalent: areIdentitiesLayoutEquivalent,
				getAppStatesPromiseForColumnClose: getAppStatesPromiseForColumnClose,
				getFCLAppStatesPromise: getFCLAppStatesPromise,
				isNewHistoryEntryRequired: isNewHistoryEntryRequired,
				adaptBreadCrumbUrlParameters: fnAdaptBreadCrumbUrlParameters,
				isAppTitlePrefered: isAppTitlePrefered,
				getFullscreenLayout: getFullscreenLayout,
				getMaxColumnCountInFCL: getMaxColumnCountInFCL,
				isNextObjectLoadedAfterDelete: isNextObjectLoadedAfterDelete,
				getFclProxy: getFclProxy,
				isListAndFirstEntryLoadedOnStartup: isListAndFirstEntryLoadedOnStartup,
				setStoredTargetLayoutToFullscreen:setStoredTargetLayoutToFullscreen
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.lib.FlexibleColumnLayoutHandler", {
			constructor: function(oFlexibleColumnLayout, oNavigationControllerProxy) {
				jQuery.extend(this, getMethods(oFlexibleColumnLayout, oNavigationControllerProxy));
			}
		});
	});
