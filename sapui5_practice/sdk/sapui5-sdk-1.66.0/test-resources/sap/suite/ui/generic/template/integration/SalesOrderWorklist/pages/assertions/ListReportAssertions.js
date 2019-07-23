/*** List Report assertions ***/
sap.ui.define(
	["sap/ui/test/matchers/PropertyStrictEquals",
	 "sap/ui/test/matchers/AggregationFilled",
	 "sap/suite/ui/generic/template/integration/SalesOrderSegButtons/utils/OpaResourceBundle",
	 "sap/suite/ui/generic/template/integration/SalesOrderSegButtons/utils/OpaModel",
	 "sap/suite/ui/generic/template/integration/SalesOrderSegButtons/utils/OpaManifest",
	 "sap/suite/ui/generic/template/integration/SalesOrderSegButtons/utils/OpaDataStore"],

	function (PropertyStrictEquals, AggregationFilled, OpaResourceBundle, OpaModel, OpaManifest, OpaDataStore) {

	return function (prefix, viewName, viewNamespace, entityType, entitySet) {

		return {
			theSmartTableIsVisible: function() {
				console.log ( "OPA5::ListReportAssertions::theSmartTableIsVisible ");
				return this.waitFor({
					controlType: "sap.ui.comp.smarttable.SmartTable",
					success: function() {
						QUnit.ok(true, "The Smart Table is shown correctly on the List Report");
					},
					errorMessage: "The Smart Table couldn´t be found on the List Report"
				});
			},

			theSalesOrdersAreLoadedInTheSmartTable: function() {
				console.log ( "OPA5::ListReportAssertions::theSalesOrdersAreLoadedInTheSmartTable ");
				return this.waitFor({
					controlType: "sap.m.Table",
					matchers: [
						new AggregationFilled({
							name: "items"
						}), function(oTable) {
							var oContext;
							if (oTable.getItems()[0]) {
								oContext = oTable.getItems()[0].getBindingContext();
							}
							return !!oContext;
						}
					],
					success: function(oTable) {
						var oFirstItem = oTable[0].getItems()[0].getBindingContext().getPath();
						firstProduct = oTable[0].getItems()[0].getBindingContext().getObject(oFirstItem);
						QUnit.notEqual(oTable[0].getItems().length, 0, "Sales Orders are loaded in the Smart Table");
					},
					errorMessage: "Sales Orders were not loaded into the Smart Table"
				});
			},

			/************************************************
			 * WORKLIST FUNCTIONS
			 */
			// check the sort button for responsive table in table header
			theSmartTableHasASortButton: function () {
				var SortButton = null;
				return this.waitFor({
					controlType: "sap.m.Button",
					check: function (aButtons) {
						return aButtons.filter(function (oButton) {
							if (oButton.getIcon() !== "sap-icon://sort") {
								return false;
							}
							SortButton = oButton;
							return true;
						});
					},
					success: function () {
						QUnit.ok(true, "The page has a sort button.");
					},
					errorMessage: "The page has no sort button."
				});
			},

			// check the sort button for responsive table in table header
			theSmartTableHasAColumnSettingButton: function () {
				var ColumnSettingButton = null;
				return this.waitFor({
					controlType: "sap.m.Button",
					check: function (aButtons) {
						return aButtons.filter(function (oButton) {
							if (oButton.getIcon() !== "sap-icon://action-settings") {
								return false;
							}
							ColumnSettingButton = oButton;
							return true;
						});
					},
					success: function () {
						QUnit.ok(true, "The page has a column setting button.");
					},
					errorMessage: "The page has no column setting button."
				});
			},

			// check the sort button for responsive table in table header
			theSmartTableHasAGroupButton: function () {
				var GroupButton = null;
				return this.waitFor({
					controlType: "sap.m.Button",
					check: function (aButtons) {
						return aButtons.filter(function (oButton) {
							if (oButton.getIcon() !== "sap-icon://group-2") {
								return false;
							}
							GroupButton = oButton;
							return true;
						});
					},
					success: function () {
						QUnit.ok(true, "The page has a group button.");
					},
					errorMessage: "The page has no group button."
				});
			},

			// check the sort button for responsive table in table header
			theSmartTableHasAFilterButton: function () {
				var FilterButton = null;
				return this.waitFor({
					controlType: "sap.m.Button",
					check: function (aButtons) {
						return aButtons.filter(function (oButton) {
							if (oButton.getIcon() !== "sap-icon://filter") {
								return false;
							}
							FilterButton = oButton;
							return true;
						});
					},
					success: function () {
						QUnit.ok(true, "The page has a filter button.");
					},
					errorMessage: "The page has no filter button."
				});
			},

			// check the settings actions button
			theSmartTableHasViewSettingsDialogOpen: function (dialogTitle) {
				return this.waitFor({
					controlType: "sap.m.P13nDialog",
					matchers: new sap.ui.test.matchers.PropertyStrictEquals({
						name: "title",
						value: dialogTitle
					}),
					success: function (oTitle) {
						QUnit.ok(true, "Sorting Dialog opened with a title");
					},
					errorMessage: "Sorting Dialog not opened with a title."
				});
			}


		}
	};
});
