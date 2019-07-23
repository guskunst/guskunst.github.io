sap.ui.require([
	"sap/ui/core/ComponentContainer"

], function (
		ComponentContainer
	) {
	"use strict";

	new ComponentContainer({
		name : "sap.ui.mdc.base.sample.field",
		settings: {
			id : "fieldexample"
		},
		height: "100%"
	}).placeAt("content");

});