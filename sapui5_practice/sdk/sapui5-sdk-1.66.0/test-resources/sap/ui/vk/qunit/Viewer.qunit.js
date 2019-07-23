/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/vk/Viewer",
	"sap/ui/vk/ContentResource"
], function(
	jQuery,
	Viewer,
	ContentResource
) {
	"use strict";

	var testSceneTreeAndStepNavigationStates = function(viewer, enableSceneTree, showSceneTree, enableStepNavigation, showStepNavigation, title) {
		QUnit.test("Test states for: enableSceneTree, showSceneTree, enableStepNavigation, showStepNavigation. ===> " + title, function(assert) {
			assert.strictEqual(viewer.getEnableSceneTree(), enableSceneTree, "enableSceneTree matches the expected state.");
			assert.strictEqual(viewer.getShowSceneTree(), showSceneTree, "showSceneTree matches the expected state.");
			assert.strictEqual(viewer.getEnableStepNavigation(), enableStepNavigation, "enableStepNavigation matches the expected state.");
			assert.strictEqual(viewer.getShowStepNavigation(), showStepNavigation, "showStepNavigation matches the expected state.");
		});
	};

	var testGetGraphicsCore = function(graphicsCore) {
		QUnit.test("getGraphicsCore", function(assert) {
			assert.ok(graphicsCore instanceof sap.ui.vk.dvl.GraphicsCore, "The Graphics Core object has been created.");
			assert.ok(graphicsCore._canvas instanceof HTMLCanvasElement, "The Graphics Core object has content in the _canvas property.");
			assert.ok(graphicsCore._dvl, "The Graphics Core object has content in the _dvl property.");
			assert.ok(graphicsCore._dvlClientId, "The Graphics Core object has content in the _dvlClientId property.");
			assert.ok(graphicsCore._webGLContext instanceof WebGLRenderingContext, "The Graphics Core object has content in the _webGLContext property.");
		});
	};

	var testGetNativeViewport = function(nativeViewport) {
		QUnit.test("getNativeViewport", function(assert) {
			assert.ok(nativeViewport instanceof sap.ui.vk.NativeViewport, "getNativeViewport returns an instance of sap.ui.vk.NativeViewport");
		});
	};

	var testGetViewport = function(viewport) {
		QUnit.test("getViewport", function(assert) {
			assert.ok(viewport.getImplementation() instanceof sap.ui.vk.dvl.Viewport || viewport.getImplementation() instanceof sap.ui.vk.threejs.Viewport
			, "getViewport returns an instance of sap.ui.vk.dvl.Viewport or sap.ui.vk.threejs.Viewport");
		});
	};

	var testGetScene = function(scene) {
		QUnit.test("getScene", function(assert) {
			assert.ok(scene instanceof sap.ui.vk.Scene, "getScene returns an instance of sap.ui.vk.dvl.Scene");
		});
	};

	var testGetViewStateManager = function(viewStateManager) {
		QUnit.test("getViewStateManager", function(assert) {
			assert.ok(viewStateManager instanceof sap.ui.vk.ViewStateManager, "getViewStateManager returns an instance of sap.ui.vk.ViewStateManager.");
		});
	};

	QUnit.test("MAIN TEST", function(assert) {
		assert.ok(true, "Main test started.");
		var done1 = assert.async();
		var done2 = assert.async();

		assert.notOk(sap.ve && sap.ve.dvl, "dvl.js is not loaded until the first Viewport instance is created");

		var contentResource = new ContentResource({
			source: "test-resources/sap/ui/vk/qunit/media/nodes_boxes_with_steps.vds",
			sourceType: "vds",
			sourceId: "abc"
		});

		var viewer1 = new Viewer({
			runtimeSettings: { totalMemory: 16777216 }
		}).placeAt("content");

		viewer1.addContentResource(contentResource);
		viewer1.attachSceneLoadingFailed(function(event) {
			assert.ok(false, "Viewer1 could not load the VDS file.");
			done1();
		});

		viewer1.attachSceneLoadingSucceeded(function(event) {
			assert.ok(true, "Viewer1 loaded the VDS file successfully.");

			testSceneTreeAndStepNavigationStates(viewer1, true, true, true, false, "Default states");

			testGetGraphicsCore(viewer1.getGraphicsCore());

			testGetViewport(viewer1.getViewport());

			testGetScene(viewer1.getScene());

			testGetViewStateManager(viewer1.getViewStateManager());

			done1();
		});

		var viewer2 = new Viewer().placeAt("content");
		viewer2.addContentResource(new ContentResource({
			source: "test-resources/sap/ui/vk/qunit/media/cat.jpg",
			sourceType: "jpg",
			sourceId: "abc"
		}));
		viewer2.attachSceneLoadingFailed(function(event) {
			assert.ok(false, "Viewer2 could not load the JPG file.");
			done2();
		});
		viewer2.attachSceneLoadingSucceeded(function(event) {
			assert.ok(true, "Viewer1 loaded the JPG file successfully.");
			testGetNativeViewport(viewer2.getNativeViewport());
			done2();
		});
	});

	QUnit.done(function() {
		jQuery("#content").hide();
	});
});
