/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],

    function (jQuery) {
        "use strict";

        /**
         * AutoSuggestionVocabularyRulesPanelRenderer
         *  @namespace
         */
        var autoSuggestionVocabularyRulesPanelRenderer = {};

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
        autoSuggestionVocabularyRulesPanelRenderer.render = function (oRm, oControl) {

            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapAstRulesPanelRenderers");
            oRm.writeClasses();
            oRm.write(">");
            var autoSuggestionVocabularyRulesPanelRenderer = oControl.getAggregation("PanelLayout");
            oRm.renderControl(autoSuggestionVocabularyRulesPanelRenderer);
            oRm.write("</div>");

        };

        return autoSuggestionVocabularyRulesPanelRenderer;

    }, /* bExport= */ true);