/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/mdc/XMLComposite'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.LabelButtonTemplate", {
		metadata: {
			properties: {
				label: {
					type: "string"
				},
				value: {
					type: "string"
				},
				labelFirst: {
					type: "boolean",
					defaultValue: true,
					invalidate: "template"
				}
			}
		}
	});
}, /* bExport= */true);
