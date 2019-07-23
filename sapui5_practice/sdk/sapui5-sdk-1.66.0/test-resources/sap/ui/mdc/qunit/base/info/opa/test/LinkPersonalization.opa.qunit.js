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
		Then.iShouldSeeColumnWithName("Product ID");
		Then.iShouldSeeColumnWithName("Category");

		Then.theCellWithTextIsOfType("Power Projector 4713", "sap.m.Link");
		Then.theCellWithTextIsOfType("Flat S", "sap.m.Link");
		Then.theCellWithTextIsOfType("1239102", "sap.m.Link");
		Then.theCellWithTextIsOfType("Laptop", "sap.m.Link");
	});

	opaTest("When I click on 'Power Projector 4713' link in the 'Name' column, popover should open with main link and with link personalization button", function(Given, When, Then) {
		When.iClickOnLink("Power Projector 4713");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Power Projector 4713"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'Flat S' link in the 'Name' column, popover should open with main link and with link personalization button", function(Given, When, Then) {
		Given.closeAllNavigationPopovers();
		When.iClickOnLink("Flat S");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Flat S"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		When.iPressOkButton();
		Then.thePersonalizationDialogShouldBeClosed();
	});

	opaTest("When I click on '1239102' link in the 'Product ID' column, popover should open with main link and with link personalization button", function(Given, When, Then) {
		Given.closeAllNavigationPopovers();
		When.iClickOnLink("1239102");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"1239102"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'Laptop' link in the 'Category' column, popover should open with main link and with link personalization button", function(Given, When, Then) {
		Given.closeAllNavigationPopovers();
		When.iClickOnLink("Laptop");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Laptop"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();

		Given.closeAllNavigationPopovers();
		Then.iTeardownMyAppFrame();
	});
});
