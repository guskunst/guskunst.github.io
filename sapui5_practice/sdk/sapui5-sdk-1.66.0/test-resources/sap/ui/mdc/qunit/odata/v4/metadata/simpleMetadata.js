sap.ui.define([], function () {
	"use strict";
	return {
		"$Version": "4.0",
		"$Reference": {
			"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_UI',Version='0001',SAP__Origin='LOCAL')/$value": {
				"$Include": [
					"com.sap.vocabularies.UI.v1."
				]
			},
			"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_COMMUNICATION',Version='0001',SAP__Origin='LOCAL')/$value": {
				"$Include": [
					"com.sap.vocabularies.Communication.v1."
				]
			},
			"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_COMMON',Version='0001',SAP__Origin='LOCAL')/$value": {
				"$Include": [
					"com.sap.vocabularies.Common.v1."
				]
			},
			"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_MEASURES',Version='0001',SAP__Origin='LOCAL')/$value": {
				"$Include": [
					"Org.OData.Measures.V1."
				]
			},
			"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_CORE',Version='0001',SAP__Origin='LOCAL')/$value": {
				"$Include": [
					"Org.OData.Core.V1."
				]
			},
			"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_CAPABILITIES',Version='0001',SAP__Origin='LOCAL')/$value": {
				"$Include": [
					"com.sap.vocabularies.Capabilities.v1."
				]
			},
			"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_AGGREGATION',Version='0001',SAP__Origin='LOCAL')/$value": {
				"$Include": [
					"Org.OData.Aggregation.V1."
				]
			},
			"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_VALIDATION',Version='0001',SAP__Origin='LOCAL')/$value": {
				"$Include": [
					"Org.OData.Validation.V1."
				]
			}
		},
		"someNamespace.": {
			//ODataMetaModel.js expects the annotations under the namespace and moves it a level higher
			"$Annotations": {
				"someNamespace.someEntityType": {
					"@com.sap.vocabularies.UI.v1.LineItem": [
						{
							"@com.sap.vocabularies.UI.v1.Importance": {
								"$EnumMember": "com.sap.vocabularies.UI.v1.ImportanceType/High"
							},
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "PropertyQuantity",
							"Value": {
								"$Path": "PropertyQuantity"
							}
						},
						{
							"@com.sap.vocabularies.UI.v1.Importance": {
								"$EnumMember": "com.sap.vocabularies.UI.v1.ImportanceType/High"
							},
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "PropertyUnit",
							"Value": {
								"$Path": "PropertyUnit"
							}
						},
						{
							"@com.sap.vocabularies.UI.v1.Importance": {
								"$EnumMember": "com.sap.vocabularies.UI.v1.ImportanceType/High"
							},
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "PropertyAmount",
							"Value": {
								"$Path": "PropertyAmount"
							}
						},
						{
							"@com.sap.vocabularies.UI.v1.Importance": {
								"$EnumMember": "com.sap.vocabularies.UI.v1.ImportanceType/High"
							},
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "PropertyCurrency",
							"Value": {
								"$Path": "PropertyCurrency"
							}
						}
					],
					"@com.sap.vocabularies.UI.v1.DataPoint#noTargetValue": {
						"Value": {
							"$Path": "PropertyInt16"
						},
						"Title": "Property Int 16"
					},
					"@com.sap.vocabularies.UI.v1.DataPoint#withTargetValueDynamic": {
						"Value": {
							"$Path": "PropertyInt16"
						},
						"TargetValue": {
							"$Path": "PropertyInt32"
						},
						"Title": "Property Int 16"
					},
					"@com.sap.vocabularies.UI.v1.DataPoint#withTargetValueStatic": {
						"Value": {
							"$Path": "PropertyInt16"
						},
						"TargetValue": 5,
						"Title": "Property Int 16"
					},
					"@com.sap.vocabularies.UI.v1.DataPoint#HelpfulCount": {
						"Value": {
							"$Path": "PropertyInt16"
						},
						"Title": "Feedback",
						"TargetValue": {
							"$Path": "PropertyInt32"
						},
						"Visualization": {
							"$EnumMember": "com.sap.vocabularies.UI.v1.VisualizationType/Progress"
						}
					},
					"@com.sap.vocabularies.UI.v1.DataPoint#HelpfulTotal": {
						"Value": {
							"$Path": "PropertyInt16"
						},
						"Title": "Feedback",
						"TargetValue": {
							"$Path": "PropertyInt32"
						},
						"Visualization": {
							"$EnumMember": "com.sap.vocabularies.UI.v1.VisualizationType/Progress"
						}
					}
				},
				"someNamespace.someEntityType/PropertyInt16": {
					"@com.sap.vocabularies.Common.v1.Label": "Property of Type Int16"
				},
				"someNamespace.someEntityType/PropertyQuantity": {
					"@com.sap.vocabularies.Common.v1.Label": "Property that is a Quantity",
					"@com.sap.vocabularies.Common.v1.FieldControl": {
						"$Path": "__FieldControl/PropertyUnit"
					},
					"@com.sap.vocabularies.Common.v1.Heading": "Reqd Qty",
					"@Org.OData.Measures.V1.Unit": {
						"$Path": "PropertyUnit"
					}
				},
				"someNamespace.someEntityType/PropertyUnit": {
					"@com.sap.vocabularies.Common.v1.Label": "Property that is a Unit",
					"@com.sap.vocabularies.Common.v1.Text": {
						"$Path": "_Unit/UnitOfMeasure_Text"
					},
					"@com.sap.vocabularies.Common.v1.Heading": "RQ Unit",
					"@com.sap.vocabularies.Common.v1.QuickInfo": "Quantity Unit",
					"@com.sap.vocabularies.Common.v1.ValueList": {
						"Label": "Unit of Measure",
						"CollectionPath": "UnitOfMeasure",
						"Parameters": [
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterInOut",
								"LocalDataProperty": {
									"$PropertyPath": "PropertyUnit"
								},
								"ValueListProperty": "UnitOfMeasure"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "UnitOfMeasure_Text"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "UnitOfMeasureDimension"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "UnitOfMeasureISOCode"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "UnitOfMeasureNumberOfDecimals"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "UnitOfMeasureDspNmbrOfDcmls"
							}
						]
					}
				},
				"someNamespace.someEntityType/PropertyAmount": {
					"@com.sap.vocabularies.Common.v1.Label": "Property that is an Amount ",
					"@Org.OData.Core.V1.Computed": true,
					"@com.sap.vocabularies.Common.v1.QuickInfo": "Net Value of the Order Item in Document Currency",
					"@Org.OData.Measures.V1.ISOCurrency": {
						"$Path": "PropertyCurrency"
					}
				},
				"someNamespace.someEntityType/PropertyCurrency": {
					"@com.sap.vocabularies.Common.v1.Label": "Property that is a Currency ",
					"@Org.OData.Core.V1.Computed": true,
					"@com.sap.vocabularies.Common.v1.Heading": "Curr.",
					"@com.sap.vocabularies.Common.v1.QuickInfo": "SD document currency",
					"@com.sap.vocabularies.Common.v1.ValueList": {
						"Label": "Currency Value Help",
						"CollectionPath": "Currency",
						"Parameters": [
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterInOut",
								"LocalDataProperty": {
									"$PropertyPath": "PropertyCurrency"
								},
								"ValueListProperty": "Currency"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "Currency_Text"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "Decimals"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "CurrencyISOCode"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "AlternativeCurrencyKey"
							},
							{
								"$Type": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly",
								"ValueListProperty": "IsPrimaryCurrencyForISOCrcy"
							}
						]
					}
				},
				"someNamespace.Container.UnitOfMeasure": {
					"@com.sap.vocabularies.Capabilities.v1.SearchRestrictions": {
						"Searchable": true,
						"UnsupportedExpressions": {
							"$EnumMember": "com.sap.vocabularies.Capabilities.v1.SearchExpressions/AND com.sap.vocabularies.Capabilities.v1.SearchExpressions/OR com.sap.vocabularies.Capabilities.v1.SearchExpressions/NOT com.sap.vocabularies.Capabilities.v1.SearchExpressions/group com.sap.vocabularies.Capabilities.v1.SearchExpressions/phrase"
						}
					},
					"@com.sap.vocabularies.Capabilities.v1.InsertRestrictions": {
						"Insertable": false
					},
					"@com.sap.vocabularies.Capabilities.v1.DeleteRestrictions": {
						"Deletable": false
					},
					"@com.sap.vocabularies.Capabilities.v1.UpdateRestrictions": {
						"QueryOptions": {
							"SelectSupported": true
						}
					}
				},
				"someNamespace.UnitOfMeasureType/UnitOfMeasure": {
					"@com.sap.vocabularies.Common.v1.Text": {
						"$Path": "UnitOfMeasure_Text"
					},
					"@com.sap.vocabularies.Common.v1.UnitSpecificScale": {
						"$Path": "UnitOfMeasureDspNmbrOfDcmls"
					},
					"@com.sap.vocabularies.Common.v1.Label": "Internal UoM",
					"@com.sap.vocabularies.Common.v1.Heading": "MU",
					"@com.sap.vocabularies.Common.v1.QuickInfo": "Unit of Measurement"
				}
			},
			"$kind": "Schema"
		},
		"someNamespace.someEntityType": {
			"$kind": "EntityType",
			"$Key": [
				"key1",
				"IsActiveEntity"
			],
			"key1": {
				"$kind": "Property",
				"$Type": "Edm.Guid",
				"$Nullable": false
			},
			"HasActiveEntity": {
				"$kind": "Property",
				"$Type": "Edm.Boolean"
			},
			"IsActiveEntity": {
				"$kind": "Property",
				"$Type": "Edm.Boolean",
				"$Nullable": false
			},
			"PropertyInt16": {
				"$kind": "Property",
				"$Type": "Edm.Int16",
				"$Nullable": false
			},
			"PropertyString": {
				"$kind": "Property",
				"$Type": "Edm.String"
			},
			"PropertyBoolean": {
				"$kind": "Property",
				"$Type": "Edm.Boolean"
			},
			"PropertyByte": {
				"$kind": "Property",
				"$Type": "Edm.Byte"
			},
			"PropertySByte": {
				"$kind": "Property",
				"$Type": "Edm.SByte"
			},
			"PropertyInt32": {
				"$kind": "Property",
				"$Type": "Edm.Int32"
			},
			"PropertyInt64": {
				"$kind": "Property",
				"$Type": "Edm.Int64"
			},
			"PropertySingle": {
				"$kind": "Property",
				"$Type": "Edm.Single"
			},
			"PropertyDouble": {
				"$kind": "Property",
				"$Type": "Edm.Double"
			},
			"PropertyDecimal": {
				"$kind": "Property",
				"$Type": "Edm.Decimal"
			},
			"PropertyBinary": {
				"$kind": "Property",
				"$Type": "Edm.Binary"
			},
			"PropertyDate": {
				"$kind": "Property",
				"$Type": "Edm.Date"
			},
			"PropertyDateTimeOffset": {
				"$kind": "Property",
				"$Type": "Edm.DateTimeOffset"
			},
			"PropertyDuration": {
				"$kind": "Property",
				"$Type": "Edm.Duration"
			},
			"PropertyGuid": {
				"$kind": "Property",
				"$Type": "Edm.Guid"
			},
			"PropertyTimeOfDay": {
				"$kind": "Property",
				"$Type": "Edm.TimeOfDay"
			},
			"PropertyStream": {
				"$kind": "Property",
				"$Type": "Edm.Stream",
				"$Nullable": false
			},
			"PropertyQuantity": {
				"$kind": "Property",
				"$Type": "Edm.Decimal",
				"$Precision": 15,
				"$Scale": 3
			},
			"PropertyUnit": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$MaxLength": 3
			},
			"PropertyAmount": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$MaxLength": 3
			},
			"PropertyCurrency": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$MaxLength": 5
			},
			"_QuantityUnit": {
				"$kind": "NavigationProperty",
				"$Type": "someNamespace.UnitOfMeasureType"
			}
		},
		"someNamespace.UnitOfMeasureType": {
			"$kind": "EntityType",
			"$Key": [
				"UnitOfMeasure"
			],
			"UnitOfMeasure": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$Nullable": false,
				"$MaxLength": 3
			},
			"UnitOfMeasure_Text": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$MaxLength": 30
			},
			"UnitOfMeasureDimension": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$MaxLength": 6
			},
			"UnitOfMeasureISOCode": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$MaxLength": 3
			},
			"UnitOfMeasureNumberOfDecimals": {
				"$kind": "Property",
				"$Type": "Edm.Int16"
			},
			"UnitOfMeasureDspNmbrOfDcmls": {
				"$kind": "Property",
				"$Type": "Edm.Int16"
			}
		},
		"someNamespace.CurrencyType": {
			"$kind": "EntityType",
			"$Key": [
				"Currency"
			],
			"Currency": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$Nullable": false,
				"$MaxLength": 5
			},
			"Currency_Text": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$MaxLength": 40
			},
			"Decimals": {
				"$kind": "Property",
				"$Type": "Edm.Byte"
			},
			"CurrencyISOCode": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$MaxLength": 3
			},
			"AlternativeCurrencyKey": {
				"$kind": "Property",
				"$Type": "Edm.String",
				"$MaxLength": 3
			},
			"IsPrimaryCurrencyForISOCrcy": {
				"$kind": "Property",
				"$Type": "Edm.Boolean"
			}
		},
		"someNamespace.Container": {
			"$kind": "EntityContainer",
			"someEntitySet": {
				"$kind": "EntitySet",
				"$Type": "someNamespace.someEntityType"
			},
			"UnitOfMeasure": {
				"$kind": "EntitySet",
				"$Type": "someNamespace.UnitOfMeasureType"
			},
			"Currency": {
				"$kind": "EntitySet",
				"$Type": "someNamespace.CurrencyType"
			}
		},
		"$EntityContainer": "someNamespace.Container"
	};
});
