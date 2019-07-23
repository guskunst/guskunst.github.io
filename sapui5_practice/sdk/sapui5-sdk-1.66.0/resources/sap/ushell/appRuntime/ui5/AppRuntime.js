// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/LoaderExtensions","sap/ushell/appRuntime/ui5/AppCommunicationMgr","sap/ushell/appRuntime/ui5/AppRuntimeService","sap/ui/thirdparty/URI","sap/ushell/appRuntime/ui5/renderers/fiori2/RendererExtensions","sap/ushell/appRuntime/ui5/services/AppConfiguration","sap/ushell/appRuntime/ui5/services/ShellUIService","sap/ushell/appRuntime/ui5/services/UserStatus","sap/ui/core/Popup"],function(L,A,a,U,R,b,S,c,P){"use strict";var p=new U().search(true),C,s;var D="sap/ushell/appRuntime/ui5/AppRuntimeDefaultConfiguration.json";function d(){this.main=function(){var t=this;this.getPageConfig().then(function(){t.setModulePaths();A.init();Promise.all([t.initServicesContainer(),t.getAppInfo()]).then(function(v){var o=v[1];t.createApplication(t.getAppId(),o).then(function(r){t.renderApplication(r);});});});};this.getPageConfig=function(){var m,f;return new Promise(function(r){L.loadResource(D,{async:true}).then(function(g){m=jQuery("meta[name='sap.ushellConfig.ui5appruntime']")[0];f=JSON.parse(m.content);window['sap-ushell-config']=jQuery.extend(true,{},g,f);r();});});};this.setModulePaths=function(){if(window['sap-ushell-config'].modulePaths){var k=Object.keys(window['sap-ushell-config'].modulePaths);for(var f in k){jQuery.sap.registerResourcePath(k[f].replace(/\./g,'/'),window['sap-ushell-config'].modulePaths[k[f]]);}}};this.initServicesContainer=function(){return new Promise(function(r,f){sap.ui.require(["sap/ushell/appRuntime/ui5/services/Container"],function(o){o.bootstrap("apprt",{apprt:"sap.ushell.appRuntime.ui5.services.adapters"}).then(function(){r();});});});};this._getURIParams=function(){return p;};this.getAppId=function(){var f=this._getURIParams()["sap-ui-app-id"];if(f===undefined){throw new Error("FATAL: missing URI parameter 'sap-ui-app-id'");}return f;};this.getAppInfo=function(){var o=window["sap-ushell-config"].ui5appruntime.config.appIndex.data,m=window["sap-ushell-config"].ui5appruntime.config.appIndex.module;return new Promise(function(r){if(o&&!jQuery.isEmptyObject(o)){r(o);}else{sap.ui.require([m.replace(/\./g,'/')],function(f){f.getAppInfo().then(function(g){r(g);});});}});};this.setApplicationParameters=function(o){var h=window.hasher.getHash(),H,f,i,g,j=new jQuery.Deferred();if(!h||!h.length>0){jQuery.sap.log.error("AppRuntime.validateParams - sHash = "+h);return j.resolve().promise();}function k(t){var E=sap.ushell.Container.getService("URLShortening").expandHash(t);f=sap.ushell.Container.getService("URLParsing").parseShellHash(E);f.appSpecificRoute=undefined;}function l(){H=sap.ushell.Container.getService("URLParsing").constructShellHash(f);i=H.indexOf("?");if(i>=0){g=H.slice(i+1);o.url+=(o.url.indexOf("?")<0)?"?":"&";o.url+=g;}}k(h);if(f&&f.params["sap-intent-param"]!=undefined){a.sendMessageToOuterShell("sap.ushell.services.NavTargetResolution.expandCompactHash",{"sHashFragment":h}).done(function(n){k(n);l();j.resolve();});}else{l();j.resolve();}return j.promise();};this.setHashChangedCallback=function(){function t(n,o){if(n&&typeof n==="string"&&n.length>0){a.sendMessageToOuterShell("sap.ushell.appRuntime.hashChange",{"newHash":n});}}window.hasher.changed.add(t.bind(this),this);};this.createApplication=function(f,o){var t=this;var g=function(E){a.sendMessageToOuterShell("sap.ushell.services.ShellUIService.showShellUIBlocker",{"bShow":E.getParameters().visible});};return new Promise(function(r,h){C=new sap.ui.core.ComponentContainer({id:"TODO-define-correct-ID-content",width:"100%",height:"100%"});sap.ushell.renderers.fiori2.utils.init();s=sap.ushell.Container.getService("ShellNavigation");s.init(function(){});s.registerNavigationFilter(function(n,i){if(sap.ushell.Container.getDirtyFlag()){return s.NavigationFilterStatus.Abandon;}return s.NavigationFilterStatus.Continue;}.bind(this));new S({scopeObject:C,scopeType:"component"});new c({scopeObject:C,scopeType:"component"});P.attachBlockLayerStateChange(g);t.setApplicationParameters(o).done(function(){t.setHashChangedCallback();sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function(u){u.createComponent({ui5ComponentName:f,applicationDependencies:o,url:o.url},"todo-replaceDummyShellHash",false).then(function(i){r(i);});});});});};this.renderApplication=function(r){C.setComponent(r.componentHandle.getInstance()).placeAt("content");};}var e=new d();e.main();return e;});