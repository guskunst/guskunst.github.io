/* global QUnit */
(function() {
	"use strict";

	QUnit.config.autostart = false;

	sap.ui.require([
		"sap/ui/mdc/TemplateUtil", "util/Component", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/ComponentContainer", "sap/ui/base/SyncPromise"
	], function(TemplateUtil, Component, XMLPreprocessor, ComponentContainer, SyncPromise) {

		QUnit.module("sap.ui.mdc.TemplateUtil", {
			before: function(assert) {
				// register plugin
				XMLPreprocessor.plugIn(function(oNode, oVisitor) {
					TemplateUtil.initialTemplating(oNode, oVisitor, "util.Table", {
						columns: "util/Table_columns",
						actions: "util/Table_actions"
					});
					return SyncPromise.resolve();
				}, "util", "Table");
			},
			after: function() {
				//
			}
		});

		QUnit.test("XML Template test", function(assert) {
			var done = assert.async();

			var oComponentContainer = new ComponentContainer({
				component: new Component("aggregations")
			}).placeAt("qunit-fixture");

			var oView = oComponentContainer.getComponentInstance().getRootControl();
			// wait for async view to be loaded
			oView.loaded().then(function() {
				var oTable = oView.byId("table");
				assert.ok(oTable, "Table exists");
				assert.equal(oTable.getHeader(), "test");
				// check if aggregationFragment specified via TemplateUtil works
				var aColumns = oTable.getColumns();
				assert.equal(aColumns.length, 3);
				// Test with property values specified in aggregationFragment
				assert.equal(aColumns[0].getHeader(), "Column A");
				assert.equal(aColumns[0].getId(), oView.getId() + "--table--col1");
				assert.equal(aColumns[1].getHeader(), "Column B");
				assert.equal(aColumns[1].getId(), oView.getId() + "--table--col2");
				assert.equal(aColumns[2].getHeader(), "Column C");
				// No Id provided in aggregationFragment for 3rd column
				assert.ok(aColumns[2].getId().startsWith("__column"));

				// check if aggregationFragment with metadataContext specified via TemplateUtil works
				var aActions = oTable.getActions();
				assert.equal(aActions.length, 2);
				assert.equal(aActions[0].getText(), "Action 1");
				assert.equal(aActions[1].getText(), "Action 2");
				done();
			});
		});

		QUnit.start();
	});

})();
