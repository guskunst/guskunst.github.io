/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

/**
 * Initialization Code and shared classes of odata v4 phantom controls
 */
sap.ui.define([
	'sap/ui/core/util/XMLPreprocessor',
	'sap/ui/mdc/odata/v4/PhantomUtil'
],
function (XMLPreprocessor, PhantomUtil) {
	"use strict";

	var sNamespace = "sap.ui.mdc.odata.v4",
		aControls = ['Table','Form','FormContainer','Field','FilterBar','FilterField', 'Chart', 'ValueHelp'];

	// as a first version we expect that there's a fragment with exactly the namespace/name
	aControls.forEach(function(sName) {
		XMLPreprocessor.plugIn(PhantomUtil.resolve.bind(null, sNamespace + '.' + sName), sNamespace, sName);
	});

});
