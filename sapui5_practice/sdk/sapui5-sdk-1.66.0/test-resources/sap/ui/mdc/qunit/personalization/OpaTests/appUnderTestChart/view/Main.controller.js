sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/mdc/base/ConditionModel'
], function(
	Controller,
	ConditionModel
) {
	"use strict";

	return Controller.extend("view.Main", {
		onInit: function() {
			var oChart = this.getView().byId("IDChartOfAppUnderTestChart");
			oChart.oChartPromise.then(function(oVizChart) {
				var oCM = ConditionModel.getFor(oVizChart.getBinding("data"));
				oChart.setModel(oCM, "cmodel");
			});
		}
	});
});
