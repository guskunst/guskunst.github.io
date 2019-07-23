sap.ui.define(["sap/rules/ui/ast/model/Base",
	"sap/rules/ui/ast/constants/Constants"
], function (Base, Constants) {
	'use strict';

	// Allowed Databject types
	// S - Struture
	// T - Table
	// E - Element

	// BusinessDataTypes Supported
	// B - Boolean
	// D - Date and TimeStamp
	// T - Time
	// N - Number
	// S - String
	// TS - TimeSpan

	// Args Sample Structure

	// T - TABLE,
	// S - String
	// C - ColumnName
	/*{
	    "args": [
	      {
	        "doType": "T"
	      },
	      {
	        "businessDataType": "S"
	      },
	      {
	        "doType": "C"
	      }
	    ]
	  }*/

	// Function Defintion
	var Function = function () {
		Base.apply(this, arguments);
		this._args = [];
		this._noOfMandatoryArgs = [];
		this._aReturnDataObjectTypeList = [];
		this._sDefaultReturnDataObjectType = Constants.Table;
		this._sDefaultReturnBusinessDataType = undefined;

	};

	Function.prototype = new Base();
	Function.prototype.constructor = Base;

	Function.prototype.setArgumentsMetadata = function (args) {
		if (!(args instanceof Array)) {
			// TODO : throw exception
		}
		this._args = args;
		return this;
	};

	Function.prototype.getArgumentsMetadata = function () {
		return this._args;
	};

	Function.prototype.setNoOfMandatoryArgs = function (noOfMandatoryArgs) {
		this._noOfMandatoryArgs = noOfMandatoryArgs;
		return this;
	};

	Function.prototype.getNoOfMandatoryArgs = function () {
		return this._noOfMandatoryArgs;
	};

	Function.prototype.setReturnDataObjectTypeList = function (aReturnDataObjectTypeList) {
		this._aReturnDataObjectTypeList = aReturnDataObjectTypeList;
		return this;
	};

	Function.prototype.getReturnDataObjectTypeList = function () {
		return this._aReturnDataObjectTypeList;
	};

	Function.prototype.setDefaultReturnDataObjectType = function (sDefaultReturnDataObjectType) {
		if (sDefaultReturnDataObjectType) {
			this._sDefaultReturnDataObjectType = sDefaultReturnDataObjectType;
		}
		return this;
	};

	Function.prototype.getDefaultReturnDataObjectType = function () {
		return this._sDefaultReturnDataObjectType;
	};

	Function.prototype.setDefaultReturnBusinessDataType = function (sDefaultReturnBusinessDataType) {
		this._sDefaultReturnBusinessDataType = sDefaultReturnBusinessDataType;
		return this;
	};

	Function.prototype.getDefaultReturnBusinessDataType = function () {
		return this._sDefaultReturnBusinessDataType;
	};


	return Function;

});