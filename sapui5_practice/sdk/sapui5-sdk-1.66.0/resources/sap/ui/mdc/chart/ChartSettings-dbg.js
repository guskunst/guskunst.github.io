/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/mdc/p13n/Util", 'sap/ui/mdc/library'
], function(Util, MDCLib) {
	"use strict";
	/**
	 * P13n/Settings helper class for sap.ui.mdc.Chart.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.chart.ChartSettings
	 */
	var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	var ChartSettings = {
		showPanel: function(oControl, sPanel, oSource, aProperties) {
			return new Promise(function(resolve, reject) {
				// Use case for more options
				ChartSettings["_getP13nStateOf" + sPanel](oControl, aProperties).then(function(mP13nState) {
					Util["showP13n" + sPanel](oSource, mP13nState.baseData, mP13nState.runtimeData, oControl, resolve);
				});
			});
		},
		_getP13nStateOfChart: function(oControl, aProperties) {
			return new Promise(function(resolve, reject) {
				var oAvailableRoles = {
					Dimension: [
						{
							key: MDCLib.ChartItemRoleType.category,
							text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY')
						}, {
							key: MDCLib.ChartItemRoleType.category2,
							text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY2')
						}, {
							key: MDCLib.ChartItemRoleType.series,
							text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_SERIES')
						}
					],
					Measure: [
						{
							key: MDCLib.ChartItemRoleType.axis1,
							text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS1')
						}, {
							key: MDCLib.ChartItemRoleType.axis2,
							text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS2')
						}, {
							key: MDCLib.ChartItemRoleType.axis3,
							text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS3')
						}
					]
				};
				var sDimension = MDCRb.getText('chart.PERSONALIZATION_DIALOG_TYPE_DIMENSION');
				var sMeasure = MDCRb.getText('chart.PERSONALIZATION_DIALOG_TYPE_MEASURE');
				var mInitialData = {};
				aProperties.forEach(function(oMetadataItem) {
					mInitialData[oMetadataItem.name] = oMetadataItem;
					// add role to the data, since it is not within the array yet
					oMetadataItem.availableRoles = oAvailableRoles[oMetadataItem.kind];
					oMetadataItem.visible = false;
				});
				resolve({
					baseData: {
						items: aProperties
					},
					runtimeData: {
						items: this.getItems().map(function(oItem) {
							return {
								id: oItem.getId(),
								name: oItem.getKey(), // alias
								label: oItem.getLabel() || mInitialData[oItem.getKey()].label,
								tooltip: oItem.getLabel() || mInitialData[oItem.getKey()].label,
								visible: oItem.getVisible(),
								kind: oItem.getVizItemType() === MDCLib.ChartItemType.Dimension ? sDimension : sMeasure,
								role: oItem.getRole(),
								aggregationMethod: mInitialData[oItem.getKey()].aggregationMethod,
								propertyPath: mInitialData[oItem.getKey()].propertyPath,
								availableRoles: oAvailableRoles[oItem.getVizItemType()]
							};
						})
					}
				});
			}.bind(oControl));
		},
		_getP13nStateOfSort: function(oControl, aProperties) {
			return new Promise(function(resolve, reject) {
				var mSortableMetadataItems = {};
				for (var i = 0; i < aProperties.length; i++) {
					if (aProperties[i].sortable && this._aInResultProperties.indexOf(aProperties[i].name) != -1) {
						mSortableMetadataItems[aProperties[i].name] = aProperties[i];
					}
				}
				var fnGetTextByKey = function(sKey, aItems) {
					var sText;
					aItems.some(function(oItem) {
						if (oItem.getKey() === sKey) {
							sText = oItem.getLabel();
							return true;
						}
					});
					return sText || mSortableMetadataItems[sKey].label;
				};
				var fnGetSortableMetadataItems = function(aItems) {
					var aP13nItems = [];
					for ( var sKey in mSortableMetadataItems) {
						aP13nItems.push({
							name: mSortableMetadataItems[sKey].name,
							label: fnGetTextByKey(sKey, aItems),
							tooltip: fnGetTextByKey(sKey, aItems),
							sortOrder: undefined,
							selected: false
						// sortDirection: mSortableMetadataItems[sKey].sortDirection // meaning: only ascending, only descending or both
						});
					}
					return aP13nItems;
				};
				var aItems = this.getItems();
				var aSorters = this._getSorters() ? this._getSorters() : [];
				resolve({
					baseData: {
						items: fnGetSortableMetadataItems(aItems)
					},
					runtimeData: {
						// Note: if a property coming from binding.aSorters is not sortable, then check how the property has been added to the
						// binding. We do not check it here.
						items: aSorters.map(function(oSorter) {
							return {
								name: oSorter.sPath,
								label: fnGetTextByKey(oSorter.sPath, aItems),
								tooltip: fnGetTextByKey(oSorter.sPath, aItems),
								sortOrder: oSorter.bDescending ? "Descending" : "Ascending",
								selected: true
							};
						})
					}
				});
			}.bind(oControl));
		}
	};
	return ChartSettings;
});
