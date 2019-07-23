sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/List",
    "sap/ui/model/json/JSONModel",
    "sap/rules/ui/ast/constants/Constants"

], function (Control, List, JSONModel, Constants) {
    "use strict";

    var instance;
    var AggregateFunctionDialog = function () {
        this._vocabularyExpressionId = "";
        this.functionLabelDisplay = "";
        this.functionLabel = "";
        this._aggregateFunctionSelected = "";
        this._whereExpressionId = "";
        this._groupBy = [];
        this.functionLabelExpression = "";
        this.displayTextVocabulary = "";
        this.jsonDataArray = [];
        this.groupBySelectEnable = true;
        this._countFunctionSelected = false;
        this.oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");
    };

    AggregateFunctionDialog.prototype._filterAggregateFunction = function (aggregateFunction) {
        var functionJson = [];
        if (aggregateFunction && aggregateFunction.aggregate) {
            for (var iterator = 0; iterator < aggregateFunction.aggregate.length; iterator++) {
                if (aggregateFunction.aggregate[iterator].name !== Constants.FILTER) {
                    functionJson.push(aggregateFunction.aggregate[iterator]);
                }
            }
            return {
                aggregate: functionJson
            };
        }
    };

    AggregateFunctionDialog.prototype._createFunctionSelectionDropDown = function (aggregateFunction) {
        var that = this;
        aggregateFunction = this._filterAggregateFunction(aggregateFunction);
        var model = new sap.ui.model.json.JSONModel(aggregateFunction);

        this.functionSelect = new sap.m.Select({
            selectedKey: this._aggregateFunctionSelected,
            forceSelection: false,
            showSecondaryValues: true,
            layoutData: new sap.ui.layout.GridData({
                span: "L3 M3 S3"
            }),
            change: function (oEvent) {
                this._aggregateFunctionSelected = oEvent.getSource().getSelectedItem().getText();
                if (this._aggregateFunctionSelected === Constants.COUNT) {
                    this._countFunctionSelected = true;
                    this.astExpressionBasicForVocabulary.setCountFunctionSelected(true);
                } else {
                    this._countFunctionSelected = false;
                    this.astExpressionBasicForVocabulary.setCountFunctionSelected(false);
                }
                this.astExpressionBasicForVocabulary.setValue("");
                this.applyButton.setEnabled(false);
                this.astExpressionBasicForWhere.setEditable(false);
                this.groupBySelect.setEnabled(false);
                this._whereExpressionId = ""
                this._groupBy = [];
                this.groupBySelected = [];
                this.astExpressionBasicForWhere.setValue("");
                this._whereExpressionId = "";
                this.functionLabelField.setValue("");
                this.groupBySelect.setSelectedKeys([]);
            }.bind(this)
        });
        this.functionSelect.setModel(model);
        this.functionSelect.bindItems({
            path: "/aggregate",
            //sorter : new sap.ui.model.Sorter("lastName"),
            template: new sap.ui.core.ListItem({
                text: "{name}",
                key: "{name}",
                additionalText: "{label}"
            })
        });

        return this.functionSelect;
    };
    AggregateFunctionDialog.prototype._enableField = function () {
        if (this._vocabularyExpressionId && this._aggregateFunctionSelected) {
            return true;
        } else {
            return false;
        }
    };
    
    AggregateFunctionDialog.prototype._enableFieldGroupBy = function () {
        if (this._vocabularyExpressionId && this._aggregateFunctionSelected && this.groupBySelectEnable) {
            return true;
        } else {
            return false;
        }
    };

    AggregateFunctionDialog.prototype._enableFieldWhere = function () {
        if (this._vocabularyExpressionId && this._aggregateFunctionSelected && this.jsonDataArray.length === 0) {
            return true;
        } else {
            return false;
        }
    };
    
    AggregateFunctionDialog.prototype._createVocabularyAstExpression = function () {
        var that = this;
        var jsonData = [];
        this.astExpressionBasicForVocabulary = new sap.rules.ui.AstExpressionBasic({
            value: this._vocabularyExpressionId,
            countFunctionSelected: this._countFunctionSelected,
            jsonData: this.jsonDataArray,
            astExpressionLanguage: this._oAstExpressionLanguage,
            enableAggregateFunctionVocabulary: true,
            editable: true,
            change: function (oEvent) {
                this._vocabularyExpressionId = oEvent.getParameter("newValue");
                if (that._vocabularyExpressionId && this._aggregateFunctionSelected) {
                    if (oEvent.getSource().getProperty("jsonData") && oEvent.getSource().getProperty("jsonData").length > 0) {
                        that._helperForSelectFunction(oEvent);
                    } else {
                        this.sDataObjectSelected = that._getDataObjectFromExpression(that._vocabularyExpressionId);
                        this.functionLabelDisplay = this._aggregateFunctionSelected + '(' + this.sDataObjectSelected.label + ')';
                        this.functionLabel = this._aggregateFunctionSelected + '(' + this.dataObjectId + ')';
                        this.functionLabelField.setValue(that.functionLabelDisplay);
                        this.astExpressionBasicForWhere.setValue("");
                        this._whereExpressionId = "";
                        this.applyButton.setEnabled(true);
                        this.jsonDataArray = [];
                        var str = this._setDataObjectInfoForWhereConditionAutoSuggestion();
                        this.astExpressionBasicForWhere.setDataObjectInfo(str);
                        this._bindGroupByDropDown();
                        this._groupBy = [];
                        this.groupBySelected = [];
                        this.astExpressionBasicForWhere.setEditable(true);
                        this.groupBySelectEnable = (this._aggregateFunctionSelected !== Constants.COUNTDISTINCT && this._aggregateFunctionSelected !== Constants.DISTINCT)?
                            true : false;
                        this.groupBySelect.setEnabled(this.groupBySelectEnable);
                        if (!this._isDataObjectStructure()) {
                            this.astExpressionBasicForVocabulary.setValueState("None");
                        }
                    }
                } else {
                    this.applyButton.setEnabled(false);
                    this.astExpressionBasicForWhere.setEditable(false);
                    this.groupBySelect.setEnabled(false);
                    this.astExpressionBasicForWhere.setValue("");
                    this._whereExpressionId = "";
                    this.astExpressionBasicForWhere.setDataObjectInfo("");
                    this.functionLabelField.setValue("");
                    this.groupBySelect.setSelectedKeys([]);
                    this.jsonDataArray = [];
                }
            }.bind(this)
        });
        return this.astExpressionBasicForVocabulary;
    };

    AggregateFunctionDialog.prototype._helperForSelectFunction = function (oEvent) {
        if (oEvent.getSource().getProperty("jsonData") && oEvent.getSource().getProperty("jsonData").length > 0) {
            this.functionLabelExpression = oEvent.getSource().getProperty("jsonData")[0].functionLabel;
            this.jsonDataArray = oEvent.getSource().getProperty("jsonData");
            this.sDataObjectSelected = this._getDataObjectFromExpression(this.functionLabelExpression);
            if (Object.keys(this.jsonDataArray[0].attributes).length === 0 || Object.keys(this.jsonDataArray[0].attributes).length > 1) {
                this.applyButton.setEnabled(false);
                this.astExpressionBasicForVocabulary.setValueState("Error");
                this.astExpressionBasicForVocabulary.setValueStateText(this.oBundle.getText("invalidAttribute"));
            } else {
                this.applyButton.setEnabled(true);
                this.astExpressionBasicForVocabulary.setValueState("None");
            }
            
            if (!this._isDataObjectStructure()) {
                this.astExpressionBasicForVocabulary.setValueState("None");
            }

            this.displayTextVocabulary = oEvent.getParameter("displayText");
            this.functionLabelDisplay = this._aggregateFunctionSelected + '(' + this.displayTextVocabulary + ')';
            this.functionLabelField.setValue(this.functionLabelDisplay);
            this.functionLabel = this._aggregateFunctionSelected + '(' + this.functionLabelExpression + ')';
            this.astExpressionBasicForWhere.setValue("");
            this._whereExpressionId = "";
            var str = this._setDataObjectInfoForWhereConditionAutoSuggestion();
            this.astExpressionBasicForWhere.setDataObjectInfo(str);
            this._bindGroupByDropDown();
            this._groupBy = [];
            this.groupBySelected = [];
            this.astExpressionBasicForWhere.setEditable(false);
            this.groupBySelectEnable = (this._aggregateFunctionSelected !== Constants.COUNTDISTINCT && this._aggregateFunctionSelected !== Constants.DISTINCT)?
                    true : false;
            this.groupBySelect.setEnabled(this.groupBySelectEnable);
        }
    };

    AggregateFunctionDialog.prototype._setDataObjectInfoForWhereConditionAutoSuggestion = function () {
        if (this.jsonDataArray && this.jsonDataArray.length > 0) {
            return this._aggregateFunctionSelected + "(FILTER(" + this._vocabularyExpressionId + ",";
        } else if (this.dataObjectId) {
            var association = this.getAssociationId();
            var dataObjectId = this.dataObjectId;
            if (dataObjectId.includes("/")) {
                dataObjectId = dataObjectId.replace("/", "");
            }
            if (association) {
                return this._aggregateFunctionSelected + "(FILTER(/" + dataObjectId + association + ",";
            }
            return this._aggregateFunctionSelected + "(FILTER(/" + dataObjectId + ",";

        }
    };

    AggregateFunctionDialog.prototype.getAssociationId = function () {
        var vocabularyId = ""
            if (this.jsonDataArray && this.jsonDataArray.length > 0) {
                if (this.jsonDataArray[0].attributes) {
                    for (var key in this.jsonDataArray[0].attributes) {
                        vocabularyId = this.jsonDataArray[0].doVocabId + key.replace(".", "");
                        break;
                    }
                }
            } else {
                vocabularyId = this._vocabularyExpressionId;
            }
            if (vocabularyId) {
                var splitArray = vocabularyId.split("/");
            }
        var vocabulary = "";
        if (splitArray.length > 3) {
            for (var iterator = 2; iterator < splitArray.length - 1; iterator++) {
                vocabulary += "/" + splitArray[iterator];
            }
        }
        return vocabulary;
    };
    
    AggregateFunctionDialog.prototype._getDataObjectFromExpression = function (expId) {
        var dataObjectId = "";
        if (expId && expId.trim() && expId.includes("(")) {
            var regExp = /\(([^)]+),/;
            var matches = expId.split("(")

            dataObjectId = (matches[0] === Constants.SELECT || matches[0] === Constants.TOP || matches[0] === Constants.BOTTOM) ? this.jsonDataArray[
                0].dataObject : "";
            dataObjectId = dataObjectId.replace("/", "");
        } else if (expId && expId.trim()) {
            var splitIdArray = expId.split("/");
            dataObjectId = splitIdArray[1];
        }
        if (dataObjectId) {
            var termsProvider = this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider;
            var oDataobjectInfo = {
                name: termsProvider.getTermByTermId(dataObjectId)._termName,
                label: termsProvider.getTermByTermId(dataObjectId)._label
            }
            this.dataObjectId = "/" + dataObjectId;
            return oDataobjectInfo;
        }
    };

    AggregateFunctionDialog.prototype._createWhereAstExpressionBasic = function () {
        var that = this;
        this.oModel = new sap.ui.model.json.JSONModel();
        this.oModel.setData({
            value: this._whereExpressionId,
        });
        this.astExpressionBasicForWhere = new sap.rules.ui.AstExpressionBasic({
            astExpressionLanguage: this._oAstExpressionLanguage,
            enableAggregateFunctionWhereClause: true,
            value: this._whereExpressionId,
            editable: that._enableFieldWhere(),
            dataObjectInfo: this._setDataObjectInfoForWhereConditionAutoSuggestion(),
            change: function (oEvent) {
                that._whereExpressionId = oEvent.getParameter("newValue");
            }.bind(this)
        });
        this.astExpressionBasicForWhere.setModel(this.oModel);
        return this.astExpressionBasicForWhere;
    };

    AggregateFunctionDialog.prototype._createGroupByDropDown = function () {
        var that = this;
        this.groupBySelect = new sap.m.MultiComboBox({
            showSecondaryValues: true,
            enabled: that._enableFieldGroupBy(),
            selectionFinish: function (oEvent) {
                that._groupBy = [];
                for (var i = 0; i < oEvent.getSource().getSelectedItems().length; i++) {
                    var id = "./" + oEvent.getSource().getSelectedItems()[i].getKey();
                    that._groupBy.push(id);
                }
            }
        })
        this.groupBySelect.bindItems({
            path: "/terms",
            template: new sap.ui.core.ListItem({
                text: "{label}",
                key: "{id}"
            })
        });

        this._bindGroupByDropDown();
        return this.groupBySelect;
    };

    AggregateFunctionDialog.prototype._bindGroupByDropDown = function () {
        if (this.dataObjectId) {
            var association = this.getAssociationId();
            if (association) {
                var autoSuggestion = this._getSuggestionsForTheGivenInput(this.dataObjectId + association, true);
            } else {
                var autoSuggestion = this._getSuggestionsForTheGivenInput(this.dataObjectId, true);
            }
            var attributeJson = this._getAttributesForGroupBy(autoSuggestion.autoComplete.categories);
            var model = new sap.ui.model.json.JSONModel(attributeJson);
            this.groupBySelect.setModel(model);
        }
        if (this.groupBySelected) {
            this.groupBySelect.setSelectedKeys(this.groupBySelected);
        }
    };

    AggregateFunctionDialog.prototype._getAttributesForGroupBy = function (aSuggestion) {
        var attributeJson = [];
        if (aSuggestion && aSuggestion.terms) {
            for (var iterator = 0; iterator < aSuggestion.terms.length; iterator++) {
                if (aSuggestion.terms[iterator].type === 'E') {
                    attributeJson.push(aSuggestion.terms[iterator]);
                }
            }
            return {
                terms: attributeJson
            };
        }

    };

    AggregateFunctionDialog.prototype._createFunctionLabel = function () {
        this.functionLabelField = new sap.m.TextArea({
            value: this.functionLabelDisplay,
            enabled: false,
            width: "100%",
            height: "34px"
        }).addStyleClass("sapAstFieldMargin");
        return this.functionLabelField;
    };

    AggregateFunctionDialog.prototype._clearData = function () {
        this._vocabularyExpressionId = "";
        this.functionLabelDisplay = "";
        this.functionLabel = "";
        this._aggregateFunctionSelected = "";
        this._groupBy = [];
        this._whereExpressionId = ""
        this.groupBySelected = [];
        this.dataObjectId = "";
        this.functionLabelExpression = "";
        this.displayTextVocabulary = "";
        this._countFunctionSelected = false;
        this.jsonDataArray = [];
        this.groupBySelectEnable = true;
    };

    AggregateFunctionDialog.prototype._convertFunctionLabelToText = function (dataObject, functionLabelDisplay) {
        this.termsProvider = this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider;
        var objectFromReference = this.termsProvider.getTermNameFromASTNodeReference(dataObject);
        functionLabelDisplay = functionLabelDisplay.replace(dataObject, objectFromReference);
        return functionLabelDisplay
    };

    AggregateFunctionDialog.prototype._createAggregationFunctionDialog = function (data, callBack, AstExpressionLanguage, dialogOpenedCallbackReference, jsonData) {
        var that = this;
        this._clearData();
        this.oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");
        this._oAstExpressionLanguage = AstExpressionLanguage;
        if (jsonData) {
            this._whereExpressionId = jsonData.filter;
            this._aggregateFunctionSelected = jsonData.function;
            this.functionLabel = jsonData.functionLabel;
            this.functionLabelDisplay = this._convertFunctionLabelToText(jsonData.dataObject, jsonData.functionLabel);
            if (jsonData.groupBy) {
                for (var i = 0; i < jsonData.groupBy.length; i++) {
                    this.groupBySelected.push(jsonData.groupBy[i].replace("./", ""));
                }
            }
            this._groupBy = jsonData.groupBy;
            this.dataObjectId = jsonData.dataObject;
            if (this._aggregateFunctionSelected === Constants.COUNT) {
                this._countFunctionSelected = true;
            }
            if (typeof jsonData.vocabulary === "object" || jsonData.vocabulary instanceof Object) {
                this._vocabularyExpressionId = jsonData.selectExpression;
                this.jsonDataArray = [jsonData.vocabulary];
                var association = this._returnAssociationBasedOnCardinality();
                if (association) {
                    this._whereExpressionId = this._removeAssociationIdToWhere(this._whereExpressionId);
                    this.groupBySelected = this._removeAssociationIdToGroupBySelected(jsonData.groupBy);
                    this._groupBy = this._removeAssociationIdToGroupBy(jsonData.groupBy);
                }
            } else {
                this._vocabularyExpressionId = jsonData.vocabulary;
                var association = this._returnAssociationBasedOnCardinality();
                if (association) {
                    this._whereExpressionId = this._removeAssociationIdToWhere(this._whereExpressionId);
                    this.groupBySelected = this._removeAssociationIdToGroupBySelected(jsonData.groupBy);
                    this._groupBy = this._removeAssociationIdToGroupBy(jsonData.groupBy);
                }
            }
            this.groupBySelectEnable = (this._aggregateFunctionSelected !== Constants.COUNTDISTINCT && this._aggregateFunctionSelected !== Constants.DISTINCT) ? true : false;

        }
        var verticalLayoutForAggregateFunction = new sap.ui.layout.form.SimpleForm({
            layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
            editable: true,
            content: [
                new sap.m.Label({
                    text: that.oBundle.getText("function")
                }), that._createFunctionSelectionDropDown(data),
                        new sap.m.Text({
                            text: that.oBundle.getText("vocabulary"),
                            textAlign:"End",
                            width:"90%",
                            layoutData: new sap.ui.layout.GridData({
                        span: "L2 M2 S2"
                    })
                        }),
                       
                        that._createVocabularyAstExpression(),
                    
                new sap.m.Label({
                    text: that.oBundle.getText("where")
                }),
                that._createWhereAstExpressionBasic(),
                new sap.m.Label({
                    text: that.oBundle.getText("group_by")
                }),
                that._createGroupByDropDown(),
                new sap.m.Label({
                    text: that.oBundle.getText("function_label")
                }).addStyleClass("sapAstFieldMargin"),
                that._createFunctionLabel()
            ]
        })

        var aggregateFunctionsDialog = new sap.m.Dialog({
            title: "Configure Aggregate Functions",
            contentWidth: "800px",
            showHeader: true,
            afterOpen: function () {
                that.astExpressionBasicForWhere.setValue(that._whereExpressionId);
            },
            beforeClose: function () {
					dialogOpenedCallbackReference(false);
				},
            content: [verticalLayoutForAggregateFunction],
            buttons: [
                this.applyButton = new sap.m.Button({
                    text: that.oBundle.getText("apply"),
                    enabled: that._enableField(),
                    press: function (event) {
                        if (that._isDataObjectStructure()) {
                            that.astExpressionBasicForVocabulary.setValueState("Error");
                            that.astExpressionBasicForVocabulary.setValueStateText(that.oBundle.getText("StructureNotSupported"));
                        } else {
                            that.astExpressionBasicForVocabulary.setValueState("None");
                            if (that.jsonDataArray && that.jsonDataArray.length > 0) {
                                var whereExpressionId = that._whereExpressionId;
                                var groupBy = that._groupBy;
                                var association = that._returnAssociationBasedOnCardinality();
                                if (association) {
                                    whereExpressionId = that._addAssociationIdToWhere(that._whereExpressionId, association);
                                    groupBy = that._addAssociationIdToGroupBy(that._groupBy, association);
                                }
                                var aggregateFunctionData = that._createJson(that._aggregateFunctionSelected, that.jsonDataArray[0],
                                    whereExpressionId, groupBy, that.functionLabel, that.dataObjectId);
                            } else {
                                var whereExpressionId = that._whereExpressionId;
                                var association = that._returnAssociationBasedOnCardinality();
                                var groupBy = that._groupBy
                                if (association) {
                                    whereExpressionId = that._addAssociationIdToWhere(that._whereExpressionId, association);
                                    groupBy = that._addAssociationIdToGroupBy(that._groupBy, association);
                                }
                                var aggregateFunctionData = that._createJson(that._aggregateFunctionSelected, that._vocabularyExpressionId,
                                    whereExpressionId, groupBy, that.functionLabel, that.dataObjectId);
                            }

                            event.getSource().mProperties = {
                                value: that.functionLabel,
                                jsonData: aggregateFunctionData
                            };
                            callBack(event);
                            that._setModal(false);
                            aggregateFunctionsDialog.close();
                            aggregateFunctionsDialog.destroy();
                        }
                    }
                }),
                new sap.m.Button({
                    text: that.oBundle.getText("cancel"),
                    press: function (event) {
                        that._setModal(false);
                        aggregateFunctionsDialog.close();
                        aggregateFunctionsDialog.destroy();
                    }
                })
            ]
        }).addStyleClass("sapUiSizeCompact");
        this._setModal(true);
        aggregateFunctionsDialog.open();
    };

    AggregateFunctionDialog.prototype._returnAssociationBasedOnCardinality = function () {
        var vocabularyId = "";
        if (this.jsonDataArray && this.jsonDataArray.length > 0) {
            if (this.jsonDataArray[0] && this.jsonDataArray[0].attributes) {
                for (var key in this.jsonDataArray[0].attributes) {
                    vocabularyId = this.jsonDataArray[0].doVocabId + key.replace(".", "");
                    break;
                }
            }
        } else {
            vocabularyId = this._vocabularyExpressionId;
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
                    for (var iterator = index + 1; iterator < aSplitArray.length - 1; iterator++) {
                        association += "/" + aSplitArray[iterator];
                    }
                }
                if (index === 0) {
                    for (var iterator = 2; iterator < aSplitArray.length - 1; iterator++) {
                        association += "/" + aSplitArray[iterator];
                    }
                }
            }
            return association;
        }
    };
    
    AggregateFunctionDialog.prototype._returnDataObjectBasedOnCardinality = function (vocabId) {
        var vocabularyId = "";
        if (this.jsonDataArray && this.jsonDataArray.length > 0) {
            if (this.jsonDataArray[0] && this.jsonDataArray[0].attributes) {
                for (var key in this.jsonDataArray[0].attributes) {
                    vocabularyId = this.jsonDataArray[0].doVocabId + key.replace(".", "");
                    break;
                }
            }
        } else {
            vocabularyId = this._vocabularyExpressionId;
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
    };
    
    AggregateFunctionDialog.prototype._isDataObjectStructure = function () {
        this.tableId = this._returnDataObjectBasedOnCardinality(this._vocabularyExpressionId);

        if (this.tableId && (this.tableId.match(/\//g) || []).length === 1) {
            var term = this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider.getTermByTermId(this.tableId.replace(/\//, ""));
            if (term && term._dataObjectType === "S") {
                return true;
            }
        }
        return false;
    };
    
    AggregateFunctionDialog.prototype._addAssociationIdToWhere = function (whereExpressionId, associationId) {
        var expressionID = "";
        var aId;
        if (whereExpressionId) {
            aId = whereExpressionId.split(" ");
            for (var iterator = 0; iterator < aId.length; iterator++) {
                if (aId[iterator].indexOf("./") !== -1) {
                    aId[iterator] = "." + aId[iterator].replace(/\./, associationId)
                }
                expressionID += aId[iterator] + " ";
            }
            return expressionID.trim();
        }
        return whereExpressionId;
    };
 
    AggregateFunctionDialog.prototype._addAssociationIdToGroupBy = function (groupByIds, associationId) {
        var groupBy = groupByIds.slice();
        if (groupBy.length > 0) {
            for (var iterator = 0; iterator < groupBy.length; iterator++) {
                if (groupBy[iterator].indexOf("./") !== -1) {
                    groupBy[iterator] = "." + groupBy[iterator].replace(/\./, associationId);
                }
            }
        }
        return groupBy;
    };
 
    AggregateFunctionDialog.prototype._removeAssociationIdToWhere = function (whereExpressionId) {
        var expressionID = "";
        var aId;
        if (whereExpressionId) {
            aId = whereExpressionId.split(" ");
            for (var iterator = 0; iterator < aId.length; iterator++) {
                if (aId[iterator].indexOf("./") !== -1) {
                    var aSplitArray = aId[iterator].split("/");
                    aId[iterator] = "./" + aSplitArray[aSplitArray.length - 1];
                }
                expressionID += aId[iterator] + " ";
            }
            return expressionID.trim();
        }
        return whereExpressionId;
    };
 
    AggregateFunctionDialog.prototype._removeAssociationIdToGroupBySelected = function (groupByIds) {
        var groupBy = groupByIds.slice();
        if (groupBy.length > 0) {
            for (var iterator = 0; iterator < groupBy.length; iterator++) {
                if (groupBy[iterator].indexOf("./") !== -1) {
                    var aSplitArray = groupBy[iterator].split("/");
                    groupBy[iterator] = aSplitArray[aSplitArray.length - 1];
                }
            }
        }
        return groupBy;
    };
    
    AggregateFunctionDialog.prototype._removeAssociationIdToGroupBy = function (groupByIds) {
        var groupBy = groupByIds.slice();
        if (groupBy.length > 0) {
            for (var iterator = 0; iterator < groupBy.length; iterator++) {
                if (groupBy[iterator].indexOf("./") !== -1) {
                    var aSplitArray = groupBy[iterator].split("/");
                    groupBy[iterator] = "./" + aSplitArray[aSplitArray.length - 1];
                }
            }
        }
        return groupBy;
    };
    
    AggregateFunctionDialog.prototype._setModal = function (value) {
        var pop = sap.ui.getCore().byId("popover");
        if (pop) {
            pop.setModal(value);
        }
    };

    AggregateFunctionDialog.prototype._createJson = function (func, vocabulary, whereCondition, groupBy, functionLabel, dataObjectId) {
        return {
            "function": func,
            "vocabulary": vocabulary,
            "filter": whereCondition,
            "groupBy": groupBy,
            "functionLabel": functionLabel,
            "dataObject": dataObjectId,
        }
    };

    AggregateFunctionDialog.prototype._getSuggestionsForTheGivenInput = function (inputText) {
        var tokens = this._oAstExpressionLanguage.getTokensForGivenStringInput(inputText);
        var uiModel = this._oAstExpressionLanguage.convertTokensToUiModelForAutoSuggestion(tokens);
        var suggestions = this._oAstExpressionLanguage.getSuggesstions(uiModel, true);
        return suggestions;
    };

    return {

        getInstance: function () {
            if (!instance) {
                instance = new AggregateFunctionDialog();
                instance.constructor = null;
            }
            return instance;
        }
    };
}, true);