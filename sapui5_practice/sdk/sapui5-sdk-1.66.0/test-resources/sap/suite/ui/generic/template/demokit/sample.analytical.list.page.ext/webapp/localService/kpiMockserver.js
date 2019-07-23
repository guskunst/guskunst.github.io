sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";
	return {
		init: function () {
			// create
			var oKpiMockServer = new MockServer({
				rootUri: "/sap/opu/odata/sap/CZ_PROJECTKPIS_CDS/"
			});
			var oUriParameters = jQuery.sap.getUriParameters();
			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: oUriParameters.get("serverDelay") || 1000
			});

			// simulate
			var sPath = jQuery.sap.getModulePath("analytics2.localService");
			oKpiMockServer.simulate(sPath + '/CZ_PROJECTKPIS.xml', {
				sMockdataBaseUrl: sPath + '',
				bGenerateMissingMockData: true
			});

			// start
			oKpiMockServer.start();
		}
	};
});
