sap.ui.define(["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Sales Order No Extensions - FCL");

		opaTest("Starting the app and loading data", function (Given, When, Then) {
			// arrangements
			/* use this in case you need lrep and navigation from LR to object page */
			//Given.iStartTheListReport();
			Given.iStartTheListReport("manifestFCL");

			/* else use this */
			//Given.iStartTheListReportComponent("manifestFCL");

			// actions
			When.onTheGenericListReport
				.iExecuteTheSearch();

			Then.onTheGenericListReport
				.theResultListIsVisible();
			Then.iTeardownMyApp();
		});
	}
);
