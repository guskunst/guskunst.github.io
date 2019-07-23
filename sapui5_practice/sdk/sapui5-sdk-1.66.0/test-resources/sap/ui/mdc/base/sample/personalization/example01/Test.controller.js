sap.ui.define([
	'sap/m/ResponsivePopover', 'sap/m/Dialog', 'sap/ui/core/mvc/Controller', 'sap/ui/mdc/base/personalization/VisibilityPanel', 'sap/ui/mdc/base/personalization/VisibilityPanelItem', 'sap/ui/mdc/base/personalization/FilterPanel', 'sap/ui/mdc/base/personalization/FilterPanelItem', 'sap/ui/mdc/base/personalization/ChartPanel', 'sap/ui/mdc/base/personalization/ChartPanelItem', 'sap/ui/mdc/base/personalization/SortPanel', 'sap/ui/mdc/base/personalization/SortPanelItem', 'sap/ui/model/json/JSONModel', 'sap/base/Log', 'sap/ui/core/Item', 'sap/chart/data/DimensionRoleType', 'sap/chart/data/MeasureRoleType', 'sap/ui/mdc/base/ConditionModel', 'sap/ui/mdc/base/Condition', 'sap/m/Table', 'sap/ui/mdc/base/FieldValueHelp', 'sap/ui/mdc/base/FieldValueHelpMTableWrapper', 'sap/m/Button'
], function (ResponsivePopover, Dialog, Controller, VisibilityPanel, VisibilityPanelItem, FilterPanel, FilterPanelItem, ChartPanel, ChartPanelItem, SortPanel, SortPanelItem, JSONModel, Log, Item, DimensionRoleType, MeasureRoleType, ConditionModel, Condition, Table, FieldValueHelp, FieldValueHelpMTableWrapper, Button) {
	"use strict";

	return Controller.extend("sap.ui.mdc.base.sample.personalizationPanel.example01.Test", {

		// Define initial data in oDataInitial structure which is used only in this  example.
		// In productive code, probably any table will be used in order to get the initial column information.
		oDataInitial: {
			// Runtime data
			// Note: the order the model items should be initially the same as the table items in the P13nPanel (first sorted by selected items and then sorted by text)
			ChartItems: [
				{
					key: "sap",
					text: "SAP",
					visible: true,
					type: "Dimension",
					roleKey: DimensionRoleType.category,
					availableRoles: [
						{
							key: DimensionRoleType.category,
							text: "Category"
						}, {
							key: DimensionRoleType.series,
							text: "Series"
						}, {
							key: DimensionRoleType.category2,
							text: "Category 2"
						}
					]
				}, {
					key: "bmw",
					text: "BMW",
					visible: true,
					type: "Dimension",
					roleKey: DimensionRoleType.category,
					availableRoles: [
						{
							key: DimensionRoleType.category,
							text: "Category"
						}, {
							key: DimensionRoleType.series,
							text: "Series"
						}, {
							key: DimensionRoleType.category2,
							text: "Category 2"
						}
					]
				}, {
					key: "currencyCode",
					text: "Currency Code",
					visible: false,
					type: "Dimension",
					roleKey: DimensionRoleType.category,
					availableRoles: [
						{
							key: DimensionRoleType.category,
							text: "Category"
						}, {
							key: DimensionRoleType.series,
							text: "Series"
						}, {
							key: DimensionRoleType.category2,
							text: "Category 2"
						}
					]
				}, {
					key: "depth",
					text: "Depth",
					visible: false,
					type: "Measure",
					roleKey: MeasureRoleType.axis1,
					availableRoles: [
						{
							key: MeasureRoleType.axis1,
							text: "Axis 1"
						}, {
							key: MeasureRoleType.axis2,
							text: "Axis 2"
						}, {
							key: MeasureRoleType.axis3,
							text: "Axis 3"
						}
					]
				}, {
					key: "description",
					text: "Description",
					visible: false,
					type: "Dimension",
					roleKey: DimensionRoleType.category,
					availableRoles: [
						{
							key: DimensionRoleType.category,
							text: "Category"
						}, {
							key: DimensionRoleType.series,
							text: "Series"
						}, {
							key: DimensionRoleType.category2,
							text: "Category 2"
						}
					]
				}, {
					key: "dimUnit",
					text: "DimUnit",
					visible: false,
					type: "Measure",
					roleKey: MeasureRoleType.axis1,
					availableRoles: [
						{
							key: MeasureRoleType.axis1,
							text: "Axis 1"
						}, {
							key: MeasureRoleType.axis2,
							text: "Axis 2"
						}, {
							key: MeasureRoleType.axis3,
							text: "Axis 3"
						}
					]
				}, {
					key: "height",
					text: "Height",
					visible: false,
					type: "Measure",
					roleKey: MeasureRoleType.axis1,
					availableRoles: [
						{
							key: MeasureRoleType.axis1,
							text: "Axis 1"
						}, {
							key: MeasureRoleType.axis2,
							text: "Axis 2"
						}, {
							key: MeasureRoleType.axis3,
							text: "Axis 3"
						}
					]
				}, {
					key: "price",
					text: "Price",
					visible: false,
					type: "Measure",
					roleKey: MeasureRoleType.axis1,
					availableRoles: [
						{
							key: MeasureRoleType.axis1,
							text: "Axis 1"
						}, {
							key: MeasureRoleType.axis2,
							text: "Axis 2"
						}, {
							key: MeasureRoleType.axis3,
							text: "Axis 3"
						}
					]
				}, {
					key: "productId",
					text: "Product ID",
					visible: false,
					type: "Dimension",
					roleKey: DimensionRoleType.category,
					availableRoles: [
						{
							key: DimensionRoleType.category,
							text: "Category"
						}, {
							key: DimensionRoleType.series,
							text: "Series"
						}, {
							key: DimensionRoleType.category2,
							text: "Category 2"
						}
					]
				}, {
					key: "productPicUrl",
					text: "ProductPicUrl",
					visible: false,
					type: "Dimension",
					roleKey: DimensionRoleType.category,
					availableRoles: [
						{
							key: DimensionRoleType.category,
							text: "Category"
						}, {
							key: DimensionRoleType.series,
							text: "Series"
						}, {
							key: DimensionRoleType.category2,
							text: "Category 2"
						}
					]
				}, {
					key: "quantity",
					text: "Quantity",
					visible: false,
					type: "Measure",
					roleKey: MeasureRoleType.axis1,
					availableRoles: [
						{
							key: MeasureRoleType.axis1,
							text: "Axis 1"
						}, {
							key: MeasureRoleType.axis2,
							text: "Axis 2"
						}, {
							key: MeasureRoleType.axis3,
							text: "Axis 3"
						}
					]
				}, {
					key: "status",
					text: "Status",
					visible: false,
					type: "Dimension",
					roleKey: DimensionRoleType.category,
					availableRoles: [
						{
							key: DimensionRoleType.category,
							text: "Category"
						}, {
							key: DimensionRoleType.series,
							text: "Series"
						}, {
							key: DimensionRoleType.category2,
							text: "Category 2"
						}
					]
				}, {
					key: "supplierName",
					text: "Supplier Name",
					visible: false,
					type: "Dimension",
					roleKey: DimensionRoleType.category,
					availableRoles: [
						{
							key: DimensionRoleType.category,
							text: "Category"
						}, {
							key: DimensionRoleType.series,
							text: "Series"
						}, {
							key: DimensionRoleType.category2,
							text: "Category 2"
						}
					]
				}, {
					key: "uom",
					text: "UoM",
					visible: false,
					type: "Measure",
					roleKey: MeasureRoleType.axis1,
					availableRoles: [
						{
							key: MeasureRoleType.axis1,
							text: "Axis 1"
						}, {
							key: MeasureRoleType.axis2,
							text: "Axis 2"
						}, {
							key: MeasureRoleType.axis3,
							text: "Axis 3"
						}
					]
				}, {
					key: "weightMeasure",
					text: "Weight Measure",
					visible: false,
					type: "Measure",
					roleKey: MeasureRoleType.axis1,
					availableRoles: [
						{
							key: MeasureRoleType.axis1,
							text: "Axis 1"
						}, {
							key: MeasureRoleType.axis2,
							text: "Axis 2"
						}, {
							key: MeasureRoleType.axis3,
							text: "Axis 3"
						}
					]
				}, {
					key: "weightUnit",
					text: "WeightUnit",
					visible: false,
					type: "Dimension",
					roleKey: DimensionRoleType.category,
					availableRoles: [
						{
							key: DimensionRoleType.category,
							text: "Category"
						}, {
							key: DimensionRoleType.series,
							text: "Series"
						}, {
							key: DimensionRoleType.category2,
							text: "Category 2"
						}
					]
				}, {
					key: "width",
					text: "Width",
					visible: false,
					type: "Measure",
					roleKey: MeasureRoleType.axis1,
					availableRoles: [
						{
							key: MeasureRoleType.axis1,
							text: "Axis 1"
						}, {
							key: MeasureRoleType.axis2,
							text: "Axis 2"
						}, {
							key: MeasureRoleType.axis3,
							text: "Axis 3"
						}
					]
				}
			],
			// Note: the order the model items should be initially the same as the table items in the P13nPanel (sorted by text)
			SortItems: [
				{
					key: "bmw",
					text: "BMW",
					selected: true,
					sortOrder: "Descending"
				}, {
					key: "productId",
					text: "Product ID",
					selected: true,
					sortOrder: "Descending"
				}, {
					key: "currencyCode",
					text: "Currency Code",
					selected: false,
					sortOrder: undefined
				}, {
					key: "description",
					text: "Description",
					selected: false,
					sortOrder: undefined
				}, {
					key: "price",
					text: "Price",
					selected: false,
					sortOrder: undefined
				}, {
					key: "quantity",
					text: "Quantity",
					selected: false,
					sortOrder: undefined
				}, {
					key: "sap",
					text: "SAP",
					selected: false,
					sortOrder: undefined
				}, {
					key: "status",
					text: "Status",
					selected: false,
					sortOrder: undefined
				}, {
					key: "supplierName",
					text: "Supplier Name",
					selected: false,
					sortOrder: undefined
				}
			],
			CurrencyValueList: [
				{
					text: "EUR",
					description: "Euro",
					key: "EUR"
				}, {
					text: "USD",
					description: "US Dollar",
					key: "USD"
				}, {
					text: "JPY",
					description: "Yen",
					key: "JPY"
				}
			],
			FilterItems: [
				{
					key: "bmw",
					text: "BMW",
					controls: [
						new sap.ui.mdc.base.FilterField({
							dataType: "Edm.String",
							maxConditions: -1,
							conditions: {
								path: "cmodel>/conditions/bmw"
							}
						})
					]
				}, {
					key: "currencyCode",
					text: "Currency Code",
					controls: [
						new sap.ui.mdc.base.FilterField({
							dataType: "Edm.String",
							maxConditions: -1,
							conditions: {
								path: "cmodel>/conditions/currencyCode"
							},
							display: "ValueDescription",
							fieldHelp: "IDVHCurrencyCode",
							dependents: new FieldValueHelp({
								id: "IDVHCurrencyCode",
								filterFields: "*text,description*",
								keyPath: "key",
								descriptionPath: "text",
								showConditionPanel: true,
								content: new FieldValueHelpMTableWrapper({
									table: new sap.m.Table({
										columns: [
											new sap.m.Column({
												header: new sap.m.Label({
													text: "Currency"
												})
											}), new sap.m.Column({
												header: new sap.m.Label({
													text: "Description"
												})
											})
										],
										items: {
											path: '/CurrencyValueList',
											templateShareable: false,
											template: new sap.m.ColumnListItem({
												cells: [
													new sap.m.Text({
														text: "{text}"
													}), new sap.m.Text({
														text: "{description}"
													})
												]
											})
										}
									})
								})
							})
						})
					]
				}, {
					key: "date",
					text: "Date",
					controls: [
						new sap.ui.mdc.base.FilterField({
							dataType: "Edm.Date",
							maxConditions: 1,
							conditions: {
								path: "cmodel>/conditions/status"
							}
						})
					]
				}, {
					key: "description",
					text: "Description",
					controls: [
						new sap.ui.mdc.base.FilterField({
							dataType: "Edm.String",
							maxConditions: -1,
							conditions: {
								path: "cmodel>/conditions/description"
							}
						})
					]
				}, {
					key: "price",
					text: "Price",
					controls: [
						new sap.ui.mdc.base.FilterField({
							dataType: "Edm.String",
							maxConditions: -1,
							conditions: {
								path: "cmodel>/conditions/price"
							}
						})
					]
				}, {
					key: "productId",
					text: "Product ID",
					controls: [
						new sap.ui.mdc.base.FilterField({
							dataType: "Edm.String",
							maxConditions: -1,
							conditions: {
								path: "cmodel>/conditions/productId"
							}
						})
					]
				}, {
					key: "quantity",
					text: "Quantity",
					controls: [
						new sap.ui.mdc.base.FilterField({
							dataType: "Edm.String",
							maxConditions: -1,
							conditions: {
								path: "cmodel>/conditions/quantity"
							}
						})
					]
				}, {
					key: "sap",
					text: "SAP",
					controls: [
						new sap.ui.mdc.base.FilterField({
							dataType: "Edm.String",
							maxConditions: -1,
							conditions: {
								path: "cmodel>/conditions/sap"
							}
						})
					]
				}, {
					key: "supplierName",
					text: "Supplier Name",
					controls: [
						new sap.ui.mdc.base.FilterField({
							dataType: "Edm.String",
							maxConditions: -1,
							conditions: {
								path: "cmodel>/conditions/supplierName"
							}
						})
					]
				}
			],
			VisibilityItems: [
				{
					key: "sap",
					text: "SAP",
					visible: true,
					required: true
				}, {
					key: "bmw",
					text: "BMW",
					visible: true,
					required: true
				}, {
					key: "currencyCode",
					text: "Currency Code",
					visible: false,
					required: false
				}, {
					key: "depth",
					text: "Depth",
					visible: false,
					required: false
				}, {
					key: "description",
					text: "Description",
					visible: false,
					required: false
				}, {
					key: "dimUnit",
					text: "DimUnit",
					visible: false,
					required: false
				}, {
					key: "height",
					text: "Height",
					visible: false,
					required: false
				}, {
					key: "price",
					text: "Price",
					visible: false,
					required: false
				}, {
					key: "productId",
					text: "Product ID",
					visible: false,
					required: false
				}, {
					key: "productPicUrl",
					text: "ProductPicUrl",
					visible: false,
					required: false
				}, {
					key: "quantity",
					text: "Quantity",
					visible: false,
					required: false
				}, {
					key: "status",
					text: "Status",
					visible: false,
					required: false
				}, {
					key: "supplierName",
					text: "Supplier Name",
					visible: false,
					required: false
				}, {
					key: "uom",
					text: "UoM",
					visible: false,
					required: false
				}, {
					key: "weightMeasure",
					text: "Weight Measure",
					visible: false,
					required: false
				}, {
					key: "weightUnit",
					text: "WeightUnit",
					visible: false,
					required: false
				}, {
					key: "width",
					text: "Width",
					visible: false,
					required: false
				}
			],
			ChartType: "line",
			ShowResetEnabledOfChartPanel: false,
			ShowResetEnabledOfChartPanelModal: false,
			ShowResetEnabledOfSortPanel: false,
			ShowResetEnabledOfFilterPanel: false,
			ShowResetEnabledOfVisibilityPanel: false
		},

		// Runtime model
		oJSONModel: null,

		oDataBeforeOpen: {},

		onInit: function () {
			this.oJSONModel = new JSONModel(jQuery.extend(true, {}, this.oDataInitial));
			this.oJSONModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this.getView().setModel(this.oJSONModel);

			// Invisible table which contains the condition model
			var oTable = new Table({
				items: {
					path: "/FilterItems",
					template: new sap.m.ColumnListItem({
						cells: [
							new sap.m.Text({
								text: "{text}"
							})
						]
					})
				}
			});
			oTable.setModel(this.oJSONModel);
			this.oCMRuntime = ConditionModel.getFor(oTable.getBinding("items"));
			this.oCMRuntime.addCondition("bmw", Condition.createCondition("EEQ", [
				"22134T"
			]));
			this.oCMInitial = this.oCMRuntime.clone();
		},

		onVisibilityDialogPress: function (oEvent) {
			var bIsPopover = !this.byId("cb").getSelected();
			var oPanel = new VisibilityPanel({
				showReset: true,
				showResetEnabled: {
					path: '/ShowResetEnabledOfVisibilityPanel'
				},
				source: oEvent.getSource(),
				items: {
					path: '/VisibilityItems',
					templateShareable: false,
					template: new VisibilityPanelItem({
						key: "{key}",
						text: "{text}",
						required: "{required}",
						visible: "{visible}"
					})
				},
				initialOrderChanged: function (oEvent) {
					var aRuntimeItems = this.oJSONModel.getProperty("/VisibilityItems");
					var aRuntimeItemsOrdered = [];
					oEvent.getParameter("keys").forEach(function (sKey) {
						aRuntimeItemsOrdered.push(this._getArrayElementByKey(sKey, aRuntimeItems));
					}.bind(this));
					this.oJSONModel.setProperty("/VisibilityItems", aRuntimeItemsOrdered);
				}.bind(this),
				visibilityChanged: function () {
					this.oJSONModel.setProperty("/ShowResetEnabledOfVisibilityPanel", this._isDirtyVisibility());
				}.bind(this),
				positionChanged: function (oEvent) {
					// Update the JSON model as the moving of aggregation items is responsible the controller and not the SortPanel
					var aRuntimeItems = this.oJSONModel.getProperty("/VisibilityItems");
					var oMItem = this._getArrayElementByKey(oEvent.getParameter("key"), aRuntimeItems);
					aRuntimeItems.splice(aRuntimeItems.indexOf(oMItem), 1);
					aRuntimeItems.splice(oEvent.getParameter("position"), 0, oMItem);
					this.oJSONModel.setProperty("/VisibilityItems", aRuntimeItems);

					this.oJSONModel.setProperty("/ShowResetEnabledOfVisibilityPanel", this._isDirtyVisibility());
				}.bind(this),
				reset: function () {
					this.oJSONModel.setProperty("/", jQuery.extend(true, [], this.oDataInitial));
					oPanel.initialize();
				}.bind(this)
			});
			oPanel.setModel(this.oJSONModel);
			var Container;
			if (bIsPopover) {
				Container = ResponsivePopover;
			} else {
				Container = Dialog;
			}
			var oDialog = this._createDialog(Container, oPanel, !bIsPopover, this.oJSONModel, oEvent.getSource(), "visibility.PERSONALIZATION_DIALOG_TITLE");
			this.oJSONModel.setProperty("/ShowResetEnabledOfSortPanel", this._isDirtyVisibility());
			this.getView().addDependent(oDialog);
			if (bIsPopover) {
				oDialog.openBy(oEvent.getSource());
			} else {
				oDialog.open();
			}
		},
		onSortDialogPress: function (oEvent) {
			var bIsPopover = !this.byId("cb").getSelected();
			var oPanel = new SortPanel({
				showReset: true,
				showResetEnabled: {
					path: '/ShowResetEnabledOfSortPanel'
				},
				source: oEvent.getSource(),
				items: {
					path: '/SortItems',
					templateShareable: false,
					template: new SortPanelItem({
						key: "{key}",
						text: "{text}",
						sortOrder: "{sortOrder}",
						selected: "{selected}"
					})
				},
				initialOrderChanged: function (oEvent) {
					var aRuntimeItems = this.oJSONModel.getProperty("/SortItems");
					var aRuntimeItemsOrdered = [];
					oEvent.getParameter("keys").forEach(function (sKey) {
						aRuntimeItemsOrdered.push(this._getArrayElementByKey(sKey, aRuntimeItems));
					}.bind(this));
					this.oJSONModel.setProperty("/SortItems", aRuntimeItemsOrdered);
				}.bind(this),
				positionChanged: function (oEvent) {
					// Update the JSON model as the moving of aggregation items is responsible the controller and not the SortPanel
					var aRuntimeItems = this.oJSONModel.getProperty("/SortItems");
					var oMItem = this._getArrayElementByKey(oEvent.getParameter("key"), aRuntimeItems);
					aRuntimeItems.splice(aRuntimeItems.indexOf(oMItem), 1);
					aRuntimeItems.splice(oEvent.getParameter("position"), 0, oMItem);
					this.oJSONModel.setProperty("/SortItems", aRuntimeItems);

					this.oJSONModel.setProperty("/ShowResetEnabledOfSortPanel", this._isDirtySort());
				}.bind(this),
				sortCreated: function () {
					this.oJSONModel.setProperty("/ShowResetEnabledOfSortPanel", this._isDirtySort());
				}.bind(this),
				sortRemoved: function () {
					this.oJSONModel.setProperty("/ShowResetEnabledOfSortPanel", this._isDirtySort());
				}.bind(this),
				sortOrderChanged: function () {
					this.oJSONModel.setProperty("/ShowResetEnabledOfSortPanel", this._isDirtySort());
				}.bind(this),
				reset: function () {
					this.oJSONModel.setProperty("/", jQuery.extend(true, [], this.oDataInitial));
					oPanel.initialize();
				}.bind(this)
			});
			oPanel.setModel(this.oJSONModel);
			var Container;
			if (bIsPopover) {
				Container = ResponsivePopover;
			} else {
				Container = Dialog;
			}
			var oDialog = this._createDialog(Container, oPanel, !bIsPopover, this.oJSONModel, oEvent.getSource(), "sort.PERSONALIZATION_DIALOG_TITLE");
			this.oJSONModel.setProperty("/ShowResetEnabledOfSortPanel", this._isDirtySort());
			this.getView().addDependent(oDialog);
			if (bIsPopover) {
				oDialog.openBy(oEvent.getSource());
			} else {
				oDialog.open();
			}
		},
		onChartDialogPress: function (oEvent) {
			var bIsPopover = !this.byId("cb").getSelected();
			var oPanel = new ChartPanel({
				showReset: true,
				showResetEnabled: {
					path: '/ShowResetEnabledOfChartPanel'
				},
				source: oEvent.getSource(),
				items: {
					path: '/ChartItems',
					templateShareable: false,
					template: new ChartPanelItem({
						key: "{key}",
						text: "{text}",
						type: "{type}",
						roleKey: "{roleKey}",
						availableRoles: {
							path: 'availableRoles',
							templateShareable: false,
							template: new Item({
								key: "{key}",
								text: "{text}"
							})
						},
						visible: "{visible}"
					})
				},
				initialOrderChanged: function (oEvent) {
					var aRuntimeItems = this.oJSONModel.getProperty("/ChartItems");
					var aRuntimeItemsOrdered = [];
					oEvent.getParameter("keys").forEach(function (sKey) {
						aRuntimeItemsOrdered.push(this._getArrayElementByKey(sKey, aRuntimeItems));
					}.bind(this));
					this.oJSONModel.setProperty("/ChartItems", aRuntimeItemsOrdered);
				}.bind(this),
				visibilityChanged: function () {
					this.oJSONModel.setProperty("/ShowResetEnabledOfChartPanel", this._isDirtyChart());
				}.bind(this),
				positionChanged: function (oEvent) {
					// Update the JSON model as the moving of aggregation items is responsible the controller and not the ChartPanel
					var aRuntimeItems = this.oJSONModel.getProperty("/ChartItems");
					var oMItem = this._getArrayElementByKey(oEvent.getParameter("key"), aRuntimeItems);
					aRuntimeItems.splice(aRuntimeItems.indexOf(oMItem), 1);
					aRuntimeItems.splice(oEvent.getParameter("position"), 0, oMItem);
					this.oJSONModel.setProperty("/ChartItems", aRuntimeItems);

					this.oJSONModel.setProperty("/ShowResetEnabledOfChartPanel", this._isDirtyChart());
				}.bind(this),
				roleChanged: function () {
					this.oJSONModel.setProperty("/ShowResetEnabledOfChartPanel", this._isDirtyChart());
				}.bind(this),
				reset: function () {
					this.oJSONModel.setProperty("/", jQuery.extend(true, [], this.oDataInitial));
					oPanel.initialize();
				}.bind(this)
			});
			oPanel.setModel(this.oJSONModel);
			var Container;
			if (bIsPopover) {
				Container = ResponsivePopover;
			} else {
				Container = Dialog;
			}
			var oDialog = this._createDialog(Container, oPanel, !bIsPopover, this.oJSONModel, oEvent.getSource(), "chart.PERSONALIZATION_DIALOG_TITLE");
			this.oJSONModel.setProperty("/ShowResetEnabledOfSortPanel", this._isDirtyChart());
			this.getView().addDependent(oDialog);
			if (bIsPopover) {
				oDialog.openBy(oEvent.getSource());
			} else {
				oDialog.open();
			}
		},
		onFilterDialogPress: function (oEvent) {
			var bIsPopover = !this.byId("cb").getSelected();
			var fnOnChange = function () {
				this.oJSONModel.setProperty("/ShowResetEnabledOfFilterPanel", this._isDirtyFilter());
			};
			var fnOnOpen = function () {
				var oDialog = this.oDialog;
				if (oDialog) {
					oDialog.setModal(true);
				}
			};
			var fnOnAfterClose = function () {
				var oDialog = this.oDialog;
				if (oDialog) {
					oDialog.setModal(false);
				}
			};
			var oPanel = new FilterPanel({
				showReset: true,
				showResetEnabled: {
					path: '/ShowResetEnabledOfFilterPanel'
				},
				source: oEvent.getSource(),
				items: {
					path: '/FilterItems',
					templateShareable: false,
					template: new FilterPanelItem({
						key: "{key}",
						text: "{text}",
						tooltip: "{text}",
						controls: {
							path: 'controls',
							templateShareable: false,
							factory: function (sId, oBindingContext) {
								var oFilterFieldClone = oBindingContext.getObject(oBindingContext.getPath()).clone();
								oFilterFieldClone.attachChange(fnOnChange, this);
								if (oFilterFieldClone.getFieldHelp()) {
									var oFieldValueHelp = sap.ui.getCore().byId(oFilterFieldClone.getFieldHelp());
									oFieldValueHelp.attachOpen(fnOnOpen, this);
									oFieldValueHelp.attachAfterClose(fnOnAfterClose, this);
								}
								return oFilterFieldClone;
							}.bind(this)
						}
					})
				},
				initialOrderChanged: function (oEvent) {
					var aRuntimeItems = this.oJSONModel.getProperty("/FilterItems");
					var aRuntimeItemsOrdered = [];
					oEvent.getParameter("keys").forEach(function (sKey) {
						aRuntimeItemsOrdered.push(this._getArrayElementByKey(sKey, aRuntimeItems));
					}.bind(this));
					this.oJSONModel.setProperty("/FilterItems", aRuntimeItemsOrdered);
				}.bind(this),
				positionChanged: function (oEvent) {
					// Update the JSON model as the moving of aggregation items is responsible the controller and not the FilterPanel
					var aRuntimeItems = this.oJSONModel.getProperty("/FilterItems");
					var oMItem = this._getArrayElementByKey(oEvent.getParameter("key"), aRuntimeItems);
					aRuntimeItems.splice(aRuntimeItems.indexOf(oMItem), 1);
					aRuntimeItems.splice(oEvent.getParameter("position"), 0, oMItem);
					this.oJSONModel.setProperty("/FilterItems", aRuntimeItems);

					this.oJSONModel.setProperty("/ShowResetEnabledOfFilterPanel", this._isDirtyFilter());
				}.bind(this),
				reset: function () {
					this.oJSONModel.setProperty("/", jQuery.extend(true, [], this.oDataInitial));
					this.oCMRuntime.setConditions(this.oCMInitial.getAllConditions());
					oPanel.initialize();
				}.bind(this)
			});
			oPanel.setModel(this.oJSONModel);
			var Container;
			if (bIsPopover) {
				Container = ResponsivePopover;
			} else {
				Container = Dialog;
			}
			var oDialog = this._createDialog(Container, oPanel, !bIsPopover, this.oJSONModel, oEvent.getSource(), "filter.PERSONALIZATION_DIALOG_TITLE");
			this.oJSONModel.setProperty("/ShowResetEnabledOfSortPanel", this._isDirtyFilter());
			this.getView().addDependent(oDialog);
			this.oDialog = oDialog;
			if (bIsPopover) {
				oDialog.openBy(oEvent.getSource());
			} else {
				oDialog.open();
			}
		},
		_getArrayElementByKey: function (sValue, aArray) {
			var aElements = aArray.filter(function (oElement) {
				return oElement.key !== undefined && oElement.key === sValue;
			});
			return aElements.length ? aElements[0] : null;
		},
		_isDirtyVisibility: function () {
			var fnIsEqual = function (aDataBase, aDataRuntime) {
				if (aDataBase.length !== aDataRuntime.length) {
					return false;
				}
				var aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
					return oDataBase.key !== aDataRuntime[iIndex].key || oDataBase.visible !== aDataRuntime[iIndex].visible;
				});
				return aItemsNotEqual.length === 0;
			};

			return !fnIsEqual(this.oDataInitial.VisibilityItems, this.oJSONModel.getProperty("/VisibilityItems"));
		},
		_isDirtySort: function () {
			var fnIsEqual = function (aDataBase, aDataRuntime) {
				if (aDataBase.length !== aDataRuntime.length) {
					return false;
				}
				var aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
					return oDataBase.key !== aDataRuntime[iIndex].key || oDataBase.selected !== aDataRuntime[iIndex].selected || oDataBase.sortOrder !== aDataRuntime[iIndex].sortOrder;
				});
				return aItemsNotEqual.length === 0;
			};

			return !fnIsEqual(this.oDataInitial.SortItems, this.oJSONModel.getProperty("/SortItems"));
		},
		_isDirtyFilter: function () {
			var fnItemsEqual = function (aDataBase, aDataRuntime) {
				if (aDataBase.length !== aDataRuntime.length) {
					return false;
				}
				var aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
					return oDataBase.key !== aDataRuntime[iIndex].key;
				});

				return aItemsNotEqual.length === 0;
			};
			var fnConditionsEqual = function (aCMBase, aCMRuntime) {
				var sPath;
				var oBaseConditions = aCMBase.getAllConditions();
				for (sPath in oBaseConditions) {
					if (oBaseConditions[sPath].length !== aCMRuntime.getConditions(sPath).length) {
						return false;
					}
				}
				var oRuntimeConditions = aCMRuntime.getAllConditions();
				for (sPath in oRuntimeConditions) {
					if (oRuntimeConditions[sPath].length !== aCMBase.getConditions(sPath).length) {
						return false;
					}
				}
				return true;
			};

			return !fnItemsEqual(this.oDataInitial.FilterItems, this.oJSONModel.getProperty("/FilterItems")) || !fnConditionsEqual(this.oCMInitial, this.oCMRuntime);
		},
		_createDialog: function (Container, oPanel, bIsModal, oJSONModelRuntime, oControl, sMessageIdForTitle) {
			var oContainer;
			var oDataBeforeOpen = jQuery.extend(true, {}, oJSONModelRuntime.getProperty("/"));
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			if (!bIsModal) {
				//Livechanges: create a Popover and instantly apply every change
				oPanel.initialize();
				oContainer = new Container({
					title: oResourceBundle.getText(sMessageIdForTitle),
					horizontalScrolling: false,
					verticalScrolling: false,
					contentWidth: "25rem",
					resizable: true,
					placement: "HorizontalPreferredRight",
					content: oPanel
				});
			} else {
				//Modal Dialog: create a Dialog and collect every change made during runtime in aRuntimeChanges
				oPanel.initialize();
				oContainer = new Container({
					title: oResourceBundle.getText(sMessageIdForTitle),
					horizontalScrolling: false,
					contentWidth: "40rem",
					contentHeight: "55rem",
					draggable: true,
					resizable: true,
					stretch: "{device>/system/phone}",
					afterClose: "onAfterClose",
					content: oPanel,
					buttons: [
						new Button({
							text: oResourceBundle.getText("p13nDialog.OK"),
							type: "Emphasized",
							press: function () {
								//Apply the collected changes from aRuntimeChanges
								oContainer.close();
								oContainer.destroy();
							}
						}),
						new Button({
							text: oResourceBundle.getText("p13nDialog.CANCEL"),
							press: function () {
								//Discard the collected changes from aRuntimeChanges
								oContainer.close();
								oContainer.destroy();
								oJSONModelRuntime.setProperty("/", jQuery.extend(true, {}, oDataBeforeOpen));
							}
						})
					]
				});
			}
			//Add custom style class in order to display marked items accordingly
			oContainer.addStyleClass("sapUiMdcPersonalizationDialog");
			// Set compact style class if the table is compact too
			oContainer.toggleStyleClass("sapUiSizeCompact", !!jQuery(oControl.getDomRef()).closest(".sapUiSizeCompact").length);
			return oContainer;
		},
		_isModalSwitchedOn: function () {
			return jQuery.sap.getUriParameters().get("P13nModal") === "true";
		},
		_isDirtyChart: function () {
			var fnIsEqual = function (aDataBase, aDataRuntime) {
				if (aDataBase.length !== aDataRuntime.length) {
					return false;
				}

				var aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
					return oDataBase.key !== aDataRuntime[iIndex].key || oDataBase.visible !== aDataRuntime[iIndex].visible || oDataBase.role !== aDataRuntime[iIndex].role;
				});
				return aItemsNotEqual.length === 0;
			};

			return (this.oDataInitial.ChartType !== this.oJSONModel.getProperty("/ChartType")) || !fnIsEqual(this.oDataInitial.ChartItems, this.oJSONModel.getProperty("/ChartItems"));
		}

	});
}, true);
