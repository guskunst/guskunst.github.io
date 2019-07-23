/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils",
	"sap/suite/ui/generic/template/changeHandler/util/AnnotationChangeUtilsV2",
	"sap/m/changeHandler/MoveTableColumns",
	"sap/suite/ui/generic/template/changeHandler/generic/MoveElements"
], function(
	jQuery,
	Utils,
	AnnotationChangeUtils,
	MoveColumns,
	MoveElements
) {
	"use strict";

	/**
	 * Change handler for moving a table column.
	 *
	 * @alias sap.suite.ui.generic.template.changeHandler.MoveTableColumns
	 * @author SAP SE
	 * @version 1.66.0
	 * @experimental
	 */
	var MoveTableColumns = {};

	var LINEITEM = "com.sap.vocabularies.UI.v1.LineItem";

	MoveTableColumns.applyChange = function (oChange, oControl, mPropertyBag) {
		if (!jQuery.isEmptyObject(oChange.getContent())) {
			MoveColumns.applyChange(oChange, oControl, mPropertyBag);
		}
	};

	MoveTableColumns.revertChange = function(oChange, oControl, mPropertyBag) {
		//write revert change logic
	};

	MoveTableColumns.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		oSpecificChangeInfo.custom = {};
		oSpecificChangeInfo.custom.annotation = LINEITEM;
		oSpecificChangeInfo.custom.fnGetAnnotationIndex = Utils.getLineItemRecordIndex;
		oSpecificChangeInfo.custom.MoveConcreteElement = MoveColumns;
		MoveElements.completeChangeContent(oChange, oSpecificChangeInfo, mPropertyBag);
	};

	return MoveTableColumns;
},
/* bExport= */true);
