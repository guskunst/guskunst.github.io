/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/mdc/library', '../ActionToolbar', 'sap/m/Title', 'sap/m/OverflowToolbarButton', 'sap/m/OverflowToolbarToggleButton', "sap/ui/mdc/chart/ChartTypeButton", 'sap/ui/mdc/chart/ChartSettings'
], function(MDCLib, ActionToolbar, Title, OverflowButton, OverflowToggleButton, ChartTypeButton, ChartSettings) {
	"use strict";
	/**
	 * Toolbar helper class for sap.ui.mdc.Chart.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.chart.ToolbarHandler
	 */
	var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	var ToolbarHandler = {
		/**
		 *
		 * Creates a new toolbar for the mdc.Chart based on actions
		 */
		createToolbar: function(oChart, aUserActions) {
			if (!oChart.getAggregation("_toolbar")) {
				var oToolbar = new ActionToolbar(oChart.getId() + "--toolbar", {
					design: "Transparent",
					begin: [
						new Title(oChart.getId() + "-title", {
							text: oChart.getHeader()
						})
					],
					actions: aUserActions
				});
				oChart.setAggregation("_toolbar", oToolbar);

				this.updateToolbar(oChart);
			}
		},
		/**
		 *
		 * Updates the mdc.Chart toolbar content
		 */
		updateToolbar: function(oChart) {
			var oToolbar = oChart.getAggregation("_toolbar");
			if (!oToolbar) {
				return;
			}
			oToolbar.destroyEnd();

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.ZoomInOut) < 0) {
				oToolbar.addEnd(new OverflowButton({
					tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
					icon: "sap-icon://zoom-in",
					enabled: "{= ${$mdcChart>/_chart/getZoomInfo/enabled} && ${$mdcChart>/_chart/getZoomInfo/currentZoomLevel} < 1}",
					press: [
						function() {
							var oChart = oChart.getAggregation("_chart");
							oChart.zoom({
								direction: "in"
							});
							oChart._oManagedObjectModel.checkUpdate();
						}, oChart
					]
				}));
				oToolbar.addEnd(new OverflowButton({
					tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
					icon: "sap-icon://zoom-out",
					enabled: "{= ${$mdcChart>/_chart/getZoomInfo/enabled} && ${$mdcChart>/_chart/getZoomInfo/currentZoomLevel} > 0}",
					press: [
						function() {
							var oChart = oChart.getAggregation("_chart");
							oChart.zoom({
								direction: "out"
							});
							oChart._oManagedObjectModel.checkUpdate();
						}, oChart
					]
				}));
			}

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.DrillDownUp) < 0) {
				oChart._oDrillDownBtn = new OverflowButton(oChart.getId() + "-drillDown", {
					icon: "sap-icon://drill-down",
					text: "View By",
					tooltip: "View By",
					press: [
						oChart._showDrillDown, oChart
					]
				});
				oToolbar.addEnd(oChart._oDrillDownBtn);
			}

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.Legend) < 0) {
				oToolbar.addEnd(new OverflowToggleButton({
					type: "Transparent",
					text: MDCRb.getText("chart.LEGENDBTN_TEXT"),
					tooltip: MDCRb.getText("chart.LEGENDBTN_TOOLTIP"),
					icon: "sap-icon://legend",
					pressed: "{$mdcChart>/legendVisible}"
				}));
			}
			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.P13nOfVisibility) < 0) {
				oToolbar.addEnd(new OverflowButton(oChart.getId() + "-chart_settings", {
					icon: "sap-icon://action-settings",//TODO the right icon for P13n chart dialog
					tooltip: MDCRb.getText('chart.PERSONALIZATION_DIALOG_TITLE'),
					press: function(oEvent) {
						var oSource = oEvent.getSource();
						oChart._getPropertyData().then(function(aProperties) {
							ChartSettings.showPanel(oChart, "Chart", oSource, aProperties);
						});
					}
				}));
			}
			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.P13nOfSort) < 0) {
				oToolbar.addEnd(new OverflowButton(oChart.getId() + "-sort_settings", {
					icon: "sap-icon://sort",
					tooltip: MDCRb.getText('sort.PERSONALIZATION_DIALOG_TITLE'),
					press: function(oEvent) {
						var oSource = oEvent.getSource();
						oChart._getPropertyData().then(function(aProperties) {
							ChartSettings.showPanel(oChart, "Sort", oSource, aProperties);
						});
					}
				}));
			}
			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.P13nOfFilter) < 0) {
				oToolbar.addEnd(new OverflowButton(oChart.getId() + "-filter_settings", {
					icon: "sap-icon://filter",
					tooltip: MDCRb.getText('filter.PERSONALIZATION_DIALOG_TITLE'),
					press: function(oEvent) {
						var oSource = oEvent.getSource();
						sap.ui.require([
							"sap/ui/mdc/base/personalization/Controller", "sap/ui/mdc/flexibility/Chart.flexibility"
						], function(Controller, ChartFlexibility) {
							oChart._getP13nStateOfFilter().then(function(mP13nState) {
								Controller.showFilterDialog(oSource, mP13nState.initialData, mP13nState.runtimeData, mP13nState.runtimeData.modelName, mP13nState.runtimeData.model, oChart, function(aChangeData) {
									aChangeData.forEach(function(oChangeData) {
										Controller.addChange(ChartFlexibility, oChangeData.changeType, oChangeData, false);
									});
								});
							});
						});
					}
				}));
			}
			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.P13nOfChartType) < 0) {
				oToolbar.addEnd(new ChartTypeButton(oChart));
			}
			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.FullScreen) < 0) {
				oToolbar.addEnd(new OverflowButton({
					icon: "{= ${$mdcChart>/fullScreen} ? 'sap-icon://exit-full-screen' : 'sap-icon://full-screen'}",
					press: [
						function() {
							oChart.setFullScreen(!oChart.getFullScreen());
							oChart._oManagedObjectModel.checkUpdate(true);
						}, oChart
					]
				}));
			}
		}
	};
	return ToolbarHandler;
});
