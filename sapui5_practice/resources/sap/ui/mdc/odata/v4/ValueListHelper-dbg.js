/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
/* global Promise */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/XMLTemplateProcessor',
	"sap/ui/model/json/JSONModel",
	'sap/ui/core/util/XMLPreprocessor',
	'sap/ui/core/Fragment',
	"sap/m/MessageToast",
	"sap/ui/mdc/base/InParameter",
	"sap/ui/mdc/base/OutParameter"
	//Just to be loaded for templating
	//"sap/ui/mdc/base/FieldValueHelp"
], function (jQuery, XMLTemplateProcessor, JSONModel, XMLPreprocessor, Fragment, MessageToast, InParameter, OutParameter) {
	"use strict";
	var waitForPromise = {};
	var ValueListHelper = {
		getValueListCollectionEntitySet: function(oValueListContext) {
			var mValueList = oValueListContext.getObject();
			return mValueList.$model.getMetaModel().createBindingContext("/" + mValueList.CollectionPath);
		},
		getValueListProperty: function(oPropertyContext) {
			var oValueListModel = oPropertyContext.getModel();
			var mValueList = oValueListModel.getObject("/");
			return mValueList.$model.getMetaModel().createBindingContext('/' + mValueList.CollectionPath + '/' + oPropertyContext.getObject());
		},
		showValueListInfo: function(propertyPath, oFVH, bSuggestion, sConditionModel) {
			var oModel = oFVH.getModel(),
				oMetaModel = oModel.getMetaModel(),
				//sFVH = oControl.getFieldHelp(), oFVH = sap.ui.getCore().byId(sFVH),
				sFVHClass = oFVH.getMetadata().getName(),
				oWrapper = oFVH.getContent && oFVH.getContent(),
				sWrapperId = oWrapper.getId(),
				oTable = oWrapper && oWrapper.getTable && oWrapper.getTable(),
				oFilterBar = oFVH && oFVH.getFilterBar && oFVH.getFilterBar(),
				sPropertyName = oMetaModel.getObject(propertyPath + "@sapui.name"),
				bExists = oTable && oFilterBar,
				sKey, sFilterFields = "", sDescriptionPath;
			if (waitForPromise[sWrapperId] || bExists ) {
				return;
			} else {
				if (!oTable) {
					waitForPromise[sWrapperId] = true;
				}
				oMetaModel.requestValueListInfo(propertyPath).then(function(mValueListInfo) {
					var bProcessInOut = oFVH.getInParameters().length + oFVH.getOutParameters().length === 0;
					// take the "" one if exists, otherwise take the first one in the object TODO: to be discussed
					mValueListInfo = mValueListInfo[mValueListInfo[""] ? "" : Object.keys(mValueListInfo)[0]];
					// Make sure the oWrapper has the value list model set as default model
					oWrapper.setModel(mValueListInfo.$model);
					// Determine the settings
					// TODO: since this is a static function we can't store the infos when filterbar is requested later
					// TODO: Implement as custom data
					mValueListInfo.Parameters.forEach(function(entry) {
						//All String fields are allowed for filter
						var sPropertyPath = '/' + mValueListInfo.CollectionPath + '/' + entry.ValueListProperty,
							oProperty = mValueListInfo.$model.getMetaModel().getObject(sPropertyPath),
							oPropertyAnnotations = mValueListInfo.$model.getMetaModel().getObject(sPropertyPath + '@');
						//Search for the *out Parameter mapped to the local property
						if (!sKey && entry.$Type.indexOf('Out') > 48 && entry.LocalDataProperty.$PropertyPath === sPropertyName) { //"com.sap.vocabularies.Common.v1.ValueListParameter".length = 49
							sKey = entry.ValueListProperty;
							//Only the text annotation of the key can specify the description
							sDescriptionPath = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path;
						}
						if (oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"]){
							return;
						}
						if (!sFilterFields && oProperty.$Type === "Edm.String" && !oPropertyAnnotations["@com.sap.vocabularies.UI.v1.HiddenFilter"]) {
							//TODO: Ask why I can only specify one filter field? Maybe , is the wrong syntax...
							sFilterFields = sFilterFields.length > 0 ? sFilterFields + ',' + entry.ValueListProperty : entry.ValueListProperty;
						}
						//Collect In and Out Parameter (except the field in question)
						if (bProcessInOut
								&& entry.$Type !== "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly"
								&& entry.LocalDataProperty.$PropertyPath !== sPropertyName) {
							var sValuePath = "";
							if (sConditionModel && sConditionModel.length > 0) {
								sValuePath = sConditionModel + ">/conditions/";
							}
							sValuePath = '{' + sValuePath + entry.LocalDataProperty.$PropertyPath + '}';
							//Out and InOut
							if (entry.$Type.indexOf('Out') > 48) {
								oFVH.addOutParameter(new OutParameter({
									value: sValuePath,
									helpPath: entry.ValueListProperty
								}));
							}
							//In and InOut
							if (entry.$Type.indexOf('In') > 48) {
								oFVH.addInParameter(new InParameter({
									value: sValuePath,
									helpPath: entry.ValueListProperty
								}));
							}
							//otherwise displayOnly and therefor not considered
						}
					});
					//Only do this the first time
					if (!oTable) {
						if (sFVHClass.indexOf("FieldValueHelp") > -1) {
							//Complete the field value help control
							oFVH.setTitle(mValueListInfo.Label);
							//TODO Clarify setKeyPath and setDescriptionPath. They may be for the (F)Fields not for the value helps
							oFVH.setKeyPath(sKey);
							oFVH.setDescriptionPath(sDescriptionPath);
							//TODO: We need $search as the setFilterFields is used for type ahead. If I don't set any field it type ahead doesn't work
							oFVH.setFilterFields("$search");
						}
					}
					function templateFragment(sFragmentName) {
						var oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, 'fragment'),
							oValueListModel = new JSONModel(mValueListInfo),
							oValueListServiceMetaModel = mValueListInfo.$model.getMetaModel(),
							oSourceModel = new JSONModel({
								id: oFVH.getId()
							});
						return XMLPreprocessor.process(oFragment, {}, { //querySelector("*")
							bindingContexts: {
								valueList: oValueListModel.createBindingContext("/"),
								entitySet: oValueListServiceMetaModel.createBindingContext("/" + mValueListInfo.CollectionPath),
								source: oSourceModel.createBindingContext("/")
							},
							models: {
								valueList: oValueListModel,
								entitySet: oValueListServiceMetaModel,
								source: oSourceModel
							}})
							.then(function(oFragment) {
								var oLogInfo = {path: propertyPath, fragmentName: sFragmentName, fragment: oFragment};
								if (jQuery.sap.log.getLevel() === jQuery.sap.log.Level.DEBUG) {
									//In debug mode we log all generated fragments
									ValueListHelper.ALLFRAGMENTS = ValueListHelper.ALLFRAGMENTS || [];
									ValueListHelper.ALLFRAGMENTS.push(oLogInfo);
								}
								if (ValueListHelper.logFragment) {
									//One Tool Subscriber allowed
									setTimeout(function() {
										ValueListHelper.logFragment(oLogInfo);
									}, 0);
								}
								return Fragment.load({definition:oFragment});
							});
					}
					oTable = oTable || templateFragment('sap.ui.mdc.odata.v4.ValueListTable');
					//Create filter bar if not there and requested via bSuggestion===false
					if (sFilterFields.length){
						oFilterBar = oFilterBar	|| !bSuggestion && templateFragment('sap.ui.mdc.odata.v4.ValueListFilterBar');
					} else {
						oFilterBar = Promise.resolve();
					}
					return Promise.all([oTable, oFilterBar]).then(function(aControls) {
						var oTable = aControls[0], oFilterBar = aControls[1];
						if (oTable) {
							jQuery.sap.log.info('Value List XML content created [' + propertyPath + ']', oTable.getMetadata().getName(), "MDC Templating");
						}
						if (oFilterBar) {
							jQuery.sap.log.info('Value List XML content created [' + propertyPath + ']', oFilterBar.getMetadata().getName(), "MDC Templating");
						}
						if (oTable !== oWrapper.getTable()) {
							oWrapper.setTable(oTable);
							delete waitForPromise[sWrapperId];
						}
						if (oFilterBar && oFilterBar !== oFVH.getFilterBar()) {
							oFVH.setFilterBar(oFilterBar);
						}
					});
				})
				.catch(function(exc) {
					var sMsg = exc.status && exc.status === 404 ? "Metadata not found (" + exc.status + ") for value help of property " + propertyPath  : exc.message;
					jQuery.sap.log.error(sMsg);
					MessageToast.show(sMsg);
				});
			}
		}
	};
	return ValueListHelper;
}, /* bExport= */ true);
