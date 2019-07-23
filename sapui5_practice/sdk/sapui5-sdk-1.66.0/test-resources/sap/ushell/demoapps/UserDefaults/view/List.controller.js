/*global setTimeout, document, shellTrace, alert, sap, jQuery */
/*jslint forin: true*/
sap.ui.controller("sap.ushell.demo.UserDefaults.view.List", {
    oApplication : null,
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.List
*/
    onInit: function () {
        "use strict";
        var page = this.oView.getContent()[0], srvc = sap.ushell.services.AppConfiguration, oActionSheet, oActionsButton;
        if (srvc) {
            page.setShowFooter(true);
            oActionSheet = new sap.m.ActionSheet({ placement: sap.m.PlacementType.Top });
            oActionSheet.addButton(new sap.ushell.ui.footerbar.JamDiscussButton());
            oActionSheet.addButton(new sap.ushell.ui.footerbar.JamShareButton());
            oActionSheet.addButton(new sap.ushell.ui.footerbar.AddBookmarkButton());
            oActionsButton = new sap.m.Button({
                press : function () {
                    oActionSheet.openBy(this);
                },
                icon : "sap-icon://action"
            });

            page.setFooter(new sap.m.Bar({
                contentRight: oActionsButton
            }));

        }
    },

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.Detail
*/
//onBeforeRendering: function() {
//
//},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.List
*/
//onBeforeRendering: function() {
//
//  },

    getRouter: function () {
        "use strict";
        return this.getOwnerComponent().getRouter();
    },

    /*
     * handles changing of the view
    */
    onViewSelectionChange: function (oEvent) {
        "use strict";
        var oItemParam = oEvent.getParameter("listItem");
        var oItem = (oItemParam) ? oItemParam : oEvt.getSource();

        if (/editor/.test(oItem.getId())) {
            this.getRouter().navTo("toEditor");
            return;
        }
        if (/usedParams/.test(oItem.getId())) {
            this.getRouter().navTo("toUsedParams");
            return;
        }
        if (/showEvents/.test(oItem.getId())) {
            this.getRouter().navTo("toShowEvents");
            return;
        }
    },



/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.List
*/
//onAfterRendering: function() {
//
//},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.List
*/
//onExit: function() {
//
//}

});