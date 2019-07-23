/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI OData service.
 * @version
 * @version@
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/UIComponent', 'sap/ui/fl/FakeLrepConnectorLocalStorage'
], function(jQuery, UIComponent, FakeLrepConnectorLocalStorage) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.base.sample.info.example_Panel.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			FakeLrepConnectorLocalStorage.enableFakeConnector();
			UIComponent.prototype.init.apply(this, arguments);
		},
		exit: function() {
			FakeLrepConnectorLocalStorage.disableFakeConnector();
		}
	});
});
