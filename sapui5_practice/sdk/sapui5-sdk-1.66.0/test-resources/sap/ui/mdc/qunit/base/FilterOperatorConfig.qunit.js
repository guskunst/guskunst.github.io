/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

/* global QUnit */
/*eslint no-warning-comments: 0 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/mdc/base/FilterOperatorConfig",
	"sap/ui/mdc/base/Condition",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function(
	jQuery,
	FilterOperatorConfig,
	Condition,
	JSONModel,
	Filter
) {
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.mdc.base.FilterOperatorConfig", {
		beforeEach: function() {

		},

		afterEach: function() {}
	});


	//*********************************************************************************************
	// Create and configure the FilterOperatorConfig to test
	var oFilterOperatorConfig = new FilterOperatorConfig(); // TODO: this is fake, needed as long as we cannot access a Model with FilterOperatorConfig

	// add custom operator
	oFilterOperatorConfig.addOperator({
		name: "THISYEAR",
		tokenParse: "^thisyear$",
		tokenFormat: "THISYEAR",
		valueTypes: [],
		getModelFilter: function(oCondition, sFieldPath) {
			return new Filter({ path: sFieldPath, operator: "EQ", value1: new Date().getFullYear() });
		}
	});
	oFilterOperatorConfig.addOperatorsToType("date", "THISYEAR");


	//*********************************************************************************************
	QUnit.test("Checks for Default Configuration", function(assert) {
		var aOperators = ["EQ", "LT", "GT", "LE", "GE", "Contains", "StartsWith", "EndsWith", "BT", "THISYEAR", "EEQ"],
			aFormatTest = {
				"EEQ": [{
					formatArgs: [["Test", "desc"]],
					formatValue: "desc (Test)",
					parseArgs: ["==Test"],
					parsedValue: "Test",
					condition: Condition.createCondition("EEQ", [undefined, "Test"])
				},
				{
					formatArgs: [["Test", "desc"], undefined, undefined, "Value"],
					formatValue: "Test",
					parseArgs: ["==Test", undefined, "Value"],
					parsedValue: "Test",
					condition: Condition.createCondition("EEQ", ["Test", undefined])
				},
				{
					formatArgs: [["Test", "desc"], undefined, undefined, "Description"],
					formatValue: "desc",
					parseArgs: ["==desc", undefined, "Description"],
					parsedValue: "desc",
					condition: Condition.createCondition("EEQ", [undefined, "desc"])
				},
				{
					formatArgs: [["Test", "desc"], undefined, undefined, "ValueDescription"],
					formatValue: "Test (desc)",
					parseArgs: ["==Test", undefined, "ValueDescription"],
					parsedValue: "Test",
					condition: Condition.createCondition("EEQ", ["Test", undefined])
				},
				{
					formatArgs: [["Test", "desc"], undefined, undefined, "ValueDescription"],
					formatValue: "Test (desc)",
					parseArgs: ["==Test (desc)", undefined, "ValueDescription"],
					parsedValue: "Testdesc",
					condition: Condition.createCondition("EEQ", ["Test", "desc"])
				}
				],
				"EQ": [{
						formatArgs: [["Test"]],
						formatValue: "=Test",
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test"])
					},
					{
						formatArgs: [["="]],
						formatValue: "==",
						parsedValue: undefined
					},
					{
						formatArgs: [[""]],
						formatValue: "=",
						parsedValue: ""
					},
					{
						formatArgs: [[undefined]],
						formatValue: "=",
						parsedValue: ""
					},
					{
						formatArgs: [[null]],
						formatValue: "=",
						parsedValue: ""
					},
					{
						formatArgs: [["a", "b"]],
						formatValue: "=a",
						parsedValue: "a",
						condition: Condition.createCondition("EQ", ["a"])
					},
					{
						formatArgs: [[null, "b"]],
						formatValue: "=",
						parsedValue: ""
					},
					{
						formatArgs: [[
							[]
						]],
						formatValue: "=",
						parsedValue: ""
					}
				],
				"LT": [{
						formatArgs: [["Test"]],
						formatValue: "<Test",
						parsedValue: "Test",
						condition: Condition.createCondition("LT", ["Test"])
					},
					{
						formatArgs: [["<"]],
						formatValue: "<<",
						parsedValue: "<"
					},
					{
						formatArgs: [[""]],
						formatValue: "<",
						parsedValue: ""
					},
					{
						formatArgs: [[undefined]],
						formatValue: "<",
						parsedValue: ""
					},
					{
						formatArgs: [[null]],
						formatValue: "<",
						parsedValue: ""
					},
					{
						formatArgs: [["a", "b"]],
						formatValue: "<a",
						parsedValue: "",
						condition: Condition.createCondition("LT", ["a"])
					},
					{
						formatArgs: [[null, "b"]],
						formatValue: "<",
						parsedValue: ""
					},
					{
						formatArgs: [[
							[]
						]],
						formatValue: "<",
						parsedValue: ""
					}
				],
				"GT": [{
						formatArgs: [["Test"]],
						formatValue: ">Test",
						parsedValue: "Test",
						condition: Condition.createCondition("GT", ["Test"])
					},
					{
						formatArgs: [[">"]],
						formatValue: ">>",
						parsedValue: ">"
					},
					{
						formatArgs: [[""]],
						formatValue: ">",
						parsedValue: ""
					},
					{
						formatArgs: [[undefined]],
						formatValue: ">",
						parsedValue: ""
					},
					{
						formatArgs: [[null]],
						formatValue: ">",
						parsedValue: ""
					},
					{
						formatArgs: [["a", "b"]],
						formatValue: ">a",
						parsedValue: "a",
						condition: Condition.createCondition("GT", ["a"])
					},
					{
						formatArgs: [[null, "b"]],
						formatValue: ">",
						parsedValue: ""
					},
					{
						formatArgs: [[
							[]
						]],
						formatValue: ">",
						parsedValue: ""
					}
				],
				"LE": [{
						formatArgs: [["Test"]],
						formatValue: "<=Test",
						parsedValue: "Test",
						condition: Condition.createCondition("LE", ["Test"])
					},
					{
						formatArgs: [["<="]],
						formatValue: "<=<=",
						parsedValue: "<="
					},
					{
						formatArgs: [[""]],
						formatValue: "<=",
						parsedValue: ""
					},
					{
						formatArgs: [[undefined]],
						formatValue: "<=",
						parsedValue: ""
					},
					{
						formatArgs: [[null]],
						formatValue: "<=",
						parsedValue: ""
					},
					{
						formatArgs: [["a", "b"]],
						formatValue: "<=a",
						parsedValue: "a",
						condition: Condition.createCondition("LE", ["a"])
					},
					{
						formatArgs: [[null, "b"]],
						formatValue: "<=",
						parsedValue: ""
					},
					{
						formatArgs: [[
							[]
						]],
						formatValue: "<=",
						parsedValue: ""
					}
				],
				"GE": [{
						formatArgs: [["Test"]],
						formatValue: ">=Test",
						parsedValue: "Test",
						condition: Condition.createCondition("GE", ["Test"])
					},
					{
						formatArgs: [[">="]],
						formatValue: ">=>=",
						parsedValue: ">="
					},
					{
						formatArgs: [[""]],
						formatValue: ">=",
						parsedValue: ""
					},
					{
						formatArgs: [[undefined]],
						formatValue: ">=",
						parsedValue: ""
					},
					{
						formatArgs: [[null]],
						formatValue: ">=",
						parsedValue: ""
					},
					{
						formatArgs: [["a", "b"]],
						formatValue: ">=a",
						parsedValue: "a",
						condition: Condition.createCondition("GE", ["a"])
					},
					{
						formatArgs: [[null, "b"]],
						formatValue: ">=",
						parsedValue: ""
					},
					{
						formatArgs: [[
							[]
						]],
						formatValue: ">=",
						parsedValue: ""
					}
				],
				"StartsWith": [{
						formatArgs: [["Test"]],
						formatValue: "Test*",
						parsedValue: "Test",
						condition: Condition.createCondition("StartsWith", ["Test"])
					},
					{
						formatArgs: [["*"]],
						formatValue: "**",
						parsedValue: ""
					},
					{
						formatArgs: [[""]],
						formatValue: "*",
						parsedValue: ""
					},
					{
						formatArgs: [[undefined]],
						formatValue: "*",
						parsedValue: ""
					},
					{
						formatArgs: [[null]],
						formatValue: "*",
						parsedValue: ""
					},
					{
						formatArgs: [["a", "b"]],
						formatValue: "a*",
						parsedValue: "a",
						condition: Condition.createCondition("StartsWith", ["a"])
					},
					{
						formatArgs: [[null, "b"]],
						formatValue: "*",
						parsedValue: ""
					},
					{
						formatArgs: [[
							[]
						]],
						formatValue: "*",
						parsedValue: ""
					}
				],
				"EndsWith": [{
						formatArgs: [["Test"]],
						formatValue: "*Test",
						parsedValue: "Test",
						condition: Condition.createCondition("EndsWith", ["Test"])
					},
					{
						formatArgs: [[""]],
						formatValue: "*",
						parsedValue: ""
					},
					{
						formatArgs: [[undefined]],
						formatValue: "*",
						parsedValue: ""
					},
					{
						formatArgs: [[null]],
						formatValue: "*",
						parsedValue: ""
					},
					{
						formatArgs: [["a", "b"]],
						formatValue: "*a",
						parsedValue: "a",
						condition: Condition.createCondition("EndsWith", ["a"])
					},
					{
						formatArgs: [[null, "b"]],
						formatValue: "*",
						parsedValue: ""
					},
					{
						formatArgs: [[
							[]
						]],
						formatValue: "*",
						parsedValue: ""
					}
				],
				"BT": [{
						formatArgs: [["Test1", "Test2"]],
						formatValue: "Test1...Test2",
						parsedValue: "Test1Test2",
						condition: Condition.createCondition("BT", ["Test1", "Test2"])
					},
					{
						formatArgs: [["", ""]],
						formatValue: "...",
						parsedValue: ""
					},
					{
						formatArgs: [[undefined, undefined]],
						formatValue: "...",
						parsedValue: ""
					},
					{
						formatArgs: [[null, null]],
						formatValue: "...",
						parsedValue: ""
					},
					{
						formatArgs: [["a", "b"]],
						formatValue: "a...b",
						parsedValue: "ab",
						condition: Condition.createCondition("BT", ["a", "b"])
					},
					{
						formatArgs: [[null, "b"]],
						formatValue: "...b",
						parsedValue: ""
					},
					{
						formatArgs: [[
							[]
						]],
						formatValue: "...",
						parsedValue: ""
					}
				],
				"Contains": [{
						formatArgs: [["Test"]],
						formatValue: "*Test*",
						parsedValue: "Test",
						condition: Condition.createCondition("Contains", ["Test"])
					},
					{
						formatArgs: [["a", "b"]],
						formatValue: "*a*",
						parsedValue: "a",
						condition: Condition.createCondition("Contains", ["a"])
					},
					{
						formatArgs: [[null, "b"]],
						formatValue: "**",
						parsedValue: ""
					},
					{
						formatArgs: [[
							[]
						]],
						formatValue: "**",
						parsedValue: ""
					}
				],
				"THISYEAR": [{
					formatArgs: [["THISYEAR"]],
					formatValue: "THISYEAR",
					parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
					custom: true
				}]
			};
		//checking all above Operators for valitity
		aOperators.forEach(function(sOperator) {
			var oOperator = oFilterOperatorConfig.getOperator(sOperator);
			assert.ok(true, "--------------------   Checking Operator " + sOperator + "   -----------------------------------------");
			assert.strictEqual(oOperator.shortText !== "", true, "Operator " + sOperator + " has a valid shortText " + oOperator.shortText);
			assert.strictEqual(oOperator.longText !== "", true, "Operator " + sOperator + " has a valid longText " + oOperator.longText);
			assert.strictEqual(oOperator.tokenText !== "", true, "Operator " + sOperator + " has a valid tokenText " + oOperator.tokenText);
			assert.strictEqual(oOperator.tokenParse !== null, true, "Operator " + sOperator + " has a valid tokenParse " + oOperator.tokenParse);
			assert.strictEqual(oOperator.tokenFormat !== null, true, "Operator " + sOperator + " has a valid tokenFormat " + oOperator.tokenFormat);
			assert.strictEqual(oOperator.tokenParseRegExp !== null && oOperator.tokenParseRegExp instanceof RegExp, true, "Operator " + sOperator + " has a valid tokenParseRegExp " + oOperator.tokenParseRegExp);

			//check formatting and parsing of values
			var bCustom = false;
			if (aFormatTest[sOperator]) {
				for (var j = 0; j < aFormatTest[sOperator].length; j++) {
					var oTest = aFormatTest[sOperator][j];
					if (oTest.custom) {
						bCustom = true;
					}

					// EQ-Operator.format(["Test"]) --> "=Test"
					var sFormattedText = oOperator.format.apply(oOperator, oTest.formatArgs);
					assert.strictEqual(sFormattedText, oTest.formatValue, "Formatting: Operator " + sOperator + " has formated correctly from " + oTest.formatArgs.join() + " to " + oTest.formatValue);

					// EQ-Operator.parse("=Test") --> ["Test"]
					var aParseText = oOperator.parse.apply(oOperator, oTest.parseArgs || [sFormattedText]);
					if (oTest.parsedValue) {
						assert.strictEqual(aParseText.join(""), oTest.parsedValue, "Parsing: Operator " + sOperator + " has parsed correctly from " + oTest.formatValue + " to " + aParseText.join());
					}

					// QE-Operator.getCondition("=Test") --> {operator: "EQ", values: ["Test"]]}
					var oCondition = oOperator.getCondition.apply(oOperator, oTest.parseArgs || [sFormattedText]);
					if (oTest.condition) {
						assert.deepEqual(oCondition, oTest.condition, "getCondition: Operator " + sOperator + " returns oCondition instance");

						// create the model filter instance of the condition
						//						var oFilter = oOperator.getModelFilter(oCondition);
					}
				}
			}
			if (!bCustom) {
				//strictEqual(Object.isFrozen(oOperator) && !oOperator.custom, true, "Operator " + sOperator + " is a default operator and frozen");
			} else {
				assert.strictEqual(oOperator.custom, true, "Operator " + sOperator + " is a custom operator");
			}
		});
	});


	QUnit.test("FilterOperatorConfig.getParentType", function(assert) {
		assert.strictEqual(oFilterOperatorConfig.getParentType("sap.ui.model.odata.type.Boolean"), "boolean", "boolean should be the parent type of sap.ui.model.odata.type.Boolean");
	});


	QUnit.test("FilterOperatorConfig.addType", function(assert) {
		oFilterOperatorConfig.addType("customType", "string");
		assert.strictEqual(oFilterOperatorConfig.getParentType("customType"), "string", "string should be the parent type of customType");
	});


	QUnit.test("FilterOperatorConfig.addOperator", function(assert) {
		oFilterOperatorConfig.addType("customTypeForOperator", "string");

		oFilterOperatorConfig.addOperator({
			name: "SuperEQ",
			filterOperator: "EQ",
			tokenParse: "^====(.*)$",
			tokenFormat: "====$0",
			valueTypes: ["self"]
		});

		oFilterOperatorConfig.addOperatorsToType("customTypeForOperator", ["SuperEQ"]);

		var aOperators = oFilterOperatorConfig.getOperatorsForType("customTypeForOperator");
		var bIncludesSuperEQ = aOperators.some(function(sOperator) { // IE does not support "Array.contains"
			if (sOperator === "SuperEQ") {
				return true;
			}
		});
		var bIncludesSomethingElse = aOperators.some(function(sOperator) { // IE does not support "Array.contains"
			if (sOperator === "SomethingElse") {
				return true;
			}
		});
		assert.ok(bIncludesSuperEQ, "SuperEQ should be among the operators for customTypeForOperator");
		assert.notOk(bIncludesSomethingElse, "SomethingElse should not be among the operators for customTypeForOperator");
	});



	QUnit.test("FilterOperatorConfig.getOperatorsForType", function(assert) {
		var aBaseOperators = ["EEQ", "Contains", "EQ", "BT", "StartsWith", "EndsWith", "Empty", "NotEmpty", "LE", "LT", "GE", "GT", "NE"];
		var aTimeOperators = ["EQ", "BT", "LE", "LT", "GE", "GT"];
		var aBooleanOperators = ["EQ", "NE"];

		// ??  var aOperators = oFilterOperatorConfig.getOperatorsForType("invalid type");
		//     assert.deepEqual(aOperators, aBaseOperators, "an invalid type should offer all base operators");

		var aOperators = oFilterOperatorConfig.getOperatorsForType("string");
		assert.deepEqual(aOperators, aBaseOperators, "the string type should offer all base operators");

		aOperators = oFilterOperatorConfig.getOperatorsForType("time");
		assert.deepEqual(aOperators, aTimeOperators, "the time type should offer all time operators");

		aOperators = oFilterOperatorConfig.getOperatorsForType("sap.ui.model.odata.type.TimeOfDay");
		assert.deepEqual(aOperators, aTimeOperators, "the sap.ui.model.odata.type.TimeOfDay type should offer all time operators");

		aOperators = oFilterOperatorConfig.getOperatorsForType("sap.ui.model.type.FileSize");
		assert.deepEqual(aOperators, aBaseOperators, "sap.ui.model.type.FileSize should offer all base operators");

		aOperators = oFilterOperatorConfig.getOperatorsForType("sap.ui.model.type.Boolean");
		assert.deepEqual(aOperators, aBooleanOperators, "sap.ui.model.type.Boolean should offer all boolean operators");

		aOperators = oFilterOperatorConfig.getOperatorsForType("sap.ui.model.type.Boolean");
		assert.notDeepEqual(aOperators, aBaseOperators, "sap.ui.model.type.Boolean should NOT offer all boolean operators"); // already checked, but to make sure deepEqual doesn't mask issues
	});


	QUnit.test("FilterOperatorConfig._getMatchingOperators", function(assert) {

		var aOperators = oFilterOperatorConfig._getMatchingOperators(["X", "Y"]);
		assert.strictEqual(aOperators.length, 0, "invalid operators should not result in anything");

		aOperators = oFilterOperatorConfig._getMatchingOperators(["Contains", "EQ", "BT", "StartsWith", "EndsWith", "LE", "LT", "GE", "GT", "NE"], "=true");
		var oExpected = oFilterOperatorConfig.getOperator("EQ");
		assert.strictEqual(aOperators.length, 1, "there should be one matching operator");
		assert.deepEqual(aOperators[0], oExpected, "'=true' should match the EQ operator");

		aOperators = oFilterOperatorConfig._getMatchingOperators(["Contains", "EQ", "BT", "StartsWith", "EndsWith", "LE", "LT", "GE", "GT", "NE"], "=5");
		oExpected = oFilterOperatorConfig.getOperator("EQ");
		assert.strictEqual(aOperators.length, 1, "there should be one matching operator");
		assert.deepEqual(aOperators[0], oExpected, "'=5' should match the EQ operator");

		aOperators = oFilterOperatorConfig._getMatchingOperators(["Contains", "EQ", "BT", "StartsWith", "EndsWith", "LE", "LT", "GE", "GT", "NE"], "*middle*");
		oExpected = oFilterOperatorConfig.getOperator("Contains");
		//		var oExpected2 = oFilterOperatorConfig.getOperator("StartsWith");
		//		var oExpected3 = oFilterOperatorConfig.getOperator("EndsWith");
		assert.strictEqual(aOperators.length, 1, "there should be one matching operator");
		assert.deepEqual(aOperators[0], oExpected, "'*middle*' should match the Contains operator");
	});


	QUnit.test("FilterOperatorConfig.getDefaultOperatorForType", function(assert) {

		var oOperator = oFilterOperatorConfig.getDefaultOperator("base");
		assert.strictEqual(oOperator, "EQ", "EQ should be default operator for base type");

		oOperator = oFilterOperatorConfig.getDefaultOperator("string");
		assert.strictEqual(oOperator, "Contains", "Contains should be default operator for string type");

		oOperator = oFilterOperatorConfig.getDefaultOperator("sap.ui.model.odata.type.TimeOfDay");
		assert.strictEqual(oOperator, "EQ", "EQ should be default operator for sap.ui.model.odata.type.TimeOfDay type");
	});


	QUnit.test("FilterOperatorConfig.registerFor + FilterOperatorConfig.getFor", function(assert) {
		// create a custom Model type
		var CustomModel = JSONModel.extend("my.CustomModel", {
			constructor: function() {
				JSONModel.apply(this, arguments);
			}
		});


		// create a custom FilterOperatorConfig
		var CustomFilterOperatorConfig = FilterOperatorConfig.extend("my.CustomFilterOperatorConfig", {

		});

		assert.strictEqual(CustomFilterOperatorConfig.getMetadata().getName(), "my.CustomFilterOperatorConfig", "the new FilterOperatorConfig should be a 'my.Custom FilterOperatorConfig'");
		assert.ok(new CustomFilterOperatorConfig() instanceof FilterOperatorConfig, "the new FilterOperatorConfig should be instanceof FilterOperatorConfig");


		// register the custom FilterOperatorConfig for a custom model instance
		FilterOperatorConfig.registerFor(CustomModel.getMetadata().getName(), CustomFilterOperatorConfig);
		//TODO: check something

		// check the the FilterOperatorConfig returned for the custom model instance
		var oCustomModel1 = new CustomModel();
		var customFOC1 = FilterOperatorConfig.getFor(oCustomModel1);

		assert.strictEqual(customFOC1.getMetadata().getName(), CustomFilterOperatorConfig.getMetadata().getName(), "the FilterOperatorConfig for the custom model should be the my.Custom FilterOperatorConfig");


		// check the FilterOperatorConfig returned for a plain JSONModel instance
		var oJsonModel1 = new JSONModel();
		var jsonFOC = FilterOperatorConfig.getFor(oJsonModel1);

		assert.strictEqual(jsonFOC.getMetadata().getName(), FilterOperatorConfig.getMetadata().getName(), "the FilterOperatorConfig for the json model should be the base FilterOperatorConfig");

		assert.notOk(jsonFOC instanceof customFOC1.getMetadata().getClass(), "the json config should not be instanceof the custom config");
		assert.ok(customFOC1 instanceof jsonFOC.getMetadata().getClass(), "the custom config should be instanceof the json config");

		// the FilterOperatorConfig returned by another call for the same custom model instance should be the same config instance
		var customFOC1a = FilterOperatorConfig.getFor(oCustomModel1);
		assert.strictEqual(customFOC1, customFOC1a, "the FilterOperatorConfig returned by another call for the same custom model instance should be the same config instance");
		assert.ok(Object.is(customFOC1, customFOC1a), "the FilterOperatorConfig returned by another call for the same custom model instance should be the same config instance (checked with Object.is(...))");


		// the FilterOperatorConfig returned for another custom model instance should be a different config instance
		var oCustomModel2 = new CustomModel();
		var customFOC2 = FilterOperatorConfig.getFor(oCustomModel2);
		assert.notOk(Object.is(customFOC1, customFOC2), "the FilterOperatorConfig returned for another custom model instance should be a different config instance");
	});


});
