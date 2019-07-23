sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/library",
	"sap/suite/ui/commons/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/suite/ui/commons/imageeditor/ImageEditor"
], function (Controller, MLibrary, SuiteLibrary, Dialog, Button, ImageEditor) {
	"use strict";

	var ButtonType = MLibrary.ButtonType,
		ImageEditorMode = SuiteLibrary.ImageEditorMode;

	var oPageController = Controller.extend("sap.suite.ui.commons.sample.ImageEditorCircleCrop.ImageEditorContainer", {
		onPress: function () {
			if (!this.oDialog) {
				var that = this;

				this._oImageEditor = new ImageEditor({
						src: sap.ui.require.toUrl("sap/m/sample/") + "../../images/demo/nature/ALotOfElephants.jpg",
						loaded: this.onImageLoaded.bind(this)
					});

				this.oDialog = new Dialog({
					title: 'Circual cropping',
					content: [
						this._oImageEditor
					],
					beginButton: new Button({
						text: 'Apply crop',
						type: ButtonType.Emphasized,
						press: function () {
							var oResultImage = that.getView().byId("croppedImage");
							that._oImageEditor.applyVisibleCrop();
							oResultImage.setSrc(that._oImageEditor.getImagePngDataURL());

							this.oDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: 'Close',
						press: function () {
							this.oDialog.close();
						}.bind(this)
					})
				});
			}

			this.oDialog.open();

			if (this._oImageEditor.getLoaded()) {
				this.onImageLoaded();
			}
		},

		onImageLoaded: function() {
			this._oImageEditor.zoom(100);
			this._oImageEditor.setMode(ImageEditorMode.CropEllipse);
			this._oImageEditor.setCropAreaByRatio(1, 1);
		}
	});

	return oPageController;
});
