sap.ui.define([
    "sap/ui/core/Component",
    "sap/ushell/demo/PluginAddFakeCopilot/Copilot",
    "sap/m/MessageToast"
], function (Component, Copilot, MessageToast) {

    "use strict";
    var S_COMPONENT_NAME = "sap.ushell.demo.PluginAddFakeCopilot";

    return Component.extend(S_COMPONENT_NAME + ".Component", {


        metadata: {
            manifest: "json"
        },

        init: function () {
            var oCopilotControl = new Copilot("fakeCopilot", {
                press: function () {
                    MessageToast.show("I am here to save the World!!! Don't disturb me!!!");
                }
            });

            var oComponentData = this.getComponentData();

            oComponentData.getExtensions("Header").then(function (HeaderExtensions) {
                HeaderExtensions.setHeaderCentralAreaElement(oCopilotControl.getId());
            });

        },

        exit: function () {
        }

    });
});
