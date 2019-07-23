/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"jquery.sap.global",
	"sap/ui/mdc/experimental/P13nInternalModel",
	"sap/ui/mdc/experimental/P13nColumnItem"
], function (jQuery, P13nInternalModel, P13nColumnItem) {
	"use strict";

	QUnit.start();

	QUnit.module("sap.ui.mdc.experimental.P13nInternalModel: simple", {
		beforeEach: function() {},
		afterEach: function() {}
	});

	QUnit.test("Instantiate", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem()]
		});
		assert.ok(oInternalModel);
		assert.ok(oInternalModel.getData().items.length);
	});

	QUnit.test("Destroy", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem()]
		});
		oInternalModel.destroy();
		assert.ok(jQuery.isEmptyObject(oInternalModel.getData()));
	});

	QUnit.module("sap.ui.mdc.experimental.P13nInternalModel: _getSelectedModelItemsBetween", {
		beforeEach: function() {},
		afterEach: function() {}
	});

	QUnit.test("up and down", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 2,
				selected: false
			})]
		});
		// up
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/2"), oInternalModel.getProperty("/items/2")), []);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/2"), oInternalModel.getProperty("/items/1")), [oInternalModel.getProperty("/items/1")]);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/2"), oInternalModel.getProperty("/items/0")), [oInternalModel.getProperty("/items/1"), oInternalModel.getProperty("/items/0")]);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/1"), oInternalModel.getProperty("/items/1")), []);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/1"), oInternalModel.getProperty("/items/0")), [oInternalModel.getProperty("/items/0")]);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/0"), oInternalModel.getProperty("/items/0")), []);

		// down
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/0"), oInternalModel.getProperty("/items/0")), []);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/0"), oInternalModel.getProperty("/items/1")), [oInternalModel.getProperty("/items/1")]);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/0"), oInternalModel.getProperty("/items/2")), [oInternalModel.getProperty("/items/1")]);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/1"), oInternalModel.getProperty("/items/1")), []);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/1"), oInternalModel.getProperty("/items/2")), []);
		assert.deepEqual(oInternalModel._getSelectedModelItemsBetween(oInternalModel.getProperty("/items/2"), oInternalModel.getProperty("/items/2")), []);
	});

	QUnit.module("sap.ui.mdc.experimental.P13nInternalModel: moveModelItemPosition", {
		beforeEach: function() {
			this.oInternalModel = new P13nInternalModel({
				tableItems: [new P13nColumnItem({
					columnKey: "A",
					text: "A",
					selected: true,
					position: 0
				}), new P13nColumnItem({
					columnKey: "B",
					text: "B",
					selected: true,
					position: 1
				}), new P13nColumnItem({
					columnKey: "C",
					text: "C",
					selected: true,
					position: 2
				})]
			});
		},
		afterEach: function() {
			this.oInternalModel.destroy();
		}
	});

	QUnit.test("moveModelItemPosition: A, B, C -> B, A, C", function(assert) {
		this.oInternalModel.moveModelItemPosition(this.oInternalModel.getProperty("/items/0"), this.oInternalModel.getProperty("/items/1"));
		assert.equal(this.oInternalModel.getProperty("/items/0/columnKey"), "A");
		assert.equal(this.oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(this.oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(this.oInternalModel.getProperty("/items/0/position"), 1);
		assert.equal(this.oInternalModel.getProperty("/items/1/position"), 0);
		assert.equal(this.oInternalModel.getProperty("/items/2/position"), 2);
	});

	QUnit.test("moveModelItemPosition: A, B, C -> B, C, A", function(assert) {
		this.oInternalModel.moveModelItemPosition(this.oInternalModel.getProperty("/items/0"), this.oInternalModel.getProperty("/items/2"));
		assert.equal(this.oInternalModel.getProperty("/items/0/columnKey"), "A");
		assert.equal(this.oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(this.oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(this.oInternalModel.getProperty("/items/0/position"), 2);
		assert.equal(this.oInternalModel.getProperty("/items/1/position"), 0);
		assert.equal(this.oInternalModel.getProperty("/items/2/position"), 1);
	});

	QUnit.test("moveModelItemPosition: A, B, C -> A, C, B", function(assert) {
		this.oInternalModel.moveModelItemPosition(this.oInternalModel.getProperty("/items/1"), this.oInternalModel.getProperty("/items/2"));
		assert.equal(this.oInternalModel.getProperty("/items/0/columnKey"), "A");
		assert.equal(this.oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(this.oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(this.oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(this.oInternalModel.getProperty("/items/1/position"), 2);
		assert.equal(this.oInternalModel.getProperty("/items/2/position"), 1);
	});

	QUnit.test("moveModelItemPosition: A, B, C -> A, C, B", function(assert) {
		this.oInternalModel.moveModelItemPosition(this.oInternalModel.getProperty("/items/2"), this.oInternalModel.getProperty("/items/1"));
		assert.equal(this.oInternalModel.getProperty("/items/0/columnKey"), "A");
		assert.equal(this.oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(this.oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(this.oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(this.oInternalModel.getProperty("/items/1/position"), 2);
		assert.equal(this.oInternalModel.getProperty("/items/2/position"), 1);
	});

	QUnit.test("moveModelItemPosition: A, B, C -> C, A, B", function(assert) {
		this.oInternalModel.moveModelItemPosition(this.oInternalModel.getProperty("/items/2"), this.oInternalModel.getProperty("/items/0"));
		assert.equal(this.oInternalModel.getProperty("/items/0/columnKey"), "A");
		assert.equal(this.oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(this.oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(this.oInternalModel.getProperty("/items/0/position"), 1);
		assert.equal(this.oInternalModel.getProperty("/items/1/position"), 2);
		assert.equal(this.oInternalModel.getProperty("/items/2/position"), 0);
	});

	QUnit.test("moveModelItemPosition: A, B, C -> B, A, C", function(assert) {
		this.oInternalModel.moveModelItemPosition(this.oInternalModel.getProperty("/items/1"), this.oInternalModel.getProperty("/items/0"));
		assert.equal(this.oInternalModel.getProperty("/items/0/columnKey"), "A");
		assert.equal(this.oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(this.oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(this.oInternalModel.getProperty("/items/0/position"), 1);
		assert.equal(this.oInternalModel.getProperty("/items/1/position"), 0);
		assert.equal(this.oInternalModel.getProperty("/items/2/position"), 2);
	});

	QUnit.module("sap.ui.mdc.experimental.P13nInternalModel: move down", {
		beforeEach: function() {},
		afterEach: function() {}
	});

	QUnit.test("selected B after selected A", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "A",
				text: "A",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 2,
				selected: false
			})]
		});

		// act: B, A, C -> A, B, C
		oInternalModel.moveModelItemPosition(oInternalModel.getData().items[0], oInternalModel.getData().items[1]);
		oInternalModel.moveModelItem(oInternalModel.getData().items[0], oInternalModel.getData().items[1]);

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "A");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.test("selected B after unselected C", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "A",
				text: "A",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 2,
				selected: false
			})]
		});

		// act: B, A, C -> A, C, B
		oInternalModel.moveModelItemPosition(oInternalModel.getData().items[0], oInternalModel.getData().items[2]);
		oInternalModel.moveModelItem(oInternalModel.getData().items[0], oInternalModel.getData().items[2]);

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "A");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 2);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 1);

		oInternalModel.destroy();
	});

	QUnit.test("unselected A after unselected C", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "A",
				text: "A",
				position: 0,
				selected: false
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 2,
				selected: false
			})]
		});

		// act: B, A, C -> B, C, A
		oInternalModel.moveModelItemPosition(oInternalModel.getData().items[1], oInternalModel.getData().items[2]);
		oInternalModel.moveModelItem(oInternalModel.getData().items[1], oInternalModel.getData().items[2]);

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "A");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 2);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 0);

		oInternalModel.destroy();
	});

	QUnit.module("sap.ui.mdc.experimental.P13nInternalModel: move up", {
		beforeEach: function() {},
		afterEach: function() {}
	});

	QUnit.test("selected A after selected B", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "A",
				text: "A",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 2,
				selected: false
			})]
		});

		// act: B, A, C -> A, B, C
		oInternalModel.moveModelItemPosition(oInternalModel.getData().items[1], oInternalModel.getData().items[0]);
		oInternalModel.moveModelItem(oInternalModel.getData().items[1], oInternalModel.getData().items[0]);

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "A");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.test("unselected C after selected B", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "A",
				text: "A",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 2,
				selected: false
			})]
		});

		// act: B, A, C -> C, B, A
		oInternalModel.moveModelItemPosition(oInternalModel.getData().items[2], oInternalModel.getData().items[0]);
		oInternalModel.moveModelItem(oInternalModel.getData().items[2], oInternalModel.getData().items[0]);

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "A");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.module("sap.ui.mdc.experimental.P13nInternalModel: selectModelItem - Model: ^D, ^B, C -> ^D, ^B, ^C", {
		beforeEach: function() {},
		afterEach: function() {}
	});

	QUnit.test("Aggregation: ^D, C, ^B", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 1,
				selected: false
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			})]
		});

		// act: ^D, ^B, C -> ^D, ^B, ^C
		oInternalModel.selectModelItem(oInternalModel.getData().items[2]); //C

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "D");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.test("Aggregation: C, ^D, ^B", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 0,
				selected: false
			}), new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			})]
		});

		// act: ^D, ^B, C -> ^D, ^B, ^C
		oInternalModel.selectModelItem(oInternalModel.getData().items[2]); //C

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "D");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.test("Aggregation: ^D, ^B, C", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 2,
				selected: false
			})]
		});

		// act: ^D, ^B, C -> ^D, ^B, ^C
		oInternalModel.selectModelItem(oInternalModel.getData().items[2]); //C

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "D");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.module("sap.ui.mdc.experimental.P13nInternalModel: selectModelItem - ^D, C, ^B -> ^D, ^C, ^B", {
		beforeEach: function() {},
		afterEach: function() {}
	});

	QUnit.test("Aggregation: ^D, C, ^B", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 1,
				selected: false
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			})]
		});

		// arrange model
		oInternalModel.setData({
			items: [{
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}, {
				columnKey: "C",
				text: "C",
				position: 1,
				selected: false
			}, {
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			}]
		});

		// act: ^D, C, ^B -> ^D, ^C, ^B
		oInternalModel.selectModelItem(oInternalModel.getData().items[1]); //C

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "D");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.test("Aggregation: C, ^D, ^B", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 0,
				selected: false
			}), new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			})]
		});

		// arrange
		oInternalModel.setData({
			items: [{
				columnKey: "D",
				text: "D",
				position: 1,
				selected: true
			}, {
				columnKey: "C",
				text: "C",
				position: 0,
				selected: false
			}, {
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			}]
		});

		// act: ^D, C, ^B -> ^D, ^C, ^B
		oInternalModel.selectModelItem(oInternalModel.getData().items[1]); //C

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "D");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.test("Aggregation: ^D, ^B, C", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 2,
				selected: false
			})]
		});

		// act: ^D, ^B, C -> ^D, ^B, ^C
		oInternalModel.selectModelItem(oInternalModel.getData().items[2]); //C

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "D");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.module("sap.ui.mdc.experimental.P13nInternalModel: selectModelItem - C, ^D, ^B -> ^C, ^D, ^B", {
		beforeEach: function() {},
		afterEach: function() {}
	});

	QUnit.test("Aggregation: ^D, C, ^B", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 1,
				selected: false
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			})]
		});

		// arrange model
		oInternalModel.setData({
			items: [{
				columnKey: "C",
				text: "C",
				position: 1,
				selected: false
			}, {
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}, {
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			}]
		});

		// act: C, ^D, ^B -> ^C, ^D, ^B
		oInternalModel.selectModelItem(oInternalModel.getData().items[0]); //C

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "D");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.test("Aggregation: C, ^D, ^B", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 0,
				selected: false
			}), new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			})]
		});

		// arrange model
		oInternalModel.setData({
			items: [{
				columnKey: "C",
				text: "C",
				position: 1,
				selected: false
			}, {
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}, {
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			}]
		});

		// act: C, ^D, ^B -> ^C, ^D, ^B
		oInternalModel.selectModelItem(oInternalModel.getData().items[0]); //C

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "D");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

	QUnit.test("Aggregation: ^D, ^B, C", function(assert) {
		var oInternalModel = new P13nInternalModel({
			tableItems: [new P13nColumnItem({
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}), new P13nColumnItem({
				columnKey: "B",
				text: "B",
				position: 1,
				selected: true
			}), new P13nColumnItem({
				columnKey: "C",
				text: "C",
				position: 2,
				selected: false
			})]
		});

		// arrange model
		oInternalModel.setData({
			items: [{
				columnKey: "C",
				text: "C",
				position: 1,
				selected: false
			}, {
				columnKey: "D",
				text: "D",
				position: 0,
				selected: true
			}, {
				columnKey: "B",
				text: "B",
				position: 2,
				selected: true
			}]
		});

		// act: C, ^D, ^B -> ^C, ^D, ^B
		oInternalModel.selectModelItem(oInternalModel.getData().items[0]); //C

		assert.equal(oInternalModel.getProperty("/items/0/columnKey"), "C");
		assert.equal(oInternalModel.getProperty("/items/1/columnKey"), "D");
		assert.equal(oInternalModel.getProperty("/items/2/columnKey"), "B");
		assert.equal(oInternalModel.getProperty("/items/0/position"), 0);
		assert.equal(oInternalModel.getProperty("/items/1/position"), 1);
		assert.equal(oInternalModel.getProperty("/items/2/position"), 2);

		oInternalModel.destroy();
	});

});