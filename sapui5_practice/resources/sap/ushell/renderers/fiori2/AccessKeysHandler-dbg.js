// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/*global jQuery, sap, document, hasher */
sap.ui.define([
    "sap/ui/Device",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/ShortcutsHelpContainer"
], function (
    Device,
    Config,
    EventHub,
    resources,
    ShortcutsHelpContainer
) {
        "use strict";

        /*global window*/

        var AccessKeysHandler = function () { };

        AccessKeysHandler.prototype = {

            bFocusOnShell: true,
            bFocusPassedToExternalHandlerFirstTime: true,
            isFocusHandledByAnotherHandler: false,
            fnExternalKeysHandler: null,
            sLastExternalKeysHandlerUrl: null,
            fnExternalShortcuts: null,
            isleftAltPressed: false,
            bForwardNavigation: true,
            aShortcutsDescriptions: [],

            appOpenedHandler: function () {
                var sCurrentApplicationIntent = hasher.getHash();

                if (sCurrentApplicationIntent !== this.sLastExternalKeysHandlerUrl) {
                    this.fnExternalKeysHandler = null;
                }
                this.sLastExternalKeysHandlerUrl = sCurrentApplicationIntent;
            },

            _focusItemInOverflowPopover: function (sItemId) {
                var oOverflowPopup = sap.ui.getCore().byId("headEndItemsOverflow");

                if (oOverflowPopup && oOverflowPopup.isOpen()) {
                    if (oOverflowPopup.getContent().length) {
                        this._focusIteminPopover(sItemId, oOverflowPopup.getContent()[0].getItems());
                    }
                } else {
                    var oOverFlowBtn = window.document.getElementById("endItemsOverflowBtn");

                    if (oOverFlowBtn) {
                        oOverFlowBtn.click();
                        var that = this;
                        window.setTimeout(function () {
                            that._focusItemInOverflowPopover(sItemId);
                        }, 200);
                    }
                }
            },

            _focusItemInUserMenu: function (sItemId) {
                var oUserMenu = sap.ui.getCore().byId("sapUshellMeAreaPopover");

                if (oUserMenu && oUserMenu.isOpen()) {
                    if (oUserMenu.getContent().length) {
                        this._focusIteminPopover(sItemId, oUserMenu.getContent()[0].getItems());
                    }
                } else {
                    var that = this;
                    EventHub.emit("showMeArea", Date.now());
                    window.setTimeout(function () {
                        that._focusItemInUserMenu(sItemId);
                    }, 200);
                }
            },

            _focusIteminPopover: function (sId, aItems) {
                for (var i = 0; i < aItems.length; i++) {
                    var aIdParts = aItems[i].getId().split("-");
                    if (aIdParts[aIdParts.length - 1] === sId) {
                        aItems[i].getDomRef().focus();
                        return;
                    }
                }
            },

            _handleAccessOverviewKey: function () {
                var bSearchAvailable = this.oModel.getProperty("/searchAvailable"),
                    bPersonalization = this.oModel.getProperty("/personalization");

                if (Device.browser.msie) {
                    // the Internet Explorer would display its F1 help also on CTRL + F1 if the help event wasn't cancelled
                    document.addEventListener("help", this._cancelHelpEvent);
                }

                var aShortCuts = [];
                aShortCuts = aShortCuts.concat(this.aShortcutsDescriptions);

                if (window.document.getElementById("shell-header")) {
                    if (bPersonalization) {
                        aShortCuts.push({ text: "Alt+A", description: resources.i18n.getText("hotkeyFocusOnAppFinderButton") });
                    }

                    if (bSearchAvailable) {
                        aShortCuts.push({ text: "Alt+F", description: resources.i18n.getText("hotkeyFocusOnSearchButton") });
                    }

                    aShortCuts.push({ text: "Alt+H", description: resources.i18n.getText("hotkeyHomePage") });
                    aShortCuts.push({ text: "Alt+M", description: resources.i18n.getText("hotkeyFocusOnMeArea") });
                    aShortCuts.push({ text: "Alt+N", description: resources.i18n.getText("hotkeyFocusOnNotifications") });
                    aShortCuts.push({ text: "Alt+S", description: resources.i18n.getText("hotkeyFocusOnSettingsButton") });

                    aShortCuts.push({ text: "Ctrl+Comma", description: resources.i18n.getText("hotkeyOpenSettings") });

                    if (bPersonalization) {
                        aShortCuts.push({ text: "Ctrl+Enter", description: resources.i18n.getText("hotkeySaveEditing") });
                    }

                    if (bSearchAvailable) {
                        var sText;
                        if (Device.os.macintosh) {
                            sText = "Cmd+Shift+F";
                        } else {
                            sText = "Ctrl+Shift+F";
                        }
                        aShortCuts.push({ text: sText, description: resources.i18n.getText("hotkeyFocusOnSearchField") });
                    }
                }
                var oShortcutsHelpContainer = new ShortcutsHelpContainer();

                aShortCuts.forEach(function (sViewName) {
                    oShortcutsHelpContainer.addContent(new sap.m.Label({ text: sViewName.description }));
                    oShortcutsHelpContainer.addContent(new sap.m.Text({ text: sViewName.text }));
                });

                var oDialog = new sap.m.Dialog({
                    id: "hotKeysGlossary",
                    title: resources.i18n.getText("hotKeysGlossary"),
                    contentWidth: "29.6rem",
                    content: oShortcutsHelpContainer,
                    afterClose: function () {
                        oDialog.destroy();
                    }
                });

                oDialog.setBeginButton(new sap.m.Button({
                    text: resources.i18n.getText("okBtn"),
                    press: function () {
                        oDialog.close();
                    }
                }));

                oDialog.open();
            },

            _blockBrowserDefault: function (oEvent) {
                if (Device.browser.name === "ie") {
                    var oShellHeader = window.document.getElementById("shell-header");
                    if (oShellHeader) {
                        // Set HTML accesskey attribute. This is important, inorder to overwrite IE default accesskeys
                        oShellHeader.setAttribute("accesskey", oEvent.key);

                        window.setTimeout(function () {
                            // Remove HTML accesskey attribute again after some time.
                            oShellHeader = window.document.getElementById("shell-header");
                            if (oShellHeader) {
                                oShellHeader.removeAttribute("accesskey");
                            }
                        }, 0);
                    }
                }
                // Prevent default, inorder to overwrite Firefox default accesskeys
                oEvent.preventDefault();
            },

            _handleAltShortcutKeys: function (oEvent) {
                var oShellHeader = sap.ui.getCore().byId("shell-header"),
                    oConfig = sap.ushell.Container.getRenderer("fiori2").getShellConfig(),
                    oUserMenu = sap.ui.getCore().byId("sapUshellMeAreaPopover"),
                    oNotificationsPopup = sap.ui.getCore().byId("shellNotificationsPopover");

                if (oShellHeader) {
                    if (oEvent.keyCode === 65) { // ALT + A
                        this._blockBrowserDefault(oEvent);
                        var oAppFinderBtn = window.document.getElementById("openCatalogBtn");

                        if (oAppFinderBtn) {
                            oAppFinderBtn.focus();
                            return;
                        }

                        if (oConfig.moveAppFinderActionToShellHeader) {
                            this._focusItemInOverflowPopover("openCatalogBtn");
                            return;
                        }

                        this._focusItemInUserMenu("openCatalogBtn");
                    } else if (oEvent.keyCode === 70) { // ALT + F
                        this._blockBrowserDefault(oEvent);
                        var oSearchBtn = window.document.getElementById("sf");
                        if (oSearchBtn) {
                            oSearchBtn.focus();
                        }
                    } else if (oEvent.keyCode === 72) { // ALT + H
                        this._blockBrowserDefault(oEvent);
                        window.hasher.setHash(oShellHeader.getHomeUri());

                        // Close User menu if open
                        if (oUserMenu && oUserMenu.isOpen()) {
                            EventHub.emit("showMeArea", false);
                        }

                        // Close Notification Popover if open
                        if (oNotificationsPopup && oNotificationsPopup.isOpen()) {
                            EventHub.emit("showNotifications", false);
                        }

                        var oAppTitle = window.document.getElementById("shellAppTitle");
                        if (oAppTitle) {
                            oAppTitle.focus();
                        }
                    } else if (oEvent.keyCode === 77) { // ALT + M
                        this._blockBrowserDefault(oEvent);
                        if (!(oUserMenu && oUserMenu.isOpen())) {
                            EventHub.emit("showMeArea", Date.now());
                        }
                    } else if (oEvent.keyCode === 78) { // ALT + N
                        this._blockBrowserDefault(oEvent);
                        if (!(oNotificationsPopup && oNotificationsPopup.isOpen())) {
                            EventHub.emit("showNotifications", Date.now());
                        }
                    } else if (oEvent.keyCode === 83) { // ALT + S
                        this._blockBrowserDefault(oEvent);
                        var oSettingsBtn = window.document.getElementById("userSettingsBtn");

                        if (oSettingsBtn) {
                            oSettingsBtn.focus();
                            return;
                        }

                        if (oConfig.moveUserSettingsActionToShellHeader) {
                            this._focusItemInOverflowPopover("userSettingsBtn");
                            return;
                        }

                        this._focusItemInUserMenu("userSettingsBtn");
                    }
                }
            },

            _handleCtrlShortcutKeys: function (oEvent) {
                if (oEvent.shiftKey) {
                    if (oEvent.keyCode === 70) { // CTRL + SHIFT + F
                        var oSearchBtn = window.document.getElementById("sf");
                        if (oSearchBtn) {
                            oSearchBtn.click();
                        }
                    }
                } else if (oEvent.keyCode === 188) { // CTRL + COMMA
                    var oSettingsBtn = sap.ui.getCore().byId("userSettingsBtn");
                    if (oSettingsBtn) {
                        oSettingsBtn.firePress();
                    }
                } else if (oEvent.keyCode === 112) { // CTRL + F1
                    this._handleAccessOverviewKey();
                } else if (oEvent.keyCode === 83) { // CTRL + S
                    var appFinderSearchBtn = window.document.getElementById("appFinderSearch-I");
                    if (appFinderSearchBtn) {
                        appFinderSearchBtn.focus();
                    }
                    oEvent.preventDefault();
                } else if (oEvent.keyCode === 13) { // CTRL + Enter
                    var oDoneButton = sap.ui.getCore().byId("sapUshellDashboardFooterDoneBtn");
                    if (oDoneButton) {
                        oDoneButton.firePress();
                    }
                }
            },

            /**
             * Reacts on given keyboard events
             *
             * @param {object} oEvent the event that contains all the information about the keystroke
             */
            handleShortcuts: function (oEvent) {
                if (Device.os.macintosh && oEvent.metaKey && oEvent.shiftKey && oEvent.keyCode === 70) { // CMD + SHIFT + F
                    var oSearchBtn = window.document.getElementById("sf");
                    if (oSearchBtn) {
                        oSearchBtn.focus();
                    }
                    oEvent.preventDefault();
                } else if (oEvent.altKey) {
                    this._handleAltShortcutKeys(oEvent);
                } else if (oEvent.ctrlKey) {
                    this._handleCtrlShortcutKeys(oEvent);
                }
            },

            registerAppKeysHandler: function (fnHandler) {
                this.fnExternalKeysHandler = fnHandler;
                this.sLastExternalKeysHandlerUrl = hasher.getHash();
            },

            resetAppKeysHandler: function () {
                this.fnExternalKeysHandler = null;
            },

            getAppKeysHandler: function () {
                return this.fnExternalKeysHandler;
            },

            registerAppShortcuts: function (fnHandler, aShortcutsDescriptions) {
                this.fnExternalShortcuts = fnHandler;
                this.aShortcutsDescriptions = aShortcutsDescriptions;
            },

            /*
                 This method is responsible to restore focus in the shell (according to the event & internal logic)

                 New parameter added : sIdForFocus
                 This parameter in case supplied overrides the event/internal logic handling and enforces the focus
                 on the element with the corresponding id.
             */
            _handleFocusBackToMe: function (oEvent, sIdForFocus) {
                this.bFocusOnShell = true;
                var oFocusable;

                if (sIdForFocus) {
                    oFocusable = window.document.getElementById(sIdForFocus);
                } else {
                    this.fromOutside = true;

                    if (oEvent) {
                        oEvent.preventDefault();
                        this.bForwardNavigation = !oEvent.shiftKey || oEvent.key === "F6";
                    }
                    oFocusable = window.document.getElementById("sapUshellHeaderAccessibilityHelper");
                }

                if (oFocusable) {
                    oFocusable.focus();
                }

                //reset flag
                this.bFocusPassedToExternalHandlerFirstTime = true;
            },

            setIsFocusHandledByAnotherHandler: function (bHandled) {
                this.isFocusHandledByAnotherHandler = bHandled;
            },


            sendFocusBackToShell: function (oParam) {

                /*
                 This method is responsible to restore focus in the shell (according to the event & internal logic)

                 Added support to pass either an Event (e.g. KBN) to determine which area to focus on the shell
                 OR
                 String which is actually ID for a specific control to focus on
                 */

                var oEvent,
                    sIdForFocus;

                if (typeof oParam === "string") {
                    sIdForFocus = oParam;
                } else if (typeof oParam === "object") {
                    oEvent = oParam;
                }

                this._handleFocusBackToMe(oEvent, sIdForFocus);
            },

            _handleEventUsingExteranlKeysHandler: function (oEvent) {
                if (!this.bFocusOnShell && !this.isFocusHandledByAnotherHandler) {
                    if (this.fnExternalKeysHandler && jQuery.isFunction(this.fnExternalKeysHandler)) {
                        this.fnExternalKeysHandler(oEvent, this.bFocusPassedToExternalHandlerFirstTime);
                        this.bFocusPassedToExternalHandlerFirstTime = false;
                    }
                }
                //reset flag
                this.setIsFocusHandledByAnotherHandler(false);
            },

            _cancelHelpEvent: function (oEvent) {
                oEvent.preventDefault();
                // deregister immediately so that F1 still works
                document.removeEventListener("help", this._cancelHelpEvent);
            },

            init: function (oModel) {
                this.oModel = oModel;
                //prevent browser event ctrl+up/down from scrolling page
                //created by user `keydown` native event needs to be cancelled so browser will not make default action, which is scroll.
                //Instead we clone same event and dispatch it programmatic, so all handlers expecting to this event will still work

                document.addEventListener("keydown", function (oEvent) {
                    //if Shift key was pressed alone, don't perform any action
                    if (oEvent.keyCode === 16) {
                        return;
                    }

                    if (oEvent.shiftKey) {
                        this.bForwardNavigation = false;
                    } else {
                        this.bForwardNavigation = true;
                    }

                    //make sure that UI5 events (sapskipforward/saptabnext/etc.) will run before the
                    // document.addEventListener("keydown"... code in the AccessKeysHandler as it was before
                    // when we used jQuery(document).on('keydown'..
                    if (oEvent.key === "Tab" || oEvent.key === "F6") {
                        setTimeout(function () {
                            this._handleEventUsingExteranlKeysHandler(oEvent);
                        }.bind(this), 0);
                    } else {
                        this._handleEventUsingExteranlKeysHandler(oEvent);
                    }

                    if (oEvent.keyCode === 18) { //Alt key
                        if (oEvent.location === window.KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
                            this.isleftAltPressed = true;
                        } else {
                            this.isleftAltPressed = false;
                        }
                    }

                    // check for shortcuts only if you pressed a combination of keyboards containing the left ALT key, or
                    // without any ALT key at all
                    if (this.isleftAltPressed || !oEvent.altKey) {
                        this.handleShortcuts(oEvent);
                        if (this.fnExternalShortcuts) {
                            this.fnExternalShortcuts(oEvent);
                        }
                    }
                }.bind(this), true); // End of event handler

                // save the bound function so that it can be deregistered later
                this._cancelHelpEvent = this._cancelHelpEvent.bind(this);
            }
        };

        var accessKeysHandler = new AccessKeysHandler();
        EventHub.on("AppRendered").do(AccessKeysHandler.prototype.appOpenedHandler.bind(accessKeysHandler));

        return accessKeysHandler;

    }, /* bExport= */ true);