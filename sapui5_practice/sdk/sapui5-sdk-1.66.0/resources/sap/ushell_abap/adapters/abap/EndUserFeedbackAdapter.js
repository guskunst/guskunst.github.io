// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui2/srvc/ODataWrapper","sap/ui2/srvc/ODataService"],function(O,a){"use strict";return function(s){var d={baseUrl:"/sap/opu/odata/UI2/INTEROP/",'sap-language':sap.ushell.Container.getUser().getLanguage(),'sap-client':sap.ushell.Container.getLogonSystem().getClient()};var o=sap.ui2.srvc.createODataWrapper(d),l=false,L="";this.sendFeedback=function(e){var D,r="FeedbackHeaders",E={isAnonymous:e.isAnonymous,feedbackText:e.feedbackText,applicationType:e.applicationType||"<undefined>",additionalInformation:e.additionalInformation,url:e.url,navigationIntent:e.navigationIntent,formFactor:e.formFactor,eMail:e.eMail,userId:e.userId,Ratings:e.ratings};D=new jQuery.Deferred();sap.ui2.srvc.ODataService.call(this,o,function(){return false;});o.create(r,E,function(b){D.resolve(b.feedbackCount);},function(b){D.reject(b);});return D.promise();};this.getLegalText=function(){var D,r="FeedbackLegalTexts('1')";D=new jQuery.Deferred();if(l){sap.ui2.srvc.call(function(b){D.resolve(L);});return D.promise();}sap.ui2.srvc.ODataService.call(this,o,function(){return false;});o.read(r,function(b){L=b.legalText;l=true;D.resolve(b.legalText);},function(e){D.reject(e);});return D.promise();};this.isEnabled=function(){var D=new jQuery.Deferred(),b=this.getLegalText();b.done(function(L){if(L){D.resolve();}else{D.reject();}});b.fail(function(e){D.reject();});return D.promise();};};},true);
