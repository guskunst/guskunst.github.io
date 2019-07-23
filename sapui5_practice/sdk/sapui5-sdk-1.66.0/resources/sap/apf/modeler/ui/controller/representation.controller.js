/*!
* SAP APF Analysis Path Framework
*
* (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
sap.ui.define(["sap/apf/modeler/ui/utils/representationHandler","sap/apf/ui/utils/constants","sap/apf/core/constants","sap/apf/modeler/ui/utils/nullObjectChecker","sap/apf/modeler/ui/utils/optionsValueModelBuilder","sap/apf/modeler/ui/utils/sortDataHandler","sap/apf/modeler/ui/utils/representationBasicDataHandler","sap/apf/modeler/ui/utils/stepPropertyMetadataHandler","sap/apf/ui/utils/representationTypesHandler","sap/apf/modeler/ui/utils/viewValidator","sap/ui/core/mvc/Controller"],function(R,u,c,n,o,S,a,b,d,V,M){'use strict';var p,C,e,r,P,f,s,g,h,j;var l=c.representationMetadata.labelDisplayOptions;function _(i){i.byId("idVisualization").setText(C.getText("visualization"));i.byId("idChartTypeLabel").setText(C.getText("chartType"));i.byId("idChartTypeLabel").setTooltip(C.getText("chartType"));i.byId("idBasicData").setText(C.getText("basicData"));i.byId("idSorting").setText(C.getText("sorting"));i.byId("idChartType").setValueStateText(C.getText("modeler.ui.representation.invalidChartTypeError"));}function k(i,O){var Q;var T=f.getPictureOfRepresentationType(r.getRepresentationType());var U=e.getCategoriesForStep(P.getId());if(U.length===1){Q={id:r.getId(),icon:T};if(O){Q.name=O;}i.getView().getViewData().updateSelectedNode(Q);}else{i.getView().getViewData().updateTree();}}function m(i,O){var T=C.getText("representation")+": "+O;i.getView().getViewData().updateTitleAndBreadCrumb(T);}function q(i){r.setRepresentationType(i);var O="TableRepresentation";if(i===u.representationTypes.TABLE_REPRESENTATION||i===u.representationTypes.TREE_TABLE_REPRESENTATION){O=undefined;}r.setAlternateRepresentationType(O);}function t(i){var O;var Q=jQuery.Deferred();s.getEntityTypeMetadataAsPromise().done(function(T){var U=s.getDimensionsProperties(T);var W=f.getKindsForDimensionPropertyType(i);W.forEach(function(X,Y){O=false;var Z;var $;var a1=U[Y];if(r.getDimensions().length!==0){if(r.getDimensions()[Y]){if(r.getDimensionKind(r.getDimensions()[Y])){O=true;}}}if(!O&&a1){Z=s.hasTextPropertyOfDimension(T,a1);$=Z?l.KEY_AND_TEXT:l.KEY;r.addDimension(a1);r.setLabelDisplayOption(a1,$);r.setDimensionKind(a1,X);}});Q.resolve();});return Q.promise();}function v(i){var O;var Q=s.oStep.getService();var T=s.oStep.getEntitySet();var U=s.oStep.getHierarchyProperty();e.getHierarchyNodeIdAsPromise(Q,T,U).done(function(W){O=s.hasTextPropertyOfDimension(i,W);});return O;}function w(i){var O,Q;var T=jQuery.Deferred();s.getEntityTypeMetadataAsPromise().done(function(U){var W=s.getHierarchicalProperty();if(W&&(r.getHierarchyPropertyLabelDisplayOption()===undefined)){O=v(U);Q=O?l.TEXT:l.KEY;r.setHierarchyPropertyLabelDisplayOption(Q);}T.resolve();});return T.promise();}function x(O){var Q=jQuery.Deferred(),T,U;var W;var X=0;s.getEntityTypeMetadataAsPromise().done(function(Y){W=f.getKindsForMeasurePropertyType(O);T=s.getMeasures(Y);W.forEach(function(Z){var $=f.getDefaultCountForRepresentationKind(O,Z);for(var i=0;i<$;i++){U=false;var a1=T[X];if(r.getMeasures().length!==0){if(r.getMeasures()[X]){if(r.getMeasureKind(r.getMeasures()[X])){U=true;}}}if(!U&&a1){r.addMeasure(a1);r.setMeasureKind(a1,Z);}X++;}});Q.resolve();});return Q.promise();}function y(i){var O=jQuery.Deferred();var Q,T;if(i==="TableRepresentation"){if(r.getProperties().length===0){T=f.getKindsForPropertyType(i);Q=s.getProperties()[0];r.addProperty(Q);r.setPropertyKind(Q,T[0]);O.resolve();}else{O.resolve();}}else if(i==="TreeTableRepresentation"){w(i).done(function(){O.resolve();});}else{t(i).done(function(){x(i).done(function(){O.resolve();});});}return O.promise();}function z(){if(p&&p.arguments&&p.arguments.stepId){P=e.getStep(p.arguments.stepId);}}function A(){var i=C.getRepresentationTypes()[0].id;if(P.getType()==="hierarchicalStep"){i="TreeTableRepresentation";}return i;}function B(i){var O;var Q=jQuery.Deferred();if(p&&p.arguments&&p.arguments.representationId){r=P.getRepresentation(p.arguments.representationId);}if(!n.checkIsNotUndefined(r)){r=P.createRepresentation();O=A();q(O);k(i,C.getText(O));e.setIsUnsaved();y(O).done(function(){return Q.resolve();});}else{O=r.getRepresentationType();J().done(function(){y(O).done(function(){return Q.resolve();});});}return Q.promise();}function D(i){var O=new sap.m.Button({id:i.createId("idPreviewButton"),text:C.getText("preview"),press:i.handlePreviewButtonPress.bind(i)});var Q=i.getView().getViewData().oFooter;Q.addContentRight(O);}function E(i){var T=i.getView().getViewData().oConfigurationHandler.getTextPool();var O={oTextReader:C.getText,oConfigurationEditor:e,oTextPool:T,oParentObject:r,oParentStep:P,oRepresentationTypeHandler:f};var Q=new sap.ui.controller("sap.apf.modeler.ui.controller.representationCornerTexts");var U=new sap.ui.view({viewName:"sap.apf.modeler.ui.view.cornerTexts",type:sap.ui.core.mvc.ViewType.XML,id:i.createId("representationCornerTexts"),viewData:O,controller:Q});i.byId("idCornerTextsVBox").insertItem(U);i.getView().attachEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.representation.SETCHARTICON,U.getController().setChartIcon.bind(U.getController()));}function F(){r.getDimensions().forEach(function(i){r.removeDimension(i);});r.getMeasures().forEach(function(i){r.removeMeasure(i);});}function G(){var i,O;if(r.getRepresentationType()==="TableRepresentation"){i=r.getDimensions();O=r.getMeasures();i.forEach(function(Q){r.addProperty(Q);r.setPropertyTextLabelKey(Q,r.getDimensionTextLabelKey(Q));r.setPropertyKind(Q,c.representationMetadata.kind.COLUMN);e.setIsUnsaved();});O.forEach(function(Q){r.addProperty(Q);r.setPropertyTextLabelKey(Q,r.getMeasureTextLabelKey(Q));r.setPropertyKind(Q,c.representationMetadata.kind.COLUMN);e.setIsUnsaved();});F();}}function H(i){var O;s.getEntityTypeMetadataAsPromise().done(function(Q){O=s.hasTextPropertyOfDimension(Q,i);if(O){r.setLabelDisplayOption(i,l.KEY_AND_TEXT);}else{r.setLabelDisplayOption(i,l.KEY);}e.setIsUnsaved();});}function I(){var i=jQuery.Deferred();s.getEntityTypeMetadataAsPromise().done(function(O){r.getDimensions().forEach(function(Q){if(r.getLabelDisplayOption(Q)===undefined){H(Q);}});i.resolve();});return i.promise();}function J(){G();return I();}function K(i){j.instantiateRepresentationSortData();E(i);return h.instantiateBasicDataAsPromise();}function L(i){if(!i.getValidationState()){if(i.byId("idChartType").getValueState("None")){setTimeout(function(){i.byId("idChartType").setValueState("Error");},1);}}else{i.byId("idChartType").setValueState("None");}}var N=M.extend("sap.apf.modeler.ui.controller.representation",{onInit:function(){var i=this;i.promiseControllerIsCreated=new Promise(function(O){var Q=i.getView().getViewData();C=Q.oCoreApi;p=Q.oParams;e=Q.oConfigurationEditor;f=new d();i.oViewValidator=new V(i.getView());_(i);z();if(P.getType()!=="hierarchicalStep"){D(i);}s=new sap.apf.modeler.ui.utils.StepPropertyMetadataHandler(C,P);B(i).then(function(){g=new R(r,f,C.getText);h=new a(i.getView(),s,g,i.oViewValidator);j=new S(i.getView(),r,s,C.getText);K(i).then(function(){i.setDetailData();O();});});});},promiseControllerIsCreated:null,setDetailData:function(){var i=this;i._setChartType();},handleChangeForChartType:function(i){var O=this;var Q=i.getParameter("selectedItem").getKey();var T=C.getText(Q);var U=r.getRepresentationType();q(Q);k(O,T);m(O,T);if(!f.isChartTypeSimilar(U,Q)){O.getView().fireEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.REMOVEALLPROPERTIESFROMPARENTOBJECT);F();y(Q).done(function(){h.instantiateBasicDataAsPromise().then(function(){L(O);});O.getView().fireEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.representation.SETCHARTICON);e.setIsUnsaved();});}else{h.instantiateBasicDataAsPromise().then(function(){L(O);});O.getView().fireEvent(sap.apf.modeler.ui.utils.CONSTANTS.events.representation.SETCHARTICON);e.setIsUnsaved();}},handlePreviewButtonPress:function(){var i=this;var O={oParentStep:P,oRepresentation:r,oConfigurationHandler:i.getView().getViewData().oConfigurationHandler,oCoreApi:C,oRepresentationHandler:g,oStepPropertyMetadataHandler:s,oRepresentationTypeHandler:f};sap.ui.view({id:i.createId("idPreviewContentView"),viewName:"sap.apf.modeler.ui.view.previewContent",type:sap.ui.core.mvc.ViewType.XML,viewData:O});},onExit:function(){var i=this;i.getView().getViewData().oFooter.removeContentRight(i.byId("idPreviewButton"));h.destroyBasicData();j.destroySortData();i.byId("idCornerTextsVBox").destroyItems();},getValidationState:function(){return this.oViewValidator.getValidationState();},_setChartType:function(){var i=this;s.getEntityTypeMetadataAsPromise().done(function(O){var Q;var T=s.getDimensionsProperties(O);var U=s.getMeasures(O);var W=i._getAnnotatedChartTypes(f.aRepresentationTypes,s.getRepresentationTypesArray(),T,U,C);Q=o.prepareModel(W);i.byId("idChartType").setModel(Q);i.byId("idChartType").setSelectedKey(r.getRepresentationType());L(i);});},_getAnnotatedChartTypes:function(i,O,Q,T,C){function U(X,Y){var Z;X.forEach(function($){if($["id"]===Y){Z=$;}});return Z;}var W=jQuery.extend(true,[],O);W.forEach(function(X){var Y=0,Z=0;var $=U(i,X.key);if($.metadata&&$.id!=="TableRepresentation"&&$.id!=="TreeTableRepresentation"){$.metadata.dimensions.supportedKinds.forEach(function(a1){Y+=parseInt(a1.min,10);});$.metadata.measures.supportedKinds.forEach(function(a1){Z+=parseInt(a1.min,10);});if(Q.length<Y||T.length<Z){X.name=C.getText("modeler.ui.representation.invalidChartTypes",[X.name]);}}});return W;}});return N;},true);