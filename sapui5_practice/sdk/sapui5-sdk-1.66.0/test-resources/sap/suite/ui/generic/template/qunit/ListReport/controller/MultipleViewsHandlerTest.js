/**
 * tests for the sap.suite.ui.generic.template.ListReport.controller.MultipleViewsHandler.js
 */
sap.ui.define([ "sap/ui/model/json/JSONModel",
				 "testUtils/sinonEnhanced",
				 "sap/suite/ui/generic/template/ListReport/controller/MultipleViewsHandler",
				 "sap/ui/model/Filter",
				"sap/suite/ui/generic/template/lib/testableHelper"
				 ], function(JSONModel, sinon, MultipleViewsHandler, Filter, testableHelper){
	"use strict";

	var sandbox; // sinon sandbox
	var bAreDataShownInTable;
	var bDiffEntitySets = false;
	var sEntitySet = "entitySet";
	var sTableBindingPath = "";
	var sChartBindingPath = "";
	var oEntityType = {
			properties: "smth",
			"com.sap.vocabularies.UI.v1.SelectionVariant#_tab1": {
					SelectOptions: [{
						PropertyName: {
							PropertyPath: "id"
						},
						Ranges: [{
							Low: {
								value: "S0"
							},
							Option: {
								EnumMember: "com.sap.vocabularies.UI.v1.SelectionRangeOptionType/EQ"
							}
						}]
					}]
			},
			"com.sap.vocabularies.UI.v1.SelectionVariant#_tab2":{
					SelectOptions: [{
						PropertyName: {
							PropertyPath: "id"
						},
						Ranges: [{
							Low: {
								value: "S0"
							},
							Option: {
								EnumMember: "com.sap.vocabularies.UI.v1.SelectionRangeOptionType/EQ"
							}
						}, {
							Low: {
								value: "S1"
							},
							Option: {
								EnumMember: "com.sap.vocabularies.UI.v1.SelectionRangeOptionType/EQ"
							}
						}]
					}]
			} 
		};
	var sSmartTableType = "t";
	var oEntitySet = {
			entityType: "entityType"};
	var oMetaModel = {
			getODataEntitySet: function() {
				return oEntitySet;
			},
			getODataEntityType: function() {
				return oEntityType;
			}
	};
	var oEntityTypeProperties = {};
	var aEntityTypeProperties = [{name: "B"}, {name: "C"},{name : "D"}];
	var oState = {
		oSmartTable: {
			getEntitySet: function() {
				return sEntitySet;
			},
			getTableBindingPath: function(){
				return sTableBindingPath;
			},
			getChartBindingPath: function() {
				return sChartBindingPath;
			}
		},
		oSmartFilterbar: {
			getFilters: function() {
				return {};
			}
		},
		oIappStateHandler: {
			areDataShownInTable: function(){
				return bAreDataShownInTable;
			},
			changeIappState: function() {
				// nothing
			}
		},
		oWorklistData: {
			bWorkListEnabled: false
		}
	};
	var oEvent = {
		getSource: function(){
			return oState.oSmartTable;
		}	
	};
	var oConfig;
	var oAppComponent = {
		getConfig: function(){ return oConfig; }
	};
	var oComponent = {
		getAppComponent: function(){ return oAppComponent; },
		getModel: function(){ return {getMetaModel: function(){return oMetaModel;}};}
	};
	var mControls;
	var oController = {
		getOwnerComponent: function(){ return oComponent; },
		byId: function(sControlId){ return mControls[sControlId]; }
	};
	var aItems;
	var oImplementingControl = {
		getItems: function(){
			return aItems;
		}
	};
	var oTemplatePrivateModel;
	var aSelectionVariantFilters = [new Filter('id', 'EQ', "S0"), new Filter('id', 'EQ', "S1")];
	var oTemplateUtils = {
		oComponentUtils: {
			getTemplatePrivateModel: function(){
				return oTemplatePrivateModel;
			}
		},
		oCommonUtils: {
			isSmartTable: function(oControl){
				if (oControl && oControl !== oState.oSmartTable){
			 		throw new Error("Only the SmartTable must be checked for its type");
				}
				return oControl && sSmartTableType === "t";
			},
			isSmartChart: function(oControl){
				if (oControl && oControl !== oState.oSmartTable){
			 		throw new Error("Only the SmartTable must be checked for its type");
				}
				return oControl && sSmartTableType === "c";
			},
			getElementCustomData: function(oItem){
				for (var i = 0; i < aItems.length; i++) {
					if (oItem === aItems[i]) {
						return oItem.customData;
					}
				}
				throw new Error("customData must only retrieved for the items");
			},
			setEnabledToolbarButtons: function(oSubControl) {
				// do nothing. function is needed to prevent type errors
			},
			refreshModel: function(oSmartTable){
				// do nothing. function is needed to prevent type errors				
			},
			getMetaModelEntityType: function(oSmartControl) {
				var sEntitySet, oMetaModel, oEntitySet, oEntityType;
				sEntitySet = oSmartControl.getEntitySet();
				oMetaModel = oSmartControl.getModel().getMetaModel();
				oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				return oEntityType;
			}
		},
		oServices: {
			oApplication: {
				getBusyHelper: function() {
					return {
						getBusyDelay: function() {
							return 0; // for the test every asynchronous operation is considered as 'long running'
						}
					};
				}
			}
		}
	};

	function getGetKey(sKey){
		return function(){ return sKey; };
	}

	var mSortOrders = {
		"1": { id: "SO" }
	};

	// simulates the functionality done by templating
	function fnCreateItems(){
		var oVariants = oConfig.pages[0].component.settings && oConfig.pages[0].component.settings.quickVariantSelection && oConfig.pages[0].component.settings.quickVariantSelection.variants || oConfig.pages[0].component.settings && oConfig.pages[0].component.settings.quickVariantSelectionX && oConfig.pages[0].component.settings.quickVariantSelectionX.variants;
		for (var i in oVariants){
			var oVariant = oVariants[i];
			var oItem = {
				getKey: getGetKey(oVariant.key),
				customData: {
					text: oVariant.annotationPath,
					TemplateSortOrder: mSortOrders[i],
					variantAnnotationPath: "com.sap.vocabularies.UI.v1.SelectionVariant#" + oVariant.key
				},
				getEntitySet: function() {
					return sEntitySet;
				},
				getModel: function() {
					return {
						getMetaModel: function() {
							return oMetaModel;
						}
					};
				},
				getCustomData: function(sText) {
					return [{
						getKey: function() {
							return "text";
						},
						getBinding: jQuery.noop,
						getBindingInfo: jQuery.noop,
						getValue: function() {
							return sText;
						}
					}];
				}.bind(null, oVariant.annotationPath)
			};
			aItems.push(oItem);
		}
	}

	function fnPrepareEnvironment(bIsButton, bShowCounts, oSettings, bDiffEntitySets) {
		if (!oSettings) {
			oConfig.pages = [{
				entitySet: "STTA_C_MP_Product",
				component: {
					name: "sap.suite.ui.generic.template.ListReport",
					list: true
				}
			}];
		} else {
			oConfig.pages = [{
				entitySet: "STTA_C_MP_Product",
				component: {
					name: "sap.suite.ui.generic.template.ListReport",
					list: true,
					settings: oSettings
				}
			}];

			var oQuickVariantSelection = oConfig.pages && oConfig.pages[0].component && oConfig.pages[0].component.settings && oConfig.pages[0].component.settings.quickVariantSelection ||
			oConfig.pages[0].component.settings.quickVariantSelectionX;
			if (oQuickVariantSelection) {
				oQuickVariantSelection.showCounts = bShowCounts;
			}
		}

		fnCreateItems();
		mControls[bIsButton ? "template::SegmentedButton" : "template::VariantSelect"] = oImplementingControl; // it is needed for MultipleViewsSingleTableHelper
		mControls.listReport = {getEntitySet: jQuery.noop};
	}

	var oVariants = {
			"0": {
				key: "_tab1",
				annotationPath: "com.sap.vocabularies.UI.v1.SelectionVariant#Expensive"
			},
			"1": {
				key: "_tab2",
				annotationPath: "com.sap.vocabularies.UI.v1.SelectionPresentationVariant#Cheap"
			}
		};

	var bShowCounts;
	var oQuickVariantSelection = {
		quickVariantSelection: {
			showCounts: bShowCounts,
			variants: oVariants
		}
	};

	var oQuickVariantSelectionX = {
			quickVariantSelectionX: {
				showCounts: bShowCounts,
				variants: oVariants
			}
		};

	if (bDiffEntitySets) {
		oQuickVariantSelectionX.variants[0].entitySet = "entitySet1";
		oQuickVariantSelectionX.variants[1].entitySet = "entitySet2";
	}

	var oSettingsWith2Switches = {
		quickVariantSelection: {
			showCounts: bShowCounts,
			variants: oVariants
		},
		quickVariantSelectionX: {
			showCounts: bShowCounts,
			variants: oVariants
		}
	};

var oStubForPrivate;

	function fnCommonSetUp(){
		bAreDataShownInTable = false; // default
		oConfig = {};
		mControls = Object.create(null);
		aItems = [];
		oTemplatePrivateModel = new JSONModel({
			listReport: {}
		});
		oStubForPrivate = testableHelper.startTest();
		sandbox = sinon.sandbox.create();
	}

	function fnCommonTeardown(){
		sandbox.restore();
		testableHelper.endTest();
	}

	module("Contructor", {
		setup : fnCommonSetUp,
		teardown: fnCommonTeardown
	});

	function fnPerformTestForConstructor(fnTestImplementation, bIsButton, bShowCounts, oSettings, sMode, bDiffEntitySets, assert){
		fnPrepareEnvironment(bIsButton, bShowCounts, oSettings, bDiffEntitySets);
		var oMultipleViewsHandler = new MultipleViewsHandler(oState, oController, oTemplateUtils);
		var fnGetEntityTypePropertiesStub = sandbox.stub(oMultipleViewsHandler, "getEntityTypeProperties");
		oChangeIappStateSpy = sandbox.spy(oState.oIappStateHandler, "changeIappState"); // deactivate the appStateHandler for this test, since it is will be called for every item change
		fnTestImplementation(oMultipleViewsHandler, bShowCounts, sMode, assert);
	}

	function fnTestSettings(oMultipleViewsHandler, bShowCounts, sMode, assert){
		assert.ok(!oStubForPrivate.getImplementingHelper(), "oImplementingHelper should be undefined if no settings are provided");
		var oSortOrder = oMultipleViewsHandler.determineSortOrder();
		assert.strictEqual(oSortOrder, undefined, "No sort order if the switch is off");
	}

	test("test no settings in manifest", fnPerformTestForConstructor.bind(null, fnTestSettings, false, true, undefined, "ModeIsEgal", bDiffEntitySets));

	function fnTest2SwitchesTogether(oSettingsWith2Switches, assert) {
		var oMultipleViewsHandler;
		fnPrepareEnvironment(false, true, oSettingsWith2Switches, bDiffEntitySets);
		assert.throws(function() {
			oMultipleViewsHandler = new MultipleViewsHandler(oState, oController, oTemplateUtils);
		}, Error, "Error should be thrown if both quickVariantSelection & quickVariantSelectionX are provided");
	}

	test("test QuickVariantSelectionX & QuickVariantSelection together", fnTest2SwitchesTogether.bind(null, oSettingsWith2Switches));

	function fnTestSwitch(oMultipleViewsHandler, bShowCounts, sMode, assert){
		assert.ok(!oStubForPrivate.getImplementingHelper(), "oImplementingHelper should be undefined if neither quickVariantSelection nor quickVariantSelectionX is provided");
		var oSortOrder = oMultipleViewsHandler.determineSortOrder();
		assert.strictEqual(oSortOrder, undefined, "No sort order if the switch is off");
	}

	test("test switch is off", fnPerformTestForConstructor.bind(null, fnTestSwitch, false, true, "some setting", "egal", bDiffEntitySets));

	function fnShowCounts(oMultipleViewsHandler, bShowCounts, sMode, assert){
		assert.equal(oMultipleViewsHandler.getShowCounts(), bShowCounts, "showCounts is set");
		assert.equal(oMultipleViewsHandler.getMode(), sMode, "sMode is set");
	}

	bDiffEntitySets = true;
	test("test showCounts for QuickVariantSelectionX", fnPerformTestForConstructor.bind(null, fnShowCounts, false, true, oQuickVariantSelectionX, "multi", bDiffEntitySets));

	test("test showCounts for QuickVariantSelection", fnPerformTestForConstructor.bind(null, fnShowCounts, false, true, oQuickVariantSelection, "single", bDiffEntitySets));

	test("test no showCounts for QuickVariantSelectionX", fnPerformTestForConstructor.bind(null, fnShowCounts, false, false, oQuickVariantSelectionX, "multi", bDiffEntitySets));

	test("test no showCounts for QuickVariantSelection", fnPerformTestForConstructor.bind(null, fnShowCounts, false, false, oQuickVariantSelection, "single", bDiffEntitySets));

	bDiffEntitySets = true;
	test("test showCounts for QuickVariantSelectionX with different EntitySets", fnPerformTestForConstructor.bind(null, fnShowCounts, false, true, oQuickVariantSelectionX, "multi", bDiffEntitySets));

	test("test no showCounts for QuickVariantSelectionX with different EntitySets", fnPerformTestForConstructor.bind(null, fnShowCounts, false, false, oQuickVariantSelectionX, "multi", bDiffEntitySets));

	bDiffEntitySets = false;

	module("public api", {
		setup : fnCommonSetUp,
		teardown: fnCommonTeardown
	});

	var oChangeIappStateSpy;
	var oImplementingHelperInitSpy;

	// tests for methods of the public api

	// This function prepares the test and executes the real test.
	// fnTestImplementation is the real test function. The object to be tested is passed to it as first parameter, the assert object as the last parameter
	// We expect that bIsButton and bShowCounts is not relevant for the tests. So we set them randomly in the tests.

	function fnPerformTest(fnTestImplementation, bIsButton, bShowCounts, assert){
		fnPrepareEnvironment(bIsButton, bShowCounts, oQuickVariantSelection, bDiffEntitySets);
		var oMultipleViewsHandler = new MultipleViewsHandler(oState, oController, oTemplateUtils);
		oImplementingHelperInitSpy = sandbox.spy(oStubForPrivate.getImplementingHelper(), "init");
		oChangeIappStateSpy = sandbox.spy(oState.oIappStateHandler, "changeIappState"); // deactivate the appStateHandler for this test, since it is will be called for every item change
		sandbox.stub(oMultipleViewsHandler, "getEntityTypeProperties").returns(oEntityTypeProperties);
		fnTestImplementation(oMultipleViewsHandler, assert);
	}

	function fnTestInitialModelState(oMultipleViewsHandler, assert){
		var mModelProperties = oTemplatePrivateModel.getProperty("/listReport/multipleViews/items");
		var oProperties = mModelProperties._tab1;
		assert.strictEqual(oProperties.count, 0, "Count for " + "_tab1" + " must be initialized with 0");
		assert.strictEqual(oProperties.state, "", "State for " + "_tab1" + " must be initialized with ''");
		assert.strictEqual(oProperties.text, "com.sap.vocabularies.UI.v1.SelectionVariant#Expensive", "Text for " + "_tab1" + " must be initialized correctly");
		oProperties = mModelProperties._tab2;
		assert.strictEqual(oProperties.count, 0, "Count for " + "_tab2" + " must be initialized with 0");
		assert.strictEqual(oProperties.state, "", "State for " + "_tab2" + " must be initialized with ''");
		assert.strictEqual(oProperties.text, "com.sap.vocabularies.UI.v1.SelectionPresentationVariant#Cheap", "Text for " + "_tab2" + " must be initialized correctly");
//		assert.ok(oImplementingHelperInitSpy.calledOnce, "init of ImplementingHelper should be called once");
	}

	test("Model initialization", fnPerformTest.bind(null, fnTestInitialModelState, false, true));

	function fnTestIappStateChange(oMultipleViewsHandler, assert){
		// First run: Assume that data are currently not shown in the table
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab2");
		assert.ok(oChangeIappStateSpy.calledOnce, "IAppState must have been adapted");
		assert.ok(oChangeIappStateSpy.calledWithExactly(true, false), "AppState must have been changed correctly");
		// Second run: Now we assume that data are already shown in the table
		bAreDataShownInTable = true;
		var oRebindTableSpy = sandbox.spy(oState.oSmartTable, "rebindTable");
		var oRefreshTableSpy = sandbox.spy(oTemplateUtils.oCommonUtils, "refreshSmartTable");
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab1");
		assert.ok(oRebindTableSpy.calledOnce, "Rebind table must have been called");
		assert.ok(oRefreshTableSpy.calledOnce, "Refresh of table must have been called");
		assert.ok(oRebindTableSpy.calledBefore(oRefreshTableSpy), "Rebind must have been called before refresh");
		assert.ok(oRefreshTableSpy.calledWithExactly(oState.oSmartTable), "Refresh of table must have been called correctly");
		assert.ok(oChangeIappStateSpy.calledTwice, "AppState must have been changed again due to change of selected item");
		assert.ok(oChangeIappStateSpy.calledWithExactly(true, true), "Again AppState must have been changed correctly");
	}

	test("IappStateChange", fnPerformTest.bind(null, fnTestIappStateChange, true, false));

	function fnTestGetVariantSelectionKey(oMultipleViewsHandler, assert){
		var sKey = oMultipleViewsHandler.getVariantSelectionKey();
		assert.strictEqual(sKey, "_tab1", "Intially the first item should be set");
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab2");
		sKey = oMultipleViewsHandler.getVariantSelectionKey();
		assert.strictEqual(sKey, "_tab2", "item should have changed accordingly");
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab1");
		sKey = oMultipleViewsHandler.getVariantSelectionKey();
		assert.strictEqual(sKey, "_tab1", "item should once more have changed accordingly");
	}
	test("getVariantSelectionKey", fnPerformTest.bind(null, fnTestGetVariantSelectionKey, false, false));

	var oFilter1 = { id: "A", sPath: "A" }, oFilter2 = { id: "B", sPath: "B" }, oFilter3 = {id: "C", sPath: "C"},
		oFilter4 = { id: "D",
					 aFilters: [{
						 aFilters: [{
							 sPath: "D" 
						 }]
					 }]
		};

	var oBindingParams;
	var aCurrentFilters;
	// Produces an Event for the rebindTable. If aFilters is filled they are used. Otherwise [oFilter1, oFilter2] is used.
	function fnGetEventForRebindContentControl(assert, aFilters){
		aCurrentFilters = aFilters || [oFilter1, oFilter2];
		oBindingParams = {
			filters: aCurrentFilters.slice() // copy
		};
		var oEvent = {
			getParameter: function(sParam){
				if (assert){
					assert.strictEqual(sParam, "bindingParams", "Only bindingParams must be retrieved from the onRebindContentControl event");
				}
				return oBindingParams;
			}
		};
		return oEvent;
	}

	function onRebindContentControl(oMultipleViewsHandler, assert){
		// Preparation
		var oEvent = fnGetEventForRebindContentControl();
		// function that tests that filters are set correctly in oBindingParams when the item with key _tab<iItemNo> is selected.
		// Assumption: oFilter1 and oFilter2 are already provided by the event itself
		var fnTestFilters = function(iItemNo){
			assert.strictEqual(oBindingParams.filters.length, iItemNo + 2, "Correct number of filters now");
			assert.strictEqual(oBindingParams.filters[0], oFilter1, "Filter1 must still be present");
			assert.strictEqual(oBindingParams.filters[1], oFilter2, "Filter2 must still be present");
			for (var i = 0; i < iItemNo; i++){
				assert.deepEqual(oBindingParams.filters[i + 2], aSelectionVariantFilters[i], "" + i + "-th filter from the selection variant must have been passed");
			}
		};
		//
		oMultipleViewsHandler.onRebindContentControl(oEvent);
		fnTestFilters(1);
		// Reset oBindingParams
		oEvent = fnGetEventForRebindContentControl(assert);
		oMultipleViewsHandler.onRebindContentControl(oEvent);
		fnTestFilters(1);
		// change the selected item
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab2");
		// Reset oBindingParams
		oEvent = fnGetEventForRebindContentControl(assert);
		oMultipleViewsHandler.onRebindContentControl(oEvent);
		fnTestFilters(2);
		// change back the selected item
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab1");
		// Reset oBindingParams
		oEvent = fnGetEventForRebindContentControl(assert);
		oMultipleViewsHandler.onRebindContentControl(oEvent);
		fnTestFilters(1);
	}

	test("onRebindContentControl", fnPerformTest.bind(null, onRebindContentControl, true, true));

	/*
	/* Tests for the case of Different Entity Sets
	 */
	bDiffEntitySets = true;

	function fnPerformTestMulti(fnTestImplementation, bIsButton, bShowCounts, oQuickVariantSelection, bDiffEntitySets, assert){
		fnPrepareEnvironment(bIsButton, bShowCounts, oQuickVariantSelection, bDiffEntitySets);
		var oMultipleViewsHandler = new MultipleViewsHandler(oState, oController, oTemplateUtils);
		oImplementingHelperInitSpy = sandbox.spy(oStubForPrivate.getImplementingHelper(), "init");
		var oEvent = {
			getSource: function(){
				return oState.oSmartTable;
			}
		};
//		oMultipleViewsHandler.init(oEvent);
		oChangeIappStateSpy = sandbox.spy(oState.oIappStateHandler, "changeIappState"); // deactivate the appStateHandler for this test, since it is will be called for every item change
		var oImplementingHelper = oStubForPrivate.getImplementingHelper();
		sandbox.stub(oImplementingHelper, "getIsDifferentEntitySets").returns(true);
		sandbox.stub(oStubForPrivate, "findEntityProperties").returns(aEntityTypeProperties);
		sandbox.stub(oMultipleViewsHandler, "getEntityTypeProperties").returns(oEntityTypeProperties);
		fnTestImplementation(oMultipleViewsHandler, assert);
	}

	// function fnTestRemoveTableSettingsFromFilters(oMultipleViewsHandler, assert){
	// 	// Preparation
	// 	var aAllFilters = [oFilter1, oFilter2, oFilter3];
	// 	var oFiltersToBeRemoved = {
	// 		0: oFilter1,
	// 		1: oFilter2
	// 	};
	// 	oStubForPrivate.fnRemoveTableSettingsFromFilters(aAllFilters, oFiltersToBeRemoved);
	// 	assert.strictEqual(aAllFilters.length, 1, "Correct number of filters now");
	// 	assert.strictEqual(aAllFilters[0], oFilter3, "Filter3 must still be present");
	// }
	// test("RemoveTableSettingsFromFilters", fnPerformTestMulti.bind(null, fnTestRemoveTableSettingsFromFilters, true, true, oQuickVariantSelectionX, true));

	function fnTestCheckIfFiltersSupported(oMultipleViewsHandler, assert){
		// Preparation
		var aFilterValues = [oFilter1, oFilter2, oFilter3, oFilter4];
		// aFilterValues = [0: {id: "A", sPath: "A"}, 1: {id: "B", sPath: "B"}, 2: {id: "C", sPath: "C"}]
		// EntityTypeProperties = [{name: "B"}, {name: "C"}, {name : "D"}];
		var aFilterValuesResult = oStubForPrivate.fnCleanupIrrelevantFilters(oImplementingControl.getItems()[0], aFilterValues);
		assert.strictEqual(aFilterValuesResult.length, 3, "Correct number of filters now");
		assert.strictEqual(aFilterValuesResult[0].id, oFilter2.id, "Filter2 must still be present");
		assert.strictEqual(aFilterValuesResult[1].id, oFilter3.id, "Filter3 must still be present");
		assert.strictEqual(aFilterValuesResult[2].id, oFilter4.id, "Filter4 must still be present");
	}
	test("fnCleanupIrrelevantFilters", fnPerformTestMulti.bind(null, fnTestCheckIfFiltersSupported, true, true, oQuickVariantSelectionX, true));

	function fnTestAddFiltersFromSmartFilterbar(oMultipleViewsHandler, assert){
		// Preparation
		var aFilterValues = [{aFilters: [oFilter1, oFilter2, oFilter3]}];
		// aFilterValues = [0: {id: "A", sPath: "A"}, 1: {id: "B", sPath: "B"}, 2: {id: "C", sPath: "C"}]
		// EntityTypeProperties = [{name: "B"}, {name: "C"}, {name : "D"}];
		var oBindingParams = {
			filters: []
		};
		oStubForPrivate.fnAddFiltersFromSmartFilterbar(oImplementingControl.getItems()[0], aFilterValues, oBindingParams);
		assert.strictEqual(oBindingParams.filters[0].aFilters[0].aFilters.length, 2, "Correct number of filters now");
		assert.strictEqual(oBindingParams.filters[0].aFilters[0].aFilters[0].id, oFilter2.id, "Filter2 must still be present");
		assert.strictEqual(oBindingParams.filters[0].aFilters[0].aFilters[1].id, oFilter3.id, "Filter3 must still be present");
	}
	test("fnAddFiltersFromSmartFilterbar", fnPerformTestMulti.bind(null, fnTestAddFiltersFromSmartFilterbar, true, true, oQuickVariantSelectionX, true));

	bDiffEntitySets = false;

	function fnTestDetermineSortOrder(oMultipleViewsHandler, assert) {
		var oSortOrder = oMultipleViewsHandler.determineSortOrder();
		assert.strictEqual(oSortOrder, undefined, "No sort order defined for the first item");
		// change the selected item
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab2");
		oSortOrder = oMultipleViewsHandler.determineSortOrder();
		assert.strictEqual(oSortOrder, mSortOrders["1"], "Correct sort order defined for the second item");
		// change back the selected item
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab1");
		oSortOrder = oMultipleViewsHandler.determineSortOrder();
		assert.strictEqual(oSortOrder, undefined, "Again no sort order defined for the first item");
	}
	test("determineSortOrder", fnPerformTest.bind(null, fnTestDetermineSortOrder, true, false));


	// Produces an Event for the rebindTable. If aFilters is filled they are used. Otherwise [oFilter1, oFilter2] is used.
	function fnGetEventForRebindTable(assert, aFilters){
		aCurrentFilters = aFilters || [oFilter1, oFilter2];
		oBindingParams = {
			filters: aCurrentFilters.slice() // copy
		};
		var oEvent = {
			getParameter: function(sParam){
				if (assert){
					assert.strictEqual(sParam, "bindingParams", "Only bindingParams must be retrieved from the onBeforeRebindTable event");
				}
				return oBindingParams;
			}
		};
		return oEvent;
	}


	function fnTestOnDataRequestedNoCounts(oMultipleViewsHandler, assert){
		oMultipleViewsHandler.onDataRequested();
		assert.ok(true, "onDataRequested must be callable without exception");
	}
	test("onDataRequested without counts", fnPerformTest.bind(null, fnTestOnDataRequestedNoCounts, true, false));

	function fnPrepareForRequests(assert){
		var oRet = {
			aReadCalls: [], // track the reads
			sEntitySet: sEntitySet,
		//	sEntitySet: "entitySet" + new Date(),
			sSearchValue: { id: "searchValue" }
		};
		var oModel = {
			read: function(sPath, mParameters){
				assert.strictEqual(arguments.length, 2, "Exactly 2 parameters for the read call");
				oRet.aReadCalls.push({
					path: sPath,
					parameters: mParameters
				});
			}
		};
		sandbox.stub(oState.oSmartTable, "getModel", function(sName){
			assert.ok(!sName, "only default model must be retrieved from the smart table (current name is " + sName + ")");
			return oModel;
		});

		sandbox.stub(oState.oSmartFilterbar, "getBasicSearchValue", function(){
			return oRet.sSearchValue;
		});

		return oRet;
	}

	function fnTestOnDataRequestedWithCounts(oMultipleViewsHandler, assert){
		var oRequestObject = fnPrepareForRequests(assert);
		// onDataRequested relies on a rebindTable to have happened beefore
		var oEvent = fnGetEventForRebindTable();
		// Prepare a function that can check whether one read call has been performed correctly
		var fnCheckOneReadCall = function(iNumber, bAssumeError){
			var oCall = oRequestObject.aReadCalls[iNumber];
			assert.strictEqual(oCall.path, "/" + oRequestObject.sEntitySet + "/$count", "Path for read must have been set correctly");
			var mParameters = oCall.parameters;
			assert.deepEqual(mParameters.urlParameters, { search: oRequestObject.sSearchValue }, "url parameter must have been set correctly");
			assert.strictEqual(mParameters.urlParameters.search, oRequestObject.sSearchValue, "Search value must have been passed without modification");
			var aExpectedFilters = aCurrentFilters.slice();
			for (var i = 0; i <= iNumber; i++){
				aExpectedFilters.push(aSelectionVariantFilters[i]);
			}
			assert.deepEqual(mParameters.filters, aExpectedFilters, "Filters must have been set correctly for read");
			assert.strictEqual(mParameters.groupId, "updateMultipleViewsItemsCounts", "All read requests must be set with the correct group id");
			var sPath = "/listReport/multipleViews/items/_tab" + (iNumber + 1);
			var oModelEntry = oTemplatePrivateModel.getProperty(sPath);
			assert.strictEqual(oModelEntry.state, "busy", "State must have been set to busy");
			if (bAssumeError){
				mParameters.error();
				oModelEntry = oTemplatePrivateModel.getProperty(sPath);
				assert.strictEqual(oModelEntry.state, "error", "State must have been set to error");
			} else {
				var iCount = Math.floor(1000 * Math.random()); // create a random count
				mParameters.success(iCount);
				oModelEntry = oTemplatePrivateModel.getProperty(sPath);
				assert.strictEqual(oModelEntry.state, "", "State must have been set to loaded");
				assert.strictEqual(oModelEntry.count, iCount, "Count must have been updated accordingly");
			}
		};
		// Now prepare a function that checks whether all calls have been performed correctly
		var fnCheckWhetherReadWasCalledCorrectly = function(bAssumeError){
			assert.strictEqual(oRequestObject.aReadCalls.length, 2, "Exactly two read requests must have been performed");
			fnCheckOneReadCall(0, bAssumeError);
			fnCheckOneReadCall(1, bAssumeError);
			oRequestObject.aReadCalls = []; // reset for next try
		};
		oMultipleViewsHandler.onRebindContentControl(oEvent);
		// retrieve data
		oMultipleViewsHandler.onDataRequested();
		fnCheckWhetherReadWasCalledCorrectly(true); // assume that an error has occured
		// data are requested once more
		oMultipleViewsHandler.onDataRequested();
		fnCheckWhetherReadWasCalledCorrectly(); // this time no error occurs
		// change the filters
		oEvent = fnGetEventForRebindTable(assert, [oFilter2]);
		oMultipleViewsHandler.onRebindContentControl(oEvent);
		// retrieve data
		oMultipleViewsHandler.onDataRequested();
		fnCheckWhetherReadWasCalledCorrectly(); // again check under the assumption that no error occurs
		// data are retirevd once more
		oMultipleViewsHandler.onDataRequested();
		//  this time we assume that the response is not sent directly
		var fnSuccess = oRequestObject.aReadCalls[0].parameters.success;
		var fnError = oRequestObject.aReadCalls[1].parameters.error;
		oRequestObject.aReadCalls = [];
		// Another set of requests is sent, before the previous one comes back
		oMultipleViewsHandler.onDataRequested();
		// this should have the normal consequences
		fnCheckWhetherReadWasCalledCorrectly();
		// store the results
		var iCount0 = oTemplatePrivateModel.getProperty("/listReport/multipleViews/items/_tab1/count");
		var iCount1 = oTemplatePrivateModel.getProperty("/listReport/multipleViews/items/_tab2/count");
		// Now simulate that the previous requests come back. They must be ignored.
		fnSuccess(17);
		fnError();
		var oItem0 = oTemplatePrivateModel.getProperty("/listReport/multipleViews/items/_tab1");
		var oItem1 = oTemplatePrivateModel.getProperty("/listReport/multipleViews/items/_tab2");
		assert.strictEqual(oItem0.count, iCount0, "Count must not have changed by outdated request");
		assert.strictEqual(oItem1.count, iCount1, "Count must not have changed by outdated request");
		assert.strictEqual(oItem0.state + oItem1.state, "", "State must not have changed by outdated request");
	}
	test("onDataRequested with counts", fnPerformTest.bind(null, fnTestOnDataRequestedWithCounts, true, true));

	function fnTestOnDataRequestedWithCountsLong(oMultipleViewsHandler, assert){
		var oRequestObject = fnPrepareForRequests(assert);
		var oEvent = fnGetEventForRebindTable();
		oMultipleViewsHandler.onRebindContentControl(oEvent);
		// retrieve data
		oMultipleViewsHandler.onDataRequested();
		oRequestObject.aReadCalls[1].parameters.success(); // let the second tab succeed fast
		var done = assert.async();
		setTimeout(function(){ // this should result in a busy indication for the tab not finisched, yet. This means, that the state should switch from "busy" to "busyLong".
			var sState0 = oTemplatePrivateModel.getProperty("/listReport/multipleViews/items/_tab1/state");
			var sState1 = oTemplatePrivateModel.getProperty("/listReport/multipleViews/items/_tab2/state");
			assert.strictEqual(sState0, "busyLong", "Long running request must have changed the state accordingly");
			assert.strictEqual(sState1, "", "State must not have been changed the state after success");
			oRequestObject.aReadCalls[0].parameters.success(); // now we let the first tab succeed, too
			sState0 = oTemplatePrivateModel.getProperty("/listReport/multipleViews/items/_tab1/state");
			assert.strictEqual(sState0, "", "State must have been set to success even if success comes late");
			done();
		}, 1);
	}
	test("onDataRequested with counts lasting long", fnPerformTest.bind(null, fnTestOnDataRequestedWithCountsLong, true, true));

	function fnTestFormatItemTextForMultipleView(oMultipleViewsHandler, assert){
		var oText =	oMultipleViewsHandler.formatItemTextForMultipleView();
		assert.strictEqual(oText, "", "Empty text must be returned if no item is provided");
		var aTexts = [];
		sandbox.stub(oTemplateUtils.oCommonUtils, "getText", function(sKey, vParam){
			var oRet = {
				key: sKey,
				params: vParam
			};
			aTexts.push(oRet);
			return oRet;
		});

		sandbox.stub(sap.ui.core, "format", {});
		sandbox.stub(sap.ui.core.format, "NumberFormat", {});
		sandbox.stub(sap.ui.core.format.NumberFormat, "getIntegerInstance", function(sMode) {
			var oIntegerInstance = {
					format: function(sValue) {
						return "#" + sValue;
					}};
			return oIntegerInstance;
		});
		var fnCheckText = function(oTextObject, sExpectedKey, vExpectedParams){
			assert.strictEqual(oTextObject.key, sExpectedKey, "Correct text key must be used");
			assert.deepEqual(oTextObject.params, vExpectedParams, "Correct params must be used");
			var bIsTextObject = false;
			for (var i = 0; i < aTexts.length && !bIsTextObject; i++){
				bIsTextObject = oTextObject === aTexts[i];
			}
			assert.ok(bIsTextObject, "The return value of the formatter must be a valid retrun value of method getText");
		};
		oText =	oMultipleViewsHandler.formatItemTextForMultipleView({
			state: "busy",
			text: "myEntity",
			count: 17
		});
		fnCheckText(oText, "SEG_BUTTON_TEXT", ["myEntity", "#17"]);
		oText =	oMultipleViewsHandler.formatItemTextForMultipleView({
			state: "busyLong",
			text: "myEntity",
			count: 17
		});
		fnCheckText(oText, "SEG_BUTTON_TEXT", ["myEntity", "..."]);
		oText = oMultipleViewsHandler.formatItemTextForMultipleView({
			state: "",
			text: "myEntity1",
			count: 25
		});
		fnCheckText(oText, "SEG_BUTTON_TEXT", ["myEntity1", "#25"]);
		oText =	oMultipleViewsHandler.formatItemTextForMultipleView({
			state: "error",
			text: "myEntity2"
		});
		fnCheckText(oText, "SEG_BUTTON_ERROR", "myEntity2");
	}
	test("formatItemTextForMultipleView", fnPerformTest.bind(null, fnTestFormatItemTextForMultipleView, true, false));

	function fnTestGetContentForIappState(oMultipleViewsHandler, assert){
		var oExpectedContent = {
				mode: "single",
				state: {
					selectedKey: "_tab1"
				}
		};
		var sSelectedKey = oTemplatePrivateModel.getProperty("/listReport/multipleViews/selectedKey");
		var oMyState = oMultipleViewsHandler.getContentForIappState(sSelectedKey);
		assert.deepEqual(oMyState, oExpectedContent);
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab2");
		sSelectedKey = oTemplatePrivateModel.getProperty("/listReport/multipleViews/selectedKey");
		oMyState = oMultipleViewsHandler.getContentForIappState(sSelectedKey);
		oExpectedContent.state.selectedKey = "_tab2";
		assert.deepEqual(oMyState, oExpectedContent);
		oTemplatePrivateModel.setProperty("/listReport/multipleViews/selectedKey", "_tab1");
		sSelectedKey = oTemplatePrivateModel.getProperty("/listReport/multipleViews/selectedKey");
		oMyState = oMultipleViewsHandler.getContentForIappState(sSelectedKey);
		oExpectedContent.state.selectedKey = "_tab1";
		assert.deepEqual(oMyState, oExpectedContent);
	}
	test("getContentForIappState", fnPerformTest.bind(null, fnTestGetContentForIappState, false, false));

	function fnTestRestoreFromIappState(oMultipleViewsHandler, assert){
		oMultipleViewsHandler.restoreFromIappState({ selectedKey: "_tab3" }); // illegal key should be ignored
		var sSelectedKey = oTemplatePrivateModel.getProperty("/listReport/multipleViews/selectedKey");
		assert.strictEqual(sSelectedKey, "_tab1"); // selected tab should still be the default tab
		oMultipleViewsHandler.restoreFromIappState({ selectedKey: "_tab2" });
		sSelectedKey = oTemplatePrivateModel.getProperty("/listReport/multipleViews/selectedKey");
		assert.strictEqual(sSelectedKey, "_tab2");
		oMultipleViewsHandler.restoreFromIappState({ selectedKey: "_tab1" });
		sSelectedKey = oTemplatePrivateModel.getProperty("/listReport/multipleViews/selectedKey");
		assert.strictEqual(sSelectedKey, "_tab1");
	}
	test("getSelectedKeyAndRestoreFromIappState", fnPerformTest.bind(null, fnTestRestoreFromIappState, false, true));

});
