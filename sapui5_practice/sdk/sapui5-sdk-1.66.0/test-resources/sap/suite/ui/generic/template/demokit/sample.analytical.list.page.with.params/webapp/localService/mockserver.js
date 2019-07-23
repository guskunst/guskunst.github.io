sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";
	return {
		init: function () {
			// create
			var oMockServer = new MockServer({
				rootUri: "/services_kiw/sap/opu/odata/sap/ZCOSTCENTERCOSTSQUERY0020_CDS/"
			}); 
			var oUriParameters = jQuery.sap.getUriParameters();
			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: oUriParameters.get("serverDelay") || 1000
			});
			
			// simulate
			var sPath = jQuery.sap.getModulePath("sample.analytical.list.page.with.params.localService");
			oMockServer.simulate(sPath + '/ZCOSTCENTERCOSTSQUERY0020_CDS.xml', {
				sMockdataBaseUrl: sPath + '',
				bGenerateMissingMockData: true
			});

			// start
			oMockServer.start();
		}
	};
});