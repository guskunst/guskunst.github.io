sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = sap.ui.core.UIComponent.extend("sap.ui.richtexteditor.sample.RichTextEditor.Component", {

		metadata: {
			rootView: "sap.ui.richtexteditor.sample.RichTextEditor.RichTextEditor",
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.richtexteditor"
				]
			},
			config: {
				sample: {
					files: [
						"RichTextEditor.view.xml",
						"RichTextEditor.controller.js"
					]
				}
			}
		}
	});

	return Component;
});