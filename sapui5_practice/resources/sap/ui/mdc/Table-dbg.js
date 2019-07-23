/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Control', './library', './ActionToolbar', 'sap/m/Text', 'sap/m/Title', 'sap/ui/core/format/NumberFormat', 'sap/ui/model/Sorter', 'sap/ui/core/dnd/DragDropInfo', "./TableSettings", "./GridTableType", "./ResponsiveTableType", "sap/m/ColumnHeaderPopover", "sap/ui/core/Item", "sap/m/ColumnPopoverSortItem"
], function(Control, library, ActionToolbar, Text, Title, NumberFormat, Sorter, DragDropInfo, TableSettings, GridTableType, ResponsiveTableType, ColumnHeaderPopover, Item, ColumnPopoverSortItem) {
	"use strict";

	var SelectionMode = library.SelectionMode;
	var TableType = library.TableType;
	var RowAction = library.RowAction;

	function showMessage(sTextKey, aValues) {
		sap.ui.require([
			"sap/m/MessageToast"
		], function(MessageToast) {
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			MessageToast.show(oRb.getText(sTextKey, aValues));
		});
	}

	/**
	 * Constructor for a new Table.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A metadata driven table to simplify using existing tables like the <code>sap.m.Table</code> and <code>sap.ui.table</code> controls.
	 *        <h3>Overview</h3>
	 *        The <code>Table</code> control creates a RespsoniveTable or GridTable based on the configuration specified.
	 *        <h3>Structure</h3>
	 *        The <code>columns</code> aggregation must be specified with the desired columns, along with with the template for the cell. The cell
	 *        template may be used during binding (e.g. for ResponsiveTable).
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.58
	 * @alias sap.ui.mdc.Table
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Table = Control.extend("sap.ui.mdc.Table", {
		library: "sap.ui.mdc",
		metadata: {
			designtime: "sap/ui/mdc/designtime/Table.designtime",
			specialSettings: {
				metadataContexts: {
					defaultValue: "{path:'',  name: 'collection'}"
				}
			},
			defaultAggregation: "columns",
			properties: {
				/**
				 * The width
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null,
					invalidate: true
				},

				/**
				 * The height
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null,
					invalidate: true
				},
				/**
				 * Specifies the possible actions available on the table row.
				 *
				 * @since 1.60
				 */
				rowAction: {
					type: "sap.ui.mdc.RowAction[]"
				},
				/**
				 * Specifies the personalization mode options set on the table. Note: The order of the options does not influence UI placement.
				 *
				 * @since 1.62
				 */
				p13nMode: {
					type: "sap.ui.mdc.TableP13nMode[]"
				},
				/**
				 * Path to TableDelegate/TableProvider module, that provides the necessary APIs to help create table content. Please ensure that that
				 * file can be required (any necessary library has to be loaded beforehand). DO not bind/modify the module. Once the necessary module
				 * is associated - this property may never be used again
				 *
				 * @experimental
				 */
				metadataDelegate: {
					type: "string",
					defaultValue: "sap/ui/mdc/TableDelegate"
				},
				/**
				 * Specifies header text that is shown in table
				 */
				header: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Whether the header text should be shown in the table. Even when set to <code>false</code> the given header text is used to label
				 * the table correctly for accessibility purposes.
				 *
				 * @since 1.63
				 */
				headerVisible: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				initiallyVisibleFields: {
					type: "string[]"
				},
				selectionMode: {
					type: "sap.ui.mdc.SelectionMode",
					defaultValue: SelectionMode.None
				},
				/**
				 * If set to <code>true</code> (default), the number of rows is shown along with the header text.<br>
				 * If set to <code>false</code>, the number of rows will not be shown on the user interface.<br>
				 * <i>Note:</i><br>
				 * To avoid sending dedicated OData requests in order to improve your application's performance, you must configure the binding of the
				 * table as required.<br>
				 * This should only be used if the backend/service can support count.
				 */
				showRowCount: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Defines the number of records to be requested from the model. If the <code>type</code> property is set to
				 * <code>ResponsiveTable</code> then this property refers to {@link sap.m.ListBase#getGrowingThreshold growingThreshold} property of
				 * the <code>sap.m.Table</code> If the <code>type</code> property is set to <code>Table</code> then this property refers to
				 * {@link sap.ui.table.Table#getThreshold threshold} property of the <code>sap.ui.table.Table</code> <b>Note: </b> This property has
				 * only effect if it is set to a positive integer value, otherwise table uses the defaults of the corresponding table types.
				 *
				 * @since 1.63
				 */
				threshold: {
					type: "int",
					group: "Appearance",
					defaultValue: -1
				},

				/**
				 * No data text to be set/shown on the inner table
				 *
				 * @since 1.63
				 */
				noDataText: {
					type: "string"
				}

			},
			aggregations: {
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				/**
				 * Type of the table
				 */
				type: {
					type: "sap.ui.mdc.TableTypeBase",
					altTypes: [
						"sap.ui.mdc.TableType"
					],
					multiple: false
				},
				/**
				 * Columns of the MDC Table
				 */
				columns: {
					type: "sap.ui.mdc.Column",
					multiple: true
				},
				/**
				 * Dummy aggregation only to get the binding information and forward it to the inner table (type). Should only be used for specifying
				 * binding (without any template); APIs like getBinding, getBindingInfo, insertRow, addRow, removeRow are NOT supported
				 */
				rows: {
					type: "sap.ui.base.ManagedObject",
					multiple: true
				},

				/**
				 * This row can be used for user input to create new data, if the {@link sap.ui.mdc.TableType TableType} is "<code>Table</code>".
				 */
				creationRow: {
					type: "sap.ui.mdc.CreationRow",
					multiple: false
				},

				/**
				 * Additional/External actions for the MDC Table control
				 */
				actions: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						getter: "_createToolbar",
						aggregation: "actions"
					}
				}
			},
			events: {
				rowPress: {
					parameters: {
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				},
				selectionChange: {
					parameters: {
						bindingContext: {
							type: "sap.ui.model.Context"
						},
						selected: {
							type: "boolean"
						},
						selectAll: {
							type: "boolean"
						}
					}
				}
			}
		},
		constructor: function() {
			this._oTableReady = new Promise(this._resolveTable.bind(this));
			Control.apply(this, arguments);
			this.bCreated = true;
			this._iPendingColumnTemplate = 0;
			this._doOneTimeOperations();
			this._initializeContent();
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiMdcTable");
			oRm.writeClasses();

			// add inline styles
			if (oControl.getHeight()) {
				oRm.addStyle("height", oControl.getHeight());
			}
			if (oControl.getWidth()) {
				oRm.addStyle("width", oControl.getWidth());
			}
			oRm.writeStyles();

			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_content"));
			oRm.write("</div>");
		}
	});

	Table.prototype.done = function() {
		return this._oTableReady;
	};

	Table.prototype._resolveTable = function(resolve, reject) {
		this._fResolve = resolve;
		this._fReject = reject;
	};

	// ----Type----
	Table.prototype._getStringType = function(oTypeInput) {
		var sType, oType = sType = oTypeInput || this.getType();
		if (!oType) {
			sType = TableType.Table; // back to the default behaviour
		} else if (typeof oType === "object") {
			sType = oType.isA("sap.ui.mdc.ResponsiveTableType") ? TableType.ResponsiveTable : TableType.Table;
		}
		return sType;
	};

	Table.prototype._updateTypeSettings = function() {
		var oType = this.getType();
		if (oType && typeof oType === "object") {
			oType.updateTableSettings();
		} else {
			oType = oType === "ResponsiveTable" ? ResponsiveTableType : GridTableType;
			// Use defaults from Type
			oType.updateDefault(this._oTable);
		}
	};

	Table.prototype.setType = function(vType) {
		var sType = this._getStringType(vType);
		var sOldType = this._getStringType();

		this.setAggregation("type", vType, true);

		if (sType === sOldType && this._oTable) {
			// Update settings of inner table
			this._updateTypeSettings();
			return this;
		}

		if (this.bCreated) {
			if (this._oTable) {
				if (sOldType === "ResponsiveTable") {
					this._oTable.setHeaderToolbar();
				} else {
					this._oTable.removeExtension(this._oToolbar);
				}
				this._oTable.destroy("KeepDom");
				this._oTable = null;
				this._bTableExists = false;
			} else {
				// reject any pending promise
				this._onAfterTableCreated();
			}
			if (this._oTemplate) {
				this._oTemplate.destroy();
				this._oTemplate = null;
			}
			// recreate the promise when switching table
			this._oTableReady = new Promise(this._resolveTable.bind(this));
			this._initializeContent();
		}
		return this;
	};
	// ----End Type----

	Table.prototype.setSelectionMode = function(sMode) {
		var sOldMode = this.getSelectionMode();
		this.setProperty("selectionMode", sMode, true);
		if (this._oTable && sOldMode != this.getSelectionMode()) {
			this._updateSelectionBehavior();
		}
		return this;
	};

	Table.prototype.setRowAction = function(aActions) {
		var aOldActions = this.getRowAction();
		this.setProperty("rowAction", aActions, true);
		// As there is only 1 possible action right now simply check for length and the 1st/only item
		if (((aActions && aActions.length) != (aOldActions && aOldActions.length)) || aOldActions[0] != aActions[0]) {
			this._updateRowAction();
		}
		return this;
	};

	Table.prototype.setCreationRow = function(oCreationRow) {
		this.setAggregation("creationRow", oCreationRow, true);

		if (oCreationRow) {
			oCreationRow.update();
		}

		return this;
	};

	Table.prototype.setP13nMode = function(aMode) {
		var aOldMode = this.getP13nMode();
		this.setProperty("p13nMode", aMode, true);
		this._updatep13nSettings(aOldMode, aMode);
		return this;
	};

	Table.prototype.setThreshold = function(iThreshold) {
		this.setProperty("threshold", iThreshold, true);
		if (!this._oTable) {
			return this;
		}

		iThreshold = this.getThreshold() > -1 ? this.getThreshold() : undefined;
		if (this._bMobileTable) {
			this._oTable.setGrowingThreshold(iThreshold);
		} else {
			this._oTable.setThreshold(iThreshold);
		}
		return this;
	};

	Table.prototype.setNoDataText = function(sNoData) {
		this.setProperty("noDataText", sNoData, true);
		if (!this._oTable) {
			return this;
		}

		var sNoDataText = this._getNoDataText();
		if (this._bMobileTable) {
			this._oTable.setNoDataText(sNoDataText);
		} else {
			this._oTable.setNoData(sNoDataText);
		}
		return this;
	};

	Table.prototype._getNoDataText = function() {
		if (!this._sFallbackNoData) {
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			this._sFallbackNoData = oRb.getText("table.NO_DATA", "No items available.");
		}
		return this.getNoDataText() || this._sFallbackNoData;
	};

	Table.prototype._updateRowAction = function() {
		var aActions = this.getRowAction(), oInnerRowAction;
		if (this._bMobileTable && this._oTemplate) {
			this._oTemplate.setType(this.hasListeners("rowPress") ? "Active" : "Inactive");
		} else if (this._oTable) {
			oInnerRowAction = this._oTable.getRowActionTemplate();
			if (oInnerRowAction) {
				oInnerRowAction.destroy();
			}
			this._oTable.setRowActionTemplate();
			this._oTable.setRowActionCount();
		}

		if (aActions && aActions.indexOf(RowAction.Navigation) > -1) {
			if (this._oTable) {
				if (this._bMobileTable) {
					this._oTemplate.setType(RowAction.Navigation);
				} else {
					this._oTable.setRowActionTemplate(GridTableType.createNavigationRowAction(this.getId(), [
						this._onRowActionPress, this
					]));
					this._oTable.setRowActionCount(1);
				}
			}
		}
	};

	Table.prototype._initializeContent = function() {
		var sType = this._getStringType();
		var oType = sType === "ResponsiveTable" ? ResponsiveTableType : GridTableType;
		// Load the necessary modules via the corresponding TableType
		Promise.all([
			this.oTableDelegateLoaded, oType.loadTableModules()
		]).then(function() {
			// The table type might be switched while the necessary libs, modules are being loaded; hence the below checks
			if (this.bIsDestroyed) {
				return;
			}
			// The table type might be switched while the necessary libs, modules are being loaded; hence the below checks
			if (!this._bTableExists && sType === this._getStringType()) {
				this._bMobileTable = sType === "ResponsiveTable";
				this._createContent();
				this._bTableExists = true;
			}
		}.bind(this));
	};

	Table.prototype._doOneTimeOperations = function() {
		// Load the delegate once after init
		if (!this.oTableDelegateLoaded) {
			this.oTableDelegateLoaded = new Promise(function(resolve, reject) {
				var sTableDelegateModule = this.getMetadataDelegate();
				sap.ui.require([
					sTableDelegateModule
				], function(TableDelegate) {
					this.oTableDelegate = TableDelegate;
					resolve();
				}.bind(this), function() {
					reject("Faled to load delegate");
				});
			}.bind(this));
		}
		// Order the Columns once after init
		if (!this.bColumnsOrdered) {
			this.bColumnsOrdered = true;
			this._orderColumns();
		}
	};

	Table.prototype._onAfterTableCreated = function(bResult) {
		if (bResult && this._fResolve) {
			this._fResolve(this);
		} else if (this._fReject) {
			this._fReject(this);
		}
		delete this._fResolve;
		delete this._fReject;
	};

	Table.prototype._createContent = function() {
		this._createToolbar();
		this._createTable();

		this._updateRowAction();

		var oCreationRow = this.getCreationRow();
		if (oCreationRow) {
			oCreationRow.update();
		}

		var aMDCColumns = this.getColumns();

		aMDCColumns.forEach(this._insertInnerColumn, this);

		this.setAggregation("_content", this._oTable);

		// Resolve any pending promise if table exists
		this._onAfterTableCreated(true);

		this.rebindTable();
	};

	Table.prototype.setHeader = function(sText) {
		this.setProperty("header", sText, true);
		this._updateHeaderText();
		return this;
	};

	Table.prototype.setHeaderVisible = function(bVisible) {
		this.setProperty("headerVisible", bVisible, true);
		if (this._oTitle) {
			this._oTitle.toggleStyleClass("sapMdcTableHeaderHidden", !this.getHeaderVisible());
		}
		return this;
	};

	Table.prototype._createToolbar = function() {
		if (!this._oToolbar) {
			this._oTitle = new Title(this.getId() + "-title", {
				text: this.getHeader()
			});
			if (!this.getHeaderVisible()) {
				this._oTitle.addStyleClass("sapMdcTableHeaderHidden");
			}
			this._oToolbar = new ActionToolbar(this.getId() + "-toolbar", {
				design: "Transparent",
				begin: [
					this._oTitle
				],
				end: this._getP13nButtons()
			});
		}
		return this._oToolbar;
	};

	Table.prototype._getP13nButtons = function() {
		var aP13nMode = this.getP13nMode() || [], aButtons = [];
		if (aP13nMode.length > 0) {
			// Order should be: Sort, Filter, Group and then Columns as per UX spec
			if (aP13nMode.indexOf("Sort") > -1) {
				aButtons.push(TableSettings.createSortButton(this.getId(), [
					this._showSort, this
				]));
			}
			if (aP13nMode.indexOf("Column") > -1) {
				aButtons.push(TableSettings.createColumnsButton(this.getId(), [
					this._showSettings, this
				]));
			}
		}
		return aButtons;
	};

	Table.prototype._updatep13nSettings = function(aOldMode, aMode) {
		// TODO: consider avoiding destroy and some other optimization if nothing changed
		if (this._oToolbar) {
			this._oToolbar.destroyEnd();
			var aButtons = this._getP13nButtons();
			aButtons.forEach(function(oButton) {
				this._oToolbar.addEnd(oButton);
			}, this);
		}

		if (this._oTable) {
			var oDnDColumns = this._oTable.getDragDropConfig()[0];
			if (oDnDColumns) {
				oDnDColumns.setEnabled((aMode || []).indexOf("Column") > -1);
			}
		}
	};

	Table.prototype._createTable = function() {
		var iThreshold = this.getThreshold() > -1 ? this.getThreshold() : undefined;
		if (this._bMobileTable) {
			this._oTable = ResponsiveTableType.createTable(this.getId() + "-innerTable", {
				growing: true,
				sticky: [
					"ColumnHeaders", "HeaderToolbar"
				],
				itemPress: [
					this._onItemPress, this
				],
				selectionChange: [
					this._onSelectionChange, this
				],
				growingThreshold: iThreshold,
				noDataText: this._getNoDataText(),
				headerToolbar: this._oToolbar,
				ariaLabelledBy: [
					this._oTitle
				]
			});
			this._oTemplate = ResponsiveTableType.createTemplate(this.getId() + "-innerTableRow");
			this._createColumn = Table.prototype._createMobileColumn;
			this._sAggregation = "items";
			// map bindItems to bindRows for Mobile Table to enable reuse of rebind mechanism
			this._oTable.bindRows = this._oTable.bindItems;
			// Enable active column headers by default
			this._oTable.bActiveHeaders = true;
			this._oTable.attachEvent("columnPress", this._onResponsiveTableColumnPress, this);

		} else {
			this._oTable = GridTableType.createTable(this.getId() + "-innerTable", {
				enableBusyIndicator: true,
				enableColumnReordering: false,
				threshold: iThreshold,
				cellClick: [
					this._onCellClick, this
				],
				visibleRowCountMode: "Auto",
				noData: this._getNoDataText(),
				extension: [
					this._oToolbar
				],
				ariaLabelledBy: [
					this._oTitle
				]
			});
			this._oTable.addStyleClass("sapUiTableFixedRowHeights");
			this._createColumn = Table.prototype._createColumn;
			this._sAggregation = "rows";
		}

		// Update defaults from TableType
		this._updateTypeSettings();

		// Update the selection handlers
		this._updateSelectionBehavior();

		var oDDI = new DragDropInfo({
			sourceAggregation: "columns",
			targetAggregation: "columns",
			dropPosition: "Between",
			enabled: (this.getP13nMode() || []).indexOf("Column") > -1,
			drop: [
				this._onColumnRearrange, this
			]
		});
		oDDI.bIgnoreMetadataCheck = true;
		this._oTable.addDragDropConfig(oDDI);
	};

	Table.prototype._updateSelectionBehavior = function() {
		if (this._bMobileTable) {
			this._oTable.setMode(this._getSelectionMode());

			// The event handler of the selection event must not be reset here. It is set once during initialization.
			return;
		}
		this._oTable.destroyPlugins();
		this._oTable.detachRowSelectionChange(this._onRowSelectionChange, this);
		this._oTable.setSelectionMode(this._getSelectionMode());

		if (this.getSelectionMode() === "Multi") {
			this._oTable.addPlugin(GridTableType.createMultiSelectionPlugin(this.getId(), [
				this._onRowSelectionChange, this
			]));
		} else {
			this._oTable.attachRowSelectionChange(this._onRowSelectionChange, this);
		}
	};

	Table.prototype._onColumnRearrange = function(oEvent) {
		var oDraggedColumn = oEvent.getParameter("draggedControl");
		var oDroppedColumn = oEvent.getParameter("droppedControl");
		if (oDraggedColumn === oDroppedColumn) {
			return;
		}
		var sDropPosition = oEvent.getParameter("dropPosition");
		var iDraggedIndex = this._oTable.indexOfColumn(oDraggedColumn);
		var iDroppedIndex = this._oTable.indexOfColumn(oDroppedColumn);
		var iNewIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);

		TableSettings.moveColumn(this, iDraggedIndex, iNewIndex);
	};

	Table.prototype._onResponsiveTableColumnPress = function(oEvent) {
		this._onColumnPress(oEvent.getParameter("column"));
	};

	Table.prototype._onColumnPress = function(oColumn) {
		// Sort disabled by settings
		var aP13nMode = this.getP13nMode() || [];
		if (aP13nMode.indexOf("Sort") < 0) {
			return;
		}

		var iIndex;
		if (oColumn.getParent()) {
			iIndex = oColumn.getParent().indexOfColumn(oColumn);
		}

		// TODO: collect only sortable properties
		var aSortProperties = this.getColumns()[iIndex].getDataProperties();
		if (!aSortProperties.length) {
			return;
		}

		var oSortChild, aSortChildren = [];

		// create sort items
		for (var i = 0; i < aSortProperties.length; i++) {
			oSortChild = new Item({
				text: aSortProperties[i],
				key: aSortProperties[i]
			});

			aSortChildren.push(oSortChild);
		}

		// create ColumnHeaderPopover
		if (aSortChildren.length > 0) {
			// TODO: introduce a WeakMap and save reference to ColumnHeaderPopover there to enable re-use
			this._oPopover = new ColumnHeaderPopover({
				items: [
					new ColumnPopoverSortItem({
						sortChildren: aSortChildren,
						sort: [
							this._onCustomSort, this
						]
					})
				]
			});

			this._oPopover.openBy(oColumn);
			oColumn.addDependent(this._oPopover);
		}
	};

	Table.prototype._onCustomSort = function(oEvent) {
		var sSortProperty = oEvent.getParameter("property");

		TableSettings.createSort(this, sSortProperty, true);
	};

	/**
	 * Gets the selection mode based on the type of table used
	 *
	 * @returns {string} the resolved selection mode based on the table type
	 */
	Table.prototype._getSelectionMode = function() {
		var sSelectionMode = this.getSelectionMode();
		switch (sSelectionMode) {
			case "Single":
				sSelectionMode = this._bMobileTable ? "SingleSelectLeft" : "Single";
				break;
			case "Multi":
				sSelectionMode = this._bMobileTable ? "MultiSelect" : "MultiToggle";
				break;
			default:
				sSelectionMode = SelectionMode.None;
		}
		return sSelectionMode;
	};

	Table.prototype._insertInnerColumn = function(oMDCColumn, iIndex) {
		if (!this._oTable) {
			return;
		}

		var oColumn = this._createColumn(oMDCColumn);
		this._setColumnTemplate(oMDCColumn, oColumn, iIndex);

		if (iIndex === undefined) {
			this._oTable.addColumn(oColumn);
		} else {
			this._oTable.insertColumn(oColumn, iIndex);
		}

		this._updatePopinDelayed();
	};

	Table.prototype._orderColumns = function() {
		var iInitialIndex, aColumnInfos = [], aMDCColumns = this.getColumns();
		aMDCColumns.forEach(function(oColumn) {
			iInitialIndex = oColumn.getInitialIndex();
			if (iInitialIndex > -1) {
				aColumnInfos.push({
					index: iInitialIndex,
					column: this.removeColumn(oColumn)
				});
			}
		}, this);

		aColumnInfos.sort(function(oColInfo1, oColInfo2) {
			return oColInfo1 - oColInfo2;
		});

		aColumnInfos.forEach(function(oColumnInfo) {
			this.insertColumn(oColumnInfo.column, oColumnInfo.index);
		}, this);
	};

	Table.prototype._setColumnTemplate = function(oMDCColumn, oColumn, iIndex) {
		var oTemplate = oMDCColumn.getTemplate();
		this._iPendingColumnTemplate++;
		if (oTemplate) {
			this._setInnerColumnTemplate(oMDCColumn, oColumn, iIndex);
		} else if (this.oTableDelegate) {
			// TODO: pass tableType, editable etc..
			// use leadingPropety to create the column
			this.oTableDelegate.createColumnTemplate({
				name: oMDCColumn.getDataProperties()[0]
			}).then(function(oTemplate) {
				oMDCColumn.setTemplate(oTemplate);
				this._setInnerColumnTemplate(oMDCColumn, oColumn, iIndex);
			}.bind(this));
		}
	};

	Table.prototype._setInnerColumnTemplate = function(oMDCColumn, oColumn, iIndex) {
		var oCellTemplate = oMDCColumn.getTemplate(true), oCreationTemplateClone;
		if (!this._bMobileTable) {
			// TODO: move creationRow stuff into own method --> out of here.
			oCreationTemplateClone = oMDCColumn.getCreationTemplate(true);

			// Grid Table content cannot be wrapped!
			[
				oCellTemplate, oCreationTemplateClone
			].forEach(function(oTemplate) {
				if (!oTemplate) {
					return;
				}

				if (oTemplate.setWrapping) {
					oTemplate.setWrapping(false);
				}

				if (oTemplate.setRenderWhitespace) {
					oTemplate.setRenderWhitespace(false);
				}
			});

			oColumn.setTemplate(oCellTemplate);
			oColumn.setCreationTemplate(oCreationTemplateClone);
		} else {
			if (iIndex >= 0) {
				this._oTemplate.insertCell(oCellTemplate, iIndex);
			} else {
				this._oTemplate.addCell(oCellTemplate);
			}
		}

		this._iPendingColumnTemplate--;
		if (this._bRebindPending && this._iPendingColumnTemplate === 0) {
			this.rebindTable();
		}
	};

	/**
	 * Creates and returns a Column that can be added to the grid table, based on the provided MDCColumn
	 *
	 * @param {object} oMDCColumn - the mdc column instance using which the GridTable column will be created
	 * @private
	 * @returns {object} the column that is created
	 */
	Table.prototype._createColumn = function(oMDCColumn) {
		return GridTableType.createColumn(oMDCColumn.getId() + "-innerColumn", {
			width: oMDCColumn.getWidth(),
			hAlign: oMDCColumn.getHAlign(),
			label: oMDCColumn.getHeader(),
			showSortMenuEntry: false,
			showFilterMenuEntry: false,
			sortProperty: oMDCColumn.getDataProperties()[0],
			filterProperty: oMDCColumn.getDataProperties()[0],
			columnMenuOpen: [
				this._onGridTableColumnPress, this
			]
		});
	};

	Table.prototype._onGridTableColumnPress = function(oEvent) {
		oEvent.preventDefault();
		this._onColumnPress(oEvent.getSource());
	};

	/**
	 * Creates and returns a MobileColumn that can be added to the mobile table, based on the provided MDCColumn
	 *
	 * @param {object} oMDCColumn - the mdc column instance using which the ResponsiveTable column will be created
	 * @private
	 * @returns {object} the column that is created
	 */
	Table.prototype._createMobileColumn = function(oMDCColumn) {
		return ResponsiveTableType.createColumn(oMDCColumn.getId() + "-innerColumn", {
			width: oMDCColumn.getWidth(),
			hAlign: oMDCColumn.getHAlign(),
			header: new Text(oMDCColumn.getId() + "-innerColumnHeader", {
				textAlign: oMDCColumn.getHAlign(),
				text: oMDCColumn.getHeader(),
				wrappingType: "Hyphenated"
			})
		});
	};

	Table.prototype.removeColumn = function(oMDCColumn) {
		oMDCColumn = this.removeAggregation("columns", oMDCColumn, true);
		if (this._oTable) {
			var oColumn = this._oTable.removeColumn(oMDCColumn.getId() + "-innerColumn");
			if (this._oTemplate) {
				this._oTemplate.removeCell(oMDCColumn.getTemplate(true));
			}
			oColumn.destroy(); // TODO: avoid destroy
			this._updatePopinDelayed();
		}
		return oMDCColumn;
	};

	Table.prototype.addColumn = function(oMDCColumn) {
		this.addAggregation("columns", oMDCColumn, true);

		this._insertInnerColumn(oMDCColumn);

		return this;
	};

	Table.prototype.insertColumn = function(oMDCColumn, iIndex) {
		this.insertAggregation("columns", oMDCColumn, iIndex, true);

		this._insertInnerColumn(oMDCColumn, iIndex);

		return this;
	};

