sap.ui.define([
	'sap/ui/core/ComponentContainer'
], function(
	ComponentContainer
) {
"use strict";

	new ComponentContainer({
		name: 'applicationUnderTestIgnore',
		manifest: true,
		settings: {
			id: "applicationUnderTestIgnore"
		}
	}).placeAt('content');
});