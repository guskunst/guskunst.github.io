/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/flexibility/Table.flexibility", "sap/ui/fl/Change", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "sap/ui/mdc/TableDelegate"
], function(TableFlexHandler, Change, JsControlTreeModifier, UIComponent, ComponentContainer, TableDelegate) {
	'use strict';

	sap.ui.getCore().loadLibrary("sap.ui.fl");
	var UIComp = UIComponent.extend("test", {
		metadata: {
			manifest: {
				"sap.app": {
					"id": "",
					"type": "application"
				}
			}
		},
		createContent: function() {
			// store it in outer scope
			var oView = sap.ui.view({
				async: false,
				type: "XML",
				id: this.createId("view"),
				viewContent: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc"><Table id="myTable"><columns><Column id="column0" header="column 0" dataProperties="column0"><m:Text text="{column0}" id="text0" /></Column><Column id="column1" header="column 1" dataProperties="column1"><m:Text text="{column1}" id="text1" /></Column><Column id="column2" header="column 2" dataProperties="column2"><m:Text text="{column2}" id="text2" /></Column></columns></Table></mvc:View>'
			});
			return oView;
		}
	});

	function createRemoveChangeDefinition(mDefinition) {
		return {
			"changeType": "removeColumn",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"id": "comp---view--column1",
				"idIsLocal": false
			}
		};
	}

	function createAddChangeDefinition(sProperty) {
		return {
			"changeType": "addColumn",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"name": sProperty
			}
		};
	}

	QUnit.module("Basic functionality with JsControlTreeModifier", {
		beforeEach: function() {
			this.oUiComponent = new UIComp("comp");

			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oView = this.oUiComponent.getRootControl();
			this.oTable = this.oView.byId('myTable');
			this.oColumn1 = this.oView.byId('column1');
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test('RemoveColumn - applyChange & revertChange on a js control tree', function(assert) {
		var oChange = new Change(createRemoveChangeDefinition());
		var oChangeHandler = TableFlexHandler["removeColumn"].changeHandler;
		assert.strictEqual(this.oColumn1.getId(), this.oTable.getAggregation('columns')[1].getId(), "column has not been changed");
		assert.strictEqual(this.oTable.getColumns().length, 3);

		// Test apply
		oChangeHandler.applyChange(oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});

		assert.notEqual(this.oColumn1.getId(), this.oTable.getAggregation('columns')[1].getId(), "column has been removed successfully");
		assert.strictEqual(this.oTable.getColumns().length, 2);

		// Test revert
		oChangeHandler.revertChange(oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});
		assert.strictEqual(this.oColumn1.getId(), this.oTable.getAggregation('columns')[1].getId(), "column has been restored successfully");
		assert.strictEqual(this.oTable.getColumns().length, 3);
	});

	QUnit.test('AddColumn - applyChange & revertChange on a js control tree', function(assert) {
		var sPropertyName = "SomePropertyName";
		var oChange = new Change(createAddChangeDefinition(sPropertyName));
		var oChangeHandler = TableFlexHandler["addColumn"].changeHandler;

		assert.strictEqual(this.oTable.getColumns().length, 3);

		// Test apply
		oChangeHandler.applyChange(oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});

		assert.strictEqual(this.oTable.getColumns()[3].getId(), "comp---view--myTable--" + sPropertyName, "column has been added successfully");
		assert.strictEqual(this.oTable.getColumns().length, 4);

		// Test revert
		oChangeHandler.revertChange(oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});
		assert.strictEqual(this.oTable.getColumns().length, 3);
	});
});
