/**
 * tests for the sap.suite.ui.generic.template.lib.GroupHeaderFormatter
 */

/* globals QUnit */

sap.ui.define(["sap/suite/ui/generic/template/lib/GroupHeaderFormatter"
], function (GroupHeaderFormatter) {
	"use strict";

// https://qunitjs.com/upgrade-guide-2.x/
// https://www.tutorialspoint.com/qunit/qunit_nested_modules.htm

QUnit.module("lib.GroupHeaderFormatter sap.m.Table grouping", function(hooks) {
	hooks.beforeEach(function (assert) {
		var that = this;

		this.oContext = {
			mTest: {
				mMetadata: {},
				mTestData: {}
			},
			sPath: "/STTA_C_MP_Product(test)",
			getProperty: function (sPath) {
				return this.mTest.mTestData[sPath];
			},
			getModel: function () {
				return {
					getMetaModel: function () {
						return {
							getObject: function (sPath) {
								var aPath = (sPath || "").split("/"),
									sPath2 = aPath[aPath.length - 1];
								return that.oContext.mTest.mMetadata[sPath2];
							},
							getMetaContext: function (sPath) {
								return {
									sPath: sPath
								};
							}
						};
					}
				};
			}
		};
		this.oSmartTable = {
			mTest: {
				mCustomData: {
					dateFormatSettings: '{"UTC":true,"style":"medium"}' //or: '{"style":"medium"}'
				}
			},
			data: function (sName) {
			if (sName) {
					return this.mTest.mCustomData[sName];
				}
				return this.mTest.mCustomData;
			}
		};
	});

	hooks.afterEach(function(assert) {
	});

	QUnit.test("type Edm.String", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			Product: {
				name: "Product",
				type: "Edm.String"
			}
		};

		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "Product", "Product ID");

		// first row
		oContext.mTest.mTestData = {
			Product: "P1"
		};

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "P1",
				text: "Product ID: P1"
			},
			"Product, first data row (Edm.String)"
		);

		// second row
		oContext.mTest.mTestData = {
			Product: "P2"
		};

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "P2",
				text: "Product ID: P2"
			},
			"Product, second data row (Edm.String)"
		);
	});

	QUnit.test("type Edm.String without column label, with navigation property", function (assert) {
		var oContext = this.oContext,
			sColumnLabel = null,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			Product: {
				name: "Product",
				type: "Edm.String"
			}
		};

		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "to_Product/Product", sColumnLabel);

		oContext.mTest.mTestData = {
			"to_Product/Product": "P1"
		};

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "P1",
				text: "to_Product/Product: P1" // maybe stip off path
			},
			"Product (Edm.String)"
		);
	});

	QUnit.test("type Edm.String without column label but with label extension", function (assert) {
		var oContext = this.oContext,
			sColumnLabel = null,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			Product: {
				name: "Product",
				type: "Edm.String",
				extensions: [
					{
						name: "label",
						namespace: "http://www.sap.com/Protocols/SAPData",
						value: "Product Label"
					}
				]
			}
		};

		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "Product", sColumnLabel);

		oContext.mTest.mTestData = {
			Product: "P1"
		};

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "P1",
				text: "Product Label: P1"
			},
			"Product (Edm.String)"
		);
	});

	QUnit.test("type End.String, CalendarDate", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			CalendarDate: {
				"com.sap.vocabularies.Common.v1.IsCalendarDate": {
					Bool: "true"
				},
				name: "CalendarDate",
				type: "Edm.String"
			}
		};
		oContext.mTest.mTestData = {
			CalendarDate: "20180313"
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "CalendarDate", "CalendarDate");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "Mar 13, 2018",
				text: "CalendarDate: Mar 13, 2018"
			},
			"CalendarDate (Edm.String)"
		);
	});

	QUnit.test("type Edm.Decimal and Currency", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			Price: {
				"Org.OData.Measures.V1.ISOCurrency": {
					Path: "Currency"
				},
				"com.sap.vocabularies.Common.v1.Label": {
					String: "Price per Unit"
				},
				name: "Price",
				precision: "16",
				scale: "3",
				type: "Edm.Decimal"
			}
		};
		oContext.mTest.mTestData = {
			Price: 12.3,
			Currency: "EUR"
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "Price", "Price");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "12.30 EUR",
				text: "Price: 12.30 EUR"
			},
			"Price (Edm.Decimal) with Currency"
		);
	});

	QUnit.test("type Edm.Decimal and unit", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			Weight: {
				"Org.OData.Measures.V1.Unit": {
					Path: "WeightUnit"
				},
				precision: "13",
				scale: "3",
				name: "Weight",
				type: "Edm.Decimal"
			}
		};
		oContext.mTest.mTestData = {
			Weight: 123.4567,
			WeightUnit: "kg"
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "Weight", "Weight");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "123.457 kg",
				text: "Weight: 123.457 kg"
			},
			"Weight (Edm.Decimal) with WeightUnit"
		);
	});

	QUnit.test("type Edm.Decimal without unit", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			ExchangeRate: {
				precision: "9",
				scale: "5",
				name: "ExchangeRate",
				type: "Edm.Decimal"
			}
		};
		oContext.mTest.mTestData = {
			ExchangeRate: 1.2345678
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "ExchangeRate", "ExchangeRate");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "1.23457",
				text: "ExchangeRate: 1.23457"
			},
			"ExchangeRate (Edm.Decimal)"
		);
	});

	QUnit.test("type Edm.DateTime, displayFormat Date", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			CreationDate: {
				name: "CreationDate",
				type: "Edm.DateTime",
				extensions: [
					{
						name: "display-format",
						namespace: "http://www.sap.com/Protocols/SAPData",
						value: "Date" // timestamps interpreted in UTC
					}
				]
			}
		};
		oContext.mTest.mTestData = {
			CreationDate: new Date("2017-01-26T23:00:00.000Z") // Fri Jan 27 2017 00:00:00 GMT+0100
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "CreationDate", "CreationDate");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "Jan 26, 2017",
				text: "CreationDate: Jan 26, 2017"
			},
			"CreationDate (Edm.DateTime)"
		);
	});

	QUnit.test("type Edm.DateTime, displayFormat Time", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			CreationTime: {
				name: "CreationTime",
				type: "Edm.DateTime",
				extensions: [
					{
						name: "display-format",
						namespace: "http://www.sap.com/Protocols/SAPData",
						value: "Time"
					}
				]
			}
		};
		oContext.mTest.mTestData = {
			CreationTime: new Date("2018-03-13T18:13:01")
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "CreationTime", "CreationTime");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "Mar 13, 2018, 6:13:01 PM",
				text: "CreationTime: Mar 13, 2018, 6:13:01 PM"
			},
			"CreationTime (Edm.DateTime)"
		);
	});

	QUnit.test("type Edm.DateTimeOffset", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			CreationDateTime: {
				name: "CreationDateTime",
				type: "Edm.DateTimeOffset"
			}
		};
		oContext.mTest.mTestData = {
			CreationDateTime: new Date("2018-03-13T18:13:01")
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "CreationDateTime", "CreationDateTime");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "Mar 13, 2018, 6:13:01 PM",
				text: "CreationDateTime: Mar 13, 2018, 6:13:01 PM"
			},
			"CreationDateTime (Edm.DateTimeOffset)"
		);

		// Check also summer time in some countries
		oContext.mTest.mTestData = {
			CreationDateTime: new Date("2018-06-13T23:13:01.123")
		};

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "Jun 13, 2018, 11:13:01 PM",
				text: "CreationDateTime: Jun 13, 2018, 11:13:01 PM"
			},
			"CreationDateTime (Edm.DateTimeOffset)"
		);
	});

	QUnit.test("type Edm.Time", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			CreationTime: {
				name: "CreationTime",
				type: "Edm.Time"
			}
		};
		oContext.mTest.mTestData = {
			CreationTime: {
				ms: new Date("2018-03-13T17:13:01.000Z").getTime(), // interpreted in UTC; 1520961181000 or %86400000=61981000
				__edmType: "Edm.Time"
			}
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "CreationTime", "CreationTime");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "5:13:01 PM",
				text: "CreationTime: 5:13:01 PM"
			},
			"CreationTime (Edm.Time)"
		);

		oContext.mTest.mTestData.CreationTime.ms = 0;
		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "12:00:00 AM",
				text: "CreationTime: 12:00:00 AM"
			},
			"CreationTime (Edm.Time, 0 ms)"
		);
	});

	QUnit.test("type Edm.Boolean", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			Approved: {
				name: "Approved",
				type: "Edm.Boolean"
			}
		};
		oContext.mTest.mTestData = {
			Approved: true
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "Approved", "Approved");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "{i18n>YES}",
				text: "Approved: {i18n>YES}"
			},
			"Approved (Edm.Boolean), true"
		);

		oContext.mTest.mTestData = {
			Approved: false
		};

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "{i18n>NO}",
				text: "Approved: {i18n>NO}"
			},
			"Approved (Edm.Boolean), false"
		);
	});

	QUnit.test("type Edm.Byte with text extension and TextArrangement in property", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult, oTextArrangement;

		oContext.mTest.mMetadata = {
			Availability: {
				name: "Availability",
				type: "Edm.Byte",
				"com.sap.vocabularies.UI.v1.TextArrangement": {
					EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"
				},
				extensions: [
					{
						name: "text",
						namespace: "http://www.sap.com/Protocols/SAPData",
						value: "to_StockAvailability/StockAvailability_Text"
					}
				]
			}
		};
		oContext.mTest.mTestData = {
			Availability: 2,
			"to_StockAvailability/StockAvailability_Text": "Few left"
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "Availability", "Availability");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "Few left (2)",
				text: "Availability: Few left (2)"
			},
			"Availability (Edm.Byte), TextFirst"
		);

		oTextArrangement = oContext.getModel().getMetaModel().getObject("Availability")["com.sap.vocabularies.UI.v1.TextArrangement"];
		oTextArrangement.EnumMember = "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast";
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "Availability", "Availability");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "2 (Few left)",
				text: "Availability: 2 (Few left)"
			},
			"Availability (Edm.Byte), TextLast"
		);

		oTextArrangement.EnumMember = "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly";
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "Availability", "Availability");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "Few left",
				text: "Availability: Few left"
			},
			"Availability (Edm.Byte), TextOnly"
		);

		oTextArrangement.EnumMember = "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate";
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "Availability", "Availability");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: 2,
				text: "Availability: 2"
			},
			"Availability (Edm.Byte), TextSeparate"
		);
	});

	QUnit.test("type Edm.String with text extension and TextLast in text annotation", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			DimensionUnit: {
				name: "DimensionUnit",
				type: "Edm.String",
				"com.sap.vocabularies.Common.v1.Text": {
					"com.sap.vocabularies.UI.v1.TextArrangement": {
						EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast" // idAndDescription
					}
				},
				extensions: [
					{
						name: "text",
						value: "to_DimensionUnit/UnitOfMeasure_Text",
						namespace: "http://www.sap.com/Protocols/SAPData"
					}
				]
			}
		};
		oContext.mTest.mTestData = {
			DimensionUnit: "CM",
			"to_DimensionUnit/UnitOfMeasure_Text": "cm"
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "DimensionUnit", "DimensionUnit");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "CM (cm)",
				text: "DimensionUnit: CM (cm)"
			},
			"DimensionUnit (Edm.String)"
		);
	});

	QUnit.test("type Edm.String with non-existing text extension", function (assert) {
		var oContext = this.oContext,
			fnGroup, oResult;

		oContext.mTest.mMetadata = {
			DimensionUnit: {
				name: "DimensionUnit",
				type: "Edm.String",
				extensions: [
					{
						name: "text",
						value: "DoesNotExist",
						namespace: "http://www.sap.com/Protocols/SAPData"
					}
				]
			}
		};
		oContext.mTest.mTestData = {
			DimensionUnit: "MM"
		};
		fnGroup = GroupHeaderFormatter.getGroupFunctionForMTable(this.oSmartTable, "DimensionUnit", "DimensionUnit");

		oResult = fnGroup(oContext);

		assert.deepEqual(oResult,
			{
				key: "MM",
				text: "DimensionUnit: MM"
			},
			"DimensionUnit (Edm.String)"
		);
	});
});


