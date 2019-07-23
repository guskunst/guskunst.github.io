sap.ui.define(["sap/ui/test/Opa5",
                "sap/suite/ui/generic/template/integration/ManageProducts_new/pages/Common",
                "sap/ui/test/opaQunit", //Don't move this item up or down, this will break everything!
                "sap/suite/ui/generic/template/integration/ManageProducts_new/pages/ListReport",
                "sap/suite/ui/generic/template/integration/ManageProducts_new/pages/ObjectPage",
				"sap/suite/ui/generic/template/integration/testLibrary/ListReport/pages/ListReport",
				"sap/suite/ui/generic/template/integration/testLibrary/ObjectPage/pages/ObjectPage"],
	function (Opa5, Common, opaQunit) {
		"use strict";

		Opa5.extendConfig({
			arrangements: new Common(),
			viewNamespace: "sap.suite.ui.generic.template.demokit",
			autoWait: true,
			appParams: {
				"sap-ui-animation": false
			},
			timeout: 120,   // 480 is much too high and causes the system to fail when writing the log
			testLibs: {
				fioriElementsTestLibrary: {
					Common: {
						appId: 'STTA_MP',
						entitySet: 'STTA_C_MP_Product'
					}
				}
			}
		});

		QUnit.module("Smart Link QuickView");


		opaTest("Start the List Report and load data", function (Given, When, Then) {
			Given.iStartTheListReportInFlpSandbox();

			// actions
			When.onTheGenericListReport
				.iExecuteTheSearch();

			Then.onTheGenericListReport
				.theResultListIsVisible();
		});

		opaTest("Check for QuickView content on the List Report", function (Given, When, Then) {
			When.onTheListReportPage
				.iClickOnACellInTheTable(5, "Supplier [SmLiQv]");

			// assertions
			Then.onTheListReportPage
				.theSmLiQvPopoverOpensAndContainsExtraContent("Label: FieldGroup_1");

		});

		//TODO: Demokit App doesn't work and needs correction becuase of wrong test data
		// opaTest("Check for QuickView content on the Object Page", function (Given, When, Then) {

		// 	// actions
		// 	When.onTheGenericListReport
		// 		.iNavigateFromListItemByLineNo(5);

		// 	// actions
		// 	When.onTheObjectPage
		// 		.iClickOnALink("100000049 (Talpa)");

		// 	// assertions
		// 	Then.onTheObjectPage
		// 		.theSmLiQvPopoverOpensAndContainsExtraContent("Label: FieldGroup_2");
		// });

		// opaTest("Check for QuickView clicking the title area link on the Object Page", function (Given, When, Then) {

		// 	// actions
		// 	When.onTheObjectPage
		// 		.iClickTheTitleAreaLinkOnTheSmLiQvPopover();

		// 	Then.onTheObjectPage
		// 		.theSpecificPageShouldBeOpened("epmprodman::sap.suite.ui.generic.template.ObjectPage.view.Details::SEPMRA_C_PD_Product--objectPageHeader");
		// });

		// opaTest("Check for QuickView contact content on the Object Page", function (Given, When, Then) {
		// 	// actions
		// 	When.onTheGenericObjectPage
		// 		.iNavigateBack()
		// 		.and
		// 		.iClickTheLink("KG (kg)");

		// 	// assertions
		// 	Then.onTheObjectPage
		// 		.theSmLiQvPopoverOpensAndContainsExtraContent("Label: Contact 1");
		// });

		opaTest("Tear down the application", function (Given, When, Then) {
			Then.iTeardownMyApp();
			expect(0);
		});

/*
		opaTest("just for testing: start the app and load LR", function (Given, When, Then) {
			Given.iStartTheListReportInFlpSandbox();

			// actions
			When.onTheGenericListReport
				.iExecuteTheSearch();

			Then.onTheGenericListReport
				.theResultListIsVisible();
		});

		opaTest("just for testing: click the QV link", function (Given, When, Then) {

			// actions
			When.onTheGenericListReport
				.iClickTheLink("100000049 (Talpa)");

			When.onTheObjectPage
				.iClickTheTitleAreaLinkOnTheSmLiQvPopover();

			Then.onTheGenericListReport
				.theResultListIsVisible();

		});

		opaTest("Tear down the application", function (Given, When, Then) {
			Then.iTeardownMyApp();
			expect(0);
		});
*/
		QUnit.start();
	}
);
