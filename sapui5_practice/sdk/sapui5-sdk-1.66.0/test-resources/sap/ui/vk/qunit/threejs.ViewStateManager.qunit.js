/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/vk/threejs/Scene",
	"sap/ui/vk/threejs/ViewStateManager",
	"sap/ui/vk/threejs/thirdparty/three"
], function(
	jQuery,
	Scene,
	ViewStateManager,
	three
) {
	"use strict";

	var getAllChildMeshNodes = function(parent, meshNodes) {
		if (parent && parent instanceof THREE.Mesh) {
			meshNodes.push(parent);
		}

		if (parent && parent.children && parent.children.length > 0) {
			var oi;
			for (oi = 0; oi < parent.children.length; oi += 1) {
				getAllChildMeshNodes(parent.children[ oi ], meshNodes);
			}
		}
	};

	var getAllChildNodes = function(parent, childNodes) {
		if (parent && !(parent.geometry && (parent.name === "" || parent.name === undefined))) {
			childNodes.push(parent);
		}

		if (parent && parent.children && parent.children.length > 0) {
			var oi;
			for (oi = 0; oi < parent.children.length; oi += 1) {
				getAllChildNodes(parent.children[ oi ], childNodes);
			}
		}
	};

	var getParentNodeWithMoreThanOneMeshes = function(object) {
		while (object && object.parent) {
			var meshNodes = [];
			getAllChildMeshNodes(object.parent, meshNodes);
			if (meshNodes.length > 2) {
				return object.parent;
			}
			object = object.parent;
		}
	};

	QUnit.test("Three JS ViewStateManager", function(assert) {
		var done = assert.async();
		var test = 0;

		var testVisibility = function(viewStateManager, originallySelectedNode) {
			viewStateManager.setVisibilityState(originallySelectedNode, true, false);
			assert.deepEqual(viewStateManager.getVisibilityState(originallySelectedNode), true, "Setting visibility true");

			viewStateManager.setVisibilityState(originallySelectedNode, false, false);
			assert.deepEqual(viewStateManager.getVisibilityState(originallySelectedNode), false, "Setting visibility false");

			var parent = getParentNodeWithMoreThanOneMeshes(originallySelectedNode);
			var children = [];
			getAllChildNodes(parent, children);

			viewStateManager.setVisibilityState(parent, true, true);
			viewStateManager.getVisibilityState(children).forEach(function(state) {
				assert.deepEqual(state, true, "Setting visibility true recursively");
			});

			viewStateManager.setVisibilityState(parent, false, true);
			viewStateManager.getVisibilityState(children).forEach(function(state) {
				assert.deepEqual(state, false, "Setting visibility false recursively");
			});

			// TODO - call getVisibilityChanges to test VEIDs of changed nodes
		};

		var getCurrentOpacity = function(nodeRef) {
			if (nodeRef.material) {
				return nodeRef.material.opacity;
			}
		};

		var testOpacity = function(viewStateManager, originallySelectedNode) {
			var originalOpacity = getCurrentOpacity(originallySelectedNode);
			var opacity = 0.5;

			viewStateManager.setOpacity(originallySelectedNode, opacity, false);
			var returnedOpacity = viewStateManager.getOpacity(originallySelectedNode);
			var currentOpacity = getCurrentOpacity(originallySelectedNode);
			assert.ok(Math.abs(opacity - returnedOpacity) < 0.0000001 && Math.abs(opacity - currentOpacity) < 0.0000001, "Setting opacity works ok");

			var parent = getParentNodeWithMoreThanOneMeshes(originallySelectedNode);
			var children = [];
			getAllChildNodes(parent, children);

			viewStateManager.setOpacity(parent, opacity, true);
			var opacityOK = true;
			var ni;
			for (ni = 0; ni < children.length; ni++) {
				returnedOpacity = viewStateManager.getOpacity(children[ ni ], true);
				currentOpacity = getCurrentOpacity(children[ ni ]);

				if (returnedOpacity && returnedOpacity !== opacity) {
					opacityOK = false;
				}

				if (currentOpacity && currentOpacity !== opacity) {
					opacityOK = false;
				}
			}
			assert.ok(opacityOK, "Setting opacity recursively works ok");

			viewStateManager.setOpacity(originallySelectedNode, null, false);
			returnedOpacity = viewStateManager.getOpacity(originallySelectedNode);
			currentOpacity = getCurrentOpacity(originallySelectedNode);
			assert.ok(returnedOpacity == null && Math.abs(originalOpacity - currentOpacity) < 0.0000001, "Removing opacity works ok");

			viewStateManager.setOpacity(parent, null, true);
			opacityOK = true;
			for (ni = 0; ni < children.length; ni++) {
				returnedOpacity = viewStateManager.getOpacity(children[ ni ], true);
				currentOpacity = getCurrentOpacity(children[ ni ]);

				if (returnedOpacity && returnedOpacity !== null) {
					opacityOK = false;
				}

				if (currentOpacity && currentOpacity !== originalOpacity) {
					opacityOK = false;
				}
			}
			assert.ok(opacityOK, "Removing opacity recursively works ok");
		};

		var getCurrentColor = function(nodeRef) {
			if (nodeRef && nodeRef.material) {
				var color = {
					red: Math.round(nodeRef.material.color.r * 255),
					green: Math.round(nodeRef.material.color.g * 255),
					blue: Math.round(nodeRef.material.color.b * 255),
					alpha: nodeRef.material.opacity
				};
				return sap.ui.vk.colorToABGR(color);
			}
		};

		var testTintColor = function(viewStateManager, originallySelectedNode) {
			var parent = getParentNodeWithMoreThanOneMeshes(originallySelectedNode);
			var children = [];
			getAllChildNodes(parent, children);
			var originalNodeColor = getCurrentColor(originallySelectedNode);

			var color = { red: 255, green: 150, blue: 0, alpha: 1 };
			var colorRGBA = sap.ui.vk.colorToABGR(color);

			viewStateManager.setTintColor(originallySelectedNode, colorRGBA, false);
			var returnedColor = viewStateManager.getTintColor(originallySelectedNode, true);
			var currentNodeColor = getCurrentColor(originallySelectedNode);
			assert.ok(colorRGBA == returnedColor && colorRGBA == currentNodeColor, "Setting tint color works ok");

			viewStateManager.setTintColor(parent, colorRGBA, true);
			var colorOK = true;
			var ni;
			for (ni = 0; ni < children.length; ni++) {
				var returnColor = viewStateManager.getTintColor(children[ ni ], true);
				currentNodeColor = getCurrentColor(children[ ni ]);

				if (returnColor && returnColor !== colorRGBA) {
					colorOK = false;
				}

				if (currentNodeColor && currentNodeColor !== colorRGBA) {
					colorOK = false;
				}
			}
			assert.ok(colorOK, "Setting tint color recursively works ok");

			viewStateManager.setTintColor(originallySelectedNode, null, false);
			returnedColor = viewStateManager.getTintColor(originallySelectedNode, true);
			currentNodeColor = getCurrentColor(originallySelectedNode);
			assert.ok(returnedColor == undefined && originalNodeColor == currentNodeColor, "Removing tint color works ok");

			viewStateManager.setTintColor(parent, null, true);
			colorOK = true;
			for (ni = 0; ni < children.length; ni++) {
				var returnTintColor = viewStateManager.getTintColor(children[ ni ], true);
				currentNodeColor = getCurrentColor(children[ ni ]);

				if (returnTintColor) {
					colorOK = false;
				}

				if (currentNodeColor && currentNodeColor === colorRGBA) {
					colorOK = false;
				}
			}
			assert.ok(colorOK, "Removing tint color recursively works ok");
		};

		var testSelection = function(viewStateManager, originallySelectedNode, testNodeName) {
			var parent = getParentNodeWithMoreThanOneMeshes(originallySelectedNode);
			var children = [];
			getAllChildNodes(parent, children);
			var originalNodeColor = getCurrentColor(originallySelectedNode);
			var highlightingColor = 0xFF123456;
			viewStateManager.setHighlightColor(highlightingColor);

			viewStateManager.setSelectionState(originallySelectedNode, true, false);
			var currentNodeColor = getCurrentColor(originallySelectedNode);
			var selected = viewStateManager.getSelectionState(originallySelectedNode);
			assert.ok(selected && highlightingColor == currentNodeColor, "Selecting signal node works ok");

			viewStateManager.setSelectionState(originallySelectedNode, false, false);
			currentNodeColor = getCurrentColor(originallySelectedNode);
			selected = viewStateManager.getSelectionState(originallySelectedNode);
			assert.ok(!selected && originalNodeColor == currentNodeColor, "Deselecting signal node works ok");

			viewStateManager.setSelectionState(parent, true, true);
			var colorOK = true;
			var ni;
			for (ni = 0; ni < children.length; ni++) {
				selected = viewStateManager.getSelectionState(children[ni]);
				currentNodeColor = getCurrentColor(children[ ni ]);

				if (!selected) {
					colorOK = false;
				}

				if (currentNodeColor && currentNodeColor !== highlightingColor) {
					colorOK = false;
				}
			}
			assert.ok(colorOK, "Selecting recursively works ok");

			viewStateManager.setSelectionState(parent, false, true);
			colorOK = true;
			for (ni = 0; ni < children.length; ni++) {
				selected = viewStateManager.getSelectionState(children[ni]);
				currentNodeColor = getCurrentColor(children[ ni ]);

				if (selected) {
					colorOK = false;
				}

				if (currentNodeColor && currentNodeColor !== originalNodeColor) {
					colorOK = false;
				}
			}
			assert.ok(colorOK, "Deselecting recursively works ok");

			var nodes = [ parent.parent, parent, parent.children[ 0 ], parent.children[ 1 ], parent.children[ 2 ] ];

			viewStateManager.setSelectionState(nodes[ 0 ], false, true);
			assert.deepEqual(viewStateManager.getSelectionState(nodes), [ false, false, false, false, false ], "All nodes are deselected.");

			viewStateManager.setSelectionState(nodes[ 0 ], true, false);
			assert.deepEqual(viewStateManager.getSelectionState(nodes), [ true, false, false, false, false ], "Only the root parent is selected.");

			viewStateManager.setRecursiveSelection(true);
			viewStateManager.setSelectionState(nodes[ 0 ], true, false);
			assert.deepEqual(viewStateManager.getSelectionState(nodes), [ true, true, true, true, true ], "All nodes are selected.");

			viewStateManager.setRecursiveSelection(false);
			viewStateManager.setSelectionState(nodes[ 3 ], false, false);
			assert.deepEqual(viewStateManager.getSelectionState(nodes), [ true, true, true, false, true ], "Only one child is deselected.");

			viewStateManager.setRecursiveSelection(true);
			viewStateManager.setSelectionState(nodes[ 3 ], false, false);
			assert.deepEqual(viewStateManager.getSelectionState(nodes), [ false, false, true, false, true ], "One child and ancestors are deselected.");

			viewStateManager.setSelectionState(nodes[ 3 ], true, false);
			assert.deepEqual(viewStateManager.getSelectionState(nodes), [ false, false, true, true, true ], "Children are selected, ancestors are deselected.");
		};

		var testLightingColor = function(viewStateManager) {

			var originalColor = { red: 255, green: 0, blue: 0, alpha: 1.0 };
			var setColor = { red: 10, green: 50, blue: 50, alpha: 0.5 };

			var originalColorRBGA = sap.ui.vk.colorToABGR(originalColor);
			var setColorRBGA = sap.ui.vk.colorToABGR(setColor);

			var originalColorCSS = sap.ui.vk.colorToCSSColor(originalColor);
			var setColorCSS = sap.ui.vk.colorToCSSColor(setColor);

			assert.equal(originalColorRBGA, viewStateManager.getHighlightColor(true), "original highligh color RBGA is ok");
			assert.equal(originalColorCSS, viewStateManager.getHighlightColor(), "original highligh color CSS is ok");

			viewStateManager.setHighlightColor(setColorRBGA);
			assert.equal(setColorRBGA, viewStateManager.getHighlightColor(true), "setting highlighting color RBGA is ok");

			viewStateManager.setHighlightColor(setColorCSS);
			assert.equal(setColorRBGA, viewStateManager.getHighlightColor(true), "setting highlighting color CSS is ok");
		};

		var testFunction = function(obj) {
			var nativeScene = new THREE.Scene();
			var scene = new Scene(nativeScene);
			nativeScene.add(obj);

			var viewStateManager = new ViewStateManager();
			viewStateManager._setScene(scene);

			// use the last mesh node as the selected node
			var meshNodes = [];
			getAllChildMeshNodes(nativeScene, meshNodes);
			var originallySelectedNode = meshNodes[ meshNodes.length - 1 ];

			// find the parent of the selected node
			var parent = getParentNodeWithMoreThanOneMeshes(originallySelectedNode);
			// find all the children of parent node
			var selectedNodesWithCallback = [];
			getAllChildMeshNodes(parent, selectedNodesWithCallback);

			testVisibility(viewStateManager, originallySelectedNode);
			testOpacity(viewStateManager, originallySelectedNode);
			testTintColor(viewStateManager, originallySelectedNode);
			testLightingColor(viewStateManager);
			testSelection(viewStateManager, originallySelectedNode);

			test++;
			if (test === 2) {
				done();
			}
		};

		var loader = new THREE.ObjectLoader();
		loader.load("test-resources/sap/ui/vk/qunit/media/stand_foot_rests.asm.json", testFunction);
		loader.load("test-resources/sap/ui/vk/qunit/media/chair.json", testFunction);
	});

	QUnit.done(function() {
		jQuery("#content").hide();
	});
});
