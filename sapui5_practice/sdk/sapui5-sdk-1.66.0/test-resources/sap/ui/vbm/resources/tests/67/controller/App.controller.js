
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/layout/SplitterLayoutData",
	"sap/ui/model/json/JSONModel",
	"sap/ui/vbm/Adapter3D",
	"sap/ui/vbm/Viewport"
], function(Controller, SplitterLayoutData, JSONModel, Adapter3D, Viewport) {
	"use strict";
	return Controller.extend("vbm-regression.tests.67.controller.App", {

		onInit: function() {

			this.payloads = {
				methodPayload: undefined,
				eventPayload: undefined
			};

			this.model = new sap.ui.model.json.JSONModel();
			this.model.setData(this.payloads);
			sap.ui.getCore().setModel(this.model, "source");

			this.viewport2 = this.byId("viewport2");
			this.viewport2.setLayoutData(new sap.m.FlexItemData({
				baseSize: "100%"
			}));
			this.oAdapter3D = new Adapter3D({
				id: "adapter3D2",
				viewport: this.viewport2,
				submit: function(oPayload) {
					this.payloads.eventPayload = oPayload.getParameters().data;
					this.model.setData(this.payloads);
					this.byId("output").setValue(this.payloads.eventPayload);
				}.bind(this)
			});
		},


		load: function(url) {
			{
				$.ajax({
					url: url,
					dataType: "json",
					success: function(data, status, xhr) {
						try
						{
							this.payloads.methodPayload = JSON.stringify(data);
							this.model.setData(this.payloads);
							this.byId("input").setValue(this.payloads.methodPayload);
						}
						catch(ex)
						{
							alert(ex);
						}
					}.bind(this)
				});
			}
		},

		onInitialLoad: function() {
			this.load("media/threejs/Initial.json");
		},

		onTruckEurope: function() {
			this.load("media/threejs/Truck_Europe.json");
		},
	
		onContextMenu: function() {
			this.load("media/threejs/ContextMenu.json");
		},

		onResponsivePopover1: function() {
			this.load("media/threejs/ResponsivePopover1.json");
		},

		onResponsivePopover2: function() {
			this.load("media/threejs/ResponsivePopover2.json");
		},

		onResponsivePopover3: function() {
			this.load("media/threejs/ResponsivePopover3.json");
		},

		onFlyTo: function() {
			this.load("media/threejs/FlyTo.json");
		},

		onCameraChange: function(params) {
			var text = "Camera " + (this.viewport2.getCameraHistoryPos() + 1) + " of " + this.viewport2.getCameraHistoryLength();
			this.getView().byId("btnCameraStatus").setText(text);
		},

		onCameraHome: function() {
			this.viewport2.applyCameraHome(true);
		},

		onCameraPrev: function() {
			this.viewport2.setCameraHistoryPos(this.viewport2.getCameraHistoryPos() - 1);
		},

		onCameraNext: function() {
			this.viewport2.setCameraHistoryPos(this.viewport2.getCameraHistoryPos() + 1);
		},

		onLoad: function() {
			this.oAdapter3D.load(this.byId("input").getValue());
		}

	});
});
