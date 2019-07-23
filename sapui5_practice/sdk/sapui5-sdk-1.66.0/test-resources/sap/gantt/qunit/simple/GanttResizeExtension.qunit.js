/*global QUnit sinon*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/gantt/simple/BaseRectangle",
	"sap/gantt/simple/GanttRowSettings",
	"sap/gantt/simple/test/GanttQUnitUtils"
], function (qutils, BaseRectangle, GanttRowSettings, utils) {
	"use strict";

	QUnit.module("Interaction - Shape selection and resizing", {
		beforeEach: function(assert){
			var done = assert.async();
			var oRowSettings = new GanttRowSettings({
				rowId: "{Id}",
				shapes1: [
					new BaseRectangle({
						shapeId: "{Id}",
						time: "{StartDate}",
						endTime: "{EndDate}",
						title: "{Name}",
						fill: "#008FD3",
						selectable: true,
						resizable: true
					})
				]
			});
			utils.createGantt(false, oRowSettings);
			setTimeout(function () {
				done();
			},2000);
		},
		afterEach: function(assert) {
			var done = assert.async();
			utils.destroyGantt();
			setTimeout(function () {
				done();
			},1000);
		},
		getFirstShape: function(){
			var oFirstShape = window.oGanttChart.getTable().getRows()[0].getAggregation("_settings").getShapes1()[0];
			return oFirstShape;
		},

		delayedAssert: function(fnAssertion) {
			setTimeout(function(){
				fnAssertion();
			}, 2000);
		}
	});

	QUnit.test("Interaction - Resizable outline redering", function (assert) {
		var done = assert.async();
		this.delayedAssert(function() {
			//Arrange
			var oResizeOutline = window.oGanttChart._getResizeExtension();
			var oRect = this.getFirstShape();
			var sRectElementId = oRect.getShapeUid();
			//Act
			oRect.setSelected(true, true/**suppressInvalidate*/);
			oResizeOutline.toggleOutline(oRect);
			var oSelectionDom = document.getElementById(sRectElementId + "-selected");
			var $ShapeSelectionRoot = jQuery(oSelectionDom);
			var $BorderTop = $ShapeSelectionRoot.find(".border.topLine");
			var $BorderRight = $ShapeSelectionRoot.find(".border.rightLine");
			var $BorderBottom = $ShapeSelectionRoot.find(".border.bottomLine");
			var $BorderLeft = $ShapeSelectionRoot.find(".border.leftLine");
			var $LineTriggerLeft = $ShapeSelectionRoot.find(".lineTrigger.leftTrigger");
			var $LineTriggerRight = $ShapeSelectionRoot.find(".lineTrigger.rightTrigger");
			var $RectTriggerLeft = $ShapeSelectionRoot.find(".rectTrigger.leftTrigger");
			var $RectTriggerRight = $ShapeSelectionRoot.find(".rectTrigger.rightTrigger");
			var $ResizeCover = $ShapeSelectionRoot.find(".resizeCover");
			//Assert
			assert.strictEqual($ShapeSelectionRoot.length, 1, "Shape selection root node is rendered");
			assert.strictEqual($BorderTop.length, 1, "Top outline is rendered");
			assert.strictEqual($BorderRight.length, 1, "Right outline is rendered");
			assert.strictEqual($BorderBottom.length, 1, "Bottom outline is rendered");
			assert.strictEqual($BorderLeft.length, 1, "Left outline is rendered");
			assert.strictEqual($LineTriggerLeft.length, 1, "Left line trigger is rendered");
			assert.strictEqual($LineTriggerRight.length, 1, "Right line trigger is rendered");
			assert.strictEqual($RectTriggerLeft.length, 0, "Left Rect trigger is rendered");
			assert.strictEqual($RectTriggerRight.length, 0, "Right Rect trigger is rendered");
			assert.strictEqual($ResizeCover.length, 1, "Resize cover is rendered");

			done();
		}.bind(this));
	});
	QUnit.test("Interaction - Trigger cursor style", function (assert) {
		var done = assert.async();
		this.delayedAssert(function() {
			//Arrange
			var oResizeOutline = window.oGanttChart._getResizeExtension();
			var oRect = this.getFirstShape();
			var sRectElementId = oRect.getShapeUid();
			//Act
			oRect.setSelected(true, true/**suppressInvalidate*/);
			oResizeOutline.toggleOutline(oRect);
			var oSelectionDom = document.getElementById(sRectElementId + "-selected");
			var $ShapeSelectionRoot = jQuery(oSelectionDom);
			var $LineTriggerLeft = $ShapeSelectionRoot.find(".lineTrigger.leftTrigger");
			var $LineTriggerRight = $ShapeSelectionRoot.find(".lineTrigger.rightTrigger");
			qutils.triggerEvent("mouseover", $LineTriggerLeft);
			//Assert
			assert.strictEqual($LineTriggerRight.css("cursor"),"ew-resize", "Mouse cursor style of left resize trigger");
			//Act
			qutils.triggerEvent("mouseover", $LineTriggerRight);
			//Assert
			assert.strictEqual($LineTriggerRight.css("cursor"),"ew-resize", "Mouse cursor style of left resize trigger");
			done();
		}.bind(this));
	});

	QUnit.test("Interaction - Resize shape", function (assert) {
		var done = assert.async();
		this.delayedAssert(function() {
			//Arrange
			var oResizeOutline = window.oGanttChart._getResizeExtension();
			var oRect = this.getFirstShape();
			var sRectElementId = oRect.getShapeUid();
			var oEndResizingSpy = sinon.spy(oResizeOutline, "_fireShapeResizeEvent");
			var $Svg = jQuery("#" + window.oGanttChart.getId() + " svg.sapGanttChartSvg");
			//Act
			oRect.setSelected(true, true/**suppressInvalidate*/);
			oResizeOutline.toggleOutline(oRect);
			var oSelectionDom = document.getElementById(sRectElementId + "-selected");
			var $ShapeSelectionRoot = jQuery(oSelectionDom);
			var $LineTriggerLeft = $ShapeSelectionRoot.find(".lineTrigger.leftTrigger");
			var $LineTriggerRight = $ShapeSelectionRoot.find(".lineTrigger.rightTrigger");
			var oPositionTriggerLeftX = $LineTriggerLeft.position().left;
			var oPositionTriggerRightX = $LineTriggerLeft.position().left;
			//Act
			qutils.triggerEvent("mousedown", $LineTriggerRight);
			qutils.triggerMouseEvent($Svg, "mousemove", 0, 0, oPositionTriggerRightX, 10, 0);
			//Assert
			assert.ok(oResizeOutline.isResizing(), "Right Resizing");
			//Act
			qutils.triggerMouseEvent($Svg, "mouseup", 0, 0, oPositionTriggerRightX - 2, 10, 0);
			//Assert
			assert.ok(oEndResizingSpy.called, "Right Resizing End");

			oSelectionDom = document.getElementById(sRectElementId + "-selected");
			$ShapeSelectionRoot = jQuery(oSelectionDom);
			$LineTriggerLeft = $ShapeSelectionRoot.find(".lineTrigger.leftTrigger");
			oPositionTriggerLeftX = $LineTriggerLeft.position().left;
			qutils.triggerEvent("mousedown", $LineTriggerLeft);
			qutils.triggerMouseEvent($Svg, "mousemove", 0, 0, oPositionTriggerLeftX, 10, 0);
			//Assert
			assert.ok(oResizeOutline.isResizing(), "Left Resizing");
			qutils.triggerKeydown($Svg, jQuery.sap.KeyCodes.ESCAPE);
			//Assert
			assert.strictEqual(oResizeOutline.isResizing(), false, "Resizing cancelled");
			//Act
			qutils.triggerMouseEvent($Svg, "mouseup", 0, 0, oPositionTriggerLeftX - 2, 0, 0);
			done();
		}.bind(this));
	});
	QUnit.test("Interaction - Deselect shape", function (assert) {
		var done = assert.async();
		this.delayedAssert(function() {
			//Arrange
			var oResizeOutline = window.oGanttChart._getResizeExtension();
			var oRect = this.getFirstShape();
			var sRectElementId = oRect.getShapeUid();
			//Act
			oRect.setSelected(true, true/**suppressInvalidate*/);
			oResizeOutline.toggleOutline(oRect);
			var oSelectionDom = document.getElementById(sRectElementId + "-selected");
			var $ShapeSelectionRoot = jQuery(oSelectionDom);
			//Assert
			assert.strictEqual($ShapeSelectionRoot.length, 1, "Shape selection outline is rendered");
			oRect.setSelected(false, true/**suppressInvalidate*/);
			oResizeOutline.toggleOutline(oRect);
			oSelectionDom = document.getElementById(sRectElementId + "-selected");
			$ShapeSelectionRoot = jQuery(oSelectionDom);
			//Assert
			assert.strictEqual($ShapeSelectionRoot.length, 0, "Shape selection outline is removed");

			//Act
			oRect.setResizable(false, true/**suppressInvalidate*/);
			oRect.setSelected(true, true/**suppressInvalidate*/);
			this.delayedAssert(function() {

				oResizeOutline.toggleOutline(oRect);
				oSelectionDom = document.getElementById(sRectElementId + "-selected");
				$ShapeSelectionRoot = jQuery(oSelectionDom);
				//Assert
				assert.strictEqual($ShapeSelectionRoot.length, 1, "Default non-resizable outline is rendered");
				oRect.setSelected(false, true/**suppressInvalidate*/);
				oResizeOutline.toggleOutline(oRect);
				oSelectionDom = document.getElementById(sRectElementId + "-selected");
				$ShapeSelectionRoot = jQuery(oSelectionDom);
				//Assert
				assert.strictEqual($ShapeSelectionRoot.length, 0, "Default non-resizable outline is removed");

				done();
			});
		}.bind(this));
	});
});
