/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'sap/ui/model/SimpleType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	'sap/ui/model/type/String',
	'sap/ui/mdc/library',
	'sap/ui/mdc/base/FilterOperatorConfig',
	'sap/ui/mdc/base/Condition',
	'sap/base/util/merge'
],
	function(
		SimpleType,
		FormatException,
		ParseException,
		ValidateException,
		StringType,
		library,
		FilterOperatorConfig,
		Condition,
		merge
		) {
	"use strict";

	var FieldDisplay = library.FieldDisplay;

	/**
	 * Constructor for a Condition type.
	 *
	 * @class
	 * This class represents condition types.
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
	 * @alias sap.ui.mdc.base.type.ConditionType
	 * @since 1.62.0
	 */
	var ConditionType = SimpleType.extend("sap.ui.mdc.base.type.ConditionType", /** @lends sap.ui.mdc.base.type.ConditionType.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Condition";
		}

	});

	ConditionType.prototype.destroy = function() {

		SimpleType.prototype.destroy.apply(this, arguments);

		if (this._oDefaultType) {
			this._oDefaultType.destroy();
			delete this._oDefaultType;
		}

		if (this._oFilterOperatorConfig) {
			this._oFilterOperatorConfig.destroy();
			delete this._oFilterOperatorConfig;
		}

	};

	ConditionType.prototype.formatValue = function(oCondition, sInternalType) {

		if (oCondition == undefined || oCondition == null) {
			return null;
		}

		if (typeof oCondition !== "object" || !oCondition.operator || !oCondition.values ||
				!Array.isArray(oCondition.values)) {
			throw new FormatException("No valid condition provided");
		}

		if (!sInternalType) {
			sInternalType = "string";
		}

		var sDisplay = _getDisplay.call(this);
		var oType = _getValueType.call(this);
		var oFieldHelp = _getFieldHelp.call(this);
		var oFilterOperatorConfig = _getFilterOperatorConfig.call(this);

		_attachCurrentValueAtType.call(this, oCondition, oType);

		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
			case "any":
				if (this.oFormatOptions.onlyEEQ && oCondition.operator === "EQ") {
					// use EEQ to display description
					oCondition = merge({}, oCondition); // do not manipulate original object
					oCondition.operator = "EEQ";
				}

				if (oCondition.operator === "EEQ" && sDisplay !== FieldDisplay.Value && oCondition.values.length === 1 && oFieldHelp) {
					var sDescription = oFieldHelp.getTextForKey(oCondition.values[0], oCondition.inParameters, oCondition.outParameters);
					if (sDescription) {
						oCondition = merge({}, oCondition); // do not manipulate original object
						oCondition.values.push(sDescription);
					}
				}

				if (this.oFormatOptions.hideOperator && oCondition.values.length >= 1) {
					return oType.formatValue(oCondition.values[0], "string");
				}

				var oOperator = oFilterOperatorConfig.getOperator(oCondition.operator);
				return oOperator.format(oCondition.values, oCondition, oType, sDisplay);

			default:
				// operators can only be formatted to string. But other controls (like Slider) might just use the value
				if (oType && oCondition.values.length >= 1) {
					return oType.formatValue(oCondition.values[0], sInternalType);
				}

				throw new FormatException("Don't know how to format Condition to " + sInternalType);
		}
	};

	ConditionType.prototype.parseValue = function(vValue, sInternalType) {

		if (!sInternalType) {
			sInternalType = "string";
		} else if (sInternalType === "any" && typeof vValue === "string") {
			sInternalType = "string";
		}

		var sDisplay = _getDisplay.call(this);
		var oFieldHelp = _getFieldHelp.call(this);
		var oType = _getValueType.call(this);
		var sType = oType.getMetadata().getName();
		var oOriginalDateType = _getOriginalDateType.call(this);
		var oFilterOperatorConfig = _getFilterOperatorConfig.call(this);
		var sDefaultOperator;

		if (!vValue) {
			if (!_isCompositeType.call(this, oType)) {
				return null; // TODO: for all types???
			 }
		}

		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				var sValue = vValue;
				var oOperator;
				var bCheckForDefault = false;

				if (this.oFormatOptions.onlyEEQ) {
					oOperator = oFilterOperatorConfig.getOperator("EEQ");

					if (!oOperator.test(vValue, oType)) {
						sValue = "==" + vValue; // TODO better way to parse
					}
				} else {
					var aOperators = oFilterOperatorConfig.getMatchingOperators(sType, sValue);

					// use default operator if nothing found
					if (aOperators.length === 0) {
						if (oFieldHelp && !_isCompositeType.call(this, oType)) {
							// try first to use EEQ and find it in FieldHelp. If not found try later with default operator
							oOperator = oFilterOperatorConfig.getOperator("EEQ");

							if (!oOperator.test(vValue, oType)) {
								sValue = "==" + vValue; // TODO better way to parse
							}
							bCheckForDefault = true;
						} else {
							// use default operation
							sDefaultOperator = oFilterOperatorConfig.getDefaultOperator(sType);
							oOperator = oFilterOperatorConfig.getOperator(sDefaultOperator);
							sValue = oOperator ? oOperator.format([vValue]) : vValue;
						}
					} else {
						oOperator = aOperators[0]; // TODO: multiple matches?
					}
				}

				if (oOperator) {
					var oCondition;
					try {
						oCondition = oOperator.getCondition(sValue, oType, sDisplay);
					} catch (oException) {
						if (oException instanceof ParseException && oOriginalDateType) {
							// As internal yyyy-MM-dd is used as pattern for dates (times similar) the
							// parse exception might contain this as pattern. The user should see the pattern thats shown
							// So try to parse date with the original type to get parseException with right pattern.
							oOriginalDateType.parseValue(vValue, "string");
						}
						throw oException;
					}

					// TODO better logic
					if (oOperator.name === "EEQ" && oCondition && oFieldHelp && !_isCompositeType.call(this, oType)) {
						var vKey;
						var sDescription;
						var bKeyChecked = false;
						if (oCondition.values[0] !== null && oCondition.values[0] !== undefined) {
							// as description can be wrong, get it always
							sDescription = oFieldHelp.getTextForKey(oCondition.values[0]);
							if (sDescription) {
								oCondition.values[1] = sDescription;
							} else {
								// Maybe Description entered -> try to determine key
								oCondition.values[1] = oCondition.values[0];
								oCondition.values[0] = null;
								bKeyChecked = true;
							}
						}
						if ((oCondition.values[0] === null || oCondition.values[0] === undefined) && oCondition.values[1]) {
							// only description entered -> determine key
							vKey = oFieldHelp.getKeyForText(oCondition.values[1]);
							if (vKey !== undefined && vKey !== null) {
								oCondition.values[0] = vKey;
							} else {
								oCondition.values[0] = oCondition.values[1];
								sDescription = null;
								if (!bKeyChecked) {
									// Maybe key is entered -> get Description
									sDescription = oFieldHelp.getTextForKey(oCondition.values[1]);
								}

								if (sDescription) {
									oCondition.values[1] = sDescription;
								} else {
									oCondition.values[1] = null;
									// not found in help
									if (bCheckForDefault) {
										// use default operator
										sDefaultOperator = oFilterOperatorConfig.getDefaultOperator(sType);
										oOperator = oFilterOperatorConfig.getOperator(sDefaultOperator);
										sValue = oOperator ? oOperator.format([vValue]) : vValue;
										oCondition = oOperator.getCondition(sValue, oType, sDisplay);
									}

									// TODO: fire exception?
//									throw new ParseException("Cannot determine key for " + vValue); // use original value in message
								}
							}
						}
					}

					if (oCondition) {
						_attachCurrentValueAtType.call(this, oCondition, oType);
						return oCondition;
					}
				}

				throw new ParseException("Cannot parse value " + vValue); // use original value in message

			default:
				// operators can only be formatted from string. But other controls (like Slider) might just use the value
				if (oType) {
					// TODO: other operator?
					if (this.oFormatOptions.onlyEEQ) {
						sDefaultOperator = "EEQ";
					} else {
						sDefaultOperator = oFilterOperatorConfig.getDefaultOperator(sType);
					}
					return Condition.createCondition(sDefaultOperator, [oType.parseValue(vValue, sInternalType)]);
				}
				throw new ParseException("Don't know how to parse Condition from " + sInternalType);
		}

	};

	ConditionType.prototype.validateValue = function(oCondition) {

		if (oCondition == undefined || oCondition == null) {
			return null;
		}

		if (typeof oCondition !== "object" || !oCondition.operator || !oCondition.values ||
				!Array.isArray(oCondition.values)) {
			throw new ValidateException("No valid condition provided");
		}

		var oType = _getValueType.call(this);
		var oFilterOperatorConfig = _getFilterOperatorConfig.call(this);

		var oOperator = oFilterOperatorConfig.getOperator(oCondition.operator);
		oOperator.validate(oCondition.values, oType);

	};

	function _getDisplay() {

		var sDisplay = this.oFormatOptions.display;
		if (!sDisplay) {
			sDisplay = FieldDisplay.Value;
		}

		return sDisplay;

	}

	function _getValueType() {

		var oType = this.oFormatOptions.valueType;
		if (!oType) {
			// no type provided -> use string type as default
			if (!this._oDefaultType) {
				this._oDefaultType = new StringType();
			}
			oType = this._oDefaultType;
		}

		return oType;

	}

	function _getOriginalDateType() {

		return this.oFormatOptions.originalDateType;

	}

	function _getFilterOperatorConfig() {

		var oFilterOperatorConfig = this.oFormatOptions.filterOperatorConfig;
		if (!oFilterOperatorConfig) {
			if (!this._oFilterOperatorConfig) {
				this._oFilterOperatorConfig = new FilterOperatorConfig();
			}
			oFilterOperatorConfig = this._oFilterOperatorConfig;
		}

		return oFilterOperatorConfig;

	}

	function _getFieldHelp() {

		var sID = this.oFormatOptions.fieldHelpID;
		if (sID) {
			return sap.ui.getCore().byId(sID);
		}

		return null;

	}

	function _isCompositeType(oType) {
		return oType && oType.isA("sap.ui.model.CompositeType");
	}

	function _attachCurrentValueAtType(oCondition, oType) {
		if (_isCompositeType.call(this, oType) && oCondition && oCondition.values[0]) {
				oType._aCurrentValue = oCondition.values[0];
		}
	}

	return ConditionType;

});
