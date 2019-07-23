/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.table.CreationRow.
sap.ui.define([
	"./CreationRowRenderer",
	"./Column",
	"./TableUtils",
	"sap/ui/core/Control",
	"sap/m/library",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button"
], function(Renderer, Column, TableUtils, Control, MLibrary, OverflowToolbar, ToolbarSpacer, Button) {
	"use strict";

	/**
	 * Constructor for a new CreationRow.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Allows to enter data in a row shaped form, if placed inside a {@link sap.ui.table.Table}.
	 * The form elements (<code>cells</code> aggregation) are aligned with the columns of the table, and are created automatically based on the
	 * {@link sap.ui.table.Column#getCreationTemplate creationTemplate} aggregation of the {@link sap.ui.table.Column}.
	 *
	 * <b>Note:</b> This control is compatible only with the <code>sap.m</code> library. Do not use it together with the
	 * <code>sap.ui.commons</code> library.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version 1.66.0
	 *
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @alias sap.ui.table.CreationRow
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CreationRow = Control.extend("sap.ui.table.CreationRow", /** @lends sap.ui.table.CreationRow.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * If set to <code>false</code>, the {@link #event:apply apply} event is not fired. The corresponding keyboard shortcut and the
				 * apply button of the default toolbar are disabled.
				 */
				applyEnabled: {type: "boolean", group: "Behavior", defaultValue: true}
			},
			aggregations: {
				/**
				 * The actual cells are a table-internal construct. The controls in this aggregation are the content of the cells.
				 * This aggregation is managed by the table and must not be manipulated. Only read access is allowed.
				 */
				cells: {type: "sap.ui.core.Control", multiple: true, singularName: "cell"},

				/**
				 * The toolbar that is placed below the form.
				 * If no toolbar is set, a default toolbar is created. Basic buttons and functionality are provided only in the default toolbar.
				 */
				toolbar: {type: "sap.ui.core.Toolbar", multiple: false}
			},
			events: {
				/**
				 * Fired when the corresponding keyboard shortcut or the apply button of the default toolbar are pressed.
				 */
				apply: {
					allowPreventDefault: true
				}
			}
		}
	});

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	CreationRow.prototype.setApplyEnabled = function(bEnabled) {
		this.setProperty("applyEnabled", bEnabled, true);
		this._updateDefaultToolbar();
		return this;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	CreationRow.prototype.setParent = function(oParent) {
		Control.prototype.setParent.apply(this, arguments);
		this._update();
		return this;
	};

	/**
	 * Sets the focus to the first editable form element.
	 *
	 * @return {boolean} Whether the focus was set
	 * @public
	 */
	CreationRow.prototype.resetFocus = function() {
		var oInteractiveElement = this._getFirstInteractiveElement();

		if (oInteractiveElement) {
			oInteractiveElement.focus();
			TableUtils.selectElementText(oInteractiveElement);
			return true;
		}

		return false;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	CreationRow.prototype.getFocusDomRef = function() {
		var oInteractiveElement = this._getFirstInteractiveElement();

		if (oInteractiveElement) {
			return oInteractiveElement;
		}

		return Control.prototype.getFocusDomRef.apply(this, arguments);
	};

	/**
	 * Fires the apply event and resets the focus, if the default action was not prevented.
	 *
	 * @returns {boolean} Whether the focus was set or not.
	 * @private
	 */
	CreationRow.prototype._fireApply = function() {
		var bFocusSet = false;

		if (this.fireApply()) {
			bFocusSet = this.resetFocus();
		}

		return bFocusSet;
	};

	CreationRow.prototype.onkeydown = function(oEvent) {
		// TODO: don't hardcode keycodes. maybe move #isKeyCombination of keyboard delegate to utils and use that.
		if (this.getApplyEnabled() && oEvent.ctrlKey && oEvent.keyCode === 13 /* Enter */) {
			// The FocusHandler triggers the "sapfocusleave" event in a timeout of 0ms after a blur event. To give the control in the cell
			// enough time to react to the "sapfocusleave" event (e.g. sap.m.Input - changes its value), the "apply" event is fired asynchronously.
			var oFocusedElement = document.activeElement;

			oFocusedElement.blur();

			window.setTimeout(function() {
				if (!this._fireApply()) {
					oFocusedElement.focus();
				}
			}.bind(this), 0);
		}
	};

	/**
	 * Creates a default toolbar providing basic buttons and functionality.
	 *
	 * @param {sap.ui.table.CreationRow} oCreationRow The creation row to get the settings for the toolbar creation from.
	 * @returns {sap.m.OverflowToolbar} The default toolbar.
	 */
	function createDefaultToolbar(oCreationRow) {
		return new OverflowToolbar({
			content: [
				new ToolbarSpacer(),
				new Button({
					text: TableUtils.getResourceText("TBL_CREATIONROW_APPLY"),
					type: MLibrary.ButtonType.Emphasized,
					enabled: oCreationRow.getApplyEnabled(),
					press: function() {
						oCreationRow._fireApply();
					}
				})
			],
			style: MLibrary.ToolbarStyle.Clear,
			ariaLabelledBy: [oCreationRow.getId() + "-label"]
		});
	}

	/**
	 * Gets either the toolbar or the default toolbar if none is set.
	 *
	 * @returns {sap.ui.core.Toolbar} The toolbar that should be used in the <code>CreationRow</code>.
	 * @private
	 */
	CreationRow.prototype._getToolbar = function() {
		var oToolbar = this.getToolbar();

		if (!oToolbar) {
			if (!this._oDefaultToolbar) {
				this._oDefaultToolbar = createDefaultToolbar(this);
				this.addDependent(this._oDefaultToolbar);
			}

			oToolbar = this._oDefaultToolbar;

			if (oToolbar.data("sap-ui-invalid")) {
				this._updateDefaultToolbar();
			}
		}

		return oToolbar;
	};

	/**
	 * Updates the default toolbar. For example, the enabled state of the apply button is updated according to the <code>applyEnabled</code>
	 * property value.
	 * If a toolbar is set, the default toolbar is not updated, but just marked as "invalid". It will then be updated the next time
	 * the default toolbar will be returned by {@link #_getToolbar}.
	 *
	 * @private
	 */
	CreationRow.prototype._updateDefaultToolbar = function() {
		if (this.getToolbar()) {
			// No need to update the default toolbar if a custom toolbar is used.
			if (this._oDefaultToolbar) {
				this._oDefaultToolbar.data("sap-ui-invalid", true);
			}
			return;
		}

		if (!this._oDefaultToolbar) {
			return;
		}

		var oApplyButton = this._oDefaultToolbar.getContent()[1];

		oApplyButton.setEnabled(this.getApplyEnabled());
		this._oDefaultToolbar.data("sap-ui-invalid", null);
	};

	/**
	 * Gets the first interactive (editable) form element.
	 *
	 * @return {HTMLElement|null} The first interactive DOM element.
	 * @private
	 */
	CreationRow.prototype._getFirstInteractiveElement = function() {
		var aCells = this.getCells();

		for (var i = 0; i < aCells.length; i++) {
			var oCellContent = aCells[i].getDomRef();
			var $Cell = TableUtils.getCell(this._getTable(), oCellContent, true);
			var $InteractiveElements = TableUtils.getInteractiveElements($Cell);

			if ($InteractiveElements) {
				return $InteractiveElements[0];
			}
		}

		return null;
	};

	/**
	 * Gets the cell control of the corresponding column.
	 *
	 * @param {int} iColumnIndex The index of the column in the table's columns aggregation.
	 * @return {sap.ui.core.Control|null} The cell control.
	 * @private
	 */
	CreationRow.prototype._getCell = function(iColumnIndex) {
		var aCells = this.getCells();
		var oCell = aCells.filter(function(oCell) {
			return Column.ofCell(oCell).getIndex() === iColumnIndex;
		})[0];

		if (!oCell) {
			return null;
		}

		return oCell;
	};

	/**
	 * Gets the cell DOM element of the corresponding column.
	 *
	 * @param {int} iColumnIndex The index of the column in the table's columns aggregation.
	 * @return {HTMLElement|null} The cell DOM element.
	 * @private
	 */
	CreationRow.prototype._getCellDomRef = function(iColumnIndex) {
		var oCell = this._getCell(iColumnIndex);
		var oCellContent = oCell ? oCell.getDomRef() : null;
		var $Cell = TableUtils.getCell(this._getTable(), oCellContent, true);

		if (!$Cell) {
			return null;
		}

		return $Cell;
	};

	/**
	 * Focuses the first interactive element in a cell of the corresponding column.
	 * If the cell has no interactive elements, the focus will not be set.
	 *
	 * @param {int} iColumnIndex The index of the column in the table's columns aggregation.
	 * @return {boolean} Whether the focus was set.
	 * @private
	 */
	CreationRow.prototype._focusCell = function(iColumnIndex) {
		var oCellDomRef = this._getCellDomRef(iColumnIndex);
		var $InteractiveElements = TableUtils.getInteractiveElements(oCellDomRef);

		if ($InteractiveElements) {
			$InteractiveElements[0].focus();
			TableUtils.selectElementText($InteractiveElements[0]);
			return true;
		}

		return false;
	};

	/**
	 * The row takes over keyboard handling within the table.
	 *
	 * @param {jQuery.Event} [oEvent] The event object, if the keyboard handling takeover is triggered by an event.
	 * @return {boolean} Whether the keyboard handling was taken over.
	 * @private
	 */
	CreationRow.prototype._takeOverKeyboardHandling = function(oEvent) {
		var oTable = this._getTable();
		var oTableDomRef = oTable ? oTable.getDomRef() : null;

		if (!oTableDomRef || !oTableDomRef.contains(document.activeElement)) {
			// Keyboard handling will not be taken over if the table is not rendered or the focus is not inside the table.
			return false;
		}

		var oCell = TableUtils.getCell(this._getTable(), document.activeElement);
		var oCellInfo = TableUtils.getCellInfo(oCell);
		var bFocusSet = false;

		if (oCellInfo.columnIndex != null && oCellInfo.columnIndex >= 0) {
			// If the currently focused element is a table cell with a column index information, the keyboard handling will only be taken over if the
			// cell of the corresponding column in this row contains an interactive element.
			bFocusSet = this._focusCell(oCellInfo.columnIndex);
		} else {
			bFocusSet = this.resetFocus();
		}

		if (bFocusSet && oEvent) {
			oEvent.preventDefault(); // Prevent positioning the cursor. The text should be selected instead.
		}

		return bFocusSet; // The keyboard handling is only taken over if the focus was set into the CreationRow.
	};

	/**
	 * Updates the row (e.g. the cells) based on the configuration of the table this row is inside.
	 *
	 * @private
	 */
	CreationRow.prototype._update = function() {
		var oTable = this._getTable();

		if (!oTable) {
			this.removeAllCells();
			return;
		}

		var aColumns = oTable.getColumns();

		this.removeAllCells();

		for (var i = 0, l = aColumns.length; i < l; i++) {
			if (aColumns[i].getVisible()) {
				this.addCell(aColumns[i].getTemplateClone(i, "Creation"));
			}
		}
	};

	/**
	 * Gets the table this row is inside.
	 *
	 * @return {sap.ui.table.Table|null} The instance of the table or <code>null</code>, if this row is not inside a table.
	 * @private
	 */
	CreationRow.prototype._getTable = function() {
		var oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Table") ? oParent : null;
	};

	return CreationRow;
});