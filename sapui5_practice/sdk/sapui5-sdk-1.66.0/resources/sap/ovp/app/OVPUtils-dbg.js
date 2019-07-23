sap.ui.define(function () {
    "use strict";

    // static variables
    var ovpUtils = {
        bCRTLPressed: false
    };

    // constants
    ovpUtils.constants = {
        explace: "explace",
        inplace: "inplace"
    };
    ovpUtils.Annotations = {
        dataPoint: "dataPoint"
    };
    ovpUtils.Layers = {
        vendor: "VENDOR",
        customer: "CUSTOMER",
        customer_base: "CUSTOMER_BASE"
    };


    return ovpUtils;

}, /* bExport= */ true);
