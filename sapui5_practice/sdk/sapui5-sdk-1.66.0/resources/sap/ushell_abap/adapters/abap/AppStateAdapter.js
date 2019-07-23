// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/Personalization","sap/ui2/srvc/ODataWrapper"],function(P,O){"use strict";var A=function(s,p,c){this._oConfig=c&&c.config;var a=(jQuery.sap.getObject("services.appState.baseUrl",undefined,c)||"/sap/opu/odata/UI2/INTEROP")+"/";var o={baseUrl:a,'sap-language':sap.ushell.Container.getUser().getLanguage(),'sap-client':sap.ushell.Container.getLogonSystem().getClient()};this._oWrapper=sap.ui2.srvc.createODataWrapper(o);function d(m){sap.ui2.srvc.Error(m,"sap.ushell_abap.adapters.abap.AppStateAdapter");}sap.ui2.srvc.ODataService.call(this,this._oWrapper,d);};A.prototype.saveAppState=function(k,s,v,a,c){var d=new jQuery.Deferred(),r="GlobalContainers",p={"id":k,"sessionKey":s,"component":c,"appName":a,"value":v};this._oWrapper.create(r,p,function(b){d.resolve();},function(e){d.reject(e);jQuery.sap.log.error(e);});return d.promise();};A.prototype.loadAppState=function(k){var d=new jQuery.Deferred(),r="GlobalContainers(id='"+encodeURIComponent(k)+"')";if(!k){throw new sap.ushell.utils.Error("The sKey is mandatory to read the data from the persistence layer");}this._oWrapper.openBatchQueue();this._oWrapper.read(r,function(a){d.resolve(a.id,a.value);},function(e){jQuery.sap.log.error(e);d.reject(e);},false);this._oWrapper.submitBatchQueue(function(){},function(e){jQuery.sap.log.error(e);d.reject(e);});return d.promise();};return A;},true);
