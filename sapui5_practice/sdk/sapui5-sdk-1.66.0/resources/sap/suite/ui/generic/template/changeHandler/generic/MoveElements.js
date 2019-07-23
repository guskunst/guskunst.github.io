/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global","sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils","sap/suite/ui/generic/template/changeHandler/util/AnnotationChangeUtilsV2","sap/ui/fl/changeHandler/MoveControls"],function(q,U,A,M){"use strict";var a={};var I="com.sap.vocabularies.UI.v1.Importance";var b="com.sap.vocabularies.UI.v1.ImportanceType/High";var c="com.sap.vocabularies.UI.v1.ImportanceType/Low";a.applyChange=function(C,o,p){M.applyChange(C,o,p);};a.completeChangeContent=function(C,s,p){U.isRevert=!U.isRevert;if(!U.isRevert){return;}var m=U.getMetaModel(s,p);var o=p.modifier.bySelector(s.source.id,p.appComponent);var e=o.getAggregation(s.source.aggregation)||(o.getActions&&o.getActions());if(!U.isReveal){e.splice(s.movedElements[0].sourceIndex,0,e.splice(s.movedElements[0].targetIndex,1)[0]);}var u=e[s.movedElements[0].sourceIndex];var d=e[s.movedElements[0].targetIndex];var t=s.movedElements[0].targetIndex;var E,D,r;var R=U.getComponent(o).getRootControl().getId();e.some(function(B,i){if(B&&B.getId&&B.getId()===R+"--edit"){E=i;}if(B&&B.getId&&B.getId()===R+"--delete"){D=i;}if(B&&B.getId&&B.getId()===R+"--relatedApps"){r=i;}});var f=u;if(s.custom.fnGetRelevantElement){f=s.custom.fnGetRelevantElement(u);}var g={};var h="";var j={};var k=[];var l=[];var n="";var T=U.getTemplatingInfo(f);if(T&&T.target&&T.annotation){h=T.target;j=m.getODataEntityType(h);n=T.annotation;k=j[n];}else{h=U.getEntityType(o);j=m.getODataEntityType(h);n=s.custom.annotation;k=j[n];}l=k.slice();if(u&&u.setOrder){u.setOrder(s.movedElements[0].targetIndex);}if(U.isReveal){U.isReveal=false;}else{e.splice(s.movedElements[0].targetIndex,0,(e.splice(s.movedElements[0].sourceIndex,1))[0]);}if(s.custom.fnPerformCustomMove){var P=p.modifier.bySelector(s.source.id,p.appComponent);var v=p.modifier.bySelector(s.target.id,p.appComponent);var w=s.movedElements[0].sourceIndex;var x=s.movedElements[0].targetIndex;s.custom.fnPerformCustomMove(P,v,w,x,k);}else{var w=s.custom.fnGetAnnotationIndex(u,k);var x=s.custom.fnGetAnnotationIndex(d,k);var y=E||D||r;if(y){if(t<y){k[w][I]={EnumMember:b};}else{k[w][I]={EnumMember:c};}}k.splice(x,0,k.splice(w,1)[0]);}if(s.custom.MoveConcreteElement){s.custom.MoveConcreteElement.completeChangeContent(C,s,p);}if(w>=0&&x>=0){var g=A.createCustomAnnotationTermChange(h,k,l,n);var z=A.createCustomChanges(g);q.extend(true,C.getContent(),z);}};return a;},true);
