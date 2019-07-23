/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2017 SAP SE. All rights reserved
 */
/* global sap, jQuery */

sap.ui.define('sap.apf.newDemokit.runtime.Component', [
		'sap/apf/demokit/mockserver',
		'sap/apf/base/Component',
		'sap/ui/fl/FakeLrepConnectorLocalStorage',
		'sap/apf/demokit/configuration/demokit',
		'sap/apf/demokit/configuration/demokitHierarchy',
		'sap/apf/demokit/configuration/demokitSFB'
	],
	function(MockServer, BaseComponent, fakeLrepConnector, StandardConfig, SFBConfig, HierarchyConfig) {
		'use strict';

		var _mockServer = new MockServer("../../../../../resources/sap/apf/demokit/");

		BaseComponent.extend("sap.apf.newDemokit.runtime.Component", {
			oApi: null,
			metadata: {
				"manifest": "json"
			},
			/**
			 * Initialize the application
			 */
			init: function() {
				fakeLrepConnector.enableFakeConnector();
				_mockServer.mockRuntimeService([StandardConfig, SFBConfig, HierarchyConfig]);
				_mockServer.mockDemokitService();
				_mockServer.mockHierarchyService();
				BaseComponent.prototype.init.apply(this, arguments);
			},
			/**
			 * Creates the application layout and returns the outer layout of APF
			 * @returns
			 */
			createContent: function() {
				return BaseComponent.prototype.createContent.apply(this, arguments);
			},
			destroy: function() {
				BaseComponent.prototype.destroy.apply(this, arguments);
			}
		});
	});
