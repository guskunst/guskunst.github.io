// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/User"
], function(User
) {
    "use strict";
    var ContainerAdapter = function (oSystem, sParameter, oAdapterConfiguration) {

        var oUser;

        this.load = function () {
            oUser = new User({});
            return new jQuery.Deferred().resolve().promise();
        };

        this.getSystem = function () {
            return oSystem;
        };

        this.getUser = function () {
            return oUser;
        };
    };

    return ContainerAdapter;
}, /* bExport= */ true);
