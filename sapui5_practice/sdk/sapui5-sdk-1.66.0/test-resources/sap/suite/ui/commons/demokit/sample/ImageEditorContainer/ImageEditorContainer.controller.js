sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/library",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/ui/unified/FileUploader"
], function (Controller, mLibrary, ToolbarSpacer, Button, MessageToast, FileUploader) {
	"use strict";

	var ButtonType = mLibrary.ButtonType;

	var oPageController = Controller.extend("sap.suite.ui.commons.sample.ImageEditorContainer.ImageEditorContainer", {
		onInit: function () {
			var oImageEditorContainer = this.getView().byId("editor"),
				oImageEditor = this.getView().byId("image"),
				oToolbar = oImageEditorContainer.getToolbar(),
				oToolbarIds = oImageEditorContainer.getToolbarIds(),
				oTransformButton = sap.ui.getCore().byId(oToolbarIds.transform),
				oButton, oFileUploader;

			// place transform button to different positon
			oToolbar.removeContent(oTransformButton);
			oToolbar.insertContent(oTransformButton, 3);

			oFileUploader = new FileUploader({
				change: this.onFileChange.bind(this)
			});

			// add new custom button
			oButton = new Button({
				text: "Custom Button",
				type: ButtonType.Emphasized,
				press: this.onButtonPress.bind(this)
			});

			oToolbar.addContent(new ToolbarSpacer());
			oToolbar.addContent(oButton);
			oToolbar.addContent(oFileUploader);

			oImageEditor.setSrc(
				sap.ui.require.toUrl("sap/m/sample/") + "../../images/demo/nature/ALotOfElephants.jpg"
			);
		},

		onButtonPress: function() {
			MessageToast.show("Custom button pressed!");
		},

		onFileChange: function(oEvent) {
			var oFile = oEvent.getParameter("files")[0],
				oUrl = window.URL,
				oImageEditor = this.getView().byId("image");

			if (!oFile) {
				return;
			}

			var sSrc = oUrl.createObjectURL(oFile);
			oImageEditor.setSrc(sSrc);
			oUrl.revokeObjectURL(oFile);
		}
	});

	return oPageController;
});
