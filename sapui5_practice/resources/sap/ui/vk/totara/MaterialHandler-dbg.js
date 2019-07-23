sap.ui.define([
	"./TotaraUtils", "./AnnotationHandler"
], function(TotaraUtils, AnnotationHandler) {
	"use strict";

	var MaterialHandler = function() {};

	MaterialHandler.setMaterial = function(state, command) {

		if (TotaraUtils.checkError(command)) {
			return command;
		}

		var materials = command.materials;

		var relatedItems = new Map();

		for (var i = 0; i < materials.length; i++) {
			var material = materials[i];
			var textureTypeImageIdPairs = state.sceneBuilder.createMaterial(material);

			var threejsMaterial = state.sceneBuilder.getMaterial(material.id);
			if (!threejsMaterial.userData) {
				threejsMaterial.userData = {};
			}

			if (!threejsMaterial.userData.idsOfImagesToRead) {
				threejsMaterial.userData.idsOfImagesToRead = new Set();
			} else {
				threejsMaterial.userData.idsOfImagesToRead.clear();

			}

			var imageIdSet = new Set();
			relatedItems.set(material.id, imageIdSet);
			if (textureTypeImageIdPairs.length) {
				for (var ai = 0; ai < textureTypeImageIdPairs.length; ai++) {
					var pair = textureTypeImageIdPairs[ai];

					var texturesToUpdate = state.texturesToUpdate;

					var textureList = texturesToUpdate.get(pair.imageId);
					if (!textureList) {
						textureList = [];
						texturesToUpdate.set(pair.imageId, textureList);
					}

					textureList.push({
						textureType: pair.textureType,
						materialId: material.id
					});

					imageIdSet.add(pair.imageId);
					threejsMaterial.userData.idsOfImagesToRead.add(pair.imageId);
				}
			}

			var valueIterator = state.contextMap.values();
			var ci = valueIterator.next();
			while (!ci.done) {
				var context = ci.value;
				ci = valueIterator.next();
				var nodeList = context.materialIdNodeListMapForOpacityUpdate.get(material.id);
				if (nodeList) {
					for (var j = 0; j < nodeList.length; j++) {
						state.sceneBuilder.applyNodeOpacityToSubmeshes(nodeList[j], context.sceneId, material.id);
					}
					context.materialIdNodeListMapForOpacityUpdate.delete(material.id);
				}
			}
			state.materialIdsRequested.delete(material.id);
		}

		AnnotationHandler.updateMaterials(state, command);

		return relatedItems;
	};

	MaterialHandler.updateTexture = function(state, imageId) {

		var texturesToUpdate = state.texturesToUpdate.get(imageId);

		if (texturesToUpdate) {
			for (var i = 0, imax = texturesToUpdate.length; i < imax; i++) {
				var item = texturesToUpdate[i];
				state.sceneBuilder.updateTextureMap(item.materialId, item.textureType);
			}
			state.texturesToUpdate.delete(imageId); // we all updated items related to this image
		}
	};

	return MaterialHandler;
});

