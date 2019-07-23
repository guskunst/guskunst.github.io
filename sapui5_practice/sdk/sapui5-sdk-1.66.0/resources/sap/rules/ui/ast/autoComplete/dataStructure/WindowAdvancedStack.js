sap.ui.define(["sap/rules/ui/ast/autoComplete/dataStructure/BaseStack",
		"sap/rules/ui/ast/constants/Constants",
		"sap/rules/ui/ast/autoComplete/node/TermNode",
		"sap/rules/ui/ast/autoComplete/dataStructure/Stack"
	],
	function (BaseStack, Constants, TermNode, Stack) {
		"use strict";

		var WindowAdvancedStack = function () {
			BaseStack.apply(this, arguments);
			this._name = "";
			this._oFunction = null;
		};

		WindowAdvancedStack.prototype = new BaseStack();
		WindowAdvancedStack.prototype.constructor = BaseStack;

		WindowAdvancedStack.prototype.push = function (oToken) {
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

		WindowAdvancedStack.prototype.getName = function () {
			return this._name;
		};

		WindowAdvancedStack.prototype.setName = function (name) {
			this._name = name;
			return this;
		};

		WindowAdvancedStack.prototype.getFunction = function () {
			return this._oFunction;
		};

		WindowAdvancedStack.prototype.setFunction = function (oFunction) {
			this._oFunction = oFunction;
			return this;
		};

		WindowAdvancedStack.prototype._handleRightParenthesisToken = function (oToken) {
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

		WindowAdvancedStack.prototype._closeFunctionAndReturnCalculatedNode = function () {
			this.setHasOpenParenthesis(false);
			var cNode = new TermNode();
			cNode.setName(this.getFunction().getName());
			cNode.setLabel(this.getFunction().getLabel());
			cNode.setDataObjectType(Constants.Element); // Default is table
			var aBusinessDataTypeCollection = this.getFunction().getReturnValueBussinessDataTypeCollection();
			var sBusinessDataType;
			var oFirstNode;
			var oSecondNode;
			if (this.getFunction().getNumberOfArguments() == 2 && this.getTop() && this.getTop().getPrevious()) {
				oFirstNode = this._getNodeRecursively(this.getTop().getPrevious());
				oSecondNode = this._getNodeRecursively(this.getTop());
				if ("getBusinessDataType" in oFirstNode && "getBusinessDataType" in oSecondNode)
					if (aBusinessDataTypeCollection[oFirstNode.getBusinessDataType()] && aBusinessDataTypeCollection[oFirstNode.getBusinessDataType()][oSecondNode.getBusinessDataType()]) {
						sBusinessDataType = aBusinessDataTypeCollection[oFirstNode.getBusinessDataType()][oSecondNode.getBusinessDataType()];
					}
			} else if (this.getFunction().getNumberOfArguments() < 2) {
				sBusinessDataType = Object.keys(this.getFunction().getReturnValueBussinessDataTypeCollection())[0];
			}

			if (sBusinessDataType) {
				cNode.setBusinessDataType(sBusinessDataType)
			} else {
				// TODO : throw exception
			}
			this._top = cNode;
			this._size = 1;
			return {
				bTokenPushed: true,
				bWindowAndAdvanced: true
			};
		};

		WindowAdvancedStack.prototype.handleLeftParenthesisToken = function (oToken) {
			if (this.getHasOpenParenthesis() === false && this.getSize() == 0) {
				this.setHasOpenParenthesis(true);
				this._top = new sap.rules.ui.ast.autoComplete.dataStructure.Stack();
				// TODO : read from mandatory parameter and set the expected 
				// dataObjectType and BusinessDataType
				this._top.setProbableDataObjectReturnTypeList(Constants.ELEMENT);
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

		WindowAdvancedStack.prototype._createTopNode = function () {
			var node = new sap.rules.ui.ast.autoComplete.dataStructure.Stack();
			node.setProbableBusinessDataReturnTypeList(this.getFunction().getReturnValueBussinessDataTypeCollection());
			node.setProbableDataObjectReturnTypeList(this.getFunction().getReturnValueDataObjectTypeCollection());
			// TODO: Handle BusinessDataType Validation
			node.setPrevious(this._top);
			this._top = node;
			this._size += 1;
			return {
				bTokenPushed: true
			};
		}

		return WindowAdvancedStack;
	}, true);