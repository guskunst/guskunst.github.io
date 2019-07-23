/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/Table", "sap/ui/mdc/Column", "sap/ui/mdc/GridTableType", "sap/ui/mdc/ResponsiveTableType", "sap/m/Text", "sap/ui/model/odata/v4/ODataListBinding", "sap/ui/model/Sorter", "sap/ui/model/json/JSONModel"
], function(Table, Column, GridTableType, ResponsiveTableType, Text, ODataListBinding, Sorter, JSONModel) {
	"use strict";

	function triggerDragEvent(sDragEventType, oControl) {
		var oJQueryDragEvent = jQuery.Event(sDragEventType);
		var oNativeDragEvent;

		if (typeof Event === "function") {
			oNativeDragEvent = new Event(sDragEventType, {
				bubbles: true,
				cancelable: true
			});
		} else { // IE, PhantomJS
			oNativeDragEvent = document.createEvent("Event");
			oNativeDragEvent.initEvent(sDragEventType, true, true);
		}

		// Fake the DataTransfer object. This is the only cross-browser solution.
		oNativeDragEvent.dataTransfer = {
			dropEffect: "none",
			effectAllowed: "none",
			files: [],
			items: [],
			types: [],
			setDragImage: function() {
			},
			setData: function() {
			},
			getData: function() {
			}
		};

		oJQueryDragEvent.originalEvent = oNativeDragEvent;

		var oDomRef = oControl.getDomRef ? oControl.getDomRef() : oControl;
		if (oDomRef) {
			jQuery(oDomRef).trigger(oJQueryDragEvent);
		}
	}

	QUnit.module("sap.ui.mdc.Table", {
		beforeEach: function(assert) {
			this.oTable = new Table();
			this.oTable.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Instantiate", function(assert) {
		assert.ok(this.oTable);
	});

	QUnit.test("Create UI5 Grid Table (default) after initialise", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(!this.oTable._oTemplate);
			done();
		}.bind(this));
	});

	QUnit.test("inner table is a GridTable, with No template", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(!this.oTable._oTemplate);

			assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
			done();
		}.bind(this));

	});

	QUnit.test("inner table is a GridTable with Navigation RowAction", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.setRowAction([
			"Navigation"
		]);

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(!this.oTable._oTemplate);

			assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
			assert.ok(this.oTable._oTable.getRowActionTemplate().isA("sap.ui.table.RowAction"));
			assert.equal(this.oTable._oTable.getRowActionTemplate().getItems()[0].getType(), "Navigation");
			assert.equal(this.oTable._oTable.getRowActionCount(), 1);

			this.oTable.setRowAction();
			assert.equal(this.oTable._oTable.getRowActionCount(), 0);
			assert.ok(!this.oTable._oTable.getRowActionTemplate());
			done();
		}.bind(this));

	});

	QUnit.test("Columns added to inner table", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			}),
			creationTemplate: new Text({
				text: "Test"
			})
		}));
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 0);

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test2", "column0: label is correct");
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test", "column1: label is correct");
			assert.equal(aInnerColumns[0].getTemplate().getText(), "Test2", "column0: template is correct");
			assert.equal(aInnerColumns[0].getTemplate().getWrapping(), false, "column0: template wrapping is disabled");
			assert.equal(aInnerColumns[0].getTemplate().getRenderWhitespace(), false, "column0: template renderWhitespace is disabled");
			assert.equal(aInnerColumns[1].getTemplate().getText(), "Test", "column1: template is correct");
			assert.equal(aInnerColumns[0].getCreationTemplate(), null, "column0: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getText(), "Test", "column1: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getWrapping(), false, "column1: creationTemplate wrapping is disabled");
			assert.equal(aInnerColumns[1].getCreationTemplate().getRenderWhitespace(), false, "column1: creationTemplate renderWhitespace is disabled");
			assert.equal(aInnerColumns[0].getShowFilterMenuEntry(), false, "column0: filtering is deactivated");
			assert.equal(aInnerColumns[0].getShowSortMenuEntry(), false, "column0: sorting is deactivated");
			assert.equal(aInnerColumns[1].getShowFilterMenuEntry(), false, "column1: filtering is deactivated");
			assert.equal(aInnerColumns[1].getShowSortMenuEntry(), false, "column1: sorting is deactivated");
			done();
		}.bind(this));
	});

	QUnit.test("Columns added to inner table - one by one E.g. pers", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.done().then(function() {

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "Test2"
				})
			}), 0);

			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal("Test2", aInnerColumns[0].getLabel().getText());
			done();
		}.bind(this));

	});

	QUnit.test("rows binding - binds the inner table - after model is set", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.done().then(function() {
			var sPath = "/foo";
			this.oTable.bindRows({
				path: sPath
			});

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test");
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test2");
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("rows"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("rows");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("rows binding - binds the inner table - before model is set", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		var sPath = "/foo";
		this.oTable.bindRows({
			path: sPath
		});

		this.oTable.done().then(function() {

			assert.ok(this.oTable._oTable);

			assert.ok(this.oTable._oTable.isBound("rows"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("rows");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("bindAggregation for rows uses bindRows", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.done().then(function() {
			var sPath = "/foo";

			this.oTable.bindAggregation("rows", {
				path: sPath
			});

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test");
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test2");
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("rows"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("rows");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("Destroy", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);
		sinon.spy(this.oTable, "exit");

		this.oTable.done().then(function() {

			assert.ok(this.oTable._oTable);
			assert.ok(!this.oTable._oTemplate);

			this.oTable.destroy();

			assert.ok(!this.oTable._oTemplate);
			assert.ok(this.oTable.exit.calledOnce);
			done();
		}.bind(this));
	});

	QUnit.test("Create UI5 Responsive Table after initialise (model is set on the parent/control)", function(assert) {
		var done = assert.async();

		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oTemplate);
			done();
		}.bind(this));

	});

	QUnit.test("inner table is a ResponsiveTable with ColumnListItem as it's template", function(assert) {
		var done = assert.async();

		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oTemplate);

			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(this.oTable._oTemplate.isA("sap.m.ColumnListItem"));
			done();
		}.bind(this));
	});

	QUnit.test("inner table is a ResponsiveTable with ColumnListItem of type Navigation", function(assert) {
		var done = assert.async();

		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable",
			rowAction: [
				"Navigation"
			]
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oTemplate);

			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(this.oTable._oTemplate.isA("sap.m.ColumnListItem"));
			assert.equal(this.oTable._oTemplate.getType(), "Navigation");

			this.oTable.setRowAction();
			assert.ok(this.oTable._oTemplate.getType() !== "Navigation");
			done();
		}.bind(this));
	});

	QUnit.test("Columns added to inner ResponsiveTable", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.done().then(function() {
			// pop-ins are updated in a timeout --> hence we use another setTimeout to ensure that this API is called after everything is through.
			setTimeout(function() {
				assert.ok(this.oTable._oTable);
				var aMDCColumns = this.oTable.getColumns();
				var aInnerColumns = this.oTable._oTable.getColumns();
				assert.equal(aMDCColumns.length, aInnerColumns.length);
				assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
				assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
				assert.equal(aInnerColumns[0].getHeader().getWrappingType(), "Hyphenated");
				assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
				assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
				// Check updatepopin handling
				assert.equal(aInnerColumns[0].getDemandPopin(), false);
				assert.equal(aInnerColumns[1].getDemandPopin(), false);
				assert.equal(aInnerColumns[2].getDemandPopin(), true);
				assert.equal(aInnerColumns[2].getMinScreenWidth(), "30rem");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Columns added to inner ResponsiveTable - one by one E.g. pers", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.done().then(function() {

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "Test2"
				})
			}), 0);

			this.oTable.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal("Test2", aInnerColumns[0].getHeader().getText());
			assert.equal(aMDCColumns[2].getHeader(), aInnerColumns[2].getHeader().getText());
			assert.equal("Test3", aInnerColumns[2].getHeader().getText());
			done();
		}.bind(this));
	});

	QUnit.test("rows binding - binds the inner ResponsiveTable - after model is set", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});

		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.done().then(function() {
			var sPath = "/foo";
			this.oTable.bindRows({
				path: sPath
			});

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("items"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("items");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("rows binding - binds the inner ResponsiveTable - before model is set", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		var sPath = "/foo";
		this.oTable.bindRows({
			path: sPath
		});

		this.oTable.done().then(function() {

			assert.ok(this.oTable._oTable);

			assert.ok(this.oTable._oTable.isBound("items"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("items");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("bindAggregation for rows uses bindRows (ResponsiveTable)", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.done().then(function() {
			var sPath = "/foo";

			this.oTable.bindAggregation("rows", {
				path: sPath
			});

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("items"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("items");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("Destroy - MTable - remove template", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.done().then(function() {

			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oTemplate);

			this.oTable.destroy();

			assert.ok(!this.oTable._oTemplate);
			done();
		}.bind(this));
	});

	// Switch table type and test APIs
	QUnit.test("Switch table type and test APIs", function(assert) {
		var done = assert.async(), fP13nModeSpy, fInnerTableDestroySpy, fInnerTemplateDestroySpy;
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(!this.oTable._oTemplate);

			fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");

			fP13nModeSpy = sinon.spy(this.oTable, "_updatep13nSettings");
			assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
			assert.equal(this.oTable.getP13nMode(), undefined);
			assert.ok(fP13nModeSpy.notCalled);
			assert.equal(this.oTable._oToolbar.getEnd().length, 0);

			// Switch table
			assert.ok(fInnerTableDestroySpy.notCalled);
			this.oTable.setSelectionMode("Single");
			this.oTable.setThreshold(10);
			this.oTable.setP13nMode([
				"Column"
			]);
			this.oTable.setType("ResponsiveTable");

			assert.ok(fInnerTableDestroySpy.calledOnce);

			this.oTable.done().then(function() {
				assert.ok(this.oTable._oTable);
				assert.ok(this.oTable._oTemplate);

				assert.deepEqual(this.oTable.getP13nMode(), [
					"Column"
				]);
				assert.ok(fP13nModeSpy.calledOnce);
				assert.equal(this.oTable._oToolbar.getEnd().length, 1, "Column has Add/Remove and Reorder");
				assert.ok(this.oTable._oTemplate.isA("sap.m.ColumnListItem"));
				assert.equal(this.oTable._oTable.getGrowingThreshold(), this.oTable.getThreshold());
				fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");
				fInnerTemplateDestroySpy = sinon.spy(this.oTable._oTemplate, "destroy");
				fP13nModeSpy.reset();

				// Setting same table type does nothing
				this.oTable.setType("ResponsiveTable");
				this.oTable.setSelectionMode("Multi");
				this.oTable.setP13nMode([
					"Column", "Sort"
				]);

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);

				assert.deepEqual(this.oTable.getP13nMode(), [
					"Column", "Sort"
				]);
				assert.ok(fP13nModeSpy.calledOnce);
				assert.equal(this.oTable._oToolbar.getEnd().length, 2, "Column has Add/Remove and Reorder + Sort");

				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), false);

				// Setting same table type does nothing
				this.oTable.setType(new ResponsiveTableType({
					growingMode: "Scroll"
				}));

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);
				// growingScrollToLoad of the inner table will be set
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), true);

				// Updating the table type will update the properties on the table
				this.oTable.getType().setGrowingMode("Basic");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);
				// growingScrollToLoad of the inner table will be reset
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), false);

				this.oTable.setType("Table");
				this.oTable.setP13nMode([
					"Sort"
				]);
				// changing type leads to a destroy call
				assert.ok(fInnerTableDestroySpy.calledOnce);
				assert.ok(fInnerTemplateDestroySpy.calledOnce);
				this.oTable.done().then(function() {
					assert.ok(this.oTable._oTable);
					assert.ok(!this.oTable._oTemplate);

					assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));

					assert.deepEqual(this.oTable.getP13nMode(), [
						"Sort"
					]);
					assert.ok(fP13nModeSpy.calledTwice);
					assert.equal(this.oTable._oToolbar.getEnd().length, 1, "Only Sort");

					assert.equal(this.oTable._oTable.getThreshold(), this.oTable.getThreshold());

					this.oTable.setP13nMode();
					assert.deepEqual(this.oTable.getP13nMode(), undefined);
					assert.ok(fP13nModeSpy.calledThrice);
					assert.equal(this.oTable._oToolbar.getEnd().length, 0, "Nothing is shown if p13nMode is not set");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));

	});

	// Switch table type immediately
	QUnit.test("Switch table type immediately after create", function(assert) {
		var done = assert.async(), fInnerTableDestroySpy, fInnerTemplateDestroySpy;
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		// Switch table immediately
		this.oTable.setType("ResponsiveTable");

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oTemplate);

			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(this.oTable._oTemplate.isA("sap.m.ColumnListItem"));
			fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");
			fInnerTemplateDestroySpy = sinon.spy(this.oTable._oTemplate, "destroy");

			// Setting same table type does nothing
			this.oTable.setType("ResponsiveTable");
			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(fInnerTableDestroySpy.notCalled);
			assert.ok(fInnerTemplateDestroySpy.notCalled);

			this.oTable.setType("Table");
			assert.ok(fInnerTableDestroySpy.calledOnce);
			assert.ok(fInnerTemplateDestroySpy.calledOnce);

			this.oTable.done().then(function() {
				assert.ok(this.oTable._oTable);
				assert.ok(!this.oTable._oTemplate);

				fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");

				assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));

				assert.equal(this.oTable._oTable.getMinAutoRowCount(), 10);
				assert.equal(this.oTable._oTable.getVisibleRowCountMode(), "Auto");

				// Setting same table type only updates properties
				this.oTable.setType(new GridTableType({
					rowCountMode: "Fixed"
				}));

				assert.ok(fInnerTableDestroySpy.notCalled);
				// inner table is updated
				assert.equal(this.oTable._oTable.getVisibleRowCount(), 10);
				assert.equal(this.oTable._oTable.getVisibleRowCountMode(), "Fixed");

				// Updating the table type instance also updates properties
				this.oTable.getType().setRowCount(3);

				assert.ok(fInnerTableDestroySpy.notCalled);
				// inner table is updated
				assert.equal(this.oTable._oTable.getVisibleRowCount(), 3);
				assert.equal(this.oTable._oTable.getVisibleRowCountMode(), "Fixed");

				// Updating the table type instance also updates properties of the inner table
				this.oTable.getType().setRowCountMode("Auto");

				assert.ok(fInnerTableDestroySpy.notCalled);
				// inner table is updated
				assert.equal(this.oTable._oTable.getMinAutoRowCount(), 3); // via rowCount
				assert.equal(this.oTable._oTable.getVisibleRowCountMode(), "Auto");

				// Updating the table type instance also updates properties of the inner table
				this.oTable.getType().setRowCount(5);

				// inner table is updated
				assert.equal(this.oTable._oTable.getMinAutoRowCount(), 5); // via rowCount
				assert.equal(this.oTable._oTable.getVisibleRowCountMode(), "Auto");

				// Updating the table type instance also updates properties of the inner table
				this.oTable.getType().setRowCountMode("Fixed");

				assert.ok(fInnerTableDestroySpy.notCalled);
				// inner table is updated
				assert.equal(this.oTable._oTable.getVisibleRowCount(), 5); // via rowCount
				assert.equal(this.oTable._oTable.getVisibleRowCountMode(), "Fixed");

				// Setting same table type only updates properties
				this.oTable.setType("Table");

				assert.ok(fInnerTableDestroySpy.notCalled);
				// inner table is updated to defaults
				assert.equal(this.oTable._oTable.getMinAutoRowCount(), 10);
				assert.equal(this.oTable._oTable.getVisibleRowCountMode(), "Auto");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("bindAggregation with rowCount without wrapping dataReceived", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			header: "Test",
			showRowCount: true,
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.done().then(function() {
			var sPath = "/foo";

			this.oTable.bindAggregation("rows", {
				path: sPath
			});

			var oBindingInfo = this.oTable._oTable.getBindingInfo("items");

			assert.equal(oBindingInfo.path, sPath);

			var fDataReceived = oBindingInfo.events["dataReceived"];

			sinon.stub(this.oTable._oTable, "getBinding");

			var iCurrentLength = 10;
			var bIsLengthFinal = true;
			var oRowBinding = {
				getLength: function() {
					return iCurrentLength;
				},
				isLengthFinal: function() {
					return bIsLengthFinal;
				}
			};
			this.oTable._oTable.getBinding.returns(oRowBinding);

			assert.equal(this.oTable._oTitle.getText(), "Test");

			fDataReceived();
			assert.equal(this.oTable._oTitle.getText(), "Test (10)");

			bIsLengthFinal = false;
			fDataReceived();
			assert.equal(this.oTable._oTitle.getText(), "Test");

			done();
		}.bind(this));
	});

	QUnit.test("bindAggregation with rowCount with wrapping dataReceived", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			header: "Test",
			showRowCount: true,
			type: "Table"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.done().then(function() {
			var sPath = "/foo";
			var fCustomDataReceived = sinon.spy();
			var oRowBinding = sinon.createStubInstance(ODataListBinding);
			oRowBinding.getLength.returns(10);
			oRowBinding.isLengthFinal.returns(true);

			sinon.stub(this.oTable._oTable, "getBinding");
			this.oTable._oTable.getBinding.returns(oRowBinding);

			sinon.stub(this.oTable._oTable, "_updateRows");// TODO: remove ui.table seems to fail due to this
			sinon.stub(this.oTable._oTable, "unbindRows");// TODO: remove ui.table seems to fail due to this

			this.oTable.bindAggregation("rows", {
				path: sPath,
				events: {
					dataReceived: fCustomDataReceived
				}
			});

			var oBindingInfo = this.oTable._oTable.getBindingInfo("rows");

			assert.equal(oBindingInfo.path, sPath);

			var fDataReceived = oBindingInfo.events["dataReceived"];

			assert.equal(this.oTable._oTitle.getText(), "Test");
			assert.ok(fCustomDataReceived.notCalled);

			fDataReceived();
			assert.equal(this.oTable._oTitle.getText(), "Test (10)");
			assert.ok(fCustomDataReceived.calledOnce);

			oRowBinding.isLengthFinal.returns(false);
			fDataReceived();
			assert.equal(this.oTable._oTitle.getText(), "Test");
			assert.ok(fCustomDataReceived.calledTwice);

			done();
		}.bind(this));
	});

	// General tests --> relevant for both table types
	QUnit.test("check for intial column index", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable",
			columns: [
				new Column({
					id: "foo1",
					initialIndex: 1,
					header: "Test1",
					template: new Text({
						text: "template1"
					})
				}), new Column({
					id: "foo0",
					initialIndex: 0,
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				})

			]
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.done().then(function() {
			this.oTable.bindRows({
				path: "/"
			});

			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			var oInnerColumnListItem = this.oTable._oTemplate;
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test0");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test1");
			// Check cells
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template0");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template1");

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "template2"
				})
			}), 1);
			// Intial index no longer used
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			oInnerColumnListItem = this.oTable._oTemplate;
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test0");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test1");
			// Check cells
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template0");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template2");
			assert.equal(oInnerColumnListItem.getCells()[2].getText(), "template1");

			this.oTable.removeColumn("foo0");
			// Intial index no longer used
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			oInnerColumnListItem = this.oTable._oTemplate;
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test1");
			// Check cells
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template2");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template1");

			this.oTable.removeColumn("foo1");
			// Intial index no longer used
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			oInnerColumnListItem = this.oTable._oTemplate;
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2");
			// Check cells
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template2");

			done();
		}.bind(this));
	});

	QUnit.test("bindAggregation for others uses default behaviour", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.done().then(function() {
			var sPath = "/columnPath";
			var oTemplate = new Column({
				header: '{name}'
			});
			this.oTable.bindAggregation("columns", {
				path: sPath,
				template: oTemplate
			});

			var oBindingInfo = this.oTable.getBindingInfo("columns");
			assert.equal(oBindingInfo.path, sPath);
			assert.equal(oBindingInfo.template, oTemplate);
			done();
		}.bind(this));
	});

	QUnit.test("sort indicator is set correctly at the inner grid table columns", function(assert) {
		var done = assert.async();

		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperties: [
				"name"
			]
		}));

		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperties: [
				"age"
			]
		}));

		this.oTable.done().then(function() {
			var oTable = this.oTable;
			oTable.bindRows({
				path: "/foo",
				sorter: new Sorter("name", true)
			});

			var aInnerColumns = oTable._oTable.getColumns();
			assert.equal(aInnerColumns[0].getSorted(), true);
			assert.equal(aInnerColumns[0].getSortOrder(), "Descending");
			assert.equal(aInnerColumns[1].getSorted(), false);
			done();
		}.bind(this));
	});

	QUnit.test("sort indicator is set correctly at the inner mobile table columns", function(assert) {
		var done = assert.async();

		this.oTable.setType("ResponsiveTable");
		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperties: [
				"name"
			]
		}));

		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperties: [
				"cage", "age"
			]
		}));

		this.oTable.done().then(function() {
			var oTable = this.oTable;
			oTable.bindRows({
				path: "/foo",
				sorter: [
					new Sorter("age")
				]
			});

			var aInnerColumns = oTable._oTable.getColumns();
			assert.equal(aInnerColumns[0].getSortIndicator(), "None");
			assert.equal(aInnerColumns[1].getSortIndicator(), "Ascending");
			done();
		}.bind(this));
	});

	QUnit.test("setThreshold", function(assert) {
		var done = assert.async();
		var setThresholdSpy = sinon.spy(this.oTable, "setThreshold");
		var invalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setThreshold(10);

		assert.equal(invalidateSpy.callCount, 0);
		assert.ok(setThresholdSpy.returned(this.oTable));

		this.oTable.done().then(function() {
			invalidateSpy.reset();
			assert.equal(this.oTable._oTable.getThreshold(), this.oTable.getThreshold());

			this.oTable.setThreshold(-1);
			assert.equal(this.oTable._oTable.getThreshold(), this.oTable._oTable.getMetadata().getProperty("threshold").defaultValue);

			this.oTable.setThreshold(20);
			assert.equal(this.oTable._oTable.getThreshold(), 20);

			this.oTable.setThreshold(undefined);
			assert.equal(this.oTable._oTable.getThreshold(), this.oTable._oTable.getMetadata().getProperty("threshold").defaultValue);
			assert.equal(invalidateSpy.callCount, 0);

			this.oTable.setThreshold(30);
			this.oTable.setType("ResponsiveTable");

			this.oTable.done().then(function() {
				invalidateSpy.reset();
				assert.equal(this.oTable._oTable.getGrowingThreshold(), 30);

				this.oTable.setThreshold(-1);
				assert.equal(this.oTable._oTable.getGrowingThreshold(), this.oTable._oTable.getMetadata().getProperty("growingThreshold").defaultValue);

				this.oTable.setThreshold(20);
				assert.equal(this.oTable._oTable.getGrowingThreshold(), 20);

				this.oTable.setThreshold(null);
				assert.equal(this.oTable._oTable.getGrowingThreshold(), this.oTable._oTable.getMetadata().getProperty("growingThreshold").defaultValue);
				assert.equal(invalidateSpy.callCount, 0);

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("noDataText", function(assert) {
		var done = assert.async();
		var setNoDataSpy = sinon.spy(this.oTable, "setNoDataText");
		var invalidateSpy = sinon.spy(this.oTable, "invalidate");
		var sNoDataText = "Some No Data text";
		this.oTable.setNoDataText(sNoDataText);

		assert.equal(invalidateSpy.callCount, 0);
		assert.ok(setNoDataSpy.returned(this.oTable));

		this.oTable.done().then(function() {
			invalidateSpy.reset();
			assert.equal(this.oTable._oTable.getNoData(), this.oTable.getNoDataText());

			this.oTable.setNoDataText();
			assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());

			this.oTable.setNoDataText("foo");
			assert.equal(this.oTable._oTable.getNoData(), "foo");

			this.oTable.setNoDataText(undefined);
			assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());
			assert.equal(invalidateSpy.callCount, 0);

			this.oTable.setNoDataText("test");
			this.oTable.setType("ResponsiveTable");

			this.oTable.done().then(function() {
				invalidateSpy.reset();
				assert.equal(this.oTable._oTable.getNoDataText(), "test");

				this.oTable.setNoDataText();
				assert.equal(this.oTable._oTable.getNoDataText(), this.oTable._getNoDataText());

				this.oTable.setNoDataText("another text");
				assert.equal(this.oTable._oTable.getNoDataText(), "another text");

				this.oTable.setNoDataText(null);
				assert.equal(this.oTable._oTable.getNoDataText(), this.oTable._getNoDataText());
				assert.equal(invalidateSpy.callCount, 0);

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Header Visibility and Labelling", function(assert) {
		var done = assert.async();
		this.oTable.done().then(function() {
			var oTitle = this.oTable._oTitle;
			assert.ok(oTitle, "Title is available");
			assert.ok(!oTitle.hasStyleClass("sapMdcTableHeaderHidden"), "Title is shown");
			this.oTable.setHeaderVisible(false);
			assert.ok(oTitle.hasStyleClass("sapMdcTableHeaderHidden"), "Title is hidden");

			assert.equal(this.oTable._oTable.getAriaLabelledBy().length, 1, "ARIA labelling available for inner table");
			assert.equal(this.oTable._oTable.getAriaLabelledBy()[0], oTitle.getId(), "ARIA labelling for inner table points to title");

			done();
		}.bind(this));
	});

	QUnit.test("async addition of columns via delegate", function(assert) {
		var done = assert.async();

		this.oTable.addColumn(new Column({
			dataProperties: [
				"col0"
			],
			header: "col0"

		}));
		this.oTable.addColumn(new Column({
			dataProperties: [
				"col1"
			],
			header: "col1"

		}));

		this.oTable.bindRows({
			path: "/products"
		});

		this.oTable.done().then(function() {
			assert.ok(this.oTable.oTableDelegate); // a TableDelegate should exist!

			// Column template creation happens in a Promise --> use Promise.resolve to ensure this test runs after any template creation code
			Promise.resolve().then(function() {
				var aColumns = this.oTable.getColumns();
				var aInnerColumns = this.oTable._oTable.getColumns();

				assert.ok(aColumns[0].getTemplate());
				assert.ok(aInnerColumns[0].getTemplate());
				assert.ok(aColumns[1].getTemplate());
				assert.ok(aInnerColumns[1].getTemplate());

				done();

			}.bind(this));
		}.bind(this));
	});

	QUnit.test("rearrange columns", function(assert) {
		var done = assert.async();

		this.oTable.addColumn(new Column({
			dataProperties: [
				"col0"
			],
			header: "col0",
			template: new Text({
				text: "{col0}"
			})
		}));
		this.oTable.addColumn(new Column({
			dataProperties: [
				"col1"
			],
			header: "col1",
			template: new Text({
				text: "{col1}"
			})
		}));
		this.oTable.setP13nMode([
			"Column"
		]);
		this.oTable.bindRows({
			path: "/products"
		});

		sap.ui.getCore().applyChanges();

		this.oTable.done().then(function() {
			var aColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();

			sap.ui.getCore().applyChanges();
			sap.ui.require([
				"sap/ui/mdc/TableSettings", "sap/ui/mdc/TableDelegate"
			], function(TableSettings, TableDelegate) {

				var reorderSpy = sinon.spy(TableSettings, "moveColumn");
				sinon.stub(TableDelegate, "getCurrentState").returns({
					visibleFields: [
						{
							"name": aColumns[0].getDataProperties()[0],
							"id": aColumns[0].getId(),
							"label": aColumns[0].getHeader()
						}, {
							"name": aColumns[1].getDataProperties()[0],
							"id": aColumns[1].getId(),
							"label": aColumns[1].getHeader()
						}
					],
					sorters: []
				});

				triggerDragEvent("dragstart", aInnerColumns[0]);
				triggerDragEvent("dragenter", aInnerColumns[1]);
				triggerDragEvent("drop", aInnerColumns[1]);

				assert.ok(reorderSpy.calledOnce);
				assert.ok(reorderSpy.calledWithExactly(this.oTable, 0, 1));
				done();

			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Selection - GridTable", function(assert) {
		function checkSelectionMethods(oTable, oSpy) {
			var fInnerTablegetSelectedContextsSpy = sinon.spy(oSpy, "getSelectedIndices");
			var fInnerTableclearSelectionSpy = sinon.spy(oSpy, "clearSelection");

			assert.ok(fInnerTablegetSelectedContextsSpy.notCalled);
			oTable.getSelectedContexts();
			assert.ok(fInnerTablegetSelectedContextsSpy.calledOnce);
			assert.ok(fInnerTableclearSelectionSpy.notCalled);
			oTable.clearSelection();
			assert.ok(fInnerTableclearSelectionSpy.calledOnce);

			fInnerTablegetSelectedContextsSpy.restore();
			fInnerTableclearSelectionSpy.restore();
		}

		function selectItem(oRow, bUser) {
			if (bUser) {
				jQuery(oRow.getDomRefs().rowSelector).trigger("click");
				return;
			}
			(oRow.getParent().getPlugins().length ? oRow.getParent().getPlugins()[0] : oRow.getParent()).setSelectedIndex(oRow.getIndex(), true);
		}

		var done = assert.async();
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));
		var oModel = new JSONModel();
		oModel.setData({
			testpath: [
				{}, {}, {}, {}, {}
			]
		});
		this.oTable.setModel(oModel);
		this.oTable.bindRows({
			path: "/testpath"
		});

		this.oTable.done().then(function() {
			this.oTable._oTable.attachEventOnce("_rowsUpdated", function() {
				assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
				assert.ok(this.oTable._oTable.isBound("rows"));
				assert.equal(this.oTable._oTable.getBinding().getLength(), 5, "Items available");

				var iSelectionCount = -1;
				this.oTable.attachSelectionChange(function() {
					iSelectionCount = this.oTable.getSelectedContexts().length;
				}.bind(this));

				assert.equal(this.oTable.getSelectionMode(), "None", "Selection Mode None - MDCTable");
				assert.equal(this.oTable._oTable.getSelectionMode(), "None", "Selection Mode None - Inner Table");
				sap.ui.getCore().applyChanges();
				selectItem(this.oTable._oTable.getRows()[0], false);
				assert.equal(iSelectionCount, -1, "No selection change event");

				this.oTable.setSelectionMode("Single");
				assert.equal(this.oTable.getSelectionMode(), "Single", "Selection Mode Single - MDCTable");
				assert.equal(this.oTable._oTable.getSelectionMode(), "Single", "Selection Mode Single - Inner Table");
				sap.ui.getCore().applyChanges();
				assert.equal(this.oTable._oTable.getPlugins().length, 0, "No selection plugin");
				checkSelectionMethods(this.oTable, this.oTable._oTable);
				selectItem(this.oTable._oTable.getRows()[0], true);
				assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
				assert.equal(iSelectionCount, 1, "Selection change event");
				selectItem(this.oTable._oTable.getRows()[1], true);
				assert.equal(iSelectionCount, 1, "Selection change event");

				iSelectionCount = -1;
				this.oTable.clearSelection();
				assert.equal(iSelectionCount, -1, "No selection change event");
				assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

				this.oTable.setSelectionMode("Multi");
				assert.equal(this.oTable.getSelectionMode(), "Multi", "Selection Mode Multi - MDCTable");
				assert.equal(this.oTable._oTable.getSelectionMode(), "MultiToggle", "Selection Mode Multi - Inner Table");
				sap.ui.getCore().applyChanges();
				assert.equal(this.oTable._oTable.getPlugins().length, 1, "Plugin available");
				assert.ok(this.oTable._oTable.getPlugins()[0].isA("sap.ui.table.plugins.MultiSelectionPlugin"), "Plugin is a MultiSelectionPlugin");
				checkSelectionMethods(this.oTable, this.oTable._oTable.getPlugins()[0]);
				selectItem(this.oTable._oTable.getRows()[0], true);
				setTimeout(function() {
					assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
					assert.equal(iSelectionCount, 1, "Selection change event");
					selectItem(this.oTable._oTable.getRows()[1], true);
					setTimeout(function() {
						assert.equal(iSelectionCount, 2, "Selection change event");
						selectItem(this.oTable._oTable.getRows()[2], true);
						setTimeout(function() {
							assert.equal(iSelectionCount, 3, "Selection change event");

							iSelectionCount = -1;
							this.oTable.clearSelection();
							assert.equal(iSelectionCount, -1, "No selection change event");
							assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

							done();
						}.bind(this), 0);
					}.bind(this), 0);
				}.bind(this), 0);
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Selection - ResponsiveTable", function(assert) {
		function checkSelectionMethods(oTable) {
			var fInnerTablegetSelectedContextsSpy = sinon.spy(oTable._oTable, "getSelectedContexts");
			var fInnerTableclearSelectionSpy = sinon.spy(oTable._oTable, "removeSelections");

			assert.ok(fInnerTablegetSelectedContextsSpy.notCalled);
			oTable.getSelectedContexts();
			assert.ok(fInnerTablegetSelectedContextsSpy.calledOnce);
			assert.ok(fInnerTableclearSelectionSpy.notCalled);
			oTable.clearSelection();
			assert.ok(fInnerTableclearSelectionSpy.calledOnce);

			fInnerTablegetSelectedContextsSpy.restore();
			fInnerTableclearSelectionSpy.restore();
		}

		function selectItem(oItem, bUser) {
			if (bUser) {
				oItem.setSelected(true);
				oItem.informList("Select", true);
				return;
			}
			oItem.getParent().setSelectedItem(oItem, true);
		}

		var done = assert.async();
		this.oTable.setType("ResponsiveTable");
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));
		var oModel = new JSONModel();
		oModel.setData({
			testpath: [
				{}, {}, {}, {}, {}
			]
		});
		this.oTable.setModel(oModel);
		this.oTable.bindRows({
			path: "/testpath"
		});

		this.oTable.done().then(function() {
			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(this.oTable._oTable.isBound("items"));
			assert.equal(this.oTable._oTable.getItems().length, 5, "Items available");

			var iSelectionCount = -1;
			this.oTable.attachSelectionChange(function() {
				iSelectionCount = this.oTable.getSelectedContexts().length;
			}.bind(this));

			assert.equal(this.oTable.getSelectionMode(), "None", "Selection Mode None - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "None", "Selection Mode None - Inner Table");
			sap.ui.getCore().applyChanges();
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(iSelectionCount, -1, "No selection change event");

			this.oTable.setSelectionMode("Multi");
			assert.equal(this.oTable.getSelectionMode(), "Multi", "Selection Mode Multi - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "MultiSelect", "Selection Mode Multi - Inner Table");
			sap.ui.getCore().applyChanges();
			checkSelectionMethods(this.oTable);
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
			assert.equal(iSelectionCount, -1, "No selection change event");
			selectItem(this.oTable._oTable.getItems()[1], true);
			assert.equal(iSelectionCount, 2, "Selection change event");
			selectItem(this.oTable._oTable.getItems()[2], true);
			assert.equal(iSelectionCount, 3, "Selection change event");

			iSelectionCount = -1;
			this.oTable.clearSelection();
			assert.equal(iSelectionCount, -1, "No selection change event");
			assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

			this.oTable.setSelectionMode("Single");
			assert.equal(this.oTable.getSelectionMode(), "Single", "Selection Mode Single - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "SingleSelectLeft", "Selection Mode Single - Inner Table");
			sap.ui.getCore().applyChanges();
			checkSelectionMethods(this.oTable);
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
			assert.equal(iSelectionCount, -1, "No selection change event");
			selectItem(this.oTable._oTable.getItems()[1], true);
			assert.equal(iSelectionCount, 1, "Selection change event");

			iSelectionCount = -1;
			this.oTable.clearSelection();
			assert.equal(iSelectionCount, -1, "No selection change event");
			assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

			done();
		}.bind(this));
	});

	QUnit.test("ColumnHeaderPopover Sort - ResponsiveTable", function(assert) {
		var done = assert.async();
		var fColumnPressSpy = sinon.spy(this.oTable, "_onColumnPress");
		this.oTable.setType("ResponsiveTable");

		// Add a column with dataProperty
		this.oTable.addColumn(new Column({
			header: "test",
			dataProperties: "test",
			template: new Text()
		}));

		// Add a column without dataProperty (hence not sortable)
		this.oTable.addColumn(new Column({
			header: "test2",
			template: new Text()
		}));

		this.oTable.done().then(function() {
			sap.ui.require([
				"sap/ui/mdc/TableSettings"
			], function(TableSettings) {
				var fSortSpy = sinon.spy(TableSettings, "createSort");

				assert.ok(this.oTable._oTable);
				assert.ok(this.oTable._oTable.bActiveHeaders, true);
				assert.ok(fColumnPressSpy.notCalled);

				var oInnerColumn = this.oTable._oTable.getColumns()[0];
				assert.ok(oInnerColumn.isA("sap.m.Column"));
				this.oTable._oTable.fireEvent("columnPress", {
					column: oInnerColumn
				});
				// Event triggered but no ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledOnce);
				assert.ok(!this.oTable._oPopover);

				// Enable Sorting on Table
				this.oTable.setP13nMode([
					"Sort"
				]);

				this.oTable._oTable.fireEvent("columnPress", {
					column: oInnerColumn
				});

				// Event triggered and the ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledTwice);
				assert.ok(this.oTable._oPopover);
				assert.ok(this.oTable._oPopover.isA("sap.m.ColumnHeaderPopover"));

				var oSortItem = this.oTable._oPopover.getItems()[0];
				assert.ok(oSortItem.isA("sap.m.ColumnPopoverSortItem"));

				assert.ok(fSortSpy.notCalled);
				// Simulate Sort Icon press on ColumHeaderPopover
				oSortItem.fireSort({
					property: "foo"
				});
				// Event handler triggered
				assert.ok(fSortSpy.calledOnce);

				// Test for non-sortable column
				fColumnPressSpy.reset();
				delete this.oTable._oPopover;
				oInnerColumn = this.oTable._oTable.getColumns()[1];
				assert.ok(oInnerColumn.isA("sap.m.Column"));
				// Simulate click on non-sortable column
				this.oTable._oTable.fireEvent("columnPress", {
					column: oInnerColumn
				});

				// Event triggered but no ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledOnce);
				assert.ok(!this.oTable._oPopover);

				fSortSpy.restore();
				fColumnPressSpy.restore();
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("ColumnHeaderPopover Sort - GridTable", function(assert) {
		var done = assert.async();
		var fColumnPressSpy = sinon.spy(this.oTable, "_onColumnPress");

		// Add a column with dataProperty
		this.oTable.addColumn(new Column({
			header: "test",
			dataProperties: "test",
			template: new Text()
		}));

		// Add a column without dataProperty (hence not sortable)
		this.oTable.addColumn(new Column({
			header: "test2",
			template: new Text()
		}));

		this.oTable.done().then(function() {
			sap.ui.require([
				"sap/ui/mdc/TableSettings"
			], function(TableSettings) {
				var fSortSpy = sinon.spy(TableSettings, "createSort");

				assert.ok(this.oTable._oTable);
				assert.ok(fColumnPressSpy.notCalled);

				var oInnerColumn = this.oTable._oTable.getColumns()[0];
				assert.ok(oInnerColumn.isA("sap.ui.table.Column"));
				oInnerColumn.fireEvent("columnMenuOpen");
				// Event triggered but no ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledOnce);
				assert.ok(!this.oTable._oPopover);

				// Enable Sorting on Table
				this.oTable.setP13nMode([
					"Sort"
				]);

				// Simulate click on sortable column
				oInnerColumn.fireEvent("columnMenuOpen");
				// Event triggered and the ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledTwice);
				assert.ok(this.oTable._oPopover);
				assert.ok(this.oTable._oPopover.isA("sap.m.ColumnHeaderPopover"));

				var oSortItem = this.oTable._oPopover.getItems()[0];
				assert.ok(oSortItem.isA("sap.m.ColumnPopoverSortItem"));

				assert.ok(fSortSpy.notCalled);
				// Simulate Sort Icon press on ColumHeaderPopover
				oSortItem.fireSort({
					property: "foo"
				});
				// Event handler triggered
				assert.ok(fSortSpy.calledOnce);

				// Test for non-sortable column
				fColumnPressSpy.reset();
				delete this.oTable._oPopover;
				oInnerColumn = this.oTable._oTable.getColumns()[1];
				assert.ok(oInnerColumn.isA("sap.ui.table.Column"));
				// Simulate click on non-sortable column
				oInnerColumn.fireEvent("columnMenuOpen");

				// Event triggered but no ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledOnce);
				assert.ok(!this.oTable._oPopover);

				fSortSpy.restore();
				fColumnPressSpy.restore();
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Multiple Tables with different type - Columns added simultaneously to inner tables", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		var oTable2 = new Table({
			type: "ResponsiveTable"
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			}),
			creationTemplate: new Text({
				text: "Test"
			})
		}));
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 0);

		oTable2.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			}),
			creationTemplate: new Text({
				text: "Test"
			})
		}));
		oTable2.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 0);

		Promise.all([
			this.oTable.done(), oTable2.done()
		]).then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(oTable2._oTable);
			assert.ok(oTable2._oTemplate);

			this.oTable.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			oTable2.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal(aInnerColumns[0].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test2", "column0: label is correct");
			assert.equal(aInnerColumns[1].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test", "column1: label is correct");
			assert.equal(aInnerColumns[2].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test3", "column1: label is correct");
			assert.equal(aInnerColumns[0].getTemplate().getText(), "Test2", "column0: template is correct");
			assert.equal(aInnerColumns[0].getTemplate().getWrapping(), false, "column0: template wrapping is disabled");
			assert.equal(aInnerColumns[0].getTemplate().getRenderWhitespace(), false, "column0: template renderWhitespace is disabled");
			assert.equal(aInnerColumns[1].getTemplate().getText(), "Test", "column1: template is correct");
			assert.equal(aInnerColumns[0].getCreationTemplate(), null, "column0: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getText(), "Test", "column1: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getWrapping(), false, "column1: creationTemplate wrapping is disabled");
			assert.equal(aInnerColumns[1].getCreationTemplate().getRenderWhitespace(), false, "column1: creationTemplate renderWhitespace is disabled");
			assert.equal(aInnerColumns[0].getShowFilterMenuEntry(), false, "column0: filtering is deactivated");
			assert.equal(aInnerColumns[0].getShowSortMenuEntry(), false, "column0: sorting is deactivated");
			assert.equal(aInnerColumns[1].getShowFilterMenuEntry(), false, "column1: filtering is deactivated");
			assert.equal(aInnerColumns[1].getShowSortMenuEntry(), false, "column1: sorting is deactivated");

			aMDCColumns = oTable2.getColumns();
			aInnerColumns = oTable2._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal(aInnerColumns[0].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2", "column0: label is correct");
			assert.equal(aInnerColumns[0].getHeader().getWrapping(), true);
			assert.equal(aInnerColumns[0].getHeader().getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[1].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test", "column1: label is correct");
			assert.equal(aInnerColumns[1].getHeader().getWrapping(), true);
			assert.equal(aInnerColumns[1].getHeader().getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[2].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3", "column1: label is correct");
			assert.equal(aInnerColumns[2].getHeader().getWrapping(), true);
			assert.equal(aInnerColumns[2].getHeader().getWrappingType(), "Hyphenated");

			done();
		}.bind(this));
	});
});