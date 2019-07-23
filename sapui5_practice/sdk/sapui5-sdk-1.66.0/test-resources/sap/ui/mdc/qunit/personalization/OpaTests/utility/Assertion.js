/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor"
], function(Opa5, PropertyStrictEquals, Properties, Ancestor) {
	"use strict";

	/**
	 * The Assertion can be used to...
	 *
	 * @class Assertion
	 * @extends sap.ui.test.Opa5
	 * @author SAP
	 * @private
	 * @alias sap.ui.mdc.qunit.personalization.test.Assertion
	 */
	var Assertion = Opa5.extend("sap.ui.mdc.qunit.personalization.test.Assertion", {
		iShouldSeeButtonWithIcon: function(sIcon) {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new sap.ui.test.matchers.PropertyStrictEquals({
					name: "icon",
					value: sIcon
				}),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "One button found");
					Opa5.assert.equal(aButtons[0].getIcon(), sIcon, "The button " + sIcon + " found.");
				}
			});
		},
		iShouldSeeVisibleDimensionsInOrder: function(aOrderedDimensionNames) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getVisibleDimensions().length === aOrderedDimensionNames.length;
				},
				success: function() {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getVisibleDimensions().length, aOrderedDimensionNames.length, "Chart contains " + aOrderedDimensionNames.length + " visible dimensions");
					aDomElements[0].getVisibleDimensions().forEach(function(sDimension, iIndex) {
						var oDimension = aDomElements[0].getDimensionByName(sDimension);
						var sDimensionName = oDimension.getLabel() || oDimension.getName();
						Opa5.assert.equal(sDimensionName, aOrderedDimensionNames[iIndex], "Dimension '" + sDimensionName + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},
		iShouldSeeVisibleMeasuresInOrder: function(aOrderedMeasureNames) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getVisibleMeasures().length === aOrderedMeasureNames.length;
				},
				success: function() {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getVisibleMeasures().length, aOrderedMeasureNames.length, "Chart contains " + aOrderedMeasureNames.length + " visible measures");
					aDomElements[0].getVisibleMeasures().forEach(function(sMeasure, iIndex) {
						var oMeasure = aDomElements[0].getMeasureByName(sMeasure);
						var sMeasureName = oMeasure.getLabel() || oMeasure.getName();
						Opa5.assert.equal(sMeasureName, aOrderedMeasureNames[iIndex], "Measure '" + sMeasureName + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},
		iShouldSeeChartOfType: function(sChartTypeKey) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getChartType() === sChartTypeKey;
				},
				success: function() {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getChartType(), sChartTypeKey, "The chart type of the Chart is '" + sChartTypeKey + "'");
				}
			});
		},
		thePersonalizationDialogOpens: function() {
			return this.waitFor({
				controlType: "sap.m.ResponsivePopover",
				check: function(aDialogs) {
					return aDialogs.length > 0;
				},
				success: function(aDialogs) {
					Opa5.assert.ok(aDialogs.length, 'Personalization Dialog should be open');
				}
			});
		},
		iShouldSeeDialogTitle: function(sText) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Title",
				matchers: [
					new sap.ui.test.matchers.PropertyStrictEquals({
						name: "text",
						value: sText
					}), new sap.ui.test.matchers.PropertyStrictEquals({
						name: "level",
						value: "H2"
					})
				],
				success: function(aTitle) {
					Opa5.assert.equal(aTitle.length, 1, "Title found");
				},
				errorMessage: "sap.m.Title not found"
			});
		},
		iShouldSeeItemOnPosition: function(sItemText, iIndex) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aTables) {
					var aItems = aTables[0].getItems().filter(function(oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0]);
					Opa5.assert.equal(aItems[0].getVisible(), true);
					Opa5.assert.equal(aTables[0].getItems().indexOf(aItems[0]), iIndex, sItemText + " is on position " + iIndex);
				}
			});
		},
		iShouldSeeEnabledSelectControl: function(sText, bEnabled) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Select",
				success: function(aSelects) {
					var oSelect;
					for (var i = 0; i < aSelects.length; i++) {
						if (aSelects[i].getParent().getCells()[0].getText() == sText) {
							oSelect = aSelects[i];
						}
					}
					Opa5.assert.equal(oSelect.getEnabled(), bEnabled, "The property 'enabled' for the Select control in the the table item " + oSelect.getParent().getCells()[0].getText() + ", is set to " + bEnabled);
				}
			});
		},
		iShouldSeeListItemOnPosition: function(sItemText, iIndex) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.List",
				success: function(aLists) {
					var aItems = aLists[0].getItems().filter(function(oItem) {
						return oItem.getTitle() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0]);
					Opa5.assert.equal(aItems[0].getVisible(), true);
					Opa5.assert.equal(aLists[0].getItems().indexOf(aItems[0]), iIndex, sItemText + " is on position " + iIndex);
				}
			});
		},
		iShouldSeeItemWithSelection: function(sItemText, bSelected) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aTables) {
					var aItems = aTables[0].getItems().filter(function(oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0]);
					Opa5.assert.equal(aItems[0].getVisible(), true);
					Opa5.assert.equal(aItems[0].getSelected(), bSelected, sItemText + " is " + (bSelected ? "selected" : "unselected"));
				}
			});
		},
		thePersonalizationDialogShouldBeClosed: function() {
			var aDomDialogs;
			return this.waitFor({
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnDialog = frameJQuery.sap.getObject('sap.m.ResponsivePopover');
					aDomDialogs = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnDialog);
					return !aDomDialogs.length;
				},
				success: function() {
					Opa5.assert.ok(!aDomDialogs.length, "The personalization dialog is closed");
				}
			});
		},
		theVariantManagementIsDirty: function(bIsDirty) {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				matchers: new PropertyStrictEquals({
					name: "modified",
					value: bIsDirty
				}),
				success: function(aVariantManagements) {
					Opa5.assert.equal(aVariantManagements.length, 1, "Dirty VariantManagement found");
				},
				errorMessage: "Could not find dirty VariantManagement"
			});
		},
		iShouldSeeSelectedVariant: function(sVariantName) {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				check: function(aVariantManagements) {
					return !!aVariantManagements.length;
				},
				success: function(aVariantManagements) {
					Opa5.assert.equal(aVariantManagements.length, 1, "VariantManagement found");
					this.waitFor({
						controlType: "sap.m.Title",
						matchers: [
							new Ancestor(aVariantManagements[0]), new Properties({
								text: sVariantName
							})
						],
						success: function(aItems) {
							Opa5.assert.equal(aItems.length, 1, "Variant '" + sVariantName + "' found");
						},
						errorMessage: "Could not find core item with text " + sVariantName
					});
				},
				errorMessage: "Could not find VariantManagement"
			});
		},
		iShouldSeeVisibleColumnsInOrder: function(sColumnType, aOrderedColumnNames) {
			return this.waitFor({
				visible: false,
				controlType: sColumnType,
				check: function(aExistingColumns) {
					return aExistingColumns.length === aOrderedColumnNames.length;
				},
				success: function(aExistingColumns) {
					Opa5.assert.equal(aOrderedColumnNames.length, aExistingColumns.length);
					aExistingColumns.forEach(function(oColumn, iIndex) {
						var sName = oColumn.getDataProperties()[0];
						Opa5.assert.equal(sName, aOrderedColumnNames[iIndex], "Column '" + aOrderedColumnNames[iIndex] + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		}
	});
	return Assertion;
}, true);