// ResponsiveTable
	Table.prototype._updatePopinDelayed = function() {
		if (this._bMobileTable) {
			if (this._iPopinTimeout) {
				clearTimeout(this._iPopinTimeout);
			}
			this._iPopinTimeout = setTimeout(this._updatePopin.bind(this), 0);

		}
	};

	Table.prototype._updatePopin = function() {
		delete this._iPopinTimeout;
		var aColumns, iMinScreenWidth = 0, sColumnWidth, iColumnWidth;
		if (this._bMobileTable && this._oTable) {
			aColumns = this._oTable.getColumns();
			aColumns.forEach(function(oColumn, i) {
				sColumnWidth = oColumn.getWidth();
				if (sColumnWidth && sColumnWidth.endsWith("em")) {
					iColumnWidth = parseFloat(sColumnWidth);
				} else {
					iColumnWidth = 10; // assume 10rem by default
				}
				iMinScreenWidth += iColumnWidth;

				// ensure always two columns without popin
				oColumn.setDemandPopin(!(i < 2));
				oColumn.setPopinDisplay("Inline");
				oColumn.setMinScreenWidth(iMinScreenWidth + "rem");
			});
		}
	};

	Table.prototype._onItemPress = function(oEvent) {
		this.fireRowPress({
			bindingContext: oEvent.getParameter("listItem").getBindingContext()
		});
	};

	Table.prototype._onSelectionChange = function(oEvent) {
		var bSelectAll = oEvent.getParameter("selectAll");

		this.fireSelectionChange({
			bindingContext: oEvent.getParameter("listItem").getBindingContext(),
			selected: oEvent.getParameter("selected"),
			selectAll: bSelectAll
		});

		if (bSelectAll) {
			var oRowBinding = this._getRowBinding();

			if (oRowBinding && this._oTable) {
				var iBindingRowCount = oRowBinding.getLength();
				var iTableRowCount = this._oTable.getItems().length;
				var bIsLengthFinal = oRowBinding.isLengthFinal();

				if (iTableRowCount != iBindingRowCount || !bIsLengthFinal) {
					showMessage("table.SELECTION_LIMIT_MESSAGE", [
						iTableRowCount
					]);
				}
			}
		}
	};

