sap.ui.define([
    "sap/ushell/services/AppState",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ushell/services/_AppState/WindowAdapter",
    "sap/ushell/services/_AppState/SequentializingAdapter",
    "sap/ushell/services/_AppState/AppState",
    "sap/ushell/services/_AppState/Sequentializer",
    "sap/ushell/utils"
], function (AppState, AppRuntimeService, WindowAdapter, SequentializingAdapter, AppStateAppState, Sequentializer, utils) {
    "use strict";

    function AppStateProxy (oAdapter, oContainerInterface, sParameter, oConfig) {
        AppState.call(this, oAdapter, oContainerInterface, sParameter, oConfig);

        this.getAppState = function (sKey) {
            var oDeferred = new jQuery.Deferred();

            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.getAppState", {
                    "sKey": sKey
                }).done(function (oState) {
                var oAppStateAppState = new AppStateAppState(
                    sap.ushell.Container.getService("AppState"),
                    oState._sKey,
                    oState._bModifiable,
                    oState._sData,
                    oState._sAppName,
                    oState._sACHComponent,
                    oState._bTransient);
                oDeferred.resolve(oAppStateAppState);
            });

            return oDeferred.promise();
        };

        this._saveAppState = function (sKey, sData, sAppName, sComponent, bTransient) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState._saveAppState",
                {
                    "sKey": sKey,
                    "sData": sData,
                    "sAppName": sAppName,
                    "sComponent": sComponent,
                    "bTransient": bTransient
                }
            );
        };

        this._loadAppState = function (sKey) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState._loadAppState",
                {
                    "sKey": sKey
                }
            );
        };

        this.getAppStateData = function (sKey) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.getAppStateData", {
                    "sAppStateKey": sKey
                });
        };

        this.createNewInAppState = function (sData) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.createNewInAppState", {
                    "sData": sData
                });
        };

        this.updateInAppStateData = function (sData) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.updateInAppState", {
                    "sData": sData
                });
        };

        this.getInAppStateData = function () {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.getInAppStateData");
        };

    }

    AppStateProxy.prototype = Object.create(AppState.prototype);
    AppStateProxy.hasNoAdapter = AppState.hasNoAdapter;
    AppStateProxy.WindowAdapter = AppState.WindowAdapter;

    return AppStateProxy;
}, true);
