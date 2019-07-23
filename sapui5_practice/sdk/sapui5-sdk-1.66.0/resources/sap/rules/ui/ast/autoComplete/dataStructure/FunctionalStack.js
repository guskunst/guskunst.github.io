sap.ui.define(["sap/rules/ui/ast/autoComplete/dataStructure/BaseStack",
		"sap/rules/ui/ast/constants/Constants",
		"sap/rules/ui/ast/autoComplete/node/TermNode",
		"sap/rules/ui/ast/autoComplete/dataStructure/Stack"
	],
	function (BaseStack, Constants, TermNode, Stack) {
		"use strict";

		var FunctionalStack = function () {
			BaseStack.apply(this, arguments);
			this._name = "";
			this._oFunction = null;
			//TODO: Max size is dependent of metadata
			this._maxSize = 10000;
		};

		FunctionalStack.prototype = new BaseStack();
		FunctionalStack.prototype.constructor = BaseStack;

		FunctionalStack.prototype.push = function (oToken) {
			var type = oToken.getTokenType();
			switch (type) {
			case Constants.LEFTPARENTHESIS:
				return this.handleLeftParenthesisToken(oToken);
			case Constants.RIGHTPARENTHESIS:
				return this._handleRightParenthesisToken(oToken);
			case Constants.COMMA:
				if (this.getTop() && "push" in this.getTop()) {
					var oResult = this.getTop().push(oToken);
					if (oResult.bTokenPushed == false && this.getHasOpenParenthesis() == true) {
						return this._createTopNode();
					} else if (oResult.bTokenPushed == false) {
						return oResult;
					}
				} else {
					// TODO:
					return {
						bTokenPushed: false,
						error: "invalid token comma"
					}
				}
			case Constants.WS:
				return {
					bTokenPushed: true
				};
			default:
				if ("push" in this._top) {
					return this._top.push(oToken);
				} else {
					return {
						bTokenPushed: false
					}
				}

			}
		};

		FunctionalStack.prototype._getArgSequenceDeterminingBusinessDataType = function () {
			var aArgsMetadata = this.getFunction().getArgumentsMetadata();
			for (var lIndex = 0; lIndex < aArgsMetadata.length; lIndex++) {
				if (aArgsMetadata[lIndex][Constants.DETERMINESRETURNDATAOBJECTTYPE] == Constants.YES) {
					return lIndex;
				}
			}
			return -1;
		};

		FunctionalStack.prototype.getName = function () {
			return this._name;
		};

		FunctionalStack.prototype.setName = function (name) {
			this._name = name;
			return this;
		};

		FunctionalStack.prototype.getFunction = function () {
			return this._oFunction;
		};

		FunctionalStack.prototype.setFunction = function (oFunction) {
			this._oFunction = oFunction;
			return this;
		};

		FunctionalStack.prototype.getMaxSize = function () {
			return this._maxSize;
		};

		FunctionalStack.prototype._handleRightParenthesisToken = function (oToken) {
			if (this.getTop() && "push" in this.getTop()) {
				var oResult = this.getTop().push(oToken);
				if (oResult.bTokenPushed === false && this.getHasOpenParenthesis() == true) {
					return this._closeFunctionAndReturnCalculatedNode();
				} else if (oResult.bTokenPushed === true) {
					return oResult;
				} else {
					// TODO :throw exception
					return {
						bTokenPushed: false
					};
				}
			} else if (this.getTop() && !("push" in this.getTop()) && this.getHasOpenParenthesis() == true) {
				return this._closeFunctionAndReturnCalculatedNode();
			} else {
				return {
					bTokenPushed: false
				};
			}

		};

		FunctionalStack.prototype._closeFunctionAndReturnCalculatedNode = function () {
			this.setHasOpenParenthesis(false);
			var sDefaultDataObjectType = this.getFunction().getDefaultReturnDataObjectType();
			var aReturnDataObjectTypeList = this.getFunction().getReturnDataObjectTypeList();
			var cNode = new TermNode();
			cNode.setName(this.getFunction().getName());
			cNode.setLabel(this.getFunction().getLabel());
			cNode.setDataObjectType(sDefaultDataObjectType); // Default is table
			cNode.setBusinessDataType(this.getFunction().getDefaultReturnBusinessDataType());
			if (this.getTermPrefixId() && this.getTermPrefixId() != "") { // TODO :: handle 
				cNode.setId(this.getTermPrefixId());
			}
			var lIndex = this._getArgSequenceDeterminingBusinessDataType();
			if (aReturnDataObjectTypeList && aReturnDataObjectTypeList.length >= 1 && lIndex > -1 && this._determinetoChangeDataObjectType()) {
				var node = this._getNodeRecursively(this.peek(lIndex));
				if (node instanceof TermNode) {
					// Special Handling metadata like Count
					if (sDefaultDataObjectType == Constants.Element) {
						cNode.setDataObjectType(Constants.Table);
					} else {
						cNode.setDataObjectType(Constants.Element);
						var sBusinessDataType = node.getBusinessDataType();
						cNode.setBusinessDataType(sBusinessDataType);
					}

				}
			}
			this._top = cNode;
			this._size = 1;
			return {
				bTokenPushed: true,
				bFunctionClosed: true
			};
		};

		FunctionalStack.prototype._determinetoChangeDataObjectType = function () {
			if (this.getFunction().getName() == "COUNT") {
				if (this.getSize() == 1)
					return false;
				else
					return true;
			} else if (this.getSize() <= 2)
				return true;
			return false;
		};

		FunctionalStack.prototype.handleLeftParenthesisToken = function (oToken) {
			if (this.getHasOpenParenthesis() === false && this.getSize() == 0) {
				this.setHasOpenParenthesis(true);
				this._top = new sap.rules.ui.ast.autoComplete.dataStructure.Stack();
				// TODO : read from mandatory parameter and set the expected 
				// dataObjectType and BusinessDataType
				this._top.setProbableDataObjectReturnTypeList(Constants.TABLE);
				this._size += 1;

				return {
					bTokenPushed: true
				}
			} else if (this.getHasOpenParenthesis() == true && this.getSize() > 0 && this.getTop() && "push" in this.getTop()) {
				return this.getTop().push(oToken);
			} else {
				// TODO : throw exception
				return {
					bTokenPushed: false
				}
			}
		};

		FunctionalStack.prototype._createTopNode = function () {
			var node = new sap.rules.ui.ast.autoComplete.dataStructure.Stack();

			var oTopNode = this._getNodeRecursively(this._top);
			// TODO: hack for now to make attribute with prefix id
			node.setProbableDataObjectReturnTypeList(Constants.ATTRIBUTEDOTYPE);
			if (this.getSize() == 1 && oTopNode instanceof TermNode) {
				this.setTermPrefixId(oTopNode.getId());
			}
			node.setTermPrefixId(this.getTermPrefixId());
			node.setPrevious(this._top);
			this._top = node;
			this._size += 1;
			return {
				bTokenPushed: true
			};
		}

		return FunctionalStack;
	}, true);