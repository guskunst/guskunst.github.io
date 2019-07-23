/* global hasher */
sap.ui.define([
	"sap/fe/AppComponent",
	"local/mockServerHelper"
], function (AppComponent, MockServerHelper) {
    "use strict";

    return AppComponent.extend("music.Component", {
		metadata: {
			"manifest": "json"
		}
	});
});