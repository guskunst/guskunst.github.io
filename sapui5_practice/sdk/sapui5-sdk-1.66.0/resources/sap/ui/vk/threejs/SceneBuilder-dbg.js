/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.threejs.SceneBuilder.
sap.ui.define([
	"jquery.sap.global", "./thirdparty/three", "./BBoxSubdivider", "./UsageCounter", "../totara/ListMap",
	"./OrthographicCamera", "./PerspectiveCamera", "./AnimationHelper",
	"sap/ui/vk/View", "sap/ui/vk/threejs/Billboard", "sap/ui/vk/threejs/Callout"
], function(
	jQuery, three, BBoxSubdivider, UsageCounter, ListMap, OrthographicCamera, PerspectiveCamera, AnimationHelper, View, Billboard, Callout
) {
	"use strict";

	/**
	 * Provides the ability to create three.js scene from the information retrieved from streaming or vds file.

	 * SceneBuilder allows for creating scene tree, material, and geometry in any order.
	 * It is up to user to maintain the ids of entities that have not been created,
	 * and call the updating functions once the entities are created, for instance,
	 * calling node updating functions after the associated material or geometry is created,
	 * or material updating function after the associted images are created.

	 *
	 * Constructor for a new SceneBuilder
	 *
	 * @param {any} rootNode The reference object of a root node.
	 * When <code>rootNode</code> is specified in constructor, it's assumed that
	 * the constructed SceneBuilder only deals with one root node, and therefore one single scene.<br/>
	 * When no <code>rootNode</code> is not specified, the function setRootNode has to be called for each root node.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.66.0
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var SceneBuilder = function(rootNode) {
		this._id = SceneBuilder._nextId++;
		SceneBuilder._add(this);

		// resources below are shared among different scences (represented by root nodes)
		this._submeshes = new Map();	// map of submesh id and submesh implemented as THREE.Mesh
		this._callouts = new Map();
		this._cameras = new Map();
		this._materials = new Map();
		this._images = new Map();
		this._geometries = new Map();  // map of geometry id and THREE.Geometry

		// resources below are created for each scene
		if (rootNode) {
			this._rootNode = rootNode;
			this._nodes = new Map(); // current map of node Ids and tree nodes , for current root node
			this._NodeMeshIdSubmeshIdsMap = new Map(); // current map of node mesh Ids and array of submesh ids, for current root node
			this._sequences = new Map();
			this._tracks = new Map();
			this._trackIdSequenceNodeMap = new ListMap();
			this._viewGroups = new Map();
			this._views = new Map();
		} else {  // to be initiated in function setRootNode
			this._rootNode = null;
			this._nodes = null;
			this._NodeMeshIdSubmeshIdsMap = null;
			this._sequences = null;
			this._tracks = null;
			this._trackIdSequenceNodeMap = null;
			this._viewGroups = null;
			this._views = null;
		}

		this._currentSceneId = null;
		this._sceneIdTreeNodesMap = new Map();	// map of scene id and map of tree nodes: sceneId and this._NodeMeshIdSubmeshIdsMap
		this._sceneIdRootNodeMap = new Map();	// map of scene id and root node
		this._sceneIdNodMeshIdMap = new Map();	// map of scene id and map of mesh ids: sceneId and this._NodeMeshIdSubmeshIdsMap
		this._sceneIdViewGroupMap = new Map();
		this._sceneIdViewMap = new Map();

		this._highlightStyles = new Map();

		this._animationHelper = new AnimationHelper(this);
	};

	SceneBuilder._nextId = 1;

	SceneBuilder._map = new Map();

	/**
	 * Get current SceneBuilder id.
	 *
	 * @returns {integer} current SceneBuilder id
	 * @public
	 */
	SceneBuilder.prototype.getId = function() {
		return this._id;
	};

	////////////////////////////////////////////////////////////////////////
	// Add current scene builder to the class map
	SceneBuilder._add = function(sceneBuilder) {
		SceneBuilder._map.set(sceneBuilder.getId(), sceneBuilder);
		return this;
	};


	/**
	 * Set current root node, and create corresponding tree nodes map and mesh ID map
	 *
	 * @param {any} rootNode The reference object of root node

	 * @param {any} nodeId The id of root node in the scene tree

	 * @param {any} sceneId The id of scene with the root node as its top node

	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining
	 * @public
	 */
	SceneBuilder.prototype.setRootNode = function(rootNode, nodeId, sceneId) {
		this._rootNode = rootNode;
		this._nodes = new Map();
		this._nodes.set(nodeId, rootNode);
		this._NodeMeshIdSubmeshIdsMap = new Map();
		if (!this._rootNode.userData) {
			this._rootNode.userData = {};
		}
		this._sequences = new Map();
		this._tracks = new Map();
		this._trackIdSequenceNodeMap = new ListMap();
		this._viewGroups = new Map();
		this._views = new Map();

		if (sceneId) {
			this._sceneIdTreeNodesMap.set(sceneId, this._nodes);
			this._sceneIdRootNodeMap.set(sceneId, rootNode);
			this._sceneIdNodMeshIdMap.set(sceneId, this._NodeMeshIdSubmeshIdsMap);
			this._sceneIdViewGroupMap.set(sceneId, this._viewGroups);
			this._sceneIdViewMap.set(sceneId, this._views);
			this._currentSceneId = sceneId;
		}
		return this;
	};

	////////////////////////////////////////////////////////////////////////
	// Reset current scene
	SceneBuilder.prototype._resetCurrentScene = function(sceneId) {
		if (sceneId && sceneId !== this._currentSceneId){
			var nodes = this._sceneIdTreeNodesMap.get(sceneId);
			if (nodes) {
				this._nodes = nodes;
			} else {
				this._nodes = null;
			}

			var node = this._sceneIdRootNodeMap.get(sceneId);
			if (node) {
				this._rootNode = node;
			} else {
				this._rootNode = null;
			}

			this._currentSceneId = sceneId;
		}
	};

	/**
	 * Get three.js node
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {THREE.Group} three.js group node
	 * @public
	 */
	SceneBuilder.prototype.getNode = function(nodeId, sceneId) {
		this._resetCurrentScene(sceneId);
		if (!this._nodes) {
			return null;
		}
		return this._nodes.get(nodeId);
	};

	/**
	 * Get id of three.js object
	 * @param {THREE.Object} obj3D three.js object in the scene tree
	 * @returns {any} Object id
	 * @public
	 */
	SceneBuilder.prototype.getObjectId = function(obj3D) {
		do {
			if (obj3D.userData && obj3D.userData.treeNode && obj3D.userData.treeNode.sid) {
				return obj3D.userData.treeNode.sid;
			}
			obj3D = obj3D.parent;
		} while (obj3D);
		return null;
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// Create three.js matrix for an array, which may contain
	// 3 values --> x y z position
	// 12 values --> 4x3 column major matrix
	// 16 values --> 4x4 column major matrix
	var arrayToMatrix = function(arr) {
		var matrix = new THREE.Matrix4();
		if (arr.length === 3) {
			// position only matrix
			matrix.setPosition(new THREE.Vector3().fromArray(arr));
		} else if (arr.length === 12) {
			// 4x3 matrix
			matrix.set(arr[ 0 ], arr[ 3 ], arr[ 6 ], arr[ 9 ], arr[ 1 ], arr[ 4 ], arr[ 7 ], arr[ 10 ], arr[ 2 ], arr[ 5 ], arr[ 8 ], arr[ 11 ], 0.0, 0.0, 0.0, 1.0);
		} else if (arr.length === 16) {
			// 4x4 matrix
			matrix.set(arr[ 0 ], arr[ 4 ], arr[ 8 ], arr[ 12 ], arr[ 1 ], arr[ 5 ], arr[ 9 ], arr[ 13 ], arr[ 2 ], arr[ 6 ], arr[ 10 ], arr[ 14 ], arr[ 3 ], arr[ 7 ], arr[ 11 ], arr[ 15 ]);
		} else {
			throw "Invalid matrix format";
		}
		return matrix;
	};

	var DefaultHighlightingEmissive = { r: 0.0235,
		g: 0.0235,
		b: 0.0235
	};

	var DefaultHighlightingSpecular = { r: 0.0602,
		g: 0.0602,
		b: 0.0602
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Create a place-holder material, whose value should be updated when material data is available
	SceneBuilder.prototype._createTemporaryMaterial = function(materialId) {
		var material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
		if (!material.userData) {
			material.userData = {};
		}
		material.userData.defaultHighlightingEmissive = DefaultHighlightingEmissive;
		material.userData.defaultHighlightingSpecular = DefaultHighlightingSpecular;
		material.userData.materialUsed = 0;
		material.userData.materialId = materialId;
		material.userData.toBeUpdated = true;
		this._materials.set(materialId, material);
		return material;
	};

	/**
	 * Create three.js node.
	 *
	 * @param {any} nodeInfo The node information object containning the following properties <br/>
	 *							&nbsp&nbsp&nbsp&nbsp <code>sid</code>: String. The id of node. Optional<br/>
	 *							&nbsp&nbsp&nbsp&nbsp <code>name</code>: String. The name of the node. Optional.<br/>
	 *       					&nbsp&nbsp&nbsp&nbsp <code>transform</code>: matrix as either 12(no shear), 16(full) or 3(position only) values. Optional</br>
	 *       					&nbsp&nbsp&nbsp&nbsp <code>visible</code>: Boolean. True if the node is visible. Default true. Optional<br/>
	 *       					&nbsp&nbsp&nbsp&nbsp <code>materialId</code>: String. The id of the material the node is associated with. Optional<br/>
	 *       					&nbsp&nbsp&nbsp&nbsp <code>meshId</code>: String. The id of the mesh. Optional<br/>
	 * 							&nbsp&nbsp&nbsp&nbsp <code>opacity</code>: String. The opacity of node, to be applied to submesh nodes. Optional<br/>

	 * @param {any} parentId The id of parent node, if parent node cannot be found, the node is added directly under root node.

	 * @param {any} sceneId The id of scene containing the node

	 * @returns {any} The result object contains three properties:<br/>
	 * 					&nbsp&nbsp&nbsp&nbsp <code>needUpdateMaterial</code>: true if the material id exists but associated material has not been created<br/>
						&nbsp&nbsp&nbsp&nbsp <code>needSetSubmesh</code>: true if the mesh if exists but associated submesh ids have not been read<br/>
						&nbsp&nbsp&nbsp&nbsp <code>idOfGeometriesToUpdate</code>: set of ids of unavailable geomeotries that are in the sub-meshes of the node<br/>
	 					&nbsp&nbsp&nbsp&nbsp <code>materialIds</code>: array of ids of the materials that are place-hold and the opacity needs to be applied after updating<br/>
	*/
	SceneBuilder.prototype.createNode = function(nodeInfo, parentId, sceneId) {
		var result = { needUpdateMaterial: false,
					   needSetSubmesh: false,
					   idOfGeometriesToUpdate: null,
					   materialIds: [] };

		this._resetCurrentScene(sceneId);
		var parent = this._nodes.get(parentId) || null;
		var node = new THREE.Group();
		node.userData.treeNode = nodeInfo;

		if (nodeInfo.renderOrder) {
			node.renderOrder = nodeInfo.renderOrder;
		}

		node.visible = nodeInfo.visible !== undefined ? nodeInfo.visible : true;

		if (nodeInfo.name) {
			node.name = nodeInfo.name;
		}

		node.userData.opacity = nodeInfo.opacity;

		// if tree has transform, it should overwrite one from the element.
		if (nodeInfo.transform) {
			node.applyMatrix(arrayToMatrix(nodeInfo.transform));
		}

		(parent || this._rootNode).add(node);
		this._nodes.set(nodeInfo.sid, node);

		var submeshResult = this.attachSubMeshesToNode(nodeInfo.sid, sceneId);
		var materialResult = this.applyNodeMaterialToSubmeshes(nodeInfo.sid, sceneId);
		var opacityResult = this.applyNodeOpacityToSubmeshes(nodeInfo.sid, sceneId);

		result.needUpdateMaterial = materialResult.needUpdateMaterial;
		result.needSetSubmesh = submeshResult.needSetSubmesh;
		result.idOfGeometriesToUpdate = submeshResult.idOfGeometriesToUpdate;
		result.materialIds = opacityResult.materialIds;

		return result;
	};

	/**
	 * Apply a material to the submeshes of a node, and the material is associated with the material id defined in the node.
	 * The function is called inside createNode function, if the material is not available, a place-holder material is created.
	 * The function should be called after the place-holder material is updated with the actual material information.
	 *
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {any} The result object contains one property:<br>
	 * 					&nbsp&nbsp&nbsp&nbsp <code>needUpdateMaterial</code>: true if the material id exists but associated material has not been created<br/>
	 * @public
	 */
	SceneBuilder.prototype.applyNodeMaterialToSubmeshes = function(nodeId, sceneId) {

		var result = { needUpdateMaterial: false };

		this._resetCurrentScene(sceneId);

		var node = this._nodes.get(nodeId);

		if (!node) {
			return result;
		}

		var nodeInfo = node.userData.treeNode;
		node.userData.materialId = nodeInfo.materialId;

		if (!nodeInfo.meshId || !node.userData.materialId) {
			return result;
		}

		var nodeMaterial = this._materials.get(node.userData.materialId);
		if (!nodeMaterial) {
			nodeMaterial = this._createTemporaryMaterial(node.userData.materialId);
			result.needUpdateMaterial = true;
		}

		if (node && node.children) {
			for (var i = 0; i < node.children.length; i++) {
				var child = node.children[i];
				child.material = nodeMaterial;
				child.userData.materialId = node.userData.materialId;
				UsageCounter.increaseMaterialUsed(nodeMaterial);

				/* if (nodeInfo.renderOrder) {
					child.material.depthTest = false;
				}*/
			}
		}

		return result;
	};

	/**
	 * Apply a opacity to the materials of submeshes of a node, and the opacity is defined in the node.
	 * The function is called inside createNode function.
	 * Opacity is not applied if the submesh materials are place-holder, and need to be updated
	 * The function should be called after the place-holder material is updated with the actual material information.
	 *
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} sceneId The id of scene containing the node
	 * @param {any} materialId If defined the opacity is only applied to the material with the parameter as its id
	 * @returns {any} The result object contains one property:<br>
	 * 					&nbsp&nbsp&nbsp&nbsp <code>materialIds</code>: array of ids of the materials that are place-hold and the opacity needs to be applied after updating<br/>
	 * @public
	 */
	SceneBuilder.prototype.applyNodeOpacityToSubmeshes = function(nodeId, sceneId, materialId) {

		var result = { materialIds: [] };

		this._resetCurrentScene(sceneId);

		var node = this._nodes.get(nodeId);

		if (!node) {
			return result;
		}

		var nodeInfo = node.userData.treeNode;

		if (!nodeInfo.meshId || !nodeInfo.opacity) {
			return result;
		}

		if (node && node.children) {
			var mids = new Set();
			for (var i = 0; i < node.children.length; i++) {
				var child = node.children[i];
				if (child.material && (!materialId || materialId === child.material.userData.materialId)) {
					if (!child.material.userData.toBeUpdated) {
						child.userData.opacity = nodeInfo.opacity;
						child.userData.originalMaterial = child.material;
						child.material = child.material.clone();
						child.material.opacity *= child.userData.opacity;
						child.material.transparent = child.material.opacity < 0.99;
					} else {
						mids.add(child.material.userData.materialId);
					}
				}
			}
			mids.forEach(function(v) {result.materialIds.push(v);});
		}
		return result;
	};

	/**
	 * Attach submeshes to a node, the submeshes are associated with the mesh Id defined in the node.
	 * The function is called in createNode function.
	 * The function should be called after submeshes assoicated with a node are created.
	 *
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {any} The result object contains two properties:<br/>
					   	&nbsp&nbsp&nbsp&nbsp <code>needSetSubmesh</code>: true if the mesh if exists but associated submesh ids have not been read<br/>
						&nbsp&nbsp&nbsp&nbsp <code>idOfGeometriesToUpdate</code>: set of ids of unavailable geomeotries that are in the sub-meshes of the node<br/>
	 * @public
	 */
	SceneBuilder.prototype.attachSubMeshesToNode = function(nodeId, sceneId) {
		var result = { needSetSubmesh: false,
					   idOfGeometriesToUpdate: new Set() };

		this._resetCurrentScene(sceneId);
		var node = this._nodes.get(nodeId);

		var info = node.userData.treeNode;

		if (!info.meshId) {
			return result;
		}

		var subMeshIds = this._NodeMeshIdSubmeshIdsMap.get(info.meshId);
		if (!subMeshIds) {
			result.needSetSubmesh = true;
			return result;
		}

		var ids = []; // Array.from(subMeshIds);
		subMeshIds.forEach(function(value) { ids.push(value); });

		var i;
		var submeshId;
		for (i = 0; i < ids.length; i++) {
			submeshId = ids[i];
			this._insertSubmesh(info.sid, submeshId, sceneId);
		}

		for (i = 0; i < ids.length; i++) {
			submeshId = ids[i];
			var submesh = this._submeshes.get(submeshId);
			if (submesh && submesh.userData && submesh.userData.isBoundingBox && submesh.userData.geometryId) {
				result.idOfGeometriesToUpdate.add(submesh.userData.geometryId);
			}
		}
		return result;
	};

	/**
	 * Update the material of submeshes of a node based on new node information.
	 * The function should be called when a node is updated with new node information defined in a view.
	 *
	 * @param {any} nodeInfo New node information object containning the following properties <br/>
	 *							&nbsp&nbsp&nbsp&nbsp <code>sid</code>: string, the id of node, optional<br/>
	 *							&nbsp&nbsp&nbsp&nbsp <code>name</code>: string, the name of the node, optional.<br/>
	 *       					&nbsp&nbsp&nbsp&nbsp <code>transform</code>: matrix as either 12(no shear), 16(full) or 3(position only) values, optional</br>
	 *       					&nbsp&nbsp&nbsp&nbsp <code>visible</code>: boolean, true if the node is visible, default true, optional<br/>
	 *       					&nbsp&nbsp&nbsp&nbsp <code>materialId</code>: string, the id of the material the node is associated with, optional<br/>
	 *       					&nbsp&nbsp&nbsp&nbsp <code>meshId</code>: string, the id of the mesh, optional<br/>
	 * 							&nbsp&nbsp&nbsp&nbsp <code>opacity</code>: String. The opacity of node, to be applied to submesh nodes. Optional<br/>
	 *
	 * @param {any} sceneId The id of scene containing the node
	 *
	 * @returns {any} The result object contains two properties:<br/>
	 * 					&nbsp&nbsp&nbsp&nbsp <code>needUpdateMaterial</code>: true if the material id exists but associated material has not been created<br/>
	 * 					&nbsp&nbsp&nbsp&nbsp <code>nodeUpdated</code>:	true if the node material is changed<br/>
	 * @public
	 */
	SceneBuilder.prototype.updateMaterialInNode = function(nodeInfo, sceneId) {
		this._resetCurrentScene(sceneId);

		var result = { needUpdateMaterial : false,  nodeUpdated: false };

		var node = this._nodes.get(nodeInfo.sid);

		var oldMaterialId = node.userData.materialId;
		var oldOpacity = node.userData.opacity;

		node.userData.treeNode = nodeInfo;
		node.userData.materialId = nodeInfo.materialId;
		node.userData.opacity = nodeInfo.opacity;

		var reAssignMaterial = false;
		if (oldMaterialId === undefined) {
			if (node.userData.materialId !== undefined) {
				reAssignMaterial = true;
			}
		} else if (oldMaterialId !== node.userData.materialId) {
			reAssignMaterial = true;
		}

		var resetOpacity = false;
		if (oldOpacity === undefined) {
			if (node.userData.opacity !== undefined) {
				resetOpacity = true;
			}
		} else if (oldOpacity !== node.userData.opacity) {
			resetOpacity = true;
		}

		if (!reAssignMaterial && !resetOpacity) {
			 return result;
		}

		result.nodeUpdated = true;

		var nodeMaterial  = null;
		if (node.userData.materialId) {
			nodeMaterial = this._materials.get(node.userData.materialId);
			if (nodeMaterial === undefined) {
				nodeMaterial = this._createTemporaryMaterial(node.userData.materialId);
				result.needUpdateMaterial = true;
			}

			/* if (nodeInfo.renderOrder) {
				nodeMaterial.depthTest = false;
			}*/
		}

		if (node && node.children) {
			for (var i = 0; i < node.children.length; i++) {
				var child = node.children[i];
				if (nodeMaterial) {
					child.material = nodeMaterial;
					child.userData.materialId = nodeInfo.materialId;
					UsageCounter.increaseMaterialUsed(nodeMaterial);
				} else {
					var meshMaterial = this._materials.get(child.userData.initialMaterialId);
					child.material = meshMaterial;
					child.userData.materialId = child.userData.initialMaterialId;
					UsageCounter.increaseMaterialUsed(meshMaterial);
				}

				delete child.userData.originalMaterial;

				if (node.userData.opacity !== undefined && (child.material && child.material.userData && !child.material.userData.toBeUpdated)) {
					child.userData.opacity = node.userData.opacity;
					child.userData.originalMaterial = child.material;
					child.material = child.material.clone();
					child.material.opacity *= child.userData.opacity;
					child.material.transparent = child.material.opacity < 0.99;
				} else {
					child.userData.opacity = undefined;
				}
			}
		}

		return result;
	};

	/**
	 * Update geometry in a submesh associated with a node.
	 * The function should be called after a geometry is created.
	 *
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} geometryId The id of geometry in a submesh associated with node
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.updateGeometryInNode = function(nodeId, geometryId, sceneId) {
		this._resetCurrentScene(sceneId);

		var node = this._nodes.get(nodeId);

		if (node && node.children) {
			for (var i = 0; i < node.children.length; i++) {
				var child = node.children[i];
				if (!child.isMesh) {
					continue;
				}

				if (child.userData.geometryId === geometryId) {
					var geometry = this._geometries.get(geometryId);
					if (geometry) {
						if (geometry.isPolyline && !child.isLineSegment) {
							var parent = child.parent;
							var material = child.material;
							parent.remove(child);

							// TODO: resolve mesh/line material in one Totara Material issue
							// for now. just grab diffuse color from MeshMaterial and create a new one.
							var lineMaterial = new THREE.LineBasicMaterial({
								color: 0xff0000,
								linewidth: 1,
								depthTest: false
							});
							lineMaterial.color.copy(material.color);

							var line = new THREE.LineSegments(geometry, lineMaterial);
							parent.add(line);

							line.userData.meshId = child.userData.meshId;

							// copy over matrix transform from boundingbox as this line is quantized
							if (geometry.isPositionQuantized) {
								line.position.copy(child.position);
								line.scale.copy(child.scale);
							}

							line.userData.initialMaterialId = child.userData.initialMaterialId;
							line.userData.isBoundingBox = false;
							line.userData.geometryId = child.userData.geometryId;
							line.userData.meshId = child.userData.meshId;
							line.userData.materialId = child.userData.materialId;
							line.userData.submeshInfo = child.userData.submeshInfo;
							line.userData.submeshId = child.userData.submeshId;

							var oldSubmesh = this._submeshes.get(line.userData.submeshId);
							if (oldSubmesh && oldSubmesh.renderOrder) {
								line.renderOrder = oldSubmesh.renderOrder;
							}

							this._submeshes.set(line.userData.submeshId, line);

						} else {
							child.geometry = geometry;
							child.userData.isBoundingBox = false;

							// box was stretched according to the bounding box size as bounding box geometries are re-used
							// so matrix has to be reset if geometry position was not quantized with boundingbox
							if (!geometry.isPositionQuantized) {
								child.position.set(0, 0, 0);
								child.scale.set(1, 1, 1);
							}
						}

						UsageCounter.increaseGeometryUsed(geometry);
					}
				}
			}
		}
		return this;
	};

	/**
	 * Get ids of child nodes of a node.
	 *
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} sceneId The id of scene containing the node
	 * @param {boolean} includeMeshNode The id of scene containing the node
	 * @returns {any[]} array of child node ids
	 * @public
	 */
	SceneBuilder.prototype.getChildNodeIds = function(nodeId, sceneId, includeMeshNode) {
		this._resetCurrentScene(sceneId);

		var node = this._nodes.get(nodeId);

		var ids = [];

		if (!node) {
			return ids;
		}

		if (node && node.children) {
			for (var i = 0; i < node.children.length; i++) {
				var child = node.children[i];
				if (child.userData && child.userData.treeNode && child.userData.treeNode.sid) {
					ids.push(child.userData.treeNode.sid);
				} else if (includeMeshNode && child.userData && child.userData.submeshInfo && child.userData.submeshInfo.id) {
					ids.push(child.userData.submeshInfo.id);
				}
			}
		}
		return ids;
	};

	function base64ToUint8Array(base64) {
		var binaryString = atob(base64);
		var len = binaryString.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++) {
			bytes[ i ] = binaryString.charCodeAt(i);
		}
		return bytes;
	}

	function findInnerBoxLod(lods) {
		if (lods) {
			for (var i = 0; i < lods.length; i++) {
				if (lods[ i ].type === "box" && lods[ i ].data) {
					return lods[ i ];
				}
			}
		}
		return null;
	}

	 // as matrix transform scale shouldn't be zero..
	 function fixForZero(val) {
		if (val === 0) {
			return Number.EPSILON;// smallest positive number
		}
		return val;
	}

	function updateMeshTransformWithBoundingBox(mesh, points) {
		mesh.position.set(
			(points[ 3 ] + points[ 0 ]) / 2,
			(points[ 4 ] + points[ 1 ]) / 2,
			(points[ 5 ] + points[ 2 ]) / 2);

		mesh.scale.set(
			fixForZero(points[ 3 ] - points[ 0 ]),
			fixForZero(points[ 4 ] - points[ 1 ]),
			fixForZero(points[ 5 ] - points[ 2 ]));
	}

	/**
	 * Create a submesh, and add geometry to the submesh, if the geometry has not been created, a bounding box geometry is created.
	 *
	 * @param {any} meshId The id of mesh containing the submesh

	 * @param {any} submeshInfo The object of submesh information that have the following properties<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>id</code>: string id of this sub-mesh<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>materialId</code>: string, id of the material this sub-mesh is associated with, optional<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>lods</code>: array of lods each containing the follow properties<br/>
	 *	 									&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>id</code>: string, geometry id the lod is associated with<br/>
	 *										&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>type</code>: string enum, default is 'mesh', other values are 'box' or 'line', optional<br/>
	 *										&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>boundingBox</code>: [minx, miny, minz, maxx, maxy, maxz]<br/>
	 *										&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>data</code>: inline base64 data for small or box geometry<br/>
	 *
	 * @returns {any} The result object contains two properties<br/>
	 * 					&nbsp&nbsp&nbsp&nbsp <code>needUpdateMaterial</code>: true if the material id exists but associated material has not been created<br/>
					   	&nbsp&nbsp&nbsp&nbsp <code>geometryIdToRequest</code>: id of geometry that has not been created
	 * @public
	 */
	SceneBuilder.prototype.setSubmesh = function(meshId, submeshInfo) {

		var result = {
			needUpdataMaterial: false,
			geometryIdToRequest: null,
			geometryPriority: 0
		};

		var submeshIds = this._NodeMeshIdSubmeshIdsMap.get(meshId);
		if (!submeshIds) {
			submeshIds = new Set();
			this._NodeMeshIdSubmeshIdsMap.set(meshId, submeshIds);
		}

		submeshIds.add(submeshInfo.id);

		if (!submeshInfo.lods) {
			return false;
		}

		var lod = null;
		for (var i = 0; i < submeshInfo.lods.length; i++) {
			if (submeshInfo.lods[ i ].type === undefined || submeshInfo.lods[ i ].type === "mesh" || submeshInfo.lods[ i ].type === "line") {
				lod = submeshInfo.lods[ i ];
			}
		}

		if (!lod) {
			return false;
		}

		var material = null;
		if (submeshInfo.materialId) {
			material = this._materials.get(submeshInfo.materialId);
			if (!material) {
				material = this._createTemporaryMaterial(submeshInfo.materialId);
				result.needUpdataMaterial = true;
			}
		}

		var submesh = null;
		var geo = this._geometries.get(lod.id);
		if (geo) {

			if (material) {
				submesh = new THREE.Mesh(geo, material);
			} else {
				submesh = new THREE.Mesh(geo);
			}

			submesh.userData.initialMaterialId = submeshInfo.materialId;
			submesh.userData.isBoundingBox = false;
			submesh.userData.geometryId = lod.id;
			submesh.userData.meshId = meshId;
			submesh.userData.submeshId = submeshInfo.id;
			submesh.userData.materialId = submeshInfo.materialId;

			if (geo.isPositionQuantized) {
				updateMeshTransformWithBoundingBox(submesh, lod.boundingBox);
			}

			UsageCounter.increaseGeometryUsed(geo);
		} else {

			result.geometryIdToRequest = lod.id;

			var innerBoxGeometry;
			try {
				var innerBoxLod = findInnerBoxLod(submeshInfo.lods);
				if (innerBoxLod && innerBoxLod.data) {
					var packedInnerBox = base64ToUint8Array(innerBoxLod.data);
					var unpacked = BBoxSubdivider.unpackSubDividedBoundingBox(packedInnerBox);
					innerBoxGeometry = BBoxSubdivider.makeSubDividedBoundingBoxGeometry(unpacked);
				}
			} catch (e) {
				// console.log(e);
			}

			var boundingBoxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);

			submesh = new THREE.Mesh(innerBoxGeometry ? innerBoxGeometry : boundingBoxGeometry, material);

			var boundingBox = lod.boundingBox;
			if (Array.isArray(boundingBox) && boundingBox.length === 6) {
				result.geometryPriority = new THREE.Vector3(boundingBox[3] - boundingBox[0], boundingBox[4] - boundingBox[1], boundingBox[5] - boundingBox[2]).length();
			} else {
				boundingBox = [ 0, 0, 0, 1, 1, 1 ];
			}

			updateMeshTransformWithBoundingBox(submesh, boundingBox);

			submesh.userData.initialMaterialId = submeshInfo.materialId;
			submesh.userData.isBoundingBox = true;
			submesh.userData.geometryId = lod.id;
			submesh.userData.meshId = meshId;
			submesh.userData.materialId = submeshInfo.materialId;
			submesh.userData.submeshId = submeshInfo.id;
		}

		submesh.userData.submeshInfo = submeshInfo;
		this._submeshes.set(submeshInfo.id, submesh);

		return result;
	};

	/**
	 * Get three.js mesh
	 * @param {any} submeshId The id of submesh
	 * @returns {THREE.Mesh} three.js mesh node
	 * @public
	 */
	SceneBuilder.prototype.getSubmesh = function(submeshId) {
		return this._submeshes.get(submeshId);
	};

	/**
	 * Create a geometry from geometry information
	 *
	 * @param {any} geoInfo The object of geometry information that have the following properties<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>id</code> : string, id of this geometry<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>isPolyline</code>: boolean, true if the submesh is polyline<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>isPositionQuantized</code>: boolean, true if the asociated submesh needs to be repositioned to bounding box centre<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>data.indices</code>: array of point index<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>data.points</code>: array of point coordinates<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>data.normals</code>: array of point normal coordinates, optional<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>data.uvs</code>: array of texture uv coordinates, optional<br/>
	 *
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setGeometry = function(geoInfo) {

		if (geoInfo.error) {
			return this;
		}

		var geometry = new THREE.BufferGeometry();
		var indexAttribute = new THREE.BufferAttribute(new Uint16Array(geoInfo.data.indices), 1);
		var positionAttribute = new THREE.BufferAttribute(new Float32Array(geoInfo.data.points), 3);

		geometry.setIndex(indexAttribute);
		geometry.addAttribute("position", positionAttribute);

		if (!geoInfo.isPolyline) {
			if (geoInfo.data.normals.length === geoInfo.data.points.length) {
				var normalAttribute = new THREE.BufferAttribute(new Float32Array(geoInfo.data.normals), 3);
				geometry.addAttribute("normal", normalAttribute);
			}

			if (geoInfo.data.uvs && geoInfo.data.uvs.length * 3 === geoInfo.data.points.length * 2) {
				geometry.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(geoInfo.data.uvs), 2));
			}
		} else {
			geometry.isPolyline = true; // debug flag
		}

		try {
			geometry.computeBoundingSphere();
		} catch (err) {
			return this;
		}

		geometry.isPositionQuantized = geoInfo.isPositionQuantized;

		if (!geometry.userData) {
			geometry.userData = {};
		}

		geometry.userData.geometryId = geoInfo.id;
		geometry.userData.geometryUsed = 0;

		this._geometries.set(geoInfo.id, geometry);

		return this;
	};

	/**
	 * Get three.js geometry
	 * @param {any} geometryId The id of geometry
	 * @returns {THREE.Geometry} three.js geometry
	 * @public
	 */
	SceneBuilder.prototype.getGeometry = function(geometryId) {
		return this._geometries.get(geometryId);
	};

	////////////////////////////////////////////////////////////////////////
	// Add a submesh to node
	SceneBuilder.prototype._insertSubmesh = function(nodeId, submeshId, sceneId) {
		this._resetCurrentScene(sceneId);
		var node = this._nodes.get(nodeId);
		var submesh = this._submeshes.get(submeshId);

		if (!node || !submesh) {
			return false;
		}

		if (submesh.parent) {
			submesh = submesh.clone();

			if (submesh.userData) {
				if (submesh.userData.submeshInfo && submesh.userData.initialMaterialId) {
					var meshMaterial = this._materials.get(submesh.userData.initialMaterialId);
					if (meshMaterial) {
						submesh.material = meshMaterial;
						UsageCounter.increaseMaterialUsed(meshMaterial);
					}
				}

				if (submesh.userData && submesh.userData.opacity) {
					delete submesh.userData.opacity;
				}
			}
		}

		node.add(submesh);
		/* if (node.renderOrder) {
			submesh.renderOrder = node.renderOrder;
			var mMaterial = this._materials.get(submesh.userData.initialMaterialId);
			if (mMaterial) {
				mMaterial.depthTest = false;
			}
		}*/

		return true;
	};

	var annotationStyles = [
		sap.ui.vk.BillboardStyle.RectangularShape,
		sap.ui.vk.BillboardStyle.CircularShape,
		sap.ui.vk.BillboardStyle.None,
		sap.ui.vk.BillboardStyle.TextGlow
	];

	var annotationCoordinateSpaces = [
		sap.ui.vk.BillboardCoordinateSpace.Viewport,
		sap.ui.vk.BillboardCoordinateSpace.Screen,
		sap.ui.vk.BillboardCoordinateSpace.World
	];

	var annotationBorderLineStyles = [
		sap.ui.vk.BillboardBorderLineStyle.None,
		sap.ui.vk.BillboardBorderLineStyle.Solid,
		sap.ui.vk.BillboardBorderLineStyle.Dash,
		sap.ui.vk.BillboardBorderLineStyle.Dot,
		sap.ui.vk.BillboardBorderLineStyle.DashDot,
		sap.ui.vk.BillboardBorderLineStyle.DashDotDot
	];

	var leaderLineMarkStyles = [
		sap.ui.vk.LeaderLineMarkStyle.None,
		sap.ui.vk.LeaderLineMarkStyle.Point,
		sap.ui.vk.LeaderLineMarkStyle.Arrow
	];

	function cssColor(color) {
		var hexColor = (((color[0] * 255) << 16) | ((color[1] * 255) << 8) | (color[2] * 255)).toString(16);
		return "#" + "000000".substring(hexColor.length) + hexColor;
	}

	////////////////////////////////////////////////////////////////////////
	// Add an annotation to a node
	SceneBuilder.prototype.createAnnotation = function(sceneId, nodeId, annotation) {
		this._resetCurrentScene(sceneId);
		var node = this._nodes.get(nodeId);
		var pos = annotation.position;
		annotation.coordinateSpace |= 0;
		var params = {
			coordinateSpace: annotationCoordinateSpaces[annotation.coordinateSpace],
			style: annotationStyles[annotation.shape || 0],
			width: annotation.width,
			height: annotation.height,
			backgroundColor: annotation.backgroundColour ? cssColor(annotation.backgroundColour) : "#fff",
			backgroundOpacity: annotation.backgroundColour ? annotation.backgroundColour[3] : 0,
			borderColor: annotation.borderColour ? cssColor(annotation.borderColour) : "#000",
			borderOpacity: annotation.borderColour ? annotation.borderColour[3] : 0,
			borderWidth: annotation.borderWidth,
			borderLineStyle: annotationBorderLineStyles[annotation.borderLineStyle]
			// horizontalAlignment: billboardHorizontalAlignments[annotation.textHorizontalAlignment]
		};

		if (annotation.fontFace) {
			params.encoding = sap.ui.vk.BillboardTextEncoding.PlainText;
			params.font = annotation.fontFace;
			params.fontSize = Math.abs(annotation.fontSize);
			params.fontWeight = Math.min(annotation.fontWeight, 900);
			// params.fontItalic = !!annotation.fontItalic;
			params.textColor = cssColor(annotation.textColour);
		} else {
			params.encoding = sap.ui.vk.BillboardTextEncoding.HtmlText;
		}

		if (annotation.coordinateSpace  < 2) {// billboard (text annotation)
			params.position = new THREE.Vector3(pos[0] * 2 - 1, pos[1] * -2 + 1, pos[2]);
			params.renderOrder = (annotation.order | 0) + 1000;
			var billboard = new Billboard(params);
			billboard.setText(annotation.text);

			node.add(billboard._node);
			// console.log("billboard", annotation.coordinateSpace, billboard, node, annotation);

			if (!this._rootNode.userData._vkBillboards) {
				this._rootNode.userData._vkBillboards = [];
			}
			this._rootNode.userData._vkBillboards.push(billboard);
		} else {// callout
			params.anchorNode = this._nodes.get(annotation.sid);
			params.position = new THREE.Vector3().fromArray(pos);
			params.depthTest = false;
			params.renderOrder = annotation.order | 0;
			var callout = new Callout(params);
			callout.setText(annotation.text);

			this._callouts.set(annotation.id, callout);

			node.add(callout._node);
			// console.log("callout", callout, node, params.anchorNode, annotation);

			if (!this._rootNode.userData._vkCallouts) {
				this._rootNode.userData._vkCallouts = [];
			}
			this._rootNode.userData._vkCallouts.push(callout);
		}
	};

	SceneBuilder.prototype.createImageNote = function(sceneId, nodeId, annotation, material) {
		this._resetCurrentScene(sceneId);
		var node = this._nodes.get(nodeId);
		// node.position.x = -node.position.x;
		// annotation.position[0] = -annotation.position[0];
		node.updateMatrix();

		var position = new THREE.Vector3().fromArray(annotation.position);
		position.x += annotation.width * 0.5;
		position.y += annotation.height * 0.5;
		position.applyMatrix4(node.matrix);

		var billboard = new Billboard({
			coordinateSpace: sap.ui.vk.BillboardCoordinateSpace.Screen,
			renderOrder: (annotation.order | 0) + 1000,
			position: position,
			width: annotation.width * 0.5 * node.matrix.elements[0],
			height: annotation.height * 0.5 * node.matrix.elements[5]
		});
		billboard.setMaterial(material);

		node.add(billboard._node);

		if (!this._rootNode.userData._vkBillboards) {
			this._rootNode.userData._vkBillboards = [];
		}
		this._rootNode.userData._vkBillboards.push(billboard);
	};

	SceneBuilder.prototype.insertLeaderLine = function(sceneId, annotationId, leaderLine) {
		var callout = this._callouts.get(annotationId);
		if (callout) {
			var vertices = [];
			for (var i = 0, l = leaderLine.points.length; i < l; i++) {
				vertices.push(new THREE.Vector3().fromArray(leaderLine.points[i]));
			}
			var anchorNode = this._nodes.get(leaderLine.startPointSid);
			callout.addLeaderLine(vertices, anchorNode, leaderLine.material,
				leaderLineMarkStyles[leaderLine.startPointHeadStyle], leaderLineMarkStyles[leaderLine.endPointHeadStyle], leaderLine.pointHeadConstant, leaderLine.extensionLength);
		}
	};

	////////////////////////////////////////////////////////////////////////
	// Decrease material and geometry counters in a node
	SceneBuilder.prototype._decrementResourceCounters = function(target) {
		target.traverse(function(child) { // Gather all geometries of node children
			if (child.isMesh) { // if child is instance of mesh then look for material and geometries

				UsageCounter.decreaseMaterialUsed(child.material);

				UsageCounter.decreaseGeometryUsed(child.geometry);
			}
		});
	};

	/**
	 * Decrease material and geometry counters in nodes
	 * This function should be called after node are deleted without using sceneBuilder "remove" function
	 *
	 * @param {any[]} nodeIds Array of node ids that are deleted
	 * @param {any} sceneId The id of scene containing the nodes
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.decrementResourceCountersForDeletedTreeNode = function(nodeIds, sceneId) {
		this._resetCurrentScene(sceneId);

		var that = this;

		nodeIds = [].concat(nodeIds);
		nodeIds.forEach(function(id) {
			var target = that._nodes.get(id); // search tree node map
			if (target) {
				that._decrementResourceCounters(target);
				that._nodes.delete(id);
			}
		});

		return this;
	};

	/**
	 * Delete array of nodes
	 *
	 * @param {any[]} nodeIds Array of ids of nodes to be deleted
	 * @param {any} sceneId The id of scene containing the nodes
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.remove = function(nodeIds, sceneId) {
		this._resetCurrentScene(sceneId);

		var that = this;

		nodeIds = [].concat(nodeIds);
		nodeIds.forEach(function(id) {
			var target = that._nodes.get(id); // search tree node map
			if (target) {
				that._decrementResourceCounters(target);
				if (target.parent) {
					// this may not have parent as application may removed it already
					// As application wants instance update on deletion, they can remove a node
					// before they get the confirmation from the server
					target.parent.remove(target);
				}
				that._nodes.delete(id);

				for (var i = 0; i < target.children.length; i++) {
					var child = target.children[i];
					if (child.userData && child.userData.treeNode && child.userData.treeNode.sid) {
						that.remove(child.userData.treeNode.sid, sceneId);
					}
				}
			}
		});

		return this;
	};

	/**
	 * Clean up unused materials and geometries
	 *
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.resourcesCleanUp = function() {
		var geoMap = this._geometries;
		geoMap.forEach(function(geo) {
			var geoCount = geo.userData.geometryUsed;
			if (geoCount <= 0) {
				geo.dispose();
			}
		});

		var matMap = this._materials;
		if (matMap) {
			matMap.forEach(function(mat) {
				var matCount = mat.userData.materialUsed;
				if (matCount <= 0) {
					mat.dispose();
				}
			});
		}

		return this;
	};

	/**
	 * Create a three.js camera from camera information
	 *
	 * @param {any} cameraInfo The object of camera information that have the following properties<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>id</code>: string, id of this camera<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>origin</code>: [ float, x, y, z ]<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>target</code>: [ float, x, y, z relative to origin ]<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>up</code>: [ float, x, y, z relative to origin ]<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>ortho</code>: bool,  true - orthographic, false - perspective<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>zoom</code>: float, zoom<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>aspect</code>: float, aspect ratio<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>near</code>: float, near Z plane, negative value for auto-evaluate<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>far</code>: float, far Z plane, negative value for auto-evaluate<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>fov</code>: float, field of view<br/>
	 *
	 * @param {any} sceneId The id of scene containing the nodes
	 *
	 * @returns {THREE.OrthographicCamera|THREE.PerspectiveCamera} The created three.js camera
	 * @public
	 */
	SceneBuilder.prototype.createCamera = function(cameraInfo, sceneId) {
		this._resetCurrentScene(sceneId);
		var camera = null;

		var camId = cameraInfo.id;
		camera = this._cameras.get(camId);

		var nativeCamera;

		if (camera) {
			nativeCamera = camera.getCameraRef();
		}

		if (!camera || !nativeCamera || (!nativeCamera.isOrthographicCamera && cameraInfo.ortho)) {
			if (cameraInfo.ortho) {
				nativeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, cameraInfo.near, cameraInfo.far);
			} else {
				nativeCamera = new THREE.PerspectiveCamera(cameraInfo.fov * 180 / Math.PI, 1, cameraInfo.near, cameraInfo.far);
			}
		}

		// update position and up
		if (cameraInfo.origin) {
			var origin = new THREE.Vector3().fromArray(cameraInfo.origin);
			nativeCamera.position.copy(origin);
		}

		if (cameraInfo.up) {
			var up = new THREE.Vector3().fromArray(cameraInfo.up).normalize();
			nativeCamera.up.copy(up);
		}

		// update target
		if (cameraInfo.target) {
			nativeCamera.lookAt((new THREE.Vector3().fromArray(cameraInfo.target)).add(nativeCamera.position));
		}

		if (cameraInfo.ortho) {
			nativeCamera.zoom = cameraInfo.zoom || 0.02;
		}

		this._rootNode.userData.camera = nativeCamera;
		// this._cameras.set(info.cameraRef, camera);

		if (nativeCamera.isOrthographicCamera) {
			camera = new OrthographicCamera();
		} else if (nativeCamera.isPerspectiveCamera) {
			camera = new PerspectiveCamera();
		}
		camera.setCameraRef(nativeCamera);

		camera.setUsingDefaultClipPlanes(true); // always use auto as specific near far always cause trouble

		if (cameraInfo.zoom === -1) {
			camera.setZoomNeedRecalculate(true);
		}

		camera.cameraInfo = cameraInfo;
		if (camId) {
			this._cameras.set(camId, camera);
		}

		return camera;
	};

	/**
	 * Attach camera to a node
	 *
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} cameraId The id of camera
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertCamera = function(nodeId, cameraId, sceneId) {
		this._resetCurrentScene(sceneId);
		var node = this._nodes.get(nodeId);
		var camera = this._cameras.get(cameraId);
		if (node && camera) {
			node.add(camera.parent ? camera.clone() : camera);
		}
		return this;
	};

	/**
	 * Get three.js camera from camera Id
	 *
	 * @param {any} cameraId The ID of camera
	 * @returns {THREE.OrthographicCamera|THREE.PerspectiveCamera} The created three.js camera
	 * @public
	 */
	SceneBuilder.prototype.getCamera = function(cameraId) {
		return this._cameras.get(cameraId);
	};

	/**
	 * Make three.js material double-sided if geometry does not have normal defined
	 *
	 * @param {any} materialId The id of material
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.updateMaterialForGeometryWithoutNormal = function(materialId) {
		var material = this._materials.get(materialId);
		if (material && material.emissive) {
			material.emissive.copy(material.color);
			material.side = THREE.DoubleSide;
		}
		return this;
	};

	/**
	 * Create a three.js material from material information
	 *
	 * @param {any} materialInfo The object of material information that have the following properties<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>id</code>: string, id of this element<br/>
									&nbsp&nbsp&nbsp&nbsp <code>name</code>: material name<br/>
									&nbsp&nbsp&nbsp&nbsp <code>ambientColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									&nbsp&nbsp&nbsp&nbsp <code>diffuseColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									&nbsp&nbsp&nbsp&nbsp <code>specularColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									&nbsp&nbsp&nbsp&nbsp <code>emissiveColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									&nbsp&nbsp&nbsp&nbsp <code>opacity</code>: float, opacity, defaults to 0, optional<br/>
									&nbsp&nbsp&nbsp&nbsp <code>glossiness</code>: float, glossiness, defaults to 0, optional<br/>
									&nbsp&nbsp&nbsp&nbsp <code>specularLevel</code>: float, specular level, defaults to 0, optional<br/>
									&nbsp&nbsp&nbsp&nbsp <code>colourMapEnabled</code>: boolean, affects modulation of some colours in material shader, defaults to false, optional<br/>
									&nbsp&nbsp&nbsp&nbsp <code>lineDashPattern</code>: [ array of floats of dash pattern, optional]<br/>
									&nbsp&nbsp&nbsp&nbsp <code>lineDashPatternScale</code> : line's dash pattern segment scale, defaults to 0, optional<br/>
									&nbsp&nbsp&nbsp&nbsp <code>lineColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
									&nbsp&nbsp&nbsp&nbsp <code>lineWidth</code>: float, line's width, defaults to 0, optional<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureDiffuse</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureBump</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureOpacity</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureReflection</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureRefraction</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureSpecular</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureAmbient</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureEmissive</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureSpecularLevel</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureGlossiness</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureAmbientOcclusion</code>:<br/>
									&nbsp&nbsp&nbsp&nbsp <code>textureDecal</code>:<br>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>imageId</code>: string - images session id, optional<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>uvChannelIndex</code>: uint32 - the Uv channel index<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>filterMode</code>: uint32: Bilinear=0, NearestNeighbour=1<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>influence</code>: float  - the influence<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>uvRotationAngle</code>: float - the Uv rotation angle<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>uvHorizontalOffset</code>: float - the Uv horizontal offset<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>uvVerticalOffset</code>: float - the Uv vertical offset<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>uvHorizontalScale</code>: float - the Uv horizontal scale<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>uvVerticalScale</code>: float - the Uv vertical scale<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>uvHorizontalTilingEnabled</code>: boolean - if the Uv horizontal tiling enabled<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>uvVerticalTilingEnabled</code>: boolean - if the Uv vertical tiling enabled<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>uvClampToBordersEnabled</code>: boolean - if the Uv clamp-to-borders enabled<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>inverted</code>: boolean  - if inverted flag is set<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>modulate</code>: boolean - false --> replace, true --> modulate<br/>
											&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <code>colourMap</code>: boolean - false --> map, true --> do not map<br/>
	 *
	 * @returns {any[]} Array of result objects, and each result contains two properties on an associated texture<br/>
	 * 						&nbsp&nbsp&nbsp&nbsp <code>textureType</code>: type of texture to be updated<br/>
							&nbsp&nbsp&nbsp&nbsp <code>imageId</code>: id of associated image that has not been created<br/>
	 * @public
	 */
	SceneBuilder.prototype.createMaterial = function(materialInfo) {

		var result = [];
		var material = this._materials.get(materialInfo.id);

		if (materialInfo.lineWidth > 0) {
			if (!material || !material.isLineBasicMaterial) {
				material = new THREE.LineBasicMaterial();
				this._materials.set(materialInfo.id, material);
			}

			material.color = new THREE.Color(materialInfo.lineColour[ 0 ], materialInfo.lineColour[ 1 ], materialInfo.lineColour[ 2 ]);
			material.depthTest = false;
			material.linewidth = materialInfo.lineWidth;
			material.userData.lineStyle = {
				width: materialInfo.lineWidth,
				haloWidth: materialInfo.lineHaloWidth || 0,
				endCapStyle: materialInfo.lineEndRound ? 1 : 0,
				dashPattern: materialInfo.lineDashPattern || [],
				dashPatternScale: materialInfo.lineDashPatternScale
			};
			material.userData.mateialInfo = materialInfo;
			material.userData.materialId = materialInfo.id;
			return result;
		}

		if (!material) {
			material = this._createTemporaryMaterial(materialInfo.id);
		}

		if (material.userData && material.userData.toBeUpdated) {
			delete material.userData.toBeUpdated;
		}

		material.userData.materialInfo = materialInfo;

		if (materialInfo.diffuseColour) {
			material.color.fromArray(materialInfo.diffuseColour);
		}

		if (materialInfo.specularColour) {
			material.specular.fromArray(materialInfo.specularColour);
		}

		var useAmbientColour = true;
		if (materialInfo.emissiveColour) {
			material.emissive.fromArray(materialInfo.emissiveColour);
			if (material.emissive.r !== 0 || material.emissive.g !== 0 || material.emissive.b !== 0) {
				useAmbientColour = false;
			}
		}

		if (useAmbientColour && materialInfo.ambientColour) { // no ambient colour in three js. use emissive for now
			material.emissive.fromArray(materialInfo.ambientColour);
			material.emissive.multiplyScalar(0.2); // vds cuts ambient colour to 0.2 before rendering
		}

		if (material.opacity !== undefined) {
			material.opacity = materialInfo.opacity;
			material.transparent = materialInfo.opacity < 1;
			if (material.transparent) {
				material.side = THREE.DoubleSide;
			}
		}

		var glossiness = material.glossiness ? material.glossiness : 0;
		var specularLevel = material.specularLevel ? material.specularLevel : 0;

		// Empirical approximation of shininess based on glosiness and specular level
		material.shininess = glossiness * 2 + specularLevel * 3;

		material.userData.defaultHighlightingEmissive = DefaultHighlightingEmissive;
		material.userData.defaultHighlightingSpecular = DefaultHighlightingSpecular;

		result = this.updateTextureMaps(materialInfo.id);

		return result;
	};

	/**
	 * Get three.js material
	 *
	 * @param {any} materialId The id of material
	 * @returns {THREE.Material} three.js material.
	 * @public
	 */
	SceneBuilder.prototype.getMaterial = function(materialId) {
		return this._materials.get(materialId);
	};

	var uint8ArrayToString = function(uint8Array) {

		var finalString = "";
		try {
			// if uint8Array is too long, stack runsout in String.fromCharCode.apply
			// so batch it in certain size
			var CHUNK_SIZE = 0x8000; // arbitrary number here, not too small, not too big
			var index = 0;
			var length = uint8Array.length;
			var slice;
			while (index < length) {
				slice = uint8Array.slice(index, Math.min(index + CHUNK_SIZE, length)); // `Math.min` is not really necessary here I think
				finalString += String.fromCharCode.apply(null, slice);
				index += CHUNK_SIZE;
			}
		} catch (e) {
			finalString = "";
			// console.log(e);
		}
		return finalString;
	};

	/**
	 * Create a three.js image from image information
	 *
	 * @param {any} imageInfo The object of image information that have the following properties<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>id</code>: string, id of this image</br>
	 *								&nbsp&nbsp&nbsp&nbsp <code>binaryData</code>: binary image data</br>
	 *
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.createImage = function(imageInfo) {

		var dv = new DataView(imageInfo.binaryData.buffer);

		var isPng = true;
		// rest is image blob
		// check jpeg magic number
		if (dv.getUint8(0, true) === parseInt("0xFF", 16) &&
			dv.getUint8(1, true) === parseInt("0xD8", 16)) {
			// you must be jpg.
			isPng = false; // currently we only support jpg and png
		}

		var imageDataStr = uint8ArrayToString(imageInfo.binaryData);

		var dataUri = "data:image/" + (isPng ? "png" : "jpeg") + ";base64," + btoa(imageDataStr);

		this._images.set(imageInfo.id, dataUri);
		return this;
	};

	var textureLoader = new THREE.TextureLoader();

	SceneBuilder.TextureType = {
		Diffuse: 0,
		Bump: 1,
		Opacity: 2,
		Reflection: 3,
		Refraction: 4,
		Specular: 5,
		Ambient: 6,
		Emissive: 7,
		SpecularLevel: 8,
		Glosiness: 9,
		AmbientOcclusion: 10,
		Decal: 11
	};

	/**
	 * Update all textures defined in a material
	 *
	 * @param {any} materialId id of material
	 * @returns {any[]} Array of result objects, and each result contains two properties on a texture<br/>
	 * 						&nbsp&nbsp&nbsp&nbsp <code>textureType</code>: type of texture to be updated<br/>
							&nbsp&nbsp&nbsp&nbsp <code>imageId</code>: id of associated image that has not been created<br/>
	 * @public
	 */
	SceneBuilder.prototype.updateTextureMaps = function(materialId) {

		var result = [];

		var material = this._materials.get(materialId);
		if (!material) {
			return result;
		}

		var materialInfo = material.userData.materialInfo;
		if (!materialInfo) {
			return result;
		}

		if (materialInfo.textureDiffuse) {
			var diffuseRes = this.updateTextureMap(materialInfo.id, SceneBuilder.TextureType.Diffuse);
			if (diffuseRes.imageId) {
				result.push(diffuseRes);
			}
		}

		if (materialInfo.textureBump) {
			var bumpRes = this.updateTextureMap(materialInfo.id, SceneBuilder.TextureType.Bump);
			if (bumpRes.imageId) {
				result.push(bumpRes);
			}
		}

		if (materialInfo.textureOpacity) {
			var opacityRes = this.updateTextureMap(materialInfo.id,  SceneBuilder.TextureType.Opacity);
			if (opacityRes.imageId) {
				result.push(opacityRes);
			}
		}

		if (materialInfo.textureEmissive) {
			var emissiveRes = this.updateTextureMap(materialInfo.id, SceneBuilder.TextureType.Emissive);
			if (emissiveRes.imageId) {
				result.push(emissiveRes);
			}
		}

		if (materialInfo.textureAmbientOcclusion) {
			var aoRes = this.updateTextureMap(materialInfo.id, SceneBuilder.TextureType.AmbientOcclusion);
			if (aoRes.imageId) {
				result.push(aoRes);
			}
		}

		if (materialInfo.textureReflection) {
			var reflectionRes = this.updateTextureMap(materialInfo.id, SceneBuilder.TextureType.Reflection);
			if (reflectionRes.imageId) {
				result.push(reflectionRes);
			}
		}

		return result;
	};

	/**
	 * Update a texture defined in a material
	 *
	 * @param {any} materialId id of material
	 * @param {any} type Texture type
	 * @returns {any[]} The result object contains two properties on the texture<br/>
	 * 						&nbsp&nbsp&nbsp&nbsp <code>textureType</code>: type of texture to be updated<br/>
							&nbsp&nbsp&nbsp&nbsp <code>imageId</code>: id of associated image that has not been created<br/>
	 * @public
	 */
	SceneBuilder.prototype.updateTextureMap = function(materialId, type) {
		var result = { textureType: type,
						imageId: null };

		var material = this._materials.get(materialId);

		if (!material) {
			return result;
		}

		var materialInfo = material.userData.materialInfo;
		if (!materialInfo) {
			return result;
		}

		var infos = null;

		switch (type) {
			case SceneBuilder.TextureType.Diffuse:
				infos = materialInfo.textureDiffuse;
				break;

			case SceneBuilder.TextureType.Bump:
				infos = materialInfo.textureBump;
				break;

			case SceneBuilder.TextureType.Opacity:
				infos = materialInfo.textureOpacity;
				break;

			case SceneBuilder.TextureType.Reflection:
				infos = materialInfo.textureReflection;
				break;

			case SceneBuilder.TextureType.Emissive:
				infos = materialInfo.textureEmissive;
				break;

			case SceneBuilder.TextureType.AmbientOcclusion:
				infos = materialInfo.textureAmbientOcclusion;
				break;
			default:
				break;
		}

		if (!infos) {
			return result;
		}

		var info = infos[0];
		var imageDataUri = this._images.get(info.imageId);

		if (!imageDataUri) {
			result.imageId = info.imageId;
			return result;
		}

		var texture = textureLoader.load(imageDataUri);

		texture.wrapS = info.uvHorizontalTilingEnabled ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
		texture.wrapT = info.uvVerticalTilingEnabled ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
		texture.magFilter = info.filterMode === 1 ? THREE.NearestFilter : THREE.LinearFilter;
		texture.minFilter = info.filterMode === 1 ? THREE.NearestFilter : THREE.LinearMipMapLinearFilter;
		texture.anisotropy = 4;

		var influence = info.influence !== undefined ? info.influence : 0;

		var repeatS = info.uvHorizontalScale !== undefined ? info.uvHorizontalScale : 1;
		var repeatT = info.uvVerticalScale !== undefined ? info.uvVerticalScale : 1;
		var offsetS = info.uvHorizontalOffset !== undefined ? info.uvHorizontalOffset : 0;
		var offsetT = info.uvVerticalOffset !== undefined ? info.uvVerticalOffset : 0;
		texture.repeat.set(repeatS, repeatT);
		texture.center.set(-offsetS, -offsetT);
		texture.offset.set(offsetS, offsetT);
		texture.rotation = -info.uvRotationAngle;

		switch (type) {
			case SceneBuilder.TextureType.Diffuse:
				// If map influence is 0 then color will not be changed but if influence is 1 then color will be white which means use 100% texture
				// Interpolate all intermediate values.
				// Turn off influence for diffuse map, needs further investigation
				// material.color.lerp(new THREE.Color(1.0, 1.0, 1.0), influence);

				material.map = texture;
				// assume it has alpha channel if it is png
				material.transparent |= imageDataUri.startsWith("data:image/png");
				break;

			case SceneBuilder.TextureType.Bump:
				material.bumpMap = texture;
				material.bumpScale = influence;
				break;

			case SceneBuilder.TextureType.Opacity:
				material.alphaMap = texture;
				break;

			case SceneBuilder.TextureType.Reflection:
				texture.mapping = THREE.SphericalReflectionMapping;
				material.envMap = texture;
				material.combine = THREE.AddOperation;
				material.reflectivity = influence;
				break;

			case SceneBuilder.TextureType.Emissive:
				material.emissiveMap = texture;
				material.emissive.setRGB(1, 1, 1);
				break;

			case SceneBuilder.TextureType.AmbientOcclusion:
				material.aoMap = texture;
				break;

			default:
				// console.log("Not implemented map type " + type);
		}

		material.userData.textureAdded = true;
		material.needsUpdate = true;
		return result;
	};

	/**
	 * Insert playback data
	 *
	 * @param {any} playbackInfo The object of playback information that have the following properties<br/>
	 *								&nbsp&nbsp&nbsp&nbsp <code>sequenceId</code>: string, id of corresponding sequence</br>
	 *								&nbsp&nbsp&nbsp&nbsp <code>playbackSpeed</code>: float, corresponding to time scale in threejs AnimationAction</br>
	 *								&nbsp&nbsp&nbsp&nbsp <code>playbackPreDelay</code>: float, time of delay before playing animation</br>
	 *								&nbsp&nbsp&nbsp&nbsp <code>playbackPostDelay</code>: float, time of delay after playing animation</br>
	 *								&nbsp&nbsp&nbsp&nbsp <code>playbackRepeat</code>: int, number of repeats of animation</br>
	 *								&nbsp&nbsp&nbsp&nbsp <code>playbackReversed</code>: bool, if track should be reversed</br>
	 *
	 * @param {string} viewId Id of view to which playback belongs to
	 *
	 * @param {string} sceneId Id of scene
	 *
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertPlayback = function(playbackInfo, viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		var playback = {
			id: playbackInfo.id,
			sequenceId: playbackInfo.sequenceId,
			playbackSpeed: playbackInfo.speed ? playbackInfo.speed : 0,
			playbackPreDelay: playbackInfo.preDelay ? playbackInfo.preDelay : 0,
			playbackPostDelay: playbackInfo.postDelay ? playbackInfo.postDelay : 0,
			playbackRepeat: playbackInfo.repeat ? Math.abs(playbackInfo.repeat) : 0,
			playbackReversed: playbackInfo.reversed ? true : false,
			isContinuity: playbackInfo.isContinuity
		};
		var view = this._views.get(viewId);
		if (view) {
			var playbacks = view.getPlaybacks();
			if (!playbacks) {
				playbacks = [];
			}
			playbacks.push(playback);
			view.setPlaybacks(playbacks);
		}
		return this;
	};

	/**
	 * Insert sequence data
	 *
	 * @param {any} info The object of sequence information
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertSequence = function(info) {
		var sequence = this._sequences.get(info.id);
		if (!sequence){
			var tracks = [];
			var animationClip = new THREE.AnimationClip(info.name, -1, tracks);
			if (!animationClip.userData){
				animationClip.userData = {};
			}
			animationClip.userData.startTime = info.startTime ? info.startTime : 0;
			animationClip.userData.endTime = info.endTime ? info.endTime : 1;
			animationClip.userData.frameRate = info.frameRate ? info.frameRate : 30;
			animationClip.userData.active = info.active ? info.active : true;
			animationClip.userData.cyclic = info.cyclic ? info.cyclic : false;
			animationClip.userData.currentTime = info.currentTime ? info.currentTime : 0;
			animationClip.userData.name = info.name ? info.name : "";
			animationClip.userData.nodesEndData = new Map();
			animationClip.userData.nodesStartData = new Map();
			animationClip.userData.nodesStartDataByViewGroupId = new Map();
			this._sequences.set(info.id, animationClip);
			if (info.nodes && info.nodes.length > 0) {
				for (var ni = 0; ni < info.nodes.length; ni++) {
					var track = info.nodes[ni];
					var data = this._trackIdSequenceNodeMap.getOrCreate(track.trackId);
					data.push({ sequenceId: info.id, targetId: track.sid, type: track.binding, pivot: track.pivot });
				}
			}
		}

		return this;
	};

	/**
	 * Insert track data
	 *
	 * @param {any[]} tracks array of the object of track information
	 *
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertTracks = function(tracks) {

		this._animationHelper.insertTracks(tracks, this._trackIdSequenceNodeMap, this._nodes, this._sequences);

		return this;
	};


	/**
	 * Finalize animation clip data, should be called after all track data have been read
	 *
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.finalizeAnimation = function() {
		var topNode = this._rootNode;
		if (topNode) {
			while (topNode.parent) {
				topNode = topNode.parent;
			}
			if (!topNode.userData) {
				topNode.userData = {};
			}
			topNode.userData.sequences = this._sequences;
			topNode.userData.tracks = this._tracks;
		}

		return this;
	};

	/**
	 * Finalize playback data, should be called after all track data have been read
	 *
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.finalizePlaybacks = function() {
		var topNode = this._rootNode;
		if (topNode) {
			while (topNode.parent) {
				topNode = topNode.parent;
			}
			if (!topNode.userData) {
				topNode.userData = {};
			}
		} else {
			return this;
		}

		if (!topNode.userData.animationNodeOriginalData) {
			topNode.userData.animationNodeOriginalData = new Map();
		}

		var viewGroup, viewGroupId;
		var values = this._viewGroups.entries();
		var next = values.next();

		while (!next.done) {
			viewGroup = next.value[1];
			viewGroupId = next.value[0];
			next = values.next();
			this._animationHelper.setInitialNodePositionsFromSubsequentViews(viewGroup, viewGroupId, this._views, this._sequences);
			// this._animationHelper.setInitialNodePositionsFromPreviousViews(viewGroup, viewGroupId, this._views, this._sequences);
			this._animationHelper.setInitialNodePositionsFromCurrenetView(viewGroup, viewGroupId, this._views, this._sequences);
		}
		return this;
	};

	 /**
	 * Finalize view group data, should be called after all views are read
	 *
	 * @param {string} sceneId Id of scene
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.finalizeViewGroups = function(sceneId) {
		this._resetCurrentScene(sceneId);
		var topNode = this._rootNode;
		if (topNode) {
			while (topNode.parent) {
				topNode = topNode.parent;
			}
			if (!topNode.userData) {
				topNode.userData = {};
			}
		} else {
			return this;
		}

		var viewportGroups = [];
		var entries = this._viewGroups.entries();
		var next = entries.next();
		while (!next.done) {
			var viewGroup = next.value[1];
			var viewGroupId = next.value[0];
			if (!viewGroup || !viewGroup.views || !viewGroup.views.length) {
				next = entries.next();
				continue;
			}
			var views = [];
			for (var vi = 0; vi < viewGroup.views.length; vi++) {
				var viewId = viewGroup.views[vi].id;
				var view = this._views.get(viewId);
				if (view && view.userData.viewInfo.thumbnailId && !view.thumbnailData) {
					var imageData = this._images.get(view.userData.viewInfo.thumbnailId);
					if (imageData) {
						view.thumbnailData = imageData;
					}
				}
				if (view) {
					view.viewGroupId = viewGroupId;
					views.push(view);
				}
			}
			var viewportGroup = {};
			viewportGroup.originalId = next.value[0];
			viewportGroup.name = viewGroup.name;
			viewportGroup.modelViews = views;
			viewportGroup.sceneId = next.value[1].sceneId;
			viewportGroups.push(viewportGroup);

			next = entries.next();
		}

		topNode.userData.viewportGroups = viewportGroups;

		return this;
	};

	/**
	 * Insert a view group
	 *
	 * @param {any} info view group information
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertViewGroup = function(info, sceneId) {
		this._resetCurrentScene(sceneId);
		this._viewGroups.set(info.id, info);
		return this;
	};

	/**
	 * get a view group - array of views
	 *
	 * @param {any} viewGroupId view group information
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {sap.ui.vk.view[]} array of views.
	 * @public
	 */
	SceneBuilder.prototype.getViewGroup = function(viewGroupId, sceneId) {
		this._resetCurrentScene(sceneId);
		var viewGroup = this._viewGroups.get(viewGroupId);
		var views = [];
		if (viewGroup && viewGroup.views) {
			for (var vi = 0; vi < viewGroup.views.length; vi++) {
				var viewId = viewGroup.views[vi].id;
				var view = this._views.get(viewId);
				if (view) {
					views.push(view);
				}
			}
		}

		return views;
	};

	/**
	 * Insert a view
	 *
	 * @param {any} viewInfo View information
	 * @param {any} sceneId The scene identifier
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertView = function(viewInfo, sceneId) {
		this._resetCurrentScene(sceneId);
		var view = new View({
			name: viewInfo.name
		});

		view.userData = {};
		view.userData.viewInfo = viewInfo;

		if (viewInfo.thumbnailId) {
			var imageData = this._images.get(view.thumbnailId);
			if (imageData) {
				view.thumbnailData = imageData;
			}
		}

		this._views.set(viewInfo.id, view);
		return this;
	};

	/**
	 * Record a highlighted node
	 *
	 * @param {any} highlightStyleId id of highlight style
	 * @param {any} nodeId id of node
	 * @param {any} viewId id of view
	 * @param {any} sceneId The scene identifier
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.recordHighlightedNodeInView = function(highlightStyleId, nodeId, viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		var view = this._views.get(viewId);
		if (!view) {
			return this;
		}

		var node = this._nodes.get(nodeId);
		if (!node) {
			return this;
		}

		if (!view.highlightIdNodesMap) {
			view.highlightIdNodesMap = new Map();
		}

		var nodes = view.highlightIdNodesMap.get(highlightStyleId);

		if (!nodes) {
			nodes = [];
		}

		nodes.push(node);
		view.highlightIdNodesMap.set(highlightStyleId, nodes);

		return this;
	};

	/**
	 * Insert highlight styles
	 *
	 * @param {any} info information of the highlight style
	 *
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertHighlightStyle = function(info) {
		var highlightStyle = this._highlightStyles.get(info.id);

		if (highlightStyle) {
			return this;
		}

		highlightStyle = info;
		this._animationHelper.addAnimationTracksToHighlight(highlightStyle);
		this._highlightStyles.set(info.id, highlightStyle);

		return this;
	};

	/**
	 * Insert highlight styles
	 *
	 * @param {any} id id of the highlight style
	 *
	 * @returns {boolean} true if exists
	 * @public
	 */
	SceneBuilder.prototype.highlightStyleExists = function(id) {
		var highlightStyle = this._highlightStyles.get(id);
		return highlightStyle !== undefined;
	};

	/**
	 * Convert highlights to animationclip in three.js
	 *
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.finalizeHighlightsInViews = function() {

		var entries = this._viewGroups.entries();
		var next = entries.next();
		while (!next.done) {
			var viewGroup = next.value[1];
			var viewGroupId = next.value[0];
			next = entries.next();
			if (!viewGroup || !viewGroup.views || !viewGroup.views.length) {
				continue;
			}

			for (var vi = 0; vi < viewGroup.views.length; vi++) {
				var viewId = viewGroup.views[vi].id;
				var view = this._views.get(viewId);

				if (view && view.highlightIdNodesMap) {
					view.highlights = [];
					var hEntries = view.highlightIdNodesMap.entries();
					var hNext = hEntries.next();
					while (!hNext.done) {
						var  highlightNodes = hNext.value[1];
						var id = hNext.value[0];
						var highlight = this._highlightStyles.get(id);
						if (highlight) {
							highlight.highlightNodes = highlightNodes;
							view.highlights.push(highlight);
						}
						hNext = hEntries.next();
					}
					this._animationHelper.processHighlights(view, viewId, this._sequences);
				}
			}

			this._animationHelper.setInitialNodePositionsFromSubsequentViews(viewGroup, viewGroupId, this._views, this._sequences, true);
			this._animationHelper.setInitialNodePositionsFromPreviousViews(viewGroup, viewGroupId, this._views, this._sequences, true);
			this._animationHelper.setInitialNodePositionsFromCurrenetView(viewGroup, viewGroupId, this._views, this._sequences, true);
		}
		return this;
	};
	/**
	 * get a view
	 *
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene
	 * @returns {sap.ui.vk.view} View
	 * @public
	 */
	SceneBuilder.prototype.getView = function(viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		return this._views.get(viewId);
	};

	/**
	 * get a sequence
	 *
	 * @param {any} sequenceId The id of sequence
	 * @returns {sap.ui.vk.view} View
	 * @public
	 */
	SceneBuilder.prototype.getSequence = function(sequenceId) {
		return this._sequences.get(sequenceId);
	};

	/**
	 * Add a camera to a view
	 *
	 * @param {any} cameraId The id of camera
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setViewCamera = function(cameraId, viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		var camera = this._cameras.get(cameraId);
		var view = this._views.get(viewId);

		if (camera && view) {
			view.camera = camera;
			var nativeCamera = camera.getCameraRef();
			if (camera.cameraInfo && nativeCamera) {

				var defaultClipPlanes = true; // as explicit near far values cause more trouble than being efficient
				// we set it to true all the time.

				var recalculateZoom = false;
				if (camera.cameraInfo.zoom === -1) {
					recalculateZoom = true;
				}

				if (nativeCamera.type === "PerspectiveCamera") {
					view.setCameraInfo({
						type: nativeCamera.type,
						fov: camera.cameraInfo.fov * 180 / Math.PI,
						position: nativeCamera.position.toArray(),
						nearClipPlane: nativeCamera.near,
						farClipPlane: nativeCamera.far,
						upDirection: nativeCamera.up.toArray(),
						targetDirection: nativeCamera.getWorldDirection().toArray(),
						usingDefaultClipPlanes: defaultClipPlanes
					});
				}

				if (nativeCamera.type === "OrthographicCamera") {
					view.setCameraInfo({
						type: nativeCamera.type,
						zoomFactor: nativeCamera.zoom,
						position: nativeCamera.position.toArray(),
						nearClipPlane: nativeCamera.near,
						farClipPlane: nativeCamera.far,
						upDirection: nativeCamera.up.toArray(),
						targetDirection: nativeCamera.getWorldDirection().toArray(),
						usingDefaultClipPlanes: defaultClipPlanes,
						zoomNeedRecalculate: recalculateZoom
					});
				}
			}
		}

		return this;
	};

	/**
	 * Add an array of node infos to a view
	 *
	 * @param {any} nodeInfos array of node info
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene
	 * @returns {sap.ui.vk.threejs.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setViewNodeInfos = function(nodeInfos, viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		var view = this._views.get(viewId);
		view.setNodeInfos(nodeInfos);

		return this;
	};

	/**
	 * Add thumbnail image data to view
	 *
	 * @param {any} imageId The id of image data
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {sap.ui.vk.view} View
	 * @public
	 */
	SceneBuilder.prototype.setViewThumbnail = function(imageId, viewId, sceneId){
		this._resetCurrentScene(sceneId);
		var view = this._views.get(viewId);
		var imageData = this._images.get(imageId);
		if (view && imageData) {
			view.thumbnailData = imageData;
		}
		return this;
	};

	/**
	 * Clear all data stored in SceneBuilder
	 *
	 * @public
	 */
	SceneBuilder.prototype.cleanup = function() {

		this._rootNode = null;

		if (this._nodes) {
			this._nodes.clear();
		}
		if (this._NodeMeshIdSubmeshIdsMap) {
			this._NodeMeshIdSubmeshIdsMap.clear();
		}

		this._submeshes.clear();
		this._callouts.clear();
		this._cameras.clear();
		this._materials.clear();
		this._images.clear();
		this._geometries.clear();

		this._currentSceneId = null;
		this._sceneIdTreeNodesMap.clear();
		this._sceneIdRootNodeMap.clear();
		this._sceneIdNodMeshIdMap.clear();

		this._sequences.clear();
		this._tracks.clear();
		this._trackIdSequenceNodeMap.clear();
		this._viewGroups.clear();
		this._views.clear();

		this._sceneIdTreeNodesMap.clear();
		this._sceneIdRootNodeMap.clear();
		this._sceneIdNodMeshIdMap.clear();
		this._sceneIdViewGroupMap.clear();
		this._sceneIdViewMap.clear();

		this._highlightStyles.clear();

		SceneBuilder._map.delete(this._id);
	};

	return SceneBuilder;
});
