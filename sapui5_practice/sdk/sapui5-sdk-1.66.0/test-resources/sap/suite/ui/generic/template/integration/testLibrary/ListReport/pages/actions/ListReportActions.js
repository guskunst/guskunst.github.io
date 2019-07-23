sap.ui.define([	"sap/ui/test/Opa5",
				"jquery.sap.global",
               	"sap/ui/base/Object",
               	"sap/ui/test/matchers/PropertyStrictEquals",
                "sap/ui/test/matchers/AggregationFilled",
                "sap/ui/test/actions/Press",
                "sap/suite/ui/generic/template/integration/testLibrary/utils/ApplicationSettings",
                "sap/suite/ui/generic/template/integration/testLibrary/utils/Common" ],
	function(Opa5, jQuery, BaseObject, PropertyStrictEquals, AggregationFilled, Press, ApplicationSettings, Common) {
		return function (sViewNameListReport, sViewNamespaceListReport) {
			return {

				/**
				* Press the Go button within a Fiori Elements List Report UI to start the search for the ListReport data.
				*
				* @throws {Error} Throws an error if the Go button could not be found on the UI
				* @public
				*/
				iExecuteTheSearch: function () {
					var sGoButtonId = ApplicationSettings.getAppParameters().LRPrefixID + "--listReportFilter-btnGo";
				 	return this.waitFor({
				 		id: sGoButtonId,
				 		success: function (oButton) {
				 			oButton.firePress();
				 			Opa5.assert.ok(true, "The search was triggered successfully");
				 		},
				 		errorMessage: "The search could not be executed"
				 	});
				},
	
				/**
				* Click on the create button to execute the creation of a new item in the ListReport.
				* Precondition: The mockserver of your application has to be prepared to handle create requests.
				*
				* @throws {Error} Throws an error if the button for creation of an item could not be found on the UI
				* @public
				*/
				iClickTheCreateButton: function () {
					var sCreateButtonId = ApplicationSettings.getAppParameters().LRPrefixID + "--addEntry";
				 	return this.waitFor({
				 		id: sCreateButtonId,
				 		success: function (oButton) {
				 			oButton.firePress();
				 			Opa5.assert.ok(true, "The creation of a new item was triggered successfully");
				 		},
				 		errorMessage: "The button for creating a new item could not be found"
				 	});
				},

				/**
				* Check the current UI. Function just returns this as a result.
				*
				* @public
				*/
				iLookAtTheScreen : function () {
					return this;
				},

				/**
				* Navigate to the ObjectPage of a Fiori Elements application by LineNo. This simulates the click on 
				* an item in the ListReport.
				*
				* @param {int} iIndex The line number which will be used for navigation (0-based)
				* @throws {Error} Throws an error if the responsive table could not be found
				* @public
				*/
				iNavigateFromListItemByLineNo: function(iIndex) {
					var sLineItemId = ApplicationSettings.getAppParameters().LRPrefixID + "--responsiveTable";
					return this.waitFor({
						id: sLineItemId,
						matchers: [
							new AggregationFilled({
								name: "items"
							})
						],
						actions: function(oControl) {
							var oItem = oControl.getItems()[iIndex];
				 			Opa5.assert.ok(true, "The item '" + oControl.getItems()[iIndex].getBindingContext().sPath + "' was clicked successfully");
				 			oControl.fireItemPress({listItem:oItem});
						},
						errorMessage: "The Smart Table is not rendered correctly sID:" + sLineItemId
	 				});
				},

				/**
				* Navigate to the ObjectPage of a Fiori Elements application by using a field/value combination.
				* This simulates the click on an item in the ListReport.
				*
				* @param {object} oItem This object must be filled with the field/value information to locate the line in the ListReport. 
				* oItem.Field (string):	The field to be checked for. Choose the name of the field as shown in the $metadata file 
				* of the your odata-service. 
				* oItem.Value (string): The value to be searched for.
				* @throws {Error} Throws an error if the field/value combination could not be found in the ListReport
				* @public
				*/
				iNavigateFromListItemByFieldValue: function(oItem) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewName: sViewNameListReport,
						viewNamespace: sViewNamespaceListReport,
						matchers: [function(oCandidateListItem) {
							var oTableLine = {};

							oTableLine = oCandidateListItem.getBindingContext().getObject();
							var sFound = false;
							for (var sName in oTableLine) {
								if ((sName === oItem.Field) && (oTableLine[sName] === oItem.Value)) {
						 			Opa5.assert.ok(true, "Navigate from list item '" + sName + "' with value '" + oItem.Value + "' to the Object Page");
									sFound = true;
									break;
								}
							}
							return sFound;
						}],
						actions: new Press(),
						errorMessage: "Field " + oItem.Field + " with value " + oItem.Value + " could not be located in the ListReport"
	 				});
				},

				/**
				* Set the search field and execute the search.
				*
				* @param {String} sSearchText The text to fill in the search field
				* @throws {Error} Throws an error if the search field control could not be found
				* @public
				*/
				iSetTheSearchField: function (sSearchText) {
					var oSearchField = null;
					return this.waitFor({
						controlType: "sap.m.SearchField",
						actions: function (oControl) {
							oControl.setValue(sSearchText);
							oControl.fireSearch();
							Opa5.assert.ok(true, "Table has search field in toolbar");
						},
						//actions: new Press(),
						errorMessage: "Search field not found"
					});
				},

				/**
				* Set a value within a field of the Smart Filter Bar.
				* This function can be used to load a filtered list when afterwards the search is executed.
				*
				* @param {object} oItem This object must be filled with the data needed to set a specific filter field value 
				* oItem.Field (string):	The field to be set. Choose the name of the field as shown in the metadata of the service. If you 
				* want to search via Editing Status, choose "editStateFilter" for this parameter. 
				* oItem.Value:			The value to be filtered. If you want to search via Editing Status, choose values 0-4 for the options.
				* @throws {Error} Throws an error if the Smart Filter Bar could not be identified.
				* @public
				*/
				iSetTheFilter: function(oItem) {
					return this.waitFor({
						controlType: "sap.ui.comp.smartfilterbar.SmartFilterBar",
						viewName: sViewNameListReport,
						viewNamespace: sViewNamespaceListReport,
						success: function (aControl) {
							var oSmartFilterBar, oHorizontalLayout;
							var aSmartFilterBarContent, aVerticalLayout;
							oSmartFilterBar = aControl[0];
							if (oSmartFilterBar && oSmartFilterBar.getMetadata().getName() === "sap.ui.comp.smartfilterbar.SmartFilterBar") {
								aSmartFilterBarContent = oSmartFilterBar.getContent();
							} else {
								Opa5.assert.notOk("The Smart Filter Bar was not rendered correctly");
								return;
							}
							if (!aSmartFilterBarContent || aSmartFilterBarContent.length < 1) {
								Opa5.assert.notOk("The Smart Filter Bar was not rendered correctly");
								return;
							}
							oHorizontalLayout = aSmartFilterBarContent[0];
							if (!oHorizontalLayout || oHorizontalLayout.getContent().length < 1) {
								Opa5.assert.notOk("The Smart Filter Bar was not rendered correctly");
								return;
							}
							aVerticalLayout = oHorizontalLayout.getContent();
							for (var i = 0; i < aVerticalLayout.length; i++) {
								var oVerticalLayout = aVerticalLayout[i].getContent();
								var oSearchFieldControl = oVerticalLayout[1];
								var sSearchFieldName = oSearchFieldControl.getId();
								var aStringParts = sSearchFieldName.split("-");
								sSearchFieldName = aStringParts[aStringParts.length - 1];
								
								if (sSearchFieldName === oItem.Field) {
									if (typeof oItem.Value === "string") {
										oSearchFieldControl.setValue(oItem.Value);
										if (oItem.Value === "") { // special handling to remove field content
											if (oSearchFieldControl.getMetadata().getName() === "sap.m.ComboBox") {
												oSearchFieldControl.clearSelection();
											} else if (oSearchFieldControl.getMetadata().getName() === "sap.m.MultiInput") {
												oSearchFieldControl.removeAllTokens();
											}
										}
									}
									else if (typeof oItem.Value === "number") {
										oSearchFieldControl.setSelectedKey(oItem.Value);
									}
									break;
								}
							}
							oSmartFilterBar.fireFilterChange(); // Update filter count (required when setting filters programmatically)
						},
						errorMessage: "The Smart Filter Bar was not found"
					});
				},

				/** 
				 * Switches the tab based on the passed key when Icon tab bar is used by configuring views via
				 * quickVariantSelectionX.variants in manifest. Uses the keys of the buttons that are defined in manifest.json.
				 * 
				 * @param {String} sKey Key of the tab, should correspond to the key defined in manifest quickVariantSelectionX.variants item
				 * @throws {Error} Throws an error if the Icon Tab Bar is not found
				 * @public
				 **/
				iClickOnIconTabFilter: function(sKey) {
					var sIconTabBarId = ApplicationSettings.getAppParameters().LRPrefixID + "--template::IconTabBar";
					return this.waitFor({
						id: sIconTabBarId,
						actions: function(oIconTabBar) {
							oIconTabBar.setSelectedKey(sKey);
							oIconTabBar.fireSelect();
						},
						errorMessage: "Icon tab bar could not be found with, expected ID: " + sIconTabBarId
					});
				},
				/** 
				 * Switches the view based on the passed key when segmented button is used by configuring views via
				 * quickVariantSelection.variants in manifest. Uses the keys of the buttons that are defined in manifest.json.
				 * 
				 * @param {String} sKey Key of the button, should correspond to the key defined in manifest quickVariantSelection.variants item
				 * @throws {Error} Throws an error if the segmented button is not found
				 * @public
				 **/
				iClickOnSegmentedButton: function(sKey) {
					var sSegmentedBtnId = ApplicationSettings.getAppParameters().LRPrefixID + "--template::SegmentedButton";
					return this.waitFor({
						id: sSegmentedBtnId,
						actions: function(oSegmentedButton) {
							var aButtons = oSegmentedButton.getItems();
							for (var i = 0; i < aButtons.length; i++) {
								if (aButtons[i].getKey() === sKey) {
									aButtons[i].firePress();
									return;
								}
							}
						},
						errorMessage: "Icon tab bar could not be found with, expected ID: " + sSegmentedBtnId
					});
				},

				/** 
				 * Click on a link (sap.m.Link) in the ListReport. 
				 * 
				 * @param {String} sText The displayed link text of the link to be clicked. The test fragment will click on all links 
				 * found on the UI which contain the string sText.
				 * @throws {Error} Throws an error if the link cannot be found
				 * @public
				 **/
				iClickTheLink: function(sText) {
					return this.iClickTheLinkWithLabel(sText);
				},

				/** 
				 * Click a link (sap.m.Link) which has a specific id. 
				 * 
 				 * @param {String} sId The id of the link as listed in the DOM. You have to pass the most right part after the "--" only.
				 * @throws {Error} Throws an error if the link is not rendered or clicked
				 * @public
				 **/
				iClickTheLinkWithId: function (sId) {
					var sLinkId = ApplicationSettings.getAppParameters().LRPrefixID + "--" + sId;
					return this.iClickTheLnkWithId(sLinkId);
				},

				/** 
				 * Click a button (sap.m.Button) which has a specific id. 
				 * 
 				 * @param {String} sId The id of the button as listed in the DOM. You have to pass the most right part after the "--" only.
				 * @throws {Error} Throws an error if the button is not rendered or clicked
				 * @public
				 **/
				iClickTheButtonWithId: function (sId) {
					var sButtonId = ApplicationSettings.getAppParameters().LRPrefixID + "--" + sId;
					return this.iClickTheBtnWithId(sButtonId);
				},

				/** 
				 * Click a button (sap.m.Button) having a specific icon. 
				 * 
 				 * @param {String} sIcon The icon assigned to the button.
				 * @throws {Error} Throws an error if the button is not rendered or clicked
				 * @public
				 **/
				iClickTheButtonWithIcon: function (sIcon) {
					return this.iClickTheBtnWithIcon(sIcon);
				},

				/** 
				 * Click a button on a dialog (sap.m.Dialog). 
				 * 
				 * @param {String} sText The displayed label text of the button to be clicked.
				 * @throws {Error} Throws an error if the dialog containing the button is not shown
				 * @public
				 **/
				iClickTheButtonOnTheDialog: function (sText) {
					return this.iClickTheDialogButtonWithLabel(sText);
				},
				
				/** 
				 * Click a button (sap.m.Button). 
				 * 
				 * @param {String} sLabelText The displayed label text of the button to be clicked.
				 * @throws {Error} Throws an error if the button is not rendered or clicked
				 * @public
				 **/
				iClickTheButtonHavingLabel: function (sLabelText) {
					return this.iClickTheButtonWithLabel(sLabelText);
				},
				
				/** 
				 * Click Overflow Toolbar Button, ex: Click on + on table, click on settings/personalization button on table. 
				 * 
				 * @param {String} sButtonName The displayed label text of the button to be clicked.
				 * @throws {Error} Throws an error if the Overflow Toolbar Button with visible label sButtonName is not rendered/clicked
				 * @public
				 **/
				iClickTheOverflowToolbarButton: function (sButtonName) {
					return this.iSelectTheOverflowToolbarButton(sButtonName);
				},
				
				/** 
				 * Select Item from Combo Box Dropdown, ex: Choose Item under Table Personalisation->Group->Combo Box to set the Group By. 
				 * 
				 * @param {String} sItem is the Item to be chosen from the Combo Box Dropdown.
				 * @throws {Error} Throws an error if the sItem could not be selected
				 * @throws {Error} Throws an error if the Combo Box is not found
				 * @public
				 **/
				iChoosetheItemInComboBox: function (sItem) {
					return this.iChoosetheItemFromComboBox(sItem);
				},

				iSelectTheFirstComboBox: function () {
					return this.iSelectTheFirstCboBox();
				},

				iSelectTheItemFromFirstComboBox: function (sItem) {
					return this.iSelectTheItemFromFirstCboBox(sItem);
				},
				
				/** 
				 * Select Items from a Multi-Select ComboBox dropdown list. 
				 * 
				 * @param {String} sComboBox Name of the ComboBox where the values have to be selected.
				 * @param {Object} oItems contains the list of items to be selected.
				 * @throws {Error} Throws an error if the sItem could not be selected
				 * @throws {Error} Throws an error if the Combo Box is not found
				 * @public
				 **/
/* not yet working this way, MultiComboBox to be checked 
				iChooseItemsFromMultiComboBox: function (sFieldName, oItems) {
					var oAppParams = ApplicationSettings.getAppParameters();
					return this.iChooseItmsFromMultiComboBox(oAppParams, sFieldName, oItems);
				},
*/				

				/** 
				 * Check a list item (sap.m.CustomListItem). 
				 * 
				 * @param {String} sLabelText The displayed label text of the list item to be clicked.
				 * @param {String} bState CheckBox of list item should be checked (true) or unchecked (false).
				 * @throws {Error} Throws an error if the list item is not rendered or clicked
				 * @public
				 **/
				iClickTheListItemWithLabel: function (sLabelText, bState) {
					return this.iClickTheLstItemWithLabel(sLabelText, bState);
				},
				
				/**
				* Select items in the ListReport by LineNumber
				*
				* @param {int array} aItemIndex An array of line numbers (0-based) to be selected
				* @param {boolean} bSelect Select (true: default) or Unselect (false) the lines
				* @param {int} iTabIndex Index of tab in case you are using TableTabs, MultipleViews in the ListReport
				* @throws {Error} Throws an error if the responsive table could not be found
				* @public
				*/
				iSelectListItemsByLineNo: function(aItemIndex, bSelect, iTabIndex) {
					var sId = ApplicationSettings.getAppParameters().LRPrefixID + "--responsiveTable";
					sId = ((iTabIndex != undefined) && (iTabIndex > 0)) ? (sId + "-" + iTabIndex) : sId;
					return this.iChooseListItemsByLineNo(sId, aItemIndex, bSelect);
				},

				/** 
				 * Click the arrow icon of a MultiComboBox to open the list of selectable items 
				 * 
				 * @param {String} sFieldName Name of field (as shown in the $metadata file) the MultiComboBox is assigned to
				 * @throws {Error} Throws an error if the MultiComboBox could not be found
				 * @public
				 **/
				iClickTheMultiComboBoxArrow: function (sFieldName) {
					var oAppParams = ApplicationSettings.getAppParameters();
					return this.iClickTheMultiCboBoxArrow(sFieldName);
				},

				/** 
				 * Select an item within a MultiComboBox item list
				 * 
				 * @param {String} sFieldName Name of field (as shown in the $metadata file) the MultiComboBox is assigned to
				 * @param {String} sItem Item of the list to be selected. Choose the name of the item as it is shown on the UI.
				 * @throws {Error} Throws an error if the item could not be found in the list
				 * @public
				 **/
				iSelectItemsFromMultiComboBox: function (sFieldName, sItem) {
					var oAppParams = ApplicationSettings.getAppParameters();
					return this.iSelectItemsFromMultiCboBox(sFieldName, sItem);
				},

				/**
				 * Set the property value in a given table.
				 *
				 * @param {String} sTableId: The id of the table in which the property value will be applied. You have to pass the most right part after the "--" only.
				 * @param {string} sPropertyName: Property name for which the value would be set. You have to pass the most right part after the "--" only.
				 * @param {string/int/boolean} sPropertyValue: Actual value(string, boolean, int etc..) of the property that will be passed and applied for sPropertyName.
				 * @public
				 **/
				iSetThePropertyInTable: function(sTableId, sPropertyName, sPropertyValue){
					var oAppParams = ApplicationSettings.getAppParameters();
					sTableId = oAppParams.LRPrefixID + "--" + sTableId;
					return this.iSetThePropertyValueInTable(sTableId,sPropertyName,sPropertyValue);
				}

			};
		};
	}
);
