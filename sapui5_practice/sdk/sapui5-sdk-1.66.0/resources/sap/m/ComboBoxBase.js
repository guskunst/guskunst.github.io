/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./Dialog','./ComboBoxTextField','./Toolbar','./Button','./Bar','./Text','./Title','./GroupHeaderListItem','./SuggestionsPopover','sap/ui/core/SeparatorItem','sap/ui/core/InvisibleText','sap/ui/core/IconPool','sap/base/Log','./library','sap/ui/Device','sap/ui/core/library','./ComboBoxBaseRenderer',"sap/ui/dom/containsOrEquals","sap/ui/events/KeyCodes","sap/ui/thirdparty/jquery","sap/base/security/encodeXML","sap/base/strings/escapeRegExp"],function(D,C,T,B,a,b,c,G,S,d,I,e,L,l,f,g,h,j,K,q,k,m){"use strict";var P=l.PlacementType;var n=["value","enabled","name","placeholder","editable","textAlign","textDirection","valueState","valueStateText"];var o=C.extend("sap.m.ComboBoxBase",{metadata:{library:"sap.m","abstract":true,defaultAggregation:"items",properties:{showSecondaryValues:{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{items:{type:"sap.ui.core.Item",multiple:true,singularName:"item",bindable:"bindable"},picker:{type:"sap.ui.core.PopupInterface",multiple:false,visibility:"hidden"}},events:{loadItems:{}},dnd:{draggable:false,droppable:true}}});o.DEFAULT_TEXT_FILTER=function(i,p,s){var r,t,M;if(!p[s]){return false;}r=p[s]().toLowerCase();t=i.toLowerCase();M=new RegExp('(^|\\s)'+m(t)+".*",'g');return M.test(r);};o.prototype.oncompositionstart=function(){this._bIsComposingCharacter=true;};o.prototype.oncompositionend=function(E){this._bIsComposingCharacter=false;this._sComposition=E.target.value;if(!f.browser.edge&&!f.browser.firefox){C.prototype.handleInput.apply(this,arguments);this.handleInputValidation(E,this.isComposingCharacter());}};o.prototype.isComposingCharacter=function(){return this._bIsComposingCharacter;};o.prototype.updateItems=function(r){this.bItemsUpdated=false;this.destroyItems();this.updateAggregation("items");this.bItemsUpdated=true;if(this.hasLoadItemsEventListeners()){this.onItemsLoaded();}};o.prototype.setFilterFunction=function(F){if(F===null||F===undefined){this.fnFilter=null;return this;}if(typeof(F)!=="function"){L.warning("Passed filter is not a function and the default implementation will be used");}else{this.fnFilter=F;}return this;};o.prototype.highLightList=function(v,i){var p=v.length,v=v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,'\\$&'),r=new RegExp("\\b"+v,"gi"),$;i.forEach(function(s){$=q(s.ref);$.html(this._boldItemRef.call(this,s.text,r,p));},this);};o.prototype._highlightList=function(v){var i=[],p=[],r,s;this._getList().getItems().forEach(function(t){s=t.getDomRef();if(s){i.push({ref:s.getElementsByClassName("sapMSLITitleOnly")[0],text:t.getTitle()});r=s.querySelector(".sapMSLIInfo");if(r&&t.getInfo){p.push({ref:r,text:t.getInfo()});}}});this.highLightList(v,i);this.highLightList(v,p);};o.prototype.setTextFieldHandler=function(t){var i=this,p=t._handleEvent;t._handleEvent=function(E){p.apply(this,arguments);if(/keydown|sapdown|sapup|saphome|sapend|sappagedown|sappageup|input/.test(E.type)){i._handleEvent(E);}};};o.prototype._boldItemRef=function(i,r,p){r.lastIndex=0;var R,s=r.exec(i);if(s===null){return k(i);}var M=s.index;var t="<b>"+k(i.slice(M,M+p))+"</b>";var u=i.split(r);if(u.length===1){R=k(i);}else{R=u.map(function(v){return k(v);}).join(t);}return R;};o.prototype.refreshItems=function(){this.bItemsUpdated=false;this.refreshAggregation("items");};o.prototype.loadItems=function(i,O){var p=typeof i==="function";if(this.hasLoadItemsEventListeners()&&(this.getItems().length===0)){this._bOnItemsLoadedScheduled=false;if(p){O=q.extend({action:i,busyIndicator:true,busyIndicatorDelay:300},O);this.aMessageQueue.push(O);if((this.iLoadItemsEventInitialProcessingTimeoutID===-1)&&(O.busyIndicator)){this.iLoadItemsEventInitialProcessingTimeoutID=setTimeout(function onItemsNotLoadedAfterDelay(){this.setInternalBusyIndicatorDelay(0);this.setInternalBusyIndicator(true);}.bind(this),O.busyIndicatorDelay);}}if(!this.bProcessingLoadItemsEvent){this.bProcessingLoadItemsEvent=true;this.fireLoadItems();}}else if(p){i.call(this);}};o.prototype.onItemsLoaded=function(){this.bProcessingLoadItemsEvent=false;clearTimeout(this.iLoadItemsEventInitialProcessingTimeoutID);if(this.bInitialBusyIndicatorState!==this.getBusy()){this.setInternalBusyIndicator(this.bInitialBusyIndicatorState);}if(this.iInitialBusyIndicatorDelay!==this.getBusyIndicatorDelay()){this.setInternalBusyIndicatorDelay(this.iInitialBusyIndicatorDelay);}for(var i=0,p,N,r;i<this.aMessageQueue.length;i++){p=this.aMessageQueue.shift();i--;r=(i+1)===this.aMessageQueue.length;N=r?null:this.aMessageQueue[i+1];if(typeof p.action==="function"){if((p.name==="input")&&!r&&(N.name==="input")){continue;}p.action.call(this);}}};o.prototype.hasLoadItemsEventListeners=function(){return this.hasListeners("loadItems");};o.prototype._scheduleOnItemsLoadedOnce=function(){if(!this._bOnItemsLoadedScheduled&&!this.isBound("items")&&this.hasLoadItemsEventListeners()&&this.bProcessingLoadItemsEvent){this._bOnItemsLoadedScheduled=true;setTimeout(this.onItemsLoaded.bind(this),0);}};o.prototype.getPickerInvisibleTextId=function(){return I.getStaticId("sap.m","COMBOBOX_AVAILABLE_OPTIONS");};o.prototype._getGroupHeaderInvisibleText=function(){if(!this._oGroupHeaderInvisibleText){this._oGroupHeaderInvisibleText=new I();this._oGroupHeaderInvisibleText.toStatic();}return this._oGroupHeaderInvisibleText;};o.prototype._getItemByListItem=function(i){return this._getItemBy(i,"ListItem");};o.prototype._getItemBy=function(p,s){s=this.getRenderer().CSS_CLASS_COMBOBOXBASE+s;for(var i=0,r=this.getItems(),t=r.length;i<t;i++){if(r[i].data(s)===p){return r[i];}}return null;};o.prototype._isListInSuggestMode=function(){return this._getList().getItems().some(function(i){return!i.getVisible()&&this._getItemByListItem(i).getEnabled();},this);};o.prototype.getListItem=function(i){return i?i.data(this.getRenderer().CSS_CLASS_COMBOBOXBASE+"ListItem"):null;};o.prototype.getSelectable=function(i){return i._bSelectable;};o.prototype.init=function(){C.prototype.init.apply(this,arguments);this.setPickerType(f.system.phone?"Dialog":"Dropdown");this.bItemsUpdated=false;this.bOpenedByKeyboardOrButton=false;this._bShouldClosePicker=false;this._oPickerValueStateText=null;this.bProcessingLoadItemsEvent=false;this.iLoadItemsEventInitialProcessingTimeoutID=-1;this.aMessageQueue=[];this.bInitialBusyIndicatorState=this.getBusy();this.iInitialBusyIndicatorDelay=this.getBusyIndicatorDelay();this._bOnItemsLoadedScheduled=false;this._bDoTypeAhead=true;this.getIcon().addEventDelegate({onmousedown:function(E){this._bShouldClosePicker=this.isOpen();}},this);this.getIcon().attachPress(this._handlePopupOpenAndItemsLoad.bind(this,true));this._sComposition="";this.fnFilter=null;};o.prototype._handlePopupOpenAndItemsLoad=function(O){var p;if(!this.getEnabled()||!this.getEditable()){return;}if(this._bShouldClosePicker){this._bShouldClosePicker=false;this.close();return;}this.loadItems();this.bOpenedByKeyboardOrButton=O;if(this.isPlatformTablet()){p=this.getPicker();p.setInitialFocus(p);}this.open();};o.prototype.exit=function(){C.prototype.exit.apply(this,arguments);if(this._getList()){this._getList().destroy();this._oList=null;}if(this._getGroupHeaderInvisibleText()){this._getGroupHeaderInvisibleText().destroy();this._oGroupHeaderInvisibleText=null;}clearTimeout(this.iLoadItemsEventInitialProcessingTimeoutID);this.aMessageQueue=null;this.fnFilter=null;};o.prototype.onsapshow=function(E){if(!this.getEnabled()||!this.getEditable()){return;}E.setMarked();if(E.keyCode===K.F4){this.onF4(E);}if(this.isOpen()){this.close();return;}this.selectText(0,this.getValue().length);this.loadItems();this.bOpenedByKeyboardOrButton=true;this.open();};o.prototype.onF4=function(E){E.preventDefault();};o.prototype.onsapescape=function(E){if(this.getEnabled()&&this.getEditable()&&this.isOpen()){E.setMarked();E.preventDefault();this.close();}else{C.prototype.onsapescape.apply(this,arguments);}};o.prototype.onsaphide=o.prototype.onsapshow;o.prototype.onsapfocusleave=function(E){if(!E.relatedControlId){C.prototype.onsapfocusleave.apply(this,arguments);return;}var r=sap.ui.getCore().byId(E.relatedControlId);if(r===this){return;}var p=this.getPicker(),F=r&&r.getFocusDomRef();if(p&&j(p.getFocusDomRef(),F)){return;}C.prototype.onsapfocusleave.apply(this,arguments);};o.prototype.getPopupAnchorDomRef=function(){return this.getDomRef();};o.prototype.addContent=function(p){};o.prototype.getList=function(){L.warning("[Warning]:","You are attempting to use deprecated method 'getList()', please refer to SAP note 2746748.",this);return this._getList();};o.prototype._getList=function(){if(this.bIsDestroyed){return null;}return this._oList;};o.prototype.setPickerType=function(p){this._sPickerType=p;};o.prototype.getPickerType=function(){return this._sPickerType;};o.prototype._updateSuggestionsPopoverValueState=function(){var s=this._getSuggestionsPopover();if(s){s.updateValueState(this.getValueState(),this.getValueStateText(),this.getShowValueStateMessage());}};o.prototype.setValueState=function(v){C.prototype.setValueState.apply(this,arguments);this._updateSuggestionsPopoverValueState();return this;};o.prototype.setValueStateText=function(v){C.prototype.setValueStateText.apply(this,arguments);this._updateSuggestionsPopoverValueState();return this;};o.prototype.setShowValueStateMessage=function(s){C.prototype.setShowValueStateMessage.apply(this,arguments);this._updateSuggestionsPopoverValueState();return this;};o.prototype.shouldValueStateMessageBeOpened=function(){var s=C.prototype.shouldValueStateMessageBeOpened.apply(this,arguments);return(s&&!this.isOpen());};o.prototype.onPropertyChange=function(i,p){var N=i.getParameter("newValue"),s=i.getParameter("name"),M="set"+s.charAt(0).toUpperCase()+s.slice(1),r=(p&&p.srcControl)||this.getPickerTextField();if(this.getInputForwardableProperties().indexOf(s)>-1&&r&&(typeof r[M]==="function")){r[M](N);}};o.prototype.getInputForwardableProperties=function(){return n;};o.prototype.isPickerDialog=function(){return this.getPickerType()==="Dialog";};o.prototype.isPlatformTablet=function(){var N=!f.system.combi,t=f.system.tablet&&N;return t;};o.prototype.getDropdownSettings=function(){return{showArrow:false,placement:P.VerticalPreferredBottom,offsetX:0,offsetY:0,bounce:false,ariaLabelledBy:this.getPickerInvisibleTextId()||undefined};};o.prototype._configureList=function(){};o.prototype.configureDialog=function(){};o.prototype.createPicker=function(p){var i=this.getAggregation("picker");if(i){return i;}this._oSuggestionPopover=this._createSuggestionsPopover();i=this._oSuggestionPopover._oPopover;this.setAggregation("picker",i,true);if(this.isPickerDialog()){this.configureDialog(i);}this.configPicker(i);return i;};o.prototype.configPicker=function(p){};o.prototype.createPickerTextField=function(){};o.prototype._createSuggestionsPopover=function(){var u=this.isPickerDialog(),s;s=new S(this);if(u){s._oPopupInput=this.createPickerTextField();}s._createSuggestionPopup();s._createSuggestionPopupContent(false,false,false);this._updateSuggestionsPopoverValueState();this._oList=s._oList;this._configureList(this._oList);return s;};o.prototype.setSelectable=function(i,s){if(this.indexOfItem(i)<0){return;}i._bSelectable=s;var p=this.getListItem(i);if(p){p.setVisible(s);}};o.prototype.onBeforeClose=function(){this.bOpenedByKeyboardOrButton=false;};o.prototype.getPicker=function(){var p=this.getAggregation("picker");if(p&&!p.bIsDestroyed&&!this.bIsDestroyed){return p;}return null;};o.prototype._getSuggestionsPopover=function(){return this._oSuggestionPopover;};o.prototype.getPickerTextField=function(){var p=this.getPicker(),s=p&&p.getSubHeader();return s&&s.getContent()[0]||null;};o.prototype.getPickerTitle=function(){var p=this.getPicker(),H=p&&p.getCustomHeader();if(this.isPickerDialog()&&H){return H.getContentMiddle()[0];}return null;};o.prototype.getRoleComboNodeDomRef=function(){var F=this.getFocusDomRef();if(!F){return null;}return F.parentNode;};o.prototype.createDialog=function(){var t=this,i=this.createPickerTextField();this.setTextFieldHandler(i);return new D({stretch:true,customHeader:t.createPickerHeader(),buttons:this.createPickerCloseButton(),subHeader:new T({content:i}),beforeOpen:function(){t.updatePickerHeaderTitle();},afterClose:function(){t.focus();l.closeKeyboard();},ariaLabelledBy:t.getPickerInvisibleTextId()||undefined});};o.prototype.createPickerHeader=function(){var t=this,i=e.getIconURI("decline");return new a({contentMiddle:new c(),contentRight:new B({icon:i,press:function(){t.close();t.revertSelection();}})});};o.prototype.revertSelection=function(){};o.prototype.updatePickerHeaderTitle=function(){var p=this.getPicker(),r=sap.ui.getCore().getLibraryResourceBundle("sap.m"),i,s;if(!p){return;}s=this.getLabels();if(s.length){i=s[0];if(i&&(typeof i.getText==="function")){this.getPickerTitle().setText(i.getText());}}else{this.getPickerTitle().setText(r.getText("COMBOBOX_PICKER_TITLE"));}};o.prototype.createPickerCloseButton=function(){var t=this,i,r=sap.ui.getCore().getLibraryResourceBundle("sap.m");return new B({text:r.getText("COMBOBOX_CLOSE_BUTTON"),press:function(){i=t.getPickerTextField();t.updateDomValue(i.getValue());t.onChange();t.close();}});};o.prototype.hasContent=function(){return this.getItems().length>0;};o.prototype.findFirstEnabledItem=function(p){p=p||this.getItems();for(var i=0;i<p.length;i++){if(p[i].getEnabled()){return p[i];}}return null;};o.prototype.findLastEnabledItem=function(i){i=i||this.getItems();return this.findFirstEnabledItem(i.reverse());};o.prototype.open=function(){var p=this.getPicker();if(p){this._updateSuggestionsPopoverValueState();p.open();}return this;};o.prototype.getVisibleItems=function(){for(var i=0,p,r=this.getItems(),v=[];i<r.length;i++){p=this.getListItem(r[i]);if(p&&p.getVisible()){v.push(r[i]);}}return v;};o.prototype.isItemSelected=function(){};o.prototype.getKeys=function(p){p=p||this.getItems();for(var i=0,r=[];i<p.length;i++){r[i]=p[i].getKey();}return r;};o.prototype.getSelectableItems=function(){return this.getEnabledItems(this.getVisibleItems());};o.prototype.findItem=function(p,v){var M="get"+p.charAt(0).toUpperCase()+p.slice(1);for(var i=0,r=this.getItems();i<r.length;i++){if(r[i][M]()===v){return r[i];}}return null;};o.prototype.getItemByText=function(t){return this.findItem("text",t);};o.prototype.scrollToItem=function(i){var p=this.getPicker(),r=p.getDomRef("cont"),s=i&&i.getDomRef();if(!p||!r||!s){return;}var t=r.scrollTop,u=s.offsetTop,v=r.clientHeight,w=s.offsetHeight;if(t>u){r.scrollTop=u;}else if((u+w)>(t+v)){r.scrollTop=Math.ceil(u+w-v);}};o.prototype.clearFilter=function(){this.getItems().forEach(function(i){var p=this.getListItem(i);if(p){p.setVisible(i.getEnabled()&&this.getSelectable(i));}},this);};o.prototype.onItemChange=function(i){};o.prototype.clearSelection=function(){};o.prototype.setInternalBusyIndicator=function(i){this.bInitialBusyIndicatorState=this.getBusy();return this.setBusy.apply(this,arguments);};o.prototype.setInternalBusyIndicatorDelay=function(i){this.iInitialBusyIndicatorDelay=this.getBusyIndicatorDelay();return this.setBusyIndicatorDelay.apply(this,arguments);};o.prototype.addItem=function(i){this.addAggregation("items",i);if(i){i.attachEvent("_change",this.onItemChange,this);}if(this._getList()){this._getList().addItem(this._mapItemToListItem(i));}return this;};o.prototype.insertItem=function(i,p){this.insertAggregation("items",i,p,true);if(i){i.attachEvent("_change",this.onItemChange,this);}if(this._getList()){this._getList().insertItem(this._mapItemToListItem(i),p);}this._scheduleOnItemsLoadedOnce();return this;};o.prototype.getItemAt=function(i){return this.getItems()[+i]||null;};o.prototype.getFirstItem=function(){return this.getItems()[0]||null;};o.prototype.getLastItem=function(){var i=this.getItems();return i[i.length-1]||null;};o.prototype.getEnabledItems=function(i){i=i||this.getItems();return i.filter(function(p){return p.getEnabled();});};o.prototype.getItemByKey=function(s){return this.findItem("key",s);};o.prototype.addItemGroup=function(i,H,s){H=H||new d({text:i.text||i.key});this.addAggregation("items",H,s);return H;};o.prototype._mapSeparatorItemToGroupHeader=function(s,i){var p=new G({title:s.getText(),ariaLabelledBy:this._getGroupHeaderInvisibleText().getId()});p.addStyleClass(i.CSS_CLASS_COMBOBOXBASE+"NonInteractiveItem");if(s.getText&&!s.getText()){p.addStyleClass(i.CSS_CLASS_COMBOBOXBASE+"SeparatorItemNoText");}return p;};o.prototype.isOpen=function(){var p=this.getPicker();return!!(p&&p.isOpen());};o.prototype.close=function(){var p=this.getPicker();if(p){p.close();}return this;};o.prototype.removeItem=function(i){i=this.removeAggregation("items",i);if(i){i.detachEvent("_change",this.onItemChange,this);}return i;};o.prototype.removeAllItems=function(){var p=this.removeAllAggregation("items");this.clearSelection();for(var i=0;i<p.length;i++){p[i].detachEvent("_change",this.onItemChange,this);}return p;};o.prototype.intersectItems=function(i,O){return i.filter(function(p){return O.map(function(r){return r.getId();}).indexOf(p.getId())!==-1;});};o.prototype.showItems=function(F){var i=this.fnFilter,p=function(){if(!this.getItems().length){return;}this.detachLoadItems(p);this.setFilterFunction(F||function(){return true;});this.applyShowItemsFilters();this._handlePopupOpenAndItemsLoad(false);this.setFilterFunction(i);}.bind(this);if(!this.getEnabled()||!this.getEditable()){return;}this.attachLoadItems(p);this.loadItems(p);};o.prototype.applyShowItemsFilters=function(){};return o;});
