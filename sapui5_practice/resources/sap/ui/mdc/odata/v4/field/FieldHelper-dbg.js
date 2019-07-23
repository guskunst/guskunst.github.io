/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/mdc/odata/v4/CommonHelper",
	"sap/ui/mdc/base/FieldBase",
	"sap/ui/mdc/ResourceModel",
	"sap/ui/model/odata/v4/AnnotationHelper",
	"sap/ui/base/ManagedObject",
	"sap/base/Log"], function (CommonHelper, FieldBase, ResourceModel, AnnotationHelper, ManagedObject, Log) {
	"use strict";

	var ISOCurrency = "@Org.OData.Measures.V1.ISOCurrency",
		Unit = "@Org.OData.Measures.V1.Unit",
		UNIT_ANNOTATIONS = {},
		COMMA = ', ';


	UNIT_ANNOTATIONS[ISOCurrency] = {
		ui5Type: "sap.ui.model.type.Currency",
		formatOptions: 'parseAsString : true'
	};

	/**
	 * What does the map look like?
	 * 	{
	 *  	'namespace.of.entityType' : [
	 * 			[namespace.of.entityType1#Qualifier,namespace.of.entityType2#Qualifier], --> Search For: mappingSourceEntities
	 * 			{
	 * 				'property' : [namespace.of.entityType3#Qualifier,namespace.of.entityType4#Qualifier] --> Search For: mappingSourceProperties
	 * 			}
	 * 	}
	 * @param {Object} oInterface
	 * @returns {Promise} Promise resolved when the map is ready and provides the map
	 */
	function _generateSideEffectsMap (oInterface) {
		var oMetaModel = oInterface.getModel(),
			oFieldSettings = oInterface.getSetting("sap.ui.mdc.odata.v4.Field"),
			oSideEffects = oFieldSettings.sideEffects;

		// Generate map once
		if (oSideEffects) {
			return Promise.resolve(oSideEffects);
		}

		oSideEffects = {};
		return oMetaModel.requestObject('/$').then(function (oEverything) {
			var // just get the entity types
				fnFilterEntityTypes = function (sKey) {
					return oEverything[sKey]['$kind'] === 'EntityType';
				},
				// map each side effect
				fnMapSideEffect = function (sEntityType, sSideEffectAnnotation, oSideEffectAnnotation) {
					var sQualifier = sSideEffectAnnotation.indexOf('#') > -1 && sSideEffectAnnotation.substr(sSideEffectAnnotation.indexOf('#')) || '',
						aSourceProperties = oSideEffectAnnotation.SourceProperties || [],
						aSourceEntities = oSideEffectAnnotation.SourceEntities || [],
						// for each source property, source entity, there could be a oMetaModel.requestObject(...) to get the target entity type of the navigation involved
						aPromises = [];
					aSourceProperties.forEach(function (oSourceProperty) {
						var sPath = oSourceProperty['$PropertyPath'],
							// if the property path has a navigation, get the target entity type of the navigation
							sNavigationPath = sPath.indexOf('/') > 0 ? '/' + sEntityType + '/' + sPath.substr(0, sPath.lastIndexOf('/') + 1) + '@sapui.name' : false,
							pOwnerEntity = !sNavigationPath ? Promise.resolve(sEntityType) : oMetaModel.requestObject(sNavigationPath);

						sPath = sNavigationPath ? sPath.substr(sPath.lastIndexOf('/') + 1) : sPath;

						aPromises.push(pOwnerEntity.then(function (sOwnerEntityType) {
							oSideEffects[sOwnerEntityType] = oSideEffects[sOwnerEntityType] || [[], {}];
							oSideEffects[sOwnerEntityType][1][sPath] = oSideEffects[sOwnerEntityType][1][sPath] || [];
							// if there is only one source property, side effect request is required immediately
							oSideEffects[sOwnerEntityType][1][sPath].push(sEntityType + sQualifier + (aSourceProperties.length === 1 && '$$ImmediateRequest' || '')); // --> mappingSourceProperties
						}));
					});
					aSourceEntities.forEach(function (oSourceEntity) {
						var sNavigationPath = oSourceEntity['$NavigationPropertyPath'],
							pOwnerEntity;
						// Source entities will have an empty path, meaning same as the target entity type of the side effect annotation
						// or will always have navigation, get target entity for this navigation path
						if (sNavigationPath === '') {
							pOwnerEntity = Promise.resolve(sEntityType);
						} else {
							pOwnerEntity = oMetaModel.requestObject('/' + sEntityType + '/' + sNavigationPath + '/@sapui.name');
						}
						aPromises.push(pOwnerEntity.then(function (sOwnerEntityType) {
							oSideEffects[sOwnerEntityType] = oSideEffects[sOwnerEntityType] || [[], {}];
							// side effects for fields referenced via source entities must always be requested immediately
							oSideEffects[sOwnerEntityType][0].push(sEntityType + sQualifier + '$$ImmediateRequest'); // --> mappingSourceEntities
						}));
					});
					// returned promise is resolved when all the source properties and source entities of the side effect have been mapped
					return Promise.all(aPromises);
				},
				// map each entity type which has side effects annotated
				fnMapEntityType = function (sEntityType) {
					return oMetaModel.requestObject('/' + sEntityType + '@').then(function (oAnnotations) {
						var aSideEffects = Object.keys(oAnnotations)
							.filter(function (sAnnotation) {
								return sAnnotation.indexOf('@com.sap.vocabularies.Common.v1.SideEffects') > -1;
							}).map(function (sSideEffectAnnotation) {
								return fnMapSideEffect(sEntityType, sSideEffectAnnotation, oAnnotations[sSideEffectAnnotation]);
							});
						// returned promise is resolved when all the side effects annotated on this entity type have been mapped
						return Promise.all(aSideEffects);
					});
				};
			// get everything --> filter the entity types which have side effects annotated --> map each side effect --> then return the map
			// returned promise is resolved when the map is ready
			return Promise.all(Object.keys(oEverything).filter(fnFilterEntityTypes).map(fnMapEntityType)).then(function () {
				oFieldSettings.sideEffects = oSideEffects;
				return oSideEffects;
			});
		});
	}


	// UNIT_ANNOTATIONS[Unit] = {
	// 	ui5Type: "sap.ui.model.type.Unit",
	// 	formatOptions: ""
	// };
	/**
	 * Helper class used by MDC controls for OData(V4) specific handling
	 *
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 */
	var FieldHelper = {
		/* Determine how to show the value by analyzing Text and TextArrangement Annotations */
		displayMode: function(oAnnotations, oInterface) {
			var oTextArrangementAnnotation = oAnnotations['@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement'];
			if (!oAnnotations['@com.sap.vocabularies.Common.v1.Text']) {
				return 'Value';
			} else if (oTextArrangementAnnotation) {
				if (oTextArrangementAnnotation.$EnumMember === 'com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly') {
					return 'Description';
				} else if (oTextArrangementAnnotation.$EnumMember === 'com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst') {
					return 'DescriptionValue';
				}
			}
			//Default if there is a Text annotation andn either TextOnly nor TextFirst are set
			return 'ValueDescription';
		},
		//FilterField
		isRequiredInFilter: function(path, oDetails) {
			var sEntitySetPath,
				sProperty,
				bIsRequired = false,
				oFilterRestrictions,
				oModel = oDetails.context.getModel(),
				sPropertyPath = oDetails.context.getPath();

			sEntitySetPath = CommonHelper._getEntitySetPath(oModel, sPropertyPath);
			if (typeof path === "string") {
				sProperty = path;
			} else {
				sProperty = oModel.getObject(sPropertyPath + "@sapui.name");
			}
			oFilterRestrictions = oModel.getObject(sEntitySetPath + "@Org.OData.Capabilities.V1.FilterRestrictions");
			if (oFilterRestrictions && oFilterRestrictions.RequiredProperties) {
				bIsRequired = oFilterRestrictions.RequiredProperties.some(function(property) {
					return property.$PropertyPath === sProperty;
				});
			}
			return bIsRequired;
		},
		buildExpressionForCriticalityIcon: function (sCriticalityProperty) {
			if (sCriticalityProperty) {
				var sExpression = "{= (${" + sCriticalityProperty + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Negative') || (${" + sCriticalityProperty + "} === '1') || (${" + sCriticalityProperty + "} === 1) ? 'sap-icon://status-negative' : " +
					"(${" + sCriticalityProperty + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Critical') || (${" + sCriticalityProperty + "} === '2') || (${" + sCriticalityProperty + "} === 2) ? 'sap-icon://status-critical' : " +
					"(${" + sCriticalityProperty + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Positive') || (${" + sCriticalityProperty + "} === '3') || (${" + sCriticalityProperty + "} === 3) ? 'sap-icon://status-positive' : " +
					"'sap-icon://status-inactive' }";

				return sExpression;
			}
			return undefined;
		},

		buildExpressionForCriticalityColor: function (sCriticalityProperty) {
			if (sCriticalityProperty) {
				var sExpression = "{= (${" + sCriticalityProperty + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Negative') || (${" + sCriticalityProperty + "} === '1') || (${" + sCriticalityProperty + "} === 1) ? 'Error' : " +
					"(${" + sCriticalityProperty + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Critical') || (${" + sCriticalityProperty + "} === '2') || (${" + sCriticalityProperty + "} === 2) ? 'Warning' : " +
					"(${" + sCriticalityProperty + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Positive') || (${" + sCriticalityProperty + "} === '3') || (${" + sCriticalityProperty + "} === 3) ? 'Success' : " +
					"'None' }";

				return sExpression;
			}
			return undefined;
		},
		buildExpressionForTextValue: function (sPropertyPath, oDataField) {
			var oMetaModel = oDataField.context.getModel(),
				sPath = oDataField.context.getPath(),
				oTextAnnotation = oMetaModel.getObject(sPath + "@com.sap.vocabularies.Common.v1.Text"),
				sTextExpression = oTextAnnotation ? AnnotationHelper.value(oTextAnnotation, oDataField) : undefined,
				sExpression = "";

			sPropertyPath = AnnotationHelper.getNavigationPath(sPropertyPath);
			if (sPropertyPath.indexOf('/') > -1 && sTextExpression) {
				sExpression = "{" + sPropertyPath.substr(0, sPropertyPath.indexOf('/') + 1) + sTextExpression.substr(1, sTextExpression.length - 2) + "}";
			} else {
				sExpression = sTextExpression;
			}
			if (sExpression) {
				// TODO: this is just a workaround for now as the mdc field updates the additionalValue as well
				// as we want to avoid this we define it as a one-way-binding
				sExpression = "{ path : '" + sExpression.substr(1, sExpression.length - 2) + "', mode : 'OneWay'}";
			}

			return sExpression;
		},
		getStableIdPartFromDataField: function (oDataField, mParameter) {
			var sPathConcat = "", sIdPart = "";
			if (oDataField.$Type && oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
				return CommonHelper.replaceSpecialCharsInId(oDataField.Action);
			} else if (oDataField.$Type && (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation")) {
				if (typeof oDataField.SemanticObject == "string") {
					sIdPart = CommonHelper.replaceSpecialCharsInId(oDataField.SemanticObject);
				} else if (oDataField.SemanticObject.$Path) {
					sIdPart = CommonHelper.replaceSpecialCharsInId(oDataField.SemanticObject.$Path);
				}
				if (typeof oDataField.Action == "string") {
					sIdPart = sIdPart + "::" + CommonHelper.replaceSpecialCharsInId(oDataField.Action);
				} else if (oDataField.Action && oDataField.Action.$Path) {
					sIdPart = sIdPart + "::" + CommonHelper.replaceSpecialCharsInId(oDataField.Action.$Path);
				}
				return sIdPart;
			} else if (oDataField.$Type && oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
				return CommonHelper.replaceSpecialCharsInId(oDataField.Target.$AnnotationPath);
			} else if (oDataField.Value && oDataField.Value.$Path) {
				return CommonHelper.replaceSpecialCharsInId(oDataField.Value.$Path);
			} else if (oDataField.Value && oDataField.Value.$Apply && oDataField.Value.$Function === "odata.concat") {
				for (var i = 0; i < oDataField.Value.$Apply.length; i++) {
					if (oDataField.Value.$Apply[i].$Path) {
						if (sPathConcat) {
							sPathConcat = sPathConcat + "::";
						}
						sPathConcat = sPathConcat + CommonHelper.replaceSpecialCharsInId(oDataField.Value.$Apply[i].$Path);
					}
				}
				return sPathConcat;
			} else if (mParameter && mParameter.context && mParameter.context.getObject("@sapui.name")) {
				// the context is not refering to da data field but directly to a property, return the property name
				return CommonHelper.replaceSpecialCharsInId(mParameter.context.getObject("@sapui.name"));
			} else {
				// In case of a string or unknown property
				Log.error("Annotation Helper: Unable to create a stable ID. Please check the annotations.");
			}
			return undefined;
		},
		isNotAlwaysHidden: function (oDataField, oDetails) {
			var oContext = oDetails.context,
				isAlwaysHidden = false;
			if (oDataField.Value && oDataField.Value.$Path) {
				isAlwaysHidden = oContext.getObject("Value/$Path@com.sap.vocabularies.UI.v1.Hidden");
			}
			if (!isAlwaysHidden || isAlwaysHidden.$Path) {
				isAlwaysHidden = oContext.getObject("@com.sap.vocabularies.UI.v1.Hidden");
				if (!isAlwaysHidden || isAlwaysHidden.$Path) {
					isAlwaysHidden = false;
				}
			}
			return !isAlwaysHidden;
		},
		isSemanticKey: function (aSemanticKeys, oValue) {
			return oValue && aSemanticKeys && !(aSemanticKeys.every(function (oKey) {
				return oKey['$PropertyPath'] !== oValue['$Path'];
			})) || false;
		},
		getEditMode: function (oAnnotations, sDataFieldType, oFieldControl, oDraft, sEditMode, sParentControl) {
			if (sEditMode === 'Display' || sEditMode === 'ReadOnly' || sEditMode === 'Disabled'){
				// the edit mode is hardcoded to a non-editable mode so no need to check any annotations
				return sEditMode;
			}
			var bComputed, bImmutable, bReadOnly, sSemiExpression, sExpression, sCheckUiEditMode, bCanCreateProperty, sIsFieldControlPathReadOnly;
			if (sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
				return 'Display';
			}
			//TODO: Edit mode is hardcoded to a non-editable mode in case of semantic object
			// if (oAnnotations["@com.sap.vocabularies.Common.v1.SemanticObject"]) {
			// 	return 'Display';
			// }
			if (oAnnotations["@Org.OData.Core.V1.Computed"]) {
				bComputed = oAnnotations["@Org.OData.Core.V1.Computed"].Bool ? oAnnotations["@Org.OData.Core.V1.Computed"].Bool == "true" : true;
			}
			if (oAnnotations["@Org.OData.Core.V1.Immutable"]) {
				bImmutable = oAnnotations["@Org.OData.Core.V1.Immutable"].Bool ? oAnnotations["@Org.OData.Core.V1.Immutable"].Bool == "true" : true;
			}
			bReadOnly = bComputed || bImmutable;
			bCanCreateProperty = typeof bComputed === "undefined" ? typeof bImmutable === "undefined" || bImmutable : !bComputed;
			if (oFieldControl){
				if (ManagedObject.bindingParser(oFieldControl)){
					sIsFieldControlPathReadOnly = "$" + oFieldControl + " === '1'";
				} else {
					bReadOnly = (bReadOnly || oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly");
				}
				}
			var sEditableExpression;
			var sDisplayOrReadOnly;

			if (sParentControl === 'Form'){
				sDisplayOrReadOnly = sEditMode === 'Editable' ? '\'ReadOnly\'' : '$' + sEditMode + ' === \'Editable\' ? \'ReadOnly\' : \'Display\'';
			} else {
				sDisplayOrReadOnly = '\'Display\'';
			}
			sCheckUiEditMode = ManagedObject.bindingParser(sEditMode) ? "$" + sEditMode : "'" + sEditMode + "'";
			if (bReadOnly) {
				if (!bCanCreateProperty || !oDraft) {
					if (sEditMode.indexOf('{') === 0 && sParentControl === 'Form'){
						return '{= ' + sDisplayOrReadOnly + '}';
					}
					sDisplayOrReadOnly = sDisplayOrReadOnly.split("'") && sDisplayOrReadOnly.split("'")[1];
					return sDisplayOrReadOnly;
				} else {
					if (sIsFieldControlPathReadOnly){
						return "{= !%{IsActiveEntity} && !%{HasActiveEntity} ? (" + sIsFieldControlPathReadOnly + "? : 'ReadOnly' : " + sCheckUiEditMode + ") : " + sDisplayOrReadOnly + "}";
					} else if (oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly"){
						sCheckUiEditMode = "'ReadOnly'";
					}
					return "{= !%{IsActiveEntity} && !%{HasActiveEntity} ?" + sCheckUiEditMode + " : " + sDisplayOrReadOnly + "}";
				}
			}
			if (sIsFieldControlPathReadOnly){
				sSemiExpression = sIsFieldControlPathReadOnly + " ? " + sDisplayOrReadOnly + " :" + sCheckUiEditMode;
				sEditableExpression = "{= " + sSemiExpression + "}";
			} else {
				sSemiExpression = sCheckUiEditMode;
				sEditableExpression = sEditMode;
			}

			sExpression = bCanCreateProperty || !oDraft ? sEditableExpression : "{= !%{IsActiveEntity} && !%{HasActiveEntity} ? " + sDisplayOrReadOnly + " : " + sSemiExpression + "}";
			return sExpression;
		},
		isLineItem: function (oProperty, oInterface) {
			if (oInterface.context.getPath().indexOf("@com.sap.vocabularies.UI.v1.LineItem") > -1) {
				return true;
			}
			return false;
		},
		getRequiredForDataField: function (oFieldControl,sEditMode) {
			if (sEditMode === 'Display' || sEditMode === 'ReadOnly' || sEditMode === 'Disabled'){
				return false;
			}
			//sEditMode returns Binding in few cases hence resolving the binding
			if (oFieldControl && sEditMode) {
				if (sEditMode.indexOf("{") > -1) {
					var sEditExpression = "%" + sEditMode + " === 'Editable'";
				}
				if (oFieldControl.indexOf("{") > -1) {
					var sExpression = "%" + oFieldControl + " === 7";
					return (sEditMode === 'Editable') ? "{=" + sExpression + "}" : "{= " + sExpression +  " && " + sEditExpression + "}";
				} else {
					return (sEditMode === 'Editable') ? (oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory") : (oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory" && "{= " + sEditExpression + "}" );
				}
			}
			return false;
		},
		isRequired: function (oFieldControl,sEditMode) {
			if (sEditMode === 'Display' || sEditMode === 'ReadOnly' || sEditMode === 'Disabled'){
				return false;
			}
			if (oFieldControl) {
				if (ManagedObject.bindingParser(oFieldControl)){
					var sExpression = "{= %" + oFieldControl + " === 7}";
					return sExpression;
				} else {
					return (oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory");
				}
			}
			return false;
		},
		_createBindingForDraftAdminBlock: function(oMetaModel, sEntityType, sFormatter) {
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
				sBinding += "], formatter: 'sap.ui.mdc.odata.v4.field.FieldRuntime." + sFormatter + "'}";
				return sBinding;
			});
		},
		getBindingForDraftAdminBlockInline: function(iContext, sEntityType) {
			return FieldHelper._createBindingForDraftAdminBlock(iContext.getModel(), sEntityType, 'formatDraftOwnerTextInline');
		},
		getBindingForDraftAdminBlockInPopover: function(iContext, sEntityType) {
			return FieldHelper._createBindingForDraftAdminBlock(iContext.getModel(), sEntityType, 'formatDraftOwnerTextInPopover');
		},
		/**
		 * Computed annotation that returns vProperty for a string and @sapui.name for an object
		 *
		 * @param {*} vProperty
		 * @param {*} oInterface
		 */
		propertyName: function(vProperty, oInterface) {
			return typeof vProperty === 'string' ? vProperty : oInterface.context.getObject("@sapui.name");
		},
		typeConstraints: function(oProperty, oPropertyAnnotations) {
			var sConstraints = "",
				iMaxLength,
				sType = oProperty.$Type;

			// nullable allows to set mandatory independent of the control
			sConstraints += (oProperty.$Nullable !== undefined && !oProperty.$Nullable ? 'nullable: ' + oProperty.$Nullable : '');
			if (["Edm.Decimal","Edm.DateTimeOffset"].indexOf(sType) > -1) {
				//Scale and Precision are compatible to sap.ui.model.odata.type.Decimal
				sConstraints += (sConstraints ? COMMA : ''); //do we need a comma
				sConstraints += (oProperty.$Precision ? 'precision: ' + oProperty.$Precision : '');
				sConstraints += (oProperty.$Scale ?
					(sConstraints ? COMMA : '') + //do we need a comma
					'scale: ' +
					( oProperty.$Scale === "variable" ? "'" + oProperty.$Scale + "'" : oProperty.$Scale )
				: '');
			} else if (sType === "Edm.String") {
				iMaxLength = oProperty.$MaxLength;
				if (iMaxLength) {
					sConstraints += (sConstraints ? COMMA : ''); //do we need a comma
					sConstraints += "maxLength: " + iMaxLength;
				}

				if (oPropertyAnnotations["@com.sap.vocabularies.Common.v1.IsUpperCase"]) {
					//TODO this can't be done through binding as far as I know until sap.ui.model.odata.type.String
					//string enables a corresponding formatOption
				}

			}
			return sConstraints;
		},
		value: function (oProperty, oInterface) {
			var oContext = oInterface.context,
				oRealProperty = oContext.getObject("./$"),
				sMainProperty = typeof oProperty === 'string' ? oProperty : ( oProperty.$Name || oContext.getObject("./$@sapui.name") ),
				oPropertyAnnotations = oContext.getObject("@");

			//Always be ready for async usage
			return Promise.resolve().then(function(aValues) {
				var sResult = '', sConstraints = '', sFormatOptions = '', oAnnotation, sAnnotation, oUnit;
				if (sMainProperty && oPropertyAnnotations) {
					// 1. Check for unit or currency => needs composite binding
					sAnnotation = oPropertyAnnotations.hasOwnProperty(ISOCurrency) && ISOCurrency;
					//|| oPropertyAnnotations.hasOwnProperty(Unit) && Unit; //Add Unit as else if once supported
					if (sAnnotation) {
						// 1a. Currency or Unit
						oAnnotation = oPropertyAnnotations[sAnnotation];
						oUnit = UNIT_ANNOTATIONS[sAnnotation];
						sResult = '{' + 'parts: [' +
							'\'' + sMainProperty + '\',\'' + oAnnotation.$Path + '\'' +
							'], type: \'' + oUnit.ui5Type + '\'';
						sFormatOptions += oUnit.formatOptions; //must have for currency or should we check the edm.type
					} else {
						// 1b. no composite binding start with path as we will always have a type
						sResult = '{path: \'' + sMainProperty + '\'';
						sResult += ',type: \'' + FieldBase.mapEdmTypes[oRealProperty.$Type] + '\'';
					}
					// 2. Check constraints
					sConstraints +=
						(sConstraints ? COMMA : '') + //do we need a comma,
						//('precision: ' + ( oRealProperty.$Precision || 0))
						FieldHelper.typeConstraints(oRealProperty, oPropertyAnnotations);

					sResult += sConstraints ? ',constraints: {' + sConstraints + '}' : '';
					// 3. Check format options
					sFormatOptions += ['Edm.Date','Edm.DateTimeOffset'].indexOf(oRealProperty.$Type) > -1 ?
						(sFormatOptions ? COMMA : '') + //do we need a comma,
						'style : \'medium\'' : '';
					sResult += sFormatOptions ? ',formatOptions : {' + sFormatOptions + '}' : '';

					// 2d. Close the curly
					sResult += '}';

				} else {
					sResult = AnnotationHelper.value(oProperty, {context: oContext});
				}

				return sResult;
			});
		},
		//TODO: Remove _format. This is just experimental as the AnnotationHelper.format doesn't accept a field yet
		_format: function (oProperty, oInterface) {
			var oContext = oInterface.context,
				oDataFieldValue = oProperty.$kind === "Property" ? {$PropertyPath: oContext.getObject("./$@sapui.name") } : oProperty;
			return AnnotationHelper.format(oDataFieldValue, {context: oContext});
		},
		constraints: function (oProperty, oInterface) {
			return FieldHelper.value(oProperty, oInterface).then(function(sValue) {
				var aMatches = sValue.match(/constraints:.*?({.*?})/);
				return aMatches && aMatches[1] || undefined;
			});
		},
		formatOptions: function (oProperty, oInterface) {
			return FieldHelper.value(oProperty, oInterface).then(function(sValue) {
				var aMatches = sValue.match(/formatOptions:.*?({.*?})/);
				return aMatches && aMatches[1] || undefined;
			});
		},
		/**
		 * getFieldGroupIDs uses a map stored in preprocessing data for the macro Field
		 * _generateSideEffectsMap generates this map once during templating for the first macro field
		 * and then resuses it. Map is only during templating.
		 * The map is used to set the field group ids to the macro field.
		 * A field group id has the format -- namespace.of.entityType#Qualifier
		 * where 'namespace.of.entityType' is the target entity type of the side effect annotation
		 * and 'Qualifier' is the qualififer of the side effect annotation.
		 * This information is enough to identify the side effect annotation.
		 *
		 * Return a string with comma separated field group ids.
		 */
		getFieldGroupIds: function (oContext, sPropertyPath, sEntityType) {
			var oInterface = oContext.getInterface(0);
			// generate the mapping for side effects or get the generated map if it is already generated
			return _generateSideEffectsMap(oInterface).then(function (oSideEffects) {
				var oMetaModel = oInterface.getModel(),
					sPath = sPropertyPath,
					// if the property path has a navigation, get the target entity type of the navigation
					sNavigationPath = sPath.indexOf('/') > 0 ? '/' + sEntityType + '/' + sPath.substr(0, sPath.lastIndexOf('/') + 1) + '@sapui.name' : false,
					pOwnerEntity = !sNavigationPath ? Promise.resolve(sEntityType) : oMetaModel.requestObject(sNavigationPath),
					aFieldGroupIds,
					sFieldGroupIds;

				sPath = sNavigationPath ? sPath.substr(sPath.lastIndexOf('/') + 1) : sPath;

				return pOwnerEntity.then(function(sOwnerEntityType) {
					// add to fieldGroupIds, all side effects which mention sPath as source property or sOwnerEntityType as source entity
					aFieldGroupIds = (oSideEffects[sOwnerEntityType] && oSideEffects[sOwnerEntityType][0].concat(oSideEffects[sOwnerEntityType][1][sPath] || [])) || [];
					if (aFieldGroupIds.length) {
						sFieldGroupIds = aFieldGroupIds.reduce(function (sResult, sId) {
							return (sResult && sResult + ',' + sId) || sId;
						});
					}
					// if (sFieldGroupIds) {
					// 	Log.info('FieldGroupIds--' + sPropertyPath + ': ' + sFieldGroupIds);
					// }
					return sFieldGroupIds; //"ID1,ID2,ID3..."
				});
			});
		},
		fieldControl:function(sPropertyPath,oInterface){
			var oModel = oInterface && oInterface.context.getModel();
			var sPath = oInterface && oInterface.context.getPath();
			var oFieldControl = oModel && oModel.getObject(sPath + "@com.sap.vocabularies.Common.v1.FieldControl");
			if (oFieldControl){
				if (oFieldControl.hasOwnProperty("$EnumMember")){
					return oFieldControl.$EnumMember;
				} else if (oFieldControl.hasOwnProperty("$Path")){
					return AnnotationHelper.value(oFieldControl, {context: oInterface.context});
				}
			} else {
				return undefined;
			}
		},
		/**
		 * Method to get the navigation entity(the entity where should i look for the available quick view facets)
		 * 	-Loop over all navigation property
		 *	-Look into ReferentialConstraint constraint
		 *	-If ReferentialConstraint.Property = property(Semantic Object) ==> success QuickView Facets from this entity type can be retrieved
		 * @function
		 * @name getNavigationEntity
		 * @memberof sap.ui.mdc.odata.v4.field.FieldHelper.js
		 * @param {Object} oProperty - property object on which semantic object is configured
		 * @param {Object} oContext - Metadata Context(Not passed when called with template:with)
		 * @return {String/Undefined} - if called with context then navigation entity relative binding like "{supplier}" is returned
		 * 	else context path for navigation entity for templating is returned  e.g “/Products/$Type/supplier”
		 *  where Products - Parent entity, supplier - Navigation entity name
		 */

		getNavigationEntity: function (oProperty, oContext) {
			var oContextObject = oContext && oContext.context || oProperty,
				//Get the entity type path ex. /Products/$Type from /Products/$Type@com.sap.vocabularies.UI.v1.HeaderInfo/Description/Value...
				sPath = AnnotationHelper.getNavigationPath(oContextObject.getPath()) + '/',
				//Get the entity set object
				oEntitySet = oContextObject.getObject(sPath),
				//Get the naviagation entity details
				akeys = Object.keys(oEntitySet),
				length = akeys.length,
				index = 0;
			for (; index < length; index++) {
				if (oEntitySet[akeys[index]].$kind === 'NavigationProperty' && oEntitySet[akeys[index]].$ReferentialConstraint && oEntitySet[akeys[index]].$ReferentialConstraint.hasOwnProperty(oContextObject.getObject().$Path)) {
					return oContext ? AnnotationHelper.getNavigationBinding(akeys[index]) : sPath + akeys[index];
				}
			}
		},

		/**
		 * Method to get the valuehelp property from a DataField or a PropertyPath(in case of SeclectionField)
		 * Priority form where to get the field property value(example: "Name" or "Supplier"):
		 * 1. In case of SelectionFields, oPropertyContext.getPath().
		 * 2. Else, oPropertyContext.getObject() + '/$Path'.
		 * In case, there exists ISOCurrency or Unit annotations for the field property, then Path at the ISOCurrency
		 * or Unit annotations of the field property is considered.
		 * @function
		 * @name valueHelpProperty
		 * @memberof sap.ui.mdc.odata.v4.field.FieldHelper.js
		 * @param {Object} oPropertyContext - context from which valuehelp property need to be extracted.
		 */
		valueHelpProperty: function(oPropertyContext) {
			/* For currency (and later Unit) we need to forward the value help to the annotated field */
			var sContextPath = oPropertyContext.getPath(),
				sPath = (sContextPath.indexOf("com.sap.vocabularies.UI.v1.SelectionFields") === -1) ? (sContextPath + '/$Path') : sContextPath,
				sAnnoPath = sPath + "@",
				oPropertyAnnotations = oPropertyContext.getObject(sAnnoPath),
				sAnnotation;
			if (oPropertyAnnotations) {
				sAnnotation = oPropertyAnnotations.hasOwnProperty(ISOCurrency) && ISOCurrency
					|| oPropertyAnnotations.hasOwnProperty(Unit) && Unit;
				if (sAnnotation) {
					sPath = sPath + sAnnotation + '/$Path';
				}
			}
			return sPath;
		}
	};

	FieldHelper.buildExpressionForTextValue.requiresIContext = true;
	FieldHelper.getEditMode.requiresIContext = true;
	FieldHelper.getRequiredForDataField.requiresIContext = true;
	FieldHelper.getBindingForDraftAdminBlockInline.requiresIContext = true;
	FieldHelper.getBindingForDraftAdminBlockInPopover.requiresIContext = true;
	FieldHelper.value.requiresIContext = true;
	FieldHelper.getFieldGroupIds.requiresIContext = true;
	FieldHelper.fieldControl.requiresIContext = true;

	return FieldHelper;

}, /* bExport= */ true);
