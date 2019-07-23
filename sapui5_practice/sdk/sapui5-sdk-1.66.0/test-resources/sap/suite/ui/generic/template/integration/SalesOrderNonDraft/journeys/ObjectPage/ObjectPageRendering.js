sap.ui.define(["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Non Draft Object Page");

		opaTest("Object Page Header Action Delete button visibility in Display mode", function (Given, When, Then) {
			// arrangements
			Given.iStartMyApp("test-resources/sap/suite/ui/generic/template/demokit/demokit.html?serverDelay=0&responderOn=true&demoApp=sttasalesordernd&sap-ui-language=en_US#/STTA_C_SO_SalesOrder_ND('500000011')");

			Then.onTheObjectPage
				.thePageShouldContainTheCorrectTitle("Sales Order")
				.and
				.theHeaderActionButtOnObjectPageIsPresent("Delete");
		});
		
		opaTest("Object Page Header Action Delete button visibility in Edit mode", function (Given, When, Then) {
			// Actions
			When.onTheSubObjectPage
				.iClickTheButton("Edit");

			Then.onTheObjectPage
				.thePageShouldBeInEditMode()
				.and
				.theHeaderActionButtOnObjectPageIsPresent("Delete");
			 Then.iTeardownMyApp();
		});
		
});
