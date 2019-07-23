sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/base/ConditionModel",
	"sap/ui/mdc/base/Condition",
	"sap/m/Table",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/Text"
], function(
		Controller,
		Filter,
		FilterOperator,
		JSONModel,
		ConditionModel,
		Condition,
		Table,
		ColumnListItem,
		Column,
		Label,
		Text
		) {
	"use strict";

	return Controller.extend("sap.ui.mdc.base.sample.field.fieldBase.Test", {

		onInit: function(oEvent) {
			var oView = this.getView();
			oView.bindElement("/ProductCollection('1239102')");

			var oViewModel = new JSONModel({
				editMode: false,
				weightUnits: [
					{
						id: "mass-gram",
						unit: "g",
						text: "gram"
					},
					{
						id: "mass-kilogram",
						unit: "kg",
						text: "kilogram"
					},
					{
						id: "mass-milligram",
						unit: "mg",
						text: "milligram"
					},
					{
						id: "mass-metric-ton",
						unit: "t",
						text: "ton"
					}
				]
			});
			oView.setModel(oViewModel, "view");

			var oTable = oView.byId("myTable");
			var oListBinding = oTable.getBinding("items");

			// create a ConditionModel for the listbinding
			var oCM = ConditionModel.getFor(oListBinding);
			var oConditionChangeBinding = oCM.bindProperty("/conditions", oCM.getContext("/conditions"));
			oConditionChangeBinding.attachChange(this.handleConditionModelChange.bind(this));

			oCM.addCondition("ProductId", Condition.createCondition("EEQ", ["22134T"]));
			oCM.addCondition("Name", Condition.createCondition("StartsWith", ["Web"]));
			oCM.addCondition("Date", Condition.createCondition("EEQ", [new Date(1397520000000)]));
			oCM.addCondition("Quantity", Condition.createCondition("EEQ", [22]));
			oCM.addCondition("Description", Condition.createCondition("Contains", ["USB"]));
			oCM.addCondition("Status", Condition.createCondition("EEQ", ["S1"]));
			oCM.addCondition("WeightMeasure", Condition.createCondition("EEQ", [700, "mass-gram"]));

			//set the model on your view
			oView.setModel(oCM, "cm");

			var fnFireChange = function(aConditions, bValid) {this.fireEvent("change", {conditions: aConditions, valid: bValid});};
			var oBaseField = oView.byId("FB1");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField.setProperty("_onlyEEQ", true);
			oBaseField = oView.byId("FB2");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField.setProperty("_onlyEEQ", true);
			oBaseField = oView.byId("FB3");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB4");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB5");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB6");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB7");
			oBaseField._fireChange = fnFireChange;
			oBaseField.setProperty("_onlyEEQ", true);
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB8");
			oBaseField._fireChange = fnFireChange;
			oBaseField.setProperty("_onlyEEQ", true);
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9a");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9b");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9c");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB10");
			var oCM2 = new ConditionModel(); // dummy for Link
			oView.setModel(oCM2, "cm2");
			oCM2.addCondition("Link", Condition.createCondition("EEQ", ["My Link"]));
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB11");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB12");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB13");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB14");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB15");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB16");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB16b");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB17");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB18");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField.setProperty("_onlyEEQ", true);
			oBaseField = oView.byId("FB19");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB20");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB21");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);

		},

		handleChange: function(oEvent) {
			var oField = oEvent.oSource;
			var aConditions = oEvent.getParameter("conditions");
			var bValid = oEvent.getParameter("valid");
			var oText = this.byId("MyText");
			var oIcon = this.byId("MyIcon");
			var sValue;

			if (aConditions) {
				for (var i = 0; i < aConditions.length; i++) {
					var oCondition = aConditions[i];
					if (sValue) {
						sValue = sValue + ", " + oCondition.values[0];
					} else {
						sValue = oCondition.values[0];
					}
				}
			}

			oText.setText("Field: " + oField.getId() + " Change: value = " + sValue);

			if (bValid) {
				oIcon.setSrc("sap-icon://message-success");
				oIcon.setColor("Positive");
			} else {
				oIcon.setSrc("sap-icon://error");
				oIcon.setColor("Negative");
			}
		},

		handleConditionModelChange: function(oEvent) {
			var oCM = this.getView().getModel("cm");
			oCM.applyFilters(true);
			var oView = this.getView();
			var oTextArea = oView.byId("Cond");
			var oTable = oView.byId("myTable");
			var oListBinding = oTable.getBinding("items");
			var sVariant = sap.ui.mdc.base.ConditionModel.serialize(oListBinding);
			oTextArea.setValue(sVariant);
		},

		handleFilterChange: function(oEvent) {
//			var oFilterField = oEvent.oSource;
			var oCM = this.getView().getModel("cm");
			oCM.applyFilters(true);
		},

		handleLiveChange: function(oEvent) {
			var oField = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bEscPressed = oEvent.getParameter("escPressed");
			var oText = this.byId("MyTextRight");
			var oIcon = this.byId("MyIconRight");
			oText.setText("Field: " + oField.getId() + " liveChange: value = " + sValue);

			if (!bEscPressed) {
				oIcon.setSrc("sap-icon://message-success");
				oIcon.setColor("Positive");
			} else {
				oIcon.setSrc("sap-icon://sys-cancel");
				oIcon.setColor("Warning");
			}
		},

		handlePress: function(oEvent) {
			var oField = oEvent.oSource;
			var oText = this.byId("MyText");
			var oIcon = this.byId("MyIcon");
			oText.setText("Field: " + oField.getId() + " Press");
			oIcon.setSrc("sap-icon://message-success");
			oIcon.setColor("Positive");
		},

		toggleDisplay: function(oEvent) {
			var oField = this.byId("F11");
			var bPressed = oEvent.getParameter("pressed");
			if (bPressed) {
				oField.setEditMode(sap.ui.mdc.EditMode.Display);
			} else {
				oField.setEditMode(sap.ui.mdc.EditMode.Editable);
			}
		},

		handleButton: function(oEvent) {
			var oApp = this.byId("MyApp");
			var sKey = oEvent.getParameter("key");
			var oCurrentPage = oApp.getCurrentPage();
			var oNewPage = this.byId(sKey);
			var sPageId = oNewPage.getId();
			oApp.to(sPageId);
			oNewPage.setFooter(oCurrentPage.getFooter());
		},

		handleStatusOpen: function(oEvent) {
			var oFieldHelp = oEvent.oSource;
			var oWrapper = oFieldHelp.getContent();
			var oTable = oWrapper.getTable();
			if (!oTable) {
				var oItem = new ColumnListItem({
					type: "Active",
					cells: [new Text({text: "{StatusId}"}),
					        new Text({text: "{Name}"})]
				});
				oTable = new Table("StatusTable", {
					width: "20rem",
					columns: [new Column({header: new Label({text: "{/#Status/StatusId/@sap:label}"}), width: "4rem"}),
					          new Column({header: new Label({text: "{/#Status/Name/@sap:label}"})})],
					items: {path: '/StatusCollection', template: oItem}
				});
				setTimeout(function () { // test async table assignment
					oWrapper.setTable(oTable);
				}, 0);
			}
		},

		clearFilters: function(oEvent) {
			var oCM = this.getView().getModel("cm");
			oCM.removeAllConditions();
		},

		handleModeChange: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var oView = this.getView();
			var oBaseField = oView.byId("FB9");
			oBaseField.setEditMode(oItem.getKey());
			oBaseField = oView.byId("FB9a");
			oBaseField.setEditMode(oItem.getKey());
			oBaseField = oView.byId("FB9b");
			oBaseField.setEditMode(oItem.getKey());
			oBaseField = oView.byId("FB9c");
			oBaseField.setEditMode(oItem.getKey());
		}

	});
}, true);
