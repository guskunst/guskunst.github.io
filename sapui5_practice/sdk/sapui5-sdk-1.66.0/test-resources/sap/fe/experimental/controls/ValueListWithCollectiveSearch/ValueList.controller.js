sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("sap.fe.controls._ValueList.ValueList", {

		onBeforeRendering : function(){
			var bVisible = true;
			var iValueLists = 0;
			var oValueListModel = this.getView().getModel("ui");
			var mValueListInfo = oValueListModel.getProperty("/valueListInfo");

			oValueListModel.setProperty("/visible", {});

			for (var p in mValueListInfo) {
				mValueListInfo[p].name = p;
				oValueListModel.setProperty("/visible/" + p, bVisible);

				if (bVisible){
					// set the model to the visible list and submit the first batch
					this.getView().setModel(mValueListInfo[p].$model);
					mValueListInfo[p].$model.submitBatch(p);
				}

				// TODO: for the time being we show only the first one - to be checked
				bVisible = false;

				iValueLists++
			}

			if (iValueLists > 1){
				oValueListModel.setProperty("/collectiveSearch", true);
			} else {
				oValueListModel.setProperty("/collectiveSearch", false);
			}
		},

		handleCollectiveSearchChange : function(oEvent){
			var sSelectedList = oEvent.getParameter("selectedItem").getKey();

			var oValueListModel = this.getView().getModel("ui");

			// show selected list
			var mVisible = oValueListModel.getProperty("/visible");
			for (var p in mVisible){
				if (p === sSelectedList){
					mVisible[p] = true;
				} else {
					mVisible[p] = false;
				}
			}
			oValueListModel.setProperty("/visible", mVisible);

			// set correct model and submit batch
			var mValueListInfo = oValueListModel.getProperty("/valueListInfo");
			var oValueList = mValueListInfo[sSelectedList];
			this.getView().setModel(oValueList.$model);
			oValueList.$model.submitBatch(sSelectedList);
		}

		/*
		 selectionChange: function (oControlEvent) {
		 // TODO: just to test it, take all selected items and use the first one as token
		 // to be checked which one is used and with which key and text
		 var aTokens = [];
		 var aSelectedItems = oControlEvent.getParameters().tableSelectionParams.listItems;
		 for (var i = 0; i < aSelectedItems.length; i++) {
		 aTokens.push(new Token({
		 key: aSelectedItems[i].getCells()[0].getText(),
		 text: aSelectedItems[i].getCells()[0].getText()
		 }));
		 }

		 // the tokens are not overwritten - no idea how to remove them
		 this.setTokens(aTokens);
		 },

		 updateSelection: function () {
		 // here we would need to select the tokens in the table - skip this for now as long as we don't
		 // have the final valueHelp dialog
		 },
		 */



	});
});
