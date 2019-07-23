sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
	var oPageController = Controller.extend("sap.suite.ui.commons.sample.MicroProcessFlowPopover.MicroProcessFlow", {
		onInit: function () {
		},
		_getColorByState: function (oItem) {
			switch (oItem.getState()) {
				case "Error" : return "red";
				case "Warning" : return "orange";
				case "Success" : return "green";
			}
		},
		itemPress: function (oEvent) {
			var oItem = oEvent.getSource(),
				aCustomData = oItem.getCustomData(),
				sTitle = aCustomData[0].getValue(),
				sIcon = aCustomData[1].getValue(),
				sSubTitle = aCustomData[2].getValue(),
				sDescription = aCustomData[3].getValue();

			var oPopover = new sap.m.Popover({
				contentWidth: "300px",
				title: "Order status",
				content: [
					new sap.m.HBox({
						items: [
							new sap.ui.core.Icon({
								src: sIcon,
								color: this._getColorByState(oItem)
							}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd"),
							new sap.m.FlexBox({
								width: "100%",
								renderType: "Bare",
								direction: "Column",
								items: [new sap.m.Title({
									level: sap.ui.core.TitleLevel.H1,
									text: sTitle
								}), new sap.m.Text({
									text: sSubTitle
								}).addStyleClass("sapUiSmallMarginBottom sapUiSmallMarginTop"),
									new sap.m.Text({
										text: sDescription
									})
								]
							})
						]
					}).addStyleClass("sapUiTinyMargin")
				],
				footer: [
					new sap.m.Toolbar({
						content: [
							new sap.m.ToolbarSpacer(),
							new sap.m.Button({
								text: "Close",
								press: function() {
									oPopover.close();
								}
							})]
					})
				]
			});

			oPopover.openBy(oEvent.getParameter("item"));
		}
	});
	return oPageController;
});
