sap.ui.define([
	"sap/ui/Device"
],function(
	Device
){
	"use strict";
	var oUnitTest =  {
		name: "Library 'sap.ui.comp'",
		defaults: {
			group:"Library",
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			ui5: {
				language: "en-US",
				rtl: false,
				libs: [
					"sap.ui.comp"
				],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/ui/comp"],
				branchCoverage: true
			},
			loader: {
				paths: {
					"sap/ui/comp/qunit": "test-resources/sap/ui/comp/qunit",
					"sap/ui/core/qunit": "test-resources/sap/ui/core/qunit/"
				}
			},
			autostart: false,
			module: "./../{name}.qunit"
		},
		tests: {
			"filterbar/FilterBar": {
				group: "FilterBar"
			},
			"filterbar/FilterGroupItem": {
				group: "FilterBar"
			},
			"filterbar/FilterItem": {
				group: "FilterBar"
			},
			"filterbar/VariantConverterFrom": {
				group: "FilterBar"
			},
			"filterbar/VariantConverterTo": {
				group: "FilterBar"
			},
			"qunit/navpopover/NavigationPopoverPersonalization": {
				group: "Navpopover",
				sinon: false
			},
			"qunit/navpopover/NavigationContainer": {
				group: "Navpopover"
			},
			/*
			"qunit/navpopover/ContactDetailsController": {
				group: "Navpopover"
			},
			*/
			"qunit/navpopover/NavigationPopover": {
				group: "Navpopover"
			},
			"qunit/navpopover/NavigationPopoverHandler": {
				group: "Navpopover"
			},
			"qunit/navpopover/NavigationPopoverHandlerBindingContext": {
				group: "Navpopover"
			},
			"qunit/navpopover/NavigationPopoverLog": {
				group: "Navpopover"
			},
			"qunit/navpopover/NavigationPopoverUtil": {
				group: "Navpopover"
			},
				"qunit/navpopover/SemanticObjectController": {
			group: "Navpopover"
			},
			"qunit/navpopover/SmartLink": {
				group: "Navpopover"
			},
			"qunit/navpopover/opaTests/LinkContactAnnotation.opa": {
				group: "Navpopover"
			},
			/* Test Fails for unknown reasons. Was excluded for a long time...
			"qunit/navpopover/opaTests/LinkPersonalization.opa": {
				group: "Navpopover"
			},
			*/
			"odata/CalendarMetadata": {
				group: "OData"
			},
			"odata/ChartMetadata": {
				group: "OData"
			},
			"odata/CriticalityMetadata": {
				group: "OData"
			},
			"odata/MetadataAnalyser": {
				group: "OData"
			},
			"odata/ODataType": {
				group: "OData"
			},
			"odata/SideEffects": {
				group: "OData"
			},
			"odata/type/StringDate": {
				group: "OData"
			},
			"providers/BaseValueListProvider": {
				group: "Providers"
			},
			"providers/ChartProvider": {
				group: "Providers"
			},
			"providers/ControlProvider": {
				group: "Providers"
			},
			"providers/TableProvider": {
				group: "Providers"
			},
			"providers/ValueHelpProvider": {
				group: "Providers"
			},
			"providers/ValueListProvider": {
				group: "Providers"
			},
			"smartchart/SmartChart": {
				group: "SmartChart"
			},
			"qunit/smartfield/AnnotationHelper": {
				group: "SmartField"
			},
			"qunit/smartfield/BindingUtil": {
				group: "SmartField"
			},
			"qunit/smartfield/ControlFactoryBase": {
				group: "SmartField"
			},
			"qunit/smartfield/Currency": {
				group: "SmartField"
			},
			"qunit/smartfield/FieldControl": {
				group: "SmartField"
			},
			"qunit/smartfield/JSONControlFactory": {
				group: "SmartField"
			},
			"qunit/smartfield/JSONTypes": {
				group: "SmartField"
			},
			"qunit/smartfield/ODataControlFactory": {
				group: "SmartField"
			},
			"qunit/smartfield/ODataHelper": {
				group: "SmartField",
				autostart: true
			},
			"qunit/smartfield/ODataTypes": {
				group: "SmartField"
			},
			"qunit/smartfield/SideEffectUtil": {
				group: "SmartField"
			},
			"qunit/smartfield/SmartField": {
				group: "SmartField"
			},
			"qunit/smartfield/SmartLabel": {
				group: "SmartField"
			},
			"qunit/smartfield/TextArrangementGuid": {
				group: "SmartField"
			},
			"qunit/smartfield/TextArrangementString": {
				group: "SmartField"
			},
			"qunit/smartfield/Types": {
				group: "SmartField"
			},
			"smartfilterbar/AdditionalConfigurationHelper": {
				group: "SmartFilterBar"
			},
			"smartfilterbar/ControlConfiguration": {
				group: "SmartFilterBar"
			},
			"smartfilterbar/FilterProvider": {
				group: "SmartFilterBar"
			},
			"smartfilterbar/GroupConfiguration": {
				group: "SmartFilterBar"
			},
			"smartfilterbar/SelectOption": {
				group: "SmartFilterBar"
			},
			"smartfilterbar/SmartFilterBar": {
				group: "SmartFilterBar"
			},
			"variants/EditableVariantItem": {
				group: "Variants"
			},
			"variants/VariantItem": {
				group: "Variants"
			},
			"variants/VariantManagement": {
				group: "Variants"
			},
			"ExploredSamples": {
				group: "ExploredSamples",
				module: "./ExploredSamples.qunit", //overwrite default --> different folder layer
				autostart: false
			},
			"valuehelpdialog/ItemsCollection": {
				group: "ValueHelpDialog"
			},
			"valuehelpdialog/ValueHelpDialog": {
				group: "ValueHelpDialog"
			},
			"smarttable/SmartTable": {
				group: "SmartTable"
			},
			"smartlist/SmartList": {
				group: "SmartList"
			},
			"state/UIState": {
				group: "state",
				autostart: true
			},
			"qunit/smartvariants/PersonalizableInfo": {
				group: "SmartVariants"
			},
			"qunit/smartvariants/SmartVariantManagement": {
				group: "SmartVariants"
			},
			"qunit/smartvariants/SmartVariantManagementUi2": {
				group: "SmartVariants"
			},
			"Group": {
				group: "SmartForm",
				module: "./smartform/Group.qunit",
				autostart: true
			},
			"GroupElement": {
				group: "SmartForm",
				module: "./smartform/GroupElement.qunit",
				autostart: true
			},
			"SmartForm": {
				group: "SmartForm",
				module: "./smartform/SmartForm.qunit",
				autostart: true
			},
			"AddGroupElementAndRenameGroupElement": {
				group: "SmartForm",
				module: "./smartform/flexibility/AddGroupElementAndRenameGroupElement.qunit",
				autostart: true,
				sinon: false,
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4" // Force MockServer to work with sinon-4
						}
					}
				}
			},
			"CombineSplitGroupElement": {
				group: "SmartForm",
				module: "./smartform/flexibility/CombineSplitGroupElement.qunit",
				autostart: true,
				sinon: false,
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4" // Force MockServer to work with sinon-4
						}
					}
				}
			},
			"CreateAndRenameGroup": {
				group: "SmartForm",
				module: "./smartform/flexibility/CreateAndRenameGroup.qunit",
				sinon: false
			},
			"GroupElementFlexibility": {
				group: "SmartForm",
				module: "./smartform/flexibility/GroupElementFlexibility.qunit"
			},
			"MoveAndRemoveGroup": {
				group: "SmartForm",
				module: "./smartform/flexibility/MoveAndRemoveGroup.qunit",
				sinon: false
			},
			"MoveAndRemoveGroupElement": {
				group: "SmartForm",
				module: "./smartform/flexibility/MoveAndRemoveGroupElement.qunit",
				sinon: false
			},
			"RenameTitle": {
				group: "SmartForm",
				module: "./smartform/flexibility/RenameTitle.qunit",
				autostart: true
			},
			"RevealGroupElement": {
				group: "SmartForm",
				module: "./smartform/flexibility/RevealGroupElement.qunit",
				sinon: false
			},
			"Designtime": {
				group: "DesignTime",
				module: "./designtime/Designtime.qunit"
			},
			"Library": {
				group: "DesignTime",
				module: "./designtime/Library.qunit",
				sinon: false,
				autostart: true
			},
			"config/condition/DateRangeType": {
				group: "Condition"
			},
			"Personalization": {
				group: "Personalization Testsuite",
				page: "test-resources/sap/ui/comp/qunit/personalization/testsuite.personalization.qunit.html" //TBD: Move Personalization to the new approach
			},
			"util/MultiCurrencyUtil": {
				skip: Device.system.phone,
				group: "Util"
			},
			"Interval": {
				group: "Type",
				module: "./type/Interval.qunit",
				sinon: false,
				autostart: true,
				coverage: {
				  only: "[sap/ui/comp/type]"
				}
			 }
		}
	};

	return oUnitTest;
});
