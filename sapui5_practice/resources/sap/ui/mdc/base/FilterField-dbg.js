/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'./FieldBase',
	'./FieldBaseRenderer',
	'sap/base/util/merge'
], function(
		FieldBase,
		FieldBaseRenderer,
		merge
	) {
	"use strict";

	/**
	 * Constructor for a new FilterField.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A FilterField gets it data from a <code>ConditionModel</code>. So the <code>Conditions</code> property should be bound to the
	 * related conditions in the <code>ConditionModel</code>. The type of these data must be defined in the <code>dataType</code>
	 * property.
	 *
	 * @extends sap.ui.mdc.base.FieldBase
	 *
	 * @author SAP SE
	 * @version 1.66.0
	 *
	 * @constructor
	 * @alias sap.ui.mdc.base.FilterField
	 * @author SAP SE
	 * @version 1.66.0
	 * @since 1.48.0
	 *
	 * @private
	 * @experimental
	 */
	var FilterField = FieldBase.extend("sap.ui.mdc.base.FilterField", /* @lends sap.ui.mdc.base.FilterField.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
			},
			events: {
				/**
				 * This event is fired when the value property of the field is changed
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a change event
				 */
				change: {
					parameters: {

						/**
						 * The new <code>value</code> of the <code>control</code>.
						 */
						value: { type: "string" },

						/**
						 * Flag indicates if the entered <code>value</code> is valid.
						 */
						valid: { type: "boolean" },

						/**
						 * Conditions of the field. This are all conditions, not only the changed ones.
						 * @since 1.61.0
						 */
						conditions: { type: "object[]" }
					}
				}
			}
		},
		renderer: FieldBaseRenderer
	});

	FilterField.prototype.init = function() {

		FieldBase.prototype.init.apply(this, arguments);

	};

	FilterField.prototype.exit = function() {

		FieldBase.prototype.exit.apply(this, arguments);

	};

	FilterField.prototype._fireChange = function(aConditions, bValid, vWrongValue) {

		var vValue;

		if (bValid) {
			if (aConditions.length == 1) {
				vValue = aConditions[0].values[0];
			}
		} else {
			vValue = vWrongValue;
		}

		// do not return the original conditions to not change it by accident
		this.fireChange({ value: vValue, valid: bValid, conditions: merge([], aConditions) });


	};

	return FilterField;

}, /* bExport= */ true);