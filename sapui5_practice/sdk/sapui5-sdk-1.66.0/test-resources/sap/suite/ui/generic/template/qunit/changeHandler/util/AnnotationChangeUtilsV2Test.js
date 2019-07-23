/**
 * tests for the sap.suite.ui.generic.template.changeHandler.util.AnnotationChangeUtilsV2
 */
sap.ui.define([
		"testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/changeHandler/util/AnnotationChangeUtilsV2"
	],
	function(sinon, AnnotationHandler) {
		"use strict";


		QUnit.test("AnnotationHandler exists", function() {
			assert.notEqual(AnnotationHandler, "undefined", "The AnnotationHandler object exists.");
		});

		QUnit.test("The function createAnnotationChangeContent creates the change command content", function() {
			// Arrange
			var oAnnotationChangeContent, oAnnotation, sTargetType, sAnnotationTerm;

			oAnnotation = {foo: "bar"};
			sTargetType = "entityType";
			sAnnotationTerm = "term";

			// Act
			oAnnotationChangeContent = AnnotationHandler.createAnnotationChangeContent(oAnnotation, sTargetType, sAnnotationTerm);

			// Assert
			var oTargetAnnotation = oAnnotationChangeContent[sTargetType];
			assert.deepEqual(oAnnotationChangeContent, {"entityType": {"term": {"foo": "bar"}}}, "The target type that has been passed as a parameter is properly set as a new property of annotations.");
			assert.deepEqual(oTargetAnnotation, {"term": {"foo": "bar"}}, "The annotation term is used as key.");
			assert.deepEqual(oTargetAnnotation[sAnnotationTerm], oAnnotation, "The annotation object that has been passed as a parameter is correctly added as a target annotation.");
		});

		module("The function updateAnnotationProperty", {
			beforeEach: function() {
				this.oCreateProperty = sinon.spy(AnnotationHandler, "_createProperty");
			},

			afterEach: function() {
				this.oCreateProperty.restore();
			}
		});

		QUnit.test("triggers the update of an existing property", function() {
			// Arrange
			var sPropertyName, oAnnotation, oResultAnnotation;

			sPropertyName = "annotationProperty";
			oAnnotation = {};
			oAnnotation[sPropertyName] = {};

			// Act
			oResultAnnotation = AnnotationHandler.updateAnnotationProperty(oAnnotation, "");

			// Assert
			assert.equal(this.oCreateProperty.calledOnce, false, "The update of an existing property is triggered.");
			assert.notEqual(oResultAnnotation, "undefined", "The function returns an object.");
		});

		QUnit.test("triggers the addition of a new property if the change type is not an expression type", function() {
			// Arrange
			var oPropertyContent = {
					propertyType: "String",
					propertyValue: "newString",
					propertyName: "Label"
				},
				oResultAnnotation,
				oAnnotation = {
					Label: {
						String: "oldString"
					}
				};

			// Act
			oResultAnnotation = AnnotationHandler.updateAnnotationProperty(oAnnotation, oPropertyContent);

			// Assert
			assert.equal(this.oCreateProperty.calledOnce, true, "The addition of a new property is triggered.");
			assert.deepEqual(oResultAnnotation, {
				Label: {
					String: "newString"
				}}, "The function returns an object with the new value.");
		});

		QUnit.test("does nothing if there is no key with the property name in the annotation and the change type is an expression type", function() {
			// Arrange
			var oResult,
				oPropertyContent = {
					changeType: "expression"
				};

			// Act
			oResult = AnnotationHandler.updateAnnotationProperty({}, oPropertyContent);

			// Assert
			assert.equal(this.oCreateProperty.notCalled, true, "The addition of a new property is not triggered.");
			assert.equal(oResult, null, "The function returns null.");
		});

		QUnit.test("assigns the value directly for a simple type", function() {
			// Arrange
			var oPropertyContent = {
					propertyType: "PropertyPath",
					propertyValue: "newPath"
				},
				oResultAnnotation,
				oAnnotation = {
					PropertyPath: "oldPath"
				};

			// Act
			oResultAnnotation = AnnotationHandler.updateAnnotationProperty(oAnnotation, oPropertyContent);

			// Assert
			assert.equal(this.oCreateProperty.notCalled, true, "The addition of a new property is not triggered.");
			assert.deepEqual(oResultAnnotation,  {
				PropertyPath: "newPath"
			}, "The function returns the new property value.");
		});

		QUnit.test("_createProperty: The property object is created with property type and property value", function() {
			// Arrange
			var sPropertyType, sPropertyValue, oProperty;

			sPropertyValue = "bar";
			sPropertyType = "SpecialType";

			// Act
			oProperty = AnnotationHandler._createProperty(sPropertyType, sPropertyValue);

			// Assert
			assert.notEqual(oProperty, "undefined", "There is a new created property object.");
			assert.strictEqual(oProperty[sPropertyType], sPropertyValue, "The property value has been set as value to the property type key.");
		});

		module("The function _createProperty", {
		});

		QUnit.test("changes the property type to EnumMember if it originally is EnumType", function() {
			// Arrange
			var sPropertyType, oProperty;
			sPropertyType = "EnumType";

			// Act
			oProperty = AnnotationHandler._createProperty(sPropertyType, "");

			// Assert
			assert.notEqual(oProperty.EnumMember, "undefined", "The key EnumMember exists in the annotation property.");
		});

		module("The function updateAnnotationProperty", {
			beforeEach: function() {
				this.oCreateProperty = sinon.spy(AnnotationHandler, "_createProperty");
			},

			afterEach: function() {
				this.oCreateProperty.restore();
			}
		});

		QUnit.test("Triggers the update of an existing property", function() {
			// Arrange
			var oAnnotation,
				oProperty = {
					propertyName: "annotationProperty"
				};

			oAnnotation = {};
			oAnnotation[oProperty.propertyName] = {};

			// Act
			AnnotationHandler.updateAnnotationProperty(oAnnotation, oProperty);

			// Assert
			assert.strictEqual(this.oCreateProperty.calledOnce, true, "The update of an existing property is triggered.");
		});

		QUnit.test("Triggers the addition of a new property if the change type is not an expression type", function() {
			// Arrange
			var oProperty = {
					changeType: "value",
					propertyName: "annotationProperty"
				};

			// Act
			AnnotationHandler.updateAnnotationProperty({}, oProperty);

			// Assert
			assert.strictEqual(this.oCreateProperty.calledOnce, true,  "The addition of a new property is triggered.");
		});

		QUnit.test("Does nothing if there is no key with the property name in the annotation and the change type is an expression type", function() {
			// Arrange
			var oResult,
				oProperty = {
					changeType: "expression",
					propertyName: "annotationProperty"
				};

			// Act
			oResult = AnnotationHandler.updateAnnotationProperty({}, oProperty);

			// Assert
			assert.strictEqual(this.oCreateProperty.notCalled, true, "The addition of a new property is not triggered.");
			assert.strictEqual(oResult, null, "The function returns null.");
		});

		QUnit.test("Returns the right annotation if a single-property annotation is passed", function() {
			// Arrange
			var oResult,
				oAnnotation = {
					EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast"
				},
				oProperty = {
					propertyName: "com.sap.vocabularies.UI.v1.TextArrangement",
					propertyType: "EnumType",
					propertyValue: "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst",
					rootProperty: undefined
				};

			// Act
			oResult = AnnotationHandler.updateAnnotationProperty(oAnnotation, oProperty);

			// Assert
			assert.strictEqual(this.oCreateProperty.calledOnce, true,  "The addition of a new property is triggered.");
			assert.deepEqual(oResult, {
				EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"
			}, "The new enum member is returned.");
		});
	});
