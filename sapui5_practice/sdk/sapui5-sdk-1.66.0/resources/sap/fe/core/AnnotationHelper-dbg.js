/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(
	["sap/base/Log", "sap/ui/model/odata/v4/AnnotationHelper"],
	function(Log, ODataModelAnnotationHelper) {
		"use strict";

		var AnnotationHelper = {
			/* this helper can be activated to debug template processing
			 debug: function (oContext) {
			 //debugger;
			 },
			 */

			getPresentationContext: function(oEntitySet) {
				var sPath = oEntitySet.getPath();
				var oPresentationVariant = oEntitySet.getObject(sPath + "/@com.sap.vocabularies.UI.v1.PresentationVariant");
				if (oPresentationVariant && oPresentationVariant.Visualizations) {
					return sPath + "/@com.sap.vocabularies.UI.v1.PresentationVariant";
				} else {
					return sPath + "/@com.sap.vocabularies.UI.v1.LineItem";
				}
			},

			getTargetContext: function(oTarget) {
				var sTarget = oTarget.getObject(oTarget.getPath()),
					sNavigationPath = ODataModelAnnotationHelper.getNavigationPath(oTarget.getPath());
				return sNavigationPath + "/" + sTarget;
			},

			getFormContext: function(oTarget) {
				var sAnnotationPath = oTarget.getObject(),
					sNavigationPath = ODataModelAnnotationHelper.getNavigationPath(sAnnotationPath),
					sSourceType,
					sTargetType;
				if (sNavigationPath) {
					sSourceType = ODataModelAnnotationHelper.getNavigationPath(oTarget.getPath());
					sTargetType = oTarget.getModel().getObject(sSourceType + '/' + sNavigationPath + '/@sapui.name');
					return '/' + sTargetType + sAnnotationPath.replace(sNavigationPath, '');
				}
				return oTarget.getPath();
			},

			getNavigationContext : function(oContext){
				return ODataModelAnnotationHelper.getNavigationPath(oContext.getPath());
			},

			replaceSpecialCharsInId: function (sId) {
				if (sId.indexOf(" ") >= 0) {
					Log.error("Annotation Helper: Spaces are not allowed in ID parts. Please check the annotations, probably something is wrong there.");
				}
				return sId.replace(/@/g, "").replace(/\//g, "::").replace(/#/g, "::");
			},
			createBindingForDraftAdminBlock: function(oMetaModel, sEntityType, sFormatter) {
				var sPath = "/" + sEntityType + "/DraftAdministrativeData/";
				return oMetaModel.requestObject(sPath).then(function(oDADEntityType) {
					var sBinding = "{parts: [{path: 'HasDraftEntity', targetType: 'any'}, " +
								//"{path: 'DraftAdministrativeData/LastChangeDateTime'}, " +
								"{path: 'DraftAdministrativeData/InProcessByUser'}, " +
								"{path: 'DraftAdministrativeData/LastChangedByUser'} ";
					if (oDADEntityType.InProcessByUserDescription) {
						sBinding += " ,{path: 'DraftAdministrativeData/InProcessByUserDescription'}";
					}

					if (oDADEntityType.LastChangedByUserDescription) {
						sBinding += ", {path: 'DraftAdministrativeData/LastChangedByUserDescription'}";
					}
					sBinding += "], formatter: '.editFlow." + sFormatter + "'}";
					return sBinding;
				});
			},
			getBindingForDraftAdminBlockInline: function(iContext, sEntityType) {
				return AnnotationHelper.createBindingForDraftAdminBlock(iContext.getModel(), sEntityType, 'formatDraftOwnerTextInline');
			},
			getBindingForDraftAdminBlockInPopover: function(iContext, sEntityType) {
				return AnnotationHelper.createBindingForDraftAdminBlock(iContext.getModel(), sEntityType, 'formatDraftOwnerTextInPopover');
			},
			checkForActions: function(aLineItems) {
				var oLineItem;
				for (var i = 0; i < aLineItems.length; i++) {
					oLineItem = aLineItems[i];
					if ((oLineItem["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAction"
						|| oLineItem["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation")
						&& !(oLineItem.Inline && oLineItem.Inline.Bool !== "true")) {
						return true;
					}
				}
				return false;
			},
			hasDeterminingActions: function(oEntityType) {
				var oDataFields = oEntityType['@com.sap.vocabularies.UI.v1.LineItem'];
				for (var i in oDataFields) {
					if (oDataFields[i].$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && oDataFields[i].Determining === true) {
						return true;
					}
				}
				return false;
			},

			/**
			 * checks if the navigation collection is insertable
			 * @function
			 * @static
			 * @name sap.fe.core.AnnotationHelper.isNavigationPropertyInsertable
			 * @memberof sap.fe.core.AnnotationHelper
			 * @param {string} sCurrentCollectionName The name of the navigation collection
			 * @param {array} aRestrictedProperties array of RestrictedProperties of NavigationRestrictions of the root collection
			 * @param {boolean} bInsertable Insertable value of the navigation collection
			 * @returns {boolean} true if insertable, false otherwise
			 * @private
			 * @sap-restricted
			**/
			isNavigationPropertyInsertable: function(sCurrentCollectionName, aRestrictedProperties, bInsertable) {
				// If insertable = true via NavigationRestriction of root collection, navigation collection is insertable
				// If NOT insertable via NavigationRestriction of root collection, navigation collection is NOT insertable
				// If insertable property is undefined for the NavigationRestrictions of the root collection,
				// 	then insertable property of the navigation collection is considered.
				// 	If insertable = true, navigation collection is insertable
				// 	If insertable = false, navigation collection is NOT insertable
				// If Insertable is undefined via navigation restriction of root collection
				// 	and Insertable is undefined at navigation collection,
				// 	then navigation collection is insertable.
				var i, oNavigationProperty;
				for (i in aRestrictedProperties) {
					oNavigationProperty = aRestrictedProperties[i];
					if (oNavigationProperty.NavigationProperty.$NavigationPropertyPath === sCurrentCollectionName && oNavigationProperty.InsertRestrictions) {
						return oNavigationProperty.InsertRestrictions.Insertable;
					}
				}
				return bInsertable !== false;
			}
		};

		AnnotationHelper.getBindingForDraftAdminBlockInline.requiresIContext = true;
		AnnotationHelper.getBindingForDraftAdminBlockInPopover.requiresIContext = true;

		return AnnotationHelper;
	}
, true);