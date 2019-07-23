/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/core/Control','sap/m/Column','sap/m/Text','sap/ui/model/Filter',"sap/ui/core/Fragment"],function(C,a,T,F,b){"use strict";var B=C.extend("sap.ui.mdc.p13n.BasePanel",{library:"sap.ui.mdc",metadata:{library:"sap.ui.mdc",associations:{},defaultAggregation:"items",aggregations:{_content:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},template:{type:"sap.ui.core.Control",multiple:false}},events:{change:{}}},init:function(){var f=b.createId(this.getId(),"BasePanelFragment");b.load({name:"sap.ui.mdc.p13n.BasePanel",id:f,controller:this}).then(function(m){this._oMTable=m;if(this._aColTexts){this._addTableColumns(this._aColTexts);this._aColTexts=null;}if(this.getTemplate()){this._bindListItems();}this.setAggregation("_content",m);this._moveTopButton=b.byId(f,"IDButtonMoveToTop");this._moveUpButton=b.byId(f,"IDButtonMoveUp");this._moveDownButton=b.byId(f,"IDButtonMoveDown");this._moveBottomButton=b.byId(f,"IDButtonMoveToBottom");}.bind(this));},renderer:function(r,c){r.write("<div");r.writeControlData(c);r.writeClasses();r.write(">");r.renderControl(c.getAggregation("_content"));r.write("</div>");}});B.prototype.setTemplate=function(t){this.setAggregation("template",t);if(this._oMTable){this._bindListItems();}return this;};B.prototype.setPanelColumns=function(t){var c;if(t instanceof Array){c=t;}else{c=[t];}if(this._oMTable){this._addTableColumns(c);}else{this._aColTexts=c;}};B.prototype._addTableColumns=function(t){t.forEach(function(s){this._oMTable.addColumn(new a({header:new T({text:s})}));},this);};B.prototype._bindListItems=function(m){this._oMTable.bindItems(Object.assign({path:"/items",key:"name",templateShareable:false,template:this.getTemplate().clone()},m));};B.prototype._onSelectionChange=function(e){var l=e.getParameter("listItems");var s=e.getParameter("selectAll");var d=!s&&l.length>1;l.forEach(function(t){this._selectTableItem(t,s||d);},this);if(s||d){this.fireChange();}if(d){this._moveTopButton.setEnabled(false);this._moveUpButton.setEnabled(false);this._moveDownButton.setEnabled(false);this._moveBottomButton.setEnabled(false);}};B.prototype._onItemPressed=function(e){var t=e.getParameter('listItem');this._toggleMarkedTableItem(this._oSelectedItem,t);this._oSelectedItem=t;this._updateEnableOfMoveButtons(t);};B.prototype._onSearchFieldLiveChange=function(e){this._oMTable.getBinding("items").filter(new F("label","Contains",e.getSource().getValue()));};B.prototype._onPressButtonMoveToTop=function(){this._moveSelectedItem(0);};B.prototype._onPressButtonMoveUp=function(){this._moveSelectedItem("Up");};B.prototype._onPressButtonMoveDown=function(){this._moveSelectedItem("Down");};B.prototype._onPressButtonMoveToBottom=function(){this._moveSelectedItem(this._oMTable.getItems().length-1);};B.prototype._selectTableItem=function(t,s){this._toggleMarkedTableItem(t);this._updateEnableOfMoveButtons(t);this._oSelectedItem=t;if(!s){this.fireChange();}};B.prototype._moveSelectedItem=function(n){var i=this._oMTable.getItems();var s=this._oSelectedItem;var S=i.indexOf(s);if(S<0){return;}var N=(typeof n=="number")?n:S+(n=="Up"?-1:1);this._moveTableItem(s,N);};B.prototype._moveTableItem=function(i,n){var I=this._oMTable.getItems();var f=this._oMTable.getModel().getData().items;var o=f.indexOf(i.getBindingContext().getObject());n=(n<=0)?0:Math.min(n,I.length-1);n=f.indexOf(I[n].getBindingContext().getObject());if(n==o){return;}f.splice(n,0,f.splice(o,1)[0]);this._oMTable.getModel().setProperty("/items",f);this._oSelectedItem=I[n];this._toggleMarkedTableItem(I[o],I[n]);this._updateEnableOfMoveButtons(this._oSelectedItem);this.fireChange();};B.prototype._toggleMarkedTableItem=function(t,o){if(t){t.removeStyleClass("sapUiMdcPersonalizationDialogMarked");}if(o){o.addStyleClass("sapUiMdcPersonalizationDialogMarked");}};B.prototype._onRearrange=function(e){var d=e.getParameter("draggedControl");var D=e.getParameter("droppedControl");var s=e.getParameter("dropPosition");var i=this._oMTable.indexOfItem(d);var c=this._oMTable.indexOfItem(D);var A=c+(s=="Before"?0:1)+(i<c?-1:0);this._moveTableItem(d,A);this._updateEnableOfMoveButtons(d);};B.prototype._updateEnableOfMoveButtons=function(t){var i=this._oMTable.getItems().indexOf(t);var u=true,d=true;if(i==0){u=false;}if(i==t.getParent().getItems().length-1){d=false;}this._moveTopButton.setEnabled(u);this._moveUpButton.setEnabled(u);this._moveDownButton.setEnabled(d);this._moveBottomButton.setEnabled(d);t.focus();};return B;},true);