/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

// Provides static functions to call OData actions (bound/import) and functions (bound/import)
sap.ui.define([
		'sap/m/MessageBox',
		'sap/fe/factory/UI5ControlFactory',
		'sap/ui/mdc/base/Field',
		'sap/m/Label',
		"sap/ui/model/json/JSONModel",
		'sap/ui/core/XMLTemplateProcessor',
		'sap/ui/core/util/XMLPreprocessor',
		'sap/ui/core/Fragment',
		'sap/fe/actions/messageHandling'],
	function (MessageBox, UI5ControlFactory,  Field, Label, JSONModel, XMLTemplateProcessor, XMLPreprocessor, Fragment, messageHandling) {
		'use strict';

		/**
		 * Calls a bound action for one or multiple contexts
		 * @function
		 * @static
		 * @name sap.fe.actions.operations.callBoundAction
		 * @memberof sap.fe.actions.operations
		 * @param {string} sActionName The name of the action to be called
		 * @param {sap.ui.model.odata.v4.Context} contexts Either one context or an array with contexts for which the action shall be called
		 * @param {map} [mParameters] Optional, can contain the following attributes:
		 * @param {map} [mParameters.actionParameters] a map of parameters to be sent for every action call
		 * @param {boolean} [mParameters.showActionParameterDialog] [false] if set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
		 * @param {string} [mParameters.label] a human-readable label for the action
		 * @param {string} [mParameters.invocationGrouping] [Isolated] mode how actions shall be called: Changeset to put all action calls into one changeset, Isolated to put them into separate changesets
		 * @param {function} [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
		 * @param {sap.ui.core.Element} [mParameters.parentControl] if specified the dialogs are added as dependent of the parent control
		 * @returns {Promise} Promise resolves with an array of response objects (TODO: to be changed)
		 * @private
		 * @sap-restricted
		 */

		function callBoundAction(sActionName, contexts, oModel, mParameters) {
			if (!contexts || contexts.length === 0) { //In Freestyle apps bound actions can have no context
				return Promise.reject("Bound actions always requires at least one context");
			}
			mParameters = mParameters || {};
			// we expect either one context or an array of contexts
			if (Array.isArray(contexts)) {
				mParameters.bReturnAsArray = true;
			} else {
				contexts = [contexts];
			}
			var oMetaModel = oModel.getMetaModel(),
				sActionPath = oMetaModel.getMetaPath(contexts[0].getPath()) + '/' + sActionName,
				oBoundAction = oMetaModel.createBindingContext(sActionPath + '/@$ui5.overload/0');
			mParameters.aContexts = contexts;
			return callAction(sActionName, oModel, oBoundAction, mParameters);
		}

		/**
		 * Calls an action import
		 * @function
		 * @static
		 * @name sap.fe.actions.operations.callActionImport
		 * @memberof sap.fe.actions.operations
		 * @param {string} sActionName The name of the action import to be called
		 * @param {sap.ui.model.odata.v4.ODataModel} oModel An instance of an OData v4 model
		 * @param {map} [mParameters] Optional, can contain the following attributes:
		 * @param {map} [mParameters.actionParameters] a map of parameters to be sent with the action import
		 * @param {string} [mParameters.label] a human-readable label for the action
		 * @param {boolean} [mParameters.showActionParameterDialog] [false] if set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
		 * @param {function} [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
		 * @returns {Promise} Promise resolves with an array of response objects (TODO: to be changed)
		 * @private
		 * @sap-restricted
		 */
		function callActionImport(sActionName, oModel, mParameters) {
			if (!oModel) {
				return Promise.reject("Action expects a model/context for execution");
			}
			var oMetaModel = oModel.getMetaModel(),
				sActionPath = oModel.bindContext("/" + sActionName).getPath(),
				oActionImport = oMetaModel.createBindingContext(sActionPath + '/0');
			return callAction(sActionName, oModel, oActionImport, mParameters);
		}

		/*
		 Not yet implemented
		 function callBoundFunction(mParameters){
		 }

		 function callFunctionImport(mParameters){
		 }
		 */
		function callAction(sActionName, oModel, oAction, mParameters) {
			return new Promise(function(resolve, reject) {
				mParameters = mParameters || {};
				var aActionParameters = mParameters.actionParameters || [],
					mActionExecutionParameters = {},
					bIsCriticalAction, fnDialog, oActionPromise,
					sActionLabel = mParameters.label,
					bShowActionParameterDialog = mParameters.showActionParameterDialog,
					aContexts = mParameters.aContexts,
					bIsCreateAction = mParameters.bIsCreateAction;

				if (!oAction) {
					reject("Action not found");
				}
				bIsCriticalAction = getIsActionCritical(sActionName, oModel);
				if (bShowActionParameterDialog || aActionParameters.length > 0) {
					aActionParameters = prepareActionParameters(oAction, aActionParameters);
					if (!aActionParameters || aActionParameters.length === 0) {
						bShowActionParameterDialog = false;
					}
				}
				if (bShowActionParameterDialog) {
					fnDialog = showActionParameterDialog;
				} else if (bIsCriticalAction) {
					fnDialog = confirmCriticalAction;
				}
				mActionExecutionParameters = {
					fnOnSubmitted: mParameters.onSubmitted,
					actionName: sActionName,
					model: oModel,
					aActionParameters: aActionParameters
				};
				if (oAction.getObject('$IsBound')) {
					mActionExecutionParameters.aContexts = aContexts;
					mActionExecutionParameters.mBindingParameters = mParameters.mBindingParameters;
					mActionExecutionParameters.bGrouped = mParameters.invocationGrouping === 'ChangeSet';
					mActionExecutionParameters.bReturnAsArray = mParameters.bReturnAsArray;
				}
				if (bIsCreateAction) {
					mActionExecutionParameters.bIsCreateAction = bIsCreateAction;
				}
				if (fnDialog) {
					oActionPromise = fnDialog(sActionLabel, aActionParameters, oAction, mParameters.parentControl, mActionExecutionParameters);
				} else {
					oActionPromise = _executeAction(mActionExecutionParameters);
				}
				return oActionPromise.then(function(oOperationResult) {
					if (!oOperationResult) {
						reject(oOperationResult);
					}
					resolve(oOperationResult);
				}).catch(function(oOperationResult) {
					reject(oOperationResult);
				});
			});
		}
		function confirmCriticalAction(sActionName, sActionLabel) {
			return new Promise(function (resolve, reject) {
				var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe"),
					sConfirmationText;

				if (oResourceBundle.hasText("SAPFE_ACTION_CONFIRM|" + sActionName)) {
					sConfirmationText = oResourceBundle.getText("SAPFE_ACTION_CONFIRM|" + sActionName);
				} else {
					sConfirmationText = oResourceBundle.getText("SAPFE_ACTION_CONFIRM");
				}

				MessageBox.confirm(sConfirmationText, {
					onClose: function (sAction) {
						if (sAction === MessageBox.Action.OK) {
							resolve(true);
						}
						resolve(false);
					},
					title: sActionLabel || oResourceBundle.getText("SAPFE_ACTION_CONFIRM_TITLE")
				});
			});
		}
		function showActionParameterDialog(sActionLabel, aActionParameters, oActionContext, oParentControl, mParameters) {
			var sPath = mParameters.aContexts ? mParameters.aContexts[0].getPath() : ('/' + oActionContext.getPath().split('/')[1]),
				metaModel = oActionContext.getModel().oModel.getMetaModel(),
				entitySetContext = metaModel.createBindingContext(sPath),
				sActionNamePath = oActionContext.getObject("$IsBound") ? oActionContext.getPath().split("/@$ui5.overload/0")[0] : oActionContext.getPath().split("/0")[0],
				actionNameContext = metaModel.createBindingContext(sActionNamePath);
			return new Promise(function (resolve, reject) {
				var oFragment = XMLTemplateProcessor.loadTemplate('sap/fe/controls/ActionParameterDialog', 'fragment'),
					oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe"),
					oParameterModel = new JSONModel({
						$valueState : {},
						$valueStateText : {}
					}),
					oController = {
						handleChange : function(oEvent, sParameter){
							var sValue = oEvent.getParameter("value");
							var bValid = oEvent.getParameter("valid");

							if (bValid && sValue != "") {
								oParameterModel.setProperty("/$valueState/" + sParameter, 'None');
								oParameterModel.setProperty("/$valueStateText/" + sParameter, '');
							}
						}
					};

				return XMLPreprocessor.process(oFragment, {}, {
					bindingContexts: {
						action: oActionContext,
						actionName: actionNameContext,
						entitySet: entitySetContext
					},
					models: {
						action: oActionContext.getModel(),
						actionName: actionNameContext.getModel(),
						entitySet: entitySetContext.getModel()
					}
				}).then(function (oFragment) {

						// TODO: move the dialog into the fragment and move the handlers to the oController
						Fragment.load({definition: oFragment, controller : oController}).then(function (oDialogContent) {
							var oDialog = UI5ControlFactory.getDialogControl({
								title: sActionLabel || oResourceBundle.getText("SAPFE_ACTION_PARAMETER_DIALOG_TITLE"),
								content: [oDialogContent],
								escapeHandler: function(oPromise) {
									oDialog.close();
									oDialog.destroy();
									resolve(false);
								},
								beginButton: {
									text: sActionLabel || oResourceBundle.getText("SAPFE_OK"),
									type: "Emphasized",
									press: function (oEvent) {
										var oCreateButton = oEvent.getSource(),
											bError, i, value,
											aFormElements = oDialogContent.getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");
										oCreateButton.setEnabled(false);
										oDialog.setBusy(true);
										var getRequiredProperties = function(aElements) {
											var aRequiredFields = [];
											for (i = 0; i < aElements.length; i++) {
												var oField = aElements[i].getFields()[0];
												if (oField.getProperty("required") && oField.mBindingInfos.value.binding) {
													aRequiredFields.push(oField.mBindingInfos.value.binding.getPath());
												}
											}
											return aRequiredFields;
										};
										var aRequiredProperties = getRequiredProperties(aFormElements);
										var sParameterBinding;
										for (i = 0; i < aActionParameters.length; i++) {
											sParameterBinding = "/" + aActionParameters[i].$Name;
											value = oParameterModel.getProperty(sParameterBinding);
											if (!value && aRequiredProperties.indexOf(sParameterBinding) >= 0) {
												bError = true;
												oParameterModel.setProperty("/$valueState/" + aActionParameters[i].$Name, 'Error');
												oParameterModel.setProperty("/$valueStateText/" + aActionParameters[i].$Name, oResourceBundle.getText("SAPFE_ACTION_PARAMETER_REQUIRED"));
											} else {
												aActionParameters[i].value = value;
											}

										}

										if (!bError) {
											// TODO: due to using the search and value helps on the action dialog transient messages could appear
											// we need an UX design for those to show them to the user - for now remove them before continuing
											messageHandling.removeUnboundTransitionMessages();

											return _executeAction(mParameters).then(function(oOperation) {
												oDialog.close();
												resolve(oOperation);
											}).catch(function(oError) {
												oDialog.setBusy(false);
												oCreateButton.setEnabled(true);
												messageHandling.showUnboundMessages();
											});
										}

									}
								},
								endButton: {
									text: oResourceBundle.getText("SAPFE_ACTION_PARAMETER_DIALOG_CANCEL"),
									press: function () {
										oDialog.close();
										resolve(false);
									}
								},
								afterClose: function() {
									oDialog.destroy();
								}
							});
							oDialog.setModel(oActionContext.getModel().oModel);
							oDialog.setModel(oParameterModel, "paramsModel");
							oDialog.bindElement({
								path : '/',
								model : 'paramsModel'
							});

							if (oParentControl){
								// if there is a parent control specified add the dialog as dependent
								oParentControl.addDependent(oDialog);
							}

							oDialog.open();

						});
					});
			});
		}

		function prepareActionParameters(oAction, aPredefinedParameters) {
			// check if parameters exist at all
			var aParameters = getActionParameters(oAction);
			aPredefinedParameters = aPredefinedParameters || [];

			if (aPredefinedParameters.length > 0) {
				// TODO: merge the predefined once with the real existing one
			}

			return aParameters;
		}

		function getActionParameters(oAction) {
			var aParameters = oAction.getObject("$Parameter") || [];
			if (aParameters && aParameters.length) {
				if (oAction.getObject("$IsBound")) {
					//in case of bound actions, ignore the first parameter and consider the rest
					return aParameters.slice(1, aParameters.length) || [];
				}
			}
			return aParameters;
		}

		function getIsActionCritical(sActionName, oModel) {
			return oModel.getMetaModel().getObject("/" + sActionName + '@com.sap.vocabularies.Common.v1.IsActionCritical');
		}

		function _executeAction(mParameters) {
			var aContexts = mParameters.aContexts || [],
				oModel = mParameters.model,
				aActionParameters = mParameters.aActionParameters || [],
				sActionName = mParameters.actionName,
				fnOnSubmitted = mParameters.fnOnSubmitted,
				bIsCreateAction = mParameters.bIsCreateAction,
				bActionParametersExist = false,
				oAction;
			function fnDifferentiate(promise) {
				return promise.then(function (response) {
					return {response: response, status: "resolved"};
				},
				function (response) {
					return {response: response, status: "rejected"};
				});
			}
			function setActionParameterDefaultValue() {
				if (aActionParameters && aActionParameters.length) {
					bActionParametersExist = true;
					for (var j = 0; j < aActionParameters.length; j++) {
						if (!aActionParameters[j].value && aActionParameters[j].$Nullable === false) {
							switch (aActionParameters[j].$Type) {
								case "Edm.String":
									aActionParameters[j].value = "";
									break;
								case "Edm.Boolean":
									aActionParameters[j].value = false;
									break;
								case "Edm.Byte":
								case "Edm.Int16":
								case "Edm.Int32":
								case "Edm.Int64":
									aActionParameters[j].value = 0;
									break;
								// tbc
								default:
									break;
							}
						}
						oAction.setParameter(aActionParameters[j].$Name, aActionParameters[j].value);
					}
				}
			}
				if (aContexts.length) {
					return new Promise(function(resolve, reject) {
						var mBindingParameters = mParameters.mBindingParameters,
							bGrouped = mParameters.bGrouped,
							bReturnAsArray = mParameters.bReturnAsArray,
							aActionPromises = [], i, sGroupId,
							fnExecuteAction = function (oAction, index) {
								setActionParameterDefaultValue();
								// TODO: workaround as long as the v4 model does not allow multiple changesets within one $batch
								sGroupId = index && !bGrouped ? '$auto.' + index : undefined;
								aActionPromises.push(oAction.execute(sGroupId));
							};

						for (i = 0; i < aContexts.length; i++) {
							oAction = oModel.bindContext(sActionName + '(...)', aContexts[i], mBindingParameters);
							fnExecuteAction(oAction, (aContexts.length <= 1 ? null : i));
						}

						// trigger onSubmitted "event"
						(fnOnSubmitted || jQuery.noop)(aActionPromises);

						Promise.all(aActionPromises.map(fnDifferentiate)).then(function (results) {
							var aRejectedItems = [], aResolvedItems = [], iResultCount;
							for (iResultCount = 0; iResultCount < results.length; iResultCount++) {
								if (results[iResultCount].status === "rejected") {
									aRejectedItems.push(results[iResultCount].response);
								}
								if (results[iResultCount].status === "resolved") {
									if (bIsCreateAction && bActionParametersExist) { //only used for NewAction
										results[iResultCount].bConsiderDocumentModified  = true;
										aResolvedItems.push(results[iResultCount]);
									} else {
										aResolvedItems.push(results[iResultCount].response);
									}
								}
							}
							if (!results || (results && results.length === 0)) {
								reject(true);
							}
							if (aRejectedItems.length === 0) {
								if (bReturnAsArray) {
									resolve(aResolvedItems);
								} else {
									// context is given directly without an array so also no array is expected
									resolve(aResolvedItems[0]);
								}
							} else {
								reject({
									resolvedItems: aResolvedItems,
									rejectedItems: aRejectedItems
								});
							}
						});
					});
				} else {
					var oActionPromise;
					oAction = oModel.bindContext("/" + sActionName + '(...)');
					setActionParameterDefaultValue();
					oActionPromise = oAction.execute('actionImport');
					oModel.submitBatch('actionImport');
					// trigger onSubmitted "event"
					(fnOnSubmitted || jQuery.noop)(oActionPromise);
					return oActionPromise;
				}
		}

		/**
		 * Static functions to call OData actions (bound/import) and functions (bound/import)
		 *
		 * @namespace
		 * @alias sap.fe.actions.operations
		 * @public
		 * @sap-restricted
		 * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
		 * @since 1.56.0
		 */
		var operations = {
			callBoundAction: callBoundAction,
			callActionImport: callActionImport
			//callBoundFunction : callBoundAction,
			//callFunctionImport : callFunctionImport
		};
		return operations;


	}
);