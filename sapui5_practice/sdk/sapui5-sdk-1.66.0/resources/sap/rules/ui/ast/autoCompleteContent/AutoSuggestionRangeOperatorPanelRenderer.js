/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],

    function(jQuery) {
        "use strict";

        /**
         * autoSuggestionRangeOperatorPanelRenderer renderer.
         *  @namespace
         */
        var autoSuggestionRangeOperatorPanelRenderer = {};

        /**
         * Renders the HTML for the given control, using the provided
         * {@link sap.ui.core.RenderManager}.
         *
         * @param {sap.ui.core.RenderManager} oRm
         *            the RenderManager that can be used for writing to
         *            the Render-Output-Buffer
         * @param {sap.ui.core.Control} oControl
         *            the control to be rendered
         */
        autoSuggestionRangeOperatorPanelRenderer.render = function(oRm, oControl) {

            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapAstRangeOperatorPanel");
            oRm.writeClasses();
            oRm.write(">");
            var autoSuggestionRangeOperatorPanelRenderer = oControl.getAggregation("PanelLayout");
            oRm.renderControl(autoSuggestionRangeOperatorPanelRenderer);
            oRm.write("</div>");

        };

        return autoSuggestionRangeOperatorPanelRenderer;

    }, /* bExport= */ true);