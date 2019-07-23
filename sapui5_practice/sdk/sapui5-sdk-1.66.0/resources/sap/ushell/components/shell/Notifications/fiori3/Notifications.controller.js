// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(['sap/ushell/utils','sap/ushell/resources','sap/ushell/renderers/fiori2/AccessKeysHandler','sap/m/Text','sap/m/VBox','sap/m/CustomListItem'],function(u,r,A,T,V,C){"use strict";sap.ui.controller("sap.ushell.components.shell.Notifications.fiori3.Notifications",{oPagingConfiguration:{MAX_NOTIFICATION_ITEMS_DESKTOP:400,MAX_NOTIFICATION_ITEMS_MOBILE:100,MIN_NOTIFICATION_ITEMS_PER_BUFFER:15,NOTIFICATION_ITEM_HEIGHT:(sap.ui.Device.system.phone||sap.ui.Device.system.tablet)?130:100,TAB_BAR_HEIGHT:100},onInit:function(){var i={};this.iMaxNotificationItemsForDevice=sap.ui.Device.system.desktop?this.oPagingConfiguration.MAX_NOTIFICATION_ITEMS_DESKTOP:this.oPagingConfiguration.MAX_NOTIFICATION_ITEMS_MOBILE;this.oNotificationsService=sap.ushell.Container.getService("Notifications");this.oSortingType=this.oNotificationsService.getOperationEnum();i[this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING]=this.getInitialSortingModelStructure();i[this.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING]=this.getInitialSortingModelStructure();i[this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING]=this.getInitialSortingModelStructure();i[this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING]={};this.sCurrentSorting=this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING;this.oPreviousByDateSorting=this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING;this.oPreviousTabKey="sapUshellNotificationIconTabByDate";this.sCurrentExpandedType=undefined;var m=new sap.ui.model.json.JSONModel(i);m.setSizeLimit(1500);this.getView().setModel(m);this.getView().setModel(r.i18nModel,"i18n");this.getNextBuffer();this._oTopNotificationData=undefined;},onAfterRendering:function(){this.removeTabIndexFromList(this.sCurrentSorting);var t=this.getView().byId('notificationIconTabBar--header');if(t){t.toggleStyleClass('sapContrastPlus',true);t.toggleStyleClass('sapUshellTabBarHeader',true);}if(this.sCurrentSorting!==this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING){if(this._oTopNotificationData){this.scrollToItem(this._oTopNotificationData);}}this.getView().$("-sapUshellNotificationIconTabByDate-text").attr("aria-label",r.i18n.getText("notificationsSortByDateDescendingTooltip"));this.getView().$("-sapUshellNotificationIconTabByType-text").attr("aria-label",r.i18n.getText("notificationsSortByTypeTooltip"));this.getView().$("-sapUshellNotificationIconTabByPrio-text").attr("aria-label",r.i18n.getText("notificationsSortByPriorityTooltip"));},shouldFetchMoreNotifications:function(){var h=this.getView().getModel().getProperty("/"+this.sCurrentSorting+"/hasMoreItemsInBackend"),l=this.getView().getModel().getProperty("/"+this.sCurrentSorting+"/listMaxReached");return h&&!l;},getNextBuffer:function(){var c=this.sCurrentSorting,a=this.getItemsFromModel(c),n,p,N;if(!this.shouldFetchMoreNotifications()){return;}N=this.getNumberOfItemsToFetchOnScroll(c);if(N===0){this.getView().getModel().setProperty("/"+c+"/hasMoreItems",false);return;}if(a!==undefined){n=a.length;}if(n===0){this.addBusyIndicatorToTabFilter(c);}this.getView().getModel().setProperty("/"+c+"/inUpdate",true);p=this.oNotificationsService.getNotificationsBufferBySortingType(c,n,N);p.done(function(R){var d=this.oNotificationsService._getNotificationSettingsAvalability();if(d.state()=="pending"){this.oNotificationsService._userSettingInitialization();}this.addBufferToModel(c,R);}.bind(this));p.fail(function(R){if(n===0){this.removeBusyIndicatorToTabFilter(c);this.handleError();}}.bind(this));},getNextBufferForType:function(){var s=this.sCurrentExpandedType,S=this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING,g=this.getGroupFromModel(s),c=g?g.aNotifications:undefined,n=0,p,h=g?g.hasMoreItems:true;if(!h){return;}if(c!==undefined){n=c.length;}this.getView().getModel().setProperty("/"+S+"/inUpdate",true);p=this.oNotificationsService.getNotificationsBufferInGroup(s,n,this.iMaxNotificationItemsForDevice);p.done(function(R){this.addTypeBufferToModel(s,R,false);}.bind(this));p.fail(function(R){this.getNextBufferFailHandler(S);}.bind(this));},addBufferToModel:function(s,R){var c=this.getItemsFromModel(s),i=c.length,m,h=R.length>=this.getNumberOfItemsToFetchOnScroll(s);this._oTopNotificationData=undefined;if(!R){this.getView().getModel().setProperty("/"+s+"/hasMoreItemsInBackend",false);return;}this.getView().getModel().setProperty("/"+s+"/hasMoreItemsInBackend",h);m=c.concat(R);this.getView().getModel().setProperty("/"+s+"/aNotifications",m);this.getView().getModel().setProperty("/"+s+"/inUpdate",false);if(m.length>=this.iMaxNotificationItemsForDevice){this.handleMaxReached(s);}this.handleListCSSClass(s,!m.length);if(i===0){this.removeBusyIndicatorToTabFilter(s);}},addTypeBufferToModel:function(t,R,o){var g=this.getGroupFromModel(t),G=this.getGroupIndexFromModel(t),a=this.getView().getModel().getProperty("/"+this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING),m;if(!R){return;}if(R.length<this.getBasicBufferSize()){g.hasMoreItems=false;}if(!g.aNotifications||o){g.aNotifications=[];}m=g.aNotifications.concat(R);a[G].aNotifications=m;a[G].Busy=false;this.getView().getModel().setProperty("/"+this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING,a);this.getView().getModel().setProperty("/"+this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING+"/inUpdate",false);},keydownHandler:function(k){var j,n,c;if(k.keyCode===jQuery.sap.KeyCodes.DELETE){j=jQuery(document.activeElement);if(j.hasClass('sapUshellNotificationsListItem')){n=j.next();c=j.find(".sapMNLB-CloseButton")[0];sap.ui.getCore().byId(c.id).firePress();if(n){n.focus();}}}},notificationsUpdateCallback:function(d){var t=this,c=this.sCurrentSorting,a,n,N;if(c===this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING){this.notificationsUpdateCallbackForType();d.resolve();return;}a=this.getItemsFromModel(c);if(a!==undefined){n=a.length;}this.cleanModel();N=this.getNumberOfItemsToFetchOnUpdate(n);this.oNotificationsService.getNotificationsBufferBySortingType(c,0,N).done(function(b){if(!b){return;}d.resolve();t.replaceItemsInModel(c,b,N);}).fail(function(b){jQuery.sap.log.error("Notifications control - call to notificationsService.getNotificationsBufferBySortingType failed: ",b,"sap.ushell.components.shell.Notifications.Notifications");});},isMoreCircleExist:function(s){var S=this.getNotificationList(s),i=S.getItems().length,l=S.getItems()[i-1];return!!i&&l.getMetadata().getName()==="sap.m.CustomListItem";},handleMaxReached:function(s){var S=this.getNotificationList(s),n=Math.floor(this.oNotificationsService.getNotificationsCount()),m=n-this.iMaxNotificationItemsForDevice,i=this.isMoreCircleExist(s);this.getView().getModel().setProperty("/"+this.sCurrentSorting+"/moreNotificationCount",m);this.getView().getModel().setProperty("/"+this.sCurrentSorting+"/listMaxReached",m>=0);if(m>0&&!i){S.addItem(this.getMoreCircle(this.sCurrentSorting));}else if(m<=0&&i){S.removeItem(this.oMoreListItem);}},reAddFailedGroup:function(g){var m=this.getView().getModel(),G=m.getProperty('/notificationsByTypeDescending');G.splice(g.removedGroupIndex,0,g.oGroup);m.setProperty('/notificationsByTypeDescending',G);},removeGroupFromModel:function(g){var m=this.getView().getModel(),G=m.getProperty('/notificationsByTypeDescending'),R={oGroup:g,removedGroupIndex:undefined};G.some(function(o,i){if(o.Id===g.Id){R.removedGroupIndex=i;G.splice(i,1);m.setProperty('/notificationsByTypeDescending',G);return true;}return false;});this.sCurrentExpandedType=undefined;return R;},updateGroupHeaders:function(){var p=this.oNotificationsService.getNotificationsGroupHeaders(),t=this,g=t.getView().getModel().getProperty("/"+t.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);p.fail(function(d){jQuery.sap.log.error("Notifications control - call to notificationsService.updateGroupHeaders failed: ",d,"sap.ushell.components.shell.Notifications.Notifications");});p.done(function(n){var j=JSON.parse(n),a=j.value;a.forEach(function(i,b){var f=false;g.forEach(function(c,I){if(c.Id===i.Id){g[I].GroupHeaderText=i.GroupHeaderText;g[I].CreatedAt=i.CreatedAt;f=true;}});if(!f){g.unshift(i);}});t.getView().getModel().setProperty("/"+t.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING,g);});},reloadGroupHeaders:function(){var p=this.oNotificationsService.getNotificationsGroupHeaders(),t=this;p.fail(function(d){jQuery.sap.log.error("Notifications control - call to notificationsService.getNotificationsGroupHeaders failed: ",d,"sap.ushell.components.shell.Notifications.Notifications");t.removeBusyIndicatorToTabFilter(t.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);});p.done(function(n){var j=JSON.parse(n),a=j.value,b=[];a.forEach(function(i,c){if(i.IsGroupHeader){i.Collapsed=true;b.push(i);}});t.getView().getModel().setProperty("/"+t.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING,b);t.removeBusyIndicatorToTabFilter(t.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);});},markRead:function(n){var p=this.oNotificationsService.markRead(n),t=this;p.fail(function(){sap.ushell.Container.getService('Message').error(r.i18n.getText('notificationsFailedMarkRead'));t.setMarkReadOnModel(n,false);});this.setMarkReadOnModel(n,true);},onExit:function(){},onBeforeRendering:function(){this.oNotificationsService.registerDependencyNotificationsUpdateCallback(this.notificationsUpdateCallback.bind(this),false);},executeAction:function(n,a){return this.oNotificationsService.executeAction(n,a);},executeBulkAction:function(a,s,g,p){var t=g,P=this.oNotificationsService.executeBulkAction(g.Id,a),m,G=s,n=this.getView().getModel().getProperty(p+"/NotificationTypeDesc"),b=this;if(n===""){n=this.getView().getModel().getProperty(p+"/NotificationTypeKey");}P.fail(function(R){this.getView().getModel().setProperty(p+"/Busy",false);if(R&&R.succededNotifications&&R.succededNotifications.length){R.succededNotifications.forEach(function(N,i){this.removeNotificationFromModel(N);}.bind(this));b.cleanModel();}if(R.succededNotifications.length===1){m=r.i18n.getText("notificationsPartialSuccessExecuteBulkAction",[G,R.succededNotifications.length,R.failedNotifications.length+R.succededNotifications.length,n,R.failedNotifications.length]);sap.m.MessageToast.show(m,{duration:4000});}else if(R.succededNotifications.length>1){m=r.i18n.getText("notificationsSingleSuccessExecuteBulkAction",[G,R.succededNotifications.length,R.failedNotifications.length+R.succededNotifications.length,n,R.failedNotifications.length]);sap.m.MessageToast.show(m,{duration:4000});}else{m=r.i18n.getText("notificationsFailedExecuteBulkAction");sap.ushell.Container.getService('Message').error(m);}}.bind(this));P.done(function(){m=r.i18n.getText("notificationsSuccessExecuteBulkAction",[G,n]);sap.m.MessageToast.show(m,{duration:4000});this.removeGroupFromModel(t);this.cleanModel();}.bind(this));},dismissNotification:function(n){var t=this,R=this.removeNotificationFromModel(n),p=this.oNotificationsService.dismissNotification(n);this.cleanModel();p.fail(function(){sap.ushell.Container.getService('Message').error(r.i18n.getText('notificationsFailedDismiss'));t.addNotificationToModel(R.obj,R.index);});},dismissBulkNotifications:function(g){var R=this.removeGroupFromModel(g),p=this.oNotificationsService.dismissBulkNotifications(g.Id);this.cleanModel();p.fail(function(){sap.ushell.Container.getService('Message').error(r.i18n.getText('notificationsFailedExecuteBulkAction'));this.reAddFailedGroup(R);}.bind(this));},onListItemPress:function(n,s,a,p){var v=sap.ui.getCore().byId('viewPortContainer');if(v){v.switchState("Center");}u.toExternalWithParameters(s,a,p);this.markRead(n);},scrollToItem:function(t){var j=this._getJqNotificationObjects(),a=j[0],b=j[1],c=j[2],d=j[3],i,n,e,f,g;if(a.length>0&&b.length>0&&c.length>0&&d.length>0){i=d.outerHeight(true)-window.parseInt(d.css("margin-top").replace("px",""));n=this.getIndexInModelByItemId(t.topItemId);n=n||0;e=n*i+window.parseInt(d.css("margin-top").replace("px",""));f=window.parseInt(b.css("padding-top").replace("px",""))+window.parseInt(c.css("padding-top").replace("px",""));g=a.offset().top;a.scrollTop(e+f+g-t.offSetTop);}this._oTopNotificationData=undefined;},_getJqNotificationObjects:function(){var j=jQuery("#notificationIconTabBar-containerContent"),a=j.children(),b=a.children(),c=j.find("li").eq(0);return[j,a,b,c];},getTopOffSet:function(){var t=0,j=this._getJqNotificationObjects()[0];if(j.children().length>0&&j.children().children().length>0){t+=j.children().outerHeight()-j.children().height();t+=j.children().children().outerHeight()-j.children().children().height();}return t;},getTopItemOnTheScreen:function(){var j=this._getJqNotificationObjects()[0],t=0,i,a=0,b=this;t=this.getTopOffSet();j.find("li").each(function(){a=jQuery(this).offset().top;if(a>=t){i=b.getItemNotificationId(this);return false;}});return{topItemId:i,offSetTop:a};},handleError:function(){try{sap.ushell.Container.getService("Message").error(r.i18n.getText("errorOccurredMsg"));}catch(e){jQuery.sap.log.error("Getting Message service failed.");}},addBusyIndicatorToTabFilter:function(s){var l=this.getNotificationList(s);l.setBusy(true);l.setShowNoData(false);},removeBusyIndicatorToTabFilter:function(s){var l=this.getNotificationList(s);l.setBusy(false);l.setShowNoData(true);},addNotificationToModel:function(n,i){var m=this.getView().getModel(),a=m.getProperty("/"+this.sCurrentSorting+"/aNotifications");a.splice(i,0,n);m.setProperty("/"+this.sCurrentSorting+"/aNotifications",a);},removeNotificationFromModel:function(n){var m=this.getView().getModel(),i,g,a,N,R={};if(this.sCurrentSorting===this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING||this.sCurrentSorting===this.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING||this.sCurrentSorting===this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING){N="/"+this.sCurrentSorting+"/aNotifications";a=m.getProperty(N);a.some(function(b,i,c){if(b.Id&&b.Id===n){R.obj=c.splice(i,1)[0];R.index=i;return true;}});m.setProperty(N,a);return R;}g=m.getProperty("/notificationsByTypeDescending");for(i=0;i<g.length;i++){a=g[i].aNotifications;if(a){if(a.length===1&&a[0].Id===n){g.splice(i,1);}else{a.some(function(b,i,c){if(b.Id&&b.Id===n){R.obj=c.splice(i,1)[0];R.index=i;return true;}});g[i].aNotifications=a;}}}this.updateGroupHeaders();m.setProperty("/notificationsByTypeDescending",g);return R;},getIndexInModelByItemId:function(n){var N,i;if(this.notificationsByTypeDescending===this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING){N=this.getView().getModel().getProperty("/"+this.sCurrentExpandedType+"/aNotifications");}else{N=this.getView().getModel().getProperty("/"+this.sCurrentSorting+"/aNotifications");}if(N===undefined||N.length===0){return 0;}for(i=0;i<N.length;i++){if(N[i].Id===n){return i;}}},cleanModel:function(){var t=this,s=this.getView().getModel().getProperty("/");Object.keys(s).forEach(function(S){if(S!==t.sCurrentSorting&&S!==t.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING){s[S]=t.getInitialSortingModelStructure();}});this.getView().getModel().setProperty("/",s);},replaceItemsInModel:function(s,R,n){var c=this.getItemsFromModel(s),i=c.length,h=R.length>=n;if(i){this._oTopNotificationData=this.getTopItemOnTheScreen();}this.getView().getModel().setProperty("/"+s+"/hasMoreItemsInBackend",h);this.getView().getModel().setProperty("/"+s+"/aNotifications",R);this.getView().getModel().setProperty("/"+s+"/inUpdate",false);this.handleMaxReached(s);},setMarkReadOnModel:function(n,I){var m=this.getView().getModel(),p="/"+this.sCurrentSorting,N,d,g,i;d=m.getProperty(p);if(this.sCurrentSorting==="notificationsByTypeDescending"){for(i=0;i<d.length;i++){if(d[i].Id===this.sCurrentExpandedType){p=p+"/"+i;g=true;break;}}if(!g){return;}}p=p+"/aNotifications";N=m.getProperty(p);N.some(function(a){if(a.Id===n){a.IsRead=I;return true;}});m.setProperty(p,N);},onTabSelected:function(e){var k=e.getParameter("key");if(k==="sapUshellNotificationIconTabByDate"){var b;if(this.oPreviousTabKey==="sapUshellNotificationIconTabByDate"){b=this.sCurrentSorting===this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING?this.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING:this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING;this._changeDateListBinding(b,e.getParameter("item"));this.oPreviousByDateSorting=b;}else{b=this.oPreviousByDateSorting;}this.sCurrentSorting=b;if(this.getItemsFromModel(b).length===0){this.getNextBuffer(b);}}else if(k==="sapUshellNotificationIconTabByType"&&this.oPreviousTabKey!=="sapUshellNotificationIconTabByType"){this.sCurrentSorting=this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING;this.addBusyIndicatorToTabFilter(this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);this.reloadGroupHeaders();this.getView().byId("notificationIconTabBar").addStyleClass('sapUshellNotificationIconTabByTypeWithBusyIndicator');}else{this.sCurrentSorting=this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING;if(this.getItemsFromModel(this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING).length===0){this.getNextBuffer(this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING);}}this.oPreviousTabKey=k;},_changeDateListBinding:function(s,t){if(s===this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING){t.$("text").attr("aria-label",r.i18n.getText("notificationsSortByDateDescendingTooltip"));this.getView().byId("sapUshellNotificationsListDate").bindItems("/notificationsByDateDescending/aNotifications",sap.ui.xmlfragment("sap.ushell.components.shell.Notifications.fiori3.NotificationsListItem",this));}else{t.$("text").attr("aria-label",r.i18n.getText("notificationsSortByDateAscendingTooltip"));this.getView().byId("sapUshellNotificationsListDate").bindItems("/notificationsByDateAscending/aNotifications",sap.ui.xmlfragment("sap.ushell.components.shell.Notifications.fiori3.NotificationsListItem",this));}},onNotificationItemPress:function(e){var m=e.getSource().getBindingContextPath(),M=this.getView().getModel().getProperty(m),s=M.NavigationTargetObject,a=M.NavigationTargetAction,p=M.NavigationTargetParams,n=M.Id;this.onListItemPress(n,s,a,p);},onNotificationItemClose:function(e){this._retainFocus();var n=e.getSource().getBindingContextPath(),N=this.getView().getModel().getProperty(n),s=N.Id;this.dismissNotification(s);},onNotificationItemButtonPress:function(e){this._retainFocus();var n=e.getSource().getBindingContext().getPath(),m=this.getView().getModel(),N=m.getProperty(n),p=n.split("/"),t=this.sCurrentSorting===this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING,P=t?"/"+p[1]+"/"+p[2]+"/"+p[3]+"/"+p[4]:"/"+p[1]+"/"+p[2]+"/"+p[3],o=m.getProperty(P),s=o.Id;m.setProperty(P+"/Busy",true);this.executeAction(s,N.ActionId).done(function(a){if(a&&a.isSucessfull){sap.ui.require(['sap/m/MessageToast'],function(M){if(a.message&&a.message.length){M.show(a.message,{duration:4000});}else{var b=N.ActionText;M.show(r.i18n.getText("ActionAppliedToNotification",b),{duration:4000});}});if(a.DeleteOnReturn!==false){this.removeNotificationFromModel(s);sap.ushell.Container.getService('Notifications')._addDismissNotifications(s);this.cleanModel();}}else if(a){sap.ushell.Container.getService('Message').error(a.message);}else{sap.ushell.Container.getService('Message').error(r.i18n.getText('notificationsFailedExecuteAction'));}m.setProperty(P+"/Busy",false);}.bind(this)).fail(function(){m.setProperty(P+"/Busy",false);sap.ushell.Container.getService('Message').error(r.i18n.getText('notificationsFailedExecuteAction'));}.bind(this));},onNotificationGroupItemClose:function(e){var n=e.getSource().getBindingContext().getPath(),p=n.split("/"),P="/"+p[1]+"/"+p[2],N=this.getView().getModel().getProperty(P);this.dismissBulkNotifications(N);},onNotificationGroupItemCollapse:function(e){var g=e.getSource(),p=g.getBindingContext().getPath();if(!g.getCollapsed()){this.getView().getModel().setProperty(p+"/Busy",true);this.expandedGroupIndex=p.substring(p.lastIndexOf("/")+1);this.onExpandGroup(g);}},onNotificationGroupItemButtonPress:function(e){var m=this.getView().getModel(),n=e.getSource().getBindingContext().getPath(),N=m.getProperty(n),p=n.split("/"),P="/"+p[1]+"/"+p[2],o=m.getProperty(P);this._retainFocus();m.setProperty(P+"/Busy",true);this.executeBulkAction(N.ActionId,e.getSource().getProperty("text"),o,P);},onListUpdateStarted:function(e){if(e.getParameter("reason")==="Growing"){if(!this.getView().getModel().getProperty("/"+this.sCurrentSorting+"/inUpdate")){this.getNextBuffer();}}},getNumberOfItemsInScreen:function(){var i,h=this.getWindowSize();i=(h-this.oPagingConfiguration.TAB_BAR_HEIGHT)/this.oPagingConfiguration.NOTIFICATION_ITEM_HEIGHT;return Math.ceil(i);},getBasicBufferSize:function(){return Math.max(this.getNumberOfItemsInScreen()*3,this.oPagingConfiguration.MIN_NOTIFICATION_ITEMS_PER_BUFFER);},getWindowSize:function(){return jQuery(window).height();},getNumberOfItemsToFetchOnScroll:function(s){var c=this.getItemsFromModel(s).length,b=this.getBasicBufferSize();if(c>=this.iMaxNotificationItemsForDevice){return 0;}if(c+b>this.iMaxNotificationItemsForDevice){return this.iMaxNotificationItemsForDevice-c;}return b;},getNumberOfItemsToFetchOnUpdate:function(n){var b=this.getBasicBufferSize(),N=Math.ceil(n/b),R;R=N>0?N*b:b;return R>this.iMaxNotificationItemsForDevice?this.iMaxNotificationItemsForDevice:R;},getItemsFromModel:function(s){if(s===undefined){s=this.sCurrentSorting;}return this.getView().getModel().getProperty("/"+s+"/aNotifications");},getItemsOfTypeFromModel:function(t){var g=this.getGroupFromModel(t);if(g){return g.aNotifications?g.aNotifications:[];}return[];},getGroupFromModel:function(t){var g=this.getView().getModel().getProperty("/"+this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING);return g.find(function(a){return a.Id===t;});},getGroupIndexFromModel:function(t){var g=this.getView().getModel().getProperty("/"+this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING),i;g.forEach(function(a,b){if(a.Id===t){i=b;return true;}});return i;},getItemNotificationId:function(e){var i,I;i=sap.ui.getCore().byId(e.getAttribute("Id")).getBindingContext().sPath;I=this.getView().getModel().getProperty(i+"/Id");return I;},getInitialSortingModelStructure:function(){return{hasMoreItemsInBackend:true,listMaxReached:false,aNotifications:[],inUpdate:false,moreNotificationCount:""};},onExpandGroup:function(g){var l=this.getView().byId("sapUshellNotificationsListType").getItems(),a=g.getId(),G=this.getView().getModel().getProperty(g.getBindingContextPath()),t=this;t.sCurrentExpandedType=G.Id;t.getView().getModel().setProperty(g.getBindingContextPath()+"/aNotifications",[]);t.getView().getModel().setProperty(g.getBindingContextPath()+"/hasMoreItems",true);l.forEach(function(i,b){if(i.getId()===a){t.getNextBufferForType();}else if(i.getId()!==a&&!i.getCollapsed()){i.setCollapsed(true);t.getView().getModel().setProperty(i.getBindingContextPath()+"/hasMoreItems",true);}});},notificationsUpdateCallbackForType:function(){var s=this.sCurrentExpandedType,S=this.oSortingType.NOTIFICATIONS_BY_TYPE_DESCENDING,g=this.getGroupFromModel(s),c=g?g.aNotifications:undefined,n=0,p;if(c!==undefined){n=c.length;}this.getView().getModel().setProperty("/"+S+"/inUpdate",true);this.updateGroupHeaders();if(s){p=this.oNotificationsService.getNotificationsBufferInGroup(s,0,this.getNumberOfItemsToFetchOnUpdate(n));p.done(function(R){this.addTypeBufferToModel(s,R,true);}.bind(this));p.fail(function(R){this.getNextBufferFailHandler(R);}.bind(this));}},getNotificationList:function(s){var l;if(s===this.oSortingType.NOTIFICATIONS_BY_DATE_DESCENDING||s===this.oSortingType.NOTIFICATIONS_BY_DATE_ASCENDING){l=this.getView().byId("sapUshellNotificationsListDate");}else if(s===this.oSortingType.NOTIFICATIONS_BY_PRIORITY_DESCENDING){l=this.getView().byId("sapUshellNotificationsListPriority");}else{l=this.getView().byId("sapUshellNotificationsListType");}return l;},removeTabIndexFromList:function(s){var l=this.getNotificationList(s);var L=l.$().children().get(1);if(L){L.removeAttribute("tabindex");}},handleListCSSClass:function(s,i){this.getNotificationList(s).toggleStyleClass("sapContrast",i);this.getNotificationList(s).toggleStyleClass("sapContrastPlus",i);},getMoreCircle:function(t){var m=new T({text:r.i18n.getText('moreNotifications')}),n=new T({text:""}).addStyleClass("sapUshellNotificationsMoreCircleCount"),M=new V({items:[n,m],alignItems:sap.m.FlexAlignItems.Center}).addStyleClass("sapUshellNotificationsMoreCircle"),b=new T({text:r.i18n.getText('moreNotificationsAvailable_message'),textAlign:"Center"}).addStyleClass("sapUshellNotificationsMoreHelpingText"),B=new T({text:r.i18n.getText('processNotifications_message'),textAlign:"Center"}).addStyleClass("sapUshellNotificationsMoreHelpingText"),v=new V({items:[M,b,B]}).addStyleClass("sapUshellNotificationsMoreVBox"),l=new C({type:sap.m.ListType.Inactive,content:v}).addStyleClass("sapUshellNotificationsMoreListItem sapContrastPlus");n.setModel(this.getView().getModel());n.bindText("/"+t+"/moreNotificationCount");this.oMoreListItem=l;return l;},_retainFocus:function(){var i=this.getView().byId("notificationIconTabBar"),k=i.getSelectedKey(),I=i.getItems(),s=0;I.forEach(function(o,a){if(o.getKey()===k){s=a;}});I[s].focus();},priorityFormatter:function(p){if(p){p=p.charAt(0)+p.substr(1).toLowerCase();return sap.ui.core.Priority[p];}},buttonTypeFormatter:function(n){switch(n){case"POSITIVE":return"Accept";case"NEGATIVE":return"Reject";default:return"Default";}}});},false);