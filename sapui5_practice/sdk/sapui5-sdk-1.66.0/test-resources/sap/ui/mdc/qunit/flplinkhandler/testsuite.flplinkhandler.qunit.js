sap.ui.define(function() {

	"use strict";

	return {
		name: "Library 'sap.ui.mdc' - Testsuite FLpLinkHandler",	/* Just for a nice title on the pages */
		defaults: {
			group: "FLpLinkHandler",
			qunit: {
				version: 2					// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.mdc"],		// Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only:	"[sap/ui/mdc]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			"ContactDetails": {
				title: "ContactDetails",
				page: "test-resources/sap/ui/mdc/qunit/base/info/ContactDetails.qunit.html" // TBD: use teststarter if possible
			},
			"ContentHandler": {
				title: "ContentHandler",
				page: "test-resources/sap/ui/mdc/qunit/base/info/ContentHandler.qunit.html" // TBD: use teststarter if possible
			},
			"Panel": {
				title: "Panel",
				page: "test-resources/sap/ui/mdc/qunit/base/info/Panel.qunit.html" // TBD: use teststarter if possible
			},

			"FieldInfoBase": {
				title: "FieldInfoBase",
				page: "test-resources/sap/ui/mdc/qunit/base/FieldInfoBase.qunit.html" // TBD: use teststarter if possible
			},
			"FieldInfo": {
				title: "FieldInfo",
				page: "test-resources/sap/ui/mdc/qunit/base/FieldInfo.qunit.html" // TBD: use teststarter if possible
			},

			"FlpLinkHandler": {
				title: "FlpLinkHandler",
				page: "test-resources/sap/ui/mdc/qunit/flplinkhandler/FlpLinkHandler.qunit.html" // TBD: use teststarter if possible
			},

			"LinkContactAnnotation": {
				title: "LinkContactAnnotation",
				page: "test-resources/sap/ui/mdc/qunit/base/info/opa/test/LinkContactAnnotation.opa.qunit.html" // TBD: use teststarter if possible
			},
			"LinkPersonalization": {
				title: "LinkPersonalization",
				page: "test-resources/sap/ui/mdc/qunit/base/info/opa/test/LinkPersonalization.opa.qunit.html" // TBD: use teststarter if possible
			},
			"PersonalizationSelectionPanel00": {
				title: "PersonalizationSelectionPanel00",
				page: "test-resources/sap/ui/mdc/qunit/base/info/opa/test/PersonalizationSelectionPanel00.opa.qunit.html" // TBD: use teststarter if possible
			},
			"PersonalizationSelectionPanel01": {
				title: "PersonalizationSelectionPanel01",
				page: "test-resources/sap/ui/mdc/qunit/base/info/opa/test/PersonalizationSelectionPanel01.opa.qunit.html" // TBD: use teststarter if possible
			},
			"PersonalizationSelectionPanel02": {
				title: "PersonalizationSelectionPanel02",
				page: "test-resources/sap/ui/mdc/qunit/base/info/opa/test/PersonalizationSelectionPanel02.opa.qunit.html" // TBD: use teststarter if possible
			},
			"PersonalizationSelectionPanelEndUser": {
				title: "PersonalizationSelectionPanelEndUser",
				page: "test-resources/sap/ui/mdc/qunit/base/info/opa/test/PersonalizationSelectionPanelEndUser.opa.qunit.html" // TBD: use teststarter if possible
			},
			"PersonalizationSelectionPanelKeyUser": {
				title: "PersonalizationSelectionPanelKeyUser",
				page: "test-resources/sap/ui/mdc/qunit/base/info/opa/test/PersonalizationSelectionPanelKeyUser.opa.qunit.html" // TBD: use teststarter if possible
			},
			"PersonalizationSelectionPanelRestore": {
				title: "PersonalizationSelectionPanelRestore",
				page: "test-resources/sap/ui/mdc/qunit/base/info/opa/test/PersonalizationSelectionPanelRestore.opa.qunit.html" // TBD: use teststarter if possible
			}
		}
	};

});