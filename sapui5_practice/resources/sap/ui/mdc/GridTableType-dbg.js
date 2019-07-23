/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/mdc/TableTypeBase", "./library"
], function(TableTypeBase, library) {
	"use strict";

	var InnerTable, InnerColumn, InnerRowAction, InnerRowActionItem, InnerMultiSelectionPlugin;
	var RowCountMode = library.RowCountMode;
	var RowAction = library.RowAction;

	/**
	 * Constructor for a new GridTableType.
	 *
	 * @param {string} [sId] ID for the new object, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The table type info base class for the metadata driven table.
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.mdc.TableTypeBase
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.65
	 * @alias sap.ui.mdc.GridTableType
	 * @ui5-metamodel This element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var GridTableType = TableTypeBase.extend("sap.ui.mdc.GridTableType", {
		metadata: {
			properties: {
				/**
				 * See sap.ui.mdc.RowCountMode for the options.<br>
				 * Defaults to Auto --> meaning table adjusts it's height based on the parent container
				 */
				rowCountMode: {
					type: "sap.ui.mdc.RowCountMode",
					defaultValue: RowCountMode.Auto
				},
				/**
				 * RowCount of the inner table.<br>
				 * When sap.ui.mdc.RowCountMode.Auto is used - this property specifies the minAutoRowCount.<br>
				 * When sap.ui.mdc.RowCountMode.Fixed is used - this property specifies the visibleRowCount.
				 */
				rowCount: {
					type: "int",
					defaultValue: 10
				}
			}
		}
	});

	GridTableType.prototype.updateRelevantTableProperty = function(oTable, sProperty, vValue) {
		if (oTable && oTable.isA("sap.ui.table.Table")) {
			if (sProperty === "rowCountMode") {
				oTable.setVisibleRowCountMode(vValue);
				this._updateTableRowCount(oTable, vValue, this.getRowCount());
			} else if (sProperty === "rowCount") {
				this._updateTableRowCount(oTable, this.getRowCountMode(), vValue);
			}
		}
	};

	GridTableType.prototype._updateTableRowCount = function(oTable, sMode, iValue) {
		if (sMode === RowCountMode.Fixed) {
			oTable.setVisibleRowCount(iValue);
		} else {
			oTable.setMinAutoRowCount(iValue);
		}
	};

	GridTableType.updateDefault = function(oTable) {
		if (oTable) {
			oTable.setVisibleRowCountMode(RowCountMode.Auto);
			oTable.setMinAutoRowCount(10); // default in this class
		}
	};

	/* Below APIs are used during table creation */

	GridTableType.loadGridTableLib = function() {
		if (!this._oGridTableLibLoaded) {
			this._oGridTableLibLoaded = sap.ui.getCore().loadLibrary("sap.ui.table", true);
		}
		return this._oGridTableLibLoaded;
	};

	GridTableType.loadTableModules = function() {
		if (!InnerTable) {
			return new Promise(function(resolve, reject) {
				this.loadGridTableLib().then(function() {
					sap.ui.require([
						"sap/ui/table/Table", "sap/ui/table/Column", "sap/ui/table/RowAction", "sap/ui/table/RowActionItem", "sap/ui/table/plugins/MultiSelectionPlugin"
					], function(GridTable, GridColumn, RowAction, RowActionItem, MultiSelectionPlugin) {
						InnerTable = GridTable;
						InnerColumn = GridColumn;
						InnerRowAction = RowAction;
						InnerRowActionItem = RowActionItem;
						InnerMultiSelectionPlugin = MultiSelectionPlugin;
						resolve();
					}, function() {
						reject("Failed to load some modules");
					});
				});
			}.bind(this));
		} else {
			return Promise.resolve();
		}
	};

	GridTableType.createTable = function(sId, mSettings) {
		return new InnerTable(sId, mSettings);
	};

	GridTableType.createColumn = function(sId, mSettings) {
		return new InnerColumn(sId, mSettings);
	};

	GridTableType.createNavigationRowAction = function(sIdPrefix, aEventInfo) {
		return new InnerRowAction(sIdPrefix + "--rowAction", {
			items: new InnerRowActionItem(sIdPrefix + "--rowActionItem", {
				type: RowAction.Navigation,
				press: aEventInfo
			})
		});
	};

	GridTableType.createMultiSelectionPlugin = function(sIdPrefix, aEventInfo) {
		return new InnerMultiSelectionPlugin(sIdPrefix + "--multiSelectPlugin", {
			limit: 200,
			selectionChange: aEventInfo
		});
	};

	return GridTableType;
});
