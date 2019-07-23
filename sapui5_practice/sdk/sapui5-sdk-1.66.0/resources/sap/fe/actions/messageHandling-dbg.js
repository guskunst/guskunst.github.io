/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

// Static functions for Fiori Message Handling
sap.ui.define([
		"sap/fe/factory/UI5ControlFactory",
		"sap/m/MessageToast",
		"sap/ui/core/MessageType"],
	function (UI5ControlFactory, MessageToast, MessageType) {
		'use strict';

		var that = this;

		function fnFormatTechnicalDetails() {
			var sPreviousGroupName;
			// Insert technical detail if it exists
			function insertDetail(oProperty) {
				return oProperty.property ? '( ${' + oProperty.property + '} ? ("<p>' + oProperty.property.substr(Math.max(oProperty.property.lastIndexOf('/'), oProperty.property.lastIndexOf('.')) + 1) + ' : " + ' + '${' + oProperty.property + '} + "<p/>") : "" )' : '';
			}
			// Insert groupname if it exists
			function insertGroupName(oProperty) {
				var sHTML = '';
				if (oProperty.groupName && oProperty.property && oProperty.groupName !== sPreviousGroupName) {
					sHTML += '( ${' + oProperty.property + '} ? "<br/><h3>' + oProperty.groupName + '</h3>" : "" ) + ';
					sPreviousGroupName = oProperty.groupName;
				}
				return sHTML;
			}

			// List of technical details to be shown
			function getPaths() {
				var sTD = "technicalDetails"; // name of property in message model data for technical details
				return [
					{ 'groupName': '', 'property': sTD + "/status"},
					{ 'groupName': '', 'property': sTD + "/statusText"},
					{ 'groupName': 'Application', 'property': sTD + "/error/@SAP__common.Application/ComponentId"},
					{ 'groupName': 'Application', 'property': sTD + "/error/@SAP__common.Application/ServiceId"},
					{ 'groupName': 'Application', 'property': sTD + "/error/@SAP__common.Application/ServiceRepository"},
					{ 'groupName': 'Application', 'property': sTD + "/error/@SAP__common.Application/ServiceVersion"},
					{ 'groupName': 'ErrorResolution', 'property': sTD + "/error/@SAP__common.ErrorResolution/Analysis"},
					{ 'groupName': 'ErrorResolution', 'property': sTD + "/error/@SAP__common.ErrorResolution/Note"},
					{ 'groupName': 'ErrorResolution', 'property': sTD + "/error/@SAP__common.ErrorResolution/DetailedNote"},
					{ 'groupName': 'ErrorResolution', 'property': sTD + "/error/@SAP__common.ExceptionCategory"},
					{ 'groupName': 'ErrorResolution', 'property': sTD + "/error/@SAP__common.TimeStamp"},
					{ 'groupName': 'ErrorResolution', 'property': sTD + "/error/@SAP__common.TransactionId"},
					{ 'groupName': 'Messages', 'property': sTD + "/error/code"},
					{ 'groupName': 'Messages', 'property': sTD + "/error/message"}
				];
			}
			var sHTML = '(${technicalDetails} ? "<h2>Technical Details</h2>" : "") + ';
			getPaths().forEach(function (oProperty) {
				sHTML = sHTML + insertGroupName(oProperty) + '' + insertDetail(oProperty) + ' + ';
			});
			return sHTML;
		}
		function fnFormatDescription() {
			var sHTML =  '(${' + 'description} ? ("<h2>Description</h2>" + ${' + 'description}) : "")';
			return sHTML;
		}

		/**
		 * Shows all unbound (including technical) messages and removes those the ones which are transient
		 * @function
		 * @static
		 * @name sap.fe.actions.messageHandling.showUnboundMessages
		 * @memberof sap.fe.actions.messageHandling
		 * @returns {Promise} Promise resolves once toast disappears / user closes popup
		 * @private
		 * @sap-restricted
		 */
		function showUnboundMessages() {
			var aUnboundMessages = getMessages(),
				oMessageManager = sap.ui.getCore().getMessageManager();

			if (aUnboundMessages.length === 0) {
				// Don't show the popup if there are no transient messages
				return Promise.resolve(true);
			} else if (aUnboundMessages.length === 1 && aUnboundMessages[0].getType() === MessageType.Success) {
				return new Promise(function (resolve, reject) {
					MessageToast.show(aUnboundMessages[0].message);
					oMessageManager.removeMessages(aUnboundMessages);
				});
			} else {
				return new Promise(function (resolve, reject) {
					sap.ui.getCore().getLibraryResourceBundle("sap.fe", true).then(function (oResourceBundle) {
						that.oMessageTemplate = that.oMessageTemplate || UI5ControlFactory.getMessageItem({
							counter: '{counter}',
							title: '{message}',
							subtitle: '{additionalText}',
							longtextUrl: '{descriptionUrl}',
							type: '{type}',
							description: '{= ${' + 'description} || ${technicalDetails} ? ' + '"<html><body>" + ' + fnFormatDescription() + ' + ' + fnFormatTechnicalDetails() + '"</body></html>"' + ' : "" }',
							markupDescription: true
						});
						that.oMessageView = that.oMessageView || UI5ControlFactory.getMessageView({
							showDetailsPageHeader: false,
							itemSelect: function () {
								that.oBackButton.setVisible(true);
							},
							items: {
								path: '/',
								filters: [new sap.ui.model.Filter('target', sap.ui.model.FilterOperator.EQ, '')],
								template: that.oMessageTemplate
							}
						});
						that.oBackButton = that.oBackButton || UI5ControlFactory.getButtonControl({
							icon: sap.ui.core.IconPool.getIconURI("nav-back"),
							visible: false,
							press: function () {
								that.oMessageView.navigateBack();
								this.setVisible(false);
							}
						});
						that.oMessageView.setModel(oMessageManager.getMessageModel());
						that.oDialog = that.oDialog || UI5ControlFactory.getDialogControl({
							resizable: true,
							content: that.oMessageView,
							state: 'Error',
							beginButton: UI5ControlFactory.getButtonControl({
								press: function () {
									that.oDialog.close();
									oMessageManager.removeAllMessages();
								},
								text: oResourceBundle.getText('SAPFE_CLOSE')
							}),
							customHeader: new sap.m.Bar({
								contentMiddle: [
									new sap.m.Text({text: oResourceBundle.getText('SAPFE_ERROR')})
								],
								contentLeft: [that.oBackButton]
							}),
							contentWidth: "37.5em",
							contentHeight: "21.5em",
							verticalScrolling: false,
							afterClose: function (oEvent) {
								resolve();
							}
						});
						that.oDialog.open();
					});
				});
			}
		}

		function removeUnboundTransitionMessages() {
			removeTransitionMessages(false);
		}

		function removeBoundTransitionMessages() {
			removeTransitionMessages(true);
		}

		function getMessages(bBoundMessages, bTransitionOnly){
			var oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel(),
				aMessages = oMessageModel.getObject('/'),
				aTransitionMessages = [];

			for (var i = 0; i < aMessages.length; i++){
				if ((!bTransitionOnly || aMessages[i].persistent) && (bBoundMessages && aMessages[i].target !== '' || aMessages[i].target === '')){
					aTransitionMessages.push(aMessages[i]);
				}
			}

			return aTransitionMessages;
		}

		function removeTransitionMessages(bBoundMessages) {
			var aMessagesToBeDeleted = getMessages(bBoundMessages, true);

			if (aMessagesToBeDeleted.length > 0) {
				sap.ui.getCore().getMessageManager().removeMessages(aMessagesToBeDeleted);
			}
		}
		/**
		 * Static functions for Fiori Message Handling
		 *
		 * @namespace
		 * @alias sap.fe.actions.messageHandling
		 * @public
		 * @sap-restricted
		 * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
		 * @since 1.56.0
		 */
		var messageHandling = {
			showUnboundMessages: showUnboundMessages,
			removeUnboundTransitionMessages: removeUnboundTransitionMessages,
			removeBoundTransitionMessages: removeBoundTransitionMessages
		};
		return messageHandling;

	}
);
