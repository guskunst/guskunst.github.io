sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/core/util/MockServer',
	'sap/ui/fl/FakeLrepConnectorLocalStorage',
	'sap/chart/library' // In here as chart lib cannot be loaded in manifest due to interference with sinon - workarround
], function(
	UIComponent,
	MockServer,
	FakeLrepConnectorLocalStorage,
	chartLib // In here as chart lib cannot be loaded in manifest due to interference with sinon - workarround
) {
	"use strict";

	return UIComponent.extend("applicationUnderTestDataSuiteFormat.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			var oMockServer = new MockServer({
				rootUri: "applicationUnderTestDataSuiteFormat/"
			});
			oMockServer.simulate("mockserver/metadata.xml", "mockserver/");
			oMockServer.start();

			FakeLrepConnectorLocalStorage.enableFakeConnector();

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
