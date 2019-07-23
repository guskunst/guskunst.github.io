/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/base/type/ConditionsType",
	"sap/ui/mdc/base/Condition",
	"sap/ui/mdc/base/FieldHelpBase",
	"sap/ui/model/type/Integer"
], function (
		ConditionsType,
		Condition,
		FieldHelpBase,
		IntegerType
		) {
	"use strict";

	var oConditionsType;
	var oValueType;

	QUnit.module("Default type", {
		beforeEach: function() {
			oConditionsType = new ConditionsType({onlyEEQ: true});
		},
		afterEach: function() {
			oConditionsType.destroy();
			oConditionsType = undefined;
		}
	});

	QUnit.test("Formatting: nothing", function(assert) {

		var sResult = oConditionsType.formatValue();
		assert.equal(sResult, null, "Result of formatting");

	});

	QUnit.test("Formatting: simple String", function(assert) {

		var oCondition = Condition.createCondition("EEQ", ["Test"]);
		var sResult = oConditionsType.formatValue([oCondition]);
		assert.equal(sResult, "Test", "Result of formatting");

	});

	QUnit.test("Formatting: empty array", function(assert) {

		var vResult = oConditionsType.formatValue([]);
		assert.equal(vResult, "", "Result of formatting");

		vResult = oConditionsType.formatValue([], "int");
		assert.equal(vResult, 0, "Result of formatting");

	});

	QUnit.test("Formatting: invalid value", function(assert) {

		var oException;

		try {
			oConditionsType.formatValue("Test");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: invalid condition", function(assert) {

		var oException;

		try {
			oConditionsType.formatValue([{x: "X"}]);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: array of conditions", function(assert) {

		oConditionsType.setFormatOptions({onlyEEQ: true, maxConditions: -1});
		var oCondition1 = Condition.createCondition("EEQ", ["Test1"]);
		var oCondition2 = Condition.createCondition("EEQ", ["Test2"]);
		var sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "Test1; Test2", "Result of formatting");

	});

	QUnit.test("Parsing: simple String", function(assert) {

		var aConditions = oConditionsType.parseValue("Test");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 1, "1 condition returned");
		assert.equal(aConditions[0].operator, "EEQ", "Operator");
		assert.ok(Array.isArray(aConditions[0].values), "values are arry");
		assert.equal(aConditions[0].values.length, 2, "Values length");
		assert.equal(aConditions[0].values[0], "Test", "Values entry");
		assert.notOk(aConditions[0].values[1], "empty description");

	});

	QUnit.test("Parsing: EEQ - empty", function(assert) {

		var aConditions = oConditionsType.parseValue("");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 0, "no conditions returned");

	});

	QUnit.test("Formatting: simple Integer", function(assert) {

		oValueType = new IntegerType();
		oConditionsType.setFormatOptions({onlyEEQ: true, valueType: oValueType});

		var oCondition = Condition.createCondition("EEQ", [5]);
		var sResult = oConditionsType.formatValue([oCondition]);
		assert.equal(sResult, "5", "Result of formatting");

		oValueType.destroy();

	});

	QUnit.test("Parsing: simple Integer", function(assert) {

		oValueType = new IntegerType();
		oConditionsType.setFormatOptions({onlyEEQ: true, valueType: oValueType});

		var aConditions = oConditionsType.parseValue("5");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 1, "1 condition returned");
		assert.equal(aConditions[0].operator, "EEQ", "Operator");
		assert.ok(Array.isArray(aConditions[0].values), "values are arry");
		assert.equal(aConditions[0].values.length, 2, "Values length");
		assert.equal(aConditions[0].values[0], 5, "Values entry");
		assert.notOk(aConditions[0].values[1], "empty description");

		oValueType.destroy();

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		oValueType = new IntegerType();
		oConditionsType.setFormatOptions({onlyEEQ: true, valueType: oValueType});
		var oException;

		try {
			oConditionsType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Validating: valid value", function(assert) {

		oValueType = new IntegerType({}, {maximum: 100});
		oConditionsType.setFormatOptions({onlyEEQ: true, valueType: oValueType});
		var oCondition = Condition.createCondition("EEQ", [20]);
		var oException;

		try {
			oConditionsType.validateValue([oCondition]);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: nothing", function(assert) {

		oValueType = new IntegerType({}, {maximum: 100});
		oConditionsType.setFormatOptions({onlyEEQ: true, valueType: oValueType});
		var oException;

		try {
			oConditionsType.validateValue();
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: invalid value", function(assert) {

		oValueType = new IntegerType({}, {maximum: 100});
		oConditionsType.setFormatOptions({onlyEEQ: true, valueType: oValueType});
		var oCondition = Condition.createCondition("EEQ", [200]);
		var oException;

		try {
			oConditionsType.validateValue([oCondition]);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

		oException = undefined;
		try {
			oConditionsType.validateValue("XXX");
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");

	});

	QUnit.test("setConstraints", function(assert) {

		oConditionsType.setConstraints({test: "test"});

		assert.equal(oConditionsType._oConditionType.oConstraints.test, "test", "Constraints set on inner ConditionType");

	});


});