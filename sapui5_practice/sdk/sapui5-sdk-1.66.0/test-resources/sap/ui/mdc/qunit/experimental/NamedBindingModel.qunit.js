
/* global QUnit, sinon */
sap.ui.require(
	[
		"sap/ui/model/odata/v4/ODataModel",
		"sap/ui/model/odata/v4/Context",
		"sap/ui/model/odata/OperationMode",
		"sap/ui/mdc/experimental/NamedBindingModel",
		"sap/ui/core/Control",
		"sap/ui/test/TestUtils"
	],
	function (ODataModel, Context, OperationMode, NamedBindingModel, Control, TestUtils) {
		"use strict";
		/* Constants */
		var sClassName = "sap.ui.mdc.experimental.NamedBindingModel",
			oNonDraftModelConfig = {
				mFixture: {
					"SalesOrderList": { source: "nondraft/SalesOrderList.json" },
					"$metadata": { source: "nondraft/metadata.xml" }
				},
				sServiceUrl: "/sap/opu/odata4/sap/zmm_music_database/sadl/sap/c_aivs_mdbu_artisttp/0001/"
			};

		function createModel(oSandbox, oConfig) {
			TestUtils.setupODataV4Server(oSandbox, oConfig.mFixture, "sap/ui/mdc/qunit/experimental/data", oConfig.sServiceUrl);
			return new ODataModel({ operationMode: OperationMode.Server, serviceUrl: oConfig.sServiceUrl, synchronizationMode: "None" });
		}

		function createSandbox() {
			var oSandbox = sinon.sandbox.create();
			return oSandbox;
		}

		QUnit.module(sClassName + ": NamedBingindModel Upgrade Tests", {
			beforeEach: function () {
				this.oSandbox = createSandbox();
				this.oNonDraftModel = createModel(this.oSandbox, oNonDraftModelConfig);
			},
			afterEach: function () {
				this.oNonDraftModel.destroy();
				this.oSandbox.verifyAndRestore();
			}
		});
		QUnit.test("Test model upgrade", function (assert) {
			var done = assert.async();
			NamedBindingModel.upgrade(this.oNonDraftModel).then(function () {
				["registerNamedBinding", "unregisterNamedBinding", "getBindingForReference"].forEach(function(sMethod){
					assert.ok(this.oNonDraftModel[sMethod], "The function ." + sMethod + " has been mixed into the OData model instance");
				}.bind(this));
				done();
			}.bind(this));
		});
		QUnit.test("Test named binding functions", function (assert) {
			var done = assert.async();
			NamedBindingModel.upgrade(this.oNonDraftModel).then(function () {
				var sTestId = 'testid',
					oModel = this.oNonDraftModel,
					//Create the binding through the model
					sParameters = '{"id": "' + sTestId + '"}',
					mParameters = JSON.parse(sParameters),
					oBinding = null;
				//Test asynchronisity: 1. ask for the binding
				assert.ok(
					oModel.getBindingForReference(sTestId).then(function(oReferedBinding) {
						assert.equal(oBinding, oReferedBinding, "getBindingForReference with sReferenceId='" + sTestId + "' returned the correct binding");
						oModel.unregisterNamedBinding(oReferedBinding);
						assert.ok(!oModel._mNamedBindings[sTestId], "unregisterNamedBinding successfully removed the binding from the model");
						done();
					})
				, "Calling getBindingForReference to get a named binding reference not yet created");
				//Test asynchronisity: 2. Create the bindin
				oBinding = oModel.bindList("/SalesOrderList", null, null, null, mParameters);
				assert.ok(oBinding, "Binding has been created using oModel.bindList with mParameters=" + sParameters);
				assert.ok(!mParameters.id, "id has been successfully removed from mParameters (so it won't be put to the request)");
				assert.equal(oBinding.sId, sTestId, "The id='" + sTestId + "' of the namedbinding has been set to .sId");
			}.bind(this));
		});
	}
);
