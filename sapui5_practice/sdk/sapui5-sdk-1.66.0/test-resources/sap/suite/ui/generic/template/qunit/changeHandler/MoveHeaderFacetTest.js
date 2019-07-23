/**
 * tests for the sap.suite.ui.generic.template.changeHandler.MoveHeaderFacet
 */
sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/MoveHeaderFacet"
],
function(MoveHeaderFacet) {
	"use strict";

	QUnit.module("MoveHeaderFacet revertChange Test Module");

	QUnit.test("RevertChange", function(assert) {
		var fnRevertChange = MoveHeaderFacet.revertChange;
		assert.ok(fnRevertChange && typeof fnRevertChange === "function", "revertChange method exists for MoveHeaderFacet action");
	});
})