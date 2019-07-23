/* globals opaTest */

sap.ui.require([
	'sap/ui/test/Opa5', 'sap/ui/test/opaQunit', 'sap/ui/mdc/qunit/base/info/opa/test/Arrangement', 'sap/ui/mdc/qunit/base/info/opa/test/Action', 'sap/ui/mdc/qunit/base/info/opa/test/Assertion'
], function(Opa5, opaQunit, Arrangement, Action, Assertion) {
	'use strict';

	if (window.blanket) {
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view.",
		autoWait: true
	});

	opaTest("When I look at the screen of appUnderTest, a table with links should appear", function(Given, When, Then) {
		Given.iStartMyAppInAFrame('../appUnderTest/start.html');
		Given.iEnableTheLocalLRep();
		Given.iClearTheLocalStorageFromRtaRestart();

		Then.iShouldSeeStartRtaButton();
		Then.iShouldSeeVisibleColumnsInOrder("sap.m.Column", [
			"Name", "Product ID", "Category"
		]);

		Then.iShouldSeeColumnWithName("Category");
		Then.iShouldSeeColumnWithName("Product ID");

		Then.theCellWithTextIsOfType("1239102", "sap.m.Link");
		Then.theCellWithTextIsOfType("977700-11", "sap.m.Link");
		Then.theCellWithTextIsOfType("Projector", "sap.m.Link");
	});

	// ------------------------------------------------------
	// Test: select an item for one link and check that this item is shown also for another link
	// ------------------------------------------------------
	opaTest("When I click on '1239102' link in the 'Product ID' column, popover should open with main link", function(Given, When, Then) {
		When.iClickOnLink("1239102");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"1239102"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});
	opaTest("When I click on 'More Links' button, the selection dialog opens with disabled 'Restore' button", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();

		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("Review Description", 0);
		Then.iShouldSeeLinkItemWithSelection("Review Description", false);
		Then.iShouldSeeLinkItemAsEnabled("Review Description", true);

		Then.iShouldSeeLinkItemOnPosition("Edit Description", 1);
		Then.iShouldSeeLinkItemWithSelection("Edit Description", false);
		Then.iShouldSeeLinkItemAsEnabled("Edit Description", true);

		// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
		// Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
	});
	opaTest("When I select the 'Edit Description' item, the 'Restore' button should be enabled", function(Given, When, Then) {
		When.iSelectLink("Edit Description");

		Then.iShouldSeeLinkItemOnPosition("Review Description", 0);
		Then.iShouldSeeLinkItemWithSelection("Review Description", false);
		Then.iShouldSeeLinkItemAsEnabled("Review Description", true);

		Then.iShouldSeeLinkItemOnPosition("Edit Description", 1);
		Then.iShouldSeeLinkItemWithSelection("Edit Description", true);
		Then.iShouldSeeLinkItemAsEnabled("Edit Description", true);

		// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
		// Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});
	opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"1239102", "Edit Description"
		]);
	});
	opaTest("When I click on '977700-11' link in the 'Product ID' column, popover should open with main link and 'Edit Description'", function(Given, When, Then) {
		Given.closeAllNavigationPopovers();
		When.iClickOnLink("977700-11");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"977700-11", "Edit Description"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});
	opaTest("When I click on 'More Links' button, the selection dialog opens with disabled 'Restore' button", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();

		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("Review Description", 0);
		Then.iShouldSeeLinkItemWithSelection("Review Description", false);
		Then.iShouldSeeLinkItemAsEnabled("Review Description", true);

		Then.iShouldSeeLinkItemOnPosition("Edit Description", 1);
		Then.iShouldSeeLinkItemWithSelection("Edit Description", true);
		Then.iShouldSeeLinkItemAsEnabled("Edit Description", true);

		// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
		// Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});
	opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"977700-11", "Edit Description"
		]);

		Then.iTeardownMyAppFrame();
	});
});
