/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils"
], function(
	jQuery,
	Utils
) {
	"use strict";

	/**
	 * Change handler for adding a filter item.
	 *
	 * @alias sap.suite.ui.generic.template.changeHandler.AddFilterItem
	 * @author SAP SE
	 * @version 1.66.0
	 * @experimental
	 */
	var AddFilterItem = {};

	AddFilterItem.applyChange = function (oChange, oControl, mPropertyBag) {
		//write apply change logic
	};

	AddFilterItem.revertChange = function(oChange, oControl, mPropertyBag) {
		//write revert change logic
	};

	AddFilterItem.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		//write complete change logic
	};

	return AddFilterItem;
},
/* bExport= */true);
