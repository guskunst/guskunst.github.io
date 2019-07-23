/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/base/type/ConditionType",
	"sap/ui/mdc/base/Condition",
	"sap/ui/mdc/base/FieldHelpBase",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Currency"
], function (
		ConditionType,
		Condition,
		FieldHelpBase,
		IntegerType,
		CurrencyType
		) {
	"use strict";

	var oConditionType;
	var oValueType;

	QUnit.module("Default type", {
		beforeEach: function() {
			oConditionType = new ConditionType();
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
		}
	});

	QUnit.test("Formatting: nothing", function(assert) {

		var sResult = oConditionType.formatValue();
		assert.equal(sResult, null, "Result of formatting");

	});

	QUnit.test("Formatting: EEQ - simple String", function(assert) {

		var oCondition = Condition.createCondition("EEQ", ["Test"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

		oCondition = Condition.createCondition("EEQ", ["1"]);
		var sResult = oConditionType.formatValue(oCondition, "int");
		assert.equal(sResult, 1, "Result of formatting");

	});

	QUnit.test("Formatting: EEQ - key/Description", function(assert) {

		oConditionType.oFormatOptions.display = "Description"; // fake setting directly
		oConditionType.oFormatOptions.onlyEEQ = true; // fake setting directly
		var oCondition = Condition.createCondition("EEQ", ["A", "Test"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

		// EQ fallback
		oCondition = Condition.createCondition("EQ", ["A", "Test"]);
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

	});

	QUnit.test("Formatting: invalid condition", function(assert) {

		var oException;

		try {
			oConditionType.formatValue("Test");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		oException = undefined;

		var oCondition = Condition.createCondition("EQ", []);
		try {
			oConditionType.formatValue(oCondition, "int");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: Contains - simple String", function(assert) {

		var oCondition = Condition.createCondition("Contains", ["Test"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "*Test*", "Result of formatting");

	});

	QUnit.test("Formatting: Contains - simple String (hideOperator)", function(assert) {

		oConditionType.oFormatOptions.hideOperator = true; // fake setting directly
		var oCondition = Condition.createCondition("Contains", ["Test"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

	});

	QUnit.test("Parsing: Default - simple String", function(assert) {

		var oCondition = oConditionType.parseValue("Test");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "Contains", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		var oCondition = oConditionType.parseValue(1, "int");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "Contains", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "1", "Values entry");

	});

	QUnit.test("Parsing: EEQ - simple String", function(assert) {

		oConditionType.setFormatOptions({onlyEEQ: true});
		var oCondition = oConditionType.parseValue("Test");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EEQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");
		assert.notOk(oCondition.values[1], "Description entry");

	});

	QUnit.test("Parsing: EEQ - simple String as 'any'", function(assert) {

		oConditionType.setFormatOptions({onlyEEQ: true});
		var oCondition = oConditionType.parseValue("Test", "any");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EEQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");
		assert.notOk(oCondition.values[1], "Description entry");

	});

	QUnit.test("Parsing: EEQ - empty string", function(assert) {

		oConditionType.setFormatOptions({onlyEEQ: true});
		var oCondition = oConditionType.parseValue("");
		assert.notOk(oCondition, "Result returned");

	});

	QUnit.module("Number type", {
		beforeEach: function() {
			oValueType = new IntegerType({}, {maximum: 100});
			oConditionType = new ConditionType({valueType: oValueType, fieldPath: "X"});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
		}
	});

	QUnit.test("Formatting: EEQ - number", function(assert) {

		var oCondition = Condition.createCondition("EEQ", [2]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "2", "Result of formatting");

	});

	QUnit.test("Parsing: EEQ - number", function(assert) {

		oConditionType.setFormatOptions({onlyEEQ: true, fieldPath: "X"});
		var oCondition = oConditionType.parseValue("1");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EEQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");
		assert.notOk(oCondition.values[1], "Description entry");

	});

	QUnit.test("Parsing: GreaterThan - number", function(assert) {

		var oCondition = oConditionType.parseValue(">1");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "GT", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		var oException;

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Validating: invalid value", function(assert) {

		var oCondition = Condition.createCondition("EEQ", [200]);
		var oException;

		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

		oException = undefined;
		try {
			oConditionType.validateValue("XXX");
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");

	});

	var oFieldHelp;

	QUnit.module("Key/Description", {
		beforeEach: function() {
			oFieldHelp = new FieldHelpBase("FH1");
			var oStub = sinon.stub(oFieldHelp, "getTextForKey");
			oStub.withArgs("I1").returns("Item1");
			oStub.withArgs("I2").returns("Item2");
			oStub.withArgs("I3").returns("Item3");
			oStub = sinon.stub(oFieldHelp, "getKeyForText");
			oStub.withArgs("Item1").returns("I1");
			oStub.withArgs("Item2").returns("I2");
			oStub.withArgs("Item3").returns("I3");

			oConditionType = new ConditionType({
				display: "Description",
				fieldHelpID: "FH1",
				onlyEEQ: true
			});
		},
		afterEach: function() {
			oFieldHelp.destroy();
			oFieldHelp = undefined;
			oConditionType.destroy();
			oConditionType = undefined;
		}
	});

	QUnit.test("Formatting: key -> description (from condition)", function(assert) {

		var oCondition = Condition.createCondition("EEQ", ["I1", "Text1"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Text1", "Result of formatting");

	});

	QUnit.test("Formatting: key -> description (from help)", function(assert) {

		var oCondition = Condition.createCondition("EEQ", ["I1"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Item1", "Result of formatting");

	});

	QUnit.test("Parsing: description -> key", function(assert) {

		var oCondition = oConditionType.parseValue("Item2");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EEQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "I2", "Values entry0");
		assert.equal(oCondition.values[1], "Item2", "Values entry1");

	});

	QUnit.test("Parsing: key -> key and description", function(assert) {

		var oCondition = oConditionType.parseValue("I2");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EEQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "I2", "Values entry0");
		assert.equal(oCondition.values[1], "Item2", "Values entry1");

	});

	QUnit.module("Currency type", {
		beforeEach: function() {
			oValueType = new CurrencyType();
			oConditionType = new ConditionType({valueType: oValueType, onlyEEQ: true});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
		}
	});

	QUnit.test("Formatting: EEQ - Currency", function(assert) {

		var oType = new CurrencyType();
		var sValue = oType.formatValue([123.45, "USD"], "string"); // because of special whitspace and local dependend
		var oCondition = Condition.createCondition("EEQ", [[123.45, "USD"]]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, sValue, "Result of formatting");

	});

	QUnit.test("Formatting: invalid condition", function(assert) {

		var oException;
		var oCondition = Condition.createCondition("EEQ", ["X"]);

		try {
			oConditionType.formatValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Parsing: with unit", function(assert) {

		var oCondition = oConditionType.parseValue("USD 123.45");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EEQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 123.45, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");

		oCondition = oConditionType.parseValue("1.23");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EEQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		assert.equal(oCondition.values[0][1], undefined, "Values entry1");

		// oConditionType.oFormatOptions.valueType._aCurrentValue = [0, "USD"];
		// oCondition = oConditionType.parseValue("1.23");
		// assert.ok(oCondition, "Result returned");
		// assert.equal(typeof oCondition, "object", "Result is object");
		// assert.equal(oCondition.operator, "EEQ", "Operator");
		// assert.ok(Array.isArray(oCondition.values), "values are arry");
		// assert.equal(oCondition.values.length, 1, "Values length");
		// assert.equal(oCondition.values[0].length, 2, "Values0 length");
		// assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		// assert.equal(oCondition.values[0][1], "USD", "Values entry1");
	});

});
