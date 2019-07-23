// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/utils","sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations"],function(u,R){"use strict";function g(o,A){return u.getMember(o,A);}function a(o,A,D){return u.getNestedObjectProperty(o,A,D);}function m(k,s,A,v,V,S){var i=false;s=u.clone(s);A=u.clone(A);v=v||{};V=V||{};var I={};I.semanticObject=g(s,"semanticObject");I.action=g(s,"action");var o=R.getConfig(v);I.title=a([o,s,A],["sap|app.title","title","sap|app.title"]);I.info=a([o,s,A],["sap|app.info","info","sap|app.info"]);I.icon=a([o,s,A],["sap|ui.icons.icon","icon","sap|ui.icons.icon"]);I.subTitle=a([o,s,A],["sap|app.subTitle","subTitle","sap|app.subTitle"]);I.shortTitle=a([o,s,A],["sap|app.shortTitle","shortTitle","sap|app.shortTitle"]);I.deviceTypes=g(A,"sap|ui.deviceTypes")||{};["desktop","tablet","phone"].forEach(function(M){if(Object.prototype.hasOwnProperty.call(g(s,"deviceTypes")||{},M)){I.deviceTypes[M]=s.deviceTypes[M];}if(!Object.prototype.hasOwnProperty.call(I.deviceTypes,M)){I.deviceTypes[M]=true;}I.deviceTypes[M]=!!I.deviceTypes[M];});I.signature=g(s,"signature")||{};I.signature.parameters=g(I,"signature.parameters")||{};I.signature.additionalParameters=g(s,"signature.additionalParameters")||"allowed";var e=g(A,"sap|platform|runtime");I.resolutionResult=jQuery.extend(true,{},e);if(e){I.resolutionResult["sap.platform.runtime"]=jQuery.extend(true,{},e);}if(g(A,"sap|ui.technology")==="GUI"){I.resolutionResult["sap.gui"]=g(A,"sap|gui");}if(g(A,"sap|ui.technology")==="WDA"){I.resolutionResult["sap.wda"]=g(A,"sap|wda");}if(g(A,"sap|ui.technology")==="URL"){if(A["sap.url"]){I.resolutionResult["sap.platform.runtime"]=I.resolutionResult["sap.platform.runtime"]||{};I.resolutionResult.url=A["sap.url"].uri;I.resolutionResult["sap.platform.runtime"].url=A["sap.url"].uri;}else if(e&&e.uri){I.resolutionResult["sap.platform.runtime"].url=e.uri;I.resolutionResult.url=e.uri;}}if(!I.resolutionResult["sap.ui"]){I.resolutionResult["sap.ui"]={};}I.resolutionResult["sap.ui"].technology=g(A,"sap|ui.technology");I.resolutionResult.applicationType=this._formatApplicationType(I.resolutionResult,A);I.resolutionResult.systemAlias=I.resolutionResult.systemAlias||g(s,"systemAlias");I.resolutionResult.systemAliasSemantics="apply";I.resolutionResult.text=I.title;I.resolutionResult.appId=g(A,"sap|app.id");var T,h;var j=g(v,"vizConfig.sap|flp.indicatorDataSource");var l={};if(!jQuery.isEmptyObject(V)){var n=g(V,"sap|app.type");if(n==="card"){i=true;l=jQuery.extend(true,{},V,v.vizConfig);}else{l.componentName=g(V,"sap|ui5.componentName");var C=g(V,"sap|platform|runtime.componentProperties");if(C){l.componentProperties=C;}if(g(V,"sap|platform|runtime.includeManifest")){l.componentProperties=l.componentProperties||{};l.componentProperties.manifest=jQuery.extend(true,{},V);delete l.componentProperties.manifest["sap.platform.runtime"];}}}if(g(A,"sap|app.type")==="plugin"||g(A,"sap|flp.type")==="plugin"){return undefined;}var p=a([o,A,V],"sap|flp.tileSize");var q=a([o,A,V],"sap|app.description");if(g(A,"sap|ui.technology")==="GUI"&&g(A,"sap|gui.transaction")){T=g(A,"sap|gui.transaction");}if(g(A,"sap|ui.technology")==="WDA"&&g(A,"sap|wda.applicationId")){T=g(A,"sap|wda.applicationId");}var D=a([o,A,V],"sap|app.dataSources");if(g(A,"sap|app.id")){h=g(A,"sap|app.id");}I.tileResolutionResult={appId:h,title:I.title,subTitle:I.subTitle,icon:I.icon,size:p,info:I.info,tileComponentLoadInfo:l,indicatorDataSource:j,dataSources:D,description:q,runtimeInformation:e,technicalInformation:T,deviceTypes:I.deviceTypes,isCard:i};var r=g(A,"sap|integration.urlTemplateId");var w=b(r,S);if(w){I.templateContext={payload:w,site:S,siteAppSection:A};}return I;}function b(T,s){if(!s||typeof T!=="string"){return null;}var e=T.replace(/[.]/g,"|");return g(s.urlTemplates,e+".payload");}function f(r,A){var s=r.applicationType;if(s){return s;}var C=g(A,"sap|platform|runtime.componentProperties.self.name")||g(A,"sap|ui5.componentName");if(g(A,"sap|flp.appType")==="UI5"||g(A,"sap|ui.technology")==="UI5"){r.applicationType="SAPUI5";r.additionalInformation="SAPUI5.Component="+C;r.url=g(A,"sap|platform|runtime.componentProperties.url");r.applicationDependencies=g(A,"sap|platform|runtime.componentProperties");return"SAPUI5";}if(g(A,"sap|ui.technology")==="GUI"){r.applicationType="TR";r["sap.gui"]=g(A,"sap|gui");r.systemAlias=g(A,"sap|app.destination.name");return"TR";}if(g(A,"sap|ui.technology")==="WDA"){r.applicationType="WDA";r["sap.wda"]=g(A,"sap|wda");r.systemAlias=g(A,"sap|app.destination.name");return"WDA";}if(g(A,"sap|ui.technology")==="URL"){r.applicationType="URL";r.systemAlias=g(A,"sap|app.destination.name");}return"URL";}function c(s){var e=this;if(!s){return[];}var i=[];try{var S=Object.keys(s.applications||{}).sort();S.forEach(function(A){try{var o=s.applications[A];var h=g(o,"sap|app.crossNavigation.inbounds");if(h){var l=Object.keys(h).sort();l.forEach(function(I){var k=h[I];var r=e.mapOne(I,k,o,undefined,undefined,s);if(r){i.push(r);}});}}catch(j){jQuery.sap.log.error("Error in application "+A+": "+j,j.stack);}});}catch(E){jQuery.sap.log.error(E);jQuery.sap.log.error(E.stack);return[];}return i;}function t(i){var s,p,C;s={target:{semanticObject:i.semanticObject,action:i.action},params:{}};p=jQuery.sap.getObject("signature.parameters",undefined,i)||{};Object.keys(p).forEach(function(k){if(p[k].filter&&Object.prototype.hasOwnProperty.call(p[k].filter,"value")&&(p[k].filter.format===undefined||p[k].filter.format==="plain")){s.params[k]=[p[k].filter.value];}if(p[k].launcherValue&&Object.prototype.hasOwnProperty.call(p[k].launcherValue,"value")&&(p[k].launcherValue.format===undefined||p[k].launcherValue.format==="plain")){s.params[k]=[p[k].launcherValue.value];}});C=sap.ushell.Container.getService("URLParsing").constructShellHash(s);if(!C){return undefined;}return C;}function d(o){var s,p,C;s={target:{semanticObject:o.semanticObject,action:o.action},params:{}};p=o.parameters||{};Object.keys(p).forEach(function(k){if(p.hasOwnProperty(k)&&typeof p[k].value==="object"){s.params[k]=[p[k].value.value];}});C=sap.ushell.Container.getService("URLParsing").constructShellHash(s);if(!C){return undefined;}return C;}return{formatSite:c,toHashFromInbound:t,toHashFromOutbound:d,mapOne:m,_formatApplicationType:f};},true);