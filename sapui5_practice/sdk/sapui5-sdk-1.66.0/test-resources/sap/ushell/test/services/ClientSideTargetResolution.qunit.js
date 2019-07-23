// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.services.ClientSideTargetResolution
 */

sap.ui.require([
    "sap/ushell/services/ClientSideTargetResolution",
    "sap/ushell/services/_ClientSideTargetResolution/InboundIndex",
    "sap/ushell/services/_ClientSideTargetResolution/InboundProvider",
    "sap/ushell/services/_ClientSideTargetResolution/VirtualInbounds",
    "sap/ushell/services/_ClientSideTargetResolution/Search",
    "sap/ushell/services/_ClientSideTargetResolution/Utils",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/test/utils",
    "sap/ushell/utils",
    "sap/ushell/services/_ClientSideTargetResolution/Formatter",
    "sap/ushell/services/URLParsing",
    "sap/ui/thirdparty/URI",
    "sap/ushell/TechnicalParameters"
], function (
    ClientSideTargetResolution,
    oInboundIndex,
    InboundProvider,
    VirtualInbounds,
    oSearch,
    oCSTRUtils,
    oAppConfiguration,
    testUtils,
    utils,
    oFormatter,
    URLParsing,
    URI,
    TechnicalParameters
) {

    "use strict";
    /* global QUnit, module, test, ok, equal, deepEqual, strictEqual, sinon, Promise,
       asyncTest, start */

    var mkInb = function (sInbound, oResolutionResult /* optional */, oExtraProperties /* optional */) {
        var oInbound = oFormatter.parseInbound(sInbound);

        oInbound.resolutionResult = jQuery.extend(true, {
            url: ""
        }, oResolutionResult || {});

        jQuery.extend(true, oInbound, oExtraProperties || {});

        return oInbound;
    };

    var oURLParsing = new URLParsing();
    var mkInt = function (sIntent) {
        return oURLParsing.parseShellHash(sIntent);
    };

    jQuery.sap.require("sap.ushell.services.Container");

    /*eslint max-nested-callbacks: [1, 4]*/

    var O_CDM3_TEMPLATE_NOTIONS = {
        "_baseUrl": "{join() &_destProtocol,'://',&_destHost,':',&_destPort,&_destPrefix}",
        "_destName": "{or sap-system,./sap.app/destination}",
        "_destProtocolHttps": "{and /systemAliases/{&_destName}/https,'https'}",
        "_destProtocolHttp": "{and /systemAliases/{&_destName}/http,'http'}",
        "_destProtocol": "{or &_destProtocolHttps,&_destProtocolHttp}",
        "_destHost": "{/systemAliases/{&_destName}/{&_destProtocol}/host}",
        "_destPort": "{or /systemAliases/{&_destName}/{&_destProtocol}/port,''}",
        "_destHasNoAppRuntime": "{not &appRuntime}",
        "_destDefaultToAbapPrefix": "{or &_destHasNoAppRuntime,&isAppRuntimeAbap}",
        "_destDefaultPrefix": "{and &_destDefaultToAbapPrefix,'/sap/bc'}",
        "_destPrefix": "{if({/systemAliases/{&_destName}/{&_destProtocol}/pathPrefix}) /systemAliases/{&_destName}/{&_destProtocol}/pathPrefix,&_destDefaultPrefix}",
        "_destIsLoadBalancing": "{and /systemAliases/{&_destName}/rfc/systemId}",
        "_destIsNotLoadBalancing": "{not &_destIsLoadBalancing}",
        "_destHostIsConnectString": "{match(^[/][HGMR][/].*) /systemAliases/{&_destName}/rfc/host}",
        "_startupParameters": "{*|match(^(?!sap-(system\\|(ushell-navmode))$))}"
    };

    var O_CDM3_SAMPLE_SITE = {
        "systemAliases": {
            "fiori_blue_box": {
                "https": {
                    "id": "fiori_blue_box_HTTPS",
                    "host": "tenant-fin-dyn-dest-approuter.cfapps.sap.hana.ondemand.com",
                    "pathPrefix": ""
                },
                "id": "fiori_blue_box",
                "client": "000",
                "language": "IT"
            },
            "legacy_blue_box": {
                "https": {
                    "id": "legacy_blue_box_HTTPS",
                    "host": "tenant-fin-dyn-dest-approuter.cfapps.sap.hana.ondemand.com",
                    "pathPrefix": ""
                },
                "rfc": {
                    "id": "legacy_blue_box",
                    "systemId": "",
                    "host": "example.corp.com",
                    "service": "3255",
                    "loginGroup": "",
                    "sncNameR3": "p/secude:CN=EXAMPLE, O=SAP-AG, C=DE",
                    "sncQoPR3": "8"
                },
                "id": "legacy_blue_box",
                "client": "120",
                "language": "DE"
            }
        }
    };

    // the virtual inbounds defined in client side target resolution
    var A_VIRTUAL_INBOUNDS = [
       {
           "action": "search",
           "deviceTypes": {
               "desktop": true,
               "phone": true,
               "tablet": true
           },
           "hideIntentLink": true,
           "resolutionResult": {
               "additionalInformation": "SAPUI5.Component=sap.ushell.renderers.fiori2.search.container",
               "applicationType": "SAPUI5",
               "loadCoreExt": true,
               "loadDefaultDependencies": false,
               "ui5ComponentName": "sap.ushell.renderers.fiori2.search.container",
               "url": "../../../../../resources/sap/ushell/renderers/fiori2/search/container"
           },
           "semanticObject": "Action",
           "signature": {
               "additionalParameters": "notallowed",
               "parameters": {}
           }
       }
    ];

    // lookup of all count parameters
    var O_COUNT_PARAMETERS = {
            "countDefaultedParams": true,
            "countFreeInboundParams": true,
            "countMatchingFilterParams": true,
            "countMatchingParams": true,
            "countMatchingRequiredParams": true,
            "countPotentiallyMatchingParams": true
        },
        I_DEBUG = jQuery.sap.log.Level.DEBUG,
        I_TRACE = jQuery.sap.log.Level.TRACE,
        O_LOCAL_SYSTEM_ALIAS = { // local system alias (hardcoded in the adapter for now)
           "http": {
               "id": "",
               "host": "",
               "port": 0,
               "pathPrefix": "/sap/bc/"
           },
           "https": {
               "id": "",
               "host": "",
               "port": 0,
               "pathPrefix": "/sap/bc/"
           },
           "rfc": {
               "id": "",
               "systemId": "",
               "host": "",
               "service": 0,
               "loginGroup": "",
               "sncNameR3": "",
               "sncQoPR3": ""
           },
           "id": "",
           "client": "",
           "language": ""
        };
        var O_KNOWN_SYSTEM_ALIASES = {
            "ZWCF": {
                "id": "ZWCF",
                "client": "013",
                "language": "EN",
                "https": {
                   "id": "ZWCF_HTTPS",
                   "host": "example.corp.com",
                   "port": 44300,
                   "pathPrefix": ""
                },
                "rfc": {
                   "id": "ZWCF_RFC",
                   "host": "1.1.1.1",
                   "service": 3255,
                   "pathPrefix": ""
                }
            },
            "UR3CLNT120": {
                "http": {
                    "id": "UR3CLNT120_HTTP",
                    "host": "example.corp.com",
                    "port": "50055", // note: string is also valid for the port
                    "pathPrefix": ""
                },
                "https": {
                    "id": "UR3CLNT120_HTTPS",
                    "host": "example.corp.com",
                    "port": 44355,
                    "pathPrefix": ""
                },
                "rfc": {
                    "id": "UR3CLNT120",
                    "systemId": "",
                    "host": "example.corp.com",
                    "service": 3255,
                    "loginGroup": "",
                    "sncNameR3": "p/secude:CN=UR3, O=SAP-AG, C=DE",
                    "sncQoPR3": "8"
                },
                "id": "UR3CLNT120",
                "client": "120",
                "language": ""
            },
            "SYSCONNSTRING": {
                "http": {
                    "id": "UR3CLNT120_HTTP",
                    "host": "example.corp.com",
                    "port": "50055", // note: string is also valid for the port
                    "pathPrefix": ""
                },
                "https": {
                    "id": "UR3CLNT120_HTTPS",
                    "host": "example.corp.com",
                    "port": 44355,
                    "pathPrefix": ""
                },
                "rfc": {
                    "id": "UR3CLNT120",
                    "systemId": "",
                    "host": "/H/Coffee/S/Decaf/G/Roast",
                    "service": 3255,
                    "loginGroup": "",
                    "sncNameR3": "p/secude:CN=UR3, O=SAP-AG, C=DE",
                    "sncQoPR3": "8"
                },
                "id": "UR3CLNT120",
                "client": "120",
                "language": ""
            },
            "ALIASRFC": {
                "http": {
                    "id": "ALIASRFC_HTTP",
                    "host": "example.corp.com",
                    "port": 50055,
                    "pathPrefix": "/aliaspath//"
                },
                "https": {
                    "id": "ALIASRFC_HTTPS",
                    "host": "example.corp.com",
                    "port": 1111,
                    "pathPrefix": "/path/"
                },
                "rfc": {
                    "id": "ALIASRFC",
                    "systemId": "UV2",
                    "host": "ldcsuv2",
                    "service": 32,
                    "loginGroup": "SPACE",
                    "sncNameR3": "p/secude:CN=UXR, O=SAP-AG, C=DE",
                    "sncQoPR3": "9"
                },
                "id": "ALIASRFC",
                "client": "220",
                "language": ""
            },
            "ALIAS111": {
                "http": {
                    "id": "ALIAS111",
                    "host": "vmw.example.corp.com",
                    "port": 44335,
                    "pathPrefix": "/go-to/the/moon"
                },
                "https": {
                    "id": "ALIAS111_HTTPS",
                    "host": "vmw.example.corp.com",
                    "port": 44335,
                    "pathPrefix": "/go-to/the/moon"
                },
                "rfc": {
                    "id": "",
                    "systemId": "",
                    "host": "",
                    "service": 32,
                    "loginGroup": "",
                    "sncNameR3": "",
                    "sncQoPR3": ""
                },
                "id": "ALIAS111",
                "client": "111",
                "language": ""
            },
            "EMPTY_PORT_PREFIX_RFC": {
                // typical system alias defined in HCP
                "id": "ABAP_BACKEND_FOR_DEMO",
                "language": "",
                "client": "",
                "https": {
                    "id": "ABAP_BACKEND_FOR_DEMO",
                    "host": "system.our.domain.corp",
                    "port": 0, // note: null port
                    "pathPrefix": "" // note: empty path prefix
                },
                "rfc": {} // note: empty RFC
            },
            "MULTIPLE_INVALID_FIELDS": {
                "http": {
                    "id": "SYS",
                    "host": 123, // note: should be a string
                    "port": "", // note: this is ok: string or number
                    "pathPrefix": "/go-to/the/moon" // this is correct
                },
                "https": {
                    "id": "SYS",
                    // "host": "vmw.example.corp.com",  // no host provided
                    "port": [44335], // no string or number
                    "pathPrefix": 456 // note: should be a string
                },
                "rfc": {
                    "id": "",
                    "systemId": "",
                    "host": "",
                    "service": 32,
                    "loginGroup": "",
                    "sncNameR3": "",
                    "sncQoPR3": ""
                },
                "id": "SYS",
                "client": "120",
                "language": ""
            },
            "ONLY_RFC": {
                "rfc": {
                    "id": "SYS",
                    "systemId": "SYS",
                    "host": "ldcisys",
                    "service": 32,
                    "loginGroup": "SPACE",
                    "sncNameR3": "",
                    "sncQoPR3": ""
                },
                "id": "SYS",
                "client": "120",
                "language": ""
            }
       };

    /*
     * Checks whether the expected warnings and errors were logged on the
     * console, taking the expectations from the given test fixture, which
     * should be defined as follows:
     *
     * {
     *
     *   ... rest of the fixture...
     *
     *   expectedWarningCalls: [
     *      [   // arguments of the first call
     *          "1stArg",
     *          "2ndArg",
     *          "3rdArg"
     *      ],
     *      ... more items if more calls are expected
     *   ],
     *   expectedErrorCalls: []  // 0 calls to jQuery.sap.log.error expected
     * }
     *
     * NOTE:
     * - If the given fixture does not specify the 'expectedWarningCalls' and
     *   'expectedErrorCalls' keys, no test will be executed.
     * - jQuery.sap.log.error and jQuery.sap.log.warning should have been
     *   already stubbed before this function is called.
     */
    function testExpectedErrorAndWarningCalls (oFixture) {

        if (oFixture.hasOwnProperty("expectedErrorCalls")) {
            var aExpectedErrorCalls = (oFixture.expectedErrorCalls || []);

            strictEqual(
                jQuery.sap.log.error.callCount,
                aExpectedErrorCalls.length,
                "jQuery.sap.log.error was called the expected number of times"
            );

            if (aExpectedErrorCalls.length > 0) {
                deepEqual(
                    jQuery.sap.log.error.args,
                    aExpectedErrorCalls,
                    "jQuery.sap.log.error logged the expected errors"
                );
            }
        }

        if (oFixture.hasOwnProperty("expectedWarningCalls")) {
            var aExpectedWarningCalls = (oFixture.expectedWarningCalls || []);

            strictEqual(
                jQuery.sap.log.warning.callCount,
                aExpectedWarningCalls.length,
                "jQuery.sap.log.warning was called the expected number of times"
            );

            if (aExpectedWarningCalls.length > 0) {
                deepEqual(
                    jQuery.sap.log.warning.args,
                    aExpectedWarningCalls,
                    "jQuery.sap.log.warning logged the expected warnings"
                );
            }
        }
    }

    /*
     * Removes the count* parameters from each match result (output of
     * getMatchingInbounds) and the priority string.
     *
     * Returns the filtered result (that may contain shallow copies of
     * objects/arrays).
     */
    function removeCountsAndSortString (vMatchResults) {
        var bIsObject = jQuery.isPlainObject(vMatchResults);
        var aMatchResults = bIsObject ? [vMatchResults] : vMatchResults,
            aMutatedMatchResults = aMatchResults.map(function (oMatchResult) {

            return JSON.parse(JSON.stringify(oMatchResult, function (sKey, vVal) {

                return O_COUNT_PARAMETERS.hasOwnProperty(sKey) || sKey === "priorityString" ? undefined : vVal;
            }));
        });

        return bIsObject ? aMutatedMatchResults[0] : aMutatedMatchResults;
    }

    /*
     * A factory to create a test ClientSideTargetResolution service with
     * inbounds and configuration as needed.
     *
     * Can be called like:
     * createService();  // no inbounds, mocked adapter, undefined configuration
     * createService({
     *   inbounds: [ ... ] // arbitrary inbounds
     * });
     * createService({
     *   adapter: { ... } // arbitrary fake adapter
     * });
     * createService({
     *   configuration: { ... } // arbitrary service configuration
     * });
     */
    function createService (oArgs) {
        var oConfiguration = (oArgs || {}).configuration;
        var aInbounds = (oArgs || {}).inbounds || [];
        var oAdapter = (oArgs || {}).adapter;

        if (!oAdapter) {
            // create fake adapter
            oAdapter = {
                getInbounds: sinon.stub().returns(
                    new jQuery.Deferred().resolve(aInbounds).promise()
                )
            };
        }

        var oUshellConfig = testUtils.overrideObject({}, {
            "/services/ClientSideTargetResolution": oConfiguration
        });

        testUtils.resetConfigChannel(oUshellConfig);

        return new ClientSideTargetResolution(
            oAdapter,
            null,
            null,
            oConfiguration
        );
    }

    /*
     * Tests that _getMatchingInbounds was called with the expected
     * bExcludeTileInbounds argument if called at all.
     */
    function testExcludeTileIntentArgument (oCstrService, bExpectedExcludeTileInbounds) {
        var iCalledTimes = oCstrService._getMatchingInbounds.callCount;

        if (iCalledTimes > 0) {
            // getLinks may return preventively in some cases... but if
            // it's called we need to check these:

            strictEqual(iCalledTimes, 1, "_getMatchingInbounds was called 1 time");
            strictEqual(oCstrService._getMatchingInbounds.getCall(0).args.length, 3, "_getMatchingInbounds was called with three arguments");
            deepEqual(
                oCstrService._getMatchingInbounds.getCall(0).args[2],
                { bExcludeTileInbounds: bExpectedExcludeTileInbounds },
                "_getMatchingInbounds was called with a 'true' third argument (bExcludeTileInbounds)"
            );
        }
    }

    /*
     * generate a string of around iCnt characters
     */
    function genStr (sStr, iCnt) {
        var s = sStr;
        while (s.length < iCnt) {
            s = s + sStr;
        }
        return s;
    }

    module("sap.ushell.services.ClientSideTargetResolution", {
        setup: function () {
            return sap.ushell.bootstrap("local").then(function () {

                // assume there is no open application in tests
                oAppConfiguration.setCurrentApplication(null);
            });
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        teardown: function () {
            testUtils.restoreSpies(
                oCSTRUtils.isDebugEnabled,
                oSearch.match,
                oSearch.matchOne,
                oAppConfiguration.getCurrentApplication,
                utils.Error,
                utils.getFormFactor,
                utils.getLocalStorage,
                sap.ushell.Container.getService,
                sap.ushell.Container.getUser,
                sap.ui.getCore,
                jQuery.sap.getObject,
                jQuery.sap.log.warning,
                jQuery.sap.log.error,
                jQuery.sap.log.debug,
                jQuery.sap.log.getLevel,
                InboundProvider.prototype.getInbounds,
                VirtualInbounds.isVirtualInbound
            );
            delete sap.ushell.Container;
        }
    });

    test("getServiceClientSideTargetResolution: returns something different than undefined", function () {
        var oClientSideTargetResolution = sap.ushell.Container.getService("ClientSideTargetResolution");
        ok(oClientSideTargetResolution !== undefined);
    });

    test("getServiceClientSideTargetResolution: returns something different than undefined", function () {
        var oClientSideTargetResolution = sap.ushell.Container.getService("ClientSideTargetResolution");
        ok(oClientSideTargetResolution !== undefined);
    });

    [
        /*
         * Test for _extractInboundFilter
         */
        {
            testDescription: "natural result",
            input: "ABC-def?SO=AA",
            result: [
               {
                   semanticObject: "ABC",
                   action: "def"
               }
            ]
        },
        {
            testDescription: "flawed input",
            input: "Customer-processReceivablesCollectionSegment=EUR_TOOL&Customer=C0001&IsHeadOfficeView=true#Shell-home",
            result: undefined
        },
        {
            testDescription: "natural result no segmented access",
            noSegment: true,
            input: "ABC-defo?SO=AA",
            result: undefined
        }
    ].forEach(function (oFixture) {
        test("_extractInboundFilter when " + oFixture.testDescription, function () {
            var aRes,
                oSrvc,
                oFakeAdapter;

            if (oFixture.noSegment) {
                oFakeAdapter = null;
            } else {
                oFakeAdapter = {
                    getInbounds: function () {},
                    hasSegmentedAccess: true
                };
            }

            oSrvc = createService({
                adapter: oFakeAdapter
            });

            aRes = oSrvc._extractInboundFilter(oFixture.input);
            deepEqual(aRes, oFixture.result, "correct result");
        });
    });



    // test the parameter sap-ui-tech-hint=WDA|UI5|GUI which, given
    // an otherwise identical targetmapping, selects the one which has the given technology.

    var iInb = {
        semanticObject: "SO",
        action: "action",
        signature: {
            parameters: {}
        },
        resolutionResult: {}
    };

    var iInbDefault = {
        semanticObject: "SO",
        action: "action",
        signature: {
            parameters: { "sap-ui-tech-hint": { defaultValue: { value: "XXX" }}}
        },
        resolutionResult: {}
    };

    var iInbDefaultOtherPar = {
        semanticObject: "SO",
        action: "action",
        signature: {
            parameters: {
                "sap-ui-tech-hint": { defaultValue: { value: "XXX" }},
                "demo2": { defaultValue: { value: "XXX" }}
            }
        },
        resolutionResult: {}
    };

    function addTech (oObj, sTech) {
        var copy = jQuery.extend(true, {}, oObj);
        copy.resolutionResult["sap.ui"] = {};
        copy.resolutionResult["sap.ui"].technology = sTech;
        return copy;
    }

    [
         {
             testDescription: "all else equal, tech hint is used WDA->WDA",
             aInbounds: ["GUI", "WDA", "UI5", undefined].map(function (el) {
                 return addTech(iInb, el);
             }),
             sIntent: "SO-action?sap-ui-tech-hint=WDA",
             expectedResultTech: "WDA"
         },
         {
             testDescription: "all else equal, no tech hint, 'best technology' UI5->WDA->GUI",
             aInbounds: ["GUI", "UI5", "WDA", undefined].map(function (el) { return addTech(iInb, el); }),
             sIntent: "SO-action",
             expectedResultTech: "UI5"
         },
         {
             testDescription: "all else equal, no tech hint, 'best technology' UI5->WDA->GUI , UI5 not present",
             aInbounds: ["GUI", "WDA", undefined].map(function (el) { return addTech(iInb, el); }),
             sIntent: "SO-action",
             expectedResultTech: "WDA"
         },
         {
             testDescription: "all else equal, no tech hint, 'best technology' UI5->WDA->GUI , default on WDA Intent",
             aInbounds: [addTech(iInbDefault, "WDA")].concat(["GUI", "UI5", undefined].map(function (el) { return addTech(iInb, el); })),
             sIntent: "SO-action?sap-ui-tech-hint=GUI",
             expectedResultTech: "GUI"
         },
         {
             testDescription: "all else equal, no tech hint, 'best technology' UI5->WDA->GUI , DefaultInOther",
             aInbounds: [addTech(iInbDefaultOtherPar, "WDA")].concat(["GUI", "WDA", undefined].map(function (el) { return addTech(iInb, el); })),
             sIntent: "SO-action?sap-ui-tech-hint=GUI",
             expectedResultTech: "GUI"
         },
         {
             testDescription: "all else equal, no tech hint, 'best technology' UI5->WDA->GUI , DefaultInOther no hint",
             aInbounds: [addTech(iInbDefaultOtherPar, "WDA")].concat(["GUI", "WDA", undefined].map(function (el) { return addTech(iInb, el); })),
             sIntent: "SO-action",
             expectedResultTech: "WDA"
         }
    ].forEach(function (oFixture) {
        asyncTest("matchingTarget sap-ui-tech-hint " + oFixture.testDescription, function () {
         var oSrvc = createService();
         var oUrlParsing = oSrvc._getURLParsing();
         var oShellHash = oUrlParsing.parseShellHash("#" + oFixture.sIntent);
         oShellHash.formFactor = "desktop";

         var oIndex = oInboundIndex.createIndex(oFixture.aInbounds);

         oSrvc._getMatchingInbounds(oShellHash, oIndex)
             .done(function (oMatchingTargets) {
                 if (oFixture.expectedResultTech) {
                     equal(oMatchingTargets[0].inbound.resolutionResult["sap.ui"].technology, oFixture.expectedResultTech, "correct result technology");
                 }
             })
             .fail(function (sError) {
                 ok(false, "promise was rejected");
             })
             .always(function () {
                 start();
            });
        });
    });


    [
        /*
         * _getMatchingInbounds: checks match results are sorted as expected"
         */
        {
            testDescription: "one inbound matches",
            aFakeMatchResults: [
                // NOTE: not actual Inbound structure. We only use 'matches' and num
                // is random, used only for report purposes.
                { num: 36, matches: true, inbound: { resolutionResult: { applicationType: "Something" }}}
            ],
            expectedInbounds: [0] // zero-based index in aFakeInbounds
        },
        {
            testDescription: "no inbound matches",
            aFakeMatchResults: [
            ],
            expectedInbounds: []
        },
        {
            testDescription: "multiple inbound match, longer names win",
            aFakeMatchResults: [
                // NOTE: applicationType determines the order here
                { num: 33, matches: true, inbound: { resolutionResult: { applicationType: "Something" }}},
                { num: 36, matches: true, inbound: { resolutionResult: { applicationType: "SomethingExt" }}}
            ],
            expectedInbounds: [1, 0]
        },
        {
            testDescription: "multiple inbound match, reverse alphabetical order in tie-breaker",
            aFakeMatchResults: [
                // NOTE: applicationType determines the order here
                { num: 33, matches: true, inbound: { resolutionResult: { applicationType: "A" }}},
                { num: 36, matches: true, inbound: { resolutionResult: { applicationType: "B" }}}
            ],
            expectedInbounds: [1, 0] // -> B then A
        },
        {
            testDescription: "priority is specified",
            aFakeMatchResults: [
                { num: 18, matches: true, priorityString: "B", inbound: { resolutionResult: {} } },
                { num: 31, matches: true, priorityString: "CD", inbound: { resolutionResult: {} } },
                { num: 33, matches: true, priorityString: "CZ", inbound: { resolutionResult: {} } },
                { num: 41, matches: true, priorityString: "A", inbound: { resolutionResult: {} } },
                { num: 44, matches: true, priorityString: "C", inbound: { resolutionResult: {} } },
                { num: 46, matches: true, priorityString: "CE", inbound: { resolutionResult: {} } }
            ],
            expectedInbounds: [2, 5, 1, 4, 0, 3]
        },
        {
            testDescription: "priority is specified",
            aFakeMatchResults: [
                { num: 44, matches: true, priorityString: "C", inbound: { resolutionResult: {} } },
                { num: 31, matches: true, priorityString: "CD", inbound: { resolutionResult: {} } },
                { num: 41, matches: true, priorityString: "A", inbound: { resolutionResult: {} } },
                { num: 46, matches: true, priorityString: "CE", inbound: { resolutionResult: {} } },
                { num: 18, matches: true, priorityString: "B", inbound: { resolutionResult: {} } },
                { num: 33, matches: true, priorityString: "CZ", inbound: { resolutionResult: {} } }
            ],
            expectedInbounds: [5, 3, 1, 0, 4, 2]
        },
        {
            testDescription: "priority is with numbers",
            aFakeMatchResults: [
                { num: 44, matches: true, priorityString: "101", inbound: { resolutionResult: {} } },
                { num: 31, matches: true, priorityString: "000", inbound: { resolutionResult: {} } },
                { num: 41, matches: true, priorityString: "120", inbound: { resolutionResult: {} } },
                { num: 46, matches: true, priorityString: "999", inbound: { resolutionResult: {} } },
                { num: 18, matches: true, priorityString: "010", inbound: { resolutionResult: {} } },
                { num: 33, matches: true, priorityString: "001", inbound: { resolutionResult: {} } }
            ],
            expectedInbounds: [3, 2, 0, 4, 5, 1]
        },
        {
            testDescription: "realistic sort strings sorted with expected priority",
            aFakeMatchResults: [
                { num: 33, matches: true, priorityString: "x MTCH=003 MREQ=003 NFIL=002 NDEF=001 POT=004 RFRE=999", inbound: { resolutionResult: {} } },
                { num: 18, matches: true, priorityString: "x MTCH=003 MREQ=003 NFIL=002 NDEF=001 POT=100 RFRE=999", inbound: { resolutionResult: {} } }
            ],
            expectedInbounds: [1, 0]
        }

    ].forEach(function (oFixture) {
        asyncTest("_getMatchingInbounds: matching inbounds are returned in priority when " + oFixture.testDescription, function () {
            // Return fake adapter with inbounds in the fixture
            var oSrvc = createService(),
                aExpectedMatchingTargets = oFixture.expectedInbounds.map(function (iIdx) {
                    return oFixture.aFakeMatchResults[iIdx];
                });

            var oIndex = {
                // values don't matter for this test (match is stubbed anyway)
                getSegment: sinon.stub().returns([]),
                getAllInbounds: sinon.stub().returns([])
            };

            sinon.stub(oSearch, "match").returns(Promise.resolve({
                matchResults: oFixture.aFakeMatchResults,
                missingReferences: {}
            }));

            // Act
            oSrvc._getMatchingInbounds({} /* any parameter ok for the test*/, oIndex).done(function (aMatchingInbounds) {
                // Assert
                strictEqual(Object.prototype.toString.call(aMatchingInbounds), "[object Array]", "an array was returned");

                deepEqual(aMatchingInbounds, aExpectedMatchingTargets,
                    "inbounds that matched were returned in the promise");

            }).fail(function () {
                ok(false, "promise was resolved");

            }).always(function () {
                start();
            });

        });
    });



    [ //_mixAppStateIntoResolutionResultAndRename
        {
            description: "extendedDefaultParam in app state (parameters)",
            initialTarget: {
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "otherProperty": "foo", // keep unknown properties
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"],
                    "extendedDefaultParam": {
                        "Ranges": [
                            {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    }
                },
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"]
                },
                "defaultedParamNames": ["extendedDefaultParam"],
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {
                        "extendedDefaultParam": {
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null}
                            ]
                        }
                    }
                }
            },
            initialAppStateData: {
                selectionVariant: { Parameters: [{ "PropertyName": "extendedDefaultParam", "PropertyValue": "value1" }]}
            },
            newAppStateCreated: false,
            expectedAppStateData: {
                selectionVariant: { Parameters: [{ "PropertyName": "extendedDefaultParam", "PropertyValue": "value1" }]}
            },
            expectedDefaultedParamNames: [],
            expectedMappedDefaultedParamNames: []
        },
        {
            description: "no extendedDefaultParam in app state (root members do not count!)",
            initialTarget: {
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": ["extendedDefaultParam"],
                "otherProperty": "foo", // keep unknown properties
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"],
                    "extendedDefaultParam": {
                        "Ranges": [
                            {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    }
                },
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"]
                },
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {
                        "extendedDefaultParam": {
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null}
                            ]
                        }
                    }
                }
            },
            initialAppStateData: {
                "extendedDefaultParam": "value1"
            },
            newAppStateCreated: true,
            expectedAppStateData: {
                "extendedDefaultParam": "value1",
                "selectionVariant": {
                    "ODataFilterExpression": "",
                    "Parameters": [],
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null}
                            ]
                        }
                    ],
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    }
                }
            },
            expectedDefaultedParamNames: ["extendedDefaultParam"],
            expectedMappedDefaultedParamNames: ["extendedDefaultParam"]
        },
        {
            description: "extendedDefaultParam in app state (selectionVariant.Parameters)",
            initialTarget: {
                "otherProperty": "foo", // keep unknown properties
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": ["extendedDefaultParam"],
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"],
                    "extendedDefaultParam": {
                        "Ranges": [
                            {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    }
                },
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"]
                },
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {
                        "extendedDefaultParam": {
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null}
                            ]
                        }
                    }
                }
            },
            initialAppStateData: {
                "param1": "value1",
                "selectionVariant": {
                    "Parameters": [
                        {
                            "PropertyName": "extendedDefaultParam",
                            "PropertyValue": "appStateValue"
                        }
                    ]
                }
            },
            newAppStateCreated: false,
            expectedAppStateData: {
                "param1": "value1",
                "selectionVariant": {
                    "Parameters": [
                        {
                            "PropertyName": "extendedDefaultParam",
                            "PropertyValue": "appStateValue"
                        }
                    ]
                }
            },
            expectedDefaultedParamNames: [],
            expectedMappedDefaultedParamNames: []
        },
        {
            description: "extendedDefaultParam in app state 1 (selectionVariant.SelectOptions)",
            initialTarget: {
                "otherProperty": "foo", // keep unknown properties
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": ["extendedDefaultParam"],
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"],
                    "extendedDefaultParam": {
                        "Ranges": [
                            {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    }
                },
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {
                        "extendedDefaultParam": {
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null}
                            ]
                        }
                    }
                }
            },
            initialAppStateData: {
                "param1": "value1",
                "selectionVariant": {
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        }
                    ]
                }
            },
            newAppStateCreated: false,
            expectedAppStateData: {
                "param1": "value1",
                "selectionVariant": {
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        }
                    ]
                }
            },
            expectedDefaultedParamNames: [],
            expectedMappedDefaultedParamNames: []
        },
        {
            description: "extendedDefaultParam in app state 2  (selectionVariant.SelectOptions)",
            initialTarget: {
                "otherProperty": "foo", // keep unknown properties
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": ["extendedDefaultParam"],
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"],
                    "extendedDefaultParam": {
                        "Ranges": [
                            {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    }
                },
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {
                        "extendedDefaultParam": {
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null}
                            ]
                        }
                    }
                }
            },
            initialAppStateData: {
                "param1": "value1",
                "selectionVariant": {
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        }
                    ]
                }
            },
            newAppStateCreated: false,
            expectedAppStateData: {
                "param1": "value1",
                "selectionVariant": {
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        }
                    ]
                }
            },
            expectedDefaultedParamNames: [],
            expectedMappedDefaultedParamNames: []
        },
        {
            description: "app state present, but no user default values maintained",
            initialTarget: {
                "otherProperty": "foo", // keep unknown properties
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": [], // if no value is found, this array is empty!
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"]
                },
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {}
                }
            },
            initialAppStateData: {
                "param1": "value1"
            },
            newAppStateCreated: false,
            expectedAppStateData: {
                "param1": "value1"
            },
            expectedDefaultedParamNames: [],
            expectedMappedDefaultedParamNames: []
        },
        {
            description: "existing app state (combined) not overwritten",
            initialTarget: {
                "otherProperty": "foo", // keep unknown properties
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam1": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }},
                            "extendedDefaultParam2": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }},
                            "extendedDefaultParam3": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": ["extendedDefaultParam1", "extendedDefaultParam2", "extendedDefaultParam3"],
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"],
                    "extendedDefaultParam1": {
                        "Ranges": [
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    },
                    "extendedDefaultParam2": {
                        "Ranges": [
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    },
                    "extendedDefaultParam3": {
                        "Ranges": [
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    }
                },
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {
                        "extendedDefaultParam1": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        },
                        "extendedDefaultParam2": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        },
                        "extendedDefaultParam3": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        }
                    }
                }
            },
            initialAppStateData: {
                "param1": "value1",
                "selectionVariant": {
                    "Parameters": [
                        {
                            "PropertyName": "extendedDefaultParam2",
                            "PropertyValue": "appStateValue2"
                        },
                        {
                            "PropertyName": "param2",
                            "PropertyValue": "value2"
                        }
                    ],
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam1",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        },
                        {
                            "PropertyName": "extendedDefaultParam3",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        },
                        {
                            "PropertyName": "value3",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "100", "High": "900"},
                                {"Sign": "I", "Option": "EQ", "Low": "1234", "High": null}
                            ]
                        }
                    ]
                }
            },
            newAppStateCreated: false,
            expectedAppStateData: {
                "param1": "value1",
                "extendedDefaultParam1": "appStateValue1",
                "selectionVariant": {
                    "Parameters": [
                        {
                            "PropertyName": "extendedDefaultParam2",
                            "PropertyValue": "appStateValue2"
                        },
                        {
                            "PropertyName": "param2",
                            "PropertyValue": "value2"
                        }
                    ],
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam1",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        },
                        {
                            "PropertyName": "extendedDefaultParam3",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        },
                        {
                            "PropertyName": "value3",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "100", "High": "900"},
                                {"Sign": "I", "Option": "EQ", "Low": "1234", "High": null}
                            ]
                        }
                    ]
                }
            },
            expectedDefaultedParamNames: [],
            expectedMappedDefaultedParamNames: []
        },
        {
            description: "existing app state with undefined content (e.g. expired or could not be retrieved)",
            initialTarget: {
                "otherProperty": "foo", // keep unknown properties
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam1": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": ["extendedDefaultParam1"],
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"],
                    "extendedDefaultParam1": {
                        "Ranges": [
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    }
                },
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"]
                },
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {
                        "extendedDefaultParam1": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        }
                    }
                }
            },
            initialAppStateData: undefined,
            newAppStateCreated: true,
            expectedAppStateData: {
                "selectionVariant": {
                    "ODataFilterExpression": "",
                    "Parameters": [],
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam1",
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null}
                            ]
                        }
                    ],
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    }
                }
            },
            expectedDefaultedParamNames: ["extendedDefaultParam1"],
            expectedMappedDefaultedParamNames: ["extendedDefaultParam1"]
        },
        {
            description: "existing app state (combined) merged with defaults",
            initialTarget: {
                "otherProperty": "foo", // keep unknown properties
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam1": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }},
                            "extendedDefaultParam2": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }},
                            "extendedDefaultParam3": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": ["extendedDefaultParam1", "extendedDefaultParam2", "extendedDefaultParam3"],
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"],
                    "extendedDefaultParam1": {
                        "Ranges": [
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    },
                    "extendedDefaultParam2": {
                        "Ranges": [
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    },
                    "extendedDefaultParam3": {
                        "Ranges": [
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    }
                },
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["EXSISTINGKEY"],
                    "simpleDefaultParam": ["simpleValue"]
                },
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {
                        "extendedDefaultParam1": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        },
                        "extendedDefaultParam2": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        },
                        "extendedDefaultParam3": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        }
                    }
                }
            },
            initialAppStateData: {
                "param1": "value1",
                "selectionVariant": {
                    "Parameters": [
                        {
                            "PropertyName": "param2",
                            "PropertyValue": "value2"
                        }
                    ],
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam1",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        },
                        {
                            "PropertyName": "value3",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "100", "High": "900"},
                                {"Sign": "I", "Option": "EQ", "Low": "1234", "High": null}
                            ]
                        }
                    ]
                }
            },
            newAppStateCreated: true,
            expectedAppStateData: {
                "param1": "value1",
                "selectionVariant": {
                    "ODataFilterExpression": "",
                    "Parameters": [
                        {
                            "PropertyName": "param2",
                            "PropertyValue": "value2"
                        }
                    ],
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam1",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "1", "High": "9"},
                                {"Sign": "I", "Option": "EQ", "Low": "123", "High": null}
                            ]
                        },
                        {
                            "PropertyName": "value3",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "100", "High": "900"},
                                {"Sign": "I", "Option": "EQ", "Low": "1234", "High": null}
                            ]
                        },
                        {
                            "PropertyName": "extendedDefaultParam2",
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        },
                        {
                            "PropertyName": "extendedDefaultParam3",
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        }
                    ],
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    }
                }
            },
            expectedDefaultedParamNames: ["extendedDefaultParam2", "extendedDefaultParam3"],
            expectedMappedDefaultedParamNames: ["extendedDefaultParam2", "extendedDefaultParam3"]
        },
        {
            description: "no app state present",
            initialTarget: {
                "otherProperty": "foo", // keep unknown properties
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": ["extendedDefaultParam"],
                "intentParamsPlusAllDefaults": {
                    "simpleDefaultParam": ["simpleValue"],
                    "extendedDefaultParam": {
                        "Ranges": [
                            {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                            {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                        ]
                    }
                },
                "mappedIntentParamsPlusSimpleDefaults": {
                    "simpleDefaultParam": ["simpleValue"]
                },
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {
                        "extendedDefaultParam": {
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null}
                            ]
                        }
                    }
                }
            },
            initialAppStateData: undefined,
            newAppStateCreated: true,
            expectedAppStateData: {
                "selectionVariant": {
                    "ODataFilterExpression": "",
                    "Parameters": [],
                    "SelectOptions": [
                        {
                            "PropertyName": "extendedDefaultParam",
                            "Ranges": [
                                {"Sign": "I", "Option": "BT", "Low": "A", "High": "Z"},
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null}
                            ]
                        }
                    ],
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    }
                }
            },
            expectedDefaultedParamNames: ["extendedDefaultParam"],
            expectedMappedDefaultedParamNames: ["extendedDefaultParam"]
        },
        {
            description: "no app state and no user defaults present",
            defaultedParamNames: undefined, // not relevant
            initialTarget: {
                "otherProperty": "foo", // keep unknown properties
                "inbound": {
                    "signature": {
                        "parameters": {
                            "extendedDefaultParam": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                        }
                    }
                },
                "defaultedParamNames": [], // if value is undefined, this is empty
                "intentParamsPlusAllDefaults": {},
                "mappedIntentParamsPlusSimpleDefaults": {},
                "resolutionResult": {
                    "otherProperty": "foo", // keep unknown properties
                    "oNewAppStateMembers": {}
                }
            },
            initialAppStateData: undefined,
            newAppStateCreated: false,
            expectedAppStateData: undefined,
            expectedDefaultedParamNames: [],
            expectedMappedDefaultedParamNames: []
        }
    ].forEach(function (oFixture) {
        asyncTest("_mixAppStateIntoResolutionResultAndRename with " + oFixture.description, function () {
            var oExpectedTarget = jQuery.extend(true, {}, oFixture.initialTarget),
                oAppStateSrvc = sap.ushell.Container.getService("AppState"),
                oSrvc = createService(),
                oNewAppStateData, // modified by oNewFakeAppState
                oNewFakeAppState = {
                    _data: undefined, // simplyfies the test
                    setData: function (oData) {
                        oNewAppStateData = oData;
                    },
                    getData: function () {
                        return oNewAppStateData;
                    },
                    save: function () {
                        var oDeferred = new jQuery.Deferred();
                        // resolve appstate object async
                        setTimeout(function () {
                            oDeferred.resolve();
                        }, 0);
                        return oDeferred.promise();
                    },
                    getKey: function () {
                        return "NEWKEY";
                    }
                };

            function getFakeAppState (sKey) {
                var oDeferred = new jQuery.Deferred();

                strictEqual(typeof sKey, "string", "getAppState: a string key provided");
                strictEqual(sKey, oFixture.initialTarget.intentParamsPlusAllDefaults["sap-xapp-state"][0],
                    "getAppState: correct key requested");

                // resolve appstate object async
                setTimeout(function () {
                    // TODO test reject
                    oDeferred.resolve({
                        getData: function () {
                            return oFixture.initialAppStateData;
                        }
                    });
                }, 0);

                return oDeferred.promise();
            }

            // restores for AppState service not needed as local bootstrap is done for each test
            sinon.stub(oAppStateSrvc, "getAppState", getFakeAppState);
            sinon.stub(oAppStateSrvc, "createEmptyAppState").returns(oNewFakeAppState);

            // initial and expected target do not differ very much
            if (oFixture.newAppStateCreated) {
                oExpectedTarget.intentParamsPlusAllDefaults["sap-xapp-state"] = ["NEWKEY"];
                oExpectedTarget.mappedIntentParamsPlusSimpleDefaults["sap-xapp-state"] = ["NEWKEY"];
            }
            oExpectedTarget.defaultedParamNames = oFixture.expectedDefaultedParamNames;
            oExpectedTarget.mappedDefaultedParamNames = oFixture.expectedMappedDefaultedParamNames;

            // _mixAppStateIntoResolutionResultAndRename shall remove oNewAppStateMembers as it is not
            // needed afterwards anymore
            delete oExpectedTarget.resolutionResult.oNewAppStateMembers;
            oExpectedTarget.mappedDefaultedParamNames = oExpectedTarget.defaultedParamNames;

            oSrvc._mixAppStateIntoResolutionResultAndRename(oFixture.initialTarget, oAppStateSrvc)
                .done(function (oMatchingTarget) {
                    start();
                    if (oAppStateSrvc.createEmptyAppState.called) {
                        oAppStateSrvc.createEmptyAppState.args.forEach(function (a, index) {
                            equal(a[1], true, "createEmptyAppState invoked as transient true");
                        });
                    }
                    deepEqual(oMatchingTarget, oExpectedTarget, "modified target");
                    if (oFixture.newAppStateCreated) {
                        deepEqual(oNewAppStateData, oFixture.expectedAppStateData,
                            "new app state data as expected");
                        deepEqual(oNewAppStateData.selectionVariant.SelectOptions,
                            oFixture.expectedAppStateData.selectionVariant.SelectOptions,
                            "For better debugging: compare SelectOptions again");
                    } else {
                        ok(oAppStateSrvc.createEmptyAppState.notCalled, "No app state created");
                    }
                })
                .fail(function (sMsg) {
                    start();
                    ok(false, sMsg);
                });
        });
    });

    // unmergable app-state content leads to non-tampering with it.
    [
        { "content": [], "description": "content is array" },
        { "content": 1234, "description": "content is integer" },
        { "content": "astring", "description": "content is string" }
    ].forEach(function (oFixture1) {
        [
            {
                "description": "app state merged with " + oFixture1.description,
                "initialTarget": {
                    "otherProperty": "foo", // keep unknown properties
                    "inbound": {
                        "signature": {
                            "parameters": {
                                "extendedDefaultParam1": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }},
                                "extendedDefaultParam2": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }},
                                "extendedDefaultParam3": { "defaultValue": { "value": "UserDefault.extended.extendedDefaultParam", "format": "reference" }}
                            }
                        }
                    },
                    "defaultedParamNames": ["extendedDefaultParam1", "extendedDefaultParam2", "extendedDefaultParam3"],
                    "intentParamsPlusAllDefaults": {
                        "sap-xapp-state": ["EXSISTINGKEY"],
                        "simpleDefaultParam": ["simpleValue"],
                        "extendedDefaultParam1": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        },
                        "extendedDefaultParam2": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        },
                        "extendedDefaultParam3": {
                            "Ranges": [
                                {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                            ]
                        }
                    },
                    "mappedIntentParamsPlusSimpleDefaults": {
                        "sap-xapp-state": ["EXSISTINGKEY"],
                        "simpleDefaultParam": ["simpleValue"]
                    },
                    "resolutionResult": {
                        "otherProperty": "foo", // keep unknown properties
                        "oNewAppStateMembers": {
                            "extendedDefaultParam1": {
                                "Ranges": [
                                    {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                                ]
                            },
                            "extendedDefaultParam2": {
                                "Ranges": [
                                    {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                                ]
                            },
                            "extendedDefaultParam3": {
                                "Ranges": [
                                    {"Sign": "I", "Option": "EQ", "Low": "ABC", "High": null }
                                ]
                            }
                        }
                    }
                },
                initialAppStateData: oFixture1.content,
                newAppStateCreated: false,
                expectedAppStateData: oFixture1.content,
                expectedDefaultedParamNames: [],
                expectedMappedDefaultedParamNames: []
            }
        ].forEach(function (oFixture) {
            asyncTest("_mixAppStateIntoResolutionResultAndRename with corrupt appstate (resuse old appstate)" + oFixture.description, function () {
                var oExpectedTarget = jQuery.extend(true, {}, oFixture.initialTarget),
                    oAppStateSrvc = sap.ushell.Container.getService("AppState"),
                    oSrvc = createService(),
                    oNewAppStateData, // modified by oNewFakeAppState
                    oNewFakeAppState = {
                        _data: undefined, // simplyfies the test
                        setData: function (oData) {
                            oNewAppStateData = oData;
                        },
                        getData: function () {
                            return oNewAppStateData;
                        },
                        save: function () {
                            var oDeferred = new jQuery.Deferred();
                            // resolve appstate object async
                            setTimeout(function () {
                                // TODO test reject
                                oDeferred.resolve();
                            }, 0);
                            return oDeferred.promise();
                        },
                        getKey: function () {
                            return "NEWKEY";
                        }
                    };

                function getFakeAppState (sKey) {
                    var oDeferred = new jQuery.Deferred();

                    strictEqual(typeof sKey, "string", "getAppState: a string key provided");
                    strictEqual(sKey, oFixture.initialTarget.intentParamsPlusAllDefaults["sap-xapp-state"][0],
                        "getAppState: correct key requested");

                    // resolve appstate object async
                    setTimeout(function () {
                        // TODO test reject
                        oDeferred.resolve({
                            getData: function () {
                                return oFixture.initialAppStateData;
                            }
                        });
                    }, 0);

                    return oDeferred.promise();
                }

                // restores for AppState service not needed as local bootstrap is done for each test
                sinon.stub(oAppStateSrvc, "getAppState", getFakeAppState);
                sinon.stub(oAppStateSrvc, "createEmptyAppState").returns(oNewFakeAppState);

                // initial and expected target do not differ very much
                if (oFixture.newAppStateCreated) {
                    oExpectedTarget.intentParamsPlusAllDefaults["sap-xapp-state"] = ["NEWKEY"];
                    oExpectedTarget.mappedIntentParamsPlusSimpleDefaults["sap-xapp-state"] = ["NEWKEY"];
                }
                oExpectedTarget.defaultedParamNames = oFixture.expectedDefaultedParamNames;
                oExpectedTarget.mappedDefaultedParamNames = oFixture.expectedMappedDefaultedParamNames;

                // _mixAppStateIntoResolutionResultAndRename shall remove oNewAppStateMembers as it is not
                // needed afterwards anymore
                delete oExpectedTarget.resolutionResult.oNewAppStateMembers;
                oExpectedTarget.mappedDefaultedParamNames = oExpectedTarget.defaultedParamNames;

                oSrvc._mixAppStateIntoResolutionResultAndRename(oFixture.initialTarget, oAppStateSrvc)
                    .done(function (oMatchingTarget) {
                        start();
                        ok(true, "expected rejection");
                        deepEqual(oMatchingTarget, oExpectedTarget, "modified target");
                        if (oFixture.newAppStateCreated) {
                            deepEqual(oNewAppStateData, oFixture.expectedAppStateData,
                                "new app state data as expected");
                            deepEqual(oNewAppStateData.selectionVariant.SelectOptions,
                                oFixture.expectedAppStateData.selectionVariant.SelectOptions,
                                "For better debugging: compare SelectOptions again");
                        } else {
                            ok(oAppStateSrvc.createEmptyAppState.notCalled, "No app state created");
                        }
                    })
                    .fail(function (sMsg) {
                        start();
                        ok(false, sMsg);
                        deepEqual(sMsg, "bad application state content", "x");
                    });
            });
        });
    });

    [
        /*
         * General tests for _getMatchingInbounds
         *
         * testDescription: {string}:
         *   describes the test case (not what the test should do!).
         *
         * oParsedShellHash: {object}:
         *   the parsed intent
         *
         * aInbounds: {object}
         *   inbounds to match against
         *
         * mockedUserDefaultValues: {object}
         *   any mocked known user default value
         *
         * expected: {object[]} or {number[]}
         *  - when {object[]}:
         *     array of *matching results*. This is checked 1:1
         *     with deepEqual.
         *
         *  - when {number[]}:
         *     array of 0-based indices into aInbounds. In this case the
         *     test will deepEqual only the "inbound" entry in the
         *     matching result object.
         *
         * NOTE: this test does not check for the sort string or count
         *       parameters. Use test for sort string instead.
         */
        {
            testDescription: "generic semantic object specified in intent",
            oParsedShellHash: {
                "semanticObject": undefined,
                "action": "action",
                "params": {
                    "currency": ["EUR"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "ObjectA",
action: "action",
                    signature: { parameters: {
                        currency: { required: true, filter: { value: "EUR" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.ComponentA", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                },
                {
                    semanticObject: "ObjectB",
action: "action",
                    signature: { parameters: {
                        currency: { required: true, filter: { value: "EUR" } },
                        user: { required: false, defaultValue: { value: "TEST" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.ComponentB", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [1, 0]
        },
        {
            testDescription: "generic action specified in intent",
            oParsedShellHash: {
                "semanticObject": "Object",
                "action": undefined,
                "params": {
                    "currency": ["EUR"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "actionA",
                    signature: { parameters: {
                        currency: { required: true, filter: { value: "EUR" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.ComponentA", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                },
                {
                    semanticObject: "Object",
action: "actionB",
                    signature: { parameters: {
                        currency: { required: true, filter: { value: "EUR" } },
                        user: { required: false, defaultValue: { value: "TEST" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.ComponentB", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [1, 0]
        },
        {
            testDescription: "* specified in intent semantic object",
            oParsedShellHash: {
                "semanticObject": "*", // treated as a literal "*"
                "action": undefined,
                "params": {
                    "currency": ["EUR"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "*",
action: "action",
                    signature: { parameters: {
                        currency: { required: true, filter: { value: "EUR" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.ComponentA", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                },
                {
                    semanticObject: "Object",
action: "action",
                    signature: { parameters: {
                        currency: { required: true, filter: { value: "EUR" } },
                        user: { required: false, defaultValue: { value: "TEST" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.ComponentB", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [0]
        },
        {
            testDescription: "* specified in intent action",
            oParsedShellHash: {
                "semanticObject": undefined,
                "action": "*",
                "params": {
                    "currency": ["EUR"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: { parameters: {
                        currency: { required: true, filter: { value: "EUR" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.ComponentA", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                },
                {
                    semanticObject: "Object",
action: "*",
                    signature: { parameters: {
                        currency: { required: true, filter: { value: "EUR" } },
                        user: { required: false, defaultValue: { value: "TEST" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.ComponentB", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [1]
        },
        {
            testDescription: "a filter reference is specified",
            oParsedShellHash: {
                "semanticObject": "Object",
"action": "action",
                "params": {
                    "currency": ["EUR"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: { parameters: {
                        currency: { required: true, filter: { format: "reference", value: "UserDefault.currency" } }
                    }},
                    title: "Currency manager",
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.Component", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                }
            ],
            mockedUserDefaultValues: { "currency": "EUR" },
            expected: [{
                "genericSO": false,
                "intentParamsPlusAllDefaults": {
                    "currency": [ "EUR" ]
                },
                "defaultedParamNames": [],
                "matches": true,
                "parsedIntent": {
                    "semanticObject": "Object",
                    "action": "action",
                    "params": {
                        "currency": ["EUR"]
                    }
                },
                "matchesVirtualInbound": false,
                "inbound": {
                    "title": "Currency manager",
                    "action": "action",
                    "semanticObject": "Object",
                    "signature": {
                        "parameters": {
                            currency: { required: true, filter: { format: "reference", value: "UserDefault.currency" } }
                        }
                    },
                    "resolutionResult": { text: "Currency manager", ui5ComponentName: "Currency.Component", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                },
                "resolutionResult": { } // title not propagated in early resolution result
            }]
        },
        {
            testDescription: "user default service provides non-matching parameter",
            oParsedShellHash: {
                "semanticObject": "Object",
"action": "action",
                "params": {
                    "currency": ["EUR"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: { parameters: {
                        currency: { required: true, filter: { format: "reference", value: "UserDefault.currency" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.Component", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                }
            ],
            mockedUserDefaultValues: { "currency": "GBP" }, // NOTE: GBP does not match filter
            expected: []
        },
        {
            testDescription: "user default service cannot provide a default value for filter reference",
            oParsedShellHash: {
                "semanticObject": "Object",
"action": "action",
                "params": {
                    "currency": ["EUR"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: { parameters: {
                        currency: { required: true, filter: { format: "reference", value: "UserDefault.currency" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.Component", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                }
            ],
            mockedUserDefaultValues: { "other": "uselessValue" },
            expected: []
        },
        {
            testDescription: "default reference value is provided by UserDefaultParameters service",
            oParsedShellHash: {
                "semanticObject": "Object",
"action": "action",
                "params": {}
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: { parameters: {
                        currency: { required: false, defaultValue: { format: "reference", value: "UserDefault.currency" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.Component", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                }
            ],
            mockedUserDefaultValues: { "currency": "EUR" },
            expected: [{
               "genericSO": false,
               "intentParamsPlusAllDefaults": {
                   currency: ["EUR"]
               },
               "defaultedParamNames": ["currency"],
               "matches": true,
               "parsedIntent": {
                    "semanticObject": "Object",
"action": "action",
                    "params": {}
               },
               "matchesVirtualInbound": false,
               "resolutionResult": { }, // no title propagated yet in Early resolution result
               "inbound": {
                   "action": "action",
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                   "semanticObject": "Object",
                   "signature": {
                       "parameters": {
                            "currency": { required: false, defaultValue: { format: "reference", value: "UserDefault.currency" } }
                       }
                   }
               }
            }]
        },
        {
            testDescription: "unknown default reference",
            oParsedShellHash: {
                "semanticObject": "Object",
"action": "action",
                "params": {} // note, no parameter given
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: { parameters: {
                        currency: { required: false, defaultValue: { format: "reference", value: "UserDefault.currency" } }
                    }},
                    resolutionResult: { text: "Currency manager", ui5ComponentName: "Currency.Component", url: "/url/to/currency", applicationType: "URL", additionalInformation: "SAPUI5.Component=Currency.Component" }
                }
            ],
            mockedUserDefaultValues: { /* no known values */ },
            expected: [{
               "genericSO": false,
               "intentParamsPlusAllDefaults": {}, // no default parameter
               "matches": true,
               "matchesVirtualInbound": false,
               "defaultedParamNames": [],
               "resolutionResult": {}, // no title propagated yet in Early resolution result
               "parsedIntent": {
                    "semanticObject": "Object",
"action": "action",
                    "params": {}
               },
               "inbound": {
                   "action": "action",
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                   "semanticObject": "Object",
                   "signature": {
                       "parameters": {
                            "currency": { required: false, defaultValue: { format: "reference", value: "UserDefault.currency" } }
                       }
                   }
               }
            }]
        },
        {
            testDescription: "a default reference and a filter reference are known",
            oParsedShellHash: {
                "semanticObject": "Currency",
"action": "app",
                "params": {}
            },
            aInbounds: [
                {
                    semanticObject: "*",
action: "app",
                    signature: { parameters: {
                        mode: {
                            required: false,
                            defaultValue: { format: "reference", value: "UserDefault.mode" },
                            filter: { format: "reference", value: "UserDefault.currencyAppMode" }
                        }
                    }},
                    resolutionResult: {
                        text: "Currency manager",
                        ui5ComponentName: "Currency.Component",
                        url: "/url/to/currency",
                        applicationType: "URL",
                        additionalInformation: "SAPUI5.Component=Currency.Component"
                    }
                },
                {
                    semanticObject: "*",
action: "app",
                    signature: { parameters: {
                        mode: {
                            required: false,
                            defaultValue: { format: "reference", value: "UserDefault.mode" },
                            filter: { format: "reference", value: "UserDefault.carsAppMode" }
                        }
                    }},
                    resolutionResult: {
                        text: "Cars manager",
                        ui5ComponentName: "Cars.Component",
                        url: "/url/to/cars",
                        applicationType: "URL",
                        additionalInformation: "SAPUI5.Component=Cars.Component"
                    }
                }
            ],
            mockedUserDefaultValues: {
                "mode": "desktop", // user specific preference
                "currencyAppMode": "desktop",
                "carsAppMode": "mobile"
            },
            expected: [{
               "genericSO": true,
               "intentParamsPlusAllDefaults": {
                   "mode": ["desktop"]
               },
               "defaultedParamNames": ["mode"],
               "matches": true,
               "matchesVirtualInbound": false,
               "resolutionResult": { },
               "parsedIntent": {
                    "semanticObject": "Currency",
"action": "app",
                    "params": {}
               },
               "inbound": {
                   "action": "app",
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                   "semanticObject": "*",
                   "signature": {
                       "parameters": {
                           "mode": {
                               "required": false,
                               "defaultValue": { format: "reference", value: "UserDefault.mode" },
                               "filter": { format: "reference", value: "UserDefault.currencyAppMode" }
                           }
                       }
                   }
               }
            }]
        },
        {
            testDescription: "sap-ushell-defaultedParameterNames is specified",
            oParsedShellHash: {
                "semanticObject": "Currency",
"action": "app",
                "params": {
                   "sap-ushell-defaultedParameterNames": ["will", "be", "ignored"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "Currency",
action: "app",
                    signature: {
                        parameters: {},
                        additionalParameters: "allowed"
                    },
                    resolutionResult: {
                        text: "Currency manager",
                        ui5ComponentName: "Currency.Component",
                        url: "/url/to/currency",
                        applicationType: "URL",
                        additionalInformation: "SAPUI5.Component=Currency.Component"
                    }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [{
                "defaultedParamNames": [], // NOTE: no sap- param!
                "genericSO": false,
                "intentParamsPlusAllDefaults": {},
                "matches": true,
                "matchesVirtualInbound": false,
                "resolutionResult": { },
                "parsedIntent": {
                    "action": "app",
                    "params": {
                        "sap-ushell-defaultedParameterNames": [ "will", "be", "ignored" ]
                    },
                    "semanticObject": "Currency"
                },
                "inbound": {
                  "action": "app",
                  "resolutionResult": {
                    "additionalInformation": "SAPUI5.Component=Currency.Component",
                    "applicationType": "URL",
                    "text": "Currency manager",
                    "ui5ComponentName": "Currency.Component",
                    "url": "/url/to/currency"
                  },
                  "semanticObject": "Currency",
                  "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                  }
                }
            }]
        },
        {
            testDescription: "one inbound default parameter is in the intent",
            oParsedShellHash: {
                "semanticObject": "Currency",
"action": "app",
                "params": {
                   "intentParam1": ["ipv1"],
                   "overlappingParam3": ["ipv2"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "Currency",
action: "app",
                    signature: {
                        parameters: {
                            "defaultParam1": { required: false, defaultValue: { value: "dv1" } },
                            "defaultParam2": { required: false, defaultValue: { value: "dv2" } },
                            "overlappingParam3": { required: false, defaultValue: { value: "dv3" } }
                        },
                        additionalParameters: "allowed"
                    },
                    resolutionResult: {
                        text: "Currency manager",
                        ui5ComponentName: "Currency.Component",
                        url: "/url/to/currency",
                        applicationType: "URL",
                        additionalInformation: "SAPUI5.Component=Currency.Component"
                    }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [{
                "defaultedParamNames": [
                  "defaultParam1",
                  "defaultParam2"
                ],
                "genericSO": false,
                "intentParamsPlusAllDefaults": {
                  "defaultParam1": [
                    "dv1"
                  ],
                  "defaultParam2": [
                    "dv2"
                  ],
                  "intentParam1": [
                    "ipv1"
                  ],
                  "overlappingParam3": [
                    "ipv2"
                  ]
                },
                "matches": true,
                "matchesVirtualInbound": false,
                "resolutionResult": { },
                "parsedIntent": {
                    "action": "app",
                    "params": {
                        "intentParam1": [
                            "ipv1"
                        ],
                        "overlappingParam3": [
                            "ipv2"
                        ]
                    },
                    "semanticObject": "Currency"
                },
                "inbound": {
                  "action": "app",
                  "resolutionResult": {
                    "additionalInformation": "SAPUI5.Component=Currency.Component",
                    "applicationType": "URL",
                    "text": "Currency manager",
                    "ui5ComponentName": "Currency.Component",
                    "url": "/url/to/currency"
                  },
                  "semanticObject": "Currency",
                  "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "defaultParam1": { required: false, defaultValue: { value: "dv1" } },
                        "defaultParam2": { required: false, defaultValue: { value: "dv2" } },
                        "overlappingParam3": { required: false, defaultValue: { value: "dv3" } }
                    }
                  }
                }
            }]
        },
        {
            /*
             * Inbounds with more defaulted parameters are a better fit
             * if nothing required had matched.
             */
            testDescription: "intent matches no filters and multiple inbounds with same SO-action are defined",
            oParsedShellHash: {
                "semanticObject": "Object",
                "action": "action",
                "params": {
                    "additionalParameter": "hello"
                }
            },
            aInbounds: [
                { // #0 : this should not match because of the filter on company code
                    semanticObject: "Object",
action: "action",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            CompanyCode: {
                                required: true,
                                filter: {
                                    format: "plain",
                                    value: "1000"
                                }
                            },
                            "sap-app-id": {
                                required: false,
                                defaultValue: {
                                    format: "plain",
                                    value: "COMPANY1000"
                                }
                            }
                        }
                    },
                    resolutionResult: { } // doesn't really matter
                },
                { // Priority: x MTCH=000 MREQ=000 NFIL=000 NDEF=001 POT=001 RFRE=999
                    semanticObject: "Object",
action: "action",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            default1: {
                                required: false,
                                defaultValue: { format: "plain", value: "1000" }
                            }
                        }
                    },
                    resolutionResult: { }
                },
                { // Priority: x MTCH=000 MREQ=000 NFIL=000 NDEF=002 POT=001 RFRE=999
                    semanticObject: "Object",
action: "action",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            default1: {
                                required: false,
                                defaultValue: { format: "plain", value: "1000" }
                            },
                            default2: { // extra default parameter -> more complex
                                required: false,
                                defaultValue: { format: "plain", value: "1000" }
                            }
                        }
                    },
                    resolutionResult: { }
                },
                { // Priority: x MTCH=000 MREQ=000 NFIL=000 NDEF=000 POT=001 RFRE=999
                    semanticObject: "Object",
action: "action",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: { }
                    }, // no signature parameters -> simple.
                    resolutionResult: { }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [2, 1, 3]
        },
        {
            /*
             * Test matching with sap-priority
             */
            testDescription: "intent matches no filters and multiple inbounds with same SO-action are defined and sap-priority",
            oParsedShellHash: {
                "semanticObject": "Object",
                "action": "action",
                "params": {
                    "additionalParameter": "hello"
                }
            },
            aInbounds: [
                { // #0 : this should not match because of the filter on company code
                    semanticObject: "Object",
action: "action",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            CompanyCode: {
                                required: true,
                                filter: {
                                    format: "plain",
                                    value: "1000"
                                }
                            },
                            "sap-app-id": {
                                required: false,
                                defaultValue: {
                                    format: "plain",
                                    value: "COMPANY1000"
                                }
                            }
                        }
                    },
                    resolutionResult: { } // doesn't really matter
                },
                { // #1 : this matches and comes before negative inbounds with negative sap-priority
                    semanticObject: "Object",
action: "action",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            default1: {
                                required: false,
                                defaultValue: { format: "plain", value: "1000" }
                            }
                        }
                    },
                    resolutionResult: { }
                },
                { // #2 : this matches and should come last, but sap-priority is specified so it comes first
                    semanticObject: "Object",
action: "action",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            default1: {
                                required: false,
                                defaultValue: { format: "plain", value: "1000" }
                            },
                            "sap-priority": {
                                defaultValue: { format: "plain", value: "50" }
                            },
                            default2: { // extra default parameter -> more complex
                                required: false,
                                defaultValue: { format: "plain", value: "1000" }
                            }
                        }
                    },
                    resolutionResult: { }
                },
                { // #3 : this comes last because of negative sap priority
                    semanticObject: "Object",
action: "action",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "sap-priority": {
                                defaultValue: { format: "plain", value: "-50" }
                            }
                        }
                    }, // no signature parameters -> simple.
                    resolutionResult: { }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [
                2, // sap-priority: 50
                1, // no sap priority
                3 // sap-priority: -50
            ]
        },
        {
            /*
             * Here we test that the most detailed inbound that suits
             * the filter is chosen among less detailed/complex ones. In this
             * case the "sap-app-id" contributes to the complexity of the
             * inbound which is then prioritized.
             */
            testDescription: "intent matches a filter and multiple inbounds with same SO-action are defined",
            oParsedShellHash: {
                "semanticObject": "Object",
                "action": "action",
                "params": {
                    "CompanyCode": ["1000"]
                }
            },
            aInbounds: [
                { // #0
                    semanticObject: "Object",
action: "action",
                    signature: {
                        parameters: {
                            CompanyCode: {
                                required: true,
                                filter: {
                                    format: "plain",
                                    value: "1000" // Company code matches this filter
                                }
                            },
                            "sap-app-id": { // higher complexity, inbound will be prioritized
                                required: false,
                                defaultValue: {
                                    format: "plain",
                                    value: "COMPANY1000"
                                }
                            }
                        }
                    },
                    resolutionResult: { } // doesn't really matter
                },
                { // #1
                    semanticObject: "Object",
action: "action",
                    signature: {
                        parameters: {
                            CompanyCode: {
                                required: true,
                                filter: {
                                    format: "plain",
                                    value: "1000" // Company code matches this filter, but this inbound is less complex to be prioritized
                                }
                            }
                        }
                    },
                    resolutionResult: { } // doesn't really matter
                },
                { // #2
                    semanticObject: "Object",
action: "action",
                    signature: {
                        parameters: {
                            CompanyCode: {
                                required: true,
                                filter: {
                                    format: "plain",
                                    value: "2000"
                                }
                            },
                            "sap-app-id": {
                                required: false,
                                defaultValue: {
                                    format: "plain",
                                    value: "COMPANY2000"
                                }
                            }
                        }
                    },
                    resolutionResult: { } // doesn't really matter
                }
            ],
            mockedUserDefaultValues: {},
            expected: [0, 1]
        },
        {
            testDescription: "required parameter in inbounds without value or defaultValue",
            oParsedShellHash: {
                "semanticObject": "Object",
"action": "action",
                "params": {
                    "currency": ["EUR"]
                }
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: { parameters: {
                        currency: { required: true }
                    }},
                    resolutionResult: { text: "Currency manager"
                    //    ui5ComponentName: "Currency.Component",
                    //    url: "/url/to/currency",
                    //    applicationType: "URL",
                    //    additionalInformation: "SAPUI5.Component=Currency.Component"
                    }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [0]
        },
        {
            testDescription: "no additional parameters are allowed and inbound signatures indicates non-required parameter",
            oParsedShellHash: {
                "semanticObject": "Object",
"action": "action",
                "params": {} // no parameter specified
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: {
                        parameters: {
                            flag: {} // short notation for required: false
                        },
                        additionalParameters: "notallowed"
                    },
                    resolutionResult: {
                        text: "Currency manager",
                        ui5ComponentName: "Currency.Component",
                        url: "/url/to/currency",
                        applicationType: "URL",
                        additionalInformation: "SAPUI5.Component=Currency.Component"
                    }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [{
                "defaultedParamNames": [],
                "genericSO": false,
                "intentParamsPlusAllDefaults": {},
                "matches": true,
                "matchesVirtualInbound": false,
                "resolutionResult": { },
                "parsedIntent": {
                  "action": "action",
                  "params": {},
                  "semanticObject": "Object"
                },
                "inbound": {
                    "action": "action",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager",
                        "ui5ComponentName": "Currency.Component",
                         "url": "/url/to/currency"
                    },
                    "semanticObject": "Object",
                    "signature": {
                        "additionalParameters": "notallowed",
                        "parameters": {
                            "flag": {}
                        }
                    }
                }
            }]
        },
        {
            testDescription: " defaulted parameters are mapped to same target A->ANew & B renameTo ANew, both defaulted",
            oParsedShellHash: {
                "semanticObject": "Object",
"action": "action",
                "params": { }
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: {
                        parameters: {
                            "A": { "renameTo": "ANew", "defaultValue": { "value": "ADefaulted" } },
                            "B": { "renameTo": "ANew", "defaultValue": { "value": "BDefaulted" }
                                  }
                        },
                        additionalParameters: "allowed"
                    },
                    resolutionResult: {
                        text: "Currency manager",
                        ui5ComponentName: "Currency.Component",
                        url: "/url/to/currency",
                        applicationType: "URL",
                        additionalInformation: "SAPUI5.Component=Currency.Component"
                    }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [{
                "defaultedParamNames": [ "A", "B" ],
                "genericSO": false,
                "intentParamsPlusAllDefaults": {
                    "A": [
                          "ADefaulted"
                    ],
                    "B": [
                          "BDefaulted"
                    ]
                },
                "matches": true,
                "matchesVirtualInbound": false,
                "resolutionResult": { },
                "parsedIntent": {
                  "action": "action",
                  "params": {},
                  "semanticObject": "Object"
                },
                "inbound": {
                    "action": "action",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager",
                        "ui5ComponentName": "Currency.Component",
                         "url": "/url/to/currency"
                    },
                    "semanticObject": "Object",
                    "signature": {
                        parameters: {
                            "A": { "renameTo": "ANew", "defaultValue": { "value": "ADefaulted" } },
                            "B": { "renameTo": "ANew", "defaultValue": { "value": "BDefaulted" }
                                  }
                        },
                        additionalParameters: "allowed"
                    }
                }
            }]
        },
        {
            testDescription: " defaulted parameters are mapped to same target A->ANew & B renameTo ANew, B defaulted, A supplied",
            oParsedShellHash: {
                "semanticObject": "Object",
"action": "action",
                "params": { "A": [ "Avalue"] }
            },
            aInbounds: [
                {
                    semanticObject: "Object",
action: "action",
                    signature: {
                        parameters: {
                            "A": { "renameTo": "ANew"},
                            "B": { "renameTo": "ANew",
                                    "defaultValue": { "value": "BDefaulted" }
                                  }
                        },
                        additionalParameters: "allowed"
                    },
                    resolutionResult: {
                        text: "Currency manager",
                        ui5ComponentName: "Currency.Component",
                        url: "/url/to/currency",
                        applicationType: "URL",
                        additionalInformation: "SAPUI5.Component=Currency.Component"
                    }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [{
                "defaultedParamNames": [],
                "genericSO": false,
                "intentParamsPlusAllDefaults": {
                    "A": [
                          "Avalue"
                         ]
            // B Not present!
                      },
                "matches": true,
                "matchesVirtualInbound": false,
                "resolutionResult": { },
                "parsedIntent": {
                  "action": "action",
                  "params": {
                          "A": [
                                    "Avalue"
                                  ]
                        },
                  "semanticObject": "Object"
                },
                "inbound": {
                    "action": "action",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager",
                        "ui5ComponentName": "Currency.Component",
                         "url": "/url/to/currency"
                    },
                    "semanticObject": "Object",
                    "signature": {
                        parameters: {
                            "A": { "renameTo": "ANew"},
                            "B": { "renameTo": "ANew",
                                    "defaultValue": { "value": "BDefaulted" }
                                  }
                        },
                        additionalParameters: "allowed"
                    }
                }
            }]
        },
        {
            testDescription: "matching tile inbound + bExcludeTileInbounds=false parameter is given",
            oParsedShellHash: { "semanticObject": "Action", "action": "toNewsTile", "params": {} },
            bExcludeTileInbounds: false,
            aInbounds: [
                { // a tile inbound
                    "semanticObject": "Action",
                    "action": "toNewsTile",
                    "title": "News",
                    "resolutionResult": { },
                    "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                    "signature": {
                        "parameters": {},
                        "additionalParameters": "allowed"
                    },
                    "tileResolutionResult": {
                        "isCustomTile": true // filters out the inbound

                        // ... plus irrelevant data for this test...
                    }
                }
            ],
            mockedUserDefaultValues: {},
            expected: [
                { // the same tile inbound
                    "parsedIntent": {
                      "action": "toNewsTile",
                      "params": {},
                      "semanticObject": "Action"
                    },
                    "inbound": {
                        "semanticObject": "Action",
                        "action": "toNewsTile",
                        "title": "News",
                        "resolutionResult": { },
                        "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                        "signature": {
                            "parameters": {},
                            "additionalParameters": "allowed"
                        },
                        "tileResolutionResult": {
                            "isCustomTile": true // filters out the inbound
                        }
                    },
                    "resolutionResult": {},
                    "defaultedParamNames": [],
                    "genericSO": false,
                    "intentParamsPlusAllDefaults": {},
                    "matches": true,
                    "matchesVirtualInbound": false
                }
            ]
        },
        {
            testDescription: "matching tile inbound + bExcludeTileInbounds=true parameter is given",
            oParsedShellHash: { "semanticObject": "Action", "action": "toNewsTile", "params": {} },
            bExcludeTileInbounds: true,
            aInbounds: [
                { // a tile inbound
                    "semanticObject": "Action",
                    "action": "toNewsTile",
                    "title": "News",
                    "resolutionResult": { },
                    "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                    "signature": {
                        "parameters": {},
                        "additionalParameters": "allowed"
                    },
                    "tileResolutionResult": {
                        "isCustomTile": true // filters out the inbound

                        // ... plus irrelevant data for this test...
                    }
                }
            ],
            mockedUserDefaultValues: {},
            expected: []
        }
    ].forEach(function (oFixture) {
        asyncTest("_getMatchingInbounds: works as expected when " + oFixture.testDescription, function () {

            var oSrvc = createService(),
                fnRealGetService = sap.ushell.Container.getService;

            // Mock User Defaults service
            sinon.stub(sap.ushell.Container, "getService", function (sServiceName) {
                if (sServiceName === "UserDefaultParameters") {
                    return { // a fake UserDefaultParameters service
                        getValue: function (sValueName) {
                            return new jQuery.Deferred().resolve({
                                value: oFixture.mockedUserDefaultValues[sValueName]
                            }).promise();
                        }
                    };
                }
                // else
                return fnRealGetService(sServiceName);
            });

            var oIndex = oInboundIndex.createIndex(oFixture.aInbounds);

            oSrvc._getMatchingInbounds(oFixture.oParsedShellHash, oIndex, { bExcludeTileInbounds: oFixture.bExcludeTileInbounds })
                .done(function (aMatchingResults) {
                    ok(true, "promise was resolved");

                    if (!jQuery.isEmptyObject(oFixture.mockedUserDefaultValues)) {
                        ok(sap.ushell.Container.getService.calledWith("UserDefaultParameters"), "the UserDefaultParameters service was invoked");
                    }

                    /*
                     * This test allows to compare inbounds by ids if
                     * integers are specified in the expectation.
                     */
                    if (oFixture.expected.every(function (vArrayItem) {
                        return typeof vArrayItem === "number";
                    })) {
                        // compare only inbound results
                        var aExpectedInbounds = oFixture.expected.map(function (iResultNumber) {
                                return oFixture.aInbounds[iResultNumber];
                            }),
                            aGotInbounds = aMatchingResults.map(function (oMatchResult) {
                                return oMatchResult.inbound;
                            });

                        deepEqual(aGotInbounds, aExpectedInbounds, "match results reference expected inbounds");
                    } else {
                        // compare full result but ignore property originalInbound
                        deepEqual(removeCountsAndSortString(aMatchingResults),
                            oFixture.expected, "got expected matching results");
                    }
                })
                .fail(function () {
                    ok(false, "promise was resolved");
                })
                .always(function () {
                    start();
                });
        });
    });

    [
       {
          testDescription: "one inbound matches",
          oIntent: mkInt("#Action-toappnavsample"),
          aFakeInbounds: [
            mkInb("#Action-toappnavsample")
          ],
          expectedLogHeader: [
            /\[REPORT #1\] Matching Intent 'Action-toappnavsample' to inbounds/,
            /form factor: <any>/
          ],
          expectedLogBody: [
            /#Action-toappnavsample{<no params><\?>}/,
            /No need to resolve references/,
            /rematch was skipped/,
            /Nothing to sort/
          ]
       },
       {
          testDescription: "no inbounds match",
          oIntent: mkInt("#Action-toappnavsample"),
          aFakeInbounds: [
            // nothing
          ],
          expectedLogHeader: [
            /\[REPORT #1\] Matching Intent 'Action-toappnavsample' to inbounds/,
            /form factor: <any>/
          ],
          expectedLogBody: [
            /No inbound was matched/,
            /No need to resolve references/,
            /rematch was skipped/,
            /Nothing to sort/
          ]
       },
       {
          testDescription: "two inbounds with the same name match",
          oIntent: mkInt("#Action-toappnavsample"),
          aFakeInbounds: [
            mkInb("#Action-toappnavsample{[default1:[value1]]}"),
            mkInb("#Action-toappnavsample{[default2:[value2]]}")
          ],
          expectedLogHeader: [
            /\[REPORT #1\] Matching Intent 'Action-toappnavsample' to inbounds/,
            /form factor: <any>/
          ],
          expectedLogBody: [
            /#Action-toappnavsample{\[default1:\[value1\]\]<o>}\n/,
            /#Action-toappnavsample{\[default2:\[value2\]\]<o>}\n/,
            /No need to resolve references/,
            /rematch was skipped \(no references to resolve\)/,
            /Sorted inbounds as follows:/,
            /#Action-toappnavsample{\[default1:\[value1\]\]<o>}.*\n.*#Action-toappnavsample{\[default2:\[value2\]\]<o>}/
          ]
       },
       {
          testDescription: "inbounds with sap priority are reported",
          oIntent: mkInt("#Action-toappnavsample"),
          aFakeInbounds: [
            mkInb("#Action-toappnavsample{[default1:[value1]],[sap-priority:[5]]}"),
            mkInb("#Action-toappnavsample{[default2:[value2]],[sap-priority:[10]]}")
          ],
          expectedLogHeader: [
            /\[REPORT #1\] Matching Intent 'Action-toappnavsample' to inbounds/,
            /form factor: <any>/
          ],
          expectedLogBody: [
            /Sorted inbounds as follows:/,
            /\* 1 \* sap-priority: '10'([\s\S])+\* 1 \* sap-priority: '5'/
          ]
       },
       {
          testDescription: "an inbound with references is resolved",
          oIntent: mkInt("#Action-toappnavsample"),
          aFakeInbounds: [
            mkInb("#Action-toappnavsample{[p1:[@paramName@]]}")
          ],
          expectedLogHeader: [
            /\[REPORT #1\] Matching Intent 'Action-toappnavsample' to inbounds/,
            /form factor: <any>/
          ],
          expectedLogBody: [
            /#Action-toappnavsample{\[p1:\[@paramName@\]\]<o>}\n/,
            /Must resolve the following references:[\s\S]*paramName/,
            /resolved references with the following values:[\s\S]*paramName: 'paramNameValue'/
          ]
       },
       {
          testDescription: "two inbounds with references are matched, but only one is rematched",
          oIntent: mkInt("#Action-toappnavsample?id=aValue"),
          aFakeInbounds: [
            mkInb("#Action-toappnavsample{id:@a@}"), // id resolves to aValue (see test)
            mkInb("#Action-toappnavsample{id:@b@}") // id resolves to bValue (see test)
          ],
          expectedLogHeader: [
            /\[REPORT #1\] Matching Intent 'Action-toappnavsample[?]id=aValue' to inbounds/,
            /form factor: <any>/
          ],
          expectedLogBody: [
            new RegExp([
                "STAGE2: Resolve references",
                "--------------------------",
                "@ Must resolve the following references:",
                " . a",
                " . b",
                ". resolved references with the following values:",
                " . a: 'aValue'",
                " . b: 'bValue'"
            ].join("\n")),
            new RegExp([
                "STAGE3: Rematch with references",
                "-------------------------------",
                "The following inbounds re-matched:",
                " . #Action-toappnavsample{id:@a@<o>}"
            ].join("\n")),
            new RegExp([
                "STAGE4: Sort matched targets",
                "----------------------------",
                "Nothing to sort"
            ].join("\n"))
          ]
       },
       {
          testDescription: "an inbound with reference is matched, but no inbounds are rematched",
          oIntent: mkInt("#Action-toappnavsample?id=aValue"),
          aFakeInbounds: [
            mkInb("#Action-toappnavsample{id:@b@}") // id resolves to bValue (see test)
          ],
          expectedLogHeader: [
            /\[REPORT #1\] Matching Intent 'Action-toappnavsample[?]id=aValue' to inbounds/,
            /form factor: <any>/
          ],
          expectedLogBody: [
            new RegExp([
                "STAGE2: Resolve references",
                "--------------------------",
                "@ Must resolve the following references:",
                " . b",
                ". resolved references with the following values:",
                " . b: 'bValue'"
            ].join("\n")),
            new RegExp([
                "STAGE3: Rematch with references",
                "-------------------------------",
                "- No inbounds re-matched"
            ].join("\n")),
            new RegExp([
                "STAGE4: Sort matched targets",
                "----------------------------",
                "Nothing to sort"
            ].join("\n"))
          ]
       }
    ].forEach(function (oFixture) {
        asyncTest("_getMatchingInbounds: reports inbound search correctly when " + oFixture.testDescription, function () {
            var oSrvc = createService();

            // Stub ReferenceResolver
            var fnGetServiceOrig = sap.ushell.Container.getService;
            sap.ushell.Container.getService = function (sServiceName) {
                if (sServiceName === "ReferenceResolver") {
                    return {
                        resolveReferences: function (aRefs) {
                            return new jQuery.Deferred().resolve(aRefs.reduce(function (oResolvedRefs, sNextRef) {
                                oResolvedRefs[sNextRef] = sNextRef + "Value";
                                return oResolvedRefs;
                            }, {})).promise();
                        }
                    };
                }

                return fnGetServiceOrig.call(sap.ushell.Container, sServiceName);
            };

            // Check logging expectations via LogMock
            sinon.stub(jQuery.sap.log, "debug");
            sinon.stub(jQuery.sap.log, "error");
            sinon.stub(jQuery.sap.log, "warning");

            // getLevel called by CSTR/Logger to determine logging is enabled

            var oIndex = oInboundIndex.createIndex(oFixture.aFakeInbounds);

            sinon.stub(oCSTRUtils, "isDebugEnabled").returns(true);

            oSrvc._getMatchingInbounds(oFixture.oIntent, oIndex, oFixture.oConstraints)
                .done(function (aMatchingResults) {
                    ok(true, "_getMatchingInbounds promise was resolved");
                    strictEqual(jQuery.sap.log.error.callCount, 0, "jQuery.sap.log.error was called 0 times");
                    strictEqual(jQuery.sap.log.warning.callCount, 0, "jQuery.sap.log.warning was called 0 times");
                    strictEqual(jQuery.sap.log.debug.callCount, 1, "jQuery.sap.log.debug was called 1 time");

                    // check that each regexp matches the call argument of debug
                    oFixture.expectedLogHeader.forEach(function (rLog) {
                        var sLogHeader = jQuery.sap.log.debug.getCall(0).args[0];
                        var bMatches = !!sLogHeader.match(rLog);
                        ok(bMatches, rLog.toString() + " was found in the log call." + (
                            bMatches ? "" : "Log header was: " + sLogHeader.replace(/\n/g, "\u21a9") // 21a9 enter key symbol
                        ));
                    });
                    oFixture.expectedLogBody.forEach(function (rLog) {
                        var sLogBody = jQuery.sap.log.debug.getCall(0).args[1];
                        var bMatches = !!sLogBody.match(rLog);
                        ok(bMatches, rLog.toString() + " was found in the log call." + (
                            bMatches ? "" : "Log body was: " + sLogBody.replace(/\n/g, "\u21a9") // 21a9 enter key symbol
                        ));
                    });
                })
                .fail(function () {
                    ok(false, "_getMatchingInbounds promise was resolved");
                })
                .always(function () {
                    start();
                });
        });
    });

    asyncTest("_resolveHashFragment: promise is rejected when navigation target cannot be resolved client side", function () {
        sinon.stub(jQuery.sap.log, "error");
        sinon.stub(jQuery.sap.log, "warning");

        var oSrvc = createService();

        // return empty -> cannot resolve matching targets
        sinon.stub(oSrvc, "_getMatchingInbounds").returns(new jQuery.Deferred().resolve([]).promise());

        oSrvc._resolveHashFragment("#hash-fragment", function () {} /*fallback*/)
            .done(function () {
                ok(false, "Promise was rejected");
            })
            .fail(function (sErrorMsg) {
                ok(true, "Promise was rejected");
                strictEqual(jQuery.sap.log.warning.getCalls().length, 1, "jQuery.sap.log.warning was called once");
                strictEqual(jQuery.sap.log.error.getCalls().length, 0, "jQuery.sap.log.error was not called");
                strictEqual(sErrorMsg, "Could not resolve navigation target", "Rejected with expected message");
            })
            .always(function () {
                start();
            });

    });

    asyncTest("_resolveHashFragment: promise is rejected when _getMatchingInbounds rejects", function () {
        sinon.stub(jQuery.sap.log, "error");
        sinon.stub(jQuery.sap.log, "warning");

        var oSrvc = createService();

        // rejects
        sinon.stub(oSrvc, "_getMatchingInbounds").returns(new jQuery.Deferred().reject("Deliberate failure"));

        oSrvc._resolveHashFragment("#hash-fragment", function () {} /*fallback*/)
            .done(function () {
                ok(false, "Promise was rejected");
            })
            .fail(function (sErrorMsg) {
                ok(true, "Promise was rejected");
                strictEqual(jQuery.sap.log.warning.getCalls().length, 0, "jQuery.sap.log.warning was not called");
                strictEqual(jQuery.sap.log.error.getCalls().length, 1, "jQuery.sap.log.error was called once");
                strictEqual(sErrorMsg, "Deliberate failure", "Rejected with expected message");
            })
            .always(function () {
                start();
            });

    });

    [
        {
            testDescription: "generic semantic object is passed",
            sIntent: "#*-action"
        },
        {
            testDescription: "empty semantic object is passed",
            sIntent: "#-action"
        },
        {
            testDescription: "* is passed in action",
            sIntent: "#Object-*"
        },
        {
            testDescription: "blank is passed in semantic object",
            sCurrentFormFactor: "mobile",
            sIntent: "# -*"
        },
        {
            testDescription: "many blanks are passed in semantic object",
            sCurrentFormFactor: "mobile",
            sIntent: "# -*"
        }
    ].forEach(function (oFixture) {

        asyncTest("_resolveHashFragment: rejects promise when " + oFixture.testDescription, function () {
            var oSrvc = createService();

            sinon.stub(jQuery.sap.log, "error");

            // returns the default parameter names after resolution
            sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                new jQuery.Deferred().resolve({
                    resolutionResult: {} // causes _resolveHashFragment promise to be resolved (in case test fails)
                }).promise()
            );

            sinon.stub(utils, "getFormFactor").returns("desktop");

            oSrvc._resolveHashFragment(oFixture.sIntent)
                .done(function (oResolutionResult) {
                    ok(false, "promise was rejected");
                })
                .fail(function () {
                    ok(true, "promise was rejected");
                    strictEqual(jQuery.sap.log.error.getCalls().length, 1, "jQuery.sap.log.error was called once");

                    ok(jQuery.sap.log.error.getCall(0).args[0].indexOf("Could not parse shell hash") === 0,
                        "logged 'Could not parse shell hash ...'");
                })
                .always(function () {
                    start();
                });
        });
    });


    [
        {
            testName: "no inbounds are defined",
            inbounds: [],
            expectedParameters: { simple: {}, extended: {}}
        },
        {
            testName: "inbounds contain non-overlapping user default placeholders",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { filter: { value: "Some Value1" }, required: false },
                            "withUserDefault1": { filter: { value: "UserDefault.value1", format: "reference" }, required: true },
                            "withUserDefault2": { filter: { value: "UserDefault.value2", format: "reference" }, required: false },
                            "noUserDefault2": { filter: { value: "Some Value2" }, required: false },
                            "withUserDefault3": { filter: { value: "UserDefault.value3", format: "reference" }, required: true }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "Another Value1" }, required: false },
                            "withUserDefault4": { filter: { value: "UserDefault.value4", format: "reference" }, required: true },
                            "withUserDefault5": { filter: { value: "UserDefault.value5", format: "reference" }, required: false },
                            "noUserDefault4": { filter: { value: "Another Value2" }, required: false },
                            "withUserDefault6": { filter: { value: "UserDefault.value6", format: "reference" }, required: true }
                        }
                    }
                }
            ],
            expectedParameters: {
                simple: {"value1": {},
"value2": {},
"value3": {},
"value4": {},
                    "value5": {},
                    "value6": {}},
                extended: {}
            }
        },
        {
            testName: "inbounds contain other types of defaults",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { filter: { value: "Some Value1" }, required: false },
                            "withUserDefault1": { filter: { value: "UserDefault.value1", format: "reference" }, required: true },
                            "withUserDefault2": { filter: { value: "MachineDefault.value2", format: "reference" }, required: false },
                            "noUserDefault2": { filter: { value: "Some Value2" }, required: false },
                            "withUserDefault3": { filter: { value: "UserDefault.value3", format: "reference" }, required: true }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "Another Value1" }, required: false },
                            "withUserDefault4": { filter: { value: "UserDefault.value4", format: "reference" }, required: true },
                            "withUserDefault5": { filter: { value: "SapDefault.value5", format: "reference" }, required: false },
                            "noUserDefault4": { filter: { value: "Another Value2" }, required: false },
                            "withUserDefault6": { filter: { value: "UserDefault.value6", format: "reference" }, required: true }
                        }
                    }
                }
            ],
            expectedParameters: { simple: {"value1": {}, "value3": {}, "value4": {}, "value6": {}}, extended: {}}
        },
        {
            testName: "inbounds contain overlapping user default placeholders",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { filter: { value: "Some Value1" }, required: false },
                            "withUserDefault1": { filter: { value: "UserDefault.value1", format: "reference" }, required: false },
                            "withUserDefault2": { filter: { value: "UserDefault.value3", format: "reference" }, required: false },
                            "noUserDefault2": { filter: { value: "Some Value2" }, required: false },
                            "withUserDefault3": { filter: { value: "UserDefault.value2", format: "reference" }, required: false }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "Another Value1" }, required: false },
                            "withUserDefault4": { filter: { value: "UserDefault.value1", format: "reference" }, required: false },
                            "withUserDefault5": { filter: { value: "UserDefault.value2", format: "reference" }, required: false },
                            "noUserDefault4": { filter: { value: "Another Value2" }, required: false },
                            "withUserDefault6": { filter: { value: "UserDefault.value4", format: "reference" }, required: false }
                        }
                    }
                }
            ],
            expectedParameters: { simple: {"value1": {}, "value2": {}, "value3": {}, "value4": {}}, extended: {}}
        },
        {
            testName: "inbounds contain no user default placeholders",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { filter: { value: "Some Value1" }, required: false },
                            "noUserDefault2": { filter: { value: "Some Value2" }, required: false }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "Another Value1" }, required: false },
                            "noUserDefault4": { filter: { value: "Another Value2" }, required: false }
                        }
                    }
                }
            ],
            expectedParameters: { simple: {}, extended: {}}
        },
        {
            testName: "inbounds contain a mix of filter values and user default values",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { defaultValue: { value: "UserDefault.value1", format: "reference" }, required: false },
                            "noUserDefault2": { filter: { value: "UserDefault.value2", format: "reference" }, required: false }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "UserDefault.value3", format: "reference" }, required: false },
                            "noUserDefault4": { defaultValue: { value: "UserDefault.value4", format: "reference" }, required: false }
                        }
                    }
                }
            ],
            expectedParameters: { simple: { "value1": {}, "value2": {}, "value3": {}, "value4": {}}, extended: {} }
        }
    ].forEach(function (oFixture) {

        asyncTest("getUserDefaultParameterNames: returns default parameter names when " + oFixture.testName, function () {
            var oSrvc = createService({
                    inbounds: oFixture.inbounds
                }),
                oParameterNamesPromise = oSrvc.getUserDefaultParameterNames();

            if (typeof oParameterNamesPromise.done !== "function") {
                ok(false, "getUserDefaultParameterNames returned a promise");
                start();
                return;
            }

            oParameterNamesPromise.done(function (oGotParameterNames) {
                deepEqual(oGotParameterNames, oFixture.expectedParameters, "obtained expected parameter names");
            }).always(function () {
                start();
            });
        });

    });

    asyncTest("getUserDefaultParameterNames: rejects promise when private method throws", function () {
        var oSrvc = createService(),
            oParameterNamesPromise;

        sinon.stub(oSrvc, "_getUserDefaultParameterNames").throws("deliberate exception");

        oParameterNamesPromise = oSrvc.getUserDefaultParameterNames();

        oParameterNamesPromise
            .done(function (oGotParameterNames) {
                ok(false, "promise was rejected");
            })
            .fail(function (sErrorMessage) {
                ok(true, "promise was rejected");
                strictEqual(sErrorMessage, "Cannot get user default parameters from inbounds: deliberate exception", "obtained expected error message");
            })
            .always(function () {
                start();
            });
    });

    [
        {
            testName: "no inbounds are defined",
            inbounds: [],
            expectedParameters: { simple: {}, extended: {}}
        },
        {
            testName: "inbounds contain overlapping extended, not extended",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { filter: { value: "Some Value1" }, required: false },
                            "withUserDefault1": { filter: { value: "UserDefault.extended.value1", format: "reference" }, required: true },
                            "withUserDefault2": { filter: { value: "UserDefault.extended.value2", format: "reference" }, required: false },
                            "noUserDefault2": { filter: { value: "Some Value2" }, required: false },
                            "withUserDefault3": { filter: { value: "UserDefault.value3", format: "reference" }, required: true }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "Another Value1" }, required: false },
                            "withUserDefault4": { filter: { value: "UserDefault.value1", format: "reference" }, required: true },
                            "withUserDefault5": { filter: { value: "UserDefault.value2", format: "reference" }, required: false },
                            "noUserDefault4": { filter: { value: "Another Value2" }, required: false },
                            "withUserDefault6": { filter: { value: "UserDefault.value6", format: "reference" }, required: true }
                        }
                    }
                }
            ],
            expectedParameters: { simple: {"value1": {}, "value2": {}, "value3": {}, "value6": {}}, extended: {"value1": {}, "value2": {}}}
        },
        {
            testName: "inbounds contain other types of defaults",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { filter: { value: "UserDefault.extended.valuex" }, required: false },
                            "withUserDefault1": { filter: { value: "UserDefault.extended.value1", format: "reference" }, required: true },
                            "withUserDefault2": { filter: { value: "MachineDefault.value2", format: "reference" }, required: false },
                            "noUserDefault2": { filter: { value: "Some Value2" }, required: false },
                            "withUserDefault3": { filter: { value: "UserDefault.value3", format: "reference" }, required: true }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "Another Value1" }, required: false },
                            "withUserDefault4": { filter: { value: "UserDefault.value4", format: "reference" }, required: true },
                            "withUserDefault5": { filter: { value: "SapDefault.value5", format: "reference" }, required: false },
                            "noUserDefault4": { filter: { value: "Another Value2" }, required: false },
                            "withUserDefault6": { filter: { value: "UserDefault.value6", format: "reference" }, required: true }
                        }
                    }
                }
            ],
            expectedParameters: { simple: {"value3": {}, "value4": {}, "value6": {}}, extended: {"value1": {}}}
        },
        {
            testName: "inbounds contain overlapping user default placeholders",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { filter: { value: "Some Value1" }, required: false },
                            "withUserDefault1": { filter: { value: "UserDefault.extended.value1", format: "reference" }, required: false },
                            "withUserDefault2": { filter: { value: "UserDefault.extended.value3", format: "reference" }, required: false },
                            "noUserDefault2": { filter: { value: "Some Value2" }, required: false },
                            "withUserDefault3": { filter: { value: "UserDefault.extended.value2", format: "reference" }, required: false }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "Another Value1" }, required: false },
                            "withUserDefault4": { filter: { value: "UserDefault.extended.value1", format: "reference" }, required: false },
                            "withUserDefault5": { filter: { value: "UserDefault.extended.value2", format: "reference" }, required: false },
                            "noUserDefault4": { filter: { value: "Another Value2" }, required: false },
                            "withUserDefault6": { filter: { value: "UserDefault.extended.value4", format: "reference" }, required: false }
                        }
                    }
                }
            ],
            expectedParameters: { simple: {}, extended: {"value1": {}, "value2": {}, "value3": {}, "value4": {}}}
        },
        {
            testName: "inbounds contain no user default placeholders",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { filter: { value: "Some Value1" }, required: false },
                            "noUserDefault2": { filter: { value: "Some Value2" }, required: false }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "Another Value1" }, required: false },
                            "noUserDefault4": { filter: { value: "Another Value2" }, required: false }
                        }
                    }
                }
            ],
            expectedParameters: {simple: {}, extended: {}}
        },
        {
            testName: "inbounds contain a mix of filter values and user default values",
            inbounds: [
                { semanticObject: "SomeObject",
action: "action1",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault1": { defaultValue: { value: "UserDefault.extended.value1", format: "reference" }, required: false },
                            "noUserDefault2": { filter: { value: "UserDefault.value2", format: "reference" }, required: false }
                        }
                    }
                },
                { semanticObject: "SomeObject2",
action: "action2",
                    signature: {
                        additionalParameters: "allowed",
                        parameters: {
                            "noUserDefault3": { filter: { value: "UserDefault.value3", format: "reference" }, required: false },
                            "noUserDefault4": { defaultValue: { value: "UserDefault.extended.value4", format: "reference" }, required: false }
                        }
                    }
                }
            ],
            expectedParameters: {simple: {"value2": {}, "value3": {}}, extended: {"value1": {}, "value4": {}}}
        }

    ].forEach(function (oFixture) {

        asyncTest("getUserDefaultParameterNames: (Extended) returns extended default parameter names when " + oFixture.testName, function () {
            var oSrvc = createService({
                    inbounds: oFixture.inbounds
                }),
                oInboundListPromise = oSrvc.getUserDefaultParameterNames();

            if (typeof oInboundListPromise.done !== "function") {
                ok(false, "getUserDefaultParameterNames returned a promise");
                start();
                return;
            }

            oInboundListPromise.done(function (aObtainedInbounds) {
                deepEqual(aObtainedInbounds, oFixture.expectedParameters, "obtained expected parameter names");
            }).always(function () {
                start();
            });
        });

    });



    [
        {
            testDescription: "legacy parameter is provided",
            sSemanticObject: "Object",
            mBusinessParams: { "country": ["IT"] },
            bIgnoreFormFactor: true,
            bLegacySortParameter: true, // legacy sort parameter
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [
                {
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
"action": "ZZZ",
                       "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": { "parameters": { }, "additionalParameters": "ignored" }
                   }
                },
                { // simulate this result to have higher priority
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
"action": "bbb",
                       "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": { "parameters": {
                        "country": {
                            required: true
                        }
                      }}
                   }
                },
                {
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
"action": "aaa",
                       "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": { "parameters": { }, "additionalParameters": "ignored" }
                   }
                }
            ],
            expectedSemanticObjectLinks: [
                { "intent": "#Object-ZZZ",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                   "shortTitle": "short Title" },
                { "intent": "#Object-aaa",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"},
                { "intent": "#Object-bbb?country=IT",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"}
            ],
            expectedWarningCalls: [
                [
                    "the parameter 'sortResultOnTexts' was experimantal and is no longer supported",
                    "getLinks results will be sorted by 'intent'",
                    "sap.ushell.services.ClientsideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "alphabetical order on priority is expected in result",
            sSemanticObject: "Object",
            mBusinessParams: { "country": ["IT"] },
            bIgnoreFormFactor: true,
            sSortResultsBy: "priority",
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [
                { // simulate this result to have higher priority
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
"action": "bbb",
                       "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": { "parameters": {
                        "country": {
                            required: true
                        }
                      }}
                   }
                },
                {
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
"action": "ccc",
                       "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": { "parameters": { }, "additionalParameters": "ignored" }
                   }
                },
                {
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
"action": "aaa",
                       "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": { "parameters": { }, "additionalParameters": "ignored" }
                   }
                }
            ],
            expectedSemanticObjectLinks: [
                { "intent": "#Object-bbb?country=IT",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"},
                { "intent": "#Object-ccc",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"},
                { "intent": "#Object-aaa",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                   "shortTitle": "short Title" }
            ]
        },
        {
            testDescription: "alphabetical order on intents is expected in result",
            sSemanticObject: "Object",
            mBusinessParams: { "country": ["IT"] },
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [
                { // simulate this result to have higher priority
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
"action": "bbb",
                       "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": { "parameters": {
                        "country": {
                            required: true
                        }
                      }}
                   }
                },
                {
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
"action": "ccc",
                       "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": { "parameters": { }, "additionalParameters": "ignored" }
                   }
                },
                {
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
"action": "aaa",
                       "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": { "parameters": { }, "additionalParameters": "ignored" }
                   }
                }
            ],
            expectedSemanticObjectLinks: [
                { "intent": "#Object-aaa",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                   "shortTitle": "short Title"
                    },
                { "intent": "#Object-bbb?country=IT",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"},
                { "intent": "#Object-ccc",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"}
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "alphabetical order on texts is expected in result",
            sSemanticObject: "Object",
            mBusinessParams: { "country": ["IT"] },
            bIgnoreFormFactor: true,
            sSortResultsBy: "text",
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [
                { // simulate this result to have higher priority
                    "matches": true,
                    "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                    "inbound": {
                        "title": "Currency managerC",
                        "shortTitle": "short Title",
                        "subTitle": "sub Title",
                        "icon": "sap-icon://Fiori2/F0018",
                        "semanticObject": "Object",
"action": "aaa",
                        "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                        "signature": { "parameters": {
                            "country": {
                                required: true
                            }
                        }}
                    }
                },
                {
                    "matches": true,
                    "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                    "inbound": {
                        "title": "Currency managerA",
                        "shortTitle": "short Title",
                        "subTitle": "sub Title",
                        "icon": "sap-icon://Fiori2/F0018",
                        "semanticObject": "Object",
"action": "bbb",
                        "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                        "signature": { "parameters": { }, "additionalParameters": "ignored" }
                    }
                },
                {
                    "matches": true,
                    "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                    "inbound": {
                        "title": "Currency managerB",
                        "shortTitle": "short Title",
                        "subTitle": "sub Title",
                        "icon": "sap-icon://Fiori2/F0018",
                        "semanticObject": "Object",
"action": "ccc",
                        "resolutionResult": { "_original": { "text": "Currency manager" }, "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                        "signature": { "parameters": { }, "additionalParameters": "ignored" }
                    }
                }
            ],
            expectedSemanticObjectLinks: [
                { "intent": "#Object-bbb",
                    "text": "Currency managerA",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"},
                { "intent": "#Object-ccc",
                    "text": "Currency managerB",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title" },
                { "intent": "#Object-aaa?country=IT",
                    "text": "Currency managerC",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title" }
            ]
        },
        {
            // multiple inbounds are filtered in this case as the URL looks the same
            testDescription: "multiple inbounds that look identical are matched",
            sSemanticObject: "Action",
            mBusinessParams: {},
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [
                {
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "shortTitle": "short Title",
                       "subTitle": "sub Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Action",
"action": "actionX",
                       "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": {
                           "parameters": {
                               "mode": {
                                   "required": false,
                                   "defaultValue": { value: "DefaultValue1" } //  ignored in result
                               }
                           }
                       }
                   }
                },
                {
                   "matches": true,
                   "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                   "inbound": {
                       "title": "Currency manager",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Action",
"action": "actionX",
                       "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                       "signature": {
                           "parameters": { } // this inbound has not parameter
                       }
                   }
                }
            ],
            expectedSemanticObjectLinks: [
                { "intent": "#Action-actionX", // note "?" removed from parameter
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"}
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "matching target exists and business parameters are specified",
            sSemanticObject: "Action",
            mBusinessParams: { "ParamName1": "value", "ParamName2": ["value1", "value2"] }, // NOTE: parameters provided
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [{
               // ignore certain fields not needed for the test
               "matches": true,
               "resolutionResult": {
                   "additionalInformation": "SAPUI5.Component=Currency.Component",
                   "applicationType": "URL",
                   "text": "Currency manager",
                   "ui5ComponentName": "Currency.Component",
                   "url": "/url/to/currency?mode=desktop"
               },
               "inbound": {
                   "title": "Currency manager",
                   "icon": "sap-icon://Fiori2/F0018",
                   "shortTitle": "short Title",
                   "subTitle": "sub Title",
                   "semanticObject": "Action",
"action": "action1",
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency"
                   },
                   "signature": {
                       "additionalParameters": "ignored",
                       "parameters": {
                           "mode": {
                               "required": false,
                               "defaultValue": { value: "DefaultValue" } //  ignored in result
                           }
                       }
                   }
               }
            }],
            expectedSemanticObjectLinks: [
                { "intent": "#Action-action1", // only return intent parameters that are mentioned in Inbound
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"}
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "matching target has default parameter that overlaps with intent parameter",
            sSemanticObject: "Action",
            mBusinessParams: { "ParamName1": "value", "ParamName2": ["value1", "value2"] }, // NOTE: parameters provided
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [{
               // ignore certain fields not needed for the test
               "matches": true,
               "resolutionResult": {
                   "additionalInformation": "SAPUI5.Component=Currency.Component",
                   "applicationType": "URL",
                   "text": "Currency manager",
                   "ui5ComponentName": "Currency.Component",
                   "url": "/url/to/currency?mode=desktop"
               },
               "inbound": {
                   "title": "Currency manager",
                   "shortTitle": "short Title",
                   "subTitle": "sub Title",
                   "icon": "sap-icon://Fiori2/F0018",
                   "semanticObject": "Action",
"action": "action1",
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency"
                   },
                   "signature": {
                       "additionalParameters": "ignored",
                       "parameters": {
                           "ParamName1": {
                               "required": false,
                               "defaultValue": { value: "DefaultValue" }
                           }
                       }
                   }
               }
            }],
            expectedSemanticObjectLinks: [
                { "intent": "#Action-action1?ParamName1=value", // only ParamName1 is mentioned in Inbound
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title" }
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "sap-system parameter specified in intent",
            sSemanticObject: "Action",
            mBusinessParams: { "sap-system": ["CC2"] },
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [{
               // ignore certain fields not needed for the test
               "matches": true,
               "resolutionResult": {
                   "additionalInformation": "SAPUI5.Component=Currency.Component",
                   "applicationType": "URL",
                   "text": "Currency manager",
                   "ui5ComponentName": "Currency.Component",
                   "url": "/url/to/currency?mode=desktop"
               },
               "inbound": {
                   "semanticObject": "Action",
"action": "action1",
                   "title": "Currency manager",
                   "icon": "sap-icon://Fiori2/F0018",
                   "shortTitle": "short Title",
                   "subTitle": "sub Title",
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency"
                   },
                   "signature": {
                       "additionalParameters": "ignored",
                       "parameters": {
                           "ParamName1": {
                               "required": false,
                               "defaultValue": { value: "DefaultValue" }
                           }
                       }
                   }
               }
            }],
            expectedSemanticObjectLinks: [
                { "intent": "#Action-action1?sap-system=CC2",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title" }
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "sap-system and other parameters specified in intent (additionalParameters: allowed)",
            sSemanticObject: "Action",
            mBusinessParams: {
                "sap-system": ["CC2"],
                "paramName1": ["paramValue1"],
                "paramName2": ["paramValue2"]
            },
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [{
               // ignore certain fields not needed for the test
               "matches": true,
               "resolutionResult": {
                   "additionalInformation": "SAPUI5.Component=Currency.Component",
                   "applicationType": "URL",
                   "text": "Currency manager",
                   "ui5ComponentName": "Currency.Component",
                   "url": "/url/to/currency?mode=desktop"
               },
               "inbound": {
                   "semanticObject": "Action",
"action": "action1",
                   "title": "Currency manager",
                   "shortTitle": "short Title",
                   "subTitle": "sub Title",
                   "icon": "sap-icon://Fiori2/F0018",
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency"
                   },
                   "signature": {
                       "additionalParameters": "allowed", // non overlapping parameters added to result
                       "parameters": {
                           "paramName1": {
                               "required": false,
                               "defaultValue": { value: "DefaultValue" }
                           }
                       }
                   }
               }
            }],
            expectedSemanticObjectLinks: [
                { "intent": "#Action-action1?paramName1=paramValue1&paramName2=paramValue2&sap-system=CC2",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title" }
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "sap-system and other parameters specified in intent (additionalParameters: ignored)",
            sSemanticObject: "Action",
            mBusinessParams: {
                "sap-system": ["CC2"],
                "paramName1": ["paramValue1"],
                "paramName2": ["paramValue2"]
            },
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [{
               // ignore certain fields not needed for the test
               "matches": true,
               "resolutionResult": {
                   "additionalInformation": "SAPUI5.Component=Currency.Component",
                   "applicationType": "URL",
                   "text": "Currency manager",
                   "ui5ComponentName": "Currency.Component",
                   "url": "/url/to/currency?mode=desktop"
               },
               "inbound": {
                   "title": "Currency manager",
                   "icon": "sap-icon://Fiori2/F0018",
                   "subTitle": "sub Title",
                   "shortTitle": "short Title",
                   "semanticObject": "Action",
"action": "action1",
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency"
                   },
                   "signature": {
                       "additionalParameters": "ignored",
                       "parameters": {
                           "paramName1": {
                               "required": false,
                               "defaultValue": { value: "DefaultValue" }
                           }
                       }
                   }
               }
            }],
            expectedSemanticObjectLinks: [
                { "intent": "#Action-action1?paramName1=paramValue1&sap-system=CC2",
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title" }
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "matching target has required parameter that overlaps with intent parameter",
            sSemanticObject: "Action",
            mBusinessParams: { "ParamName1": "value", "ParamName2": ["value1", "value2"] }, // NOTE: parameters provided
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [{
               // ignore certain fields not needed for the test
               "matches": true,
               "resolutionResult": {
                   "additionalInformation": "SAPUI5.Component=Currency.Component",
                   "applicationType": "URL",
                   "text": "Currency manager",
                   "ui5ComponentName": "Currency.Component",
                   "url": "/url/to/currency?mode=desktop"
               },
               "inbound": {
                   "title": "Currency manager",
                   "subTitle": "sub Title",
                   "shortTitle": "short Title",
                   "icon": "sap-icon://Fiori2/F0018",
                   "semanticObject": "Action",
"action": "action1",
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency"
                   },
                   "signature": {
                       "additionalParameters": "ignored",
                       "parameters": {
                           "ParamName2": {
                               "required": true
                           }
                       }
                   }
               }
            }],
            expectedSemanticObjectLinks: [
                { "intent": "#Action-action1?ParamName2=value1&ParamName2=value2", // only ParamName2 is mentioned in Inbound
                    "text": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title" }
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "function called with * semantic object",
            sSemanticObject: "*",
            mBusinessParams: { "ParamName1": "value", "ParamName2": ["value1", "value2"] }, // NOTE: parameters provided
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [{ // a inbound with generic semantic object
               "matches": true,
               "resolutionResult": {
                   "additionalInformation": "SAPUI5.Component=Currency.Component",
                   "applicationType": "URL",
                   "text": "Currency manager",
                   "ui5ComponentName": "Currency.Component",
                   "url": "/url/to/currency?mode=desktop"
               },
               "inbound": {
                   "title": "Currency manager",
                   "subTitle": "sub Title",
                   "shortTitle": "short Title",
                   "icon": "sap-icon://Fiori2/F0018",
                   "semanticObject": "*",
                   "action": "action",
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency"
                   },
                   "signature": {
                       "parameters": {
                           "mode": {
                               "required": false,
                               "defaultValue": { value: "DefaultValue" } //  ignored in result
                           }
                       }
                   }
               }
            }],
            expectedSemanticObjectLinks: [], // Inbound should be filtered out
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "function called with empty string semantic object",
            sSemanticObject: "", // should match all
            mBusinessParams: { "ParamName1": "value", "ParamName2": ["value1", "value2"] }, // NOTE: parameters provided
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [{ // a inbound with generic semantic object
               "matches": true,
               "resolutionResult": {
                   "additionalInformation": "SAPUI5.Component=Currency.Component",
                   "applicationType": "URL",
                   "text": "Currency manager",
                   "ui5ComponentName": "Currency.Component",
                   "url": "/url/to/currency?mode=desktop"
               },
               "inbound": {
                   "title": "Currency manager",
                   "subTitle": "sub Title",
                   "shortTitle": "short Title",
                   "icon": "sap-icon://Fiori2/F0018",
                   "semanticObject": "*",
                   "action": "action",
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency"
                   },
                   "signature": {
                       "parameters": {
                           "mode": {
                               "required": false,
                               "defaultValue": { value: "DefaultValue" } //  ignored in result
                           }
                       }
                   }
               }
            }],
            expectedSemanticObjectLinks: [], // Inbound should be filtered out
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "hideIntentLink is set to true",
            sSemanticObject: "Object",
            mBusinessParams: {},
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [
                { // has no hideIntentLink
                   "matches": true,
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager A",
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency?mode=desktop"
                   },
                   "inbound": {
                       // NOTE: no hideIntentLink set
                       "title": "Currency manager A",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
                       "action": "actionA",
                       "resolutionResult": {
                           "additionalInformation": "SAPUI5.Component=Currency.Component",
                           "applicationType": "URL",
                           "text": "Currency manager A",
                           "ui5ComponentName": "Currency.Component",
                           "url": "/url/to/currency"
                       },
                       "signature": { "parameters": { } }
                   }
                },
                { // same as the previous inbound but with hideIntentLink set
                   "matches": true,
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager B",
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency?mode=desktop"
                   },
                   "inbound": {
                       "hideIntentLink": true, // NOTE: this should be hidden in the result!
                       "title": "Currency manager B",
                       "subTitle": "sub Title",
                       "shortTitle": "short Title",
                       "semanticObject": "Object",
                       "action": "actionB",
                       "resolutionResult": {
                           "additionalInformation": "SAPUI5.Component=Currency.Component",
                           "applicationType": "URL",
                           "text": "Currency manager B",
                           "ui5ComponentName": "Currency.Component",
                           "url": "/url/to/currency"
                       },
                       "signature": { "parameters": { } }
                   }
                }
            ],
            expectedSemanticObjectLinks: [
                {
                    "intent": "#Object-actionA",
                    "text": "Currency manager A",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"
                }
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        },
        {
            testDescription: "app state is provided as member",
            sSemanticObject: "Object",
            mBusinessParams: { "ab": 1},
            sAppStateKey: "AS12345",
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            aMockedResolutionResults: [
                { // has no hideIntentLink
                   "matches": true,
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "URL",
                       "text": "Currency manager A",
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency?mode=desktop"
                   },
                   "inbound": {
                       // NOTE: no hideIntentLink set
                       "title": "Currency manager A",
                       "shortTitle": "short Title",
                       "subTitle": "sub Title",
                       "icon": "sap-icon://Fiori2/F0018",
                       "semanticObject": "Object",
                       "action": "actionA",
                       "resolutionResult": {
                           "additionalInformation": "SAPUI5.Component=Currency.Component",
                           "applicationType": "URL",
                           "text": "Currency manager A",
                           "ui5ComponentName": "Currency.Component",
                           "url": "/url/to/currency"
                       },
                       "signature": { "parameters": { "ab": { required: true } } }
                   }
                }
            ],
            expectedSemanticObjectLinks: [
                {
                    "intent": "#Object-actionA?ab=1&sap-xapp-state=AS12345",
                    "text": "Currency manager A",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title"
                }
            ],
            expectedWarningCalls: [
                [
                    "Passing positional arguments to getLinks is deprecated",
                    "Please use nominal arguments instead",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            ]
        }
    ].forEach(function (oFixture) {

        asyncTest("getLinks: returns expected inbounds when " + oFixture.testDescription, function () {

            var oSrvc = createService();

            sinon.stub(jQuery.sap.log, "warning");
            sinon.stub(jQuery.sap.log, "error");

            // Mock form factor
            sinon.stub(utils, "getFormFactor").returns(oFixture.sCurrentFormFactor);

            // Mock getMatchingInbounds
            sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                new jQuery.Deferred().resolve(oFixture.aMockedResolutionResults).promise()
            );

            if (oFixture.hasOwnProperty("sAction")) {
                // test 1.38.0+ behavior
                oSrvc.getLinks({
                    semanticObject: oFixture.sSemanticObject,
                    action: oFixture.sAction,
                    params: oFixture.mBusinessParams,
                    appStateKey: oFixture.sAppStateKey,
                    ignoreFormFactor: oFixture.bIgnoreFormFactor
                }).done(function (aResultSemanticObjectLinks) {
                        // Assert
                        ok(true, "promise was resolved");
                        deepEqual(aResultSemanticObjectLinks, oFixture.expectedSemanticObjectLinks, "got expected array of semantic object links");

                        testExcludeTileIntentArgument(oSrvc, true);
                    })
                    .fail(function () {
                        // Assert
                        ok(false, "promise was rejected");
                    })
                    .always(function () {
                        testExpectedErrorAndWarningCalls(oFixture);
                        start();
                    });
            } else if (oFixture.sSortResultsBy || oFixture.bLegacySortParameter) {
                // test internal flag for sorting result on texts
                var oGetLinksCallArgs = {
                    semanticObject: oFixture.sSemanticObject,
                    params: oFixture.mBusinessParams,
                    appStateKey: oFixture.sAppStateKey,
                    ignoreFormFactor: oFixture.bIgnoreFormFactor
                };

                if (oFixture.sSortResultsBy) {
                    oGetLinksCallArgs.sortResultsBy = oFixture.sSortResultsBy;
                }
                if (oFixture.bLegacySortParameter) {
                    oGetLinksCallArgs.sortResultOnTexts = oFixture.bLegacySortParameter;
                }

                oSrvc.getLinks(oGetLinksCallArgs)
                    .done(function (aResultSemanticObjectLinks) {
                        // Assert
                        ok(true, "promise was resolved");
                        deepEqual(aResultSemanticObjectLinks, oFixture.expectedSemanticObjectLinks, "got expected array of semantic object links");

                        testExcludeTileIntentArgument(oSrvc, true);
                    })
                    .fail(function () {
                        // Assert
                        ok(false, "promise was rejected");
                    })
                    .always(function () {
                        testExpectedErrorAndWarningCalls(oFixture);
                        start();
                    });
            } else {
                // test old style call and the new style call return the same results
                var mBusinessParamsAmended = jQuery.extend(true, {}, oFixture.mBusinessParams);
                if (oFixture.sAppStateKey) {
                    mBusinessParamsAmended["sap-xapp-state"] = [ oFixture.sAppStateKey ];
                }
                oSrvc.getLinks(oFixture.sSemanticObject, mBusinessParamsAmended, oFixture.bIgnoreFormFactor)
                    .done(function (aResultSemanticObjectLinksOld) {
                        ok(true, "positional parameters call promise was resolved");

                        testExcludeTileIntentArgument(oSrvc, true);
                        oSrvc._getMatchingInbounds.reset(); // testExcludeTileIntentArgument called later again

                        oSrvc.getLinks({
                            semanticObject: oFixture.sSemanticObject,
                            params: oFixture.mBusinessParams,
                            appStateKey: oFixture.sAppStateKey,
                            ignoreFormFactor: oFixture.bIgnoreFormFactor
                        }).done(function (aResultSemanticObjectLinksNew) {
                            ok(true, "nominal parameters call promise was resolved");

                            testExcludeTileIntentArgument(oSrvc, true);

                            deepEqual(aResultSemanticObjectLinksNew, aResultSemanticObjectLinksOld,
                                "the new call with nominal parameters returns the same result as the call with positional parameters");

                            deepEqual(aResultSemanticObjectLinksNew, oFixture.expectedSemanticObjectLinks,
                                "the new call with positional parameters returns the expected results");

                            deepEqual(aResultSemanticObjectLinksOld, oFixture.expectedSemanticObjectLinks,
                                "the old call with positional parameters returns the expected results");

                        }).fail(function () {
                            ok(false, "nominal parameters call promise was resolved");
                        }).always(function () {
                            testExpectedErrorAndWarningCalls(oFixture);
                        });
                    })
                    .fail(function () {
                        // Assert
                        ok(false, "positional parameters call promise was resolved");
                    })
                    .always(function () {
                        start();
                    });
            }

        });
    });

    // Test getLinks( ... ) called with 'tags' constraints
    QUnit.test("getLinks: propagates the tags argument to _getLinks, then to _getMatchingInbounds", function (assert) {
        var fnDone = assert.async();
        var oCSTRService = createService();

        sinon.spy(oCSTRService, "_getLinks");
        sinon.stub(oCSTRService, "_getMatchingInbounds").returns(jQuery.when([ ]));

        oCSTRService.getLinks({
            semanticObject: "Action",
            tags: [
                "tag-A",
                "tag-B",
                "tag-C"
            ] })
                .then(function () {
                    assert.ok(oCSTRService._getLinks.calledOnce, "Calling getLinks consequently calls _getLinks internally");
                    assert.deepEqual(oCSTRService._getLinks.getCall(0).args[0].tags, [
                        "tag-A",
                        "tag-B",
                        "tag-C"
                    ], "_getLinks is called with tags");

                    assert.ok(oCSTRService._getMatchingInbounds.calledOnce, "Calling getLinks consequently calls _getMatchingInbounds internally");
                    assert.deepEqual(oCSTRService._getMatchingInbounds.getCall(0).args[2].tags, [
                        "tag-A",
                        "tag-B",
                        "tag-C"
                    ], "_getMatchingInbounds is called with tags");
                })
                .then(function () {
                    oCSTRService._getLinks.restore();
                    oCSTRService._getMatchingInbounds.restore();
                    return;
                })
                .then(fnDone, fnDone);
    });

    (function () {
        var oBaseInboundGUI = {
            "semanticObject": "GUI",
            "action": "display",
            "title": "Change Actual Assessment Cycle G/L",
            "icon": "sap-icon://Fiori2/F0021",
            "resolutionResult": {
                "sap.gui": {
                    "_version": "1.2.0",
                    "transaction": "FAGLGA12"
                },
                "applicationType": "TR",
                "systemAlias": "",
                "text": "Change Actual Assessment Cycle G/L"
            },
            "deviceTypes": {
                "desktop": true,
                "tablet": false,
                "phone": false
            },
            "signature": {
                "additionalParameters": "ignored",
                "parameters": {}
            },
            "tileResolutionResult": {
                "title": "Change Actual Assessment Cycle G/L",
                "icon": "sap-icon://Fiori2/F0021",
                "tileComponentLoadInfo": "#Shell-staticTile",
                "technicalInformation": "FAGLGA12",
                "isCustomTile": false
            }
        };
        var oBaseInboundWDA = {
            "semanticObject": "WDA",
            "action": "display",
            "title": "Statistical Key Figures",
            "info": "Accessible",
            "icon": "sap-icon://Fiori2/F0021",
            "subTitle": "Actuals",
            "resolutionResult": {
                "sap.wda": {
                    "_version": "1.2.0",
                    "applicationId": "FIS_FPM_OVP_STKEYFIGITEMCO",
                    "configId": "FIS_FPM_OVP_STKEYFIGITEMCO"
                },
                "applicationType": "WDA",
                "systemAlias": "",
                "systemAliasSemantics": "apply",
                "text": "Statistical Key Figures"
            },
            "deviceTypes": { "desktop": true, "tablet": false, "phone": false },
            "signature": {
                "additionalParameters": "allowed",
                "parameters": {}
            },
            "tileResolutionResult": {
                "title": "Statistical Key Figures",
                "subTitle": "Actuals",
                "icon": "sap-icon://Fiori2/F0021",
                "info": "Accessible",
                "tileComponentLoadInfo": "#Shell-staticTile",
                "description": "Accessible",
                "technicalInformation": "FIS_FPM_OVP_STKEYFIGITEMCO",
                "isCustomTile": false
            }
        };
        var oBaseInboundUI5 = {
            "semanticObject": "SemanticObject",
            "action": "action",
            "title": "Title",
            "resolutionResult": {
                "applicationType": "SAPUI5",
                "additionalInformation": "SAPUI5.Component=sap.ushell.demo.Inbound",
                "text": "Text",
                "ui5ComponentName": "sap.ushell.demo.Inbound",
                "applicationDependencies": {
                    "name": "sap.ushell.demo.Inbound",
                    "self": {
                        "name": "sap.ushell.demo.Inbound"
                    }
                },
                "url": "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/AppNavSample",
                "systemAlias": ""
            },
            "deviceTypes": {
                "desktop": true,
                "tablet": true,
                "phone": true
            },
            "signature": {
                "additionalParameters": "allowed",
                "parameters": {}
            }
        };
        var oTestInbounds = {
            "wda": jQuery.extend(true, {}, oBaseInboundWDA),
            "gui": jQuery.extend(true, {}, oBaseInboundGUI),
            "basic": jQuery.extend(true, {}, oBaseInboundUI5, {
                semanticObject: "Object",
                action: "action",
                tileResolutionResult: {
                    "key": "valueBasic", // any tileResolutionResult
                    navigationMode: "embedded",
                    startupParameters: {}
                }
            }),
            "with_required_parameter_filter_value": jQuery.extend(true, {}, oBaseInboundUI5, {
                semanticObject: "Object",
                action: "withParameters",
                tileResolutionResult: {
                    "key": "valueRequired",
                    navigationMode: "embedded",
                    startupParameters: {
                        "P1": ["V1"]
                    }
                },
                signature: {
                    "additionalParameters": "notallowed",
                    "parameters": {
                        "P1": {
                            required: true,
                            filter: { value: "V1" }
                        },
                        "PTOBERENAMED": {
                            renameTo: "IWASRENAMED"
                        }
                    }
                }
            }),
             "with_required_parameter_filter_valueAndRename": jQuery.extend(true, {}, oBaseInboundUI5, {
                semanticObject: "Object",
                action: "withParameters",
                tileResolutionResult: {
                    "key": "valueRequired",
                    navigationMode: "embedded",
                    startupParameters: {
                        "P1": ["V1"],
                        "IWASRENAMED": ["V2"]
                    }
                },
                signature: {
                    "additionalParameters": "notallowed",
                    "parameters": {
                        "P1": {
                            required: true,
                            filter: { value: "V1" }
                        },
                        "PTOBERENAMED": {
                            renameTo: "IWASRENAMED"
                        }
                    }
                }
            })
        };

        [
            {
                testType: "success", // the scenario under test
                testDescription: "no parameters inbound with tileResolutionResult section is provided",
                sIntent: "#Object-action",
                aInbounds: [oTestInbounds.basic],
                expectedResolutionResult: oTestInbounds.basic.tileResolutionResult
            },
            {
                testType: "success",
                testDescription: "inbound with parameters and tileResolutionResult section is provided",
                sIntent: "#Object-withParameters?P1=V1",
                aInbounds: [
                    oTestInbounds.basic,
                    oTestInbounds.with_required_parameter_filter_value
                ],
                expectedResolutionResult: oTestInbounds.with_required_parameter_filter_value.tileResolutionResult
            },
            {
                testType: "success",
                testDescription: "inbound with parameters and tileResolutionResult section is provided an rename to parameter is provided",
                sIntent: "#Object-withParameters?P1=V1&PTOBERENAMED=V2",
                aInbounds: [
                    oTestInbounds.basic,
                    oTestInbounds.with_required_parameter_filter_value
                ],
                expectedResolutionResult: oTestInbounds.with_required_parameter_filter_valueAndRename.tileResolutionResult
            },
            {
                testType: "success",
                testDescription: "wda target is provided",
                sIntent: "#WDA-display",
                aInbounds: [
                    oTestInbounds.wda
                ],
                expectedResolutionResult: jQuery.extend(true, {
                    navigationMode: "newWindowThenEmbedded",
                    startupParameters: undefined
                }, oTestInbounds.wda.tileResolutionResult)
            },
            {
                testType: "success",
                testDescription: "gui target is provided",
                sIntent: "#GUI-display",
                aInbounds: [
                    oTestInbounds.gui
                ],
                expectedResolutionResult: jQuery.extend(true, {
                    navigationMode: "newWindowThenEmbedded",
                    startupParameters: undefined
                }, oTestInbounds.gui.tileResolutionResult)
            },
            {
                testType: "failure",
                testDescription: "invalid shell hash passed",
                sIntent: "#ObjectwithParameters?P1=V1",
                aInbounds: [],
                expectedRejectMessage: "Cannot parse shell hash",
                expectedErrorCallArgs: [
                    "Could not parse shell hash '#ObjectwithParameters?P1=V1'",
                    "please specify a valid shell hash",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            },
            {
                testType: "failure",
                testDescription: "_getMatchingInbounds fails",
                testSimulateFailingGetMatchingInbounds: true,
                sIntent: "#Object-action",
                aInbounds: [],
                expectedRejectMessage: "Deliberate failure",
                expectedErrorCallArgs: [
                    "Could not resolve #Object-action",
                    "_getMatchingInbounds promise rejected with: Deliberate failure",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            },
            {
                testType: "failure",
                testDescription: "there are no matching targets",
                sIntent: "#Object-action",
                aInbounds: [], // deliberately provide empty inbounds here
                expectedRejectMessage: "No matching targets found",
                expectedWarningCallArgs: [
                    "Could not resolve #Object-action",
                    "no matching targets were found",
                    "sap.ushell.services.ClientSideTargetResolution"
                ]
            }
        ].forEach(function (oFixture) {
            asyncTest("resolveTileIntent resolves as expected when " + oFixture.testDescription, function () {

                var aFixtureInboundsClone = oFixture.aInbounds.map(function (oInbound) {
                    return jQuery.extend(true, {}, oInbound);
                });

                var oSrvc = createService({
                    adapter: {
                        hasSegmentedAccess: false,
                        resolveSystemAlias: function (sSystemAlias) {
                            if (sSystemAlias === "") {
                                return new jQuery.Deferred().resolve(O_LOCAL_SYSTEM_ALIAS).promise();
                            }
                            throw new Error("Test does not mock resolving other system aliases than the local system alias");
                        },
                        getInbounds: sinon.stub().returns(new jQuery.Deferred().resolve(oFixture.aInbounds).promise())
                    }
                });

                if (oFixture.testSimulateFailingGetMatchingInbounds) {
                    sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                        new jQuery.Deferred().reject("Deliberate failure").promise()
                    );
                }

                var oMockedServices = { // NOTE: any service that is not in this object is not allowed
                    AppState: true,
                    URLParsing: true,
                    ShellNavigation: {
                        compactParams: function () { return new jQuery.Deferred().resolve({}).promise(); }
                    },
                    UserInfo: {
                        getUser: sinon.stub().returns({
                            getLanguage: sinon.stub().returns("DE")
                        })
                    }
                };
                var fnGetServiceOrig = sap.ushell.Container.getService;
                sinon.stub(sap.ushell.Container, "getService", function (sName) {
                    if (!oMockedServices.hasOwnProperty(sName)) {
                        ok(false, "Test is not accessing " + sName);
                    }

                    // return the result of the real service call
                    if (oMockedServices[sName] === true) {
                        return fnGetServiceOrig.call(sap.ushell.Container, sName);
                    }

                    // return mocked service
                    return oMockedServices[sName];
                });

                sinon.stub(jQuery.sap.log, "warning");
                sinon.stub(jQuery.sap.log, "error");

                oSrvc.resolveTileIntent(oFixture.sIntent)
                    .done(function (oResolvedTileIntent) {
                        if (oFixture.testType === "failure") {
                            ok(false, "promise was rejected");

                        } else {
                            ok(true, "promise was resolved");

                            deepEqual(oResolvedTileIntent, oFixture.expectedResolutionResult,
                                "obtained the expected resolution result");
                        }
                    })
                    .fail(function (sError) {
                        if (oFixture.testType === "failure") {
                            ok(true, "promise was rejected");

                            strictEqual(sError, oFixture.expectedRejectMessage,
                                "obtained the expected error message");

                            // warnings
                            if (!oFixture.expectedWarningCallArgs) {
                                strictEqual(jQuery.sap.log.warning.getCalls().length, 0,
                                    "jQuery.sap.log.warning was not called");
                            } else {
                                strictEqual(jQuery.sap.log.warning.getCalls().length, 1,
                                    "jQuery.sap.log.warning was called 1 time");

                                deepEqual(
                                    jQuery.sap.log.warning.getCall(0).args,
                                    oFixture.expectedWarningCallArgs,
                                    "jQuery.sap.log.warning was called with the expected arguments"
                                );
                            }

                            // errors
                            if (!oFixture.expectedErrorCallArgs) {
                                strictEqual(jQuery.sap.log.error.getCalls().length, 0,
                                    "jQuery.sap.log.error was not called");
                            } else {
                                strictEqual(jQuery.sap.log.error.getCalls().length, 1,
                                    "jQuery.sap.log.error was called 1 time");

                                deepEqual(
                                    jQuery.sap.log.error.getCall(0).args,
                                    oFixture.expectedErrorCallArgs,
                                    "jQuery.sap.log.error was called with the expected arguments"
                                );
                            }

                        } else {
                            ok(false, "promise was resolved without " + sError);
                        }
                    })
                    .always(function () {
                        deepEqual(oFixture.aInbounds, aFixtureInboundsClone,
                            "inbounds provided by getInbounds are not modified by resolveTileIntent");

                        start();
                    });
            });
        });
    })();

//##

(function () {
    /*
     * Complete test for getLinks
     */
    var oTestInbounds = {
       "ui5InboundWithEmptyURL": {
           "semanticObject": "Action",
           "action": "toui5nourl",
           "id": "Action-toui5nourl~6r8",
           "title": "UI5 Target without URL",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "sap-icon://Fiori2/F0018",
           "resolutionResult": {
               "applicationType": "SAPUI5",
               "additionalInformation": "SAPUI5.Component=sap.ushell.demo.AppNavSample",
               "text": "No URL",
               "ui5ComponentName": "sap.ushell.demo.AppNavSample",
               "applicationDependencies": {
                   "name": "sap.ushell.demo.AppNavSample",
                   "self": {
                       "name": "sap.ushell.demo.AppNavSample"
                   }
               },
               "url": "", // NOTE: no URL!
               "systemAlias": ""
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "allowed",
               "parameters": {}
           },
           "compactSignature": "<no params><+>"
       },
       "noParamsNoAdditionalAllowed": {
           "semanticObject": "Action",
           "action": "toappnavsample",
           "id": "Action-toappnavsample~6r8",
           "title": "App Navigation Sample 1",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "sap-icon://Fiori2/F0018",
           "resolutionResult": {
               "applicationType": "SAPUI5",
               "additionalInformation": "SAPUI5.Component=sap.ushell.demo.AppNavSample",
               "text": "App Navigation Sample 1",
               "ui5ComponentName": "sap.ushell.demo.AppNavSample",
               "applicationDependencies": {
                   "name": "sap.ushell.demo.AppNavSample",
                   "self": {
                       "name": "sap.ushell.demo.AppNavSample"
                   }
               },
               "url": "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/AppNavSample",
               "systemAlias": ""
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "ignored",
               "parameters": {}
           },
           "compactSignature": "<no params><+>"
       },
       "noParamsAdditionalAllowed": {
           "semanticObject": "Action",
           "action": "toappnavsample",
           "id": "Action-toappnavsample~6r8",
           "title": "App Navigation Sample 1",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "sap-icon://Fiori2/F0018",
           "resolutionResult": {
               "applicationType": "SAPUI5",
               "additionalInformation": "SAPUI5.Component=sap.ushell.demo.AppNavSample",
               "text": "App Navigation Sample 1",
               "ui5ComponentName": "sap.ushell.demo.AppNavSample",
               "applicationDependencies": {
                   "name": "sap.ushell.demo.AppNavSample",
                   "self": {
                       "name": "sap.ushell.demo.AppNavSample"
                   }
               },
               "url": "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/AppNavSample",
               "systemAlias": ""
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "allowed",
               "parameters": {}
           },
           "compactSignature": "<no params><+>"
       },
       "requiredParamWithDefaultRenamed": {
           "semanticObject": "Action",
           "action": "parameterRename",
           "id": "Action-parameterRename~67xE",
           "title": "Parameter Rename",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "Parameter Rename icon",
           "resolutionResult": {
               "applicationType": "SAPUI5",
               "additionalInformation": "SAPUI5.Component=sap.ushell.demo.ReceiveParametersTestApp",
               "text": "Display received parameters (Case 3, Collision)",
               "ui5ComponentName": "sap.ushell.demo.ReceiveParametersTestApp",
               "applicationDependencies": {
                   "name": "sap.ushell.demo.ReceiveParametersTestApp",
                   "self": {
                       "name": "sap.ushell.demo.ReceiveParametersTestApp"
                   }
               },
               "url": "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/ReceiveParametersTestApp",
               "systemAlias": ""
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "allowed",
               "parameters": {
                   "PREQ": {
                       "required": true
                   },
                   "P1": {
                       "renameTo": "P2New",
                       "required": false
                   },
                   "P2": {
                       "renameTo": "P2New",
                       "required": false
                   }
               }
           },
           "compactSignature": "Case:3;[Description:[P1-> P2New; P2-> P2New]];[P1:];[P2:]<+>"
       },
       "noParamsAllowed": {
           "semanticObject": "Action",
           "action": "noparametersAllowed",
           "id": "Action-parameterRename~67xE",
           "title": "No parameters allowed",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "No parameters allowed icon",
           "resolutionResult": {
               "applicationType": "SAPUI5",
               "additionalInformation": "SAPUI5.Component=sap.ushell.demo.ReceiveParametersTestApp",
               "text": "Display received parameters (Case 3, Collision)",
               "ui5ComponentName": "sap.ushell.demo.ReceiveParametersTestApp",
               "applicationDependencies": {
                   "name": "sap.ushell.demo.ReceiveParametersTestApp",
                   "self": {
                       "name": "sap.ushell.demo.ReceiveParametersTestApp"
                   }
               },
               "url": "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/ReceiveParametersTestApp",
               "systemAlias": ""
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "notallowed",
               "parameters": {}
           },
           "compactSignature": "Case:3;[Description:[P1-> P2New; P2-> P2New]];[P1:];[P2:]<+>"
       },
       "ignoredParamsAndDefaultParameter": {
           "semanticObject": "Object",
           "action": "ignoredParameters",
           "id": "Action-parameterRename~67xE",
           "title": "No parameters allowed",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "No parameters allowed icon",
           "resolutionResult": {
               "applicationType": "SAPUI5",
               "additionalInformation": "SAPUI5.Component=sap.ushell.demo.ReceiveParametersTestApp",
               "text": "Ignored parameters",
               "ui5ComponentName": "sap.ushell.demo.ReceiveParametersTestApp",
               "applicationDependencies": {
                   "name": "sap.ushell.demo.ReceiveParametersTestApp",
                   "self": {
                       "name": "sap.ushell.demo.ReceiveParametersTestApp"
                   }
               },
               "url": "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/ReceiveParametersTestApp",
               "systemAlias": ""
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "ignored",
               "parameters": {
                   "P1": {
                       "required": false,
                       "defaultValue": {
                           format: "plain",
                           value: "DEFV"
                       }
                   }
               }
           },
           "compactSignature": "Case:3;[Description:[P1-> P2New; P2-> P2New]];[P1:];[P2:]<+>"
       },
       "starAction": {
           "semanticObject": "ActionStar",
           "action": "*", // <- should be never returned in a getLinks call!
           "id": "Star-*~683P",
           "title": "Target Mapping with * as action",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "icon with * as action",
           "resolutionResult": {
               "applicationType": "URL",
               "additionalInformation": "",
               "text": "StarAction",
               "url": "http://www.google.com",
               "systemAlias": ""
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "allowed",
               "parameters": {}
           },
           "compactSignature": "<no params><+>"
       },
       "starSemanticObject": {
           "semanticObject": "*", // <- should be never returned in a getLinks call!
           "action": "starSemanticObject",
           "id": "Star-*~683P",
           "title": "Target Mapping with * as semanticObject",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "icon with * as semanticObject",
           "resolutionResult": {
               "applicationType": "URL",
               "additionalInformation": "",
               "text": "StarAction",
               "url": "http://www.google.com",
               "systemAlias": ""
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "allowed",
               "parameters": {}
           },
           "compactSignature": "<no params><+>"
       },
       "twoDefaultParametersAdditionalAllowed": {
           "semanticObject": "Object",
           "action": "twoDefaultParameters",
           "title": "Two Default Parameters",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "Two Default Parameters icon",
           "resolutionResult": { /* doesn't matter */ },
           "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
           "signature": {
               "additionalParameters": "allowed",
               "parameters": {
                  "P1": { defaultValue: { value: "V1" } },
                  "P2": { defaultValue: { value: "V2" } }
               }
           }
       },
       "threeDefaultParametersAdditionalAllowed": {
           "semanticObject": "Object",
           "action": "threeDefaultParameters",
           "title": "Three Default Parameters",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "Three Default Parameters icon",
           "resolutionResult": { /* doesn't matter */ },
           "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
           "signature": {
               "additionalParameters": "allowed",
               "parameters": {
                  "P1": { defaultValue: { value: "V1" } },
                  "P2": { defaultValue: { value: "V2" } },
                  "P3": { defaultValue: { value: "V3" } }
               }
           }
       },
       "appWithUI5": {
           "semanticObject": "PickTechnology",
           "action": "pickTech",
           "id": "PickTechnology",
           "title": "Pick Technology (UI5)",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "Pick Technology (UI5) icon",
           "resolutionResult": {
               "applicationType": "SAPUI5",
               "additionalInformation": "SAPUI5.Component=sap.ushell.demo.ReceiveParametersTestApp",
               "text": "Ignored parameters",
               "ui5ComponentName": "sap.ushell.demo.ReceiveParametersTestApp",
               "applicationDependencies": {
                   "name": "sap.ushell.demo.ReceiveParametersTestApp",
                   "self": {
                       "name": "sap.ushell.demo.ReceiveParametersTestApp"
                   }
               },
               "url": "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/ReceiveParametersTestApp",
               "systemAlias": "",
               "sap.ui": {
                   "technology": "UI5"
               }
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "ignored",
               "parameters": {
                   "P1": {
                       "required": false,
                       "defaultValue": {
                           format: "plain",
                           value: "DEFV"
                       }
                   }
               }
           },
           "compactSignature": "Case:3;[Description:[P1-> P2New; P2-> P2New]];[P1:];[P2:]<+>"
       },
       "appWithWDA": {
           "semanticObject": "PickTechnology",
           "action": "pickTech",
           "id": "PickTechnology",
           "title": "Pick Technology (WDA)",
           "subTitle": "sub Title",
           "shortTitle": "short Title",
           "icon": "Pick Technology (WDA) icon",
           "resolutionResult": {
               "applicationType": "WDA",
               "additionalInformation": "",
               "text": "Ignored parameters",
               "applicationDependencies": {},
               "url": "/sap/bc/nwbc/somewhereametersTestApp",
               "systemAlias": "",
               "sap.ui": {
                   "technology": "WDA"
               }
           },
           "deviceTypes": {
               "desktop": true,
               "tablet": true,
               "phone": true
           },
           "signature": {
               "additionalParameters": "ignored",
               "parameters": {
                   "P1": {
                       "required": false,
                       "defaultValue": {
                           format: "plain",
                           value: "DEFV"
                       }
                   }
               }
           },
           "compactSignature": "Case:3;[Description:[P1-> P2New; P2-> P2New]];[P1:];[P2:]<+>"
       }
    };

    [
        { testDescription: "UI5 inbound with empty URL is provided",
            aInbounds: [
                oTestInbounds.ui5InboundWithEmptyURL
            ],
            aCallArgs: [{
                semanticObject: "Action",
                action: "toui5nourl"
            }],
            expectedResult: [{
                "intent": "#Action-toui5nourl",
                "text": "UI5 Target without URL",
                "icon": "sap-icon://Fiori2/F0018",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "semantic object and action provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.starAction,
                oTestInbounds.starSemanticObject
            ],
            aCallArgs: [{
                semanticObject: "Action",
                action: "toappnavsample"
            }],
            expectedResult: [{
                "intent": "#Action-toappnavsample",
                "text": "App Navigation Sample 1",
                "icon": "sap-icon://Fiori2/F0018",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "only parameters are provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.starAction,
                oTestInbounds.starSemanticObject
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                params: {
                    "PREQ": "valA",
                    "P1": ["val1"],
                    "P2": ["val2"]
                }
            }],
            expectedResult: [{
                "intent": "#Action-parameterRename?P1=val1&P2=val2&PREQ=valA",
                "text": "Parameter Rename",
                "icon": "Parameter Rename icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }, {
                "intent": "#Action-toappnavsample?P1=val1&P2=val2&PREQ=valA",
                "text": "App Navigation Sample 1",
                "icon": "sap-icon://Fiori2/F0018",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }, {
                "intent": "#Object-ignoredParameters?P1=val1",
                "text": "No parameters allowed",
                "icon": "No parameters allowed icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "no arguments are provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.starAction,
                oTestInbounds.starSemanticObject
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined
            }],
            expectedResult: [{
                "intent": "#Action-noparametersAllowed",
                "text": "No parameters allowed",
                "icon": "No parameters allowed icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }, {
                "intent": "#Action-toappnavsample",
                "text": "App Navigation Sample 1",
                "icon": "sap-icon://Fiori2/F0018",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }, {
                "intent": "#Object-ignoredParameters",
                "text": "No parameters allowed",
                "icon": "No parameters allowed icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "only semantic object is provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.starAction,
                oTestInbounds.starSemanticObject
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                semanticObject: "Object"
            }],
            expectedResult: [{
                "intent": "#Object-ignoredParameters",
                "text": "No parameters allowed",
                "icon": "No parameters allowed icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }, {
                "intent": "#Object-starSemanticObject",
                "text": "Target Mapping with * as semanticObject",
                "icon": "icon with * as semanticObject",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "only action is provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.starAction,
                oTestInbounds.starSemanticObject
            ],
            aCallArgs: [{
                action: "toappnavsample"
            }],
            expectedResult: [{
                "intent": "#Action-toappnavsample",
                "text": "App Navigation Sample 1",
                "icon": "sap-icon://Fiori2/F0018",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "semantic object and parameters are provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.starAction,
                oTestInbounds.starSemanticObject
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                semanticObject: "Object",
                params: {
                    "P1": "VDEFINED1"
                }
            }],
            expectedResult: [{
                "intent": "#Object-ignoredParameters?P1=VDEFINED1",
                "text": "No parameters allowed",
                "icon": "No parameters allowed icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }, {
                "intent": "#Object-starSemanticObject?P1=VDEFINED1",
                "text": "Target Mapping with * as semanticObject",
                "icon": "icon with * as semanticObject",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "a '*' semantic object is provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.starAction,
                oTestInbounds.starSemanticObject
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                semanticObject: "*"
            }],
            expectedResult: []
        },
        {
            testDescription: "a '*' action is provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.starAction,
                oTestInbounds.starSemanticObject
            ],
            aCallArgs: [{
                action: "*"
            }],
            expectedResult: []
        },
        {
            testDescription: "withAtLeastOneUsedParam enabled, inbounds with default values provided, one common parameter in intent",
            aInbounds: [
                oTestInbounds.twoDefaultParametersAdditionalAllowed, // has P1 and P2 params
                oTestInbounds.threeDefaultParametersAdditionalAllowed // has P1, P2, P3 params
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                withAtLeastOneUsedParam: true,
                params: {
                    "P2": ["OURV2"]
                }
            }],
            expectedResult: [{ // both are returned because they share P2
                "intent": "#Object-threeDefaultParameters?P2=OURV2",
                "text": "Three Default Parameters",
                "icon": "Three Default Parameters icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }, {
                "intent": "#Object-twoDefaultParameters?P2=OURV2",
                "text": "Two Default Parameters",
                "icon": "Two Default Parameters icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "withAtLeastOneUsedParam enabled and inbound with no parameters provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                withAtLeastOneUsedParam: true,
                params: {
                    "P1": ["OURV1"]
                }
            }],
            expectedResult: [{
                "intent": "#Action-toappnavsample?P1=OURV1",
                "text": "App Navigation Sample 1",
                "icon": "sap-icon://Fiori2/F0018",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "withAtLeastOneUsedParam enabled and inbound with no parameters (and ignored additional parameters) provided",
            aInbounds: [
                oTestInbounds.noParamsNoAdditionalAllowed
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                withAtLeastOneUsedParam: true,
                params: {
                    "P1": ["OURV1"]
                }
            }],
            expectedResult: []
        },
        {
            testDescription: "withAtLeastOneUsedParam disabled and inbound with no parameters (and ignored additional parameters) provided",
            aInbounds: [
                oTestInbounds.noParamsNoAdditionalAllowed
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                withAtLeastOneUsedParam: false,
                params: {
                    "P1": ["OURV1"]
                }
            }],
            expectedResult: [{
                "intent": "#Action-toappnavsample",
                "text": "App Navigation Sample 1",
                "icon": "sap-icon://Fiori2/F0018",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "withAtLeastOneUsedParam enabled, sap- parameter provided, and inbound with two parameters (others allowed) provided",
            aInbounds: [
                oTestInbounds.twoDefaultParametersAdditionalAllowed, // has P1 and P2 params
                oTestInbounds.threeDefaultParametersAdditionalAllowed // has P1, P2, P3 params
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                withAtLeastOneUsedParam: true,
                params: {
                    "sap-param": ["OURV1"] // sap- params don't count
                }
            }],
            expectedResult: []
        },
        {
            testDescription: "semantic object and tech hint GUI as filter provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.appWithUI5,
                oTestInbounds.appWithWDA
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                semanticObject: "PickTechnology",
                treatTechHintAsFilter: false,
                params: {
                    "sap-ui-tech-hint": ["GUI"]
                }
            }],
            expectedResult: [{
                "intent": "#PickTechnology-pickTech?sap-ui-tech-hint=GUI",
                "text": "Pick Technology (UI5)",
                "icon": "Pick Technology (UI5) icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "semantic object and tech hint as filter WDA provided",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.appWithUI5,
                oTestInbounds.appWithWDA
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                semanticObject: "PickTechnology",
                treatTechHintAsFilter: true,
                params: {
                    "sap-ui-tech-hint": ["WDA"]
                }
            }],
            expectedResult: [{
                "intent": "#PickTechnology-pickTech?sap-ui-tech-hint=WDA",
                "text": "Pick Technology (WDA)",
                "icon": "Pick Technology (WDA) icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "semantic object and tech hint treatTechHintAsFilter GUI (not present)",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.appWithUI5,
                oTestInbounds.appWithWDA
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                semanticObject: "PickTechnology",
                treatTechHintAsFilter: true,
                params: {
                    "sap-ui-tech-hint": ["GUI"]
                }
            }],
            expectedResult: [
            ]
        },
        {
            testDescription: "semantic object and tech hint treatTechHintAsFilter GUI (not present)",
            aInbounds: [
                oTestInbounds.noParamsAdditionalAllowed,
                oTestInbounds.requiredParamWithDefaultRenamed,
                oTestInbounds.noParamsAllowed,
                oTestInbounds.ignoredParamsAndDefaultParameter,
                oTestInbounds.appWithUI5,
                oTestInbounds.appWithWDA
            ],
            aCallArgs: [{
                // if CrossApplicationNavigation#getLinks was called, the
                // presence of action is guaranteed.
                action: undefined,
                semanticObject: "PickTechnology",
                params: {
                    "sap-ui-tech-hint": ["GUI"]
                }
            }],
            expectedResult: [{
                "intent": "#PickTechnology-pickTech?sap-ui-tech-hint=GUI",
                "text": "Pick Technology (UI5)",
                "icon": "Pick Technology (UI5) icon",
                "subTitle": "sub Title",
                "shortTitle": "short Title"
            }]
        },
        {
            testDescription: "2 'superior' tags are specified",
            aInbounds: [
                mkInb("#SO-act1{<no params><o>}"),
                mkInb("#SO-act2{[sap-tag:[superior]]<o>}"),
                mkInb("#SO-act3{[sap-tag:[tag-B]]<o>}"), {
                    "semanticObject": "SO",
                    "action": "act4",
                    "signature": {
                        "parameters": {
                            "sap-tag": {
                                "defaultValue": {
                                    "value": "superior"
                                },
                                "required": false
                            }
                        },
                        "additionalParameters": "ignored"
                    }
                }
            ],
            aCallArgs: [ {
                    semanticObject: "SO",
                    params: { },
                    tags: [ "superior" ]
                } ],
            expectedResult: [
                {
                    intent: "#SO-act2",
                    text: undefined,
                    tags: ["superior"]
                },
                {
                    intent: "#SO-act4",
                    text: undefined,
                    tags: ["superior"]
                }
            ]
        },
        {
            // at the moment we don't support multiple tags, we may do in the future.
            testDescription: "'superior,something' is specified",
            aInbounds: [
                {
                    "semanticObject": "SO",
                    "action": "act4",
                    "signature": {
                        "parameters": {
                            "sap-tag": {
                                "defaultValue": {
                                    "value": "superior,superior"
                                },
                                "required": false
                            }
                        },
                        "additionalParameters": "ignored"
                    }
                }
            ],
            aCallArgs: [ {
                    semanticObject: "SO",
                    params: { },
                    tags: [ "superior" ]
                } ],
            expectedResult: [ ]
        },
        {
            // at the moment we don't support multiple tags, we may do in the future.
            testDescription: "'superior,something' is specified",
            aInbounds: [
                mkInb("#SO-act1{<no params><o>}"),
                mkInb("#SO-act2{sap-tag:superior<o>}"), {
                    "semanticObject": "SO",
                    "action": "act4",
                    "signature": {
                        "parameters": {
                            "sap-tag": {
                                "filter": {
                                    "value": "superior"
                                },
                                "required": false
                            }
                        },
                        "additionalParameters": "ignored"
                    }
                }
            ],
            aCallArgs: [ {
                    semanticObject: "SO",
                    params: { },
                    tags: [ "superior" ]
                } ],
            expectedResult: [ ]
        },
        {
            testDescription: "'required' parameter requested",
            aInbounds: [
                mkInb("#Object-action{[p1:v1]<o>}") // p1 is a default parameter.
            ],
            aCallArgs: [{
                semanticObject: "Object",
                params: {
                    p1: "v1"
                },
                paramsOptions: [
                    { name: "p1", options: { required: true } }
                ]
            }],
            expectedResult: [] // ... therefore no results are returned
        },
        {
            testDescription: "'required' parameter requested, but matching target exists",
            aInbounds: [
                mkInb("#Object-action{<no params><+>}", null, { title: "A" }), // matches
                mkInb("#Object-action{[p1:[v1]<+>]}", null, { title: "B" }) // matches with higher priority
            ],
            aCallArgs: [{
                semanticObject: "Object",
                params: {
                    p1: "v1"
                },
                paramsOptions: [
                    { name: "p1", options: { required: true } }
                ]
            }],
            // ... B would match if the 'required' option was not
            // specified, but we expect nothing is returned in this case.
            //
            // Explanation: suppose inbound "A" is returned.
            //
            // The returned link would look like:
            // {
            //   text: "A",
            //   intent: "#Object-action?p1=v1"
            // }
            //
            // 1. now user sees a link that has a label "A" on the UI
            //    (e.g., in a smart table control).
            // 2. User clicks on the "A" link
            // 3. CSTR#getMatchingTargets matches target "B"
            // 4. User is navigated to "B" instead of "A" as expected
            //
            expectedResult: []
        }
    ].forEach(function (oFixture) {
        asyncTest("getLinks works as expected when " + oFixture.testDescription, function () {
            var oSrvc = createService({
                    inbounds: oFixture.aInbounds
                }),
                oAllowedRequireServices = {
                    URLParsing: true
                };

            var fnGetServiceOrig = sap.ushell.Container.getService;
            sinon.stub(sap.ushell.Container, "getService", function (sName) {
                if (!oAllowedRequireServices[sName]) {
                    ok(false, "Test is not accessing " + sName);
                }
                return fnGetServiceOrig.bind(sap.ushell.Container)(sName);
            });

            oSrvc.getLinks.apply(oSrvc, oFixture.aCallArgs)
                .done(function (aSemanticObjectLinks) {
                    ok(true, "promise is resolved");

                    deepEqual(aSemanticObjectLinks, oFixture.expectedResult,
                        "obtained the expected result");
                })
                .fail(function (sErrorMessage) {
                    ok(false, "promise is resolved without " + sErrorMessage);

                })
                .always(function () {
                    start();
                });
        });
    });

})();

    [
        {
            testDescription: "3 Semantic objects in inbounds",
            aSemanticObjectsInInbounds: [
                "Action", "Shell", "Object"
            ],
            expectedResult: [
                "Action", "Object", "Shell" // returned in lexicographical order
            ]
        },
        {
            testDescription: "wildcard semantic object in inbounds",
            aSemanticObjectsInInbounds: [
                "Action", "*", "Shell", "Object"
            ],
            expectedResult: [
                "Action", "Object", "Shell" // "*" is ignored
            ]
        },
        {
            testDescription: "empty list of semantic objects is provided",
            aSemanticObjectsInInbounds: [],
            expectedResult: []
        },
        {
            testDescription: "undefined semantic object and empty semantic objects",
            aSemanticObjectsInInbounds: [undefined, ""],
            expectedResult: []
        },
        {
            testDescription: "duplicated semantic object in inbounds",
            aSemanticObjectsInInbounds: ["Shell", "Dup", "action", "Dup"],
            expectedResult: ["Dup", "Shell", "action"]
        }
    ].forEach(function (oFixture) {
        asyncTest("getDistinctSemanticObjects returns the expected result when " + oFixture.testDescription, function () {
            // Arrange
            var aInbounds = oFixture.aSemanticObjectsInInbounds.map(function (sSemanticObject) {
                return {
                    semanticObject: sSemanticObject,
                    action: "dummyAction"
                };
            });

            var oSrvc = createService({
                inbounds: aInbounds
            });

            // Act
            oSrvc.getDistinctSemanticObjects()
                .done(function (aSemanticObjectsGot) {
                    ok(true, "promise was resolved");

                    deepEqual(aSemanticObjectsGot, oFixture.expectedResult,
                        "the expected list of semantic objects was returned");
                })
                .fail(function (sMsg) {
                    ok(false, "promise was resolved");
                })
                .always(function () {
                    start();
                });
        });
    });
    asyncTest("getDistinctSemanticObjects behave as expected when getInbounds fails", function () {
        // Arrange
        var oFakeAdapter = {
                getInbounds: function () {
                    return new jQuery.Deferred().reject("Deliberate Error").promise();
                }
            },
            oSrvc = createService({
                adapter: oFakeAdapter
            });

        sinon.stub(jQuery.sap.log, "error");
        sinon.stub(jQuery.sap.log, "warning");

        // Act
        oSrvc.getDistinctSemanticObjects()
            .done(function () {
                ok(false, "promise was rejected");
            })
            .fail(function (sErrorMessageGot) {
                ok(true, "promise was rejected");
                strictEqual(sErrorMessageGot, "Deliberate Error",
                    "expected error message was returned");

                strictEqual(
                    jQuery.sap.log.error.getCalls().length,
                    0,
                    "jQuery.sap.log.error was called 0 times"
                );

                strictEqual(
                    jQuery.sap.log.warning.getCalls().length,
                    0,
                    "jQuery.sap.log.warning was called 0 times"
                );
            })
            .always(function () {
                start();
            });
    });

    [
        {
            testDescription: "matching UI5 url with sap-system and other parameters specified in intent (additionalParameters: ignored)",
            intent: "Action-action1?sap-system=NOTRELEVANT&paramName1=pv1",
            sCurrentFormFactor: "desktop",
            oMockedMatchingTarget: {
               // ignore certain fields not needed for the test
               "matches": true,
               "resolutionResult": { },
               "defaultedParamNames": ["P2"],
               "intentParamsPlusAllDefaults": {
                   "P1": ["PV1", "PV2"],
                   "P2": ["1000"],
                   "sap-system": ["AX1"]
               },
               "inbound": {
                   "title": "Currency manager (this one)",
                   "semanticObject": "Action",
"action": "action1",
                   "resolutionResult": {
                       "additionalInformation": "SAPUI5.Component=Currency.Component",
                       "applicationType": "SAPUI5",
                       "text": "Currency manager (ignored )", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/url/to/currency"
                   },
                   "signature": {
                       "additionalParameters": "ignored",
                       "parameters": {
                           "P2": {
                               "required": false,
                               "renameTo": "P3",
                               "defaultValue": { value: "DefaultValue" }
                           }
                       }
                   }
               }
            },
            expectedResolutionResult: {
                "additionalInformation": "SAPUI5.Component=Currency.Component",
                "applicationType": "SAPUI5",
                "text": "Currency manager (this one)",
                "ui5ComponentName": "Currency.Component",
                "sap-system": "AX1",
                "url": "/url/to/currency?P1=PV1&P1=PV2&P3=1000&sap-system=AX1&sap-ushell-defaultedParameterNames=%5B%22P3%22%5D",
                "reservedParameters": {}
            }
        },
        {
            testDescription: "resolving local WDA url",
            intent: "Action-action1?paramName1=pv1",
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            oMockedMatchingTarget: {
               // ignore certain fields not needed for the test
               "matches": true,
               "resolutionResult": { },
               "defaultedParamNames": ["P2"],
               "intentParamsPlusAllDefaults": {
                   "P1": ["PV1", "PV2"],
                   "P2": ["1000"]
               },
               "inbound": {
                   "title": "Currency manager (this one)",
                   "semanticObject": "Action",
"action": "action1",
                   "resolutionResult": {
                       "additionalInformation": "",
                       "applicationType": "WDA",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN"
                   },
                   "signature": {
                       "additionalParameters": "ignored",
                       "parameters": {
                           "P2": {
                               "renameTo": "P3",
                               "required": true
                           }
                       }
                   }
               }
            },
            expectedResolutionResult: {
                "additionalInformation": "",
                "applicationType": "NWBC",
                "reservedParameters": {},
                "sap-system": undefined,
                "text": "Currency manager (this one)",
                "url": "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN&P1=PV1&P1=PV2&P3=1000&sap-ushell-defaultedParameterNames=%5B%22P3%22%5D"
             }
        },
        {
            testDescription: "resolving local WDA url with sap-system",
            intent: "Action-action1?sap-system=NOTRELEVANT&paramName1=pv1",
            bIgnoreFormFactor: true,
            sCurrentFormFactor: "desktop",
            oMockedMatchingTarget: {
               // ignore certain fields not needed for the test
               "matches": true,
               "resolutionResult": {
                   "text": "Some WDA"
               },
               "defaultedParamNames": ["P2"],
               "intentParamsPlusAllDefaults": {
                   "P1": ["PV1", "PV2"],
                   "P4": { },
                   "P2": ["1000"],
                   "sap-system": ["AX1"]
               },
               "inbound": {
                   "semanticObject": "Action",
"action": "action1",
                   "resolutionResult": {
                       "additionalInformation": "",
                       "applicationType": "WDA",
                       "text": "Currency manager (ignored text)", // ignored
                       "ui5ComponentName": "Currency.Component",
                       "url": "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN"
                   },
                   "signature": {
                       "additionalParameters": "ignored",
                       "parameters": {
                           "P2": {
                               "renameTo": "P3",
                               "required": true
                           }
                       }
                   }
               }
            },
            expectedResolutionResult: {
                "text": "Some WDA",
                // NOTE: the UNMAPPED paramter list!
                "url": "fallback :-({P1:[PV1,PV2],P2:[1000],sap-system:[AX1],sap-ushell-defaultedParameterNames:[[P3]]}"
             }
        }
    ].forEach(function (oFixture) {
        asyncTest("resolveHashFragment postprocessing when " + oFixture.testDescription, function () {

            var oFakeAdapter = {
                getInbounds: sinon.stub().returns(
                    new jQuery.Deferred().resolve([]).promise()
                ),
                resolveHashFragmentFallback: function (oIntent, oMatchingTarget, oParameters) {
                    return new jQuery.Deferred().resolve({ url: "fallback :-(" + JSON.stringify(oParameters).replace(/["]/g, "").replace(/\\/g, "") }).promise();
                }
            };

            var oSrvc = new ClientSideTargetResolution(oFakeAdapter, null, null, {});

            // Mock form factor
            sinon.stub(utils, "getFormFactor").returns(oFixture.sCurrentFormFactor);

            // Mock getMatchingInbounds
            sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                new jQuery.Deferred().resolve([oFixture.oMockedMatchingTarget]).promise()
            );

            // Act
            oSrvc.resolveHashFragment(oFixture.intent)
                .done(function (oResolutionResult) {
                    // Assert
                    ok(true, "promise was resolved");
                    deepEqual(oResolutionResult, oFixture.expectedResolutionResult, "got expected resolution result");
                })
                .fail(function () {
                    // Assert
                    ok(false, "promise was resolved");
                })
                .always(function () {
                    start();
                });

        });
    });

    [
        {
            "description": "renameTo present",
            oMatchingTarget: {
                "inbound": {
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": {
                                "required": true
                            },
                            "P2": {
                                "renameTo": "P3",
                                "required": true
                            }
                        }
                    }
                }
            },
            expectedResult: true
        },
        {
            "description": "renameTo not present",
            oMatchingTarget: {
                "inbound": {
                    "signature": {
                        "parameters": {
                            "P2": {
                                "required": true
                            }
                        }
                    }
                }
            },
            expectedResult: false
        }
    ].forEach(function (oFixture) {
        test(" _hasRenameTo when " + oFixture.testDescription, function () {
            var oFakeAdapter = {
            };
            var oSrvc = new ClientSideTargetResolution(oFakeAdapter);
            var bRes = oSrvc._hasRenameTo(oFixture.oMatchingTarget);
            strictEqual(bRes, oFixture.expectedResult, " determination ok");
      });
    });


    [
     {
         testDescription: "ui5 parameter mapping with appState and defaulting",
         intent: "Action-action1?sap-system=NOTRELEVANT&paramName1=pv1",
         sCurrentFormFactor: "desktop",
         oMockedMatchingTarget: {
            // ignore certain fields not needed for the test
            "matches": true,
            "resolutionResult": { },
            "defaultedParamNames": ["P2", "P3", "P4", "P5"],
            "intentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": ["1000"],
                "P3": { "ranges": { option: "EQ", low: "1000" } },
                "P4": { "ranges": { option: "EQ", low: "notusedbecauseP2" } },
                "P5": { "ranges": { option: "EQ", low: "1000" } },
                "P9": ["PV9"],
                "sap-system": ["AX1"]
            },
            "inAppState": {
                "selectionVariant": {
                    "Parameter": [ { "PropertyName": "P6", "PropertyValue": "0815" },
                                    { "PropertyName": "P8", "PropertyValue": "0815" } ],
                    "selectOptions": [
                    {
                        "PropertyName": "P7",
                        "Ranges": [
                                   {
                                         "Sign": "I",
                                                          "Option": "EQ",
                                                          "Low": "INT",
                                                          "High": null
                                    }
                                    ]
                    }]
                }
            },
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "Action",
"action": "action1",
                "resolutionResult": {
                    "additionalInformation": "SAPUI5.Component=Currency.Component",
                    "applicationType": "SAPUI5",
                    "text": "Currency manager (ignored )", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/url/to/currency"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {
                        "P1": { "renameTo": "PX" },
                        "P2": { "renameTo": "P4" },
                        "P5": { "renameTo": "PX"},
                        "P6C": { "renameTo": "PC"},
                        "P6": { "renameTo": "P6New"},
                        "P7": { "renameTo": "P6New"},
                        "P8": { "renameTo": "P8New"},
                        "P9": { "renameTo": "PX"}
                    }
                }
            }
         },
         expectedResolutionResult: {
             "additionalInformation": "SAPUI5.Component=Currency.Component",
             "applicationType": "SAPUI5",
             "text": "Currency manager (this one)",
             "ui5ComponentName": "Currency.Component",
             "sap-system": "AX1",
             "url": "/url/to/currency?P4=1000&PX=PV1&PX=PV2&sap-system=AX1&sap-ushell-defaultedParameterNames=%5B%22P4%22%5D",
             "reservedParameters": {}
         }
     }
 ].forEach(function (oFixture) {
     asyncTest("resolveHashFragment with appstate merging " + oFixture.testDescription, function () {

         var oFakeAdapter = {
             getInbounds: sinon.stub().returns(
                 new jQuery.Deferred().resolve([]).promise()
             ),
             resolveHashFragmentFallback: function (oIntent, oMatchingTarget, oParameters) {
                 return new jQuery.Deferred().resolve({ url: "fallback :-(" + JSON.stringify(oParameters).replace(/["]/g, "").replace(/\\/g, "") }).promise();
             }
         };

         var oSrvc = new ClientSideTargetResolution(oFakeAdapter, null, null, {});

         // Mock form factor
         sinon.stub(utils, "getFormFactor").returns(oFixture.sCurrentFormFactor);

         // Mock getMatchingInbounds
         sinon.stub(oSrvc, "_getMatchingInbounds").returns(
             new jQuery.Deferred().resolve([oFixture.oMockedMatchingTarget]).promise()
         );

         // Act
         oSrvc.resolveHashFragment(oFixture.intent)
             .done(function (oResolutionResult) {
                 // Assert
                 ok(true, "promise was resolved");
                 deepEqual(oResolutionResult, oFixture.expectedResolutionResult, "got expected resolution result");
             })
             .fail(function () {
                 // Assert
                 ok(false, "promise was resolved");
             })
             .always(function () {
                 start();
             });

     });
 });


    [
        {
            testDescription: " no renaming, no appstate or complex parameters",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": { },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {},
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "P2": ["1000"],
                    "sap-system": ["AX1"]
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { },
                            "P2": { }
                        }
                    }
                }
            },
            expectedAppStateKey: undefined,
            expectedIntentParamsPlusAllDefaults: {
                "P1": ["PV1", "PV2"],
                "P2": ["1000"],
                "sap-system": ["AX1"]
            },
            expectedMappedDefaultedParamNames: ["P2"]
        },
        {
            testDescription: " new appstate creation",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "4000",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {},
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { "renameTo": "PX" },
                            "P2": { "defaultValue": { "value": "UserDefault.extended.PX", format: "reference"} }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASNEW" ]
            },
            expectedAppStateKey: "ASNEW",
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "Parameters": [],
                    "SelectOptions": [
                         {
                             "PropertyName": "P2",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "LT",
                                            "Low": "4000",
                                            "High": null
                                        }
                                        ]
                         }
                    ],
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    }
                }
            },
            expectedMappedDefaultedParamNames: ["P2"]
        },
        {
            testDescription: " modifying and merging into an existing appstate",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "4000",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored", // NOTE: ignored...
                        "parameters": {
                            "P1": { "renameTo": "PX" },
                            "P2": { "defaultValue": { "value": "UserDefault.extended.PX", format: "reference"} }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASNEW" ]
            },
            expectedAppStateKey: "ASNEW",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "P3", "PropertyValue": "P3Value" }],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "POLD",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                         ]}
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ /* no P3 -> ignored additional parameters */ ],
                    SelectOptions:
                        [
                         // no POLD -> ignored additional parameters
                         {
                             "PropertyName": "P2",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "LT",
                                            "Low": "4000",
                                            "High": null
                                        }
                                        ]
                         }
                    ]}
            },
            expectedMappedDefaultedParamNames: ["P2"]
        },
        {
            testDescription: " no merging because of presence in appstate in select option",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "4000",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P4": { },
                            "P2": { "defaultValue": { "value": "UserDefault.extended.PX", format: "reference"} }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state" : [ "ASNEW" ]
            },
            expectedAppStateKey : "ASNEW",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [{
                        "PropertyName": "P3",
                        "PropertyValue": "P3Value"
                    }],
                    SelectOptions: [{
                        "PropertyName": "P2",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "OLD",
                            "High": null
                        }]
                    }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [],
                    SelectOptions: [{
                        "PropertyName": "P2",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "OLD",
                            "High": null
                        }]
                    }]
                }
            }
        },
        {
            testDescription: " no merging because of presence in appstate in select option via domination!",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "4000",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { "renameTo": "PX" },
                            "P2": { "renameTo": "PX", "defaultValue": { "value": "UserDefault.extended.PX", format: "reference"} }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASNEW" ]
            },
            expectedAppStateKey: "ASNEW",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "P3", "PropertyValue": "P3Value" }],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P1",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                         ]}
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ /* no P3 -> ignored additional parameters! */ ],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "PX",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                    ]}
            }
        },
        {
            testDescription: " partially no merging because of presence in appstate in select option!",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P1": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "1111",
                            "High": null
                        }] },
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "4000",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P1", "P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }]
                    },
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }]
                    }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { },
                            "P2": { "defaultValue": { "value": "UserDefault.extended.PX", format: "reference"} }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }]
                },
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }]
                },
                "sap-xapp-state": [ "ASNEW" ]
            },
            expectedAppStateKey: "ASNEW",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "P3", "PropertyValue": "P3Value" }],
                    SelectOptions:
                        [ {
                            "PropertyName": "P2",
                            "Ranges": [
                                       {
                                           "Sign": "I",
                                           "Option": "LT",
                                           "Low": "2222",
                                           "High": null
                                       }
                                       ]
                        }
                         ]}
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ /* no P3 -> ignored additional parameters */ ],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P2",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "LT",
                                            "Low": "2222",
                                            "High": null
                                        }
                                        ]
                         },
                         {
                             "PropertyName": "P1",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "LT",
                                            "Low": "1111",
                                            "High": null
                                        }
                                        ]
                         }
                    ]}
            },
            expectedMappedDefaultedParamNames: ["P1"]
        },
        {
            testDescription: " no merging because of presence in appstate in parameter!",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "4000",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { },
                            "P2": { "defaultValue": { "value": "UserDefault.extended.PX", format: "reference"} }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASOLD" ]
            },
            expectedAppStateKey: "ASOLD",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "P2", "PropertyValue": "P2Value" }]
                }
            },
            expectedAppStateData: undefined // No app state was generated
        },
        {
            testDescription: " no merging because of presence in appstate in parameter, but renaming",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "4000",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { "renameTo": "PX" },
                            "P2": { "renameTo": "P2New", "defaultValue": { "value": "UserDefault.extended.PX", format: "reference"} },
                            "P3": { "renameTo": "P3New" }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASNEW" ]
            },
            expectedAppStateKey: "ASNEW",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "PU", "PropertyValue": "PUValue" },
                                   { "PropertyName": "P3", "PropertyValue": "P3Value" }],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P2",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                     ]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ /* no PU -> ignored additional parameters! */
                                   { "PropertyName": "P3New", "PropertyValue": "P3Value" }],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P2New",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                     ]
                }
            },
            expectedMappedDefaultedParamNames: []
        },
        {
            testDescription: " but plain renaming!",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { "renameTo": "PX" },
                            "P2": { "renameTo": "P2New", "defaultValue": { "value": "UserDefault.extended.PX", format: "reference"} },
                            "P3": { "renameTo": "P3New" }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASNEW" ]
            },
            expectedAppStateKey: "ASNEW",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "PU", "PropertyValue": "PUValue" },
                                   { "PropertyName": "P3", "PropertyValue": "P3Value" }],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P2",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                     ]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ /* no PU -> additional parameters ignored! */
                                   { "PropertyName": "P3New", "PropertyValue": "P3Value" }],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P2New",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                     ]
                }
            }
        },
        {
            testDescription: "  plain renaming if irrelevant does not trigger new AppState!",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "allowed",
                        "parameters": {
                            "P6": { "renameTo": "P7" }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASOLD" ]
            },
            expectedAppStateKey: "ASOLD",
            oOldAppStateData: {
                selectionVariant: {"ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "PU", "PropertyValue": "PUValue" },
                                   { "PropertyName": "P3", "PropertyValue": "P3Value" }],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P2",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                     ]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "PU", "PropertyValue": "PUValue" },
                                   { "PropertyName": "P3", "PropertyValue": "P3Value" }],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P2",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                     ]
                }
            },
            expectedMappedDefaultedParamNames: []
        },
        {
            testDescription: " no merging because of presence in appstate in parameter, but renaming with collisions",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "4000",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "allowed",
                        "parameters": {
                            "P1": { "renameTo": "PU" },
                            "P2": { "renameTo": "PU", "defaultValue": { "value": "UserDefault.extended.PX", format: "reference"} },
                            "P3": { "renameTo": "PU" }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": ["ASOLD"]
            },
            expectedAppStateKey: "ASOLD",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "PU", "PropertyValue": "1" },
                                   { "PropertyName": "P3", "PropertyValue": "2" }],
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P2",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "OLD",
                                            "High": null
                                        }
                                        ]
                         }
                     ]
                }
            },
            expectedAppStateData: undefined, // No app state was generated
//                selectionVariant: {
//                    "ODataFilterExpression" : "",
//                    "SelectionVariantID" : "",
//                    "Text" : "Selection Variant with ID ",
//                    "Version" : {
//                        "Major" : "1",
//                        "Minor" : "0",
//                        "Patch" : "0"
//                    },
//                    Parameters : [ { "PropertyName" : "PU", "PropertyValue" : "1" }]
//                    SelectOptions :
//                        [
//                         {
//                             "PropertyName" : "PU",
//                             "Ranges": [
//                                        {
//                                            "Sign": "I",
//                                            "Option": "EQ",
//                                            "Low": "OLD",
//                                            "High": null
//                                        }
//                                        ]
//                         }
//                     ]
//                }
//            },
            expectedMappedDefaultedParamNames: []
        },
        {
            testDescription: "new app state returned when deleting parameters from old app state",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": { },
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "defaultedParamNames": [],
                "intentParamsPlusAllDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { "renameTo": "PU" }
                        }
                    }
                }
            },
            expectedIntentParamsPlusAllDefaults: {
                "sap-xapp-state": ["ASNEW"]
            },
            expectedAppStateKey: "ASNEW", // because it changed
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "PU", "PropertyValue": "1" } ],
                    SelectOptions: [
                    ]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [],
                    SelectOptions: []
                }
            },
            expectedMappedDefaultedParamNames: []
        },
        {
            // TODO CHECK WHETHER we shoud sort !
            testDescription: " but renaming changes effective order",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                },
                "defaultedParamNames": ["P2", "P7"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"],
                    "P7New": ["1000"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] },
                    "P7": ["1000"]
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { "renameTo": "P2" },
                            "P2": { "renameTo": "P1" },
                            "P7": { "renameTo": "P7New"}
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASNEW" ],
                "P7": ["1000"] // renaming is elsewhere!
            },
            expectedAppStateKey: "ASNEW",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "P1", "PropertyValue": "1" },
                                   { "PropertyName": "P2", "PropertyValue": "2" }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "SelectOptions": [],
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "P2", "PropertyValue": "1" },
                                   { "PropertyName": "P1", "PropertyValue": "2" }]
                }
            },
            expectedMappedDefaultedParamNames: ["P7New"]
        },
        {
            // TODO CHECK WHETHER we shoud sort !
            testDescription: "added and renamend one ",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "I2222T",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P2", "P7"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"],
                    "P7New": ["1000"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "I2222T",
                        "High": null
                    }] },
                    "P7": ["1000"]
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { "renameTo": "P2" },
                            "P2": { "renameTo": "P1" },
                            "P7": { "renameTo": "P7New"}
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "I2222T",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASNEW" ],
                "P7": ["1000"] // renaming is elsewhere!
            },
            expectedAppStateKey: "ASNEW",
            oOldAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "P1", "PropertyValue": "1" },
                                   { "PropertyName": "P5", "PropertyValue": "2" }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [ { "PropertyName": "P2", "PropertyValue": "1" } ], // no P5 because not in signature + ignored
                    SelectOptions:
                        [
                         {
                             "PropertyName": "P1",
                             "Ranges": [
                                        {
                                            "Sign": "I",
                                            "Option": "EQ",
                                            "Low": "I2222T",
                                            "High": null
                                        }
                                        ]
                         }
                         ]
                }
            },
            expectedMappedDefaultedParamNames: ["P1", "P7New"]
        },
        {
            testDescription: "  does not break non compliant appstates when inserting",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                    "oNewAppStateMembers": {
                        "P2": { "Ranges": [{
                            "Sign": "I",
                            "Option": "LT",
                            "Low": "4000",
                            "High": null
                        }] }
                    }
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"],
                    "P2": { "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "INT",
                        "High": null
                    }] }
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { "renameTo": "P2" },
                            "P2": { "renameTo": "P1" }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "P2": { "Ranges": [{
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "INT",
                    "High": null
                }] },
                "sap-xapp-state": [ "ASNEW" ]
            },
            expectedAppStateKey: "ASNEW",
            oOldAppStateData: {
                "here": {}
            },
            expectedAppStateData: {
                "here": {},
                "selectionVariant": {
                    "ODataFilterExpression": "",
                    "Parameters": [],
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                  "SelectOptions": [
                    {
                      "PropertyName": "P1",
                      "Ranges": [{
                          "Sign": "I",
                          "Option": "LT",
                          "Low": "4000",
                          "High": null
                      }]
                    }
                  ]
                }
            }
        },
        {
            testDescription: "  does not break non compliant appstates when not changing",
            oMatchingTarget: {
                // ignore certain fields not needed for the test
                "matches": true,
                "resolutionResult": {
                },
                "defaultedParamNames": ["P2"],
                "mappedIntentParamsPlusSimpleDefaults": {
                    "sap-xapp-state": ["ASOLD"]
                },
                "intentParamsPlusAllDefaults": {
                    "P1": ["PV1", "PV2"],
                    "sap-xapp-state": ["ASOLD"]
                },
                "inbound": {
                    "title": "Currency manager (this one)",
                    "semanticObject": "Action",
"action": "action1",
                    "resolutionResult": {
                        "additionalInformation": "SAPUI5.Component=Currency.Component",
                        "applicationType": "URL",
                        "text": "Currency manager (ignored )", // ignored
                        "ui5ComponentName": "Currency.Component",
                        "url": "/url/to/currency"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            "P1": { "renameTo": "P2" },
                            "P2": { "renameTo": "P1" }
                        }
                    }
                }
            },
            "expectedIntentParamsPlusAllDefaults": {
                "P1": ["PV1", "PV2"],
                "sap-xapp-state": [ "ASOLD" ]
            },
            expectedAppStateKey: "ASOLD",
            oOldAppStateData: {
                "here": {}
            },
            expectedAppStateData: {
                "here": {}
            }
        }
 ].forEach(function (oFixture) {
     asyncTest(" _mixAppStateIntoResolutionResultAndRename when " + oFixture.testDescription, function () {
         var oFakeAdapter = {
             getInbounds: sinon.stub().returns(
                 new jQuery.Deferred().resolve([]).promise()
             ),
             resolveHashFragmentFallback: function (oIntent, oMatchingTarget, oParameters) {
                 return new jQuery.Deferred().resolve({ url: "fallback :-(" + JSON.stringify(oParameters).replace(/["]/g, "").replace(/\\/g, "") }).promise();
             }
         };
         function FakeAppState (sKey, oData) {
             this.oData = oData;
             this.getKey = function () { return sKey; };
             this.getData = function () { return this.oData; };
             this.setData = function (oData) { this.oData = oData; };
             this.save = function () { return new jQuery.Deferred().resolve().promise(); };
         }
         function sortParametersByName (o1) {
             var p1 = jQuery.sap.getObject("selectionVariant.Parameters", undefined, o1);
             if (jQuery.isArray(p1)) {
                 o1.selectionVariant.Parameters = p1.sort(function (e1, e2) {
                     if (e1.PropertyName === e2.PropertyName) {
                         return 0;
                     }
                     if (e1.PropertyName < e2.PropertyName) {
                         return -1;
                     }
                     return 1;
                 });
             }
             return o1;
         }

         var oNewAppState = new FakeAppState("ASNEW", {});
         var oAppStateMock = {
                 getAppState: sinon.stub().returns(
                     new jQuery.Deferred().resolve(new FakeAppState("ASOLD", oFixture.oOldAppStateData)).promise()
                 ),
                 createEmptyAppState: sinon.stub().returns(
                     oNewAppState
                 )
//                 resolveHashFragmentFallback: function(oIntent, oMatchingTarget, oParameters) {
//                     return new jQuery.Deferred().resolve({ url : "fallback :-("  + JSON.stringify(oParameters).replace(/[\"]/g,"").replace(/\\/g,"") }).promise();
//                 }
             };

         var oSrvc = new ClientSideTargetResolution(oFakeAdapter, null, null, {});
         // Act
         oSrvc._mixAppStateIntoResolutionResultAndRename(oFixture.oMatchingTarget, oAppStateMock)
             .done(function (oMatchingTargetResult) {
                 // test the xapp-state key !
                 deepEqual(oMatchingTargetResult.intentParamsPlusAllDefaults["sap-xapp-state"], (oFixture.expectedAppStateKey ? [oFixture.expectedAppStateKey] : undefined), "new appstate key");
                 deepEqual(oMatchingTargetResult.mappedIntentParamsPlusSimpleDefaults["sap-xapp-state"], (oFixture.expectedAppStateKey ? [oFixture.expectedAppStateKey] : undefined), "new appstate key in simple defaults!");
                 deepEqual(oMatchingTargetResult.intentParamsPlusAllDefaults, oFixture.expectedIntentParamsPlusAllDefaults, "cleansed parameters ok");
                 if (oFixture.expectedAppStateData) {
                     deepEqual(sortParametersByName(oNewAppState.getData()), sortParametersByName(oFixture.expectedAppStateData), " appstate data correct");
                 }
                 if (oFixture.expectedMappedDefaultedParamNames) {
                     deepEqual(oMatchingTargetResult.mappedDefaultedParamNames, oFixture.expectedMappedDefaultedParamNames, "defaulted param names ok");
                 }
             })
             .fail(function () {
                 // Assert
                 ok(false, "promise was resolved");
             })
             .always(function () {
                 start();
             });
     });
 });

    // parameter mapping


    [
        {
            testDescription: "form factor is not ignored",
            sSemanticObject: "Object",
            bIgnoreFormFactor: false,
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            expectedGetMatchingTargetsIntent: {
                "action": undefined,
                "formFactor": "mobile",
                "params": {},
                "semanticObject": "Object"
            }
        },
        {
            testDescription: "form factor is ignored",
            sSemanticObject: "Object",
            bIgnoreFormFactor: true,
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            expectedGetMatchingTargetsIntent: {
                "action": undefined,
                "formFactor": undefined,
                "params": {},
                "semanticObject": "Object"
            }
        },
        {
            testDescription: "parameters are specified",
            sSemanticObject: "Object",
            bIgnoreFormFactor: true,
            mBusinessParams: {
                "p1": ["v1"],
                "p2": ["v3", "v2"]
            },
            sCurrentFormFactor: "mobile",
            expectedGetMatchingTargetsIntent: {
                "action": undefined,
                "formFactor": undefined,
                "params": {
                    "p1": ["v1"],
                    "p2": ["v3", "v2"]
                },
                "semanticObject": "Object"
            }
        },
        {
            testDescription: "semantic object is the empty string",
            sSemanticObject: "",
            bIgnoreFormFactor: false,
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            expectedGetMatchingTargetsIntent: {
                "action": undefined,
                "formFactor": "mobile",
                "semanticObject": undefined,
                "params": {}
            }
        }
    ].forEach(function (oFixture) {

        asyncTest("getLinks: calls _getMatchingInbounds with expected shell hash when " + oFixture.testDescription, function () {

            var oSrvc = createService();

            // Mock form factor
            sinon.stub(utils, "getFormFactor").returns(oFixture.sCurrentFormFactor);

            // Mock getMatchingInbounds
            sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                new jQuery.Deferred().resolve([]).promise()
            );

            // Act
            oSrvc.getLinks(oFixture.sSemanticObject, oFixture.mBusinessParams, oFixture.bIgnoreFormFactor)
                .done(function (aResultSemanticObjectLinks) {
                    // Assert
                    ok(true, "promise was resolved");
                    deepEqual(oSrvc._getMatchingInbounds.getCall(0).args[0], oFixture.expectedGetMatchingTargetsIntent,
                        "_getMatchingInbounds was called with expected intent object");
                })
                .fail(function () {
                    // Assert
                    ok(false, "promise was resolved");
                })
                .always(function () {
                    start();
                });

        });
    });

    [
        {
            testDescription: "semantic object is a number (nominal parameters)",
            sSemanticObject: 128,
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: true,
            sExpectedErrorMessage: "invalid semantic object",
            sExpectedErrorDetailsPart: "got [object Number] instead"
        },
        {
            testDescription: "semantic object is {} (nominal parameters)",
            sSemanticObject: {},
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: true,
            sExpectedErrorMessage: "invalid semantic object",
            sExpectedErrorDetailsPart: "got [object Object] instead"
        },
        {
            testDescription: "semantic object is [] (nominal parameters)",
            sSemanticObject: [],
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: true,
            sExpectedErrorMessage: "invalid semantic object",
            sExpectedErrorDetailsPart: "got [object Array] instead"
        },
        {
            testDescription: "action is not a string (nominal parameters)",
            sSemanticObject: "Object",
            sAction: false,
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: true,
            sExpectedErrorMessage: "invalid action",
            sExpectedErrorDetailsPart: "the action must be a string"
        },
        {
            testDescription: "action is not a string (nominal parameters)",
            sSemanticObject: "Object",
            sAction: "",
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: true,
            sExpectedErrorMessage: "invalid action",
            sExpectedErrorDetailsPart: "the action must not be an empty string"
        },
        {
            testDescription: "semantic object is undefined",
            sSemanticObject: undefined,
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: false,
            sExpectedErrorMessage: "invalid semantic object",
            sExpectedErrorDetailsPart: "got [object Undefined] instead"
        },
        {
            testDescription: "semantic object is a number",
            sSemanticObject: 128,
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: false,
            sExpectedErrorMessage: "invalid semantic object",
            sExpectedErrorDetailsPart: "got [object Number] instead"
        },
        {
            testDescription: "semantic object is {}",
            sSemanticObject: {},
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: false,
            sExpectedErrorMessage: "invalid semantic object",
            sExpectedErrorDetailsPart: "got [object Object] instead"
        },
        {
            testDescription: "semantic object is []",
            sSemanticObject: [],
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: false,
            sExpectedErrorMessage: "invalid semantic object",
            sExpectedErrorDetailsPart: "got [object Array] instead"
        },
        {
            testDescription: "semantic object is blank",
            sSemanticObject: " ",
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: false,
            sExpectedErrorMessage: "invalid semantic object",
            sExpectedErrorDetailsPart: "got ' ' instead"
        },
        {
            testDescription: "semantic object is many blanks",
            sSemanticObject: "    ",
            mBusinessParams: {},
            sCurrentFormFactor: "mobile",
            bUseNominalParameters: false,
            sExpectedErrorMessage: "invalid semantic object",
            sExpectedErrorDetailsPart: "got '    ' instead"
        }
    ].forEach(function (oFixture) {
        asyncTest("getLinks: logs an error and rejects promise when " + oFixture.testDescription, function () {

            var oSrvc = createService();

            sinon.stub(jQuery.sap.log, "error");

            // Mock form factor
            sinon.stub(utils, "getFormFactor").returns(oFixture.sCurrentFormFactor);

            // Mock getMatchingInbounds
            sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                new jQuery.Deferred().resolve([]).promise()
            );

            // Act
            var fnGetSemanticObjectLinksBound = oSrvc.getLinks.bind(oSrvc, oFixture.sSemanticObject, oFixture.mBusinessParams);
            if (oFixture.bUseNominalParameters) {
                fnGetSemanticObjectLinksBound = oSrvc.getLinks.bind(oSrvc, {
                    semanticObject: oFixture.sSemanticObject,
                    action: oFixture.sAction,
                    params: oFixture.oParams
                });
            }
            fnGetSemanticObjectLinksBound()
                .done(function (aResultSemanticObjectLinks) {
                    // Assert
                    ok(false, "promise was rejected");
                })
                .fail(function (sErrorMessage) {
                    // Assert
                    ok(true, "promise was rejected");
                    strictEqual(sErrorMessage, oFixture.sExpectedErrorMessage, "rejected with expected error message");
                    strictEqual(jQuery.sap.log.error.getCalls().length, 1, "jQuery.sap.log.error was called once");
                    strictEqual(jQuery.sap.log.error.getCall(0).args[0], "invalid input for _getLinks", "expected error title was logged");
                    ok(jQuery.sap.log.error.getCall(0).args[1].indexOf(oFixture.sExpectedErrorDetailsPart) >= 0, oFixture.sExpectedErrorDetailsPart + " was found in logged error details");
                    strictEqual(jQuery.sap.log.error.getCall(0).args[2], "sap.ushell.services.ClientSideTargetResolution", "error contains sap.ushell.services.ClientSideTargetResolution");
                })
                .always(function () {
                    start();
                });

        });

    });

    [
     {
         testLogLevel: [I_DEBUG],
         sSemanticObject: "Object",
         mBusinessParams: { "country": ["IT"] },
         bIgnoreFormFactor: true,
         sCurrentFormFactor: "desktop",
         aMockedResolutionResults: [
             {
                "matches": true,
                "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                "inbound": {
                    "title": "Currency manager",
                    "icon": "sap-icon://Fiori2/F0018",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title",
                    "semanticObject": "Object",
"action": "bbb",
                    "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                    "signature": { "parameters": {
                     "country": {
                         required: true
                     }
                   }}
                }
             },
             {
                "matches": true,
                "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                "inbound": {
                    "title": "Currency manager",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title",
                    "icon": "sap-icon://Fiori2/F0018",
                    "semanticObject": "Object",
"action": "ccc",
                    "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                    "signature": { "parameters": { }, "additionalParameters": "ignored" }
                }
             }
         ],
         expectedSemanticObjectLinks: [
             { "intent": "#Object-bbb?country=IT",
                 "text": "Currency manager",
                 "icon": "sap-icon://Fiori2/F0018",
                 "subTitle": "sub Title",
                 "shortTitle": "short Title" },
             { "intent": "#Object-ccc",
                 "text": "Currency manager",
                 "icon": "sap-icon://Fiori2/F0018",
                 "subTitle": "sub Title",
                 "shortTitle": "short Title" }
         ],
         expectedLogArgs: [
             "_getLinks filtered to unique intents.",
             /Reporting histogram:(.|\n)*#Object-bbb(.|\n)*#Object-ccc/,
             "sap.ushell.services.ClientSideTargetResolution"
         ]
     },
     {
         testLogLevel: [I_TRACE],
         sSemanticObject: "Object",
         mBusinessParams: { "country": ["IT"] },
         bIgnoreFormFactor: true,
         sCurrentFormFactor: "desktop",
         aMockedResolutionResults: [
             {
                "matches": true,
                "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                "inbound": {
                    "title": "Currency manager",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title",
                    "icon": "sap-icon://Fiori2/F0018",
                    "semanticObject": "Object",
"action": "bbb",
                    "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                    "signature": { "parameters": {
                     "country": {
                         required: true
                     }
                   }}
                }
             },
             {
                "matches": true,
                "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency?mode=desktop" },
                "inbound": {
                    "title": "Currency manager",
                    "subTitle": "sub Title",
                    "shortTitle": "short Title",
                    "icon": "sap-icon://Fiori2/F0018",
                    "semanticObject": "Object",
"action": "ccc",
                    "resolutionResult": { "additionalInformation": "SAPUI5.Component=Currency.Component", "applicationType": "URL", "text": "Currency manager (ignored text)", "ui5ComponentName": "Currency.Component", "url": "/url/to/currency" },
                    "signature": { "parameters": { }, "additionalParameters": "ignored" }
                }
             }
         ],
         expectedSemanticObjectLinks: [
              { "intent": "#Object-bbb?country=IT",
                  "text": "Currency manager",
                  "icon": "sap-icon://Fiori2/F0018",
                  "subTitle": "sub Title",
                  "shortTitle": "short Title" },
              { "intent": "#Object-ccc",
                  "text": "Currency manager",
                  "icon": "sap-icon://Fiori2/F0018",
                  "subTitle": "sub Title",
                  "shortTitle": "short Title"}
         ],
         expectedLogArgs: [
             "_getLinks filtered to the following unique intents:",
             /(.|\n)*#Object-bbb.*country=IT(.|\n)*#Object-ccc.*/,
             "sap.ushell.services.ClientSideTargetResolution"
         ]
     }
    ].forEach(function (oFixture) {
        asyncTest("getLinks: correctly logs resulting intents in log level " + oFixture.testLogLevel, function () {
            var oSrvc = createService(),
                oLogMock = testUtils.createLogMock().sloppy(true);

            // Check logging expectations via LogMock
            oLogMock.debug.apply(oLogMock, oFixture.expectedLogArgs);

            // LogMock doesn't keep the following original methods
            jQuery.sap.log.getLevel = sinon.stub().returns(oFixture.testLogLevel);
            jQuery.sap.log.Level = {
                DEBUG: I_DEBUG,
                TRACE: I_TRACE
            };

            // Mock form factor
            sinon.stub(utils, "getFormFactor").returns(oFixture.sCurrentFormFactor);

            // Mock getMatchingInbounds
            sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                new jQuery.Deferred().resolve(oFixture.aMockedResolutionResults).promise()
            );

            // Act
            oSrvc.getLinks(oFixture.sSemanticObject, oFixture.mBusinessParams, oFixture.bIgnoreFormFactor)
                .done(function (aResultSemanticObjectLinks) {
                    start();

                    // Assert
                    ok(true, "promise was resolved");
                    deepEqual(aResultSemanticObjectLinks, oFixture.expectedSemanticObjectLinks, "got expected array of semantic object links");
                    oLogMock.verify();
                })
                .fail(function () {
                    start();

                    // Assert
                    ok(false, "promise was resolved");
                });
        });
    });

    [
        {
            testDescription: "semantic object/actions are both passed",
            sCurrentFormFactor: "phone",
            sIntent: "#Object-action",
            oResolve: [{}],
            expectedResult: true,
            expectedGetMatchingTargetsIntent: {
                "semanticObject": "Object",
                "action": "action",
                "formFactor": "phone",
                "appSpecificRoute": undefined,
                "contextRaw": undefined,
                "params": {}
            }
        },
        {
            testDescription: "Parameters are passed",
            sCurrentFormFactor: "phone",
            sIntent: "#Object-action?p1=v1&p2=v2",
            oResolve: [],
            expectedResult: false,
            expectedGetMatchingTargetsIntent: {
                "semanticObject": "Object",
                "action": "action",
                "formFactor": "phone",
                "params": {
                    "p1": [ "v1" ],
                    "p2": [ "v2" ]
                },
                "appSpecificRoute": undefined,
                "contextRaw": undefined
            }
        },
        {
            testDescription: " emtpy hash is processed",
            sCurrentFormFactor: "phone",
            sIntent: "#",
            oResolve: [],
            expectedResult: true,
            expectedGetMatchingTargetsIntent: undefined
        }
    ].forEach(function (oFixture) {
        function prepareTest () {
            var oSrvc = createService();

            sinon.stub(utils, "getFormFactor").returns(oFixture.sCurrentFormFactor);

            sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                new jQuery.Deferred().resolve(oFixture.oResolve).promise()
            );

            return oSrvc;
        }

        asyncTest("_isIntentSupportedOne: calls _getMatchingInbounds with the expected shell hash when " + oFixture.testDescription, function () {
            var oSrvc = prepareTest();

            // Act
            oSrvc._isIntentSupportedOne(oFixture.sIntent).done(function (oResult) {
                ok(true, "promise was resolved");
                equal(oResult, oFixture.expectedResult, "result ok");
                if (oFixture.expectedGetMatchingTargetsIntent) {
                    deepEqual(oSrvc._getMatchingInbounds.getCall(0).args[0], oFixture.expectedGetMatchingTargetsIntent,
                    "_getMatchingInbounds was called with the expected shell hash");
                } else {
                    equal(oSrvc._getMatchingInbounds.called, false, " _getMatchingInbounds not called!");
                }
            }).fail(function () {
                ok(false, "promise was resolved");
            }).always(function () {
                start();
            });
        });

        asyncTest("_isIntentSupportedOne: calls _getMatchingInbounds with the expected bExcludeTileInbounds argument when " + oFixture.testDescription, function () {
            var oSrvc = prepareTest();

            // Act
            oSrvc._isIntentSupportedOne(oFixture.sIntent).done(function (oResult) {
                ok(true, "promise was resolved");
                testExcludeTileIntentArgument(oSrvc, true);
            }).fail(function () {
                ok(false, "promise was resolved");
            }).always(function () {
                start();
            });

        });
    });

    asyncTest("resolveTileIntentInContext: works as expected when _resolveTileIntent resolves", function () {
        var oResolvedIntentExpected,
            oFakeThis,
            aFakeInbounds;

        oResolvedIntentExpected = { RESOLVED: "INTENT" };

        // Arrange
        aFakeInbounds = [{
            semanticObject: "Test",
            action: "inbound"
        }];

        oFakeThis = {
            _resolveTileIntent: sinon.stub().returns(
                new jQuery.Deferred().resolve(oResolvedIntentExpected).promise()
            )
        };

        // Act
        ClientSideTargetResolution.prototype.resolveTileIntentInContext.call(
            oFakeThis, aFakeInbounds, "#Test-inbound"
        ).done(function (oResolvedIntentGot) {
            // Assert
            ok(true, "the promise was resolved");
            deepEqual(oResolvedIntentGot, oResolvedIntentExpected,
                "promise resolved with the expected resolved intent");

            strictEqual(oFakeThis._resolveTileIntent.callCount, 1,
                "_resolveTileIntent was called once");

            var oExpectedInboundIndexArg = oFakeThis._resolveTileIntent.getCall(0).args[2];

            strictEqual(oExpectedInboundIndexArg.hasOwnProperty("index"), true,
                "third argument of _resolveTileIntent looks like an inbound index"
            );
            deepEqual(oExpectedInboundIndexArg.index.all, aFakeInbounds.concat(A_VIRTUAL_INBOUNDS),
                "the inbound index given to _resolveTileIntent includes both the inbounds in the scope and the virtual inbounds");
        }).fail(function () {
            // Assert
            ok(false, "the promise was resolved");
        }).always(function () {
            start();
        });
    });

    asyncTest("resolveTileIntentInContext: works as expected when _resolveTileIntent rejects", function () {
        var oFakeThis,
            aFakeInbounds;

        // Arrange
        aFakeInbounds = [];

        oFakeThis = {
            _resolveTileIntent: sinon.stub().returns(
                new jQuery.Deferred().reject("Something bad").promise()
            )
        };

        // Act
        ClientSideTargetResolution.prototype.resolveTileIntentInContext.call(
            oFakeThis, aFakeInbounds, "#Test-inbound"
        ).done(function () {
            ok(false, "the promise was rejected");
        }).fail(function (sError) {
            ok(true, "the promise was rejected");
            strictEqual(sError, "Something bad",
                "the promise was rejected with the expected error message");
        }).always(function () {
            start();
        });
    });

    asyncTest("_resolveTileIntent: calls _getMatchingInbounds with false bExcludeTileInbounds arguments", function () {
        var oSrvc = createService();

        sinon.stub(oSrvc, "_getURLParsing").returns({
            parseShellHash: sinon.stub().returns({ "parsed": "shellHash" })
        });
        sinon.stub(oSrvc, "_getMatchingInbounds").returns(
            new jQuery.Deferred().resolve({}, []).promise()
        );
        sinon.stub(oSrvc, "_resolveSingleMatchingTileIntent").returns(
            new jQuery.Deferred().resolve().promise()
        );


        oSrvc._resolveTileIntent("#Sample-hash", null, [])
            .done(function () {
                ok(true, "promise was resolved");
                testExcludeTileIntentArgument(oSrvc, false /* expected bExcludeTileInbounds */);
            })
            .fail(function () {
                ok(false, "promise was resolved");
            })
            .always(function () {
                start();
            });
    });

    [
        {
            testDescription: "multiple intents are given",
            aInbounds: [{
                "semanticObject": "Action",
                "action": "toappnavsample",
                "title": "Title",
                "resolutionResult": {
                    "applicationType": "SAPUI5",
                    "additionalInformation": "SAPUI5.Component=sap.ushell.demo.Inbound",
                    "text": "Text",
                    "ui5ComponentName": "sap.ushell.demo.Inbound",
                    "applicationDependencies": {
                        "name": "sap.ushell.demo.Inbound",
                        "self": {
                            "name": "sap.ushell.demo.Inbound"
                        }
                    },
                    "url": "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/AppNavSample",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            }, {
                "semanticObject": "Object",
                "action": "action",
                "title": "Object action",
                "resolutionResult": {
                    "applicationType": "SAPUI5",
                    "additionalInformation": "SAPUI5.Component=sap.ushell.demo.Inbound",
                    "text": "Text",
                    "ui5ComponentName": "sap.ushell.demo.Inbound",
                    "applicationDependencies": {
                        "name": "sap.ushell.demo.Inbound",
                        "self": {
                            "name": "sap.ushell.demo.Inbound"
                        }
                    },
                    "url": "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/AppNavSample",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "notallowed",
                    "parameters": {
                        "P1": {
                            required: true
                        }
                    }
                }
            }],
            sCurrentFormFactor: "desktop",
            aIsIntentSupportedArg: [
                "#Action-toappnavsample", "#Object-action?P1=V1", "#Action-nonexisting"
            ],
            expectedResult: {
                "#Action-toappnavsample": {
                    "supported": true
                },
                "#Object-action?P1=V1": {
                    "supported": true
                },
                "#Action-nonexisting": {
                    "supported": false
                }
            }
        }
    ].forEach(function (oFixture) {
        asyncTest("isIntentSupported: works as expected when " + oFixture.testDescription, function () {
            var oSrvc = createService({
                inbounds: oFixture.aInbounds
            });

            sinon.stub(utils, "getFormFactor").returns(oFixture.sCurrentFormFactor);

            // Act
            oSrvc.isIntentSupported(oFixture.aIsIntentSupportedArg).done(function (oResult) {
                ok(true, "promise was resolved");
                deepEqual(oResult, oFixture.expectedResult, "result ok");
            }).fail(function () {
                ok(false, "promise was resolved");
            }).always(function () {
                start();
            });
        });
    });

    asyncTest("isIntentSupported rejects promise with error message when one intent is not supported", function () {
        var oSrvc = createService();

        sinon.stub(oSrvc, "_isIntentSupportedOne", function (sIntent) {
            return new jQuery.Deferred().reject(sIntent + " was rejected").promise();
        });

        oSrvc.isIntentSupported(["#Action-test1", "#Action-test2"]).done(function (oResult) {
            ok(false, "promise was rejected");
        }).fail(function (sReason) {
            ok(true, "promise was rejected");
            strictEqual(sReason, "One or more input intents contain errors: #Action-test1 was rejected, #Action-test2 was rejected");
        }).always(function () {
            start();
        });
    });


    [
        {
            testDescription: "Generic semantic object is passed",
            sCurrentFormFactor: "mobile",
            sIntent: "#*-action"
        },
        {
            testDescription: "empty semantic object is passed",
            sCurrentFormFactor: "mobile",
            sIntent: "#-action"
        },
        {
            testDescription: "* is passed in action",
            sCurrentFormFactor: "mobile",
            sIntent: "#Object-*"
        },
        {
            testDescription: "blank is passed in semantic object",
            sCurrentFormFactor: "mobile",
            sIntent: "# -*"
        },
        {
            testDescription: "many blanks are passed in semantic object",
            sCurrentFormFactor: "mobile",
            sIntent: "# -*"
        }
    ].forEach(function (oFixture) {
        asyncTest("_isIntentSupportedOne: rejects promise when " + oFixture.testDescription, function () {
            var oSrvc = createService();
            sinon.stub(utils, "getFormFactor").returns(oFixture.sCurrentFormFactor);

            sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                new jQuery.Deferred().resolve([{/*empty tm*/}]).promise()
            );

            // Act
            oSrvc._isIntentSupportedOne(oFixture.sIntent).done(function () {
                ok(false, "promise was rejected");
            }).fail(function () {
                ok(true, "promise was rejected");
            }).always(function () {
                start();
            });
        });
    });



    [
        {
            testDescription: "no parameters are specified in URL",
            oDefaultedParamNames: [],
            sResolutionResultUrl: "/some/url",
            expectedResolutionResultUrl: "/some/url" // no parameter is even added
        },
        {
            testDescription: "default parameters specified",
            oDefaultedParamNames: ["Name1", "Name2"],
            sResolutionResultUrl: "/some/url",
            expectedResolutionResultUrl: "/some/url?sap-ushell-defaultedParameterNames=%5B%22Name1%22%2C%22Name2%22%5D"
        },
        {
            testDescription: "url contains a parameter already",
            oDefaultedParamNames: ["Name2", "Name1"],
            sResolutionResultUrl: "/some/url?urlparam1=foo",
            expectedResolutionResultUrl: "/some/url?urlparam1=foo&sap-ushell-defaultedParameterNames=%5B%22Name1%22%2C%22Name2%22%5D"
        },
        {
            testDescription: "parameter names contain '&' and '?'",
            oDefaultedParamNames: ["Nam&2", "Na?me1"],
            sResolutionResultUrl: "/some/url?urlparam1=foo",
            expectedResolutionResultUrl: "/some/url?urlparam1=foo&sap-ushell-defaultedParameterNames=%5B%22Na%3Fme1%22%2C%22Nam%262%22%5D"
        }
    ].forEach(function (oFixture) {

        asyncTest("_resolveHashFragment: correctly adds sap-ushell-defaultedParameterNames when " + oFixture.testDescription, function () {
            var oSrvc = createService(),
                aFakeMatchingTargets = [{
                    defaultedParamNames: oFixture.oDefaultedParamNames,
                    resolutionResult: {
                        url: oFixture.sResolutionResultUrl
                    },
                    inbound: {
                        resolutionResult: {
                            applicationType: "SAPUI5",
                            additionalInformation: "SAPUI5.Component=com.sap.cus",
                            url: oFixture.sResolutionResultUrl
                        }
                    },
                    intentParamsPlusAllDefaults: []
                }];

            // returns the default parameter names after resolution
            sinon.stub(oSrvc, "_getMatchingInbounds").returns(
                new jQuery.Deferred().resolve(aFakeMatchingTargets).promise()
            );

            oSrvc._resolveHashFragment("SO-action")
                .done(function (oResolutionResult) {
                    ok(true, "promise was resolved");
                    strictEqual(oResolutionResult.url, oFixture.expectedResolutionResultUrl,
                        "defaulted parameter names were correctly appended to result url");
                })
                .fail(function () {
                    ok(false, "promise was resolved");
                })
                .always(function () {
                    start();
                });
        });
    });


    // parameter mapping

    asyncTest("_constructFallbackResolutionResult: logs an error when fallback function is passed as undefined", function () {
        var oSrvc = createService();

        sinon.stub(jQuery.sap.log, "error");
        sinon.stub(jQuery.sap.log, "warning");

        oSrvc._constructFallbackResolutionResult(
            { /*oMatchingTarget*/
                intentParamsPlusAllDefaults: {},
                defaultedParamNames: []
            },
            undefined /*fnBoundFallback*/,
            "#Action-toappnavsample"/*sFixedHashFragment*/
        )
        .then(function () {
            ok(false, "the promise returned by _constructFallbackResolutionResult was rejected");
        }, function (sErrorMessage) {
            var iTimesErrorCalled;
            ok(true, "the promise returned by _constructFallbackResolutionResult was rejected");

            strictEqual(sErrorMessage, "Cannot resolve hash fragment: no fallback provided.",
                "the promise was rejected with expected error message");

            // test warnings
            strictEqual(jQuery.sap.log.warning.getCalls().length, 0, "jQuery.sap.log.warning was called 0 times");

            // test error message
            iTimesErrorCalled = jQuery.sap.log.error.getCalls().length;
            strictEqual(iTimesErrorCalled, 1, "jQuery.sap.log.warning was called 1 time");
            if (iTimesErrorCalled) {
                deepEqual(jQuery.sap.log.error.getCall(0).args, [
                    "Cannot resolve hash fragment",
                    "#Action-toappnavsample has matched an inbound that cannot be resolved client side and no resolveHashFragmentFallback method was implemented in ClientSideTargetResolutionAdapter",
                    "sap.ushell.services.ClientSideTargetResolution"
                ], "the error was logged as expected");
            }
        })
        .then(start, start);
    });

    asyncTest("resolveHashFragment: allows adapter to not implement fallback method", function () {
        var oFakeAdapter = {
            getInbounds: sinon.stub().returns(
                new jQuery.Deferred().resolve([]).promise()
            )
        };

        var oSrvc = new ClientSideTargetResolution(oFakeAdapter, null, null, null);

        sinon.stub(oSrvc, "_resolveHashFragment").returns(new jQuery.Deferred().resolve({}).promise());

        try {
            oSrvc.resolveHashFragment("#Action-toappnavsample")
                .always(function () {
                    var iResolveHashFragmentCallCount = oSrvc._resolveHashFragment.getCalls().length;
                    strictEqual(iResolveHashFragmentCallCount, 1, "_resolveHashFragment was called 1 time");
                    if (iResolveHashFragmentCallCount === 1) {
                        strictEqual(typeof oSrvc._resolveHashFragment.getCall(0).args[1], "undefined", "_resolveHashFragment was called with undefined fallback function");
                    }

                    start();
                });
        } catch (oError) {
            ok(false, "resolveHashFragment did not throw an exception");
            start();
        }
    });

    asyncTest("resolveHashFragment calls _getMatchingInbounds with the expected third argument", function () {
        // Arrange
        sinon.stub(InboundProvider.prototype, "getInbounds").returns(
            new Promise(function (fnResolve) { fnResolve(); })
        );

        var oSrvc = createService(),
            sAnyHashFragment = "#Some-hashFragment";

        sinon.stub(oSrvc, "_getURLParsing").returns({
            parseShellHash: sinon.stub().returns({ "parsed": "shellHash" })
        });

        sinon.stub(oSrvc, "_getMatchingInbounds").returns(
            new jQuery.Deferred().resolve([{ semanticObject: "Some", action: "hashFragment" }]).promise()
        );
        sinon.stub(oSrvc, "_resolveSingleMatchingTarget").returns(
            new jQuery.Deferred().resolve([]).promise()
        );

        // Act
        oSrvc.resolveHashFragment(sAnyHashFragment)
            .done(function () {
                ok(true, "promise was resolved");
                testExcludeTileIntentArgument(oSrvc, true);
            })
            .fail(function () {
                ok(false, "promise was resolved");
            })
            .always(function () {
                start();
            });
    });

    /*
     * A complete resolveHashFragment test, mocking only AppState, check that
     * everything works semantically together (black box).
     */
    [
        {
            "testDescription": "Full local webgui resolution with intent parameters",
            "intent": "SpoolRequest-display?JobCount=pYRJlwlG&JobName=FA163E2CC4811ED6BCD8CCCFB7A47242",
            "UserDefaultParameters": {},
            "oKnownSapSystemData": {
                // Mocks expansions from ClientSideTargetResolutionAdapter#resolveSystemAlias
                "NW": {
                    http: {
                        id: "NW_HTTP",
                        host: "example.corp.com",
                        port: 50055,
                        pathPrefix: ""
                    },
                    https: {
                        id: "NW_HTTPS",
                        host: "example.corp.com",
                        port: 44355,
                        pathPrefix: ""
                    },
                    rfc: {
                        id: "NW",
                        systemId: "NW3",
                        host: "example.corp.com",
                        port: 0,
                        loginGroup: "PUBLIC",
                        sncNameR3: "p/secude:CN=UR3, O=SAP-AG, C=DE",
                        sncQoPR3: "8"
                    },
                    id: "NW",
                    client: "120",
                    language: ""
                }
            },
            "inbound": {
                "semanticObject": "SpoolRequest",
                "action": "display",
                "title": "Display Spoolrequests",
                "resolutionResult": {
                    "componentProperties": {
                        "url": "/sap/bc/gui/sap/its/webgui;~sysid=UXV;~service=3200?%7etransaction=SP01_SIMPLE&%7enosplash=1",
                        "siteId": "4fbb8326-f630-497b-83c5-6cf48371715d",
                        "appId": "X-SAP-UI2-ADCAT:SAP_NW_BE_APPS:NW:005056AB5B8D1EE5BFAFFCA268719CAF_TM"
                    },
                    "sap.platform.runtime": {
                        "componentProperties": {
                            "url": "/sap/bc/gui/sap/its/webgui;~sysid=UXV;~service=3200?%7etransaction=SP01_SIMPLE&%7enosplash=1",
                            "siteId": "4fbb8326-f630-497b-83c5-6cf48371715d",
                            "appId": "X-SAP-UI2-ADCAT:SAP_NW_BE_APPS:NW:005056AB5B8D1EE5BFAFFCA268719CAF_TM"
                        }
                    },
                    "sap.gui": {
                        "_version": "1.2.0",
                        "transaction": "SP01_SIMPLE"
                    },
                    "applicationType": "TR",
                    "systemAlias": "NW",
                    "text": "Display Spoolrequests",
                    "url": "https://domain.example.it:44300/sap/bc/gui/sap/its/webgui;?%7etransaction=SP01_SIMPLE&%7enosplash=1&sap-client=910&sap-language=EN"
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": false,
                    "phone": false
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_OKCODE": {
                            "required": false,
                            "renameTo": "SSCRFIELDS-UCOMM",
                            "defaultValue": {
                                "value": "ONLI"
                            }
                        },
                        "JobCount": {
                            "required": true,
                            "renameTo": "JOBCOUNT"
                        },
                        "JobName": {
                            "required": true,
                            "renameTo": "JOBNAME"
                        }
                    }
                },
                "tileResolutionResult": {
                    "title": "Display Spoolrequests",
                    "tileComponentLoadInfo": "#Shell-staticTile",
                    "isCustomTile": false
                }
            },
            "expectedResolve": true,
            "expectedUrl": "https://example.corp.com:44355/sap/bc/gui/sap/its/webgui;~sysid=NW3;~loginGroup=PUBLIC;~messageServer=p%2fsecude%3aCN%3dUR3%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncNameR3=p%2fsecude%3aCN%3dUR3%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncQoPR3=8?%7etransaction=*SP01_SIMPLE%20JOBCOUNT%3dpYRJlwlG%3bJOBNAME%3dFA163E2CC4811ED6BCD8CCCFB7A47242%3bSSCRFIELDS-UCOMM%3dONLI&%7enosplash=1&sap-client=120&sap-language=en"
        },
        {
            // see BCP: 466862 / 2017 .
            "testDescription": "URI with sap-system",
            "UserDefaultParameters": {},
            "intent": "NZPayroll-display?sap-system=NW", // sap-system is not applied to URIs
            "inbound": {
                "semanticObject": "NZPayroll",
                "action": "display",
                "id": "<NOT USED>",
                "title": "title",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "sap-nwbc://https://some-pt.it.something.net/nwbc/~roletest/ABCDEFGHIL_NWBC_NZ_PAYROLL_MGR",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            },
            "expectedResolve": true,
            "expectedUrl": "sap-nwbc://https://some-pt.it.something.net/nwbc/~roletest/ABCDEFGHIL_NWBC_NZ_PAYROLL_MGR"
        },
        {
            // see BCP: 466862 / 2017 .
            "testDescription": "URI without sap-system",
            "UserDefaultParameters": {},
            "intent": "NZPayroll-display",
            "inbound": {
                "semanticObject": "NZPayroll",
                "action": "display",
                "id": "<NOT USED>",
                "title": "title",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "sap-nwbc://https://some-pt.it.something.net/nwbc/~roletest/ABCDEFGHIL_NWBC_NZ_PAYROLL_MGR",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            },
            "expectedResolve": true,
            "expectedUrl": "sap-nwbc://https://some-pt.it.something.net/nwbc/~roletest/ABCDEFGHIL_NWBC_NZ_PAYROLL_MGR"
        },
        {
            "testDescription": "UI5 with absent URL",
            "UserDefaultParameters": {},
            "intent": "Action-toui5absenturl",
            "inbound": {
                "semanticObject": "Action",
                "action": "toui5absenturl",
                "id": "Action-toui5absenturl~6Ni",
                "title": "UI5 APP With absent URL",
                "resolutionResult": {
                    "applicationType": "SAPUI5",
                    "additionalInformation": "",
                    "text": "UI5 App Without URL",
                    // NOTE: "url" is absent
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            },
            "expectedResolve": false,
            "expectedRejectError": "Cannot resolve intent: url was not specified in matched inbound"
        },
        {
            "testDescription": "UI5 with empty URL",
            "UserDefaultParameters": {},
            "intent": "Action-toui5nourl",
            "inbound": {
                "semanticObject": "Action",
                "action": "toui5nourl",
                "id": "Action-toui5nourl~6Ni",
                "title": "UI5 APP Without URL",
                "resolutionResult": {
                    "applicationType": "SAPUI5",
                    "additionalInformation": "",
                    "text": "UI5 App Without URL",
                    "url": "", // NOTE: empty URL
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            },
            "expectedResolve": true,
            "expectedUrl": ""
        },
        {
            "testDescription": "UI5 with undefined URL",
            "UserDefaultParameters": {},
            "intent": "Action-toui5nourl",
            "inbound": {
                "semanticObject": "Action",
                "action": "toui5nourl",
                "id": "Action-toui5nourl~6Ni",
                "title": "UI5 APP Without URL",
                "resolutionResult": {
                    "applicationType": "SAPUI5",
                    "additionalInformation": "",
                    "text": "UI5 App Without URL",
                    "url": undefined, // NOTE: undefined URL
                    "systemAlias": "",
                    "applicationDependencies": {
                        "manifestUrl": "/some/url" // NOTE: url specified here
                    }
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            },
            "expectedResolve": true,
            "expectedUrl": ""
        },
        {
            "testDescription": "UI5 with no URL and manifestUrl specified in applicationDependencies",
            "UserDefaultParameters": {},
            "intent": "Action-toui5nourl",
            "inbound": {
                "semanticObject": "Action",
                "action": "toui5nourl",
                "id": "Action-toui5nourl~6Ni",
                "title": "UI5 APP Without URL but with manifestUrl",
                "resolutionResult": {
                    "applicationType": "SAPUI5",
                    "additionalInformation": "",
                    "text": "UI5 App Without URL",
                    // url is undefined
                    "systemAlias": "",
                    "applicationDependencies": {
                        "manifestUrl": "/some/url" // NOTE: url specified here
                    }
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            },
            "expectedResolve": true,
            "expectedUrl": ""
        },
        {
            "testDescription": "UI5 with both URL and manifestUrl specified in applicationDependencies",
            "UserDefaultParameters": {},
            "intent": "Action-toui5nourl",
            "inbound": {
                "semanticObject": "Action",
                "action": "toui5nourl",
                "id": "Action-toui5nourl~6Ni",
                "title": "UI5 APP Without URL but with manifestUrl",
                "resolutionResult": {
                    "applicationType": "SAPUI5",
                    "additionalInformation": "",
                    "text": "UI5 App Without URL",
                    "url": "/some/url/1",
                    "systemAlias": "",
                    "applicationDependencies": {
                        "manifestUrl": "/some/url2"
                    }
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            },
            "expectedResolve": true,
            "expectedUrl": "/some/url/1" // URL is not empty
        },
        {
            "testDescription": "Transaction SU01 via designer",
            "UserDefaultParameters": {},
            "intent": "Action-case1",
            "inbound": {
                "semanticObject": "Action",
                "action": "case1",
                "id": "Action-case1~6Ni",
                "title": "SU01",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "SU01",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 via designer with 'sap', '~', and neutral default parameters",
            "UserDefaultParameters": {},
            "intent": "Action-case2",
            "inbound": {
                "semanticObject": "Action",
                "action": "case2",
                "id": "Action-case2~6Nj",
                "title": "SU01",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "SU01",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "sap-theme": {
                            "defaultValue": {
                                "value": "sap_hcb",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "~PARAM": {
                            "defaultValue": {
                                "value": "tilde",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "NeutralParam": {
                            "defaultValue": {
                                "value": "neutral",
                                "format": "plain"
                            },
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01%20NEUTRALPARAM%3dneutral&%7enosplash=1&sap-client=120&sap-language=EN&sap-theme=sap_hcb&%7ePARAM=tilde"
        },
        {
            "testDescription": "Transaction SU01 via LPD_CUST",
            "UserDefaultParameters": {},
            "intent": "Action-case3",
            "inbound": {
                "semanticObject": "Action",
                "action": "case3",
                "id": "Action-case3~6Nk",
                "title": "User Maintenance WebGUI",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "User Maintenance WebGUI",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 via LPD_CUST + batch input",
            "UserDefaultParameters": {},
            "intent": "Action-case4",
            "inbound": {
                "semanticObject": "Action",
                "action": "case4",
                "id": "Action-case4~6Nl",
                "title": "Test4",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test4",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 via LPD_CUST + batch input + parameter mappings",
            "UserDefaultParameters": {},
            "intent": "Action-case5",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "pfrom": {
                            "defaultValue": {
                                "value": "pfrom_value",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "tildefrom": {
                            "defaultValue": {
                                "value": "tildefrom_value",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "sap-from": {
                            "defaultValue": {
                                "value": "sapfrom_value",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "PFROM1": {
                            "renameTo": "SAP-THEME"
                        },
                        "SAP-FROM": {
                            "renameTo": "SAP-TO"
                        },
                        "TILDEFROM": {
                            "renameTo": "~TILDETO"
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01%20PFROM%3dpfrom_value%3bTILDEFROM%3dtildefrom_value&%7enosplash=1&sap-client=120&sap-from=sapfrom_value&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with defaulted DYNP_OKCODE and parameters : with OKCODE",
            "UserDefaultParameters": {},
            "intent": "Action-case5?p1=ABC",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_OKCODE": {
                            "defaultValue": {
                                "value": "STARTME",
                                "format": "plain"
                            },
                            "required": true
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01%20DYNP_OKCODE%3dSTARTME%3bP1%3dABC&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with required DYNP_NO1ST parameter (but default value)",
            "UserDefaultParameters": {},
            "intent": "Action-case5",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_NO1ST": {
                            "defaultValue": {
                                "value": "1",
                                "format": "plain"
                            },
                            "required": true
                        }

                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01%20DYNP_NO1ST%3d1&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 with default DYNP_NO1ST parameter only",
            "UserDefaultParameters": {},
            "intent": "Action-case5",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_NO1ST": {
                            "defaultValue": {
                                "value": "1",
                                "format": "plain"
                            },
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with defaulted DYNP_OKCODE and DYNP_NO1ST parameters : with OKCODE",
            "UserDefaultParameters": {},
            "intent": "Action-case5?p1=ABC",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_OKCODE": {
                            "defaultValue": {
                                "value": "STARTME",
                                "format": "plain"
                            },
                            "required": true
                        },
                        "DYNP_NO1ST": {
                            "defaultValue": {
                                "value": "SKIPPMEDURINGBACK",
                                "format": "plain"
                            },
                            "required": false
                        }

                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01%20DYNP_NO1ST%3dSKIPPMEDURINGBACK%3bDYNP_OKCODE%3dSTARTME%3bP1%3dABC&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with defaulted DYNP_OKCODE but no parameters: no OKCODE",
            "UserDefaultParameters": {},
            "intent": "Action-case5",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_OKCODE": {
                            "defaultValue": {
                                "value": "STARTME",
                                "format": "plain"
                            },
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with defaulted DYNP_OKCODE and DYNP_NO1ST but no parameters: no OKCODE",
            "UserDefaultParameters": {},
            "intent": "Action-case5",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_OKCODE": {
                            "defaultValue": {
                                "value": "STARTME",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "DYNP_NO1ST": {
                            "defaultValue": {
                                "value": "SKIP_ME",
                                "format": "plain"
                            }
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with defaulted DYNP_NO1ST but no parameters: no OKCODE",
            "UserDefaultParameters": {},
            "intent": "Action-case5",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_OKCODE": {
                            "defaultValue": {
                                "value": "STARTME",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "DYNP_NO1ST": {
                            "defaultValue": {
                                "value": "SKIP_ME",
                                "format": "plain"
                            }
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with defaulted DYNP_NO1ST but no parameters: no OKCODE, wrapped case",
            "UserDefaultParameters": {},
            "intent": "Action-case5",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3dD%25N%3bP_OBJECT%3d%3bP_OKCODE%3dO%3fK%25A%2fI%3bP_PRGRAM%3dPROGRAM%7e1%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN",
"systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_OKCODE": {
                            "defaultValue": {
                                "value": "STARTME",
                                "format": "plain"
                            },
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl":
            "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3dD%25N%3bP_OBJECT%3dDYNP_OKCODE%2521STARTME%3bP_OKCODE%3dO%3fK%25A%2fI%3bP_PRGRAM%3dPROGRAM%7e1%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with defaulted DYNP_OKCODE but no parameters (only sap- parameters): no OKCODE",
            "UserDefaultParameters": {},
            "intent": "Action-case5",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "sap-from": {
                            "defaultValue": {
                                "value": "sapfrom_value",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "DYNP_OKCODE": {
                            "defaultValue": {
                                "value": "STARTME",
                                "format": "plain"
                            },
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-from=sapfrom_value&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with defaulted DYNP_OKCODE but required : with OKCODE",
            "UserDefaultParameters": {},
            "intent": "Action-case5",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "DYNP_OKCODE": {
                            "defaultValue": {
                                "value": "STARTME",
                                "format": "plain"
                            },
                            "required": true
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01%20DYNP_OKCODE%3dSTARTME&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with supplied Dynp_OkCode but no parameters: no OKCODE",
            "UserDefaultParameters": {},
            "intent": "Action-case5?Dynp_OkCode=GO1234",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 direct with supplied Dynp_OkCode but and parameters: with OKCODE",
            "UserDefaultParameters": {},
            "intent": "Action-case5?Dynp_OkCode=GO1234&ABC=DEF",
            "inbound": {
                "semanticObject": "Action",
                "action": "case5",
                "id": "Action-case5~6Nm",
                "title": "Test5",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test5",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01%20ABC%3dDEF%3bDYNP_OKCODE%3dGO1234&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 via LPD_CUST + batch input + parameter mappings + Not completed by COMMIT",
            "UserDefaultParameters": {},
            "intent": "Action-case6",
            "inbound": {
                "semanticObject": "Action",
                "action": "case6",
                "id": "Action-case6~6Nn",
                "title": "Test6",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test6",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3dD%25N%3bP_OBJECT%3d%3bP_OKCODE%3dO%3fK%25A%2fI%3bP_PRGRAM%3dPROGRAM%7e1%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "pfrom": {
                            "defaultValue": {
                                "value": "pfrom_value",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "tildefrom": {
                            "defaultValue": {
                                "value": "tildefrom_value",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "sap-from": {
                            "defaultValue": {
                                "value": "sapfrom_value",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "PFROM1": {
                            "renameTo": "SAP-THEME"
                        },
                        "SAP-FROM": {
                            "renameTo": "SAP-TO"
                        },
                        "TILDEFROM": {
                            "renameTo": "~TILDETO"
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3dD%25N%3bP_OBJECT%3dpfrom%2521pfrom_value%2525sap-from%2521sapfrom_value%2525tildefrom%2521tildefrom_value%3bP_OKCODE%3dO%3fK%25A%2fI%3bP_PRGRAM%3dPROGRAM%7e1%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 via Designer + sap-parameter called with intent sap-parameter with different value.",
            "UserDefaultParameters": {},
            "intent": "Action-case7?sap-parameter=valueB",
            "inbound": {
                "semanticObject": "Action",
                "action": "case7",
                "id": "Action-case7~6ND",
                "title": "Case 7",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Case 7",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "sap-parameter": {
                            "defaultValue": {
                                "value": "valueA",
                                "format": "plain"
                            },
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN&sap-parameter=valueB"
        },
        {
            "testDescription": "Transaction SU01 via LPD_CUST + sap- forced parameter in LPD_CUST",
            "UserDefaultParameters": {},
            "intent": "Action-case8",
            "inbound": {
               "semanticObject": "Action",
               "action": "case8",
               "id": "Action-case8~6NE",
               "title": "Test8",
               "resolutionResult": {
                   "applicationType": "TR",
                   "additionalInformation": "",
                   "text": "Test8",
                   "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01%20%3d&%7enosplash=1&sap-theme=sap_gemstone&sap-fiori=1&%7eWEBGUI_ICON_TOOLBAR=0&sap-personas-runmode=0&sap-client=120&sap-language=EN",
                   "systemAlias": ""
               },
               "deviceTypes": {
                   "desktop": true,
                   "tablet": true,
                   "phone": true
               },
               "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                       "undefined": {
                           "required": false
                       }
                   }
               }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&%7eWEBGUI_ICON_TOOLBAR=0&sap-client=120&sap-fiori=1&sap-language=EN&sap-personas-runmode=0&sap-theme=sap_gemstone"
        },
        {
            "testDescription": "Transaction SU01 via Designer + forbidden parameters",
            "UserDefaultParameters": {},
            "intent": "Action-case8b",
            "inbound": {
                "semanticObject": "Action",
                "action": "case8b",
                "id": "Action-case9~6NF",
                "title": "Case 9",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Case 8b native url",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "sap-Wd-run-SC": {
                            "defaultValue": {
                                "value": "1",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "sap-wd-auTo-detect": {
                            "defaultValue": {
                                "value": "1",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "sap-EP-version": {
                            "defaultValue": {
                                "value": "1.32",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "sap-theme": {
                            "defaultValue": {
                                "value": "sap_hcc",
                                "format": "plain"
                            },
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN&sap-theme=sap_hcc"
        },
        {
            "testDescription": "WebGui transaction via full url generation (sap.gui in resolution result)",
            "UserDefaultParameters": {},
            "oKnownSapSystemData": { // Optional fixture parameter
                // Mocks expansions from ClientSideTargetResolutionAdapter#resolveSystemAlias
                "UR3CLNT120": { // <- convenience index for this test
                http: {
                    id: "UR3CLNT120_HTTP",
                    host: "example.corp.com",
                    port: "50055", // string also ok for the port
                    pathPrefix: ""
                },
                https: {
                    id: "UR3CLNT120_HTTPS",
                    host: "example.corp.com",
                    port: "44355",
                    pathPrefix: ""
                },
                rfc: {
                    id: "UR3CLNT120",
                    systemId: "UR3",
                    host: "example.corp.com",
                    port: 0,
                    loginGroup: "PUBLIC",
                    sncNameR3: "p/secude:CN=UR3, O=SAP-AG, C=DE",
                    sncQoPR3: "8"
                },
                id: "UR3CLNT120",
                client: "120",
                language: ""
             }
            },
            "intent": "Action-case10",
            "inbound": {
                "semanticObject": "Action",
                "action": "case10",
                "id": "Action-case10~8NG",
                "title": "Test 10",
                "resolutionResult": {
                    "applicationType": "TR",
                    "sap.gui": {
                        "transaction": "SU01"
                    },
                    "text": "Test 10",
                    "systemAlias": "UR3CLNT120"
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl":
                "https://example.corp.com:44355/sap/bc/gui/sap/its/webgui;~sysid=UR3;~loginGroup=PUBLIC;~messageServer=p%2fsecude%3aCN%3dUR3%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncNameR3=p%2fsecude%3aCN%3dUR3%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncQoPR3=8?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=en"
        },
        {
            "testDescription": "WDA transaction via full url generation",
            "UserDefaultParameters": {},
            "intent": "Action-case10",
            "oKnownSapSystemData": { // Optional fixture parameter
                // Mocks expansions from ClientSideTargetResolutionAdapter#resolveSystemAlias
                "UR3CLNT120": { // <- convenience index for this test
                    http: {
                        id: "UR3CLNT120_HTTP",
                        host: "example.corp.com",
                        port: 50055,
                        pathPrefix: ""
                    },
                    https: {
                        id: "UR3CLNT120_HTTPS",
                        host: "example.corp.com",
                        port: 44355,
                        pathPrefix: ""
                    },
                    rfc: {
                        id: "UR3CLNT120",
                        systemId: "UR3",
                        host: "example.corp.com",
                        port: 0,
                        loginGroup: "PUBLIC",
                        sncNameR3: "p/secude:CN=UR3, O=SAP-AG, C=DE",
                        sncQoPR3: "8"
                    },
                    id: "UR3CLNT120",
                    client: "120",
                    language: ""
                }
            },
            "inbound": {
                "semanticObject": "Action",
                "action": "case10",
                "id": "Action-case10~6NG",
                "title": "Test 10",
                "resolutionResult": {
                    "applicationType": "WDA",
                    "sap.wda": {
                        "applicationId": "WDAONE"
                    },
                    "text": "Test 10",
                    "systemAlias": "UR3CLNT120"
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/WDAONE/?sap-client=120&sap-language=en"
        },
        {
            "testDescription": "WDA Compatibility mode true - generate wrapped NWBC url",
            "UserDefaultParameters": {},
            "intent": "Action-case10",
            "oKnownSapSystemData": { // Optional fixture parameter
                // Mocks expansions from ClientSideTargetResolutionAdapter#resolveSystemAlias
                "UR3CLNT120": { // <- convenience index for this test
                    http: {
                        id: "UR3CLNT120_HTTP",
                        host: "example.corp.com",
                        port: 50055,
                        pathPrefix: ""
                    },
                    https: {
                        id: "UR3CLNT120_HTTPS",
                        host: "example.corp.com",
                        port: 44355,
                        pathPrefix: ""
                    },
                    rfc: {
                        id: "UR3CLNT120",
                        systemId: "UR3",
                        host: "example.corp.com",
                        port: 0,
                        loginGroup: "PUBLIC",
                        sncNameR3: "p/secude:CN=UR3, O=SAP-AG, C=DE",
                        sncQoPR3: "8"
                    },
                    id: "UR3CLNT120",
                    client: "120",
                    language: ""
                }
            },
            "inbound": {
                "semanticObject": "Action",
                "action": "case10",
                "id": "Action-case10~6NG",
                "title": "Test 10",
                "resolutionResult": {
                    "applicationType": "WDA",
                    "sap.wda": {
                        "applicationId": "WDAONE",
                        "compatibilityMode": true
                    },
                    "text": "Test 10",
                    "systemAlias": "UR3CLNT120"
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/WDAONE/?sap-client=120&sap-language=en"
        },
        {
            "testDescription": "WDA Compatibility mode false - generate standalone WDA url ",
            "UserDefaultParameters": {},
            "intent": "Action-case10",
            "oKnownSapSystemData": { // Optional fixture parameter
                // Mocks expansions from ClientSideTargetResolutionAdapter#resolveSystemAlias
                "UR3CLNT120": { // <- convenience index for this test
                    http: {
                        id: "UR3CLNT120_HTTP",
                        host: "example.corp.com",
                        port: 50055,
                        pathPrefix: ""
                    },
                    https: {
                        id: "UR3CLNT120_HTTPS",
                        host: "example.corp.com",
                        port: 44355,
                        pathPrefix: ""
                    },
                    rfc: {
                        id: "UR3CLNT120",
                        systemId: "UR3",
                        host: "example.corp.com",
                        port: 0,
                        loginGroup: "PUBLIC",
                        sncNameR3: "p/secude:CN=UR3, O=SAP-AG, C=DE",
                        sncQoPR3: "8"
                    },
                    id: "UR3CLNT120",
                    client: "120",
                    language: ""
                }
            },
            "inbound": {
                "semanticObject": "Action",
                "action": "case10",
                "id": "Action-case10~6NG",
                "title": "Test 10",
                "resolutionResult": {
                    "applicationType": "WDA",
                    "sap.wda": {
                        "applicationId": "WDAONE",
                        "compatibilityMode": false
                    },
                    "text": "Test 10",
                    "systemAlias": "UR3CLNT120"
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "https://example.corp.com:44355/sap/bc/webdynpro/sap/WDAONE?sap-client=120&sap-language=en"
        },
        {
            "testDescription": "WDA Compatibility mode undefined - generate wrapped NWBC url",
            "UserDefaultParameters": {},
            "intent": "Action-case10",
            "oKnownSapSystemData": { // Optional fixture parameter
                // Mocks expansions from ClientSideTargetResolutionAdapter#resolveSystemAlias
                "UR3CLNT120": { // <- convenience index for this test
                    http: {
                        id: "UR3CLNT120_HTTP",
                        host: "example.corp.com",
                        port: 50055,
                        pathPrefix: ""
                    },
                    https: {
                        id: "UR3CLNT120_HTTPS",
                        host: "example.corp.com",
                        port: 44355,
                        pathPrefix: ""
                    },
                    rfc: {
                        id: "UR3CLNT120",
                        systemId: "UR3",
                        host: "example.corp.com",
                        port: 0,
                        loginGroup: "PUBLIC",
                        sncNameR3: "p/secude:CN=UR3, O=SAP-AG, C=DE",
                        sncQoPR3: "8"
                    },
                    id: "UR3CLNT120",
                    client: "120",
                    language: ""
                }
            },
            "inbound": {
                "semanticObject": "Action",
                "action": "case10",
                "id": "Action-case10~6NG",
                "title": "Test 10",
                "resolutionResult": {
                    "applicationType": "WDA",
                    "sap.wda": {
                        "applicationId": "WDAONE"
                    },
                    "text": "Test 10",
                    "systemAlias": "UR3CLNT120"
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/WDAONE/?sap-client=120&sap-language=en"
        },
        {
            "testDescription": "WDA Compatibility mode false with custom namespace  - generate standalone WDA url",
            "UserDefaultParameters": {},
            "intent": "Action-case10",
            "oKnownSapSystemData": { // Optional fixture parameter
                // Mocks expansions from ClientSideTargetResolutionAdapter#resolveSystemAlias
                "UR3CLNT120": { // <- convenience index for this test
                    http: {
                        id: "UR3CLNT120_HTTP",
                        host: "example.corp.com",
                        port: 50055,
                        pathPrefix: ""
                    },
                    https: {
                        id: "UR3CLNT120_HTTPS",
                        host: "example.corp.com",
                        port: 44355,
                        pathPrefix: ""
                    },
                    rfc: {
                        id: "UR3CLNT120",
                        systemId: "UR3",
                        host: "example.corp.com",
                        port: 0,
                        loginGroup: "PUBLIC",
                        sncNameR3: "p/secude:CN=UR3, O=SAP-AG, C=DE",
                        sncQoPR3: "8"
                    },
                    id: "UR3CLNT120",
                    client: "120",
                    language: ""
                }
            },
            "inbound": {
                "semanticObject": "Action",
                "action": "case10",
                "id": "Action-case10~6NG",
                "title": "Test 10",
                "resolutionResult": {
                    "applicationType": "WDA",
                    "sap.wda": {
                        "applicationId": "/ui2/WDAONE",
                        "compatibilityMode": false
                    },
                    "text": "Test 10",
                    "systemAlias": "UR3CLNT120"
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "https://example.corp.com:44355/sap/bc/webdynpro/ui2/WDAONE?sap-client=120&sap-language=en"
        },
        {
            "testDescription": "Transaction SU01 via LPD_CUST + forbidden parameters",
            "UserDefaultParameters": {},
            "intent": "Action-case10",
            "inbound": {
                "semanticObject": "Action",
                "action": "case10",
                "id": "Action-case10~6NG",
                "title": "Test 10",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "Test 10",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01%20%3d&%7enosplash=1&sap-theme=sap_hcd&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "undefined": {
                            "required": false
                        }
                    }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN&sap-theme=sap_hcd"
        },
        {
            "testDescription": "Transaction SU01 via LPD_CUST + batch input + Not Completed by commit",
            "UserDefaultParameters": {},
            "intent": "Action-case11",
            "inbound": {
               "semanticObject": "Action",
               "action": "case11",
               "id": "Action-case11~6NH",
               "title": "Test11",
               "resolutionResult": {
                   "applicationType": "TR",
                   "additionalInformation": "",
                   "text": "Test11",
                   "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3d137%3bP_OBJECT%3d%3bP_OKCODE%3dOK%7e1%3bP_PRGRAM%3dPROGRAM%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN",
                   "systemAlias": ""
               },
               "deviceTypes": {
                   "desktop": true,
                   "tablet": true,
                   "phone": true
               },
               "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                       "undefined": {
                           "required": false
                       }
                   }
               }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3d137%3bP_OBJECT%3d%3bP_OKCODE%3dOK%7e1%3bP_PRGRAM%3dPROGRAM%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 via LPD_CUST + sap- forced parameter in LPD_CUST + Batch input + Not completed by commit",
            "UserDefaultParameters": {},
            "intent": "Action-case12",
            "inbound": {
                "semanticObject": "Action",
                "action": "case12",
                "id": "Action-case12~6NI",
                "title": "Test12",
                "resolutionResult": {
                   "applicationType": "TR",
                   "additionalInformation": "",
                   "text": "Test12",
                   "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3d012%3bP_OBJECT%3d%2525sap-theme%2521sap_gemstone%2525sap-fiori%25211%2525%257eWEBGUI_ICON_TOOLBAR%25210%2525sap-personas-runmode%25210%3bP_OKCODE%3dOKCODY%21%3bP_PRGRAM%3dTHEPROGRAM%21%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN",
                   "systemAlias": ""
                },
                "deviceTypes": {
                   "desktop": true,
                   "tablet": true,
                   "phone": true
                },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "undefined": {
                         "required": false
                      }
                   }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3d012%3bP_OBJECT%3d%2525sap-theme%2521sap_gemstone%2525sap-fiori%25211%2525%257eWEBGUI_ICON_TOOLBAR%25210%2525sap-personas-runmode%25210%3bP_OKCODE%3dOKCODY%21%3bP_PRGRAM%3dTHEPROGRAM%21%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 via LPD_CUST + forbidden parameters + Batch input + Not completed by commit",
            "UserDefaultParameters": {},
            "intent": "Action-case13",
            "inbound": {
                "semanticObject": "Action",
                "action": "case13",
                "id": "Action-case13~6NJ",
                "title": "Test 13",
                "resolutionResult": {
                   "applicationType": "TR",
                   "additionalInformation": "",
                   "text": "Test 13",
                   "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3dDYN%3bP_OBJECT%3d%2525sap-Wd-run-SC%25211%2525sap-wd-auTo-detect%25211%2525sap-EP-version%25211.32%2525sap-theme%2521sap_hcd%3bP_OKCODE%3dOKCODE%3bP_PRGRAM%3dPROGRAM%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN",
                   "systemAlias": ""
                },
                "deviceTypes": {
                   "desktop": true,
                   "tablet": true,
                   "phone": true
                },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "undefined": {
                         "required": false
                      }
                   }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3dDYN%3bP_OBJECT%3d%2525sap-Wd-run-SC%25211%2525sap-wd-auTo-detect%25211%2525sap-EP-version%25211.32%2525sap-theme%2521sap_hcd%3bP_OKCODE%3dOKCODE%3bP_PRGRAM%3dPROGRAM%3bP_ROLE%3dFLP_SAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction SU01 with many transaction parameters",
            "UserDefaultParameters": {},
            "intent": "Action-case16?param1=1234567890&param2=1234567890&param3=1234567890&param4=1234567890&param5=1234567890&param6=1234567890&param7=1234567890&param8=1234567890&param9=1234567890&param10=123456790&param11=1234567890&param12=1234567890&param13=1234567890&param14=1234567890&param15=1234567890&param16=1234567890&param17=1234567890&param18=1234567890&param19=1234567890&param20=123456790&param21=1234567890&param22=1234567890&param23=1234567890&param24=1234567890&param25=1234567890&param26=1234567890&param27=1234567890&param28=1234567890&param29=1234567890&param30=123456790",
            "inbound": {
                "semanticObject": "Action",
                "action": "case16",
                "id": "Action-case16~68sg",
                "title": "DisplayWebguiLongParams",
                "resolutionResult": {
                    "applicationType": "TR",
                    "additionalInformation": "",
                    "text": "DisplayWebguiLongParams",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3d137%3bP_OBJECT%3d%3bP_OKCODE%3dOK%7e1%3bP_PRGRAM%3dPROGRAM%3bP_ROLE%3dZSAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": "",
                    "sap.ui": {
                        "technology": "GUI"
                    }
                },
                "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": true
                },
                "signature": {
                    "parameters": {},
                    "additionalParameters": "allowed"
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dTEST%3bP_CTO%3dEA%3bP_DYNNR%3d137%3bP_OBJ1%3d0%2525param15%25211234567890%2525param16%25211234567890%2525param17%25211234567890%2525param18%25211234567890%2525param19%25211234567890%2525param2%25211234%3bP_OBJ2%3d567890%2525param20%2521123456790%2525param21%25211234567890%2525param22%25211234567890%2525param23%25211234567890%2525param24%25211234567890%2525param25%252%3bP_OBJ3%3d11234567890%2525param26%25211234567890%2525param27%25211234567890%2525param28%25211234567890%2525param29%25211234567890%2525param3%25211234567890%2525para%3bP_OBJ4%3dm30%2521123456790%2525param4%25211234567890%2525param5%25211234567890%2525param6%25211234567890%2525param7%25211234567890%2525param8%25211234567890%2525para%3bP_OBJ5%3dm9%25211234567890%3bP_OBJECT%3dparam1%25211234567890%2525param10%2521123456790%2525param11%25211234567890%2525param12%25211234567890%2525param13%25211234567890%2525param14%2521123456789%3bP_OKCODE%3dOK%7e1%3bP_PRGRAM%3dPROGRAM%3bP_ROLE%3dZSAVIO%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction *SU01 via designer (note 'star' in transaction)",
            "UserDefaultParameters": {},
            "intent": "Action-case14",
            "inbound": {
                "semanticObject": "Action",
                "action": "case14",
                "id": "Action-case14~6NK",
                "title": "*SU01",
                "resolutionResult": {
                   "applicationType": "TR",
                   "additionalInformation": "",
                   "text": "*SU01",
                   "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                   "systemAlias": ""
                },
                "deviceTypes": {
                   "desktop": true,
                   "tablet": true,
                   "phone": true
                },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "undefined": {
                         "required": false
                      }
                   }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "Transaction *SU01 via designer (note 'star' in transaction) + parameter",
            "UserDefaultParameters": {},
            "intent": "Action-case15",
            "inbound": {
                "semanticObject": "Action",
                "action": "case15",
                "id": "Action-case15~6NL",
                "title": "Case15",
                "resolutionResult": {
                   "applicationType": "TR",
                   "additionalInformation": "",
                   "text": "Case15",
                   "url": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=*SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                   "systemAlias": ""
                },
                "deviceTypes": {
                   "desktop": true,
                   "tablet": true,
                   "phone": true
                },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "Param1": {
                         "defaultValue": {
                            "value": "Value1",
                            "format": "plain"
                         },
                         "required": false
                      }
                   }
                }
            },
            "expectedUrl": "/sap/bc/gui/sap/its/webgui;~sysid=UR3;~service=3255?%7etransaction=**SU01%20PARAM1%3dValue1&%7enosplash=1&sap-client=120&sap-language=EN"
        },
        {
            "testDescription": "renameTo with additionalParameters = 'ignored'",
            "UserDefaultParameters": {
            },
            "intent": "SO-action?P1=V1",
            "inbound": {
                "title": "Currency manager",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "SAPUI5.Component=Currency.Component",
                    "applicationType": "SAPUI5",
                    "text": "Currency manager (ignored)", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/url/to/currency",
                    "sap.platform.runtime" : { "everything" : "propagated" }
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {
                        "P1": {
                            "renameTo": "P2"
                        }
                    }
                }
            },
            "oOldAppStateData": {
            },
            "expectedResolutionResult" : {
                  "sap.platform.runtime" : { "everything" : "propagated" },
                  "additionalInformation": "SAPUI5.Component=Currency.Component",
                  "applicationType": "SAPUI5",
                  "sap-system": undefined,
                  "text": "Currency manager",
                  "ui5ComponentName": "Currency.Component",
                  "url": "/url/to/currency?P2=V1",
                  "reservedParameters": {}
            },
            "expectedAppStateData": {
            },
            "expectedUrl": "/url/to/currency?P2=V1"
        },
        {
            "testDescription": "additionalParameters = 'ignored' applies to selection variants stored in an x-app-state",
            "UserDefaultParameters": {
            },
            "intent": "SO-action?P1=v1&sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "SAPUI5.Component=Currency.Component",
                    "applicationType": "SAPUI5",
                    "text": "Currency manager (ignored)", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/url/to/currency",
                    "sap.platform.runtime" : { "everything" : "propagated" }
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {
                        "P1": {
                            "required": true
                        }
                    }
                }
            },
            "oOldAppStateData": {
                "selectionVariant" : {
                    "ODataFilterExpression" : "",
                    "Parameters": [
                        {
                            "PropertyName": "P2",
                            "PropertyValue": "P2Value"
                        }
                    ],
                    "SelectOptions" : [],
                    "SelectionVariantID" : "",
                    "Text" : "Selection Variant with ID ",
                    "Version" : {
                        "Major" : "1",
                        "Minor" : "0",
                        "Patch" : "0"
                    }
                }
            },
            "expectedResolutionResult" : {
                  "sap.platform.runtime" : { "everything" : "propagated" },
                  "additionalInformation": "SAPUI5.Component=Currency.Component",
                  "applicationType": "SAPUI5",
                  "sap-system": undefined,
                  "text": "Currency manager",
                  "ui5ComponentName": "Currency.Component",
                  "url": "/url/to/currency?P1=v1&sap-xapp-state=ASNEW",
                  "reservedParameters": {}
            },
            "expectedAppStateData": {
                "selectionVariant" : {
                    "ODataFilterExpression" : "",
                    "Parameters": [
                        // P2 is deleted because additionalParameters = 'ignored'
                    ],
                    "SelectOptions" : [],
                    "SelectionVariantID" : "",
                    "Text" : "Selection Variant with ID ",
                    "Version" : {
                        "Major" : "1",
                        "Minor" : "0",
                        "Patch" : "0"
                    }
                }
            },
            "expectedUrl": "/url/to/currency?P1=v1&sap-xapp-state=ASNEW"
        },
        {
            "testDescription": "resolution result, extended User Defaults, mapping of parameter names",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "P1refSimple",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "P2": {
                    "value": "P2Def",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P2ExtVal",
                            "High": null
                        }]
                    }
                }
            },
            "intent": "SO-action?P1=a&sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "SAPUI5.Component=Currency.Component",
                    "applicationType": "SAPUI5",
                    "text": "Currency manager (ignored )", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/url/to/currency",
                    "sap.platform.runtime": { "everything": "propagated" }
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {
                        "P1": { "renameTo": "P1New", defaultValue: { value: "UserDefault.extended.Pref1", format: "reference" } },
                        "P2": { "renameTo": "P2New", defaultValue: { value: "UserDefault.extended.Pref1", format: "reference" } },
                        "P3": { "renameTo": "P3New", defaultValue: { value: "UserDefault.extended.Pref1", format: "reference" } },
                        "P4": { "renameTo": "P4New", defaultValue: { value: "UserDefault.Pref1", format: "reference" } },
                        "P5": { "renameTo": "P5New", defaultValue: { value: "UserDefault.Pref5", format: "reference" } }
                    }
                }
            },
            "oOldAppStateData": {
                "selectionVariant": {
                    "ODataFilterExpression": "",
                    "Parameters": [{"PropertyName": "P2", "PropertyValue": "P2Value"}],
                    "SelectOptions": [],
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    }
                }
            },
            "expectedResolutionResult": {
                  "sap.platform.runtime": { "everything": "propagated" },
                  "additionalInformation": "SAPUI5.Component=Currency.Component",
                  "applicationType": "SAPUI5",
                  "sap-system": undefined,
                  "text": "Currency manager (this one)",
                  "ui5ComponentName": "Currency.Component",
                  "url": "/url/to/currency?P1New=a&P4New=P1refSimple&sap-ushell-defaultedParameterNames=%5B%22P3New%22%2C%22P4New%22%5D&sap-xapp-state=ASNEW",
                  "reservedParameters": {}
            },
            "expectedAppStateData": {
                "selectionVariant": {
                    "ODataFilterExpression": "",
                    "Parameters": [{
                        "PropertyName": "P2New",
                        "PropertyValue": "P2Value"
                    }],
                    "SelectOptions": [{
                        "PropertyName": "P3New",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }, {
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1refSimple",
                            "High": null
                        }]
                    }],
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    }
                }
            },
            "expectedUrl": "/url/to/currency?P1New=a&P4New=P1refSimple&sap-ushell-defaultedParameterNames=%5B%22P3New%22%2C%22P4New%22%5D&sap-xapp-state=ASNEW"
        },
        {
            "testDescription": "P5 in appstate does not prevent transitivie non-substitution of dominated primitive Parameters (P5 is substituted although present in appstate!)!",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "P1refSimple",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "Pref5": {
                    "value": "Pref5Def",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P2ExtVal",
                            "High": null
                        }]
                    }
                }
            },
            "intent": "SO-action?sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "SAPUI5.Component=Currency.Component",
                    "applicationType": "SAPUI5",
                    "text": "Currency manager (ignored )", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/url/to/currency"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {
                        "P1": { "renameTo": "P1New", "defaultValue": { "value": "UserDefault.Pref1", "format": "reference" } },
                        "P2": { "renameTo": "P1New", "defaultValue": { "value": "UserDefault.extended.Pref1", "format": "reference" } },
                        "P3": { "renameTo": "P1New", "defaultValue": { "value": "UserDefault.extended.Pref1", "format": "reference" } },
                        "P5": { "renameTo": "P1New", "defaultValue": { "value": "UserDefault.Pref5", "format": "reference" } }
                    }
                }
            },
            "oOldAppStateData": {
                "selectionVariant": {
                    "Parameters": [{ "PropertyName": "P5", "PropertyValue": "P5Value" }]
                }
            },
            "expectedAppStateData": {
                "selectionVariant": {
                    "ODataFilterExpression": "",
                    "Parameters": [{ "PropertyName": "P1New", "PropertyValue": "P5Value" }],
                    "SelectionVariantID": "",
                    "SelectOptions": [],
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    }
                }
            },
            "expectedUrl": "/url/to/currency?P1New=P1refSimple&sap-ushell-defaultedParameterNames=%5B%22P1New%22%5D&sap-xapp-state=ASNEW",
            "expectedErrorCalls": [
                [
                    "collision of values during parameter mapping : \"P5\" -> \"P1New\""
                ],
                [
                    "renaming of defaultedParamNames creates duplicatesP5->P1New"
                ]
            ]
        },
        {
            testDescription: "P5 in appstate does not prevent transitive non-substitution of dominated primitive Parameters (P5 is substituted although present in appstate) Note also that for primitive first one is chosen, for complex 2nd one?",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "P1refSimple",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "Pref5": {
                    "value": "Pref5Def",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P5ExtVal",
                            "High": null
                        }]
                    }
                }
            },
            "intent": "SO-action?sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "SAPUI5.Component=Currency.Component",
                    "applicationType": "SAPUI5",
                    "text": "Currency manager (ignored )", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/url/to/currency"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {
                        "P1": { "renameTo": "P1New", defaultValue: { value: "UserDefault.Pref1", format: "reference" } },
                        "P2": { "renameTo": "P2New", defaultValue: { value: "UserDefault.extended.Pref1", format: "reference" } },
                        "P3": { "renameTo": "P2New", defaultValue: { value: "UserDefault.extended.Pref5", format: "reference" } },
                        "P5": { "renameTo": "P1New", defaultValue: { value: "UserDefault.Pref5", format: "reference" } }
                    }
                }
            },
            oOldAppStateData: {
                selectionVariant: {
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    Parameters: [{ "PropertyName": "P1New", "PropertyValue": "P5Value" }],
                    SelectOptions: [{
                        "PropertyName": "P2New",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }, {
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1refSimple",
                            "High": null
                        }]
                    }],
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    }
                }
            },
            expectedUrl: "/url/to/currency?P1New=P1refSimple&sap-ushell-defaultedParameterNames=%5B%22P1New%22%2C%22P2New%22%5D&sap-xapp-state=ASNEW"
        },
        {
            testDescription: "url compactation in WDA case with appstate and transient test",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": genStr("ABCD", 2049),
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "Pref2": {
                    "value": "Pref5Def",
                    "extendedValue": undefined
                }
            },
            "intent": "SO-action?AAA=1234&AAAA=4321&ZZZ=444&sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "WDA",
                    "text": "Currency manager (ignored text)", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "CostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.Pref1",
                                format: "reference"
                            }
                        },
                        "ReceivingCostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "GLAccount": {
                            "renameTo": "KORK",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "ZSOME": {
                            "renameTo": "ZZome",
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        }
                    }
                }
            },
            oOldAppStateData: {
                selectionVariant: {
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }],
                    SelectOptions: [{
                        "PropertyName": "BUKR",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }, {
                        "PropertyName": "KORK",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }]
                }
            },
            expectedAppStateData2: ("BUKR=" + genStr("ABCD", 2049) + "&ZZZ=444&ZZome=Pref5Def"),
            expectedUrl: "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN&AAA=1234&AAAA=4321&sap-intent-param=ASNEW2&sap-ushell-defaultedParameterNames=%5B%22BUKR%22%2C%22KORK%22%2C%22ZZome%22%5D&sap-xapp-state=ASNEW",
            expectedTransientCompaction: true
        },
        {
            testDescription: "assure long renames paramter names via renameTo are compacted WDA case with appstate",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "Pref1",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "Pref2": {
                    "value": "Pref5Def",
                    "extendedValue": undefined
                }
            },
            "intent": "SO-action?AAA=1234&AAAA=4321&ZZZ=444&sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "WDA",
                    "text": "Currency manager (ignored text)", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "CostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.Pref1",
                                format: "reference"
                            }
                        },
                        "ReceivingCostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "GLAccount": {
                            "renameTo": "KORK",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "ZSOME": {
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        },
                        "AAA": {
                            "renameTo": genStr("XUXU", 2044),
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        }
                    }
                }
            },
            oOldAppStateData: {
                selectionVariant: {
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }],
                    SelectOptions: [{
                        "PropertyName": "BUKR",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }, {
                        "PropertyName": "KORK",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }]
                }
            },
            expectedAppStateData2: (genStr("XUXU", 2044) + "=1234&ZSOME=Pref5Def&ZZZ=444"),
            expectedUrl: "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN&AAAA=4321&BUKR=Pref1&sap-intent-param=ASNEW2&sap-ushell-defaultedParameterNames=%5B%22BUKR%22%2C%22KORK%22%2C%22ZSOME%22%5D&sap-xapp-state=ASNEW"
        },
        {
            testDescription: "assure sap-ushell-defaulted-parameter names can be compacted (very long parameter name) url compactation in WDA case with appstate",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "P1Def",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "Pref2": {
                    "value": "Pref5Def",
                    "extendedValue": undefined
                }
            },
            "intent": "SO-action?AAAA=4321&ZZZ=444&sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "WDA",
                    "text": "Currency manager (ignored text)", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "CostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.Pref1",
                                format: "reference"
                            }
                        },
                        "ReceivingCostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "GLAccount": {
                            "renameTo": "KORK",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "ZSOME": {
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        },
                        "AAA": {
                            "renameTo": genStr("XIXI", 2044),
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        }
                    }
                }
            },
            oOldAppStateData: {
                selectionVariant: {
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }],
                    SelectOptions: [{
                        "PropertyName": "BUKR",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }, {
                        "PropertyName": "KORK",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }]
                }
            },
            expectedAppStateData2: ("AAAA=4321&BUKR=P1Def" +
                    "&" + genStr("XIXI", 2044) + "=Pref5Def&ZSOME=Pref5Def&ZZZ=444") +
                "&sap-ushell-defaultedParameterNames=" + encodeURIComponent(JSON.stringify([
                    "BUKR",
                    "KORK",
                    genStr("XIXI", 2044),
                    "ZSOME"
                ])),
            expectedUrl: "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN&sap-intent-param=ASNEW2&sap-xapp-state=ASNEW"
        },
        {
            testDescription: "no extended user default value can be found (parameter should not appear in sap-ushell-defaultedParameterNames",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": undefined
                }
            },
            "intent": "SO-action?sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "WDA",
                    "text": "Currency manager (ignored text)", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "CostCenter": {
                            defaultValue: {
                                value: "UserDefault.extended.Pref1",
                                format: "reference"
                            }
                        }
                    }
                }
            },
            oOldAppStateData: {
                selectionVariant: {
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }]
                }
            },
            expectedUrl: "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN&sap-xapp-state=ASOLD"
        },
        {
            testDescription: "extended user default is merged",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "P1"
                }
            },
            "intent": "SO-action?sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "WDA",
                    "text": "Currency manager (ignored text)", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "CostCenter": {
                            defaultValue: {
                                value: "UserDefault.extended.Pref1",
                                format: "reference"
                            }
                        }
                    }
                }
            },
            oOldAppStateData: {
                selectionVariant: {
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }],
                    SelectOptions: [{
                        "PropertyName": "CostCenter",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1",
                            "High": null
                        }]
                    }]
                }
            },
            expectedUrl: "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN&sap-ushell-defaultedParameterNames=%5B%22CostCenter%22%5D&sap-xapp-state=ASNEW"
        },
        {
            testDescription: "TR url without wrapped transaction is provided - no parameters compaction, no sap-ushell-defaultedParameterNames",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "P1Def",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "Pref2": {
                    "value": "Pref5Def",
                    "extendedValue": undefined
                }
            },
            "intent": "SO-action?AAAA=4321&ZZZ=444&sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "text": "Currency manager (ignored text)", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "/ui2/nwbc/~canvas;window=app/transaction/SU01?sap-client=120&sap-language=EN"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "CostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.Pref1",
                                format: "reference"
                            }
                        },
                        "ReceivingCostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "GLAccount": {
                            "renameTo": "KORK",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "ZSOME": {
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        },
                        "AAA": {
                            "renameTo": genStr("XIXI", 2044),
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        }
                    }
                }
            },
            oOldAppStateData: {
                selectionVariant: {
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }],
                    SelectOptions: [{
                        "PropertyName": "BUKR",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }, {
                        "PropertyName": "KORK",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }]
                }
            },
            expectedAppStateData2: undefined,
            expectedUrl: "/ui2/nwbc/~canvas;window=app/transaction/SU01?" + [
                "sap-client=120",
                "sap-language=EN",
                "AAAA=4321&BUKR=P1Def",
                genStr("XIXI", 2044) + "=Pref5Def&ZSOME=Pref5Def&ZZZ=444",
                "sap-xapp-state=ASNEW"
            ].join("&")
        },
        {
            testDescription: "TR url with wrapped transaction is provided - no parameters compaction, no sap-ushell-defaultedParametersNames",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "P1Def",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "Pref2": {
                    "value": "Pref5Def",
                    "extendedValue": undefined
                }
            },
            "intent": "SO-action?AAAA=4321&ZZZ=444&sap-xapp-state=ASOLD",
            "inbound": {
                "title": "Currency manager (this one)",
                "semanticObject": "SO",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "text": "Currency manager (ignored text)", // ignored
                    "ui5ComponentName": "Currency.Component",
                    "url": "https://uv2.example.corp.com:44355/ui2/nwbc/~canvas;window=app/transaction/APB_LPD_CALL_B_I_TXN?DYNP_OKCODE=onli&P_APPL=FS2_TEST&P_CTO=EA%20%20X%20X&P_DYNNR=1000&P_OBJECT=&P_OKCODE=OKCODE&P_PRGRAM=FOOS&P_ROLE=FS2SAMAP&P_SELSCR=X&P_TCODE=SU01&sap-client=120&sap-language=EN"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "CostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.Pref1",
                                format: "reference"
                            }
                        },
                        "ReceivingCostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "GLAccount": {
                            "renameTo": "KORK",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "ZSOME": {
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        },
                        "AAA": {
                            "renameTo": genStr("XIXI", 2044),
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        }
                    }
                }
            },
            oOldAppStateData: {
                selectionVariant: {
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }],
                    SelectOptions: [{
                        "PropertyName": "BUKR",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }, {
                        "PropertyName": "KORK",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }]
                }
            },
            expectedAppStateData2: undefined,
            expectedUrl: "https://uv2.example.corp.com:44355/ui2/nwbc/~canvas;window=app/transaction/APB_LPD_CALL_B_I_TXN?" + [
                "DYNP_OKCODE=onli",
                "P_APPL=FS2_TEST",
                "P_CTO=EA%20%20X%20X",
                "P_DYNNR=1000",
                // This equals the following, but spread over P_OBJECT, P_OBJx parameters:
                // [
                //     "AAAA%25214321",
                //     "BUKR%2521P1Def",
                //     genStr("XIXI", 2044) + "%2521" + "Pref5Def",
                //     "ZSOME%2521Pref5Def",
                //     "ZZZ%2521444",
                //     "sap-xapp-state%2521ASNEW"
                // ].join("%2525"),
                //
                "P_OBJ1=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ2=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ3=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ4=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ5=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ6=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ7=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ8=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ9=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ10=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ11=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ12=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ13=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ14=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                "P_OBJ15=IXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXI%2521Pref5Def%2525ZSOME%2521Pref5Def%2525ZZZ%2521",
                "P_OBJ16=444%2525sap-xapp-state%2521ASNEW",
                "P_OBJECT=AAAA%25214321%2525BUKR%2521P1Def%2525XIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",

                "P_OKCODE=OKCODE",
                "P_PRGRAM=FOOS",
                "P_ROLE=FS2SAMAP",
                "P_SELSCR=X",
                "P_TCODE=SU01",
                "sap-client=120",
                "sap-language=EN"
            ].join("&")
        },
        { // tests that fallback is used when no resolutionResult section is provided in the inbound.
            testDescription: "no resolutionResult section was provided in the inbound",

            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {},
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedUrl: "fallback :-({}" // url resolved via fallback
        },
        {
            testDescription: "sap-system with multiple errors provided",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=SYS",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "text": "Sap System Test", // ignored
                    "ui5ComponentName": "",
                    "url": "https://uv2.example.corp.com:44355/ui2/nwbc/~canvas;window=app/transaction/SU01?SUID_ST_BNAME-BNAME=FORSTMANN&SUID_ST_NODE_LOGONDATA-USERALIAS=&=&sap-client=120&sap-language=en"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: { // Optional fixture parameter
                "SYS": O_KNOWN_SYSTEM_ALIASES.MULTIPLE_INVALID_FIELDS
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedResolve: false,
            expectedRejectError: "Invalid system alias definition",
            expectedErrorCalls: [
                [
                    "Invalid system alias definition: " + JSON.stringify(O_KNOWN_SYSTEM_ALIASES.MULTIPLE_INVALID_FIELDS, null, 3),
                    "ERRORS:\n" + [
                    " - https>host field must be a string",
                    " - https>port field must be a number or a string",
                    " - https>pathPrefix field must be a string",
                    " - http>host field must be a string"
                    ].join("\n"),
                    "sap.ushell.ApplicationType"
                ]
            ]
        },
        {
            testDescription: "sap-system provided as intent parameter resolves to alias with blank http/https data",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=SYS",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "text": "Sap System Test", // ignored
                    "ui5ComponentName": "",
                    "url": "https://uv2.example.corp.com:44355/ui2/nwbc/~canvas;window=app/transaction/SU01?SUID_ST_BNAME-BNAME=FORSTMANN&SUID_ST_NODE_LOGONDATA-USERALIAS=&=&sap-client=120&sap-language=en"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: { // Optional fixture parameter
                "SYS": O_KNOWN_SYSTEM_ALIASES.ONLY_RFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedResolve: false,
            expectedRejectError: "Invalid system alias definition",
            expectedErrorCalls: [
                [
                    "Invalid system alias definition: " + JSON.stringify(O_KNOWN_SYSTEM_ALIASES.ONLY_RFC, null, 3),
                    "ERRORS:\n" +
                    " - at least one of 'http' or 'https' fields must be defined",
                    "sap.ushell.ApplicationType"
                ]
            ]
        },
        {
            testDescription: "sap-system provided as intent parameter",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=UR3CLNT120",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "text": "Sap System Test", // ignored
                    "ui5ComponentName": "",
                    "url": "https://uv2.example.corp.com:44355/ui2/nwbc/~canvas;window=app/transaction/SU01?SUID_ST_BNAME-BNAME=FORSTMANN&SUID_ST_NODE_LOGONDATA-USERALIAS=&=&sap-client=120&sap-language=en"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: { // Optional fixture parameter
                                   // Mocks expansions from ClientSideTargetResolutionAdapter#resolveSystemAlias
                "UR3CLNT120": { // <- convenience index for this test
                   http: {
                       id: "UR3CLNT120_HTTP",
                       host: "example.corp.com",
                       port: 50055,
                       pathPrefix: ""
                   },
                   https: {
                       id: "UR3CLNT120_HTTPS",
                       host: "example.corp.com",
                       port: 44355,
                       pathPrefix: ""
                   },
                   rfc: {
                       id: "UR3CLNT120",
                       systemId: "UR3",
                       host: "example.corp.com",
                       port: 0,
                       loginGroup: "PUBLIC",
                       sncNameR3: "p/secude:CN=UR3, O=SAP-AG, C=DE",
                       sncQoPR3: "8"
                   },
                   id: "UR3CLNT120",
                   client: "120",
                   language: ""
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedUrl: "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/transaction/SU01?SUID_ST_BNAME-BNAME=FORSTMANN&SUID_ST_NODE_LOGONDATA-USERALIAS=&=&sap-client=120&sap-language=en"
        },
        {
            testDescription: "sap-system provided as intent parameter, WDA url with system alias",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=U1YCLNT111",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "WDA",
                    "text": "Sap System Test", // ignored
                    "ui5ComponentName": "",
                    "url": "https://u1y.example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/WDR_TEST_PORTAL_NAV_TARGET/?sap-client=000&sap-language=EN",
                    "systemAlias": "UI2_WDA"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "U1YCLNT111": {
                    https: {
                        id: "U1YCLNT111_HTTPS",
                        host: "u1y.example.corp.com",
                        port: 44355,
                        pathPrefix: "" // use local
                    },
                    id: "U1YCLNT111",
                    client: "111",
                    language: ""
                },
                "UI2_WDA": {
                    http: {
                        id: "UI2_WDA",
                        host: "u1y.example.corp.com",
                        port: 44355,
                        pathPrefix: "" // path from local system!
                    },
                    https: {
                        id: "UI2_WDA",
                        host: "u1y.example.corp.com",
                        port: 44355,
                        pathPrefix: ""
                    },
                    rfc: {
                        id: "",
                        systemId: "",
                        host: "",
                        service: 32,
                        loginGroup: "",
                        sncNameR3: "",
                        sncQoPR3: ""
                    },
                    id: "UI2_WDA",
                    client: "000",
                    language: ""
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedUrl: "https://u1y.example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/WDR_TEST_PORTAL_NAV_TARGET/?sap-client=111&sap-language=en"
        },
        {
            testDescription: "sap-system provided as intent parameter, WDA url, relative path",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=UR3CLNT120",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "WDA",
                    "text": "Sap System Test", // ignored
                    "ui5ComponentName": "",
                    "url": "/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=EN"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: { // Optional fixture parameter
                                   // Mocks expansions from ClientSideTargetResolutionAdapter#resolveSystemAlias
                "UR3CLNT120": { // <- convenience index for this test
                   http: {
                       id: "UR3CLNT120_HTTP",
                       host: "example.corp.com",
                       port: 50055,
                       pathPrefix: ""
                   },
                   https: {
                       id: "UR3CLNT120_HTTPS",
                       host: "example.corp.com",
                       port: 44355,
                       pathPrefix: ""
                   },
                   rfc: {
                       id: "UR3CLNT120",
                       systemId: "UR3",
                       host: "example.corp.com",
                       port: 0,
                       loginGroup: "PUBLIC",
                       sncNameR3: "p/secude:CN=UR3, O=SAP-AG, C=DE",
                       sncQoPR3: "8"
                   },
                   id: "UR3CLNT120",
                   client: "120",
                   language: ""
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedUrl: "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/WD_ANALYZE_CONFIG_USER/?sap-client=120&sap-language=en"
        },
        {
            testDescription: "relative app/transaction URL with sap-system=QH3CLNT815, sap-client and sap-language are provided",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=QH3CLNT815",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "text": "Sap System Test", // ignored
                    "ui5ComponentName": "",
                    "url": "/ui2/nwbc/~canvas;window=app/transaction/SU01?sap-client=120&sap-language=EN",
                    "systemAlias": "" // important -> local system!
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "": O_LOCAL_SYSTEM_ALIAS,
                "QH3CLNT815": {
                   https: {
                       id: "QH3CLNT815_HTTPS",
                       host: "qh3.example.corp.com",
                       port: 44301,
                       pathPrefix: "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html"
                   },
                   rfc: {
                       id: "QH3CLNT815",
                       systemId: "",
                       host: "1.2.3.4",
                       service: 1,
                       loginGroup: "",
                       sncNameR3: "",
                       sncQoPR3: ""
                   },
                   id: "QH3CLNT815",
                   client: "815",
                   language: ""
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedUrl: "https://qh3.example.corp.com:44301/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html/~canvas;window=app/transaction/SU01?sap-client=815&sap-language=en"
        },
        {
            testDescription: "GUI Application with system alias having the same path prefix as local system (/sap/bc/)",
                // ignore certain fields not needed for the test
                "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=QH3CLNT815",
                "inbound": {
                "title": "Sap System Test",
                    "semanticObject": "Object",
                    "action": "action",
                    "resolutionResult": {
                    "additionalInformation": "",
                        "applicationType": "TR",
                        "text": "Sap System Test", // ignored
                        "ui5ComponentName": "",
                        "url": "/ui2/nwbc/~canvas;window=app/transaction/SU01?sap-client=120&sap-language=EN",
                        "systemAlias": "" // important -> local system!
                },
                "signature": {
                    "additionalParameters": "ignored",
                        "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "": O_LOCAL_SYSTEM_ALIAS,
                    "QH3CLNT815": {
                    https: {
                        id: "QH3CLNT815_HTTPS",
                            host: "qh3.example.corp.com",
                            port: 44301,
                            pathPrefix: "/sap/bc/"
                    },
                    rfc: {
                        id: "QH3CLNT815",
                            systemId: "",
                            host: "1.2.3.4",
                            service: 1,
                            loginGroup: "",
                            sncNameR3: "",
                            sncQoPR3: ""
                    },
                    id: "QH3CLNT815",
                        client: "815",
                        language: ""
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedUrl: "https://qh3.example.corp.com:44301/sap/bc/ui2/nwbc/~canvas;window=app/transaction/SU01?sap-client=815&sap-language=en"
        },
        {
            testDescription: "relative app/transaction URL with sap-system=QH3CLNT815 (with empty pathPrefix) parameter provided",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=QH3CLNT815",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "text": "Sap System Test", // ignored
                    "ui5ComponentName": "",
                    "url": "/ui2/nwbc/~canvas;window=app/transaction/SU01?sap-client=120&sap-language=EN",
                    "systemAlias": "" // important -> local system!
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "QH3CLNT815": {
                   https: {
                       id: "QH3CLNT815_HTTPS",
                       host: "qh3.example.corp.com",
                       port: 44301,
                       pathPrefix: "" // note: empty path prefix -> take from local system alias
                   },
                   rfc: {
                       id: "QH3CLNT815",
                       systemId: "",
                       host: "1.2.3.4",
                       service: 1,
                       loginGroup: "",
                       sncNameR3: "",
                       sncQoPR3: ""
                   },
                   id: "QH3CLNT815",
                   client: "815",
                   language: ""
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedUrl: "https://qh3.example.corp.com:44301/sap/bc/ui2/nwbc/~canvas;window=app/transaction/SU01?sap-client=815&sap-language=en"
        },
        {
            testDescription: "Native Wrapped Webgui URL with load balanced sap-system",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=ALIASRFC",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "text": "Sap System Test", // ignored
                    "ui5ComponentName": "",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dFS2_TEST%3bP_CTO%3dEA%20%20X%20X%3bP_DYNNR%3d1000%3bP_OBJECT%3d%3bP_OKCODE%3dOKCODE%3bP_PRGRAM%3dFOOS%3bP_ROLE%3dFS2SAMAP%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": "" // important -> local system!
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "ALIASRFC": {
                   https: {
                       id: "ALIASRFC_HTTPS",
                       host: "example.corp.com",
                       port: 44301,
                       pathPrefix: ""
                   },
                   rfc: {
                       // for load balancing specify systemId, loginGroup, sncNameR3, messageServer, sncQoPR3
                       // for no load balancing specify only service, sncNameR3, sncQoPR3
                       id: "ALIASRFC",
                       systemId: "UR3",
                       host: "ldcsuv2",
                       service: 32, // ignored: load balancing configuration
                       loginGroup: "SPACE",
                       sncNameR3: "p/secude:CN=UXR, O=SAP-AG, C=DE",
                       sncQoPR3: "9"
                   },
                   id: "QH3CLNT815",
                   client: "815",
                   language: "IT"
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "TR",
            expectedUrl:
                "https://example.corp.com:44301/sap/bc/gui/sap/its/webgui;" + [
                    "~sysid=UR3",
                    "~loginGroup=SPACE",
                    "~messageServer=p%2fsecude%3aCN%3dUXR%2c%20O%3dSAP-AG%2c%20C%3dDE",
                    "~sncNameR3=p%2fsecude%3aCN%3dUXR%2c%20O%3dSAP-AG%2c%20C%3dDE",
                    "~sncQoPR3=9"
                ].join(";") +
                "?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dFS2_TEST%3bP_CTO%3dEA%20%20X%20X%3bP_DYNNR%3d1000%3bP_OBJECT%3d%3bP_OKCODE%3dOKCODE%3bP_PRGRAM%3dFOOS%3bP_ROLE%3dFS2SAMAP%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1" +
                "&sap-client=815" +
                "&sap-language=IT"
        },
        {
            testDescription: "Native Wrapped Webgui URL with load balanced sap-system (but missing parameters in rfc)",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Object-action?sap-system=ALIASRFC",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Object",
                "action": "action",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "text": "Sap System Test", // ignored
                    "ui5ComponentName": "",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dFS2_TEST%3bP_CTO%3dEA%20%20X%20X%3bP_DYNNR%3d1000%3bP_OBJECT%3d%3bP_OKCODE%3dOKCODE%3bP_PRGRAM%3dFOOS%3bP_ROLE%3dFS2SAMAP%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": "" // important -> local system!
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "ALIASRFC": {
                    https: {
                        id: "ALIASRFC_HTTPS",
                        host: "example.corp.com",
                        port: 44301,
                        pathPrefix: ""
                    },
                    rfc: {
                        // for load balancing specify systemId, loginGroup, sncNameR3, messageServer, sncQoPR3
                        // for no load balancing specify only service, sncNameR3, sncQoPR3
                        id: "ALIASRFC",
                        systemId: "UR3",
                        host: "ldcsuv2",
                        service: 32, // ignored: load balancing configuration
                        loginGroup: "SPACE",
                        sncNameR3: "",
                        sncQoPR3: ""
                    },
                    id: "QH3CLNT815",
                    client: "815",
                    language: "IT"
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "TR",
            expectedUrl:
                "https://example.corp.com:44301/sap/bc/gui/sap/its/webgui;" + [
                    "~sysid=UR3",
                    "~loginGroup=SPACE"
                ].join(";") +
                "?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dFS2_TEST%3bP_CTO%3dEA%20%20X%20X%3bP_DYNNR%3d1000%3bP_OBJECT%3d%3bP_OKCODE%3dOKCODE%3bP_PRGRAM%3dFOOS%3bP_ROLE%3dFS2SAMAP%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1" +
                "&sap-client=815" +
                "&sap-language=IT"
        },
        {
            testDescription: "Native Wrapped Webgui URL resolution",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "P1Def",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "Pref2": {
                    "value": "Pref5Def",
                    "extendedValue": undefined
                }
            },
            "intent": "Action-towrappedwebgui?AAAA=4321&ZZZ=444&sap-xapp-state=ASOLD",
            "inbound": {
                "title": "To Wrapped webgui",
                "semanticObject": "Action",
                "action": "towrappedwebgui",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN%20DYNP_OKCODE%3donli%3bP_APPL%3dFS2_TEST%3bP_CTO%3dEA%20%20X%20X%3bP_DYNNR%3d1000%3bP_OBJECT%3d%3bP_OKCODE%3dOKCODE%3bP_PRGRAM%3dFOOS%3bP_ROLE%3dFS2SAMAP%3bP_SELSCR%3dX%3bP_TCODE%3dSU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "CostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.Pref1",
                                format: "reference"
                            }
                        },
                        "ReceivingCostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "GLAccount": {
                            "renameTo": "KORK",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "ZSOME": {
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        },
                        "AAA": {
                            "renameTo": genStr("XIXI", 2044),
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        }
                    }
                }
            },
            oOldAppStateData: {
                selectionVariant: {
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }]
                }
            },
            expectedAppStateData: {
                selectionVariant: {
                    "ODataFilterExpression": "",
                    "SelectionVariantID": "",
                    "Text": "Selection Variant with ID ",
                    "Version": {
                        "Major": "1",
                        "Minor": "0",
                        "Patch": "0"
                    },
                    Parameters: [{
                        "PropertyName": "P5",
                        "PropertyValue": "P5Value"
                    }],
                    SelectOptions: [{
                        "PropertyName": "BUKR",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }, {
                        "PropertyName": "KORK",
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "Pref5Def",
                            "High": null
                        }]
                    }]
                }
            },
            expectedUrl: "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?" +
                "%7etransaction=*APB_LPD_CALL_B_I_TXN%20" + [
                        "DYNP_OKCODE%3donli",
                        "P_APPL%3dFS2_TEST",
                        "P_CTO%3dEA%20%20X%20X",
                        "P_DYNNR%3d1000",
                        // This equals the following, but spread over P_OBJECT, P_OBJx parameters:
                        // [
                        //     "AAAA%25214321",
                        //     "BUKR%2521P1Def",
                        //     genStr("XIXI", 2044) + "%2521" + "Pref5Def",
                        //     "ZSOME%2521Pref5Def",
                        //     "ZZZ%2521444",
                        //     "sap-xapp-state%2521ASNEW"
                        // ].join("%2525"),
                        //
                        "P_OBJ1%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ2%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ3%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ4%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ5%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ6%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ7%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ8%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ9%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ10%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ11%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ12%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ13%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ14%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",
                        "P_OBJ15%3dIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXI%2521Pref5Def%2525ZSOME%2521Pref5Def%2525ZZZ%2521",
                        "P_OBJ16%3d444%2525sap-xapp-state%2521ASNEW",
                        "P_OBJECT%3dAAAA%25214321%2525BUKR%2521P1Def%2525XIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIXIX",

                        "P_OKCODE%3dOKCODE",
                        "P_PRGRAM%3dFOOS",
                        "P_ROLE%3dFS2SAMAP",
                        "P_SELSCR%3dX",
                        "P_TCODE%3dSU01"
                ].join("%3b") + "&" + [
                    "%7enosplash=1",
                    "sap-client=120",
                    "sap-language=EN"
                ].join("&")
        },
        {
            testDescription: "Native Non-wrapped Webgui URL resolution",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {
                "Pref1": {
                    "value": "P1Def",
                    "extendedValue": {
                        "Ranges": [{
                            "Sign": "I",
                            "Option": "EQ",
                            "Low": "P1ExtVal",
                            "High": null
                        }]
                    }
                },
                "Pref2": {
                    "value": "Pref5Def",
                    "extendedValue": undefined
                }
            },
            "intent": "Action-tononwrappedwebgui?AAAA=4321&ZZZ=444&sap-xapp-state=ASOLD",
            "inbound": {
                "title": "To Non Native Wrapped webgui",
                "semanticObject": "Action",
                "action": "tononwrappedwebgui",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "TR",
                    "url": "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=SU01&%7enosplash=1&sap-client=120&sap-language=EN",
                    "systemAlias": ""
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "CostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.Pref1",
                                format: "reference"
                            }
                        },
                        "ReceivingCostCenter": {
                            "renameTo": "BUKR",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "GLAccount": {
                            "renameTo": "KORK",
                            defaultValue: {
                                value: "UserDefault.extended.Pref2",
                                format: "reference"
                            }
                        },
                        "ZSOME": {
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        },
                        "AAA": {
                            "renameTo": genStr("XIXI", 2044),
                            defaultValue: {
                                value: "UserDefault.Pref2",
                                format: "reference"
                            }
                        }
                    }
                }
            },
        oOldAppStateData: {
            selectionVariant: {
                Parameters: [{
                    "PropertyName": "P5",
                    "PropertyValue": "P5Value"
                }]
            }
        },
        expectedApplicationType: "TR",
        expectedAppStateData: {
            selectionVariant: {
                "ODataFilterExpression": "",
                "SelectionVariantID": "",
                "Text": "Selection Variant with ID ",
                "Version": {
                    "Major": "1",
                    "Minor": "0",
                    "Patch": "0"
                },
                Parameters: [{
                    "PropertyName": "P5",
                    "PropertyValue": "P5Value"
                }],
                SelectOptions: [{
                    "PropertyName": "BUKR",
                    "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "Pref5Def",
                        "High": null
                    }]
                }, {
                    "PropertyName": "KORK",
                    "Ranges": [{
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": "Pref5Def",
                        "High": null
                    }]
                }]
            }
        },
        expectedUrl: "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?" +
            "%7etransaction=*SU01%20" + [
                "AAAA%3d4321",
                "BUKR%3dP1Def",
                genStr("XIXI", 2044) + "%3dPref5Def",
                "ZSOME%3dPref5Def",
                "ZZZ%3d444"
            ].join("%3b") + "&" + [
                "%7enosplash=1",
                "sap-client=120",
                "sap-language=EN",
                "sap-xapp-state=ASNEW"
            ].join("&")
        },
        {
            "testDescription": "Long Templated URL",
            "UserDefaultParameters": {},
            "intent": "Action-templated?sap-ushell-navmode=inplace&sap-system=UR3CLNT120&p1=" + genStr("XIXI", 2044) + "&/inner/app",
            "inbound": (function (oApplicationSection) {
                return {
                    "title": "templated",
                    "semanticObject": "Action",
                    "action": "templated",
                    "resolutionResult": {
                        "applicationType": "URL",
                        "navigationMode": "embedded"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            p1: {
                                required: false,
                                defaultValue: {
                                    value: "v1",
                                    format: "plain"
                                }
                            }
                        }
                    },
                    "templateContext": {
                        "payload": {
                            urlTemplate: "http://www.google.com/{?query,p1,innerAppRoute}",
                            parameters: {
                                names: {
                                    query: "ABC",
                                    innerAppRoute: "{&innerAppRoute:.}"
                                }
                            }
                        },
                        "site": {
                            some: {
                                kind: {
                                    of: {
                                        site: {
                                        },
                                        application: oApplicationSection
                                    }
                                }
                            }
                        },
                        "siteAppSection": oApplicationSection
                    }
                };
            })({ // application section
                destination: "UR5",
                inbound: {
                    semanticObject: "Action",
                    action: "templated"
                }
            }),
            "oKnownSapSystemData": {},
            "oOldAppStateData": {},
            "expectedAppStateData": "p1=" + genStr("XIXI", 2044) + "&query=ABC",
            "expectedResolutionResult": {
                "applicationType": "URL",
                "reservedParameters": {},
                "text": "templated",
                "url": "http://www.google.com/?innerAppRoute=%26%2Finner%2Fapp&sap-intent-param=ASNEW",
                "explicitNavMode": true,
                "navigationMode": "embedded"
            }
        },
        {
            "testDescription": "Templated URL",
            "UserDefaultParameters": {},
            "intent": "Action-templated?sap-ushell-navmode=inplace&sap-system=UR3CLNT120&/inner/app",
            "inbound": (function (oApplicationSection) {
                return {
                    "title": "templated",
                    "semanticObject": "Action",
                    "action": "templated",
                    "resolutionResult": {
                        "applicationType": "URL",
                        "navigationMode": "embedded"
                    },
                    "signature": {
                        "additionalParameters": "ignored",
                        "parameters": {
                            p1: {
                                required: false,
                                defaultValue: {
                                    value: "v1",
                                    format: "plain"
                                }
                            }
                        }
                    },
                    "templateContext": {
                        "payload": {
                            urlTemplate: "http://www.google.com/{?query,p1,innerAppRoute}",
                            parameters: {
                                names: {
                                    query: "ABC",
                                    innerAppRoute: "{&innerAppRoute:.}"
                                }
                            }
                        },
                        "site": {
                            some: {
                                kind: {
                                    of: {
                                        site: {
                                        },
                                        application: oApplicationSection
                                    }
                                }
                            }
                        },
                        "siteAppSection": oApplicationSection
                    }
                };
            })({ // application section
                destination: "UR5",
                inbound: {
                    semanticObject: "Action",
                    action: "templated"
                }
            }),
            "oKnownSapSystemData": {},
            "oOldAppStateData": {},
            "expectedAppStateData": {},
            "expectedResolutionResult": {
                "applicationType": "URL",
                "reservedParameters": {},
                "text": "templated",
                "url": "http://www.google.com/?query=ABC&p1=v1&innerAppRoute=%26%2Finner%2Fapp",
                "explicitNavMode": true,
                "navigationMode": "embedded"
            }
        },
        {
            "testDescription": "CDM 3.0 WDA URL",
            "UserDefaultParameters": {},
            "intent": "Product-wdaSearch?parameterName=parameterValue&sap-ushell-navmode=inplace",
            "inbound": (function (oApplicationSection) {
                return {
                    "title": "templated",
                    "semanticObject": "Product",
                    "action": "wdaSearch",
                    "resolutionResult": {
                        "applicationType": "URL",
                        "navigationMode": "embedded"
                    },
                    "signature": {
                        "additionalParameters": "allowed",
                        "parameters": {
                            defaultP1: {
                                required: false,
                                defaultValue: {
                                    value: "v1",
                                    format: "plain"
                                }
                            }
                        }
                    },
                    "templateContext": {
                        "payload": {
                            urlTemplate: "{+_baseUrl}/ui2/nwbc/~canvas;window=app/wda/{wdaAppId}/{?wdConfigId,_defaultParameterNames,_startupParameters*,sapTheme,sapLanguage}",
                            parameters: {
                                names: utils.shallowMergeObject(O_CDM3_TEMPLATE_NOTIONS, {
                                    "wdaAppId": "{./sap.integration/urlTemplateParams/applicationId}",
                                    "wdConfigId": {
                                        "renameTo": "sap-wd-configId",
                                        "value": "{./sap.integration/urlTemplateParams/configId}"
                                    },
                                    "_defaultParameterNamesPrejoin": "{join(\"\\,\") &defaultParameterNames:.}",
                                    "_defaultParameterNamesPostjoin": "{join() '[\"',&_defaultParameterNamesPrejoin,'\"]'}",
                                    "_defaultParameterNames": {
                                        "renameTo": "sap-ushell-defaultedParameterNames",
                                        "value": "{if({&_defaultParameterNamesPrejoin}) &_defaultParameterNamesPostjoin}"
                                    },
                                    "sapTheme": {
                                        "renameTo": "sap-theme",
                                        "value": "{&env:theme}"
                                    },
                                    "sapLanguage": {
                                        "renameTo": "sap-language",
                                        "value": "{&env:logonLanguage}"
                                    }
                                })
                            }
                        },
                        "site": O_CDM3_SAMPLE_SITE,
                        "siteAppSection": oApplicationSection
                    }
                };
            })({ // application section
                "sap.app": {
                    "destination": "legacy_blue_box",
                    "title": "CALL WDA EC Cockpit - Scenario 2",
                    "crossNavigation": {
                        "inbounds": {
                            "AcademicCourse-a5": {
                                "semanticObject": "AcademicCourse",
                                "action": "a5",
                                "signature": {
                                    "parameters": {},
                                    "additionalParameters": "allowed"
                                }
                            }
                        }
                    }
                },
                "sap.integration": {
                    "urlTemplateId": "urltemplate.wda",
                    "urlTemplateParams": {
                        "applicationId": "S_EPM_FPM_PD",
                        "configId": "s_epm_fpm_pd"
                    }
                },
                "sap.flp": {
                    "businessApp": "businessapp.urltemplate-wda",
                    "defaultLauncher": "businessapp.urltemplate-wda#AcademicCourse-a5"
                },
                "sap.ui": {
                    "technology": "URL"
                }
            }),
            "oKnownSapSystemData": {},
            "oOldAppStateData": {},
            "expectedAppStateData": {},
            "expectedResolutionResult": {
                "applicationType": "URL",
                "reservedParameters": {},
                "text": "templated",
                "url": "https://tenant-fin-dyn-dest-approuter.cfapps.sap.hana.ondemand.com/sap/bc/ui2/nwbc/~canvas;window=app/wda/S_EPM_FPM_PD/?sap-wd-configId=s_epm_fpm_pd&sap-ushell-defaultedParameterNames=%5B%22defaultP1%22%5D&parameterName=parameterValue&defaultP1=v1&sap-theme=sap_belize&sap-language=EN",
                "explicitNavMode": true,
                "navigationMode": "embedded"
            }
        },
        {
            "testDescription": "CDM 3.0 GUI URL",
            "UserDefaultParameters": {},
            "intent": "Employee-display?parameterName=parameterValue&sap-ushell-navmode=inplace",
            "inbound": (function (oApplicationSection) {
                return {
                    "title": "templated",
                    "semanticObject": "Employee",
                    "action": "display",
                    "resolutionResult": {
                        "applicationType": "URL",
                        "navigationMode": "embedded"
                    },
                    "signature": {
                        "additionalParameters": "allowed",
                        "parameters": {
                            "defaultP1": {
                                "required": false,
                                "defaultValue": {
                                    "value": "v1",
                                    "format": "plain"
                                }
                            }
                        }
                    },
                    "templateContext": {
                        "payload": {
                            urlTemplate: "{+_baseUrl}/gui/sap/its/webgui{;connectString,service,sysid,loginGroup,messageServer,sncNameR3,sncQoPR3}?%7etransaction={+skipScreenChar}{+transaction}{transactionParams}&%7enosplash=1{&sapTheme,sapLanguage}",
                            parameters: {
                                names: utils.shallowMergeObject(O_CDM3_TEMPLATE_NOTIONS, {
                                    "sysid": {
                                        "renameTo": "~sysid",
                                        "value": "{and _destIsLoadBalancing,/systemAliases/{&_destName}/rfc/systemId}"
                                    },
                                    "loginGroup": {
                                        "renameTo": "~loginGroup",
                                        "value": "{and _destIsLoadBalancing,/systemAliases/{&_destName}/rfc/loginGroup}"
                                    },
                                    "messageServer": {
                                        "renameTo": "~messageServer",
                                        "value": "{and _destIsLoadBalancing,/systemAliases/{&_destName}/rfc/sncNameR3}"
                                    },
                                    "sncNameR3": {
                                        "renameTo": "~sncNameR3",
                                        "value": "{/systemAliases/{&_destName}/rfc/sncNameR3}"
                                    },
                                    "sncQoPR3": {
                                        "renameTo": "~sncQoPR3",
                                        "value": "{/systemAliases/{&_destName}/rfc/sncQoPR3}"
                                    },
                                    "service": {
                                        "renameTo": "~service",
                                        "value": "{/systemAliases/{&_destName}/rfc/service}"
                                    },
                                    "rfcHost": "{/systemAliases/{&_destName}/rfc/host}",
                                    "connectString": {
                                        "renameTo": "~connectString",
                                        "value": "{and &_destIsNotLoadBalancing,&_destHostIsConnectString,&rfcHost}"
                                    },
                                    "businessParams": "{*|match(^(?!sap-))}",
                                    "skipScreenChar": "{and({&businessParams}) '*'}",
                                    "transactionParamsSeparator": "{and({&businessParams}) ' '}",
                                    "transactionParamsJoined": "{join(;,=) &businessParams}",
                                    "transaction": "{./sap.integration/urlTemplateParams/transaction}",
                                    "transactionParams": "{join &transactionParamsSeparator,&transactionParamsJoined}",
                                    "sapTheme": {
                                        "renameTo": "sap-theme",
                                        "value": "{&env:theme}"
                                    },
                                    "sapLanguage": {
                                        "renameTo": "sap-language",
                                        "value": "{&env:logonLanguage}"
                                    }
                                })
                            }
                        },
                        "site": O_CDM3_SAMPLE_SITE,
                        "siteAppSection": oApplicationSection
                    }
                };
            })({ // application section
                "sap.app": {
                    "destination": "legacy_blue_box",
                    "title": "CALL EC Cockpit - Scenario 1",
                    "crossNavigation": {
                        "inbounds": {
                            "AcademicCourse-a4": {
                                "semanticObject": "AcademicCourse",
                                "action": "a4",
                                "signature": {
                                    "parameters": {},
                                    "additionalParameters": "allowed"
                                }
                            }
                        }
                    }
                },
                "sap.integration": {
                    "urlTemplateId": "urltemplate.gui",
                    "urlTemplateParams": {
                        "transaction": "/BAOF/EC_CP_21"
                    }
                },
                "sap.flp": {
                    "businessApp": "businessapp.urltemplate-gui",
                    "defaultLauncher": "businessapp.urltemplate-gui#AcademicCourse-a4"
                },
                "sap.ui": {
                    "technology": "URL"
                }
            }),
            "oKnownSapSystemData": {},
            "oOldAppStateData": {},
            "expectedAppStateData": {},
            "expectedResolutionResult": {
                "applicationType": "URL",
                "reservedParameters": {},
                "text": "templated",
                "url": "https://tenant-fin-dyn-dest-approuter.cfapps.sap.hana.ondemand.com/sap/bc/gui/sap/its/webgui;~service=3255;~sncNameR3=p%2Fsecude%3ACN%3DEXAMPLE%2C%20O%3DSAP-AG%2C%20C%3DDE;~sncQoPR3=8?%7etransaction=*/BAOF/EC_CP_21%20defaultP1%3Dv1%3BparameterName%3DparameterValue&%7enosplash=1&sap-theme=sap_belize&sap-language=EN",
                "explicitNavMode": true,
                "navigationMode": "embedded"
            }
        },
        {
            "testDescription": "UI5 (CLP App Runtime)",
            "UserDefaultParameters": {},
            "intent": "Employee-display?parameterName=parameterValue&sap-ushell-navmode=inplace",
            "inbound": (function (oApplicationSection) {
                return {
                    "title": "templated",
                    "semanticObject": "Employee",
                    "action": "display",
                    "resolutionResult": {
                        "applicationType": "URL",
                        "navigationMode": "embedded"
                    },
                    "signature": {
                        "additionalParameters": "allowed",
                        "parameters": {
                            "defaultP1": {
                                "required": false,
                                "defaultValue": {
                                    "value": "v1",
                                    "format": "plain"
                                }
                            }
                        }
                    },
                    "templateContext": {
                        "payload": {
                            urlTemplate: "{+_baseUrl}{+appRuntime}{?appId,startupParameters,originalHash,sapUiDebug}",
                            parameters: {
                                names: utils.shallowMergeObject(O_CDM3_TEMPLATE_NOTIONS, {
                                    "appPlatform": "{./sap.integration/urlTemplateParams/appPlatform}",
                                    "isAppRuntimeNeo": "{match(^NEO$) &appPlatform}",
                                    "isAppRuntimeAbap": "{match(^ABAP$) &appPlatform}",
                                    "isAppRuntimeCf": "{match(^CF$) &appPlatform}",
                                    "appRuntimeAbap": "{if({&isAppRuntimeAbap}) '/ui2/flp/ui5appruntime.html'}",
                                    "appRuntimeCf": "{if({&isAppRuntimeCf}) '/ui5appruntime.html'}",
                                    "appRuntimeNeo": "{if({&isAppRuntimeNeo}) '/sap/fiori/fioriappruntime'}",
                                    "appRuntime": "{or &appRuntimeAbap,&appRuntimeCf,&appRuntimeNeo}",
                                    "startupParameters": "{*|match(^(?!sap-(system\\|(ushell-navmode))$))|join(&,=)}",
                                    "originalHash": "{url(hash)}",
                                    "appId": {
                                        "value": "{./sap.integration/urlTemplateParams/appId}",
                                        "renameTo": "sap-ui-app-id"
                                    },
                                    "sapUiDebug": {
                                        "renameTo": "sap-ui-debug",
                                        "value": "{if({&env:isDebugMode}) &env:isDebugMode}"
                                    }
                                })
                            }
                        },
                        "site": O_CDM3_SAMPLE_SITE,
                        "siteAppSection": oApplicationSection
                    }
                };
            })({ // application section
                "sap.app": {
                    "destination": "fiori_blue_box",
                    "title": "Invoices",
                    "crossNavigation": {
                        "inbounds": {
                            "InvoiceList-manage": {
                                "semanticObject": "InvoiceList",
                                "action": "manage",
                                "signature": {
                                    "parameters": {},
                                    "additionalParameters": "allowed"
                                }
                            }
                        }
                    }
                },
                "sap.integration": {
                    "urlTemplateId": "urltemplate.fiori",
                    "urlTemplateParams": {
                        "appId": "cus.sd.billingdoclist.manages1",
                        "appPlatform": "ABAP"
                    }
                },
                "sap.flp": {
                    "businessApp": "businessapp.urltemplate-fiori",
                    "defaultLauncher": "businessapp.urltemplate-fiori#InvoiceList-manage"
                },
                "sap.ui": {
                    "technology": "URL"
                }

            }),
            "oKnownSapSystemData": {},
            "oOldAppStateData": {},
            "expectedAppStateData": {},
            "expectedResolutionResult": {
                "applicationType": "URL",
                "reservedParameters": {},
                "text": "templated",
                "url": "https://tenant-fin-dyn-dest-approuter.cfapps.sap.hana.ondemand.com/sap/bc/ui2/flp/ui5appruntime.html?sap-ui-app-id=cus.sd.billingdoclist.manages1&startupParameters=defaultP1%3Dv1%26parameterName%3DparameterValue&originalHash=",
                "explicitNavMode": true,
                "navigationMode": "embedded"
            }
        },
        {
            testDescription: "Relative target in URL, no system alias, sap-system without path prefix",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-aliasToUrl?sap-system=UR3CLNT120",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "/sap/bc/to/the/moon",
                    "systemAlias": ""
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedResolutionResult: {
                applicationType: "URL",
                reservedParameters: {},
                url: "https://example.corp.com:44355/sap/bc/to/the/moon?sap-client=120&sap-language=en",
                additionalInformation: "",
                "sap-system": "UR3CLNT120",
                text: "Sap System Test"
            }
        },
        {
            testDescription: "Relative URL, no system alias, sap-system with path",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-aliasToUrl?sap-system=ALIASRFC",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "/sap/bc/to/the/moon",
                    "systemAlias": ""
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "https://example.corp.com:1111/path/sap/bc/to/the/moon?sap-client=220&sap-language=en"
        },
        {
            testDescription: "Absolute URL, no system alias, sap-system without path",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-aliasToAbsoluteUrl?sap-system=UR3CLNT120",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToAbsoluteUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "http://www.google.com/path/to/the/moon.html",
                    "systemAlias": ""
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "http://www.google.com/path/to/the/moon.html"
        },
        {
            testDescription: "Absolute URL, no system alias, sap-system with path",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-aliasToAbsoluteUrl?sap-system=ALIASRFC",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToAbsoluteUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "http://www.google.com/path/to/the/moon.html",
                    "systemAlias": ""
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "http://www.google.com/path/to/the/moon.html"
        },
        {
            testDescription: "Relative URL, system alias with path prefix, sap-system without path prefix",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-aliasToUrl?sap-system=UR3CLNT120",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "https://vmw.example.corp.com:44335/go-to/the/moon/sap/bc/to/the/moon?sap-client=111&sap-language=EN",
                    "systemAlias": "ALIAS111"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "ALIAS111": O_KNOWN_SYSTEM_ALIASES.ALIAS111,
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "https://example.corp.com:44355/sap/bc/to/the/moon?sap-client=120&sap-language=en"
        },
        {
            testDescription: "Relative URL, system alias with path prefix, sap-system with path prefix",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-aliasToUrl?sap-system=ALIAS111",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "https://example.corp.com:1111/path//sap/bc/to/the/moon?sap-client=220&sap-language=EN",
                    "systemAlias": "ALIASRFC"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "ALIAS111": O_KNOWN_SYSTEM_ALIASES.ALIAS111,
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "https://vmw.example.corp.com:44335/go-to/the/moon/sap/bc/to/the/moon?sap-client=111&sap-language=en"
        },
        {
            testDescription: "Absolute URL, system alias with path prefix, sap-system without path prefix",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-aliasToAbsoluteUrl?sap-system=UR3CLNT120",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToAbsoluteUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "http://www.google.com/sap/bc/to/the/moon.html",
                    "systemAlias": "ALIASRFC"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120,
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "http://www.google.com/sap/bc/to/the/moon.html"
        },
        {
            testDescription: "Relative URL, with apply system alias semantics on relative URL",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-toCdmTarget",
            "inbound": {
                "title": "CDM Target",
                "semanticObject": "Action",
                "action": "toCdmTarget",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "/path/to/some/document.html",
                    "systemAlias": "UR3CLNT120",
                    "systemAliasSemantics": "apply"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "https://example.corp.com:44355/path/to/some/document.html?sap-client=120&sap-language=en"
        },
        {
            testDescription: "Relative URL, with apply system alias semantics and sap system on relative URLs",
            "UserDefaultParameters": {},
            "intent": "Action-toCdmTarget?p1=v1&sap-system=ALIASRFC", // NOTE: sap-system wins here
            "inbound": {
                "title": "CDM Target",
                "semanticObject": "Action",
                "action": "toCdmTarget",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "/path/to/some/document.html",
                    "systemAlias": "UR3CLNT120",
                    "systemAliasSemantics": "apply"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120,
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "https://example.corp.com:1111/path/path/to/some/document.html?sap-client=220&sap-language=en&p1=v1"
        },
        {
            "testDescription": "Relative URL, with no sap system or system alias, but apply semantics",
            "UserDefaultParameters": {},
            "intent": "Action-toCdmTarget", // NOTE: sap-system wins here
            "inbound": {
                "title": "CDM Target",
                "semanticObject": "Action",
                "action": "toCdmTarget",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "/path/to/some/document.html",
                    // "systemAlias": undefined, undefined system alias
                    "systemAliasSemantics": "apply"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "/path/to/some/document.html"
        },
        {
            "testDescription": "WebGUI Target, with no sap system or system alias, but apply semantics",
            "UserDefaultParameters": {},
            "intent": "Action-toCdmGuiTarget", // NOTE: sap-system wins here
            "inbound": {
                "semanticObject": "Action",
                "action": "toCdmGuiTarget",
                "title": "Manage Commodity Codes",
                "icon": "sap-icon://education",
                "resolutionResult": {
                   "sap.gui": {
                      "_version": "1.2.0",
                      "transaction": "/SAPSLL/CLSNR_01"
                   },
                   "applicationType": "TR",
                   "systemAliasSemantics": "apply",
                   "text": "Manage Commodity Codes"
                },
                "deviceTypes": { "desktop": true, "tablet": false, "phone": false },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {}
                }
            },
            oKnownSapSystemData: {
                // will use local system alias
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "TR",
            expectedUrl: "/sap/bc/gui/sap/its/webgui;?%7etransaction=/SAPSLL/CLSNR_01&%7enosplash=1&sap-language=en"
        },
        {
            "testDescription": "WebGUI Target, with sap-system and sap-system-src",
            "UserDefaultParameters": {},
            "intent": "Action-toCdmGuiTarget?sap-system=UR3CLNT120&sap-system-src=OTHERSYSTEM",
            inbound: mkInb("#Action-toCdmGuiTarget{<no params><+>}", {
                applicationType: "TR",
                systemAliasSemantics: "apply",
                text: "Manage Commodity Codes",
                "sap.gui": {
                   "_version": "1.2.0",
                   "transaction": "/SAPSLL/CLSNR_01"
                }
            }),
            oKnownSapSystemData: {
                UR3CLNT120: O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oLocalStorageContent: {
                "sap-system-data#OTHERSYSTEM:UR3CLNT120": (function (oSystemData) {
                    oSystemData.https.host = "test." + oSystemData.https.host;
                    return JSON.stringify(oSystemData);
                })(utils.clone(O_KNOWN_SYSTEM_ALIASES.UR3CLNT120))
            },
            expectedResolutionResult: {
                "applicationType": "TR",
                "reservedParameters": {},
                "sap-system": "UR3CLNT120",
                "sap-system-src": "OTHERSYSTEM",
                "text": undefined,
                "url": "https://test.example.corp.com:44355/sap/bc/gui/sap/its/webgui;~rfcHostName=example.corp.com;~service=3255;~sncNameR3=p%2fsecude%3aCN%3dUR3%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncQoPR3=8?%7etransaction=/SAPSLL/CLSNR_01&%7enosplash=1&sap-client=120&sap-language=en&sap-system-src=OTHERSYSTEM"
            }
        },
        {
            "testDescription": "WebGUI Target, with connect string in system alias",
            "UserDefaultParameters": {},
            "intent": "Action-toCdmGuiTarget?sap-system=SYSCONNSTRING",
            inbound: mkInb("#Action-toCdmGuiTarget{<no params><+>}", {
                applicationType: "TR",
                systemAliasSemantics: "apply",
                text: "Manage Commodity Codes",
                "sap.gui": {
                   "_version": "1.2.0",
                   "transaction": "/SAPSLL/CLSNR_01"
                }
            }),
            oKnownSapSystemData: {
                SYSCONNSTRING: O_KNOWN_SYSTEM_ALIASES.SYSCONNSTRING
            },
            oLocalStorageContent: {},
            expectedResolutionResult: {
                "applicationType": "TR",
                "reservedParameters": {},
                "sap-system": "SYSCONNSTRING",
                "text": undefined,
                "url": "https://example.corp.com:44355/sap/bc/gui/sap/its/webgui;~connectString=%2fH%2fCoffee%2fS%2fDecaf%2fG%2fRoast;~service=3255;~sncNameR3=p%2fsecude%3aCN%3dUR3%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncQoPR3=8?%7etransaction=/SAPSLL/CLSNR_01&%7enosplash=1&sap-client=120&sap-language=en"
            }
        },
        {
            "testDescription": "WebGUI Target, with no sap system and local system alias from server, and apply semantics",
            "UserDefaultParameters": {},
            "intent": "Action-toCdmGuiTarget", // NOTE: sap-system wins here
            "inbound": {
                "semanticObject": "Action",
                "action": "toCdmGuiTarget",
                "title": "Manage Commodity Codes",
                "icon": "sap-icon://education",
                "resolutionResult": {
                   "sap.gui": {
                      "_version": "1.2.0",
                      "transaction": "/SAPSLL/CLSNR_01"
                   },
                   "applicationType": "TR",
                   "systemAliasSemantics": "apply",
                   "text": "Manage Commodity Codes"
                },
                "deviceTypes": { "desktop": true, "tablet": false, "phone": false },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "": {
                   "https": {
                       "id": "",
                       "host": "server.example.com", // NOTE: this causes protocol to be added to the URL.
                       "port": 0, // 0: null port
                       "pathPrefix": "/sap/bc2/" // pathPrefix always prepended to URL.
                   }
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "TR",
            expectedUrl: "https://server.example.com/sap/bc2/gui/sap/its/webgui?%7etransaction=/SAPSLL/CLSNR_01&%7enosplash=1&sap-language=en"
        },
        {
            testDescription: "Absolute URL, system alias with path prefix, sap-system with path prefix",
            "UserDefaultParameters": {},
            "intent": "Action-aliasToAbsoluteUrl?sap-system=ALIAS111",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToAbsoluteUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "http://www.google.com/sap/bc/to/the/moon.html",
                    "systemAlias": "ALIASRFC"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "ALIAS111": O_KNOWN_SYSTEM_ALIASES.ALIAS111,
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "http://www.google.com/sap/bc/to/the/moon.html"
        },
        {
            testDescription: "Absolute URL, with user-env parameters added",
            "UserDefaultParameters": {},
            "UserEnvParameters": { "sap-accessibility": "X",
                "sap-statistics": true,
                "sap-language": "ZH"},
            "intent": "Action-aliasToAbsoluteUrl?sap-system=ALIAS111&param1=value1&param2=value2",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToAbsoluteUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "http://www.google.com/sap/bc/to/the/moon.html",
                    "systemAlias": "ALIASRFC"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "mylanguage": { defaultValue: { "value": "User.env.sap-language", "format": "reference" }},
                        "mystatistics": { defaultValue: { "value": "User.env.sap-statistics", "format": "reference" }},
                        "myaccess": { defaultValue: { "value": "User.env.sap-accessibility", "format": "reference" }}
                    }
                }
            },
            oKnownSapSystemData: {
                "ALIAS111": O_KNOWN_SYSTEM_ALIASES.ALIAS111,
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "http://www.google.com/sap/bc/to/the/moon.html?myaccess=X&mylanguage=ZH&mystatistics=true&param1=value1&param2=value2"
        },
        {
            testDescription: "Absolute URL, with user-env parameters added value accessiblity, statistics turned off!",
            "UserDefaultParameters": {},
            "UserEnvParameters": { "sap-accessibility": false,
                                    "sap-statistics": false,
                                    "sap-language": "ZH"},
            "intent": "Action-aliasToAbsoluteUrl?sap-system=ALIAS111&param1=value1&param2=value2",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToAbsoluteUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "http://www.google.com/sap/bc/to/the/moon.html",
                    "systemAlias": "ALIASRFC"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "mylanguage": { defaultValue: { "value": "User.env.sap-language", "format": "reference" }},
                        "mystatistics": { defaultValue: { "value": "User.env.sap-statistics", "format": "reference" }},
                        "myaccess": { defaultValue: { "value": "User.env.sap-accessibility", "format": "reference" }}
                    }
                }
            },
            oKnownSapSystemData: {
                "ALIAS111": O_KNOWN_SYSTEM_ALIASES.ALIAS111,
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "http://www.google.com/sap/bc/to/the/moon.html?mylanguage=ZH&param1=value1&param2=value2"
        },
        {
            testDescription: "Absolute URL, system alias with path prefix, sap-system with path prefix + intent parameters",
            "UserDefaultParameters": {},
            "intent": "Action-aliasToAbsoluteUrl?sap-system=ALIAS111&param1=value1&param2=value2",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToAbsoluteUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "http://www.google.com/sap/bc/to/the/moon.html",
                    "systemAlias": "ALIASRFC"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {}
                }
            },
            oKnownSapSystemData: {
                "ALIAS111": O_KNOWN_SYSTEM_ALIASES.ALIAS111,
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "http://www.google.com/sap/bc/to/the/moon.html?param1=value1&param2=value2"
        },
        {
            testDescription: "Absolute URL with parameter and hash (no hash parameters) and sap-system",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-aliasToAbsoluteUrl?C=E&D=F&sap-system=UR3CLNT120",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToAbsoluteUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "http://www.google.com/sap/bc/to/the/moon.html#SoIsses",
                    "systemAlias": "ALIASRFC"
                },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "C": {},
                        "D": {}
                    }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120,
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "http://www.google.com/sap/bc/to/the/moon.html?C=E&D=F#SoIsses"
        },
        {
            testDescription: "relative URL with parameter and hash (no hash parameters) and no sap-system",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Action-aliasToAbsoluteUrl?C=E&D=F&E=K",
            "inbound": {
                "title": "Sap System Test",
                "semanticObject": "Action",
                "action": "aliasToAbsoluteUrl",
                "resolutionResult": {
                    "additionalInformation": "",
                    "applicationType": "URL",
                    "ui5ComponentName": "",
                    "url": "/sap/bc/to/the/moon.html?A=B#SoIsses",
                    "systemAlias": "ALIASRFC"
                },
                "signature": {
                    "additionalParameters": "ignored",
                    "parameters": {
                        "C": {},
                        "D": {}
                    }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120,
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "/sap/bc/to/the/moon.html?A=B&C=E&D=F#SoIsses"
        },
        {
            testDescription: "an Easy User Access Menu transaction is resolved",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Shell-startGUI?sap-system=ALIASRFC&sap-ui2-tcode=SU01",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startGUI",
                "id": "Shell-startGUI~6NM",
                "title": "System U1Y on current client",
                "resolutionResult": {
                   "applicationType": "whatever",
                   "additionalInformation": "whatever",
                   "text": "System U1Y on current client",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "ALIASRFC",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "TR",
            expectedUrl: "https://example.corp.com:1111/path/gui/sap/its/webgui;~sysid=UV2;~loginGroup=SPACE;~messageServer=p%2fsecude%3aCN%3dUXR%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncNameR3=p%2fsecude%3aCN%3dUXR%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncQoPR3=9?%7etransaction=SU01&%7enosplash=1&sap-client=220&sap-language=en"
        },
        {
            testDescription: "an Easy User Access Menu transaction with parameters (!) is resolved",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Shell-startGUI?sap-system=ALIASRFC&sap-ui2-tcode=SU01&USER=ANTONvonWERNER&QUOTE=MeinLieberAntonWerner%20SieStehnMirEtwasFerner",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startGUI",
                "id": "Shell-startGUI~6NM",
                "title": "System U1Y on current client",
                "resolutionResult": {
                   "applicationType": "whatever",
                   "additionalInformation": "whatever",
                   "text": "System U1Y on current client",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "ALIASRFC",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "TR",
            expectedUrl: "https://example.corp.com:1111/path/gui/sap/its/webgui;~sysid=UV2;~loginGroup=SPACE;~messageServer=p%2fsecude%3aCN%3dUXR%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncNameR3=p%2fsecude%3aCN%3dUXR%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncQoPR3=9?%7etransaction=*SU01%20QUOTE%3dMeinLieberAntonWerner%20SieStehnMirEtwasFerner%3bUSER%3dANTONvonWERNER&%7enosplash=1&sap-client=220&sap-language=en"
        },
        {
            testDescription: "an Easy User Access Menu WDA target is resolved",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Shell-startWDA?sap-system=UR3CLNT120&sap-ui2-wd-app-id=EPM_POWL",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWDA",
                "id": "Shell-startGUI~6NM",
                "title": "System U1Y on current client",
                "resolutionResult": {
                   "applicationType": "whatever",
                   "additionalInformation": "whatever",
                   "text": "System U1Y on current client",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "UR3CLNT120",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "NWBC",
            expectedUrl: "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/EPM_POWL/?sap-client=120&sap-language=en"
        },
        {
            testDescription: "test WDA EAM navigation from legacy application with inplace WDA navigation configured",
            //
            // This test has a common input with the test above, but aims at
            // testing other aspects.
            //
            "UserDefaultParameters": {},
            "intent": "Shell-startWDA?sap-system=UR3CLNT120&sap-ui2-wd-app-id=EPM_POWL",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWDA",
                "id": "Shell-startGUI~6NM",
                "title": "System U1Y on current client",
                "resolutionResult": {
                   "applicationType": "WDA",
                   "additionalInformation": "whatever",
                   "text": "System U1Y on current client",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "UR3CLNT120",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            // --- end of common input

            sCurrentApplicationType: "WDA",

            oCSTRConfig: {
                config: {
                    enableInPlaceForClassicUIs: { WDA: true }
                }
            },

            expectedResolutionResult: {
              "additionalInformation": "",
              // no navigation mode property added
              "applicationType": "NWBC",
              "sap-system": "UR3CLNT120",
              "text": "EPM_POWL",
              "url": "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/EPM_POWL/?sap-client=120&sap-language=en"
            }
        },
        {
            testDescription: "test WDA EAM navigation non-legacy application with inplace WDA navigation configured",
            //
            // This test has a common input with the test above, but aims at
            // testing other aspects.
            //
            "UserDefaultParameters": {},
            "intent": "Shell-startWDA?sap-system=UR3CLNT120&sap-ui2-wd-app-id=EPM_POWL",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWDA",
                "id": "Shell-startGUI~6NM",
                "title": "System U1Y on current client",
                "resolutionResult": {
                   "applicationType": "WDA",
                   "additionalInformation": "whatever",
                   "text": "System U1Y on current client",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "UR3CLNT120",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            // --- end of common input

            sCurrentApplicationType: "UI5",

            oCSTRConfig: {
                config: {
                    enableInPlaceForClassicUIs: { WDA: true }
                }
            },

            expectedResolutionResult: {
              additionalInformation: "",
              applicationType: "NWBC",
              navigationMode: "embedded",
              "sap-system": "UR3CLNT120",
              text: "EPM_POWL",
              url: "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/EPM_POWL/?sap-client=120&sap-language=en"
            }
        },
        {
            testDescription: "an Easy User Access Menu WDA target with configuration is resolved",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Shell-startWDA?sap-system=UR3CLNT120&sap-ui2-wd-app-id=EPM_POWL&sap-ui2-wd-conf-id=CO!@^*()_+\":{}<>NFIG",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWDA",
                "id": "Shell-startWDA",
                "title": "System U1Y on current client",
                "resolutionResult": {
                   "applicationType": "whatever",
                   "additionalInformation": "whatever",
                   "text": "System U1Y on current client",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "UR3CLNT120",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "NWBC",
            expectedUrl: "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/EPM_POWL/?sap-wd-configId=CO!%40%5E*()_%20%22%3A%7B%7D%3C%3ENFIG&sap-client=120&sap-language=en"
        },
        {
            testDescription: "an Easy User Access Menu WDA target with configuration & application parameters is resolved",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Shell-startWDA?sap-system=UR3CLNT120&sap-ui2-wd-app-id=EPM_POWL&appParam1=appValue1&sap-ui2-wd-conf-id=CO!@^*()_+\":{}<>NFIG&appParam5=appValue5",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWDA",
                "id": "Shell-startWDA",
                "title": "System U1Y on current client",
                "resolutionResult": {
                   "sap.platform.runtime": { "anything": "copied"},
                   "applicationType": "whatever",
                   "additionalInformation": "whatever",
                   "text": "System U1Y on current client",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "UR3CLNT120",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "NWBC",
            expectedResolutionResult:
            {
                "additionalInformation": "",
                "applicationType": "NWBC",
                "sap-system": "UR3CLNT120",
                "text": "EPM_POWL",
                "url": "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/EPM_POWL/?appParam1=appValue1&appParam5=appValue5&sap-wd-configId=CO!%40%5E*()_%20%22%3A%7B%7D%3C%3ENFIG&sap-client=120&sap-language=en",
                "sap.platform.runtime": { "anything": "copied" }
            },
            expectedUrl: "https://example.corp.com:44355/sap/bc/ui2/nwbc/~canvas;window=app/wda/EPM_POWL/?appParam1=appValue1&appParam5=appValue5&sap-wd-configId=CO!%40%5E*()_%20%22%3A%7B%7D%3C%3ENFIG&sap-client=120&sap-language=en"
        },
        {
            testDescription: "an Shell-launchURL record is resolved with parameter stripped!",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Shell-launchURL?sap-external-url=http:%2F%2Fwww.nytimes.com",
            "inbound": {
                "semanticObject": "Shell",
                "action": "launchURL",
                "id": "Shell-launchURL",
                "title": "System U1Y on current client",
                "resolutionResult": {
                   "applicationType": "URL",
                   "text": "System U1Y on current client",
                   "url": "http://www.nytimes.com"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-external-url": {
                         "filter": {
                            "value": "http://www.nytimes.com",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "URL",
            expectedUrl: "http://www.nytimes.com"
        },
        {
            testDescription: "a system alias is resolved to an object with 'rfc: {}' and '{ https : { port: \"\" }}'",
            // We need to make sure we support that a system alias is resolved
            // in the format specified in EMPTY_PORT_PREFIX_RFC system alias. This
            // is what HCP uses in the end.
            "UserDefaultParameters": {},
            "intent": "Flight-lookup",
            "inbound": {
               "semanticObject": "Flight",
               "action": "lookup",
               "title": "Browse Flight Bookings",
               "resolutionResult": {
                  "componentProperties": {
                     "html5AppName": "",
                     "siteId": "28000d99-ce12-4d95-98c2-eb0409d6c6b8",
                     "appId": "9c3b3414-e26e-46c1-89fa-4022b088097c-1465888775169"
                  },
                  "sap.platform.runtime": {
                     "componentProperties": {
                        "html5AppName": "",
                        "siteId": "28000d99-ce12-4d95-98c2-eb0409d6c6b8",
                        "appId": "9c3b3414-e26e-46c1-89fa-4022b088097c-1465888775169"
                     }
                  },
                  "sap.wda": {
                     "_version": "1.3.0",
                     "applicationId": "FPM_TEST_SADL_ATTR_FILT_SBOOK",
                     "configId": ""
                  },
                  "applicationType": "WDA",
                  "systemAlias": "ABAP_BACKEND_FOR_DEMO",
                  "text": "Browse Flight Bookings"
               },
               "deviceTypes": {
                  "desktop": true,
                  "tablet": true,
                  "phone": true
               },
               "signature": {
                  "parameters": {},
                  "additionalParameters": "ignored"
               },
               "tileResolutionResult": {
                  "title": "Browse Flight Bookings",
                  "tileComponentLoadInfo": "#Shell-staticTile",
                  "isCustomTile": false
               }
            },
            oKnownSapSystemData: {
                "ABAP_BACKEND_FOR_DEMO": O_KNOWN_SYSTEM_ALIASES.EMPTY_PORT_PREFIX_RFC
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "NWBC",
            expectedUrl: "https://system.our.domain.corp/sap/bc/ui2/nwbc/~canvas;window=app/wda/FPM_TEST_SADL_ATTR_FILT_SBOOK/?sap-language=en"
        },
        {
            // When CSTR is configured to open WDA applications in embedded
            // mode, the navigation mode must be "embedded" in the result.
            testDescription: "embedded navigation mode for WDA is configured, and 'WDA' processor is used",
            UserDefaultParameters: {},
            intent: "Action-towda",
            inbounds: [mkInb("#Action-towda", {
                applicationType: "WDA",
                "sap.ui": { technology: "WDA" },
                url: "/some/wda/app"
            })],
            oCSTRConfig: {
                config: {
                    enableInPlaceForClassicUIs: { WDA: true }
                }
            },
            expectedResolutionResult: {
                "applicationType": "NWBC",
                "navigationMode": "embedded", // <-- NOTE
                "reservedParameters": {},
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/wda/app"
            }
        },
        {
            // Embedded navigation mode should also works for results
            // constructed entirely locally.
            testDescription: "embedded navigation mode for WDA when is to be resolved via 'WDA full url construction' processor",
            UserDefaultParameters: {},
            intent: "Action-towda",
            oKnownSapSystemData: {
                "ABAP_BACKEND_FOR_DEMO": O_KNOWN_SYSTEM_ALIASES.EMPTY_PORT_PREFIX_RFC
            },
            inbounds: [mkInb("#Action-towda", {
                "sap.wda": {
                    "_version": "1.2.0",
                    "applicationId": "FIS_FPM_OVP_STKEYFIGITEMCO",
                    "configId": "FIS_FPM_OVP_STKEYFIGITEMCO"
                },
                "applicationType": "WDA",
                "systemAlias": "ABAP_BACKEND_FOR_DEMO",
                "text": "Statistical Key Figures"
            })],
            oCSTRConfig: {
                config: {
                    enableInPlaceForClassicUIs: { WDA: true }
                }
            },
            expectedResolutionResult: {
                "applicationType": "NWBC",
                "navigationMode": "embedded", // <-- NOTE
                "reservedParameters": {},
                "sap-system": undefined,
                "text": undefined,
                "url": "https://system.our.domain.corp/sap/bc/ui2/nwbc/~canvas;window=app/wda/FIS_FPM_OVP_STKEYFIGITEMCO/?sap-wd-configId=FIS_FPM_OVP_STKEYFIGITEMCO&sap-language=en"
            }
        },
        {
            // Test that sap-system-src and sap-system are taken into account
            // when when WDA is constructed entirely locally
            testDescription: "'WDA full url construction' processor takes into account sap-system and sap-system-src",
            UserDefaultParameters: {},
            intent: "Action-towda?sap-system=UR3CLNT120&sap-system-src=OTHERSYSTEM",
            oKnownSapSystemData: {
                "ABAP_BACKEND_FOR_DEMO": O_KNOWN_SYSTEM_ALIASES.EMPTY_PORT_PREFIX_RFC,
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            inbounds: [mkInb("#Action-towda{<no params><+>}", {
                "sap.wda": {
                    "_version": "1.2.0",
                    "applicationId": "FIS_FPM_OVP_STKEYFIGITEMCO",
                    "configId": "FIS_FPM_OVP_STKEYFIGITEMCO"
                },
                "applicationType": "WDA",
                "systemAlias": "ABAP_BACKEND_FOR_DEMO",
                "text": "Statistical Key Figures"
            })],
            oLocalStorageContent: {
                "sap-system-data#OTHERSYSTEM:UR3CLNT120": (function (oSystemData) {
                    // stored data are different than the adapter's data
                    oSystemData.language = "DE";
                    oSystemData.client = "200";
                    oSystemData.https.host = "ur3.example.corp.com";
                    oSystemData.https.port = 8080;

                    return JSON.stringify(oSystemData);
                })(utils.clone(O_KNOWN_SYSTEM_ALIASES.UR3CLNT120))
            },
            expectedResolutionResult: {
                "applicationType": "NWBC",
                "reservedParameters": {},
                "sap-system": "UR3CLNT120",
                "sap-system-src": "OTHERSYSTEM",
                "text": undefined,
                "url": "https://ur3.example.corp.com:8080/sap/bc/ui2/nwbc/~canvas;window=app/wda/FIS_FPM_OVP_STKEYFIGITEMCO/?sap-wd-configId=FIS_FPM_OVP_STKEYFIGITEMCO&sap-client=200&sap-language=DE&sap-system-src=OTHERSYSTEM"
            }
        },
        {
            // When CSTR is configured to open GUI applications in embedded
            // mode, the navigation mode must be "embedded" in the result.
            testDescription: "embedded navigation mode for GUI is configured",
            UserDefaultParameters: {},
            intent: "Action-togui",
            inbounds: [mkInb("#Action-togui", {
                applicationType: "TR",
                "url": "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN",
                "sap.ui": { technology: "GUI" }
            })],
            oCSTRConfig: {
                config: {
                    enableInPlaceForClassicUIs: { GUI: true }
                }
            },
            expectedResolutionResult: {
              "applicationType": "TR",
              "navigationMode": "embedded", // <-- NOTE
              "reservedParameters": {},
              "sap-system": undefined,
              "text": undefined,
              "url": "/sap/bc/gui/sap/its/webgui;~sysid=UV2;~service=3255?%7etransaction=*APB_LPD_CALL_B_I_TXN"
            }
        },
        {
            testDescription: "an intent matches a virtual target mapping",
            "UserDefaultParameters": {},
            "intent": "Action-search",
            "inbounds": A_VIRTUAL_INBOUNDS,
            expectedResolutionResult: {
                "additionalInformation": "SAPUI5.Component=sap.ushell.renderers.fiori2.search.container",
                "applicationType": "SAPUI5",
                "sap-system": undefined,
                "text": undefined,
                "ui5ComponentName": "sap.ushell.renderers.fiori2.search.container",
                "url": "../../../../../resources/sap/ushell/renderers/fiori2/search/container",
                "reservedParameters": {}
            }
        },
        {
            testDescription: "an intent matches a virtual target mapping",
            "UserDefaultParameters": {},
            "intent": "Action-search",
            "inbounds": [], // note, adapter returns no inbound
            expectedResolutionResult: {
                "additionalInformation": "SAPUI5.Component=sap.ushell.renderers.fiori2.search.container",
                "applicationType": "SAPUI5",
                "sap-system": undefined,
                "text": undefined,
                "ui5ComponentName": "sap.ushell.renderers.fiori2.search.container",
                "url": "../../../../../resources/sap/ushell/renderers/fiori2/search/container",
                "reservedParameters": {}
            }
        },
        {
            testDescription: "sap-tag parameter is not propagated to the resolved SAPUI5 URL",
            UserDefaultParameters: {},
            intent: "Object-act1",
            inbounds: [mkInb("#Object-act1{[sap-tag:[superior]]}", {
                applicationType: "SAPUI5",
                "sap.ui": { technology: "UI5" },
                url: "/some/app"
            })],
            expectedResolutionResult: {
                "applicationType": "SAPUI5",
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/app",
                "reservedParameters": {}
            }
        },
        {
            testDescription: "sap-tag parameter is not propagated to the resolved WDA URL",
            UserDefaultParameters: {},
            intent: "Object-act1",
            inbounds: [mkInb("#Object-act1{[sap-tag:[superior]]}", {
                applicationType: "WDA",
                "sap.ui": { technology: "WDA" },
                url: "/some/wda/app"
            })],
            expectedResolutionResult: {
                "applicationType": "NWBC",
                "reservedParameters": {},
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/wda/app"
            }
        },
        {
            testDescription: "sap-tag parameter is not propagated to the resolved GUI URL",
            UserDefaultParameters: {},
            intent: "Object-act1",
            inbounds: [mkInb("#Object-act1{[sap-tag:[superior]]}", {
                applicationType: "TR",
                "sap.ui": { technology: "GUI" },
                url: "/path/gui/sap/its/webgui;"
            })],
            expectedResolutionResult: {
                "applicationType": "TR",
                "reservedParameters": {},
                "sap-system": undefined,
                "text": undefined,
                "url": "/path/gui/sap/its/webgui;?&"
            }
        },
        {
            testDescription: "sap-tag and sap-fiori-id parameters are not propagated to the resolved GUI URL",
            UserDefaultParameters: {},
            intent: "Object-act1?sap-fiori-id=12345",
            inbounds: [mkInb("#Object-act1{[sap-tag:[superior]]}", {
                applicationType: "TR",
                "sap.ui": { technology: "GUI" },
                url: "/path/gui/sap/its/webgui;"
            })],
            expectedResolutionResult: {
                "applicationType": "TR",
                "reservedParameters": {
                    "sap-fiori-id": [ "12345" ]
                },
                "sap-system": undefined,
                "text": undefined,
                "url": "/path/gui/sap/its/webgui;?&"
            }
        },
        {
            testDescription: "sap-ui-fl-max-layer is provided in the inbound as a default parameter for a SAPUI5 target",
            UserDefaultParameters: {},
            intent: "Object-act1",
            inbounds: [ mkInb("#Object-act1{[sap-ui-fl-max-layer:[TEST]]}", {
                applicationType: "SAPUI5",
                "sap.ui": { technology: "UI5" },
                url: "/some/app"
            }) ],
            expectedResolutionResult: {
                "applicationType": "SAPUI5",
                "reservedParameters": {
                    "sap-ui-fl-max-layer": [ "TEST" ]
                },
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/app"
            }
        },
        {
            testDescription: "sap-ui-fl-max-layer is provided in the intent",
            UserDefaultParameters: {},
            intent: "Object-act1?sap-ui-fl-max-layer=TEST",
            inbounds: [ mkInb("#Object-act1{<->}", { // <-> : notallowed
                                                     // but sap- parameters
                                                     // ignore additionalParameters.
                applicationType: "SAPUI5",
                "sap.ui": { technology: "UI5" },
                url: "/some/app"
            }) ],
            expectedResolutionResult: {
                "applicationType": "SAPUI5",
                "reservedParameters": {
                    "sap-ui-fl-max-layer": [ "TEST" ] // from intent
                },
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/app"
            }
        },
        {
            testDescription: "sap-ui-fl-max-layer and sap-fiori-id are provided in the intent",
            UserDefaultParameters: {},
            intent: "Object-act1?sap-ui-fl-max-layer=TEST&sap-fiori-id=12345",
            inbounds: [ mkInb("#Object-act1{<->}", { // <-> : notallowed
                                                     // but sap- parameters
                                                     // ignore additionalParameters.
                applicationType: "SAPUI5",
                "sap.ui": { technology: "UI5" },
                url: "/some/app"
            }) ],
            expectedResolutionResult: {
                "applicationType": "SAPUI5",
                "reservedParameters": {
                    "sap-ui-fl-max-layer": [ "TEST" ], // from intent
                    "sap-fiori-id": [ "12345" ]
                },
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/app"
            }
        },
        {
            testDescription: "sap-system-src is provided in the intent",
            UserDefaultParameters: {},
            intent: "Object-act1?sap-system=ABC&sap-system-src=DEF",
            inbounds: [ mkInb("#Object-act1{<+>}", {
                applicationType: "SAPUI5",
                "sap.ui": { technology: "UI5" },
                url: "/some/app"
            }) ],
            expectedResolutionResult: {
                "applicationType": "SAPUI5",
                "reservedParameters": {},
                "sap-system": "ABC",
                "sap-system-src": "DEF",
                "text": undefined,
                "url": "/some/app?sap-system=ABC&sap-system-src=DEF"
            }
        },
        {
            testDescription: "sap-ui-fl-control-variant-id is provided in the intent",
            UserDefaultParameters: {},
            intent: "Object-act1?sap-ui-fl-control-variant-id=TEST",
            inbounds: [ mkInb("#Object-act1{<->}", { // <-> : notallowed
                                                     // but sap- parameters
                                                     // ignore additionalParameters.
                applicationType: "SAPUI5",
                url: "/some/app"
            }) ],
            expectedResolutionResult: {
                "applicationType": "SAPUI5",
                "reservedParameters": {
                    "sap-ui-fl-control-variant-id": [ "TEST" ] // from intent
                },
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/app"
            }
        },
        {
            testDescription: "sap-ui-fl-max-layer is a mandatory filter",
            UserDefaultParameters: {},
            intent: "Object-act1?sap-ui-fl-max-layer=FOO",
            inbounds: [ mkInb("#Object-act1{sap-ui-fl-max-layer:FOO<->}", {
                applicationType: "SAPUI5",
                "sap.ui": { technology: "UI5" },
                url: "/some/app"
            }) ],
            expectedResolutionResult: {
                "applicationType": "SAPUI5",
                "reservedParameters": {
                    "sap-ui-fl-max-layer": [ "FOO" ]
                },
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/app"
            }
        },
        {
            //
            // sap-ui-tech-hint=WDA can be used to select a WDA target
            //
            testDescription: "sap-ui-tech-hint=WDA specified in intent but not in inbound",
            UserDefaultParameters: {},
            intent: "Object-action?sap-ui-tech-hint=WDA",
            inbounds: [
                mkInb("#Object-action{<no params><+>}", {
                        applicationType: "SAPUI5",
                        "sap.ui": { technology: "UI5" },
                        url: "/some/ui5app"
                    }),
                mkInb("#Object-action{<no params><+>}", {
                    applicationType: "WDA",
                    "sap.ui": { technology: "WDA" },
                    url: "/some/wdaApp"
                })
            ],
            expectedResolutionResult: {
                "applicationType": "NWBC",
                "reservedParameters": {},
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/wdaApp?sap-ui-tech-hint=WDA" // sap-ui-tech-hint propagated
            }
        },
        {
            //
            // sap-ui-tech-hint used as filter
            //
            testDescription: "sap-ui-tech-hint=WDA specified in intent and UI5 inbound with sap-ui-tech-hint=WDA filter",
            UserDefaultParameters: {},
            intent: "Object-action?sap-ui-tech-hint=WDA",
            inbounds: [
                mkInb("#Object-action{sap-ui-tech-hint:WDA<+>}", { // generally it's wrong, but this proves tech priority is
                                                                     // even more effective than filtering
                        applicationType: "SAPUI5",
                        "sap.ui": { technology: "UI5" },
                        url: "/some/ui5app"
                    }),
                mkInb("#Object-action{<no params><->}", { // still wins
                    applicationType: "WDA",
                    "sap.ui": { technology: "WDA" },
                    url: "/some/wdaApp"
                })
            ],
            expectedResolutionResult: {
                "applicationType": "NWBC",
                "reservedParameters": {},
                "sap-system": undefined,
                "text": undefined,
                "url": "/some/wdaApp?sap-ui-tech-hint=WDA" // sap-ui-tech-hint propagated
            }
        },
        {
            //
            // sap-ui-app-id-hint=app3 can be used to select the target with id=app3
            //
            testDescription: "sap-ui-app-id-hint=app3 specified in intent but not in inbound",
            UserDefaultParameters: {},
            intent: "Object-action?sap-ui-app-id-hint=app3",
            inbounds: [
                mkInb("#Object-action{<no params><+>}", {
                    "appId": "app1",
                    "applicationType": "SAPUI5"
                }, {"title": "app1" }),
                mkInb("#Object-action{<no params><+>}", {
                    "appId": "app2",
                    "applicationType": "SAPUI5"
                }, {"title": "app2" }),
                mkInb("#Object-action{<no params><+>}", {
                    "appId": "app3",
                    "applicationType": "SAPUI5"
                }, {"title": "app3" })
            ],
            expectedResolutionResult: {
                "applicationType": "SAPUI5",
                "reservedParameters": {
                    "sap-ui-app-id-hint": ["app3"]
                },
                "sap-system": undefined,
                "text": "app3",
                "url": ""
            }
        },
        {
            //
            // sap-ui-app-id-hint=app5 will still navigate to an app although no app with id=app5 exists
            //
            testDescription: "sap-ui-app-id-hint=app3 specified in intent but not in inbound",
            UserDefaultParameters: {},
            intent: "Object-action?sap-ui-app-id-hint=app5",
            inbounds: [
                mkInb("#Object-action{<no params><+>}", {
                    "appId": "app1",
                    "applicationType": "SAPUI5"
                }, {"title": "app1" }),
                mkInb("#Object-action{<no params><+>}", {
                    "appId": "app2",
                    "applicationType": "SAPUI5"
                }, {"title": "app2" }),
                mkInb("#Object-action{<no params><+>}", {
                    "appId": "app3",
                    "applicationType": "SAPUI5"
                }, {"title": "app3" })
            ],
            expectedResolutionResult: {
                "applicationType": "SAPUI5",
                "reservedParameters": {
                    "sap-ui-app-id-hint": ["app5"]
                },
                "sap-system": undefined,
                "text": "app1",
                "url": ""
            }
        },
        {
            testDescription: "a WCF target with system alias is resolved",
            "UserDefaultParameters": {},
            "intent": "WCF-displayTarget",
            "inbound": {
                 "semanticObject": "WCF",
                 "action": "displayTarget",
                 "id": "WCF-displayTarget~84B1A6C516ED9D8D0F25B52DA418805A8",
                 "title": "WCF App",
                 "resolutionResult": {
                    "applicationType": "WCF",
                    "additionalInformation": "",
                    "text": "WCF App",
                    "url": "https://example.corp.com:44300/sap/bc/bsp/sap/crm_ui_start/default.htm?sap-client=013&sap-language=EN&wcf-target-id=SVO_DISP",
                    "systemAlias": "ZWCF",
                    "sap.ui": {
                       "technology": "WCF"
                    }
                 },
                 "deviceTypes": {
                    "desktop": true,
                    "tablet": true,
                    "phone": false
                 },
                 "signature": {
                    "parameters": {},
                    "additionalParameters": "allowed"
                 }
            },
            oOldAppStateData: {},
            oKnownSapSystemData: {
                "ZWCF": O_KNOWN_SYSTEM_ALIASES.ZWCF
            },
            expectedResolutionResult: {
                "additionalInformation": "",
                "applicationType": "WCF",
                "fullWidth": true,
                "navigationMode": "embedded",
                "reservedParameters": {},
                "text": "WCF App",
                "url": "https://example.corp.com:44300/sap/bc/bsp/sap/crm_ui_start/default.htm?sap-client=013&sap-language=EN&wcf-target-id=SVO_DISP"
            }
        },
        {
            testDescription: "a WCF target with configuration is resolved",
            "UserDefaultParameters": {},
            "intent": "Shell-startWCF?technicalId=MD-BP-OV",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWCF",
                "id": "Shell-startWCF",
                "title": "WCF target inbound",
                "resolutionResult": {
                    "url": "/bsp/sap/crm_ui_start/default.htm",
                    "applicationType": "WCF",
                    "sap.ui": { "technology": "WCF" }
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "sap-system": {
                            "defaultValue": {
                                "value": "UR3CLNT120",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "technicalId": {
                            "renameTo": "crm-targetId",
                            "required": true
                        }
                    }
                }
            },
            oOldAppStateData: {},
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            expectedResolutionResult: {
                "applicationType": "WCF",
                "text": "",
                "additionalInformation": "",
                "navigationMode": "embedded",
                "reservedParameters": {},
                "fullWidth": true,
                "url": "https://example.corp.com:44355/sap/bc/bsp/sap/crm_ui_start/default.htm?sap-client=120&sap-language=en&crm-targetId=MD-BP-OV"
            }
        },
        {
            testDescription: "a WCF target with different parameters is resolved",
            "UserDefaultParameters": {},
            "intent": "Shell-startWCF?technicalId=MD-BP-OV&saprole=SUPPLIER",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWCF",
                "id": "Shell-startWCF",
                "title": "WCF target inbound",
                "resolutionResult": {
                    "url": "/bsp/sap/crm_ui_start/default.htm",
                    "applicationType": "WCF",
                    "sap.ui": { "technology": "WCF" }
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "sap-system": {
                            "defaultValue": {
                                "value": "UR3CLNT120",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "technicalId": {
                            "renameTo": "crm-targetId",
                            "required": true
                        }
                    }
                }
            },
            oOldAppStateData: {},
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            expectedResolutionResult: {
                "applicationType": "WCF",
                "text": "",
                "additionalInformation": "",
                "navigationMode": "embedded",
                "reservedParameters": {},
                "fullWidth": true,
                "url": "https://example.corp.com:44355/sap/bc/bsp/sap/crm_ui_start/default.htm?sap-client=120&sap-language=en&crm-targetId=MD-BP-OV&saprole=SUPPLIER"
            }
        },
        {
            testDescription: "a WCF target with defined title is resolved",
            "UserDefaultParameters": {},
            "intent": "Shell-startWCF?technicalId=MD-BP-OV&saprole=SUPPLIER",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWCF",
                "id": "Shell-startWCF",
                "title": "WCF target inbound",
                "resolutionResult": {
                    "url": "/bsp/sap/crm_ui_start/default.htm",
                    "applicationType": "WCF",
                    "sap.ui": { "technology": "WCF" },
                    "text": "WCF target inbound"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "sap-system": {
                            "defaultValue": {
                                "value": "UR3CLNT120",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "technicalId": {
                            "renameTo": "crm-targetId",
                            "required": true
                        }
                    }
                }
            },
            oOldAppStateData: {},
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            expectedResolutionResult: {
                "applicationType": "WCF",
                "text": "WCF target inbound",
                "additionalInformation": "",
                "navigationMode": "embedded",
                "reservedParameters": {},
                "fullWidth": true,
                "url": "https://example.corp.com:44355/sap/bc/bsp/sap/crm_ui_start/default.htm?sap-client=120&sap-language=en&crm-targetId=MD-BP-OV&saprole=SUPPLIER"
            }
        },
        {
            testDescription: "a WCF target is not resolved because technicalId is missing",
            "UserDefaultParameters": {},
            "intent": "Shell-startWCF?saprole=SUPPLIER&sap-system=UR3CLNT120",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWCF",
                "id": "Shell-startWCF",
                "title": "WDF target inbound",
                "resolutionResult": {
                    "url": "/bsp/sap/crm_ui_start/default.htm",
                    "applicationType": "WCF",
                    "sap.ui": { "technology": "WCF" }
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                        "sap-system": {
                            "defaultValue": {
                                "value": "UR3CLNT120",
                                "format": "plain"
                            },
                            "required": false
                        },
                        "technicalId": {
                            "renameTo": "crm-targetId",
                            "required": true
                        }
                    }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oOldAppStateData: {},
            expectedResolve: false,
            expectedRejectError: "Could not resolve navigation target"
        },
        {
            testDescription: "an Easy User Access Menu WDA target is resolved with sap-system-src",
            // ignore certain fields not needed for the test
            "UserDefaultParameters": {},
            "intent": "Shell-startWDA?sap-system=UR3CLNT120&sap-system-src=UV2CLNT120&sap-ui2-wd-app-id=EPM_POWL",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startWDA",
                "id": "Shell-startWDA~6NM",
                "title": "Title",
                "resolutionResult": {
                   "applicationType": "whatever",
                   "additionalInformation": "whatever",
                   "text": "whatever",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                    "additionalParameters": "allowed",
                    "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "UR3CLNT120",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "UR3CLNT120": O_KNOWN_SYSTEM_ALIASES.UR3CLNT120
            },
            oLocalStorageContent: {
                "sap-system-data#UV2CLNT120:UR3CLNT120": (function (oSystemData) {
                    // stored data are different than the adapter's data
                    oSystemData.language = "DE";
                    oSystemData.client = "200";
                    oSystemData.https.host = "ur3.example.corp.com";
                    oSystemData.https.port = 8080;

                    return JSON.stringify(oSystemData);
                })(utils.clone(O_KNOWN_SYSTEM_ALIASES.UR3CLNT120))
            },
            oOldAppStateData: {},
            expectedResolve: true,
            expectedResolutionResult: {
                "additionalInformation": "",
                "applicationType": "NWBC",
                "sap-system": "UR3CLNT120",
                "sap-system-src": "UV2CLNT120",
                "text": "EPM_POWL",
                "url": "https://ur3.example.corp.com:8080/sap/bc/ui2/nwbc/~canvas;window=app/wda/EPM_POWL/?sap-client=200&sap-language=DE"
            }
        },
        {
            testDescription: "an Easy User Access Menu GUI resolution is rejected dure to missing system data in local storage",
            "intent": "Shell-startGUI?sap-system=ALIASRFC&sap-system-src=OTHERSYS&sap-ui2-tcode=SU01",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startGUI",
                "id": "Shell-startGUI~6NM",
                "title": "whatever",
                "resolutionResult": {
                   "applicationType": "whatever",
                   "additionalInformation": "whatever",
                   "text": "whatever",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "ALIASRFC",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oLocalStorageContent: {}, // nothing saved in local storage
            oKnownSapSystemData: {
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            expectedResolve: false,
            expectedRejectError: "Cannot find data for system 'ALIASRFC' in local storage using key 'sap-system-data#OTHERSYS:ALIASRFC'"
        },
        {
            testDescription: "an Easy User Access Menu GUI with sap-system-src",
            "intent": "Shell-startGUI?sap-system=ALIASRFC&sap-system-src=OTHERSYS&sap-ui2-tcode=SU01",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startGUI",
                "id": "Shell-startGUI~6NM",
                "title": "whatever",
                "resolutionResult": {
                   "applicationType": "whatever",
                   "additionalInformation": "whatever",
                   "text": "whatever",
                   "url": "whatever",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-system": {
                         "filter": {
                            "value": "ALIASRFC",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oKnownSapSystemData: {
                "ALIASRFC": O_KNOWN_SYSTEM_ALIASES.ALIASRFC
            },
            oLocalStorageContent: {
                "sap-system-data#OTHERSYS:ALIASRFC": (function (oSystemData) {
                    // stored data are different than the adapter's data
                    oSystemData.language = "DE";
                    oSystemData.client = "200";
                    oSystemData.https.host = "othersys.example.corp.com";
                    oSystemData.https.port = 8080;
                    oSystemData.rfc.systemId = "OTH";

                    return JSON.stringify(oSystemData);
                })(utils.clone(O_KNOWN_SYSTEM_ALIASES.ALIASRFC))
            },
            expectedResolutionResult: {
             "additionalInformation": "whatever",
              "applicationType": "TR",
              "sap-system": "ALIASRFC",
              "sap-system-src": "OTHERSYS",
              "text": "SU01",
              "url": "https://othersys.example.corp.com:8080/path/gui/sap/its/webgui;~sysid=OTH;~loginGroup=SPACE;~messageServer=p%2fsecude%3aCN%3dUXR%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncNameR3=p%2fsecude%3aCN%3dUXR%2c%20O%3dSAP-AG%2c%20C%3dDE;~sncQoPR3=9?%7etransaction=SU01&%7enosplash=1&sap-client=200&sap-language=DE&sap-system-src=OTHERSYS"
            }
        },
        {
            testDescription: "URL target with sap-system, in the context of sap-system-src",
            "UserDefaultParameters": {},
            "intent": "Action-toSomeURL?sap-system=ALIAS111&sap-system-src=SYSTEM2",
            "inbound": mkInb("#Action-toSomeURL{<no params><+>}", {
                applicationType: "URL",
                "sap.ui": { technology: "URL" },
                url: "/some/url"
            }),
            oLocalStorageContent: {
                "sap-system-data#SYSTEM2:ALIAS111": (function (oSystemData) {
                    // stored data are different than the adapter's data
                    oSystemData.language = "DE";
                    oSystemData.client = "200";
                    oSystemData.https.host = "mars.example.com";

                    return JSON.stringify(oSystemData);
                })(utils.clone(O_KNOWN_SYSTEM_ALIASES.ALIAS111))
            },
            oKnownSapSystemData: {
                "ALIAS111": O_KNOWN_SYSTEM_ALIASES.ALIAS111
            },
            expectedResolutionResult: {
                "applicationType": "URL",
                "reservedParameters": {},
                "sap-system": "ALIAS111",
                "sap-system-src": "SYSTEM2",
                "text": undefined,
                "url": "https://mars.example.com:44335/go-to/the/moon/some/url?sap-client=200&sap-language=DE"
            }
        },
        {
            "testDescription": "URL target with sap-system, in the context of sap-system-src and a sap-fiori-id",
            "UserDefaultParameters": {},
            "intent": "Action-toSomeURL?sap-system=ALIAS111&sap-system-src=SYSTEM2&sap-fiori-id=12345",
            "inbound": mkInb("#Action-toSomeURL{<no params><+>}", {
                applicationType: "URL",
                "sap.ui": { technology: "URL" },
                url: "/some/url"
            }),
            oLocalStorageContent: {
                "sap-system-data#SYSTEM2:ALIAS111": (function (oSystemData) {
                    // stored data are different than the adapter's data
                    oSystemData.language = "DE";
                    oSystemData.client = "200";
                    oSystemData.https.host = "mars.example.com";

                    return JSON.stringify(oSystemData);
                })(utils.clone(O_KNOWN_SYSTEM_ALIASES.ALIAS111))
            },
            oKnownSapSystemData: {
                "ALIAS111": O_KNOWN_SYSTEM_ALIASES.ALIAS111
            },
            expectedResolutionResult: {
                "applicationType": "URL",
                "reservedParameters": {
                    "sap-fiori-id": ["12345"]
                },
                "sap-system": "ALIAS111",
                "sap-system-src": "SYSTEM2",
                "text": undefined,
                "url": "https://mars.example.com:44335/go-to/the/moon/some/url?sap-client=200&sap-language=DE"
            }
        },
        {
            testDescription: "an Easy User Access Menu transaction is resolved as SAPUI5 application is the application type is SAPUI5",
            "UserDefaultParameters": {},
            "intent": "Shell-startGUI?sap-ui2-tcode=SU01",
            "inbound": {
                "semanticObject": "Shell",
                "action": "startGUI",
                "id": "Shell-startGUI~6NM",
                "title": "System U1Y on current client",
                "resolutionResult": {
                   "applicationType": "SAPUI5",
                   "additionalInformation": "whatever",
                   "text": "System U1Y on current client",
                   "url": "http://someurl",
                   "systemAlias": "whatever"
                },
                "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
                "signature": {
                   "additionalParameters": "allowed",
                   "parameters": {
                      "sap-ui2-tcode": {
                         "filter": {
                            "value": "SU01",
                            "format": "plain"
                         },
                         "required": true
                      }
                   }
                }
            },
            oOldAppStateData: {},
            expectedAppStateData: {},
            expectedApplicationType: "SAPUI5",
            expectedUrl: "http://someurl?sap-ui2-tcode=SU01"
        }
    ].forEach(function (oFixture) {
        jQuery.sap.log.setLevel(5);

        // Fixture Defaulting
        if (!oFixture.hasOwnProperty("expectedResolve")) {
            oFixture.expectedResolve = true;
        }

        asyncTest("Complete resolveHashFragment for intent " + oFixture.intent + " when " + oFixture.testDescription, function () {
            // Given that we mock some services, here there is an explicit list
            // of the non-mocked ones.
            var oNewAppStates = [new FakeAppState("ASNEW", {}), new FakeAppState("ASNEW2", {})];
            var oNewAppState = oNewAppStates[0];
            var oAllowedRequireServices = {
                "URLParsing": true,
                "ShellNavigation": true,
                "ReferenceResolver": true,
                "UserInfo": {
                    getUser: sinon.stub().returns({
                        getTheme: sinon.stub().returns("sap_belize")
                    })
                },
                "AppState": (function () {
                    var iCnt = -1;

                    return {
                        getAppState: sinon.stub().returns(
                            new jQuery.Deferred().resolve(new FakeAppState("ASOLD", oFixture.oOldAppStateData)).promise()
                        ),
                        createEmptyAppState: function () {
                            return oNewAppStates[++iCnt];
                        }
                    };
                })()
            };

            sinon.stub(jQuery.sap.log, "error");
            sinon.stub(jQuery.sap.log, "warning");

            if (oFixture.sCurrentApplicationType) {
                oAppConfiguration.setCurrentApplication({
                    applicationType: oFixture.sCurrentApplicationType
                    // remaining fields of this object are not relevant for
                    // this test.
                });
            }

            var oMockedLocalStorageContent = oFixture.oLocalStorageContent || {};
            sinon.stub(utils, "getLocalStorage").returns({
                getItem: function (sKey) {
                    if (!oMockedLocalStorageContent.hasOwnProperty(sKey)) {
                        return null; // localStorage return value when key is not found
                    }
                    return oMockedLocalStorageContent[sKey];
                }
            });

            var aFixtureInbounds = oFixture.inbounds || [ oFixture.inbound ];
            var aFixtureInboundsClone = aFixtureInbounds.map(function (oInbound) {
                return jQuery.extend(true, {}, oInbound);
            });
            // for one test case, the inbound.resolutionResult.url has to be undefined
            // we check for this as jQuery.extend can't handle that.

            if (oFixture.testDescription === "UI5 with undefined URL") {
                    aFixtureInboundsClone[0].resolutionResult.url = undefined;
            }

            // WOrk
            var oFakeAdapter = {
                resolveSystemAlias: function (sSystemAlias) {
                    var oDeferred = new jQuery.Deferred();
                    if (oFixture.oKnownSapSystemData && oFixture.oKnownSapSystemData.hasOwnProperty(sSystemAlias)) {
                        return oDeferred.resolve(oFixture.oKnownSapSystemData[sSystemAlias]).promise();
                    }
                    if (sSystemAlias === "") {
                        return oDeferred.resolve(O_LOCAL_SYSTEM_ALIAS).promise();
                    }
                    return oDeferred.reject("Cannot resolve system alias").promise();
                },
                getInbounds: sinon.stub().returns(
                    new jQuery.Deferred().resolve(aFixtureInboundsClone).promise()
                ),
                resolveHashFragmentFallback: function (oIntent, oMatchingTarget, oParameters) {
                    var obj = { url: "fallback :-(" + JSON.stringify(oParameters).replace(/["]/g, "").replace(/\\/g, "") };
                    if (oMatchingTarget.resolutionResult && oMatchingTarget.resolutionResult["sap.platform.runtime"]) {
                        obj["sap.platform.runtime"] = oMatchingTarget.resolutionResult["sap.platform.runtime"];
                    }
                    return new jQuery.Deferred().resolve(obj).promise();
                }
            };

            function FakeAppState (sKey, oData) {
                this.oData = oData;
                this.getKey = function () { return sKey; };
                this.getData = function () { return this.oData; };
                this.setData = function (oData) { this.oData = oData; };
                this.save = function () { return new jQuery.Deferred().resolve().promise(); };
            }

            if (!oFixture.UserDefaultParameters) {
                oFixture.UserDefaultParameters = {};
            }
            // mutate the fixture
            Object.keys(oFixture.UserDefaultParameters).forEach(function (sName) {
                var oMember = oFixture.UserDefaultParameters[sName];
                if (oMember.value === "HUGE") {
                    oMember.value = genStr("ABCDEFGHIJKLMN", 2049);
                }
            });

            var fnFactory = sap.ushell.Container.getService;
            var oShellNavigationService = sap.ushell.Container.getService("ShellNavigation");
            var oUserDefaultParametersMock = {
                    getValue: function (sName) {
                        return new jQuery.Deferred().resolve(oFixture.UserDefaultParameters[sName] || { value: undefined}).promise();
                    }
            };

            sinon.stub(sap.ushell.Container, "getService", function (sName) {
                if (sName === "UserDefaultParameters") {
                    return oUserDefaultParametersMock;
                }

                // return the result of the real service call
                if (oAllowedRequireServices[sName] === true) {
                    return fnFactory.bind(sap.ushell.Container)(sName);
                }

                if (!oAllowedRequireServices[sName]) {
                    ok(false, "Test is not accessing " + sName);
                }

                // return mocked service
                return oAllowedRequireServices[sName];
            });

            sinon.stub(sap.ushell.Container, "getUser").returns({
                getLanguage: sinon.stub().returns((oFixture.UserEnvParameters && oFixture.UserEnvParameters["sap-language"]) || "en"),
                getAccessibilityMode: sinon.stub().returns((oFixture.UserEnvParameters && oFixture.UserEnvParameters["sap-accessibility"]) || false)
            });

            sinon.stub(sap.ui, "getCore").returns({
                getConfiguration: sinon.stub().returns({ // fake ui5 configuration
                    getStatistics: sinon.stub().returns((oFixture.UserEnvParameters && oFixture.UserEnvParameters["sap-statistics"]) || false),
                    getLanguage: sinon.stub().returns("en"),
                    getSAPLogonLanguage: sinon.stub().returns("EN")
                })
            });
            sinon.spy(oShellNavigationService, "compactParams");

            var oSrvc = createService({
                adapter: oFakeAdapter,
                configuration: oFixture.oCSTRConfig || {}
            });

            var fnOrigSelectSystemAliasDataName = oSrvc._selectSystemAliasDataName;
            oSrvc._selectSystemAliasDataName = function (oSystemAliasCollection, sBrowserLocationProtocol) {
                if (sBrowserLocationProtocol === "http") {
                    sBrowserLocationProtocol = "https"; // force https URL
                }
                return fnOrigSelectSystemAliasDataName.call(this, oSystemAliasCollection, sBrowserLocationProtocol);
            };

            // Act
            oSrvc.resolveHashFragment(oFixture.intent, /*fnBoundFallback*/ function () {
                ok(false, "fallback function is not called");
            })
                .done(function (oResolutionResult) {
                    if (!oFixture.expectedResolve) {
                        ok(false, "promise was rejected");
                        return;
                    }

                    ok(true, "promise was resolved");

                    if (oFixture.expectedResolutionResult) {
                        deepEqual(oResolutionResult, oFixture.expectedResolutionResult, "correct resolution result");
                    }
                    if (oFixture.expectedTransientCompaction) {
                        deepEqual(oShellNavigationService.compactParams.args[0][3], true, "compactParams invoked with transient indication");
                    }
                    // test the xapp-state key !
                    if (oFixture.expectedUrl) {
                        strictEqual(oResolutionResult.url, oFixture.expectedUrl, "url correct");
                    }

                    if (typeof oFixture.expectedApplicationType !== "undefined") {
                        strictEqual(oResolutionResult.applicationType, oFixture.expectedApplicationType, "application type correct");
                    }

                    if (oFixture.expectedAppStateData) {
                        deepEqual(oNewAppState.getData(), oFixture.expectedAppStateData, "appstate data correct");
                    }
                    if (oFixture.expectedAppStateData2) {
                        deepEqual(oNewAppStates[1].getData(), oFixture.expectedAppStateData2, "appstate data 2 correct");
                        if (oFixture.expectedAppStateData2 && oNewAppStates[1].getData().length > 2000) {
                            deepEqual(oNewAppStates[1].getData().substr(2000), oFixture.expectedAppStateData2.substr(2000), "appstate data 2 2nd part correct");
                        }
                    }
                })
                .fail(function (sError) {
                    // Assert
                    if (oFixture.expectedResolve) {
                        ok(false, "promise was resolved. Reject ERROR: " + sError);
                        return;
                    }

                    ok(true, "promise was rejected");
                    strictEqual(sError, oFixture.expectedRejectError, "promise was rejected with the expected error");
                })
                .always(function () {
                    deepEqual(aFixtureInbounds, aFixtureInboundsClone,
                        "inbounds provided by getInbounds are not modified by resolveHashFragment");

                    testExpectedErrorAndWarningCalls(oFixture);

                    start();
                    oShellNavigationService.compactParams.restore();
                });
           });
    });

    [
        {
            testDescription: "resolveHashFragment, hasSegmentedAccess",
            // ignore certain fields not needed for the test
            intent: "Action-aliasToAbsoluteUrl?sap-system=UR3CLNT120",
            hasSegmentedAccess: true,
            oInboundFilter: [{
                semanticObject: "Action",
                action: "aliasToAbsoluteUrl"
            }]
        },
        {
            testDescription: "resolveHashFragment, config disabled",
            intent: "Action-aliasToAbsoluteUrl?sap-system=UR3CLNT120",
            hasSegmentedAccess: false,
            oInboundFilter: undefined
        }
    ].forEach(function (oFixture) {
        asyncTest("inbound filter on resolveHashFragment when " + oFixture.testDescription, function () {
            var oShellNavigationService = sap.ushell.Container.getService("ShellNavigation");
            sinon.stub(sap.ushell.Container, "getUser").returns({
                getLanguage: sinon.stub().returns("en")
            });

            sinon.spy(oShellNavigationService, "compactParams");
            var oFakeAdapter = {
                    hasSegmentedAccess: oFixture.hasSegmentedAccess,
                    resolveSystemAlias: function (sSystemAlias) {
                        var oDeferred = new jQuery.Deferred();
                        if (oFixture.oKnownSapSystemData && oFixture.oKnownSapSystemData.hasOwnProperty(sSystemAlias)) {
                            return oDeferred.resolve(oFixture.oKnownSapSystemData[sSystemAlias]).promise();
                        }
                        if (sSystemAlias === "") {
                            return oDeferred.resolve(O_LOCAL_SYSTEM_ALIAS).promise();
                        }
                        return oDeferred.reject("Cannot resolve system alias").promise();
                    },
                    getInbounds: sinon.stub().returns(
                        new jQuery.Deferred().resolve([oFixture.inbound]).promise()
                    ),
                    resolveHashFragmentFallback: function (oIntent, oMatchingTarget, oParameters) {
                        return new jQuery.Deferred().resolve({ url: "fallback :-(" + JSON.stringify(oParameters).replace(/["]/g, "").replace(/\\/g, "") }).promise();
                    }
                };

            var oSrvc = new ClientSideTargetResolution(oFakeAdapter, null, null, oFixture.config);
            sinon.spy(InboundProvider.prototype, "getInbounds");
            sinon.stub(oSrvc, "_resolveHashFragment").returns(new jQuery.Deferred().resolve({a: 1}).promise());
            // Act
            oSrvc.resolveHashFragment(oFixture.intent, /*fnBoundFallback*/ function () {
                ok(false, "fallback function is not called");
            })
                .done(function (oResolutionResult) {
                    ok(true, "promise was resolved");
                    deepEqual(InboundProvider.prototype.getInbounds.args[0][0], oFixture.oInboundFilter, "inbound reqeust properly filtered");
                    deepEqual(oFakeAdapter.getInbounds.args[0][0], oFixture.oInboundFilter, "inbound reqeust properly filtered");
                })
                .fail(function () {
                    // Assert
                    ok(false, "promise was resolved");
                })
                .always(function () {
                    start();
                    oShellNavigationService.compactParams.restore();
                });
           });
    });


// getEasyAccessSystems
    [
         {
             testDescription: "there is no inbound",
             aInbounds: [],
             expectedEasyAccessSystems: {
                userMenu: {},
                sapMenu: {}
             }
         },
         {
             testDescription: "empty sap-system",
             aInbounds: [
                 {
                     id: "Shell-startGUI",
                     semanticObject: "Shell",
                     action: "startGUI",
                     title: "",
                     signature: {
                         parameters: {
                             "sap-system": {
                                 required: true
                             }
                         }
                     },
                     deviceTypes: {
                         desktop: true,
                         tablet: true,
                         phone: true
                     }
                 },
                 {
                     id: "Shell-startWDA",
                     semanticObject: "Shell",
                     action: "startWDA",
                     title: "",
                     signature: {
                         parameters: {
                             "sap-system": {
                                 required: true
                             }
                         }
                     },
                     deviceTypes: {
                         desktop: true,
                         tablet: true,
                         phone: true
                     }
                 },
                 {
                     id: "Shell-startURL",
                     semanticObject: "Shell",
                     action: "startURL",
                     title: "",
                     signature: {
                         parameters: {
                             "sap-system": {
                                 required: true
                             }
                         }
                     },
                     deviceTypes: {
                         desktop: true,
                         tablet: true,
                         phone: true
                     }
                 }
             ],
             expectedEasyAccessSystems: {
                userMenu: {},
                sapMenu: {}
             },
             expectedWarningCalls: {
                userMenu: [
                    [ // first call args
                        "Cannot extract sap-system from easy access menu inbound: #Shell-startGUI{sap-system:<?>}",
                        "This parameter is supposed to be a string. Got 'undefined' instead.",
                        "sap.ushell.services.ClientSideTargetResolution"
                    ],
                    [ // second call args
                        "Cannot extract sap-system from easy access menu inbound: #Shell-startWDA{sap-system:<?>}",
                        "This parameter is supposed to be a string. Got 'undefined' instead.",
                        "sap.ushell.services.ClientSideTargetResolution"
                    ],
                    [ // third call args
                        "Cannot extract sap-system from easy access menu inbound: #Shell-startURL{sap-system:<?>}",
                        "This parameter is supposed to be a string. Got 'undefined' instead.",
                        "sap.ushell.services.ClientSideTargetResolution"
                    ]
                ],
                sapMenu: [
                    [ // first call args
                        "Cannot extract sap-system from easy access menu inbound: #Shell-startGUI{sap-system:<?>}",
                        "This parameter is supposed to be a string. Got 'undefined' instead.",
                        "sap.ushell.services.ClientSideTargetResolution"
                    ],
                    [ // second call args
                        "Cannot extract sap-system from easy access menu inbound: #Shell-startWDA{sap-system:<?>}",
                        "This parameter is supposed to be a string. Got 'undefined' instead.",
                        "sap.ushell.services.ClientSideTargetResolution"
                    ]
                ]
             }
         },
         {
             testDescription: "there is no start... inbound",
             aInbounds: [
                 {
                     id: "Shell-toMyApp~631w",
                     semanticObject: "Shell",
                     action: "toMyApp",
                     title: "My app",
                     signature: {
                         parameters: {
                             "sap-system": {
                                 required: true,
                                 filter: {
                                         value: "AB1CLNT000"
                                 }
                             }
                         }
                     },
                     deviceTypes: {
                         desktop: true,
                         tablet: true,
                         phone: true
                     }
                 }
             ],
             expectedEasyAccessSystems: {
                userMenu: {},
                sapMenu: {}
             }
         },
        {
            testDescription: "there is one startWDA inbound",
            aInbounds: [
                {
                    id: "Shell-startWDA~631w",
                    semanticObject: "Shell",
                    action: "startWDA",
                    title: "CRM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            WDA: true
                        }
                    }
                },
                sapMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            WDA: true
                        }
                    }
                }
            }
        },
        {
            testDescription: "there is one startURL inbound",
            aInbounds: [
                {
                    id: "Shell-startURL",
                    semanticObject: "Shell",
                    action: "startURL",
                    title: "BOE Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: {
                    AB1CLNT000: {
                        text: "BOE Europe",
                        appType: {
                            URL: true
                        }
                    }
                },
                sapMenu: { /* URL types ignored in sap menu */ }
            }
        },
        {
            testDescription: "there are two start... inbounds for two different systems with high and lower priority respectively",
            aInbounds: [
                {
                    id: "Shell-startWDA~6311",
                    semanticObject: "Shell",
                    action: "startGUI",
                    title: "GUI Title",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                    value: "SYSTEM1"
                                }
                            }
                        }
                    },
                    deviceTypes: { desktop: true, tablet: true, phone: true }
                },
                {
                    id: "Shell-startURL~6312",
                    semanticObject: "Shell",
                    action: "startURL",
                    title: "URL Title",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                    value: "SYSTEM2"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: {
                    SYSTEM1: {
                        text: "GUI Title",
                        appType: {
                            TR: true
                        }
                    },
                    SYSTEM2: {
                        text: "URL Title",
                        appType: {
                            URL: true
                        }
                    }
                },
                sapMenu: {
                    SYSTEM1: {
                        text: "GUI Title",
                        appType: {
                            TR: true
                        }
                    }
                }
            }
        },
        {
            testDescription: "there are two different start... inbounds",
            aInbounds: [
                {
                    id: "Shell-startWDA~631w",
                    semanticObject: "Shell",
                    action: "startWDA",
                    title: "CRM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                },
                {
                    id: "Shell-startGUI~644w",
                    semanticObject: "Shell",
                    action: "startGUI",
                    title: "HR Central",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "XY1CLNT100"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            WDA: true
                        }
                    },
                    XY1CLNT100: {
                        text: "HR Central",
                        appType: {
                            TR: true
                        }
                    }
                },
                sapMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            WDA: true
                        }
                    },
                    XY1CLNT100: {
                        text: "HR Central",
                        appType: {
                            TR: true
                        }
                    }
                }
            }
        },
        {
            testDescription: "there are two start... inbounds one URL and one WDA with the same system alias and same length texts (startWDA is preferred)",
            aInbounds: [
                {
                    id: "Shell-startURL~631w",
                    semanticObject: "Shell",
                    action: "startURL",
                    title: "BOE Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                },
                {
                    id: "Shell-startWDA~631w",
                    semanticObject: "Shell",
                    action: "startWDA",
                    title: "CRM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            URL: true,
                            WDA: true
                        }
                    }

                },
                sapMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            WDA: true
                        }
                    }
                }
            }
        },
        {
            testDescription: "there are three start... inbounds with the same system alias and same length texts (startGUI is preferred)",
            aInbounds: [
                {
                    id: "Shell-startGUI~644w",
                    semanticObject: "Shell",
                    action: "startGUI",
                    title: "HCM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                },
                {
                    id: "Shell-startURL~631w",
                    semanticObject: "Shell",
                    action: "startURL",
                    title: "BOE Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                },
                {
                    id: "Shell-startWDA~631w",
                    semanticObject: "Shell",
                    action: "startWDA",
                    title: "CRM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: {
                    AB1CLNT000: {
                        text: "HCM Europe",
                        appType: {
                            TR: true,
                            URL: true,
                            WDA: true
                        }
                    }

                },
                sapMenu: {
                    AB1CLNT000: {
                        text: "HCM Europe",
                        appType: {
                            TR: true,
                            WDA: true
                        }
                    }
                }
            }
        },
        {
            testDescription: "there are three start... inbounds with the same system alias and same length texts (GUI wins over WDA and URL)",
            aInbounds: [
                {
                    id: "Shell-startWDA~631w",
                    semanticObject: "Shell",
                    action: "startWDA",
                    title: "HCM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                },
                {
                    id: "Shell-startGUI~644w",
                    semanticObject: "Shell",
                    action: "startGUI",
                    title: "CRM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                },
                {
                    id: "Shell-startURL~631w",
                    semanticObject: "Shell",
                    action: "startURL",
                    title: "BOE Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            TR: true,
                            URL: true,
                            WDA: true
                        }
                    }

                },
                sapMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            TR: true,
                            WDA: true
                        }
                    }
                }
            }
        },
        {
            testDescription: "there are two start... inbounds with the same system alias and same texts",
            aInbounds: [
                {
                    id: "Shell-startWDA~631w",
                    semanticObject: "Shell",
                    action: "startWDA",
                    title: "CRM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                },
                {
                    id: "Shell-startGUI~644w",
                    semanticObject: "Shell",
                    action: "startGUI",
                    title: "CRM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            TR: true,
                            WDA: true
                        }
                    }

                },
                sapMenu: {
                    AB1CLNT000: {
                        text: "CRM Europe",
                        appType: {
                            TR: true,
                            WDA: true
                        }
                    }
                }
            }
        },
        {
            testDescription: "the device type of the inbound is not matching for WDA",
            aInbounds: [
                {
                    id: "Shell-startWDA~631w",
                    semanticObject: "Shell",
                    action: "startWDA",
                    title: "CRM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: false,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: { },
                sapMenu: { }
            }
        },
        {
            testDescription: "the device type of the inbound is not matching for URL",
            aInbounds: [
                {
                    id: "Shell-startURL~631w",
                    semanticObject: "Shell",
                    action: "startURL",
                    title: "POCBOE",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "FLPINTEGRATION2015_588"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: false,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: { },
                sapMenu: { }
            }
        },
        {
            testDescription: "numeric sap-system",
            aInbounds: [
                {
                    id: "Shell-startURL~631w",
                    semanticObject: "Shell",
                    action: "startURL",
                    title: "POCBOE",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "FLPINTEGRATION2015_588"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: false,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                userMenu: { },
                sapMenu: { }
            }
        }
    ].forEach(function (oFixture) {
        ["userMenu", "sapMenu"].forEach(function (sMenuType) {
            asyncTest("getEasyAccessSystems('" + sMenuType + "') returns the expected list of systems when " + oFixture.testDescription, function () {
                var oService;

                sinon.stub(jQuery.sap.log, "warning");

                // Arrange
                sinon.stub(utils, "getFormFactor").returns("desktop");
                oService = createService({
                    inbounds: oFixture.aInbounds
                });

                // Act
                oService.getEasyAccessSystems(sMenuType)
                    .done(function (oActualEasyAccessSystems) {
                        start();
                        // Assert
                        deepEqual(oActualEasyAccessSystems, oFixture.expectedEasyAccessSystems[sMenuType], "Easy Access Systems properly extracted from inbounds");

                        if (oFixture.expectedWarningCalls && oFixture.expectedWarningCalls[sMenuType]) {
                            var aExpectedWarningCalls = oFixture.expectedWarningCalls[sMenuType];
                            strictEqual(
                                jQuery.sap.log.warning.callCount,
                                aExpectedWarningCalls.length,
                                "jQuery.sap.log.warning was called the expected number of times"
                            );

                            if (aExpectedWarningCalls.length === jQuery.sap.log.warning.callCount) {

                                aExpectedWarningCalls.forEach(function (aCallArgs, iCall) {
                                    deepEqual(
                                        jQuery.sap.log.warning.getCall(iCall).args,
                                        aCallArgs,
                                        "jQuery.sap.log.warning was called with the expected arguments on call #" + (iCall + 1)
                                    );
                                });
                            }
                        } else {
                            strictEqual(jQuery.sap.log.warning.callCount,
                                0, "jQuery.sap.log.warning was not called");
                        }
                    });
            });
        });
    });

    [
        {
            aInbounds: [
                {
                    id: "Shell-startGUI~644w",
                    semanticObject: "Shell",
                    action: "startGUI",
                    title: "CRM Europe",
                    signature: {
                        parameters: {
                            "sap-system": {
                                required: true,
                                filter: {
                                        value: "AB1CLNT000"
                                }
                            }
                        }
                    },
                    deviceTypes: {
                        desktop: true,
                        tablet: true,
                        phone: true
                    }
                }
            ],
            expectedEasyAccessSystems: {
                AB1CLNT000: {
                    text: "CRM Europe",
                    appType: {
                        TR: true
                    }
                }
            }
        }
    ].forEach(function (oFixture) {
        asyncTest("getEasyAccessSystems is calculating the easy access system list only once", 2, function () {
            var oService,
                oFakeAdapter;

            // Arrange
            sinon.stub(utils, "getFormFactor").returns("desktop");
            oFakeAdapter = {
                getInbounds: sinon.stub().returns(
                        new jQuery.Deferred()
                            .resolve(oFixture.aInbounds)
                            .promise()
                    )
            };
            oService = new ClientSideTargetResolution(oFakeAdapter, null, null);

            // Act
            oService.getEasyAccessSystems()
                .done(function (oActualEasyAccessSystems1) {
                    oService.getEasyAccessSystems()
                        .done(function (oActualEasyAccessSystems2) {
                            // Assert
                            start();
                            deepEqual(oActualEasyAccessSystems2, oFixture.expectedEasyAccessSystems, "Easy Access Systems properly extracted from inbounds");
                            ok(oFakeAdapter.getInbounds.calledOnce, "getInbounds is only called once");
                        });
                });
        });
    });

    [{
        testDescription: "synchronous"
    }].forEach(function (oFixture) {
        asyncTest("_getMatchingInboundsSync: " + oFixture.testDescription, 1, function () {
            var oSrvc = createService();
            var aFakeMatchResults = [
                { num: 18, matches: true, priorityString: "B", inbound: { resolutionResult: {} } },
                { num: 31, matches: true, priorityString: "CD", inbound: { resolutionResult: {} } },
                { num: 33, matches: true, priorityString: "CZ", inbound: { resolutionResult: {} } },
                { num: 41, matches: true, priorityString: "A", inbound: { resolutionResult: {} } },
                { num: 44, matches: true, priorityString: "C", inbound: { resolutionResult: {} } },
                { num: 46, matches: true, priorityString: "CE", inbound: { resolutionResult: {} } }
            ];

            sinon.stub(oSearch, "match").returns(jQuery.Deferred().resolve({
                missingReferences: {},
                matchResults: aFakeMatchResults
            }).promise());

            var aFakeInbounds = aFakeMatchResults.map(function (oMatchResult) {
                return oMatchResult.inbound;
            });

            var oIndex = oInboundIndex.createIndex(aFakeInbounds);

            // Act 2
            var i = 2;
            oSrvc._getMatchingInbounds({}/* any parameter ok for the test*/, oIndex, { }).done(function (aMatchingInbounds) {
                start();
                equal(i, 2, "value ok");
            }).fail(function () {
                ok(false, "promise was resolved");
            });
            i = 3;
        });
    });

    QUnit.module("_getReservedParameters", {
        beforeEach: function () {
            this.oMatchingTarget = {
                "inbound": {
                    "signature": {
                        "parameters": {
                            "sap-navigation-scope": {
                                required: false,
                                "defaultValue": {
                                    value: "green",
                                    format: "plain"
                                }
                            },
                            "sap-priority": {
                                required: false,
                                "defaultValue": {
                                    value: "3",
                                    format: "plain"
                                }
                            }
                        }
                    }
                },
                "intentParamsPlusAllDefaults": {
                    "sap-navigation-scope": ["green"],
                    "sap-navigation-scope-filter": ["green"],
                    "sap-priority": ["3"]
                },
                "defaultedParamNames": ["sap-navigation-scope", "sap-priority"]
            };
            this.oGetParametersStub = sinon.stub(TechnicalParameters, "getParameters");
            this.oGetParametersStub.withArgs({ injectFrom: "startupParameter" }).returns([]);
            this.oGetParametersStub.withArgs({ injectFrom: "inboundParameter" }).returns([{ name: "sap-navigation-scope" }]);
            this.oExtractParametersStub = sinon.stub(oCSTRUtils, "extractParameters").returns({"param1": "1"});
        },
        afterEach: function () {
            this.oMatchResult = null;
            this.oGetParametersStub.restore();
            this.oExtractParametersStub.restore();
        }
    });

    QUnit.test("Matching reserved parameters are removed from matching target", function (assert) {
        // Act
        ClientSideTargetResolution.prototype._getReservedParameters(this.oMatchingTarget);

        // Assert
        assert.equal(Object.keys(this.oMatchingTarget.intentParamsPlusAllDefaults).length, 2, "The parameter is removed correctly");
        assert.equal(this.oMatchingTarget.defaultedParamNames.length, 1, "The parameter is removed correctly");
    });

    QUnit.test("Calls getParameters", function (assert) {
        // Act
        ClientSideTargetResolution.prototype._getReservedParameters(this.oMatchingTarget);

        // Assert
        assert.equal(this.oGetParametersStub.callCount, 2, "getParameters is called returned correctly");
        assert.deepEqual(this.oGetParametersStub.getCall(0).args, [{"injectFrom": "startupParameter"}], "getParameters is called with correct parameter");
        assert.deepEqual(this.oGetParametersStub.getCall(1).args, [{"injectFrom": "inboundParameter"}], "getParameters is called with correct parameter");
    });


    QUnit.test("Returns an object which contains all reserved parameters", function (assert) {
        // Act
        var oResult = ClientSideTargetResolution.prototype._getReservedParameters(this.oMatchingTarget);

        // Assert
        assert.deepEqual(oResult, {"param1": "1", "sap-navigation-scope": "green"}, "The parameters are returned correctly");
    });

    QUnit.module("_applySapNavigationScope", {
        beforeEach: function () {
            this.oSrvc = createService();
        },
        afterEach: function () {
            this.oSrvc = null;
        }
    });

    QUnit.test("Returns the input matching inbounds if the shell hash does not contain sap-navigation-scope-filter", function (assert) {
        // Arrange
        var oShellHash = {
            params: {}
        };
        var aMatchingTargets = [{
            inbound: {
                signature: {
                    parameters: {}
                }
            }
        },
        {
            inbound: {
                signature: {
                    parameters: {}
                }
            }
        }];

        // Act
        var aResult = this.oSrvc._applySapNavigationScopeFilter(aMatchingTargets, oShellHash);

        // Assert
        assert.deepEqual(aResult, aMatchingTargets, "Correct matching inbounds are returned");
    });


    QUnit.test("Returns the input matching inbounds if there is no inbound containing sap-navigation-scope", function (assert) {
        // Arrange
        var oShellHash = {
            params: {
                "sap-navigation-scope-filter": ["green"]
            }
        };
        var aMatchingTargets = [{
            inbound: {
                signature: {
                    parameters: {}
                }
            }
        },
        {
            inbound: {
                signature: {
                    parameters: {}
                }
            }
        }];

        // Act
        var aResult = this.oSrvc._applySapNavigationScopeFilter(aMatchingTargets, oShellHash);

        // Assert
        assert.deepEqual(aResult, aMatchingTargets, "Correct matching inbounds are returned");
    });

    QUnit.test("Returns the input matching inbounds if there is no matching sap-navigation-scope", function (assert) {
        // Arrange
        var oShellHash = {
            params: {
                "sap-navigation-scope-filter": ["green"]
            }
        };
        var aMatchingTargets = [{
            id: "inbound1",
            inbound: {
                signature: {
                    parameters: {
                        "sap-navigation-scope": {
                            defaultValue: {
                                value: "pink"
                            }
                        }
                    }
                }
            }
        },
        {
            inbound: {
                id: "inbound2",
                signature: {
                    parameters: {
                        "sap-navigation-scope": {
                            defaultValue: {
                                value: "pink"
                            }
                        }
                    }
                }
            }
        }];

        // Act
        var aResult = this.oSrvc._applySapNavigationScopeFilter(aMatchingTargets, oShellHash);

        // Assert
        assert.strictEqual(aResult, aMatchingTargets, "Correct matching inbounds are returned");
    });

    QUnit.test("Returns inbounds with matching sap-navigation-scope", function (assert) {
        // Arrange
        var oShellHash = {
            params: {
                "sap-navigation-scope-filter": ["green"]
            }
        };
        var aMatchingTargets = [{
            id: "inbound1",
            inbound: {
                signature: {
                    parameters: {
                        "sap-navigation-scope": {
                            defaultValue: {
                                value: "pink"
                            }
                        }
                    }
                }
            }
        },
        {
            inbound: {
                id: "inbound2",
                signature: {
                    parameters: {
                        "sap-navigation-scope": {
                            defaultValue: {
                                value: "green"
                            }
                        }
                    }
                }
            }
        }];

        // Act
        var aResult = this.oSrvc._applySapNavigationScopeFilter(aMatchingTargets, oShellHash);

        // Assert
        assert.strictEqual(aResult[0].id, aMatchingTargets[1].id, "Correct matching inbound is returned");
    });
 });
