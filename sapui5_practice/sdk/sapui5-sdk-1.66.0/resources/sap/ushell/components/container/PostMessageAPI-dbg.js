// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview defines the post message API for all applications running in iframe within the shell
 * @version 1.66.0
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ui/core/Popup",
    "sap/ui/core/library"
], function (utils, Popup, coreLib) {
    "use strict";

    var oDummyComponent = new sap.ui.core.UIComponent(),
        oPopup = undefined;

    var oAPIs = {
        "sap.ushell.services.CrossApplicationNavigation": {
            oServiceCalls: {
                "hrefForExternal": {
                    executeServiceCallFn: function (oServiceParams) {
                        return  new jQuery.Deferred().resolve(sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal(oServiceParams.oMessageData.body.oArgs)).promise();
                    }
                },
                "getSemanticObjectLinks": {
                    executeServiceCallFn: function (oServiceParams) {
                        // beware sSemanticObject may also be an array of argument arrays
                        // {sSemanticObject, mParameters, bIgnoreFormFactors }
                        return sap.ushell.Container.getService("CrossApplicationNavigation").getSemanticObjectLinks(oServiceParams.oMessageData.body.sSemanticObject, oServiceParams.oMessageData.body.mParameters, oServiceParams.oMessageData.body.bIgnoreFormFactors, undefined, undefined, oServiceParams.oMessageData.body.bCompactIntents);
                    }
                },
                "isIntentSupported": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").isIntentSupported(oServiceParams.oMessageData.body.aIntents);
                    }
                },
                "isNavigationSupported": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("CrossApplicationNavigation").isNavigationSupported(oServiceParams.oMessageData.body.aIntents);
                    }
                },
                "backToPreviousApp": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getService("CrossApplicationNavigation").backToPreviousApp();
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "historyBack": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getService("CrossApplicationNavigation").historyBack(oServiceParams.oMessageData.body.iSteps);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "getAppStateData": {
                    executeServiceCallFn: function (oServiceParams) {
                        // note: sAppStateKey may be an array of argument arrays
                        return sap.ushell.Container.getService("CrossApplicationNavigation").getAppStateData(oServiceParams.oMessageData.body.sAppStateKey);
                    }
                },
                "toExternal": {
                    executeServiceCallFn: function (oServiceParams) {
                        var oArgs = utils.clone(oServiceParams.oMessageData.body.oArgs);

                        utils.storeSapSystemToLocalStorage(oArgs);
                        return new jQuery.Deferred().resolve(sap.ushell.Container.getService("CrossApplicationNavigation").toExternal(oArgs)).promise();
                    }
                }
            }
        },
        "sap.ushell.ui5service.ShellUIService": {
            oServiceCalls: {
                "setTitle": {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setTitle(oServiceParams.oMessageData.body.sTitle)).promise();
                    }
                },
                "setBackNavigation": {
                    executeServiceCallFn: function (oServiceParams) {
                        return oServiceParams.executeSetBackNavigationService(oServiceParams.oMessage, oServiceParams.oMessageData);
                    }
                }
            }
        },
        "sap.ushell.services.ShellUIService": {
            oServiceCalls: {
                "setTitle": {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setTitle(oServiceParams.oMessageData.body.sTitle)).promise();
                    }
                },
                "setHierarchy": {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setHierarchy(oServiceParams.oMessageData.body.aHierarchyLevels)).promise();
                    }
                },
                "setRelatedApps": {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setRelatedApps(oServiceParams.oMessageData.body.aRelatedApps)).promise();
                    }
                },
                "setDirtyFlag": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.setDirtyFlag(oServiceParams.oMessageData.body.bIsDirty);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "showShellUIBlocker": {
                    executeServiceCallFn: function (oServiceParams) {
                        showUIBlocker(oServiceParams.oMessageData.body.bShow);
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.Container": {
            oServiceCalls: {
                "setDirtyFlag": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.setDirtyFlag(oServiceParams.oMessageData.body.bIsDirty);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                "getFLPUrl": {
                    executeServiceCallFn: function (oServiceParams) {
                        var bIncludeHash = false;
                        if (oServiceParams.oMessageData.body && oServiceParams.oMessageData.body.bIncludeHash === true) {
                            bIncludeHash = true;
                        }
                        return new jQuery.Deferred().resolve(sap.ushell.Container.getFLPUrl(bIncludeHash)).promise();
                    }
                }
            }
        },
        "sap.ushell.services.AppState": {
            oServiceCalls: {
                "getAppState": {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();

                        sap.ushell.Container.getService("AppState").getAppState(
                            oServiceParams.oMessageData.body.sKey
                        ).done(function (oState) {
                            delete oState._oServiceInstance;
                            oDeferred.resolve(oState);
                        }).fail(function (oState) {
                            delete oState._oServiceInstance;
                            oDeferred.resolve(oState);
                        });

                        return oDeferred.promise();
                    }
                },
                "_saveAppState": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("AppState")._saveAppState(
                            oServiceParams.oMessageData.body.sKey,
                            oServiceParams.oMessageData.body.sData,
                            oServiceParams.oMessageData.body.sAppName,
                            oServiceParams.oMessageData.body.sComponent,
                            oServiceParams.oMessageData.body.bTransient
                        );
                    }
                },
                "_loadAppState": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("AppState")._loadAppState(
                            oServiceParams.oMessageData.body.sKey
                        );
                    }
                }
            }
        },
        "sap.ushell.services.Bookmark": {
            oServiceCalls: {
                "addBookmarkUI5": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").addBookmark(
                            oServiceParams.oMessageData.body.oParameters,
                            oServiceParams.oMessageData.body.oGroup
                        );
                    }
                },
                "addBookmark": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").addBookmarkByGroupId(
                            oServiceParams.oMessageData.body.oParameters,
                            oServiceParams.oMessageData.body.groupId
                        );
                    }
                },
                "getShellGroupIDs": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").getShellGroupIDs();
                    }
                },
                "addCatalogTileToGroup": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").addCatalogTileToGroup(
                            oServiceParams.oMessageData.body.sCatalogTileId,
                            oServiceParams.oMessageData.body.sGroupId,
                            oServiceParams.oMessageData.body.oCatalogData
                        );
                    }
                },
                "countBookmarks": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").countBookmarks(
                            oServiceParams.oMessageData.body.sUrl);
                    }
                },
                "deleteBookmarks": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").deleteBookmarks(
                            oServiceParams.oMessageData.body.sUrl);
                    }
                },
                "updateBookmarks": {
                    executeServiceCallFn: function (oServiceParams) {
                        return sap.ushell.Container.getService("Bookmark").updateBookmarks(
                            oServiceParams.oMessageData.body.sUrl,
                            oServiceParams.oMessageData.body.oParameters
                        );
                    }
                }
            }
        },
        "sap.ushell.services.AppConfiguration": {
            oServiceCalls: {
                "setApplicationFullWidth": {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.services.AppConfiguration.setApplicationFullWidth(
                            oServiceParams.oMessageData.body.bValue
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        }
    };


    function PostMessageAPI () {
    }

    PostMessageAPI.prototype.getAPIs = function () {
        this._registerAppRuntimeNewAPI();
        return oAPIs;
    };

    PostMessageAPI.prototype.addShellCommunicationHandler = function (sKey, oCommunicationEntry) {
        //only one entry is possible in oCommunicationHandler because we got here from registerShellCommunicationHandler!
        var oCommObject = oAPIs[sKey],
            oNewCommEntry;

        //We have the entry just update it
        if (oCommObject) {
            //add the communication handler to that entry
            if (oCommunicationEntry.oServiceCalls) {
                Object.keys(oCommunicationEntry.oServiceCalls).forEach(function (key) {
                    oCommObject.oServiceCalls[key] = oCommunicationEntry.oServiceCalls[key];
                });
            }

            if (oCommunicationEntry.oRequestCalls) {
                Object.keys(oCommunicationEntry.oRequestCalls).forEach(function (key) {
                    oCommObject.oRequestCalls[key] = oCommunicationEntry.oRequestCalls[key];
                });
            }

            return;
        }


        //create a new entry..
        oNewCommEntry = {
            oRequestCalls: {},
            oServiceCalls: {}
        };

        if (oCommunicationEntry.oServiceCalls) {
            Object.keys(oCommunicationEntry.oServiceCalls).forEach(function (key) {
                oNewCommEntry.oServiceCalls[key] = oCommunicationEntry.oServiceCalls[key];
            });
        }

        if (oCommunicationEntry.oRequestCalls) {
            Object.keys(oCommunicationEntry.oRequestCalls).forEach(function (key) {
                oNewCommEntry.oRequestCalls[key] = oCommunicationEntry.oRequestCalls[key];
            });
        }

        oAPIs[sKey] = oNewCommEntry;
    };

    PostMessageAPI.prototype._getPostMesageInterface = function (sServiceName, sInterface) {
        var oCommHandlerService;

        if (oAPIs[sServiceName]) {
            oCommHandlerService = oAPIs[sServiceName];
            if (oCommHandlerService && oCommHandlerService.oRequestCalls && oCommHandlerService.oRequestCalls[sInterface]) {
                return oCommHandlerService.oRequestCalls[sInterface];
            }
        }

        return undefined;
    };

    PostMessageAPI.prototype.registerShellCommunicationHandler = function (oCommunicationHandler) {
        var that = this,
            oEntry;

        Object.keys(oCommunicationHandler).forEach(function (sKey) {
            oEntry = oCommunicationHandler[sKey];
            that.addShellCommunicationHandler(sKey, oEntry);
        });
    };

    PostMessageAPI.prototype.isAppTypeSupported = function (oContainer, sServiceName, sInterface) {
        if (oContainer && oContainer.getAdditionalInformation && oContainer.getAdditionalInformation().startsWith("SAPUI5.Component=")) {
            return false;
        }

        var oCommandInterface = this._getPostMesageInterface(sServiceName, sInterface);

        if (!oCommandInterface || !oCommandInterface.distributionType) {
            return false;
        }

        if (oCommandInterface.distributionType.indexOf("all") >= 0) {
            return true;
        }

        if (oContainer.getApplicationType && oCommandInterface.distributionType.indexOf(oContainer.getApplicationType()) >= 0) {
            return true;
        }

        return false;
    };

    PostMessageAPI.prototype.isActiveOnly = function (sServiceName, sInterface) {
        var oCommandInterface = this._getPostMesageInterface(sServiceName, sInterface);

        if (oCommandInterface) {
            return oCommandInterface.isActiveOnly;
        }

        return undefined;
    };

    PostMessageAPI.prototype.getResponseHandler = function (sServiceName, sInterface) {
        var oCommandInterface = this._getPostMesageInterface(sServiceName, sInterface);

        if (oCommandInterface) {
            return oCommandInterface.fnResponseHandler;
        }

        return undefined;
    };

    PostMessageAPI.prototype._createNewInnerAppState = function (oServiceParams) {
        var oService = sap.ushell.Container.getService("AppState"),
            oNewState,
            sHash,
            sCurrAppStateKey,
            sNewAppStateKey,
            oValue;

        oNewState = oService.createEmptyAppState();
        if (oServiceParams.oMessageData.body.sData !== undefined) {
            try {
                oValue = JSON.parse(oServiceParams.oMessageData.body.sData);
            } catch (e) {
                oValue = oServiceParams.oMessageData.body.sData;
            }
        } else {
            oValue = "";
        }
        oNewState.setData(oValue);
        oNewState.save();
        sNewAppStateKey = oNewState.getKey();


        sHash = window.hasher.getHash();
        if (sHash.indexOf("&/") > 0) {
            if (sHash.indexOf("sap-iapp-state=") > 0) {
                sCurrAppStateKey = /(?:sap-iapp-state=)([^&/]+)/.exec(sHash)[1];
                sHash = sHash.replace(sCurrAppStateKey, sNewAppStateKey);
            } else {
                sHash = sHash + "/sap-iapp-state=" + sNewAppStateKey;
            }
        } else {
            sHash = sHash + "&/sap-iapp-state=" + sNewAppStateKey;
        }
        window.hasher.replaceHash(sHash);
        return sNewAppStateKey;
    };

    PostMessageAPI.prototype._setInnerAppStateData = function (oServiceParams) {
        //at the moment, replace the state with a new one
        return PostMessageAPI.prototype._createNewInnerAppState(oServiceParams);
    };

    PostMessageAPI.prototype._registerAppRuntimeNewAPI = function () {

        if (this.newAPIAdded !== undefined) {
            return;
        }
        this.newAPIAdded = true;

        this.registerShellCommunicationHandler({
            "sap.ushell.appRuntime": {
                oRequestCalls: {
                    "hashChange": {
                        isActiveOnly: true,
                        distributionType: ["URL"]
                    },
                    "setDirtyFlag": {
                        isActiveOnly: true,
                        distributionType: ["URL"]
                    },
                    "themeChange": {
                        isActiveOnly: false,
                        distributionType: ["URL"]
                    }
                },
                oServiceCalls: {
                    "hashChange": {
                        executeServiceCallFn: function (oServiceParams) {
                            window.hasher.replaceHash(oServiceParams.oMessageData.body.newHash);
                            return new jQuery.Deferred().resolve().promise();
                        }
                    }
                }
            },
            "sap.ushell.services.ShellNavigation": {
                oServiceCalls: {
                    "toExternal": { //ALON
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.Container.getService("ShellNavigation").toExternal(
                                oServiceParams.oMessageData.body.oArgs,
                                undefined,
                                oServiceParams.oMessageData.body.bWriteHistory
                            );
                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "toAppHash": { //ALON
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.Container.getService("ShellNavigation").toAppHash(
                                oServiceParams.oMessageData.body.sAppHash,
                                oServiceParams.oMessageData.body.bWriteHistory
                            );
                            return new jQuery.Deferred().resolve().promise();
                        }
                    }
                }
            },
            "sap.ushell.services.NavTargetResolution": {
                oServiceCalls: {
                    "getDistinctSemanticObjects": { //ALON
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("NavTargetResolution").getDistinctSemanticObjects();
                        }
                    },
                    "expandCompactHash": { //ALON
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("NavTargetResolution").expandCompactHash(
                                oServiceParams.oMessageData.body.sHashFragment
                            );
                        }
                    },
                    "resolveHashFragment": { //ALON
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("NavTargetResolution").expandCompactHash(
                                oServiceParams.oMessageData.body.sHashFragment
                            );
                        }
                    },
                    "isNavigationSupported": { //ALON
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("NavTargetResolution").isNavigationSupported(
                                oServiceParams.oMessageData.body.aIntents
                            );
                        }
                    }
                }
            },
            "sap.ushell.services.CrossApplicationNavigation": {
                oServiceCalls: {
                    "expandCompactHash": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("CrossApplicationNavigation").expandCompactHash(
                                oServiceParams.oMessageData.body.sHashFragment);
                        }
                    },
                    "getDistinctSemanticObjects": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("CrossApplicationNavigation").getDistinctSemanticObjects();
                        }
                    },
                    "getLinks": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("CrossApplicationNavigation").getLinks(
                                oServiceParams.oMessageData.body.vArgs);
                        }
                    },
                    "getPrimaryIntent": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("CrossApplicationNavigation").getPrimaryIntent(
                                oServiceParams.oMessageData.body.sSemanticObject,
                                oServiceParams.oMessageData.body.mParameters);
                        }
                    },
                    "hrefForAppSpecificHash": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("CrossApplicationNavigation").hrefForAppSpecificHash(
                                oServiceParams.oMessageData.body.sAppHash);
                        }
                    },
                    "isInitialNavigation": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("CrossApplicationNavigation").hrefForAppSpecificHash();
                        }
                    },
                    "getAppState": {
                        executeServiceCallFn: function (oServiceParams) {
                            var oDeferred = new jQuery.Deferred();

                            sap.ushell.Container.getService("CrossApplicationNavigation").getAppState(
                                oDummyComponent,
                                oServiceParams.oMessageData.body.sAppStateKey
                            ).done(function (oState) {
                                delete oState._oServiceInstance;
                                oDeferred.resolve(oState);
                            });

                            return oDeferred.promise();
                        }
                    },
                    "setInnerAppRoute": {
                        executeServiceCallFn: function (oServiceParams) {
                            var oUrlParsing = sap.ushell.Container.getService("URLParsing"),
                                oHash = oUrlParsing.parseShellHash(window.hasher.getHash()),
                                sNewHash;

                            oHash.appSpecificRoute = oServiceParams.oMessageData.body.appSpecificRoute;
                            sNewHash = "#" + oUrlParsing.constructShellHash(oHash);
                            window.hasher.replaceHash(sNewHash);
                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "setInnerAppStateData": {
                        executeServiceCallFn: function (oServiceParams) {
                            var sKey = PostMessageAPI.prototype._setInnerAppStateData(oServiceParams);
                            return new jQuery.Deferred().resolve(sKey).promise();
                        }
                    }

                }
            },
            "sap.ushell.services.renderer": {
                oServiceCalls: {
                    "showHeaderItem": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.showHeaderItem(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "showToolAreaItem": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.showToolAreaItem(
                                oServiceParams.oMessageData.body.sId,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "showActionButton": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.showActionButton(
                                oServiceParams.oMessageData.body.sId,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates,
                                oServiceParams.oMessageData.body.bIsFirst
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "showFloatingActionButton": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.showFloatingActionButton(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "showHeaderEndItem": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.showHeaderEndItem(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "setHeaderVisibility": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.setHeaderVisibility(
                                oServiceParams.oMessageData.body.bVisible,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "showSubHeader": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.showSubHeader(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "hideHeaderItem": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.hideHeaderItem(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "removeToolAreaItem": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.removeToolAreaItem(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "hideActionButton": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.hideActionButton(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "hideLeftPaneContent": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.hideLeftPaneContent(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "hideFloatingActionButton": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.hideFloatingActionButton(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "hideHeaderEndItem": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.hideHeaderEndItem(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "hideSubHeader": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.hideSubHeader(
                                oServiceParams.oMessageData.body.aIds,
                                oServiceParams.oMessageData.body.bCurrentState,
                                oServiceParams.oMessageData.body.aStates
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    /*------------------------------------------------ Adding controls functionality ------------------------------------------*/
                    "setLeftPaneVisibility": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.setLeftPaneVisibility(
                                oServiceParams.oMessageData.body.sLaunchpadState,
                                oServiceParams.oMessageData.body.bVisible
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    },
                    "showToolArea": {
                        executeServiceCallFn: function (oServiceParams) {
                            sap.ushell.renderers.fiori2.Renderer.showToolArea(
                                oServiceParams.oMessageData.body.sLaunchpadState,
                                oServiceParams.oMessageData.body.bVisible
                            );

                            return new jQuery.Deferred().resolve().promise();
                        }
                    }
                }
            },
            "sap.ushell.services.LaunchPage": {
                oServiceCalls: {
                    "getGroups": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").getGroups();
                        }
                    },
                    "getGroupsForBookmarks": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").getGroupsForBookmarks();
                        }
                    },
                    "getDefaultGroup": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").getDefaultGroup();
                        }
                    },
                    "addGroupAt": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").addGroupAt(
                                oServiceParams.oMessageData.body.sTitle,
                                oServiceParams.oMessageData.body.iIndex
                            );
                        }
                    },
                    "addGroup": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").addGroup(
                                oServiceParams.oMessageData.body.sTitle
                            );
                        }
                    },
                    "removeGroup": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").removeGroup(
                                oServiceParams.oMessageData.body.sTitle,
                                oServiceParams.oMessageData.body.iIndex
                            );
                        }
                    },
                    "resetGroup": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").resetGroup(
                                oServiceParams.oMessageData.body.sTitle,
                                oServiceParams.oMessageData.body.iIndex
                            );
                        }
                    },
                    "moveGroup": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").moveGroup(
                                oServiceParams.oMessageData.body.sTitle,
                                oServiceParams.oMessageData.body.iNewIndex
                            );
                        }
                    },
                    "setGroupTitle": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").setGroupTitle(
                                oServiceParams.oMessageData.body.oGroup,
                                oServiceParams.oMessageData.body.sTitle
                            );
                        }
                    },
                    "hideGroups": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").hideGroups(
                                oServiceParams.oMessageData.body.aHiddenGroupsIDs
                            );
                        }
                    },
                    "addTile": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").addTile(
                                oServiceParams.oMessageData.body.oGroup,
                                oServiceParams.oMessageData.body.oCatalogTile
                            );
                        }
                    },
                    "removeTile": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").removeTile(
                                oServiceParams.oMessageData.body.oGroup,
                                oServiceParams.oMessageData.body.oTile,
                                oServiceParams.oMessageData.body.iIndex
                            );
                        }
                    },
                    "moveTile": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").moveTile(
                                oServiceParams.oMessageData.body.oTile,
                                oServiceParams.oMessageData.body.iSourceIndex,
                                oServiceParams.oMessageData.body.iTargetIndex,
                                oServiceParams.oMessageData.body.oSourceGroup,
                                oServiceParams.oMessageData.body.oTargetGroup,
                                oServiceParams.oMessageData.body.sNewTileType
                            );
                        }
                    },
                    "getTileView": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").getTileView(
                                oServiceParams.oMessageData.body.oTile
                            );
                        }
                    },
                    "refreshTile": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").refreshTile(
                                oServiceParams.oMessageData.body.oTile
                            );
                        }
                    },
                    "registerTileActionsProvider": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").registerTileActionsProvider(
                                oServiceParams.oMessageData.body.fnProvider
                            );
                        }
                    },
                    "getCatalogTiles": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").getCatalogTiles(
                                oServiceParams.oMessageData.body.oCatalog
                            );
                        }
                    },
                    "getCatalogTileViewControl": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").getCatalogTileViewControl(
                                oServiceParams.oMessageData.body.oCatalogTile
                            );
                        }
                    },
                    "addBookmark": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").addBookmark(
                                oServiceParams.oMessageData.body.oParameters,
                                oServiceParams.oMessageData.body.oGroup
                            );
                        }
                    },
                    "countBookmarks": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").countBookmarks(
                                oServiceParams.oMessageData.body.sUrl
                            );
                        }
                    },
                    "deleteBookmarks": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").deleteBookmarks(
                                oServiceParams.oMessageData.body.sUrl
                            );
                        }
                    },
                    "updateBookmarks": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").updateBookmarks(
                                oServiceParams.oMessageData.body.sUrl,
                                oServiceParams.oMessageData.body.oParameters
                            );
                        }
                    },
                    "setTileVisible": {
                        executeServiceCallFn: function (oServiceParams) {
                            return sap.ushell.Container.getService("LaunchPage").setTileVisible(
                                oServiceParams.oMessageData.body.oTile,
                                oServiceParams.oMessageData.body.bNewVisible
                            );
                        }
                    }
                }
            }
        });
    };

    /**
     * Show/Hide UI blocker in the entire shell.
     * This functionality is needed for the cFLP scenario, when the
     * application that runs in the iframe locks the iframe UI (probably
     * sue to a dialog display) and as a result, the cFLP shell also needs
     * to lock itself.
     * The implementation is done in a non standard way by calling
     * private functions in the Popup class, and this is because the UI5
     * team was not able to provide duch functionality yet, and the POs
     * approved to go with this way
     *
     * @since 1.66.0
     * @private
     */
    function showUIBlocker (bShow) {
        if (bShow === true && oPopup === undefined) {
            oPopup = new Popup();
            oPopup.setShadow(true);
            oPopup.setModal(true, "sapMDialogBlockLayerInit");
            oPopup.setNavigationMode("SCOPE");
            oPopup.eOpenState = coreLib.OpenState.OPEN;
            jQuery('#shell-cntnt').css('zIndex', 40);
            oPopup._iZIndex = 30;
            oPopup._duringOpen();
        } else if (bShow === false && oPopup !== undefined) {
            //oPopup._hideBlockLayer();
            oPopup._oLastPosition = oPopup._oDefaultPosition;
            oPopup.destroy();
            oPopup = undefined;
            jQuery('#shell-cntnt').css('zIndex', 'auto');
        }
    }

    return new PostMessageAPI();
}, false);
