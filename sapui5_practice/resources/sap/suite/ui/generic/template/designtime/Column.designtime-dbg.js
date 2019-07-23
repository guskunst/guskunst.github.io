sap.ui.define([
		"sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils",
		"sap/suite/ui/generic/template/changeHandler/util/AnnotationChangeUtilsV2",
		"sap/suite/ui/generic/template/designtime/utils/DesigntimeUtils",
		"sap/suite/ui/generic/template/js/AnnotationHelper",
		"sap/suite/ui/generic/template/designtime/virtualProperties/ColumnType",
		"sap/suite/ui/generic/template/designtime/virtualProperties/ChartType",
		"sap/suite/ui/generic/template/designtime/virtualProperties/ChartMeasures",
		"sap/suite/ui/generic/template/designtime/library.designtime"
	],
	function(Utils, AnnotationChangeUtils, DesigntimeUtils, AnnotationHelper, ColumnType, ChartType, ChartMeasures) {
		"use strict";

		var LINEITEM = "com.sap.vocabularies.UI.v1.LineItem",
			COLUMNTYPE_DATAFIELD = "DataField",
			COLUMNTYPE_RATING = "RatingIndicator",
			COLUMNTYPE_CONTACT = "Contact",
			COLUMNTYPE_PROGRESS = "ProgressIndicator",
			COLUMNTYPE_DATAFIELDFORACTION = "DataFieldForAction",
			COLUMNTYPE_INTENTBASEDNAV = "DataFieldWithIntentBasedNavigation",
			COLUMNTYPE_FORINTENTBASEDNAV = "DataFieldForIntentBasedNavigation",
			COLUMNTYPE_DATAFIELDWITHURL = "DataFieldWithUrl",
			COLUMNTYPE_CHART = "Chart",
			COLUMNTYPE_CONNECTEDFIELDS = "ConnectedFields",
			COLUMNTYPE_TOOLBARBUTTON = "ToolbarButton",
			COLUMNTYPE_WITHNAVPATH = "DataFieldWithNavigationPath";

		var ColumnDesigntime = {};

		/**
		 * Defines the valid control properties for sap.m.Column
		 *
		 * @param {sap.m.Column} oColumn - Table Column
		 * @returns {object} Object comprising all black or white-listed properties
		 */
		ColumnDesigntime.getColumnProperties = function(oColumn) {
			var oPropertiesBlackList = DesigntimeUtils.ignoreAllProperties(oColumn);

			var oPropertiesWhiteList = {
				// Control Properties:
				hAlign: {
					ignore: false
				},
				width: {
					ignore: false
				},
				// Virtual properties:
				columnType: {
					name: "Column type",
					virtual: true,
					nullable: false,
					ignore: function() {
						var oRecord = Utils.getLineItemRecordForColumn(oColumn);
						return oRecord === undefined;
					},
					type: "EnumType",
					possibleValues: ColumnType.getColumnTypeValues(oColumn),
					get: function(oColumn) {
						return ColumnType.getColumnType(oColumn);
					},
					set: function(oColumn, sNewColumnType) {
						return ColumnType.setColumnType(oColumn, sNewColumnType);
					}
				},
				chartType: {
					name: "Chart Type",
					virtual: true,
					nullable: false,
					ignore: function() {
						var sColumnType = ColumnType.getColumnType(oColumn);
						return sColumnType !== COLUMNTYPE_CHART;
					},
					type: "EnumType",
					possibleValues: ChartType.getChartTypeValues(oColumn),
					get: function(oElement) {
						return ChartType.getChartType(oElement);
					},
					set: function(oElement, sNewChartType) {
						return ChartType.setChartType(oElement, sNewChartType);
					}
				},
				vMeasures: {
					name: "Measures and Attributes",
					virtual: true,
					type: "Collection",
					nullable: false,
					ignore: function() {
						var sColumnType = ColumnType.getColumnType(oColumn);
						return sColumnType !== COLUMNTYPE_CHART;
					},
					visible: false,
					multiple: true,
					possibleValues: ChartMeasures.getMeasureDefinition(oColumn),
					get: function(oColumn) {
						return ChartMeasures.getMeasures(oColumn);
					},
					set: function(oColumn, aNewMeasures, oChange) {
						return ChartMeasures.setMeasures(oColumn, aNewMeasures, oChange);
					}
				}
			};

			return jQuery.extend(true, {}, oPropertiesBlackList, oPropertiesWhiteList);
		};

		/**
		 * Retrieves the propagated and redefined designtime for a sap.m.column element, as presented in a list report.
		 *
		 * @param {sap.m.Column} oElement The SAPUI5 Column element instance
		 * @returns {object} The designtime metadata containing embedded functions
		 * @public
		 */
		ColumnDesigntime.getDesigntime = function(oElement) {
			var oResourceBundle = sap.ui.getCore().getModel("i18nDesigntime").getResourceBundle();

			var sColumnType = ColumnType.getColumnType(oElement);
			if (sColumnType === COLUMNTYPE_TOOLBARBUTTON) {
				return {
					actions: null
				};
			}

			return {
				name: {
					singular: function() {
						return oResourceBundle.getText("FE_COLUMN");
					},
					plural: function() {
						return oResourceBundle.getText("FE_COLUMNS");
					}
				},
				getLabel: function(oElement) {
					return oElement.getHeader() && oElement.getHeader().getText();
				},
				getCommonInstanceData: function(oElement) {
					var oSmartTable = AnnotationHelper.getSmartTableControl(oElement);
					if (!oSmartTable) {
						return;
					}
					var sLineItemQualifier = AnnotationHelper.getLineItemQualifier(oSmartTable.getCustomData());
					var sQualifier = null;
					var aLineItems = Utils.getLineItems(oElement);
					var sLineItem = LINEITEM;
					if (sLineItemQualifier) {
						sLineItem = sLineItem + "#" + sLineItemQualifier;
						sQualifier = sLineItemQualifier;
					}
					var sRecordIndex = Utils.getLineItemRecordIndex(oElement, aLineItems),
						sTarget;
					if (sRecordIndex > -1) {
						var oEntityType = Utils.getODataEntityType(oElement);
						if (oEntityType) {
							sTarget = oEntityType.namespace + "." + oEntityType.name + "/" + sLineItem + "/" + sRecordIndex;
						}
					}
					return {
						target: sTarget,
						annotation: LINEITEM,
						qualifier: sQualifier //for LRP, could play a role on OBJ
					};
				},
				aggregations: {
					header: {
						ignore: true
					},
					footer: {
						ignore: true
					}
				},
				properties: function(oElement) {
					return ColumnDesigntime.getColumnProperties(oElement);
				},
				actions: {
					remove: {
						changeType: "removeTableColumn",
						changeOnRelevantContainer: true
					},
					reveal: {
						changeType: "revealTableColumn",
						changeOnRelevantContainer: true
					}
				},
				annotations: {
					columnDataField: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataField",
						ignore: function () {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_DATAFIELD;
						},
						whiteList: {
							properties: ["Label", "Value", "Criticality", "CriticalityRepresentation"],
							mandatory: ["Value"],
							expressionTypes: {
								Value: ["Path"],
								Criticality: ["Path"]
							}
						},
						appliesTo: ["Column"],
						links: {
							developer: [
								{
									href: "/topic/f0e1e1743bef4f519c34025ad4351f77.html",
									text: function () {
										return oResourceBundle.getText("FE_SDK_GUIDE_LINEITEMS");
									}
								}, {
									href: "/api/sap.ui.comp.smarttable.SmartTable/annotations/DataField",
									text: function () {
										return oResourceBundle.getText("FE_API_SMART_TABLE_ANNOTATIONS");
									}
								}
							]
						}
					},
					columnDataFieldWithUrl: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldWithUrl",
						ignore: function () {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_DATAFIELDWITHURL;
						},
						whiteList: {
							mandatory: ["Url", "Value"],
							expressionTypes: {
								Value: ["Path"]
							}
						},
						appliesTo: ["Column"],
						links: {
							developer: [
								{
									href: "/topic/f0e1e1743bef4f519c34025ad4351f77.html",
									text: function () {
										return oResourceBundle.getText("FE_SDK_GUIDE_LINEITEMS");
									}
								}, {
									href: "/api/sap.ui.comp.smarttable.SmartTable/annotations/DataFieldWithUrl",
									text: function () {
										return oResourceBundle.getText("FE_API_SMART_TABLE_ANNOTATIONS");
									}
								}
							]
						}
					},
					columnDataFieldWithNavigationPath: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldWithNavigationPath",
						ignore: function () {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_WITHNAVPATH;
						},
						whiteList: {
							properties: ["Label", "Value", "Target"],
							mandatory: ["Target", "Value"]
						},
						defaultValue: null,
						appliesTo: ["Column"],
						links: {
							developer: [
								{
									href: "/topic/2c65f07f44094012a511d6bd83f50f2d",
									text: function () {
										return oResourceBundle.getText("FE_SDK_GUIDE_INT_NAVI");
									}
								}
							]
						}
					},
					dataFieldForAction: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldForAction",
						whiteList: {
							properties: ["Action", "Label", "Criticality", "InvocationGrouping"],
							mandatory: ["Action"],
							expressionTypes: {
								Criticality: ["Path"]
							}
						},
						ignore: function () {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_DATAFIELDFORACTION;
						},
						appliesTo: ["Column"],
						links: {
							developer: [
								{
									href: "/topic/b623e0bbbb2b4147b2d0516c463921a0",
									text: function () {
										return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_ACTION");
									}
								}
							]
						}
					},
					dataFieldForAnnotationChartWithDimensions: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldForAnnotation",
						whiteList: {
							properties: ["Target", "Label"],
							mandatory: ["Target"]
						},
						refersTo: [{
							annotation: "chartWithDimensions",
							referredBy: "Target"
						}],
						ignore: function () {
							var sChartType = ChartType.getChartType(oElement);
							return sChartType === undefined || sChartType !== "Area";
						},
						appliesTo: ["Column"],
						links: {
							developer: [{
								href: "/topic/a797173b84724ef1bc54d59dc575e52f",
								text: function () {
									return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_CHART");
								}
							}]
						}
					},
					dataFieldForAnnotationChartNoDimensions: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldForAnnotation",
						whiteList: {
							properties: ["Target", "Label"],
							mandatory: ["Target"]
						},
						refersTo: [{
							annotation: "chartNoDimensions",
							referredBy: "Target"
						}],
						ignore: function () {
							var sChartType = ChartType.getChartType(oElement);
							return sChartType === undefined || sChartType === "Area";
						},
						appliesTo: ["Column"],
						links: {
							developer: [{
								href: "/topic/a797173b84724ef1bc54d59dc575e52f",
								text: function () {
									return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_CHART");
								}
							}]
						}
					},
					dataFieldForAnnotationRating: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldForAnnotation",
						whiteList: {
							properties: ["Target", "Label"],
							mandatory: ["Target"]
						},
						refersTo: [{
							annotation: "dataPointRating",
							referredBy: "Target"
						}],
						ignore: function () {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_RATING;
						},
						appliesTo: ["Column"],
						links: {
							developer: [{
								href: "/topic/a797173b84724ef1bc54d59dc575e52f",
								text: function () {
									return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_RATING");
								}
							}]
						}
					},
					dataFieldForAnnotationProgress: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldForAnnotation",
						whiteList: {
							properties: ["Target", "Label"],
							mandatory: ["Target"]
						},
						refersTo: [{
							annotation: "dataPointProgress",
							referredBy: "Target"
						}],
						ignore: function () {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_PROGRESS;
						},
						appliesTo: ["Column"],
						links: {
							developer: [{
								href: "/topic/43f6f0faa1b64c5aa92bcde379be9054",
								text: function () {
									return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_PROGRESS");
								}
							}]
						}
					},
					dataFieldForAnnotationContact: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldForAnnotation",
						whiteList: {
							properties: ["Target", "Label"],
							mandatory: ["Target"]
						},
						refersTo: [{
							annotation: "contact",
							referredBy: "Target"
						}],
						ignore: function () {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_CONTACT;
						},
						appliesTo: ["Column"],
						links: {
							developer: [{
								href: "/topic/677fbde43a324f36aa9398b7f04e9896",
								text: function () {
									return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_CONTACT");
								}
							}]
						}
					},
					dataFieldForAnnotationConnectedFields: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldForAnnotation",
						whiteList: {
							properties: ["Target", "Label"],
							mandatory: ["Target"]
						},
						refersTo: [{
							annotation: "fieldGroup",
							referredBy: "Target"
						}],
						ignore: function() {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_CONNECTEDFIELDS;
						},
						appliesTo: ["Column"]
					},
					dataFieldWithIBN: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldWithIntentBasedNavigation",
						ignore: function () {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_INTENTBASEDNAV;
						},
						whiteList: {
							properties: ["SemanticObject", "Action", "Label", "Value"],
							mandatory: ["SemanticObject"]
						},
						appliesTo: ["Column"]
					},
					dataFieldForIBN: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataFieldForIntentBasedNavigation",
						ignore: function() {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_FORINTENTBASEDNAV;
						},
						whiteList: {
							properties: ["SemanticObject", "Action", "Label", "RequiresContext"],
							mandatory: ["SemanticObject", "RequiresContext"]
						},
						appliesTo: ["Column"]
					},
					chartWithDimensions: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "Chart",
						ignore: function() {
							var sChartType = ChartType.getChartType(oElement);
							return sChartType === undefined || sChartType !== "Area";
						},
						target: ["EntityType"],
						whiteList: {
							properties: [
								"Description",
								"Dimensions",
								"vMeasures"  //virtual property
							],
							mandatory: ["Dimensions", "vMeasures"]
						},
						appliesTo: ["Column"],
						links: {
							developer: [{
								href: "/topic/b8312a4adde54f33a89480dbe12d8632",
								text: function() {
									return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_CHART");
								}
							}]
						}
					},
					chartNoDimensions: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "Chart",
						ignore: function() {
							var sChartType = ChartType.getChartType(oElement);
							return sChartType === undefined || sChartType === "Area";
						},
						target: ["EntityType"],
						whiteList: {
							properties: [
								"Description",
								"vMeasures"  //virtual property
							],
							mandatory: ["vMeasures"]
						},
						appliesTo: ["Column"],
						links: {
							developer: [{
								href: "/topic/b8312a4adde54f33a89480dbe12d8632",
								text: function() {
									return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_CHART");
								}
							}]
						}
					},
					fieldGroup: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "FieldGroup",
						whiteList: {
							properties: ["Data"]
						},
						ignore: function() {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_CONNECTEDFIELDS;
						}
					},
					dataPointRating: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataPoint",
						target: ["EntityType"],
						links: {
							developer: [{
								href: "/topic/a797173b84724ef1bc54d59dc575e52f",
								text:  function() {
									return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_RATING");
								}
							}]
						},
						whiteList: {
							properties: ["Value", "TargetValue"],
							mandatory: ["Value"],
							expressionTypes: {
								Value: ["Path"],
								TargetValue: ["Path", "String", "Int", "Decimal"]
							}
						},
						ignore: function() {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_RATING;
						}
					},
					dataPointProgress: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "DataPoint",
						target: ["EntityType"],
						links: {
							developer: [{
								href: "/topic/43f6f0faa1b64c5aa92bcde379be9054",
								text:  function() {
									return oResourceBundle.getText("FE_SDK_GUIDE_TABLE_PROGRESS");
								}
							}]
						},
						whiteList: {
							properties: ["Value", "TargetValue"],
							mandatory: ["Value"],
							expressionTypes: {
								Value: ["Path"],
								TargetValue: ["Path", "String", "Int", "Decimal"]
							}
						},
						ignore: function() {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_PROGRESS;
						}
					},
					columnLabelOnProperty: { ignore: true },
					//columnVisible: {
					//	namespace: "com.sap.vocabularies.Common.v1",
					//	annotation: "FieldControl",
					//	target: ["Property"],
					//	whiteList: {
					//		values: ["Hidden"]
					//	},
					//	appliesTo: ["Column"],
					//	group: ["Behavior"],
					//	since: "1.28.1"
					//},
					//columnCurrencyCode: {
					//	namespace: "Org.OData.Measures.V1",
					//	annotation: "ISOCurrency",
					//	target: ["Property"],
					//	appliesTo: ["Column"],
					//	group: ["Behavior"],
					//	since: "1.28.1"
					//},
					//columnUnitOfMeasure: {
					//	namespace: "Org.OData.Measures.V1",
					//	annotation: "Unit",
					//	target: ["Property"],
					//	appliesTo: ["Column"],
					//	group: ["Behavior"],
					//	since: "1.28.1"
					//},
					//columnUpperCase: {
					//	namespace: "com.sap.vocabularies.Common.v1",
					//	annotation: "IsUpperCase",
					//	target: ["Property"],
					//	defaultValue: "true",
					//	appliesTo: ["Column"],
					//	group: ["Behavior"],
					//	since: "1.28.1"
					//},

					contact: {
						namespace: "com.sap.vocabularies.Communication.v1",
						annotation: "Contact",
						ignore: function() {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType !== COLUMNTYPE_CONTACT;
						},
						target: ["EntityType"],
						whiteList: {
							properties: [
								"fn", "n", "tel", "email", "photo", "title", "org", "role"
							],
							expressionTypes: {
								fn: ["Path"],
								photo: ["Path"],
								title: ["Path"],
								org: ["Path"],
								role: ["Path"]
							}
						},
						appliesTo: ["Column"],
						links: {
							developer: [{
								href: "/topic/677fbde43a324f36aa9398b7f04e9896",
								text: "FE_SDK_GUIDE_TABLE_CONTACT"
							}]
						}
					},
					textArrangement: { ignore: true },
					columnImportance: {
						namespace: "com.sap.vocabularies.UI.v1",
						annotation: "Importance",
						target: ["Record"],
						appliesTo: ["Column"],
						ignore: function() {
							var sColumnType = ColumnType.getColumnType(oElement);
							return sColumnType === undefined;   // ==> break-out column
						},
						links: {
							developer: [
								{
									href: "/topic/69efbe747fc44c0fa445b24ed369cb1e",
									text: function() {
										return oResourceBundle.getText("FE_SDK_GUIDE_RESPONSIVENESS");
									}
								}, {
									href: "/api/sap.ui.comp.smarttable.SmartTable/annotations/Importance",
									text: function() {
										return oResourceBundle.getText("FE_API_SMART_TABLE_ANNOTATIONS");
									}
								}
							]
						}
					}
					//columnIsImageURL: {
					//	namespace: "com.sap.vocabularies.UI.v1",
					//	annotation: "IsImageURL",
					//	defaultValue: "false",
					//	target: ["Property"],
					//	appliesTo: ["SmartTable/customData/p13nData"],
					//	links: {
					//		developer: [{
					//			href: "/topic/492bc791a7bd41cd9932fdf5d3aa2656",
					//			text: function() {
					//				return oResourceBundle.getText("FE_SDK_GUIDE_IMAGES");
					//			}
					//		}, {
					//			href: "/api/sap.ui.comp.smarttable.SmartTable/annotations/IsImageURL",
					//			text: function() {
					//				return oResourceBundle.getText("FE_API_SMART_TABLE_ANNOTATIONS");
					//			}
					//		}]
					//	}
					//}
				}
			};
		};

		return ColumnDesigntime;
	});
