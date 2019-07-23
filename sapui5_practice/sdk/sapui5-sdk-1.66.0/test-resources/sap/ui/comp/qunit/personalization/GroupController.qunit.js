/* global QUnit*/
QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/comp/personalization/GroupController'

], function(GroupController) {
	"use strict";

	var oEmpty = {
		group: {
			groupItems: []
		}
	};
	var oA = {
		group: {
			groupItems: [
				{
					columnKey: "name",
					showIfGrouped: true
				}
			]
		}
	};
	var oAx = {
		group: {
			groupItems: [
				{
					columnKey: "name",
					showIfGrouped: false
				}
			]
		}
	};
	var oB = {
		group: {
			groupItems: [
				{
					columnKey: "country",
					showIfGrouped: true
				}
			]
		}
	};
	var oAB = {
		group: {
			groupItems: [
				{
					columnKey: "name",
					showIfGrouped: true
				}, {
					columnKey: "country",
					showIfGrouped: true
				}
			]
		}
	};
	var oBA = {
		group: {
			groupItems: [
				{
					columnKey: "country",
					showIfGrouped: true
				}, {
					columnKey: "name",
					showIfGrouped: true
				}
			]
		}
	};

	QUnit.module("API", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("getChangeData", function(assert) {
		var oGroupController;
		try {
			// system under test
			oGroupController = new GroupController();

			// arrange

			// act

			// assertions

			assert.deepEqual(oGroupController.getChangeData(oEmpty, oA), oEmpty, "delete: [] XOR A = []");
			assert.deepEqual(oGroupController.getChangeData({}, oA), oEmpty, "");
			assert.deepEqual(oGroupController.getChangeData(oA, oA), null, "no change: A XOR A = null");
			assert.deepEqual(oGroupController.getChangeData(oA, {
				group: {}
			}), oA, "change: A XOR {group} = A");
			assert.deepEqual(oGroupController.getChangeData(oA, {}), oA, "change: A XOR {} = A");
			assert.deepEqual(oGroupController.getChangeData(oA, null), oA, "change: A XOR null = A");
			assert.deepEqual(oGroupController.getChangeData(oA, oB), oA, "change: A XOR B = A");
			assert.deepEqual(oGroupController.getChangeData(oA, oAx), oA, "change: A XOR A' = A");
			assert.deepEqual(oGroupController.getChangeData(oA, oAB), oA, "change: A XOR (A, B) = A");
			assert.deepEqual(oGroupController.getChangeData(oA, {
				group: {
					groupItems: []
				}
			}), oA, "change: A XOR [] = A");
			assert.deepEqual(oGroupController.getChangeData(oAx, oA), oAx, "change: A' XOR A = A'");
			assert.deepEqual(oGroupController.getChangeData(oAB, oAB), null, "no change: (A, B) XOR (A, B) = null");
			assert.deepEqual(oGroupController.getChangeData(oAB, oBA), oAB, "change: (A, B) XOR (B, A) = (A, B)");
		} finally {
			// cleanup
			oGroupController.destroy();
		}
	});

	QUnit.start();

});