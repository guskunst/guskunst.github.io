/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/rta/plugin/Plugin','sap/ui/rta/Utils','sap/ui/rta/command/CompositeCommand','sap/ui/dt/OverlayRegistry',"sap/ui/events/KeyCodes","sap/base/Log"],function(P,U,C,O,K,L){"use strict";var R=P.extend("sap.ui.rta.plugin.Remove",{metadata:{library:"sap.ui.rta",properties:{},associations:{},events:{}}});R.prototype.registerElementOverlay=function(o){if(this.isEnabled([o])){o.attachBrowserEvent("keydown",this._onKeyDown,this);}P.prototype.registerElementOverlay.apply(this,arguments);};R.prototype._isEditable=function(e){var E=false;var o=e.getElement();var r=this.getAction(e);if(r&&r.changeType){if(r.changeOnRelevantContainer){o=e.getRelevantContainer();}E=this.hasChangeHandler(r.changeType,o)&&this._checkRelevantContainerStableID(r,e);}if(E){return this.hasStableId(e);}return E;};R.prototype.isEnabled=function(e){var E=e[0];var a=this.getAction(E);var i=false;if(!a){return i;}if(typeof a.isEnabled!=="undefined"){if(typeof a.isEnabled==="function"){i=a.isEnabled(E.getElement());}else{i=a.isEnabled;}}else{i=true;}return i&&this._canBeRemovedFromAggregation(e);};R.prototype._canBeRemovedFromAggregation=function(e){var o=e[0];var E=o.getElement();var p=E.getParent();if(!p){return false;}var a=p.getAggregation(E.sParentAggregationName);if(!Array.isArray(a)){return true;}if(a.length===1){return false;}var n=e.length;var i=a.filter(function(E){var b=O.getOverlay(E);return!(b&&b.getElementVisibility());});return!(i.length===(a.length-n));};R.prototype._getConfirmationText=function(o){var a=this.getAction(o);if(a&&a.getConfirmationText){return a.getConfirmationText(o.getElement());}};R.prototype.deregisterElementOverlay=function(o){if(this.isEnabled([o])){o.detachBrowserEvent("keydown",this._onKeyDown,this);}P.prototype.deregisterElementOverlay.apply(this,arguments);};R.prototype._onKeyDown=function(e){if(e.keyCode===K.DELETE){e.stopPropagation();this.removeElement();}};R.prototype.removeElement=function(e){var t=e?e:this.getSelectedOverlays();t=t.filter(function(E){return this.isEnabled([E]);},this);if(t.length>0){this.handler(t);}};R.prototype._getRemoveCommand=function(r,d,v){return this.getCommandFactory().getCommandFor(r,"Remove",{removedElement:r},d,v);};R.prototype._fireElementModified=function(c){if(c.getCommands().length){this.fireElementModified({"command":c});}};R.prototype.handler=function(e){var p=[];var c=new C();function s(o){o.setSelected(true);setTimeout(function(){o.focus();},0);}var n=R._getElementToFocus(e);e.forEach(function(o){var r=o.getElement();var d=o.getDesignTimeMetadata();var a=this.getAction(o);var v=this.getVariantManagementReference(o,a);var b=this._getConfirmationText(o);p.push(Promise.resolve().then(function(){if(b){return U.openRemoveConfirmationDialog(r,b);}return true;}).then(function(f){if(!f){throw Error("Cancelled");}return this._getRemoveCommand(r,d,v);}.bind(this)).then(function(f){c.addCommand(f);}).catch(function(E){if(E&&E.message==="Cancelled"){if(e.length===1){n=o;}}else{throw E;}}));o.setSelected(false);},this);if(p.length){return Promise.all(p).then(function(){s(n);this._fireElementModified(c);}.bind(this)).catch(function(E){L.error("Error during remove: ",E);});}};R._getElementToFocus=function(s){var n;if(s.length===1){var o=s[0];var S=o.getParent().getAggregation(o.sParentAggregationName);if(S.length>1){var i=S.indexOf(o);var c=S.slice(i+1);if(i!==0){c=c.concat(S.slice(0,i).reverse());}n=c.filter(function(a){return a.getElement().getVisible();}).shift();}}if(!n){n=O.getOverlay(s[0].getRelevantContainer());}return n;};R.prototype.getMenuItems=function(e){return this._getMenuItems(e,{pluginId:"CTX_REMOVE",rank:60,icon:"sap-icon://decline"});};R.prototype.getActionName=function(){return"remove";};return R;},true);