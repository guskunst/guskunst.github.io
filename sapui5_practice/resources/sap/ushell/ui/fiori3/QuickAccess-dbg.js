//Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/utils"
], function (jQuery, Fragment, JSONModel, Config, utils) {
    "use strict";

    /* global sap */

    var oQuickAccess = {

        oModel: new JSONModel({
            recentActivities: [],
            frequentActivities: []
        }),

        sFocusIdAfterClose: null,

        /**
         * Creates the Quick Access dialog and sets the models.
         *
         * @returns {Promise <object>} that resolves with the created Dialog
         * @private
         */
        _createQuickAccessDialog: function () {
            var that = this;

            var oPromise = Fragment.load({
                name: "sap.ushell.ui.fiori3.QuickAccess",
                type: "XML",
                controller: this
            });

            oPromise.then(function (oFragment) {
                that.oQuickAccessDialog = oFragment;
                that.oQuickAccessDialog.setModel(that.oModel);

                that.oQuickAccessDialog.addEventDelegate({
                    onkeydown: function (oEvent) {
                        if (oEvent.keyCode === 27) { // ESC
                            that._closeDialog();
                        }
                    }
                });

                sap.ui.getCore().byId("shell").addDependent(that.oQuickAccessDialog);
            });

            return Promise.resolve(oPromise);
        },

        /**
         * Updates the Quick Access dialog.
         *
         * @param {object} oDialog the Quick Access dialog.
         */
        _updateQuickAccessDialog: function (oDialog) {
            var oUserRecentsSrvc = sap.ushell.Container.getService("UserRecents"),
                oIconTabBar = oDialog.getContent()[0],
                that = this,
                oRecentActivityPromise, oFrequentActivityPromise;

            if (oUserRecentsSrvc && oIconTabBar) {
                oIconTabBar.setBusy(true);

                oRecentActivityPromise = oUserRecentsSrvc.getRecentActivity()
                    .then(function (aActivity) {
                        for (var i = 0; i < aActivity.length; i++) {
                            aActivity[i].timestamp = utils.formatDate(aActivity[i].timestamp);
                        }
                        return aActivity;
                    }, function () {
                        return new jQuery.Deferred().resolve([]);
                    });

                oFrequentActivityPromise = oUserRecentsSrvc.getFrequentActivity()
                    .then(function (aActivity) {
                        return aActivity;
                    }, function () {
                        return new jQuery.Deferred().resolve([]);
                    });

                jQuery.when(oRecentActivityPromise, oFrequentActivityPromise)
                    .done(function (aRecentActivity, aFrequentActivity) {
                        that.oModel.setData({
                            recentActivities: aRecentActivity,
                            frequentActivities: aFrequentActivity
                        });
                        that._setDialogContentHeight(oDialog, Math.max(aRecentActivity.length, aFrequentActivity.length));
                        oIconTabBar.setBusy(false);
                    });
            }
        },

        _setDialogContentHeight: function (oDialog, iItems) {
            // 4rem is the height of the 1 item
            // For the calculation we assume that we need more space as half of the item
            // 2.75 is the header of IconTabBar
            var iHeight = (iItems + 0.5) * 4 + 2.75;

            if (iHeight < 18) {
                iHeight = 18;
            } else if (iHeight > 42) {
                iHeight = 42;
            }
            oDialog.setContentHeight(iHeight + "rem");
        },

        /**
         * Closes and destroys the Quick Access dialog.
         * @private
         */
        _closeDialog: function () {
            var oFocusElement;
            this.oQuickAccessDialog.close();
            this.oQuickAccessDialog.destroy();

            if (!this.sFocusIdAfterClose) {
                return;
            }

            oFocusElement = sap.ui.getCore().byId(this.sFocusIdAfterClose);
            this.sFocusIdAfterClose = null;

            if (!oFocusElement) {
                return;
            }

            oFocusElement.focus();
        },

        /**
         * Navigates to the given item hash or url.
         *
         * @param {object} oEvent the press event
         * @private
         */
        _itemPress: function (oEvent) {
            var oModel = this.oModel,
                sPath = oEvent.getParameter("listItem").getBindingContextPath(),
                oItemModel = oModel.getProperty(sPath);

            if (oItemModel.url[0] === "#") {
                window.hasher.setHash(oItemModel.url);
            } else {
                var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                if (bLogRecentActivity) {
                    var oRecentEntry = {
                        title: oItemModel.title,
                        appType: "App",
                        url: oItemModel.url,
                        appId: oItemModel.url
                    };
                    sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
                }

                window.open(oItemModel.url, "_blank");
            }

            this._closeDialog();
        }
    };

    return {
        /**
         * Opens and updates the Quick Access dialog and sets the given filter id as active.
         *
         * @param {string} sFilterId the id of the IconTabFilter that should be active
         * @param {string} sFocusIdAfterClose the DOM id of the element to focus after close (optional)
         *
         * @since 1.65.0
         * @private
         */
        openQuickAccessDialog: function (sFilterId, sFocusIdAfterClose) {
            oQuickAccess._createQuickAccessDialog().then(function (oDialog) {
                var oIconTabBar = oDialog.getContent()[0];
                if (sFocusIdAfterClose) {
                    oQuickAccess.sFocusIdAfterClose = sFocusIdAfterClose;
                }
                oQuickAccess._updateQuickAccessDialog(oDialog);
                oIconTabBar.setSelectedKey(sFilterId);
                oDialog.open();
            });
        },
        // Used for qunit tests
        _getQuickAccess: function () {
            return oQuickAccess;
        }
    };
}, /* bExport= */ false);