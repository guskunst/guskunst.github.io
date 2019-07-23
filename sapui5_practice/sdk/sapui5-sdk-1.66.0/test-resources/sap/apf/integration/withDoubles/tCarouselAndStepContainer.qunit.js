/*!
* SAP APF Analysis Path Framework
* 
* (c) Copyright 2012-2019 SAP AG. All rights reserved
*/
/*global jQuery, window, sap, jQuery, sinon */

sap.ui.define([
	'sap/apf/testhelper/doubles/metadata',
	'sap/apf/testhelper/doubles/request',
	'sap/apf/testhelper/doubles/navigationHandler',
	'sap/apf/testhelper/doubles/createUiApiAsPromise',
	'sap/ui/thirdparty/sinon'
], function(Metadata, Request, NavigationHandler, createUiApiAsPromise, sinon) {
	'use strict';


	function createTextContent(){
		var element = document.getElementById("stepContainerContent");
		if (!element){
			var div = document.createElement('div');
			div.id = 'stepContainerContent';
			document.body.appendChild(div);
			element = document.getElementById("stepContainerContent");
		}
	}
	/**
	 * @function
	 * @name sap.apf.integration.withDoubles.tCarouselAndStepContainer#doNothing
	 * @description Dummy function for stubbing unused methods
	 * */
	function doNothing() {
	}
	/**
	 * @function
	 * @name sap.apf.integration.withDoubles.tCarouselAndStepContainer#drawRepresentation
	 * @param {Object} oCurrentStep - current step to be added in container
	 * @param {Boolean} bStepChanged - change of steps indicator
	 * @description To draw the representation in step container
	 * */
	function drawRepresentation(oCurrentStep, bStepChanged) {
		var that = this;
		var nIndex = that.oGlobalApi.oCoreApi.getSteps().indexOf(oCurrentStep);
		if (nIndex === 0) {
			that.oGlobalApi.oUiApi.getAnalysisPath().getController().refreshAnalysisPath();
			that.oGlobalApi.oCoreApi.setActiveStep(that.oGlobalApi.oCoreApi.getSteps()[that.oGlobalApi.oCoreApi.getSteps().length - 1]);
		}
		that.oGlobalApi.oCoreApi.getActiveStep().getSelectedRepresentation.prototype.bIsAlternateView = false;
		that.oGlobalApi.oCoreApi.getActiveStep().getSelectedRepresentation.prototype.type = "none";
		that.oGlobalApi.oUiApi.getAnalysisPath().getController().updateCurrentStep(oCurrentStep, nIndex, bStepChanged);
	}
	/**
	 * @function
	 * @name sap.apf.integration.withDoubles.tCarouselAndStepContainer#doOnAfterRendering
	 * @param {App} layout - ApplicationLayout as an application
	 * @param {Object} assert - test asserts
	 * @param {Function} continuation - callback to be executed after onAfterRendering event
	 * @description Executes the continuation in the onAfterRendering event callback
	 * */
	function doOnAfterRendering(layout, assert, continuation) {
		var done = assert.async();
		layout.onAfterRendering = function() {
			continuation({});
			done();
		};
	}
	/**
	 * @function
	 * @name sap.apf.integration.withDoubles.tCarouselAndStepContainer#createSteps
	 * @param {Object} testContext - test reference
	 * @description Creates the steps
	 * */
	function createSteps(testContext) {
		var sampleStepTemplate;
		if (testContext.oGlobalApi.oCoreApi.getStepTemplates()[0]) {
			sampleStepTemplate = testContext.oGlobalApi.oCoreApi.getStepTemplates()[0];
		}
		testContext.step0 = testContext.oGlobalApi.oCoreApi.createStep(sampleStepTemplate.id,
			drawRepresentation.bind(testContext), sampleStepTemplate.getRepresentationInfo()[0].representationId);//pie
		testContext.step1 = testContext.oGlobalApi.oCoreApi.createStep(sampleStepTemplate.id,
			drawRepresentation.bind(testContext), sampleStepTemplate.getRepresentationInfo()[1].representationId);//column
	}
	/**
	 * @function
	 * @name sap.apf.integration.withDoubles.tCarouselAndStepContainer#getEventCallbackStub 
	 * @param {sap.apf.core.constants.eventTypes} eventType - the registered callback for event callback
	 * @description To stub oGlobalApi.oApi.getEventCallback
	 * */
	function getEventCallbackStub(eventType) {
		return this.oGlobalApi.oUiApi.getEventCallback(eventType);
	}
	QUnit.module('Given createUiApiAsPromise', {
		beforeEach : function(assert) {
			var done = assert.async();
			var that = this;
			var inject = {
				constructors : {
					Metadata : Metadata,
					Request : Request,
					NavigationHandler : NavigationHandler
				}
			};
			createTextContent();
			createUiApiAsPromise("CompUi",
				"/apf-test/test-resources/sap/apf/testhelper/config/applicationConfigurationIntegration.json",
					inject).done(function(api){
						that.oGlobalApi = api;
						//Carousel View Instance
						that.oCarouselView = that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel();
						// stubs & spies
						sinon.stub(that.oGlobalApi.oApi, 'getEventCallback', getEventCallbackStub.bind(that));
						sinon.stub(that.oGlobalApi.oUiApi, 'getEventCallback', doNothing);
						done();
					});
		},
		afterEach : function() {
			var that = this;
			that.oGlobalApi.oCompContainer.destroy();
			that.oGlobalApi.oApi.getEventCallback.restore();
			that.oGlobalApi.oUiApi.getEventCallback.restore();
		}
	});
	QUnit.test("When Carousel API loaded", function(assert) {
		//assert
		assert.ok(this.oCarouselView, "then Carousel View exists");
		assert.ok(this.oCarouselView.oController, "then Carousel Controller exists");
	});
	QUnit.test('When adding steps', function(assert) {
		// arrangement
		var done = assert.async();
		var that = this;
		var testContext = this;
		var sampleStepTemplate;
		// act
		that.oGlobalApi.oUiApi.createApplicationLayout().then(function(layout) {
			layout.placeAt("stepContainerContent");
			doOnAfterRendering(layout, assert, function() {
				if (that.oGlobalApi.oCoreApi.getStepTemplates()[0]) {
					sampleStepTemplate = that.oGlobalApi.oCoreApi.getStepTemplates()[0];
				}
				// assert
				assert.strictEqual(typeof that.oGlobalApi.oUiApi.getStepContainer, "function", "Before addition of steps, Step Container Exists");
				// act
				that.oGlobalApi.oCoreApi.createStep(sampleStepTemplate.id, drawRepresentation.bind(testContext), sampleStepTemplate.getRepresentationInfo()[0].representationId);
				// assert
				assert.strictEqual(that.oGlobalApi.oCoreApi.getSteps().length, 1, "then 1st Step added successfully");
				assert.strictEqual(that.oGlobalApi.oCoreApi.getActiveStep().getSelectedRepresentation().type, "PieChart", "Pie Chart is inserted in the step container and is active");
				// act
				that.oGlobalApi.oCoreApi.createStep(sampleStepTemplate.id, drawRepresentation.bind(testContext), sampleStepTemplate.getRepresentationInfo()[1].representationId);
				//assert
				assert.strictEqual(that.oGlobalApi.oCoreApi.getSteps().length, 2, "then 2nd Step added successfully,");
				assert.strictEqual(that.oGlobalApi.oCoreApi.getActiveStep().getSelectedRepresentation().type, "ColumnChart", "Column Chart is inserted in the step container and is active");
				assert.notEqual(that.oGlobalApi.oCoreApi.getActiveStep().getSelectedRepresentation().type, "PieChart", "Step 1 is inactive");
				// assert.strictEqual(jQuery(".DnD-block").length, 3, "then steps exist in carousel container");FIXME
				// cleanups
				layout.destroy();
				done();
			});
		});
	});
	QUnit.test('When switching steps', function(assert) {
		// arrange
		var done = assert.async();
		var that = this;
		var testContext = this;
		var event = jQuery.Event("keydown");
		that.oGlobalApi.oUiApi.createApplicationLayout().then(function(layout) {
			layout.placeAt("stepContainerContent");
			// act
			doOnAfterRendering(layout, assert, function() {
				createSteps(testContext);
				// assert
				assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[0].oController.representationInstance, "PieChart", "1st step (pie chart) added");
				assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[1].oController.representationInstance, "ColumnChart", " 2nd step (column chart) added");
				assert.strictEqual(that.oGlobalApi.oCoreApi.getActiveStep().getSelectedRepresentation().type, "ColumnChart", "Step 2 (Column chart) is active");
				// act
				event.which = 13;
				jQuery(jQuery(".DnD-block")[1]).trigger(event);
				// assert
				// assert.strictEqual(that.oGlobalApi.oCoreApi.getActiveStep().getSelectedRepresentation().type, "PieChart", "then on selecting step 1 (pie chart), it becomes active");FIXME
				// assert.notEqual(that.oGlobalApi.oCoreApi.getActiveStep().getSelectedRepresentation().type, "ColumnChart", "then Step 2 is inactive");FIXME
				// cleanups
				layout.destroy();
				done();
			});
		});
	});
	QUnit.test('When doing drag/drop of step', function(assert) {
		// arrange
		var done = assert.async();
		var that = this;
		var testContext = this;
		that.oGlobalApi.oUiApi.createApplicationLayout().then(function(layout) {
			layout.placeAt("stepContainerContent");
			// act
			doOnAfterRendering(layout, assert, function() {
				createSteps(testContext);
				// assert
				assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[0].oController.representationInstance, "PieChart", "then Before drag/drop, first step is pie chart");
				assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[1].oController.representationInstance, "ColumnChart", " 2nd step is column chart");
				// act
				that.oCarouselView.up.firePress();
				// assert
				assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[0].oController.representationInstance, "ColumnChart", "then After drag/drop, first step is Column chart");
				assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[1].oController.representationInstance, "PieChart", " 2nd step is Pie chart");
				// cleanups
				layout.destroy();
				done();
			});
		});
	});
	// FIXME
	// QUnit.test('When removing 1st step', function(assert) {
	// 	// arrange
	// 	var done = assert.async();
	// 	var that = this;
	// 	var testContext = this;
	// 	that.oGlobalApi.oUiApi.createApplicationLayout().then(function(layout) {
	// 		layout.placeAt("stepContainerContent");
	// 		// act
	// 		doOnAfterRendering(layout, assert, function() {
	// 			createSteps(testContext);
	// 			// assert
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[0].oController.representationInstance, "PieChart", "Before deletion, 1st step is pie chart");
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[1].oController.representationInstance, "ColumnChart", " 2nd step is column chart");
	// 			//act
	// 			jQuery(jQuery(".DnD-block")[0]).remove();
	// 			that.oCarouselView.oController.removeStep(0); // Remove Step Index 0
	// 			// assert
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews.length, 1, "then First Step is removed successfully and only 1 steps available");
	// 			assert.strictEqual(jQuery(".DnD-block").length, 2, "then first Step removed from carousel container");
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[0].oController.representationInstance, "ColumnChart", "First step(pie chart) is replaced by second step(column chart)");
	// 			// cleanups
	// 			layout.destroy();
	// 			done();
	// 		});
	// 	});
	// });
	// QUnit.test('When removing last step', function(assert) {
	// 	// arrange
	// 	var done = assert.async();
	// 	var testContext = this;
	// 	that.oGlobalApi.oUiApi.createApplicationLayout().then(function(layout) {
	// 		layout.placeAt("stepContainerContent");
	// 		// act
	// 		doOnAfterRendering(layout, assert, function() {
	// 			createSteps(testContext);
	// 			// assert
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[0].oController.representationInstance, "PieChart", "Before deletion, 1st step is pie chart");
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[1].oController.representationInstance, "ColumnChart", " 2nd step is column chart");
	// 			// act
	// 			jQuery(jQuery(".DnD-block")[1]).remove();
	// 			that.oCarouselView.oController.removeStep(1); // Remove Step Index 2
	// 			// assert
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews.length, 1, "then  last Step is removed successfully and 1 steps available");
	// 			assert.strictEqual(jQuery(".DnD-block").length, 2, "then last Step removed from carousel container");
	// 			assert.strictEqual(that.oGlobalApi.oCoreApi.getActiveStep().getSelectedRepresentation().type, "PieChart", "Pie chart is active");
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[0].oController.representationInstance, "PieChart", " 1st step is PieChart chart");
	// 			// cleanups
	// 			layout.destroy();
	// 			done();
	// 		});
	// 	});
	// });
	// QUnit.test('When removing all steps', function(assert) {
	// 	// arrange
	// 	var done = assert.async();
	// 	var testContext = this;
	// 	that.oGlobalApi.oUiApi.createApplicationLayout().then(function(layout) {
	// 		layout.placeAt("stepContainerContent");
	// 		// act
	// 		doOnAfterRendering(layout, assert, function() {
	// 			createSteps(testContext);
	// 			// assert
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[0].oController.representationInstance, "PieChart", "Before deletion, 1st step is pie chart");
	// 			assert.strictEqual(that.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().stepViews[1].oController.representationInstance, "ColumnChart", " 2nd step is column chart");
	// 			// act
	// 			that.oGlobalApi.oUiApi.getAnalysisPath().getToolbar().getController().resetAnalysisPath(); //Remove All Steps
	// 			// assert
	// 			assert.strictEqual(that.oGlobalApi.oCoreApi.getSteps().length, 0, "then all Steps removed successfully, no steps available");
	// 			assert.strictEqual(jQuery(".DnD-block").length, 1, "then all Step removed from carousel container");
	// 			// cleanups
	// 			layout.destroy();
	// 			done();
	// 		});
	// 	});
	// });
});
