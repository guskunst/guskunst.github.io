/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 6]*/

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/library",
	"sap/ui/mdc/base/FieldBase",
	"sap/ui/mdc/base/FieldHelpBase",
	"sap/ui/mdc/base/FieldInfoBase",
	"sap/m/Label",
	"sap/ui/mdc/base/ConditionModel",
	"sap/ui/mdc/base/Condition",
	"sap/ui/mdc/base/type/ConditionsType",
	"sap/ui/mdc/base/type/ConditionType"
], function(
	jQuery,
	qutils,
	library,
	FieldBase,
	FieldHelpBase,
	FieldInfoBase,
	Label,
	ConditionModel,
	Condition,
	ConditionsType,
	ConditionType
) {
	"use strict";

	var oField;
	var oCM;
	var sId;
	var sValue;
	var bValid;
	var iCount = 0;

	var _myChangeHandler = function(oEvent) {
		iCount++;
		sId = oEvent.oSource.getId();
		bValid = oEvent.getParameter("valid");

		if (bValid) {
			var aConditions = oEvent.getParameter("conditions");
			if (aConditions.length == 1) {
				sValue = aConditions[0].values[0];
			}
		} else {
			sValue = oEvent.getParameter("wrongValue");
		}
	};

	var _myFireChange = function(aConditions, bValid, vWrongValue) {
		this.fireEvent("change", { conditions: aConditions, valid: bValid, wrongValue: vWrongValue });
	};

	var sLiveId;
	var sLiveValue;
	var iLiveCount = 0;

	var _myLiveChangeHandler = function(oEvent) {
		iLiveCount++;
		sLiveId = oEvent.oSource.getId();
		sLiveValue = oEvent.getParameter("value");
	};

	var sPressId;
	var iPressCount = 0;

	var _myPressHandler = function(oEvent) {
		iPressCount++;
		sPressId = oEvent.oSource.getId();
	};

	var iParseError = 0;
	var _myParseErrorHandler = function(oEvent) {
		iParseError++;
	};

	var iValidationError = 0;
	var _myValidationErrorHandler = function(oEvent) {
		iValidationError++;
	};

	QUnit.module("Field rendering", {
		beforeEach: function() {
			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}"
			});
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			oCM.destroy();
			oCM = undefined;
		}
	});

	QUnit.test("default rendering", function(assert) {

		oField.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				var oContent = oField.getAggregation("_content");
				assert.ok(oContent, "default content exist");
				assert.equal(oContent.getMetadata().getName(), "sap.m.MultiInput", "sap.m.MultiInput is default");
				assert.equal(oContent.getModel("$field"), oField._oManagedObjectModel, "MultiInput has ManagedObjectModel of Field");
				assert.equal(oContent.getBindingPath("tokens"), "/conditions", "MultiInput tokens bound to Field conditions");
				assert.notOk(oContent.getShowValueHelp(), "no valueHelp");
				assert.equal(oCM.getFilterField() && oCM.getFilterField().getId(), oField.getId(), "Field set on ConditionModel");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("EditMode", function(assert) {

		oField.setEditMode(library.EditMode.Display);
		oField.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Text", "sap/m/MultiInput"], function(Text, MultiInput) {
			setTimeout(function() {
				var oContent = oField.getAggregation("_content");
				assert.ok(oContent, "content exist");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getModel("$field"), oField._oManagedObjectModel, "Text has ManagedObjectModel of Field");
				assert.equal(oContent.getBindingPath("text"), "/conditions", "Text value bound to Fields Conditions");
				// TODO: test for formatter

				oField.setEditMode(library.EditMode.ReadOnly);
				sap.ui.getCore().applyChanges();
				setTimeout(function() {
					oContent = oField.getAggregation("_content");
					assert.ok(oContent, "content exist");
					assert.equal(oContent.getMetadata().getName(), "sap.m.MultiInput", "sap.m.MultiInput is used");
					if (oContent.getMetadata().getName() == "sap.m.MultiInput") {
						assert.equal(oContent.getModel("$field"), oField._oManagedObjectModel, "MultiInput has ManagedObjectModel of Field");
						assert.notOk(oContent.getEditable(), "MultiInput is not editable");
					}
					fnDone();
				}, 0);
			}, 0);
		});

	});

	QUnit.test("external control", function(assert) {

		var fnDone = assert.async();
		oField.setMaxConditions(1);
		oField.setDataType("Edm.Float");
		sap.ui.require(["sap/m/Slider", "sap/m/Input"], function(Slider, Input) {
			setTimeout(function() {
				var oSlider = new Slider("S1");
				oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType()});
				oField.setContent(oSlider);
				var oCondition = Condition.createCondition("EEQ", [70]);
				oCM.addCondition("Name", oCondition);
				oField.placeAt("content");
				sap.ui.getCore().applyChanges();

				setTimeout(function() {
					assert.notOk(!!oField.getAggregation("_content"), "Field has no internal content");
					assert.ok(oSlider.getDomRef(), "Slider rendered");
					assert.equal(oSlider.getValue(), 70, "Value of Slider");
					assert.equal(oSlider.getModel("$field"), oField._oManagedObjectModel, "Slider has ManagedObjectModel of Field");
					assert.equal(oSlider.getBindingPath("value"), "/conditions", "Slider value bound to Fields internal value");

					oField.destroyContent();
					sap.ui.getCore().applyChanges();
					setTimeout(function() {
						var oContent = oField.getAggregation("_content");
						assert.ok(oContent, "internal content exist");
						assert.equal(oContent.getMetadata().getName(), "sap.m.Input", "sap.m.Input is used");

						oSlider = new Slider("S1");
						oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType()});
						oField.setContent(oSlider);
						sap.ui.getCore().applyChanges();
						setTimeout(function() {
							assert.notOk(!!oField.getAggregation("_content"), "Field has no internal content");
							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		});

	});

	QUnit.test("external display control", function(assert) {

		var fnDone = assert.async();
		oField.setMaxConditions(1);
		oField.setDataType("Edm.Float");
		sap.ui.require(["sap/m/ProgressIndicator", "sap/m/Input", "sap/m/Text"], function(ProgressIndicator, Input, Text) {
			setTimeout(function() {
				var oProgressIndicator = new ProgressIndicator("P1");
				oProgressIndicator.bindProperty("percentValue", { path: '$field>/conditions', type: new ConditionsType()});
				oField.setContentDisplay(oProgressIndicator);
				var oCondition = Condition.createCondition("EEQ", [70]);
				oCM.addCondition("Name", oCondition);
				oField.placeAt("content");
				sap.ui.getCore().applyChanges();

				setTimeout(function() {
					var oContent = oField.getAggregation("_content");
					assert.ok(oContent, "Field has internal content");
					assert.equal(oContent && oContent.getMetadata().getName(), "sap.m.Input", "sap.m.Input is used");
					assert.notOk(oProgressIndicator.getDomRef(), "ProgressIndicator not rendered");
					assert.equal(oProgressIndicator.getPercentValue(), 70, "Value of ProgressIndicator");
					assert.equal(oProgressIndicator.getModel("$field"), oField._oManagedObjectModel, "ProgressIndicator has ManagedObjectModel of Field");
					assert.equal(oProgressIndicator.getBindingPath("percentValue"), "/conditions", "ProgressIndicator value bound to Fields internal value");

					oField.setEditMode(library.EditMode.Display);
					sap.ui.getCore().applyChanges();
					assert.notOk(!!oField.getAggregation("_content"), "Field has no internal content");
					assert.ok(oProgressIndicator.getDomRef(), "ProgressIndicator is rendered");

					oField.destroyContentDisplay();
					sap.ui.getCore().applyChanges();
					oContent = oField.getAggregation("_content");
					assert.ok(oContent, "internal content exist");
					assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
					fnDone();
				}, 0);
			}, 0);
		});

	});

	QUnit.test("external edit control", function(assert) {

		// event if SegmentedButton makes not much sense - just for test of list binding
		var fnDone = assert.async();
		sap.ui.require(["sap/m/SegmentedButton", "sap/m/SegmentedButtonItem", "sap/m/MultiInput", "sap/m/Text"], function(SegmentedButton, SegmentedButtonItem, MultiInput, Text) {
			setTimeout(function() {
				var oItem = new SegmentedButtonItem("SBI");
				oItem.bindProperty("text", { path: '$field>', type: new ConditionType()});
				var oSegmentedButton = new SegmentedButton("SB1");
				oSegmentedButton.bindAggregation("items", { path: '$field>/conditions', template: oItem });
				oField.setContentEdit(oSegmentedButton);
				var oCondition = Condition.createCondition("EQ", ["A"]);
				oCM.addCondition("Name", oCondition);
				oCondition = Condition.createCondition("EQ", ["B"]);
				oCM.addCondition("Name", oCondition);
				oField.placeAt("content");
				sap.ui.getCore().applyChanges();

				setTimeout(function() {
					var oContent = oField.getAggregation("_content");
					assert.notOk(!!oContent, "Field has no internal content");
					assert.ok(oSegmentedButton.getDomRef(), "SegmentedButton is rendered");
					var aItems = oSegmentedButton.getItems();
					assert.equal(aItems.length, 2, "SegmentedButton has 2 items");
					assert.equal(aItems[0].getText(), "=A", "Text of Item0");
					assert.equal(aItems[1].getText(), "=B", "Text of Item1");

					oField.setEditMode(library.EditMode.Display);
					sap.ui.getCore().applyChanges();
					oContent = oField.getAggregation("_content");
					assert.ok(oContent, "Field has internal content");
					assert.equal(oContent && oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
					assert.notOk(oSegmentedButton.getDomRef(), "SegmentedButton is not rendered");

					oField.setEditMode(library.EditMode.Edit);
					oField.destroyContentEdit();
					sap.ui.getCore().applyChanges();
					oContent = oField.getAggregation("_content");
					assert.ok(oContent, "internal content exist");
					assert.equal(oContent.getMetadata().getName(), "sap.m.MultiInput", "sap.m.MultiInput is used");
					fnDone();
				}, 0);
			}, 0);
		});

	});

	QUnit.test("getFocusDomRef", function(assert) {

		oField.placeAt("content");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			sap.ui.getCore().applyChanges();
			setTimeout(function() {
				assert.equal(oField.getFocusDomRef().id, "F1-inner-inner", "FocusDomRef");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("Label association", function(assert) {

		var oLabel = new Label("L1", { text: "test", labelFor: oField }).placeAt("content");
		oField.placeAt("content");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			sap.ui.getCore().applyChanges();
			setTimeout(function() {
				assert.equal(jQuery("#L1").attr("for"), "F1-inner-inner", "Label points to focusable DomRef");
				oLabel.destroy();
				fnDone();
			}, 0);
		});

	});

	QUnit.test("Label property & connectLabel", function(assert) {

		var oLabel = new Label("L1").placeAt("content");
		oField.setLabel("Test");
		oField.connectLabel(oLabel);

		assert.equal(oLabel.getText(), "Test", "Label text");
		assert.equal(oLabel.getLabelFor(), "F1", "Label labelFor");

		oField.setLabel("Hello");
		assert.equal(oLabel.getText(), "Hello", "Label text");

		oLabel.destroy();

	});

	QUnit.test("enhanceAccessibilityState", function(assert) {

		oField.placeAt("content");
		var oParent = oField.getParent();
		var iCalled = 0;
		var sId = "";
		if (oParent) { // simulate enhanceAccessibilityState
			oParent.enhanceAccessibilityState = function(oElement, mAriaProps) {
				iCalled++;
				sId = oElement.getId();
			};
		}

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			sap.ui.getCore().applyChanges();
			setTimeout(function() {
				assert.ok(iCalled >= 1, "enhanceAccessibilityState called on Parent");
				assert.equal(sId, "F1", "enhanceAccessibilityState called for Field");
				delete oParent.enhanceAccessibilityState;
				fnDone();
			}, 0);
		});

	});

	QUnit.module("Field APIs", {
		beforeEach: function() {
			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}"
			});
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			oCM.destroy();
			oCM = undefined;
		}
	});

	QUnit.test("_getFilterOperatorConfig", function(assert) {

		assert.equal(oField._getFilterOperatorConfig(), oCM.getFilterOperatorConfig(), "return FilterOperatorConfig of ConditionModel");

		var oField2 = new FieldBase("F2");
		var oFilterOperatorConfig = oField2._getFilterOperatorConfig();
		assert.ok(oFilterOperatorConfig, "return new FilterOperatorConfig");
		assert.equal(oField2._getFilterOperatorConfig(), oFilterOperatorConfig, "same FilterOperatorConfig returned");
		oField2.destroy();

	});

	QUnit.test("_getOnlyEEQ", function(assert) {

		assert.notOk(oField._getOnlyEEQ(), "default");
		oField.setProperty("_onlyEEQ", true);
		assert.ok(oField._getOnlyEEQ(), "if set");

	});

	var oFieldEditMulti, oFieldEditSingle, oFieldDisplay, oFieldSearch;

	QUnit.module("conditions & properties", {
		beforeEach: function() {
			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");

			oFieldEditMulti = new FieldBase("F1", { editMode: library.EditMode.Editable, conditions: "{cm>/conditions/Name}" });
			oFieldEditSingle = new FieldBase("F2", { editMode: library.EditMode.Editable, conditions: "{cm>/conditions/Name}", maxConditions: 1 });
			oFieldEditSingle.setProperty("_onlyEEQ", true);
			oFieldDisplay = new FieldBase("F3", { editMode: library.EditMode.Display, conditions: "{cm>/conditions/Name}" });
			oFieldSearch = new FieldBase("F4", { maxConditions: 1, conditions: "{cm>/conditions/$search}" });
			oFieldEditMulti.placeAt("content");
			oFieldEditSingle.placeAt("content");
			oFieldDisplay.placeAt("content");
			oFieldSearch.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oFieldEditMulti.destroy();
			oFieldEditSingle.destroy();
			oFieldDisplay.destroy();
			oFieldSearch.destroy();
			oFieldEditMulti = undefined;
			oFieldEditSingle = undefined;
			oFieldDisplay = undefined;
			oFieldSearch = undefined;
			oCM.destroy();
			oCM = undefined;
		}
	});

	QUnit.test("value", function(assert) {

		var oCondition = Condition.createCondition("EEQ", ["Test"]);
		oCM.addCondition("Name", oCondition);
		oCondition = Condition.createCondition("EEQ", ["bar"]);
		oCM.addCondition("$search", oCondition);

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput", "sap/m/Input", "sap/m/Text", "sap/m/SearchField"], function(MultiInput, Input, Text, SearchField) {
			setTimeout(function() {
				var oContent = oFieldEditMulti.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.MultiInput", "sap.m.MultiInput is used");
				assert.equal(oContent.getValue && oContent.getValue(), "", "no value set on MultiInput control");
				var aTokens = oContent.getTokens ? oContent.getTokens() : [];
				assert.equal(aTokens.length, 1, "MultiInput has one Token");
				var oToken = aTokens[0];
				assert.equal(oToken && oToken.getText(), "Test", "Text on token set");

				oContent = oFieldEditSingle.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Input", "sap.m.Input is used");
				assert.equal(oContent.getValue && oContent.getValue(), "Test", "Value set on Input control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText && oContent.getText(), "Test", "Text set on Text control");

				oContent = oFieldSearch.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.SearchField", "sap.m.SearchField is used");
				assert.equal(oContent.getValue && oContent.getValue(), "bar", "value set on Searchfield control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("description", function(assert) {

		oFieldEditMulti.setDisplay("DescriptionValue");
		var oCondition = Condition.createCondition("EEQ", ["Test", "Hello"]);
		oCM.addCondition("Name", oCondition);

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput", "sap/m/Input", "sap/m/Text"], function(MultiInput, Input, Text) {
			sap.ui.getCore().applyChanges();
			setTimeout(function() {
				var oContent = oFieldEditMulti.getAggregation("_content");
				var aTokens = oContent.getTokens ? oContent.getTokens() : [];
				var oToken = aTokens[0];
				assert.equal(oToken && oToken.getText(), "Hello (Test)", "Text on token set");

				oContent = oFieldEditSingle.getAggregation("_content");
				assert.equal(oContent.getValue && oContent.getValue(), "Test", "Value set on Input control");

				oFieldEditMulti.setDisplay(library.FieldDisplay.Description);
				oFieldEditSingle.setDisplay(library.FieldDisplay.Description);
				oFieldDisplay.setDisplay(library.FieldDisplay.DescriptionValue);

				setTimeout(function() {
					// TODO should token text also belong on the property???
					oContent = oFieldEditSingle.getAggregation("_content");
					assert.equal(oContent.getValue(), "Hello", "Value set on Input control");
					oContent = oFieldDisplay.getAggregation("_content");
					assert.equal(oContent.getText && oContent.getText(), "Hello (Test)", "Text set on Text control");

					oFieldEditMulti.setDisplay(library.FieldDisplay.ValueDescription);
					oFieldEditSingle.setDisplay(library.FieldDisplay.ValueDescription);
					oFieldDisplay.setDisplay(library.FieldDisplay.ValueDescription);

					//			oContent = oFieldEditSingle.getAggregation("_content");
					//			assert.equal(oContent.getValue(), "Test", "Value set on Input control");
					oContent = oFieldDisplay.getAggregation("_content");
					//					assert.equal(oContent.getText && oContent.getText(), "Test (Hello)", "Text set on Text control");
					fnDone();
				}, 0);
			}, 0);
		});

	});

	//	QUnit.test("displayFormat", function(assert) {
	//
	//		var sEmptyValue = null;
	//		var sEmptyAdditionalValue = null;
	//		var sValue = "Value";
	//		var sAdditionalValue = "Additional Value";
	//
	//		assert.ok(sValue,"Display Format Value:");
	//		assert.equal(Field.formatText(sEmptyValue,sEmptyAdditionalValue,library.FieldDisplay.Value), "", "If the value is empty we see the empty string");
	//		assert.equal(Field.formatText(sValue,sEmptyAdditionalValue,library.FieldDisplay.Value), sValue, "If the value is not empty we see the value");
	//		assert.equal(Field.formatText(sValue,sAdditionalValue,library.FieldDisplay.Value), sValue, "The additional value is ignored");
	//
	//		assert.ok(sValue,"Display Format Value ( Description ):");
	//		assert.equal(Field.formatText(sEmptyValue,sEmptyAdditionalValue,library.FieldDisplay.ValueDescription), "", "If both strings are empty we see the empty string");
	//		assert.equal(Field.formatText(sValue,sEmptyAdditionalValue,library.FieldDisplay.ValueDescription), sValue, "If additional value is empty, we see only the value");
	//		assert.equal(Field.formatText(sEmptyValue,sAdditionalValue,library.FieldDisplay.ValueDescription), " (" + sAdditionalValue + ")", "If the value is empty, we see the empty string for that");
	//		assert.equal(Field.formatText(sValue,sAdditionalValue,library.FieldDisplay.ValueDescription),  sValue + " (" + sAdditionalValue + ")", "If both are supplied we see sValue (sAdditionalValue)");
	//
	//		assert.ok(sValue,"Display Format Description (Value):");
	//		assert.equal(Field.formatText(sEmptyValue,sEmptyAdditionalValue,library.FieldDisplay.DescriptionValue), "", "If both strings are empty we see the empty string");
	//		assert.equal(Field.formatText(sValue,sEmptyAdditionalValue,library.FieldDisplay.DescriptionValue), " (" + sValue + ")", "If additional value is empty, we see (Value) for that");
	//		assert.equal(Field.formatText(sEmptyValue,sAdditionalValue,library.FieldDisplay.DescriptionValue), sAdditionalValue, "If the value is empty, we see only the additional value");
	//		assert.equal(Field.formatText(sValue,sAdditionalValue,library.FieldDisplay.DescriptionValue),  sAdditionalValue + " (" + sValue + ")", "If both are supplied we see sAdditionalValue (sValue)");
	//
	//
	//		assert.ok(sValue,"Display Format Description:");
	//		assert.equal(Field.formatText(sEmptyValue,sEmptyAdditionalValue,library.FieldDisplay.Description), "", "If the additional is empty  value we see the empty value for that");
	//		assert.equal(Field.formatText(sEmptyValue,sAdditionalValue,library.FieldDisplay.Description), sAdditionalValue, "If the additional value is nt empty we see the additional value");
	//		assert.equal(Field.formatText(sValue,sAdditionalValue,library.FieldDisplay.Description), sAdditionalValue, "The value is ignored");
	//
	//	});

	QUnit.test("multipleLines", function(assert) {

		var oCondition = Condition.createCondition("EEQ", ["Test"]);
		oCM.addCondition("Name", oCondition);
		oFieldEditMulti.setMultipleLines(true);
		oFieldEditSingle.setMultipleLines(true);
		oFieldDisplay.setMultipleLines(true);

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput", "sap/m/TextArea", "sap/m/Text"], function(MultiInput, TextArea, Text) {
			setTimeout(function() {
				// TODO Multiline on MultiEdit????
				var oContent = oFieldEditSingle.getAggregation("_content");
				assert.ok(oContent instanceof TextArea, "TextArea rendered");
				assert.equal(oContent.getValue && oContent.getValue(), "Test", "Text set on TextArea control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.ok(oContent instanceof Text, "Text rendered");
				assert.ok(oContent.getWrapping && oContent.getWrapping(), "Text wrapping enabled");
				assert.equal(oContent.getText && oContent.getText(), "Test", "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType Date", function(assert) {

		var oCondition = Condition.createCondition("EEQ", ["2017-09-19"]); // use ISO date to format it to locale specific one
		oCM.addCondition("Name", oCondition);
		oFieldEditMulti.setDataTypeFormatOptions({style: "long"});
		oFieldEditMulti.setDataType("Edm.Date");
		oFieldEditSingle.setDataTypeFormatOptions({style: "long", calendarType: "Japanese"});
		oFieldEditSingle.setDataType("Edm.Date");
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("Edm.Date");

		var oCondition = Condition.createCondition("EEQ", [new Date(Date.UTC(2018, 11, 20))]);
		oCM.addCondition("Date", oCondition);
		var oFieldEditSingle2 = new FieldBase("F5", {
			editMode: library.EditMode.Editable,
			conditions: "{cm>/conditions/Date}",
			maxConditions: 1,
			dataType: "sap.ui.model.odata.type.DateTime",
			dataTypeConstraints: {displayFormat: "Date"},
			dataTypeFormatOptions: {pattern: "dd/MM/yyyy"}
			});
		oFieldEditSingle2.setProperty("_onlyEEQ", true);
		oFieldEditSingle2.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput", "sap/m/DatePicker", "sap/m/Text"], function(MultiInput, DatePicker, Text) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oFieldEditMulti.getAggregation("_content");
				var oToken = oContent.getTokens()[0];
				assert.equal(oToken.getText(), "September 19, 2017", "Text set on Token");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "Sep 19, 2017", "Text set on Text control");

				oContent = oFieldEditSingle.getAggregation("_content");
				assert.ok(oContent instanceof DatePicker, "DatePicker rendered");
				assert.equal(oContent.getValue(), "2017-09-19", "Value set on DatePicker control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "September 19, 29 Heisei", "Value shown on DatePicker control");

				oContent = oFieldEditSingle2.getAggregation("_content");
				assert.ok(oContent instanceof DatePicker, "DatePicker rendered");
				assert.equal(oContent.getValue(), "2018-12-20", "Value set on DatePicker control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "20/12/2018", "Value shown on DatePicker control");
				oFieldEditSingle2.destroy();
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType TimeOfDay", function(assert) {

		var oCondition = Condition.createCondition("EEQ", ["19:00:00"]); // use ISO date to format it to locale specific one
		oCM.addCondition("Name", oCondition);
		oFieldEditSingle.setDataType("Edm.TimeOfDay");
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("Edm.TimeOfDay");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/TimePicker"], function(TimePicker) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oFieldEditSingle.getAggregation("_content");
				assert.ok(oContent instanceof TimePicker, "TimePicker rendered");
				assert.equal(oContent.getValue(), "19:00:00", "Value set on TimePicker control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), " 7:00:00 PM", "Value shown on TimePicker control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "7:00:00 PM", "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType DateTimeOffset", function(assert) {

		var oCondition = Condition.createCondition("EEQ", [new Date(2017, 10, 7, 13, 1, 24)]);
		oCM.addCondition("Name", oCondition);
		oFieldEditSingle.setDataTypeFormatOptions({pattern: "HH:mm:ss yyyy-MM-dd"});
		oFieldEditSingle.setDataType("Edm.DateTimeOffset");
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("Edm.DateTimeOffset");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/DateTimePicker"], function(DateTimePicker) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oFieldEditSingle.getAggregation("_content");
				assert.ok(oContent instanceof DateTimePicker, "DateTimePicker rendered");
				assert.equal(oContent.getValue(), "2017-11-07T13:01:24", "Value set on DateTimePicker control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "13:01:24 2017-11-07", "Value shown on DateTimePicker control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "Nov 7, 2017, 1:01:24 PM", "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType Boolean", function(assert) {

		var oCondition = Condition.createCondition("EEQ", [true]);
		oCM.addCondition("Name", oCondition);
		oFieldEditSingle.setDisplay("Description");
		oFieldEditSingle.setDataType("Edm.Boolean");
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("Edm.Boolean");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/ui/mdc/base/BoolFieldHelp"], function(Input, BoolFieldHelp) {
			setTimeout(function() {
				var oContent = oFieldEditSingle.getAggregation("_content");
				assert.ok(oContent instanceof Input, "Input rendered");
				assert.equal(oFieldEditSingle._sDefaultFieldHelp, "BoolDefaultHelp", "Default Field help set");
				var oFieldHelp = sap.ui.getCore().byId("BoolDefaultHelp");
				assert.ok(oFieldHelp && oFieldHelp instanceof BoolFieldHelp, "BoolFieldHelp used");
				assert.equal(oContent.getValue(), "Yes", "Value set on Input control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "Yes", "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType sap.ui.model.type.Currency", function(assert) {

		var oCondition = Condition.createCondition("EEQ", [[123.45, "USD"]]);
		oCM.addCondition("Name", oCondition);
		oFieldEditSingle.setDataType("sap.ui.model.type.Currency");
		oFieldEditSingle.setProperty("_onlyEEQ", true);
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("sap.ui.model.type.Currency");
		oFieldDisplay.setProperty("_onlyEEQ", true);
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/ui/model/type/Currency"], function(Input, Currency) {
			var oType = new Currency();
			sValue = oType.formatValue([123.45, "USD"], "string"); // because of special whitspaces and local dependend
			setTimeout(function() {
				var oContent = oFieldEditSingle.getAggregation("_content");
				assert.ok(oContent instanceof Input, "Input rendered");
				assert.equal(oContent.getValue(), sValue, "Value set on Input control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), sValue, "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("width", function(assert) {

		oFieldEditMulti.setWidth("100px");
		oFieldEditSingle.setWidth("100px");
		oFieldDisplay.setWidth("100px");
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#F1").width(), 100, "Width of Multi-Edit Field");
		assert.equal(jQuery("#F2").width(), 100, "Width of Single-Edit Field");
		assert.equal(jQuery("#F3").width(), 100, "Width of Display Field");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput", "sap/m/Input", "sap/m/Text"], function(MultiInput, Input, Text) {
			setTimeout(function() {
				var oContent = oFieldEditMulti.getAggregation("_content");
				assert.equal(oContent.getWidth(), "100%", "width of 100% set on MultiInput control");

				oContent = oFieldEditSingle.getAggregation("_content");
				assert.equal(oContent.getWidth(), "100%", "width of 100% set on Input control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getWidth(), "100%", "width of 100% set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("required", function(assert) {

		var oLabel = new Label("L1", { text: "test", labelFor: oFieldEditMulti }).placeAt("content");
		oFieldEditMulti.setRequired(true);

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function(Input) {
			setTimeout(function() {
				var oContent = oFieldEditMulti.getAggregation("_content");
				assert.ok(oContent.getRequired(), "Required set on Input control");
				assert.ok(oLabel.isRequired(), "Label rendered as required");
				oLabel.destroy();
				fnDone();
			}, 0);
		});

	});

	QUnit.test("placeholder", function(assert) {

		oFieldEditMulti.setPlaceholder("Test");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				var oContent = oFieldEditMulti.getAggregation("_content");
				assert.equal(oContent.getPlaceholder(), "Test", "Placeholder set on MultiInput control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("valueState", function(assert) {

		oFieldEditMulti.setValueState("Error");
		oFieldEditMulti.setValueStateText("Test");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				var oContent = oFieldEditMulti.getAggregation("_content");
				assert.equal(oContent.getValueState(), "Error", "ValueState set on MultiInput control");
				assert.equal(oContent.getValueStateText(), "Test", "ValueStateText set on MultiInput control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("textAlign", function(assert) {

		oFieldEditMulti.setTextAlign("End");
		oFieldEditSingle.setTextAlign("End");
		oFieldDisplay.setTextAlign("End");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput", "sap/m/Input", "sap/m/Text"], function(MultiInput, Input, Text) {
			setTimeout(function() {
				var oContent = oFieldEditMulti.getAggregation("_content");
				assert.equal(oContent.getTextAlign(), "End", "TextAlign set on MultiInput control");

				oContent = oFieldEditSingle.getAggregation("_content");
				assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Input control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("textDirection", function(assert) {

		oFieldEditMulti.setTextDirection("RTL");
		oFieldEditSingle.setTextDirection("RTL");
		oFieldDisplay.setTextDirection("RTL");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput", "sap/m/Input", "sap/m/Text"], function(MultiInput, Input, Text) {
			setTimeout(function() {
				var oContent = oFieldEditMulti.getAggregation("_content");
				assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on MultiInput control");

				oContent = oFieldEditSingle.getAggregation("_content");
				assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Input control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("tooltip", function(assert) {

		oFieldEditMulti.setTooltip("Test");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				var oContent = oFieldEditMulti.getAggregation("_content");
				assert.equal(oContent.getTooltip(), "Test", "Tooltip set on MultiInput control");
				fnDone();
			}, 0);
		});

	});

	QUnit.module("Eventing", {
		beforeEach: function() {
			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}"
			});
			//			oField.attachChange(_myChangeHandler);
			oField._fireChange = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			oField.attachLiveChange(_myLiveChangeHandler);
			oField.attachPress(_myPressHandler);
			oField.attachParseError(_myParseErrorHandler);
			oField.attachValidationError(_myValidationErrorHandler);
			oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			iCount = 0;
			sId = null;
			sValue = null;
			bValid = null;
			iLiveCount = 0;
			sLiveId = null;
			sLiveValue = null;
			iPressCount = 0;
			sPressId = "";
			iParseError = 0;
			iValidationError = 0;
		}
	});

	QUnit.test("with multi value", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				oField.setDisplay("DescriptionValue");
				sap.ui.getCore().applyChanges();
				var oContent = oField.getAggregation("_content");
				oContent.focus();
				jQuery(oContent.getFocusDomRef()).val("X");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				setTimeout(function() {
					assert.equal(iCount, 1, "change event fired once");
					assert.equal(sId, "F1", "change event fired on Field");
					assert.equal(sValue, "X", "change event value");
					assert.ok(bValid, "change event valid");
					var aConditions = oCM.getConditions("Name");
					assert.equal(aConditions.length, 1, "one condition in Codition model");
					assert.equal(aConditions[0].values[0], "X", "condition value");
					assert.equal(aConditions[0].operator, "Contains", "condition operator");
					var aTokens = oContent.getTokens ? oContent.getTokens() : [];
					assert.equal(aTokens.length, 1, "MultiInput has one Token");
					var oToken = aTokens[0];
					assert.equal(oToken && oToken.getText(), "*X*", "Text on token set");

					iCount = 0;
					sId = ""; sValue = ""; bValid = false;
					jQuery(oContent.getFocusDomRef()).val("X");
					qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
					setTimeout(function() {
						assert.equal(iCount, 1, "change event fired");
						assert.notOk(bValid, "change event not valid");
						assert.equal(sValue, "X", "change event value");
						aConditions = oCM.getConditions("Name");
						assert.equal(aConditions.length, 1, "one condition in Codition model");
						assert.equal(aConditions[0].values[0], "X", "condition value");
						assert.equal(aConditions[0].operator, "Contains", "condition operator");
						aTokens = oContent.getTokens ? oContent.getTokens() : [];
						assert.equal(aTokens.length, 1, "MultiInput has one Token");
						oToken = aTokens[0];
						assert.equal(oToken && oToken.getText(), "*X*", "Text on token set");

						// delete Token
						if (oToken) {
							iCount = 0;
							sId = ""; sValue = ""; bValid = false;
							oToken._deleteIcon.firePress();
							assert.equal(iCount, 1, "change event fired once");
							assert.equal(sId, "F1", "change event fired on Field");
							assert.equal(sValue, "", "change event value");
							assert.ok(bValid, "change event valid");
							aConditions = oCM.getConditions("Name");
							assert.equal(aConditions.length, 0, "no condition in Codition model after delete Token");
							aTokens = oContent.getTokens ? oContent.getTokens() : [];
							assert.equal(aTokens.length, 0, "MultiInput has no Token after delete");
						}

						//simulate liveChange by calling from internal control
						oContent.fireLiveChange({ value: "Y" });
						assert.equal(iLiveCount, 1, "liveChange event fired once");
						assert.equal(sLiveId, "F1", "liveChange event fired on Field");
						assert.equal(sLiveValue, "Y", "liveChange event value");
						fnDone();
					}, 0);
				}, 0);
			}, 0);
		});

	});

	QUnit.test("with multi value and maxConditions", function(assert) {

		oField.setMaxConditions(2);
		var oCondition = Condition.createCondition("EQ", ["Test"]);
		oCM.addCondition("Name", oCondition);

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oField.getAggregation("_content");
				oContent.focus();
				jQuery(oContent.getFocusDomRef()).val("X");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				setTimeout(function() {
					assert.equal(iCount, 1, "change event fired once");
					assert.equal(sId, "F1", "change event fired on Field");
					assert.ok(bValid, "change event valid");
					var aConditions = oCM.getConditions("Name");
					assert.equal(aConditions.length, 2, "two conditions in Codition model");
					assert.equal(aConditions[0].values[0], "Test", "first condition value");
					assert.equal(aConditions[0].operator, "EQ", "first condition operator");
					assert.equal(aConditions[1].values[0], "X", "second condition value");
					assert.equal(aConditions[1].operator, "Contains", "second condition operator");
					var aTokens = oContent.getTokens ? oContent.getTokens() : [];
					assert.equal(aTokens.length, 2, "MultiInput has two Tokens");
					var oToken = aTokens[1];
					assert.equal(oToken && oToken.getText(), "*X*", "Text on token set");

					iCount = 0;
					sId = ""; sValue = ""; bValid = false;
					jQuery(oContent.getFocusDomRef()).val("Y");
					qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
					setTimeout(function() {
						assert.equal(iCount, 1, "change event fired once");
						assert.equal(sId, "F1", "change event fired on Field");
						assert.ok(bValid, "change event valid");
						aConditions = oCM.getConditions("Name");
						assert.equal(aConditions.length, 2, "two conditions in Codition model");
						assert.equal(aConditions[0].values[0], "X", "first condition value");
						assert.equal(aConditions[0].operator, "Contains", "first condition operator");
						assert.equal(aConditions[1].values[0], "Y", "second condition value");
						assert.equal(aConditions[1].operator, "Contains", "second condition operator");
						aTokens = oContent.getTokens ? oContent.getTokens() : [];
						assert.equal(aTokens.length, 2, "MultiInput has two Tokens");
						oToken = aTokens[0];
						assert.equal(oToken && oToken.getText(), "*X*", "Text on token set");
						oToken = aTokens[1];
						assert.equal(oToken && oToken.getText(), "*Y*", "Text on token set");
						fnDone();
					}, 0);
				}, 0);
			}, 0);
		});

	});

	QUnit.test("wrong input on multi value", function(assert) {

		oField.setDataTypeConstraints({maximum: 10});
		oField.setDataType("sap.ui.model.type.Integer");
		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oField.getAggregation("_content");
				oContent.focus();
				jQuery(oContent.getFocusDomRef()).val("15");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				setTimeout(function() {
					assert.equal(iCount, 1, "change event fired once");
					assert.equal(sId, "F1", "change event fired on Field");
					assert.equal(sValue, "15", "change event value");
					assert.notOk(bValid, "change event not valid");
					var aConditions = oCM.getConditions("Name");
					assert.equal(aConditions.length, 0, "no condition in Codition model");
					var aTokens = oContent.getTokens ? oContent.getTokens() : [];
					assert.equal(aTokens.length, 0, "MultiInput has no Token");
					assert.equal(jQuery(oContent.getFocusDomRef()).val(), "15", "Value still in Input");

					fnDone();
				}, 0);
			}, 0);
		});

	});

	QUnit.test("with single value", function(assert) {

		oField.setMaxConditions(1);
		oField.setProperty("_onlyEEQ", true);
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function(Input) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oField.getAggregation("_content");
				oContent.focus();
				jQuery(oContent.getFocusDomRef()).val("X");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.equal(sValue, "X", "change event value");
				assert.ok(bValid, "change event valid");
				var aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0].values[0], "X", "condition value");
				assert.equal(aConditions[0].operator, "EEQ", "condition operator");

				//simulate liveChange by calling from internal control
				oContent.fireLiveChange({ value: "Y" });
				assert.equal(iLiveCount, 1, "liveChange event fired once");
				assert.equal(sLiveId, "F1", "liveChange event fired on Field");
				assert.equal(sLiveValue, "Y", "liveChange event value");

				// clear value
				iCount = 0;
				sId = "";
				sValue = undefined;
				jQuery(oContent.getFocusDomRef()).val("");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.notOk(sValue, "change event value");
				assert.ok(bValid, "change event valid");
				aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 0, "no condition in Codition model");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("with single value and free condtitions", function(assert) {

		oField.setMaxConditions(1);
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function(Input) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oField.getAggregation("_content");
				oContent.focus();
				jQuery(oContent.getFocusDomRef()).val("X");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.equal(sValue, "X", "change event value");
				assert.ok(bValid, "change event valid");
				var aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0] && aConditions[0].values[0], "X", "condition value");
				assert.equal(aConditions[0] && aConditions[0].operator, "Contains", "condition operator");
				assert.equal(oContent.getValue(), "*X*", "Condition is displayed with operator");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("with single value and dataType sap.ui.model.type.Currency", function(assert) {

		oField.setDataType("sap.ui.model.type.Currency");
		oField.setMaxConditions(1);
		oField.setProperty("_onlyEEQ", true);
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function(Input) {
			setTimeout(function() {
				var oContent = oField.getAggregation("_content");
				oContent.focus();
				jQuery(oContent.getFocusDomRef()).val("EUR 1.11");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.ok(Array.isArray(sValue), "change event value is array");
				assert.equal(sValue[0], 1.11, "change event value0");
				assert.equal(sValue[1], "EUR", "change event value1");
				assert.ok(bValid, "change event valid");
				var aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.ok(aConditions[0] && Array.isArray(aConditions[0].values), "condition value is array");
				assert.equal(aConditions[0] && aConditions[0].values[0][0], 1.11, "condition value0");
				assert.equal(aConditions[0] && aConditions[0].values[0][1], "EUR", "condition value1");
				assert.equal(aConditions[0] && aConditions[0].operator, "EEQ", "condition operator");
				fnDone();
			}, 50);
		});

	});

	QUnit.test("wrong input on single value", function(assert) {

		oField.setDataTypeConstraints({maximum: 10});
		oField.setDataType("sap.ui.model.type.Integer");
		oField.setMaxConditions(1);
		oField.setProperty("_onlyEEQ", true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function(Input) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oField.getAggregation("_content");
				oContent.focus();
				jQuery(oContent.getFocusDomRef()).val("15");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				setTimeout(function() {
					assert.equal(iCount, 1, "change event fired once");
					assert.equal(sId, "F1", "change event fired on Field");
					assert.equal(sValue, "15", "change event value");
					assert.notOk(bValid, "change event not valid");
					var aConditions = oCM.getConditions("Name");
					assert.equal(aConditions.length, 0, "no condition in Codition model");
					assert.equal(jQuery(oContent.getFocusDomRef()).val(), "15", "Value still in Input");
					assert.equal(iValidationError, 1, "ValidationError fired");

					fnDone();
				}, 0);
			}, 0);
		});

	});

	QUnit.test("with SearchField", function(assert) {

		oField.setMaxConditions(1);
		oField.bindProperty("conditions", {path: "cm>/conditions/$search"});
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/SearchField"], function(SearchField) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oField.getAggregation("_content");
				oContent.focus();
				oContent.setValue("X"); // as onInput SearchField sets it's value
				qutils.triggerKeyup(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.equal(sValue, "X", "change event value");
				assert.ok(bValid, "change event valid");
				var aConditions = oCM.getConditions("$search");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0] && aConditions[0].values[0], "X", "condition value");
				assert.equal(aConditions[0] && aConditions[0].operator, "Contains", "condition operator");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("with external content", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Slider", "sap/m/Button"], function(Slider, Button) {
			var oCondition = Condition.createCondition("EEQ", [70]);
			oCM.addCondition("Name", oCondition);
			oField.setMaxConditions(1);
			oField.setDataType("Edm.Float");
			var oSlider = new Slider("S1");
			oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType()});
			oField.setContent(oSlider);
			sap.ui.getCore().applyChanges();

			setTimeout(function() {
				assert.ok(!!oSlider.getDomRef(), "Slider is rendered");
				if (oSlider.getDomRef()) {
					oSlider.focus();
					qutils.triggerKeyboardEvent(oSlider.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
					assert.equal(iCount, 1, "change event fired once");
					assert.equal(sId, "F1", "change event fired on Field");
					assert.equal(sValue, 71, "change event value");
					assert.ok(bValid, "change event valid");
					var aConditions = oCM.getConditions("Name");
					assert.equal(aConditions.length, 1, "one condition in Codition model");
					assert.equal(aConditions[0].values[0], 71, "condition value");
					assert.equal(iLiveCount, 1, "liveChange event fired once");
					assert.equal(sLiveId, "F1", "liveChange event fired on Field");
					assert.equal(sLiveValue, 71, "liveChange event value");

					var oButton = new Button("B1");
					oButton.bindProperty("text", { path: '$field>/conditions', type: new ConditionsType() });
					oField.setContent(oButton);
					oSlider.placeAt("content");
					sap.ui.getCore().applyChanges();
					oSlider.focus();
					qutils.triggerKeyboardEvent(oSlider.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
					assert.equal(iCount, 1, "change event of field not fired again");

					oButton.firePress(); //simulate press
					assert.equal(iPressCount, 1, "Press event fired once");
					assert.equal(sPressId, "F1", "Press event fired on Field");
					oSlider.destroy();
				}
				fnDone();
			}, 0);
		});

	});

	QUnit.module("Clone", {
		beforeEach: function() {
			oField = new FieldBase("F1", { conditions: "{cm>/conditions/Name}" });
			//			oField.attachChange(_myChangeHandler);
			oField._fireChange = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");
			var oCondition = Condition.createCondition("EEQ", ["Test"]);
			oCM.addCondition("Name", oCondition);
			oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
		}
	});

	QUnit.test("with internal content", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				var oClone = oField.clone("myClone");
				oClone._fireChange = _myFireChange;
				oClone.placeAt("content");
				sap.ui.getCore().applyChanges();

				var oContent = oField.getAggregation("_content");
				assert.equal(oContent.getModel("$field"), oField._oManagedObjectModel, "MultiInput has ManagedObjectModel of Field");
				var aTokens = oContent.getTokens ? oContent.getTokens() : [];
				var oToken = aTokens[0];
				assert.equal(oToken && oToken.getText(), "Test", "Text on token set");
				var oCloneContent = oClone.getAggregation("_content");
				aTokens = oCloneContent.getTokens ? oCloneContent.getTokens() : [];
				assert.equal(aTokens.length, 1, "Clone has one Tokens");

				oContent.focus();
				jQuery(oContent.getFocusDomRef()).val("X");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				assert.equal(iCount, 1, "Event fired once");
				assert.equal(sId, "F1", "Event fired on original Field");

				iCount = 0;
				sId = "";
				sValue = "";

				oCloneContent.focus();
				jQuery(oCloneContent.getFocusDomRef()).val("Y");
				qutils.triggerKeyboardEvent(oCloneContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				assert.equal(iCount, 1, "Event fired once");
				assert.equal(sId, "F1-myClone", "Event fired on clone");

				oClone.destroy();
				fnDone();
			}, 0);
		});

	});

	QUnit.test("with external content", function(assert) {

		var fnDone = assert.async();
		oField.setMaxConditions(1);
		oField.setDataType("Edm.Float");
		oCM.removeAllConditions();
		var oCondition = Condition.createCondition("EEQ", [70]);
		oCM.addCondition("Name", oCondition);
		sap.ui.require(["sap/m/Slider", "sap/m/Input"], function(Slider, Input) {
			var oSlider = new Slider("S1");
			oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
			oField.setContent(oSlider);
			sap.ui.getCore().applyChanges();
			setTimeout(function() {
				var oClone = oField.clone("myClone");
				oClone._fireChange = _myFireChange;
				oClone.placeAt("content");
				sap.ui.getCore().applyChanges();

				assert.notOk(oClone.getAggregation("_content"), "Clone has no internal content");
				var oCloneSlider = oClone.getContent();
				assert.ok(oCloneSlider instanceof Slider, "Clone has Slider as Content");

				oSlider.focus();
				qutils.triggerKeyboardEvent(oSlider.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
				assert.equal(iCount, 1, "Event fired once");
				assert.equal(sId, "F1", "Event fired on original Field");

				iCount = 0;
				sId = "";
				sValue = "";

				oCloneSlider.focus();
				qutils.triggerKeyboardEvent(oCloneSlider.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
				assert.equal(iCount, 1, "Event fired once");
				assert.equal(sId, "F1-myClone", "Event fired on clone");

				oClone.destroy();
				fnDone();
			}, 0);
		});

	});

	QUnit.test("with external edit/display content", function(assert) {

		var fnDone = assert.async();
		oField.setMaxConditions(1);
		oField.setDataType("Edm.Float");
		oCM.removeAllConditions();
		var oCondition = Condition.createCondition("EEQ", [70]);
		oCM.addCondition("Name", oCondition);
		sap.ui.require(["sap/m/Slider", "sap/m/Input"], function(Slider, Input) {
			var oSlider1 = new Slider("S1");
			oSlider1.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
			oField.setContentEdit(oSlider1);
			var oSlider2 = new Slider("S2");
			oSlider2.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
			oField.setContentDisplay(oSlider2);
			sap.ui.getCore().applyChanges();
			setTimeout(function() {
				var oClone = oField.clone("myClone");
				oClone._fireChange = _myFireChange;
				oClone.placeAt("content");
				sap.ui.getCore().applyChanges();

				assert.notOk(oClone.getAggregation("_content"), "Clone has no internal content");
				var oCloneSlider1 = oClone.getContentEdit();
				assert.ok(oCloneSlider1 instanceof Slider, "Clone has Slider as ContentEdit");
				var oCloneSlider2 = oClone.getContentDisplay();
				assert.ok(oCloneSlider2 instanceof Slider, "Clone has Slider as ContentDisplay");

				oSlider1.focus();
				qutils.triggerKeyboardEvent(oSlider1.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
				assert.equal(iCount, 1, "Event fired once");
				assert.equal(sId, "F1", "Event fired on original Field");

				iCount = 0;
				sId = "";
				sValue = "";

				oCloneSlider1.focus();
				qutils.triggerKeyboardEvent(oCloneSlider1.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
				assert.equal(iCount, 1, "Event fired once");
				assert.equal(sId, "F1-myClone", "Event fired on clone");

				oClone.destroy();
				fnDone();
			}, 0);
		});

	});

	// check only the use of the FieldHelp API. The FieldHelp itself is tested in own tests.
	// So use Stubs to simulate functions of FieldHelp

	QUnit.module("FieldHelp without key", {
		beforeEach: function() {
			var oFieldHelp = new FieldHelpBase("F1-H");

			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				fieldHelp: oFieldHelp,
				//				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler
			});
			oField._fireChange = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");
			var oCondition = Condition.createCondition("EEQ", ["I2"]);
			oCM.addCondition("Name", oCondition);

			oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			var oFieldHelp = sap.ui.getCore().byId("F1-H");
			if (oFieldHelp) {
				oFieldHelp.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
		}
	});

	QUnit.test("value help enabled", function(assert) {

		oField.setDisplay("DescriptionValue");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
				sinon.spy(oFieldHelp, "onFieldChange");
				sap.ui.getCore().applyChanges();
				sinon.spy(oFieldHelp, "connect");
				sinon.spy(oFieldHelp, "toggleOpen");

				oField.focus(); // as FieldHelp is connected with focus
				assert.ok(oFieldHelp.connect.calledWith(oField), "FieldHelp connected to Field");

				var oContent = oField.getAggregation("_content");
				assert.ok(oContent.getShowValueHelp(), "valueHelp enabled");
				var oIcon = oContent.getAggregation("_endIcon", [])[0];
				assert.equal(oIcon && oIcon.getSrc(), "sap-icon://slim-arrow-down", "ValueHelpIcon set");

				// simulate select event to see if field is updated
				var oCondition = Condition.createCondition("EEQ", ["Hello"]);
				oFieldHelp.fireSelect({ conditions: [oCondition] });
				assert.equal(iCount, 1, "Change Event fired once");
				var aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0].values[0], "Hello", "condition value");
				assert.equal(aConditions[0].operator, "EEQ", "condition operator");
				assert.ok(oFieldHelp.onFieldChange.calledOnce, "onFieldChange called on FieldHelp");

				oFieldHelp.fireNavigate({ value: "Navigate", key: "Y" });
				assert.equal(iLiveCount, 1, "LiveChange Event fired once");
				aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0].values[0], "Hello", "condition value");
				assert.equal(aConditions[0].operator, "EEQ", "condition operator");
				assert.equal(oContent._$input.val(), "Navigate (Y)", "Field shown value");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				assert.ok(oFieldHelp.onFieldChange.calledTwice, "onFieldChange called on FieldHelp");

				// simulate value help request to see if FieldHelp opens
				oContent.fireValueHelpRequest();
				assert.ok(oFieldHelp.toggleOpen.calledOnce, "FieldHelp toggle open called");

				oContent.fireValueHelpRequest();
				assert.ok(oFieldHelp.toggleOpen.calledTwice, "FieldHelp toggle open called again");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("remove value help", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				oField.setFieldHelp();
				sap.ui.getCore().applyChanges();

				var oContent = oField.getAggregation("_content");
				assert.notOk(oContent.getShowValueHelp(), "valueHelp disabled");
				fnDone();
			}, 0);
		});

	});

	QUnit.module("FieldHelp with key", {
		beforeEach: function() {
			var oFieldHelp = new FieldHelpBase("F1-H");
			sinon.stub(oFieldHelp, "openByTyping").returns(true); // to simulate suggestion
			var oStub = sinon.stub(oFieldHelp, "getTextForKey");
			oStub.withArgs("I1").returns("Item1");
			//			oStub.withArgs("I2").returns("Item2");
			oStub.withArgs("I3").returns("Item3");
			oStub = sinon.stub(oFieldHelp, "getKeyForText");
			oStub.withArgs("Item1").returns("I1");
			//			oStub.withArgs("Item2").returns("I2");
			oStub.withArgs("Item3").returns("I3");
			sinon.spy(oFieldHelp, "navigate");
			sinon.spy(oFieldHelp, "open");
			sinon.spy(oFieldHelp, "close");
			sinon.spy(oFieldHelp, "fireDisconnect");

			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				display: sap.ui.mdc.FieldDisplay.Description,
				fieldHelp: oFieldHelp,
				//				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler
			});
			oField._fireChange = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");
			var oCondition = Condition.createCondition("EEQ", ["I2"]);
			oCM.addCondition("Name", oCondition);

			oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			var oFieldHelp = sap.ui.getCore().byId("F1-H");
			if (oFieldHelp) {
				oFieldHelp.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
		}
	});

	QUnit.test("value/key handling", function(assert) {

		var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
		assert.ok(oFieldHelp.getTextForKey.calledWith("I2"), "getTextForKey called");
		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				oField.setDisplay("DescriptionValue");
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus
				var oContent = oField.getAggregation("_content");
				var aTokens = oContent.getTokens ? oContent.getTokens() : [];
				assert.equal(aTokens.length, 1, "MultiInput has one Token");
				var oToken = aTokens[0];
				assert.equal(oToken && oToken.getText(), "I2", "Text on token is key, as FieldHelp has no description yet");

				// var iCallCount = oFieldHelp.getTextForKey.callCount;
				oFieldHelp.getTextForKey.withArgs("I2").returns("Item2");
				oFieldHelp.getKeyForText.withArgs("Item2").returns("I2");

				// commented out as dataupdate did reset field while typing
				//oFieldHelp.fireDataUpdate();
				//assert.ok(oFieldHelp.getTextForKey.callCount > iCallCount, "getTextForKey called again");
				//assert.ok(oFieldHelp.getTextForKey.calledWith("I2"), "getTextForKey Key");
				//aTokens = oContent.getTokens ? oContent.getTokens() : [];
				//oToken = aTokens[0];
				//assert.equal(oToken && oToken.getText(), "Item2 (I2)", "Text on token is taken from FieldHelp");

				// simulate value help request to see if FieldHelp opens
				oContent.fireValueHelpRequest();

				var aConditions = oFieldHelp.getConditions();
				assert.equal(aConditions.length, 1, "Condition set on FieldHelp");
				assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "selected item set as condition");

				// simulate select event to see if field is updated
				var oCondition = Condition.createCondition("EEQ", ["I3", "Item3"]);
				oFieldHelp.fireSelect({ conditions: [oCondition], add: false });
				assert.equal(iCount, 1, "Change Event fired once");
				assert.equal(sValue, "I3", "Change event value");
				assert.ok(bValid, "Change event valid");
				aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0] && aConditions[0].values[0], "I3", "condition value");
				assert.equal(aConditions[0] && aConditions[0].values[1], "Item3", "condition description");
				assert.equal(aConditions[0] && aConditions[0].operator, "EEQ", "condition operator");
				assert.notOk(oFieldHelp.getKeyForText.called, "getKeyForText not called");

				// simulate select event to see if field is updated
				oCondition = Condition.createCondition("EEQ", ["I2", "Item2"]);
				iCount = 0;
				sValue = ""; bValid = undefined;
				oFieldHelp.fireSelect({ conditions: [oCondition], add: true });
				assert.equal(iCount, 1, "Change Event fired once");
				assert.ok(bValid, "Change event valid");
				aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 2, "two condition in Codition model");
				assert.equal(aConditions[0] && aConditions[0].values[0], "I3", "condition value");
				assert.equal(aConditions[0] && aConditions[0].values[1], "Item3", "condition description");
				assert.equal(aConditions[0] && aConditions[0].operator, "EEQ", "condition operator");
				assert.equal(aConditions[1] && aConditions[1].values[0], "I2", "condition value");
				assert.equal(aConditions[1] && aConditions[1].values[1], "Item2", "condition description");
				assert.equal(aConditions[1] && aConditions[1].operator, "EEQ", "condition operator");
				assert.notOk(oFieldHelp.getKeyForText.called, "getKeyForText not called");

				// simulate select event using old API to see if field is updated
				// TODO: remove old api without condition?
				iCount = 0;
				sValue = ""; bValid = undefined;
				oCondition = Condition.createCondition("EEQ", ["I1", "Item1"]);
				oFieldHelp.fireSelect({ conditions: [oCondition], add: false });
				assert.equal(iCount, 1, "Change Event fired once");
				assert.ok(bValid, "Change event valid");
				aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0] && aConditions[0].values[0], "I1", "condition value");
				assert.equal(aConditions[0] && aConditions[0].values[1], "Item1", "condition description");
				assert.equal(aConditions[0] && aConditions[0].operator, "EEQ", "condition operator");
				assert.notOk(oFieldHelp.getKeyForText.called, "getKeyForText not called");

				fnDone();
			}, 0);
		});

	});

	QUnit.test("keyboard support on closed FieldHelp", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus
				var oContent = oField.getAggregation("_content");
				sinon.spy(oContent, "_origOnsapprevious");
				sinon.spy(oContent, "_origOnsapnext");
				sinon.spy(oContent, "_origOnsapbackspace");

				qutils.triggerKeyboardEvent(oField.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
				assert.ok(oContent._origOnsapnext.called, "onsapnext called on content control");

				qutils.triggerKeyboardEvent(oField.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_LEFT, false, false, false);
				assert.ok(oContent._origOnsapprevious.called, "onsapprevious called on content control");

				qutils.triggerKeyboardEvent(oField.getFocusDomRef().id, jQuery.sap.KeyCodes.BACKSPACE, false, false, false);
				assert.ok(oContent._origOnsapbackspace.called, "onsapbackspace called on content control");

				fnDone();
			}, 0);
		});

	});

	QUnit.test("keyboard support on open FieldHelp", function(assert) {

		var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
		sinon.stub(oFieldHelp, "isOpen").returns(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus
				var oContent = oField.getAggregation("_content");
				sinon.spy(oContent, "_origOnsapprevious");
				sinon.spy(oContent, "_origOnsapnext");
				sinon.spy(oContent, "_origOnsapbackspace");

				qutils.triggerKeyboardEvent(oField.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
				assert.ok(oContent._origOnsapnext.notCalled, "onsapnext not called on content control");

				qutils.triggerKeyboardEvent(oField.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_LEFT, false, false, false);
				assert.ok(oContent._origOnsapprevious.notCalled, "onsapprevious not called on content control");

				qutils.triggerKeyboardEvent(oField.getFocusDomRef().id, jQuery.sap.KeyCodes.BACKSPACE, false, false, false);
				assert.ok(oContent._origOnsapbackspace.notCalled, "onsapbackspace not called on content control");

				fnDone();
			}, 0);
		});

	});

	QUnit.test("navigation", function(assert) {

		var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
		sinon.stub(oFieldHelp, "isOpen").returns(true);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus
				var oContent = oField.getAggregation("_content");
				sinon.spy(oContent, "_origOnsapprevious");
				sinon.spy(oContent, "_origOnsapnext");

				qutils.triggerKeyboardEvent(oField.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_DOWN, false, false, false);
				assert.ok(oFieldHelp.navigate.calledWith(1), "navigate called");
				assert.ok(oContent._origOnsapnext.notCalled, "onsapnext not called on content control");

				qutils.triggerKeyboardEvent(oField.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_UP, false, false, false);
				assert.ok(oFieldHelp.navigate.calledWith(-1), "navigate called");
				assert.ok(oContent._origOnsapprevious.notCalled, "onsapprevious not called on content control");

				oFieldHelp.fireNavigate({ value: "Item3", key: "I3" });
				assert.equal(iLiveCount, 1, "LiveChange Event fired once");
				var aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
				assert.equal(oContent._$input.val(), "Item3", "Field shown value");

				fnDone();
			}, 0);
		});

	});

	QUnit.test("filtering", function(assert) {

		var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus
				var oContent = oField.getAggregation("_content");
				oContent._$input.val("i");
				oContent.fireLiveChange({ value: "I" });

				setTimeout(function() { //  Wait the valueHelp filter delay of 300 ms
					assert.equal(oFieldHelp.getFilterValue(), "I", "FilterValue set");
					assert.ok(oFieldHelp.open.called, "open called");

					fnDone();
				}, 400);

			}, 0);
		});

	});

	QUnit.test("change while open", function(assert) {

		var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus
				var oContent = oField.getAggregation("_content");
				oContent.fireValueHelpRequest();
				oContent._$input.val("==Item1");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);

				assert.equal(oFieldHelp.getFilterValue(), "", "FilterValue reset");
				assert.ok(oFieldHelp.getKeyForText.calledWith("Item1"), "getKeyForText called");
				var aConditions = oFieldHelp.getConditions();
				assert.equal(aConditions.length, 2, "Condition set on FieldHelp");
				assert.equal(aConditions[1] && aConditions[1].values[0], "I1", "selected item set as condition");
				assert.ok(oFieldHelp.close.called, "close called");
				aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 2, "two conditions in Codition model");
				assert.equal(aConditions[1] && aConditions[1].values[0], "I1", "condition value");

				fnDone();
			}, 0);
		});

	});

	QUnit.test("one FieldHelp on 2 Fields", function(assert) {

		var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
		oFieldHelp.getTextForKey.withArgs("I2").returns("Item2");
		oFieldHelp.getKeyForText.withArgs("Item2").returns("I2");

		var oCM2 = new ConditionModel();
		var oCondition = Condition.createCondition("EEQ", ["I3"]);
		oCM2.addCondition("Name", oCondition);
		sap.ui.getCore().setModel(oCM2, "cm2");

		var oField2 = new FieldBase("F2", {
			conditions: "{cm2>/conditions/Name}",
			display: library.FieldDisplay.Description,
			fieldHelp: oFieldHelp,
			//			change: _myChangeHandler,
			liveChange: _myLiveChangeHandler
		});
		oField2._fireChange = _myFireChange;
		oField2.attachEvent("change", _myChangeHandler);
		oField2.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/MultiInput"], function(MultiInput) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus
				var oContent = oField.getAggregation("_content");
				var oContent2 = oField2.getAggregation("_content");

				oCondition = Condition.createCondition("EEQ", ["I1", "Item1"]);
				oFieldHelp.fireSelect({ conditions: [oCondition] });
				var aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model of first Field");
				assert.equal(aConditions[0] && aConditions[0].values[0], "I1", "condition value");
				aConditions = oCM2.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model of second Field");
				assert.equal(aConditions[0] && aConditions[0].values[0], "I3", "condition value");

				oFieldHelp.fireNavigate({ value: "Item2", key: "I2" });
				assert.equal(oContent._$input.val(), "Item2", "Field shown value");
				assert.equal(oContent2._$input.val(), "", "Field2 show no value");

				oField2.focus(); // as FieldHelp is connected with focus
				assert.ok(oFieldHelp.fireDisconnect.called, "disconnect event fired");

				oCondition = Condition.createCondition("EEQ", ["I1", "Item1"]);
				oFieldHelp.fireSelect({ conditions: [oCondition] });
				aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 2, "two conditions in Codition model of first Field");
				assert.equal(aConditions[1] && aConditions[1].values[0], "I2", "condition value");
				aConditions = oCM2.getConditions("Name");
				assert.equal(aConditions.length, 1, "one condition in Codition model of second Field");
				assert.equal(aConditions[0] && aConditions[0].values[0], "I1", "condition value");

				oFieldHelp.fireNavigate({ value: "Item3", key: "I3" });
				assert.equal(oContent._$input.val(), "", "Field shows no value");
				assert.equal(oContent2._$input.val(), "Item3", "Field2 shown value");

				oField2.destroy();
				oCM2.destroy();
				fnDone();
			}, 0);
		});

	});

	QUnit.module("FieldHelp for currency", {
		beforeEach: function() {
			var oFieldHelp = new FieldHelpBase("F1-H");
			sinon.stub(oFieldHelp, "openByTyping").returns(true); // to simulate suggestion

			oField = new FieldBase("F1", {
				dataType: "sap.ui.model.type.Currency",
				maxConditions: 1,
				conditions: "{cm>/conditions/Price}",
				fieldHelp: oFieldHelp,
				liveChange: _myLiveChangeHandler
			});
			oField.setProperty("_onlyEEQ", true);
			oField._fireChange = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");
			var oCondition = Condition.createCondition("EEQ", [[123.45, "USD"]]);
			oCM.addCondition("Price", oCondition);

			oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			var oFieldHelp = sap.ui.getCore().byId("F1-H");
			if (oFieldHelp) {
				oFieldHelp.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
		}
	});

	QUnit.test("Select currency", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/ui/model/type/Currency"], function(Input, Currency) {
			var oType = new Currency();
			var sFormatted = oType.formatValue([123.45, "EUR"], "string"); // because of special whitspaces and local dependend
			setTimeout(function() {
				var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus

				var oContent = oField.getAggregation("_content");

				// simulate select event to see if field is updated
				var oCondition = Condition.createCondition("EEQ", ["EUR", "EUR"]);
				oFieldHelp.fireSelect({ conditions: [oCondition] });
				assert.equal(iCount, 1, "Change Event fired once");
				var aConditions = oCM.getConditions("Price");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0].values[0][0], 123.45, "condition value0");
				assert.equal(aConditions[0].values[0][1], "EUR", "condition value1");
				assert.equal(aConditions[0].operator, "EEQ", "condition operator");
				assert.equal(oContent.getDOMValue(), sFormatted, "value in inner control");

				setTimeout(function() { // wait for Model update
					oCM.removeAllConditions();
					setTimeout(function() { // wait for Model update
						oCondition = Condition.createCondition("EEQ", ["USD", "USD"]);
						oFieldHelp.fireSelect({ conditions: [oCondition] });
						aConditions = oCM.getConditions("Price");
						assert.equal(aConditions.length, 1, "one condition in Codition model");
						assert.equal(aConditions[0].values[0][0], 0, "condition value0");
						assert.equal(aConditions[0].values[0][1], "USD", "condition value1");
						assert.equal(aConditions[0].operator, "EEQ", "condition operator");

						fnDone();
					}, 0);
				}, 0);
			}, 0);
		});

	});

	QUnit.test("navigate to currency", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function(Input) {
			setTimeout(function() {
				iLiveCount = 0; // TODO: as in IE sometimes a change event on the Input control is fired.
				var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus

				var oContent = oField.getAggregation("_content");

				oFieldHelp.fireNavigate({ value: "EUR", key: "EUR" });
				assert.equal(iLiveCount, 1, "LiveChange Event fired once");
				assert.equal(oContent._$input.val(), "EUR 123.45", "Field shown value");

				oContent._$input.val("");
				oFieldHelp.fireNavigate({ value: "USD", key: "USD" });
				assert.equal(oContent._$input.val(), "0 USD", "Field shown value");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("filtering for currency", function(assert) {

		var oFieldHelp = sap.ui.getCore().byId(oField.getFieldHelp());
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function(Input) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				oField.focus(); // as FieldHelp is connected with focus
				var oContent = oField.getAggregation("_content");
				oContent._$input.val("E 1");
				oContent.fireLiveChange({ value: "E 1" });

				setTimeout(function() {
					assert.equal(oFieldHelp.getFilterValue(), "E", "FilterValue set");
					fnDone();
				}, 400);

				// oContent._$input.val("2 U");
				// oContent.fireLiveChange({ value: "2 U" });
				// assert.equal(oFieldHelp.getFilterValue(), "U", "FilterValue set");

				// oContent._$input.val("X");
				// oContent.fireLiveChange({ value: "X" });
				// assert.equal(oFieldHelp.getFilterValue(), "X", "FilterValue set");

				// oContent._$input.val("1");
				// oContent.fireLiveChange({ value: "1" });
				// assert.equal(oFieldHelp.getFilterValue(), "", "FilterValue set");

				// fnDone();
			}, 0);
		});

	});

	// test FieldInfo only from API side, simulate behaviour
	QUnit.module("FieldInfo not triggerable", {
		beforeEach: function() {
			var oFieldInfo = new FieldInfoBase("F1-I");
			sinon.stub(oFieldInfo, "isTriggerable").returns(Promise.resolve(false));
			sinon.stub(oFieldInfo, "getTriggerHref").returns(Promise.resolve("test.test"));
			sinon.stub(oFieldInfo, "getContent").returns(Promise.resolve(sap.ui.getCore().byId("L1")));
			sinon.stub(oFieldInfo, "getContentTitle").returns("");
			sinon.spy(oFieldInfo, "open");

			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				maxConditions: 1, // TODO: needed for Link?
				editMode: library.EditMode.Display,
				fieldInfo: oFieldInfo,
				//				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler
			});
			oField._fireChange = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);

			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");
			var oCondition = Condition.createCondition("EEQ", ["Test"]);
			oCM.addCondition("Name", oCondition);

			oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			var oFieldInfo = sap.ui.getCore().byId("F1-I");
			if (oFieldInfo) {
				oFieldInfo.destroy();
			}
			var oLabel = sap.ui.getCore().byId("L1");
			if (oLabel) {
				oLabel.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
		}
	});

	QUnit.test("Rendering", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Text"], function(Text) {
			setTimeout(function() {
				var oContent = oField.getAggregation("_content");
				assert.ok(oContent, "content exist");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText && oContent.getText(), "Test", "Text used");
				fnDone();
			}, 0);
		});

	});

	QUnit.module("FieldInfo triggerable", {
		beforeEach: function() {
			var oFieldInfo = new FieldInfoBase("F1-I");
			sinon.stub(oFieldInfo, "isTriggerable").returns(Promise.resolve(true));
			sinon.stub(oFieldInfo, "getTriggerHref").returns(Promise.resolve(undefined));
			sinon.stub(oFieldInfo, "getContent").returns(Promise.resolve(sap.ui.getCore().byId("L1")));
			sinon.stub(oFieldInfo, "getContentTitle").returns("");
			sinon.spy(oFieldInfo, "open");

			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				maxConditions: 1, // TODO: needed for Link?
				editMode: library.EditMode.Display,
				fieldInfo: oFieldInfo,
				//				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler
			});
			oField._fireChange = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);

			oCM = new ConditionModel();
			sap.ui.getCore().setModel(oCM, "cm");
			var oCondition = Condition.createCondition("EEQ", ["Test"]);
			oCM.addCondition("Name", oCondition);

			oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			var oFieldInfo = sap.ui.getCore().byId("F1-I");
			if (oFieldInfo) {
				oFieldInfo.destroy();
			}
			var oLabel = sap.ui.getCore().byId("L1");
			if (oLabel) {
				oLabel.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
		}
	});

	QUnit.test("Rendering", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Text", "sap/m/Link"], function(Text, Link) {
			setTimeout(function() {
				var oContent = oField.getAggregation("_content");
				assert.ok(oContent, "content exist");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Link", "sap.m.Link is used");
				assert.equal(oContent.getText && oContent.getText(), "Test", "Text used");
				assert.notOk(oContent.getHref && oContent.getHref(), "no Href used");

				var oFieldInfo = sap.ui.getCore().byId("F1-I");
				oFieldInfo.getTriggerHref.returns(Promise.resolve("test.test"));
				oFieldInfo.fireDataUpdate();
				setTimeout(function() {
					//					assert.equal(oContent.getHref && oContent.getHref(), "test.test", "Href used");

					oFieldInfo.isTriggerable.returns(Promise.resolve(false));
					oFieldInfo.fireDataUpdate();
					sap.ui.getCore().applyChanges();
					setTimeout(function() {
						assert.ok(oContent._bIsBeingDestroyed, "Link destroyed");
						oContent = oField.getAggregation("_content");
						assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");

						fnDone();
					}, 0);
				}, 0);
			}, 0);
		});

	});

	QUnit.test("opening", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Link"], function(Link) {
			setTimeout(function() {
				var oContent = oField.getAggregation("_content");
				var oFieldInfo = sap.ui.getCore().byId("F1-I");

				assert.equal(oContent.getMetadata().getName(), "sap.m.Link", "sap.m.Link is used");
				if (oContent.firePress) {
					oContent.firePress(); // simulate link click
					setTimeout(function() {
						assert.ok(oFieldInfo.open.called, "FieldInfo opened");
						fnDone();
					}, 0);
				} else {
					fnDone();
				}
			}, 0);
		});

	});

	QUnit.test("Remove", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Text", "sap/m/Link"], function(Text, Link) {
			setTimeout(function() {
				var oContent = oField.getAggregation("_content");

				oField.destroyFieldInfo();
				setTimeout(function() {
					assert.ok(oContent._bIsBeingDestroyed, "Link destroyed");
					oContent = oField.getAggregation("_content");
					assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");

					fnDone();
				}, 0);
			}, 0);
		});

	});

	QUnit.test("Clone", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Text", "sap/m/Link"], function(Text, Link) {
			setTimeout(function() {
				// to add stubs on cloning
				var oFieldInfo = oField.getFieldInfo();
				oFieldInfo.clone = function(sIdSuffix, aLocalIds) {
					var oCloneFieldInfo = FieldInfoBase.prototype.clone.apply(this, arguments);
					sinon.stub(oCloneFieldInfo, "isTriggerable").returns(Promise.resolve(true));
					sinon.stub(oCloneFieldInfo, "getTriggerHref").returns(Promise.resolve(undefined));
					sinon.stub(oCloneFieldInfo, "getContent").returns(Promise.resolve(sap.ui.getCore().byId("L1")));
					sinon.stub(oCloneFieldInfo, "getContentTitle").returns("");
					return oCloneFieldInfo;
				};

				var oClone = oField.clone("myClone");
				oClone.placeAt("content");
				sap.ui.getCore().applyChanges();

				setTimeout(function() {
					var oContent = oField.getAggregation("_content");
					var oCloneContent = oClone.getAggregation("_content");
					var oCloneFieldInfo = oClone.getFieldInfo();
					assert.ok(!!oCloneFieldInfo, "Clone has FieldInfo");
					assert.equal(oCloneFieldInfo && oCloneFieldInfo.getId(), "F1-I-myClone", "FieldInfo is cloned");
					assert.equal(oCloneContent.getMetadata().getName(), "sap.m.Link", "sap.m.Link is used on Clone");
					assert.equal(oCloneContent.getText && oContent.getText(), "Test", "Text used on Clone");

					oCloneFieldInfo.isTriggerable.returns(Promise.resolve(false));
					oCloneFieldInfo.fireDataUpdate();
					sap.ui.getCore().applyChanges();
					setTimeout(function() {
						oContent = oField.getAggregation("_content");
						oCloneContent = oClone.getAggregation("_content");
						assert.equal(oContent.getMetadata().getName(), "sap.m.Link", "sap.m.Link is still used on Original");
						assert.equal(oCloneContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used on Clone");

						oClone.destroy();
						fnDone();
					}, 0);
				}, 0);
			}, 0);
		});

	});

});