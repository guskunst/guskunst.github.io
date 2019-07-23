/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils",
	"sap/suite/ui/generic/template/changeHandler/generic/MoveElements"
], function(
	jQuery,
	Utils,
	MoveElements
) {
	"use strict";

	/**
	 * Change handler for moving a header facet.
	 *
	 * @alias sap.suite.ui.generic.template.changeHandler.MoveHeaderFacet
	 * @author SAP SE
	 * @version 1.66.0
	 * @experimental
	 */
	var MoveHeaderFacet = {};
	var HEADERFACETS = "com.sap.vocabularies.UI.v1.HeaderFacets";

	MoveHeaderFacet.applyChange = function (oChange, oControl, mPropertyBag) {
	};

	MoveHeaderFacet.revertChange = function(oChange, oControl, mPropertyBag) {
		//write revert change logic
	};

	MoveHeaderFacet.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		oSpecificChangeInfo.custom = {};
		oSpecificChangeInfo.custom.annotation = HEADERFACETS;
		oSpecificChangeInfo.custom.fnGetAnnotationIndex = Utils.getHeaderFacetIndex;
		MoveElements.completeChangeContent(oChange, oSpecificChangeInfo, mPropertyBag);
	};

	return MoveHeaderFacet;
},
/* bExport= */true);
