// QUnit.config.autostart = false;
sap.ui.define(["sap/ui/test/Opa5",
                "sap/suite/ui/generic/template/integration/SalesOrderItemAggregation/pages/Common",
                "sap/ui/test/opaQunit", //Don't move this item up or down, this will break everything!
                "sap/suite/ui/generic/template/integration/SalesOrderItemAggregation/pages/ListReport",
                "sap/suite/ui/generic/template/integration/SalesOrderItemAggregation/pages/ObjectPage",
                "sap/suite/ui/generic/template/integration/testLibrary/ListReport/pages/ListReport",
                "sap/suite/ui/generic/template/integration/testLibrary/ObjectPage/pages/ObjectPage",
                "sap/suite/ui/generic/template/integration/SalesOrderItemAggregation/journeys/ListReport/ItemAggregation",
				"sap/ui/qunit/qunit-css",
				"sap/ui/thirdparty/qunit",
				"sap/ui/qunit/qunit-junit"
                ],
	function (Opa5, Common) {
		"use strict";

		Opa5.extendConfig({
			arrangements: new Common(),
			autoWait: true,
			appParams: {
				"sap-ui-animation": false
			},
			timeout: 30,
			testLibs: {
				fioriElementsTestLibrary: {
					Common: {
						appId: 'SOITMAGGR',
						entitySet: 'STTA_C_SO_ItemAggr'
					}
				}
			}
		});
		QUnit.start();
	}
);
