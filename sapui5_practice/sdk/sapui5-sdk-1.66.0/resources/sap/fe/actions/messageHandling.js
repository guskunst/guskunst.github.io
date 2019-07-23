/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/factory/UI5ControlFactory","sap/m/MessageToast","sap/ui/core/MessageType"],function(U,M,a){'use strict';var t=this;function f(){var p;function i(P){return P.property?'( ${'+P.property+'} ? ("<p>'+P.property.substr(Math.max(P.property.lastIndexOf('/'),P.property.lastIndexOf('.'))+1)+' : " + '+'${'+P.property+'} + "<p/>") : "" )':'';}function d(P){var h='';if(P.groupName&&P.property&&P.groupName!==p){h+='( ${'+P.property+'} ? "<br/><h3>'+P.groupName+'</h3>" : "" ) + ';p=P.groupName;}return h;}function e(){var T="technicalDetails";return[{'groupName':'','property':T+"/status"},{'groupName':'','property':T+"/statusText"},{'groupName':'Application','property':T+"/error/@SAP__common.Application/ComponentId"},{'groupName':'Application','property':T+"/error/@SAP__common.Application/ServiceId"},{'groupName':'Application','property':T+"/error/@SAP__common.Application/ServiceRepository"},{'groupName':'Application','property':T+"/error/@SAP__common.Application/ServiceVersion"},{'groupName':'ErrorResolution','property':T+"/error/@SAP__common.ErrorResolution/Analysis"},{'groupName':'ErrorResolution','property':T+"/error/@SAP__common.ErrorResolution/Note"},{'groupName':'ErrorResolution','property':T+"/error/@SAP__common.ErrorResolution/DetailedNote"},{'groupName':'ErrorResolution','property':T+"/error/@SAP__common.ExceptionCategory"},{'groupName':'ErrorResolution','property':T+"/error/@SAP__common.TimeStamp"},{'groupName':'ErrorResolution','property':T+"/error/@SAP__common.TransactionId"},{'groupName':'Messages','property':T+"/error/code"},{'groupName':'Messages','property':T+"/error/message"}];}var h='(${technicalDetails} ? "<h2>Technical Details</h2>" : "") + ';e().forEach(function(P){h=h+d(P)+''+i(P)+' + ';});return h;}function F(){var h='(${'+'description} ? ("<h2>Description</h2>" + ${'+'description}) : "")';return h;}function s(){var u=g(),o=sap.ui.getCore().getMessageManager();if(u.length===0){return Promise.resolve(true);}else if(u.length===1&&u[0].getType()===a.Success){return new Promise(function(d,e){M.show(u[0].message);o.removeMessages(u);});}else{return new Promise(function(d,e){sap.ui.getCore().getLibraryResourceBundle("sap.fe",true).then(function(R){t.oMessageTemplate=t.oMessageTemplate||U.getMessageItem({counter:'{counter}',title:'{message}',subtitle:'{additionalText}',longtextUrl:'{descriptionUrl}',type:'{type}',description:'{= ${'+'description} || ${technicalDetails} ? '+'"<html><body>" + '+F()+' + '+f()+'"</body></html>"'+' : "" }',markupDescription:true});t.oMessageView=t.oMessageView||U.getMessageView({showDetailsPageHeader:false,itemSelect:function(){t.oBackButton.setVisible(true);},items:{path:'/',filters:[new sap.ui.model.Filter('target',sap.ui.model.FilterOperator.EQ,'')],template:t.oMessageTemplate}});t.oBackButton=t.oBackButton||U.getButtonControl({icon:sap.ui.core.IconPool.getIconURI("nav-back"),visible:false,press:function(){t.oMessageView.navigateBack();this.setVisible(false);}});t.oMessageView.setModel(o.getMessageModel());t.oDialog=t.oDialog||U.getDialogControl({resizable:true,content:t.oMessageView,state:'Error',beginButton:U.getButtonControl({press:function(){t.oDialog.close();o.removeAllMessages();},text:R.getText('SAPFE_CLOSE')}),customHeader:new sap.m.Bar({contentMiddle:[new sap.m.Text({text:R.getText('SAPFE_ERROR')})],contentLeft:[t.oBackButton]}),contentWidth:"37.5em",contentHeight:"21.5em",verticalScrolling:false,afterClose:function(E){d();}});t.oDialog.open();});});}}function r(){c(false);}function b(){c(true);}function g(B,T){var o=sap.ui.getCore().getMessageManager(),d=o.getMessageModel(),e=d.getObject('/'),h=[];for(var i=0;i<e.length;i++){if((!T||e[i].persistent)&&(B&&e[i].target!==''||e[i].target==='')){h.push(e[i]);}}return h;}function c(B){var d=g(B,true);if(d.length>0){sap.ui.getCore().getMessageManager().removeMessages(d);}}var m={showUnboundMessages:s,removeUnboundTransitionMessages:r,removeBoundTransitionMessages:b};return m;});
