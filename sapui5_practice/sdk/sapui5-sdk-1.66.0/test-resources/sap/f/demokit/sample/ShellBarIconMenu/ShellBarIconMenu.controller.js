sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller"
], function (MessageToast, Controller) {
	"use strict";

	return Controller.extend("sap.f.sample.ShellBarIconMenu.ShellBarIconMenu", {
		handleHomeIconPress: function(oEvent) {
			MessageToast.show("Home icon pressed");
		}
	});
});