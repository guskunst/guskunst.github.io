sap.ui.define([
	"sap/fe/core/TemplateAssembler"
], function(TemplateAssembler) {
	"use strict";

	function getMethods(oComponent, oComponentUtils) {
		return {
		};
	}

	return TemplateAssembler.getTemplateComponent(getMethods,
		"sap.fe.templates.Page.Component", {
			metadata: {
				properties: {
					"templateName": {
						"type": "string",
						"defaultValue": "sap.fe.templates.Page.view.Page"
					}
				},
				"manifest": "json"
			}
		});
});
