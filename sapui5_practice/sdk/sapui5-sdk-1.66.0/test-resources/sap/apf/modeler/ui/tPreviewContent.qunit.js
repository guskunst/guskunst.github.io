sap.ui.define("sap/apf/modeler/u/tPreviewContent", [
	"sap/apf/ui/utils/representationTypesHandler",
	"sap/apf/core/representationTypes",
	"sap/apf/testhelper/modelerUIHelper",
	"sap/m/VBox",
	"sap/ui/thirdparty/sinon"
], function(RepresentationTypesHandler, representationTypes, modelerUIHelper, sapmVBox, sinon){
	'use strict';
	var oPreviewContentView, oRepresentation, oModelerInstance;
	function _instantiateView(sRepresentationType, oRepresentationHandlerStub, bAscending, assert, bHasNoLongTitle) {
		var oPreviewContentController = new sap.ui.controller("sap.apf.modeler.ui.controller.previewContent");
		var oView;
		var spyOnInit = sinon.spy(oPreviewContentController, "onInit");
		oRepresentation = oModelerInstance.unsavedStepWithoutFilterMapping.getRepresentations()[0];
		sinon.stub(oRepresentation, "getOrderbySpecifications", function() {
			return [ {
				ascending : bAscending,
				property : "Amount"
			} ];
		});
		sinon.stub(oRepresentation, "getRepresentationType", function() {
			if(sRepresentationType === "sap.apf.ui.representations.columnChart"){
				return "ColumnChart";
			}
			return "TableRepresentation";
			
		});
		var oStepPropertyMetadataTypeHandlerStub = {
			getProperties : function() {
				return [ "ID", "AirlineCode", "Currency", "Amount" ];
			},
			getMeasures : function() {
				return [ "Amount" ];
			},
			getDimensionsProperties : function() {
				return [ "AirlineCode" ];
			},
			getDefaultLabel : function(entityTypeMetadata, oText) {
				return oText;
			},
			getEntityTypeMetadataAsPromise : function() {
				var deferred = jQuery.Deferred();
				deferred.resolve();
				return deferred.promise();
			}
		};
		var oRepresentationTypeHandlerStub = {
			getConstructorOfRepresentationType : function(oRepType) {
				return sRepresentationType;
			}
		};
		var oParentStep = bHasNoLongTitle ? oModelerInstance.unsavedStepWithFilterMapping : oModelerInstance.unsavedStepWithoutFilterMapping;
		oView = new sap.ui.view({
			viewName : "sap.apf.modeler.ui.view.previewContent",
			type : sap.ui.core.mvc.ViewType.XML,
			controller : oPreviewContentController,
			viewData : {
				oParentStep : oParentStep,
				oRepresentation : oRepresentation,
				oConfigurationHandler : oModelerInstance.configurationHandler,
				oCoreApi : oModelerInstance.modelerCore,
				oRepresentationHandler : oRepresentationHandlerStub,
				oStepPropertyMetadataHandler : oStepPropertyMetadataTypeHandlerStub,
				oRepresentationTypeHandler : oRepresentationTypeHandlerStub
			}
		});
		assert.strictEqual(spyOnInit.calledOnce, true, "then preview onInit function is called and view is initialized");
		return oView;
	}
	QUnit.module("Given a Column Chart", {
		beforeEach : function(assert) {
			sinon.config = {
					useFakeTimers : false
			}; //because of setTimout usage in dialog.close()
			var oRepresentationHandlerStub = {
				getActualLegends : function() {
					return {
						sContext : "legend",
						sProperty : "None"
					};
				},
				getActualDimensions : function() {
					return {
						sContext : "xAxis",
						sProperty : "AirlineCode",
						concat : function(oPropLegend) {
							return [ {
								sContext : "xAxis",
								sProperty : "AirlineCode"
							}, oPropLegend ];
						}
					};
				},
				getActualMeasures : function() {
					return [ {
						sContext : "yAxis",
						sProperty : "Amount"
					} ];
				}
			};
			var done = assert.async();
			sap.apf.testhelper.modelerUIHelper.getModelerInstance(function(modelerInstance) {
				oModelerInstance = modelerInstance;
				oPreviewContentView = _instantiateView("sap.apf.ui.representations.columnChart", oRepresentationHandlerStub, false, assert);
				done();
			});
		},
		afterEach : function() {
			oRepresentation.getOrderbySpecifications.restore();
			oRepresentation.getRepresentationType.restore();
			oPreviewContentView.destroy();
		}
	});
	QUnit.test("when content preview is requested", function(assert) {
		//arrangement
		var oMainChart = oPreviewContentView.byId("idMainChart");
		var oThumbnailChart = oPreviewContentView.byId("idThumbnailChartLayout");
		var sChartType = oMainChart.getItems()[0].getVizType();
		// Check dimensions and measures.
		var aDimensions = oMainChart.getItems()[0].getDataset().getDimensions();
		var aMeasures = oMainChart.getItems()[0].getDataset().getMeasures();
		var columnChartCode = "column";
		var sChartTypeThumbnail = oThumbnailChart.getItems()[0].getContent()[0].getVizType();
		var aDimensionNames = aDimensions.map(function(oDimension) {
			return oDimension.getName();
		});
		var aMeasureNames = aMeasures.map(function(oMeasure) {
			return oMeasure.getName();
		});
		//assert
		assert.ok(oPreviewContentView.byId("idPreviewContentDialog"), "preview content dialog exist");
		assert.strictEqual(oPreviewContentView.byId("idPreviewContentDialog").isOpen(), true, "then preview content dialog is open");
		assert.ok(oMainChart.getItems()[0] instanceof sap.viz.ui5.controls.VizFrame, "then main chart is drawn on main chart holder.");
		assert.strictEqual(sChartType, columnChartCode, "and main chart is a column chart");
		assert.ok(oThumbnailChart.getItems()[0].getContent()[0] instanceof sap.viz.ui5.controls.VizFrame, " then thumbnail chart is drawn on thumbnail chart holder.");
		assert.strictEqual(sChartTypeThumbnail, columnChartCode, "then thumbnail chart is a column chart");
		assert.strictEqual(aDimensions.length, 1, " then one Dimensions are present in the chart.");
		assert.strictEqual(aMeasures.length, 1, "then one Measure is present in the chart.");
		//assert
		assert.strictEqual(aDimensionNames[0].toString(), "AirlineCode", "then AirlineCode available as dimensions.");
		assert.strictEqual(aMeasureNames[0].toString(), "Amount", "then Amount available as measure.");
		assert.strictEqual(oPreviewContentView.byId("idStepTitleText").getText(), "step A", " then step title is displayed in the preview content ");
		assert.strictEqual(oPreviewContentView.byId("idLeftUpperCornerText").getText(), "Left top corner from rep", "then left Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightUpperCornerText").getText(), "Right top corner from rep", " then right Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idLeftLowerCornerText").getText(), "Left bottom corner from rep", "then left Lower Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightLowerCornerText").getText(), "Right bottom corner", "then right Lower Corner Text is set properly.");
	});
	QUnit.test("when random sample data is generated and sorted ", function(assert) {
		//arrangement
		var oMainChart = oPreviewContentView.byId("idMainChart");
		var aData = oMainChart.getItems()[0].getModel().getData().data;
		// Check sort property
		var nCurrentMaxValue = 10000;
		var bIsSorted = aData.reduce(function(prev, current) {
			var bSortedTillNow = prev && (nCurrentMaxValue >= current.Amount);
			nCurrentMaxValue = current.Amount;
			return bSortedTillNow;
		}, true);
		//assert
		assert.strictEqual(aData.length, 3, "then chart has 3 data rows.");
		assert.strictEqual(bIsSorted, true, "then data presented is sorted in descending order");
	});
	QUnit.test("Close with close button", function(assert) {
		var done = assert.async();
		var previewDialog = oPreviewContentView.byId("idPreviewContentDialog");
		var closeButton = previewDialog.getEndButton();
		previewDialog.attachAfterClose(function(){
			assert.strictEqual(oPreviewContentView.bIsDestroyed, true, "View is destroyed");
			assert.strictEqual(previewDialog.bIsDestroyed, true, "Dialog is destroyed");
			done();
		});
		closeButton.firePress();
	});
	QUnit.test("Close with escape button", function(assert) {
		var done = assert.async();
		var previewDialog = oPreviewContentView.byId("idPreviewContentDialog");
		previewDialog.attachAfterClose(function(){
			assert.strictEqual(oPreviewContentView.bIsDestroyed, true, "View is destroyed");
			assert.strictEqual(previewDialog.bIsDestroyed, true, "Dialog is destroyed");
			done();
		});
		previewDialog.close();
	});
	QUnit.module("Given a Column Chart with no assigned dimension properties", {
		beforeEach : function(assert) {
			var oRepresentationHandlerStub = {
				getActualLegends : function() {
					return {
						sContext : "legend",
						sProperty : "None"
					};
				},
				getActualDimensions : function() {
					return {
						sContext : "xAxis",
						sProperty : "",
						concat : function(oPropLegend) {
							return [ {
								sContext : "xAxis",
								sProperty : ""
							}, oPropLegend ];
						}
					};
				},
				getActualMeasures : function() {
					return [ {
						sContext : "yAxis",
						sProperty : "Amount"
					} ];
				}
			};
			var done = assert.async();
			sap.apf.testhelper.modelerUIHelper.getModelerInstance(function(modelerInstance) {
				oModelerInstance = modelerInstance;
				oPreviewContentView = _instantiateView("sap.apf.ui.representations.columnChart", oRepresentationHandlerStub, false, assert);
				done();
			});
		},
		afterEach : function() {
			oRepresentation.getOrderbySpecifications.restore();
			oRepresentation.getRepresentationType.restore();
			oPreviewContentView.destroy();
		}
	});
	QUnit.test("when content preview is requested", function(assert) {
		//arrangement
		var oMainChart = oPreviewContentView.byId("idMainChart");
		var oThumbnailChart = oPreviewContentView.byId("idThumbnailChartLayout");
		var sChartType = oMainChart.getItems()[0].getVizType();
		// Check dimensions and measures.
		var aDimensions = oMainChart.getItems()[0].getDataset().getDimensions();
		var aMeasures = oMainChart.getItems()[0].getDataset().getMeasures();
		var columnChartCode = "column";
		var sChartTypeThumbnail = oThumbnailChart.getItems()[0].getContent()[0].getVizType();
		var aDimensionNames = aDimensions.map(function(oDimension) {
			return oDimension.getName();
		});
		var aMeasureNames = aMeasures.map(function(oMeasure) {
			return oMeasure.getName();
		});
		//assert
		assert.ok(oPreviewContentView.byId("idPreviewContentDialog"), "preview content dialog exist");
		assert.strictEqual(oPreviewContentView.byId("idPreviewContentDialog").isOpen(), true, "then preview content dialog is open");
		assert.ok(oMainChart.getItems()[0] instanceof sap.viz.ui5.controls.VizFrame, "then main chart is drawn on main chart holder.");
		assert.strictEqual(sChartType, columnChartCode, "and main chart is a column chart");
		assert.ok(oThumbnailChart.getItems()[0].getContent()[0] instanceof sap.viz.ui5.controls.VizFrame, " then thumbnail chart is drawn on thumbnail chart holder.");
		assert.strictEqual(sChartTypeThumbnail, columnChartCode, "then thumbnail chart is a column chart");
		assert.strictEqual(aDimensions.length, 0, " then no Dimensions are present in the chart.");
		assert.strictEqual(aMeasures.length, 1, "then one Measure is present in the chart.");
		//assert
		assert.strictEqual(aDimensionNames.toString(), "", "then an emptyString is available as dimension.");
		assert.strictEqual(aMeasureNames.toString(), "Amount", "then Amount available as measure.");
		assert.strictEqual(oPreviewContentView.byId("idStepTitleText").getText(), "step A", " then step title is displayed in the preview content ");
		assert.strictEqual(oPreviewContentView.byId("idLeftUpperCornerText").getText(), "Left top corner from rep", "then left Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightUpperCornerText").getText(), "Right top corner from rep", " then right Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idLeftLowerCornerText").getText(), "Left bottom corner from rep", "then left Lower Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightLowerCornerText").getText(), "Right bottom corner", "then right Lower Corner Text is set properly.");
	});
	QUnit.module("Given a Column Chart with no assigned measure properties", {
		beforeEach : function(assert) {
			var oRepresentationHandlerStub = {
				getActualLegends : function() {
					return {
						sContext : "legend",
						sProperty : "None"
					};
				},
				getActualDimensions : function() {
					return {
						sContext : "xAxis",
						sProperty : "AirlineCode",
						concat : function(oPropLegend) {
							return [ {
								sContext : "xAxis",
								sProperty : "AirlineCode"
							}, oPropLegend ];
						}
					};
				},
				getActualMeasures : function() {
					return [ {
						sContext : "yAxis",
						sProperty : ""
					} ];
				}
			};
			var done = assert.async();
			sap.apf.testhelper.modelerUIHelper.getModelerInstance(function(modelerInstance) {
				oModelerInstance = modelerInstance;
				oPreviewContentView = _instantiateView("sap.apf.ui.representations.columnChart", oRepresentationHandlerStub, false, assert);
				done();
			});
		},
		afterEach : function() {
			oRepresentation.getOrderbySpecifications.restore();
			oRepresentation.getRepresentationType.restore();
			oPreviewContentView.destroy();
		}
	});
	QUnit.test("when content preview is requested", function(assert) {
		//arrangement
		var oMainChart = oPreviewContentView.byId("idMainChart");
		var oThumbnailChart = oPreviewContentView.byId("idThumbnailChartLayout");
		var sChartType = oMainChart.getItems()[0].getVizType();
		// Check dimensions and measures.
		var aDimensions = oMainChart.getItems()[0].getDataset().getDimensions();
		var aMeasures = oMainChart.getItems()[0].getDataset().getMeasures();
		var columnChartCode = "column";
		var sChartTypeThumbnail = oThumbnailChart.getItems()[0].getContent()[0].getVizType();
		var aDimensionNames = aDimensions.map(function(oDimension) {
			return oDimension.getName();
		});
		var aMeasureNames = aMeasures.map(function(oMeasure) {
			return oMeasure.getName();
		});
		//assert
		assert.ok(oPreviewContentView.byId("idPreviewContentDialog"), "preview content dialog exist");
		assert.strictEqual(oPreviewContentView.byId("idPreviewContentDialog").isOpen(), true, "then preview content dialog is open");
		assert.ok(oMainChart.getItems()[0] instanceof sap.viz.ui5.controls.VizFrame, "then main chart is drawn on main chart holder.");
		assert.strictEqual(sChartType, columnChartCode, "and main chart is a column chart");
		assert.ok(oThumbnailChart.getItems()[0].getContent()[0] instanceof sap.viz.ui5.controls.VizFrame, " then thumbnail chart is drawn on thumbnail chart holder.");
		assert.strictEqual(sChartTypeThumbnail, columnChartCode, "then thumbnail chart is a column chart");
		assert.strictEqual(aDimensions.length, 1, " then one Dimension is present in the chart.");
		assert.strictEqual(aMeasures.length, 0, "then no Measures are present in the chart.");
		//assert
		assert.strictEqual(aDimensionNames.toString(), "AirlineCode", "then AirlineCode available as dimensions.");
		assert.strictEqual(aMeasureNames.toString(), "", "then emptyString is available as measure.");
		assert.strictEqual(oPreviewContentView.byId("idStepTitleText").getText(), "step A", " then step title is displayed in the preview content ");
		assert.strictEqual(oPreviewContentView.byId("idLeftUpperCornerText").getText(), "Left top corner from rep", "then left Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightUpperCornerText").getText(), "Right top corner from rep", " then right Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idLeftLowerCornerText").getText(), "Left bottom corner from rep", "then left Lower Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightLowerCornerText").getText(), "Right bottom corner", "then right Lower Corner Text is set properly.");
	});
	QUnit.module("Given a Table Representation", {
		beforeEach : function(assert) {
			var oRepresentationHandlerStub = {
				getActualProperties : function() {
					return [ {
						sContext : "column",
						sProperty : "AirlineCode"
					} ,{
						sContext : "column",
						sProperty : "Amount"
					} ];
				}
			};
			var done = assert.async();
			sap.apf.testhelper.modelerUIHelper.getModelerInstance(function(modelerInstance) {
				oModelerInstance = modelerInstance;
				oPreviewContentView = _instantiateView("sap.apf.ui.representations.table", oRepresentationHandlerStub, true, assert);
				done();
			});
		},
		afterEach : function() {
			oRepresentation.getOrderbySpecifications.restore();
			oRepresentation.getRepresentationType.restore();
			oPreviewContentView.destroy();
		}
	});
	QUnit.test("when content preview is requested", function(assert) {
		//arrangement
		var oThumbnailChart = oPreviewContentView.byId("idThumbnailChartLayout");
		var vBoxAroundTable = oPreviewContentView.byId("idMainChart").getItems()[0];
		var oTable = vBoxAroundTable.getItems()[0];
		// Check properties of the table.
		var aProperties = oTable.getColumns();
		var aPropertyNames = oTable.getColumns().map(function(oColumn) {
			return oColumn.getLabel().getText();
		});
		var titleControl = oTable.getTitle();
		//assert
		assert.strictEqual(vBoxAroundTable.getHeight(), "330px", "Height correctly set to Vbox which is around the table");
		assert.strictEqual(oTable.getWidth(), "480px", "Width correctly set to table");
		assert.strictEqual(titleControl.getItems().length, 1, "TitleControl has 1 item");
		assert.strictEqual(titleControl.getItems()[0].getText(), "step A long title", "TitleControl has long title text as only item");
		assert.strictEqual(oTable.getColumns()[0].getMinWidth(), 125, "MinWidth set to 125 for table preview");
		assert.ok(oPreviewContentView.byId("idPreviewContentDialog"), "preview content dialog exist");
		assert.strictEqual(oPreviewContentView.byId("idPreviewContentDialog").isOpen(), true, "then preview content dialog is open");
		assert.strictEqual(oThumbnailChart.getItems()[0].getSrc(), "sap-icon://table-chart", "then table icon is drawn on thumbnail chart holder.");
		assert.strictEqual(aProperties.length, 2, "then two columns are present in the table");
		assert.strictEqual(aPropertyNames.toString(), "AirlineCode,Amount", "then AirlineCode,Amount are available as properties for table");
		assert.strictEqual(oPreviewContentView.byId("idStepTitleText").getText(), "step A", " then step title is displayed in the preview content ");
		assert.strictEqual(oPreviewContentView.byId("idLeftUpperCornerText").getText(), "Left top corner from rep", "then left Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightUpperCornerText").getText(), "Right top corner from rep", "then right Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idLeftLowerCornerText").getText(), "Left bottom corner from rep", "then left Lower Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightLowerCornerText").getText(), "Right bottom corner", " then right Lower Corner Text is set properly.");
	});
	QUnit.test("when random sample data is generated and sorted ", function(assert) {
		//arrangement
		var oTable = oPreviewContentView.byId("idMainChart").getItems()[0].getItems()[0];
		var aData = oTable.getModel().getData().tableData;
		// Check sort property
		var nCurrentMinValue = "Amount - 0";
		var bIsSorted = aData.reduce(function(prev, current) {
			var bSortedTillNow = prev && (nCurrentMinValue <= current.Amount);
			nCurrentMinValue = current.Amount;
			return bSortedTillNow;
		}, true);
		//assert
		assert.strictEqual(aData.length, 7, "then table has 7 data rows.");
		assert.strictEqual(bIsSorted, true, "then data presented is sorted in ascending order");
	});
	QUnit.module("Preview Content Tests for step with no long title", {
		beforeEach : function(assert) {
			var oRepresentationHandlerStub = {
				getActualLegends : function() {
					return {
						sContext : "legend",
						sProperty : "None"
					};
				},
				getActualDimensions : function() {
					return {
						sContext : "xAxis",
						sProperty : "AirlineCode",
						concat : function(oPropLegend) {
							return [ {
								sContext : "xAxis",
								sProperty : "AirlineCode"
							}, oPropLegend ];
						}
					};
				},
				getActualMeasures : function() {
					return [ {
						sContext : "yAxis",
						sProperty : "Amount"
					} ];
				}
			};
			var done = assert.async();
			sap.apf.testhelper.modelerUIHelper.getModelerInstance(function(modelerInstance) {
				oModelerInstance = modelerInstance;
				oPreviewContentView = _instantiateView("sap.apf.ui.representations.columnChart", oRepresentationHandlerStub, false, assert, true);
				done();
			});
		},
		afterEach : function() {
			oRepresentation.getOrderbySpecifications.restore();
			oRepresentation.getRepresentationType.restore();
			oPreviewContentView.destroy();
		}
	});
	QUnit.test("when the step does not have a long title ", function(assert) {
		//assert
		assert.strictEqual(oPreviewContentView.byId("idStepTitleText").getText(), "step B", " step Title is taken from the title");
	});
	QUnit.module("Preview Content Tests for step with long title as null", {
		beforeEach : function(assert) {
			var oRepresentationHandlerStub = {
				getActualLegends : function() {
					return {
						sContext : "legend",
						sProperty : "None"
					};
				},
				getActualDimensions : function() {
					return {
						sContext : "xAxis",
						sProperty : "AirlineCode",
						concat : function(oPropLegend) {
							return [ {
								sContext : "xAxis",
								sProperty : "AirlineCode"
							}, oPropLegend ];
						}
					};
				},
				getActualMeasures : function() {
					return [ {
						sContext : "yAxis",
						sProperty : "Amount"
					} ];
				}
			};
			var done = assert.async();
			sap.apf.testhelper.modelerUIHelper.getModelerInstance(function(modelerInstance) {
				oModelerInstance = modelerInstance;
				sinon.stub(oModelerInstance.configurationHandler.getTextPool(), "isInitialTextKey", function(oStepLongTitle) {
					return true;
				});
				oPreviewContentView = _instantiateView("sap.apf.ui.representations.columnChart", oRepresentationHandlerStub, false, assert, false);
				done();
			});
		},
		afterEach : function() {
			oRepresentation.getOrderbySpecifications.restore();
			oRepresentation.getRepresentationType.restore();
			oModelerInstance.configurationHandler.getTextPool().isInitialTextKey.restore();
			oPreviewContentView.destroy();
		}
	});
	QUnit.test("when the step has a long title with null value", function(assert) {
		//arrangement
		var oMainChart = oPreviewContentView.byId("idMainChart");
		var oThumbnailChart = oPreviewContentView.byId("idThumbnailChartLayout");
		var sChartType = oMainChart.getItems()[0].getVizType();
		// Check dimensions and measures.
		var aDimensions = oMainChart.getItems()[0].getDataset().getDimensions();
		var aMeasures = oMainChart.getItems()[0].getDataset().getMeasures();
		var columnChartCode = "column";
		var sChartTypeThumbnail = oThumbnailChart.getItems()[0].getContent()[0].getVizType();
		var aDimensionNames = aDimensions.map(function(oDimension) {
			return oDimension.getName();
		});
		var aMeasureNames = aMeasures.map(function(oMeasure) {
			return oMeasure.getName();
		});
		//assert
		assert.ok(oPreviewContentView.byId("idPreviewContentDialog"), "preview content dialog exist");
		assert.strictEqual(oPreviewContentView.byId("idPreviewContentDialog").isOpen(), true, "then preview content dialog is open");
		assert.ok(oMainChart.getItems()[0] instanceof sap.viz.ui5.controls.VizFrame, "then main chart is drawn on main chart holder.");
		assert.strictEqual(sChartType, columnChartCode, "and main chart is a column chart");
		assert.ok(oThumbnailChart.getItems()[0].getContent()[0] instanceof sap.viz.ui5.controls.VizFrame, " then thumbnail chart is drawn on thumbnail chart holder.");
		assert.strictEqual(sChartTypeThumbnail, columnChartCode, "then thumbnail chart is a column chart");
		assert.strictEqual(aDimensions.length, 1, " then one Dimensions are present in the chart.");
		assert.strictEqual(aMeasures.length, 1, "then one Measure is present in the chart.");
		//assert
		assert.strictEqual(aDimensionNames.toString(), "AirlineCode", "then AirlineCode available as dimensions.");
		assert.strictEqual(aMeasureNames.toString(), "Amount", "then Amount available as measure.");
		assert.strictEqual(oPreviewContentView.byId("idStepTitleText").getText(), "step A", " step Title is taken from the title");
		assert.strictEqual(oPreviewContentView.byId("idLeftUpperCornerText").getText(), "Left top corner from rep", "then left Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightUpperCornerText").getText(), "Right top corner from rep", " then right Upper Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idLeftLowerCornerText").getText(), "Left bottom corner from rep", "then left Lower Corner Text is set properly.");
		assert.strictEqual(oPreviewContentView.byId("idRightLowerCornerText").getText(), "Right bottom corner", "then right Lower Corner Text is set properly.");
	});
	QUnit.module("Instantiation of PreviewContent", {
		beforeEach : function() {
			var that = this;
			var representationHandler = {
				getActualDimensions : function(){
					return ["AirlineCode"];
				},
				getActualMeasures : function(){
					return [{
						sContext : "yAxis",
						sProperty : "Amount"
					},{
						sContext: "yAxis2",
						sProperty: "Revenue"
					}];
				},
				getActualLegends : function(){
					return [];
				},
				getActualProperties : function(){
					return [];
				}
			};
			var stepPropertyMetadataHandler = {
				getProperties : function() {
					return ["ID"];
				},
				getMeasures : function() {
					return ["Amount", "Revenue"];
				},
				getDimensionsProperties : function() {
					return ["AirlineCode"];
				},
				getDefaultLabel : function(entityTypeMetadata, oText) {
					return oText;
				},
				getEntityTypeMetadataAsPromise : function() {
					var deferred = jQuery.Deferred();
					deferred.resolve();
					return deferred.promise();
				}
			};
			this.oViewData = {
				oCoreApi : {
					getText : function(key){
						return key;
					}
				},
				oRepresentation : {
					getRepresentationType : function(){
						return that.representationType;
					},
					getDimensionTextLabelKey : function(property){
						return property;
					},
					getMeasureTextLabelKey : function(property){
						return property;
					},
					getOrderbySpecifications : function(){
						return [];
					},
					getLeftUpperCornerTextKey : function(){
						return "leftUpper";
					},
					getLeftLowerCornerTextKey : function(){
						return "leftLower";
					},
					getRightUpperCornerTextKey : function(){
						return "rightUpper";
					},
					getRightLowerCornerTextKey : function(){
						return "rightLower";
					},
					getMeasureDisplayOption : function(property){
						if (property === "Revenue") {
							return "bar";
						}
						return "line";
					}
				},
				oRepresentationTypeHandler : new RepresentationTypesHandler(),
				oStepPropertyMetadataHandler : stepPropertyMetadataHandler,
				oRepresentationHandler : representationHandler,
				oParentStep : {
					getLongTitleId : function(){
						return "longTitle";
					},
					getTitleId : function(){
						return "title";
					}
				},
				oConfigurationHandler : {
					getTextPool : function(){
						return {
							isInitialTextKey  : function(){
								return false;
							},
							get : function(key){
								return {
									TextElementDescription : key
								};
							}
						};
					}
				}
			};
		}
	});
	QUnit.test("For all representations", function(assert) {
		var done = assert.async();
		var that = this;
		var promises = [];
		representationTypes().forEach(function(representationType){
			if(representationType.id !== "TreeTableRepresentation"){ //TreeTable has no preview
				promises.push(new Promise(function(resolve){
					that.representationType = representationType.id;
					sap.ui.view({
						viewName : "sap.apf.modeler.ui.view.previewContent",
						type : sap.ui.core.mvc.ViewType.XML,
						viewData : that.oViewData
					}).loaded().then(function(oView){
						assert.ok(true, "PreviewContent successfully created for " + representationType.id);
						oView.destroy();
						resolve();
					});
				}));
			}
		});
		Promise.all(promises).then(function(){
			done();
		});
	});
	QUnit.test("Combination Chart with MeasureOptions", function(assert) {
		var done = assert.async();
		var that = this;
		that.representationType = "DualCombinationChart";
		sap.ui.view({
			viewName : "sap.apf.modeler.ui.view.previewContent",
			type : sap.ui.core.mvc.ViewType.XML,
			viewData : that.oViewData
		}).loaded().then(function(oView){
			assert.ok(true, "PreviewContent successfully created");
			var expectedDataShape = {
				primaryAxis : ["line"],
				secondaryAxis : ["bar"]
			};
			var vizFrame = oView.byId("idMainChart").getItems()[0];
			var dataShapeVizProperties = vizFrame.getVizProperties().plotArea.dataShape;
			assert.deepEqual(dataShapeVizProperties, expectedDataShape, "MeasureOptions are handed over to the vizframe");
			var thumbnailVizFrame = oView.byId("idThumbnailChartLayout").getItems()[0].getContent()[0];
			var thumbnailDataShapeVizProperties = thumbnailVizFrame.getVizProperties().plotArea.dataShape;
			assert.deepEqual(thumbnailDataShapeVizProperties, expectedDataShape, "MeasureOptions are handed over to the thumbnail vizframe");

			oView.destroy();
			done();
		});
	});
});
