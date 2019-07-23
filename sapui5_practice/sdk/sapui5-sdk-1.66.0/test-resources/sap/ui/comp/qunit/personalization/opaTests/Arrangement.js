/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/FakeLrepLocalStorage"

], function(
	Opa5,
	FakeLrepConnectorLocalStorage,
	FakeLrepLocalStorage
) {
	"use strict";

	return Opa5.extend("sap.ui.comp.qunit.personalization.test.Arrangement", {
		closeAllNavigationPopovers: function() {
			return this.waitFor({
				controlType: "sap.ui.comp.navpopover.NavigationPopover",
				success: function(aNavigationPopovers) {
					aNavigationPopovers.forEach(function(oNavigationPopover) {
						oNavigationPopover.close();
					});
					return this.waitFor({
						check: function() {
							return !Opa5.getPlugin().getMatchingControls({
								controlType: "sap.m.Popover",
								visible: true,
								interactable: true
							}).length;
						}
					});
				}
			});
		},

		iEnableTheLocalLRep: function() {
			// Init LRep for VariantManagement (we have to fake the connection to LRep in order to be independent from backend)
			FakeLrepConnectorLocalStorage.enableFakeConnector();
			FakeLrepLocalStorage.deleteChanges();
		},

		iClearTheLocalStorageFromRtaRestart: function() {
			window.localStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
			window.localStorage.removeItem("sap.ui.rta.restart.USER");
		}
	});

}, true);
