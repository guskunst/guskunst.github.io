sap.ui.define([
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/MessageItem",
	"sap/m/MessageView",
	"sap/m/Text",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/ui/layout/VerticalLayout"
], function (Dialog, Button, MessageItem, MessageView, Text, RadioButton, RadioButtonGroup, VerticalLayout) {
	"use strict";
	var UI5ControlFactory = {};

	UI5ControlFactory.getDialogControl = function (mSettings) {
		return new Dialog(mSettings);
	};

	UI5ControlFactory.getButtonControl = function (mSettings) {
		return new Button(mSettings);
	};

	UI5ControlFactory.getMessageItem = function (mSettings) {
		return new MessageItem(mSettings);
	};

	UI5ControlFactory.getMessageView = function (mSettings) {
		return new MessageView(mSettings);
	};

	UI5ControlFactory.getText = function(mSettings) {
		return new Text(mSettings);
	};

	UI5ControlFactory.getRadioButton = function(mSettings) {
		return new RadioButton(mSettings);
	};

	UI5ControlFactory.getRadioButtonGroup = function(mSettings) {
		return new RadioButtonGroup(mSettings);
	};

	UI5ControlFactory.getVerticalLayout = function(mSettings) {
		return new VerticalLayout(mSettings);
	};

	return UI5ControlFactory;
}, true);
