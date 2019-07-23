// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
], function (AppRuntimeService) {
    "use strict";

    function RendererProxy () {
        sap.ushell = sap.ushell || {};
        sap.ushell.renderers = sap.ushell.renderers || {};
        sap.ushell.renderers.fiori2 = sap.ushell.renderers.fiori2 || {};
        sap.ushell.renderers.fiori2.Renderer = this;
    }

    RendererProxy.prototype.showHeaderItem = function (aIds, bCurrentState, aStates) {
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.showHeaderItem", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.showToolAreaItem = function (sId, bCurrentState, aStates) {
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.showHeaderItem", {
                "sId": sId,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.showActionButton = function (aIds, bCurrentState, aStates, bIsFirst) {
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.showActionButton", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates,
                "bIsFirst": bIsFirst
            }
        );
    };

    RendererProxy.prototype.showFloatingActionButton = function (aIds, bCurrentState, aStates) {
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.showFloatingActionButton", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.showHeaderEndItem = function (aIds, bCurrentState, aStates) {
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.showHeaderEndItem", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.setHeaderVisibility = function (bVisible, bCurrentState, aStates) {
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.setHeaderVisibility", {
                "bVisible": bVisible,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.showSubHeader = function (aIds, bCurrentState, aStates) {
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.showSubHeader", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.setFooter = function (oFooter) {

    };

    RendererProxy.prototype.setShellFooter = function (oParameters) {
        jQuery.sap.log.warning("Renderer.js - function setShellFooter(...) is not supported to run via iFrame");
        var oControlInstance,
            controlType = oParameters.controlType,
            oDeferred = new jQuery.Deferred();

        if (controlType) {
            var sControlResource = controlType.replace(/\./g, "/");
            sap.ui.require([sControlResource],
                function (ControlClass) {
                    oControlInstance = new ControlClass(oParameters.oControlProperties);
                    oDeferred.resolve(oControlInstance);
                });
        }

        return oDeferred.promise();
    };

    //check
    RendererProxy.prototype.setFooterControl = function (controlType, oControlProperties) {
        jQuery.sap.log.warning("Renderer.js - function setFooterControl(...) is not supported to run via iFrame");
        var sControlResource = controlType.replace(/\./g, "/"),
            // Try to require the control in case it is already loaded
            ControlClass = sap.ui.require(sControlResource);

        return new ControlClass(oControlProperties);
    };

    RendererProxy.prototype.hideHeaderItem = function (aIds, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function hideHeaderItem(...) is not supported to run via iFrame");
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.hideHeaderItem", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.removeToolAreaItem = function (aIds, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function removeToolAreaItem(...) is not supported to run via iFrame");
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.hideHeaderItem", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.hideActionButton = function (aIds, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function hideActionButton(...) is not supported to run via iFrame");
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.hideActionButton", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.hideLeftPaneContent = function (aIds, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function hideLeftPaneContent(...) is not supported to run via iFrame");
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.hideLeftPaneContent", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.hideFloatingActionButton = function (aIds, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function hideFloatingActionButton(...) is not supported to run via iFrame");
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.hideLeftPaneContent", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.hideHeaderEndItem = function (aIds, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function hideHeaderEndItem(...) is not supported to run via iFrame");
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.hideHeaderEndItem", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.hideSubHeader = function (aIds, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function hideSubHeader(...) is not supported to run via iFrame");
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.hideSubHeader", {
                "aIds": aIds,
                "bCurrentState": bCurrentState,
                "aStates": aStates
            }
        );
    };

    RendererProxy.prototype.removeFooter = function () {
        jQuery.sap.log.warning("Renderer.js - function removeFooter() is not supported to run via iFrame");
    };

    RendererProxy.prototype.getCurrentViewportState = function () {
        jQuery.sap.log.warning("Renderer.js - function getCurrentViewportState() is not supported to run via iFrame");
        return "";
    };

    /*------------------------------------------------ Adding controls functionality ------------------------------------------*/

    RendererProxy.prototype.addShellSubHeader = function (oParameters) {
        jQuery.sap.log.warning("Renderer.js - function addShellSubHeader(...) is not supported to run via iFrame");
        var oDeferred = new jQuery.Deferred(),
            sControlResource,
            oControlInstance,
            controlType = oParameters.controlType,
            oControlProperties = oParameters.oControlProperties;

        if (controlType) {
            sControlResource = controlType.replace(/\./g, "/");
            sap.ui.require([sControlResource],
                function (ControlClass) {
                    oControlInstance = new ControlClass(oControlProperties);
                    oDeferred.resolve(oControlInstance);
                });
        } else {
            jQuery.sap.log.warning("You must specify control type in order to create it");
        }

        return oDeferred.promise();
    };

    RendererProxy.prototype.addSubHeader = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function addSubHeader(...) is not supported to run via iFrame");
        var sControlResource = controlType.replace(/\./g, "/"),
            // Try to require the control in case it is already loaded
            ControlClass = sap.ui.require(sControlResource);

        if (controlType) {
            return new ControlClass(oControlProperties);
        }

        //check - can the control type be null?
    };

    RendererProxy.prototype.addUserAction = function (oParameters) {
        jQuery.sap.log.warning("Renderer.js - function addUserAction(...) is not supported to run via iFrame");
        var oDeferred = new jQuery.Deferred(),
            sControlResource,
            oControlInstance,
            controlType = oParameters.controlType,
            oControlProperties = oParameters.oControlProperties,
            sNoControlTypeErrorMessage;

        if (controlType) {
            if (controlType === "sap.m.Button") {
                controlType = "sap.ushell.ui.launchpad.ActionItem";
            }
            sControlResource = controlType.replace(/\./g, "/");
            sap.ui.require([ sControlResource ], function (ControlClass) {
                oControlInstance = new ControlClass(oControlProperties);
                oDeferred.resolve(oControlInstance);
            });
        } else {
            sNoControlTypeErrorMessage = "You must specify control type in order to create it";
            jQuery.sap.log.warning(sNoControlTypeErrorMessage);
            oDeferred.reject(sNoControlTypeErrorMessage);
        }

        return oDeferred.promise();
    };

    RendererProxy.prototype.addActionButton = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates, bIsFirst) {
        jQuery.sap.log.warning("Renderer.js - function addActionButton(...) is not supported to run via iFrame");
        var sControlResource,
            ControlClass;

        if (controlType === "sap.m.Button") {
            controlType = "sap.ushell.ui.launchpad.ActionItem";
        }

        sControlResource = controlType.replace(/\./g, "/");
        ControlClass = sap.ui.require(sControlResource);

        return new ControlClass(oControlProperties);
    };

    RendererProxy.prototype.addFloatingButton = function (oParameters) {
        jQuery.sap.log.warning("Renderer.js - function addFloatingButton(...) is not supported to run via iFrame");
        var oDeferred = new jQuery.Deferred(),
            sControlResource,
            oControlInstance,
            controlType = oParameters.controlType,
            oControlProperties = oParameters.oControlProperties;

        if (controlType) {
            sControlResource = controlType.replace(/\./g, "/");
        } else {
            sControlResource = "sap/m/Button";
        }

        sap.ui.require([sControlResource],
            function (ControlClass) {
                oControlInstance = new ControlClass(oControlProperties);
                oDeferred.resolve(oControlInstance);
            });

        return oDeferred.promise();
    };

    RendererProxy.prototype.addFloatingActionButton = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function addFloatingActionButton(...) is not supported to run via iFrame");
        var sControlResource,
            ControlClass;

        if (!controlType) {
            controlType = "sap.m.Button";
        }

        sControlResource = controlType.replace(/\./g, "/");
        ControlClass = sap.ui.require(sControlResource);

        return new ControlClass(oControlProperties);
    };

    RendererProxy.prototype.addSidePaneContent = function (oParameters) {
        jQuery.sap.log.warning("Renderer.js - function addSidePaneContent(...) is not supported to run via iFrame");
        var oDeferred = new jQuery.Deferred(),
            sControlResource,
            oControlInstance,
            controlType = oParameters.controlType,
            oControlProperties = oParameters.oControlProperties;

        if (controlType) {
            sControlResource = controlType.replace(/\./g, "/");
            sap.ui.require([sControlResource],
                function (ControlClass) {
                    oControlInstance = new ControlClass(oControlProperties);
                    oDeferred.resolve(oControlInstance);
                });
        } else {
            jQuery.sap.log.warning("You must specify control type in order to create it");
        }

        return oDeferred.promise();
    };

    RendererProxy.prototype.addLeftPaneContent = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function addLeftPaneContent(...) is not supported to run via iFrame");
        var sControlResource = controlType.replace(/\./g, "/"),
            ControlClass = sap.ui.require(sControlResource);

        return new ControlClass(oControlProperties);
    };

    RendererProxy.prototype.addHeaderItem = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function addHeaderItem(...) is not supported to run via iFrame");
    };

    RendererProxy.prototype.addToolAreaItem = function (oControlProperties, bIsVisible, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function addToolAreaItem(...) is not supported to run via iFrame");
    };

    RendererProxy.prototype.addHeaderEndItem = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        jQuery.sap.log.warning("Renderer.js - function addHeaderEndItem(...) is not supported to run via iFrame");
    };

    RendererProxy.prototype.addEndUserFeedbackCustomUI = function (oCustomUIContent, bShowCustomUIContent) {
        jQuery.sap.log.warning("Renderer.js - function addEndUserFeedbackCustomUI(...) is not supported to run via iFrame");
    };

    RendererProxy.prototype.addUserPreferencesEntry = function (entryObject) {
        jQuery.sap.log.warning("Renderer.js - function addUserPreferencesEntry(...) is not supported to run via iFrame");
    };

    RendererProxy.prototype.setHeaderTitle = function (sTitle) {
        jQuery.sap.log.warning("Renderer.js - function setHeaderTitle(...) is not supported to run via iFrame");
    };

    RendererProxy.prototype.setLeftPaneVisibility = function (sLaunchpadState, bVisible) {
        jQuery.sap.log.warning("Renderer.js - function setLeftPaneVisibility(...) is not supported to run via iFrame");
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.setLeftPaneVisibility", {
                "sLaunchpadState": sLaunchpadState,
                "bVisible": bVisible
            }
        );
    };

    RendererProxy.prototype.showToolArea = function (sLaunchpadState, bVisible) {
        jQuery.sap.log.warning("Renderer.js - function showToolArea(...) is not supported to run via iFrame");
        AppRuntimeService.sendMessageToOuterShell(
            "sap.ushell.services.renderer.showToolArea", {
                "sLaunchpadState": sLaunchpadState,
                "bVisible": bVisible
            }
        );
    };

    RendererProxy.prototype.LaunchpadState = {
        App: "app",
        Home: "home"
    };

    return new RendererProxy();

}, false);
