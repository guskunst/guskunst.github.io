/* global QUnit */

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'sap/ui/comp/qunit/personalization/opaTests/Arrangement',
	'sap/ui/comp/qunit/personalization/opaTests/Action',
	'sap/ui/comp/qunit/personalization/opaTests/Assertion',
	'sap/ui/Device',
	'sap/m/library'
], function(
	Opa5,
	opaTest,
	Arrangement,
	Action,
	Assertion,
	Device,
	mlibrary
) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/comp");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view."
	});

	if (Device.browser.msie || Device.browser.edge) {
		Opa5.extendConfig({
			executionDelay: 50
		});
	}

	opaTest("When I press on personalization button, the personalization dialog opens", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyAppInAFrame(sap.ui.require.toUrl("sap/ui/comp/qunit/personalization/opaTests/applicationUnderTest/start.html"));

		// Assertions
		Then.theTableShouldContainColumns("sap.ui.table.AnalyticalTable", 2);
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.table.AnalyticalColumn", [
			"Name", "Category"
		]);

		//Actions
		When.iPressOnPersonalizationButton();

		// Assertions
		Then.thePersonalizationDialogOpens();
	});

	opaTest("When I press now 'Cancel' button, the dialog should close and no columns are added to the table ", function(Given, When, Then) {
		//Actions
		When.iPressCancelButton();

		// Assertions
		Then.thePersonalizationDialogShouldBeClosed();
		Then.theTableShouldContainColumns("sap.ui.table.AnalyticalTable", 2);
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.table.AnalyticalColumn", [
			"Name", "Category"
		]);
	});

	opaTest("When I open the personalization dialog and press 'OK', new columns are added to the table", function(Given, When, Then) {
		//Actions
		When.iPressOnPersonalizationButton().and.iPressOkButton();

		// Assertions
		Then.thePersonalizationDialogShouldBeClosed();
		Then.theTableShouldContainColumns("sap.ui.table.AnalyticalTable", 7);
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.table.AnalyticalColumn", [
			"Name", "Category"
		]);

		Then.iTeardownMyAppFrame();
	});
	QUnit.start();
});
