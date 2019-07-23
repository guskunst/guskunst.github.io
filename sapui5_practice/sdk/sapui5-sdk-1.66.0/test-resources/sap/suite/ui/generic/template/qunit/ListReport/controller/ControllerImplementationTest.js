sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Control",
	"sap/m/library",
	"sap/suite/ui/generic/template/ListReport/controller/ControllerImplementation",
	"sap/suite/ui/generic/template/lib/ShareUtils"
], function(jQuery, Control, MobileLibrary, ControllerImplementation, ShareUtils) {

	QUnit.module("Function getMethods", {
		before: function() {
			this.oMethods = ControllerImplementation.getMethods();
		},
		after: function() {
			delete this.oMethods;
		}
	});

	QUnit.test("Returns an object with an onInit function", function(assert) {
		assert.ok(jQuery.isFunction(this.oMethods.onInit), "The onInit function has been found.");
	});

	QUnit.test("Returns an object with a map of handlers", function(assert) {
		// Arrange
		assert.expect(49);

		// Act
		// Assert
		for(var k in this.oMethods.handlers) {
			assert.ok(jQuery.isFunction(this.oMethods.handlers[k]), "The " + k + " function has been found.");
		}
	});

	QUnit.test("Returns an object with a map of formatters", function(assert) {
		assert.ok(jQuery.isFunction(this.oMethods.formatters.formatDraftType), "The formatDraftType function has been found.");
		assert.ok(jQuery.isFunction(this.oMethods.formatters.formatDraftVisibility), "The formatDraftVisibility function has been found.");
		assert.ok(jQuery.isFunction(this.oMethods.formatters.formatDraftLineItemVisible), "The formatDraftLineItemVisible function has been found.");
		assert.ok(jQuery.isFunction(this.oMethods.formatters.formatDraftOwner), "The formatDraftOwner function has been found.");
		assert.ok(jQuery.isFunction(this.oMethods.formatters.formatItemTextForMultipleView), "The formatItemTextForMultipleView function has been found.");
	});

	QUnit.test("Returns an object containing an instance of ListReport.extensionAPI.ExtensionAPI", function(assert) {
		assert.strictEqual(this.oMethods.extensionAPI.getMetadata().getName(), "sap.suite.ui.generic.template.ListReport.extensionAPI.ExtensionAPI", "The ExtensionAPI instance is correct.");
	});

	QUnit.module("Event handler onShareListReportActionButtonPress", {
		beforeEach: function() {
			this.oOpenSharePopupStub = sinon.stub(ShareUtils, "openSharePopup");

			this.oView = {
				byId: function() {
					return {
						focus: jQuery.noop,
						setBeforePressHandler: jQuery.noop
					}
				}
			};
			this.oController = {
				getView: function() {
					return this.oView;
				}.bind(this)
			};
			this.oTemplateUtils = {
				oCommonUtils: {}
			};
			this.onShareListReportActionButtonPress = ControllerImplementation.getMethods(null, this.oTemplateUtils, {}).handlers.onShareListReportActionButtonPress.bind(this.oController);
		},
		afterEach: function() {
			this.onShareListReportActionButtonPress = null;
			this.oTemplateUtils = null;
			this.oController = null;
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
		this.onShareListReportActionButtonPress(oEvent);

		// Assert
		assert.strictEqual(this.oOpenSharePopupStub.callCount, 1, "The function openSharePopup has been called once.");
		assert.strictEqual(this.oOpenSharePopupStub.firstCall.args[0], this.oTemplateUtils.oCommonUtils, "The CommonUtils instance has been passed to the function.");
		assert.strictEqual(this.oOpenSharePopupStub.firstCall.args[1], oBy, "The event source has been passed to the function.");
		assert.strictEqual(typeof this.oOpenSharePopupStub.firstCall.args[2], "object", "An object instance has been passed to the function.");
	});

	QUnit.test("Shifts focus to the share button on beforePress of the bookmark button", function(assert) {
		// Arrange
		var oEvent = {
			getSource: sinon.stub().returns({})
		};
		var oBookmarkButton = {
			setBeforePressHandler: sinon.stub()
		};
		var oShareButton = {
			focus: sinon.stub()
		};
		var oByIdStub = sinon.stub(this.oView, "byId");
		oByIdStub.withArgs("template::Share").returns(oShareButton);
		oByIdStub.withArgs("bookmarkButton").returns(oBookmarkButton);

		// Act
		this.onShareListReportActionButtonPress(oEvent);

		var fnHandler = oBookmarkButton.setBeforePressHandler.firstCall.args[0];
		fnHandler();

		// Assert
		assert.strictEqual(oByIdStub.callCount, 2, "The view's byId function has been called twice.");
		assert.strictEqual(oShareButton.focus.callCount, 1, "The share button's focus function has been called once.");
	});

	QUnit.module("Fragment controller functions", {
		beforeEach: function(assert) {
			var oOpenSharePopupStub = sinon.stub(ShareUtils, "openSharePopup");

			var oView = {
				byId: function() {
					return {
						focus: jQuery.noop,
						setBeforePressHandler: jQuery.noop
					}
				}
			};
			this.oController = {
				getView: sinon.stub().returns(oView)
			};
			this.oTemplateUtils = {
				oCommonUtils: {}
			};

			var oEvent = {
				getSource: sinon.stub().returns({})
			};
			ControllerImplementation.getMethods(null, this.oTemplateUtils, this.oController).handlers.onShareListReportActionButtonPress.apply(this.oController, [ oEvent ]);

			this.oFragmentController = oOpenSharePopupStub.firstCall.args[2];
			assert.strictEqual(jQuery.isEmptyObject(this.oFragmentController), false, "The fragment controller has been found.");

			oOpenSharePopupStub.restore();
		},
		afterEach: function() {
			this.oController = null;
			this.oTemplateUtils = null;
			this.oFragmentController = null;
		}
	});

	QUnit.test("The fragmentController's shareEmailPressed function", function(assert) {
		// Arrange
		var oTriggerEmailStub = sinon.stub(MobileLibrary.URLHelper, "triggerEmail");
		var oGetTextStub = sinon.stub().returns("FancySubject");
		this.oTemplateUtils.oCommonUtils.getText = oGetTextStub;
		this.oTemplateUtils.oServices = {
			oApplication: {
				getAppTitle: sinon.stub().returns("FancyTitle")
			}
		};

		// Act
		this.oFragmentController.shareEmailPressed();

		// Assert
		assert.strictEqual(oGetTextStub.callCount, 1, "The TemplateUtils' getText function has been called once.");
		assert.strictEqual(oGetTextStub.firstCall.args[0], "EMAIL_HEADER", "The correct localization key has been passed.");
		assert.strictEqual(oGetTextStub.firstCall.args[1].length, 1, "The correct number of placeholder values has been passed.");
		assert.strictEqual(oGetTextStub.firstCall.args[1][0], "FancyTitle", "The correct app title has been passed.");

		assert.strictEqual(oTriggerEmailStub.callCount, 1, "The URLHelper's triggerEmail function has been called once.");
		assert.strictEqual(oTriggerEmailStub.firstCall.args[0], null, "The correct destination e-mail parameter has been passed.");
		assert.strictEqual(oTriggerEmailStub.firstCall.args[1], "FancySubject", "The correct subject parameter has been passed.");
		assert.strictEqual(oTriggerEmailStub.firstCall.args[2], document.URL, "The correct e-mail body parameter has been passed.");

		// Cleanup
		oTriggerEmailStub.restore();
	});

	QUnit.test("The fragmentController's shareJamPressed function", function(assert) {
		// Arrange
		var oStub = sinon.stub(ShareUtils, "openJamShareDialog");
		this.oTemplateUtils.oServices = {
			oApplication: {
				getAppTitle: sinon.stub().returns("FancyTitle")
			}
		};

		// Act
		this.oFragmentController.shareJamPressed();

		// Assert
		assert.strictEqual(oStub.callCount, 1, "The function openJamShareDialog has been called once.");
		assert.strictEqual(oStub.firstCall.args[0], "FancyTitle", "The function openJamShareDialog has been called with the correct parameter.");

		// Cleanup
		oStub.restore();
	});

	QUnit.test("The fragmentController's getCustomUrl function with hash", function(assert) {
		// Arrange
		var oOriginalHasher;
		if (window.hasher) {
			oOriginalHasher = window.hasher;
		}

		window.hasher = {
			getHash: sinon.stub().returns("SomeAppHash")
		};

		// Act
		var sResult = this.oFragmentController.getCustomUrl();

		// Assert
		assert.strictEqual(sResult, "#SomeAppHash", "The correct value has been returned.");

		// Cleanup
		window.hasher = oOriginalHasher;
	});

	QUnit.test("The fragmentController's getCustomUrl function without hash", function(assert) {
		// Arrange
		var oOriginalHasher;
		if (window.hasher) {
			oOriginalHasher = window.hasher;
		}

		window.hasher = {
			getHash: sinon.stub().returns("")
		};

		// Act
		var sResult = this.oFragmentController.getCustomUrl();

		// Assert
		assert.strictEqual(sResult, window.location.href, "The correct value has been returned.");

		// Cleanup
		window.hasher = oOriginalHasher;
	});

	function getModelData(assert) {
		// Arrange
		var oGetManifestEntryStub = sinon.stub();
		oGetManifestEntryStub.withArgs("sap.ui").returns({
			icons: {
				icon: "sap-icon://endoscopy"
			}
		});
		oGetManifestEntryStub.withArgs("sap.app").returns({
			title: "FancyTitle"
		});
		
		this.oController.getOwnerComponent = function() {
			return {
				getAppComponent: function() {
					return {
						getMetadata: function() {
							return {
								getManifestEntry: oGetManifestEntryStub
							};
						}
					};
				}
			};
		};

		sinon.stub(this.oFragmentController, "getDownloadUrl").returns("fancyUrl");

		// for getCustomUrl
		var oOriginalHasher;
		if (window.hasher) {
			oOriginalHasher = window.hasher;
		}
		window.hasher = {
			getHash: sinon.stub().returns("SomeAppHash")
		};

		// Act
		var oResult = this.oFragmentController.getModelData();

		// Cleanup
		window.hasher = oOriginalHasher;
		// Assert
		assert(oResult);
	}

	QUnit.test("The fragmentController's getModelData function", function(assert) {
		// Arrange
		var oGetObjectStub = sinon.stub(jQuery.sap, "getObject"); // Returns undefined

		// Act
		getModelData.call(this, function(oResult) {
			// Assert
			assert.strictEqual(oResult.icon, "sap-icon://endoscopy", "The icon property has the correct value.");
			assert.strictEqual(oResult.title, "FancyTitle", "The icon property has the correct value.");
			assert.strictEqual(oResult.serviceUrl, "fancyUrl&$top=0&$inlinecount=allpages", "The serviceUrl property has the correct value.");
			assert.strictEqual(oResult.customUrl, "#SomeAppHash", "The customUrl property has the correct value.");
			assert.strictEqual(oResult.isShareInJamActive, false, "The isShareInJamActive property has the correct value.");
		}.bind(this));

		// Cleanup
		oGetObjectStub.restore();
	});

	QUnit.test("The fragmentController's getModelData function correctly uses the getUser function", function(assert) {
		// Arrange
		var fnGetUser = function() {
			return {
				isJamActive: sinon.stub().returns(true)
			};
		};
		var oGetObjectStub = sinon.stub(jQuery.sap, "getObject").returns(fnGetUser);

		// Act
		getModelData.call(this, function(oResult) {
			// Assert
			assert.strictEqual(oResult.isShareInJamActive, true, "The isShareInJamActive property has the correct value.");
		});

		// Cleanup
		oGetObjectStub.restore();
	});

	QUnit.test("The fragmentController's getServiceUrl returns a string", function(assert) {
		// Arrange
		var oStub = sinon.stub(this.oFragmentController, "getDownloadUrl").returns("");

		// Act
		var sResult = this.oFragmentController.getServiceUrl();

		// Assert
		assert.strictEqual(oStub.callCount, 1, "The function getDownloadUrl has been called once.");
		assert.strictEqual(sResult, "", "The correct service URL has been returned.");
	});

	QUnit.test("The fragmentController's getServiceUrl appends query parameters to an existing URL", function(assert) {
		// Arrange
		sinon.stub(this.oFragmentController, "getDownloadUrl").returns("fancyUrl");

		// Act
		var sResult = this.oFragmentController.getServiceUrl();

		// Assert
		assert.strictEqual(sResult, "fancyUrl&$top=0&$inlinecount=allpages", "The correct service URL has been returned.");
	});

	QUnit.test("The fragmentController's getServiceUrl function calls the controller's onSaveAsTileExtension function", function(assert) {
		// Arrange
		this.oController.onSaveAsTileExtension = sinon.spy();
		sinon.stub(this.oFragmentController, "getDownloadUrl");

		// Act
		this.oFragmentController.getServiceUrl();

		// Assert
		assert.strictEqual(this.oController.onSaveAsTileExtension.callCount, 1, "The function onSaveAsTileExtensions has been called once.");
	});

	QUnit.test("The onSaveAsTileExtension overrides the default serviceUrl", function(assert) {
		// Arrange
		this.oController.onSaveAsTileExtension = function(oShareInfo) {
			oShareInfo.serviceUrl = "FancyUrl";
		};
		sinon.stub(this.oFragmentController, "getDownloadUrl");

		// Act
		var sResult = this.oFragmentController.getServiceUrl();

		// Assert
		assert.strictEqual(sResult, "FancyUrl", "The correct service URL has been returned.");
	});

	// QUnit.start();
});
