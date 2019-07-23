sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/fl/FakeLrepConnectorLocalStorage',
	'sap/ui/fl/FakeLrepLocalStorage',
	'sap/ui/core/util/MockServer'
], function(
	UIComponent,
	FakeLrepConnectorLocalStorage,
	FakeLrepLocalStorage,
	MockServer
) {
	"use strict";

	return UIComponent.extend("applicationUnderTestIgnore.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			this.oMockServer = new MockServer({
				rootUri: "applicationUnderTestIgnore/"
			});
			this.oMockServer.simulate("mockserver/metadata.xml", "mockserver/");
			this.oMockServer.start();

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
