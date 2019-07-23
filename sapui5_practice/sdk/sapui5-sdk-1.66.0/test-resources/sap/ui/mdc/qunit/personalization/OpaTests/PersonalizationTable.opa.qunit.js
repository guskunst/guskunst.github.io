sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/personalization/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/personalization/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/personalization/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/personalization/OpaTests/utility/Assertion',
	'sap/ui/Device'
], function (Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, Device) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/mdc");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view."
	});

	//set execution delay for Internet Explorer and Edge
	if (Device.browser.msie || Device.browser.edge || Device.browser.mozilla) {
		Opa5.extendConfig({
			executionDelay: 50
		});
	}

	opaTest("When I start the 'appUnderTestTable' app, the table should appear and contain some columns", function (Given, When, Then) {

		//insert application
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/personalization/OpaTests/appUnderTestTable/TableOpaApp.html');
		Given.enableAndDeleteLrepLocalStorage();
		When.iLookAtTheScreen();

		//check icons
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Add/Remove Columns' button, the table-specific-dialog opens", function (Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.columns);

		Then.iShouldSeeItemOnPosition("Name", 0);
		Then.iShouldSeeItemWithSelection("Name", true);

		Then.iShouldSeeItemOnPosition("Year", 1);
		Then.iShouldSeeItemWithSelection("Year", true);

		Then.iShouldSeeItemOnPosition("Modified By", 2);
		Then.iShouldSeeItemWithSelection("Modified By", true);

		Then.iShouldSeeItemOnPosition("Created at", 3);
		Then.iShouldSeeItemWithSelection("Created at", true);

		Then.iShouldSeeItemOnPosition("Breakout Year", 4);
		Then.iShouldSeeItemWithSelection("Breakout Year", false);

		Then.iShouldSeeItemOnPosition("ChangedAt", 5);
		Then.iShouldSeeItemWithSelection("ChangedAt", false);

		Then.iShouldSeeItemOnPosition("City", 6);
		Then.iShouldSeeItemWithSelection("City", false);

		Then.iShouldSeeItemOnPosition("Country", 7);
		Then.iShouldSeeItemWithSelection("Country", false);

		Then.iShouldSeeItemOnPosition("CreatedBy", 8);
		Then.iShouldSeeItemWithSelection("CreatedBy", false);

		Then.iShouldSeeItemOnPosition("Region", 9);
		Then.iShouldSeeItemWithSelection("Region", false);

		Then.iShouldSeeItemOnPosition("artistUUID", 10);
		Then.iShouldSeeItemWithSelection("artistUUID", false);
	});

	opaTest("When I close the 'Add/Remove Columns' button, the table has not been changed", function (Given, When, Then) {
		sap.ui.Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : Given.closeAllPopovers();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		//check dirty flag
		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Define Sort Properties' button, sort dialog should open", function (Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.sort);

		Then.iShouldSeeItemOnPosition("Breakout Year", 0);
		Then.iShouldSeeItemWithSelection("Breakout Year", false);

		Then.iShouldSeeItemOnPosition("ChangedAt", 1);
		Then.iShouldSeeItemWithSelection("ChangedAt", false);

		Then.iShouldSeeItemOnPosition("ChangedBy", 2);
		Then.iShouldSeeItemWithSelection("ChangedBy", false);

		Then.iShouldSeeItemOnPosition("City", 3);
		Then.iShouldSeeItemWithSelection("City", false);

		Then.iShouldSeeItemOnPosition("Country", 4);
		Then.iShouldSeeItemWithSelection("Country", false);

		Then.iShouldSeeItemOnPosition("CreatedAt", 5);
		Then.iShouldSeeItemWithSelection("CreatedAt", false);

		Then.iShouldSeeItemOnPosition("CreatedBy", 6);
		Then.iShouldSeeItemWithSelection("CreatedBy", false);

		Then.iShouldSeeItemOnPosition("Founding Year", 7);
		Then.iShouldSeeItemWithSelection("Founding Year", false);

		Then.iShouldSeeItemOnPosition("Name", 8);
		Then.iShouldSeeItemWithSelection("Name", false);

		Then.iShouldSeeItemOnPosition("Region", 9);
		Then.iShouldSeeItemWithSelection("Region", false);

		Then.iShouldSeeItemOnPosition("artistUUID", 10);
		Then.iShouldSeeItemWithSelection("artistUUID", false);
	});

	opaTest("When I close the 'Define Sort Properties' button, the table has not been changed", function (Given, When, Then) {
		sap.ui.Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Back) : Given.closeAllPopovers();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		//check dirty flag
		Then.theVariantManagementIsDirty(false);
	});

	// ----------------------------------------------------------------
	// Define a new sorter
	// ----------------------------------------------------------------
	opaTest("When I press on the Checkbox to sort for Country, the chart should be changed", function (Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.sort);
		When.iSelectColumn("Country", Arrangement.P13nDialog.Titles.sort);

		Then.iShouldSeeItemOnPosition("Breakout Year", 0);
		Then.iShouldSeeItemWithSelection("Breakout Year", false);

		Then.iShouldSeeItemOnPosition("ChangedAt", 1);
		Then.iShouldSeeItemWithSelection("ChangedAt", false);

		Then.iShouldSeeItemOnPosition("ChangedBy", 2);
		Then.iShouldSeeItemWithSelection("ChangedBy", false);

		Then.iShouldSeeItemOnPosition("City", 3);
		Then.iShouldSeeItemWithSelection("City", false);

		Then.iShouldSeeItemOnPosition("Country", 4);
		Then.iShouldSeeItemWithSelection("Country", true);

		Then.iShouldSeeItemOnPosition("CreatedAt", 5);
		Then.iShouldSeeItemWithSelection("CreatedAt", false);

		Then.iShouldSeeItemOnPosition("CreatedBy", 6);
		Then.iShouldSeeItemWithSelection("CreatedBy", false);

		Then.iShouldSeeItemOnPosition("Founding Year", 7);
		Then.iShouldSeeItemWithSelection("Founding Year", false);

		Then.iShouldSeeItemOnPosition("Name", 8);
		Then.iShouldSeeItemWithSelection("Name", false);

		Then.iShouldSeeItemOnPosition("Region", 9);
		Then.iShouldSeeItemWithSelection("Region", false);

		Then.iShouldSeeItemOnPosition("artistUUID", 10);
		Then.iShouldSeeItemWithSelection("artistUUID", false);
	});

	opaTest("When I close the 'Selected Columns' button, the table has been changed", function (Given, When, Then) {
		sap.ui.Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Back) : Given.closeAllPopovers();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		//check dirty flag
		Then.theVariantManagementIsDirty(true);
	});

	// ----------------------------------------------------------------
	// Move a Column to the top
	// ----------------------------------------------------------------
	opaTest("When I select the 'Country' column and move it to the top, the table should be changed", function (Given, When, Then) {

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();
		When.iSelectColumn("Country", Arrangement.P13nDialog.Titles.columns).and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);

		Then.iShouldSeeItemOnPosition("Country", 0);
		Then.iShouldSeeItemWithSelection("Country", true);

		Then.iShouldSeeItemOnPosition("Name", 1);
		Then.iShouldSeeItemWithSelection("Name", true);

		Then.iShouldSeeItemOnPosition("Year", 2);
		Then.iShouldSeeItemWithSelection("Year", true);

		Then.iShouldSeeItemOnPosition("Modified By", 3);
		Then.iShouldSeeItemWithSelection("Modified By", true);

		Then.iShouldSeeItemOnPosition("Created at", 4);
		Then.iShouldSeeItemWithSelection("Created at", true);

		Then.iShouldSeeItemOnPosition("Breakout Year", 5);
		Then.iShouldSeeItemWithSelection("Breakout Year", false);

		Then.iShouldSeeItemOnPosition("ChangedAt", 6);
		Then.iShouldSeeItemWithSelection("ChangedAt", false);

		Then.iShouldSeeItemOnPosition("City", 7);
		Then.iShouldSeeItemWithSelection("City", false);

		Then.iShouldSeeItemOnPosition("CreatedBy", 8);
		Then.iShouldSeeItemWithSelection("CreatedBy", false);

		Then.iShouldSeeItemOnPosition("Region", 9);
		Then.iShouldSeeItemWithSelection("Region", false);

		Then.iShouldSeeItemOnPosition("artistUUID", 10);
		Then.iShouldSeeItemWithSelection("artistUUID", false);

	});

	// ----------------------------------------------------------------
	// Select two columns
	// ----------------------------------------------------------------
	opaTest("When I select two additional columns, the table should be changed", function (Given, When, Then) {
		When.iSelectColumn("Breakout Year", Arrangement.P13nDialog.Titles.columns).and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveUp);
		When.iSelectColumn("Region", Arrangement.P13nDialog.Titles.columns).and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveUp);

		Then.iShouldSeeItemOnPosition("Country", 0);
		Then.iShouldSeeItemWithSelection("Country", true);

		Then.iShouldSeeItemOnPosition("Name", 1);
		Then.iShouldSeeItemWithSelection("Name", true);

		Then.iShouldSeeItemOnPosition("Year", 2);
		Then.iShouldSeeItemWithSelection("Year", true);

		Then.iShouldSeeItemOnPosition("Modified By", 3);
		Then.iShouldSeeItemWithSelection("Modified By", true);

		Then.iShouldSeeItemOnPosition("Breakout Year", 4);
		Then.iShouldSeeItemWithSelection("Breakout Year", true);

		Then.iShouldSeeItemOnPosition("Created at", 5);
		Then.iShouldSeeItemWithSelection("Created at", true);

		Then.iShouldSeeItemOnPosition("ChangedAt", 6);
		Then.iShouldSeeItemWithSelection("ChangedAt", false);

		Then.iShouldSeeItemOnPosition("City", 7);
		Then.iShouldSeeItemWithSelection("City", false);

		Then.iShouldSeeItemOnPosition("Region", 8);
		Then.iShouldSeeItemWithSelection("Region", true);

		Then.iShouldSeeItemOnPosition("CreatedBy", 9);
		Then.iShouldSeeItemWithSelection("CreatedBy", false);

		Then.iShouldSeeItemOnPosition("artistUUID", 10);
		Then.iShouldSeeItemWithSelection("artistUUID", false);


	});

	// ----------------------------------------------------------------
	// Close the dialog
	// ----------------------------------------------------------------
	opaTest("Close the dialog", function (Given, When, Then) {
		sap.ui.Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : Given.closeAllPopovers();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();
	});

	// ----------------------------------------------------------------
	// Reopen the dialog to see if it the items have been rearranged
	// ----------------------------------------------------------------
	opaTest("Reopen the dialog to see if it the items have been rearranged", function (Give, When, Then) {
		//Reopen the dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.columns);

		Then.iShouldSeeItemOnPosition("Country", 0);
		Then.iShouldSeeItemWithSelection("Country", true);

		Then.iShouldSeeItemOnPosition("Name", 1);
		Then.iShouldSeeItemWithSelection("Name", true);

		Then.iShouldSeeItemOnPosition("Year", 2);
		Then.iShouldSeeItemWithSelection("Year", true);

		Then.iShouldSeeItemOnPosition("Modified By", 3);
		Then.iShouldSeeItemWithSelection("Modified By", true);

		Then.iShouldSeeItemOnPosition("Breakout Year", 4);
		Then.iShouldSeeItemWithSelection("Breakout Year", true);

		Then.iShouldSeeItemOnPosition("Created at", 5);
		Then.iShouldSeeItemWithSelection("Created at", true);

		Then.iShouldSeeItemOnPosition("Region", 6);
		Then.iShouldSeeItemWithSelection("Region", true);

		Then.iShouldSeeItemOnPosition("ChangedAt", 7);
		Then.iShouldSeeItemWithSelection("ChangedAt", false);

		Then.iShouldSeeItemOnPosition("City", 8);
		Then.iShouldSeeItemWithSelection("City", false);

		Then.iShouldSeeItemOnPosition("CreatedBy", 9);
		Then.iShouldSeeItemWithSelection("CreatedBy", false);

		Then.iShouldSeeItemOnPosition("artistUUID", 10);
		Then.iShouldSeeItemWithSelection("artistUUID", false);
	});
});
