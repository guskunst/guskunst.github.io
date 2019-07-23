/**
 * tests for the sap.suite.ui.generic.template.changeHandler.AddGroupElement
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/AddGroupElement"
],
function(AddGroupElement) {
	"use strict";

	QUnit.module("AddGroupElement revertChange Test Module");

	QUnit.test("RevertChange", function(assert) {
		var fnRevertChange = AddGroupElement.revertChange;
		assert.ok(fnRevertChange && typeof fnRevertChange === "function", "revertChange method exists for AddGroupElement action");
	});
});