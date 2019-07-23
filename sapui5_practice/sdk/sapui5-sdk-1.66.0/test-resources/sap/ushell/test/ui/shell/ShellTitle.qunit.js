// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.ui.footerbar.AboutButton
 */
(function () {
    "use strict";
    /* global module,ok,test,jQuery,sap,sinon*/
    jQuery.sap.require("sap.ushell.shells.demo.fioriDemoConfig");
    jQuery.sap.require("sap.ushell.ui.shell.ShellTitle");
    jQuery.sap.require("sap.ushell.services.Container");
    var historyBackStub;
    var EventHub = sap.ui.requireSync("sap/ushell/EventHub");
    module("sap.ushell.ui.shell.ShellTitle", {
        /**
         * This method is called before each test
         */
        setup: function () {
            historyBackStub = sinon.stub(window.history, 'back');
        },
        /**
         * This method is called after each test. Add every restoration code here
         *
         */
        teardown: function () {
            historyBackStub.restore();
            EventHub._reset();
        }
    });

    test("Constructor Test", function () {
        var text = "Nir Dayan";
        var shellTitle = new sap.ushell.ui.shell.ShellTitle({text: text});
        ok(shellTitle.getText() == text , "Check text");
        ok(shellTitle.getIcon() == "" , "Check icon does not exists");
        shellTitle = new sap.ushell.ui.shell.ShellTitle({icon: "sap-icon://hint"});
        ok(shellTitle.getText() == "" , "Check text does not exists");
        ok(shellTitle.getIcon() == "sap-icon://hint" , "Check icon");
    });

    test("Renderer API Test", function (assert) {
        var done = assert.async(),
            sapUshellConfig;

        sap.ushell.bootstrap("local").then(function () {
            sapUshellConfig = window["sap-ushell-config"];
            sapUshellConfig.renderers = {
                fiori2 : {
                    componentData: {
                        config: {
                            rootIntent: "Shell-home"
                        }
                    }
                }
            };
            window["sap-ushell-config"] = sapUshellConfig;
            sap.ushell.Container.createRenderer("fiori2");
        });

        EventHub.once("RendererLoaded").do(function() {
            var renderer = sap.ushell.Container.getRenderer("fiori2");
            var shell = sap.ui.getCore().byId('shell');
            var text = "Nir Dayan";
            renderer.setHeaderTitle(text);
            window.setTimeout(function () {
                var oTitle = shell.getHeader().getTitle();
                ok(oTitle.getMetadata().getName() == "sap.ushell.ui.shell.ShellTitle", "check title class");
                ok(oTitle.getText() == text, "check title text");
                done();
            }, 50);
        });
    });
}());
