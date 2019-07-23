(function(){
		// for OPA testing we only need specific apps that are used e.g. for navigation
		// all other apps not part of the uriParams paramter flpApps are removed
		function removeSandboxApps(oApps) {
			var uriParams = jQuery.sap.getUriParameters();
			if (uriParams.mParams.flpApps) {
				var sAppToKeep = uriParams.mParams.flpApps[0];
				jQuery.each(oApps, function(application) {
					if (sAppToKeep.indexOf(application) < 0) {
						delete oApps[application];
					}
				});
			}
		}

		//The fiori launchpad sandbox has some supportablity tools available
		//However inside of this libary the url are wrong, so we need to fix them here
		function fixTheSandboxApps() {
			var config = window["sap-ushell-config"].services.ClientSideTargetResolution.adapter.config;
			Object.keys(config.inbounds).forEach( function(inbound) {
				var oApp = config.inbounds[inbound];
				oApp.resolutionResult.url = "../../" + oApp.resolutionResult.url;
			});
			//Add trace for all semantic objects
			["EPMProduct", "Supplier", "SalesOrder"].forEach( function(application) {
				var sAppKey = application + "-trace";
				if(!config.applications[sAppKey]) {
					config.applications[sAppKey] = {
						additionalInformation: "SAPUI5.Component=sap.ushell.demo.ReceiveParametersTestApp",
						applicationType: "URL",
						title: "Trace Navigation Parameters",
						description: "Trace Navigation Parameters",
						url: "../../../../../../../test-resources/sap/ushell/demoapps/ReceiveParametersTestApp"
					};
				}
			});
		}

		sap.ui.getCore().attachInit(function() {
			"use strict";
			sap.ui.require([
				"utils/mockserver/MockServerLauncher",
				"sap/ui/fl/FakeLrepConnectorLocalStorage",
				"sap/ui/thirdparty/datajs",
				"utils/Utils"
			], function (MockServerLauncher, FakeLrepConnectorLocalStorage, datajs, Utils) {

				function isBackendRequired() {
					var uriParams = jQuery.sap.getUriParameters(),
					serverUrl = uriParams.get("useBackendUrl"),
					proxyPrefix = serverUrl ? "../../../../../../../proxy/" + serverUrl.replace("://", "/") : "";
					if (proxyPrefix) {
						/* overwrite datajs to change the URL always */
						var fnOrgDataJS = datajs.request;
						datajs.request = function (request, success, error, handler, httpClient, metadata) {
							var sUrl = request.requestUri;
							if (sUrl && typeof sUrl === "string" && sUrl.indexOf("/sap/opu/odata") === 0) {
								request.requestUri = proxyPrefix + sUrl;
							}
							return fnOrgDataJS.apply(this, arguments);
						}
					/* overwrite jQuery to change the URL always */
					var fnOrg$ = jQuery.ajax;
					jQuery.ajax = function(vUrl) {
						var sUrl = typeof vUrl === "string" ? vUrl : vUrl.url;
						if (sUrl && sUrl.indexOf("/sap/opu/odata") === 0) {
							sUrl = proxyPrefix + sUrl;
							if (vUrl.url) {
								vUrl.url = sUrl;
							} else {
								vUrl = sUrl;
							}
						}
						return fnOrg$.apply(this, arguments);
					}
						return true;
					}
					return false;
				}

				var oApps = window["sap-ushell-config"].services.NavTargetResolution.adapter.config.applications;
				removeSandboxApps(oApps);

				FakeLrepConnectorLocalStorage.enableFakeConnector();
				if (!isBackendRequired()) {
					Object.keys(oApps).forEach( function(sApp) {
						var oApp = oApps[sApp];
						var sProject = oApp.url;
						var sManifest = "/manifest.json";
						var sManifestDynamic = Utils.getManifestObject(sProject).manifest;
						if (sManifestDynamic){
							sManifest = "/" + sManifestDynamic + ".json";
						}
						// set up test service for local testing
						jQuery.getJSON(sProject + sManifest, function(manifest) {
							MockServerLauncher.startMockServers(sProject, manifest, "application-" + sApp + "-component");
						});
					});
				}
				fixTheSandboxApps();
				// initialize the ushell sandbox component
				sap.ushell.Container.createRenderer().placeAt("content");
			});


		});
})()