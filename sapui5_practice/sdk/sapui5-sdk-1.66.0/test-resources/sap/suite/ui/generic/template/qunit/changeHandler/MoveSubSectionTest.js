/**
 * tests for the sap.suite.ui.generic.template.changeHandler.MoveSubSection
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/MoveSubSection"
],
function(MoveSubSection) {
	"use strict";

	QUnit.module("MoveSubSection revertChange Test Module");

	QUnit.test("RevertChange", function(assert) {
		var fnRevertChange = MoveSubSection.revertChange;
		assert.ok(fnRevertChange && typeof fnRevertChange === "function", "revertChange method exists for MoveSubSection action");
	});
})