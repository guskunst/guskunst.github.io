/**
 * tests for the sap.suite.ui.generic.template.designtime.ObjectPageHeader.designtime.js
 */
sap.ui.define([
		"testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/designtime/ObjectPageHeader.designtime",
		"sap/suite/ui/generic/template/designtime/utils/DesigntimeUtils"
	],
	function(sinon, ObjectPageHeader, DesigntimeUtils) {
		"use strict";

		/********************************************************************************/
		QUnit.module("The function getObjectHeaderProperties", {
			beforeEach: function() {
				this.allProperties = {
					firstProperty: {ignore: true}
				};
				this.oIgnoreAllPropertiesStub = sinon.stub(DesigntimeUtils, "ignoreAllProperties").returns(this.allProperties);
			},
			afterEach: function() {
				this.oIgnoreAllPropertiesStub.restore();
			}
		});

		QUnit.test("getObjectHeaderProperties", function() {
			// Arrange
			var oElement = {};

			// Act
			var oProperties =  ObjectPageHeader.getObjectHeaderProperties(oElement);

			// Assert
			var oExpected = {
				firstProperty: {ignore: true},
				objectImageShape: {ignore: false}
			};
			assert.deepEqual(oProperties, oExpected, "Properties are active as expected");
		});

	});
