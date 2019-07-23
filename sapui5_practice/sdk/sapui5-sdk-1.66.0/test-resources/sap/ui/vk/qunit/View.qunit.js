/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/vk/Viewport",
	"sap/ui/vk/ViewStateManager",
	"sap/ui/vk/View",
	"test-resources/sap/ui/vk/qunit/utils/ModuleWithContentConnector"
], function(
	jQuery,
	Viewport,
	ViewStateManager,
	View,
	loader
) {
	"use strict";

	var viewStateManager = new ViewStateManager();
	var viewport = new Viewport(
	{
		viewStateManager: viewStateManager
	});
	viewport.placeAt("content");

	QUnit.moduleWithContentConnector("View", "test-resources/sap/ui/vk/qunit/media/nodes_boxes.json", "threejs.test.json", function(assert) {
		viewport.setContentConnector(this.contentConnector);
		viewStateManager.setContentConnector(this.contentConnector);
	});

	var myView = new View("myView", {});
	var myView2 = new View("myView2", {});

	myView.setCameraInfo({
		type: "OrthographicCamera",
		zoomFactor: 33.22,
		position: [ 0, 0, 123 ],
		nearClipPlane: 4,
		farClipPlane: 3,
		upDirection: [ 123, 456, 789 ],
		targetDirection: [ 0.1, 0.2, -1.3 ]
	});

	myView.setName("orthoTest");

	QUnit.test("Orthographic Camera Values", function(assert) {
		var result = viewport.activateView(myView);
		var camInfo = result.getCamera();
		// check camerType set for threejs Viewport camera
		assert.equal(camInfo.getCameraRef().type, "OrthographicCamera", "Camera Type Orthographic");
		// check zoomFactor set for threejs Viewport camera
		assert.equal(camInfo.getZoomFactor(), 33.22, "zoomFactor set");
		// check position set for threejs Viewport camera
		assert.deepEqual(camInfo.getPosition(), myView.getCameraInfo().position, "Position");
		// check nearClipPlane set for threejs Viewport camera
		assert.equal(camInfo.getNearClipPlane(), 4, "nearClipPlane set");
		// check farClipPlane set for threejs Viewport camera
		assert.equal(camInfo.getFarClipPlane(), 3, "farClipPlane set");
		// check upDirection set for threejs Viewport camera
		assert.deepEqual(camInfo.getUpDirection(), myView.getCameraInfo().upDirection, "upDirection set");
	});

	myView2.setCameraInfo({
		type: "PerspectiveCamera",
		fov: 11.22,
		position: [ 222, 222, 222 ],
		nearClipPlane: 6,
		farClipPlane: 8,
		upDirection: [ 333, 222, 111 ],
		targetDirection: [ 10, 11, 12 ]
	});

	myView2.setName("perspTest");

	QUnit.test("Perspective Camera Values", function(assert) {
		var result2 = viewport.activateView(myView2);
		var camInfo = result2.getCamera();
		// check camerType set for threejs Viewport camera
		assert.equal(camInfo.getCameraRef().type, "PerspectiveCamera", "Camera Type Perspective");
		// check zoomFactor set for threejs Viewport camera
		assert.equal(camInfo.getFov(), 11.22, "zoomFactor set");
		// check position set for threejs Viewport camera
		assert.deepEqual(camInfo.getPosition(), myView2.getCameraInfo().position, "Position");
		// check nearClipPlane set for threejs Viewport camera
		assert.equal(camInfo.getNearClipPlane(), 6, "nearClipPlane set");
		// check farClipPlane set for threejs Viewport camera
		assert.equal(camInfo.getFarClipPlane(), 8, "farClipPlane set");
		// check upDirection set for threejs Viewport camera
		assert.deepEqual(camInfo.getUpDirection(), myView2.getCameraInfo().upDirection, "upDirection set");
	});

	QUnit.test("Play views", function(assert) {
		var done = assert.async();
		var viewNum = 0;
		var view = new View({ name: "TestView" });
		viewport.attachViewFinished(function(evt) {
			switch (viewNum) {
				case 0:
					assert.ok(true, "View without camera finished");
					view.setCameraInfo({
						type: "PerspectiveCamera",
						fov: 30,
						position: [ 0, 0, 100 ],
						nearClipPlane: 1,
						farClipPlane: 10,
						upDirection: [ 0, 1, 0 ],
						targetDirection: [ 10, 11, 12 ]
					});
					viewport.activateView(view);
				break;
				case 1:
					assert.ok(true, "View with camera finished");
					view.setPlaybacks([
						{
							sequenceId: "1",
							playbackPreDelay: 0,
							playbackPostDelay: 0
						}
					]);
					var nativeScene = viewport._viewStateManager.getNodeHierarchy().getScene().getSceneRef();
					nativeScene.userData = {
						sequences: new Map()
					};
					var track = new THREE.BooleanKeyframeTrack(".visible", [ 0, 1 ], [ true, false ]);
					nativeScene.userData.sequences.set("1", new THREE.AnimationClip(null, 100, [ track ]));
					viewport.activateView(view);
				break;
				case 2:
					assert.ok(true, "View with camera and animation finished");
					done();
				break;
				default:
				break;
			}
			viewNum++;
		});

		viewport.activateView(view);
	});

	QUnit.done(function() {
		jQuery("#content").hide();
	});
});
