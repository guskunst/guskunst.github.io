/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","sap/ui/model/Sorter","sap/ui/Device","./library","sap/ui/thirdparty/jquery"],function(E,S,D,l,q){"use strict";var T={TableUtils:null,clearMode:function(t){t._mode=null;},setGroupMode:function(t){t._mode="Group";},isGroupMode:function(t){return t._mode==="Group";},setTreeMode:function(t){t._mode="Tree";},isTreeMode:function(t){return t._mode=="Tree";},getModeCssClass:function(t){switch(t._mode){case"Group":return"sapUiTableGroupMode";case"Tree":return"sapUiTableTreeMode";default:return null;}},showGroupMenuButton:function(t){return!D.system.desktop&&T.TableUtils.isA(t,"sap.ui.table.AnalyticalTable");},toggleGroupHeader:function(t,r,e){var I=[];var b=t?t.getBinding("rows"):null;if(!t||!b||!b.expand||r==null){return null;}if(typeof r==="number"){I=[r];}else if(Array.isArray(r)){if(e==null&&r.length>1){return null;}I=r;}var a=t._getTotalRowCount(true);var v=I.filter(function(c){var d=b.isExpanded(c);var f=true;if(b.nodeHasChildren){if(b.getNodeByIndex){f=!b.nodeHasChildren(b.getNodeByIndex(c));}else{f=false;}}return c>=0&&c<a&&!f&&e!==d;}).sort();if(v.length===0){return null;}for(var i=v.length-1;i>0;i--){if(e){b.expand(v[i],true);}else{b.collapse(v[i],true);}}if(e===true){b.expand(v[0],false);}else if(e===false){b.collapse(v[0],false);}else{b.toggleIndex(v[0]);}return b.isExpanded(v[0]);},toggleGroupHeaderByRef:function(t,r,e){var R=q(r);var g;if(R.hasClass("sapUiTableTreeIcon")||(T.isTreeMode(t)&&R.hasClass("sapUiTableCellFirst"))){g=R.closest("tr",t.getDomRef());}else{g=R.closest(".sapUiTableGroupHeader",t.getDomRef());}var b=t.getBinding("rows");if(g.length>0&&b){var G=+g.attr("data-sap-ui-rowindex");var o=t.getRows()[G];if(o){var a=o.getIndex();var i=T.toggleGroupHeader(t,a,e);var c=i===true||i===false;if(c&&t._onGroupHeaderChanged){t._onGroupHeaderChanged(a,i);}return c;}}return false;},isInGroupingRow:function(c){var i=T.TableUtils.getCellInfo(c);if(i.isOfType(T.TableUtils.CELLTYPE.DATACELL)){return i.cell.parent().hasClass("sapUiTableGroupHeader");}else if(i.isOfType(T.TableUtils.CELLTYPE.ROWHEADER|T.TableUtils.CELLTYPE.ROWACTION)){return i.cell.hasClass("sapUiTableGroupHeader");}return false;},isGroupingRow:function(r){if(!r){return false;}return q(r).hasClass("sapUiTableGroupHeader");},isInSumRow:function(c){var i=T.TableUtils.getCellInfo(c);if(i.isOfType(T.TableUtils.CELLTYPE.DATACELL)){return i.cell.parent().hasClass("sapUiAnalyticalTableSum");}else if(i.isOfType(T.TableUtils.CELLTYPE.ROWHEADER|T.TableUtils.CELLTYPE.ROWACTION)){return i.cell.hasClass("sapUiAnalyticalTableSum");}return false;},calcGroupIndent:function(t,L,c,s){var I=0;var i;if(t.isA("sap.ui.table.TreeTable")){for(i=0;i<L;i++){I=I+(i<2?12:8);}}else if(t.isA("sap.ui.table.AnalyticalTable")){L=L-1;L=!c&&!s?L-1:L;L=Math.max(L,0);for(i=0;i<L;i++){if(I==0){I=12;}I=I+(i<2?12:8);}}else{L=!c?L-1:L;L=Math.max(L,0);for(i=0;i<L;i++){I=I+(i<2?12:8);}}return I;},setIndent:function(t,r,R,i){var b=t._bRtlMode,f=r.find("td.sapUiTableCellFirst > .sapUiTableCellInner"),s=R.find(".sapUiTableGroupShield");if(i<=0){R.css(b?"right":"left","");s.css("width","").css(b?"margin-right":"margin-left","");f.css(b?"padding-right":"padding-left","");}else{R.css(b?"right":"left",i+"px");s.css("width",i+"px").css(b?"margin-right":"margin-left",((-1)*i)+"px");f.css(b?"padding-right":"padding-left",(i+8)+"px");}},updateTableRowForGrouping:function(t,r,c,e,h,s,L,g){var d=r.getDomRefs(true),R=d.row,$=d.rowScrollPart,f=d.rowFixedPart,a=d.rowSelector,b=d.rowAction;R.attr({"data-sap-ui-level":L});R.data("sap-ui-level",L);if(T.isGroupMode(t)){R.toggleClass("sapUiAnalyticalTableSum",!c&&s).toggleClass("sapUiAnalyticalTableDummy",false).toggleClass("sapUiTableGroupHeader",c).toggleClass("sapUiTableRowHidden",c&&h||r._bHidden);q(document.getElementById(r.getId()+"-groupHeader")).toggleClass("sapUiTableGroupIconOpen",c&&e).toggleClass("sapUiTableGroupIconClosed",c&&!e).attr("title",t._getShowStandardTooltips()&&g?g:null).text(g||"");var i=T.calcGroupIndent(t,L,c,s);T.setIndent(t,R,a,i);R.toggleClass("sapUiTableRowIndented",i>0);}var j=null;if(T.isTreeMode(t)){j=R.find(".sapUiTableTreeIcon");j.css(t._bRtlMode?"margin-right":"margin-left",(L*17)+"px").toggleClass("sapUiTableTreeIconLeaf",!c).toggleClass("sapUiTableTreeIconNodeOpen",c&&e).toggleClass("sapUiTableTreeIconNodeClosed",c&&!e);}if(T.showGroupMenuButton(t)){var k=0;var m=t.$();if(m.hasClass("sapUiTableVScr")){k+=m.find(".sapUiTableVSb").width();}var G=a.find(".sapUiTableGroupMenuButton");if(t._bRtlMode){G.css("right",(m.width()-G.width()+a.position().left-k-5)+"px");}else{G.css("left",(m.width()-G.width()-a.position().left-k-5)+"px");}}t._getAccExtension().updateAriaExpandAndLevelState(r,$,a,f,b,c,e,L,j);},cleanupTableRowForGrouping:function(t,r){var d=r.getDomRefs(true);d.row.removeAttr("data-sap-ui-level");d.row.removeData("sap-ui-level");if(T.isGroupMode(t)){d.row.removeClass("sapUiTableGroupHeader sapUiAnalyticalTableSum sapUiAnalyticalTableDummy");T.setIndent(t,d.row,d.rowSelector,0);}var $=null;if(T.isTreeMode(t)){$=d.row.find(".sapUiTableTreeIcon");$.removeClass("sapUiTableTreeIconLeaf").removeClass("sapUiTableTreeIconNodeOpen").removeClass("sapUiTableTreeIconNodeClosed").css(this._bRtlMode?"margin-right":"margin-left","");}t._getAccExtension().updateAriaExpandAndLevelState(r,d.rowScrollPart,d.rowSelector,d.rowFixedPart,d.rowAction,false,false,-1,$);},updateGroups:function(t){if(T.isGroupMode(t)||T.isTreeMode(t)){var b=t.getBinding("rows");var r=t.getBindingInfo("rows");var R=t.getRows();var c=R.length;var i;if(b){for(i=0;i<c;i++){var o=T.getRowGroupInfo(t,R[i],b,r);T.updateTableRowForGrouping(t,R[i],o.isHeader,o.expanded,o.hidden,false,o.level,o.title);}}else{for(i=0;i<c;i++){T.cleanupTableRowForGrouping(t,R[i]);}}}},getRowGroupInfo:function(t,r,R,o){var a={isHeader:false,expanded:false,hidden:false,title:"",level:0};if(t.getGroupHeaderProperty){a.isHeader=r._bHasChildren;a.expanded=r._bIsExpanded;a.hidden=a.isHeader;a.level=r._iLevel;var h=t.getGroupHeaderProperty();if(T.isGroupMode(t)&&h){var m=o&&o.model;a.title=t.getModel(m).getProperty(h,r.getBindingContext(m));}}else{var i=r.getIndex();a.isHeader=!!R.isGroupHeader(i);a.level=a.isHeader?0:1;if(a.isHeader){a.expanded=!!R.isExpanded(i);a.hidden=true;a.title=R.getTitle(i);}}return a;},setupExperimentalGrouping:function(t){if(!t.getEnableGrouping()){return;}var b=E.prototype.getBinding.call(t,"rows");var g=sap.ui.getCore().byId(t.getGroupBy());var I=g&&g.getGrouped()&&T.TableUtils.isA(b,"sap.ui.model.ClientListBinding");if(!I||b._modified){return;}b._modified=true;T.setGroupMode(t);var p=g.getSortProperty();b.sort(new S(p));var L=t._getTotalRowCount(),c=b.getContexts(0,L);var k;var C=0;for(var i=L-1;i>=0;i--){var n=c[i].getProperty(p);if(!k){k=n;}if(k!==n){var G=c[i+1].getModel().getContext("/sap.ui.table.GroupInfo"+i);G.__groupInfo={oContext:c[i+1],name:k,count:C,groupHeader:true,expanded:true};c.splice(i+1,0,G);k=n;C=0;}C++;}var G=c[0].getModel().getContext("/sap.ui.table.GroupInfo");G.__groupInfo={oContext:c[0],name:k,count:C,groupHeader:true,expanded:true};c.splice(0,0,G);q.extend(b,{getLength:function(){return c.length;},getContexts:function(s,L){return c.slice(s,s+L);},isGroupHeader:function(a){var o=c[a];return(o&&o.__groupInfo&&o.__groupInfo.groupHeader)===true;},getTitle:function(a){var o=c[a];return o&&o.__groupInfo&&o.__groupInfo.name+" - "+o.__groupInfo.count;},isExpanded:function(a){var o=c[a];return this.isGroupHeader(a)&&o.__groupInfo&&o.__groupInfo.expanded;},expand:function(a){if(this.isGroupHeader(a)&&!c[a].__groupInfo.expanded){for(var i=0;i<c[a].__childs.length;i++){c.splice(a+1+i,0,c[a].__childs[i]);}delete c[a].__childs;c[a].__groupInfo.expanded=true;this._fireChange();}},collapse:function(a){if(this.isGroupHeader(a)&&c[a].__groupInfo.expanded){c[a].__childs=c.splice(a+1,c[a].__groupInfo.count);c[a].__groupInfo.expanded=false;this._fireChange();}},toggleIndex:function(a){if(this.isExpanded(a)){this.collapse(a);}else{this.expand(a);}},nodeHasChildren:function(o){if(!o||!o.__groupInfo){return false;}else{return o.__groupInfo.groupHeader===true;}},getNodeByIndex:function(a){return c[a];}});t._mTimeouts.groupingFireBindingChange=t._mTimeouts.groupingFireBindingChange||window.setTimeout(function(){b._fireChange();},0);},resetExperimentalGrouping:function(t){var b=t.getBinding("rows");if(b&&b._modified){T.clearMode(t);var B=t.getBindingInfo("rows");t.unbindRows();t.bindRows(B);}}};return T;},true);
