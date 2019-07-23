// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview Card UserRecents Base
 *
 * @version 1.66.0
 */

/*global sap*/
sap.ui.define([
    "sap/ui/integration/services/Data"
], function (DataService) {
    "use strict";

    /**
     * Constructor for the user recents service base which serves as a base class for
     * CardUserRecents and CardUserFrequents.
     *
     * @class
     * A base class for CardUserRecents and CardUserFrequents.
     * @extends sap.ui.integration.services.Data
     *
     * @constructor
     * @private
     * @name sap.ushell.services.CardUserRecentsBase
     * @since 1.64
     */
    var CardUserRecentsBase = DataService.extend(function () {
        this.oUserRecents = sap.ushell.Container.getService("UserRecents");
        this.oURLParsing = sap.ushell.Container.getService("URLParsing");
    });

    /**
     * A function to format an array of activities from the sap.ushell.services.UserRecents service
     * into a format that the sap.ui.integration.widgets.Card control uses to display list items.
     *
     * @private
     * @param {object[]} aActivities An array of sap.ushell.services.UserRecents activities.
     * @returns {object[]} An array of activity objects from the sap.ushell.services.UserRecents service
     * formatted as card items.
     * @since 1.64
     */
    CardUserRecentsBase.prototype._getActivitiesAsCardItems = function (aActivities) {
        var aCardItems = [];
        var oShellHash = {};
        for (var i = 0; i < aActivities.length; i++) {
            oShellHash = this.oURLParsing.parseShellHash(aActivities[i].url);
            if (oShellHash) {
                aCardItems.push({
                    Name: aActivities[i].title,
                    Description: aActivities[i].appType,
                    Icon: aActivities[i].icon,
                    Intent: {
                        SemanticObject: oShellHash.semanticObject,
                        Action: oShellHash.action,
                        Parameters: oShellHash.params
                    }
                });
            } else if (aActivities[i].url && aActivities[i].url !== "") {
                aCardItems.push({
                    Name: aActivities[i].title,
                    Description: aActivities[i].url,
                    Icon: aActivities[i].icon,
                    Url: aActivities[i].url
                });
            }
        }
        return aCardItems;
    };

    return CardUserRecentsBase;

}, true /* bExport */);