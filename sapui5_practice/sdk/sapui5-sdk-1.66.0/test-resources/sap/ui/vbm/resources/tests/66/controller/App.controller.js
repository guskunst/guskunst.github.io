
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/layout/SplitterLayoutData",
	"sap/ui/model/json/JSONModel",
	"sap/ui/vbm/Adapter3D",
	"sap/ui/vbm/Viewport"
], function(Controller, SplitterLayoutData, JSONModel, Adapter3D, Viewport) {
	"use strict";
	return Controller.extend("vbm-regression.tests.66.controller.App", {

		onInit: function() {

			this.payloads = {
				methodPayload: undefined,
				eventPayload: undefined
			};

			this.model = new sap.ui.model.json.JSONModel();
			this.model.setData(this.payloads);
			sap.ui.getCore().setModel(this.model, "source");

			var viewport1 = this.byId("viewport1");
			viewport1.setLayoutData(new sap.m.FlexItemData({
				baseSize: "100%"
			}));
			this.oAdapter3D = new Adapter3D({
				id: "adapter3D",
				viewport: viewport1,
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

		onInitialTopRightLoad: function() {
			this.load("media/threejs/InitialZoomTopRight.json");
		},

		onInitialBottomLeftLoad: function() {
			this.load("media/threejs/InitialZoomBottomLeft.json");
		},

		onTruckEurope: function() {
			this.load("media/threejs/Truck_Europe.json");
		},

		onTruckBorderColour: function() {
			this.load("media/threejs/Truck_Europe_With_Border_Colors.json");
		},
		
		onTruckUS: function() {
			this.load("media/threejs/Truck_US.json");
		},

		onContextMenu: function() {
			this.load("media/threejs/ContextMenu.json");
		},

		onEmptyTruck: function() {
			this.load("media/threejs/EmptyTruck.json");
		},

		onClearScene: function() {
			this.load("media/threejs/ClearScene.json");
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

		onLoad: function() {
			this.oAdapter3D.load(this.byId("input").getValue());
		}

	});
});

