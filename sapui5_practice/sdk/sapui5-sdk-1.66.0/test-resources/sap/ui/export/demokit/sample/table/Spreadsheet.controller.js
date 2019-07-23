sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/export/Spreadsheet"
], function(Controller, MockServer, Spreadsheet) {
	"use strict";

	return Controller.extend("sap.ui.export.sample.table.Spreadsheet", {

		onInit: function() {
			var oModel, oView;

			this._oMockServer = new MockServer({
				rootUri: "./localService/"
			});

			var sPath = sap.ui.require.toUrl("sap/ui/export/sample/localService");
			this._oMockServer.simulate(sPath + "/metadata.xml", sPath + "/mockdata");
			this._oMockServer.start();

			oModel = new sap.ui.model.odata.v2.ODataModel("./localService", true);

			oView = this.getView();
			oView.setModel(oModel);
		},

		createColumnConfig: function() {
			var aCols = [];

			aCols.push({
				label: 'Full name',
				property: ['Lastname', 'Firstname'],
				type: 'string',
				template: '{0}, {1}'
			});

			aCols.push({
				label: 'ID',
				type: 'number',
				property: 'UserID',
				scale: 0
			});

			aCols.push({
				property: 'Firstname',
				type: 'string'
			});

			aCols.push({
				property: 'Lastname',
				type: 'string'
			});

			aCols.push({
				property: 'Birthdate',
				type: 'date'
			});

			aCols.push({
				property: 'Salary',
				type: 'number',
				scale: 2,
				delimiter: true
			});

			aCols.push({
				property: 'Currency',
				type: 'string'
			});

			aCols.push({
				property: 'Active',
				type: 'boolean',
				trueValue: 'YES',
				falseValue: 'NO'
			});

			return aCols;
		},

		onExport: function() {
			var aCols, oRowBinding, oSettings, oSheet, oTable;

			if (!this._oTable) {
				this._oTable = this.byId("exportTable");
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding("items");

			aCols = this.createColumnConfig();

			var oModel = oRowBinding.getModel();
			var oModelInterface = oModel.getInterface();

			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: {
					type: "odata",
					dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
					serviceUrl: oModelInterface.sServiceUrl,
					headers: oModelInterface.getHeaders ? oModelInterface.getHeaders() : null,
					count: oRowBinding.getLength ? oRowBinding.getLength() : null,
					useBatch: oModelInterface.bUseBatch,
					sizeLimit: oModelInterface.iSizeLimit
				},
				worker: false // We need to disable worker because we are using a MockServer as OData Service
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		},

		onExit: function() {
			this._oMockServer.stop();
		}
	});
});
