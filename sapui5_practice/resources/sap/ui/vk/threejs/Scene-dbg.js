/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Scene class.
sap.ui.define([
	"jquery.sap.global", "../Scene", "./NodeHierarchy"
], function(jQuery, SceneBase, NodeHierarchy) {
	"use strict";

	/**
	 * Constructor for a new Scene.
	 *
	 * @class Provides the interface for the 3D model.
	 *
	 * The objects of this class should not be created directly.
	 *
	 * @param {THREE.Scene} scene The three.js scene object.
	 * @public
	 * @author SAP SE
	 * @version 1.66.0
	 * @extends sap.ui.vk.Scene
	 * @alias sap.ui.vk.threejs.Scene
	 */
	var Scene = SceneBase.extend("sap.ui.vk.threejs.Scene", /** @lends sap.ui.vk.threejs.Scene.prototype */ {
		metadata: {},

		constructor: function(scene) {
			SceneBase.call(this);

			this._id = jQuery.sap.uid();
			this._scene = scene;
			this._state = null;
			this._defaultNodeHierarchy = null;
			this._currentViewStateManager = null;
		}
	});

	Scene.prototype.init = function() {

		var outlineVertexShader = [
			"attribute vec3 normal1;",
			"attribute vec3 normal2;",
			"#include <clipping_planes_pars_vertex>",
			"uniform vec4 color;",
			"varying vec4 vColor;",
			"void main() {",
			"	#include <begin_vertex>",
			"	#include <project_vertex>",
			"	#include <clipping_planes_vertex>",
			"	vec3 eyeDirection = mvPosition.xyz;",
			"	vec3 n1 = normalMatrix * normal1;",
			"	vec3 n2 = normalMatrix * normal2;",
			"	vColor = color;",
			"	vColor.a *= step(dot(eyeDirection, n1) * dot(eyeDirection, n2), 0.0);",
			"}"
		].join("\n");

		var outlineFragmentShader = [
			"#include <clipping_planes_pars_fragment>",
			"varying vec4 vColor;",
			"void main() {",
			"	#include <clipping_planes_fragment>",
			"	if (vColor.a < ALPHATEST) discard;",
			"	gl_FragColor = vColor;",
			"}"
		].join("\n");

		this._outlineColor = new THREE.Vector4(0, 0, 0, 1);
		this._outlineMaterial = new THREE.ShaderMaterial({
			uniforms: {
				color: {
					value: this._outlineColor
				}
			},
			vertexShader: outlineVertexShader,
			fragmentShader: outlineFragmentShader,
			depthWrite: false,
			depthFunc: THREE.LessEqualDepth,
			polygonOffset: true,
			polygonOffsetFactor: -4,
			blending: THREE.NormalBlending,
			alphaTest: 0.01,
			clipping: true
		});

		this._solidWhiteMaterial = new THREE.MeshBasicMaterial({
			color: 0xFFFFFF
		});
	};

	Scene.prototype.destroy = function() {
		if (this._defaultNodeHierarchy) {
			this._defaultNodeHierarchy.destroy();
			this._defaultNodeHierarchy = null;
		}
		this._state = null;
		this._scene = null;

		SceneBase.prototype.destroy.call(this);
	};

	Scene.prototype.setDoubleSided = function(value) {
		this.setProperty("doubleSided", value, true);

		this._scene.traverse(function(node) {
			if (node.material !== undefined) {
				var userData = node.userData;
				var originalMaterialSide = THREE.FrontSide;
				var materialUserData;
				if (userData.originalMaterial) {
					if (userData.originalMaterial.userData === undefined) {
						userData.originalMaterial.userData = {};
					}
					materialUserData = userData.originalMaterial.userData;
					if (materialUserData.originalMaterialSide === undefined) {
						materialUserData.originalMaterialSide = userData.originalMaterial.side;
					}
					originalMaterialSide = materialUserData.originalMaterialSide;
				} else {
					if (node.material.userData === undefined) {
						node.material.userData = {};
					}
					materialUserData = node.material.userData;
					if (materialUserData.originalMaterialSide === undefined) {
						materialUserData.originalMaterialSide = node.material.side;
					}
					originalMaterialSide = materialUserData.originalMaterialSide;
				}
				node.material.side = value ? THREE.DoubleSide : originalMaterialSide;
			}
		});

		return this;
	};

	Scene.prototype.setViewStateManager = function(value) {
		this._currentViewStateManager = value;
		return this;
	};

	Scene.prototype.getViewStateManager = function() {
		return this._currentViewStateManager;
	};

	/**
	 * Gets the unique ID of the Scene object.
	 * @returns {string} The unique ID of the Scene object.
	 * @public
	 */
	Scene.prototype.getId = function() {
		return this._id;
	};

	/**
	 * Gets the default node hierarchy in the Scene object.
	 * @returns {sap.ui.vk.NodeHierarchy} The default node hierarchy in the Scene object.
	 * @public
	 */
	Scene.prototype.getDefaultNodeHierarchy = function() {
		if (!this._defaultNodeHierarchy) {
			this._defaultNodeHierarchy = new NodeHierarchy(this);
		}
		return this._defaultNodeHierarchy;
	};

	// THREE.Box3().applyMatrix4() analogue, but 10x faster and sutable for non-perspective transformation matrices. The original implementation is dumb.
	function box3ApplyMatrix4(boundingBox, matrix) {
		var min = boundingBox.min,
			max = boundingBox.max,
			m = matrix.elements,
			cx = (min.x + max.x) * 0.5,
			cy = (min.y + max.y) * 0.5,
			cz = (min.z + max.z) * 0.5,
			ex = max.x - cx,
			ey = max.y - cy,
			ez = max.z - cz;

		var tcx = m[ 0 ] * cx + m[ 4 ] * cy + m[ 8 ] * cz + m[ 12 ];
		var tcy = m[ 1 ] * cx + m[ 5 ] * cy + m[ 9 ] * cz + m[ 13 ];
		var tcz = m[ 2 ] * cx + m[ 6 ] * cy + m[ 10 ] * cz + m[ 14 ];

		var tex = Math.abs(m[ 0 ] * ex) + Math.abs(m[ 4 ] * ey) + Math.abs(m[ 8 ] * ez);
		var tey = Math.abs(m[ 1 ] * ex) + Math.abs(m[ 5 ] * ey) + Math.abs(m[ 9 ] * ez);
		var tez = Math.abs(m[ 2 ] * ex) + Math.abs(m[ 6 ] * ey) + Math.abs(m[ 10 ] * ez);

		min.set(tcx - tex, tcy - tey, tcz - tez);
		max.set(tcx + tex, tcy + tey, tcz + tez);
	}

	THREE.Object3D.prototype._expandBoundingBox = function(boundingBox, visibleOnly) {
		var nodeBoundingBox = new THREE.Box3();

		function expandBoundingBox(node) {
			var geometry = node.geometry;
			if (geometry !== undefined) {
				if (!geometry.boundingBox) {
					geometry.computeBoundingBox();
				}

				if (!geometry.boundingBox.isEmpty()) {
					// exclude 2D geometry that is placed on screen, as the size of its bounding box will keep increasing when zooming
					if (geometry.boundingBox.min.z === 0 && geometry.boundingBox.max.z === 0) {
						return;
					}

					nodeBoundingBox.copy(geometry.boundingBox);
					box3ApplyMatrix4(nodeBoundingBox, node.matrixWorld);
					if (isFinite(nodeBoundingBox.min.x) && isFinite(nodeBoundingBox.min.y) && isFinite(nodeBoundingBox.min.z) &&
						isFinite(nodeBoundingBox.max.x) && isFinite(nodeBoundingBox.max.y) && isFinite(nodeBoundingBox.max.z)) {
							boundingBox.min.min(nodeBoundingBox.min);
							boundingBox.max.max(nodeBoundingBox.max);
					}
				}
			}

			var selectionBoundingBox = node.userData.boundingBox;
			if (selectionBoundingBox !== undefined && !selectionBoundingBox.isEmpty() && !visibleOnly) {
				nodeBoundingBox.copy(selectionBoundingBox);
				box3ApplyMatrix4(nodeBoundingBox, node.matrixWorld);

				boundingBox.min.min(nodeBoundingBox.min);
				boundingBox.max.max(nodeBoundingBox.max);
			}
		}

		this.updateMatrixWorld();
		if (visibleOnly) {
			this.traverseVisible(expandBoundingBox);
		} else {
			this.traverse(expandBoundingBox);
		}

		return boundingBox;
	};

	Scene.prototype._computeBoundingBox = function(visibleOnly) {
		var boundingBox = new THREE.Box3();
		if (this._scene) {
			this._scene._expandBoundingBox(boundingBox, visibleOnly);
		}
		return boundingBox;
	};

	/**
	 * Gets the scene reference for the Scene object.
	 * @returns {THREE.Scene} The three.js scene.
	 * @public
	 */
	Scene.prototype.getSceneRef = function() {
		return this._scene;
	};

	Scene.prototype._setState = function(state) {
		this._state = state;
	};

	/**
	 * Gets the persistent ID from node reference.
	 *
	 * @param {THREE.Object3D|THREE.Object3D[]} nodeRefs The reference to the node or the array of references to the nodes.
	 * @returns {string|string[]} The persistent ID or the array of the persistent IDs.
	 * @public
	 */
	Scene.prototype.nodeRefToPersistentId = function(nodeRefs) {
		var state = this._state;

		if (Array.isArray(nodeRefs)) {
			if (!state) {
				return [];
			}
			var ids = [];
			nodeRefs.forEach(function(nodeRef) {
				ids.push(state.object3DToSid(nodeRef));
			});
			return ids;
		} else {
			if (!state) {
				return null;
			}
			return state.object3DToSid(nodeRefs);
		}
	};

	/**
	 * Gets the node reference from persistent ID.
	 *
	 * @param {string|string[]} pIDs The persistent ID or the array of the persistent IDs.
	 * @returns {THREE.Object3D|THREE.Object3D[]} The reference to the node or the array of references to the nodes.
	 * @public
	 */
	Scene.prototype.persistentIdToNodeRef = function(pIDs) {
		var state = this._state;

		if (Array.isArray(pIDs)) {
			if (!state) {
				return [];
			}
			var nodeRefs = [];
			pIDs.forEach(function(pID) {
				nodeRefs.push(state.sidToObject3D(pID));
			});
			return nodeRefs;
		} else {
			if (!state) {
				return null;
			}
			return state.sidToObject3D(pIDs);
		}
	};

	/**
	 * Gets all materials defined in scene nodes
	 *
	 * @returns {sap.ui.vk.threejs.material[]} the array of materials.
	 * @public
	 */
	Scene.prototype.enumerateMaterials = function() {
		if (!this._defaultNodeHierarchy) {
			return [];
		}

		var topNode = this._defaultNodeHierarchy.createNodeProxy(this._scene);
		if (topNode) {
			return topNode.enumerateMaterials(true);
		} else {
			return [];
		}
	};

	var distEpsilon = 0;

	function compare(a, b) {
		var dx = a.x - b.x;
		if (dx < -distEpsilon) {
			return true;
		}
		if (dx > distEpsilon) {
			return false;
		}

		var dy = a.y - b.y;
		if (dy < -distEpsilon) {
			return true;
		}
		if (dy > distEpsilon) {
			return false;
		}

		return a.z - b.z < -distEpsilon;
	}

	function quickSort(array, beginIndex, endIndex) {
		if (beginIndex < endIndex) {
			var partitionIndex = partition(array, beginIndex, endIndex);
			quickSort(array, beginIndex, partitionIndex - 1);
			quickSort(array, partitionIndex + 1, endIndex);
		}
		return array;
	}

	function partition(array, beginIndex, endIndex) {
		var pivotValue = array[ endIndex ],
			partitionIndex = beginIndex;

		for (var i = beginIndex; i < endIndex; i++) {
			if (compare(array[ i ], pivotValue)) {
				swap(array, i, partitionIndex);
				partitionIndex++;
			}
		}
		swap(array, endIndex, partitionIndex);
		return partitionIndex;
	}

	function swap(array, i, j) {
		if (i != j) {
			var temp = array[ i ];
			array[ i ] = array[ j ];
			array[ j ] = temp;
		}
	}

	var size = new THREE.Vector3();

	function mergeVertices(geom) {
		geom.computeBoundingBox();
		geom.boundingBox.getSize(size);
		distEpsilon = Math.max(size.x, size.y, size.z) * 1e-4;
		// console.log("distEpsilon", distEpsilon);

		var vertices = geom.vertices,
			vertexCount = vertices.length,
			faceCount = geom.faces.length;
		if (vertexCount === 0 || faceCount === 0) {
			return;
		}
		var i, faceCount2;
		for (i = 0; i < vertexCount; i++) {
			vertices[ i ].index = i;
		}

		quickSort(vertices, 0, vertices.length - 1);

		var unique = [], changes = [];
		unique.push(vertices[ 0 ]);
		changes[ vertices[ 0 ].index ] = unique.length - 1;
		for (i = 1; i < vertexCount; i++) {
			if (compare(unique[ unique.length - 1 ], vertices[ i ])) {
				unique.push(vertices[ i ]);
			}
			changes[ vertices[ i ].index ] = unique.length - 1;
		}
		// console.log(vertexCount, "->", unique.length);
		geom.vertices = unique;

		for (i = 0, faceCount = geom.faces.length, faceCount2 = 0; i < faceCount; i++) {
			var faceSrc = geom.faces[ i ];
			var face = geom.faces[ faceCount2 ];
			face.a = changes[ faceSrc.a ];
			face.b = changes[ faceSrc.b ];
			face.c = changes[ faceSrc.c ];

			if (face.a !== face.b && face.b !== face.c && face.c !== face.a) {
				faceCount2++;
			}
		}
		geom.faces.length = faceCount2;
	}

	function OutlineGeometry(geometry, thresholdAngle) {
		THREE.BufferGeometry.call(this);

		this.type = "OutlineGeometry";

		// helper variables
		var thresholdDot = Math.cos(THREE.Math.DEG2RAD * ((thresholdAngle !== undefined) ? thresholdAngle : 1));
		var edges = {},
			edge1, edge2;
		var key, keys = [ "a", "b", "c" ];
		var v = new THREE.Vector3();

		// prepare source geometry
		var geometry2;
		if (geometry.isBufferGeometry) {
			geometry2 = new THREE.Geometry();
			geometry2.fromBufferGeometry(geometry);
		} else {
			geometry2 = geometry.clone();
		}

		mergeVertices(geometry2);
		geometry2.computeFaceNormals();

		var sourceVertices = geometry2.vertices;
		var faces = geometry2.faces;

		// now create a data structure where each entry represents an edge with its adjoining faces
		for (var fi = 0, l = faces.length; fi < l; fi++) {
			var face = faces[ fi ];

			for (var i = 0, j = 2; i < 3; j = i++) {
				edge1 = face[ keys[ j ] ];
				edge2 = face[ keys[ i ] ];
				key = Math.min(edge1, edge2) + "," + Math.max(edge1, edge2);

				if (edges[ key ] === undefined) {
					edges[ key ] = {
						index1: edge1,
						index2: edge2,
						face1: fi,
						face2: undefined
					};
				} else {
					edges[ key ].face2 = fi;
				}
			}
		}

		// generate vertices
		var vertices = [];
		var normals1 = [];
		var normals2 = [];
		for (key in edges) {
			var e = edges[ key ];

			// an edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
			if (e.face2 === undefined || (faces[ e.face1 ].normal.dot(faces[ e.face2 ].normal) <= thresholdDot &&
				v.copy(sourceVertices[ e.index2 ]).sub(sourceVertices[ e.index1 ]).cross(faces[ e.face1 ].normal).dot(faces[ e.face2 ].normal) > 0)) {

				var vertex = sourceVertices[ e.index1 ];
				vertices.push(vertex.x, vertex.y, vertex.z);

				vertex = sourceVertices[ e.index2 ];
				vertices.push(vertex.x, vertex.y, vertex.z);

				var normal1 = faces[ e.face1 ].normal;
				normals1.push(normal1.x, normal1.y, normal1.z);
				normals1.push(normal1.x, normal1.y, normal1.z);

				if (e.face2 !== undefined) {
					var normal2 = faces[ e.face2 ].normal;
					normals2.push(normal2.x, normal2.y, normal2.z);
					normals2.push(normal2.x, normal2.y, normal2.z);
				} else {
					normals2.push(0, 0, 0);
					normals2.push(0, 0, 0);
				}
			}
		}

		// build geometry
		this.addAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		this.addAttribute("normal1", new THREE.Float32BufferAttribute(normals1, 3));
		this.addAttribute("normal2", new THREE.Float32BufferAttribute(normals2, 3));
	}

	OutlineGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
	OutlineGeometry.prototype.constructor = OutlineGeometry;

	function box3IsNull(box) {
		// callouts and billboards have empty bounding box, we need to ignore them
		return box.min.x >= box.max.x && box.min.y >= box.max.y && box.min.z >= box.max.z;
	}

	function createMergedGeometry(node) {
		var geometry = null;
		if (node.isMesh && node.geometry && !box3IsNull(node.geometry.boundingBox) && (node.name || node.children.length > 0)) {
			geometry = node.geometry;
			if (geometry.isBufferGeometry) {
				geometry = new THREE.Geometry().fromBufferGeometry(geometry);
			}
		}

		for (var i = 0, l = node.children.length; i < l; i++) {
			var child = node.children[ i ];
			if (child.isMesh && child.geometry && !box3IsNull(child.geometry.boundingBox) && !child.name && child.children.length === 0) {
				if (geometry === null) {
					geometry = new THREE.Geometry();
				}
				var childGeometry = child.geometry;
				if (childGeometry.isBufferGeometry) {
					childGeometry = new THREE.Geometry().fromBufferGeometry(childGeometry);
				}
				geometry.merge(childGeometry, child.matrix);
			}
		}

		return geometry;
	}

	function setMeshMaterial(node, newMaterial) {
		var userData = node.userData;
		if (userData.defaultMaterial === undefined) {// save default material
			userData.defaultMaterial = userData.originalMaterial || node.material;
		}
		node.material = newMaterial;

		// apply highlighting on the updated material
		userData.originalMaterial = null;
		node._vkUpdateMaterialColor();
		node._vkUpdateMaterialOpacity();
	}

	function restoreMeshMaterial(node) {
		var userData = node.userData;
		if (userData.defaultMaterial) {
			node.material = userData.defaultMaterial;
			delete userData.defaultMaterial;

			// apply highlighting on the updated material
			userData.originalMaterial = null;
			node._vkUpdateMaterialColor();
			node._vkUpdateMaterialOpacity();
		}
	}

	THREE.Object3D.prototype._vkTraverseMeshNodes = function(callback) {
		if (this.isSprite || this.isBillboard || this.isDetailView) {
			return;
		}

		callback(this);
		var children = this.children;
		for (var i = 0, l = children.length; i < l; i++) {
			children[ i ]._vkTraverseMeshNodes(callback);
		}
	};

	Scene.prototype._createOutlineGeometry = function(renderMode) {
		if (this._scene) {
			this._scene._vkTraverseMeshNodes(function(node) {
				if (node.isOutline) {
					node.visible = true;
				} else {
					if (!node.hasOutline) {// create outline
						node.hasOutline = true;
						var mergedGeometry = createMergedGeometry(node);
						if (mergedGeometry !== null) {
							var geometry = new OutlineGeometry(mergedGeometry);
							geometry.boundingBox = new THREE.Box3(); // set empty boinding box, disable hit testing
							var line = new THREE.LineSegments(geometry, this._outlineMaterial);
							line.isOutline = true;
							line.renderOrder = node.renderOrder + 0.5;
							node.add(line);
						}
					}
					if (node.isMesh && node.material) {// update material
						switch (renderMode) {
							case sap.ui.vk.RenderMode.LineIllustration:
								setMeshMaterial(node, this._solidWhiteMaterial);
								break;
							case sap.ui.vk.RenderMode.ShadedIllustration:
								// create whited material
								var material = (node.userData.defaultMaterial || node.userData.originalMaterial || node.material).clone();
								if (material.emissive) {
									material.color.multiplyScalar(0.5);
									material.emissive.multiplyScalar(0.5).addScalar(0.5);
								} else {
									material.color.multiplyScalar(0.5).addScalar(0.5);
								}
								setMeshMaterial(node, material);
								break;
							default:
								restoreMeshMaterial(node);
								break;
						}
					}
				}
			}.bind(this));
		}
	};

	Scene.prototype._hideOutlineGeometry = function() {
		if (this._scene) {
			this._scene._vkTraverseMeshNodes(function(node) {
				if (node.isOutline) {
					node.visible = false;
				}

				if (node.isMesh) {
					restoreMeshMaterial(node);
				}
			});
		}
	};

	return Scene;
});
