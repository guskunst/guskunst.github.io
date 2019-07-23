sap.ui.controller("sample.analytical.list.page.with.params.ext.controller.AnalyticalListPageExt", {

	onClickActionA_determining: function(oEvent) {
		'use strict';

		console.log("Determining button called");

	},
	adaptNavigationParameterExtension: function(oSelectionVariant, oObjectInfo) {
		console.log("Breakout Extension for handling KPI navigation called");
		// This is an example! Please create your own code!!
		// This is an example to remove the parameter 'P_DisplayCurrency' from the parameters
		oSelectionVariant.removeParameter("P_DisplayCurrency");
	},
	onBeforeRebindFilterableKPIExtension: function(oSelectionVariant, sEntityType) {
		'use strict';
		var Log = sap.ui.require("sap/base/Log");
		if (sEntityType === "ZEPM_C_SALESORDERITEMQUERY_CDS.ZEPM_C_SALESORDERITEMQUERYResult") {
			oSelectionVariant.removeSelectOption("Ledger");
			oSelectionVariant.addSelectOption("DisplayCurrency", "I", "EQ", "USD");
			oSelectionVariant.addParameter("P_DisplayCurrency", "USD");
		}
		Log.info("onBeforeRebindFilterableKPIExtension called!");
	},
	onSaveAsTileExtension: function(oShareInfo) {
		'use strict';
		var Log = sap.ui.require("sap/base/Log");
		Log.info("onSaveAsTileExtension called!");
		oShareInfo.serviceURL = "";
	},
	onBeforeRebindVisualFilterExtension: function(entityName, dimField, measureField, oContext){
		'use strict';
		var Log = sap.ui.require("sap/base/Log");
		var navigationContext = this.extensionAPI.getNavigationContext();
		if (dimField === "CustomerCountry") {
			oContext.filters.push(new sap.ui.model.Filter("DisplayCurrency", "EQ", "USD"));
		}
		Log.info("onBeforeRebindVisualFilterExtension called!");
	}

});