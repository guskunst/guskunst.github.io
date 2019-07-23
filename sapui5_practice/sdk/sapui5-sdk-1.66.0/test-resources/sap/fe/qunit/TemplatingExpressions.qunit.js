/* global QUnit sap */
sap.ui.define(
	[
		'sap/ui/model/resource/ResourceModel',
		"./TemplatingTestUtils",
		"./test/simpleMetadata",
		"./test/iteloMetadata",
		"./test/musicDraftMetadata",
		/* All controls that must be loaded for the tests */
		'sap/m/RatingIndicator'
	],
	function (ResourceModel, TemplatingTestUtils, simpleMetadata, iteloMetadata, musicDraftMetadata) {
		"use strict";

		var oResourceModel = new ResourceModel({ bundleName: "sap.fe.messagebundle", async: true });

		oResourceModel._oPromise.then(function() {
			/* Define all fragment tests in this array */
			var aSimpleMetadataFragmentTests = [
				{
					sFragmentName: "sap.fe.templates.ObjectPage.view.fragments.HeaderRatingIndicator",
					mModels: {
						"sap.fe.i18n": oResourceModel
					},
					/* tests is an array as you may test the same expression against different annotation examples */
					tests: [
						{
							mBindingContexts: {
								"dataPoint": "/someEntitySet/@com.sap.vocabularies.UI.v1.DataPoint#noTargetValue"
							},
							oExpectedResultsPerTest: {
								"a": {
									"text": "{PropertyInt16} out of 5"
								}
							}
						},
						{
							mBindingContexts: {
								"dataPoint": "/someEntitySet/@com.sap.vocabularies.UI.v1.DataPoint#withTargetValueStatic"
							},
							oExpectedResultsPerTest: {
								"a": {
									"text": "{PropertyInt16} out of 5"
								}
							}
						},
						{
							mBindingContexts: {
								"dataPoint": "/someEntitySet/@com.sap.vocabularies.UI.v1.DataPoint#withTargetValueDynamic"
							},
							oExpectedResultsPerTest: {
								"a": {
									"text": "{PropertyInt16} out of {PropertyInt32}"
								}
							}
						}
					]
				},
				{
					sFragmentName: "sap.fe.templates.ObjectPage.view.fragments.HeaderProgressIndicator",
					mModels: {
						"sap.fe.i18n": oResourceModel
					},
					tests: [
						{
							mBindingContexts: {
								"dataPoint": "/someEntitySet/@com.sap.vocabularies.UI.v1.DataPoint#HelpfulCount"
							},
							oExpectedResultsPerTest: {
								"a": {
									"displayValue": "{PropertyInt16} of {PropertyInt32}",
									"percentValue": "{= ((${PropertyInt32} > 0) ? ((${PropertyInt16} > ${PropertyInt32}) ? 100 : ((${PropertyInt16} < 0) ? 0 : (${PropertyInt16} / ${PropertyInt32} * 100))) : 0) }"
								},
								"b": {
									"text": "Property of Type Int16"
								}
							}
						},
						{
							mBindingContexts: {
								"dataPoint": "/someEntitySet/@com.sap.vocabularies.UI.v1.DataPoint#HelpfulTotal"
							},
							oExpectedResultsPerTest: {
								"a": {
									"displayValue": "{PropertyInt16} of {PropertyInt32}",
									"percentValue": "{= ((${PropertyInt32} > 0) ? ((${PropertyInt16} > ${PropertyInt32}) ? 100 : ((${PropertyInt16} < 0) ? 0 : (${PropertyInt16} / ${PropertyInt32} * 100))) : 0) }"
								},
								"b": {
									"text": "Property of Type Int16"
								}
							}
						}
					]
				},
				{
					sFragmentName: "sap.fe.controls.ViewSwitchContainer.Table",
					mModels: {
						"sap.fe.i18n": oResourceModel
					},
					tests: [
						{
							// TEST: With delete restriction & no LineItem conatining a DataFieldForAction/DataFieldForIntentBasedNavigation
							mBindingContexts: {
								collection: "/deleteRestrictedEntitySet",
								visualizationPath: "/deleteRestrictedEntitySet/@com.sap.vocabularies.UI.v1.LineItem"
							},
							oExpectedResultsPerTest: {
								"TablePropertyExpressionTest": {
									"selectionMode": "None"
								}
							}
						},
						{
							// TEST: Without delete restriction to check selection mode for LR Table
							mBindingContexts: {
								collection: "/deleteNotRestrictedEntitySet",
								visualizationPath: "/deleteRestrictedEntitySet/@com.sap.vocabularies.UI.v1.LineItem",
								targetCollection: "/deleteNotRestrictedEntitySet"
							},
							oExpectedResultsPerTest: {
								"TablePropertyExpressionTest": {
									"selectionMode": "Multi"
								}
							}
						},
						{
							// TEST: With delete restriction & LineItem conatining a dataFieldForAction
							mBindingContexts: {
								collection: "/dataFieldForActionEntitySet/someNamespace.dataFieldForActionEntityType",
								visualizationPath: "/dataFieldForActionEntitySet/@com.sap.vocabularies.UI.v1.LineItem"
							},
							oExpectedResultsPerTest: {
								"TablePropertyExpressionTest": {
									"selectionMode": "{= ${ui>/editable} === 'Editable' ? 'Multi' : 'None'}"
								}
							}
						},
						{
							// TEST: With delete restriction & LineItem conatining a DataFieldForIntentBasedNavigation
							mBindingContexts: {
								collection: "/dataFieldForIntentBasedNavigationSet/someNamespace.dataFieldForIntentBasedNavigationType",
								visualizationPath: "/dataFieldForIntentBasedNavigationSet/@com.sap.vocabularies.UI.v1.LineItem"
							},
							oExpectedResultsPerTest: {
								"TablePropertyExpressionTest": {
									"selectionMode": "{= ${ui>/editable} === 'Editable' ? 'Multi' : 'None'}"
								}
							}
						},
						{
							// TEST: Without delete restriction
							mBindingContexts: {
								collection: "/someEntitySet/someNamespace.someEntityType",
								visualizationPath: "/someEntitySet/@com.sap.vocabularies.UI.v1.LineItem"
							},
							oExpectedResultsPerTest: {
								"TablePropertyExpressionTest": {
									"selectionMode": "{= ${ui>/editable} === 'Editable' ? 'Multi' : 'None'}"
								}
							}
						}
					]
				}
			];

			TemplatingTestUtils.testFragments("Simple Metadata", simpleMetadata, aSimpleMetadataFragmentTests);

			var aIteloFragmentTests = [
				{
					sFragmentName: "sap.fe.templates.ObjectPage.view.fragments.HeaderRatingIndicator",
					mModels: {
						"sap.fe.i18n": oResourceModel
					},
					/* tests is an array as you may test the same expression against different annotation examples */
					tests: [
						{
							mBindingContexts: {
								"dataPoint": "/Products/@com.sap.vocabularies.UI.v1.DataPoint#averageRating"
							},
							oExpectedResultsPerTest: {
								"a": {
									"text": "{averageRating} out of 5"
								}
							}
						}
					]
				}
			];

			TemplatingTestUtils.testFragments("Itelo Metadata", iteloMetadata, aIteloFragmentTests);

			QUnit.start();
		});

	}
);