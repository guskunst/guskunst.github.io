/**
 * tests for the sap.suite.ui.generic.template.lib.CommonEventHandlers
 */

sap.ui.define(
		["sap/ui/comp/smarttable/SmartTable", "sap/m/Table", "sap/ui/table/AnalyticalTable", "sap/m/MessageBox", "sap/ui/base/Event", "sap/ui/model/json/JSONModel",
		 "testUtils/sinonEnhanced", "sap/suite/ui/generic/template/lib/CommonEventHandlers", "sap/ui/model/Context",
		 "sap/ui/model/odata/v2/ODataModel", "sap/suite/ui/generic/template/lib/testableHelper", "sap/suite/ui/generic/template/js/AnnotationHelper", "sap/ui/generic/app/navigation/service/SelectionVariant"],
		 function(SmartTable, MTable, ATable, MessageBox, Event, JSONModel, sinon, CommonEventHandlers, Context, ODataModel, testableHelper, AnnotationHelper, SelectionVariant) {
			"use strict";

			// sut
			var oCommonEventHandlers;

			// variables for spies
			var oNavigateFromListItemArguments;
			var bCRUDManagerCallActionCalled;
			var oNavigationHandlerNavigateArguments;
			var oNavigationHandlerMixAttributesArguments;
			var sNavigationParameters;
			var oNavigationHandler = {
					navigate: function() {
						oNavigationHandlerNavigateArguments = arguments;
					},
					mixAttributesAndSelectionVariant: function() {
						oNavigationHandlerMixAttributesArguments = arguments;
						return {
							toJSONString: function(){
								return sNavigationParameters;
							},
							getParameterNames: function(){return [];}
						};
					}
			};
			var oGetManifestEntryArguments;
			var oCommonUtilsGetTextArguments;

			// configuration of stubs
			var oOutbound; // outbound defined in manifest
			var sCrossNavigationOutbound; // Outbound defined in Manifest
			var aSelectedContexts = []; // selected context
			var oHeaderBindingContext = {getObject: jQuery.noop}; // header context for object page
			var mModels;
			// preperation for all tests the same
			var oController = {
					getMetadata: function () {
						return {
							getName :  function () { return ""; }
						};
					},
					getOwnerComponent: function() {
						return {
							getAppComponent: function() {
								return {
									getManifestEntry: function() {
										oGetManifestEntryArguments = arguments;
										var oOutbounds = {};
										oOutbounds[sCrossNavigationOutbound] = oOutbound;
										return {
											crossNavigation: {
												outbounds: oOutbounds
											}
										};
									}
								};
							},
							getModel: function(sName){
								var oModel = mModels[sName];
								if (!oModel){
									oModel = new JSONModel();
									 mModels[sName] = oModel;
								}
								return oModel;
							}
						};
					},
					getView: function() {
						return {
								getBindingContext: function() {
									return oHeaderBindingContext;
								},
								getModel: function() {
									return {
										hasPendingChanges: function() {
											return false;
										},
										getMetaModel: function() {
											return {
												getODataEntitySet: function() {
													return {entityType:"ProductType"};
												},
												getODataEntityType: function() {
													return {
														"com.sap.vocabularies.UI.v1.HeaderInfo": {
															Title: {
																Value: {
																	Path: "SalesOrderItem"
																}
															}
														},
														key: {
															propertyRef: ""
														}
													};
												},
												getODataFunctionImport: function() {
													return {
														"sap:applicable-path":"Multimsg_ac"
													};
												}
											};
										},
										getObject: function(sPath) {
											var aObject = [
															{ Multimsg_ac: true, SalesOrder: "500000126", SalesOrderItem: "10" },
															{ Multimsg_ac: false, SalesOrder: "500000126", SalesOrderItem: "20" }
														];
											var sItem = sPath.slice(sPath.indexOf("'") + 1 , sPath.lastIndexOf("'"));
											for (var key in aObject) {
												if (aObject[key].SalesOrderItem === sItem) {
													return aObject[key];
												}
											}
										}
									};
								},
								getId: function() {
									return "";
								}
						};
					},
					adaptNavigationParameterExtension: jQuery.noop
			};

			// the smart table will have a sap.m.Table or a sap.ui.table.AnalyticalTable
			var oMTable = sinon.createStubInstance(MTable);
			oMTable.getMetadata.returns({
				getName: function () {
					return "sap.m.Table";
				}
			});

			var oATable = sinon.createStubInstance(ATable);
			oATable.getMetadata.returns({
				getName: function () {
					return "sap.ui.table.AnalyticalTable";
				}
			});
			oATable.getColumns.returns([]);
			oATable.getGroupedColumns.returns([]);

			var oSmartTable = sinon.createStubInstance(SmartTable);
			oSmartTable.getMetadata.returns({
				getName: function () {
					return "sap.ui.comp.smarttable.SmartTable";
				}
			});
			oSmartTable.data = function (sName) {
				if (sName) {
					return this.mTest.mCustomData[sName];
				}
				return this.mTest.mCustomData;
			};
			oSmartTable.getModel = function () {
				return {
					getMetaModel: function () {
						return {
							getODataEntitySet: function (sEntitySet) {
								return {
									entityType: "entityType"
								};
							},
							getODataEntityType: function () {
								return { };
							},
							getODataProperty: function (oEntityType, sProperty) {
								return oSmartTable.mTest.mMetadata[sProperty] || "";
							}
						};
					},
					getResourceBundle: function () {
						return {
							getText: function (sKey) {
								return (sKey === "YES") ? "Yes" : (sKey === "NO") ? "No" : null;
							}
						};
					}
				};
			};
			oSmartTable.getTable.returns(oMTable); // table of type sap.m.Table or sap.ui.AnalyticalTable
			oSmartTable.getCustomData.returns([]);
			oSmartTable.getEntitySet.returns("entityset");
			oSmartTable.mTest = {
				mMetadata: { },
				mCustomData: {
					dateFormatSettings: '{"UTC":true,"style":"medium"}' //or: '{"style":"medium"}'
				}
			};

			var oTemplateUtils = {
					oCommonUtils: {
						getDialogFragment: function (sName, oFragmentController, sModel, fnOnFragmentCreated) {
							var oFragment = sap.ui.xmlfragment(oController.getView().getId(), sName, oFragmentController);
							var oModel;
							if (sModel) {
								oModel = new JSONModel();
								oFragment.setModel(oModel, sModel);
							}
							return oFragment;
						},
						isSmartTable: function(oControl){
							return oControl === oSmartTable;
						},
						isSmartChart: function(oControl){
							return false;
						},
						isAnalyticalTable: function(oControl){
							return oControl === oATable;
						},
						isMTable: function(oControl){
							return oControl instanceof MTable;
						},
						getSelectedContexts: function(oControl) {
							return aSelectedContexts;
						},
						getNavigationHandler: function() {
							return oNavigationHandler;
						},
						getElementCustomData : function (){
							return {
								Action : "Test_Action",
								SemanticObject : "Test_Semantic_Object"
							};
						},
						getContentDensityClass: jQuery.noop
					},
					oComponentUtils: {
						getViewLevel: function(){
							return 1;
						},
						isDraftEnabled: function () {
							return false;
						}
					},
					oServices: {
						oApplication: {
							getBusyHelper: function() {
								return {
									isBusy: function() {
										return false;
									}
								};
							},
							getNavigationProperty: function(sProperty){
								return null;	
							},
							performAfterSideEffectExecution : function(fnFunction){
								fnFunction();
							}
						},
						oDraftController: {
							getDraftContext: function() {
								return {
									isDraftEnabled: function () {
										return false;
									}
								}; }
						}
					}
			};

			var sandbox;
			var oStubForPrivate;

			module("lib.CommonEventHandlers", {
				setup: function() {
					oStubForPrivate = testableHelper.startTest();
					sandbox = sinon.sandbox.create();
					mModels = Object.create(null);
					sandbox.stub(MessageBox, "error", function() {
						var Log = sap.ui.require("sap/base/Log");
						Log.debug("sap.m.MessageBox.error called... (replaced for test with Sinon Stub)");
					});

					oTemplateUtils.oCommonUtils.getText = function(sKey) {
						oCommonUtilsGetTextArguments = arguments;
					};
					oTemplateUtils.oCommonUtils.getOwnerControl = function(oSourceControl) {
						var oCurrentControl = oSourceControl;
						while (oCurrentControl) {
							// Test for sap.m.Table
							if (oCurrentControl instanceof MTable) {
								return oCurrentControl;
							}
							// Get parent control until sap.m.Table is found
							if (oCurrentControl.getParent){
								oCurrentControl = oCurrentControl.getParent();
							} else {
								oSmartTable.getTable().getMode = function() {
									return "MultiSelect";
								};
								oSmartTable.getTable().getSelectionMode = function() {
									return "MultiToggle";
								};

								return oSmartTable;
							}
						}
						return oSmartTable;
					};
					oTemplateUtils.oCommonUtils.getTableBindingInfo = jQuery.noop;
					oTemplateUtils.oCommonUtils.processDataLossConfirmationIfNonDraft = function(resolve) {
						resolve();
					};
					oTemplateUtils.oCommonUtils.navigateFromListItem = function() {
						oNavigateFromListItemArguments = arguments;
					};
					oTemplateUtils.oServices.oNavigationController = {};
					oTemplateUtils.oServices.oCRUDManager = {
						callAction: function() {
							bCRUDManagerCallActionCalled = true;

							return {
								then : jQuery.noop
							};
						}
					};

					oCommonEventHandlers = new CommonEventHandlers(oController, oTemplateUtils.oComponentUtils,
							oTemplateUtils.oServices, oTemplateUtils.oCommonUtils);

				},
				teardown: function() {
//					oMessageBoxStub.restore();
					sandbox.restore();
					testableHelper.endTest();
				}
			});

			QUnit.test("Dummy", function() {
				ok(true, "Test - Always Good!");
			});

			QUnit.test("Function onCallActionFromToolBar", function(assert) {
						var oEvent = sinon.createStubInstance(Event);

						oEvent.getSource.returns({
							getParent: function() {
								return {
									getParent: function() {
										return {
											getTable: jQuery.noop
										};
									}
								};
							},
							data: function() {
								return { Action: "Entities/ProductTypeMultimsg", Label:"Transient Message" };
							}
						});

						/* ACTIONS THAT CALL FUNCTION IMPORT (UI.DataFieldForAction) */
						//NO ITEM SELECTED IS NO MORE SUPPORTED and Hence removed the relevant qunit
						// ONE ITEM SELECTED: supported
						bCRUDManagerCallActionCalled = false;
						aSelectedContexts.push({ getPath: function() { return "/ProductType(SalesOrderItem = '10')"; }, sPath:"/ProductType()", getProperty: function() { return "10"; }});
						var oState = {};
						oCommonEventHandlers.onCallActionFromToolBar(oEvent, oState);

						assert.strictEqual(bCRUDManagerCallActionCalled, true, "ONE ITEM SELECTED: supported; check that processing is allowed");

						// MULTIPLE ITEMS SELECTED: supported
						bCRUDManagerCallActionCalled = false;
						aSelectedContexts.push({ getPath: function() { return "/ProductType(SalesOrderItem = '20')"; }, sPath:"/ProductType()", getProperty: function() { return "20"; }});
						oCommonEventHandlers.onCallActionFromToolBar(oEvent, oState);

						this.getActionDialog = function() {
							return sap.ui.getCore().byId("actionConfirmationDialog");
						}
						this.getActionDialog().getBeginButton().firePress();

						assert.strictEqual(bCRUDManagerCallActionCalled, true, "MULTIPLE ITEMS SELECTED: function import actions on multiple instances --> not supported; check that processing is not allowed");

						/* ACTIONS THAT PERFORM NAVIGATION (UI.DataFieldForIntentBasedNavigation) */
						// NO ITEM SELECTED: supported
						oNavigationHandlerNavigateArguments = undefined;
						aSelectedContexts = [];
						oState = {};
						oCommonEventHandlers.onDataFieldForIntentBasedNavigation(oEvent, oState);

						assert.ok(oNavigationHandlerNavigateArguments, "NO ITEM SELECTED: supported; check that processing is allowed");

						// ONE ITEM SELECTED: supported
						oNavigationHandlerNavigateArguments = undefined;
						var oContext = new Context();
						oContext.oModel = new ODataModel("abc", {});
						oContext.sPath = "abc";
						aSelectedContexts.push(oContext);
						oState = {};
						oCommonEventHandlers.onDataFieldForIntentBasedNavigation(oEvent, oState);

						assert.ok(oNavigationHandlerNavigateArguments, "ONE ITEM SELECTED: supported; check that processing is allowed");

						// MULTIPLE ITEMS SELECTED: navigation to multiple instances --> currently not supported
						oNavigationHandlerNavigateArguments = undefined;
						aSelectedContexts.push(oContext);
						oState = {};
						oState.aMultiContextActions = null;
						oCommonEventHandlers.onDataFieldForIntentBasedNavigation(oEvent, oState);

						assert.equal(oNavigationHandlerNavigateArguments, undefined, "MULTIPLE ITEMS SELECTED: navigation to multiple instances --> not supported; check that processing is not allowed");
					});

			 QUnit.test("Function fnMergeContextObjects - Parameters should not be added to SelectOptions in case of Parameterized EntitySet", function (assert) {
				 var oEvent = sinon.createStubInstance(Event);
				 oEvent.getSource.returns({
					 getParent: function () {
						 return {
							 getParent: function () {
								 return {
									 getTable: jQuery.noop
								 };
							 }
						 };
					 },
					 data: function () {
						 return true;
					 }
				 });
				 var aParameters = [{ PropertyName: "P_ExchangeRateType", PropertyValue: "M" }, { PropertyName: "P_DisplayCurrency", PropertyValue: "USD" }];
				 var oSmartFilterbarVariant = {
					 Parameters: aParameters
				 };
				 var oState = {
					 oSmartFilterbar: {
						 getUiState: function () {
							 return {
								 getSelectionVariant: function () {
									 return oSmartFilterbarVariant;
								 }
							 };
						 }
					 }
				 };
				 var aMultipleContexts = [{
					 getObject: function () {
						 var obj = {
							 ABOPVariantName: "X",
							 ABOPVariantUUID: "Y",
							 P_ExchangeRateType: "M",
							 P_DisplayCurrency: "USD"
						 }
						 return obj;
					 }
				 },
				 {
					 getObject: function () {
						 var obj = {
							 ABOPVariantName: "A",
							 ABOPVariantUUID: "B",
							 P_ExchangeRateType: "M",
							 P_DisplayCurrency: "USD"
						 }
						 return obj;
					 }
				 }];
				 var getSelectedContextsStub = sinon.stub(oTemplateUtils.oCommonUtils, "getSelectedContexts");
				 getSelectedContextsStub.returns(aMultipleContexts);
				 var processDataLossConfirmationIfNonDraftStub = sinon.stub(oTemplateUtils.oCommonUtils, "processDataLossConfirmationIfNonDraft", function (fnHandleMultiContextIBN) {
					 fnHandleMultiContextIBN();
				 });
				 oCommonEventHandlers.onDataFieldForIntentBasedNavigation(oEvent, oState);
				 processDataLossConfirmationIfNonDraftStub.restore();
				 getSelectedContextsStub.restore();
				 var oSelectionVariant = new SelectionVariant(oNavigationHandlerNavigateArguments[2]);
				 assert.equal(oSelectionVariant.getSelectOptionsPropertyNames().length, 2, "Selection Options does not contain input parameters");
			 });

			QUnit.test("onListNavigate (chevron) -> Navigation to object page", function(assert) {
				// configure stubs
				aSelectedContexts = [];
				// prepare input
				var oContext = {};
				var oEventSource = {
						getParent: function() {
							return oMTable;
						},
						getBindingContext: function() {
							return oContext;
						},
						getId: jQuery.noop,
						data: jQuery.noop
				};
				// initialize spies
				oNavigateFromListItemArguments = undefined;
				// execute
				var oState = {};
				sandbox.stub(oTemplateUtils.oComponentUtils, "setPaginatorInfo");
				oCommonEventHandlers.onListNavigate(oEventSource, oState);
				// check
				assert.equal(oNavigateFromListItemArguments.length, 2,
				"onListNavigate (chevron) -> navigate called with two parameters");
				assert.equal(oNavigateFromListItemArguments[0], oContext, "first parameter is the given context");
				assert.equal(oNavigateFromListItemArguments[1], oMTable, "second parameter is the table");
			});

			QUnit.test("onListNavigate (Intent) (generic checks)", function(assert) {
				// configure stubs
				oOutbound = {
						semanticObject: "Test Semantic Object",
						action: "Test Action"
				};
				sCrossNavigationOutbound = "Test Outbound";
				// prepare input
				var oEventSource = {
						data: function() {
							return sCrossNavigationOutbound;
						},
						getBindingContext: function() {
							return {
								getObject: jQuery.noop
							};
						},
						getId: jQuery.noop
				};
				// initialize spies
				oNavigationHandlerNavigateArguments = undefined;
				oGetManifestEntryArguments = undefined;
				// execute
				var oState = {};
				oCommonEventHandlers.onListNavigate(oEventSource, oState);
				// check
				assert.equal(oNavigationHandlerNavigateArguments.length, 5,
				"onListNavigate -> navigation handler called with five parameters");

				assert.equal(oGetManifestEntryArguments.length, 1, "Get Manifest Entry called with one parameter");
				assert.equal(oGetManifestEntryArguments[0], "sap.app", "to read the manifest entry for sap.app");

				assert.equal(oNavigationHandlerNavigateArguments[0], oOutbound.semanticObject,
				"First parameter: semantic object defined in manifest");
				assert.equal(oNavigationHandlerNavigateArguments[1], oOutbound.action,
				"Second parameter: Action defined in manifest");

				assert.equal(typeof oNavigationHandlerNavigateArguments[4], "function",
				"Fifth parameter: A function to handle errors");
				// oNavigationHandlerNavigateArguments[4] && oNavigationHandlerNavigateArguments[4](oError);
				// assert.equal(false, true, "tbd: check function to handle errors ");
			});

			QUnit.test("onListNavigate (Intent) (ListReport specific)", function(assert) {
				// configure stubs
				oOutbound = {
						semanticObject: "Test Semantic Object",
						action: "Test Action"
				};
				sCrossNavigationOutbound = "Test Outbound";
				sNavigationParameters = "test";
				// prepare input
				var oContextObject = {
						lineAttribute: "lineXYZ"
				};
				var sTableVariantId = "TableVariantID_4711";
				var oEventSource = {
						data: function() {
							return sCrossNavigationOutbound;
						},
						getBindingContext: function() {
							return {
								getObject: function() {
									return oContextObject;
								}
							};
						},
						getParent: function() {
							return {
								getParent: function() {
									return {
										getCurrentVariantId: function() {
											return sTableVariantId;
										}
									};
								}
							};
						},
						getId: jQuery.noop
				};
				var sSelectionVariant = "test";
				var oSmartFilterBar = {
						getUiState: function() {
							return {
								getSelectionVariant: function() {
									return sSelectionVariant;
								}
							}
						}
				};
				// initialize spies
				oNavigationHandlerNavigateArguments = undefined;
				oNavigationHandlerMixAttributesArguments = undefined;
				// execute
				var oState = {};
				oState.oSmartFilterbar = oSmartFilterBar;
				oCommonEventHandlers.onListNavigate(oEventSource, oState);
				// check
				assert.equal(oNavigationHandlerMixAttributesArguments.length, 2, "MixAttributes called with 2 parameters");
				assert.deepEqual(oNavigationHandlerMixAttributesArguments[0], oContextObject,
				"First parameter is equal to the context object");
				assert.equal(oNavigationHandlerMixAttributesArguments[1], sSelectionVariant,
				"Second is the selection variant");
				assert.equal(oNavigationHandlerNavigateArguments[2], sNavigationParameters,
				"Third parameter: Parameters for the target app - currently filled according to 'Gießkanne'");
				assert.equal(oNavigationHandlerNavigateArguments[3], null,
				"Forth parameter has a null object");
			});

			QUnit.test("onListNavigate (Intent) (ObjectPage specific)", function(assert) {
				// configure stubs
				oOutbound = {
						semanticObject: "Test Semantic Object",
						action: "Test Action"
				};
				sCrossNavigationOutbound = "Test Outbound";
				sandbox.stub(oHeaderBindingContext, "getObject", function(){return Object.freeze({headerAttribute: "headerABC"});}); // make sure, header context is not changed by sut!
				sNavigationParameters = "test";
				// prepare input
				var oContextObject = Object.freeze({lineAttribute: "lineXYZ"}); // make sure, context is not changed by sut!
				var sTableVariantId = "TableVariantID_4711";
				var oEventSource = {
						data: function() {
							return sCrossNavigationOutbound;
						},
						getBindingContext: function() {
							return {
								getObject: function() {
									return oContextObject;
								}
							};
						},
						getParent: function() {
							return {
								getParent: function() {
									return {
										getTable: jQuery.noop
									};
								}
							};
						},
						getId: jQuery.noop
				};
				// initialize spies
				oNavigationHandlerNavigateArguments = undefined;
				oNavigationHandlerMixAttributesArguments = undefined;
				// execute
				var oState = {};
				oCommonEventHandlers.onListNavigate(oEventSource, oState);
				// check
				assert.equal(oNavigationHandlerNavigateArguments[2], sNavigationParameters,
						"Third parameter: Parameters for the target app");
				assert.deepEqual(oNavigationHandlerNavigateArguments[3], null, "Forth parameter has to be a null object");
				assert.equal(oNavigationHandlerMixAttributesArguments.length, 2, "MixAttributes called with two parameters");
				var oMixedContextObject = {};
				jQuery.extend(oMixedContextObject, oContextObject);
				jQuery.extend(oMixedContextObject, oHeaderBindingContext.getObject());
				assert.deepEqual(oNavigationHandlerMixAttributesArguments[0], oMixedContextObject,
				"First parameter: Context Object with properties of both, header and line");
				assert.equal(oNavigationHandlerMixAttributesArguments[1], undefined, "Second parameter undefined");
			});

			QUnit.test("addEntry (Intent)", function(assert) {
				// configure stubs
				aSelectedContexts = [];
				oOutbound = {
						semanticObject: "Test Semantic Object",
						action: "Test Action"
				};
				sCrossNavigationOutbound = "Test Outbound";
				sNavigationParameters = undefined;
				// prepare input
				var oEventSource = {
						getParent: function() {
							return {
								getParent: function() {
									return {
										getTable: jQuery.noop
									};
								}
							};
						},
						getBindingContext: jQuery.noop,
						data: function() {
							return sCrossNavigationOutbound;
						}
				};
				// initialize spies
				oNavigationHandlerNavigateArguments = undefined;
				// execute
				var result = oCommonEventHandlers.addEntry(oEventSource);
				// check
				assert.ok(result instanceof Promise, "AddEntry has to return a promise");
				var done = assert.async();
				setTimeout(function() {
					result.then(function() {
						assert.ok("the promise should be resolved");
						done();
					}, function() {
						assert.notOk("the promise should be resolved but was rejected");
						done();
					});
				});
				assert.equal(oNavigationHandlerNavigateArguments[2], undefined,
				"Third parameter: Parameters for the target app - undefined");
				assert.deepEqual(oNavigationHandlerNavigateArguments[3], null, "Forth parameter has to be a null object");
			});

			QUnit.test("Build Selection Variant for Navigation", function(assert){
				// prepare parameters
				// prio of values:
				// 1. manifest (if not {})
				// 2. LineContext
				// 3. PageContext
				// 4. FilterBar
				// 5. manifest (only if {})
				var oOutbound = {parameters: {a: "manifest", b:{}, c:{}, d:{}, e: {}}};
				var oLineContext = {getObject: function(){return {a:"LineContext", b:"LineContext"};}};
				var oPageContext = {getObject: function(){return {b:"PageContext", c:"PageContext"};}};

				// Set up selectionVariant for FilterBAr
				var aRanges = [{
					High: null,
					Low: "SelectionVariant",
					Option: "EQ",
					Sign: "I"
				}];
				var sFilterBarSelectionVariant = JSON.stringify({
					SelectionVariantID: "",
					SelectOptions: [{
						PropertyName: "c",
						Ranges: aRanges
					},{
						PropertyName: "d",
						Ranges: aRanges
					}]
				});


				sandbox.stub(oNavigationHandler, "mixAttributesAndSelectionVariant", function() {
					return {
						getParameterNames: function() {
							return ["c", "d"];
						},
						toJSONString: jQuery.noop
					};
				});

				// execution
				var oResult = oStubForPrivate.fnBuildSelectionVariantForNavigation(oOutbound, oLineContext, oPageContext, sFilterBarSelectionVariant);
				// check
				assert.ok(oNavigationHandler.mixAttributesAndSelectionVariant.calledTwice, "Mix Attributes called twice");
				assert.ok(oNavigationHandler.mixAttributesAndSelectionVariant.getCall(0).calledWith({},sFilterBarSelectionVariant), "First with empty object");

				var oExpectedInputForMixAttributes = {a:"manifest", b:"LineContext", c:"PageContext", e: {}};
				assert.ok(oNavigationHandler.mixAttributesAndSelectionVariant.getCall(1).calledWith(oExpectedInputForMixAttributes, sFilterBarSelectionVariant),
						"Second call with object containing all properties with higer prio or not existent in Selection Variant");
			});

			QUnit.test("Evaluate Outbound Parameters", function(assert){
				// prepare parameters
				var oOutbound1 = {
					"Name": {
						"semanticObject": "Product",
						"action": "manage",
						"parameters": {
							"mode": "create"
						}
					}
				};
				var oOutbound1Multi = {
					"Name": {
						"semanticObject": "Product",
						"action": "manage",
						"parameters": {
							"mode": "create",
							"b"   : "bValue",
							"c"   : {}
						}
					}
				};
				var oOutbound2 = {
					"Name": {
						"semanticObject": "Product",
						"action": "manage",
						"parameters": {
							"mode": {
								"value": "create"
							}
						}
					}
				};
				var oOutbound2Multi = {
					"Name": {
						"semanticObject": "Product",
						"action": "manage",
						"parameters": {
							"mode": {
								"value": "create"
							},
							"b": {
								"value": "bValue"
							},
							"c": {}
						}
					}
				};
				var oOutbound3 = {
					"Name": {
						"semanticObject": "Product",
						"action": "manage",
						"parameters": {
							"mode": {
								"value": {
									"value": "create",
									"format": "plain"
								}
							}
						}
					}
				};
				var oOutbound3Multi = {
					"Name": {
						"semanticObject": "Product",
						"action": "manage",
						"parameters": {
							"mode": {
								"value": {
									"value": "create",
									"format": "plain"
								}
							},
							"b": {
								"value": {
									"value": "bValue",
									"format": "plain"
								}
							},
							"c": {
								"value": {
									"value": {},
									"format": "plain"
								}
							}
						}
					}
				};

				var oExpected = {};
				oExpected.mode = "create";

				// execution
				var oResult1 = oStubForPrivate.fnEvaluateParameters(oOutbound1.Name.parameters);
				var oResult2 = oStubForPrivate.fnEvaluateParameters(oOutbound2.Name.parameters);
				var oResult3 = oStubForPrivate.fnEvaluateParameters(oOutbound3.Name.parameters);

				assert.deepEqual(oResult1, oExpected, "Simple Parameter Result correct");
				assert.deepEqual(oResult2, oExpected, "Object Parameter Result correct");
				assert.deepEqual(oResult3, oExpected, "Value Parameter Result correct");

				var oExpectedMulti = {};
				oExpectedMulti.mode = "create";
				oExpectedMulti.b = "bValue";
				oExpectedMulti.c = {};

				// execution
				var oResult1Multi = oStubForPrivate.fnEvaluateParameters(oOutbound1Multi.Name.parameters);
				var oResult2Multi = oStubForPrivate.fnEvaluateParameters(oOutbound2Multi.Name.parameters);
				var oResult3Multi = oStubForPrivate.fnEvaluateParameters(oOutbound3Multi.Name.parameters);

				assert.deepEqual(oResult1Multi, oExpectedMulti, "Simple Multi Parameter Result correct");
				assert.deepEqual(oResult2Multi, oExpectedMulti, "Object Multi Parameter Result correct");
				assert.deepEqual(oResult3Multi, oExpectedMulti, "Value Multi Parameter Result correct");
			});

			module("lib.CommonEventHandlers.fnNavigateIntent", {
				setup: function() {
					oStubForPrivate = testableHelper.startTest();
					sandbox = sinon.sandbox.create();

					oCommonEventHandlers = new CommonEventHandlers(oController, oTemplateUtils.oComponentUtils,
							oTemplateUtils.oServices, oTemplateUtils.oCommonUtils);
				},
				teardown: function() {
					sandbox.restore();
					testableHelper.endTest();
				}
			});

			QUnit.test("Function fnNavigateIntent", function(assert) {
				var oTemplateUtils = {
						oCommonUtils: {
							getSelectedContexts: function(oControl) {
								return aSelectedContexts;
							}
						}
				};
				var sSelectionVariant = "test";
				var oSmartFilterBar = {
						getUiState: function() {
							return {
								getSelectionVariant: function() {
									return sSelectionVariant;
								}
							}
						}
				};
				var oSmartControl = {};
				var oOutbound = {
						semanticObject: "Semantic Object",
						action: "action",
						parameters: {
							a: "a",
							b: "b"
						}
					};
				var oObjectInfo = {
						semanticObject : "Semantic Object",
						action: "action"
				};
				var oSelectionVariant = {
						toJSONString: function() {},
						_mSelectOptions: {
							Currency: [{High: null, Low: "EUR", "Option": "EQ", "Sign": "I"}],
							Price: [{High: null, Low: "120", "Option": "EQ", "Sign": "I"}]
						}
				};
				sandbox.stub(oStubForPrivate, "fnBuildSelectionVariantForNavigation", function() {
					return oSelectionVariant;
				});
				var oNavigationExtensionStub = sandbox.stub(oController, "adaptNavigationParameterExtension", function(oSelectionVariant, oObjectInfo) {
					delete oSelectionVariant._mSelectOptions.Price;
				});
				sandbox.stub(oNavigationHandler, "navigate", function() {});
				var oContext = oTemplateUtils.oCommonUtils.getSelectedContexts();
				oStubForPrivate.fnNavigateIntent(oOutbound, oContext, oSmartFilterBar, oSmartControl);

				assert.ok(oNavigationExtensionStub.calledWith(oSelectionVariant, oObjectInfo),
				"Navigation extension called with the SelectionVariant and the ObjectInfo");
				assert.ok(!oSelectionVariant._mSelectOptions.Price,
				"Property Price was removed from SelectionOptions");
				assert.ok(oSelectionVariant._mSelectOptions.Currency,
				"Property Currency is still available in SelectionOptions");
			});


			 module("lib.CommonEventHandlers.fnHideTitleArea", {
				 setup: function() {
					 oStubForPrivate = testableHelper.startTest();
					 sandbox = sinon.sandbox.create();

					 oCommonEventHandlers = new CommonEventHandlers(oController, oTemplateUtils.oComponentUtils,
						 oTemplateUtils.oServices, oTemplateUtils.oCommonUtils);
				 },
				 teardown: function() {
					 sandbox.restore();
					 testableHelper.endTest();
				 }
			 });

			 QUnit.test("Function fnHideTitleArea", function(assert) {
				 var aAllControls = [];

				 //********Test 1
				 //ownTitleArea
				 var oOwnTitleAreaIcon = new sap.ui.core.Icon("icon");
				 oOwnTitleAreaIcon.setSrc("picABC");
				 aAllControls.push(oOwnTitleAreaIcon);

				 var oOwnTitleAreaTitle = new sap.m.Text("title");
				 oOwnTitleAreaTitle.setText("titleABC");
				 aAllControls.push(oOwnTitleAreaTitle);

				 var oOwnTitleAreaDescription = new sap.m.Text("description");
				 oOwnTitleAreaDescription.setText("descriptionABC");
				 aAllControls.push(oOwnTitleAreaDescription);

				 //contactTitleArea
				 var aContactTitleArea = [];
				 aContactTitleArea[0] = {
					 Label : { String : "Label: Contact 1"},
					 RecordType : "com.sap.vocabularies.UI.v1.ReferenceFacet",
					 Target : { AnnotationPath : "@com.sap.vocabularies.Communication.v1.Contact#WeightUnitContact1"}
				 };

				 var oContactTitleAreaIcon = new sap.ui.core.Icon("com.sap.vocabularies.Communication.v1.Contact::WeightUnitContact1::contactTitleAreaIcon");
				 oContactTitleAreaIcon.setSrc("picABC");
				 aAllControls.push(oContactTitleAreaIcon);

				 var oContactTitleAreaTitle = new sap.m.Text("com.sap.vocabularies.Communication.v1.Contact::WeightUnitContact1::contactTitleAreaTitle");
				 oContactTitleAreaTitle.setText("titleABC");
				 aAllControls.push(oContactTitleAreaTitle);

				 var oContactTitleAreaDescription = new sap.m.Text("com.sap.vocabularies.Communication.v1.Contact::WeightUnitContact1::contactTitleAreaDescription");
				 oContactTitleAreaDescription.setText("descriptionABC");
				 aAllControls.push(oContactTitleAreaDescription);

				 var oContactTitleArea =  new sap.ui.layout.HorizontalLayout("com.sap.vocabularies.Communication.v1.Contact::WeightUnitContact1::contactTitleArea");
				 aAllControls.push(oContactTitleArea);

				 var oSmLiContent = sinon.createStubInstance(sap.ui.core.mvc.XMLView);
				 oSmLiContent.byId = function(sId) {
					 var oFoundControl;
					 for (var j = 0; j < aAllControls.length; j++) {
						 var oControl = aAllControls[j];
						 if (sId === oControl.getId()){
							 oFoundControl = oControl;
							 break;
						 }
					 }
					 return oFoundControl;
				 };
				 var oContactTitleAreaStub = sandbox.stub(oContactTitleArea, "setVisible");
				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.calledOnce, "TitleArea identical - visible set on false");

				 //********Test 2
				 oContactTitleAreaStub.reset();
				 oOwnTitleAreaIcon.setSrc("XXXXXpicABC");

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.notCalled, "TitleArea are NOT identical due to OwnTitleAreaIcon - visible is not set");
				 oOwnTitleAreaIcon.setSrc("picABC");

				 //********Test 3
				 oContactTitleAreaStub.reset();
				 oContactTitleAreaTitle.setText("XXXXXXtitleABC");

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.notCalled, "TitleArea are NOT identical due to ContactTitleAreaTitle - visible is not set");
				 oContactTitleAreaTitle.setText("titleABC");

				 //********Test 4
				 oContactTitleAreaStub.reset();
				 oContactTitleAreaDescription.setText("XXXXXXdescriptionABC");

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.notCalled, "TitleArea are NOT identical due to ContactTitleAreaDescription - visible is not set");
				 oContactTitleAreaDescription.setText("descriptionABC");

				 //********Test 5
				 oContactTitleAreaStub.reset();
				 var aAllControls = [];
				 //aAllControls.push(oOwnTitleAreaIcon);
				 aAllControls.push(oOwnTitleAreaTitle);
				 aAllControls.push(oOwnTitleAreaDescription);
				 aAllControls.push(oContactTitleAreaIcon);
				 aAllControls.push(oContactTitleAreaTitle);
				 aAllControls.push(oContactTitleAreaDescription);
				 aAllControls.push(oContactTitleArea);

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.notCalled, "TitleArea are NOT identical due to OwnTitleAreaIcon empty - visible is not set");

				 //only hide the title area in case of filled fields - issue with timing of the hide check, therefore only checking if filled
				 /*
				 //********Test 6
				 oContactTitleAreaStub.reset();
				 var aAllControls = [];
				 //aAllControls.push(oOwnTitleAreaIcon);
				 aAllControls.push(oOwnTitleAreaTitle);
				 aAllControls.push(oOwnTitleAreaDescription);
				 //aAllControls.push(oContactTitleAreaIcon);
				 aAllControls.push(oContactTitleAreaTitle);
				 aAllControls.push(oContactTitleAreaDescription);
				 aAllControls.push(oContactTitleArea);

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.calledOnce, "TitleArea identical - visible set on false");

				 //********Test 7
				 oContactTitleAreaStub.reset();
				 var aAllControls = [];
				 oOwnTitleAreaIcon.setSrc("");
				 aAllControls.push(oOwnTitleAreaIcon);
				 aAllControls.push(oOwnTitleAreaTitle);
				 aAllControls.push(oOwnTitleAreaDescription);
				 //aAllControls.push(oContactTitleAreaIcon);
				 aAllControls.push(oContactTitleAreaTitle);
				 aAllControls.push(oContactTitleAreaDescription);
				 aAllControls.push(oContactTitleArea);

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.calledOnce, "TitleArea identical - visible set on false");
				 oOwnTitleAreaIcon.setSrc("picABC");

				 //********Test 8
				 oContactTitleAreaStub.reset();
				 var aAllControls = [];
				 //aAllControls.push(oOwnTitleAreaIcon);
				 aAllControls.push(oOwnTitleAreaTitle);
				 aAllControls.push(oOwnTitleAreaDescription);
				 aAllControls.push(oContactTitleAreaIcon);
				 oContactTitleAreaIcon.setSrc("");
				 aAllControls.push(oContactTitleAreaTitle);
				 aAllControls.push(oContactTitleAreaDescription);
				 aAllControls.push(oContactTitleArea);

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.calledOnce, "TitleArea identical - visible set on false");
				 oContactTitleAreaIcon.setSrc("picABC");

				 //********Test 9
				 oContactTitleAreaStub.reset();
				 var aAllControls = [];
				 aAllControls.push(oOwnTitleAreaIcon);
				 aAllControls.push(oOwnTitleAreaTitle);
				 oOwnTitleAreaDescription.setText("");
				 aAllControls.push(oOwnTitleAreaDescription);
				 aAllControls.push(oContactTitleAreaIcon);
				 aAllControls.push(oContactTitleAreaTitle);
				 //aAllControls.push(oContactTitleAreaDescription);
				 aAllControls.push(oContactTitleArea);

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.calledOnce, "TitleArea identical - visible set on false");
				 oOwnTitleAreaDescription.setText("descriptionABC");

				 //********Test 10
				 oContactTitleAreaStub.reset();
				 var aAllControls = [];
				 aAllControls.push(oOwnTitleAreaIcon);
				 aAllControls.push(oOwnTitleAreaTitle);
				 aAllControls.push(oOwnTitleAreaDescription);
				 //aAllControls.push(oContactTitleAreaIcon);
				 aAllControls.push(oContactTitleAreaTitle);
				 aAllControls.push(oContactTitleAreaDescription);
				 aAllControls.push(oContactTitleArea);

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.calledOnce, "TitleArea identical - visible set on false");

				 //********Test 11
				 oContactTitleAreaStub.reset();
				 var aAllControls = [];
				 aAllControls.push(oOwnTitleAreaIcon);
				 aAllControls.push(oOwnTitleAreaTitle);
				 aAllControls.push(oOwnTitleAreaDescription);
				 aAllControls.push(oContactTitleAreaIcon);
				 //aAllControls.push(oContactTitleAreaTitle);
				 aAllControls.push(oContactTitleAreaDescription);
				 aAllControls.push(oContactTitleArea);

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.calledOnce, "TitleArea identical - visible set on false");

				 //********Test 12
				 oContactTitleAreaStub.reset();
				 var aAllControls = [];
				 aAllControls.push(oOwnTitleAreaIcon);
				 aAllControls.push(oOwnTitleAreaTitle);
				 aAllControls.push(oOwnTitleAreaDescription);
				 aAllControls.push(oContactTitleAreaIcon);
				 aAllControls.push(oContactTitleAreaTitle);
				 //aAllControls.push(oContactTitleAreaDescription);
				 aAllControls.push(oContactTitleArea);

				 oStubForPrivate.fnHideTitleArea(oSmLiContent, aContactTitleArea);

				 assert.ok(oContactTitleAreaStub.calledOnce, "TitleArea identical - visible set on false");*/
			 });

				module("lib.CommonEventHandlers.onDataFieldWithNavigationPath", {
					setup: function() {
						sandbox = sinon.sandbox.create();
						oStubForPrivate = testableHelper.startTest();
					},
					teardown: function() {
						testableHelper.endTest();
						sandbox.restore();
					}
				});

				QUnit.test("onDataFieldWithNavigationPath", function(assert){
					//prepare data
					var oEvent = sinon.createStubInstance(Event);
					var oContext = {
							getPath: function() {
								return "/CDN_C_STTA_SO_WD_20(SalesOrder='500000001',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)";
							}
					};
					oEvent.getSource = function() {
						return {
							getCustomData: function() {
									return [{
											getProperty: function(sPropertyName) {
												if (sPropertyName === "key") {
													return "Target";
												}
												return "to_nav";
											}
									}];
							},
							getBindingContext: function() {
								return oContext;
							},
							data: jQuery.noop
						}
					};
					var oController = {}, oCommonUtils = {}, oComponentUtils = {}, oServices = {}, oModel = {}, oNavigationController = {}, oMetaModel = {}, oApplication = {};
					var sPath = "/CDN_C_STTA_SO_WD_20(SalesOrder='500000001',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)" + "/" + "to_nav";
					var oNavigationKeyProperties = [{
							aKeys: [
							        {name: "SalesOrder", type: "Edm.String"},
							        {name: "DraftUUID", type: "Edm.Guid"},
							        {name: "IsActiveEntity", type: "Edm.Boolean"}
							        ],
							entitySet: "CDN_C_STTA_SO_WD_20",
							navigationProperty: undefined
					}];
					var sODataEntitySet = {
							entityType: "CDN_C_STTA_SO_WD_20_CDS.CDN_C_STTA_SO_WD_20Type",
							name: "CDN_C_STTA_SO_WD_20"
					};
					var sODataEntityType = {
							name: "CDN_C_STTA_SO_WD_20Type",
							namespace: "CDN_C_STTA_SO_WD_20_CDS",
							key: {
								propertyRef: [
								      {name: "SalesOrder", type: "Edm.String"},
							        {name: "DraftUUID", type: "Edm.Guid"},
							        {name: "IsActiveEntity", type: "Edm.Boolean"}
							  ]
							},
							navigationProperty: [
							        {name: "to_SO"},
							        {name: "to_nav"}
							]
					};
					var oODataEntityContainer = {
							entitySet: []
					};
					oODataEntityContainer.entitySet[0] = sODataEntitySet;
					var sEntitySet = "CDN_C_STTA_SO_WD_20";
					var oAssociationEnd = {type: "CDN_C_STTA_SO_WD_20_CDS.CDN_C_STTA_SO_WD_20Type"};
					var mParameters;
					//sandbox stubs
					sandbox.stub(oMetaModel, "getODataEntitySet", function() {
						return sODataEntitySet;
					});

					sandbox.stub(oMetaModel, "getODataEntityType", function() {
						return sODataEntityType;
					});

					sandbox.stub(oMetaModel, "getODataAssociationEnd", function() {
						return oAssociationEnd;
					});

					sandbox.stub(oMetaModel, "getODataEntityContainer", function() {
						return oODataEntityContainer;
					});

					sandbox.stub(oModel, "getMetaModel", function() {
						return oMetaModel;
					});

					sandbox.stub(oModel, "read", function(sPath, mParameters) {
						mParameters.success({});
					});

					sandbox.stub(oController, "getOwnerComponent", function() {
						return {
							getModel: function() {
								return oModel;
							},
							getEntitySet: function() {
								return sEntitySet;
							},
							getAppComponent: function() {
								return {
									getConfig: function() {
										return {
											settings : {

											}
										};
									}
								};
							}
						};
					});

					sandbox.stub(oCommonUtils, "getNavigationKeyProperties", function() {
						return oNavigationKeyProperties;
					});

					sandbox.stub(oCommonUtils, "mergeNavigationKeyPropertiesWithValues", function() {
						return "NavigationPath!";
					});

					sandbox.stub(oComponentUtils, "isDraftEnabled", function() {
						return true;
					});

					sandbox.stub(oComponentUtils, "getBusyHelper", function() {
						return {
							setBusy: function() {
								return;
							}
						};
					});

					sandbox.stub(oApplication, "setStoredTargetLayoutToFullscreen", function() {
						return;
					});

					sandbox.stub(oApplication, "invalidatePaginatorInfo", function() {
						return;
					});
					oServices.oApplication = oApplication;

					sandbox.stub(oNavigationController, "navigateToContext", function() {
						return;
					});
					oServices.oNavigationController = oNavigationController;

					//execute code to test
					var oCommonEventHandlers = new CommonEventHandlers(oController, oComponentUtils,
							oServices, oCommonUtils);
					oCommonEventHandlers.onDataFieldWithNavigationPath(oEvent);

					//Tests
					assert.ok(oModel.read.calledOnce, "Model read called (once!)");
					assert.ok(oModel.read.calledWith(sPath), "Model.read was called with sPath");
					assert.ok(oModel.getMetaModel.calledOnce, "Model getMetaModel called (once!)");

					assert.ok(oCommonUtils.getNavigationKeyProperties.calledOnce, "getNavigationKeyProperties read called (once!)");
					assert.ok(oCommonUtils.getNavigationKeyProperties.calledWith(sEntitySet), "getNavigationKeyProperties was called with " + sEntitySet);
					assert.ok(oCommonUtils.mergeNavigationKeyPropertiesWithValues.calledOnce, "mergeNavigationKeyPropertiesWithValues called (once!)");
					assert.ok(oCommonUtils.mergeNavigationKeyPropertiesWithValues.calledWith(oNavigationKeyProperties), "mergeNavigationKeyPropertiesWithValues was called with oNavigationKeyProperties");

					assert.ok(oMetaModel.getODataEntitySet.calledOnce, "MetaModel getODataEntitySet called (once!)");
					assert.ok(oMetaModel.getODataEntitySet.calledWith(sEntitySet), "getODataEntitySet was called with " + sEntitySet);
					assert.ok(oMetaModel.getODataEntityType.calledTwice, "MetaModel getODataEntityType called (twice!)");
					assert.ok(oMetaModel.getODataEntityType.calledWith(oAssociationEnd.type), "getODataEntityType was called with " + oAssociationEnd.type);
					assert.ok(oMetaModel.getODataEntityType.calledWith(sODataEntitySet.entityType), "getODataEntityType was called with " + sODataEntitySet.entityType);
					assert.ok(oMetaModel.getODataAssociationEnd.calledOnce, "MetaModel getODataAssociationEnd called (once!)");
					assert.ok(oMetaModel.getODataAssociationEnd.calledWith(sODataEntityType, "to_nav"), "getODataAssociationEnd was called with " + sEntitySet + " and " + "NavigationProperty 'to_nav'");
					assert.ok(oMetaModel.getODataEntityContainer.calledOnce, "MetaModel getODataEntityContainer called (once!)");

					assert.ok(oComponentUtils.isDraftEnabled.calledOnce, "oComponentUtils isDraftEnabled called (once!)");
					assert.ok(oComponentUtils.isDraftEnabled.returned(true), "oComponentUtils isDraftEnabled returns true");

					assert.ok(oNavigationController.navigateToContext.calledOnce, "oNavigationController navigateToContext called (once!)");
					assert.ok(oNavigationController.navigateToContext.calledWith("NavigationPath!"), "oNavigationController navigateToContext was called with 'NavigationPath!'");
				});

