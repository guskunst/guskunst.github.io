/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
// Provides the Design Time Metadata for the sap.m.Button control if used in table
sap.ui.define([
	'./DialogUtil'
], function (DialogUtil) {
	'use strict';
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.ui.mdc.odata.v4.designtime');

	return {
		actions: {
			settings: {
				changeCreationMode: {
					icon: 'sap-icon://table-row',
					name: oResourceBundle.getText('TABLE_CREATIONMODE_SETTINGS'),
					isEnabled: function(oSelectedControl) {
						var oControl = oSelectedControl.getActions().filter(function(action) {
							return action.getId().indexOf('::Create') > -1;
						})[0];
						// TODO: confirm enable check
						return !!oControl || oSelectedControl.data("creationMode") === 'CreationRow' || !!oSelectedControl.getCreationRow();
					},
					handler: function(oSelectedControl) {
						return DialogUtil.createSettingsDialog('changeCreationMode', oSelectedControl.data('creationMode'), oSelectedControl.data('createAtEnd')).then(function(oCreationMode) {
							var sCreationMode = oCreationMode.selectedOption,
								bCreateAtEnd = oCreationMode.checked;
							return sCreationMode !== undefined ? [{ // The user chose a mode
								selectorControl : oSelectedControl,
								changeSpecificData : {
									changeType : 'changeCreationMode',
									content: {
										creationMode : sCreationMode,
										createAtEnd : bCreateAtEnd
									}
								}
							}] : []; // the user canceled
						});
					}
				},
				changeTableType: {
					icon: 'sap-icon://table-view',
					name: oResourceBundle.getText('TABLE_TABLETYPE_SETTINGS'),
					handler: function (oSelectedControl) {
						var sTableTypeName = oSelectedControl.getType().getMetadata().getName().split('.').pop();
						return DialogUtil.createSettingsDialog('changeTableType', sTableTypeName).then(function (sTableType) {
							return sTableType !== undefined ? [{ // The user chose a mode
								selectorControl: oSelectedControl,
								changeSpecificData: {
									changeType: 'changeTableType',
									content: {
										tableType: sTableType,
										previousTableType: sTableTypeName
									}
								}
							}] : []; // the user canceled
						});
					}
				}
			}
		}
	};
}, /* bExport= */ false);
