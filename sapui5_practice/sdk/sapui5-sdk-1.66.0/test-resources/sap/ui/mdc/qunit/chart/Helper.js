/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/SyncPromise"], function(SyncPromise) {
	"use strict";

	var Helper = function() {

	};
	/**
	 * Retrieves the metadata.
	 *
	 * @returns {object} containing property information about measures and dimensions
	 */
	Helper.retrieveAllMetadata = function() {
		var mMetadata = {
			chartType: "column",
			properties: [
				{
					name: "SalesNumber",
					propertyPath: "SalesNumber",
					type: "Edm.Int32",
					required: true,
					label: "Sales Number",
					kind: "Measure"
				}, {
					name: "agSalesAmount",
					propertyPath: "SalesAmount",
					type: "string",
					required: true,
					label: "Sales Amount",
					kind: "Measure",
					defaultAggregation: "sum",
					supportedAggregations: ["sum", "min", "max", "average"]
				}, {
					name: "Name",
					propertyPath: "Name",
					type: "string",
					required: true,
					label: "Name",
					kind: "Dimension"
				}, {
					name: "Industry",
					type: "string",
					required: true,
					label: "Industry",
					kind: "Dimension"
				}
			]
		};

		return SyncPromise.resolve(mMetadata);
	};
	/**
	 * Returns a control/fragment pointing to the current aggregation for a control
	 */
	Helper.retrieveAggregationItem = function(sAggregationName, mMetadata) {
		var mAggregation = {
			className: "",
			settings: {}
		};

		if (mMetadata.kind == "Dimension") {
			mAggregation.className = "sap.ui.mdc.chart.DimensionItem";
			mAggregation.settings = {
				key: mMetadata.name,
				label: mMetadata.label,
				textProperty: mMetadata.textProperty,
				type: mMetadata.type,
				displayText: true
			};
		} else {
			mAggregation.className = "sap.ui.mdc.chart.MeasureItem";
			mAggregation.settings = {
				key: mMetadata.name,
				propertyPath: mMetadata.propertyPath,
				label: mMetadata.label,
				type: mMetadata.type,
				aggregationMethod: mMetadata.defaultAggregation
			};
		}
		return mAggregation;
	};

	Helper.fetchProperties = function() {
		return Helper.retrieveAllMetadata( ).then(function(mMetadata) {
			return mMetadata.properties;
		});
	};

	/**
	 * may come for preprocessing note here we have currently no control...
	 *
	 * @param {object} oNode the XMLNode
	 * @param {ICallback} oVisitor the preprocessor callback
	 */
	Helper.preConfiguration = function(oNode, oVisitor) {
		return oNode;
	};

	return Helper;
});
