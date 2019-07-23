sap.ui.define([ "sap/ui/core/UIComponent" ], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.suite.ui.commons.sample.ProcessFlowImageContent.Component", {
		metadata: {
			rootView: "sap.suite.ui.commons.sample.ProcessFlowImageContent.ProcessFlow",
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.core",
					"sap.suite.ui.commons"
				]
			},
			config: {
				sample: {
					files: [
						"ProcessFlow.view.xml",
						"ProcessFlow.controller.js",
						"ProcessFlowNodes.json",
						"QuickView.fragment.xml"
					]
				}
			}
		}
	});
});
