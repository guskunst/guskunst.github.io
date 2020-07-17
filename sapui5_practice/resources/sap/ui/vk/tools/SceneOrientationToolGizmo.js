/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","./library","./Gizmo","sap/m/MenuButton","sap/m/Menu","sap/m/MenuItem","sap/ui/vk/threejs/thirdparty/three","./SceneOrientationToolGizmoRenderer"],function(q,l,G,M,a,b,t,S){"use strict";sap.ui.require("sap.m.Menu");var c=G.extend("sap.ui.vk.tools.SceneOrientationToolGizmo",{metadata:{library:"sap.ui.vk.tools"}});function d(e,f){var g=64,h=0.5,i=15,j=3,k=29,n=30;e.multiplyScalar(1/80);var o=new THREE.Vector3(e.y,e.z,e.x),p=new THREE.Vector3(e.z,e.x,e.y);var r=new THREE.MeshLambertMaterial({color:f}),s=new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:0.8}),u=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.8});var v=new THREE.CylinderBufferGeometry(h,h,g-i,4);var m=new THREE.Matrix4().makeBasis(o,e,p).setPosition(e.clone().multiplyScalar((g-i)*0.5));v.applyMatrix(m);var w=new THREE.Mesh(v,r);var x=new THREE.CylinderBufferGeometry(0,j,i,12,1);m.setPosition(e.clone().multiplyScalar(g-i*0.5));x.applyMatrix(m);w.add(new THREE.Mesh(x,r));var y=new THREE.CylinderBufferGeometry(h,h,k,4);m.makeBasis(e,p,o).setPosition(p.clone().multiplyScalar(0.5).add(e).multiplyScalar(k));y.applyMatrix(m);w.add(new THREE.Mesh(y,s));y=new THREE.CylinderBufferGeometry(h,h,k,4);m.setPosition(p.clone().multiplyScalar(0.5).add(e).add(o).multiplyScalar(k));y.applyMatrix(m);w.add(new THREE.Mesh(y,s));y=new THREE.CylinderBufferGeometry(h,h,k,4);m.makeBasis(p,o,e).setPosition(o.clone().multiplyScalar(0.5).add(e).multiplyScalar(k));y.applyMatrix(m);w.add(new THREE.Mesh(y,s));y=new THREE.CylinderBufferGeometry(h,h,n,4);m.makeBasis(e,p,o).setPosition(p.clone().multiplyScalar(0.5).add(e).multiplyScalar(n));y.applyMatrix(m);w.add(new THREE.Mesh(y,u));y=new THREE.CylinderBufferGeometry(h,h,n,4);m.setPosition(p.clone().multiplyScalar(0.5).add(e).add(o).multiplyScalar(n));y.applyMatrix(m);w.add(new THREE.Mesh(y,u));y=new THREE.CylinderBufferGeometry(h,h,n,4);m.makeBasis(p,o,e).setPosition(o.clone().multiplyScalar(0.5).add(e).multiplyScalar(n));y.applyMatrix(m);w.add(new THREE.Mesh(y,u));return w;}c.prototype.init=function(){if(G.prototype.init){G.prototype.init.apply(this);}this._enableInitialView=true;this._viewport=null;this._renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});this._renderer.setPixelRatio(window.devicePixelRatio);this._renderer.setSize(1,1);this._camera=new THREE.OrthographicCamera(-1,1,1,-1,0.1,100);this._scene=new THREE.Scene();var e=new THREE.DirectionalLight(0xFFFFFF,0.5);e.position.set(1,3,2);this._scene.add(e);this._scene.add(new THREE.AmbientLight(0xFFFFFF,0.5));this._scene.add(d(new THREE.Vector3(1,0,0),l.AxisColours.x));this._scene.add(d(new THREE.Vector3(0,1,0),l.AxisColours.y));this._scene.add(d(new THREE.Vector3(0,0,1),l.AxisColours.z));this._scene.traverse(function(o){o.matrixAutoUpdate=false;});this._axisTitles=this._createAxisTitles(32,16);this._scene.add(this._axisTitles);var v=[sap.ui.vk.tools.PredefinedView.Initial,sap.ui.vk.tools.PredefinedView.Front,sap.ui.vk.tools.PredefinedView.Back,sap.ui.vk.tools.PredefinedView.Left,sap.ui.vk.tools.PredefinedView.Right,sap.ui.vk.tools.PredefinedView.Top,sap.ui.vk.tools.PredefinedView.Bottom];this._menu=new a({items:[new b({text:sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_INITIAL")}),new b({text:sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_FRONT")}),new b({text:sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_BACK")}),new b({text:sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_LEFT")}),new b({text:sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_RIGHT")}),new b({text:sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_TOP")}),new b({text:sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_BOTTOM")})]}).attachItemSelected(function(f){var i=f.getParameters("item").item;var g=f.getSource().indexOfItem(i);this.setView(v[g],1000);},this);this._button=new M({tooltip:sap.ui.vk.getResourceBundle().getText("PREDEFINED_VIEW_MENUBUTTONTOOLTIP"),menu:this._menu}).addStyleClass("sapUiVizKitSceneOrientationGizmoButton").addStyleClass("sapUiSizeCompact");};c.prototype.setView=function(v,m){var e;switch(v){case sap.ui.vk.tools.PredefinedView.Initial:e=null;break;case sap.ui.vk.tools.PredefinedView.Front:e=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),0);break;case sap.ui.vk.tools.PredefinedView.Back:e=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI);break;case sap.ui.vk.tools.PredefinedView.Left:e=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.PI/2);break;case sap.ui.vk.tools.PredefinedView.Right:e=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);break;case sap.ui.vk.tools.PredefinedView.Top:e=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);break;case sap.ui.vk.tools.PredefinedView.Bottom:e=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);break;default:return this;}this._viewport._viewportGestureHandler.setView(e,m||0);return this;};c.prototype.setEnableInitialView=function(v){this._enableInitialView=v;var i=this._menu.getItems();i[0].setVisible(v);i[1].setStartsSection(v);};c.prototype.render=function(v){this._viewport=v;this._camera.quaternion.copy(v.getCamera().getCameraRef().quaternion);this._camera.position.set(0,0,1).applyQuaternion(this._camera.quaternion);var w=this._renderer.getSize().width;this._updateAxisTitles(this._axisTitles,this._scene,this._camera,w*0.45,2/w);this._renderer.render(this._scene,this._camera);};c.prototype.onBeforeRendering=function(){};c.prototype.onAfterRendering=function(){var e=this.getDomRef();this._renderer.setSize(e.clientWidth,e.clientHeight);e.appendChild(this._renderer.domElement);};return c;},true);