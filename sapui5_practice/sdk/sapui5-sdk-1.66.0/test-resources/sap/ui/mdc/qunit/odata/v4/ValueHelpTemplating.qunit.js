/* global QUnit sap */
sap.ui.define(
	[
		'sap/ui/model/resource/ResourceModel',
		"sap/ui/model/json/JSONModel",
		"./TemplatingTestUtils",
		"./metadata/simpleMetadata"
		/* All controls that must be loaded for the tests */

	],
	function (ResourceModel, JSONModel, TemplatingTestUtils, simpleMetadata) {
		"use strict";

		var oResourceModel = new ResourceModel({ bundleName: "sap.ui.mdc.messagebundle", async: true });

		oResourceModel._oPromise.then(function() {
			/* Define all fragment tests in this array */
			var aSimpleMetadataFragmentTests = [
				{
					sFragmentName: "sap.ui.mdc.odata.v4.ValueHelp",
					mModels: {
						"sap.ui.mdc.i18n": oResourceModel,
						//For macro fragements we need to simulate the this model
						"this": new JSONModel({
							"idPrefix": "somePrefix"
						})
					},
					/* tests is an array as you may test the same expression against different annotation examples */
					tests: [
						{
							mBindingContexts: {
								//Currently needs a DataField.Value for PropertyQuatity -> PropertyUnit via @Unit
								//TODO need to get that working with property, propertyPath, and so on
								"property": "/someEntitySet/@com.sap.vocabularies.UI.v1.LineItem/0/Value",
								"entitySet": "/someEntitySet"
							},
							oExpectedResultsPerTest: {
								"a": {
									"id": "somePrefix::PropertyUnit",
									"open": "sap.ui.mdc.odata.v4.ValueListHelper.showValueListInfo('/someEntitySet/PropertyUnit',${$source>},${$parameters>/suggestion},''))"
								}
							}
						},
						{
							mBindingContexts: {
								//Currently needs a DataField.Value for PropertyUnit
								"property": "/someEntitySet/@com.sap.vocabularies.UI.v1.LineItem/1/Value",
								"entitySet": "/someEntitySet"
							},
							oExpectedResultsPerTest: {
								"a": {
									"id": "somePrefix::PropertyUnit",
									"open": "sap.ui.mdc.odata.v4.ValueListHelper.showValueListInfo('/someEntitySet/PropertyUnit',${$source>},${$parameters>/suggestion},''))"
								}
							}
						},
						{
							mBindingContexts: {
								"property": "/someEntitySet/@com.sap.vocabularies.UI.v1.LineItem/2/Value",
								"entitySet": "/someEntitySet"
							},
							oExpectedResultsPerTest: {
								"a": {
									"id": "somePrefix::PropertyCurrency",
									"open": "sap.ui.mdc.odata.v4.ValueListHelper.showValueListInfo('/someEntitySet/PropertyCurrency',${$source>},${$parameters>/suggestion},''))"
								}
							}
						},
						{
							mBindingContexts: {
								"property": "/someEntitySet/@com.sap.vocabularies.UI.v1.LineItem/3/Value",
								"entitySet": "/someEntitySet"
							},
							oExpectedResultsPerTest: {
								"a": {
									"id": "somePrefix::PropertyCurrency",
									"open": "sap.ui.mdc.odata.v4.ValueListHelper.showValueListInfo('/someEntitySet/PropertyCurrency',${$source>},${$parameters>/suggestion},''))"
								}
							}
						}
					]
				}
			];

			TemplatingTestUtils.testFragments(QUnit, "Value Help Fragment with Simple Metadata", simpleMetadata, aSimpleMetadataFragmentTests);

			QUnit.start();
		});

	}
);

