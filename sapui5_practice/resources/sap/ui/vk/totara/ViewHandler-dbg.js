sap.ui.define([
	"./ViewBuilder", "./CameraHandler", "./TotaraUtils"
], function(ViewBuilder, CameraHandler, TotaraUtils) {
	"use strict";

	var ViewHandler = function() {};

	ViewHandler.setViewGroup = function(state, command) {
		if (TotaraUtils.checkError(command) || !command.views) {
			return command;
		}
		var result = {};

		state.sceneBuilder.insertViewGroup(command, command.sceneId);

		var viewIds = new Set();
		var imageIds = new Set();
		var context = state.getContext(command.sceneId);
		if (!context) {
			command.error = "setViewGroup error: try to extract view group information for unmatching scene/context " + command.sceneId;
			return command;
		}

		if (!context.currentViewGroupId) {
			context.currentViewGroupId = command.id;
		}

		if (context.currentViewGroupId !== command.id) {
			return command;
		}

		for (var vi = 0; vi < command.views.length; vi++){
			var view = command.views[vi];
			var existingView = state.sceneBuilder.getView(view.id, command.sceneId);
			if (existingView) {
				continue;
			}
			context.viewIds.add(view.id);
			viewIds.add(view.id);

			if (view.thumbnailId !== undefined) {
				view.thumbnailId = view.thumbnailId.toString();
				var pair = {};
				pair.viewId = view.id;
				pair.sceneId = command.sceneId;
				state.thumbnailImageIdAndViewIdSceneIdMap.set(view.thumbnailId, pair);

				var pair1 = {};
				pair1.thumbnailImageId = view.thumbnailId;
				pair1.sceneId = command.sceneId;
				state.viewIdAndThumbnailImageIdScneIdMap.set(view.id, pair1);

				imageIds.add(view.thumbnailId);
			}

			state.viewIdSceneIdMap.set(view.id, command.sceneId);
		}

		result.context = context;
		result.viewIdSet = viewIds;
		result.imageIdSet = imageIds;
		return result;
	};

	ViewHandler.setView = function(state, view) {
		if (TotaraUtils.checkError(view)) {
			return view;
		}

		var result = {};

		if (view.sceneId) {
			var context = state.getContext(view.sceneId);
			if (!context) {
				view.error = "setView error: try to extract view information for unmatching scene/context" + view.sceneId;
				return view;
			}
			result.context = context;

			view.id = view.viewId;
			var pair = state.viewIdAndThumbnailImageIdScneIdMap.get(view.id);
			if (pair && pair.sceneId === view.sceneId) {
				view.thumbnailId = pair.thumbnailImageId;
				state.viewIdAndThumbnailImageIdScneIdMap.delete(view.id);
			}
			state.sceneBuilder.insertView(view, view.sceneId);

			var viewNodes = [];
			context.viewIdTreeNodesMap.set(view.viewId, viewNodes);

			if (view.camera) {
				CameraHandler.setCameraSingle(state, view.camera, view.sceneId);
				state.sceneBuilder.setViewCamera(view.camera.id, view.id, view.sceneId);
			}

		} else {
			result.error = "setView: no sceneId";
		}

		return result;
	};

	// View data is actually the same as tree data.
	// however, we process them slightly differently.
	// for existing tree node, we need to update it's properties (e.g) transform, visibility
	// for new tree node, we need to add
	// for missing tree node, we need to hide (or drop). Currently we are only hiding.
	// this is because the actual action is happening async as ActivateView.
	// and it does transition effect. we need them to be alive until activate view is finished.
	ViewHandler.setViewNode = function(state, command) {
		if (TotaraUtils.checkError(command)) {
			return command;
		}

		var result = {};

		if (command.sceneId) {
			var context = state.getContext(command.sceneId);
			if (!context) {
				command.error = "setViewNode error: try to extract view node information for unmatching scene/context" + command.sceneId;
				return command;
			}

			result.context = context;

			var view = state.sceneBuilder.getView(command.viewId, command.sceneId);
			if (!view) {
				result.error = "setViewNode error: setViewNode - no setView was in the chain";
				return result;
			}

			var treeNodes = context.viewIdTreeNodesMap.get(command.viewId);
			treeNodes = treeNodes.concat(command.nodes);
			context.viewIdTreeNodesMap.set(command.viewId, treeNodes);
		} else {
			result.error = "setViewNode error: no sceneId";
		}

		return result;
	};

	ViewHandler.notifyFinishedView = function(state, command) {
		var result = {};

		if (command.sceneId) {
			var context = state.getContext(command.sceneId);

			if (!context) {
				command.error = "notifyFinishedView error: try to notify finished view for unmatching scene/context";
				return command;
			}

			result.context = context;

			var view = state.sceneBuilder.getView(command.viewId, command.sceneId);
			if (!view) {
				result.error = "notifyFinishedView error: setViewNode - no setView was in the chain";
				return result;
			}

			// add three js camera if camera id is there
			// note cameraId can be zero, which is a generated camera which is not stored in service side
			if (view.activeCameraId !== undefined) {
				view.camera = state.sceneBuilder.getCamera(view.activeCameraId);
			}

			context.updatedNodes.clear();

			var viewResult = ViewBuilder.buildView(command.viewId, state, context);
			state.sceneBuilder.setViewNodeInfos(viewResult.nodeInfos, command.viewId, command.sceneId);

			result.view = view;
			result.viewId = command.viewId;
			result.sceneId = command.sceneId;
		} else {
			result.error = "notifyFinishedView error: no sceneId";
		}

		return result;
	};

	return ViewHandler;
});