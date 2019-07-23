/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"./Column", "sap/m/Text"
], function(Column, Text) {
	"use strict";
	/**
	 * Helper class for sap.ui.mdc.Table.
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.TableDelegate
	 */
	var TableDelegate = {
		/**
		 * Fetches the relevant metadata for the table and returns property info array
		 *
		 * @param {Object} oTable - the instance of MDC table
		 * @returns {Array} array of property info
		 */
		fetchProperties: function(oTable) {
			return [];
		},

		_getVisibleProperties: function(oTable) {
			var aProperties = [], sLeadingProperty;
			if (oTable) {
				oTable.getColumns().forEach(function(oMDCColumn) {
					sLeadingProperty = oMDCColumn && oMDCColumn.getDataProperties()[0]; // get the leading (1st property always)
					if (sLeadingProperty) {
						aProperties.push({
							name: sLeadingProperty,
							id: oMDCColumn.getId(),
							label: oMDCColumn.getHeader()
						});
					}
				});
			}
			return aProperties;
		},

		_getSortedProperties: function(oTable) {
			var aSortedProperties = [], oP13nTableSortData, oValue;
			oP13nTableSortData = oTable.data("$p13nSort");
			if (typeof oP13nTableSortData === "string") {
				oP13nTableSortData = oP13nTableSortData.replace(/\\{/g, "{"); // Escape to NOT interpret custom data as binding
				oValue = JSON.parse(oP13nTableSortData);
			}
			if (oValue) {
				aSortedProperties = oValue;
			}
			return aSortedProperties;
		},

		/**
		 * Fetches the relevant metadata for the table and returns property info array
		 *
		 * @param {Object} oTable - the instance of MDC table
		 * @returns {Object} the current state
		 */
		getCurrentState: function(oTable) {
			return {
				visibleFields: this._getVisibleProperties(oTable),
				sorters: this._getSortedProperties(oTable)
			};
		},

		/**
		 * Creates the Column for the specified property info and table
		 *
		 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
		 * @param {Object} oTable - the instance of MDC table
		 * @returns {Promise} Promise that resolves with the instance of mdc.Column
		 */
		createColumn: function(oPropertyInfo, oTable) {
			return this.createColumnTemplateInfo(oPropertyInfo).then(function() {
				var oColumnInfo = this.getColumnInfo(oPropertyInfo);
				// create column template
				oColumnInfo.template = this.createColumnTemplateInfo(oPropertyInfo);
				return new Column(oColumnInfo);
			}.bind(this));
		},

		/**
		 * Creates the Column for the specified property info and table
		 *
		 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
		 * @returns {Object} column info to be used in creation of the column/cell
		 */
		getColumnInfo: function(oPropertyInfo) {
			return {
				header: oPropertyInfo.label || oPropertyInfo.name,
				dataProperties: [
					oPropertyInfo.name
				],
				hAlign: oPropertyInfo.align,
				width: oPropertyInfo.width
			};
		},

		/**
		 * Creates and returns the template info of the column for the specified property info
		 *
		 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
		 * @returns {Object} template info to be used in creationg of the column/cell
		 */
		getColumnTemplateInfo: function(oPropertyInfo) {
			return {
				text: {
					path: oPropertyInfo.name
				},
				textAlign: oPropertyInfo.align
			};
		},
		/**
		 * Creates and returns the template of the column for the specified info
		 *
		 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
		 * @returns {Promise} Promise that resolves with the template to be used in the column/cell
		 */
		createColumnTemplate: function(oPropertyInfo) {
			// TODO: use path instead of name? (path falls back to name for OData properties, but can contain a more complex path).
			// This may also needed to address duplicate property scenarios.
			return Promise.resolve(new Text(this.getColumnTemplateInfo(oPropertyInfo)));
		}
	};
	return TableDelegate;
}, /* bExport= */false);
