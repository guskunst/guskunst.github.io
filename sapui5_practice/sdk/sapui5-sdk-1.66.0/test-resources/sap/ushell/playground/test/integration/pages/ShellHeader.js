sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/matchers/AggregationContainsPropertyEqual",
    "sap/ui/test/matchers/AggregationLengthEquals",
    "./Common"
], function (Opa5, AggregationContainsPropertyEqual, AggregationLengthEquals, Common) {
    "use strict";

    var fnSeeTheNumberOfItems = function (sText, nNumber) {
        return this.waitFor({
            controlType: "sap.ushell.ui.shell.ShellHeader",
            matchers: new AggregationLengthEquals({
                name: sText,
                length: nNumber
            }),
            success: function () {
                Opa5.assert.ok(true, "The control has " + nNumber + ' ' + sText + ".");
            },
            errorMessage: "No " + sText + " was not found."
        });
    };

    var fnShouldSeeTheTitle = function (sTitle, sText) {
        return this.waitFor({
            controlType: "sap.ushell.ui.shell.ShellHeader",
            matchers: new AggregationContainsPropertyEqual({
                aggregationName: sTitle,
                propertyName: "text",
                propertyValue: sText
            }),
            success: function () {
                Opa5.assert.ok(true, "The " + sTitle + " with the text " + sText + " was found.");
            },
            errorMessage: "The" + sTitle + " with the text " + sText + " was not found."
        });
    };

    Opa5.createPageObjects({
        onTheShellHeaderPlayground: {
            baseClass: Common,
            actions: {
                iTurnOnTheShellHeaderSwitch: function () {
                    return this.iTurnOnTheSwitchWithLabelFor("Shell Header");
                },
                iTurnOnTheLogoSwitch: function () {
                    return this.iTurnOnTheSwitchWithLabelFor("Logo");
                },
                iSelectALogo: function () {
                    return this.iSelectAnItemInASelectControl("shell-header-icon-select", "Logo-1-SH");
                },
                iPressTheHeadItemAddButton: function () {
                    return this.iPressTheButtonWithLabelFor("Head Item");
                },
                iPressTheHeadEndItemAddButton: function () {
                    return this.iPressTheButtonWithLabelFor("Head End Item");
                },
                iPressTheHeadItemRemoveButton: function () {
                    return this.iPressTheButtonWithId("HI-RM-BTN");
                },
                iPressTheHeadEndItemRemoveButton: function () {
                    return this.iPressTheButtonWithId("HEI-RM-BTN");
                },
                iInputAShellTitle: function () {
                    return this.iEnterTextInTheInputFieldWithPlaceholder("Enter a shell title ...", "Shell Title");
                },
                iInputAShellAppTitle: function () {
                    return this.iEnterTextInTheInputFieldWithPlaceholder("Enter a shell app title ...", "Shell App Title");
                }
            },
            assertions: {
                iShouldSeeTheLogo: function () {
                    return this.waitFor({
                        success: function () {
                            Opa5.assert.ok(document.getElementsByTagName("img").title = "Logo", "The logo was found.");
                        },
                        errorMessage: "No logo was found."
                    });
                },
                iShouldSeeTheHeadItem: function () {
                    return fnSeeTheNumberOfItems.call(this, "headItems", 1);
                },
                iShouldSeeTheHeadEndItem: function () {
                    return fnSeeTheNumberOfItems.call(this, "headEndItems", 1);
                },
                iShouldSeeNoHeadItem: function () {
                    return fnSeeTheNumberOfItems.call(this, "headItems", 0);
                },
                iShouldSeeNoHeadEndItem: function () {
                    return fnSeeTheNumberOfItems.call(this, "headEndItems", 0);
                },
                iShouldSeeTheShellTitle: function () {
                    return fnShouldSeeTheTitle.call(this, "title", "Shell Title");
                },
                iShouldSeeTheShellAppTitle: function () {
                    return fnShouldSeeTheTitle.call(this, "appTitle", "Shell App Title");
                }
            }
        }
    });
});