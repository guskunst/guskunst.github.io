// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.components.appfinder.Component
 */
sap.ui.require([
    "sap/ushell/renderers/fiori2/RendererExtensions",
    "sap/ushell/services/Container",
    "sap/ushell/EventHub"
], function (RendererExtensions, Container, oEventHub) {
    "use strict";

    /* global QUnit, sinon, hasher */

    var oComponent,
        sComponentName = "sap.ushell.components.appfinder",
        oComponentData = {
            config: {
                enableSetTheme: true,
                enableHelp: true,
                preloadLibrariesForRootIntent: false,
                applications: {
                    "Shell-home" : {
                        enableActionModeMenuButton: true,
                        enableActionModeFloatingButton: true,
                        enableTileActionsIcon: false,
                        enableHideGroups: true,
                        enableHelp: true,
                        enableTilesOpacity: false
                    }
                },
                rootIntent: "Shell-home"
            }
        },
        sCatalogViewName = "sap.ushell.components.appfinder.Catalog",
        sAppFinderViewName = "sap.ushell.components.appfinder.AppFinder",
        sEasyAccessViewName = "sap.ushell.components.appfinder.EasyAccess",
        oAddHeaderItemStub,
        oSetLeftPaneVisibilityStub,
        oAddOptionsActionSheetButtonStub,
        oGetConfiguration,
        oGetElementsModelStub;

    QUnit.module("sap.ushell.components.appfinder.Component", {
        beforeEach: function (assert) {
            var done = assert.async();

            sap.ushell.bootstrap("local").then(function () {
                jQuery.sap.flpmeasure = {
                    end: function () {},
                    start: function () {},
                    endFunc: function () {},
                    startFunc : function () {}
                };

                sap.ushell.Container.getRenderer = function () {
                    return {
                        createExtendedShellState : function () {

                        },
                        applyExtendedShellState: function () {

                        },
                        getModelConfiguration: function () {
                            return {
                                enableNotificationsUI: true
                            };
                        },
                        getCurrentViewportState: function () {
                            return "Center";
                        },
                        addUserPreferencesEntry: function () {

                        }
                    };
                };
                oAddHeaderItemStub = sinon.stub(sap.ushell.renderers.fiori2.RendererExtensions, "addHeaderItem");
                oSetLeftPaneVisibilityStub = sinon.stub(sap.ushell.renderers.fiori2.RendererExtensions, "setLeftPaneVisibility");
                oAddOptionsActionSheetButtonStub = sinon.stub(sap.ushell.renderers.fiori2.RendererExtensions, "addOptionsActionSheetButton");
                oGetConfiguration = sinon.stub(sap.ushell.renderers.fiori2.RendererExtensions, "getConfiguration").returns({
                    enableSetTheme: true,
                    enableHelp: true,
                    preloadLibrariesForRootIntent: false
                });

                oComponent = sap.ui.component({
                    id: "applicationsap-ushell-components-appfinder-component",
                    name: sComponentName,
                    componentData : oComponentData
                });

                oComponent.getRootControl().loaded().then(function () {
                    done();
                });
            });
        },
        afterEach: function (assert) {
            delete sap.ushell.Container;
            oComponent.destroy();

            oAddHeaderItemStub.restore();
            oSetLeftPaneVisibilityStub.restore();
            oAddOptionsActionSheetButtonStub.restore();
            oGetConfiguration.restore();

            hasher.setHash("");
            var oHideGroupsBtn = sap.ui.getCore().byId("hideGroupsBtn");
            if (oHideGroupsBtn) {
                oHideGroupsBtn.destroy();
            }

            oEventHub._reset();
        }
    });

    QUnit.test("The component instance was created", function (assert) {
        assert.ok(oComponent, "Instance was created");
    });

    QUnit.test("Check that the AppFinder view was created", function (assert) {
        var oAppFinderView = oComponent.getRootControl();

        assert.equal(oAppFinderView.getViewName(), sAppFinderViewName, "The appfinder view was created");
    });

    QUnit.test("Check that correct detail message is created on catalog content creation", function (assert) {
        var oController = sap.ui.controller("sap.ushell.components.appfinder.Catalog"),
            tileTitle = "tile_title",
            firstAddedGroupTitle = "first_added_group",
            firstRemovedGroupTitle = "first_removed_group",
            numberOfAddedGroups = [1, 0, 1, 2, 2, 0, 1, 2],
            numberOfRemovedGroups = [0, 1, 1, 0, 1, 2, 2, 2],
            getTextFromBundle = sap.ushell.resources.i18n,
            successMessages = [
                getTextFromBundle.getText("tileAddedToSingleGroup", [tileTitle, firstAddedGroupTitle]),
                getTextFromBundle.getText("tileRemovedFromSingleGroup", [tileTitle, firstRemovedGroupTitle]),
                getTextFromBundle.getText("tileAddedToSingleGroupAndRemovedFromSingleGroup", [tileTitle, firstAddedGroupTitle, firstRemovedGroupTitle]),
                getTextFromBundle.getText("tileAddedToSeveralGroups", [tileTitle, numberOfAddedGroups[3]]),
                getTextFromBundle.getText("tileAddedToSeveralGroupsAndRemovedFromSingleGroup", [tileTitle, numberOfAddedGroups[4], firstRemovedGroupTitle]),
                getTextFromBundle.getText("tileRemovedFromSeveralGroups", [tileTitle, numberOfRemovedGroups[5]]),
                getTextFromBundle.getText("tileAddedToSingleGroupAndRemovedFromSeveralGroups", [tileTitle, firstAddedGroupTitle, numberOfRemovedGroups[6]]),
                getTextFromBundle.getText("tileAddedToSeveralGroupsAndRemovedFromSeveralGroups", [tileTitle, numberOfAddedGroups[7], numberOfRemovedGroups[7]])
            ];

        for (var index = 0; index < numberOfAddedGroups.length; index++) {
            var message = oController.prepareDetailedMessage(tileTitle, numberOfAddedGroups[index], numberOfRemovedGroups[index], firstAddedGroupTitle, firstRemovedGroupTitle);
            assert.ok(successMessages[index] === message, "Expected message: " + successMessages[index] + " Message returned: " + message);
        }
        oController.destroy();
    });

    QUnit.test("Check that correct error message is created on catalog content creation error", function (assert) {
        var oController = sap.ui.controller("sap.ushell.components.appfinder.Catalog"),
            tileTitle = "tile_title",
            numberOfAddToGroupsFails =      [0, 0, 1, 0, 2, 0, 1],
            numberOfRemoveFromGroupsFails = [0, 1, 0, 1, 0, 2, 1],
            createNewGroupFail =            [1, 1, 0, 0, 0, 0, 0],
            oGroup = {title: "test group"},
            oErroneousActions = [],
            getTextFromBundle = sap.ushell.resources.i18n,
            failMessages = [
                getTextFromBundle.getText("fail_tile_operation_create_new_group"),
                getTextFromBundle.getText("fail_tile_operation_some_actions"),
                getTextFromBundle.getText("fail_tile_operation_add_to_group", [tileTitle, oGroup.title]),
                getTextFromBundle.getText("fail_tile_operation_remove_from_group", [tileTitle, oGroup.title]),
                getTextFromBundle.getText("fail_tile_operation_add_to_several_groups", [tileTitle]),
                getTextFromBundle.getText("fail_tile_operation_remove_from_several_groups", [tileTitle]),
                getTextFromBundle.getText("fail_tile_operation_some_actions")
            ],
            actionIndex;

        for (var index = 0; index < numberOfAddToGroupsFails.length; index++) {
            oErroneousActions = [];
            if (numberOfAddToGroupsFails[index] > 0){
                for (actionIndex = 0; actionIndex < numberOfAddToGroupsFails[index]; actionIndex++) {
                    oErroneousActions.push({group: oGroup, status: 0, action: actionIndex == 0 ? "addTileToNewGroup" : "add"});
                }
            }
            if (numberOfRemoveFromGroupsFails[index] > 0){
                for (actionIndex = 0; actionIndex < numberOfRemoveFromGroupsFails[index]; actionIndex++) {
                    oErroneousActions.push({group: oGroup, status: 0, action: "remove"});
                }
            }
            if (createNewGroupFail[index] > 0){
                oErroneousActions.push({group: oGroup, status: 0, action: "createNewGroup"});
            }

            var message = oController.prepareErrorMessage(oErroneousActions, tileTitle);
            assert.ok(failMessages[index] === getLocalizedText(message.messageId, message.parameters), "Expected message: " + failMessages[index] + " Message returned: " + message);
        }
        oController.destroy();
    });

    function getLocalizedText (sMsgId, aParams) {
        return aParams ? sap.ushell.resources.i18n.getText(sMsgId, aParams)  : sap.ushell.resources.i18n.getText(sMsgId);
    }
});