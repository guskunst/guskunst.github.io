/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new SemanticObjectUnavailableAction.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for...
	 * @extends sap.ui.core.Element
	 * @version 1.66.0
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.info.SemanticObjectUnavailableAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SemanticObjectUnavailableAction = Element.extend("sap.ui.mdc.base.info.SemanticObjectUnavailableAction", /** @lends sap.ui.mdc.base.info.SemanticObjectUnavailableAction.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				semanticObject: {
					type: "string"
				},
				actions: {
					type: "string[]",
					defaultValue: []
				}
			}
		}
	});

	return SemanticObjectUnavailableAction;

}, /* bExport= */true);
