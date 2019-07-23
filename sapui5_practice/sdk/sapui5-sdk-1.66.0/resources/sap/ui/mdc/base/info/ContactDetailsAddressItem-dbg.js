/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new ContactDetailsAddressItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for...
	 * @extends sap.ui.core.Element
	 * @version 1.66.0
	 * @constructor
	 * @private
	 * @since 1.56.0
	 * @alias sap.ui.mdc.base.info.ContactDetailsAddressItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ContactDetailsAddressItem = Element.extend("sap.ui.mdc.base.info.ContactDetailsAddressItem", /** @lends sap.ui.mdc.base.info.ContactDetailsAddressItem.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				street: {
					type: "string"
				},
				code: {
					type: "string"
				},
				locality: {
					type: "string"
				},
				region: {
					type: "string"
				},
				country: {
					type: "string"
				},
				types: {
					type: "sap.ui.mdc.ContactDetailsAddressType[]",
					defaultValue: []
				}
			}
		}
	});

	return ContactDetailsAddressItem;

}, /* bExport= */true);
