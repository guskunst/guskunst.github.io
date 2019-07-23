sap.ui.require([
	'sap/ui/fl/FakeLrepConnectorLocalStorage', 'sap/ui/fl/FakeLrepLocalStorage', 'sap/ui/core/ComponentContainer', 'sap/m/Shell'

], function(FakeLrepConnectorLocalStorage, FakeLrepLocalStorage, ComponentContainer, Shell) {
	'use strict';

	// Init LRep (we have to fake the connection to LRep in order to be independent from backend)
	FakeLrepConnectorLocalStorage.enableFakeConnector();
	FakeLrepLocalStorage.deleteChanges();

	new Shell("Shell", {
		title: "Application under test",
		app: new ComponentContainer({
			name: 'appUnderTestContactAnnotation',
			settings: {
				id: "appUnderTestContactAnnotation"
			},
			manifest: true
		})
	}).placeAt('content');
});
