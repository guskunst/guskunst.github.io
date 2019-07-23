sap.ui.define([
	"./ListMap", "./CallbackHandler", "./ProgressCounter", "./RequestCommandGenerator"
], function(ListMap, CallbackHandler, ProgressCounter, RequestCommandGenerator) {
	"use strict";

	var Phase = {
		Started: 0,
		FinishedHierarchy: 1,
		FinishedMesh: 2,
		FinishedGeometry: 3
	};

	var RetrievalType = {
		Initial: 0, // Full retrieval when the model is loaded
		Partial: 1  // Partial retrieval for updates
	};

	var SceneStateContext = function() {
		// mesh update related
		// first mesh(bounding box)
		// then geometry (blob)
		this.phase = Phase.Started;
		this.retrievalType = RetrievalType.Initial;
		this.sceneId = null;
		this.rootNodeId = null;
		this.root = null;

		this.requestCommandGenerator = new RequestCommandGenerator();

		// key of meshGroupListMap is meshIdsToRequest.
		this.meshGroupListMap = new ListMap(); // mesh id -> [... group] where group corresponds to vds mesh.

		// This is because there is no submesh in three js. we need to create group for
		// vds mesh and add submeshes which corresponds to three js mesh
		// key of boundingBoxListMap is geometryIdsToRequest
		this.boundingBoxNodeIdsListMap = new ListMap(); // geometry id -> [ ... dummy bounding boxes] .. geometry of these will be replaced when we get real geometry

		this.annotationNodeMap = new Map(); // annotation id -> [node id]

		this.materialIdNodeListMapForOpacityUpdate = new ListMap();

		// when geomtries are loaded these temporary bounding box
		// will be replaced with real geometry

		this.progressCount = new ProgressCounter();

		this.treeNodes = []; // for tree

		this.viewIdTreeNodesMap = new Map();

		this.nodeSidsForPartialTree = new Set();

		this.replacedNodes = new Map();    // existing nodes that are replaced - removed first, then reloaded

		this.updatedNodes = new Set();    // existing nodes that are updated (material, opacity)

		this.viewIds = new Set();

		this.authorizationHandler = null;

		// event related
		this.onActiveCameraCallbacks = new CallbackHandler();
		this.onInitialSceneFinishedCallbacks = new CallbackHandler();
		this.onPartialRetrievalFinishedCallbacks = new CallbackHandler();
		this.onViewPartialRetrievalFinishedCallbacks = new CallbackHandler();
		this.onSceneCompletedCallbacks = new CallbackHandler();
		this.onViewFinishedCallbacks = new CallbackHandler();
		this.onMeshFinishedCallbacks = new CallbackHandler();

		this.setOnProgressChanged = function(callback) {
			this.progressCount.setOnProgressChanged(callback);
		};

		// check if the scene is completed
		// meaning we have updated all meshes, images, geometries.
		// This function should be called after scene tree is built
		this.isSceneCompleted = function() {
			return this.meshGroupListMap.size === 0 && // check mesh
				this.boundingBoxNodeIdsListMap.size === 0;// check geometries
		};

		this.dispose = function() {
			this.sceneId = null;
			this.meshGroupListMap = null;

			this.progressCount = null;

			this.requestCommandGenerator = null;
			this.suppressedBoundingBoxListMap = null;
			this.boundingBoxNodeIdsListMap = null;

			this.treeNodes = null;

			this.nodeSidsForPartialTree = null;

			this.materialIdNodeListMapForOpacityUpdate = null;

			this.replacedNodes = null;

			this.updatedNodes = null;

			this.viewIds = null;

			this.viewIdTreeNodesMap = null;

			this.onActiveCameraCallbacks = null;
			this.onInitialSceneFinishedCallbacks = null;
			this.onPartialRetrievalFinishedCallbacks = null;
			this.onViewPartialRetrievalFinishedCallbacks = null;
			this.onSceneCompletedCallbacks = null;
			this.onViewFinishedCallbacks = null;
			this.onMeshFinishedCallbacks = null;
		};
	};

	SceneStateContext.Phase = {
		Started: 0,
		FinishedHierarchy: 1,
		FinishedMesh: 2,
		FinishedGeometry: 3
	};

	SceneStateContext.RetrievalType = {
		Initial: 0, // Full retrieval when the model is loaded
		Partial: 1  // Partial retrieval for updates
	};

	return SceneStateContext;
});
