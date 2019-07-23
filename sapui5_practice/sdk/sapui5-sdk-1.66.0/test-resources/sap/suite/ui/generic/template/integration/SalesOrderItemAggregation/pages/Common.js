sap.ui.define(['sap/ui/test/Opa5',
               "sap/ui/test/matchers/AggregationFilled",
               "sap/ui/test/actions/Press"],
	function(Opa5, AggregationFilled, Press) {
		"use strict";

		return Opa5.extend("sap.suite.ui.generic.template.opa.SalesOrderItemAggregation.pages.Common", {
			
			iStartTheListReport: function(oOptions) {
				var opaFrame = "test-resources/sap/suite/ui/generic/template/demokit/demokit.html?serverDelay=0&responderOn=true&demoApp=sttasalesorderitemaggr&sap-ui-language=en_US";
				console.log ( "OPA5::Common.js::iStartTheListReport" + " opaFrame: " + opaFrame);
				return this.iStartMyAppInAFrame(opaFrame);
			},

			iStartTheObjectPage: function(oOptions) {
				var opaFrame = "test-resources/sap/suite/ui/generic/template/demokit/demokit.html?serverDelay=0&responderOn=true&sap-ui-language=en_US&demoApp=sttasalesorderitemaggr#/STTA_C_SO_ItemAggr('.1~0500000000.2~0000000080')"
				console.log ( "OPA5::Common.js::iStartTheObjectPage" + " opaFrame: " + opaFrame);
				return this.iStartMyAppInAFrame(opaFrame);
			},

			iTeardownMyApp: function() {
				console.log ( "OPA5::Common.js::iTeardownMyApp");
				return this.iTeardownMyAppFrame();
			},
			
		});
	}
);
