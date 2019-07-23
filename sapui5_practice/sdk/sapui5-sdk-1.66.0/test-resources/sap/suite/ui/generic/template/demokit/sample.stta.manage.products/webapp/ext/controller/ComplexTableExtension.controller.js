sap.ui.controller("STTA_MP.ext.controller.ComplexTableExtension", {

	onCTAction1 : function(oEvent) {
		sap.m.MessageBox.success("Hello from Complex Table custom action 1!", {});
	},

	onCTAction2 : function(oEvent) {
		sap.m.MessageBox.success("Hello from Complex Table custom action 2!", {});
	}
});