// GridTable
	Table.prototype._onCellClick = function(oEvent) {
		this.fireRowPress({
			bindingContext: oEvent.getParameter("rowBindingContext")
		});
	};

	Table.prototype._onRowActionPress = function(oEvent) {
		var oRow = oEvent.getParameter("row");
		this.fireRowPress({
			bindingContext: oRow.getBindingContext()
		});
	};

	Table.prototype._onRowSelectionChange = function(oEvent) {
		if (!this._bSelectionChangedByAPI) { // TODO Table / Plugin needs to ensure that events are only fired when "relevant" for the app.
			if (oEvent.getParameters().limitReached) { // Only for MultiSelection Plugin
				showMessage("table.SELECTION_LIMIT_MESSAGE", [
					oEvent.getSource().getLimit()
				]);
			}
			this.fireSelectionChange({
				bindingContext: oEvent.getParameter("rowContext"),
				selected: oEvent.getSource().isIndexSelected(oEvent.getParameter("rowIndex")),
				selectAll: oEvent.getParameter("selectAll")
			});
		}
	};

	// TODO: maybe selectedContexts should be an association
	// TODO: The API is unstable/unreliable in GridTable scenarios and has to be worked upon
	/**
	 * API to get user selected contexts from the table.
	 *
	 * @returns {Array} the contexts of rows/items selected by the user
	 * @private
	 * @experimental The API is unstable/unreliable in GridTable scenarios
	 */
	Table.prototype.getSelectedContexts = function() {
		if (this._oTable) {
			if (this._bMobileTable) {
				return this._oTable.getSelectedContexts();
			}

			var aPlugins = this._oTable.getPlugins();
			var aSelectedIndices = (aPlugins[0] || this._oTable).getSelectedIndices();

			return aSelectedIndices.map(function(iIndex) {
				return this._oTable.getContextByIndex(iIndex);
			}, this);
		}
		return [];
	};

	/**
	 * API to get clear selection from the table.
	 *
	 * @private
	 */
	Table.prototype.clearSelection = function() {
		if (this._oTable) {
			if (this._bMobileTable) {
				this._oTable.removeSelections(true);
			} else {
				this._bSelectionChangedByAPI = true;
				var aPlugins = this._oTable.getPlugins();
				(aPlugins[0] || this._oTable).clearSelection();
				this._bSelectionChangedByAPI = false;
			}
		}
	};

	Table.prototype.bindAggregation = function(sName, oBindingInfo) {
		if (sName === "rows") {
			return this.bindRows(oBindingInfo);
		}
		return Control.prototype.bindAggregation.apply(this, arguments);
	};

	Table.prototype.bindRows = function(oBindingInfo) {
		// TODO Introduce entitySet as a property and try to set these based on metadataContext automatically!
		this._oBindingInfo = oBindingInfo;
		if (this._oTable) {
			if (this._bMobileTable && this._oTemplate) {
				oBindingInfo.template = this._oTemplate;
			} else {
				delete oBindingInfo.template;
			}
			if (!oBindingInfo.parameters) {
				oBindingInfo.parameters = {};
			}
			if (this.getShowRowCount()) {
				Table._addBindingListener(oBindingInfo, "dataReceived", this._onDataReceived.bind(this));
				Table._addBindingListener(oBindingInfo, "change", this._updateHeaderText.bind(this));
			}
			this._updateColumnsBeforeBinding(oBindingInfo);
			this._oTable.bindRows(oBindingInfo);
		}
		return this;
	};

	/**
	 * Event handler for binding dataReceived
	 *
	 * @param {object} oEvt - the event instance
	 * @private
	 */
	Table.prototype._onDataReceived = function(oEvt) {
		// AnalyticalBinding fires dataReceived too often/early
		if (oEvt && oEvt.getParameter && oEvt.getParameter("__simulateAsyncAnalyticalBinding")) {
			return;
		}

		this._updateHeaderText();
	};

	Table.prototype._updateHeaderText = function() {
		var sHeader, sRowCount;

		if (this._oTitle && this.getHeader()) {
			sHeader = this.getHeader();
			if (this.getShowRowCount()) {
				sRowCount = this._getRowCount();
				if (sRowCount) {
					sHeader += " (" + sRowCount + ")";
				}
			}

			this._oTitle.setText(sHeader);
		}
	};

	Table.prototype._updateColumnsBeforeBinding = function(oBindingInfo) {
		var aSorters = [].concat(oBindingInfo.sorter || []);
		var aMDCColumns = this.getColumns();
		var bMobileTable = this._bMobileTable;

		aMDCColumns.forEach(function(oMDCColumn) {
			var oInnerColumn = sap.ui.getCore().byId(oMDCColumn.getId() + "-innerColumn");
			if (bMobileTable) {
				oInnerColumn.setSortIndicator("None");
			} else {
				oInnerColumn.setSorted(false);
			}
		});

		aSorters.forEach(function(oSorter) {
			var sSortOrder = (oSorter.bDescending) ? "Descending" : "Ascending";
			aMDCColumns.some(function(oMDCColumn) {
				var oInnerColumn = sap.ui.getCore().byId(oMDCColumn.getId() + "-innerColumn");
				if (oMDCColumn.getDataProperties().indexOf(oSorter.sPath) > -1) {
					if (bMobileTable) {
						oInnerColumn.setSortIndicator(sSortOrder);
					} else {
						oInnerColumn.setSorted(true).setSortOrder(sSortOrder);
					}
					return true;
				}
			});
		});
	};

	/**
	 * gets table's row count
	 *
	 * @param {boolean} bConsiderTotal whether to consider total
	 * @private
	 * @returns {int} the row count
	 */
	Table.prototype._getRowCount = function() {
		var oRowBinding = this._getRowBinding(), iRowCount, sValue = "";

		if (oRowBinding) {
			iRowCount = oRowBinding.getLength();

			if (!this._oNumberFormatInstance) {
				this._oNumberFormatInstance = NumberFormat.getFloatInstance();
			}

			if (oRowBinding.isLengthFinal()) {
				sValue = this._oNumberFormatInstance.format(iRowCount);
			}
		}
		return sValue;
	};

	/**
	 * returns the row/items binding of the currently used internal table
	 *
	 * @private
	 * @returns {sap.ui.model.Binding} the row/items binding
	 */
	Table.prototype._getRowBinding = function() {
		if (this._oTable) {
			return this._oTable.getBinding(this._sAggregation);
		}
	};

	// TODO Util
	/**
	 * Static method for checking and wrapping binding event listeners
	 *
	 * @param {object} oBindingInfo - the bindingInfo (or binding parameter) instance
	 * @param {object} sEventName - the event name
	 * @param {object} fHandler - the handler to be called internally
	 * @private
	 */
	Table._addBindingListener = function(oBindingInfo, sEventName, fHandler) {
		if (!oBindingInfo.events) {
			oBindingInfo.events = {};
		}

		if (!oBindingInfo.events[sEventName]) {
			oBindingInfo.events[sEventName] = fHandler;
		} else {
			// Wrap the event handler of the other party to add our handler.
			var fOriginalHandler = oBindingInfo.events[sEventName];
			oBindingInfo.events[sEventName] = function() {
				fHandler.apply(this, arguments);
				fOriginalHandler.apply(this, arguments);
			};
		}
	};

	/**
	 * Just for test purpose --> has to be finalised
	 *
	 * @experimental
	 */
	Table.prototype._showSettings = function(oEvt) {
		this._showPanel("Columns", oEvt.getSource());
	};

	Table.prototype._showSort = function(oEvt) {
		this._showPanel("Sort", oEvt.getSource());
	};

	Table.prototype._showPanel = function(sPanel, oSource) {
		if (!this._settingsTriggered) {
			this._settingsTriggered = true;
			TableSettings.showPanel(this, sPanel, oSource).then(this._afterSettingsDone.bind(this));
		}
	};

	Table.prototype.rebindTable = function() {
		// Rebind table rows to update data/cells properly
		if (!this._oBindingInfo) {
			return;
		}
		// as the column might be created lazily in the inner table --> delay rebind until the column is actually added
		if (this._iPendingColumnTemplate > 0) {
			this._bRebindPending = true;
			return;
		}
		this._bRebindPending = false;

		this._oBindingInfo.sorter = this._getSorters();
		this.bindRows(this._oBindingInfo);
	};

	Table.prototype._afterSettingsDone = function() {
		delete this._settingsTriggered;
	};

	// TODO: move to a base util that can be used by most aggregations
	Table.prototype._getSorters = function() {
		if (!this.oTableDelegate) {
			return [];
		}

		var aSortedProperties = this.oTableDelegate.getCurrentState(this).sorters;
		return aSortedProperties.map(function(oSortedProperty) {
			return new Sorter(oSortedProperty.name, oSortedProperty.sortOrder === "Descending");
		});
	};

	Table.prototype.exit = function() {
		// Always destroy the template
		if (this._oTemplate) {
			this._oTemplate.destroy();
		}
		this._oTemplate = null;
		this._oTable = null;
		this._oToolbar = null;
		this._oTitle = null;
		this._oNumberFormatInstance = null;

		this._oTableReady = null;
		this.oTableDelegateLoaded = null;
		this._fReject = null;
		this._fResolve = null;
	};

	return Table;

}, /* bExport= */true);
