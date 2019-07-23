/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/core/Control", "sap/ui/comp/util/FullScreenUtil"
], function(Control, FullScreenUtil) {
	"use strict";

	/**
	 * The base class for MDC composite controls
	 *
	 * @experimental
	 * @private
	 * @since 1.61
	 * @alias sap.ui.mdc.Control
	 */
	var BaseControl = Control.extend("sap.ui.mdc.BaseControl", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The width
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: "100%",
					invalidate: true
				},
				/**
				 * The height
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: "100%",
					invalidate: true
				},
				/**
				 * The module path of the metadata DELEGATE
				 */
				metadataDelegate: {
					type: "string",
					group: "Data"
				},
				/**
				 * The personalization
				 */
				personalization: {
					type: "any",
					multiple: false
				},
				/**
				 *
				 */
				fullScreen: {
					type: "boolean",
					defaultValue: false
				}
			}
		},
		renderer: Control.renderer
	});

	BaseControl.prototype.setMetadataDelegate = function(sMetadataDelegateModule) {
		this.oDelegatePromise = new Promise(function(resolve, reject) {
			sap.ui.require([
				sMetadataDelegateModule
			], function(MetadataDelegate) {
				this.DELEGATE = MetadataDelegate;
				resolve(MetadataDelegate);
			}.bind(this), function() {
				reject("Module not found control is not ready to use");
			});
		}.bind(this));

		return this.setProperty("metadataDelegate", sMetadataDelegateModule, true);
	};

	BaseControl.prototype.setFullScreen = function(bFullScreen) {
		FullScreenUtil.toggleFullScreen(this, bFullScreen, this.oFullScreenButton, this.setFullScreen);
		if (bFullScreen) {
			this.iHeight = this.getHeight();
			this.iWidth = this.getWidth();
			//the dom ref of the height is there
			var iDialogHeight = this._oFullScreenDialog.getDomRef() ? this._oFullScreenDialog.getDomRef().offsetHeight : "1000";
			var oToolbar = this.getAggregation("_toolbar");
			if (oToolbar) {
				var iToolbarHeight = oToolbar.getDomRef() ? oToolbar.getDomRef().offsetHeight : 0;
				iDialogHeight -= iToolbarHeight;
			}
			this.setHeight(iDialogHeight + "px");
			this.setWidth("100%");
		} else {
			this.setHeight(this.iHeight);
			this.setWidth(this.iWidth);
		}

		return this.setProperty("fullScreen", bFullScreen, true);
	};

	BaseControl.prototype.exit = function() {
		if (this._oFullScreenDialog) {
			this._oFullScreenDialog.destroy();
			delete this._oFullScreenDialog;
		}
	};

	return BaseControl;
}, /* bExport= */true);
