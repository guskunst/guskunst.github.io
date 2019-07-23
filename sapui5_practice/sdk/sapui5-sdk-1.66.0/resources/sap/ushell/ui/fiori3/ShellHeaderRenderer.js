// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(['sap/ushell/resources','sap/ui/Device',"sap/ushell/Config"],function(r,D,C){"use strict";var S={};S.render=function(a,h){var i=h.getId();a.write("<div");a.writeControlData(h);a.writeAccessibilityState({label:h.getAriaLabel(),role:"banner"});a.addClass("sapUshellShellHeader sapUshellShellCntnt");a.writeClasses();a.write(">");a.write("<div tabindex='0' id='sapUshellHeaderAccessibilityHelper'></div>");a.write("<div id='",i,"-hdr-begin' class='sapUshellShellHeadBegin'>");this.renderHeaderItems(a,h);this.renderLogo(a,h);a.renderControl(h.getAppTitle());this.renderTitle(a,h);a.write("</div>");var c=h.getCentralControl();if(c){a.write("<div id='",i,"-hdr-center' class='sapUshellShellHeadCenter' >");a.renderControl(c);a.write("</div>");}a.write("<div id='",i,"-hdr-search-container' class='sapUshellShellHeadSearchContainer' >");this.renderSearch(a,h);a.write("</div>");a.write("<div id='",i,"-hdr-end' class='sapUshellShellHeadEnd'>");this.renderHeaderEndItems(a,h);a.write("</div>");a.write("</div>");};S.renderSearch=function(a,h){var s=h.getSearch();a.write("<div id='",h.getId(),"-hdr-search'");a.addClass("sapUshellShellSearch");if(D.system.desktop){a.addClass("sapUiSizeCompact");}a.writeClasses();a.addStyle("max-width",h.getSearchWidth()+"rem");a.writeStyles();a.write(">");if(s){a.renderControl(s);}a.write("</div>");};S.renderTitle=function(a,h){var c;var t=h.getTitle();if(t&&t.getText()){c=h.getAppTitle()?"sapUshellShellHeadSubtitle":"sapUshellShellHeadTitle";a.write("<div id='",h.getId(),"-hdr-title' class='"+c+"'");a.write(">");a.renderControl(t);a.write("</div>");}};S.renderHeaderItems=function(a,h){var I=h.getHeadItems();for(var i=0;i<I.length;i++){if(I[i].getId()==="homeBtn"&&h.getShowLogo()){continue;}a.renderControl(I[i]);}};S.renderHeaderEndItems=function(a,h){h.getHeadEndItems().forEach(a.renderControl);};S.renderLogo=function(a,h){var A=r.i18n.getText("homeBtn_tooltip"),t=r.i18n.getText("homeBtn_tooltip_text"),i=h._getLogo(),c=h.getShowLogo()?"sapUshellShellIco":"sapUshellShellHideIco";c+=h.isHomepage()?" sapUshellLogoLinkDisabled":"";a.write("<a");a.addClass(c);a.writeAttribute("id",h.getId()+"-logo");a.writeClasses();if(!h.isHomepage()){a.writeAttribute("tabindex","0");a.writeAttribute("title",t);a.writeAttributeEscaped("href",h.getHomeUri());a.writeAccessibilityState({label:A,role:"button"});}a.write(">");a.write("<img id='",h.getId(),"-icon'");a.writeAttribute("role","presentation");a.write("src='");a.writeEscaped(i);a.write("'");if(!i){a.write(" style='display:none;'");}a.write("></a>");};return S;},true);
