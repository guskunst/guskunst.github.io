// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/*global sap, jQuery */
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ushell/Config',
	'sap/ui/model/json/JSONModel'
], function (Controller, oConfig, JSONModel) {
    "use strict";

	return Controller.extend('sap.ushell.demo.AppNavSample.view.Detail', {
		oApplication: null,

		onInit: function () {
			var that = this,
				oModel = new JSONModel();
			this.oModel = oModel;
			// set the current user in the model (testing UserInfo service)
			this.getOwnerComponent().getCrossApplicationNavigationService().done(function (oCrossAppNavigator) {
				var bIsInitialNavigation = oCrossAppNavigator.isInitialNavigation(),
					oUserInfoService = sap.ushell.Container.getService("UserInfo");

				oModel.setData({
					userId: oUserInfoService.getId(),
					isInitialNavigation: bIsInitialNavigation ? "yes" : "no",
					isInitialNavigationColor: bIsInitialNavigation ? "green" : "red"
				});
				that.getView().setModel(oModel, "detailView");
			});

			this.getOwnerComponent().getService("Configuration").then( function (oService) {
				that.oEventRegistry = oService.attachSizeBehaviorUpdate(that._sizeBehaviorUpdate.bind(that));
			});
		},

		_sizeBehaviorUpdate : function (sSizeBehavior) {
			this.oModel.setProperty("/sizeBehavior", sSizeBehavior);
		},

		detachSizeBehavior : function () {
			this.oEventRegistry.detach();
		},
		attachSizeBehavior : function () {
			var that = this;
			this.getOwnerComponent().getService("Configuration").then( function (oService) {
				that.oEventRegistry = oService.attachSizeBehaviorUpdate(that._sizeBehaviorUpdate.bind(that));
			});
		},

		toggleSizeBehavior: function () {
			var oModel = this.getView().getModel("detailView"),
				sSizeBehavior = oModel.getProperty("/sizeBehavior");
			var sNewSizeBehavior = (sSizeBehavior === "Responsive" ? "Small" : "Responsive");
			oConfig.emit("/core/home/sizeBehavior", sNewSizeBehavior);
		},

		generateLinks: function () {
			this.getOwnerComponent().getRootControl().getController().generateLinks();
			this.byId("xapplist").setVisible(true);
		},
		onFlipPropertyClicked: function (oEvent) {
			var sConfig = oEvent.getSource().data().config;
			var bCurrent = oConfig.last(sConfig);
			oConfig.emit(sConfig, !bCurrent);
		}
	});
});
