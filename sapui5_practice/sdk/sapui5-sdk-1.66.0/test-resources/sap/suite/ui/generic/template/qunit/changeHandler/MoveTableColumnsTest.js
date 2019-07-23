/**
 * tests for the sap.suite.ui.generic.template.changeHandler.MoveTableColumns
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/MoveTableColumns"
],
function(MoveTableColumns) {
	"use strict";

	QUnit.module("MoveTableColumns revertChange Test Module");

	QUnit.test("RevertChange", function(assert) {
		var fnRevertChange = MoveTableColumns.revertChange;
		assert.ok(fnRevertChange && typeof fnRevertChange === "function", "revertChange method exists for MoveTableColumns action");
	});
})