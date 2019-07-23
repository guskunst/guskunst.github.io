sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/base/ConditionModel"
], function(Controller, ConditionModel) {
	"use strict";

	return Controller.extend("my.VHDFilterbar", {

		onInit: function() {},

		onBeforeRendering: function() {
			// var oFilterField = this.getView().getModel("cm").getFilterField();
			//this.sFieldPath = oFilterField.getFieldPath();

			if (!this.oListBinding) {
				// var oTable = this.getView().getParent().getContent()[1].getContent()[0];
				// this.oListBinding = oTable.getBinding("rows");

				// var oCM = sap.ui.mdc.base.ConditionModel.getFor(this.oListBinding);
				// this.getView().setModel(oCM, "cm");
				// oCM.applyFilters(true);
			}
		},

		onGo: function() {
			var oCM = this.getView().getModel("cm");
			oCM.applyFilters(true);
		}

	});
});