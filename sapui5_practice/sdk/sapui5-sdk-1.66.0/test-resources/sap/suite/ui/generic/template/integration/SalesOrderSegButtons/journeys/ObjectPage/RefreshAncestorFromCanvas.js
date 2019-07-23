sap.ui.define(["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Sales Order with Segmented Buttons - Object Page");

		opaTest("Starting the app and Navigating to the Canvas Page", function (Given, When, Then) {
			// arrangements
			Given.iStartTheListReport("manifestWithCanvas");

			// actions
			When.onTheGenericListReport
               			.iExecuteTheSearch();
			When.onTheGenericListReport
				.iNavigateFromListItemByFieldValue({Field:"SalesOrder", Value:"500000000"});
			When.onTheObjectPage
				.iShouldChangeTheInputText();
			When.onTheObjectPage
				.iClickTheButtonInCanvas("RefreshAncestor");

           		Then.onTheObjectPage
				.iShouldSeeRefreshedContextPath();
			Then.onTheGenericListReport
				.iTeardownMyApp();
        });
	}
);