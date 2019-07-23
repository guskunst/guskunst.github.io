sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/ui/mdc/base/ConditionModel', 'sap/m/MessageToast'
], function(Controller, ConditionModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.filterbar.Main", {

		onInit: function() {
			var oListBinding = this.getView().byId("idTable").getBinding("items");
			this.getView().setModel(ConditionModel.getFor(oListBinding), "sap.fe.cm");
		},

		onSearch: function(oEvent) {
			MessageToast.show("Filterbar started searching...");
		}
	});
});