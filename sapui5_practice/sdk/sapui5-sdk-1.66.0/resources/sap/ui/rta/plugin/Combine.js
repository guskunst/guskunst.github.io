/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/rta/plugin/Plugin','sap/ui/rta/Utils','sap/ui/rta/util/BindingsExtractor','sap/ui/dt/Util'],function(P,U,B,D){"use strict";var C=P.extend("sap.ui.rta.plugin.Combine",{metadata:{library:"sap.ui.rta",properties:{},associations:{},events:{}}});C.prototype._isEditable=function(o){var c=this.getAction(o);if(!o.isRoot()&&c&&c.changeType&&c.changeOnRelevantContainer){var r=o.getRelevantContainer();return this.hasChangeHandler(c.changeType,r)&&this.hasStableId(o)&&this._checkRelevantContainerStableID(c,o);}else{return false;}};C.prototype._checkForSameRelevantContainer=function(e){var r=[];for(var i=0,n=e.length;i<n;i++){r[i]=e[i].getRelevantContainer();var c=this.getAction(e[i]);if(!c||!c.changeType){return false;}if(i>0){if((r[0]!==r[i])||(this.getAction(e[0]).changeType!==c.changeType)){return false;}}}return true;};C.prototype._checkBindingCompatibilityOfControls=function(c,m){return c.every(function(s){return c.every(function(t){return s!==t?U.checkSourceTargetBindingCompatibility(s,t,m):true;});});};C.prototype.isAvailable=function(e){if(e.length<=1){return false;}return(e.every(function(E){return this._isEditableByPlugin(E);},this)&&this._checkForSameRelevantContainer(e));};C.prototype.isEnabled=function(e){if(!this.isAvailable(e)||e.length<=1){return false;}var c=e.map(function(E){return E.getElement();});var a=e.every(function(E){var A=this.getAction(E);if(!A){return false;}if(typeof A.isEnabled!=="undefined"){if(typeof A.isEnabled==="function"){return A.isEnabled(c);}else{return A.isEnabled;}}return true;},this);if(a){var d=c[0]&&c[0].getModel();return this._checkBindingCompatibilityOfControls(c,d);}return a;};C.prototype.handleCombine=function(e,c){var o;var E=e.map(function(b){if(b.getElement().getId()===c.getId()){o=b;}return b.getElement();});var d=o.getDesignTimeMetadata();var a=this.getAction(o);var v=this.getVariantManagementReference(o,a);return this.getCommandFactory().getCommandFor(c,"combine",{source:c,combineElements:E},d,v).then(function(b){this.fireElementModified({"command":b});}.bind(this)).catch(function(m){throw D.createError("Combine#handleCombine",m,"sap.ui.rta");});};C.prototype.getMenuItems=function(e){return this._getMenuItems(e,{pluginId:"CTX_GROUP_FIELDS",rank:90,icon:"sap-icon://combine"});};C.prototype.getActionName=function(){return"combine";};C.prototype.handler=function(e,p){this.handleCombine(e,p.contextElement);};return C;},true);
