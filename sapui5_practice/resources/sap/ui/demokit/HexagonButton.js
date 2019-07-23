/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/Control','./library',"./HexagonButtonRenderer"],function(C,l,H){"use strict";var a=C.extend("sap.ui.demokit.HexagonButton",{metadata:{library:"sap.ui.demokit",properties:{icon:{type:"string",group:"Misc",defaultValue:null},color:{type:"string",group:"Misc",defaultValue:'blue'},position:{type:"string",group:"Misc",defaultValue:null},enabled:{type:"boolean",group:"Misc",defaultValue:true},imagePosition:{type:"string",group:"Misc",defaultValue:null}},events:{press:{}}}});a.prototype.onclick=function(b){if(this.getEnabled()){this.firePress({id:this.getId()});}b.preventDefault();b.stopPropagation();};a.prototype._attachPress=a.prototype.attachPress;a.prototype.attachPress=function(){this._attachPress.apply(this,arguments);this.invalidate();return this;};a.prototype._detachPress=a.prototype.detachPress;a.prototype.detachPress=function(){this._detachPress.apply(this,arguments);this.invalidate();return this;};return a;});
