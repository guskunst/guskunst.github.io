/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/ManagedObject","sap/ui/model/odata/v2/ODataModel"],function(M,O){"use strict";var m;var S=M.extend("sap.ui.rta.appVariant.S4HanaCloudBackend",{constructor:function(){M.apply(this,arguments);}});S.prototype.notifyFlpCustomizingIsReady=function(i,a,c,b){var t=this;return new Promise(function(r,d){function e(n){return!isNaN(parseFloat(n))&&isFinite(n);}var f=e(c)?c:2500;var R=e(b)?b:-1;function g(){if(R==0){r({iamAppId:i,customizingIsReady:false});return;}else if(R>0){R=R-1;}this.checkCatalogCustomizingIsReady(i,a).then(function(I){if(I){r({iamAppId:i,customizingIsReady:true});}else{setTimeout(g.bind(t),f);}}).catch(function(E){jQuery.sap.log.error(E);d({iamAppId:i});});}setTimeout(g.bind(t),f);});};S._isAppReady=function(a,A){var c=a.data.results;if(!Array.isArray(c)){throw new Error(a.requestUri+" returned unexpected result: "+a);}var i=c.every(function(C){return C.ActualStatus===1;});var I=c.every(function(C){return C.ActualStatus===2;});var e=c.some(function(C){return C.ActualStatus===5||C.ActualStatus===4;});if(e){var t=A?"creation":"deletion";throw new Error("Catalog failed for app variant "+t);}return A?I:i;};S._getODataModel=function(){if(!m){m=new Promise(function(r,a){var o=new O("/sap/opu/odata/sap/APS_IAM_APP_SRV");o.attachMetadataFailed(function(e){a(e);m=null;});o.metadataLoaded().then(function(){r(o);});});}return m;};S._readODataModel=function(o,i){return new Promise(function(r,a){var s=function(d,R){r(R);};var f=function(e){a(e);};return o.read("/aps_iam_app_ddl('"+i+"')/to_BusinessCatalogAssignment",{success:s,error:f});});};S.prototype.checkCatalogCustomizingIsReady=function(i,a){return S._getODataModel().then(function(o){return S._readODataModel(o,i);}).then(function(A){return S._isAppReady(A,a);});};return S;});
