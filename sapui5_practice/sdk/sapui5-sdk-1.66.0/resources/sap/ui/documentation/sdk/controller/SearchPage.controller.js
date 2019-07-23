/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/documentation/sdk/controller/BaseController","sap/ui/documentation/sdk/controller/util/SearchUtil","sap/ui/model/json/JSONModel","sap/m/GroupHeaderListItem","sap/base/Log"],function(q,B,S,J,G,L){"use strict";var A={"properties":"controlProperties","fields":"properties","aggregations":"aggregations","associations":"associations","events":"events","specialSettings":"specialsettings","annotations":"annotations","methods":"methods"},a={"properties":"property","fields":"field","aggregations":"aggregation","associations":"association","events":"event","specialSettings":"specialsetting","annotations":"annotation","methods":"method"};return B.extend("sap.ui.documentation.sdk.controller.SearchPage",{onInit:function(){this.setModel(new J());this.bindListResults();this.getRouter().getRoute("search").attachPatternMatched(this._onTopicMatched,this);},bindListResults:function(){this.dataObject={data:[]};this.getModel().setData(this.dataObject);},_onTopicMatched:function(b){var Q=decodeURIComponent(b.getParameter("arguments").searchParam),l=this.byId("allList");this.dataObject.searchTerm=Q;this._modelRefresh();try{this.hideMasterSide();}catch(e){L.error(e);}l.setBusy(true);S.search(Q).then(function(r){this.processResult(r);l.setBusy(false);}.bind(this));},processResult:function(d){this.dataObject.data=[];this.dataObject.dataAPI=[];this.dataObject.dataDoc=[];this.dataObject.dataExplored=[];this.dataObject.AllLength=0;this.dataObject.APILength=0;this.dataObject.DocLength=0;this.dataObject.ExploredLength=0;if(d&&d.success){if(d.totalHits==0){q(".sapUiRrNoData").html("No matches found.");}else{for(var i=0;i<d.matches.length;i++){var m=d.matches[i],D=m.doc;D.modifiedStr=D.modified+"";var M=D.modifiedStr.substring(0,4)+"/"+D.modifiedStr.substring(4,6)+"/"+D.modifiedStr.substring(6,8)+", "+D.modifiedStr.substring(8,10)+":"+D.modifiedStr.substring(10),t=D.title,s=D.summary,n=D.path,b=false,c;if(D.category==="topics"){n=n.substring(0,n.lastIndexOf(".html"));b=true;c="Documentation";this.dataObject.dataDoc.push({index:this.dataObject.DocLength,title:t?t:"Untitled",path:n,summary:s||"",score:D.score,modified:M,category:c});this.dataObject.DocLength++;}else if(D.category==="entity"){b=true;c="Samples";this.dataObject.dataExplored.push({index:this.dataObject.ExploredLength,title:t?t+" (samples)":"Untitled",path:n,summary:s||"",score:D.score,modified:M,category:c});this.dataObject.ExploredLength++;}else if(D.category==='apiref'){n=this._formatApiRefURL(m);t=this._formatApiRefTitle(m);s=this._formatApiRefSummary(m);b=true;c="API Reference";this.dataObject.dataAPI.push({index:this.dataObject.APILength,title:t,path:n,summary:s||"",score:D.score,modified:M,category:c});this.dataObject.APILength++;}if(b){this.dataObject.data.push({index:i,title:t?t:"Untitled",path:n,summary:s||"",score:D.score,modified:M,category:c});this.dataObject.AllLength++;}}}}else{q(".sapUiRrNoData").html("Search failed, please retry ...");}this._modelRefresh();},_formatApiRefURL:function(m){var e=m.matchedDocField,E=m.doc.title,s=A[e],u;u="api/"+encodeURIComponent(E);if(s){u+="/"+encodeURIComponent(s);}if(e==="methods"){u+="/"+encodeURIComponent(m.matchedDocWord);}return u;},_formatApiRefTitle:function(m){var d=m.doc,M=a[m.matchedDocField],s=m.matchedDocWord;if(M&&s){return s+" ("+M+")";}if(d.kind){return d.title+" ("+d.kind+")";}return d.title;},_formatApiRefSummary:function(m){var d=m.doc,M=a[m.matchedDocField],s=m.matchedDocWord,b=M&&s;if(b){return d.title;}return d.summary;},_modifyLinks:function(){var v=this.getView(),i=[].concat(v.byId("allList").getItems(),v.byId("apiList").getItems(),v.byId("documentationList").getItems(),v.byId("samplesList").getItems()),l=i.length,I;while(l--){I=i[l];if(I._getLinkSender){I._getLinkSender().setHref("#/"+I.getCustomData()[0].getValue());}}},_modelRefresh:function(){this.getModel().refresh();this._modifyLinks();},getGroupHeader:function(g){return new G({title:g.key,upperCase:false});},categoryAPIFormatter:function(c){return c==="API Reference";},categoryDocFormatter:function(c){return c==="Documentation";},categoryExploredFormatter:function(c){return c==="Samples";},onAllLoadMore:function(e){this.dataObject.visibleAllLength=e.getParameter("actual");this._modelRefresh();},onAPILoadMore:function(e){this.dataObject.visibleAPILength=e.getParameter("actual");this._modelRefresh();},onDocLoadMore:function(e){this.dataObject.visibleDocLength=e.getParameter("actual");this._modelRefresh();},onExploredLoadMore:function(e){this.dataObject.visibleExploredLength=e.getParameter("actual");this._modelRefresh();}});});
