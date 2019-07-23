sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/ChangeReason",
	"sap/fe/controllerextensions/Transaction",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, ChangeReason, Transaction, MessageToast, MessageBox) {
	"use strict";
	function toggleCells(aCells) {
		/* if sap.m.input fields are editable, they immmediately send patches with v4 */
		aCells.forEach(function (cell) {
			if (cell.setEditable) {
				cell.setEditable(!cell.getEditable());
				cell.setEnabled(!cell.getEnabled());
			}
		});
	}
	return Controller.extend("view.Main", {
		oFilterModel: null,
		draft: Transaction,
		onInit: function() {
			var oFilterModel = this.oFilterModel = new JSONModel();
			var oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
			var oMessageStrip = this.oMessageStrip = this.getView().byId("messageStrip");
			this.getView().setModel(oMessageModel, "message");
			/* TODO: Discuss if a freestyle would hard wire the programming model */
			this.draft.sProgrammingModel = 'Draft';
			oFilterModel.attachPropertyChange(function(oEvent) {
				var oParameter = oEvent.getParameters(),
					sPath = oParameter && oParameter.path;
				if (sPath) {
					this.updateTable();
				}
			}.bind(this));
			this.getView().setModel(oFilterModel, "filter");
			/* Keep table to save repeat getView().byId(... */
			var oTable = this.oTable = this.getView().byId("mainTable");
			/* Central error handler, needs closure as I can't get 'this' right */
			this.onError = function (oException) {
				if (oTable.isBusy()) {
					oTable.setBusy(false);
				}
				//oMessagePopover.getParent().firePress();
				oMessageStrip.setText(oException.message);
				oMessageStrip.setTooltip(JSON.stringify(oException.error,null,2));
				oMessageStrip.setType("Error");
				MessageBox.show(oException.message, {
					icon: MessageBox.Icon.ERROR,
					title: "Error",
					actions: [MessageBox.Action.OK],
					defaultAction: MessageBox.Action.OK,
					details: oException.error,
					contentWidth: "60%"
				});
			};
		},
		/* Central set busy false for all requests */
		onDataRequested: function (oEvent) {
			if (this.oTable) {
				this.oTable.setBusy(true);
			}
		},
		onDataReceived: function (oEvent) {
				this.oTable.setBusy(false);
				this.oMessageStrip.setText("Data received / Request successful");
				this.oMessageStrip.setType("Information");
				//var aCells = oTable.getItems()[0].getCells();
				//toggleCells(aCells);
		},
		/*
			This handler will enable edit on an active document. Leaving a field automatically sends
			patch requests to the active document. At least for $direct mode
		*/
		onEdit: function(oEvent) {
			var oControl = oEvent.getSource(),
				oRow = oControl.getParent().getParent(), //Button->Toolbar->Row
				aCells = oRow.getCells();
			if (this.aLastCells) {
				toggleCells(this.aLastCells);
			}
			toggleCells(aCells);
			this.aLastCells = aCells;
		},
		/* Update table based on filterbar events */
		updateTable: function (oEvent) {
			var oTable = this.oTable,
				oModel = oTable.getModel(),
				oBinding = oModel.getBindingForReference('sap.fe.tableBinding') || oTable.getBinding("items"),
				oPromise = Promise.resolve(oBinding),
				oFilterValues = this.oFilterModel.getObject("/");
			if (oBinding instanceof Promise) {
				oPromise = oBinding;
			}
			oPromise.then(function(oBinding) {
				//sap.fe.Table does its own busy handling. So only do it for freestyle table controls
				if (oTable.getMetadata().getName() !== "sap.ui.mdc.Table") {
					oTable.setBusy(true);
				}
				/* Check and apply filterbar values (but not editState) */
				if (oFilterValues && oFilterValues.FoundingYear) {
					oBinding.filter(
						new Filter("FoundingYear", FilterOperator.EQ, oFilterValues.FoundingYear)
					);
				} else if (oFilterValues && oFilterValues.FoundingYear === "") {
					/* clear filters if non are set */
					oBinding.filter();
				}
			});
		},
		handleMessagePopoverPress: function (oEvent) {
			var oMessagePopover = oEvent.getSource().getDependents()[0];
			oMessagePopover.openBy(oEvent.getSource());
		},
		toggleStaticFilter: function(oEvent) {
			var oTable = this.oTable,
				oBinding = oTable.getBinding("items");
			if (oBinding.mParameters.$filter && oBinding.mParameters.$filter.indexOf("FoundingYear eq '2000'") > -1) {
				oBinding.changeParameters({$filter:null});
			} else {
				oBinding.changeParameters({$filter:"FoundingYear eq '2000'"});
			}
		},
		toastIt: function(text) {
			MessageToast.show(text);
		},
		search: function(oListBinding, sSearchText) {
			//in case a promise was passed
			Promise.resolve(oListBinding).then(function(oListBinding) {
				sSearchText = sSearchText !== '' ? sSearchText : undefined;
				oListBinding.changeParameters({$search: sSearchText});
			});
		}
	});
}, /* bExport= */ true);
