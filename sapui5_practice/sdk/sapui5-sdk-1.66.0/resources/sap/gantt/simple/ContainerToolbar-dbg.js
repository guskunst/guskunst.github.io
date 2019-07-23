sap.ui.define([
	"sap/ui/core/Core",
	"sap/gantt/library",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Item",
	"sap/ui/base/Object",
	"sap/base/Log",
	"sap/m/library",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/ToolbarSpacer",
	"sap/m/FlexBox",
	"sap/m/FlexDirection",
	"sap/m/OverflowToolbarButton",
	"sap/m/ButtonType",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Select",
	"sap/m/ViewSettingsDialog",
	"sap/m/ViewSettingsCustomTab",
	"sap/m/PlacementType",
	"sap/m/CheckBox",
	"sap/m/Slider",
	"sap/m/Popover",
	"../control/AssociateContainer"
],
	function(
		Core,
		library,
		ManagedObjectObserver,
		CoreItem,
		BaseObject,
		Log,
		mLibrary,
		OverflowToolbar,
		OverflowToolbarLayoutData,
		ToolbarSpacer,
		FlexBox,
		FlexDirection,
		OverflowToolbarButton,
		ButtonType,
		SegmentedButton,
		SegmentedButtonItem,
		Select,
		ViewSettingsDialog,
		ViewSettingsCustomTab,
		PlacementType,
		CheckBox,
		Slider,
		Popover,
		AssociateContainer
){
	"use strict";

	var GanttChartWithTableDisplayType = library.simple.GanttChartWithTableDisplayType,
		PlaceholderType = library.simple.ContainerToolbarPlaceholderType,
		OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;

	/**
	 * Creates and initializes a new ContainerToolbar class
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSetting] Initial settings for the new control
	 *
	 * @class
	 * ContainerToolbar is be used with GanttChartContainer control. Use this control out of sap.gantt library is not supported.
	 *
	 * It's defined as an aggregation of GanttChartContainer to provide actions to all <code>sap.gantt.simple.GanttChartWithTable</code> instances.
	 * By default, it only shows zooming controls and settings button. You can set properties to true to show more build-in buttons.
	 *
	 * @extends sap.m.OverflowToolbar
	 *
	 * @author SAP SE
	 * @version 1.66.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.gantt.simple.ContainerToolbar
	 */
	var ContainerToolbar = OverflowToolbar.extend("sap.gantt.simple.ContainerToolbar", /** @lends sap.gantt.simple.ContainerToolbar.prototype */ {
		metadata: {
			properties: {

				/**
				 * Flag to show or hide bird eye button on the toolbar
				 */
				showBirdEyeButton: {type: "boolean", defaultValue: false},

				/**
				 * Flag to show or hide display type menu on the toolbar
				 */
				showDisplayTypeButton: {type: "boolean", defaultValue: false},

				/**
				 * Flag to show or hide legend button
				 */
				showLegendButton: {type: "boolean", defaultValue: false},

				/**
				 * Flag to show or hide setting button
				 */
				showSettingButton: {type: "boolean", defaultValue: true},

				/**
				 * Flag to show or hide zoom buttons
				 */
				showTimeZoomControl: {type: "boolean", defaultValue: true},

				/**
				 * Defines the control type to set the zoom rate.
				 */
				zoomControlType: {type: "sap.gantt.config.ZoomControlType", defaultValue: library.config.ZoomControlType.SliderWithButtons},

				/**
				 * Step count of {@link sap.m.Slider}
				 *
				 * This property only relevant if zoomControlType are:
				 * <ul>
				 *   <li>SliderWithButtons</li>
				 *   <li>SliderOnly</li>
				 * </ul>
				 * @see sap.gantt.config.ZoomControlType
				 */
				stepCountOfSlider: {type: "int", defaultValue: 10},

				/**
				 * Array of plain objects that have "key" and "text" properties,
				 * or array of sap.ui.core.Item used to configure the items in the {@link sap.m.Select} control
				 *
				 * This property is only works if the zoomControlType is Select
				 * @see sap.gantt.config.ZoomControlType
				 */
				infoOfSelectItems: {type: "object[]", defaultValue: []},

				/**
				 * Zoom level of all gantt chart instances in GanttChartContainer
				 */
				zoomLevel:{type: "int", defaultValue: 0},

				/**
				 * Defines how the toolbar custom content is aligned.<br>
				 * If set to <code>true</code>, the custom content in the toolbar is right-aligned. If set to
				 * <code>false</code>, it's left-aligned.<br>
				 * If a {@link sap.gantt.simple.ContainerToolbarPlaceholder} with a <code>Spacer</code> type is used in
				 * the content aggregation, the alignment of the content depends on this spacer.
				 */
				alignCustomContentToRight: {type: "boolean", defaultValue: false}
			},
			aggregations: {
				/**
				 * The additional setting items in Setting Dialog
				 */
				settingItems: {type: "sap.gantt.config.SettingItem", multiple: true},

				/**
				 * The legend container that will show when the legend button is pressed
				 */
				legendContainer: {type: "sap.ui.core.Control", multiple: false, visibility: "public"}
			},
			events: {

				/**
				 * fired when zoom stop changed
				 */
				zoomStopChange: {
					parameters: {
						index: {type: "int"},
						selectedItem: {type: "sap.ui.core.Item"}
					}
				},

				/**
				 * Fired when the bird eye button is pressed
				 */
				birdEyeButtonPress: {},

				/**
				 * Fired when a different display type is selected in the display type menu.
				 */
				displayTypeChange: {
					parameters: {
						displayType: {type: "sap.gantt.simple.GanttChartWithTableDisplayType"}
					}
				}
			}
		}
	});

	ContainerToolbar.prototype.init = function() {
		OverflowToolbar.prototype.init.apply(this, arguments);
		this.mSettingsConfig = {};
		this._oRb = Core.getLibraryResourceBundle("sap.gantt");

		this.oObserver = new ManagedObjectObserver(this.observeChanges.bind(this));
		this.oObserver.observe(this, {
			properties: ["showBirdEyeButton", "showLegendButton", "showTimeZoomControl", "showSettingButton",
				"zoomControlType", "infoOfSelectItems", "showDisplayTypeButton", "alignCustomContentToRight"],
			aggregations: ["content"]
		});

		this.bShallUpdateContent = true;
		this.bZoomControlTypeChanged = false;
		this.bContentAlignChanged = false;
		this._bSuppressZoomStopChange = false;

		this.oToolbarSpacer = new ToolbarSpacer();
	};

	ContainerToolbar.prototype.observeChanges = function(oChanges) {
		if (!this.bShallUpdateContent) {
			this.bShallUpdateContent = true;
			this.bZoomControlTypeChanged = oChanges.name === "zoomControlType";
			this.bContentAlignChanged = oChanges.name === "alignCustomContentToRight";
		}
	};

	ContainerToolbar.prototype.exit = function(){
		this.oObserver.disconnect();
	};

	ContainerToolbar.prototype.applySettings = function (mSettings, oScope){
		mSettings = mSettings || {};
		if (!mSettings.settingItems) {
			// if and only if no setting items are not setup user, given the default
			mSettings.settingItems = library.config.DEFAULT_TOOLBAR_SETTING_ITEMS.map(function(o) { return o.clone(); });
		}
		OverflowToolbar.prototype.applySettings.apply(this, arguments);
		this._createControlsOnly();
		return this;
	};

	ContainerToolbar.prototype.onBeforeRendering = function() {
		if (this.bShallUpdateContent === true) {
			this.updateToolbarContents();
			this.bShallUpdateContent = false;
			this.bZoomControlTypeChanged = false;
			this.bContentAlignChanged = false;
		}
	};

	ContainerToolbar.prototype.updateToolbarContents = function () {
		var aItems = this.getContent(),
			mPlaceholders = {},
			iSpacerPosition = 0;

		var fnNotExisted = function (oControl) {
			return this.getContent().indexOf(oControl) === -1;
		}.bind(this);

		var fnSetupPlaceholder = function (oPlaceholder, bShow, oControl) {
			if (!oPlaceholder._getControl()) {
				oPlaceholder._setControl(oControl);
			}
			oPlaceholder.setProperty("_show", bShow);
		};

		var fnInsertOrRemove = function (sType, bShow, oControl) {
			var oPlaceholder = mPlaceholders[sType],
				bControlNotExisted = fnNotExisted(oControl);

			if (oPlaceholder) {
				fnSetupPlaceholder(oPlaceholder, bShow, oControl);
			} else if (bShow) {
				iSpacerPosition++;
			}

			if (!bControlNotExisted && (oPlaceholder || !bShow)) {
				this.removeContent(oControl);
			} else if (!oPlaceholder && bShow && bControlNotExisted) {
				if (sType === PlaceholderType.Spacer) {
					this.insertContent(oControl, this.getAlignCustomContentToRight() ? 0 : this.getContent().length - iSpacerPosition + 1);
				} else {
					this.addContent(oControl);
				}
			}
		}.bind(this);

		aItems.forEach(function (oItem) {
			var sType;

			if (BaseObject.isA(oItem, "sap.gantt.simple.ContainerToolbarPlaceholder")) {
				sType = oItem.getType();
				if (mPlaceholders[sType]) {
					Log.warning("There are more than one sap.gantt.simple.ContainerToolbarPlaceholder of the " + sType + " type.");
				}
				mPlaceholders[sType] = oItem;
			}
		});

		if (this.bContentAlignChanged) {
			this.removeContent(this.oToolbarSpacer);
		}

		fnInsertOrRemove(PlaceholderType.BirdEyeButton, this.getShowBirdEyeButton(), this._genBirdEyeButton());
		fnInsertOrRemove(PlaceholderType.TimeZoomControl, this.getShowTimeZoomControl(), this._genTimeZoomFlexBox());
		fnInsertOrRemove(PlaceholderType.LegendButton, this.getShowLegendButton(), this._genLegend());
		fnInsertOrRemove(PlaceholderType.SettingButton, this.getShowSettingButton(), this._genSettings());
		fnInsertOrRemove(PlaceholderType.DisplayTypeButton, this.getShowDisplayTypeButton(), this._genDisplayTypeButton());
		fnInsertOrRemove(PlaceholderType.Spacer, true, this.oToolbarSpacer);
	};

	ContainerToolbar.prototype._createControlsOnly = function() {
		this._genBirdEyeButton();
		this._genTimeZoomGroupControls();
		this._genLegend();
		this._genSettings();
		this._genDisplayTypeButton();
	};

	ContainerToolbar.prototype._genDisplayTypeButton = function() {
		if (this._oDisplayTypeSegmentedButton) {
			return this._oDisplayTypeSegmentedButton;
		}

		this._oDisplayTypeSegmentedButton = new SegmentedButton({
			selectedKey: GanttChartWithTableDisplayType.Both,
			selectionChange: function(oEvent) {
				this.fireDisplayTypeChange({
					displayType: oEvent.getParameter("item").getKey()
				});
			}.bind(this),
			items: [
				new SegmentedButtonItem({
					tooltip: this._oRb.getText("TLTP_DISPLAY_TYPE_BUTTON_BOTH"),
					icon: "sap-icon://Chart-Tree-Map",
					key: GanttChartWithTableDisplayType.Both
				}),
				new SegmentedButtonItem({
					tooltip: this._oRb.getText("TLTP_DISPLAY_TYPE_BUTTON_CHART"),
					icon: "sap-icon://along-stacked-chart",
					key: GanttChartWithTableDisplayType.Chart
				}),
				new SegmentedButtonItem({
					tooltip: this._oRb.getText("TLTP_DISPLAY_TYPE_BUTTON_TABLE"),
					icon: "sap-icon://table-view",
					key: GanttChartWithTableDisplayType.Table
				})
			]
		});
	};

	/**
	 * Generate a button which show a bird icon for showing all shapes in the visible rows.
	 *
	 * @returns {sap.m.Button} generate a button if not exists yet
	 * @private
	 */
	ContainerToolbar.prototype._genBirdEyeButton = function() {
		if (this._oBirdEyeButton == null){
			var fnBirdEyeTooltip = function(oRb) {
				var sBirdEye = oRb.getText("TXT_BRIDEYE"),
					sTxtVisibleRows = oRb.getText("TXT_BRIDEYE_RANGE_VISIBLE_ROWS"),
					sTooltipVisibleRows = oRb.getText("TLTP_BRIDEYE_ON_VISIBLE_ROWS");

				return sBirdEye + "(" + sTxtVisibleRows + "): " + sTooltipVisibleRows;
			};

			this._oBirdEyeButton = new OverflowToolbarButton({
				icon: "sap-icon://show",
				type: ButtonType.Transparent,
				text: this._oRb.getText("TXT_BIRDEYE_BUTTON"),
				tooltip: fnBirdEyeTooltip(this._oRb),
				press: function (oEvent) {
					this.fireBirdEyeButtonPress();
				}.bind(this)
			});
		}

		return this._oBirdEyeButton;
	};

	ContainerToolbar.prototype._getSelectItems = function() {
		var aSelectItems = [],
			aInfoOfSelectItems = this.getInfoOfSelectItems();

		if (aInfoOfSelectItems.length > 0 ) {
			if (aInfoOfSelectItems[0] instanceof CoreItem) {
				aSelectItems = aInfoOfSelectItems;
			} else {
				for (var i = 0; i < aInfoOfSelectItems.length; i++){
					var oItem = new CoreItem({
						key: aInfoOfSelectItems[i].key,
						text: aInfoOfSelectItems[i].text
					});
					aSelectItems.push(oItem);
				}
			}
		}
		return aSelectItems;
	};

	ContainerToolbar.prototype._genTimeZoomGroupControls = function() {
		var ZoomControlType = library.config.ZoomControlType;

		var sZoomControlType = this.getZoomControlType();

		var fnUpdateZoomLevel = function(iZoomLevel) {
			jQuery.sap.clearDelayedCall(this._iLiveChangeTimer);
			this._iLiveChangeTimer = -1;

			this.setZoomLevel(iZoomLevel, true);
		};

		this.fireEvent("_zoomControlTypeChange",{zoomControlType: sZoomControlType});
		if (sZoomControlType === ZoomControlType.None){
			return [];
		}
		if (sZoomControlType === ZoomControlType.Select) {
			if (this._oSelect) {
				return [this._oSelect];
			}

			var aSelectItems = this._getSelectItems();
			this._oSelect = new Select({
				items: aSelectItems,
				selectedItem: aSelectItems[this.getZoomLevel()],
				change: function (oEvent) {
					var oSelect = oEvent.getSource();
					var oSelectedItem = oSelect.getSelectedItem();
					var iSelectItemIndex = oSelect.indexOfItem(oSelectedItem);
					this._iLiveChangeTimer = jQuery.sap.delayedCall(200, this,
							fnUpdateZoomLevel, [iSelectItemIndex, oSelectedItem]);
				}.bind(this)
			});

			return [this._oSelect];

		} else {
			if (this._oZoomSlider) {

				this._oZoomSlider.setMax(this.getStepCountOfSlider() - 1);
				if (sZoomControlType === ZoomControlType.SliderOnly) {
					return [this._oZoomSlider];
				} else if (sZoomControlType === ZoomControlType.ButtonsOnly) {
					return [this._oZoomOutButton, this._oZoomInButton];
				} else {
					return [this._oZoomOutButton, this._oZoomSlider, this._oZoomInButton];
				}
			}
			this._oZoomSlider = new Slider({
				width: "200px",
				max: this.getStepCountOfSlider() - 1,
				value: this.getZoomLevel(),
				min: 0,
				step: 1,
				liveChange: function(oEvent) {
					var iSliderValue = parseInt(oEvent.getParameter("value"), 10);
					// Clear the previous accumulated event
					jQuery.sap.clearDelayedCall(this._iLiveChangeTimer);
					this._iLiveChangeTimer = jQuery.sap.delayedCall(200, this, fnUpdateZoomLevel, [iSliderValue]);
				}.bind(this)
			});

			var fnZoomButtonPressHandler = function(bZoomIn) {
				return function(oEvent){
					this._iLiveChangeTimer = jQuery.sap.delayedCall(200, this, function () {
						var iSliderStepChangeValue = parseInt(bZoomIn ? this._oZoomSlider.stepUp(1).getValue() :
							this._oZoomSlider.stepDown(1).getValue(), 10);
						fnUpdateZoomLevel.call(this, iSliderStepChangeValue);
					});
				};
			};

			this._oZoomInButton = new OverflowToolbarButton({
				icon: "sap-icon://zoom-in",
				type: ButtonType.Transparent,
				tooltip: this._oRb.getText("TLTP_SLIDER_ZOOM_IN"),
				press: fnZoomButtonPressHandler(true /**bZoomIn*/).bind(this)
			});

			this._oZoomOutButton = new OverflowToolbarButton({
				icon: "sap-icon://zoom-out",
				type: ButtonType.Transparent,
				tooltip: this._oRb.getText("TLTP_SLIDER_ZOOM_OUT"),
				press: fnZoomButtonPressHandler(false /**bZoomIn*/).bind(this)
			});
			return [this._oZoomOutButton, this._oZoomSlider, this._oZoomInButton];
		}

	};

	ContainerToolbar.prototype._genTimeZoomFlexBox = function () {
		if (this._oTimeZoomFlexBox) {
			if (this.bZoomControlTypeChanged) {
				this._oTimeZoomFlexBox.removeAllItems();

				this._genTimeZoomGroupControls().forEach(function (oItem) {
					this._oTimeZoomFlexBox.addItem(oItem);
				}.bind(this));
			}

			return this._oTimeZoomFlexBox;
		}

		this._oTimeZoomFlexBox = new FlexBox({
			items: this._genTimeZoomGroupControls(),
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			})
		});
		return this._oTimeZoomFlexBox;
	};

	ContainerToolbar.prototype._genSettings = function () {
		if (this._oSettingsButton) {
			return this._oSettingsButton;
		}

		var aAllSettingItems = this.getSettingItems().map(function(oSettingItem){
			return new CheckBox({
				name: oSettingItem.getKey(),
				text: oSettingItem.getDisplayText(),
				tooltip: oSettingItem.getTooltip(),
				selected: oSettingItem.getChecked()
			}).addStyleClass("sapUiSettingBoxItem");
		});

		this._oSettingsBox = new FlexBox({
			direction: FlexDirection.Column,
			items: aAllSettingItems
		}).addStyleClass("sapUiSettingBox");

		this._oSettingsDialog = new ViewSettingsDialog({
			title: this._oRb.getText("SETTINGS_DIALOG_TITLE"),
			customTabs: [new ViewSettingsCustomTab({content: this._oSettingsBox})],
			confirm: function() {
				this._fireSettingItemChangedEvent();
			}.bind(this),
			cancel: function() {
				// when cancel, the selected state should be restored when reopen
				this.updateSettingItems(this.mSettingsConfig);
			}.bind(this)
		});

		this._oSettingsButton = new OverflowToolbarButton({
			icon: "sap-icon://action-settings",
			type: ButtonType.Transparent,
			text: this._oRb.getText("TXT_SETTING_BUTTON"),
			tooltip: this._oRb.getText("TLTP_CHANGE_SETTINGS"),
			layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.High}),
			press: function (oEvent) {
				this._oSettingsDialog.open();
			}.bind(this)
		});

		return this._oSettingsButton;
	};

	ContainerToolbar.prototype._genLegend = function () {
		if (this._oLegendButton) {
			return this._oLegendButton;
		}

		if (!this._oLegendPop) {
			this._oLegendPop = new Popover({
				placement: PlacementType.Bottom,
				showArrow: false,
				showHeader: false
			});
		}

		this._oLegendButton = new OverflowToolbarButton({
			icon: "sap-icon://legend",
			type: ButtonType.Transparent,
			text: this._oRb.getText("TXT_LEGEND_BUTTON"),
			tooltip: this._oRb.getText("TLTP_SHOW_LEGEND"),
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.High,
				closeOverflowOnInteraction: false
			}),
			press: function (oEvent) {
				var oLegendPop = this._oLegendPop;
				if (oLegendPop.isOpen()){
					oLegendPop.close();
				} else {
					oLegendPop.openBy(this._oLegendButton);
				}
			}.bind(this)
		});
		return this._oLegendButton;
	};

	ContainerToolbar.prototype.updateZoomLevel = function(iZoomLevel){
		this._bSuppressZoomStopChange = true;
		this.setZoomLevel(iZoomLevel);
	};

	ContainerToolbar.prototype.setZoomLevel = function (iZoomLevel, bInvalidate) {
		if (!isNaN(iZoomLevel)) {

			var iCurrentZoomLevel = this.getZoomLevel();

			if (iCurrentZoomLevel !== iZoomLevel){
				this.setProperty("zoomLevel", iZoomLevel, bInvalidate);

				if (this._oZoomSlider) {
					this._oZoomSlider.setValue(iZoomLevel);
					if (!this._bSuppressZoomStopChange){
						this.fireZoomStopChange({index: iZoomLevel});
					}
				}

				if (this._oSelect) {
					this._oSelect.setSelectedItem(this._oSelect.getItems()[iZoomLevel]);
					if (!this._bSuppressZoomStopChange){
						this.fireZoomStopChange({index: iZoomLevel, selectedItem: this._oSelect.getSelectedItem()});
					}
				}

				if (this._oZoomOutButton && this._oZoomInButton){
					var iMax = this._oZoomSlider.getMax(),
						iMin = this._oZoomSlider.getMin();

					if (iZoomLevel === iMax) {
						this._oZoomInButton.setEnabled(false);
						this._oZoomOutButton.setEnabled(true);
					} else if (iZoomLevel === iMin) {
						this._oZoomInButton.setEnabled(true);
						this._oZoomOutButton.setEnabled(false);
					} else {
						this._oZoomInButton.setEnabled(true);
						this._oZoomOutButton.setEnabled(true);
					}
				}
			}
		}

		this._bSuppressZoomStopChange = false;
		return this;
	};

	ContainerToolbar.prototype.setLegendContainer = function (oLegendContainer){
		this.setAggregation("legendContainer", oLegendContainer);

		if (!this._oLegendPop) {
			this._oLegendPop = new Popover({
				placement: PlacementType.Bottom,
				showArrow: false,
				showHeader: false
			});
		}
		//legend function invoked by view parser
		if (oLegendContainer) {
			this._oLegendPop.removeAllContent();
			this._oLegendPop.addContent(new AssociateContainer({
				content: oLegendContainer
				})
			);
		}
	};

	ContainerToolbar.prototype._fireSettingItemChangedEvent = function(){
		var aSettingItems = this._oSettingsBox.getItems();
		var mChangedParams = [];
		for (var i = 0; i < aSettingItems.length; i++) {
			var sSettingName = aSettingItems[i].getName(),
				sPropName = sSettingName.substr(4), // remove sap_
				bOldValue = this.mSettingsConfig[sPropName],
				bNewValue = aSettingItems[i].getSelected();
			if (bOldValue !== bNewValue) {
				mChangedParams.push({
					name: sSettingName,
					value: bNewValue
				});
			}
		}

		// DO not fire if nothing changed
		if (mChangedParams.length > 0) {
			this.fireEvent("_settingsChange", mChangedParams);
		}
	};

	/**
	 * Update the setting items selection state
	 *
	 * @param {object} mChanges delta settings configuration change
	 */
	ContainerToolbar.prototype.updateSettingsConfig = function(mChanges) {
		Object.keys(mChanges).forEach(function(propery){
			this.mSettingsConfig[propery] = mChanges[propery];
		}.bind(this));

		this.updateSettingItems(mChanges);
	};

	ContainerToolbar.prototype.updateSettingItems = function(mChanges) {
		var aSettingItems = this._oSettingsBox.getItems();
		Object.keys(mChanges).forEach(function(property){
			var oSettingItem = aSettingItems.filter(function(oItem){
				return oItem.getName().endsWith(property);
			})[0];

			if (oSettingItem) {
				oSettingItem.setSelected(mChanges[property]);
			}
		});

	};

	ContainerToolbar.prototype.getAllToolbarItems = function () {
		return this.getContent();
	};

	ContainerToolbar.prototype.setInfoOfSelectItems = function(aItems, bSuppressInvalidate) {
		this.setProperty("infoOfSelectItems", aItems, bSuppressInvalidate);
		var that = this;
		if (this._oSelect) {
			var aSelectItems = this._getSelectItems();
			this._oSelect.removeAllItems();
			aSelectItems.forEach(function(item) {
				that._oSelect.addItem(item);
			});
		}
	};

	return ContainerToolbar;
}, true);
