sap.ui.require([
		'jquery.sap.global',
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/AggregationLengthEquals',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/rules/ui/integration/pages/Common',
		'sap/ui/test/matchers/BindingPath',
		"sap/ui/test/actions/EnterText",
		"sap/ui/test/actions/Press",
		'sap/ui/test/matchers/AggregationContainsPropertyEqual',
		'sap/ui/test/matchers/AggregationFilled'
	],
	function(jQuery, Opa5, AggregationLengthEquals, PropertyStrictEquals, Common, BindingPath, EnterText, Press,
		AggregationContainsPropertyEqual, AggregationFilled) {
		"use strict";

		var PressObject = (function() {
			var oPress;

			function createPress() {
				var newPress = new Press();
				return newPress;
			}
			return {
				getPressInstance: function() {
					if (!oPress) {
						oPress = createPress();
					}
					return oPress;
				}
			};
		})();

		Opa5.extendConfig({
			timeout: 20,
			pollingInterval: 100
		});

		Opa5.createPageObjects({
			onTextRulePage: {
				baseClass: Common,
				actions: {
					iClickTheSettingButton: function(successMessage, controlType, sViewName) {
						return this.waitFor({
							controlType: controlType,
							viewName: sViewName,
							matchers: function(oToolbar) {
								return new AggregationContainsPropertyEqual({
									aggregationName: "content",
									propertyName: "icon",
									propertyValue: "sap-icon://action-settings"
								}).isMatching(oToolbar);
							},
							success: function(oToolbar) {
								var oPlusButton = oToolbar[0].getAggregation("content")[2];
								jQuery(oPlusButton.getDomRef()).trigger("tap");
								Opa5.assert.ok(true, successMessage);
							},
							errorMessage: "Can't find the settings button"
						});
					},

					iClickButton: function(successMessage, viewName, text, index) {
						return this.waitFor({
							controlType: "sap.m.Button",
							viewName: viewName,
							matchers: new sap.ui.test.matchers.PropertyStrictEquals({
								name: "text",
								value: text
							}),
							success: function(oButton) {
								jQuery(oButton[index].getDomRef()).trigger("tap");
								Opa5.assert.ok(true, successMessage);
							},
							errorMessage: "Button is not present"
						});
					}

				},
				assertions: {

					iCanSeeTextRuleWithData: function(successMessage, sViewName, sRulePath) {
						return this.waitFor({
							controlType: "sap.rules.ui.TextRule",
							viewName: sViewName,
							matchers: function(oTextRule) {
								var bTextRuleBusy = oTextRule._internalModel.getProperty("/busyState");
								var bverticalLayoutBusy = oTextRule._internalModel.getProperty("/busyVerticalLayoutState");
								var textRuleReady = !bTextRuleBusy && !bverticalLayoutBusy;
								return textRuleReady;
							},
							success: function(oTextRule) {
								Opa5.assert.ok(true, successMessage);
							},
							errorMessage: "Couldn't load TextRule"
						});
					},

					iCanSeeConditionBlock: function(text, index, isCondition) {
						return this.waitFor({
							controlType: "sap.m.Panel",
							success: function(oPanels) {
								if (!isCondition && oPanels[index].getHeaderText()) {
									if (oPanels[index].getHeaderText() == text) {
										Opa5.assert.ok(true, text + "Block is found");
									}
								} else if (isCondition && oPanels[index].getHeaderToolbar()) {
									var title = oPanels[index].getHeaderToolbar().getTitleControl().getText();
									if (title === text) {
										Opa5.assert.ok(true, text + "Block is found");
									}
								}

							},
							errorMessage: text + "Block not found"
						});
					},

					iCanSeeConditionText: function(successMessage, viewName, text) {
						return this.waitFor({
							controlType: "sap.rules.ui.ExpressionAdvanced",
							viewName: viewName,
							matchers: function(oExpressionAdvanced) {
								var sActualValue = oExpressionAdvanced.getValue();
								return sActualValue == text;
							},
							success: function() {
								Opa5.assert.ok(true, successMessage);
							},
							errorMessage: "If block does not have the correct condition"
						});
					},

					iCanSeeResultAttribute: function(successMessage, viewName, label) {
						return this.waitFor({
							controlType: "sap.m.Label",
							viewName: viewName,
							matchers: new sap.ui.test.matchers.PropertyStrictEquals({
								name: "text",
								value: label
							}),
							success: function() {
								Opa5.assert.ok(true, successMessage);
							},
							errorMessage: "Result attribute is not present"
						});
					},

					iSeeButton: function(successMessage, viewName, text) {
						return this.waitFor({
							controlType: "sap.m.Button",
							viewName: viewName,
							matchers: new sap.ui.test.matchers.PropertyStrictEquals({
								name: "text",
								value: text
							}),
							success: function() {
								Opa5.assert.ok(true, successMessage);
							},
							errorMessage: "Button is not present"
						});
					}

				}
			}
		});
	});