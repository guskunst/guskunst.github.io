/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Callout class.
sap.ui.define([
	"jquery.sap.global", "../library", "./thirdparty/three", "sap/ui/base/ManagedObject",
	"./PolylineGeometry", "./PolylineMaterial", "./PolylineMesh"
], function(jQuery, library, threeJs, BaseObject, PolylineGeometry, PolylineMaterial, PolylineMesh) {
	"use strict";

	/**
	 * Constructor for a new Thrustline.
	 *
	 * @class
	 *
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.66.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.threejs.Thrustline
	 * @experimental Since 1.65.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Thrustline = BaseObject.extend("sap.ui.vk.threejs.Thrustline", /** @lends sap.ui.vk.threejs.Thrustline.prototype */ {
		metadata: {
			properties: {
				renderOrder: {
					type: "int",
					defaultValue: 0
				},
				depthTest: {
					type: "boolean",
					defaultValue: true
				},
				node: {
					type: "object"
				},
				principleAxis: {
					type: "float[]"
				},
				material: {
					type: "object"
				},
				items: {
					type: "object[]"
				},
				segments: {
					type: "object[]"
				}
			}
		},

		constructor: function(sId, mSettings, oScope) {
			BaseObject.apply(this, arguments);
		}
	});

	Thrustline.prototype.setRenderOrder = function(value) {
		this.setProperty("renderOrder", value, true);
		this._segments = [];
		return this;
	};

	Thrustline.prototype.setDepthTest = function(value) {
		this.setProperty("depthTest", value, true);
		return this;
	};

	Thrustline.prototype._update = function(renderer, camera) {
		var node = this.getNode();
		if (!node || !node.visible) {
			return;
		}

		var viewportSize = new THREE.Vector2(),
		matViewProj = new THREE.Matrix4(),
		matWorldViewProj = new THREE.Matrix4();

		var rendererSize = renderer.getSize();
		viewportSize.set(rendererSize.width * 0.001, rendererSize.height * 0.001);
		matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		matWorldViewProj.multiplyMatrices(matViewProj, node.matrixWorld);

		var axis = this.getPrincipleAxis();
		var principleAxis = new THREE.Vector3(axis[0], axis[1], axis[2]);
		var items = this.getItems();
		var segments = this.getSegments();
		for (var si = 0; si < segments.length; si++) {
			var segment = segments[si];

			if (segment.polylineMesh) {
				node.remove(segment.polylineMesh);
				segment.polylineMesh = null;
			}

			if (segment.haloMesh) {
				node.remove(segment.haloMesh);
				segment.haloMesh = null;
			}

			var point;
			var startItem = items[segment.startItemIndex];
			var startNode = startItem.target;
			point = startItem.boundPoints[segment.startBoundIndex];
			var startPoint = new THREE.Vector3(point.x, point.y, point.z);
			startPoint.applyMatrix4(startNode.matrixWorld);

			var endItem = items[segment.endItemIndex];
			var endNode = endItem.target;
			point = endItem.boundPoints[segment.endBoundIndex];
			var endPoint = new THREE.Vector3(point.x, point.y, point.z);
			endPoint.applyMatrix4(endNode.matrixWorld);

			var dir = endPoint.clone();
			dir.sub(startPoint);
			if (dir.dot(principleAxis) < 0) {
				principleAxis.x = -principleAxis.x;
				principleAxis.y = -principleAxis.y;
				principleAxis.z = -principleAxis.z;
			}

			var v1 = startPoint.clone();
			v1.sub(endPoint);

			var v2 = principleAxis.clone();

			var dotV2 = v2.dot(v2);
			var u = v2.dot(v1) / dotV2;

			var startProj = v2.clone();
			startProj.multiplyScalar(u);
			startProj.add(endPoint);

			var dirY = startProj.clone();
			dirY.sub(startPoint);
			var lengthY = dirY.length();
			dirY.normalize();


			var dirX = endPoint.clone();
			dirX.sub(startProj);
			var lengthX = dirX.length();

			var vertices = [];
			for (var pi = 0; pi < segment.ratios.length; pi++) {

				var ratio = segment.ratios[pi];
				var vertex = startPoint.clone();

				var vx = principleAxis.clone();
				vx.multiplyScalar(ratio.x * lengthX);
				vertex.add(vx);

				var vy = dirY.clone();
				vy.multiplyScalar(ratio.y * lengthY);
				vertex.add(vy);
				vertices.push(vertex);
			}

			var material = this.getMaterial();
			var lineStyle = {};
			if (material && material.userData && material.userData.lineStyle) {
				lineStyle = material.userData.lineStyle;
			}
			lineStyle.width = lineStyle.width || 1;
			lineStyle.haloWidth = lineStyle.haloWidth || 0;
			lineStyle.endCapStyle = lineStyle.endCapStyle || 0;

			var startPointStyle = sap.ui.vk.LeaderLineMarkStyle.None;
			var endPointStyle = sap.ui.vk.LeaderLineMarkStyle.None;

			var segmentCapStyle = lineStyle.endCapStyle || vertices.length > 2 ? 1 : 0;
			var trimStyle = (segmentCapStyle && (startPointStyle !== sap.ui.vk.LeaderLineMarkStyle.None || lineStyle.endCapStyle === 0) ? 1 : 0) |
							(segmentCapStyle && (endPointStyle !== sap.ui.vk.LeaderLineMarkStyle.None || lineStyle.endCapStyle === 0) ? 2 : 0);

			var polylineGeometry = new PolylineGeometry();
			polylineGeometry.setVertices(vertices);
			/*
			var haloMesh;
			if (lineStyle.haloWidth > 0) {
				var haloMaterial = new PolylineMaterial({
				color: 0xFFFFFF,
				lineColor: 0xFFFFFF,
				linewidth: lineStyle.width * (lineStyle.haloWidth + 1),
				dashCapStyle: lineStyle.endCapStyle,
				segmentCapStyle: segmentCapStyle,
				trimStyle: trimStyle,
				transparent: true,
				depthTest: this.getDepthTest()
				});

				haloMesh = new PolylineMesh(polylineGeometry, haloMaterial);
				haloMesh.matrixAutoUpdate = false;
				haloMesh.renderOrder = this.getRenderOrder();
				haloMesh.isHaloMesh = true;

				segment.haloMesh = haloMesh;
				node.add(haloMesh);
			}
			*/
			var polylineMaterial = new PolylineMaterial({
				color: 0xFFFFFF,
				lineColor: material.color,
				linewidth: lineStyle.width * 0.6,
				dashCapStyle: lineStyle.endCapStyle,
				segmentCapStyle: segmentCapStyle,
				trimStyle: trimStyle,
				dashPattern: lineStyle.dashPattern || [],
				dashScale: lineStyle.dashPatternScale || 1,
				transparent: true,
				depthTest: this.getDepthTest()
			});

			var polylineMesh = new PolylineMesh(polylineGeometry, polylineMaterial);
			if (camera.type === "PerspectiveCamera") {
				polylineMesh.computeLineDistances(matWorldViewProj, viewportSize, camera.near);
			} else {
				polylineMesh.computeLineDistances(matWorldViewProj, viewportSize);
			}

			// polylineMesh.userData.haloMesh = haloMesh;
			polylineMesh.matrixAutoUpdate = false;
			polylineMesh.renderOrder = this.getRenderOrder();

			segment.polylineMesh = polylineMesh;

			node.add(polylineMesh);
		}
	};

	return Thrustline;
});
