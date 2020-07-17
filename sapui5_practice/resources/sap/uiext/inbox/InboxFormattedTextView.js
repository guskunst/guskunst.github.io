/*!
 * SAPUI5
 * 
 * (c) Copyright 2009-2019 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.uiext.inbox.InboxFormattedTextView");sap.ui.commons.FormattedTextView.extend("sap.uiext.inbox.InboxFormattedTextView",{metadata:{properties:{wrapping:{type:"boolean",defaultValue:true},maxLines:{type:"int",defaultValue:1}}},renderer:function(r,c){sap.ui.commons.FormattedTextViewRenderer.render.apply(this,arguments);}});
sap.uiext.inbox.InboxFormattedTextView.prototype.applyStylingToFormattedTextDiv=function(f){if(f){if(this.getWrapping()&&this.getMaxLines()>0){if(!this.canUseNativeLineClamp()){this.clampHeight();jQuery(f).css({"text-overflow":"ellipsis","overflow":"hidden","max-width":"100%"});}else{jQuery(f).css({"display":"-webkit-box","-webkit-box-orient":"vertical","overflow":"hidden","-webkit-line-clamp":this.getMaxLines()+""});}}else if(!this.getWrapping()){jQuery(f).css({"text-overflow":"ellipsis","overflow":"hidden","max-width":"100%","whitespace":"nowrap"});}}};
sap.uiext.inbox.InboxFormattedTextView.prototype.setMaxLines=function(v){this.setProperty('maxLines',v);var f=this.getTextDomRef();this.applyStylingToFormattedTextDiv(f);return this;};
sap.uiext.inbox.InboxFormattedTextView.prototype.onAfterRendering=function(){var t=this.getTextDomRef();this.applyStylingToFormattedTextDiv(t);};
sap.uiext.inbox.InboxFormattedTextView.hasNativeLineClamp=(function(){return(typeof document.documentElement.style.webkitLineClamp!='undefined');});
sap.uiext.inbox.InboxFormattedTextView.prototype.canUseNativeLineClamp=function(){if(!sap.uiext.inbox.InboxFormattedTextView.hasNativeLineClamp()){return false;}return true;};
sap.uiext.inbox.InboxFormattedTextView.prototype.getClampHeight=function(d){var t=d||this.getTextDomRef();return(this.getMaxLines()*this.getLineHeight(t));};
sap.uiext.inbox.InboxFormattedTextView.prototype.setHtmlText=function(t){if(sap.ui.commons.FormattedTextView.prototype.setHtmlText){sap.ui.commons.FormattedTextView.prototype.setHtmlText.apply(this,arguments);}else{this.setProperty("htmlText",t);}if(this.isClamped()){this.getParent().getAggregation("taskDescriptionLink").setVisible(true);}};
sap.uiext.inbox.InboxFormattedTextView.prototype.clampHeight=function(d){var t=d||this.getTextDomRef();if(!t){return 0;}var c=this.getClampHeight(t);t.style.maxHeight=c+'px';return c;};
sap.uiext.inbox.InboxFormattedTextView.prototype.getTextDomRef=function(){var t=this.getDomRef();return t&&(t.firstElementChild||t);};
sap.uiext.inbox.InboxFormattedTextView.prototype.getLineHeight=function(d){var t=d||this.getTextDomRef();var l,s;if(!t){return;}if(window.getComputedStyle!==undefined){s=window.getComputedStyle(t);}else{s={};s.lineHeight=document.getElementById(t.id).currentStyle.lineHeight;s.fontSize=document.getElementById(t.id).currentStyle.fontSize;}l=parseFloat(s.lineHeight);if(!l){l=parseFloat(s.fontSize)*this.normalLineHeight;}var L=Math.floor(l);return L;};
sap.uiext.inbox.InboxFormattedTextView.prototype.isClamped=function(d,e){var t=d||this.getTextDomRef();if(!t){return;}var T=this.getHtmlText(true);var c=this.getClampHeight(t);var i=e||T.length;t.textContent=T.slice(0,i);if(t.scrollHeight>c){return true;}return false;};
sap.uiext.inbox.InboxFormattedTextView.prototype.removeClamp=function(d){var t=d||this.getTextDomRef();if(!t){return}jQuery(t).css("-webkit-line-clamp",'');jQuery(t).css("max-height",'');jQuery(t).css("height",'auto');};
sap.ui.core.Control.extend("sap.uiext.inbox.InboxTaskDetails",{metadata:{properties:{showMore:{type:"string",defaultValue:'auto'}},aggregations:{fTV:{type:"sap.ui.commons.FormattedTextView",multiple:false,visibility:"public"},taskDescriptionLink:{type:"sap.ui.commons.Link",multiple:false,visibility:"hidden"}},events:{showMoreClick:{enablePreventDefault:true}}},init:function(){var t=this;this._oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.uiext.inbox");this.setAggregation('taskDescriptionLink',new sap.ui.commons.Link({text:t._oBundle.getText("INBOX_SHOW_MORE_TEXT"),tooltip:t._oBundle.getText("INBOX_SHOW_MORE_LINK_TOOLTIP"),visible:false}).attachPress(jQuery.proxy(this.showMoreClick,this)));},renderer:{render:function(r,c){r.write("<div");r.writeControlData(c);r.addClass("inboxTaskDetails");r.writeClasses();r.write(">");r.write("<div");r.addClass("fTV");r.writeClasses();r.writeStyles();r.write(">");r.renderControl(c.getAggregation("fTV"));r.write("</div>");if(c.getAggregation('taskDescriptionLink').getVisible()){r.write("<div");r.addClass("taskDescriptionLink");r.writeClasses();r.writeStyles();r.write(">");r.renderControl(c.getAggregation("taskDescriptionLink"));r.write("</div>");}r.write("</div>");}},onAfterRendering:function(){var f=this.getAggregation('fTV');if(this.getShowMore()==='true'||(f.isClamped()&&this.getShowMore()==='auto')){this.getAggregation('taskDescriptionLink').setVisible(true);}},showMoreClick:function(e){var _=sap.ui.getCore().getLibraryResourceBundle("sap.uiext.inbox");var s=_.getText("INBOX_SHOW_MORE_TEXT");var S=_.getText("INBOX_SHOW_LESS_TEXT");if(e.getSource().getText()===s){e.getSource().setText(_.getText("INBOX_SHOW_LESS_TEXT"));e.getSource().setTooltip(_.getText("INBOX_SHOW_LESS_LINK_TOOLTIP"));this.fireShowMoreClick({text:s});}else{e.getSource().setText(s);e.getSource().setTooltip(_.getText("INBOX_SHOW_MORE_LINK_TOOLTIP"));this.fireShowMoreClick({text:S});}}});