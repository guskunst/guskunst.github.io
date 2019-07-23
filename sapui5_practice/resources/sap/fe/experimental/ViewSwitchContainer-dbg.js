/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";

	var ViewSwitchContainer = Control.extend("sap.fe.experimental.ViewSwitchContainer", {
		metadata: {
			properties: {
				selectedIndex : {
					type : "int",
					defaultValue: 0
				}
			},
			events: {},
			defaultAggregation : "items",
			aggregations: {
				items: {
					type: "sap.fe.experimental.ViewSwitchContainerItem",
					multiple: true,
					singularName: "item"
				}
			},
			publicMethods: []
		},

		renderer: {
			render: function(oRm, oControl){
				var aItems = oControl.getItems();
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.write(">");
				// tbd toolbar containing the switch between the items
				for (var i = 0; i < aItems.length; i++ ) {
					if ( i != oControl.getSelectedIndex() ) {
						aItems[i].setVisible(false);
					} else {
						aItems[i].setVisible(true);
					}
					oRm.renderControl(aItems[i]);
				}
				oRm.write("</div>");
			}
		}
	});

	return ViewSwitchContainer;

}, /* bExport= */true);