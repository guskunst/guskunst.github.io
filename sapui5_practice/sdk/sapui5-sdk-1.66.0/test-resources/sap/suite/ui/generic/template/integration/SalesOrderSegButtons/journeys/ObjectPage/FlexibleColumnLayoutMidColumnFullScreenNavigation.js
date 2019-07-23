sap.ui.define(["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Flexible Column Layout Mid Column FullScreen Navigation");

		opaTest("Starting the app and loading data", function (Given, When, Then) {
			// arrangements
			Given.iStartTheListReport({
				manifest: "MidColumnFullScreen"
			});

			// actions
			When.onTheGenericListReport
				.iExecuteTheSearch();

			When.onTheGenericListReport
				.iNavigateFromListItemByFieldValue({Field:"SalesOrder", Value:"500000012"});

			Then.onTheGenericObjectPage
				.theObjectPageHeaderTitleIsCorrect("500000012")
				.and
				.iShouldSeeTheSections(["Sales Order Items","ProductTableReuse"])
				.and
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
				.iNavigateFromObjectPageTableByFieldValue("to_Item", {Field:"SalesOrderItem", Value:"20"});

			Then.onTheGenericObjectPage
				.iShouldSeeTheSections(["Schedule Lines"])
				.and
				.iShouldSeeTheButtonWithIcon("sap-icon://slim-arrow-right");
		});

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
