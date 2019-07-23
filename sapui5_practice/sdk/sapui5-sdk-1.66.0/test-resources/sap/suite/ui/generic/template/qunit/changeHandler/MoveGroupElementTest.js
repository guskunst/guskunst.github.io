/**
 * tests for the sap.suite.ui.generic.template.changeHandler.MoveGroupElement
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/MoveGroupElement"
],
function(MoveGroupElement) {
	"use strict";

	QUnit.module("MoveGroupElement revertChange Test Module");

	QUnit.test("RevertChange", function(assert) {
		var fnRevertChange = MoveGroupElement.revertChange;
		assert.ok(fnRevertChange && typeof fnRevertChange === "function", "revertChange method exists for MoveGroupElement action");
	});
})