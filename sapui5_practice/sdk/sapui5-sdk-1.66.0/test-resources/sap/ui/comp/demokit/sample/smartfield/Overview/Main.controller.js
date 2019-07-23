sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/BindingMode",
	"sap/ui/model/odata/v2/ODataModel"
], function(Controller, MockServer, BindingMode, ODataModel) {
	"use strict";

	return Controller.extend("sap.ui.comp.sample.smartfield.Overview.Main", {
		onInit: function() {
			var oMockServer = new MockServer({
				rootUri: "/SampleDataService/"
			});
			oMockServer.simulate(
				"test-resources/sap/ui/comp/demokit/sample/smartfield/Overview/mockserver/metadata.xml",
				"test-resources/sap/ui/comp/demokit/sample/smartfield/Overview/mockserver/");

			oMockServer.start();
			var oModel = new ODataModel("/SampleDataService");
			oModel.setDefaultBindingMode(BindingMode.TwoWay);
			var oView = this.getView();
			oView.setModel(oModel);
			oView.bindElement("/Products('1239102')");
		}
	});
});
