/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define([
	'jquery.sap.global', 'sap/fe/core/TemplateComponent'
], function(jQuery, TemplateComponent) {
	"use strict";

	var ListReportComponent = TemplateComponent.extend("sap.fe.templates.ListReport.Component",
	{
		metadata: {
			properties: {
				/**
				 * Defines if and on which level variants can be configured:
				 * 		None: no variant configuration at all
				 * 		Page: one variant configuration for the whole page
				 * 		Control: variant configuration on control level
				 */
				variantManagement: {
					type: "sap.fe.VariantManagement",
					defaultValue: sap.fe.VariantManagement.None
				},
				// this will be removed once the mdc table provides a FLEX change to change the table type
				_tableType : {
					type: "string",
					defaultValue: "ResponsiveTable"
				},
				/**
				 * Defines the XML template view name
				 */
				_templateName: {
					type: "string",
					defaultValue: "sap.fe.templates.ListReport.ListReport"
				}
			},
			library: "sap.fe",
			manifest: "json"
		},

		onAfterBinding : function(oContext){
			// for now we just forward this to the list report controller
			this.getRootControl().getController().onAfterBinding(oContext);
		},

		getViewData: function() {
			var oViewData = {};
			// TODO: update ListReport view to use the Enum and then get rid of this coding
			if (this.getVariantManagement() === sap.fe.VariantManagement.None) {
				oViewData.noPageVariantManagement = true;
			} else {
				oViewData.noPageVariantManagement = false;
			}
			oViewData._tableType = this.get_tableType();
			oViewData.entitySetName = this.getEntitySet();
			return oViewData;
		}
	});
	return ListReportComponent;

}, /* bExport= */true);