/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/core/Control"

], function (Control) {
	"use strict";

	var MessageFilter = Control.extend("sap.fe.MessageFilter", {
		metadata: {
			properties: {
				path: {
					type: "string"
				},
				operator: {
					type: "sap.ui.model.FilterOperator",
					defaultValue: "sap.ui.model.FilterOperator.Contains"
				},
				value1: {
					type: "string"
				},
				value2: {
					type: "string"
				}
			},
			events: {},
			publicMethods: []
		}
	});
	return MessageFilter;

}, /* bExport= */true);
