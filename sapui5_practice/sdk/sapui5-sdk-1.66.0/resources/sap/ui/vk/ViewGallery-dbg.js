/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ViewGallery.
sap.ui.define([
	"sap/ui/core/Control", "./ContentConnector", "./AnimationTimeSlider", "./ViewGalleryRenderer"
], function(Control, ContentConnector, AnimationTimeSlider, ViewGalleryRenderer) {
	"use strict";

	/**
	 *  Constructor for a new ViewGallery.
	 *
	 * @class
	 * Enables capabilities for navigating and activating procedures and steps contained in a single 3D scene.
	 *
	 * @param {string} [sId] ID for the new control. This ID is generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new View Gallery control.
	 * @public
	 * @author SAP SE
	 * @version 1.66.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.ViewGallery
	 * @since 1.62.0
	 */
	var ViewGallery = Control.extend("sap.ui.vk.ViewGallery", /** @lends sap.ui.vk.ViewGallery.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Indicates that the View Gallery control should display animation slider showing time of animation in current view.
				 */
				showAnimationTimeSlider: {
					type: "boolean",
					defaultValue: true
				}
			},

			associations: {
				viewport: {
					type: "sap.ui.vk.threejs.Viewport"
				},
				contentConnector: {
					type: "sap.ui.vk.ContentConnector"
				}
			},

			aggregations: {
				/**
				 * View gallery items.
				 */
				items: {
					type: "sap.ui.core.Control",
					forwarding: {
						getter: "_getHBox",
						aggregation: "items",
						forwardBinding: true
					}
				},

				/**
				 * sap.ui.core.Popup used to render step information in a popup.
				 */
				stepInfoPopup: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * sap.m.Toolbar used to render the entire View Gallery control's content.
				 */
				toolbar: {
					type: "sap.m.Toolbar",
					multiple: false
				},

				/**
				 * sap.m.ScrollContainer used to render a list of thumbnails for the available steps.
				 */
				container: {
					type: "sap.m.ScrollContainer",
					multiple: false
				},

				animationTimeSlider: {
					type: "sap.ui.vk.AnimationTimeSlider",
					multiple: false
				}
			},

			events: {
				/**
				 * Fires when selection is changed via user interaction inside the control.
				 */
				selectionChange: {
					parameters: {
						item: "sap.ui.core.Control"
					}
				}
			}
		}
	});

	ViewGallery.prototype.setShowAnimationTimeSlider = function(value) {
		this.setProperty("showAnimationTimeSlider", value);

		var viewport = null;
		if (this.getViewport()) {
			viewport = sap.ui.getCore().byId(this.getViewport());
		}

		if (value) {
			this.setAnimationTimeSlider(new AnimationTimeSlider());
			if (viewport) {
				viewport.setAnimationTimeSlider(this.getAnimationTimeSlider());
				this.getAnimationTimeSlider().setViewport(viewport);
			}
		} else {
			this.destroyAnimationTimeSlider();
			if (viewport) {
				viewport.setAnimationTimeSlider(null);
			}
		}
	};

	ViewGallery.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.call(this);
		}

		var that = this;
		this._scene = null;
		this._items = new Map();
		this._cdsLoader = null;

		this._previousOrientationVertical = false;
		this._userActivated = false;

		sap.ui.core.IconPool.addIcon("landscape-text", "vk-icons", "vk-icons", "e019");
		sap.ui.core.IconPool.addIcon("portrait-text", "vk-icons", "vk-icons", "e01a");

		// Create JSON data model
		this.oModel = new sap.ui.model.json.JSONModel();

		this._toolbar = new sap.m.Toolbar({
			design: sap.m.ToolbarDesign.Solid
		});

		this.setAggregation("toolbar", this._toolbar);

		this._hbox = new sap.m.HBox();
		this._scrollContainer = new sap.m.ScrollContainer(this.getId() + "-scroller", {
			width: "100%",
			horizontal: true,
			vertical: false,
			focusable: true,
			content: [ this._hbox ]
		});
		this.setAggregation("container", this._scrollContainer);

		// Create the play previous button
		this._previousItemButton = new sap.m.Button(this.getId() + "-previousItemButton", {
			type: sap.m.ButtonType.Transparent,
			icon: "sap-icon://close-command-field",
			tooltip: sap.ui.vk.getResourceBundle().getText("STEP_NAV_PREVIOUSSTEPBUTTON"),
			press: function(event) {
				var i = that.getSelectedIndex();
				if (i > 0) {
					that.setSelectedItem(that.getItems()[ i - 1 ], true);
				}
			}
		});

		// Create the play next button
		this._nextItemButton = new sap.m.Button(this.getId() + "-nextItemButton", {
			type: sap.m.ButtonType.Transparent,
			icon: "sap-icon://open-command-field",
			tooltip: sap.ui.vk.getResourceBundle().getText("STEP_NAV_NEXTSTEPBUTTON"),
			press: function(event) {
				var i = that.getSelectedIndex(),
					items = that.getItems();
				if (i >= 0 && i + 1 < items.length) {
					that.setSelectedItem(items[ i + 1 ], true);
				}
			}
		});

		// Create the procedure list popup
		this._viewGroupSelector = new sap.m.Popover({
			showHeader: false,
			contentWidth: "20%",
			placement: sap.m.PlacementType.Top,
			horizontalScrolling: false,
			verticalScrolling: false,
			content: [
				new sap.m.ScrollContainer({
					horizontal: false,
					vertical: true,
					content: [
						this._procedureList = new sap.m.SelectList({
							width: "100%",
							itemPress: function(oControlEvent) {
								var index = this.indexOfItem(oControlEvent.getParameter("item"));
								if (that._viewportGroups) {
									that._modelViews = that._viewportGroups[ index ].modelViews;
									that._currentGroupTitle.setText(that._viewportGroups[ index ].name).setTooltip(that._viewportGroups[ index ].name);
									that._separatorTitle.setVisible(true);
									if ((!that._modelViews || that._modelViews.length === 0) && that._cdsLoader) {
										var id = that._viewportGroups[ index ].originalId;
										var sceneId = that._viewportGroups[ index ].sceneId;
										var result = that._cdsLoader.loadViewGroup(sceneId, id);
										result.then(function(views) {
											that._viewportGroups[ index ].modelViews = views;
											that._modelViews = views;
											that._refreshItems();
										});
									} else {
										that._refreshItems();
									}
								}
							}
						})
					]
				})
			]
		});

		// Create the play button
		this._playButton = new sap.m.ToggleButton(this.getId() + "-playButton", {
			type: sap.m.ButtonType.Transparent,
			pressed: false,
			icon: "sap-icon://media-play",
			visible: true,
			tooltip: sap.ui.vk.getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAY"),
			press: function(oEvent) {
				var target = oEvent.getSource();
				if (target.getPressed()) {
					this._playProcedure();
					target.setIcon("sap-icon://media-pause");
					target.setTooltip(sap.ui.vk.getResourceBundle().getText("STEP_NAV_PLAYMENU_PAUSE"));
				} else {
					this._pauseAnimation();
					target.setIcon("sap-icon://media-play");
					target.setTooltip(sap.ui.vk.getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAY"));
				}

			}.bind(this)
		});

		// Create the step count text
		this._stepCount = new sap.m.Title({
			text: (function() {
				var i = that.getSelectedIndex(),
					items = that.getItems();
					return sap.ui.vk.getResourceBundle().getText("VIEWS_TITLE_WITH_COUNT", [ i + 1, items.length ]);
			  })(),
			level:	"H5",
			titleStyle: "H5"
		});

		// Create the current procedure title text
		this._currentGroupTitle = new sap.m.Title({
			text: sap.ui.vk.getResourceBundle().getText("STEP_NAV_PROCEDURES"),
			tooltip: sap.ui.vk.getResourceBundle().getText("STEP_NAV_PROCEDURES"),
			level: "H5",
			titleStyle: "H5"
		}).addStyleClass("sapVizKitStepNavigationCurrentGroupTitle");

		// Create the "/" that seperates the current procedure and current step title text
		this._separatorTitle = new sap.m.Title({
			width: "5px",
			level: "H5",
			titleStyle: "H5"
		});

		// Create the current step title text
		this._currentStepTitle = new sap.m.Title({
			level: "H5",
			titleStyle: "H5"

		}).addStyleClass("sapVizKitStepNavigationCurrentStepTitle");

		// Add click functionality to current procedure title text
		this._currentGroupTitle.addEventDelegate({
			ontap: function() {
				this._selectViewGroup();
			}.bind(this)
		});

		// Add components to toolbar
		this._toolbar.addContent(this._currentGroupTitle)
			.addContent(this._separatorTitle)
			.addContent(this._currentStepTitle)
			.addContent(new sap.m.ToolbarSpacer())
			.addContent(this._stepCount)
			.addContent(new sap.m.ToolbarSpacer())
			.addContent(this._previousItemButton)
			.addContent(this._playButton)
			.addContent(this._nextItemButton);

		if (this.getShowAnimationTimeSlider()) {
			this.setAnimationTimeSlider(new AnimationTimeSlider());
		}
	};

	// Create both the horizontal and vertical step description boxes
	ViewGallery.prototype._createStepDescriptionBoxes = function(){
		this._stepDescription = new sap.m.VBox({
			renderType: sap.m.FlexRendertype.Bare,
			fitContainer: false,
			alignContent: sap.m.FlexAlignContent.Start,
			alignItems: sap.m.FlexAlignItems.Start,
			justifyContent: sap.m.FlexJustifyContent.End,
			items: [
				this._stepDescriptionToolbar = new sap.m.Toolbar({
					design: sap.m.ToolbarDesign.Solid,
					content: [
						this._stepDescriptionIcon = new sap.ui.core.Icon({
							src: "sap-icon://navigation-up-arrow",
							press: function(event) {
								this._toggleViewDescription();
							}.bind(this)
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionIcon"),
						new sap.m.ToolbarSpacer(),
						this._stepDescriptionOrientationIcon = new sap.ui.core.Icon({
							src: "sap-icon://vk-icons/landscape-text",
							press: function(event) {
								this._toggleOrientation();
							}.bind(this)
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionOrientationIcon")
					],
					layoutData: new sap.m.FlexItemData({
						shrinkFactor: 0
					})
				}).addStyleClass("sapVizKitViewGalleryStepDescriptionToolbar"),
				this._stepDescriptionScroll = new sap.m.ScrollContainer({
					horizontal: false,
					vertical: true,
					content: [
						this._stepDescriptionText = new sap.m.FormattedText({
						visible: false
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionText")
					]
				})
			]
		}).addStyleClass("sapVizKitViewGalleryStepDescription");

		this._stepDescriptionVertical = new sap.m.HBox({
			renderType: sap.m.FlexRendertype.Bare,
			fitContainer: false,
			alignContent: sap.m.FlexAlignContent.Start,
			alignItems: sap.m.FlexAlignItems.Start,
			justifyContent: sap.m.FlexJustifyContent.End,
			items: [
				this._stepDescriptionVerticalScroll = new sap.m.ScrollContainer({
					horizontal: false,
					vertical: true,
					content: [
						this._stepDescriptionVerticalText = new sap.m.FormattedText({
						visible: false
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalText")
					]
				}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalScroll"),
				this._stepDescriptionVerticalToolbar = new sap.m.Toolbar({
					design: sap.m.ToolbarDesign.Solid,
					content: [
						this._stepDescriptionVerticalIcon = new sap.ui.core.Icon({
							src: "sap-icon://navigation-right-arrow",
							press: function(event) {
								this._toggleViewDescriptionVertical();
							}.bind(this)
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalIcon"),
						this._stepDescriptionVerticalOrientationIcon = new sap.ui.core.Icon({
							src: "sap-icon://vk-icons/portrait-text",
							press: function(event) {
								this._toggleOrientation();
							}.bind(this)
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalOrientationIcon")
					],
					layoutData: new sap.m.FlexItemData({
						shrinkFactor: 0
					})
				}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalToolbar")
			]
		}).addStyleClass("sapVizKitViewGalleryStepDescriptionVertical");
	};

	// Places the procedure selection list
	ViewGallery.prototype._selectViewGroup = function() {
		var floatingWindowTarget = this._currentGroupTitle;
		this._viewGroupSelector.openBy(floatingWindowTarget);
	};

	// Toggles the step dewscription box between horizontal and vertical
	ViewGallery.prototype._toggleOrientation = function() {
		if (this._stepDescriptionToolbar.getVisible()){
			this._stepDescriptionToolbar.setVisible(false);
			this._stepDescriptionVerticalToolbar.setVisible(true);
			this._previousOrientationVertical = true;
			if (this._stepDescriptionText.getVisible()){
				this._stepDescriptionVerticalText.setVisible(true);
			}
			this._stepDescriptionText.setVisible(false);
		} else {
			this._stepDescriptionToolbar.setVisible(true);
			this._previousOrientationVertical = false;
			if (this._stepDescriptionVerticalText.getVisible()){
				this._stepDescriptionText.setVisible(true);
			}
			this._stepDescriptionVerticalToolbar.setVisible(false);
			this._stepDescriptionVerticalText.setVisible(false);
		}
		this._stepDescription.rerender();
		this._stepDescriptionVertical.rerender();
	};

	// Toggles the horizontal step deescription box between expanded and not
	ViewGallery.prototype._toggleViewDescription = function() {
		if (!this._stepDescriptionText.getVisible()){
			this._stepDescriptionText.setVisible(true);
			this._stepDescriptionIcon.addStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
			this._stepDescriptionVerticalIcon.addStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
		} else {
			this._stepDescriptionText.setVisible(false);
			this._stepDescriptionIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
			this._stepDescriptionVerticalIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
		}
		this._stepDescriptionText.rerender();
	};

	// Toggles the vertical step deescription box between expanded and not
	ViewGallery.prototype._toggleViewDescriptionVertical = function() {
		if (!this._stepDescriptionVerticalText.getVisible()){
			this._stepDescriptionVerticalText.setVisible(true);
			this._stepDescriptionVerticalIcon.addStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
			this._stepDescriptionIcon.addStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
		} else {
			this._stepDescriptionVerticalText.setVisible(false);
			this._stepDescriptionVerticalIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
			this._stepDescriptionIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
		}
		this._stepDescriptionVerticalText.rerender();
	};

	// Returns the ViewGallery main HBox
	ViewGallery.prototype._getHBox = function() {
		return this._hbox;
	};

	// Plays all steps of procedure from currently selected step until end of procedure
	ViewGallery.prototype._playProcedure = function() {
		if (this._modelViews) {
			var viewport = sap.ui.getCore().byId(this.getViewport());
			var selectedIndex = this.getSelectedIndex();
			if (selectedIndex === -1){
				selectedIndex = 0;
			}
			viewport.playProcedure(this._modelViews, selectedIndex);
		}
	};

	// When procedure finishes playing, resets the play button and the steps
	ViewGallery.prototype._finishProcedure = function() {
		this._playButton.setPressed(false);
		this._playButton.setIcon("sap-icon://media-play");
		this._playButton.setTooltip(sap.ui.vk.getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAY"));
		this._refreshItems();
	};

	ViewGallery.prototype._finishView = function(){
		this._playButton.setPressed(false);
		this._playButton.setIcon("sap-icon://media-play");
		this._playButton.setTooltip(sap.ui.vk.getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAY"));
	};

	// Pauses the procedure playing
	ViewGallery.prototype._pauseAnimation = function() {
		var viewport = sap.ui.getCore().byId(this.getViewport());
		viewport.pauseAnimation();
	};

	/**
	 * Attaches a Scene object to the View Gallery control so that it can access the Scene’s procedures and steps.
	 *
	 * @param {object} scene The Scene object to attach to the View Gallery control.
	 * @public
	 */
	ViewGallery.prototype.setScene = function(scene) {
		if (scene && scene.getSceneRef() === this._scene) {
			return;
		}

		// if cds loaded this content, we need to attach some event for refreshing
		// this is because cds can update content after the scene is loaded
		// as cds streaming information from the server
		if (scene && scene.loaders) {
			for (var i = 0; i < scene.loaders.length; i++) {
				if (scene.loaders[i] instanceof sap.ui.vk.threejs.ContentDeliveryService) {
					this._cdsLoader = scene.loaders[i]; // grab 1st one as we can only have one cds with scene atm
					this._cdsLoader.attachViewGroupUpdated(this._handleCdsViewGroupUpdate, this);
					break;
				}
			}
		}

		this._scene = scene ? scene.getSceneRef() : null;
		this._refreshProcedures();
		this._refreshItems();
	};

	ViewGallery.prototype.setViewport = function(viewport){
		this.setAssociation("viewport", viewport, true);

		if (viewport){
			var that = this;
			viewport.attachViewActivated(function(event){
				var items = that.getItems();
				var index = event.getParameter("viewIndex");
				var selectedItem = items[ index ];
				that.setSelectedItem(selectedItem, false, false);
			});
			viewport.attachProcedureFinished(function(event){
				that._finishProcedure();
			});
			viewport.attachViewFinished(function(event){
				if (that._userActivated){
					that._finishView();
				}
			});
			this._createStepDescriptionBoxes();
			viewport.addContent(this._stepDescription);
			viewport.addContent(this._stepDescriptionVertical);
			viewport.setAnimationTimeSlider(this.getAnimationTimeSlider());
			this.getAnimationTimeSlider().setViewport(viewport);
		}
	};

	// Populates the procedure select list
	ViewGallery.prototype._refreshProcedures = function() {
		this._procedureList.removeAllItems();
		this._viewportGroups = null;
		this._modelViews = null;

		if (this._scene && this._scene.userData) {
			this._viewportGroups = this._scene.userData.viewportGroups;
			if (this._viewportGroups && this._viewportGroups.length > 0) {
				this._viewportGroups.forEach(function(viewportGroup) {
					viewportGroup.id = THREE.Math.generateUUID();
					this._procedureList.addItem(new sap.ui.core.Item({
						key: viewportGroup.id,
						text: viewportGroup.name
					}));
				}.bind(this));
				this._modelViews = this._viewportGroups[ 0 ].modelViews;
				this._currentGroupTitle.setText(this._viewportGroups[ 0 ].name).setTooltip(this._viewportGroups[ 0 ].name);
			}
		}

		this._refreshItems();
	};

	ViewGallery.prototype.refresh = function(scene) {
		this.setScene(scene);
	};

	var emptyThumbnail = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAAA8CAYAAADIQIzXAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTA2LTA1VDEzOjU1OjAzKzEyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wNi0wNVQxNDowMDo1MCsxMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNi0wNVQxNDowMDo1MCsxMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyNGZiYjQ5MS1mNzFkLTRm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";

	// Refreshs the steps
	ViewGallery.prototype._refreshItems = function() {
		this._currentStepTitle.setText("");
		this._separatorTitle.setText("");
		this._viewGroupSelector.close();
		this._hbox.removeAllItems();
		this._items.clear();

		this._stepDescriptionToolbar.setVisible(false);
		this._stepDescriptionVerticalToolbar.setVisible(false);

		this._stepDescriptionText.setVisible(false);
		this._stepDescriptionIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");

		this._stepDescriptionVerticalText.setVisible(false);
		this._stepDescriptionVerticalIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");

		if (this._modelViews) {
			var press = function(event) {
				this.setSelectedItem(event.getSource().getParent(), true, true);
			}.bind(this);

			this._stepCount.setText(sap.ui.vk.getResourceBundle().getText("VIEWS_TITLE_WITH_COUNT", [ 0, this._modelViews.length ]));

			var stepNumber = 1;

			this._modelViews.forEach(function(modelView) {
				var img = new sap.m.Image({
					alt: modelView.name,
					src: modelView.thumbnailData || emptyThumbnail,
					densityAware: false,
					tooltip: modelView.name,
					press: press,
					layoutData: new sap.m.FlexItemData({
						shrinkFactor: 0
					})
				});

				var stepNumberText = new sap.m.FormattedText({
					htmlText: stepNumber
				}).addStyleClass("sapVizKitViewGalleryStepNumberText");

				img.addStyleClass("sapVizKitStepNavigationStepItem");
				var item = new sap.m.HBox({ items: [ stepNumberText, img ] });
				item.data("modelView", modelView);
				item.getImage = function() { return img; };
				item.getNumber = function() { return stepNumberText; };
				this._items.set(modelView, item);
				this._hbox.addItem(item);
				stepNumber++;
			}.bind(this));
		}
	};

	/**
	 * Sets the selected item.
	 *
	 * @param {sap.ui.core.Item | null} item New value for the selected item.
	 * @param {boolean} activateView Whether or not to activate the view
	 * @param {boolean} userActivated Whether or not the user manually activated the view
	 *
	 * @returns {sap.ui.vk.ViewGallery} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewGallery.prototype.setSelectedItem = function(item, activateView, userActivated) {
		if (this._selectedItem) {
			if (this._selectedItem !== item) {
				this._selectedItem.getImage().removeStyleClass("selected");
				this._selectedItem.getNumber().removeStyleClass("sapVizKitViewGalleryStepNumberTextSelected");
			}
		}

		this._selectedItem = item;
		this._userActivated = !!userActivated;
		var title = sap.ui.vk.getResourceBundle().getText("VIEWS_TITLE_WITH_COUNT", [ this.getSelectedIndex() + 1, this.getItems().length ]);
		this._stepCount.setText(title);
		if (item) {
			item.getNumber().addStyleClass("sapVizKitViewGalleryStepNumberTextSelected");
			item.getImage().addStyleClass("selected");
			if (this._isScrollingNecessary(item.getDomRef(), this._scrollContainer.getDomRef())) {
				this._scrollContainer.scrollToElement(item, 500);
			}
			var viewport = sap.ui.getCore().byId(this.getViewport());
			if (viewport && item.getCustomData().length > 0) {
				var modelView = item.getCustomData()[ 0 ].getValue();
				if (activateView){
					viewport.activateView(modelView);
				}
				if (modelView.description) {
					if (this._previousOrientationVertical === false) {
						this._stepDescription.setVisible(true);
						this._stepDescriptionToolbar.setVisible(true);
						this._stepDescriptionVerticalToolbar.setVisible(false);
					} else {
						this._stepDescriptionVertical.setVisible(true);
						this._stepDescriptionToolbar.setVisible(false);
						this._stepDescriptionVerticalToolbar.setVisible(true);
						this._previousOrientationVertical = true;
					}
				} else if (this._previousOrientationVertical === true) {
					this._stepDescriptionVertical.setVisible(false);
				} else {
					this._stepDescription.setVisible(false);
					this._previousOrientationVertical = false;
				}

				this._separatorTitle.setText("/");
				this._currentStepTitle.setText(modelView.name).setTooltip(modelView.name);
				if (modelView.description != null){
					this._stepDescriptionText.setHtmlText(modelView.description);
					this._stepDescriptionVerticalText.setHtmlText(modelView.description);
				}
			}
			this._stepDescription.rerender();
			this._stepDescriptionVertical.rerender();
		}

		this.fireSelectionChange({ item: item });

		return this;
	};

	/**
	 * Gets the selected item object.
	 *
	 * @returns {sap.ui.core.Item | null} The current selected item object, or null.
	 * @public
	 */
	ViewGallery.prototype.getSelectedItem = function() {
		return this._selectedItem;
	};

	/**
	 * Retrieves the index of the selected item.
	 *
	 * @returns {int} An integer specifying the selected index, or -1 if no item is selected.
	 * @public
	 */
	ViewGallery.prototype.getSelectedIndex = function() {
		return this.indexOfItem(this.getSelectedItem());
	};

	ViewGallery.prototype._isScrollingNecessary = function(item, scroller) {
		if (item && scroller) {
			var rect = item.getBoundingClientRect();
			return rect.left < 0 || rect.right > scroller.clientWidth;
		}
		return false;
	};

	////////////////////////////////////////////////////////////////////////
	// Content connector handling begins.

	ViewGallery.prototype._setContent = function(content) {
		this.setScene((content && content instanceof sap.ui.vk.threejs.Scene) ? content : null);
		if (content && content instanceof sap.ui.vk.threejs.Scene && content.builders) {
			for (var i = 0; i < content.builders.length; i++) {
				content.builders[i]._fireThumbnailLoaded = function(event) {
					var item = this._items.get(event.modelView);
					if (item) {
						item.getImage().setSrc(event.modelView.thumbnailData);
					}
				}.bind(this);
			}
		}
	};

	ViewGallery.prototype._onAfterUpdateContentConnector = function() {
		this._setContent(this._contentConnector.getContent());
	};

	ViewGallery.prototype._handleContentChangesStarted = function() {
		this.setScene(null);
	};

	ViewGallery.prototype._handleContentReplaced = function(event) {
		var content = event.getParameter("newContent");
		this._setContent(content);
	};

	ViewGallery.prototype._handleCdsViewGroupUpdate = function(event) {
		if (this._modelViews) {
			this._refreshItems();
		} else {
			this._refreshProcedures();
			this._refreshItems();
		}
	};

	// Content connector handling ends.
	////////////////////////////////////////////////////////////////////////

	ContentConnector.injectMethodsIntoClass(ViewGallery);

	return ViewGallery;

});
