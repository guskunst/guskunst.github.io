/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.core.mvc.View.
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/core/cache/CacheManager',
	"sap/base/Log",
	'sap/ui/core/mvc/View'
],
function (jQuery, JSONModel, ManagedObjectModel, ResourceModel, Cache, Log) {
	"use strict";
	var oResourceModel = new ResourceModel({ bundleName: "sap.fe.messagebundle", async : true}),
		oResourceModelPromise =	new Promise(function(resolve, reject){
			oResourceModel.attachRequestCompleted(resolve);
		});

	function MetaPath() {
		this.currentPath = '/';
		this.lastPath = '';
		this.set = function (sNewPath) {
			while (sNewPath.indexOf('../') === 0) {
				this.currentPath = this.currentPath.substr(0, this.currentPath.lastIndexOf(this.lastPath) - 1);
				this.lastPath = this.currentPath.substr(this.currentPath.lastIndexOf('/') + 1);
				sNewPath = sNewPath.substr(3);
			}
			if (sNewPath) {
				this.lastPath = sNewPath;
			}
			this.currentPath += sNewPath;
			Log.info('Current path is now : ' + this.currentPath);
		};
		this.get = function () {
			return this.currentPath;
		};
	}

	function create(mParameters) {
		var sViewName = mParameters.viewName,
			oAppComponent = mParameters.appComponent,
			sEntitySet = mParameters.entitySet,
			mViewData = mParameters.viewData,
			oMetaModel = mParameters.model.getMetaModel(),
			sStableId = mParameters.viewId,
			sCacheKeys;

		// Generate the FE cache key
		var sKey = oAppComponent.getMetadata().getName() + "_" + sStableId + "_" + sap.ui.getCore().getConfiguration().getLanguageTag(),
			aPreRequisites = [];

		aPreRequisites.push(
			Promise.all([Cache.get(sKey),oMetaModel.requestObject("/")])
			// Read FE Cache and wait until MetaModel has loaded all sources defined in the manifest
			.then(function(aResults) {
				var mCacheOutput = aResults[0];

				function checkMetadata(sUrl, sETag) {
					var mETags = oMetaModel.getETags();
					return new Promise(function(resolve, reject){
						if (!mETags[sUrl]) {
							// There is an Url in the FE cache, that's not in the MetaModel yet -> we need to check the ETag
							jQuery.ajax(sUrl, {
								method : 'GET'
							}).then(function (oResponse, sTextStatus, jqXHR) {
								if (sETag !== jqXHR.getResponseHeader('ETag') &&
									sETag !== jqXHR.getResponseHeader('Last-Modified')) {
									// ETag is not the same -> invalid
									resolve(false);
								} else {
									// ETag is the same -> valid
									resolve(true);
								}
							}, function (jqXHR, sTextStatus, sErrorMessage) {
								// Request failed -> assuming it's invalid
								resolve(false);
							});
						} else if (sETag !== mETags[sUrl]) {
							// ETag is not the same -> invalid
							resolve(false);
						} else {
							// ETag is the same -> valid
							resolve(true);
						}
					});
				}

				function checkAllMetadata(mCacheKeys) {
					var aMetadataPromises = [];
					Object.keys(mCacheKeys).forEach(function(sUrl) {
						// Check validity of every single Url that's in the FE Cache object
						aMetadataPromises.push(checkMetadata(sUrl, mCacheKeys[sUrl]));
					});
					return Promise.all(aMetadataPromises);
				}

				if (mCacheOutput) {
					// Cache entry found, check if it's still valid
					return checkAllMetadata(JSON.parse(mCacheOutput.newCacheKey)).then(function(aValid) {
						sCacheKeys = mCacheOutput.newCacheKey;
						if (aValid.every(function(valid) {return valid;})) {
							// Every ETag is still valid -> take the old cache key
							return {keys: [mCacheOutput.oldCacheKey]};
						} else {
							// At least one ETag is invalid -> take the new cache key
							return {keys: [sCacheKeys]};
						}
					});
				} else {
					// No cache entry, set a key... so an xml view cache entry is written
					sCacheKeys = 'initial';
					// Check if cache can be used (all the metadata and annotations have to provide at least a ETag or a Last-Modified header)
					var mETags = oMetaModel.getETags();
					Object.keys(mETags).forEach(function(sUrl) {
						if (!mETags[sUrl]) {
							sCacheKeys = null;
						}
					});
					return {keys: [sCacheKeys]};
				}
			})
			.catch(function(err) {
				// Don't use view cache in case of issues with the LRU cache
				return {keys: [null]};
			})
		);
		aPreRequisites.push(oResourceModelPromise);

		return Promise.all(aPreRequisites).then(function(aPromiseResults){

			var	oDeviceModel = new JSONModel(sap.ui.Device),
				oManifestModel = new JSONModel(oAppComponent.getMetadata().getManifest()),
				oViewDataModel = new JSONModel(mViewData),
				oMetaPathModel = new JSONModel({
					currentPath: new MetaPath()
				}),

				oViewSettings = {
					type : "XML",
					async: true,
					preprocessors: {
						xml: {
							bindingContexts: {
								entitySet: sEntitySet ? oMetaModel.createBindingContext("/" + sEntitySet) : null,
								viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
							},
							models: {
								entitySet: oMetaModel,
								'sap.fe.i18n': oResourceModel,
								'sap.ui.mdc.metaModel': oMetaModel,
								'sap.fe.deviceModel': oDeviceModel, // TODO: discuss names here
								'manifest' : oManifestModel,
								'viewData' : oViewDataModel,
								'metaPath' : oMetaPathModel
							}
						}
					},
					id: sStableId,
					viewName: sViewName,
					viewData : mViewData,
					// first promise is the FE cache promise containing the cache key
					cache: aPromiseResults[0] || {keys: [null]},
					height: "100%"
				};

			oDeviceModel.setDefaultBindingMode("OneWay");

			return oAppComponent.runAsOwner(function () {
				var oView = sap.ui.view(oViewSettings);

				oView.setModel(new ManagedObjectModel(oView), "$view");

				return oView.loaded().then(function(oView) {
					// Check FE cache after XML view is processed completely
					var sDataSourceETags = JSON.stringify(oMetaModel.getETags());
					if (sCacheKeys && sCacheKeys !== sDataSourceETags) {
						// Something in the sources and/or its ETags changed -> update the FE cache
						var mCacheKeys = {};
						// New ETags that need to be verified
						mCacheKeys.newCacheKey = sDataSourceETags;
						// Old ETags that are used for the xml view cache as key
						mCacheKeys.oldCacheKey = sCacheKeys;
						Cache.set(sKey, mCacheKeys);
					}
					return oView;
				});
			});
		});
	}

	var viewFactory = {
		create: create
	};

	return viewFactory;
});