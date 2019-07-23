// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.ui.footerbar.AboutButton
 */
(function () {
    "use strict";
    /* global module, ok, test, jQuery, sinon*/

    jQuery.sap.require("sap.ushell.ui.footerbar.JamShareButton");
    jQuery.sap.require("sap.ushell.resources");

    module("sap.ushell.ui.footerbar.JamShareButton", {
        /**
         * This method is called before each test
         */
        setup: function () {
        },
        /**
         * This method is called after each test. Add every restoration code here
         *
         */
        teardown: function () {
        }
    });

    test("Constructor Test", function () {
        var jamShareButton = new sap.ushell.ui.footerbar.JamShareButton();
        ok(jamShareButton.getIcon() == "sap-icon://share-2" , "Check button icon");
        ok(jamShareButton.getText("text") == sap.ushell.resources.i18n.getText("shareBtn") , "Check button title");
    });


    test("showShareDialog Test", function () {
        var settingsData = {};

        var SharingDialogComponent = sap.ui.require("sap/collaboration/components/fiori/sharing/dialog/Component");

        var oSandBox = sinon.sandbox.create();

        oSandBox.stub(SharingDialogComponent.prototype, "createContent", function () {});
        oSandBox.stub(SharingDialogComponent.prototype, "setSettings", function (settingObject) {
            settingsData = settingObject.object;
        });
        oSandBox.stub(SharingDialogComponent.prototype, "open", function () {});

        var jamShareButton = new sap.ushell.ui.footerbar.JamShareButton({
            jamData: {
                object: {
                    id: window.location.href,
                    display: new sap.m.Text({text: "Test title"}),
                    share: "sharing"
                }
            }
        });

        //Show the dialog
        jamShareButton.showShareDialog();
        ok(settingsData.id === window.location.href , "Check id");
        ok(settingsData.display.getText() === "Test title" , "Check display title");
        ok(settingsData.share === "sharing" , "Check share");
        oSandBox.restore();
    });
}());
