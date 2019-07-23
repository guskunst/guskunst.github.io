/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/library","sap/ui/core/InvisibleRenderer"],function(c,I){"use strict";var T=c.TextDirection;var S={};S.render=function(r,C){var b=C.getButtons(),s=C.getSelectedButton(),B,t,a,d;if(C._bInOverflow){r.write("<div");r.writeControlData(C);r.writeClasses();r.write(">");r.renderControl(C.getAggregation("_select"));r.write("</div>");return;}r.write("<ul");if(S._addAllIconsClass(b)){r.addClass("sapMSegBIcons");}r.addClass("sapMSegB");r.writeClasses();if(C.getWidth()&&C.getWidth()!==''){r.addStyle('width',C.getWidth());}r.writeStyles();r.writeControlData(C);t=C.getTooltip_AsString();if(t){r.writeAttributeEscaped("title",t);}r.writeAccessibilityState(C,{role:"radiogroup"});r.write(">");for(var i=0;i<b.length;i++){B=b[i];if(B.getVisible()){var e=B.getText(),o=B.getIcon(),f="",g;for(var k=b.length-1;k>0;k--){if(b[k].getVisible()){b[k].addStyleClass("sapMSegBtnLastVisibleButton");break;}}if(o){g=B._getImage((B.getId()+"-img"),o);if(g instanceof sap.m.Image){C._overwriteImageOnload(g);}else if(!B.getTooltip()){f=C._getIconAriaLabel(g);}}r.write("<li");r.writeControlData(B);r.writeAttribute("aria-posinset",i+1);r.writeAttribute("aria-setsize",b.length);r.addClass("sapMSegBBtn");if(B.aCustomStyleClasses!==undefined&&B.aCustomStyleClasses instanceof Array){for(var j=0;j<B.aCustomStyleClasses.length;j++){r.addClass(B.aCustomStyleClasses[j]);}}if(B.getEnabled()){r.addClass("sapMSegBBtnFocusable");}else{r.addClass("sapMSegBBtnDis");}if(s===B.getId()){r.addClass("sapMSegBBtnSel");}if(o&&e!==''){r.addClass("sapMSegBBtnMixed");}r.writeClasses();a=B.getWidth();if(a){r.addStyle('width',a);r.writeStyles();}t=B.getTooltip_AsString();if(t){r.writeAttributeEscaped("title",t);}r.writeAttribute("tabindex",B.getEnabled()?"0":"-1");d=B.getTextDirection();if(d!==T.Inherit){r.writeAttribute("dir",d.toLowerCase());}r.writeAccessibilityState(B,{role:"radio",checked:s===B.getId()});if(g&&f!==""){if(e!==""){f+=" "+e;}else{r.writeAttributeEscaped("title",f);}r.writeAttributeEscaped("aria-label",f);}r.write('>');if(o&&g){r.renderControl(g);}if(e!==''){r.writeEscaped(e,false);}r.write("</li>");}else{I.render(r,B,"li");}}r.write("</ul>");};S._addAllIconsClass=function(b){for(var i=0;i<b.length;i++){if(!b[i].getIcon()){return false;}}return true;};return S;},true);
