/*!
 * ${copyright}
 */

sap.ui.require([
    "sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
    "use strict";

    sap.ui.getCore().attachInit(function() {
        var oComponentContainer = new ComponentContainer({
            id: "sap.ca.scfld.stableids",
            height : "100%",
            name : "sap.ca.scfld.stableids.app"
        });
        oComponentContainer.placeAt("content");
    });
});