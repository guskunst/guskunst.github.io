// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/utils"
], function (utils) {
    "use strict";

    var oAPIs = {
        "sap.ushell.appRuntime": {
            oInboundActions: {
                "hashChange": {
                    executeServiceCallFn: function (oServiceParams) {
                        var sHash = oServiceParams.oMessageData.body.sHash;
                        if (sHash && sHash.length > 0) {
                            window.hasher.replaceHash(sHash);
                        }
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "setDirtyFlag": {
                    executeServiceCallFn: function (oServiceParams) {
                        var bIsDirty = oServiceParams.oMessageData.body.bIsDirty;
                        if (bIsDirty !== sap.ushell.Container.getDirtyFlag()) {
                            sap.ushell.Container.setDirtyFlag(bIsDirty);
                        }
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "themeChange": {
                    executeServiceCallFn: function (oServiceParams) {
                        var currentThemeId = oServiceParams.oMessageData.body.currentThemeId;
                        sap.ui.getCore().applyTheme(currentThemeId);
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        }
    };

    function AppRuntimePostMessageAPI () {
        this.getHandlers = function () {
            return oAPIs;
        };

        this.registerCommunicationHandler = function (sKey, oCommunicationEntry) {
            var oCommObject = oAPIs[sKey];

            if (!oCommObject) {
                oCommObject = oAPIs[sKey] = {
                    oInboundActions: {}
                };
            }

            if (oCommunicationEntry.oInboundActions) {
                Object.keys(oCommunicationEntry.oInboundActions).forEach(function (key) {
                    oCommObject.oInboundActions[key] = oCommunicationEntry.oInboundActions[key];
                });
            }
        };

        this._getPostMesageInterface = function (sServiceName, sInterface) {
            var oCommHandlerService = oAPIs[sServiceName],
                oInterface = undefined;

            if (oCommHandlerService && oCommHandlerService.oRequestCalls && oCommHandlerService.oRequestCalls[sInterface]) {
                oInterface = oCommHandlerService.oRequestCalls[sInterface];
            }

            return oInterface;
        };
    }

    return new AppRuntimePostMessageAPI();
}, false);
