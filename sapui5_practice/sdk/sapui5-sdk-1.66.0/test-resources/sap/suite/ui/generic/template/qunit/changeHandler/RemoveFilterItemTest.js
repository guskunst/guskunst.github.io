/**
 * tests for the sap.suite.ui.generic.template.changeHandler.RemoveFilterItem
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/RemoveFilterItem"
],
function(RemoveFilterItem) {
	"use strict";

	QUnit.module("RemoveFilterItem revertChange Test Module");

	QUnit.test("RevertChange", function(assert) {
		var fnRevertChange = RemoveFilterItem.revertChange;
		assert.ok(fnRevertChange && typeof fnRevertChange === "function", "revertChange method exists for RemoveFilterItem action");
	});
})