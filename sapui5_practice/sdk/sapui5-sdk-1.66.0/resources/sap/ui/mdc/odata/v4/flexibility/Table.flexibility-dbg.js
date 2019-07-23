/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/XMLTemplateProcessor',
	'sap/ui/core/util/XMLPreprocessor',
	'sap/ui/core/Fragment',
	'sap/ui/model/json/JSONModel'
], function (XMLTemplateProcessor, XMLPreprocessor, Fragment, JSONModel) {
	'use strict';
	var NS_MACRODATA = 'http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1',
		NS_MDC = 'sap.ui.mdc',
		CREATIONMODE_CREATIONROW = {
			NAME: 'CreationRow',
			FRAGMENTNAME: 'sap.ui.mdc.odata.v4.table.CreationRow'
		},
		TABLETYPE_RESPONSIVE = 'ResponsiveTableType',
		TABLETYPE_GRID = 'GridTableType';

	var fnTemplateCreationRow = function (oFragment, oControl, mParameters) {
		var sId = oControl.getId && oControl.getId() || oControl.getAttribute('id'),
			// TODO: confirm id below, we need this to pass to apply handler to get the list binding in FE
			oThis = new JSONModel({
				id: sId.substr(sId.indexOf(mParameters.viewId) + mParameters.viewId.length + 2),
				showCreate: mParameters.visible,
				onCreate: mParameters.onCreate,
				createAtEnd: mParameters.createAtEnd
			});
		return Promise.resolve(XMLPreprocessor.process(oFragment, {}, {
			bindingContexts: {
				'this': oThis.createBindingContext('/')
			},
			models: {
				'this': oThis
			}
		})).then(function(oFragment) {
			var oCreationRow = oFragment.getElementsByTagNameNS('sap.ui.mdc', 'CreationRow')[0];
			// mParameters.modifier.setPropertyBinding(oCreationRow, 'visible', mParameters.visible);
			oCreationRow.setAttribute('visible', mParameters.visible);
			return oControl.getId && Fragment.load({definition:oFragment}) || oCreationRow;
		});
	};

	var fnTemplateFragment = function (sFragmentName, oControl, mParameters) {
		var oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, 'fragment');
		// if (sFragmentName === CREATIONMODE_CREATIONROW.FRAGMENTNAME)
		return fnTemplateCreationRow(oFragment, oControl, mParameters);
	};

	return {
		'changeCreationMode': {
			'changeHandler': {
				applyChange: function (oChange, oTable, mPropertyBag) {
					var mContent = oChange.getContent(),
						oModifier = mPropertyBag.modifier,
						oSelector = oChange.getSelector(),
						oControl = oModifier.bySelector(oSelector, mPropertyBag.appComponent, mPropertyBag.view),
						sViewId = mPropertyBag.viewId || mPropertyBag.view.getId(),
						sCreationModeOriginalValue, bCreateAtEndOriginalValue, sShowCreate, sOnCreate, oCreateButton;

					if (oModifier.targets === 'xmlTree') {
						// XML Templating
						sCreationModeOriginalValue = oControl.getAttributeNS(NS_MACRODATA, 'creationMode');
						bCreateAtEndOriginalValue = oControl.getAttributeNS(NS_MACRODATA, 'createAtEnd');
						sShowCreate = oControl.getAttributeNS(NS_MACRODATA, 'showCreate');
						sOnCreate = oControl.getAttributeNS(NS_MACRODATA, 'onCreate');
					} else {
						// RUNTIME
						sCreationModeOriginalValue = oControl.data('creationMode');
						bCreateAtEndOriginalValue = oControl.data('createAtEnd');
						sShowCreate = oControl.data('showCreate');
						sOnCreate = oControl.data('onCreate');
					}
					// sCreationModeOriginalValue = oModifier.getProperty(oControl, 'macrodata:creationMode'); // this doesn't work runtime
					if (sCreationModeOriginalValue !== mContent.creationMode) {
						oChange.setRevertData({
							creationMode: sCreationModeOriginalValue,
							createAtEnd: bCreateAtEndOriginalValue
						});
						if (oModifier.targets === 'xmlTree') {
							// XML Templating
							oControl.setAttributeNS(NS_MACRODATA, 'creationMode', mContent.creationMode);
							oControl.setAttributeNS(NS_MACRODATA, 'createAtEnd', mContent.createAtEnd);
						} else {
							// RUNTIME
							oControl.data('creationMode', mContent.creationMode);
							oControl.data('createAtEnd', mContent.createAtEnd);
						}
						// oModifier.setProperty(oControl, 'macrodata:creationMode', mContent.creationMode);
						if (mContent.creationMode === CREATIONMODE_CREATIONROW.NAME) {
							fnTemplateFragment(CREATIONMODE_CREATIONROW.FRAGMENTNAME, oControl, {
								visible: sShowCreate,
								onCreate: sOnCreate,
								createAtEnd: mContent.createAtEnd,
								metaModel: mPropertyBag.appComponent.getModel().getMetaModel(),
								modifier: oModifier,
								viewId: sViewId
							}).then(function (oCreationRow) {
								oCreateButton = oModifier.getAggregation(oControl, 'actions').filter(function(action) {
									return oModifier.getId(action) && oModifier.getId(action).indexOf("::Create") > -1;
								})[0];
								oModifier.setVisible(oCreateButton, false);
								oModifier.insertAggregation(oControl, 'creationRow', oCreationRow, 0, mPropertyBag.view);
							});
						} else if (sCreationModeOriginalValue === CREATIONMODE_CREATIONROW.NAME) {
							oCreateButton = oModifier.getAggregation(oControl, 'actions').filter(function(action) {
								return oModifier.getId(action) && oModifier.getId(action).indexOf("::Create") > -1;
							})[0];
							oModifier.setPropertyBinding(oCreateButton, 'visible', sShowCreate);
							// TODO: confirm removing creation row
							oModifier.getAggregation(oControl, 'creationRow').destroy();
						}
					}
				},
				revertChange: function (oChange, oTable, mPropertyBag) {
					var oModifier = mPropertyBag.modifier,
						mContent = oChange.getRevertData(),
						oSelector = oChange.getSelector(),
						oControl = oModifier.bySelector(oSelector, mPropertyBag.appComponent, mPropertyBag.view),
						sViewId = mPropertyBag.viewId || mPropertyBag.view.getId(),
						sShowCreate, sOnCreate, oCreateButton;

					if (oModifier.targets === 'xmlTree') {
						// XML Templating
						oControl.setAttributeNS(NS_MACRODATA, 'creationMode', mContent.creationMode);
						oControl.setAttributeNS(NS_MACRODATA, 'createAtEnd', mContent.createAtEnd);
						sShowCreate = oControl.getAttributeNS(NS_MACRODATA, 'showCreate');
						sOnCreate = oControl.getAttributeNS(NS_MACRODATA, 'onCreate');
					} else {
						// RUNTIME
						oControl.data('creationMode', mContent.creationMode);
						sShowCreate = oControl.data('showCreate');
						sOnCreate = oControl.data('onCreate');
					}
					if (mContent.creationMode === 'CreationRow') {
						oCreateButton = oModifier.getAggregation(oControl, 'actions').filter(function(action) {
							return oModifier.getId(action) && oModifier.getId(action).indexOf("::Create") > -1;
						})[0];
						oModifier.setVisible(oCreateButton, false);
						fnTemplateFragment(CREATIONMODE_CREATIONROW.FRAGMENTNAME, oControl, {
							visible: sShowCreate,
							onCreate: sOnCreate,
							createAtEnd: mContent.createAtEnd,
							metaModel: mPropertyBag.appComponent.getModel().getMetaModel(),
							modifier: oModifier,
							viewId: sViewId
						}).then(function (oCreationRow) {
							oModifier.insertAggregation(oControl, 'creationRow', oCreationRow, 0, mPropertyBag.view);
						});
					}
				},
				completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
					// No special handling required
				}
			},
			'layers': {
				'CUSTOMER_BASE': false,
				'CUSTOMER': false
			}
		},
		'changeTableType': {
			'changeHandler': {
				applyChange: function (oChange, oTable, mPropertyBag) {
					var mContent = oChange.getContent();
					var oModifier = mPropertyBag.modifier;
					var oSelector = oChange.getSelector();
					var oSourceControl = oModifier.bySelector(oSelector, mPropertyBag.appComponent, mPropertyBag.view);

					if (oModifier.targets === 'xmlTree') {
						// XML Templating
						if (mContent.previousTableType !== mContent.tableType) {
							oChange.setRevertData({
								tableType: mContent.previousTableType
							});
							var oTableNode = oSourceControl.getElementsByTagNameNS(NS_MDC, 'type')[0];
							var oCurrentTableTypeNode = oTableNode.getElementsByTagNameNS(NS_MDC, mContent.tableType === TABLETYPE_RESPONSIVE ? TABLETYPE_GRID : TABLETYPE_RESPONSIVE)[0];
							oTableNode.removeChild(oCurrentTableTypeNode);
							var oNewTableTypeNode = document.createElementNS(NS_MDC, mContent.tableType);
							if (mContent.tableType === TABLETYPE_GRID) {
								oNewTableTypeNode.setAttribute('rowCountMode', 'Fixed');
								oNewTableTypeNode.setAttribute('rowCount', 10);
							}
							oTableNode.appendChild(oNewTableTypeNode);
						}
					}
				},
				revertChange: function (oChange, oTable, mPropertyBag) {
					var oModifier = mPropertyBag.modifier;
					var oRevertData = oChange.getRevertData();
					var oSelector = oChange.getSelector();
					var oSourceControl = oModifier.bySelector(oSelector, mPropertyBag.appComponent, mPropertyBag.view);

					if (oModifier.targets === 'xmlTree') {
						// XML Templating
						var oTableNode = oSourceControl.getElementsByTagNameNS(NS_MDC, 'type')[0];
						var oPreviousTableTypeNode = oTableNode.getElementsByTagNameNS(NS_MDC, oRevertData.tableType === TABLETYPE_RESPONSIVE ? TABLETYPE_GRID : TABLETYPE_RESPONSIVE)[0];
						oTableNode.removeChild(oPreviousTableTypeNode);
						var oCurrentTableTypeNode = document.createElementNS(NS_MDC, oRevertData.tableType);
						if (oRevertData.tableType === TABLETYPE_GRID) {
							oCurrentTableTypeNode.setAttribute('rowCountMode', 'Fixed');
							oCurrentTableTypeNode.setAttribute('rowCount', 10);
						}
						oTableNode.appendChild(oCurrentTableTypeNode);
					}
				},
				completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
					// No special handling required
				}
			},
			'layers': {
				'CUSTOMER_BASE': false,
				'CUSTOMER': false
			}
		}
	};
});
