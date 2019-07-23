(function () {
    "use strict";
    /*global sap,jQuery */
    /*jslint nomen: true, vars: true */
    sap.ui.controller("sap.ushell.demo.ReceiveParametersTestApp.Main", {

        getMyComponent : function () {
            var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var myComponent = sap.ui.component(sComponentId);
            return myComponent;
        },


     

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf Main
         */
        onInit: function () {
            var that = this;

        },

        navigate : function (sEvent, sNavTarget) {
            return;
            var oView = null;
            if (sEvent === "toHome") {
                // use external navigation to navigate to homepage
                if (this.oCrossAppNavigator) {
                    this.oCrossAppNavigator.toExternal({ target : { shellHash : "#" }});
                }
                return;
            }
            if (sEvent === "toView") {
                var sView = sNavTarget; // navtarget;
                if (sView === "" || !this.isLegalViewName(sView)) {
                    var vw = this.mViewNamesToViews.Detail;
                    this.oApp.toDetail(vw);
                    return;
                }
                /* *Nav* (7) Trigger inner app navigation */
                this.oInnerAppRouter.navTo("toaView", { viewName : sView}, true);
                return;
            }
            if (sEvent === "back") {
                this.oApp.back();
            } else if (sEvent === "backDetail") {
                this.oApp.backDetail();
            } else {
                jQuery.sap.log.info("sap.ushell.demo.ReceiveParametersTestApp: Unknown navigation");
            }

        },

        isLegalViewName : function (sViewNameUnderTest) {
            return (typeof sViewNameUnderTest === "string") && (["Detail","View1", "View2", "View3", "View4"].indexOf(sViewNameUnderTest) >= 0);
        },

        doNavigate : function (sEvent, sNavTarget) {
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf Main
         */
//    onBeforeRendering: function() {
//
//    },
        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf Main
         */
//    onAfterRendering: function() {
//
//    },
        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf Main
         */
        onExit: function () {
            jQuery.sap.log.info("sap.ushell.demo.ReceiveParametersTestApp: On Exit of Main.XML.controller called : this.getView().getId():" + this.getView().getId());
            this.mViewNamesToViews = {};
            if (this.oInnerAppRouter) {
                this.oInnerAppRouter.destroy();
            }
        }

    });

}());
