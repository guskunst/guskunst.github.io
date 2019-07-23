/*
 * tests for the sap.suite.ui.generic.template.ObjectPage.controller.ControllerImplementation
 */

sap.ui.define([
	"testUtils/sinonEnhanced",
	"sap/m/library",
	"sap/m/MessageBox",
	"sap/suite/ui/generic/template/lib/TemplateAssembler",
	"sap/suite/ui/generic/template/lib/testableHelper",
	"sap/suite/ui/generic/template/ObjectPage/controller/ControllerImplementation",
	"sap/suite/ui/generic/template/lib/ShareUtils"
], function(sinon, MobileLibrary, MessageBox, TemplateAssembler, testableHelper, ControllerImplementation, ShareUtils) {
	"use strict";
	var bShowConfirmationOnDraftActivate = true;
	var bIsAppBusy = false;
	var oBusyHelper = {
		isBusy: function() {
			return bIsAppBusy;
		}
	};

	var oConfig = {};
	var oSections = {};
	var navToListOnSave = false;
	var oTemplatePrivateModel = {
		getProperty: function() {
			return 3;
		},
		setProperty: function(sPath, oValue) {
		}
	};

	var oSaveScenarioHandler = { };

	var oTemplateUtils = {
		oCommonUtils: {
			refreshSmartTable: jQuery.noop,
			triggerPrepareOnEnterKeyPress: jQuery.noop, // needed for setup
			executeGlobalSideEffect: jQuery.noop, // needed for setup
			getDialogFragment: jQuery.noop, // needed for setup
			isDraftEnabled: jQuery.noop, // needed for setup
			processDataLossConfirmationIfNonDraft: function() {},
			semanticObjectLinkNavigation: function() {},
			getText: function() {},
			getContextText: sinon.stub().returns(""),
			getControlInformation: sinon.stub().returns({})
		},
		oServices: {
			oTemplateCapabilities: {},
			oDraftController: {},
			oCRUDManager: {},
			oNavigationController: {},
			oViewDependencyHelper: {},
			oApplication: {
				getBusyHelper: function() {
					return oBusyHelper;
				},
				showMessageToast: jQuery.noop,
				getSaveScenarioHandler: function(){ return oSaveScenarioHandler; }
			},
			oApplicationController: {
				executeSideEffects: jQuery.noop
			}
		},
		oComponentUtils: {
			getFclProxy: function() {
				return {};
			},
			getTemplatePrivateModel: function() {
				return oTemplatePrivateModel;
			},
			isODataBased: function() {
				return true;
			},
			isDraftEnabled: function() {},
			setEditableNDC: function() {}
		},
		oCommonEventHandlers : {
			onBeforeRebindTable : jQuery.noop
		}
	};
	var oUIModel = { setProperty: function() {} };
	var oView = {
		getModel: function(sName) {
			if (sName !== "ui") {
				var oGetObj = {
					getObject: function() {
						var oEntity = {
							IsActiveEntity: function() {}
						};
						return oEntity;
					}
				};
				return oGetObj;
			}
			return oUIModel;
		}
	};

	var oMetaModel = {
		getODataEntitySet: function() {
			return {
				"entityType": "EntityType"
			};
		},
		getODataEntityType: function() {
			return {
				"com.sap.vocabularies.UI.v1.HeaderInfo": {
					"TypeName": {
						"String": "TypeName"
					}
				}
			};
		}
	};
	var oUnnamedModel = {
		getMetaModel: function() {
			return oMetaModel;
		}
	};
	var oService = {
		setTitle: function() {

		},
		setBackNavigation: function() {

		}
	};

	var oLink1 = {};

	var oComponent = {
		getModel: function(sName) {
			if (sName === "_templPriv") {
				return oTemplatePrivateModel;
			} else if (!sName) {
				return oUnnamedModel;
			} else {
				throw new Error("Only _templPriv model or unnamed must be retrieved from this component");
			}
		},
		getEntitySet: function() {
			return "STTA_C_MP_Product";
		},
		getId: function() {},
		getService: function(sServiceName) {
			if (sServiceName === "ShellUIService") {
				return {
					then: function(oFunction) {
						return oFunction(oService);
					}
				};
			} else {
				throw new Error("Only ShellUIService service must be called from this component");
			}
		},
		getAppComponent: function() {
			return {
				getConfig: function() {
					return oConfig;
				}
			};
		},
		getSections: function() {
			return oSections;
		},
		getShowConfirmationOnDraftActivate: function() {
			return bShowConfirmationOnDraftActivate;
		},
		getNavToListOnSave: function() {
			return navToListOnSave;
		}
	};

	var oBreadCrumb = new sap.m.Breadcrumbs();
	oLink1 = new sap.m.Link({
		target: "target",
		href: "http://abc.de"
	});

	oBreadCrumb.insertLink(oLink1);

	var oController = {
		beforeLineItemDeleteExtension: jQuery.noop,
		onBeforeRebindTableExtension: jQuery.noop,
		templateBaseExtension: {
			ensureFieldsForSelect: {},
			addFilters: {}
		},
		getView: function() {
			return oView;
		},
		getOwnerComponent: function() {
			return oComponent;
		},
		byId: function(sName) {
			if (sName === "objectPage") {
				var oObjectPage = {
					getHeaderTitle: function() {
						var oTitle = {
								getBreadCrumbsLinks: function() {
									return oBreadCrumb.getLinks();
								}
						};
						return oTitle;
					},
					getSections: function() {
						return [
							{
								getId: function() {
									return "firstSectionId";
								},
								getSubSections: function(){
									return [];
								}
							}
						];
					},
					getCustomData: function() {
						return [];
					},
					attachEvent: function(sEventId, fnEventHandler) {
						if (sEventId !== "subSectionEnteredViewPort") {
							throw new Error("Only event subSectionEnteredViewPort can be used");
						}
						if (typeof fnEventHandler !== "function") {
							throw new Error("Event handler must be a function");
						}
					}
				};
				return oObjectPage;
			}
		}
	};
	var oMethods;
	var oStubForPrivate;
	var oViewProxy;
	var oSandbox;

	function fnCommonSetup() {
		oStubForPrivate = testableHelper.startTest();
		oSandbox = sinon.sandbox.create();
		oSandbox.stub(testableHelper.getStaticStub(), "MessageButtonHelper");
		oSandbox.stub(testableHelper.getStaticStub(), "PaginatorButtonsHelper");
		var oMyTemplateUtils = oTemplateUtils;
		oViewProxy = {
			oStatePreserver: {}
		};
		oMethods = ControllerImplementation.getMethods(oViewProxy, oMyTemplateUtils, oController);
		jQuery.extend(oMyTemplateUtils, oTemplateUtils); // add content to the TemplateUtils, after getMethods has been called. This is the way, as it is done by the TemplateAssembler.
		oMethods.onInit();
	}

	function fnCommonTeardown() {
		bIsAppBusy = false;
		oSandbox.restore();
		testableHelper.endTest();
	}

	module("ObjectPage.controller.ControllerImplementation.edit", {
		setup: fnCommonSetup,
		teardown: fnCommonTeardown
	});

	function fnEditTest(assert, oEditInfo) {
		var bUnconditionalMock = {};
		var oEditEntityStub = sinon.stub(oTemplateUtils.oServices.oCRUDManager, "editEntity", function(bUnconditional) {
			assert.strictEqual(bUnconditional, bUnconditionalMock, "Parameter bUnconditional must be passed to CRUDManager");
			return {
				then: function(fnResolved, fnRejected) {
					assert.ok(!fnRejected, "Do nothing, when editing is rejected");
					fnResolved(oEditInfo);
				}
			};
		});
		var oGetDraftInfoStub, oSetRootPageToDirtyStub, oSwitchToDraftStub;

		if (oEditInfo.context) {
			if (oEditInfo.context.hasDraft) {
				oSandbox.stub(oTemplateUtils.oServices.oApplication, "invalidatePaginatorInfo");
			}
			oGetDraftInfoStub = sinon.stub(oTemplateUtils.oServices.oDraftController, "getDraftContext", function() {
				return {
					hasDraft: function(oContext) {
						assert.strictEqual(oContext, oEditInfo.context, "context from editInfo must be passed to hasDraft");
						if (oContext.hasDraft) {
							oSetRootPageToDirtyStub = sinon.stub(oTemplateUtils.oServices.oViewDependencyHelper, "setRootPageToDirty");
							oSwitchToDraftStub = sinon.stub(oTemplateUtils.oServices.oApplication, "switchToDraft");
						}
						return oContext.hasDraft;
					}
				};
			});
		}
		oStubForPrivate.editEntity(bUnconditionalMock);
		oEditEntityStub.restore();
		if (oGetDraftInfoStub) {
			oGetDraftInfoStub.restore();
		}
		if (oSetRootPageToDirtyStub) {
			assert.ok(oSetRootPageToDirtyStub.calledOnce, "Root page must have been set dirty");
			oSetRootPageToDirtyStub.restore();
		}
		if (oSwitchToDraftStub) {
			assert.ok(oSwitchToDraftStub.calledOnce, "Navigation to draft must have been performed exactly once");
			assert.ok(oSwitchToDraftStub.calledWithExactly(oEditInfo.context),
				"Navigation must be performed with the right parameters");
			oSwitchToDraftStub.restore();
		}
	}

	QUnit.test("onEdit: no soft lock by other user, with draft", function(assert) {
		var oEditInfo = {
			context: {
				hasDraft: true
			}
		};
		fnEditTest(assert, oEditInfo);
	});

	QUnit.test("onEdit: non-draft scenario", function(assert) {
		var oSetPropertyStub = sinon.stub(oUIModel, "setProperty");
		var oEditInfo = {
			context: {
				hasDraft: false
			}
		};
		fnEditTest(assert, oEditInfo);
		assert.ok(oSetPropertyStub.calledOnce, "Exactly one property must have been set in the ui model");
		assert.ok(oSetPropertyStub.calledWithExactly("/editable", true), "setProperty must be called with the correct parameters");
		oSetPropertyStub.restore();
	});

	QUnit.test("onEdit: soft lock by other user", function(assert) {
		var oEditInfo = {
			draftAdministrativeData: {
				CreatedByUserDescription: "OTHER"
			}
		};
		var oQuestion = {};
		var oGetTextStub = sinon.stub(oTemplateUtils.oCommonUtils, "getText", function(sId, aPars) {
			assert.strictEqual(sId, "DRAFT_LOCK_EXPIRED", "Text with id 'DRAFT_LOCK_EXPIRED' must be retrieved");
			assert.deepEqual(aPars, ["OTHER"], "Name of other user must be used in text");
			return oQuestion;

		});
		var oDialogModel = {
			setProperty: jQuery.noop
		};
		var oDialog = {
			getModel: function(sModelName) {
				assert.strictEqual(sModelName, "Dialog", "Only model with name 'Dialog' must be retrieved");
				return oDialogModel;
			}
		};
		var oSetPropertySpy = sinon.spy(oDialogModel, "setProperty");
		var oOpenSpy = sinon.spy(oDialog, "open");
		var oDialogController;
		var oGetDialogFragmentStub = sinon.stub(oTemplateUtils.oCommonUtils, "getDialogFragment", function(sName, oFragmentController, sModel) {
			assert.strictEqual(sName, "sap.suite.ui.generic.template.ObjectPage.view.fragments.UnsavedChangesDialog",
				"Load correct fragment for unsaved changes");
			assert.strictEqual(sModel, "Dialog", "Name of local model must be 'Dialog'");
			oDialogController = oFragmentController;
			return oDialog;
		});

		fnEditTest(assert, oEditInfo);
		assert.ok(oSetPropertySpy.calledOnce, "Property for dialog model must have been set");
		assert.ok(oSetPropertySpy.calledWithExactly("/unsavedChangesQuestion", oQuestion),
			"Property for the dialog model must have been set correctly");
		assert.ok(oOpenSpy.calledOnce, "Dialog must have been opened");
		oGetDialogFragmentStub.restore();
		oGetTextStub.restore();
		oOpenSpy.restore();
		// Now test the dialog controller
		var oCloseSpy = sinon.spy(oDialog, "close");
		oDialogController.onCancel();
		assert.ok(oCloseSpy.calledOnce, "Dialog must have been closed by Cancel");
		var oEditStub = sinon.stub(oStubForPrivate, "editEntity");
		oDialogController.onEdit();
		assert.ok(oCloseSpy.calledTwice, "Dialog must also have been closed by Edit");
		assert.ok(oEditStub.calledOnce, "Editing must have been started after confirmation");
		assert.ok(oEditStub.calledWithExactly(true), "Editing must be unconditional");
		oEditStub.restore();
	});

	module("ObjectPage.controller.ControllerImplementation.onActivateImpl", {
		setup: fnCommonSetup,
		teardown: fnCommonTeardown
	});

	function getDraftActivateCreator(assert, oResponse){
		return function(){
			return {
				then: function(fnThen, fnCatch) {
					assert.strictEqual(fnCatch, jQuery.noop, "Error case must not be handled on this level");
					fnThen(oResponse);
				}
			};
		};
	}

	QUnit.test("Draft is saved and stay on object page", function(assert) {
		oSandbox.stub(oTemplateUtils.oServices.oApplication, "invalidatePaginatorInfo");
		bIsAppBusy = false;

		var oResponse = {
			context: {}
		};
		var oMessageToastSpy, oSetAllPagesDirtySpy, oUnbindChildrenSpy, oNavigateToContextSpy, ofireSpy;
		oMessageToastSpy = sinon.spy(oTemplateUtils.oServices.oApplication, "showMessageToast");
		oSetAllPagesDirtySpy = sinon.spy(oTemplateUtils.oServices.oViewDependencyHelper, "setAllPagesDirty");
		oUnbindChildrenSpy = sinon.spy(oTemplateUtils.oServices.oViewDependencyHelper, "unbindChildren");
		var oNavigateAfterActivationSpy = sinon.spy(oTemplateUtils.oServices.oApplication, "navigateAfterActivation");
		ofireSpy = sinon.spy(oTemplateUtils.oComponentUtils, "fire");
		var oActivateDraftEntityStub = sinon.stub(oTemplateUtils.oServices.oCRUDManager, "activateDraftEntity", getDraftActivateCreator(assert, oResponse));
		oStubForPrivate.onActivateImpl();
		assert.ok(oMessageToastSpy.calledOnce, "Message toast have been called");
		if (oResponse && oResponse.context) {
			assert.ok(oSetAllPagesDirtySpy.calledOnce, "setAllPagesDirty called");
			assert.ok(oUnbindChildrenSpy.calledOnce, "unbindChildren called");
			assert.ok(oNavigateAfterActivationSpy.calledOnce, "navigateAfterActivation called");
			assert.ok(oNavigateAfterActivationSpy.calledWithExactly(oResponse.context), "navigateAfterActivatio called correctly");
		}
		assert.ok(ofireSpy.calledOnce, "fire called");
		oMessageToastSpy.restore();
		oSetAllPagesDirtySpy.restore();
		oUnbindChildrenSpy.restore();
		oNavigateAfterActivationSpy.restore();
		ofireSpy.restore();
		oActivateDraftEntityStub.restore();
	});

	QUnit.test("Draft is saved and navigate to list report page", function(assert) {
		oSandbox.stub(oTemplateUtils.oServices.oApplication, "invalidatePaginatorInfo");
		bIsAppBusy = false;

		var oResponse = {
			context: true
		};

		navToListOnSave = true;

		var oMessageToastSpy, oSetAllPagesDirtySpy, oUnbindChildrenSpy, oNavigateToRootSpy, ofireSpy;
		oMessageToastSpy = sinon.spy(oTemplateUtils.oServices.oApplication, "showMessageToast");
		oSetAllPagesDirtySpy = sinon.spy(oTemplateUtils.oServices.oViewDependencyHelper, "setAllPagesDirty");
		oUnbindChildrenSpy = sinon.spy(oTemplateUtils.oServices.oViewDependencyHelper, "unbindChildren");
		var oNavigateAfterActivationSpy = sinon.spy(oTemplateUtils.oServices.oApplication, "navigateAfterActivation");
		ofireSpy = sinon.spy(oTemplateUtils.oComponentUtils, "fire");
		var oActivateDraftEntityStub = sinon.stub(oTemplateUtils.oServices.oCRUDManager, "activateDraftEntity", getDraftActivateCreator(assert, oResponse));
		oStubForPrivate.onActivateImpl();
		assert.ok(oMessageToastSpy.calledOnce, "Message toast have been called");
		if (oResponse && oResponse.context) {
			assert.ok(oSetAllPagesDirtySpy.calledOnce, "setAllPagesDirty called");
			assert.ok(oUnbindChildrenSpy.calledOnce, "unbindChildren called");
			assert.ok(oNavigateAfterActivationSpy.calledOnce, "navigateAfterActivation called");
			assert.ok(!oNavigateAfterActivationSpy.firstCall.args[0], "navigateAfterActivatio called correctly");
		}
		assert.ok(ofireSpy.calledOnce, "fire called");
		oMessageToastSpy.restore();
		oSetAllPagesDirtySpy.restore();
		oUnbindChildrenSpy.restore();
		oNavigateAfterActivationSpy.restore();
		ofireSpy.restore();
		oActivateDraftEntityStub.restore();
	});

	module("fnIsEntryDeletable", {
		setup: fnCommonSetup,
		teardown: fnCommonTeardown
	});

	function fnTestIsEntryDeletable(assert, oDeleteRestrictions, oContext, bExpectedIsDeletable) {
		var oSmartTable = {
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.comp.smarttable.SmartTable";
					}
				};
			},
			getModel: function() {
				return {
					getMetaModel: function() {
						return {
							getODataEntitySet: function() {
								return {};
							}
						};
					},
					getProperty: function(sDeletablePath, oContext) {
						return oContext[sDeletablePath];
					}
				};
			},
			getEntitySet: function() {
				return "";
			}
		};

		var oGetTableDeleteRestrictions = sinon.stub(oStubForPrivate, "getTableDeleteRestrictions", function() {
			return oDeleteRestrictions;
		});
		var oGetDeleteRestrictions = sinon.stub(oTemplateUtils.oCommonUtils, "getDeleteRestrictions", function(oControl) {
			return oDeleteRestrictions;
		});

		var actualIsDeletable = oStubForPrivate.isEntryDeletable(oContext, oSmartTable);
		assert.equal(actualIsDeletable, bExpectedIsDeletable);

		oGetTableDeleteRestrictions.restore();
		oGetDeleteRestrictions.restore();
	}

	QUnit.test("Entry is Deletable if there are no delete restrictions", function(assert) {
		fnTestIsEntryDeletable(assert, undefined, {}, true);
	});

	QUnit.test("Entry is Deletable if deletable path is true", function(assert) {
		var oDeleteRestrictions = {
			Deletable: {
				Path: "isDeletable"
			}
		};
		fnTestIsEntryDeletable(assert, oDeleteRestrictions, { isDeletable: true }, true);
	});

	QUnit.test("Entry is not Deletable if deletable path is false", function(assert) {
		var oDeleteRestrictions = {
			Deletable: {
				Path: "isDeletable"
			}
		};
		fnTestIsEntryDeletable(assert, oDeleteRestrictions, { isDeletable: false }, false);
	});

	module("ObjectPage.controller.ControllerImplementation.onActivate", {
		setup: fnCommonSetup,
		teardown: fnCommonTeardown
	});

	QUnit.test("onActivate must call SaveScenarioHandler.handleSaveScenario and pass onActivateImpl", function(assert){
		var oOnActivateImplStub = oSandbox.stub(oStubForPrivate, "onActivateImpl");
		oSandbox.stub(oSaveScenarioHandler, "handleSaveScenario", function(iScenario, fnOperation){
			var bIsActivation = (iScenario === 1) ? true : false;
			assert.ok(bIsActivation, "handleSaveScenario must have been called for activation");
			assert.ok(oOnActivateImplStub.notCalled, "The activation must only be started after preparation");
			fnOperation();
			assert.ok(oOnActivateImplStub.calledOnce, "The activation must be started if preparation succeeds");
		});
		oMethods.handlers.onActivate();
	});
