/*
 * ! OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
// Provides control sap.ui.rta.dttool.controls.CustomButton.
/* globals sap */
sap.ui.define([
	'jquery.sap.global', 'sap/m/Button', 'sap/m/ButtonRenderer'
], function (jQuery, Button, ButtonRenderer) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.dttool.controls.CustomButton control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A simple CustomButton.
	 * @extends sap.m.InputListItem
	 * @author SAP SE
	 * @version 1.66.0
	 * @constructor
	 * @private
	 * @alias sap.ui.rta.dttool.controls.CustomButton
	 */
	var CustomButton = Button.extend('sap.ui.rta.dttool.controls.CustomButton', {

		metadata: {
			properties: {
				newProperty : {
					type : "any"
				}
			}
		},

		renderer : function (oRm, oLi) {
			ButtonRenderer.render.apply(this, arguments);
		}
	});

	return CustomButton;

}, /* bExport= */ true);