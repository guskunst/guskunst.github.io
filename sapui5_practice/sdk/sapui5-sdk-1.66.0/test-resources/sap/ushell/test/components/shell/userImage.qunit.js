// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.userImage.userImage
 */
(function () {
    "use strict";
    /* eslint-disable */ // TBD: make ESLint conform

    /*global asyncTest, equal, expect, module, notDeepEqual,
     notEqual, notStrictEqual, ok, raises, start, strictEqual, stop, test,
     jQuery, sap, sinon */

    jQuery.sap.require("sap.ushell.services.Container");
    jQuery.sap.require("sap.ui.core.Icon");
    jQuery.sap.require("sap.m.Image");
    jQuery.sap.require("sap.ushell.ui.launchpad.AccessibilityCustomData");
    jQuery.sap.require('sap.ushell.ui.launchpad.UserStatusItem');
    jQuery.sap.require("sap.ushell.resources");
    var EventHub = sap.ui.requireSync("sap/ushell/EventHub");
    var HeaderManager = sap.ui.requireSync("sap/ushell/components/HeaderManager");
    var AppLifeCycle = sap.ui.requireSync("sap/ushell/components/applicationIntegration/AppLifeCycle");

    var oController;
    var oRenderer;

    function createViewWithUserStatus() {
        sap.ushell.ui5service.UserStatus.prototype.init();

        var oView = sap.ui.view("meArea", {
            viewName: "sap.ushell.components.shell.MeArea.MeArea",
            type: 'JS',
            viewData: {
                config: {
                    enableUserStatus: true
                }
            }
        });
        oController = oView.getController();
        return oView;
    }

    function createViewWithUserImgConsent() {
        sap.ushell.ui5service.UserStatus.prototype.init();

        var oView = sap.ui.view("meArea", {
            viewName: "sap.ushell.components.shell.shell.userImage",
            type: 'JS',
            viewData: {
                config: {
                    enableUserImgConsent: true
                }
            }
        });
        oController = oView.getController();
        return oView;
    }

    function createViewWithRecentActivitiesDisabled() {
        var oView = sap.ui.view("meArea", {
            viewName: "sap.ushell.components.shell.MeArea.MeArea",
            type: 'JS',
            viewData: {
                config: {
                    enableRecentActivity: false
                }
            }
        });
        oController = oView.getController();
        return oView;
    }

    function createViewWithRecentActivitiesEnabled() {
        var oView = sap.ui.view("meArea", {
            viewName: "sap.ushell.components.shell.MeArea.MeArea",
            type: 'JS',
            viewData: {
                config: {
                    enableRecentActivity: true
                }
            }
        });
        oController = oView.getController();
        return oView;
    }

    function createView() {
        var oView = sap.ui.view("meArea", {
            viewName: "sap.ushell.components.shell.MeArea.MeArea",
            type: 'JS',
            viewData: {}
        });
        oController = oView.getController();
        return oView;
    }

    module("sap.ushell.components.shell.userImage", {
        setup: function () {
            var oApplicationModel = AppLifeCycle.shellElements().model();
            HeaderManager.init({}, oApplicationModel);
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        teardown: function () {
            HeaderManager.destroy();
            if (oController) {
                oController.destroy();
            }
            oRenderer.destroy();
            delete sap.ushell.Container;
            EventHub._reset();
        }
    });


    test ("load Component" , function (assert) {
        var done = assert.async();
        sap.ushell.bootstrap('local').then(function () {
            oRenderer =  sap.ushell.Container.createRenderer("fiori2");
        });

        EventHub.once("RendererLoaded").do(function () {
            jQuery.sap.require("sap.ushell.components.shell.UserImage.Component");
            var  x  = new sap.ushell.components.shell.UserImage.Component;
            ok(true);
            done();
        });
    })


    test ("feature is off" , function (assert) {
        var done = assert.async();
        window["sap-ushell-config"] = {
            renderers: {
                fiori2: {
                    componentData: {
                        config:{
                            enableUserImgConsent : false
                        }
                    }
                }
            },
            services:{
                Container: {
                    adapter: {
                        config: {
                            isImageConsent: true,
                            image : ""
                        }
                    }
                }
            }
        };
        sap.ushell.bootstrap("local").then(function () {
            oRenderer = sap.ushell.Container.createRenderer("fiori2");
        });
            
        EventHub.once("RendererLoaded").do(function () {
            jQuery.sap.require("sap.ushell.components.shell.UserImage.Component");
            var  x  = new sap.ushell.components.shell.UserImage.Component;
            var userStateChanged = sinon.stub(x , "_showUserConsentPopup");
            ok(userStateChanged.notCalled, 'switch user state is called once');
            done();
        });
        
    })


    // test ("feature is off" , function () {
    //     window["sap-ushell-config"] = {
    //         renderers: {
    //             fiori2: {
    //                 componentData: {
    //                     config:{
    //                         enableUserImgConsent : true
    //                     }
    //                 }
    //             }
    //         },
    //         services:{
    //             Container: {
    //                 adapter: {
    //                     config: {
    //                         isImageConsent: undefined,
    //                         image : ""
    //                     }
    //                 }
    //             }
    //         }
    //     };
    //
    //     sap.ushell.components.shell.UserImage.Component  = {
    //         _showUserConsentPopup : function () {
    //             return true;
    //         },
    //         createContent : function () {
    //             return new sap.ushell.components.shell.UserImage.Component;
    //         }
    //     }
    //
    //     sap.ushell.bootstrap("local");
    //     oRenderer =  sap.ushell.Container.createRenderer("fiori2");
    //     jQuery.sap.require("sap.ushell.components.shell.UserImage.Component");
    //     //sap.ushell.components.shell.UserImage.Component._showUserConsentPopup = {};
    //     //var userStateChanged = sinon.stub(sap.ushell.components.shell.UserImage.Component, "_showUserConsentPopup");
    //     var  x  = sap.ushell.components.shell.UserImage.Component;
    //
    //     sap.ushell.components.shell.UserImage.Component.createContent();
    //
    //     ok(userStateChanged.called, 'switch user state is called once');
    //
    // })



  //   test("change user state", function () {
  //       var userStateChanged = sinon.stub();
  //
  //       jQuery.sap.require("sap.ushell.ui5service.UserStatus");
  //       var oService = sap.ui.core.service.ServiceFactoryRegistry.get("sap.ushell.ui5service.UserStatus");
  //
  //
  //       sap.ui.core.service.ServiceFactoryRegistry.get = function () {
  //           return {
  //               createInstance: function () {
  //                   return {
  //                       then: userStateChanged
  //                   }
  //               }
  //           }
  //       }
  //
  //       //mock data to create view
  //       var oContainer = {
  //           getUser: function () {
  //               return {
  //                   getFullName: function () {
  //                       return true;
  //                   },
  //                   getImage: function () {
  //                       return false;
  //                   },
  //                   attachOnSetImage: function () {}
  //               };
  //           },
  //           getService: function() {
  //               return {};
  //           }
  //       };
  //       var origContainer = sap.ushell.Container;
  //       sap.ushell.Container = oContainer;
  //
  //       //create view
  //       var oMeAreaView = createViewWithUserStatus();
  //       sap.ui.getCore().byId("userStatusItem1").firePress();
  //
  //       //assert
  //       ok(userStateChanged.calledOnce, 'switch user state is called once');
  //
  //       //restore & destroy
  //       sap.ushell.Container = origContainer;
  //       oMeAreaView.destroy();
  //
  //   });
  //
  //   test("change user image consent state", function () {
  //       var userImgConsentChanged = sinon.stub();
  //
  //       jQuery.sap.require("sap.ushell.ui5service.UserStatus");
  //       var oService = sap.ui.core.service.ServiceFactoryRegistry.get("sap.ushell.ui5service.UserStatus");
  //
  //
  //       sap.ui.core.service.ServiceFactoryRegistry.get = function () {
  //           return {
  //               createInstance: function () {
  //                   return {
  //                       then: userImgConsentChanged
  //                   }
  //               }
  //           }
  //       }
  //
  //       //mock data to create view
  //       var oContainer = {
  //           getUser: function () {
  //               return {
  //                   getFullName: function () {
  //                       return true;
  //                   },
  //                   getImage: function () {
  //                       return false;
  //                   },
  //                   attachOnSetImage: function () {}
  //               };
  //           },
  //           getService: function() {
  //               return {};
  //           }
  //       };
  //       var origContainer = sap.ushell.Container;
  //       sap.ushell.Container = oContainer;
  //
  //       //create view
  //       var oMeAreaView = createViewWithUserImgConsent();
  //       sap.ui.getCore().byId("userStatusItem1").firePress();
  //
  //       //assert
  //       ok(userImgConsentChanged.calledOnce, 'switch user state is called once');
  //
  //       //restore & destroy
  //       sap.ushell.Container = origContainer;
  //       oMeAreaView.destroy();
  //
  //   });
  //
  //   test("create content: There's no user image", function () {
  //       //mock data to create view
  //       var oContainer = {
  //           getUser: function () {
  //               return {
  //                   getFullName: function () {
  //                       return true;
  //                   },
  //                   getImage: function () {
  //                       return false;
  //                   },
  //                   attachOnSetImage: function () {}
  //               };
  //           },
  //           getService: function() {
  //               return {};
  //           }
  //       };
  //       var origContainer = sap.ushell.Container;
  //       sap.ushell.Container = oContainer;
  //
  //       //spy
  //       var iconSpy = sinon.spy(sap.ui.core, "Icon");
  //
  //       //create view
  //       var oMeAreaView = createView();
  //
  //       //assert
  //       ok(iconSpy.calledOnce, "Icon created");
  //
  //       //restore & destroy
  //       oMeAreaView.destroy();
  //       iconSpy.restore();
  //
  //   });
  //
  // /*  test("create content: There is user image", function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           imageSpy,
  //           oMeAreaView;
  //
  //       sap.ushell.Container.getUser = function () {
  //           return {
  //               getFullName: function () {
  //                   return true;
  //               },
  //               getImage: function () {
  //                   return "str";
  //               }
  //           };
  //       };
  //
  //       //spy
  //      // this.createNewImage = sinon.spy();
  //       //create view
  //       oMeAreaView = createView();
  //       //assert
  //       ok(imageSpy.calledOnce, "Image created");
  //       //restore & destroy
  //       oMeAreaView.destroy();
  //       imageSpy.restore();
  //       oRenderer.destroy();
  //   });*/
  //
  //   test('test generic press handler for actions added once', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           oView = createView(),
  //           oControl1,
  //           attachPressStub;
  //
  //       ok(!oController._getControlsWithPressHandler().length, 'after controller init list of controls ' +
  //           'with press handler is empty');
  //       oControl1 = new sap.m.Button('someId');
  //       attachPressStub = sinon.stub(oControl1, 'attachPress');
  //       oController._addPressHandlerToActions(oControl1);
  //       ok(attachPressStub.calledOnce, 'attach press is called after first call to _addPressHandlerToActions');
  //       oController._addPressHandlerToActions(oControl1);
  //       ok(attachPressStub.calledOnce, 'attach press is not called after second call to _addPressHandlerToActions');
  //       ok(oController._getControlsWithPressHandler().length === 1, 'list of controls with press handlers is updated');
  //       attachPressStub.restore();
  //       oControl1.destroy();
  //       oView.destroy();
  //       oRenderer.destroy();
  //   });
  //
  //   test('test user setting button created', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           oView = createView(),
  //           oSettingView = oController.getSettingsDialogContent();
  //
  //       ok(oSettingView.getControllerName() === "sap.ushell.renderers.fiori2.user_actions.user_preferences.UserSettings", "view loaded");
  //       oView.destroy();
  //       oRenderer.destroy();
  //   });
  //   test('test save user setting ', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           oView = createView(),
  //           onSave1 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           onSave2 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           onSave3 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           oModel = new sap.ui.model.json.JSONModel({
  //               actions: [],
  //               userPreferences: {
  //                   entries: [
  //                       {title: "entry1", isDirty: true, onSave: onSave1},
  //                       {title: "entry2", isDirty: true, onSave: onSave2},
  //                       {title: "entry3", isDirty: false, onSave: onSave3}
  //                   ]
  //               },
  //               apps: {
  //                   recentActivities: []
  //               }
  //           });
  //
  //       oView.setModel(oModel);
  //       oController._saveUserPrefEntries();
  //       ok(onSave1.calledOnce, "onSave of first entry should be called once");
  //       ok(onSave2.calledOnce, "onSave of Second entry should be called once");
  //       ok(onSave3.callCount === 0, "onSave of third entry should not be called since its not dirty");
  //       oView.destroy();
  //       oRenderer.destroy();
  //   });
  //
  //   /**
  //    * Test that the onSave functions of UserProfiling entries are called when onSave of UserProfiling controller is called
  //    */
  //
  //   test('test call onSave of user profiling entries', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           oUserProfileController,
  //           oUserProfileView,
  //           onSave1 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           onSave2 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           onSave3 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           oModel = new sap.ui.model.json.JSONModel({
  //               actions: [],
  //               userPreferences: {
  //                   profiling: [
  //                       {title: "profilingEntry1", onSave: onSave1},
  //                       {title: "profilingEntry2", onSave: onSave2},
  //                       {title: "profilingEntry3", onSave: onSave3}
  //                   ]
  //               },
  //               apps: {
  //                   recentActivities: []
  //               }
  //           });
  //
  //       function createView() {
  //           var oView = sap.ui.view("UserProfileView", {
  //               viewName: "sap.ushell.components.shell.UserSettings.UserProfiling",
  //               type: 'JS',
  //               viewData: {}
  //           });
  //           oUserProfileController = oView.getController();
  //           return oView;
  //       }
  //
  //       oUserProfileView = createView();
  //       oUserProfileView.setModel(oModel);
  //
  //       oUserProfileController.onSave();
  //
  //       ok(onSave1.calledOnce === true, "onSave of first entry called once");
  //       ok(onSave2.calledOnce === true, "onSave of Second entry called once");
  //       ok(onSave3.calledOnce === true, "onSave of third entry called once");
  //
  //       oUserProfileView.destroy();
  //       oRenderer.destroy();
  //   });
  //
  //   /**
  //    * Test that the response promise of onSave function of UserProfiling reflects the results of the entries
  //    */
  //
  //   asyncTest('test onSave promise behaviour when all entries onSave promises were resolved', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           oUserProfileController,
  //           oUserProfileView,
  //           oGeneralPromise,
  //           onSave1 = function () {
  //               var oResultDeferred = jQuery.Deferred();
  //               oResultDeferred.resolve();
  //               return oResultDeferred.promise();
  //           },
  //           onSave2 = function () {
  //               var oResultDeferred = jQuery.Deferred();
  //               oResultDeferred.resolve();
  //               return oResultDeferred.promise();
  //           },
  //           onSave3 = function () {
  //               var oResultDeferred = jQuery.Deferred();
  //               oResultDeferred.resolve();
  //               return oResultDeferred.promise();
  //           },
  //           oModel = new sap.ui.model.json.JSONModel({
  //               actions: [],
  //               userPreferences: {
  //                   profiling: [
  //                       {title: "profilingEntry1", onSave: onSave1},
  //                       {title: "profilingEntry2", onSave: onSave2},
  //                       {title: "profilingEntry3", onSave: onSave3}
  //                   ]
  //               },
  //               apps: {
  //                   recentActivities: []
  //               }
  //           });
  //
  //       function createView() {
  //           var oView = sap.ui.view("UserProfileView", {
  //               viewName: "sap.ushell.components.shell.UserSettings.UserProfiling",
  //               type: 'JS',
  //               viewData: {}
  //           });
  //           oUserProfileController = oView.getController();
  //           return oView;
  //       }
  //
  //       oUserProfileView = createView();
  //       oUserProfileView.setModel(oModel);
  //
  //       oGeneralPromise = oUserProfileController.onSave();
  //
  //       oGeneralPromise.done(function () {
  //           ok(true, "promise.done function is called after all entries onSave were resolved");
  //       }).fail(function () {
  //           ok(false, "promise.fail function is WRONGLY called after all entries onSave were resolved");
  //       }).always(function () {
  //           start();
  //           oUserProfileView.destroy();
  //           oRenderer.destroy();
  //       });
  //
  //   });
  //
  //   /**
  //    * Test that the response promise of onSave function of UserProfiling reflects the results of the entries
  //    */
  //
  //   asyncTest('test onSave promise behaviour when at least one entry onSave promise was rejected', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           oUserProfileController,
  //           oUserProfileView,
  //           oGeneralPromise,
  //           onSave1 = function () {
  //               var oResultDeferred = jQuery.Deferred();
  //               oResultDeferred.resolve();
  //               return oResultDeferred.promise();
  //           },
  //           onSave2 = function () {
  //               var oResultDeferred = jQuery.Deferred();
  //               oResultDeferred.reject();
  //               return oResultDeferred.promise();
  //           },
  //           onSave3 = function () {
  //               var oResultDeferred = jQuery.Deferred();
  //               oResultDeferred.resolve();
  //               return oResultDeferred.promise();
  //           },
  //           oModel = new sap.ui.model.json.JSONModel({
  //               actions: [],
  //               userPreferences: {
  //                   profiling: [
  //                       {title: "profilingEntry1", onSave: onSave1},
  //                       {title: "profilingEntry2", onSave: onSave2},
  //                       {title: "profilingEntry3", onSave: onSave3}
  //                   ]
  //               },
  //               apps: {
  //                   recentActivities: []
  //               }
  //           });
  //
  //       function createView() {
  //           var oView = sap.ui.view("UserProfileView", {
  //               viewName: "sap.ushell.components.shell.UserSettings.UserProfiling",
  //               type: 'JS',
  //               viewData: {}
  //           });
  //           oUserProfileController = oView.getController();
  //           return oView;
  //       }
  //
  //       oUserProfileView = createView();
  //       oUserProfileView.setModel(oModel);
  //
  //       oGeneralPromise = oUserProfileController.onSave();
  //
  //       oGeneralPromise.done(function () {
  //           ok(false, "promise.done function is WRONGLY called because promise object of one inner onSave was rejected");
  //       }).fail(function () {
  //           ok(true, "promise.fail function called because promise object of one inner onSave was rejected");
  //       }).always(function () {
  //           start();
  //           oUserProfileView.destroy();
  //           oRenderer.destroy();
  //       });
  //
  //   });
  //
  //   test('test cancel user setting ', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           oView = createView(),
  //           onCancel1 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           onCancel2 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           onCancel3 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           oModel = new sap.ui.model.json.JSONModel({
  //               actions: [],
  //               userPreferences: {
  //                   entries: [
  //                       {title: "entry1", isDirty: true, onCancel: onCancel1},
  //                       {title: "entry2", isDirty: true, onCancel: onCancel2},
  //                       {title: "entry3", isDirty: false, onCancel: onCancel3}
  //                   ]
  //               },
  //               apps: {
  //                   recentActivities: []
  //               }
  //           });
  //
  //       oView.setModel(oModel);
  //       oController._dialogCancelButtonHandler();
  //       ok(onCancel1.calledOnce, "onCancel of first entry should be called once");
  //       ok(onCancel2.calledOnce, "onCancel of Second entry should be called once");
  //       ok(onCancel3.calledOnce, "onCancel of Third entry should be called once");
  //       oView.destroy();
  //       oRenderer.destroy();
  //   });
  //
  //   /**
  //    * Test the behavior of UserSettings controller (mainly function getListPressHandler)
  //    *  when the clicked UserSettings entry has no contentFunction (it is a custom setting entry with key-value data).
  //    *
  //    * The "title" and "valueArgument" are the key and the value, respectively.
  //    * The test verifies that the function _addContentToPage of UserSettingsController is indeed called
  //    *  with the value returned form valueArgument function (i.e. the string "EntryValue")
  //    */
  //   test('test UserSettings key-value entry', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //       // sinon.useFakeTimers is required because fValueFunc returns the value after 500 ms
  //           oClock = sinon.useFakeTimers(),
  //           fValueFunc = function () {
  //               var deferred = jQuery.Deferred();
  //               window.setTimeout(function () {
  //                   deferred.resolve("EntryValue");
  //               }, 500);
  //               return deferred.promise();
  //           },
  //           oView,
  //           oUserSettingsView,
  //           oUserSettingsController,
  //           oModel,
  //           oEntry = {
  //               title: "entry1",
  //               valueArgument: fValueFunc,
  //               getBindingContext: function () {
  //                   return {
  //                       getPath: function () {
  //                           return "/userPreferences/entries/0";
  //                       }
  //                   };
  //               }
  //           };
  //
  //
  //       oView = createView();
  //
  //       // The model of MeArea and UserSetting includes the entry that has no contentFunction
  //       oModel = new sap.ui.model.json.JSONModel({
  //           actions: [],
  //           userPreferences: {
  //               entries: [oEntry]
  //           },
  //           apps: {
  //               recentActivities: []
  //           }
  //       });
  //       oView.setModel(oModel);
  //
  //       oUserSettingsView = oController.getSettingsDialogContent();
  //       oUserSettingsController = oUserSettingsView.getController();
  //       oUserSettingsController.createDetailPage = sinon.spy();
  //       oUserSettingsController._getKeyValueContent = function (entry, value) {
  //           return new sap.m.Text({text: value})
  //       };
  //
  //       // The flow that is tested is clicking the custom entry.
  //       // The expected result is that oUserSettingsController._addContentToPage is called
  //       //  with the value returned form the entry's valueArgument function
  //       oUserSettingsController.getListPressHandler(oEntry);
  //
  //       oClock.tick(600);
  //
  //       ok(oUserSettingsController.createDetailPage.calledOnce, "oUserSettingsController._addContentToPage was called once");
  //       ok(oUserSettingsController.createDetailPage.args[0][3].getText() === "EntryValue", "oUserSettingsController._addContentToPage was called with the correct value");
  //
  //       oClock.restore();
  //       oUserSettingsView.destroy();
  //       oView.destroy();
  //       oRenderer.destroy();
  //   });
  //
  //   /**
  //    * Test that the onCancel functions of UserProfiling entries are called when onCancel of UserProfiling controller is called
  //    */
  //
  //   test('test call onCancel of user profiling entries', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           oUserProfileController,
  //           oUserProfileView,
  //           onCancel1 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           onCancel2 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           onCancel3 = sinon.stub().returns(jQuery.Deferred().promise()),
  //           oModel = new sap.ui.model.json.JSONModel({
  //               actions: [],
  //               userPreferences: {
  //                   profiling: [
  //                       {title: "profilingEntry1", onCancel: onCancel1},
  //                       {title: "profilingEntry2", onCancel: onCancel2},
  //                       {title: "profilingEntry3", onCancel: onCancel3}
  //                   ]
  //               },
  //               apps: {
  //                   recentActivities: []
  //               }
  //           });
  //
  //       function createView() {
  //           var oView = sap.ui.view("UserProfileView", {
  //               viewName: "sap.ushell.components.shell.UserSettings.UserProfiling",
  //               type: 'JS',
  //               viewData: {}
  //           });
  //           oUserProfileController = oView.getController();
  //           return oView;
  //       }
  //
  //       oUserProfileView = createView();
  //       oUserProfileView.setModel(oModel);
  //
  //       oUserProfileController.onCancel();
  //
  //       ok(onCancel1.calledOnce === true, "onCancel of first entry should be called once");
  //       ok(onCancel2.calledOnce === true, "onCancel of Second entry should be called once");
  //       ok(onCancel3.calledOnce === true, "onCancel of Third entry should be called once");
  //       oUserProfileView.destroy();
  //       oRenderer.destroy();
  //   });
  //
  //   test('test generic press calls viewport switch state', function () {
  //       var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //           oView = createView(),
  //           oControl1 = new sap.m.Button('someId'),
  //           switchStateStub = sinon.stub(),
  //           getCoreStub = sinon.stub(sap.ui, 'getCore').returns({
  //               byId: function () {
  //                   return {
  //                       switchState: switchStateStub
  //                   };
  //               }
  //           });
  //
  //       oController._addPressHandlerToActions(oControl1);
  //       oController._addPressHandlerToActions(oControl1);
  //       oControl1.firePress();
  //       ok(switchStateStub.calledOnce, 'switch state is called when press event is fired');
  //
  //       getCoreStub.restore();
  //       oControl1.destroy();
  //       oView.destroy();
  //       oRenderer.destroy();
  //   });
  //
  //
  //   //TODO - return this test
  //   // test('test meArea image update', function () {
  //   //     var oRenderer = sap.ushell.Container.createRenderer("fiori2"),
  //   //         oView = createView(),
  //   //         getCoreStub = sinon.stub(sap.ui, 'getCore').returns({
  //   //             byId: function () {
  //   //                 return {
  //   //                     switchState: switchStateStub
  //   //                 };
  //   //             }
  //   //         });
  //   //
  //   //     //oView._updateUserImage = sinon.stub();
  //   //     var oUser = sap.ushell.Container.getUser();
  //   //     oUser.setImage("http://testDummy.png");
  //   //     ok(oView._updateUserImage.calledOnce, 'createNewImage was supposed to be called upon image setting');
  //   //
  //   //     getCoreStub.restore();
  //   //     oView.destroy();
  //   //     oRenderer.destroy();
  //   // });
  //
  //   asyncTest("Test enable recent activities disabled", function () {
  //       var oView = createViewWithRecentActivitiesDisabled();
  //
  //       setTimeout(function () {
  //           var tabBar = sap.ui.getCore().byId("meAreaIconTabBar");
  //           ok(!tabBar, "Test successful - meAreaIconTabBar is hidden when enableRecentActivity is set to false");
  //           oView.destroy();
  //           start();
  //       }, 200);
  //   });
  //
  //   asyncTest("Test enable recent activities enabled", function () {
  //       var oView = createViewWithRecentActivitiesEnabled();
  //
  //       setTimeout(function () {
  //       	var tabBar = sap.ui.getCore().byId("meAreaIconTabBar");
  //           ok(tabBar, "Test successful - meAreaIconTabBar is displayed when enableRecentActivity is set to true");
  //           oView.destroy();
  //           start();
  //       }, 200);
  //   });
}());
