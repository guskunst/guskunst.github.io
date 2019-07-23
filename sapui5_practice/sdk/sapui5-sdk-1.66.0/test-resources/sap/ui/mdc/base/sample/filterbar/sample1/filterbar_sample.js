sap.ui.require(["sap/ui/core/ComponentContainer"],
	function(ComponentContainer) {
	"use strict";


	sap.ui.getCore().attachInit(function () {

		new ComponentContainer("TestContainer", {
			name: "sap.ui.mdc.base.sample.filterbar.sample1",
			settings: {
				id: "sap.ui.mdc.base.sample.filterbar.sample1"
			},
			height: "100%"
		}).placeAt("contentFB");
	});

});