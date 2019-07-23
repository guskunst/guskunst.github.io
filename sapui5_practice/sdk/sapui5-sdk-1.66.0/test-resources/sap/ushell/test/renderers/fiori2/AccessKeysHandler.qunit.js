// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.renderers.fiori2.AccessKeysHandler
 */
(function () {
    "use strict";
    /* eslint-disable */ // TBD: make ESLint conform

    /*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
     notEqual, notStrictEqual, ok, raises, start, strictEqual, stop, test,
     jQuery, sap, sinon */

    jQuery.sap.require("sap.ushell.renderers.fiori2.AccessKeysHandler");
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.services.Container");
    jQuery.sap.require("sap.m.Text");
    jQuery.sap.require("sap.m.Label");
    jQuery.sap.require("sap.ui.layout.form.SimpleForm");
    jQuery.sap.require("sap.ui.thirdparty.hasher");

    // init must be only called once over all the tests
    sap.ushell.renderers.fiori2.AccessKeysHandler.init(new sap.ui.model.json.JSONModel({
        searchAvailable: false
    }));
    sinon.stub(sap.ushell.renderers.fiori2.AccessKeysHandler, "init");

    module("sap.ushell.renderers.fiori2.AccessKeysHandler", {
        setup: function () {
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        teardown: function () {
        }
    });


    test("create a new instance of AccessKeysHandler Class", function () {
        var instance = sap.ushell.renderers.fiori2.AccessKeysHandler;

        ok(instance, "create a new instance");
    });

    test("check AccessKeysHandler Class init flags values", function () {
        var instance = sap.ushell.renderers.fiori2.AccessKeysHandler;

        ok(instance.bFocusOnShell === true, "flag init value should be true");
        ok(instance.bFocusPassedToExternalHandlerFirstTime === true, "flag init value should be true");
        ok(instance.isFocusHandledByAnotherHandler === false, "flag init value should be false");
    });

    asyncTest("move focus to inner application", function () {
        var instance = sap.ushell.renderers.fiori2.AccessKeysHandler,
            fnCallbackAppKeysHandler = sinon.spy(),
            getHashStub = sinon.stub(hasher, "getHash").returns("shell-home");

        //register inner application keys handler
        sap.ushell.renderers.fiori2.AccessKeysHandler.registerAppKeysHandler(fnCallbackAppKeysHandler);
        // Trigger the F6 key event to move keys handling to inner application
        var F6keyCode = 117;
        var oEvent;
        //IE doesn't support creating the KeyboardEvent object with a the "new" constructor, hence if this will fail, it will be created
        //using the document object- https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent
        //This KeyboardEvent has a constructor, so checking for its ecsitaance will not solve this, hence, only solution found is try-catch
        try{
            oEvent = new KeyboardEvent('keydown');
        } catch(err){
            var IEevent = document.createEvent("KeyboardEvent");
            //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent
            IEevent.initKeyboardEvent("keydown", false, false, null, 0, 0, 0, 0 ,false);
            oEvent = IEevent;
        }

        oEvent.oEventkeyCode = F6keyCode;
        // Set flag to false because the focus moves to the application responsibility
        sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell = false;
        document.dispatchEvent(oEvent);

        setTimeout(function () {
            start();
            ok(fnCallbackAppKeysHandler.calledOnce, "Application's keys handler function was not executed");

            instance = null;
            getHashStub.restore();
        }, 100);
    });

    test("check focus back to shell flags validity", function () {
        var instance = sap.ushell.renderers.fiori2.AccessKeysHandler;

        // Set flag to false because the focus moves to the application responsibility
        sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell = false;

        // Move focus back to shell
        var F6keyCode = 117,
            oEvent = jQuery.Event("keydown", { keyCode: F6keyCode, shiftKey: true });
        sap.ushell.renderers.fiori2.AccessKeysHandler.sendFocusBackToShell(oEvent);

        ok(instance.bFocusOnShell === true, "flag value should be true");
    });

    test("test reset handlres after navigating to another application", function () {
        var instance = sap.ushell.renderers.fiori2.AccessKeysHandler,
            fnCallbackAppKeysHandler = sinon.spy(),
            currentKeysHandler = null,
            hasherGetHashStub = sinon.stub(hasher, "getHash").returns("some-app");

        //register inner application keys handler
        instance.registerAppKeysHandler(fnCallbackAppKeysHandler);

        currentKeysHandler = instance.getAppKeysHandler();
        ok(currentKeysHandler !== null, "currently there is a registered keys handler");

        // this function will be called once 'appOpend' event will be fired
        hasherGetHashStub.returns("another-app");
        instance.appOpenedHandler();
        currentKeysHandler = instance.getAppKeysHandler();
        ok(currentKeysHandler === null, "currently there is no registered keys handler");

        instance = null;
        hasherGetHashStub.restore();
    });

    test("check short keys dialog is creating successfully", function () {
        // Arrange
        var oAccessKeysHandler = sap.ushell.renderers.fiori2.AccessKeysHandler;

        oAccessKeysHandler.oModel.setProperty("/searchAvailable", true);
        oAccessKeysHandler.oModel.setProperty("/personalization", true);

        var oBody = window.document.getElementsByTagName("body")[0],
            oShellHeader = window.document.createElement("div");
        oShellHeader.setAttribute("id", "shell-header");
        oBody.appendChild(oShellHeader);

        // Act
        oAccessKeysHandler._handleAccessOverviewKey();

        // Assert
        var oDialog = sap.ui.getCore().byId("hotKeysGlossary");
        ok(oDialog !== null, "hot keys glossary dialog was created successfully");
        ok(oDialog.getContent()[0].getContent().length === 18, "dialog have 8 short keys and 4 labels");
        oDialog.close();

        oAccessKeysHandler.oModel.setProperty("/searchAvailable", false);
        oAccessKeysHandler.oModel.setProperty("/personalization", false);
        oBody.removeChild(oShellHeader);
    });

    test("handleShortcuts:", function () {
        [
            {
                sTestDescription: "ALT was pressed",
                oEvent: {
                    altKey: true
                },
                bExpectedHandleAltShortcutKeys: true,
                bExpectedHandleCtrlShortcutKeys: false
            },
            {
                sTestDescription: "CTRL was pressed",
                oEvent: {
                    ctrlKey: true
                },
                bExpectedHandleAltShortcutKeys: false,
                bExpectedHandleCtrlShortcutKeys: true
            },
            {
                sTestDescription: "CMD + SHIFT + F was pressed",
                oEvent: {
                    metaKey: true,
                    shiftKey: true,
                    keyCode: 70,
                    preventDefault: function () {}
                },
                bExpectedHandleAltShortcutKeys: false,
                bExpectedHandleCtrlShortcutKeys: false
            }
        ].forEach(function (oFixture) {
            // Arrange
            var oAccessKeysHandler = sap.ushell.renderers.fiori2.AccessKeysHandler;

            var fnHandleAltShortcutKeysStub = sinon.stub(oAccessKeysHandler, "_handleAltShortcutKeys");
            var fnHandleCtrlShortcutKeysStub = sinon.stub(oAccessKeysHandler, "_handleCtrlShortcutKeys");

            var bTempMacintosh = sap.ui.Device.os.macintosh;
            sap.ui.Device.os.macintosh = true;

            // Act
            oAccessKeysHandler.handleShortcuts(oFixture.oEvent);

            // Assert
            strictEqual(fnHandleAltShortcutKeysStub.called, oFixture.bExpectedHandleAltShortcutKeys,
                "_handleAltShortcutKeys was (not) called when ");
            strictEqual(fnHandleCtrlShortcutKeysStub.called, oFixture.bExpectedHandleCtrlShortcutKeys,
                "_handleCtrlShortcutKeys was (not) called when ");

            fnHandleAltShortcutKeysStub.restore();
            fnHandleCtrlShortcutKeysStub.restore();

            sap.ui.Device.os.macintosh = bTempMacintosh;
        });
    });

    test("_handleAltShortcutKeys:", function () {
        [
            {
                sTestDescription: "ALT + A was pressed",
                oEvent: {
                    keyCode: 65
                },
                bExpectedBlockBrowserDefault: true,
                bExpectedFocusItemInUserMenu: true,
                bExpectedFocusItemInOverflowPopover: false
            },
            {
                sTestDescription: "ALT + A was pressed and moveAppFinderToShellHeader is true",
                oEvent: {
                    keyCode: 65
                },
                bMoveAppFinderActionToShellHeader: true,
                bExpectedBlockBrowserDefault: true,
                bExpectedFocusItemInUserMenu: false,
                bExpectedFocusItemInOverflowPopover: true
            },
            {
                sTestDescription: "ALT + B was pressed (hotkey not in use)",
                oEvent: {
                    keyCode: 66
                },
                bExpectedBlockBrowserDefault: false,
                bExpectedFocusItemInUserMenu: false,
                bExpectedFocusItemInOverflowPopover: false
            },
            {
                sTestDescription: "ALT + F was pressed",
                oEvent: {
                    keyCode: 70
                },
                bExpectedBlockBrowserDefault: true,
                bExpectedFocusItemInUserMenu: false,
                bExpectedFocusItemInOverflowPopover: false
            },
            {
                sTestDescription: "ALT + H was pressed",
                oEvent: {
                    keyCode: 72
                },
                bExpectedBlockBrowserDefault: true,
                bExpectedFocusItemInUserMenu: false,
                bExpectedFocusItemInOverflowPopover: false
            },
            {
                sTestDescription: "ALT + M was pressed",
                oEvent: {
                    keyCode: 77
                },
                bExpectedBlockBrowserDefault: true,
                bExpectedFocusItemInUserMenu: false,
                bExpectedFocusItemInOverflowPopover: false
            },
            {
                sTestDescription: "ALT + N was pressed",
                oEvent: {
                    keyCode: 78
                },
                bExpectedBlockBrowserDefault: true,
                bExpectedFocusItemInUserMenu: false,
                bExpectedFocusItemInOverflowPopover: false
            },
            {
                sTestDescription: "ALT + S was pressed",
                oEvent: {
                    keyCode: 83
                },
                bExpectedBlockBrowserDefault: true,
                bExpectedFocusItemInUserMenu: true,
                bExpectedFocusItemInOverflowPopover: false
            },
            {
                sTestDescription: "ALT + S was pressed and moveUserSettingsActionToShellHeader is true",
                oEvent: {
                    keyCode: 83
                },
                bMoveUserSettingsActionToShellHeader: true,
                bExpectedBlockBrowserDefault: true,
                bExpectedFocusItemInUserMenu: false,
                bExpectedFocusItemInOverflowPopover: true
            }
        ].forEach(function (oFixture) {
            // Arrange
            var oAccessKeysHandler = sap.ushell.renderers.fiori2.AccessKeysHandler;

            var fnBlockBrowserDefaultStub = sinon.stub(oAccessKeysHandler, "_blockBrowserDefault");
            var fnFocusItemInUserMenuStub = sinon.stub(oAccessKeysHandler, "_focusItemInUserMenu");
            var fnFocusItemInOverflowPopoverStub = sinon.stub(oAccessKeysHandler, "_focusItemInOverflowPopover");
            var fnGetCoreStub = sinon.stub(sap.ui, "getCore").returns({
                byId: function (sId) {
                    if (sId === "shell-header") {
                        return {
                            getHomeUri: function () {
                                return "#Shell-home";
                            }
                        };
                    } else if ("sapUshellMeAreaPopover") {
                        return {
                            isOpen: function () {
                                return oFixture.bMeAreaOpen;
                            }
                        };
                    } else if ("shellNotificationsPopover") {
                        return {
                            isOpen: function () {
                                return oFixture.bMeNotificationsPopoverOpen;
                            }
                        };
                    } else if ("headEndItemsOverflow") {
                        return {
                            isOpen: function () {
                                return oFixture.bEndItemsOverflowOpen;
                            }
                        }
                    }
                }
            });

            sap.ushell.Container = {
                getRenderer: function () {
                    return {
                        getShellConfig: function () {
                            return {
                                moveAppFinderActionToShellHeader: oFixture.bMoveAppFinderActionToShellHeader,
                                moveUserSettingsActionToShellHeader: oFixture.bMoveUserSettingsActionToShellHeader
                            };
                        }
                    };
                }
            }

            // Act
            oAccessKeysHandler._handleAltShortcutKeys(oFixture.oEvent);

            // Assert
            strictEqual(fnBlockBrowserDefaultStub.called, oFixture.bExpectedBlockBrowserDefault,
                "Default Event prevented ");
            strictEqual(fnFocusItemInUserMenuStub.called, oFixture.bExpectedFocusItemInUserMenu,
                "Button was (not) searched in the User Action Menu when ");
            strictEqual(fnFocusItemInOverflowPopoverStub.called, oFixture.bExpectedFocusItemInOverflowPopover,
                "Button was (not) searched in the Overflow Popover when ");

            fnBlockBrowserDefaultStub.restore();
            fnFocusItemInOverflowPopoverStub.restore();
            fnFocusItemInUserMenuStub.restore();
            fnGetCoreStub.restore();
            sap.ushell.Container = undefined;
        });
    });

    test("_handleCtrlShortcutKeys:", function () {
        [
            {
                sTestDescription: "CTRL + SHIFT + F was pressed",
                oEvent: {
                    keyCode: 70,
                    shiftKey: true
                },
                bExpectedSettingsButtonPressed: false,
                bExpectedDoneButtonPressed: false,
                bExpectedHandleAccessOverviewKey: false
            },
            {
                sTestDescription: "CTRL + F was pressed (hotkey not in use)",
                oEvent: {
                    keyCode: 70
                },
                bExpectedSettingsButtonPressed: false,
                bExpectedDoneButtonPressed: false,
                bExpectedHandleAccessOverviewKey: false
            },
            {
                sTestDescription: "CTRL + COMMA was pressed",
                oEvent: {
                    keyCode: 188
                },
                bExpectedSettingsButtonPressed: true,
                bExpectedDoneButtonPressed: false,
                bExpectedHandleAccessOverviewKey: false
            },
            {
                sTestDescription: "CTRL + F1 was pressed",
                oEvent: {
                    keyCode: 112
                },
                bExpectedSettingsButtonPressed: false,
                bExpectedDoneButtonPressed: false,
                bExpectedHandleAccessOverviewKey: true
            },
            {
                sTestDescription: "CTRL + S was pressed",
                oEvent: {
                    keyCode: 83,
                    preventDefault: function () {}
                },
                bExpectedSettingsButtonPressed: false,
                bExpectedDoneButtonPressed: false,
                bExpectedHandleAccessOverviewKey: false
            },
            {
                sTestDescription: "CTRL + Enter was pressed",
                oEvent: {
                    keyCode: 13
                },
                bExpectedSettingsButtonPressed: false,
                bExpectedDoneButtonPressed: true,
                bExpectedHandleAccessOverviewKey: false
            }
        ].forEach(function (oFixture) {
            // Arrange
            var oAccessKeysHandler = sap.ushell.renderers.fiori2.AccessKeysHandler;

            var fnHandleAccessOverviewKeyStub = sinon.stub(oAccessKeysHandler, "_handleAccessOverviewKey");

            var bSettingsButtonPressed = false,
                bDoneButtonPressed = false;

            var fnGetCoreStub = sinon.stub(sap.ui, "getCore").returns({
                byId: function (sId) {
                    if (sId === "userSettingsBtn") {
                        return {
                            firePress: function () {
                                bSettingsButtonPressed = true;
                            }
                        };
                    } else if (sId === "sapUshellDashboardFooterDoneBtn") {
                        return {
                            firePress: function () {
                                bDoneButtonPressed = true;
                            }
                        };
                    }
                }
            });

            // Act
            oAccessKeysHandler._handleCtrlShortcutKeys(oFixture.oEvent);

            // Assert
            strictEqual(fnHandleAccessOverviewKeyStub.called, oFixture.bExpectedHandleAccessOverviewKey,
                "AccessOverview Dialog was (not) created when ");
            strictEqual(bSettingsButtonPressed, oFixture.bExpectedSettingsButtonPressed,
                "Settings Dialog was (not) created when ");
            strictEqual(bDoneButtonPressed, oFixture.bExpectedDoneButtonPressed,
                "Done button was (not) pressed when ");
            fnHandleAccessOverviewKeyStub.restore();
            fnGetCoreStub.restore();
        });
    });

    test("check that on mobile we do not have accessibility", function(assert) {
        var done = assert.async();
        sap.ushell.bootstrap("local").then(function() {
            sap.ushell.Container.createRenderer("fiori2", true).then(function() {
                jQuery.sap.require("sap.ushell.components.homepage.Component");
                var ComponentKeysHandlerInit = sinon.stub(sap.ushell.components.homepage.ComponentKeysHandler, "init");

                sap.ui.Device.system.phone = true;
                var component = new sap.ushell.components.homepage.Component({
                    componentData: {
                        properties: {},
                        config: {}
                    }
                });
                ok(!ComponentKeysHandlerInit.called, "Keys handeler init was not called");
                done();
            });
        });
    });

    test("suppress F1 help on CTRL + F1 in Internet Explorer", function (assert) {
        var oAccessKeysHandler = sap.ushell.renderers.fiori2.AccessKeysHandler,
            isInternetExplorer = sap.ui.Device.browser.msie,
            oCancelHelpEventSpy,
            oHelpEvent1,
            oHelpEvent2;

        oAccessKeysHandler.aShortcutsDescriptions = [];

        if (!isInternetExplorer) {
            sap.ui.Device.browser.msie = true;
        }

        oCancelHelpEventSpy = sinon.spy(oAccessKeysHandler, "_cancelHelpEvent");

        // simulate CTRL + F1
        oAccessKeysHandler._handleAccessOverviewKey();

        if (isInternetExplorer) {
            oHelpEvent1 = document.createEvent("Event");
            oHelpEvent1.initEvent("help", true, true);
            oHelpEvent2 = document.createEvent("Event");
            oHelpEvent2.initEvent("help", true, true);
        }
        else {
            oHelpEvent1 = new Event("help", { bubbles: true, cancelable: true });
            oHelpEvent2 = new Event("help", { bubbles: true, cancelable: true });
        }

        // the help event is triggered together with CTRL + F1 in Internet Explorer
        document.dispatchEvent(oHelpEvent1);
        assert.strictEqual(oCancelHelpEventSpy.callCount, 1, "The help cancelling event handler was called for CTRL + F1");

        // the second help event is for F1 without CTRL
        document.dispatchEvent(oHelpEvent2);
        assert.strictEqual(oCancelHelpEventSpy.callCount, 1, "The help cancelling event handler was not called for F1");

        if (!isInternetExplorer) {
            // this cannot be tested in Internet Explorer as the original event is not changed here
            assert.strictEqual(oHelpEvent1.defaultPrevented, true, "For CTRL + F1 the help event was cancelled");
            assert.strictEqual(oHelpEvent2.defaultPrevented, false, "For F1 the help event was not cancelled");

            // cleanup: this attribute only exists in Internet Explorer
            delete sap.ui.Device.browser.msie;
        }
        oCancelHelpEventSpy.restore();
        sap.ui.getCore().byId("hotKeysGlossary").close();
    });
}());
