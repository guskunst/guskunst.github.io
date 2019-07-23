/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"./BaseShape"
], function (BaseShape) {
	"use strict";

	var PROPAGATED_PROPERTIES = ["rowYCenter", "shapeUid", "selected"];

	/**
	 * Creates and initializes a new <code>BaseConditionalShape</code> class for a simple Gantt chart.
	 *
	 * @param {string} [sId] ID of the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A conditional shape renders one of the {@link sap.gantt.simple.BaseShape} shapes assigned to it using the <code>activeShape</code> property. This allows you
	 * to switch between shapes based on properties from data binding.
	 *
	 * @extends sap.gantt.simple.BaseShape
	 *
	 * @author SAP SE
	 * @version 1.66.0
	 * @since 1.64
	 *
	 * @constructor
	 * @public
	 * @alias sap.gantt.simple.BaseConditionalShape
	 */
	var BaseConditionalShape = BaseShape.extend("sap.gantt.simple.BaseConditionalShape", {
		metadata: {
			properties: {
				/**
				 * Defines which shape from the <code>shapes</code> aggregation is visible. If you specify a negative value
				 * or a value that is greater than the number of shapes defined, no shape will be rendered.
				 */
				activeShape: {type: "int", defaultValue: 0}
			},
			aggregations: {
				/**
				 * A list of base shapes to switch between. Only one of these shapes will be rendered based on the <code>activeShape</code> property.
				 */
				shapes: {type: "sap.gantt.simple.BaseShape", multiple: true, singularName: "shape", sapGanttLazy: true}
			}
		}
	});

	/**
	 * @protected
	 */
	BaseConditionalShape.prototype.renderElement = function (oRm, oElement) {
		var iActiveShape = oElement.getActiveShape(),
			aShapes = oElement.getShapes();
		if (iActiveShape >= 0 && iActiveShape < aShapes.length) {
			var oSelectedShape = aShapes[iActiveShape];
			oSelectedShape._iBaseRowHeight = oElement._iBaseRowHeight;
			oSelectedShape.renderElement(oRm, oSelectedShape);
		}
	};

	/**
	 * @protected
	 */
	BaseConditionalShape.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
		BaseShape.prototype.setProperty.apply(this, arguments);
		if (PROPAGATED_PROPERTIES.indexOf(sPropertyName) >= 0) {
			this.getShapes().forEach(function (oShape) {
				oShape.setProperty(sPropertyName, oValue, bSuppressInvalidate);
			});
		}
		if (sPropertyName === "shapeId") {
			this.getShapes().forEach(function (oShape) {
				var sShapeId = oShape.getShapeId();
				if (!sShapeId) {
					oShape.setProperty(sPropertyName, oValue, bSuppressInvalidate);
				}
			});
		}
	};

	return BaseConditionalShape;
});
