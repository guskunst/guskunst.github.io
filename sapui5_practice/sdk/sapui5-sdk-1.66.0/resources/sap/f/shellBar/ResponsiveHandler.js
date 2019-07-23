/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/OverflowToolbarLayoutData","sap/ui/Device","sap/ui/core/theming/Parameters","sap/m/library"],function(O,D,P,l){"use strict";var a=l.OverflowToolbarPriority;var c;var R=function(C){c=C;this._iREMSize=parseInt(jQuery("body").css("font-size"));this._iChildControlMargin=parseInt(P.get("_sap_f_ShellBar_ChildMargin"));this._iDoubleChildControlMargin=this._iChildControlMargin*2;this._iCoPilotWidth=parseInt(P.get("_sap_f_ShellBar_CoPilotWidth"))+this._iDoubleChildControlMargin;this._iHalfCoPilotWidth=this._iCoPilotWidth/2;this._oDelegate={onAfterRendering:this.onAfterRendering,onBeforeRendering:this.onBeforeRendering};c.addDelegate(this._oDelegate,false,this);this._fnResize=this._resize;c._oOverflowToolbar.attachEvent("_controlWidthChanged",this._handleResize,this);};R.prototype.onAfterRendering=function(){this._oDomRef=c.getDomRef();if(c._oMegaMenu){this._oButton=c._oMegaMenu.getAggregation("_button");if(this._oButton&&this._oButton._image){this._oButton._image.attachEvent("load",this._updateMegaMenuWidth,this);}}this._initResize();this._handleResize();};R.prototype.onBeforeRendering=function(){if(c._oHomeIcon){c._oHomeIcon.attachEvent("load",this._updateHomeIconWidth,this);}};R.prototype.exit=function(){if(c._oOverflowToolbar){c._oOverflowToolbar.detachEvent("_controlWidthChanged",this._handleResize,this);}if(c._oHomeIcon){c._oHomeIcon.detachEvent("load",this._updateHomeIconWidth,this);}if(this._oButton){this._oButton.detachEvent("load",this._updateMegaMenuWidth,this);}c.removeDelegate(this._oDelegate);};R.prototype._initResize=function(){this._iStaticWidth=0;this._iMBWidth=this.getTargetWidth(c._oMegaMenu)+65+(2*this._iChildControlMargin);this._iTitleWidth=this.getTargetWidth(c._oSecondTitle);if(c._oHomeIcon){this._iStaticWidth+=c._oHomeIcon.$().outerWidth(true);}if(c._oNavButton){this._iStaticWidth+=36+this._iDoubleChildControlMargin;}if(c._oMenuButton){this._iStaticWidth+=36+this._iDoubleChildControlMargin;}};R.prototype._updateHomeIconWidth=function(){this._initResize();this._fnResize();};R.prototype._updateMegaMenuWidth=function(){this._initResize();this._fnResize();};R.prototype._handleResize=function(){if(!this._oDomRef){return;}var C=c.$(),w=C.outerWidth(),o=D.media.getCurrentRange("Std",w),p;if(o){p=o.name==="Phone";C.toggleClass("sapFShellBarSizeDesktop",o.name==="Desktop");C.toggleClass("sapFShellBarSizeTablet",o.name==="Tablet");C.toggleClass("sapFShellBarSizePhone",p);}if(this._iPreviousWidth===w){return;}this._iPreviousWidth=w;if(!c._oNavButton&&!c._oMenuButton&&!c._oHomeIcon&&!c._oMegaMenu&&!c._oSecondTitle&&!c._oCopilot){return;}if(p&&!this.bWasInPhoneRange){this._fnResize=this._resizeOnPhone;this._transformToPhoneState();return;}else if(!p&&this.bWasInPhoneRange){this._fnResize=this._resize;this._transformToRegularState();return;}setTimeout(this._fnResize.bind(this),0);};R.prototype._transformToPhoneState=function(){if(c._oSecondTitle){c._oSecondTitle.setVisible(false);}if(c._oHomeIcon){c._oHomeIcon.setVisible(false);if(c._oMegaMenu){c._oMegaMenu.setWidth("auto").setText("").setIcon(c.getHomeIcon());}}this._cacheControlsLayoutData();c._aOverflowControls.forEach(function(c){c.setLayoutData(new O({priority:a.AlwaysOverflow}));});this.bWasInPhoneRange=true;c.invalidate();};R.prototype._transformToRegularState=function(){if(c._oSecondTitle){c._oSecondTitle.setVisible(true);}if(c._oHomeIcon){c._oHomeIcon.setVisible(true);if(c._oMegaMenu){c._oMegaMenu.setWidth("auto").setText(c._sTitle).setIcon("");}}this._restoreControlsLayoutData();this.bWasInPhoneRange=false;c.invalidate();};R.prototype._resizeOnPhone=function(){var w,A;if(c._oCopilot){w=c.$().width()-this._iCoPilotWidth;A=(w/2)-this._iStaticWidth;}else{w=c.$().width();A=w-this._iStaticWidth-this._getWidthOfAllNonManagedControls();}if(!c._oHomeIcon&&c._sTitle){if(this._iMBWidth>=A){c._oMegaMenu.setWidth((A-this._iDoubleChildControlMargin)+"px");}else{c._oMegaMenu.setWidth((this._iMBWidth-this._iDoubleChildControlMargin)+"px");}}if(c._oMegaMenu){A-=c._oMegaMenu.$().outerWidth(true);}if(A<0){A=0;}c._oControlSpacer.setWidth(A+"px");};R.prototype._resize=function(){var w=c.$().width(),A,o;if(!c._oCopilot){o=this._getWidthOfAllNonManagedControls();A=w-o-this._iStaticWidth-(8*this._iREMSize);this._adaptManagedWidthControls(A);return;}A=(w/2)-this._iHalfCoPilotWidth-this._iStaticWidth;this._adaptManagedWidthControls(A);};R.prototype._getWidthOfAllNonManagedControls=function(){var C=c._oOverflowToolbar.$().children(),o=0;C.filter(function(i,d){var $=jQuery(d),b=$.control(0);if(b===c._oNavButton){return false;}if(b===c._oMenuButton){return false;}if(b===c._oHomeIcon){return false;}if(b===c._oMegaMenu){return false;}if(b===c._oSecondTitle){return false;}if(b===c._oControlSpacer){return false;}if(b===c._oToolbarSpacer){return false;}o+=$.outerWidth(true);return true;});return o;};R.prototype._adaptManagedWidthControls=function(A){var h=c._sTitle,m=h?this._iMBWidth:36+this._iDoubleChildControlMargin,t=this._iTitleWidth,C=m+t,s=c._oSecondTitle,M=c._oMegaMenu,o=c._oControlSpacer,S;if(!M){C-=36+this._iDoubleChildControlMargin;}if(C<0){C=0;}if(m<0){m=0;}if(m>=A){o&&o.setWidth("0px");s&&s.setWidth("0px");h&&M.setWidth((A-this._iDoubleChildControlMargin)+"px");return;}else{h&&M.setWidth((m-this._iDoubleChildControlMargin)+"px");}if(A>=m&&A<=C){S=A-m;if(S<0){S=0;}if(S>32){o&&o.setWidth("0px");s&&s.setWidth(S+"px");}else{o&&o.setWidth(S+"px");s&&s.setWidth("0px");}return;}else{s&&s.setWidth(t+"px");}if(A>C){o&&o.setWidth((A-C)+"px");}};R.prototype._cacheControlsLayoutData=function(){this._oCachedLayoutData={};c._aOverflowControls.forEach(function(C){this._oCachedLayoutData[C.getId()]=C.getLayoutData();}.bind(this));};R.prototype._restoreControlsLayoutData=function(){c._aOverflowControls.forEach(function(C){var L=this._oCachedLayoutData[C.getId()];if(L){C.setLayoutData(L);}}.bind(this));};R.prototype.getTargetWidth=function(C,b){if(!C){return 0;}var t=C.getText(),d=document.createElement("div"),T=document.createTextNode(t),s=sap.ui.getCore().getStaticAreaRef(),w;d.appendChild(T);d.style.setProperty("white-space","nowrap");d.style.setProperty("display","inline-block");d.style.setProperty("font-size","0.875rem");if(b){d.style.setProperty("font-weight","bold");}s.appendChild(d);if(d.getBoundingClientRect){w=d.getBoundingClientRect().width;}else{w=d.scrollWidth;}w+=1;s.removeChild(d);return w;};return R;});
