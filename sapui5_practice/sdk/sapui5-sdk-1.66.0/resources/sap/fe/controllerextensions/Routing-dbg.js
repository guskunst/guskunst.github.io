/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define([
		'sap/ui/core/mvc/ControllerExtension',
		"sap/m/MessagePage",
		"sap/m/Link",
		"sap/m/MessageBox",
		"sap/ui/core/routing/HashChanger",
		"sap/base/Log"],
	function (ControllerExtension, MessagePage, Link, MessageBox, HashChanger, Log) {
		'use strict';

		// used across controller extension instances
		var oUseContext,
			bDeferredContext,
			oAsyncContext,
			bTargetEditable,
			aOnAfterNavigation = [];

		/**
		 * {@link sap.ui.core.mvc.ControllerExtension Controller extension} for routing and navigation
		 *
		 * @namespace
		 * @alias sap.fe.controllerextensions.Routing
		 *
		 * @sap-restricted
		 * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
		 * @since 1.54.0
		 */
		var Extension = ControllerExtension.extend('sap.fe.controllerextensions.Routing', {
				/**
				 * Navigates to a context
				 *
				 * @function
				 * @name sap.fe.controllerextensions.Routing#navigateToContext
				 * @memberof sap.fe.controllerextensions.Routing
				 * @static
				 * @param {sap.ui.model.odata.v4.Context} context to be navigated to
				 * @param {map} [mParameters] Optional, can contain the following attributes:
				 * @param {boolean} [mParameters.noHistoryEntry] Navigate without creating a history entry
				 * @param {boolean} [mParameters.noHashChange] Navigate to the context without changing the URL
				 * @param {boolean} [mParameters.useCanonicalPath] Use canonical path
				 * @param {Promise} [mParameters.asyncContext] The context is created async, navigate to (...) and
				 *                    wait for Promise to be resolved and then navigate into the context
				 * @param {Boolean} [mParameters.deferredContext] The context shall be created deferred at the target page
				 * @param {Boolean} [mParameters.editable] The target page shall be immediately in the edit mode to avoid flickering
				 * @returns {Promise} Promise which is resolved once the navigation is triggered
				 *
				 * @sap-restricted
				 * @final
				 */

				navigateToContext: function (oContext, mParameters) {
					mParameters = mParameters || {};
					var oNavContainer = this._getOwnerComponent().getRootControl(),
						sPath,
						that = this;

					// store context
					if (oContext.getMetadata().getName() === "sap.ui.model.odata.v4.ODataListBinding") {
						if (mParameters.asyncContext) {
							// the context is either created async (Promise)
							mParameters.asyncContext.then(function (oContext) {
								// once the context is returned we navigate into it
								that.navigateToContext(oContext, {
									noHistoryEntry: true,
									noHashChange : mParameters.noHashChange,
									useCanonicalPath: mParameters.useCanonicalPath,
									editable: mParameters.editable
								});
							});

							// store async context context in singleton
							oAsyncContext = mParameters.asyncContext;

						} else if (mParameters.deferredContext) {
							bDeferredContext = true;
						} else {
							// Navigate to a list binding not yet supported
							throw ("navigation to a list binding is not yet supported");
						}

					} else {
						// Navigate to a context binding
						oUseContext = oContext;
					}

					bTargetEditable = mParameters.editable;

					if (mParameters.noHashChange){
						// there should be no URL change and therefore also no real navigation so just update the context
						this._bindTargetPage(oNavContainer, null, null, true);
						return;
					}

					// set navigation container to busy before initiating hash change
					// we only do this if the root control is a NavContainer
					// As a first version we also only do it if a history entry is created as otherwise usually no
					// navigation is triggered -> TODO: shall we introduce a new parameter for this?
					// using NavContainer afterNavigate event to reset this busy state
					if (!mParameters.noHistoryEntry && oNavContainer && oNavContainer.getMetadata().getName() === "sap.m.NavContainer") {
						oNavContainer.setBusy(true);
					}

					if (mParameters.useCanonicalPath) {
						sPath = oContext.getCanonicalPath();
					} else {
						sPath = oContext.getPath();
					}

					if (mParameters.asyncContext || mParameters.deferredContext) {
						// the context is deferred or async, we add (...) to the path
						sPath += '(...)';
					}

					// remove extra '/' at the beginning of path
					while (sPath.indexOf('/') === 0) {
						sPath = sPath.substr(1);
					}

					// TODO: what about the appState? Currently this one is just overwritten
					if (mParameters.noHistoryEntry) {
						HashChanger.getInstance().replaceHash(sPath);
					} else {
						HashChanger.getInstance().setHash(sPath);
					}

					// we resolve the promise once the navigation is triggered
					return Promise.resolve();
				},

				/*
				 * Reset Breadcrumb links
				 *
				 * @function
				 * @param {sap.ui.model.odata.v4.Context} [oContext] context of parent control
				 * @param {array} [aLinks] array of breadcrumb links {sap.m.Link}
				 * @description Used when context of the objectpage changes.
				 *              This event callback is attached to modelContextChange
				 *              event of the Breadcrumb control to catch context change.
				 *              Then element binding and hrefs are updated for each Link.
				 *
				 * @sap-restricted
				 * @experimental
				 */
				setBreadcrumbLinks: function (oContext, aLinks) {

					if (aLinks.length && oContext !== null) {
						if ((oContext === undefined) && (aLinks[0].getBindingContext() !== null)) {
							// To stop the bindingcontext from parent to propagate to the links on change of parent's context
							aLinks.forEach(function (oLink) {
								oLink.setBindingContext(null);
							});
							return;
						} else if (oContext && oContext.getPath()) {
							var sNewPath = oContext.getPath();
							// Checking if links are already created
							var sLinkPath = aLinks[aLinks.length - 1].getElementBinding() && aLinks[aLinks.length - 1].getElementBinding().getPath();
							if (sLinkPath && sNewPath.indexOf(sLinkPath) > -1) {
								return;
							}

							var sAppSpecificHash = HashChanger.getInstance().hrefForAppSpecificHash("");
							var sPath = "", aPathParts = sNewPath.split("/");

							sAppSpecificHash = sAppSpecificHash.split("/")[0];
							aPathParts.shift();
							aPathParts.splice(-1, 1);
							for (var i = 0; i < aLinks.length; i++) {
								var oLink = aLinks[i];
								sPath = sPath + "/" + aPathParts[i];
								oLink.setHref(sAppSpecificHash + sPath);
								oLink.bindElement({
									path: sPath,
									parameters: {
										$$groupId: '$auto.associations' // GroupId might be changed in future
									}
								});
							}
						}
					}
				},

				/**
				 * Triggers an outbound navigation
				 *
				 * @function
				 * @name sap.fe.controllerextensions.Routing#navigateOutbound
				 * @memberof sap.fe.controllerextensions.Routing
				 * @static
				 * @param {string} outboundTarget name of the outbound target (needs to be defined in the manifest)
				 * @param {sap.ui.model.odata.v4.Context} Context that contain the data for the target app
				 * @returns {Promise} Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
				 *
				 * @sap-restricted
				 * @final
				 */
				navigateOutbound: function (sOutboundTarget, oContext) {
					var oOutbounds = this._getOutbounds(),
						oDisplayOutbound = oOutbounds[sOutboundTarget];

					if (oDisplayOutbound) {
						var oParameters = {};
						if (oDisplayOutbound.parameters) {

							for (var sParameter in oDisplayOutbound.parameters) {
								if (oDisplayOutbound.parameters[sParameter].value.format === "binding") {
									oParameters[sParameter] = oContext.getProperty(oDisplayOutbound.parameters[sParameter].value.value);
								}
							}
						}
						var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
						oCrossAppNavigator && oCrossAppNavigator.toExternal({
							target: {
								semanticObject: oDisplayOutbound.semanticObject,
								action: oDisplayOutbound.action
							},
							params: oParameters
						});

						return Promise.resolve();
					} else {
						throw new Error("outbound target " + sOutboundTarget + " not found in cross navigation definition of manifest");
					}
				},

				/**
				 * Creates and navigates a message page to show an error
				 *
				 * @function
				 * @name sap.fe.controllerextensions.Routing#navigateToContext
				 * @memberof sap.fe.controllerextensions.Routing
				 * @static
				 * @param {string} errorMessage A human readable error message
				 * @param {map} [mParameters] Optional, can contain the following attributes:
				 * @param {sap.m.NavContainer} [mParameters.navContainer] Instance of a sap.m.NavContainer if not specified the method expects tha owner component of the view to be the navigation container
				 * @param {string} [mParameters.description] A human readable description of the error
				 * @param {string} [mParameters.technicalMessage] Technical Message
				 * @param {string} [mParameters.technicalDetails] Further technical details
				 * @returns {Promise} Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
				 *
				 * @sap-restricted
				 * @final
				 */
				navigateToMessagePage: function (sErrorMessage, mParameters) {
					var oNavContainer = mParameters.navContainer || this._getOwnerComponent().getRootControl();

					if (!this.oMessagePage) {
						this.oMessagePage = new MessagePage({
							showHeader: false,
							icon: "sap-icon://message-error"
						});

						oNavContainer.addPage(this.oMessagePage);
					}

					this.oMessagePage.setText(sErrorMessage);

					if (mParameters.technicalMessage) {
						this.oMessagePage.setCustomDescription(
							new Link({
								text: mParameters.description || mParameters.technicalMessage,
								press: function () {
									MessageBox.show(mParameters.technicalMessage, {
										icon: MessageBox.Icon.ERROR,
										title: mParameters.title,
										actions: [MessageBox.Action.OK],
										defaultAction: MessageBox.Action.OK,
										details: mParameters.technicalDetails || "",
										contentWidth: "60%"
									});
								}
							})
						);
					} else {
						this.oMessagePage.setDescription(mParameters.description || '');
					}

					oNavContainer.to(this.oMessagePage);
				},

				/**
				 * This sets the dirty state of an entity set in the app which can later be fetched via
				 * via getDirtyState, for example, to be used in order to decide if a binding refresh is required or not
				 *
				 * @function
				 * @name sap.fe.controllerextensions.Routing#setDirtyState
				 * @memberof sap.fe.controllerextensions.Routing
				 * @static
				 * @param {sap.ui.model.odata.v4.Context} context for which state has to be set dirty
				 * @param {boolean} whether entity set is dirty or not
				 *
				 * @sap-restricted
				 * @final
				 */
				setDirtyState: function (oContext, bDirty) {
					if (typeof oContext === "string") {
						// if path is passed as string
						sap.fe.controllerextensions.Routing.mAppDirtyState[oContext] = bDirty;
					} else {
						var sPath = oContext.getPath();
						if (sPath) {
							// for new context currently getPath returns '/<entitySet>/-1' . Example, '/Artists/-1' hence this is check is reuired for the time being
							// Once getPath returns the proper path this check can be removed
							if (sPath.indexOf('/-1') !== -1) {
								sPath = sPath.substring(0, sPath.indexOf('/-1'));
							} else {
								sPath = sPath.substring(0, sPath.lastIndexOf('('));
							}
							// TODO: Discuss this later to come up with a better solution
							if (sPath.lastIndexOf('/') !== -1) {
								// remove the Navigation property path to get the parent page context to set dirty
								sPath = sPath.substring(0, sPath.lastIndexOf('/'));
							}
							sap.fe.controllerextensions.Routing.mAppDirtyState[sPath] = bDirty;
						} else {
							Log.error(sPath + " could not be marked dirty");
						}
					}
				},
				/**
				 * Resets the dirty state to the initial state
				 *
				 * @function
				 * @name sap.fe.controllerextensions.Routing#getDirtyState
				 * @memberof sap.fe.controllerextensions.Routing
				 * @static
				 *
				 * @sap-restricted
				 * @final
				 */
				resetDirtyState: function () {
					sap.fe.controllerextensions.Routing.mAppDirtyState = {};
				}, /**
				 * Returns the dirty state of the given entity set
				 *
				 * @function
				 * @name sap.fe.controllerextensions.Routing#getDirtyState
				 * @memberof sap.fe.controllerextensions.Routing
				 * @static
				 * @param {string} path of entity set which should be marked dirty
				 * @returns {object} Object containing the dirty bindings
				 * @sap-restricted
				 * @final
				 */
				getDirtyState: function (sPath) {
					return sPath ? sap.fe.controllerextensions.Routing.mAppDirtyState[sPath] : sap.fe.controllerextensions.Routing.mAppDirtyState;
				},
				/**
				 * This initializes and extends the routing as well as the attaching to hash changes
				 *
				 * @function
				 * @name sap.fe.controllerextensions.Routing#initializeRouting
				 * @memberof sap.fe.controllerextensions.Routing
				 * @static
				 * @param {sap.ui.core.Component} application component owning the routing
				 *
				 * @sap-restricted
				 * @final
				 */
				initializeRouting: function (oAppComponent) {
					var oRouter = oAppComponent.getRouter(),
						fnRouteMatched,
						bNavigationEventsAttached = false,
						that = this,
						sEntitySet = getEntitySet(oAppComponent),
						sPath,
						oComponentData = oAppComponent.getComponentData(),
						oStartUpParameters = oComponentData && oComponentData.startupParameters,
						oModel = oAppComponent.getModel(),
						bHasStartUpParameters = oStartUpParameters !== undefined && Object.keys(oStartUpParameters).length !== 0;

					// as the controller extension and it's globals are used across apps we have to reset them
					oUseContext = null;
					bDeferredContext = false;
					oAsyncContext = null;
					bTargetEditable = false;
					aOnAfterNavigation = [];

					function getEntitySet(oAppComponent) {
						var sEntitySet;
						var oManifest = oAppComponent.getManifest();
						var aRoutes = oManifest["sap.ui5"].routing.routes;
						var oTargets = oManifest["sap.ui5"].routing.targets;
						var sPattern;
						for (var i = 0; i < aRoutes.length; i++) {
							sPattern = aRoutes[i].pattern;
							if (sPattern === "" || ":?query:") {
								sEntitySet = oTargets[aRoutes[i].target].options && oTargets[aRoutes[i].target].options.settings && oTargets[aRoutes[i].target].options.settings.entitySet;
								break;

							}
						}
						//This check is made to make sure we only handle sap.fe.ObjectPage but not a blankcanvas.Currently we only handle scenarios where LR entityset is same as OP entityset but in future we might have remove this when we have to handle usecase when entityset of LR and OP is not same
						for (var j = 0; j < aRoutes.length; j++) {
							sPattern = aRoutes[i].pattern;
							if ((sPattern !== "" || ":?query:") && (oTargets[aRoutes[j].target].options && oTargets[aRoutes[j].target].options.settings && oTargets[aRoutes[j].target].options.settings.entitySet === sEntitySet) && (oTargets[aRoutes[j].target].name === "sap.fe.templates.ObjectPage")) {
								return sEntitySet;
							}
						}
						if (sEntitySet == undefined) {
							if (aRoutes.length === 1) {
								sEntitySet = aRoutes[0].pattern.split('(')[0];
								return sEntitySet;
							}
						}
					}
				fnRouteMatched = function (oEvent) {
					var mArguments = oEvent.getParameters().arguments,
						sTarget = "",
						sKey,
						bDeferred;

					that.fireOnAfterNavigation();

					var oNavContainer = oAppComponent.getRootControl();

					// if the root control is a NavContainer, it is set to busy when navigateToContext
					// handler to reset the busy state is attached once here
					if (!bNavigationEventsAttached && oNavContainer && oNavContainer.getMetadata().getName() === "sap.m.NavContainer") {
						oNavContainer.attachAfterNavigate(function () {
							oNavContainer.setBusy(false);
						});
						bNavigationEventsAttached = true;
					}

					if (Object.keys(mArguments).length > 0) {
						// get route pattern and remove query part
						sTarget = oEvent.getParameters().config.pattern;
						// 	the query name is static now but can be also a parameter in the future
						sTarget = sTarget.replace(":?query:", "");

						for (var p in mArguments) {
							sKey = mArguments[p];
							if (sKey === '...') {
								bDeferred = true;
								// Sometimes in preferredMode = create, the edit button is shown in background when the
								// action parameter dialog shows up, setting bTargetEditable passes editable as true
								// to onBeforeBinding in _bindTargetPage function
								bTargetEditable = true;
							}
							sTarget = sTarget.replace('{' + p + '}', sKey);
						}

						// the binding target is always absolute
						sTarget = sTarget && '/' + sTarget;
					}

					that._bindTargetPage(oNavContainer, sTarget, bDeferred);
				};
				if (bHasStartUpParameters) {
					if ( oStartUpParameters.preferredMode && oStartUpParameters.preferredMode[0] === 'create') {
						if (sEntitySet) {
							sPath = sEntitySet + '(...)';
						} else {
							Log.error('Cannot handle this App');
						}
						HashChanger.getInstance().replaceHash(sPath);
						oRouter.attachRouteMatched(fnRouteMatched);
						oRouter.initialize();
					} else {
						oModel.getMetaModel().requestObject("/$EntityContainer/" + sEntitySet + "/$Type/").then(function (oEntityType) {
							var aTechnicalKeys = oEntityType["$Key"];
							if (oStartUpParameters && aTechnicalKeys && oStartUpParameters[aTechnicalKeys[0]]) {
								sPath = sEntitySet + "(";
								if (aTechnicalKeys.length === 1) {
									sPath = (oEntityType[aTechnicalKeys[0]].$Type === "Edm.String") ? sPath + "'" + oStartUpParameters[aTechnicalKeys[0]][0] + "'" : sPath + oStartUpParameters[aTechnicalKeys[0]][0];
								} else {
									for (var i = 0; i < aTechnicalKeys.length; i++) {
										if (oStartUpParameters[aTechnicalKeys[i]]) {
											if (i !== aTechnicalKeys.length - 1) {
												sPath = (oEntityType[aTechnicalKeys[i]].$Type === "Edm.String") ? sPath + aTechnicalKeys[i] + "='" + oStartUpParameters[aTechnicalKeys[i]][0] + "'," : sPath + aTechnicalKeys[i] + "=" + oStartUpParameters[aTechnicalKeys[i]][0] + ",";
											} else {
												sPath = (oEntityType[aTechnicalKeys[i]].$Type === "Edm.String") ? sPath + aTechnicalKeys[i] + "='" + oStartUpParameters[aTechnicalKeys[i]][0] + "'" : sPath + aTechnicalKeys[i] + "=" + oStartUpParameters[aTechnicalKeys[i]][0];
											}
										} else {
											sPath = undefined;
											break;
										}
									}
								}
								if (sPath){
									sPath = sPath + ")";
									HashChanger.getInstance().replaceHash(sPath);
								}

							}
							oRouter.attachRouteMatched(fnRouteMatched);
							oRouter.initialize();
						}).catch(function (oError) {
							Log.Error("Metadata not loaded");
						});
					}
				} else {
					oRouter.attachRouteMatched(fnRouteMatched);
					oRouter.initialize();
				}
			},

				_bindTargetPage : function(oNavContainer, sTarget, bDeferred, bNoHashChange){
					var oTargetControl = oNavContainer.getCurrentPage(),
						fnOnBeforeBinding = (oTargetControl.getComponentInstance().onBeforeBinding || Promise.resolve).bind(oTargetControl.getComponentInstance()),
						fnOnAfterBinding = (oTargetControl.getComponentInstance().onAfterBinding || Promise.resolve).bind(oTargetControl.getComponentInstance()),
						oBindingContext,
						sBindingContextPath;

					if (bDeferred) {
						// TODO: set empty context to be checked with model colleagues

						// pass the parameters to the onbeforebinding
						fnOnBeforeBinding(null, {editable: bTargetEditable});

						if (bDeferredContext || !oAsyncContext) {
							// either the context shall be created in the target page (deferred Context) or it shall
							// be created async but the user refreshed the page / bookmarked this URL
							// TODO: currently the target component creates this document but we shall move this to
							// a central place
							if (oTargetControl.getMetadata().getName() === "sap.ui.core.ComponentContainer" &&
								oTargetControl.getComponentInstance().createDeferredContext) {
								oTargetControl.getComponentInstance().createDeferredContext(sTarget);
							}
						}

						oAsyncContext = null;
						bDeferredContext = false;

						// remove the context to avoid showing old data
						oTargetControl.setBindingContext(null);

						return false;
					}

					if (!bNoHashChange) {
						oBindingContext = oTargetControl.getBindingContext();
						sBindingContextPath = oBindingContext && oBindingContext.getPath();
					}

					if (bNoHashChange || sBindingContextPath !== sTarget) {
						if (sTarget || bNoHashChange) {
							if (!oUseContext || oUseContext.getBinding().isA('sap.ui.model.odata.v4.ODataListBinding')) {
								// there's no context, the user refreshed the page or used a bookmark, we need to
								// create a new context with the path from the URL
								// as setting the context with a return value context currently doesn't work we
								// also create a new context in this case - to be discussed with v4 model team
								var oHiddenBinding = oTargetControl.getModel().bindContext(sTarget, undefined,
									{$$patchWithoutSideEffects: true, $$groupId: '$auto'});
								oUseContext = oHiddenBinding.getBoundContext();


							}

							oBindingContext = oUseContext;
							fnOnBeforeBinding(oBindingContext, {editable: bTargetEditable}).then(function () {
								oTargetControl.setBindingContext(oBindingContext);
								fnOnAfterBinding(oBindingContext);
							});

							oUseContext = null;
						} else if (sTarget === "") {
							fnOnBeforeBinding(null).then(function () {
								fnOnAfterBinding(null);
							});
						}
					} else if (Object.keys(sap.fe.controllerextensions.Routing.mAppDirtyState).length > 0) {
						// TODO: this is just a first workaround. Once the model supports synchronization this is not needed anymore
						oBindingContext.refresh();
					}
				},

				attachOnAfterNavigation : function(fnHandler){
					aOnAfterNavigation.push(fnHandler);
				},

				detachOnAfterNavigation : function(fnHandler){
					for (var i = 0; i < aOnAfterNavigation.length; i++){
						if (aOnAfterNavigation[i] === fnHandler){
							aOnAfterNavigation.splice(i,1);
						}
					}
				},

				fireOnAfterNavigation : function(){
					for (var i = 0; i < aOnAfterNavigation.length; i++){
						aOnAfterNavigation[i]();
					}
					aOnAfterNavigation = [];
				},

				_getOutbounds: function () {
					if (!this.outbounds) { // in the future we might allow setting the outbounds from outside
						if (!this.manifest) { // in the future we might allow setting the manifest from outside
							// as a fallback we try to get the manifest from the view's owner component

							this.manifest = this._getOwnerComponent().getMetadata().getManifest();
						}
						this.outbounds = this.manifest["sap.app"] && this.manifest["sap.app"].crossNavigation && this.manifest["sap.app"].crossNavigation.outbounds;
					}

					return this.outbounds;
				},

				_getOwnerComponent: function () {
					// this.base does not have the getOwnerComponent - as a workaround we get the view and again
					// the controller to access the owner component
					return this.base.getView().getController().getOwnerComponent();
				}

			})
			;

		// TODO: get rid of this dirty logic once model supports synchronization
		// as long as it doesn't we park the dirty state into one singleton
		sap.fe.controllerextensions.Routing.mAppDirtyState = {};

		return Extension;
	}
);