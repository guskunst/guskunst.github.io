// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview provides a helper to create a self-contained monitor object
 * that allows to monitor how navigation calls affect the history. This is
 * needed to be able to detect whether an app had last navigated via
 * <code>navTo(..., false)</code> or <code>navTo(..., true)</code>.
 *
 * This helper is to be used internally in the Fiori Launchpad and most likely
 * just in the Shell controller.
 *
 * Once created, an history monitor is an object that exposes the following
 * interface:
 *
 * <ul>
 *  <li> activate: start listening on hash change events
 *  <li> destroy: remove all hash change events listeners
 *  <li> wasHistoryEntryAdded: returns whether an history entry was added after the current hash changed
 *  <li> reset: signals that the <code>wasHistoryEntryAdded</code> result was
 *       consumed and it's not needed in a further call anymore.
 * </ul>
 *
 * @private
 *
 * @version 1.66.0
 */

sap.ui.define([], function () {
    /* global Promise */
    "use strict";

    /**
     * Listener function that records in the environment that a navigation
     * happened via hasher#setHash.
     *
     * @param {object} oEnv
     *   The environment (state) used to execute the functionality described by
     *   this method
     */
    function onHashSet (oEnv) {
        oEnv.hashSet = true;
    }

    /**
     * Listener function that records in the environment that a navigation
     * happened via hasher#replaceHash.
     *
     * @param {object} oEnv
     *   The environment (state) used to execute the functionality described by
     *   this method
     */
    function onHashReplaced (oEnv) {
        oEnv.hashSet = false;
    }

    /**
     * Uses the environment to determine whether an history entry was added.
     *
     * @param {object} oEnv
     *   The environment (state) used to execute the functionality described by
     *   this method
     *
     * @returns {boolean|null}
     *   Returns a boolean indicating whether a history entry was added to the
     *   last monitored navigation, or null if it's not possible to determine
     */
    function wasHistoryEntryAdded (oEnv) {
        var bPropertyNotExist = !oEnv.hasOwnProperty("hashSet");
        var bPropertyIsNull = oEnv.hashSet === null;
        if (bPropertyNotExist || bPropertyIsNull) {
            return null;
        }

        return !!oEnv.hashSet;
    }

    /**
     * Resets the last navigation recording (not the whole object). This method
     * should be called every time the last reading was obtained and dealt with
     * from the outside, in order to prepare for the next navigation.
     *
     * @param {object} oEnv
     *   The environment (state) used to execute the functionality described by
     *   this method
     */
    function reset (oEnv) {
        oEnv.hashSet = null;
    }

    /**
     * Registers listeners on events that trigger navigation via hasher#hashSet
     * or hasher#hashReplaced.
     *
     * @param {object} oEnv
     *   The environment (state) used to execute the functionality described by
     *   this method
     * @param {object} oShellNavigationHashChanger
     *   The shell navigation hash changer
     */
    function activate (oEnv, oShellNavigationHashChanger) {
        if (typeof oEnv.hashChanger === "object" && oEnv.hashChanger !== null) {
            throw new Error("Cannot re-activate already active navigation history monitor!");
        }
        oEnv.hashChanger = oShellNavigationHashChanger;

        oShellNavigationHashChanger.getSetHashEvents().forEach(function (sEvent) {
            oShellNavigationHashChanger.attachEvent(sEvent, oEnv.onHashSet);
        });
        oShellNavigationHashChanger.getReplaceHashEvents().forEach(function (sEvent) {
            oShellNavigationHashChanger.attachEvent(sEvent, oEnv.onHashReplaced);
        });
    }

    /**
     * Destroys the navigation history monitor, making it ready for a new
     * activation.
     *
     * @param {object} oEnv
     *   The environment (state) used to execute the functionality described by
     *   this method
     */
    function destroy (oEnv) {
        reset(oEnv);

        var oHashChanger = oEnv.hashChanger;
        if (!oHashChanger) {
            return;
        }

        oHashChanger.getSetHashEvents().forEach(function (sEvent) {
            oHashChanger.detachEvent(sEvent, oEnv.onHashSet);
        });
        oHashChanger.getReplaceHashEvents().forEach(function (sEvent) {
            oHashChanger.detachEvent(sEvent, oEnv.onHashReplaced);
        });

        delete oEnv.hashChanger;
    }

    /**
     * Creates a navigation history monitor.
     *
     * @param {object} oEnv
     *   A reference to an empty object, used to execute the monitor
     *   functionality. This object is required to avoid keeping state in
     *   this code, which follows the functional paradigm.
     *
     * @returns {object}
     *   The Navigation History Monitor interface.
     */
    function create (oEnv) {
        oEnv.hashSet = null; // null: we don't know how the history was modified.
        oEnv.hashChanger = null;

        // keep these inside for detach
        oEnv.onHashSet = onHashSet.bind(null, oEnv);
        oEnv.onHashReplaced = onHashReplaced.bind(null, oEnv);

        var oMonitor = {
            wasHistoryEntryAdded: wasHistoryEntryAdded.bind(null, oEnv),
            reset: reset.bind(null, oEnv),
            activate: activate.bind(null, oEnv),
            destroy: destroy.bind(null, oEnv)
        };

        return oMonitor;
    }

    return {
        create: create,
        _wasHistoryEntryAdded: wasHistoryEntryAdded,
        _reset: reset,
        _activate: activate,
        _destroy: destroy
    };

}, false /* bExport */);
