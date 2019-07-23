/*
 * tests for the sap.suite.ui.generic.template.detailTemplates.detailUtils
 */

sap.ui.define(
	[   "testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/lib/testableHelper",
		"sap/suite/ui/generic/template/detailTemplates/detailUtils"
	],
	function(sinon, testableHelper, detailUtils) {
		"use strict";

		var oAssert;
		var sTheEntitySet = "STTA_C_MP_Product";

		var oTemplatePrivateModel = {
			getProperty: function() {
				return 3;
			}
		};

		var oBusyHelper = {};

		var oTemplateUtils = {
			oCommonUtils: { },
			oServices: {
				oTemplateCapabilities: {},
				oApplication: {
					getLinkToUpperLayersInfo: function(bIncludeRoot, bIncludeMe, sEntitySet){
						oAssert.ok(!bIncludeRoot, "No upper link for the root needed for bread crumb");
						oAssert.ok(!bIncludeMe, "No upper link for the root needed for bread crumb");
						oAssert.strictEqual(sEntitySet, sTheEntitySet, "Look for upper layers for the given entity set only");
						var oInfoObject = {
							link: "STTA_C_MP_Product(ProductDraftUUID=guid'00000000-0000-0000-0000-000000000000',ActiveProduct='HT-1002')",
							section: "STTA_C_MP_Product(ProductDraftUUID=guid'00000000-0000-0000-0000-000000000000',ActiveProduct='HT-1002')",
							entitySet: sTheEntitySet,
							fullLink: "STTA_C_MP_Product(ProductDraftUUID=guid'00000000-0000-0000-0000-000000000000',ActiveProduct='HT-1002')"
						};
						return {
							aInfoObjects: [null, oInfoObject],
							aInfoObjectPromises: [null, Promise.resolve(oInfoObject)]
						};
					},
					getBusyHelper: function(){
						return oBusyHelper;
					}
				}
			},
			oComponentUtils: {
				getFclProxy: function() {
					return {};
				},
				getTemplatePrivateModel: function() {
					return oTemplatePrivateModel;
				},
				isODataBased: function(){
					return true;
				}
			}
		};

		var oBindingInfo = {};
		var oLink1 = {
			bindElement: function(oBindingInfo){
				oAssert.strictEqual(oBindingInfo.path, "/STTA_C_MP_Product(ProductDraftUUID=guid'00000000-0000-0000-0000-000000000000',ActiveProduct='HT-1002')", "The bionding context for the link must be set correctly");
			},
			getBindingInfo: function(sPath){
				oAssert.strictEqual(sPath, "text", "Binding Info for path text must have been requested");
				return oBindingInfo;
			}
		};

		var oComponent = {
			getEntitySet: function(){
				return sTheEntitySet;
			}
		};

		var oController = {
			getOwnerComponent: function() {
				return oComponent;
			}
		};
		var oBase;
		var oStubForPrivate;
		var oViewProxy;
		var oSandbox;
		var oBusySpy;
		var oLinkInfoObject;

		function fnCommonSetup(){
			oSandbox = sinon.sandbox.create();
			oStubForPrivate = testableHelper.startTest();
			oSandbox.stub(testableHelper.getStaticStub(), "MessageButtonHelper");
			oSandbox.stub(testableHelper.getStaticStub(), "PaginatorButtonsHelper");
			oSandbox.stub(oTemplateUtils.oServices.oApplication, "getSaveScenarioHandler");
			oSandbox.stub(oTemplateUtils.oCommonUtils, "getControlInformation", function(oControl){
				oAssert.strictEqual(oControl, oLink1, "Info object should only be requested for the link");
				var iArgLength = arguments.length;
				oAssert.strictEqual(iArgLength, 1, "Only link must be passed to getControlInformation");
				oAssert.ok(!oLinkInfoObject, "The info object for the link must only be requested once");
				oLinkInfoObject = {};
				return oLinkInfoObject;
			});
			oBusySpy = oSandbox.spy(oBusyHelper, "setBusy");
			var oMyTemplateUtils = oTemplateUtils;
			oViewProxy = {
				aBreadCrumbs: [oLink1],
				oStatePreserver: {}
			};
			oBase = detailUtils.getControllerBase(oViewProxy, oTemplateUtils, oController);
			jQuery.extend(oMyTemplateUtils, oTemplateUtils); // add content to the TemplateUtils, after getMethods has been called. This is the way, as it is done by the TemplateAssembler.
			oBase.onInit();
		}

		function fnCommonTeardown() {
			oLinkInfoObject = null;
			oSandbox.restore();
			testableHelper.endTest();
		}

		module("adaptLinksToUpperLevels - HCP", {
			setup: fnCommonSetup,
			teardown: fnCommonTeardown
		});

		function fnTestForLink(done, assert, sExpectedLink){
			assert.ok(oBusySpy.calledOnce, "The app must have been set busy exactly once");

			oSandbox.stub(oLink1, "setHref", function(sHref){
				assert.strictEqual(sHref, sExpectedLink, "the correct hash must be set");
				setTimeout(function(){
					assert.strictEqual(oLinkInfoObject.internalHash, "STTA_C_MP_Product(ProductDraftUUID=guid'00000000-0000-0000-0000-000000000000',ActiveProduct='HT-1002')", "Link must have been set correctly in the info object");
					assert.ok(oBusySpy.calledOnce, "The app must still have been set busy exactly once");
					done();
				}, 0);
			});
		}

		QUnit.test("building up the breadcrumbs - HCP and Shell HashChanger", function(assert) {
			oAssert = assert;
			/*testing like on HCP*/
			oSandbox.stub(oStubForPrivate, "getHashChangerInstance", function(){
				var oHashChanger = {
					hrefForAppSpecificHash: function(sName){
						assert.strictEqual(sName, "STTA_C_MP_Product(ProductDraftUUID=guid'00000000-0000-0000-0000-000000000000',ActiveProduct='HT-1002')", "The correct information must be passed to the HashChanger");
						return "theFinalHash";
					}
				};
				return oHashChanger;
			});
			var done = assert.async();
			oStubForPrivate.adaptLinksToUpperLevels();
			fnTestForLink(done, assert, "theFinalHash");
		});

		QUnit.test("building up the breadcrumbs - sap.ui.core.routing.HashChanger", function(assert) {
			oAssert = assert;
			/*testing like on HCP*/
			oSandbox.stub(oStubForPrivate, "getHashChangerInstance", function(){
				var oHashChanger = {};
				return oHashChanger;
			});
			var done = assert.async();
			oStubForPrivate.adaptLinksToUpperLevels();
			fnTestForLink(done, assert, "#/STTA_C_MP_Product(ProductDraftUUID=guid'00000000-0000-0000-0000-000000000000',ActiveProduct='HT-1002')");
		});
	});
