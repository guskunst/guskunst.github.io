/**
 * tests for the sap.suite.ui.generic.template.ListReport.controller.MultipleViewsMultipleTablesModeHelper.js
 */
sap.ui.define([ "sap/ui/model/json/JSONModel",
				 "testUtils/sinonEnhanced",
				 "sap/suite/ui/generic/template/ListReport/controller/MultipleViewsMultipleTablesModeHelper",
				 "sap/ui/comp/smartchart/SmartChart"
				 ], function(JSONModel, sinon, MultipleViewsMultipleTablesModeHelper, SmartChart){
	"use strict";


	var sandbox; // sinon sandbox
	var sEntitySet1 = "entitySet", sEntitySet2; // set sEntitySet2 dependent on whether to test differentEntitySets
	var bAreDataShownInTable;
	var oState = {
		oSmartTable: {},
		oSmartFilterbar: {
			attachSearch: function() {
				return;
			}
		},
		oIappStateHandler: {
			areDataShownInTable: function(){
				return bAreDataShownInTable;
			}
		}
	};

	var oConfig;
	var oAppComponent = {
		getConfig: function(){ return oConfig; }
	};
	var oComponent = {
		getAppComponent: function(){ return oAppComponent; },
		getEntitySet: function(){return sEntitySet1;}
	};
	var mControls;
	var oController = {
		getOwnerComponent: function(){ return oComponent; },
		byId: function(sControlId){ return mControls[sControlId]; }
	};
	var aItems;
	var oIconTabBar = {
		getItems: function(){
			return aItems;
		}
	};
	var oImplementingControl1 = {
		getId: function(){return "_tab1";},
		getEntitySet: function(){return sEntitySet1;}
	};
	var oImplementingControl2 = {
			getId: function(){return "_tab2";},
		getEntitySet: function(){return sEntitySet2;}
	};
	var oTemplatePrivateModel;
	var aSelectionVariantFilters = [{id: "S0"}, {id: "S1"}];
	var oTemplateUtils = {
		oComponentUtils: {
			getTemplatePrivateModel: function(){
				return oTemplatePrivateModel;
			}
		},
		oCommonUtils: {
//			getSelectionVariantFilters: function(oTable, oItem){},
			getElementCustomData: function(oItem){
				for (var i = 0; i < aItems.length; i++){
					if (oItem === aItems[i]){
						return oItem.customData;
					}
				}
				throw new Error("customData must only retrieved for the items");
			},
			getMetaModelEntityType: function(){return {property: []};}
		},
		oCommonEventHandlers: {}
	};

	var mItemData;

	function getGetKey(sKey){
		return function(){ return sKey; };
	}

	var mSortOrders = {
		"1": { id: "SO" }
	};

	var oQuickVariantSelectionX;

	// simulates the functionality done by templating
	function fnCreateItems(){
		var oVariants = oQuickVariantSelectionX.variants;
		for (var i in oVariants){
			var oVariant = oVariants[i];
			var oItem = {
				getKey: getGetKey(oVariant.key),
				customData: {
					text: oVariant.annotationPath,
					TemplateSortOrder: mSortOrders[i]
				}
			};
			aItems.push(oItem);
		}
	}

	function fnPrepareEnvironment(bShowCounts, bDiffEntitySets){
		oQuickVariantSelectionX = {
			showCounts: bShowCounts,
			variants: {
				"0": {
					key: "_tab1",
					annotationPath: "com.sap.vocabularies.UI.v1.SelectionVariant#Expensive"
				},
				"1": {
					key: "_tab2",
					annotationPath: "com.sap.vocabularies.UI.v1.SelectionPresentationVariant#Cheap"
				}
			}
		};
		if (bDiffEntitySets) {
			// by default, showCounts is true for different entity sets
			oQuickVariantSelectionX.showCounts = true;
			oQuickVariantSelectionX.variants[0].entitySet = sEntitySet1;
			oQuickVariantSelectionX.variants[1].entitySet = sEntitySet2;
		}
		fnCreateItems();
		mControls["template::IconTabBar"] = oIconTabBar;
		mControls["listReport-_tab1"] = oImplementingControl1;
		mControls["listReport-_tab2"] = oImplementingControl2;
	}

	function fnCommonSetUp(){
		mItemData = {};
		bAreDataShownInTable = false; // default
		oConfig = {};
		mControls = Object.create(null);
		aItems = [];
		oTemplatePrivateModel = new JSONModel({
			listReport: {
				multipleViews: Object.create(null)
			}
		});
		sandbox = sinon.sandbox.create();
	}

	function fnCommonTeardown(){
		sandbox.restore();
	}

	module("Initialization", {
		setup : fnCommonSetUp,
		teardown: fnCommonTeardown
	});

	var mItemDataFilled;

	// Common test coding for several cases: bWithCount = showCounts switched on or off
	function fnConstruct(fnTestImplementation, bWithCount, bModeIsSwitchedOn, bDiffEntitySets, assert){
		fnPrepareEnvironment(bWithCount, bDiffEntitySets);
		var fnSetInitialKey = sandbox.spy();
		var setModelDataForItem = sandbox.spy();
		sEntitySet2 = sEntitySet1 + (bDiffEntitySets ? "2" : "");
		mItemDataFilled = {
				"_tab1": {
					id: "_tab1",
					entitySet: sEntitySet1,
					properties: []
				},
				"_tab2": {
					id: "_tab2",
					entitySet: sEntitySet2,
					properties: []
				}
			};
		var getSelectionVariantFilters = sandbox.spy(oTemplateUtils.oCommonUtils, "getSelectionVariantFilters");
		if (!!bModeIsSwitchedOn) {
			mControls["template::IconTabBar"] = oIconTabBar;
		} else {
			mControls["template::IconTabBar"] = null;
			mItemData = null;
		}
		var fnAttachSearch = sandbox.spy(oState.oSmartFilterbar, "attachSearch");
		var oMultipleViewsMultipleTablesModeHelper = new MultipleViewsMultipleTablesModeHelper(oQuickVariantSelectionX, oState, oController, oTemplateUtils,  fnSetInitialKey, mItemData, setModelDataForItem);
//		for (var i in oQuickVariantSelectionX.variants) {
//			var oEvent = getEventForInit(oQuickVariantSelectionX.variants[i].key);
//			oMultipleViewsMultipleTablesModeHelper.init(oEvent, setModelDataForItem);
//		}
		fnTestImplementation(oMultipleViewsMultipleTablesModeHelper, fnSetInitialKey, fnAttachSearch, getSelectionVariantFilters, setModelDataForItem, assert);
	}

	function fnTestWithSwitchOn(oMultipleViewsMultipleTablesModeHelper, fnSetInitialKey, fnAttachSearch, getSelectionVariantFilters, setModelDataForItem, assert) {
		assert.ok(!!oMultipleViewsMultipleTablesModeHelper, "Constructor could be called");
		assert.ok(fnSetInitialKey.calledOnce, "Initial key must have been set");
		assert.ok(fnSetInitialKey.calledWithExactly("_tab1"), "Initial key must have been set to the correct value");
		assert.deepEqual(mItemData, mItemDataFilled, "mItemData is filled in Constructor correctly");
		assert.ok(fnAttachSearch.calledOnce, "attachSearch was called once");
		assert.ok(setModelDataForItem.calledTwice, "Data for exactly two items must have been set");
		assert.strictEqual(setModelDataForItem.firstCall.args[0], "_tab1", "Key for first item must have been set correctly");
		assert.strictEqual(setModelDataForItem.secondCall.args[0], "_tab2", "Key for second item must have been set correctly");
		assert.notOk(oMultipleViewsMultipleTablesModeHelper.getIsDifferentEntitySets(), "bDifferentEntitySets should be false");
	}

	function fnTestWithswitchOff(oMultipleViewsMultipleTablesModeHelper, fnSetInitialKey, fnAttachSearch, getSelectionVariantFilters, setModelDataForItem, assert) {
		assert.ok(!!oMultipleViewsMultipleTablesModeHelper, "Constructor could be called");
		assert.ok(!fnSetInitialKey.called, "fnSetInitialKey should not be called if the switch is off");
		assert.deepEqual(mItemData, null, "mItemData should not be filled if the switch is off");
		assert.ok(!fnAttachSearch.called, "attachSearch should not be called if the switch is off");
		assert.ok(!getSelectionVariantFilters.called, "getSelectionVariantFilters should not be called if the switch is off");
		assert.ok(!setModelDataForItem.called, "setModelDataForItem should not be called if the switch is off");
	}
	test("Constructor for switched on case", fnConstruct.bind(null, fnTestWithSwitchOn, true, true, false));

	test("Constructor for switched off case", fnConstruct.bind(null, fnTestWithswitchOff, false, false, false));

	function fnAddMoreAttributesToItems() {
		for (var sItemData in mItemData) {
			mItemData[sItemData].implementingControl = {
					getCurrentVariantId: getGetKey("currentVariantId"),
					getId: getGetKey(mItemData[sItemData].id),
					setCurrentVariantId: function() {}
			}
		}
	}

	function fnTestGetContentForIappState(oMultipleViewsMultipleTablesModeHelper, fnSetInitialKey, fnAttachSearch, getSelectionVariantFilters, setModelDataForItem, assert) {
		fnAddMoreAttributesToItems();
		var sSelectedKey = "tab1";
		var oContentForIappStateReceived = oMultipleViewsMultipleTablesModeHelper.getContentForIappState(sSelectedKey);
		var oContentForIappStateExpected = {
				selectedTab: "tab1",
				tableVariantIds: {
					"_tab1": "currentVariantId",
					"_tab2": "currentVariantId"
				}
			};
		assert.deepEqual(oContentForIappStateReceived, oContentForIappStateExpected, "the returned object is correct");
	}

	test("Method getContentForIappState", fnConstruct.bind(null, fnTestGetContentForIappState, true, true, false));

	var oTmpTable;
	function fnTestGetSelectedKeyAndRestoreFromIappState(oMultipleViewsMultipleTablesModeHelper, fnSetInitialKey, fnAttachSearch, getSelectionVariantFilters, setModelDataForItem, assert) {
		fnAddMoreAttributesToItems();
		var sSelectedKey = "tab2";
		var oInput = {
				selectedTab: sSelectedKey,
				tableVariantIds: {
					"_tab1": "currentVariantId",
					"_tab2": ""
				}
			};
		var sSelectedKeyReturned = oMultipleViewsMultipleTablesModeHelper.getSelectedKeyAndRestoreFromIappState(oInput);
		assert.equal(sSelectedKeyReturned, sSelectedKey, "the returned value is correct");
	}

	test("Method getSelectedKeyAndRestoreFromIappState", fnConstruct.bind(null, fnTestGetSelectedKeyAndRestoreFromIappState, true, true, false));

	function fnTestRegisterToChartEvents(oMultipleViewsMultipleTablesModeHelper, fnSetInitialKey, fnAttachSearch, getSelectionVariantFilters, setModelDataForItem, assert) {
		var oSmartChart = new SmartChart();
		var oEvent = {
			getSource: function() {
				return oSmartChart;
			}
		};
		sandbox.stub(oSmartChart, "getChart").returns({attachSelectData: jQuery.noop, attachDeselectData: jQuery.noop});
		var oChart = oSmartChart.getChart();
		var fnAttachSelectDataSpy = sandbox.spy(oChart, "attachSelectData");
		var fnAttachDeselectDataSpy = sandbox.spy(oChart, "attachDeselectData");
		oMultipleViewsMultipleTablesModeHelper.fnRegisterToChartEvents(oEvent);
		assert.ok(fnAttachSelectDataSpy.calledOnce, "attachSelectData for Chart was called once");
		assert.ok(fnAttachDeselectDataSpy.calledOnce, "attachDeselectData for Chart was called once");
		// assert.equal(fnAttachSelectDataSpy.args[0][0].name, "onChartSelectData", "attachSelectData was called with 'onChartSelectData' function as an argument");
		// assert.equal(fnAttachDeselectDataSpy.args[0][0].name, "onChartSelectData", "attachDeselectData was called with 'onChartSelectData' function as an argument");
	}

	test("Method fnRegisterToChartEvents", fnConstruct.bind(null, fnTestRegisterToChartEvents, true, true, false));

	function fnTestOnDetailsActionPress(oMultipleViewsMultipleTablesModeHelper, fnSetInitialKey, fnAttachSearch, getSelectionVariantFilters, setModelDataForItem, assert) {
		var oChart = {getParent: {}};
		var oEvent = {
			getSource: function() {
				return oChart;
			},
			getParameter: function(itemContext) {
				return itemContext;
			}
		};
		var fnOnListNavigateSpy = sandbox.spy(oTemplateUtils.oCommonEventHandlers, "onListNavigate");
		oMultipleViewsMultipleTablesModeHelper.onDetailsActionPress(oEvent);
		assert.ok(fnOnListNavigateSpy.calledOnce, "oTemplateUtils.oCommonEventHandlers.onListNavigate was called");
	}

	test("Method onDetailsActionPress", fnConstruct.bind(null, fnTestOnDetailsActionPress, true, true, false));

//	///////

	module("Different EnitySets", {
		setup : fnCommonSetUp,
		teardown: fnCommonTeardown
	});

	function fnTestDiffEntitySet(oMultipleViewsMultipleTablesModeHelper, fnSetInitialKey, fnAttachSearch, getSelectionVariantFilters, setModelDataForItem, assert) {
		assert.ok(!!oMultipleViewsMultipleTablesModeHelper, "Constructor could be called");
		assert.ok(fnSetInitialKey.calledOnce, "Initial key must have been set");
		assert.ok(fnSetInitialKey.calledWithExactly("_tab1"), "Initial key must have been set to the correct value");
		assert.deepEqual(mItemData, mItemDataFilled, "mItemData is filled in Constructor correctly");
		assert.ok(fnAttachSearch.calledOnce, "attachSearch was called once");
		assert.ok(setModelDataForItem.calledTwice, "Data for exactly two items must have been set");
		assert.strictEqual(setModelDataForItem.firstCall.args[0], "_tab1", "Key for first item must have been set correctly");
		assert.strictEqual(setModelDataForItem.secondCall.args[0], "_tab2", "Key for second item must have been set correctly");
		assert.ok(!!oMultipleViewsMultipleTablesModeHelper.getIsDifferentEntitySets(), "bDifferentEntitySets is set correctly in the constructor");
	}

	test("Method fnTestDiffEntitySet", fnConstruct.bind(null, fnTestDiffEntitySet, true, true, true));

});