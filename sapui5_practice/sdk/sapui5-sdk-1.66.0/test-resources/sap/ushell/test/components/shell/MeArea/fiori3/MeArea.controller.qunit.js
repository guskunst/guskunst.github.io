// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for MeArea.controller
 */
sap.ui.require([
    "sap/ushell/Config",
    "sap/ushell/components/applicationIntegration/AppLifeCycle",
    "sap/ushell/test/utils",
    "sap/ushell/components/shell/MeArea/fiori3/MeArea.controller",
    "sap/ushell/ui/footerbar/EndUserFeedback",
    "sap/m/MessageBox",
    'sap/ushell/ui/shell/ShellHeadItem'
], function (Config, AppLifeCycle, testUtils, MeAreaController, EndUserFeedback, MessageBox, ShellHeadItem) {
    "use strict";
    /* global QUnit sinon Promise */

    var oController;
    var oShellConfig = null;
    var oAppLifeCycleGetModelStub;

    var oRenderer = {
        getShellConfig : function () {
            return oShellConfig || {};
        },
        showActionButton: sinon.spy(),
        hideActionButton: sinon.spy(),
        getEndUserFeedbackConfiguration: function () {
            return {};
        },
        addUserProfilingEntry: sinon.spy()
    };

    QUnit.module("MeArea.controller functionality", {
        beforeEach: function () {
            // eslint-disable-next-line no-unused-expressions
            oAppLifeCycleGetModelStub = sinon.stub(AppLifeCycle, "getElementsModel").returns({getModel: function() {}}),
            sap.ushell.Container = sap.ushell.Container || {};
            sap.ushell.Container.getUser = function () {
                return {
                    getFullName: sinon.spy(),
                    getId: sinon.spy(),
                    getEmail: sinon.spy()
                };
            };

            sap.ushell.Container.getRenderer = function () {
                return oRenderer;
            };
            sap.ushell.Container.getService = sinon.spy();
            //disable EndUserFeedback
            testUtils.resetConfigChannel();
            Config.emit("/core/extension/EndUserFeedback", false);
            oController = new MeAreaController();
        },
        afterEach: function () {
            if (oController) {
                oController.onExit();
            }
            oShellConfig = null;
            oAppLifeCycleGetModelStub.restore();
        }
    });

    QUnit.test("Filter not existing actions", function (assert) {
        var oLastStub = sinon.stub(Config, "last"),
            oExpectedActions = ["openCatalogBtn", "userSettingsBtn"];
        oLastStub.withArgs("/core/shell/model/currentState/actions").returns(["openCatalogBtn", "userSettingsBtn"].concat(["fake1", "fake2"]));

        oController.onInit();

        assert.deepEqual(oController.oModel.getProperty("/actions"), oExpectedActions, "Not created actins item should be filtered");
        oLastStub.restore();
    });

    QUnit.test("Don't create AppFinder button if enablePersonalization is false", function (assert) {
        oShellConfig = {
            enablePersonalization: false
        };
        var createAppFinderButtonStub = sinon.stub(oController, "_createAppFinderButton");
        oController.onInit();

        assert.ok(!createAppFinderButtonStub.called, "Not created actins item should be filtered");
        createAppFinderButtonStub.restore();
    });

    QUnit.test("Don't create AppFinder button if the button is moved to header", function (assert) {
        oShellConfig = {
            moveAppFinderActionToShellHeader: true
        };
        var createAppFinderButtonStub = sinon.stub(oController, "_createAppFinderButton");
        oController.onInit();

        assert.ok(!createAppFinderButtonStub.called, "Not created actins item should be filtered");
        createAppFinderButtonStub.restore();
    });

    QUnit.test("Create RecentActivitiesButton and FrequentActivitiesButton when enableRecentActivity is true", function (assert) {
        oShellConfig = {
            enableRecentActivity: true
        };

        Config.emit("/core/shell/model/currentState/showRecentActivity", true);

        var createRecentActivityStub = sinon.stub(oController, "_createRecentActivitiesButton");
        var createFrequentUsedStub = sinon.stub(oController, "_createFrequentActivitiesButton");

        oController.onInit();

        assert.ok(createRecentActivityStub.calledOnce, "_createRecentActivitiesButton should be called");
        assert.ok(createFrequentUsedStub.calledOnce, "_createRecentActivitiesButton should be called");

        createRecentActivityStub.restore();
        createFrequentUsedStub.restore();
    });

    QUnit.test("Create logout button is not called when disableSignOut is true", function (assert) {
        oShellConfig = {
            disableSignOut: true
        };

        var createLogoutButtonStub = sinon.stub(oController, "_createLogoutButton");

        oController.onInit();

        assert.ok(createLogoutButtonStub.notCalled, "_createLogoutButton should not be called");

        createLogoutButtonStub.restore();
    });

    QUnit.test("_createRecentActivitiesButton create button and add to the actions when tracking is enabled", function (assert) {

        var configOnStub = sinon.stub(Config, "on").returns({
            do: function (callback) {
                callback(true);
            }
        });
        oRenderer.showActionButton = sinon.spy();
        oRenderer.hideActionButton = sinon.spy();

        oController._createRecentActivitiesButton();

        assert.ok(sap.ui.getCore().byId("recentActivitiesBtn"), "recentActivitiesBtn was created");
        assert.ok(oRenderer.showActionButton.calledOnce, "the button should be added to actions in model");
        assert.ok(oRenderer.hideActionButton.notCalled, "the button should be added to actions in model");
        assert.equal(sap.ushell.Container.getRenderer().showActionButton.getCall(0).args[0], "recentActivitiesBtn", "the id is correct");
        configOnStub.restore();
    });

    QUnit.test("_createRecentActivitiesButton don't create the button when tracking is disabled", function (assert) {

        var configOnStub = sinon.stub(Config, "on").returns({
            do: function (callback) {
                callback(false);
            }
        });

        oRenderer.showActionButton = sinon.spy();
        oRenderer.hideActionButton = sinon.spy();

        oController._createRecentActivitiesButton();

        assert.ok(!sap.ui.getCore().byId("recentActivitiesBtn"), "recentActivitiesBtn should not be created");
        assert.ok(oRenderer.showActionButton.notCalled, "the button should not be added to actions in model");
        assert.ok(oRenderer.hideActionButton.calledOnce, "the button should be removed from model");
        configOnStub.restore();
    });

    QUnit.test("_createFrequentActivitiesButton create button and add to the actions when tracking is enabled", function (assert) {

        var configOnStub = sinon.stub(Config, "on").returns({
            do: function (callback) {
                callback(true);
            }
        });
        oRenderer.showActionButton = sinon.spy();
        oRenderer.hideActionButton = sinon.spy();

        oController._createFrequentActivitiesButton();

        assert.ok(sap.ui.getCore().byId("frequentActivitiesBtn"), "frequentActivitiesBtn was created");
        assert.ok(oRenderer.showActionButton.calledOnce, "the button should be added to actions in model");
        assert.ok(oRenderer.hideActionButton.notCalled, "the button should be added to actions in model");
        assert.equal(sap.ushell.Container.getRenderer().showActionButton.getCall(0).args[0], "frequentActivitiesBtn", "the id is correct");
        configOnStub.restore();
    });

    QUnit.test("_createFrequentActivitiesButton don't create the button when tracking is disabled", function (assert) {

        var configOnStub = sinon.stub(Config, "on").returns({
            do: function (callback) {
                callback(false);
            }
        });

        oRenderer.showActionButton = sinon.spy();
        oRenderer.hideActionButton = sinon.spy();

        oController._createFrequentActivitiesButton();

        assert.ok(!sap.ui.getCore().byId("frequentActivitiesBtn"), "frequentActivitiesBtn should not be created");
        assert.ok(oRenderer.showActionButton.notCalled, "the button should not be added to actions in model");
        assert.ok(oRenderer.hideActionButton.calledOnce, "the button should be removed from model");
        configOnStub.restore();
    });

    QUnit.test("_createSupportTicketButton create button and add to the actions when SupportTicket is enable", function (assert) {
        var sButtonId = "ContactSupportBtn";
        var configOnStub = sinon.stub(Config, "on").returns({
            do: function (callback) {
                callback(true);
            }
        });
        oRenderer.showActionButton = sinon.spy();
        oRenderer.hideActionButton = sinon.spy();

        oController._createSupportTicketButton(true);

        assert.ok(sap.ui.getCore().byId(sButtonId), sButtonId + " was created");
        assert.ok(oRenderer.showActionButton.calledOnce, "the button should be added to actions in model");
        assert.ok(oRenderer.hideActionButton.notCalled, "the button should be added to actions in model");
        assert.equal(sap.ushell.Container.getRenderer().showActionButton.getCall(0).args[0], sButtonId, "the id is correct");
        configOnStub.restore();
    });

    QUnit.test("_createSupportTicketButton don't create the button when SupportTicket is disabled", function (assert) {
        var sButtonId = "ContactSupportBtn";
        var configOnStub = sinon.stub(Config, "on").returns({
            do: function (callback) {
                callback(false);
            }
        });

        oRenderer.showActionButton = sinon.spy();
        oRenderer.hideActionButton = sinon.spy();

        oController._createSupportTicketButton(true);

        assert.ok(!sap.ui.getCore().byId(sButtonId), sButtonId + " should not be created");
        assert.ok(oRenderer.showActionButton.notCalled, "the button should not be added to actions in model");
        assert.ok(oRenderer.hideActionButton.calledOnce, "the button should be removed from model");
        configOnStub.restore();
    });

    QUnit.test("Hide EndUserFeedbackBtn when it was created and EndUserFeedback was disabled", function (assert) {
        var sButtonId = "EndUserFeedbackBtn";
        var oTestBtn = new EndUserFeedback(sButtonId);
        var configOnStub = sinon.stub(Config, "on").returns({
            do: function (callback) {
                callback(false);
            }
        });

        oRenderer.showActionButton = sinon.spy();
        oRenderer.hideActionButton = sinon.spy();

        oController._setupEndUserFeedbackButton(true);

        assert.ok(oRenderer.hideActionButton.calledOnce, "the button should be removed from model");
        assert.equal(oRenderer.hideActionButton.getCall(0).args[0], sButtonId, "the id is correct");
        configOnStub.restore();
        oTestBtn.destroy();
    });

    QUnit.test("MessageBox should be open when click on logout button", function (assert) {
        var fnDone = assert.async();
        var sButtonId = "logoutBtn";

        sap.ushell.Container.getGlobalDirty = sinon.stub().returns({
            done: function (callback) {
                callback(false);
            }
        });
        sap.ushell.Container.DirtyState = {};
        var oMessageBoxStub = sinon.stub(MessageBox, "show");

        oController.onInit();
        sap.ui.getCore().byId(sButtonId).firePress();

        setTimeout(function () {
            assert.ok(oMessageBoxStub.calledOnce, "MessageBox should be shown");
            oMessageBoxStub.restore();
            delete sap.ushell.Container.getGlobalDirty;
            fnDone();
        }, 100);
    });

});