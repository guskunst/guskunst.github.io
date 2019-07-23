sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/util/MockServer',
		'sap/rules/ui/services/ExpressionLanguage',
		'sap/rules/ui/DecisionTable',
		'test/sap/rules/ui/TestUtils',
		'jquery.sap.global'
	],
	function(Controller, MockServer, ExpressionLanguage, DecisionTable, Utils, jQuery) {
		"use strict";

		return Controller.extend("DecisionTableRows.view.DecisionTableRows", {

			onInit: function() {

				Utils.startRequestRecorder({
					mode: "play", //"record", play
					filePath: "data/",
					fileName: "decisionTableRule"
				});

				this.loadDT();
			},

			openRuleForEdit: function() {
				Utils.openRuleForEdit({
					ruleId: this.ruleId,
					model: this.oDataModel
				});
			},
			loadDT: function() {
				var sRuleId = "ebeadcdc53b845a7b843d55ab1d69536",
					version = "000001",
					sRulePath = "/Rules(Id='" + sRuleId + "',Version='" + version + "')";

				this.ruleId = "ebeadcdc53b845a7b843d55ab1d69536";
				this.oDataModel = Utils.createRuleOdataModel();

				this.openRuleForEdit();
				var dt = this.byId("myDecisionTable");
				dt.setVisible(true);
				dt.setModel(this.oDataModel);
				
				var oExprLangPack = Utils.createExpressionLanguageWithData({
					vocaId: sRuleId
				});

				var afterReadActions = function() {
					dt.setExpressionLanguage(oExprLangPack.expressionLanguage);
					dt.setBindingContextPath(sRulePath);
				};
				
				oExprLangPack.deferredVocaData.done(afterReadActions);
				//dt.setExpressionLanguage(oExprLangPack.expressionLanguage);
				//dt.setBindingContextPath(sRulePath);
			}
		});
	});