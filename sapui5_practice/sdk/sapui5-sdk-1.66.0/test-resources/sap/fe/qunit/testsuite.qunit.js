sap.ui.define(['sap/ui/Device'], function (Device) {

	"use strict";
	//When not in the right test environment, mockserver dependent tests must be skipped
	var notInTestsuite = location.pathname.indexOf('/testsuite') !== 0;

	return {
		name: "QUnit TestSuite for sap.fe (runs only under /testsuite)",
		defaults: {
			ui5: {
				noConflict: true,
				theme: "sap_belize"
			},
			sinon: false,
			loader: {
				paths: {
					tests: "test-resources/sap/fe/qunit",
					qunit: "test-resources/sap/fe/qunit"
				}
			},
			bootCore: true,
			qunit: {
				version: 1
			}
		},
		tests: {
			"2_AppComponent_Qunits": {
				sinon: {
					version: "edge"
				},
				module: "test-resources/sap/fe/internal/qunit/AppComponent.qunit",
				title: "sap.fe.AppComponent Unit Tests",
				skip: notInTestsuite
			},
			"0_MockServerTest": {
				module: "test-resources/sap/fe/internal/qunit/MockServerTest.qunit",
				title: "MockServer Smoke Tests",
				skip: notInTestsuite
			},
			"1_DraftModel": {
				module: "test-resources/sap/fe/internal/qunit/model/DraftModel.qunit",
				title: "sap.fe.model.DraftModel - Unit Tests",
				skip: notInTestsuite
			},
			"30_OPAMusic": {
				module: "test-resources/sap/fe/internal/integrations/Music/AllJourneys.qunit",
				title: "Opa tests for sap.fe Music",
				skip: notInTestsuite
			},
			"40_OPAIteloDraftBackend": {
				module: "test-resources/sap/fe/internal/integrations/Itelo/DraftJourneys.qunit",
				title: "Opa tests for sap.fe Draft against nodejs simplified itelo (you can use url parameter useBackendUrl to point to a system)",
				skip: notInTestsuite
			},
			"4_AnnotationHelperOP": {
				module: "test-resources/sap/fe/internal/qunit/AnnotationHelperOP.qunit",
				title: "sap.fe.templates.ObjectPage.AnnotationHelper - Unit Tests",
				skip: notInTestsuite
			},
			"5_MessagePopOver":{
				module:"test-resources/sap/fe/internal/qunit/messagePopover/MessagePopover.quint",
				title:"sap.fe.messagePopover - Unit Tests",
				skip: notInTestsuite
			},
			"6_TemplatingExpressions":{
				sinon: {
					version: "edge"
				},
				module: "test-resources/sap/fe/qunit/TemplatingExpressions.qunit",
				title: "sap.fe - Templating Expressions Unit Tests",
				autostart: false,
				skip: Device.browser.internet_explorer
			},
			"7_BusyHelper":{
				module:"test-resources/sap/fe/internal/qunit/BusyHelper.qunit",
				title:"sap.fe.BusyHelper - Unit Tests",
				skip: notInTestsuite
			},
			"8_MessageHandling":{
				sinon: {
					version: "edge"
				},
				module:"test-resources/sap/fe/internal/qunit/MessageHandling.qunit",
				title:"Message Handling - Unit Tests",
				skip: notInTestsuite
			},
			"9_Routing":{
				sinon: {
					version: "edge"
				},
				module:"test-resources/sap/fe/internal/qunit/Routing.qunit",
				title:"Routing - Unit Tests",
				skip: notInTestsuite
			},
			"x_DraftModelCompatibility": {
				module: "test-resources/sap/fe/internal/qunit/model/DraftModelCompatibility.qunit",
				title: "sap.fe.model.DraftModel Compatibilty Tests",
				skip: true
			},
			"xi_AnnotationHelper_Qunits": {
				sinon: {
					version: "edge"
				},
				module: "test-resources/sap/fe/internal/qunit/AnnotationHelper.qunit",
				title: "sap.fe.AnnotationHelper Unit Tests",
				skip: notInTestsuite
			}
		}
	};
});