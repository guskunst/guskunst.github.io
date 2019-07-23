/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

/**
 * Initialization Code and shared classes of library sap.ui.mdc.
 */
sap.ui.define([
	'sap/ui/model/json/JSONModel',
	'sap/ui/base/ManagedObject',
	'sap/ui/mdc/ResourceModel'],
function (JSONModel, ManagedObject, ResourceModel) {
	"use strict";

	//We need to decouple the loading of the runtime dependencies to avoid
	//circular loading of library.js
	//This will be removed once we can use declarative require in fragments
	var oRuntimeHelperPromises = Promise.resolve().then(function() {
		sap.ui.require([
			// those v4 helpers are listed here until we can add them to the XML as required
			"sap/ui/mdc/odata/v4/ValueListHelper",
			"sap/ui/mdc/odata/v4/field/FieldRuntime",
			"sap/ui/mdc/odata/v4/table/TableRuntime"
		], function() {
			return;
		});
	});
	var oI18nModel =  ResourceModel.getModel();
	//Pretend to be able to do object binding
	oI18nModel.bindContext = oI18nModel.bindContext || function () {
		return {
			initialize: function() {},
			attachChange: function() {},
			detachChange: function() {},
			attachEvents: function() {},
			detachEvents: function() {},
			updateRequired: function() {},
			destroy: function() {},
			getContext: function() {}
		};
	};

	function resolve(sFragmentName, oNode, oVisitor) {
		var sName = "this",
			sI18nName = sName + ".i18n",
			mContexts = {},
			oAttributesModel = new JSONModel(oNode),
			sMetadataContexts = oNode.getAttribute("metadataContexts"),
			oMetadataContexts,
			oSettings = oVisitor.getSettings();
		return oRuntimeHelperPromises.then(function() {
			//make sure all texts can be accessed at templating time
			mContexts[sI18nName] = oI18nModel.getContext("/");

			//Inject storage for macros
			if (!oSettings[sFragmentName]) {
				oSettings[sFragmentName] = {};
			}

			// First of all we need to visit the attributes
			return oVisitor.visitAttributes(oNode).then(function () {


				oAttributesModel._getObject = function (sPath, oContext) {
					// just return the attribute - we can't validate them and we don't support aggregations for now
					return oNode.getAttribute(sPath);
				};

				oAttributesModel.getContextName = function () {
					return sName;
				};

				if (sMetadataContexts) {
					oMetadataContexts = sMetadataContexts ? ManagedObject.bindingParser(sMetadataContexts) : {parts: []};
					if (!oMetadataContexts.parts) {
						oMetadataContexts = {parts: [oMetadataContexts]};
					}

					for (var j = 0; j < oMetadataContexts.parts.length; j++) {
						addSingleContext(mContexts, oVisitor, oMetadataContexts.parts[j], oMetadataContexts);
						// Make sure every previously defined context can be used in the next binding
						oVisitor = oVisitor["with"](mContexts, false);
					}

				}
				oAttributesModel.$$valueAsPromise = true;//for asynchronuous prepreocessing
				mContexts[sName] = oAttributesModel.getContext("/");

				var oContextVisitor = oVisitor["with"](mContexts, true);
				return oContextVisitor.insertFragment(sFragmentName, oNode);
			});
		});
	}

	function addSingleContext(mContexts, oVisitor, oCtx, oMetadataContexts) {
		var sKey = oCtx.name || oCtx.model || undefined;

		if (oMetadataContexts[sKey]) {
			return; // do not add twice
		}
		try {
			mContexts[sKey] = oVisitor.getContext(oCtx.model + ">" + oCtx.path);// add the context to the visitor
			oMetadataContexts[sKey] = mContexts[sKey];// make it available inside metadataContexts JSON object
		} catch (ex) {
			// ignore the context as this can only be the case if the model is not ready, i.e. not a preprocessing model but maybe a model for
			// providing afterwards
			// TODO not yet implemented
			//mContexts["_$error"].oModel.setProperty("/" + sKey, ex);
		}
	}

	return {
		resolve: resolve
	};
});
