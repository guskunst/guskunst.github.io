/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/Device','sap/ui/core/CustomData','sap/ui/core/HTML','sap/ui/core/library','sap/ui/core/ListItem','sap/ui/core/Title','sap/ui/core/mvc/View','sap/ui/core/search/OpenSearchProvider','sap/ui/core/util/LibraryInfo','sap/ui/model/Filter','sap/ui/model/FilterOperator','sap/ui/model/json/JSONModel','sap/ui/layout/form/Form','sap/ui/layout/form/FormContainer','sap/ui/layout/form/FormElement','sap/ui/layout/form/GridLayout','sap/ui/layout/form/GridElementData','sap/ui/layout/VerticalLayout','sap/ui/commons/Button','sap/ui/commons/Dialog','sap/ui/commons/DropdownBox','sap/ui/commons/FormattedTextView','sap/ui/commons/Image','sap/ui/commons/Label','sap/ui/commons/library','sap/ui/commons/Link','sap/ui/commons/TextView','sap/ui/commons/SearchField','sap/ui/commons/Splitter','sap/ui/commons/Tree','sap/ui/commons/TreeNode','sap/ui/commons/layout/AbsoluteLayout','sap/ui/ux3/DataSet','sap/ui/ux3/DataSetItem','sap/ui/ux3/DataSetSimpleView','sap/ui/ux3/NavigationItem','sap/ui/ux3/Shell','sap/ui/ux3/ToolPopup','./FeedbackClient','./library','./Tag','./TagCloud','jquery.sap.script'],function(q,D,C,H,c,L,T,V,O,d,F,f,J,g,h,k,G,m,n,B,r,s,t,I,u,v,w,y,S,z,A,E,K,M,N,P,Q,R,U,W,X,Y,Z){"use strict";var $=v.TextViewColor,_=v.TextViewDesign,a1=c.mvc.ViewType;var b1=function(a,b,e){var i=this;function j(p){return p.split('/').slice(0,-1).join('/')+'/';}var l=window.location.href;if(l.indexOf('#')>=0){l=l.slice(0,l.indexOf('#'));}this.sBaseUrl=j(l);this.sBasePathname=j(window.location.pathname);this._iPendingCalls=0;this._mBestMatchingPage={};this._aTopLevelNavItems=[];this._aThemes=e||["sap_fiori_3","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_bluecrystal","sap_hcb"];this._sTheme=this._aThemes[0];this._sCurrentContent=null;this._mAliases={};this._bIgnoreIFrameOnLoad=false;this._sTitleStr=a;this._sVersionStr=b;this._sSelectedWorkSetItem=null;b1.getInstance=q.sap.getter(this);q(window).bind('hashchange',function(){var o=window.location.hash;q.sap.log.debug("hashchange occured, current='"+i._sCurrentContent+"', new='"+o+"'");if(o&&o!="#"+i._sCurrentContent){q.sap.log.info("navigate to "+o);i.navigateTo(o,true);}});};b1.getInstance=function(){var o=q.sap.getObject("top.sap.ui.demokit.DemokitApp");if(o&&o!=b1){return o.getInstance();}};b1.prototype.calcRelativeUrl=function(a){return a.indexOf(this.sBaseUrl)==0?a.substring(this.sBaseUrl.length):null;};b1.prototype.registerPageForType=function(a,b){this._mBestMatchingPage[b[0]]=a;};b1.prototype.findPageForType=function(a){return this._mBestMatchingPage[a]||"docs/api/symbols/"+a+".html";};b1.prototype._addPendingCall=function(){this._iPendingCalls++;};b1.prototype._removePendingCall=function(){this._iPendingCalls--;};b1.prototype.addIndex=function(i,o){o=o||{};var a=this;var b={id:"mi-"+i,text:o.caption||i,newWindow:o.newWindow,visible:(typeof o.visible==="boolean")?o.visible:true,themable:o.themable||false};this._aTopLevelNavItems.push(b);this._createWorksetItem(b);if(o.index){if(o.extend){o.extend(o.index,function(e){a._setIndexData(i,e);});}else{a._setIndexData(i,o.index);}}else if(o.url){this._loadIndexFromUrl(i,o.url,o.transformer,o.extend);}};b1.prototype._loadIndexFromUrl=function(i,a,b,j){var l=this;q.ajax({url:a,dataType:a.slice(-4)==".xml"?"xml":"json",error:function(x,o,e){l._removePendingCall();q.sap.log.error("failed to load index '"+i+"' from '"+a+"': "+o+", "+e);var p=l._findIndexById(i);if(p){p.navItem.setVisible(false);}},success:function(o,e,x){var p=b?b.call(this,o):o;if(j){j(p,function(o){l._removePendingCall();l._setIndexData(i,o);});}else{l._removePendingCall();l._setIndexData(i,p);}}});this._addPendingCall();};b1.prototype._setIndexData=function(a,o){var b=this,e,j;function p(l){var i;j++;if(l.ref&&l.controls){var x=q.isArray(l.controls)?l.controls:l.controls.split(/,/);b.registerPageForType(l.ref,x);}if(l.alias&&l.ref){var c1=l.alias.split(",");for(i=0;i<c1.length;i++){b._mAliases[c1[i]]=l.ref;}}if(l.links){for(i=0;i<l.links.length;i++){p(l.links[i]);}}}e=this._findIndexById(a);if(e){e.ref=o.ref;e.links=o;j=0;p(o);e._iTreeSize=j;this._createNavigationTree(e);e.navItem.setEnabled(!!e._oTree);e.navItem.setHref(o.ref);}};b1.prototype._findIndexById=function(a){for(var i=0;i<this._aTopLevelNavItems.length;i++){var o=this._aTopLevelNavItems[i];if(o.id==="mi-"+a){return o;}}};b1.prototype.getInitialPage=function(a,b){var i=a,e=window.location.hash,j=q.sap.getUriParameters().get("optimized-module-set");function l(o){return/^([a-zA-Z0-9-_]+\/)*[a-zA-Z0-9-_.]+\.(?:html|txt)(#.*)?$/.test(o);}if(e){e=e.indexOf("#")===0?e.substring(1):e;if(l(e)){i=e;}}if(b&&j){i="customize.html?data="+j;}return i;};b1.prototype.getPagesForCategory=function(a){var b=this._findIndexById("controls");if(!b||!b.links){return b1.RETRY_LATER;}var p=a.split('/');var o=b.links;for(var i=0;i<p.length;i++){var e=p[i],j;for(j=0;j<o.links.length;j++){if(e==o.links[j].text){break;}}if(j==o.links.length){return[];}o=o.links[j];}return o.links||[];};b1.RETRY_LATER=-2;b1.prototype.findIndexForPage=function(a){function b(o,a){if(a&&o.ref&&a.indexOf(o.ref)===0){return true;}if(o.links){for(var j=0;j<o.links.length;j++){if(b(o.links[j],a)){return true;}}}return false;}for(var i=0;i<this._aTopLevelNavItems.length;i++){if(this._aTopLevelNavItems[i].links&&b(this._aTopLevelNavItems[i].links,a)){return i;}}if(this._aTopLevelNavItems.length===0||this._iPendingCalls>0){return b1.RETRY_LATER;}else{q.sap.log.error("could not find "+a+" in nav tree");return-1;}};b1.DEFAULT_TLN_ITEM=0;b1.prototype._createNavigationTree=function(o){var a=this;var b=0;function e(p){var h1=p.getSource().getCustomData();for(var i in h1){if(h1[i].getKey()=="_ref_"){a.navigateTo(h1[i].getValue());}}}function j(p,h1,i1,j1){for(var i=0;i<h1.length;i++){var k1={text:h1[i].text,tooltip:h1[i].tooltip,expanded:i1<1,selectable:!!h1[i].ref,selected:e};k1._ref_=h1[i].ref;k1.parentName=(i1<1)?h1[i].text:j1+"."+h1[i].text;p.push(k1);b++;if(h1[i].links&&h1[i].links.length>0){k1.nodes=[];j(k1.nodes,h1[i].links,i1+1,k1.parentName);}}}function l(h1,x){if(h1==="mi-devguidekm"){x.collapseAll();var i1=x.getNodes();for(var i=0;i<i1.length;i++){var j1=i1[i].getCustomData();for(var p=0;p<j1.length;p++){if(j1[p].getKey()==="_ref_"&&j1[p].getValue()&&j1[p].getValue().indexOf("95d113be50ae40d5b0b562b84d715227")!==-1){i1[i].expand();}}}}}if(o._oTree){return;}var x=new A(o.id+"-index",{showHeader:false,width:"100%",height:"100%",showHorizontalScrollbar:true,selectionMode:"Single"});x.addStyleClass("sapUiTreeWithHeader");var c1=new E({text:"{text}",tooltip:"{tooltip}",expanded:"{expanded}",selectable:"{selectable}",selected:e});var d1=new C({key:"_ref_",value:"{_ref_}"});c1.addCustomData(d1);var e1=new C({key:"parentName",value:"{parentName}"});c1.addCustomData(e1);var f1=[];j(f1,o.links.links,0,"");var g1=new J();g1.setSizeLimit(b);x.setModel(g1);g1.setData(f1);x.bindNodes("/",c1);l(o.id,x);if(f1.length>25){x.collapseAll();}o._oTree=x;o._iTreeSize=b;o._oEmptyTreeLabel=new u({text:"No matching entry found.",visible:false,width:"100%",textAlign:"Center"});};b1.prototype._createWorksetItem=function(o){var a=o.navItem=new Q({key:o.id,text:o.text,href:"#"+o.ref,visible:o.visible,enabled:false});a._itemData_=o;if(this._oShell){this._oShell.addWorksetItem(a);}};b1.prototype.createUI=function(e,o){var p;var x=this;var c1="theme/img/themeswitch_";var d1=b1.THEMES;this._oThemeSwitch=new s({change:[this._handleThemeChanged,this],items:q.map(this._aThemes,function(a){return new L({text:d1[a],key:a});}),value:d1[this._sTheme]});this._oThemeSwitchPopup=new U({title:"Select a theme",icon:c1+"regular.png",iconHover:c1+"hover.png",iconSelected:c1+"selected.png",content:[this._oThemeSwitch],initialFocus:this._oThemeSwitch});var e1=new H("content",{content:"<iframe id=\"content\" name=\"content\" src=\"about:blank\" frameborder=\"0\" onload=\"sap.ui.demokit.DemokitApp.getInstance().onContentLoaded();\"></iframe>"});var f1=this._oSidePanelLayout=new K();D.os.name==D.os.OS.IOS?p=true:p=false;var g1;if(!this._sVersionStr||(this._sVersionStr.indexOf("SNAPSHOT")>-1)||(this._sVersionStr.split(".").length>1&&parseInt(this._sVersionStr.split(".")[1])%2===1)){g1=new y({text:"Development version! Work in Progress!",semanticColor:$.Negative,design:_.Bold});}var h1=new y({text:this._sVersionStr,tooltip:"Used SAPUI5 Version is "+this._sVersionStr});var i1=new y({text:this._sVersionStr,tooltip:"SAPUI5 Version"});var j1=function(){var a;var b=sap.ui.getCore().byId('aboutDlg');var l;if(b instanceof r){a=b;a.open();return;}var i=new B({text:"Back",visible:false,press:function(){q1();}});var j=new B({text:"Close",press:function(){a.close();}});var q1=function(){a.removeAllContent();a.addContent(l);i.setVisible(false);};var r1=new I();var s1;var t1=sap.ui.getVersionInfo();if(t1&&t1.gav&&/openui5/i.test(t1.gav)){r1.setSrc("resources/sap/ui/demokit/themes/base/images/OpenUI5_new_small_size.png");r1.setTooltip("OpenUI5 logo blue");r1.setWidth("446px");r1.addStyleClass("extraLeftPadding");s1='<h2>OpenUI5 - Demo Kit</h2>';s1+='<span>&copy; 2009-2019 SAP SE or an SAP affiliate company.</span><br>';s1+='<span>Licensed under the Apache License, Version 2.0 – <embed data-index="3"><br><br><br></span>';s1+='<span>OpenUI5 Version <embed data-index="0"></span><br>';}else{r1.setSrc("resources/sap/ui/demokit/themes/base/images/logo-SAPUI5-blue-446x140.png");r1.setTooltip("SAPUI5 logo blue");r1.addStyleClass("extraLeftPadding");s1='<h2>SAP UI Development Toolkit for HTML5 (SAPUI5) - Demo Kit</h2>';s1+='<span>&copy; Copyright 2009-2019 SAP SE. All rights reserved.</span><br><br><br>';s1+='<span>SAPUI5 Version <embed data-index="0"></span><br>';}s1+='<span>This software includes the following library versions</span><br>';s1+='<span>(a full change log for all libraries can be found <embed data-index="1">).</span><br>';s1+='<embed data-index="2"><br><br><br>';var u1='<span>This software includes third-party open source software.</span><br>';u1+='<embed data-index="0"><br>';var v1=new w({text:"here",tooltip:"Go to Version Change Log",press:function(){a.close();},href:"releasenotes.html",target:"content"});var w1=new w({text:"Version Details",tooltip:"Go to Version Details",press:function(){a.removeAllContent();a.addContent(k1());i.setVisible(true);}});var x1=new w({text:"Included Third-Party Software",tooltip:"Go to Included Third-Party Software list",press:function(){a.removeAllContent();a.addContent(l1());i.setVisible(true);}});var y1=new w({text:"see LICENSE.txt",tooltip:"Go to LICENSE.txt",press:function(){a.close();},href:"LICENSE.txt",target:"content"});var z1=new t();z1.setContent(s1,[i1,v1,w1,y1]);z1.addStyleClass("extraLeftPadding");var A1=new t();A1.setContent(u1,[x1]);A1.addStyleClass("extraLeftPadding");if(t1&&t1.gav&&/openui5/i.test(t1.gav)){l=new n({content:[r1,z1]});}else{l=new n({content:[r1,z1,A1]});}a=new r('aboutDlg',{title:"About",modal:true,buttons:[i,j],content:[l],showCloseButton:false,width:"550px",height:"800px",maxHeight:"100%"});a.attachClosed(q1);a.open();};var k1=function(){q.sap.registerModulePath("versioninfo","./versioninfo/");var a=new J();X._loadAllLibInfo("","_getLibraryInfo","",function(r1,s1){var t1={};var u1=new d();for(var i=0,l=r1.length;i<l;i++){r1[i]=s1[r1[i]];r1[i].libDefaultComponent=u1._getDefaultComponent(r1[i]);}t1.libs=r1;a.setData(t1);});var b=function openReleaseDialog(){var i;var l;var r1=sap.ui.getCore().byId("notesView");var s1=sap.ui.getCore().byId("notesDialog");if(!s1){l=new y({text:"No changes for this library!",id:"noRelNote"});r1=sap.ui.view({id:"notesView",viewName:"versioninfo.notes",type:a1.Template});i=new J();r1.setModel(i);s1=new r("notesDialog");s1.addButton(new B({text:"OK",press:function(){s1.close();}}));s1.setModal(true);s1.setHeight("40%");s1.setWidth("40%");r1.addStyleClass("myReleaseNotes");s1.setResizable(true);}var t1=new d();s1.setTitle("Change log for: "+this.getBindingContext().getProperty("library"));var u1=q.sap.Version(this.getBindingContext().getProperty("version"));var v1=u1.getMajor()+"."+u1.getMinor()+"."+u1.getPatch()+u1.getSuffix();t1._getReleaseNotes(this.getBindingContext().getProperty("library"),v1,function(w1,v1){s1.removeAllContent();if(w1&&w1[v1]&&w1[v1].notes&&w1[v1].notes.length>0){s1.addContent(r1);r1.getModel().setData(w1);r1.bindObject("/"+v1);s1.open();}else{if(l){s1.addContent(l);}else{s1.addContent(sap.ui.getCore().byId("noRelNote"));}s1.open();}});};var j=new M({items:{path:"/libs",template:new N({title:"{library}"})},views:[new P({floating:false,template:new g({title:new T({text:"{library}"}),width:"100%",layout:new G(),formContainers:[new h({formElements:[new k({label:new u({text:"Version:",layoutData:new m({hCells:"3"})}),fields:[new y({text:"{version}"})]}),new k({label:new u({text:"Description:",layoutData:new m({hCells:"3"})}),fields:[new y({text:"{documentation}"})]}),new k({label:new u({text:"Change Log:",layoutData:new m({hCells:"3"})}),fields:[new w({text:"Open Change Log",press:b})],visible:{path:"releasenotes",formatter:function(i){return!!i;}}}),new k({label:new u({text:"Component:",layoutData:new m({hCells:"3"})}),fields:[new y({text:"{libDefaultComponent}"})],visible:{path:"libDefaultComponent",formatter:function(i){return!!i;}}})]})]})})],showToolbar:false,selectionChanged:function(){j.setLeadSelection(-1);}});j.setModel(a);var q1=new n({content:[j]});return q1;};var l1=function(){var l=new J();X._loadAllLibInfo("","_getThirdPartyInfo",function(t1,u1){if(!t1){return;}var v1={};v1.thirdparty=[];for(var j=0;j<t1.length;j++){var w1=u1[t1[j]];for(var i=0;i<w1.libs.length;i++){var x1=w1.libs[i];x1._lib=t1[j];v1.thirdparty.push(x1);}}v1.thirdparty.sort(function(a,b){var y1=(a.displayName||"").toUpperCase();var z1=(b.displayName||"").toUpperCase();if(y1>z1){return 1;}else if(y1<z1){return-1;}else{return 0;}});l.setData(v1);});var q1=new M({items:{path:"/thirdparty",template:new N({title:"{displayName}"})},views:[new P({floating:false,template:new g({title:new T({text:"{displayName}"}),width:"100%",layout:new G(),formContainers:[new h({formElements:[new k({fields:[new w({text:"Web Site",target:"_blank",href:"{homepage}",layoutData:new m({hCells:"auto"})}),new w({text:"License Conditions",target:"_blank",href:"{license/url}",layoutData:new m({hCells:"5"})})]}),new k({fields:[new w({text:"Licensed by SAP under '{license/type}'",target:"_blank",href:"{license/file}"})]})]})]})})],showToolbar:false,selectionChanged:function(){l.setLeadSelection(-1);}});var r1=q.sap.getUriParameters().get("sap-ui-debug");if(r1==="x"||r1==="X"||r1==="true"){l.getViews()[0].getTemplate().getFormContainers()[0].addFormElement(new k({label:new u({text:"Requested by UI Library:",layoutData:new m({hCells:"3"})}),fields:[new y({text:"{_lib}"})]}));}q1.setModel(l);var s1=new n({content:[q1]});return s1;};var m1=new w({text:"About",tooltip:"About",press:function(){j1();}});this._oFeedbackClient=new W();this._oFeedbackPopup=this._oFeedbackClient.createFeedbackPopup();var n1=this._oShell=new R({appTitle:this._sTitleStr,showLogoutButton:false,showFeederTool:false,applyContentPadding:false,showSearchTool:e,fullHeightContent:true,toolPopups:[this._oFeedbackPopup,this._oThemeSwitchPopup],search:function(a){x.navigateTo("search.html?q="+encodeURIComponent(a.getParameter("text")));x._oShell._getSearchTool().close();},worksetItemSelected:function(a){var b=a.getParameter("item");if(b.getEnabled()){var i=b._itemData_;if(i.newWindow){a.preventDefault();}x.navigateTo(i.ref,null,null,i.newWindow);}else{a.preventDefault();}},content:[new z("demokitSplitter",{width:"100%",height:"100%",splitterPosition:"0%",splitterBarVisible:false,firstPaneContent:[f1],secondPaneContent:[e1],showScrollBars:p})],headerItems:g1?[m1,g1,h1]:[m1,h1]});this._oShell.addStyleClass("sapDkShell");function o1(a){var b=new Z({minFontSize:15,maxFontSize:30,press:function(j){var l=sap.ui.getCore().byId(j.getParameter("tagId")).getText();n1.fireSearch({text:l});}}).addStyleClass("grTagCloud");for(var i=0;i<a.length;i++){b.addTag(new Y({text:a[i].tag,weight:a[i].score}));}n1._getSearchTool&&n1._getSearchTool().addContent(b);}if(e){var p1=n1.getSearchField();p1.setEnableListSuggest(true);p1.setShowListExpander(false);p1.setVisibleItemCount(5);p1.setSearchProvider(new O({suggestType:"json",suggestUrl:"suggest?q={searchTerms}"}));q.ajax({url:"keywords?kind=tags&max=50",dataType:"json",success:function(a,b,i){if(a&&a[0]&&a[0].success&&a[0].keywords&&a[0].keywords.length){o1(a[0].keywords);p1.setWidth("80%");}}});}q.each(this._aTopLevelNavItems,function(i,a){n1.addWorksetItem(a.navItem);});this.navigateTo(o);sap.ui.getCore().addPrerenderingTask(function(){q("body").append("<div id=\"logo\"><img id=\"logoico\"><img id=\"logotxt\"></div>");var a=sap.ui.getVersionInfo();if(a&&a.gav&&/openui5/i.test(a.gav)){q("#logoico").attr("src","resources/sap/ui/demokit/themes/base/images/OpenUI5_new_small_size.png").addClass("sapUiImg");}else{q("#logoico").attr("src","resources/sap/ui/core/mimes/logo/icotxt_white_220x72_blue.png").addClass("sapUiImg");}});};b1.prototype.placeAt=function(i){this._oShell.placeAt(i);};b1.prototype.onContentLoaded=function(e){var a=this;var o=q("#content")[0].contentWindow;var i=this.calcRelativeUrl(o.location.href);if(i&&!this._bIgnoreIFrameOnLoad){this.navigateTo(i,true,true);window.location.replace("#"+i);}this._applyTheme();this._bIgnoreIFrameOnLoad=false;q(o).bind("hashchange",function(){var i=a.calcRelativeUrl(o.location.href);if(i&&!a._bIgnoreIFrameOnLoad){a.navigateTo(i,true,true);window.location.hash=i;}a._bIgnoreIFrameOnLoad=false;});};b1.prototype.navigateTo=function(a,b,e,l){var o=this;var p="0px";var x="32px";var c1="30px";var d1="0px";var e1="0px";var f1=a.indexOf("#")===0?a.substring(1):a;var g1=this._mAliases[f1];if(g1&&f1!=g1){e=false;f1=g1;}if(this._sCurrentContent==f1){return;}var h1=q("#content")[0];var i1=h1&&h1.contentWindow;var j1=this.findIndexForPage(f1);if(l){window.open(f1,"_blank");return;}if(!i1||j1===b1.RETRY_LATER){setTimeout(function(){o.navigateTo(f1,b,e);},200);return;}var k1=this._aTopLevelNavItems[j1>=0?j1:0];var l1=this._oShell;var m1=sap.ui.getCore().byId("demokitSplitter");var n1;if(k1&&k1._iTreeSize<=1){if(m1.getSplitterBarVisible()){n1=m1.getSplitterPosition();if(n1!=="0%"){m1._oldPos=n1;m1.setSplitterPosition("0%");}m1.setSplitterBarVisible(false);}}else if(!m1.getSplitterBarVisible()){n1=m1._oldPos||"20%";m1.setSplitterPosition(n1);m1.setSplitterBarVisible(true);}this._sCurrentContent=f1;function o1(f1,y1,z1){if(y1){if(z1&&y1.getSelectedNode&&y1.getSelectedNode()){y1.getSelectedNode().setIsSelected(false);}var A1=y1.getNodes();for(var i=0;i<A1.length;i++){var B1=A1[i].getCustomData();var C1=false;for(var j in B1){if(B1[j].getKey()=="_ref_"&&B1[j].getValue()&&B1[j].getValue().indexOf(f1)>=0){C1=true;break;}}if(C1){var D1=y1;while(D1 instanceof E){D1.expand();D1=D1.getParent();}A1[i].setIsSelected(true);return A1[i];}else{var E1=o1(f1,A1[i],false);if(E1){return E1;}}}}return null;}function p1(w1,j){var y1=function(w1,A1,j){var B1=[];var C1=new F("parentName",f.Contains,A1);B1.push(C1);var D1=w1.getBinding("nodes");D1.filter(B1);if(A1!==""){w1.expandAll();}var E1=(w1.getNodes().length===0);w1.setVisible(!E1);j.setVisible(E1);};var z1=new S({enableListSuggest:false,enableClear:true,enableFilterMode:true,startSuggestion:0,suggest:function(A1){y1(w1,A1.getParameter("value"),j);}});z1.addEventDelegate({onAfterRendering:function(){z1._ctrl.$("searchico").addClass('sapUiIcon sapUiSearchFieldFilterIcon');z1._ctrl.$("searchico").attr('style','font-family: SAP-icons; cursor: default;');z1._ctrl.$("searchico").attr('data-sap-ui-icon-content','');}});z1._ctrl.setPlaceholder("Filter");z1.addStyleClass("sapUiDemokitAbsLayoutFirtsRow sapUiDemokitSearchField");return z1;}function q1(w1,j,y1,z1,A1){var B1=new B({lite:true,icon:y1,press:j.bind(w1)});B1.addStyleClass("sapUiDemokitExpandCollapseButtons sapUiDemokitAbsLayoutFirtsRow");if(A1){B1.addStyleClass(A1);}B1.setTooltip(z1);B1.addEventDelegate({onAfterRendering:function(){B1.$("icon").attr("title",z1);B1.$("icon").attr("aria-label",z1);}});return B1;}function r1(w1){return q1(w1,w1.collapseAll,"sap-icon://collapse-group","Collapse All","sapUiDemokitCollapseButton");}function s1(w1){return q1(w1,w1.expandAll,"sap-icon://expand-group","Expand All");}var t1=null;var u1=k1&&k1.navItem;if(u1&&this._sSelectedWorkSetItem!=u1.getId()){u1.setVisible(true);l1.setSelectedWorksetItem(u1);this._oSidePanelLayout.removeAllContent();if(k1._oTree){this._oSidePanelLayout.addContent(p1(k1._oTree,k1._oEmptyTreeLabel));this._oSidePanelLayout.addContent(r1(k1._oTree),{right:d1,top:e1});this._oSidePanelLayout.addContent(s1(k1._oTree),{right:c1,top:e1});this._oSidePanelLayout.addContent(k1._oTree,{left:p,top:x});this._oSidePanelLayout.addContent(k1._oEmptyTreeLabel,{left:p,top:x});}t1=o1(f1,k1._oTree,true);if(k1.themable&&l1.indexOfToolPopup(this._oThemeSwitchPopup)==-1){l1.addToolPopup(this._oThemeSwitchPopup);}else if((!k1.themable)&&l1.indexOfToolPopup(this._oThemeSwitchPopup)!=-1){l1.removeToolPopup(this._oThemeSwitchPopup);}}else{var v1=this._oSidePanelLayout.getContent();var w1;for(var i in v1){if(v1[i].getId().indexOf("index")>-1){w1=v1[i];}}t1=o1(f1,w1,true);if(!t1&&f1.indexOf("#")>0){var x1=f1.substr(0,f1.indexOf("#")-1);t1=o1(x1,w1);}}sap.ui.getCore().applyChanges();this._sSelectedWorkSetItem=l1.getSelectedWorksetItem();if(!b){window.location.hash=f1;}if(!e){this._bIgnoreIFrameOnLoad=true;i1.location.replace((f1.indexOf("/")==0?"":this.sBasePathname)+f1);}this._oFeedbackClient.updateFeedbackContextText();};b1.THEMES={"sap_fiori_3":"Fiori 3","sap_belize":"Belize","sap_belize_plus":"Belize Plus","sap_belize_hcb":"Belize High Contrast Black","sap_belize_hcw":"Belize High Contrast White","sap_bluecrystal":"Blue Crystal","sap_hcb":"High Contrast Black"};b1.prototype._handleThemeChanged=function(e){var a=e.getParameter("newValue");for(var x in b1.THEMES){if(b1.THEMES[x]==a){this._sTheme=x;this._applyTheme();e.getSource().getParent().close();break;}}};b1.prototype._applyTheme=function(){var o=q("#content")[0].contentWindow;var a=this.calcRelativeUrl(o.location.href);var b=a?this.findIndexForPage(a):-1;if(a&&b>=0&&this._aTopLevelNavItems[b].themable&&o&&o.sap&&o.sap.ui&&o.sap.ui.getCore){var e=a.match(/\/sap\/me?\//);var j=e?["sap_fiori_3","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_bluecrystal"]:this._aThemes;var l=o.sap.ui.demokit&&o.sap.ui.demokit._supportedThemes?o.sap.ui.demokit._supportedThemes:j;var p=this._oThemeSwitch.getItems();for(var i=0;i<p.length;i++){p[i].setEnabled(q.inArray(p[i].getKey(),l)>=0);}if(q.inArray(this._sTheme,l)<0){this._sTheme=l[0];this._oThemeSwitch.setValue(b1.THEMES[this._sTheme]);}o.sap.ui.getCore().applyTheme(this._sTheme);}};(function(){function a(o,e){if(o.ref&&o.resolve==="lib"){o.ref=e+o.ref;}if(o.links){for(var i=0;i<o.links.length;i++){a(o.links[i],e);}}}function b(o,e){if(o.key!=e.key||!e.links||e.links.length==0){return;}if(!o.links){o.links=e.links;return;}function p(c1,d1){for(var j=0;j<c1.links.length;j++){if(c1.links[j].key===d1){return c1.links[j];}}return null;}var x;for(var i=0;i<e.links.length;i++){x=e.links[i];if(!x.key){o.links.push(x);}else{var c1=p(o,x.key);if(c1){b(c1,x);}else{o.links.push(x);}}}}function l(i,e,o,p){for(var j=0;j<o.length;j++){var x=p[o[j]];if(x&&x.docu){a(x.docu,x.libraryUrl);b(i,x.docu);}}e(i);}b1.addReleaseNotesToDevGuide=function(o,e,j,p){if(!e){e="releasenotes.html";}if(!j){j="Release Notes";}if(!p){p=1;}function x(d1){if(d1&&d1.links&&d1.links.length>0){return d1.links[0];}return null;}var c1=o;for(var i=0;i<p;i++){c1=x(c1);}if(c1){c1.links=c1.links||[];c1.links.push({ref:e,text:j,alias:"releasenotes.html"});}return o;};b1.extendDevGuide=function(o,j){var p=new d();var x="discovery/all_libs";q.ajax({url:x,dataType:"json",error:function(i,c1,e){q.sap.log.error("failed to load library list from '"+x+"': "+c1+", "+e);j(o);},success:function(e,c1,d1){var e1=e["all_libs"];if(!e1){q.sap.log.error("failed to load library list from '"+x+"': "+c1+", Data: "+e1);j(o);return;}var f1=0,g1=e1.length,h1={},i1=[],j1;for(var i=0;i<g1;i++){j1=e1[i].entry.replace(/\//g,".");i1.push(j1);p._getDocuIndex(j1,function(k1){h1[k1.library]=k1;f1++;if(f1==g1){l(o,j,i1,h1);}});}}});};})();return b1;},true);
