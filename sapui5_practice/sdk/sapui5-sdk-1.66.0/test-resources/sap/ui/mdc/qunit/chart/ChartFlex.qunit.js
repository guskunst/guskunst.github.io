/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/flexibility/Chart.flexibility", "sap/ui/fl/Change", "sap/ui/fl/FlexController", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "sap/ui/mdc/base/ConditionModel", "sap/ui/mdc/p13n/Util"
], function(ChartFlexibility, Change, FlexController, JsControlTreeModifier, UIComponent, ComponentContainer, ConditionModel, Util) {
	'use strict';

	function createChange(oUiComponent, oControl, oDelta) {
		var mChangeSpecificData = {
			developerMode: false,
			layer: "USER"
		};
		Object.assign(mChangeSpecificData, oDelta.changeSpecificData);
		var oFlexController = new FlexController(oUiComponent.getMetadata().getName());
		return oFlexController.createChange(mChangeSpecificData, oControl);
	}

	QUnit.module("Change handler for visibility of columns", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' +
						'\t\t  xmlns:core="sap.ui.core"\n' +
						'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
						'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
						'\t\t  xmlns:state="sap.ui.mdc.base.state"\n' +
						'\t\t  xmlns="sap.m">\n' +
						'\t\t\t\t<mdc:Chart id="IDChartVisibility" metadataDelegate="sap/ui/mdc/qunit/chart/Helper">\n' +
						'\t\t\t\t\t\t<mdc:items><chart:DimensionItem id="item0" key="Name" label="Name" role="category"></chart:DimensionItem>\n' +
						'\t\t\t\t\t\t<chart:MeasureItem id="item1" key="SalesAmount" label="Depth" role="axis1"></chart:MeasureItem>\n' +
						'\t\t\t\t\t\t<chart:MeasureItem id="item2" key="SalesNumber" label="Width" role="axis2"></chart:MeasureItem></mdc:items>\n' +
						'\t\t\t\t</mdc:Chart>\n' +
						'</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");
			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChartVisibility');
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});

	QUnit.test("add and remove an item on the chart", function(assert) {
		var done = assert.async( 2 );

		//create sample data, 'simulate' user action
		this.aExistingArray = Util._getChartData(this.oChart);
		var fnSymbol;
		this.aChangedArray = Util._getChartData(this.oChart);

		//since we set the data manually, we need to use 'name' because there is a mapping inbetween
		this.aChangedArray.push({ id: 'item4', name: 'Country', label: 'Country', role: 'category' });

		fnSymbol = function (o) {
			return o.name + o.role;
		};

		//create according change(s)
		var aChanges = Util._processResult(this.aExistingArray, this.aChangedArray, fnSymbol, this.oChart, "removeItem", "addItem");

		//check if the change has been created correctly
		assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created:" + aChanges.length);

		//apply the change
		Util.handleUserChanges(aChanges, this.oChart).then(function () {

			//check if the flex data has been stored correctly
			assert.strictEqual(this.oChart.getItems().length, 4, "The correct amount of changes has been created:" + aChanges.length);
			//check if the values of the items aggregation are correct
			assert.strictEqual(this.oChart.getItems()[0].getKey(), "Name", "correct attribute: " + this.oChart.getItems()[0].getKey());
			assert.strictEqual(this.oChart.getItems()[0].getLabel(), "Name", "correct attribute: " + this.oChart.getItems()[0].getLabel());
			assert.strictEqual(this.oChart.getItems()[0].getRole(), "category", "correct attribute: " + this.oChart.getItems()[0].getRole());

			assert.strictEqual(this.oChart.getItems()[1].getKey(), "SalesAmount", "correct attribute: " + this.oChart.getItems()[1].getKey());
			assert.strictEqual(this.oChart.getItems()[1].getLabel(), "Depth", "correct attribute: " + this.oChart.getItems()[1].getLabel());
			assert.strictEqual(this.oChart.getItems()[1].getRole(), "axis1", "correct attribute: " + this.oChart.getItems()[1].getRole());

			assert.strictEqual(this.oChart.getItems()[2].getKey(), "SalesNumber", "correct attribute: " + this.oChart.getItems()[2].getKey());
			assert.strictEqual(this.oChart.getItems()[2].getLabel(), "Width", "correct attribute: " + this.oChart.getItems()[2].getLabel());
			assert.strictEqual(this.oChart.getItems()[2].getRole(), "axis2", "correct attribute: " + this.oChart.getItems()[2].getRole());

			assert.strictEqual(this.oChart.getItems()[3].getKey(), "Country", "correct attribute: " + this.oChart.getItems()[3].getKey());
			assert.strictEqual(this.oChart.getItems()[3].getLabel(), "Country", "correct attribute: " + this.oChart.getItems()[3].getLabel());
			assert.strictEqual(this.oChart.getItems()[3].getRole(), "category", "correct attribute: " + this.oChart.getItems()[3].getRole());

			done();

			//now remove the added item
			this.aExistingArray = Util._getChartData(this.oChart);
			this.aChangedArray = Util._getChartData(this.oChart);
			this.aChangedArray.pop();

			//create according change(s)
			aChanges = Util._processResult(this.aExistingArray, this.aChangedArray, fnSymbol, this.oChart, "removeItem", "addItem");

			Util.handleUserChanges(aChanges, this.oChart).then(function () {
				//check if the change has been created correctly
				assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created:" + aChanges.length);
				//check if the flex data has been stored correctly

				assert.strictEqual(this.oChart.getItems().length, 3, "The correct amount of changes has been created:" + aChanges.length);
				//check if the values of the items aggregation are correct
				assert.strictEqual(this.oChart.getItems()[0].getKey(), "Name", "correct attribute: " + this.oChart.getItems()[0].getKey());
				assert.strictEqual(this.oChart.getItems()[0].getLabel(), "Name", "correct attribute: " + this.oChart.getItems()[0].getLabel());
				assert.strictEqual(this.oChart.getItems()[0].getRole(), "category", "correct attribute: " + this.oChart.getItems()[0].getRole());

				assert.strictEqual(this.oChart.getItems()[1].getKey(), "SalesAmount", "correct attribute: " + this.oChart.getItems()[1].getKey());
				assert.strictEqual(this.oChart.getItems()[1].getLabel(), "Depth", "correct attribute: " + this.oChart.getItems()[1].getLabel());
				assert.strictEqual(this.oChart.getItems()[1].getRole(), "axis1", "correct attribute: " + this.oChart.getItems()[1].getRole());

				assert.strictEqual(this.oChart.getItems()[2].getKey(), "SalesNumber", "correct attribute: " + this.oChart.getItems()[2].getKey());
				assert.strictEqual(this.oChart.getItems()[2].getLabel(), "Width", "correct attribute: " + this.oChart.getItems()[2].getLabel());
				assert.strictEqual(this.oChart.getItems()[2].getRole(), "axis2", "correct attribute: " + this.oChart.getItems()[2].getRole());

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("change an existing role on an item", function(assert) {
		var done = assert.async( 1 );

		//create sample data, 'simulate' user action
		this.aExistingArray = Util._getChartData(this.oChart);
		var fnSymbol;
		this.aChangedArray = Util._getChartData(this.oChart);

		//since we set the data manually, we need to use 'name' because there is a mapping inbetween
		this.aChangedArray[0].role = "series";

		fnSymbol = function (o) {
			return o.name + o.role;
		};

		//create according change(s)
		var aChanges = Util._processResult(this.aExistingArray, this.aChangedArray, fnSymbol, this.oChart, "removeItem", "addItem");

		//check if the change has been created correctly
		assert.strictEqual(aChanges.length, 2, "The correct amount of changes has been created:" + aChanges.length);

		//apply the change
		Util.handleUserChanges(aChanges, this.oChart).then(function () {

			//check if the flex data has been stored correctly
			assert.strictEqual(this.oChart.getItems().length, 3);
			//check if the values of the items aggregation are correct
			assert.strictEqual(this.oChart.getItems()[0].getKey(), "Name", "correct attribute: " + this.oChart.getItems()[0].getKey());
			assert.strictEqual(this.oChart.getItems()[0].getLabel(), "Name", "correct attribute: " + this.oChart.getItems()[0].getLabel());
			assert.strictEqual(this.oChart.getItems()[0].getRole(), "series", "correct attribute: " + this.oChart.getItems()[0].getRole());

			assert.strictEqual(this.oChart.getItems()[1].getKey(), "SalesAmount", "correct attribute: " + this.oChart.getItems()[1].getKey());
			assert.strictEqual(this.oChart.getItems()[1].getLabel(), "Depth", "correct attribute: " + this.oChart.getItems()[1].getLabel());
			assert.strictEqual(this.oChart.getItems()[1].getRole(), "axis1", "correct attribute: " + this.oChart.getItems()[1].getRole());

			assert.strictEqual(this.oChart.getItems()[2].getKey(), "SalesNumber", "correct attribute: " + this.oChart.getItems()[2].getKey());
			assert.strictEqual(this.oChart.getItems()[2].getLabel(), "Width", "correct attribute: " + this.oChart.getItems()[2].getLabel());
			assert.strictEqual(this.oChart.getItems()[2].getRole(), "axis2", "correct attribute: " + this.oChart.getItems()[2].getRole());
			done();
		}.bind(this));
	});
	QUnit.module("Change handler for visibility of columns", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' +
						'\t\t  xmlns:core="sap.ui.core"\n' +
						'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
						'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
						'\t\t  xmlns:state="sap.ui.mdc.base.state"\n' +
						'\t\t  xmlns="sap.m">\n' +
						'\t\t\t\t<mdc:Chart id="IDChartVisibility2" metadataDelegate="sap/ui/mdc/qunit/chart/Helper">\n' +
						'\t\t\t\t\t\t<mdc:items><chart:DimensionItem id="item0" key="Name" label="Name" role="category"></chart:DimensionItem>\n' +
						'\t\t\t\t\t\t<chart:MeasureItem id="item1" key="SalesAmount" label="Depth" role="axis1"></chart:MeasureItem>\n' +
						'\t\t\t\t\t\t<chart:MeasureItem id="item2" key="SalesNumber" label="Width" role="axis2"></chart:MeasureItem></mdc:items>\n' +
						'\t\t\t\t</mdc:Chart>\n' +
						'</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");
			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChartVisibility2');
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});

	QUnit.test("change the position of an existing item", function(assert) {
		var done = assert.async( 1 );

		//create sample data, 'simulate' user action
		this.aExistingArray = Util._getChartData(this.oChart);
		var fnSymbol;
		this.aChangedArray = [];
		this.aChangedArray.push(this.aExistingArray[1]);
		this.aChangedArray.push(this.aExistingArray[2]);
		this.aChangedArray.push(this.aExistingArray[0]);

		fnSymbol = function (o) {
			return o.name + o.role;
		};

		//create according change(s)
		var aChanges = Util._processResult(this.aExistingArray, this.aChangedArray, fnSymbol, this.oChart, "removeItem", "addItem");

		//check if the change has been created correctly
		assert.strictEqual(aChanges.length, 2, "The correct amount of changes has been created:" + aChanges.length);

		//apply the change
		Util.handleUserChanges(aChanges, this.oChart).then(function () {

			//check if the flex data has been stored correctly
			assert.strictEqual(this.oChart.getItems().length, 3);
			//check if the values of the items aggregation are correct

			assert.strictEqual(this.oChart.getItems()[0].getKey(), "SalesAmount", "correct attribute: " + this.oChart.getItems()[0].getKey());
			assert.strictEqual(this.oChart.getItems()[0].getLabel(), "Depth", "correct attribute: " + this.oChart.getItems()[0].getLabel());
			assert.strictEqual(this.oChart.getItems()[0].getRole(), "axis1", "correct attribute: " + this.oChart.getItems()[0].getRole());

			assert.strictEqual(this.oChart.getItems()[1].getKey(), "SalesNumber", "correct attribute: " + this.oChart.getItems()[1].getKey());
			assert.strictEqual(this.oChart.getItems()[1].getLabel(), "Width", "correct attribute: " + this.oChart.getItems()[1].getLabel());
			assert.strictEqual(this.oChart.getItems()[1].getRole(), "axis2", "correct attribute: " + this.oChart.getItems()[1].getRole());

			assert.strictEqual(this.oChart.getItems()[2].getKey(), "Name", "correct attribute: " + this.oChart.getItems()[2].getKey());
			assert.strictEqual(this.oChart.getItems()[2].getLabel(), "Name", "correct attribute: " + this.oChart.getItems()[2].getLabel());
			assert.strictEqual(this.oChart.getItems()[2].getRole(), "category", "correct attribute: " + this.oChart.getItems()[2].getRole());
			done();
		}.bind(this));
	});

	QUnit.test('AddColumn - applyChange & revertChange on a js control tree', function(assert) {
		var sProperty = "SomePropertyName";
		var oChange = new Change({
			"changeType": "addItem",
			"selector": {
				"id": "comp---view--IDChartVisibility2"
			},
			"content": {
				"name": sProperty,
				"kind": "dimension",
				"role": "category",
				"label": "SomeLabel"
			}
		});

		var oChangeHandler = ChartFlexibility["addItem"].changeHandler;

		assert.strictEqual(this.oChart.getItems().length, 3);

		// Test apply
		oChangeHandler.applyChange(oChange, this.oChart, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});

		assert.strictEqual(this.oChart.getItems()[3].getId(), "comp---view--IDChartVisibility2--" + sProperty, "item has been added");
		assert.strictEqual(this.oChart.getItems().length, 4);

		// Test revert
		oChangeHandler.revertChange(oChange, this.oChart, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});
		assert.strictEqual(this.oChart.getItems().length, 3, "item has been removed");
	});

	QUnit.test('RemoveColumn - applyChange & revertChange on a js control tree', function(assert) {
		var oChange = new Change({
			"changeType": "removeItem",
			"selector": {
				"id": "comp---view--IDChartVisibility2"
			},
			"content": {
				"id": "comp---view--item1"
			}
		});
		var oChangeHandler = ChartFlexibility["removeItem"].changeHandler;
		assert.strictEqual(this.oChart.getItems().length, 3,"3 existing items");

		// Test apply
		oChangeHandler.applyChange(oChange, this.oChart, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});

		assert.strictEqual(this.oChart.getItems().length, 2,"remove applied correctly: item has been removed from the aggregation");

		// Test revert
		oChangeHandler.revertChange(oChange, this.oChart, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});
		assert.strictEqual(this.oChart.getItems().length, 3, "remove reverted correctly: item has been added to the aggregation");
	});



	QUnit.module("Change handler for sorting", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' + '\t\t  xmlns:core="sap.ui.core"\n' + '\t\t  xmlns:mdc="sap.ui.mdc"\n' + '\t\t  xmlns:state="sap.ui.mdc.base.state"\n' + '\t\t  xmlns="sap.m">\n' + '\t\t\t\t<mdc:Chart id="IDChart" metadataDelegate="sap/ui/mdc/qunit/chart/Helper">\n' + '\t\t\t\t</mdc:Chart>\n' + '</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");
			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChart');
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});
	QUnit.test("add and remove sort without existing changes", function(assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function() {

			//create sample data, 'simulate' user action
			var aExistingArray = [], fnSymbol;
			var aChangedArray = [{"name":"Name","index":0}];

			fnSymbol = function (o) {
				return o.name + o.sortOrder;
			};

			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");

			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "addSort", "The created change has a correct type");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Name", "The change includes the correct property");

			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function() {
				//check if the flex data has been stored correctly
				assert.strictEqual(this.oChart.data("$p13nSort"), '[\\{"name":"Name","index":0}]', "The flex data has been stored successfully");

				aExistingArray = Util._getSortData(this.oChart, "Sort");
				aChangedArray = [];

				aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");
				assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created");
				assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeSort", "The created change has a correct type");
				assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Name", "The change includes the correct property");

				//apply the change
				Util.handleUserChanges(aChanges, this.oChart).then(function () {

					//check if the flex data has been stored correctly
					assert.strictEqual(this.oChart.data("$p13nSort"), '[]', "The flex data has been stored successfully");
					done();

				}.bind(this));
			}.bind(this));
		}.bind(this));
	});
	QUnit.test("change existing sortOrder", function(assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function() {

			//create sample data, 'simulate' user action
			var aExistingArray = [{"name":"Name","index":0}], fnSymbol;
			var aChangedArray = [{"name":"Name","index":0,"sortOrder":"Descending"}];

			fnSymbol = function (o) {
				return o.name + o.sortOrder;
			};

			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");

			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 2, "The correct amount of changes has been created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeSort", "The first change is of type 'removeSort'");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Name", "The change includes the correct property");
			assert.strictEqual(aChanges[1].changeSpecificData.changeType, "addSort", "The second change is of type 'addSort'");
			assert.strictEqual(aChanges[1].changeSpecificData.content.name, "Name", "The change includes the correct property");
			assert.strictEqual(aChanges[1].changeSpecificData.content.sortOrder, "Descending", "The change includes the correct sortorder");

			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {
				//check if the flex data has been stored correctly
				assert.strictEqual(this.oChart.data("$p13nSort"), '[\\{"name":"Name","index":0,"sortOrder":"Descending"}]', "The flex data has been stored successfully");
				done();

			}.bind(this));
		}.bind(this));
	});
	QUnit.test("change the position of two existing sorters", function(assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function() {

			//create sample data, 'simulate' user action
			var aExistingArray = [{name: "Category"}, {name: "ProductID"}], fnSymbol;
			var aChangedArray = [{name: "Category", sortOrder: "Ascending", index: 0}, {name: "ProductID", sortOrder: "Descending", index: 1}];

			fnSymbol = function (o) {
				return o.name + o.sortOrder;
			};

			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");

			//check if the change(s) have been created correctly
			assert.strictEqual(aChanges.length, 4, "The correct amount of changes has been created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeSort", "The first change is of type 'removeSort'");
			assert.strictEqual(aChanges[1].changeSpecificData.changeType, "removeSort", "The second change is of type 'removeSort'");
			assert.strictEqual(aChanges[2].changeSpecificData.changeType, "addSort", "The third change is of type 'addSort'");
			assert.strictEqual(aChanges[3].changeSpecificData.changeType, "addSort", "The fourth change is of type 'addSort'");

			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {
				assert.strictEqual(this.oChart.data("$p13nSort"), '[\\{\"name\":\"Category\",\"index\":0,\"sortOrder\":\"Ascending\"},\\{\"name\":\"ProductID\",\"index\":1,\"sortOrder\":\"Descending\"}]', "The flex data has been stored successfully");
				done();
			}.bind(this));

		}.bind(this));
	});
	QUnit.test("add and remove sort with initial sorters", function(assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function() {

			//create sample data, 'simulate' user action
			var aExistingArray = [{"name":"Name","index":0}], fnSymbol;
			var aChangedArray = [{"name":"Name","index":0}, {"name":"Product","index":1,"sortOrder":"Descending"}];
			fnSymbol = function (o) {
				return o.name + o.sortOrder;
			};
			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");
			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "addSort", "The created change has a correct type");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Product", "The change includes the correct property");
			assert.strictEqual(aChanges[0].changeSpecificData.content.sortOrder, "Descending", "The change includes the correct sortorder");
			done();
		}.bind(this));
	});
	QUnit.module("Change handler for sorting 02", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' + '\t\t  xmlns:core="sap.ui.core"\n' + '\t\t  xmlns:mdc="sap.ui.mdc"\n' + '\t\t  xmlns="sap.m">\n' + '\t\t\t\t<mdc:Chart id="IDChart2" metadataDelegate="sap/ui/mdc/qunit/chart/Helper">\n' + '\t\t\t\t</mdc:Chart>\n' + '</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");

			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChart2');

			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});
	QUnit.test("create multiple changes", function(assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function() {

			//create sample data, 'simulate' user action
			var aExistingArray = [
				{name: "Category", sortOrder: "Descending"},
				{name: "Price", sortOrder: "Ascending"},
				{name: "ProductID", sortOrder: "Descending"}
			];
			var fnSymbol;

			var aChangedArray = [
				{name: "Category", sortOrder: "Descending"},
				{name: "Price", sortOrder: "Ascending"},
				{name: "ProductID", sortOrder: "Ascending"},
				{name: "Depth", sortOrder: "Descending"},
				{name: "Name", sortOrder: "Ascending"}
			];

			fnSymbol = function (o) {
				return o.name + o.sortOrder;
			};
			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");
			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 4, "The correct amount of changes has been created");

			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeSort", "The first change is of type 'removeSort'");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, "ProductID", "The change includes the correct property");
			assert.strictEqual(aChanges[0].changeSpecificData.content.sortOrder, "Descending", "The change includes the correct property");

			assert.strictEqual(aChanges[1].changeSpecificData.changeType, "addSort", "The second change is of type 'addSort'");
			assert.strictEqual(aChanges[1].changeSpecificData.content.name, "ProductID", "The change includes the correct property");
			assert.strictEqual(aChanges[1].changeSpecificData.content.sortOrder, "Ascending", "The change includes the correct property");

			assert.strictEqual(aChanges[2].changeSpecificData.changeType, "addSort", "The third change is of type 'addSort'");
			assert.strictEqual(aChanges[2].changeSpecificData.content.name, "Depth", "The change includes the correct property");
			assert.strictEqual(aChanges[2].changeSpecificData.content.sortOrder, "Descending", "The change includes the correct property");

			assert.strictEqual(aChanges[3].changeSpecificData.changeType, "addSort", "The fourth change is of type 'addSort'");
			assert.strictEqual(aChanges[3].changeSpecificData.content.name, "Name", "The change includes the correct property");
			assert.strictEqual(aChanges[3].changeSpecificData.content.sortOrder, "Ascending", "The change includes the correct property");
			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {
				assert.strictEqual(this.oChart.data("$p13nSort"), '[\\{\"name\":\"ProductID\",\"index\":2,\"sortOrder\":\"Ascending\"},\\{\"name\":\"Depth\",\"index\":3,\"sortOrder\":\"Descending\"},\\{\"name\":\"Name\",\"index\":4,\"sortOrder\":\"Ascending\"}]', "The flex data has been stored successfully");
				done();
			}.bind(this));
		}.bind(this));
	});
	QUnit.module("Change handler for filtering with initial filter", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' + '\t\t  xmlns:core="sap.ui.core"\n' + '\t\t  xmlns:mdc="sap.ui.mdc"\n' + '\t\t  xmlns:state="sap.ui.mdc.base.state"\n' + '\t\t  xmlns="sap.m"\n' + '\t\t  xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">\n' + '\t\t\t\t<mdc:Chart id="IDChart" metadataDelegate="sap/ui/mdc/qunit/chart/Helper">\n' + '\t\t\t\t\t<mdc:uiState>\n' + '\t\t\t\t\t\t<state:UiState>\n' + '\t\t\t\t\t\t\t<state:selectOptions>\n' + '\t\t\t\t\t\t\t\t<state:SelectOption propertyName="Name"\n' + '\t\t\t\t\t\t\t\t\t\t\t\t\tcustomData:conditions=\'{conditions: [{operator:"Contains", isEmpty:null, values:["1001"]}]}\'/>\n' + '\t\t\t\t\t\t\t</state:selectOptions>\n' + '\t\t\t\t\t\t</state:UiState>\n' + '\t\t\t\t\t</mdc:uiState>\n' + '\t\t\t\t</mdc:Chart>\n' + '</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");

			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChart');

			this.oChart.oChartPromise.then(function(oVizChart) {
				var oCM = ConditionModel.getFor(oVizChart.getBinding("data"));
				this.oChart.setModel(oCM, "cmodel");
			}.bind(this));

			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});
	var ChangeHandlerFilter = ChartFlexibility.setFilterValue.changeHandler;
	QUnit.test('AddFilterValue 01', function(assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function() {
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, [
				{
					operator: "Contains",
					isEmpty: null,
					values: [
						"1001"
					]
				}
			]);

			// act apply
			var oChange00 = createChange(this.oUiComponent, this.oChart, ChangeHandlerFilter.createChange({
				control: this.oChart,
				key: "Name",
				conditions: [
					{
						operator: "Contains",
						values: [
							"4444"
						],
						isEmpty: null
					}
				]
			}));
			ChangeHandlerFilter.applyChange(oChange00, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, [
				{
					operator: "Contains",
					isEmpty: null,
					values: [
						"4444"
					]
				}
			]);
			var oChange01 = createChange(this.oUiComponent, this.oChart, ChangeHandlerFilter.createChange({
				control: this.oChart,
				key: "Name",
				conditions: [
					{
						operator: "Contains",
						values: [
							"5555"
						],
						isEmpty: null
					}
				]
			}));
			ChangeHandlerFilter.applyChange(oChange01, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, [
				{
					operator: "Contains",
					isEmpty: null,
					values: [
						"5555"
					]
				}
			]);
			// act revert
			ChangeHandlerFilter.revertChange(oChange01, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, [
				{
					operator: "Contains",
					isEmpty: null,
					values: [
						"4444"
					]
				}
			]);
			ChangeHandlerFilter.revertChange(oChange00, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, [
				{
					operator: "Contains",
					isEmpty: null,
					values: [
						"1001"
					]
				}
			]);

			done();
		}.bind(this));
	});
	QUnit.test('AddFilterValue 02', function(assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function() {
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, [
				{
					operator: "Contains",
					isEmpty: null,
					values: [
						"1001"
					]
				}
			]);

			// act apply
			var oChange00 = createChange(this.oUiComponent, this.oChart, ChangeHandlerFilter.createChange({
				control: this.oChart,
				key: "Name",
				conditions: []
			}));
			ChangeHandlerFilter.applyChange(oChange00, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, []);
			var oChange01 = createChange(this.oUiComponent, this.oChart, ChangeHandlerFilter.createChange({
				control: this.oChart,
				key: "Name",
				conditions: [
					{
						operator: "Contains",
						values: [
							"5555"
						],
						isEmpty: null
					}
				]
			}));
			ChangeHandlerFilter.applyChange(oChange01, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, [
				{
					operator: "Contains",
					isEmpty: null,
					values: [
						"5555"
					]
				}
			]);
			// act revert
			ChangeHandlerFilter.revertChange(oChange01, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, []);
			ChangeHandlerFilter.revertChange(oChange00, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, [
				{
					operator: "Contains",
					isEmpty: null,
					values: [
						"1001"
					]
				}
			]);

			done();
		}.bind(this));
	});

	QUnit.module("Change handler for filtering without initial filters", {
		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' + '\t\t  xmlns:core="sap.ui.core"\n' + '\t\t  xmlns:mdc="sap.ui.mdc"\n' + '\t\t  xmlns="sap.m">\n' + '\t\t\t\t<mdc:Chart id="IDChart" metadataDelegate="sap/ui/mdc/qunit/chart/Helper">\n' + '\t\t\t\t</mdc:Chart>\n' + '</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");

			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChart');

			this.oChart.oChartPromise.then(function(oVizChart) {
				var oCM = ConditionModel.getFor(oVizChart.getBinding("data"));
				this.oChart.setModel(oCM, "cmodel");
			}.bind(this));

			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});
	QUnit.test('AddFilterValue 01', function(assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function() {
			assert.strictEqual(this.oChart.getUiState(), null);

			// act apply
			var oChange = createChange(this.oUiComponent, this.oChart, ChangeHandlerFilter.createChange({
				control: this.oChart,
				key: "Name",
				conditions: [
					{
						operator: "Contains",
						values: [
							"4444"
						],
						isEmpty: null
					}
				]
			}));
			ChangeHandlerFilter.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.strictEqual(this.oChart.getUiState().getSelectOptions().length, 1);
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getPropertyName(), "Name");
			assert.strictEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions").length, 1);
			assert.deepEqual(this.oChart.getUiState().getSelectOptions()[0].getCustomData("conditions")[0].getValue().conditions, [
				{
					operator: "Contains",
					isEmpty: null,
					values: [
						"4444"
					]
				}
			]);

			// act revert
			ChangeHandlerFilter.revertChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.ok(this.oChart.getUiState());

			done();
		}.bind(this));
	});
});
