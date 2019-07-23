/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/Renderer','sap/ui/core/IconPool','sap/m/library','sap/ui/Device','sap/ui/core/InvisibleText','sap/ui/core/library'],function(R,I,l,D,a,c){"use strict";var T=c.TextDirection;var V=c.ValueState;var S=l.SelectType;var b={};b.CSS_CLASS="sapMSlt";b.render=function(r,s){var t=s.getTooltip_AsString(),d=s.getType(),A=s.getAutoAdjustWidth(),e=s.getEditable(),E=s.getEnabled(),C=s.getWidth(),w=C.indexOf("%")>-1,f=A||C==="auto"||w,g=b.CSS_CLASS;r.write("<div");this.addClass(r,s);r.addClass(g);r.addClass(g+s.getType());if(!E){r.addClass(g+"Disabled");}else if(!e){r.addClass(g+"Readonly");}if(f&&(d===S.Default)){r.addClass(g+"MinWidth");}if(A){r.addClass(g+"AutoAdjustedWidth");}else{r.addStyle("width",C);}if(s.getIcon()){r.addClass(g+"WithIcon");}if(E&&e&&D.system.desktop){r.addClass(g+"Hoverable");}r.addClass(g+"WithArrow");if(s.getValueState()!==V.None){this.addValueStateClasses(r,s);}r.addStyle("max-width",s.getMaxWidth());r.writeControlData(s);r.writeStyles();r.writeClasses();this.writeAccessibilityState(r,s);if(t){r.writeAttributeEscaped("title",t);}else if(d===S.IconOnly){var i=I.getIconInfo(s.getIcon());if(i){r.writeAttributeEscaped("title",i.text);}}if(E){r.writeAttribute("tabindex","0");}r.write(">");this.renderHiddenInput(r,s);this.renderLabel(r,s);switch(d){case S.Default:this.renderArrow(r,s);break;case S.IconOnly:this.renderIcon(r,s);break;}var L=s.getList();if(s._isShadowListRequired()&&L){this.renderShadowList(r,L);}if(s.getName()){this.renderInput(r,s);}r.write("</div>");};b.renderHiddenInput=function(r,s){r.write("<input");r.writeAttribute("id",s.getId()+"-hiddenInput");r.writeAttribute("aria-readonly","true");r.writeAttribute("tabindex","-1");r.addClass("sapUiPseudoInvisibleText");r.writeClasses();r.write(" />");};b.renderLabel=function(r,s){var o=s.getSelectedItem(),t=s.getTextDirection(),d=R.getTextAlign(s.getTextAlign(),t),C=b.CSS_CLASS;r.write("<label");r.writeAttribute("id",s.getId()+"-label");r.writeAttribute("for",s.getId());r.writeAttribute("aria-live","polite");r.addClass(C+"Label");if(s.getValueState()!==V.None){r.addClass(C+"LabelState");r.addClass(C+"Label"+s.getValueState());}if(s.getType()===S.IconOnly){r.addClass("sapUiPseudoInvisibleText");}if(t!==T.Inherit){r.writeAttribute("dir",t.toLowerCase());}if(d){r.addStyle("text-align",d);}r.writeStyles();r.writeClasses();r.write(">");if(s.getType()!==S.IconOnly){r.renderControl(s._getValueIcon());r.write("<span");r.addClass("sapMSelectListItemText");r.writeAttribute("id",s.getId()+"-labelText");r.writeClasses();r.write(">");o&&o.getParent()?r.writeEscaped(o.getText()):"";r.write("</span>");}r.write("</label>");};b.renderArrow=function(r,s){var C=b.CSS_CLASS;r.write("<span");r.addClass(C+"Arrow");if(s.getValueState()!==V.None){r.addClass(C+"ArrowState");}r.writeAttribute("id",s.getId()+"-arrow");r.writeClasses();r.write("></span>");};b.renderIcon=function(r,s){r.writeIcon(s.getIcon(),b.CSS_CLASS+"Icon",{id:s.getId()+"-icon",title:null});};b.renderInput=function(r,s){r.write("<input hidden");r.writeAttribute("id",s.getId()+"-input");r.addClass(b.CSS_CLASS+"Input");r.writeAttribute("aria-hidden","true");r.writeAttribute("tabindex","-1");if(!s.getEnabled()){r.write("disabled");}r.writeClasses();r.writeAttributeEscaped("name",s.getName());r.writeAttributeEscaped("value",s.getSelectedKey());r.write("/>");};b.renderShadowList=function(r,L){var o=L.getRenderer();o.writeOpenListTag(r,L,{elementData:false});this.renderShadowItems(r,L);o.writeCloseListTag(r,L);};b.renderShadowItems=function(r,L){var o=L.getRenderer(),s=L.getItems().length,d=L.getSelectedItem();for(var i=0,e=L.getItems();i<e.length;i++){o.renderItem(r,L,e[i],{selected:d===e[i],setsize:s,posinset:i+1,elementData:false});}};b.addClass=function(r,s){};b.addValueStateClasses=function(r,s){r.addClass(b.CSS_CLASS+"State");r.addClass(b.CSS_CLASS+s.getValueState());};b.getAriaRole=function(s){switch(s.getType()){case S.Default:return"combobox";case S.IconOnly:return"button";}};b._getValueStateString=function(s){var C="sap.ui.core";switch(s.getValueState()){case V.Success:return a.getStaticId(C,"VALUE_STATE_SUCCESS");case V.Warning:return a.getStaticId(C,"VALUE_STATE_WARNING");case V.Information:return a.getStaticId(C,"VALUE_STATE_INFORMATION");}return"";};b.writeAccessibilityState=function(r,s){var v=this._getValueStateString(s),o=s.getSelectedItem();if(v){v=" "+v;}var d;if(o&&!o.getText()&&o.getIcon&&o.getIcon()){var i=I.getIconInfo(o.getIcon());if(i){d=i.text||i.name;}}r.writeAccessibilityState(s,{role:this.getAriaRole(s),disabled:!s.getEnabled(),readonly:s.getEnabled()&&!s.getEditable(),expanded:s.isOpen(),invalid:(s.getValueState()===V.Error)?true:undefined,labelledby:{value:d?s._getValueIcon().getId():s.getId()+"-label"+v,append:true},haspopup:(s.getType()===S.IconOnly)?true:undefined});};return b;},true);
