sap.ui.define([
    "sap/ovp/cards/charts/Utils",
    "sap/ovp/cards/charts/VizAnnotationManager",
    "sap/ovp/cards/charts/SmartAnnotationManager",
    "test-resources/sap/ovp/qunit/cards/utils",
    "test-resources/sap/ovp/qunit/cards/charts/utils",
    "test-resources/sap/ovp/mockservers",
    "jquery.sap.global",
    "/sap/ui/core/format/NumberFormat",
    "/sap/viz/library"
], function (Utils, VizAnnotationManager, SmartAnnotationManager, cardUtils, oChartUtils, mockservers, jquery, NumberFormat) {
           "use strict";

        //jQuery.sap.require("sap.ovp.cards.charts.Utils");
        <!--jQuery.sap.require("sap.ovp.cards.charts.VizAnnotationManager");-->
        //jQuery.sap.require("sap.ovp.cards.charts.SmartAnnotationManager");
        //jQuery.sap.require("sap.ovp.cards.AnnotationHelper");
        //jQuery.sap.require("sap.ovp.test.qunit.cards.utils");
        //jQuery.sap.require("sap.ovp.test.qunit.cards.charts.utils");
        var chartUtils = Utils;
        var VizAnnotationManager = VizAnnotationManager;
        var SmartAnnotationManager = SmartAnnotationManager;
        var chartTestUtils = oChartUtils;
        var cardTestUtils = cardUtils;
           

           module("sap.ovp.cards.charts", {
               /**
                * This method is called before each test
                */
               beforeEach: function (test) {
            	   //jQuery.sap.require("sap.ovp.test.mockservers");
                   var baseURL = chartTestUtils.odataBaseUrl;
                   var rootURL = chartTestUtils.odataRootUrl;
                   mockservers.loadMockServer(baseURL, rootURL);
               },
               /**
                * This method is called after each test. Add every restoration code here
                *
                */
               afterEach: function () {
            	  mockservers.close();
               }
           });

           test("Analytical Chart - setFormatChartTitle() - Set the chart Title",function(){

	               var cardTestData = {
	                   card: {
	                	   "id": "chart_1",
	                	   "model": "salesShare",
	       				"template": "sap.ovp.cards.charts.smart.chart",
	       				"settings": {
	       					"dataStep": "11",
	       					"valueSelectionInfo": "value selection info",
	       					"entitySet": "SalesShare",
	       					"selectionAnnotationPath" : "com.sap.vocabularies.UI.v1.SelectionVariant#Check_Title",
	       					"chartAnnotationPath" : "com.sap.vocabularies.UI.v1.Chart#Check_Title",
	       					"presentationAnnotationPath" : "com.sap.vocabularies.UI.v1.PresentationVariant#Check_Title",
	       					"dataPointAnnotationPath" : "com.sap.vocabularies.UI.v1.DataPoint#Check_Title",
	       					"identificationAnnotationPath" : "com.sap.vocabularies.UI.v1.Identification#Check_Title"
	       				}
	                   },
	                   dataSource: {
	                       baseUrl: chartTestUtils.odataBaseUrl,
	                       rootUri: chartTestUtils.odataRootUrl,
	                       annoUri: chartTestUtils.testBaseUrl + "data/salesshare/annotations.xml"
	                   },
	                   expectedResult: {

	                   }
	               };

	               var oModel = cardTestUtils.createCardModel(cardTestData);
	               stop();
	               oModel.getMetaModel().loaded().then(function () {
	                   var oView = cardTestUtils.createCardView(cardTestData, oModel);

	                   oView.loaded().then(function (oView) {
	                       //start the async test
	                       start();
	                       var cardSmart = oView.byId("analyticalChart2");
	                       var cardXml = oView._xContent;
	                       ok(cardSmart !== undefined, "Existence check to Smart Chart");
	                       ok(cardXml !== undefined, "Existence check to XML parsing");
	                       var chartTitle = oView.byId("ovpCT1");
	                       SmartAnnotationManager.buildSmartAttributes(cardSmart, chartTitle);
	                       var actualResult = chartTitle.getText();
	                       var expectedResult = "Sales by Criticality and Region ";
	                       ok(expectedResult == actualResult, "To Check the format of the Chart Title");
	                   });

            test("Analytical Chart - Chart Axes formatting - Currency (minFractionDigits = -1)",function(){
				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "4.2K";
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(4150, "CURR/-1/");
				ok((expectedResult === actualResult), "Check for currency formatting");
			});

			test("Analytical Chart - Chart Axes formatting - Currency (minFractionDigits = 3)",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "10.000M";
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(10000000, "CURR/3/");
				ok((expectedResult === actualResult), "Check for Currency formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Date (MMM d)",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "Jan 5";
				var oDate = new Date("January 05, 2010 05:30:00");
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(oDate, "MMM d");
				ok((expectedResult === actualResult), "Check for date formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Date (d)",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "5";
				var oDate = new Date("January 05, 2010 05:30:00");
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(oDate, "d");
				ok((expectedResult === actualResult), "Check for date formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Date (YearMonthDay)",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "Jan 15, 2010";
				var oDate = new Date("January 15, 2010 05:30:00");
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(oDate, "YearMonthDay");
				ok((expectedResult === actualResult), "Check for date formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Date (MMM)",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "Jan";
				var oDate = new Date("January 15, 2010 05:30:00");
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(oDate, "MMM");
				ok((expectedResult === actualResult), "Check for date formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Axis (minFractionDigits = -1)",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "100K";
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(100000, "axisFormatter/-1/");
				ok((expectedResult === actualResult), "Check for number formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Axis (minFractionDigits = 4)",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "0.0010";
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(0.001, "axisFormatter/4/");
				ok((expectedResult === actualResult), "Check for number formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Axis (minFractionDigits = 4)",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "0.0010";
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(0.001, "ShortFloat/4/");
				ok((expectedResult === actualResult), "Check for number formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Percentage",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "35.9%";
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(0.3593478363012733, "0.0%/1/");
				ok((expectedResult === actualResult), "Check for percentage formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Percentage (minFractionDigits = -1)",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "28.0%";
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(0.2795658506789456, "0.0%/-1/");
				ok((expectedResult === actualResult), "Check for percentage formatting");

			});

			test("Analytical Chart - Chart Axes formatting - Tooltip",function(){

				//jQuery.sap.require("NumberFormat");
				//jQuery.sap.require("sap.viz.library");
				SmartAnnotationManager.formatChartAxes();
				var expectedResult = "7,685.00";
				var vizFormatter = sap.viz.api.env.Format.numericFormatter();
				var actualResult = vizFormatter.format(7685, "tooltipNoScaleFormatter");
				ok((expectedResult === actualResult), "Check for percentage formatting");
			});

				test("Analytical Chart - validateCardConfiguration() functionality - oController is undefined",function(){

				var errorSpy = sinon.spy(jQuery.sap.log, "error");
				var oController = undefined;
				var actualReturn = SmartAnnotationManager.validateCardConfiguration(oController);
				var expectedReturn = false;

				ok(expectedReturn === actualReturn, "validateCardConfiguration() returns false if oController is undefined");
				errorSpy.restore();

			});

			test("Analytical Chart - validateCardConfiguration() functionality - No card properties",function(){

				var errorSpy = sinon.spy(jQuery.sap.log, "error");
				var oController = {getView : function() {}, getCardPropertiesModel: function(){}};
				SmartAnnotationManager.validateCardConfiguration(oController);

				ok(errorSpy.calledWith("OVP-AC: Analytic card Error: in card configuration.Could not obtain Cards model."), "validateCardConfiguration() throws error if no card properties");
				errorSpy.restore();

			});

			test("Analytical Chart - validateCardConfiguration() functionality - No entityType",function(){

				var errorSpy = sinon.spy(jQuery.sap.log, "error");
				var oController = {getView : function() {}, getCardPropertiesModel: function(){return {getProperty: function(x){return undefined;}};}};
				SmartAnnotationManager.validateCardConfiguration(oController);

				ok(errorSpy.calledWith("OVP-AC: Analytic card Error: in card annotation."), "validateCardConfiguration() throws error if there's no entityType");
				errorSpy.restore();

			});

			test("Analytical Chart - hasTimeSemantics() returns false if no propertyPath",function(){

				var aDimensions = [{
									"Dimension" : {

									},
									"Role" : {
										"EnumMember" : "com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category"
									},
									"RecordType" : "com.sap.vocabularies.UI.v1.ChartDimensionAttributeType"
								}];
				var config = {time : {type: "timeseries_line"}};
				var actualReturn = SmartAnnotationManager.hasTimeSemantics(aDimensions, config);
				var expectedReturn = false;

				ok(actualReturn === expectedReturn, "Check if hasTimeSemantics() returns false if no propertyPath");

			});

			test("Analytical Chart - getPrimitiveValue() functionality - Decimal",function(){

				var actualReturn = SmartAnnotationManager.getPrimitiveValue({Decimal:"80000.00"});
				var expectedReturn = 80000;
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");

			});

			test("Analytical Chart - getPrimitiveValue() functionality - String",function(){

				var actualReturn = SmartAnnotationManager.getPrimitiveValue({String:"80000"});
				var expectedReturn = "80000";
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");

			});

			test("Analytical Chart - getPrimitiveValue() functionality - Int",function(){

				var actualReturn = SmartAnnotationManager.getPrimitiveValue({Int:"80000"});
				var expectedReturn = 80000;
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");

			});

			test("Analytical Chart - getPrimitiveValue() functionality - Double",function(){

				var actualReturn = SmartAnnotationManager.getPrimitiveValue({Double:"80000.00"});
				var expectedReturn = 80000;
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");

			});

			test("Analytical Chart - getPrimitiveValue() functionality - Single",function(){

				var actualReturn = SmartAnnotationManager.getPrimitiveValue({Single:"80000"});
				var expectedReturn = 80000;
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");

			});

			test("Analytical Chart - getPrimitiveValue() functionality - Boolean True",function(){

				var actualReturn = SmartAnnotationManager.getPrimitiveValue({Boolean:"True"});
				var expectedReturn = true;
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");

			});

			test("Analytical Chart - getPrimitiveValue() functionality - Boolean False",function(){

				var actualReturn = SmartAnnotationManager.getPrimitiveValue({Boolean:"False"});
				var expectedReturn = false;
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");

			});

			test("Analytical Chart - getPrimitiveValue() functionality - Bool True",function(){

				var actualReturn = SmartAnnotationManager.getPrimitiveValue({Bool:"True"});
				var expectedReturn = true;
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");

			});

			test("Analytical Chart - getPrimitiveValue() functionality - Bool False",function(){
				var actualReturn = SmartAnnotationManager.getPrimitiveValue({Bool:"False"});
				var expectedReturn = false;
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");
			});




            test("Analytical Chart - checkDimensionAttr() - With Dimension attributes",function(){

               var cardTestData = {
                   card: {
                       "id": "chart_3",
                       "model": "salesShare",
                       "template": "sap.ovp.cards.charts.smart.chart",
                       "settings": {
                           "entitySet": "SalesShare",
                           "selectionAnnotationPath" : "com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_Country",
                           "chartAnnotationPath" : "com.sap.vocabularies.UI.v1.Chart#Eval_by_Country",
                           "presentationAnnotationPath" : "com.sap.vocabularies.UI.v1.PresentationVariant#Eval_by_Country",
                           "dataPointAnnotationPath" : "com.sap.vocabularies.UI.v1.DataPoint#Eval_by_Country",
                           "identificationAnnotationPath" : "com.sap.vocabularies.UI.v1.Identification#Eval_by_Country"
                       }
                   },
                   dataSource: {
                       baseUrl: chartTestUtils.odataBaseUrl,
                       rootUri: chartTestUtils.odataRootUrl,
                       annoUri: chartTestUtils.testBaseUrl + "data/salesshare/annotations_SmartDimensions.xml"
                   }
               };

               var oModel = cardTestUtils.createCardModel(cardTestData);
               stop();
               oModel.getMetaModel().loaded().then(function () {
                   var errorSpy = sinon.spy(jQuery.sap.log, "error");
                   var oView = cardTestUtils.createCardView(cardTestData, oModel);

                   oView.loaded().then(function (oView) {
                       //start the async test
                       start();
                       var cardXml = oView._xContent;
                       ok(cardXml !== undefined,"Existence check to XML parsing");


                       ok(errorSpy.calledWith(SmartAnnotationManager.errorMessages.CHART_ANNO_ERROR + "in " + SmartAnnotationManager.errorMessages.CHART_ANNO + " " +
                       SmartAnnotationManager.errorMessages.DIMENSIONS_MANDATORY), "Check if less/no dimensions given in the annotations");
                       errorSpy.restore();
                   });

               });
           });


           test("Analytical Chart - CheckMeasureAttr() - Check Measures Attributes",function(){

               var cardTestData = {
                   card: {
                       "id": "chart_2",
                       "model": "salesShare",
                       "template": "sap.ovp.cards.charts.smart.chart",
                       "settings": {
                           "entitySet": "SalesShare",
                           "selectionAnnotationPath" : "com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_Country",
                           "chartAnnotationPath" : "com.sap.vocabularies.UI.v1.Chart#Eval_by_Country",
                           "presentationAnnotationPath" : "com.sap.vocabularies.UI.v1.PresentationVariant#Eval_by_Country",
                           "dataPointAnnotationPath" : "com.sap.vocabularies.UI.v1.DataPoint#Eval_by_Country",
                           "identificationAnnotationPath" : "com.sap.vocabularies.UI.v1.Identification#Eval_by_Country"
                       }
                   },
                   dataSource: {
                       baseUrl: chartTestUtils.odataBaseUrl,
                       rootUri: chartTestUtils.odataRootUrl,
                       annoUri: chartTestUtils.testBaseUrl + "data/salesshare/annotations_SmartMeasures.xml"
                   }
               };

               var oModel = cardTestUtils.createCardModel(cardTestData);
               stop();
               oModel.getMetaModel().loaded().then(function () {
                   var errorSpy = sinon.spy(jQuery.sap.log, "error");
                   var oView = cardTestUtils.createCardView(cardTestData, oModel);

                   oView.loaded().then(function (oView) {
                       //start the async test
                       start();
                       var cardXml = oView._xContent;
                       ok(cardXml !== undefined, "Existence check to XML parsing");

                       ok(errorSpy.calledWith(SmartAnnotationManager.errorMessages.CHART_ANNO_ERROR + "in " + SmartAnnotationManager.errorMessages.CHART_ANNO + " " +
                       SmartAnnotationManager.errorMessages.MEASURES_MANDATORY), "Check if less/no measures given in the annotations");
                       errorSpy.restore();
                   });
               });
           });

            test("Analytical Chart - FormatByType() functionality when oMetadata is undefined",function(){

                var oMetadata = undefined;
                var sProp = "Sales";
                var sVal = "100000";

                var expectedReturnValue = "100000";
                var actualReturnValue = SmartAnnotationManager.formatByType(oMetadata, sProp, sVal);

                ok((expectedReturnValue === actualReturnValue), "FormatByType returns sVal when oMetadata is undefined");
            });

            test("Analytical Chart - FormatByType() functionality for Numeric Values",function(){

				var oMetadata = {
						Sales : {
							"name" : "Sales",
							"type" : "Edm.Decimal",
							"precision" : "34",
							"extensions" : [
									{
										"name" : "filterable",
										"value" : "false",
										"namespace" : "http://www.sap.com/Protocols/SAPData"
									},
									{
										"name" : "label",
										"value" : "Sales",
										"namespace" : "http://www.sap.com/Protocols/SAPData"
									},
									{
										"name" : "aggregation-role",
										"value" : "measure",
										"namespace" : "http://www.sap.com/Protocols/SAPData"
									},
									{
										"name" : "unit",
										"value" : "Sales_CURRENCY",
										"namespace" : "http://www.sap.com/Protocols/SAPData"
									} ],
							"sap:filterable" : "false",
							"sap:label" : "Sales",
							"com.sap.vocabularies.Common.v1.Label" : {
								"String" : "Sales"
							},
							"sap:aggregation-role" : "measure",
							"com.sap.vocabularies.Analytics.v1.Measure" : {
								"Bool" : "true"
							},
							"sap:unit" : "Sales_CURRENCY",
							"Org.OData.Measures.V1.ISOCurrency" : {
								"Path" : "Sales_CURRENCY"
							}
						}
				};
				var sProp = "Sales";
				var sVal = "100000";

				var expectedReturnValue = Number("100000");
				var actualReturnValue = SmartAnnotationManager.formatByType(oMetadata, sProp, sVal);

				ok((expectedReturnValue === actualReturnValue),
						"FormatByType returns sVal when oMetadata is undefined");
			});


			test("Analytical Chart - Test for MaxItems=0", function(){
               var cardTestData = {
                   card: {
                       "id": "chart_13",
                       "model": "salesShare",
                       "template": "sap.ovp.cards.charts.smart.chart",
                       "settings": {
                           "entitySet": "SalesShare",
                           "selectionAnnotationPath" : "com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_CtryCurr",
                           "chartAnnotationPath" : "com.sap.vocabularies.UI.v1.Chart#Eval_by_CtryCurr",
                           "presentationAnnotationPath" : "com.sap.vocabularies.UI.v1.PresentationVariant#Zero_MaxItems",
                           "dataPointAnnotationPath" : "com.sap.vocabularies.UI.v1.DataPoint#Eval_by_CtryCurr",
                           "identificationAnnotationPath" : "com.sap.vocabularies.UI.v1.Identification#Eval_by_CtryCurr"
                       }
                   },
                   dataSource: {
                       baseUrl: chartTestUtils.odataBaseUrl,
                       rootUri: chartTestUtils.odataRootUrl,
                       annoUri: chartTestUtils.testBaseUrl + "data/salesshare/annotations_SmartMeasures.xml"
                   }
               };

               var oModel = cardTestUtils.createCardModel(cardTestData);
               stop();
               oModel.getMetaModel().loaded().then(function () {
                   var errorSpy = sinon.spy(jQuery.sap.log, "error");
                   var oView = cardTestUtils.createCardView(cardTestData, oModel);

                   oView.loaded().then(function (oView) {
                       //start the async test
                       start();
                       var cardViz = oView.byId("analyticalChart2");
                       var cardXml = oView._xContent;
                       ok(cardViz !== undefined, "Existence check to VizFrame");
                       ok(cardXml !== undefined, "Existence check to XML parsing");
                       var expectedLog = "OVP-AC: Analytic card Error: maxItems is configured as 0";
                       ok(errorSpy.calledWith(expectedLog), "Check correct error message is logged.");
                       errorSpy.restore();
                   });
               });
           });

           test("Analytical Chart - Test for MaxItems=String", function(){
               var cardTestData = {
                   card: {
                       "id": "chart_14",
                       "model": "salesShare",
                       "template": "sap.ovp.cards.charts.smart.chart",
                       "settings": {
                           "entitySet": "SalesShare",
                           "selectionAnnotationPath" : "com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_CtryCurr",
                           "chartAnnotationPath" : "com.sap.vocabularies.UI.v1.Chart#Eval_by_CtryCurr",
                           "presentationAnnotationPath" : "com.sap.vocabularies.UI.v1.PresentationVariant#String_MaxItems",
                           "dataPointAnnotationPath" : "com.sap.vocabularies.UI.v1.DataPoint#Eval_by_CtryCurr",
                           "identificationAnnotationPath" : "com.sap.vocabularies.UI.v1.Identification#Eval_by_CtryCurr"
                       }
                   },
                   dataSource: {
                       baseUrl: chartTestUtils.odataBaseUrl,
                       rootUri: chartTestUtils.odataRootUrl,
                       annoUri: chartTestUtils.testBaseUrl + "data/salesshare/annotations_SmartDimensions.xml"
                   }
               };

               var oModel = cardTestUtils.createCardModel(cardTestData);
               stop();
               oModel.getMetaModel().loaded().then(function () {
                   var errorSpy = sinon.spy(jQuery.sap.log, "error");
                   var oView = cardTestUtils.createCardView(cardTestData, oModel);

                   oView.loaded().then(function (oView) {
                       //start the async test
                       start();
                       var cardViz = oView.byId("analyticalChart2");
                       var cardXml = oView._xContent;
                       ok(cardViz !== undefined, "Existence check to VizFrame");
                       ok(cardXml !== undefined, "Existence check to XML parsing");
                       var expectedLog = "OVP-AC: Analytic card Error: maxItems is Invalid. Please enter an Integer.";
                       ok(errorSpy.calledWith(expectedLog), "Check correct error message is logged.");
                       errorSpy.restore();
                   });
               });
           });

           test("Analytical Chart - getAnnotationQulaifier() functionality ",function(){

                var annotationpath = "com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_Country"
                var actualReturn = sap.ovp.cards.charts.SmartAnnotationManager.getAnnotationQualifier(annotationpath);
				var expectedReturn = "Eval_by_Country";
				ok(actualReturn === expectedReturn, "Check if getPrimitiveValue() returns expected value");

			           });
           test("Analytical Chart - checkExists() functionality - bMandatory = true",function(){

				var errorSpy = sinon.spy(jQuery.sap.log, "error");
				var term = undefined;
				var annotation = {};
				var type = "Selection Variant";
				var bMandatory = true;
				var logViewId = "[card004Original]";
				var contentFragment = undefined;
				SmartAnnotationManager.checkExists(term, annotation, type, bMandatory, logViewId, contentFragment);
				ok(errorSpy.calledWith("[card004Original]OVP-AC: Analytic card Error: Selection Variantis mandatory."), "checkExists() throws error if bMandatory = true");
				errorSpy.restore();

			});

			test("Analytical Chart - checkExists() functionality",function(){

				var term = undefined;
				var annotation = {};
				var type = "Selection Variant";
				var bMandatory = false;
				var logViewId = "[card004Original]";
				var contentFragment = undefined;
				var expectedReturn = true;
				var actualReturn = SmartAnnotationManager.checkExists(term, annotation, type, bMandatory, logViewId, contentFragment);
				ok(expectedReturn === actualReturn, "checkExists() throws error if !term");

			});


			test("Analytical Chart - checkExists() functionality - No annoTerm",function(){

				var errorSpy = sinon.spy(jQuery.sap.log, "error");
				var term = "com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_Currency_1";
				var annotation = {};
				var type = "Selection Variant";
				var bMandatory = true;
				var logViewId = "[card004Original]";
				var contentFragment = undefined;
				SmartAnnotationManager.checkExists(term, annotation, type, bMandatory, logViewId, contentFragment);
				ok(errorSpy.calledWith("[card004Original]OVP-AC: Analytic card Error: in Selection Variant. (com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_Currency_1 is not found or not well formed)"), "checkExists() throws error if bMandatory = true");
				errorSpy.restore();

			         });

			   test("Analytical Chart - getSapLabel() functionality - get the Label",function(){
               var oMetadata = {
						Sales : {
							"name" : "SalesShare",
							"type" : "Edm.Decimal",
							"precision" : "34",
							"extensions" : [
									{
										"name" : "filterable",
										"value" : "false",
										"namespace" : "http://www.sap.com/Protocols/SAPData"
									},
									{
										"name" : "label",
										"value" : "Sales Share",
										"namespace" : "http://www.sap.com/Protocols/SAPData"
									},
									{
										"name" : "aggregation-role",
										"value" : "measure",
										"namespace" : "http://www.sap.com/Protocols/SAPData"
									},
									{
										"name" : "unit",
										"value" : "Sales_CURRENCY",
										"namespace" : "http://www.sap.com/Protocols/SAPData"
									} ],
							"sap:filterable" : "false",
							"sap:label" : "Sales Share",
							"com.sap.vocabularies.Common.v1.Label" : {
								"String" : "Sales Share"
							},
							"sap:aggregation-role" : "measure",
							"com.sap.vocabularies.Analytics.v1.Measure" : {
								"Bool" : "true"
							},
							"sap:unit" : "Sales_CURRENCY",
							"Org.OData.Measures.V1.ISOCurrency" : {
								"Path" : "Sales_CURRENCY"
							}
						}
				};
				var oMeasure = "SalesShare";
                var expectedReturn = "Sales Share";
				var actualReturn = SmartAnnotationManager.getSapLabel(oMeasure,oMetadata);
				ok(expectedReturn === actualReturn, "check expected vlue of getSapLabel()");
				});

			test("getChartType() - get the chart Type",function(){
               var simulatedEntityTypeData = {
                    "name": "SalesShareType",
                    "namespace": "sap.smartbusinessdemo.services",
                    "$path": "/dataServices/schema/0/entityType/0",
                    "com.sap.vocabularies.UI.v1.Identification#Eval_by_Country": [{
                        "Label": {
                            "String": ""
                        },
                        "Criticality": {
                            "EnumMember": "com.sap.vocabularies.UI.v1.CriticalityType/Positive"
                        },
                        "SemanticObject": {
                            "String": "OVP"
                        },
                        "Action": {
                            "String": "Procurement"
                        },
                        "RecordType": "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"
                    }, {
                        "Label": {
                            "String": "Evaluation"
                        },
                        "Value": {
                            "String": "evaluation2"
                        },
                        "RecordType": "com.sap.vocabularies.UI.v1.DataField"
                    }],
                    "com.sap.vocabularies.UI.v1.DataPoint#Eval_by_Country": {
                        "Title": {
                            "String": "Sales India"
                        },
                        "Value": {
                            "Path": "Sales",
                            "EdmType": "Edm.Decimal"
                        },
                        "NumberFormat": {
                            "ScaleFactor": {
                                "Int": "0"
                            },
                            "NumberOfFractionalDigits": {
                                "Int": "3"
                            }
                        },
                        "CriticalityCalculation": {
                            "ImprovementDirection": {
                                "EnumMember": "com.sap.vocabularies.UI.v1.ImprovementDirectionType/Minimizing"
                            },
                            "DeviationRangeHighValue": {
                                "String": "7300"
                            },
                            "ToleranceRangeHighValue": {
                                "String": "7200"
                            }
                        },
                        "TargetValue": {
                            "String": "2.000 "
                        },
                        "TrendCalculation": {
                            "ReferenceValue": {
                                "String": "5201680"
                            },
                            "DownDifference": {
                                "Int": "10000000.0"
                            }
                        },
                        "RecordType": "com.sap.vocabularies.UI.v1.DataPointType"
                    },
                    "com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_Country": {
                        "SelectOptions": [{
                            "PropertyName": {
                                "PropertyPath": "Country"
                            },
                            "Ranges": [{
                                "Sign": {
                                    "EnumMember": "com.sap.vocabularies.UI.v1.SelectionRangeSignType/I"
                                },
                                "Option": {
                                    "EnumMember": "com.sap.vocabularies.UI.v1.SelectionRangeOptionType/EQ"
                                },
                                "Low": {
                                    "String": "IN"
                                }
                            }]
                        }, {
                            "PropertyName": {
                                "PropertyPath": "Currency"
                            },
                            "Ranges": [{
                                "Sign": {
                                    "EnumMember": "com.sap.vocabularies.UI.v1.SelectionRangeSignType/I"
                                },
                                "Option": {
                                    "EnumMember": "com.sap.vocabularies.UI.v1.SelectionRangeOptionType/EQ"
                                },
                                "Low": {
                                    "String": "EUR"
                                }
                            }]
                        }]
                    },
                    "com.sap.vocabularies.UI.v1.PresentationVariant#Eval_by_Country": {
                        "GroupBy": [{
                            "PropertyPath": "Country"
                        }],
                        "SortOrder": [{
                            "Property": {
                                "PropertyPath": "Year"
                            },
                            "Descending": {
                                "Boolean": "true"
                            }
                        }],
                        "Visualizations": [{
                            "AnnotationPath": "@com.sap.vocabularies.UI.v1.Chart#Eval_by_Country"
                        }]
                    },
                    "com.sap.vocabularies.UI.v1.Chart#Eval_by_Country": {
                        "Title": {
                            "String": "View1"
                        },
                        "MeasureAttributes": [{
                            "Measure": {
                                "PropertyPath": "SalesShare"
                            },
                            "Role": {
                                "EnumMember": "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1"
                            },
                            "RecordType": "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType"
                        }],
                        "DimensionAttributes": [{
                            "Dimension": {
                                "PropertyPath": "ProductID"
                            },
                            "Role": {
                                "EnumMember": "com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category"
                            },
                            "RecordType": "com.sap.vocabularies.UI.v1.ChartDimensionAttributeType"
                        }, {
                            "Dimension": {
                                "PropertyPath": "Region"
                            },
                            "Role": {
                                "EnumMember": "com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Series"
                            },
                            "RecordType": "com.sap.vocabularies.UI.v1.ChartDimensionAttributeType"
                        }],
                        "RecordType": "com.sap.vocabularies.UI.v1.ChartDefinitionType"
                    },
                    "property": [{
                        "name": "Country",
                        "type": "Edm.String",
                        "maxLength": "3",
                        "extensions": [{
                            "name": "label",
                            "value": "Country",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }, {
                            "name": "aggregation-role",
                            "value": "dimension",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }],
                        "sap:label": "Country",
                        "com.sap.vocabularies.Common.v1.Label": {
                            "String": "Country"
                        },
                        "sap:aggregation-role": "dimension"
                    }, {
                        "name": "Region",
                        "type": "Edm.String",
                        "maxLength": "4",
                        "extensions": [{
                            "name": "label",
                            "value": "Region",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }, {
                            "name": "aggregation-role",
                            "value": "dimension",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }],
                        "sap:label": "Region",
                        "com.sap.vocabularies.Common.v1.Label": {
                            "String": "Region"
                        },
                        "sap:aggregation-role": "dimension"
                    }, {
                        "name": "ProductID",
                        "type": "Edm.String",
                        "maxLength": "10",
                        "extensions": [{
                            "name": "label",
                            "value": "Product ID",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }, {
                            "name": "aggregation-role",
                            "value": "dimension",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }, {
                            "name": "text",
                            "value": "Product",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }],
                        "sap:label": "Product ID",
                        "com.sap.vocabularies.Common.v1.Label": {
                            "String": "Product ID"
                        },
                        "sap:aggregation-role": "dimension",
                        "sap:text": "Product",
                        "com.sap.vocabularies.Common.v1.Text": {
                            "Path": "Product"
                        }
                    }, {
                        "name": "Currency",
                        "type": "Edm.String",
                        "maxLength": "5",
                        "extensions": [{
                            "name": "label",
                            "value": "Currency",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }, {
                            "name": "aggregation-role",
                            "value": "dimension",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }],
                        "sap:label": "Currency",
                        "com.sap.vocabularies.Common.v1.Label": {
                            "String": "Currency"
                        },
                        "sap:aggregation-role": "dimension"
                    }, {
                        "name": "SalesShare",
                        "type": "Edm.Decimal",
                        "precision": "12",
                        "scale": "5",
                        "extensions": [{
                            "name": "filterable",
                            "value": "false",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }, {
                            "name": "label",
                            "value": "Sales Share",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }, {
                            "name": "aggregation-role",
                            "value": "measure",
                            "namespace": "http://www.sap.com/Protocols/SAPData"
                        }],
                        "sap:filterable": "false",
                        "sap:label": "Sales Share",
                        "com.sap.vocabularies.Common.v1.Label": {
                            "String": "Sales Share"
                        },
                        "sap:aggregation-role": "measure"
                    }]
                };

               var simulatedOvpModel = {
                   getProperty: function (path) {
                       if (path == "/entityType") {
                           return simulatedEntityTypeData;
                       }
                   }
               };

               var entityTypeDataContext = {
                   getModel: function (model) {
                       if (model == "ovpCardProperties") {
                           return simulatedOvpModel;
                       }
                   }
               };

               var simulatedIContext = {
                   getSetting: function (model) {
                       if (model == "ovpCardProperties") {
                           return simulatedOvpModel;
                       }
                   }
               };

               var bubbleCheck = {"EnumMember":"com.sap.vocabularies.UI.v1.ChartType/Bubble"}
               assert.equal(SmartAnnotationManager.getChartType(simulatedIContext, bubbleCheck), "bubble", "Bubble Check done");

               var lineCheck = {"EnumMember":"com.sap.vocabularies.UI.v1.ChartType/Line"}
               assert.equal(SmartAnnotationManager.getChartType(simulatedIContext, lineCheck), "line", "Line Check done");

               var donutCheck = {"EnumMember":"com.sap.vocabularies.UI.v1.ChartType/Donut"}
               assert.equal(SmartAnnotationManager.getChartType(simulatedIContext, donutCheck), "donut", "Donut Check done");

              });
			test("checkBubbleChart() - true",function(){
               var BubbleCheck = {"EnumMember":"com.sap.vocabularies.UI.v1.ChartType/Bubble"}
               assert.equal(SmartAnnotationManager.checkBubbleChart(BubbleCheck), true, "Bubble Check is true");
            });

            test("checkBubbleChart() - false",function(){
               var BubbleCheck = {"EnumMember":"com.sap.vocabularies.UI.v1.ChartType/Line"}
               assert.equal(SmartAnnotationManager.checkBubbleChart(BubbleCheck), false, "Bubble Check is false");
            });



	               });
	           });
		});
