sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/base/ConditionModel"
], function(Controller, ConditionModel) {
	"use strict";

	return Controller.extend("my.VHDFilterbar2", {

		onInit: function() {},

		onBeforeRendering: function() {},

		onGo: function() {
			var oCM = this.getView().getModel("cm");
			oCM.applyFilters(true);
		}

	});
});