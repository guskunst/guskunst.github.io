/**
 * tests for the sap.suite.ui.generic.template.changeHandler.RemoveTableColumn
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/RemoveTableColumn"
],
function(RemoveTableColumn) {
	"use strict";

	QUnit.module("RemoveTableColumn revertChange Test Module");

	QUnit.test("RevertChange", function(assert) {
		var fnRevertChange = RemoveTableColumn.revertChange;
		assert.ok(fnRevertChange && typeof fnRevertChange === "function", "revertChange method exists for RemoveTableColumn action");
	});
})