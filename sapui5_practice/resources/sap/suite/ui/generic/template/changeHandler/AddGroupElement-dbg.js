sap.ui.define([
	"jquery.sap.global",
	"sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils",
	"sap/suite/ui/generic/template/changeHandler/util/AnnotationChangeUtilsV2"
], function(
	jQuery,
	Utils,
	AnnotationChangeUtils
) {
	"use strict";

	/**
	 * Change handler for adding a group element in a SmartForm group.
	 *
	 * @author SAP SE
	 * @version 1.66.0
	 * @experimental
	 */
	var DATAFIELD = "com.sap.vocabularies.UI.v1.DataField";
	var IMPORTANCE = "com.sap.vocabularies.UI.v1.Importance";
	var IMPORTANCEHIGH = "com.sap.vocabularies.UI.v1.ImportanceType/High";
	var FIELDGROUP = "com.sap.vocabularies.UI.v1.FieldGroup";
	var AddGroupElement = {};

	var fnHandleSpecificAddAction = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		var oEntityType = {};
		var oAnnotations = {};
		var oAnnotationsOld = {};
		var sAnnotation = "";
		var aDataFields = [];
		var mContent = {};
		var mChanges = {};
		var oGroup = mPropertyBag.modifier.bySelector(oSpecificChangeInfo.parentId, mPropertyBag.appComponent);
		var oParentSelector = mPropertyBag.modifier.getSelector(oSpecificChangeInfo.parentId, mPropertyBag.appComponent);
		var oMetaModel = Utils.getMetaModel(oSpecificChangeInfo, mPropertyBag);
		var oTemplData = Utils.getTemplatingInfo(oGroup);

		oEntityType = oMetaModel.getODataEntityType(oTemplData.target);
		sAnnotation = (oTemplData.value.indexOf("/") > 0) ? oTemplData.value.split("/")[1].substr(1) : oTemplData.value.substr(1);
		oAnnotations = oEntityType[sAnnotation];
		oAnnotationsOld = JSON.parse(JSON.stringify(oAnnotations));
		aDataFields = (sAnnotation.indexOf(FIELDGROUP) >= 0) ? oAnnotations.Data : oAnnotations;
		var oNewFieldProperty = oEntityType.property.find(function(obj) {
			return obj.name === oSpecificChangeInfo.bindingPath;
		});
		var oNewField = {
				Value: {
					Path: oSpecificChangeInfo.bindingPath
				},
				RecordType: DATAFIELD,
				EdmType: oNewFieldProperty && oNewFieldProperty.type
			};
		oNewField[IMPORTANCE] = {
				EnumMember: IMPORTANCEHIGH
		};
		aDataFields.splice(oSpecificChangeInfo.index, 0, oNewField);
		mContent = AnnotationChangeUtils.createCustomAnnotationTermChange(oTemplData.target, oAnnotations , oAnnotationsOld , sAnnotation);
		mContent.targetIndex = oSpecificChangeInfo.index;
		mContent.parentElementId = oGroup.getId();
		mContent.oParentSelector = oParentSelector;
		mContent.bindingPath = oSpecificChangeInfo.bindingPath;
		mContent.oAnnotation = oNewField;
		mContent.oEntityType = oEntityType;
		mContent.sAnnotation = sAnnotation;
		mChanges = AnnotationChangeUtils.createCustomChanges(mContent);
		mChanges.noRefreshOnChange = true;
		jQuery.extend(true, oChange.getContent(), mChanges);
	};

	AddGroupElement.applyChange = function (oChange, oControl, mPropertyBag) {
		var oDefinition = oChange.getDefinition();
		if (!oDefinition.transferred) {
			var sParentElementId = oChange.getContent().customChanges[0].parentElementId;
			var oParentSelector = oChange.getContent().customChanges[0].oParentSelector;
			var oParentElement = mPropertyBag.modifier.bySelector(oParentSelector);
			var sBindingPath = oChange.getContent().customChanges[0].bindingPath;
			var iTargetIndex =  oChange.getContent().customChanges[0].targetIndex;
			var oAnnotation = oChange.getContent().customChanges[0].oAnnotation;
			var sAnnotation = oChange.getContent().customChanges[0].sAnnotation;
			var oEntityType = oChange.getContent().customChanges[0].oEntityType;
			var oTemplData = {
				"sap.ui.dt": {
					"annotation": {
						"annotation": sAnnotation,
						"annotationContext": oAnnotation,
						"path": sAnnotation + "/Data/" + iTargetIndex,
						"target": oEntityType.namespace + "." + oEntityType.name,
						"value": sBindingPath
					}
				}
			};
			var sSmartFieldID = sParentElementId.substring(0, sParentElementId.lastIndexOf("::")) + "::" + sBindingPath + "::Field";
			var sGroupElementID = sParentElementId.substring(0, sParentElementId.lastIndexOf("::")) + "::" + sBindingPath + "::GroupElement";
			var oSmartField = new sap.ui.comp.smartfield.SmartField(sSmartFieldID, {value: "{" + sBindingPath + "}"});
			var oGroupElement =  new sap.ui.comp.smartform.GroupElement(sGroupElementID);
			oGroupElement.insertElement(oSmartField);
			var oCustomData = new sap.ui.core.CustomData({"key": "sap-ui-custom-settings", "value": oTemplData});
			oGroupElement.addCustomData(oCustomData);
			oParentElement.insertGroupElement(oGroupElement, iTargetIndex);
		}
	};

	AddGroupElement.revertChange = function(oChange, oControl, mPropertyBag) {
		//write revert change logic
	};

	AddGroupElement.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		oSpecificChangeInfo.custom = {};
		oSpecificChangeInfo.custom.fnGetAnnotationIndex = Utils.getIndexFromInstanceMetadataPath;
		fnHandleSpecificAddAction(oChange, oSpecificChangeInfo, mPropertyBag);
	};
	return AddGroupElement;
},
/* bExport= */true);
