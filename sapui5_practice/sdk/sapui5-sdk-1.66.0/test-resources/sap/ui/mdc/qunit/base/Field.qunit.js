/* global QUnit */

/*eslint max-nested-callbacks: [2, 6]*/

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/library",
	"sap/ui/mdc/base/Field",
	"sap/ui/mdc/base/Condition",
	"sap/m/Label",
	"sap/ui/model/ParseException",
	"sap/ui/model/type/Integer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/mdc/base/type/ConditionsType"
], function (
		jQuery,
		qutils,
		library,
		Field,
		Condition,
		Label,
		ParseException,
		IntegerType,
		JSONModel,
		DateTimeType,
		ConditionsType
		) {
	"use strict";

	var oField;
	var sId;
	var sValue;
	var bValid;
	var iCount = 0;

	var _myChangeHandler = function(oEvent) {
		iCount++;
		sId = oEvent.oSource.getId();
		sValue = oEvent.getParameter("value");
		bValid = oEvent.getParameter("valid");
	};

	var sLiveId;
	var sLiveValue;
	var iLiveCount = 0;

	var _myLiveChangeHandler = function(oEvent) {
		iLiveCount++;
		sLiveId = oEvent.oSource.getId();
		sLiveValue = oEvent.getParameter("value");
	};

	var iParseError = 0;
	var _myParseErrorHandler = function(oEvent) {
		iParseError++;
	};

	var sPressId;
	var iPressCount = 0;

	var _myPressHandler = function(oEvent) {
		iPressCount++;
		sPressId = oEvent.oSource.getId();
	};

	var _checkException = function(assert, oField, fnFunction, sName, vArgument) {

		var oException;

		try {
			fnFunction.call(oField, vArgument);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, sName + " fires exception");

	};

	QUnit.module("Field rendering", {
		beforeEach: function() {
			oField = new Field("F1");
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
		}
	});

	QUnit.test("default rendering", function(assert) {

		oField.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function (Input) {
			setTimeout(function () {
				var oContent = oField.getAggregation("_content");
				assert.ok(oContent, "default content exist");
				assert.equal(oContent && oContent.getMetadata().getName(), "sap.m.Input", "sap.m.Input is default");
				assert.notOk(oContent && oContent.getShowValueHelp(), "no valueHelp");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("EditMode", function(assert) {

		oField.setEditMode(library.EditMode.Display);
		oField.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Text", "sap/m/Input"], function (Text, Input) {
			setTimeout(function () {
				var oContent = oField.getAggregation("_content");
				assert.ok(oContent, "content exist");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");

				oField.setEditMode(library.EditMode.ReadOnly);
				sap.ui.getCore().applyChanges();
				setTimeout(function () {
					oContent = oField.getAggregation("_content");
					assert.ok(oContent, "content exist");
					assert.equal(oContent.getMetadata().getName(), "sap.m.Input", "sap.m.Input is used");
					assert.notOk(oContent.getEditable(), "Input is not editable");
					fnDone();
				}, 0);
			}, 0);
		});

	});

	QUnit.test("external control", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Slider", "sap/m/Input"], function (Slider, Input) {
			var oSlider = new Slider("S1");
			oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType()});
			oField.setContent(oSlider);
			oField.setValue(70);
			oField.placeAt("content");
			sap.ui.getCore().applyChanges();

			setTimeout(function () {
				assert.ok(oSlider.getDomRef(), "Slider rendered");
				assert.equal(oSlider.getValue(), 70, "Value of Slider");

				oField.destroyContent();
				sap.ui.getCore().applyChanges();
				setTimeout(function () {
					var oContent = oField.getAggregation("_content");
					assert.ok(oContent, "internal content exist");
					assert.equal(oContent && oContent.getMetadata().getName(), "sap.m.Input", "sap.m.Input is used");

					oSlider = new Slider("S1");
					oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType()});
					oField.setContent(oSlider);
					sap.ui.getCore().applyChanges();
					setTimeout(function () {
						assert.ok(oSlider.getDomRef(), "Slider rendered");
						assert.equal(oSlider.getValue(), 70, "Value of Slider");
						fnDone();
					}, 0);
				}, 0);
			}, 0);
		});

	});

	var oFieldEdit, oFieldDisplay;

	QUnit.module("properties", {
		beforeEach: function() {
			oFieldEdit = new Field("F1", {editMode: library.EditMode.Editable});
			oFieldDisplay = new Field("F2", {editMode: library.EditMode.Display});
			oFieldEdit.placeAt("content");
			oFieldDisplay.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oFieldEdit.destroy();
			oFieldDisplay.destroy();
			oFieldEdit = undefined;
			oFieldDisplay = undefined;
		}
	});

	QUnit.test("value", function(assert) {

		oFieldEdit.setValue("Test");
		oFieldDisplay.setValue("Test");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/m/Text"], function (Input, Text) {
			setTimeout(function () {
				var oContent = oFieldEdit.getAggregation("_content");
				assert.equal(oContent.getValue(), "Test", "Value set on Input control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getText(), "Test", "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("additionalValue", function(assert) {

		oFieldEdit.setValue("Test");
		oFieldEdit.setAdditionalValue("Hello");
		oFieldDisplay.setAdditionalValue("Hello");
		oFieldDisplay.setValue("Test"); // value after additional value to test this direction

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/m/Text"], function (Input, Text) {
			setTimeout(function () {
				var oContent = oFieldEdit.getAggregation("_content");
				assert.equal(oContent.getValue(), "Test", "Value set on Input control");
				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getText(), "Test", "Text set on Text control");

				oFieldEdit.setDisplay(library.FieldDisplay.Description);
				oFieldDisplay.setDisplay(library.FieldDisplay.Description);
				sap.ui.getCore().applyChanges();

				setTimeout(function () {
					oContent = oFieldEdit.getAggregation("_content");
					assert.equal(oContent.getValue(), "Hello", "Value set on Input control");
					oContent = oFieldDisplay.getAggregation("_content");
					assert.equal(oContent.getText(), "Hello", "Text set on Text control");

					oFieldEdit.setDisplay(library.FieldDisplay.DescriptionValue);
					oFieldDisplay.setDisplay(library.FieldDisplay.DescriptionValue);
					sap.ui.getCore().applyChanges();

					setTimeout(function () {
						oContent = oFieldEdit.getAggregation("_content");
						assert.equal(oContent.getValue(), "Hello (Test)", "Value set on Input control");
						oContent = oFieldDisplay.getAggregation("_content");
						assert.equal(oContent.getText(), "Hello (Test)", "Text set on Text control");

						oFieldEdit.setDisplay(library.FieldDisplay.Description);
						oFieldDisplay.setDisplay(library.FieldDisplay.Description);
						oFieldEdit.setAdditionalValue("");
						oFieldDisplay.setAdditionalValue("");
						sap.ui.getCore().applyChanges();

						setTimeout(function () {
							oContent = oFieldEdit.getAggregation("_content");
							assert.equal(oContent.getValue(), "Test", "Value set on Input control");
							oContent = oFieldDisplay.getAggregation("_content");
							assert.equal(oContent.getText(), "Test", "Text set on Text control");
							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		});

	});

	QUnit.test("multipleLines", function(assert) {

		oFieldEdit.setValue("Test");
		oFieldDisplay.setValue("Test");
		oFieldEdit.setMultipleLines(true);
		oFieldDisplay.setMultipleLines(true);
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/TextArea", "sap/m/Text"], function (TextArea, Text) {
			setTimeout(function () {
				var oContent = oFieldEdit.getAggregation("_content");
				assert.ok(oContent instanceof TextArea, "TextArea rendered");
				assert.equal(oContent.getValue(), "Test", "Text set on TextArea control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.ok(oContent instanceof Text, "Text rendered");
				assert.ok(oContent.getWrapping(), "Text wrapping enabled");
				assert.equal(oContent.getText(), "Test", "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType Date", function(assert) {

		oFieldEdit.setDataType("Edm.Date");
		oFieldEdit.setValue("2017-09-19"); // use ISO date to format it to locale specific one
		oFieldDisplay.setDataType("Edm.Date");
		oFieldDisplay.setValue("2017-09-19");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/DatePicker"], function (DatePicker) {
			setTimeout(function () {
				sap.ui.getCore().applyChanges();
				setTimeout(function () {
					var oContent = oFieldEdit.getAggregation("_content");
					assert.ok(oContent instanceof DatePicker, "DatePicker rendered");
					assert.equal(oContent.$("inner").val(), "Sep 19, 2017", "Value shown on DatePicker control");

					oContent = oFieldDisplay.getAggregation("_content");
					assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
					assert.equal(oContent.getText(), "Sep 19, 2017", "Text set on Text control");
					fnDone();
				}, 50); // wait for rendering in IE
			}, 0);
		});

	});

	QUnit.test("dataType TimeOfDay", function(assert) {

		oFieldEdit.setDataType("Edm.TimeOfDay");
		oFieldEdit.setValue("09:00:00"); // use ISO date to format it to locale specific one
		oFieldDisplay.setDataType("Edm.TimeOfDay");
		oFieldDisplay.setValue("09:00:00");
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/TimePicker"], function (TimePicker) {
			setTimeout(function () {
				sap.ui.getCore().applyChanges();
				var oContent = oFieldEdit.getAggregation("_content");
				assert.ok(oContent instanceof TimePicker, "TimePicker rendered");
				assert.equal(oContent.$("inner").val(), " 9:00:00 AM", "Value set on TimePicker control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "9:00:00 AM", "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType DateTimeOffset", function(assert) {

		oFieldEdit.setDataType("Edm.DateTimeOffset");
		oFieldEdit.setValue(new Date(2017, 10, 7, 13, 1, 24));
		oFieldDisplay.setDataType("Edm.DateTimeOffset");
		oFieldDisplay.setValue(new Date(2017, 10, 7, 13, 1, 24));
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		sap.ui.require(["sap/m/DateTimePicker"], function (DateTimePicker) {
			setTimeout(function () {
				sap.ui.getCore().applyChanges();
				var oContent = oFieldEdit.getAggregation("_content");
				assert.ok(oContent instanceof DateTimePicker, "DateTimePicker rendered");
				assert.equal(oContent.$("inner").val(), "Nov 7, 2017, 1:01:24 PM", "Value set on DateTimePicker control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "Nov 7, 2017, 1:01:24 PM", "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType sap.ui.model.type.Currency", function(assert) {

		oFieldEdit.setDataType("sap.ui.model.type.Currency");
		oFieldEdit.setValue([12.34, "USD"]);
		oFieldDisplay.setDataType("sap.ui.model.type.Currency");
		oFieldDisplay.setValue([12.34, "USD"]);

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/ui/model/type/Currency"], function(Input, Currency) {
			sap.ui.getCore().applyChanges();
			var oType = new Currency();
			sValue = oType.formatValue([12.34, "USD"], "string"); // because of special whitspaced and local dependend
			setTimeout(function () {
				var oContent = oFieldEdit.getAggregation("_content");
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

		oFieldEdit.setWidth("100px");
		oFieldDisplay.setWidth("100px");
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#F1").width(), 100, "Width of Edit Field");
		assert.equal(jQuery("#F2").width(), 100, "Width of Display Field");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/m/Text"], function (Input, Text) {
			setTimeout(function () {
				var oContent = oFieldEdit.getAggregation("_content");
				assert.equal(oContent.getWidth(), "100%", "width of 100% set on FieldBase control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getWidth(), "100%", "width of 100% set on FieldBase control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("required", function(assert) {

		var oLabel = new Label("L1", {text: "test", labelFor: oFieldEdit}).placeAt("content");
		oFieldEdit.setRequired(true);
		var fnDone = assert.async();

		sap.ui.getCore().applyChanges();

		sap.ui.require(["sap/m/Input"], function (Input) {
			setTimeout(function() {
				var oContent = oFieldEdit.getAggregation("_content");
				assert.ok(oContent.getRequired(), "Required set on Input control");
				assert.ok(oLabel.isRequired(), "Label rendered as required");
				oLabel.destroy();
				fnDone();
			}, 0);
		});

	});

	QUnit.test("placeholder", function(assert) {

		oFieldEdit.setPlaceholder("Test");
		var fnDone = assert.async();

		sap.ui.require(["sap/m/Input"], function (Input) {
			setTimeout(function() {
				var oContent = oFieldEdit.getAggregation("_content");
				assert.equal(oContent.getPlaceholder(), "Test", "Placeholder set on Input control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("valueState", function(assert) {

		oFieldEdit.setValueState("Error");
		oFieldEdit.setValueStateText("Test");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function (Input) {
			setTimeout(function() {
				var oContent = oFieldEdit.getAggregation("_content");
				assert.equal(oContent.getValueState(), "Error", "ValueState set on Input control");
				assert.equal(oContent.getValueStateText(), "Test", "ValueStateText set on Input control");
				fnDone();
			}, 0);
		});
	});

	QUnit.test("textAlign", function(assert) {

		oFieldEdit.setTextAlign("End");
		oFieldDisplay.setTextAlign("End");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/m/Text"], function (Input, Text) {
			setTimeout(function() {
				var oContent = oFieldEdit.getAggregation("_content");
				assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Input control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Text control");
				fnDone();
			}, 0);
		});
	});

	QUnit.test("textDirection", function(assert) {

		oFieldEdit.setTextDirection("RTL");
		oFieldDisplay.setTextDirection("RTL");

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/m/Text"], function (Input, Text) {
			setTimeout(function() {
				var oContent = oFieldEdit.getAggregation("_content");
				assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Input control");

				oContent = oFieldDisplay.getAggregation("_content");
				assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Text control");
				fnDone();
			}, 0);
		});
	});

	QUnit.test("maxConditions", function(assert) {

		assert.equal(oFieldEdit.getMaxConditions(), 1, "MaxConditions is 1");
		_checkException(assert, oFieldEdit, oFieldEdit.setMaxConditions, "setMaxConditions", 2);

	});

	QUnit.module("Eventing", {
		beforeEach: function() {
			oField = new Field("F1");
			oField.attachChange(_myChangeHandler);
			oField.attachLiveChange(_myLiveChangeHandler);
			oField.attachPress(_myPressHandler);
			oField.attachParseError(_myParseErrorHandler);
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
		}
	});

	QUnit.test("with internal content", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/m/DatePicker"], function (Input, DatePicker) {
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
				assert.equal(oField.getValue(), "X", "Field value");

				// just fake change with additional value
				oField._fireChange([Condition.createItemCondition("key", "text")], true);
				assert.equal(iCount, 2, "change event fired again");
				assert.equal(sValue, "key", "change event value");
				assert.equal(oField.getValue(), "key", "Field value");
				assert.equal(oField.getAdditionalValue(), "text", "Field additionalValue");

				//simulate liveChange by calling from internal control
				oContent.fireLiveChange({value: "Y"});
				assert.equal(iLiveCount, 1, "liveChange event fired once");
				assert.equal(sLiveId, "F1", "liveChange event fired on Field");
				assert.equal(sLiveValue, "Y", "liveChange event value");

				oField.setValue("2017-09-19"); // use ISO date to format it to locale specific one
				oField.setDataType("Edm.Date");
				sap.ui.getCore().applyChanges();
				setTimeout(function () {
					oContent = oField.getAggregation("_content");
					oContent.focus();
					jQuery(oContent.getFocusDomRef()).val("XXXX");
					qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
					assert.equal(iParseError, 1, "ParseError fired");
					assert.equal(iCount, 3, "change event fired again");
					assert.notOk(bValid, "Value is not valid");
					assert.equal(sValue, "XXXX", "Value of change event");
					assert.equal(oField.getValue(), "2017-09-19", "Field value");
					fnDone();
				}, 500);
			}, 0);
		});

	});

	QUnit.test("with external content", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Slider", "sap/m/Button"], function (Slider, Button) {
			setTimeout(function() {
				oField.setValue(70);
				var oSlider = new Slider("S1");
				oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType()});
				oField.setContent(oSlider);
				sap.ui.getCore().applyChanges();

				oSlider.focus();
				qutils.triggerKeyboardEvent(oSlider.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.equal(sValue, 71, "change event value");
				assert.ok(bValid, "change event valid");
				assert.equal(oField.getValue(), 71, "Field value");
				assert.equal(iLiveCount, 1, "liveChange event fired once");
				assert.equal(sLiveId, "F1", "liveChange event fired on Field");
				assert.equal(sLiveValue, 71, "liveChange event value");

				var oButton = new Button("B1");
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
				fnDone();
			}, 0);
		});

	});

	QUnit.module("Clone", {
		beforeEach: function() {
			oField = new Field("F1");
			oField.setValue("Test");
			oField.attachChange(_myChangeHandler);
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
		sap.ui.require(["sap/m/Input"], function (Input) {
			var oClone = oField.clone("myClone");
			oClone.placeAt("content");
			sap.ui.getCore().applyChanges();

			setTimeout(function () {
				var oContent = oField.getAggregation("_content");
				assert.equal(oContent.getValue(), "Test", "value set on Input control");
				var oCloneContent = oClone.getAggregation("_content");
				assert.equal(oCloneContent.getValue(), "Test", "Value set on clone Input control");

				oField.setValue("Hello");
				sap.ui.getCore().applyChanges();
				setTimeout(function () {
					assert.equal(oContent.getValue(), "Hello", "value set on Input control");
					assert.equal(oCloneContent.getValue(), "Test", "Value set on clone Input control");

					oClone.setValue("World");
					sap.ui.getCore().applyChanges();
					setTimeout(function () {
						assert.equal(oContent.getValue(), "Hello", "value set on Input control");
						assert.equal(oCloneContent.getValue(), "World", "Value set on clone Input control");

						oContent.focus();
						jQuery(oContent.getFocusDomRef()).val("X");
						qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
						//assert.equal(iCount, 1, "Event fired once");
						assert.equal(sId, "F1", "Event fired on original Field");
						assert.equal(sValue, "X", "Event value");
						assert.equal(oField.getValue(), "X", "Field value");
						assert.equal(oClone.getValue(), "World", "Clone value");

						iCount = 0;
						sId = "";
						sValue = "";

						oCloneContent.focus();
						jQuery(oCloneContent.getFocusDomRef()).val("Y");
						qutils.triggerKeyboardEvent(oCloneContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
						assert.equal(iCount, 1, "Event fired once");
						assert.equal(sId, "F1-myClone", "Event fired on clone");
						assert.equal(sValue, "Y", "Event value");
						assert.equal(oField.getValue(), "X", "Field value");
						assert.equal(oClone.getValue(), "Y", "Clone value");

						oClone.destroy();
						fnDone();
					}, 0);
				}, 0);
			}, 0);
		});

	});

	QUnit.test("with external content", function(assert) {

		oField.setValue(70);
		var fnDone = assert.async();
		sap.ui.require(["sap/m/Slider", "sap/m/Input"], function (Slider, Input) {
			var oSlider = new Slider("S1");
			oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType()});
			oField.setContent(oSlider);
			sap.ui.getCore().applyChanges();
			var oClone = oField.clone("myClone");
			oClone.placeAt("content");
			sap.ui.getCore().applyChanges();

			setTimeout(function () {
				var oCloneSlider = oClone.getContent();
				assert.ok(oCloneSlider instanceof Slider, "Clone has Slider as Content");
				assert.equal(oCloneSlider.getValue(), 70, "Value set on clone Slider control");

				oField.setValue(80);
				sap.ui.getCore().applyChanges();
				setTimeout(function () {
					assert.equal(oSlider.getValue(), 80, "value set on Slider control");
					assert.equal(oCloneSlider.getValue(), 70, "Value set on clone Slider control");

					oClone.setValue(60);
					sap.ui.getCore().applyChanges();
					setTimeout(function () {
						assert.equal(oSlider.getValue(), 80, "value set on Slider control");
						assert.equal(oCloneSlider.getValue(), 60, "Value set on clone Slider control");

						oSlider.focus();
						qutils.triggerKeyboardEvent(oSlider.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
						assert.equal(iCount, 1, "Event fired once");
						assert.equal(sId, "F1", "Event fired on original Field");
						assert.equal(sValue, 81, "Event value");
						assert.equal(oField.getValue(), 81, "Field value");
						assert.equal(oClone.getValue(), 60, "Clone value");

						iCount = 0;
						sId = "";
						sValue = "";

						oCloneSlider.focus();
						qutils.triggerKeyboardEvent(oCloneSlider.getFocusDomRef().id, jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, false);
						//assert.equal(iCount, 1, "Event fired once");
						assert.equal(sId, "F1-myClone", "Event fired on clone");
						assert.equal(sValue, 61, "Event value");
						assert.equal(oField.getValue(), 81, "Field value");
						assert.equal(oClone.getValue(), 61, "Clone value");

						oClone.destroy();
						fnDone();
					}, 0);
				}, 0);
			}, 0);
		});

	});

	var oModel;
	var oType;
	var oField2;
	var oType2;

	QUnit.module("Binding", {
		beforeEach: function() {
			oModel = new JSONModel({
				value: 10,
				date: new Date(Date.UTC(2018, 11, 20))
			});

			oType = new IntegerType();
			oType._bMyType = true;

			oField = new Field("F1", {
				value: {path: "/value", type: oType},
				change: _myChangeHandler
			}).placeAt("content");
			oField.setModel(oModel);

			oType2 = new DateTimeType({style: "long"}, {displayFormat: "Date"});
			oType2._bMyType = true;

			oField2 = new Field("F2", {
				value: {path: "/date", type: oType2},
				change: _myChangeHandler
			}).placeAt("content");
			oField2.setModel(oModel);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			oField2.destroy();
			oField2 = undefined;
			oModel.destroy();
			oModel = undefined;
			oType.destroy();
			oType = undefined;
			oType2.destroy();
			oType2 = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
		}
	});

	QUnit.test("using given type", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input", "sap/m/DatePicker"], function (Input, DatePicker) {
			setTimeout(function() {
				assert.ok(oField._oDataType._bMyType, "Given Type is used in Field");
				var oContent = oField.getAggregation("_content");
				assert.equal(oContent.getValue(), "10", "Value set on Input control");
				var oBindingInfo = oContent.getBindingInfo("value");
				var oConditionsType = oBindingInfo.type;
				var oMyType = oConditionsType.oFormatOptions.valueType;
				assert.ok(oMyType._bMyType, "Given Type is used in Binding for Input");

				assert.notOk(oField2._oDataType._bMyType, "Given Type is not used used in Field");
				assert.ok(oField2._oDataType.isA("sap.ui.model.odata.type.DateTime"), "DateTime type used");
				oContent = oField2.getAggregation("_content");
				assert.ok(oContent instanceof DatePicker, "DatePicker used");
				assert.equal(oContent.getValue(), "2018-12-20", "Value set on DatePicker control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "December 20, 2018", "Value shown on DatePicker control");
				oBindingInfo = oContent.getBindingInfo("value");
				oConditionsType = oBindingInfo.type;
				oMyType = oConditionsType.oFormatOptions.valueType;
				assert.notOk(oMyType._bMyType, "Given Type is not used in Binding for Input");
				assert.ok(oMyType.isA("sap.ui.model.odata.type.DateTime"), "DateTime type used in ConditionsType");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("update Value", function(assert) {

		var fnDone = assert.async();
		sap.ui.require(["sap/m/Input"], function (Input) {
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				var oContent = oField.getAggregation("_content");
				jQuery(oContent.getFocusDomRef()).val("11");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
				assert.equal(oModel.getData().value, 11, "Value in Model updated");
				fnDone();
			}, 0);
		});

	});

});