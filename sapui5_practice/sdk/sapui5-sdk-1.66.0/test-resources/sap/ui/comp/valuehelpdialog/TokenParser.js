/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define( [
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/format/DateFormat",
	"sap/ui/base/ManagedObject",
	"sap/m/Token"
],
	function(
			NumberFormat,
			DateFormat,
			ManagedObject,
			Token
		) {
		"use strict";

		/**
		 * Constructs a class to parse and create token elements inside a MultiInput field
		 *
		 * @constructor
		 * @experimental This module is only for internal/experimental use!
		 * @public
		 * @param {object} sDefaultOperation - default operation for the token parsing
		 * @author Peter Harbusch
		 */
		var TokenParser = function( sDefaultOperation ) {
			this._sDefaultOperation = sDefaultOperation;

			this._aKeyFields = [];

			this._mTypeOperations = {
				"default": [ "Contains", "EQ", "BT", "StartsWith", "EndsWith", "LT", "LE", "GT", "GE" ],
				"string": [ "Contains", "EQ", "BT", "StartsWith", "EndsWith", "LT", "LE", "GT", "GE", "NE" ],
				"date": [ "EQ", "BT", "LT", "LE", "GT", "GE" ],
				"time": [ "EQ", "BT", "LT", "LE", "GT", "GE" ],
				"numeric": [ "EQ", "BT", "LT", "LE", "GT", "GE" ],
				"boolean": [ "EQ" ]
			};

			this._init();
		};

		TokenParser.prototype._init = function() {
			this.addOperation( "BT", "between", "foo...bar", "...", /^(.+)\.\.\.(.+)$/, "$0...$1");
			this.addOperation( "EQ", "equal to", "=foo", "=", /^\=(.+)$/, "=$0" );
			this.addOperation( "Contains", "contains", "*foo*", "**", /^\*.+\*$/, "*$0*");
			this.addOperation( "StartsWith", "starts with", "foo*", "*", /^[^\*](.+)\*$/, "$0*");
			this.addOperation( "EndsWith", "ends with", "*foo", "*", /^\*(.+)[^\*]$/, "*$0" );
			this.addOperation( "LT", "less than", "< foo", "<", /^\<([^=].+)$/, "&lt $0" );
			this.addOperation( "LE", "less than or equal to", "<=foo", "<=", /^\<\=(.+)$/, "<=$0" );
			this.addOperation( "GT", "greater than", "> foo", ">", /^\>([^=].+)$/, ">$0" );
			this.addOperation( "GE", "greater than or or equal to", ">=foo", ">=", /^\>\=(.+)$/, ">=$0" );
			this.addOperation( "NE", "not equal to", "!=foo", "!=", /^\!=(.+)$/, "!=$0" ).exclude = true;
		};

		TokenParser.prototype._getKeyFieldByLabel = function( sLabel ) {
			var keyField;
			this._aKeyFields.some( function( oKeyField ) {
				if ( oKeyField.label.toUpperCase() === sLabel.toUpperCase() ) {
					keyField = oKeyField;
				}
			}, this );
			return keyField;
		};

		TokenParser.prototype.setDefaultOperation = function( sOperationKey ) {
			this._sDefaultOperation = sOperationKey;
		};

		TokenParser.prototype.setMaxLength = function( iMaxlength ) {
			this._iMaxLength = iMaxlength;
		};

		TokenParser.prototype.getMaxLength = function() {
			return this._iMaxLength;
		};

		TokenParser.prototype.setDisplayFormat = function( sDisplayFormat ) {
			this._sDisplayFormat = sDisplayFormat;
		};

		TokenParser.prototype.getOperations = function() {
			return this._mOperations;
		};

		TokenParser.prototype.getOperationKeys = function() {
			return Object.keys( this._mOperations );
		};

		TokenParser.prototype.getOperation = function( sOperationKey ) {
			return this._mOperations && this._mOperations[ sOperationKey ];
		};

		TokenParser.prototype.addKeyField = function( oKeyField ) {
			this._aKeyFields.push( oKeyField);
		};

		TokenParser.prototype.addTypeOperations = function(sType, aOperations ) {
			this._mTypeOperations[sType] = aOperations;
		};

		TokenParser.prototype.addOperation = function( sOperationKey, sText, sExample, sOperation, regEx, sTemplate, fParse ) {
			if ( !this._mOperations ) {
				this._mOperations = {};
			}

			this._mOperations[ sOperationKey ] = {
				key: sOperationKey,
				text: sText,
				example: sExample,
				operation: sOperation,
				re: regEx,
				template: sTemplate,
				exclude: false,
				parser : this,
				match: function( sText ) {
					return sText.match(this.re);
				},
				parse: fParse || function( sText ) {
					var aMatch = sText.match(this.re);
					return aMatch.slice(1, aMatch.length);
				},
				getFilledTemplate: function( sText, oFormatter ) {
					var aValues = this.parse( sText );
					var sTokenText = this.template;
					for ( var i = 0; i < aValues.length; i++ ) {
						sTokenText = sTokenText.replace( "$" + i, this.format(oFormatter ? oFormatter.parse(aValues[ i ], "string") : aValues[ i ]));
					}
					return sTokenText;
				},
				getConditionData: function( sText, oFormatter ) {
					var range = {};
					range.exclude = this.exclude;
					range.operation = this.key;

					var aValues = this.parse( sText );
					for ( var i = 0; i < aValues.length; i++ ) {
						range[ "value" + ( i + 1 ) ] = this.format(oFormatter ? oFormatter.parse(aValues[ i ], "string") : aValues[ i ]);
					}

					return range;
				},
				format: function(sValue) {
					if (this.parser.getMaxLength() >= 0) {
						sValue = sValue.substring(0, this.parser.getMaxLength());
					}
					if (this.parser._sDisplayFormat === "UpperCase") {
						sValue = sValue.toUpperCase();
					}
					return sValue;
				}
			};

			return this._mOperations[ sOperationKey ];
		};

		TokenParser.prototype.removeOperation = function( sOperationKey ) {
			delete this._mOperations[ sOperationKey ];
		};

		TokenParser.prototype.removeAllOperations = function() {
			var aOperationKeys = Object.keys( this._mOperations );
			aOperationKeys.forEach( function( operationKey ) {
				delete this._mOperations[ operationKey ];
			}, this );
		};

		TokenParser.prototype.getTranslatedText = function(sType, oOperation, sResourceBundle) {
			var sTextKey = oOperation.key;

			sType = sType !== "default" ? "_" + sType.toUpperCase() + "_" : "";

			if (sType === "_STRING_" || sType === "_BOOLEAN_") {
				sType = "";
			}
			if (sType === "_TIME_") {
				sType = "_DATE_";
			}

			if (!sResourceBundle) {
				sResourceBundle = "sap.m";
			}

			sTextKey = "CONDITIONPANEL_OPTION" + sType + sTextKey;
			var sText = sap.ui.getCore().getLibraryResourceBundle(sResourceBundle).getText(sTextKey) || sTextKey;
			if (sText.startsWith("CONDITIONPANEL_OPTION")) {
				// when for the specified type the resource does not exist use the normal string resource text
				sTextKey = "CONDITIONPANEL_OPTION" + oOperation.key;
				sText = sap.ui.getCore().getLibraryResourceBundle(sResourceBundle).getText(sTextKey);
			}

			//TODO NE operation missing in resources
			if (sText === "CONDITIONPANEL_OPTIONNE") {
				sText = "not equals to";
			}

			return sText;
		};

		TokenParser.prototype.associateInput = function( oInput ) {
			this._oTokenInput = oInput;

			var aValidators = this._oTokenInput._tokenizer ? this._oTokenInput._tokenizer._aTokenValidators.slice() : [];
			this._oTokenInput.removeAllValidators();

			this._oTokenInput.addValidator( function( args ) {
				//queue the validator calls
				if (aValidators) {
					var oToken;
					aValidators.some(function(fValidator) {
						oToken = fValidator( args );
						return oToken;
					}, this);

					if (oToken) {
						return oToken;
					}
				}

				if ( args.suggestionObject && args.suggestionObject.getKey) {
					var key = args.suggestionObject.getKey();
					var text = args.suggestionObject.getText();
					var additionalText = args.suggestionObject.getAdditionalText();
					//var argsValue = args.text;
					//var inputValue = this.getValue();

					if ( additionalText ) { //} && additionalText === argsValue) {
						return this._validate( additionalText );
					} else {
						return new Token( { key: key, text: text + " (" + key + ")", tooltip: text } );
					}
				}

				if ( args.suggestedToken ) {
					var sText = args.suggestedToken.getText();
					var sKey = args.suggestedToken.getKey();
					args.suggestedToken.setText( sText + " (" + sKey + ")" );
					args.suggestedToken.setTooltip( args.suggestedToken.getText() );

					//aTokens.push(token);
					return args.suggestedToken;
				}

				if ( args.text ) {
					return this._validate( args.text );
				}

				return null;
			}.bind( this ) );

		};


		TokenParser.prototype._validate = function( sText ) {
			var oKeyField = this._aKeyFields.length > 0 ? this._aKeyFields[ 0 ] : null;

			if (oKeyField) {
				var akeyFieldMaches = /^\w+\:\s/.exec( sText );
				if ( akeyFieldMaches ) {
					var sKeyLabel = akeyFieldMaches[ 0 ];
					oKeyField = this._getKeyFieldByLabel( sKeyLabel.slice( 0, sKeyLabel.indexOf( ":" ) ) );
					sText = sText.slice( akeyFieldMaches[ 0 ].length ).trim();
				}
			}

			var type = oKeyField && oKeyField.type || "default";
			switch (type) {
				case "numeric":
					if (!oKeyField.oFormatter) {
						var oFloatFormatOptions;
						if (oKeyField.precision || oKeyField.scale) {
							oFloatFormatOptions = {};
							if (oKeyField.precision) {
								oFloatFormatOptions["maxIntegerDigits"] = parseInt(oKeyField.precision);
							}
							if (oKeyField.scale) {
								oFloatFormatOptions["maxFractionDigits"] = parseInt(oKeyField.scale);
							}
						}
						oKeyField.oFormatter = NumberFormat.getFloatInstance(oFloatFormatOptions);
					}
					break;
				case "date":
					if (!oKeyField.oFormatter) {
						oKeyField.oFormatter = DateFormat.getDateInstance({strictParsing : true});
					}
					break;
				case "time":
					if (!oKeyField.oFormatter) {
						oKeyField.oFormatter = DateFormat.getTimeInstance({strictParsing : true});
					}
					break;
				default:
					// not defined :-)
			}

			var aTypeOperations = this._mTypeOperations[ type ];

			var fCheck = function( oOperation, sText ) {

				var aMatch = oOperation.match( sText );
				if ( aMatch ) {
					if (oKeyField && oKeyField.oFormatter) {
						for (var i = 1; i < aMatch.length; i++) {
							if (!oKeyField.oFormatter.parse(aMatch[i], "string")) {
								return null;
							}
						}
					}

					var range = oOperation.getConditionData( sText, oKeyField ? oKeyField.oFormatter : undefined);
					range.keyField = oKeyField ? oKeyField.key : null;

					var sTokenText = ( oKeyField && oKeyField.label && this._aKeyFields.length > 1 ? oKeyField.label + ": " : "" ) + oOperation.getFilledTemplate( sText, oKeyField ? oKeyField.oFormatter : undefined);

					//sTokenText= sap.ui.base.BindingParser.complexParser.escape(sTokenText);
					sTokenText = ManagedObject.bindingParser.escape(sTokenText);
					var oToken = new Token({ text: sTokenText, tooltip: sTokenText }).data("range", range);

//					var oToken = new Token().data("range", range);
//					oToken.setText(sTokenText);
//					oToken.setTooltip(sTokenText);
					return oToken;
				}
				return null;
			}.bind(this);

			var token;
			if ( aTypeOperations.some( function( operationKey ) {
					//if (this.getOperationKeys().some(function(operationKey) {
					token = fCheck( this._mOperations[ operationKey ], sText );
					return token;
				}, this ) ) {
				return token;
			}

			// check for default operation
			//var sDefaultOperation = "EQ";
			if ( this._sDefaultOperation && this._mOperations[ this._sDefaultOperation ] ) {
				sText = this._mOperations[ this._sDefaultOperation ].template.replace( "$0", sText );
				return fCheck( this._mOperations[ this._sDefaultOperation ], sText );
			}

			return null;
		};

		return TokenParser;
	}, true );