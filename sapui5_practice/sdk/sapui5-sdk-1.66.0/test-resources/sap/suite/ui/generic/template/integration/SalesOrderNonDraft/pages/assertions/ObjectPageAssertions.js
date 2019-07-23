/*** Object Page assertions ***/
sap.ui.define(
	["sap/ui/test/matchers/PropertyStrictEquals", "sap/ui/test/matchers/AggregationFilled"],

	function (PropertyStrictEquals, AggregationFilled) {

	return function (prefix, viewName, viewNamespace) {

		return {
			/************************************************
			 NAVIGATION ASSERTIONS
			 *************************************************/
			thePageShouldContainTheCorrectTitle: function(sTitle) {
				//oManifestJSONModel = OpaManifest.demokit["sample.stta.sales.order.nd"];
				return this.waitFor({
					id: prefix + "objectTypeName",
					matchers: new PropertyStrictEquals({
						name: "text",
//						value: entityType["com.sap.vocabularies.UI.v1.HeaderInfo"].TypeName.String
						value: sTitle
					}),
					success: function() {
						ok(true, "The Object Page Title is correct");
					},
					errorMessage: "The Object Page Title is not rendered correctly"
				});
			},
			
			theHeaderActionButtOnObjectPageIsPresent: function (sButtonText) {
				return this.waitFor({
					controlType: "sap.uxap.ObjectPageHeader",
					autoWait: false,
					success: function (aControl) {
						var aActions = aControl[0].getActions();
						for (var i = 0; i < aActions.length; i++) {
							var sId = aActions[i].getId();
							if (sId.indexOf(sButtonText) !== -1) {
								ok(true,""+ sButtonText +" button is present in the header of Object Page");
							}
						}
					},
					errorMessage: ""+ sButtonText +" button is not present in the header of Object Page"
				});
			},
			
			
			thePageShouldBeInEditMode: function() {
				return this.waitFor({
					controlType: "sap.uxap.ObjectPageLayout",
					viewName: viewName,
					viewNamespace: viewNamespace,
					matchers:[
						function(oControl) {
							return (oControl.getModel("ui").getData().editable);
						}],
					success: function() {
						ok(true, "The Object Page is in Edit mode");
					},
					errorMessage: "The Object Page is not rendered"
				});
			},

			theReuseComponentGroupTitleisSeen: function(groupTitle) {
				return this.waitFor({
						controlType: "sap.uxap.ObjectPageSection",
						check: function (oView) {
							var bSuccess = false;
							for (var i = 0; i < oView.length; i++) {
								if (oView[i].getTitle() === groupTitle){
									bSuccess = true;
									return bSuccess;
								}
							}
							return bSuccess;
						},
						success: function(){
							ok("Reuse Component with Group Title is seen.")
						},
						errorMessage: "Reuse Component with Group Title is seen."
					});
			},

			theReuseComponentIsSubSectionOfAnnotatedSection: function(reuseTitle) {
				return this.waitFor({
						controlType: "sap.uxap.ObjectPageSection",
						check: function (oView) {
							var bSuccess = false;
							for (var i = 0; i < oView[0].getSubSections().length; i++) {
								if (oView[0].getSubSections()[i].getTitle() === reuseTitle){
									bSuccess = true;
									return bSuccess;
								}
							}
							return bSuccess;
						},
						success: function(){
							ok("Reuse Component is grouped under annotated section.")
						},
						errorMessage: "Reuse Component is not grouped under annotated section."
					});
			},
			theReuseComponentSectionsGrouped: function(reuseTitle1,reuseTitle2,groupTitle) {
				return this.waitFor({
						controlType: "sap.uxap.ObjectPageSection",
						check: function (oView) {
							var bSuccess = false;
							for (var i = 0; i < oView.length; i++) {
								if (oView[i].getTitle() === groupTitle){
									var reuseSubSections = oView[i].getSubSections();
									if (reuseSubSections[0].getTitle() === reuseTitle1 && reuseSubSections[1].getTitle() === reuseTitle2){
										bSuccess = true;
										return bSuccess;
									}			
								}	
							}
							return bSuccess;
						},
						success: function(){
							ok("Reuse Component with Group Title is seen.")
						},
						errorMessage: "Reuse Component with Group Title is seen."
					});
			},
			thePageContextShouldBeCorrect: function() {
				return this.waitFor({
					controlType: "sap.uxap.ObjectPageLayout",
					viewName: viewName,
					viewNamespace: viewNamespace,
					autoWait: true,
					success: function(oControl) {
						debugger;
						var sControlPath = oControl[0].getBindingContext().getPath();
						var sOPEntitySet = sControlPath.split("(")[0].split("/")[1];
						var sEntitySet1 = "C_STTA_SO_BPAContact";
						QUnit.strictEqual(sOPEntitySet, sEntitySet1, "Navigated to correct OP in 'Create' mode");
					},
					errorMessage: "The Object Page does not have the correct context"
				});
			}
		}
	};
});
