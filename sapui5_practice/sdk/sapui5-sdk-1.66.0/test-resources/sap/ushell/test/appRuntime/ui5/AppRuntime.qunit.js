// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.appRuntime.ui5.AppRuntime
 */
sap.ui.require([
    "sap/ui/thirdparty/URI",
    "sap/ushell/appRuntime/ui5/AppRuntime",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ushell/services/Container",
    "jquery.sap.script"
], function (URI, AppRuntime, AppCommunicationMgr, AppRuntimeService, Container) {
    "use strict";

    /*global module, jQuery, test, start, sap, sinon, asyncTest, window */

    module("sap.ushell.appRuntime.ui5.appRuntime", {
    });

    // asyncTest("test getPageConfig", function (assert) {
    //     AppRuntime.getPageConfig().then(function(appInfo) {
    //         var result = window["sap-ushell-config"];
    //         assert.ok(result.services.Personalization.adapter.module === "sap.ushell.adapters.local.PersonalizationAdapter",
    //             "AppRuntime.getPageConfig - Successfully compare value1 from pageConfig");
    //         assert.ok(result.ui5appruntime.config.appIndex.module === "sap.ushell.shells.demo.cspJSFiles.AppInfoAdapterSample",
    //             "AppRuntime.getPageConfig - Successfully compare value2 from pageConfig");
    //         start();
    //     });
    // });

    test("test getAppId", function (assert) {
        var getURIParamsSinon = sinon.stub(AppRuntime, "_getURIParams", function () {
            var newURI = new URI("www.sap.com?sap-ui-app-id=mock");

            return newURI.search(true);
        });

        assert.ok(AppRuntime.getAppId() === "mock", "Successfully got the AppId param from the URL");
        getURIParamsSinon.restore();
    });


    asyncTest("test getAppInfo", function (assert) {
        var sap_ushell_config = window["sap-ushell-config"];
        window["sap-ushell-config"] = {
            "ui5appruntime": {
                "config": {
                    "appIndex": {
                        "module": "sap.ushell.shells.demo.cspJSFiles.AppInfoAdapterSample",
                        "data": {}
                    }
                }
            }
        };

        var getUriParametersSinon = sinon.stub(jQuery.sap, "getUriParameters", function() {
            return {
                "get": function() {
                    return "sap.ushell.demo.FioriSandboxDefaultApp";
                }
            };
        });

        var result = {
            ui5ComponentName: "sap.ushell.demo.FioriSandboxDefaultApp",
            url: "../../../../../../test-resources/sap/ushell/demoapps/FioriSandboxDefaultApp"
        };

        AppRuntime.getAppInfo().then(function(appInfo) {
            assert.ok(JSON.stringify(appInfo) === JSON.stringify(result), 'getAppInfo - data was successfully received from the "module" parameter' );
            start();
            window["sap-ushell-config"] = sap_ushell_config;
            getUriParametersSinon.restore();
        });
    });


    [
        {
            input: {
                oAppInfo: {
                    ui5ComponentName: "sap.ushell.demo.FioriToExtAppTarget",
                    url: "../../../../../test-resources/sap/ushell/demoapps/FioriToExtAppTarget"
                },
                sHash: "FioriToExtAppTargetIsolated-Action?param1=value1&param2=value2&param3=0"
            },
            output: {
                oAppInfo: {
                    url: "../../../../../test-resources/sap/ushell/demoapps/FioriToExtAppTarget?param1=value1&param2=value2&param3=0"
                }
            }
        },
        {
            input: {
                oAppInfo: {
                    ui5ComponentName: "sap.ushell.demo.FioriToExtAppTarget",
                    url: "../../../../../test-resources/sap/ushell/demoapps/FioriToExtAppTarget"
                },
                sHash: "FioriToExtAppTargetIsolated-Action?sap-intent-param=abcd"
            },
            output: {
                oAppInfo: {
                    url: "../../../../../test-resources/sap/ushell/demoapps/FioriToExtAppTarget?sap-intent-param=abcd1234"
                }
            }
        }
    ].forEach(function (oFixture) {
        asyncTest("test setApplicationParameters", function (assert) {
            var window_hasher = window.hasher;
            window.hasher = {
                getHash: function() {return oFixture.input.sHash; }
            };

            sinon.stub(AppRuntimeService, "sendMessageToOuterShell",
                function (sMessageId, oParams) {
                    var oDeferred = new jQuery.Deferred();
                    var oldHash = oParams.sHashFragment;
                    var newHash = oldHash.substr(0, oldHash.indexOf("sap-intent-param")+17) + "abcd1234";

                    return oDeferred.resolve(newHash).promise();
                });

            AppRuntime.setApplicationParameters(
                oFixture.input.oAppInfo).done(function () {
                assert.ok(oFixture.input.oAppInfo.url === oFixture.output.oAppInfo.url, 'setApplicationParameters - parameters were successfully set in the URL');
                start();
                window.hasher = window_hasher;
                AppRuntimeService.sendMessageToOuterShell.restore();
            }).fail(function () {
                assert.ok(false, 'setApplicationParameters - parameters were NOT properly set in the URL');
                start();
                window.hasher = window_hasher;
                AppRuntimeService.sendMessageToOuterShell.restore();
            });
        });
    });
});
