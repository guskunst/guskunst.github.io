/** 
 * @fileOverview QUnit tests for sap.ushell.renderers.fiori2.AllMyApps.
 * Testing the consumptions of groups data, external providers data and catalogs data
 * and how the model is updated in each use-case.
 *
 * Tested functions:
 */
(function () {
    "use strict";
    /*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
     notEqual, notStrictEqual, ok, raises, start, strictEqual, stop, test,
     jQuery, sap, sinon, window, hasher */

    jQuery.sap.require("sap.ushell.services.Container");
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.m.SplitApp");
    jQuery.sap.require("sap.ui.layout.Grid");
    jQuery.sap.require("sap.ushell.ui.launchpad.AccessibilityCustomData");

    var oView,
        oController,
        oShellModel = new sap.ui.model.json.JSONModel(),
        oAllMyAppsModel = new sap.ui.model.json.JSONModel(),
        aExternalProvider_0_Data = [
            { // Group 1
                title: "Group01",
                apps: [
                    {
                        title: "P0_G1_Title1",
                        subTitle: "P0_G1_SubTitle1",
                        url: "#Action-todefaultapp"
                    }, {
                        title: "P0_G1_Title2",
                        subTitle: "P0_G1_SubTitle2",
                        url: "https://www.youtube.com/"
                    }
                ]
            }, { // Group 2
                title: "Group02",
                apps: [
                    {
                        title: "P0_G2_Title1",
                        subTitle: "P0_G2_SubTitle1",
                        url: "http://www.ynet.co.il"
                    }, {
                        title: "P0_G2_Title2",
                        subTitle: "P0_G2_SubTitle2",
                        url: "#Action-todefaultapp"
                    }
                ]
            }
        ],
        aExternalProvider_1_Data = [
            { // Group 1
                title: "Group11",
                apps: [
                    {
                        title: "P1_G1_Title1",
                        subTitle: "P1_G1_SubTitle1",
                        url: "#Action-todefaultapp"
                    }, {
                        title: "P1_G1_Title2",
                        subTitle: "P1_G1_SubTitle2",
                        url: "https://www.youtube.com/"
                    }
                ]
            }, { // Group 2
                title: "Group12",
                apps: [
                    {
                        title: "P1_G2_Title1",
                        subTitle: "P1_G2_SubTitle1",
                        url: "http://www.ynet.co.il"
                    }, {
                        title: "P1_G2_Title2",
                        subTitle: "P1_G2_SubTitle2",
                        url: "#Action-todefaultapp"
                    }
                ]
            }
        ],
        oAllMyAppsGetDataProvidersResponse_1 = {
            ExternalProvider0 : {
                getTitle : function () {
                    return "ExternalProvider0";
                },
                getData : function () {
                    var oDeferred = jQuery.Deferred();
                    oDeferred.resolve(aExternalProvider_0_Data);
                    return oDeferred.promise();
                }
            }
        },
        oAllMyAppsGetDataProvidersResponse_2 = {
            ExternalProvider0 : {
                getTitle : function () {
                    return "ExternalProvider0";
                },
                getData : function () {
                    var oDeferred = jQuery.Deferred();
                    oDeferred.resolve(aExternalProvider_0_Data);
                    return oDeferred.promise();
                }
            },
            ExternalProvider1 : {
                getTitle : function () {
                    return "ExternalProvider1";
                },
                getData : function () {
                    var oDeferred = jQuery.Deferred();
                    oDeferred.resolve(aExternalProvider_1_Data);
                    return oDeferred.promise();
                }
            }
        };

    module("sap.ushell.renderers.fiori2.allMyApps.AllMyApps", {
        setup: function () {
            stop();
            sap.ushell.bootstrap("local").then(function () {
                oView = new sap.ui.view({
                    type: sap.ui.core.mvc.ViewType.JS,
                    viewName: "sap.ushell.renderers.fiori2.allMyApps.AllMyApps"
                });
                oController = oView.getController();
    
                oView.setModel(oShellModel);
                oView._addCustomData = sinon.spy();
                oAllMyAppsModel.setProperty("/AppsData", []);
                oView.setModel(oAllMyAppsModel, "allMyAppsModel");
    
                oController.getModel = function () {
                    return oController.getView().getModel();
                };
    
                oController._getShellAppTitleStateEnum = function () {
                    return {
                        SHELL_NAV_MENU_ONLY: 0,
                        ALL_MY_APPS_ONLY: 1,
                        SHELL_NAV_MENU : 2,
                        ALL_MY_APPS: 3
                    };
                };
                start();
            });
        },

        teardown: function () {
            oController.destroy();
            var oSplitApp = sap.ui.getCore().byId("sapUshellAllMyAppsMasterDetail");
            if (oSplitApp) {
                oSplitApp.destroy();
            }
          //  oController._getShellAppTitleStateEnum = oOrigAppTitleStatesEnum;
            delete sap.ushell.Container;
        }
    });

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(pattern) {
            var d = this.length - pattern.length;
            return d >= 0 && this.lastIndexOf(pattern) === d;
        };
    }

    // -------------------------------------------------------------------------------
    // ----------------------------------   TESTS   ----------------------------------
    // -------------------------------------------------------------------------------


    test("Test onAfterRendering", function (assert) {
        var done = assert.async();
        var oOriginalSplitApp = oView.oSplitApp,
            oLoadAppsDataSpy = sinon.spy(),
            oAllMyAppsManagerStub = sinon.stub(oController, "_getAllMyAppsManager").returns({
                loadAppsData : oLoadAppsDataSpy
            });

        oController.switchToInitialState = sinon.spy();
        oController._isSingleDataSource = sinon.spy();
        oView.oSplitApp.toMaster = sinon.spy();
        oView.oSplitApp.toDetail = sinon.spy();

        oController.onAfterRendering();
        window.setTimeout(function () {
            ok(oView.oSplitApp.toMaster.calledOnce, "oView.oSplitApp.toMaster called");
            ok(oView.oSplitApp.toDetail.calledOnce === true, "On desktop, oView.oSplitApp.toDetail is called");
            ok(oController.switchToInitialState.calledOnce === true, "switchToInitialState called once");
            ok(oController._isSingleDataSource.calledOnce === true, "isSingleDataSource called once");
            ok(oLoadAppsDataSpy.calledOnce === true, "AllMyAppsManager.loadAppsData called once");
    
            oView.oSplitApp = oOriginalSplitApp;
            oAllMyAppsManagerStub.restore();
            done();
        }, 1000);
    });

    test("Test onAfterRendering on phone", function (assert) {
        var done = assert.async();
        var oOriginalDeviceSystem = sap.ui.Device.system,
            oOriginalSplitApp = oView.oSplitApp,
            oLoadAppsDataSpy = sinon.spy(),
            oAllMyAppsManagerStub = sinon.stub(oController, "_getAllMyAppsManager").returns({
                loadAppsData : oLoadAppsDataSpy
            });

        sap.ui.Device.system.phone = true;
        oController.switchToInitialState = sinon.spy();
        oController._isSingleDataSource = sinon.spy();
        oView.oSplitApp.toMaster = sinon.spy();
        oView.oSplitApp.toDetail = sinon.spy();

        oController.onAfterRendering();
        window.setTimeout(function () {
            ok(oView.oSplitApp.toMaster.calledOnce === true, "oView.oSplitApp.toMaster called");
            ok(oView.oSplitApp.toDetail.notCalled === true, "On phone,oView.oSplitApp.toDetail is not called");
            ok(oController.switchToInitialState.calledOnce === true, "switchToInitialState called once");
            ok(oController._isSingleDataSource.calledOnce === true, "isSingleDataSource called once");
            ok(oLoadAppsDataSpy.calledOnce === true, "AllMyAppsManager.loadAppsData called once");
    
            oView.oSplitApp = oOriginalSplitApp;
            sap.ui.Device.system = oOriginalDeviceSystem;
            oAllMyAppsManagerStub.restore();
            sap.ui.Device.system.phone = false;
            done();
        }, 1000);

    });

    test("Test _isSingleDataSource", function () {
        var oOriginalGetService = sap.ushell.Container.getService,
            bShowGroupsApps = false,
            bShowCatalogsApps = true,
            bShowExternalProvidersApps = false,
            oGetDataProvidersResponse = oAllMyAppsGetDataProvidersResponse_1;

        sap.ushell.Container.getService = function () {
            return {
            	isHomePageAppsEnabled : function () {
                    return bShowGroupsApps;
                },
                isCatalogAppsEnabled : function () {
                    return bShowCatalogsApps;
                },
                isExternalProviderAppsEnabled : function () {
                    return bShowExternalProvidersApps;
                },
                getDataProviders : function () {
                    return oGetDataProvidersResponse;
                }
            };
        };

        ok(oController._isSingleDataSource() === false, "isSingleDataSource returns false when CatalogsApps are enabled");

        bShowGroupsApps = true;
        bShowCatalogsApps = false;
        bShowExternalProvidersApps = false;
        ok(oController._isSingleDataSource() === true, "isSingleDataSource returns true when only GroupsApps are enabled");

        bShowGroupsApps = false;
        bShowCatalogsApps = false;
        bShowExternalProvidersApps = true;
        ok(oController._isSingleDataSource() === true, "isSingleDataSource returns true when only ExternalProviders are enabled, and only singe provider exists");

        oGetDataProvidersResponse = oAllMyAppsGetDataProvidersResponse_2;
        ok(oController._isSingleDataSource() === false, "isSingleDataSource returns false when only ExternalProviders are enabled, and two providers exist");

        sap.ushell.Container.getService = oOriginalGetService;
    });

    test("Test switchToInitialState", function () {
        var oShellModel = oView.getModel(),
            oViewOriginalSplitApp = oView.oSplitApp,
            oSplitAppToMasterSpy = sinon.spy(),
            oBindItemStub = sinon.stub(oView.oDataSourceList, "bindItems").returns(),
            oIsSingleDataSourceStub = sinon.stub(oController, "_isSingleDataSource").returns(true),
            oSetTextSpy = sinon.spy(),
            oGetPopoverHeaderLabelStub = sinon.stub(oController, "_getPopoverHeaderLabel").returns({
                setText : oSetTextSpy
            }),
            oSetVisibleSpy = sinon.spy(),
            oGetPopoverBackButtonStub = sinon.stub(oController, "_getPopoverHeaderBackButton").returns({
                setVisible : oSetVisibleSpy
            });

        oView.oSplitApp = {
            toMaster : oSplitAppToMasterSpy,
            toDetail : function () {}
        };
        sap.ui.Device.system.phone = true;
        oShellModel.setProperty("/ShellAppTitleState", 1);

        oController.switchToInitialState();
        ok(oShellModel.getProperty('/allMyAppsMasterLevel') === oController.getStateEnum().FIRST_LEVEL_SPREAD, "isSingleDataSource is true, allMyAppsMasterLevel is FIRST_LEVEL_SPREAD");
        ok(oBindItemStub.calledOnce === true, "BindItem called once");
        ok(oBindItemStub.args[0][0] === "allMyAppsModel>/AppsData/0/groups", "BindItem called for binding groups level to the master list");
        ok(oSetVisibleSpy.calledOnce === true, "StateEnum is ALL_MY_APPS_ONLY - BackButton setVisible called once");
        ok(oSetVisibleSpy.args[0][0] === false, "StateEnum is ALL_MY_APPS_ONLY - BackButton setVisible called with false");

        ok(oSplitAppToMasterSpy.calledOnce === true, "The device is phone, so oSplitApp.toMaster is called");
        ok(oSplitAppToMasterSpy.args[0][0] === "sapUshellAllMyAppsMasterPage", "oSplitApp.toMaster is called for page sapUshellAllMyAppsMasterPage");
        ok(oSplitAppToMasterSpy.args[0][1] === "show", "oSplitApp.toMaster page sapUshellAllMyAppsMasterPage show");

        // Changing two parameters:
        // 1. isSingleDataSource returns false (state should not be FIRST_LEVEL_SPREAD)
        // 2. ShellAppTitle state changes to ALL_MY_APPS (from ALL_MY_APPS_ONLY)
        oIsSingleDataSourceStub.restore();
        sap.ui.Device.system.phone = false;
        oSplitAppToMasterSpy = sinon.spy();
        oIsSingleDataSourceStub = sinon.stub(oController, "_isSingleDataSource").returns(false);
        oShellModel.setProperty("/ShellAppTitleState", oController._getShellAppTitleStateEnum.ALL_MY_APPS);//oGetShellAppTitleStatesEnum.ALL_MY_APPS);
        oController.switchToInitialState();
        ok(oShellModel.getProperty('/allMyAppsMasterLevel') === oController.getStateEnum().FIRST_LEVEL, "isSingleDataSource is false, allMyAppsMasterLevel is FIRST_LEVEL");
        ok(oBindItemStub.calledTwice === true, "BindItem called once");
        ok(oBindItemStub.args[1][0] === "allMyAppsModel>/AppsData", "BindItem called for binding providers level to the master list");
        ok(oSetVisibleSpy.calledTwice === true, "StateEnum is ALL_MY_APPS - BackButton setVisible called twice");
        ok(oSetVisibleSpy.args[1][0] === true, "StateEnum is ALL_MY_APPS - BackButton setVisible called with true");
        ok(oSplitAppToMasterSpy.notCalled === true, "The device is not phone, so oSplitApp.toMaster is not called");

        oView.oSplitApp = oViewOriginalSplitApp; 
        oBindItemStub.restore();
        oIsSingleDataSourceStub.restore();
        oGetPopoverHeaderLabelStub.restore();
    });

    test("Test handleSwitchToMasterAreaOnPhone", function () {
        var oShellModel = new sap.ui.model.json.JSONModel(),
            oIsSingleDataSourceStub = sinon.stub(oController, "_isSingleDataSource").returns(true),
            oSetVisibleSpy = sinon.spy(),
            oGetPopoverBackButtonStub = sinon.stub(oController, "_getPopoverHeaderBackButton").returns({
                setVisible : oSetVisibleSpy
            }),
            oSetModelPropertyStub,
            oGetDataSourcesSelectedPathStub = sinon.stub(oController, "_getDataSourcesSelectedPath").returns("/AppsData/2/groups/0");

        oView.setModel(oShellModel);

        // Use case 1:
        // - SingleDataSource
        // - oStateEnum is ALL_MY_APPS_ONLY (meaning: ShellNavMenu is not available)
        // Expected result: back button should not be visible
        oShellModel.setProperty("/ShellAppTitleState", oController._getShellAppTitleStateEnum().ALL_MY_APPS_ONLY);
        oSetModelPropertyStub = sinon.stub(oShellModel, "setProperty").returns();

        // first call to the tested function, isSingleDataSource is true and StateEnum is ALL_MY_APPS_ONLY
        oController.handleSwitchToMasterAreaOnPhone();
        ok(oSetModelPropertyStub.calledOnce, "oShellModel.setProperty called");
        ok(oSetModelPropertyStub.args[0][0] === "/allMyAppsMasterLevel", "Model property allMyAppsMasterLevel is set");
        ok(oSetModelPropertyStub.args[0][1] === oController.getStateEnum().FIRST_LEVEL_SPREAD, "Model property allMyAppsMasterLevel is set with FIRST_LEVEL_SPREAD");
        ok(oSetVisibleSpy.calledOnce === true, "StateEnum is ALL_MY_APPS_ONLY - BackButton setVisible called once");
        ok(oSetVisibleSpy.args[0][0] === false, "StateEnum is ALL_MY_APPS_ONLY - BackButton setVisible called with false");

        // Use case 2:
        // - SingleDataSource
        // - oStateEnum is ALL_MY_APPS (meaning: ShellNavMenu is also available)
        // Expected result: back button needs to be visible
        oSetModelPropertyStub.restore();
        oShellModel.setProperty("/ShellAppTitleState", 3);
        oController.handleSwitchToMasterAreaOnPhone();
        ok(oSetVisibleSpy.calledOnce === true, "StateEnum is ALL_MY_APPS - BackButton setVisible to false was not called");

        // Use case 3: 
        // - Not SingleDataSource
        // - The previously selected master item is a 2nd level item (i.e. group)
       // oSetVisibleSpy.restore();
        oSetVisibleSpy = sinon.spy();
        oGetPopoverBackButtonStub.restore();
        oGetPopoverBackButtonStub = sinon.stub(oController, "_getPopoverHeaderBackButton").returns({
            setVisible : oSetVisibleSpy
        });
        oIsSingleDataSourceStub.restore();
        oIsSingleDataSourceStub = sinon.stub(oController, "_isSingleDataSource").returns(false);
        oSetModelPropertyStub.restore();
        oSetModelPropertyStub = sinon.stub(oShellModel, "setProperty").returns();
        oController.handleSwitchToMasterAreaOnPhone();
        ok(oSetModelPropertyStub.calledOnce, "oShellModel.setProperty called");
        ok(oSetModelPropertyStub.args[0][0] === "/allMyAppsMasterLevel", "Model property allMyAppsMasterLevel is set");
        ok(oSetModelPropertyStub.args[0][1] === oController.getStateEnum().SECOND_LEVEL, "Model property allMyAppsMasterLevel is set with SECOND_LEVEL");
        ok(oSetVisibleSpy.calledOnce === false, "Return to SECOND_LEVEL - BackButton setVisible is not called at all");

        // Use case 4: 
        // - Not SingleDataSource
        // - The previously selected master item is a 1st level item (i.e. catalog)  
      //  oSetVisibleSpy.restore();
        oSetVisibleSpy = sinon.spy();
        oGetPopoverBackButtonStub.restore();
        oGetPopoverBackButtonStub = sinon.stub(oController, "_getPopoverHeaderBackButton").returns({
            setVisible : oSetVisibleSpy
        });
        oSetModelPropertyStub.restore();
        oShellModel.setProperty("/ShellAppTitleState", 1);
        oSetModelPropertyStub = sinon.stub(oShellModel, "setProperty").returns();
        oGetDataSourcesSelectedPathStub.restore();
        oGetDataSourcesSelectedPathStub = sinon.stub(oController, "_getDataSourcesSelectedPath").returns("/AppsData/2");
        oController.handleSwitchToMasterAreaOnPhone();
        ok(oSetModelPropertyStub.args[0][0] === "/allMyAppsMasterLevel", "Model property allMyAppsMasterLevel is set");
        ok(oSetModelPropertyStub.args[0][1] === oController.getStateEnum().FIRST_LEVEL, "Model property allMyAppsMasterLevel is set with FIRST_LEVEL");
        ok(oSetVisibleSpy.calledOnce === true, "Return to FIRST_LEVEL - BackButton setVisible called once");
        ok(oSetVisibleSpy.args[0][0] === false, "Return to FIRST_LEVEL - BackButton setVisible called with false");

        oGetPopoverBackButtonStub.restore();
        oSetModelPropertyStub.restore();
        oGetDataSourcesSelectedPathStub.restore();
        oIsSingleDataSourceStub.restore();
    });

    test("Test handleMasterListItemPress", function () {
        var oShellModel = oController.getModel(),
            oAllMyAppsModel = oView.getModel('allMyAppsModel'),
            oGetPropertyReturnedProviderType = sap.ushell.Container.getService("AllMyApps").getProviderTypeEnum().HOME,
            oGetPropertyReturnedMasterState = oController.getStateEnum().FIRST_LEVEL,
            sClickedItemModelPath = "/AppsData/2",
            oGetClickedDataSourceItemPathStub = sinon.stub(oController, "_getClickedDataSourceItemPath").returns(sClickedItemModelPath),
            oGetModelPropertyStub = sinon.stub(oAllMyAppsModel, "getProperty", function (sProperty) {
                if (sProperty.endsWith("type")) {
                    return oGetPropertyReturnedProviderType;
                }
                return oGetPropertyReturnedMasterState;
            }),
            fnOrigGetPopoverObject = oController._getPopoverObject,
            fnFirePressStub = sinon.stub(),
            fnPressedStub = sinon.stub(),
            fnfocusStub = sinon.stub(),
            bVisible = true;

        oController._getPopoverObject = function () {
            return {
                getCustomHeader: function () {
                    return {
                        getContentLeft: function () {
                            return [];
                        }
                    };
                }
            };
        };
        oController.getShellAppTitleToggleListButton = function () {
            return {
                getVisible: function () {
                    return bVisible;
                },
                firePress: fnFirePressStub,
                setPressed: fnPressedStub,
                focus: fnfocusStub,
            };
        };

        oController.handleMasterListItemPress_toDetails = sinon.spy();
        oController.handleMasterListItemPress_toSecondLevel = sinon.spy();

        // Provider type HOME, Master level is FIRST_LEVEL => handleMasterListItemPress_toSecondLevel should be called
        oController.handleMasterListItemPress({
            getParameter: function() {
                return 'testListItem';
            }
        });
        ok(oController.handleMasterListItemPress_toSecondLevel.calledOnce === true, "Provider type HOME, Master level is FIRST_LEVEL => handleMasterListItemPress_toSecondLevel was called");

        // Provider type CATALOG, Master level is FIRST_LEVEL => handleMasterListItemPress_toDetails should be called
        oGetPropertyReturnedProviderType = sap.ushell.Container.getService("AllMyApps").getProviderTypeEnum().CATALOG;
        ok(fnFirePressStub.calledOnce, 'toggle button was not auto pressed despite being visible');
        bVisible = false;
        oController.handleMasterListItemPress({
            getParameter: function() {
                return 'testListItem';
            }
        });
        ok(fnFirePressStub.calledOnce, 'toggle button was  auto pressed despite being invisible');
        ok(oController.handleMasterListItemPress_toDetails.calledOnce === true, "Provider type HOME, Master level is FIRST_LEVEL => handleMasterListItemPress_toDetails was called");

        oController._getPopoverObject = fnOrigGetPopoverObject;
        oGetModelPropertyStub.restore();
        oGetClickedDataSourceItemPathStub.restore();
    });

    test("Test handleMasterListItemPress_toSecondLevel", function () {
        var oShellModel = oView.getModel(),
            oOriginalDeviceSystem = sap.ui.Device.system,
            sClickedItemModelPath = "/AppsData/2",
            oAllMyAppsModel = oView.getModel("allMyAppsModel"),
            oGetClickedDataSourceItemPathStub = sinon.stub(oController, "_getClickedDataSourceItemPath").returns(sClickedItemModelPath),
            oSetMasterLabelTextSpy = sinon.spy(),
            oGetPopoverHeaderLabelStub = sinon.stub(oController, "_getPopoverHeaderLabel").returns({
                setText : oSetMasterLabelTextSpy
            }),
            oSetDetailsLabelTextSpy = sinon.spy(),
            oGetPopoverDetailsLabelStub = sinon.stub(oController, "_getDetailsHeaderLabel").returns({
                setText : oSetDetailsLabelTextSpy
            }),
            oSetVisibleSpy = sinon.spy(),
            oGetPopoverBackButtonStub = sinon.stub(oController, "_getPopoverHeaderBackButton").returns({
                setVisible : oSetVisibleSpy
            });

        oAllMyAppsModel.setProperty(sClickedItemModelPath, {});
        oAllMyAppsModel.setProperty(sClickedItemModelPath + "/groups", []);
        oAllMyAppsModel.setProperty(sClickedItemModelPath + "/groups/0", {});
        oAllMyAppsModel.setProperty(sClickedItemModelPath + "/groups/0/title", "someTitle");
        oAllMyAppsModel.setProperty(sClickedItemModelPath + "/type", sap.ushell.Container.getService("AllMyApps").getProviderTypeEnum().HOME);

        oShellModel.setProperty("/ShellAppTitleState", oController._getShellAppTitleStateEnum().ALL_MY_APPS_ONLY);
        oShellModel.setProperty = sinon.spy();

        oController.handleSwitchToDetailsAreaOnPhone = sinon.spy();
        oView.oSplitApp.toDetail = sinon.spy();
        oView.oDataSourceList.bindItems = sinon.spy();
        oController._setBindingContext = sinon.spy();

        sap.ui.Device.system.phone = false;
        oController.handleMasterListItemPress_toSecondLevel();

        // Verify that oSplitApp.toDetail("sapUshellAllMyAppsDetailsPage") is called
        ok(oView.oSplitApp.toDetail.callCount === 1, "Not on Phone, oView.oSplitApp.toDetail is called when first level master item pressed");
        ok(oShellModel.setProperty.calledOnce === true, "oShellModel.setProperty called");

        // If the pressed item is not CATALOG, verify that the state is set to SECOND_LEVEL
        ok(oShellModel.setProperty.args[0][0] === "/allMyAppsMasterLevel", "allMyAppsMasterLevel set");
        ok(oShellModel.setProperty.args[0][1] === oController.getStateEnum().SECOND_LEVEL, "allMyAppsMasterLevel set to stateEnum.SECOND_LEVEL");

        // Verify that the list is bound to the second level (groups)
        ok(oView.oDataSourceList.bindItems.calledOnce === true, "oView.oDataSourceList.bindItems called");
        ok(oView.oDataSourceList.bindItems.args[0][0] === 'allMyAppsModel>' + sClickedItemModelPath + "/groups", "oView.oDataSourceList.bindItems called to bind th elist to the groups level");

        // In case of ALL_MY_APPS_ONLY - verify that the back button becomes visible
        ok(oSetVisibleSpy.calledOnce === true, "Setting back button visibility");
        ok(oSetVisibleSpy.args[0][0] === true, "Setting back button visibility to true");

        // Verify that the BindingContext of the details area is set to the first group of the clicked item/provider
        ok(oController._setBindingContext.calledOnce === true, "Setting details area context");
        ok(oController._setBindingContext.args[0][0] === sClickedItemModelPath + "/groups/0", "Setting details area context to the content of the first group of the clicked item/provider");

        ok(oSetMasterLabelTextSpy.calledOnce === true, "One call to SetText of master area header label");
        ok(oSetMasterLabelTextSpy.args[0][0] === sap.ushell.resources.i18n.getText("allMyApps_homeEntryTitle"), "Master area header label is set to: " + sap.ushell.resources.i18n.getText("allMyApps_homeEntryTitle"));

        ok(oSetDetailsLabelTextSpy.calledOnce === true, "One call to SetText of details area header label");
        ok(oSetDetailsLabelTextSpy.args[0][0] === "someTitle", "Details area header label was set to someTitle");

        oGetPopoverHeaderLabelStub.restore();
        oGetPopoverDetailsLabelStub.restore();
        oGetPopoverBackButtonStub.restore();
    });

    test("Test handleMasterListItemPress_toDetails", function () {
        var oAllMyAppsModel = oView.getModel("allMyAppsModel"),
            oOriginalDeviceSystem = sap.ui.Device.system,
            sClickedItemModelPath = "/AppsData/2",
            oSetDetailsLabelTextSpy = sinon.spy(),
            oGetPopoverDetailsLabelStub = sinon.stub(oController, "_getDetailsHeaderLabel").returns({
                setText : oSetDetailsLabelTextSpy
            }),
            oSetVisibleSpy = sinon.spy(),
            oGetPopoverBackButtonStub = sinon.stub(oController, "_getPopoverHeaderBackButton").returns({
                setVisible : oSetVisibleSpy
            }),
            oHandleSwitchToMasterAreaOnPhoneStub = sinon.stub(oController, "handleSwitchToMasterAreaOnPhone").returns(),
            oGetClickedDataSourceItemPathStub = sinon.stub(oController, "_getClickedDataSourceItemPath").returns(sClickedItemModelPath + "/groups/4");

        oAllMyAppsModel.setProperty(sClickedItemModelPath, {});
        oAllMyAppsModel.setProperty(sClickedItemModelPath + "/groups", []);
        oAllMyAppsModel.setProperty(sClickedItemModelPath + "/groups/4", {});
        oAllMyAppsModel.setProperty(sClickedItemModelPath + "/groups/4/title", "someTitle");

        sap.ui.Device.system.phone = true;

        oController.handleMasterListItemPress_toDetails();

        ok(oSetDetailsLabelTextSpy.calledOnce === true, "Setting text of details header");
        ok(oSetDetailsLabelTextSpy.args[0][0] === "someTitle", "Details area header label was set to someTitle");

        sap.ui.Device.system = oOriginalDeviceSystem;
        oHandleSwitchToMasterAreaOnPhoneStub.restore();
        oGetClickedDataSourceItemPathStub.restore();
        oGetPopoverDetailsLabelStub.restore();
    });
}());