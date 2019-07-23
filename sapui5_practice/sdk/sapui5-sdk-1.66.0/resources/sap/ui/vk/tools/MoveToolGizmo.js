/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","./library","./Gizmo"],function(q,c,G){"use strict";var M=G.extend("sap.ui.vk.tools.MoveToolGizmo",{metadata:{library:"sap.ui.vk.tools"}});M.prototype.init=function(){if(G.prototype.init){G.prototype.init.apply(this);}this._viewport=null;this._tool=null;this._sceneGizmo=new THREE.Scene();var l=new THREE.DirectionalLight(0xFFFFFF,0.5);l.position.set(1,3,2);this._sceneGizmo.add(l);this._sceneGizmo.add(new THREE.AmbientLight(0xFFFFFF,0.5));this._gizmo=new THREE.Group();this._touchAreas=new THREE.Group();this._sceneGizmo.add(this._gizmo);this._coordinateSystem=c.CoordinateSystem.Local;this._nodes=[];this._matViewProj=new THREE.Matrix4();this._gizmoSize=144;this._gizmoOffset=new THREE.Vector3();function e(a,b,t){var h=144,i=window.devicePixelRatio*0.5,j=32,k=6,n=48;a.multiplyScalar(1/h);var o=new THREE.MeshLambertMaterial({color:b,transparent:true});var p=new THREE.CylinderBufferGeometry(i,i,h-j,4);var m=new THREE.Matrix4().makeBasis(new THREE.Vector3(a.y,a.z,a.x),a,new THREE.Vector3(a.z,a.x,a.y));m.setPosition(a.clone().multiplyScalar((h-j)*0.5));p.applyMatrix(m);var r=new THREE.Mesh(p,o);r.matrixAutoUpdate=false;r.userData.color=b;var s=new THREE.CylinderBufferGeometry(0,k,j,12,1);m.setPosition(a.clone().multiplyScalar(h-j*0.5));s.applyMatrix(m);var u=new THREE.Mesh(s,o);u.matrixAutoUpdate=false;r.add(u);var v=new THREE.CylinderGeometry(n*0.5,n*0.5,n,12,1);v.applyMatrix(m);var w=new THREE.CylinderGeometry(n*0.5,n*0.2,n,12,1);m.setPosition(a.clone().multiplyScalar(h*0.5));v.merge(w,m);t.add(new THREE.Mesh(v,o));return r;}function f(a,b,t){var h=new Float32Array(9);h[a]=h[b+6]=1;h[a+3]=h[b+3]=0.5;var v=new THREE.Vector3().setComponent(a,0.333);var i=new THREE.Vector3().setComponent(b,0.333);var g=new THREE.Geometry();g.vertices.push(new THREE.Vector3(),v,i,v.clone().add(i));g.faces.push(new THREE.Face3(0,2,1),new THREE.Face3(1,2,3));var m=new THREE.MeshBasicMaterial({color:0xFFFF00,opacity:0.5,transparent:true,visible:false,side:THREE.DoubleSide});var p=new THREE.Mesh(g,m);p.matrixAutoUpdate=false;p.userData.colors=h;var j=new THREE.BufferGeometry();var k=new Float32Array(9);k[a]=k[a+3]=k[b+3]=k[b+6]=0.333;j.addAttribute("position",new THREE.Float32BufferAttribute(k,3));j.addAttribute("color",new THREE.Float32BufferAttribute(h,3));var n=new THREE.Line(j,new THREE.LineBasicMaterial({vertexColors:THREE.VertexColors,transparent:true,linewidth:window.devicePixelRatio}));n.matrixAutoUpdate=false;p.add(n);var o=new THREE.Geometry();o.vertices.push(new THREE.Vector3(),v,i,v.clone().add(i));o.faces.push(new THREE.Face3(0,1,2),new THREE.Face3(2,1,3));t.add(new THREE.Mesh(o,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})));return p;}this._gizmo.add(e(new THREE.Vector3(1,0,0),c.AxisColours.x,this._touchAreas));this._gizmo.add(e(new THREE.Vector3(0,1,0),c.AxisColours.y,this._touchAreas));this._gizmo.add(e(new THREE.Vector3(0,0,1),c.AxisColours.z,this._touchAreas));this._gizmo.add(f(1,2,this._touchAreas));this._gizmo.add(f(2,0,this._touchAreas));this._gizmo.add(f(0,1,this._touchAreas));this._axisTitles=this._createAxisTitles();this._sceneGizmo.add(this._axisTitles);var g=new THREE.Geometry();g.vertices.push(new THREE.Vector3(),new THREE.Vector3());this._line=new THREE.LineSegments(g,new THREE.LineBasicMaterial());this._line.frustumCulled=false;this._line.visible=false;this._gizmo.add(this._line);};M.prototype.hasDomElement=function(){return false;};M.prototype.getCoordinateSystem=function(){return this._coordinateSystem;};M.prototype.setCoordinateSystem=function(a){this._coordinateSystem=a;var s=a===c.CoordinateSystem.Screen;var g=this._gizmo.children,t=this._touchAreas.children;g[2].visible=g[3].visible=g[4].visible=!s;t[2].visible=t[3].visible=t[4].visible=!s;this._axisTitles.children[2].visible=!s;};M.prototype.show=function(v,t){this._viewport=v;this._tool=t;this._nodes.length=0;this._updateSelection(v._viewStateManager);};M.prototype.hide=function(){this._viewport=null;this._tool=null;};M.prototype.getGizmoCount=function(){if(this._coordinateSystem===c.CoordinateSystem.Local){return this._nodes.length;}else{return this._nodes.length>0?1:0;}};M.prototype.getTouchObject=function(i){if(this._nodes.length===0){return null;}this._updateGizmoObjectTransformation(this._touchAreas,i);return this._touchAreas;};var d=[1,2,4,6,5,3];M.prototype.highlightHandle=function(a,h){var i;for(i=0;i<3;i++){var b=this._gizmo.children[i];var e=d[a]&(1<<i);var f=e?0xFFFF00:b.userData.color;b.material.color.setHex(f);b.material.opacity=(e||h)?1:0.35;b.children[0].material.color.setHex(f);b.children[0].material.opacity=(e||h)?1:0.35;var g=this._axisTitles.children[i];g.material.color.setHex(f);g.material.opacity=e||h?1:0.35;}for(i=3;i<6;i++){var p=this._gizmo.children[i];p.material.visible=i===a;var j=p.children[0].geometry.attributes.color;j.copyArray(i===a?[1,1,0,1,1,0,1,1,0]:p.userData.colors);j.needsUpdate=true;p.children[0].material.opacity=(i===a||h)?1:0.35;}};M.prototype.beginGesture=function(){this._matOrigin=this._gizmo.matrixWorld.clone();this._nodes.forEach(function(n){var a=n.node;n.matOrigin=a.matrixWorld.clone();n.originLocal=a.position.clone();n.origin=new THREE.Vector3().setFromMatrixPosition(a.matrixWorld);n.matParentInv=new THREE.Matrix4().getInverse(a.parent.matrixWorld);});};M.prototype.endGesture=function(){this._line.visible=false;this._tool.fireMoved({x:this._gizmoOffset.x,y:this._gizmoOffset.y,z:this._gizmoOffset.z});};M.prototype._setOffset=function(o,g){if(this._coordinateSystem===c.CoordinateSystem.Local){var n=this._nodes[g];var m=new THREE.Matrix4().getInverse(n.node.matrixWorld);var s=new THREE.Vector3().setFromMatrixScale(n.node.matrixWorld);var a=n.origin.clone().applyMatrix4(m);o=n.origin.clone().add(o).applyMatrix4(m).sub(a).multiply(s);}else if(this._coordinateSystem===c.CoordinateSystem.Screen){var b=this._viewport.getRenderer().getSize();var p=this._gizmo.position.clone().applyMatrix4(this._matViewProj);var e=this._gizmo.position.clone().add(o).applyMatrix4(this._matViewProj);o.set(Math.round((e.x-p.x)*0.5*b.width),Math.round((e.y-p.y)*0.5*b.height),0);}if(this._tool.fireEvent("moving",{x:o.x,y:o.y,z:o.z},true)){this._move(o);if(this._coordinateSystem===c.CoordinateSystem.Screen){o.set(new THREE.Vector3().setFromMatrixColumn(this._matOrigin,0).normalize().dot(o),new THREE.Vector3().setFromMatrixColumn(this._matOrigin,1).normalize().dot(o),0);}else if(this._coordinateSystem===c.CoordinateSystem.Custom){var f=this._getAnchorPoint();if(f){var h=new THREE.Matrix4().getInverse(f.matrixWorld);var i=new THREE.Vector3().setFromMatrixScale(f.matrixWorld);var j=f.position.clone().applyMatrix4(h);o.copy(f.position.clone().add(o).applyMatrix4(h).sub(j).multiply(i));}}this._line.geometry.vertices[0].setScalar(0).sub(o);this._line.geometry.verticesNeedUpdate=true;this._line.geometry.computeBoundingBox();o.set(Math.abs(o.x),Math.abs(o.y),Math.abs(o.z));o.multiplyScalar(1/Math.max(o.x,o.y,o.z));this._line.material.color.setRGB(o.x,o.y,o.z);this._line.visible=true;}};M.prototype._move=function(o){this._gizmoOffset.copy(o);if(this._coordinateSystem===c.CoordinateSystem.Local){this._nodes.forEach(function(n){var h=n.node;var i=this._extractBasis(h.matrixWorld);var p=n.origin.clone();p.add(i[0].multiplyScalar(o.x)).add(i[1].multiplyScalar(o.y)).add(i[2].multiplyScalar(o.z));h.matrixWorld.setPosition(p);h.matrix.multiplyMatrices(n.matParentInv,h.matrixWorld);h.position.setFromMatrixPosition(h.matrix);}.bind(this));this._viewport._updateBoundingBoxesIfNeeded();}else{if(this._coordinateSystem===c.CoordinateSystem.Screen){var s=this._viewport.getRenderer().getSize();var a=this._viewport.getCamera().getCameraRef();var b=new THREE.Vector4().copy(this._gizmo.position).applyMatrix4(this._matViewProj);var e=o.x*2*b.w/(a.projectionMatrix.elements[0]*s.width);var f=o.y*2*b.w/(a.projectionMatrix.elements[5]*s.height);o.setFromMatrixColumn(a.matrixWorld,0).multiplyScalar(e);o.add(new THREE.Vector3().setFromMatrixColumn(a.matrixWorld,1).multiplyScalar(f));}this._gizmo.position.setFromMatrixPosition(this._matOrigin).add(o);if(this._coordinateSystem===c.CoordinateSystem.Custom){var g=this._getAnchorPoint();if(g){g.position.copy(this._gizmo.position);}}this._nodes.forEach(function(n){if(!n.ignore){var h=n.node;h.matrixWorld.setPosition(n.origin.clone().add(o));h.matrix.multiplyMatrices(n.matParentInv,h.matrixWorld);h.position.setFromMatrixPosition(h.matrix);}});}this._viewport.setShouldRenderFrame();};M.prototype.move=function(x,y,z){this.beginGesture();this._move(new THREE.Vector3(x,y,z||0));};M.prototype.expandBoundingBox=function(b){if(this._viewport){this._expandBoundingBox(b,this._viewport.getCamera().getCameraRef());}};M.prototype.handleSelectionChanged=function(e){if(this._viewport){this._updateSelection(this._viewport._viewStateManager);}};M.prototype._getAnchorPoint=function(){return this._viewport&&this._viewport.getScene()?this._viewport.getScene().getSceneRef().userData.anchorPoint:null;};M.prototype._updateGizmoTransformation=function(i,a){var s=this._updateGizmoObjectTransformation(this._gizmo,i);this._updateAxisTitles(this._axisTitles,this._gizmo,a,this._gizmoSize+18,s);this._line.scale.setScalar(1/(this._gizmoSize*s));};M.prototype.render=function(){if(this._nodes.length>0){var r=this._viewport.getRenderer(),a=this._viewport.getCamera().getCameraRef();this._matViewProj.multiplyMatrices(a.projectionMatrix,a.matrixWorldInverse);r.clearDepth();for(var i=0,l=this.getGizmoCount();i<l;i++){this._updateGizmoTransformation(i,a);r.render(this._sceneGizmo,a);}}};M.prototype.onBeforeRendering=function(){};M.prototype.onAfterRendering=function(){};return M;},true);
