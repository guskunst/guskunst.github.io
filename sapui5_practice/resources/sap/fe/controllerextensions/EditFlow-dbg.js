/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
/* global Promise */
sap.ui.define(['sap/ui/core/mvc/ControllerExtension',
			'sap/fe/actions/messageHandling',
			'sap/ui/core/XMLTemplateProcessor',
			'sap/ui/core/util/XMLPreprocessor',
			'sap/ui/core/Fragment',
			'sap/fe/actions/sticky',
			'sap/base/Log',
			'sap/m/Text',
			'sap/m/Button',
			"sap/m/Dialog"
		], function (ControllerExtension, messageHandling, XMLTemplateProcessor, XMLPreprocessor, Fragment, sticky, Log, Text, Button, Dialog) {
		'use strict';

		// TODO: we are not able to extend the transaction controllerExtension and can't create instances of any
		// controllerExtension within this controllerExtension - therefore as a first workaround we rely on the
		// existence of this.base.transaction and this.base.routing

		var sFragmentName = 'sap.fe.controls.field.DraftPopOverAdminData',
			oPopoverFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, 'fragment');

		var Extension = ControllerExtension.extend('sap.fe.controllerextensions.EditFlow', {

			/**
			 * Create new document
			 * @function
			 * @name createDocument
			 * @memberof sap.fe.controllerextensions.EditFlow
			 * @param {Promise|sap.ui.model.odata.v4.ODataListBinding} vListBinding  ODataListBinding object or a promise that resolve to it
			 * @param {map} [mParameters] Optional, can contain the following attributes:
			 * @param {String} creationMode the creation mode to be used
			 * 					NewPage - the created document is shown in a new page, depending on metadata Sync, Async or Deferred is used
			 * 					Sync - the creation is triggered, once the document is created the navigation is done
			 * 					Async - the creation and the navigation to the instance is done in parallel
			 * 					Deferred - the creation is done at the target page
			 * 					Inline - The creation is done inline (in a table)
			 * 					CreationRow - The creation is done with the special creation row
			 * 					busyHandling - whether busy handling should be done or not
			 * @param {Object} creationRow instance of the creation row (TODO: get rid but use list bindings only)
			 * @returns {String} the draft admin owner string to be shown
			 */
			createDocument: function (vListBinding, mParameters) {
				var that = this;

				function handleSideEffects(oListBinding, oCreationPromise) {
					// use request sideeffect of the header context to refresh the list binding to
					// enable that further items can be created
					// TODO: once the list binding supports more than one new item we can remove
					// this coding
					// on creation of an item on object page, there could be side effects required

					if (oCreationPromise) {
						var oBindingContext = that.base.getView().getBindingContext();
						oCreationPromise.then(function () {
							that.requestSideEffects(oListBinding.getPath(), oBindingContext);
						}, function(oNewContext){
							if (oNewContext.created){
								// a v4 context is returned means the creation failed but the model will try it again
								// with the next patch so we have to listen to the created promise to request the Side
								// effects once the creation succeeded
								oNewContext.created().then(function(){
									that.requestSideEffects(oListBinding.getPath(), oBindingContext);
								});
							}
						});
					}
				}

				return new Promise(function (resolve, reject) {
					var oGetListBinding,
						sProgrammingModel,
						oListBinding, oModel;

					mParameters = mParameters || {};

					if (typeof vListBinding === 'object') {
						// we already get a list binding use this one
						oGetListBinding = Promise.resolve(vListBinding);
					} else {
						// we need to get the list binding via named binding
						oGetListBinding = that.base.getView().getModel().getBindingForReference(vListBinding);
					}

					oGetListBinding.then(function (listBinding) {
						oListBinding = listBinding;
						oModel = oListBinding.getModel();
						var sCreationMode = mParameters.creationMode;

						// TODO: we will delete this once the UI change for the SD app is created and delivered
						// fow now get the inplace creation mode from the manifest, TODO: shall be a UI change
						if ((!sCreationMode || sCreationMode === 'NewPage') && that.base.getView().getViewData()._creationMode === 'Inplace') {
							sCreationMode = 'Inline';
						}

						return that.base.transaction.getProgrammingModel(oListBinding).then(function (programmingModel) {
							sProgrammingModel = programmingModel;
							if (sCreationMode && sCreationMode !== 'NewPage') {
								// use the passed creation mode
								return sCreationMode;
							} else {
								// we need to determine the creation mode
								switch (sProgrammingModel) {
									case 'Draft' :
										var oMetaModel = oModel.getMetaModel(),
											sPath = oListBinding.getPath();
										//NewAction is not yet supported for NavigationProperty collection
										// if NewAction is present, then creation is 'Deferred'
										// In the absence of NewAction, creation can always be created async
										if (!oListBinding.isRelative() && oMetaModel.getObject(sPath + '@com.sap.vocabularies.Common.v1.DraftRoot/NewAction')) {
											return 'Deferred';
										}
										return 'Async';
									case 'Sticky' :
										// TODO: check if action has parameters, for now always create context on target page
										return 'Deferred';
									case 'NonDraft' :
										// TODO: to be checked - for now create them now and then navigate we might also switch to async
										return 'Sync';
								}
							}
						});

					}).then(function (sCreationMode) {
						var oCreation;

						if (sCreationMode !== 'Deferred') {
							if (sCreationMode === 'CreationRow'){
								// prefill data from creation row
								mParameters.data = mParameters.creationRow.getBindingContext().getObject();
							}
							if (sCreationMode === 'CreationRow' || sCreationMode === 'Inline'){
								// in case the creation failed we keep the failed context
								mParameters.keepTransientContextOnFailed = true;
								// busy handling shall be done locally only
								mParameters.busyMode = 'Local';

								if (sCreationMode === 'CreationRow'){
									// currently the mdc table would also lock the creation row - therefore don't
									// lock at all for now
									mParameters.busyMode = 'None';
								}
								if (sCreationMode === 'Inline'){
									// As the transient lines are not fully implemented and some input from UX is missing
									// we deactivate it for Inline and keep it only for the CreationRow which is anyway
									// not yet final
									mParameters.keepTransientContextOnFailed = false;
								}
							}

							oCreation = that.base.transaction.createDocument(oListBinding, mParameters);
						}

						switch (sCreationMode) {
							case 'Deferred':
								that.base.routing.navigateToContext(oListBinding, {
									deferredContext: true,
									noHistoryEntry: mParameters.noHistoryEntry,
									editable: true
								});
								break;
							case 'Async':
								that.base.routing.navigateToContext(oListBinding, {
									asyncContext: oCreation,
									noHistoryEntry: mParameters.noHistoryEntry,
									editable: true
								});
								break;
							case 'Sync':
								oCreation.then(function (oNewDocumentContext) {
									that.base.routing.navigateToContext(oNewDocumentContext, {
										noHistoryEntry: mParameters.noHistoryEntry,
										editable: true,
										noHashChange: sProgrammingModel === 'Sticky'
									});
								});
								break;
							case 'Inline':
								handleSideEffects(oListBinding, oCreation);
								break;
							case 'CreationRow' :
								var oCreationRow = mParameters.creationRow,
									oCreationRowContext = oCreationRow.getBindingContext(),
									oCreationRowListBinding = oCreationRowContext.getBinding(),
									oNewTransientContext;

								handleSideEffects(oListBinding, oCreation);

								// this is needed to avoid console errors TO be checked with model colleagues
								oCreationRowContext.created().then(undefined, function(){
									Log.trace("transient fast creation context deleted");
								});

								oCreationRowContext.delete("$direct");
								oNewTransientContext = oCreationRowListBinding.create();

								oCreationRow.setBindingContext(oNewTransientContext);
								break;
						}

						if (oCreation) {
							oCreation.then(function (oNewDocumentContext) {
								if (oNewDocumentContext) {
									that.base.routing.setDirtyState(oNewDocumentContext, true);

									if (sProgrammingModel === 'Sticky') {
										// TODO: the timeout is only a workaround for the first sticky shipment
										// we have to work on this anyway to support sticky on multiple pages and
										// with List Report support - BLI created
										setTimeout(function () {
											that._handleStickyOn(oNewDocumentContext);
										}, 0);
									}
								}
								resolve();
							}, reject);
						} else {
							// resolve directly
							resolve();
						}
					});

				});
			},

			editDocument: function (oContext) {
				var that = this;

				this.base.transaction.editDocument(oContext).then(function (oNewDocumentContext) {
					that.base.transaction.getProgrammingModel(oContext).then(function (sProgrammingModel) {
						var bNoHashChange;

						if (sProgrammingModel === 'Sticky') {
							that._handleStickyOn(oNewDocumentContext);
							bNoHashChange = true;
						}

						if (oNewDocumentContext !== oContext) {
							that.handleNewContext(oNewDocumentContext, true, bNoHashChange, true);
						}

					});
				});
			},

			saveDocument: function (oContext) {
				var that = this;

				this.base.transaction.saveDocument(oContext).then(function (oActiveDocumentContext) {
					that.base.transaction.getProgrammingModel(oContext).then(function (sProgrammingModel) {
						var bNoHashChange;

						if (sProgrammingModel === 'Sticky') {
							// Without creating a new context, there is no GET for header data with navigation properties
							var oHiddenBinding = oActiveDocumentContext.getModel().bindContext(oActiveDocumentContext.getPath(), undefined,
									{$$groupId: '$auto'});
							oActiveDocumentContext = oHiddenBinding.getBoundContext();

							that._handleStickyOff(oContext);

							if (oContext.getPath() === oActiveDocumentContext.getPath()){
								bNoHashChange = true;
							}
						}

						if (oActiveDocumentContext !== oContext) {
							that.handleNewContext(oActiveDocumentContext, true, bNoHashChange, false);
						}
					});
				});
			},

			cancelDocument: function (oContext, mParameters) {
				var that = this;

				this.base.transaction.cancelDocument(oContext, mParameters).then(function (oActiveDocumentContext) {
					that.base.transaction.getProgrammingModel(oContext).then(function (sProgrammingModel) {
						var bNoHashChange;

						if (sProgrammingModel === 'Sticky'){
							that._handleStickyOff(oContext);
							bNoHashChange = true;
						}

						//in case of a new document, the value of hasActiveEntity is returned. navigate back.
						if (!oActiveDocumentContext) {
							that.base.routing.setDirtyState(oContext, true);
							//This code is workaround for first version will be removed once navigation handler is ready.
							// TODO: temp solution only, directly use window.history.back
							window.history.back();
						} else { //active context is returned in case of cancel of existing document
							that.handleNewContext(oActiveDocumentContext, true, bNoHashChange, false);
						}
					});
				});
			},

			requestSideEffects: function (sNavigationProperty, oBindingContext) {
				var oMetaModel = this.base.getView().getModel().getMetaModel(),
					sBaseEntityType = '/' + oMetaModel.getObject(oMetaModel.getMetaPath(oBindingContext.getPath()))['$Type'],
					oAnnotations = oMetaModel.getObject(sBaseEntityType + '@'),
					aSideEffects = Object.keys(oAnnotations).filter(function (sAnnotation) {
						return sAnnotation.indexOf('@com.sap.vocabularies.Common.v1.SideEffects') > -1;
					}),
					aSideEffectsToRequest = [],
					aPathExpressions,
					aPropertiesToRequest = [],
					aEntitiesToRequest = [],
					aBindings,
					oContextForSideEffects;
				// gather side effects which need to be requested
				aSideEffects.forEach(function (sSideEffect) {
					var oSideEffect = oAnnotations[sSideEffect];
					// if the navigation property is a source entity for any side effect
					if (oSideEffect.SourceEntities) {
						oSideEffect.SourceEntities.forEach(function (oSourceEntity) {
							if (oSourceEntity['$NavigationPropertyPath'] === sNavigationProperty) {
								aSideEffectsToRequest.push(sSideEffect);
							}
						});
					}
					// if at least one of the source properties belongs to the entity type via navigation property
					if (oSideEffect.SourceProperties && aSideEffectsToRequest.indexOf(sSideEffect) === -1) {
						oSideEffect.SourceProperties.forEach(function (oSourceProperty) {
							if (aSideEffectsToRequest.indexOf(sSideEffect) === -1 && (oSourceProperty['$PropertyPath'].indexOf(sNavigationProperty + '/') === 0)) {
								aSideEffectsToRequest.push(sSideEffect);
							}
						});
					}
				});
				// assemble the path expressions to be GET from each side effect to be requested
				aSideEffectsToRequest.forEach(function (sSideEffect) {
					var aAdditionalPathExpressions = [],
						oSideEffect = oAnnotations[sSideEffect],
						aTargetProperties = oSideEffect.TargetProperties || [],
						aTargetEntities = oSideEffect.TargetEntities || [];
					// remove duplicate properties
					aTargetProperties = aTargetProperties.map(function (oPathExpression) {
						return oPathExpression['$PropertyPath'];
					}).filter(function (sPath) {
						return aPropertiesToRequest.indexOf(sPath) < 0;
					});
					// get additional text association values for the properties
					aTargetProperties.forEach(function (sPath) {
						var oTextAnnotation = oMetaModel.getObject(sBaseEntityType + '/' + sPath + '@com.sap.vocabularies.Common.v1.Text');
						if (oTextAnnotation && oTextAnnotation['$Path']) {
							aAdditionalPathExpressions.push(oTextAnnotation['$Path']);
						}
					});
					// remove duplicate entities
					aTargetEntities = aTargetEntities.map(function (oPathExpression) {
						return oPathExpression['$NavigationPropertyPath'];
					}).filter(function (sPath) {
						return aEntitiesToRequest.indexOf(sPath) < 0;
					});
					// add to list of paths to be requested
					aPropertiesToRequest = aPropertiesToRequest.concat(aTargetProperties).concat(aAdditionalPathExpressions);
					aEntitiesToRequest = aEntitiesToRequest.concat(aTargetEntities);
				});
				// gather all unique paths to request in the format of '$PropertyPath' and '$NavigationPropertyPath'
				aPathExpressions = aPropertiesToRequest.map(function (sPath) {
					return {'$PropertyPath' : sPath};
				}).concat(aEntitiesToRequest.map(function (sPath) {
					return {'$NavigationPropertyPath': sPath};
				}));
				// request
				if (aPathExpressions.length) {
					// we need the correct context to request side effects
					// if there are dependent bindings, it may result in duplicate GET requests
					// the binding of the context on which we requestSideEffects must have $$patchWithoutSideEffects true
					aBindings = oBindingContext.getBinding().getDependentBindings();
					oContextForSideEffects = (aBindings && aBindings[0].isPatchWithoutSideEffects() && aBindings[0].getBoundContext()) || oBindingContext;
					oContextForSideEffects.requestSideEffects(aPathExpressions);
				}
			},

			deleteDocument: function (oContext, mParameters) {
				var that = this,
					mParameters = mParameters || {};
				this.base.transaction.deleteDocument(oContext, mParameters).then(function () {
					// some header data might be needed to GET on delete, so we request side effects here
					var oBindingContext = that.base.getView().getBindingContext();
					//TODO: This is only a workaround to clear the selectios after any operation like delete
					var	oTable = that.getView().byId(mParameters.id);
						if (oTable && oTable.isA('sap.ui.mdc.Table')) {
							oTable.clearSelection();
						}
					// requestSideEffects method would be only called for object page table delete, oBindingContext will not be undefined and oContext would be an array for object page table delete
					if (oBindingContext && Array.isArray(oContext)) {
						that.requestSideEffects(oContext[0].getBinding().getPath(), oBindingContext);
					}
					//Only do the following if we are not coming from a list.
					//TODO: Currently the array is the only indication that we had a multi select table and therefor are not the objects object page. There must ber a better way
					//E.g. a dedicated delete documents (plural) or we separate the dirty state and navigation handling
					if (!Array.isArray(oContext)) {
						that.base.routing.setDirtyState(oContext, true);
						//This code is workaround for first version will be removed once navigation handler is ready.
						// TODO: temp solution only, directly use window.history.back
						window.history.back();
					}

				});
			},

			applyDocument: function () {
				//Commenting the below code as of now. Can be used later for reference.
				/* var oUIModel = this.base.getView().getModel('ui');
				oUIModel.setProperty("/busy", true);
				oContext.getModel().submitBatch('Apply').then(function () {
					window.history.back();
					oUIModel.setProperty("/busy", false);
					messageHandling.showUnboundMessages();
				}).catch(function (err) {
					oUIModel.setProperty("/busy", false);
					messageHandling.showUnboundMessages();
					Promise.reject(err); //Is this the correct way?
				}); */
				window.history.back();
			},

			_handleStickyOn : function(oContext){
				if (sap.ushell) {
					sap.ushell.Container.setDirtyFlag(true);
				}

				var i18nModel = this.base.getView().getModel("sap.fe.i18n"),
				that = this;

				this.fnHandleSessionTimeout = function (){
					// remove transient messages since we will showing our own message
					messageHandling.removeBoundTransitionMessages();
					messageHandling.removeUnboundTransitionMessages();

					var oDialog = new Dialog({
						title: '{sap.fe.i18n>OBJECT_PAGE_SESSION_EXPIRED_DIALOG_TITLE}',
						state: 'Warning',
						content: new Text({text: '{sap.fe.i18n>OBJECT_PAGE_SESSION_EXPIRED_DIALOG_MESSAGE}'}),
						beginButton: new Button({
							text:'{sap.fe.i18n>SAPFE_OK}',
							type: 'Emphasized',
							press: function () {
								// remove sticky handling after navigation since session has already been terminated
								that._handleStickyOff();
								window.history.back();
							}
						}),
						afterClose: function() {
							oDialog.destroy();
						}
					});
					oDialog.addStyleClass("sapUiContentPadding");
					oDialog.setModel(i18nModel, 'sap.fe.i18n');
					that.base.getView().addDependent(oDialog);
					oDialog.open();
				};
				// handle session timeout
				this.base.getView().getModel().attachSessionTimeout(this.fnHandleSessionTimeout);

				if (!this.fnStickyDiscard){
					this.fnStickyDiscard = function(){
						sticky.discardDocument(oContext);
					};
					this.base.routing.attachOnAfterNavigation(this.fnStickyDiscard);
				}
			},
			_handleStickyOff : function(){
				if (sap.ushell) {
					sap.ushell.Container.setDirtyFlag(false);
				}

				this.base.getView().getModel().detachSessionTimeout(this.fnHandleSessionTimeout);
				this.base.routing.detachOnAfterNavigation(this.fnStickyDiscard);
				this.fnStickyDiscard = null;
			},

			handleNewContext: function (oContext, bNoHistoryEntry, bNoHashChange, bEditable) {
				this.base.routing.setDirtyState(oContext, true);
				this.base.routing.navigateToContext(oContext, {
					noHistoryEntry : bNoHistoryEntry,
					noHashChange : bNoHashChange,
					editable : bEditable
				});
			},
			/**
			 * Invokes an action - bound/unbound and sets the page dirty
			 * @function
			 * @static
			 * @name sap.fe.controllerextensions.EditFlow.onCallAction
			 * @memberof sap.fe.controllerextensions.EditFlow
			 * @param {string} sActionName The name of the action to be called
			 * @param {map} [mParameters] contains the following attributes:
			 * @param {sap.ui.model.odata.v4.Context} [mParameters.contexts] contexts Mandatory for a bound action, Either one context or an array with contexts for which the action shall be called
			 * @param {sap.ui.model.odata.v4.ODataModel} [mParameters.model] oModel Mandatory for an unbound action, An instance of an OData v4 model
			 * @sap-restricted
			 * @final
			**/
			onCallAction: function (sActionName, mParameters) {
				var that = this,
					oContext;

				that.base.transaction.onCallAction(sActionName, mParameters).then(function () {
					/*
					 We set the (upper) pages to dirty after an execution of an action
					 TODO: get rid of this workaround
					 This workaround is only needed as long as the model does not support the synchronization.
					 Once this is supported we don't need to set the pages to dirty anymore as the context itself
					 is already refreshed (it's just not reflected in the object page)
					 we explicitly don't call this method from the list report but only call it from the object page
					 as if it is called in the list report it's not needed - as we anyway will remove this logic
					 we can live with this
					 we need a context to set the upper pages to dirty - if there are more than one we use the
					 first one as they are anyway siblings
					 */
					if (mParameters.contexts) {
						oContext = Array.isArray(mParameters.contexts) ? mParameters.contexts[0] : mParameters.contexts;
						that.base.routing.setDirtyState(oContext, true);
					}
				});

			},

			/**
			 * Method to format the text of draft admin owner
			 * @function
			 * @name formatDraftOwnerText
			 * @memberof sap.fe.controllerextensions.EditFlow
			 * @param {Boolean} bHasDraftEntity HasDraftEntity property of draft object
			 * @param {String} sDraftInProcessByUser DraftInProcessByUser property of Draft DraftAdministrativeData
			 * @param {String} sDraftInProcessByUserDesc DraftInProcessByUserDesc property of Draft DraftAdministrativeData
			 * @param {String} sDraftLastChangedByUser DraftLastChangedByUser property of Draft DraftAdministrativeData
			 * @param {String} sDraftLastChangedByUserDesc DraftLastChangedByUserDesc property of Draft DraftAdministrativeData
			 * @param {String} sFlag flag to differanciate between the point of method calls
			 * @returns {String} the draft admin owner string to be shown
			 */
			formatDraftOwnerText: function (bHasDraftEntity, sDraftInProcessByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUser, sDraftLastChangedByUserDesc, sFlag) {
				var sDraftOwnerDescription = '',
					oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.fe');
				if (bHasDraftEntity) {
					var sUserDescription = sDraftInProcessByUserDesc || sDraftInProcessByUser || sDraftLastChangedByUserDesc || sDraftLastChangedByUser;
					if (sFlag) {
						sDraftOwnerDescription += sDraftInProcessByUser ? oResourceBundle.getText('DRAFTINFO_GENERIC_LOCKED_OBJECT_POPOVER_TEXT') + ' ' : oResourceBundle.getText('DRAFTINFO_LAST_CHANGE_USER_TEXT') + ' ';
					}
					sDraftOwnerDescription += sUserDescription ? oResourceBundle.getText('DRAFTINFO_OWNER', [sUserDescription]) : oResourceBundle.getText('DRAFTINFO_ANOTHER_USER');
				}
				return sDraftOwnerDescription;
			},

			formatDraftOwnerTextInline: function(bHasDraftEntity, sDraftInProcessByUser, sDraftLastChangedByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUserDesc) {
				return this.formatDraftOwnerText(bHasDraftEntity, sDraftInProcessByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUser, sDraftLastChangedByUserDesc, false);
			},
			formatDraftOwnerTextInPopover: function(bHasDraftEntity, sDraftInProcessByUser, sDraftLastChangedByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUserDesc) {
				return this.formatDraftOwnerText(bHasDraftEntity, sDraftInProcessByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUser, sDraftLastChangedByUserDesc, true);
			},

			/**
			 * Method to be executed on click of the link
			 * @function
			 * @name onDraftLinkPressed
			 * @memberof sap.fe.controllerextensions.EditFlow
			 * @param {Event} oEvent event object passed from the click event
			 * @param {String} sEntitySet Name of the entity set for on the fly templating
			 */
			onDraftLinkPressed: function (oEvent, sEntitySet) {
				var that = this,
					oButton = oEvent.getSource(),
					oBindingContext = oButton.getBindingContext(),
					oView = this.base.getView(),
					oMetaModel = oView.getModel().getMetaModel(),
					oController = oView.getController();
				if (!this._oPopover || !this._oPopover.oPopup) {
					Promise.resolve(that._oFragment || XMLPreprocessor.process(oPopoverFragment, {}, {
						bindingContexts: {
							entitySet: oMetaModel.createBindingContext("/" + sEntitySet)
						},
						models: {
							entitySet: oMetaModel
						}
					}))
					.then(function(oFragment) {
						//Remember as we can't template the same fragment twice
						that._oFragment = oFragment;
						return Fragment.load({definition:oFragment, controller: oController});
					})
					.then(function(oPopover) {
						that._oPopover = oPopover;
						oView.addDependent(that._oPopover);
						that._oPopover.setBindingContext(oBindingContext);
						that._oPopover.openBy(oButton);
					});
				}
				this._oPopover.setBindingContext(oBindingContext);
				this._oPopover.openBy(oButton);
			},

			/**
			 * Method to be executed on click of the close button of the draft admin data popover
			 * @function
			 * @name closeDraftAdminPopover
			 * @memberof sap.fe.controllerextensions.EditFlow
			 */
			closeDraftAdminPopover: function(){
				this._oPopover.close();
			},

			/**
			 * handles the patch event: shows messages and in case of draft updates draft indicator
			 * @function
			 * @name handlePatchEvents
			 * @memberof sap.fe.controllerextensions.EditFlow
			 * @param {Object} oBinding odata context binding object
			 */
			handlePatchEvents: function (oBinding) {
				// TODO: we shall not just get the UI from base
				var oUIModel = this.base.getView().getModel('ui');
				oUIModel.setProperty('/draftStatus', 'Clear');
				var that = this;
				return that.base.transaction.getProgrammingModel(oBinding).then(function(sProgrammingModel){
					// temp coding only, oBinding can be both a context or a binding context, get the binding
					// we will get rid of this once the model supports
					oBinding = oBinding.getBinding && oBinding.getBinding() || oBinding;
					oBinding.attachEvent('patchSent', function () {
						that.base.transaction.handleDocumentModifications();
						// for the time being until the model does the synchronization we set the context to dirty
						// therefore the list report is refreshed. once the model does the synchronization this coding
						// needs to be removed
						that.base.routing.setDirtyState(
							//contextBinding
							oBinding.getBoundContext && oBinding.getBoundContext() ||
							""//TODO: listBinding (of tables on object pages) will return undefined. What is correct?
						, true); //Pass the context
						if (sProgrammingModel === 'Draft'){
							oUIModel.setProperty('/draftStatus', 'Saving');
						}
					});
					oBinding.attachEvent('patchCompleted', function (event) {
						if (sProgrammingModel === 'Draft'){
							oUIModel.setProperty('/draftStatus', event.getParameter('success') ? 'Saved' : 'Clear');
						}
						messageHandling.showUnboundMessages();
					});
				});
			},
			/**
			 * handles the errors from the table in list report and object page
			 * @function
			 * @name handleErrorOfTable
			 * @memberof sap.fe.controllerextensions.EditFlow
			 * @param {Object} oEvent Event object
			 */
			handleErrorOfTable: function (oEvent) {
				if (oEvent.getParameter('error')) {
					// show the unbound messages but with a timeout as the messages are otherwise not yet in the message model
					setTimeout(messageHandling.showUnboundMessages, 0);
				}
			}

		});

		return Extension;
	}
);