// ---------------------------------------------------------------------------------
// Grouping header formatting for different types is done in GroupHeaderFormatter now.
// We have left some tests here to check the complete execution from onBeforeRebindTable()
// They should be restructured to concentrate on checking the selection properties.
// ---------------------------------------------------------------------------------

			module("lib.CommonEventHandlers.onBeforeRebindTable grouping", {
				setup: function() {
					sandbox = sinon.sandbox.create();
					oStubForPrivate = testableHelper.startTest();
				},
				teardown: function() {
					testableHelper.endTest();
					sandbox.restore();
				}
			});

			function prepareDataForGrouping(mMetadata) {
				var aColumns = [];

				Object.keys(mMetadata).forEach(function (sPath) {
					var oColumn = {
						getHeader: function () {
							return {
								oProperties: {
									text: sPath
								},
								getProperty: function (par) {
									return this.oProperties[par];
								},
								getText: function () {
									return this.getProperty("text");
								}
							};
						},
						data: function (par) {
							var oCustomData = {
								p13nData: {
									columnKey: sPath,
									leadingProperty: sPath,
									additionalProperty: mMetadata[sPath].testAdditionalProperty
								},
								getValue: function () {
									return null;
								}
							};
							return (par) ? oCustomData[par] : oCustomData;
						},
						getCustomData: function () {
							return [
								this.data()
							];
						}
					};
					aColumns.push(oColumn);
				});

				var oTable = oSmartTable.getTable();
				oTable.getColumns.returns(aColumns);

				var oVariant = {
					group: {
						groupItems: [
							{
								columnKey: "TOSET"
							}
						]
					},
					testSetcolumnKey: function(sColumnKey) {
						this.group.groupItems[0].columnKey = sColumnKey;
					}
				};
				oSmartTable.fetchVariant.returns(oVariant);

				oController.byId = function () {
					return null;
				};

				var oContext = {
					mTestData: null,
					testSetData: function (oData) {
						oContext.mTestData = oData;
					},
					getModel: function () {
						return {
							getMetaModel: function() {
								return {
									getObject: function (sPath) {
										var aPath = (sPath || "").split("/"),
											sPath2 = aPath[aPath.length - 1];
										return mMetadata[sPath2];
									},
									getMetaContext: function (sPath) {
										return {
											sPath: sPath
										};
									}
								};
							}
						};
					},
					getProperty: function (sPath) {
						return oContext.mTestData[sPath];
					}

				};
				return oContext;
			}

			function getSorterForGrouping(oContext, sGroupingPath1) {
				var fnDummyGroupFunction = function(oContext) {
						var sKey = "dummy", //oContext.getProperty(sGroupPath)
							sColumnsText = "dummy";
						return {
							key: sKey,
							text: sColumnsText ? sColumnsText + " : " + sKey : sKey
						};
					},
					oSorter = {
						vGroup: {}, //checked for grouping active
						sPath: sGroupingPath1,
						fnGroup: fnDummyGroupFunction
					};

				//var oGroupingObject = oContext.getModel().getMetaModel().getObject(sGroupingPath1);
				//var sTestPreselectedProperty = oGroupingObject.testPreselectedProperty;
				var sTestPreselectedProperty = "";
				//sColumnsText = oGroupingObject.name;

				oSmartTable.fetchVariant().testSetcolumnKey(sGroupingPath1);

				var oBindingParams = {
					parameters: {
						select: sTestPreselectedProperty || ""
					},
					sorter: [ oSorter ]
				};

				var oEvent = {
					getSource: function () { return oSmartTable; },
					getParameter: function (/* sName */) { return oBindingParams; }
				};
				var aSelect = oBindingParams.parameters.select && oBindingParams.parameters.select.split(",") || [];
				var fnEnsureSelectionProperty = function(sProperty) {
					if (sProperty && jQuery.inArray(sProperty, aSelect) === -1) {
						aSelect.push(sProperty);
					}
				};
				oTemplateUtils.oCommonUtils.onBeforeRebindTableOrChart = function(oEvent, oCallbacks, oSmartFilterBar) {
					oCallbacks.addNecessaryFields(aSelect, fnEnsureSelectionProperty, "abc");
				};

				var oCallbacks = null;
				var oCommonEventHandlers = new CommonEventHandlers(oController, oTemplateUtils.oComponentUtils,
					oTemplateUtils.oServices, oTemplateUtils.oCommonUtils);

				oCommonEventHandlers.onBeforeRebindTable(oEvent, oCallbacks);
				return oBindingParams;
			}

			QUnit.test("type Edm.String", function(assert) {
				var mMetadata = {
						Product: {
							name: "Product",
							type: "Edm.String"
						}
					},
					oContext, oBindingParams, oResult;

				oContext = prepareDataForGrouping(mMetadata);
				oBindingParams = getSorterForGrouping(oContext, "Product");

				// first row
				oContext.testSetData({
					Product: "P1"
				});
				oResult = oBindingParams.sorter[0].fnGroup(oContext);
				assert.deepEqual(oResult,
					{
						key: "P1",
						text: "Product: P1"
					},
					"Product, first data row (Edm.String)"
				);

				// second row
				oContext.testSetData({
					Product: "P2"
				});
				oResult = oBindingParams.sorter[0].fnGroup(oContext);
				assert.deepEqual(oResult,
					{
						key: "P2",
						text: "Product: P2"
					},
					"Product, second data row (Edm.String)"
				);
			});

			QUnit.test("type Edm.DateTimeOffset", function(assert) {
				var mMetadata = {
						CreationDateTime: {
							name: "CreationDateTime",
							type: "Edm.DateTimeOffset"
						}
					},
					oContext, oBindingParams, oResult;

				oContext = prepareDataForGrouping(mMetadata);
				oBindingParams = getSorterForGrouping(oContext, "CreationDateTime");

				oContext.testSetData({
					CreationDateTime: new Date("2018-03-13T18:13:01")
				});
				oResult = oBindingParams.sorter[0].fnGroup(oContext);
				assert.deepEqual(oResult,
					{
						key: "Mar 13, 2018, 6:13:01 PM",
						text: "CreationDateTime: Mar 13, 2018, 6:13:01 PM"
					},
					"CreationDateTime (Edm.DateTimeOffset)"
				);

				// Check also summer time in some countries
				oContext.testSetData({
					CreationDateTime: new Date("2018-06-13T23:13:01.123")
				});
				oResult = oBindingParams.sorter[0].fnGroup(oContext);
				assert.deepEqual(oResult,
					{
						key: "Jun 13, 2018, 11:13:01 PM",
						text: "CreationDateTime: Jun 13, 2018, 11:13:01 PM"
					},
					"CreationDateTime (Edm.DateTimeOffset)"
				);
			});

			QUnit.test("type Edm.Byte with text extension and TextArrangement in property", function(assert) {
				var mMetadata = {
						Availability: {
							name: "Availability",
							type: "Edm.Byte",
							"com.sap.vocabularies.UI.v1.TextArrangement": {
								EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"
							},
							extensions: [
								{
									name: "text",
									namespace: "http://www.sap.com/Protocols/SAPData",
									value: "to_StockAvailability/StockAvailability_Text"
								}
							]
							//testPreselectedProperty: "CreationDate",
							//testAdditionalProperty: "Product,Price" //for test: multiple additional properties
						}
					},
					oContext, oBindingParams, oResult;

				oContext = prepareDataForGrouping(mMetadata);
				oBindingParams = getSorterForGrouping(oContext, "Availability");

				oContext.testSetData({
					Availability: 2,
					"to_StockAvailability/StockAvailability_Text": "Few left"
				});

				oResult = oBindingParams.sorter[0].fnGroup(oContext);
				assert.deepEqual(oResult,
					{
						key: "Few left (2)",
						text: "Availability: Few left (2)"
					},
					"Availability (Edm.Byte), TextFirst"
				);
			});


			QUnit.module("lib.CommonEventHandlers.onBeforeRebindTable AnalyticalTable grouping", {
				setup: function() {
					sandbox = sinon.sandbox.create();
					//oStubForPrivate = testableHelper.startTest();
					oSmartTable.getTable.returns(oATable);
				},
				teardown: function() {
					//testableHelper.endTest();
					sandbox.restore();
				}
		  });

		  function prepareDataForAnalyticalGrouping(mMetadata) {
				var aColumns = [];

				oSmartTable.mTest.mMetadata = mMetadata;
				Object.keys(mMetadata).forEach(function (sPath) {
					  var oColumn = {
							sId: sPath, //"-" + sPath,
							mProperties: {
								  leadingProperty: sPath
								  //groupHeaderFormatter: null
							},
							getId: function () {
								  return this.sId;
							},
							getLeadingProperty: function () {
								  return this.mProperties.leadingProperty;
							},
							getGroupHeaderFormatter: function () {
								  return this.mProperties.groupHeaderFormatter;
							},
							setGroupHeaderFormatter: function (fnFormatter) {
								  this.mProperties.groupHeaderFormatter = fnFormatter;
							},
							getCustomData: function () {
								  return [
										{
											  getValue: function () {
													return null;
											  }
										}
								  ];
							}
					  };
					  aColumns.push(oColumn);
				});

				var oATable = oSmartTable.getTable();
				oATable.getColumns.returns(aColumns);

				oController.byId = function () {
					  return null;
				};

				var oContext = {
					  mTestData: null,
					  testSetData: function (oData) {
							oContext.mTestData = oData;
					  },
					  getProperty: function (sPath) {
							return oContext.mTestData[sPath];
					  }

				};
				return oContext;
		  }

		  function setFormatterForAnalyticalGrouping(oContext, aGroupedColumns) {
				var sTestPreselectedProperty = "";

				var oTable = oSmartTable.getTable();
				oTable.getGroupedColumns.returns(aGroupedColumns);

				var oBindingParams = {
					  parameters: {
							select: sTestPreselectedProperty || ""
					  }
				};

				var oEvent = {
					  getSource: function () { return oSmartTable; },
					  getParameter: function (/* sName */) { return oBindingParams; }
				};
				var aSelect = oBindingParams.parameters.select && oBindingParams.parameters.select.split(",") || [];
				var fnEnsureSelectionProperty = function (sProperty) {
					  if (sProperty && jQuery.inArray(sProperty, aSelect) === -1) {
							aSelect.push(sProperty);
					  }
				};
				oTemplateUtils.oCommonUtils.onBeforeRebindTableOrChart = function (oEvent, oCallbacks, oSmartFilterBar) {
					  oCallbacks.addNecessaryFields(aSelect, fnEnsureSelectionProperty, "abc");
				};

				var oCallbacks = null;
				var oCommonEventHandlers = new CommonEventHandlers(oController, oTemplateUtils.oComponentUtils,
					  oTemplateUtils.oServices, oTemplateUtils.oCommonUtils);

				oCommonEventHandlers.onBeforeRebindTable(oEvent, oCallbacks);
				return oBindingParams;
		  }

		  function performAnalyticalGroupingForColumn(oContext, oColumn) {
				var sProperty = oColumn.getLeadingProperty();
				var sPropertyValue = oContext.getProperty(sProperty);
				var sTextPropertyValue = null; //oContext.getTextProperty(sLeadingProperty);
				var fnGroupingFormatter = oColumn.getGroupHeaderFormatter();
				// here we simulate the call from sap.ui.model.analytics.AnalyticalBinding.getGroupName()
				var sFormattedPropertyValue = fnGroupingFormatter ? fnGroupingFormatter(sPropertyValue, sTextPropertyValue) : sPropertyValue;
				return sFormattedPropertyValue;
		  }

		  QUnit.test("Analytical: type Edm.String", function(assert) {
				var mMetadata = {
							Product: {
								  name: "Product",
								  type: "Edm.String"
							}
					  },
					  aGroupedColumns = ["Product"],
					  oContext, oColumn, sFormattedPropertyValue;

				oContext = prepareDataForAnalyticalGrouping(mMetadata);
				setFormatterForAnalyticalGrouping(oContext, aGroupedColumns);

				// first row
				oContext.testSetData({
					  Product: "P1"
				});

				oColumn = oSmartTable.getTable().getColumns()[0];
				sFormattedPropertyValue = performAnalyticalGroupingForColumn(oContext, oColumn);
				assert.equal(sFormattedPropertyValue, "P1", "Product (Edm.String), first data row");

				// second row
				oContext.testSetData({
					  Product: 15
				});
				oColumn = oSmartTable.getTable().getColumns()[0];
				sFormattedPropertyValue = performAnalyticalGroupingForColumn(oContext, oColumn);
				assert.equal(sFormattedPropertyValue, 15, "Product (Edm.String), second data row");
		  });

		  QUnit.test("Analytical: other types, all columns grouped columns", function (assert) {
				var mMetadata = {
					  Product: {
							name: "Product",
							type: "Edm.String"
					  },
					  CreationDateTime: {
							name: "CreationDateTime",
							type: "Edm.DateTimeOffset"
					  },
					  Approved: {
							name: "Approved",
							type: "Edm.Boolean"
					  },
					  Availability: {
							name: "Availability",
							type: "Edm.Byte",
							"com.sap.vocabularies.UI.v1.TextArrangement": {
								  EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast" // idAndDescription
							},
							extensions: [
								  {
										name: "text",
										namespace: "http://www.sap.com/Protocols/SAPData",
										value: "to_StockAvailability/StockAvailability_Text"
								  }
							]
					  }
				},
					  aGroupedColumns = Object.keys(mMetadata), // all properties for grouping
					  oContext;

				oContext = prepareDataForAnalyticalGrouping(mMetadata);

				setFormatterForAnalyticalGrouping(oContext, aGroupedColumns);
				var oDate = new Date("2018-03-13T11:13:01");
				oContext.testSetData({
					  Product: "P1",
					  CreationDateTime: oDate,
					  Approved: true,					  
					  Availability: 2
					  //"to_StockAvailability/StockAvailability_Text": "Few left"
				});

				var oExpectedResults = {
					  Product: "P1",
					  CreationDateTime: "Mar 13, 2018, 11:13:01 AM",
					  Approved: "Yes",
					  Availability: "2" //or "2 (Few left)"
				};

				var oTable = oSmartTable.getTable();
				var aColumns = oTable.getColumns();
				var mColumnById = aColumns.reduce(function (map, obj) {
					  map[obj.getId()] = obj;
					  return map;
				}, {});
				for (var i = 0; i < aGroupedColumns.length; i++) {
					  var oColumn = mColumnById[aGroupedColumns[i]];
					  var sProperty = oColumn.getLeadingProperty();
					  var sPropertyValue = oContext.getProperty(sProperty);
					  var sTextPropertyValue = null; //oContext.getTextProperty(sLeadingProperty);
					  var fnGroupingFormatter = oColumn.getGroupHeaderFormatter();
					  var sFormattedPropertyValue = fnGroupingFormatter ? fnGroupingFormatter(sPropertyValue, sTextPropertyValue) : sPropertyValue;
					  var sExpectedResult = oExpectedResults[sProperty];
					  assert.equal(sFormattedPropertyValue, sExpectedResult, sProperty + " (" + mMetadata[sProperty].type + ")");
				}
			});
		});
