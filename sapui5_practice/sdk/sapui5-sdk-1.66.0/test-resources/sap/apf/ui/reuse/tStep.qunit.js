jQuery.sap.registerModulePath('sap.apf.testhelper', '../../testhelper');
jQuery.sap.registerModulePath('sap.apf.integration', '../../integration');
jQuery.sap.require('sap.apf.ui.instance');
jQuery.sap.require('sap.apf.testhelper.config.sampleConfiguration');
jQuery.sap.require('sap.apf.testhelper.odata.sampleServiceData');
jQuery.sap.require('sap.apf.testhelper.doubles.UiInstance');
jQuery.sap.require('sap.apf.testhelper.doubles.createUiApiAsPromise');
jQuery.sap.require('sap.apf.testhelper.doubles.request');
jQuery.sap.require('sap.apf.testhelper.doubles.metadata');
jQuery.sap.require('sap.apf.testhelper.doubles.Representation');
jQuery.sap.require('sap.apf.testhelper.helper');
jQuery.sap.require('sap.apf.testhelper.stub.ajaxStub');
jQuery.sap.require('sap.apf.testhelper.doubles.navigationHandler');
(function() {
	'use strict';
	var oStepView;
	function doNothing() {
	}
	function parameterStub() {
		return {
			requiredFilters : [ {
				label : "Customer"
			} ],
			dimensions : [ {
				fieldName : "FirstDimension",
				fieldDesc : {
					type : "label",
					kind : "text",
					key : "FirstDimensionKey"
				}
			} ],
			alternateRepresentationType : function() {
				return {
					constructor : "sap.apf.ui.representations.table"
				};
			}
		};
	}
	function getSelectedRepresentationStub() {
		return {
			type : "lineChart",
			getMainContent : function() {
				return {
					addEventDelegate : doNothing,
					setHeight : doNothing,
					setWidth : doNothing
				};
			},
			getAlternateRepresentation : "sap-icon://table-chart",
			bIsAlternateView : true,
			getParameter : parameterStub,
			getData : doNothing,
			setData : doNothing,
			getMetaData : function() {
				return "dummy meta data";
			},
			toggleInstance : {
				viewSettingsDialog : function() {
					return {
						open : doNothing
					};
				},
				getMainContent : function() {
					var obj = {};
					obj.addEventDelegate = function() {
						doNothing();
					};
					obj.getContent = function() {
						var arr = [];
						var obj1 = {};
						obj1.setHeight = function() {
							doNothing();
						};
						obj1.setWidth = function() {
							doNothing();
						};
						arr.push(obj1);
						return arr;
					};
					return obj;
				},
				setData : doNothing,
				getThumbnailContent : function() {
					return new sap.m.Button({
						text : "X",
						tooltip : "Button tooltip"
					});
				}
			}
		};
	}
	function getLayoutViewStub() {
		var layout = new sap.ui.layout.VerticalLayout();
		layout.getController = getLayoutControllerStub;
		return layout;
	}
	function getLayoutControllerStub() {
		return {
			setFilter : setFilterStub,
			setMasterTitle : doNothing,
			setDetailTitle : doNothing,
			setMasterHeaderButton : doNothing,
			addMasterFooterContentLeft : doNothing,
			detailTitleRemoveAllContent : doNothing,
			enableDisableOpenIn : doNothing
		};
	}
	function setFilterStub(param) {
		return param;
	}
	QUnit.module("Step", {
		beforeEach : function(assert) {
			var that = this;
			sap.apf.testhelper.stub.stubJQueryAjax();
			sap.apf.core.Request = sap.apf.testhelper.doubles.Request;
			var done = assert.async();
			var inject = {
					constructors : {
						NavigationHandler :	sap.apf.testhelper.doubles.NavigationHandler,
						Metadata : sap.apf.testhelper.doubles.Metadata
					}
			};
			sap.apf.testhelper.doubles.createUiApiAsPromise(undefined, undefined, inject).done(function(api){
				that.oGlobalApi = api;
				var oCarouselView = that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel();
				var oCarouselController = oCarouselView.oController;
				sinon.stub(that.oGlobalApi.oUiApi, "getLayoutView", getLayoutViewStub);
				//Slice the initial step
				var stepTemplates = that.oGlobalApi.oCoreApi.getStepTemplates();
				stepTemplates.pop(5);
				that.oGlobalApi.oCoreApi.getStepTemplates = function() {
					return stepTemplates;
				};
				that.oGlobalApi.oCoreApi.createStep(that.oGlobalApi.oCoreApi.getStepTemplates()[2].id, doNothing,
					that.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo().representationId);
				var step = that.oGlobalApi.oCoreApi.getSteps()[0];
				that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().oViewData = that.oGlobalApi;
				oCarouselController.addStep(step);
				oStepView = that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().getView().stepViews[0];
				done();
			});


		},
		afterEach : function() {
			this.oGlobalApi.oUiApi.getLayoutView.restore();
			this.oGlobalApi.oCompContainer.destroy();
			jQuery.ajax.restore();
		}
	});
	QUnit.test("When loading Step View", function(assert) {
		//arrangement
		var spyStepView = sinon.spy(oStepView, 'onAfterRendering');
		var spyCarousel = sinon.spy(oStepView.getController().oUiApi.getAnalysisPath(), 'getCarousel');
		//action
		oStepView.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		//assert
		assert.strictEqual(spyStepView.calledOnce,true, "Then the View get rendered successfully");
		assert.strictEqual(spyCarousel.calledOnce,true, "Then the carousel is available");
		assert.strictEqual(oStepView.hasStyleClass("sapUiSizeCompact"),true, "Then the style class is added");
	});
	QUnit.test("When calling setActiveStep", function(assert) {
		//arrangement
		this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[2].id, doNothing, this.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo().representationId);
		var oStepController = oStepView.getController();
		sinon.stub(this.oGlobalApi.oUiApi.getAnalysisPath().getController(), 'drawMainChart', doNothing);
		this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[1] = {
			toggleActiveStep : function() {
				return null;
			}
		};
		//action
		oStepController.setActiveStep(1);
		//assert
		assert.strictEqual(this.oGlobalApi.oCoreApi.getSteps().indexOf(this.oGlobalApi.oCoreApi.getActiveStep()), 1, "Active Step is set");
		assert.strictEqual(oStepView.hasStyleClass("sapUiSizeCompact"),true, "Then the style class is added");
		//Restore
		this.oGlobalApi.oUiApi.getAnalysisPath().getController().drawMainChart.restore();
	});
	QUnit.test("When calling Draw Thumbnail Content without alternate view", function(assert) {
		//arrangement
		var oStepController = oStepView.getController();
		//action
		oStepController.drawThumbnailContent(true);
		var oThumbnaliChartLayout = oStepView.oThumbnailChartLayout.getItems();
		//assert
		assert.strictEqual(oThumbnaliChartLayout.length, 2, "Then Thumbnail is drwan");
		assert.strictEqual(oThumbnaliChartLayout[0] instanceof sap.m.VBox, true, "Then char layout is added to thumbnail");
		assert.strictEqual(oStepView.oStepTitle.getWrapping(), true, "Wrapping for stepTitle in thumbnail is set to true");
		assert.strictEqual(oStepView.oStepTitle.getMaxLines(), 3, "Max lines for stepTitle in thumbnail is limited to 3 lines");
	});
	QUnit.test("When Draw Thumbnail Content with alternate view", function(assert) {
		//arrangement
		sinon.stub(oStepView.getController().oCoreApi.getSteps()[0], 'getSelectedRepresentation', getSelectedRepresentationStub);
		var oStepController = oStepView.getController();
		oStepView.getController().representationInstance = "columnChart";
		var oToggleThumbnail = oStepView.getController().oCoreApi.getSteps()[0].getSelectedRepresentation().toggleInstance.getThumbnailContent();
		//action
		oStepController.drawThumbnailContent(true);
		var oThumbnaliChartLayout = oStepView.oThumbnailChartLayout.getItems();
		//assert
		assert.strictEqual(oThumbnaliChartLayout.length, 2, "Then Thumbnail is drwan");
		assert.notStrictEqual(oThumbnaliChartLayout[0], oToggleThumbnail, "Then Thumbnail is drwan for alternate view");
		//cleanup
		oStepView.getController().oCoreApi.getSteps()[0].getSelectedRepresentation.restore();
	});
}());
