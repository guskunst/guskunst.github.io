/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'./ConditionType',
	'sap/ui/model/SimpleType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	'sap/base/util/merge'
],
	function(
		ConditionType,
		SimpleType,
		FormatException,
		ParseException,
		ValidateException,
		merge
		) {
	"use strict";


	/**
	 * Constructor for a Conditions type.
	 *
	 * @class
	 * This class represents conditions types. It is used to map an array of conditions to an Input or Text control
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version 1.66.0
	 *
	 * @public
	 * @param {object} [oFormatOptions] formatting options.
	 * @param {string} [oFormatOptions.valueType] Type of the value of the condition (used for formatting and parsing)
	 * @param {string} [oFormatOptions.filterOperatorConfig] FilterOperatorConfig to be used in the condition
	 * @param {string} [oFormatOptions.display] DisplayFormat
	 * @param {string} [oFormatOptions.onlyEEQ] If set parsing creates only EEQ conditions //TODO
	 * @param {string} [oFormatOptions.fieldHelpID] FieldHelp to determine key and description // TODO: async request????
	 * @param {string} [oFormatOptions.hideOperator] If set only the value of the condition is shown, no operator //TODO
	 * @param {string} [oFormatOptions.maxConditions] Maximal allowed conditions
	 * @param {object} [oConstraints] value constraints.
	 * @alias sap.ui.mdc.base.type.ConditionsType
	 * @since 1.62.0
	 */
	var ConditionsType = SimpleType.extend("sap.ui.mdc.base.type.ConditionsType", /** @lends sap.ui.mdc.base.type.ConditionsType.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Conditions";
//			var oFormatOptions = merge({}, this.oFormatOptions);
//			var oConstraints = merge({}, this.oConstraints);
			this._oConditionType = new ConditionType(this.oFormatOptions, this.oConstraints);
		}

	});

	ConditionsType.prototype.destroy = function() {

		SimpleType.prototype.destroy.apply(this, arguments);

		if (this._oConditionType) { // to avoid issues in double destroy
			this._oConditionType.destroy();
			this._oConditionType = undefined;
		}

	};

	ConditionsType.prototype.setFormatOptions = function() {

		SimpleType.prototype.setFormatOptions.apply(this, arguments);

//		var oFormatOptions = merge({}, this.oFormatOptions);
		if (this._oConditionType) {
			this._oConditionType.setFormatOptions(this.oFormatOptions);
		}

	};

	ConditionsType.prototype.setConstraints = function() {

		SimpleType.prototype.setConstraints.apply(this, arguments);

//		var oConstraints = merge({}, this.oConstraints);
		if (this._oConditionType) {
			this._oConditionType.setConstraints(this.oConstraints);
		}

	};

	ConditionsType.prototype.formatValue = function(aConditions, sInternalType) {

		if (aConditions == undefined || aConditions == null) {
			return null;
		}

		if (!Array.isArray(aConditions)) {
			throw new FormatException("No valid conditions provided");
		}

		var vValue;

		if (!sInternalType || sInternalType === "string" || sInternalType === "any") {
			vValue = ""; // if string requested use string
		} else if (sInternalType === "float" || sInternalType === "int") {
			vValue = 0; // if number requested use number
		}

		var iMaxConditions = _getMaxConditions.call(this);

		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			var vFormattedValue = this._oConditionType.formatValue(oCondition, sInternalType);

			if (vValue) {
				vValue = vValue + "; " + vFormattedValue;
			} else {
				vValue = vFormattedValue;
			}

			if (iMaxConditions > 0 && i >= iMaxConditions - 1) {
				break;
			}
		}

		return vValue;

	};

	ConditionsType.prototype.parseValue = function(sValue, sInternalType) {

		if (_getMaxConditions.call(this) !== 1) {
			throw new FormatException("Only one condition supported for parsing");
			// TODO: support multiple conditions (list separated by ";") ?
		}

		var oCondition = this._oConditionType.parseValue(sValue, sInternalType);

		if (oCondition) {
			return [oCondition];
		} else {
			return [];
		}

	};

	ConditionsType.prototype.validateValue = function(aConditions) {

		if (aConditions == undefined || aConditions == null) {
			return;
		}

		if (!Array.isArray(aConditions)) {
			throw new ValidateException("No valid conditions provided");
		}

		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			this._oConditionType.validateValue(oCondition);
		}

	};

	function _getMaxConditions() {

		var iMaxConditions = 1;

		if (this.oFormatOptions.hasOwnProperty("maxConditions")) {
			iMaxConditions = this.oFormatOptions.maxConditions;
		}

		return iMaxConditions;

	}

	return ConditionsType;

});
