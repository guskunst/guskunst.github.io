sap.ui.define(["sap/ui/base/EventProvider"],function(E){"use strict";var A=E.extend("sap.ui.vk.tools.AnchorPointToolHandler",{metadata:{},constructor:function(t){this._tool=t;this._gizmo=t.getGizmo();this._rect=null;this._rayCaster=new THREE.Raycaster();this._handleIndex=-1;this._gizmoIndex=-1;this._handleAxis=new THREE.Vector3();this._gizmoOrigin=new THREE.Vector3();this._matrixOrigin=new THREE.Matrix4();this._mouse=new THREE.Vector2();}});A.prototype.destroy=function(){this._tool=null;this._gizmo=null;this._rect=null;this._rayCaster=null;this._handleAxis=null;this._gizmoOrigin=null;this._mouse=null;};A.prototype._updateMouse=function(e){var s=this.getViewport().getRenderer().getSize();this._mouse.x=((e.x-this._rect.x)/s.width)*2-1;this._mouse.y=((e.y-this._rect.y)/s.height)*-2+1;this._rayCaster.setFromCamera(this._mouse,this.getViewport().getCamera().getCameraRef());};A.prototype._updateHandles=function(e,h){var p=this._handleIndex;this._handleIndex=-1;if(e.n===1){for(var i=0,l=this._gizmo.getGizmoCount();i<l;i++){var t=this._gizmo.getTouchObject(i);var a=this._rayCaster.intersectObject(t,true);if(a.length>0){this._handleIndex=t.children.indexOf(a[0].object);if(this._handleIndex>=0){this._gizmoIndex=i;this._gizmoOrigin.setFromMatrixPosition(t.matrixWorld);this._matrixOrigin.copy(t.matrixWorld);if(this._handleIndex<3){this._handleAxis.setFromMatrixColumn(t.matrixWorld,this._handleIndex).normalize();}else if(this._handleIndex<6){this._handleAxis.setFromMatrixColumn(t.matrixWorld,this._handleIndex-3).normalize();}else if(this._handleIndex<9){this._handleAxis.setFromMatrixColumn(t.matrixWorld,this._handleIndex-6).normalize();}}}}}this._gizmo.highlightHandle(this._handleIndex,h||this._handleIndex===-1);if(p!==this._handleIndex){this.getViewport().setShouldRenderFrame();}};A.prototype.hover=function(e){if(this._inside(e)&&!this._gesture){this._updateMouse(e);this._updateHandles(e,true);e.handled|=this._handleIndex>0;}};A.prototype._getAxisOffset=function(){var r=this._rayCaster.ray;var d=this._handleAxis.clone().cross(r.direction).cross(r.direction).normalize();var a=r.origin.clone().sub(this._gizmoOrigin);return d.dot(a)/d.dot(this._handleAxis);};A.prototype._getPlaneOffset=function(){var r=this._rayCaster.ray;var d=this._gizmoOrigin.clone().sub(r.origin);var a=this._handleAxis.dot(d)/this._handleAxis.dot(r.direction);return r.direction.clone().multiplyScalar(a).sub(d);};A.prototype.beginGesture=function(e){if(this._inside(e)&&!this._gesture){this._updateMouse(e);this._updateHandles(e,false);if(this._handleIndex>=0){this._gesture=true;e.handled=true;this._gizmo.beginGesture();if(this._handleIndex<3){this._dragOrigin=this._getAxisOffset();}else if(this._handleIndex<6){this._dragOrigin=this._getPlaneOffset();}else if(this._handleIndex<9){this._dragOrigin=this._getPlaneOffset().normalize();}}}};A.prototype.move=function(e){if(this._gesture){e.handled=true;this._updateMouse(e);if(this._handleIndex<3){if(isFinite(this._dragOrigin)){this._gizmo._setOffset(this._handleAxis.clone().multiplyScalar(this._getAxisOffset()-this._dragOrigin),this._gizmoIndex);}}else if(this._handleIndex<6){if(isFinite(this._dragOrigin.x)&&isFinite(this._dragOrigin.y)&&isFinite(this._dragOrigin.z)){this._gizmo._setOffset(this._getPlaneOffset().sub(this._dragOrigin),this._gizmoIndex);}}else if(this._handleIndex<9){var d=this._dragOrigin,a=this._getPlaneOffset().normalize(),b=new THREE.Vector3().setFromMatrixColumn(this._matrixOrigin,(this._handleIndex+1)%3).normalize(),c=new THREE.Vector3().setFromMatrixColumn(this._matrixOrigin,(this._handleIndex+2)%3).normalize(),f=Math.atan2(d.dot(c),d.dot(b)),g=Math.atan2(a.dot(c),a.dot(b));if(isFinite(f)&&isFinite(g)){this._gizmo._setRotationAxisAngle(this._handleIndex-6,f,g);}}}};A.prototype.endGesture=function(e){if(this._gesture){this._gesture=false;e.handled=true;this._updateMouse(e);this._gizmo.endGesture();this._dragOrigin=undefined;this._updateHandles(e,true);this.getViewport().setShouldRenderFrame();}};A.prototype.getViewport=function(){return this._tool._viewport;};A.prototype._getOffset=function(o){var r=o.getBoundingClientRect();var p={x:r.left+window.pageXOffset,y:r.top+window.pageYOffset};return p;};A.prototype._inside=function(e){if(this._rect===null||true){var i=this._tool._viewport.getIdForLabel();var d=document.getElementById(i);if(d===null){return false;}var o=this._getOffset(d);this._rect={x:o.x,y:o.y,w:d.offsetWidth,h:d.offsetHeight};}return(e.x>=this._rect.x&&e.x<=this._rect.x+this._rect.w&&e.y>=this._rect.y&&e.y<=this._rect.y+this._rect.h);};return A;},true);