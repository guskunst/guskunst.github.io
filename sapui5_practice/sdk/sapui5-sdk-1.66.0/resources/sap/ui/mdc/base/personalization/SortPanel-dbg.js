/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/XMLComposite', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/ui/base/ManagedObjectObserver', 'sap/base/Log', 'sap/ui/Device', 'sap/ui/model/json/JSONModel', 'sap/ui/core/ResizeHandler'
], function (XMLComposite, Filter, FilterOperator, ManagedObjectObserver, Log, Device, JSONModel, ResizeHandler) {
	"use strict";

	/**
	 * Constructor for a new SortPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>SortPanel</code> control is used to define personalization settings for sorting.
	 * @extends sap.ui.mdc.XMLComposite
	 * @author SAP SE
	 * @version 1.66.0
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.personalization.SortPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SortPanel = XMLComposite.extend("sap.ui.mdc.base.personalization.SortPanel", /** @lends sap.ui.mdc.base.personalization.SortPanel.prototype */
		{
			metadata: {
				library: "sap.ui.mdc",
				properties: {
					/**
					 * Determines whether the Reset button is shown inside the dialog. If a user clicks the Reset button, the <code>SortPanel</code> control
					 * fires the <code>reset</code> event.
					 */
					showReset: {
						type: "boolean",
						defaultValue: false,
						invalidate: true
					},

					/**
					 * Determines whether the Reset button is enabled. This property is only taken into account if <code>showReset</code> is set
					 * to <code>true</code>.
					 */
					showResetEnabled: {
						type: "boolean",
						defaultValue: false,
						invalidate: true
					}
				},
				associations: {
					/**
					 * The <code>SortPanel</code> control opens in a relative position to the <code>source</code>.
					 */
					source: {
						type: "sap.ui.core.Control"
					}
				},
				defaultAggregation: "items",
				aggregations: {
					/**
					 * Defines personalization items.
					 */
					items: {
						type: "sap.ui.mdc.base.personalization.SortPanelItem",
						multiple: true,
						singularName: "item",
						invalidate: true
					}
				},
				events: {
					/**
					 * This event is fired when the initial items are ordered based on the sort algorithm of the <code>SortPanel</code> control.
					 */
					initialOrderChanged: {
						keys: {
							type: "string[]"
						}
					},
					/**
					 * This event is fired whenever there is a change in <code>SortDialog</code>.
					 */
					change: {},
					/**
					 * This event is fired if the Reset button in the <code>SortPanel</code> control is clicked. The consumer of the control
					 * has to make sure that the model data is reset.
					 */
					reset: {}
				}
			}
		});

	SortPanel.prototype.init = function () {

		// Set device model
		var oDeviceModel = new JSONModel(Device);
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");

		// Due to the re-binding during execution of _defineTableFiltersByText() the sap.m.Table re-create all items.
		// So we have to store the 'key' in order to mark the item after re-binding.
		this._sKeyOfMarkedItem = null;
		this.aFilters = [];

		// --> live changes
		// TODO: focus lost workaround
		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));
		this._oObserver.observe(this, {
			properties: [
				"showResetEnabled"
			]
		});
		// TODO: end of focus lost workaround

		//Calculate the height for the scrollcontainer for the sap.m.Table, since the height is not correctly provided on setting 'height=100%'
		var oScrollContainer = this.byId("idScrollContainer");
		this._fnHandleResize = function () {
			var bChangeResult = false;
			if (!this.getParent) {
				return bChangeResult;
			}
			var oParent = this.getParent();
			if (!oParent || !oParent.$) {
				return bChangeResult;
			}
			var oToolbar = this._getCompositeAggregation().getContent()[0];
			var $dialogCont = oParent.$("cont");
			var iContentHeight, iHeaderHeight;
			if ($dialogCont.children().length > 0 && oToolbar.$().length > 0) {
				var iScrollContainerHeightOld = oScrollContainer.$()[0].clientHeight;

				iContentHeight = $dialogCont.children()[0].clientHeight;
				iHeaderHeight = oToolbar ? oToolbar.$()[0].clientHeight : 0;

				var iScrollContainerHeightNew = iContentHeight - iHeaderHeight;

				if (iScrollContainerHeightOld !== iScrollContainerHeightNew) {
					oScrollContainer.setHeight(iScrollContainerHeightNew + 'px');
					bChangeResult = true;
				}
			}
			return bChangeResult;
		}.bind(this);
		this._sContainerResizeListener = ResizeHandler.register(oScrollContainer, this._fnHandleResize);
	};
	SortPanel.prototype.initialize = function () {
		// Remove 'old' marked item
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		this.fireInitialOrderChanged({
			keys: this._getInitialItemOrder()
		});

		// Set marked item initially to the first selected table item
		var oTableItem = this._getVisibleTableItems()[0];
		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);
	};
	SortPanel.prototype.onDrop = function (oEvent) {
		this._moveTableItem(oEvent.getParameter("draggedControl"), oEvent.getParameter("droppedControl"));
	};
	SortPanel.prototype.onDragStart = function (oEvent) {
		this._toggleMarkedTableItem(oEvent.getParameter("target"));
	};
	SortPanel.prototype.onSelectionChange = function (oEvent) {
		oEvent.getParameter("listItems").forEach(function (oTableItem) {
			this._selectTableItem(oTableItem);
		}, this);
	};
	SortPanel.prototype.onItemPressed = function (oEvent) {
		var oTableItem = oEvent.getParameter('listItem');

		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);
	};
	SortPanel.prototype.onSearchFieldLiveChange = function (oEvent) {
		var oSearchField = oEvent.getSource();
		this._defineTableFiltersByText(oSearchField ? oSearchField.getValue() : "");
		this._filterTable(this.aFilters);
	};
	SortPanel.prototype.onSwitchButtonShowSelected = function () {
		this._defineTableFiltersByText(this._getSearchText());
		this._filterTable(this.aFilters);
	};
	SortPanel.prototype.onPressButtonMoveToTop = function () {
		this._moveTableItem(this._getMarkedTableItem(), this._getVisibleTableItems()[0]);
	};
	SortPanel.prototype.onPressButtonMoveUp = function () {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) - 1]);
	};
	SortPanel.prototype.onPressButtonMoveDown = function () {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) + 1]);
	};
	SortPanel.prototype.onPressButtonMoveToBottom = function () {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.length - 1]);
	};
	SortPanel.prototype.onPressReset = function () {
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());
		this.fireReset();
	};
	SortPanel.prototype.onAfterClose = function () {
		this.fireCancel();
	};
	SortPanel.prototype.onChangeOfSortOrder = function (oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		// Fire event only for valid selection
		if (oSelectedItem) {
			this.fireChange();
		}
	};
	SortPanel.prototype._selectTableItem = function (oTableItem) {
		this._toggleMarkedTableItem(oTableItem);
		this._updateEnableOfMoveButtons(oTableItem);
		this.fireChange();
	};
	SortPanel.prototype._moveTableItem = function (oTableItemFrom, oTableItemTo) {
		// Remove style of current table item (otherwise the style remains on the item after move)
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		//Set aRuntimeItems again in order to reflecet the right positioning
		var aRuntimeItems = this.getModel("$sapuimdcPanel").getData().items;
		var oMItem = _getArrayElementByKey(this._getKeyByTableItem(oTableItemFrom), aRuntimeItems);
		aRuntimeItems.splice(aRuntimeItems.indexOf(oMItem), 1);
		aRuntimeItems.splice(this._getItemPositionOfKey(this._getKeyByTableItem(oTableItemTo)), 0, oMItem);
		this.getModel("$sapuimdcPanel").setProperty("/items", aRuntimeItems);

		//since we are using the model data for the diff, we can be sure that the model contains all the necessary data, since the change is being fired afterwards
		this.fireChange();

		// The event positionChanged leads to binding update, so we have to reconstruct the table according the filters
		this._filterTable(this.aFilters);

		this._toggleMarkedTableItem(this._getMarkedTableItem());
		this._updateEnableOfMoveButtons(this._getMarkedTableItem());
	};
	SortPanel.prototype._getInitialItemOrder = function () {
		// Notify the initial order of the table items
		var aKeysOfVisibleItems = this.getItems().filter(function (oItem) {
			return oItem.getSelected();
		}).map(function (oItem) {
			return oItem.getName();
		});
		var aKeysOfInvisibleItems = this.getItems().filter(function (oItem) {
			return !oItem.getSelected();
		}).sort(function (a, b) {
			if (a.getLabel() < b.getLabel()) {
				return -1;
			} else if (a.getLabel() > b.getLabel()) {
				return 1;
			} else {
				return 0;
			}
		}).map(function (oItem) {
			return oItem.getName();
		});
		return aKeysOfVisibleItems.concat(aKeysOfInvisibleItems);
	};
	SortPanel.prototype._isFilteredByShowSelected = function () {
		return false;
		// return this.byId("idShowSelected").getPressed();
	};
	SortPanel.prototype._getSearchText = function () {
		var oSearchField = this.byId("idSearchField") || null;
		return oSearchField ? oSearchField.getValue() : "";
	};
	SortPanel.prototype._getTable = function () {
		return this.byId("idList") || null;
	};
	SortPanel.prototype._getTableBinding = function () {
		return this._getTable().getBinding("items");
	};
	SortPanel.prototype._getTableBindingContext = function () {
		return this._getTableBinding().getContexts();
	};
	SortPanel.prototype._setMarkedTableItem = function (oTableItem) {
		this._sKeyOfMarkedItem = this._getKeyByTableItem(oTableItem);
	};
	SortPanel.prototype._getMarkedTableItem = function () {
		return this._getTableItemByKey(this._sKeyOfMarkedItem);
	};
	SortPanel.prototype._getVisibleTableItems = function () {
		return this._getTable().getItems().filter(function (oTableItem) {
			return !!oTableItem.getVisible();
		});
	};
	SortPanel.prototype._getSelectedTableItems = function () {
		return this._getTable().getItems().filter(function (oTableItem) {
			return !!oTableItem.getSelected();
		});
	};
	/**
	 * @returns {sap.m.ListItemBase | undefined}
	 * @private
	 */
	SortPanel.prototype._getTableItemByKey = function (sKey) {
		var aContext = this._getTableBindingContext();
		var aTableItem = this._getTable().getItems().filter(function (oTableItem, iIndex) {
			return aContext[iIndex].getObject().getName() === sKey;
		});
		return aTableItem[0];
	};
	/**
	 *
	 * @param {sap.m.ListItemBase} oTableItem
	 * @returns {string | null}
	 * @private
	 */
	SortPanel.prototype._getKeyByTableItem = function (oTableItem) {
		var iIndex = this._getTable().indexOfItem(oTableItem);
		return iIndex < 0 ? null : this._getTableBindingContext()[iIndex].getObject().getName();
	};
	SortPanel.prototype._getItemPositionOfKey = function (sKey) {
		return this.getItems().indexOf(this._getItemByKey(sKey));
	};
	SortPanel.prototype._getItemByKey = function (sKey) {
		var aItem = this.getItems().filter(function (oItem) {
			return oItem.getName() === sKey;
		});
		return aItem[0];
	};
	SortPanel.prototype._defineTableFiltersByText = function (sSearchText) {
		this.aFilters = [];
		if (this._isFilteredByShowSelected() === true) {
			this.aFilters.push(new sap.ui.model.Filter("selected", "EQ", true));
		}
		if (sSearchText) {
			this.aFilters.push(new Filter([
				new Filter("label", FilterOperator.Contains, sSearchText), new Filter("tooltip", FilterOperator.Contains, sSearchText)
			], false));
		}
	};
	SortPanel.prototype._filterTable = function (aFilters) {
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());

		this._getTableBinding().filter(aFilters);

		this._toggleMarkedTableItem(this._getMarkedTableItem());
		this._updateEnableOfMoveButtons(this._getMarkedTableItem());
	};
	SortPanel.prototype._toggleMarkedTableItem = function (oTableItem) {
		this._removeMarkedStyleFromTableItem(this._getMarkedTableItem());
		// When filter is set, the table items are reduced so marked table item can disappear.
		var sKey = this._getKeyByTableItem(oTableItem);
		if (sKey) {
			this._setMarkedTableItem(oTableItem);
			this._addMarkedStyleToTableItem(oTableItem);
		}
	};
	SortPanel.prototype._addMarkedStyleToTableItem = function (oTableItem) {
		if (oTableItem) {
			oTableItem.addStyleClass("sapUiMdcPersonalizationDialogMarked");
		}
	};
	SortPanel.prototype._removeMarkedStyleFromTableItem = function (oTableItem) {
		if (oTableItem) {
			oTableItem.removeStyleClass("sapUiMdcPersonalizationDialogMarked");
		}
	};
	SortPanel.prototype._setFocus = function (oItem) {
		//TODO: Set Focus not on the first table item!
		oItem.getDomRef().focus();
	};
	SortPanel.prototype._updateEnableOfMoveButtons = function (oTableItem) {
		var aVisibleTableItems = this._getVisibleTableItems();

		// TODO: focus lost workaround
		var bEnabled = aVisibleTableItems.indexOf(oTableItem) > 0;
		if (this._getManagedObjectModel().getProperty("/@custom/isMoveUpButtonEnabled") === true && bEnabled === false) {
			this._setFocus(oTableItem);
		}
		this._getManagedObjectModel().setProperty("/@custom/isMoveUpButtonEnabled", bEnabled);
		bEnabled = aVisibleTableItems.indexOf(oTableItem) > -1 && aVisibleTableItems.indexOf(oTableItem) < aVisibleTableItems.length - 1;
		if (this._getManagedObjectModel().getProperty("/@custom/isMoveDownButtonEnabled") === true && bEnabled === false) {
			this._setFocus(oTableItem);
		}
		this._getManagedObjectModel().setProperty("/@custom/isMoveDownButtonEnabled", bEnabled);
		// TODO: end of focus lost workaround

	};

	function _getArrayElementByKey(sKey, aArray) {
		var aElements = aArray.filter(function (oElement) {
			return oElement.name !== undefined && oElement.name === sKey;
		});
		return aElements.length ? aElements[0] : null;
	}

	// TODO: focus lost workaround
	function _observeChanges(oChanges) {
		if (oChanges.object.isA("sap.ui.mdc.base.personalization.SortPanel")) {
			switch (oChanges.name) {
				case "showResetEnabled":
					if (oChanges.current === false && oChanges.old === true) {
						// Move the focus to the popover
						this._setFocus(this._getCompositeAggregation());
					}
					break;
				default:
					Log.error("The property or aggregation '" + oChanges.name + "' has not been registered.");
			}
		}
	}
	// TODO: end of focus lost workaround
	return SortPanel;

}, /* bExport= */true);
