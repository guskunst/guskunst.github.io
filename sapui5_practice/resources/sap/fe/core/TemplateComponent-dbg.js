/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define([
	'sap/base/util/merge', 'sap/ui/core/UIComponent', 'sap/ui/core/ComponentContainer', "sap/fe/viewFactory", "sap/ui/core/routing/HashChanger"
], function(merge, UIComponent, ComponentContainer, ViewFactory, HashChanger) {
	"use strict";

	function getAppComponent(oComponent) {
		return oComponent.getParent().getParent();
	}

	function createBreadcrumbLinks(sPath, oModel) {
		var aLinks = [], sLinkPath = "";
		if (oModel && sPath) {
			var	aLinkParts = sPath.split("/");
			// Skip the current page (last part of the hash)
			aLinkParts.pop();
			for (var i = 0; i < aLinkParts.length; i++) {
				sLinkPath = sLinkPath + "/" + aLinkParts[i];
				// context for annotation access during templating
				aLinks.push({
					'context': oModel.getMetaModel().getMetaContext(sLinkPath.replace(/ *\([^)]*\) */g, "") + "/$Type")
				});
			}
		}
		return aLinks;
	}

	var TemplateComponent = UIComponent.extend("sap.fe.core.TemplateComponent", {

		metadata: {
			properties: {
				/**
				 * OData EntitySet name
				 */
				entitySet: {
					type: "string",
					defaultValue: null
				},
				/**
				 * Map of used OData navigations and its routing targets
				 */
				navigation: {
					type: "object"
				}
			},
			library: "sap.fe"
		},

		getComponentContainer: function() {
			return this.oContainer;
		},

		// This event is triggered always before a binding is going to be set
		onBeforeBinding : function(oContext, mParameters){
			return this.oViewPromise;
		},

		// This event is triggered always after a binding was set
		onAfterBinding : function(oContext){
			return true;
		},

		onBeforeRendering: function() {
			if (!this.getRootControl()) {
				var that = this,
					oViewData = {},
					oContainer = that.getComponentContainer(),
					oModel = oContainer.getModel(),
					oAppComponent = getAppComponent(oContainer),
					sAppComponentId = oAppComponent.getMetadata().getComponentName(),
					sLocalComponentId = oAppComponent.getLocalId(this.getId()),
					sEntitySet = that.getEntitySet(),
					sViewName = that.get_templateName();

				if (oModel) {
					oViewData.navigation = that.getNavigation();
					oViewData.links = createBreadcrumbLinks(HashChanger.getInstance().getHash(), oModel);
					if (that.getViewData) {
						merge(oViewData, that.getViewData());
					}
					this.oViewPromise = ViewFactory.create({
						viewId: sAppComponentId + "::" + sLocalComponentId,
						viewName: sViewName,
						appComponent: oAppComponent,
						entitySet: sEntitySet,
						viewData: oViewData,
						model: oAppComponent.getModel()
					});
					this.oViewPromise.then(function (oView) {
						that.setAggregation("rootControl", oView);
						oContainer.invalidate();
					});

				}
			}
		}

	});
	return TemplateComponent;

}, /* bExport= */true);