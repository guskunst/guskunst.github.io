/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(['sap/ui/core/mvc/ControllerExtension',
	'sap/fe/actions/draft',
	'sap/fe/actions/nonDraft',
	'sap/fe/actions/sticky',
	'sap/fe/actions/operations',
	'sap/fe/model/DraftModel',
	"sap/ui/model/json/JSONModel",
	'sap/fe/actions/messageHandling',
	'sap/m/Popover',
	'sap/m/VBox',
	'sap/m/CheckBox',
	'sap/m/Text',
	'sap/m/Button',
	'sap/m/MessageToast',
	'sap/fe/factory/UI5ControlFactory'],
	function (ControllerExtension, draft, nonDraft, sticky, operations, DraftModel, JSONModel, messageHandling, Popover, VBox, CheckBox, Text, Button, MessageToast, UI5ControlFactory) {
		'use strict';
		var bIsModified = false, bCreateMode = false;
		/* Make sure that the mParameters is not the oEvent */
		function getParameters(mParameters) {
			if (mParameters && mParameters.getMetadata &&
				mParameters.getMetadata().getName() === 'sap.ui.base.Event') {
				mParameters = {};
			}
			return mParameters || {};
		}

		/**
		 * {@link sap.ui.core.mvc.ControllerExtension Controller extension} for transactional UIs
		 *
		 * @namespace
		 * @alias sap.fe.controllerextensions.Transaction
		 *
		 * @sap-restricted
		 * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
		 * @since 1.54.0
		 */
		var Extension = ControllerExtension.extend('sap.fe.controllerextensions.Transaction', {

			getProgrammingModel: function (oBinding) {
				var that = this,
					oModel = oBinding.getModel(),
					sMetaPath = oBinding.getModel().getMetaModel().getMetaPath(oBinding.getPath());

				if (!this.sProgrammingModel) {
					return DraftModel.upgradeOnDemand(oModel).then(function (bIsDraft) {
						if (bIsDraft){
							that.sProgrammingModel = 'Draft';
						} else {
							if (oModel.getMetaModel().getObject(sMetaPath + '@com.sap.vocabularies.Session.v1.StickySessionSupported')){
								that.sProgrammingModel = 'Sticky';
							} else {
								that.sProgrammingModel = 'NonDraft';
								//This line is to set the updateGroupId so that http patch will not be fired when when value changed in inputs.
								//This is just a hack will be removed once the model gives a way to set this value properly.
								oModel.sUpdateGroupId = "nondraft";
							}
						}

						return that.sProgrammingModel;
					});
				} else {
					return Promise.resolve(this.sProgrammingModel);
				}
			},

			getUIModel: function () {
				if (!this.uiModel) {
					this.uiModel = new JSONModel({
						editable: 'Display',
						busy: false,
						busyLocal : {},
						draftStatus: 'Clear' ,
						mode: 'Display'
					});
				}
				return this.uiModel;
			},

			// Slim Busy Helper Functions
			isBusy : function(sMode, sLocalId){
				var oUIModel = this.getUIModel();
				return oUIModel.getProperty("/busy") || oUIModel.getProperty("/busyLocal/" + sLocalId);
			},
			busyHandler : function(sMode, sLocalId, bOn){
				var oUIModel;
				if (sMode === 'Global'){
					oUIModel = this.getUIModel();
					oUIModel.setProperty("/busy", bOn);
				} else if (sMode === 'Local'){
					oUIModel = this.getUIModel();
					oUIModel.setProperty("/busyLocal/" + sLocalId, bOn);
				}
			},
			busyOn : function(sMode, sLocalId){
				this.busyHandler(sMode, sLocalId, true);
			},
			busyOff : function(sMode, sLocalId){
				this.busyHandler(sMode, sLocalId, false);
			},


			/**
			 * Creates new document in sticky session/ draft
			 *
			 * @function
			 * @name sap.fe.controllerextensions.Transaction#fnCreateDocument
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @static
			 * @param {sap.ui.model.odata.v4.ODataListBinding} oListBinding list binding for which a new document shall be created
			 * @param {boolean} bSkipRefresh - if the list shall be refreshed immediately after creating the instance
			 * @param {map} [mParameters.data] a map of data that should be sent within the POST
			 * @param {map} [mParameters.keepTransientContextOnFailed] if set the context stays in the list if the POST failed and POST will be repeated with next change
			 * @param {map} [mParameters.createAtEnd] boolean, if true, to set new context created at the end of list binding
	 		 * @private
			 * @sap-restricted
			 */
			fnCreateDocument: function(oListBinding, bSkipRefresh, mParameters) {
				var oModel = oListBinding.getModel(),
					oMetaModel = oModel.getMetaModel(),
					sMetaPath = oMetaModel.getMetaPath(oListBinding.getPath()),
					sNewAction = !oListBinding.isRelative() && (oMetaModel.getObject(sMetaPath + '@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction') || oMetaModel.getObject(sMetaPath + '@com.sap.vocabularies.Common.v1.DraftRoot/NewAction')),
					oNewDocumentContext,
					oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe");

				if (sNewAction) {
					return this.onCallAction(sNewAction, {
						contexts: oListBinding.getHeaderContext(),
						showActionParameterDialog: true,
						label: oResourceBundle.getText("SAPFE_ACTION_CREATE"),
						bindingParameters: {$$patchWithoutSideEffects : true},
						parentControl : mParameters.parentControl,
						bIsCreateAction: true
					});
				} else {
					// TODO: we need to check that this is really a node to avoid that if there's no new action on the
					// root only a POST is sent
					// this is a workaround only as long as the model does not support any better approach
					var oMessageList = sap.ui.getCore().getMessageManager().getMessageModel().bindList('');
					var fnAttachOnMessageModel = function(){
						var aMessages = oMessageList.getModel().getData() || [];
						if (aMessages.length) {
							setTimeout(function(){
								oMessageList.detachChange(fnAttachOnMessageModel);
								oNewDocumentContext.delete();
							}, 0);
						}
					};
					oMessageList.attachChange(fnAttachOnMessageModel);
					// This one is used to create new nodes
					oNewDocumentContext = oListBinding.create(null, bSkipRefresh, mParameters.createAtEnd);
					return oNewDocumentContext.created().then(function(){
						oMessageList.detachChange(fnAttachOnMessageModel);
						return oNewDocumentContext;
					});
				}
			},

			/**
			 * Creates a new document
			 *
			 * @function
			 * @name sap.fe.controllerextensions.Transaction#createDocument
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @static
			 * @param {sap.ui.model.odata.v4.ODataListBinding} OData v4 ListBinding object
			 * @param {map} [mParameters] Optional, can contain the following attributes:
			 * @param {boolean} [mParameters.refreshList] control if the list shall be refreshed immediately after creating the instance
			 * @param {map} [mParameters.data] a map of data that should be sent within the POST
			 * @param {string} [mParameters.busyMode] Global (default), Local, None TODO: to be refactored
			 * @param {map} [mParameters.keepTransientContextOnFailed] if set the context stays in the list if the POST failed and POST will be repeated with next change
			 * @param {string} [mParameters.busyHandling] whether busy handling should be done or not
			 * @returns {Promise} Promise resolves with New Binding Context
			 *
			 * @sap-restricted
			 * @final
			 */
			createDocument: function (oListBinding, mParameters) {
				var oNewDocumentContext,
					that = this,
					bSkipRefresh,
					sBindingName;

				mParameters = getParameters(mParameters);

				if (!oListBinding) {
					return Promise.reject("Binding required for new document creation");
				}

				if (mParameters.busyMode === 'Local'){
					// in case of local busy mode we use the list binding name
					// there's no APY yet so we have to use the .sId TODO provide a public method?
					sBindingName = oListBinding.sId;
				}

				// Double-Click-Protection if user executes action again until controls are really busy
				if (this.isBusy(mParameters.busyMode, sBindingName)){
					return Promise.reject("Action can only be called once at a time");
				}

				return this.getProgrammingModel(oListBinding).then(function (sProgrammingModel) {
					bSkipRefresh = !mParameters.refreshList;

					switch (sProgrammingModel) {
						case 'Draft' :
						case 'Sticky' :
							if (!mParameters.parentControl){
								// TODO: is this still needed or can we get rid of this one?
								mParameters.parentControl = that.base.getView();
							}
							if (mParameters.busyHandling) {
								that.busyOn(mParameters.busyMode, sBindingName);
							}
							return that.fnCreateDocument(oListBinding, bSkipRefresh, mParameters).then(function (oResult) {
								bCreateMode = true;
								oNewDocumentContext = oResult.response || oResult;
								if (mParameters.busyHandling) {
									that.busyOff(mParameters.busyMode, sBindingName);
								}
								if (oResult.bConsiderDocumentModified) {
									that.handleDocumentModifications();
								}
								return messageHandling.showUnboundMessages().then(function () {
									return oNewDocumentContext;
								});
							});
						case 'NonDraft' :
							oNewDocumentContext = oListBinding.create(null, bSkipRefresh);
							bCreateMode = true;
							return oNewDocumentContext;
					}
				}).catch(function (err) {
					if (mParameters.busyHandling) {
						that.busyOff(mParameters.busyMode, sBindingName);
					}
					return messageHandling.showUnboundMessages().then(function() {
						return Promise.reject(err);
					});
				});
			},

			/**
			 * Delete one or multiple document(s)
			 *
			 * @function
			 * @name sap.fe.controllerextensions.Transaction#deleteDocument
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @static
			 * @param {sap.ui.model.odata.v4.Context} contexts Either one context or an array with contexts to be deleted
			 * @param {map} [mParameters] Optional, can contain the following attributes:
			 * @param {string} title, Title of the object to be deleted
			 * @param {string} description, Description of the object to be deleted
			 * @param {string} numberOfSelectedContexts, Number of objects selected
			 **/
			deleteDocument: function (vContexts, mParameters) {
				var oUIModel = this.getUIModel(),
				fnReject, fnResolve, aDeletableContexts = [], isCheckBoxVisible = false, isLockedTextVisible = false, cannotBeDeletedTextVisible = false, isCheckBoxSelected;
				// Double-Click-Protection if user executes action again until controls are really busy
				if (oUIModel.getProperty("/busy")) {
					return Promise.reject("Action can only be called once at a time");
				}

				var localI18nRef = sap.ui.getCore().getLibraryResourceBundle("sap.fe"),
					aParams,
					oDeleteMessage = {
						title: localI18nRef.getText("OBJECT_PAGE_DELETE")
					};
				oUIModel.setProperty("/busy", true);
				if (mParameters) {
					if (!mParameters.numberOfSelectedContexts) {
						mParameters = getParameters(mParameters);
						if (mParameters.title) {
							if (mParameters.description) {
								aParams = [mParameters.title, mParameters.description];
								oDeleteMessage.text = localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO", aParams);
							} else {
								oDeleteMessage.text = localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR");
							}
						} else {
							oDeleteMessage.text = localI18nRef.getText("OBJECT_PAGE_CONFIRM_GENERIC_DELETE");
						}
						aDeletableContexts = vContexts;
					} else {

						oDeleteMessage = {
							title: localI18nRef.getText("OBJECT_PAGE_DELETE")
						};
						if (mParameters.numberOfSelectedContexts === 1 && mParameters.numberOfSelectedContexts === vContexts.length){
							aDeletableContexts = vContexts;
							oDeleteMessage.text =  localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR");
						} else if (mParameters.numberOfSelectedContexts === 1 && mParameters.unSavedContexts.length === 1){
							//only one unsaved object
							aDeletableContexts = mParameters.unSavedContexts;
							var sLastChangedByUser = aDeletableContexts[0].getObject()["DraftAdministrativeData"] ? aDeletableContexts[0].getObject()["DraftAdministrativeData"]["LastChangedByUserDescription"] : "";
							aParams = [sLastChangedByUser];
							oDeleteMessage.text =  localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_UNSAVED_CHANGES", aParams);

						} else if (mParameters.numberOfSelectedContexts === mParameters.unSavedContexts.length){
							//only multiple unsaved objects
							aDeletableContexts = mParameters.unSavedContexts;
							oDeleteMessage.text =  localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_UNSAVED_CHANGES_MULTIPLE_OBJECTS");
						} else if (mParameters.numberOfSelectedContexts === vContexts.concat(mParameters.unSavedContexts.concat(mParameters.lockedContexts)).length) {
							//only unsaved, locked ,deletable objects but not non-deletable objects
							aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
							oDeleteMessage.text = aDeletableContexts.length === 1 ? localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR") : localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL");
						} else {
							//if non-deletable objects exists along with any of unsaved ,deletable objects
							aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
							cannotBeDeletedTextVisible = true;
							oDeleteMessage.text = aDeletableContexts.length === 1 ? localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL") : localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR");
							oDeleteMessage.nonDeletableText = localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_NON_DELETABLE", [(mParameters.numberOfSelectedContexts - vContexts.concat(mParameters.unSavedContexts).length),mParameters.numberOfSelectedContexts]);
						}
						if (mParameters.lockedContexts.length > 0){
							//setting the locked text if locked objects exist
							isLockedTextVisible = true;
							oDeleteMessage.nonDeletableText = localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED", [mParameters.lockedContexts.length, mParameters.numberOfSelectedContexts]);
						}
						if (mParameters.unSavedContexts.length > 0 && mParameters.unSavedContexts.length !== mParameters.numberOfSelectedContexts){
							if ((cannotBeDeletedTextVisible || isLockedTextVisible) && aDeletableContexts.length === mParameters.unSavedContexts.length) {
								//if only unsaved and either or both of locked and non-deletable objects exist then we hide the check box
								isCheckBoxVisible = false;
								aDeletableContexts = mParameters.unSavedContexts;
								if (mParameters.unSavedContexts.length === 1){
									oDeleteMessage.text =  localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_SINGULAR");
								} else {
									oDeleteMessage.text =  localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_PLURAL");
								}
							} else {
								if (mParameters.unSavedContexts.length === 1){
									oDeleteMessage.checkBoxText =  localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_SINGULAR");
								} else {
									oDeleteMessage.checkBoxText =  localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_PLURAL");
								}
								isCheckBoxVisible = true;
							}
						}
						if (cannotBeDeletedTextVisible && isLockedTextVisible) {
							//if both locked and non-deletable objects exist along with deletable objects
							oDeleteMessage.nonDeletableText = localI18nRef.getText("OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED_AND_NON_DELETABLE", [(mParameters.numberOfSelectedContexts - vContexts.concat(mParameters.unSavedContexts).length - mParameters.lockedContexts.length),mParameters.lockedContexts.length, mParameters.numberOfSelectedContexts]);
						}
					}
				}
				var oContent = new VBox({
					items: [

						new Text({
							text: oDeleteMessage.nonDeletableText,
							visible:isLockedTextVisible || cannotBeDeletedTextVisible
						}),
						new Text({
							text: oDeleteMessage.text
						}),
						new CheckBox({
							text:oDeleteMessage.checkBoxText,
							selected:true,
							select:function(oEvent){
								var selected = oEvent.getSource().getSelected();
								if (selected){
									aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
									isCheckBoxSelected = true;
								} else {
									aDeletableContexts = vContexts;
									isCheckBoxSelected = false;
								}
							},
							visible:isCheckBoxVisible
						})
					]
				});
				var sTitle = mParameters.numberOfSelectedContexts ? localI18nRef.getText("OBJECT_PAGE_DELETE_DIALOG",[mParameters.numberOfSelectedContexts]) : localI18nRef.getText("OBJECT_PAGE_DELETE");
				var oDialog = new UI5ControlFactory.getDialogControl({
					title: sTitle,
					state: 'Warning',
					content: [oContent],
					beginButton: new Button({
						text: localI18nRef.getText("OBJECT_PAGE_DELETE"),
						type: "Emphasized",
						press: function () {
							oUIModel.setProperty("/busy", true);
							var aContexts = Array.isArray(aDeletableContexts) ? aDeletableContexts : [aDeletableContexts];
							oDialog.close();
							return Promise.all(aContexts.map(function (oContext) {
								oContext.delete().then(function () {
									oUIModel.setProperty("/busy", false);
									if (oUIModel.getProperty("/$contexts/" + mParameters.id + "/deleteEnabled") != undefined) {
										if (isCheckBoxVisible === true && isCheckBoxSelected === false){
											//if unsaved objects are not deleted then we need to set the enabled to true and update the model data for next deletion
											oUIModel.setProperty("/$contexts/" + mParameters.id + "/deleteEnabled", true);
											var obj = Object.assign(oUIModel.getProperty("/$contexts/" + mParameters.id),{});
											obj.selectedContexts = obj.selectedContexts.filter(function(element) {
												return obj.deletableContexts.indexOf(element) === -1;
											  });
											obj.deletableContexts = [];
											obj.numberOfSelectedContexts = obj.selectedContexts.length;
											oUIModel.setProperty("/$contexts/" + mParameters.id,obj);
										} else {
											oUIModel.setProperty("/$contexts/" + mParameters.id + "/deleteEnabled", false);
										}
									}
									aContexts.length === 1 ? MessageToast.show(localI18nRef.getText("OBJECT_PAGE_DELETE_TOAST_SINGULAR")) : MessageToast.show(localI18nRef.getText("OBJECT_PAGE_DELETE_TOAST_PLURAL"));
									// remove existing bound transition messages
									messageHandling.removeBoundTransitionMessages();

									return messageHandling.showUnboundMessages().then(fnResolve);
								}).catch(function(oError){
									oUIModel.setProperty("/busy", false);
									return messageHandling.showUnboundMessages().then(fnReject);
								});
							}));
						}
					}),
					endButton: new Button({
						text: localI18nRef.getText("OBJECT_PAGE_CANCEL"),
						press:function() {
							oUIModel.setProperty("/busy", false);
							oDialog.close();
						}
					}),
					afterClose: function() {
						oDialog.destroy();
					}
				});
				oDialog.addStyleClass("sapUiContentPadding");
				oUIModel.setProperty("/busy", false);
				oDialog.open();

				return new Promise(function (resolve, reject) {
					fnReject = reject;
					fnResolve = resolve;
				});
			},



			/**
			 * Edit a document
			 *
			 * @function
			 * @name sap.fe.controllerextensions.Transaction#editDocument
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @static
			 * @param {sap.ui.model.odata.v4.Context} Context of the active document
			 * @returns {Promise} Promise resolves with the new Draft Context in case of draft programming model
			 *
			 * @sap-restricted
			 * @final
			 */
			editDocument: function (oContext) {
				var that = this;
				var oUIModel = this.getUIModel();
				// Double-Click-Protection if user executes action again until controls are really busy
				if (oUIModel.getProperty("/busy")) {
					return Promise.reject("Action can only be called once at a time");
				}
				if (!oContext) {
					return Promise.reject(new Error('Binding context to active document is required'));
				}
				return this.getProgrammingModel(oContext).then(function (sProgrammingModel) {
					switch (sProgrammingModel) {
						case 'Draft':
							// store the active context as it can be used in case of deleting the draft
							that.activeContext = oContext;

							oUIModel.setProperty("/busy", true);
							return draft.createDraftFromActiveDocument(oContext, {
								bPreserveChanges: true
							});
						case 'NonDraft':
							return oContext;
						case 'Sticky':
							oUIModel.setProperty("/busy", true);
							return sticky.editDocumentInStickySession(oContext);
					}
				}).then(function (oNewContext) {
					oUIModel.setProperty("/editable", 'Editable');
					oUIModel.setProperty("/busy", false);
					bCreateMode = false;
					return messageHandling.showUnboundMessages().then(function () {
						return oNewContext;
					});
				}).catch(function (err) {
					oUIModel.setProperty("/busy", false);
					return messageHandling.showUnboundMessages().then(function() {
						return Promise.reject(err);
					});
				});
			},

			/**
			 * Update document
			 *
			 * @function
			 * @name sap.fe.controllerextensions.Transaction#updateDocument
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @static
			 * @param {map} [mParameters] Optional, can contain the following attributes:
			 * @param {sap.ui.model.odata.v4.Context} [mParameters.context] Context of the active document
			 * @returns {Promise} Promise resolves with ???
			 *
			 * @sap-restricted
			 * @final
			 */
			updateDocument: function () {
				return Promise.resolve();
			},

			/**
			 * Cancel edit of a document
			 *
			 * @function
			 * @name sap.fe.controllerextensions.Transaction#cancelDocument
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @static
			 * @param {sap.ui.model.odata.v4.Context} {oContext} Context of the document to be canceled / deleted
			 * @param {map} [mParameters] Optional, can contain the following attributes:
			 * @param {sap.m.Button} {mParameters.cancelButton} Cancel Button of the discard popover (mandatory for now)
			 * @returns {Promise} Promise resolves with ???
			 *
			 * @sap-restricted
			 * @final
			 */
			cancelDocument: function (oContext, mParameters) {
				var that = this,
					oUIModel = that.getUIModel(),
					sProgrammingModel;

				// Double-Click-Protection if user executes action again until controls are really busy
				if (oUIModel.getProperty("/busy")) {
					return Promise.reject("Action can only be called once at a time");
				}
				//context must always be passed - mandatory parameter
				if (!oContext) {
					return Promise.reject("No context exists. Pass a meaningful context");
				}
				var mParameters = getParameters(mParameters),
					oParamsContext = oContext,
					oCancelButton = mParameters.cancelButton,
					oModel = oParamsContext.getModel(),
					sCanonicalPath;

				return this.getProgrammingModel(oContext).then(function (sPModel) {
					sProgrammingModel = sPModel;
					if (sPModel === "Draft") {
						var draftDataContext = oModel.bindContext(oParamsContext.getPath() + '/DraftAdministrativeData').getBoundContext();
						if (!bIsModified) {
							oUIModel.setProperty("/busy", true);
							return draftDataContext.requestObject().then(function (draftAdminData) {
								oUIModel.setProperty("/busy", false);
								bIsModified = !(draftAdminData.CreationDateTime === draftAdminData.LastChangeDateTime);
							});
						}
					//} else if (sPModel === "Sticky") {
						// Using bIsModified for now.
					} else if (sPModel === "NonDraft") {
						bIsModified = oParamsContext.hasPendingChanges();
					}
				}).then(function () {
					return that._showDiscardPopover(oCancelButton, bIsModified);
				}).then(function () {
					oUIModel.setProperty("/busy",true);
					switch (sProgrammingModel) {
						case 'Draft':
							if (!oParamsContext.getObject('HasActiveEntity')) {
								oParamsContext.delete();
								return false;
							} else {
								var oActiveContext = that.activeContext || oModel.bindContext(oParamsContext.getPath() + '/SiblingEntity').getBoundContext();
								return oActiveContext.requestCanonicalPath().then(function (sPath) {
									sCanonicalPath = sPath;
									oParamsContext.delete();
								}).then(function () { //oParamsContext.delete() in the previous promise doesnt return anything upon success.
									if (oActiveContext.getPath() !== sCanonicalPath) {
										// the active context is using the sibling entity - this path is not accessible anymore as we deleted the draft
										// document - therefore we need to create a new context with the canonical path
										oActiveContext = oModel.bindContext(sCanonicalPath).getBoundContext();
									}
									return oActiveContext;
								});
							}
							break;
						case 'Sticky':
							return sticky.discardDocument(oContext).then(function(oContext) {
								oContext = bCreateMode ? false : oContext;
								if (oContext) {
									oContext.refresh();
								}
								return oContext;
							});
						case 'NonDraft':
							if (oParamsContext === oContext && bIsModified) {
								oContext.getBinding().resetChanges();
							}
							break;
					}
				}).then(function (context) {
					bIsModified = false;
					oUIModel.setProperty("/editable", 'Display');
					oUIModel.setProperty("/busy", false);
					// remove existing bound transition messages
					messageHandling.removeBoundTransitionMessages();
					// show unbound messages
					return messageHandling.showUnboundMessages().then(function(){
						return context;
					});
				}).catch(function (err) {
					oUIModel.setProperty("/busy", false);
					return messageHandling.showUnboundMessages().then(function() {
						return Promise.reject(err);
					});
				});
			},

			/**
			 * Save document
			 *
			 * @function
			 * @name sap.fe.controllerextensions.Transaction#saveDocument
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @static
			 * @param {sap.ui.model.odata.v4.Context} Context of the document that should be saved
			 * @returns {Promise} Promise resolves with ???
			 *
			 * @sap-restricted
			 * @final
			 */
			saveDocument: function (oContext) {
				var oUIModel = this.getUIModel(),
					oModel;
				var localI18nRef = sap.ui.getCore().getLibraryResourceBundle("sap.fe");
				// Double-Click-Protection if user executes action again until controls are really busy
				if (oUIModel.getProperty("/busy")) {
					return Promise.reject("Action can only be called once at a time");
				}
				if (!oContext) {
					return Promise.reject(new Error('Binding context to draft document is required'));
				}
				oUIModel.setProperty("/busy", true);

				// in case of saving / activating the bound transition messages shall be removed before the PATCH/POST
				// is sent to the backend
				messageHandling.removeBoundTransitionMessages();

				return this.getProgrammingModel(oContext).then(function (sProgrammingModel) {
					switch (sProgrammingModel) {
						case 'Draft':
							return draft.activateDocument(oContext);
						case 'Sticky':
							return sticky.activateDocument(oContext);
						case 'NonDraft':
							//This is submitting the in saved changes to backend
							oModel = oContext.getModel();
							oModel.submitBatch(oModel.getUpdateGroupId());
							return oContext;
						/* oUIModel.setProperty("/editable", 'Display');
						 break; */
					}
				}).then(function (oActiveDocument) {
					bIsModified = false;
					oUIModel.setProperty("/editable", 'Display');
					oUIModel.setProperty("/busy", false);
					MessageToast.show(localI18nRef.getText("OBJECT_SAVED"));
					return messageHandling.showUnboundMessages().then(function () {
						return oActiveDocument;
					});

				}).catch(function (err) {
					oUIModel.setProperty("/busy", false);
					return messageHandling.showUnboundMessages().then(function() {
						return Promise.reject(err);
					});
				});
			},

			/**
			 * Calls a bound/unbound action
			 * @function
			 * @static
			 * @name sap.fe.controllerextensions.Transaction.onCallAction
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @param {string} sActionName The name of the action to be called
			 * @param {map} [mParameters] contains the following attributes:
			 * @param {sap.ui.model.odata.v4.Context} [mParameters.contexts] contexts Mandatory for a bound action, Either one context or an array with contexts for which the action shall be called
			  * @param {sap.ui.model.odata.v4.ODataModel} [mParameters.model] oModel Mandatory for an unbound action, An instance of an OData v4 model
			 * @param {string} [mParameters.invocationGrouping] [Isolated] mode how actions shall be called: Changeset to put all action calls into one changeset, Isolated to put them into separate changesets (TODO: create enum)
			 * @param {string} [mParameters.label] a human-readable label for the action
			 * @returns {Promise} Promise resolves with an array of response objects (TODO: to be changed)
			 * @sap-restricted
			 * @final
			**/
			onCallAction: function (sActionName, mParameters) {
				mParameters = getParameters(mParameters);
				var oUIModel = this.getUIModel(),
					that = this,
					oContext,
					oModel,
					oPromise,
					sName;
				// Double-Click-Protection if user executes action again until controls are really busy
				if (oUIModel.getProperty("/busy")) {
					return Promise.reject("Action can only be called once at a time");
				}
				if (!sActionName) {
					return Promise.reject("Provide name of action to be executed");
				}
				// action imports are not directly obtained from the metaModel by it is present inside the entityContainer
				// and the acions it refers to present outside the entitycontainer, hence to obtain kind of the action
				// split() on its name was required
				sName = sActionName.split("/")[1];
				sActionName = sName || sActionName;
				if (mParameters.contexts) {
					oContext = Array.isArray(mParameters.contexts) ? mParameters.contexts[0] : mParameters.contexts;
					oModel = oContext.getModel();
				}
				if (mParameters.model) {
					oModel = mParameters.model;
				}
				if (!oModel) {
					Promise.reject("Pass a context for a bound action or pass the model for an unbound action");
				}
				var mBindingParameters = that._getBindingParameters(sActionName, oModel);
				if (oContext && oModel) {
					oPromise = operations.callBoundAction(sActionName, mParameters.contexts, oModel, {
						invocationGrouping: mParameters.invocationGrouping,
						label: mParameters.label,
						showActionParameterDialog: true,
						bindingParameters: mBindingParameters,
						onSubmitted: function () {
							oUIModel.setProperty("/busy", true);
						},
						parentControl : mParameters.parentControl,
						bIsCreateAction: mParameters.bIsCreateAction
					});
				} else {
					oPromise = operations.callActionImport(sActionName, oModel, {
						label: mParameters.label,
						showActionParameterDialog: true,
						bindingParameters: mBindingParameters,
						onSubmitted: function () {
							oUIModel.setProperty("/busy", true);
						},
						parentControl : mParameters.parentControl
					});
				}
				return oPromise.then(function (oResult) {
					// Succeeded
					oUIModel.setProperty("/busy", false);
					return messageHandling.showUnboundMessages().then(function() {
						return oResult;
					});
				}).catch(function (err) {
					oUIModel.setProperty("/busy", false);
					return messageHandling.showUnboundMessages().then(function() {
						return Promise.reject(err);
					});
				});
			},

			/**
			 * Get the query parameters for bound action from side effect, if annotated for provided action
			 * TODO: Add support for $expand when the model supports it.
			 * @function
			 * @static
			 * @name sap.fe.controllerextensions.Transaction._getBindingParameters
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @param {string} sActionName The name of the bound action for which to get the side effects
			 * @param {sap.ui.model.odata.v4.ODataModel} model Instance of OData v4 model
			 * @returns {map} Map of query parameters with $select and $expand
			 * @private
			 * @sap-restricted
			 */
			_getBindingParameters: function (sActionName, oModel) {
				var oMetaModel = oModel.getMetaModel(),
					oSideEffect = oMetaModel.getObject("/" + sActionName + '@com.sap.vocabularies.Common.v1.SideEffects');
				if (!oSideEffect) {
					return;
				}
				var mParameters = {},
					aTargetProperties = oSideEffect.TargetProperties,
					aTargetEntities = oSideEffect.TargetEntities;
				//add $select, $expand for properties
				if (Array.isArray(aTargetProperties) && aTargetProperties.length) {
					mParameters['$select'] = "";
					aTargetProperties.forEach(function (oProperty) {
						var sPropertyPath = oProperty['$PropertyPath'];
						if (sPropertyPath.indexOf('_it/') !== 0) {
							mParameters['$select'] += (sPropertyPath + ',');
						} else {
							mParameters['$expand'] = mParameters['$expand'] || "";
							mParameters['$expand'] += (sPropertyPath.slice(4) + ','); //remove '_it/' from the property path
						}
					});
					//remove trailing ','
					mParameters['$select'] = mParameters['$select'].slice(0, -1);
					mParameters['$expand'] = mParameters['$expand'] ? mParameters['$expand'].slice(0, -1) : undefined;
				}
				//add $expand for entity
				if (Array.isArray(aTargetEntities) && aTargetEntities.length) {
					//Not supported for now
				}
				return mParameters;
			},

			/**
			 * Shows a popover if it needs to be shown.
			 * TODO: Popover is shown if user has modified any data.
			 * TODO: Popover is shown if there's a difference from draft admin data.
			 * @function
			 * @static
			 * @name sap.fe.controllerextensions.Transaction._showDiscardPopover
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @param {sap.ui.core.Control} oCancelButton The control which will open the popover
			 * @returns {Promise} Promise resolves if user confirms discard, rejects if otherwise, rejects if no control passed to open popover
			 * @sap-restricted
			 * @final
			 * TODO: Implement this popover as a fragment as in v2??
			 */
			_showDiscardPopover: function (oCancelButton, bIsModified) {
				var that = this,
					oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe");
				that._bContinueDiscard = false;
				// to be implemented
				return new Promise(function (resolve, reject) {
					if (!oCancelButton) {
						reject("Cancel button not found");
					}
					//Show popover only when data is changed.
					if (bIsModified) {
						var fnOnAfterDiscard = function () {
							oCancelButton.setEnabled(true);
							if (that._bContinueDiscard) {
								resolve();
							} else {
								reject("Discard operation was rejected. Document has not been discarded");
							}
							that._oPopover.detachAfterClose(fnOnAfterDiscard);
						};
						if (!that._oPopover) {
							that._oPopover = new Popover({
								showHeader: false,
								placement: "Top",
								content: [
									new VBox({
										items: [
											new Text({
												//This text is the same as LR v2.
												//TODO: Display message provided by app developer???
												text: oResourceBundle.getText("SAPFE_DRAFT_DISCARD_MESSAGE")
											}),
											new Button({
												text: oResourceBundle.getText("SAPFE_DRAFT_DISCARD_BUTTON"),
												width: "100%",
												press: function () {
													that._bContinueDiscard = true;
													that._oPopover.close();
												}
											})
										]
									})
								],
								beforeOpen: function () {
									// make sure to NOT trigger multiple cancel flows
									oCancelButton.setEnabled(false);
								}
							});
							that._oPopover.addStyleClass("sapUiContentPadding");
						}
						that._oPopover.attachAfterClose(fnOnAfterDiscard);
						that._oPopover.openBy(oCancelButton);
					} else {
						resolve();
					}
				});
			},
			/**
			 * Sets the document to modified state on patch event
			 * @function
			 * @static
			 * @name sap.fe.controllerextensions.Transaction.handleDocumentModifications
			 * @memberof sap.fe.controllerextensions.Transaction
			 * @sap-restricted
			 * @final
			 */
			handleDocumentModifications: function() {
				bIsModified = true;
			}
		});

		return Extension;
	}
);