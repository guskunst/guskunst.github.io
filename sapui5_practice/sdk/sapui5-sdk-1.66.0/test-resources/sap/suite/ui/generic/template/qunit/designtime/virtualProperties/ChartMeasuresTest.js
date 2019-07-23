/**
 * tests for the sap.suite.ui.generic.template.designtime.virtualProperties.ChartMeasures.js
 */
sap.ui.define([
		"testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils",
		"sap/suite/ui/generic/template/js/AnnotationHelper",
		"sap/suite/ui/generic/template/designtime/utils/DesigntimeUtils",
		"sap/suite/ui/generic/template/designtime/virtualProperties/ChartMeasures"
	],
	function(sinon, ChangeHandlerUtils, AnnotationHelper, DesigntimeUtils, ChartMeasures) {
		"use strict";

		var CHARTTYPE_DONUT = "com.sap.vocabularies.UI.v1.ChartType/Donut",
			CHARTTYPE_AREA = "com.sap.vocabularies.UI.v1.ChartType/Area",
			CHARTTYPE_BULLET = "com.sap.vocabularies.UI.v1.ChartType/Bullet",
			DATAPOINT = "com.sap.vocabularies.UI.v1.DataPoint",
			MEASURE_ROLE_TYPE = "com.sap.vocabularies.UI.v1.ChartMeasureRoleType",
			MEASURE_ATTRIBUTE_TYPE = "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType";

			QUnit.dump.maxDepth = 20;

		/***************************************************/
		QUnit.module("The function getMeasureDefinition");

		QUnit.test("getMeasureDefinition", function() {
			// Arrange
			var oColumn = {};

			// Act
			var oActualValue = ChartMeasures.getMeasureDefinition(oColumn);

			// Assert
			var oExpectedValue = {
				Measure: {
					displayName: "Measure",
					type: "Edm.PropertyPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				},
				Role: {
					displayName: "Role",
					type: "EnumType",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart",
					possibleValues: {
						Axis1: {
							displayName: "Axis 1"
						},
						Axis2: {
							displayName: "Axis 2"
						},
						Axis3: {
							displayName: "Axis 3"
						}
					}
				},
				DataPointAnnotationPath: {
					displayName: "Data Point Reference",
					type: "Edm.AnnotationPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				}
			};
			assert.deepEqual(oActualValue, oExpectedValue , "returns MeasureAttribute values only if no chart exists yet");
		});

		QUnit.test("getMeasureDefinition", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "myChart",
				entityType: {
					myChart: {
						ChartType: {
							EnumMember: "anyOther"
						}
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var oActualValue = ChartMeasures.getMeasureDefinition(oColumn);

			// Assert
			var oExpectedValue = {
				Measure: {
					displayName: "Measure",
					type: "Edm.PropertyPath",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart",
					nullable: false
				},
				Role: {
					displayName: "Role",
					type: "EnumType",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart",
					possibleValues: {
						Axis1: {
							displayName: "Axis 1"
						},
						Axis2: {
							displayName: "Axis 2"
						},
						Axis3: {
							displayName: "Axis 3"
						}
					}
				},
				DataPointAnnotationPath: {
					displayName: "Data Point Reference",
					type: "Edm.AnnotationPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				}
			};
			assert.deepEqual(oActualValue, oExpectedValue , "returns MeasureAttribute values only if the chart type fits");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("getMeasureDefinition for area chart", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "myChart",
				entityType: {
					myChart: {
						ChartType: {
							EnumMember: CHARTTYPE_AREA
						}
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromParent").returns(oChart);

			// Act
			var oActualValue = ChartMeasures.getMeasureDefinition(oColumn);

			// Assert
			var oExpectedValue = {
				Measure: {
					displayName: "Measure",
					type: "Edm.PropertyPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				},
				Role: {
					displayName: "Role",
					type: "EnumType",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart",
					nullable: false,
					possibleValues: {
						Axis1: {
							displayName: "Axis 1"
						},
						Axis2: {
							displayName: "Axis 2"
						},
						Axis3: {
							displayName: "Axis 3"
						}
					}
				},
				DataPointAnnotationPath: {
					displayName: "Data Point Reference",
					type: "Edm.AnnotationPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				},
				DataPoint : {
					displayName: "Data Point Properties",
					type: "ComplexType",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "DataPoint",
					whiteList: {
						properties: [
							"Value",
							"TargetValue",
							"CriticalityCalculation"
						],
						mandatory: [
							"Value",
							"TargetValue"
						],
						CriticalityCalculation: {
							properties: [
								"ImprovementDirection",
								"DeviationRangeLowValue",
								"DeviationRangeHighValue",
								"ToleranceRangeLowValue",
								"ToleranceRangeHighValue"
							]
						},
						expressionTypes: {
							Value: ["Path"],
							TargetValue: ["Path", "String", "Int", "Decimal"]
						}
					}
				}
			};
			assert.deepEqual(oActualValue, oExpectedValue , "returns measure attributes plus datapoint for area chart");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("getMeasureDefinition for bullet chart", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "myChart",
				entityType: {
					myChart: {
						ChartType: {
							EnumMember: CHARTTYPE_BULLET
						}
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromParent").returns(oChart);

			// Act
			var oActualValue = ChartMeasures.getMeasureDefinition(oColumn);

			// Assert
			var oExpectedValue = {
				Measure: {
					displayName: "Measure",
					nullable: false,
					type: "Edm.PropertyPath",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				},
				Role: {
					displayName: "Role",
					type: "EnumType",
					nullable: true,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart",
					possibleValues: {
						Axis1: {
							displayName: "Axis 1"
						},
						Axis2: {
							displayName: "Axis 2"
						},
						Axis3: {
							displayName: "Axis 3"
						}
					}
				},
				DataPointAnnotationPath: {
					displayName: "Data Point Reference",
					type: "Edm.AnnotationPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				},
				DataPoint : {
					displayName: "Data Point Properties",
					type: "ComplexType",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "DataPoint",
					whiteList: {
						properties: [
							"Value",
							"TargetValue",
							"ForecastValue",
							"MinimumValue",
							"MaximumValue",
							"Criticality",
							"CriticalityCalculation"
						],
						mandatory: [
							"Value"
						],
						CriticalityCalculation: {
							properties: [
								"ImprovementDirection",
								"DeviationRangeLowValue",
								"DeviationRangeHighValue",
								"ToleranceRangeLowValue",
								"ToleranceRangeHighValue"
							]
						},
						expressionTypes: {
							Criticality: ["Path"],
							Value: ["Path"],
							"ForecastValue": [
								"Path",
								"String",
								"Int",
								"Decimal"
							],
							"TargetValue": [
								"Path",
								"String",
								"Int",
								"Decimal"
							]
						}
					}
				}
			};
			assert.deepEqual(oActualValue, oExpectedValue , "returns measure attributes plus datapoint for a bullet chart");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("getMeasureDefinition for area chart", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "myChart",
				entityType: {
					myChart: {
						ChartType: {
							EnumMember: CHARTTYPE_AREA
						}
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromParent").returns(oChart);

			// Act
			var oActualValue = ChartMeasures.getMeasureDefinition(oColumn);

			// Assert
			var oExpectedValue = {
				Measure: {
					displayName: "Measure",
					type: "Edm.PropertyPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				},
				Role: {
					displayName: "Role",
					type: "EnumType",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart",
					possibleValues: {
						Axis1: {
							displayName: "Axis 1"
						},
						Axis2: {
							displayName: "Axis 2"
						},
						Axis3: {
							displayName: "Axis 3"
						}
					}
				},
				DataPointAnnotationPath: {
					displayName: "Data Point Reference",
					type: "Edm.AnnotationPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				},
				DataPoint : {
					displayName: "Data Point Properties",
					type: "ComplexType",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "DataPoint",
					whiteList: {
						properties: [
							"Value",
							"TargetValue",
							"CriticalityCalculation"
						],
						mandatory: [
							"Value",
							"TargetValue"
						],
						CriticalityCalculation: {
							properties: [
								"ImprovementDirection",
								"DeviationRangeLowValue",
								"DeviationRangeHighValue",
								"ToleranceRangeLowValue",
								"ToleranceRangeHighValue"
							]
						},
						expressionTypes: {
							Value: ["Path"],
							TargetValue: ["Path", "String", "Int", "Decimal"]
						}
					}
				}
			};
			assert.deepEqual(oActualValue, oExpectedValue , "returns measure attributes plus datapoint for an area chart");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("getMeasureDefinition", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "myChart",
				entityType: {
					myChart: {
						ChartType: {
							EnumMember: CHARTTYPE_DONUT
						}
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromParent").returns(oChart);

			// Act
			var oActualValue = ChartMeasures.getMeasureDefinition(oColumn);

			// Assert
			var oExpectedValue = {
				Measure: {
					displayName: "Measure",
					type: "Edm.PropertyPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				},
				Role: {
					displayName: "Role",
					type: "EnumType",
					nullable: true,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart",
					possibleValues: {
						Axis1: {
							displayName: "Axis 1"
						},
						Axis2: {
							displayName: "Axis 2"
						},
						Axis3: {
							displayName: "Axis 3"
						}
					}
				},
				DataPointAnnotationPath: {
					displayName: "Data Point Reference",
					type: "Edm.AnnotationPath",
					nullable: false,
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "Chart"
				},
				DataPoint : {
					displayName: "Data Point Properties",
					type: "ComplexType",
					annotation: "DataPoint",
					namespace: "com.sap.vocabularies.UI.v1",
					whiteList: {
						properties: [
							"Value",
							"TargetValue",
							"Criticality",
							"CriticalityCalculation"
						],
						mandatory: [
							"Value"
						],
						CriticalityCalculation: {
							properties: [
								"ImprovementDirection",
								"DeviationRangeLowValue",
								"DeviationRangeHighValue",
								"ToleranceRangeLowValue",
								"ToleranceRangeHighValue"
							]
						},
						expressionTypes: {
							Criticality: ["Path"],
							Value: ["Path"],
							TargetValue: ["Path", "String", "Int", "Decimal"]
						}
					}
				}
			};
			assert.deepEqual(oActualValue, oExpectedValue , "returns measure attributes plus datapoint for an donut chart");

			this.oGetChartFromColumnStub.restore();
		});

		/***************************************************/
		QUnit.module("The function setMeasures", {
			beforeEach: function() {
				this.oDataEntityTypeStub = {
					namespace: "ns",
					name: "MyEntityType"
				};
				this.oChange = {};
				this.oGetODataEntityTypeStub = sinon.stub(ChangeHandlerUtils, "getODataEntityType").returns(this.oDataEntityTypeStub);
				this.oGetEntityTypeStub = sinon.stub(ChangeHandlerUtils, "getEntityType").returns("MyEntityType");
			},
			afterEach: function() {
				this.oGetODataEntityTypeStub.restore();
				this.oGetEntityTypeStub.restore();
			}
		});

		QUnit.test("noRefreshOnChange does not get overwritten when setMeasures was called with it being true.", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [{
				Measure: {PropertyPath: "Product"}
			}];
			this.oChange.noRefreshOnChange = true;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}, {
							PropertyPath: "Sales"
						}],
						MeasureAttributes: []
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);

			// Assert
			assert.ok(this.oChange.noRefreshOnChange, "No refresh on change, because if oChange.noRefreshOnChange is true when setMeasures was called, it shall not be overwritten.");
			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function () {
			var oColumn = {};
			var aNewMeasures = [{Measure: { PropertyPath: "" }}];
			this.oChange.noRefreshOnChange;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: { EnumMember: CHARTTYPE_DONUT },
						Measures: []
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: ""
									},
									Measure: {
										PropertyPath: ""
									},
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: {
										EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1"
									}
								}],
								Measures: [{ PropertyPath: "" }],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								Measures: [],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					}
				}
			}];

			// Assert
			assert.ok(this.oChange.noRefreshOnChange, "There won't be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "No MeasureAttributes available, setting axis to default.");
			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function () {
			var oColumn = {};
			var aNewMeasures = [{
				Measure: { PropertyPath: "Currency" },
				Role: { EnumMember: "Axis1" }
			}, {
				Measure: { PropertyPath: "Product" },
				Role: { EnumMember: "Axis3" }
			}, {
				Measure: { PropertyPath: "" }
			}];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: { EnumMember: CHARTTYPE_DONUT },
						Measures: [{
							PropertyPath: "Currency"
						},	{
							PropertyPath: "Product"
						}],
						MeasureAttributes: [{
							Measure: { PropertyPath: "Currency" },
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis1" },
							DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Currency" }
						}, {
							Measure: { PropertyPath: "Product" },
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis3" },
							DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Product" }
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: { AnnotationPath: "@com.sap.vocabularies.UI.v1.DataPoint#Currency" },
									Measure: { PropertyPath: "Currency" },
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1" }
								}, {
									DataPoint: { AnnotationPath: "@com.sap.vocabularies.UI.v1.DataPoint#Product" },
									Measure: { PropertyPath: "Product" },
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3" }
								}, {
									DataPoint: { AnnotationPath: "" },
									Measure: { PropertyPath: "" },
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2" }
								}],
								Measures: [
									{ PropertyPath: "Currency" },
									{ PropertyPath: "Product" },
									{ PropertyPath: "" }
								],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Currency" },
									Measure: { PropertyPath: "Currency" },
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis1" }
								}, {
									DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Product" },
									Measure: { PropertyPath: "Product" },
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis3" }
								}],
								Measures: [{
									PropertyPath: "Currency"
								}, {
									PropertyPath: "Product"
								}],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					}
				}
			}];

			// Assert
			assert.ok(this.oChange.noRefreshOnChange, "There won't be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "The axis of the new measure has been set to the last possible axis.");
			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function () {
			var oColumn = {};
			var aNewMeasures = [{
				Measure: { PropertyPath: "Currency" },
				Role: { EnumMember: "Axis1" }
			}, {
				Measure: { PropertyPath: "Product" },
				Role: { EnumMember: "Axis2" }
			}, {
				Measure: { PropertyPath: "TargetPrice" },
				Role: { EnumMember: "Axis3" }
			}, {
				Measure: { PropertyPath: "" }
			}];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: { EnumMember: CHARTTYPE_DONUT },
						Measures: [{
							PropertyPath: "Currency"
						}, {
							PropertyPath: "Product"
						}, {
							PropertyPath: "TargetPrice"
						}],
						MeasureAttributes: [{
							Measure: { PropertyPath: "Currency" },
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis1" },
							DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Currency" }
						}, {
							Measure: { PropertyPath: "Product" },
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis2" },
							DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Product" }
						}, {
							Measure: { PropertyPath: "TargetPrice" },
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis3" },
							DataPoint: { AnnotationPath: "@" + DATAPOINT + "#TargetPrice" }
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: { AnnotationPath: "@com.sap.vocabularies.UI.v1.DataPoint#Currency"},
									Measure: { PropertyPath: "Currency"	},
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1" }
								}, {
									DataPoint: { AnnotationPath: "@com.sap.vocabularies.UI.v1.DataPoint#Product" },
									Measure: { PropertyPath: "Product" },
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2" }
								}, {
									DataPoint: { AnnotationPath: "@com.sap.vocabularies.UI.v1.DataPoint#TargetPrice" },
									Measure: { PropertyPath: "TargetPrice" },
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3"	}
								}, {
									DataPoint: { AnnotationPath: "" },
									Measure: { PropertyPath: "" },
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { EnumMember: "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3" }
								}],
								Measures: [
									{ PropertyPath: "Currency" },
									{ PropertyPath: "Product" },
									{ PropertyPath: "TargetPrice" },
									{ PropertyPath: "" }
								],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Currency" },
									Measure: { PropertyPath: "Currency" },
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis1" }
								}, {
									DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Product" },
									Measure: { PropertyPath: "Product" },
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis2" }
								}, {
									DataPoint: { AnnotationPath: "@" + DATAPOINT + "#TargetPrice" },
									Measure: { PropertyPath: "TargetPrice" },
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis3" }
								}],
								Measures: [{
									PropertyPath: "Currency"
								}, {
									PropertyPath: "Product"
								}, {
									PropertyPath: "TargetPrice"
								}],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					}
				}
			}];

			// Assert
			assert.ok(this.oChange.noRefreshOnChange, "There won't be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "The axis of the new measure has been set to the default axis, since all of them are already in use.");
			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function () {
			var oColumn = {};
			var aNewMeasures = [{
				Measure: { PropertyPath: "Currency" },
				Role: { EnumMember: "Axis3" }
			}, {
				Measure: { PropertyPath: "" }
			}
			];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: { EnumMember: CHARTTYPE_DONUT },
						Measures: [{ PropertyPath: "Currency" }],
						MeasureAttributes: [{
							Measure: { PropertyPath: "Currency" },
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis3" },
							DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Currency" }
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Currency" },
									Measure: { PropertyPath: "Currency" },
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis3" }
								}, {
									DataPoint: { AnnotationPath: "" },
									Measure: { PropertyPath: "" },
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis1" }
								}],
								Measures: [
									{ PropertyPath: "Currency" },
									{ PropertyPath: "" }
								],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: { AnnotationPath: "@" + DATAPOINT + "#Currency" },
									Measure: { PropertyPath: "Currency" },
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis3" }
								}],
								Measures: [{ PropertyPath: "Currency" }],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					}
				}
			}];

			// Assert
			assert.ok(this.oChange.noRefreshOnChange, "There won't be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "The axis of the new measure has been set depending on the previous measure axis.");
			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [];
			this.oChange.noRefreshOnChange;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: ""
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: ""},
							RecordType: MEASURE_ATTRIBUTE_TYPE
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [],
								Measures: [],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									Measure: {
										PropertyPath: ""
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE
								}],
								Measures: [{
									PropertyPath: ""
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					}
				}
			}];

			// Assert
			assert.ok(this.oChange.noRefreshOnChange, "There will be no refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "deletes one measure that has its mandatory fields empty.");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [{
				Measure: {PropertyPath: ""}
			}];
			this.oChange.noRefreshOnChange;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}, {
							PropertyPath: ""
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"},
							DataPoint: {AnnotationPath: "@" + DATAPOINT + "#Product"}
						}, {
							Measure: {PropertyPath: ""},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis2"}
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									Measure: {PropertyPath: ""},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									DataPoint: {AnnotationPath: ""},
									Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis3"}
								}],
								Measures: [{
									PropertyPath: ""
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {AnnotationPath: "@" + DATAPOINT + "#Product"},
									Measure: {PropertyPath: "Product"},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"}
								}, {
									Measure: {PropertyPath: ""},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis2"}
								}],
								Measures: [{
									PropertyPath: "Product"
								}, {
									PropertyPath: ""
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					}
				}
			}];

			// Assert
			assert.ok(this.oChange.noRefreshOnChange, "There will be no refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "Deletes one empty measure with one measure having its mandatory field filled remaining.");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [{
				Measure: { PropertyPath: "" }
			}];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: { EnumMember: CHARTTYPE_DONUT },
						Measures: [{ PropertyPath: "TargetPrice" }],
						MeasureAttributes: [{
							Measure: { PropertyPath: "TargetPrice" },
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis1" },
							DataPoint: { AnnotationPath: "@" + DATAPOINT + "#TargetPrice" }
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: { "AnnotationPath": "" },
									Measure: { "PropertyPath": "" },
									RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType",
									Role: { "EnumMember": "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2" }
								}],
								Measures: [{ PropertyPath: "" }],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: { AnnotationPath: "@" + DATAPOINT + "#TargetPrice" },
									Measure: { PropertyPath: "TargetPrice" },
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: { EnumMember: MEASURE_ROLE_TYPE + "/Axis1" }
								}],
								Measures: [{ PropertyPath: "TargetPrice" }],
								ChartType: { EnumMember: CHARTTYPE_DONUT }
							}
						}
					}
				}
			}];

			// Assert
			assert.ok(this.oChange.noRefreshOnChange, "There won't be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "adds a new measure");
			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"},
							DataPoint: {AnnotationPath: "@" + DATAPOINT + "#Product"}
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [],
								Measures: [],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product"
									},
									Measure: {
										PropertyPath: "Product"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									}
								}],
								Measures: [{
									PropertyPath: "Product"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					}
				}
			}];

			// Assert
			assert.notOk(this.oChange.noRefreshOnChange, "There will be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "deletes all existing measures if no new measures are passed");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [{
				Measure: {PropertyPath: "Product"},
				Role: {EnumMember: "Axis1"},
				DataPointAnnotationPath: {AnnotationPath: "@" + DATAPOINT + "#Product2"}
			}];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}, {
							PropertyPath: "Sales"
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"},
							DataPoint: {AnnotationPath: "@" + DATAPOINT + "#Product"}
						}, {
							Measure: {PropertyPath: "Sales"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis2"},
							DataPoint: {AnnotationPath: "@" + DATAPOINT + "#Sales"}
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product2"
									},
									Measure: {
										PropertyPath: "Product"
									},
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE
								}],
								Measures: [{
									PropertyPath: "Product"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product"
									},
									Measure: {
										PropertyPath: "Product"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									}
								}, {
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Sales"
									},
									Measure: {
										PropertyPath: "Sales"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis2"
									}
								}],
								Measures: [{
									PropertyPath: "Product"
								}, {
									PropertyPath: "Sales"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					}
				}
			}];

			// Assert
			assert.notOk(this.oChange.noRefreshOnChange, "There will be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "deletes one existing measure if only one new measure is passed");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [
				{},
				{
					Measure: {PropertyPath: "Product"},
					Role: {EnumMember: "Axis1"},
					DataPointAnnotationPath: {AnnotationPath: "@" + DATAPOINT + "#Product2"}
				}
			];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"},
							DataPoint: {AnnotationPath: "@" + DATAPOINT + "#Product"}
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product2"
									},
									Measure: {
										PropertyPath: "Product"
									},
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE
								}, {
									DataPoint: {
										AnnotationPath: ""
									},
									Measure: {
										PropertyPath: ""
									},
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis2"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE
								}],
								Measures: [{
									PropertyPath: "Product"
								}, {
									PropertyPath: ""
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product"
									},
									Measure: {
										PropertyPath: "Product"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									}
								}],
								Measures: [{
									PropertyPath: "Product"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					}
				}
			}];

			// Assert
			assert.ok(this.oChange.noRefreshOnChange, "There will be no refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "creates a new measure if one empty new measure is passed");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [{
				Measure: {PropertyPath: "Product"},
				Role: {EnumMember: "Axis1"},
				DataPointAnnotationPath: {AnnotationPath: "@" + DATAPOINT + "#Product2"}
			},{
				Measure: {PropertyPath: "Sales"},
				Role: {EnumMember: "Axis2"},
				DataPointAnnotationPath: {AnnotationPath: "@" + DATAPOINT + "#Sales"}
			}];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"},
							DataPoint: {AnnotationPath: "@" + DATAPOINT + "#Product"}
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product2"
									},
									Measure: {
										PropertyPath: "Product"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									}
								},{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Sales"
									},
									Measure: {
										PropertyPath: "Sales"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis2"
									}
								}],
								Measures: [{
									PropertyPath: "Product"
								}, {
									PropertyPath: "Sales"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product"
									},
									Measure: {
										PropertyPath: "Product"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									}
								}],
								Measures: [{
									PropertyPath: "Product"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					}
				}
			}];

			// Assert
			assert.notOk(this.oChange.noRefreshOnChange, "There will be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "updates one entry and inserts a second one, no change of datapoint");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var oChart = {};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);

			var aNewMeasures = [{
				Measure: {PropertyPath: "Product"},
				Role: {EnumMember: "Axis1"},
				DataPoint: {
					Criticality: {
						Path: "SalesValueAddedTax",
						EdmType: "Edm.Byte"
					},
					Description: {String: "Bullet Micro Chart"},
					Value: {Path: "Product"}
				},
				DataPointAnnotationPath: {AnnotationPath: "@" + DATAPOINT + "#Product2"}
			}];
			this.oChange.noRefreshOnChange = false;

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [];

			// Assert
			assert.notOk(this.oChange.noRefreshOnChange, "There will be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "returns an empty array if no chart exists");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [{
				Measure: {PropertyPath: "Product"},
				Role: {EnumMember: "Axis1"},
				DataPointAnnotationPath: {AnnotationPath: "@" + DATAPOINT + "#Product2"},
				DataPoint: {
					Criticality: {
						Path: "SalesValueAddedTax",
						EdmType: "Edm.Byte"
					},
					Description: {String: "Bullet Micro Chart"},
					Value: {Path: "Product"}
				}
			}];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"},
							DataPoint: {AnnotationPath: "@" + DATAPOINT + "#Product"}
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);
			this.oGetComponentStub = sinon.stub(ChangeHandlerUtils, "getComponent");

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.DataPoint#Product2": {
								Criticality: {
									EdmType: "Edm.Byte",
									Path: "SalesValueAddedTax"
								},
								Description: {String: "Bullet Micro Chart"},
								Value: {Path: "Product"}
							}
						}
					},
					oldValue: undefined
				}
			},{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product2"
									},
									Measure: {
										PropertyPath: "Product"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									}
								}],
								Measures: [{
									PropertyPath: "Product"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product"
									},
									Measure: {
										PropertyPath: "Product"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									}
								}],
								Measures: [{
									PropertyPath: "Product"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					}
				}
			}];
			// Assert
			assert.notOk(this.oChange.noRefreshOnChange, "There will be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "returns the same amount of Measures and MeasureAttributes but actualizes the DataPoint");

			this.oGetChartFromColumnStub.restore();
			this.oGetComponentStub.restore();
		});

		QUnit.test("setMeasures", function() {
			// Arrange
			var oColumn = {};
			var aNewMeasures = [{
				Measure: {PropertyPath: "Product"},
				Role:  {EnumMember: "Axis1"},
				DataPointAnnotationPath:  {AnnotationPath: undefined},
				DataPoint: {
					Criticality: {
						Path: "SalesValueAddedTax",
						EdmType: "Edm.Byte"
					},
					Description: {String: "Bullet Micro Chart"},
					Value: {Path: "Product"}
				}
			}];
			this.oChange.noRefreshOnChange = false;
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					namespace: "ns",
					name: "MyEntityType",
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"},
							DataPoint: undefined
						}]
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromColumn").returns(oChart);
			this.oGetComponentStub = sinon.stub(ChangeHandlerUtils, "getComponent");

			// Act
			var aCustomChanges = ChartMeasures.setMeasures(oColumn, aNewMeasures, this.oChange);
			var aExpectedChanges = [{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.DataPoint#Product": {
								Criticality: {
									EdmType: "Edm.Byte",
									Path: "SalesValueAddedTax"
								},
								Description: {String: "Bullet Micro Chart"},
								Value: {Path: "Product"}
							}
						}
					},
					oldValue: undefined
				}
			},{
				changeType: "annotationTermChange",
				content: {
					newValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: {
										AnnotationPath: "@" + DATAPOINT + "#Product"
									},
									Measure: {
										PropertyPath: "Product"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									}
								}],
								Measures: [{
									PropertyPath: "Product"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					},
					oldValue: {
						"ns.MyEntityType": {
							"com.sap.vocabularies.UI.v1.Chart": {
								MeasureAttributes: [{
									DataPoint: undefined,
									Measure: {
										PropertyPath: "Product"
									},
									RecordType: MEASURE_ATTRIBUTE_TYPE,
									Role: {
										EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
									}
								}],
								Measures: [{
									PropertyPath: "Product"
								}],
								ChartType: {EnumMember: CHARTTYPE_DONUT}
							}
						}
					}
				}
			}];
			// Assert
			assert.notOk(this.oChange.noRefreshOnChange, "There will be a refresh on this change.");
			assert.deepEqual(aCustomChanges, aExpectedChanges, "implicitly derives the qualifier for a new DataPoint if the annotation path is empty");

			this.oGetChartFromColumnStub.restore();
			this.oGetComponentStub.restore();
		});

		/***************************************************/
		QUnit.module("The function getMeasures");

		QUnit.test("getMeasures", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {
							EnumMember: {EnumMember: CHARTTYPE_DONUT}
						}
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromParent").returns(oChart);
			// Act
			var aExistingMeasures = ChartMeasures.getMeasures(oColumn);

			// Assert
			assert.deepEqual(aExistingMeasures, [], "returns an empty array if there are no measures");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("getMeasures", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}]
					},
					"com.sap.vocabularies.UI.v1.DataPoint#Product": {}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromParent").returns(oChart);

			// Act
			var aExistingMeasures = ChartMeasures.getMeasures(oColumn);

			// Assert
			var aExpectedMeasures = [{
				Measure: {
					PropertyPath: "Product"
				}
			}
			];
			assert.deepEqual(aExistingMeasures, aExpectedMeasures, "returns the measure only, if there are no attributes defined yet");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("getMeasures", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"}
						}]
					},
					"com.sap.vocabularies.UI.v1.DataPoint#Product": {}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromParent").returns(oChart);

			// Act
			var aExistingMeasures = ChartMeasures.getMeasures(oColumn);

			// Assert
			var aExpectedMeasures = [{
				Measure: {PropertyPath: "Product"},
				Role: {EnumMember: "Axis1"},
				DataPointAnnotationPath: {AnnotationPath: undefined},
				DataPoint: {}
			}];
			assert.deepEqual(aExistingMeasures, aExpectedMeasures, "returns measure and measure attribute without datapoint");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("getMeasures", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}, {
							PropertyPath: "Weight"
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis1"}
						},
							{
								Measure: {PropertyPath: "Weight"},
								Role: {EnumMember: MEASURE_ROLE_TYPE + "/Axis2"}
							}]
					},
					"com.sap.vocabularies.UI.v1.DataPoint#Product": {}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromParent").returns(oChart);

			// Act
			var aExistingMeasures = ChartMeasures.getMeasures(oColumn);

			// Assert
			var aExpectedMeasures = [{
				Measure: {PropertyPath: "Product"},
				Role: {EnumMember: "Axis1"},
				DataPointAnnotationPath: {AnnotationPath: undefined},
				DataPoint: {}
			}, {
				Measure: {PropertyPath: "Weight"},
				Role: {EnumMember: "Axis2"},
				DataPointAnnotationPath: {AnnotationPath: undefined},
				DataPoint: {}
			}];
			assert.deepEqual(aExistingMeasures, aExpectedMeasures, "returns multiple measures and measure attributes");

			this.oGetChartFromColumnStub.restore();
		});

		QUnit.test("getMeasures", function() {
			// Arrange
			var oColumn = {};
			var oChart = {
				chartID: "com.sap.vocabularies.UI.v1.Chart",
				entityType: {
					"com.sap.vocabularies.UI.v1.Chart": {
						ChartType: {EnumMember: CHARTTYPE_DONUT},
						Measures: [{
							PropertyPath: "Product"
						}],
						MeasureAttributes: [{
							Measure: {PropertyPath: "Product"},
							RecordType: MEASURE_ATTRIBUTE_TYPE,
							Role: {
								EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
							},
							DataPoint: {
								AnnotationPath: "@" + DATAPOINT + "#Product"
							}
						}]
					},
					"com.sap.vocabularies.UI.v1.DataPoint#Product": {
						Criticality: {
							Path: "ProductValueAddedTax",
							EdmType: "Edm.Byte"
						},
						Description: {String: "Bullet Micro Chart"}
					}
				}
			};
			this.oGetChartFromColumnStub = sinon.stub(DesigntimeUtils, "getChartFromParent").returns(oChart);

			// Act
			var aExistingMeasures = ChartMeasures.getMeasures(oColumn);

			// Assert
			var aExpectedMeasures = [{
				Measure: {PropertyPath: "Product"},
				Role: {EnumMember: "Axis1"},
				DataPointAnnotationPath: {AnnotationPath: "@" + DATAPOINT + "#Product"},
				DataPoint: {
					Criticality: {
						Path: "ProductValueAddedTax",
						EdmType: "Edm.Byte"
					},
					Description: {String: "Bullet Micro Chart"}
				}
			}
			];
			assert.deepEqual(aExistingMeasures, aExpectedMeasures, "returns measure and measure attribute with datapoint");

			this.oGetChartFromColumnStub.restore();
		});


	});
