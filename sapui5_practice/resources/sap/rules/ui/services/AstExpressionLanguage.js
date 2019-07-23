/*
 * ! ${copyright}
 */

// Provides element sap.rules.ui.services.AstExpressionLanguage
sap.ui.define(['jquery.sap.global', 
    "sap/ui/core/Element", 
	"sap/rules/ui/library",
	"sap/rules/ui/ast/parser/bundlelibrary",
	"sap/rules/ui/ast/model/Token",
	"sap/rules/ui/parser/infrastructure/util/utilsBase",
	"sap/rules/ui/ast/autoComplete/AutoComplete",
	'sap/rules/ui/ast/builder/TermsBuilder',
	'sap/rules/ui/ast/builder/OperatorBuilder',
	'sap/rules/ui/ast/builder/FunctionBuilder',
	"sap/rules/ui/ast/constants/Constants",
	"sap/ui/core/LocaleData"
], function (jQuery, Element, library, astBundleLibrary, Token,
	utilsBase, AutoComplete, TermsBuilder, OperatorBuilder, FunctionBuilder, Constants,	LocaleData) {

	"use strict";
	var annotations = [];

	var AstExpressionLanguage = Element.extend("sap.rules.ui.services.AstExpressionLanguage", {
		metadata: {
			library: "sap.rule.ui",
			properties: {
				bindingContextPath: {
					type: "string",
					group: "Misc"
				}

			},
			publicMethods: ["setData", "getData", "getSuggesstions"],
			events: {
				"dataChange": {}
			}
		}

	});

	AstExpressionLanguage.prototype.init = function () {
		this._astBunldeInstance = astBundleLibrary.getInstance();
		this._idpCustomVisitor = new this._astBunldeInstance.IDPCustomVisitor();
		this._antlr4 = this._astBunldeInstance.antlr4;
		this._astUtil = this._astBunldeInstance.ASTUtil;
		this._termsBuilder = this._astBunldeInstance.TermsBuilder;
		this._termsProvider = this._astBunldeInstance.TermsProvider;
		this._infraUtils = new sap.rules.ui.parser.infrastructure.util.utilsBase.lib.utilsBaseLib();
		this._autoComplete = new AutoComplete();
		this.attachModelContextChange(this._setDataFromModel.bind(this));
	};

	

	/*
	 * @private
	 * @return
	 */
	AstExpressionLanguage.prototype._isDataExist = function () {
		if (!this._oData) {
			return false;
		}
		return true;
	};
	
	AstExpressionLanguage.prototype.getExpressionLanguageVersion = function () {
		return "1.0.0";
	};	

	/**
	 * Returns all results names in the vocabulary
	 * 
	 * @private
	 * @return {Array} [oResultsNames]
	 */
	AstExpressionLanguage.prototype.getResults = function () {
		if (!this._isDataExist()) {
			return null;
		}
		var results = [];
		var outputs = this._oData.DataObjects;
		for (var dataObj = 0; dataObj < outputs.length; dataObj++) {
			var label = outputs[dataObj].Label ? outputs[dataObj].Label : outputs[dataObj].Name;
			results.push({
				id: outputs[dataObj].Id,
				name: outputs[dataObj].Name,
				label: label,
				description: outputs[dataObj].Description
			});
		}
		return results;
	};
	
	/**
	 * Returns the information of a given result
	 * @param {string}   [sResult] the result
	 * @private
	 * @return {object}  [oResultInfo] ....
	 **/
	AstExpressionLanguage.prototype.getResultInfo = function (sResult) {
		if (!this._isDataExist()) {
			return null;
		}
		var oResultInfo = {
			requiredParams: []
		};
		var oDataObjects = this._oData.DataObjects;
		for (var object in oDataObjects) {
			if (oDataObjects[object].Name === sResult) {
				var oAttributes = oDataObjects[object].Attributes;
				for (var attribute in oAttributes) {
					oResultInfo.requiredParams.push({
						name: oAttributes[attribute].Name,
						paramId: oAttributes[attribute].Id,
						businessDataType: oAttributes[attribute].BusinessDataType
					});
				}
			}
		}
		return oResultInfo;
	};


	AstExpressionLanguage.prototype._setDataFromModel = function () {
		if (this.hasModel() && this.getBindingContextPath()) {
			this.getModel().read(this.getBindingContextPath(), {
				urlParameters: {
					"$expand": "DataObjects/Associations,DataObjects/Attributes,ValueSources"
				},
				success: this.setData.bind(this)
			});
		}
		// TODO : handle error cases
	};

	AstExpressionLanguage.prototype.setData = function (oData) {
		this._oData = this._CopyAndRemoveOdataTags(oData);
		TermsBuilder.getInstance().construct(this._oData);
		this._astBunldeInstance.TermsBuilder.TermsBuilder.construct(this._oData);
		var operatorAndFunctionsData = this._getOpertorAndFunctionsMetdata();
		OperatorBuilder.getInstance().construct(operatorAndFunctionsData.operators);
		FunctionBuilder.getInstance().construct(operatorAndFunctionsData.functions);		
		this.fireDataChange({
			data: oData
		});
	};

	AstExpressionLanguage.prototype.getData = function () {
		return this._oData;
	};

	AstExpressionLanguage.prototype._removeOdataTags = function (obj) {
		for (var prop in obj) {
			if (obj[prop] && typeof obj[prop] === 'object') {
				if (Array.isArray(obj[prop].results)) {
					obj[prop] = obj[prop].results;
				}
				this._removeOdataTags(obj[prop]);
			}
		}
	};

	AstExpressionLanguage.prototype._CopyAndRemoveOdataTags = function (data) {
		var convertedData = {};
		if (data) {
			convertedData = JSON.parse(JSON.stringify(data));
			this._removeOdataTags(convertedData);
		}
		return convertedData;
	};

	AstExpressionLanguage.prototype._getOpertorAndFunctionsMetdata = function () {
		return {
			"operators": [{
				"name": "+",
				"label": "add",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "N",
						"S": "S"
					},
					"A": {
						"A": "A",
						"S": "S"
					},
					"S": {
						"S": "S",
						"N": "S",
						"D": "S",
						"T": "S",
						"U": "S",
						"Q": "S",
						"A": "S"
					},
					"T": {
						"S": "S"
					},
					"U": {
						"S": "S"
					},
					"D": {
						"S": "S"
					},
					"Q": {
						"Q": "Q",
						"S": "S"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "arithmetic"
			}, {
				"name": "-",
				"label": "subtract",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "N"
					},
					"Q": {
						"Q": "Q"
					},
					"A": {
						"A": "A"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "arithmetic"
			}, {
				"name": "/",
				"label": "divide",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "N"
					},
					"Q": {
						"N": "Q"
					},
					"A": {
						"N": "A"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "arithmetic"
			}, {
				"name": "*",
				"label": "multiply",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "N",
						"A": "A",
						"Q": "Q"
					},
					"Q": {
						"N": "Q"
					},
					"A": {
						"N": "A"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "arithmetic"
			}, {
				"name": "=",
				"label": "is equal",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"B": {
						"B": "B"
					},
					"D": {
						"D": "B",
						"T": "B",
						"U": "B",
					},
					"T": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"U": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					},
					"G": {
						"G": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "comparison"
			}, {
				"name": "!=",
				"label": "is not equal",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"B": {
						"B": "B"
					},
					"D": {
						"D": "B",
						"T": "B",
						"U": "B",
					},
					"T": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"U": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					},
					"G": {
						"G": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "comparison"
			}, {
				"name": ">",
				"label": "is greater than",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"B": {
						"B": "B"
					},
					"D": {
						"D": "B",
						"T": "B",
						"U": "B",
					},
					"T": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"U": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "comparison"
			}, {
				"name": ">=",
				"label": "is equal or greater than",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"D": {
						"D": "B",
						"T": "B",
						"U": "B",
					},
					"T": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"U": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "comparison"
			}, {
				"name": "<",
				"label": "is less than",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"D": {
						"D": "B",
						"T": "B",
						"U": "B",
					},
					"T": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"U": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "comparison"
			}, {
				"name": "<=",
				"label": "is equal or less than",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"D": {
						"D": "B",
						"T": "B",
						"U": "B",
					},
					"T": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"U": {
						"T": "B",
						"U": "B",
						"D": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "comparison"
			}, {
				"name": "IN",
				"label": "in",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"B": {
						"B": "B"
					},
					"D": {
						"D": "B"
					},
					"T": {
						"T": "B",
						"U": "B"
					},
					"U": {
						"T": "B",
						"U": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					},
					"G": {
						"G": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "range"
			}, {
				"name": "NOTIN",
				"label": "not in",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"B": {
						"B": "B"
					},
					"D": {
						"D": "B"
					},
					"T": {
						"T": "B",
						"U": "B"
					},
					"U": {
						"T": "B",
						"U": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					},
					"G": {
						"G": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "range"
			}, {
				"name": "EXISTSIN",
				"label": "exists in",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"B": {
						"B": "B"
					},
					"D": {
						"D": "B"
					},
					"T": {
						"T": "B",
						"U": "B"
					},
					"U": {
						"T": "B",
						"U": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "array"
			}, {
				"name": "NOTEXISTSIN",
				"label": "does not exists in",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "B"
					},
					"B": {
						"B": "B"
					},
					"D": {
						"D": "B"
					},
					"T": {
						"T": "B",
						"U": "B"
					},
					"U": {
						"T": "B",
						"U": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "array"
			}, {
				"name": "MATCHES",
				"label": "matches",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"S": {
						"S": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "functional"
			}, {
				"name": "NOTMATCHES",
				"label": "does not matches",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"S": {
						"S": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "functional"
			}, {
				"name": "CONTAINS",
				"label": "contains string",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"S": {
						"S": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "functional"
			}, {
				"name": "NOTCONTAINS",
				"label": "does not contains string",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"S": {
						"S": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "functional"
			}, {
				"name": "STARTSWITH",
				"label": "starts with",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"S": {
						"S": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "functional"
			}, {
				"name": "NOTSTARTSWITH",
				"label": "does not starts with",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"S": {
						"S": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "functional"
			}, {
				"name": "ENDSWITH",
				"label": "ends with",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"S": {
						"S": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "functional"
			}, {
				"name": "NOTENDSWITH",
				"label": "does not ends with",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"S": {
						"S": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "functional"
			}, {
				"name": "NOT",
				"label": "not",
				"noOfArgs": 1,
				"returnValueBusinessDataTypeCollection": {
					"D": {
						"D": "B"
					},
					"T": {
						"T": "B"
					},
					"U": {
						"T": "B"
					},
					"N": {
						"N": "B"
					},
					"B": {
						"B": "B"
					},
					"S": {
						"S": "B"
					},
					"Q": {
						"Q": "B"
					},
					"A": {
						"A": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "logical"
			}, {
				"name": "AND",
				"label": "and",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"B": {
						"B": "B"
					},
					"D": {
						"Q": "B"
					},
					"T": {
						"Q": "B"
					},
					"U": {
						"Q": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "logical"
			}, {
				"name": "OR",
				"label": "or",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"B": {
						"B": "B"
					},
					"D": {
						"Q": "B"
					},
					"T": {
						"Q": "B"
					},
					"U": {
						"Q": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "logical"
			}],
			"functions": [{
				"name": "AVG",
				"label": "average",
				"category": "aggregate",
				"noOfArgs": "*",
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E",
					"businessDataTypeList": [
						"Q",
						"N",
						"A"
					],
					"determinesReturnDataObjectType": "Y"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"E",
					"T"
				]
			}, {
				"name": "SUM",
				"label": "sum",
				"category": "aggregate",
				"noOfArgs": "*",
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E",
					"businessDataTypeList": [
						"Q",
						"N",
						"A"
					],
					"determinesReturnDataObjectType": "Y"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"E",
					"T"
				]
			}, {
				"name": "COUNT",
				"label": "count",
				"category": "aggregate",
				"noOfArgs": "*",
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T",
					"determinesReturnDataObjectType": "Y"

				}],
				"noOfMandatoryArgs": "1",
				"returnDataObjectTypeList": [
					"E",
					"T"
				],
				"defaultDataObjectReturnType": "E",
				"defaultBusinessDataReturnType": "N"

			}, {
				"name": "COUNTDISTINCT",
				"label": "count distinct",
				"category": "aggregate",
				"noOfArgs": "2",
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E",
					"businessDataTypeList": [
						"N"
					],
					"determinesReturnDataObjectType": "Y"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"E"
				]
			}, {
				"name": "DISTINCT",
				"label": "distinct",
				"category": "aggregate",
				"noOfArgs": 2,
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"T"
				]
			}, {
				"name": "MIN",
				"label": "minimum",
				"category": "aggregate",
				"noOfArgs": "*",
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E",
					"businessDataTypeList": [
						"N",
						"A",
						"Q",
						"D",
						"T",
						"U"
					],
					"determinesReturnDataObjectType": "Y"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"E",
					"T"
				]
			}, {
				"name": "MAX",
				"label": "maximum",
				"category": "aggregate",
				"noOfArgs": "*",
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E",
					"businessDataTypeList": [
						"N",
						"A",
						"Q",
						"D",
						"T",
						"U"
					],
					"determinesReturnDataObjectType": "Y"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"E",
					"T"
				]
			}, {
				"name": "ISWITHIN",
				"label": "is with in",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"G": {
						"G": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "advanced"
			}, {
				"name": "ISNOTWITHIN",
				"label": "is not with in",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"G": {
						"G": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"category": "advanced"
			}, {
				"name": "FILTER",
				"label": "where",
				"category": "aggregate",
				"noOfArgs": 2,
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}],
				"noOfMandatoryArgs": "1",
				"returnDataObjectTypeList": [
					"T"
				]
			}, {
				"name": "TOP",
				"label": "top",
				"category": "selection",
				"noOfArgs": 2,
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"T"
				]
			}, {
				"name": "BOTTOM",
				"label": "bottom",
				"category": "selection",
				"noOfArgs": 2,
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"T"
				]
			}, {
				"name": "SELECT",
				"label": "select",
				"category": "selection",
				"noOfArgs": "*",
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}],
				"noOfMandatoryArgs": "1",
				"returnDataObjectTypeList": [
					"T"
				]
			}, {
				"name": "SORTASC",
				"label": "sort ascending",
				"category": "selection",
				"noOfArgs": 2,
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"T"
				]
			}, {
				"name": "SORTDESC",
				"label": "sort descending",
				"category": "selection",
				"noOfArgs": 2,
				"argsMetadata": [{
					"sequence": 1,
					"dataObjectType": "T"
				}, {
					"sequence": 2,
					"dataObjectType": "E"
				}],
				"noOfMandatoryArgs": "2",
				"returnDataObjectTypeList": [
					"T"
				]
			}, {
				"name": "ISINNEXT",
				"label": "is in next",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"D": {
						"Q": "B"
					},
					"T": {
						"Q": "B"
					},
					"U": {
						"Q": "B"
					},
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "2",
				"category": "window"
			}, {
				"name": "ISNOTINNEXT",
				"label": "is not in next",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"D": {
						"Q": "B"
					},
					"T": {
						"Q": "B"
					},
					"U": {
						"Q": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "2",
				"category": "window"
			}, {
				"name": "ISINLAST",
				"label": "is in last",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"D": {
						"Q": "B"
					},
					"T": {
						"Q": "B"
					},
					"U": {
						"Q": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "2",
				"category": "window"
			}, {
				"name": "ISNOTINLAST",
				"label": "is not in last",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"D": {
						"Q": "B"
					},
					"T": {
						"Q": "B"
					},
					"U": {
						"Q": "B"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "2",
				"category": "window"
			}, {
				"name": "CONCAT",
				"label": "concatenate",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"S": {
						"S": "S"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "2",
				"category": "advanced"
			}, {
				"name": "ROUND",
				"label": "round",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "N"
					},
					"Q": {
						"N": "Q"
					},
					"A": {
						"N": "A"
					},
					"S": {
						"S": "S"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "2",
				"category": "advanced"
			}, {
				"name": "POWER",
				"label": "power",
				"noOfArgs": 2,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "N"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "2",
				"category": "advanced"
			}, {
				"name": "SIN",
				"label": "sin",
				"noOfArgs": 1,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "N"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "1",
				"category": "advanced"
			}, {
				"name": "COS",
				"label": "cos",
				"noOfArgs": 1,
				"returnValueBusinessDataTypeCollection": {
					"N": {
						"N": "N"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "1",
				"category": "advanced"
			}, {
				"name": "TODAY",
				"label": "today",
				"noOfArgs": 0,
				"returnValueBusinessDataTypeCollection": {
					"D": {
						"D": "D"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "0",
				"category": "advanced"
			}, {
				"name": "YESTERDAY",
				"label": "yesterday",
				"noOfArgs": 0,
				"returnValueBusinessDataTypeCollection": {
					"D": {
						"D": "D"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "0",
				"category": "advanced"
			}, {
				"name": "TOMORROW",
				"label": "tomorrow",
				"noOfArgs": 0,
				"returnValueBusinessDataTypeCollection": {
					"D": {
						"D": "D"
					}
				},
				"returnValueDataObjectTypeCollection": {
					"E": {
						"E": "E"
					}
				},
				"noOfMandatoryArgs": "0",
				"category": "advanced"
			}]
		};
	};

	AstExpressionLanguage.prototype.getTokensForGivenStringInput = function (inputString, ruleType) {
		var parser = this._getParser(inputString);
		// TODO : based on ruleType call parser rule
		try {
			var tree = parser.rules();
			if (annotations.length === 0) {
				this._idpCustomVisitor.visitRules(tree);
			} else {
				this._idpCustomVisitor.createErrorNode(annotations[0].expr);
				annotations.length = 0;
			}
		} catch (e) {
			console.log(e);
		}
		return parser._input.tokens;
	};

	AstExpressionLanguage.prototype.getAstNodesString = function (inputString, ruleType) {
		var parser = this._getParser(inputString);
		this._astUtil.clearNodes();
		// TODO : based on ruleType call parser rule
		try {
			var tree = parser.rules();
			if (annotations.length === 0) {
				this._idpCustomVisitor.visitRules(tree);
			} else {
				this._idpCustomVisitor.createErrorNode(annotations[0].expr);
				annotations.length = 0;
			}

		} catch (e) {
			console.log(e);
		}
		return this._astUtil.toASTObject();
	};
	
	AstExpressionLanguage.prototype._getLocaleData = function(){
		var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
		return LocaleData.getInstance(oLocale);
	};
	
	AstExpressionLanguage.prototype._getDateFormatter = function(){
		var oLocaleData = this._getLocaleData();
		var datePattern = oLocaleData.getDatePattern('medium');
		var dateFormatter = sap.ui.core.format.DateFormat.getDateInstance({
    		pattern: datePattern
		});
		return dateFormatter;
	};
	
	AstExpressionLanguage.prototype._getDateTimeFormatter = function(){
		var oLocaleData = this._getLocaleData();
		var datePattern = oLocaleData.getDatePattern('medium');
		var timePattern = oLocaleData.getTimePattern('medium');
		var dateTimeFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance({
			pattern: datePattern + " " + timePattern
		});
		return dateTimeFormatter;
	};

	AstExpressionLanguage.prototype.getRelStringForGivenAstString = function (astNodes) {
		var relString = this._astUtil.toRELString(astNodes);
		this._astUtil.clearNodes();
		return relString;

	};

	AstExpressionLanguage.prototype.convertTokensToUiModel = function (tokensStream, jsonData, shortString) {
	    var tokensModel = [];
        var top = -1;
        var stack = [];
        var startPosition = 0;
        var stopPosition = 0;
        var isFunction = false;
        var tokenType;
        var tokenText = "";
        var val = 0;
        var startPositionSet = false;
        var aFunction = [Constants.AVG, Constants.SUM, Constants.COUNT, Constants.COUNTDISTINCT, Constants.DISTINCT,
            Constants.MIN, Constants.MAX, Constants.FILTER, Constants.TOP, Constants.BOTTOM, Constants.SELECT, Constants.SORTASC, Constants.SORTDESC
        ];

        for (var index = 0; index < tokensStream.length; index++) {
            var token = tokensStream[index];
            if (aFunction.includes(token.text.toUpperCase())) {
                isFunction = true;
            }
            if (token.text === '(' && index > 0 && aFunction.includes(tokensStream[index - 1].text.toUpperCase()) && !startPositionSet) {
                startPosition = index - 1;
                startPositionSet = true;
                tokenType = tokensStream[index - 1].type;
            }
            
            //Stack logic to get the start and Stop position of the Aggregate function and make it as one token.
            if (isFunction && jsonData && jsonData[val]) {
                if (aFunction.includes(token.text.toUpperCase()) || (token.text === '(' && index > 0)) {
                    stack.push(token.text)
                    top++;
                    continue;
                }
                if (token.text === ')' && aFunction.includes(stack[top - 1].toUpperCase())) {
                    stack.pop();
                    stack.pop();
                    top -= 2;
                } else if (token.text === ')') {
                    stack.pop();
                    top -= 1;
                }
                if (top == -1) {
                    stopPosition = index;
                    token.type = tokenType;
                    for (var i = startPosition; i <= stopPosition; i++) {
                        tokenText += tokensStream[i].text;
                    }
                    jsonData[val]["expandedText"] = tokenText;
                    token.text = jsonData[val].functionLabel;
                    var newtoken = new Token(token.type, token.text, token.start, token.stop, this._createUUID(), token.reference, token.json);
                    if (newtoken.tokenType === "ID") {
                        newtoken.reference = newtoken.text;
                    }
                    newtoken.json = jsonData[val];
                    val++;
                    tokensModel.push(newtoken);
                    isFunction = false;
                    startPosition = 0;
                    stopPosition = 0;
                    tokenType = 0;
                    tokenText = "";
                    startPositionSet = false;
                }
            } else {
                if (token.type === this._astBunldeInstance.IDPLexer.EOF)
                    continue;
                var newtoken = new Token(token.type, token.text, token.start, token.stop, this._createUUID(), token.reference);
                if (newtoken.tokenType === "ID") {
                    newtoken.reference = newtoken.text;
                }
		if (newtoken.tokenType === "D") {
                    newtoken.reference = newtoken.text;
                    newtoken.text = "'"+this._getDateFormatter().format(new Date(newtoken.reference.replace(/\'/g, "")), true)+"'";
                }
                if(newtoken.tokenType === "T"){
                    newtoken.reference = newtoken.text;
                    newtoken.text = "'"+this._getDateTimeFormatter().format(new Date(newtoken.reference.replace(/\'/g, "")), true)+"'";
                }
                tokensModel.push(newtoken);
            }

        }
        return tokensModel;
    };
	
    AstExpressionLanguage.prototype.convertTokensToUiModelForAutoSuggestion = function (tokensStream) {
        var tokensModel = [];
        for (var index = 0; index < tokensStream.length; index++) {
            var token = tokensStream[index];
            if (token.type === this._astBunldeInstance.IDPLexer.EOF)
                continue;
            var newtoken = new Token(token.type, token.text, token.start, token.stop, this._createUUID(), token.reference);
            if (newtoken.tokenType === "ID") {
                newtoken.reference = newtoken.text;
            }
            tokensModel.push(newtoken);

        }
        return tokensModel;
    };


	AstExpressionLanguage.prototype.convertTokensToRelString = function (aTokens) {
		var relString = "";
		for (var index = 0; index < aTokens.length; index++) {
			relString += aTokens[index].getText();
		}
		return relString;
	};

	AstExpressionLanguage.prototype._createUUID = function () {
		return this._infraUtils.createUUID();
	};

	AstExpressionLanguage.prototype._getAutoSuggestionCandidates = function (aTokens) {
		// Convert tokens to rel string
		var length = 0;
		if (aTokens && aTokens.length > 0) {
			length = aTokens.length + 2;
		}
		var parser = this._getParser(this.convertTokensToRelString(aTokens));
		var core = new this._astBunldeInstance.CodeCompletionCore(parser);

		return core.collectSuggestions(length);
	};

	AstExpressionLanguage.prototype._getParser = function (sInputString) {
		var charStream = new this._antlr4.InputStream(sInputString);
		var lexer = new this._astBunldeInstance.IDPLexer(charStream);
		var tokens = new this._antlr4.CommonTokenStream(lexer);
		var parser = new this._astBunldeInstance.IDPParser(tokens);
		var listener = new this._astBunldeInstance.ASTErrorListener(annotations);
		parser.removeErrorListeners();
		parser.addErrorListener(listener);
		return parser;
	}

	AstExpressionLanguage.prototype.getSuggesstions = function (aTokens, bIsLastTokenEndingWithDot) {
		var candidates = this._getAutoSuggestionCandidates(aTokens);
		return this._autoComplete.getSuggestions(aTokens, candidates, bIsLastTokenEndingWithDot, this._oData);
	}

	return AstExpressionLanguage;

}, true);
