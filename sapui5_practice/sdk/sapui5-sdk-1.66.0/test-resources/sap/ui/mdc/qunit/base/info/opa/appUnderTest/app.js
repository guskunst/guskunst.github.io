sap.ui.require([
	'sap/ui/fl/FakeLrepConnectorLocalStorage', 'sap/ui/fl/FakeLrepLocalStorage', 'sap/ui/core/ComponentContainer', 'sap/m/Shell'
], function(FakeLrepConnectorLocalStorage, FakeLrepLocalStorage, ComponentContainer, Shell) {
	'use strict';

	new Shell("Shell", {
		title: "Application under test",
		app: new ComponentContainer({
			name: 'appUnderTest',
			settings: {
				id: "appUnderTest"
			},
			manifest: true
		})
	}).placeAt('content');
});
