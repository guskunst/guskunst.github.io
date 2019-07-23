sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/core/util/MockServer',
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/FakeLrepLocalStorage"
], function(
	UIComponent,
	MockServer,
	FakeLrepConnectorLocalStorage,
	FakeLrepLocalStorage
) {
	"use strict";

	return UIComponent.extend("appUnderTestDescriptionSortedById.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			var oMockServer = new MockServer({
				rootUri: "appUnderTestDescriptionSortedById/"
			});
			oMockServer.simulate("mockserver/metadata.xml", "mockserver/");
			oMockServer.start();

			// Init LRep for VariantManagement (we have to fake the connection to LRep in order to be independent from backend)
			FakeLrepConnectorLocalStorage.enableFakeConnector();
			FakeLrepLocalStorage.deleteChanges();

			// call the base component's init function and create the App view
			UIComponent.prototype.init.apply(this, arguments);
		},

		destroy: function() {
			this.oMockServer.stop();
			FakeLrepConnectorLocalStorage.disableFakeConnector();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});
