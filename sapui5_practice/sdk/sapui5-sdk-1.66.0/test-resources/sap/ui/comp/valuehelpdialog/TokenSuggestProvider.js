/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ListItem",
	"sap/m/Input"

], function(
	JSONModel,
	ListItem,
	Input
) {
	"use strict";

	var TokenSuggestProvider = function() {};

	TokenSuggestProvider.prototype.associateInput = function(oInput, oTokenParser) {
		this._oTokenParser = oTokenParser;
		this._oInput = oInput;
		this._oInput.setShowSuggestion(true);
		this._oInput.setFilterSuggests(true);
		this._oInput.setMaxLength(0);
		this._oInput.setMaxSuggestionWidth("auto");

		this._aOperations = [];
		for (var operation in this._oTokenParser.getOperations()) {
			var oOperation = this._oTokenParser.getOperation(operation);
			this._aOperations.push({
				key: operation,
				text: oOperation.text + " (" + oOperation.example + ")",
				example: oOperation.example
			});
		}

		var oSuggestModel = new JSONModel();
		oSuggestModel.setData({ operations: this._aOperations });
		this._oInput.setModel(oSuggestModel, "suggest");

		this._oInput.bindAggregation("suggestionItems", {
			path: "suggest>/operations",
			template: new ListItem({
				key: "{suggest>key}",
				text: "{suggest>text}",
				additionalText: "{suggest>example}"
			})
		});

		this._oInput.attachSuggest(function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");

			if (sTerm === "x") {
				//     var oInput = oEvent.oSource;
				//     oInput.destroySuggestionItems();
				//     for (var i = 0; i < this._oTokenParser._aKeyFields.length; i++) {
				//         oInput.addSuggestionItem(new ListItem({
				//             key: this._oTokenParser._aKeyFields[i].key,
				//             text: this._oTokenParser._aKeyFields[i].label
				//                 //additionalText: "item" + i
				//         }));
				//     }
			}

		}); //.bind(this));

//		this._oInput.attachSuggestionItemSelected(function(oEvent) {
//		var oItem = oEvent.getParameter("selectedItem");
//		if (!oItem) {
//		return;
//		}
//		// var sOperation = oItem.getKey();
//		// var sValue = oEvent.oSource.getValue().trim();

//		}.bind(this));

//		this._oInput.attachChange(function(oEvent) {
//		var sValue = oEvent.getParameter("value");
//		if (sValue) {

//		}
//		}.bind(this));


		this._oInput.setFilterFunction(function(sValue, oItem) {
			var sKey = oItem.getKey();

			sValue = sValue.trim();

			var oOperation = this._oTokenParser.getOperation(sKey);
			if (oOperation) {

				if (sValue === "?") {
					oOperation.languageText = this._oTokenParser.getTranslatedText("default", oOperation);
					oItem.setText(oOperation.languageText);

					oItem.setAdditionalText(oOperation.example);
					return true;
				}

				var oKeyField = this._oTokenParser._aKeyFields.length ? this._oTokenParser._aKeyFields[0] : null;
				var akeyFieldMaches;

				if (oKeyField) {
					akeyFieldMaches = /^\w+\:\s/.exec(sValue);
					if (akeyFieldMaches) {
						var sKeyLabel = akeyFieldMaches[0];
						oKeyField = this._oTokenParser._getKeyFieldByLabel(sKeyLabel.slice(0, sKeyLabel.indexOf(":")));
						sValue = sValue.slice(akeyFieldMaches[0].length).trim();
					}
				}

				var type = oKeyField && oKeyField.type || "default";
				var aTypeOperations = this._oTokenParser.getTypeOperations(type);

				if (!oKeyField) {
					return false;
				}

				//var aOperationKeys = Object.keys(this._oTokenParser.getOperations());
				return aTypeOperations.some(function(sOperation) {
					if (sKey === sOperation) {
						oOperation = this._oTokenParser.getOperation(sOperation);
						if (oOperation.match(sValue)) {
							if (oOperation.key) {
								// update the language text of the operation
								oOperation.languageText = this._oTokenParser.getTranslatedText(type, oOperation);
							}

							oItem.setText(oOperation.languageText + " (" + oOperation.getFilledTemplate(sValue) + ")");
							oItem.setAdditionalText((akeyFieldMaches ? oKeyField.label + ": " : "") + oOperation.getFilledTemplate(sValue));
							return true;
						}
					}
					return false;
				}.bind(this));
			} else {
				if (sValue === "") {
					return true;
				}
				return Input._DEFAULTFILTER(sValue, oItem);
			}
		}.bind(this));

//		this._oInput.setRowResultFunction(function(oSelectedItem) {
//		var oContext, sResult = "";
//		/* 		if (oSelectedItem) {
//		oContext = oSelectedItem.getBindingContext();
//		}
//		if (oContext && this.sKey) {
//		sResult = oContext.getProperty(this.sKey);
//		}
//		*/
//		return sResult;
//		}.bind(this));


		this._oInput._createHighlightedText = function(label) {
			var text = label.innerText,
			value = this.getValue().toLowerCase().trim(),
			count = value.length,
			lowerText = text.toLowerCase(),
			subString,
			newText = '';

			var index = lowerText.indexOf(value);

			if (index >= 0) {
				subString = text.substring(index, index + count);
				newText += '<span class="sapMInputHighlight">' + subString + '</span>';
				newText = text.slice(0, index) + newText + text.slice(index + count);
			} else {
				newText = text;
			}

			return newText;
		};

	};

	return TokenSuggestProvider;
}, true);