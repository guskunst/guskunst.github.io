/*global QUnit,sinon*/

sap.ui.require([
	"sap/ui/comp/smartmicrochart/SmartComparisonMicroChart",
	"sap/ui/model/Model",
	"sap/ui/core/CustomData",
	"sap/ui/model/json/JSONModel",
	"sap/m/Label",
	"sap/suite/ui/microchart/ComparisonMicroChart",
	"sap/m/Button"

], function (
	SmartComparisonMicroChart,
	Model,
	CustomData,
	JSONModel,
	Label,
	ComparisonMicroChart,
	Button
) {
	"use strict";

	QUnit.module("SmartComparisonMicroChart", {
		beforeEach: function() {
			this.oChart = new SmartComparisonMicroChart({
				id: "smart-comparison-microchart"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oChart.destroy();
		}
	});

	QUnit.test("Property chartType is read-only", function(assert) {
		this.oChart.setChartType("SomeType");
		assert.equal(this.oChart.getChartType(), "Comparison", "ChartType cannot be overwritten by setter.");
	});

	QUnit.test("Should have an entitySet property from constructor", function(assert) {
		var oChart = new SmartComparisonMicroChart({
			entitySet: "Otto"
		});
		assert.strictEqual(oChart.getEntitySet(), "Otto");
		oChart.destroy();
	});

	QUnit.test("Check default values", function(assert) {
		assert.equal(this.oChart.getChartType(), "Comparison", "ChartType default value is correct.");
		assert.equal(this.oChart.getEntitySet(), "", "EntitySet default value is correct.");
		assert.equal(this.oChart.getChartBindingPath(), "", "ChartBindingPath default value is correct.");
		assert.equal(this.oChart.getWidth(), undefined, "Width default value is correct.");
		assert.equal(this.oChart.getHeight(), undefined, "Height default value is correct.");
		assert.notOk(this.oChart.getIsResponsive(), "isResponsive default value is correct.");
		assert.strictEqual(SmartComparisonMicroChart.getMetadata()._sDefaultAggregation, "_chart", "The default aggregation is correctly set to _chart");
	});

	QUnit.test("Check setter for 'entitySet' Property", function(assert) {
		var oSpy = sinon.spy(this.oChart, "_initializeMetadata");
		this.oChart.setEntitySet("MySet");
		assert.strictEqual(oSpy.callCount, 1, "Method _initializeMetadata is called when entitySet has changed.");
		assert.strictEqual(this.oChart.getEntitySet(), "MySet", "EntitySet has been correctly set.");

		this.oChart.setEntitySet("MySet");
		assert.strictEqual(oSpy.callCount, 1, "Method _initializeMetadata is not called when entitySet has not changed.");

		oSpy.restore();
	});


	QUnit.test("Attaching a model ends in metadata initialization", function(assert) {
		var oSpy = sinon.spy(this.oChart, "propagateProperties");
		sinon.stub(this.oChart, "_initializeMetadata");

		this.oChart.setModel(new Model());

		assert.ok(this.oChart._initializeMetadata.calledOnce, "Attaching a model ends in property propagation which ends in init metadata.");
		assert.deepEqual(oSpy.callCount, 1, "Function propagateProperties has been called once.");

		this.oChart._initializeMetadata.restore();
	});

	QUnit.test("ChartProvider is created with correct parameters", function(assert) {
		var sEntitySet = "MySet";
		var oModel = new Model();
		this.oChart.setEntitySet(sEntitySet);

		sinon.stub(this.oChart, "getModel").returns(oModel);
		this.oChart._createChartProvider.apply(this.oChart);

		assert.ok(this.oChart._oChartProvider, "Internal ChartProvider created.");
		assert.strictEqual(this.oChart._oChartProvider.sEntitySet, sEntitySet);
		assert.strictEqual(this.oChart._oChartProvider._oParentODataModel, oModel);
	});

	QUnit.test("Should pass the Qualifier to the ChartProvider by adding CustomData", function(assert) {
		var oCustomData = new CustomData({
			key: "chartQualifier",
			value: "ComparisonChartQualifier"
		});
		this.oChart.setEntitySet("MySet");
		this.oChart.addCustomData(oCustomData);

		sinon.stub(this.oChart, "getModel").returns(new Model());

		this.oChart._createChartProvider.apply(this.oChart);

		assert.ok(this.oChart._oChartProvider, "ChartProvider was created successfully");
		assert.strictEqual(this.oChart._oChartProvider._sChartQualifier, "ComparisonChartQualifier", "chartQualifier was set in ChartProvider successfully");
	});

	QUnit.test("Should pass the Qualifier to the ChartProvider by calling data()", function(assert) {
		this.oChart.setEntitySet("MySet");
		this.oChart.data("chartQualifier", "ComparisonChartQualifier");

		sinon.stub(this.oChart, "getModel").returns(new Model());

		this.oChart._createChartProvider.apply(this.oChart);

		assert.ok(this.oChart._oChartProvider, "ChartProvider was created successfully");
		assert.strictEqual(this.oChart._oChartProvider._sChartQualifier, "ComparisonChartQualifier", "chartQualifier was set in ChartProvider successfully");
	});

	QUnit.test("Check if MetaModel loading mechanism is working for abtract Model implementations", function(assert) {
		var oModel = new Model();
		sinon.spy(this.oChart, "_initializeMetadata");
		sinon.stub(this.oChart, "_onMetadataInitialized");

		this.oChart.setModel(oModel);

		assert.strictEqual(this.oChart._initializeMetadata.callCount, 1, "_initializeMetadata has been called exactly one time");
		assert.strictEqual(this.oChart._onMetadataInitialized.callCount, 1, "_onMetadataInitialized has been called");

		this.oChart._initializeMetadata.restore();
		this.oChart._onMetadataInitialized.restore();
	});

	QUnit.module("Function _getBindingPath", {
		beforeEach: function() {
			this.oChart = new SmartComparisonMicroChart();
		},
		afterEach: function() {
			this.oChart.destroy();
			this.oChart = null;
		}
	});

	QUnit.test("Control has chartBindingPath", function(assert) {
		this.oChart.setChartBindingPath("/Some/Path");

		assert.equal(this.oChart._getBindingPath(), "/Some/Path", "ChartBindingPath has been correctly returned.");
	});

	QUnit.test("Control has entitySet", function(assert) {
		this.oChart.setEntitySet("Enten");

		assert.equal(this.oChart._getBindingPath(), "/Enten", "/{entitySet} has been correctly returned.");
	});

	QUnit.test("Control has entitySet and chartBindingPath", function(assert) {
		this.oChart.setChartBindingPath("/Some/Path");
		this.oChart.setEntitySet("Enten");

		assert.equal(this.oChart._getBindingPath(), "/Some/Path", "ChartBindingPath has been correctly returned.");
	});

	QUnit.test("Control has neither property", function(assert) {
		assert.equal(this.oChart._getBindingPath(), "", "Empty string has been returned.");
	});

	QUnit.module("Function _updateAssociations", {
		beforeEach: function() {
			this.oChart = new SmartComparisonMicroChart({
				id: "smart-comparison-microchart"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oChart._oChartViewMetadata = {
				annotation: {
					Title: { Path: "Title" }
				}
			};
			sinon.stub(this.oChart, "_checkChartMetadata").returns(true);
			sinon.stub(this.oChart, "_onMetadataInitialized");
			this.oChart._sBindingPath = "/Series";

		},
		afterEach: function() {
			this.oChart.destroy();
			this.oChart._checkChartMetadata.restore();
			this.oChart._onMetadataInitialized.restore();
		}
	});

	QUnit.test("Model is attached", function(assert) {
		var oModel = new JSONModel({
			Title: "My Title"
		});
		var oDataBinding = {
			getContexts: function() {
				return [
					oModel.createBindingContext("/")
				];
			}
		};
		this.oChart.setModel(oModel);
		var oChartTitle = new Label({ text: "DefaultText" });
		this.oChart.setChartTitle(oChartTitle);

		this.oChart._updateAssociations(oDataBinding);

		assert.equal(oChartTitle.getText(), "My Title", "Aggregation has been updated.");
	});

	QUnit.module("Aria test delegeting", {
		beforeEach: function() {
			this.oSCMC = new SmartComparisonMicroChart();
			this.oMC = new ComparisonMicroChart();
			this.oSCMC.setAggregation("_chart", this.oMC);
			this.oButton1 = new Button();
			this.oButton2 = new Button();
			this.oButton3 = new Button();
		},
		afterEach: function() {
			this.oSCMC.destroy();
			this.oMC.destroy();
		}
	});

	QUnit.test("Test addAriaLabelledBy", function(assert) {
		var oSpyAriaLabelledBy = sinon.spy(this.oMC, "addAriaLabelledBy");

		this.oSCMC.addAriaLabelledBy(this.oButton1);
		assert.ok(this.oMC.addAriaLabelledBy.calledOnce, "If addAriaLabelledBy function was called in MicroChart from SmartMicroChart exactly once");
		oSpyAriaLabelledBy.restore();
	});

	QUnit.test("Test removeAriaLabelledBy", function(assert) {
		var oSpyAriaLabelledBy = sinon.spy(this.oMC, "removeAriaLabelledBy");

		this.oSCMC.addAriaLabelledBy(this.oButton1);
		this.oSCMC.removeAriaLabelledBy(this.oButton1);
		assert.ok(this.oMC.removeAriaLabelledBy.calledOnce, "If removeAriaLabelledBy was called in MicroChart from SmartMicroChart exactly once");
		oSpyAriaLabelledBy.restore();
	});

	QUnit.test("Test removeAllAriaLabelledBy", function(assert) {
		var oSpyAriaLabelledBy = sinon.spy(this.oMC, "removeAllAriaLabelledBy");

		this.oSCMC.addAriaLabelledBy(this.oButton1);
		this.oSCMC.addAriaLabelledBy(this.oButton2);
		this.oSCMC.addAriaLabelledBy(this.oButton3);

		this.oSCMC.removeAllAriaLabelledBy(this.oText);
		assert.ok(this.oMC.removeAllAriaLabelledBy.calledOnce, "If removeAllAriaLabelledBy was called in MicroChart from SmartMicroChart exactly once");
		oSpyAriaLabelledBy.restore();
	});

	QUnit.module("sap.ui.comp.smartmicrochart.SmartComparisonMicroChart calculation", {
		beforeEach: function() {
			this.oChart = new SmartComparisonMicroChart({
				id: "smart-comparison-microchart",
				entitySet: "Prices"
			}).placeAt("qunit-fixture");

			this.oChart._oChartViewMetadata = {
				annotation: {
					Measures: [{ PropertyPath: "Price" }],
					MeasureAttributes: [{
						DataPoint: { AnnotationPath: "@com.sap.vocabularies.UI.v1.DataPoint#ComparisonChartDataPoint" },
						Measure: { PropertyPath: "Price" },
						RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
						Role: { EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1" }
					}]
				},
				measureFields: [{}],
				dimensionFields: ["Day"],
				fields: [
					{
						name: "Day"
					}
				]
			};
			this.oChart._sBindingPath = "/Series";
			this.oChart._oDataPointAnnotations = {
				Criticality: {
					Path: "Criticality"
				},
				Value: {
					Path: "Price"
				},
				Title: {
					Path: "Title"
				}
			};

			var oModel = new JSONModel({
				Prices: [
					{
						Price: 0,
						Ctiticality: "Neutral"
					}
				]
			});
			this.oChart.setModel(oModel);

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oChart.destroy();
		}
	});

	QUnit.test("Check chart and target binding", function(assert) {
		sinon.stub(this.oChart, "_getDataPointQualifier").returns("ComparisonChartDataPoint");
		sinon.stub(this.oChart, "_getPropertyAnnotation").returns({});
		this.oChart._createAndBindInnerChart();
		assert.strictEqual(this.oChart.getAggregation("_chart").getBindingInfo("data").template.getBindingPath("value"), "Price", "The aggregation value was bound successfully");
		assert.strictEqual(this.oChart.getAggregation("_chart").getBindingInfo("data").template.getBindingPath("color"), "Criticality", "The aggregation color was bound successfully");
		assert.strictEqual(this.oChart.getAggregation("_chart").getBindingInfo("data").template.getBindingPath("title"), "Title", "The aggregation title was bound successfully");
		assert.strictEqual(this.oChart.getAggregation("_chart").getBindingInfo("data").template.getBindingPath("displayValue"), undefined, "The aggregation displayValue was not bound");
		this.oChart._getDataPointQualifier.restore();
		this.oChart._getPropertyAnnotation.restore();
	});

	QUnit.test("Height and width not set when isResponsive true", function(assert) {
		this.oChart.setHeight("200px");
		this.oChart.setWidth("200px");
		this.oChart.setIsResponsive(true);

		sap.ui.getCore().applyChanges();

		assert.equal(this.oChart.getAggregation("_chart").getWidth(), "200px", "width is used when isResponsive is set on inner chart");
		assert.equal(this.oChart.getAggregation("_chart").getHeight(), "200px", "height is used when isResponsive is set on inner chart");
		assert.equal(this.oChart.getAggregation("_chart").getSize(), "Responsive", "responsive size is on inner chart");
	});

	QUnit.test("Height and width set when isResponsive false", function(assert) {
		this.oChart.setHeight("200px");
		this.oChart.setWidth("200px");
		this.oChart.setIsResponsive(false);

		sap.ui.getCore().applyChanges();

		assert.equal(this.oChart.getAggregation("_chart").getWidth(), "200px", "width is used when isResponsive is not set on inner chart");
		assert.equal(this.oChart.getAggregation("_chart").getHeight(), "200px", "height is used when isResponsive is not set on inner chart");
		assert.notEqual(this.oChart.getAggregation("_chart").getSize(), "Responsive", "responsive size is on inner chart");
	});

	QUnit.test("Css class is set when isResponsive", function(assert) {
		this.oChart.setIsResponsive(false);

		sap.ui.getCore().applyChanges();

		assert.notOk(this.oChart.$().hasClass("sapSuiteUiSmartMicroChartResponsive"), "responsive class is not set");

		this.oChart.setIsResponsive(true);

		sap.ui.getCore().applyChanges();

		assert.ok(this.oChart.$().hasClass("sapSuiteUiSmartMicroChartResponsive"), "responsive class is set");
	});

	QUnit.module("sap.ui.comp.smartmicrochart.SmartComparisonMicroChart calculation 2", {
		beforeEach: function() {
			this.oChart = new SmartComparisonMicroChart({
				id: "smart-comparison-microchart"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oChart._oChartViewMetadata = {
				annotation: {
					ChartType: { EnumMember: "com.sap.vocabularies.UI.v1.ChartType/Comparison" },
					Measures: [{ PropertyPath: "Price" }],
					MeasureAttributes: [{
						DataPoint: { AnnotationPath: "@com.sap.vocabularies.UI.v1.DataPoint#ComparisonChartDataPoint" },
						Measure: { PropertyPath: "Price" },
						RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
						Role: { EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1" }
					}]
				},
				measureFields: [{}],
				dimensionFields: ["Day"],
				fields: [
					{
						name: "Day"
					}
				]
			};
			this.oChart._sBindingPath = "/Series";
			this.oChart._oDataPointAnnotations = {
				Value: {
					Path: "Price"
				}
			};
		},
		afterEach: function() {
			this.oChart.destroy();
		}
	});

	QUnit.test("Check chart and target binding", function(assert) {
		sinon.stub(this.oChart, "_getDataPointQualifier").returns("ComparisonChartDataPoint");
		sinon.stub(this.oChart, "_getPropertyAnnotation").returns(
				{
					"com.sap.vocabularies.Common.v1.Text": {
						Path: "DisplayValue"
					}
				}
		);
		this.oChart._createAndBindInnerChart();
		assert.strictEqual(this.oChart.getAggregation("_chart").getBindingInfo("data").template.getBindingPath("value"), "Price", "The aggregation value was bound successfully");
		assert.strictEqual(this.oChart.getAggregation("_chart").getBindingInfo("data").template.getBindingPath("color"), undefined, "The aggregation color was not bound");
		assert.strictEqual(this.oChart.getAggregation("_chart").getBindingInfo("data").template.getBindingPath("title"), undefined, "The aggregation title was not bound");
		assert.strictEqual(this.oChart.getAggregation("_chart").getBindingInfo("data").template.getBindingPath("displayValue"), "DisplayValue", "The aggregation displayValue was bound successfully");
		this.oChart._getDataPointQualifier.restore();
		this.oChart._getPropertyAnnotation.restore();
	});

	QUnit.start();
});
