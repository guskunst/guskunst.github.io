sap.ui.define([
	"./CameraHandler", "./TotaraUtils", "./TreeBuilder"
], function(CameraHandler, TotaraUtils, TreeBuilder) {
	"use strict";

	var TreeHandler = function() {};

	TreeHandler.setTree = function(state, command) {
		if (TotaraUtils.checkError(command)) {
			if (command.events && command.events.length) { // check if setTree has infomation about the id
				var event = command.events[ 0 ];
				if (event.values && event.values.id) {
					// setTree context carries scene veid. remove it since failed
					var relatedContext = state.getContext(event.values.id);
					command.context = relatedContext;
				}
			}
			return command;
		}

		var context = state.getContext(command.sceneId);
		if (!context) {
			command.error = "setTree error: no context for scence " + command.sceneId;
			return command;
		}

		var result = {};

		// setTree gives root node directly.
		if (command.sid) {
			var root = state.sceneBuilder.getNode(command.sid, context.sceneId);
			if (!root || root !== context.root) {
				var rootGroup = context.root;
				// make dummy tree node for root as server only gives sid
				rootGroup.userData.treeNode = {
					sid: command.sid,
					name: "root"
				};

				if (context) {
					state.sceneBuilder.setRootNode(rootGroup, command.sid, command.sceneId);
					context.rootNodeId = command.sid;
				}
			}
		}

		if (command.camera) {
			// Don't use view camera as default scene camera for the viewport.
			// This way the view camera will not change when user interacts with the viewport
			command.camera.id = "initial";
			var camera = CameraHandler.setCameraSingle(state, command.camera, command.sceneId);
			if (camera) {
				context.onActiveCameraCallbacks.execute(camera);
			}
		}

		return result;
	};

	TreeHandler.setTreeNode = function(state, command) {
		if (TotaraUtils.checkError(command)) {
			return command;
		}

		var result = {};

		if (!command.sceneId) {
			result.error = "setTreeNode error: no sceneId";
		}

		var context = state.getContext(command.sceneId);
		if (!context) {
			result.error = "setTreeNode error: no loading context for scene " + command.sceneId;
			return result;
		}

		context.treeNodes = context.treeNodes.concat(command.nodes);

		return result;
	};

	TreeHandler.notifyFinishedTree = function(state, command) {
		var result = {};

		if (TotaraUtils.checkError(command)) {
			return command;
		}

		if (command.sceneId) {
			result.context = state.getContext(command.sceneId);
			if (!result.context) {
				result.error = "notifyFinishedTree error: no loading context for scene " + command.sceneId;
			} else {
				TreeBuilder.buildTree(state, result.context);
			}
		} else {
			result.error = "notifyFinishedTree error: no sceneId";
		}

		return result;
	};

	return TreeHandler;
});

