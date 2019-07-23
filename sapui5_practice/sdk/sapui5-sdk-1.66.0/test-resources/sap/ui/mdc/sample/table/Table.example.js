/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
(function() {
	"use strict";

	sap.ui.getCore().attachInit(function() {
		sap.ui.require([
			"this/sample/mockserver/mockServer", "sap/ui/model/odata/v4/ODataModel", "sap/ui/model/odata/OperationMode", "this/ViewFactory", "sap/ui/core/ComponentContainer", "sap/ui/core/util/XMLPreprocessor", "sap/ui/mdc/TemplateUtil"
		], function(MockServer, ODataModel, OperationMode, ViewFactory, ComponentContainer, XMLPreprocessor, TemplateUtil) {

			XMLPreprocessor.plugIn(function(oNode, oVisitor) {
				return TemplateUtil.initialTemplating(oNode, oVisitor, "sap.ui.mdc.Table", {
					columns: "this/sample/table/Table_columns"
				}).then(function() {
					oNode.removeAttribute('metadataContexts'); // Just to avoid binding warning in log. Not really needed
					// XMLPreprocessor result expects a promise or undefined.
					return undefined;
				});
			}, "sap.ui.mdc", "Table");

			sap.ui.getCore()._switchToScrollableResponsiveTable = function() {
				sap.ui.getCore().byId('onlyTableView').byId('mdcTable').setType(new sap.ui.mdc.ResponsiveTableType({
					growingMode: 'Scroll'
				}));
			};

			var uriParams = jQuery.sap.getUriParameters(), bRTA = uriParams.get("rta"), serverUrl = uriParams.get("serverUrl"), sUrl = serverUrl ? "/testsuite/proxy/" + serverUrl.replace("://", "/") : "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/", tableType = uriParams.get("tableType") ? uriParams.get("tableType") : "Table", tableViewName = {
				"ResponsiveTable": "Table",
				"Table": "GridTable",
				"OData": "RealODataV4Table"
			}, mModelOptions = {
				serviceUrl: sUrl,
				groupId: "$direct",
				synchronizationMode: 'None',
				autoExpandSelect: true,
				operationMode: OperationMode.Server
			}, oModel = new ODataModel(mModelOptions), oMetaModel = oModel.getMetaModel(), oView;
			tableType = serverUrl ? "OData" : tableType;
			var oMockServer;
			if (serverUrl) {
				oMockServer = {
					started: Promise.resolve()
				};
			} else {
				oMockServer = new MockServer();
			}
			oMockServer.started.then(function() {
				new ComponentContainer({
					height: "100%",
					async: true,
					componentCreated: function(oEvt) {
						var oContainer = oEvt.getSource();
						var oComp = oEvt.getParameter("component");
						oComp.setModel(oModel);
						ViewFactory.create({
							id: "onlyTableView",
							viewName: "views." + tableViewName[tableType],
							height: "100%",
							async: true,
							preprocessors: {
								xml: {
									models: {
										collection: oMetaModel
									}
								}
							}
						}, oModel, oComp).then(function(View) {
							oView = View;
							oContainer.rerender(); // needed to ensure we see something due to all the hacks here to make async view loading work
							if (bRTA) {
								oView.addStyleClass("sapUiTop");
								sap.ui.require([
									"sap/ui/rta/RuntimeAuthoring"
								], function(RuntimeAuthoring) {
									new RuntimeAuthoring({
										rootControl: oView
									}).start();
								});
							}
						});
					},
					name: "MDCTable",
					settings: {
						id: "MDCTable"
					}
				}).placeAt("content");
			});
		});
	});
})();
