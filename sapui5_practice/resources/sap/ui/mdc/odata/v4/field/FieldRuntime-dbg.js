/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/core/XMLTemplateProcessor',
	'sap/ui/core/util/XMLPreprocessor',
	'sap/ui/core/Fragment',
	'sap/ui/mdc/ResourceModel',
	'sap/ui/fl/Utils',
	'sap/base/Log'], function (XMLTemplateProcessor, XMLPreprocessor, Fragment, ResourceModel, flUtils, Log) {
	"use strict";

	/**
	 * Get the appropriate context on which side effects can be requested.
	 * The correct one must have a binding parameter $$patchWithoutSideEffects
	 * @function
	 * @name getContextForSideEffects
	 * @param {Object} oSourceField field changed or focused out which may cause side effect
	 * @param {String} sSideEffectEntityType Target entity type of the side effect annotation
	 * @returns {Object} oContext valid to request side effects
	 */
	function _getContextForSideEffects(oSourceField, sSideEffectEntityType) {
		var oBindingContext = oSourceField.getBindingContext(),
			oMetaModel = oBindingContext.getModel().getMetaModel(),
			sMetaPath = oMetaModel.getMetaPath(oBindingContext.getPath()),
			sEntityType = oMetaModel.getObject(sMetaPath)['$Type'],
			oContextForSideEffects = oBindingContext,
			aBindings;
		// If the context of field belongs to a list binding && target entity type of the side effect is same as binding path
		if (oBindingContext.getBinding().getMetadata().getName() === 'sap.ui.model.odata.v4.ODataListBinding'
			&& (sSideEffectEntityType === sEntityType || !sSideEffectEntityType)) {
			return oContextForSideEffects;
		}
		// Otherwise, use the view's binding context
		// if there are dependent bindings, it may result in duplicate GET requests
		// the binding of the context on which we requestSideEffects must have $$patchWithoutSideEffects true
		oContextForSideEffects = _getParentViewOfControl(oSourceField).getBindingContext();
		aBindings = oContextForSideEffects.getBinding().getDependentBindings();
		return (aBindings && aBindings[0].isPatchWithoutSideEffects() && aBindings[0].getBoundContext()) || oContextForSideEffects;
	}

	function _getParentViewOfControl(oControl) {
		while (oControl && !(oControl.getMetadata().getName() === "sap.ui.core.mvc.XMLView")) {
			oControl = oControl.getParent();
		}
		return oControl;
	}

	/**
	 * Static class used by MDC Field during runtime
	 *
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 */
	var FieldRuntime = {
		/**
		 * Method to format the text of draft admin owner
		 * @function
		 * @name formatDraftOwnerText
		 * @param {boolean} bHasDraftEntity HasDraftEntity property of draft object
		 * @param {String} sDraftInProcessByUser DraftInProcessByUser property of Draft DraftAdministrativeData
		 * @param {String} sDraftInProcessByUserDesc DraftInProcessByUserDesc property of Draft DraftAdministrativeData
		 * @param {String} sDraftLastChangedByUser DraftLastChangedByUser property of Draft DraftAdministrativeData
		 * @param {String} sDraftLastChangedByUserDesc DraftLastChangedByUserDesc property of Draft DraftAdministrativeData
		 * @param {String} bInline Is the method used inline a table
		 * @returns {String} the draft admin owner string to be shown
		 */
		formatDraftOwnerText: function (bHasDraftEntity, sDraftInProcessByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUser, sDraftLastChangedByUserDesc, bInline) {
			var sDraftOwnerDescription = '';
			if (bHasDraftEntity) {
				var sUserDescription = sDraftInProcessByUserDesc || sDraftInProcessByUser || sDraftLastChangedByUserDesc || sDraftLastChangedByUser;
				if (!bInline) {
					sDraftOwnerDescription += sDraftInProcessByUser ? ResourceModel.getText('draft.GENERIC_LOCKED_OBJECT_POPOVER_TEXT') + ' ' : ResourceModel.getText('draft.LAST_CHANGE_USER_TEXT') + ' ';
				}
				sDraftOwnerDescription += sUserDescription ? ResourceModel.getText('draft.OWNER', [sUserDescription]) : ResourceModel.getText('draft.ANOTHER_USER');
			}
			return sDraftOwnerDescription;
		},

		formatDraftOwnerTextInline: function(bHasDraftEntity, sDraftInProcessByUser, sDraftLastChangedByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUserDesc) {
			return FieldRuntime.formatDraftOwnerText(bHasDraftEntity, sDraftInProcessByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUser, sDraftLastChangedByUserDesc, true);
		},
		formatDraftOwnerTextInPopover: function(bHasDraftEntity, sDraftInProcessByUser, sDraftLastChangedByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUserDesc) {
			return FieldRuntime.formatDraftOwnerText(bHasDraftEntity, sDraftInProcessByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUser, sDraftLastChangedByUserDesc, false);
		},

		/**
		 * Method to be executed on click of the link
		 * @function
		 * @name onDraftLinkPressed
		 * @param {Event} oEvent event object passed from the click event
		 * @param {String} sEntitySet Name of the entity set for on the fly templating
		 */
		onDraftLinkPressed: function (oEvent, sEntitySet) {
			var that = this,
				oSource = oEvent.getSource(),
				oView = flUtils.getViewForControl(oSource),
				oBindingContext = oSource.getBindingContext(),
				oMetaModel = oBindingContext.getModel().getMetaModel(),
				sViewId = oView.getId(),
				oDraftPopover;

			this.mDraftPopovers = this.mDraftPopovers || {};
			this.mDraftPopovers[sViewId] = this.mDraftPopovers[sViewId] || {};
			oDraftPopover = this.mDraftPopovers[sViewId][sEntitySet];

			if (oDraftPopover) {
				oDraftPopover.setBindingContext(oBindingContext);
				oDraftPopover.openBy(oSource);
			} else {
				var sFragmentName = 'sap.ui.mdc.odata.v4.field.DraftPopOverAdminData',
					oPopoverFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, 'fragment');

				Promise.resolve(XMLPreprocessor.process(oPopoverFragment, {}, {
						bindingContexts: {
							entitySet: oMetaModel.createBindingContext("/" + sEntitySet)
						},
						models: {
							entitySet: oMetaModel
						}
					}))
					.then(function (oFragment) {
						return Fragment.load({definition: oFragment, controller: that});
					})
					.then(function (oPopover) {
						oDraftPopover = that.mDraftPopovers[sViewId][sEntitySet] = oPopover;
						oDraftPopover.setModel(ResourceModel.getModel(), "i18n");
						oView.addDependent(oDraftPopover);
						oDraftPopover.setBindingContext(oBindingContext);
						oDraftPopover.openBy(oSource);
					});
			}
		},

		/**
		 * Method to be executed on click of the close button of the draft admin data popover
		 * @function
		 * @name closeDraftAdminPopover
		 */
		closeDraftAdminPopover: function(oEvent){
			// for now go up two levels to get the popover instance
			oEvent.getSource().getParent().getParent().close();
		},

		/**
		 * Prepare for a specific side effect request.
		 * SideEffects to be requested on the same context are clubbed together in one request.
		 * @function
		 * @name prepareForSideEffects
		 * @param {String} sFieldGroupId The (virtual) field group for which side effect needs to be requested
		 * @param {Object} oSourceField field changed or focused out which may cause side effect
		 */
		prepareForSideEffects: function (sFieldGroupId, oSourceField) {
			var that = this,
				aPathExpressions = [], // target properties and target entities of the side effect
				aAdditionalPathExpressions = [], // text associations of target properties, if any
				bWithQualifier = sFieldGroupId.indexOf('#') > -1,
				sSideEffectEntityType = (bWithQualifier && sFieldGroupId.split('#')[0]) || sFieldGroupId,
				sQualifier = (bWithQualifier && sFieldGroupId.split('#')[1]) || '',
				sSideEffectAnnotationPath = '/' + sSideEffectEntityType + '@com.sap.vocabularies.Common.v1.SideEffects',
				// oContext = oBindingContext.getBinding().getContext(),
				oBindingContext = oSourceField.getBindingContext(),
				oMetaModel = oBindingContext.getModel().getMetaModel(),
				oContextForSideEffects,
				sContextPath,
				aPropertiesToRequest, // target properties
				aQueuedPropertiesToRequest, // target properties already in queue
				aEntitiesToRequest, // target entities
				aQueuedEntitiesToRequest, // target entities already in queue
				oSideEffect,
				// for filtering and mapping, we use the below two functions
				fnGetPropertyPath = function (oPathExpression) {
					return oPathExpression['$PropertyPath'];
				},
				fnGetNavigationPropertyPath = function (oPathExpression) {
					return oPathExpression['$NavigationPropertyPath'];
				};
			sSideEffectAnnotationPath = (bWithQualifier && (sSideEffectAnnotationPath + '#' + sQualifier)) || sSideEffectAnnotationPath;
			oSideEffect = oMetaModel.getObject(sSideEffectAnnotationPath);
			// Only request side effects when there has been an actual change in the value of field, confirmed by aPendingSideEffects
			if (oSideEffect && that.aPendingSideEffects.indexOf(sFieldGroupId) > -1) {
				// get the correct context to request this side effect
				oContextForSideEffects = _getContextForSideEffects(oSourceField, sSideEffectEntityType);
				sContextPath = oContextForSideEffects.getPath();
				aPathExpressions = aPathExpressions.concat(oSideEffect.TargetProperties || []).concat(oSideEffect.TargetEntities || []);
				// If there are additional description fields required, add them to the request
				// We consider the text annotation here
				aPathExpressions.forEach(function (oPathExpression) {
					if (oPathExpression['$PropertyPath']) {
						var oTextAnnotation = oMetaModel.getObject('/' + sSideEffectEntityType + '/' + oPathExpression['$PropertyPath'] + '@com.sap.vocabularies.Common.v1.Text');
						if (oTextAnnotation && oTextAnnotation['$Path']) {
							aAdditionalPathExpressions.push({'$PropertyPath' : oTextAnnotation['$Path']});
						}
					}
				});
				aPathExpressions = aPathExpressions.concat(aAdditionalPathExpressions);
				if (aPathExpressions.length) {
					// TODO: clarify trigger action Vs preparation action
					// if (oSideEffect.PreparationAction) {
					// 	// To keep the response to minimum, we add a $select
					// 	var sPropertyForSlimSelect = oMetaModel.getObject('/' + sEntityType + '/$Key')[0];
					// 	oContext.getModel().bindContext(oSideEffect.PreparationAction + '(...)', oContext, {'$select' : sPropertyForSlimSelect}).execute();
					// }
					// initialize queue of side effects waiting to be requested
					that.sideEffectsRequestsQueue = that.sideEffectsRequestsQueue || {};
					that.sideEffectsRequestsQueue[sContextPath] = that.sideEffectsRequestsQueue[sContextPath] || {};
					that.sideEffectsRequestsQueue[sContextPath]['context'] = that.sideEffectsRequestsQueue[sContextPath]['context'] || oContextForSideEffects;
					that.sideEffectsRequestsQueue[sContextPath]['pathExpressions'] = that.sideEffectsRequestsQueue[sContextPath]['pathExpressions'] || [];
					// remove duplicates before adding to queue
					aQueuedPropertiesToRequest = that.sideEffectsRequestsQueue[sContextPath]['pathExpressions'].filter(fnGetPropertyPath).map(fnGetPropertyPath);
					aQueuedEntitiesToRequest = that.sideEffectsRequestsQueue[sContextPath]['pathExpressions'].filter(fnGetNavigationPropertyPath).map(fnGetNavigationPropertyPath);
					aPropertiesToRequest = aPathExpressions
						.map(fnGetPropertyPath)
						.filter(function (sPath) {
							return sPath && aQueuedPropertiesToRequest.indexOf(sPath) < 0;
						}).map(function (sPath) {
							return {'$PropertyPath': sPath};
						});
					aEntitiesToRequest = aPathExpressions
						.map(fnGetNavigationPropertyPath)
						.filter(function (sPath) {
							return sPath && aQueuedEntitiesToRequest.indexOf(sPath) < 0;
						}).map(function (sPath) {
							return {'$NavigationPropertyPath': sPath};
						});
					aPathExpressions = aPropertiesToRequest.concat(aEntitiesToRequest);
					// add to queue
					that.sideEffectsRequestsQueue[sContextPath]['pathExpressions'] = that.sideEffectsRequestsQueue[sContextPath]['pathExpressions'].concat(aPathExpressions);

					// dequeue from pending side effects to ensure no duplicate requests
					that.aPendingSideEffects.splice(that.aPendingSideEffects.indexOf(sFieldGroupId), 1);
				}
			}
		},

		/**
		 * Request all side effects queued in this.sideEffectsRequestsQueue.
		 * Once the queue has been iterated, it is emptied.
		 * @function
		 * @name requestSideEffects
		 */
		requestSideEffects: function () {
			if (!this.sideEffectsRequestsQueue) {
				return;
			}
			var that = this;
			Object.keys(this.sideEffectsRequestsQueue).forEach(function (sPath) {
				var oSideEffectRequest = that.sideEffectsRequestsQueue[sPath];
				oSideEffectRequest['context'].requestSideEffects(oSideEffectRequest['pathExpressions']).then(
					function () {
						// unlock fields affected by side effects
					},
					function () {
						// retry loading side effects or cancel
						Log.info('FieldRuntime: Failed to request side effect - ' + sPath, 'sap.ui.mdc.odata.v4.field.FieldRuntime', 'requestSideEffects');
					}
				);
			});
			this.sideEffectsRequestsQueue = null;
		},

		/**
		 * Request for additionalValue if required
		 * Since additionalValue is a one-way binding, we need to request it explicitly if the value is changed
		 * @function
		 * @name requestTextIfRequired
		 * @param {Object} oSourceField field changed
		 */
		requestTextIfRequired: function (oSourceField) {
			var oAdditionalValueBindingInfo = oSourceField.getBindingInfo('additionalValue');
			if (!oAdditionalValueBindingInfo) {
				return;
			}
			var sPath = oAdditionalValueBindingInfo.binding.getPath(),
				oContextForSideEffects;
			oContextForSideEffects = _getContextForSideEffects(oSourceField);
			oContextForSideEffects.requestSideEffects([{'$PropertyPath': sPath}]).then(
				function () {
					// unlock fields affected by side effects
				},
				function () {
					// retry loading side effects or cancel
					Log.info('FieldRuntime: Failed to request Text association - ' + sPath, 'sap.ui.mdc.odata.v4.field.FieldRuntime', 'requestTextIfRequired');
				}
			);
		},

		/**
		 * Handler for change event.
		 * Store field group ids of this field for requesting side effects when required.
		 * We store them here to ensure a change in value of the field has taken place.
		 * @function
		 * @name handleChange
		 * @param {Object} oEvent event object passed by the change event
		 */
		handleChange: function (oEvent) {
			var that = this,
				oSourceField = oEvent.getSource();
			this.aPendingSideEffects = this.aPendingSideEffects || [];
			// if there is a text association in the additional value of the field, it should be requested
			if (!oSourceField.getBindingContext().isTransient()) {
				this.requestTextIfRequired(oSourceField);
			}
			// if the context is transient, it means the request would fail anyway as the record does not exist in reality
			// TODO: should the request be made in future if the context is transient?
			if (oSourceField.getFieldGroupIds() && !oSourceField.getBindingContext().isTransient()) {
				oSourceField.getFieldGroupIds().forEach(function (sFieldGroupId) {
					var bImmediate = sFieldGroupId.indexOf('$$ImmediateRequest') > -1;
					// on change, only the side effects which are required immediately, are requested
					if (bImmediate) {
						sFieldGroupId = sFieldGroupId.substr(0, sFieldGroupId.indexOf('$$ImmediateRequest'));
					}
					// queue to pending side effects, it is not necessary that the side effect is requested immediately
					if (that.aPendingSideEffects.indexOf(sFieldGroupId) === -1) {
						that.aPendingSideEffects.push(sFieldGroupId);
					}
					// if not required immediately, request will be handled later when user focuses out of the virtual field group of source properties for this side effect
					if (bImmediate) {
						// The side effect must be requested on the appropriate context
						that.prepareForSideEffects(sFieldGroupId, oSourceField);
					}
				});
				this.requestSideEffects();
			}
		},

		/**
		 * Handler for validateFieldGroup event.
		 * Used to request side effects that are now required.
		 * Only side effects annotated on the root entity type will be requested.
		 * @function
		 * @name handleSideEffect
		 * @param {Object} oEvent event object passed by the validateFieldGroup event
		 */
		handleSideEffect: function (oEvent) {
			// If there are no pending side effects in records, there is nothing to do here
			if (!this.aPendingSideEffects || this.aPendingSideEffects.length === 0) {
				return;
			}
			var that = this,
				aFieldGroupIds = oEvent.getParameter('fieldGroupIds'),
				oSourceField = oEvent.getSource();
			aFieldGroupIds = aFieldGroupIds || [];
			aFieldGroupIds.forEach(function(sFieldGroupId) {
				// The side effect must be requested on the appropriate context
				that.prepareForSideEffects(sFieldGroupId, oSourceField);
			});
			this.requestSideEffects();
		}
	};

	return FieldRuntime;

}, /* bExport= */ true);
