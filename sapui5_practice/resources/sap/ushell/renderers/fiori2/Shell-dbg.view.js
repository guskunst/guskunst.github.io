// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    'sap/ui/core/IconPool',
    'sap/ui/Device',
    'sap/ui/core/HTML',
    'sap/ushell/components/_HeaderManager/ControlManager',
    'sap/ushell/components/HeaderManager',
    'sap/ushell/components/_HeaderManager/ShellHeader.controller',
    'sap/ushell/ui/launchpad/ActionItem',
    'sap/ushell/ui/shell/ShellHeadItem',
    'sap/ushell/ui/shell/ToolArea',
    'sap/ushell/ui/footerbar/ContactSupportButton',
    'sap/ushell/ui/launchpad/AccessibilityCustomData',
    'sap/ushell/renderers/fiori2/AccessKeysHandler',
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/ushell/resources',
    'sap/ushell/utils',
    'sap/ushell/Config',
    'sap/ushell/EventHub',
    'sap/ui/model/json/JSONModel'
], function (
    IconPool,
    Device,
    HTML,
    HeaderControlManager,
    HeaderManager,
    ShellHeaderController,
    ActionItem,
    ShellHeadItem,
    ToolArea,
    ContactSupportButton,
    AccessibilityCustomData,
    AccessKeysHandler,
    Button,
    Dialog,
    resources,
    utils,
    Config,
    EventHub,
    JSONModel
) {
    "use strict";

    /*global jQuery, sap */
    function fnShellUpdateAggItem (sId, oContext) {
        return sap.ui.getCore().byId(oContext.getObject());
    }


    sap.ui.jsview("sap.ushell.renderers.fiori2.Shell", {
        /**
         * Most of the following code acts just as placeholder for new Unified Shell Control.
         *
         * @param oController
         * @returns {sap.ushell.ui.Shell}
         * @public
         */
        createContent: function (oController) {
            this.oController = oController;
            this.oShellAppTitleStateEnum = {
                SHELL_NAV_MENU_ONLY: 0,
                ALL_MY_APPS_ONLY: 1,
                SHELL_NAV_MENU : 2,
                ALL_MY_APPS: 3
            };
            var oViewData = this.getViewData() || {},
                oConfig = oViewData.config || {},
                oConfigButton = new ShellHeadItem({
                    id: "configBtn",
                    tooltip: "{i18n>showGrpsBtn_tooltip}",
                    ariaLabel: "{i18n>showGrpsBtn_tooltip}",
                    icon: IconPool.getIconURI("menu2"),
                    selected: {
                        path: "/currentState/showPane"
                    },
                    press: [oController.togglePane, oController]
                });
            this.oConfig = oConfig;
            this.aDanglingControls = [];
            // Change config if more then three buttons moved to the header
            this._allowUpToThreeActionInShellHeader(oConfig);


            // the config button is related to the me-area
            oConfigButton.addEventDelegate({
                onsapskipforward: function (oEvent) {
                    if (AccessKeysHandler.getAppKeysHandler()) {
                        oEvent.preventDefault();
                        AccessKeysHandler.bFocusOnShell = false;
                    }
                },
                onfocusin: function () {
                    AccessKeysHandler.bFocusOnShell = true;
                    AccessKeysHandler.bFocusPassedToExternalHandlerFirstTime = true;
                }
            });
            this.addDanglingControl(oConfigButton);

            var oUnifiedShell = sap.ui.xmlfragment("sap.ushell.ui.fiori3.ShellLayout", oController);
            oUnifiedShell._setStrongBackground(true);

            var oShellHeader = this.createShellHeader(oConfig, this.getViewData().shellModel);
            HeaderManager.initShellBarLogo(oConfig, oShellHeader);
            oUnifiedShell.setHeader(oShellHeader);
            oShellHeader.setShellLayout(oUnifiedShell);

            var oShellToolArea;

            // handling of ToolArea lazy creation
            EventHub.once("ToolAreaItemCreated").do(function (oEvt) {
                oShellToolArea = this._createToolArea();
                oUnifiedShell.setToolArea(oShellToolArea);
                oShellToolArea.updateAggregation = this.updateShellAggregation;
            }.bind(this));

            this.setOUnifiedShell(oUnifiedShell);

            this.setDisplayBlock(true);
            this.addDanglingControl(sap.ui.getCore().byId('viewPortContainer'));

            //This property is needed for a special scenario when a remote Authentication is required.
            // IFrame src is set by UI2 Services
            this.logonIFrameReference = null;
            utils.setPerformanceMark("FLP - Shell.view rendering started!");
            return oUnifiedShell;
        },

        /**
         * allow up to 3 actions in shell header
         * @param {*} oConfig view configuration
         */
        _allowUpToThreeActionInShellHeader: function (oConfig) {
            //in order to save performance time when these properties are not define
            if (Object.keys(oConfig).length != 0) {
                var aConfig = [
                    oConfig.moveAppFinderActionToShellHeader,
                    oConfig.moveUserSettingsActionToShellHeader,
                    oConfig.moveGiveFeedbackActionToShellHeader,
                    oConfig.moveContactSupportActionToShellHeader,
                    oConfig.moveEditHomePageActionToShellHeader
                ];
                var count = 0;
                //count the number of "true" values, once get to three, force the other to be "false"
                for (var index = 0; index < 5; index++) {
                    if (count === 3) {
                        aConfig[index] = false;
                    } else if (aConfig[index]) {
                        count++;
                    }
                }
                //assign the values according to above for loop results so only maximum of 3 FLP actions will be moved from the me area to the shell header
                oConfig.moveAppFinderActionToShellHeader = aConfig[0];
                oConfig.moveUserSettingsActionToShellHeader = aConfig[1];
                oConfig.moveGiveFeedbackActionToShellHeader = aConfig[2];
                oConfig.moveContactSupportActionToShellHeader = aConfig[3];
                oConfig.moveEditHomePageActionToShellHeader = aConfig[4];
            }
        },

        createShellHeader: function (oConfig, oShellModel) {
            // Create own model for the header
            var oShellHeaderModel = Config.createModel("/core/shellHeader", JSONModel),
                oHeaderController = new ShellHeaderController(),
                oShellHeader;
            HeaderControlManager.init(oConfig, oHeaderController, oShellModel);
            oShellHeader = sap.ui.xmlfragment("sap.ushell.ui.fiori3.ShellHeader", oHeaderController);
            oShellHeader.setAccessKeyHandler(AccessKeysHandler);

            // Handle the title
            var oShellHeaderAppTitle = oShellHeader.getAppTitle();
            oShellHeaderAppTitle.addEventDelegate({
                onsapskipforward: function (oEvent) {
                    if (AccessKeysHandler.getAppKeysHandler()) {
                        oEvent.preventDefault();
                        AccessKeysHandler.bFocusOnShell = false;
                    }
                }
            });

            // Assign models to the Shell Header
            oShellHeader.setModel(oShellHeaderModel);
            oShellHeader.setModel(resources.i18nModel, "i18n");

            this.addEventDelegate({
                "onBeforeRendering": function () {
                    // Render the Shell Header
                    oShellHeader.createUIArea(this.getUIArea().getId());
                }
            }, this);

            return oShellHeader;
        },

        /**
         * Begin factory functions for lazy instantiation of Shell Layout controls
         */

        _createToolArea: function () {
            var oShellToolArea = new ToolArea({
                id: 'shell-toolArea',
                toolAreaItems: {
                    path: "/currentState/toolAreaItems",
                    factory: fnShellUpdateAggItem
                }
            });
            return oShellToolArea;
        },

        /**
         * In order to minimize core-min we delay the FloatingContainer, ShellFloatingActions creation
         * and enabling MeArea button till core-ext file will be loaded.
         */
        _createPostCoreExtControls: function (FloatingContainer, ShellFloatingActions) {

            var oShell = sap.ui.getCore().byId("shell");

            // qUnit specific: the function may be called after the shell is destroyed
            if (!oShell) {
                return;
            }

            var oShellFloatingContainer = new FloatingContainer({
                id: 'shell-floatingContainer',
                content: {
                    path: "/currentState/floatingContainerContent",
                    factory: fnShellUpdateAggItem
                }
            });
            // add tabindex for the floating container so it can be tab/f6
            oShellFloatingContainer.addCustomData(new AccessibilityCustomData({
                key: "tabindex",
                value: "-1",
                writeToDom: true
            }));
            // from the container , next f6 is to the shell
            oShellFloatingContainer.addEventDelegate({
                onsapskipforward: function (oEvent) {
                    oEvent.preventDefault();
                    AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                    AccessKeysHandler.sendFocusBackToShell(oEvent);
                },
                onsapskipback: function (oEvent) {
                    if (AccessKeysHandler.getAppKeysHandler()) {
                        oEvent.preventDefault();
                        AccessKeysHandler.bFocusOnShell = false;
                    }
                }
            });

            oShellFloatingContainer.setModel(oShell.getModel());

            this.addDanglingControl(oShellFloatingContainer);
            var oShellFloatingActions = new ShellFloatingActions({
                id: 'shell-floatingActions',
                floatingActions: {
                    path: "/currentState/floatingActions",
                    factory: fnShellUpdateAggItem
                }
            });

            oShellFloatingActions.updateAggregation = this.updateShellAggregation;

            var oShellLayout = this.getOUnifiedShell();
            oShellLayout.setFloatingContainer(oShellFloatingContainer);
            oShellLayout.setFloatingActionsContainer(oShellFloatingActions);

            this._createAllMyAppsView();
        },

        createPostCoreExtControls: function () {
            sap.ui.require(
                ["sap/ushell/ui/shell/FloatingContainer", "sap/ushell/ui/shell/ShellFloatingActions"],
                this._createPostCoreExtControls.bind(this)
            );
        },

        _createAllMyAppsView: function () {

            var oModel = this.getModel();

            var onServiceLoaded = function (oAllMyApps) {
                if (oAllMyApps.isEnabled()) {
                    this.oAllMyAppsView = sap.ui.view("allMyAppsView", {
                        type: sap.ui.core.mvc.ViewType.JS,
                        viewName: "sap.ushell.renderers.fiori2.allMyApps.AllMyApps",
                        viewData: {
                            _fnGetShellModel: function() {
                                return oModel;
                            }
                        },
                        async: true,
                        height: "100%",
                        visible: {
                            path: '/ShellAppTitleState',
                            formatter: function (oCurrentState) {
                                return oCurrentState !== this.oShellAppTitleStateEnum.SHELL_NAV_MENU;
                            }.bind(this)
                        }
                    }).addStyleClass("sapUshellAllMyAppsView");

                    this.oAllMyAppsView.addCustomData(new AccessibilityCustomData({
                        key: "aria-label",
                        value: resources.i18n.getText("allMyApps_headerTitle"),
                        writeToDom: true
                    }));

                    this.getOUnifiedShell().getHeader().getAppTitle().setAllMyApps(this.oAllMyAppsView);
                }
            }.bind(this);

            sap.ushell.Container.getServiceAsync("AllMyApps").then(onServiceLoaded);
        },

        getOUnifiedShell: function () {
            return this.oUnifiedShell;
        },
        setOUnifiedShell: function (oUnifiedShell) {
            this.oUnifiedShell = oUnifiedShell;
        },

        updateShellAggregation: function (sName) {
            /*jslint nomen: true */
            var oBindingInfo = this.mBindingInfos[sName],
                oAggregationInfo = this.getMetadata().getJSONKeys()[sName],
                oClone;

            jQuery.each(this[oAggregationInfo._sGetter](), jQuery.proxy(function (i, v) {
                this[oAggregationInfo._sRemoveMutator](v);
            }, this));
            jQuery.each(oBindingInfo.binding.getContexts(), jQuery.proxy(function (i, v) {
                oClone = oBindingInfo.factory(this.getId() + "-" + i, v) ? oBindingInfo.factory(this.getId() + "-" + i, v).setBindingContext(v, oBindingInfo.model) : "";
                this[oAggregationInfo._sMutator](oClone);
            }, this));
        },

        getControllerName: function () {
            return "sap.ushell.renderers.fiori2.Shell";
        },

        createIFrameDialog: function () {
            var oDialog = null,
                oLogonIframe = this.logonIFrameReference,
                bContactSupportEnabled;

            var _getIFrame = function () {
                //In order to assure the same iframe for SAML authentication is not reused, we will first remove it from the DOM if exists.
                if (oLogonIframe) {
                    oLogonIframe.remove();
                }
                //The src property is empty by default. the caller will set it as required.
                return jQuery('<iframe id="SAMLDialogFrame" src="" frameborder="0" height="100%" width="100%"></iframe>');
            };

            var _hideDialog = function () {
                oDialog.addStyleClass('sapUshellSamlDialogHidden');
                jQuery('#sap-ui-blocklayer-popup').addClass('sapUshellSamlDialogHidden');
            };

            //A new dialog wrapper with a new inner iframe will be created each time.
            this.destroyIFrameDialog();

            var closeBtn = new Button({
                text: resources.i18n.getText("samlCloseBtn"),
                press: function () {
                    sap.ushell.Container.cancelLogon(); // Note: calls back destroyIFrameDialog()!
                }
            });

            var oHTMLCtrl = new HTML("SAMLDialogFrame");
            //create new iframe and add it to the Dialog HTML control
            this.logonIFrameReference = _getIFrame();
            oHTMLCtrl.setContent(this.logonIFrameReference.prop('outerHTML'));
            oDialog = new Dialog({
                id: "SAMLDialog",
                title: resources.i18n.getText("samlDialogTitle"),
                contentWidth: "50%",
                contentHeight: "50%",
                rightButton: closeBtn
            }).addStyleClass("sapUshellIframeDialog");
            bContactSupportEnabled = Config.last("/core/extension/SupportTicket");
            if (bContactSupportEnabled) {
                var oContactSupportBtn = new ContactSupportButton();
                oContactSupportBtn.setWidth('150px');
                oContactSupportBtn.setIcon('');
                oDialog.setLeftButton(oContactSupportBtn);
            }
            oDialog.addContent(oHTMLCtrl);
            oDialog.open();
            //Make sure to manipulate css properties after the dialog is rendered.
            _hideDialog();
            this.logonIFrameReference = jQuery('#SAMLDialogFrame');
            return this.logonIFrameReference[0];
        },

        destroyIFrameDialog: function () {
            var dialog = sap.ui.getCore().byId('SAMLDialog');
            if (dialog) {
                dialog.destroy();
            }
            this.logonIFrameReference = null;
        },

        showIFrameDialog: function () {
            //remove css class of dialog
            var oDialog = sap.ui.getCore().byId('SAMLDialog');

            if (oDialog) {
                oDialog.removeStyleClass('sapUshellSamlDialogHidden');
                jQuery('#sap-ui-blocklayer-popup').removeClass('sapUshellSamlDialogHidden');
            }
        },

        addDanglingControl: function (oControl) {
            this.aDanglingControls.push(oControl);
        },

        destroyDanglingControls: function () {
            if (this.aDanglingControls) {
                this.aDanglingControls.forEach(function (oControl) {
                    if (oControl.destroyContent) {
                        oControl.destroyContent();
                    }
                    oControl.destroy();
                });
            }
        }
    });


}, /* bExport= */ false);
