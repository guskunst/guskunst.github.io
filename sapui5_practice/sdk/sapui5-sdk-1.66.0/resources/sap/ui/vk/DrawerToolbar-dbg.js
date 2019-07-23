/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.DrawerToolbar.
sap.ui.define([
	"jquery.sap.global", "./library", "./DrawerToolbarRenderer", "sap/ui/core/Control",
	"sap/m/VBox", "sap/m/FlexItemData", "sap/m/OverflowToolbar", "sap/ui/core/Icon",
	"sap/m/Button", "sap/m/ToolbarSeparator", "sap/m/ToggleButton", "sap/m/MenuButton",
	"sap/ui/vk/tools/Tool", "sap/ui/vk/tools/RotateTurntableTool", "sap/ui/vk/tools/RotateOrbitTool", "sap/ui/vk/tools/RectSelectTool", "sap/ui/vk/tools/CrossSectionTool",
	"sap/m/Menu", "sap/m/MenuItem"
], function(Query, library, DrawerToolbarRenderer, Control,
	VBox, FlexItemData, OverflowToolbar, Icon,
	Button, ToolbarSeparator, ToggleButton, MenuButton,
	Tool, RotateTurntableTool, RotateOrbitTool, RectSelectTool, CrossSectionTool,
	Menu, MenuItem) {
	"use strict";

	/**
	 * Constructor for a new DrawerToolbar control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Overflow toolbar that can be collapsed.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP
	 * @version 1.66.0
	 *
	 * @public
	 * @alias sap.ui.vk.DrawerToolbar
	 */
	var DrawerToolbar = Control.extend("sap.ui.vk.DrawerToolbar", /** @lends sap.ui.vk.DrawerToolbar.prototype */ {
		metadata: {
			properties: {

				/**
				 * Indicates whether the DrawerToolbar is expanded or not.
				 * If expanded is set to true, then both the toolbar and 'Close' icon are rendered.
				 * If expanded is set to false, then only the 'Open' icon is rendered.
				 */
				expanded: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				/**
				 * Determines the content of the DrawerToolbar. See {@link sap.m.OverflowToolbar} for list of allowed controls.
				 * The content visible when the DrawerToolbar is expanded.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						getter: "_getToolbar",
						aggregation: "content",
						forwardBinding: true
					}
				}
			},
			associations: {
				viewport: {
					type: "sap.ui.vk.Viewport",
					multiple: false
				}
			},
			events: {

				/**
				 * Indicates that the DrawerToolbar expanded or collapsed.
				 */
				expanded: {
					parameters: {
						/**
						 * If the DrawerToolbar expanded, this is true.
						 * If the DrawerToolbar collapsed, this is false.
						 */
						expand: {
							type: "boolean"
						}
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
		}
	});

	var drawerToolbarIcons = [ {
			name: "show",
			unicode: "e000"
		}, {
			name: "hide",
			unicode: "e001"
		}, {
			name: "turntable",
			unicode: "e002"
		}, {
			name: "orbit",
			unicode: "e003"
		}, {
			name: "pan",
			unicode: "e004"
		}, {
			name: "zoom",
			unicode: "e005"
		}, {
			name: "fit-to-view",
			unicode: "e006"
		}, {
			name: "rectangular-selection",
			unicode: "e007"
		}, {
			name: "structure-browser",
			unicode: "e008"
		}, {
			name: "configuration",
			unicode: "e009"
		}, {
			name: "setting",
			unicode: "e00a"
		}, {
			name: "full-screen",
			unicode: "e00b"
		}, {
			name: "predefined-views",
			unicode: "e00c"
		}, {
			name: "authoring-app",
			unicode: "e00d"
		}, {
			name: "dot",
			unicode: "e00e"
		}, {
			name: "empty",
			unicode: "e00f"
		}, {
			name: "right-panel-menu",
			unicode: "e010"
		}, {
			name: "viewer-app",
			unicode: "e011"
		}, {
			name: "hide-association",
			unicode: "e012"
		}, {
			name: "cross-section",
			unicode: "e013"
		}, {
			name: "cross-section-x",
			unicode: "e014"
		}, {
			name: "cross-section-z",
			unicode: "e015"
		}, {
			name: "cross-section-y",
			unicode: "e016"
		}, {
			name: "reverse-direction",
			unicode: "e017"
		}, {
			name: "create-editable-visualisation",
			unicode: "e018"
		}, {
			name: "cross-section-z-",
			unicode: "e019"
		} ],
		collectionName = "vk-icons",
		fontFamily = "vk-icons";

	drawerToolbarIcons.forEach(function(icon) {
		sap.ui.core.IconPool.addIcon(icon.name, collectionName, fontFamily, icon.unicode);
	});

	var visIconPath = "sap-icon://vk-icons/";

	DrawerToolbar.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.apply(this);
		}

		this._toolbar = new OverflowToolbar({
			width: "auto",
			design: sap.m.ToolbarDesign.Solid,
			layoutData: new FlexItemData({
				growFactor: 0,
				shrinkFactor: 0
			}),
			content: this.createButtons()
		});

		this._toolbar.ontouchstart = function(event) {
			event.setMarked(); // disable the viewport touchstart event under the toolbar
		};

		this._container = new VBox({
			renderType: sap.m.FlexRendertype.Bare,
			// fitContainer: false,
			// displayInline: true,
			alignContent: sap.m.FlexAlignContent.Center,
			alignItems: sap.m.FlexAlignItems.Center,
			items: [
				this._toolbar,
				new Icon({
					src: "sap-icon://navigation-up-arrow",
					noTabStop: true,
					press: function(event) {
						this._toggleExpanded();
					}.bind(this),
					layoutData: new FlexItemData({
						growFactor: 0,
						shrinkFactor: 0
					})
				}).addStyleClass("drawerToolbarIcon")
			]
		});
	};

	DrawerToolbar.prototype._getViewport = function() {
		var viewport = sap.ui.getCore().byId(this.getViewport());
		if (viewport instanceof sap.ui.vk.threejs.Viewport) {
			return viewport;
		}
		if (viewport instanceof sap.ui.vk.Viewport &&
			viewport._implementation instanceof sap.ui.vk.threejs.Viewport) {
			return viewport._implementation;
		}
		return null;
	};

	var predefinedViews = [
		null, // initial
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0), // front
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI), // back
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2), // left
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2), // right
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), // top
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2) // bottom
	];

	DrawerToolbar.prototype.createButtons = function() {
		var that = this;

		var crossSectionButton, crossSectionAxis;
		function activateCrossSectionTool(viewport, axis, flip) {
			if (!that._crossSectionTool) {
				that._crossSectionTool = new CrossSectionTool();
				viewport.addTool(that._crossSectionTool);
			}

			crossSectionButton.setPressed(true);
			that._crossSectionTool.setActive(true, viewport);
			if (axis !== undefined) {
				that._crossSectionTool.setAxis(axis);
				// that._crossSectionTool.setFlip(flip);
				crossSectionAxis.setIcon(visIconPath + "cross-section-" + [ "x", "y", "z" ][ axis ]);
			}
		}

		crossSectionButton = new ToggleButton({
			icon: visIconPath + "cross-section",
			type: sap.m.ButtonType.Transparent,
			tooltip: "Cross Section",
			press: function(event) {
				var viewport = that._getViewport();
				if (viewport) {
					// crossSectionAxis.setEnabled(this.getPressed());
					if (this.getPressed()) {
						activateCrossSectionTool(viewport);
					} else if (that._crossSectionTool) {
						that._crossSectionTool.setActive(false, viewport);
					}
				}
			}
		});

		crossSectionAxis = new MenuButton({
			type: sap.m.ButtonType.Transparent,
			tooltip: "Cross Section Axis",
			icon: visIconPath + "cross-section-x",
			// buttonMode: "Split",
			menu: new Menu({
				items: [
					new MenuItem({
						icon: visIconPath + "cross-section-x",
						text: "X",
						press: function(event) {
							var viewport = that._getViewport();
							if (viewport) {
								activateCrossSectionTool(viewport, 0, false);
							}
						}
					}),
					new MenuItem({
						icon: visIconPath + "cross-section-y",
						text: "Y",
						press: function(event) {
							var viewport = that._getViewport();
							if (viewport) {
								activateCrossSectionTool(viewport, 1, false);
							}
						}
					}),
					new MenuItem({
						icon: visIconPath + "cross-section-z",
						text: "Z",
						press: function(event) {
							var viewport = that._getViewport();
							if (viewport) {
								activateCrossSectionTool(viewport, 2, false);
							}
						}
					}),
					// new MenuItem({
					// 	icon: visIconPath + "cross-section-z-",
					// 	text: "Z -",
					// 	press: function(event) {
					// 		var viewport = that._getViewport();
					// 		if (viewport) {
					// 			activateCrossSectionTool(viewport, 2, true);
					// 		}
					// 	}
					// }),
					new MenuItem({
						icon: visIconPath + "reverse-direction",
						text: "Flip",
						startsSection: true,
						press: function(event) {
							var viewport = that._getViewport();
							if (viewport && that._crossSectionTool && that._crossSectionTool.getActive()) {
								that._crossSectionTool.setFlip(!that._crossSectionTool.getFlip());
							}
						}
					})
				]
			})
		});

		this._gestureButtons = [
			new ToggleButton({
				icon: visIconPath + "turntable",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Turntable",
				press: function(event) {
					var viewport = that._getViewport();
					if (viewport) {
						that._activateGesture(viewport, 0);
					}
				}
			}),
			new ToggleButton({
				icon: visIconPath + "orbit",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Orbit",
				pressed: false,
				press: function(event) {
					var viewport = that._getViewport();
					if (viewport) {
						that._activateGesture(viewport, 1);
					}
				}
			}),
			new ToggleButton({
				icon: visIconPath + "pan",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Pan",
				press: function(event) {
					var viewport = that._getViewport();
					if (viewport) {
						that._activateGesture(viewport, 2);
					}
				}
			}),
			new ToggleButton({
				icon: visIconPath + "zoom",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Zoom",
				press: function() {
					var viewport = that._getViewport();
					if (viewport) {
						that._activateGesture(viewport, 3);
					}
				}
			})
		];

		var items = [
			new Button({
				icon: visIconPath + "show",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Show",
				press: function() {
					var viewport = that._getViewport();
					if (viewport) {
						var vsm = viewport._viewStateManager;
						var selected = [];
						vsm.enumerateSelection(function(item) {
							selected.push(item);
						});
						vsm.setVisibilityState(selected, true, false);
					}
				}
			}),
			new Button({
				icon: visIconPath + "hide",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Hide",
				press: function() {
					var viewport = that._getViewport();
					if (viewport) {
						var vsm = viewport._viewStateManager;
						var selected = [];
						vsm.enumerateSelection(function(item) {
							selected.push(item);
						});
						vsm.setVisibilityState(selected, false, false);
					}
				}
			}),
			new ToolbarSeparator(),
			this._gestureButtons[ 0 ],
			this._gestureButtons[ 1 ],
			this._gestureButtons[ 2 ],
			this._gestureButtons[ 3 ],
			new ToolbarSeparator(),
			new Button({
				icon: visIconPath + "fit-to-view",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Fit to View",
				press: function() {
					var viewport = that._getViewport();
					if (viewport) {
						viewport.zoomTo(sap.ui.vk.ZoomTo.All, null, 0.5, 0);
					}
				}
			}),
			new ToolbarSeparator(),
			new ToggleButton({
				icon: visIconPath + "rectangular-selection",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Rectangular Selection",
				press: function(event) {
					var viewport = that._getViewport();
					if (viewport) {
						if (!that._rectSelectTool) {
							that._rectSelectTool = new RectSelectTool();
						}
						that._rectSelectTool.setActive(this.getPressed(), viewport);
					}
				}
			}),
			new ToolbarSeparator(),
			crossSectionButton,
			crossSectionAxis,
			new ToolbarSeparator(),
			new MenuButton({
				icon: visIconPath + "predefined-views",
				activeIcon: visIconPath + "predefined-views",
				type: sap.m.ButtonType.Transparent,
				tooltip: sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_MENUBUTTONTOOLTIP"),
				menu: new Menu({
					items: [
						new MenuItem({ text: sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_INITIAL") }),
						new MenuItem({ text: sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_FRONT"), startsSection: true }),
						new MenuItem({ text: sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_BACK") }),
						new MenuItem({ text: sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_LEFT") }),
						new MenuItem({ text: sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_RIGHT") }),
						new MenuItem({ text: sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_TOP") }),
						new MenuItem({ text: sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_BOTTOM") })
					]
				}).attachItemSelected(function(event) {
					var viewport = that._getViewport();
					if (viewport) {
						var item = event.getParameters("item").item;
						var index = this.indexOfItem(item);
							viewport._viewportGestureHandler.setView(predefinedViews[ index ], 1000);
					}
				})
			}),
			new ToolbarSeparator(),
			new ToggleButton({
				icon: visIconPath + "full-screen",
				type: sap.m.ButtonType.Transparent,
				tooltip: sap.ui.vk.getResourceBundle().getText("VIEWER_FULLSCREENBUTTONTOOLTIP"),
				press: function(event) {
					var viewport = that._getViewport();
					var isInFullScreen = function(document) {
						return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement);
					};
					if (this.getPressed()) {
						if (!isInFullScreen(document)) {
							if (!that._fullScreenHandler) {
								that._fullScreenHandler = function(event) {
									var isFullScreen = isInFullScreen(document);
									if (!isFullScreen) {
										document.removeEventListener("fullscreenchange", that._fullScreenHandler);
										document.removeEventListener("mozfullscreenchange", that._fullScreenHandler);
										document.removeEventListener("webkitfullscreenchange", that._fullScreenHandler);
										document.removeEventListener("MSFullscreenChange", that._fullScreenHandler);

										this.setPressed(false);
										viewport.removeStyleClass("sapVizKitViewerFullScreen");
									}
								}.bind(this);
							}

							var bodyElement = document.getElementsByTagName("body")[ 0 ];
							if (bodyElement.requestFullscreen) {
								document.addEventListener("fullscreenchange", that._fullScreenHandler);
								bodyElement.requestFullscreen();
							} else if (bodyElement.webkitRequestFullScreen) {
								document.addEventListener("webkitfullscreenchange", that._fullScreenHandler);
								bodyElement.webkitRequestFullscreen();
							} else if (bodyElement.mozRequestFullScreen) {
								document.addEventListener("mozfullscreenchange", that._fullScreenHandler);
								bodyElement.mozRequestFullScreen();
							} else if (bodyElement.msRequestFullscreen) {
								document.addEventListener("MSFullscreenChange", that._fullScreenHandler);
								bodyElement.msRequestFullscreen();
							}
						}

						viewport.addStyleClass("sapVizKitViewerFullScreen");
					} else {
						if (isInFullScreen(document)) {
							if (document.cancelFullScreen) {
								document.cancelFullScreen();
							} else if (document.msExitFullscreen) {
								document.msExitFullscreen();
							} else if (document.mozCancelFullScreen) {
								document.mozCancelFullScreen();
							} else if (document.webkitCancelFullScreen) {
								document.webkitCancelFullScreen();
							}
						}

						viewport.removeStyleClass("sapVizKitViewerFullScreen");
					}
				}
			})
		];
		return items;
	};

	var gestureIcons = [ "drawerToolbarIconTurntable", "drawerToolbarIconOrbit", "drawerToolbarIconPan", "drawerToolbarIconZoom" ];

	var CameraHandler = function(vp) {
		this.viewport = vp;
		this._mode = 1;
		this._gesture = false;
		this._x = 0;
		this._y = 0;
	};

	CameraHandler.prototype.beginGesture = function(event) {
		this._gesture = true;
		if (this._mode < 3) {
			this._x = event.points[ 0 ].x;
			this._y = event.points[ 0 ].y;
		} else {
			this._x = event.x;
			this._y = event.y;
		}
	};

	CameraHandler.prototype.endGesture = function() {
		this._gesture = false;
		this.viewport.removeStyleClass(gestureIcons[ this._mode ]);
	};

	CameraHandler.prototype.move = function(event) {
		if (this._gesture && event.n == 1) {
			this.viewport.addStyleClass(gestureIcons[ this._mode ]);
			var p = event.points[ 0 ];
			var dx = p.x - this._x;
			var dy = p.y - this._y;
			var cameraController = this.viewport._viewportGestureHandler._cameraController;
			switch (this._mode) {
				case 0: cameraController.rotate(dx, dy, true); break;
				case 1: cameraController.rotate(dx, dy, false); break;
				case 2: cameraController.pan(dx, dy); break;
				case 3: cameraController.zoom(1 + dy * 0.005); break;
				default: break;
			}
			this._x = p.x;
			this._y = p.y;
			event.handled = true;
		}
	};

	CameraHandler.prototype.hover = function() {};
	CameraHandler.prototype.getViewport = function() {
		return this.viewport;
	};

	DrawerToolbar.prototype._activateGesture = function(viewport, mode) {
		this._gestureButtons.forEach(function(gestureButton, index) {
			gestureButton.setPressed(index === mode);
		});

		if (!this._cameraHandler) {
			this._cameraHandler = new CameraHandler(viewport);
			viewport._loco.addHandler(this._cameraHandler, 0);
		}
		this._cameraHandler._mode = mode;
	};

	DrawerToolbar.prototype._getToolbar = function() {
		return this._toolbar;
	};

	DrawerToolbar.prototype._toggleExpanded = function() {
		var newState = !this.getExpanded();
		this.setExpanded(newState);

		this.fireExpanded({
			expand: newState
		});
	};

	/**
	 * Sets the expanded property of the control.
	 * @param {boolean} bExpanded Defines whether control is expanded or not.
	 * @returns {sap.ui.vk.DrawerToolbar} Pointer to the control instance to allow method chaining.
	 * @public
	 */
	DrawerToolbar.prototype.setExpanded = function(bExpanded) {
		this.setProperty("expanded", bExpanded, true);

		var domRef = this.getDomRef();
		if (domRef) {
			if (!bExpanded) {
				domRef.classList.add("drawerToolbarCollapsed");
				domRef.classList.remove("drawerToolbarExpanded");
			} else {
				domRef.classList.add("drawerToolbarExpanded");
				domRef.classList.remove("drawerToolbarCollapsed");
			}
		}

		return this;
	};


	DrawerToolbar.prototype.onAfterRendering = function() {
		var viewport = this._getViewport();
		if (viewport) {
			this._activateGesture(viewport, 1);
		}
	};


	return DrawerToolbar;

});
