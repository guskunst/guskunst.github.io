/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/TableDelegate"
], function(TableDelegate) {
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
	 * @alias sap.ui.mdc.odata.v4.TableDelegate
	 */
	var ODataTableDelegate = Object.assign({}, TableDelegate);
	/**
	 * Fetches the relevant metadata for the table and returns property info array
	 *
	 * @param {Object} oTable - the instance of MDC table
	 * @returns {Array} array of property info
	 */
	ODataTableDelegate.fetchProperties = function(oTable) {
		var aProperties = [], oPropertyInfo, oObj, oEntityType, sEntitySetPath, oModel, oMetaModel, oPropertyAnnotations;
		sEntitySetPath = oTable._oBindingInfo.path; // TODO: figure out the entitySet via binding/API (metadataContext?)
		oModel = oTable.getModel(oTable._oBindingInfo.model);// TODO: figure out proper model name (metadataContext?)
		oMetaModel = oModel.getMetaModel();
		oEntityType = oMetaModel.getObject(sEntitySetPath + "/");

		// TODO: Filter restrictions
		var mEntityAnnotations = oMetaModel.getObject(sEntitySetPath + "@");
		var aSortRestrictions = mEntityAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
		var aNonSortableProperties = (aSortRestrictions["NonSortableProperties"] || []).map(function(oCollection) {
			return oCollection["$PropertyPath"];
		});

		for (var sKey in oEntityType) {
			oObj = oEntityType[sKey];
			if (oObj && oObj.$kind === "Property") {
				// TODO: Enhance with more properties as used in MetadataAnalyser
				oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");
				oPropertyInfo = {
					name: sKey,
					label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"],
					description: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path,
					maxLength: oObj.$MaxLength,
					precision: oObj.$Precision,
					scale: oObj.$Scale,
					type: oObj.$Type,
					sortable: aNonSortableProperties.indexOf(sKey) == -1,
					filterable: true
				};
				aProperties.push(oPropertyInfo);
			}
		}
		return aProperties;
	};

	return ODataTableDelegate;
}, /* bExport= */false);
