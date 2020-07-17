// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell_abap/adapters/abap/AdapterContainer","sap/ushell/services/Personalization","sap/ushell/services/_Personalization/constants","sap/ui2/srvc/ODataWrapper","sap/ui2/srvc/ODataService"],function(A,P,c,O,a){"use strict";var b=function(s,p,C){this._oConfig=C&&C.config;var d=(jQuery.sap.getObject("config.services.personalization.baseUrl",undefined,C)||"/sap/opu/odata/UI2/INTEROP")+"/";var o={baseUrl:d,'sap-language':sap.ushell.Container.getUser().getLanguage(),'sap-client':sap.ushell.Container.getLogonSystem().getClient()};this._oWrapper=sap.ui2.srvc.createODataWrapper(o);function D(m){sap.ui2.srvc.Error(m,"sap.ushell_abap.adapters.abap.PersonalizationAdapter");}sap.ui2.srvc.ODataService.call(this,this._oWrapper,D);};b.prototype.supportsGetWithoutSubsequentLoad=true;b.prototype.getAdapterContainer=function(C,s,d){return new A(C,this,s,d);};b.prototype.delAdapterContainer=function(C,s){return this.getAdapterContainer(C,s).del();};sap.ui2.srvc.testPublishAt(b);b.prototype._determineCategory=function(s){if(!s){return"U";}var C=c;if(s.keyCategory&&s.keyCategory===C.keyCategory.FIXED_KEY&&s.writeFrequency&&s.writeFrequency===C.writeFrequency.LOW&&s.clientStorageAllowed&&s.clientStorageAllowed===true){return"P";}return"U";};return b;},true);