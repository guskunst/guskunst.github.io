/*** List Report actions ***/
sap.ui.define(
	["sap/ui/test/matchers/PropertyStrictEquals",
	 "sap/ui/test/matchers/AggregationFilled",
	 "sap/ui/test/actions/Press",
	 "sap/suite/ui/generic/template/integration/SalesOrderNoExtensions/utils/OpaDataStore"],

	function (PropertyStrictEquals, AggregationFilled, Press, OpaDataStore) {

		return function (prefix, viewName, viewNamespace) {

			return {
				/* BUTTON PRESS ON PAGE */
				iClickTheButton: function (buttonText) {
					console.log ( "OPA5::ListReportActions::iClickTheButton" + " viewName: " + viewName + "viewNamespace: " + viewNamespace);
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: viewName,
						viewNamespace: viewNamespace,
						matchers: [
							new PropertyStrictEquals({
								name: "text",
								value: buttonText
							})
						],
						actions: new Press(),
						errorMessage: "The button cannot be clicked"
					});
				},
				/* CLICK ON ITEM ON TABLE */
				iClickTheItemInTheTable: function(iIndex) {
					console.log ( "OPA5::ListReportActions::iClickTheItemInTheTable" + " iIndex: " + iIndex + " prefix: " + prefix + " viewName: " + viewName + " viewNamespace: " + viewNamespace);
					return this.iClickTheItemInAnyTable(iIndex, prefix, viewName, viewNamespace); // Common.js
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
				},
				/*******************************************
				 * WORKLIST FUNCTIONS
				 */
				iClickSmartTableSortButton: function() {
					var SortButton = null;
					return this.waitFor({
						controlType: "sap.m.Button",
						check: function(aButtons) {
							for (var i=0; i < aButtons.length; i++ ){
								var sIcon = aButtons[i].getIcon();
								if (sIcon === "sap-icon://sort") {
									SortButton = aButtons[i];
									return true;
								} else if (sIcon === "sap-icon://overflow") {
									aButtons[i].firePress();
									return false;
								}
							}
							return false;
						},
						success: function() {
							SortButton.firePress();
						},
						errorMessage: "Did not find the 'Sort' button."
					});
				},
				iClickSmartTableFilterButton: function() {
					var FilterButton = null;
					return this.waitFor({
						controlType: "sap.m.Button",
						check: function(aButtons) {
							for (var i=0; i < aButtons.length; i++ ){
								var sIcon = aButtons[i].getIcon();
								if (sIcon === "sap-icon://filter") {
									FilterButton = aButtons[i];
									return true;
								} else if (sIcon === "sap-icon://overflow") {
									aButtons[i].firePress();
									return false;
								}
							}
							return false;
						},
						success: function() {
							FilterButton.$().trigger("tap");
						},
						errorMessage: "Did not find the 'Filter' button."
					});
				},
				iClickSmartTableGroupButton: function() {
					var GroupButton = null;
					return this.waitFor({
						controlType: "sap.m.Button",
						check: function(aButtons) {
							for (var i=0; i < aButtons.length; i++ ){
								var sIcon = aButtons[i].getIcon();
								if (sIcon === "sap-icon://group-2") {
									GroupButton = aButtons[i];
									return true;
								} else if (sIcon === "sap-icon://overflow") {
									aButtons[i].firePress();
									return false;
								}
							}
							return false;
						},
						success: function() {
							GroupButton.$().trigger("tap");
						},
						errorMessage: "Did not find the 'Group' button."
					});
				},
				iClickSmartTableColumnSettingButton: function() {
					var ColumnSettingButton = null;
					return this.waitFor({
						controlType: "sap.m.Button",
						check: function(aButtons) {
							for (var i=0; i < aButtons.length; i++ ){
								var sIcon = aButtons[i].getIcon();
								if (sIcon === "sap-icon://action-settings") {
									ColumnSettingButton = aButtons[i];
									return true;
								} else if (sIcon === "sap-icon://overflow") {
									aButtons[i].firePress();
									return false;
								}
							}
							return false;
						},
						success: function() {
							ColumnSettingButton.$().trigger("tap");
						},
						errorMessage: "Did not find the 'Column Settings' button."
					});
				},
				iClickOnDialogButton: function (sButton) {
					var oButton = null;
					return this.waitFor({
						controlType: "sap.m.Button",
						check: function (aButtons) {
							for (var i = 0; i < aButtons.length; i++) {
								var sText = aButtons[i].getText();
								if (sText === sButton) {
									oButton = aButtons[i];
									return true;
								}
							}
							return false;
						},
						success: function () {
							oButton.$().trigger("tap");
						},
						errorMessage: "Did not find the " + sButton + " Button."
					});
				},
				iSetTheSearchField: function (sSearchText) {
					var oSearchField = null;
					return this.waitFor({
						controlType: "sap.m.SearchField",
						actions: function (oControl) {
							oControl.setValue(sSearchText);
							oControl.fireSearch();
							ok(true, "Table has search field in toolbar");
						},
						//actions: new Press(),
						errorMessage: "Search field not found"
					});
				}
			};
		};
});
