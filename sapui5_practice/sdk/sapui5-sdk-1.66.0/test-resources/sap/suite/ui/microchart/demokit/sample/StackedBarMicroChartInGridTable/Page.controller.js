sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	],
	function (MessageToast, Controller, JSONModel) {
		"use strict";

		var PageController = Controller.extend("sap.suite.ui.microchart.sample.StackedBarMicroChartInGridTable.Page", {
			onInit: function() {
				var sPath = jQuery.sap.getModulePath("sap.suite.ui.microchart.sample.StackedBarMicroChartInGridTable", "/SampleData.json");
				this.oModel = new JSONModel(sPath);
				this.getView().setModel(this.oModel);
			},
			press: function (oEvent) {
				MessageToast.show("The stacked bar micro chart is pressed.");
			}
		});

		return PageController;

	});
