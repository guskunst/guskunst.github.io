// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/renderers/fiori2/search/SearchHelper"],function(S){"use strict";var T=function(){this.init.apply(this,arguments);};T.prototype={init:function(p){var t=this;sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(c){t.corssAppNavigator=c;});},prefetch:function(){},search:function(q){var t=this;var r={totalCount:0,tiles:[]};t.oModel=sap.ushell.renderers.fiori2.search.getModelSingleton();var a=t.oModel.getProperty('/appSearchDataSource');if(a===null){return r;}var s=t.oModel.sinaNext.createSearchQuery();s.skip=q.skip;s.top=q.top;s.filter.searchTerm=t._normalizeSearchTerm(q.searchTerm);s.filter.dataSource=a;return S.convertPromiseTojQueryDeferred(t.oModel.sinaNext.provider.executeSearchQuery(s)).then(function(b){r.totalCount=b.totalCount;return jQuery.when.apply(null,jQuery.map(b.items,this._formatTileAsync.bind(this)));}.bind(this)).then(function(){r.tiles=[].slice.call(arguments);return r;});},_getView:function(t){var v=new sap.m.GenericTile({header:t.title,subheader:t.subtitle,tileContent:new sap.m.TileContent({content:new sap.m.ImageContent({src:t.icon}),footer:sap.ushell.resources.i18n.getText("transactionText")})});if(t.isUshellSupported===false&&t.url.length===0){v.attachPress(function(){sap.m.MessageBox.information(sap.ushell.resources.i18n.getText("NavigationUnsupported"),{actions:[sap.m.MessageBox.Action.OK]});});}else{v.attachPress(function(){window.open(t.url,"_target");});}v.eventLoggingData={targetUrl:t.url,title:t.title};return v;},_formatTileAsync:function(i){var t=this;var a={};var c=t._getTcode(i).value;var b=t._getTcode(i).valueHighlighted;var d=t._getTitle(i).value;var e=t._getTitle(i).valueHighlighted+" - "+b;var u=t._getUshellUrl(i);var f=t._getBackendUrl(i);a={type:"transaction",icon:"sap-icon://action",title:d,label:e,subtitle:c,isUshellSupported:false,url:"",getView:function(){return t._getView(this);}};return t.corssAppNavigator.isIntentSupported([u]).then(function(g){a.isUshellSupported=g[u].supported;if(a.isUshellSupported){a.url=u;}else{a.url=f;}return a;},function(g){a.url=f;return jQuery.resolve(a);});},_normalizeSearchTerm:function(s){if(s==="*"){return s;}var f="";s=s.replace('*',' ');var a=s.split(' ');a.forEach(function(e){e=" *"+e+"* ";f=f+e;});return f;},_getTitle:function(a){var b=a.detailAttributes;var t={value:"",valueHighlighted:""};for(var i=0;i<b.length;i++){if(b[i].id==="TTEXT"){t.value=b[i].value||sap.ushell.resources.i18n.getText("transactionText");t.valueHighlighted=b[i].valueHighlighted||t.value;break;}}return t;},_getTcode:function(a){var b=a.titleAttributes;var t={value:"",valueHighlighted:""};for(var i=0;i<b.length;i++){if(b[i].id==="TCODE"){t.value=b[i].value;t.valueHighlighted=b[i].valueHighlighted||t.value;break;}}return t;},_getUshellUrl:function(i){var t=this;var s="";var a="";if(this.oModel.sinaNext.provider.serverInfo){s="sap-system="+t.oModel.sinaNext.provider.serverInfo.SystemId;}if(t._getTcode(i)!==""){a="&sap-ui2-tcode="+t._getTcode(i).value;}return"#Shell-startGUI?"+s+a;},_getBackendUrl:function(i){var t=this;var u="";if(this.oModel.sinaNext.provider.serverInfo){var h=t.oModel.sinaNext.provider.serverInfo.URL;var p=t.oModel.sinaNext.provider.serverInfo.Port;var c=t.oModel.sinaNext.provider.serverInfo.Client;var a=t._getTcode(i).value;if(h&&p&&c&&a.length!==""){u=h+":"+p+"/sap/bc/gui/sap/its/webgui/?sap-client="+c+"&~transaction="+a;}}return u;}};return T;});
