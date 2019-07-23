/*** List Report assertions ***/
sap.ui.define(
	["sap/ui/test/matchers/PropertyStrictEquals", 
	 "sap/ui/test/matchers/AggregationFilled"],

	function (PropertyStrictEquals, AggregationFilled) {

	return function (prefix, viewName, viewNamespace) {

		return {
			/* your local ListReport assertions (OPA tests) */


			/**
			* Check for the visibility of the result chart
			*
			* @throws {Error} Throws an error if the SmartChart could not be found
			* @public
			*/
			theResultChartIsVisible: function() {
				return this.waitFor({
					controlType: "sap.ui.comp.smartchart.SmartChart",
					success: function() {
						QUnit.ok(true, "The result Smart Chart is shown correctly on the List Report tab");
					},
					errorMessage: "The SmartChart couldn´t be found on the List Report tab"
				});
			},

			/**
			 * Check if the custom Data for Chart in the second tab is set correctly
			 */
			theCustomDataIsSetForChart: function() {
				var aCustomData;
				return this.waitFor({
					controlType: "sap.ui.comp.smartchart.SmartChart",
					check: function(aNodes) {
						if (aNodes[0].getId().indexOf("tab2") > 0) {
							return true;
						} else {
							return false;
						}
					},
					success: function(aNodes) {
						aCustomData = aNodes[0].getCustomData();
						for (var i in aCustomData) {
							if (aCustomData[i].getProperty("key") === "presentationVariantQualifier") {
								QUnit.strictEqual(aCustomData[i].getProperty("value"), "Chart1", "presentationVariantQualifier is set correctly");
							} else if (aCustomData[i].getProperty("key") === "chartQualifier") {
								QUnit.strictEqual(aCustomData[i].getProperty("value"), "Chart1", "chartQualifier is set correctly");
							} else if (aCustomData[i].getProperty("key") === "variantAnnotationPath") {
								QUnit.strictEqual(aCustomData[i].getProperty("value"), "com.sap.vocabularies.UI.v1.SelectionPresentationVariant#Chart1", "variantAnnotationPath is set correctly");
							} else if (aCustomData[i].getProperty("key") === "text") {
								QUnit.strictEqual(aCustomData[i].getProperty("value"), "Chart1", "text is set correctly");
							}
						}
					},
					errorMessage: "The SmartChart with Id containing 'tab2' could not be found "
				});
			}
		}
	};
});
