/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */

sap.ui.define([], function () {
    "use strict";

    /**
     * * AppContainer renderer.
     * * @namespace
     * */
    var AppContainerRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     */
    AppContainerRenderer.render = function (rm, oControl) {
        if (!oControl.getVisible()) {
            return;
        }

        rm.write("<div");
        rm.writeControlData(oControl);
        rm.write(">");

        oControl.getPages().forEach(function (oPage) {
            rm.renderControl(oPage);
        });

        rm.write("</div>");
    };

    return AppContainerRenderer;
}, /* bExport= */ true);
