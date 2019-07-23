// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/URI","sap/ushell/utils","sap/ushell/URLTemplateProcessor","sap/ushell/_ApplicationType/utils","sap/ushell/_ApplicationType/systemAlias","sap/ushell/_ApplicationType/wdaResolution","sap/ushell/_ApplicationType/guiResolution","sap/ushell/services/_ClientSideTargetResolution/ParameterMapping"],function(U,u,a,A,s,w,g,c,p){"use strict";function b(n,B,E){var I=n.inbound;var r=I&&I.resolutionResult;if(!(!I||!r||!(r["sap.wda"]))){return w.constructFullWDAResolutionResult(n,B,E);}if(!(!I||!r)){return w.constructWDAResolutionResult(n,B,E);}}function d(n,B,E){var q=new U(B),I=n.inbound,r=I&&I.resolutionResult,t=jQuery.extend(true,{},n.mappedIntentParamsPlusSimpleDefaults),S,v;if(t["sap-system"]){S=t["sap-system"][0];delete t["sap-system"];}if(t["sap-system-src"]){v=t["sap-system-src"][0];delete t["sap-system-src"];}return new Promise(function(R,x){s.spliceSapSystemIntoURI(q,r.systemAlias,S,v,"WCF",r.systemAliasSemantics||s.SYSTEM_ALIAS_SEMANTICS.applied,E).done(function(y){var P=A.getURLParsing().paramsToString(t),F=A.appendParametersToUrl(P,y.toString());var z={url:F,text:r.text||"",additionalInformation:r.additionalInformation||"",applicationType:"WCF",fullWidth:true};R(z);}).fail(function(y){x(y);});});}function e(n,B,E){var I=n.inbound,q,S,r,t,R={};["applicationType","additionalInformation","applicationDependencies"].forEach(function(P){if(I.resolutionResult.hasOwnProperty(P)){R[P]=I.resolutionResult[P];}});R.url=B;if(R.applicationDependencies&&typeof R.url==="undefined"){R.url="";}if(typeof R.url==="undefined"){return Promise.reject("Cannot resolve intent: url was not specified in matched inbound");}t=jQuery.extend(true,{},n.mappedIntentParamsPlusSimpleDefaults);R.reservedParameters={};var v={"sap-ui-fl-max-layer":true,"sap-ui-fl-control-variant-id":true};Object.keys(v).forEach(function(N){var V=t[N];if(V){delete t[N];R.reservedParameters[N]=V;}});n.mappedDefaultedParamNames=n.mappedDefaultedParamNames.filter(function(D){return!v[D];});if(n.mappedDefaultedParamNames.length>0){t["sap-ushell-defaultedParameterNames"]=[JSON.stringify(n.mappedDefaultedParamNames)];}S=t["sap-system"]&&t["sap-system"][0];r=t["sap-system-src"]&&t["sap-system-src"][0];R["sap-system"]=S;if(typeof r==="string"){R["sap-system-src"]=r;}n.effectiveParameters=t;q=A.getURLParsing().paramsToString(t);if(q){R.url=R.url+((R.url.indexOf("?")<0)?"?":"&")+q;}if(typeof I.resolutionResult.ui5ComponentName!=="undefined"){R.ui5ComponentName=I.resolutionResult.ui5ComponentName;}R.text=I.title;return Promise.resolve(R);}function f(){var n=sap.ushell.Container.getService("UserInfo");var q=n.getUser();var C=sap.ui.getCore().getConfiguration();var r=u.getUi5Version();var t=q.getTheme();var L;var v;if(C){v=C.getLanguage&&C.getLanguage();L=C.getSAPLogonLanguage&&C.getSAPLogonLanguage();}return{language:v,logonLanguage:L,theme:t,isDebugMode:!!window["sap-ui-debug"],ui5Version:r};}function h(n,B,E){var I=n.inbound;var t=I.templateContext;var r={innerAppRoute:n.parsedIntent.appSpecificRoute||undefined,defaultParameterNames:n.mappedDefaultedParamNames,startupParameter:n.intentParamsPlusAllDefaults,env:f()};var q=a.expand(t.payload,t.site,r,t.siteAppSection,"startupParameter");var R={applicationType:"URL",text:I.title,url:q};return i(q).then(function(C){R.url=C;return R;},function(){return R;});}function i(n){return new Promise(function(r,R){var q=new U(n);var P=q.query(true);sap.ushell.Container.getService("ShellNavigation").compactParams(P,[],undefined,true).done(function(C){if(!C.hasOwnProperty("sap-intent-param")){r(n);return;}q.query(C);var t=q.toString();r(t);}).fail(function(E){R(E);});});}function j(n,B,E){var I=n.inbound,q=I&&I.resolutionResult,r={};var t=new U(B);var v=jQuery.extend(true,{},n.mappedIntentParamsPlusSimpleDefaults);if(n.inbound&&n.inbound.action==="launchURL"&&n.inbound.semanticObject==="Shell"){delete v["sap-external-url"];}var S=v["sap-system"]&&v["sap-system"][0];var x=v["sap-system-src"]&&v["sap-system-src"][0];r["sap-system"]=S;delete v["sap-system"];if(typeof x==="string"){r["sap-system-src"]=x;delete v["sap-system-src"];}return(new Promise(function(R,y){if(A.absoluteUrlDefinedByUser(t,q.systemAlias,q.systemAliasSemantics)){R(B);}else{s.spliceSapSystemIntoURI(t,q.systemAlias,S,x,"URL",q.systemAliasSemantics||s.SYSTEM_ALIAS_SEMANTICS.applied,E).fail(y).done(function(z){var C=z.toString();R(C);});}})).then(function(y){var P=A.getURLParsing().paramsToString(v);return A.appendParametersToUrl(P,y);},Promise.reject.bind(Promise)).then(function(y){["additionalInformation","applicationDependencies"].forEach(function(P){if(I.resolutionResult.hasOwnProperty(P)){r[P]=I.resolutionResult[P];}});r.url=y;r.text=I.title;r.applicationType="URL";return Promise.resolve(r);},Promise.reject.bind(Promise));}var o={URL:{type:"URL",defaultFullWidthSetting:true,generateResolutionResult:function(n){var q=n.inbound.hasOwnProperty("templateContext");return q?h.apply(null,arguments):j.apply(null,arguments);},easyAccessMenu:{intent:"Shell-startURL",resolver:null,showSystemSelectionInUserMenu:true,showSystemSelectionInSapMenu:false,systemSelectionPriority:1}},WDA:{type:"WDA",defaultFullWidthSetting:true,generateResolutionResult:b,easyAccessMenu:{intent:"Shell-startWDA",resolver:w.resolveEasyAccessMenuIntentWDA,showSystemSelectionInUserMenu:true,showSystemSelectionInSapMenu:true,systemSelectionPriority:2}},TR:{type:"TR",defaultFullWidthSetting:true,generateResolutionResult:g.generateTRResolutionResult,easyAccessMenu:{intent:"Shell-startGUI",resolver:g.resolveEasyAccessMenuIntentWebgui,showSystemSelectionInUserMenu:true,showSystemSelectionInSapMenu:true,systemSelectionPriority:3}},NWBC:{type:"NWBC",defaultFullWidthSetting:true},WCF:{type:"WCF",generateResolutionResult:d,defaultFullWidthSetting:true},SAPUI5:{type:"SAPUI5",generateResolutionResult:e,defaultFullWidthSetting:false}};function k(){return Object.keys(o).map(function(n){return o[n];}).filter(function(n){return typeof n.easyAccessMenu==="object";});}function l(){var E={};k().forEach(function(n){E[n.easyAccessMenu.intent]=n.easyAccessMenu.resolver;});return function(n,r){if(E[n]&&(!r||r!=="SAPUI5")){return E[n];}return null;};}function m(n){if(!o[n]){return false;}return o[n].defaultFullWidthSetting;}var M={getEasyAccessMenuResolver:l(),getEasyAccessMenuDefinitions:k,getDefaultFullWidthSetting:m};Object.keys(M).forEach(function(n){Object.defineProperty(o,n,{value:M[n]});});return o;},false);
