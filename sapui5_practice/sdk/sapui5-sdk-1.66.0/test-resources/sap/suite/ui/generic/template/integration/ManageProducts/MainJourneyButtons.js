sap.ui.define(["sap/ui/test/opaQunit"], function(opaTest) {

	"use strict";

	QUnit.module("Journey - ManageProducts - MainJourneyButtons");

	opaTest("#1 Check if The Main Page Coming With Title", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions

		Then.onTheMainPage.iShouldSeeTheTable();
	});

	opaTest("#3 Check 'Go' Button Existance", function(Given, When, Then) {
		// Assertions
		Then.onTheMainPage.checkGoButton();
	});

	opaTest("#4 Check 'Add' Button Existence", function(Given, When, Then) {
		// Assertions
		Then.onTheMainPage.checkAddButton();
	});

	opaTest("#5 Check 'Settings' Button Existence", function(Given, When, Then) {
		// Assertions
		Then.onTheMainPage.checkSettingButton();
	});

	opaTest("#6 Check 'Export Excel' Button Existence", function(Given, When, Then) {
		// Assertions
		Then.onTheMainPage.checkExportButton();
	});

	opaTest("#8 Check 'Filter' Button Existence", function(Given, When, Then) {
		// Assertions
		Then.onTheMainPage.checkFilterButton();
	});

	opaTest("#9 Check 'Change Price' Button Existence", function(Given, When, Then) {
		// Assertions
		Then.onTheMainPage.checkChangePrice();
	});

	opaTest("#10 Check 'Copy with new supplier' Button Existence", function(Given, When, Then) {
		Given.onTheMainPage.clickGo();
		// Assertions
		Then.onTheMainPage.checkCopyWithSupplier();
	});

	opaTest("#11 Check 'Activate' Button Existence", function(Given, When, Then) {
		Given.onTheMainPage.clickGo();
		// Assertions
		Then.onTheMainPage.checkActivate();
	});

	opaTest("#12 Check if the header and toolbar are sticky", function(Given, When, Then) {
		// Assertions
		When.onTheMainPage.clickGo();
		When.onTheMainPage.clickCheckBox();
		Then.onTheMainPage.checkForToolbarVisibility();
		Then.onTheMainPage.checkForHeaderVisibility();
		Then.onTheMainPage.iTeardownMyApp();
	});

});
