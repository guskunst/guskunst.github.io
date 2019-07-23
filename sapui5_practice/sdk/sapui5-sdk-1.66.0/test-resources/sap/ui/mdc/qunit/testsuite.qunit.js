sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	return {
		name: "Library 'sap.ui.mdc'", /* Just for a nice title on the pages */
		defaults: {
			group: "Library",
			qunit: {
				version: 2
			// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4
			// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false, // Whether to run the tests in RTL mode
				libs: [
					"sap.ui.mdc"
				], // Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true
			// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]", // Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true
			// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true,
			module: "./{name}.qunit"
		// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			"BoolFieldHelp": {
				group: "Base",
				module: "./base/BoolFieldHelp.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				sinon: false
			},
			"ConditionModel": {
				group: "Base",
				module: "./base/ConditionModel.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				sinon: false
			},
			"ConditionType": {
				group: "Base",
				module: "./base/ConditionType.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				}
			},
			"ConditionsType": {
				group: "Base",
				module: "./base/ConditionsType.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				sinon: false
			},
			"DefineConditionPanel": {
				group: "Base",
				module: "./base/DefineConditionPanel.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				sinon: true
			},
			"Field": {
				group: "Base",
				module: "./base/Field.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				}
			},
			"FieldBase": {
				group: "Base",
				module: "./base/FieldBase.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				sinon: true
			},
			"FieldHelp": {
				group: "Base",
				module: "./base/FieldHelp.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				ui5: {
					animationMode: "none"
				},
				sinon: false
			},
			"FieldInfoBase": {
				group: "Base",
				module: "./base/FieldInfoBase.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				}
			},
			"FieldInfo": {
				group: "Base",
				module: "./base/FieldInfo.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				sinon: false
			},
			"FieldValueHelp": {
				group: "Base",
				module: "./base/FieldValueHelp.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				ui5: {
					animationMode: "none"
				}
			},
			"FieldValueHelpMTableWrapper": {
				group: "Base",
				module: "./base/FieldValueHelpMTableWrapper.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				ui5: {
					animationMode: "none"
				},
				sinon: false
			},
			"FilterField": {
				group: "Base",
				module: "./base/FilterField.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				sinon: false
			},
			"FilterOperatorConfig": {
				group: "Base",
				module: "./base/FilterOperatorConfig.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				sinon: false
			},
			"ListFieldHelp": {
				group: "Base",
				module: "./base/ListFieldHelp.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				},
				sinon: false
			},
			"ValueHelpPanel": {
				group: "Base",
				module: "./base/ValueHelpPanel.qunit",
				coverage: {
					only: "[sap/ui/mdc/base]"
				}
			},
			"ActionToolbar": {
				group: "Base",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./base/ActionToolbar.qunit"
			},
			"NamedBindingModel": {
				title: "NamedBindingModel",
				group: "Experimental",
				page: "test-resources/sap/ui/mdc/qunit/experimental/NamedBindingModel.qunit.html" // TBD: use teststarter if possible
			},

			"TemplateUtil": {
				title: "TemplateUtil",
				group: "Util",
				page: "test-resources/sap/ui/mdc/qunit/util/TemplateUtil.qunit.html" // TBD: use teststarter if possible
			},

			"FlpLinkHandler Testsuite": {
				title: "FlpLinkHandler Testsuite",
				group: "Testsuite",
				page: "test-resources/sap/ui/mdc/qunit/flplinkhandler/testsuite.flplinkhandler.qunit.html"
			},

			"Table": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/Table.qunit"
			},
			"Column": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/Column.qunit"
			},
			"CreationRow": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/CreationRow.qunit"
			},
			"TableFlex": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/TableFlex.qunit"
			},
			"Chart": {
				group: "Chart",
				module: "./chart/Chart.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"ChartFlex": {
				group: "Chart",
				module: "./chart/ChartFlex.qunit",
				loader: {
					paths: {
						"sap/ui/mdc/qunit/chart/Helper": "test-resources/sap/ui/mdc/qunit/chart/Helper"
					}
				},
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				},
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]"
				}
			},
			"PersonalizationChart": {
				group: "Chart",
				module: "./personalization/OpaTests/PersonalizationChart.opa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"PersonalizationChartVariants": {
				group: "Chart",
				module: "./personalization/OpaTests/PersonalizationChartVariants.opa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			//opa test 'PersonalizationTable' is currently using a service that might be unstable
			/*"PersonalizationTable": {
				group: "Table",
				module: "./personalization/OpaTests/PersonalizationTable.opa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},*/
			"FilterBar": {
				group: "FilterBar",
				module: "./base/filterbar/FilterBar.qunit"
			},
			"ChartDelegate": {
				group: "odata.v4",
				module: "./odata/v4/ChartDelegate.qunit"
			},
			"FormHelper": {
				group: "odata.v4",
				module: "./odata/v4/FormHelper.qunit"
			},
			"FieldHelper": {
				group: "odata.v4",
				module: "./odata/v4/FieldHelper.qunit"
			},
			"StableIdHelper": {
				group: "odata.v4",
				module: "./odata/v4/StableIdHelper.qunit"
			},
			"TableHelper": {
				group: "odata.v4",
				module: "./odata/v4/TableHelper.qunit"
			},
			"TableRuntime": {
				group: "odata.v4",
				module: "./odata/v4/TableRuntime.qunit"
			},
			"ValueHelpTemplating": {
				group: "odata.v4",
				module: "./odata/v4/ValueHelpTemplating.qunit",
				autostart: false,
				skip: Device.browser.internet_explorer
			},
			"ExploredSamples": {
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				sinon: {
					version: 4
				// MockServer dependencies are overrules by loader config above
				},
				ui5: {
					libs: [
						"sap.ui.mdc", "sap.ui.documentation", "sap.ui.layout", "sap.m"
					],
					"xx-componentPreload": "off"
				},
				autostart: false
			},

			// Design Time & RTA Enabling
			"Designtime-Library": {
				group: "Designtime",
				module: "./designtime/Library.qunit"
			}
		}
	};

});
