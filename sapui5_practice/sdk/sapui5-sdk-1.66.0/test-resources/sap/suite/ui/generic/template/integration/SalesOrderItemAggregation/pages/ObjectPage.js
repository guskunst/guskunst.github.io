sap.ui.define(["sap/ui/test/Opa5", 
	"sap/suite/ui/generic/template/integration/SalesOrderItemAggregation/pages/Common",
	"sap/suite/ui/generic/template/integration/SalesOrderItemAggregation/pages/actions/ObjectPageActions",
	"sap/suite/ui/generic/template/integration/SalesOrderItemAggregation/pages/assertions/ObjectPageAssertions"],

	function(Opa5, Common, ObjectPageActions, ObjectPageAssertions) {
		"use strict";

		var VIEWNAME = "Details";
		var VIEWNAMESPACE = "sap.suite.ui.generic.template.ObjectPage.view.";
		var OP_PREFIX_ID = "SOITMAGGR::sap.suite.ui.generic.template.ObjectPage.view.Details::STTA_C_SO_ItemAggr--";
		
		var SALESORDER_ENTITY_TYPE = "STTA_SALES_ORDER_ITEM_AGGR_SRV.STTA_C_SO_ItemAggrType";
		var SALESORDER_ENTITY_SET = "STTA_C_SO_ItemAggr";
		
		console.log ( "OPA5::ObjectPage::CONSTANTS " 
				+ " VIEWNAME: " + VIEWNAME
				+ " VIEWNAMESPACE: " + VIEWNAMESPACE
				+ " OP_PREFIX_ID: " + OP_PREFIX_ID
				+ " SALESORDER_ENTITY_TYPE: " + SALESORDER_ENTITY_TYPE
				+ " SALESORDER_ENTITY_SET: " + SALESORDER_ENTITY_SET
		);
		
		Opa5.createPageObjects({
			onTheObjectPage: {
				baseClass: Common,
				actions: ObjectPageActions(OP_PREFIX_ID, VIEWNAME, VIEWNAMESPACE),
				assertions: ObjectPageAssertions(OP_PREFIX_ID, VIEWNAME, VIEWNAMESPACE)
			}
		});
	}
);
