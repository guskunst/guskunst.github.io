sap.ui.define(["sap/suite/ui/generic/template/js/AnnotationHelper"],
	function (AnnotationHelper) {
		module("Test methods to check funtion getPresentationVariant", {

			setup: function () {
				this.oAnnotationHelper = AnnotationHelper;
			},

			teardown: function () {
				this.oAnnotationHelper = null;
			},

			oPresentationVariant: {
				Visualizations: [],
				SortOrder: []
			},

			oSPVariantWithInlinePresentationVariant: {
				SelectionVariant: {},
				PresentationVariant: {
					Visualizations: [],
					SortOrder: []
				}
			},

			oSPVariantReferencingPresentationVariant: {
				SelectionVariant: {},
				PresentationVariant: {
					Path: "@UI.PresentationVariant#SomeQualifier"
				}
			},

			oSPVariantWithoutPresentationVariant: {
				SelectionVariant: {}
			}
		});

		test("Test getPresentationVariant for a PresentationVariant", function () {
			var oAnnotationHelper = this.oAnnotationHelper;

			var oVariant = this.oPresentationVariant;
			var oEntityType = {};
			var oResult = oAnnotationHelper.getPresentationVariant(oVariant, oEntityType);
			var oExpectedResult = this.oPresentationVariant;
			equals(oResult, oExpectedResult, "Expected value is: " + oExpectedResult);
		});

		test("Test getPresentationVariant for a SelectionPresentationVariant with an inner PresentationVariant", function () {
			var oAnnotationHelper = this.oAnnotationHelper;

			var oVariant = this.oSPVariantWithInlinePresentationVariant;
			var oEntityType = {};
			var oResult = oAnnotationHelper.getPresentationVariant(oVariant, oEntityType);
			var oExpectedResult = this.oSPVariantWithInlinePresentationVariant.PresentationVariant;
			equals(oResult, oExpectedResult, "Expected value is: " + oExpectedResult);
		});

		test("Test getPresentationVariant for a SelectionPresentationVariant referencing a PresentationVariant", function () {
			var oAnnotationHelper = this.oAnnotationHelper;

			var oVariant = this.oSPVariantReferencingPresentationVariant;
			var oEntityType = {
				"UI.PresentationVariant#SomeQualifier": {
					Visualizations: "UI.LineItem#SomeQualifier"
				}
			};
			var oResult = oAnnotationHelper.getPresentationVariant(oVariant, oEntityType);
			var oExpectedResult = oEntityType["UI.PresentationVariant#SomeQualifier"];
			equals(oResult, oExpectedResult, "Expected value is: " + oExpectedResult);
		});

		test("Test getPresentationVariant for a SelectionPresentationVariant without a PresentationVariant", function () {
			var oAnnotationHelper = this.oAnnotationHelper;

			var oVariant = this.oSPVariantWithoutPresentationVariant;
			var oEntityType = {};
			var oResult = oAnnotationHelper.getPresentationVariant(oVariant, oEntityType);
			var oExpectedResult = undefined;
			equals(oResult, oExpectedResult, "Expected value is: " + oExpectedResult);
		});
});
