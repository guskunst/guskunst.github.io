/*
 * Copyright (C) 2009-2019 SAP AG or an SAP affiliate company. All rights reserved
 */
sap.ui.define([
	'sap/apf/testhelper/helper',
	'sap/apf/testhelper/doubles/sessionHandlerStubbedAjax',
	'sap/apf/testhelper/stub/textResourceHandlerStub',
	'sap/apf/testhelper/stub/ajaxStub',
	'sap/apf/testhelper/doubles/metadata',
	'sap/apf/testhelper/doubles/request',
	'sap/apf/testhelper/doubles/navigationHandler',
	'sap/apf/testhelper/doubles/createUiApiAsPromise'
	], function(Helper, SessionHandlerStubbedAjax, TextResourceHandlerStub, AjaxStub,
				Metadata, Request, NavigationHandler, createUiApiAsPromise) {
	"use strict";

	function doNothing() {
	}
	QUnit.module("Carousel qUnit", {
		beforeEach : function(assert) {
			var done = assert.async();
			TextResourceHandlerStub.setup(this);
			AjaxStub.stubJQueryAjax();
			var inject = {
					constructors : {
						Metadata : Metadata,
						Request : Request,
						NavigationHandler : NavigationHandler,
						SessionHandler : SessionHandlerStubbedAjax
					}
			};

			createUiApiAsPromise("comp", undefined, inject).done(function(api){
				this.oGlobalApi = api;
				this.oCarouselView = this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel();
				this.oCarouselController = this.oCarouselView.oController;
				this.getLayoutViewStub = function() {
					this.layout = new sap.ui.layout.VerticalLayout();
					this.layout.getController = function() {
						this.setFilter = function(param) {
							return param;
						};
						this.setMasterTitle = function() {
							return null;
						};
						this.setDetailTitle = function() {
							return null;
						};
						this.setMasterHeaderButton = function() {
							return null;
						};
						this.addMasterFooterContentLeft = function() {
							return null;
						};
						this.detailTitleRemoveAllContent = function() {
							return null;
						};
						this.enableDisableOpenIn = function() {
							return null;
						};
						return this;
					};
					return this.layout;
				};
				sinon.stub(this.oGlobalApi.oUiApi, "getLayoutView", this.getLayoutViewStub);
				this.analysisPath = this.oGlobalApi.oUiApi.getAnalysisPath();
				this.analysisPathController = this.analysisPath.getController();
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oGlobalApi.oUiApi.getLayoutView.restore();
			jQuery.ajax.restore();
			TextResourceHandlerStub.teardown();
			this.oGlobalApi.oCompContainer.destroy();
		}
	});
	QUnit.test("Availability of View and Controller Api's", function(assert) {
		//test1: All API's Availability
		assert.ok(typeof this.oCarouselController.moveStep === "function", 'Move Step Available');
		assert.ok(typeof this.oCarouselController.removeStep === "function", 'Delete Step Available');
		assert.ok(typeof this.oCarouselController.addStep === "function", 'Add Step Available');
		assert.ok(typeof this.oCarouselController.getStepData === "function", 'getStepData is Available');
		assert.ok(typeof this.oCarouselController.showStepGallery === "function", 'showStepGallery is Available');
		assert.ok(typeof this.oCarouselController.refreshCarousel === "function", 'refreshCarousel is Available');
		assert.ok(typeof this.oCarouselController.removeAllSteps === "function", 'removeAllSteps is Available');
		assert.ok(typeof this.oCarouselView === "object", "carouselView is available");
	});
	QUnit.test("Availability of Buttons with stable ids", function(assert){
		var carouselView = this.oCarouselView;
		var buttonUp = carouselView.byId("idMoveStepUpButton");
		assert.strictEqual(buttonUp instanceof sap.m.Button, true, "THEN button up can be retrieved via id");
		assert.strictEqual(buttonUp.getIcon(), "sap-icon://arrow-top", "THEN icon of button up as expected");
		var buttonDown = carouselView.byId("idMoveStepDownButton");
		assert.strictEqual(buttonDown instanceof sap.m.Button, true, "THEN button down can be retrieved via id");
		assert.strictEqual(buttonDown.getIcon(), "sap-icon://arrow-bottom", "THEN icon of button up as expected");
	});
	QUnit.test("When no step added", function(assert) {
		this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().oViewData = this.oGlobalApi;
		this.analysisPath.getCarousel().getController().refreshCarousel();
		this.analysisPathController.refresh(0);
		this.oCarouselController.onInit();
		this.oCarouselController.onAfterRendering();
		assert.ok(typeof this.oCarouselView === "object", "Carousel View Exists");
		assert.strictEqual(this.oGlobalApi.oCoreApi.getSteps().length, 0, "then, no steps are available initially");
	});
	QUnit.test("Add Step", function(assert) {
		var oStep1 = this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[2].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo()[0].representationId);
		this.oCarouselController.addStep(oStep1);
		var stepContainer = this.oGlobalApi.oUiApi.getStepContainer();
		assert.ok(typeof this.oCarouselView === "object", "Carousel View Exists");
		assert.ok(typeof stepContainer === "object", "Step container exists");
		assert.strictEqual(this.oGlobalApi.oCoreApi.getSteps().length, 1, "first step added successfully");
		assert.strictEqual(this.oCarouselView.stepViews.length, 1, "First step added to the carousel");
		var stepView = this.oCarouselView.stepViews[0];
		assert.strictEqual(stepView.getModel().getData().title, "localText2", "Correct stepView created");
		assert.strictEqual(stepView.getModel().getData().thumbnail.leftUpper, "localTextReferenceStepTemplate1LeftUpper", "StepView has correct left upper thumbnail");
	});
	QUnit.test("Add Step called with an array", function(assert) {
		var oStep1 = this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[0].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[0].getRepresentationInfo()[0].representationId);
		var oStep2 = this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[1].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[1].getRepresentationInfo()[0].representationId);
		this.oCarouselController.addStep([oStep1, oStep2]);
		assert.strictEqual(this.oGlobalApi.oCoreApi.getSteps().length, 2, "first step added successfully");
		assert.strictEqual(this.oCarouselView.stepViews.length, 2, "Two steps added to the carousel");
		var stepView1 = this.oCarouselView.stepViews[0];
		assert.strictEqual(stepView1.getModel().getData().title, "localText2", "First stepView has correct title");
		assert.strictEqual(stepView1.getModel().getData().thumbnail.leftUpper, "localTextReferenceStepTemplate1LeftUpper", "First stepView has correct left upper thumbnail");
		var stepView2 = this.oCarouselView.stepViews[1];
		assert.strictEqual(stepView2.getModel().getData().title, "localText2", "Second stepView has correct title");
		assert.strictEqual(stepView2.getModel().getData().thumbnail.leftUpper, "localTextReferenceStepTemplate2LeftUpper", "Second stepView has correct left upper thumbnail");
	});
	QUnit.test("Add Step called with an array when one step is already added", function(assert) {
		//preperation
		var oStep1 = this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[0].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[0].getRepresentationInfo()[0].representationId);
		this.oCarouselController.addStep([oStep1]);
		var stepView = this.oCarouselView.stepViews[0];
		assert.strictEqual(stepView.getModel().getData().title, "localText2", "Correct stepView created");
		assert.strictEqual(stepView.getModel().getData().thumbnail.leftUpper, "localTextReferenceStepTemplate1LeftUpper", "StepView has correct left upper thumbnail");
		//doing
		var oStep2 = this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[1].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[1].getRepresentationInfo()[0].representationId);
		this.oCarouselController.addStep([oStep1, oStep2]);
		assert.strictEqual(this.oGlobalApi.oCoreApi.getSteps().length, 2, "first step added successfully");
		assert.strictEqual(this.oCarouselView.stepViews.length, 2, "Two steps added to the carousel");
		var stepView1 = this.oCarouselView.stepViews[0];
		assert.strictEqual(stepView1.getModel().getData().title, "localText2", "First stepView has correct title");
		assert.strictEqual(stepView1.getModel().getData().thumbnail.leftUpper, "localTextReferenceStepTemplate1LeftUpper", "First stepView has correct left upper thumbnail");
		assert.strictEqual(stepView, stepView1, "The stepview previously added is still used");
		var stepView2 = this.oCarouselView.stepViews[1];
		assert.strictEqual(stepView2.getModel().getData().title, "localText2", "Second stepView has correct title");
		assert.strictEqual(stepView2.getModel().getData().thumbnail.leftUpper, "localTextReferenceStepTemplate2LeftUpper", "Second stepView has correct left upper thumbnail");
	});
	QUnit.test("Remove Step", function(assert) {
		this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[2].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo()[0].representationId);
		var step = this.oGlobalApi.oCoreApi.getSteps()[0];
		var chartStub = function() {
			return {
				chart : {
					removeEventDelegate : doNothing
				}
			};
		};
		sinon.stub(step, 'getSelectedRepresentation', chartStub);
		this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().oViewData = this.oGlobalApi;
		this.oCarouselController.addStep(step);
		var stepView = this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().getView().stepViews;
		this.oCarouselController.removeStep(0); //Remove Step
		assert.equal(stepView.length, 0, "Step Removed Successfully");
		step.getSelectedRepresentation.restore();
	});
	QUnit.test("Remove All Step", function(assert) {
		this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[2].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo()[0].representationId);
		var step = this.oGlobalApi.oCoreApi.getSteps()[0];
		var chartStub = function() {
			return {
				chart : {
					removeEventDelegate : doNothing
				}
			};
		};
		sinon.stub(step, 'getSelectedRepresentation', chartStub);
		this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().oViewData = this.oGlobalApi;
		this.oCarouselController.addStep(step);
		var stepView = this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().getView().stepViews;
		this.oCarouselController.removeAllSteps(); //Remove Step
		assert.equal(stepView.length, 0, "All Steps Removed Successfully");
		step.getSelectedRepresentation.restore();
	});
	QUnit.test("Get Step Data", function(assert) {
		this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[2].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo()[0].representationId);
		var step = this.oGlobalApi.oCoreApi.getSteps()[0];
		this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().oViewData = this.oGlobalApi;
		var stepData = this.oCarouselController.getStepData(step);
		assert.equal(stepData.index, 0, "Step Data index exists");
		assert.equal(stepData.thumbnail.leftLower, "localTextReferenceStepTemplate1LeftLower", "Step Data left lower thumbnail exists");
		assert.equal(stepData.thumbnail.leftUpper, "localTextReferenceStepTemplate1LeftUpper", "Step Data left upper thumbnail exists");
		assert.equal(stepData.thumbnail.rightLower, "localTextReferenceStepTemplate1RightLower", "Step Data right lower thumbnail exists");
		assert.equal(stepData.thumbnail.rightUpper, "localTextReferenceStepTemplate1RightUpper", "Step Data right upper thumbnail exists");
		assert.equal(stepData.title, "localText2", "Step Data Title exists");
	});
	QUnit.test("Move Step", function(assert) {
		this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[2].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo()[0].representationId);
		this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[2].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo()[0].representationId);
		var step = this.oGlobalApi.oCoreApi.getSteps()[0];
		this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().oViewData = this.oGlobalApi;
		this.oCarouselController.addStep(step);
		var stepView = this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().getView().stepViews;
		this.analysisPath.getCarousel().getController().refreshCarousel();
		this.analysisPathController.refresh(0);
		var beforeSwap1 = stepView[0].getId();
		this.oCarouselController.moveStep(0, 1);
		assert.notEqual(beforeSwap1, stepView[0].getId(), "Index 1 Step is not equal after move");
		assert.equal(beforeSwap1, stepView[1].getId(), "After move step both the steps are equal successfully");
	});
	QUnit.test("Add First Step", function(assert) {
		var stepTemplates = this.oGlobalApi.oCoreApi.getStepTemplates();
		stepTemplates[0].id = "initial";
		var restoreGetStepTemplates = this.oGlobalApi.oCoreApi.getStepTemplates;
		this.oGlobalApi.oCoreApi.getStepTemplates = function() {
			return stepTemplates;
		};
		this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getController().oViewData = this.oGlobalApi;
		var stepContainer = this.oGlobalApi.oUiApi.getStepContainer();
		this.analysisPath.getCarousel().getController().refreshCarousel();
		this.analysisPathController.refresh(0);
		assert.ok(typeof stepContainer === "object", "First Step Added Successfully");
		//Restore the Stubbed Fn's
		this.oGlobalApi.oCoreApi.getStepTemplates = restoreGetStepTemplates;
	});
	QUnit.test("Carousel View Apis", function(assert) {
		var fnOriginalSwapBlocks = this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().dndBox.swapBlocks;
		this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().dndBox.swapBlocks = function() {
			return true;
		};
		this.oCarouselView.down.firePress();
		//Restore
		this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().dndBox.swapBlocks = fnOriginalSwapBlocks;
		//Api's Availability Check
		assert.ok(typeof this.oCarouselView.getStepGallery === "function", "Get Step Gallery Exists");
		assert.ok(typeof this.oCarouselView.getChartToolbar === "function", "Get Charttoolbar Exists");
		assert.ok(typeof this.oCarouselView.getControllerName === "function", "Get Controller Name Exists");
		assert.ok(typeof this.oCarouselView.getStepView === "function", "Get Step View Exists");
		assert.equal(this.oCarouselView.getChartToolbar(), undefined, "Chart toolbar not loaded");
		assert.ok(typeof this.oCarouselView === "object", "Carousel Content Exists");
		assert.equal(this.oCarouselView.getControllerName(), "sap.apf.ui.reuse.controller.carousel", "Controller Name Exists");
		assert.ok(typeof this.oCarouselView.getStepGallery() === "object", "Step Gallery Exists");
	});
	QUnit.test('When calling destroy function', function(assert) {
		//arrangements
		var stepGalleryController = this.oCarouselView.getStepGallery().getController();
		//action
		this.oCarouselController.apfDestroy();
		//assert
		assert.strictEqual(this.oCarouselView.dndBox, undefined, "Then courosel is destroyed");
		assert.strictEqual(stepGalleryController.oHierchicalSelectDialog, undefined, "Then HierchicalDialog is destroyed");
	});
	QUnit.test("Check that id is set for add analysis step button", function(assert){
		var button = this.oCarouselView.byId("idAddAnalysisStepButton");
		assert.ok(button instanceof sap.m.Button, "THEN button can be accessed by id");
	});
});
