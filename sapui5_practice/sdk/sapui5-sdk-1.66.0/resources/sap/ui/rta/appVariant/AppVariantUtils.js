/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory","sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory","sap/ui/fl/Utils","sap/m/MessageBox","sap/ui/rta/Utils","sap/ui/fl/descriptorRelated/internal/Utils","sap/ui/fl/transport/TransportSelection","sap/ui/fl/transport/Transports","sap/base/util/uid","sap/base/Log"],function(D,a,F,M,R,b,T,c,u,L){"use strict";var A={};var H=56;A._newAppVariantId=null;A.getManifirstSupport=function(r){var s='/sap/bc/ui2/app_index/ui5_app_mani_first_supported/?id='+r;return b.sendRequest(s,'GET');};A.isStandAloneApp=function(){if(sap.ushell_abap){return false;}else{return true;}};A.getNewAppVariantId=function(){return A._newAppVariantId;};A.setNewAppVariantId=function(n){A._newAppVariantId=n;};A.trimIdIfRequired=function(i){if(i.length>H){var I=i.split('.');var t;var g=I[I.length-1].length;var G=I.pop();t=I.join(".");if(t.length>g){t=t.substring(0,t.length-g);}else{return i.substr(0,H);}if(t[t.length-1]==='.'){t=t+G;}else{t=t+"."+G;}return this.trimIdIfRequired(t);}return i;};A.getId=function(B){var C;var i=B.split('.');if(i[0]!=="customer"){i[0]="customer."+i[0];}var r=false;var d=/^id.*/i;i.forEach(function(s,e,f){if(s.match(d)){s=s.replace(d,u().replace(/-/g,"_"));f[e]=s;r=true;}});C=i.join(".");if(!r){C=C+"."+u().replace(/-/g,"_");}C=this.trimIdIfRequired(C);this.setNewAppVariantId(C);return C;};A.createDescriptorVariant=function(p){p.layer=F.getCurrentLayer(false);p.version="1.0.0";return D.createNew(p);};A.getInlineChangeInput=function(v,C){return{"type":"XTIT","maxLength":50,"comment":C,"value":{"":v}};};A.getInlinePropertyChange=function(p,P){var C="New "+p+" entered by a key user via RTA tool";return this.getInlineChangeInput(P,C);};A.getInlineChangeInputIcon=function(i){return{icon:i};};A.getInlineChangeRemoveInbounds=function(i){return{"inboundId":i};};A.getInboundInfo=function(i){var I={};if(!i){I.currentRunningInbound="customer.savedAsAppVariant";I.addNewInboundRequired=true;return I;}var p=F.getParsedURLHash();var d=Object.keys(i);var e=[];d.forEach(function(s){if((i[s].action===p.action)&&(i[s].semanticObject===p.semanticObject)){e.push(s);}});switch(e.length){case 0:I.currentRunningInbound="customer.savedAsAppVariant";I.addNewInboundRequired=true;break;case 1:I.currentRunningInbound=e[0];I.addNewInboundRequired=false;break;default:I=undefined;break;}return I;};A.getInboundPropertiesKey=function(s,C,p){return s+"_sap.app.crossNavigation.inbounds."+C+"."+p;};A.getInlineChangesForInboundProperties=function(C,s,p,P){var o={"inboundId":C,"entityPropertyChange":{"propertyPath":p,"operation":"UPSERT","propertyValue":{}},"texts":{}};if(p==="title"||p==="subTitle"){var k=this.getInboundPropertiesKey(s,C,p);o.entityPropertyChange.propertyValue="{{"+k+"}}";o.texts[k]=this.getInlinePropertyChange(p,P);}else if(p==="icon"){o.entityPropertyChange.propertyValue=P;}return o;};A.getInlineChangeForInboundPropertySaveAs=function(C){return{"inboundId":C,"entityPropertyChange":{"propertyPath":"signature/parameters/sap-appvar-id","operation":"UPSERT","propertyValue":{"required":true,"filter":{"value":this.getNewAppVariantId(),"format":"plain"},"launcherValue":{"value":this.getNewAppVariantId()}}}};};A.getInlineChangeCreateInbound=function(C){var p=F.getParsedURLHash();var P={"inbound":{}};P.inbound[C]={"semanticObject":p.semanticObject,"action":p.action};return P;};A.createInlineChange=function(p,C){var t;if(C==="title"){return a.create_app_setTitle(p);}else if(C==="description"){return a.create_app_setDescription(p);}else if(C==="subtitle"){return a.create_app_setSubTitle(p);}else if(C==="icon"){return a.create_ui_setIcon(p);}else if(C==="inbound"){return a.create_app_changeInbound(p);}else if(C==="createInbound"){return a.create_app_addNewInbound(p);}else if(C==="inboundTitle"){t=p.texts;delete p.texts;return a.create_app_changeInbound(p,t);}else if(C==="inboundSubtitle"){t=p.texts;delete p.texts;return a.create_app_changeInbound(p,t);}else if(C==="inboundIcon"){delete p.texts;return a.create_app_changeInbound(p);}else if(C==="removeInbound"){return a.create_app_removeAllInboundsExceptOne(p);}};A.getTransportInput=function(p,n,N,t){return{getPackage:function(){return p;},getNamespace:function(){return n;},getId:function(){return N;},getDefinition:function(){return{fileType:t};}};};A.triggerCatalogAssignment=function(s,o){var r='/sap/bc/lrep/appdescr_variants/'+s+'?action=assignCatalogs&assignFromAppId='+o;return b.sendRequest(r,'POST');};A.triggerCatalogUnAssignment=function(s){var r='/sap/bc/lrep/appdescr_variants/'+s+'?action=unassignCatalogs';return b.sendRequest(r,'POST');};A.isS4HanaCloud=function(s){return s.isAtoEnabled()&&s.isAtoAvailable();};A.copyId=function(i){var t=document.createElement("textarea");t.value=i;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);return true;};A.getTextResources=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");};A.getText=function(m,t){var o=this.getTextResources();return t?o.getText(m,t):o.getText(m);};A._getErrorMessageText=function(e){var E;if(e.messages&&e.messages.length){E=e.messages.map(function(e){return e.text;}).join("\n");}else if(e.iamAppId){E="IAM App Id: "+e.iamAppId;}else{E=e.stack||e.message||e.status||e;}return E;};A.buildErrorInfo=function(m,e,s){var E=this._getErrorMessageText(e);var d=A.getText(m)+"\n\n";if(s){d+=A.getText("MSG_APP_VARIANT_ID",s)+"\n";}d+=A.getText("MSG_TECHNICAL_ERROR",E);L.error("App variant error: ",E);return{text:d,appVariantId:s};};A.showRelevantDialog=function(i,s){var t,r,o,C,d=[];if(s){t=this.getText("SAVE_APP_VARIANT_SUCCESS_MESSAGE_TITLE");r=this.getText("SAVE_APP_VARIANT_OK_TEXT");}else{t=this.getText("HEADER_SAVE_APP_VARIANT_FAILED");r=this.getText("SAVE_APP_VARIANT_CLOSE_TEXT");}if(i&&i.copyId){C=this.getText("SAVE_APP_VARIANT_COPY_ID_TEXT");d.push(C);}else if(i&&i.deleteAppVariant){t=this.getText("DELETE_APP_VARIANT_INFO_MESSAGE_TITLE");o=this.getText("DELETE_APP_VARIANT_OK_TEXT");d.push(o);r=this.getText("DELETE_APP_VARIANT_CLOSE_TEXT");}d.push(r);return new Promise(function(e,f){var g=function(h){if(s&&h===r){e();}else if(s&&h===C){A.copyId(i.appVariantId);e();}else if(i.overviewDialog&&h===r){e(false);}else if(i.deleteAppVariant&&h===o){e();}else if(i.deleteAppVariant&&h===r){f();}else if(h===r){f();}else if(h===C){A.copyId(i.appVariantId);f();}};M.show(i.text,{icon:(s||i.deleteAppVariant)?M.Icon.INFORMATION:M.Icon.ERROR,onClose:g,title:t,actions:d,styleClass:R.getRtaStyleClassName()});});};A.closeOverviewDialog=function(){sap.ui.getCore().getEventBus().publish("sap.ui.rta.appVariant.manageApps.controller.ManageApps","navigate");};A.navigateToFLPHomepage=function(){var o=sap.ushell.services.AppConfiguration.getCurrentApplication();var C=o.componentHandle.getInstance();if(C){var U=F.getUshellContainer();var d=U&&U.getService("CrossApplicationNavigation");if(d&&d.toExternal){d.toExternal({target:{shellHash:"#"}},C);}}return Promise.resolve();};A.onTransportInDialogSelected=function(o,t){if(t){if(t.transport&&t.packageName!=="$TMP"){if(t.transport){return o.setTransportRequest(t.transport).then(function(){return o;});}}return Promise.resolve(o);}return Promise.reject();};A.openTransportSelection=function(t){var o=new T();return o.openTransportSelection(t,this,R.getRtaStyleClassName());};A._deleteAppVariantWithTransport=function(o,t){var d=this.getTransportInput("",o.getNamespace(),"manifest","appdescr_variant");if(!t.localonly&&t.transports.length===0&&!this.isS4HanaCloud(o.getSettings())){return R._showMessageBox(M.Icon.INFORMATION,"DELETE_APP_VARIANT_NO_TRANSPORT","MSG_DELETE_APP_VARIANT_NOT_POSSIBLE");}else{return this.openTransportSelection(d).then(function(e){return this.onTransportInDialogSelected(o,e);}.bind(this)).then(function(){return o.submit();}).then(function(){this.closeOverviewDialog();return R._showMessageBox(M.Icon.INFORMATION,"DELETE_APP_VARIANT_NO_TRANSPORT","DELETE_APP_VARIANT_SUCCESS_MESSAGE");}.bind(this));}};A.createDeletion=function(s){return D.createDeletion(s);};A._getTransportInformation=function(t){var m={};if(t){m.package=t.getPackage();m.namespace=t.getNamespace();m.name=t.getId();m.type=t.getDefinition().fileType;}var o=new c();return o.getTransports(m);};A.triggerDeleteAppVariantFromLREP=function(o){var t=this.getTransportInput("",o.getNamespace(),"manifest","appdescr_variant");return this._getTransportInformation(t).then(function(d){return this._deleteAppVariantWithTransport(o,d);}.bind(this)).catch(function(e){if(e){var E=this.buildErrorInfo("MSG_DELETE_APP_VARIANT_FAILED",e,o.getId());return this.showRelevantDialog(E,false);}}.bind(this));};A.getDescriptorFromLREP=function(s){return D.createForExisting(s);};return A;},true);
