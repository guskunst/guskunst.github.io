// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/util/MockServer"
], function (MockServer) {
    "use strict";


    var mServers = {};

    return {
        init: function (sRootUri, aRequests) {
            sRootUri =  sRootUri || "/";
            // create
            mServers[sRootUri] = new MockServer({
                rootUri: sRootUri
            });
            // configure
            MockServer.config({
                autoRespond: true,
                autoRespondAfter: 0
            });
            mServers[sRootUri].setRequests(aRequests);

            // start
            mServers[sRootUri].start();

            return mServers[sRootUri];
        },

        get: function (sRootUri) {
            return mServers[sRootUri];
        },

        destroy: function (sRootUri) {
            mServers[sRootUri].destroy();
            delete mServers[sRootUri];
        },

        destroyAll: function () {
            var aProperties = Object.getOwnPropertyNames(mServers);
            for (var i = 0; i < aProperties.length; i++) {
                mServers[aProperties[i]].destroy();
            }
        }
    };
});