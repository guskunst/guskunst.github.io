/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
	"use strict";

	/**
	 * Static class used by MDC Table during runtime
	 *
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 */
	var TableRuntime = {
		setContexts: function(oTable, sModelName, sPrefix, sDeletablePath, oDraft){
			var aSelectedContexts = oTable.getSelectedContexts();
			var isDeletable = false;
			var aDeletableContexts = [];
			var aUnsavedContexts = [];
			var aLockedContexts = [];
			var oLockedAndUnsavedContexts = {};
			var oModelObject;
			var sContextCollectionName = "/$contexts/" + sPrefix;
			var oContextModel = oTable.getModel(sModelName);
			if (!oContextModel){
				// create model but that seems to be too later
				oContextModel = new JSONModel();
				oTable.setModel(oContextModel, "$contexts");
			}
			oLockedAndUnsavedContexts.aUnsavedContexts = [];
			oLockedAndUnsavedContexts.aLockedContexts = [];
			oContextModel.setProperty("/$contexts", {});
			oContextModel.setProperty(sContextCollectionName,{selectedContexts: aSelectedContexts, numberOfSelectedContexts: aSelectedContexts.length, deleteEnabled:true, deletableContexts:[], unSavedContexts:[], lockedContexts:[]});
					for (var i = 0; i < aSelectedContexts.length ; i++) {
						var oSelectedContext = aSelectedContexts[i];
						var oContextData = oSelectedContext.getObject();
						for (var key in oContextData){
							if (key.indexOf("#") === 0){
								var sActionPath = key;
								sActionPath = sActionPath.substring(1, sActionPath.length);
								oModelObject = oContextModel.getProperty(sContextCollectionName);
								oModelObject[sActionPath] = true;
								oContextModel.setProperty(sContextCollectionName,oModelObject);
							}
						}
						oModelObject = oContextModel.getProperty(sContextCollectionName);
					if (sDeletablePath != "undefined"){
						if (oSelectedContext.getProperty(sDeletablePath)){
							if (oDraft !== "undefined" && (oContextData.IsActiveEntity === true && oContextData.HasDraftEntity === true)){
							   oLockedAndUnsavedContexts = getUnsavedAndLockedContexts(oContextData,oSelectedContext);
							} else {
								aDeletableContexts.push(oSelectedContext);
								oLockedAndUnsavedContexts.isDeletable = true;
							}
						}
						oModelObject["deleteEnabled"] = oLockedAndUnsavedContexts.isDeletable;
					} else if (oDraft !== "undefined"  && (oContextData.IsActiveEntity === true && oContextData.HasDraftEntity === true)) {
						oLockedAndUnsavedContexts = getUnsavedAndLockedContexts(oContextData,oSelectedContext);
					} else {
						aDeletableContexts.push(oSelectedContext);
					}
				}
				function getUnsavedAndLockedContexts(oContextData,oSelectedContext){
					if (oContextData.DraftAdministrativeData.InProcessByUser){
						aLockedContexts.push(oSelectedContext);
					} else {
						aUnsavedContexts.push(oSelectedContext);
						isDeletable = true;
					}
					return {
						aLockedContexts:aLockedContexts,
						aUnsavedContexts:aUnsavedContexts,
						isDeletable:isDeletable
					};
				}
				oModelObject["deletableContexts"] = aDeletableContexts;
				oModelObject["unSavedContexts"] = oLockedAndUnsavedContexts.aUnsavedContexts;
				oModelObject["lockedContexts"] = oLockedAndUnsavedContexts.aLockedContexts;
				oContextModel.setProperty(sContextCollectionName,oModelObject);
		}
	};

	return TableRuntime;

}, /* bExport= */ true);
