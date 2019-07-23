/*!
 * ${copyright}
 */

// Provides control sap.rules.ui.AstExpressionBasic.
sap.ui.define([
    "jquery.sap.global",
    "./library",
    "sap/rules/ui/Utils",
    "sap/rules/ui/AstExpressionBasic",
    "sap/rules/ui/Constants"
], function (jQuery, library, Utils, AstExpressionBasic, Constants) {
    "use strict";

    /**
     * Constructor for a new DecisionTableCellAstExpressionBasic sap.rules.ui.AstExpressionBasic.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * The <code>sap.rules.ui.DecisionTableCellAstExpressionBasic</code> control provides the ability to define expressions for complex rules in a decision table.
     * @extends  sap.rules.ui.AstExpressionBasic
     *
     * @author SAP SE
     * @version 1.66.0
     *
     * @constructor
     * @private
     * @alias sap.rules.ui.DecisionTableCellAstExpressionBasic
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var DecisionTableCellAstExpressionBasic = AstExpressionBasic.extend("sap.rules.ui.DecisionTableCellAstExpressionBasic", {
        metadata: {

            library: "sap.rules.ui",
            properties: {
                /**
                 * Defines the header value of the control.
                 */
                headerValue: {
                    type: "string",
                    defaultValue: "",
                    bindable: "bindable"
                },
                /**
                 * Defines the fixed operator value of the control.
                 */
                fixedOperator: {
                    type: "string",
                    defaultValue: "",
                    bindable: "bindable"
                },
                type: {
                    type: "sap.rules.ui.ExpressionType",
                    defaultValue: sap.rules.ui.ExpressionType.BooleanEnhanced,
                    bindable: "bindable"
                }
            }
        }
    });

    DecisionTableCellAstExpressionBasic.prototype.validateExpression = function () {
        var expressionValue = this.getValue();
        if (expressionValue) {
            var sValue = this.getHeaderValue() + " " + this.getFixedOperator() + " " + expressionValue;
            //sap.rules.ui.AstExpressionBasic.prototype.validateExpression.apply(this, [sValue]);
        } else {
            this.setValueStateText("");
        }
    };

    DecisionTableCellAstExpressionBasic.prototype.init = function () {
        sap.rules.ui.AstExpressionBasic.prototype.init.apply(this, arguments);
        this.bFlagForChangeBeforeBlur = false;
		this.oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");
    };

    DecisionTableCellAstExpressionBasic.prototype.onAfterRendering = function () {
        var that = this;
        this._oAstExpressionLanguage = sap.ui.getCore().byId(this.getAstExpressionLanguage());
        sap.rules.ui.AstExpressionBasic.prototype.onAfterRendering.apply(this, arguments);
        this.oDecisionTableCell = (this.getParent() && this.getParent().getParent()) ? this.getParent().getParent() : null;
        this._handleValidation();
        if (jQuery.sap.byId(this.getId()).closest('td').next().width()) {
            this._showPopUp();
        }
        if (this.oDecisionTableCell) {
            var valueStatePath = this.oDecisionTableCell.getValueStatePath();
            var dtModel = this.oDecisionTableCell.getModel("dtModel");
            var oDisplayedControl = this.oDecisionTableCell.getAggregation("_displayedControl");
            if (oDisplayedControl) {
                dtModel.setProperty(valueStatePath.slice(8), sap.ui.core.ValueState.None);
            }
        }
    };

    DecisionTableCellAstExpressionBasic.prototype._handleValidation = function () {
        this.validateExpression();
        //TODO: add error popup
        /*this._showErrorMessage();
        if (this.getProperty("valueStateText") && this.codeMirror) {
            this.codeMirror.options.expressionEditor._showPopUp();
        }*/
    };

    DecisionTableCellAstExpressionBasic.prototype.exit = function () {
        //sap.rules.ui.AstExpressionBasic.prototype.exit.apply(this, arguments);
        this._handleValidation();
        if (this.bFocusCellAfterEscape && this.oDecisionTableCell) {
            var oHTMLParent = this.oDecisionTableCell.getDomRef().parentElement.parentElement;
            if (oHTMLParent) {
                jQuery(oHTMLParent).focus();
            }
        }

    };

    // Event Listeners for integration between [Code Mirror - AstExpressionBasic - popover - DTCell] to work together in all browsers and OS
    DecisionTableCellAstExpressionBasic.prototype.createEventListeners = function () {

    };

    DecisionTableCellAstExpressionBasic.prototype._updateModelAstNodes = function (oModel, oColumnData) {
        if (this.oDecisionTableCell) {
            var astNodes = oColumnData.ASTNodes;
            for (var node in astNodes) {
                var updatedAstNode = {};
                if (astNodes[node].Root) {
                    updatedAstNode.Sequence = 1;
                    updatedAstNode.Root = true;
                } else {
                    updatedAstNode.Sequence = astNodes[node].SequenceNumber;
                    updatedAstNode.ParentId = astNodes[node].ParentId;
                }
                if (astNodes[node].Function) {
                    updatedAstNode.Function = astNodes[node].Function ? astNodes[node].Function : "";
                }
				if(astNodes[node].Type === "I") {
                    updatedAstNode.IncompleteExpression = astNodes[node].Value;
                }
                if (astNodes[node].Type !== "P" && astNodes[node].Type !== "O" && !astNodes[node].Function) {
                    updatedAstNode.BusinessDataType = astNodes[node].Output ? astNodes[node].Output.BusinessDataType : astNodes[node].BusinessDataType;
                    updatedAstNode.DataObjectType = astNodes[node].Output ? astNodes[node].Output.DataObjectType : astNodes[node].DataObjectType;
                    updatedAstNode.Value = astNodes[node].Value ? astNodes[node].Value : "";
                } else if (astNodes[node].Type === "O") {
                    updatedAstNode.Reference = astNodes[node].Reference;
                }

                updatedAstNode.NodeId = astNodes[node].Id;
                updatedAstNode.Type = astNodes[node].Type;
                updatedAstNode.RuleId = oColumnData.RuleId;
                updatedAstNode.Version = oColumnData.Version;
                updatedAstNode.ColId = oColumnData.ColId;
                updatedAstNode.RowId = oColumnData.RowId;

                var mParameters = {};
                mParameters.properties = updatedAstNode;
                mParameters.groupId = "changes";
                oModel.createEntry("/DecisionTableRowCellASTs", mParameters);
            }
        }
    };

    DecisionTableCellAstExpressionBasic.prototype._removeExistingAstNodes = function (oModel, oColumnData) {
        if (this.oDecisionTableCell) {
            var mParameters = {};
            mParameters.ColId = oColumnData.ColId;
            mParameters.RowId = oColumnData.RowId;
            mParameters.RuleId = oColumnData.RuleId;
            mParameters.Version = oColumnData.Version;

            oModel.callFunction("/DeleteDTRowCellASTDraft", {
                method: "POST",
                groupId: "changes",
                urlParameters: mParameters
            });

        }
    };

    DecisionTableCellAstExpressionBasic.prototype._changeValue = function (oEvent) {
        var oData = {};
        if (this.oDecisionTableCell) {
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("newValue");
            oSource.setValue(sValue);
            var dtInput = this.oDecisionTableCell.getAggregation("_displayedControl");
            dtInput.setValue(oEvent.getParameter("displayText"));
            dtInput.JSON = this.getJsonData();
            dtInput.relString = this.relString;
            var oAstExpressionLanguage = sap.ui.getCore().byId(this.getAstExpressionLanguage());
            var oModel = this.getBindingContext().getModel();
            oData = this.oDecisionTableCell.getKeyProperties();
            var astNodes = oEvent.getParameter("astNodes");
            if (astNodes && astNodes.length === 1 && astNodes[0].Type === "I" && astNodes[0].Value !== "") {
				dtInput.setValueState("Error"); 
                dtInput.setTooltip(this.oBundle.getText("invalidExpression")) ;
            } else {
				dtInput.setValueState("None"); 
            }
            oData.ASTNodes = astNodes;
            var sCellContentPath = this.oDecisionTableCell.getValuePath();
			oModel.setProperty(sCellContentPath, oModel.getProperty(sCellContentPath));
            oModel.setDeferredGroups(["changes"]);
            this._removeExistingAstNodes(oModel, oData);
            this._updateModelAstNodes(oModel, oData);
            oModel.submitChanges({
                groupId: "changes"
            });
            oSource._validateControl();
        }
    };

    return DecisionTableCellAstExpressionBasic;

}, /* bExport= */ true);
