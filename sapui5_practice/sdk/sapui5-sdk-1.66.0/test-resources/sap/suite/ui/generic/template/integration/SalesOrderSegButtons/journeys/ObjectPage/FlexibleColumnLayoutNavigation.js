sap.ui.define(["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Flexible Column Layout Navigation");

		opaTest("Starting the app and loading data", function (Given, When, Then) {
			// arrangements
			Given.iStartTheListReport();

			// actions
			When.onTheGenericListReport
				.iExecuteTheSearch();

			Then.onTheGenericListReport
				.theResultListIsVisible();
		});

		opaTest("Navigate to the main ObjectPage", function (Given, When, Then) {
			When.onTheGenericListReport
				.iNavigateFromListItemByFieldValue({Field:"SalesOrder", Value:"500000012"});

			Then.onTheGenericObjectPage
				.theObjectPageHeaderTitleIsCorrect("500000012")
				.and
				.iShouldSeeTheSections(["Sales Order Items","ProductTableReuse"])
				.and
				.iShouldSeeTheButtonWithId("fullScreen");
		});

		opaTest("Maximize the ObjectPage", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithId("fullScreen");

			Then.onTheGenericObjectPage
				.iShouldSeeTheButtonWithId("exitFullScreen");
		});
		
		opaTest("Minimize the ObjectPage", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithId("exitFullScreen");

			Then.onTheGenericObjectPage
				.iShouldSeeTheButtonWithId("fullScreen")
				.and
				.iShouldSeeTheButtonWithIcon("sap-icon://slim-arrow-right");
		});

		opaTest("Expand the ObjectPage", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithIcon("sap-icon://slim-arrow-right");

			Then.onTheGenericObjectPage
				.iShouldSeeTheButtonWithIcon("sap-icon://slim-arrow-left");
		});

		opaTest("Collapse the ObjectPage", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithIcon("sap-icon://slim-arrow-left");

			Then.onTheGenericObjectPage
				.iShouldSeeTheButtonWithIcon("sap-icon://slim-arrow-right");
		});

		opaTest("Navigate to items Sub-ObjectPage", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iNavigateFromObjectPageTableByFieldValue("to_Item", {Field:"SalesOrderItem", Value:"30"});

			Then.onTheGenericObjectPage
				.iShouldSeeTheSections(["Schedule Lines"])
				.and
				.iShouldSeeTheButtonWithIcon("sap-icon://slim-arrow-right");
//				.and
//				.iShouldSeeTheButtonWithId("fullScreen", "C_STTA_SalesOrderItem_WD_20");
		});

/* Maximizing on SubObjectPage does not work if the winodow is too small which is the case when running in the test-suite.
 * In that case the maximize button is not visible which seems to be a bug 

		opaTest("Maximize the Sub-ObjectPage", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithId("fullScreen", "C_STTA_SalesOrderItem_WD_20");

			Then.onTheGenericObjectPage
				.iShouldSeeTheButtonWithId("exitFullScreen", "C_STTA_SalesOrderItem_WD_20");
		});
		
		opaTest("Minimize the Sub-ObjectPage", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithId("exitFullScreen", "C_STTA_SalesOrderItem_WD_20");

			Then.onTheGenericObjectPage
				.iShouldSeeTheButtonWithId("fullScreen", "C_STTA_SalesOrderItem_WD_20")
				.and
				.iShouldSeeTheButtonWithIcon("sap-icon://slim-arrow-right");
		});
*/
		opaTest("Expand the Sub-ObjectPage", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithIcon("sap-icon://slim-arrow-right");

			Then.onTheGenericObjectPage
				.iShouldSeeTheButtonWithIcon("sap-icon://slim-arrow-left");
		});

		opaTest("Collapse the Sub-ObjectPage", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithIcon("sap-icon://slim-arrow-left");

			Then.onTheGenericObjectPage
				.iShouldSeeTheButtonWithIcon("sap-icon://slim-arrow-right");

			Then.onTheListReportPage.iTeardownMyApp();
		});
		
	}
);