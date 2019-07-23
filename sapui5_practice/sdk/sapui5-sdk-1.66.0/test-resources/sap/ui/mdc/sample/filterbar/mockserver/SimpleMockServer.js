sap.ui.define([
    'sap/ui/base/ManagedObject',
    "jquery.sap.global",
	"sap/ui/thirdparty/sinon"
], function (ManagedObject, jQuery, sinon) {
    "use strict";

    return ManagedObject.extend("sap.ui.mdc.sample.filterbar.mockserver.SimpleMockServer", {

        started: null,
        init: function () {
            var mockData = {};

            /* Load Mockdata first */
            jQuery.get("./mockserver/metadata_f4_artistname.xml").then(function (data, status, jqXHR) {
                mockData["f4_artistname"] = jqXHR.responseText;

                jQuery.get("./mockserver/I_MDBU_V4_Artistname.json").then(function (data, status, jqXHR) {
                    mockData["I_MDBU_V4_Artistname"] = data;
                });
            });
            jQuery.get("./mockserver/metadata_f4_artistperson.xml").then(function (data, status, jqXHR) {
                mockData["f4_artistperson"] = jqXHR.responseText;
            });
            jQuery.get("./mockserver/Artists.json").then(function (data, status, jqXHR) {
                mockData["Artists"] = jqXHR.responseText;
            });
            this.started = jQuery.get("./mockserver/I_MDBU_V4_ArtistName.json").then(function (data, status, jqXHR) {
                mockData["I_MDBU_V4_ArtistName"] = data;
                return jQuery.get("./mockserver/metadata.xml");
            }).then(function (data, status, jqXHR) {
                var uriParams = jQuery.sap.getUriParameters(),
                    /* Url parameter {boolean} batch */
                    // groupId = uriParams.get("batch") ? "$auto" : "$direct",
                    /* Url parameter useBackendUrl to specify a backend server url for a proxy */
                    serverUrl = uriParams.get("useBackendUrl");
                    // proxyPrefix = serverUrl ? "/databinding/proxy/" + serverUrl.replace("://", "/") : "";

                /* Prepare Sinon as we don't have a mock server yet */
                if (!serverUrl) {
                    var fServer = sinon.fakeServer.create();
                    fServer.autoRespond = true;
                    fServer.xhr.useFilters = true;

                    fServer.xhr.addFilter(function (method, url) {
                        // whenever the this returns true the request will not faked
                        return !url.match(/\/sap\/opu\/odata4\//);
                    });

                    fServer.respondWith("GET", /\/sap\/opu\/odata4\//, function (xhr, id) {
                        var oData, sFilter, sValue;
                        if (xhr.url.indexOf("metadata") > -1) {

                            if (xhr.url.indexOf("i_mdbu_v4_artistname") > -1) {
                                jqXHR.responseText = mockData["f4_artistname"];
                            } else if (xhr.url.indexOf("i_mdbu_v4_artistperson") > -1) {
                                jqXHR.responseText = mockData["f4_artistperson"];
                            }

                            return xhr.respond(200, {
                                "Content-Type": "application/xml"
                            }, jqXHR.responseText);

                        } else {
                            if (xhr.url.indexOf("$filter") > 0) {
                                sFilter = xhr.url.match(/\$filter=(.*)&/)[1];

                                if (sFilter.indexOf("&$skip=0") > -1) {
                                    sFilter = sFilter.slice(0, sFilter.indexOf("&$skip=0"));
                                }

                                oData = jQuery.extend({}, JSON.parse(mockData["Artists"]));
                                // Extreme filtering on BreakupYear eq only
                                if (sFilter.indexOf('Name%20eq') > -1) {
                                    sValue = sFilter.match(/Name%20eq%20'(.*)'/)[1];
                                    sValue = decodeURI(sValue);
                                    oData.value = oData.value.filter(function (entry) {
                                        return entry.Name === sValue;
                                    });
                                } else if (sFilter.indexOf('Name%20gt') > -1) {
                                    sValue = sFilter.match(/Name%20gt%20'(.*)'/)[1];
                                    oData.value = oData.value.filter(function (entry) {
                                        return (entry.Name > sValue);
                                    });
                                } else if (sFilter.indexOf('startswith(Name,') > -1) {
                                    if (sFilter.indexOf("')") > -1) {
                                        sValue = sFilter.slice('startswith(Name,'.length + 1, sFilter.indexOf("')"));
                                        oData.value = oData.value.filter(function (entry) {
                                            return (entry.Name.indexOf(sValue) === 0);
                                        });
                                    }
                                } else if (sFilter.indexOf('contains(Name,') > -1) {
                                    if (sFilter.indexOf("')") > -1) {
                                        sValue = sFilter.slice('contains(Name,'.length + 1, sFilter.indexOf("')"));
                                        oData.value = oData.value.filter(function (entry) {
                                            return (entry.Name.indexOf(sValue) > -1);
                                        });
                                    }
                                }
                                return xhr.respond(200, {
                                    "Content-Type": "application/json",
                                    "OData-Version": "4.0"
                                }, JSON.stringify(oData));

                            } else if (xhr.url.indexOf("Artists") > -1) {
                                jqXHR.responseText = mockData["Artists"];
                                return xhr.respond(200, {
                                    "Content-Type": "application/json",
                                    "OData-Version": "4.0"
                                }, jqXHR.responseText);

                            } else {
                                return xhr.respond(200, {
                                    "Content-Type": "application/json",
                                    "OData-Version": "4.0"
                                }, '{"error":"No filter specified!"}');
                            }
                        }
                    });
                    fServer.respondWith("POST", /\/sap\/opu\/odata4\//, function (xhr, id) {
                        var oData, s;
                        if (xhr.url.indexOf("$batch") > 0) {
                            if (xhr.url.indexOf("i_mdbu_v4_artistname") > -1) {
                                oData = jQuery.extend({}, mockData["I_MDBU_V4_ArtistName"]);
                                s = "--504DB7894DB51E12878DFB6A8B9D80C40\r\n" +
                                    "Content-Type: application/http\r\n" +
                                    "Content-Length: 5412\r\n" +
                                    "content-transfer-encoding: binary\r\n\r\n";

                            } else if (xhr.url.indexOf("Artists") > -1) {
                                oData = jQuery.extend({}, mockData["Artists"]);
                                s = "--504DB7894DB51E12878DFB6A8B9D80C40\r\n" +
                                    "Content-Type: application/http\r\n" +
                                    "Content-Length: 698\r\n" +
                                    "content-transfer-encoding: binary\r\n\r\n";
                            }

                            s += "HTTP/1.1 200 OK\r\n" +
                                "Content-Type: application/json;ieee754compatible=true;odata.metadata=minimal\r\n" +
                                "Content-Length: " + JSON.stringify(oData).length + "\r\n" +
                                "odata-version: 4.0\r\n" +
                                "cache-control: no-cache, no-store, must-revalidate\r\n\r\n" +
                                JSON.stringify(oData) +
                                "\r\n--504DB7894DB51E12878DFB6A8B9D80C40--\r\n";

                            return xhr.respond(200, {
                                "Content-Type": "multipart/mixed; boundary=504DB7894DB51E12878DFB6A8B9D80C40",
                                "Content-Length": JSON.stringify(oData).length,
                                "OData-Version": "4.0"
                            },

                                s);
                        } else {
                            return xhr.respond(200, {
                                "Content-Type": "application/json",
                                "OData-Version": "4.0"
                            }, '{"error":"No filter specified!"}');
                        }
                    });

                }
            });
        }


    });
}, true);