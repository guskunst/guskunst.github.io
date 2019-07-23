sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/vk/ContentConnector",
	"sap/ui/vk/tools/RectSelectTool",
	"sap/ui/vk/threejs/thirdparty/three"
], function(Controller, ContentConnector, RectSelectTool, threejs) {
	"use strict";

	return Controller.extend("rectangularSelectionTool.controller.App", {

		onInit: function() {

			var jsonObjectLoader = function(parentNode, contentResource) {
				return new Promise(function(resolve, reject) {
					var loader = new THREE.ObjectLoader();
					loader.load(
						contentResource.getSource(), // resource URL
						// pass the loaded data to the onLoad function.
						// Here it is assumed to be an object
						function(obj) { // add the loaded object to the scene
							parentNode.add(obj);
							resolve({
								node: parentNode,
								contentResource: contentResource
							});
						},

						// Function called when download progresses
						function(xhr) {},

						// Function called when download errors
						function(xhr) {
							reject(new Error("Not object json"));
						});
				});
			};

			ContentConnector.addContentManagerResolver({
				pattern: "THREE.JSON",
				dimension: 3,
				contentManagerClassName: "sap.ui.vk.threejs.ContentManager",
				settings: {
					loader: jsonObjectLoader
				}
			});

			var viewer = this.getView().byId("viewer");
			viewer.attachSceneLoadingSucceeded(function() {
				var viewport = viewer.getViewport();

				this.rectSelectTool = new RectSelectTool();
				this.rectSelectTool.setActive(true, viewport);

				viewport.zoomTo([ sap.ui.vk.ZoomTo.Visible, sap.ui.vk.ZoomTo.ViewFront ], null, 0);
			}, this);
		},

		onRectangularSelectionSelect: function(event) {
			var viewport = this.getView().byId("viewer").getViewport();
			this.rectSelectTool.setActive(event.getSource().getSelected(), viewport);
		},

		onSelectAdditive: function(event) {
			this.rectSelectTool.setSubtractMode(false);
		},

		onSelectSubtractive: function(event) {
			this.rectSelectTool.setSubtractMode(true);
		}
	});
});