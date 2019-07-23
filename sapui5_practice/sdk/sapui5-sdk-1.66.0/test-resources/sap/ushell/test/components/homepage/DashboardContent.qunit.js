// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.components.homepage.DashboardContent
 */
(function () {
    "use strict";
    /*global asyncTest, deepEqual, module,
     ok, start, stop, test, jQuery, sap, sinon */
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.renderers.fiori2.AccessKeysHandler");
    jQuery.sap.require("sap.ushell.renderers.fiori2.RendererExtensions");
    jQuery.sap.require("sap.ushell.services.Container");
    jQuery.sap.require("sap.ushell.ui.launchpad.LoadingDialog");
    jQuery.sap.require("sap.ushell.Layout");
    jQuery.sap.require("sap.ushell.EventHub");
    jQuery.sap.require("sap.ushell.test.utils");

    var aGroups =
        [
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    false
                ]
            },
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    true
                ]
            },
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    true
                ]
            },
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    true
                ]
            },
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    true
                ]
            },
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    true
                ]
            },
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    true
                ]
            },
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    true
                ]
            },
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    true
                ]
            },
            {
                "isGroupVisible": true,
                "visibilityModes": [
                    true
                ]
            },
            {
                "isGroupVisible": false,
                "visibilityModes": [
                    true
                ]
            }
        ];


    //BCP 1780224822 - DashboardContent QUnit fails only in IE. IE throws error in sap.ui.core.FocusHandler.prototype.getCurrentFocusedControlId function when stubbing sap.ui.core().byId function,
    // that why we are overrided this function.
    sap.ui.core.FocusHandler.prototype.getCurrentFocusedControlId = function () {};

    var oController,
        fn_handleGroupVisibilityChangesTestHelper;
    var oEventHub = sap.ui.require("sap/ushell/EventHub");
    var oTestUtils = sap.ui.require("sap/ushell/test/utils");

    module("sap.ushell.components.flp.Component", {
        setup: function () {
            stop();
            sap.ushell.bootstrap("local").then(function () {
                oController = new sap.ui.controller("sap.ushell.components.homepage.DashboardContent");
                start();
            });
        },
        teardown: function () {
            delete sap.ushell.Container;
            oController.destroy();

            // Reset the EventHub to avoid multiple subscriptions
            oEventHub._reset();

            oTestUtils.restoreSpies(
                sap.ui.core.Component.getOwnerComponentFor,
                sap.ui.getCore().byId,
                sap.ui.getCore().getEventBus
            );
        }
    });

    [
        {
            testDescription: "short drop to a locked groups",
            oMockData: {
                dstArea: undefined,
                dstGroup: {
                    getBindingContext: function () {
                        return {
                            getProperty: function () {
                                return {
                                    isGroupLocked: true
                                };
                            }
                        };
                    }
                },
                dstGroupData: {},
                dstTileIndex: 3,
                srcArea: "links",
                srcGroup: {},
                tile: {
                    getBindingContext: function () {
                        return {
                            getObject: function () {
                                return {
                                    object: ''
                                };
                            }
                        };
                    }
                },
                tileMovedFlag: true
            },
            oExpected: {
                sPubType: "sortableStop",
                obj: {
                    "sortableStop":undefined
                }
            }
        },
        {
            testDescription: "convert tile to link in the group",
            oMockData: {
                dstArea: "links",
                dstGroup: {
                    getHeaderText: function () {
                        return "group4";
                    },
                    getBindingContext: function () {
                        return {
                            getProperty: function () {
                                return {
                                    isGroupLocked: false
                                };
                            }
                        };
                    }
                },
                dstGroupData: {
                    getGroupId: function () {
                        return "group4";
                    }
                },
                dstTileIndex: 5,
                srcArea: "tiles",
                srcGroup: {
                    getGroupId: function () {
                        return "group4";
                    }
                },
                tile: {
                    getMode: function () {
                        return "ContentMode";
                    },
                    getUuid: function () {
                        return "uuid1";
                    },
                    getBindingContext: function () {
                        return {
                            getPath: function () {
                                return "/groups/4/tiles/5";
                            },
                            getObject: function () {
                                return {
                                    object: ''
                                };
                            }
                        };
                    }

                },
                tileMovedFlag: true
            },
            oExpected: {
                sPubType: "convertTile",
                obj: {
                    "convertTile": {
                        callBack: undefined,
                        longDrop: undefined,
                        srcGroupId: "group4",
                        tile: undefined,
                        toGroupId: "group4",
                        toIndex: 5
                    }
                }
            }
        }

    ].forEach(function (oFixture) {
        asyncTest("Test - _handleDrop" + oFixture.testDescription, function () {
            var oModel = new sap.ui.model.json.JSONModel({
                    currentViewName: "home",
                    tileActionModeActive: true,
                    getProperty: function () {
                    },
                    groups: [
                        {}, {}, {}, {}, {
                            tiles: [
                                {},
                                {},
                                {},
                                {},
                                {},
                                {
                                    object: {
                                        title:"grp4 tile5"
                                    }
                                }
                            ],
                            links:[]
                        }

                    ]
                }),
                oData = {
                    additionalInformation: {
                        indexOf: function (data) {
                            return -1;
                        }
                    }
                };
            oController.getOwnerComponent = function () {
                return {
                    getMetadata: function () {
                        return {
                            getComponentName: function () {
                                return 1;
                            }
                        };
                    }
                };
            };
            oController.getView = sinon.stub().returns({
                getModel : function () {
                    return oModel;
                }
            });
            jQuery.sap.require("sap.ushell.components.homepage.ActionMode");
            sap.ushell.components.homepage.ActionMode.init(oModel);

            sap.ushell.Layout.getLayoutEngine = function () {
                return {
                    layoutEndCallback : function () {
                        return oFixture.oMockData;
                    },
                    _toggleAnchorItemHighlighting: function () {
                        return;
                    }
                };
            };

            sap.m.MessageToast.show = function () {

            };

            var getEventBusStub = sinon.stub(sap.ui.getCore(), 'getEventBus').returns(
                {
                    publish: function (sTopic, sMsg, oData) {
                        var oExpected = oFixture.oExpected.obj[sMsg];
                        if (oData) {
                            oData.callBack = undefined;
                        }
                        deepEqual(oData, oExpected , "Deep compare for: " + sMsg);
                    }
                }
            )/*,
                getLayoutEngineStub = sinon.stub(sap.ushell.Layout.getLayoutEngine(), '_toggleAnchorItemHighlighting')*/;
            setTimeout(function () {
                start();
                oController._handleDrop("","",oData);
                //getLayoutEngineStub.restore();
                getEventBusStub.restore();
            }, 0);
        });
    });


    test("Test - _appOpenedHandler", function () {
        var oModel = new sap.ui.model.json.JSONModel({
                currentViewName: "home",
                tileActionModeActive: true,
                getProperty: function () {
                }
            }),
            oData = {
                additionalInformation: {
                    indexOf: function (data) {
                        return -1;
                    }
                }
            };
        oController.getOwnerComponent = function () {
            return {
                getMetadata: function () {
                    return {
                        getComponentName: function () {
                            return 1;
                        }
                    };
                }
            };
        };
        oController.getView = sinon.stub().returns({
            getModel : function () {
                return oModel;
            }
        });

        oController.oDashboardUIActionsModule = {};
        oController.oDashboardUIActionsModule.disableAllDashboardUiAction = sinon.stub();

        jQuery.sap.require("sap.ushell.components.homepage.ActionMode");
        sap.ushell.components.homepage.ActionMode.init(oModel);

        ok(sap.ushell.components.homepage.ActionMode.oModel.getProperty("/tileActionModeActive") === true , "Action mode is true at start test");
        oController._appOpenedHandler("","",oData);
        ok(sap.ushell.components.homepage.ActionMode.oModel.getProperty("/tileActionModeActive") === false , "Action mode is false after _appOpenedHandler ");
        ok(oController.oDashboardUIActionsModule.disableAllDashboardUiAction.calledOnce, "disableAllDashboardUiAction was called");
    });

    test("Test scrollToFirstVisibleGroup: no groups", function () {

        var oData = {};

        oController.oView = {
            oDashboardGroupsBox: {
                getGroups: function () {
                    return null;
                }
            }
        };
        try {
            oController._scrollToFirstVisibleGroup(null, null, oData);
        } catch (e) {
            ok(false, "scrollToFirstVisibleGroup breaks on no-groups");
        }
        ok(true, "scrollToFirstVisibleGroup works with no groups");

    });

    test("Test modelLoaded", function () {
        jQuery.sap.require("sap.ushell.components.homepage.DashboardUIActions");
        var fOriginalModelInitialized = oController.bModelInitialized,
            oLayoutStab = sap.ushell.Layout,
            uiActionsInitStub,
            oTempViewData = {
                bModelInitialized : false,
                getModel: function () {
                    return {};
                },
                getController: function () {
                    return oController;
                }
            };

        oController.bModelInitialized = false;
        uiActionsInitStub = sinon.stub(oController, "_initializeUIActions").returns();
        sap.ushell.Layout =  {
            getInitPromise: function () {
                return jQuery.Deferred().resolve();
            }
        };
        oController.getView = function () {
            return oTempViewData;
        };

        oController._modelLoaded.apply(oController);

        ok(oController.bModelInitialized === true, "bModelInitialized is set to true");
        ok(uiActionsInitStub.calledOnce, "_handleUIActions is called once");

        uiActionsInitStub.restore();
        oController.bModelInitialized = fOriginalModelInitialized;
        sap.ushell.Layout = oLayoutStab;
    });

    test("Test scrollToFirstVisibleGroup: no groups", function () {

        var oData = {};

        oController.oView = {
            oDashboardGroupsBox: {
                getGroups: function () {
                    return null;
                }
            }
        };
        try {
            oController._scrollToFirstVisibleGroup(null, null, oData);
        } catch (e) {
            ok(false, "scrollToFirstVisibleGroup breaks on no-groups");
        }
        ok(true, "scrollToFirstVisibleGroup works with no groups");

    });

    test("Test scrollToGroup: no groups", function () {

        var oData = {};

        oController.oView = {
            oDashboardGroupsBox: {
                getGroups: function () {
                    return null;
                }
            }
        };
        oController.getView = function () {
            return {
                getModel: function () {
                    return {
                        getProperty: function () {
                            return null;
                        }
                    };
                }
            };
        };
        try {
            oController._scrollToGroup(null, null, oData);
        } catch (e) {
            ok(false, "scrollToGroup breaks on no-groups");
        }
        ok(true, "scrollToGroup works with no groups");

    });

    test("Animation Switch - when in the model the value of '.animationMode' is 'mininaml', animation duration is 0", function () {
        var oData = {};
        oController.oView = {
            oDashboardGroupsBox: {
                getGroups: function () {
                    return null;
                }
            }
        };
        oController.getView = function () {
            return {
                getModel: function () {
                    return {
                        getProperty: function () {
                            return 'minimal';
                        }
                    };
                }
            };
        };
        try {
            oController._scrollToGroup(null, null, oData);
        } catch (e) {
            ok(false, "scrollToGroup breaks on Animation Switch");
        }
        ok(oController.iAnimationDuration === 0, "animation duration is not 0");

    });

    asyncTest("Test _onAfterDashboardShow with home state", function () {
        var oModel = new sap.ui.model.json.JSONModel({
                currentViewName: "home",
                tileActionModeActive: false,
                getProperty: function () {
                }
            }),
            getRendererStub = sinon.stub(sap.ushell.Container, "getRenderer").returns({
                getCurrentViewportState: sinon.spy(),
                createExtendedShellState: sinon.spy(),
                applyExtendedShellState: sinon.spy(),
                getRouter: sinon.stub().returns({
                    getRoute: sinon.stub().returns({
                        attachMatched: sinon.stub()
                    })
                }),
                getCurrentCoreView: sinon.stub().returns("home")
            }),
            oOrigCore = sap.ui.getCore(),
            oGetCoreByIdStub = sinon.stub(oOrigCore, 'byId').returns({
                shiftCenterTransitionEnabled: function () {},
                shiftCenterTransition: function () {},
                attachAfterNavigate: function () {
                },
                enlargeCenterTransition: function (bFlag) {}
            }),
            oView = sap.ui.view({
                viewName: "sap.ushell.components.homepage.DashboardContent",
                type: "JS",
                async: true
            });

        oView.setModel(oModel);

        oView.loaded().then(function () {
            var oEventSent,
                onAfterNavigateStub = sinon.stub(oView, 'onAfterNavigate').returns({}),
                handleTilesVisibilityStub = sinon.stub(sap.ushell.utils, 'handleTilesVisibility'),
                refreshTilesStub = sinon.stub(sap.ushell.utils, 'refreshTiles');

            oEventHub.emit("CenterViewPointContentRendered", {"groups":0});
            oEventSent = oEventHub.wait("CenterViewPointContentRendered");
            oEventSent.then(function () {
                ok(onAfterNavigateStub.called, "onAfterNavigate called");
                ok(handleTilesVisibilityStub.called, "handleTilesVisibility was called");
                oGetCoreByIdStub.restore();
                handleTilesVisibilityStub.restore();
                refreshTilesStub.restore();
                getRendererStub.restore();
                oView.destroy();
                start();
            });
        });

    });

    asyncTest("Test handleDashboardScroll", function () {

        var updateTopGroupInModelStub = sinon.stub(oController, "_updateTopGroupInModel"),
            getRendererStub = sinon.stub(sap.ushell.Container, "getRenderer").returns({
                addActionButton: sinon.spy(),
                getCurrentViewportState: function () {
                    return 'Center';
                },
                showRightFloatingContainer: sinon.spy(),
                createExtendedShellState: sinon.spy(),
                applyExtendedShellState: sinon.spy()
            }),
            handleTilesVisibilitySpy = sinon.spy(sap.ushell.utils, "handleTilesVisibility"),
            originView = oController.getView,
            reArrangeNavigationBarElementsSpy,
            closeOverflowPopupSpy,
            oModel = new sap.ui.model.json.JSONModel({
                scrollingToGroup: false
            }),
            oView = {
                oAnchorNavigationBar: {
                    reArrangeNavigationBarElements: function () {
                    },
                    closeOverflowPopup: function () {
                    }
                },
                getModel: function () {
                    return oModel;
                },
                _handleHeadsupNotificationsPresentation: sinon.spy()
            };

        oController.getView = function () {
            return oView;
        };

        reArrangeNavigationBarElementsSpy = sinon.spy(oController.getView().oAnchorNavigationBar, "reArrangeNavigationBarElements");
        closeOverflowPopupSpy = sinon.spy(oController.getView().oAnchorNavigationBar, "closeOverflowPopup");

        oController._handleDashboardScroll();



        setTimeout(function () {
            ok(updateTopGroupInModelStub.calledOnce, 'updateTopGroupInModel is called once');
            ok(handleTilesVisibilitySpy.calledOnce, 'handleTilesVisibility is called once');
            ok(reArrangeNavigationBarElementsSpy.calledOnce, "reArrangeNavigationBarElementsSpy is called once");
            ok(closeOverflowPopupSpy.calledOnce, "closeOverflowPopupSpy is called once");
            updateTopGroupInModelStub.restore();

            handleTilesVisibilitySpy.restore();
            getRendererStub.restore();
            oController.getView = originView;
            start();
        }, 1001);
    });

    test("Test - updateTopGroupInModel", function () {

        var oModel = new sap.ui.model.json.JSONModel({
                groups: aGroups
            }),
            originView = oController.getView;

        var oGetIndexOfTopGroupInViewPort = sinon.stub(oController, '_getIndexOfTopGroupInViewPort').returns(5);

        oController.getView = sinon.stub().returns({
            getModel : function () {
                return oModel;
            }
        });

        oController._updateTopGroupInModel();

        ok(oGetIndexOfTopGroupInViewPort.calledOnce, "getIndexOfTopGroupInViewPort is called once");

        ok(oModel.getProperty("/iSelectedGroup") === 6, "selected group in model is 6");
        ok(oModel.getProperty("/topGroupInViewPortIndex") === 5, "anchore bar tab number 5 is selected");

        oGetIndexOfTopGroupInViewPort.restore();
        oController.getView = originView;
    });


    test("Test - handleDrag update model", function () {
        var oModel = new sap.ui.model.json.JSONModel({
            draggedTileLinkPersonalizationSupported: false
        });

        oController.getView = sinon.stub().returns({
            getModel : function () {
                return oModel;
            }
        });

        var oTestTile = {
            tile: {
                getBindingContext: function () {
                    return {
                        getObject: function () {
                             return {};
                        }
                    } ;
                }
            }
        };

        sap.ushell.Layout.getLayoutEngine = function () {
            return {
                layoutEndCallback: function () {
                    return oTestTile;
                },
                _toggleAnchorItemHighlighting: function () {
                    return;
                }
            };
        };

        sap.ushell.Container.getService = function () {
            return {
                isLinkPersonalizationSupported: function () {
                    return true;
                }
            };
        };

        oController._handleDrag();
        ok(oModel.getProperty("/draggedTileLinkPersonalizationSupported"), "draggedTileLinkPersonalizationSupported has changed");

        sap.ushell.Container.getService = function () {
            return {
                isLinkPersonalizationSupported: function () {
                    return false;
                }
            };
        };

        oController._handleDrag();
        ok(!oModel.getProperty("/draggedTileLinkPersonalizationSupported"), "draggedTileLinkPersonalizationSupported has changed");

    });

    /**
     * Test DashboardContent controller's function _notificationsUpdateCallback.
     *
     * _notificationsUpdateCallback is invoked three times during the test, and each time that it queries notifications service for updated notifications
     * - it gets different data (aNotificationsFromService_1, null and aNotificationsFromService_2).
     * _notificationsUpdateCallback finds the first (up to) five new high-priority notifications and updates the model (aPreviewNotification)
     * The test checks the objects in the model property (array) aPreviewNotification after each call to _notificationsUpdateCallback
     */
    // asyncTest("Test - Notifications preview update callback", function () {
    //     var oOriginalGetService = sap.ushell.Container.getService,
    //         oInnerSetPropertySpy = sinon.spy(),
    //         oClock = sinon.useFakeTimers(),
    //         aNotificationsFromService_1 = [
    //             {"Id": "Notification0", "Priority": "MEDIUM", "CreatedAt": "2016-02-29T15:53:26Z", "NavigationTargetObject" : "Object1", "NavigationTargetAction": "Action1", "NavigationTargetParams": "Params1"},
    //             {"Id": "Notification1", "Priority": "HIGH", "CreatedAt": "2016-02-29T15:43:26Z", "NavigationTargetObject" : "Object2", "NavigationTargetAction": "Action2", "NavigationTargetParams": "Params2"},
    //             {"Id": "Notification2", "Priority": "HIGH", "CreatedAt": "2016-02-29T15:23:26Z"},
    //             {"Id": "Notification3", "Priority": "HIGH", "CreatedAt": "2016-02-29T14:53:26Z"},
    //             {"Id": "Notification4", "Priority": "HIGH", "CreatedAt": "2016-02-28T15:53:26Z"}
    //         ],
    //         aNotificationsFromService_2 = [
    //             {"Id": "Notification5", "Priority": "MEDIUM", "CreatedAt": "2016-03-28T15:53:26Z"},
    //             {"Id": "Notification0", "Priority": "MEDIUM", "CreatedAt": "2016-02-29T15:53:26Z"},
    //             {"Id": "Notification1", "Priority": "HIGH", "CreatedAt": "2016-02-29T15:43:26Z"},
    //             {"Id": "Notification2", "Priority": "HIGH", "CreatedAt": "2016-02-29T15:23:26Z"},
    //             {"Id": "Notification3", "Priority": "HIGH", "CreatedAt": "2016-02-29T14:53:26Z"},
    //             {"Id": "Notification4", "Priority": "HIGH", "CreatedAt": "2016-02-28T15:53:26Z"}
    //         ],
    //         // now 3 items were dismissed from the notifications view
    //         aNotificationsFromService_3 = [
    //             {"Id": "Notification0", "Priority": "MEDIUM", "CreatedAt": "2016-02-29T15:53:26Z"},
    //             {"Id": "Notification2", "Priority": "HIGH", "CreatedAt": "2016-02-29T15:23:26Z"}
    //         ],
    //         aPreviewNotification = [],
    //         iCallCount = 0,
    //         oByIdStub;
    //
    //     oByIdStub = sinon.stub(sap.ui.getCore(), 'byId').returns({
    //         setEnableBounceAnimations : function () {},
    //         getCurrentState : function () {
    //             return "Center";
    //         },
    //         getProperty : function (sProperty) {
    //             if (sProperty === "datetime") {
    //                 return "2016-03-16T14:10:40Z";
    //             }
    //         },
    //         getDatetime : function () {
    //             return "2016-02-16T14:10:40Z";
    //         }
    //     });
    //
    //     // We want getModel().getProperty("/previewNotificationItems") to return the local array aPreviewNotification
    //     //and getModel().setProperty("/previewNotificationItems", oValue) - to update it
    //     oController.oView = {
    //         getModel : function () {
    //             return {
    //                 getProperty : function (aProperty) {
    //                     if (aProperty === "/previewNotificationItems") {
    //                         return aPreviewNotification;
    //                     }
    //                 },
    //                 setProperty : function (sProperty, oValue) {
    //                     if (sProperty === "/previewNotificationItems") {
    //                         oInnerSetPropertySpy();
    //                         aPreviewNotification = oValue;
    //                     }
    //                 }
    //             };
    //         }
    //     };
    //
    //     sap.ushell.Container.getService = function (sServiceName) {
    //         if (sServiceName === "Notifications") {
    //             return {
    //                 // The tested callback _notificationsUpdateCallback calls getNotifications (of notifications service)  during the test,
    //                 // three times during this test, each call should returns different data:
    //                 // The first call returns aNotificationsFromService_1
    //                 // The second call returns an empty array
    //                 // The third call returns aNotificationsFromService_2
    //                 getNotifications : function () {
    //                     iCallCount++;
    //                     if (iCallCount === 1) {
    //                         return jQuery.Deferred().resolve(aNotificationsFromService_1);
    //                     }
    //                     if (iCallCount === 2) {
    //                         return jQuery.Deferred().resolve(aNotificationsFromService_1);
    //                     }
    //                     if (iCallCount === 3) {
    //                         return jQuery.Deferred().resolve(aNotificationsFromService_2);
    //                     }
    //                     if (iCallCount === 4) {
    //                         return jQuery.Deferred().resolve(aNotificationsFromService_3);
    //                     }
    //                 },
    //                 _formatAsDate : function (sUnformated) {
    //                     return new Date(sUnformated);
    //                 }
    //             };
    //         }
    //     };
    //
    //     // First call to the notifications update callback
    //     oController._notificationsUpdateCallback();
    //     ok(aPreviewNotification.length === 5, "After 1st call to _notificationsUpdateCallback - there are 5 notifications on the model in previewNotificationItems");
    //     ok(aPreviewNotification[0].originalItemId === "Notification0", "After 1st call to _notificationsUpdateCallback - Correct first notification (Notification0)");
    //     ok(aPreviewNotification[0].NavigationTargetObject=== "Object1", "After 1st call to _notificationsUpdateCallback - Correct first notification (Notification0)");
    //     ok(aPreviewNotification[0].NavigationTargetAction=== "Action1", "After 1st call to _notificationsUpdateCallback - Correct first notification (Notification0)");
    //     ok(aPreviewNotification[0].NavigationTargetParams=== "Params1", "After 1st call to _notificationsUpdateCallback - Correct first notification (Notification0)");
    //     ok(aPreviewNotification[3].originalItemId === "Notification3", "After 1st call to _notificationsUpdateCallback - Correct last notification (Notification3)");
    //     ok(oInnerSetPropertySpy.callCount === 1, "After 1st call to _notificationsUpdateCallback - setProperty(previewNotificationItems) called once");
    //
    //     // Second call to the notifications update callback, no new notifications
    //     oController._notificationsUpdateCallback();
    //     ok(aPreviewNotification.length === 5, "After 2nd call to _notificationsUpdateCallback - there are 2 notifications on the model in previewNotificationItems");
    //     ok(aPreviewNotification[0].originalItemId === "Notification0", "After 2nd call to _notificationsUpdateCallback - Correct first notification (Notification0)");
    //     ok(aPreviewNotification[3].originalItemId === "Notification3", "After 2nd call to _notificationsUpdateCallback - Correct last notification (Notification3)");
    //     ok(oInnerSetPropertySpy.callCount === 1, "After 2st call to _notificationsUpdateCallback - setProperty(previewNotificationItems) called for the 2nd time");
    //
    //     // Third call to the notifications update callback
    //     oController._notificationsUpdateCallback();
    //     oClock.tick(1100);
    //     ok(aPreviewNotification.length === 5, "After 3rd call to _notificationsUpdateCallback - there are 5 notifications on the model in previewNotificationItems");
    //     ok(aPreviewNotification[0].originalItemId === "Notification5", "After 3rd call to _notificationsUpdateCallback - Correct first notification (Notification5)");
    //     ok(aPreviewNotification[1].originalItemId === "Notification0", "After 3rd call to _notificationsUpdateCallback - Correct second notification (Notification0)");
    //     ok(aPreviewNotification[2].originalItemId === "Notification1", "After 3rd call to _notificationsUpdateCallback - Correct third notification (Notification1)");
    //     ok(aPreviewNotification[3].originalItemId === "Notification2", "After 3rd call to _notificationsUpdateCallback - Correct fourth notification (Notification2)");
    //     ok(aPreviewNotification[4].originalItemId === "Notification3", "After 3rd call to _notificationsUpdateCallback - Correct fifth notification (Notification3)");
    //     ok(aPreviewNotification[5] === undefined, "After 3rd call to _notificationsUpdateCallback - No 6th item previewNotificationItems");
    //     //ok(oInnerSetPropertySpy.callCount === 2, "After 3rd call to _notificationsUpdateCallback - setProperty(previewNotificationItems) called for the 2nd time");
    //
    //     // Fourth call to the notifications update callback, no new notifications
    //     oController._notificationsUpdateCallback();
    //     ok(aPreviewNotification.length === 2, "After 4th call to _notificationsUpdateCallback - there are 3 notifications on the model in previewNotificationItems");
    //     ok(aPreviewNotification[0].originalItemId === "Notification0", "After 4th call to _notificationsUpdateCallback - Correct first notification (Notification0)");
    //     ok(aPreviewNotification[1].originalItemId === "Notification2", "After 4th call to _notificationsUpdateCallback - Correct fifth notification (Notification2)");
    //     //ok(oInnerSetPropertySpy.callCount === 3, "After 4th call to _notificationsUpdateCallback - setProperty(previewNotificationItems) not called");
    //
    //     sap.ushell.Container.getService = oOriginalGetService;
    //     start();
    //     oClock.restore();
    //     oByIdStub.restore();
    // });

    test("Test - Groups Layout is re-arranged only when the dashboard is visible", function () {
        var addBottomSpaceStub = sinon.stub(oController, '_addBottomSpace'),
            handleTilesVisibilitySpy = sinon.stub(sap.ushell.utils, 'handleTilesVisibility'),
            jQueryStub = sinon.stub(jQuery, "filter").returns(["found"]),
            reRenderGroupsLayoutSpy = sinon.spy(sap.ushell.Layout, 'reRenderGroupsLayout'),
            initializeUIActionsStub = sinon.stub(oController, '_initializeUIActions');

        oController._resizeHandler();
        ok(reRenderGroupsLayoutSpy.calledOnce, "Groups Layout should be re-arranged if dashBoardGroupsContainer is visible");
        jQueryStub.restore();

        jQueryStub = sinon.stub(jQuery, "filter").returns([]);
        oController._resizeHandler();
        ok(reRenderGroupsLayoutSpy.calledOnce, "Groups Layout should not be re-arranged if dashBoardGroupsContainer is invisible");

        jQueryStub.restore();
        addBottomSpaceStub.restore();
        handleTilesVisibilitySpy.restore();
        initializeUIActionsStub.restore();
    });

    // fnHandleNotificationsPreviewTestHelper = function (sCurrentViewPortState, bExpected_ShowRightFloatingContainerCalled, bExpectedShow, iBottomRectValue, bHeadsupNotificationsInitialyVisible) {
    //     var getRendererStub = sinon.stub(sap.ushell.Container, 'getRenderer').returns({
    //             addActionButton: sinon.spy(),
    //             getCurrentViewportState: function () {
    //                 return sCurrentViewPortState;
    //             },
    //             showRightFloatingContainer: sinon.spy(),
    //             createExtendedShellState: sinon.spy(),
    //             applyExtendedShellState: sinon.spy()
    //         }),
    //         oModel = new sap.ui.model.json.JSONModel({
    //             currentViewName: undefined,
    //             getProperty: function () {
    //             }
    //         }),
    //         oOwnerComponentStub = sinon.stub(sap.ui.core.Component, 'getOwnerComponentFor').returns({
    //             getModel: function () {
    //                 return oModel;
    //             }
    //         }),
    //         oOrigCore = sap.ui.getCore(),
    //         oGetCoreByIdStub = sinon.stub(oOrigCore, 'byId').returns({
    //             shiftCenterTransitionEnabled: function () {},
    //             shiftCenterTransition: function () {},
    //             attachAfterNavigate: function () {
    //             },
    //             setEnableBounceAnimations: function (bFlag) {
    //                 return;
    //             },
    //             getCurrentPage: function () {
    //                 return {
    //                     getViewName: function () {
    //                         return "sap.ushell.components.homepage.DashboardContent";
    //                     }
    //                 };
    //             },
    //             setRight: function() {}
    //         }),
    //         oView = sap.ui.jsview('sap.ushell.components.homepage.DashboardContent'),
    //         fnRegisterNotificationsUpdateSpy = sinon.spy(),
    //         getServiceStub = sinon.stub(sap.ushell.Container, "getService").returns({
    //             registerNotificationsUpdateCallback: fnRegisterNotificationsUpdateSpy,
    //             isFirstDataLoaded: function () {
    //                 return true;
    //             },
    //             getNotifications: function () {
    //                 return jQuery.Deferred().resolve([]);
    //             }
    //         });

    //     oView.oPreviewNotificationsContainer = {
    //         getDomRef: function () {
    //             return {
    //                 getBoundingClientRect: function () {
    //                     return {bottom: iBottomRectValue};
    //                 }
    //             };
    //         }
    //     };
    //     oView.bHeadsupNotificationsInitialyVisible = bHeadsupNotificationsInitialyVisible;
    //     oView._handleHeadsupNotificationsPresentation(sCurrentViewPortState);

    //     ok(sap.ushell.Container.getRenderer().showRightFloatingContainer.calledOnce === bExpected_ShowRightFloatingContainerCalled, "showRightFloatingContainer was called");
    //     ok(sap.ushell.Container.getRenderer().showRightFloatingContainer.args[0][0] === bExpectedShow, "showRightFloatingContainerCalled was called with the argument value: " + bExpectedShow);

    //     //Clean after tests.
    //     getRendererStub.restore();
    //     oOwnerComponentStub.restore();
    //     oGetCoreByIdStub.restore();
    //     getServiceStub.restore();
    //     oView.destroy();
    // };

    // test("test the presentation of the headsup container when the viewport is in state is Center and previewNotifications container is in the screen viewport", function () {
    //     fnHandleNotificationsPreviewTestHelper('Center', true, false, 1, true);
    // });
    //
    // test("test the presentation of the headsup container when the viewport is in state is Center and previewNotifications container is not the screen viewport", function () {
    //     fnHandleNotificationsPreviewTestHelper('Center', true, true, -1, true);
    // });
    //
    // test("test the presentation of the headsup container when the viewport  state is switched to Right and its' presentation was initialy disabled", function () {
    //     fnHandleNotificationsPreviewTestHelper('Right', true, false, -1/*doesn't matter*/, false);
    // });
    //
    // test("test the presentation of the headsup container when the viewport  state is switched to Right and its' presentation was initialy enabled", function () {
    //     fnHandleNotificationsPreviewTestHelper('Right', true, true, -1/*doesn't matter*/, true);
    // });

    // fn_handleNotificationsPreviewVisibilityTestHelper = function (bEnableNotificationsPreview) {
    //     var getRendererStub = sinon.stub(sap.ushell.Container, 'getRenderer').returns({
    //             addActionButton: sinon.spy(),
    //             getCurrentViewportState: function () {
    //                 return 'Center';
    //             },
    //             showRightFloatingContainer: sinon.spy(),
    //             createExtendedShellState: sinon.spy(),
    //             applyExtendedShellState: sinon.spy(),
    //             getRightFloatingContainerVisibility: sinon.spy()
    //         }),
    //         oModel = new sap.ui.model.json.JSONModel({
    //             currentViewName: undefined,
    //             getProperty: function () {
    //             }
    //         }),
    //         oOwnerComponentStub = sinon.stub(sap.ui.core.Component, 'getOwnerComponentFor').returns({
    //             getModel: function () {
    //                 return oModel;
    //             }
    //         }),
    //         oOrigCore = sap.ui.getCore(),
    //         oGetCoreByIdStub = sinon.stub(oOrigCore, 'byId').returns({
    //             shiftCenterTransitionEnabled: function () {},
    //             shiftCenterTransition: function () {},
    //             attachAfterNavigate: function () {
    //             },
    //             setEnableBounceAnimations: function (bFlag) {
    //                 return;
    //             },
    //             getCurrentPage: function () {
    //                 return {
    //                     getViewName: function () {
    //                         return "sap.ushell.components.homepage.DashboardContent";
    //                     }
    //                 };
    //             },
    //             setRight: function() {}
    //         }),
    //         getEventBusStub = sinon.stub(oOrigCore, 'getEventBus').returns({
    //             subscribe: sinon.spy()
    //         }),
    //         oView = sap.ui.jsview('sap.ushell.components.homepage.DashboardContent'),
    //         fnRegisterNotificationsUpdateSpy = sinon.spy(),
    //         getServiceStub = sinon.stub(sap.ushell.Container, "getService").returns({
    //             registerNotificationsUpdateCallback: fnRegisterNotificationsUpdateSpy,
    //             isFirstDataLoaded: function () {
    //                 return true;
    //             },
    //             getNotifications: function () {
    //                 return jQuery.Deferred().resolve([]);
    //             }
    //         });

    //     oView.oDashboardGroupsBox.toggleStyleClass = sinon.spy();
    //     oView.oAnchorNavigationBar.toggleStyleClass = sinon.spy();

    //     oView._handleNotificationsPreviewVisibility(bEnableNotificationsPreview);

    //     ok(oView.oDashboardGroupsBox.toggleStyleClass.calledOnce === true, "toggle style class for adding the class which 'sqeezes' the dashboard: called");
    //     ok(oView.oDashboardGroupsBox.toggleStyleClass.args[0][0] === 'sapUshellDashboardGroupsContainerSqueezed' , "toggled class is: 'sapUshellDashboardGroupsContainerSqueezed'");
    //     ok(oView.oDashboardGroupsBox.toggleStyleClass.args[0][1] === bEnableNotificationsPreview , "toggle class isn't successfull'");

    //     ok(oView.oAnchorNavigationBar.toggleStyleClass.calledOnce === true, "toggle style class for adding the class which 'sqeezes' the dashboard: called");
    //     ok(oView.oAnchorNavigationBar.toggleStyleClass.args[0][0] === 'sapUshellAnchorNavigationBarSqueezed' , "toggled class is: 'sapUshellAnchorNavigationBarSqueezed'");
    //     ok(oView.oAnchorNavigationBar.toggleStyleClass.args[0][1] === bEnableNotificationsPreview , "toggle class isn't successfull'");

    //     ok(fnRegisterNotificationsUpdateSpy.calledOnce === bEnableNotificationsPreview, "notification callback registration isn't successfull");

    //     //Clean after tests.
    //     getRendererStub.restore();
    //     oOwnerComponentStub.restore();
    //     oGetCoreByIdStub.restore();
    //     getEventBusStub.restore();
    //     getServiceStub.restore();
    //     oView.destroy();
    // };


    // test("check dashboard and anchor navigation control are 'squeezed' when Preview Navigation container is present and that all relavant handlers are registered", function () {
    //     fn_handleNotificationsPreviewVisibilityTestHelper(true);
    // });
    //
    // test("check dashboard and anchor navigation control are not 'squeezed' when Preview Navigation container is not present and that no redundant handler registration is being done", function () {
    //     fn_handleNotificationsPreviewVisibilityTestHelper(false);
    // });

    asyncTest("show hide groups invoked upon 'actionModeInactive' event", function () {
        var oModel = new sap.ui.model.json.JSONModel({}),
            oOwnerComponentStub = sinon.stub(sap.ui.core.Component, 'getOwnerComponentFor').returns({
                getModel: function () {
                    return oModel;
                }
            }),
            oEventBus = sap.ui.getCore().getEventBus(),
            handleTilesVisibilityStub = sinon.stub(sap.ushell.utils, 'handleTilesVisibility'),
            getCurrentHiddenGroupIdsStub = sinon.stub(sap.ushell.utils, 'getCurrentHiddenGroupIds').returns([]);

        oEventBus.publish('launchpad', 'actionModeInactive', []);
        setTimeout(function () {
            ok(getCurrentHiddenGroupIdsStub.called, "getCurrentHiddenGroups is called");
            oOwnerComponentStub.restore();

            handleTilesVisibilityStub.restore();
            getCurrentHiddenGroupIdsStub.restore();
            start();

        }, 350);
    });

    fn_handleGroupVisibilityChangesTestHelper = function (sCurrentHiddenGroupIds, aOrigHiddenGroupsIds, bExpectedHideGroupsCalled) {
        var getRendererStub = sinon.stub(sap.ushell.Container, 'getRenderer').returns({
                addActionButton: sinon.spy(),
                getCurrentViewportState: function () {
                    return 'Center';
                },
                showRightFloatingContainer: sinon.spy(),
                createExtendedShellState: sinon.spy(),
                applyExtendedShellState: sinon.spy(),
                getRightFloatingContainerVisibility: sinon.spy(),
                getRouter: sinon.stub().returns({
                    getRoute: sinon.stub().returns({
                        attachMatched: sinon.stub()
                    })
                })
            }),
            oModel = new sap.ui.model.json.JSONModel({
                currentViewName: undefined
            }),
            oOrigCore = sap.ui.getCore(),
            oGetCoreByIdStub = sinon.stub(oOrigCore, 'byId').returns({
                shiftCenterTransitionEnabled: function () {},
                shiftCenterTransition: function () {},
                attachAfterNavigate: function () {
                },
                setEnableBounceAnimations: function (bFlag) {
                    return;
                },
                getCenterViewPort: function () {
                    return [{
                        getComponent: function () {
                            return "__renderer0---Shell-home-component";
                        }
                    }];
                },
                setRight: function () {}
            }),
            getEventBusStub = sinon.stub(oOrigCore, 'getEventBus').returns({
                subscribe: sinon.spy()
            }),
            oView = sap.ui.view({
                viewName: "sap.ushell.components.homepage.DashboardContent",
                type: "JS",
                async: true
            });

        oView.setModel(oModel);
        oView.loaded().then(function () {
            var getServiceStub = sinon.stub(sap.ushell.Container, "getService").returns({
                    hideGroups: sinon.stub().returns(jQuery.Deferred().resolve())
                }),
                oTestController = oView.getController(),
                oGetCurrentHiddenGroupIdsStub = sinon.stub(sap.ushell.utils, "getCurrentHiddenGroupIds").returns(
                    sCurrentHiddenGroupIds
                );

            oTestController._handleGroupVisibilityChanges('test', 'test', aOrigHiddenGroupsIds);

            ok(getServiceStub().hideGroups.called === bExpectedHideGroupsCalled, "hideGroups is called");

            //Clean after tests.
            getRendererStub.restore();

            oGetCoreByIdStub.restore();
            getEventBusStub.restore();
            getServiceStub.restore();
            oGetCurrentHiddenGroupIdsStub.restore();
            oView.destroy();
            start();
        });
    };

    asyncTest("test show hide groups when user hides a group", function () {
        var sCurrentHiddenGroupIds = ['testGroupId1', 'testGroupId2', 'testGroupId3'],
            aOrigHiddenGroupsIds = ['testGroupId1', 'testGroupId2'];

        fn_handleGroupVisibilityChangesTestHelper(sCurrentHiddenGroupIds, aOrigHiddenGroupsIds, true);
    });

    asyncTest("test show hide groups when user ub-hides a group", function () {
        var sCurrentHiddenGroupIds = ['testGroupId1'],
            aOrigHiddenGroupsIds = ['testGroupId1', 'testGroupId2'];

        fn_handleGroupVisibilityChangesTestHelper(sCurrentHiddenGroupIds, aOrigHiddenGroupsIds, true);
    });

    asyncTest("test show hide groups when originally hidden groups and the currentlly hidden groups are the same ", function () {
        var sCurrentHiddenGroupIds = ['testGroupId1', 'testGroupId2'],
            aOrigHiddenGroupsIds = ['testGroupId1', 'testGroupId2'];

        fn_handleGroupVisibilityChangesTestHelper(sCurrentHiddenGroupIds, aOrigHiddenGroupsIds, false);
    });

    asyncTest("test show hide groups when originally hidden groups currentlly hidden groups are of the same size bu the groups are different", function () {
        var sCurrentHiddenGroupIds = ['testGroupId1', 'testGroupId2', 'testGroupId3', 'testGroupId4'],
            aOrigHiddenGroupsIds = ['testGroupId1', 'testGroupId2', 'testGroupId5', 'testGroupId6'];

        fn_handleGroupVisibilityChangesTestHelper(sCurrentHiddenGroupIds, aOrigHiddenGroupsIds, true);
    });

    asyncTest("Test _onAfterDashboardShow with home state in Edit Mode", function () {
        var oModel = new sap.ui.model.json.JSONModel({
                currentViewName: "home",
                tileActionModeActive: true,
                getProperty: function () {
                }
            }),
            getRendererStub = sinon.stub(sap.ushell.Container, "getRenderer").returns({
                getCurrentViewportState: sinon.spy(),
                createExtendedShellState: sinon.spy(),
                applyExtendedShellState: sinon.spy(),
                getRouter: sinon.stub().returns({
                    getRoute: sinon.stub().returns({
                        attachMatched: sinon.stub()
                    })
                }),
                getCurrentCoreView: sinon.stub().returns("home")
            }),
            oOrigCore = sap.ui.getCore(),
            oGetCoreByIdStub = sinon.stub(oOrigCore, 'byId').returns({
                shiftCenterTransitionEnabled: function () {},
                shiftCenterTransition: function () {},
                attachAfterNavigate: function () {
                },
                enlargeCenterTransition: function (bFlag) {}
            }),
            oView = sap.ui.view({
                viewName: "sap.ushell.components.homepage.DashboardContent",
                type: "JS",
                async: true
            });
            oView.setModel(oModel);

        oView.loaded().then(function () {
            var onAfterNavigateStub = sinon.stub(oView, 'onAfterNavigate').returns({}),
                handleTilesVisibilityStub = sinon.stub(sap.ushell.utils, 'handleTilesVisibility'),
                refreshTilesStub = sinon.stub(sap.ushell.utils, 'refreshTiles'); /*,
             oDemiViewPortData = {
             //TileBase Constructor arguments
             id: "viewPortContainer",
             defaultState: sap.ushell.ui.launchpad.ViewPortState.Center
             },
             oViewPortContainer = new sap.ushell.ui.launchpad.ViewPortContainer(oDemiViewPortData),
             oViewPortFunctionStub = sinon.stub(oViewPortContainer, "enlargeCenterTransition").returns({}); */

            oEventHub.emit("CenterViewPointContentRendered", {"groups":0});
            var oEventSent = oEventHub.wait("CenterViewPointContentRendered");

            oEventSent.then(function () {
                ok(onAfterNavigateStub.called, "onAfterNavigate called");
                ok(!refreshTilesStub.called, "refreshTiles should not called");
                oGetCoreByIdStub.restore();
                handleTilesVisibilityStub.restore();
                refreshTilesStub.restore();
                getRendererStub.restore();
                oView.destroy();
                start();
            });

        });


    });

    asyncTest("Test deactivation of action/edit mode after click on 'Done' button of the footer", function () {
        jQuery.sap.require("sap.ushell.components.homepage.ActionMode");
        var oModel = new sap.ui.model.json.JSONModel({
                currentViewName: "home",
                tileActionModeActive: true,
                getProperty: function () {
                }
            }),
            getRendererStub = sinon.stub(sap.ushell.Container, "getRenderer").returns({
                getCurrentViewportState: sinon.spy(),
                createExtendedShellState: sinon.spy(),
                applyExtendedShellState: sinon.spy(),
                getRouter: sinon.stub().returns({
                    getRoute: sinon.stub().returns({
                        attachMatched: sinon.stub()
                    })
                })
            }),
            oOrigCore = sap.ui.getCore(),
            oGetCoreByIdStub = sinon.stub(oOrigCore, 'byId').returns({
                shiftCenterTransitionEnabled: function () {},
                shiftCenterTransition: function () {},
                attachAfterNavigate: function () {
                },
                getCenterViewPort: function () {
                    return [{
                        getComponent: function () {
                            return "__renderer0---Shell-home-component";
                        }
                    }];
                },
                enlargeCenterTransition: function (bFlag) {}
            }),
            oView = sap.ui.view({
                viewName: "sap.ushell.components.homepage.DashboardContent",
                type: "JS",
                async: true
            });

        oView.setModel(oModel);
        oView.loaded().then(function () {
            var oActionModeDeactivationStub =  sinon.stub(sap.ushell.components.homepage.ActionMode, 'deactivate'),
                handleTilesVisibilityStub = sinon.stub(sap.ushell.utils, 'handleTilesVisibility'),
                refreshTilesStub = sinon.stub(sap.ushell.utils, 'refreshTiles'),
                oDoneBtn;

            oView._enableAnchorBarOverflowAndCreateFooter();

            oEventHub.emit("CenterViewPointContentRendered");
            oDoneBtn = oView.oFooter.getContentRight()[1];
            oDoneBtn.firePress();
            ok(oActionModeDeactivationStub.called, "Deactivate called after pressing on 'Done'");

            oActionModeDeactivationStub.restore();

            oGetCoreByIdStub.restore();
            handleTilesVisibilityStub.restore();
            refreshTilesStub.restore();
            getRendererStub.restore();
            oView.destroy();
            start();
        });
    });

    asyncTest("Test exit method", function () {
        var oModel = new sap.ui.model.json.JSONModel({
                currentViewName: "home",
                tileActionModeActive: false,
                getProperty: function () {
                }
            }),
            oOrigCore = sap.ui.getCore(),
            oGetCoreByIdStub = sinon.stub(oOrigCore, 'byId').returns({
                shiftCenterTransitionEnabled: function () {},
                shiftCenterTransition: function () {},
                attachAfterNavigate: function () {
                },
                getCenterViewPort: function () {
                    return [{
                        getComponent: function () {
                            return "__renderer0---Shell-home-component";
                        }
                    }];
                },
                enlargeCenterTransition: function (bFlag) {}
            }),
            getRendererStub = sinon.stub(sap.ushell.Container, "getRenderer").returns({
                getCurrentViewportState: sinon.spy(),
                createExtendedShellState: sinon.spy(),
                applyExtendedShellState: sinon.spy(),
                getRouter: sinon.stub().returns({
                    getRoute: sinon.stub().returns({
                        attachMatched: sinon.stub()
                    })
                })
            }),
            oView = sap.ui.view({
                viewName: "sap.ushell.components.homepage.DashboardContent",
                type: "JS",
                async: true
            });

        oView.setModel(oModel);

        oView.loaded().then(function () {
            var handleExitSpy = sinon.spy(oView.oAnchorNavigationBar, "handleExit");
            oView.destroy();
            ok(handleExitSpy.called === true);
            oGetCoreByIdStub.restore();
            getRendererStub.restore();
            start();
        });

    });

}());
