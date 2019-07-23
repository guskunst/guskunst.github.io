/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/Device"],function(D){"use strict";var O={};O.render=function(r,c){var s,h=c.getHeaderTitle(),a=null,R=sap.uxap.ObjectPageLayout._getLibraryResourceBundle(),i=c.getHeaderContent()&&c.getHeaderContent().length>0&&c.getShowHeaderContent(),I=c.getShowTitleInHeaderContent()&&c.getShowHeaderContent(),b=i||I,u=c.getUseIconTabBar(),t=c.getToggleHeaderOnTitleClick()&&c.getHeaderTitle()&&c.getHeaderTitle().supportsToggleHeaderOnTitleClick(),d=c._getAriaLabelText("ROOT"),H=c._getAriaLabelText("HEADER"),n=c._getAriaLabelText("NAVIGATION"),B=c.getBackgroundDesignAnchorBar(),l=c.getLandmarkInfo(),e=c._getHeaderTag(l),f=c._getFooterTag(l),g=l&&l.getHeaderRole(),j=l&&l.getHeaderLabel(),k=l&&l.getRootRole(),m=l&&l.getRootLabel(),N=l&&l.getNavigationRole(),o=l&&l.getNavigationLabel();if(c.getShowAnchorBar()&&c._getInternalAnchorBarVisible()){a=c.getAggregation("_anchorBar");}r.write("<div");r.writeControlData(c);if(!k){r.writeAttribute("role","main");}r.writeAttribute("aria-roledescription",R.getText("ROOT_ROLE_DESCRIPTION"));if(!m){r.writeAttributeEscaped("aria-label",d);}r.addClass("sapUxAPObjectPageLayout");if(t){r.addClass("sapUxAPObjectPageLayoutTitleClickEnabled");}if(a){r.addClass("sapUxAPObjectPageLayoutWithNavigation");}r.writeClasses();r.addStyle("height",c.getHeight());r.writeStyles();r.writeAccessibilityState(c,c._formatLandmarkInfo(l,"Root"));r.write(">");if(D.system.desktop){r.renderControl(c._getCustomScrollBar().addStyleClass("sapUxAPObjectPageCustomScroller"));}r.write("<"+e+" ");if(!g){r.writeAttribute("role","banner");}r.writeAttribute("aria-roledescription",R.getText("HEADER_ROLE_DESCRIPTION"));if(!j){r.writeAttributeEscaped("aria-label",H);}r.writeAttributeEscaped("id",c.getId()+"-headerTitle");r.writeAttribute("data-sap-ui-customfastnavgroup",true);r.addClass("sapUxAPObjectPageHeaderTitle");r.addClass("sapContrastPlus");r.writeClasses();r.writeAccessibilityState(c,c._formatLandmarkInfo(l,"Header"));r.write(">");if(h){r.renderControl(h);}this._renderHeaderContentDOM(r,c,b&&c._bHeaderInTitleArea,"-stickyHeaderContent");r.write("<div ");r.writeAttributeEscaped("id",c.getId()+"-stickyAnchorBar");if(!N){r.writeAttribute("role","navigation");}r.writeAttribute("aria-roledescription",R.getText("NAVIGATION_ROLE_DESCRIPTION"));if(!o){r.writeAttributeEscaped("aria-label",n);}if(!c._bHeaderInTitleArea){r.writeAttribute("aria-hidden","true");}r.addClass("sapUxAPObjectPageStickyAnchorBar");r.addClass("sapUxAPObjectPageNavigation");if(B){r.addClass("sapUxAPObjectPageNavigation"+B);}r.writeClasses();r.writeAccessibilityState(c,c._formatLandmarkInfo(l,"Navigation"));r.write(">");this._renderAnchorBar(r,c,a,c._bHeaderInTitleArea);r.write("</div>");r.write("</"+e+">");r.write("<div ");r.writeAttributeEscaped("id",c.getId()+"-opwrapper");r.addClass("sapUxAPObjectPageWrapper");if(h&&(!h.supportsTitleInHeaderContent()||!(c.getShowTitleInHeaderContent()&&h.getShowTitleSelector()))){r.addClass("sapUxAPObjectPageWrapperTransform");}r.writeClasses();r.write(">");r.write("<div ");r.writeAttributeEscaped("id",c.getId()+"-scroll");r.addClass("sapUxAPObjectPageScroll");r.writeClasses();r.write(">");this._renderHeaderContentDOM(r,c,b&&!c._bHeaderInTitleArea,"-headerContent",true);r.write("<section ");r.writeAttributeEscaped("id",c.getId()+"-anchorBar");if(!N){r.writeAttribute("role","navigation");}r.writeAttribute("aria-roledescription",R.getText("NAVIGATION_ROLE_DESCRIPTION"));if(!o){r.writeAttributeEscaped("aria-label",n);}r.addClass("sapUxAPObjectPageNavigation");r.addClass("sapContrastPlus");if(B){r.addClass("sapUxAPObjectPageNavigation"+B);}r.writeClasses();r.writeAccessibilityState(c,c._formatLandmarkInfo(l,"Navigation"));r.write(">");this._renderAnchorBar(r,c,a,!c._bHeaderInTitleArea);r.write("</section>");r.write("<section");r.addClass("sapUxAPObjectPageContainer");r.writeAttributeEscaped("id",c.getId()+"-sectionsContainer");r.addClass("ui-helper-clearfix");if(!a){r.addClass("sapUxAPObjectPageContainerNoBar");}r.writeClasses();r.writeAccessibilityState(c,c._formatLandmarkInfo(l,"Content"));r.write(">");s=c._getSectionsToRender();if(Array.isArray(s)){s.forEach(function(S){r.renderControl(S);if(u){c._oCurrentTabSection=S;}});}r.write("</section>");this.renderFooterContent(r,c);r.write("<div");r.writeAttributeEscaped("id",c.getId()+"-spacer");r.write("></div>");r.write("</div>");r.write("</div>");this._renderFooterContentInternal(r,c,f,l,R);r.write("</div>");};O._renderAnchorBar=function(r,c,a,R){var s=c.getAggregation("sections"),h;if(R){h=c._getHeaderContent();if(c.getIsChildPage()&&h&&h.supportsChildPageDesign()){r.write("<div ");r.writeAttributeEscaped("id",c.getId()+"-childPageBar");if(Array.isArray(s)&&s.length>1){r.addClass('sapUxAPObjectChildPage');}r.writeClasses();r.write("></div>");}if(a){r.renderControl(a);}}};O._renderHeaderContentDOM=function(r,c,R,i,a){r.write("<header ");r.writeAttributeEscaped("id",c.getId()+i);r.addClass("ui-helper-clearfix");r.addClass("sapUxAPObjectPageHeaderDetails");r.addClass("sapUxAPObjectPageHeaderDetailsDesign-"+c._getHeaderDesign());if(a){r.addClass("sapContrastPlus");}r.writeClasses();r.writeAttribute("data-sap-ui-customfastnavgroup",true);r.write(">");if(R){this.renderHeaderContent(r,c);}r.write("</header>");};O.renderHeaderContent=function(r,c){r.renderControl(c._getHeaderContent());};O.renderFooterContent=function(r,c){};O._renderFooterContentInternal=function(r,o,f,l,R){var F=o.getFooter(),b=l&&l.getFooterRole();if(!F){return;}r.write("<"+f);r.writeAttributeEscaped("id",o.getId()+"-footerWrapper");r.addClass("sapUxAPObjectPageFooter sapMFooter-CTX sapContrast sapContrastPlus");if(!o.getShowFooter()){r.addClass("sapUiHidden");}r.writeClasses();if(!b){r.writeAttribute("role","region");}r.writeAttribute("aria-roledescription",R.getText("FOOTER_ROLE_DESCRIPTION"));r.writeAccessibilityState(o,o._formatLandmarkInfo(l,"Footer"));r.write(">");F.addStyleClass("sapUxAPObjectPageFloatingFooter");r.renderControl(F);r.write("</"+f+">");};O._rerenderHeaderContentArea=function(r,c){var h=c._bHeaderInTitleArea?"stickyHeaderContent":"headerContent",$;this.renderHeaderContent(r,c);$=c.$(h)[0];if($){r.flush($);}};return O;},true);
