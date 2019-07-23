sap.ui.define([
	"sap/ui/core/UIComponent"

], function(UIComponent){
	"use strict";

	return UIComponent.extend("sap.ui.comp.sample.smartfield.Overview.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.ui.comp.sample.smartfield.Overview.Main",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: ["sap.m", "sap.ui.comp"]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"Main.view.xml",
						"Main.controller.js",
						"mockserver/metadata.xml",
						"mockserver/Products.json",
						"mockserver/VL_SH_H_TCURC.json",
						"mockserver/VL_SH_H_CATEGORY.json"
					]
				}
			}
		}
	});
});