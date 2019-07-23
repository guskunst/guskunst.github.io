sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./library",
	"sap/ui/core/Control",
	"sap/m/ResponsivePopover",
	"sap/m/List",
	"sap/ui/model/json/JSONModel",
	"sap/m/ListMode",
	"sap/m/PlacementType",
	"sap/m/StandardListItem",
	"sap/ui/core/CustomData",
	"sap/ui/model/Sorter",
	"sap/rules/ui/parser/infrastructure/util/utilsBase",
	"sap/rules/ui/services/AstExpressionLanguage",
	"sap/rules/ui/ExpressionAdvanced",
	"sap/rules/ui/AutoCompleteSuggestionContent",
	"sap/rules/ui/ExpressionBase",
	"sap/rules/ui/ast/constants/Constants",
	"sap/rules/ui/ast/util/AggregateFunctionDialog",
	"sap/rules/ui/ast/util/SelectFunctionDialog",
    "sap/rules/ui/ast/provider/TermsProvider"
], function (jQuery, library, Control, ResponsivePopover, List, JSONModel, ListMode, PlacementType, StandardListItem, CustomData, Sorter,
	infraUtils, AstExpressionLanguage, ExpressionAdvanced, AutoCompleteSuggestionContent, ExpressionBase, Constants, AggregateFunctionDialog,
	SelectFunctionDialog, TermsProvider) {
	"use strict";

	var AstExpressionBasic = ExpressionBase.extend("sap.rules.ui.AstExpressionBasic", {
		metadata: {
			properties: {
				library: "sap.rules.ui",
				value: {
					type: "string",
					defaultValue: ""
				},
                dataObjectInfo: {
                    type: "string",
                    bindable: "bindable",
                    defaultValue: ""
                },
                jsonData: {
                    type: "array",
                    bindable: "bindable",
                    defaultValue: []
                },
                //property for the vocabulary in Aggregate Function
                enableAggregateFunctionVocabulary: {
                    type: "boolean",
                    defaultValue: false
                },
              //property for the where in Aggregate Function
                enableAggregateFunctionWhereClause: {
                    type: "boolean",
                    defaultValue: false
                },
                
                isAttributeContext: {
                    type: "boolean",
                    defaultValue: false
                },
                countFunctionSelected: {
                    type: "boolean",
                    defaultValue: false
                },
                placeholder: {
                    type: "string",
                    defaultValue: ""
                }
			},
			aggregations: {

			},
			events: {

				/**
				 * This event is fired when the text in the input field has changed and the focus leaves the input field or the enter key is pressed.
				 */
				"change": {},

				/**
				 * This event is fired when the value of the input is changed - e.g. at each keypress
				 */
				"liveChange": {}
			}
		},

		init: function () {
			this.infraUtils = new sap.rules.ui.parser.infrastructure.util.utilsBase.lib.utilsBaseLib();
			this.oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");
			this.aggregateFunctionCallBack = jQuery.proxy(this._updateAggregateFunction, this);
			this.functionCallBack = jQuery.proxy(this._updateSelectFunction, this);
			this._reference = jQuery.proxy(this.callback, this);
			this._isDialogOpenedCallbackReference = jQuery.proxy(this.isDialogOpenedCallback, this);
			this._uiModel = [];
			this._cursorPostion = 0;
			this._selectedSpans = null;
			this._hasTextContent = false;
			this._createPopver();
			this._attributeContext = false;
			this.isDialogOpen = false;
			this._focusedOut = false;
			this._jsonArray = [];
			this.isAutoSuggestionRequired = true;
            this.aggregateFunctionDialog = AggregateFunctionDialog.getInstance();
            this.selectFunctionDialog = SelectFunctionDialog.getInstance();
		},

		onBeforeRendering: function () {
		    this._enableAggregateFunctionVocabulary = this.getEnableAggregateFunctionVocabulary();
            this._enableAggregateFunctionWhereClause = this.getEnableAggregateFunctionWhereClause();
            this.isCountFunctionSelected = this.getCountFunctionSelected();
		},

		callback: function (oEvent, oContext) {
			this._setTextOnCursorPosition(oEvent);
		},

		isDialogOpenedCallback: function (isOpen) {
			this.isDialogOpen = isOpen;
		},
		// O - Object, L - literal, F - function, A - Auxilary Node -temporary

		/*Here, we read the ast nodes saved and convert it into an id based string 
		 *and set the value to the expressionbasic
		 */
		onAfterRendering: function () {
			this.referenceId = "";
			this.isAutoSuggestionRequired = true;
			this.isDotRequired = true;
			this._oAstExpressionLanguage = sap.ui.getCore().byId(this.getAstExpressionLanguage());
			this._input = this.$("input");
			this._validateControl();
			this._input[0].contentEditable = this.getEditable();
			this._input[0].classList.add("sapAstExpressionInput");
			if (!this.getEditable()) {
			    this._input[0].classList.add("sapAstExpressionInputNotEditable");
			} else {
			    this._input[0].classList.remove("sapAstExpressionInputNotEditable");
			}

			if (this.aCustomStyleClasses && this.aCustomStyleClasses.length > 0) {
				this._input[0].classList.add(this.aCustomStyleClasses[0]);
			}

			if (this.getJsonData()) {
				this._jsonArray = this.getJsonData();
			}
            
			if (this.getValue() && this.getValue().trim()) {
				this._uiModel = this._convertInputToUiModel(this.getValue());
				this._uiModelToSpan(this._uiModel);
				this._selectedSpans = [];
                this._selectedSpans.push(this._input.children()[this._input.children().length - 1]);
                this._createSpaceSpanItem();
                if (!this.dataObjectInfo) {
                    this.dataObjectInfo = this.getDataObjectInfo() + this.relString;
                }
                this._hasTextContent = true;
            } else {
                this.relString = "";
                this._uiModel = [];
                this._uiModelToSpan(this._uiModel);
                this.dataObjectInfo = "";
            }
			this._setUpEventHandlers();

		},

		/* we get input text as 1 + ./id/id. 
		 * We convert this to tokens and pass it on to convert to uiModel
		 */
		_convertInputToUiModel: function (inputText) {
			if (inputText) {
				this.astNodesString = this._oAstExpressionLanguage.getAstNodesString(inputText);
				this.relString = this._oAstExpressionLanguage.getRelStringForGivenAstString(this.astNodesString).relString;
				this._tokens = this._oAstExpressionLanguage.getTokensForGivenStringInput(inputText);
				return this._oAstExpressionLanguage.convertTokensToUiModel(this._tokens,this._jsonArray);
			}
			return [];

		},

		/* tokens would have text as Customer.Name. For processing, we will need id based expressions
		 * Hence, we go through every token and construct an id based string. 
		 * Example: tokens are 1, space, Customer.Name, space, =, 'abc'
		 * Expression returned by this function will be "1 ./id/id = 'abc'"
		 */
		_generateIDStringFromUIModel: function () {
			var idString = "";
			for (var token in this._uiModel) {
				if (this._uiModel[token].reference != null) {
					if (this._uiModel[token].text.length > 0) {
						idString = idString + this._uiModel[token].reference;
					}
				} else {
					idString = idString + this._uiModel[token].text;
				}
			}
			return idString;
		},

		/* UImodel already has all the required tokens. 
		 * We generate id based rel string such as "1 ./id/id = 'abc'"
		 * If it is in an attribute context, we let the autocomplete util know by setting the property to true
		 * This utility now returns the relevant autosuggestions for the passed uimodel and attribute context
		 */
		_getSuggestionsForTheGivenInput: function (inputText) {
		    var _attributeContext = this._attributeContext;
		    //For Where Clause in FunctionDialog.
		    if (this.getDataObjectInfo()) {
                inputText = this.dataObjectInfo;

            }
		    //Getting header context for condition decision table cell
            if (this.getHeaderInfo() && this.getHeaderInfo().headerValue) {
                inputText = this.getHeaderInfo().headerValue + " " + inputText;
            }		    
			//Support for value help on the result section
            if (this.getAttributeInfo() && inputText === "") {
                inputText = this.getAttributeInfo() + " " + Constants.EQUAL + " ";
            }
		    if (!this._oAstExpressionLanguage) {
                this._oAstExpressionLanguage = sap.ui.getCore().byId(this.getAstExpressionLanguage());
            }
		    if (this.getDataObjectInfo() && this.getIsAttributeContext()) {
                _attributeContext = this.getIsAttributeContext();
                //Replace the . in the inputText as the attribute is combined with dataObject.
                inputText = inputText.replace(/\./g, "");
            }
		    
		    if (this.isCountFunctionSelected) {
                _attributeContext = false;
            }
			var tokens = this._oAstExpressionLanguage.getTokensForGivenStringInput(inputText);
			var uiModel = this._oAstExpressionLanguage.convertTokensToUiModelForAutoSuggestion(tokens);
			var suggestions = this._oAstExpressionLanguage.getSuggesstions(uiModel, _attributeContext);
      
			//Moving businessDatype inside autoComplete to cause less impact - need to be changed at the end
			suggestions.autoComplete.businessDataTypeList = suggestions.businessDataTypeList;
			return suggestions;
		},
		
		_constructExpandedRelString: function (jsonData) {
		    var attribute = "";
            if (jsonData.function === Constants.AVG || jsonData.function === Constants.SUM || jsonData.function === Constants.MIN || jsonData.function === Constants.MAX) {
                attribute = this._hasAssociationId(jsonData.vocabulary) ? this._returnAttributeBasedOnCardinality(jsonData.vocabulary) : this._fetchAttributes(
                        jsonData.vocabulary);
                return jsonData.function+"(" + this.getTable(jsonData) + "," + attribute + this.getGroupByAttributes(jsonData.groupBy) + ")";
            } else if (jsonData.function === Constants.COUNTDISTINCT || jsonData.function === Constants.DISTINCT) {
                attribute = this._hasAssociationId(jsonData.vocabulary) ? this._returnAttributeBasedOnCardinality(jsonData.vocabulary) : this._fetchAttributes(
                        jsonData.vocabulary);
                return jsonData.function+"(" + this.getTable(jsonData) + "," + attribute + ")";
            } else if (jsonData.function === Constants.COUNT) {
                return jsonData.function+"(" + this.getTable(jsonData) + this.getGroupByAttributes(jsonData.groupBy) + ")";
            } else if (jsonData.function === Constants.TOP || jsonData.function === Constants.BOTTOM || jsonData.function === Constants.SELECT) {
                return this._constructExpandedRelStringForSelect(jsonData);
            }
        },
        
        _getAttributesSelectQuery: function (jsonData) {
            var str = ",";
            var sAttributes = "";
            if (jsonData && !jQuery.isEmptyObject(jsonData.attributes)) {
                for (var key in jsonData.attributes) {
                    sAttributes += str + key;
                }
            }
            return sAttributes;
        },
        
        _constructSelectQuery: function (jsonData) {
            var dataObjectInfo = "";
            if (jsonData.doVocabId) {
                dataObjectInfo = jsonData.doVocabId;
            } else {
                dataObjectInfo = jsonData.dataObject;
            }
            if (this._getAttributesSelectQuery(jsonData)) {
                return Constants.SELECT + "(" + this._constructSortQuery(jsonData) + this._getAttributesSelectQuery(jsonData) + ")";
            } else if (jsonData.filter) {
                return Constants.FILTER + "(" + dataObjectInfo + "," + jsonData.filter + ")"
            } else {
                return dataObjectInfo;
            }
        },
        
        _constructSortQuery: function (jsonData) {
            var query = "";
            var dataObjectInfo = "";
            if (jsonData.doVocabId) {
                dataObjectInfo = jsonData.doVocabId;
            } else {
                dataObjectInfo = jsonData.dataObject;
            }
            if (!jsonData.filter) {
                query = dataObjectInfo;
            } else {
                query = Constants.FILTER + "(" + dataObjectInfo + "," + jsonData.filter + ")";
            }
            if (!jQuery.isEmptyObject(jsonData.attributes)) {
                for (var key in jsonData.attributes) {
                    if (jsonData.attributes[key] != Constants.NOSORT) {
                        query = jsonData.attributes[key] + "(" + query + "," + key + ")";
                    }
                }
            }
            return query;
        },
        
        _constructExpandedRelStringForSelect: function (jsonData) {
            if (jsonData.function === Constants.TOP || jsonData.function === Constants.BOTTOM) {
                return jsonData.function+"(" + this._constructSelectQuery(jsonData) + "," + jsonData.count + ")";
            } else if (jsonData.function === Constants.SELECT) {
                return this._constructSelectQuery(jsonData);
            }
        },

        getTable: function (jsonData) {
            var dataObjetcInfo = jsonData.dataObject;
            if (this._hasAssociationId(jsonData.vocabulary)) {
                dataObjetcInfo = this._returnDataObjectBasedOnCardinality(jsonData.vocabulary);
            }
            if (!jsonData.filter && (typeof jsonData.vocabulary === "object" || jsonData.vocabulary instanceof Object)) {
                return this._constructExpandedRelStringForSelect(jsonData.vocabulary);
            } else if (jsonData.filter && (typeof jsonData.vocabulary === "object" || jsonData.vocabulary instanceof Object)) {
                return Constants.FILTER + "(" + this._constructExpandedRelStringForSelect(jsonData.vocabulary) + "," + jsonData.filter + ")";
            } else if (!jsonData.filter) {
                return dataObjetcInfo;
            } else {
                return Constants.FILTER + "(" + dataObjetcInfo + "," + jsonData.filter + ")";
            }
        },

        _hasAssociationId: function (vocabId) {
            var vocabularyId = ""
            if ((typeof vocabId === "object" || vocabId instanceof Object)) {
                if (vocabId && vocabId.attributes) {
                    for (var key in vocabId.attributes) {
                        vocabularyId = vocabId.doVocabId + key.replace(".", "");
                        break;
                    }
                }
            } else {
                vocabularyId = vocabId;
            }
            if (vocabularyId) {
                var splitArray = vocabularyId.split("/");
                var vocabulary = splitArray[1];
                if (splitArray.length > 3) {
                    for (var iterator = 2; iterator < splitArray.length - 1; iterator++) {
                        vocabulary += "." + splitArray[iterator];
                    }
                }
                if (this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider.getTermByTermId(vocabulary) && this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider.getTermByTermId(vocabulary)._dataObjectType ===
                    "AO") {
                    return true;
                }
            }
            return false;
        },
        
        _returnAttributeBasedOnCardinality: function (vocabId) {
            var vocabularyId = ""
            if ((typeof vocabId === "object" || vocabId instanceof Object)) {
                if (vocabId && vocabId.attributes) {
                    for (var key in vocabId.attributes) {
                        vocabularyId = vocabId.doVocabId + key.replace(".", "");
                        break;
                    }
                }
            } else {
                vocabularyId = vocabId;
            }
            if (vocabularyId) {
                var aSplitArray = vocabularyId.split("/");
                var str = aSplitArray[1];
                var index = 0;
                var term;
                var association = "";
                if (aSplitArray.length > 2) {
                    for (var iterator = 2; iterator < aSplitArray.length; iterator++) {
                        str += "." + aSplitArray[iterator];
                        term = this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider.getTermByTermId(str);
                        if (term && term._dataObjectType === "AO" && term._cardinality === "1..n") {
                            index = iterator;
                        }
                    }
                    if (index > 0) {
                        for (var iterator = index + 1; iterator < aSplitArray.length; iterator++) {
                            association += "/" + aSplitArray[iterator];
                        }
                    }
                    if (index === 0) {
                        for (var iterator = 2; iterator < aSplitArray.length; iterator++) {
                            association += "/" + aSplitArray[iterator];
                        }
                    }
                }
                if (association) {
                    return "." + association;
                } else {
                    return "./" + aSplitArray[aSplitArray.length - 1];
                }
            }
        },

        _returnDataObjectBasedOnCardinality: function (vocabId) {
            var vocabularyId = ""
            if ((typeof vocabId === "object" || vocabId instanceof Object)) {
                if (vocabId && vocabId.attributes) {
                    for (var key in vocabId.attributes) {
                        vocabularyId = vocabId.doVocabId + key.replace(".", "");
                        break;
                    }
                }
            } else {
                vocabularyId = vocabId;
            }
            if (vocabularyId) {
                var aSplitArray = vocabularyId.split("/");
                var str = aSplitArray[1];
                var index = 0;
                var term;
                var association = "";
                if (aSplitArray.length > 2) {
                    for (var iterator = 2; iterator < aSplitArray.length; iterator++) {
                        str += "." + aSplitArray[iterator];
                        term = this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider.getTermByTermId(str);
                        if (term && term._dataObjectType === "AO" && term._cardinality === "1..n") {
                            index = iterator;
                        }
                    }
                    if (index > 0) {
                        for (var iterator = 1; iterator <= index; iterator++) {
                            association += "/" + aSplitArray[iterator];
                        }
                    }
                }
                if (association) {
                    return association;
                } else {
                    return "/" + aSplitArray[1];
                }
            }
        },
        getGroupByAttributes: function (groupBy) {
            var str = ",";
            var groupByString = "";
            if (groupBy && groupBy.length > 0) {
                for (var i = 0; i < groupBy.length; i++) {
                    groupByString += (str + groupBy[i]);
                }
            }
            return groupByString;
        },

        _fetchAttributes: function (vocabulary) {
            if (typeof vocabulary === "string" || vocabulary instanceof String) {
                var splitIdArray = vocabulary.split("/");
                var str = "";
                if (splitIdArray.length > 3) {
                    for (var i=2;i<splitIdArray.length;i++){
                        str += "/" + splitIdArray[i];
                    }
                    return "." + str;
                } else {
                    return "./" + splitIdArray[2];
                }
            } else if (Object.keys(vocabulary.attributes).length === 1) {
                for (var key in vocabulary.attributes) {
                    return key;
                }
            } else {
                //throw error;
            }
        },

		/*
		 * id will be generated for every span item
		 */
		_createUUID: function () {
			return this.infraUtils.createUUID();
		},

		/* we need to deal with ids only. 
		 * The span would have the text ./id/id
		 * In this function, we pass the reference id to get the string and add to UI
		 *  Now, this text will have Customer.Name and update the span item's text and reference information
		 *  Add relevant information and create a span item in the UI
		 */
		_createSpanItem: function (oItem) {
			var parentId = this.getId();
			if (oItem.tokenType === Constants.TERM) {
				this.termsProvider = this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider;
				var termId = oItem.reference.split("/")[1];
				var term = this.termsProvider.getTermByTermId(termId);
				//Set Dataobject name for element DO
				if (term && term._isDataObjectElement) {
					termId = "/" + termId;
				} else {
					termId = oItem.reference;
				}
				var objectFromReference = this.termsProvider.getTermNameFromASTNodeReference(termId);

				if (objectFromReference) {
					if ("dataObjectType" in oItem && oItem.dataObjectType != Constants.Element && !this.isCountFunctionSelected) {
						oItem.text = objectFromReference + Constants.DOT;
					} else if((oItem.resultDataObjectId !== "" && oItem.resultDataObjectId !== undefined) || (oItem.tokenType === "ID" && oItem.dataObjectType != Constants.Element && !this.isCountFunctionSelected)){
                        oItem.text = objectFromReference + Constants.DOT;
                    } else {
						oItem.text = objectFromReference;
					}
				}
			}
			
			if (oItem.tokenType === Constants.FUNCTION && oItem.json) {
                this.termsProvider = this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider;
                var objectFromReference = this.termsProvider.getTermNameFromASTNodeReference(oItem.json.dataObject);
                oItem.text = oItem.text.replace(oItem.json.dataObject, objectFromReference)
            }
			var oNewItemSpan = jQuery('<span>', {
				id: parentId + "-" + oItem.id,
				class: oItem.cssClass,
				reference: oItem.reference,
				resultDataObjectId: oItem.resultDataObjectId,
				json: oItem.json
			})["text"](oItem.text);

			oNewItemSpan.data("customData", oItem);
			return oNewItemSpan;
		},

		/*
		 * Here, for every entry in the UIModel, we create a span item and add to UI
		 */
		_uiModelToSpan: function (uiModel) {
			var sText = "";
			for (var i = 0; i < uiModel.length; i++) {
				this._input.append(this._createSpanItem(uiModel[i]));
			}
			return sText;
		},

		_closeAutoSuggestionPopup: function () {
			if (this._oAutoSuggestionPopUp)
				this._oAutoSuggestionPopUp.close();
		},

		/*
		 * Event handlers defined for the user actions such as backspace, ctrl space, space, dot,
		 * focusout, click
		 */
		_setUpEventHandlers: function () {
			var that = this;
			if (!this._focusedOut) {
				that._setCurrentCursorPosition(that._cursorPostion);
			}
			this._input.on('keydown', function (event) {
				that._closeAutoSuggestionPopup();
				that._cursorPostion = that._getCurrentCursorPosition();
				if (event.key == 'Backspace') {
					if (that._removeSpans()) {
					    that.isAutoSuggestionRequired = true;
						event.preventDefault();
						that._setCurrentCursorPosition(that._cursorPostion);
						that._updateUiModel();
						that.dataObjectInfo = that.getDataObjectInfo() + that.relString;
					} else {
						event.preventDefault();
					}
				} else if (event.key == "Control") {
					that.ctrlPressed = true;
				} else if (that.ctrlPressed && event.key == " ") {
					that._selectedSpans = that._getSelectedSpans();
					that.ctrlPressed = false;
					//For where Clause
					if (!that.dataObjectInfo) {
                        that.dataObjectInfo = that.getDataObjectInfo();
                    }
					if(!that.relString){
                            that.relString = "";
                    }
					that._suggestionsList = that._getSuggestionsForTheGivenInput(that.relString);
					that._showAutoSuggestion(that._suggestionsList);
				} else {
					//Prevent all other actions in the UI
					event.preventDefault();
				}
			});
			this._input.on("click", function (event) {
				that.ctrlPressed = false;
				that._selectedSpans = that._getSelectedSpans();
				that._cursorPostion = that._getCurrentCursorPosition();
				if (!that.getEditable()) {
                    return;
                }
				if ($("#" + that._selectedSpans[0].id) && $("#" + that._selectedSpans[0].id).data("customData") && $("#" + that._selectedSpans[0]
                .id).data("customData").json) {
				    var _suggestionsList = that._getSuggestionsForTheGivenInput(that._contextForPerviousSpans(that._selectedSpans));
				    that.isDialogOpen = true;
				    if ($("#" + that._selectedSpans[0].id).data("customData").json.function === Constants.TOP ||
                            $("#" + that._selectedSpans[0].id).data("customData").json.function === Constants.BOTTOM ||
                            $("#" + that._selectedSpans[0].id).data("customData").json.function === Constants.SELECT) {
                            that.selectFunctionDialog._createSelectFunctionDialog(_suggestionsList.autoComplete.categories.functions, that.functionCallBack,
                                that._oAstExpressionLanguage, that._isDialogOpenedCallbackReference, $("#" + that._selectedSpans[0].id).data("customData").json);
                        } else {
                            $("#" + that._selectedSpans[0].id).data("customData").json.selectExpression = typeof $("#" + that._selectedSpans[0].id).data("customData").json.vocabulary ===
                        "object" || $("#" + that._selectedSpans[0].id).data("customData").json.vocabulary instanceof Object ? that._constructExpandedRelStringForSelect(
                    $("#" + that._selectedSpans[0].id).data("customData").json.vocabulary): "";
                that.aggregateFunctionDialog._createAggregationFunctionDialog(_suggestionsList.autoComplete.categories.functions, that.aggregateFunctionCallBack,
                    that._oAstExpressionLanguage, that._isDialogOpenedCallbackReference, $("#" + that._selectedSpans[0].id).data("customData").json);
                        }
				}

				that._closeAutoSuggestionPopup();
			});

			this._input.on('keyup', function (event) {
				var context = jQuery(this);
				if (event.key == "Control") {
					that._selectedSpans = that._getSelectedSpans();
					that.ctrlPressed = false;
				}
				var lastText = context.data('before');
				var currentText = this.textContent;
				//last text will be in ID form. hence, we need to compare with the id form of current text
				var currentTextInIdForm = that._generateIDStringFromUIModel();
				if (currentText != currentTextInIdForm) {
					currentText = currentTextInIdForm;
				}

				if (currentText) {
					currentText = currentText.trim();
				}
				if (lastText) {
					lastText = lastText.trim();
				}

				if (currentText != lastText) {
					that._cursorPostion = that._getCurrentCursorPosition();
					that._suggestionsList = that._getSuggestionsForTheGivenInput(currentText);
					context.empty();
					context.data('before', currentText);
					that._uiModelToSpan(that._uiModel);
					that._setCurrentCursorPosition(that._cursorPostion);
				}

			});

			this._input.on('focusout', function (event) {
				that._focusedOut = true;
				that._fireChange(this.textContent);
				if(!that.isDialogOpen && !that._oAutoSuggestionPopUp.isOpen()){
                    that._validateControl();
				}
			});

			this._input.on('focus', function (event) {
				that._focusedOut = false;
				jQuery(this).data('before', that._uiModeltoString());
			});
		},

		_fireChange: function (textContent) {
			if (this.isDialogOpen && !this.forceFireChange) {
				return;
			}
			var astNodesString = "";
			if (!this.relString && textContent) {
				this.relString = textContent;
			}
			if (!this.relString) {
				this.relString = "";
			}
			
			//applies to DT
            if (this.markerString) {
                this.markerRelString = this.markerString + this.relString;
                astNodesString = this._oAstExpressionLanguage.getAstNodesString(this.markerRelString);    
            }else{
				astNodesString = this._oAstExpressionLanguage.getAstNodesString(this.relString);
			}
			this.astresponseNodes = JSON.parse(astNodesString);
			if (this.astresponseNodes.length >= 0 && !this._oAutoSuggestionPopUp.isOpen() && this.getValue().replace(/\s/g, "") !== this.relString.replace(/\s/g, "")) {
				this.setValue(this.relString);
				this.setJsonData(this._jsonArray);
				this.fireChange({
					newValue: this.relString,
					astNodes: this.astresponseNodes,
					displayText: this._input[0].textContent.trim()
				});
			}
		},
		
		_contextForPerviousSpans: function (selectedSpan) {
            var context = "";
            var children = this.getDomRef("input").children;
            for (var iterator = 0; iterator < children.length; iterator++) {
                var childSpan = $("#" + children[iterator].id);
                if (children[iterator].id != selectedSpan[0].id) {
                    if (childSpan.data("customData").json && childSpan.data("customData").json.expandedText) {
                        context += childSpan.data("customData").json.expandedText;
                    } else if (childSpan.data("customData").reference) {
                        context += childSpan.data("customData").reference;
                    } else {
                        context += childSpan.data("customData").text

                    }
                } else {
                    context += "";
                    break;
                }
            }
            return context;

        },
        
        _updateSelectFunction: function (oEvent) {
            this.isDialogOpen = false;
            $("#" + this._selectedSpans[0].id).data("customData").json = oEvent.getSource().mProperties.jsonData;
            this._selectedSpans[0].textContent = oEvent.getSource().mProperties.value;
            this._updateUiModel();
            this._uiModel = this._convertInputToUiModel(this.relString);
            this._input.empty();
            this._uiModelToSpan(this._uiModel);
            this._setCurrentCursorPosition(this._cursorPostion);
        },
        
        //
        _updateAggregateFunction: function (oEvent) {
            this.isDialogOpen = false;
            $("#" + this._selectedSpans[0].id).data("customData").json = oEvent.getSource().mProperties.jsonData;
            this._selectedSpans[0].textContent = oEvent.getSource().mProperties.value;
            this._updateUiModel();
            this._uiModel = this._convertInputToUiModel(this.relString);
            this._input.empty();
            this._uiModelToSpan(this._uiModel);
            this._setCurrentCursorPosition(this._cursorPostion);
        },

		_createSpaceSpanItem: function () {
			var item = {};
			// Create span with space and update model
			item.id = this._createUUID();
			item.text = " ";
			item.tokenType = "A";
			item.cssClass = "sapAstAuxilaryNodeClass";
			var newSpan = this._createSpanItem(item);
			var selectedSpan = this._selectedSpans[0] ? this._selectedSpans[0].id : "";
            		var spanId = "#" + selectedSpan;
			$(newSpan[0]).insertAfter(spanId);
			this._updateUiModel();
			this._cursorPostion += newSpan[0].textContent.length;
			this._selectedSpans = newSpan;
			this._uiModel = this._convertInputToUiModel(this.relString);
			this._hasTextContent = true;
		},

		/*
		 * this utility creates a span item for space, opens autosuggestions automatically
		 * and then sets the cursor position to fit it the text picked from autosuggestions
		 */
		_addSpace: function () {
			this._createSpaceSpanItem();
			this._setCurrentCursorPosition(this._cursorPostion);
			this._suggestionsList = this._getSuggestionsForTheGivenInput(this._uiModeltoString());
			this._showAutoSuggestion(this._suggestionsList);
		},

		/*
		 * this functions handles backspace and removes spans
		 */
		_removeSpans: function () {
			var atLeastOneSpanRemoved = false;
			
			if (this._uiModel.length == 0 || this._input.children().length == 0) {
				return atLeastOneSpanRemoved;
			}
			this._selectedSpans = this._getSelectedSpans();
			this._prevNodeofRemovedNode = null;

			for (var i = 0; i < this._selectedSpans.length; i++) {
				this._prevNodeofRemovedNode = $("#" + this._selectedSpans[i].id).prev()[0];
				if (this._selectedSpans[i] instanceof HTMLSpanElement && this._selectedSpans[i].textContent) {
					this._cursorPostion -= this._selectedSpans[i].textContent.length;
					this._selectedSpans[i].remove();

					atLeastOneSpanRemoved = true;
				}
				if ("getAttribute" in this._selectedSpans[i] && this._selectedSpans[i].getAttribute("class") == "sapAstObjectClass") {
					this._attributeContext = false;
				}
			}
			if (this.getDomRef("input") && this.getDomRef("input").textContent && !this.getDomRef("input").textContent.length > 0) {
				this._hasTextContent = false;
			}

			return atLeastOneSpanRemoved;
		},

		/*
		 * we get the autosuggestions from autocomplete util.
		 * this utility helps to display the autosuggestion popup
		 */
		_showAutoSuggestion: function (suggestionContent) {
			var span = jQuery(this._selectedSpans);
			var xPos = 0;
			if (span && span[0] instanceof HTMLPreElement) {
				xPos = 12;
			} else {
				if ("position" in span) {
					xPos = parseInt(span.position().left, 10);
				}
				xPos += parseInt(span.width(), 10);
			}
			var yPos = 3;
			var that = this;
			if (this._oAutoSuggestionPopUp && !this._oAutoSuggestionPopUp.isOpen()) {
                this._oAutoSuggestionPopUp.destroyContent();
                this._oAutoSuggestionPopUp.addContent(new sap.rules.ui.AutoCompleteSuggestionContent({
                    content: suggestionContent.autoComplete,
                    reference: that._reference,
                    enableAggregateFunctionVocabulary: that._enableAggregateFunctionVocabulary,
                    enableAggregateFunctionWhereClause: that._enableAggregateFunctionWhereClause,
                    dialogOpenedCallbackReference: that._isDialogOpenedCallbackReference,
                    vocabularyInfo: that._oAstExpressionLanguage
                }));
                this._oAutoSuggestionPopUp.setOffsetX(xPos);
                this._oAutoSuggestionPopUp.setOffsetY(yPos);
                this._oAutoSuggestionPopUp.openBy(this.getDomRef("input"));
            } else {
                this._oAutoSuggestionPopUp.destroyContent();
                this._oAutoSuggestionPopUp.addContent(new sap.rules.ui.AutoCompleteSuggestionContent({
                    content: suggestionContent.autoComplete,
                    reference: that._reference,
                    enableAggregateFunctionVocabulary: that._enableAggregateFunctionVocabulary,
                    enableAggregateFunctionWhereClause: that._enableAggregateFunctionWhereClause,
                    dialogOpenedCallbackReference: that._isDialogOpenedCallbackReference,
                    vocabularyInfo: that._oAstExpressionLanguage
                }));
                this._oAutoSuggestionPopUp.setOffsetX(xPos);
                this._oAutoSuggestionPopUp.setOffsetY(yPos);
            }
            if (!this._oAutoSuggestionPopUp.isOpen()) {
                this._oAutoSuggestionPopUp.setOffsetX(xPos);
                this._oAutoSuggestionPopUp.setOffsetY(yPos);
                this._oAutoSuggestionPopUp.openBy(this.getDomRef("input"));
            }
		},

		_isLastTokenSpaceItem: function () {
			var isLastTokenSpace = true;
			var oLastItem;
			if (this._uiModel && this._uiModel.length > 0) {
				oLastItem = this._uiModel[this._uiModel.length - 1];
				if (oLastItem && oLastItem.tokenType != 'A' && oLastItem.dataObjectType != "S" && oLastItem.dataObjectType != "T" && oLastItem.dataObjectType !=
					"AO" && (oLastItem.tokenType === "ID" && !oLastItem.getText().endsWith("."))) {
					isLastTokenSpace = false;
				}
			}
			return isLastTokenSpace;
		},

		/*
		 * the text selected from autosuggestions, more dialog , 
		 * value help and text entered in fixed value will all have to be set in the 
		 * UI. This function sets the value in the expression basic and 
		 * updates cursor position accordingly
		 */
		_setTextOnCursorPosition: function (oEvent) {
			if (!this._isLastTokenSpaceItem()) {
				this._createSpaceSpanItem();
			}
			var newSpan;
			var spanId = "#" + this._selectedSpans[0].id;
			var selectedSpan = $(spanId);
			var item;
			this.ruleContext = false;
			
			this.forceFireChange = false;
            if(oEvent && oEvent.oSource && (oEvent.oSource.mProperties.forceFireChange)) {
                this.forceFireChange = true;
            }

			if ("data" in $(spanId) && selectedSpan.data("customData") != undefined &&
				selectedSpan.data("customData").tokenType == 'A') {
				item = this._getItemFromSuggestionModel(oEvent, "");
				newSpan = this._createSpanItem(item);
				newSpan.data("customData").textContent = newSpan[0].textContent;
				$(newSpan[0]).insertAfter(spanId);
				this._selectedSpans = newSpan;
				this._cursorPostion += newSpan[0].textContent.length;
				this._updateUiModel();
				this._uiModel = this._convertInputToUiModel(this.relString);
				this._input.empty();
				this._uiModelToSpan(this._uiModel);
				this._hasTextContent = true;

			} else if ((this._uiModel.length === 0) || !this._hasTextContent) {
				item = this._getItemFromSuggestionModel(oEvent, "");
				if(item.resultDataObjectId && item.resultDataObjectId !== "" && item.tokenType === "ID"){
                    this.ruleContext = true;
                }
				newSpan = this._createSpanItem(item);
				this._uiModel.push(newSpan.data("customData"));
				this._uiModeltoString();
				this._uiModel = this._convertInputToUiModel(this.relString);
				this._cursorPostion = item.text.length;
				this._uiModelToSpan(this._uiModel);
				this._hasTextContent = true;
				this._selectedSpans = newSpan;
				if (((this._enableAggregateFunctionVocabulary && this.isCountFunctionSelected) || this.getIsAttributeContext()) && !this.isAssociation && !item.json && this._oAutoSuggestionPopUp) {
                    this.isAutoSuggestionRequired = false;
                    this._oAutoSuggestionPopUp.close();
                }

			} else {
				item = this._getItemFromSuggestionModel(oEvent, this._selectedSpans[0].id);
				this._selectedSpans[0].textContent += item.text;
				this._selectedSpans[0].setAttribute("reference", this._selectedSpans[0].getAttribute("reference") + item.reference);
				this._cursorPostion += item.text.length;
				this._updateUiModel();
				this._uiModel = this._convertInputToUiModel(this.relString);
				this._input.empty();
				this._uiModelToSpan(this._uiModel);
				this._hasTextContent = true;
				if (this._enableAggregateFunctionVocabulary  && !this.isAssociation && this._oAutoSuggestionPopUp) {
                    this.isAutoSuggestionRequired = false;
                    this._oAutoSuggestionPopUp.close();
                }
			}
			if(this.isAssociation){
                this._cursorPostion +=1;    
            }
			this._setCurrentCursorPosition(this._cursorPostion);
			if (this.isAutoSuggestionRequired) {
                if (item.bAddSpaceAutoMatically) {
                    this._selectedSpans = [];
                    this._selectedSpans.push(this._input.children()[this._input.children().length - 1]); // TODO : change logic
                    this._addSpace();
                } else if (item.bAddDotAutomatically) {
                    this._suggestionsList = this._getSuggestionsForTheGivenInput(this.relString);
                    this._selectedSpans = [];
                    this._selectedSpans.push(this._input.children()[this._input.children().length - 1]); // TODO : change logic
                    this._showAutoSuggestion(this._suggestionsList);
                }
            }

		},

		/*
		 * We need to create uuid for every token
		 * add reference to the token in case of an ID
		 * add property class, type, text
		 */
		_getItemFromSuggestionModel: function (oEvent, previousId) {
			this._attributeContext = false;
			this.isAssociation = false;
			var item = {};
			var oSource = oEvent.getSource();
			item.id = this._createUUID();
			if (oSource && oSource.getBindingContext()) {
				var oBindingContextObject = oSource.getBindingContext().getObject();
				item.dataObjectType = oBindingContextObject.type;
				if (oBindingContextObject.ResultDataObjectId) {
                    item.resultDataObjectId = oBindingContextObject.ResultDataObjectId
                }
				if (oBindingContextObject.type == Constants.Element) {
					item.tokenType = Constants.TERM;
					item.cssClass = "sapAstObjectClass";
					item.id = "";
					item.text = (oBindingContextObject.label != null && oBindingContextObject.label != "") ? oBindingContextObject.label :
						oBindingContextObject.name;
					//Add the ./ to Attributes if it has a relative path
					if(this.getDataObjectInfo() && this.isDotRequired) {
					    this.isDotRequired = true;
                        item.reference = oBindingContextObject.id ? "./" + oBindingContextObject.id : "";
                    }else {
                        item.reference = oBindingContextObject.id ? "/" + oBindingContextObject.id : "";
                    }
					item.bAddDotAutomatically = false;
					item.bAddSpaceAutoMatically = true;
					if (previousId && previousId.indexOf("-") > 0) {
						previousId = previousId.substring(previousId.indexOf("-") + 1)
					}
					item.id = previousId != '' ? previousId + "." + oBindingContextObject.id : oBindingContextObject.id;
					var termsProvider = TermsProvider.getInstance();
					var term = termsProvider.getTermByTermId(item.id);
					//Setting reference to DO.attribute for element
					if (term && term._isDataObjectElement) {
						var elementAttributes = termsProvider._getAllAttrsAndAssocsForDataObject(item.id);
						var attributeId = elementAttributes[0]._termId;
						attributeId = "/" + attributeId.replace(".", "/");
						item.reference = attributeId
					}
				} else if ("type" in oBindingContextObject) {
					item.tokenType = Constants.TERM;
					item.cssClass = "sapAstObjectClass";
					item.id = "";
					item.text = (oBindingContextObject.label != null && oBindingContextObject.label != "") ? oBindingContextObject.label :
						oBindingContextObject.name;
					if (oBindingContextObject.type != Constants.ASSOCIATIONDOTYPE) {
						item.reference = oBindingContextObject.id ? "/" + oBindingContextObject.id : "";
						if (previousId && previousId.indexOf("-") > 0) {
							previousId = previousId.substring(previousId.indexOf("-") + 1)
						}
						item.id = previousId != '' ? previousId + "." + oBindingContextObject.id : oBindingContextObject.id;

					} else {
					    this.isAssociation = true;
					    //Add the ./ to Associations if it has a relative path
					    if (this.getDataObjectInfo() && this.isDotRequired){
					        item.reference = oBindingContextObject.id ? "./" + oBindingContextObject.id : "";
					    } else {
					        item.reference = oBindingContextObject.id ? "/" + oBindingContextObject.id : "";
					    }						
						item.id += oBindingContextObject.id;
					}
					//If in where condition we have an Association we donot require a dot for Attribute.
					if(this.getDataObjectInfo()){
					    this.isDotRequired = false;
					}
					this._attributeContext = true;
					item.bAddDotAutomatically = true;
					item.bAddSpaceAutoMatically = false;
				} else {
					item.text = oBindingContextObject.name;
					item.bAddDotAutomatically = false;
					item.bAddSpaceAutoMatically = true;
				}
			} else if (oEvent.getParameter("tokens")) {
				var oValueHelpObject = oEvent.getParameter("tokens")[0].data("row");;
				item.text = oValueHelpObject.Value;
				item.bAddDotAutomatically = false;
				item.bAddSpaceAutoMatically = true;
				item.cssClass = "sapAstLiteralClass";
			} else if (oEvent.getSource().mProperties.jsonData) {
                item.text = oEvent.getSource().mProperties.value;
                item.json = oEvent.getSource().mProperties.jsonData;
                item.bAddDotAutomatically = false;
                item.bAddSpaceAutoMatically = true;
            } else {
				item.text = oEvent.getSource().mProperties.value.trim();
				item.bAddDotAutomatically = false;
				item.bAddSpaceAutoMatically = true;
			}
			if (this.getDataObjectInfo()) {
                this.dataObjectInfo += item.reference ? item.reference : item.text;
            }
			return item;
		},

		/*
		 * popover control for autosuggestions
		 */
		_createPopver: function () {
			var that = this;
			if (!this._oAutoSuggestionPopUp) {
				this._oAutoSuggestionPopUp = new ResponsivePopover({
					content: new sap.rules.ui.AutoCompleteSuggestionContent(),
					showArrow: false,
					placement: PlacementType.Vertical,
					horizontalScrolling: true,
					showHeader: false,
					contentWidth: "400px",
					afterClose: function () {
						// After close is getting called twice
						that._fireChange();
					}
				});
			}
		},

		/*
		 * gets the selected span information
		 */
		_getSelectedSpans: function () {
			var oSelObj = window.getSelection();
			var collection = new Array(); // Collection of Elements
			if ("getRangeAt" in oSelObj) {
				var rangeObject = oSelObj.getRangeAt(0);
				if (rangeObject.startContainer == rangeObject.endContainer) {
					collection.push(rangeObject.startContainer.parentNode);
				} else {
					var firstElement = $(rangeObject.startContainer.parentNode); // First Element
					var lastElement = $(rangeObject.endContainer.parentNode); // Last Element
					collection.push(firstElement); // Add First Element to Collection
					$(rangeObject.startContainer.parentNode).nextAll().each(function () { // Traverse all siblings
						var siblingID = $(this).attr('id'); // Get Sibling ID
						if (siblingID != $(lastElement).attr('id')) { // If Sib is not LastElement
							collection.push($(this)); // Add Sibling to Collection
						} else { // Else, if Sib is LastElement
							collection.push(lastElement); // Add Last Element to Collection
							return false; // Break Loop
						}
					});
				}
			} else {
				collection.push(oSelObj.anchorNode.parentNode);
			}
			return collection;
		},

		_createRange: function (node, chars, range) {
			if (!range) {
				range = document.createRange()
				range.selectNode(node);
				range.setStart(node, 0);
			}

			if (chars.count === 0) {
				range.setEnd(node, chars.count);
			} else if (node && chars.count > 0) {
				if (node.nodeType === Node.TEXT_NODE) {
					if (node.textContent != undefined && node.textContent.length < chars.count) {
						chars.count -= node.textContent.length;
					} else {
						range.setEnd(node, chars.count);
						chars.count = 0;
					}
				} else {
					for (var lp = 0; lp < node.childNodes.length; lp++) {
						range = this._createRange(node.childNodes[lp], chars, range);
						if (chars.count === 0) {
							break;
						}
					}
				}
			}
			return range;
		},

		/*
		 * once the text is added and new cursor position is set,
		 * we need to set the current cursor position
		 */
		_setCurrentCursorPosition: function (chars) {
			if (chars >= 0) {
				var selection = window.getSelection();
				var range = this._createRange(
					$("#" + this.getDomRef("input").id)[0], {
						count: chars
					});
				if (range) {
					range.collapse(false);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}
		},

		/*
		 * every time we push in a new token to the uimodel, the data has to be updated
		 * so that the string generated is always in sync
		 */
		_updateUiModel: function () {
			var that = this;
			if (this.getDomRef("input")) {
				var children = this.getDomRef("input").children;
				that._uiModel = [];
				for (var iterator = 0; iterator < children.length; iterator++) {
					var childSpan = $("#" + children[iterator].id);
					childSpan.data("customData").text = children[iterator].textContent;
					if (children[iterator].getAttribute("reference")) {
						childSpan.data("customData").reference = children[iterator].getAttribute("reference");

					}
					that._uiModel.push(childSpan.data("customData"));
				}
				that._uiModeltoString();
			}

		},

		/*
		 * here, we loop through the uiModel and update the relstring
		 */
		_uiModeltoString: function () {
			var that = this;
			that.relString = "";
			that._jsonArray = [];
			this._uiModel.forEach(function (item, index) {
				if (item.reference) {
					that.relString += item.reference;

				} else if (item.json) {
                    that.relString += that._constructExpandedRelString(item.json);
                    that._jsonArray.push(item.json);

                } else {
					that.relString += item.text;
				}
			})
			return that.relString;
		},

		_isChildOf: function (node, parentId) {
			while (node !== null) {
				if (node.id === parentId) {
					return true;
				}
				node = node.parentNode;
			}

			return false;
		},

		/*
		 * gets the current cursor position
		 */
		_getCurrentCursorPosition: function () {
			var parentId = this.getDomRef("input").id
			var selection = window.getSelection(),
				charCount = -1,
				node;

			if (selection.focusNode) {
				if (this._isChildOf(selection.focusNode, parentId)) {
					node = selection.focusNode;
					charCount = selection.focusOffset;

					while (node) {
						if (node.id === parentId) {
							break;
						}

						if (node.previousSibling) {
							node = node.previousSibling;
							charCount += node.textContent.length;
						} else {
							node = node.parentNode;
							if (node === null) {
								break
							}
						}
					}
				}
			}

			return charCount;
		},

    _validateControl: function () {
		var valueState = this.getValueState();
		var valueStateText = this.getValueStateText();
		if ((this.astresponseNodes && this.astresponseNodes.length === 1 && this.astresponseNodes[0].Type === "I" ) && this.astresponseNodes[0]
                    .Value !== "" || (valueState === "Error")) {
                    this._input[0].classList.add("sapAstExpressionInputError");
                    if (valueStateText) {
                        this._input[0].title = this.oBundle.getText(valueStateText);
                    } else {
                        this._input[0].title = this.oBundle.getText("invalidExpression");
                    }
                } else {
                    this._input[0].classList.remove("sapAstExpressionInputError");
                }
      
        }
	});

	return AstExpressionBasic;
},
/* bExport= */
true);
