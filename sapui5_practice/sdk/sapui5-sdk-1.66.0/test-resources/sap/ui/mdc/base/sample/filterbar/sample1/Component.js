/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/UIComponent', 'sap/ui/fl/FakeLrepConnectorLocalStorage'
], function(jQuery, UIComponent, FakeLrepConnectorLocalStorage) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.base.sample.filterbar.sample1.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
			FakeLrepConnectorLocalStorage.enableFakeConnector();
		},
		exit: function() {
			UIComponent.prototype.exit.apply(this, arguments);
			FakeLrepConnectorLocalStorage.disableFakeConnector();
		}
	});
});
