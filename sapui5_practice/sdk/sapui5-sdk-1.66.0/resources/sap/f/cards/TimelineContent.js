/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/f/cards/BaseContent","sap/suite/ui/commons/Timeline","sap/suite/ui/commons/library","sap/suite/ui/commons/TimelineItem",'sap/ui/base/ManagedObject'],function(B,T,s,a,M){"use strict";var b=B.extend("sap.f.cards.TimelineContent",{renderer:{}});b.prototype.exit=function(){B.prototype.exit.apply(this,arguments);if(this._oTimeLineItemTemplate){this._oTimeLineItemTemplate.destroy();this._oTimeLineItemTemplate=null;}};b.prototype._getTimeline=function(){var t=this.getAggregation("_content");if(this._bIsBeingDestroyed){return null;}if(!t){t=new T({id:this.getId()+"-Timeline",showHeaderBar:false,enableScroll:false});this.setAggregation("_content",t);}return t;};b.prototype.setConfiguration=function(c){B.prototype.setConfiguration.apply(this,arguments);if(!c){return this;}if(c.items){this._setStaticItems(c.items);return this;}if(c.item){this._setItem(c.item);}return this;};b.prototype._setItem=function(i){this._oTimeLineItemTemplate=new a({userNameClickable:false});i.title&&this._bindItemProperty("title",i.title.value);i.description&&this._bindItemProperty("text",i.description.value);i.ownerImage&&this._bindItemProperty("userPicture",i.ownerImage.value);i.dateTime&&this._bindItemProperty("dateTime",i.dateTime.value);i.owner&&this._bindItemProperty("userName",i.owner.value);i.icon&&this._bindItemProperty("icon",i.icon.src);var o={template:this._oTimeLineItemTemplate};this._bindAggregation("content",this._getTimeline(),o);return this;};b.prototype._bindItemProperty=function(p,P){var o=M.bindingParser(P);if(!P){return;}if(o){this._oTimeLineItemTemplate.bindProperty(p,o);}else{this._oTimeLineItemTemplate.setProperty(p,P);}};b.prototype._setStaticItems=function(i){var t=this._getTimeline(),o;i.forEach(function(I){o=new a({title:I.title,text:I.description,userPicture:I.ownerImage,dateTime:I.dateTime,userName:I.owner,icon:I.icon});t.addContent(o);});};b.prototype.getInnerList=function(){return this._getTimeline();};return b;});
