// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.services.ShellNavigation
 */
sap.ui.require([
    "sap/ushell/services/ShellNavigationHashChanger",
    "sap/ushell/test/utils"
], function (ShellNavigationHashChanger, testUtils) {
    "use strict";
    /*global sinon module hasher ok test strictEqual deepEqual equal asyncTest start stop */
    /*jslint nomen:true */

    jQuery.sap.require("sap.ushell.services.Container");

    var oHashChanger = null;
    var O_NAVIGATION_FILTER_STATUS = {
        Continue: "Continue",
        Custom: "Custom",
        Abandon: "Abandon",
        Keep : "Keep"
    };

    // private helper functions
    function initHashChanger (sShellHash) {
        oHashChanger = new ShellNavigationHashChanger();
        var fnShellCallback = sinon.spy();
        oHashChanger.initShellNavigation(fnShellCallback);
        oHashChanger.toExternal({
            target : {
                shellHash : sShellHash
            }
        });
        fnShellCallback.reset();

        return fnShellCallback;
    }

    function attachHashChangerEventListener (sEventName) {
        var oResult, fnHashChangedHandler;
        oResult = {
            callCount : 0,
            parameters : null
        };
        fnHashChangedHandler = function (oEvent) {
            oResult.callCount += 1;
            oResult.parameters = oEvent.getParameters();
        };
        oHashChanger.attachEvent(sEventName, fnHashChangedHandler);

        return oResult;
    }

    module(
        "sap.ushell.services.ShellNavigation",
        {
            setup : function () {
                stop();
                sap.ushell.bootstrap("local").then(start);
            },
            /**
             * This method is called after each test. Add every restoration code
             * here.
             */
            teardown : function () {
                if (oHashChanger) {
                    oHashChanger.destroy();
                }

                testUtils.restoreSpies(
                    sap.ushell.Container.getService("ShellNavigation").hashChanger.initShellNavigation,
                    hasher.setHash, //
                    hasher.replaceHash
                );

                // reset the hash via hasher API after each test
                if (hasher) {
                    hasher.setHash("");
                }

                delete sap.ushell.Container;
            }
        }
    );

    // Shell navigation services
    // registration of hasher events for onhashchange
    // forwarding to callbacks of application
    test("getService", function () {
        // modules cannot be unloaded; so this test should be the first in order
        ok(typeof sap.ushell.Container.getService("ShellNavigation") === "object");
    });

    test("hrefForExternalWithSoActionTargetAndParams", function () {
        var sShellHash = sap.ushell.Container.getService("ShellNavigation").hrefForExternal({
            target : {
                semanticObject : "SO",
                action : "ABC"
            },
            params : {
                A : "A1"
            }
        });
        strictEqual(sShellHash, "#SO-ABC?A=A1");
    });

    test("hrefForExternal is idempotent", function () {
        var sVeryLongShellHash = "#SO-act?iAmLong1=iAmLongVal1&iAmLong2=iAmLongVal2&iAmLong3=iAmLongVal3&iAmLong4=iAmLongVal4&iAmLong5=iAmLongVal5&iAmLong6=iAmLongVal6&iAmLong7=iAmLongVal7&iAmLong8=iAmLongVal8&iAmLong9=iAmLongVal9&iAmLong10=iAmLongVal10&iAmLong11=iAmLongVal11&iAmLong12=iAmLongVal12&iAmLong13=iAmLongVal13&iAmLong14=iAmLongVal14&iAmLong15=iAmLongVal15&iAmLong16=iAmLongVal16&iAmLong17=iAmLongVal17&iAmLong18=iAmLongVal18&iAmLong19=iAmLongVal19&iAmLong20=iAmLongVal20&iAmLong21=iAmLongVal21&iAmLong22=iAmLongVal22&iAmLong23=iAmLongVal23&iAmLong24=iAmLongVal24&iAmLong25=iAmLongVal25&iAmLong26=iAmLongVal26&iAmLong27=iAmLongVal27&iAmLong28=iAmLongVal28&iAmLong29=iAmLongVal29&iAmLong30=iAmLongVal30&iAmLong31=iAmLongVal31&iAmLong32=iAmLongVal32&iAmLong33=iAmLongVal33&iAmLong34=iAmLongVal34&iAmLong35=iAmLongVal35&iAmLong36=iAmLongVal36&iAmLong37=iAmLongVal37&iAmLong38=iAmLongVal38&iAmLong39=iAmLongVal39&iAmLong40=iAmLongVal40&iAmLong41=iAmLongVal41&iAmLong42=iAmLongVal42&iAmLong43=iAmLongVal43&iAmLong44=iAmLongVal44&iAmLong45=iAmLongVal45&iAmLong46=iAmLongVal46&iAmLong47=iAmLongVal47&iAmLong48=iAmLongVal48&iAmLong49=iAmLongVal49&iAmLong50=iAmLongVal50&iAmLong51=iAmLongVal51&iAmLong52=iAmLongVal52&iAmLong53=iAmLongVal53&iAmLong54=iAmLongVal54&iAmLong55=iAmLongVal55&iAmLong56=iAmLongVal56&iAmLong57=iAmLongVal57&iAmLong58=iAmLongVal58&iAmLong59=iAmLongVal59&iAmLong60=iAmLongVal60&iAmLong61=iAmLongVal61&iAmLong62=iAmLongVal62&iAmLong63=iAmLongVal63&iAmLong64=iAmLongVal64&iAmLong65=iAmLongVal65&iAmLong66=iAmLongVal66&iAmLong67=iAmLongVal67&iAmLong68=iAmLongVal68&iAmLong69=iAmLongVal69&iAmLong70=iAmLongVal70&iAmLong71=iAmLongVal71&iAmLong72=iAmLongVal72&iAmLong73=iAmLongVal73&iAmLong74=iAmLongVal74&iAmLong75=iAmLongVal75&iAmLong76=iAmLongVal76&iAmLong77=iAmLongVal77&iAmLong78=iAmLongVal78&iAmLong79=iAmLongVal79&iAmLong80=iAmLongVal80&iAmLong81=iAmLongVal81&iAmLong82=iAmLongVal82&iAmLong83=iAmLongVal83&iAmLong84=iAmLongVal84&iAmLong85=iAmLongVal85&iAmLong86=iAmLongVal86&iAmLong87=iAmLongVal87&iAmLong88=iAmLongVal88&iAmLong89=iAmLongVal89&iAmLong90=iAmLongVal90&iAmLong91=iAmLongVal91&iAmLong92=iAmLongVal92&iAmLong93=iAmLongVal93&iAmLong94=iAmLongVal94&iAmLong95=iAmLongVal95&iAmLong96=iAmLongVal96&iAmLong97=iAmLongVal97&iAmLong98=iAmLongVal98&iAmLong99=iAmLongVal99&iAmLong100=iAmLongVal100&iAmLong101=iAmLongVal101&iAmLong102=iAmLongVal102&iAmLong103=iAmLongVal103&iAmLong104=iAmLongVal104&iAmLong105=iAmLongVal105&iAmLong106=iAmLongVal106&iAmLong107=iAmLongVal107&iAmLong108=iAmLongVal108&iAmLong109=iAmLongVal109&iAmLong110=iAmLongVal110&iAmLong111=iAmLongVal111&iAmLong112=iAmLongVal112&iAmLong113=iAmLongVal113&iAmLong114=iAmLongVal114&iAmLong115=iAmLongVal115&iAmLong116=iAmLongVal116&iAmLong117=iAmLongVal117&iAmLong118=iAmLongVal118&iAmLong119=iAmLongVal119&iAmLong120=iAmLongVal120&iAmLong121=iAmLongVal121&iAmLong122=iAmLongVal122&iAmLong123=iAmLongVal123&iAmLong124=iAmLongVal124&iAmLong125=iAmLongVal125&iAmLong126=iAmLongVal126&iAmLong127=iAmLongVal127&iAmLong128=iAmLongVal128&iAmLong129=iAmLongVal129&iAmLong130=iAmLongVal130&iAmLong131=iAmLongVal131&iAmLong132=iAmLongVal132&iAmLong133=iAmLongVal133&iAmLong134=iAmLongVal134&iAmLong135=iAmLongVal135&iAmLong136=iAmLongVal136&iAmLong137=iAmLongVal137&iAmLong138=iAmLongVal138&iAmLong139=iAmLongVal139&iAmLong140=iAmLongVal140&iAmLong141=iAmLongVal141&iAmLong142=iAmLongVal142&iAmLong143=iAmLongVal143&iAmLong144=iAmLongVal144&iAmLong145=iAmLongVal145&iAmLong146=iAmLongVal146&iAmLong147=iAmLongVal147&iAmLong148=iAmLongVal148&iAmLong149=iAmLongVal149&iAmLong150=iAmLongVal150&iAmLong151=iAmLongVal151&iAmLong152=iAmLongVal152&iAmLong153=iAmLongVal153&iAmLong154=iAmLongVal154&iAmLong155=iAmLongVal155&iAmLong156=iAmLongVal156&iAmLong157=iAmLongVal157&iAmLong158=iAmLongVal158&iAmLong159=iAmLongVal159&iAmLong160=iAmLongVal160&iAmLong161=iAmLongVal161&iAmLong162=iAmLongVal162&iAmLong163=iAmLongVal163&iAmLong164=iAmLongVal164&iAmLong165=iAmLongVal165&iAmLong166=iAmLongVal166&iAmLong167=iAmLongVal167&iAmLong168=iAmLongVal168&iAmLong169=iAmLongVal169&iAmLong170=iAmLongVal170&iAmLong171=iAmLongVal171&iAmLong172=iAmLongVal172&iAmLong173=iAmLongVal173&iAmLong174=iAmLongVal174&iAmLong175=iAmLongVal175&iAmLong176=iAmLongVal176&iAmLong177=iAmLongVal177&iAmLong178=iAmLongVal178&iAmLong179=iAmLongVal179&iAmLong180=iAmLongVal180&iAmLong181=iAmLongVal181&iAmLong182=iAmLongVal182&iAmLong183=iAmLongVal183&iAmLong184=iAmLongVal184&iAmLong185=iAmLongVal185",
            sCompactShellHash1 = sap.ushell.Container.getService("ShellNavigation").hrefForExternal({
                target : { shellHash: sVeryLongShellHash }
            }),
            sCompactShellHash2 = sap.ushell.Container.getService("ShellNavigation").hrefForExternal({
                target : { shellHash: sCompactShellHash1 }
            });

        strictEqual(sCompactShellHash2, sCompactShellHash1, "The same (compacted) shell hash is returned if hrefForExternal is called twice");
    });

    test("hrefForExternal does not expand very long URL if sap-intent-parm is found", function () {
        var sVeryLongShellHash = "#SO-act?iAmLong1=iAmLongVal1&iAmLong2=iAmLongVal2&iAmLong3=iAmLongVal3&iAmLong4=iAmLongVal4&iAmLong5=iAmLongVal5&iAmLong6=iAmLongVal6&iAmLong7=iAmLongVal7&iAmLong8=iAmLongVal8&iAmLong9=iAmLongVal9&iAmLong10=iAmLongVal10&iAmLong11=iAmLongVal11&iAmLong12=iAmLongVal12&iAmLong13=iAmLongVal13&iAmLong14=iAmLongVal14&iAmLong15=iAmLongVal15&iAmLong16=iAmLongVal16&iAmLong17=iAmLongVal17&iAmLong18=iAmLongVal18&iAmLong19=iAmLongVal19&iAmLong20=iAmLongVal20&iAmLong21=iAmLongVal21&iAmLong22=iAmLongVal22&iAmLong23=iAmLongVal23&iAmLong24=iAmLongVal24&iAmLong25=iAmLongVal25&iAmLong26=iAmLongVal26&iAmLong27=iAmLongVal27&iAmLong28=iAmLongVal28&iAmLong29=iAmLongVal29&iAmLong30=iAmLongVal30&iAmLong31=iAmLongVal31&iAmLong32=iAmLongVal32&iAmLong33=iAmLongVal33&iAmLong34=iAmLongVal34&iAmLong35=iAmLongVal35&iAmLong36=iAmLongVal36&iAmLong37=iAmLongVal37&iAmLong38=iAmLongVal38&iAmLong39=iAmLongVal39&iAmLong40=iAmLongVal40&iAmLong41=iAmLongVal41&iAmLong42=iAmLongVal42&iAmLong43=iAmLongVal43&iAmLong44=iAmLongVal44&iAmLong45=iAmLongVal45&iAmLong46=iAmLongVal46&iAmLong47=iAmLongVal47&iAmLong48=iAmLongVal48&iAmLong49=iAmLongVal49&iAmLong50=iAmLongVal50&iAmLong51=iAmLongVal51&iAmLong52=iAmLongVal52&iAmLong53=iAmLongVal53&iAmLong54=iAmLongVal54&iAmLong55=iAmLongVal55&iAmLong56=iAmLongVal56&iAmLong57=iAmLongVal57&iAmLong58=iAmLongVal58&iAmLong59=iAmLongVal59&iAmLong60=iAmLongVal60&iAmLong61=iAmLongVal61&iAmLong62=iAmLongVal62&iAmLong63=iAmLongVal63&iAmLong64=iAmLongVal64&iAmLong65=iAmLongVal65&iAmLong66=iAmLongVal66&iAmLong67=iAmLongVal67&iAmLong68=iAmLongVal68&iAmLong69=iAmLongVal69&iAmLong70=iAmLongVal70&iAmLong71=iAmLongVal71&iAmLong72=iAmLongVal72&iAmLong73=iAmLongVal73&iAmLong74=iAmLongVal74&iAmLong75=iAmLongVal75&iAmLong76=iAmLongVal76&iAmLong77=iAmLongVal77&iAmLong78=iAmLongVal78&iAmLong79=iAmLongVal79&iAmLong80=iAmLongVal80&iAmLong81=iAmLongVal81&iAmLong82=iAmLongVal82&iAmLong83=iAmLongVal83&iAmLong84=iAmLongVal84&iAmLong85=iAmLongVal85&iAmLong86=iAmLongVal86&iAmLong87=iAmLongVal87&iAmLong88=iAmLongVal88&iAmLong89=iAmLongVal89&iAmLong90=iAmLongVal90&iAmLong91=iAmLongVal91&iAmLong92=iAmLongVal92&iAmLong93=iAmLongVal93&iAmLong94=iAmLongVal94&iAmLong95=iAmLongVal95&iAmLong96=iAmLongVal96&iAmLong97=iAmLongVal97&iAmLong98=iAmLongVal98&iAmLong99=iAmLongVal99&iAmLong100=iAmLongVal100&iAmLong101=iAmLongVal101&iAmLong102=iAmLongVal102&iAmLong103=iAmLongVal103&iAmLong104=iAmLongVal104&iAmLong105=iAmLongVal105&iAmLong106=iAmLongVal106&iAmLong107=iAmLongVal107&iAmLong108=iAmLongVal108&iAmLong109=iAmLongVal109&iAmLong110=iAmLongVal110&iAmLong111=iAmLongVal111&iAmLong112=iAmLongVal112&iAmLong113=iAmLongVal113&iAmLong114=iAmLongVal114&iAmLong115=iAmLongVal115&iAmLong116=iAmLongVal116&iAmLong117=iAmLongVal117&iAmLong118=iAmLongVal118&iAmLong119=iAmLongVal119&iAmLong120=iAmLongVal120&iAmLong121=iAmLongVal121&iAmLong122=iAmLongVal122&iAmLong123=iAmLongVal123&iAmLong124=iAmLongVal124&iAmLong125=iAmLongVal125&iAmLong126=iAmLongVal126&iAmLong127=iAmLongVal127&iAmLong128=iAmLongVal128&iAmLong129=iAmLongVal129&iAmLong130=iAmLongVal130&iAmLong131=iAmLongVal131&iAmLong132=iAmLongVal132&iAmLong133=iAmLongVal133&iAmLong134=iAmLongVal134&iAmLong135=iAmLongVal135&iAmLong136=iAmLongVal136&iAmLong137=iAmLongVal137&iAmLong138=iAmLongVal138&iAmLong139=iAmLongVal139&iAmLong140=iAmLongVal140&iAmLong141=iAmLongVal141&iAmLong142=iAmLongVal142&iAmLong143=iAmLongVal143&iAmLong144=iAmLongVal144&iAmLong145=iAmLongVal145&iAmLong146=iAmLongVal146&iAmLong147=iAmLongVal147&iAmLong148=iAmLongVal148&iAmLong149=iAmLongVal149&iAmLong150=iAmLongVal150&iAmLong151=iAmLongVal151&iAmLong152=iAmLongVal152&iAmLong153=iAmLongVal153&iAmLong154=iAmLongVal154&iAmLong155=iAmLongVal155&iAmLong156=iAmLongVal156&iAmLong157=iAmLongVal157&iAmLong158=iAmLongVal158&iAmLong159=iAmLongVal159&iAmLong160=iAmLongVal160&iAmLong161=iAmLongVal161&iAmLong162=iAmLongVal162&iAmLong163=iAmLongVal163&iAmLong164=iAmLongVal164&iAmLong165=iAmLongVal165&iAmLong166=iAmLongVal166&iAmLong167=iAmLongVal167&iAmLong168=iAmLongVal168&iAmLong169=iAmLongVal169&iAmLong170=iAmLongVal170&iAmLong171=iAmLongVal171&iAmLong172=iAmLongVal172&iAmLong173=iAmLongVal173&iAmLong174=iAmLongVal174&iAmLong175=iAmLongVal175&iAmLong176=iAmLongVal176&iAmLong177=iAmLongVal177&iAmLong178=iAmLongVal178&iAmLong179=iAmLongVal179&iAmLong180=iAmLongVal180&iAmLong181=iAmLongVal181&iAmLong182=iAmLongVal182&iAmLong183=iAmLongVal183&iAmLong184=iAmLongVal184&iAmLong185=iAmLongVal185&sap-intent-param=A123B456C789",
            sStillLongHash = sap.ushell.Container.getService("ShellNavigation").hrefForExternal({
                target : { shellHash: sVeryLongShellHash }
            });

        strictEqual(sStillLongHash, sVeryLongShellHash, "A long hash fragment with sap-intent-param is not compacted");
    });

    // currently we double encode url parameters
    test("hrefForExternalWithSoActionTargetAndParams_DoubleEncode",
        function () {
            var sx = ("this&that is Space"), sShellHashHref = sap.ushell.Container.getService("ShellNavigation")
                .hrefForExternal({
                    target : {
                        semanticObject : "SO",
                        action : "ABC"
                    },
                    params : {
                        A : [ sx, 1 ]
                    }
                });
            strictEqual(encodeURIComponent(sx), "this%26that%20is%20Space");
            strictEqual(sShellHashHref,
                "#SO-ABC?A=this%2526that%2520is%2520Space&A=1");
        });

    test("hrefForExternalWithShellHashTarget", function () {
        var sShellHash = sap.ushell.Container.getService("ShellNavigation").hrefForExternal({
            target : {
                shellHash : "SO-Action"
            }
        });
        strictEqual(sShellHash, "#SO-Action");
    });

    test(
        "hrefForExternalWithShellHashTarget_DoubleEncode",
        function () {
            var encodedParam = encodeURIComponent("needs%& encoding"),
                sShellHash = sap.ushell.Container.getService("ShellNavigation")
                    .hrefForExternal({
                        target : {
                            shellHash : "S O-Action?p=v%&p2=" + encodedParam
                        }
                    });
            strictEqual(sShellHash,
                "#S%20O-Action?p=v%25&p2=needs%2525%2526%2520encoding");
        }
    );

    // currently we double encode url parameters
    test("hrefForExternalURLNoTruncationVerbose",
        function () {
            var sx = ("this&that is Space"),
                oParams = {
                    OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead : [ 1, 2, 3, 4, 5, 6],
                    VeryLongNamesAreAlsoProblematicEspIfMultipliedOften : ["That getting too long to be handled 1",
                        "THIS is getting too long to be handled 2",
                        "THIS is getting too long to be handled 7" ],
                    B :  [ "THIS is getting too long to be handled 1",
                           "THIS is getting too long to be handled 7" ],
                    A : [sx, 1 ]
                },
                oShellHashHref = sap.ushell.Container.getService("ShellNavigation")
                    .hrefForExternal({
                        target : {
                            semanticObject : "SO",
                            action : "ABC"
                        },
                        params : oParams
                    }, true);
            strictEqual(oShellHashHref.hash,
                "#SO-ABC?A=this%2526that%2520is%2520Space&A=1&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25201&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25207&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=1&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=2&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=3&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=4&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=5&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=6&VeryLongNamesAreAlsoProblematicEspIfMultipliedOften=That%2520getting%2520too%2520long%2520to%2520be%2520handled%25201&VeryLongNamesAreAlsoProblematicEspIfMultipliedOften=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25202&VeryLongNamesAreAlsoProblematicEspIfMultipliedOften=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25207");
            strictEqual(oShellHashHref.params,
                undefined, "undefined if no truncation (!) ");
            strictEqual(oShellHashHref.skippedParams,
                undefined, "undefined if no truncation");
        });
    // currently we double encode url parameters
    test("hrefForExternalURLTruncationVerbose",
        function () {
            var sKey,
                sx = ("this&that is Space"),
                oShellHashHref,
                oSpy;
            // check that the personalization service was invoked correctly
            oSpy = sinon.spy(sap.ushell.Container.getService("AppState"), "createEmptyAppState");
            oShellHashHref = sap.ushell.Container.getService("ShellNavigation")
                .hrefForExternal({
                    target : {
                        semanticObject : "SO",
                        action : "ABC"
                    },
                    params : {
                        OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead : [ 1, 2, 3, 4, 5, 6],
                        VeryLongNamesAreAlsoProblematicEspIfMultipliedOften :  [ "That getting too long to be handled 1",
                               "THIS is getting too long to be handled 2",
                               "THIS is getting too long to be handled 3",
                               "THIS is getting too long to be handled 4",
                               "THIS is getting too long to be handled 5",
                               "THIS is getting too long to be handled 6",
                               "THIS is getting too long to be handled 7" ],
                        B :  [ "THIS is getting too long to be handled 1",
                               "THIS is getting too long to be handled 2",
                               "THIS is getting too long to be handled 3",
                               "THIS is getting too long to be handled 4",
                               "THIS is getting too long to be handled 5",
                               "THIS is getting too long to be handled 6",
                               "THIS is getting too long to be handled 7" ],
                        A : [ sx, 1 ]
                    }
                }, true);
            // extract a Shell Parameter
            sKey = oShellHashHref.hash.match(/sap-intent-param=([A-Z0-9]+)/)[1];
            strictEqual(oShellHashHref.hash.replace(/sap-intent-param=[A-Z0-9]+/, "sap-intent-param=FIXED"),
                "#SO-ABC?A=this%2526that%2520is%2520Space&A=1&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25201&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25202&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25203&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25204&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25205&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25206&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25207&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=1&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=2&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=3&sap-intent-param=FIXED");
            deepEqual(oShellHashHref.params, {
                "A": [
                    "this&that is Space",
                    "1"
                ],
                "B": [
                    "THIS is getting too long to be handled 1",
                    "THIS is getting too long to be handled 2",
                    "THIS is getting too long to be handled 3",
                    "THIS is getting too long to be handled 4",
                    "THIS is getting too long to be handled 5",
                    "THIS is getting too long to be handled 6",
                    "THIS is getting too long to be handled 7"
                ],
                "OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead": [
                    "1",
                    "2",
                    "3"
                ],
                "sap-intent-param" : [ sKey ]
            });
            deepEqual(oShellHashHref.skippedParams, {
                OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead : [ "4", "5", "6"],
                VeryLongNamesAreAlsoProblematicEspIfMultipliedOften :  [ "That getting too long to be handled 1",
                    "THIS is getting too long to be handled 2",
                    "THIS is getting too long to be handled 3",
                    "THIS is getting too long to be handled 4",
                    "THIS is getting too long to be handled 5",
                    "THIS is getting too long to be handled 6",
                    "THIS is getting too long to be handled 7" ]
            });
            equal(oSpy.calledOnce, true, "createEmptyAppState invoked");
            deepEqual(oSpy.args[0][1], undefined, "access and key category correct");
        });

    // currently we double encode url parameters
    asyncTest("hrefForExternalURLTruncationVerbose with promise (async)",
        function () {
            var sKey,
                sx = ("this&that is Space"),
                oComponent = new sap.ui.core.UIComponent(),
                oSpy;
            // check that the personalization service was invoked correctly
            oSpy = sinon.spy(sap.ushell.Container.getService("AppState"), "createEmptyAppState");
            sap.ushell.Container.getService("ShellNavigation")
                .hrefForExternal({
                    target : {
                        semanticObject : "SO",
                        action : "ABC"
                    },
                    params : {
                        OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead : [ 1, 2, 3, 4, 5, 6],
                        VeryLongNamesAreAlsoProblematicEspIfMultipliedOften :  [ "That getting too long to be handled 1",
                               "THIS is getting too long to be handled 2",
                               "THIS is getting too long to be handled 3",
                               "THIS is getting too long to be handled 4",
                               "THIS is getting too long to be handled 5",
                               "THIS is getting too long to be handled 6",
                               "THIS is getting too long to be handled 7" ],
                        B :  [ "THIS is getting too long to be handled 1",
                               "THIS is getting too long to be handled 2",
                               "THIS is getting too long to be handled 3",
                               "THIS is getting too long to be handled 4",
                               "THIS is getting too long to be handled 5",
                               "THIS is getting too long to be handled 6",
                               "THIS is getting too long to be handled 7" ],
                        A : [ sx, 1 ]
                    }
                }, true, oComponent, true).done(function (oShellHashHref) {
                    start();
                    // extract a Shell Parameter
                    sKey = oShellHashHref.hash.match(/sap-intent-param=([A-Z0-9]+)/)[1];
                    strictEqual(oShellHashHref.hash.replace(/sap-intent-param=[A-Z0-9]+/, "sap-intent-param=FIXED"),
                        "#SO-ABC?A=this%2526that%2520is%2520Space&A=1&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25201&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25202&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25203&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25204&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25205&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25206&B=THIS%2520is%2520getting%2520too%2520long%2520to%2520be%2520handled%25207&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=1&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=2&OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead=3&sap-intent-param=FIXED");
                    deepEqual(oShellHashHref.params, {
                        "A": [
                            "this&that is Space",
                            "1"
                        ],
                        "B": [
                            "THIS is getting too long to be handled 1",
                            "THIS is getting too long to be handled 2",
                            "THIS is getting too long to be handled 3",
                            "THIS is getting too long to be handled 4",
                            "THIS is getting too long to be handled 5",
                            "THIS is getting too long to be handled 6",
                            "THIS is getting too long to be handled 7"
                        ],
                        "OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead": [
                            "1",
                            "2",
                            "3"
                        ],
                        "sap-intent-param" : [ sKey ]
                    });
                    deepEqual(oShellHashHref.skippedParams, {
                        OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead : [ "4", "5", "6"],
                        VeryLongNamesAreAlsoProblematicEspIfMultipliedOften :  [ "That getting too long to be handled 1",
                            "THIS is getting too long to be handled 2",
                            "THIS is getting too long to be handled 3",
                            "THIS is getting too long to be handled 4",
                            "THIS is getting too long to be handled 5",
                            "THIS is getting too long to be handled 6",
                            "THIS is getting too long to be handled 7" ]
                    });
                    equal(oSpy.calledOnce, true, "createEmptyAppState invoked");
                    equal(oSpy.args[0][0], oComponent, "component passed");
                }).fail(function () {
                    start();
                    ok(false, "should succeed");
                });
            ok(true, "end reached");
        });

    // currently we double encode url parameters
    asyncTest("query parameters added to the action are stripped",
        function () {
            var oComponent = new sap.ui.core.UIComponent(),
                oSpy;
            // check that the personalization service was invoked correctly
            oSpy = sinon.spy(sap.ushell.Container.getService("AppState"), "createEmptyAppState");
            sap.ushell.Container.getService("ShellNavigation")
                .hrefForExternal({
                    target : {
                        semanticObject : "SO",
                        action : "ABC?aaa=BBB"
                    },
                    params : {
                        C : [ 1],
                        D : [ 2 ]
                    }
                }, true, oComponent, true).done(function (oShellHashHref) {
                    start();
                    // extract a Shell Parameter
                    strictEqual(oShellHashHref.hash,
                        "#SO-ABC?C=1&D=2", "correct hash");
                    deepEqual(oShellHashHref.params, undefined);
                    deepEqual(oShellHashHref.skippedParams, undefined , "no skipped params");
                    equal(oSpy.calledOnce, false, "createEmptyAppState not invoked");
                }).fail(function () {
                    start();
                    ok(false, "should succeed");
                });
            ok(true, "end reached");
        });

    // currently we double encode url parameters
    asyncTest("compactParameter with promise (async)",
        function () {
            var sKey,
                sx = ("this&that is Space"),
                oComponent = new sap.ui.core.UIComponent(),
                oSpy;
            // check that the personalization service was invoked correctly
            oSpy = sinon.spy(sap.ushell.Container.getService("AppState"), "createEmptyAppState");
            sap.ushell.Container.getService("ShellNavigation").compactParams({
                        OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead : [ 1, 2, 3, 4, 5, 6],
                        VeryLongNamesAreAlsoProblematicEspIfMultipliedOften :  [ "That getting too long to be handled 1",
                               "THIS is getting too long to be handled 2",
                               "THIS is getting too long to be handled 3",
                               "THIS is getting too long to be handled 4",
                               "THIS is getting too long to be handled 5",
                               "THIS is getting too long to be handled 6",
                               "THIS is getting too long to be handled 7" ],
                        B :  [ "THIS is getting too long to be handled 1",
                               "THIS is getting too long to be handled 2",
                               "THIS is getting too long to be handled 3",
                               "THIS is getting too long to be handled 4",
                               "THIS is getting too long to be handled 5",
                               "THIS is getting too long to be handled 6",
                               "THIS is getting too long to be handled 7" ],
                        A : [ sx, 1 ]
                    }, undefined, oComponent).done(function (oResultParams) {
                    start();
                    // extract a Shell Parameter
                    sKey = oResultParams["sap-intent-param"][0];
                    deepEqual(oResultParams, {
                        "A": [
                            "this&that is Space",
                            "1"
                        ],
                        "B": [
                            "THIS is getting too long to be handled 1",
                            "THIS is getting too long to be handled 2",
                            "THIS is getting too long to be handled 3",
                            "THIS is getting too long to be handled 4",
                            "THIS is getting too long to be handled 5",
                            "THIS is getting too long to be handled 6",
                            "THIS is getting too long to be handled 7"
                        ],
                        "OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead": [
                            "1",
                            "2",
                            "3"
                        ],
                        "sap-intent-param" : [ sKey ]
                    });
                    equal(oSpy.calledOnce, true, "createEmptyAppState invoked");
                    equal(oSpy.args[0][0], oComponent, "component passed");
                }).fail(function () {
                    start();
                    ok(false, "should succeed");
                });
            ok(true, "end reached");
        });

    asyncTest("compactParameter with transient app state creation !(async)",
        function () {
            var sKey,
                sx = ("this&that is Space"),
                oComponent = new sap.ui.core.UIComponent(),
                oSpy;
            // check that the personalization service was invoked correctly
            oSpy = sinon.spy(sap.ushell.Container.getService("AppState"), "createEmptyAppState");
            sap.ushell.Container.getService("ShellNavigation").compactParams({
                        OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead : [ 1, 2, 3, 4, 5, 6],
                        VeryLongNamesAreAlsoProblematicEspIfMultipliedOften :  [ "That getting too long to be handled 1",
                               "THIS is getting too long to be handled 2",
                               "THIS is getting too long to be handled 3",
                               "THIS is getting too long to be handled 4",
                               "THIS is getting too long to be handled 5",
                               "THIS is getting too long to be handled 6",
                               "THIS is getting too long to be handled 7" ],
                        B :  [ "THIS is getting too long to be handled 1",
                               "THIS is getting too long to be handled 2",
                               "THIS is getting too long to be handled 3",
                               "THIS is getting too long to be handled 4",
                               "THIS is getting too long to be handled 5",
                               "THIS is getting too long to be handled 6",
                               "THIS is getting too long to be handled 7" ],
                        A : [ sx, 1 ]
                    }, undefined, oComponent, true /*transient*/).done(function (oResultParams) {
                    start();
                    deepEqual(oSpy.args[0][1], true, " transient(!) appstate created");
                    // extract a Shell Parameter
                    sKey = oResultParams["sap-intent-param"][0];
                    deepEqual(oResultParams, {
                        "A": [
                            "this&that is Space",
                            "1"
                        ],
                        "B": [
                            "THIS is getting too long to be handled 1",
                            "THIS is getting too long to be handled 2",
                            "THIS is getting too long to be handled 3",
                            "THIS is getting too long to be handled 4",
                            "THIS is getting too long to be handled 5",
                            "THIS is getting too long to be handled 6",
                            "THIS is getting too long to be handled 7"
                        ],
                        "OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead": [
                            "1",
                            "2",
                            "3"
                        ],
                        "sap-intent-param" : [ sKey ]
                    });
                    equal(oSpy.calledOnce, true, "createEmptyAppState invoked");
                    equal(oSpy.args[0][0], oComponent, "component passed");
                }).fail(function () {
                    start();
                    ok(false, "should succeed");
                });
            ok(true, "end reached");
        });

    asyncTest("compactParameter with short params",
        function () {
            var sx = ("this&that is Space"),
                oSpy;
            // check that the personalization service was invoked correctly
            oSpy = sinon.spy(sap.ushell.Container.getService("AppState"), "createEmptyAppState");
            sap.ushell.Container.getService("ShellNavigation").compactParams({
                        OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead : [ 1, 2, 3, 4, 5, 6],
                        VeryLongNamesAreAlsoProblematicEspIfMultipliedOften :  [ "That getting too long to be handled 1"],
                        A : [ sx, 1 ]
                    }, undefined, undefined).done(function (oResultParams) {
                    start();
                    // extract a Shell Parameter
                    deepEqual(oResultParams, {
                        OnceMoreIntoTheBreachOrFillTheWallsUpWithOurEnglishDead : [ "1", "2", "3", "4", "5", "6"],
                        VeryLongNamesAreAlsoProblematicEspIfMultipliedOften :  [ "That getting too long to be handled 1"],
                        A : [ sx, "1" ]
                    });
                    equal(oSpy.calledOnce, false, "createEmptyAppState invoked");
                }).fail(function () {
                    start();
                    ok(false, "should succeed");
                });
            ok(true, "end reached");
        });

    [
        {
            "description" : "undefined",
            "input" : undefined
        },
        {
            "description" : "empty",
            "input" : {}
        },
        {
            "description" : "short enough",
            "input" : { "A" : ["1"] }
        }
    ].forEach(function (oFixture) {
        asyncTest("compactParameter with trivial params " + oFixture.description, function () {
            // check that the personalization service was invoked correctly
            sinon.spy(sap.ushell.Container.getService("AppState"), "createEmptyAppState");
            sap.ushell.Container.getService("ShellNavigation").compactParams(oFixture.input, undefined, undefined).done(function (oResultParams) {
                start();
                // extract a Shell Parameter
                deepEqual(oResultParams, oFixture.input, "params ok");
            }).fail(function () {
                start();
                ok(false, "should succeed");
            });
            ok(true, "end reached");
        });
    });

    test("isInitialNavigation returns undefined when service init method is not called", function () {
        var oService = sap.ushell.Container.getService("ShellNavigation");
        strictEqual(oService.isInitialNavigation(), undefined, "returns expected result");
    });

    test("isInitialNavigation returns true when service init method is called", function () {
        var oShellNavigationService = sap.ushell.Container.getService("ShellNavigation");
        oShellNavigationService.init(function () {});
        strictEqual(oShellNavigationService.isInitialNavigation(), true, "returns expected result");
    });

    test("isInitialNavigation returns true if InitialNavigationManager#isInitialNavigation returns true", function () {
        var oShellNavigationService = sap.ushell.Container.getService("ShellNavigation");
        oShellNavigationService.init(function () {});
        sinon.stub(oShellNavigationService.hashChanger._oInitialNavigationManager, "isInitialNavigation").returns(true);

        // Trigger navigation to #Shell-home
        strictEqual(oShellNavigationService.isInitialNavigation(), true, "returns expected result");
    });

    test("isInitialNavigation returns false if InitialNavigationManager#isInitialNavigation returns false", function () {
        var oShellNavigationService = sap.ushell.Container.getService("ShellNavigation");
        oShellNavigationService.init(function () {});
        sinon.stub(oShellNavigationService.hashChanger._oInitialNavigationManager, "isInitialNavigation").returns(false);

        // Trigger navigation to #Shell-home
        strictEqual(oShellNavigationService.isInitialNavigation(), false, "returns expected result");
    });

    test("initialNavigationManager.onHashChanged is called when treatHashChange is triggered", function () {
        // Arrange
        var oShellNavigationService = sap.ushell.Container.getService("ShellNavigation");
        oShellNavigationService.init(function () {});

        var oHashChanger = oShellNavigationService.hashChanger;
        sinon.stub(oHashChanger._oInitialNavigationManager, "onHashChanged");

        // Act
        oHashChanger.treatHashChanged("some", "hash");

        // Assert
        strictEqual(oHashChanger._oInitialNavigationManager.onHashChanged.callCount,
            1, "InitialNavigationManager#onHashChanged method was called once");
    });

    test("init",
        function () {
            var fnCallback, initShellNavigationStub, oHashChanger;
            fnCallback = function () { /* dummy */ };
            initShellNavigationStub = sinon.stub(
                sap.ushell.Container.getService("ShellNavigation").hashChanger,
                "initShellNavigation"
            );
            // we use a stub for the initShellNavigation navigation method
            // to avoid
            // registration of event handler on the hasher; it's difficult
            // to destroy the
            // central hash changer instance and it causes side effects if
            // not destroyed
            sap.ushell.Container.getService("ShellNavigation").init(fnCallback);

            oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
            ok(
                oHashChanger instanceof ShellNavigationHashChanger,
                "hashChanger instanceof ShellNavigationHashChanger"
            );
            sinon.assert.calledWith(initShellNavigationStub, fnCallback);
        });

    test("HashChanger.init and destroy", function () {
        oHashChanger = new ShellNavigationHashChanger();
        var fnShellCallback = sinon.spy();
        oHashChanger.initShellNavigation(fnShellCallback);
        fnShellCallback.reset();
        oHashChanger.destroy();

        sap.ushell.Container.getService("ShellNavigation").toExternal({
            target : {
                semanticObject : "AnObject",
                action : "Action"
            }
        });

        ok(fnShellCallback.notCalled === true, "ShellCallback not called");
    });

    test("HashChanger.getReplaceHashEvents: returns the expected list of events", function () {
        var oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
        var oShellNavigationHashChanger = oShellNavigation.hashChanger;
        var aReplaceEvents = oShellNavigationHashChanger.getReplaceHashEvents();
        deepEqual(aReplaceEvents, ["hashReplaced", "hashChanged"], "got expected event names");
    });

    test("HashChanger.geSetHashEvents: returns the expected list of events", function () {
        var oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
        var oShellNavigationHashChanger = oShellNavigation.hashChanger;
        var aSetEvents = oShellNavigationHashChanger.getSetHashEvents();
        deepEqual(aSetEvents, ["hashSet", "shellHashChanged"], "got expected event names");
    });

    test("HashChanger.hrefForAppSpecificHash",
        function () {
            var sAppSpecificHash, sExpectedHash, sActualHash;

            // we use a new HashChanger instance for this test to avoid side
            // effects; destroy is called in teardown
            oHashChanger = new ShellNavigationHashChanger();
            oHashChanger.initShellNavigation(function () { /* dummy */
            });
            oHashChanger.toExternal({
                target : {
                    semanticObject : "AnObject",
                    action : "Action"
                }
            });

            sAppSpecificHash = "app/specific&/hash needs &/?% encoding";
            sExpectedHash = encodeURI("#AnObject-Action&/" + sAppSpecificHash);
            sActualHash = oHashChanger
                .hrefForAppSpecificHash(sAppSpecificHash);
            strictEqual(sActualHash, sExpectedHash);
        });

    test("HashChanger.toExternal with object, action and parameters",
        function () {
            var sExpectedHash, fnShellCallback;
            // we use a new HashChanger instance for this test to avoid side
            // effects; destroy is called in teardown
            oHashChanger = new ShellNavigationHashChanger();
            fnShellCallback = sinon.spy();
            oHashChanger.initShellNavigation(fnShellCallback);
            oHashChanger.toExternal({
                target : {
                    semanticObject : "AnObject",
                    action : "Action"
                },
                params : {
                    A : "Needs encoding&/",
                    B : "anotherValue"
                }
            });

            sExpectedHash = "AnObject-Action?A=" + encodeURIComponent("Needs encoding&/") + "&B=anotherValue";

            ok(fnShellCallback.calledWith(sExpectedHash, null) === true, "ShellCallback called at least once with the sExpectedHash and null");
        });

    test("HashChanger.toExternal with shellHash", function () {
        var sExpectedHash, fnShellCallback, oHashSetHandlerResult;
        // we use a new HashChanger instance for this test to avoid side
        // effects; destroy is called in teardown
        oHashChanger = new ShellNavigationHashChanger();
        fnShellCallback = sinon.spy();
        oHashChanger.initShellNavigation(fnShellCallback);
        oHashSetHandlerResult = attachHashChangerEventListener("hashSet");

        sExpectedHash = "AnObject-Action?A=" + encodeURIComponent("Needs encoding&/") + "&B=anotherValue";
        oHashChanger.toExternal({
            target : {
                shellHash : sExpectedHash
            }
        });

        sinon.assert.calledWith(fnShellCallback, sExpectedHash, null);

        strictEqual(oHashSetHandlerResult.callCount, 1,
            "hashSet handler called once");
        strictEqual(oHashSetHandlerResult.parameters.sHash, "",
            "expected sHash parameter set to empty string in hashChanged event");
    });

    test("HashChanger.toExternal with shellHash including app-specific part", function () {
        var sShellHash, sAppHash, fnShellCallback, oHashSetHandlerResult,
            oUrlShortening,
            oExpandHashSpy;
        // we use a new HashChanger instance for this test to avoid side
        // effects; destroy is called in teardown
        oHashChanger = new ShellNavigationHashChanger();
        fnShellCallback = sinon.spy();
        oHashChanger.initShellNavigation(fnShellCallback);

        oUrlShortening = sap.ushell.Container.getService("URLShortening");
        oExpandHashSpy = sinon.spy(oUrlShortening, "expandHash");
        oHashSetHandlerResult = attachHashChangerEventListener("hashSet");

        sShellHash = "AnObject-Action?A=" + encodeURIComponent("Needs encoding&/") + "&B=anotherValue";
        sAppHash = "/my/appspecific/route";
        oHashChanger.toExternal({
            target : {
                shellHash : sShellHash + "&/" + sAppHash
            }
        });

        strictEqual(oExpandHashSpy.args[0][0], "AnObject-Action?A=Needs%20encoding%26%2F&B=anotherValue&//my/appspecific/route", "URLShortening.expandHash called with new Hash");
        strictEqual(oExpandHashSpy.args[1][0], "", "URLShortening.expandHash called with old Hash");
        strictEqual(oExpandHashSpy.callCount, 2, "URLShortening.expandHash called twice");

        sinon.assert.calledWith(fnShellCallback, sShellHash, "&/" + sAppHash, null);

        strictEqual(oHashSetHandlerResult.callCount, 1, "hashSet handler called once");
        strictEqual(oHashSetHandlerResult.parameters.sHash, sAppHash,
            "expected sHash parameter set to app-specific part in hashChanged event");
    });
    [ { description: "write history true", writeHistory : true, expected : "setHash"},
      { description: "write history undefined", writeHistory : undefined, expected : "setHash"},
      { description: "write history false" , writeHistory : false, expected : "replaceHash"}
    ].forEach(function (oFixture) {
    test("HashChanger.toExternal - when " + oFixture.description,
            function () {
                var sExpectedAppHash;
                initHashChanger("AnObject-Action");
                sinon.stub(hasher, "setHash");
                sinon.stub(hasher, "replaceHash");
                sExpectedAppHash = "#Abc-def?A=B";
                oHashChanger.toExternal({ target : { shellHash : sExpectedAppHash
                    }
                }, undefined, oFixture.writeHistory);

                if (oFixture.expected == "setHash") {
                    equal(hasher.setHash.callCount,1, "correct callcount");
                    equal(hasher.replaceHash.callCount,0, "correct callcount");
                    equal(hasher.setHash.args[0][0], "Abc-def?A=B", "correct hash");
                } else {
                    equal(hasher.setHash.callCount,0, "correct callcount");
                    equal(hasher.replaceHash.callCount,1, "correct callcount");
                    equal(hasher.replaceHash.args[0][0], "Abc-def?A=B", "correct hash");
                }
            });
    });

    test("HashChanger.toAppHash - writeHistory true",
        function () {
            var sExpectedAppHash, fnShellCallback, hasherSetHashSpy,
                oHashChangedHandlerResult, oHashSetHandlerResult;
            fnShellCallback = initHashChanger("AnObject-Action");
            hasherSetHashSpy = sinon.spy(hasher, "setHash");
            oHashChangedHandlerResult = attachHashChangerEventListener("hashChanged");
            oHashSetHandlerResult = attachHashChangerEventListener("hashSet");
            sExpectedAppHash = "my app hash";

            oHashChanger.toAppHash(sExpectedAppHash, true);

            sinon.assert.notCalled(fnShellCallback);

            sinon.assert.calledWith(hasherSetHashSpy,
                "AnObject-Action&/my app hash");

            strictEqual(oHashChangedHandlerResult.callCount, 1,
                "hashChanged handler called once");
            strictEqual(oHashChangedHandlerResult.parameters.newHash,
                sExpectedAppHash, "newHash parameter set in hashChanged event");

            strictEqual(oHashSetHandlerResult.callCount, 1,
                "hashSet handler called once");
            strictEqual(oHashSetHandlerResult.parameters.sHash, sExpectedAppHash,
                "sHash parameter set in hashChanged event");
        });

    test("HashChanger.setHash",
        function () {
            var sExpectedAppHash, fnShellCallback, hasherSetHashSpy,
                oHashChangedHandlerResult, oHashSetHandlerResult;

            fnShellCallback = initHashChanger("AnObject-Action");
            hasherSetHashSpy = sinon.spy(hasher, "setHash");
            oHashChangedHandlerResult = attachHashChangerEventListener("hashChanged");
            oHashSetHandlerResult = attachHashChangerEventListener("hashSet");
            sExpectedAppHash = "my app hash";

            oHashChanger.setHash(sExpectedAppHash);

            sinon.assert.notCalled(fnShellCallback);

            sinon.assert.calledWith(hasherSetHashSpy,
                "AnObject-Action&/my app hash");

            strictEqual(oHashChangedHandlerResult.callCount, 1,
                "hashChanged handler called once");
            strictEqual(oHashChangedHandlerResult.parameters.newHash,
                sExpectedAppHash, "newHash parameter set in hashChanged event");

            strictEqual(oHashSetHandlerResult.callCount, 1, "hashSet handler called once");
            strictEqual(oHashSetHandlerResult.parameters.sHash, sExpectedAppHash,
                "sHash parameter set in hashChanged event");
        });

    test("HashChanger.toAppHash - writeHistory false",
        function () {
            var sExpectedAppHash, fnShellCallback, hasherReplaceHashSpy,
                oHashChangedHandlerResult, oHashReplacedHandlerResult;

            fnShellCallback = initHashChanger("AnObject-Action");
            hasherReplaceHashSpy = sinon.spy(hasher, "replaceHash");
            oHashChangedHandlerResult = attachHashChangerEventListener("hashChanged");
            oHashReplacedHandlerResult = attachHashChangerEventListener("hashReplaced");
            sExpectedAppHash = "my app hash";

            oHashChanger.toAppHash(sExpectedAppHash, false);

            sinon.assert.notCalled(fnShellCallback);

            sinon.assert.calledWith(hasherReplaceHashSpy,
                "AnObject-Action&/my app hash");

            strictEqual(oHashChangedHandlerResult.callCount, 1,
                "hashChanged handler called once");
            strictEqual(oHashChangedHandlerResult.parameters.newHash,
                sExpectedAppHash, "newHash parameter set in hashChanged event");

            strictEqual(oHashReplacedHandlerResult.callCount, 1, "hashSet handler called once");
            strictEqual(oHashReplacedHandlerResult.parameters.sHash, sExpectedAppHash,
                "sHash parameter set in hashReplaced event");
        });

    test("HashChanger.replaceHash",
        function () {
            var sExpectedAppHash, fnShellCallback, hasherReplaceHashSpy,
                oHashChangedHandlerResult, oHashReplacedHandlerResult;

            fnShellCallback = initHashChanger("AnObject-Action");
            hasherReplaceHashSpy = sinon.spy(hasher, "replaceHash");
            oHashChangedHandlerResult = attachHashChangerEventListener("hashChanged");
            oHashReplacedHandlerResult = attachHashChangerEventListener("hashReplaced");
            sExpectedAppHash = "my app hash";

            oHashChanger.replaceHash(sExpectedAppHash);

            sinon.assert.notCalled(fnShellCallback);

            sinon.assert.calledWith(hasherReplaceHashSpy,
                "AnObject-Action&/my app hash");

            strictEqual(oHashChangedHandlerResult.callCount, 1,
                "hashChanged handler called once");
            strictEqual(oHashChangedHandlerResult.parameters.newHash,
                sExpectedAppHash, "newHash parameter set in hashChanged event");

            strictEqual(oHashReplacedHandlerResult.callCount, 1, "hashSet handler called once");
            strictEqual(oHashReplacedHandlerResult.parameters.sHash, sExpectedAppHash,
                "sHash parameter set in hashReplaced event");
        });

    test("Inital Shell navigation part do not discriminate",
        function () {
            var oshellHash1,
                oshellHash2;

            initHashChanger("");

            oshellHash1 = oHashChanger.privsplitHash("");
            oshellHash2 = oHashChanger.privsplitHash("&/detail");

            strictEqual(oshellHash1.shellPart, oshellHash2.shellPart, "shell parts equal");
        });

    // see I-CSN 0001102839 2014
    test("robust error handling for hash change with illegal new hash",
        function () {
            var fnShellCallback = initHashChanger(""),
                oShellHashChangedHandlerResult = attachHashChangerEventListener("shellHashChanged");

            oHashChanger.treatHashChanged("illegalhash", "SO-action&/app-specific-route");

            sinon.assert.calledWith(fnShellCallback, "illegalhash", null, "SO-action", "&/app-specific-route", sinon.match.instanceOf(Error));
            strictEqual(oShellHashChangedHandlerResult.callCount, 1, "shellHashChanged handler called once");
            strictEqual(oShellHashChangedHandlerResult.parameters.newShellHash, "illegalhash", "shellHashChanged called with newShellHash");
            strictEqual(oShellHashChangedHandlerResult.parameters.newAppSpecificRoute, null, "shellHashChanged called with newAppSpecificRoute");
            strictEqual(oShellHashChangedHandlerResult.parameters.oldShellHash, "SO-action", "shellHashChanged called with oldShellHash");
            ok(oShellHashChangedHandlerResult.parameters.error instanceof Error, "shellHashChanged called with error");
        });

    test("robust error handling for hash change with illegal new and old hash",
        function () {
            var fnShellCallback = initHashChanger(""),
                oShellHashChangedHandlerResult = attachHashChangerEventListener("shellHashChanged");

            oHashChanger.treatHashChanged("illegalNewHash", "illegalOldHash");

            sinon.assert.calledWith(fnShellCallback, "illegalNewHash", null, "illegalOldHash", null, sinon.match.instanceOf(Error));
            strictEqual(oShellHashChangedHandlerResult.callCount, 1, "shellHashChanged handler called once");
            strictEqual(oShellHashChangedHandlerResult.parameters.newShellHash, "illegalNewHash", "shellHashChanged called with newShellHash");
            strictEqual(oShellHashChangedHandlerResult.parameters.newAppSpecificRoute, null, "shellHashChanged called with newAppSpecificRoute");
            strictEqual(oShellHashChangedHandlerResult.parameters.oldShellHash, "illegalOldHash", "shellHashChanged called with oldShellHash");
            ok(oShellHashChangedHandlerResult.parameters.error instanceof Error, "shellHashChanged called with error");
        });

    test("robust error handling for hash change with illegal old hash",
        function () {
            var fnShellCallback = initHashChanger(""),
                oShellHashChangedHandlerResult = attachHashChangerEventListener("shellHashChanged");

            oHashChanger.treatHashChanged("SO-action&/app-specific-route", "illegalhash");

            sinon.assert.calledWith(fnShellCallback, "SO-action", "&/app-specific-route", "illegalhash", null);
            strictEqual(oShellHashChangedHandlerResult.callCount, 1, "shellHashChanged handler called once");
            strictEqual(oShellHashChangedHandlerResult.parameters.newShellHash, "SO-action", "shellHashChanged called with newShellHash");
            strictEqual(oShellHashChangedHandlerResult.parameters.newAppSpecificRoute, "&/app-specific-route", "shellHashChanged called with newAppSpecificRoute");
            strictEqual(oShellHashChangedHandlerResult.parameters.oldShellHash, "illegalhash", "shellHashChanged called with oldShellHash");
        });

    test("treatHashChanged - shellHashParameterChanged event fired if parameters have changed",
            function () {
                var oShellHashChangedHandlerResult = attachHashChangerEventListener("shellHashParameterChanged");

                oHashChanger.treatHashChanged("SO-action?param1=newValue&/app-specific-route", "SO-action?param1=oldValue&/app-specific-route");

                strictEqual(oShellHashChangedHandlerResult.callCount, 1, "shellHashParameterChanged handler called once");
                deepEqual(oShellHashChangedHandlerResult.parameters.oNewParameters, {"param1": [ "newValue" ]}, "shellHashParameterChanged called with new parameters");
                deepEqual(oShellHashChangedHandlerResult.parameters.oOldParameters, {"param1": [ "oldValue" ]}, "shellHashParameterChanged called with old parameters");
           });

    test("treatHashChanged - hashChanged event fired if parameters have not changed (change of AppSpecificRoute)",
        function () {
            var oShellHashChangedHandlerResult = attachHashChangerEventListener("hashChanged");

            oHashChanger.treatHashChanged("SO-action?param1=oldValue&/new-app-specific-route", "SO-action?param1=oldValue&/old-app-specific-route");

            strictEqual(oShellHashChangedHandlerResult.callCount, 1, "hashChanged handler called once");
            strictEqual(oShellHashChangedHandlerResult.parameters.newHash, "new-app-specific-route", "hashChanged called with new parameters");
            strictEqual(oShellHashChangedHandlerResult.parameters.oldHash, "old-app-specific-route", "hashChanged called with old parameters");
       });

    test("treatHashChanged - hashChanged event fired if old shell part is empty",
            function () {
                var oShellHashChangedHandlerResult = attachHashChangerEventListener("hashChanged");

                oHashChanger.treatHashChanged("&/new-app-specific-route", "");

                strictEqual(oShellHashChangedHandlerResult.callCount, 1, "hashChanged handler called once");
                strictEqual(oShellHashChangedHandlerResult.parameters.newHash, "new-app-specific-route", "hashChanged called with new app-specific route");
                strictEqual(oShellHashChangedHandlerResult.parameters.oldHash, "", "hashChanged called with old app-specific route");
           });

    test("treatHashChanged - shellHashChanged event fired if there are no listeners for shellHashParameterChanged event",
        function () {
            var fnShellCallback = initHashChanger(""),
                oShellHashChangedHandlerResult = attachHashChangerEventListener("shellHashChanged");

            oHashChanger.treatHashChanged("SO-action?param1=newValue&/new-app-specific-route", "SO-action?param1=oldValue&/old-app-specific-route");

            sinon.assert.calledWith(fnShellCallback, "SO-action?param1=newValue", "&/new-app-specific-route", "SO-action?param1=oldValue", "&/old-app-specific-route");
            strictEqual(oShellHashChangedHandlerResult.callCount, 1, "shellHashChanged handler called once");
            strictEqual(oShellHashChangedHandlerResult.parameters.newShellHash, "SO-action?param1=newValue", "shellHashChanged called with newShellHash");
            strictEqual(oShellHashChangedHandlerResult.parameters.newAppSpecificRoute, "&/new-app-specific-route", "shellHashChanged called with newAppSpecificRoute");
            strictEqual(oShellHashChangedHandlerResult.parameters.oldShellHash, "SO-action?param1=oldValue", "shellHashChanged called with oldShellHash");
            strictEqual(oShellHashChangedHandlerResult.parameters.oldAppSpecificRoute, "&/old-app-specific-route", "shellHashChanged called with oldAppSpecificRoute");
    });
    [
        {
            testDescription: "Abandon",
            filterReturn: "Abandon",
            expectedHash: ""
        },
        {
            testDescription: "Keep",
            filterReturn: "Keep",
            expectedHash: "SO-AC"
        }
    ].forEach(function (oFixture) {
        test("navigation filters - " + oFixture.testDescription, function () {
                var oSrv = sap.ushell.Container.getService("ShellNavigation"),
                    fHashChangeCallback = sinon.spy(),
                    fFilter = function (sNewHash, sOldHash) {
                        return oSrv.NavigationFilterStatus[oFixture.filterReturn];
                    };
                oSrv.init(fHashChangeCallback);

                ok(fHashChangeCallback.callCount === 1, "Hash change callback called in init");

                oSrv.registerNavigationFilter(fFilter);
                oSrv.toExternal({
                    target : {
                        semanticObject: "SO",
                        action: "AC"
                    }
                });
                ok(fHashChangeCallback.callCount === 1, "Hash change callback called when filter Abandon the navigation");
                ok(hasher.getHash() === oFixture.expectedHash, "Hash changed when filter Abandon the navigation");
            });
    });


    [
        {
            testDescription: "Custom as a plain value",
            testNavigateToHash: "Object-actionCustomPlain",
            vFilterReturnValue: O_NAVIGATION_FILTER_STATUS.Custom,
            expectedHash: "Object-actionCustomPlain",
            expectedHashChanges: 0
        },
        {
            testDescription: "Custom as an object",
            testNavigateToHash: "Object-actionCustomObj",
            vFilterReturnValue: { status: O_NAVIGATION_FILTER_STATUS.Custom },
            expectedHash: "Object-actionCustomObj",
            expectedHashChanges: 0
        },
        {
            testDescription: "Continue as a plain value",
            testNavigateToHash: "Object-actionContinuePlain",
            vFilterReturnValue: O_NAVIGATION_FILTER_STATUS.Continue,
            expectedHash: "Object-actionContinuePlain",
            expectedHashChanges: 1
        },
        {
            testDescription: "Unknown status",
            testNavigateToHash: "Object-actionContinueUnknown",
            vFilterReturnValue: "Unknown",
            expectedHash: "Object-actionContinueUnknown",
            expectedHashChanges: 1
        },
        {
            testDescription: "Abandon",
            testNavigateToHash: "Object-actionContinueUnknown",
            vFilterReturnValue: O_NAVIGATION_FILTER_STATUS.Abandon,
            expectedHash: "",
            expectedHashChanges: 0
        },
        {
            testDescription: "Custom with hash change",
            testNavigateToHash: "Object-actionContinueUnknown?p1=v1",
            vFilterReturnValue: { status: O_NAVIGATION_FILTER_STATUS.Custom, hash: "Intercepted-hash" },
            expectedHash: "Intercepted-hash",
            expectedHashChanges: 0
        },
        {
            testDescription: "Filter function throws",
            testNavigateToHash: "Object-filterThrows",
            fnFilter: function () { throw new Error("Error in filter"); },
            expectedHash: "Object-filterThrows",
            expectedHashChanges: 1
        }
    ].forEach(function (oFixture) {

        test("navigation filters when " + oFixture.testDescription, function () {
            var fnFilter,
                oSrv = sap.ushell.Container.getService("ShellNavigation"),
                fHashChangeCallback = sinon.spy();

            if (oFixture.fnFilter) {
                fnFilter = oFixture.fnFilter;
            } else {
                fnFilter = function (sNewHash, sOldHash) {
                    return oFixture.vFilterReturnValue;
                };
            }
            oSrv.init(fHashChangeCallback);

            // Hash changes during init
            strictEqual(fHashChangeCallback.callCount, 1, "Hash change callback called in init");

            oSrv.registerNavigationFilter(fnFilter);
            oSrv.toExternal({
                target : {
                    shellHash: oFixture.testNavigateToHash
                }
            });

            // Check how many times hash *changed* after init
            strictEqual(fHashChangeCallback.callCount - 1, oFixture.expectedHashChanges, "Hash change callback was called");

            strictEqual(hasher.getHash(), oFixture.expectedHash, "Hash is as expected");
        });

    });

    test("navigation filter can be deregisteded", function () {
        var oSrv = sap.ushell.Container.getService("ShellNavigation"),
            fHashChangeCallback = sinon.spy();

        var fnFilter = function (sNewHash, sOldHash) {
            return O_NAVIGATION_FILTER_STATUS.Abandon;
        };
        oSrv.init(fHashChangeCallback);

        // Hash changes during init
        strictEqual(fHashChangeCallback.callCount, 1, "Hash change callback called in init");

        // This has effect (no abandon filter registered)
        oSrv.toExternal({
            target : {
                shellHash: "#Action-tonav1"
            }
        });
        strictEqual(fHashChangeCallback.callCount - 1, 1, "Hash change callback was made");

        // Now we register a navigation filter
        oSrv.registerNavigationFilter(fnFilter);

        // This has no effect: abandon filter is registered
        oSrv.toExternal({
            target : {
                shellHash: "#Action-tonav2"
            }
        });
        strictEqual(fHashChangeCallback.callCount - 1, 1, "No additional navigation was made");

        // Filter is unregistered, now navigation can take place
        oSrv.unregisterNavigationFilter(fnFilter);

        oSrv.toExternal({
            target : {
                shellHash: "#Action-tonav3"
            }
        });

        strictEqual(fHashChangeCallback.callCount - 1, 2, "Hash change callback was called again");
    });

    test("Check initial Navigation Filter", function () {
        // Act
        var oSrv = sap.ushell.Container.getService("ShellNavigation");
        var oHashChanger = oSrv.hashChanger;

        // Assert
        // Note: It cannot be checked if the correct function is registered, as bind() is used.
        strictEqual(oHashChanger.aNavigationFilters.length, 1,
            "_navigationFilterForForwardingToRegisteredRouters registered initially");
    });

    test("registerNavigationFilter new filter", function () {
        // Arrange
        var fnFilter = function () { };
        var oSrv = sap.ushell.Container.getService("ShellNavigation");
        var oHashChanger = oSrv.hashChanger;

        // ignore existing filters registered during init
        oHashChanger.aNavigationFilters = [];

        // Act
        oSrv.registerNavigationFilter(fnFilter);

        // Assert
        deepEqual(oHashChanger.aNavigationFilters, [fnFilter],
            "filter is registered among the navigation filters");
    });
    test("unregisterNavigationFilter filter", function () {
        // Arrange
        var fnFilter = function () { };
        var oSrv = sap.ushell.Container.getService("ShellNavigation");
        var oHashChanger = oSrv.hashChanger;

        // ignore existing filters registered during init
        oHashChanger.aNavigationFilters = [fnFilter];

        // Act
        oSrv.unregisterNavigationFilter(fnFilter);

        // Assert
        deepEqual(oHashChanger.aNavigationFilters, [],
            "filter is removed from aNavigationFilters member");
    });
    [
        {
            "description": "app specific route is null",
            "inputHash": {
                "appSpecificRoute": null,
                "shellPart": "SO-ACTION"
            },
            "expectedFullHash": "SO-ACTION"
        },
        {
            "description": "app specific route does exist",
            "inputHash": {
                "appSpecificRoute": "&/appSpecific",
                "shellPart": "SO-ACTION"
            },
            "expectedFullHash": "SO-ACTION&/appSpecific"
        },
        {
            "description": "hash is null",
            "inputHash": null,
            "expectedFullHash": ""
        }
    ].forEach(function (oFixture) {
            test("init: parameter full hash is set when " + oFixture.description, function () {
                var oHashChanger = new ShellNavigationHashChanger();
                oHashChanger.privsplitHash = function (){
                    return oFixture.inputHash;
                };
                var hasChangerFireEventSpy = sinon.spy(oHashChanger, "fireEvent");

                oHashChanger.init();
                deepEqual( hasChangerFireEventSpy.calledWith("hashChanged",sinon.match({fullHash:oFixture.expectedFullHash})), true, "event was fired with expectedFullHash");

            });
        });


    test("getRelevantEventsInfo: returns the expected events to UI5", function () {
        var oHashChanger = new ShellNavigationHashChanger();

        var aUi5EventInfo = oHashChanger.getRelevantEventsInfo();

        var aExpectedUi5EventInfo = [
            {
                name: "shellHashChanged",
                paramMapping: {
                    newHash: "newAppSpecificRouteNoSeparator",
                    oldHash: "oldAppSpecificRouteNoSeparator"
                },
                updateHashOnly: true
            },
            {
                name: "hashChanged",
                paramMapping: {
                    fullHash: "fullHash",
                    newHash: "newHash"
                }
            }
        ];

        deepEqual(aUi5EventInfo, aExpectedUi5EventInfo, "expected data were returned");
    });
});
