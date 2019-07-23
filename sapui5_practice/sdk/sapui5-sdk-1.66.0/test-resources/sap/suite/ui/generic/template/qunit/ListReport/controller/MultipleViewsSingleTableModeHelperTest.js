/**
 * tests for the sap.suite.ui.generic.template.ListReport.controller.MultipleViewsSingleTableModeHelper.js
 */
sap.ui.define([ "sap/ui/model/json/JSONModel",
				 "testUtils/sinonEnhanced",
				 "sap/suite/ui/generic/template/ListReport/controller/MultipleViewsSingleTableModeHelper"
				 ], function(JSONModel, sinon, MultipleViewsSingleTableModeHelper){
	"use strict";


	var sandbox; // sinon sandbox
	var bAreDataShownInTable;
	var oState = {
		oSmartTable: {},
		oSmartFilterbar: {},
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
		getAppComponent: function(){ return oAppComponent; }
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
	var oTemplateUtils = {
		oComponentUtils: {
			getTemplatePrivateModel: function(){
				return oTemplatePrivateModel;
			}
		},
		oCommonUtils: {
			getElementCustomData: function(oItem){
				for (var i = 0; i < aItems.length; i++){
					if (oItem === aItems[i]){
						return oItem.customData;
					}
				}
				throw new Error("customData must only retrieved for the items");
			}
		}
	};

	function getGetKey(sKey){
		return function(){ return sKey; };
	}

	var mSortOrders = {
		"1": { id: "SO" }
	};
	
	var oQuickVariantSelection;

	// simulates the functionality done by templating
	function fnCreateItems(){
		var oVariants = oQuickVariantSelection.variants;
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

	function fnPrepareEnvironment(bIsButton, bShowCounts){
		oQuickVariantSelection = {
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
		fnCreateItems();
		mControls[bIsButton ? "template::SegmentedButton" : "template::VariantSelect"] = oImplementingControl;
		mControls["listReport"] = {"getEntitySet": jQuery.noop};
	}

	function fnCommonSetUp(){
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

	// Common test coding for several cases: bWithCount = showCounts switched on or off, bIsButton = implementing control is a SegmentedButton or a Select
	function fnConstructAndSimpleTest(bWithCount, bIsButton, assert){
		fnPrepareEnvironment(bIsButton, bWithCount);
		var fnSetInitialKey = sandbox.spy();
		var setModelDataForItem = sandbox.spy();
		var oMultipleViewsSingleTableModeHelper = new MultipleViewsSingleTableModeHelper(oQuickVariantSelection, oState, oController, oTemplateUtils,  fnSetInitialKey, {}, setModelDataForItem);
		assert.ok(!!oMultipleViewsSingleTableModeHelper, "Constructor could be called");
		assert.ok(fnSetInitialKey.calledOnce, "Initial key must have been set");
		assert.ok(fnSetInitialKey.calledWithExactly("_tab1"), "Initial key must have been set to the correct value");
		assert.ok(setModelDataForItem.calledTwice, "Data for exactly two items must have been set");
		assert.strictEqual(setModelDataForItem.firstCall.args[0], "_tab1", "Key for first item must have been set correctly");
		assert.strictEqual(setModelDataForItem.firstCall.args[1], aItems[0], "First item must have been passed correctly to the item data");
		assert.strictEqual(setModelDataForItem.secondCall.args[0], "_tab2", "Key for second item must have been set correctly");
		assert.strictEqual(setModelDataForItem.secondCall.args[1], aItems[1], "Second item must have been passed correctly to the item data");
	}

	test("Constructor for switched on case without counts for SegmentedButton case", fnConstructAndSimpleTest.bind(null, false, true));
	test("Constructor for switched on case without counts for Select case", fnConstructAndSimpleTest.bind(null, false, false));
});