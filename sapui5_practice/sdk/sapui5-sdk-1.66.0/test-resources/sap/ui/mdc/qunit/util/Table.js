/**
 * test Table.js control with external aggregation fragment for columns used in TemplateUtil.qunit.js
 */

sap.ui.define([
	'sap/ui/core/Control'
], function(Control) {
	"use strict";

	var Table = Control.extend("util.Table", {
		metadata: {
			properties: {
				header: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				columns: {
					type: "sap.ui.mdc.Column",
					multiple: true
				},
				actions: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiTestTable");
			oRm.writeClasses();

			oRm.write(">");
			oRm.write("</div>");
		}
	});
	return Table;
}, /* bExport= */false);
