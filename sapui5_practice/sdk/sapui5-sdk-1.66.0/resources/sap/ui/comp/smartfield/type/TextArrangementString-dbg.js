/*
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/comp/smartfield/type/TextArrangement",
	"sap/ui/comp/smartfield/type/String"
], function(
	TextArrangementType,
	StringType
) {
	"use strict";

	var TextArrangementString = TextArrangementType.extend("sap.ui.comp.smartfield.type.TextArrangementString");

	TextArrangementString.prototype.onBeforeValidateValue = function(vValue, mSettings) {
		this.oSettings.onBeforeValidateValue(vValue, mSettings);
	};

	TextArrangementString.prototype.getName = function() {
		return "sap.ui.comp.smartfield.type.TextArrangementString";
	};

	TextArrangementString.prototype.getPrimaryType = function() {
		return StringType;
	};

	return TextArrangementString;
});
