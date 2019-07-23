sap.ui.define([
	"sap/suite/ui/generic/template/changeHandler/util/AnnotationChangeUtilsV2",
	"sap/suite/ui/generic/template/designtime/utils/DesigntimeUtils"
], function(AnnotationChangeUtils, DesigntimeUtils) {
	"use strict";

	var ChartMeasures = {},

		MEASURE_ROLE_TYPE = "com.sap.vocabularies.UI.v1.ChartMeasureRoleType",
		DATAPOINT = "com.sap.vocabularies.UI.v1.DataPoint",
		CHARTTYPE_AREA = "com.sap.vocabularies.UI.v1.ChartType/Area",
		CHARTTYPE_DONUT = "com.sap.vocabularies.UI.v1.ChartType/Donut",
		CHARTTYPE_BULLET = "com.sap.vocabularies.UI.v1.ChartType/Bullet";

	/**
	 * Retrieves the type definition of a record of the virtual collection vMeasures for a given chart.
	 * The complex types combines the information from the Measures and MeasureAttributes collections of a
	 * UI.Chart annotation
	 *
	 * @param {object} oElement The chart element (in overlay mode)
	 * @returns {object} An object comprising the definitions, including type and label
	 * @private
	 */
	ChartMeasures.getMeasureDefinition = function(oElement) {
		var oMeasure = {
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
				namespace: "com.sap.vocabularies.UI.v1",
				annotation: "Chart",
				nullable: false
			}
		};
		var oCriticalityCalculation = {
			properties: [
				"ImprovementDirection",
				"DeviationRangeLowValue",
				"DeviationRangeHighValue",
				"ToleranceRangeLowValue",
				"ToleranceRangeHighValue"
			]
		};

		var oChartFromParent = DesigntimeUtils.getChartFromParent(oElement),
			oChart = oChartFromParent && oChartFromParent.entityType[oChartFromParent.chartID];
		if (!oChartFromParent || !oChart || !oChart.ChartType) {
			return oMeasure;
		}

		switch (oChart.ChartType.EnumMember) {
			case CHARTTYPE_AREA:
				oMeasure.Role.nullable = false;

				oMeasure.DataPoint = {
					displayName: "Data Point Properties",
					type: "ComplexType",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "DataPoint",
					whiteList: {
						properties: [
							"Value",
							"TargetValue",
							"CriticalityCalculation"],
						mandatory: ["Value", "TargetValue"],
						expressionTypes: {
							Value: ["Path"],
							TargetValue: ["Path", "String", "Int", "Decimal"]
						},
						CriticalityCalculation: oCriticalityCalculation
					}
				};
				break;
			case CHARTTYPE_BULLET:
				oMeasure.Role.nullable = true;

				oMeasure.DataPoint = {
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
						mandatory: ["Value"],
						expressionTypes: {
							Value: [ "Path" ],
							TargetValue: ["Path", "String", "Int", "Decimal"],
							ForecastValue: ["Path", "String", "Int", "Decimal"],
							Criticality: ["Path"]
						},
						CriticalityCalculation: oCriticalityCalculation
					}
				};
				break;
			case CHARTTYPE_DONUT:
				oMeasure.Role.nullable = true;

				oMeasure.DataPoint = {
					displayName: "Data Point Properties",
					type: "ComplexType",
					namespace: "com.sap.vocabularies.UI.v1",
					annotation: "DataPoint",
					whiteList: {
						properties: ["Value", "TargetValue", "Criticality", "CriticalityCalculation"],
						mandatory: ["Value"],
						expressionTypes: {
							Value: ["Path"],
							TargetValue: ["Path", "String", "Int", "Decimal"],
							Criticality: ["Path"]
						},
						CriticalityCalculation: oCriticalityCalculation
					}
				};
				break;
			default:
				break;
		}
		return oMeasure;
	};

	/**
	 * Retrieves the complex value of the vMeasures property for a given chart element.
	 * The complex types combines the information from the Measures and MeasureAttributes collections of a
	 * UI.Chart annotation
	 *
	 * @param {object} oElement The current chart element
	 * @returns {object} An object comprising the values.
	 * @public
	 */
	ChartMeasures.getMeasures = function(oElement) {
		var oMeasure = {},
			aMeasures = [],
			sMeasure,
			sQualifier,
			bAttributesFound,
			oMeasureAttribute,
			sDataPoint,
			oDataPoint = {},
			oDataPointFromModel,
			oChartFromParent = DesigntimeUtils.getChartFromParent(oElement),
			oChartFromModel = oChartFromParent && oChartFromParent.entityType[oChartFromParent.chartID];

		if (oChartFromModel && oChartFromModel.Measures) {
			var oChart = jQuery.extend(true, {}, oChart, oChartFromModel);
			for ( var i = 0; i < oChart.Measures.length; i++ ) {
				sMeasure = oChart.Measures[i].PropertyPath;
				bAttributesFound = false;
				if (oChart.MeasureAttributes) {
					for (var j = 0; j < oChart.MeasureAttributes.length; j++) {
						oMeasureAttribute = oChart.MeasureAttributes[j];
						oDataPoint = {};
						if (oMeasureAttribute.Measure && oMeasureAttribute.Measure.PropertyPath === sMeasure) {
							bAttributesFound = true;
							if (oMeasureAttribute.DataPoint && oMeasureAttribute.DataPoint.AnnotationPath) {
								sQualifier = oMeasureAttribute.DataPoint.AnnotationPath.split("#").reverse()[0];
								sDataPoint = sQualifier ? DATAPOINT + "#" + sQualifier : DATAPOINT;
								oDataPointFromModel = oChartFromParent.entityType[sDataPoint];
								if (oDataPointFromModel) {
									jQuery.extend(true, oDataPoint, oDataPointFromModel);
								}
							}
							oMeasure = {
								Measure: {
									PropertyPath: oMeasureAttribute.Measure && oMeasureAttribute.Measure.PropertyPath
								},
								DataPointAnnotationPath: {
									AnnotationPath: oMeasureAttribute.DataPoint && oMeasureAttribute.DataPoint.AnnotationPath
								},
								DataPoint: oDataPoint
							};
							if (oMeasureAttribute.Role && oMeasureAttribute.Role.EnumMember) {
								switch (oMeasureAttribute.Role.EnumMember) {
									case "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1":
										oMeasure.Role = {
											EnumMember: "Axis1"
										};
										break;
									case "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2":
										oMeasure.Role = {
											EnumMember: "Axis2"
										};
										break;
									case "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3":
										oMeasure.Role = {
											EnumMember: "Axis3"
										};
										break;
									default:
										break;
								}
							}
							aMeasures.push(oMeasure);
							break;
						}
					}
				}
				if (!bAttributesFound) {
					oMeasure = {
						Measure: oChart.Measures[i]
					};
					aMeasures.push(oMeasure);
				}
			}
		}
		return aMeasures;
	};

	/**
	 * Updates the value of the Measures and MeasureAttributes for a given column.
	 * Prerequisite: the chart annotation must exist, a new chart must have been created before.
	 *
	 * @param {sap.m.Column} oColumn The column element (in overlay mode)
	 * @param {object}[] aNewMeasures The new values for the virtual property vMeasures
	 * @returns{object} The change content, comprising the implicitly changed annotations.
	 * @public
	 */
	ChartMeasures.setMeasures = function(oColumn, aNewMeasures, oChange) {
		var i, j, k,
			sMeasure,
			bExists,
			oNewMeasure,
			sDataPointPath,
			aCustomChanges = [],
			oMeasureFromAttribute,
			oNewMeasureAttribute = {},
			oChartFromColumn = DesigntimeUtils.getChartFromColumn(oColumn),
			oChartOld = oChartFromColumn && oChartFromColumn.entityType && oChartFromColumn.entityType[oChartFromColumn.chartID];

		if (!oChartOld || jQuery.isEmptyObject(oChartOld) || !oChartFromColumn || !aNewMeasures) {
			return aCustomChanges;
		}

		var oChartNew  = jQuery.extend(true, {}, oChartOld),
			sTarget = oChartFromColumn.entityType.namespace + "." + oChartFromColumn.entityType.name;

		// check for deletions
		if (oChartNew.Measures) {
			for (i = oChartNew.Measures.length - 1; i >= 0; i--) {
				bExists = false;
				sMeasure = oChartNew.Measures[i].PropertyPath;
				for (j = 0; j < aNewMeasures.length; j++) {
					if (aNewMeasures[j].Measure && aNewMeasures[j].Measure.PropertyPath === sMeasure) {
						bExists = true;
						break;
					}
				}
				if (!bExists) {
					oChartNew.Measures.splice(i, 1);
					for (j = oChartNew.MeasureAttributes.length - 1; j >= 0; j--) {
						oMeasureFromAttribute = oChartNew.MeasureAttributes[j].Measure;
						if (oMeasureFromAttribute && oMeasureFromAttribute.PropertyPath === sMeasure) {
							oChartNew.MeasureAttributes.splice(j, 1);
							if (!sMeasure) {
								oChange.noRefreshOnChange = true;
							}
							break;
						}
					}
				}
			}
		}

		// check for inserts or updates
		for (i = 0; i < aNewMeasures.length; i++) {
			oNewMeasure = aNewMeasures[i];
			if (jQuery.isEmptyObject(oNewMeasure)) {
				oNewMeasure = {
					Measure: {
						PropertyPath: ""
					}
				};
			}
			bExists = false;

			if (oChartNew.MeasureAttributes) {
				for (j = 0; j < oChartNew.MeasureAttributes.length; j++) {
					oMeasureFromAttribute = oChartNew.MeasureAttributes[j].Measure;
					if (oNewMeasure.Measure && oMeasureFromAttribute && oMeasureFromAttribute.PropertyPath === oNewMeasure.Measure.PropertyPath) {
						bExists = true;
						break;
					}
				}
			}
			if (oNewMeasure.DataPointAnnotationPath && oNewMeasure.DataPointAnnotationPath.AnnotationPath) {
				sDataPointPath = oNewMeasure.DataPointAnnotationPath.AnnotationPath;
			} else if (oNewMeasure.Measure && oNewMeasure.Measure.PropertyPath) {   //implicitly derive qualifier from property
				sDataPointPath = "@" + DATAPOINT + "#" + oNewMeasure.Measure.PropertyPath;
				oNewMeasure.DataPointAnnotationPath = {
					AnnotationPath: sDataPointPath
				};
			} else {
				sDataPointPath = "";
			}
			oNewMeasureAttribute = {
				Measure: {
					PropertyPath: oNewMeasure.Measure.PropertyPath
				},
				DataPoint: {
					AnnotationPath: sDataPointPath
				},
				RecordType: "com.sap.vocabularies.UI.v1.ChartMeasureAttributeType"
			};
			if (oNewMeasure.Role) {
				switch (oNewMeasure.Role.EnumMember) {
					case "Axis2":
						oNewMeasureAttribute.Role = {
							EnumMember: MEASURE_ROLE_TYPE + "/Axis2"
						};
						break;
					case "Axis3":
						oNewMeasureAttribute.Role = {
							EnumMember: MEASURE_ROLE_TYPE + "/Axis3"
						};
						break;
					default:
						oNewMeasureAttribute.Role = {
							EnumMember: MEASURE_ROLE_TYPE + "/Axis1"
						};
						break;
				}
			} else {
				var sAxis = "Axis1";
				if (oChartOld.MeasureAttributes) {
					var aPossibleAxis = [ "Axis1", "Axis2", "Axis3" ];
					sAxis = "Axis3";
					for (k = 0; k < oChartOld.MeasureAttributes.length; k++) {
						var sRole = oChartOld.MeasureAttributes[k].Role.EnumMember.split("/").reverse()[0];
						var iAxisIndex = aPossibleAxis.indexOf(sRole);
						if (iAxisIndex !== -1) {
							aPossibleAxis.splice(iAxisIndex, 1);
						}
					}
					if (aPossibleAxis.length > 0) {
						sAxis = aPossibleAxis[0];
					}
				}
				oNewMeasure.Role = {
					EnumMember: sAxis
				};
				oNewMeasureAttribute.Role = {
					EnumMember: MEASURE_ROLE_TYPE + "/" + sAxis
				};
			}

			if (!bExists) {
				if (!oChartNew.Measures) {
					oChartNew.Measures = [];
				}
				oChartNew.Measures.push(oNewMeasure.Measure);
				if (!oChartNew.MeasureAttributes) {
					oChartNew.MeasureAttributes = [];
				}
				oChartNew.MeasureAttributes.push(oNewMeasureAttribute);
			} else {
				oChartNew.MeasureAttributes[j] = oNewMeasureAttribute;
			}

			if (!jQuery.isEmptyObject(oNewMeasure.DataPoint)) {
				DesigntimeUtils.modifyDataPointForChart(sTarget, oChartFromColumn.entityType, oNewMeasure, aCustomChanges);
			}

			if (oNewMeasure.Measure.PropertyPath === "") {
				oChange.noRefreshOnChange = true;
			} else if (oNewMeasure.Measure.PropertyPath !== "" && oNewMeasure.DataPoint && oNewMeasure.DataPoint.Value && !oChange.noRefreshOnChange) {
				oChange.noRefreshOnChange = false;
			}
		}
		var oCustomChange = AnnotationChangeUtils.createCustomAnnotationTermChange(
			sTarget,
			oChartNew,
			oChartOld,
			oChartFromColumn.chartID
		);
		aCustomChanges.push(oCustomChange);

		return aCustomChanges;
	};

	return ChartMeasures;
});
