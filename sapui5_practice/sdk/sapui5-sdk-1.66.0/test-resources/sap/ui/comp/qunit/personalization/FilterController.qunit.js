/* global QUnit*/
QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/comp/personalization/FilterController',
	'sap/ui/comp/personalization/Controller',
	'sap/chart/library',
	'sap/chart/Chart',
	'sap/ui/model/Filter',
	'sap/ui/table/Table',
	'sap/ui/table/Column',
	'sap/m/Table',
	'sap/m/Column',
	'sap/m/Label',
	'sap/ui/model/json/JSONModel',
	'sap/m/ColumnListItem',
	'sap/ui/core/CustomData',
	'sap/chart/data/Dimension',
	'sap/chart/data/Measure',
	'sap/ui/comp/personalization/ChartWrapper',
	'sap/base/util/merge'

], function(
	FilterController,
	Controller,
	chartLibrary,
	Chart,
	Filter,
	UiTable,
	UiColumn,
	MTable,
	MColumn,
	Label,
	JSONModel,
	ColumnListItem,
	CustomData,
	Dimension,
	Measure,
	ChartWrapper,
	merge
) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/comp");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	var oEmpty = {
		filter: {
			filterItems: []
		}
	};
	var oA = {
		filter: {
			filterItems: [
				{
					columnKey: "name",
					operation: "Contains",
					value1: "A"
				}
			]
		}
	};
	var oAx = {
		filter: {
			filterItems: [
				{
					columnKey: "name",
					operation: "Contains",
					value1: "B"
				}
			]
		}
	};
	var oB = {
		filter: {
			filterItems: [
				{
					columnKey: "country",
					operation: "Contains",
					value1: "A"
				}
			]
		}
	};
	var oAB = {
		filter: {
			filterItems: [
				{
					columnKey: "name",
					operation: "Contains",
					value1: "A"
				}, {
					columnKey: "country",
					operation: "Contains",
					value1: "A"
				}
			]
		}
	};
	var oBA = {
		filter: {
			filterItems: [
				{
					columnKey: "country",
					operation: "Contains",
					value1: "A"
				}, {
					columnKey: "name",
					operation: "Contains",
					value1: "A"
				}
			]
		}
	};
	var addFilterProperty = function(oTable, aColumns) {
		if (oTable instanceof UiTable) {
			var oBinding = oTable.getBinding("rows");
			var aFilters = [];
			aColumns.forEach(function(oColumn) {
				oColumn.setFilterProperty(oColumn.getId());
				aFilters.push(new Filter(oColumn.getFilterProperty(), "BT", "A", "B"));
				oColumn.setFiltered(true);
			});
			oBinding.filter(aFilters);
		} else if (oTable instanceof MTable) {
			aColumns.forEach(function(oColumn) {
				var oP13nData = oColumn.data("p13nData");
				oP13nData.filterProperty = oP13nData.columnKey;
			});
		}
	};

	var createTable = function(sTableType, oData) {
		oData = oData || {
			items: [
				{
					"date": "2/5/1982",
					"number": 103,
					"city": "McDermotttown",
					"country": "Svalbard and Jan Mayen",
					"name": "Mary"
				}
			],
			columns: [
				{
					id: "name",
					text: "Name",
					path: "name"
				}, {
					id: "country",
					text: "Country",
					path: "country"
				}, {
					id: "city",
					text: "City",
					path: "city"
				}
			]
		};
		var oTable = null;
		if (sTableType === "UITable") {
			oTable = new UiTable('testUITable', {
				columns: oData.columns.map(function(oModelColumn) {
					return new UiColumn(oModelColumn.id, {
						label: new Label({
							text: oModelColumn.text
						}),
						template: new Label({
							text: {
								path: oModelColumn.path
							}
						})
					});
				})
			});
			oTable.setModel(new JSONModel());
			oTable.bindRows("/items");
		} else if (sTableType === "MTable") {
			oTable = new MTable("testMTable", {
				columns: oData.columns.map(function(oModelColumn) {
					return new MColumn(oModelColumn.id, {
						header: new Label({
							text: oModelColumn.text
						}),
						customData: new CustomData({
							key: "p13nData",
							value: {
								columnKey: oModelColumn.path
							}
						})
					});
				})
			});
			oTable.setModel(new JSONModel());
			oTable.bindAggregation("items", "/items", new ColumnListItem({
				cells: oData.columns.map(function(oModelColumn) {
					return new Label({
						text: oModelColumn.text
					});
				})
			}));
		} else if (sTableType === "Chart") {
			var oChart = new Chart("testChart", {
				width: '100%',
				isAnalytical: true,
				uiConfig: {
					applicationSet: 'fiori'
				},
				chartType: chartLibrary.ChartType.Column,
				selectionMode: chartLibrary.SelectionMode.Single,
				visibleDimensions: [
					"name", "city"
				],
				visibleMeasures: [
					"number", "date"
				],
				dimensions: oData.columns.filter(function(oModelColumn) {
					return oModelColumn.aggregationRole === "dimension";
				}).map(function(oModelColumn) {
					var oColumn = new Dimension({
						label: oModelColumn.text,
						name: oModelColumn.path
					});
					oColumn.data("p13nData", {
						columnKey: oModelColumn.path
					});
					return oColumn;
				}),
				measures: oData.columns.filter(function(oModelColumn) {
					return oModelColumn.aggregationRole === "measure";
				}).map(function(oModelColumn) {
					var oColumn = new Measure({
						label: oModelColumn.text,
						name: oModelColumn.path
					});
					oColumn.data("p13nData", {
						columnKey: oModelColumn.path
					});
					return oColumn;
				})
			});
			var aNotDimeasure = oData.columns.filter(function(oModelColumn) {
				return oModelColumn.aggregationRole !== "dimension" && oModelColumn.aggregationRole !== "measure";
			}).map(function(oModelColumn) {
				return {
					columnKey: oModelColumn.path,
					leadingProperty: oModelColumn.path,
					sortProperty: true,
					filterProperty: true,
					label: oModelColumn.text,
					tooltip: oModelColumn.text
				};
			});

			oChart.setModel(new JSONModel());
			oTable = ChartWrapper.createChartWrapper(oChart, aNotDimeasure, [
				"name", "country", "city"
			]);
		}
		return oTable;
	};

	var getSettingFor = function(aTypes) {
		var oSetting = merge({}, {
			columns: {
				visible: false
			},
			group: {
				visible: false
			},
			filter: {
				visible: false
			},
			sort: {
				visible: false
			},
			dimeasure: {
				visible: false
			}
		});
		aTypes.forEach(function(sType) {
			oSetting[sType].visible = true;
		});
		return oSetting;
	};
	QUnit.module("API", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("getChangeData", function(assert) {
		var oFilterController;
		try {
			// system under test
			oFilterController = new FilterController();

			// arrange

			// act

			// assertions

			assert.deepEqual(oFilterController.getChangeData(oEmpty, oA), oEmpty, "delete: [] XOR A = []");
			assert.deepEqual(oFilterController.getChangeData({}, oA), oEmpty, "");
			assert.deepEqual(oFilterController.getChangeData(oA, oA), null, "no change: A XOR A = null");
			assert.deepEqual(oFilterController.getChangeData(oA, {
				filter: {}
			}), oA, "change: A XOR {filter} = A");
			assert.deepEqual(oFilterController.getChangeData(oA, {}), oA, "change: A XOR {} = A");
			assert.deepEqual(oFilterController.getChangeData(oA, null), oA, "change: A XOR null = A");
			assert.deepEqual(oFilterController.getChangeData(oA, oB), oA, "change: A XOR B = A");
			assert.deepEqual(oFilterController.getChangeData(oA, oAx), oA, "change: A XOR A' = A");
			assert.deepEqual(oFilterController.getChangeData(oA, oAB), oA, "change: A XOR (A, B) = A");
			assert.deepEqual(oFilterController.getChangeData(oA, {
				filter: {
					filterItems: []
				}
			}), oA, "change: A XOR [] = A");
			assert.deepEqual(oFilterController.getChangeData(oAx, oA), oAx, "change: A' XOR A = A'");
			assert.deepEqual(oFilterController.getChangeData(oAB, oAB), null, "no change: (A, B) XOR (A, B) = null");
			assert.deepEqual(oFilterController.getChangeData(oAB, oBA), oAB, "change: (A, B) XOR (B, A) = (A, B)");
		} finally {
			// cleanup
			oFilterController.destroy();
		}
	});

	QUnit.test("getChangeType", function(assert) {
		// system under test
		var oFilterController = new FilterController();

		// arrange

		// act

		// assertions

		assert.ok(oFilterController.getChangeType(oEmpty, oA));

		// cleanup
		oFilterController.destroy();
	});

	QUnit.test("getChangeType", function(assert) {
		// system under test
		var oFilterController = new FilterController();

		// arrange

		// act

		// assertions

		assert.ok(oFilterController.getChangeType(oEmpty, null));

		// cleanup
		oFilterController.destroy();
	});

	QUnit.test("getPanel - with filterable columns", function(assert) {
		// system under test
		var oTable = createTable("UITable");
		addFilterProperty(oTable, [
			oTable.getColumns()[0]
		]);
		var oController = new Controller({
			table: oTable,
			setting: getSettingFor([
				"filter"
			])
		});
		var oFilterController = oController._oSettingCurrent.filter.controller;

		// arrange

		// act

		// assertions
		assert.ok(oFilterController.getPanel());

		// cleanup
		oTable.destroy();
		oFilterController.destroy();
		oController.destroy();
	});

	QUnit.test("getPanel - without filterable columns", function(assert) {
		// system under test
		var oTable = createTable("UITable");
		var oController = new Controller({
			table: oTable,
			setting: getSettingFor([
				"filter"
			])
		});
		var oFilterController = oController._oSettingCurrent.filter.controller;

		// arrange

		// act

		// assertions
		assert.ok(!oFilterController.getPanel());

		// cleanup
		oTable.destroy();
		oFilterController.destroy();
		oController.destroy();
	});

	QUnit.test("syncJson2Table - filter is set to first column", function(assert) {
		// system under test
		var oTable = createTable("UITable");
		var oController = new Controller({
			table: oTable,
			setting: getSettingFor([
				"filter"
			])
		});
		var oFilterController = oController._oSettingCurrent.filter.controller;

		// arrange

		// act
		oFilterController.syncJson2Table({
			filter: {
				filterItems: [
					{
						columnKey: "name"
					}
				]
			}
		});

		// assertions
		assert.ok(oTable.getColumns()[0].getFiltered());

		// cleanup
		oTable.destroy();
		oFilterController.destroy();
		oController.destroy();
	});

	QUnit.test("syncJson2Table - table with 1. column as filterable -> filter is set to 3. column", function(assert) {
		// system under test
		var oTable = createTable("UITable");
		addFilterProperty(oTable, [
			oTable.getColumns()[0]
		]);
		var oController = new Controller({
			table: oTable,
			setting: getSettingFor([
				"filter"
			])
		});
		var oFilterController = oController._oSettingCurrent.filter.controller;

		// arrange

		// act
		oFilterController.syncJson2Table({
			filter: {
				filterItems: [
					{
						columnKey: "city"
					}
				]
			}
		});

		// assertions
		assert.ok(!oTable.getColumns()[0].getFiltered());
		assert.ok(oTable.getColumns()[2].getFiltered());

		// cleanup
		oTable.destroy();
		oFilterController.destroy();
		oController.destroy();
	});

	var fTest10 = function(sTableType, assert) {
		// system under test
		var oTable = createTable(sTableType);
		var oChart = sTableType === "Chart" ? oTable.getChartObject() : null;
		addFilterProperty(oTable, [
			oTable.getColumns()[0]
		]);
		var oController = new Controller({
			table: oTable,
			setting: getSettingFor([
				"filter"
			])
		});

		// arrange

		// act
		var oJson = oController._oSettingCurrent.filter.controller.getTable2Json(oController._oSettingCurrent.filter.controller.createColumnKeysStructure(oController.getColumnKeys()));

		// assertions
		assert.ok(oJson);

		// cleanup
		oController.destroy();
		oTable.destroy();
		if (oChart) {
			oChart.destroy();
		}

	};
	QUnit.test("setTable (UITable)", function(assert) {
		fTest10("UITable", assert);
	});
	QUnit.test("setTable (MTable)", function(assert) {
		fTest10("MTable", assert);
	});
	QUnit.test("setTable (Chart)", function(assert) {
		fTest10("Chart", assert);
	});

	QUnit.start();

});