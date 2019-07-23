/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/core/XMLComposite",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/base/ManagedObjectObserver",
	"sap/m/Tokenizer"
	], function(
			XMLComposite,
			JSONModel,
			Filter,
			ManagedObjectObserver,
			Tokenizer
		) {
	"use strict";

	var ValueHelpPanel = XMLComposite.extend("sap.ui.mdc.base.ValueHelpPanel", {
		metadata: {
			properties: {
				showTokenizer: {
					type: "boolean",
					group: "Data",
					defaultValue: true
				},
				showFilterbar: {
					type: "boolean",
					group: "Data",
					defaultValue: true
				},

				/**
				 * Sets the conditions that represents the selected values of the help.
				 *
				 * @since 1.62.0
				 */
				conditions: {
					type: "object[]",
					group: "Data",
					defaultValue: [],
					byValue: true
				},

				/**
				 * Sets the conditions for the searcField.
				 *
				 * @since 1.62.0
				 */
				filterConditions: {
					type: "object[]",
					group: "Data",
					defaultValue: []
				},

				/**
				 * The formatOptions for the ConditionType used to format tokens
				 *
				 * @since 1.62.0
				 */
				formatOptions: {
					type: "object",
					defaultValue: {}
				}
			}

		},
		fragment: "sap.ui.mdc.base.ValueHelpPanel",

		init: function() {
			if (!this._oTokenizer) {
				this._oTokenizer = this.byId("VHPTokenizer");
				this._oTokenizer.updateTokens = function() {
					Tokenizer.prototype.updateTokens.apply(this, arguments);
					this.invalidate(); // as VHP could be supressed but Tokenizer needs to be updated
				};
			}

			// TOCO: better logic to get FieldPath or decide when to render a SearchField in FieldBase
			var oSearchField = this.byId("SearchField2");
			oSearchField.getFieldPath = _getSearchFieldPath.bind(this);

			this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

			this._oObserver.observe(this, {
				properties: ["formatOptions"]
			});
		},

		exit: function() {
			// if tokenizer is not part of the VHP content
			if (!this.getShowTokenizer()) {
				this._oTokenizer.destroy();
			}

			if (this._oDefineConditionPanel && !this._oDefineConditionPanel.getParent()) {
				//DefineConditionPanel never displayed -> destroy it now
				this._oDefineConditionPanel.destroy();
			}

			this._oObserver.disconnect();
			this._oObserver = undefined;
		},

		setFilterbar: function(oFilterbar) {
			var oSplitter = this.byId("filterbarSplitter");
			if (this._oFilterbar) {
				if (this._bFilterbarParentSet) {
					this._oFilterbar.setParent();
					delete this._bFilterbarParentSet;
				}
			}
			this._oFilterbar = oFilterbar;

			if (oFilterbar) { //If a new Filterbar exist, set the layoutData and add it into the splitter
				// give the Filterbar a left/top margin when we show it in the splitter container
				oFilterbar.addStyleClass("sapMdcValueHelpPanelFilterbar");

				oFilterbar.setLayoutData(new sap.ui.layout.SplitterLayoutData({
					size: "280px"
				}));
				this._updateFilterbarVisibility(this.getShowFilterbar());
				if (!oFilterbar.getParent()) {
					// if not in control tree set as child
					oFilterbar.setParent(this);
					this._bFilterbarParentSet = true;
				}
			}
			oSplitter.invalidate();

			//update the IconTabbar header visibility
			var oITBar = this.byId("iconTabBar");
			oITBar.getItems()[0].setVisible(oITBar.getItems()[0].getContent().length > 0);
			oITBar.setSelectedKey("selectFromList");
			this._updateITBHeaderVisiblity();
		},

		setTable: function(oTable) {
			var oSplitter = this.byId("filterbarSplitter");
			if (this._oTable) {
				if (this._bTableParentSet && this._oTable.getParent()) {
					this._oTable.setParent();
				}
				delete this._bTableParentSet;
			}
			this._oTable = oTable;

			if (oTable) { //If a new table exist, set the layoutData and add it into the splitter
				oTable.setLayoutData(new sap.ui.layout.SplitterLayoutData({
					size: "auto"
				}));

				if (!oTable.getParent()) {
					// if not in control tree set as child
					oTable.setParent(this);
					this._bTableParentSet = true;
				}
			}
			oSplitter.invalidate();

			//update the IconTabbar header visibility
			var oITBar = this.byId("iconTabBar");
			oITBar.getItems()[0].setVisible(oITBar.getItems()[0].getContent().length > 0);
			oITBar.setSelectedKey("selectFromList");
			this._updateITBHeaderVisiblity();
		},

		getTable: function() {
			if (this._oTable) {
				return this._oTable;
			} else {
				return;
			}
		},

		setDefineConditions: function(oDefineConditionPanel) {
			var oITBar = this.byId("iconTabBar");
			if (this._oDefineConditionPanel) {
				oITBar.getItems()[1].removeContent(this._oDefineConditionPanel);
				this._oDefineConditionPanel.destroy();
			}
			this._oDefineConditionPanel = oDefineConditionPanel;

			//update the IconTabbar header visibility
			oITBar.getItems()[1].setVisible(!!this._oDefineConditionPanel);
			this._updateITBHeaderVisiblity();
		},

		_updateITBHeaderVisiblity: function() {
			var oITBar = this.byId("iconTabBar");
			if (oITBar.getItems()[0].getVisible() && oITBar.getItems()[1].getVisible()) {
				oITBar.removeStyleClass("sapMdcNoHeader");
			} else {
				oITBar.addStyleClass("sapMdcNoHeader");
			}

			if (oITBar.getItems()[1].getVisible() && oITBar.getSelectedKey() !== "selectFromList") {
				_bindDefineConditionPanel.call(this);
			}

		},

		onBeforeRendering: function() {

			// overwrite getContentAreas to not change Parent of Table and FilterBar
			var oSplitter = this.byId("filterbarSplitter");
			oSplitter._oValueHelpPanel = this;
			oSplitter.getContentAreas = function() {
				var aContentAreas = [];
				if (this._oValueHelpPanel._oFilterbar) {
					if (this._oValueHelpPanel.getShowFilterbar()) {
						var oToggleButton = this._oValueHelpPanel.byId("AdvancedFilter");
						if (oToggleButton.getPressed()) {
							aContentAreas.push(this._oValueHelpPanel._oFilterbar);
						}
					}
				}

				if (this._oValueHelpPanel._oTable) {
					aContentAreas.push(this._oValueHelpPanel._oTable);
				}

				return aContentAreas;
			};
		},

		_handleTokenUpdate: function(oEvent) {

			if (oEvent.getParameter("type") === "removed") {
				var aRemovedTokens = oEvent.getParameter("removedTokens");
				var aConditions = this.getConditions();
				var i;

				for (i = 0; i < aRemovedTokens.length; i++) {
					var oRemovedToken = aRemovedTokens[i];
					var sPath = oRemovedToken.getBindingContext("$this").sPath;
					var iIndex = parseInt(sPath.slice(sPath.lastIndexOf("/") + 1));
					aConditions[iIndex].delete = true;
				}

				for (i = aConditions.length - 1; i >= 0; i--) {
					if (aConditions[i].delete) {
						aConditions.splice(i, 1);
					}
				}

				this.setProperty("conditions", aConditions, true); // do not invalidate whole panel
			}

		},

		setShowFilterbar: function(bVisible) {
			var sOld = this.getShowFilterbar();
			this.setProperty("showFilterbar", bVisible);
			if (sOld !== this.getShowFilterbar()) {
				this._oAdvButton = this.byId("AdvancedFilter");
				this._oAdvButton.setPressed(bVisible);
				this._updateFilterbarVisibility(bVisible);
			}
			return this;
		},

		_handleToggleFilterVisibility: function(oEvent) {
			var bPressed = oEvent.getParameter("pressed");
			this._updateFilterbarVisibility(bPressed);
		},

		_updateFilterbarVisibility: function(bVisible) {
			if (!this._oFilterbar) {
				return;
			}

			var oSplitter = this.byId("filterbarSplitter");
			oSplitter.invalidate();
		},

		setShowTokenizer: function(bVisible) {
			var sOld = this.getShowTokenizer();
			this.setProperty("showTokenizer", bVisible);
			bVisible = this.getShowTokenizer(); // might change to have right type
			if (sOld !== bVisible) {
				var oSplitter = this.byId("rootSplitter");
				var oListBinding = this._oTokenizer.getBinding("tokens");
				if (bVisible) {
					oListBinding.resume();
					oSplitter.insertContentArea(this._oTokenizer, 1);
				} else {
					oListBinding.suspend(); // don't create Tokens
					oSplitter.removeContentArea(this._oTokenizer);
				}
			}
			return this;
		},

		iconTabSelect: function(oEvent) {

			var sKey = oEvent.getParameter("key");
			if (sKey === "defineCondition") {
				_bindDefineConditionPanel.call(this);
			}

		}

	});

	function _observeChanges(oChanges) {

		if (oChanges.name === "formatOptions") {
			var oBindingInfo = this._oTokenizer.getBindingInfo("tokens");
			if (oBindingInfo && oBindingInfo.template) {
				oBindingInfo = oBindingInfo.template.getBindingInfo("text");
				if (oBindingInfo && oBindingInfo.type) {
					oBindingInfo.type.setFormatOptions(oChanges.current);
				}
			}
		}

	}

	function _getSearchFieldPath() {

		var sBindingPath = this.getBindingPath("filterConditions");
		if (sBindingPath && sBindingPath.startsWith("/conditions/")) {
			return sBindingPath.slice(12);
		} else {
			return "";
		}

	}

	function _bindDefineConditionPanel() {

		if (this._oDefineConditionPanel) {
			if (!this._oDefineConditionPanel.getModel("$VHP")) {
				var oManagedObjectModel = this._getManagedObjectModel();
				this._oDefineConditionPanel.setModel(oManagedObjectModel, "$VHP");
				var oMetadata = this._oDefineConditionPanel.getMetadata();
				if (oMetadata.hasProperty("formatOptions") && !this._oDefineConditionPanel.getBindingPath("formatOptions") && this._oDefineConditionPanel.isPropertyInitial("formatOptions")) {
					this._oDefineConditionPanel.bindProperty("formatOptions", {path: "$VHP>/formatOptions"});
				}
				if (oMetadata.hasProperty("conditions") && !this._oDefineConditionPanel.getBindingPath("conditions") && this._oDefineConditionPanel.isPropertyInitial("conditions")) {
					this._oDefineConditionPanel.bindProperty("conditions", {path: "$VHP>/conditions"});
				}
			}
			// add content only after binding, otherwise onBeforeRendering type is missing
			var oITBar = this.byId("iconTabBar");
			oITBar.getItems()[1].addContent(this._oDefineConditionPanel);
		}

	}

	return ValueHelpPanel;

}, /* bExport= */ true);
