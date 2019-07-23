// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/util/LoaderExtensions",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ui/thirdparty/URI",
    "sap/ushell/appRuntime/ui5/renderers/fiori2/RendererExtensions",
    "sap/ushell/appRuntime/ui5/services/AppConfiguration",
    "sap/ushell/appRuntime/ui5/services/ShellUIService",
    "sap/ushell/appRuntime/ui5/services/UserStatus",
    "sap/ui/core/Popup"
], function (LoaderExtensions, AppCommunicationMgr, AppRuntimeService, URI, RendererExtensions, AppConfiguration, ShellUIService, UserStatus, Popup) {
    "use strict";

    var oPageUriParams = new URI().search(true),
        oComponentContainer,
        oShellNavigationService;

    var DEFAULT_CONFIG_PATH = "sap/ushell/appRuntime/ui5/AppRuntimeDefaultConfiguration.json";

    function AppRuntime () {
        this.main = function() {
            var that = this;

            this.getPageConfig().then(function () {
                that.setModulePaths();
                AppCommunicationMgr.init();

                Promise.all([
                    that.initServicesContainer(),
                    that.getAppInfo()
                ]).then(function (values) {
                    var oAppInfo = values[1];
                    that.createApplication(that.getAppId(), oAppInfo)
                        .then(function (oResolutionResult) {
                            that.renderApplication(oResolutionResult);
                        });
                });
            });
        };

        this.getPageConfig = function () {
            var metaData,
                shellConfig;

            return new Promise(function (fnResolve) {
                LoaderExtensions.loadResource(DEFAULT_CONFIG_PATH, {async: true}).then(function (defaultShellConfig) {
                    metaData = jQuery("meta[name='sap.ushellConfig.ui5appruntime']")[0];
                    shellConfig = JSON.parse(metaData.content);
                    window['sap-ushell-config'] = jQuery.extend(true, {}, defaultShellConfig, shellConfig);
                    fnResolve();
                });
            });

        };

        this.setModulePaths = function () {
            if (window['sap-ushell-config'].modulePaths) {
                var keys = Object.keys(window['sap-ushell-config'].modulePaths);
                for (var key in keys) {
                    jQuery.sap.registerResourcePath(keys[key].replace(/\./g, '/'), window['sap-ushell-config'].modulePaths[keys[key]]);
                }
            }
        };

        this.initServicesContainer = function () {
            return new Promise(function (fnResolve, fnReject) {
                sap.ui.require(["sap/ushell/appRuntime/ui5/services/Container"], function (oContainer) {
                    oContainer.bootstrap("apprt", {apprt: "sap.ushell.appRuntime.ui5.services.adapters"}).then(function () {
                        fnResolve();
                    });
                });
            });
        };

        this._getURIParams =  function() {
            return oPageUriParams;
        };

        this.getAppId = function () {
            var sAppId = this._getURIParams()["sap-ui-app-id"];

            if (sAppId === undefined) {
                throw new Error("FATAL: missing URI parameter 'sap-ui-app-id'");
            }

            return sAppId;
        };

        this.getAppInfo = function () {
            var oData = window["sap-ushell-config"].ui5appruntime.config.appIndex.data,
                sModule = window["sap-ushell-config"].ui5appruntime.config.appIndex.module;

            return new Promise(function (fnResolve) {
                if (oData && !jQuery.isEmptyObject(oData)) {
                    fnResolve(oData);
                } else {
                    sap.ui.require([sModule.replace(/\./g, '/')], function (AppResolution) {
                        AppResolution.getAppInfo().then(function (oAppInfo) {
                            fnResolve(oAppInfo);
                        });
                    });
                }
            });
        };

        this.setApplicationParameters = function (oAppInfo) {
            var sHash = window.hasher.getHash(),
                sHashFragment,
                oShellHash,
                iIndex,
                sParameters,
                oDeferred = new jQuery.Deferred();

            if (!sHash || !sHash.length > 0) {
                jQuery.sap.log.error("AppRuntime.validateParams - sHash = " + sHash);
                return oDeferred.resolve().promise();
            }

            /* In between the calls to the inner functions 'setPreliminaryParams()' and 'setLateParams()', the case of
                retrieving the shortening hash value is handled. That's the reason for these two set params function.
                For handling the shortening value in the url we're sending the shortening hash to the outer shell
                and retrieving the actual value of the parameters
            */

            function setPreliminaryParams(sTempHash) {
                var sExpandedHash = sap.ushell.Container.getService("URLShortening").expandHash(sTempHash);
                oShellHash =  sap.ushell.Container.getService("URLParsing").parseShellHash(sExpandedHash);
                oShellHash.appSpecificRoute = undefined;
            }

            function setLateParams() {
                sHashFragment = sap.ushell.Container.getService("URLParsing").constructShellHash(oShellHash);
                iIndex = sHashFragment.indexOf("?");
                if (iIndex >= 0) {
                    sParameters = sHashFragment.slice(iIndex + 1);
                    oAppInfo.url += (oAppInfo.url.indexOf("?") < 0) ? "?" : "&";
                    oAppInfo.url += sParameters;
                }
            }

            setPreliminaryParams(sHash);
            //Handle the case when the parameters that were sent to the application were more than 1000 characters and in
            //the URL we see a shorten value of the parameters
            if (oShellHash && oShellHash.params["sap-intent-param"] != undefined) {
                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.NavTargetResolution.expandCompactHash", {
                        "sHashFragment": sHash
                    }).done(function (sNewHash) {
                    setPreliminaryParams(sNewHash);
                    setLateParams();
                    oDeferred.resolve();
                });
            } else { //this is the regular case, when the parameters size are "normal" (less that 1000 chars)
                setLateParams();
                oDeferred.resolve();
            }

            return oDeferred.promise();
        };

        this.setHashChangedCallback = function () {
            function treatHashChanged (newHash, oldHash) {
                if (newHash && typeof newHash === "string" && newHash.length > 0) {
                    AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.appRuntime.hashChange",
                        {"newHash": newHash}
                    );
                }
            }
            window.hasher.changed.add(treatHashChanged.bind(this), this);
        };

        this.createApplication = function (sAppId, oAppInfo) {
            var that = this;

            var fnPopupOpenCloseHandler = function (oEvent) {
                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.ShellUIService.showShellUIBlocker", {
                        "bShow": oEvent.getParameters().visible
                    });
            };

            return new Promise(function (fnResolve, fnReject) {
                oComponentContainer = new sap.ui.core.ComponentContainer({
                    id: "TODO-define-correct-ID-content",
                    width: "100%",
                    height: "100%"
                });
                sap.ushell.renderers.fiori2.utils.init();
                oShellNavigationService = sap.ushell.Container.getService("ShellNavigation");
                oShellNavigationService.init(function () {});
                oShellNavigationService.registerNavigationFilter(function (newHash, oldHash) {
                    if (sap.ushell.Container.getDirtyFlag()) {
                        return oShellNavigationService.NavigationFilterStatus.Abandon;
                    }
                    return oShellNavigationService.NavigationFilterStatus.Continue;
                }.bind(this));

                new ShellUIService({
                    scopeObject: oComponentContainer,
                    scopeType: "component"
                });
                new UserStatus({
                    scopeObject: oComponentContainer,
                    scopeType: "component"
                });

                Popup.attachBlockLayerStateChange(fnPopupOpenCloseHandler);

                that.setApplicationParameters(oAppInfo).done(function () {
                    that.setHashChangedCallback();
                    sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function (oUi5ComponentLoader) {
                        oUi5ComponentLoader.createComponent({
                            ui5ComponentName: sAppId,
                            applicationDependencies: oAppInfo,
                            url: oAppInfo.url
                        }, "todo-replaceDummyShellHash", false).then(function (oResolutionResultWithComponentHandle) {
                            fnResolve(oResolutionResultWithComponentHandle);
                        });
                    });
                });
            });
        };

        this.renderApplication = function (oResolutionResult) {
            oComponentContainer
                .setComponent(oResolutionResult.componentHandle.getInstance())
                .placeAt("content");
        };
    }

    var appRuntime = new AppRuntime();
    appRuntime.main();
    return appRuntime;
});
