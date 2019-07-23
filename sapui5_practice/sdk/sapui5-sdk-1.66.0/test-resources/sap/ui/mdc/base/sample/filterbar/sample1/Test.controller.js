sap.ui.define([
	'sap/ui/core/mvc/Controller', "sap/ui/model/odata/OperationMode", "sap/ui/model/odata/v4/ODataModel", 'mock/mockserver/mockServer', 'sap/ui/mdc/base/ConditionModel'
], function(Controller, OperationMode, ODataModel, MockServer, ConditionModel) {
	"use strict";

	return Controller.extend("sap.ui.mdc.base.sample.filterbar.sample1.Test", {

		onInit: function() {

			var sResourceUrl;
			sResourceUrl = "i18n/i18n.properties";
			var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var oResourceModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: sResourceUrl,
				bundleLocale: sLocale
			});
			this.getView().setModel(oResourceModel, "@i18n");

			var uriParams = jQuery.sap.getUriParameters(), /*bRTA = uriParams.get("rta"),*/ serverUrl = uriParams.get("serverUrl"), sUrl = serverUrl ? "/testsuite/proxy/" + serverUrl.replace("://", "/") : "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/";
			var mModelOptions = {
				serviceUrl: sUrl,
				groupId: "$direct",
				synchronizationMode: 'None',
				autoExpandSelect: true,
				operationMode: OperationMode.Server
			};

			var oMockServer;
			if (serverUrl) {
				oMockServer = {
					started: Promise.resolve()
				};
			} else {
				oMockServer = new MockServer();
			}

			var oModel = new ODataModel(mModelOptions), oMetaModel = oModel.getMetaModel();
			oMockServer.started.then(function() {

				oMetaModel.requestObject("/").then(function() {
					this.getView().setModel(oModel);

					this.oListBinding = this.getView().byId("idTable").getBinding("items");
					this.getView().setModel(ConditionModel.getFor(this.oListBinding), "cm");

					//var oFB = this.getView().byId("testFilterBar");
				}.bind(this));

			}.bind(this));

			var oFB = this.getView().byId("testFilterBar");
			sap.ui.getCore().getMessageManager().registerObject(oFB, true);
		},

		onSearch: function(oEvent) {
			if (this.oListBinding) {
				var oListBindingModel = this.getView().getModel("cm");
				var oFB = this.getView().byId("testFilterBar");
				if (oFB) {
					var mConditions = oEvent.getParameter("conditions");
					oListBindingModel.removeAllConditions();
					oListBindingModel.setConditions(mConditions);
					oListBindingModel.applyFilters(this.oListBinding, true);
				}
			}
		},

		onFiltersChanged: function(oEvent) {
			var oText = this.getView().byId("statusText");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersText);
			}
		},

		onChangeReqProperty: function(oEvent) {
			var oFB = this.getView().byId("testFilterBar");
			if (oFB) {
				oFB.getPropertyInfoSet().some(function(oProperty) {
					if (oProperty.getName() === "Category") {
						oProperty.setRequired(!oProperty.getRequired());
						return true;
					}

					return false;
				});
			}
		},

		onChangeVisProperty: function(oEvent) {
			var oFB = this.getView().byId("testFilterBar");
			if (oFB) {
				oFB.getPropertyInfoSet().some(function(oProperty) {
					if (oProperty.getName() === "Category") {
						oProperty.setVisible(!oProperty.getVisible());
						return true;
					}

					return false;
				});
			}
		}
	});
}, true);
