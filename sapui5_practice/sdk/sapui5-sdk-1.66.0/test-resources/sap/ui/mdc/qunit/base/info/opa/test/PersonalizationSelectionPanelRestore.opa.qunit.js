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
		Then.iShouldSeeColumnWithName("Name");
		Then.theCellWithTextIsOfType("Gladiator MX", "sap.m.Link");
	});

	// ------------------------------------------------------
	// Test: select an item and restore
	// ------------------------------------------------------
	opaTest("When I click on 'Gladiator MX' link in the 'Name' column, popover should open with main link", function(Given, When, Then) {
		When.iClickOnLink("Gladiator MX");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Gladiator MX"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});
	opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("Name Link2 (Superior)", 0);
		Then.iShouldSeeLinkItemWithSelection("Name Link2 (Superior)", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link2 (Superior)", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link3", 1);
		Then.iShouldSeeLinkItemWithSelection("Name Link3", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link3", true);

		// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
		// Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
	});
	opaTest("When I select the 'Name Link2 (Superior)' item, the 'Restore' button should be enabled", function(Given, When, Then) {
		When.iSelectLink("Name Link2 (Superior)");

		Then.iShouldSeeLinkItemOnPosition("Name Link2 (Superior)", 0);
		Then.iShouldSeeLinkItemWithSelection("Name Link2 (Superior)", true);
		Then.iShouldSeeLinkItemAsEnabled("Name Link2 (Superior)", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link3", 1);
		Then.iShouldSeeLinkItemWithSelection("Name Link3", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link3", true);

		// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
		// Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});
	opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Gladiator MX", "Name Link2 (Superior)"
		]);
	});
	opaTest("When I click on 'Flat Medium' link in the 'Name' column, popover should open", function(Given, When, Then) {
		Given.closeAllNavigationPopovers();
		When.iClickOnLink("Flat Medium");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Flat Medium", "Name Link2 (Superior)"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});
	opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("Name Link2 (Superior)", 0);
		Then.iShouldSeeLinkItemWithSelection("Name Link2 (Superior)", true);
		Then.iShouldSeeLinkItemAsEnabled("Name Link2 (Superior)", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link3", 1);
		Then.iShouldSeeLinkItemWithSelection("Name Link3", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link3", true);

		// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
		// Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
		Given.closeAllNavigationPopovers();
		Then.iTeardownMyAppFrame();
	});
	// opaTest("When I press 'Restore' and then 'OK' button, popover should show previous link selection again", function(Given, When, Then) {
	// 	When.iPressRestoreButton();
	// 	When.iPressOkButton();
	//
	// 	Then.thePersonalizationDialogShouldBeClosed();
	// 	Then.iShouldSeeNavigationPopoverOpens();
	// 	Then.iShouldSeeOrderedLinksOnNavigationContainer([
	// 		"Flat Medium"
	// 	]);
	// 	Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	// });
	// opaTest("When I click on 'Gladiator MX' link in the 'Name' column, popover should open with main link", function(Given, When, Then) {
	// 	Given.closeAllNavigationPopovers();
	// 	When.iClickOnLink("Gladiator MX");
	//
	// 	Then.iShouldSeeNavigationPopoverOpens();
	// Then.iShouldSeeOrderedLinksOnNavigationContainer([
	// 	"Gladiator MX"
	// ]);
	// 	Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	// });
	// opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
	// 	When.iPressOnLinkPersonalizationButton();
	// 	Then.thePersonalizationDialogOpens();
	// });
	// opaTest("When I set all links as invisible, the links shown on popover before are not changed", function(Given, When, Then) {
	// 	When.iSelectLink("Name Link2 (Superior)");
	// 	When.iPressRestoreButton();
	// 	When.iPressOkButton();
	//
	// 	Then.thePersonalizationDialogShouldBeClosed();
	// 	Then.iShouldSeeNavigationPopoverOpens();
	// 	Then.iShouldSeeOrderedLinksOnNavigationContainer([
	// 		"Gladiator MX"
	// 	]);
	// 	Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	//
	// 	Given.closeAllNavigationPopovers();
	// 	Then.iTeardownMyAppFrame();
	// });
});
