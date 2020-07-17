/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery",'./library','sap/m/library','sap/ui/comp/library','sap/ui/core/Control','sap/m/ComboBox','sap/m/Popover','sap/m/Link','sap/m/StandardListItem','sap/ui/core/delegate/ItemNavigation','sap/m/Button','sap/m/SelectDialog','sap/ui/model/Filter','sap/ui/model/FilterOperator','sap/ui/core/Element','sap/m/Text','sap/m/Bar','sap/ui/model/Sorter','sap/ui/Device','sap/m/Label','sap/m/List','sap/m/ScrollContainer','sap/m/HBox','sap/m/VBox','sap/ui/comp/variants/VariantManagement','sap/m/GroupHeaderListItem','sap/ui/core/Item',"sap/ui/events/KeyCodes","sap/base/Log","./TargetFilterRenderer"],function(q,l,M,S,C,a,P,L,b,I,B,c,F,d,E,T,f,g,D,h,j,k,H,V,m,G,n,K,p,r){"use strict";var s=C.extend("sap.suite.ui.commons.TargetFilter",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{entitySet:{type:"string",group:"Misc",defaultValue:null}},aggregations:{columns:{type:"sap.suite.ui.commons.TargetFilterColumn",multiple:true,singularName:"column"},_countDisplay:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_quad0:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_quad1:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_quad2:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_quad3:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},measureColumn:{type:"sap.suite.ui.commons.TargetFilterMeasureColumn",multiple:false}},associations:{selectedColumns:{type:"sap.suite.ui.commons.TargetFilterColumn",multiple:true,singularName:"selectedColumn"}},events:{search:{},filterChange:{},cancel:{}}}});var t=a.extend("sap.suite.ui.commons.TargetFilterComboBox",{metadata:{properties:{popoverPlacement:{type:"sap.m.PlacementType",group:"Misc",defaultValue:"Bottom"}}},_createPopover:function(){var o=new P({showHeader:false,placement:this.getPopoverPlacement(),offsetX:0,offsetY:0,initialFocus:this,bounce:false});o.addStyleClass("TFComboBox");this._decoratePopover(o);return o;},renderer:"sap.m.ComboBoxRenderer"});var u=L.extend("sap.suite.ui.commons.TargetFilterLink",{metadata:{properties:{count:{type:"int"},key:{type:"string"}}},onmouseover:function(e){if(this.$()[0].scrollWidth>this.$().innerWidth()){this.firePress();}},renderer:"sap.m.LinkRenderer"});var v=b.extend("sap.suite.ui.commons.TargetFilterListItem",{metadata:{properties:{index:{type:"int"},key:{type:"string"}}},ontap:function(e){if(!q(e.target).hasClass("sapMCbMarkChecked")){this.setSelected(!this.getSelected());this.informList("Select",!this.getSelected());}this.firePress();},onkeyup:function(e){if(e.which===K.ENTER||e.which===K.SPACE){this.firePress();}},renderer:"sap.m.StandardListItemRenderer"});var w=C.extend("sap.suite.ui.commons.TargetFilterLinksCloud",{metadata:{properties:{index:{type:"int"}},aggregations:{links:{cardinality:"0..n",type:"sap.suite.ui.commons.TargetFilterLink"}}},init:function(){var e=this;this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");this._oOthersLink=new u(this.getId()+"-others-link",{text:"+000 "+e._oRb.getText("TARGETFILTER_MORE_TEXT"),press:function(){var o=e.getParent();var y=Object.getOwnPropertyNames(o._oFilters);var J=0;for(var i=0;i<y.length;i++){if(!o._oFilters[y[i]].linkId){delete o._oFilters[y[i]];J++;}}this.setCount(this.getCount()-J);o.fireFiltersChanged();}});this._oOthersLink.addStyleClass("sapSuiteUiTFOthersLine");this._oOthersLink.setEmphasized(true).setSubtle(false);this._oOthersLink.setCount=function(i){this.setProperty("count",i,true);if(i>0){this.$().removeClass("Hidden");this.setText("+"+i+" "+e._oRb.getText("TARGETFILTER_MORE_TEXT"));}else{this.$().addClass("Hidden");}};},exit:function(){this._oOthersLink.destroy();},_setFontSizes:function(e){var i=["Large","Medium","Small","Smallest"];var O=q.unique(e.map(function(o){return o.getCount();}));switch(O.length){case 1:for(var N=0;N<e.length;N++){e[N].addStyleClass(i[1]);}break;case 2:for(var N=0;N<e.length;N++){if(O[0]===e[N].getCount()){e[N].addStyleClass(i[1]);}else{e[N].addStyleClass(i[2]);}}break;default:var y=Math.min.apply(null,O);var J=Math.max.apply(null,O);for(var N=0;N<e.length;N++){var Q=Math.floor(3.99*(J-e[N].getCount())/(J-y));e[N].addStyleClass(i[Q]);}}},renderer:function(R,o){var e=o.getLinks();R.write("<div");R.writeControlData(o);R.addClass("sapSuiteUiTFLinksCloud");R.writeClasses();R.write(">");o._setFontSizes(e);for(var i=0;i<e.length;i++){if(!!e[i].getText()){R.renderControl(e[i]);}}o._oOthersLink.addStyleClass("Quad"+o.getIndex()).addStyleClass("Hidden");R.renderControl(o._oOthersLink);R.write("</div>");},updateVisibleLinks:function(){var o=this.getParent();var e=this.$().find(".sapSuiteUiTFLine:not(.Hidden)");var y=0;var J=Object.getOwnPropertyNames(o._oFilters);for(var i=0;i<J.length;i++){delete o._oFilters[J[i]].linkId;}e.each(function(){var N=sap.ui.getCore().byId(this.id);var O=o._oFilters[N.getKey()];if(O){N.setEmphasized(true).setSubtle(false);O.linkId=N.getId();y++;}else{N.setEmphasized(false).setSubtle(true);}});this._oOthersLink.setCount(J.length-y);},onAfterRendering:function(){if(this.getLinks().length!==0){this.drawCloudCircle();this.updateVisibleLinks();}},drawCloudCircle:function(){var R=sap.ui.getCore().getConfiguration().getRTL();var o=Math.ceil(parseFloat(q(".sapSuiteUiTFOuterCircle").width()/2))-5;var e=Math.ceil(parseFloat(q(".sapSuiteUiTFCentralCircle").outerWidth()/2));var y=Math.ceil(parseFloat(q(".sapSuiteUiTFOuterCont").outerHeight()/2));var J=q("html").hasClass("sapUiMedia-Std-Phone");var N=Math.ceil(parseFloat(q(".sapSuiteUiTFBox").outerHeight()));var O=Math.ceil(parseFloat(q(".sapSuiteUiTFBox").outerWidth()));if(!J){O+=Math.ceil(parseFloat(q(".sapSuiteUiTFBox.Quad0").css("right")));}var Q=8;this.initQuadArea(o-Q,y,e+Q,N,O,Q);var U=this;var W=this.getIndex();var X=((W===0||W===3)!==R)?"left":"right";var Y=(W===0||W===1)?"bottom":"top";var Z=this.getLinks();for(var i=0;i<Z.length;i++){var $=Z[i].$();if($.length>0){var _=$[0].scrollWidth;if(Z.length<=5&&this.isCompact()){var a1=[0,2,[1,3][i],[1,2,3][i],[0,1,2,3][i],[0,1,2,3,4][i]][Z.length];if($.width()>this._bgArea[a1].width){$.width(this._bgArea[a1].width);}this._bgArea[a1].placed.push($);}else if(Z.length<=3&&!this.isCompact()){var a1=[0,1,[0,2][i],[0,1,2][i]][Z.length];if($.width()>this._bgArea[a1].width){$.width(this._bgArea[a1].width);}this._bgArea[a1].placed.push($);}else{var b1=48;if(Z[i].getText().length<3){_=Math.ceil(Z[i].getText().length*b1/3);}$.width(_);var c1=$.outerWidth();var d1=-1;var e1=1000;var f1=-1;var g1=0;for(var h1=0;h1<U._bgArea.length;h1++){var i1=U._bgArea[h1].width-c1;if(i1>=0&&i1<e1){e1=i1;d1=h1;}if(i1<0&&i1<g1){g1=i1;f1=h1;}}if(d1!==-1){this._bgArea[d1].placed.push($);this._bgArea[d1].width-=c1;}else if(f1!==-1&&U._bgArea[f1].width>=b1){if($.width()>this._bgArea[f1].width){$.width(this._bgArea[f1].width);}c1=$.outerWidth();this._bgArea[f1].width-=c1;this._bgArea[f1].placed.push($);}else{$.addClass("Hidden");}}}}for(var h1=0;h1<this._bgArea.length;h1++){var j1=this._bgArea[h1].start;var k1=this._bgArea[h1].placed.length;var l1=Math.max(0,this._bgArea[h1].width);for(var m1=0;m1<k1;m1++){var n1=2.0*l1/k1;var o1=this._bgArea[h1].placed[m1];o1.css(Y,this._bgArea[h1].offset+"px");o1.css(X,j1+"px");j1+=o1.outerWidth()+Math.ceil(n1*Math.random());}}this.initItemNavigation();},onsappageup:function(){var N=this.oItemNavigation.getFocusedIndex()-this.oItemNavigation.iPageSize;if(N<0||!this.oItemNavigation.getItemDomRefs()[N]){for(var i=0;i<this.oItemNavigation.getItemDomRefs().length;i++){if(this.oItemNavigation.getItemDomRefs()[i]){this.oItemNavigation.setFocusedIndex(i);q.grep(this.oItemNavigation.getItemDomRefs(),function(o){return o;})[0].focus();return;}}}},initItemNavigation:function(){var Q=this.getIndex();var o=this.getDomRef();var e=this.getLinks();if(e){var i=new Array(e.length);if(this._bgArea){var R=(Q===0||Q===1)?this._bgArea.reverse():this._bgArea;R.forEach(function(y){var J=y.placed;if(J){J=(Q===1||Q===2)?J.reverse():J;J.forEach(function(N){i.push(N);});}});}if(!this.oItemNavigation){this.oItemNavigation=new I();this.addDelegate(this.oItemNavigation);}this.oItemNavigation.setRootDomRef(o);this.oItemNavigation.setItemDomRefs(i);this.oItemNavigation.setCycling(false);this.oItemNavigation.setPageSize(5);}},isCompact:function(){return this.$().closest(".sapUISizeCompact").length>0;},initQuadArea:function(o,i,e,y,J,N){var O=q("html").hasClass("sapUiMedia-Std-Phone");if(i<0){i=0;}var R=this.isCompact()?5:3;this._bgArea=new Array(R);var Y=(i-N-y)/R;var Q=y;for(var U=0;U<R;U++){var W=e*e-Q*Q;var X=((W>0)?Math.ceil(parseFloat(Math.sqrt(W))):0)+N;this._bgArea[U]={start:X,width:(O?o:Math.ceil(parseFloat(Math.sqrt(o*o-(Q+Y)*(Q+Y)))))-X,offset:Q,placed:[]};Q+=Math.ceil(Y);}}});var x=C.extend("sap.suite.ui.commons.TargetFilterQuadrant",{metadata:{properties:{index:{type:"int"}},aggregations:{linkClouds:{multiple:true,type:"sap.suite.ui.commons.TargetFilterLinksCloud"},dialog:{multiple:true,type:"sap.m.SelectDialog"}},events:{filtersChanged:{}}},init:function(){var e=this;this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");this._oFilters={};this._assignedFilters=[];this._oFilterCb=new t(this.getId()+"-cb",{selectionChange:function(){e.setColumn(this.getSelectedKey(),true);}});this._oValueHelpBtn=new B(this.getId()+"-btn",{icon:"sap-icon://search",press:function(){e.fnShowValueHelper();}});this.addLinkCloud(new w(this.getId()+"-links"));this._oSelectDialog=new c(this.getId()+"-browser",{multiSelect:true,liveChange:function(o){var i=o.getParameter("value");var y=o.getParameter("itemsBinding");var J=[];try{if(i!==undefined&&i.length){J.push(new F(e._oColumn.getPath(),e._oColumn.getType().getName()==="String"?d.Contains:d.EQ,e._oColumn.getType().parseValue(i,"string")));}y.filter(J);}catch(N){p.warning("'"+i+"' is not valid "+e._oColumn.getType().getName(),this);this.removeAllItems();}},confirm:function(o){var i=o.getParameter("selectedContexts");e._oFilters={};for(var y in e.oSelectedDialogSaveItems){if(e.oSelectedDialogSaveItems[y]){e._oFilters[y]={filter:new F(e._oColumn.getPath(),d.EQ,y),text:e._oColumn.getType().formatValue(y,"string")};}}e.oSelectedDialogSaveItems={};e.fireFiltersChanged();e.getLinkClouds()[0].updateVisibleLinks();},cancel:function(o){e.oSelectedDialogSaveItems={};}});this.addAggregation("dialog",this._oSelectDialog);},hasFilters:function(){return Object.getOwnPropertyNames(this._oFilters).length!==0;},hasFilter:function(e){return this._oFilters.hasOwnProperty(e);},getFiltersSet:function(){var e=[];var o=Object.getOwnPropertyNames(this._oFilters);for(var i=0;i<o.length;i++){e.push({key:o[i],text:this._oFilters[o[i]].text});}return e;},getFilters:function(){var e=[];var o=Object.getOwnPropertyNames(this._oFilters);for(var i=0;i<o.length;i++){e.push(this._oFilters[o[i]].filter);}if(e.length){return new F(e,false);}},filter:function(e){this._assignedFilters=e;this._oFilters={};var o=this.getLinkClouds()[0].getBinding("links");o.filter(this._assignedFilters);},removeFilter:function(e){var o=this._oFilters[e];if(o.linkId){sap.ui.getCore().byId(o.linkId).setEmphasized(false).setSubtle(true);}else{this.getLinkClouds()[0]._oOthersLink.setCount(this.getLinkClouds()[0]._oOthersLink.getCount()-1);}delete this._oFilters[e];this.fireFiltersChanged();},setProperty:function(e,i,o){E.prototype.setProperty.apply(this,arguments);if(e==="index"){if(i===0||i===1){this._oFilterCb.setPopoverPlacement(l.VerticalPreferedTop).addStyleClass("sapSuiteTFCBTop");}else{this._oFilterCb.setPopoverPlacement(l.VerticalPreferedBottom);}if(i===0||i===3){this._oFilterCb.addStyleClass("sapSuiteTFCBArrowBeforeVal");}this.getLinkClouds()[0].setIndex(i);}},setColumn:function(e,i){this._oColumn=sap.ui.getCore().byId(e);if(this._oColumn){if(!i){this._oFilterCb.setSelectedKey(e);}var o=this.getParent();var y=this;var R=new u({key:"{"+this._oColumn.getPath()+"}",text:{path:this._oColumn.getPath(),type:this._oColumn.getType()},count:{path:o.getMeasureColumn().getPath()},press:function(N){if(this.$()[0].scrollWidth>this.$().innerWidth()){var O=this;var Q=this.getParent().getParent().getId();if(sap.ui.getCore().byId(Q+"-popover"))y._selectPopover.destroy();y._selectPopover=new P(Q+"-popover",{title:sap.ui.getCore().byId(Q+"-cb").getValue(),content:[new T({text:this.getText(),wrapping:true}).addStyleClass("sapSuiteUiTFPopoverText")],footer:[new f({contentRight:[new B({text:y._oRb.getText(this.getEmphasized()?"TARGETFILTER_BUTTON_DESELECT":"TARGETFILTER_BUTTON_SELECT"),type:"Emphasized",press:function(){y.toggleLinkSelection(O);y._selectPopover.close();}}),new B({text:y._oRb.getText("TARGETFILTER_BUTTON_CANCEL"),press:function(){y._selectPopover.close();}})]})],placement:M.PlacementType.Vertical,afterClose:function(U){if(U)U.getSource().destroy();}}).addStyleClass("sapSuiteUiTFPopover");y._selectPopover.openBy(this);y._selectPopover.$().attr("role","alert").removeAttr("aria-label");return;}y.toggleLinkSelection(this);}});R.addStyleClass("sapSuiteUiTFLine");R.addStyleClass("Quad"+this.getIndex());this.getLinkClouds()[0].bindAggregation("links",{path:"/"+o.getEntitySet(),parameters:{select:this._oColumn.getPath()+","+o.getMeasureColumn().getPath()},template:R,length:this._oColumn.getLength(),sorter:[new g(o.getMeasureColumn().getPath(),true),new g(this._oColumn.getPath(),false)],filters:this._assignedFilters});var J=this.hasFilters();this._oFilters={};if(J){this.fireFiltersChanged();}}else{this.getLinkClouds()[0].removeAllLinks();}},toggleLinkSelection:function(o){if(this._oFilters[o.getKey()]){delete this._oFilters[o.getKey()];o.setEmphasized(false).setSubtle(true);}else{this._oFilters[o.getKey()]={filter:new F(this._oColumn.getPath(),d.EQ,o.getKey()),linkId:o.getId(),text:o.getText()};o.setEmphasized(true).setSubtle(false);}this.fireFiltersChanged();},fnShowValueHelper:function(){var o=this.getParent();var e=this;var i=" "+e._oRb.getText("TARGETFILTER_ENTRIES_TEXT");this._oSelectDialog.bindAggregation("items",{path:"/"+o.getEntitySet(),parameters:{select:this._oColumn.getPath()+","+o.getMeasureColumn().getPath()},sorter:[new g(o.getMeasureColumn().getPath(),true),new g(this._oColumn.getPath(),false)],filters:this._assignedFilters,factory:function(y,J){var N=new v({key:{path:e._oColumn.getPath()},title:{type:e._oColumn.getType(),path:e._oColumn.getPath()},description:{path:o.getMeasureColumn().getPath(),formatter:function(O){return O+i;}},selected:e.fnSelectDialogItemSelection(J),press:function(O){e.oSelectedDialogSaveItems[this.getProperty("key")]=this.getSelected();}});return N;}});this._oSelectDialog.setTitle(this._oColumn.getTitle()),this._oSelectDialog.open();},oSelectedDialogSaveItems:{},fnSelectDialogItemSelection:function(o){var e=o.getProperty(this._oColumn.getPath());if(this.oSelectedDialogSaveItems[e]===undefined){this.oSelectedDialogSaveItems[e]=this.hasFilter(e);}return this.oSelectedDialogSaveItems[e];},rebindColumns:function(){var o=this.getParent();this._oFilterCb.removeAllItems();for(var i=0;i<o.getColumns().length;i++){var e=o.getColumns()[i];var y=new n({key:e.getId(),text:e.getTitle()});this._oFilterCb.addItem(y);}if(o.getSelectedColumns()&&o.getSelectedColumns()[this.getIndex()]){this.setColumn(o.getSelectedColumns()[this.getIndex()]);}else if(o.getColumns()[this.getIndex()]){this.setColumn(o.getColumns()[this.getIndex()].getId());}else{this.setColumn();}},exit:function(){if(this.oItemNavigation){this.removeDelegate(this.oItemNavigation);this.oItemNavigation.destroy();}this._oFilterCb.destroy();this._oValueHelpBtn.destroy();},renderer:function(R,o){var Q=o.getIndex();R.write("<div");R.writeControlData(o);R.addClass("sapSuiteUiTFQuadrant");R.addClass("Quad"+Q);R.writeClasses();R.write(">");R.write("<div");R.addClass("sapSuiteUiTFBox");R.addClass("Quad"+Q);R.writeClasses();R.write(">");R.write("<div");R.addClass("sapSuiteUiTFParCont");R.addClass("Quad"+Q);R.writeClasses();R.write(">");R.renderControl(o._oFilterCb);R.write("</div>");R.write("<div");R.addClass("sapSuiteUiTFValHel");R.addClass("Quad"+Q);R.writeClasses();R.write(">");R.renderControl(o._oValueHelpBtn);R.write("</div>");R.write("</div>");R.write("<div");R.addClass("sapSuiteUiTFHorizontalLineBg");R.addClass("Quad"+Q);R.writeClasses();R.write(">");R.write("<div");R.addClass("sapSuiteUiTFHorizontalLine");R.addClass("Quad"+Q);R.writeClasses();R.write(">");R.write("</div>");R.write("</div>");R.renderControl(o.getLinkClouds()[0]);R.write("</div>");}});var z=C.extend("sap.suite.ui.commons.TargetFilterCountDisplay",{metadata:{aggregations:{counts:{multiple:true,type:"sap.suite.ui.commons.TargetFilterCount"}}},init:function(){this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");},renderer:function(R,o){R.write("<div");R.writeControlData(o);R.addClass("sapSuiteUiTFCentralLabel");R.writeClasses();R.write(">");if(o.getCounts().length){R.write(o.getCounts()[0].getCount());}R.write("</div>");},filter:function(e){this.getBinding("counts").filter(e);this.getParent()._oShowSelectedLink.setText(this._oRb.getText((this.getParent().iCountFilters>0)?"TARGETFILTER_SHOW_SELECTED_TEXT":"TARGETFILTER_SHOW_ALL_TEXT"));}});var A=E.extend("sap.suite.ui.commons.TargetFilterCount",{metadata:{properties:{count:{type:"string"}},events:{countUpdated:{}}},setProperty:function(e,o,i){E.prototype.setProperty.apply(this,arguments);if(e==="count"){this.fireCountUpdated({});}}});s.prototype.init=function(){D.media.attachHandler(this.rerender,this,D.media.RANGESETS.SAP_STANDARD);this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var o=this;this._aQuadrants=[];this._aSelectionHistory=[];for(var i=0;i<4;i++){var Q=new x(this.getId()+"-quad"+i,{index:i,filtersChanged:function(){o._handleFiltersChange(this.getIndex());}});this._aQuadrants.push(Q);this.setAggregation("_quad"+i,Q);}this._aQuadrants[0].getLinkClouds()[0].addDelegate({onAfterRendering:function(e){o._setVariantsFilterItems(0);}});this._aQuadrants[1].getLinkClouds()[0].addDelegate({onAfterRendering:function(e){o._setVariantsFilterItems(1);}});this._aQuadrants[2].getLinkClouds()[0].addDelegate({onAfterRendering:function(e){o._setVariantsFilterItems(2);}});this._aQuadrants[3].getLinkClouds()[0].addDelegate({onAfterRendering:function(e){o._setVariantsFilterItems(3);}});this._oSearchBtn=new B(this.getId()+"-search",{icon:"sap-icon://initiative",press:function(){o.search();}}).addStyleClass("sapSuiteUiTFSearchBtn");this._oSettingsBtn=new B(this.getId()+"-master-settings-button",{icon:"sap-icon://action-settings"});this._oSelLstLbl=new h(this.getId()+"-selection-list-label",{text:this._oRb.getText("TARGETFILTER_YOUR_SELECTION_TEXT")+" (0)",labelFor:this.getId()+"-selection-list"}).addStyleClass("sapSuiteUiTFSelLstLbl");this._oSelLst=new j(this.getId()+"-selection-list",{mode:"Delete","delete":function(e){this.attachEventOnce("updateFinished",this.focus,this);var y=e.getParameter("listItem");o._aQuadrants[y.getIndex()].removeFilter(y.getKey());},growing:true});this._oScrollCont=new k(this.getId()+"-scrl-cntnr",{horizontal:false,vertical:true,height:"17rem",content:this._oSelLst}).addStyleClass("sapSuiteUiTFScroll");this._oShowSelLbl=new L(this.getId()+"-show-selected-label",{press:function(){o.search();}}).addStyleClass("sapSuiteUiTFShowSelLbl");this._oShowSelBox=new H(this.getId()+"-selection-box",{items:[this._oSearchBtn,this._oShowSelLbl]}).addStyleClass("sapSuiteUiTFShowSelBox");this._oRightPanel=new V(this.getId()+"-right-panel-box",{items:[this._oSelLstLbl,this._oScrollCont,this._oShowSelBox]}).addStyleClass("sapSuiteUiTFRightPanelBox");this._oCountDisplay=new z();this.setAggregation("_countDisplay",this._oCountDisplay);this._oShowSelectedLink=new L(this.getId()+"-show-selected-link",{text:this._oRb.getText("TARGETFILTER_SHOW_ALL_TEXT"),press:function(){o.search();}});this._oSavedFiltersSet={};this._oVariants={};this.oVariantManagement=new m({enabled:true,showExecuteOnSelection:true,showShare:true,save:function(e){o._oVariants.sSelectedId=e.getParameters().key;o._oVariants[e.getParameters().key]={links:o._getFiltersSet(),aQuadrantsHistory:[],aQuadrantsCBSelected:[]};for(var i=0;i<4;i++){o._oVariants[e.getParameters().key].aQuadrantsCBSelected.push(o._aQuadrants[i]._oColumn.getPath());}if(o._aSelectionHistory.length!==0){for(var i in o._aSelectionHistory){o._oVariants[e.getParameters().key].aQuadrantsHistory[i]=o._aSelectionHistory[i];}}},select:function(e){o._oVariants.sSelectedId=e.getParameters().key;o._oVariants[o._oVariants.sSelectedId].iQHIndex=0;var y=o._oVariants[o._oVariants.sSelectedId].aQuadrantsHistory;if(y.length!==0){o._oVariants.steps=[];for(var i in y){o._oVariants.steps[y[i]]=2;}o._setVariantsFilterItems(y[0]);}else{var J=o._oVariants[o._oVariants.sSelectedId].aQuadrantsCBSelected;for(var i=0;i<J.length;i++){o.setQuadCBoxItem(i,J[i]);}var N=o._aSelectionHistory[0];if(o._aSelectionHistory.length!==0){o._aQuadrants[N]._oFilters={};o._aQuadrants[N].getLinkClouds()[0].updateVisibleLinks();o._handleFiltersChange(N);}}}});D.resize.attachHandler(this._calcWidthTargetWidthRPanel);this.addDelegate({onAfterRendering:function(e){o._calcWidthTargetWidthRPanel();}});this.data("sap-ui-fastnavgroup","true",true);};s.prototype._calcWidthTargetWidthRPanel=function(e){var i=1024;var o=16;var R=Math.min(3,Math.max(0,(parseInt(q('.sapMFlexItem').css("width"))-i)/o));q('.sapUiMedia-Std-Desktop .sapSuiteUiTFRightPanel').css("margin-left",R+"rem");};s.prototype._setVariantsFilterItems=function(Q){if(this._oVariants.steps&&this._oVariants.steps[Q]!==null){if(this._oVariants[this._oVariants.sSelectedId].iQHIndex>4||this._aQuadrants[Q].getLinkClouds()[0].getLinks().length===0||this._oVariants[this._oVariants.sSelectedId].aQuadrantsHistory[this._oVariants[this._oVariants.sSelectedId].iQHIndex]!==Q){return;}switch(this._oVariants.steps[Q]){case 2:this._oVariants.steps[Q]=1;if(!this.setQuadCBoxItem(Q,this._oVariants[this._oVariants.sSelectedId].aQuadrantsCBSelected[Q])){this._setVariantsFilterItems(Q);}break;case 1:this._oVariants.steps[Q]=null;this._oVariants[this._oVariants.sSelectedId].iQHIndex++;var o=this._oVariants[this._oVariants.sSelectedId].links[this._oVariants[this._oVariants.sSelectedId].aQuadrantsCBSelected[Q]];if(!o){break;}this._aQuadrants[Q]._oFilters={};var e=this._aQuadrants[Q].getLinkClouds()[0].getLinks();for(var y in o){for(var i in e){if(e[i].getKey()===y){this._aQuadrants[Q]._oFilters[y]={filter:new F(this._aQuadrants[Q]._oColumn.getPath(),d.EQ,y),linkId:e[i].getId(),text:e[i].getText()};e[i].setEmphasized(true).setSubtle(false);}}}this._aQuadrants[Q].getLinkClouds()[0].updateVisibleLinks();this._handleFiltersChange(Q);break;}}};s.prototype.setQuadCBoxItem=function(Q,N){if(this._aQuadrants[Q]._oColumn.getPath()===N){return false;}var o={};var e=this._aQuadrants[Q]._oFilterCb.getItems();for(var i=0;i<e.length;i++){o[sap.ui.getCore().byId(e[i].getKey()).getPath()]=e[i].getKey();}if(o[N]){this._aQuadrants[Q].setColumn(o[N]);return true;}return false;};s.prototype.search=function(){this.fireSearch();this._oSavedFiltersSet=this._getFiltersSet();return this;};s.prototype._getFiltersSet=function(){var o={};for(var i=0;i<this._aQuadrants.length;i++){var e=this._aQuadrants[i].getFiltersSet();var Q={};for(var y=0;y<e.length;y++){Q[e[y].key]={};}if(e.length){o[this._aQuadrants[i]._oColumn.getPath()]=Q;}}return o;};s.prototype.getParameters=function(){return{};};s.prototype.getFilters=function(){var e=[];for(var i=0;i<this._aSelectionHistory.length;i++){var o=this._aQuadrants[this._aSelectionHistory[i]].getFilters();if(o){e.push(o);}}if(e.length){return[new F(e,true)];}else{return e;}};s.prototype._handleFiltersChange=function(Q){this.iCountFilters=0;var e=this._aSelectionHistory.indexOf(Q);if(e===-1){this._aSelectionHistory.push(Q);}else{this._aSelectionHistory.splice(this._aQuadrants[Q].hasFilters()?e+1:e);}this._oSelLst.removeAllItems();for(var i=0;i<this._aSelectionHistory.length;i++){var o=this._aQuadrants[this._aSelectionHistory[i]].getFiltersSet();if(o.length){var J=new G({title:this._aQuadrants[this._aSelectionHistory[i]]._oColumn.getTitle(),upperCase:false});this._oSelLst.addItem(J);for(var y=0;y<o.length;y++){var J=new v({title:o[y].text,key:o[y].key,index:this._aSelectionHistory[i]});this._oSelLst.addItem(J);this.iCountFilters++;}}}this._oSelLst.rerender();var o=this.getFilters();for(var i=0;i<this._aQuadrants.length;i++){e=this._aSelectionHistory.indexOf(i);if(e===-1&&Q!==i){this._aQuadrants[i].filter(o);}}this._oCountDisplay.filter(o);this.fireFilterChange();var N=this._getFiltersSet();if(this.equalFiltersSet(N,this._oSavedFiltersSet)){this.fireCancel();}this._oSelLstLbl.setText(this._oRb.getText("TARGETFILTER_YOUR_SELECTION_TEXT")+" ("+this.iCountFilters+")");};s.prototype.equalFiltersSet=function(o,e){var y=Object.getOwnPropertyNames(o);var J=Object.getOwnPropertyNames(e);if(y.length!==J.length){return false;}for(var i=0;i<y.length;i++){var N=y[i];if(!e.hasOwnProperty(N)||!this.equalFiltersSet(o[N],e[N])){return false;}}return true;};s.prototype._bindModel=function(){if(this._bBindModel){this._bBindModel=false;for(var i=0;i<this._aQuadrants.length;i++){this._aQuadrants[i].rebindColumns();}var e=this;this._oCountDisplay.bindAggregation("counts",{path:"/"+this.getEntitySet(),parameters:{select:this.getMeasureColumn().getPath()},length:1,template:new A({count:{path:this.getMeasureColumn().getPath(),type:this.getMeasureColumn().getType()},countUpdated:function(){e._oShowSelLbl.setText(e._oRb.getText((e.iCountFilters>0)?"TARGETFILTER_SHOW_SELECTED_TEXT":"TARGETFILTER_SHOW_ALL_TEXT")+" ("+this.getCount()+")");}})});}};s.prototype._callMethodInManagedObject=function(e,i){if(i==="columns"||i==="entitySet"||i==="measureColumnName"){this._bBindModel=true;}var o=Array.prototype.slice.call(arguments);return C.prototype[e].apply(this,o.slice(1));};s.prototype.setProperty=function(e,o,i){this._callMethodInManagedObject("setProperty",e,o,i);return this;};s.prototype.insertAggregation=function(e,o,i,y){this._callMethodInManagedObject("insertAggregation",e,o,i,y);return this;};s.prototype.addAggregation=function(e,o,i){this._callMethodInManagedObject("addAggregation",e,o,i);return this;};s.prototype.removeAggregation=function(e,o,i){return this._callMethodInManagedObject("removeAggregation",e,o,i);};s.prototype.removeAllAggregation=function(e,i){return this._callMethodInManagedObject("removeAllAggregation",e,i);};s.prototype.destroyAggregation=function(e,i){this._callMethodInManagedObject("destroyAggregation",e,i);return this;};s.prototype.onBeforeRendering=function(){this._bindModel();};s.prototype.onAfterRendering=function(){var e=this;this._oShowSelBox.$().attr("tabindex","0");this._oShowSelBox.addDelegate({onkeypress:function(o){if(o.which===K.ENTER||o.which===K.SPACE){e._oSearchBtn.firePress();o.preventDefault();}}});this._oShowSelLbl.$().attr("tabindex","-1");this._oSearchBtn.$().attr("tabindex","-1");};s.prototype.exit=function(){D.media.detachHandler(this.rerender,this,D.media.RANGESETS.SAP_STANDARD);this._oSearchBtn.destroy();this._oSettingsBtn.destroy();this._oSelLstLbl.destroy();this._oSelLst.destroy();this._oScrollCont.destroy();this._oShowSelLbl.destroy();this._oShowSelBox.destroy();this._oRightPanel.destroy();this._oShowSelectedLink.destroy();};return s;});