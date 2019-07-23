/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/Table", "sap/ui/mdc/Column", "sap/m/Text", "sap/ui/model/json/JSONModel"
], function(Table, Column, Text, JSONModel) {
	"use strict";

	QUnit.module("sap.ui.mdc.Column", {
		before: function(assert) {
			//
		},
		after: function() {
			//
		},
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Instantiate", function(assert) {
		assert.ok(this.oColumn);
	});

	QUnit.module("Templates", {
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Model and context propagation", function(assert) {
		var oModel = new JSONModel();

		// Setting models and bindingContexts directly to the column is not really a use case, but good for testing.
		this.oColumn = new Column({
			template: new Text(),
			creationTemplate: new Text(),
			models: {
				modelInConstructor: oModel
			},
			bindingContexts: {
				modelInConstructor: oModel.createBindingContext("/path")
			}
		});
		this.oColumn.setModel(new JSONModel());
		this.oColumn.setModel(new JSONModel(), "modelName");
		this.oColumn.setBindingContext(this.oColumn.getModel().createBindingContext("/path"));
		this.oColumn.setBindingContext(this.oColumn.getModel("modelName").createBindingContext("/path"), "modelName");

		function test(oObject, sObjectName) {
			assert.equal(oObject.getModel() === undefined, true,
				sObjectName + ": Has no unnamed model");
			assert.equal(oObject.getBindingContext() === undefined, true,
				sObjectName + ": Has no binding context for unnamed model");
			assert.equal(oObject.getModel("modelName") === undefined, true,
				sObjectName + ": Has no named model");
			assert.equal(oObject.getBindingContext("modelName") === undefined, true,
				sObjectName + ": Has no binding context for named model");
			assert.equal(oObject.getModel("modelInConstructor") === undefined, true,
				sObjectName + ": Has no model that was passed to the constructor");
			assert.equal(oObject.getBindingContext("modelInConstructor") === undefined, true,
				sObjectName + ": Has no binding context for model that was passed to the constructor");
		}

		test(this.oColumn.getTemplate(), "Template from constructor");
		test(this.oColumn.getCreationTemplate(), "CreationTemplate from constructor");

		this.oColumn.setTemplate(new Text());
		this.oColumn.setCreationTemplate(new Text());

		test(this.oColumn.getTemplate(), "Template from setter");
		test(this.oColumn.getCreationTemplate(), "CreationTemplate from setter");
	});

	QUnit.test("Clones", function(assert) {
		assert.ok(!this.oColumn._oTemplateClone, "No template clone exists initially");
		assert.ok(!this.oColumn._oCreationTemplateClone, "No creationTemplate clone exists initially");

		var oTemplate = new Text({text: "foo"});
		var oCreationTemplate = new Text({text: "bar"});

		this.oColumn.setTemplate(oTemplate);
		this.oColumn.setCreationTemplate(oCreationTemplate);

		var oTemplateClone = this.oColumn.getTemplate(true);
		var oCreationTemplateClone = this.oColumn.getCreationTemplate(true);
		var oTemplateCloneDestroySpy = sinon.spy(oTemplateClone, "destroy");
		var oCreationTemplateCloneDestroySpy = sinon.spy(oCreationTemplateClone, "destroy");

		assert.strictEqual(this.oColumn._oTemplateClone, oTemplateClone, "Reference to the template clone is saved");
		assert.strictEqual(this.oColumn.getTemplate(true), oTemplateClone, "Existing template clone is returned");
		assert.strictEqual(this.oColumn.getTemplate(), oTemplate, "Template is returned");
		assert.notStrictEqual(this.oColumn.getTemplate(), oTemplateClone, "Template and clone are different instances");

		assert.strictEqual(this.oColumn._oCreationTemplateClone, oCreationTemplateClone, "Reference to the creationTemplate clone is saved");
		assert.strictEqual(this.oColumn.getCreationTemplate(true), oCreationTemplateClone, "Existing creationTemplate clone is returned");
		assert.strictEqual(this.oColumn.getCreationTemplate(), oCreationTemplate, "CreationTemplate is returned");
		assert.notStrictEqual(this.oColumn.getCreationTemplate(), oCreationTemplateClone, "CreationTemplate and clone are different instances");

		this.oColumn.destroy();

		assert.ok(oTemplateCloneDestroySpy.calledOnce, "The template clone was destroyed");
		assert.ok(oCreationTemplateCloneDestroySpy.calledOnce, "The creationTemplate clone was destroyed");
		assert.ok(!this.oColumn._oTemplateClone, "Reference to the template clone is removed");
		assert.ok(!this.oColumn._oCreationTemplateClone, "Reference to the creationTemplate clone is removed");
	});
});
