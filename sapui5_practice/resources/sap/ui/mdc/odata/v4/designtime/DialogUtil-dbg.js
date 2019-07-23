/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
// Provides the Dialogs for Design Time Metadata Features of OData v4 Macros
sap.ui.define([
	'sap/ui/core/Fragment',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/json/JSONModel'
], function (Fragment, ResourceModel, JSONModel) {
	'use strict';
	var oResourceModel = new ResourceModel({
			bundleName: 'sap.ui.mdc.odata.v4.designtime.messagebundle',
			async: true
		}),
		oResourceModelPromise = new Promise(function (resolve, reject) {
			oResourceModel.attachRequestCompleted(resolve);
		}),
		oScope = {
			dialog: null
		},
		CREATIONMODE_NEWPAGE = 'NewPage',
		CREATIONMODE_INLINE = 'Inline',
		CREATIONMODE_CREATIONROW = 'CreationRow',
		TABLETYPE_RESPONSIVE = 'ResponsiveTableType',
		TABLETYPE_GRID = 'GridTableType';

	function createSettingsDialog(sChangeType, sSelectedOption, bCreateAtEnd) {
		return new Promise(function (resolve) {
			var sFragmentID = 'settingsDialogFragment';
			//Always take the new promise
			oScope.resolve = resolve;
			Promise.all([
				oScope.dialog ? Promise.resolve(oScope.dialog) : Fragment.load({
					id: sFragmentID, //TODO must save the dialog and reuse it
					name: 'sap.ui.mdc.odata.v4.designtime.fragments.SettingsDialog',
					controller: {
						apply: function (oEvent) {
							var oResult = {
								selectedOption : oScope.dialog.getContent()[0].getItems()[1].getSelectedButton().data('selectedOption'),
								checked : oScope.dialog.getContent()[0].getItems().length > 2 ? oScope.dialog.getContent()[0].getItems()[2].getSelected() : undefined
							};
							oScope.dialog.close();
							oScope.resolve(oResult);
						},
						cancel: function () {
							oScope.dialog.close();
							oScope.resolve();
						}
					}
				}), oResourceModelPromise
			]).then(function (aResults) {
				var oDialog = aResults[0],
					aOptions = {},
					oDialogModel, iSelectedIndex, sCurrentSelectedOption;

				if (sChangeType === 'changeCreationMode') {
					sCurrentSelectedOption = sSelectedOption || CREATIONMODE_INLINE;
					aOptions.radioOptions = [{
							option: CREATIONMODE_NEWPAGE,
							text: oResourceModel.getProperty('TABLE_CREATIONMODE_NEWPAGE')
						},
						{
							option: CREATIONMODE_INLINE,
							text: oResourceModel.getProperty('TABLE_CREATIONMODE_INLINE')
						},
						{
							option: CREATIONMODE_CREATIONROW,
							text: oResourceModel.getProperty('TABLE_CREATIONMODE_CREATIONROW')
						}];
					aOptions.checkOptions = {checked: bCreateAtEnd};
				} else if (sChangeType === 'changeTableType') {
					sCurrentSelectedOption = sSelectedOption || TABLETYPE_RESPONSIVE;
					aOptions.radioOptions = [{
							option: TABLETYPE_RESPONSIVE,
							text: oResourceModel.getProperty('TABLE_TABLETYPE_RESPONSIVE')
						},
						{
							option: TABLETYPE_GRID,
							text: oResourceModel.getProperty('TABLE_TABLETYPE_GRID')
						}];
				}

				//remember for controller above so we only create it once
				oScope.dialog = oDialog;

				for (var i = 0; i < aOptions.length; i++) {
					if (aOptions[i].option === sCurrentSelectedOption) {
						iSelectedIndex = i;
						break;
					}
				}

				oDialogModel = new JSONModel({
					initialMode: sCurrentSelectedOption,
					selectedIndex: iSelectedIndex,
					options: aOptions.radioOptions,
					checkOptions: aOptions.checkOptions,
					changeType: sChangeType
				});

				oDialog.setModel(oDialogModel, 'dm');
				oDialog.setModel(oResourceModel, 'i18n');
				oDialog.open();
			});
		});
	}

	return {
		createSettingsDialog: createSettingsDialog
	};
});
