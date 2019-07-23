sap.ui.define(["jquery.sap.global",
	"sap/ui/base/Object",
	"sap/suite/ui/generic/template/ListReport/controller/MultipleViewsSingleTableModeHelper",
	"sap/suite/ui/generic/template/ListReport/controller/MultipleViewsMultipleTablesModeHelper",
	"sap/ui/model/Filter",
	"sap/suite/ui/generic/template/lib/testableHelper",
	"sap/base/Log"
], function(jQuery, BaseObject, MultiViewsSingleTableHelper, MultiViewsMultiTablesHelper, Filter, testableHelper, Log) {
		"use strict";

		/*
		 * This helper class handles multiple views in the List Report.
		 * It is a wrapper for MultipleViewsMultipleTablesModeHelper and MultipleViewSingleTableModeHelper
		 * this class is created in onInit of the ListReport controller.

		 *  That controller forwards all tasks
		 * connected to the single table mode of the multiple views feature to this instance.
		 * The mode can be switched on and configured via the quickVariantSelection.variants section in the manifest.
		 *
		 */

		// constants
		// This class uses a section in the template private model to transfer information between javascript and UI.
		// The following constants represent the pathes in the model that are used to access this information
		var PATH_TO_PROPERTIES = "/listReport/multipleViews"; // root path for all properties used for this feature
		var PATH_TO_SELECTED_KEY = PATH_TO_PROPERTIES + "/selectedKey"; // path to the key of the currently active view
		var PATH_TO_MODE = PATH_TO_PROPERTIES + "/mode";  // path to either "single" or "multiple"
		var PATH_TO_ITEMS = PATH_TO_PROPERTIES + "/items";
		// These data are needed by formatter formatItemTextForMultipleView to determine the text (including counts) for this item
		// Therefore, this map is only created when the showCounts property is set. In this case the item data contain the following properties:
		// text: The fixed text belonging to this item
		// count: Current count of this item
		// state: possible values are "" = count can be used, "busy" = count is currently being determined, "error" = error happened when determining the count

		// helper for setText - should become obsolete, when customData is not needed any more 
		function fnSetPropertyBindingInternalType(oBinding, sInternalType) {
			if (oBinding.getBindings) { // composite Binding
				var aBindings = oBinding.getBindings();
				for (var i = 0; i < aBindings.length; i++) {
					fnSetPropertyBindingInternalType(aBindings[i], sInternalType);
				}
			} else {
				var oType = oBinding.getType();
				oBinding.setType(oType, sInternalType);
			}
		}
		
		// oState is used as a channel to transfer data to the controller and back.
		// oController is the controller of the enclosing ListReport
		// oTemplateUtils are the template utils as passed to the controller implementation
		function getMethods(oState, oController, oTemplateUtils) {
			// Begin: Instance variables
			var oImplementingHelper;
			var oQuickVariantSelectionEffective;
			var sMode;
			var bShowCounts;
			var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel(); // the template private model used to transfer data between javascript and UI
			// Variables representing the current state
			var mItemData; // maps the keys of the items onto metadata of the corresponding views used in this class. The metadata contains the following properties:
			// selectionVariantFilters: The filters valid for this item
			// templateSortOrder: the sort order used for this item
			// implementingControl: The control (smart table or chart) implementing the view
			// entitySet: The entity set handled by this view
			// the following properties are only available when the showCounts property is set:
			// numberOfUpdates: a counter increased for each call request that is performed for updating the text for this item. Used to identify outdated requests.
			// updateStartFunction, updateSuccessFunction, errorFunction: functions to be called, when the update of counters is started, has entered successfully, has run into an error
			//         each of these function gets the value of numberOfUpdates valid when the update is started as first parameter
			//         updateSuccessFunction gets the count that was retrieved as second parameter
			// dirtyState: 0 = ok, 1 = needs rebind, 2 = needs refresh, 3 = needs both
			// The following additional properties are only added in the MultipleTable case (by the ImplementingHelper):
			// id: id of implementing control
			// only in multiple entityType case: entitySet, properties

			var iDefaultDelayMs = oTemplateUtils.oServices.oApplication.getBusyHelper().getBusyDelay();
			// End: Instance variables

			// Begin private instance methods
			
			function getEnableAutoBinding(){
				return oQuickVariantSelectionEffective && oQuickVariantSelectionEffective.enableAutoBinding;
			}

			function fnRegisterToChartEvents() {
				if (oImplementingHelper && oImplementingHelper.fnRegisterToChartEvents) {
					return oImplementingHelper.fnRegisterToChartEvents.apply(null, arguments);
				}
			}

			function onDetailsActionPress() {
				if (oImplementingHelper && oImplementingHelper.onDetailsActionPress) {
					return oImplementingHelper.onDetailsActionPress.apply(null, arguments);
				}
			}

			// callback called in onBeforeRebindTable
			// called to provide sort order information of the smart table
			function fnDetermineSortOrder() {
				if (!oImplementingHelper) {
					return;
				}
				var oItemData = getCurrentItemData(); // get metadata of selected item
				return oItemData.templateSortOrder;
			}

			// formatter for the text on the items (only used when showCounts is switched on)
			// oItemDataModel: current data for the item as described in the comment for PATH_TO_ITEMS
			// returns the text to be used for the item
			function formatItemTextForMultipleView(oItemDataModel) {
				var sFormatedValue;
				if (!oItemDataModel) {
					return "";
				}
				if (oItemDataModel.state === "error") {
					return oTemplateUtils.oCommonUtils.getText("SEG_BUTTON_ERROR", oItemDataModel.text); // originally the text was for segmented button only but is now used for all texts with multiple views
				}
				if (oItemDataModel.state === "" || oItemDataModel.state === "busy") {
					var oIntegerInstance = sap.ui.core.format.NumberFormat.getIntegerInstance({
						groupingEnabled: true
					});
					sFormatedValue = oIntegerInstance.format(oItemDataModel.count);
				}
				return oTemplateUtils.oCommonUtils.getText("SEG_BUTTON_TEXT", [oItemDataModel.text, oItemDataModel.state === "busyLong" ? "..." : sFormatedValue]); // // originally the text was for segmented button only but is now used for all texts with multiple views
			}

			function getContentForIappState() {
				if (oImplementingHelper) {
					var sSelectedKey = oTemplatePrivateModel.getProperty(PATH_TO_SELECTED_KEY);
					var oTableState = oImplementingHelper.getContentForIappState(sSelectedKey);
					return {
						mode: sMode,
						state: oTableState
					};
				}
			}

			function fnRestoreFromIappState(oGenericData) {
				if (oImplementingHelper) {
					var sSelectedKey = oImplementingHelper.getSelectedKeyAndRestoreFromIappState(oGenericData);
					if (mItemData[sSelectedKey]){
						oTemplatePrivateModel.setProperty(PATH_TO_SELECTED_KEY, sSelectedKey);
					}
				}
			}

			function fnSetControlVariant(sChartVariantId, sTableVariantId, sPageVariantId){
				if (oImplementingHelper) {
					oImplementingHelper.setControlVariant && oImplementingHelper.setControlVariant(sChartVariantId, sTableVariantId, sPageVariantId);
				}
			}
			// get the key of the currently selected item
			function getVariantSelectionKey() {
				return oTemplatePrivateModel.getProperty(PATH_TO_SELECTED_KEY);
			}
			
			function getSelectionVariantFilters(oEntityType, oCustomDataParent) {
				var aSelectionVariantFilters = [], oSelectionVariantPath;
				var sSelectionVariantPath = oTemplateUtils.oCommonUtils.getElementCustomData(oCustomDataParent).variantAnnotationPath;
				if (sSelectionVariantPath) {
					var oVariant = oEntityType[sSelectionVariantPath];
					if (!oVariant) {
						return [];
					}
					if (!oVariant.SelectOptions && oVariant.SelectionVariant) {
						// for SelectionPresentationVariants, make sure to refer to SelectionVariant
						oVariant = oVariant.SelectionVariant;
						if (oVariant.Path) {
							// resolve reference to SelectionVariant via path
							sSelectionVariantPath = oVariant.Path.split("@")[1];
							oVariant = sSelectionVariantPath && oEntityType[sSelectionVariantPath];
						}
					}
					if (oVariant.AnnotationPath) {
						oSelectionVariantPath = oVariant.AnnotationPath.split("@")[1];
						oVariant = oEntityType[oSelectionVariantPath];
					}
					for (var i in oVariant.SelectOptions) {
						if (oVariant.SelectOptions[i].PropertyName) {
							var sPath = oVariant.SelectOptions[i].PropertyName.PropertyPath;
							for (var j in oVariant.SelectOptions[i].Ranges) {
								var oOperator = oVariant.SelectOptions[i].Ranges[j].Option;
								oOperator.EnumMember = oOperator.EnumMember.replace("com.sap.vocabularies.UI.v1.SelectionRangeOptionType/", "");
								var oValueLow = oVariant.SelectOptions[i].Ranges[j].Low;
								var oValueHigh = oVariant.SelectOptions[i].Ranges[j].High;
								var sKeyLow = Object.keys(oValueLow)[0];
								if (oValueHigh) {
									var sKeyHigh = Object.keys(oValueHigh)[0];
									aSelectionVariantFilters.push(new Filter(sPath, oOperator.EnumMember, oValueLow[sKeyLow], oValueHigh[sKeyHigh]));
								} else {
									aSelectionVariantFilters.push(new Filter(sPath, oOperator.EnumMember, oValueLow[sKeyLow]));
								}
							}
						}
					}
				}
				return aSelectionVariantFilters;
			}
			
			// set text for the selection
			// workaround, as binding for custom data is not evaluated in time
			// in the long run, using custom data should not be necessary at all
			function setText(oControl, sPathToTheItem){
				// Loop over customData and attach changeHandler (if necesary)
				oControl.getCustomData().forEach(function(oCustomDataElement) {
					var sKey = oCustomDataElement.getKey();
					if (sKey === "text") { // only property interested in here
						var oBinding = oCustomDataElement.getBinding("value");
						// UI5 does not guarantee the binding to be already available at this point in time.
						// If the binding is not available, we access the binding info as a fallback
						var oBindingInfo = !oBinding && oCustomDataElement.getBindingInfo("value");
						if (!oBinding && !oBindingInfo) { // constant -> No change handler needed, but the value must be transfered to the template private model once
							var oModelEntry = jQuery.extend({}, oTemplatePrivateModel.getProperty(sPathToTheItem));
							oModelEntry.text = oCustomDataElement.getValue();
							oTemplatePrivateModel.setProperty(sPathToTheItem, oModelEntry);
							return; // done
						}
						var fnChangeHandler = function(oEvent) { // the change handler which will be applied to the property binding
							var oBinding = oEvent.getSource();
							var oModelEntry = jQuery.extend({}, oTemplatePrivateModel.getProperty(sPathToTheItem));
							oModelEntry.text = oBinding.getExternalValue();
							oTemplatePrivateModel.setProperty(sPathToTheItem, oModelEntry);
						}; // Now we have the change handler

						// Moreover, the internal type of the binding must be changed from "any" (default for the value-property of the CustomData) to "string"
						if (oBinding) { // If the binding is already available we attach the change handler to the binding
							oBinding.attachChangeOnce(fnChangeHandler);
							fnSetPropertyBindingInternalType(oBinding, "string");
						} else { // otherwise the binding info will be enhanced accordingly -> binding will already be created with the corresponding change-handler
							oBindingInfo.events = {
								change: fnChangeHandler
							};
							for (var i = 0; i < oBindingInfo.parts.length; i++) {
								oBindingInfo.parts[i].targetType = "string";
							}
						}
					}
				});
			}
			
			function setModelDataForItem(sKey, oControl, sEntitySet) {
				var oMetaModel = oController.getOwnerComponent().getModel().getMetaModel();
				var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
				var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);				
					
					var aSelectionVariantFilters = getSelectionVariantFilters(oEntityType, oControl);
					var oCustomData = oTemplateUtils.oCommonUtils.getElementCustomData(oControl); // retrieve custom data for this table
					// ImplementingHelper might already have initialized the item data for this key. In this case enhance them, otherwise create them.
					var oItemData = mItemData[sKey] || Object.create(null);
					oItemData.selectionVariantFilters = aSelectionVariantFilters;
					oItemData.templateSortOrder = oCustomData.TemplateSortOrder;
					oItemData.implementingControl = oControl;
					oItemData.entitySet = sEntitySet;
					oItemData.dirtyState = 0;
					mItemData[sKey] = oItemData;
					if (bShowCounts) {
						var sPathToTheItem = PATH_TO_ITEMS + "/" + sKey;
						// sState can be "busy" (start of determination of counts), "busyLong" (determination of counts lasts longer than 1000ms), "" (determination was finished successfully), "error" (determination failed)
						// iNumberOfUpdates is the identification of the backend call
						// iNewCount is the newly determined count (only valid when sState is "")
						var fnUpdateFunction = function(sState, iNumberOfUpdates, iNewCount) {
							if (oItemData.numberOfUpdates !== iNumberOfUpdates) { // this is the response for an outdated request
								return;
							}
							var oModelEntry = jQuery.extend({}, oTemplatePrivateModel.getProperty(sPathToTheItem)); // must create a new instance. Otherwise UI5 will not recognize the change
							if (!oModelEntry.state && sState == "busy") {
								setTimeout(function() {
									if (oTemplatePrivateModel.getProperty(sPathToTheItem).state === "busy") {
										oModelEntry = jQuery.extend({}, oTemplatePrivateModel.getProperty(sPathToTheItem)); // must create a new instance. Otherwise UI5 will not recognize the change
										oModelEntry.state = "busyLong";
										oTemplatePrivateModel.setProperty(sPathToTheItem, oModelEntry); // Note that this will trigger the call of formatItemTextForMultipleView
									}
								}, iDefaultDelayMs);
							}
							oModelEntry.state = sState; // update the state
							if (!sState) { // determination was successfull -> update the count
								oModelEntry.count = iNewCount;
							}
							oTemplatePrivateModel.setProperty(sPathToTheItem, oModelEntry); // Note that this will trigger the call of formatItemTextForMultipleView
						};
						oItemData.numberOfUpdates = 0;
						oItemData.updateStartFunction = fnUpdateFunction.bind(null, "busy");
						oItemData.updateSuccessFunction = fnUpdateFunction.bind(null, "");
						oItemData.errorFunction = fnUpdateFunction.bind(null, "error");
						var oModelEntry = {
//							text: oCustomData.text,     // text will be set later with setText method as binding for customData might not be evaluated at this point in time
							count: 0, // at initialization 0 will be displayed as counter everywhere
							state: ""
						};
						oTemplatePrivateModel.setProperty(sPathToTheItem, oModelEntry);
						setText(oControl, sPathToTheItem);
					}
				}

			function getMode() {
				return sMode;
			}

			// get metadata of the currently selected item
			function getCurrentItemData() {
				return mItemData[oTemplatePrivateModel.getProperty(PATH_TO_SELECTED_KEY)]; // return metadata of selected item
			}

			// callback called by onBeforeRebindTable of the smart table
			// add filters of the selected item to the search condition
			function onRebindContentControl(oEvent) {
				if (!oImplementingHelper) {
					return;
				}
				var oBindingParams = oEvent.getParameter("bindingParams");
				oState.oFiltersWithoutSmartFilterBar = jQuery.extend(true, {}, oBindingParams);
				// in Multi table mode we have to add the smartFilterbar values; for single table mode the values are set directly by SmartFilterbar so no need to add them here
				if (getMode() === "multi") {
					var aSmartFilterBarValues = oState.oSmartFilterbar.getFilters();
					// remember the custom filter without SmartFilterBar values, they will be used for updating counts in fnUpdateCounts
					oState.oFiltersForCounts = fnPrepareFiltersForCounts(oBindingParams);
					fnAdaptFilters(oState.oSmartTable, oBindingParams, aSmartFilterBarValues);
				} else if (getMode() === "single") {
					oState.oFiltersForCounts = jQuery.extend(true, {}, oBindingParams);
				}
				fnAddFiltersFromSelectionVariant(oBindingParams);
			}

			function fnAddFiltersFromSelectionVariant(oBindingParams) {
				var oItemData = getCurrentItemData(); // get metadata of selected item
				if (oItemData) {
					var aSelectionVariantFilters = oItemData.selectionVariantFilters;
					for (var i in aSelectionVariantFilters) { // add the filters of the selected item
						oBindingParams.filters.push(aSelectionVariantFilters[i]);
					}
				}
			}

			/* creates a deep copy of filters and removes those filters which were set directly on the table (via Settings/filters)
			 * as they should not be considered for the counts, also not for the currently visible tab ( according to the UX specification)
			 * oFilters should contain the custom filters( if any, they are set in oController.onBeforeRebindTableExtension) and values for the field "EditState" of the SmarFilterbar if set ( see setEditStateFilter in CommonEventHandler.js)
			 */
			function fnPrepareFiltersForCounts(oBindingParams){
				var oFilters = jQuery.extend(true, {}, oBindingParams);
				fnRemoveTableSettingsFromFilters(oFilters.filters, oState.oMultipleViewsHandler.aTableFilters);
				return oFilters;
			}

			function fnRemoveTableSettingsFromFilters(aFiltersToBeRemovedFrom, aFiltersToBeRemoved) {
				for (var i in aFiltersToBeRemoved) {
					var oFilterToBeRemoved = aFiltersToBeRemoved[i];
					for (var j = aFiltersToBeRemovedFrom.length; j--; j >= 0) {
						if (JSON.stringify(aFiltersToBeRemovedFrom[j]) === JSON.stringify(oFilterToBeRemoved)) {
							aFiltersToBeRemovedFrom.splice(j, 1);
							break;
						}
					}
				}
			}

			/* Triggers update of the texts on all items
			 * oState.oFiltersForCounts contains editing status and custom filters if any
			 */
			function fnUpdateCounts() {
				var oModel = oState.oSmartTable.getModel();
				var aFilters = [], sTableEntitySet, sTableOrChartBindingPath;
				var sSearchValue = oState.oSmartFilterbar.getBasicSearchValue();
				var oSearch = {};
				var aSmartFilterBarValues;
				var oSmartControl = oState.oSmartTable;
				var oSelectedControl = mItemData[oTemplatePrivateModel.getProperty(PATH_TO_SELECTED_KEY)];
				if (sSearchValue) {
					oSearch = {
						search: sSearchValue
					};
				}
				var aFiltersTemp;
				for (var sKey in mItemData) { // loop over all items
					aFiltersTemp = jQuery.extend(true, {}, oState.oFiltersForCounts); // oState.oFiltersForCounts contains "editing status" and custom filters if any
				//	var aSmartFilterBarValuesCopy = jQuery.extend(true, [], aSmartFilterBarValues); // tried to avoid fetching filters each time but the deep copying here seems to have side effects so that aSmartFilterBarValues gets modified when aSmartFilterBarValuesCopy is modified
					aSmartFilterBarValues = oState.oSmartFilterbar.getFilters(); // get filters from SmartFilterbar;
					var oItemData = mItemData[sKey]; // get metadata for this item
					sTableEntitySet = oItemData.entitySet;
					if (!sTableEntitySet) {
						sTableEntitySet = oState.oSmartTable.getEntitySet();
					}
					sTableOrChartBindingPath = typeof oState.oSmartTable.getTableBindingPath === "function" ? oState.oSmartTable.getTableBindingPath() : oState.oSmartTable.getChartBindingPath();
					oItemData.numberOfUpdates++; // start a new update call
					oItemData.updateStartFunction(oItemData.numberOfUpdates); // set counter busy
					if (getMode() === "multi") { // it is multiple views mode, both with one or several entity sets
						fnAdaptFilters(oItemData.implementingControl, aFiltersTemp, aSmartFilterBarValues);
					}
					aFilters = aFiltersTemp.filters.concat(oItemData.selectionVariantFilters); // note, that this does not modify the arrays which are concatenated
					/*
					In case of list report tables/charts with a parameterized entity sets, the count call would not have parameters added to the path.
					getTableBindingPath/getChartBindingPath should be used in such cases. However, getTableBindingPath/getChartBindingPath = "" if it's not a parameterized entityset.
					Hence, the fallback to pass just the entity set as path in the count call below.
					*/
					var sPathWithOrWithoutParams = sTableOrChartBindingPath !== "" ? sTableOrChartBindingPath : "/" + sTableEntitySet;

					oModel.read(sPathWithOrWithoutParams + "/$count", {
						urlParameters: oSearch,
						filters: aFilters,
						groupId: "updateMultipleViewsItemsCounts", // send the requests for all count updates in one batch request
						success: oItemData.updateSuccessFunction.bind(null, oItemData.numberOfUpdates), // bind the success handler to the current request
						error: oItemData.errorFunction.bind(null, oItemData.numberOfUpdates) // bind the error handler to the current request
					});
				}
				// display or hide the message related to filters in case of different entity sets
				if (oSelectedControl && oSelectedControl.entitySet === oSmartControl.getEntitySet() && (oSelectedControl.implementingControl.getMetadata().getElementName() === oSmartControl.getMetadata().getElementName())) {
					if (oImplementingHelper && oImplementingHelper.fnCheckForMessageDisplay && oImplementingHelper.fnGetNotAppliedFilter) {
						var aUnAppliedFilter = oImplementingHelper.fnGetNotAppliedFilter();
						oImplementingHelper.fnCheckForMessageDisplay(aUnAppliedFilter);
					}
				}
			}

			/*
			 * checks if "editing status" and custom filters contained in aFilters are supported by the entity set; it is only relevant for the different entity set case
			 * adds filters from aSmartFilterBarValues to aFilters, in case if different entity sets it is checked if the filters are supported by the entity set
			 * oSmartControl can be either a SmartTable or a SmartChart
			 * aFilters contains "editing status" filter and custom filters
			 * aSmartFilterBarValues contains filters to be added to aFilters
			 */
			function fnAdaptFilters(oSmartControl, aFilters, aSmartFilterBarValues) {
				// add SmartFilterBar values if applicable for the entitySet
				fnAddFiltersFromSmartFilterbar(oSmartControl, aSmartFilterBarValues, aFilters);
			}

			function onDataRequested() {
				if (bShowCounts) {
					fnUpdateCounts();
				}
			}

			function getShowCounts() {
				return bShowCounts;
			}

			/*
			 * gets navigation properties for the entityType of a oSmartControl
			 * oSmartControl can be either a SmartTable or a SmartChart
			 */
			function getEntityTypeNavProperties(oSmartControl) {
				var oEntityType = oTemplateUtils.oCommonUtils.getMetaModelEntityType(oSmartControl);
				return oEntityType.navigationProperty;
			}

			/*
			 * relevant for the case with multiple table tabs ( charts)
			 * adds values from the SmartFilterbar
			 * oSmartControl is either a SmartTable or a SmartChart
			 * aFilterValues are SmartFilterbar values, we make a deep copy inside the method so that aFilterValues is not changed
			 * oBindingParams is an object containing a property 'filters'. At the beginning it can contain the filter values form the editing status and custom filters.
			 *  it will get fields from the SmartFilterbar which are supported ( this check is only done in case of different entity sets
			 */
			function fnAddFiltersFromSmartFilterbar(oSmartControl, aFilterValues, oBindingParams) {
				var aFilters = [], aCombinedFilters = [], oFilter;
				if (aFilterValues.length < 1) {
					return;
				}

				aFilters = fnCleanupIrrelevantFilters(oSmartControl, aFilterValues);
				aCombinedFilters = oBindingParams.filters && oBindingParams.filters.slice();

				aCombinedFilters = aCombinedFilters.concat(aFilters);
				oFilter = new Filter(aCombinedFilters, true);
				oBindingParams.filters = [oFilter];
			}

			/*
			 * function returns all entity set properties of the relevant control (oControl)
			 */
			function findEntityProperties(oControl) {
				var sKey;
				for (sKey in mItemData) {
					if (mItemData[sKey].implementingControl === oControl) {
						return mItemData[sKey].properties;
					}
				}
			}

			/*
			 * function returns all entity set properties to the given path
			 * the path can be just a property name, then the properties of the current entity set are returned
			 * the path can be a navigation property like navProp1/navProp2/navProp3/.../property
			 */
			function getEntityTypePropertiesOfPath(sPath, oSmartControl, oMetaModel, oEntityType, aNavProperties) {
				var aParts, sNavProperty, bFound, oAssociationEnd, aEntityProperties;
				if (sPath.indexOf("/") !== -1) { // sPath contains at least one navigation property
					aParts = sPath.split("/");
					for (var i = 0; i < aParts.length - 1; i++) { // loop over the navigation properties, the last element of the aParts is the property name so do not consider it
						sNavProperty = aParts[i];
						for (var i in aNavProperties) {
							if (aNavProperties[i].name === sNavProperty) {
								bFound = true;
								break;
							}
						}
						if (!bFound) {
							return false; // the navigation property is not present in the current entity type so no need to check further
						}
						oAssociationEnd = oMetaModel.getODataAssociationEnd(oEntityType, sNavProperty);
						oEntityType = oAssociationEnd && oMetaModel.getODataEntityType(oAssociationEnd.type);
						aNavProperties = oEntityType && oEntityType.navigationProperty;
					}
					aEntityProperties = oEntityType && oEntityType.property;
				} else {
					aEntityProperties = findEntityProperties(oSmartControl);
				}
				return aEntityProperties;
			}

			/*
			 * returns the property name of the path
			 * the path can be a simple one like 'adress' or contain navigation properties like 'adress/street'
			 */
			function getPropertyName(sPath) {
				var aParts, sPropertyName;
				if (sPath.indexOf("/") !== -1) { // sPath contains at least one navigation property
					aParts = sPath.split("/");
					sPropertyName = aParts.pop(); // the last one will be the property name
				} else {
					sPropertyName = sPath;
				}
				return sPropertyName;
			}
			
			// iRequest: 1 = rebind, 2 = refresh, 3 = both
			function fnRefreshOperationOnCurrentSmartControl(iRequest){
				var bIsSmartTable = oTemplateUtils.oCommonUtils.isSmartTable(oState.oSmartTable);
				if (iRequest !== 2){ // rebind needed
					oState.oSmartTable[bIsSmartTable ? "rebindTable" : "rebindChart"]();	
				}
				if (iRequest > 1){ // refresh needed
					if (bIsSmartTable){
						oTemplateUtils.oCommonUtils.refreshModel(oState.oSmartTable);
						oTemplateUtils.oCommonUtils.refreshSmartTable(oState.oSmartTable);
					} else {
						// todo ?
					}
				}
			}
			
			// Perform a refresh operation (refresh or rebind) on a subset of the given tabs.
			// Only performs the action if multiple views are active. Then it returns true.
			// Otherwise it returns false.
			// iRequest: 1 = rebind, 2 = refresh, 3 = both
			// vTabKey: If it is truthy, then it is either a tab key or an array of tab keys. In this case only the specified tab keys are affected.
			// mEntitySets: Only considered when vTabKey is faulty. Then, if mEntitySets is truthy it is expected to be a map that has entity sets as keys.
			//              Only those tabs are affected by this call that are bound to an entity set that is mapped onto a truthy value in this map.
			// If vTabKey and mEntitySets are both faulty, all tabs are affected
			function fnRefreshOperation(iRequest, vTabKey, mEntitySets){
				if (!oImplementingHelper){
					return false;
				}
				var bIsTabKeyArray = Array.isArray(vTabKey);
				if ((bIsTabKeyArray && vTabKey.length === 0) || (mEntitySets && jQuery.isEmptyObject(mEntitySets))){
					return true;
				}
				var sCurrentKey = getVariantSelectionKey();
				var bIsComponentVisible = oTemplateUtils.oComponentUtils.isComponentActive();                         
				if (sMode === "single"){
					if (bIsTabKeyArray ? vTabKey.indexOf(sCurrentKey) < 0 : (vTabKey && vTabKey !== sCurrentKey)){
						return true; // refresh only required for a non-visible tab. This will happen anyway, when changing to this tab
					}
					if (bIsComponentVisible){
						fnRefreshOperationOnCurrentSmartControl(iRequest);
						return true;
					} else {
						vTabKey = sCurrentKey;
						bIsTabKeyArray = false;
					}
				}
				// The function which performs the refresh operation for one tab (specified by sKey)
				var fnRefreshOperationOnKey = function(sKey){
					if (sKey === sCurrentKey && bIsComponentVisible){ // if the tab is currently visible perform the operation immediately 
						fnRefreshOperationOnCurrentSmartControl(iRequest);
						return;
					}
					// If the tab is currently not visible refresh its dirty state
					var oItemData = mItemData[sKey];
					if (oItemData.dirtyState > 0 && oItemData.dirtyState !== iRequest){
						oItemData.dirtyState = 3;
					} else {
						oItemData.dirtyState = iRequest;
					}
				};
				// Now determine all tabs for which fnRefreshOperationKey needs to be executed
				if (vTabKey){
					if (bIsTabKeyArray){
						vTabKey.forEach(fnRefreshOperationOnKey);
						return true;
					}
					fnRefreshOperationOnKey(vTabKey);
					return true;
				}
				for (var sKey in mItemData){
					if (!mEntitySets || mEntitySets[mItemData[sKey].implementingControl.getEntitySet()]){
						fnRefreshOperationOnKey(sKey);
					}
				}
				return true;
			}

			// Method is called in case of multi mode. Filters which are not part of the current entity (in case multiple entity set)
			// or in case the property in the entity type has a ui.hidden property set to true, value should not be passed to the filter
			// @param {Object} oSmartControl - SmartControl (Table/Chart) in the current context
			// @param {Array} aFilterValues - Array of filters retrieved from smart filter bar
			// @return {Array} - It returns a new array ( deep copy) containing only the filter values from the SmartFilterbar relevant
			// for the entitytype of oSmartControl which are not ui.hidden.
			function fnCleanupIrrelevantFilters(oSmartControl, aFilterValues) {
				var aEntityProperties, bFound, sFilterName, j, aPreparedFilters, aNavProperties, oMetaModel, oEntityType, aFilterValuesCopy, sFilterPropertyName, aFilterValuesCopy, oSelectedControl, aUnAppliedFilterTemp = [];
				if (!aFilterValues || aFilterValues.length < 1) {
					return;
				}
				oMetaModel = oSmartControl.getModel().getMetaModel();
				oEntityType = oTemplateUtils.oCommonUtils.getMetaModelEntityType(oSmartControl);
				aNavProperties = getEntityTypeNavProperties(oSmartControl);
				oSelectedControl = mItemData[oTemplatePrivateModel.getProperty(PATH_TO_SELECTED_KEY)];

				aFilterValuesCopy = jQuery.extend(true, [], aFilterValues); // we make a copy so that we do not modify aFilterValues

				if (aFilterValuesCopy[0] && aFilterValuesCopy[0].aFilters instanceof Array) {
					aPreparedFilters = aFilterValuesCopy[0].aFilters;
				} else {
					aPreparedFilters = aFilterValuesCopy;
				}

				if (!aPreparedFilters) {
					return;
				}
				for (j = aPreparedFilters.length - 1; j >= 0; j--) {
					bFound = false;
					if (aPreparedFilters[j].aFilters instanceof Array) {
						// complete check of filter tree seems not to be necessary since only filters one step below of the top most element can be  
						// created using the SmartFilterBar on the UI - therefore checking 2 steps down: aPreparedFilters[j].aFilters[0].aFilters[0]
						if (aPreparedFilters[j].aFilters[0].sPath) {
							sFilterName = aPreparedFilters[j].aFilters[0].sPath;
						} else if (aPreparedFilters[j].aFilters[0].aFilters[0].sPath) {
							sFilterName = aPreparedFilters[j].aFilters[0].aFilters[0].sPath;
						} else {
							Log.error("MultipleViewsHandler: The filter name could not be determined.");
						}
					} else {
						sFilterName = aPreparedFilters[j].sPath;
					}

					aEntityProperties = getEntityTypePropertiesOfPath(sFilterName, oSmartControl, oMetaModel, oEntityType, aNavProperties);
					if (!aEntityProperties) {
						aPreparedFilters.splice(j, 1);
						continue;
					}

					sFilterPropertyName = getPropertyName(sFilterName);


					/* eslint-disable no-loop-func */
					// check if the filter field is part of the entity type
					aEntityProperties.some(function(oProperty) {
						var oHiddenProperty;
						if (oProperty.name === sFilterPropertyName) {
							// Additionally check whether the property is not marked as hidden
							oHiddenProperty = oProperty["com.sap.vocabularies.UI.v1.Hidden"];
							bFound = oHiddenProperty ? oHiddenProperty.Bool !== "true" : true;
							return bFound;
						}
					});

					// if the filter field is not part of the entity type delete it from the filter
					if (!bFound) {
						// push the filters which are not applied in case of different entity sets to a temp array
						if (oSelectedControl && oSelectedControl.entitySet === oSmartControl.getEntitySet() && (oSelectedControl.implementingControl.getMetadata().getElementName() === oSmartControl.getMetadata().getElementName())) {
							if (!aUnAppliedFilterTemp.includes(sFilterPropertyName)) {
								aUnAppliedFilterTemp.push(sFilterPropertyName);
							}
						}
						aPreparedFilters.splice(j, 1);
					}
				}
				// if aFilterValuesCopy is empty clear it up
				if (aFilterValuesCopy && aFilterValuesCopy[0] && aFilterValuesCopy[0].aFilters && aFilterValuesCopy[0].aFilters.length < 1) {
					aFilterValuesCopy = [];
				}
				// only if the entity sets and the control types of selected control and smart control match, then show the filter message
				if (oSelectedControl && oSelectedControl.entitySet === oSmartControl.getEntitySet() && (oSelectedControl.implementingControl.getMetadata().getElementName() === oSmartControl.getMetadata().getElementName())) {
					if (oImplementingHelper && oImplementingHelper.formatNotAppliedFilters) {
						oImplementingHelper.formatNotAppliedFilters(aUnAppliedFilterTemp, oSmartControl);
					}
				}
				return aFilterValuesCopy;
			}

			/**
			 * This method is needed to set the boolean for show count based on which, update count method is called
			 * @return {boolean} bDifferentEntitySetsTemp - boolean which suggests if different entity sets are present
			 */
			function fnIsDifferentEntitySets() {
				var bDifferentEntitySetsTemp = false;
				for (var i in oQuickVariantSelectionEffective.variants) {
					if (!!oQuickVariantSelectionEffective.variants[i].entitySet) {
						bDifferentEntitySetsTemp = true;
					} else {
						bDifferentEntitySetsTemp = false;
					}
				}
				return bDifferentEntitySetsTemp;
			}

			function fnSetActiveButtonState() {
				if (oImplementingHelper && oImplementingHelper.setActiveButtonState) {
					oImplementingHelper.setActiveButtonState();
				}
			}

			function fnRestoreActiveButtonState() {
				if (oImplementingHelper && oImplementingHelper.restoreActiveButtonState) {
					oImplementingHelper.restoreActiveButtonState();
				}
			}

			/**
			 * This method updates the state of the active button when the tabs are switched
			 */
			function fnUpdateActiveButtonState() {
				if (oImplementingHelper && oImplementingHelper.getActiveButtonStateCustomData) {
					var oCustomData = oImplementingHelper.getActiveButtonStateCustomData();
					var bActiveButtonTableState = oCustomData ? JSON.parse(oCustomData.getValue()) : false;
					oTemplatePrivateModel.setProperty("/listReport/activeObjectEnabled", bActiveButtonTableState);
				}
			}

			function onMessageCloseActionPress() {
				if (oImplementingHelper && oImplementingHelper.onMessageCloseActionPress) {
					oImplementingHelper.onMessageCloseActionPress();
				}
			}
			
			function hasEntitySet(sEntitySet){
				if (!oImplementingHelper){
					return oController.getOwnerComponent().getEntitySet() === sEntitySet;
				}
				for (var sKey in mItemData) { // loop over all items
					var oItemData = mItemData[sKey];
					if (oItemData.entitySet === sEntitySet){
						return true;
					}
				} return false;
			}

			// End private instance methods

			(function() { // constructor coding encapsulated in order to reduce scope of helper variables
				var oConfig, oSettings, oQuickVariantSelectionX, oQuickVariantSelection;
				oConfig = oController.getOwnerComponent().getAppComponent().getConfig();
				oSettings = oConfig && oConfig.pages[0] && oConfig.pages[0].component && oConfig.pages[0].component.settings;
				if (!oSettings) {
					return;
				}
				oQuickVariantSelectionX = oSettings.quickVariantSelectionX;
				oQuickVariantSelection = oSettings.quickVariantSelection;
				if (oQuickVariantSelectionX && oQuickVariantSelection) {
					throw new Error("Defining both QuickVariantSelection and QuickVariantSelectionX in the manifest is not allowed.");
				}
				oQuickVariantSelectionEffective = oQuickVariantSelectionX || oQuickVariantSelection;
				if (!oQuickVariantSelectionEffective) {
					return;
				}
				// in case of different entity sets, when certain filters do not get applied, then a message about 
				// unapplied filters should be shown along with an updation of the record count

				//BCP: 1980042698, temporarily disabling the feature of showing the count irrespective of showCounts flag in the manifest for multi entity set scenario
				//If showCounts is set to false, count is not shown.
				//This is strictly a temporary fix, until we come up a solution for the use case having param entitysets along with non-param entityset scenario in multiple views
				if (oQuickVariantSelectionX && fnIsDifferentEntitySets()) {
					bShowCounts = oQuickVariantSelectionEffective.showCounts === false ? false : true;
				} else {
					bShowCounts = oQuickVariantSelectionEffective.showCounts;
				}
				mItemData = Object.create(null);
				oTemplatePrivateModel.setProperty(PATH_TO_PROPERTIES, Object.create(null));
				oTemplatePrivateModel.setProperty(PATH_TO_ITEMS, Object.create(null));
				var oPageHeader = oController.byId("page");
				var fnSetInitialKey = function(sInitialKey){
					oTemplatePrivateModel.setProperty(PATH_TO_SELECTED_KEY, sInitialKey);
					// register on binding change after initial set of key
					var oBinding = oTemplatePrivateModel.bindProperty(PATH_TO_SELECTED_KEY);
					oBinding.attachChange(function(oChangeEvent) {
						// preserve the state of the LR header when switching the tabs
						if (oImplementingHelper && oImplementingHelper.fnSetMessageVisibility && oImplementingHelper.fnSetNotAppliedFilter) {
							oImplementingHelper.fnSetNotAppliedFilter([]);
							oImplementingHelper.fnSetMessageVisibility(oImplementingHelper.fnGetNotAppliedFilter()); //whenever tabs are switched, close message related filter
						}
						if (oPageHeader) {
							oPageHeader.setPreserveHeaderStateOnScroll(true);
						}
						var sNewKey = oChangeEvent.getSource().getValue();
						if (oImplementingHelper.onSelectedKeyChanged) {
							oImplementingHelper.onSelectedKeyChanged(sNewKey);
						}
						fnUpdateActiveButtonState();
						// The following logic checks whether we need to rebind or refresh (or both) the SmartControl which is switched to.
						var bSearchButtonPressed = oState.oIappStateHandler.areDataShownInTable() || oState.oWorklistData.bWorkListEnabled;
						// In single mode a rebind needs to be performed on every tab switch
						var iRequest = (sMode === "single") ? 3 : mItemData[sNewKey].dirtyState;
						if (oState.oWorklistData.bWorkListEnabled && iRequest < 2) {
							iRequest = iRequest + 2; // worklist is always refreshed
						}
						if (bSearchButtonPressed && iRequest > 0){
							fnRefreshOperationOnCurrentSmartControl(iRequest);
						} else {
							// need to update the toolbar button visibility here as the delete button would not be updated otherwise
							// see BCP:1770601204
							oTemplateUtils.oCommonUtils.setEnabledToolbarButtons(oState.oSmartTable);
							// need to update the filter message when tabs are switched and no rebind happens to controls
							if (oImplementingHelper && oImplementingHelper.fnUpdateMessageForFilter) {
								oImplementingHelper.fnUpdateMessageForFilter(oState.oSmartTable);
							}
						}
						// Reset the dirty state: Note that the refresh still may fail due to technical problems.
						// However, in this case the uswer gets feedback and knows that he needs to retrigger anyway.
						mItemData[sNewKey].dirtyState = 0;
						
						oState.oIappStateHandler.changeIappState(true, bSearchButtonPressed);
						// reset the value of preserveHeaderStateonScroll
						if (oTemplateUtils.oCommonUtils.isSmartTable(oState.oSmartTable)) {
							if (oPageHeader && oPageHeader.getPreserveHeaderStateOnScroll()) {
								oPageHeader.setPreserveHeaderStateOnScroll(false);
							}
						}
					});
				};
				if (oQuickVariantSelection) {
					oImplementingHelper = new MultiViewsSingleTableHelper(oQuickVariantSelection, oState, oController, oTemplateUtils, fnSetInitialKey, mItemData, setModelDataForItem);
					sMode = "single";
					Log.info("This list supports multiple views with single table");
				} else {
					oImplementingHelper = new MultiViewsMultiTablesHelper(oQuickVariantSelectionX, oState, oController, oTemplateUtils, fnSetInitialKey, mItemData, setModelDataForItem);
					sMode = "multi";
					Log.info("This list supports multiple views with multiple tables/charts");
				}
				oTemplatePrivateModel.setProperty(PATH_TO_MODE, sMode);
			})();

			/* eslint-disable */
			var fnRemoveTableSettingsFromFilters = testableHelper.testable(fnRemoveTableSettingsFromFilters, "fnRemoveTableSettingsFromFilters");
			var fnCleanupIrrelevantFilters = testableHelper.testable(fnCleanupIrrelevantFilters, "fnCleanupIrrelevantFilters");
			var findEntityProperties = testableHelper.testable(findEntityProperties, "findEntityProperties");
			var fnAddFiltersFromSmartFilterbar = testableHelper.testable(fnAddFiltersFromSmartFilterbar, "fnAddFiltersFromSmartFilterbar");
			var getSelectionVariantFilters = testableHelper.testable(getSelectionVariantFilters, "getSelectionVariantFilters");
			/* eslint-enable */
			
			// Make implementing helper accessible for unit tests.
			testableHelper.testable(function(){
				return oImplementingHelper;
			}, "getImplementingHelper");

			// public instance methods
			return {
				getEnableAutoBinding: getEnableAutoBinding,
				fnRegisterToChartEvents: fnRegisterToChartEvents,
				onDetailsActionPress: onDetailsActionPress,
				determineSortOrder: fnDetermineSortOrder,
				onDataRequested: onDataRequested,
				formatItemTextForMultipleView: formatItemTextForMultipleView,
				getContentForIappState: getContentForIappState,
				restoreFromIappState: fnRestoreFromIappState,
				getVariantSelectionKey: getVariantSelectionKey, // expose the selected key for extensionAPI
				getMode: getMode,
				onRebindContentControl: onRebindContentControl,
				getShowCounts: getShowCounts,
				refreshOperation: fnRefreshOperation,
				onMessageCloseActionPress: onMessageCloseActionPress,
				setActiveButtonState: fnSetActiveButtonState,
				restoreActiveButtonState: fnRestoreActiveButtonState,
				setControlVariant: fnSetControlVariant,
				hasEntitySet: hasEntitySet
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.ListReport.controller.MultipleViewsHandler", {
			constructor: function(oState, oController, oTemplateUtils) {
				jQuery.extend(this, getMethods(oState, oController, oTemplateUtils));
			}
		});
	});
