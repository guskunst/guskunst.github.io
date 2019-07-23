/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/comp/providers/TokenParser",
	"sap/m/MultiInput"
], function (TokenParser, MultiInput) {
	"use strict";

	QUnit.module("Testing Public API", {
		beforeEach: function () {
			this.oTokenParser = new TokenParser();
		},
		afterEach: function () {
			//this.oValueHelpDialog.destroy();
			delete this.oTokenParser;
		}
	});

	QUnit.test("Test defaultOperation", function (assert) {
		assert.equal(this.oTokenParser.getDefaultOperation(), undefined, "defaultOperation should be undefined");
		this.oTokenParser.setDefaultOperation("EQ");
		assert.equal(this.oTokenParser.getDefaultOperation(), "EQ", "defaultOperation should be EQ");
	});

	QUnit.test("Test maxLength", function (assert) {
		assert.equal(this.oTokenParser.getMaxLength(), undefined, "maxLength should be undefined");
		this.oTokenParser.setMaxLength(10);
		assert.equal(this.oTokenParser.getMaxLength(), 10, "maxLength should be 10");
	});

	QUnit.test("Test displayFormat", function (assert) {
		assert.equal(this.oTokenParser.getDisplayFormat(), undefined, "displayFormat should be undefined");
		this.oTokenParser.setDisplayFormat("UpperCase");
		assert.equal(this.oTokenParser.getDisplayFormat(), "UpperCase", "displayFormat should be UpperCase");
	});

	QUnit.test("Test getOperation", function (assert) {
		assert.equal(this.oTokenParser.getOperation("foo"), undefined, "getOperation should return undefined");
		QUnit.notEqual(this.oTokenParser.getOperation("EQ"), undefined, "getOperation should return object");
	});

	QUnit.test("Test removeOperation", function (assert) {
		this.oTokenParser.removeOperation("EQ");
		assert.equal(this.oTokenParser.getOperation("EQ"), undefined, "getOperation should return undefined");
		this.oTokenParser.removeAllOperations();
		assert.equal(Object.keys(this.oTokenParser.getOperations()).length, 0, "getOperations should return empty list");
	});

	QUnit.test("Test getTranslatedText", function (assert) {
		assert.equal(this.oTokenParser.getTranslatedText("default", this.oTokenParser.getOperation("EQ")), "equal to", "getTranslatedText should return 'equal to'");
		assert.equal(this.oTokenParser.getTranslatedText("default", this.oTokenParser.getOperation("GT")), "greater than", "getTranslatedText should return 'greater than");
		assert.equal(this.oTokenParser.getTranslatedText("date", this.oTokenParser.getOperation("GT")), "after", "getTranslatedText should return 'after'");
	});

	QUnit.test("Test associateInput", function (assert) {
		var oInput = new MultiInput();
		this.oTokenParser.associateInput(oInput);
		assert.equal(oInput._tokenizer._aTokenValidators.length, 1, "1 validator must be attached");
	});

	QUnit.test("Test validate", function (assert) {
		var oInput = new MultiInput();
		this.oTokenParser.associateInput(oInput);
		var oToken = oInput._tokenizer._aTokenValidators[0]({ text: "foo" });
		assert.equal(oToken, null, "validator returns no Token");

		this.oTokenParser.setDefaultOperation("EQ");
		oToken = oInput._tokenizer._aTokenValidators[0]({ text: "foo" });
		assert.equal(oToken.getText(), "=foo", "validator returns valid Token for default operation");

		oToken = oInput._tokenizer._aTokenValidators[0]({ text: ">=100" });
		assert.equal(oToken.getText(), ">=100", "validator returns valid Token for default operation");

		oToken = oInput._tokenizer._aTokenValidators[0]({ text: "100...200" });
		assert.equal(oToken.getText(), "100...200", "validator returns valid Token for default operation");

		oToken = oInput._tokenizer._aTokenValidators[0]({ text: "*foo*" });
		assert.equal(oToken.getText(), "*foo*", "validator returns valid Token for default operation");

		this.oTokenParser.setMaxLength(4);
		oToken = oInput._tokenizer._aTokenValidators[0]({ text: "*foooooo*" });
		assert.equal(oToken.getText(), "*fooo*", "validator returns valid Token for default operation");

		this.oTokenParser.setDisplayFormat("UpperCase");
		oToken = oInput._tokenizer._aTokenValidators[0]({ text: "*foooooo*" });
		assert.equal(oToken.getText(), "*FOOO*", "validator returns valid Token for default operation");
	});

	QUnit.start();

});