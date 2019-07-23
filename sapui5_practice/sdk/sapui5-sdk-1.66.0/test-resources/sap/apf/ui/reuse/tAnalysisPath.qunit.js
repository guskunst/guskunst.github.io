/*global sap,jQuery sinon, OData */

sap.ui.define([
	'sap/apf/testhelper/stub/ajaxStub',
	'sap/apf/testhelper/stub/textResourceHandlerStub',
	'sap/apf/testhelper/doubles/UiInstance',
	'sap/apf/testhelper/doubles/createUiApiAsPromise',
	'sap/apf/testhelper/doubles/coreApi',
	'sap/apf/testhelper/doubles/messageHandler',
	'sap/apf/testhelper/doubles/sessionHandlerStubbedAjax',
	'sap/apf/testhelper/doubles/request',
	'sap/apf/testhelper/doubles/metadata',
	'sap/apf/testhelper/doubles/Representation',
	'sap/apf/testhelper/doubles/navigationHandler',
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-qunit'
	], function(AjaxStub, TextResourceHandlerStub,
				UiInstance, createUiApiAsPromise, CoreApi, MessageHandler, SessionHandlerStubbedAjax,
				Request, Metadata, Representation, NavigationHandler,
				sinon, _sinonQunit){
	"use strict";
	QUnit.module("Availability Tests For Analysis Path and Popover Menu", {
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
				var that = this;
				this.oGlobalApi = api;
				this.oStep = this.oGlobalApi.oCoreApi.createStep(
					this.oGlobalApi.oCoreApi.getStepTemplates()[2].id,
					function(assert) {},
					this.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo()[0].representationId
				);
				this.oGlobalApi.oCoreApi.setActiveStep(this.oGlobalApi.oCoreApi.getSteps()[0]);
				this.nIndex = this.oGlobalApi.oCoreApi.getSteps().indexOf(this.oStep);
				this.bStepChanged = true;
				this.spyGetLayoutView = function() {
					this.layout = new sap.ui.layout.VerticalLayout();
					this.layout.getController = function() {
						return {
							resetAllFilters : function(param) {
								return param;
							},
							setMasterTitle : function() {
								return null;
							},
							setDetailTitle : function() {
								return null;
							},
							setMasterHeaderButton : function() {
								return null;
							},
							addMasterFooterContentLeft : function() {
								return null;
							},
							detailTitleRemoveAllContent : function() {
								return null;
							},
							enableDisableOpenIn : function() {
								that.enableDisableOpenInCalled = true;
							}
						};
					};
					return this.layout;
				};
				this.oGlobalApi.oUiApi.getAnalysisPath().getController().refreshAnalysisPath();
				sinon.stub(this.oGlobalApi.oUiApi, 'getLayoutView', this.spyGetLayoutView);
				sinon.stub(this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel(), 'carouselContent', function(param) {
					return param;
				});
				this.spySetActiveStep = sinon.spy(this.oGlobalApi.oCoreApi, "setActiveStep");
				var step0Controller = this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getStepView(0).getController();
				this.spyDrawThumbnailContent = sinon.stub(step0Controller, 'drawThumbnailContent', function() {
					return this;
				});
				this.spyGetStepContainer = sinon.spy(this.oGlobalApi.oUiApi, 'getStepContainer');
				this.drawStepContainer = sinon.spy(this.oGlobalApi.oUiApi.getStepContainer().getController(), 'drawStepContent');
				this.analysisPath = this.oGlobalApi.oUiApi.getAnalysisPath();
				this.analysisPathController = this.analysisPath.getController();
				this.oActionListItem = this.analysisPath.oActionListItem;
				done();
			}.bind(this));
		},
		afterEach : function() {
			jQuery.ajax.restore();
			TextResourceHandlerStub.teardown();
			this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().getStepView(0).getController().drawThumbnailContent.restore();
			this.oGlobalApi.oUiApi.getStepContainer.restore();
			this.oGlobalApi.oUiApi.getLayoutView.restore();
			this.oGlobalApi.oUiApi.getAnalysisPath().getCarousel().carouselContent.restore();
			this.spySetActiveStep.restore();
			this.drawStepContainer.restore();
			this.oGlobalApi.oCoreApi.removeStep(this.oGlobalApi.oCoreApi.getSteps()[0], function(assert) {
			});
			this.oGlobalApi.oCompContainer.destroy();
		}
	});
	QUnit.test("Path name and dirty state of initial path", function(assert) {
		assert.strictEqual(this.analysisPath.oSavedPathName.getTitle(), "Unnamed Analysis Path", "The Analysis Path name has the correct title");
		assert.strictEqual(this.analysisPath.oSavedPathName.getTitle().indexOf("*"), -1, "Name of a new Analysis Path does not have a *");
		var bStarInName = (this.analysisPath.oSavedPathName.getTitle().indexOf("*") !== -1);
		assert.strictEqual(this.oGlobalApi.oCoreApi.isDirty(), bStarInName, "Dirty state and * match for a new analysis path");
	});
	QUnit.test("API availability in Analysis Path Controller", function(assert) {
		assert.ok(typeof this.analysisPathController.refresh === "function", "Refresh API available on the analysis path controller");
		assert.ok(typeof this.analysisPathController.refreshAnalysisPath === "function", "Refresh Carousel API available on the analysis path controller");
		assert.ok(typeof this.analysisPathController.drawMainChart === "function", "Draw mail chart API available on the analysis path controller");
		assert.ok(typeof this.analysisPathController.drawThumbnail === "function", "Draw Thumbnail API available on the analysis path controller");
		assert.ok(typeof this.analysisPathController.callBackForUpdatePath === "function", "Callback for update path API available on the analysis path controller");
		assert.ok(typeof this.analysisPathController.callBackForUpdatePathAndSetLastStepAsActive === "function", "callBackForUpdatePathAndSetLastStepAsActive API available on the analysis path controller");
	});
	QUnit.test('refresh() test', function(assert) {
		this.analysisPathController.refresh(0);
		assert.ok(typeof this.analysisPathController.refresh === "function", "refresh() called");
	});
	QUnit.test('refresh() test with second step being the active step', function(assert) {
		this.oStep1 = this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[2].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[2].getRepresentationInfo()[0].representationId);// creating a step
		this.oGlobalApi.oCoreApi.setActiveStep(this.oGlobalApi.oCoreApi.getSteps()[1]);
		this.analysisPathController.refresh(0);
		assert.ok(typeof this.analysisPathController.refresh === "function", "refresh() called");
		this.oGlobalApi.oCoreApi.removeStep(this.oGlobalApi.oCoreApi.getSteps()[0], function(assert) {
		});
	});
	QUnit.test('navigateToStep', function(assert) {
		//arrange
		this.oStep1 = this.oGlobalApi.oCoreApi.createStep(this.oGlobalApi.oCoreApi.getStepTemplates()[0].id, function(assert) {
		}, this.oGlobalApi.oCoreApi.getStepTemplates()[0].getRepresentationInfo()[0].representationId);// creating a step
		this.analysisPathController.refreshAnalysisPath();
		//act
		this.analysisPathController.navigateToStep(1);
		//assert
		assert.strictEqual(this.spySetActiveStep.callCount, 1, "setActiveStep called");
		assert.strictEqual(this.spySetActiveStep.getCall(0).args[0].getAdditionalConfigurationProperties().id, "stepTemplate1", "setActiveStep called with new active step");
		assert.strictEqual(this.drawStepContainer.callCount, 1, "drawStepContent called");
		var oldActiveStep = this.analysisPath.getCarousel().getStepView(0);
		assert.notOk(oldActiveStep.oStepTitle.hasStyleClass('activeStepTitle'), "OldActiveStep title hasn't active style class");
		assert.notOk(oldActiveStep.oThumbnailVLayout.hasStyleClass('activeStepThumbnail'), "oldActiveStep thumbnail hasn't active style class");
		var activeStep = this.analysisPath.getCarousel().getStepView(1);
		assert.ok(activeStep.oStepTitle.hasStyleClass('activeStepTitle'), "ActiveStep title has active style class");
		assert.ok(activeStep.oThumbnailVLayout.hasStyleClass('activeStepThumbnail'), "ActiveStep thumbnail has active style class");
	});
	QUnit.test('drawMainChart() test', function(assert) {
		this.analysisPathController.drawMainChart(this.bStepChanged);
		assert.strictEqual(this.spyGetStepContainer.called, true, "drawStepContent() has been called");
	});
	QUnit.test('drawThumbnail() test', function(assert) {
		this.analysisPathController.drawThumbnail(this.nIndex, this.bStepChanged);
		assert.strictEqual(this.spyDrawThumbnailContent.called, true, "drawThumbnailContent() has been called");
	});
	QUnit.test('updateCurrentStep() test', function(assert) {
		this.oGlobalApi.oUiApi.getAnalysisPath().getController().isOpenPath = true;
		this.analysisPathController.updateCurrentStep(this.oStep, this.nIndex, this.bStepChanged);
		assert.strictEqual(this.spyGetStepContainer.called, true, "drawStepContent() has been called from updateCurrentStep");
		assert.strictEqual(this.spyDrawThumbnailContent.called, true, "drawThumbnailContent() has been called from updateCurrentStep");
	});
	QUnit.test("Availability of menu popover in the analysis path", function(assert) {
		var oActionListPopover = this.analysisPath.oActionListPopover;
		var listItems = this.oActionListItem.getContent()[0].getItems();
		assert.ok(oActionListPopover, "Menu Popover available");
		assert.equal(listItems.length, 6, "Six actions available in menu popover");
		assert.equal(listItems[0].getTitle(), this.oGlobalApi.oCoreApi.getTextNotHtmlEncoded("new"), "New button available");
		assert.equal(listItems[1].getTitle(), this.oGlobalApi.oCoreApi.getTextNotHtmlEncoded("open"), "Open button available");
		assert.equal(listItems[2].getTitle(), this.oGlobalApi.oCoreApi.getTextNotHtmlEncoded("save"), "Save button available");
		assert.equal(listItems[3].getTitle(), this.oGlobalApi.oCoreApi.getTextNotHtmlEncoded("savePathAs"), "Save As button available");
		assert.equal(listItems[4].getTitle(), this.oGlobalApi.oCoreApi.getTextNotHtmlEncoded("delete"), "Delete button available");
		assert.equal(listItems[5].getTitle(), this.oGlobalApi.oCoreApi.getTextNotHtmlEncoded("print"), "Print button available");
	});
	QUnit.test("WHEN retrieving menu popover by its Stable ID", function(assert){
		var popover = this.analysisPath.byId("idAnalysisPathMenuPopOver");
		assert.strictEqual(popover, this.analysisPath.oActionListPopover, "THEN popover is found");
	});
	QUnit.test('Set path title for new clean path', function(assert) {
		this.analysisPathController.setPathTitle();
		assert.strictEqual(this.analysisPath.oSavedPathName.getTitle(), this.oGlobalApi.oCoreApi.getTextNotHtmlEncoded('unsaved'), 'Language dependent default title without asterisk');
	});
	QUnit.test('Set path title for unsaved dirty path', function(assert) {
		this.oGlobalApi.oCoreApi.setDirtyState(true);
		this.analysisPathController.setPathTitle();
		assert.strictEqual(this.analysisPath.oSavedPathName.getTitle(), '*' + this.oGlobalApi.oCoreApi.getTextNotHtmlEncoded('unsaved'), 'Asterisk indicates dirty path with language dependent default title');
	});
	QUnit.test('Set path title for a saved or opened path', function(assert) {
		this.oGlobalApi.oCoreApi.setPathName("User's Delight");
		this.analysisPathController.setPathTitle();
		assert.strictEqual(this.analysisPath.oSavedPathName.getTitle(), "User's Delight", 'Previously set path name returned displayed as clean path');
	});
	QUnit.test('Set path title for a saved or opened dirty path', function(assert) {
		this.oGlobalApi.oCoreApi.setPathName("User's Delight");
		this.oGlobalApi.oCoreApi.setDirtyState(true);
		this.analysisPathController.setPathTitle();
		assert.strictEqual(this.analysisPath.oSavedPathName.getTitle(), "*User's Delight", 'Previously set path name prefixed with asterisk as indicator for dirty path');
	});
	QUnit.test('When calling destroy function', function(assert) {
		//arrangements
		var spyToolbarDestroy = sinon.spy(this.analysisPath.getToolbar().getController(), "apfDestroy");
		var spyCarouselDestroy = sinon.spy(this.analysisPath.getCarousel().getController(), "apfDestroy");
		//action
		this.analysisPath.getController().apfDestroy();
		//assert
		assert.ok(spyToolbarDestroy.calledOnce, "apfDestroy() in toolbar controller has been called");
		assert.ok(spyCarouselDestroy.calledOnce, "apfDestroy() in carousel controller has been called");
		spyToolbarDestroy.restore();
		spyCarouselDestroy.restore();
	});
});