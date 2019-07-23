sap.ui.define([
	"sap/ui/core/UIComponent"

], function(UIComponent){
	"use strict";

	return UIComponent.extend("sap.ui.comp.sample.smarttable.smarttreetable.Component", {
		metadata: {
			rootView: {
			"viewName": "sap.ui.comp.sample.smarttable.smarttreetable.SmartTable",
			"type": "XML",
			"async": true
			},
			dependencies: {
				libs: [
					"sap.m", "sap.ui.comp"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"SmartTable.view.xml",
						"SmartTable.controller.js",
						"../mockserver/orgHierarchy.xml"
					]
				}
			}
		}
	});
});