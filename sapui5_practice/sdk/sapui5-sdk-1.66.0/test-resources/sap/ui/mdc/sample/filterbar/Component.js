/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   zui5_epm_sample OData service.
 * @version @version@
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/HBox",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/ViewType"
], function (jQuery, HBox, UIComponent, ViewType)  {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.sample.filterbar.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {

			var oViewSettings = {
				async: true,
				id: "filterbarSampleView",
				models: {
					undefined: this.getModel(),
					'sap.ui.mdc.metaModel': this.getModel().getMetaModel()
				},
				type: ViewType.XML,
				viewName: "sap.ui.mdc.sample.filterbar.Main"
			};

			oViewSettings.preprocessors = jQuery.extend(oViewSettings.preprocessors, {
				xml: {
					bindingContexts: {},
					models: {
						'sap.ui.mdc.metaModel': this.getModel().getMetaModel()
					}
				}
			});

			// TODO we need to do the first requestObject ourselves it seems. Need to check why?
			this.getModel().getMetaModel().requestObject("/");

			return sap.ui.view(oViewSettings);
		}

	});
});
