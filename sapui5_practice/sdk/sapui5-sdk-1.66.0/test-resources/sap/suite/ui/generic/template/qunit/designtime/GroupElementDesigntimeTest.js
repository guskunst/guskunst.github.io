/**
* tests for the sap.suite.ui.generic.template.designtime.GroupElement.designtime.js
*/
sap.ui.define([
		"testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/designtime/utils/DesigntimeUtils",
		"sap/suite/ui/generic/template/designtime/GroupElement.designtime",
		"sap/suite/ui/generic/template/designtime/virtualProperties/GroupElementType"
	],
	function(sinon, DesigntimeUtils, GroupElement, GroupElementType) {
		"use strict";

		QUnit.dump.maxDepth = 20;


		/********************************************************************************/
		QUnit.module("The function getGroupElementProperties", {
			beforeEach: function() {
				this.allProperties = {
					firstProperty: {ignore: true}
				};
				this.oIgnoreAllPropertiesStub = sinon.stub(DesigntimeUtils, "ignoreAllProperties").returns(this.allProperties);
				var oBundle = {
					getText: function() {
						return;
					}
				};
				this.oGetResourceBundleStub = sinon.stub(sap.ui.getCore().getModel("i18nDesigntime"), "getResourceBundle").returns(oBundle);
				this.oGetGroupElementType = sinon.stub(GroupElement, "getGroupElementType");
				this.oSetGroupElementType = sinon.stub(GroupElement, "setGroupElementType");
			},
			afterEach: function() {
				this.oIgnoreAllPropertiesStub.restore();
				this.oGetResourceBundleStub.restore();
				this.oGetGroupElementType.restore();
				this.oSetGroupElementType.restore();
			}
		});

		QUnit.test("getGroupElementProperties", function() {
			// Arrange
			var oElement = {};

			// Act
			var oProperties =  GroupElement.getGroupElementProperties(oElement);

			// Assert
			var oExpectedValues = {
				Datafield: {
					displayName: "Data Field"
				},
				DatafieldWithUrl: {
					displayName: "Data Field with URL"
				},
				Contact: {
					displayName: "Contact"
				},
				Address: {
					displayName: "Address"
				},
				DataFieldWithIntentBasedNavigation: {
					displayName: "Intent Based Navigation"
				},
				DataFieldWithNavigationPath: {
					displayName: "DataField with Navigation Path"
				}
			};
			assert.deepEqual(oProperties.firstProperty, {ignore: true}, "Blacklisted property is ignored");
			assert.equal(oProperties.groupElementType.virtual, true, "Property groupElementType is present");
			assert.equal(oProperties.groupElementType.ignore, false, "Property groupElementType is active");
			assert.equal(oProperties.groupElementType.type, "EnumType", "Property groupElementType has the right type");
			assert.notEqual(oProperties.groupElementType.multiple, true, "Property groupElementType is not multiple");
			assert.deepEqual(oProperties.groupElementType.possibleValues, oExpectedValues, "Property groupElementType has the right possible values");
		});
	});