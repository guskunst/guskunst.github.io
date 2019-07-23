sap.ui.define(["sap/rules/ui/ast/autoComplete/dataStructure/Stack",
		"sap/rules/ui/ast/provider/TermsProvider",
		"sap/rules/ui/ast/provider/OperatorProvider",
		"sap/rules/ui/ast/provider/FunctionProvider",
		"sap/rules/ui/ast/parser/bundlelibrary",
		"sap/rules/ui/ast/constants/Constants",
		"sap/rules/ui/ast/autoComplete/node/TermNode",
		"sap/rules/ui/ast/autoComplete/dataStructure/ComparisionOperatorStack"
	],
	function (Stack, TermsProvider, OperatorProvider, FunctionProvider, astBundleLibrary, Constants, TermNode, ComparisionOperatorStack) {
		'use strict';

		var astLibInstance = astBundleLibrary.getInstance();

		var AutoComplete = function () {
			this._autoCompleteStack = new Stack();;
		};

		AutoComplete.prototype._getAutoSuggestionSkeleton = function () {
			var oAutoCompleteJson = {
				"autoComplete": {
					"categories": {},
					"showLiteral": false

				}
			};
			this._aValueSources = {}
			return oAutoCompleteJson;
		};
    
    /* if the requested text is a rule, 
        returns the result data object id else returns the data object id itself*/
    AutoComplete.prototype._getResultDOIdForTheGivenText = function (sText) {
      var resultDataObjectId = sText;
      for(var rule in this._aRules){
          if(this._aRules[rule].Id === sText){
              resultDataObjectId = this._aRules[rule].ResultDataObjectId;
              return resultDataObjectId;
          }
      }
      return resultDataObjectId;
    };

		AutoComplete.prototype.getSuggestions = function (aTokens, aExpectedTokensCandidates, bIsLastTokenEndingWithDot, oData) {
			var oAutoCompleteJson = this._getAutoSuggestionSkeleton();
			var oResult;
			var topNode;
			var oTopStack;
			this._aValueSources = oData.ValueSources;
    		this._aDataObjects = oData.DataObjects;
    		this._aRules = oData.Rules;
      
			this._autoCompleteStack.empty();

			if (aExpectedTokensCandidates && aExpectedTokensCandidates.length > 0) {
				if (aTokens && aTokens.length > 0) {

					// Special Handling for token ending with .
					var sText = aTokens[aTokens.length - 1].getText();
					if (bIsLastTokenEndingWithDot) {
						sText = sText.replace(".", "");
						sText = sText.replace(/\//g, ".");
						sText = sText.replace(".", "");
					}
					oResult = this._pushTokensToAutoCompleteStack(aTokens);
					topNode = this._getTopNodeOfAutomCompleteStack();
					oTopStack = this._getTopStackofAutoCompleteStack();

					oAutoCompleteJson["autoComplete"]["categories"]["terms"] = [];
					var terms = [];
					if (bIsLastTokenEndingWithDot && oResult && oResult.errorCode == 1) {
						var expectedBusinessDataTypeList = oResult.expectedBusinessDataTypeList;
						if (oTopStack && "getTermPrefixId" in oTopStack && oTopStack.getTermPrefixId()) {
							sText = oTopStack.getTermPrefixId() + Constants.DOT + sText;
						}
						for (var lIterator = 0; lIterator < expectedBusinessDataTypeList.length; lIterator++) {
							terms = terms.concat(TermsProvider.getInstance()._getAllAttributesByPrefixIdAndBusinessType(sText, expectedBusinessDataTypeList[
								lIterator]));
						}

						terms = terms.concat(TermsProvider.getInstance().getAssociationsGivenPrefixId(sText));
						oAutoCompleteJson["autoComplete"]["categories"]["terms"] = this._transformTermsToUiModel(terms);
						return oAutoCompleteJson;

					}
					if (oResult) {
						return oAutoCompleteJson;
					} else if (bIsLastTokenEndingWithDot) {
						if (oTopStack && "getTermPrefixId" in oTopStack && oTopStack.getTermPrefixId()) {
							sText = oTopStack.getTermPrefixId() + Constants.DOT + sText;
						}
            			var dataObjectId = this._getResultDOIdForTheGivenText(sText);
						terms = terms.concat(TermsProvider.getInstance()._getAllAttrsAndAssocsForDataObject(dataObjectId));
						oAutoCompleteJson["autoComplete"]["categories"]["terms"] = this._transformTermsToUiModel(terms);
						return oAutoCompleteJson;
					} else {
						// TODO : Handle Exception
					}
				}

				for (var lIndex = 0; lIndex < aExpectedTokensCandidates.length; lIndex++) {
					this._updateAutoCompleteJsonBasedOnTokenCandidate(aExpectedTokensCandidates[lIndex], oAutoCompleteJson, topNode, oTopStack);
				}

			}

			return oAutoCompleteJson;
		};

		AutoComplete.prototype._getTopNodeOfAutomCompleteStack = function () {
			var node;
			if (this._autoCompleteStack.getSize() > 0) {
				node = this._getNodeRecursively(this._autoCompleteStack.getTop());
			}

			return node;
		}

		AutoComplete.prototype._getTopStackofAutoCompleteStack = function () {
			var oTopStack;
			if (this._autoCompleteStack.getSize() > 0) {
				oTopStack = this._getTopStackRecursively(this._autoCompleteStack.getTop());
			}

			return oTopStack;

		};

		AutoComplete.prototype._updateAutoCompleteJsonBasedOnTokenCandidate = function (candidate, oAutoCompleteJson, topNode, oTopStack) {
			var categories = oAutoCompleteJson["autoComplete"]["categories"];
			switch (candidate) {
			case astLibInstance.IDPLexer.LROUNDB:
				this._constructMiscellaneousTokens(oAutoCompleteJson, Constants.LEFTPARENTHESISTEXT, Constants.LEFTPARENTHESISLABEL);
				break;
			case astLibInstance.IDPLexer.LSQUAREB:
				this._constructMiscellaneousTokens(oAutoCompleteJson, Constants.LEFTSQUAREPARENTHESISTEXT, Constants.LEFTSQUAREPARENTHESISLABEL);
				break;
			case astLibInstance.IDPLexer.RROUNDB:
				this._constructMiscellaneousTokens(oAutoCompleteJson, Constants.RIGHTPARENTHESISTEXT, Constants.RIGHTPARENTHESISLABEL);
				break;
			case astLibInstance.IDPLexer.RSQUAREB:
				this._constructMiscellaneousTokens(oAutoCompleteJson, Constants.RIGHTSQUAREPARENTHESISTEXT, Constants.RIGHTSQUAREPARENTHESISLABEL);
				break;
			case astLibInstance.IDPLexer.COMMA:
				this._constructMiscellaneousTokens(oAutoCompleteJson, Constants.COMMATEXT, Constants.COMMALABEL);
				break;
			case astLibInstance.IDPLexer.RANGE_DOTS:
				this._constructMiscellaneousTokens(oAutoCompleteJson, Constants.RANGETEXT, Constants.RANGELABEL);
				break;
			case astLibInstance.IDPLexer.ARRAY_OPERATOR:
				this._constructFunctionalArrayAndRangeOperatorsAutoComplete(oAutoCompleteJson, Constants.ARRAY, topNode);
				break;
			case astLibInstance.IDPLexer.RANGE_OPERATOR:
				this._constructFunctionalArrayAndRangeOperatorsAutoComplete(oAutoCompleteJson, Constants.RANGE, topNode);
				break;
			case astLibInstance.IDPLexer.WINDOW_FUNCTION_NAME:
				this._constructAdvancedAndWindowFunctionsAutoComplete(oAutoCompleteJson, topNode, Constants.WINDOW);
				break;
			case astLibInstance.IDPLexer.ADVANCED_FUNCTION_NAME:
				this._constructAdvancedAndWindowFunctionsAutoComplete(oAutoCompleteJson, topNode, Constants.ADVANCED);
				break;
			case astLibInstance.IDPLexer.FUNCTION_NAME:
				this._constructFunctionsAutocomplete(oAutoCompleteJson, topNode);
				break;
			case astLibInstance.IDPLexer.AND:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.LOGICAL, Constants.AND, topNode, oTopStack);
				break;
			case astLibInstance.IDPLexer.OR:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.LOGICAL, Constants.OR, topNode, oTopStack);
				break;
			case astLibInstance.IDPLexer.ID:
				if (categories["terms"] == undefined) {
					categories["terms"] = [];
				}
				if (topNode && "getTermPrefixId" in topNode && topNode.getTermPrefixId() && topNode.getTermPrefixId() != "") {
					categories["terms"] = this._transformTermsToUiModel(TermsProvider.getInstance()._getAllAttrsAndAssocsForDataObject(topNode.getTermPrefixId()));
				} else if (oTopStack && "getTermPrefixId" in oTopStack && oTopStack.getTermPrefixId() && oTopStack.getTermPrefixId() != "") {
					categories["terms"] = this._transformTermsToUiModel(TermsProvider.getInstance()._getAllAttrsAndAssocsForDataObject(oTopStack.getTermPrefixId()));
				} else {
					categories["terms"] = this._transformTermsToUiModel(TermsProvider.getInstance()._getAllDataObjects());
					var vocabularyRules = TermsProvider.getInstance()._getAllVocabularyRules();
				    if (vocabularyRules.length > 0) {
				        if (categories["vocabularyRules"] === undefined) {
				            categories["vocabularyRules"] = [];
				        }
				        categories["vocabularyRules"] = this._transformTermsToUiModel(vocabularyRules);
				    }
				}
			    
				break;
			case astLibInstance.IDPLexer.NUMERIC_LITERAL_UNIT:
			case astLibInstance.IDPLexer.BOOL:
			case astLibInstance.IDPLexer.NUMERIC_LITERAL:
			case astLibInstance.IDPLexer.STRING:
			case astLibInstance.IDPLexer.PARTIALTIME:
			case astLibInstance.IDPLexer.FULLTIME:
			case astLibInstance.IDPLexer.DATETIME:
			case astLibInstance.IDPLexer.GEOJSON_POINT:
			case astLibInstance.IDPLexer.GEOJSON_POLYGON:
				oAutoCompleteJson.autoComplete.showLiteral = true;
				var businessDataTypeList = "";
				var id;
				if (oTopStack && oTopStack instanceof ComparisionOperatorStack && oTopStack.getPrevious()) {
					businessDataTypeList = OperatorProvider.getInstance().getOperatorByName(oTopStack.getName()).getReturnValueBussinessDataTypeCollection();
					id = oTopStack.getPrevious().getId();
				}

				if (topNode && "getProbableBusinessDataReturnTypeList" in topNode) {
					businessDataTypeList = topNode.getProbableBusinessDataReturnTypeList();
					if (topNode.getPrevious()) {
						var oPrevious = this._getNodeRecursively(topNode.getPrevious());
						if (oPrevious instanceof TermNode && oPrevious.getId()) {
							id = oPrevious.getId();
						}
					}
				}
				oAutoCompleteJson.businessDataTypeList = businessDataTypeList;
				if (id) {
					var oTerm = TermsProvider.getInstance().getTermByTermId(id);
					if (oTerm.getHasValueSource()) {
						var oValueHelp = {};
						var oValueSource;
						oValueHelp.vocabularyId = oTerm.getVocaId();
						var aIds = oTerm.getTermId().split(".");
						var sDoId = aIds[aIds.length - 2];
						var sAttributeId = aIds[aIds.length - 1];
						oValueHelp.dataObjectId = sDoId;
						oValueHelp.attributeId = sAttributeId;
						oValueHelp.attributeName = oTerm._label;
						oValueHelp.attributeDataType = oTerm._bussinessDataType;
						for (var lIndex = 0; lIndex < this._aValueSources.length; lIndex++) {
							oValueSource = this._aValueSources[lIndex];
							if (oValueSource.AttributeId == sAttributeId) {
								oValueHelp.sourceType = oValueSource.SourceType;
								break;
							}
						}
						oAutoCompleteJson.autoComplete.valuehelp = oValueHelp;
					}
				}
				break;
			case astLibInstance.IDPLexer.FUNCTIONAL_OPERATOR:
				this._constructFunctionalArrayAndRangeOperatorsAutoComplete(oAutoCompleteJson, Constants.FUNCTIONAL, topNode);
				break;
			case astLibInstance.IDPLexer.LESS_THAN:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.COMPARISION, Constants.LESS_THAN, topNode, oTopStack);
				break;
			case astLibInstance.IDPLexer.GREATER_THAN:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.COMPARISION, Constants.GREATER_THAN, topNode, oTopStack);
				break;
			case astLibInstance.IDPLexer.LESS_THAN_EQUAL:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.COMPARISION, Constants.LESS_THAN_EQUAL, topNode, oTopStack);
				break;
			case astLibInstance.IDPLexer.GREATER_THAN_EQUAL:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.COMPARISION, Constants.GREATER_THAN_EQUAL, topNode, oTopStack);
				break;
			case astLibInstance.IDPLexer.NOT_EQUAL:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.COMPARISION, Constants.NOT_EQUAL, topNode, oTopStack);
				break;
			case astLibInstance.IDPLexer.EQUAL:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.COMPARISION, Constants.EQUAL, topNode, oTopStack);
				break;
			case astLibInstance.IDPLexer.MULT:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.ARITHMETIC, Constants.MULT, topNode);
				break;
			case astLibInstance.IDPLexer.LOGICAL_NOT:
				break;
			case astLibInstance.IDPLexer.DIV:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.ARITHMETIC, Constants.DIV, topNode);
				break;
			case astLibInstance.IDPLexer.ADD:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.ARITHMETIC, Constants.ADD, topNode);
				break;
			case astLibInstance.IDPLexer.MINUS:
				this._constructOperatorsAutocomplete(oAutoCompleteJson, Constants.ARITHMETIC, Constants.MINUS, topNode);
				break;

			default:
				break;
			}

		};

		AutoComplete.prototype._constructAdvancedAndWindowFunctionsAutoComplete = function (oAutoCompleteJson, oTopNode, sCategory) {
			var oCategories = oAutoCompleteJson["autoComplete"]["categories"];
			var lIndex, lBusinessDataListIterator, lDataObjectListIterator;
			var aBusienssDataTypeList = [];
			var aDataObjectTypeList = [];
			if (oCategories["functions"] == undefined) {
				oCategories["functions"] = {};
			}
			var oFunction;
			var aAdvancedFunctions = FunctionProvider.getInstance().getAllFunctionsByCategory(sCategory);
			if (oTopNode && oTopNode.getPrevious()) {
				var oPreviousNode = oTopNode.getPrevious();
				oPreviousNode = this._getNodeRecursively(oPreviousNode);
				if ("getBusinessDataType" in oPreviousNode) {
					aBusienssDataTypeList.push(oPreviousNode.getBusinessDataType());
				} else {
					aBusienssDataTypeList = oPreviousNode.getProbableBusinessDataReturnTypeList();
				}

				if ("getDataObjectType" in oPreviousNode) {
					aDataObjectTypeList.push(oPreviousNode.getDataObjectType());
				} else {
					aDataObjectTypeList = oPreviousNode.getProbableDataObjectReturnTypeList();
				}

				for (lIndex = 0; lIndex < aAdvancedFunctions.length; lIndex++) {
					oFunction = aAdvancedFunctions[lIndex];
					for (lBusinessDataListIterator = 0; lBusinessDataListIterator < aBusienssDataTypeList.length; lBusinessDataListIterator++) {
						if ("getReturnValueBussinessDataTypeCollection" && oFunction.getReturnValueBussinessDataTypeCollection() && oFunction.getReturnValueBussinessDataTypeCollection()[
								aBusienssDataTypeList[lBusinessDataListIterator]]) {
							for (lDataObjectListIterator = 0; lDataObjectListIterator < aDataObjectTypeList.length; lDataObjectListIterator++) {
								if ("getReturnValueDataObjectTypeCollection" && oFunction.getReturnValueDataObjectTypeCollection() && oFunction.getReturnValueDataObjectTypeCollection()[
										aDataObjectTypeList[lDataObjectListIterator]]) {
									this._categorizeFunctions(oFunction, oCategories["functions"]);
								}
							}
						}
					}
				}
			} else {
				for (lIndex = 0; lIndex < aAdvancedFunctions.length; lIndex++) {
					oFunction = aAdvancedFunctions[lIndex];
					this._categorizeFunctions(oFunction, oCategories["functions"]);
				}

			}
		};

		AutoComplete.prototype._constructWindowFunctionsAutoComplete = function (oAutoCompleteJson, oTopNode) {
			var oCategories = oAutoCompleteJson["autoComplete"]["categories"];
			if (oCategories["functions"] == undefined) {
				oCategories["functions"] = {};
			}
		};

		AutoComplete.prototype._constructMiscellaneousTokens = function (oAutoCompleteJson, sName, sLabel) {
			var operators = null;
			var categories = oAutoCompleteJson["autoComplete"]["categories"];
			if (categories["operators"] == undefined) {
				categories["operators"] = {};
			}
			operators = categories["operators"]
			if (operators["miscellaneous"] == undefined) {
				operators["miscellaneous"] = [];
			}
			operators["miscellaneous"].push({
				name: sName,
				label: sLabel
			});
		};

		AutoComplete.prototype._pushTokensToAutoCompleteStack = function (aTokens) {
			var oResult;
			for (var lIndex = 0; lIndex < aTokens.length; lIndex++) {
				oResult = this._autoCompleteStack.push(aTokens[lIndex]);
				if (oResult && oResult.bTokenPushed == false) {
					return oResult;
				}
			}
		};

		AutoComplete.prototype._getNodeRecursively = function (node) {
			while ("getTop" in node && node.getTop()) {
				node = node.getTop();
			}
			return node;
		};

		AutoComplete.prototype._getTopStackRecursively = function (node) {
			var prev = node;
			while ("getTop" in node && node.getTop()) {
				prev = node;
				node = node.getTop();
			}
			return prev;
		};

		AutoComplete.prototype._constructFunctionalArrayAndRangeOperatorsAutoComplete = function (oAutoCompleteJson, category, topNode) {
			var aOperators = OperatorProvider.getInstance().getAllOperatorsByCategory(category);
			for (var lIndex = 0; lIndex < aOperators.length; lIndex++) {
				this._constructOperatorsAutocomplete(oAutoCompleteJson, category, aOperators[lIndex].getName(), topNode);
			}
		};

		AutoComplete.prototype._constructOperatorsAutocomplete = function (oAutoCompleteJson, category, operatorName, topNode, oTopStack) {
			var isBusinessAndDataObjectTypeAvailable = false;
			var operator;
			var categories = oAutoCompleteJson["autoComplete"]["categories"];
			var operators = null;
			var sBusienssDataType = null;
			var sDataObjectType = null;
			var bOperatorPushed = false;

			if (categories["operators"] == undefined) {
				categories["operators"] = {};
			}
			operators = categories["operators"];
			if (operators[category] == undefined) {
				operators[category] = [];
			}

			operator = OperatorProvider.getInstance().getOperatorByName(operatorName);

			if (category === Constants.LOGICAL || category === Constants.COMPARISION) {
				if (oTopStack && oTopStack instanceof Stack && "isContextComparision" in oTopStack && oTopStack.isContextComparision() && 
					topNode && topNode.getBusinessDataType() == oTopStack.getComparisionLeftOperandBusinessType()
				) {
					operators[category].push(this._transformOperatorsToUiModel(operator));
					bOperatorPushed = true;

				} /*else if (category === Constants.LOGICAL && topNode && topNode.getBusinessDataType() == Constants.BOOLEANBUSINESSDATATYPE) {
					operators[category].push(this._transformOperatorsToUiModel(operator));
					bOperatorPushed = true;

				}*/
			}
			if (topNode && !bOperatorPushed) {
				if ("getProbableBusinessDataReturnTypeList" in topNode &&
					topNode.getProbableBusinessDataReturnTypeList() &&
					topNode.getProbableBusinessDataReturnTypeList().length > 0) {
					isBusinessAndDataObjectTypeAvailable = true;
					var probableBusinessDataReturnTypeList = topNode.getProbableBusinessDataReturnTypeList();
					for (var index = 0; index < probableBusinessDataReturnTypeList.length; index++) {
						var sbbusienssDataType = probableBusinessDataReturnTypeList[length];
						if (sbbusienssDataType == Constants.NUMBERBUSINESSDATATYPE) {
							isBusinessAndDataObjectTypeAvailable = false;
						}
					}
				}
				if ("getBusinessDataType" in topNode) {
					sBusienssDataType = topNode.getBusinessDataType();
					sDataObjectType = topNode.getDataObjectType();
					isBusinessAndDataObjectTypeAvailable = true;
				}
			}

			if (!isBusinessAndDataObjectTypeAvailable && !bOperatorPushed) {
				operators[category].push(this._transformOperatorsToUiModel(operator));
			}
			if (sBusienssDataType && sDataObjectType && operator && operator.getReturnValueBussinessDataTypeCollection()[sBusienssDataType] &&
				operator.getReturnValueDataObjectTypeCollection()[sDataObjectType] && !bOperatorPushed) {
				operators[category].push(this._transformOperatorsToUiModel(operator));
			}

		};

		AutoComplete.prototype._constructFunctionsAutocomplete = function (oAutoCompleteJson, oTopNode) {
			var oCategories = oAutoCompleteJson["autoComplete"]["categories"];
			var aBusienssDataTypeList = [];
			var aDataObjectTypeList = [];
			var oFunction;
			var lIndex, lBusinessDataListIterator, lDataObjectListIterator;
			if (oCategories["functions"] == undefined) {
				oCategories["functions"] = {};
			}
			var aAllFunctions = FunctionProvider.getInstance().getAllFunctionsByCategory(Constants.AGGREGATE);
			aAllFunctions = aAllFunctions.concat(FunctionProvider.getInstance().getAllFunctionsByCategory(Constants.SELECTION));
			if (oTopNode && oTopNode.getPrevious()) {
				var oPreviousNode = oTopNode.getPrevious();
				oPreviousNode = this._getNodeRecursively(oPreviousNode);
				if ("getBusinessDataType" in oPreviousNode) {
					aBusienssDataTypeList.push(oPreviousNode.getBusinessDataType());
				} else {
					aBusienssDataTypeList = oPreviousNode.getProbableBusinessDataReturnTypeList();
				}

				if ("getDataObjectType" in oPreviousNode) {
					aDataObjectTypeList.push(oPreviousNode.getDataObjectType());
				} else {
					aDataObjectTypeList = oPreviousNode.getProbableDataObjectReturnTypeList();
				}
				for (lIndex = 0; lIndex < aAllFunctions.length; lIndex++) {
					oFunction = aAllFunctions[lIndex];
					for (lBusinessDataListIterator = 0; lBusinessDataListIterator < aBusienssDataTypeList.length; lBusinessDataListIterator++) {
						if (this._checkBusinessDataTypeCompatibleWithFunctionArgs(oFunction, aBusienssDataTypeList[lBusinessDataListIterator])) {
							for (lDataObjectListIterator = 0; lDataObjectListIterator < aDataObjectTypeList.length; lDataObjectListIterator++) {
								if (this._checkDataObjectCompatibleWithFunction(oFunction, aDataObjectTypeList[lDataObjectListIterator])) {
									this._categorizeFunctions(oFunction, oCategories["functions"]);
								}
							}
						}
					}
				}

			} else {
				for (lIndex = 0; lIndex < aAllFunctions.length; lIndex++) {
					oFunction = aAllFunctions[lIndex];
					this._categorizeFunctions(oFunction, oCategories["functions"]);
				}

			}
			//TODO : validation
		};

		AutoComplete.prototype._checkBusinessDataTypeCompatibleWithFunctionArgs = function (oFunction, sBusienssDataType) {
			var aArgsMetadata = oFunction.getArgumentsMetadata();
			var oArg;
			var isBusinessDataTypeFound = false;
			if (aArgsMetadata) {
				for (var lInnerIndex = 0; lInnerIndex < aArgsMetadata.length; lInnerIndex++) {
					oArg = aArgsMetadata[lInnerIndex];
					if (oArg.determinesReturnDataObjectType == Constants.YES && "businessDataTypeList" in oArg) {
						for (var lOuterIndex = 0; lOuterIndex < oArg.businessDataTypeList.length; lOuterIndex++) {
							var sArgBusienssDataType = oArg.businessDataTypeList[lOuterIndex];
							if (sArgBusienssDataType == sBusienssDataType) {
								isBusinessDataTypeFound = true;
								break;
							}
						}
						break;
					} else if (oArg.determinesReturnDataObjectType == Constants.YES) {
						isBusinessDataTypeFound = true;
						break;
					}

				}
			}
			return isBusinessDataTypeFound;
		};

		AutoComplete.prototype._checkDataObjectCompatibleWithFunction = function (oFunction, sDataObjectType) {
			var oDataObjectList = oFunction.getReturnDataObjectTypeList();
			for (var lIndex = 0; lIndex < oDataObjectList.length; lIndex++) {
				if (oDataObjectList[lIndex] == sDataObjectType) {
					return true;
				}
			}
		};

		AutoComplete.prototype._categorizeFunctions = function (oFunction, oAutoCompleteFunctionJson) {
			var category = oFunction.getCategory();
			var oTransformedFunction = {};
			if (oAutoCompleteFunctionJson[category] == undefined) {
				oAutoCompleteFunctionJson[category] = [];
			}

			oTransformedFunction.name = oFunction.getName();
			oTransformedFunction.label = oFunction.getLabel()

			oAutoCompleteFunctionJson[category].push(oTransformedFunction);

		};

		AutoComplete.prototype._transformTermsToUiModel = function (terms) {
			var transFormedTerms = [];
			var term;
			var uiTermObj;
			var name;
			var id;
			var length;
			for (var lIndex = 0; lIndex < terms.length; lIndex++) {
				term = terms[lIndex];
				uiTermObj = {};
				name = term.getTermName();
				if (name) {
					length = name.split(".").length;
					if (length > 0) {
						name = name.split(".")[length - 1];
					}
				}
				uiTermObj.name = name;
				id = term.getTermId();
				if (id) {
					id = term.getTermId();
					length = id.split(".").length;
					if (length > 0) {
						id = id.split(".")[length - 1];
					}
				}
        if (term.ResultDataObjectId) {
           uiTermObj.ResultDataObjectId = term.ResultDataObjectId;
        }
				uiTermObj.id = id;
				uiTermObj.label = term.getLabel();
				uiTermObj.type = term.getDataObjectType();
				transFormedTerms.push(uiTermObj);
			}

			return transFormedTerms;
		};

		AutoComplete.prototype._transformOperatorsToUiModel = function (operator) {
			var transFormedOperators = {}
			transFormedOperators.name = operator.getName();
			transFormedOperators.label = operator.getLabel()

			return transFormedOperators;
		}

		AutoComplete.prototype._getCandidateName = function (oCandidate) {
			for (var oTokenName in astLibInstance.IDPLexer) {
				if (astLibInstance.IDPLexer[oTokenName] == oCandidate) {
					return oTokenName;
				}
			}
		}

		return AutoComplete;

	});
