/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/model/json/JSONModel', "sap/base/util/array/diff", "sap/m/Button"
], function(JSONModel, diff, Button) {
	"use strict";
	// Check if we are in a modal scenario, maybe also think about putting this in a property
	var bIsModal = jQuery.sap.getUriParameters().get("P13nModal") === "true";
	var Util = {
		showP13nChart: function(oSource, oBaseData, oDataRuntime, oControl, fnAfterCreateChanges) {

			this.sP13nType = "Chart"; // set the panel type to refer to the correct event handler later on and get panel specific info (e.g. title)

			sap.ui.require([
				"sap/ui/mdc/p13n/ChartItemPanel"
			], function(ChartItemPanel) {

				this._showDialog(oSource, oBaseData, oDataRuntime, oControl, fnAfterCreateChanges, ChartItemPanel);

			}.bind(this));
		},
		showP13nColumns: function(oSource, oBaseData, oDataRuntime, oControl, fnAfterCreateChanges) {

			this.sP13nType = "Column"; // set the panel type to refer to the correct event handler later on and get panel specific info (e.g. title)

			sap.ui.require([
				"sap/ui/mdc/p13n/SelectionPanel"
			], function(SelectionPanel) {

				this._showDialog(oSource, oBaseData, oDataRuntime, oControl, fnAfterCreateChanges, SelectionPanel);

			}.bind(this));
		},
		showP13nSort: function(oSource, oBaseData, oDataRuntime, oControl, fnAfterCreateChanges) {

			this.sP13nType = "Sort"; // set the panel type to refer to the correct event handler later on and get panel specific info (e.g. title)

			sap.ui.require([
				"sap/ui/mdc/p13n/SortPanel"
			], function(SortPanel) {

				this._showDialog(oSource, oBaseData, oDataRuntime, oControl, fnAfterCreateChanges, SortPanel);

			}.bind(this));
		},
		_showDialog: function(oSource, oBaseData, oDataRuntime, oControl, fnAfterCreateChanges, Panel) {
			return new Promise(function(resolve, reject) {

				// Load either sap.m.Dialog or sap.m.ResponsivePopover, depending on the setting
				sap.ui.require(bIsModal ? [
					'sap/m/Dialog'
				] : [
					'sap/m/ResponsivePopover'
				], function(Container) {

					// Initial item sorting, when opening the dialog
					oBaseData.items.sort(function(a, b) {
						if (a.label < b.label) {
							return -1;
						} else if (a.label > b.label) {
							return 1;
						} else {
							return 0;
						}
					});

					// Object.assign is being used as some kind of 'inheritance' in order to take all existing values from oBaseData that are not
					// existing within oDataRuntime
					var aItemsRuntimeNotExisting = oBaseData.items.filter(function(oMItemInitial) {
						return !this._getArrayElementByKey(oMItemInitial.name, oDataRuntime.items);
					}.bind(this));
					Object.assign(oDataRuntime, {
						items: oDataRuntime.items.concat(aItemsRuntimeNotExisting)
					});

					// This is going be the model for the Panel inside the Container
					this.oJSONModelRuntime = new JSONModel(oDataRuntime);

					// for later bind()
					this.oControl = oControl;

					// get the matching title for the according personalization scenario
					var sTitle = this._getPanelTitle(this.sP13nType);

					this.fnHandleChange = function(aChanges) {
						Util.handleUserChanges(aChanges, oControl).then(fnAfterCreateChanges);
					};

					var oPanel = new Panel({
						change: bIsModal ? function() {} : this._registerChangeEvent.bind(this)
					});
					oPanel.setModel(this.oJSONModelRuntime);

					// Build the dialog
					var oDialog = this._createDialog(Container, oPanel, bIsModal, this.oJSONModelRuntime, oControl, sTitle, this.fnHandleChange);
					oControl.addDependent(oDialog);
					if (bIsModal) {
						oDialog.open();
					} else {
						oDialog.openBy(oSource);
					}

				}.bind(this));
			}.bind(this));
		},
		_registerChangeEvent: function() {
			var aChanges = [];
			switch (this.sP13nType) {
				case "Sort":
					aChanges = this._registerSortEvent();
					break;
				case "Column":
					aChanges = this._registerColumnEvent();
					break;
				case "Chart":
					aChanges = this._registerChartEvent();
					break;
			}
			this.fnHandleChange(aChanges);
		},
		_registerChartEvent: function() {
			// aChanges will be used to generate the flex changes, aExistingSorters is the state of the perso dialog upon opening, aSelectedSorters is
			// the state when the change event is being fired
			var aChanges = [], fnSymbol;

			var aExistingItems = this._getChartData(this.oControl), aSelectedItems = [];

			// Set the selected data for the diff
			this.oJSONModelRuntime.getData().items.forEach(function(oItem) {
				if (!oItem.visible) {
					return;
				}
				var oSelectedItem = {
					id: oItem.id,
					name: oItem.name,
					label: oItem.label,
					kind: oItem.kind,
					role: oItem.role,
					aggregationMethod: oItem.aggregationMethod,
					propertyPath: oItem.propertyPath
				};
				aSelectedItems.push(oSelectedItem);
			});

			fnSymbol = function(o) {
				// This will be the data which will be stored in flex
				return o.name + o.role;
			};
			aChanges = this._processResult(aExistingItems, aSelectedItems, fnSymbol, this.oControl, "removeItem", "addItem");
			return aChanges;
		},
		_registerColumnEvent: function() {
			// aChanges will be used to generate the flex changes, aExistingSorters is the state of the perso dialog upon opening, aSelectedSorters is
			// the state when the change event is being fired
			var aChanges = [], fnSymbol;

			var aExistingColumns = this._getColumnsData(this.oControl), aSelectedColumns = [];

			// Set the selected data for the diff
			this.oJSONModelRuntime.getData().items.forEach(function(oColumn) {
				if (!oColumn.visible) {
					return;
				}
				var oSelectedColumn = {
					name: oColumn.name,
					label: oColumn.label
				};
				aSelectedColumns.push(oSelectedColumn);
			});

			fnSymbol = function(o) {
				// This will be the data which will be stored in flex
				return o.name;
			};
			aChanges = this._processResult(aExistingColumns, aSelectedColumns, fnSymbol, this.oControl, "removeColumn", "addColumn");
			return aChanges;
		},
		_registerSortEvent: function() {
			// aChanges will be used to generate the flex changes, aExistingSorters is the state of the perso dialog upon opening, aSelectedSorters is
			// the state when the change event is being fired
			var aChanges = [], fnSymbol;

			var aExistingSorters = this._getSortData(this.oControl), aSelectedSorters = [];

			// Set the selected data for the diff
			this.oJSONModelRuntime.getData().items.forEach(function(oSorter) {
				if (!oSorter.selected) {
					return;
				}
				var oSelectedSorter = {
					name: oSorter.name,
					sortOrder: oSorter.sortOrder
				};
				aSelectedSorters.push(oSelectedSorter);
			});

			fnSymbol = function(o) {
				// This will be the data which will be stored in flex
				return o.name + o.sortOrder;
			};
			aChanges = this._processResult(aExistingSorters, aSelectedSorters, fnSymbol, this.oControl, "removeSort", "addSort");
			return aChanges;
		},
		_createDialog: function(Container, oPanel, bIsModal, oJSONModelRuntime, oControl, sMessageIdForTitle, fnCreateChanges) {
			var oContainer;
			var oDataBeforeOpen = jQuery.extend(true, {}, oJSONModelRuntime.getProperty("/"));
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			if (!bIsModal) {
				// Livechanges: create a Popover and instantly apply every change
				oContainer = new Container({
					title: oResourceBundle.getText(sMessageIdForTitle),
					horizontalScrolling: false,
					verticalScrolling: true,
					contentWidth: "25rem",
					resizable: true,
					placement: "HorizontalPreferredRight",
					content: oPanel,
					afterClose: function() {
						// resolve the Promise with an empty array, to be able to reload the settings
						oContainer.destroy();
						fnCreateChanges([]);
					}
				});
			} else {
				// Modal Dialog: create a Dialog and collect every change made during runtime in aRuntimeChanges
				oContainer = new Container({
					title: oResourceBundle.getText(sMessageIdForTitle),
					horizontalScrolling: false,
					verticalScrolling: true,
					contentWidth: "40rem",
					contentHeight: "55rem",
					draggable: true,
					resizable: true,
					stretch: "{device>/system/phone}",
					content: oPanel,
					buttons: [
						new Button({
							text: oResourceBundle.getText("p13nDialog.OK"),
							type: "Emphasized",
							press: function() {
								// Apply a diff to create changes for flex
								this._registerChangeEvent();
								oContainer.close();
								oContainer.destroy();
							}.bind(this)
						}), new Button({
							text: oResourceBundle.getText("p13nDialog.CANCEL"),
							press: function() {
								// Discard the collected changes
								oContainer.close();
								oContainer.destroy();
								oJSONModelRuntime.setProperty("/", jQuery.extend(true, {}, oDataBeforeOpen));
								// resolve the Promise with an empty array, to be able to reload the settings
								fnCreateChanges([]);
							}
						})
					]
				});
			}
			// Add custom style class in order to display marked items accordingly
			oContainer.addStyleClass("sapUiMdcPersonalizationDialog");
			// Set compact style class if the table is compact too
			oContainer.toggleStyleClass("sapUiSizeCompact", !!jQuery(oControl.getDomRef()).closest(".sapUiSizeCompact").length);
			return oContainer;
		},
		_processResult: function(aExistingArray, aChangedArray, fnSymBol, oControl, sRemoveOperation, sInsertOperation) {
			var aResults = diff(aExistingArray, aChangedArray, fnSymBol);

			var fMatch = function(oField, aArray) {
				return aArray.filter(function(oExistingField) {
					return oExistingField && (oExistingField.name === oField.name);
				})[0];
			};

			var aChanges = [];
			var aProcessedArray = aExistingArray.slice(0);
			aResults.forEach(function(oResult) {
				// Begin --> hack for handling result returned by diff
				if (oResult.type === "delete" && aProcessedArray[oResult.index] === undefined) {
					aProcessedArray.splice(oResult.index, 1);
					return;
				}

				var oExistingProp;
				if (oResult.type === "insert") {
					oExistingProp = fMatch(aChangedArray[oResult.index], aProcessedArray);
					if (oExistingProp) {
						oExistingProp.index = aProcessedArray.indexOf(oExistingProp);
						aProcessedArray.splice(oExistingProp.index, 1, undefined);
						aChanges.push({
							selectorControl: oControl,
							changeSpecificData: {
								changeType: sRemoveOperation,
								content: oExistingProp
							}
						});
					}
				}
				// End hack
				var oProp = oResult.type === "delete" ? aProcessedArray[oResult.index] : aChangedArray[oResult.index];
				oProp.index = oResult.index;
				if (oResult.type === "delete") {
					aProcessedArray.splice(oProp.index, 1);
				} else {
					aProcessedArray.splice(oProp.index, 0, oProp);
				}
				aChanges.push({
					selectorControl: oControl,
					changeSpecificData: {
						changeType: oResult.type === "delete" ? sRemoveOperation : sInsertOperation,
						content: oProp
					}
				});
			});
			return aChanges;
		},
		_getArrayElementByKey: function(sKey, aArray) {
			var aElements = aArray.filter(function(oElement) {
				return oElement.name !== undefined && oElement.name === sKey;
			});
			return aElements.length ? aElements[0] : null;
		},
		_getSortData: function(oControl) {
			var oFlexData = oControl.data("$p13nSort"), oValue, aSortedProperties = [];
			if (typeof oFlexData === "string") {
				oFlexData = oFlexData.replace(/\\{/g, "{"); // Escape to NOT interpret custom data as binding
				oValue = JSON.parse(oFlexData);
			}
			if (oValue) {
				aSortedProperties = oValue;
			}
			return aSortedProperties;
		},
		_getColumnsData: function(oControl) {
			var aProperties = [], sLeadingProperty;
			if (oControl) {
				oControl.getColumns().forEach(function(oColumn) {
					sLeadingProperty = oColumn && oColumn.getDataProperties()[0]; // get the leading (1st property always)
					if (sLeadingProperty) {
						aProperties.push({
							name: sLeadingProperty,
							id: oColumn.getId(),
							label: oColumn.getHeader()
						});
					}
				});
			}
			return aProperties;
		},
		_getChartData: function(oControl) {
			var aProperties = [];
			oControl.getItems().forEach(function(oItem) {
				aProperties.push({
					id: oItem.sId,
					name: oItem.mProperties.key,
					label: oItem.mProperties.label,
					role: oItem.mProperties.role
				});
			});
			return aProperties;
		},
		_getPanelTitle: function(sP13nType) {
			var sTitle;
			switch (sP13nType) {
				case "Sort":
					sTitle = "sort.PERSONALIZATION_DIALOG_TITLE";
					break;
				case "Column":
					sTitle = "fieldsui.SELECTED_FIELDS";
					break;
				case "Chart":
					sTitle = "chart.PERSONALIZATION_DIALOG_TITLE";
					break;
			}
			return sTitle;
		},
		handleUserChanges: function(aChanges, oControl) {
			return new Promise(function(resolve, reject) {
				sap.ui.require([
					"sap/ui/fl/ControlPersonalizationAPI"
				], function(ControlPersonalizationAPI) {
					ControlPersonalizationAPI.addPersonalizationChanges({
						controlChanges: aChanges
					}).then(function(aDirtyChanges) {
						resolve(aDirtyChanges);
					});
				});
			});
		}
	};
	return Util;
});
