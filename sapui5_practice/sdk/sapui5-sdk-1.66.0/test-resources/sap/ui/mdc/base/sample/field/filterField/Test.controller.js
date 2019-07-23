sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/base/ConditionModel",
	"sap/ui/mdc/base/Condition"
], function(
		Controller,
		Filter,
		FilterOperator,
		JSONModel,
		ConditionModel,
		Condition
		) {
	"use strict";

	return Controller.extend("sap.ui.mdc.base.sample.field.filterField.Test", {

		onInit: function(oEvent) {
			var oView = this.getView();
			oView.bindElement("/ProductCollection('1239102')");

			var oViewModel = new JSONModel({ editMode: false});
			oView.setModel(oViewModel, "view");

			var oTable = oView.byId("myTable");
			var oListBinding = oTable.getBinding("items");

			// create a ConditionModel for the listbinding
			var oCM = ConditionModel.getFor(oListBinding);
			var oConditionChangeBinding = oCM.bindProperty("/conditions", oCM.getContext("/"));
			oConditionChangeBinding.attachChange(this.handleConditionModelChange.bind(this));

			oCM.addCondition("ProductId", Condition.createCondition("EEQ", ["22134T"]));
			oCM.addCondition("Name", Condition.createCondition("StartsWith", ["Web"]));
			oCM.addCondition("Quantity", Condition.createCondition("EEQ", [22]));

			//set the model on your view
			oView.setModel(oCM, "cm");

		},

		handleChange: function(oEvent) {
			var oField = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			var oText = this.byId("MyText");
			var oIcon = this.byId("MyIcon");
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

		handleGo: function(oEvent) { // TODO: need trigger in FieldHelp
			var oFilterConditionModel = oEvent.oSource.getModel("filter");
			if (oFilterConditionModel) {
				var oFilter = oFilterConditionModel.getFilters();
				oFilterConditionModel._oListBinding.filter(oFilter); // TODO: function on CM
			}
		}
	});
}, true);
