// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for ClientSideTargetResolution's Search
 */
sap.ui.require([
    "sap/ushell/services/_ShellNavigation/NavigationHistoryMonitor"
], function (oNavigationHistoryMonitor) {
    "use strict";

    /* global QUnit sinon */

    /**
     * Creates a fake hash changer
     *
     * @param {object} [oOptions]
     *  configuration options for the factory. It's an object like:
     *  <pre>
     *  {
     *      // event names returned by getSetHashEvents/getReplaceHashEvents
     *      setHashEventNames: ["EventA", "EventB"],
     *      replaceHashEventNames: ["EventA", "EventB"]
     *  }
     *  </pre>
     *
     * @returns {object}
     *  a fake hash changer with stubs.
     *
     * @private
     */
    function createFakeHashChanger (oOptions) {
        oOptions = oOptions || {};

        var aSetHashEventNames = oOptions.setHashEventNames || [];
        var aReplaceHashEventNames = oOptions.replaceHashEventNames || [];

        var oRegisteredListeners = { };

        return {
            getSetHashEvents: sinon.stub().returns(aSetHashEventNames),
            getReplaceHashEvents: sinon.stub().returns(aReplaceHashEventNames),
            attachEvent: sinon.spy(function (sEvent, fnListener) {
                if (!oRegisteredListeners[sEvent]) {
                    oRegisteredListeners[sEvent] = [];
                }
                oRegisteredListeners[sEvent].push(fnListener);
            }),
            detachEvent: sinon.spy(function (sEvent, fnListener) {
                if (!oRegisteredListeners[sEvent]) {
                    return;
                }
                var iListenerIdx = oRegisteredListeners[sEvent].indexOf(fnListener);
                oRegisteredListeners[sEvent].splice(iListenerIdx, 1);
            }),
            triggerEvent: function (sEvent) {
                oRegisteredListeners[sEvent].forEach(function (fn) { fn(); });
            }
        };
    }

    [
        {
            testDescription: "empty environment is passed",
            oEnv: {},
            expectedEnv: {
                hashSet: null
            }
        },
        {
            testDescription: "existing value for hashSet in environment",
            oEnv: {
                hashSet: true
            },
            expectedEnv: { hashSet: null }
        },
        {
            testDescription: "another value is set in the environment",
            oEnv: {
                otherValue: true
            },
            expectedEnv: {
                otherValue: true,
                hashSet: null
            }
        }
    ].forEach(function (oFixture) {
        QUnit.test("_reset: resets hash in environment when " + oFixture.testDescription, function (assert) {
            oNavigationHistoryMonitor._reset(oFixture.oEnv);
            assert.deepEqual(oFixture.oEnv, oFixture.expectedEnv, "env changed as expected");
        });
    });

    [
        {
            testDescription: "environment contains a 'hashSet' key with a true value",
            oEnv: {
                hashSet: true
            },
            expectedResult: true
        },
        {
            testDescription: "environment contains a 'hashSet' key with a false value",
            oEnv: {
                hashSet: false
            },
            expectedResult: false
        },
        {
            testDescription: "environment contains a 'hashSet' key with a truthy value",
            oEnv: {
                hashSet: "something else"
            },
            expectedResult: true
        },
        {
            testDescription: "environment does not contain contains a 'hashSet' key with corresponding value",
            oEnv: {
                something: "else"
            },
            expectedResult: null
        }
    ].forEach(function (oFixture) {
        QUnit.test("_wasHistoryEntryAdded returns the expected result when " + oFixture.testDescription, function (assert) {
            var vResult = oNavigationHistoryMonitor._wasHistoryEntryAdded(oFixture.oEnv);
            assert.strictEqual(vResult, oFixture.expectedResult, "returned the expected result");
        });
    });


    QUnit.test("_activate: stores hash changer inside environment", function (assert) {
        var oEnv = {};
        var oFakeHashChanger = createFakeHashChanger();
        oNavigationHistoryMonitor._activate(oEnv, oFakeHashChanger);

        assert.strictEqual(oEnv.hashChanger, oFakeHashChanger, "stores the expected object in the 'hashChanger' member");
    });

    QUnit.test("_activate: registers the expected setHash listeners on the given hash change", function (assert) {
        // Arrange
        var oEnv = {
            onHashSet: function () { },
            onHashReplaced: function () { }
        };

        var oFakeHashChangerOptions = {
            setHashEventNames: ["A", "B", "C"]
        };

        var oFakeHashChanger = createFakeHashChanger(oFakeHashChangerOptions);

        // Act
        oNavigationHistoryMonitor._activate(oEnv, oFakeHashChanger);

        // Assert
        oFakeHashChangerOptions.setHashEventNames.forEach(function (sEvent, iCall) {
            var aCallArgs = oFakeHashChanger.attachEvent.getCall(iCall).args;
            var iTestMessageCall = iCall + 1;
            assert.strictEqual(aCallArgs[0], sEvent, "Call #" + iTestMessageCall + " of #attachEvent method of the hash changer was called with event " + sEvent);
            assert.strictEqual(aCallArgs[1], oEnv.onHashSet, "Call #" + iTestMessageCall + " of #attachEvent method of the hash changer was called with the expected hashSet listener");
        });

    });

    QUnit.test("_activate: registers the expected replaceHash listeners on the given hash change", function (assert) {
        // Arrange
        var oEnv = {
            onHashSet: function () { },
            onHashReplaced: function () { }
        };

        var oFakeHashChangerOptions = {
            replaceHashEventNames: ["1", "2", "3"]
        };

        var oFakeHashChanger = createFakeHashChanger(oFakeHashChangerOptions);

        // Act
        oNavigationHistoryMonitor._activate(oEnv, oFakeHashChanger);

        // Assert
        oFakeHashChangerOptions.replaceHashEventNames.forEach(function (sEvent, iCall) {
            var aCallArgs = oFakeHashChanger.attachEvent.getCall(iCall).args;
            var iTestMessageCall = iCall + 1;
            assert.strictEqual(aCallArgs[0], sEvent, "Call #" + iTestMessageCall + " of #attachEvent method of the hash changer was called with event " + sEvent);
            assert.strictEqual(aCallArgs[1], oEnv.onHashReplaced, "Call #" + iTestMessageCall + " of #attachEvent method of the hash changer was called with the expected hashReplaced listener");
        });
    });

    QUnit.test("_destroy: unregisters the expected setHash listeners from hash changer when called", function (assert) {
        // Arrange
        var oFakeHashChangerOptions = {
            setHashEventNames: ["A", "B", "C"]
        };

        var oFakeHashChanger = createFakeHashChanger(oFakeHashChangerOptions);

        var oEnv = {
            onHashSet: function () { },
            onHashReplaced: function () { },
            hashChanger: oFakeHashChanger
        };

        // Act
        oNavigationHistoryMonitor._destroy(oEnv);

        // Assert
        oFakeHashChangerOptions.setHashEventNames.forEach(function (sEvent, iCall) {
            var aCallArgs = oFakeHashChanger.detachEvent.getCall(iCall).args;
            var iTestMessageCall = iCall + 1;
            assert.strictEqual(aCallArgs[0], sEvent, "Call #" + iTestMessageCall + " of #attachEvent method of the hash changer was called with event " + sEvent);
            assert.strictEqual(aCallArgs[1], oEnv.onHashSet, "Call #" + iTestMessageCall + " of #attachEvent method of the hash changer was called with the expected hashSet listener");
        });

    });

    QUnit.test("_destroy: unregisters the expected replaceHash listeners from hash changer when called", function (assert) {
        // Arrange
        var oFakeHashChangerOptions = {
            replaceHashEventNames: ["1", "2", "3"]
        };

        var oFakeHashChanger = createFakeHashChanger(oFakeHashChangerOptions);

        var oEnv = {
            onHashSet: function () { },
            onHashReplaced: function () { },
            hashChanger: oFakeHashChanger
        };

        // Act
        oNavigationHistoryMonitor._destroy(oEnv);

        // Assert
        oFakeHashChangerOptions.replaceHashEventNames.forEach(function (sEvent, iCall) {
            var iTestMessageCall = iCall + 1;
            var aCallArgs = oFakeHashChanger.detachEvent.getCall(iCall).args;
            assert.strictEqual(aCallArgs[0], sEvent, "Call #" + iTestMessageCall + " of #attachEvent method of the hash changer was called with event " + sEvent);
            assert.strictEqual(aCallArgs[1], oEnv.onHashReplaced, "Call #" + iTestMessageCall + " of #attachEvent method of the hash changer was called with the expected hashReplaced listener");
        });
    });

    QUnit.test("_destroy: deletes hash changer property from environment", function (assert) {
        // Arrange
        var oEnv = {
            onHashSet: function () { },
            onHashReplaced: function () { },
            hashChanger: createFakeHashChanger()
        };

        // Act
        oNavigationHistoryMonitor._destroy(oEnv);

        // Assert
        assert.strictEqual(oEnv.hasOwnProperty("hashChanger"), false, "hashChanger property was deleted from the environment");
    });

    QUnit.test("_destroy: resets the hashSet flag", function (assert) {
        // Arrange
        var oEnv = {
            hashSet: true
        };

        // Act
        oNavigationHistoryMonitor._destroy(oEnv);

        // Assert
        assert.strictEqual(oEnv.hashSet, null, "hashSet flag is null");
    });

    QUnit.test("_activate: throws when provided environment contains a hashChanger member already", function (assert) {
        // Arrange
        var oEnv = {
            hashChanger: { /* any kind of properties */ }
        };

        var oFakeHashChanger = createFakeHashChanger();

        // Act
        var bThrows = false;
        try {
            oNavigationHistoryMonitor._activate(oEnv, oFakeHashChanger);
        } catch (oE) {
            bThrows = true;
        }

        // Assert
        assert.strictEqual(bThrows, true, "error is thrown");
    });

    QUnit.test("create: creates the expected monitor object", function (assert) {
        var aExpectedMethods = [ "wasHistoryEntryAdded", "reset", "activate", "destroy" ];

        var oMonitor = oNavigationHistoryMonitor.create({} /* oEnv */);

        aExpectedMethods.forEach(function (sFunctionName) {
            assert.strictEqual(typeof oMonitor[sFunctionName], "function", "returned object contains the " + sFunctionName + " method");
        });

        var iMonitorPropertyCount = Object.keys(oMonitor).length;
        assert.strictEqual(iMonitorPropertyCount, aExpectedMethods.length, "monitor contains " + iMonitorPropertyCount + " methods");
    });

    QUnit.test("create: changes the environment as expected", function (assert) {
        var oEnv = {};

        oNavigationHistoryMonitor.create(oEnv);

        [ "onHashSet", "onHashReplaced" ].forEach(function (sFunctionName) {
            assert.strictEqual(typeof oEnv[sFunctionName], "function", "returned object contains the " + sFunctionName + " method");
        });
    });

    QUnit.test("characterization test", function (assert) {
        var bHistoryEntryInactive,
            bHistoryEntryActive;

        var oMonitor = oNavigationHistoryMonitor.create(/* oEnv */ {});
        var oFakeHashChanger = createFakeHashChanger({
            setHashEventNames: ["setHash", "shellHashChanged"],
            replaceHashEventNames: ["replaceHash", "hashReplaced"]
        });

        // inactive monitor
        bHistoryEntryInactive = oMonitor.wasHistoryEntryAdded();
        assert.strictEqual(bHistoryEntryInactive, null);

        // active monitor
        oMonitor.activate(oFakeHashChanger);
        bHistoryEntryActive = oMonitor.wasHistoryEntryAdded();
        assert.strictEqual(bHistoryEntryActive, null);

        // trigger events
        oFakeHashChanger.triggerEvent("setHash");
        assert.strictEqual(oMonitor.wasHistoryEntryAdded(), true,
            "history entry was added after a navigation");

        // ... normally #reset should be called before reading another value
        // from wasHistoryEntryAdded, however this should be the right behavior
        // when a reset is not called and the next event is triggered.
        oFakeHashChanger.triggerEvent("replaceHash");
        assert.strictEqual(oMonitor.wasHistoryEntryAdded(), false,
            "history entry was not added after a navigation");

        // ... works with bursts of different event calls
        oFakeHashChanger.triggerEvent("hashReplaced");
        assert.strictEqual(oMonitor.wasHistoryEntryAdded(), false,
            "history entry was still not added after another 'replace' event is triggered from the hash changer");

        oMonitor.reset();
        assert.strictEqual(oMonitor.wasHistoryEntryAdded(), null,
            "history entry was re-set");

        // destroy after hash set
        oFakeHashChanger.triggerEvent("setHash");
        oMonitor.destroy();  // destroy is idempotent
        oMonitor.destroy();
        oMonitor.destroy();
        assert.strictEqual(oMonitor.wasHistoryEntryAdded(), null,
            "history entry was re-set after destroy");

        // event triggered after destroy
        oFakeHashChanger.triggerEvent("setHash");
        assert.strictEqual(oMonitor.wasHistoryEntryAdded(), null,
            "history entry was not updated after destroy");
    });
});
