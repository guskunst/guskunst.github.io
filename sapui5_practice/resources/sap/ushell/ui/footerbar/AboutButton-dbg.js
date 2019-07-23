// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.AboutButton.
sap.ui.define([
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/ObjectHeader",
    "sap/m/VBox",
    "sap/ui/layout/form/SimpleForm",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/ActionItem",
    "sap/ushell/services/AppConfiguration",
    "sap/m/Label",
    "sap/m/Text",
    "sap/ushell/utils/type",
    "./AboutButtonRenderer"
], function (Button, Dialog, ObjectHeader, VBox, SimpleForm, library, resources, ActionItem, AppConfiguration, Label, Text, oTypeUtils/*, AboutButtonRenderer */) {
    "use strict";

   /**
    * Constructor for a new ui/footerbar/AboutButton.
    *
    * @param {string} [sId] id for the new control, generated automatically if no id is given
    * @param {object} [mSettings] initial settings for the new control
    *
    * @class
    * Add your documentation for the newui/footerbar/AboutButton
    * @extends sap.ushell.ui.launchpad.ActionItem
    *
    * @constructor
    * @public
    * @name sap.ushell.ui.footerbar.AboutButton
    * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
    */
    var AboutButton = ActionItem.extend("sap.ushell.ui.footerbar.AboutButton", /** @lends sap.ushell.ui.footerbar.AboutButton.prototype */ {
        metadata: {
        library: "sap.ushell"
    }});

    /*global jQuery, sap, navigator*/

    /**
     * AboutButton
     *
     * @name sap.ushell.ui.footerbar.AboutButton
     * @private
     * @since 1.16.0
     */
    AboutButton.prototype.init = function () {
        //call the parent sap.ushell.ui.launchpad.ActionItem init method
        if (ActionItem.prototype.init) {
            ActionItem.prototype.init.apply(this, arguments);
        }
        this.setIcon("sap-icon://hint");
        this.setText(resources.i18n.getText("about"));
        this.setTooltip(resources.i18n.getText("about"));
        this.attachPress(this.showAboutDialog);
        this._translationBundle = resources.i18n;
    };

    AboutButton.prototype.showAboutDialog = function () {

        var metaData = AppConfiguration.getMetadata(),
            oApplication = sap.ushell.Container.getService("AppLifeCycle").getCurrentApplication(),
            sProductVersion = sap.ushell.Container.getLogonSystem().getProductVersion(),
            sClientRole = this._getClientRoleDescription(),
            oSimpleForm = new SimpleForm({
                id: "aboutDialogFormID",
                editable: false,
                layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
                content: [
                    new Label({text: this._translationBundle.getText("technicalName")}),
                    new Text({text: metaData.technicalName || ""}),
                    new Label({text: this._translationBundle.getText("fioriVersionFld")}),
                    new Text({text: metaData.version || ""}),
                    new Label({text: this._translationBundle.getText("sapui5Fld")}),
                    new Text({text: (sap.ui.version || "") + (" (" + (sap.ui.buildinfo.buildtime || "") + ")") || ""}),
                    new Label({text: this._translationBundle.getText("userAgentFld")}),
                    new Text({text: navigator.userAgent || ""}),
                    new Label({text: this._translationBundle.getText("productVersionFld"), visible: !!sProductVersion}),
                    new Text({text: sProductVersion || "", visible: !!sProductVersion}),
                    new Label({text: this._translationBundle.getText("clientRoleFld"), visible: !!sClientRole}),
                    new Text({text: sClientRole || "", visible: !!sClientRole})
                ]
            }),
            oHeader = new ObjectHeader({
                title: metaData.title,
                icon: metaData.icon
            }).addStyleClass("sapUshellAboutDialogHeader"),
            oDialog,
            oVBox,
            okButton = new Button({
                text: this._translationBundle.getText("okBtn"),
                press: function () {
                    oDialog.close();
                }
            });

        if (oApplication) {
            oApplication.getTechnicalParameter("sap-fiori-id")
                .then(function (aFioriId) {
                    if (oTypeUtils.isArray(aFioriId) && aFioriId[0]) {
                        oSimpleForm.addContent(new Label({text: this._translationBundle.getText("fioriAppId")}));
                        oSimpleForm.addContent(new Text({text: aFioriId[0]}));
                    }
                }.bind(this), function (vError) {
                    jQuery.sap.log.error("Cannot get technical parameter 'sap-fiori-id'",
                        vError, "sap.ushell.ui.footerbar.AboutButton");
                });

            oApplication.getTechnicalParameter("sap-ach")
                .then(function (aSapAch) {
                    if (oTypeUtils.isArray(aSapAch) && aSapAch[0]) {
                        oSimpleForm.addContent(new Label({text: this._translationBundle.getText("sapAch")}));
                        oSimpleForm.addContent(new Text({text: aSapAch[0]}));
                    }
                }.bind(this), function (vError) {
                    jQuery.sap.log.error("Cannot get technical parameter 'sap-ach'",
                        vError, "sap.ushell.ui.footerbar.AboutButton");
                });
        }

        if (jQuery.isEmptyObject(metaData) || !metaData.icon) {
            oVBox = new VBox({
                items: [oSimpleForm]
            });
        } else {
            oVBox = new VBox({
                items: [oHeader, oSimpleForm]
            });
        }

        oDialog = new Dialog({
            id: "aboutContainerDialogID",
            title: this._translationBundle.getText("about"),
            contentWidth: "25rem",
            horizontalScrolling: false,
            leftButton: okButton,
            afterClose: function () {
                oDialog.destroy();
            }
        });

        oDialog.addContent(oVBox);
        oDialog.open();
    };

    /**
     * Extracts the translated description text from the message bundle resources for a given short name
     * of the back-end.
     *
     * @returns {string} The translated description text of the client role.
     * @private
     */
    AboutButton.prototype._getClientRoleDescription = function () {
        var sClientRole = sap.ushell.Container.getLogonSystem().getClientRole();

        var oClientRoles = {
            "P": "clientRoleProduction",
            "T": "clientRoleTest",
            "C": "clientRoleCustomizing",
            "D": "clientRoleDemonstration",
            "E": "clientRoleTraining",
            "S": "clientRoleSAPReference"
        };

        return this._translationBundle.getText(oClientRoles[sClientRole]);
    };

    return AboutButton;
}, true /* bExport */);

