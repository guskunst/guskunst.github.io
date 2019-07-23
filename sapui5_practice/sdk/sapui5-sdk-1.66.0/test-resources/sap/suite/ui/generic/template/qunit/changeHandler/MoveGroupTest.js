/**
 * tests for the sap.suite.ui.generic.template.changeHandler.MoveGroup
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/MoveGroup"
],
function(MoveGroup) {
	"use strict";

	QUnit.module("MoveGroup revertChange Test Module");

	QUnit.test("RevertChange", function(assert) {
		var fnRevertChange = MoveGroup.revertChange;
		assert.ok(fnRevertChange && typeof fnRevertChange === "function", "revertChange method exists for MoveGroup action");
	});
})