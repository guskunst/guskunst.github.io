/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/Device','./InputBase','./DateTimeField','sap/ui/core/date/UniversalDate','./library','sap/ui/core/Control','sap/ui/core/library',"./DatePickerRenderer","sap/base/util/deepEqual","sap/base/assert","sap/base/Log","sap/ui/core/IconPool","sap/ui/core/Popup","./InstanceManager","sap/ui/dom/jquery/cursorPos"],function(q,D,I,a,U,l,C,c,b,d,e,L,f,P,g){"use strict";var T=c.TextAlign;var h=c.CalendarType;var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");var i;var j;var k=a.extend("sap.m.DatePicker",{metadata:{library:"sap.m",properties:{displayFormatType:{type:"string",group:"Appearance",defaultValue:""},secondaryCalendarType:{type:"sap.ui.core.CalendarType",group:"Appearance",defaultValue:null},minDate:{type:"object",group:"Misc",defaultValue:null},maxDate:{type:"object",group:"Misc",defaultValue:null}},aggregations:{specialDates:{type:"sap.ui.core.Element",multiple:true,singularName:"specialDate"}},associations:{legend:{type:"sap.ui.core.Control",multiple:false}},events:{navigate:{parameters:{dateRange:{type:"sap.ui.unified.DateRange"},afterPopupOpened:{type:"boolean"}}}},designtime:"sap/m/designtime/DatePicker.designtime",dnd:{draggable:false,droppable:true}}});k.prototype.init=function(){a.prototype.init.apply(this,arguments);this._bIntervalSelection=false;this._bOnlyCalendar=true;this._bValid=true;this._oMinDate=new Date(1,0,1);this._oMinDate.setFullYear(1);this._oMaxDate=new Date(9999,11,31,23,59,59,999);var w=this.addEndIcon({id:this.getId()+"-icon",src:this.getIconSrc(),noTabStop:true,tooltip:r.getText("OPEN_PICKER_TEXT")});this._bShouldClosePicker=false;w.addEventDelegate({onmousedown:function(E){this._bShouldClosePicker=!!this.isOpen();}},this);w.attachPress(function(){this.toggleOpen(this._bShouldClosePicker);},this);};k.prototype.isValidValue=function(){return this._bValid;};k.prototype.isOpen=function(){return this._oPopup&&this._oPopup.isOpen();};k.prototype.toggleOpen=function(O){if(this.getEditable()&&this.getEnabled()){if(O){n.call(this);}else{_.call(this);}}};k.prototype.getIconSrc=function(){return f.getIconURI("appointment-2");};k.prototype.exit=function(){I.prototype.exit.apply(this,arguments);if(this._oPopup){if(this._oPopup.isOpen()){this._oPopup.close();}delete this._oPopup;}if(this._oCalendar){this._oCalendar.destroy();delete this._oCalendar;}if(this._iInvalidateCalendar){clearTimeout(this._iInvalidateCalendar);}this._sUsedDisplayPattern=undefined;this._sUsedDisplayCalendarType=undefined;this._oDisplayFormat=undefined;this._sUsedValuePattern=undefined;this._sUsedValueCalendarType=undefined;this._oValueFormat=undefined;};k.prototype.invalidate=function(O){if(!O||O!=this._oCalendar){C.prototype.invalidate.apply(this,arguments);this._iInvalidateCalendar=setTimeout(v.bind(this),0);}};k.prototype.onBeforeRendering=function(){a.prototype.onBeforeRendering.apply(this,arguments);this._checkMinMaxDate();var V=this._getValueHelpIcon();if(V){V.setProperty("visible",this.getEditable(),true);}};k.prototype.setWidth=function(w){return I.prototype.setWidth.call(this,w||"100%");};k.prototype.getWidth=function(w){return this.getProperty("width")||"100%";};k.prototype.applyFocusInfo=function(F){this._bFocusNoPopup=true;I.prototype.applyFocusInfo.apply(this,arguments);};k.prototype.onfocusin=function(E){if(!q(E.target).hasClass("sapUiIcon")){I.prototype.onfocusin.apply(this,arguments);}this._bFocusNoPopup=undefined;};k.prototype.onsapshow=function(E){this.toggleOpen(this.isOpen());E.preventDefault();};k.prototype.onsaphide=k.prototype.onsapshow;k.prototype.onsappageup=function(E){o.call(this,1,"day");E.preventDefault();};k.prototype.onsappageupmodifiers=function(E){if(!E.ctrlKey&&E.shiftKey){o.call(this,1,"month");}else{o.call(this,1,"year");}E.preventDefault();};k.prototype.onsappagedown=function(E){o.call(this,-1,"day");E.preventDefault();};k.prototype.onsappagedownmodifiers=function(E){if(!E.ctrlKey&&E.shiftKey){o.call(this,-1,"month");}else{o.call(this,-1,"year");}E.preventDefault();};k.prototype.onkeypress=function(E){if(!E.charCode||E.metaKey||E.ctrlKey){return;}var F=this._getFormatter(true);var w=String.fromCharCode(E.charCode);if(w&&F.sAllowedCharacters&&F.sAllowedCharacters.indexOf(w)<0){E.preventDefault();}};k.prototype._getValueHelpIcon=function(){var V=this.getAggregation("_endIcon");return V&&V[0];};k.prototype._dateValidation=function(w){this._bValid=true;if(w&&(w.getTime()<this._oMinDate.getTime()||w.getTime()>this._oMaxDate.getTime())){this._bValid=false;e(this._bValid,"Date must be in valid range");}this.setProperty("dateValue",w);return w;};k.prototype.setMinDate=function(w){if(this._isValidDate(w)){throw new Error("Date must be a JavaScript date object; "+this);}if(d(this.getMinDate(),w)){return this;}if(w){var y=w.getFullYear();if(y<1||y>9999){throw new Error("Date must be between 0001-01-01 and 9999-12-31; "+this);}this._oMinDate=new Date(w.getTime());var x=this.getDateValue();if(x&&x.getTime()<w.getTime()){this._bValid=false;L.warning("DateValue not in valid date range",this);}}else{this._oMinDate=new Date(1,0,1);this._oMinDate.setFullYear(1);}this.setProperty("minDate",w);if(this._oCalendar){this._oCalendar.setMinDate(w);}this._oMinDate.setHours(0,0,0,0);return this;};k.prototype.setMaxDate=function(w){if(this._isValidDate(w)){throw new Error("Date must be a JavaScript date object; "+this);}if(d(this.getMaxDate(),w)){return this;}if(w){var y=w.getFullYear();if(y<1||y>9999){throw new Error("Date must be between 0001-01-01 and 9999-12-31; "+this);}this._oMaxDate=new Date(w.getTime());var x=this.getDateValue();if(x&&x.getTime()>w.getTime()){this._bValid=false;L.warning("DateValue not in valid date",this);}}else{this._oMaxDate=new Date(9999,11,31,23,59,59,999);}this.setProperty("maxDate",w);if(this._oCalendar){this._oCalendar.setMaxDate(w);}this._oMaxDate.setHours(23,59,59,999);return this;};k.prototype._checkMinMaxDate=function(){if(this._oMinDate.getTime()>this._oMaxDate.getTime()){L.warning("minDate > MaxDate -> dates switched",this);var M=new Date(this._oMinDate.getTime());var w=new Date(this._oMaxDate.getTime());this._oMinDate=new Date(w.getTime());this._oMaxDate=new Date(M.getTime());this.setProperty("minDate",w,true);this.setProperty("maxDate",M,true);if(this._oCalendar){this._oCalendar.setMinDate(w);this._oCalendar.setMaxDate(M);}}var x=this.getDateValue();if(x&&(x.getTime()<this._oMinDate.getTime()||x.getTime()>this._oMaxDate.getTime())){this._bValid=false;L.error("dateValue "+x.toString()+"(value="+this.getValue()+") does not match "+"min/max date range("+this._oMinDate.toString()+" - "+this._oMaxDate.toString()+"). App. "+"developers should take care to maintain dateValue/value accordingly.",this);}};k.prototype.getDisplayFormatType=function(){return this.getProperty("displayFormatType");};k.prototype._handleDateValidation=function(w){this._bValid=true;if(!w||w.getTime()<this._oMinDate.getTime()||w.getTime()>this._oMaxDate.getTime()){this._bValid=false;L.warning("Value can not be converted to a valid date",this);}this.setProperty("dateValue",w);};k.prototype.setDisplayFormatType=function(w){if(w){var F=false;for(var x in h){if(x==w){F=true;break;}}if(!F){throw new Error(w+" is not a valid calendar type"+this);}}this.setProperty("displayFormatType",w,true);this.setDisplayFormat(this.getDisplayFormat());return this;};k.prototype.setSecondaryCalendarType=function(w){this._bSecondaryCalendarTypeSet=true;this.setProperty("secondaryCalendarType",w,true);if(this._oCalendar){this._oCalendar.setSecondaryCalendarType(w);}return this;};k.prototype.addSpecialDate=function(S){u.call(this,S);this.addAggregation("specialDates",S,true);v.call(this);return this;};k.prototype.insertSpecialDate=function(S,w){u.call(this,S);this.insertAggregation("specialDates",S,w,true);v.call(this);return this;};k.prototype.removeSpecialDate=function(S){var R=this.removeAggregation("specialDates",S,true);v.call(this);return R;};k.prototype.removeAllSpecialDates=function(){var R=this.removeAllAggregation("specialDates",true);v.call(this);return R;};k.prototype.destroySpecialDates=function(){this.destroyAggregation("specialDates",true);v.call(this);return this;};k.prototype.setLegend=function(w){this.setAssociation("legend",w,true);var x=this.getLegend();if(x){var y=sap.ui.require("sap/ui/unified/CalendarLegend");w=sap.ui.getCore().byId(x);if(w&&!(typeof y=="function"&&w instanceof y)){throw new Error(w+" is not an sap.ui.unified.CalendarLegend. "+this);}}if(this._oCalendar){this._oCalendar.setLegend(x);}return this;};k.prototype.onChange=function(E){if(!this.getEditable()||!this.getEnabled()){return;}var V=this._$input.val();var O=this._formatValue(this.getDateValue());if(V==O&&this._bValid){return;}var w;this._bValid=true;if(V!=""){w=this._parseValue(V,true);if(!w||w.getTime()<this._oMinDate.getTime()||w.getTime()>this._oMaxDate.getTime()){this._bValid=false;w=undefined;}else{V=this._formatValue(w);}}if(this.getDomRef()&&(this._$input.val()!==V)){this._$input.val(V);this._curpos=this._$input.cursorPos();}if(w){V=this._formatValue(w,true);}if(this._lastValue!==V||(w&&this.getDateValue()&&w.getFullYear()!==this.getDateValue().getFullYear())){this._lastValue=V;this.setProperty("value",V,true);var N=this.getValue();if(this._bValid&&V==N){this.setProperty("dateValue",w,true);}V=N;if(this.isOpen()){if(this._bValid){w=this.getDateValue();}this._oCalendar.focusDate(w);var S=this._oDateRange.getStartDate();if((!S&&w)||(S&&w&&S.getTime()!=w.getTime())){this._oDateRange.setStartDate(new Date(w.getTime()));}else if(S&&!w){this._oDateRange.setStartDate(undefined);}}this.fireChangeEvent(V,{valid:this._bValid});}};k.prototype._getInputValue=function(V){V=(typeof V=="undefined")?this._$input.val():V.toString();var w=this._parseValue(V,true);V=this._formatValue(w,true);return V;};k.prototype.updateDomValue=function(V){if(this.isActive()&&(this._$input.val()!==V)){this._bCheckDomValue=true;V=(typeof V=="undefined")?this._$input.val():V.toString();this._curpos=this._$input.cursorPos();var w=this._parseValue(V,true);V=this._formatValue(w);this._$input.val(V);this._$input.cursorPos(this._curpos);}return this;};k.prototype._storeInputSelection=function(w){if((D.browser.msie||D.browser.edge)&&!D.support.touch){this._oInputSelBeforePopupOpen={iStart:w.selectionStart,iEnd:w.selectionEnd};w.selectionStart=0;w.selectionEnd=0;}};k.prototype._restoreInputSelection=function(w){if((D.browser.msie||D.browser.edge)&&!D.support.touch){w.selectionStart=this._oInputSelBeforePopupOpen.iStart;w.selectionEnd=this._oInputSelBeforePopupOpen.iEnd;}};function _(){this._createPopup();this._createPopupContent();var w;var B=this.getBinding("value");if(B&&B.oType&&B.oType.oOutputFormat){w=B.oType.oOutputFormat.oFormatOptions.calendarType;}else if(B&&B.oType&&B.oType.oFormat){w=B.oType.oFormat.oFormatOptions.calendarType;}if(!w){w=this.getDisplayFormatType();}if(w){this._oCalendar.setPrimaryCalendarType(w);}var V=this._bValid?this._formatValue(this.getDateValue()):this.getValue();if(V!=this._$input.val()){this.onChange();}this._fillDateRange();this._openPopup();this.fireNavigate({dateRange:this._getVisibleDatesRange(this._oCalendar),afterPopupOpened:true});}k.prototype._createPopup=function(){if(!this._oPopup){this._oPopup=new P();this._oPopup.setAutoClose(true);this._oPopup.setDurations(0,0);this._oPopup.attachOpened(p,this);this._oPopup.attachClosed(s,this);}};k.prototype._openPopup=function(){if(!this._oPopup){return;}this._storeInputSelection(this._$input.get(0));this._oPopup.setAutoCloseAreas([this.getDomRef()]);var w=P.Dock;var A;if(this.getTextAlign()==T.End){A=w.EndBottom+"-4";this._oPopup.open(0,w.EndTop,A,this,null,"fit",true);}else{A=w.BeginBottom+"-4";this._oPopup.open(0,w.BeginTop,A,this,null,"fit",true);}};function m(){if(!i||!j){sap.ui.getCore().loadLibrary("sap.ui.unified");i=sap.ui.requireSync("sap/ui/unified/Calendar");j=sap.ui.requireSync("sap/ui/unified/DateRange");}}k.prototype._getVisibleDatesRange=function(w){var V=w._getVisibleDays();m();return new j({startDate:V[0].toLocalJSDate(),endDate:V[V.length-1].toLocalJSDate()});};k.prototype._createPopupContent=function(){if(!this._oCalendar){m();this._oCalendar=new i(this.getId()+"-cal",{intervalSelection:this._bIntervalSelection,minDate:this.getMinDate(),maxDate:this.getMaxDate(),legend:this.getLegend(),startDateChange:function(){this.fireNavigate({dateRange:this._getVisibleDatesRange(this._oCalendar)});}.bind(this)});this._oDateRange=new j();this._oCalendar.addSelectedDate(this._oDateRange);if(this.$().closest(".sapUiSizeCompact").length>0){this._oCalendar.addStyleClass("sapUiSizeCompact");}if(this._bSecondaryCalendarTypeSet){this._oCalendar.setSecondaryCalendarType(this.getSecondaryCalendarType());}if(this._bOnlyCalendar){this._oCalendar.attachSelect(this._selectDate,this);this._oCalendar.attachCancel(n,this);this._oCalendar.attachEvent("_renderMonth",t,this);this._oCalendar.setPopupMode(true);this._oCalendar.setParent(this,undefined,true);this._oPopup.setContent(this._oCalendar);}}};k.prototype._fillDateRange=function(){var w=this.getDateValue();if(w&&w.getTime()>=this._oMinDate.getTime()&&w.getTime()<=this._oMaxDate.getTime()){this._oCalendar.focusDate(new Date(w.getTime()));if(!this._oDateRange.getStartDate()||this._oDateRange.getStartDate().getTime()!=w.getTime()){this._oDateRange.setStartDate(new Date(w.getTime()));}}else{var x=this.getInitialFocusedDateValue();var F=x?x:new Date();var M=this._oMaxDate.getTime();if(F.getTime()<this._oMinDate.getTime()||F.getTime()>M){F=this._oMinDate;}this._oCalendar.focusDate(F);if(this._oDateRange.getStartDate()){this._oDateRange.setStartDate(undefined);}}};k.prototype.getAccessibilityInfo=function(){var R=this.getRenderer();var w=I.prototype.getAccessibilityInfo.apply(this,arguments);var V=this.getValue()||"";if(this._bValid){var x=this.getDateValue();if(x){V=this._formatValue(x);}}w.type=r.getText("ACC_CTR_TYPE_DATEINPUT");w.description=[V,R.getLabelledByAnnouncement(this),R.getDescribedByAnnouncement(this)].join(" ").trim();return w;};k.prototype._selectDate=function(E){var w=this.getDateValue();var x=this._getSelectedDate();var V="";if(!d(x,w)){this.setDateValue(new Date(x.getTime()));V=this.getValue();this.fireChangeEvent(V,{valid:true});if(this.getDomRef()&&(D.system.desktop||!D.support.touch)){this._curpos=this._$input.val().length;this._$input.cursorPos(this._curpos);}}else if(!this._bValid){V=this._formatValue(x);if(V!=this._$input.val()){this._bValid=true;if(this.getDomRef()){this._$input.val(V);this._lastValue=V;}V=this._formatValue(x,true);this.setProperty("value",V,true);this.fireChangeEvent(V,{valid:true});}}else if(D.system.desktop||!D.support.touch){this.focus();}this._oPopup.close();};k.prototype._getSelectedDate=function(){var S=this._oCalendar.getSelectedDates();var w;if(S.length>0){w=S[0].getStartDate();}return w;};function n(E){if(this.isOpen()){this._oPopup.close();if((D.system.desktop||!D.support.touch)){this.focus();}}}function o(N,w){var O=this.getDateValue();var x=this._$input.cursorPos();if(O&&this.getEditable()&&this.getEnabled()){var y;var B=this.getBinding("value");if(B&&B.oType&&B.oType.oOutputFormat){y=B.oType.oOutputFormat.oFormatOptions.calendarType;}else if(B&&B.oType&&B.oType.oFormat){y=B.oType.oFormat.oFormatOptions.calendarType;}if(!y){y=this.getDisplayFormatType();}var z=U.getInstance(new Date(O.getTime()),y);O=U.getInstance(new Date(O.getTime()),y);switch(w){case"day":z.setDate(z.getDate()+N);break;case"month":z.setMonth(z.getMonth()+N);var M=(O.getMonth()+N)%12;if(M<0){M=12+M;}while(z.getMonth()!=M){z.setDate(z.getDate()-1);}break;case"year":z.setFullYear(z.getFullYear()+N);while(z.getMonth()!=O.getMonth()){z.setDate(z.getDate()-1);}break;default:break;}if(z.getTime()<this._oMinDate.getTime()){z=new U(this._oMinDate.getTime());}else if(z.getTime()>this._oMaxDate.getTime()){z=new U(this._oMaxDate.getTime());}if(!d(this.getDateValue(),z.getJSDate())){this.setDateValue(new Date(z.getTime()));this._curpos=x;this._$input.cursorPos(this._curpos);var V=this.getValue();this.fireChangeEvent(V,{valid:true});}}}function p(E){this.addStyleClass(I.ICON_PRESSED_CSS_CLASS);this._renderedDays=this._oCalendar.$("-Month0-days").find(".sapUiCalItem").length;this.$("inner").attr("aria-owns",this.getId()+"-cal");this.$("inner").attr("aria-expanded",true);g.addPopoverInstance(this._oPopup);}function s(E){this.removeStyleClass(I.ICON_PRESSED_CSS_CLASS);this.$("inner").attr("aria-expanded",false);this._restoreInputSelection(this._$input.get(0));g.removePopoverInstance(this._oPopup);}function t(E){var w=E.getParameter("days");if(w>this._renderedDays){this._renderedDays=w;this._oPopup._applyPosition(this._oPopup._oLastPosition);}}function u(S){var w=sap.ui.require("sap/ui/unified/DateTypeRange");if(S&&!(w&&S instanceof w)){throw new Error(S+"is not valid for aggregation \"specialDates\" of "+this);}}function v(){if(this.isOpen()){this._oCalendar._bDateRangeChanged=true;this._oCalendar.invalidate();}}return k;});
