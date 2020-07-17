/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/rta/command/BaseCommand","sap/ui/rta/ControlTreeModifier","sap/ui/core/util/reflection/JsControlTreeModifier","sap/ui/fl/FlexControllerFactory","sap/ui/fl/Utils","sap/base/Log","sap/base/util/merge"],function(B,R,J,F,a,L,m){"use strict";var b=B.extend("sap.ui.rta.command.FlexCommand",{metadata:{library:"sap.ui.rta",properties:{changeType:{type:"string"},jsOnly:{type:"boolean"},selector:{type:"object"}},associations:{},events:{}}});b.prototype.getElementId=function(){var e=this.getElement();return e?e.getId():this.getSelector().id;};b.prototype.getAppComponent=function(){var e=this.getElement();return e?a.getAppComponentForControl(e):this.getSelector().appComponent;};b.prototype.prepare=function(f,v){if(!this.getSelector()&&f&&f.templateSelector){var s={id:f.templateSelector,appComponent:this.getAppComponent(),controlType:a.getControlType(sap.ui.getCore().byId(f.templateSelector))};this.setSelector(s);}else if(!this.getSelector()&&this.getElement()){var s={id:this.getElement().getId(),appComponent:this.getAppComponent(),controlType:a.getControlType(this.getElement())};this.setSelector(s);}try{this._oPreparedChange=this._createChange(f,v);}catch(e){L.error(e.message||e.name);return false;}return true;};b.prototype.getPreparedChange=function(){if(!this._oPreparedChange){this.prepare();}return this._oPreparedChange;};b.prototype.execute=function(){var c=this.getPreparedChange();return this._applyChange(c);};b.prototype._getChangeSpecificData=function(){return{changeType:this.getChangeType(),selector:{id:this.getElementId()}};};b.prototype._createChange=function(f,v){return this._createChangeFromData(this._getChangeSpecificData(),f,v);};b.prototype._createChangeFromData=function(c,f,v){if(f){c=m({},c,f);}c.jsOnly=this.getJsOnly();var M=this.getAppComponent().getModel("$FlexVariants");var V;if(M&&v){V=M.getCurrentVariantReference(v);}var o=F.createForControl(this.getAppComponent());var d={"variantManagementReference":v,"variantReference":V};if(V){c=Object.assign({},c,d);}var C=o.createChange(c,this._validateControlForChange(f));if(f&&f.originalSelector){C.addDependentControl(f.originalSelector,"originalSelector",{modifier:J,appComponent:this.getAppComponent()});C.getDefinition().selector=J.getSelector(this.getSelector().id,this.getSelector().appComponent);C.setContent(Object.assign({},C.getContent(),f.content));}return C;};b.prototype.undo=function(){function e(M,c){var C=c.controlType?c.controlType:J.getControlType(c);var E="Undo is not possible for control type: "+C+". Reason: "+M;return E;}return Promise.resolve().then(function(){var c=this.getElement()||this.getSelector();var C=this.getPreparedChange();if(C.getRevertData()){var f=F.createForControl(this.getAppComponent());var r=f.isChangeHandlerRevertible(C,c,undefined);if(!r){L.error(e("No revert change function available to handle revert data.",c));return;}return f.revertChangesOnControl([C],this.getAppComponent(true));}else if(this._aRecordedUndo){R.performUndo(this._aRecordedUndo);}else{L.error(e("Undo is not available.",c));}}.bind(this));};b.prototype._applyChange=function(c,n){var C=c.change||c;var A=this.getAppComponent();var s=R.bySelector(C.getSelector(),A);var f=F.createForControl(A);var d=f._getControlIfTemplateAffected(C,s,s.getMetadata().getName(),{modifier:J,appComponent:A});var r=f.isChangeHandlerRevertible(C,d.control);var p={modifier:r?J:R,appComponent:A,view:a.getViewForControl(s)};if(!r){R.startRecordingUndo();}return Promise.resolve().then(function(){if(f.checkForOpenDependenciesForControl(C.getSelector(),p.modifier,A)){throw Error("The following Change cannot be applied because of a dependency: "+C.getId());}}).then(function(){return f.checkTargetAndApplyChange(C,s,p);}).then(function(o){if(o.success){if(n){f.removeFromAppliedChangesOnControl(C,A,s);}}return o;}).then(function(o){if(!r){if(!C.getUndoOperations()){this._aRecordedUndo=R.stopRecordingUndo();}else{this._aRecordedUndo=C.getUndoOperations();C.resetUndoOperations();}}if(!o.success){return Promise.reject(o.error);}}.bind(this));};b.prototype._validateControlForChange=function(f){if(f&&f.originalSelector&&f.content&&f.content.boundAggregation){return{id:f.originalSelector,appComponent:this.getAppComponent(),controlType:a.getControlType(sap.ui.getCore().byId(f.originalSelector))};}else{return this.getElement()||this.getSelector();}};return b;},true);