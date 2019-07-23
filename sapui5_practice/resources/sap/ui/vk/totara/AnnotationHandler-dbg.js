sap.ui.define([
	"jquery.sap.global", "./TotaraUtils"
], function(jQuery, TotaraUtils) {
	"use strict";

	var AnnotationHandler = function() {};

	function insertLeaderLine(state, sceneId, annotationId, leaderLine, material) {
		leaderLine.material = material;
		state.sceneBuilder.insertLeaderLine(sceneId, annotationId, leaderLine);
	}

	AnnotationHandler.setAnnotation = function(state, command) {
		if (TotaraUtils.checkError(command)) {
			return command;
		}

		command.annotations.forEach(function(annotation) {
			var valueIterator = state.contextMap.values();
			var ci = valueIterator.next();
			while (!ci.done) {
				var context = ci.value;
				ci = valueIterator.next();

				var nodeId = context.annotationNodeMap.get(annotation.id);
				if (nodeId) {
					if (annotation.labelMaterialId) {
						var labelMaterial = state.sceneBuilder.getMaterial(annotation.labelMaterialId);
						if (labelMaterial) {
							state.sceneBuilder.createImageNote(context.sceneId, nodeId, annotation, labelMaterial);
						} else {
							var materialImageNotes = state.imageNoteMaterialIdMap.get(annotation.labelMaterialId);
							if (!materialImageNotes) {
								materialImageNotes = [];
								state.imageNoteMaterialIdMap.set(annotation.labelMaterialId, materialImageNotes);
							}
							materialImageNotes.push({
								sceneId: context.sceneId,
								nodeId: nodeId,
								annotation: annotation
							});
							state.materialIdsToRequest.add(annotation.labelMaterialId);
						}
					} else {
						state.sceneBuilder.createAnnotation(context.sceneId, nodeId, annotation);

						var leaderLines = annotation.leaderLines;
						if (leaderLines) {
							for (var i = 0, l = leaderLines.length; i < l; i++) {
								var leaderLine = leaderLines[ i ];
								var leaderLineMaterial = state.sceneBuilder.getMaterial(leaderLine.materialId);
								if (leaderLineMaterial) {
									insertLeaderLine(state, context.sceneId, annotation.id, leaderLine, leaderLineMaterial);
								} else {
									var materialLeaderLines = state.leaderLineMaterialIdMap.get(leaderLine.materialId);
									if (!materialLeaderLines) {
										materialLeaderLines = [];
										state.leaderLineMaterialIdMap.set(leaderLine.materialId, materialLeaderLines);
									}
									materialLeaderLines.push({
										sceneId: context.sceneId,
										annotationId: annotation.id,
										leaderLine: leaderLine
									});
									state.materialIdsToRequest.add(leaderLine.materialId);
								}
							}
						}
					}
				}
			}
		});
	};

	AnnotationHandler.updateMaterials = function(state, command) {
		command.materials.forEach(function(material) {
			var leaderLines = state.leaderLineMaterialIdMap.get(material.id);
			if (leaderLines) {
				state.leaderLineMaterialIdMap.delete(material.id);
				material = state.sceneBuilder.getMaterial(material.id);
				leaderLines.forEach(function(info) {
					insertLeaderLine(state, info.sceneId, info.annotationId, info.leaderLine, material);
				});
			}
			var imageNotes = state.imageNoteMaterialIdMap.get(material.id);
			if (imageNotes) {
				state.imageNoteMaterialIdMap.delete(material.id);
				material = state.sceneBuilder.getMaterial(material.id);
				imageNotes.forEach(function(info) {
					state.sceneBuilder.createImageNote(info.sceneId, info.nodeId, info.annotation, material);
				});
			}
		});
	};

	return AnnotationHandler;
});
