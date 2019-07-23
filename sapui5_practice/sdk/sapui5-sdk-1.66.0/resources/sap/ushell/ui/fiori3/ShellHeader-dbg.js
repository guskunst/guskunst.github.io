// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/*global sap */
sap.ui.define([
        'jquery.sap.global',
        'sap/ui/core/Control',
        'sap/ui/core/theming/Parameters',
        'sap/ui/Device',
        'sap/ui/dom/units/Rem',
        'sap/ui/core/IconPool',
        'sap/ushell/ui/shell/ShellTitle',
        'sap/ushell/Config',
        'sap/ushell/ui/shell/ShellAppTitle',
        './ShellHeaderRenderer'
    ], function (
        jQuery,
        Control,
        ThemingParameters,
        Device,
        Rem,
        IconPool,
        ShellTitle,
        Config
    ) {
        "use strict";

        var sSearchOverlayCSS = "sapUshellShellShowSearchOverlay";

        var _iSearchWidth = 0; // width as requested by the SearchShellHelper

        var ShellHeader = Control.extend("sap.ushell.ui.fiori3.ShellHeader", {
            /** @lends sap.ushell.ui.fiori3.ShellHeader.prototype */
            metadata: {
                properties: {
                    logo: {type: "sap.ui.core.URI", defaultValue: ""},
                    showLogo: {type: "boolean", defaultValue: true},
                    /* TODO: set homeUri = Config.rootIntent in the API */
                    homeUri: {type: "sap.ui.core.URI", defaultValue: "#"}, /* URI to navigate when the user presses the logo */
                    searchState: {type: "string", defaultValue: "COL"},
                    ariaLabel: {type: "string", defaultValue: undefined},
                    centralAreaElement: {type: "string", defaultValue: null}
                },
                aggregations: {
                    headItems: {type: "sap.ushell.ui.shell.ShellHeadItem", multiple: true},
                    headEndItems: {type: "sap.ushell.ui.shell.ShellHeadItem", multiple: true},
                    search: {type: "sap.ui.core.Control", multiple: false},
                    title: {type: "sap.ushell.ui.shell.ShellTitle", multiple: false},
                    appTitle: {type: "sap.ushell.ui.shell.ShellAppTitle", multiple: false}
                },
                associations: {
                    shellLayout : {type : "sap.ui.base.ManagedObject", multiple : false}
                },
                events : {
                    searchSizeChanged : {}
                }
            }
        });

        ShellHeader.prototype.setVisible = function (bVisible) {
            bVisible = bVisible === undefined ? true : !!bVisible;
            jQuery(".sapUshellShellHead, .sapUshellShellHead > .sapUshellShellCntnt")
                .css("display", bVisible ? "" : "none");
            Control.prototype.setVisible.call(this, bVisible);
        };

        /**
         * @returns sap.ui.core.Control the related ShellLayout control
         * @private
         */
        ShellHeader.prototype.getShellLayoutControl = function () {
            return sap.ui.getCore().byId(this.getShellLayout());
        };

        /**
         * Create a separate UI Area and place the Shell Header therein
         * @param {string} [sId="canvas"] ID of the shell UI Area
         * @private
         */
        ShellHeader.prototype.createUIArea = function (sId) {
            var headerArea = document.getElementById('shell-hdrcntnt');
            var canvasId = sId || 'canvas';
            var canvas = document.getElementById(canvasId);
            if (canvas && !headerArea) {
                canvas.insertAdjacentHTML('beforebegin',
                    '<header id="shell-hdr" class="sapContrastPlus sapUshellShellHead">' +
                    '</header>');
                if (!this.getVisible()) {
                    this.setVisible(false); // force hide outer divs
                }
                this.placeAt('shell-hdr');
            }
        };

        /**
         * The search states that can be passed as a parameter to the setSearchState.
         * Values:
         * COL - search field is hidden
         * EXP - search field is visible, other shell header elements can be hidden
         * EXP_S - search field is visible, other elements in the header remain visible
         */
        ShellHeader.prototype.SearchState = {
            COL: "COL",
            EXP: "EXP",
            EXP_S: "EXP_S"
        };

        ShellHeader.prototype.init = function () {
            Device.media.attachHandler(this._refreshLayout, this, Device.media.RANGESETS.SAP_STANDARD);
            Device.resize.attachHandler(this._refreshLayout, this);

            this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
        };

        /**
         * This hook is called before the shell header control is destroyed
         * @private
         */
        ShellHeader.prototype.exit = function () {
            Device.media.detachHandler(this._refreshLayout, this, Device.media.RANGESETS.SAP_STANDARD);
            Device.resize.detachHandler(this._refreshLayout, this);
            var shellHeader = document.getElementById('shell-hdr');
            if (shellHeader) {
                shellHeader.parentElement.removeChild(shellHeader);
            }
        };

        /**
         * Set Access Key Handler
         * @param {object} AccessKeyHandler AccessKeyHandler
         * @private
         */
        ShellHeader.prototype.setAccessKeyHandler = function (AccessKeyHandler) {
            this._accessKeyHandler = AccessKeyHandler;
        };

        /**
         * Handle keyboard navigation when focus is send to the ShellHeader.
         *
         * @private
         */
        ShellHeader.prototype._handleFocus = function () {
            if (this._accessKeyHandler) {
                if (this._accessKeyHandler.fromOutside || this._accessKeyHandler.bForwardNavigation) {
                    if (this._accessKeyHandler.bForwardNavigation) {
                        var aHeaderItems = this.getHeadItems();
                        if (aHeaderItems.length > 0) {
                            aHeaderItems[0].focus();
                        } else {
                            this.getAppTitle().focus();
                        }
                    } else {
                        var aHeaderEndItems = this.getHeadEndItems();
                        if (aHeaderEndItems.length > 0) {
                            aHeaderEndItems[aHeaderEndItems.length - 1].focus();
                        } else {
                            this.getAppTitle().focus();
                        }
                    }
                    this._accessKeyHandler.fromOutside = false;
                } else {
                    this._accessKeyHandler.bFocusOnShell = false;
                    this._accessKeyHandler.fromOutside = true;
                }
            }
        };

        /**
         * Handle space key when focus is in the ShellHeader.
         * 
         * @param {object} oEvent - the keyboard event
         * @private
         */
        ShellHeader.prototype.onsapspace = function (oEvent) {
            // Navigate home when a user presses the space keyboard button in the logo
            var oTarget = oEvent.target;
            if (oTarget && oTarget.id === this.getId() + "-logo") {
                window.location.href = oTarget.href;
            }
        };

        ShellHeader.prototype.onAfterRendering = function () {
            this.$("icon").one('load', this._refreshLayout.bind(this));
            this._refreshLayout();

            // If xRay help is enabled
            if (Config.last("/core/extension/enableHelp")) {
                var aButtonIds = [
                    "actionsBtn",
                    "configBtn",
                    "homeBtn"
                ];

                for (var i = 0; i < aButtonIds.length; i++) {
                    var oButton = window.document.getElementById(aButtonIds[i]);

                    if (oButton) {
                        oButton.classList.add("help-id-" + aButtonIds[i]); // xRay help ID
                    }
                }
            }

            var oAccessibilityHelper = window.document.getElementById("sapUshellHeaderAccessibilityHelper");

            if (oAccessibilityHelper) {
                oAccessibilityHelper.addEventListener("focus", this._handleFocus.bind(this));
            }
        };

        ShellHeader.prototype.onThemeChanged = function () {
            this.invalidate();
        };

        ShellHeader.prototype._getLogo = function () {
            return this.getLogo() || ThemingParameters._getThemeImage(null, true); // theme logo
        };

        ShellHeader.prototype._refreshLayout = function () {
            if (!this.getDomRef()) {
                return;
            }
            this._setAppTitleFontSize();

            // Search field related logic:
            if (this.getSearchVisible()) {
                var $Search = this.$("hdr-search");
                $Search[0].style.display = "none";
                this._hideElementsForSearch();
                $Search[0].style.display = "";
                $Search.css("max-width", _iSearchWidth + "rem");
                this.fireSearchSizeChanged({
                    remSize: Rem.fromPx($Search.width()),
                    isFullWidth: this.isPhoneState()
                });
            }
        };

        // The function is not needed in Fiori3 but is still called in the AppTitle control:
        ShellHeader.prototype._setMaxWidthForTitle = jQuery.noop;

        /**
         * Iff there is not enought space for the App title, reduce the font size
         * @private
         */
        ShellHeader.prototype._setAppTitleFontSize = function () {
            if (this.isLSize()) {
                return;
            }
            var oAppTitle = document.getElementById("shellAppTitle");
            var cssClassName = 'sapUshellHeadTitleWithSmallerFontSize';
            if (oAppTitle && oAppTitle.style.display != "none") {
                oAppTitle.classList.remove(cssClassName);
                if (oAppTitle.scrollWidth > oAppTitle.clientWidth) {
                    oAppTitle.classList.add(cssClassName);
                }
            }
        };

        ShellHeader.prototype.setAppTitle = function (oAppTitle) {
            oAppTitle.attachTextChanged(this._refreshLayout, this);
            this.setAggregation("appTitle", oAppTitle, true);
        };

        ShellHeader.prototype.removeAppTitle = function (oAppTitle) {
            oAppTitle.detachedTextChanged(this._refreshLayout);
            this.removeAggregation("appTitle");
        };

        ShellHeader.prototype.setTitleControl = function (sTitle) {
            var oTitle = this.getTitle();
            if (!oTitle) {
                oTitle = new ShellTitle({ text: sTitle });
                this.setTitle(oTitle);
            } else {
                oTitle.setText(sTitle);
            }
        };

        ShellHeader.prototype.removeHeadItem = function (vItem) {
            if (typeof vItem === 'number') {
                vItem = this.getHeadItems()[vItem];
            }
            this.removeAggregation('headItems', vItem);
        };

        ShellHeader.prototype.addHeadItem = function (oItem) {
            this.addAggregation('headItems', oItem);
        };

        ShellHeader.prototype.isPhoneState = function () {
            var deviceType = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;
            var bEnoughSpaceForSearch = this.$().width() > _iSearchWidth;
            return (Device.system.phone || deviceType === "Phone" || !bEnoughSpaceForSearch);
        };

        ShellHeader.prototype.isLSize = function () {
            return Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name === "Desktop";
        };

                /**
         *
         * @param sStateName -
         * {ShellHeader.SearchState} [sStateName]
         *   The search state to be set.
         *   The validate values are - COL, EXP, EXP_S
         * @param {string} [maxRemSize]
         *  The optional max width in rem
         *  @param {boolean} [bWithOverlay]
         *  If the state is EXP the overlay appears according to this parameter (the default is true)
         */
        ShellHeader.prototype.setSearchState = function (sStateName, maxRemSize, bWithOverlay) {
            if (this.SearchState[sStateName] && this.getSearchState() !== sStateName) {

                if (typeof maxRemSize === "boolean") {
                    bWithOverlay = maxRemSize;
                    maxRemSize = undefined;
                }

                this.setProperty('searchState', sStateName, false);

                var bShow = (sStateName !== "COL");
                var shellLayout = this.getShellLayoutControl();
                if (shellLayout) {
                    shellLayout.toggleStyleClass(sSearchOverlayCSS, bShow && bWithOverlay);
                }

                // save for animation after rendering
                _iSearchWidth = bShow ? maxRemSize || 35 : 0;
            }
        };

        // When the search field is opened, hide header elements, one after another,
        // until the requested width is provided
        ShellHeader.prototype._hideElementsForSearch = function () {
            var nReqWidth,
                $SearchContainer = jQuery(".sapUshellShellHeadSearchContainer"),
                $BeginContainer = this.$("hdr-begin");

            if (this.getSearchState() === "EXP" || this.isPhoneState()) {
                nReqWidth = Rem.toPx(_iSearchWidth + 3); // 3 rem minimal distance for EXP
            } else {
                nReqWidth = Rem.toPx(9 + 0.5); // minimal search width for EXP_S
            }

            // order of removal
            var aElements = [this.$("hdr-center")[0]];
            // left items in reverse order
            $BeginContainer.children().each( function (index, element) {
                aElements.splice(1, 0, element);
            });
            aElements.push($BeginContainer[0]); // the empty container is still 8px wide
            // head end items, all together
            aElements.push(this.$("hdr-end")[0]);

            // remove Elements one-by-one
            for (var i = 0; i < aElements.length - 1; i++) {
                var el = aElements[i];
                if (el) {
                    if (nReqWidth > $SearchContainer.width()) {
                        el.style.display = "none";
                        $BeginContainer[0].style.flexBasis = "auto";
                        continue;
                    }
                    return;
                }
            }

            if (Rem.toPx(_iSearchWidth) > $SearchContainer.width()) { // no minimal distance for the head-end items
                this.$("hdr-end")[0].style.display = "none";
            }
        };

        /**
         * get max width of the search field in rem
         * @private
         */
        ShellHeader.prototype.getSearchWidth = function () {
            return _iSearchWidth;
        };

        /**
         * Returns true if the current page is the homepage
         * @returns {boolean}
         */
        ShellHeader.prototype.isHomepage = function () {
            if (!window.hasher) {
                return false;
            }
            return "#" + window.hasher.getHash() === this.getHomeUri();
        };

        // Returns true when the search field is visible
        ShellHeader.prototype.getSearchVisible = function () {
            return this.getSearchState() !== this.SearchState.COL;
        };

        ShellHeader.prototype.getCentralControl = function () {
            if (this.getCentralAreaElement()) {
                return sap.ui.getCore().byId(this.getCentralAreaElement());
            }
            return null;
        };

        return ShellHeader;

    }, true /* bExport */);
