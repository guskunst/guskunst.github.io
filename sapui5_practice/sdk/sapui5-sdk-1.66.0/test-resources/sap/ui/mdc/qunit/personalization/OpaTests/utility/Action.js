/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/actions/EnterText",
	"test-resources/sap/ui/mdc/qunit/personalization/OpaTests/utility/Util",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, Press,  Properties, Ancestor, EnterText, TestUtil, PropertyStrictEquals) {
	"use strict";

	/**
	 * The Action can be used to...
	 *
	 * @class Action
	 * @extends sap.ui.test.Opa5
	 * @author SAP
	 * @private
	 * @alias sap.ui.mdc.qunit.personalization.test.Action
	 */
	var Action = Opa5.extend("sap.ui.mdc.qunit.personalization.test.Action", {

		iLookAtTheScreen: function() {
			return this;
		},

		iPressOnButtonWithIcon: function(sIcon) {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: sIcon
				}),
				actions: new Press()
			});
		},
		iSelectColumn: function(sColumnName, sPopoverTitle) {
			return this.waitFor({
				controlType: "sap.m.ResponsivePopover",
				matchers: new PropertyStrictEquals({
					name: "title",
					value: sPopoverTitle
				}),
				success: function() {
					return this.waitFor({
						controlType: "sap.m.CheckBox",
						success: function(aCheckBoxes) {
							return aCheckBoxes.some(function(oCheckBox) {
								var oItem = oCheckBox.getParent();
								if (oItem.getCells) {
									var oText = oItem.getCells()[0];
									if (oText.getText() === sColumnName) {
										oCheckBox.$().trigger("tap");
										return true;

									}
								}
							});
						}
					});
				}
			});
		},
		iClickOnListItem:function (sItemText) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.StandardListItem",
				matchers: new PropertyStrictEquals({
					name: "title",
					value: sItemText
				}),
				actions: new Press()
			});
		},
		iSelectVariant: function(sVariantName) {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				check: function(aVariantManagements) {
					return !!aVariantManagements.length;
				},
				actions: new Press(),
				success: function(aVariantManagements) {
					Opa5.assert.equal(aVariantManagements.length, 1, "VariantManagement found");
					// var aVariantItem = aSmartVariantManagements[0].getVariantItems().filter(function(oVariantItem) {
					// return oVariantItem.getText() === sVariantName;
					// });
					// Opa5.assert.equal(aVariantItem.length, 1, "Variant '" + sVariantName + "' found");
					this.waitFor({
						controlType: "sap.ui.core.Item",
						matchers: [
							new Ancestor(aVariantManagements[0]), new Properties({
								text: sVariantName
							})
						],
						actions: new Press(),
						errorMessage: "Cannot select '" + sVariantName + "' from VariantManagement"
					});
				},
				errorMessage: "Could not find VariantManagement"
			});
		},
		iSaveVariantAs: function(sVariantNameOld, sVariantNameNew) {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				check: function(aVariantManagements) {
					return !!aVariantManagements.length;
				},
				// matchers: new PropertyStrictEquals({
				// 	name: "defaultVariantKey",
				// 	value: "*standard*"
				// }),
				actions: new Press(),
				success: function(aVariantManagements) {
					Opa5.assert.equal(aVariantManagements.length, 1, "VariantManagement found");
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_SAVEAS")
						}),
						actions: new Press(),
						success: function(aButtons) {
							Opa5.assert.equal(aButtons.length, 1, "'Save As' button found");
							this.waitFor({
								controlType: "sap.m.Input",
								matchers: new PropertyStrictEquals({
									name: "value",
									value: sVariantNameOld
								}),
								actions: new EnterText({
									text: sVariantNameNew
								}),
								success: function(aInputs) {
									Opa5.assert.ok(aInputs[0].getValue() === sVariantNameNew, "Input value is set to '" + sVariantNameNew + "'");
									this.waitFor({
										controlType: "sap.m.Button",
										matchers: new PropertyStrictEquals({
											name: "text",
											value: TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_SAVE")
										}),
										actions: new Press(),
										success: function(aButtons) {
											Opa5.assert.equal(aButtons.length, 1, "'OK' button found");
										}
									});
								}
							});
						},
						errorMessage: "Cannot find 'Save As' button on VariantManagement"
					});
				},
				errorMessage: "Could not find VariantManagement"
			});
		}
	});

	return Action;
}, true);
