// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.components.homepage.ActionMode
 */
sap.ui.require([
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/homepage/ActionMode",
    "sap/ushell/Config"
], function (JSONModel, ActionMode, Config) {
    "use strict";

    /* global QUnit sinon */

    var oModel;

    QUnit.module("sap.ushell.components.homepage.Component", {
        beforeEach: function () {
            oModel = new JSONModel({
                tileActionModeActive: false,
                topGroupInViewPortIndex: 0,
                homePageGroupDisplay: "scroll",
                groups: []
            });
            this.oConfigStub = sinon.stub(Config, "last");
        },
        afterEach: function () {
            this.oConfigStub.restore();
        }
    });

    QUnit.test("The group header visibility is change", function (assert) {
        var aGroups = [
                {
                    title: "test1",
                    isGroupVisible: true,
                    visibilityModes: [false, true],
                    showGroupHeader: true
                },
                {
                    title: "test2",
                    isGroupVisible: true,
                    visibilityModes: [true, true],
                    showGroupHeader: false
                }
            ],
            fnActivationStub = sinon.stub(ActionMode, "activate");


        oModel.setProperty("/groups", aGroups);

        ActionMode.toggleActionMode(oModel);

        assert.equal(oModel.getProperty("/groups/0/showGroupHeader"), false, "The header of the first group should be hidden");
        assert.equal(oModel.getProperty("/groups/1/showGroupHeader"), true, "The header of the second group should be shown");
        assert.ok(fnActivationStub.called, "activate is called");
        fnActivationStub.restore();

    });

    QUnit.test("Show header of the first group if there is only 1 visible group", function (assert) {
        var aGroups = [
                {
                    title: "test1",
                    isGroupVisible: true,
                    visibilityModes: [false, true],
                    showGroupHeader: true
                },
                {
                    title: "test2",
                    isGroupVisible: false,
                    visibilityModes: [true, true],
                    showGroupHeader: false
                }
            ],
            fnActivationStub = sinon.stub(ActionMode, "activate");

        this.oConfigStub.returns(false);

        oModel.setProperty("/groups", aGroups);

        ActionMode.toggleActionMode(oModel);

        assert.equal(oModel.getProperty("/groups/0/showGroupHeader"), true, "The header of the first group should be visible because there is only 1 visible group");
        assert.ok(fnActivationStub.called, "activate is called");
        fnActivationStub.restore();

    });

    QUnit.test("Show header of the first group in edit mode, even if there are multiple visible groups, if the GridContainer is used", function (assert) {
        var aGroups = [
            {
                title: "test1",
                isGroupVisible: true,
                visibilityModes: [false, true],
                showGroupHeader: false
            },
            {
                title: "test2",
                isGroupVisible: true,
                visibilityModes: [true, true],
                showGroupHeader: false
            }
        ],
            fnActivationStub = sinon.stub(ActionMode, "activate");

        this.oConfigStub.returns(true);

        oModel.setProperty("/groups", aGroups);

        ActionMode.toggleActionMode(oModel);

        assert.equal(oModel.getProperty("/groups/0/showGroupHeader"), true, "The header of the first group should be visible because the GridContainer is used");
        assert.ok(fnActivationStub.called, "activate is called");
        fnActivationStub.restore();

    });

});