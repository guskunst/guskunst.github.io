sap.ui.define([ "sap/ui/core/UIComponent" ], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.comp.sample.smartmicrochart.SmartRadialMicroChart.exampleMaximize.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.ui.comp.sample.smartmicrochart.SmartRadialMicroChart.exampleMaximize.Page",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [ "sap.m", "sap.suite.ui.microchart" ]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"Page.view.xml",
						"Page.controller.js",
						"mockserver/Products.json",
						"mockserver/metadata.xml"
					]
				}
			}
		}
	});
});
