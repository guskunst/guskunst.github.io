// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(['sap/ui/core/IconPool','sap/ui/Device','sap/ui/core/HTML','sap/ushell/components/_HeaderManager/ControlManager','sap/ushell/components/HeaderManager','sap/ushell/components/_HeaderManager/ShellHeader.controller','sap/ushell/ui/launchpad/ActionItem','sap/ushell/ui/shell/ShellHeadItem','sap/ushell/ui/shell/ToolArea','sap/ushell/ui/footerbar/ContactSupportButton','sap/ushell/ui/launchpad/AccessibilityCustomData','sap/ushell/renderers/fiori2/AccessKeysHandler','sap/m/Button','sap/m/Dialog','sap/ushell/resources','sap/ushell/utils','sap/ushell/Config','sap/ushell/EventHub','sap/ui/model/json/JSONModel'],function(I,D,H,a,b,S,A,c,T,C,d,e,B,f,r,u,g,E,J){"use strict";function s(i,o){return sap.ui.getCore().byId(o.getObject());}sap.ui.jsview("sap.ushell.renderers.fiori2.Shell",{createContent:function(o){this.oController=o;this.oShellAppTitleStateEnum={SHELL_NAV_MENU_ONLY:0,ALL_MY_APPS_ONLY:1,SHELL_NAV_MENU:2,ALL_MY_APPS:3};var v=this.getViewData()||{},h=v.config||{},i=new c({id:"configBtn",tooltip:"{i18n>showGrpsBtn_tooltip}",ariaLabel:"{i18n>showGrpsBtn_tooltip}",icon:I.getIconURI("menu2"),selected:{path:"/currentState/showPane"},press:[o.togglePane,o]});this.oConfig=h;this.aDanglingControls=[];this._allowUpToThreeActionInShellHeader(h);i.addEventDelegate({onsapskipforward:function(l){if(e.getAppKeysHandler()){l.preventDefault();e.bFocusOnShell=false;}},onfocusin:function(){e.bFocusOnShell=true;e.bFocusPassedToExternalHandlerFirstTime=true;}});this.addDanglingControl(i);var U=sap.ui.xmlfragment("sap.ushell.ui.fiori3.ShellLayout",o);U._setStrongBackground(true);var j=this.createShellHeader(h,this.getViewData().shellModel);b.initShellBarLogo(h,j);U.setHeader(j);j.setShellLayout(U);var k;E.once("ToolAreaItemCreated").do(function(l){k=this._createToolArea();U.setToolArea(k);k.updateAggregation=this.updateShellAggregation;}.bind(this));this.setOUnifiedShell(U);this.setDisplayBlock(true);this.addDanglingControl(sap.ui.getCore().byId('viewPortContainer'));this.logonIFrameReference=null;u.setPerformanceMark("FLP - Shell.view rendering started!");return U;},_allowUpToThreeActionInShellHeader:function(o){if(Object.keys(o).length!=0){var h=[o.moveAppFinderActionToShellHeader,o.moveUserSettingsActionToShellHeader,o.moveGiveFeedbackActionToShellHeader,o.moveContactSupportActionToShellHeader,o.moveEditHomePageActionToShellHeader];var i=0;for(var j=0;j<5;j++){if(i===3){h[j]=false;}else if(h[j]){i++;}}o.moveAppFinderActionToShellHeader=h[0];o.moveUserSettingsActionToShellHeader=h[1];o.moveGiveFeedbackActionToShellHeader=h[2];o.moveContactSupportActionToShellHeader=h[3];o.moveEditHomePageActionToShellHeader=h[4];}},createShellHeader:function(o,h){var i=g.createModel("/core/shellHeader",J),j=new S(),k;a.init(o,j,h);k=sap.ui.xmlfragment("sap.ushell.ui.fiori3.ShellHeader",j);k.setAccessKeyHandler(e);var l=k.getAppTitle();l.addEventDelegate({onsapskipforward:function(m){if(e.getAppKeysHandler()){m.preventDefault();e.bFocusOnShell=false;}}});k.setModel(i);k.setModel(r.i18nModel,"i18n");this.addEventDelegate({"onBeforeRendering":function(){k.createUIArea(this.getUIArea().getId());}},this);return k;},_createToolArea:function(){var o=new T({id:'shell-toolArea',toolAreaItems:{path:"/currentState/toolAreaItems",factory:s}});return o;},_createPostCoreExtControls:function(F,h){var o=sap.ui.getCore().byId("shell");if(!o){return;}var i=new F({id:'shell-floatingContainer',content:{path:"/currentState/floatingContainerContent",factory:s}});i.addCustomData(new d({key:"tabindex",value:"-1",writeToDom:true}));i.addEventDelegate({onsapskipforward:function(l){l.preventDefault();e.setIsFocusHandledByAnotherHandler(true);e.sendFocusBackToShell(l);},onsapskipback:function(l){if(e.getAppKeysHandler()){l.preventDefault();e.bFocusOnShell=false;}}});i.setModel(o.getModel());this.addDanglingControl(i);var j=new h({id:'shell-floatingActions',floatingActions:{path:"/currentState/floatingActions",factory:s}});j.updateAggregation=this.updateShellAggregation;var k=this.getOUnifiedShell();k.setFloatingContainer(i);k.setFloatingActionsContainer(j);this._createAllMyAppsView();},createPostCoreExtControls:function(){sap.ui.require(["sap/ushell/ui/shell/FloatingContainer","sap/ushell/ui/shell/ShellFloatingActions"],this._createPostCoreExtControls.bind(this));},_createAllMyAppsView:function(){var m=this.getModel();var o=function(h){if(h.isEnabled()){this.oAllMyAppsView=sap.ui.view("allMyAppsView",{type:sap.ui.core.mvc.ViewType.JS,viewName:"sap.ushell.renderers.fiori2.allMyApps.AllMyApps",viewData:{_fnGetShellModel:function(){return m;}},async:true,height:"100%",visible:{path:'/ShellAppTitleState',formatter:function(i){return i!==this.oShellAppTitleStateEnum.SHELL_NAV_MENU;}.bind(this)}}).addStyleClass("sapUshellAllMyAppsView");this.oAllMyAppsView.addCustomData(new d({key:"aria-label",value:r.i18n.getText("allMyApps_headerTitle"),writeToDom:true}));this.getOUnifiedShell().getHeader().getAppTitle().setAllMyApps(this.oAllMyAppsView);}}.bind(this);sap.ushell.Container.getServiceAsync("AllMyApps").then(o);},getOUnifiedShell:function(){return this.oUnifiedShell;},setOUnifiedShell:function(U){this.oUnifiedShell=U;},updateShellAggregation:function(n){var o=this.mBindingInfos[n],h=this.getMetadata().getJSONKeys()[n],j;jQuery.each(this[h._sGetter](),jQuery.proxy(function(i,v){this[h._sRemoveMutator](v);},this));jQuery.each(o.binding.getContexts(),jQuery.proxy(function(i,v){j=o.factory(this.getId()+"-"+i,v)?o.factory(this.getId()+"-"+i,v).setBindingContext(v,o.model):"";this[h._sMutator](j);},this));},getControllerName:function(){return"sap.ushell.renderers.fiori2.Shell";},createIFrameDialog:function(){var o=null,l=this.logonIFrameReference,h;var _=function(){if(l){l.remove();}return jQuery('<iframe id="SAMLDialogFrame" src="" frameborder="0" height="100%" width="100%"></iframe>');};var i=function(){o.addStyleClass('sapUshellSamlDialogHidden');jQuery('#sap-ui-blocklayer-popup').addClass('sapUshellSamlDialogHidden');};this.destroyIFrameDialog();var j=new B({text:r.i18n.getText("samlCloseBtn"),press:function(){sap.ushell.Container.cancelLogon();}});var k=new H("SAMLDialogFrame");this.logonIFrameReference=_();k.setContent(this.logonIFrameReference.prop('outerHTML'));o=new f({id:"SAMLDialog",title:r.i18n.getText("samlDialogTitle"),contentWidth:"50%",contentHeight:"50%",rightButton:j}).addStyleClass("sapUshellIframeDialog");h=g.last("/core/extension/SupportTicket");if(h){var m=new C();m.setWidth('150px');m.setIcon('');o.setLeftButton(m);}o.addContent(k);o.open();i();this.logonIFrameReference=jQuery('#SAMLDialogFrame');return this.logonIFrameReference[0];},destroyIFrameDialog:function(){var h=sap.ui.getCore().byId('SAMLDialog');if(h){h.destroy();}this.logonIFrameReference=null;},showIFrameDialog:function(){var o=sap.ui.getCore().byId('SAMLDialog');if(o){o.removeStyleClass('sapUshellSamlDialogHidden');jQuery('#sap-ui-blocklayer-popup').removeClass('sapUshellSamlDialogHidden');}},addDanglingControl:function(o){this.aDanglingControls.push(o);},destroyDanglingControls:function(){if(this.aDanglingControls){this.aDanglingControls.forEach(function(o){if(o.destroyContent){o.destroyContent();}o.destroy();});}}});},false);
