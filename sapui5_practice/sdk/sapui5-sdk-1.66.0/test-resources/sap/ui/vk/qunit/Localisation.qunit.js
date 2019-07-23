/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/vk/ContentResource",
	"sap/ui/vk/Viewer"
], function(
	jQuery,
	ContentResource,
	Viewer
) {
	"use strict";

	QUnit.test("Localisation", function(assert) {
		var done = assert.async();

		var contentResource = new ContentResource({
			source: "test-resources/sap/ui/vk/qunit/media/localised.vds",
			sourceType: "vds",
			sourceId: "abc"
		});

		var viewer = new Viewer({
			contentResources: [ contentResource ],
			showSceneTree: false,
			enableSceneTree: false,
			runtimeSettings: { totalMemory: 16777216 }
		});
		viewer.placeAt("content");

		var step = 0,
			dvl;

		viewer.attachContentResourceChangesProcessed(function(event) {
			dvl = dvl || viewer.getGraphicsCore().getApi(sap.ui.vk.dvl.GraphicsCoreApi.LegacyDvl);

			var procedures;

			switch (++step) {
				case 1:
					// The first time the model is loaded with a default locale. Skip it.
					// Unload the test model.
					viewer.removeAllContentResources();
					break;

				case 2:
					// Load the test model with the en-US locale.
					dvl.Core.SetLocale("en-US");
					viewer.addContentResource(contentResource);
					break;

				case 3:
					// The model is loaded with the en-US locale.
					procedures = dvl.Scene.RetrieveProcedures(viewer.getScene().getSceneRef());
					assert.equal(procedures.procedures[0].name, "Procedure 1", "Procedure names are equal. Locale: en-US.");
					assert.equal(procedures.procedures[0].steps[0].name, "ABC", "Step names are equal. Locale: en-US.");

					// Unload the test model.
					viewer.removeAllContentResources();
					break;

				case 4:
					// Load the test mode with the ru-RU locale.
					dvl.Core.SetLocale("ru-RU");
					viewer.addContentResource(contentResource);
					break;

				case 5:
					// The model is loaded with the ru-RU locale.
					procedures = dvl.Scene.RetrieveProcedures(viewer.getScene().getSceneRef());
					assert.equal(procedures.procedures[0].name, "Процедура 1", "Procedure names are equal. Locale: ru-RU.");
					assert.equal(procedures.procedures[0].steps[0].name, "АБВ", "Step names are equal. Locale: ru-RU.");

					// Unload the model.
					viewer.removeAllContentResources();

					// Finish with unit tests.
					done();
					break;

				default:
				break;
			}
		});
	});

	QUnit.done(function() {
		jQuery("#content").hide();
	});
});
