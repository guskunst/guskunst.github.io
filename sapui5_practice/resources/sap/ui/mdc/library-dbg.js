/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

/**
 * Initialization Code and shared classes of library sap.ui.mdc.
 */
sap.ui.define(['sap/ui/mdc/XMLComposite', 'sap/ui/core/util/XMLPreprocessor', 'sap/ui/base/SyncPromise', 'sap/ui/mdc/odata/v4/libraryExtension', 'sap/ui/core/library', 'sap/m/library'	],

	function (XMLComposite, XMLPreprocessor, SyncPromise) {
		"use strict";

		/**
		 * UI5 library: sap.ui.mdc containing controls that can be easily connected to rest service based models providing metadata.
		 *
		 * @namespace
		 * @name sap.ui.mdc
		 * @author SAP SE
		 * @version 1.66.0
		 * @public
		 */

		sap.ui.getCore().initLibrary({
			version: "1.66.0",
			name: "sap.ui.mdc",
			dependencies: ["sap.ui.core", "sap.m"],
			designtime: "sap/ui/mdc/designtime/library.designtime",
			types: [
				"sap.ui.mdc.TableType",
				"sap.ui.mdc.TableP13Mode",
				"sap.ui.mdc.GrowingMode",
				"sap.ui.mdc.RowCountMode",
				"sap.ui.mdc.SelectionMode",
				"sap.ui.mdc.TableRowAction",
				"sap.ui.mdc.FieldDisplay",
				"sap.ui.mdc.EditMode",
				"sap.ui.mdc.FilterExpression",
				"sap.ui.mdc.OutParameterMode"
				],
			interfaces: [],
			controls: [
				"sap.ui.mdc.Chart",
				"sap.ui.mdc.Table",
				"sap.ui.mdc.base.Field",
				"sap.ui.mdc.base.FieldBase",
				"sap.ui.mdc.base.FilterField",
				"sap.ui.mdc.odata.v4.microchart.MicroChart",
				"sap.ui.mdc.base.info.Panel",
				"sap.ui.mdc.base.info.ContactDetails",
				"sap.ui.mdc.base.filterbar.FilterBar"
				],
			elements: [
				"sap.ui.mdc.Column",
				"sap.ui.mdc.CreationRow",
				"sap.ui.mdc.TableTypeBase",
				"sap.ui.mdc.chart.DimensionItem",
				"sap.ui.mdc.chart.MeasureItem",
				"sap.ui.mdc.base.CustomFieldHelp",
				"sap.ui.mdc.base.CustomFieldInfo",
				"sap.ui.mdc.base.FieldHelpBase",
				"sap.ui.mdc.base.FieldInfo",
				"sap.ui.mdc.base.FieldInfoBase",
				"sap.ui.mdc.base.FieldValueHelp",
				"sap.ui.mdc.base.FieldValueHelpContentWrapperBase",
				"sap.ui.mdc.base.FieldValueHelpMTableWrapper",
				"sap.ui.mdc.base.ListFieldHelp",
				"sap.ui.mdc.base.filterbar.FilterItemLayout",
				"sap.ui.mdc.base.info.ContactDetailsAddressItem",
				"sap.ui.mdc.base.info.ContactDetailsEmailItem",
				"sap.ui.mdc.base.info.ContactDetailsItem",
				"sap.ui.mdc.base.info.ContactDetailsPhoneItem",
				"sap.ui.mdc.base.info.ContentHandler",
				"sap.ui.mdc.base.info.LinkHandler",
				"sap.ui.mdc.base.info.LinkItem",
				"sap.ui.mdc.base.info.PanelItem",
				"sap.ui.mdc.base.state.SelectOption",
				"sap.ui.mdc.base.state.UiState",
				"sap.ui.mdc.flp.info.LinkHandler",
				"sap.ui.mdc.base.info.SemanticObjectUnavailableAction",
				"sap.ui.mdc.base.info.SemanticObjectMapping",
				"sap.ui.mdc.base.info.SemanticObjectMappingItem",
				"sap.ui.mdc.base.InParameter",
				"sap.ui.mdc.base.OutParameter"
			],
			extensions: {
				flChangeHandlers: {
					"sap.ui.mdc.Table": "sap/ui/mdc/flexibility/Table",
					"sap.ui.mdc.Chart": "sap/ui/mdc/flexibility/Chart",
//					"sap.ui.mdc.FilterBar": "sap/ui/mdc/internal/filterbar/FilterBar",
					"sap.ui.mdc.base.info.PanelItem": "sap/ui/mdc/flexibility/PanelItem",
					"sap.ui.mdc.base.info.Panel": "sap/ui/mdc/flexibility/Panel",
					"sap.ui.mdc.base.filterbar.FilterBar": "sap/ui/mdc/flexibility/FilterBar"
				}
			},
			noLibraryCSS: false
		});

		/* eslint-disable no-undef */
		/**
		 * The SAPUI5 MDC library. Contains the metadata driven controls and elements.
		 *
		 * @namespace
		 * @alias sap.ui.mdc
		 * @author SAP SE
		 * @version 1.66.0
		 * @public
		 */
		var thisLib = sap.ui.mdc;
		/* eslint-enable no-undef */

		/**
		 * Defines the type of the table.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.58
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.TableType = {
			/**
			 * Grid Table (sap.ui.table.Table) control is used (default)
			 *
			 * @public
			 */
			Table: "Table",
			/**
			 * Responsive Table (sap.m.Table) control is used.
			 *
			 * @public
			 */
			ResponsiveTable: "ResponsiveTable"
		};

		/**
		 * Defines the personalization mode of the table.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.62
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.TableP13nMode = {
			/**
			 * Column personalization is enabled.
			 *
			 * @public
			 */
			Column: "Column",
			/**
			 * Sort personalization is enabled.
			 *
			 * @public
			 */
			Sort: "Sort"
		};

		/**
		 * Defines the growing options of the ResponsiveTable.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.65
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.GrowingMode = {
			/**
			 * Basic growing (growing is set on ResponsiveTable)
			 *
			 * @public
			 */
			Basic: "Basic",
			/**
			 * Growing with scroll (growing & growingScrollToLoad are set on ResponsiveTable)
			 *
			 * @public
			 */
			Scroll: "Scroll"
		};


		/**
		 * Defines the row count mode of the GridTable.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.65
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.RowCountMode = {
			/**
			 * This is same as sap.ui.table.VisibleRowCountMode.Auto.
			 *
			 * @public
			 */
			Auto: "Auto",
			/**
			 * This is same as sap.ui.table.VisibleRowCountMode.Fixed.
			 *
			 * @public
			 */
			Fixed: "Fixed"
		};

		/**
		 * Defines the types of chart actions in the toolbar.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.64
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.ChartToolbarActionType = {
			/**
			 * Zoom in and zoom out action.
			 *
			 * @public
			 */
			ZoomInOut: "ZoomInOut",
			/**
			 * Drill down and up action.
			 *
			 * @public
			 */
			DrillDownUp: "DrillDownUp",
			/**
			 * Legend action.
			 *
			 * @public
			 */
			Legend: "Legend",
			/**
			 * Full screen action.
			 *
			 * @public
			 */
			FullScreen: "FullScreen",
			/**
			 * Personalization of visibility of dimensions and measures.
			 *
			 * @public
			 */
			P13nOfVisibility: "Visibility",
			/**
			 * Sort personalization.
			 *
			 * @public
			 */
			P13nOfSort: "Sort",
			/**
			 * Filter personalization.
			 *
			 * @public
			 */
			P13nOfFilter: "Filter",
			/**
			 * Chart type personalization.
			 *
			 * @public
			 */
			P13nOfChartType: "ChartType"
		};

		/**
		 * Defines the mode of the table.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.58
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.SelectionMode = {
			/**
			 * No rows/items can be selected (Default).
			 * @public
			 */
			None: "None",
			/**
			 * One row/item can be selected at a time.
			 * @public
			 */
			Single: "Single",
			/**
			 * Multiple rows/items can be selected at a time.
			 * @public
			 */
			Multi: "Multi"
		};

		/**
		 * Defines the actions that can be used in the table.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.60
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.RowAction = {
			/**
			 * Navigation arrow (chevron) will be shown in the table rows/items.
			 *
			 * @public
			 */
			Navigation: "Navigation"
		};

		/**
		 * Defines how the fields display text should be formatted.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.48.0
		 */
		thisLib.FieldDisplay = {
			/**
			 * Only the value is displayed
			 * @public
			 */
			Value: "Value",
			/**
			 * Only the description is displayed
			 *
			 * if a <code>FieldHelp</code> is assigned to the <code>Field</code> the value is used as key for the <code>FieldHelp</code> items.
			 * @public
			 */
			Description: "Description",
			/**
			 * The value and the description is displayed in the field. The description is displayed after the value with brackets.
			 * @public
			 */
			ValueDescription: "ValueDescription",
			/**
			 * The description and the value is displayed in the field. The value is displayed after the description with brackets.
			 * @public
			 */
			DescriptionValue: "DescriptionValue"
		};

		/**
		 * Defines in what mode Fields are rendered
		 *
		 * @enum {string}
		 * @private
		 * @since 1.48.1
		 */
		thisLib.EditMode = {
			/**
			 * Field is rendered in display mode
			 * @public
			 */
			Display: "Display",
			/**
			 * Field is rendered editable
			 * @public
			 */
			Editable: "Editable",
			/**
			 * Field is rendered readonly
			 * @public
			 */
			ReadOnly: "ReadOnly",
			/**
			 * Field is rendered disabled
			 * @public
			 */
			Disabled: "Disabled"
		};

		/**
		 * Defines the filter expression types.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.61
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.FilterExpression = {
			/**
			 * Single interval value.
			 * @public
			 */
			Interval : "Interval",
			/**
			 * Single value.
			 * @public
			 */
			Single : "Single",
			/**
			 * Multiple value
			 * @public
			 */
			Multi : "Multi"
		};

		/**
		 * Defines the mode of the out-parameter
		 *
		 * @enum {string}
		 * @private
		 * @since 1.66.0
		 */
		thisLib.OutParameterMode = {
			/**
			 * The value in the out-parameter is always set
			 * @public
			 */
			Always: "Always",
			/**
			 * The value in the out-parameter is only set if it is empty before
			 * @public
			 */
			WhenEmpty: "WhenEmpty"
		};

		thisLib.ChartItemType = {
			/**
			 * Dimension Item
			 * @public
			 */
			Dimension: "Dimension",
			/**
			 * Measure Item
			 * @public
			 */
			Measure: "Measure"
		};

		thisLib.ChartItemRoleType = {
			/**
			 * All dimensions with role "category" are assigned to the feed uid "categoryAxis".
			 *
			 * <b>NOTE:</b> If the chart type requires at least one dimension on the feed "categoryAxis" (true for all chart types except pie and donut), but no dimension has the role "category" or "category2", then the first visible dimension is assigned to the "categoryAxis".
			 *
			 * @public
			 */
			category: "category",
			/**
			 * All dimensions with role "series" are assigned to the feed uid "color".
			 * @public
			 */
			series: "series",
			/**
			 * If a chart type does not use the feed uid "categoryAxis2", then all dimensions with role "category2" are treated as dimension with role "category" (appended).
			 * @public
			 */
			category2: "category2",
			/**
			 * General Rules for all chart types
			 * <ol>
			 *   <li>All measures with role "axis1" are assigned to feed uid "valueaxis". All measures with role "axis2" are assigned to feed uid "valueaxis2". All measures with role "axis3" are assigned to feed uid "bubbleWidth".</li>
			 *   <li>If a chart type does not use the feed uid "valueaxis2", then all measures with role "axis2" are treated as measures with role "axis1".</li>
			 *   <li>If a chart type requires at least 1 measure on the feed uid "valueaxis" (true for all non-"dual" chart types), but there is no measure with role "axis1", then the first measure with role "axis2" is assigned to feed uid "valueaxis"</li>
			 *   <li>If the chart type requires at least one measure on the feed uid "valueaxis2" (true for all "dual" chart types"), but there is no measure with role "axis2", then the first measure with role "axis3" or "axis4" or (if not exists) the last measure with role "axis1" is assigned to feed uid "valueaxis2".</li>
			 * </ol>
			 * @public
			 */
			axis1: "axis1",
			/**
			 * Measures with role "axis2" are assigned to feed uid "valueaxis2" if used.
			 * If a chart type does not use the feed uid "bubbleWidth" (true for all chart types except bubble and radar), then all measures with role "axis3" or "axis4" are treated as measures with role "axis2".
			 * @public
			 */
			axis2: "axis2",
			/**
			 * Measures with role "axis3" are assigned to feed uid "bubbleWidth" if used.
			 * @public
			 */
			axis3: "axis3"
		};
		/**
		 * Defines supported address types in ContactDetails control.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.64
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.ContactDetailsAddressType = {
			work: "work",
			home: "home",
			preferred: "preferred"
		};
		/**
		 * Defines supported email types in ContactDetails control.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.64
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.ContactDetailsEmailType = {
			work: "work",
			home: "home",
			preferred: "preferred"
		};
		/**
		 * Defines supported phone types in ContactDetails control.
		 *
		 * @enum {string}
		 * @private
		 * @since 1.64
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		thisLib.ContactDetailsPhoneType = {
			work: "work",
			home: "home",
			cell: "cell",
			fax: "fax",
			preferred: "preferred"
		};
		/**
		 * Metadata Context will appear as a binding to visitAttributes as it starts with
		 * '{' (curly braces). So we need to hide this for the preprocessor, take metadataContext
		 * out here, before visitAttributes and add it after
		 *
		 * @param {object} oNode the node
		 * @param {object} oVisitor the visitor
		 * @returns {object} SyncPromise
		 */
		function visitAttibutesIgnoringMetadataContext(oNode, oVisitor) {
			var vValue = oNode.getAttribute('metadataContexts');
			if (vValue) {
				oNode.removeAttribute('metadataContexts');
			}
			return SyncPromise.resolve(oVisitor.visitAttributes(oNode))
				.then(function () {
					if (vValue) {
						oNode.setAttribute('metadataContexts', vValue);
					}
				});
		}

		/**
		 * Convenience function for registration of the controls to the XMLPreprocessor
		 *
		 * This function is called by the XMLPreprocessor. 'this' is used to remember
		 * the name of the control. So always create a new function via bind("name.of.control")
		 * @param {object} oNode the node
		 * @param {object} oVisitor the visitor
		 * @returns {object|undefined} SyncPromise or undefined
		 */
		function pluginTemplate(oNode, oVisitor) {
			var that = this, oPromise = visitAttibutesIgnoringMetadataContext(oNode, oVisitor)
				.then(function () {
					return XMLComposite.initialTemplating(oNode, oVisitor, that);
				})
				.then(function () {
					//TODO: metadataContext shouldn't remain after templating. Maybe something for XMLComposite
					oNode.removeAttribute('metadataContexts');
				});
			return oVisitor.find ? oPromise : undefined;
		}

		function replacePlugin(oNode, oVisitor) {
			var sourceElementPath = oNode.getAttribute('withChildrenOf'),
				aContent = sourceElementPath && oVisitor.getContext(sourceElementPath).getObject().oModel.oData.children,
				oParent = oNode.parentElement;
			// move all content elements to the parent
			for (var i = aContent.length; i > 0; i--) {
				oParent.appendChild(aContent[i - 1]);
			}
			// remove the "Replace" element
			oParent.removeChild(oNode);
			//in case of a promise the children are perhaps not visited
			return oVisitor.find ? SyncPromise.resolve() : undefined;
		}

		XMLPreprocessor.plugIn(pluginTemplate.bind("sap.ui.mdc.odata.v4.microchart.MicroChart"), "sap.ui.mdc.odata.v4.microchart", "MicroChart");
		XMLPreprocessor.plugIn(replacePlugin, "sap.ui.mdc", "Replace");

		return thisLib;

	});
