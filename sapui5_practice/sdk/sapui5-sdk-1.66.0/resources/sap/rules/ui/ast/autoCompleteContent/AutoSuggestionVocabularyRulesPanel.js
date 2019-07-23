sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"../../library",
	"sap/ui/core/Control",
	"sap/m/List",
	"sap/ui/model/json/JSONModel",
	"sap/m/ListMode",
	"sap/ui/core/CustomData",
	"sap/ui/model/Sorter",
	"sap/rules/ui/parser/infrastructure/util/utilsBase"
], function (jQuery, library, Control, List, JSONModel, ListMode, CustomData, Sorter, infraUtils) {
	"use strict";

	var autoSuggestionVocabularyRulesPanel = Control.extend("sap.rules.ui.ast.autoCompleteContent.AutoSuggestionVocabularyRulesPanel", {
		metadata: {
			library: "sap.rules.ui",
			properties: {
				reference: {
					type: "object",
					defaultValue: null,
				},
				dialogOpenedCallbackReference: {
					type: "object",
					defaultValue: null,
				},
				data: {
					type: "object",
					defaultValue: null
				},
				context: {
					type: "string",
					defaultValue: ""
				},
			},
			aggregations: {
				PanelLayout: {
					type: "sap.m.Panel",
					multiple: false
				}
			},
			events: {}
		},

		init: function () {
			this.infraUtils = new sap.rules.ui.parser.infrastructure.util.utilsBase.lib.utilsBaseLib();
			this.needCreateLayout = true;
			this.AttributeSegmentSelected = true;
			this.dataObjectName = "";
		},
		onBeforeRendering: function () {
			this.suggestionContext = this.getContext();
			this._reference = this.getReference();
			this._dialogOpenedCallbackReference = this.getDialogOpenedCallbackReference();
			if (this.needCreateLayout) {
				var layout = this._createLayout();
				this.setAggregation("PanelLayout", layout, true);
				this.needCreateLayout = false;
			}
		},
		
		_createLayout: function () {
			var that = this;
			this.Rules = this.getData();
			// create a Model with this data
			var model = new sap.ui.model.json.JSONModel();

			/*Setting growing shows the growing trigger button with text as 2/14 which we do not need
			Hence, setting to top 5 and the rest will be shown in More link */
			var topFiveRulesData = [];
			for (var termCount = 0; termCount < 5 && termCount < this.Rules.length; termCount++) {
				topFiveRulesData.push(this.Rules[termCount]);
			}
			model.setData(topFiveRulesData);

			// create a list 
			this.rulelist = new sap.m.List({
				growingScrollToLoad: true,
				enableBusyIndicator: true
			});

			// bind the List items to the data collection
			this.rulelist.bindItems({
				path: "/",
				sorter: new sap.ui.model.Sorter("Name"),
				rememberSelections: false,
				mode: ListMode.SingleSelectMaster,
				template: new sap.m.DisplayListItem({
					label: "{label}",
					type: "Active",
					press: function (oEvent) {
						that._setModal(false);
						oEvent.oSource.mProperties.forceFireChange = true;
						that._reference(oEvent);
					}
				})
			});

			// set the model to the List, so it knows which data to use
			this.rulelist.setModel(model);
			var moreRulesLink = this.getMoreRulesLink();

			// add list to the panel
			var rulelistPanel = new sap.m.Panel({
				headerText: "Rules",
				expandable: true,
				expanded: false,
				content: this.rulelist
			});

			rulelistPanel.addContent(moreRulesLink);

			return rulelistPanel;
		},
		
		_setModal: function (value) {
			var pop = sap.ui.getCore().byId("popover");
			if (pop) {
				pop.setModal(value);
			}
		},

		getMoreRulesLink: function () {
			var that = this;
			var suggestionsData = this.getData();
			var moreRulesLink = new sap.m.Link({
				text: "More..",
				enabled: true,
				press: function (oEvent) {
					that._setModal(true);
					that._dialogOpenedCallbackReference();
					that.getRulesDialog();
				}
			});
			return moreRulesLink;

		},

		getRulesDialog: function () {
			var that = this;
			var searchFieldText = "Search in Rules";
			var searchField = this.getSearchField(searchFieldText);
			this.detailedrulelist = this.initializeRulesList(this.Rules);
			this.bindFilteredTermsToList(this.detailedrulelist, "", false);
			var verticalLayoutForVocabularyFunction = new sap.ui.layout.VerticalLayout({
				content: [searchField, that.detailedrulelist]
			});

			this.rulesDialog = new sap.m.Dialog({
				title: "Select Rule",
				contentWidth: "500px",
				contentHeight: "500px",
				showHeader: true,
				content: [verticalLayoutForVocabularyFunction],
				buttons: [
					new sap.m.Button({
						text: "Cancel",
						press: function (event) {
							that._setModal(false);
							that.rulesDialog.close();
						}
					})
				]
			});
			that.rulesDialog.open();

		},

		bindFilteredTermsToList: function (oList, searchText, requireSearch) {
			var model = new sap.ui.model.json.JSONModel(this.Rules);
			for (var entry in model.oData) {
				// TODO : change this according to text rule or dt
				model.oData[entry].displayType = model.oData[entry].type;
			}
			var that = this;
			var datapath = "/";
			if (!oList) {
				oList = new sap.m.List({});
			}
			oList.setModel(model);
			oList.bindItems({
				path: datapath,
				sorter: new sap.ui.model.Sorter("label"),
				template: new sap.m.DisplayListItem({
					label: "{label}",
					value: "Rule",
					type: "Active",
					customData: [new CustomData({
						Type: "sap.ui.core.CustomData",
						key: "id",
						value: "{id}"
					})],
					press: function (oEvent) {
						if (that.rulesDialog.isOpen()) {
							that.rulesDialog.close();
						}
						oEvent.oSource.mProperties.forceFireChange = true;
						that._reference(oEvent);
					}
				}),
				rememberSelections: false,
				mode: ListMode.SingleSelectMaster
			});
			if (requireSearch) {
				var filterArray = [];
				var filterProperty = "label";
				filterArray.push(new sap.ui.model.Filter(filterProperty, sap.ui.model.FilterOperator.Contains, searchText));
				oList.getBinding("items").filter(filterArray);
				oList.getModel().refresh(true);
			}
		},

		getSearchFilters: function (searchText) {
			return new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, searchText),
					new sap.ui.model.Filter("label", sap.ui.model.FilterOperator.Contains, searchText)
				],
				and: false
			});
		},

		getSearchField: function (placeHolderText) {
			var that = this;
			this.searchField = new sap.m.SearchField({
				showSearchButton: false,
				width: "462px",
				placeholder: placeHolderText, 
				liveChange: function (oEvent) {
					that.searchTheValueInRules(oEvent.getParameter("newValue"));
				}
			})
			return this.searchField;
		},

		searchTheValueInRules: function (searchText) {
			this.bindFilteredTermsToList(this.detailedrulelist, searchText, true);
		},

		initializeRulesList: function (vocabularyRulesData) {
			var model = new sap.ui.model.json.JSONModel(vocabularyRulesData);
			var datapath = "/";
			var rulelist = new sap.m.List({
				headerText: "Label"
			});
			rulelist.setModel(model);
			rulelist.bindItems({
				path: datapath,
				sorter: new sap.ui.model.Sorter("label"),
				template: new sap.m.DisplayListItem({
					label: "{label}",
					type: "Active",
					customData: [new CustomData({
						Type: "sap.ui.core.CustomData",
						key: "id",
						value: "{id}"
					})]
				})

			});
			return rulelist;
		}

	});

	return autoSuggestionVocabularyRulesPanel;
}, /* bExport= */ true);
