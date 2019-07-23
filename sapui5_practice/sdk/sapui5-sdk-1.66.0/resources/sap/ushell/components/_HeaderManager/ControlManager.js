// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/EventHub","sap/ui/core/IconPool","sap/ushell/Config","sap/ushell/renderers/fiori2/AccessKeysHandler","sap/ushell/resources","sap/ushell/ui/launchpad/AccessibilityCustomData","sap/ushell/ui/footerbar/ContactSupportButton","sap/ushell/ui/footerbar/EndUserFeedback","sap/ushell/ui/shell/ShellHeadItem","sap/ushell/utils","sap/ui/core/CustomData","sap/ushell/ui/shell/ShellNavigationMenu"],function(E,I,C,A,r,a,b,c,S,u,d,e){"use strict";var f=[];var D=[];var g={SHELL_NAV_MENU_ONLY:0,ALL_MY_APPS_ONLY:1,SHELL_NAV_MENU:2,ALL_MY_APPS:3};function i(w,H,x){f.push(k(w));f.push(m(H));f.push(q(H,x));f.push(n(x));if(C.last("/core/shell/model/enableNotifications")){f.push(p(x));}if(w.moveEditHomePageActionToShellHeader){f.push(l());}if(w.moveAppFinderActionToShellHeader){f.push(s(w,H));}if(w.moveUserSettingsActionToShellHeader){f.push(j(H));}if(w.moveContactSupportActionToShellHeader){f.push(t());}if(w.moveGiveFeedbackActionToShellHeader){f.push(v());}D.push(E.once("CoreResourcesComplementLoaded").do(function(){_(w,x,H);}.bind(this)));}function h(){f.forEach(function(w){var x=sap.ui.getCore().byId(w);if(x){if(x.destroyContent){x.destroyContent();}x.destroy();}});D.forEach(function(w){w.off();});f=[];D=[];}function _(w,x,y){sap.ui.require(["sap/m/StandardListItem","sap/ushell/ui/shell/NavigationMiniTile"],function(z,N){var M="shellNavigationMenu";var H=function(J,K){var L=K.getProperty("icon")||"sap-icon://circle-task-2",T=K.getProperty("title"),O=K.getProperty("subtitle"),P=T,Q=K.getProperty("intent");if(O){P=P+"\n"+O;}var U=(new z({type:"Active",title:T,description:O,tooltip:P,icon:L,customData:[new d({key:"intent",value:Q})],press:[y.handleNavigationMenuItemPress,y]})).addStyleClass("sapUshellNavigationMenuListItems");return U;};var R=function(J,K){var L=K.getProperty("icon"),T=K.getProperty("title"),O=K.getProperty("subtitle"),P=K.getProperty("intent");return new N({title:T,subtitle:O,icon:L,intent:P,press:function(){var Q=this.getIntent();if(Q&&Q[0]==="#"){y.navigateFromShellApplicationNavigationMenu(Q);}}});};var B=new e(M,{title:"{/application/title}",icon:"{/application/icon}",showTitle:{path:"/application/showNavMenuTitle"},showRelatedApps:w.appState!=="lean",items:{path:"/application/hierarchy",factory:H.bind(this)},miniTiles:{path:"/application/relatedApps",factory:R.bind(this)},visible:{path:"/ShellAppTitleState",formatter:function(J){return J===g.SHELL_NAV_MENU;}}});var F=sap.ui.getCore().byId("shell-header");B.setModel(F.getModel());var G=sap.ui.getCore().byId("shellAppTitle");if(G){G.setNavigationMenu(B);}f.push(M);return M;}.bind(this));}function j(w){var x="userSettingsBtn";var U=sap.ui.getCore().byId(x);var y=function(){jQuery.sap.measure.start("FLP:ElementsModel._attachPressToUserSettings","_attachPressToUserSettings","FLP");var B=sap.ui.getCore().byId(x);if(B){B.attachPress(w.handleUserSettingsPress);}jQuery.sap.measure.end("FLP:ElementsModel._attachPressToUserSettings");};if(!U){var z=new S({id:x,icon:"sap-icon://action-settings",tooltip:"{i18n>userSettings}",text:"{i18n>userSettings}"});z.data("isShellHeader",true);D.push(E.on("CenterViewPointContentRendered").do(y));}return x;}function k(w){var x="homeBtn";var H=new S({id:x,tooltip:"{i18n>homeBtn_tooltip}",ariaLabel:"{i18n>homeBtn_tooltip}",icon:I.getIconURI("home"),target:w.rootIntent?"#"+w.rootIntent:"#"});H.addCustomData(new a({key:"aria-disabled",value:"false",writeToDom:true}));H.addEventDelegate({onsapskipback:function(y){if(A.getAppKeysHandler()){y.preventDefault();A.bFocusOnShell=false;}},onsapskipforward:function(y){if(A.getAppKeysHandler()){y.preventDefault();A.bFocusOnShell=false;}}});return x;}function l(){var w="ActionModeBtn";var T=new S({id:w,icon:"sap-icon://edit",visible:false});T.data("isShellHeader",true);if(C.last("/core/extension/enableHelp")){T.addStyleClass("help-id-openCatalogActionItem");}return w;}function m(w){var B=sap.ui.getCore().getConfiguration().getRTL()?"feeder-arrow":"nav-back";var x=new S({id:"backBtn",tooltip:"{i18n>backBtn_tooltip}",ariaLabel:"{i18n>backBtn_tooltip}",icon:I.getIconURI(B),press:w.pressNavBackButton.bind(w)});return x.getId();}function n(w){var x="meAreaHeaderButton";var M=new S({id:x,icon:"{/userImage/personPlaceHolder}",ariaLabel:"{i18n>MeAreaToggleButtonAria}",tooltip:sap.ushell.Container.getUser().getFullName(),press:function(){E.emit("showMeArea",Date.now());}});M.addEventDelegate({onsapskipforward:function(y){sap.ushell.renderers.fiori2.AccessKeysHandler.bForwardNavigation=true;y.preventDefault();window.document.getElementById("sapUshellHeaderAccessibilityHelper").focus();}});M.setModel(w);return x;}function o(B){B.applySettings({floatingNumber:{parts:["/notificationsCount"],formatter:function(w){var x=this.getDomRef(),y="";if(x){if(w>0){y=r.i18n.getText("NotificationToggleButtonCollapsed",w);}else{y=r.i18n.getText("NotificationToggleButtonCollapsedNoNotifications");}x.setAttribute("aria-label",y);}return w;}}},true,true);}function p(w){var x="NotificationsCountButton";var y="bell";var N=new S({id:x,icon:sap.ui.core.IconPool.getIconURI(y),text:"{i18n>notificationsBtn_title}",visible:true,enabled:false,press:function(){E.emit("showNotifications",Date.now());}});N.setModel(w);N.setModel(r.i18nModel,"i18n");o(N);return x;}function q(w,x){var y=new S({id:"endItemsOverflowBtn",tooltip:"{i18n>shellHeaderOverflowBtn_tooltip}",ariaLabel:"{i18n>shellHeaderOverflowBtn_tooltip}",icon:"sap-icon://overflow",press:[w.pressEndItemsOverflow,w],visible:true});o(y);y.setModel(x);return y.getId();}function s(w,x){var y="openCatalogBtn";var O=new S({id:y,text:"{i18n>open_appFinderBtn}",tooltip:"{i18n>open_appFinderBtn}",icon:"sap-icon://sys-find",visible:!w.disableAppFinder,press:x.handleAppFinderPress});O.data("isShellHeader",true);if(C.last("/core/extension/enableHelp")){O.addStyleClass("help-id-openCatalogActionItem");}return y;}function t(){var B="ContactSupportBtn",w=sap.ui.getCore().byId(B);if(!w){var T=new b("tempContactSupportBtn",{visible:true});var x=T.getIcon();var y=T.getText();var z=new S({id:B,icon:x,tooltip:y,text:y,press:function(){T.firePress();}});z.data("isShellHeader",true);}return B;}function v(){var B="EndUserFeedbackBtn",w=sap.ui.getCore().byId(B);if(!w){var T=new c("EndUserFeedbackHandlerBtn",{});var x=T.getIcon();var y=T.getText();var F=new S({id:B,icon:x,tooltip:y,addAriaHiddenFalse:true,ariaLabel:y,text:y,visible:false});F.data("isShellHeader",true);}return B;}return{init:i,destroy:h,_createOverflowButton:q};});
