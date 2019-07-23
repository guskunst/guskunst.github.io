sap.ui.define([

], function () {
	"use strict";

	return sap.ui.controller("SOMULTIENTITY.ext.controller.ListReport", {

		onInit: function () {
			var oSmartTable = this._getSmartTable();
		},

		_getSmartTable: function() {
			return this.getView().byId("listReport");
		},
		
		onListNavigationExtension: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oObject = oBindingContext.getObject();
			var sNavigationProperty;
			switch (oObject.BusinessPartnerID){
				case "100000000":
					sNavigationProperty = "to_BillingStatus";
					break;							
			}
	
			if (sNavigationProperty){
				var oExtensionAPI = this.extensionAPI;
				var fnNavigate = function(){
					return new Promise(function(fnResolve, fnReject){
						var oModel = oBindingContext.getModel();
						var oTarget;
						oModel.createBindingContext(sNavigationProperty, oBindingContext, {}, function(oTarget){
							var oNavigationController = oExtensionAPI.getNavigationController();
							oNavigationController.navigateInternal(oTarget);
							fnResolve();
						});
					});
				};
				oExtensionAPI.securedExecution(fnNavigate);
				return true;				
			}
			return false;
		}

	});
}, /* bExport= */ true);