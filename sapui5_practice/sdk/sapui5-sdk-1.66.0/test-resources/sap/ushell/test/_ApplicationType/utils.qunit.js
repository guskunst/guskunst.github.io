// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.require([
    "sap/ushell/_ApplicationType/utils"
], function (oUtils) {
    "use strict";

    /* global QUnit */

    QUnit.module("sap.ushell.ApplicationType", {
        beforeEach: function () { },
        afterEach: function () { }
    });

    QUnit.test("module exports an object", function (assert) {
        assert.strictEqual(
            Object.prototype.toString.apply(oUtils),
            "[object Object]",
            "got an object back"
        );
    });

});
