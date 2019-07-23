/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/base/ManagedObjectObserver',
	'./FieldBase',
	'./FieldBaseRenderer',
	'./Condition',
	'sap/base/util/deepEqual'
], function(
		ManagedObjectObserver,
		FieldBase,
		FieldBaseRenderer,
		Condition,
		deepEqual
	) {
	"use strict";

	/**
	 * Constructor for a new Field.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A Field can be used to bind its value to data of certain data type. Based on the data type settings, a default
	 * visualization is done by the Field.
	 *
	 * @extends sap.ui.mdc.base.FieldBase
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version 1.66.0
	 *
	 * @constructor
	 * @alias sap.ui.mdc.base.Field
	 * @author SAP SE
	 * @version 1.66.0
	 * @since 1.54.0
	 *
	 * @private
	 * @experimental
	 */
	var Field = FieldBase.extend("sap.ui.mdc.base.Field", /* @lends sap.ui.mdc.base.Field.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The value of the field
				 *
				 */
				value: {
					type: "any",
					defaultValue: null
				},

				/**
				 * the additional value of the field.
				 *
				 * Depending on the dataType this could be an description.
				 */
				additionalValue: {
					type: "any",
					defaultValue: null
				}
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
						valid: { type: "boolean" }
					}
				}
			},
			defaultProperty: "value"
		},
		renderer: FieldBaseRenderer
	});

	Field.prototype.init = function() {

		FieldBase.prototype.init.apply(this, arguments);

		this.setMaxConditions(1);
		this.setProperty("_onlyEEQ", true, true);

		this._oObserver.observe(this, {
			properties: ["value", "additionalValue"]
		});

	};

	Field.prototype.exit = function() {

		FieldBase.prototype.exit.apply(this, arguments);

	};

	Field.prototype.bindProperty = function(sName, oBindingInfo) {

		if (sName === "value" && !oBindingInfo.formatter) { // not if a formatter is used, as this needs to be executed
			oBindingInfo.targetType = "raw"; // provide internal value to inner control
			if (!this._oDataType && oBindingInfo.type) {
				this._oDataType = oBindingInfo.type;
			}
		}

		FieldBase.prototype.bindProperty.apply(this, arguments);

	};

	Field.prototype._handleModelContextChange = function(oEvent) {

		FieldBase.prototype._handleModelContextChange.apply(this, arguments);

		if (!this._oDataType) {
			var oBinding = this.getBinding("value");
			if (oBinding) {
				this._oDataType = oBinding.getType();
			}

		}

	};

	Field.prototype._initDataType = function() {

		FieldBase.prototype._initDataType.apply(this, arguments);

		var oBinding = this.getBinding("value");
		if (oBinding) {
			this._oDataType = oBinding.getType();
		}

	};

	/**
	 * This property must not be set for the <code>Field</code>
	 *
	 * @param {int} iMaxConditions only 1 condition allowed in <code>Field</code>
	 * @returns {sap.ui.mdc.base.Field} <code>this</code> to allow method chaining.
	 * @private
	 */
	Field.prototype.setMaxConditions = function(iMaxConditions) {

		if (iMaxConditions !== 1) {
			throw new Error("Only one condition allowed for Field " + this);
		}

		return this.setProperty("maxConditions", iMaxConditions, true);

	};

	Field.prototype._observeChanges = function(oChanges) {

		FieldBase.prototype._observeChanges.apply(this, arguments);

		var oCondition;
		var aConditions;
		var vValue;
		var vOldValue;
		var sOldAdditionalValue;

		if (oChanges.name === "value") {
			var sAdditionalValue = _getAdditionalValue.call(this);
			vValue = oChanges.current;
			this._vValue = vValue;
			if (vValue !== undefined && vValue !== null && vValue !== "") {
				if (sAdditionalValue) {
					oCondition = Condition.createItemCondition(vValue, sAdditionalValue);
				} else {
					oCondition = Condition.createItemCondition(vValue);
				}
				aConditions = this.getConditions();
				vOldValue = aConditions[0] && aConditions[0].values[0];
				sOldAdditionalValue = aConditions[0] && aConditions[0].values[1];
				if (!aConditions[0] || aConditions[0].operator !== "EEQ" || !_compareValues.call(this, vOldValue, vValue) ||
						sOldAdditionalValue !== sAdditionalValue) {
					// update conditions only if changed (keep out-parameter)
					this.setConditions([oCondition]);
				}
			} else {
				this.setConditions([]);
			}
		}

		if (oChanges.name === "additionalValue") {
			this._vAdditionalValue = oChanges.current;
			vValue = _getValue.call(this);
			if (vValue !== undefined && vValue !== null) {
				// without Value it makes no sense
				if (oChanges.current) {
					oCondition = Condition.createItemCondition(vValue, oChanges.current);
				} else {
					oCondition = Condition.createItemCondition(vValue);
				}
				aConditions = this.getConditions();
				vOldValue = aConditions[0] && aConditions[0].values[0];
				sOldAdditionalValue = aConditions[0] && aConditions[0].values[1];
				if (!aConditions[0] || aConditions[0].operator !== "EEQ" || !_compareValues.call(this, vOldValue, vValue) ||
						sOldAdditionalValue !== oChanges.current) {
					// update conditions only if changed (keep out-parameter)
					this.setConditions([oCondition]);
				}
			} else {
				this.setConditions([]);
			}
		}

	};

	function _getValue() {

		// as on update value and additional value are set both, but properties can only be handled one after the other
		// store here to have them independent of the order.
		return this._vValue;

	}

	function _getAdditionalValue() {

		// as on update value and additional value are set both, but properties can only be handled one after the other
		// store here to have them independent of the order.
		return this._vAdditionalValue;

	}

	function _compareValues(vValue1, vValue2) {

		var bEqual = vValue1 === vValue2;

		if (!bEqual && this._oDataType
				&& (this._oDataType.isA("sap.ui.model.odata.type.Unit") || this._oDataType.isA("sap.ui.model.odata.type.Currency"))
				&& Array.isArray(vValue1) && Array.isArray(vValue2)) {
			// in unit type the unit table is in there setting the value but not after parsing
			// units must be set at least once. so if not set compare too
			if (vValue1[0] === vValue2[0] && vValue1[1] === vValue2[1]
					&& ((this._bUnitSet && (!vValue1[2] || !vValue2[2])) || deepEqual(vValue1[2], vValue2[2]))) {
				bEqual = true;
			}
			if (vValue1[2] || vValue2[2]) {
				this._bUnitSet = true;
			}
		}

		return bEqual;

	}

	Field.prototype._fireChange = function(aConditions, bValid, vWrongValue) {

		var vValue;
		var vAdditionalValue;

		if (bValid) {
			if (aConditions.length === 0 && this._oDataType) {
				// parse "" to get type specific initial value
				vValue = this._oDataType.parseValue("", "string");
			} else if (aConditions.length === 1) {
				vValue = aConditions[0].values[0];
				if (aConditions[0].values.length > 1) {
					vAdditionalValue = aConditions[0].values[1];
				}
			}

			this._vValue = vValue;
			this._vAdditionalValue = vAdditionalValue;
			this.setProperty("value", vValue, true);
			this.setProperty("additionalValue", vAdditionalValue, true);
		} else {
			vValue = vWrongValue;
		}

		this.fireChange({ value: vValue, valid: bValid }); // TODO: format value in change event to external format?

	};

	/**
	 * Sets conditions to the property <code>conditions</code>.
	 *
	 * Do not use the <code>conditions</code> property, use the <code>value</code> property instead.
	 *
	 * @param {object[]} aConditions conditions to be set
	 * @return {sap.ui.mdc.base.Field} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @name sap.ui.mdc.base.Field#setConditions
	 * @function
	 */

	/**
	 * Gets conditions of the property <code>conditions</code>.
	 *
	 * Do not use the <code>conditions</code> property, use the <code>value</code> property instead.
	 *
	 * @return {object[]} conditions of the field
	 * @private
	 * @name sap.ui.mdc.base.Field#getConditions
	 * @function
	 */

	/**
	 * The type of the data handles by the field. this type is used to parse, format and validate the value.
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type this type is used.
	 * In this case the value of the <code>dataType</code> property is ignored
	 *
	 * @param {string} sDataType dataType to be set
	 * @return {sap.ui.mdc.base.Field} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @name sap.ui.mdc.base.Field#setDataType
	 * @function
	 */

	/**
	 * The constraints of the type specified in <code>dataType</code>
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type this type is used.
	 * In this case the value of the <code>dataType</code> property and <code>dataTypeConstraints</code> property is ignored
	 *
	 * @param {string} oDataTypeConstraints Constraints to be set
	 * @return {sap.ui.mdc.base.Field} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @name sap.ui.mdc.base.Field#setDataTypeConstraints
	 * @function
	 */

	/**
	 * The format options of the type specified in <code>dataType</code>
	 *
	 * <b>Note:</b> If the <code>value</code> property is bound to a model using a type this type is used.
	 * In this case the value of the <code>dataType</code> property and <code>dataTypeFormatOptions</code> property is ignored
	 *
	 * @param {string} oDataTypeFormatOptions FormatOptions to be set
	 * @return {sap.ui.mdc.base.Field} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @name sap.ui.mdc.base.Field#setDataTypeFormatOptions
	 * @function
	 */

	return Field;

}, /* bExport= */ true);
