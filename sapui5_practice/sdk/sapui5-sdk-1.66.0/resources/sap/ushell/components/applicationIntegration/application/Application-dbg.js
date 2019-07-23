// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview handle all the resources for the different applications.
 * @version 1.66.0
 */
sap.ui.define([
    "sap/ushell/components/container/ApplicationContainer",
    "sap/ushell/components/container/PostMessageAPI",
    "sap/ushell/utils"
], function (ApplicationContainer, PostMessageAPI, utils) {
    "use strict";

    var oActiveApplication;

    function Application () {
        this._createWaitForRendererCreatedPromise = function () {
            var oPromise,
                oRenderer;

            oRenderer = sap.ushell.Container.getRenderer();
            if (oRenderer) {
                // should always be the case except initial start; in this case, we return an empty array to avoid delays by an additional async operation
                jQuery.sap.log.debug("Shell controller._createWaitForRendererCreatedPromise: shell renderer already created, return empty array.");
                return [];
            } else {
                oPromise = new Promise(function (resolve, reject) {
                    var fnOnRendererCreated;

                    fnOnRendererCreated = function () {
                        jQuery.sap.log.info("Shell controller: resolving component waitFor promise after shell renderer created event fired.");
                        resolve();
                        sap.ushell.Container.detachRendererCreatedEvent(fnOnRendererCreated);
                    };
                    oRenderer = sap.ushell.Container.getRenderer();
                    if (oRenderer) {
                        // unlikely to happen, but be robust
                        jQuery.sap.log.debug("Shell controller: resolving component waitFor promise immediately (shell renderer already created");
                        resolve();
                    } else {
                        sap.ushell.Container.attachRendererCreatedEvent(fnOnRendererCreated);
                    }
                });
                return [oPromise];
            }
        };

        // FIXME: It would be better to call a function that simply
        // and intentionally loads the dependencies of the UI5
        // application, rather than creating a component and expecting
        // the dependencies to be loaded as a side effect.
        // Moreover, the comment reads "load ui5 component via shell service"
        // however that is 'not needed' since the loaded component
        // is not used. We should evaluate the possible performance
        // hit taken due to this implicit means to an end.
        this.createComponent = function (oResolvedHashFragment, oParsedShellHash) {
            return sap.ushell.Container.getService("Ui5ComponentLoader").createComponent(
                oResolvedHashFragment,
                oParsedShellHash,
                this._createWaitForRendererCreatedPromise()
            );
        };


        this.createApplicationContainer = function (sAppId, oResolvedNavigationTarget) {
            oActiveApplication = new ApplicationContainer("application" + sAppId, oResolvedNavigationTarget);
            return oActiveApplication;
        };

        this.active = function (oApp) {
            if (oApp) {
                if (oApp.active) {
                    oApp.active();
                }
            }
        };

        this.restore = function (oApp) {
            if (oApp) {
                if (oApp.restore) {
                    oApp.restore();
                }

                //this is in order to support the dashboard life cycle.
                if (oApp.setInitialConfiguration) {
                    oApp.setInitialConfiguration();
                }

                if (oApp.getRouter && oApp.getRouter() && oApp.getRouter().initialize) {
                    oApp.getRouter().initialize();
                }

                oActiveApplication = oApp;
            }
        };

        this.store = function (oApp) {
            //distroy the application and its resources
            // invoke the life cycle interface "suspend" for the suspend application
            if (oApp) {
                if (oApp.suspend) {
                    oApp.suspend();
                }
                if (oApp.getRouter && oApp.getRouter()) {
                    oApp.getRouter().stop();
                }
            }
        };

        this.destroy = function (oApp) {
            //remove from storeage
            //distroy the application and its resources
            if (oApp && oApp.destroy) {
                oApp.destroy();
            }
        };

        this.getActiveAppContainer = function () {
            return oActiveApplication;
        };
    }

    Application.prototype.getResponseHandler = function (sServiceName, sInterface) {
        return PostMessageAPI.getResponseHandler(sServiceName, sInterface);
    };

    Application.prototype.isActiveOnly = function (sServiceName, sInterface) {
        return PostMessageAPI.isActiveOnly(sServiceName, sInterface);
    };

    Application.prototype.isAppTypeSupported = function (oContainer, sServiceName, sInterface) {
        return PostMessageAPI.isAppTypeSupported(oContainer, sServiceName, sInterface);
    };

    Application.prototype.postMessageToIframeApp = function (oContainer, sServiceName, sInterface, oMessageBody, bWaitForResponse) {
        var sService = sServiceName + "." + sInterface,
            oMessage = oContainer.createPostMessageRequest(sService, oMessageBody);
        return oContainer.postMessageToCurrentIframe(oMessage, bWaitForResponse);
    };

    Application.prototype.registerShellCommunicationHandler = function (oCommunicationHandler) {
        PostMessageAPI.registerShellCommunicationHandler(oCommunicationHandler);
    };

    Application.prototype.addShellCommunicationHandler = function (sKey, oCommunicationEntry) {
        PostMessageAPI.addShellCommunicationHandler(sKey, oCommunicationEntry);
    };

    Application.prototype._getPostMesageInterface = function (sServiceName, sInterface) {
        return PostMessageAPI._getPostMesageInterface(sServiceName, sInterface);
    };

    return new Application();
}, /* bExport= */ true);
