/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/Control","../Extension"],function(q,S,a){"use strict";var D=a.extend("sap.ui.vtm.extensions.DisplayStateCalculationExtension",{metadata:{interfaces:["sap.ui.vtm.interfaces.IDisplayStateCalculationExtension"]},constructor:function(i,s){a.apply(this,arguments);},initialize:function(){this._handlingEvent=false;this._defaultVisibility=false;this._defaultOpacity=null;this._defaultHighlightColor=null;this.applyPanelHandler(function(p){var v=p.getViewport();v.attachRefreshRequested(function(e){if(!this.getEnabled()){return;}this._updateDisplayStates(p);}.bind(this));}.bind(this));},_updateDisplayStates:function(p){var s=new sap.ui.vtm.Lookup(),b=new sap.ui.vtm.Lookup(),h=[],v=[];this._calculateDisplayStates(p,h,v,s,b);this._applyDisplayStates(p,h,v,s,b);},_applyContextUpdates:function(p,d){var v=p.getViewport();var s=v.getScene();var c=v.getContextDisplayGroups();c.reverse().forEach(function(b){var e=b.getDisplayStatesBySceneNodeId();if(e){var f=Object.getOwnPropertyNames(e);f.forEach(function(g){var h=e[g];var i=h.visibility;var o=h.opacity;var j=h.highlightColor;var r=h.recursive;var k=[g];if(r===true){Array.prototype.push.apply(k,s.getDescendantIds(g));}k.forEach(function(l){var m=d.get(l);if(i!==null&&i!==undefined){m.visibility=i;}if(o!==null&&o!==undefined){m.opacity=o;}if(j!==null&&j!==undefined){m.highlightColor=j===""?this._defaultHighlightColor:j;}});});}});},_applyTreeItemUpdates:function(p,d){var t=p.getTree();var b=t.getAllItems();b.forEach(function(c){var v=c.visibility===true;if(v){var s=sap.ui.vtm.TreeItemUtilities.getSceneNodeIds(c);var o=c.opacity;var h=c.highlightColor;s.forEach(function(e){var f=d.get(e);f.visibility=v;f.opacity=o||this._defaultOpacity;f.highlightColor=h||this._defaultHighlightColor;}.bind(this));}}.bind(this));},_applyOverrideUpdates:function(p,d){var v=p.getViewport();var s=v.getScene();var o=v.getOverrideDisplayGroups();o.reverse().forEach(function(b){var c=b.getDisplayStatesBySceneNodeId();if(c){var e=Object.getOwnPropertyNames(c);e.forEach(function(f){var g=c[f];var h=g.visibility;var i=g.opacity;var j=g.highlightColor;var r=g.recursive;var k=[f];if(r===true){Array.prototype.push.apply(k,s.getDescendantIds(f));}k.forEach(function(l){var m=d.get(l);if(h!==null&&h!==undefined){m.visibility=h;}if(i!==null&&i!==undefined){m.opacity=i;}if(j!==null&&j!==undefined){m.highlightColor=j===""?this._defaultHighlightColor:j;}});});}});},_calculateDisplayStates:function(p,h,v,s,b){sap.ui.vtm.measure(this,"_calculateDisplayStates",function(){var c;var d=new Map();sap.ui.vtm.measure(this,"_calculateDisplayStates - Get all ids",function(){c=this._vtm.getScene().getCachedIds();}.bind(this));sap.ui.vtm.measure(this,"creating display states",function(){c.forEach(function(e){d.set(e,{visibility:this._defaultVisibility,opacity:this._defaultOpacity,highlightColor:this._defaultHighlightColor});}.bind(this));}.bind(this));sap.ui.vtm.measure(this,"_applyContextUpdates ("+p.getId()+")",function(){this._applyContextUpdates(p,d);}.bind(this));sap.ui.vtm.measure(this,"_applyTreeItemUpdates ("+p.getId()+")",function(){this._applyTreeItemUpdates(p,d);}.bind(this));sap.ui.vtm.measure(this,"_applyOverrideUpdates ("+p.getId()+")",function(){this._applyOverrideUpdates(p,d);}.bind(this));sap.ui.vtm.measure(this,"_calculateDisplayStates - Populating lookups",function(){d.forEach(function(e,f){if(e.visibility){v.push(f);s.addValue(e.opacity,f);b.addValue(e.highlightColor,f);}else{h.push(f);}});});}.bind(this));},_applyDisplayStates:function(p,h,v,s,b){sap.ui.vtm.measure(this,"_applyDisplayStates",function(){var c=p.getViewport();c.setVisibility(h,false,false);if(v.length){c.setVisibility(v,true,false);s.forEach(function(d,o){c.setOpacity(d,o,false);});b.forEach(function(d,e){c.setHighlightColor(d,e,false);});}});}});return D;});
