// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
        "sap/ushell/EventHub",
        "sap/ui/core/IconPool",
        "sap/ushell/Config",
        "sap/ushell/renderers/fiori2/AccessKeysHandler",
        "sap/ushell/resources",
        "sap/ushell/ui/launchpad/AccessibilityCustomData",
        "sap/ushell/ui/footerbar/ContactSupportButton",
        "sap/ushell/ui/footerbar/EndUserFeedback",
        "sap/ushell/ui/shell/ShellHeadItem",
        "sap/ushell/utils",
        "sap/ui/core/CustomData",
        "sap/ushell/ui/shell/ShellNavigationMenu"
    ],
    function (
        EventHub,
        IconPool,
        Config,
        AccessKeysHandler,
        resources,
        AccessibilityCustomData,
        ContactSupportButton,
        EndUserFeedback,
        ShellHeadItem,
        utils,
        CustomData,
        ShellNavigationMenu
    ) {
        "use strict";

        // List of the dangling controls created for the ShellHeader
        var aCreatedControls = [];
        var aDoable = [];

        var SHELL_APP_TITLE_STATE = {
            SHELL_NAV_MENU_ONLY: 0,
            ALL_MY_APPS_ONLY: 1,
            SHELL_NAV_MENU : 2,
            ALL_MY_APPS: 3
        };

        function init (oConfig, oHeaderController, oShellModel) {
            // create header controls
            aCreatedControls.push(_createHomeButton(oConfig));
            aCreatedControls.push(_createBackButton(oHeaderController));
            aCreatedControls.push(_createOverflowButton(oHeaderController, oShellModel));
            aCreatedControls.push(_createMeAreaButton(oShellModel));

            if (Config.last("/core/shell/model/enableNotifications")) {
                aCreatedControls.push(_createNotificationButton(oShellModel));
            }

            if (oConfig.moveEditHomePageActionToShellHeader) {
                aCreatedControls.push(_createEditHomePageButton());
            }

            if (oConfig.moveAppFinderActionToShellHeader) {
                aCreatedControls.push(_createAppFinderButton(oConfig, oHeaderController));
            }

            if (oConfig.moveUserSettingsActionToShellHeader) {
                aCreatedControls.push(_createUserSettingsButton(oHeaderController));
            }

            if (oConfig.moveContactSupportActionToShellHeader) {
                aCreatedControls.push(_createSupportButton());
            }

            if (oConfig.moveGiveFeedbackActionToShellHeader) {
                aCreatedControls.push(_createFeedbackButton());
            }

            aDoable.push(
                EventHub.once("CoreResourcesComplementLoaded").do(function () {
                    _createShellNavigationMenu(oConfig, oShellModel, oHeaderController);
                }.bind(this))
            );
        }

        function destroy () {
            aCreatedControls.forEach(function (sId) {
                var oControl = sap.ui.getCore().byId(sId);
                if (oControl) {
                    if (oControl.destroyContent) {
                        oControl.destroyContent();
                    }
                    oControl.destroy();
                }
            });
            aDoable.forEach(function (oDoable) {
                oDoable.off();
            });
            aCreatedControls = [];
            aDoable = [];
        }

        function _createShellNavigationMenu (oConfig, oShellModel, oController) {
            sap.ui.require([
                "sap/m/StandardListItem",
                "sap/ushell/ui/shell/NavigationMiniTile"
            ], function (StandardListItem, NavigationMiniTile) {
                var sMenuId = "shellNavigationMenu";

                var oHierarchyTemplateFunction = function (sId, oContext) {
                    var sIcon = oContext.getProperty("icon") || "sap-icon://circle-task-2",
                        sTitle = oContext.getProperty("title"),
                        sSubtitle = oContext.getProperty("subtitle"),
                        sTooltip = sTitle,
                        sIntent = oContext.getProperty("intent");

                    if (sSubtitle) {
                        sTooltip = sTooltip + "\n" + sSubtitle;
                    }

                    var oListItem = (new StandardListItem({
                        type: "Active", // Use string literal to avoid dependency from sap.m.library
                        title: sTitle,
                        description: sSubtitle,
                        tooltip: sTooltip,
                        icon: sIcon,
                        customData: [new CustomData({
                            key: "intent",
                            value: sIntent
                        })],
                        press: [oController.handleNavigationMenuItemPress, oController]
                    })).addStyleClass("sapUshellNavigationMenuListItems");

                    return oListItem;
                };

                var oRelatedAppsTemplateFunction = function (sId, oContext) {
                    // default icon behavior
                    var sIcon = oContext.getProperty("icon"),
                        sTitle = oContext.getProperty("title"),
                        sSubtitle = oContext.getProperty("subtitle"),
                        sIntent = oContext.getProperty("intent");
                    return new NavigationMiniTile({
                        title: sTitle,
                        subtitle: sSubtitle,
                        icon: sIcon,
                        intent: sIntent,
                        press: function () {
                            var sTileIntent = this.getIntent();
                            if (sTileIntent && sTileIntent[0] === "#") {
                                oController.navigateFromShellApplicationNavigationMenu(sTileIntent);
                            }
                        }
                    });
                };

                var oShellNavigationMenu = new ShellNavigationMenu(sMenuId, {
                    title: "{/application/title}",
                    icon: "{/application/icon}",
                    showTitle: {
                        path: "/application/showNavMenuTitle"
                    },
                    showRelatedApps: oConfig.appState !== "lean",
                    items: {
                        path: "/application/hierarchy",
                        factory: oHierarchyTemplateFunction.bind(this)
                    },
                    miniTiles: {
                        path: "/application/relatedApps",
                        factory: oRelatedAppsTemplateFunction.bind(this)
                    },
                    visible: {
                        path: "/ShellAppTitleState",
                        formatter: function (oCurrentState) {
                            return oCurrentState === SHELL_APP_TITLE_STATE.SHELL_NAV_MENU;
                        }
                    }
                });

                var oShellHeader = sap.ui.getCore().byId("shell-header");
                oShellNavigationMenu.setModel(oShellHeader.getModel());

                var oShellAppTitle = sap.ui.getCore().byId("shellAppTitle");
                if (oShellAppTitle) {
                    oShellAppTitle.setNavigationMenu(oShellNavigationMenu);
                }
                aCreatedControls.push(sMenuId);
                return sMenuId;
            }.bind(this));
        }

        function _createUserSettingsButton (oController) {
            //attaching press method only after the content is renderered - same logic as when creaing this button as an action button in me area
            //reference: _addPressHandlerToActions method in meArea.controller.js
            var id = "userSettingsBtn";

            var oUserPrefButton = sap.ui.getCore().byId(id);
            var attachPress = function () {
                jQuery.sap.measure.start("FLP:ElementsModel._attachPressToUserSettings", "_attachPressToUserSettings", "FLP");
                var btn = sap.ui.getCore().byId(id);
                if (btn) {
                    btn.attachPress(oController.handleUserSettingsPress);
                }
                jQuery.sap.measure.end("FLP:ElementsModel._attachPressToUserSettings");
            };

            if (!oUserPrefButton) {
                var newBtn = new ShellHeadItem({
                    id: id,
                    icon: "sap-icon://action-settings",
                    tooltip: "{i18n>userSettings}",
                    text: "{i18n>userSettings}"
                });
                newBtn.data("isShellHeader", true);
                //attach press event when MeArea is loaded
                aDoable.push(EventHub.on("CenterViewPointContentRendered").do(attachPress));
            }
            return id;
        }

        function _createHomeButton (oConfig) {
            var sId = "homeBtn";
            var oHomeButton = new ShellHeadItem({
                id: sId,
                tooltip: "{i18n>homeBtn_tooltip}",
                ariaLabel: "{i18n>homeBtn_tooltip}",
                icon: IconPool.getIconURI("home"),
                target: oConfig.rootIntent ? "#" + oConfig.rootIntent : "#"
            });

            oHomeButton.addCustomData(new AccessibilityCustomData({
                key: "aria-disabled",
                value: "false",
                writeToDom: true
            }));
            oHomeButton.addEventDelegate({
                onsapskipback: function (oEvent) {
                    if (AccessKeysHandler.getAppKeysHandler()) {
                        oEvent.preventDefault();
                        AccessKeysHandler.bFocusOnShell = false;
                    }
                },
                onsapskipforward: function (oEvent) {
                    if (AccessKeysHandler.getAppKeysHandler()) {
                        oEvent.preventDefault();
                        AccessKeysHandler.bFocusOnShell = false;
                    }
                }
            });
            return sId;
        }

        function _createEditHomePageButton () {
            // In case the edit home page button should move to the shell header, we create it as a ShellHeadItem
            // Text and press properties will be set in DashboardContent.view.js
            // By default it is not visible unless the personalization is enabled and the home page is shown.
            var sId = "ActionModeBtn";
            var oTileActionsButton = new ShellHeadItem({
                id: sId,
                icon: "sap-icon://edit",
                visible: false
            });
            oTileActionsButton.data("isShellHeader", true);

            if (Config.last("/core/extension/enableHelp")) {
                oTileActionsButton.addStyleClass("help-id-openCatalogActionItem"); // xRay help ID
            }
            return sId;
        }

        function _createBackButton (oController) {
            var sBackButtonIcon = sap.ui.getCore().getConfiguration().getRTL() ? "feeder-arrow" : "nav-back";
            var oBackButton = new ShellHeadItem({
                id: "backBtn",
                tooltip: "{i18n>backBtn_tooltip}",
                ariaLabel: "{i18n>backBtn_tooltip}",
                icon: IconPool.getIconURI(sBackButtonIcon),
                press: oController.pressNavBackButton.bind(oController)
            });
            return oBackButton.getId();
        }

        function _createMeAreaButton (oShellModel) {
            var sId = "meAreaHeaderButton";

            var oMeAreaButton = new ShellHeadItem({
                id: sId,
                icon: "{/userImage/personPlaceHolder}",
                ariaLabel: "{i18n>MeAreaToggleButtonAria}",
                tooltip: sap.ushell.Container.getUser().getFullName(),
                press: function () {
                    EventHub.emit("showMeArea", Date.now());
                }
            });
            oMeAreaButton.addEventDelegate({
                onsapskipforward: function (oEvent) {
                    sap.ushell.renderers.fiori2.AccessKeysHandler.bForwardNavigation = true;
                    oEvent.preventDefault();
                    window.document.getElementById("sapUshellHeaderAccessibilityHelper").focus();
                }
            });
            oMeAreaButton.setModel(oShellModel);
            return sId;
        }

        function _applySettingsFloatingNumber (oButtonWithFloatingNumber) {
            oButtonWithFloatingNumber.applySettings({
                floatingNumber: {
                    parts: ["/notificationsCount"],
                    formatter: function (notificationsCount) {
                        // Set aria label
                        var jsButton = this.getDomRef(), ariaLabelValue = "";
                        if (jsButton) {
                            if (notificationsCount > 0) {
                                ariaLabelValue = resources.i18n.getText("NotificationToggleButtonCollapsed", notificationsCount);
                            } else {
                                ariaLabelValue = resources.i18n.getText("NotificationToggleButtonCollapsedNoNotifications");
                            }
                            jsButton.setAttribute("aria-label", ariaLabelValue);
                        }
                        return notificationsCount;
                    }
                }
            }, true, true);
        }

        function _createNotificationButton (oShellModel) {
            // The press handler is added in the Notification Component
            var sId = "NotificationsCountButton";
            var sIconId = "bell";
            var oNotificationToggleButton = new ShellHeadItem({
                id: sId,
                icon: sap.ui.core.IconPool.getIconURI(sIconId),
                text: "{i18n>notificationsBtn_title}",
                visible: true,
                enabled: false,
                press: function () {
                    EventHub.emit("showNotifications", Date.now());
                }
            });
            oNotificationToggleButton.setModel(oShellModel);
            oNotificationToggleButton.setModel(resources.i18nModel, "i18n");
            _applySettingsFloatingNumber(oNotificationToggleButton);
            return sId;
        }

        function _createOverflowButton (oController, oShellModel) {
            var oEndItemsOverflowBtn = new ShellHeadItem({
                id: "endItemsOverflowBtn",
                tooltip: "{i18n>shellHeaderOverflowBtn_tooltip}",
                ariaLabel: "{i18n>shellHeaderOverflowBtn_tooltip}",
                icon: "sap-icon://overflow",
                press: [oController.pressEndItemsOverflow, oController],
                visible: true
            });
            _applySettingsFloatingNumber(oEndItemsOverflowBtn);
            oEndItemsOverflowBtn.setModel(oShellModel);
            return oEndItemsOverflowBtn.getId();
        }

        function _createAppFinderButton (oConfig, oController) {
            var sId = "openCatalogBtn";
            var oOpenCatalogButton = new ShellHeadItem({
                id: sId,
                text: "{i18n>open_appFinderBtn}",
                tooltip: "{i18n>open_appFinderBtn}",
                icon: "sap-icon://sys-find",
                visible: !oConfig.disableAppFinder,
                press: oController.handleAppFinderPress
            });
            oOpenCatalogButton.data("isShellHeader", true);
            if (Config.last("/core/extension/enableHelp")) {
                oOpenCatalogButton.addStyleClass("help-id-openCatalogActionItem"); // xRay help ID
            }
            return sId;
        }

        function _createSupportButton () {
            var sButtonName = "ContactSupportBtn",
                oButton = sap.ui.getCore().byId(sButtonName);
            if (!oButton) {
                // Create an ActionItem from MeArea (ContactSupportButton)
                // in order to to take its text and icon
                // and fire the press method when the shell header item is pressed,
                // but don't render this control
                var oTempButton = new ContactSupportButton("tempContactSupportBtn", {
                    visible: true
                });

                var sIcon = oTempButton.getIcon();
                var sText = oTempButton.getText();
                var oSupportButton = new ShellHeadItem({
                    id: sButtonName,
                    icon: sIcon,
                    tooltip: sText,
                    text: sText,
                    press: function () {
                        oTempButton.firePress();
                    }
                });

                oSupportButton.data("isShellHeader", true);
            }
            return sButtonName;
        }

        function _createFeedbackButton () {
            var sButtonName = "EndUserFeedbackBtn",
                oButton = sap.ui.getCore().byId(sButtonName);

            if (!oButton) {
                // Create an ActionItem from MeArea (EndUserFeedback)
                // in order to take its text and icon
                // and fire the press method when the shell header item is pressed,
                // but don't render this control

                var oTempButton = new EndUserFeedback("EndUserFeedbackHandlerBtn", {});
                var sIcon = oTempButton.getIcon();
                var sText = oTempButton.getText();
                var oFeedbackButton = new ShellHeadItem({
                    id: sButtonName,
                    icon: sIcon,
                    tooltip: sText,
                    addAriaHiddenFalse: true,
                    ariaLabel: sText,
                    text: sText,
                    visible: false // will be set to visible in case an adapter is implemented - done in shell.controller._createActionButtons
                });

                oFeedbackButton.data("isShellHeader", true);
            }
            return sButtonName;
        }

        return {
            init: init,
            destroy: destroy,
            _createOverflowButton: _createOverflowButton
        };


    });