/* Todo: Move these unit tests to BeforeSaveHandler unit tests
	QUnit.test("Open Confirmation Dialog if warning exists and flag is set in manifest", function(assert) {
		var oMessagePopover = {
			getBinding: function(sItems) {
				var aIndices = [0], type;
				return {
					"aIndices": aIndices,
					"oList": [
						{
							"type": "Warning",
							"message": "Testing Warning Message"
						}
					]
				};
			}
		};

		var oPerformAfterSideEffectExecutionSpy = sinon.spy(oTemplateUtils.oServices.oApplication, "performAfterSideEffectExecution");
		var oMessagePopoverStub = sinon.stub(oTemplateUtils.oCommonUtils, "getDialogFragment", function(sName) {
			assert.strictEqual(sName, "sap.suite.ui.generic.template.fragments.MessagePopover", "Load correct fragment for getting Message Binding");
			return oMessagePopover;
		});
		var oOpenConfirmationDialog = sinon.stub(oStubForPrivate, "fnOpenConfirmationDialog", function() {});
		oStubForPrivate.onActivate();
		assert.ok(true, "onActivate function is called");
		assert.ok(oOpenConfirmationDialog.calledOnce, "fnOpenConfirmationDialog called");
		assert.ok(oPerformAfterSideEffectExecutionSpy.notCalled, "Perform After Side Effect Execution Not Called");
		oMessagePopoverStub.restore();
		oPerformAfterSideEffectExecutionSpy.restore();
	});

	QUnit.test("Do not open Confirmation dialog if there are no warnings, but flag is set to true", function(assert) {
		var oMessagePopover = {
			getBinding: function(sItems) {
				var aIndices = [0], type;
				return {
					"aIndices": aIndices,
					"oList": [
						{
							"type": "Error",
							"message": "Testing when there are no warning messages"
						}
					]
				};
			}
		};

		var oPerformAfterSideEffectExecutionSpy = sinon.spy(oTemplateUtils.oServices.oApplication, "performAfterSideEffectExecution");
		var oMessagePopoverStub = sinon.stub(oTemplateUtils.oCommonUtils, "getDialogFragment", function(sName) {
			assert.strictEqual(sName, "sap.suite.ui.generic.template.fragments.MessagePopover", "Load correct fragment for getting Message Binding");
			return oMessagePopover;
		});
		var oOpenConfirmationDialog = sinon.stub(oStubForPrivate, "fnOpenConfirmationDialog", function() {});
		oStubForPrivate.onActivate();
		assert.ok(true, "onActivate function is called");
		assert.ok(oOpenConfirmationDialog.notCalled, "fnOpenConfirmationDialog not called");
		assert.ok(oPerformAfterSideEffectExecutionSpy.calledOnce, "Perform After Side Effect Execution is called");
		oMessagePopoverStub.restore();
		oPerformAfterSideEffectExecutionSpy.restore();
	});

	QUnit.test("Do not open Confirmation dialog if flag is not set, but warnings exists", function(assert) {
		var oPerformAfterSideEffectExecutionSpy = sinon.spy(oTemplateUtils.oServices.oApplication, "performAfterSideEffectExecution");
		var oOpenConfirmationDialog = sinon.stub(oStubForPrivate, "fnOpenConfirmationDialog");
		bShowConfirmationOnDraftActivate = undefined;
		oStubForPrivate.onActivate();
		assert.ok(true, "onActivate function is called");
		assert.ok(oOpenConfirmationDialog.notCalled, "fnOpenConfirmationDialog not called");
		assert.ok(oPerformAfterSideEffectExecutionSpy.calledOnce, "Perform After Side Effect Execution is called");
		oPerformAfterSideEffectExecutionSpy.restore();
	});

	QUnit.test("Do not open Confirmation dialog if flag is set to false, but warnings exists", function(assert) {
		var oPerformAfterSideEffectExecutionSpy = sinon.spy(oTemplateUtils.oServices.oApplication, "performAfterSideEffectExecution");
		var oOpenConfirmationDialog = sinon.stub(oStubForPrivate, "fnOpenConfirmationDialog");
		bShowConfirmationOnDraftActivate = false;
		oStubForPrivate.onActivate();
		assert.ok(true, "onActivate function is called");
		assert.ok(oOpenConfirmationDialog.notCalled, "fnOpenConfirmationDialog not called");
		assert.ok(oPerformAfterSideEffectExecutionSpy.calledOnce, "Perform After Side Effect Execution is called");
		oPerformAfterSideEffectExecutionSpy.restore();
	});

	module("ObjectPage.controller.ControllerImplementation.fnOpenConfirmationDialog", {
		setup: fnCommonSetup,
		teardown: fnCommonTeardown
	});

	QUnit.test("Dialog opened successfully", function(assert) {
		var oScope = {};
		var aPersistentMessageModel = [];
		var sMessageType = "Warning";
		var oDialog = {};

		var oOpenSpy = sinon.spy(oDialog, "open");
		var oRemoveAllContentSpy = sinon.spy(oDialog, "removeAllContent");
		var oAddContentSpy = sinon.spy(oDialog, "addContent");
		var oSetContentHeightSpy = sinon.spy(oDialog, "setContentHeight");
		var oSetContentWidthSpy = sinon.spy(oDialog, "setContentWidth");
		var oSetVerticalScrollingSpy = sinon.spy(oDialog, "setVerticalScrolling");
		var oSetStateSpy = sinon.spy(oDialog, "setState");

		var oDialogController;
		var oGetDialogFragmentStub = sinon.stub(oTemplateUtils.oCommonUtils, "getDialogFragment", function(sName, oFragmentController) {
			assert.strictEqual(sName, "sap.suite.ui.generic.template.ObjectPage.view.fragments.ShowConfirmationOnDraftActivate",
				"Load correct fragment for confirmation dialog after Save in case of warnings");
			oDialogController = oFragmentController;
			return oDialog;
		});

		oStubForPrivate.fnOpenConfirmationDialog(oScope, aPersistentMessageModel, sMessageType);
		assert.ok(oOpenSpy.calledOnce, "Dialog must have been opened");
		assert.ok(oRemoveAllContentSpy.calledOnce, "removeAllContent function called");
		assert.ok(oAddContentSpy.calledOnce, "addContent function called");
		assert.ok(oSetContentHeightSpy.calledOnce, "setContentHeight function called");
		assert.ok(oSetContentWidthSpy.calledOnce, "setContentWidth function called");
		assert.ok(oSetVerticalScrollingSpy.calledOnce, "setVerticalScrolling function called");
		assert.ok(oSetStateSpy.calledOnce, "setState function called");

		oGetDialogFragmentStub.restore();
		oOpenSpy.restore();
		oRemoveAllContentSpy.restore();
		oAddContentSpy.restore();
		oSetContentHeightSpy.restore();
		oSetContentWidthSpy.restore();
		oSetVerticalScrollingSpy.restore();
		oSetStateSpy.restore();

		//Testing Dialog Controller
		var oCloseSpy = sinon.spy(oDialog, "close");
		oDialogController.onCancel();
		assert.ok(oCloseSpy.calledOnce, "Dialog must have been closed by Cancel");

		var oPerformAfterSideEffectExecutionSpy = sinon.spy(oTemplateUtils.oServices.oApplication, "performAfterSideEffectExecution");
		oDialogController.onSave();
		assert.ok(oPerformAfterSideEffectExecutionSpy.calledOnce, "Perform After Side Effect Execution called on save");

		oCloseSpy.restore();
	});
*/
	module("ObjectPage.controller.ControllerImplementation.deleteEntries", {
		setup: fnCommonSetup,
		teardown: fnCommonTeardown
	});

	QUnit.test("delete entries, while app is busy", function(assert) {
		bIsAppBusy = true;
		oMethods.handlers.deleteEntries();
		assert.ok(true, "delete entries could be called while app is busy without any effect");
	});

	function fnTestDeleteEntries(assert, aPaths) {
		var done = assert.async();
		var oBindingContext = { bindingContext: "TableBindingContext" };
		var sTableBindingPath = "bindingPath";
		var aContexts = [];
		var oDialog = {
			getModel: function() {
				return {
					setData: function() {

					}
				};
			},
			open: function() {

			}
		};
		var fnGetPath = function(sPath) { return sPath; };
		for (var i = 0; i < aPaths.length; i++) {
			aContexts.push({
				getPath: fnGetPath.bind(null, aPaths[i])
			});
		}
		var oButton = {
			setEnabled: function(bEnabled) {
			},
			getParent: function() {
				return {
					getParent: function() {
						return {
							getId: function() {
								return "sUiElementId";
							}
						};
					}
				};
			}
		};
		var oEvent = {
			getSource: function() {
				return oButton;
			}
		};
		var oEventForDialog = {
			getSource: function() {
				return {
					getParent: function() {
						return {
							close: function() {

							}
						};
					}
				};
			}
		};
		var oTable = {
			getTable: function() {
				return {
					attachEventOnce: jQuery.noop
				};
			},
			getBindingContext: function() {
				return oBindingContext;
			},
			getTableBindingPath: function() {
				return sTableBindingPath;
			},
			getId: function() {
				return "STTA_MP::sap.suite.ui.generic.template.ObjectPage.view.Details::STTA_C_MP_Product--to_ProductText::com.sap.vocabularies.UI.v1.LineItem::Table";
			},
			getParent: function() {
				return this;
			}
		};
		var oDialogController;
		var oGetDialogFragmentStub = sinon.stub(oTemplateUtils.oCommonUtils, "getDialogFragment", function(sName, oFragmentController) {
			assert.strictEqual(sName, "sap.suite.ui.generic.template.ObjectPage.view.fragments.TableDeleteConfirmation",
				"Load correct fragment for confirmation dialog after Save in case of warnings");
			oDialogController = oFragmentController;
			return oDialog;
		});

		var oIsSmartTableStub = sinon.stub(oTemplateUtils.oCommonUtils, "isSmartTable", function(oControl) {
			return false;
		});

		var oGetOwnerControlStub = sinon.stub(oTemplateUtils.oCommonUtils, "getOwnerControl", function(oSourceControl) {
			assert.strictEqual(oSourceControl, oButton, "source control must be the source of the event");
			return oTable;
		});
		var oGetSelectedContextsStub = sinon.stub(oTemplateUtils.oCommonUtils, "getSelectedContexts", function(oControl) {
			assert.strictEqual(oControl, oTable, "selected contexts must be determined for table");
			return aContexts;
		});

		var oIsEntryDeletableStub = sinon.stub(oStubForPrivate, "isEntryDeletable", function() {
			return true;
		});
		var oGetDeleteButtonInTableToolbar = sinon.stub(oStubForPrivate, "getDeleteButtonInTableToolbar", function(oSmartTable) {
			return {
				setEnabled: function(bEnabled) {
				}
			};
		});
		var oExecuteSideEffectsStub = sinon.stub(oTemplateUtils.oServices.oApplicationController, "executeSideEffects");
		var oDeletePromise, oThenStub, oDeleteEntitiesStub, oSetBusySpy, oErrorStub, oGetTextStub, oGetContentDensityClassStub;
		var oText = {};
		var aFailedPath = [];
		var sDensityClass = "§§§";
		var ofireSpy = sinon.spy(oTemplateUtils.oComponentUtils, "fire");
		if (aPaths.length > 0) {
			oDeletePromise = {};
			oThenStub = sinon.stub(oDeletePromise, "then", function(fnThen) {
//					var oRebindTableSpy = sinon.spy(oTable, "rebindTable");
				var oRefreshTableSpy = sinon.spy(oTemplateUtils.oCommonUtils, "refreshSmartTable");
				var oUnbindChildrenSpy = sinon.spy(oTemplateUtils.oServices.oViewDependencyHelper, "unbindChildren");
				fnThen(aFailedPath);
//					assert.ok(oRebindTableSpy.calledOnce, "Promise must have been sent to rebindTable");
				assert.ok(oRefreshTableSpy.calledOnce, "refreshSmartTable has been called after deletion");
				assert.ok(oUnbindChildrenSpy.calledOnce, "Promise must have been sent to unbindChildren");
				assert.ok(oUnbindChildrenSpy.calledWithExactly(oComponent), "component must have been passed to unbindChildren");
//					oRebindTableSpy.restore();
				oRefreshTableSpy.restore();
				oUnbindChildrenSpy.restore();
			});
			oDeleteEntitiesStub = sinon.stub(oTemplateUtils.oServices.oCRUDManager, "deleteEntities", function(aPath) {
				assert.deepEqual(aPath, aPaths, "given paths must be passed to delete");
				return oDeletePromise;
			});
			oSetBusySpy = sinon.spy(oBusyHelper, "setBusy");
		} else {
			oErrorStub = sinon.stub(MessageBox, "error", function(sText, oSettings) {
				assert.strictEqual(sText, oText, "CorrectText must be shown");
				assert.deepEqual(oSettings, {
					styleClass: sDensityClass
				}, "Error must be shown correctly");
			});
			oGetTextStub = sinon.stub(oTemplateUtils.oCommonUtils, "getText", function(sId) {
				//assert.strictEqual(sId, "ST_GENERIC_NO_ITEM_SELECTED", "Correct no item text must be retrieved");
				return oText;
			});
			oGetContentDensityClassStub = sinon.stub(oTemplateUtils.oCommonUtils, "getContentDensityClass", function() {
				return sDensityClass;
			});
		}
		oMethods.handlers.deleteEntries(oEvent);
		setTimeout(function(){
			if (aContexts.length > 0) {
				oDialogController.onDelete(oEventForDialog);
			}
			if (aPaths.length > 0) {
				assert.ok(ofireSpy.calledOnce, "fire called");
				assert.ok(oSetBusySpy.calledOnce, "setBusy must have been called once");
				assert.ok(oSetBusySpy.calledWithExactly(oDeletePromise), "delete promise must have been passed to setBusy");
				assert.ok(oThenStub.calledOnce, "Rebind table must have been attached to Promise");
				oDeleteEntitiesStub.restore();
				oSetBusySpy.restore();
				assert.ok(oExecuteSideEffectsStub.calledOnce, "executeSideEffects should be called once");
			} else {
				assert.notOk(ofireSpy.calledOnce, "fire not called");
				assert.ok(oErrorStub.calledOnce, "Error must have been displayed");
				oErrorStub.restore();
				oGetTextStub.restore();
				oGetContentDensityClassStub.restore();
				assert.ok(oExecuteSideEffectsStub.notCalled, "executeSideEffects should not be called if no entry is selected");
			}

			oGetOwnerControlStub.restore();
			oGetSelectedContextsStub.restore();
			oIsEntryDeletableStub.restore();
			oGetDeleteButtonInTableToolbar.restore();
			oExecuteSideEffectsStub.restore();
			ofireSpy.restore();
			oGetDialogFragmentStub.restore();
			oIsSmartTableStub.restore();
			// Testing for the Dialog
			done();
		});
	}

	QUnit.test("delete one entry", function(assert) {
		fnTestDeleteEntries(assert, ["test1"]);
	});

	QUnit.test("delete without any entry selected", function(assert) {
		fnTestDeleteEntries(assert, []);
	});

	module("adapt links for navigation", {
		setup: fnCommonSetup,
		teardown: fnCommonTeardown
	});

	QUnit.test("Function onBeforeSemanticObjectLinkPopoverOpens", function(assert) {
		ok(true, "Test - Always Good!");
	});

	QUnit.module("Event handler onShareObjectPageActionButtonPress", {
		beforeEach: function() {
			this.oOpenSharePopupStub = sinon.stub(ShareUtils, "openSharePopup");
			this.onShareObjectPageActionButtonPress = ControllerImplementation.getMethods(oViewProxy, oTemplateUtils, {}).handlers.onShareObjectPageActionButtonPress;
		},
		afterEach: function() {
			this.onShareObjectPageActionButtonPress = null;
			this.oOpenSharePopupStub.restore();
			this.oOpenSharePopupStub = null;
		}
	});

	QUnit.test("Calls the openSharePopup function of ShareUtils", function(assert) {
		// Arrange
		var oBy = {};
		var oEvent = {
			getSource: sinon.stub().returns(oBy)
		};

		// Act
		this.onShareObjectPageActionButtonPress(oEvent);

		// Assert
		assert.strictEqual(this.oOpenSharePopupStub.callCount, 1, "The function openSharePopup has been called once.");
		assert.strictEqual(this.oOpenSharePopupStub.firstCall.args[0], oTemplateUtils.oCommonUtils, "The CommonUtils instance has been passed to the function.");
		assert.strictEqual(this.oOpenSharePopupStub.firstCall.args[1], oBy, "The event source has been passed to the function.");
		assert.strictEqual(typeof this.oOpenSharePopupStub.firstCall.args[2], "object", "An object instance has been passed to the function.");
	});

	function getFragmentController(title, subtitle, assert) {
		// Arrange
		var oOpenSharePopupStub = sinon.stub(ShareUtils, "openSharePopup");
		var oEvent = {
			getSource: function() {
				return {};
			}
		};

		var oGetPropertyStub = sinon.stub(oTemplatePrivateModel, "getProperty");
		oGetPropertyStub.withArgs("/objectPage/headerInfo/objectTitle").returns(title);
		oGetPropertyStub.withArgs("/objectPage/headerInfo/objectSubtitle").returns(subtitle);

		ControllerImplementation.getMethods(oViewProxy, oTemplateUtils, this.oController).handlers.onShareObjectPageActionButtonPress(oEvent);

		// Assert
		assert(oOpenSharePopupStub.firstCall.args[2]);

		// Cleanup
		oGetPropertyStub.restore();
		oOpenSharePopupStub.restore();
	}

	QUnit.module("Fragment controller functions", {
		beforeEach: function() {
			this.oController = {};
		},
		afterEach: function() {
			this.oController = null;
		}
	});

	QUnit.test("The fragmentController's shareEmailPressed function with title and subtitle", function(assert) {
		// Arrange
		var oTriggerEmailStub = sinon.stub(MobileLibrary.URLHelper, "triggerEmail");

		// Act
		getFragmentController.call(this, "FancyTitle", "FancySubtitle", function(oFragmentController) {
			oFragmentController.shareEmailPressed();

			// Assert
			assert.strictEqual(oTriggerEmailStub.callCount, 1, "The URLHelper's triggerEmail function has been called once.");
			assert.strictEqual(oTriggerEmailStub.firstCall.args[0], null, "The correct destination e-mail parameter has been passed.");
			assert.strictEqual(oTriggerEmailStub.firstCall.args[1], "FancyTitle - FancySubtitle", "The correct subject parameter has been passed.");

			// Cleanup
			oTriggerEmailStub.restore();
		});
	});

	QUnit.test("The fragmentController's shareEmailPressed function with title and without subtitle", function(assert) {
		// Arrange
		var oTriggerEmailStub = sinon.stub(MobileLibrary.URLHelper, "triggerEmail");

		// Act
		getFragmentController.call(this, "FancyTitle", "", function(oFragmentController) {
			oFragmentController.shareEmailPressed();

			// Assert
			assert.strictEqual(oTriggerEmailStub.firstCall.args[1], "FancyTitle", "The correct subject parameter has been passed.");

			// Cleanup
			oTriggerEmailStub.restore();
		});
	});

	QUnit.test("The fragmentController's shareJamPressed function", function(assert) {
		// Arrange
		var oStub = sinon.stub(ShareUtils, "openJamShareDialog");

		// Act
		getFragmentController.call(this, "FancyTitle", "FancySubtitle", function(oFragmentController) {
			oFragmentController.shareJamPressed();

			// Assert
			assert.strictEqual(oStub.callCount, 1, "The function openJamShareDialog has been called once.");
			assert.strictEqual(oStub.firstCall.args[0], "FancyTitle FancySubtitle", "The function openJamShareDialog has been called with the correct parameter.");

			// Cleanup
			oStub.restore();
		});
	});

	QUnit.test("The fragmentController's getModelData function", function(assert) {
		// Arrange
		// Act
		getFragmentController.call(this, "FancyTitle", "FancySubtitle", function(oFragmentController) {
			var oShareInfo = oFragmentController.getModelData();

			// Assert
			assert.strictEqual(oShareInfo.title, "FancyTitle", "The title property has the correct value.");
			assert.strictEqual(oShareInfo.subtitle, "FancySubtitle", "The subtitle property has the correct value.");
			assert.strictEqual(oShareInfo.customUrl, document.URL, "The customUrl property has the correct function reference.");
		});
	});
	module("ObjectPage.controller.ControllerImplementation.fnAdaptBindingParamsForInlineCreate", {
		setup: fnCommonSetup,
		teardown: fnCommonTeardown
	});
	QUnit.test("The fnAdaptBindingParamsForInlineCreate function", function(assert) {
		// Arrange
		// Case 1: Default Sorting
		var oBindingParams = {
			batchGroupId: "facets",
			expand: "to_Language,to_ProductSalesPrice,to_ProductSalesRevenue",
			select: "LanguageForEdit",
			sorter: [],
			filters: []
		};
		var oSmartTable = {
			data: function(key) {
				if (key === "disableInlineCreateSort") {
					return "false";
				}
				if (key === "inlineCreate") {
					return "true";
				}
			},
			getTable: function() {
				return {};
			}
		};
		var oEvent = {
			getSource: function() {
				return oSmartTable;
			},
			getParameter: function() {
				return oBindingParams;
			}
		};
		var oIsAnalyticalTableStub = sinon.stub(oTemplateUtils.oCommonUtils, "isAnalyticalTable", function(oControl) {
			return false;
		});
		oMethods.handlers.onBeforeRebindDetailTable(oEvent);

		assert.strictEqual(oBindingParams.sorter[0].sPath, "HasActiveEntity", "The function fnAdaptBindingParamsForInlineCreate has been called with default sorting");
		// Case 2: Disable default sorting
		oBindingParams = {
			batchGroupId: "facets",
			expand: "to_Language,to_ProductSalesPrice,to_ProductSalesRevenue",
			select: "LanguageForEdit",
			sorter: [],
			filters: []
		};
		oSmartTable = {
			data: function(key) {
				if (key === "disableInlineCreateSort") {
					return "true";
				}
				if (key === "inlineCreate") {
					return "true";
				}
			},
			getTable: function() {
				return {};
			}
		}
		oMethods.handlers.onBeforeRebindDetailTable(oEvent);

		assert.strictEqual(oBindingParams.sorter.length,0, "The function fnAdaptBindingParamsForInlineCreate has been called with disable default sorting");
	});
