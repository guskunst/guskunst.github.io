/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/rta/plugin/Plugin","sap/ui/dt/OverlayRegistry","sap/ui/dt/OverlayUtil","sap/ui/dt/Util","sap/base/util/includes"],function(P,O,a,D,b){"use strict";var S=P.extend("sap.ui.rta.plugin.Stretch",{metadata:{library:"sap.ui.rta",properties:{},associations:{stretchCandidates:{type:"sap.ui.core.Control",multiple:true}},events:{}}});S.STRETCHSTYLECLASS="sapUiRtaStretchPaddingTop";S.prototype.setDesignTime=function(d){P.prototype.setDesignTime.apply(this,arguments);if(d){d.attachEventOnce("synced",this._onDTSynced,this);}};S.prototype.exit=function(){if(this.getDesignTime()){this.getDesignTime().detachEvent("elementOverlayAdded",this._onElementOverlayChanged);this.getDesignTime().detachEvent("elementOverlayMoved",this._onElementOverlayChanged);this.getDesignTime().detachEvent("elementPropertyChanged",this._onElementPropertyChanged);this.getDesignTime().detachEvent("elementOverlayEditableChanged",this._onElementOverlayEditableChanged);this.getDesignTime().detachEvent("elementOverlayDestroyed",this._onElementOverlayDestroyed);}};S.prototype.addStretchCandidate=function(o){var e=o.getElement();if(!b(this.getStretchCandidates(),e.getId())){this.addAssociation("stretchCandidates",e);}};S.prototype.removeStretchCandidate=function(o){this.removeAssociation("stretchCandidates",o.getElement());this._toggleStyleClass(o,false);};S.prototype.registerElementOverlay=function(o){this._checkParentAndAddToStretchCandidates(o);o.attachElementModified(this._onElementModified,this);P.prototype.registerElementOverlay.apply(this,arguments);};S.prototype.deregisterElementOverlay=function(o){this._toggleStyleClass(o,false);};S.prototype._isEditable=function(){return false;};S.prototype._onDTSynced=function(){this._setStyleClassForAllStretchCandidates();this.getDesignTime().attachEvent("elementOverlayAdded",this._onElementOverlayChanged,this);this.getDesignTime().attachEvent("elementOverlayMoved",this._onElementOverlayChanged,this);this.getDesignTime().attachEvent("elementPropertyChanged",this._onElementPropertyChanged,this);this.getDesignTime().attachEvent("elementOverlayEditableChanged",this._onElementOverlayEditableChanged,this);this.getDesignTime().attachEvent("elementOverlayDestroyed",this._onElementOverlayDestroyed,this);};S.prototype._onElementModified=function(e){if(this.getDesignTime().getBusyPlugins().length){return;}var p=e.getParameters();var o=e.getSource();if(p.type==="afterRendering"){if(!this.fnDebounced){this.fnDebounced=D.debounce(function(){this._setStyleClassForAllStretchCandidates(this._getNewStretchCandidates(this._aOverlaysCollected));this._aOverlaysCollected=[];this.fnDebounced=undefined;}.bind(this),16);}if(!this._aOverlaysCollected){this._aOverlaysCollected=[];}if(!b(this._aOverlaysCollected,o)){this._aOverlaysCollected.push(o);this.fnDebounced();}}};S.prototype._onElementOverlayDestroyed=function(e){if(this.getDesignTime().getBusyPlugins().length){return;}var n=[];var p=e.getParameters().elementOverlay.getParentElementOverlay();if(p&&!p._bIsBeingDestroyed){var r=this._getRelevantOverlays(p).filter(function(o){return o.getElement();});n=this._getNewStretchCandidates(r);}this._setStyleClassForAllStretchCandidates(n);};S.prototype._onElementOverlayEditableChanged=function(e){if(this.getDesignTime().getBusyPlugins().length){return;}var o=sap.ui.getCore().byId(e.getParameters().id);var c=this._getRelevantOverlaysOnEditableChange(o);this._setStyleClassForAllStretchCandidates(c);};S.prototype._onElementPropertyChanged=function(e){if(this.getDesignTime().getBusyPlugins().length){return;}var o=O.getOverlay(e.getParameters().id);var r=this._getRelevantOverlays(o);var d=D.debounce(function(){if(!this.bIsDestroyed&&!o.bIsDestroyed){var n=this._getNewStretchCandidates(r).concat(this._getRelevantOverlaysOnEditableChange(o));n=n.filter(function(i,p,A){return A.indexOf(i)===p;});this._setStyleClassForAllStretchCandidates(n);}}.bind(this));r.forEach(function(o){o.attachEventOnce("geometryChanged",d);});};S.prototype._onElementOverlayChanged=function(e){if(this.getDesignTime().getBusyPlugins().length){return;}var r=this._getRelevantOverlays(sap.ui.getCore().byId(e.getParameters().id));var n=this._getNewStretchCandidates(r);this._setStyleClassForAllStretchCandidates(n);};S.prototype._getRelevantOverlaysOnEditableChange=function(o){var r=b(this.getStretchCandidates(),o.getElement().getId())?[o.getElement().getId()]:[];var p=o.getParentAggregationOverlay();if(!p){return r;}var c=p.getChildren();c.splice(c.indexOf(o),1);var A=c.some(function(o){return o.getEditable()&&o.getGeometry();});if(A){return r;}return r.concat(this._getRelevantParents(o));};S.prototype._getRelevantParents=function(o){var r=[];for(var i=0;i<25;i++){o=o.getParentElementOverlay();if(!o){return r;}if(!b(this.getStretchCandidates(),o.getElement().getId())){return r;}r.push(o.getElement().getId());}};S.prototype._getNewStretchCandidates=function(o){var n=[];o.forEach(function(c){if(this._reevaluateStretching(c)){n.push(c.getElement().getId());}},this);return n;};S.prototype._reevaluateStretching=function(o){if(!o.bIsDestroyed){var e=o.getAssociatedDomRef();if(e){var i=e.hasClass(S.STRETCHSTYLECLASS);var s=this._childrenAreSameSize(o,undefined,i);if(i&&!s){this.removeStretchCandidate(o);}else if(!i&&s){this.addStretchCandidate(o);return true;}}}};S.prototype._checkParentAndAddToStretchCandidates=function(o){var p=o.getParentElementOverlay();var $=p&&p.getAssociatedDomRef();if($){if(this._startAtSamePosition(p,o)){if(this._childrenAreSameSize(p)){this.addStretchCandidate(p);}}}};S.prototype._startAtSamePosition=function(p,o){if(p&&p.getGeometry()&&o.getGeometry()){if(p.getGeometry().position.top===o.getGeometry().position.top&&p.getGeometry().position.left===o.getGeometry().position.left){return true;}}};S.prototype._childrenAreSameSize=function(r,c,i){var p=r.getGeometry();if(!p){return false;}var h=p.size.height;if(i){h-=parseInt(r.getElement().$().css("padding-top"));}var d=Math.round(p.size.width)*Math.round(h);c=c||a.getAllChildOverlays(r);var C=c.map(function(f){return f.getGeometry();});var o=a.getGeometry(C);if(!o){return false;}var e=Math.round(o.size.width)*Math.round(o.size.height);return e===d;};S.prototype._atLeastOneDescendantEditable=function(r,c){var A=c.some(function(o){return o.getEditable()&&o.getGeometry();});if(A){return true;}else{var C=[];c.forEach(function(o){C=C.concat(a.getAllChildOverlays(o));});if(!C.length>0){return false;}if(this._childrenAreSameSize(r,C)){return this._atLeastOneDescendantEditable(r,C);}}};S.prototype._setStyleClassForAllStretchCandidates=function(s){if(!Array.isArray(s)){s=this.getStretchCandidates();}s.forEach(function(e){var o=O.getOverlay(e);var c=a.getAllChildOverlays(o);var A=this._atLeastOneDescendantEditable(o,c);var d=o.getEditable()&&A;this._toggleStyleClass(o,d);},this);};S.prototype._toggleStyleClass=function(o,A){var e=o.getAssociatedDomRef();if(e){if(A){e.addClass(S.STRETCHSTYLECLASS);}else{e.removeClass(S.STRETCHSTYLECLASS);}}};return S;},true);