sap.ui.define(["jquery.sap.global","sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils","sap/suite/ui/generic/template/changeHandler/util/AnnotationChangeUtilsV2"],function(q,U,A){"use strict";var a={};var F="com.sap.vocabularies.UI.v1.Facets";var D="com.sap.vocabularies.UI.v1.DataField";var b="com.sap.vocabularies.UI.v1.FieldGroupType";var R="com.sap.vocabularies.UI.v1.ReferenceFacet";a.applyChange=function(c,C,p){};a.revertChange=function(c,C,p){};a.completeChangeContent=function(c,s,p){var S=sap.ui.getCore().byId(s.parentId);var d=(s.parentId.split("--")[1]);d=d.substring(0,d.lastIndexOf("::")).replace("::","#");var f=A.getExistingAnnotationsOfEntityType(S,F);var o=JSON.parse(JSON.stringify(f));var e=U.getODataEntitySet(U.getComponent(S)).entityType;var E=U.getODataEntityType(S);var g=U.createFieldGroupTerm(E);var C=U.getCollectionFacet(d,f);var h={};h[g]={"Data":[{"Label":{"String":"New Field"},"Value":{"Path":""},"RecordType":D}],"RecordType":b};var n={"Label":{"String":"New Group"},"Target":{"AnnotationPath":"@"+g},"RecordType":R};if(C&&C.Facets){C.Facets.splice(s.index,0,n);var m={customChanges:[]};var i=A.createCustomAnnotationTermChange(e,f,o,F);var j=A.createCustomAnnotationTermChange(e,h[g],{},g);m.customChanges.push(i);m.customChanges.push(j);q.extend(true,c.getContent(),m);}};return a;},true);