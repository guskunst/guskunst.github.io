/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['./FieldValueHelpContentWrapperBase','sap/ui/model/ChangeReason','sap/ui/base/ManagedObjectObserver','sap/base/strings/capitalize','sap/m/library','sap/base/util/deepEqual','sap/base/Log'],function(F,C,M,c,l,d,L){"use strict";var a=l.ListMode;var S;var b=F.extend("sap.ui.mdc.base.FieldValueHelpMTableWrapper",{metadata:{library:"sap.ui.mdc",aggregations:{table:{type:"sap.m.Table",multiple:false}},defaultAggregation:"table",events:{dataUpdate:{}}}});b.prototype.init=function(){F.prototype.init.apply(this,arguments);this._oObserver=new M(e.bind(this));this._oObserver.observe(this,{properties:["selectedItems"],aggregations:["table"]});};b.prototype.exit=function(){F.prototype.exit.apply(this,arguments);if(this._oScrollContainer){this._oScrollContainer.destroy();delete this._oScrollContainer;}this._oObserver.disconnect();this._oObserver=undefined;};b.prototype.invalidate=function(O){if(O){var t=this.getTable();if(t&&O===t){if(O.bOutput&&!this._bIsBeingDestroyed){var P=this.getParent();if(P){P.invalidate(this);}}return;}}F.prototype.invalidate.apply(this,arguments);};b.prototype.initialize=function(s){if(s||this._oScrollContainer){return this;}if(!S&&!this._bScrollContainerRequested){S=sap.ui.require("sap/m/ScrollContainer");if(!S){sap.ui.require(["sap/m/ScrollContainer"],_.bind(this));this._bScrollContainerRequested=true;}}if(S&&!this._bScrollContainerRequested){this._oScrollContainer=new S(this.getId()+"-SC",{height:"100%",width:"100%",vertical:true});this._oScrollContainer._oWrapper=this;this._oScrollContainer.getContent=function(){var i=[];var t=this._oWrapper&&this._oWrapper.getTable();if(t){i.push(t);}return i;};}return this;};function _(s){S=s;this._bScrollContainerRequested=false;if(!this._bIsBeingDestroyed){this.initialize();this.fireDataUpdate({contentChange:true});}}b.prototype.getDialogContent=function(){return this._oScrollContainer;};b.prototype.getSuggestionContent=function(){return this.getTable();};b.prototype.fieldHelpOpen=function(s){F.prototype.fieldHelpOpen.apply(this,arguments);var t=this.getTable();if(t){g.call(this,t,s);o.call(this);if(s){var i=t.getSelectedItem();if(i&&i.getDomRef()){i.getDomRef().scrollIntoView();}}}return this;};b.prototype.navigate=function(s){var t=this.getTable();if(!r(t)){this._bNavigate=true;this._iStep=s;return;}var i=t.getSelectedItem();var I=t.getItems();var j=I.length;var u=0;if(i){u=t.indexOfItem(i);u=u+s;}else if(s>=0){u=s-1;}else{u=j+s;}if(u<0){u=0;}else if(u>=j-1){u=j-1;}var v=I[u];if(v&&v!==i){v.setSelected(true);var V=p.call(this,v);if(v.getDomRef()){v.getDomRef().scrollIntoView();}this._bNoTableUpdate=true;this.setSelectedItems([{key:V.key,description:V.description,inParameters:V.inParameters,outParameters:V.outParameters}]);this._bNoTableUpdate=false;this.fireNavigate({key:V.key,description:V.description,inParameters:V.inParameters,outParameters:V.outParameters});}};b.prototype.getTextForKey=function(K,I,O){var t="";var T=this.getTable();if(r(T)){var j=T.getItems();var s;var u;if(I){s=[];for(var v in I){s.push(v);}}if(O){u=[];for(var w in O){u.push(w);}}for(var i=0;i<j.length;i++){var x=j[i];var V=p.call(this,x,s,u);if(V.key===K&&(!V.inParameters||!I||d(I,V.inParameters))&&(!V.outParameters||!O||d(O,V.outParameters))){t=V.description;break;}}}return t;};b.prototype.getKeyForText=function(t){var K;var T=this.getTable();if(r(T)){var I=T.getItems();for(var i=0;i<I.length;i++){var j=I[i];var v=p.call(this,j);if(v.description===t){K=v.key;break;}}}return K;};b.prototype.getListBinding=function(){var t=this.getTable();var i;if(t){i=t.getBinding("items");}return i;};b.prototype.clone=function(i,j){var t=this.getTable();if(t){t.detachEvent("itemPress",h,this);t.detachEvent("selectionChange",k,this);t.detachEvent("updateFinished",n,this);}var s=F.prototype.clone.apply(this,arguments);if(t){t.attachEvent("itemPress",h,this);t.attachEvent("selectionChange",k,this);t.attachEvent("updateFinished",n,this);}return s;};function e(i){if(i.name==="table"){f.call(this,i.mutation,i.child);}if(i.name==="selectedItems"){o.call(this);}}function f(s,t){if(s==="remove"){t.detachEvent("itemPress",h,this);t.detachEvent("selectionChange",k,this);t.detachEvent("updateFinished",n,this);t=undefined;}else{t.setMode(a.SingleSelectMaster);t.setRememberSelections(false);t.attachEvent("itemPress",h,this);t.attachEvent("selectionChange",k,this);t.attachEvent("updateFinished",n,this);g.call(this,t,this._bSuggestion);o.call(this);if(this._bNavigate){this._bNavigate=false;this.navigate(this._iStep);}}this.fireDataUpdate({contentChange:true});}function g(t,s){if(t&&this.getParent()){if(s){if(this._sTableWidth){t.setWidth(this._sTableWidth);}t.setMode(a.SingleSelectMaster);}else{if(t.getWidth()!=="100%"){this._sTableWidth=t.getWidth();t.setWidth("100%");}if(this._getMaxConditions()===1){t.setMode(a.SingleSelectLeft);}else{t.setMode(a.MultiSelect);}}}}function h(E){var i=E.getParameter("listItem");if(!this._bSuggestion){i.setSelected(!i.getSelected());}m.call(this);}function k(E){if(!this._bSuggestion){m.call(this);}}function m(){var I=[];var t=this.getTable();if(t){var s=this.getSelectedItems();var T=t.getItems();var i=0;var u;var v;if(s.length>0){for(i=0;i<T.length;i++){u=T[i];v=p.call(this,u);if(!v){throw new Error("Key of item cannot be determined"+this);}for(var j=s.length-1;j>=0;j--){var w=s[j];if(w.key===v.key&&(!v.inParameters||!w.inParameters||d(w.inParameters,v.inParameters))&&(!v.outParameters||!w.outParameters||d(w.outParameters,v.outParameters))){s.splice(j,1);break;}}}}if(s.length>0){I=s;}s=t.getSelectedItems();for(i=0;i<s.length;i++){u=s[i];v=p.call(this,u);if(!v){throw new Error("Key of item cannot be determined"+this);}I.push({key:v.key,description:v.description,inParameters:v.inParameters,outParameters:v.outParameters});}}this._bNoTableUpdate=true;this.setSelectedItems(I);this._bNoTableUpdate=false;this.fireSelectionChange({selectedItems:I});}function n(E){if(!this.getParent()){return;}o.call(this);if(this._bNavigate){this._bNavigate=false;this.navigate(this._iStep);}this.fireDataUpdate({contentChange:false});}function o(){if(this._bNoTableUpdate){return;}var t=this.getTable();if(r(t)){var s=this.getSelectedItems();var I=t.getItems();for(var j=0;j<I.length;j++){var u=I[j];var v=false;if(s.length>0){var V=p.call(this,u);for(var i=0;i<s.length;i++){var w=s[i];if(V.key===w.key&&(!V.inParameters||!w.inParameters||d(w.inParameters,V.inParameters))&&(!V.outParameters||!w.outParameters||d(w.outParameters,V.outParameters))){v=true;break;}}}if(u.getSelected()!==v){u.setSelected(v);}}}}function p(i,I,O){var v;var B=i.getBindingContext();if(B){v=q.call(this,B,I,O);}if(!v){var K=this._getKeyPath();var j;var D;if(!K&&i.getCells){var s=i.getCells();if(s.length>0&&s[0].getText){j=s[0].getText();}if(s.length>1&&s[1].getText){D=s[1].getText();}if(j!==undefined){v={key:j,description:D};}}}if(!v){throw new Error("Key could not be determined from item "+this);}return v;}function q(B,I,O){var K=this._getKeyPath();var D=this._getDescriptionPath();var j=B.getObject();var v;var s;if(!I){I=this._getInParameters();}if(!O){O=this._getOutParameters();}var t=I.length>0?{}:null;var u=O.length>0?{}:null;var P;if(j){if(K&&j.hasOwnProperty(K)){v=j[K];}if(D&&j.hasOwnProperty(D)){s=j[D];}for(var i=0;i<I.length;i++){P=I[i];if(j.hasOwnProperty(P)){t[P]=j[P];}}for(var i=0;i<O.length;i++){P=O[i];if(j.hasOwnProperty(P)){u[P]=j[P];}else{L.error("FieldValueHelpMTableWrapper","cannot find out-parameter '"+P+"' in item data!");}}}if(!v){return false;}return{key:v,description:s,inParameters:t,outParameters:u};}function r(t){if(!t){return false;}var B=t.getBinding("items");if(B&&(B.isSuspended()||B.getLength()===0)){return false;}return true;}return b;},true);
