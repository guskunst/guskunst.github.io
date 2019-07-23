
sap.ui.define([
	"./Generator", "./Coder", "./Commands"
], function(Generator, Coder, Commands) {
	"use strict";

	var RequestCommandGenerator = function() {

		var meshBatchSize = 128;
		var annotationBatchSize = 128;
		var materialBatchSize = 128;
		var sequenceBatchSize = 128;
		var trackBatchSize = 128;
		var geometryBatchSize = 32;

		var meshIdSet;
		var materialIdSet;
		var imageIdSet;
		var geometryIdArray;
		var geometryPriorityMap;
		var annotationIdArray;
		var trackIdSet;
		var sequenceIdSet;
		var viewIdSet;
		var sceneId; // null if the generator is for state, a valid value for context
		var context;
		var highlightStyleIdSet;

		this.init = function() {
			meshIdSet = new Set();
			materialIdSet = new Set();
			imageIdSet = new Set();
			geometryPriorityMap = new Map();
			geometryIdArray = [];
			annotationIdArray = [];
			trackIdSet = new Set();
			sequenceIdSet = new Set();
			viewIdSet = new Set();
			sceneId = null;
			context = null;
			highlightStyleIdSet = new Set();
		};

		this.init();

		this.setSceneIdAndContext = function(id, con) {
			sceneId = id;
			context = con;
		};

		this.pushMeshIds = function(idSet) {
			mergeSet(meshIdSet, idSet);
		};

		this.pushMaterialIds = function(idSet) {
			mergeSet(materialIdSet, idSet);
		};

		this.pushImageIds = function(idSet) {
			mergeSet(imageIdSet, idSet);
		};

		this.pushHighlightStyleIds = function(idSet) {
			mergeSet(highlightStyleIdSet, idSet);
		};

		this.pushGeometryIds = function(geometryIdMap) {
			geometryIdMap.forEach(function(priority, id) {
				geometryPriorityMap.set(id, priority);
				geometryIdArray.push(id);
			});

			geometryIdArray.sort(function(a, b) {
				return geometryPriorityMap.get(a) - geometryPriorityMap.get(b);
			});
		};

		this.pushAnnotationIds = function(idArray) {
			annotationIdArray = annotationIdArray.concat(idArray);
		};

		this.pushTrackIds = function(idSet) {
			mergeSet(trackIdSet, idSet);
		};

		this.pushSequenceIds = function(idSet, sceneId) {
			mergeSet(sequenceIdSet, idSet);
		};

		this.pushViewIds = function(idSet, sceneId) {
			mergeSet(viewIdSet, idSet);
		};

		this.canGenerateCommand = function() {
			return meshIdSet.size > 0 || materialIdSet.size > 0 || imageIdSet.size > 0 || geometryIdArray.length > 0 || trackIdSet.size > 0 || sequenceIdSet.size > 0 || viewIdSet.size > 0;
		};

		this.clearContent = function() {
			meshIdSet.clear();
			materialIdSet.clear();
			imageIdSet.clear();
			geometryIdArray = [];
			trackIdSet.clear();
			sequenceIdSet.clear();
			viewIdSet.clear();
			highlightStyleIdSet.clear();
		};

		this.generateRequestCommand = function(doNotEncode, token) {

			// mesh -> material -> image -> geometry order
			var ids;
			var command, commandInStr;

			if (meshIdSet.size > 0) {
				ids = sliceOneBatchFromSet(meshIdSet, meshBatchSize);
				command = Generator.createGetContentCommand(Commands.getMesh, ids, token);
			} else if (annotationIdArray.length > 0) {
				ids = annotationIdArray.splice(0, annotationBatchSize);
				command = Generator.createGetContentCommand(Commands.getAnnotation, ids, token, sceneId);
			} else if (materialIdSet.size > 0) {
				ids = sliceOneBatchFromSet(materialIdSet, materialBatchSize);
				command = Generator.createGetContentCommand(Commands.getMaterial, ids, token);
			} else if (geometryIdArray.length > 0) {
				ids = geometryIdArray.splice(geometryIdArray.length - geometryBatchSize);
				command = Generator.createGetContentCommand(Commands.getGeometry, ids, token);
				command.resources = ids;
				ids.forEach(function(id) { geometryPriorityMap.delete(id); }); // remove geometry ids from geometryPriorityMap
			} else if (imageIdSet.size > 0) {
				ids = sliceOneBatchFromSet(imageIdSet, 1);
				command = Generator.createGetContentCommand(Commands.getImage, ids, token);
				command.resources = ids;
			}else if (highlightStyleIdSet.size > 0) {
				ids = sliceOneBatchFromSet(highlightStyleIdSet, 1);
				var option = { id: ids[0] };
				if (token) {
					option.token = token;
				}
				commandInStr = Generator.createGetHighlightStyleCommand(option);
				command = { command : commandInStr, method : Commands.getHighlightStyle };
			}else if (sequenceIdSet.size > 0) {
				ids = sliceOneBatchFromSet(sequenceIdSet, sequenceBatchSize);
				command = Generator.createRequestContentCommandWtihScenId(Commands.getSequence, ids, sceneId, token);
			} else if (trackIdSet.size > 0) {
				ids = sliceOneBatchFromSet(trackIdSet, trackBatchSize);
				command = Generator.createGetContentCommand(Commands.getTrack, ids, token);
			} else if (viewIdSet.size > 0) {
				var it = viewIdSet.values(), id = it.next().value;
				if (id != undefined) {
					var includeHidden = context.includeHidden !== undefined ? context.includeHidden : false; // not include hidden by default
					var includeAnimation = context.includeAnimation !== undefined ? context.includeAnimation : true; // include animation by default

					var options = {
							sceneId: sceneId,
							id: id,
							token: token,
							includeHidden: includeHidden,
							includeAnimation: includeAnimation,
							groupId: context.currentViewGroupId
					};

					commandInStr = Generator.createGetViewCommand(options);
					command = { command : commandInStr, method : Commands.getView };
					viewIdSet.delete(id);
				}
			}

			if (command) {
				if (!doNotEncode) {
					command.command = Coder.encode(command.command);
				}

				return command;
			}

			return null;
		};

		function mergeSet(destSet, srcSet) {
			srcSet.forEach(function(id) {
				destSet.add(id);
			});
		}

		function sliceOneBatchFromSet(idSet, batchSize) {
			var batch = [];
			for (var it = idSet.values(), id = it.next().value; id != undefined && batch.length < batchSize; id = it.next().value) {
				batch.push(id);
				idSet.delete(id);
			}
			return batch;
		}
	};

	return RequestCommandGenerator;
});

