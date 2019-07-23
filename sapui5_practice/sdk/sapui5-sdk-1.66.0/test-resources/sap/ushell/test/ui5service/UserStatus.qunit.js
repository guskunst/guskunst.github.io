// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.services.ShellNavigation
 */
sap.ui.require([
    "sap/ushell/test/utils",
    "sap/ushell/ui5service/_UserStatus/userstatus.class.factory",
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ui/core/service/ServiceFactory",
    "sap/ui/core/service/Service",
    "sap/ushell/ui5service/UserStatus"
], function (testUtils, fnDefineClass, ServiceFactoryRegistry, ServiceFactory, Service/*, UserStatus*/) {
    "use strict";
    /* global sinon module ok test deepEqual strictEqual */

    var A_PUBLIC_METHODS = [
        "setStatus",
        "getUxdVersion",
        "attachStatusChanged",
        "detachStatusChanged",
        "attachEnabledStatusChanged",
        "detachEnabledStatusChanged",
        "init",
        "setEnabled",
        "isA"
    ];
    var A_PRIVATE_METHODS = [
        "_addCallAllowedCheck",
        "_amendPublicServiceInstance",
        "_ensureArrayOfObjectOfStrings",
        "_ensureFunction",
        "_ensureString",
        "_setActiveComponentId",
        "_getActiveComponentId",
        "_getEventProvider",
        "_showLegalPopup",
        "_getUserSettingsPersonalizer",
        "_createUserPersonalizer",
        "_getUserStatusSetting",
        "_writeUserStatusSettingToPersonalization",
        "_getOnlineStatusPopOver"
    ];


    function createUserStatusAndMockDependencies () {
        sinon.stub(sap.ui.core.service.ServiceFactoryRegistry, "register");
        sinon.stub(sap.ui.core.service, "ServiceFactory").returns({ fake: "service factory" });
        sinon.stub(sap.ui.core.service.Service.prototype, "getContext").returns({ fake: "context" });
        sinon.stub(sap.ui.core.service.Service.prototype, "getInterface").returns({ fake: "interface" });

        var UserStatus = fnDefineClass({
            serviceRegistry: sap.ui.core.service.ServiceFactoryRegistry,
            serviceFactory: sap.ui.core.service.ServiceFactory,
            service: sap.ui.core.service.Service
        });

        sinon.stub(UserStatus.prototype, "_amendPublicServiceInstance");

        return UserStatus;
    }

    function restoreDependencies (UserStatus) {
        testUtils.restoreSpies(
            sap.ui.core.service.ServiceFactoryRegistry.register,
            sap.ui.core.service.ServiceFactory,
            sap.ui.core.service.Service.prototype.getContext,
            sap.ui.core.service.Service.prototype.getInterface,
            UserStatus.prototype._amendPublicServiceInstance
        );
    }

    module(
        "sap.ushell.ui5service.UserStatus constructor",
        {
            setup : function () {
                this.UserStatus = createUserStatusAndMockDependencies();

                this.oService = new this.UserStatus({
                    scopeObject: { fake: "component" },
                    scopeType: "component"
                });
            },
            teardown : function () {
                restoreDependencies(this.UserStatus);
            }
        }
    );

    test("Constructs the service as expected", function () {
        ok(this.oService instanceof sap.ushell.ui5service.UserStatus, "Got instance of sap.ushell.ui5service.UserStatus");
    });

    test("Methods follow conventions", function () {
        // UI5 hides all methods that start with "_" from the public interface.
        // Therefore we need to make sure this is done intentionally when
        // maintaining the code.

        var oCheckedMethods = {},
            that = this;

        A_PUBLIC_METHODS.forEach(function (sMethod) {
            strictEqual(typeof that.oService[sMethod], "function", sMethod + " public method was found in the service instance");
            ok(sMethod.charAt(0) !== "_", "Method '" + sMethod + "' does not start with '_'");
            oCheckedMethods[sMethod] = true;
        });

        A_PRIVATE_METHODS.forEach(function (sMethod) {
            strictEqual(typeof that.oService[sMethod], "function", sMethod + " private method was found in the service instance");
            strictEqual(sMethod.charAt(0), "_", "Method starts with '_'");
            oCheckedMethods[sMethod] = true;
        });

        for (var sMethod in this.oService) {
            if (typeof this.oService[sMethod] === "function" && !(sMethod in Service.prototype) && !oCheckedMethods[sMethod]) {
                ok(false, "Found new method '" + sMethod + "', please add it to A_PUBLIC_METHODS or A_PRIVATE_METHODS in this test");
            }
        }
    });

    test("Creates public interface as expected", function () {
        // during construction, the service should call its getInterface method
        // to obtain the public interface.
        strictEqual(this.oService.getInterface.getCalls().length, 1,
            "base public service was obtained via getInterface method");

        // then the public service is augmented with the init method, and
        // ServiceFactory is used to generate and register the public service
        strictEqual(sap.ui.core.service.ServiceFactory.getCalls().length, 1,
            "ServiceFatory constructor was called one time");

        var aServiceFactoryCallArgs = sap.ui.core.service.ServiceFactory.getCall(0).args;
        strictEqual(aServiceFactoryCallArgs.length, 1,
            "ServiceFactory was constructed with one argument");

        strictEqual(aServiceFactoryCallArgs[0].fake, "interface",
            "constructed with the public interface as argument");

        strictEqual(aServiceFactoryCallArgs[0].hasOwnProperty("init"), true,
            "init member was injected in public service");

        strictEqual(typeof aServiceFactoryCallArgs[0].init, "function",
            "init member is a function");
    });

    test("Public init method", function () {
        strictEqual(this.oService._amendPublicServiceInstance.getCalls().length, 0,
            "_amendPublicServiceInstance is not called when service is instantiated");

        var aServiceFactoryCallArgs = sap.ui.core.service.ServiceFactory.getCall(0).args;
        aServiceFactoryCallArgs[0].init();

        strictEqual(this.oService._amendPublicServiceInstance.getCalls().length, 1,
            "_amendPublicServiceInstance is called after init method is called on the public interface");
    });

    test("Registers public interface via ServiceFactoryRegistry as expected", function () {
        strictEqual(sap.ui.core.service.ServiceFactoryRegistry.register.getCalls().length, 1,
            "sap.ui.core.service.ServiceFactoryRegistry.register was called one time");

        deepEqual(
            sap.ui.core.service.ServiceFactoryRegistry.register.getCall(0).args,
            [
                "sap.ushell.ui5service.UserStatus",
                { fake: "service factory" }
            ],
            "sap.ui.core.service.ServiceFactoryRegistry.register was called with the expected arguments"
        );

    });

    module(
        "sap.ushell.ui5service.UserStatus pure method calls",
        {
            setup : function () {
                sinon.stub(jQuery.sap.log, "error");
                sinon.stub(jQuery.sap.log, "warning");
            },
            teardown : function () {
                testUtils.restoreSpies(
                    jQuery.sap.log.error,
                    jQuery.sap.log.warning
                );
            }
        }
    );


    [
        /*
         * This test simulates invocations of the public service interface.
         * When public service is accessed via getService, the init method is
         * injected by our UserStatus instance into the public service
         * interface. The 'this' context of the _amendPublicServiceInstance
         * method is re-bound to the UserStatus instance, whilst the first
         * argument of this method is bound to the instance of the public
         * service interface.
         */
        {
            testDescription: "context is a UI5 component (app instantiates the service)",
            oInitContext: {
                scopeType: "component",
                scopeObject: { getId: sinon.stub().returns("__fake_component_id") }
            },
            expectedActiveComponentIdSetCalled: true,
            expectedActiveComponentId: "__fake_component_id",
            expectedErrorLog: false,
            expectedCallCheckAttached: true
        },
        {
            testDescription: "context is a UI5 component (ServiceFactoryRegistry#get used to access the service)",
            oInitContext: undefined, // simulate access via ServiceFactoryRegistry#get
            expectedActiveComponentId: undefined,
            expectedErrorLog: false,
            expectedCallCheckAttached: false
        },
        {
            testDescription: "given context is not an object",
            oInitContext: 123,
            expectedActiveComponentIdSetCalled: false,
            expectedErrorLog: true,
            expectedErrorLogArgs: [
                "Invalid context for UserStatus interface",
                "The context must be empty or an object like { scopeType: ..., scopeObject: ... }",
                "sap.ushell.ui5service.UserStatus"
            ],
            expectedCallCheckAttached: true
        },
        {
            testDescription: "given context is not an object",
            oInitContext: 123,
            expectedActiveComponentIdSetCalled: false,
            expectedErrorLog: true,
            expectedErrorLogArgs: [
                "Invalid context for UserStatus interface",
                "The context must be empty or an object like { scopeType: ..., scopeObject: ... }",
                "sap.ushell.ui5service.UserStatus"
            ],
            expectedCallCheckAttached: true
        }
    ].forEach(function (oFixture) {
        test("_amendPublicServiceInstance: works as expected when " + oFixture.testDescription, function () {
            var oFakeService = {
                _addCallAllowedCheck: sinon.stub(),
                _setActiveComponentId: sinon.stub()
            };

            var oFakePublicService = {
                getContext: function () {
                    return oFixture.oInitContext;
                }
            };

            sap.ushell.ui5service.UserStatus.prototype._amendPublicServiceInstance.call(oFakeService, oFakePublicService);

            if (oFixture.expectedCallCheckAttached) {
                var aAuthorizableMethods = ["setStatus", "attachStatusChanged", "detachStatusChanged"];
                strictEqual(oFakeService._addCallAllowedCheck.getCalls().length, aAuthorizableMethods.length, "_addCallAllowedCheck was called the expected number of times");

                var iCallCount = 0;
                aAuthorizableMethods.forEach(function (sMethod) {
                    deepEqual(oFakeService._addCallAllowedCheck.getCall(iCallCount).args, [oFakePublicService, sMethod],
                        "_addCallAllowedCheck was called with the expected arguments for " + sMethod);
                    iCallCount++;
                });
            } else {
                strictEqual(oFakeService._addCallAllowedCheck.getCalls().length, 0, "_addCallAllowedCheck was called the expected number of times");
            }


            if (oFixture.expectedActiveComponentIdSetCalled) {
                strictEqual(oFakeService._setActiveComponentId.getCalls().length, 1,
                    "_setActiveComponentId was called once");
                deepEqual(oFakeService._setActiveComponentId.getCall(0).args,
                    ["__fake_component_id"], "_setActiveComponentId was called with the expected component id");
            } else {
                strictEqual(oFakeService._setActiveComponentId.getCalls().length, 0,
                    "_setActiveComponentId was not called");
            }

            if (oFixture.expectedErrorLog) {
                strictEqual(jQuery.sap.log.error.getCalls().length, 1, "jQuery.sap.log.error was called once");
                deepEqual(jQuery.sap.log.error.getCall(0).args, oFixture.expectedErrorLogArgs,
                    "jQuery.sap.log.error was called with the expected arguments");
            } else {
                strictEqual(jQuery.sap.log.error.getCalls().length, 0, "jQuery.sap.log.error was called 0 times");
            }
        });
    });


    [
        { method: "attachStatusChanged", event: "statusChanged" }
    ].forEach(function (oFixture) {
        var sAttachMethod = oFixture.method;

        test("_attach method '" + sAttachMethod + "' attaches on event provider", function () {
            var oAttachEventStub = sinon.stub(),
                oFakeService = {
                    _getEventProvider: sinon.stub().returns({
                        attachEvent: oAttachEventStub
                    })
                };

            sap.ushell.ui5service.UserStatus.prototype[sAttachMethod].call(oFakeService, "function_arg");

            strictEqual(oAttachEventStub.getCalls().length, 1, "attachEvent was called once");
            deepEqual(oAttachEventStub.getCall(0).args, [oFixture.event, "function_arg"],
                "attachEvent method called with the expected arguments");
        });
    });

    [
        { method: "detachStatusChanged", event: "statusChanged" }
    ].forEach(function (oFixture) {
        var sDetachMethod = oFixture.method;

        test("_detach method '" + sDetachMethod + "' detaches on event provider", function () {
            var oDetachEventStub = sinon.stub(),
                oFakeService = {
                    _getEventProvider: sinon.stub().returns({
                        detachEvent: oDetachEventStub
                    })
                };

            sap.ushell.ui5service.UserStatus.prototype[sDetachMethod].call(oFakeService, "function_arg");

            strictEqual(oDetachEventStub.getCalls().length, 1, "detachEvent was called once");
            deepEqual(oDetachEventStub.getCall(0).args, [oFixture.event, "function_arg"],
                "detachEvent method called with the expected arguments");
        });
    });

    [
        {
            testDescription: "call is authorized, validation succeeds",
            sPublicMethod: "setStatus",
            vMethodArg: "AWAY",
            bAuthorized: true,
            bValidationResult: true,
            oUserStatusSetting:  {"userStatusEnabled": true, "userStatusDefault": "BUSY" },
            expectedEventFired: true,
            expectedFireEventName: "statusChanged",
            expectedFireEventData: "AWAY",
            expectedValidationMethodCalled: null
        }
    ].forEach(function (oFixture) {
        test(oFixture.sPublicMethod + ": works as expected when " + oFixture.testDescription, function () {
            var UserStatus = createUserStatusAndMockDependencies();

            sinon.stub(UserStatus.prototype, "_ensureFunction").returns(oFixture.bValidationResult);
            sinon.stub(UserStatus.prototype, "_ensureString").returns(oFixture.bValidationResult);
            sinon.stub(UserStatus.prototype, "_ensureArrayOfObjectOfStrings").returns(oFixture.bValidationResult);
          //  sinon.stub(UserStatus.prototype, "setStatus");
            var userStatusSettingStub = sinon.stub(UserStatus.prototype, "_getUserStatusSetting");
            userStatusSettingStub.returns({
                then : function (fCallback) {
                    fCallback(oFixture.oUserStatusSetting);
                }
            });
            var oService = new UserStatus({
                scopeObject: { fake: "component" },
                scopeType: "component"
            });

            UserStatus.prototype.setEnabled(true);

            strictEqual(userStatusSettingStub.getCalls().length, 2, "sap.ushell.ui5service.UserStatus.prototype._getUserStatusSetting was called 2 time");

            var oEventProvider = oService._getEventProvider();
            sinon.stub(oEventProvider, "fireEvent");

            var sPublicServiceScopeId;
            if (!oFixture.bAuthorized) {
                sPublicServiceScopeId = "something different than undefined";
            }

            var oFakePublicServiceScopeObject = {
                getId: sinon.stub().returns( // note: active id is "undefined"
                    sPublicServiceScopeId
                )
            };

            var oFakePublicService = {
                getContext: sinon.stub().returns({
                    scopeObject: oFakePublicServiceScopeObject
                })
            };

            // add authorization check code
            oService._addCallAllowedCheck(oFakePublicService, oFixture.sPublicMethod);
            oService._addCallAllowedCheck(oFakePublicService, "_getUserStatusSetting");
            oFakePublicService[oFixture.sPublicMethod].call(oFakePublicService, oFixture.vMethodArg);

            if (oFixture.expectedEventFired) {
                strictEqual(oEventProvider.fireEvent.getCalls().length, 1, "EventProvider.fireEvent was called 1 time");

                var aCallArgs = oEventProvider.fireEvent.getCall(0).args;
                strictEqual(aCallArgs[0], oFixture.expectedFireEventName,
                    "EventProvider.fireEvent was called with the correct first argument");

                deepEqual(aCallArgs[1], {
                    data: oFixture.expectedFireEventData
                }, "EventProvider.fireEvent was called with the expected second argument");


            } else {
                strictEqual(oEventProvider.fireEvent.getCalls().length, 0, "EventProvider.fireEvent was called 0 times");
            }

            if (oFixture.expectedValidationMethodCalled) {
                strictEqual(UserStatus.prototype[oFixture.expectedValidationMethodCalled].getCalls().length, 1,
                    oFixture.expectedValidationMethodCalled + " validation method was called");
            } else {
                strictEqual(UserStatus.prototype._ensureArrayOfObjectOfStrings.getCalls().length, 0,
                    "_ensureArrayOfObjectOfStrings validation method was not called");
                strictEqual(UserStatus.prototype._ensureString.getCalls().length, 0,
                    "_ensureString validation method was not called");
            }

            restoreDependencies(UserStatus);
            sinon.restore(oEventProvider.fireEvent);
            sinon.restore(UserStatus.prototype._ensureString);
            sinon.restore(UserStatus.prototype._ensureArrayOfObjectOfStrings);
            sinon.restore(UserStatus.prototype._ensureFunction);
            sinon.restore(UserStatus.prototype._getUserStatusSetting);
        });
    });


    [
        { sUi5Version: "1.37.0-SNAPSHOT" , expectedVersion: 2 },
        { sUi5Version: "2.0.0-SNAPSHOT"  , expectedVersion: 2 },
        { sUi5Version: "1"               , expectedVersion: 1 },
        { sUi5Version: "2"               , expectedVersion: 2 },
        { sUi5Version: "1.37"            , expectedVersion: 2 },
        { sUi5Version: "1.36.3"          , expectedVersion: 1 },
        { sUi5Version: "8.0.0-SNAPSHOT"  , expectedVersion: 2 }
    ].forEach(function (oFixture) {
        test("getUxdVersion: returns expected number when UI5 version is " + oFixture.sUi5Version, function () {
            var sOriginalVersion = sap.ui.version;
            sap.ui.version = oFixture.sUi5Version;

            var iVersion = sap.ushell.ui5service.UserStatus.prototype.getUxdVersion();

            strictEqual(iVersion, oFixture.expectedVersion, "returned expected version");

            sap.ui.version = sOriginalVersion;
        });

    });

    [
        {
            testDescription: "a string is given",
            vValue: "something",
            sValueType: "string",
            expectedString: true
        }, {
        testDescription: "a number is given",
        vValue: 123,
        sValueType: "number",
        expectedString: false
    }, {
        testDescription: "an object is given",
        vValue: { some: "thing" },
        sValueType: "object",
        expectedString: false
    }, {
        testDescription: "a function is given",
        vValue: function () { return false; },
        sValueType: "function",
        expectedString: false
    }, {
        testDescription: "a boolean is given",
        vValue: true,
        sValueType: "boolean",
        expectedString: false
    }, {
        testDescription: "an array of one string is given",
        vValue: ["a_string"],
        sValueType: "object",
        expectedString: false
    }
    ].forEach(function (oFixture) {
        test("_ensureString: returns the expected result when " + oFixture.testDescription, function () {
            var bResult = sap.ushell.ui5service.UserStatus.prototype._ensureString(oFixture.vValue, "method name");

            strictEqual(bResult, oFixture.expectedString, "returned expected result");
            if (!bResult) {
                strictEqual(jQuery.sap.log.error.getCalls().length, 1, "jQuery.sap.log.error was called 1 time");
                deepEqual(
                    jQuery.sap.log.error.getCall(0).args, [
                        "'method name' was called with invalid arguments",
                        "the parameter should be a string, got '" + oFixture.sValueType + "' instead",
                        "sap.ushell.ui5service.UserStatus"
                    ],
                    "jQuery.sap.log.error was called with the expected arguments"
                );
            }

        });
    });

    [
        {
            testDescription: "a string is given",
            vValue: "something",
            sValueType: "string",
            expectedFunction: false
        }, {
        testDescription: "a number is given",
        vValue: 123,
        sValueType: "number",
        expectedFunction: false
    }, {
        testDescription: "an object is given",
        vValue: { some: "thing" },
        sValueType: "object",
        expectedFunction: false
    }, {
        testDescription: "a function is given",
        vValue: function () { return false; },
        sValueType: "function",
        expectedFunction: true
    }, {
        testDescription: "a boolean is given",
        vValue: true,
        sValueType: "boolean",
        expectedFunction: false
    }, {
        testDescription: "an array of one string is given",
        vValue: ["a_string"],
        sValueType: "object",
        expectedFunction: false
    }
    ].forEach(function (oFixture) {
        test("_ensureFunction: returns the expected result when " + oFixture.testDescription, function () {
            var bResult = sap.ushell.ui5service.UserStatus.prototype._ensureFunction(oFixture.vValue, "method name");

            strictEqual(bResult, oFixture.expectedFunction, "returned expected result");
            if (!bResult) {
                strictEqual(jQuery.sap.log.error.getCalls().length, 1, "jQuery.sap.log.error was called 1 time");
                deepEqual(
                    jQuery.sap.log.error.getCall(0).args, [
                        "'method name' was called with invalid arguments",
                        "the parameter should be a function, got '" + oFixture.sValueType + "' instead",
                        "sap.ushell.ui5service.UserStatus"
                    ],
                    "jQuery.sap.log.error was called with the expected arguments"
                );
            }

        });
    });

    [
        {
            testDescription: "a string is given",
            vArg: "something",
            expectedResult: false
        }, {
        testDescription: "a number is given",
        vArg: 123,
        expectedResult: false
    }, {
        testDescription: "an object of strings is given",
        vArg: { some: "thing" },
        expectedResult: false
    }, {
        testDescription: "a function is given",
        vArg: function () { return false; },
        expectedResult: false
    }, {
        testDescription: "a boolean is given",
        vArg: true,
        expectedResult: false
    }, {
        testDescription: "an array of non-objects is given",
        vArg: [ 1, 2, "3"],
        expectedResult: false
    }, {
        testDescription: "an array of empty objects is given",
        vArg: [ {}, {}, {} ],
        expectedResult: false
    }, {
        testDescription: "an array with some empty objects is given",
        vArg: [ {k: "1"}, {}, { k: "2"} ],
        expectedResult: false
    }, {
        testDescription: "an array with an object having a non string value is given",
        vArg: [ {k: "1"}, { v: null }, { k: "2"} ],
        expectedResult: false
    }, {
        testDescription: "an array with an object having both a non-string and a string value is given",
        vArg: [ {k: "1"}, { k1: "v1", k2: 2 }, { k: "2"} ],
        expectedResult: false
    }, {
        testDescription: "an array with an object having both all string values is given",
        vArg: [ {k: "1"}, { k1: "v1", k2: "v2" }, { k: "2"} ],
        expectedResult: true
    }
    ].forEach(function (oFixture) {
        test("_ensureArrayOfObjectOfStrings: works as expected when " + oFixture.testDescription, function () {
            var bResult = sap.ushell.ui5service.UserStatus.prototype._ensureArrayOfObjectOfStrings(
                oFixture.vArg, "some method"
            );

            strictEqual(bResult, oFixture.expectedResult, "Obtained the expected result");
            if (bResult) {
                strictEqual(jQuery.sap.log.error.getCalls().length, 0, "0 calls made to jQuery.sap.log.error");
            } else {
                strictEqual(jQuery.sap.log.error.getCalls().length, 1, "1 call made to jQuery.sap.log.error");
                deepEqual(
                    jQuery.sap.log.error.getCall(0).args, [
                        "'some method' was called with invalid parameters",
                        "An array of non-empty objects with string values is expected",
                        "sap.ushell.ui5service.UserStatus"
                    ], "jQuery.sap.log.error was called with the expected arguments"
                );
            }
        });
    });

});
