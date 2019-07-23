/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'./FieldValueHelpContentWrapperBase',
	'sap/ui/model/ChangeReason',
	'sap/ui/base/ManagedObjectObserver',
	'sap/base/strings/capitalize',
	'sap/m/library',
	'sap/base/util/deepEqual',
	'sap/base/Log'
	], function(
			FieldValueHelpContentWrapperBase,
			ChangeReason,
			ManagedObjectObserver,
			capitalize,
			mLibrary,
			deepEqual,
			Log
	) {
	"use strict";

	var ListMode = mLibrary.ListMode;
	var ScrollContainer;

	/**
	 * Constructor for a new FieldValueHelpMTableWrapper.
	 *
	 * The <code>FieldValueHelp</code> supports different types of content. This is a wrapper to use a
	 * <code>sap.m.Table</code> control as content.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Wrapper to use a <code>sap.m.Table</code> control as content of a <code>FieldValueHelp</code>
	 * @extends sap.ui.mdc.base.FieldValueHelpContentWrapperBase
	 * @version 1.66.0
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.FieldValueHelpMTableWrapper
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldValueHelpMTableWrapper = FieldValueHelpContentWrapperBase.extend("sap.ui.mdc.base.FieldValueHelpMTableWrapper", /** @lends sap.ui.mdc.base.FieldValueHelpMTableWrapper.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
				/**
				 * table of the Field help
				 *
				 * As the <code>FieldValueHelp</code> can not know the semantic of the items,
				 * the caller is responsible for the item handling.
				 * The items must be active to allow interaction and selection.
				 *
				 * If no <code>keyPath</code> or <code>descriptionPath</code> is specified on the <code>FieldValueHelp</code>
				 * and the table has no paging, uses <code>ColumnListItem</code> as item and the first column
				 * holds the key and the second column the description, using a <code>Text</code> control, this can be handled automatically.
				 * For everything else the application has to implement the logic.
				 *
				 */
				table: {
					type: "sap.m.Table",
					multiple: false
				}
			},
			defaultAggregation: "table",
			events: {
				/**
				 * This event is fired when the data of the FieldHelp has changed
				 *
				 * This is needed to determine the text of a key
				 *
				 * <b>Note:</b> This event must only be handled by the control the <code>FieldHelp</code>
				 * belongs to, not by the application.
				 */
				dataUpdate: {
				}
			}
		}
	});

	FieldValueHelpMTableWrapper.prototype.init = function() {

		FieldValueHelpContentWrapperBase.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["selectedItems"],
			aggregations: ["table"]
		});

	};

	FieldValueHelpMTableWrapper.prototype.exit = function() {

		FieldValueHelpContentWrapperBase.prototype.exit.apply(this, arguments);

		if (this._oScrollContainer) {
			this._oScrollContainer.destroy();
			delete this._oScrollContainer;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	FieldValueHelpMTableWrapper.prototype.invalidate = function(oOrigin) {

		if (oOrigin) {
			var oTable = this.getTable();
			if (oTable && oOrigin === oTable) {
				if (oOrigin.bOutput && !this._bIsBeingDestroyed) {
					// Table changed but no UiArea found, this should not happen.
					// now invalidate parent to trigger re-rendering somehow.
					var oParent = this.getParent();
					if (oParent) {
						oParent.invalidate(this);
					}
				}
				return;
			}
		}

		FieldValueHelpContentWrapperBase.prototype.invalidate.apply(this, arguments);

	};

	FieldValueHelpMTableWrapper.prototype.initialize = function(bSuggestion) {

		if (bSuggestion || this._oScrollContainer) {
			return this;
		}

		if (!ScrollContainer && !this._bScrollContainerRequested) {
			ScrollContainer = sap.ui.require("sap/m/ScrollContainer");
			if (!ScrollContainer) {
				sap.ui.require(["sap/m/ScrollContainer"], _ScrollContainerLoaded.bind(this));
				this._bScrollContainerRequested = true;
			}
		}
		if (ScrollContainer && !this._bScrollContainerRequested) {
			this._oScrollContainer = new ScrollContainer(this.getId() + "-SC", {
				height: "100%",
				width: "100%",
				vertical: true
			});

			this._oScrollContainer._oWrapper = this;
			this._oScrollContainer.getContent = function() {
				var aContent = [];
				var oTable = this._oWrapper && this._oWrapper.getTable();
				if (oTable) {
					aContent.push(oTable);
				}
				return aContent;
			};
		}

		return this;

	};

	function _ScrollContainerLoaded(fnScrollContainer) {

		ScrollContainer = fnScrollContainer;
		this._bScrollContainerRequested = false;

		if (!this._bIsBeingDestroyed) {
			this.initialize();
			this.fireDataUpdate({contentChange: true});
		}

	}

	FieldValueHelpMTableWrapper.prototype.getDialogContent = function() {

		return this._oScrollContainer;

	};

	FieldValueHelpMTableWrapper.prototype.getSuggestionContent = function() {

		return this.getTable();

	};

	FieldValueHelpMTableWrapper.prototype.fieldHelpOpen = function(bSuggestion) {

		FieldValueHelpContentWrapperBase.prototype.fieldHelpOpen.apply(this, arguments);

		var oTable = this.getTable();
		if (oTable) {
			_adjustTable.call(this, oTable, bSuggestion);
			_updateSelectedItems.call(this); // as selection mode might be changed
			if (bSuggestion) {
				var oSelectedItem = oTable.getSelectedItem();
				if (oSelectedItem && oSelectedItem.getDomRef()) {
					oSelectedItem.getDomRef().scrollIntoView();
				}
			}
		}

		return this;

	};

	FieldValueHelpMTableWrapper.prototype.navigate = function(iStep) {

		var oTable = this.getTable();

		if (!_checkTableReady(oTable)) {
			// Table not assigned right now
			this._bNavigate = true;
			this._iStep = iStep;
			return;
		}

		var oSelectedItem = oTable.getSelectedItem();
		var aItems = oTable.getItems();
		var iItems = aItems.length;
		var iSelectedIndex = 0;

		if (oSelectedItem) {
			iSelectedIndex = oTable.indexOfItem(oSelectedItem);
			iSelectedIndex = iSelectedIndex + iStep;
		} else if (iStep >= 0){
			iSelectedIndex = iStep - 1;
		} else {
			iSelectedIndex = iItems + iStep;
		}

		if (iSelectedIndex < 0) {
			iSelectedIndex = 0;
		} else if (iSelectedIndex >= iItems - 1) {
			iSelectedIndex = iItems - 1;
		}

		var oItem = aItems[iSelectedIndex];
		if (oItem && oItem !== oSelectedItem) {
			oItem.setSelected(true);
			var oValue = _getDataFromItem.call(this, oItem);

			if (oItem.getDomRef()) {
				oItem.getDomRef().scrollIntoView();
			}

			this._bNoTableUpdate = true;
			this.setSelectedItems([{key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters}]);
			this._bNoTableUpdate = false;
			this.fireNavigate({key: oValue.key, description: oValue.description, inParameters: oValue.inParameters, outParameters: oValue.outParameters});
		}

	};

	FieldValueHelpMTableWrapper.prototype.getTextForKey = function(vKey, oInParameters, oOutParameters) {

		var sText = "";
		var oTable = this.getTable();
		if (_checkTableReady(oTable)) {
			var aItems = oTable.getItems();
			var aInParameters;
			var aOutParameters;

			if (oInParameters) {
				// in-parameters of key might be different as global set on FieldHelp. So use only the needed ones for check
				aInParameters = [];
				for ( var sInParameter in oInParameters) {
					aInParameters.push(sInParameter);
				}
			}

			if (oOutParameters) {
				// out-parameters of key might be different as global set on FieldHelp. So use only the needed ones for check
				aOutParameters = [];
				for ( var sOutParameter in oOutParameters) {
					aOutParameters.push(sOutParameter);
				}
			}

			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i];
				var oValue = _getDataFromItem.call(this, oItem, aInParameters, aOutParameters);
				if (oValue.key === vKey
						&& (!oValue.inParameters || !oInParameters || deepEqual(oInParameters, oValue.inParameters))
						&& (!oValue.outParameters || !oOutParameters || deepEqual(oOutParameters, oValue.outParameters))) {
					sText = oValue.description;
					break;
				}
			}
		}

		return sText;

	};

	FieldValueHelpMTableWrapper.prototype.getKeyForText = function(sText) {

		var vKey;
		var oTable = this.getTable();
		if (_checkTableReady(oTable)) {
			var aItems = oTable.getItems();
			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i];
				var oValue = _getDataFromItem.call(this, oItem);
				if (oValue.description === sText) {
					vKey = oValue.key;
					break;
				}
			}
		}

		return vKey;

	};

	FieldValueHelpMTableWrapper.prototype.getListBinding = function() {

		var oTable = this.getTable();
		var oListBinding;
		if (oTable) {
			oListBinding = oTable.getBinding("items");
		}

		return oListBinding;

	};


	FieldValueHelpMTableWrapper.prototype.clone = function(sIdSuffix, aLocalIds) {

		// detach event handler before cloning to not have it twice on the clone
		// attach it after clone again
		var oTable = this.getTable();

		if (oTable) {
			oTable.detachEvent("itemPress", _handleItemPress, this);
			oTable.detachEvent("selectionChange", _handleSelectionChange, this);
			oTable.detachEvent("updateFinished", _handleUpdateFinished, this);
		}

		var oClone = FieldValueHelpContentWrapperBase.prototype.clone.apply(this, arguments);

		if (oTable) {
			oTable.attachEvent("itemPress", _handleItemPress, this);
			oTable.attachEvent("selectionChange", _handleSelectionChange, this);
			oTable.attachEvent("updateFinished", _handleUpdateFinished, this);
		}

		return oClone;

	};

	function _observeChanges(oChanges) {

		if (oChanges.name === "table") {
			_tableChanged.call(this, oChanges.mutation, oChanges.child);
		}

		if (oChanges.name === "selectedItems") {
			_updateSelectedItems.call(this);
		}

	}

	function _tableChanged(sMutation, oTable) {

		if (sMutation === "remove") {
			oTable.detachEvent("itemPress", _handleItemPress, this);
			oTable.detachEvent("selectionChange", _handleSelectionChange, this);
			oTable.detachEvent("updateFinished", _handleUpdateFinished, this);
			oTable = undefined;
		} else {
			oTable.setMode(ListMode.SingleSelectMaster); // to allow selection before opening
			oTable.setRememberSelections(false);
			oTable.attachEvent("itemPress", _handleItemPress, this);
			oTable.attachEvent("selectionChange", _handleSelectionChange, this);
			oTable.attachEvent("updateFinished", _handleUpdateFinished, this);
			_adjustTable.call(this, oTable, this._bSuggestion);
			_updateSelectedItems.call(this);

			if (this._bNavigate) {
				this._bNavigate = false;
				this.navigate(this._iStep);
			}
		}

		this.fireDataUpdate({contentChange: true});

	}

	function _adjustTable(oTable, bSuggestion) {

		if (oTable && this.getParent()) { // only possible if assigned to a FieldValueHelp
			if (bSuggestion) {
				if (this._sTableWidth) {
					oTable.setWidth(this._sTableWidth); // TODO
				}
				oTable.setMode(ListMode.SingleSelectMaster);
			} else {
				if (oTable.getWidth() !== "100%") {
					this._sTableWidth = oTable.getWidth();
					oTable.setWidth("100%"); // TODO
				}
				if (this._getMaxConditions() === 1) {
					oTable.setMode(ListMode.SingleSelectLeft);
				} else {
					oTable.setMode(ListMode.MultiSelect);
				}
			}
		}

	}

	function _handleItemPress(oEvent) {

		var oItem = oEvent.getParameter("listItem");

		if (!this._bSuggestion) {
			// in Dialog mode select item
			oItem.setSelected(!oItem.getSelected());
		}

		_fireSelectionChange.call(this);

	}

	function _handleSelectionChange(oEvent) {

		if (!this._bSuggestion) {
			// suggestion handled in _handleItemPress
			_fireSelectionChange.call(this);
		}

	}

	function _fireSelectionChange() {

		var aItems = [];
		var oTable = this.getTable();
		if (oTable) {
			// first add all already selected items that are not in the table right now (because of filtering)
			var aSelectedItems = this.getSelectedItems();
			var aTableItems = oTable.getItems();
			var i = 0;
			var oItem;
			var oValue;
			if (aSelectedItems.length > 0) {
				for (i = 0; i < aTableItems.length; i++) {
					oItem = aTableItems[i];
					oValue = _getDataFromItem.call(this, oItem);

					if (!oValue) {
						throw new Error("Key of item cannot be determined" + this);
					}
					for (var j = aSelectedItems.length - 1; j >= 0; j--) {
						var oSelectedItem = aSelectedItems[j];
						if (oSelectedItem.key === oValue.key
							&& (!oValue.inParameters || !oSelectedItem.inParameters || deepEqual(oSelectedItem.inParameters, oValue.inParameters))
							&& (!oValue.outParameters || !oSelectedItem.outParameters || deepEqual(oSelectedItem.outParameters, oValue.outParameters))) {
							aSelectedItems.splice(j, 1);
							break;
						}
					}
				}
			}

			if (aSelectedItems.length > 0) {
				aItems = aSelectedItems;
			}

			// now add all currently selected items
			aSelectedItems = oTable.getSelectedItems();
			for (i = 0; i < aSelectedItems.length; i++) {
				oItem = aSelectedItems[i];
				oValue = _getDataFromItem.call(this, oItem);

				if (!oValue) {
					throw new Error("Key of item cannot be determined" + this);
				}

				aItems.push({
					key: oValue.key,
					description: oValue.description,
					inParameters: oValue.inParameters,
					outParameters: oValue.outParameters
				});
			}

		}

		this._bNoTableUpdate = true;
		this.setSelectedItems(aItems);
		this._bNoTableUpdate = false;
		this.fireSelectionChange({selectedItems: aItems});

	}

	function _handleUpdateFinished(oEvent) {

		if (!this.getParent()) {
			// if wrapper is not assigned to a FieldValueHelp the selection can not be updated, must be done if assigned
			return;
		}

		_updateSelectedItems.call(this);

		if (this._bNavigate) {
			this._bNavigate = false;
			this.navigate(this._iStep);
		}

// TODO: activate Filter condition after async-parsing change is done as then getTextForKey do not run on filtered items.
//		if (oEvent.getParameter("reason") !== capitalize(ChangeReason.Filter)) {
			this.fireDataUpdate({contentChange: false});
//		}

	}

	function _updateSelectedItems() {

		if (this._bNoTableUpdate) {
			return;
		}

		var oTable = this.getTable();
		if (_checkTableReady(oTable)) {
			var aSelectedItems = this.getSelectedItems();
			var aItems = oTable.getItems();
			for (var j = 0; j < aItems.length; j++) {
				var oItem = aItems[j];
				var bSelected = false;
				if (aSelectedItems.length > 0) {
					var oValue = _getDataFromItem.call(this, oItem);
					for (var i = 0; i < aSelectedItems.length; i++) {
						var oSelectedItem = aSelectedItems[i];
						if (oValue.key === oSelectedItem.key
								&& (!oValue.inParameters || !oSelectedItem.inParameters || deepEqual(oSelectedItem.inParameters, oValue.inParameters))
								&& (!oValue.outParameters || !oSelectedItem.outParameters || deepEqual(oSelectedItem.outParameters, oValue.outParameters))) {
							bSelected = true;
							break;
						}
					}
				}
				if (oItem.getSelected() !== bSelected) {
					oItem.setSelected(bSelected);
				}
			}
		}

	}

	function _getDataFromItem(oItem, aInParameters, aOutParameters) {

		var oValue;
		var oBindingContext = oItem.getBindingContext();

		if (oBindingContext) {
			oValue = _getDataFromContext.call(this, oBindingContext, aInParameters, aOutParameters);
		}

		if (!oValue) {
			// try to get from item
			var sKeyPath = this._getKeyPath();
			var vKey;
			var sDescription;

			if (!sKeyPath && oItem.getCells) {
				var aCells = oItem.getCells();
				if (aCells.length > 0 && aCells[0].getText) {
					vKey = aCells[0].getText();
				}
				if (aCells.length > 1 && aCells[1].getText) {
					sDescription = aCells[1].getText();
				}
				if (vKey !== undefined) {
					oValue = {key: vKey, description: sDescription};
				}
			}
		}

		if (!oValue) {
			throw new Error("Key could not be determined from item " + this);
		}

		return oValue;

	}

	function _getDataFromContext(oBindingContext, aInParameters, aOutParameters) {

		var sKeyPath = this._getKeyPath();
		var sDescriptionPath = this._getDescriptionPath();
		var oDataModelRow = oBindingContext.getObject();
		var vKey;
		var sDescription;

		if (!aInParameters) {
			aInParameters = this._getInParameters();
		}
		if (!aOutParameters) {
			aOutParameters = this._getOutParameters();
		}
		var oInParameters = aInParameters.length > 0 ? {} : null;
		var oOutParameters = aOutParameters.length > 0 ? {} : null;
		var sPath;

		if (oDataModelRow) {
			if (sKeyPath && oDataModelRow.hasOwnProperty(sKeyPath)) {
				vKey = oDataModelRow[sKeyPath];
			}
			if (sDescriptionPath && oDataModelRow.hasOwnProperty(sDescriptionPath)) {
				sDescription = oDataModelRow[sDescriptionPath];
			}
			for (var i = 0; i < aInParameters.length; i++) {
				sPath = aInParameters[i];
				if (oDataModelRow.hasOwnProperty(sPath)) {
					oInParameters[sPath] = oDataModelRow[sPath];
				}
			}
			for (var i = 0; i < aOutParameters.length; i++) {
				sPath = aOutParameters[i];
				if (oDataModelRow.hasOwnProperty(sPath)) {
					oOutParameters[sPath] = oDataModelRow[sPath];
				} else {
					Log.error("FieldValueHelpMTableWrapper", "cannot find out-parameter '" + sPath + "' in item data!");
				}
			}
		}

		if (!vKey) {
			return false;
		}

		return {key: vKey, description: sDescription, inParameters: oInParameters, outParameters: oOutParameters};

	}

	function _checkTableReady(oTable) {

		if (!oTable) {
			return false;
		}

		var oBinding = oTable.getBinding("items");
		if (oBinding && (oBinding.isSuspended() || oBinding.getLength() === 0)) {
			return false; // if no context exist, Table is not ready
		}

		return true;

	}

	return FieldValueHelpMTableWrapper;

}, /* bExport= */true);
