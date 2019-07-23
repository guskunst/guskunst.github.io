// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    'sap/ushell/resources',
    'sap/ui/Device',
    "sap/ushell/Config"
], function (resources, Device, Config) {
    "use strict";

    /**
     * @name ShellHeader renderer.
     * @static
     * @private
     */
    var ShellHeaderRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oHeader ShellHeader to be rendered
     */
    ShellHeaderRenderer.render = function (rm, oHeader) {
        var id = oHeader.getId();
        rm.write("<div");
        rm.writeControlData(oHeader);

        rm.writeAccessibilityState({
            label: oHeader.getAriaLabel(),
            role: "banner"
        });

        rm.addClass("sapUshellShellHeader sapUshellShellCntnt");
        rm.writeClasses();
        rm.write(">");

        rm.write("<div tabindex='0' id='sapUshellHeaderAccessibilityHelper'></div>");

        // Left area
        rm.write("<div id='", id, "-hdr-begin' class='sapUshellShellHeadBegin'>");
        this.renderHeaderItems(rm, oHeader);
        this.renderLogo(rm, oHeader);

        // Render AppTitle and (sub)Title
        rm.renderControl(oHeader.getAppTitle());
        this.renderTitle(rm, oHeader);

        rm.write("</div>");

        //Central container
        var oCentralControl = oHeader.getCentralControl();
        if (oCentralControl) {
            rm.write("<div id='", id, "-hdr-center' class='sapUshellShellHeadCenter' >");
            rm.renderControl(oCentralControl);
            rm.write("</div>");
        }

        // Search container
        rm.write("<div id='", id, "-hdr-search-container' class='sapUshellShellHeadSearchContainer' >");
        // Search field container
        this.renderSearch(rm, oHeader);
        rm.write("</div>");

        // Right area
        rm.write("<div id='", id, "-hdr-end' class='sapUshellShellHeadEnd'>");
        this.renderHeaderEndItems(rm, oHeader);
        rm.write("</div>");

        rm.write("</div>");
    };

    ShellHeaderRenderer.renderSearch = function (rm, oHeader) {
        var oSearch = oHeader.getSearch();
        rm.write("<div id='", oHeader.getId(), "-hdr-search'");
        rm.addClass("sapUshellShellSearch");
        // The following has to be removed after the final Fiori3 design for the header search field:
        if (Device.system.desktop) {
            rm.addClass("sapUiSizeCompact");
        }
        rm.writeClasses();
        rm.addStyle("max-width", oHeader.getSearchWidth() + "rem");

        rm.writeStyles();
        rm.write(">");
        if (oSearch) {
            rm.renderControl(oSearch);
        }
        rm.write("</div>");
    };

    ShellHeaderRenderer.renderTitle = function (rm, oHeader) {
        var sClassName;
        var oTitle = oHeader.getTitle();
        if (oTitle && oTitle.getText()) {
            sClassName = oHeader.getAppTitle() ? "sapUshellShellHeadSubtitle" : "sapUshellShellHeadTitle";
            rm.write("<div id='", oHeader.getId(), "-hdr-title' class='" + sClassName + "'");
            rm.write(">");
            rm.renderControl(oTitle);
            rm.write("</div>");
        }
    };

    /* Left side buttons */
    ShellHeaderRenderer.renderHeaderItems = function (rm, oHeader) {
        var aItems = oHeader.getHeadItems();
        for (var i = 0; i < aItems.length; i++) {
            // Do not render the home button when the logo is available. The logo has the same function as the home button
            if (aItems[i].getId() === "homeBtn" && oHeader.getShowLogo()) {
                continue;
            }
            rm.renderControl(aItems[i]);
        }
    };

    /* right side buttons */
    ShellHeaderRenderer.renderHeaderEndItems = function (rm, oHeader) {
        oHeader.getHeadEndItems().forEach(rm.renderControl);
    };

    /* company logo */
    ShellHeaderRenderer.renderLogo = function (rm, oHeader) {
        var sAriaLabel = resources.i18n.getText("homeBtn_tooltip"),
            sTooltipText = resources.i18n.getText("homeBtn_tooltip_text"),
            sIco = oHeader._getLogo(),
            sClassName = oHeader.getShowLogo() ? "sapUshellShellIco" : "sapUshellShellHideIco";
        sClassName += oHeader.isHomepage() ? " sapUshellLogoLinkDisabled" : "";
        rm.write("<a");
        rm.addClass(sClassName);
        rm.writeAttribute("id", oHeader.getId() + "-logo");
        rm.writeClasses();
        if (!oHeader.isHomepage()) {
            rm.writeAttribute("tabindex", "0");
            rm.writeAttribute("title", sTooltipText);
            rm.writeAttributeEscaped("href", oHeader.getHomeUri());
            rm.writeAccessibilityState({
                label: sAriaLabel,
                role: "button"
            });
        }
        rm.write(">");
        rm.write("<img id='", oHeader.getId(), "-icon'");
        rm.writeAttribute("role", "presentation");
        rm.write("src='");
        rm.writeEscaped(sIco);
        rm.write("'");
        /* TODO: clarify what to do when the logo image is not available */
        if (!sIco) {
            rm.write(" style='display:none;'");
        }
        rm.write("></a>");
    };

    return ShellHeaderRenderer;

}, /* bExport= */ true);
