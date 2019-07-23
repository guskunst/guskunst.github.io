/* global QUnit, sinon */
QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/comp/providers/ValueListProvider",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/MultiInput",
	"sap/m/MultiComboBox",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/comp/smartfield/SmartField",
	"sap/ui/comp/library"
], function(ValueListProvider, Text, Input, MultiInput, MultiComboBox, ODataModel, SmartField, library) {
	"use strict";

	var DisplayBehaviour = library.smartfilterbar.DisplayBehaviour;

	QUnit.module("sap.ui.comp.providers.ValueListProvider", {
		beforeEach: function() {
			this.oAnnotation = {valueListEntitySetName:"Chuck",keyField:"TheKey",descriptionField:"Desc",keys:["TheKey"],valueListFields:[{name:"TheKey"},{name:"Desc"}]};
			this.oModel = sinon.createStubInstance(ODataModel);
			this.oValueListProvider = new ValueListProvider({control: sinon.createStubInstance(MultiComboBox), aggregation:"items",annotation:this.oAnnotation,model:this.oModel,typeAheadEnabled:false});
		},
		afterEach: function() {
			this.oValueListProvider.destroy();
			this.oValueListProvider = null;
		}
	});

	QUnit.test("Shall be instantiable", function(assert) {
		assert.ok(this.oValueListProvider);
	});

	QUnit.test("Shall have an instance of oDataModel", function(assert) {
		assert.ok(this.oValueListProvider.oODataModel);
	});

	QUnit.test("Shall call addEventDelegate onInitialise of drop downs", function(assert) {
		assert.strictEqual(this.oValueListProvider.oControl.addEventDelegate.calledOnce,true);
	});

	QUnit.test("Shall call bindAggrgation/_fetchData once control is rendered", function(assert) {
		var oDelegate;
		sinon.spy(this.oValueListProvider,"_fetchData");
		oDelegate = this.oValueListProvider.oControl.addEventDelegate.args[0][0];
		oDelegate.onAfterRendering.call(this.oValueListProvider);
		assert.strictEqual(this.oValueListProvider.oControl.bindAggregation.calledOnce,true);
		assert.strictEqual(this.oValueListProvider._fetchData.calledOnce,true);
		assert.strictEqual(this.oValueListProvider.oControl.removeEventDelegate.calledOnce,true);
	});

	QUnit.test("Shall create sorter for id based DDLBs", function(assert) {
		assert.ok(!this.oValueListProvider._oSorter);

		this.oValueListProvider.sDDLBDisplayBehaviour = DisplayBehaviour.idOnly;
		this.oValueListProvider._createDropDownTemplate();
		assert.ok(this.oValueListProvider._oSorter);
		assert.strictEqual(this.oValueListProvider._oSorter.sPath,this.oValueListProvider.sKey);

		this.oValueListProvider.sDDLBDisplayBehaviour = DisplayBehaviour.descriptionOnly;
		this.oValueListProvider._createDropDownTemplate();
		assert.ok(this.oValueListProvider._oSorter);
		assert.strictEqual(this.oValueListProvider._oSorter.sPath,this.oValueListProvider.sDescription);
	});

	QUnit.test("Shall not create sorter for id based DDLBs but one for Description", function(assert) {
		this.oValueListProvider.oPrimaryValueListAnnotation.valueListFields[0].sortable = false;
		this.oValueListProvider.oPrimaryValueListAnnotation.valueListFields[1].sortable = true;

		assert.ok(!this.oValueListProvider._oSorter);

		this.oValueListProvider.sDDLBDisplayBehaviour = DisplayBehaviour.idOnly;
		this.oValueListProvider._createDropDownTemplate();
		assert.ok(!this.oValueListProvider._oSorter);

		this.oValueListProvider.sDDLBDisplayBehaviour = DisplayBehaviour.descriptionOnly;
		this.oValueListProvider._createDropDownTemplate();
		assert.ok(this.oValueListProvider._oSorter);
		assert.strictEqual(this.oValueListProvider._oSorter.sPath,this.oValueListProvider.sDescription);
	});

	QUnit.test("Shall not create sorter for id nor description based DDLBs", function(assert) {
		this.oValueListProvider.oPrimaryValueListAnnotation.valueListFields[0].sortable = false;
		this.oValueListProvider.oPrimaryValueListAnnotation.valueListFields[1].sortable = false;

		assert.ok(!this.oValueListProvider._oSorter);

		this.oValueListProvider.sDDLBDisplayBehaviour = DisplayBehaviour.idOnly;
		this.oValueListProvider._createDropDownTemplate();
		assert.ok(!this.oValueListProvider._oSorter);

		this.oValueListProvider.sDDLBDisplayBehaviour = DisplayBehaviour.descriptionOnly;
		this.oValueListProvider._createDropDownTemplate();
		assert.ok(!this.oValueListProvider._oSorter);
	});

	QUnit.test("it should destroy the item template", function(assert) {

		// arrange
		this.oValueListProvider._createDropDownTemplate();
		var oTemplateDestroySpy = sinon.spy(this.oValueListProvider._oTemplate, "destroy");

		// act
		this.oValueListProvider.destroy();

		// assert
		assert.strictEqual(oTemplateDestroySpy.callCount, 1);
		assert.strictEqual(this.oValueListProvider._oTemplate, null);
	});

	QUnit.module("sap.ui.comp.providers.ValueListProvider (typeAhead)", {
		beforeEach: function() {
			this.oAnnotation = {valueListEntitySetName:"Chuck",keyField:"TheKey",descriptionField:"Desc",keys:["TheKey"],valueListFields:[{name:"TheKey"},{name:"Desc"}]};
			this.oModel = sinon.createStubInstance(ODataModel);
			this.oValueListProvider = new ValueListProvider({control: sinon.createStubInstance(MultiInput), aggregation:"suggestionItems", annotation:this.oAnnotation, model:this.oModel, typeAheadEnabled:true});
		},
		afterEach: function() {
			this.oValueListProvider.destroy();
			this.oValueListProvider = null;
		}
	});

	QUnit.test("Shall call attachSuggest once on initialise if type Ahead is enabled", function(assert) {
		assert.strictEqual(this.oValueListProvider.oControl.attachSuggest.calledOnce,true);
	});

	QUnit.test("suggest shall trigger _fetchData", function(assert) {
		var fSuggest = null,oEvent = {getParameter:sinon.stub(), getSource: sinon.stub()}, sInput = "test";
		oEvent.getParameter.returns(sInput);
		oEvent.getSource.returns(this.oValueListProvider.oControl);
		assert.strictEqual(this.oValueListProvider.oControl.attachSuggest.calledOnce,true);
		sinon.spy(this.oValueListProvider,"_fetchData");
		fSuggest = this.oValueListProvider.oControl.attachSuggest.args[0][0];
		//Trigger Suggest
		fSuggest(oEvent);

		assert.strictEqual(this.oValueListProvider._fetchData.calledOnce,true);
		assert.strictEqual(this.oValueListProvider._fetchData.calledWith(sInput),true);
	});

	QUnit.test("_fetchData shall use the Search Text and Search-focus if basic search and type ahead is enabled", function(assert) {
		this.oValueListProvider.bSupportBasicSearch = true;
		this.oValueListProvider._fetchData("SomeSearchText");
		var args = this.oValueListProvider.oControl.bindAggregation.args[0];
		var custom = args[1].parameters["custom"];
		assert.strictEqual(custom["search"],"SomeSearchText");
		assert.strictEqual(custom["search-focus"],"TheKey");
	});

	QUnit.test("Search Text shall be converted to UpperCase according to displayFormat", function(assert) {
		this.oValueListProvider.bSupportBasicSearch = true;
		this.oValueListProvider.sDisplayFormat = "UpperCase";
		this.oValueListProvider._fetchData("UpperCase");
		var args = this.oValueListProvider.oControl.bindAggregation.args[0];
		var custom = args[1].parameters["custom"];
		assert.strictEqual(custom["search"],"UPPERCASE");
		assert.strictEqual(custom["search-focus"],"TheKey");
	});

	QUnit.test("Search Text with maxLength", function(assert) {
		sinon.spy(this.oValueListProvider,"_truncateSearchText");

		this.oValueListProvider.bSupportBasicSearch = false;
		this.oValueListProvider._fieldViewMetadata = {};
		this.oValueListProvider._fieldViewMetadata.maxLength = "1";
		this.oValueListProvider._fetchData("123");

		assert.strictEqual(this.oValueListProvider._truncateSearchText.calledOnce,true, "_truncateSearchText called once");
		assert.strictEqual(this.oValueListProvider._truncateSearchText.returned("1"),true, "_truncateSearchText returned truncated value '1'");
	});

	QUnit.test("MultiInput - addValidator shall trigger select and create token via asyncCallback with the suggestionRow", function(assert) {
		var fValidate = null, fAsyncCallback = sinon.stub(), oSuggestionRow = {getBindingContextPath:sinon.stub()}, sInput = "foo";
		var oMockRow = {TheKey:"key",Desc:"description"};
		assert.strictEqual(this.oValueListProvider.oControl.addValidator.calledOnce,true);
		fValidate  = this.oValueListProvider.oControl.addValidator.args[0][0];
		this.oValueListProvider.oODataModel.getData.returns(oMockRow);
		sinon.stub(this.oValueListProvider,"_calculateAndSetFilterOutputData");
		assert.strictEqual(this.oValueListProvider.oODataModel.getData.calledOnce,false);

		//Trigger the validation
		fValidate({suggestionObject: oSuggestionRow, text: sInput, asyncCallback: fAsyncCallback});

		assert.strictEqual(this.oValueListProvider.oODataModel.getData.calledOnce,true);
		assert.strictEqual(this.oValueListProvider.oODataModel.read.calledOnce,false);
		assert.strictEqual(this.oValueListProvider._calculateAndSetFilterOutputData.calledOnce,true);
		assert.strictEqual(this.oValueListProvider._calculateAndSetFilterOutputData.calledWith([oMockRow]),true);
		assert.strictEqual(fAsyncCallback.calledOnce,true);
		//assert.strictEqual(this.oValueListProvider.oControl.setValue.calledOnce,true);
		//assert.strictEqual(this.oValueListProvider.oControl.setValue.calledWith(""),true);
	});

	QUnit.test("MultiInput - addValidator shall trigger backend validation and create token (via asyncCallback) with typed in text if no suggestionRow is present", function(assert) {
		var fValidate = null, fAsyncCallback = sinon.stub(), oSuggestionRow = null, sInput = "foo";
		var oMockRow = {TheKey:"key",Desc:"description"};
		var oBackendRequest = null;
		assert.strictEqual(this.oValueListProvider.oControl.addValidator.calledOnce,true);
		fValidate  = this.oValueListProvider.oControl.addValidator.args[0][0];
		sinon.stub(this.oValueListProvider,"_calculateAndSetFilterOutputData");
		sinon.stub(this.oValueListProvider,"_calculateFilterInputData");
		//Trigger the validation
		fValidate({suggestionObject: oSuggestionRow, text: sInput, asyncCallback: fAsyncCallback});
		assert.strictEqual(this.oValueListProvider.oODataModel.getData.calledOnce,false);
		assert.strictEqual(this.oValueListProvider.oODataModel.read.calledOnce,true);
		assert.strictEqual(this.oValueListProvider.oControl.__bValidatingToken,true);

		oBackendRequest = this.oValueListProvider.oODataModel.read.args[0][1];

		//Tigger success call
		oBackendRequest.success({results:[oMockRow]},{});

		assert.strictEqual(this.oValueListProvider._calculateAndSetFilterOutputData.calledWith([oMockRow]),true);
		assert.strictEqual(fAsyncCallback.calledOnce,true);
		//assert.strictEqual(this.oValueListProvider.oControl.setValue.calledOnce,true);
		//assert.strictEqual(this.oValueListProvider.oControl.setValue.calledWith(""),true);
		assert.strictEqual(this.oValueListProvider.oControl.__bValidatingToken,undefined);
	});

	QUnit.module("sap.ui.comp.providers.ValueListProvider (typeAhead - single Input)", {
		beforeEach: function() {
			this.oAnnotation = {valueListEntitySetName:"Chuck",keyField:"TheKey",descriptionField:"Desc",keys:["TheKey"],valueListFields:[{name:"TheKey"},{name:"Desc"}]};
			this.oModel = sinon.createStubInstance(ODataModel);
			this.oValueListProvider = new ValueListProvider({control: sinon.createStubInstance(Input), aggregation:"suggestionItems", annotation:this.oAnnotation, model:this.oModel, typeAheadEnabled:true});
		},
		afterEach: function() {
			this.oValueListProvider.destroy();
			this.oValueListProvider = null;
		}
	});

	QUnit.test("Input - attachSuggestionItemSelected shall trigger select and set Key as value of Input", function(assert) {
		var fSuggestionItemSelected = null, oEvent = {getParameter:sinon.stub()};
		var oMockRow = {TheKey:"key",Desc:"description"};
		var oSelectedRow = {getModel:sinon.stub(),getBindingContextPath:sinon.stub()};
		var oModel = {getData:sinon.stub()};
		oModel.getData.returns(oMockRow);
		oSelectedRow.getModel.returns(oModel);
		oEvent.getParameter.returns(oSelectedRow);
		assert.strictEqual(this.oValueListProvider.oControl.attachSuggestionItemSelected.calledOnce,true);
		fSuggestionItemSelected  = this.oValueListProvider.oControl.attachSuggestionItemSelected.args[0][0];
		sinon.stub(this.oValueListProvider,"_calculateAndSetFilterOutputData");

		//Trigger the selection
		fSuggestionItemSelected(oEvent);

		assert.strictEqual(oSelectedRow.getModel.calledOnce,true);
		assert.strictEqual(oModel.getData.calledOnce,true);
		assert.strictEqual(this.oValueListProvider._calculateAndSetFilterOutputData.calledOnce,true);
		assert.strictEqual(this.oValueListProvider._calculateAndSetFilterOutputData.calledWith([oMockRow]),true);
		assert.strictEqual(this.oValueListProvider.oControl.setValue.calledOnce,true);
		assert.strictEqual(this.oValueListProvider.oControl.setValue.calledWith("key"),true);
		assert.strictEqual(this.oValueListProvider.oControl.fireChange.calledOnce,true);
		assert.strictEqual(this.oValueListProvider.oControl.fireChange.calledWith({value:"key", validated: true}),true);
	});

	// BCP 1770487494
	QUnit.test("it should unbind the suggestionItems aggregation when the provided control is removed from the control tree", function(assert) {

		// arrange
		var oSmartField = new SmartField();
		var oInput = new Input();
		var oText = new Text();
		var sAggregation = "suggestionItems";
		oSmartField.setContent(oInput);

		// system under test
		this.oValueListProvider = new ValueListProvider({
			control: oInput,
			aggregation: sAggregation,
			annotation: this.oAnnotation,
			model: this.oModel,
			typeAheadEnabled: true
		});

		// act: simulate an user interaction with the text input control, the ValueListProvider class bind the
		// aggregation on the suggest event handler of the text input control
		oInput.fireSuggest({
			suggestValue: "foo"
		});

		// change the SmartField's content aggregation (this usually occurs when the inner controls are toggled)
		oSmartField.setContent(oText);

		// assert
		assert.strictEqual(oInput.isBound(sAggregation), false);

		// cleanup
		oSmartField.destroy();
		oInput.destroy();
		oText.destroy();
	});

	QUnit.test("it should not unbind the suggestionItems aggregation", function(assert) {

		// arrange
		var oSmartField = new SmartField();
		var oInput = new Input();
		var sAggregation = "suggestionItems";
		oSmartField.setContent(oInput);

		// system under test
		this.oValueListProvider = new ValueListProvider({
			control: oInput,
			aggregation: sAggregation,
			annotation: this.oAnnotation,
			model: this.oModel,
			typeAheadEnabled: true
		});

		// act: simulate an user interaction with the text input control, the ValueListProvider class bind the
		// aggregation on the suggest event handler of the text input control
		oInput.fireSuggest({
			suggestValue: "foo"
		});

		// change the SmartField's content aggregation (this usually occurs when the inner controls are toggled)
		oSmartField.setContent(oInput);

		// assert
		assert.strictEqual(oInput.isBound(sAggregation), true);

		// cleanup
		oSmartField.destroy();
		oInput.destroy();
	});

	QUnit.start();

});