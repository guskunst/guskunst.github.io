/**
 * tests for the sap.suite.ui.generic.template.changeHandler.AddFilterItem
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/AddFilterItem"
],
function(AddFilterItem) {
	"use strict";

	QUnit.module("AddFilterItem revertChange Test Module");

	QUnit.test("RevertChange", function(assert) {
		var fnRevertChange = AddFilterItem.revertChange;
		assert.ok(fnRevertChange && typeof fnRevertChange === "function", "revertChange method exists for AddFilterItem action");
	});
});
