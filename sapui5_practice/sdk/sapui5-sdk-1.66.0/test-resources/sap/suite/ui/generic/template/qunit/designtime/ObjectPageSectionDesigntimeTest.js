/**
 * tests for the sap.suite.ui.generic.template.designtime.ObjectPageSection.designtime.js
 */
sap.ui.define([
		"testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/designtime/ObjectPageSection.designtime",
		"sap/suite/ui/generic/template/designtime/utils/DesigntimeUtils"
	],
	function(sinon, ObjectPageSection, DesigntimeUtils) {
		"use strict";

		/********************************************************************************/
		QUnit.module("The function getSectionProperties", {
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

		QUnit.test("getSectionProperties", function() {
			// Arrange
			var oElement = {};

			// Act
			var oProperties =  ObjectPageSection.getSectionProperties(oElement);

			// Assert
			var oExpectedValues = {
				SmartForm: {
					displayName: "Smart Form"
				},
				SmartTable: {
					displayName: "Smart Table"
				},
				SmartChart: {
					displayName: "Smart Chart"
				}
			};
			assert.deepEqual(oProperties.firstProperty, {ignore: true}, "Blacklisted property is ignored");
			assert.equal(oProperties.sectionType.virtual, true, "Property sectionType is present");
			assert.equal(oProperties.sectionType.ignore, false, "Property sectionType is active");
			assert.equal(oProperties.sectionType.type, "EnumType", "Property sectionType has the right type");
			assert.deepEqual(oProperties.sectionType.possibleValues, oExpectedValues, "Property sectionType has the right possible values");
			assert.notEqual(oProperties.sectionType.multiple, true, "Property sectionType is not multiple");
		});

		/********************************************************************************/
		QUnit.module("The function getSmartTableProperties", {
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

		QUnit.test("getSmartTableProperties", function() {
			// Arrange
			var oElement = {};

			// Act
			var oProperties =  ObjectPageSection.getSmartTableProperties(oElement);

			// Assert
			var oExpectedValues = {
				firstProperty: {ignore: true},
				useExportToExcel: { ignore: false }
			};
			assert.deepEqual(oProperties, oExpectedValues, "Properties are returned as expected.");
		});
	});
