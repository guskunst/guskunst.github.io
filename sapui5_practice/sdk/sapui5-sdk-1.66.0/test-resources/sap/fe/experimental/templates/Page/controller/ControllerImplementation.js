/* global hasher */
sap.ui.define([
		"jquery.sap.global",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel"
	],
	function(jQuery, MessageBox, JSONModel) {
		"use strict";

		var oMessagePopover;

		return {
			getMethods: function(oTemplateUtils, oController) {
				// Generation of Event Handlers
				return {
					applicationController: {
						callBoundAction : oTemplateUtils.oActionController.callBoundAction,
						callActionForSelectedEntries : oTemplateUtils.oActionController.callActionForSelectedEntries,
					},

					handlers: {
						/* no generic handlers */
					},
					formatters: {
						/* no generic formatters */
					},
					extensionAPI: null
						/* no generic extension API */
				};
			}
		};

	});
