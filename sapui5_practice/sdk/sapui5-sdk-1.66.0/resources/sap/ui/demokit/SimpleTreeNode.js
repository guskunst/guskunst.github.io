/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/Element','sap/ui/core/Icon'],function(E,I){"use strict";var S=E.extend("sap.ui.demokit.SimpleTreeNode",{metadata:{library:"sap.ui.demokit",properties:{text:{type:"string",defaultValue:null},ref:{type:"string",defaultValue:null},expanded:{type:"boolean",defaultValue:false},isSelected:{type:"boolean",defaultValue:false}},defaultAggregation:"nodes",aggregations:{nodes:{type:"sap.ui.demokit.SimpleTreeNode",multiple:true,singularName:"node",bindable:"bindable"},_iconControl:{type:"sap.ui.core.Icon",multiple:false,visibility:"hidden"}},events:{selected:{}}}});S.ANIMATION_DURATION=600;S.prototype.init=function(){this._bIsRTL=sap.ui.getCore().getConfiguration().getRTL();var i=new I({useIconTooltip:false}).addStyleClass('sapDkSimpleTreeNodeIconCol');if(this._bIsRTL){i.setSrc("sap-icon://navigation-left-arrow");}else{i.setSrc("sap-icon://navigation-right-arrow");}this.setAggregation("_iconControl",i,true);};S.prototype.expand=function(e){this._executeExpandCollapse(true,e);};S.prototype.collapse=function(c){this._executeExpandCollapse(false,c);};S.prototype.setExpanded=function(e){if(this.getExpanded()!==e){this.setProperty("expanded",e,false);this._toggleNodeArrow(e);}return this;};S.prototype._executeExpandCollapse=function(s,r){this._toggleNodeExpandedProperty(s);this._toggleNodeArrow(s);this._toggleDirectChildrenVisibility(this.$(),s);this._toggleNodeBottomBorder(this.$(),s);if(r){this._expandCollapseChildrenRecursively(s);}};S.prototype._toggleNodeExpandedProperty=function(s){this.setProperty("expanded",false,true);if(s&&!this.getExpanded()&&this.getNodes().length>0){this.setProperty("expanded",true,true);}};S.prototype._toggleNodeArrow=function(s){var i=this.getAggregation("_iconControl");if(s&&((i.getSrc().indexOf("navigation-right-arrow")>-1)||(i.getSrc().indexOf("navigation-left-arrow")>-1))){i.removeStyleClass("sapDkSimpleTreeNodeIconCol");i.addStyleClass("sapDkSimpleTreeNodeIconExp");i.setSrc("navigation-down-arrow");}else if(!s&&i.getSrc().indexOf("navigation-down-arrow")>-1){i.removeStyleClass("sapDkSimpleTreeNodeIconExp");i.addStyleClass("sapDkSimpleTreeNodeIconCol");if(this._bIsRTL){i.setSrc("navigation-left-arrow");}else{i.setSrc("navigation-right-arrow");}}};S.prototype._toggleDirectChildrenVisibility=function(d,s){var l=d.children("ul");if((s&&l.hasClass("sapDkSimpleTreeHiddenChildrenNodes"))||(!s&&l.hasClass("sapDkSimpleTreeVisibleChildrenNodes"))){l.toggleClass("sapDkSimpleTreeHiddenChildrenNodes");l.toggleClass("sapDkSimpleTreeVisibleChildrenNodes");this._executeExpandCollapseAnimation(l,s);}if(!s&&d.children("a").last().attr("aria-expanded")==="true"){d.children("a").last().attr("aria-expanded","false");}else if(s&&this.getNodes().length>0){d.children("a").last().attr("aria-expanded","true");}};S.prototype._executeExpandCollapseAnimation=function(d,s){if(s){d.css({display:'none'});d.show(S.ANIMATION_DURATION);}else{d.css({display:'block'});d.hide(S.ANIMATION_DURATION);}};S.prototype._toggleNodeBottomBorder=function(d,s){if((s&&d.hasClass("sapDkSimpleTreeNodeFirstLvlRootCol"))||(!s&&d.hasClass("sapDkSimpleTreeNodeFirstLvlRootExp"))){d.toggleClass("sapDkSimpleTreeNodeFirstLvlRootCol sapDkSimpleTreeNodeFirstLvlRootExp");}};S.prototype._expandCollapseChildrenRecursively=function(s){var c=this.getNodes();for(var i=0;i<c.length;i++){if(s){c[i].expand(true);}else{c[i].collapse(true);}}};S.prototype._selectNode=function(s,e){if(!e.target.classList.contains("sapUiIcon")){this.fireSelected();this._refreshNodeSelection(this.$());}else if(s){this.expand();}else{this.collapse();}e.preventDefault();e.stopPropagation();};S.prototype._refreshNodeSelection=function(d){var t=this._getTree();this._clearPreviousNodeSelection(t);this._setNodeSelection(d,t);};S.prototype._getTree=function(){var p=this.getParent();while(p instanceof S){p=p.getParent();}return p;};S.prototype._clearPreviousNodeSelection=function(t){if(t.sSelectedNodeId===null){return;}var p=sap.ui.getCore().byId(t.sSelectedNodeId);if(p){p.setProperty("isSelected",false,true);p.$().children("a").removeClass("sapDkSimpleTreeNodeSelected");p.$().children("a").removeAttr("aria-selected");}};S.prototype._setNodeSelection=function(d,t){this.setProperty("isSelected",true,true);t.sSelectedNodeId=this.getId();d.children("a").last().addClass("sapDkSimpleTreeNodeSelected");d.children("a").last().attr("aria-selected","true");};S.prototype.onclick=function(e){this._selectNode(!this.getExpanded(),e);};S.prototype.ontap=function(e){e.preventDefault();};S.prototype.onsapselect=function(e){this._selectNode(!this.getExpanded(),e);};S.prototype.onsapleft=function(e){this._selectNode(this._bIsRTL?true:false,e);};S.prototype.onsapright=function(e){this._selectNode(this._bIsRTL?false:true,e);};S.prototype._getDomRefs=function(d){d.push(this.$().children("a")[0]);var n=this.getNodes();for(var i=0;i<n.length;i++){n[i]._getDomRefs(d);}};return S;});
