// Use this test page to test the API and features of the FieldHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 6]*/

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/base/FieldValueHelp",
	"sap/ui/mdc/base/FieldValueHelpContentWrapperBase",
	"sap/ui/mdc/base/FilterOperatorConfig",
	"sap/ui/mdc/base/Condition",
	"sap/ui/mdc/base/ConditionModel",
	"sap/ui/mdc/base/InParameter",
	"sap/ui/mdc/base/OutParameter",
	"sap/ui/mdc/base/FilterField",
	"sap/ui/mdc/base/filterbar/FilterBar",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String"
], function (
		qutils,
		FieldValueHelp,
		FieldValueHelpContentWrapperBase,
		FilterOperatorConfig,
		Condition,
		ConditionModel,
		InParameter,
		OutParameter,
		FilterField,
		FilterBar,
		Icon,
		JSONModel,
		StringType
	) {
	"use strict";

	var iDialogDuration = sap.ui.getCore().getConfiguration().getAnimationMode() === "none" ? 15 : 500;
	var iPopoverDuration = 355;

	var oModel = new JSONModel({
		items:[{text: "Item 1", key: "I1", additionalText: "Text 1"},
		       {text: "Item 2", key: "I2", additionalText: "Text 2"},
		       {text: "X-Item 3", key: "I3", additionalText: "Text 3"}],
		test: "Hello"
		});
	sap.ui.getCore().setModel(oModel);

	var oDialogContent;
	var oSuggestContent;
	var oWrapper;
	var oListBinding;
	var oFieldHelp;
	var oField;
	var oField2;
	var oFilterOperatorConfig;
	var oType;
	var iDisconnect = 0;
	var iSelect = 0;
	var aSelectConditions;
	var bSelectAdd;
	var sSelectId;
	var iNavigate = 0;
	var sNavigateValue;
	var sNavigateKey;
	var sNavigateId;
	var oNavigateCondition;
	var iDataUpdate = 0;
	var sDataUpdateId;
	var iOpen = 0;
	var bOpenSuggest;

	var _myDisconnectHandler = function(oEvent) {
		iDisconnect++;
	};

	var _mySelectHandler = function(oEvent) {
		iSelect++;
		aSelectConditions = oEvent.getParameter("conditions");
		bSelectAdd = oEvent.getParameter("add");
		sSelectId = oEvent.oSource.getId();
	};

	var _myNavigateHandler = function(oEvent) {
		iNavigate++;
		sNavigateValue = oEvent.getParameter("value");
		sNavigateKey = oEvent.getParameter("key");
		sNavigateId = oEvent.oSource.getId();
		oNavigateCondition = oEvent.getParameter("condition");
	};

	var _myDataUpdateHandler = function(oEvent) {
		iDataUpdate++;
		sDataUpdateId = oEvent.oSource.getId();
	};

	var _myOpenHandler = function(oEvent) {
		iOpen++;
		bOpenSuggest = oEvent.getParameter("suggestion");
	};

	/* first test it without the Field to prevent loading of popup etc. */
	/* use dummy control to simulate Field */

	var _initFields = function() {
		oField = new Icon("I1", {src:"sap-icon://sap-ui5"});
		oField2 = new Icon("I2", {src:"sap-icon://sap-ui5"});

		oFilterOperatorConfig = FilterOperatorConfig.getFor();
		oType = new StringType();
		oField.getFieldPath = function() {return "key";};
		oField._getOnlyEEQ = function() {return true;};
		oField._getFormatOptions = function() {
			return {
				filterOperatorConfig: oFilterOperatorConfig,
				valueType: oType,
				maxConditions: -1
				};
		};

		oField2.getFieldPath = function() {return "key";};
		oField2.getMaxConditions = function() {return -1;};
		oField2._getOnlyEEQ = function() {return false;};
		oField2.getDisplay = function() {return "Value";};
		oField2.getRequired = function() {return true;};
		oField2.getDataType = function() {return "Edm.String";};
		oField2._getFilterOperatorConfig = function() {return oFilterOperatorConfig;};
		oField2._getDataType = function() {return oType;};
		oField2._getFormatOptions = function() {
			return {
				filterOperatorConfig: oFilterOperatorConfig,
				valueType: oType,
				maxConditions: -1
				};
		};

		oField.placeAt("content");
		oField2.placeAt("content");
		sap.ui.getCore().applyChanges();
	};

	var _initFieldHelp = function() {
		oDialogContent = new Icon("DC1", {src:"sap-icon://sap-ui5"});
		oSuggestContent = new Icon("SC1", {src:"sap-icon://sap-ui5"});

		oListBinding = oModel.bindList("/items");
		oWrapper = new FieldValueHelpContentWrapperBase("W1");
		sinon.spy(oWrapper, "initialize");
		sinon.stub(oWrapper, "getDialogContent").returns(oDialogContent);
		sinon.stub(oWrapper, "getSuggestionContent").returns(oSuggestContent);
		sinon.spy(oWrapper, "fieldHelpOpen");
		sinon.spy(oWrapper, "fieldHelpClose");
		sinon.spy(oWrapper, "getFilterEnabled");
		sinon.spy(oWrapper, "navigate");
		var oStub = sinon.stub(oWrapper, "getTextForKey").returns("");
		oStub.withArgs("I1").returns("Item 1");
		oStub.withArgs("I2").returns("Item 2");
		oStub.withArgs("I3").returns("X-Item 3");
		oStub = sinon.stub(oWrapper, "getKeyForText");
		oStub.withArgs("Item 1").returns("I1");
		oStub.withArgs("Item 2").returns("I2");
		oStub.withArgs("X-Item 3").returns("I3");
		sinon.stub(oWrapper, "getListBinding").returns(oListBinding);

		oFieldHelp = new FieldValueHelp("F1-H", {
					disconnect: _myDisconnectHandler,
					select: _mySelectHandler,
					navigate: _myNavigateHandler,
					dataUpdate: _myDataUpdateHandler,
					open: _myOpenHandler,
					content: oWrapper,
					filterFields: "*text,additionalText*",
					descriptionPath: "text"
				});
		_initFields();
		oField.addDependent(oFieldHelp);
		oFieldHelp.connect(oField);
	};

	var _teardown = function() {
		oDialogContent.destroy();
		oDialogContent = undefined;
		oSuggestContent.destroy();
		oSuggestContent = undefined;
		oListBinding.destroy();
		oListBinding = undefined;
		oWrapper.destroy();
		oWrapper = undefined;
		oFieldHelp.destroy();
		oFieldHelp = undefined;
		oField.destroy();
		oField = undefined;
		oField2.destroy();
		oField2 = undefined;
		oFilterOperatorConfig.destroy();
		oFilterOperatorConfig = undefined;
		oType.destroy();
		oType = undefined;
		iDisconnect = 0;
		iSelect = 0;
		aSelectConditions = undefined;
		bSelectAdd = undefined;
		sSelectId = undefined;
		iNavigate = 0;
		sNavigateValue = undefined;
		sNavigateKey = undefined;
		sNavigateId = undefined;
		oNavigateCondition = undefined;
		iDataUpdate = 0;
		sDataUpdateId = undefined;
		iOpen = 0;
		bOpenSuggest = undefined;
	};

	QUnit.module("ValueHelp", {
		beforeEach: _initFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("default values", function(assert) {

		assert.ok(oFieldHelp.openByTyping(), "openByTyping");
		assert.equal(oFieldHelp.getIcon(), "sap-icon://value-help", "Icon for FieldHelp");

	});

	QUnit.test("getTextForKey", function(assert) {

		var sText = oFieldHelp.getTextForKey("I2");
		assert.equal(sText, "Item 2", "Text for key");
		assert.ok(oWrapper.getTextForKey.calledWith("I2"), "getTextForKey of Wrapper called");

		sText = oFieldHelp.getTextForKey("Test");
		assert.equal(sText, "", "Text for not existing key");

		oFieldHelp.addOutParameter(new OutParameter({value: "{test}", helpPath: "myTest"}));
		sText = oFieldHelp.getTextForKey("I2", undefined, {test: "X"});
		assert.equal(sText, "Item 2", "Text for key");
		assert.ok(oWrapper.getTextForKey.calledWith("I2", undefined, {myTest: "X"}), "getTextForKey of Wrapper called with outParameter");

		oFieldHelp.addInParameter(new InParameter({value: "{testIn}", helpPath: "myTestIn"}));
		sText = oFieldHelp.getTextForKey("I2", {testIn: "X"}, {test: "Y"});
		assert.equal(sText, "Item 2", "Text for key");
		assert.ok(oWrapper.getTextForKey.calledWith("I2", {myTestIn: "X"}, {myTest: "Y"}), "getTextForKey of Wrapper called with outParameter");

	});

	QUnit.test("getKeyForText", function(assert) {

		var sKey = oFieldHelp.getKeyForText("Item 2");
		assert.equal(sKey, "I2", "key for text");
		assert.ok(oWrapper.getKeyForText.calledWith("Item 2"), "getKeyForText of Wrapper called");

		sKey = oFieldHelp.getKeyForText("X");
		assert.notOk(sKey, "key for not existing text");

	});

	QUnit.test("onFieldChange", function(assert) {

		var oOutParameter = new OutParameter({value: "{/test}", helpPath: "myTest"});
		oFieldHelp.addOutParameter(oOutParameter);
		var oCondition = Condition.createCondition("EEQ", ["Test", "Test Text"], undefined, {"/test": "Test"});
		oFieldHelp.setConditions([oCondition]);

		oFieldHelp.onFieldChange();
		assert.equal(oOutParameter.getValue(), "Test", "Out-parameter updated");

		oOutParameter.destroy();
		oOutParameter = new OutParameter({value: "{cm>/conditions/test}", helpPath: "myTest"});
		var oCM = new ConditionModel();
		oOutParameter.setModel(oCM, "cm");
		oFieldHelp.addOutParameter(oOutParameter);
		oCondition = Condition.createCondition("EEQ", ["Test", "Test Text"], undefined, {"test": "Test"});
		var oCondition2 = Condition.createCondition("EEQ", ["Test2", "Test Text2"], undefined, {"test": "Test2"});
		oFieldHelp.setConditions([oCondition, oCondition2]);

		oFieldHelp.onFieldChange();
		var vValue = oOutParameter.getValue();
		assert.ok(Array.isArray(vValue), "OutParameter contains array");
		assert.equal(vValue.length, 2, "Out-parameter 2 entries");
		assert.equal(vValue[0].operator, "EEQ", "Out-parameter[0] operator");
		assert.equal(vValue[0].values[0], "Test", "Out-parameter[0] value");
		assert.equal(vValue[1].operator, "EEQ", "Out-parameter[1] operator");
		assert.equal(vValue[1].values[0], "Test2", "Out-parameter[1] value");
		var aConditions = oCM.getConditions("test");
		assert.equal(aConditions.length, 2, "ConditionModel 2 entries");

		oCM.destroy();

	});

	QUnit.module("Connect", {
		beforeEach: _initFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("getFilterOperatorConfig", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			oFieldHelp.connect(oField2);
			assert.equal(iDisconnect, 1, "Disconnect event fired");
			assert.equal(oFieldHelp.getFilterOperatorConfig(), oFilterOperatorConfig, "getFilterOperatorConfig returns FilterOperatorConfig of Field");
			fnDone();
		});

	});

	QUnit.test("getMaxConditions", function(assert) {

		assert.equal(oFieldHelp.getMaxConditions(), 1, "getMaxConditions default");

		oFieldHelp.connect(oField2);
		assert.equal(oFieldHelp.getMaxConditions(), -1, "MaxConditions taken from Field");

	});

	QUnit.test("getDisplay", function(assert) {

		assert.notOk(oFieldHelp.getDisplay(), "getDisplay default");

		oFieldHelp.connect(oField2);
		assert.equal(oFieldHelp.getDisplay(), "Value", "Display taken from Field");

	});

	QUnit.test("getRequired", function(assert) {

		assert.equal(oFieldHelp.getRequired(), false, "getRequired default");

		oFieldHelp.connect(oField2);
		assert.equal(oFieldHelp.getRequired(), true, "Required taken from Field");

	});

	QUnit.test("getDataType", function(assert) {

		assert.equal(oFieldHelp.getDataType(), "sap.ui.model.type.String", "getDataType default");

		oFieldHelp.connect(oField2);
		assert.equal(oFieldHelp.getDataType(), "Edm.String", "DataType taken from Field");

	});

	QUnit.test("_getDataType", function(assert) {

		assert.ok(oFieldHelp._getDataType(), "_getDataType default");
		assert.ok(oFieldHelp._getDataType().isA("sap.ui.model.odata.type.String", "_getDataType is sap.ui.model.odata.type.String"));

		oFieldHelp.connect(oField2);
		assert.equal(oFieldHelp._getDataType(), oType, "DataType taken from Field");

	});

	QUnit.module("Suggestion", {
		beforeEach: _initFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("content display in suggestion", function(assert) {

		oFieldHelp.open(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			setTimeout( function(){
				var oPopover = oFieldHelp.getAggregation("_popover");
				assert.ok(oPopover, "Popover created");
				if (oPopover) {
					assert.equal(iOpen, 1, "Open event fired");
					assert.ok(bOpenSuggest, "Open as suggestion");
					assert.ok(oPopover.isOpen(), "Popover is open");
					assert.ok(oWrapper.initialize.called, "Wrapper.initialize is called");
					assert.ok(oWrapper.fieldHelpOpen.calledWith(true), "fieldHelpOpen of Wrapper called");
					assert.ok(oWrapper.getSuggestionContent.called, "Wrapper.getSuggestionContent is called");
					assert.notOk(oWrapper.getDialogContent.called, "Wrapper.getDialogContent is not called");
					var oContent = oPopover._getAllContent()[0];
					assert.ok(oContent, "Popover has content");
					assert.equal(oContent.getId(), "SC1", "content is Popover content");
					assert.equal(iDataUpdate, 1, "DataUpdate event fired");
					assert.equal(oPopover.getInitialFocus(), "I1", "Initial focus on Field");
				}
				oFieldHelp.close();
				setTimeout( function(){
					assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
					fnDone();
				}, iPopoverDuration); // to wait until popover is closed
			}, iPopoverDuration); // to wait until popover is open
		});

	});

	QUnit.test("toggleOpen in suggestion", function(assert) {

		oFieldHelp.toggleOpen(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			var oPopover = oFieldHelp.getAggregation("_popover");
			if (oPopover) {
				assert.equal(iOpen, 1, "Open event fired");
				assert.ok(bOpenSuggest, "Open as suggestion");
				setTimeout( function(){
					assert.ok(oPopover.isOpen(), "Popover is open");
					oFieldHelp.toggleOpen(true);
					setTimeout( function(){
						assert.notOk(oPopover.isOpen(), "Popover is not open");
						fnDone();
					}, iPopoverDuration); // to wait until popover is closed
				}, iPopoverDuration); // to wait until popover is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("FilterValue in suggestion", function(assert) {

		oFieldHelp.setFilterValue("It");

		oFieldHelp.open(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			setTimeout( function(){
				assert.ok(oWrapper.getFilterEnabled.called, "Wrapper.getFilterEnabled is called");
				assert.ok(oWrapper.getListBinding.called, "Wrapper.getListBinding is called");
				var aContexts = oListBinding.getContexts();
				assert.equal(aContexts.length, 2, "List has 2 Items");
				oFieldHelp.setFilterValue("X");
				setTimeout( function(){
					aContexts = oListBinding.getContexts();
					assert.equal(aContexts.length, 1, "List has 1 Item");

					oFieldHelp.setFilterValue();
					oFieldHelp.addInParameter( new InParameter({ value: "Text 2", helpPath: "additionalText"}));
					setTimeout( function(){
						aContexts = oListBinding.getContexts();
						assert.equal(aContexts.length, 1, "List has 1 Item");
						assert.equal(aContexts[0].getObject().key, "I2", "Key of item");
						oFieldHelp.close();
						setTimeout( function(){
							assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
							fnDone();
						}, iPopoverDuration); // to wait until popover is closed
					}, 0); // update binding
				}, 0); // update binding
			}, iPopoverDuration); // to wait until popover is open
		});

	});

	QUnit.test("navigate in suggestion", function(assert) {

		oFieldHelp.navigate(1);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			assert.ok(oWrapper.navigate.calledWith(1), "Wrapper.navigate called");
			assert.equal(iOpen, 1, "Open event fired");
			oWrapper.fireNavigate({key: "I1", description: "Item 1"});
			setTimeout( function(){
				var oPopover = oFieldHelp.getAggregation("_popover");
				if (oPopover) {
					assert.ok(bOpenSuggest, "Open as suggestion");
					assert.ok(oPopover.isOpen(), "Field help opened");
					assert.equal(iNavigate, 1, "Navigate event fired");
					assert.equal(sNavigateValue, "Item 1", "Navigate event value");
					assert.equal(sNavigateKey, "I1", "Navigate event key");
					assert.ok(oNavigateCondition, "NavigateEvent condition");
					assert.equal(oNavigateCondition.operator, "EEQ", "NavigateEvent condition operator");
					assert.equal(oNavigateCondition.values[0], "I1", "NavigateEvent condition key");
					assert.equal(oNavigateCondition.values[1], "Item 1", "NavigateEvent condition description");
					assert.notOk(oNavigateCondition.hasOwnProperty("inParameters"), "no in-parameters set");
					assert.notOk(oNavigateCondition.hasOwnProperty("outParameters"), "no out-parameters set");

					oFieldHelp.addInParameter(new InParameter({value: "{testIn}", helpPath: "myTestIn"}));
					oFieldHelp.addOutParameter(new OutParameter({value: "{testOut}", helpPath: "myTestOut"}));
					oFieldHelp.navigate(1);
					oWrapper.fireNavigate({key: "I2", description: "Item 2", inParameters: {myTestIn: "X"}, outParameters: {myTestOut: "Y"}});
					assert.equal(iNavigate, 2, "Navigate event fired");
					assert.equal(sNavigateValue, "Item 2", "Navigate event value");
					assert.equal(sNavigateKey, "I2", "Navigate event key");
					assert.ok(oNavigateCondition, "NavigateEvent condition");
					assert.ok(oNavigateCondition.hasOwnProperty("inParameters"), "in-parameters set");
					assert.ok(oNavigateCondition.inParameters && oNavigateCondition.inParameters.hasOwnProperty("testIn"), "in-parameters has 'testIn'");
					assert.equal(oNavigateCondition.inParameters && oNavigateCondition.inParameters.testIn, "X", "in-parameters 'testIn'");
					assert.ok(oNavigateCondition.hasOwnProperty("outParameters"), "out-parameters set");
					assert.ok(oNavigateCondition.outParameters && oNavigateCondition.outParameters.hasOwnProperty("testOut"), "out-parameters has 'testOut'");
					assert.equal(oNavigateCondition.outParameters && oNavigateCondition.outParameters.testOut, "Y", "out-parameters 'testOut'");
				}
				oFieldHelp.close();
				setTimeout( function(){
					assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
					fnDone();
				}, iPopoverDuration); // to wait until popover is closed
			}, iPopoverDuration); // to wait until popover is open
		});

	});

	QUnit.test("select item in suggestion", function(assert) {

		oFieldHelp.open(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			var oPopover = oFieldHelp.getAggregation("_popover");
			if (oPopover) {
				setTimeout( function(){
					oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}]});
					setTimeout( function(){
						assert.equal(iSelect, 1, "Select event fired");
						assert.equal(aSelectConditions.length, 1, "one condition returned");
						assert.equal(aSelectConditions[0].operator, "EEQ", "Condition operator");
						assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
						assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
						assert.notOk(aSelectConditions[0].inParameters, "Condition no in-parameters");
						assert.notOk(aSelectConditions[0].outParameters, "Condition no out-parameters");
						assert.ok(bSelectAdd, "Items should be added");
						assert.notOk(oPopover.isOpen(), "Field help closed");
						fnDone();
					}, iPopoverDuration); // to wait until popover is closed
				}, iPopoverDuration); // to wait until popover is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("select item in suggestion using in/out-parameters", function(assert) {

		oFieldHelp.addInParameter(new InParameter({value: "{testIn}", helpPath: "myTestIn"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{testOut}", helpPath: "myTestOut"}));
		oFieldHelp.open(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			var oPopover = oFieldHelp.getAggregation("_popover");
			if (oPopover) {
				setTimeout( function(){
					oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2", inParameters: {myTestIn: "X"}, outParameters: {myTestOut: "Y"}}]});
					setTimeout( function(){
						assert.equal(iSelect, 1, "Select event fired");
						assert.equal(aSelectConditions.length, 1, "one condition returned");
						assert.equal(aSelectConditions[0].operator, "EEQ", "Condition operator");
						assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
						assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
						assert.ok(aSelectConditions[0].inParameters, "Condition in-parameters set");
						assert.ok(aSelectConditions[0].inParameters && aSelectConditions[0].inParameters.hasOwnProperty("testIn"), "Condition in-parameters has 'testIn'");
						assert.equal(aSelectConditions[0].inParameters && aSelectConditions[0].inParameters.testIn, "X", "Condition in-parameters 'test'");
						assert.ok(aSelectConditions[0].outParameters, "Condition out-parameters set");
						assert.ok(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.hasOwnProperty("testOut"), "Condition out-parameters has 'testOut'");
						assert.equal(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.testOut, "Y", "Condition out-parameters 'test'");
						assert.ok(bSelectAdd, "Items should be added");
						assert.notOk(oPopover.isOpen(), "Field help closed");
						fnDone();
					}, iPopoverDuration); // to wait until popover is closed
				}, iPopoverDuration); // to wait until popover is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("noDialog open", function(assert) {

		oFieldHelp.setNoDialog(true);
		assert.equal(oFieldHelp.getIcon(), "sap-icon://slim-arrow-down", "Icon for FieldHelp");

		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover", "sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Popover, Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			setTimeout( function(){
				var oPopover = oFieldHelp.getAggregation("_popover");
				var oDialog = oFieldHelp.getAggregation("_dialog");
				assert.ok(oPopover, "Popover created");
				assert.notOk(oDialog, "no dialog created");
				if (oPopover) {
					assert.equal(iOpen, 1, "Open event fired");
					assert.ok(bOpenSuggest, "Open as suggestion");
					assert.ok(oPopover.isOpen(), "Popover is open");
					assert.ok(oWrapper.getSuggestionContent.called, "Wrapper.getSuggestionContent is called");
					assert.notOk(oWrapper.getDialogContent.called, "Wrapper.getDialogContent is not called");
				}
				oFieldHelp.close();
				setTimeout( function(){
					assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
					fnDone();
				}, iPopoverDuration); // to wait until popover is closed
			}, iPopoverDuration); // to wait until popover is open
		});

	});

	QUnit.test("assign wrapper while opening", function(assert) {

		oFieldHelp.setContent();
		oFieldHelp.attachOpen(function(){
			if (!oFieldHelp.getContent()) {
				oFieldHelp.setContent(oWrapper);
			}
		});

		iDataUpdate = 0;
		oFieldHelp.open(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			setTimeout( function(){
				var oPopover = oFieldHelp.getAggregation("_popover");
				var oContent;
				if (oPopover) {
					assert.ok(oPopover.isOpen(), "Popover is open");
					assert.ok(oWrapper.getSuggestionContent.called, "Wrapper.getSuggestionContent is called");
					oContent = oPopover._getAllContent()[0];
					assert.ok(oContent, "Popover has content");
					assert.equal(oContent.getId(), "SC1", "content is Popover content");
					assert.equal(iDataUpdate, 1, "DataUpdate event fired");
				}
				oFieldHelp.close();
				setTimeout( function(){
					// test same but popover already exist
					oFieldHelp.setContent();
					iDataUpdate = 0;
					oFieldHelp.open(true);
					setTimeout( function(){
						assert.ok(oPopover.isOpen(), "Popover is open");
						oContent = oPopover._getAllContent()[0];
						assert.ok(oContent, "Popover has content");
						assert.equal(oContent.getId(), "SC1", "content is Popover content");
						assert.equal(iDataUpdate, 1, "DataUpdate event fired");
						oFieldHelp.close();
						setTimeout( function(){
							fnDone();
						}, iPopoverDuration); // to wait until popover is closed
					}, iPopoverDuration); // to wait until popover is open
				}, iPopoverDuration); // to wait until popover is closed
			}, iPopoverDuration); // to wait until popover is open
		});

	});

	QUnit.test("assign wrapper while navigate", function(assert) {

		oFieldHelp.setContent();
		oFieldHelp.attachOpen(function(){
			if (!oFieldHelp.getContent()) {
				setTimeout( function(){ // assign async
					oFieldHelp.setContent(oWrapper);
				}, 0);
			}
		});

		oWrapper.navigate.restore();
		sinon.stub(oWrapper, "navigate").callsFake(
				function() {
					oWrapper.fireNavigate({key: "I1", description: "Item 1"});
				}
		);

		iDataUpdate = 0;
		oFieldHelp.navigate(1); // so also navigation could be tested
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			setTimeout( function(){
				var oPopover = oFieldHelp.getAggregation("_popover");
				if (oPopover) {
					assert.ok(oPopover.isOpen(), "Popover is open");
					var oContent = oPopover._getAllContent()[0];
					assert.ok(oContent, "Popover has content");
					assert.equal(oContent.getId(), "SC1", "content is Popover content");
					assert.equal(iDataUpdate, 1, "DataUpdate event fired");
					assert.equal(iNavigate, 1, "Navigate event fired");
					assert.equal(sNavigateValue, "Item 1", "Navigate event value");
					assert.equal(sNavigateKey, "I1", "Navigate event key");
				}
				oFieldHelp.close();
				setTimeout( function(){
					fnDone();
				}, iPopoverDuration); // to wait until popover is closed
			}, iPopoverDuration); // to wait until popover is open
		});

	});

	QUnit.test("assign content while opening", function(assert) {

		oWrapper.getSuggestionContent.returns(null);
		oWrapper.getListBinding.returns(null);
		oFieldHelp.attachOpen(function(){
			if (!oWrapper.getSuggestionContent()) {
				setTimeout( function(){ // assign async
					oWrapper.getSuggestionContent.returns(oSuggestContent);
					oWrapper.getListBinding.returns(oListBinding);
					oWrapper.fireDataUpdate({contentChange: true});
				}, 0);
			}
		});

		iDataUpdate = 0;
		oFieldHelp.setFilterValue("It");
		oFieldHelp.open(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			setTimeout( function(){
				var oPopover = oFieldHelp.getAggregation("_popover");
				if (oPopover) {
					assert.ok(oPopover.isOpen(), "Popover is open");
					var oContent = oPopover._getAllContent()[0];
					assert.ok(oContent, "Popover has content");
					assert.equal(oContent.getId(), "SC1", "content is Popover content");
					assert.equal(iDataUpdate, 1, "DataUpdate event fired");
					var aContexts = oListBinding.getContexts();
					assert.equal(aContexts.length, 2, "List has 2 Items");
				}
				oFieldHelp.close();
				setTimeout( function(){
					fnDone();
				}, iPopoverDuration); // to wait until popover is closed
			}, iPopoverDuration); // to wait until popover is open
		});

	});

	QUnit.test("clone", function(assert) {

		oFieldHelp.open(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover"], function (Popover) {
			setTimeout( function(){
				var oClone = oFieldHelp.clone("MyClone");
				assert.ok(oClone, "FieldHelp cloned");
				oClone.connect(oField2);

				var oCloneWrapper = oClone.getContent();
				var oClonePopover = oClone.getAggregation("_popover");
				assert.ok(oCloneWrapper, "Clone has wrapper");
				assert.equal(oCloneWrapper.getId(), "W1-MyClone", "Id of cloned wrapper");
				assert.notOk(oClonePopover, "no Popover for clone created");

				iDataUpdate = 0;
				sDataUpdateId = undefined;
				oWrapper.fireDataUpdate({contentChange: false});
				assert.equal(iDataUpdate, 1, "DataUpdate event fired once");
				assert.equal(sDataUpdateId, oFieldHelp.getId(), "DataUpdate Id");

				iDataUpdate = 0;
				sDataUpdateId = undefined;
				oCloneWrapper.fireDataUpdate({contentChange: false});
				assert.equal(iDataUpdate, 1, "DataUpdate event on clone fired once");
				assert.equal(sDataUpdateId, oClone.getId(), "DataUpdate Id on clone");

				oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}]});
				assert.equal(iSelect, 1, "Select event fired once");
				assert.equal(sSelectId, oFieldHelp.getId(), "Select Id");

				iSelect = 0;
				sSelectId = undefined;
				oCloneWrapper.fireSelectionChange({selectedItems: [{key: "I1", description: "Item 1"}]});
				assert.equal(iSelect, 1, "Select event on clone fired once");
				assert.equal(sSelectId, oClone.getId(), "Select Id on clone");

				oWrapper.fireNavigate({key: "I1", description: "Item 1"});
				assert.equal(iNavigate, 1, "Navigate event fired once");
				assert.equal(sNavigateId, oFieldHelp.getId(), "Navigate Id");

				iNavigate = 0;
				sNavigateId = undefined;
				oCloneWrapper.fireNavigate({key: "I2", description: "Item 2"});
				assert.equal(iNavigate, 1, "Navigate event on clone fired once");
				assert.equal(sNavigateId, oClone.getId(), "Navigate Id on clone");

				oFieldHelp.close();
				setTimeout( function(){
					fnDone();
				}, iPopoverDuration); // to wait until popover is closed
			}, iPopoverDuration); // to wait until popover is open
		});

	});

	QUnit.module("Dialog", {
		beforeEach: _initFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("content display in dialog", function(assert) {

		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			setTimeout( function(){
				assert.ok(oDialog, "dialog created");
				if (oDialog) {
					assert.equal(iOpen, 1, "Open event fired");
					assert.notOk(bOpenSuggest, "Open not as suggestion");
					assert.ok(oDialog.isOpen(), "Dialog is open");
					assert.ok(oWrapper.initialize.called, "Wrapper.initialize is called");
					assert.ok(oWrapper.fieldHelpOpen.calledWith(false), "fieldHelpOpen of Wrapper called");
					assert.notOk(oWrapper.getSuggestionContent.called, "Wrapper.getSuggestionContent is  not called");
					assert.ok(oWrapper.getDialogContent.called, "Wrapper.getDialogContent is called");
					var oVHP = oDialog.getContent()[0];
					assert.ok(oVHP, "Dialog has content");
					assert.notOk(oVHP.getShowFilterbar(), "No FilterBar shown");
					assert.ok(oVHP && oVHP.isA("sap.ui.mdc.base.ValueHelpPanel"), "content is ValueHelpPanel");
					assert.equal(oVHP.getId(), "F1-H-VHP", "ValueHelpPanel ID");
					assert.equal(iDataUpdate, 1, "DataUpdate event fired");
					var oContent = oVHP.getTable();
					assert.ok(oContent, "ValueHelpPanel has table assigned");
					assert.equal(oContent.getId(), "DC1", "Content ID");
					assert.notOk(oVHP._oDefineConditionPanel, "no DefineConditionPanel");
					var aButtons = oDialog.getButtons();
					assert.equal(aButtons.length, 2, "Dialog has 2 Buttons");
					assert.equal(aButtons[0].getId(), "F1-H-ok", "Dialog has OK-Button");
					assert.equal(aButtons[1].getId(), "F1-H-cancel", "Dialog has Cancel-Button");
				}
				oFieldHelp.close();
				setTimeout( function(){
					assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
					fnDone();
				}, iDialogDuration); // to wait until dialog is closed
			}, iDialogDuration); // to wait until dialog is open
		});

	});

	QUnit.test("content changed in dialog", function(assert) {

		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			var oMyContent;
			setTimeout( function(){
				if (oDialog) {
					assert.equal(iOpen, 1, "Open event fired");
					assert.notOk(bOpenSuggest, "Open not as suggestion");
					assert.ok(oDialog.isOpen(), "Dialog is open");

					oMyContent = new Icon("DC2", {src:"sap-icon://sap-ui5"});
					oWrapper.getDialogContent.returns(oMyContent);
					oWrapper.fireDataUpdate({contentChange: true});

					var oVHP = oDialog.getContent()[0];
					assert.ok(oVHP, "Dialog has content");
					var oContent = oVHP.getTable();
					assert.ok(oContent, "ValueHelpPanel has table assigned");
					assert.equal(oContent.getId(), "DC2", "Content ID");
				}
				oFieldHelp.close();
				setTimeout( function(){
					oMyContent.destroy();
					fnDone();
				}, iDialogDuration); // to wait until dialog is closed
			}, iDialogDuration); // to wait until dialog is open
		});

	});

	QUnit.test("toggleOpen in dialog", function(assert) {

		oFieldHelp.toggleOpen(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
        function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				assert.equal(iOpen, 1, "Open event fired");
				assert.notOk(bOpenSuggest, "Open not as suggestion");
				setTimeout( function(){
					assert.ok(oDialog.isOpen(), "Dialog is open");
					oFieldHelp.toggleOpen(false);
					setTimeout( function(){
						assert.notOk(oDialog.isOpen(), "Dialog is not open");
						fnDone();
					}, iDialogDuration); // to wait until dialog is closed
				}, iDialogDuration); // to wait until dialog is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("open dialog while suggestion is open", function(assert) {

		oFieldHelp.open(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Popover", "sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Popover, Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oPopover = oFieldHelp.getAggregation("_popover");
			assert.ok(oPopover, "Popover created");
			if (oPopover) {
				setTimeout( function(){
					assert.ok(oPopover.isOpen(), "Popover is open");
					oFieldHelp.open(false);
					setTimeout( function(){
						var oDialog = oFieldHelp.getAggregation("_dialog");
						if (oDialog) {
							assert.equal(iOpen, 2, "Open event fired");
							assert.notOk(bOpenSuggest, "Open not as suggestion");
							assert.ok(oDialog.isOpen(), "Dialog is open");
							assert.notOk(oPopover.isOpen(), "Popover is not open");
							oFieldHelp.close(false);
							setTimeout( function(){
								fnDone();
							}, iDialogDuration); // to wait until dialog is closed
						}
					}, iPopoverDuration); // to wait until dialog is open and popover is closed
				}, iPopoverDuration); // to wait until popover is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("DefineConditionPanel in dialog", function(assert) {

		oFieldHelp.connect(oField2);
		oFieldHelp.setShowConditionPanel(true);
		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				var oVHP = oDialog.getContent()[0];
				assert.ok(oVHP, "Dialog has content");
				assert.ok(oVHP && oVHP.isA("sap.ui.mdc.base.ValueHelpPanel"), "content is ValueHelpPanel");
				var oContent = oVHP.getTable();
				assert.ok(oContent, "ValueHelpPanel has table assigned");
				assert.ok(oVHP._oDefineConditionPanel, "DefineConditionPanel assigned");
				var aButtons = oDialog.getButtons();
				assert.equal(aButtons.length, 2, "Dialog has 2 Buttons");
			}
			fnDone();
		});

	});

	QUnit.test("DefineConditionPanel without table in dialog", function(assert) {

		oFieldHelp.connect(oField2);
		oFieldHelp.setContent();
		oFieldHelp.setShowConditionPanel(true);
		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				var oVHP = oDialog.getContent()[0];
				assert.ok(oVHP, "Dialog has content");
				assert.ok(oVHP && oVHP.isA("sap.ui.mdc.base.ValueHelpPanel"), "content is ValueHelpPanel");
				var oContent = oVHP.getTable();
				assert.notOk(oContent, "ValueHelpPanel has no content assigned");
				assert.ok(oVHP._oDefineConditionPanel, "DefineConditionPanel assigned");
				var aButtons = oDialog.getButtons();
				assert.equal(aButtons.length, 2, "Dialog has 2 Buttons");
			}
			fnDone();
		});

	});

	QUnit.test("DefineConditionPanel for singleSelect fields in dialog", function(assert) {

		oFieldHelp.setShowConditionPanel(true);
		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				var oVHP = oDialog.getContent()[0];
				assert.ok(oVHP, "Dialog has content");
				assert.ok(oVHP && oVHP.isA("sap.ui.mdc.base.ValueHelpPanel"), "content is ValueHelpPanel");
				var oContent = oVHP.getTable();
				assert.ok(oContent, "ValueHelpPanel has content assigned");
				assert.equal(oContent.getId(), "DC1", "Content ID");
				assert.notOk(oVHP._oDefineConditionPanel, "no DefineConditionPanel");
				var aButtons = oDialog.getButtons();
				assert.equal(aButtons.length, 2, "Dialog has 2 Buttons");
			}
			fnDone();
		});

	});

	QUnit.test("title in dialog", function(assert) {

		oFieldHelp.setTitle("Title");
		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				assert.equal(oDialog.getTitle(), "Title", "Dialog title");
				oFieldHelp.setTitle("Title1");
				assert.equal(oDialog.getTitle(), "Title1", "Dialog title");
			}
			fnDone();
		});

	});

	QUnit.test("selected item in dialog", function(assert) {

		oFieldHelp.setConditions([Condition.createCondition("EEQ", ["I2", "Item 2"])]);

		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				var aItems = oWrapper.getSelectedItems();
				assert.equal(aItems.length, 1, "Wrapper: one selected item");
				assert.equal(aItems[0].key, "I2", "Item key");
				oFieldHelp.setConditions([Condition.createCondition("EEQ", ["I3", "Item 3"])]);
				aItems = oWrapper.getSelectedItems();
				assert.equal(aItems.length, 1, "Wrapper: one selected item");
				assert.equal(aItems[0].key, "I3", "Item key");
				fnDone();
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("select item in dialog", function(assert) {

		oFieldHelp.setConditions([Condition.createCondition("EEQ", ["I1", "Item 1"])]);
		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				setTimeout( function(){
					oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}]});
					assert.equal(iSelect, 0, "Select event not fired");

					var oValueHelpPanel = oDialog.getContent()[0];
					assert.notOk(oValueHelpPanel.getShowTokenizer(), "no Tokenizer shown");

					var aButtons = oDialog.getButtons();
					aButtons[0].firePress(); // simulate button press

					setTimeout( function(){
						assert.equal(iSelect, 1, "Select event fired after OK");
						assert.equal(aSelectConditions.length, 1, "one condition returned");
						assert.equal(aSelectConditions[0].operator, "EEQ", "Condition operator");
						assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
						assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
						assert.notOk(aSelectConditions[0].inParameters, "Condition no in-parameters");
						assert.notOk(aSelectConditions[0].outParameters, "Condition no out-parameters");
						assert.notOk(bSelectAdd, "Items should not be added");
						assert.notOk(oDialog.isOpen(), "Field help closed");
						var aConditions = oFieldHelp.getConditions();
						assert.equal(aConditions.length, 1, "one condition set");
						assert.equal(aConditions[0].operator, "EEQ", "Condition operator");
						assert.equal(aConditions[0].values[0], "I2", "Condition values[0}");
						assert.equal(aConditions[0].values[1], "Item 2", "Condition values[1}");
						assert.notOk(aConditions[0].inParameters, "Condition no in-parameters");
						assert.notOk(aConditions[0].outParameters, "Condition no out-parameters");
						fnDone();
					}, iDialogDuration); // wait until dialog is closed
				}, iDialogDuration); // to wait until dialog is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("select item in dialog using out-parameters", function(assert) {

		oFieldHelp.addInParameter(new InParameter({value: "{testIn}", helpPath: "myTestIn"}));
		oFieldHelp.addOutParameter(new OutParameter({value: "{testOut}", helpPath: "myTestOut"}));
		var oCondition = Condition.createCondition("EEQ", ["I1", "Item 1"], {test: "X"});
		oFieldHelp.setConditions([oCondition]);
		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				setTimeout( function(){
					oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2", inParameters: {myTestIn: "X"}, outParameters: {myTestOut: "Y"}}]});

					var aButtons = oDialog.getButtons();
					aButtons[0].firePress(); // simulate button press

					setTimeout( function(){
						assert.equal(iSelect, 1, "Select event fired after OK");
						assert.equal(aSelectConditions.length, 1, "one condition returned");
						assert.equal(aSelectConditions[0].operator, "EEQ", "Condition operator");
						assert.equal(aSelectConditions[0].values[0], "I2", "Condition values[0}");
						assert.equal(aSelectConditions[0].values[1], "Item 2", "Condition values[1}");
						assert.ok(aSelectConditions[0].inParameters, "Condition in-parameters set");
						assert.ok(aSelectConditions[0].inParameters && aSelectConditions[0].inParameters.hasOwnProperty("testIn"), "Condition in-parameters has 'testIn'");
						assert.equal(aSelectConditions[0].inParameters && aSelectConditions[0].inParameters.testIn, "X", "Condition in-parameters 'testIn'");
						assert.ok(aSelectConditions[0].outParameters, "Condition out-parameters set");
						assert.ok(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.hasOwnProperty("testOut"), "Condition out-parameters has 'testOut'");
						assert.equal(aSelectConditions[0].outParameters && aSelectConditions[0].outParameters.testOut, "Y", "Condition out-parameters 'testOut'");
						assert.notOk(bSelectAdd, "Items should not be added");
						assert.notOk(oDialog.isOpen(), "Field help closed");
						var aConditions = oFieldHelp.getConditions();
						assert.equal(aConditions.length, 1, "one condition set");
						assert.equal(aConditions[0].operator, "EEQ", "Condition operator");
						assert.equal(aConditions[0].values[0], "I2", "Condition values[0}");
						assert.equal(aConditions[0].values[1], "Item 2", "Condition values[1}");
						assert.ok(aConditions[0].inParameters, "Condition in-parameters set");
						assert.ok(aConditions[0].inParameters && aConditions[0].inParameters.hasOwnProperty("testIn"), "Condition in-parameters has 'testIn'");
						assert.equal(aConditions[0].inParameters && aConditions[0].inParameters.testIn, "X", "Condition in-parameters 'testIn'");
						assert.ok(aConditions[0].outParameters, "Condition out-parameters set");
						assert.ok(aConditions[0].outParameters && aConditions[0].outParameters.hasOwnProperty("testOut"), "Condition out-parameters has 'testOut'");
						assert.equal(aConditions[0].outParameters && aConditions[0].outParameters.testOut, "Y", "Condition out-parameters 'testOut'");
						fnDone();
					}, iDialogDuration); // wait until dialog is closed
				}, iDialogDuration); // to wait until dialog is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("select more items in dialog", function(assert) {

		oFieldHelp.connect(oField2);
		oFieldHelp.setConditions([Condition.createCondition("EEQ", ["I1", "Item 1"]),
		                          Condition.createCondition("StartsWith", ["X"])]);
		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				setTimeout( function(){
					oWrapper.fireSelectionChange({selectedItems: [{key: "I1", description: "Item 1"}, {key: "I2", description: "Item 2"}]});
					assert.equal(iSelect, 0, "Select event not fired");

					var oValueHelpPanel = oDialog.getContent()[0];
					assert.ok(oValueHelpPanel.getShowTokenizer(), "Tokenizer shown");

					var aButtons = oDialog.getButtons();
					aButtons[0].firePress(); // simulate button press

					setTimeout( function(){
						assert.equal(iSelect, 1, "Select event fired after OK");
						assert.equal(aSelectConditions.length, 3, "three conditions returned");
						assert.equal(aSelectConditions[0].operator, "EEQ", "Condition operator");
						assert.equal(aSelectConditions[0].values[0], "I1", "Condition values[0}");
						assert.equal(aSelectConditions[0].values[1], "Item 1", "Condition values[1}");
						assert.equal(aSelectConditions[1].operator, "StartsWith", "Condition operator");
						assert.equal(aSelectConditions[1].values[0], "X", "Condition values[0}");
						assert.equal(aSelectConditions[2].operator, "EEQ", "Condition operator");
						assert.equal(aSelectConditions[2].values[0], "I2", "Condition values[0}");
						assert.equal(aSelectConditions[2].values[1], "Item 2", "Condition values[1}");
						assert.notOk(bSelectAdd, "Items should not be added");
						assert.notOk(oDialog.isOpen(), "Field help closed");
						var aConditions = oFieldHelp.getConditions();
						assert.equal(aConditions.length, 3, "3 conditions set");
						assert.equal(aConditions[0].operator, "EEQ", "Condition operator");
						assert.equal(aConditions[0].values[0], "I1", "Condition values[0}");
						assert.equal(aConditions[0].values[1], "Item 1", "Condition values[1}");
						assert.equal(aConditions[1].operator, "StartsWith", "Condition operator");
						assert.equal(aConditions[1].values[0], "X", "Condition values[0}");
						assert.equal(aConditions[2].operator, "EEQ", "Condition operator");
						assert.equal(aConditions[2].values[0], "I2", "Condition values[0}");
						assert.equal(aConditions[2].values[1], "Item 2", "Condition values[1}");
						fnDone();
					}, iDialogDuration); // wait until dialog is closed
				}, iDialogDuration); // to wait until dialog is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("cancel dialog", function(assert) {

		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				setTimeout( function(){
					oWrapper.fireSelectionChange({selectedItems: [{key: "I2", description: "Item 2"}]});
					assert.equal(iSelect, 0, "Select event not fired");

					var aButtons = oDialog.getButtons();
					aButtons[1].firePress(); // simulate button press
					setTimeout( function(){
						assert.equal(iSelect, 0, "Select event not fired after Cancel");
						var aConditions = oFieldHelp.getConditions();
						assert.equal(aConditions.length, 0, "no conditions set");
						assert.notOk(oDialog.isOpen(), "Field help closed");
						fnDone();
					}, iDialogDuration); // wait until dialog is closed
				}, iDialogDuration); // to wait until dialog is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("search in Dialog", function(assert) {

		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			if (oDialog) {
				setTimeout( function(){
					var oVHP = oDialog.getContent()[0];
					var oSearchFilterField = oVHP.byId("SearchField2");
					var oSearchField = oSearchFilterField.getAggregation("_content");
					qutils.triggerCharacterInput(oSearchField.getFocusDomRef(), "-" );
					oSearchField.setValue("-"); // as onInput SearchField sets it's value
					qutils.triggerKeyup(oSearchField.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
					setTimeout( function(){
						assert.ok(oWrapper.getFilterEnabled.called, "Wrapper.getFilterEnabled is called");
						assert.ok(oWrapper.getListBinding.called, "Wrapper.getListBinding is called");
						var aContexts = oListBinding.getContexts();
						assert.equal(aContexts.length, 1, "List has 1 Item");
						oFieldHelp.close();
						setTimeout( function(){
							assert.ok(oWrapper.fieldHelpClose.called, "fieldHelpClose of Wrapper called");
							fnDone();
						}, iDialogDuration); // to wait until dialog is closed
					}, 0); // binding update is async
				}, iDialogDuration); // to wait until popover is open
			} else {
				fnDone();
			}
		});

	});

	QUnit.test("assign wrapper while opening", function(assert) {

		oFieldHelp.setContent();
		oFieldHelp.attachOpen(function(){
			if (!oFieldHelp.getContent()) {
				setTimeout( function(){
					oFieldHelp.setContent(oWrapper);
				}, 0);
			}
		});

		iDataUpdate = 0;
		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			setTimeout( function(){
				var oDialog = oFieldHelp.getAggregation("_dialog");
				if (oDialog) {
					assert.ok(oDialog.isOpen(), "Dialog is open");
					assert.ok(oWrapper.fieldHelpOpen.calledWith(false), "fieldHelpOpen of Wrapper called");
					assert.ok(oWrapper.getDialogContent.called, "Wrapper.getDialogContent is called");
					var oVHP = oDialog.getContent()[0];
					var oContent = oVHP.getTable();
					assert.ok(oContent, "ValueHelpPanel has table assigned");
					assert.equal(oContent.getId(), "DC1", "Content ID");
					assert.equal(iDataUpdate, 1, "DataUpdate event fired");
				}
				oFieldHelp.close();
				setTimeout( function(){
							fnDone();
				}, iDialogDuration); // to wait until dialog is closed
			}, iDialogDuration); // to wait until dialog is open
		});

	});

	var oFilterBar;
	var oFilterField;

	QUnit.module("FilterBar", {
		beforeEach: function() {
			_initFieldHelp();

			oFilterField = new FilterField("MyFilterField", {
				label: "Label",
				conditions: "{$filters>/conditions/additionalText}"
			});

			oFilterBar = new FilterBar("MyFilterBar", {
				liveMode: true,
				supportP13N: false,
				filterItems: [oFilterField]
			});

			oFieldHelp.setFilterBar(oFilterBar);
		},
		afterEach: function() {
			_teardown();
			oFilterBar = undefined; // destroyed vis FieldHelp
			oFilterField = undefined; // destroyed via FilterBar
		}
	});

	QUnit.test("FilterBar shown in dialog", function(assert) {

		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			setTimeout( function(){
				var oVHP = oDialog.getContent()[0];
				assert.ok(oVHP.getShowFilterbar(), "ValueHelpPanel showFilterbar");
				assert.ok(oVHP._oFilterbar, "ValueHelpPanel FilterBar used");
				assert.ok(oFilterBar.getDomRef(), "FilterBar rendered");

				oFilterField.setConditions([Condition.createCondition("Contains", ["2"])]); // fake change
				setTimeout( function(){
					setTimeout( function(){
						var aContexts = oListBinding.getContexts();
						assert.equal(aContexts.length, 1, "List has 1 Item");

						oFieldHelp.close();
						setTimeout( function(){
							fnDone();
						}, iDialogDuration); // to wait until dialog is closed
					}, 0); // update binding (FilterConditionModel)
				}, 0); // update binding (FilterBar)
			}, iDialogDuration); // to wait until dialog is open
		});

	});

	QUnit.test("FilterBar and in-parameter", function(assert) {

		oFieldHelp.addInParameter( new InParameter({ value: "Text 2", helpPath: "additionalText"}));
		oFieldHelp.open(false);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			var oDialog = oFieldHelp.getAggregation("_dialog");
			setTimeout( function(){
				var oVHP = oDialog.getContent()[0];
				assert.ok(oVHP.getShowFilterbar(), "ValueHelpPanel showFilterbar");
				assert.ok(oVHP._oFilterbar, "ValueHelpPanel FilterBar used");
				assert.ok(oFilterBar.getDomRef(), "FilterBar rendered");
				var aConditions = oFilterField.getConditions();
				assert.equal(aConditions.length, 1, "One condition in FilterField");
				assert.equal(aConditions[0].operator, "EQ", "Operator of Condition");
				assert.equal(aConditions[0].values[0], "Text 2", "Value of Condition");

				oFilterField.setConditions([]); // fake change
				setTimeout( function(){
					setTimeout( function(){
						var aContexts = oListBinding.getContexts();
						assert.equal(aContexts.length, 3, "List has 3 Items after update");

						oFieldHelp.close();
						setTimeout( function(){
							fnDone();
						}, iDialogDuration); // to wait until dialog is closed
					}, 0); // update binding (FilterConditionModel)
				}, 0); // update binding (FilterBar)
			}, iDialogDuration); // to wait until dialog is open
		});

	});

	QUnit.test("FilterBar in suggestion", function(assert) {

		oFilterField.setConditions([Condition.createCondition("Contains", ["2"])]);
		oFieldHelp.open(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Dialog", "sap/m/Button", "sap/ui/mdc/base/ValueHelpPanel", "sap/ui/mdc/base/DefineConditionPanel"],
				function (Dialog, Button, ValueHelpPanel, DefineConditionPanel) {
			setTimeout( function(){
				var aContexts = oListBinding.getContexts();
				assert.equal(aContexts.length, 3, "List has 3 Items");

				oFieldHelp.close();
				setTimeout( function(){
					fnDone();
				}, iDialogDuration); // to wait until dialog is closed
			}, iPopoverDuration); // to wait until popover is open
		});

	});

});