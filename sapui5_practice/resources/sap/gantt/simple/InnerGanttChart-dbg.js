/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"./GanttExtension"
],
	function (
		jQuery,
		Core,
		Control,
		GanttExtension
	) {
	"use strict";

	/**
	 * Inner Gantt Chart, the purpose for this class is to decouple the rendering cycle with Table in GanttChartWithTable.
	 * Use it in application is prohibited and not supported.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSetting] Initial settings for the new control
	 *
	 * @class
	 * Inner Gantt Chart is responsible for rendering the content of gantt chart
	 *
	 * @extend sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.66.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.gantt.simple.InnerGanttChart
	 */
	var InnerGanttChart = Control.extend("sap.gantt.simple.InnerGanttChart");

	InnerGanttChart.prototype.getDomRef = function() {
		var oParent = this.getParent();
		if (oParent) {
			return jQuery.sap.domById(this.getParent().getId() + "-cnt");
		}
		return null;
	};

	InnerGanttChart.prototype.invalidate = function(){
		// do nothing
		this.getUIArea().addInvalidatedControl(this);
	};

	InnerGanttChart.prototype.onAfterRendering = function(oEvent) {
		var oGantt = this.getParent();

		var oRm = Core.createRenderManager();
		this.getRenderer().renderRelationships(oRm, oGantt);
		oRm.destroy();

		// Update shape selections from SelectionModel
		oGantt._updateShapeSelections(oGantt.getSelectedShapeUid(), []);

		// update shape connect effect when vertical scroll
		oGantt._getConnectExtension().updateShapeConnectEffect(oGantt);

		GanttExtension.attachEvents(oGantt);

		oGantt.jumpToVisibleHorizon("initialRender");
	};

	return InnerGanttChart;

}, true);
