/**
 * tests for the sap.suite.ui.generic.template.changeHandler.generic.RevealElement
 */
sap.ui.define([
	"testUtils/sinonEnhanced",
	"sap/suite/ui/generic/template/changeHandler/generic/AddElement",
	"sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils",
	"sap/suite/ui/generic/template/changeHandler/util/AnnotationChangeUtilsV2"
],
function(sinon, AddElement, ChangeHandlerUtils, AnnotationChangeHandler) {
	"use strict";

	QUnit.module("AddElement Test Module", {

		beforeEach: function() {
			this.oContent = {};
			this.oChange = {
				getContent: function() {
					return this.oContent;
				}.bind(this)
			};
			this.oSpecificChangeInfo = {
				bindingPath: "newColumn",
				index: 1,
				parentId: "tableId",
				custom: {
					annotation: "com.sap.vocabularies.UI.v1.LineItem",
					fnGetAnnotationIndex: function() {
						return 2;
					},
					oAnnotationTermToBeAdded: {
						EdmType: undefined,
						RecordType: "com.sap.vocabularies.UI.v1.DataField",
						Value: {
							Path: "newColumn"
						},
						"com.sap.vocabularies.UI.v1.Importance": {
							EnumMember: "com.sap.vocabularies.UI.v1.ImportanceType/High"
						}
					}
				}
			};
			this.oPropertyBag = {
				modifier: {
					bySelector: function() {
						return {
							getCustomData: function() {
								return [{
									getKey: function() {
										return "p13nData";
									},
									getValue: function() {
										return {
											leadingProperty: "Column3Property"
										};
									}
								}];
							},
							data: function() {
								return {
									leadingProperty: "Column3Property"
								};
							},
							getId: function() {
								return "tableId";
							},
							getParent: function() {
								return {
									getEntitySet: function() {
										return "SEPMRA_C_PD_Product";
									},
									getId: function() {
										return "parentId"
									}
								};
							},
							getEntityType: function() {
								return {
									entityType: "SEPMRA_PROD_MAN.SEPMRA_C_PD_ProductType"
								};
							}
						};
					},
					getSelector: function() {
						return {
							"id": "elementId",
							"idIsLocal": false
						};
					}
				}
			};

			var oMetaModel = {
				getODataEntitySet: function() {
					return {
						entityType: "SEPMRA_PROD_MAN.SEPMRA_C_PD_ProductType"
					};
				},
				getODataEntityType: function() {
					return {
						"com.sap.vocabularies.UI.v1.LineItem": [{
							Value: {
								Path: "Column1Property"
							}
						}, {
							Value: {
								Path: "Column2Property"
							}
						}],
						"com.sap.vocabularies.UI.v1.SelectionFields": [
							{
							PropertyPath: "Column1Property"
							}, {
							PropertyPath: "Column2Property"
							}
						],
						property: [
							"newColumn"
						]
					};
				}
			};

			this.oGetMetaModelStub = sinon.stub(ChangeHandlerUtils, "getMetaModel").returns(oMetaModel);
			this.oCreateAnnotationTermChangeStub = sinon.stub(AnnotationChangeHandler, "createCustomAnnotationTermChange").returns(this.oContent);
			this.oCreateCustomChangesStub = sinon.stub(AnnotationChangeHandler, "createCustomChanges");
		},
		afterEach: function() {
			this.oContent = null;
			this.oChange = null;
			this.oSpecificChangeInfo = null;
			this.oPropertyBag = null;

			this.oGetMetaModelStub.restore();
			this.oCreateAnnotationTermChangeStub.restore();
			this.oCreateCustomChangesStub.restore();
		}
	});

	QUnit.test("AddElement test case 1", function(assert) {

		//Arrange
		var aLineItemOld = [{
			Value: {
				Path: "Column1Property"
				}
			}, {
			Value: {
				Path: "Column2Property"
			}
		}];

		var aLineItem = [{
			Value: {
				Path: "Column1Property"
				}
			}, {
			Value: {
				Path: "Column2Property"
				}
			}, {
			EdmType: undefined,
			RecordType: "com.sap.vocabularies.UI.v1.DataField",
			Value: {
				Path: "newColumn"
				},
			"com.sap.vocabularies.UI.v1.Importance": {
				EnumMember: "com.sap.vocabularies.UI.v1.ImportanceType/High"
				}
			}];

		//Act
		AddElement.completeChangeContent(this.oChange, this.oSpecificChangeInfo, this.oPropertyBag);

		var aParameters = this.oCreateAnnotationTermChangeStub.firstCall.args;

		//Assert
		assert.deepEqual(aParameters[0].entityType, "SEPMRA_PROD_MAN.SEPMRA_C_PD_ProductType", "sEntityType parameter of createCustomAnnotationTermChange is correct.");
		assert.deepEqual(aParameters[1], aLineItem, "aLineItem parameter of createCustomAnnotationTermChange is correct.");
		assert.deepEqual(aParameters[2], aLineItemOld, "aLineItemOld parameter of createCustomAnnotationTermChange is correct.");
		assert.deepEqual(aParameters[3], "com.sap.vocabularies.UI.v1.LineItem",	"LINEITEM parameter of createCustomAnnotationTermChange is correct.");

		assert.equal(this.oCreateAnnotationTermChangeStub.calledOnce, true, "createCustomAnnotationTermChange has been called.");
		assert.equal(this.oCreateCustomChangesStub.calledOnce, true, "createCustomChanges has been called.");
	});

	QUnit.test("AddElement test case 2", function(assert) {

		//Arrange
		this.oSpecificChangeInfo = {
				bindingPath: "newColumn",
				index: 1,
				parentId: "tableId",
				custom: {
					annotation: "com.sap.vocabularies.UI.v1.LineItem",
					oAnnotationTermToBeAdded: {
						EdmType: undefined,
						RecordType: "com.sap.vocabularies.UI.v1.DataField",
						Value: {
							Path: "newColumn"
						},
						"com.sap.vocabularies.UI.v1.Importance": {
							EnumMember: "com.sap.vocabularies.UI.v1.ImportanceType/High"
						}
					}
				}
			};
		//Act
		AddElement.completeChangeContent(this.oChange, this.oSpecificChangeInfo, this.oPropertyBag);
		
		//Assert
		assert.equal(this.oCreateAnnotationTermChangeStub.calledOnce, true, "createCustomAnnotationTermChange has been called.");
		assert.equal(this.oCreateCustomChangesStub.calledOnce, true, "createCustomChanges has been called.");
	});

	QUnit.test("AddElement test case 3", function(assert) {

		//Arrange
		this.oSpecificChangeInfo = {
				bindingPath: "newColumn",
				index: 1,
				parentId: "tableId",
				custom: {
					annotation: "com.sap.vocabularies.UI.v1.LineItem",
					oAnnotationTermToBeAdded: {
						EdmType: undefined,
						RecordType: "com.sap.vocabularies.UI.v1.DataField",
						Value: {
							Path: "newColumn"
						},
						"com.sap.vocabularies.UI.v1.Importance": {
							EnumMember: "com.sap.vocabularies.UI.v1.ImportanceType/High"
						}
					}
				}
			};
		//Act
		AddElement.completeChangeContent(this.oChange, this.oSpecificChangeInfo, this.oPropertyBag);

		//Assert
		assert.equal(this.oCreateAnnotationTermChangeStub.calledOnce, true, "createCustomAnnotationTermChange has been called.");
		assert.equal(this.oCreateCustomChangesStub.calledOnce, true, "createCustomChanges has been called.");
	});

	QUnit.test("AddElement test templating data function", function(assert) {

		//Arrange
		this.oPropertyBag = {
				modifier: {
					bySelector: function() {
						return {
							getCustomData: function() {
								return [{
									getKey: function() {
										return "sap-ui-custom-settings";
									},
									getValue: function() {
										return {
											"sap.ui.dt": {
												annotation: '{"target":"SEPMRA_PROD_MAN.SEPMRA_C_PD_ProductType","annotation":"com.sap.vocabularies.UI.v1.SelectionFields","value":"Column3Property"}'
											}
										};
									}
								}];
							},
							data: function(oSapUiCustomSettings) {
								return {
										"sap.ui.dt": {
											annotation: '{"target":"SEPMRA_PROD_MAN.SEPMRA_C_PD_ProductType","annotation":"com.sap.vocabularies.UI.v1.SelectionFields","value":"Column3Property"}'
										}
								};
							},
							sParentAggregationName: "content",
							getParent: function() {
								return {
									getParent: function() {
										return {
											getEntitySet: function() {
												return "SEPMRA_C_PD_Product";
											}
										};
									},
									getId: function() {
										return "parentId"
									},
									getAggregation: function() {
										return [{
											getId: function() {
												return "elementId";
											}
										}];
									}
								};
							},
							getId: function() {
								return "parentId"
							}
						};
					},
					getSelector: function() {
						return {
							"id": "elementId",
							"idIsLocal": false
						}
					}
				}
			};

		this.oSpecificChangeInfo = {
				bindingPath: "newColumn",
				index: 1,
				parentId: "tableId",
				custom: {
					annotation: "com.sap.vocabularies.UI.v1.SelectionFields",
					fnGetAnnotationIndex: function() {
						return 2;
					},
					fnGetRelevantElement: function(oRevealedElement) {
						return oRevealedElement;
					},
					oAnnotationTermToBeAdded: {
						PropertyPath: "Column3Property"
					}
				}
		};
		//Act
		AddElement.completeChangeContent(this.oChange, this.oSpecificChangeInfo, this.oPropertyBag);

		//Assert
		assert.equal(this.oCreateAnnotationTermChangeStub.calledOnce, true, "createCustomAnnotationTermChange has been called.");
		assert.equal(this.oCreateCustomChangesStub.calledOnce, true, "createCustomChanges has been called.");
	});

	QUnit.test("jQuery extend", function(assert) {

		//Arrange
		this.oCreateCustomChangesStub.returns({ testValue: "ok" });

		//Act
		AddElement.completeChangeContent(this.oChange, this.oSpecificChangeInfo, this.oPropertyBag);

		//Assert
		assert.deepEqual(this.oChange.getContent().testValue, "ok", "oChange.getContent has been extended with mChanges.");
	});
});
