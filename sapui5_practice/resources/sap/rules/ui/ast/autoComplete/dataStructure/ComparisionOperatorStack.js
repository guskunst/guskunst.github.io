sap.ui.define(["sap/rules/ui/ast/autoComplete/dataStructure/BaseStack",
		"sap/rules/ui/ast/constants/Constants",
		"sap/rules/ui/ast/autoComplete/node/TermNode",
		"sap/rules/ui/ast/autoComplete/dataStructure/Stack",
		"sap/rules/ui/ast/provider/OperatorProvider"
	],
	function (BaseStack, Constants, TermNode, Stack, OperatorProvider) {
		"use strict";

		var ComparisionOperatorStack = function () {
			BaseStack.apply(this, arguments);
			this._name = "";
			this._sLeftOperandBusinessDataType = null;
			var node = new sap.rules.ui.ast.autoComplete.dataStructure.Stack();
			node.setContextComparision(true);
			node.setPrevious(this._top);
			this._top = node;
			this._size += 1;
		};

		ComparisionOperatorStack.prototype = new BaseStack();
		ComparisionOperatorStack.prototype.constructor = BaseStack;

		ComparisionOperatorStack.prototype.push = function (oToken) {
			var type = oToken.getTokenType();
			switch (type) {
			case Constants.COMPARISION_OPERATOR:
				return this._calculateTopNode();
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

		ComparisionOperatorStack.prototype.getName = function () {
			return this._name;
		};

		ComparisionOperatorStack.prototype.setName = function (name) {
			this._name = name;
			this._metadata = OperatorProvider.getInstance().getOperatorByName(name)
			return this;
		};

		ComparisionOperatorStack.prototype.setLeftOperandBusinessDataType = function (sLeftOperandBusinessDataType) {
			this._sLeftOperandBusinessDataType = sLeftOperandBusinessDataType;
			if (this._top && "setComparisionLeftOperandType" in this._top) {
				this._top.setComparisionLeftOperandType(sLeftOperandBusinessDataType);
			}
		};

		ComparisionOperatorStack.prototype._calculateTopNode = function (name) {
			this._top = this._getNodeRecursively(this.getTop());
			return {
				bTokenPushed: true,
				bComparisionOperatorClosed: true,
				oMetadata: this._metadata
			};
		};

		return ComparisionOperatorStack;
	}, true);