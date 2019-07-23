/*!
 * SAPUI5
 * 
 * (c) Copyright 2009-2019 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.uiext.inbox.InboxSplitApp");jQuery.sap.require("sap.uiext.inbox.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.uiext.inbox.InboxSplitApp",{metadata:{deprecated:true,publicMethods:["bindTasks","resetSearchCriteria"],library:"sap.uiext.inbox",properties:{"showMasterPageNavBtn":{type:"boolean",group:"Appearance",defaultValue:null},"tcmServiceURL":{type:"string",group:"",defaultValue:null},"filters":{type:"object[]",group:"Misc",defaultValue:null},"tcmConfiguration":{type:"object",group:"Misc",defaultValue:null}},aggregations:{"splitAppl":{type:"sap.m.SplitApp",multiple:false}},events:{"navButtonPressed":{}}}});sap.uiext.inbox.InboxSplitApp.M_EVENTS={'navButtonPressed':'navButtonPressed'};
/*!
 * @copyright@
 * @deprecated Since version 1.38.0
 */
jQuery.sap.require("sap.uiext.inbox.splitapp.MasterPage");jQuery.sap.require("sap.uiext.inbox.splitapp.DetailViewPage");
sap.uiext.inbox.InboxSplitApp.prototype.init=function(){this.oCore=sap.ui.getCore();this.bPhoneDevice=jQuery.device.is.phone;this.setAggregation("splitAppl",new sap.m.SplitApp({mode:this.bPhoneDevice?sap.m.SplitAppMode.HideMode:sap.m.SplitAppMode.StretchCompressMode}));this.oSplitApp=this.getAggregation("splitAppl");this.oInboxMasterPage=new sap.uiext.inbox.splitapp.MasterPage(this.getId()+"-mp");this.oSplitApp.addMasterPage(this.oInboxMasterPage.getPage());this.oInboxDetailPage=new sap.uiext.inbox.splitapp.DetailViewPage(this.getId()+"-dp");this.oSplitApp.addDetailPage(this.oInboxDetailPage.getPage());var h=jQuery.proxy(this._handleListSelect,this);this.oCore.getEventBus().subscribe('sap.uiext.inbox',"masterPageListSelected",h);var n=jQuery.proxy(this._handleNavButtonTapped,this);this.oCore.getEventBus().subscribe('sap.uiext.inbox',"masterPageNavButtonTapped",n);var N=jQuery.proxy(this._handleNavButtonPressDetailPage,this);this.oCore.getEventBus().subscribe('sap.uiext.inbox',"detailPageNavButtonTapped",N);var t=jQuery.proxy(this._handleOpenTaskExecutionUI,this);this.oCore.getEventBus().subscribe('sap.uiext.inbox',"detailPageTaskTitleSelected",t);var H=jQuery.proxy(this._handleTaskActionCompleted,this);this.oCore.getEventBus().subscribe('sap.uiext.inbox',"taskActionCompleted",H);};
sap.uiext.inbox.InboxSplitApp.prototype.setTcmServiceURL=function(v){this.setProperty("tcmServiceURL",v,true);var t=new sap.ui.model.odata.ODataModel(v,true);t.setCountSupported(false);this.setModel(t,"inboxTCMModel");this.oInboxDetailPage._setTcmServiceURL(v);this.oInboxMasterPage._setTcmServiceURL(v);return this;};
sap.uiext.inbox.InboxSplitApp.prototype.setTcmConfiguration=function(t){this.setProperty("tcmConfiguration",t,true);var T=this.getProperty("tcmConfiguration");this.oInboxDetailPage._setTcmConfiguration(T);return this;};
sap.uiext.inbox.InboxSplitApp.prototype.setShowMasterPageNavBtn=function(v){this.setProperty("showMasterPageNavBtn",v,true);this.oInboxMasterPage.setShowNavButton(v);return this;};
sap.uiext.inbox.InboxSplitApp.prototype._handleNavButtonTapped=function(c,e,p){this.fireNavButtonPressed();};
sap.uiext.inbox.InboxSplitApp.prototype._handleNavButtonPressDetailPage=function(c,e){this.oSplitApp.toMaster(this.oInboxMasterPage.getPage().getId());};
sap.uiext.inbox.InboxSplitApp.prototype.bindTasks=function(f){this.oInboxMasterPage.bindService(f);return this;};
sap.uiext.inbox.InboxSplitApp.prototype.resetSearchCriteria=function(){if(this.oInboxMasterPage){this.oInboxMasterPage.resetSearchCriteria();}return this;};
sap.uiext.inbox.InboxSplitApp.prototype._handleOpenTaskExecutionUI=function(c,e,t){if(!this.oTaskExecutionUIPageObj){this._createTaskExecutionUIPage();}this.oTaskExecutionUIPageObj.getPage().setBindingContext(t.context);this.oTaskExecutionUIPageObj.open();if(jQuery.device.is.phone){this.oSplitApp.to(this.oTaskExecutionUIPageObj.getPage().getId());}};
sap.uiext.inbox.InboxSplitApp.prototype._createTaskExecutionUIPage=function(){jQuery.sap.require("sap.uiext.inbox.splitapp.TaskExecutionUIPage");this.oTaskExecutionUIPageObj=new sap.uiext.inbox.splitapp.TaskExecutionUIPage(this.getId()+"-exUi");this.oSplitApp.addPage(this.oTaskExecutionUIPageObj.getPage());var c=jQuery.proxy(this._handleTaskExecUIPageNavButtonPressed,this);this.oCore.getEventBus().subscribe('sap.uiext.inbox',"taskExecUIPageNavButtonPressed",c);};
sap.uiext.inbox.InboxSplitApp.prototype._handleTaskExecUIPageNavButtonPressed=function(c,e,p){this.oSplitApp.backToTopDetail();this.oInboxMasterPage._refreshTasks(null,this.oInboxMasterPage);this.oInboxDetailPage.renderDetailsPage();};
sap.uiext.inbox.InboxSplitApp.prototype._handleListSelect=function(c,e,l){this.oInboxDetailPage.getPage().setBindingContext(l.context);if(this.bPhoneDevice){this.oSplitApp.toDetail(this.oInboxDetailPage.getPage().getId());}if(this.oInboxDetailPage.getPage().getId()==this.oSplitApp.getCurrentPage().getId()){this.oInboxDetailPage.renderDetailsPage(l.onUpdate);}else{this._handleOpenTaskExecutionUI(null,null,l);}};
sap.uiext.inbox.InboxSplitApp.prototype._handleTaskActionCompleted=function(c,e,t){if(!this.bPhoneDevice){this.oInboxMasterPage.rerenderTask(t.taskData);}else{this.oInboxDetailPage.updateTaskDataInModel(t.taskData);if(t.taskData.Status!="COMPLETED"){this.oInboxDetailPage.renderDetailsPage();}else{this.oSplitApp.toMaster(this.oInboxMasterPage.getPage().getId());}}};
