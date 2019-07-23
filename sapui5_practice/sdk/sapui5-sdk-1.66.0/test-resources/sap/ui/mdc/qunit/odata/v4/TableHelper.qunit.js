/* eslint-disable consistent-return */
/* global QUnit */
sap.ui.define(
	[
		"sap/ui/thirdparty/sinon",
		"jquery.sap.global",
		"sap/ui/mdc/odata/v4/table/TableHelper",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (sinon, jQuery, TableHelper) {
		"use strict";
		QUnit.module("Unit Test for getRestrictionsPath");

		QUnit.test("Unit test to check getRestrictionsPath ", function (assert) {
			[{
					oCollection: {
						"@Org.OData.Capabilities.V1.DeleteRestrictions": {
							Deletable: {
								$Path: "HasDraftEntity"
							}
						}
					},
					bExpectedValue: ', $select : \'HasDraftEntity\'',
					sMessage: "with DeleteRestrictions Path"
				},
				{
					oCollection: {
						"@Org.OData.Capabilities.V1.DeleteRestrictions": {
							Deletable: {
								Bool: "true"
							}
						}
					},
					bExpectedValue: '',
					sMessage: "with DeleteRestrictions Bool"
				},
				{
					oCollection: {},
					bExpectedValue: '',
					sMessage: "without DeleteRestrictions"
				}
			].forEach(function (oProperty) {
				var actualValue = TableHelper.getRestrictionsPath(oProperty.oCollection);
				assert.equal(actualValue, oProperty.bExpectedValue, "Unit test to check getRestrictionsPath " + oProperty.sMessage + ": ok");
			});
		});
	}
);
