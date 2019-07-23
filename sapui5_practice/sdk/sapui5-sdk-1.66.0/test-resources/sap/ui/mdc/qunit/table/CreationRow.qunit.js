/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/library", "sap/ui/mdc/Table", "sap/ui/mdc/Column", "sap/ui/mdc/CreationRow", "sap/ui/table/Table", "sap/m/Table", "sap/ui/model/json/JSONModel"
], function(Library, Table, Column, CreationRow, GridTable, ResponsiveTable, JSONModel) {
	"use strict";

	var TableType = Library.TableType;

	QUnit.module("Inner creation row", {
		beforeEach: function() {
			this.oCreationRow = new CreationRow();
			this.oTableTable = new Table();
			this.oTableTable._oTable = new GridTable();
			this.oTableResponsive = new Table({
				type: TableType.ResponsiveTable
			});
			this.oTableResponsive._oTable = new ResponsiveTable();
		},
		afterEach: function() {
			this.oCreationRow.destroy();
			this.oTableTable._oTable.destroy();
			this.oTableTable.destroy();
			this.oTableResponsive._oTable.destroy();
			this.oTableResponsive.destroy();
		}
	});

	QUnit.test("Instantiate", function(assert) {
		assert.ok(!this.oCreationRow._oInnerCreationRow, "No inner creation row instance exists");
	});

	QUnit.test("#update - Without parent", function(assert) {
		var done = assert.async();
		var that = this;

		this.oCreationRow.update().then(function() {
			assert.ok(!that.oCreationRow._oInnerCreationRow, "No inner creation row instance exists");
		}).then(done);
	});

	QUnit.test("#update - TableType = GridTable", function(assert) {
		var done = assert.async();
		var that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oTableTable);

		this.oCreationRow.update().then(function() {
			var oInner = that.oCreationRow._oInnerCreationRow;

			assert.ok(oInner.isA("sap.ui.table.CreationRow"), "Inner creation row is a sap.ui.table.CreationRow");
			assert.strictEqual(oInner.getVisible(), that.oCreationRow.getVisible(), "'visible' property was forwarded");
			assert.strictEqual(oInner.getApplyEnabled(), that.oCreationRow.getApplyEnabled(), "'applyEnabled' property was forwarded");
			assert.ok(that.oTableTable._oTable.getCreationRow() === oInner, "Inner creation row was inserted into inner table");
		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("#update - TableType = GridTable delayed table creation", function(assert) {
		var done = assert.async();
		var that = this;
		var oGridTable = this.oTableTable._oTable;
		// simulate no inner table exists
		delete this.oTableTable._oTable;
		sinon.stub(this.oCreationRow, "_getTable").returns(this.oTableTable);

		this.oCreationRow.update().then(function() {
			assert.ok(!that.oCreationRow._oInnerCreationRow, "No inner creation row instance exists");
			// simulate inner table now exists and an update is called
			that.oTableTable._oTable = oGridTable;
			return that.oCreationRow.update();
		}).then(function() {
			var oInner = that.oCreationRow._oInnerCreationRow;

			assert.ok(oInner.isA("sap.ui.table.CreationRow"), "Inner creation row is a sap.ui.table.CreationRow");
			assert.strictEqual(oInner.getVisible(), that.oCreationRow.getVisible(), "'visible' property was forwarded");
			assert.strictEqual(oInner.getApplyEnabled(), that.oCreationRow.getApplyEnabled(), "'applyEnabled' property was forwarded");
			assert.ok(that.oTableTable._oTable.getCreationRow() === oInner, "Inner creation row was inserted into inner table");
		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("#update - TableType = ResponsiveTable", function(assert) {
		var done = assert.async();
		var that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oTableResponsive);

		this.oCreationRow.update().then(function() {
			assert.ok(!that.oCreationRow._oInnerCreationRow, "No inner creation row instance exists");
		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("#update - Changing TableType", function(assert) {
		var done = assert.async();
		var that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oTableTable);

		this.oCreationRow.update().then(function() {
			assert.ok(that.oCreationRow._oInnerCreationRow.isA("sap.ui.table.CreationRow"), "Table: Inner creation row is a sap.ui.table.CreationRow");

		}).then(function() {
			that.oCreationRow._getTable.returns(that.oTableResponsive);
			return that.oCreationRow.update();
		}).then(function() {
			assert.ok(!that.oCreationRow._oInnerCreationRow, "Change from Table to ResponsiveTable: No inner creation row instance exists");

		}).then(function() {
			that.oCreationRow._getTable.returns(that.oTableTable);
			return that.oCreationRow.update();
		}).then(function() {
			assert.ok(that.oCreationRow._oInnerCreationRow.isA("sap.ui.table.CreationRow"), "Change from ResponsiveTable to Table: Inner creation row is a sap.ui.table.CreationRow");

		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("Property/Aggregation/Event handling", function(assert) {
		var done = assert.async();
		var that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oTableTable);

		this.oCreationRow.update().then(function() {
			var oInner = that.oCreationRow._oInnerCreationRow;
			var oApplySpy = sinon.spy();
			var bDefaultPrevented;

			// Properties
			that.oCreationRow.setVisible(false);
			that.oCreationRow.setApplyEnabled(false);

			assert.strictEqual(oInner.getVisible(), false, "'visible' property was forwarded");
			assert.strictEqual(oInner.getApplyEnabled(), false, "'applyEnabled' property was forwarded");

			// Apply event execute default
			that.oCreationRow.attachApply(oApplySpy);
			oInner.attachEventOnce("apply", function(oEvent) {
				bDefaultPrevented = oEvent.bPreventDefault;
			});
			oInner.fireApply();

			assert.ok(oApplySpy.calledOnce, "The apply event handler was called once");
			assert.strictEqual(bDefaultPrevented, false, "The default action of the inner apply event was not prevented");

			// Apply event prevent default
			that.oCreationRow.attachApply(function(oEvent) {
				oEvent.preventDefault();
			});
			oInner.attachEventOnce("apply", function(oEvent) {
				bDefaultPrevented = oEvent.bPreventDefault;
			});
			oInner.fireApply();

			assert.ok(oApplySpy.calledTwice, "The apply event handler was called twice");
			assert.strictEqual(bDefaultPrevented, true, "The default action of the inner apply event was not prevented");

		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("Binding contexts", function(assert) {
		var oModel = new JSONModel();
		var done = assert.async();
		var that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oTableTable);

		this.oCreationRow.setBindingContext(null);
		this.oCreationRow.setBindingContext(oModel.createBindingContext("/path"), "modelName");

		this.oCreationRow.update().then(function() {
			assert.strictEqual(that.oCreationRow._oInnerCreationRow.getBindingContext(), null, "Binding context of unnamed model was forwarded to the inner creation row on initialization");
			assert.strictEqual(that.oCreationRow.getBindingContext("modelName"), that.oCreationRow._oInnerCreationRow.getBindingContext("modelName"), "Binding context of named model was forwarded to the inner creation row on initialization");

			var oContext = oModel.createBindingContext("/path");
			that.oCreationRow.setBindingContext(undefined);
			that.oCreationRow.setBindingContext(oContext, "modelName");

			assert.strictEqual(that.oCreationRow.getBindingContext(), undefined, "Binding context of unnamed model was forwarded to the inner creation row on setBindingContext");
			assert.strictEqual(that.oCreationRow.getBindingContext("modelName"), oContext, "Binding context of named model was forwarded to the inner creation row on setBindingContext");
		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});
});
