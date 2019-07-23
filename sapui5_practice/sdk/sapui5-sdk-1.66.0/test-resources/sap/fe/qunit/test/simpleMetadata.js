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
					},
					"@com.sap.vocabularies.UI.v1.Facets": [
						{
							"$Type": "com.sap.vocabularies.UI.v1.ReferenceFacet",
							"Label": "Titles",
							"Target": {
								"$AnnotationPath": "_Title/@com.sap.vocabularies.UI.v1.LineItem"
							}
						}
					],
					"@com.sap.vocabularies.UI.v1.LineItem": [
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "PropertyInt16",
							"Value": {
								"$Path": "PropertyInt16"
							}
						},
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "PropertyInt32",
							"Value": {
								"$Path": "PropertyInt32"
							}
						},
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "PropertyString",
							"Value": {
								"$Path": "PropertyString"
							}
						}
					]
				},
				"someNamespace.deleteRestrictedEntityType": {
					"@com.sap.vocabularies.Common.v1.Label": "Delete Restricted Entity",
					"@com.sap.vocabularies.Common.v1.SemanticKey": [
						{
							"$PropertyPath": "key1"
						}
					],
					"@com.sap.vocabularies.UI.v1.Facets": [
						{
							"$Type": "com.sap.vocabularies.UI.v1.ReferenceFacet",
							"Label": "Titles",
							"Target": {
								"$AnnotationPath": "_Title/@com.sap.vocabularies.UI.v1.LineItem"
							}
						}
					],
					"@com.sap.vocabularies.UI.v1.HeaderInfo": {
						"TypeName": "Delete Restricted Entity",
						"TypeNamePlural": "Delete Restricted Entities",
						"Title": {
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Value": {
								"$Path": "Name"
							}
						}
					},
					"@com.sap.vocabularies.UI.v1.LineItem": [
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "column1",
							"Value": {
								"$Path": "Column1"
							}
						},
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "column2",
							"Value": {
								"$Path": "Column2"
							}
						},
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "column3",
							"Value": {
								"$Path": "Column3"
							}
						}
					]
				},
				"someNamespace.dataFieldForActionEntityType": {
					"@Org.OData.Capabilities.V1.DeleteRestrictions": {
						"Deletable": false
					},
					"@com.sap.vocabularies.Common.v1.Label": "Delete Restricted Entity",
					"@com.sap.vocabularies.Common.v1.SemanticKey": [
						{
							"$PropertyPath": "key1"
						}
					],
					"@com.sap.vocabularies.UI.v1.Facets": [
						{
							"$Type": "com.sap.vocabularies.UI.v1.ReferenceFacet",
							"Label": "Titles",
							"Target": {
								"$AnnotationPath": "_Title/@com.sap.vocabularies.UI.v1.LineItem"
							}
						}
					],
					"@com.sap.vocabularies.UI.v1.HeaderInfo": {
						"TypeName": "Delete Restricted Entity",
						"TypeNamePlural": "Delete Restricted Entities",
						"Title": {
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Value": {
								"$Path": "Name"
							}
						}
					},
					"@com.sap.vocabularies.UI.v1.LineItem": [
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "column1",
							"Value": {
								"$Path": "Column1"
							}
						},
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataFieldForAction",
							"Label": "column2",
							"Value": {
								"$Path": "Column2"
							}
						},
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "column3",
							"Value": {
								"$Path": "Column3"
							}
						}
					]
				},
				"someNamespace.dataFieldForIntentBasedNavigationType": {
					"@Org.OData.Capabilities.V1.DeleteRestrictions": {
						"Deletable": false
					},
					"@com.sap.vocabularies.Common.v1.Label": "Delete Restricted Entity",
					"@com.sap.vocabularies.Common.v1.SemanticKey": [
						{
							"$PropertyPath": "key1"
						}
					],
					"@com.sap.vocabularies.UI.v1.Facets": [
						{
							"$Type": "com.sap.vocabularies.UI.v1.ReferenceFacet",
							"Label": "Titles",
							"Target": {
								"$AnnotationPath": "_Title/@com.sap.vocabularies.UI.v1.LineItem"
							}
						}
					],
					"@com.sap.vocabularies.UI.v1.HeaderInfo": {
						"TypeName": "Delete Restricted Entity",
						"TypeNamePlural": "Delete Restricted Entities",
						"Title": {
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Value": {
								"$Path": "Name"
							}
						}
					},
					"@com.sap.vocabularies.UI.v1.LineItem": [
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "column1",
							"Value": {
								"$Path": "Column1"
							}
						},
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation",
							"Label": "column2",
							"Value": {
								"$Path": "Column2"
							}
						},
						{
							"$Type": "com.sap.vocabularies.UI.v1.DataField",
							"Label": "column3",
							"Value": {
								"$Path": "Column3"
							}
						}
					]
				},
				"someNamespace.someEntityType/PropertyInt16": {
					"@com.sap.vocabularies.Common.v1.Label": "Property of Type Int16"
				},
				"someNamespace.Container/deleteRestrictedEntitySet": {
					"@Org.OData.Capabilities.V1.DeleteRestrictions": {
						"Deletable": false
					}
				},
				"someNamespace.Container/deleteNotRestrictedEntitySet": {
					"@Org.OData.Capabilities.V1.DeleteRestrictions": {
						"Deletable": true
					}
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
			}
		},
		"someNamespace.deleteRestrictedEntityType": {
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
			"Column1": {
				"$kind": "Property",
				"$Type": "Edm.Int16",
				"$Nullable": false
			},
			"Column2": {
				"$kind": "Property",
				"$Type": "Edm.String"
			},
			"Column3": {
				"$kind": "Property",
				"$Type": "Edm.Boolean"
			}
		},
		"someNamespace.dataFieldForActionEntityType": {
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
			"Column1": {
				"$kind": "Property",
				"$Type": "Edm.Int16",
				"$Nullable": false
			},
			"Column2": {
				"$kind": "Property",
				"$Type": "Edm.String"
			},
			"Column3": {
				"$kind": "Property",
				"$Type": "Edm.Boolean"
			}
		},
		"someNamespace.dataFieldForIntentBasedNavigationType": {
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
			"Column1": {
				"$kind": "Property",
				"$Type": "Edm.Int16",
				"$Nullable": false
			},
			"Column2": {
				"$kind": "Property",
				"$Type": "Edm.String"
			},
			"Column3": {
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
			"deleteRestrictedEntitySet": {
				"$kind": "EntitySet",
				"$Type": "someNamespace.deleteRestrictedEntityType"
			},
			"deleteNotRestrictedEntitySet": {
				"$kind": "EntitySet",
				"$Type": "someNamespace.deleteNotRestrictedEntityType"
			},
			"dataFieldForActionEntitySet": {
				"$kind": "EntitySet",
				"$Type": "someNamespace.dataFieldForActionEntityType"
			},
			"dataFieldForIntentBasedNavigationSet": {
				"$kind": "EntitySet",
				"$Type": "someNamespace.dataFieldForIntentBasedNavigationType"
			}
		},
		"$EntityContainer": "someNamespace.Container"
	};
});