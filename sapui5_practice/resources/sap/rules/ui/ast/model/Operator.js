sap.ui.define(["sap/rules/ui/ast/model/Base"], function (Base) {
    'use strict';

    // Allowed Databject types
    // S - Struture
    // T - Table
    // E - Element

    // BusinessDataTypes Supported
    // B - Boolean
    // D - Date and TimeStamp
    // T - Time
    // N - Number
    // S - String
    // TS - TimeSpan

    // Operator Defintion
    var Operator = function () {
        Base.apply(this, arguments);
    };

    Operator.prototype = new Base();
    Operator.prototype.constructor = Base;

    return Operator;

});