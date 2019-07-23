// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.components.homepage.Component
 */
sap.ui.require([
    "sap/ushell/bootstrap/common/common.load.model",
    'sap/ushell/Config'
], function (oModelWrapper, Config) {
    "use strict";

    /* global QUnit */

    QUnit.module("sap.ushell.components.homepage.Component");

    QUnit.test("Update current ViewPort State in the model", function (assert) {
        var sViewPortState = "Center",
            oEventData = {
                getParameter: function () {
                    return sViewPortState;
                }
            };

        oModelWrapper.getModel(); // trigger event subscription
        sap.ui.getCore().getEventBus().publish("launchpad", "afterSwitchState", oEventData);
        assert.equal(oModelWrapper.getModel().getProperty("/viewPortState"), sViewPortState, "Current Viewport state is being updated from the shell model");
    });

});