/* Deactivated, since hiding functionality has been refactored. Needs to be reworked.
	module("Qunit to test function fnHideSmartTableColumns", {
		setup: fnCommonSetup,
		teardown: fnCommonTeardown
	});
	// First test Path = "", this means Hide the column and Lineitem with qualifier exists
	QUnit.test("Testing function fnHideSmartTableColumns", function(assert) {
		var oSmartTable = {
			getModel: function() {
				return {
					getMetaModel: function () {
						return {
							getODataEntitySet: function () {
								return {
									"entityType": "STTA_PROD_MAN.STTA_C_MP_ProductTextType"
								};
							},
							getODataEntityType: function () {
								return {
									"com.sap.vocabularies.UI.v1.LineItem#Test" : [
										{
											"com.sap.vocabularies.UI.v1.Hidden": {
												"Path": ""
											},
											"Value": {
												"Path": "LanguageForEdit"
											},
											"RecordType": "com.sap.vocabularies.UI.v1.DataField"
										}
									],
									"com.sap.vocabularies.UI.v1.LineItem" : [
										{
											"com.sap.vocabularies.UI.v1.Hidden": {
												"Path": ""
											},
											"Value": {
												"Path": "LanguageForEdit"
											},
											"RecordType": "com.sap.vocabularies.UI.v1.DataField"
										}
									]
								};
							},
							getODataAssociationSetEnd: function() {
								return {
									"entitySet": "STTA_C_MP_Product"
								}
							}
						};
					}
				};
			},
			getEntitySet: function() {
				return "STTA_C_MP_ProductText";
			},
			deactivateColumns: function() {
				return true;
			},
			getCustomData: function() {
				return [{
					getKey: function() {
						return "lineItemQualifier";
					},
					getValue: function() {
						return "Test";
					}
				}];
			}
		};
		var oParentContext = {
			getProperty: function() {
				return true;
			}
		};
		var aHiddenColumns = ["LanguageForEdit"];
		var oSpy = sinon.spy(oSmartTable,"deactivateColumns");
		oStubForPrivate.fnHideSmartTableColumns(oSmartTable, oParentContext);
		assert.ok(oSpy.calledWithExactly(aHiddenColumns), "Path is emtpy and Lineitem with qualifier exists");
		oSpy.restore();

		// Second test Path="to_Product/to_Supplier/Edit_ac" and no custom data exists
		oSmartTable = {
			getModel: function() {
				return {
					getMetaModel: function () {
						return {
							getODataEntitySet: function () {
								return {
									"entityType" : "STTA_PROD_MAN.STTA_C_MP_ProductTextType"
								};
							},
							getODataEntityType: function () {
								return {
									"com.sap.vocabularies.UI.v1.LineItem" : [
										{
											"com.sap.vocabularies.UI.v1.Hidden": {
												"Path": "to_Product/to_Supplier/Edit_ac"
											},
											"Value": {
												"Path": "LanguageForEdit"
											},
											"RecordType": "com.sap.vocabularies.UI.v1.DataField"
										},
										{
											"Value": {
												"Path": "Language"
											},
											"RecordType": "com.sap.vocabularies.UI.v1.DataField"
										}
									],
									"navigationProperty": [
										{
											"name": "to_Product"
										}
									]
								};
							},
							getODataAssociationSetEnd: function() {
								return {
									"entitySet": "STTA_C_MP_Product"
								}
							}
						};
					}
				};
			},
			getEntitySet: function() {
				return "STTA_C_MP_ProductText";
			},
			deactivateColumns: function(aHiddenColumns) {
				return true;
			},
			getCustomData: function() {
				return [];
			}
		};
		oParentContext = {
			getProperty: function() {
				return true;
			}
		};
		aHiddenColumns = ["LanguageForEdit"];
		oSpy = sinon.spy(oSmartTable,"deactivateColumns");
		oStubForPrivate.fnHideSmartTableColumns(oSmartTable, oParentContext);
		assert.ok(oSpy.calledWithExactly(aHiddenColumns), "Correct path exists, custom data does not exists");
		oSpy.restore();

		//Third Test -if Path does not contain association to header
		oSmartTable = {
			getModel: function() {
				return {
					getMetaModel: function () {
						return {
							getODataEntitySet: function () {
								return {
									"entityType" : "STTA_PROD_MAN.STTA_C_MP_ProductTextType"
								};
							},
							getODataEntityType: function () {
								return {
									"com.sap.vocabularies.UI.v1.LineItem" : [
										{
											"com.sap.vocabularies.UI.v1.Hidden": {
												"Path": "Edit_ac"
											},
											"Value": {
												"Path": "LanguageForEdit"
											},
											"RecordType": "com.sap.vocabularies.UI.v1.DataField"
										},
										{
											"com.sap.vocabularies.UI.v1.Hidden": {
												"Path": "to_Product/Edit_ac"
											},
											"Value": {
												"Path": "Language"
											},
											"RecordType": "com.sap.vocabularies.UI.v1.DataField"
										}
									],
									"navigationProperty": [
										{
											"name": "to_Product"
										}
									]
								};
							},
							getODataAssociationSetEnd: function() {
								return {
									"entitySet": "STTA_C_MP_Product"
								}
							}
						};
					}
				};
			},
			getEntitySet: function() {
				return "STTA_C_MP_ProductText";
			},
			deactivateColumns: function(aHiddenColumns) {
				return true;
			},
			getCustomData: function() {
				return [{
					getKey: function() {
						return "";
					},
					getValue: function() {
						return "";
					}
				}];
			}
		};
		oParentContext = {
			getProperty: function() {
				return true;
			}
		};
		aHiddenColumns = ["Language"];
		oSpy = sinon.spy(oSmartTable,"deactivateColumns");
		oStubForPrivate.fnHideSmartTableColumns(oSmartTable, oParentContext);
		assert.ok(oSpy.calledWithExactly(aHiddenColumns), "Path does not contain association to header");
		oSpy.restore();

		// Fourth test navigationProperty object does not exist
		oSmartTable = {
				getModel: function() {
					return {
						getMetaModel: function () {
							return {
								getODataEntitySet: function () {
									return {
										"entityType" : "STTA_PROD_MAN.STTA_C_MP_ProductTextType"
									};
								},
								getODataEntityType: function () {
									return {
										"com.sap.vocabularies.UI.v1.LineItem" : [
											{
												"com.sap.vocabularies.UI.v1.Hidden": {
													"Path": "to_Product/Edit_ac"
												},
												"Value": {
													"Path": "LanguageForEdit"
												},
												"RecordType": "com.sap.vocabularies.UI.v1.DataField"
											}
										]
									};
								},
								getODataAssociationSetEnd: function() {
								return {
									"entitySet": "STTA_C_MP_Product"
								}
							}
							};
						}
					};
				},
				getEntitySet: function() {
					return "STTA_C_MP_ProductText";
				},
				deactivateColumns: function(aHiddenColumns) {
					return true;
				},
				getCustomData: function() {
				return [{
					getKey: function() {
						return "";
					},
					getValue: function() {
						return "";
					}
				}];
			}
			};
			oParentContext = {
				getProperty: function() {
					return true;
				}
			};
			aHiddenColumns = [];
			oSpy = sinon.spy(oSmartTable,"deactivateColumns");
			oStubForPrivate.fnHideSmartTableColumns(oSmartTable, oParentContext);
			assert.ok(oSpy.calledWithExactly(aHiddenColumns), "NavigationProperty object does not exist");
			oSpy.restore();

			//Fifth test - Hidden contains a Boolean value
			var oSmartTable = {
			getModel: function() {
				return {
					getMetaModel: function () {
						return {
							getODataEntitySet: function () {
								return {
									"entityType": "STTA_PROD_MAN.STTA_C_MP_ProductTextType"
								};
							},
							getODataEntityType: function () {
								return {
									"com.sap.vocabularies.UI.v1.LineItem" : [
										{
											"com.sap.vocabularies.UI.v1.Hidden": {
												"Bool": "true"
											},
											"Value": {
												"Path": "LanguageForEdit"
											},
											"RecordType": "com.sap.vocabularies.UI.v1.DataField"
										}
									]
								};
							}
						};
					}
				};
			},
			getEntitySet: function() {
				return "STTA_C_MP_ProductText";
			},
			deactivateColumns: function() {
				return true;
			},
			getCustomData: function() {
				return [{
					getKey: function() {
						return "";
					},
					getValue: function() {
						return "";
					}
				}];
			}
		};
		oParentContext = {
			getProperty: function() {
				return true;
			}
		};
		aHiddenColumns = ["LanguageForEdit"];
		oSpy = sinon.spy(oSmartTable,"deactivateColumns");
		oStubForPrivate.fnHideSmartTableColumns(oSmartTable, oParentContext);
		assert.ok(oSpy.calledWithExactly(aHiddenColumns), "Hidden annotation contains boolean value");
		oSpy.restore();
	}); */
});
