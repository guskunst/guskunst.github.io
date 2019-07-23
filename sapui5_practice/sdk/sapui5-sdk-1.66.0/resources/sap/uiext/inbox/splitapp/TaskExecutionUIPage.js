/*!
 * SAPUI5
 * 
 * (c) Copyright 2009-2019 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.uiext.inbox.splitapp.TaskExecutionUIPage");jQuery.sap.require("sap.m.MessageToast");sap.ui.base.Object.extend("sap.uiext.inbox.splitapp.TaskExecutionUIPage",{constructor:function(I){sap.ui.base.Object.apply(this);this.Id=I;this._oCore=sap.ui.getCore();this._oBundle=this._oCore.getLibraryResourceBundle("sap.uiext.inbox");this.oTaskExecutionUIPage=this._createTaskExecutionUIPage();}});
sap.uiext.inbox.splitapp.TaskExecutionUIPage.prototype._createTaskExecutionUIPage=function(){var t=this;var T=t._oCore.byId(this.Id+"-taskExecUIPage");if(!T){T=new sap.m.Page(this.Id+"-taskExecUIPage",{showNavButton:true,navButtonPress:function(){t.handleNavButtonPress();},});}return T;};
sap.uiext.inbox.splitapp.TaskExecutionUIPage.prototype.getPage=function(){return this.oTaskExecutionUIPage;};
sap.uiext.inbox.splitapp.TaskExecutionUIPage.prototype.handleNavButtonPress=function(){sap.ui.getCore().getEventBus().publish('sap.uiext.inbox','taskExecUIPageNavButtonPressed');};
sap.uiext.inbox.splitapp.TaskExecutionUIPage.prototype.open=function(){var t=this;var c=t.oTaskExecutionUIPage.getBindingContext();if(!t.oModel){t.oModel=t.oTaskExecutionUIPage.getModel("inboxTCMModel");}var d=t.oTaskExecutionUIPage.getModel();var T=d.getProperty("TaskTitle",c);var i=d.getProperty("InstanceID",c);var s=d.getProperty("SAP__Origin",c);var e=t._getTaskExecutionURLCallBack(i,s);if(jQuery.device.is.android_tablet||jQuery.device.is.ipad||jQuery.device.is.desktop){var o=window.open(e);o.document.title=T;o.focus();}else if(jQuery.device.is.phone){var h=sap.ui.getCore().byId('tsk'+'--'+"execURLFrame");if(!h){h=new sap.ui.core.HTML('tsk'+'--'+"execURLFrame");}var C="<iframe name='myframe' src='"+e+"' scrolling='auto' id = '"+'tsk'+'--'+"execURLFrame"+"' style='position: absolute;height: 100%;width: 100%; border: none;'></iframe>";h.setContent(C);t.oTaskExecutionUIPage.setTitle(T);t.oTaskExecutionUIPage.addContent(h);}};
sap.uiext.inbox.splitapp.TaskExecutionUIPage.prototype._getTaskExecutionURLCallBack=function(i,s){var I='/TaskCollection'+"(InstanceID='"+i+"',SAP__Origin='"+s+"')/UIExecutionLink?$format=json";var r=this.oTaskExecutionUIPage.getModel("inboxTCMModel").sServiceUrl+I;var u="";var t=this;var a={async:false,requestUri:r,method:"GET",headers:{Accept:"application/json"}};OData.request(a,function(d,b){u=d.GUI_Link;},function(e){if(e.response.statusCode==205){}else{}sap.m.MessageToast.show(t._oBundle.getText("INBOX_MSG_ACTION_FAILED",[u,""]));});return u;};
