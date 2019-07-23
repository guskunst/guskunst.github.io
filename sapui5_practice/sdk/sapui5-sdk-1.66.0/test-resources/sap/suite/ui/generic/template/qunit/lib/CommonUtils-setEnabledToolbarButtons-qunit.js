/**
 * tests for the sap.suite.ui.generic.template.lib.CommonUtils.setEnabledToolbarButtons
 */

sap.ui.define(["testUtils/sinonEnhanced", "sap/ui/model/json/JSONModel", "sap/suite/ui/generic/template/lib/CommonUtils", "sap/suite/ui/generic/template/lib/testableHelper"], 
	function(sinon, JSONModel, CommonUtils, testableHelper) {
	"use strict";

	var oPrivateModel = new JSONModel({
		generic: {
			controlProperties: {},
		},
	});
	var oEntitySet = {
		"Org.OData.Capabilities.V1.DeleteRestrictions" : {
			"Deletable": {
				"Path": undefined
			}
		}
	};
	var oModelObject = {};
	var oMetaModelObject = {};
	var oManifestActions = {};
	var mFunctionImport = {};
	var oComponentUtils = {};
	var aContexts = [];
	var oMetaModel = {
		getODataFunctionImport: function () {
			return mFunctionImport;
		},
		getODataEntitySet: function () {
			return oEntitySet;
		}
	};
	var oModel = {
		getMetaModel: function () {
			return oMetaModel;
		},
		getObject: function (bValue) {
			return {
				entityProperty: bValue
			};
		},
		getProperty: function (sPath, oContext) {
			var sContextPath = oContext.getPath(sPath);
			if (sContextPath === "isDeletable") {
				return true;
			} else if (sContextPath === "isNotDeletable") {
				return false;
			}
		}
	};
	var aToolbarContent;
	var oControl = {
		getModel: function (sModelName) {
			if (sModelName === "_templPriv") {
				return oPrivateModel;
			}
			
			return oModel;
		},
		getSelectedContexts: function () {
			return aContexts;
		},
		getCustomToolbar: function () {
			return {
				getContent: function () {
					return aToolbarContent;
				}
			};
		},
		getEntitySet: function () {
			return;
		}
	};
	
	// setup variables for CommonUtils creation
	var oServices = {
		oApplication: {
			getBusyHelper: function() {
				return {
					isBusy: function() {
						return false;
					},
					setBusy: jQuery.noop
				};
			}
		}
	};
	var oController = {
		getOwnerComponent : function() {
			return {
				getModel : function(sId) {
					return {
						getResourceBundle : function() {
							return { };
						},
						getMetaModel : function() {
							return {
								getODataEntitySet: function(sEntitySet) {
									return oEntitySet;
								},
								getObject: function(sPath) {
									return oMetaModelObject;
								}
							};
						},
						getObject: function(sPath) {
							return oModelObject;
						}
					};
				},
				getComponentContainer: function(){
					return {
						getElementBinding: function(){
							return { };
						}
					};
				},
				getEntitySet: function() {
					return oEntitySet;
				},
				getAppComponent: function() {
					return {
						getInternalManifest: function() {
							return oManifestActions;
						}
					};
				},
				getTemplateName: function() {
					return "sap.suite.ui.generic.template.ListReport.view.ListReport";
				}
			};
		},
		getInnerAppState: jQuery.noop,
		getView: function() {
			return {
				getModel: function(sModelName) {
					return oPrivateModel;
				},
				getLocalId: function (sId) {
					return sId;
				}
			};
		}
	};
	
	var sandbox, oStubForPrivate, oCommonUtils;
	
	function fnCommonBeforeEach(){
		oStubForPrivate = testableHelper.startTest();
		var oStubForStatic = testableHelper.getStaticStub();
		sandbox = sinon.sandbox.create();
		oCommonUtils = new CommonUtils(oController, oServices, oComponentUtils);
		// override getSelectedContexts, getOwnerControl, getBreakoutActionsForTable, fillEnabledMapForBreakoutActions - we don't want to test these functions
		sandbox.stub(oStubForPrivate, "getSelectedContexts", function() {
			return aContexts;
		});
		sandbox.stub(oStubForPrivate, "getOwnerControl", function() {
			return oControl;
		});
			
		sandbox.stub(oStubForPrivate, "fillEnabledMapForBreakoutActions", jQuery.noop);
		sandbox.stub(oStubForPrivate, "getBreakoutActionIds", jQuery.noop);
		sandbox.stub(oStubForStatic, "CommonUtils_isSmartTable", function(){
			return true;
		});
	}
	
	function fnCommonAfterEach(){
		sandbox.restore();
		testableHelper.endTest();		
	}
	
	/* annotated action button test module */
	module("lib.CommonUtils.setEnabledToolbarButtons - Annotated Action Button", {
		beforeEach: fnCommonBeforeEach,
		afterEach: fnCommonAfterEach
	});
	
	test("no action-for defined, no applicable-path, no context selected", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		
		aContexts = [];
		aToolbarContent = [oButton];
		
		mFunctionImport["sap:action-for"] = undefined;
		mFunctionImport["sap:applicable-path"] = undefined;
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), undefined, "Action button's enabled property correctly set to true.");
		
		// destroy
		oButton.destroy();
	});
	
	test("no action-for defined, no applicable-path, one context selected", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		
		var oContext = {
			getPath: function() {
				return ''; 
			} 
		};
		aContexts = [oContext];
		aToolbarContent = [oButton];
		
		mFunctionImport["sap:action-for"] = undefined;
		mFunctionImport["sap:applicable-path"] = undefined;
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), undefined, "Action button's enabled property correctly set to true.");
		
		// destroy
		oButton.destroy();
	});

	test("action-for defined, no applicable-path, one context selected", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext = {
			getPath: function() {
				return ''; 
			} 
		};
		aContexts = [oContext];
		aToolbarContent = [oButton];
		
		mFunctionImport["sap:action-for"] = "functionImport";
		mFunctionImport["sap:applicable-path"] = undefined;
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), true, "Action button's enabled property correctly set to true.");
		
		// destroy
		oButton.destroy();
	});
	
	test("action-for defined, no applicable-path, no context selected", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		aContexts = [];
		aToolbarContent = [oButton];
		
		mFunctionImport["sap:action-for"] = "functionImport";
		mFunctionImport["sap:applicable-path"] = undefined;
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), false, "Action button's enabled property correctly set to false.");
		
		// destroy
		oButton.destroy();
	});
	
	test("action-for defined, applicable-path true, one context selected", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext = {
			getPath: function() {
				return true; 
			} 
		};
		aContexts = [oContext];
		aToolbarContent = [oButton];
		
		mFunctionImport["sap:action-for"] = "functionImport";
		mFunctionImport["sap:applicable-path"] = "entityProperty";

		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), true, "Action button's enabled property correctly set to true.");
		
		// destroy
		oButton.destroy();
	});
	
	test("action-for, applicable-path false, one context selected", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext = {
			getPath: function() {
				return false; 
			} 
		};
		aContexts = [oContext];
		aToolbarContent = [oButton];
		
		mFunctionImport["sap:action-for"] = "functionImport";
		mFunctionImport["sap:applicable-path"] = "entityProperty";

		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
			
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), false, "Action button's enabled property correctly set to false.");
		
		// destroy
		oButton.destroy();
	});
	
	test("no action-for defined, applicable-path false, one context selected", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext = {
			getPath: function() {
				return false; 
			} 
		};
		aContexts = [oContext];
		aToolbarContent = [oButton];
		
		mFunctionImport["sap:action-for"] = undefined;
		mFunctionImport["sap:applicable-path"] = "entityProperty";

		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), true, "Action button's enabled property correctly set to true.");
		
		// destroy
		oButton.destroy();
	});
	
	test("action-for defined, one applicable-path true, one applicable-path false, two contexts selected", function(assert) {
		var oButton1 = new sap.m.Button();
		oButton1.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton1.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton1.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton1.getId() + "/enabled}");
		
		var oButton2 = new sap.m.Button();
		oButton2.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton2.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton2.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton2.getId() + "/enabled}");
		
		var oContext1 = {
			getPath: function() {
				return false; 
			}
		};
		var oContext2 = {
			getPath: function() {
				return true; 
			}
		};
		aContexts = [oContext1, oContext2];
		aToolbarContent = [oButton1, oButton2];
		
		mFunctionImport["sap:action-for"] = "functionImport";
		mFunctionImport["sap:applicable-path"] = "entityProperty";

		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton1.getId(), { enabled : undefined });
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton2.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton1.getId() + "/enabled"), true, "Action button's enabled property correctly set to true.");
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton2.getId() + "/enabled"), true, "Action button's enabled property correctly set to true.");
		
		// destroy
		oButton1.destroy();
		oButton2.destroy();
	});
	
	test("action-for defined, two applicable-path false, two context selected", function(assert) {
		var oButton1 = new sap.m.Button();
		oButton1.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton1.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton1.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton1.getId() + "/enabled}");
		
		var oButton2 = new sap.m.Button();
		oButton2.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton2.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton2.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton2.getId() + "/enabled}");
		
		var oContext1 = {
			getPath: function() {
				return false; 
			}
		};
		var oContext2 = {
			getPath: function() {
				return false; 
			}
		};
		aContexts = [oContext1, oContext2];
		aToolbarContent = [oButton1, oButton2];
		
		mFunctionImport["sap:action-for"] = "functionImport";
		mFunctionImport["sap:applicable-path"] = "entityProperty";

		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton1.getId(), { enabled : undefined });
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton2.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton1.getId() + "/enabled"), false, "Action button's enabled property correctly set to false.");
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton2.getId() + "/enabled"), false, "Action button's enabled property correctly set to false.");
		
		// destroy
		oButton1.destroy();
		oButton2.destroy();
	});
	
	test("action-for defined, two applicable-path true, two context selected", function(assert) {
		var oButton1 = new sap.m.Button();
		oButton1.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton1.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton1.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton1.getId() + "/enabled}");
		
		var oButton2 = new sap.m.Button();
		oButton2.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "com.sap.vocabularies.UI.v1.DataFieldForAction"
    	}));
		oButton2.addCustomData(new sap.ui.core.CustomData({
    		key: "Action",
    		value: "Action1"
    	}));
		oButton2.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton2.getId() + "/enabled}");
		
		var oContext1 = {
			getPath: function() {
				return true; 
			}
		};
		var oContext2 = {
			getPath: function() {
				return true; 
			}
		};
		aContexts = [oContext1, oContext2];
		aToolbarContent = [oButton1, oButton2];
		
		mFunctionImport["sap:action-for"] = "functionImport";
		mFunctionImport["sap:applicable-path"] = "entityProperty";

		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton1.getId(), { enabled : undefined });
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton2.getId(), { enabled : undefined });
			
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton1.getId() + "/enabled"), true, "Action button's enabled property correctly set to true.");
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton2.getId() + "/enabled"), true, "Action button's enabled property correctly set to true.");
		
		// destroy
		oButton1.destroy();
		oButton2.destroy();
	});

	/* delete button test module */
	module("lib.CommonUtils.setEnabledToolbarButtons - Delete Button", {
		beforeEach: function () {
			fnCommonBeforeEach();
		},
		afterEach: fnCommonAfterEach
	});
	
	test("nothing is selected", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "CRUDActionDelete"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		aContexts = [];
		aToolbarContent = [oButton];
		
		// set the deletable path
		oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"]["Deletable"]["Path"] = "isDeletable";
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), false, "Delete button's enabled property correctly set to false.");
		
		// destroy
		oButton.destroy();
	});
	
	test("one item selected - item deletable", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "CRUDActionDelete"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext = {
			getPath: function() {
				return "isDeletable"; 
			} 
		};
		aContexts = [oContext];
		aToolbarContent = [oButton];
		
		// set the deletable path
		oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"]["Deletable"]["Path"] = "isDeletable";
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), true, "Delete button's enabled property correctly set to true.");
		
		// destroy
		oButton.destroy();
	});
	
	test("one item selected - item not deletable", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "CRUDActionDelete"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext = {
			getPath: function() {
				return "isNotDeletable"; 
			} 
		};
		aContexts = [oContext];
		aToolbarContent = [oButton];
		
		// set the deletable path
		oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"]["Deletable"]["Path"] = "isNotDeletable";
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), false, "Delete button's enabled property correctly set to false.");
		
		// destroy
		oButton.destroy();
	});
	
	test("two items selected - one not deletable, one deletable", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "CRUDActionDelete"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext1 = {
			getPath: function() {
				return "isNotDeletable"; 
			} 
		};
		var oContext2 = {
			getPath: function() {
				return "isDeletable"; 
			} 
		};
		aContexts = [oContext1, oContext2];
		aToolbarContent = [oButton];
		
		// set the deletable path
		oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"]["Deletable"]["Path"] = "isNotDeletable";
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), true, "Delete button's enabled property correctly set to true.");
		
		// destroy
		oButton.destroy();
	});
	
	test("two items selected - both not deletable", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "CRUDActionDelete"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext1 = {
			getPath: function() {
				return "isNotDeletable"; 
			} 
		};
		var oContext2 = {
			getPath: function() {
				return "isNotDeletable"; 
			} 
		};
		aContexts = [oContext1, oContext2];
		aToolbarContent = [oButton];
		
		// set the deletable path
		oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"]["Deletable"]["Path"] = "isNotDeletable";
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), false, "Delete button's enabled property correctly set to false.");
		
		// destroy
		oButton.destroy();
	});
	
	test("two items selected - both deletable", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "CRUDActionDelete"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext1 = {
			getPath: function() {
				return "isDeletable"; 
			} 
		};
		var oContext2 = {
			getPath: function() {
				return "isDeletable"; 
			} 
		};
		aContexts = [oContext1, oContext2];
		aToolbarContent = [oButton];
		
		// set the deletable path
		oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"]["Deletable"]["Path"] = "isNotDeletable";
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), true, "Delete button's enabled property correctly set to true.");
		
		// destroy
		oButton.destroy();
	});
	
	test("three items selected - one deletable, two not deletable", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "CRUDActionDelete"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext1 = {
			getPath: function() {
				return "isNotDeletable"; 
			} 
		};
		var oContext2 = {
			getPath: function() {
				return "isNotDeletable"; 
			} 
		};
		var oContext3 = {
			getPath: function() {
				return "isDeletable"; 
			} 
		};
		aContexts = [oContext1, oContext2, oContext3];
		aToolbarContent = [oButton];
		
		// set the deletable path
		oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"]["Deletable"]["Path"] = "isNotDeletable";
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), true, "Delete button's enabled property correctly set to true.");
		
		// destroy
		oButton.destroy();
	});
	
	test("three items selected - all not deletable", function(assert) {
		var oButton = new sap.m.Button();
		oButton.addCustomData(new sap.ui.core.CustomData({
    		key: "Type",
    		value: "CRUDActionDelete"
    	}));
		oButton.bindProperty("enabled", "{_templPriv>/generic/controlProperties/" + oButton.getId() + "/enabled}");
		
		var oContext1 = {
			getPath: function() {
				return "isNotDeletable"; 
			} 
		};
		var oContext2 = {
			getPath: function() {
				return "isNotDeletable"; 
			} 
		};
		var oContext3 = {
			getPath: function() {
				return "isNotDeletable"; 
			} 
		};
		aContexts = [oContext1, oContext2, oContext3];
		aToolbarContent = [oButton];
		
		// set the deletable path
		oEntitySet["Org.OData.Capabilities.V1.DeleteRestrictions"]["Deletable"]["Path"] = "isNotDeletable";
		
		// initialize the private model with the button id
		oPrivateModel.setProperty("/generic/controlProperties/" + oButton.getId(), { enabled : undefined });
		
		// call the function in test
		oCommonUtils.setEnabledToolbarButtons(oControl);
		
		// assert
		assert.strictEqual(oPrivateModel.getProperty("/generic/controlProperties/" + oButton.getId() + "/enabled"), false, "Delete button's enabled property correctly set to false.");
		
		// destroy
		oButton.destroy();
	});
});