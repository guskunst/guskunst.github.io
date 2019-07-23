sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./TimelineTestUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function ($, TestUtils, KeyCodes, createAndAppendDiv) {
	"use strict";

	createAndAppendDiv("content").setAttribute("style", "height: 100%;");

	QUnit.module("TimelineTest");

	var aData = [
		{
			dateTime: new Date(2016, 0, 1),
			title: "Item 1"
		}, {
			dateTime: new Date(2016, 0, 2),
			title: "Item 2"
		}, {
			dateTime: new Date(2016, 0, 3),
			title: "Item 3"
		}
	];

	QUnit.test("Select fired by click", function (assert) {
		var oTimeline = TestUtils.buildTimeline(aData);

		oTimeline.attachSelect(function (oEvent) {
			assert.ok(oEvent.getParameter("userAction"), "Click should fire select with userAction = true");
		});
		oTimeline.placeAt("content");
		sap.ui.getCore().applyChanges();

		oTimeline.getContent()[0].$("outline").mousedown().mouseup().click();

		oTimeline.destroy();
	});

	QUnit.test("Enter key fires select", function (assert) {
		var oTimeline = TestUtils.buildTimeline(aData);

		oTimeline.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oItem = oTimeline.getContent()[0];
		oItem.$("outline").mousedown().mouseup().click();
		oTimeline.attachSelect(function (oEvent) {
			assert.ok(oEvent.getParameter("userAction"), "Enter should fire select with userAction = true");
		});
		var oEvent = $.Event("keypress");
		oEvent.which = KeyCodes.ENTER;
		oEvent.target = oItem.getDomRef("outline");
		oTimeline.oItemNavigation.onsapenter(oEvent);

		oTimeline.destroy();
	});

	QUnit.test("Arrow key fires select without userAction", function (assert) {
		var oTimeline = TestUtils.buildTimeline(aData);

		oTimeline.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oItem = oTimeline.getContent()[0];
		oItem.$("outline").mousedown().mouseup().click();
		oTimeline.attachSelect(function (oEvent) {
			assert.ok(!oEvent.getParameter("userAction"), "Enter should fire select with userAction = true");
		});
		var oEvent = $.Event("keypress");
		oEvent.which = KeyCodes.ARROW_DOWN;
		oEvent.target = oItem.getDomRef("outline");
		oTimeline.oItemNavigation.onsapnext(oEvent);

		oTimeline.destroy();
	});
});
