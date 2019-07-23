// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "jquery.sap.global"
], function (jQuery) {
    "use strict";

    function execute (currentValue, valueToAdjust) {
        if (!valueToAdjust) {
            valueToAdjust = {};
        }
        return jQuery.extend(true, {}, currentValue, valueToAdjust);
    }

    return {
        execute: execute
    };
});
