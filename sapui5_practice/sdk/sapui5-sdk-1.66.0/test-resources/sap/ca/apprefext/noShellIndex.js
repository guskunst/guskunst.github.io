/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";
	sap.ui.getCore().attachInitEvent(function () {
		new ComponentContainer({
			height : "100%",
			name:"i2d.qm.qualityissue.confirm.apprefExt"
		}).placeAt("content");
	});
});
