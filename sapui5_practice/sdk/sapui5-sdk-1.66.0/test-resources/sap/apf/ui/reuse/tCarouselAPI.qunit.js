/*/
 * Created on 23.11.2018.
 * Copyright(c) 2018 SAP SE
 */
/*global sap */

sap.ui.define([
	'sap/apf/core/instance',
	'sap/apf/core/utils/filter',
	'sap/apf/ui/fixture/coreInstance',
	'sap/ui/core/mvc/Controller',
	'sap/base/Log',
	'sap/ui/thirdparty/sinon'
], function(CoreInstance, CoreFilter, Fixture, MvcController, sapLog, sinon) {
	'use strict';


	/**
	 * Description of the test.
	 * Objectives: show that updates in the core result in updates of the analysis path in the CustomListControl.
	 * In detail show the updates for add, move, delete events in the analysis path.
	 *
	 * The carousel displays the path list.
	 * It handles the event of the selection of a step in the path list.
	 * This establishes a control flow from UI to ??? (TODO).
	 *   Required is an update of the chartContainer which displays the selected step.
	 *   TODO: test that event (at controller) call the corresponding UI update method.
	 *
	 * AddStep Button
	 *   The event handler call is in class stepGallery.fragment.js.
	 *   It calls stepGallery.controller.onStepPress which calls checkAddStep (returns promise).
	 *   Its resolver calls oCore.createStep. And this is the only occurrence in sap.apf.ui.
	 *   TODO: test that this happens.
	 *
	 * oCore.createStep with callback:
	 *   TODO prove analysisPath.controller.callBackForUpdatePathAndSetLastStepAsActive calls the update Method of the CustomListControl
	 *   including calling analysisPath.updateListView()
	 *
	 * Move: TODO prove calling update, see addStep
	 * Delete: TODO prove calling update, see addStep
	 *
	 */
	QUnit.module("Given a stubbed core instance w/o OData", {
		beforeEach: function(){
			var that = this;
			that.spy = {};

			that.getMetadataDeferred = jQuery.Deferred();
			function getMetadata(){
				return that.getMetadataDeferred.promise();
			}
			that.cumulativeStartFilterDeferred = jQuery.Deferred();
			function getCumulativeFilter() {
				return that.cumulativeStartFilterDeferred.promise();
			}
			that.getSmartFilterBarConfigurationDeferred = jQuery.Deferred();
			function getSmartFilterBarConfiguration() {
				return that.getSmartFilterBarConfigurationDeferred.promise();
			}


			that.inject = Fixture.createInjectForCore(that);
			that.oCoreInstance = new CoreInstance.constructor(that.inject);
			// coreProbe has been executed here.
			that.oCoreInstance.createRepresentation = Fixture.createRepresentation;
			that.coreReferences.configurationFactory.getConfigurationById = Fixture.getConfigurationById;
			that.coreReferences.configurationFactory.getSmartFilterBarConfiguration = getSmartFilterBarConfiguration;
			that.coreReferences.coreApi.getCumulativeFilter = getCumulativeFilter;
			that.coreReferences.coreApi.getMetadata = getMetadata;
		},
		afterEach: function(){
			var that = this;
			Object.keys(that.spy).forEach(function(name){
				that.spy[name].restore();
			});
		}
	});

	QUnit.test("when calling createStep", function(assert){
		assert.expect(1);
		var done = assert.async();
		var that = this;
		var sStepId = "step1";
		var fnStepProcessedCallback = function(obj){
			// check
			assert.notStrictEqual(obj, undefined, "THEN the callback is called when all promises have been resolved.");
			done();
		};
		//act
		that.oCoreInstance.createStep(sStepId, fnStepProcessedCallback);

		// arrange
		// resolved those promises on which the exec of the callback depends
		that.getMetadataDeferred.resolve({
			origin: "getMetadata"
		});
		var cumulativeStartFilter = new CoreFilter(Fixture.createMessageHandler());
		that.cumulativeStartFilterDeferred.resolve(cumulativeStartFilter);
		that.getSmartFilterBarConfigurationDeferred.resolve(null); // required: null which indicates no SFB configured
	});

	QUnit.module("Given a stubbed core instance w/o OData", {
		beforeEach: function(){
			var that = this;
			that.spy = {};

			that.inject = Fixture.createInjectForCore(that);
			that.oCoreInstance = new CoreInstance.constructor(that.inject);
			// coreProbe has been executed here.
			that.coreReferences.configurationFactory.getConfigurationById = Fixture.getConfigurationById;
			that.coreReferences.coreApi.getCategories = function(){
				return [];
			};
			that.coreReferences.coreApi.getTextNotHtmlEncoded = function(){
				return "hugo-text";
			};
			that.coreReferences.coreApi.getStepTemplates = function(){
				return [];
			}
		},
		afterEach: function(){
			var that = this;
			Object.keys(that.spy).forEach(function(name){
				that.spy[name].restore();
			});
			that.view.destroy();
		}
	});
	QUnit.test("When calling stepGallery.controller.onStepPress", function(assert) {
		var that = this;
		assert.expect(3);
		//prepare
		var sStepId = "step1";
		that.view = new sap.ui.view({
			id : "idViewStubbedStepGallery",
			type : sap.ui.core.mvc.ViewType.JS,
			viewName : "sap.apf.ui.reuse.view.stepGallery",
			viewData : {
				oCoreApi: that.coreReferences.coreApi,
				uiApi: {
					getElementsGalleryData: function(){
						return {
							GalleryElements : []
						};
					},
					getAnalysisPath: function(){
						return {
							getController: function(){
								return {
									callBackForUpdatePathAndSetLastStepAsActive: that.callback,
									refresh: function(){
									}
								};
							}
						}
					}
				}
			}
		});
		that.spy.createStep = sinon.stub(that.coreReferences.coreApi, "createStep", function(){});
		that.callback = function(){
			return "42";
		};
		//act
		var controller = that.view.getController();
		controller.oHierchicalSelectDialog = {
			close: function(){
			}
		};
		controller.onStepPress(sStepId, undefined);
		// check
		assert.strictEqual(that.spy.createStep.callCount, 1 , "THEN createStep is called");
		assert.strictEqual(that.spy.createStep.getCall(0).args[0], sStepId , "THEN 1st param is the stepId");
		assert.strictEqual(that.spy.createStep.getCall(0).args[1](), that.callback() ,
			"THEN createStep is called with the callBackForUpdatePathAndSetLastStepAsActive");
	});
});
