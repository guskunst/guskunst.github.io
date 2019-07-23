// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press"
], function(Opa5, Press) {
    "use strict";

    Opa5.createPageObjects({
        onTheHomepage : {
            actions : {
                iPressOnTheMeAreaButton: function () {
                    return this.waitFor({
                        id: "meAreaHeaderButton",
                        actions: new Press(),
                        errorMessage: "No me area button"
                    });
                },
                iCloseLogoutDialog: function () {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType : "sap.m.Dialog",
                        actions: function (oDialog) {
                            oDialog.getButtons()[1].firePress(); // press the cancel button
                        },
                        errorMessage: "Sign out dialog was not found"
                    });
                },
                iCloseAboutDialog: function () {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType : "sap.m.Dialog",
                        actions: function (oDialog) {
                            oDialog.getBeginButton().firePress(); // press the OK button
                        },
                        errorMessage: "Sign out dialog was not found"
                    });
                }
            },
            assertions: {
                iShouldSeeSmallTiles: function () {
                    return this.waitFor({
                        matchers: function () {
                            return document.querySelector(".sapMGT");
                        },
                        success: function (oElement) {
                            Opa5.assert.strictEqual(oElement.offsetWidth, 148, "tiles have a small size");
                            Opa5.assert.strictEqual(oElement.offsetHeight, 148, "tiles have a small size");
                        },
                        errorMessage: "Tiles have the wrong size"
                    });
                },
                iShouldSeeResponsiveTiles: function () {
                    return this.waitFor({
                        matchers: function () {
                            return document.querySelector(".sapMGT");
                        },
                        success: function (oElement) {
                            Opa5.assert.strictEqual(oElement.offsetWidth, 176, "tiles have a regular size");
                            Opa5.assert.strictEqual(oElement.offsetHeight, 176, "tiles have a regular size");
                        },
                        errorMessage: "Tiles have the wrong size"
                    });
                },
                iShouldSeeHomepageInEditMode: function () {
                    return this.waitFor({
                        id: "dashboardGroups",
                        success: function (oDashboard) {
                            Opa5.assert.ok(oDashboard.getModel().getProperty("/tileActionModeActive"), "tileActionModeActive in homepage model should be true");
                        },
                        errorMessage: "Dashboard was not found"
                    });
                },
                iShouldSeeFooterInEditMode: function () {
                    return this.waitFor({
                        id: "sapUshellDashboardFooter",
                        success: function (oFooter) {
                            Opa5.assert.ok(true, "Footer should be shown in edit mode");
                        },
                        errorMessage: "Footer was not found"
                    });
                },
                iShouldSeeLogoutDialog: function () {
                    return this.waitFor({
                        searchOpenDialogs: true,
                        controlType : "sap.m.Dialog",
                        success: function (oDialog) {
                            Opa5.assert.ok(true, "Sign out dialog should be shown.");
                        },
                        errorMessage: "Sign out dialog was not found"
                    });
                },
                iShouldSeeQuickAccessDialog: function () {
                    return this.waitFor({
                        id: "quickAccess",
                        success: function (oDialog) {
                            Opa5.assert.ok(oDialog.isOpen(), "Quick Access dialog should be opened.");
                        },
                        errorMessage: "Quick Access dialog was not found"
                    });
                },
                iShouldSeeAboutDialog: function () {
                    return this.waitFor({
                        id: "aboutContainerDialogID",
                        success: function (oDialog) {
                            Opa5.assert.ok(oDialog.isOpen(), "About dialog was opened");
                        },
                        errorMessage: "About dialog was not found"
                    });
                }
            }
        }
    });
});