// --------------------------------------------------------------------------------------------


QUnit.module("lib.GroupHeaderFormatter sap.ui.AnalyticalTable grouping", function(hooks) {
	hooks.beforeEach(function (assert) {
		var that = this;

		this.oATable = {
			mTest: {
				aColumns: [],
				aGroupedColumns: []
			},
			getColumns: function () {
				return this.mTest.aColumns;
			},
			getGroupedColumns: function () {
				return this.mTest.aGroupedColumns;
			}
		};

		this.oContext = {
			mTest: {
				mTestData: {}
			},
			getProperty: function (sPath) {
				return this.mTest.mTestData[sPath];
			}
		};

		this.oSmartTable = {
			mTest: {
				mMetadata: {},
				mCustomData: {
					dateFormatSettings: '{"UTC":true,"style":"medium"}' //or: '{"style":"medium"}'
				}
			},
			data: function (sName) {
			if (sName) {
					return this.mTest.mCustomData[sName];
				}
				return this.mTest.mCustomData;
			},
			getTable: function () {
				return that.oATable;
			},
			getModel: function () {
				return {
					getMetaModel: function () {
						return {
							getODataEntitySet: function (sEntitySet) {
								return {
									entityType: "entityType"
								};
							},
							getODataEntityType: function () {
								return {};
							},
							getODataProperty: function (oEntityType, sProperty) {
								return that.oSmartTable.mTest.mMetadata[sProperty] || "";
							}
						};
					},
					getResourceBundle: function () {
						return {
							getText: function (sKey) {
								return (sKey === "YES") ? "Yes" : (sKey === "NO") ? "No" : null;
							}
						};
					}
				};
			},
			getEntitySet: function () {
				return "entityset";
			}
		};

		this.fnPrepareColumns = function () {
			var aColumns = [];

			Object.keys(this.oSmartTable.mTest.mMetadata).forEach(function (sPath) {
				var oColumn = {
					sId: sPath, //"-" + sPath,
					mProperties: {
						leadingProperty: sPath
						//groupHeaderFormatter: null
					},
					getId: function () {
						return this.sId;
					},
					getLeadingProperty: function () {
						return this.mProperties.leadingProperty;
					},
					getGroupHeaderFormatter: function () {
						return this.mProperties.groupHeaderFormatter;
					},
					setGroupHeaderFormatter: function (fnFormatter) {
						this.mProperties.groupHeaderFormatter = fnFormatter;
					}
				};
				aColumns.push(oColumn);
			});
			return aColumns;
		};

		this.fnPerformAnalyticalGroupingForColumn = function (oContext, oColumn) {
			var sProperty = oColumn.getLeadingProperty();
			var sPropertyValue = oContext.getProperty(sProperty);
			var sTextPropertyValue = null; //oContext.getTextProperty(sLeadingProperty);
			var fnGroupingFormatter = oColumn.getGroupHeaderFormatter();
			// here we simulate the call from sap.ui.model.analytics.AnalyticalBinding.getGroupName()
			var sFormattedPropertyValue = fnGroupingFormatter ? fnGroupingFormatter(sPropertyValue, sTextPropertyValue) : sPropertyValue;
			return sFormattedPropertyValue;
		};
	});

	hooks.afterEach(function(assert) {
	});

	QUnit.test("Analytical: type Edm.String", function (assert) {
		var oColumn, sResult;

		this.oSmartTable.mTest.mMetadata = {
			Product: {
				name: "Product",
				type: "Edm.String"
			}
		};
		this.oATable.mTest.aColumns = this.fnPrepareColumns();
		this.oATable.mTest.aGroupedColumns = ["Product"];

		GroupHeaderFormatter.setGroupFunctionForAnalyticalTable(this.oSmartTable);

		// first row
		this.oContext.mTest.mTestData = {
			Product: "P1"
		};

		oColumn = this.oATable.getColumns()[0];
		sResult = this.fnPerformAnalyticalGroupingForColumn(this.oContext, oColumn);
		assert.equal(sResult, "P1", "Product (Edm.String), first data row");

		// second row
		this.oContext.mTest.mTestData = {
			Product: 15
		};
		oColumn = this.oATable.getColumns()[0];
		sResult = this.fnPerformAnalyticalGroupingForColumn(this.oContext, oColumn);
		assert.equal(sResult, 15, "Product (Edm.String), second data row");
	});

	QUnit.test("Analytical: other types, all columns grouped", function (assert) {
		var oColumn, aGroupedColumns, oDate, oExpectedResults, sResult;

		this.oSmartTable.mTest.mMetadata = {
			Product: {
				name: "Product",
				type: "Edm.String"
			},
			CalendarDate: {
				"com.sap.vocabularies.Common.v1.IsCalendarDate": {
					Bool: true
				},
				name: "CalendarDate",
				type: "Edm.String"
			},
			Price: {
				"Org.OData.Measures.V1.ISOCurrency": {
					Path: "Currency"
				},
				"com.sap.vocabularies.Common.v1.Label": {
					String: "Price per Unit"
				},
				name: "Price",
				precision: "16",
				scale: "3",
				type: "Edm.Decimal"
			},
			Weight: {
				"Org.OData.Measures.V1.Unit": {
					Path: "WeightUnit"
				},
				precision: "13",
				scale: "3",
				name: "Weight",
				type: "Edm.Decimal"
			},
			ExchangeRate: {
				precision: "9",
				scale: "5",
				name: "ExchangeRate",
				type: "Edm.Decimal"
			},
			CreationDate: {
				name: "CreationDate",
				type: "Edm.DateTime",
				extensions: [
					{
						name: "display-format",
						namespace: "http://www.sap.com/Protocols/SAPData",
						value: "Date" // timestamps interpreted in UTC
					}
				]
			},
			CreationDateTime: {
				name: "CreationDateTime",
				type: "Edm.DateTimeOffset"
			},
			CreationTime: {
				name: "CreationTime",
				type: "Edm.Time"
			},
			Approved: {
				name: "Approved",
				type: "Edm.Boolean"
			},
			Availability: {
				name: "Availability",
				type: "Edm.Byte",
				"com.sap.vocabularies.UI.v1.TextArrangement": {
					EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast" // idAndDescription
				},
				extensions: [
					{
						name: "text",
						namespace: "http://www.sap.com/Protocols/SAPData",
						value: "to_StockAvailability/StockAvailability_Text"
					}
				]
			}
		};

		this.oATable.mTest.aColumns = this.fnPrepareColumns();

		aGroupedColumns = Object.keys(this.oSmartTable.mTest.mMetadata); // all properties for grouping

		this.oATable.mTest.aGroupedColumns = aGroupedColumns; // all properties for grouping

		GroupHeaderFormatter.setGroupFunctionForAnalyticalTable(this.oSmartTable);

		oDate = new Date("2018-03-13T11:13:01");
		this.oContext.mTest.mTestData = {
			Product: "P1",
			Price: 12.3,
			Currency: "EUR",
			Weight: 123.4567,
			WeightUnit: "kg",
			ExchangeRate: 1.2345678,
			CreationDate: oDate,
			CreationDateTime: oDate,
			CreationTime: { ms: oDate.getTime(), __edmType: "Edm.Time" }, // 1520935981000, oData: "PT12H13M01S"
			CalendarDate: "20180313",
			Approved: true,
			Availability: 2
			//"to_StockAvailability/StockAvailability_Text": "Few left"
		};

		oExpectedResults = {
			Product: "P1",
			Price: "12.30", //or "12.30 EUR"?
			Currency: "EUR",
			Weight: "123.457", //or "123.457 kg"
			WeightUnit: "kg",
			ExchangeRate: "1.23457",
			CreationDate: "Mar 13, 2018",
			CreationDateTime: "Mar 13, 2018, 11:13:01 AM",
			CreationTime: "10:13:01 AM", // UTC
			CalendarDate: "Mar 13, 2018",
			Approved: "Yes",
			Availability: "2" //or "2 (Few left)"
		};

		var aColumns = this.oATable.getColumns();
		var mColumnById = aColumns.reduce(function (map, obj) {
			map[obj.getId()] = obj;
			return map;
		}, {});
		for (var i = 0; i < aGroupedColumns.length; i++) {
			oColumn = mColumnById[aGroupedColumns[i]];
			var sProperty = oColumn.getLeadingProperty();
			var sPropertyValue = this.oContext.getProperty(sProperty);
			var sTextPropertyValue = null; //oContext.getTextProperty(sLeadingProperty);
			var fnGroupingFormatter = oColumn.getGroupHeaderFormatter();
			sResult = fnGroupingFormatter ? fnGroupingFormatter(sPropertyValue, sTextPropertyValue) : sPropertyValue;
			var sExpectedResult = oExpectedResults[sProperty];
			assert.equal(sResult, sExpectedResult, sProperty + " (" + this.oSmartTable.mTest.mMetadata[sProperty].type + ")");
		}
	});
});

});
