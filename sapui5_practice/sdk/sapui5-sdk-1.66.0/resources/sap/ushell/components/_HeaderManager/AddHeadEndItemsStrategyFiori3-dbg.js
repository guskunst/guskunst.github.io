// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log"
], function (Log) {
    "use strict";

    function fnValidateAddingHeadEndItems (aExistingIds, aIdsToAdd) {
        var allocatedItemSpace = 0,
            index,
            sId;

        if (!aExistingIds || !aIdsToAdd) {
            return false;
        }

        // Check that the controls with the given ids exist
        var bNotExist = aIdsToAdd.some( function (sId) {
            var bNotFound = !sap.ui.getCore().byId(sId);
            if (bNotFound) {
                Log.warning("Failed to find control with id '{id}'".replace("{id}", sId));
            }
            return bNotFound;
        });
        if (bNotExist) {
            return false;
        }

        // We always allow to create the overflow button
        if (aIdsToAdd.length === 1 && aIdsToAdd[0] === "endItemsOverflowBtn") {
            return true;
        }
        for (index = 0; index < aExistingIds.length; index++) {
            sId = aExistingIds[index];
            if (sId !== "endItemsOverflowBtn") {
                // Increment the counter but not consider the overflow button
                allocatedItemSpace++;
            }

            if (allocatedItemSpace + aIdsToAdd.length > 6) {
                jQuery.sap.log.warning("maximum of six items has reached, cannot add more items.");
                return false;
            }
            if (aIdsToAdd.indexOf(sId) > -1) {
                return false;
            }
        }

        return true;
    }

    function fnAddHeadEndItems (aCurrentlyExistingItems, aIdsToAdd) {
        // Copy original array
        var aNewItems = aCurrentlyExistingItems.slice(0);
        // In order to always keep the same order of buttons in the shell header, we will sort them by their Id's
        // sorting order: 1. sf, 2.copilot 3. Notification(last) and up to 6 items
        aNewItems.sort();
        aNewItems = aNewItems.concat(aIdsToAdd);

        var nMeAreaIndex = aNewItems.indexOf("meAreaHeaderButton");
        if (nMeAreaIndex !== -1) {
            aNewItems.splice(nMeAreaIndex, 1);
            aNewItems.splice(aNewItems.length, 0, "meAreaHeaderButton");
        }

        var nNotificationIndex = aNewItems.indexOf("NotificationsCountButton");
        if (nNotificationIndex !== -1) {
            aNewItems.splice(nNotificationIndex, 1);
            aNewItems.splice(aNewItems.length - 1, 0, "NotificationsCountButton");
        }

        // The search button must remain in the first position, so moving it to the front.
        var nSfIndex = aNewItems.indexOf("sf");
        if (nSfIndex !== -1) {
            aNewItems.splice(nSfIndex, 1);
            aNewItems.splice(0, 0, "sf");
        }

        return aNewItems;
    }

    function execute (aCurrentValue, aValueToAdjust) {
        var aResult = aCurrentValue;

        if (fnValidateAddingHeadEndItems(aCurrentValue, aValueToAdjust)) {
            aResult = fnAddHeadEndItems(aCurrentValue, aValueToAdjust);
        }

        return aResult;
    }

    return {
        execute: execute
    };

});
