sap.ui.controller("ManageSalesOrderWithTableTabs.ext.controller.ListReportExtension", {

	modifyStartupExtension: function(oStartupObject) {
		oStartupObject.selectedQuickVariantSelectionKey = "1";
		oStartupObject.selectionVariant.addSelectOption("GrossAmount","I","LT","15000");
	}

});
