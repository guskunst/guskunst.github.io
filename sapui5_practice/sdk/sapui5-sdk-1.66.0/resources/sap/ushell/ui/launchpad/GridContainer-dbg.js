// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.GridContainer.
sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/core/Control",
    "sap/ushell/library",
    "sap/ui/core/Icon",
    "sap/m/Input",
    "sap/m/Text",
    "sap/ushell/resources",
    "sap/f/GridContainer",
    "sap/f/GridContainerSettings",
    "sap/f/GridContainerItemLayoutData",
    "sap/ushell/ui/launchpad/GridContainerRenderer",
    "sap/ushell/utils",
    "sap/ushell/ui/launchpad/Tile"
], function (
    ManagedObject,
    Control,
    library,
    Icon,
    Input,
    Text,
    resources,
    Ui5GridContainer,
    Ui5GridContainerSettings,
    Ui5GridContainerItemLayoutData,
    GridContainerRenderer,
    UshellUtils,
    Tile
) {
    "use strict";

    /**
     * Constructor for a new sap/ushell/ui/launchpad/GridContainer.
     *
     * @param {string} [sId] The ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] The initial settings for the new control
     *
     * @class
     * A container that arranges Tile and Card controls.
     * @extends sap.ui.core.Control
     *
     * @constructor
     * @protected
     * @name sap.ushell.ui.launchpad.GridContainer
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     * @since 1.62
     */
    var GridContainer = Control.extend("sap.ushell.ui.launchpad.GridContainer", /** @lends sap.ushell.ui.launchpad.GridContainer.prototype*/{
        metadata: {
            library: "sap.ushell",
            properties: {
                groupId: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                showHeader: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: true
                },
                defaultGroup: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                isLastGroup: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                headerText: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                headerLevel: {
                    type: "sap.m.HeaderLevel",
                    group: "Misc",
                    defaultValue: sap.m.HeaderLevel.H2
                },

                /**
                 * Header level (H1-H6) used for headers of tile groups.
                 */
                groupHeaderLevel: {
                    type: "sap.m.HeaderLevel",
                    group: "Misc",
                    defaultValue: sap.m.HeaderLevel.H4
                },
                showGroupHeader: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: true
                },
                homePageGroupDisplay: {
                    type: "string",
                    defaultValue: null
                },
                isGroupLocked: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: null
                },
                isGroupSelected: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                editMode: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                showBackground: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                icon: {
                    type: "string",
                    group: "Misc",
                    defaultValue: "sap-icon://locked"
                },
                showIcon: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                enableHelp: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                tileActionModeActive: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                ieHtml5DnD: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                showEmptyLinksArea: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                showEmptyLinksAreaPlaceHolder: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },

                /**
                 * Set to true if the LaunchPageAdapter supports link personalization.
                 */
                supportLinkPersonalization: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                }
            },
            aggregations: {
                tiles: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "tile",
                    forwarding: {
                        getter: "_getInternalGrid",
                        aggregation: "items"
                    }
                },

                links: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "link"
                },

                _grid: {
                    type: "sap.f.GridContainer",
                    multiple: false,
                    visibility: "hidden"
                },

                beforeContent: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "beforeContent"
                },

                afterContent: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "afterContent"
                },

                footerContent: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "footerContent"
                },

                headerActions: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "headerAction"
                }
            },
            events: {
                afterRendering: {},
                /**
                 * This Event is triggered when the group title is modified.
                 */
                titleChange: {}
            }
        }
    });

    GridContainer.prototype.init = function () {
        this.setAggregation("_grid", new Ui5GridContainer({
            snapToRow: true,
            layout: new Ui5GridContainerSettings({
                rowSize: "5.25rem",
                columnSize: "5.25rem",
                gap: "0.5rem"
            }),
            layoutS: new Ui5GridContainerSettings({
                rowSize: "4.375rem",
                columnSize: "4.375rem",
                gap: "0.5rem"
            })/*,
            layoutXL: new Ui5GridContainerSettings({
                rowSize: "5.25rem",
                columnSize: "5.25rem",
                gap: "0.5rem",
                autoFlow: "RowDense" // This is not yet implemented by the GridContainer which is why this section is commented out
            })*/
        }));

        this.oNoLinksText = new Text({
            text: resources.i18n.getText("emptyLinkContainerInEditMode")
        }).addStyleClass("sapUshellNoLinksAreaPresentTextInner");

        this.oTransformationErrorText = new Text({
            text: resources.i18n.getText("transformationErrorText")
        }).addStyleClass("sapUshellTransformationErrorText");

        this.oTransformationErrorIcon = new Icon({
            src: "sap-icon://message-error"
        }).addStyleClass("sapUshellTransformationErrorIcon");

        this.oIcon = new Icon({
            src: this.getIcon()
        });
        this.oIcon.addStyleClass("sapUshellContainerIcon");

        this.oEditInputField = new Input({
            placeholder: resources.i18n.getText("new_group_name"),
            value: this.getHeaderText()
        }).addStyleClass("sapUshellTileContainerTitleInput");

        this.oEditInputField.addEventDelegate({
            onfocusout: this.setEditMode.bind(this, false),
            onsapenter: this.setEditMode.bind(this, false)
        });
    };

    GridContainer.prototype.exit = function () {
        if (this.oNoLinksText) {
            this.oNoLinksText.destroy();
        }

        if (this.oTransformationErrorText) {
            this.oTransformationErrorText.destroy();
        }

        if (this.oTransformationErrorIcon) {
            this.oTransformationErrorIcon.destroy();
        }

        if (this.oIcon) {
            this.oIcon.destroy();
        }

        if (this.oEditInputField) {
            this.oEditInputField.destroy();
        }

        Control.prototype.exit.apply(this, arguments);
    };

    GridContainer.prototype.onAfterRendering = function () {
        var that = this;

        var oTitleText = window.document.getElementById(this.getId() + "-titleText");
        if (oTitleText) {
            oTitleText.addEventListener("click", function () {
                var bEnableRenameLockedGroup = that.getModel() && that.getModel().getProperty("/enableRenameLockedGroup"),
                    bEditMode = (bEnableRenameLockedGroup || !that.getIsGroupLocked()) && !that.getDefaultGroup() && that.getTileActionModeActive();
                that.setEditMode(bEditMode);
            });
        }

        var oEditDomRef = this.oEditInputField.getDomRef();
        if (oEditDomRef) {
            setTimeout(function () {
                oEditDomRef.querySelector("input").focus();
            }, 100);
        }

        this.fireAfterRendering();
    };

    GridContainer.prototype.getShowPlaceholder = function () {
        // TODO: Function should be deleted if we remove feature switch 'Config.last("/core/home/gridContainer")'
        return false;
    };

    GridContainer.prototype.setGroupId = function (sValue) {
        this.setProperty("groupId", sValue, true);
        return this;
    };

    GridContainer.prototype.groupHasTiles = function () {
        var aTiles = this.getTiles();

        if (this.getBindingContext()) {
            var sPath = this.getBindingContext().sPath;
            aTiles = this.getModel().getProperty(sPath).tiles;
        }

        return sap.ushell.utils.groupHasVisibleTiles(aTiles, []);
    };

    GridContainer.prototype.getInnerContainersDomRefs = function () {
        var oContainerDOM = this.getDomRef();

        if (!oContainerDOM) {
            return null;
        }

        var oInnerContainer = oContainerDOM.querySelector(".sapUshellTilesContainer-sortable"),
            oLinksContainer = oContainerDOM.querySelector(".sapUshellLineModeContainer");

        return [ oInnerContainer, oLinksContainer ];
    };

    GridContainer.prototype.setEditMode = function (bValue) {
        if (this.getEditMode() === bValue) {
            return;
        }

        this.setProperty("editMode", bValue, false);
        this.getModel().setProperty("/editTitle", bValue, false);

        if (bValue) {
            this.addStyleClass("sapUshellEditing");

            this.oEditInputField.setValue(this.getHeaderText());

            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("launchpad", "scrollToGroup", {
                group: this,
                groupChanged: false,
                focus: false
            });
        } else {
            this.removeStyleClass("sapUshellEditing");

            var sNewTitle = this.oEditInputField.getValue();

            sNewTitle = sNewTitle.substring(0, 256).trim() || this.oEditInputField.getPlaceholder();

            if (sNewTitle !== this.getHeaderText()) {
                this.fireTitleChange({
                    newTitle: sNewTitle
                });
                this.setHeaderText(sNewTitle);
            }
        }
    };

    GridContainer.prototype.setShowEmptyLinksArea = function (bValue) {
        this.setProperty("showEmptyLinksArea", bValue, true);
        this.toggleStyleClass("sapUshellLinksAreaHidden", !bValue);
    };

    GridContainer.prototype.setShowEmptyLinksAreaPlaceHolder = function (bValue) {
        this.setProperty("showEmptyLinksArea", bValue, true);
        this.toggleStyleClass("sapUshellTileContainerEditMode", bValue);
        this.toggleStyleClass("sapUshellTileContainerTabsModeEmptyLinksArea", bValue);
        this.toggleStyleClass("sapUshellEmptyLinksAreaPlaceHolder", !bValue);
    };

    GridContainer.prototype._getInternalGrid = function () {
        return this.getAggregation("_grid");
    };

    GridContainer.prototype.addAggregation = function (sAggregationName, oObject) {
        Control.prototype.addAggregation.apply(this, arguments);

        if (sAggregationName === "tiles") {
            this._addItemLayoutData(oObject);
        }

        return this;
    };

    GridContainer.prototype.insertAggregation = function (sAggregationName, oObject, iIndex) {
        Control.prototype.insertAggregation.apply(this, arguments);

        if (sAggregationName === "tiles") {
            this._addItemLayoutData(oObject);
        }

        return this;
    };

    /**
     * Add Layout to the input item. The input item should only be a sap.ui.integration.widgets.Card
     * or sap.ushell.ui.launchpad.Tile
     *
     * @param {sap.ui.core.Control} oItem
     *  An item which can be a tile or card
     *
     * @private
     */
    GridContainer.prototype._addItemLayoutData = function (oItem) {
        var oLayoutData,
            oItemLayout;

        if (oItem instanceof Tile) {
            oLayoutData = {
                rows: 2,
                columns: {
                    path: "long",
                    formatter: GridContainer._getItemLayoutColumn
                }
            };
        } else {
            // Add layout data to sap.ui.integration.widgets.Card
            var oCardManifest = oItem.getManifest(),
                sCardRow = UshellUtils.getMember(oCardManifest, "sap|flp.rows") || 3,
                sCardColumn = UshellUtils.getMember(oCardManifest, "sap|flp.columns") || 3;

            oLayoutData = {
                rows: parseInt(sCardRow, 10),
                columns: parseInt(sCardColumn, 10)
            };
        }

        oItemLayout = new Ui5GridContainerItemLayoutData(oLayoutData);
        oItem.setLayoutData(oItemLayout);
    };

    /**
     * @param {boolean} bLong
     *  An item is long or not
     * @returns {string}
     *  The column layout of the item
     * @private
     */
    GridContainer._getItemLayoutColumn = function (bLong) {
        return bLong ? 4 : 2;
    };

    return GridContainer;
});
