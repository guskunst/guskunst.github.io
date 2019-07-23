/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides base for all gizmo controls sap.ui.vk.tools namespace.
sap.ui.define([
	"./library", "sap/ui/core/Control"
], function(library, Control) {
	"use strict";

	/**
	 * Constructor for base of all Gizmo Controls.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides buttons to hide or show certain sap.ui.vk controls.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.66.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.tools.Gizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Gizmo = Control.extend("sap.ui.vk.tools.Gizmo", /** @lends sap.ui.vk.tools.Gizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk.tools"
		}
	});

	Gizmo.prototype.hasDomElement = function() {
		return true;
	};

	Gizmo.prototype._createAxisTitles = function(size, fontSize, drawCircle) {
		size = size || 32;
		fontSize = fontSize || 20;
		function createTextMesh(text, color) {
			var canvas = document.createElement("canvas");
			canvas.width = canvas.height = size * window.devicePixelRatio;
			var ctx = canvas.getContext("2d");

			var halfSize = canvas.width * 0.5;
			ctx.font = "Bold " + fontSize * window.devicePixelRatio + "px Arial";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			// draw shadow
			ctx.fillStyle = "#000";
			ctx.globalAlpha = 0.5;
			ctx.filter = "blur(3px)";
			ctx.fillText(text, halfSize + 1, halfSize + 1);
			// draw text
			ctx.fillStyle = "#fff";
			ctx.globalAlpha = 1;
			ctx.filter = "blur(0px)";
			ctx.fillText(text, halfSize, halfSize);

			if (drawCircle) {// draw circle border
				ctx.beginPath();
				ctx.arc(halfSize, halfSize, halfSize - window.devicePixelRatio, 0, 2 * Math.PI, false);
				ctx.closePath();
				ctx.lineWidth = window.devicePixelRatio * 2;
				ctx.strokeStyle = "#fff";
				ctx.stroke();
			}

			var texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;

			var material = new THREE.MeshBasicMaterial({
				map: texture,
				color: color,
				transparent: true,
				alphaTest: 0.05,
				premultipliedAlpha: true,
				side: THREE.DoubleSide
			});

			var mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
			mesh.userData.color = color;
			return mesh;
		}

		var group = new THREE.Group();
		group.add(createTextMesh("X", library.AxisColours.x));
		group.add(createTextMesh("Y", library.AxisColours.y));
		group.add(createTextMesh("Z", library.AxisColours.z));
		return group;
	};

	Gizmo.prototype._extractBasis = function(matrix) {
		var basis = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
		matrix.extractBasis(basis[ 0 ], basis[ 1 ], basis[ 2 ]);
		basis[ 0 ].normalize(); basis[ 1 ].normalize(); basis[ 2 ].normalize();
		return basis;
	};

	Gizmo.prototype._updateAxisTitles = function(obj, gizmo, camera, distance, scale) {
		var basis = this._extractBasis(gizmo.matrixWorld);

		obj.children.forEach(function(child, i) {
			child.position.copy(basis[ i ]).multiplyScalar(distance.constructor === THREE.Vector3 ? distance.getComponent(i) : distance);
			child.quaternion.copy(camera.quaternion);
		});

		obj.position.copy(gizmo.position);
		obj.scale.setScalar(scale);
	};

	Gizmo.prototype._updateSelection = function(viewStateManager) {
		var nodes = [];
		viewStateManager.enumerateSelection(function(nodeRef) {
			nodes.push({ node: nodeRef });
		});
		if (this._nodes.length === nodes.length && this._nodes.every(function(v, i) { return nodes[ i ].node === v.node; })) {
			return false;
		}

		this._nodes = nodes;

		nodes.forEach(function(nodeInfo) {
			nodeInfo.ignore = false; // multiple transformation fix (parent transformation + child transformation)
			var parent = nodeInfo.node.parent;
			while (parent && !nodeInfo.ignore) {
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (nodes[ i ].node === parent) {
						nodeInfo.ignore = true;
						break;
					}
				}
				parent = parent.parent;
			}
		});

		return true;
	};

	Gizmo.prototype._getAnchorPoint = function() {
		return null;
	};

	Gizmo.prototype._getSelectionCenter = function(target) {
		if (this._nodes.length === 1) {
			target.setFromMatrixPosition(this._nodes[ 0 ].node.matrixWorld);
		} else {
			target.setScalar(0);
			if (this._nodes.length > 0) {
				var center = new THREE.Vector3();
				this._nodes.forEach(function(nodeInfo) {
					var node = nodeInfo.node;
					if (node.userData.boundingBox) {
						node.userData.boundingBox.getCenter(center);
						target.add(center.applyMatrix4(node.matrixWorld));
					} else {
						target.add(center.setFromMatrixPosition(node.matrixWorld));
					}
				});
				target.multiplyScalar(1 / this._nodes.length);
			}
		}
	};

	Gizmo.prototype._getGizmoScale = function(position) {
		var renderer = this._viewport.getRenderer();
		var camera = this._viewport.getCamera().getCameraRef();
		var pos4 = new THREE.Vector4();
		pos4.copy(position).applyMatrix4(this._matViewProj);
		return pos4.w * renderer.getPixelRatio() / (renderer.getSize().width * camera.projectionMatrix.elements[ 0 ]);
	};

	Gizmo.prototype._updateGizmoObjectTransformation = function(obj, i) {
		var camera = this._viewport.getCamera().getCameraRef();
		var anchorPoint = this._getAnchorPoint();
		var node;
		if (anchorPoint && this._coordinateSystem === library.CoordinateSystem.Custom) {
			obj.position.copy(anchorPoint.position);
			obj.quaternion.copy(anchorPoint.quaternion);
		} else if (this._coordinateSystem === library.CoordinateSystem.Local) {
			node = this._nodes[ i ].node;
			node.matrixWorld.decompose(obj.position, obj.quaternion, obj.scale);
		} else if (this._nodes.length > 0) {
			this._getSelectionCenter(obj.position);

			if (this._coordinateSystem === library.CoordinateSystem.Screen) {
				obj.quaternion.copy(camera.quaternion);
			} else {// library.CoordinateSystem.World
				obj.quaternion.set(0, 0, 0, 1);
			}
		}

		var scale = this._getGizmoScale(obj.position);
		obj.scale.setScalar(this._gizmoSize * scale);

		if (node) {
			var basis = this._extractBasis(node.matrixWorld);
			obj.matrix.makeBasis(basis[ 0 ], basis[ 1 ], basis[ 2 ]);
			obj.matrix.scale(obj.scale);
			obj.matrix.copyPosition(node.matrixWorld);
			obj.matrixAutoUpdate = false;
		} else {
			obj.matrixAutoUpdate = true;
		}

		obj.updateMatrixWorld(true);
		return scale;
	};

	Gizmo.prototype._expandBoundingBox = function(boundingBox, camera) {
		var gizmoCount = this.getGizmoCount();
		if (gizmoCount > 0) {
			this._matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); // used in _updateGizmoTransformation()
			for (var i = 0; i < gizmoCount; i++) {
				this._updateGizmoTransformation(i, camera);
				this._sceneGizmo._expandBoundingBox(boundingBox, true);
			}
		}
	};

	return Gizmo;

}, /* bExport= */ true);
