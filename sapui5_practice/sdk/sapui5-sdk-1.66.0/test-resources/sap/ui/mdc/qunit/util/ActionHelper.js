/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
/**
 * Helper class used by TemplateUtil.qunit.js to evaluate actions
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
sap.ui.define([], function() {
	"use strict";
	return {
		getActions: function(oMetadataContext) {
			var oActionContext, oActionModel;
			if (oMetadataContext) {
				// Try to find the metadataContext path assigned to "action"
				oActionContext = oMetadataContext.getObject("/action");

				if (oActionContext) {
					oActionModel = oActionContext.getModel();
				}

				if (oActionModel && oActionModel.isA("sap.ui.model.json.JSONModel")) {
					// One could also use oActionModel.createBindingContext(oActionContext.getPath()); but that is unnecessary if a path is already
					// passed in metadataContexts
					return oActionContext;
				}
			}
		}
	};
	// Export to use during templating
}, /* bExport= */true);
