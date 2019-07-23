/* global QUnit, sinon*/

/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/library",
	"sap/ui/mdc/PropertyInfo",
	"sap/ui/mdc/base/filterbar/FilterBar",
	"sap/ui/mdc/base/filterbar/FilterBarDelegate",
	"sap/ui/mdc/base/filterbar/AdaptFiltersDialog",
	"sap/ui/mdc/base/ConditionModel",
	"sap/ui/mdc/base/Condition",
	"sap/ui/mdc/base/FilterField",
	"sap/m/MultiInput",
	'sap/ui/model/json/JSONModel'
], function (
	library,
	PropertyInfo,
	FilterBar,
	FilterBarDelegate,
	AdaptFiltersDialog,
	ConditionModel,
	Condition,
	FilterField,
	MultiInput,
	JSONModel
) {
		"use strict";


		var oFilterBar;

		QUnit.module("FilterBar", {
			beforeEach: function () {
				oFilterBar = new FilterBar();
			},
			afterEach: function () {
				oFilterBar.destroy();
				oFilterBar = undefined;
			}
		});

		QUnit.test("instanciable", function (assert) {
			assert.ok(oFilterBar);
		});

		QUnit.test("get GO button", function (assert) {
			var oButton = oFilterBar._btnSearch;
			assert.ok(oButton);
			assert.ok(oButton.getVisible());

			oFilterBar.setShowGoButton(false);
			assert.ok(!oButton.getVisible());

			oFilterBar.setShowGoButton(true);
			assert.ok(oButton.getVisible());

			oFilterBar.setLiveMode(true);
			assert.ok(!oButton.getVisible());
		});

		QUnit.test("get ADAPT button", function (assert) {
			var oButton = oFilterBar._btnAdapt;
			assert.ok(oButton);
			assert.ok(!oButton.getVisible());

			oFilterBar.setSupportP13N(true);
			assert.ok(oButton.getVisible());

			oFilterBar.setShowAdaptFiltersButton(false);
			assert.ok(!oButton.getVisible());
		});


		QUnit.test("check liveMode property", function (assert) {
			var oButton = oFilterBar._btnSearch;
			assert.ok(oButton);

			assert.ok(!oFilterBar.getLiveMode());
			assert.ok(oButton.getVisible());

			oFilterBar.setLiveMode(true);
			assert.ok(oFilterBar.getLiveMode());
			assert.ok(!oButton.getVisible());
		});

		QUnit.test("check supportP13N property", function (assert) {
			assert.ok(!oFilterBar.getSupportP13N());

			oFilterBar.setSupportP13N(true);
			assert.ok(oFilterBar.getSupportP13N());

			oFilterBar.setSupportP13N(false);
			assert.ok(!oFilterBar.getSupportP13N());
		});

		QUnit.test("add Filter", function (assert) {
			var oFilterField = new FilterField({ conditions: "{cm>/conditions/filter}"});

			assert.equal(oFilterBar.getFilterItems().length, 0);
			assert.equal(oFilterBar._getContent().getContent().length, 0);

			oFilterBar.addFilterItem(oFilterField);
			assert.equal(oFilterBar.getFilterItems().length, 1);
			assert.equal(oFilterBar._getContent().getContent().length, 1);

			oFilterField.destroy();
		});

		QUnit.test("remove Filter", function (assert) {
			var oFilterField = new FilterField();
			oFilterBar.addFilterItem(oFilterField);

			assert.equal(oFilterBar.getFilterItems().length, 1);
			assert.equal(oFilterBar._getContent().getContent().length, 1);

			oFilterBar.removeFilterItem(oFilterField);

			assert.equal(oFilterBar.getFilterItems().length, 0);
			assert.equal(oFilterBar._getContent().getContent().length, 0);

			oFilterField.destroy();

		});


		QUnit.test("check condition model", function (assert) {
			var done = assert.async();

			oFilterBar._oConditionModelPromise.then(function() {
				var oModel = oFilterBar.getModel("$filters");
				assert.ok(oModel);
				assert.ok(oModel.isA("sap.ui.mdc.base.ConditionModel"));
				done();
			});

		});

		QUnit.test("check condition model with prefilled conditions", function (assert) {

			var oFB = new FilterBar({filtersConditions: {"filter": [{operator:"EQ",values:["test"]}]}});
			sinon.stub(oFB, "_applyInitialFiltersConditions");

			var done = assert.async();

			oFB._oConditionModelPromise.then(function () {

				assert.ok(oFB._applyInitialFiltersConditions.called);
				oFB.destroy();
				done();
			});
		});

		QUnit.test("check _handleConditionModelChange with liveMode=false", function (assert) {

			sinon.spy(oFilterBar, "fireSearch");
			sinon.spy(oFilterBar, "_handleConditionModelChange");
			sinon.stub(oFilterBar, "_getAssignedFilterNames").returns([]);
			sinon.stub(oFilterBar, "_handleCalculateDifferences");

			var done = assert.async();

			var fResolve, oPromise = new Promise(function (resolve) {
				fResolve = resolve;
			});

			oFilterBar.attachFiltersChanged(function (oEvent) {
				fResolve();
			});

			assert.ok(!oFilterBar._handleConditionModelChange.called);

			oFilterBar._oConditionModelPromise.then(function () {

				var oCM = oFilterBar.getModel("$filters");
				oCM.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));

				oPromise.then(function() {
					assert.ok(oFilterBar._handleConditionModelChange.called);
					assert.ok(!oFilterBar.fireSearch.called);

					done();
				});
			});
		});

		QUnit.test("check _handleConditionModelChange  with liveMode=true", function (assert) {

			sinon.spy(oFilterBar, "fireSearch");
			sinon.spy(oFilterBar, "_handleConditionModelChange");
			sinon.stub(oFilterBar, "_getAssignedFilterNames").returns([]);
			sinon.stub(oFilterBar, "_handleCalculateDifferences");

			oFilterBar.setLiveMode(true);
			var done = assert.async();

			var fResolve, oPromise = new Promise(function (resolve) {
				fResolve = resolve;
			});

			oFilterBar.attachFiltersChanged(function (oEvent) {
				fResolve();
			});

			assert.ok(!oFilterBar._handleConditionModelChange.called);

			oFilterBar._oConditionModelPromise.then(function () {
				var oCM = oFilterBar.getModel("$filters");
				oCM.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));

				oPromise.then(function() {
					assert.ok(oFilterBar._handleConditionModelChange.called);
					assert.ok(oFilterBar.fireSearch.called);

					done();
				});
			});

		});


		QUnit.test("check _getFilterField", function (assert) {
			var oFilterField = new FilterField({ conditions: "{cm>/conditions/filter}"});

			oFilterBar.addFilterItem(oFilterField);

			assert.deepEqual(oFilterBar._getFilterField("filter"), oFilterField);

			oFilterField.destroy();
		});


		QUnit.test("check getAssignedFiltersText", function (assert) {

			sap.ui.getCore().getConfiguration().setLanguage("EN");

			var sText, fResolve, oPromise = new Promise(function (resolve) {
				fResolve = resolve;
			});
			var done = assert.async();

			oFilterBar.attachFiltersChanged(function (oEvent) {
				fResolve();
			});

			sText = oFilterBar.getAssignedFiltersText();
			assert.equal(sText, "Not Filtered");

			assert.ok(!oFilterBar._handleConditionModelChange.called);

			oFilterBar._oConditionModelPromise.then(function () {

				var oCM = oFilterBar.getModel("$filters");
				oCM.addCondition("fieldPath1", Condition.createCondition("EQ", ["foo"]));

				oPromise.then(function() {

					sText = oFilterBar.getAssignedFiltersText();
					assert.equal(sText, "Filtered By (1): fieldPath1");

					done();
				});
			});
		});

		QUnit.test("check fetchProperties", function (assert) {
			var done = assert.async();

			sinon.stub(FilterBarDelegate, "fetchProperties").returns(Promise.resolve([new PropertyInfo(), new PropertyInfo()]));

			oFilterBar._oMetadataAppliedPromise.then(function () {
				var aProperties = oFilterBar.getPropertyInfoSet();
				assert.ok(aProperties);
				assert.equal(aProperties.length, 2);

				FilterBarDelegate.fetchProperties.restore();
				done();
			});

		});

		QUnit.test("check metadataDelegate", function (assert) {

			var done = assert.async();

			sinon.stub(sap.ui.mdc.base.filterbar.FilterBar.prototype, "_loadProvider").returns(Promise.resolve());
			var oFB = new FilterBar({metadataDelegate: "test"});

			oFB._oMetadataPromise.then(function () {
				assert.equal(oFB.getMetadataDelegate(), "test");

				sap.ui.mdc.base.filterbar.FilterBar.prototype._loadProvider.restore();
				oFB.destroy();
				done();
			});
		});

		QUnit.test("check createFilterField", function (assert) {
			var oProperty1 = new PropertyInfo({
				name: "key1",
				label: "Field1",
				type: "Edm.String",
				path: "prop1",
				//dataTypeConstraints: oProperty.getConstraints(),
				filterConditions: [{ operator: "EQ", values: ["value1"] } ],
				required: true,
				filterExpression: "Single",
				tooltip: "tooltip",
				hasFieldHelp: false
			});

			var oProperty2 = new PropertyInfo({
				name: "key2",
				label: "Field2",
				type: "Edm.Date",
				path: "prop2",
				//dataTypeConstraints: oProperty.getConstraints(),
				required: false,
				filterConditions: [{ operator: "EQ", values: ["value1"] }, { operator: "EQ", values: ["value2"] }],
				filterExpression: "Multi",
				hasFieldHelp: true
			});

			var oProperty3 = new PropertyInfo({
				name: "key3",
				label: "Field3",
				type: "Edm.Date",
				path: "prop3",
				//dataTypeConstraints: oProperty.getConstraints(),
				required: false,
				filterConditions: [{ operator: "EQ", values: ["value1"] }, { operator: "EQ", values: ["value2"] }],
				filterExpression: "Multi",
				hasFieldHelp: true,
				fieldHelpTitle: "Prop3"
			});

			var oFilterField = oFilterBar.createFilterField(oProperty1);
			assert.ok(oFilterField);
			assert.equal(oFilterField.getFieldPath(), oProperty1.getName());
			assert.equal(oFilterField.getLabel(), oProperty1.getLabel());
			assert.equal(oFilterField.getTooltip(), oProperty1.getTooltip());
			assert.equal(oFilterField.getDataType(), oProperty1.getType());
			assert.equal(oFilterField.getRequired(), oProperty1.getRequired());
			assert.equal(oFilterField.getMaxConditions(), 1);
			var aConditions = oFilterField.getConditions();
			assert.ok(aConditions);


			oFilterField = oFilterBar.createFilterField(oProperty2);
			assert.ok(oFilterField);
			assert.equal(oFilterField.getFieldPath(), oProperty2.getName());
			assert.equal(oFilterField.getLabel(), oProperty2.getLabel());
			assert.equal(oFilterField.getTooltip(), null);
			assert.equal(oFilterField.getDataType(), oProperty2.getType());
			assert.equal(oFilterField.getRequired(), oProperty2.getRequired());
			assert.equal(oFilterField.getMaxConditions(), -1);
			aConditions = oFilterField.getConditions();
			assert.ok(aConditions);

			oFilterField = oFilterBar.createFilterField(oProperty3);
			assert.ok(oFilterField);
			assert.equal(oFilterField.getFieldPath(), oProperty3.getName());
			assert.equal(oFilterField.getLabel(), oProperty3.getLabel());
			assert.equal(oFilterField.getTooltip(), null);
			assert.equal(oFilterField.getDataType(), oProperty3.getType());
			assert.equal(oFilterField.getRequired(), oProperty3.getRequired());
			assert.equal(oFilterField.getMaxConditions(), -1);
			aConditions = oFilterField.getConditions();
			assert.ok(aConditions);

		});

		QUnit.test("check _getNonHiddenPropertyByName ", function (assert) {
			var oProperty1 = new PropertyInfo({
				name: "key1",
				type: "Edm.String",
				visible: true
			});

			var oProperty2 = new PropertyInfo({
				name: "key2",
				hiddenFilter: true,
				visible: true
			});

			sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2]);

			assert.ok(oFilterBar._getNonHiddenPropertyByName("key1"));
			assert.ok(!oFilterBar._getNonHiddenPropertyByName("key2"));

		});

		QUnit.test("check _setItemsForAdaptFiltersDialog", function (assert) {
			var oProperty1 = new PropertyInfo({
				name: "key1",
				type: "Edm.String",
				visible: true
			});

			var oProperty2 = new PropertyInfo({
				name: "key2",
				hiddenFilter: true,
				visible: true
			});

			var oProperty3 = new PropertyInfo({
				name: "key3",
				type: "Edm.String",
				visible: true
			});

			var oFilterFieldStub = oFilterBar.createFilterField(oProperty3);

			sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty1, oProperty2, oProperty3]);
			sinon.stub(oFilterBar, "_getFilterField").returns(oFilterFieldStub);
			sinon.stub(oFilterBar, "getFilterItems").returns([oFilterFieldStub]);

			var aItems = oFilterBar._setItemsForAdaptFiltersDialog();
			assert.ok(aItems);
			assert.equal(aItems.length, 2);
			assert.equal(aItems[0].key, "key1");
			assert.equal(aItems[1].key, "key3");

		});


		QUnit.test("check showFiltersDialog", function (assert) {

			sinon.stub(sap.ui.mdc.base.filterbar.AdaptFiltersDialog.prototype, "open");

			sinon.stub(oFilterBar, "_setItemsForAdaptFiltersDialog");
			sinon.spy(oFilterBar, "_showFiltersDialog");

			var done = assert.async();

			oFilterBar.showFiltersDialog();

			sap.ui.require([
				"sap/ui/mdc/base/filterbar/AdaptFiltersDialog", "sap/ui/mdc/base/filterbar/AdaptFiltersDialogItem"
			], function (fnAdaptFiltersDialog, fnAdaptFiltersDialogItem) {

				oFilterBar._retrieveMetadata();
				oFilterBar._oMetadataPromise.then(function() {
					assert.ok(oFilterBar._showFiltersDialog.called);

					AdaptFiltersDialog.prototype.open.restore();
					done();
				});

			});

		});


		QUnit.test("check setBasicSearchField", function (assert) {

			var oBasicSearchField = new FilterField({ conditions: "{cm>/conditions/$search}"});
			oFilterBar.setBasicSearchField(oBasicSearchField);
			assert.equal(oFilterBar.getFilterItems().length, 0);
			assert.equal(oFilterBar._getContent().getContent().length, 1);

			oFilterBar.setBasicSearchField(null);
			assert.equal(oFilterBar.getFilterItems().length, 0);
			assert.equal(oFilterBar._getContent().getContent().length, 0);

			oBasicSearchField.destroy();
		});

		QUnit.test("check _addFilterVisibilityChange - add and condense", function (assert) {

			var oProperty = new PropertyInfo({
				name: "test"
			});

			sinon.stub(oFilterBar, "_getFilterField").returns(null);
			sinon.stub(oFilterBar, "_getNonHiddenPropertyByName").returns(oProperty);

			oFilterBar._clearChanges();
			oFilterBar._addFilterVisibilityChange("test", true);

			assert.ok(oFilterBar._aChanges);
			assert.equal(oFilterBar._aChanges.length, 1);
			assert.equal(oFilterBar._aChanges[0].selectorControl, oFilterBar);
			assert.equal(oFilterBar._aChanges[0].changeSpecificData.changeType, "addFilter");
			assert.deepEqual(oFilterBar._aChanges[0].changeSpecificData.content.name, oProperty.getName());


			oFilterBar._addFilterVisibilityChange("test", false);
			assert.ok(oFilterBar._aChanges);
			assert.equal(oFilterBar._aChanges.length, 0);

			oFilterBar._getFilterField.restore();
		});

		QUnit.test("check _addFilterVisibilityChange - remove and condense", function (assert) {

			var oProperty = new PropertyInfo({
				name: "test"
			});

			var oFilterField = new FilterField("id");

			sinon.stub(oFilterBar, "_getFilterField").returns(oFilterField);
			sinon.stub(oFilterBar, "_getNonHiddenPropertyByName").returns(oProperty);
			oFilterBar._clearChanges();
			oFilterBar._addFilterVisibilityChange("test", false);

			assert.ok(oFilterBar._aChanges);
			assert.equal(oFilterBar._aChanges.length, 1);
			assert.equal(oFilterBar._aChanges[0].selectorControl, oFilterBar);
			assert.equal(oFilterBar._aChanges[0].changeSpecificData.changeType, "removeFilter");
			assert.deepEqual(oFilterBar._aChanges[0].changeSpecificData.content.id, oFilterField.getId());


			oFilterBar._addFilterVisibilityChange("test", true);
			assert.ok(oFilterBar._aChanges);
			assert.equal(oFilterBar._aChanges.length, 0);

			oFilterBar._getFilterField.restore();
		});

		QUnit.test("check _getFilterItemLayout", function (assert) {
			var oProperty1 = new PropertyInfo({
				name: "key1",
				label: "label 1",
				type: "Edm.String",
				path: "prop1",
				required: true,
				filterExpression: "Single",
				tooltip: "tooltip",
				visible: true,
				hasFieldHelp: true
			});

			var oFilterField = oFilterBar.createFilterField(oProperty1);
			oFilterBar.addFilterItem(oFilterField);

			var oFilterItemLayout = oFilterBar._getFilterItemLayout(oFilterField);
			assert.ok(oFilterItemLayout);

			oFilterField.destroy();
		});

		QUnit.test("check _observeChanges", function (assert) {
			var oProperty1 = new PropertyInfo({
				name: "key1",
				label: "label 1",
				type: "Edm.String",
				path: "prop1",
				constraints: { maxLength: 40 },
				required: true,
				filterExpression: "Single",
				tooltip: "tooltip",
				visible: true,
				hasFieldHelp: true
			});

			sinon.spy(oFilterBar, "_filterItemInserted");
			sinon.spy(oFilterBar, "_filterItemRemoved");

			sinon.stub(oFilterBar, "_getNonHiddenPropertyInfoSet").returns([oProperty1]);

			var oFilterField = oFilterBar.createFilterField(oProperty1);
			sinon.spy(oFilterField, "setTooltip");

			oFilterBar.addFilterItem(oFilterField);
			assert.ok(oFilterBar._filterItemInserted.calledOnce);

			oFilterBar.enrichFiltersWithMetadata();

			var oFilterItemLayout = oFilterBar._getFilterItemLayout(oFilterField);
			assert.ok(oFilterItemLayout);
			sinon.spy(oFilterItemLayout, "rerender");

			oProperty1.setRequired(false);
			assert.ok(oFilterItemLayout.rerender.calledOnce);

			oProperty1.setTooltip("change tooltip");
			assert.ok(oFilterField.setTooltip.calledOnce);

			oFilterField.setVisible(false);
			assert.ok(oFilterBar._filterItemRemoved.calledOnce);
		});

		QUnit.test("check _storeChanges", function (assert) {

			sinon.stub(sap.ui.fl.ControlPersonalizationAPI, "addPersonalizationChanges");
			sinon.stub(sap.ui.fl.ControlPersonalizationAPI, "hasVariantManagement").returns(true);
			sinon.stub(oFilterBar, "_condenseChange");
			sinon.spy(oFilterBar, "_clearChanges");

			oFilterBar._storeChanges();
			assert.ok(!sap.ui.fl.ControlPersonalizationAPI.addPersonalizationChanges.called);
			assert.ok(oFilterBar._clearChanges.calledOnce);

			oFilterBar.setSupportP13N(true);
			oFilterBar._storeChanges();
			assert.ok(!sap.ui.fl.ControlPersonalizationAPI.addPersonalizationChanges.called);
			assert.ok(oFilterBar._clearChanges.calledOnce);

			oFilterBar._aChanges.push({changeType:"foo"});
			oFilterBar._storeChanges();
			assert.ok(sap.ui.fl.ControlPersonalizationAPI.addPersonalizationChanges.called);
			assert.ok(oFilterBar._clearChanges.calledTwice);

			sap.ui.fl.ControlPersonalizationAPI.addPersonalizationChanges.restore();
			sap.ui.fl.ControlPersonalizationAPI.hasVariantManagement.restore();
		});

		QUnit.test("create single valued change", function (assert) {

			var oProperty = new PropertyInfo({
				name: "key",
				type: "Edm.String",
				visible: true
			});

			var done = assert.async();

			sinon.stub(oFilterBar, "_storeChanges");
			sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty]);

			oFilterBar.setSupportP13N(true);


			oFilterBar.createFilterField(oProperty);

			oFilterBar._oInitialFiltersAppliedPromise.then(function () {

				oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["a"]));
				oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["foo"]));

				setTimeout(function() { // required for condition model....
					assert.ok(oFilterBar._storeChanges.called);

					assert.ok(oFilterBar._aChanges);
					assert.equal(oFilterBar._aChanges.length, 2); // condition model does not know about filterExpression="Single"...

					done();
				}, 0);

			});
		});

		QUnit.test("create multi valued change", function (assert) {

			var oProperty = new PropertyInfo({
				name: "key",
				type: "Edm.String",
				filterExpression: "Multi",
				visible: true
			});

			var done = assert.async();

			sinon.stub(oFilterBar, "_storeChanges");
			sinon.stub(oFilterBar, "getPropertyInfoSet").returns([oProperty]);

			oFilterBar.setSupportP13N(true);


			var oFilterField = oFilterBar.createFilterField(oProperty);
			oFilterField.setModel(oFilterBar._getConditionModel(), "$filters");

			oFilterBar._oInitialFiltersAppliedPromise.then(function () {

				oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["a"]));
				oFilterBar._getConditionModel().addCondition("key", Condition.createCondition("EQ", ["foo"]));

				setTimeout(function() { // required for condition model....
					assert.ok(oFilterBar._storeChanges.called);

					assert.ok(oFilterBar._aChanges);
					assert.equal(oFilterBar._aChanges.length, 2);

					done();
				}, 0);
			});
		});

		QUnit.test("create multi valued change with 'filtersConditions'", function (assert) {
			var oProperty = new PropertyInfo({
				name: "key",
				type: "Edm.String",
				filterExpression: "Multi",
				visible: true
			});

			var done = assert.async();

			var oCondition1 = Condition.createCondition("EQ", ["a"]);
			var oCondition2 = Condition.createCondition("EQ", ["foo"]);

			var oFB = new FilterBar({filtersConditions: {key: [ oCondition1 ]}, supportP13N: true});

			sinon.stub(oFB, "_storeChanges");
			sinon.stub(oFB, "getPropertyInfoSet").returns([oProperty]);

			oFB._oInitialFiltersAppliedPromise.then(function () {

				oFB._getConditionModel().addCondition("key", oCondition1);
				oFB._getConditionModel().addCondition("key", oCondition2);

				setTimeout(function() { // required for condition model....
					assert.ok(oFB._storeChanges.called);

					assert.ok(oFB._aChanges);
					assert.equal(oFB._aChanges.length, 1);
					assert.equal(oFB._aChanges[0].selectorControl, oFB);
					assert.equal(oFB._aChanges[0].changeSpecificData.changeType, "addCondition");
					assert.equal(oFB._aChanges[0].changeSpecificData.content.name, "key");
					assert.deepEqual(oFB._aChanges[0].changeSpecificData.content.condition, {operator: "EQ", values: ["foo"]});

					oFB.destroy();

					done();
				}, 0);
			});
		});


		QUnit.test("check filterItems observer", function (assert) {

			var oProperty1 = new PropertyInfo({
				name: "key1",
				label: "label 1",
				type: "Edm.String",
				constraints: { maxLength: 40 },
				visible: true,
				filterExpression: "Single"
			});
			var oProperty2 = new PropertyInfo({
				name: "key2",
				label: "label 2",
				type: "Edm.String",
				constraints: { maxLength: 40 },
				visible: true,
				filterExpression: "Single"
			});

			sinon.spy(oFilterBar, "_applyFilterItemInserted");
			sinon.spy(oFilterBar, "_applyFilterItemRemoved");

			var oFilterField1 = oFilterBar.createFilterField(oProperty1);
			oFilterBar.addFilterItem(oFilterField1);

			var oFilterField2 = oFilterBar.createFilterField(oProperty2);
			oFilterBar.addFilterItem(oFilterField2);

			oFilterBar.removeAggregation("filterItems", oFilterField1);

			assert.ok(oFilterBar._applyFilterItemInserted.calledTwice);
			assert.ok(oFilterBar._applyFilterItemRemoved.calledOnce);
		});


		QUnit.test("check _determineType", function (assert) {
			var oProperty1 = new PropertyInfo({
				name: "key1",
				type: "Edm.String",
				constraints: { maxLength: 40 },
				filterExpression: "Single"
			});
			var oProperty2 = new PropertyInfo({
				name: "key2",
				type: "Edm.String",
				filterExpression: "Single"
			});
			var oProperty3 = new PropertyInfo({
				name: "key3",
				label: "label",
				type: "Edm.String",
				filterExpression: "Multi"
			});

			sinon.stub(oFilterBar, "getPropertyInfoSet").returns([ oProperty1, oProperty2, oProperty3 ]);

			var oFilterField = oFilterBar.createFilterField(oProperty3);
			oFilterBar.addFilterItem(oFilterField);

			var oObj = oFilterBar._determineType("key3");
			assert.ok(oObj);
			assert.ok(oObj.isA("sap.ui.mdc.base.FilterField"));

			oObj = oFilterBar._determineType("key1");
			assert.ok(oObj);
			assert.ok(oObj.isA("sap.ui.mdc.PropertyInfo"));
		});

		QUnit.test("check _applyConditionsAfterChangesApplied", function (assert) {

			var fResolve;
			var oPromise = new Promise(function(resolve) {
				fResolve = resolve;
			});
			var oControl = {
			    waitForChangesToBeApplied: function(o) { return oPromise;}
			};
			var oFlexController = {
			    createForControl: function(o) { return oControl;}
			};

			assert.ok(!oFilterBar._isChangeApplying());
			oFilterBar._applyConditionsAfterChangesApplied(oFlexController);
			assert.ok(oFilterBar._isChangeApplying());

			oFilterBar._applyConditionsAfterChangesApplied(oFlexController);


			var done = assert.async();

			oFilterBar.waitForInitialFiltersApplied().then(function() {
				fResolve();
				oPromise.then(function() {
					sinon.spy(oFilterBar, "_createShadowModel");

					setTimeout(function() { // required for condition model....
						assert.ok(oFilterBar._createShadowModel.calledOnce);
						done();
					}, 20);
				});
			});
		});

		QUnit.test("check metadata model", function (assert) {
			var oMyModel = new JSONModel();

			sinon.stub(sap.ui.mdc.base.filterbar.FilterBar.prototype, "_loadProvider").returns(Promise.resolve());
			var oFB = new FilterBar({metadataInfo: { modelName: "Model", collectionname: "Collection"}, metadataDelegate: "test"});

			var done = assert.async();

			oFB.setModel(oMyModel, "Model");

			oFB._oMetaModelSetPromise.then(function(oMetadataModel) {
				assert.ok(oMetadataModel === oMyModel);

				sap.ui.mdc.base.filterbar.FilterBar.prototype._loadProvider.restore();
				oFB.destroy();
				done();
			});
		});

		QUnit.test("check properties based on filterItems", function (assert) {
			var oProperty1 = new PropertyInfo({
				name: "key1",
				type: "Edm.String",
				constraints: { maxLength: 40 },
				filterExpression: "Single"
			});
			var oProperty2 = new PropertyInfo({
				name: "key3",
				label: "label",
				type: "Edm.String",
				filterExpression: "Multi"
			});

			var oMyModel = new JSONModel();

			sinon.stub(sap.ui.mdc.base.filterbar.FilterBar.prototype, "_loadProvider").returns(Promise.resolve());
			var oFB = new FilterBar({metadataInfo: { modelName: "Model", collectionname: "Collection"}, metadataDelegate: "test"});

			var oFilterField = oFB.createFilterField(oProperty1);
			oFB.addFilterItem(oFilterField);

			oFilterField = oFB.createFilterField(oProperty2);
			oFB.addFilterItem(oFilterField);

			var done = assert.async();

			oFB.setModel(oMyModel, "Model");

			oFB._oMetadataAppliedPromise.then(function(oMetadataModel) {
				var aPropeties = oFB.getPropertyInfoSet();
				assert.ok(aPropeties);
				assert.equal(aPropeties.length, 2);

				sap.ui.mdc.base.filterbar.FilterBar.prototype._loadProvider.restore();
				oFB.destroy();
				done();
			});
		});
	});