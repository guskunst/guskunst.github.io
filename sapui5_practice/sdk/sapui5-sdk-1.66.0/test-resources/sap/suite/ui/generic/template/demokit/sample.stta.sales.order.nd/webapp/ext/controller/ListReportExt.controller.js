sap.ui.controller("STTA_SO_ND.ext.controller.ListReportExt", {

	onClickActionNavigatioButton: function (oEvent) {
		
		var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
		oCrossAppNavigator.toExternal({
			target: {
				semanticObject: "SalesOrder",
				action: "MultiViews"
			},
			params: {
				mode : 'create'
			}				
		});
}
});