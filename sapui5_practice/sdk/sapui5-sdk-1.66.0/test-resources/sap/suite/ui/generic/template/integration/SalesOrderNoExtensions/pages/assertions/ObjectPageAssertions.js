/*** Object Page Assertions ***/
sap.ui.define(
	["sap/ui/test/matchers/PropertyStrictEquals",
	 "sap/suite/ui/generic/template/integration/SalesOrderNoExtensions/utils/OpaResourceBundle",
	 "sap/suite/ui/generic/template/integration/SalesOrderNoExtensions/utils/OpaManifest",
	 "sap/suite/ui/generic/template/integration/SalesOrderNoExtensions/utils/OpaDataStore",
		"sap/ui/test/matchers/AggregationFilled"
	],
	function (PropertyStrictEquals, OpaResourceBundle, OpaManifest, OpaDataStore, AggregationFilled) {

		return function (prefix, viewName, viewNamespace, entityType, entitySet) {

			return {
				/************************************************
				 RENDERING ASSERTIONS
				*************************************************/
				// check if the Object Page has the correct title by:
				// i. finding the control by id
				// ii. matching the "text" property of the control with the value from the annotations ("Product")
				thePageShouldContainTheCorrectTitle: function() {
					console.log ( "OPA5::ObjectPageAssertions::thePageShouldContainTheCorrectTitle ");
					return this.waitFor({
						id: prefix + "objectTypeName",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: entityType["com.sap.vocabularies.UI.v1.HeaderInfo"].TypeName.String
						}),
						success: function() {
							ok(true, "The Object Page Title is correct");
						},
						errorMessage: "The Object Page Title is not rendered correctly"
					});
				},
				
				theTransientMessagesDialogIsRenderedCorrectly: function(iNumberOfMessages) {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						id: "__component0-appContent--messageDialog",
						
						success: function() {
							var sErrorIconId = "__view0-error-img";
							var sWarningIconId = "__view0-warning-img";
							var sInfoIconId = "__view0-information-img";
							
							var aId = [sErrorIconId,sWarningIconId,sInfoIconId];
							
							for (var i=0;i<=aId.length-1;i++) {
								this.theMessageIconsAreRenderedCorrectly(aId[i]);
							}
							
							this.theCountOfTransientMessagesIsCorrect(iNumberOfMessages);
						},
						errorMessage: "The Transient Message Dialog is not rendered correctly"
					});
				},
				
				theMessageIconsAreRenderedCorrectly: function(sId) {
						return this.waitFor({
							controlType: "sap.ui.core.Icon",
							id: sId,
							
							success: function() {
								ok(true, "The correct Icon"+sId+" is rendered");
							},
							errorMessage: "The Icon "+sId+" is not rendered correctly"
						});						
				},
				
				theCountOfTransientMessagesIsCorrect: function(iNumberOfExpectedMessages) {
					return this.waitFor({
						controlType: "sap.m.List",
												
						success: function (oList) {
							var iNo = oList[0].getItems().length;
							
							equal(iNo, iNumberOfExpectedMessages, "The Transient Message Dialog has " + iNumberOfExpectedMessages + " number of messages rendered correctly");
						},	
						errorMessage: "Mismatch in number of Transient Messages Rendered."
					});
				},
				
				theMessageTitleIconAndDescriptionIsRenderedCorrectly: function(sMessageTitle, sMessageDescription, sMessageType) {
					return this.waitFor({
						controlType: "sap.m.Page",
						id: "__view0-detailsPage",
						
						success: function (oPage) {
							var sMessage = oPage.mAggregations.content[0].getText();
							var sDescription = oPage.mAggregations.content[1].getText();
							var sIcon = oPage.mAggregations.content[2].getSrc();
							
							equal(sMessage,sMessageTitle,"The Message Title in Detailed Screen is rendered correctly");
							equal(sDescription,sMessageDescription,"The Message Description in Detailed Screen is rendered correctly");
							equal(sIcon,"sap-icon://message-"+sMessageType,"The Message Icon in Detailed Screen is rendered correctly");
						},	
						errorMessage: "Mismatch in number of Transient Messages Rendered."
					});
				},
				
				/************************************************
				 NAVIGATION ASSERTIONS
				 *************************************************/
				// check if the Object Page context is correct by:
				// i. finding the Oject Page Layout by control type
				// ii. get the binding context and check against the Data Store
				theObjectPageContextShouldBeCorrect: function() {
					console.log ( "OPA5::ObjectPageAssertions::theObjectPageContextShouldBeCorrect ");
					return this.waitFor({
						controlType: "sap.uxap.ObjectPageLayout",
						viewName: viewName,
						viewNamespace: viewNamespace,
						matchers: [
							function(oControl) {
								if (oControl && oControl.getBindingContext()) {
									return oControl.getBindingContext().getPath() === OpaDataStore.getData("navContextPath");
								}
							}
						],
						success: function() {
							ok(true, "The Object Page has the correct context");
						},
						errorMessage: "The Object Page does not have the correct context"
					});
				},
				theObjectPageHasAnApplyButton: function() {
					console.log ( "OPA5::ObjectPageAssertions::theObjectPageHasAnApplyButton ");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
									new sap.ui.test.matchers.PropertyStrictEquals({
										name: "text",
										value: "Apply"
									}),

									function(oButton) {
										return oButton.getEnabled();
									}
								],
						success: function(oButton) {
							QUnit.ok(true, "The Sub Object Page has an Apply button.");
						},
						errorMessage: "The Sub Object Page has no Apply button."
					});
				},

				//sap.uxap.ObjectPageLayout#SOwoExt::sap.suite.ui.generic.template.ObjectPage.view.Details::C_STTA_SalesOrderItem_WD_20--objectPage is not visible -  sap.ui.test.matchers.Visible
				theObjectPage3ContextShouldBeCorrect: function() {
					console.log ( "OPA5::ObjectPageAssertions::theObjectPage3ContextShouldBeCorrect ");
					return this.waitFor({
						controlType: "sap.uxap.ObjectPageLayout",
						viewName: viewName,
						viewNamespace: viewNamespace,
						matchers: [
							function(oControl) {
								if (oControl && oControl.getBindingContext()) {
									return oControl.getBindingContext().getPath() === OpaDataStore.getData("navContextPath");
								}
							}
						],
						success: function() {
							ok(true, "The Sub Object Page has the correct context");
						},
						errorMessage: "The Sub Object Page does not have the correct context"
					});
				},
				thePageShouldBeInEditMode: function() {
					return this.waitFor({
						controlType: "sap.uxap.ObjectPageLayout",
						//viewName: viewName,
						//viewNamespace: viewNamespace,
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
				theResponsiveTableIsFilledWithItems: function(iItems) {
					var aMatchers = [
						new AggregationFilled({
							name: "items"
						})
					];
					var fnSuccess = function(oControl) {
						var actualItems = oControl.getItems();
						equal(actualItems.length, iItems, "Correct number of items are present in the table");
					};

					return this.waitForResponsiveTableInObjectPage(aMatchers, fnSuccess);
				},
				waitForResponsiveTableInObjectPage: function(aMatchers, fnSuccess) {
					return this.waitFor({
						id: prefix + "to_Item::com.sap.vocabularies.UI.v1.LineItem::responsiveTable",
						//viewName: viewName,
						//viewNamespace: viewNamespace,
						matchers: aMatchers,
						success: fnSuccess,
						errorMessage: "The Responsive Table is not rendered correctly"
					});
				},
				iShouldSeeTheCorrectTextForISOCurrencyCode: function(sExpectedText) {
					return this.waitFor({
						id: prefix+"com.sap.vocabularies.UI.v1.FieldGroup::Amount::CurrencyCode::Field-text",
						matchers: [
							function(oControl) {
								if (oControl && oControl.getBindingContext()) {
									return true;
								}
							}
						],
						success: function(oControl) {
							var sText = oControl.getText();
							equal(sText, sExpectedText, "Text of ISO Currency Code (" + sText + ") is as expected (" + sExpectedText + ")");
						},
						errorMessage: "The control for ISO Currency Code was not found"
					});
				}
			};
		};
	}
);
