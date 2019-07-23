/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","./ViewportBase","./ContentConnector","./ViewStateManager","./ViewportRenderer"],function(q,V,C,a,b){"use strict";var c=V.extend("sap.ui.vk.Viewport",{metadata:{library:"sap.ui.vk",designtime:"sap/ui/vk/designtime/Viewport.designtime"}});var d=c.getMetadata().getParent().getClass().prototype;c.prototype.init=function(){if(d.init){d.init.call(this);}this._implementation=null;};c.prototype.exit=function(){this._destroyImplementation();if(d.exit){d.exit.call(this);}};c.prototype.getImplementation=function(){return this._implementation;};c.prototype._destroyImplementation=function(){if(this._implementation){this._implementation.destroy();this._implementation=null;}return this;};c.prototype.getShowDebugInfo=function(){if(this._implementation){return this._implementation.getShowDebugInfo();}return d.getShowDebugInfo.call(this);};c.prototype.setShowDebugInfo=function(v){d.setShowDebugInfo.call(this,v);if(this._implementation){this._implementation.setShowDebugInfo(v);}return this;};c.prototype.getBackgroundColorTop=function(){if(this._implementation){return this._implementation.getBackgroundColorTop();}return d.getBackgroundColorTop.call(this);};c.prototype.setBackgroundColorTop=function(v){d.setBackgroundColorTop.call(this,v);if(this._implementation){this._implementation.setBackgroundColorTop(v);}return this;};c.prototype.getBackgroundColorBottom=function(){if(this._implementation){return this._implementation.getBackgroundColorBottom();}return d.getBackgroundColorBottom.call(this);};c.prototype.setBackgroundColorBottom=function(v){d.setBackgroundColorBottom.call(this,v);if(this._implementation){this._implementation.setBackgroundColorBottom(v);}return this;};c.prototype.setWidth=function(v){d.setWidth.call(this,v);if(this._implementation){this._implementation.setWidth(v);}return this;};c.prototype.setHeight=function(v){d.setHeight.call(this,v);if(this._implementation){this._implementation.setHeight(v);}return this;};c.prototype.setSelectionMode=function(v){d.setSelectionMode.call(this,v);if(this._implementation){this._implementation.setSelectionMode(v);}return this;};c.prototype.getSelectionMode=function(){if(this._implementation){return this._implementation.getSelectionMode();}return d.getSelectionMode.call(this);};c.prototype.setCamera=function(v){d.setCamera.call(this,v);if(this._implementation){this._implementation.setCamera(v);return this;}return this;};c.prototype.getCamera=function(){if(this._implementation){return this._implementation.getCamera();}return d.getCamera.call(this);};c.prototype.setShouldRenderFrame=function(){if(this._implementation){this._implementation.setShouldRenderFrame();}return this;};c.prototype.shouldRenderFrame=function(){if(this._implementation){this._implementation.shouldRenderFrame();}};c.prototype.setRenderMode=function(v){if(this._implementation&&this._implementation.setRenderMode){this._implementation.setRenderMode(v);}return this;};c.prototype.getRenderMode=function(){if(this._implementation&&this._implementation.getRenderMode){return this._implementation.getRenderMode();}return sap.ui.vk.RenderMode.Default;};c.prototype.setFreezeCamera=function(v){d.setFreezeCamera.call(this,v);if(this._implementation){this._implementation.setFreezeCamera(v);}return this;};c.prototype.showHotspots=function(n,j,k){if(this._implementation&&this._implementation.showHotspots){this._implementation.showHotspots(n,j,k);}return this;};c.prototype.addTool=function(t){this.addAssociation("tools",t);if(this._implementation){this._implementation.addTool(t);}};c.prototype.removeTool=function(t){this.removeAssociation("tools",t);if(this._implementation){this._implementation.removeTool(t);}};c.prototype.getTools=function(){if(this._implementation){return this._implementation.getTools();}this.getAssociation("tools");};c.prototype.removeAllTools=function(){this.removeAllAssociation("tools");if(this._implementation){this._implementation.removeAllTools();}};c.prototype.addContent=function(j){if(this._implementation){this._implementation.addContent(j);}else{this.addAggregation("content",j);}};c.prototype.removeContent=function(j){if(this._implementation){this._implementation.removeContent(j);}else{this.removeAggregation("content",j);}};c.prototype.getContents=function(){if(this._implementation){return this._implementation.getContents();}return this.getAggregation("content");};c.prototype.removeAllContents=function(){if(this._implementation){this._implementation.removeAllContents();}else{this.removeAggregation("content");}};c.prototype.startAnimation=function(p){if(this._implementation&&this._implementation.startAnimation){this._implementation.startAnimation(p);}};c.prototype.stopAnimation=function(){if(this._implementation&&this._implementation.stopAnimation){this._implementation.stopAnimation();}};c.prototype.playProcedure=function(m,v,j){if(this._implementation&&this._implementation.playProcedure){this._implementation.playProcedure(m,v,j);}};c.prototype.activateView=function(v){if(this._implementation&&this._implementation.activateView){this._implementation.activateView(v);}};c.prototype.pauseAnimation=function(){if(this._implementation&&this._implementation.pauseAnimation){return this._implementation.pauseAnimation();}};c.prototype.resumeAnimation=function(){if(this._implementation&&this._implementation.resumeAnimation){return this._implementation.resumeAnimation();}};c.prototype.toggleAnimationPauseStatus=function(){if(this._implementation&&this._implementation.toggleAnimationPauseStatus){return this._implementation.toggleAnimationPauseStatus();}};c.prototype._setContent=function(j){var k=null;var l=null;if(j){k=j;if(!(k instanceof sap.ui.vk.Scene)){k=null;}l=j.camera;if(!(l instanceof sap.ui.vk.Camera)){l=null;}}this._setScene(k);if(l){this.setCamera(l);}};c.prototype._onAfterUpdateContentConnector=function(){this._setContent(this._contentConnector.getContent());};c.prototype._onBeforeClearContentConnector=function(){if(d._onBeforeClearContentConnector){d._onBeforeClearContentConnector.call(this);}this._setScene(null);};c.prototype._handleContentReplaced=function(j){var k=j.getParameter("newContent");this._setContent(k);};c.prototype._setScene=function(j){if(j instanceof sap.ui.vk.Scene){var k=j.getMetadata().getName(),l=this._implementation&&this._implementation.getMetadata().getName(),r=k==="sap.ui.vk.dvl.Scene"&&l==="sap.ui.vk.dvl.Viewport"||k==="sap.ui.vk.threejs.Scene"&&l==="sap.ui.vk.threejs.Viewport";if(!r){this._destroyImplementation();var n;var t=this;var m=this.getCamera();if(k==="sap.ui.vk.dvl.Scene"){n="sap.ui.vk.dvl.Viewport";}else if(k==="sap.ui.vk.threejs.Scene"){n="sap.ui.vk.threejs.Viewport";}if(n){q.sap.require(n);this._implementation=new(q.sap.getObject(n))({viewStateManager:this.getViewStateManager(),tools:this.getAssociation("tools"),animationTimeSlider:this.getAssociation("animationTimeSlider"),urlClicked:function(o){t.fireUrlClicked({nodeRef:o.getParameter("nodeRef"),url:o.getParameter("url")});},nodeClicked:function(o){t.fireNodeClicked({nodeRef:o.getParameter("nodeRef"),x:o.getParameter("x"),y:o.getParameter("y")});},resize:function(o){t.fireResize({size:o.getParameter("size")});},nodesPicked:function(o){t.fireNodesPicked({picked:o.getParameter("picked")});},nodeZoomed:function(o){t.fireNodeZoomed({zoomed:o.getParameter("zoomed"),isZoomIn:o.getParameter("isZoomIn")});},viewActivated:function(o){t.fireViewActivated({viewIndex:o.getParameter("viewIndex"),type:o.getParameter("type")});},viewFinished:function(o){t.fireViewFinished({viewIndex:o.getParameter("viewIndex")});},procedureFinished:function(o){t.fireProcedureFinished();},showDebugInfo:this.getShowDebugInfo(),width:this.getWidth(),height:this.getHeight(),backgroundColorTop:this.getBackgroundColorTop(),backgroundColorBottom:this.getBackgroundColorBottom(),selectionMode:this.getSelectionMode(),freezeCamera:this.getFreezeCamera(),contentConnector:this.getContentConnector()});if(m){this._camera=null;this._implementation.setCamera(m);}}this.invalidate();}}else{this._destroyImplementation();this.invalidate();}return this;};c.prototype._onAfterUpdateViewStateManager=function(){if(this._implementation){this._implementation.setViewStateManager(this._viewStateManager);}};c.prototype._onBeforeClearViewStateManager=function(){if(this._implementation){this._implementation.setViewStateManager(null);}};c.prototype.activateView=function(v,j){if(this._implementation){this._implementation.activateView(v,j);return this;}else{q.sap.log.error("no implementation");return this;}};c.prototype.zoomTo=function(w,n,j,m){if(this._implementation){this._implementation.zoomTo(w,n,j,m);}else{q.sap.log.error("zoomTo: no implementation");}return this;};c.prototype.tap=function(x,y,j){if(this._implementation){this._implementation.tap(x,y,j);}return this;};var s=function(j){j.camera={};};var e=function(j){if(typeof j.camera==="object"&&j.camera!==null){j.camera.matrices=false;}};var f=function(j){if(typeof j.camera==="object"&&j.camera!==null){j.camera.useTransitionCamera=false;}};var g=function(j){j.animation=true;};var h=function(j){j.visibility=false;};var i=function(j){if(typeof j.visibility==="object"&&j.visibility!==null){j.visibility.mode=sap.ui.vk.VisibilityMode.Complete;}};c.prototype.getViewInfo=function(j){if(!this._implementation){q.sap.log.error("no implementation");return null;}var k={};if(typeof j!=="object"||j===null){s(k);e(k);f(k);g(k);h(k);i(k);}else{if(typeof j.camera==="object"&&j.camera!==null){k.camera={};if(typeof j.camera.matrices==="boolean"){k.camera.matrices=j.camera.matrices;}else if("matrices"in j.camera){k.camera.matrices=false;}else{e(k);}if(typeof j.camera.useTransitionCamera==="boolean"){k.camera.useTransitionCamera=j.camera.useTransitionCamera;}else if("useTransitionCamera"in j.camera){k.camera.useTransitionCamera=false;}else{f(k);}}else if(typeof j.camera==="boolean"){if(j.camera===true){k.camera={};e(k);f(k);}else{k.camera=false;}}else if("camera"in j){k.camera=false;}else{s(k);e(k);f(k);}if(typeof j.animation==="boolean"){k.animation=j.animation;}else if("animation"in j){k.animation=false;}else{g(k);}if(typeof j.visibility==="object"&&j.visibility!==null){k.visibility={};if(j.visibility.mode===sap.ui.vk.VisibilityMode.Complete||j.visibility.mode===sap.ui.vk.VisibilityMode.Differences){k.visibility.mode=j.visibility.mode;}else{i(k);}}else if(typeof j.visibility==="boolean"){if(j.visibility===true){k.visibility={};i(k);}else{k.visibility=false;}}else if("visibility"in j){k.visibility=false;}else{h(k);i(k);}}return this._implementation.getViewInfo(k);};c.prototype.setViewInfo=function(v,j){if(this._implementation){this._implementation.setViewInfo(v,j);}else{q.sap.log.error("no implementation");}return this;};c.prototype.getImage=function(w,j,t,k,l){if(this._implementation&&this._implementation.getImage){return this._implementation.getImage(w,j,t,k,l);}return null;};c.prototype.setAnimationTimeSlider=function(j){this.setAssociation("animationTimeSlider",j,true);if(this._implementation&&this._implementation.setAnimationTimeSlider){this._implementation.setAnimationTimeSlider(j);}};c.prototype.getAnimationTimeSlider=function(){if(this._implementation&&this._implementation.getAnimationTimeSlider){return this._implementation.getAnimationTimeSlider();}return this.getAssociation("animationTimeSlider");};C.injectMethodsIntoClass(c);a.injectMethodsIntoClass(c);return c;});
