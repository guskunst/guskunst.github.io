sap.ui.define(['sap/ui/core/UIComponent'], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.suite.ui.commons.sample.StatusIndicatorChoreography.Component", {

		metadata: {
			rootView: "sap.suite.ui.commons.sample.StatusIndicatorChoreography.App",
			dependencies: {
				libs: [
					"sap.m",
					"sap.suite.ui.commons"
				]
			},
			config: {
				stretch: true,
				sample: {
					files: [
						"App.view.xml",
						"App.controller.js"
					]
				}
			}
		}
	});

}, true);
