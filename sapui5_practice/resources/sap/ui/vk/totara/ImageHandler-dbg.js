sap.ui.define([
	"./MaterialHandler", "./TotaraUtils"
], function(MaterialHandler, TotaraUtils) {
	"use strict";

	var ImageHandler = function() {};

	ImageHandler.setImage = function(state, imageHeader, imageBufferUint8) {

		if (TotaraUtils.checkError(imageHeader)) {
			return imageHeader;
		}

		var result = {};

		if (!imageBufferUint8) {
			if (TotaraUtils.checkError(imageHeader)) {
				return imageHeader;
			} else {
				result.error = "no image content for " + imageHeader.id;
			}

			return result;
		}

		imageHeader.binaryData =  imageBufferUint8;

		state.sceneBuilder.createImage(imageHeader);

		var ids = state.thumbnailImageIdAndViewIdSceneIdMap.get(imageHeader.id);
		if (ids) {
			state.sceneBuilder.setViewThumbnail(imageHeader.id, ids.viewId, ids.sceneId);
			state.onViewGroupUpdatedCallbacks.execute();
		}

		// in case we have material which was missing images
		MaterialHandler.updateTexture(state, imageHeader.id);

		result.id = imageHeader.id;

		return result;
	};

	return ImageHandler;
});

