/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define([
	'jquery.sap.global', 'sap/fe/core/TemplateComponent', 'sap/ui/model/odata/v4/ODataListBinding'
], function(jQuery, TemplateComponent, ODataListBinding) {
	"use strict";

	var ObjectPageComponent = TemplateComponent.extend("sap.fe.templates.ObjectPage.Component",
	{
		metadata: {
			properties: {
				/**
				 * Defines the XML template view name
				 */
				_templateName: {
					type: "string",
					defaultValue: "sap.fe.templates.ObjectPage.ObjectPage"
				},
				// this will be removed once the mdc table provides a FLEX change to change the table type
				// in the object page currently the table type can only be set for all tables
				_tableType : {
					type: "string",
					defaultValue: "ResponsiveTable"
				},
				_creationMode : {
					type: "string",
					defaultValue: ""
				}
			},
			library: "sap.fe",
			manifest: "json"
		},

		onBeforeBinding : function(oContext, mParameters){
			var that = this;
			return this.oViewPromise.then(function () {
				// for now we just forward this to the object page controller
				return that.getRootControl().getController().onBeforeBinding(oContext, mParameters);
			});
		},

		onAfterBinding : function(oContext){
			// for now we just forward this to the object page controller
			this.getRootControl().getController().onAfterBinding(oContext);
		},

		// TODO: this should be ideally be handled by the editflow/routing without the need to have this method in the
		// object page - for now keep it here
		createDeferredContext: function (sPath) {
			var oListBinding,
				that = this;

			oListBinding = new ODataListBinding(this.getModel(), sPath.replace('(...)', ''));

			this.oViewPromise.then(function (oView) {
				var oNavContainer = oView.getController().getOwnerComponent().getRootControl();
				oNavContainer.setBusy(true);

				// for now wait until the view and the controller is created
				that.getRootControl().getController().editFlow.createDocument(oListBinding, {
					creationMode : 'Sync',
					noHistoryEntry: true,
					busyHandling: false // in this case no need to internally handle busy since it is handled by OP dataRequested and dataReceived
				}).catch(function(){
					// the creation failed or was aborted by the user - showing the object page doesn't make any sense
					// now - for now just use window.history.back to navigate back
					oNavContainer.setBusy(false);
					window.history.back();
				});
			});
		},

		getViewData: function() {
			var oViewData = {};
			oViewData._tableType = this.get_tableType();
			oViewData._creationMode = this.get_creationMode();
			return oViewData;
		}

	});
	return ObjectPageComponent;

}, /* bExport= */true);