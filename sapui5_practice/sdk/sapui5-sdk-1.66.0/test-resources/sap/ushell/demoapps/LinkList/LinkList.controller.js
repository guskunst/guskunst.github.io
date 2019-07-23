(function () {
    "use strict";
    /*global jQuery, sap, console, window, $ */
    /*jslint plusplus: true, nomen: true*/

    sap.ui.controller("sap.ushell.demo.LinkList", {
        onInit : function () {
            var oViewData = this.getView().getViewData();
            var oData = {
                items : [
                    {
                        title: 'Home',
                        url: '#',
                        role: ''
                    },
                    {
                        title: 'Catalog',
                        url: '#shell-catalog',
                        role: ''
                    },
                    {
                        title: 'Create',
                        url: '#Action-toappnavsample',
                        role: ''
                    }
                ]
            };

            if (oViewData) {
                oData = oViewData.data || oData;
            }

            var oModel = new sap.ui.model.json.JSONModel(oData);
            this.getView().setModel(oModel);
        },
        getGroupHeader: function (oGroup) {
            if (!oGroup.key) {
                return '';
            }
            jQuery.sap.require('sap.m.GroupHeaderListItem');
            var that = this;
            return new sap.m.GroupHeaderListItem({
                title: oGroup.key,
                upperCase: false,
                type: sap.m.ListType.Active,
                press: this.toggleSubItemsState
            });
        },
        toggleSubItemsState: function (oEvent) {
            if (oEvent) {
                var jqThis = jQuery(oEvent.getSource().getDomRef());
                jqThis.nextUntil('.sapMGHLI').toggle(300);
            } else {
                var headers = jQuery('.sapMGHLI');
                headers.each(function () {
                    jQuery(this).nextUntil('.sapMGHLI').toggle();
                });
            }
        }
    });
}());