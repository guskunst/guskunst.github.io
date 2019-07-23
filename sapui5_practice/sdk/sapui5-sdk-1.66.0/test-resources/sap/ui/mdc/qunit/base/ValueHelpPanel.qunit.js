/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/base/ConditionModel",
	"sap/ui/mdc/base/Condition",
	"sap/ui/mdc/base/ValueHelpPanel",
	"sap/ui/mdc/base/DefineConditionPanel",
	"sap/ui/mdc/base/FilterOperatorConfig",
	"sap/ui/model/type/Integer",
	"sap/m/Button"
], function(
		ConditionModel,
		Condition,
		ValueHelpPanel,
		DefineConditionPanel,
		FilterOperatorConfig,
		IntegerType,
		Button
		) {
	"use strict";

	var oValueHelpPanel;

	QUnit.module("ValueHelpPanel", {
		beforeEach: function() {
			oValueHelpPanel = new ValueHelpPanel();
		},
		afterEach: function() {
			oValueHelpPanel.destroy();
		}
	});

	QUnit.test("Basic tests", function(assert) {
		assert.equal(oValueHelpPanel != null, true, "instance can be created");
	});

	QUnit.test("showTokenizer", function(assert) {
		oValueHelpPanel.placeAt("content");
		assert.equal(oValueHelpPanel.getShowTokenizer(), true, "showTokenizer default is true");
		oValueHelpPanel.setShowTokenizer(true);
		assert.equal(oValueHelpPanel.getShowTokenizer(), true, "showTokenizer should be still true");
		oValueHelpPanel.setShowTokenizer(false);
		assert.equal(oValueHelpPanel.getShowTokenizer(), false, "showTokenizer changed");
		oValueHelpPanel.setShowTokenizer(true);
		assert.equal(oValueHelpPanel.getShowTokenizer(), true, "showTokenizer changed back to true");
	});

	QUnit.test("setFilterbar", function(assert) {
		oValueHelpPanel.placeAt("content");
		var oFilterBar = new Button("B1");
		oValueHelpPanel.setFilterbar(oFilterBar);

		sap.ui.getCore().applyChanges();

		assert.equal(oValueHelpPanel._oFilterbar != null, true, "filterbar added");

		assert.equal(oValueHelpPanel.getShowFilterbar(), true, "showFilterbar default is true");
		oValueHelpPanel.setShowFilterbar(false);
		assert.equal(oValueHelpPanel.getShowFilterbar(), false, "showFilterbar change to false");
		oValueHelpPanel.setShowFilterbar(true);
		assert.equal(oValueHelpPanel.getShowFilterbar(), true, "showFilterbar change to true");

		var spy = sinon.spy(oValueHelpPanel, "_updateFilterbarVisibility");
		oValueHelpPanel._oAdvButton.firePress({ pressed: true });
		assert.equal(spy.callCount, 1, "_updateFilterbarVisibility should be called");
		spy.restore();

		oValueHelpPanel.setFilterbar(null);
		assert.equal(oValueHelpPanel._oFilterbar == null, true, "filterbar should be removed");

		oFilterBar.destroy();
	});

	QUnit.test("setTable", function(assert) {
		oValueHelpPanel.placeAt("content");
		var oTable = new Button("B1");
		oValueHelpPanel.setTable(oTable);

		sap.ui.getCore().applyChanges();

		assert.equal(oValueHelpPanel._oTable != null, true, "table added");
		var oIconTabBar = oValueHelpPanel.byId("iconTabBar");
		assert.ok(oIconTabBar.hasStyleClass("sapMdcNoHeader"), "Header of IconTabBar invisible");

		oValueHelpPanel.setTable(null);
		assert.equal(oValueHelpPanel._oTable == null, true, "table should be removed");

		oTable.destroy();
	});

	QUnit.test("getTable", function(assert) {
		assert.notOk(oValueHelpPanel.getTable(), "No table returned");

		var oTable = new Button("B1");
		oValueHelpPanel.setTable(oTable);
		assert.equal(oValueHelpPanel.getTable(), oTable, "No table returned");

		oTable.destroy();
	});

	QUnit.test("setDefineConditions", function(assert) {
		oValueHelpPanel.placeAt("content");
		var oDefineConditions = new DefineConditionPanel("DCP");
		oValueHelpPanel.setDefineConditions(oDefineConditions);
		sap.ui.getCore().applyChanges();

		assert.equal(oValueHelpPanel._oDefineConditionPanel != null, true, "defineCondition added");
		var oIconTabBar = oValueHelpPanel.byId("iconTabBar");
		assert.ok(oIconTabBar.hasStyleClass("sapMdcNoHeader"), "Header of IconTabBar invisible");
		assert.ok(oDefineConditions.getBinding("formatOptions"), "DefineConditions formatOptions Bound");
		assert.ok(oDefineConditions.getBinding("conditions"), "DefineConditions conditions Bound");

		oValueHelpPanel.setDefineConditions(null);
		assert.equal(oValueHelpPanel._oDefineConditionPanel == null, true, "defineCondition should be removed");
	});

	QUnit.test("Table and DefineConditions", function(assert) {
		oValueHelpPanel.placeAt("content");
		var oTable = new Button("B1");
		oValueHelpPanel.setTable(oTable);
		var oDefineConditions = new DefineConditionPanel("DCP");
		oValueHelpPanel.setDefineConditions(oDefineConditions);
		sap.ui.getCore().applyChanges();

		var oIconTabBar = oValueHelpPanel.byId("iconTabBar");
		assert.notOk(oIconTabBar.hasStyleClass("sapMdcNoHeader"), "Header of IconTabBar visible");
		assert.ok(!!oTable.getDomRef(), "Table rendered");
		assert.notOk(!!oDefineConditions.getDomRef(), "DefineConditions not rendered");
		assert.notOk(oDefineConditions.getBinding("formatOptions"), "DefineConditions formatOptions not Bound");
		assert.notOk(oDefineConditions.getBinding("conditions"), "DefineConditions conditions not Bound");

		var oHeader = oIconTabBar._getIconTabHeader();
		var aItems = oHeader.getItems();
		oHeader.setSelectedItem(aItems[1]);
		sap.ui.getCore().applyChanges();

		assert.notOk(!!oTable.getDomRef(), "Table not rendered");
		assert.ok(!!oDefineConditions.getDomRef(), "DefineConditions rendered");
		assert.ok(oDefineConditions.getBinding("formatOptions"), "DefineConditions formatOptions Bound");
		assert.ok(oDefineConditions.getBinding("conditions"), "DefineConditions conditions Bound");

		oTable.destroy();
	});

	QUnit.test("with ConditionModel", function(assert) {
		oValueHelpPanel.placeAt("content");

		var oConditionModel = new ConditionModel();
		oConditionModel.addCondition("Quantity", Condition.createCondition("GT", [1]));

		var oDataType = new IntegerType();
		var oFilterOperatorConfig = new FilterOperatorConfig();
		var oFormatOptions = {
				valueType: oDataType,
				filterOperatorConfig: oFilterOperatorConfig,
				maxConditions: -1
		};

		oValueHelpPanel.bindProperty("conditions", {path: 'cm>/conditions/Quantity'});
		oValueHelpPanel.setModel(oConditionModel, "cm");
		oValueHelpPanel.setFormatOptions(oFormatOptions);

		sap.ui.getCore().applyChanges();

		oValueHelpPanel.setShowTokenizer(false);
		oValueHelpPanel.setShowTokenizer(true);
		var aTokens = oValueHelpPanel._oTokenizer.getTokens();
		assert.equal(aTokens.length, 1, "one Token should exist inside Tokenizer");
		assert.equal(aTokens[0].getText(), ">1", "Token text");

		// remove the token from the Tokenizer
		var oToken = oValueHelpPanel._oTokenizer.getTokens()[0];
		oValueHelpPanel._oTokenizer.fireTokenUpdate({ type: "removed", removedTokens: [oToken] });
		assert.equal(oConditionModel.getConditions("Quantity").length, 0, "ConditionModel should be empty");

		oDataType.destroy();
		oFilterOperatorConfig.destroy();
	});

});