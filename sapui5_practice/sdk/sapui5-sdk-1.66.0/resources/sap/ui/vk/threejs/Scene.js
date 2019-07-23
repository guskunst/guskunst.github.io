/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","../Scene","./NodeHierarchy"],function(q,S,N){"use strict";var c=S.extend("sap.ui.vk.threejs.Scene",{metadata:{},constructor:function(a){S.call(this);this._id=q.sap.uid();this._scene=a;this._state=null;this._defaultNodeHierarchy=null;this._currentViewStateManager=null;}});c.prototype.init=function(){var a=["attribute vec3 normal1;","attribute vec3 normal2;","#include <clipping_planes_pars_vertex>","uniform vec4 color;","varying vec4 vColor;","void main() {","	#include <begin_vertex>","	#include <project_vertex>","	#include <clipping_planes_vertex>","	vec3 eyeDirection = mvPosition.xyz;","	vec3 n1 = normalMatrix * normal1;","	vec3 n2 = normalMatrix * normal2;","	vColor = color;","	vColor.a *= step(dot(eyeDirection, n1) * dot(eyeDirection, n2), 0.0);","}"].join("\n");var b=["#include <clipping_planes_pars_fragment>","varying vec4 vColor;","void main() {","	#include <clipping_planes_fragment>","	if (vColor.a < ALPHATEST) discard;","	gl_FragColor = vColor;","}"].join("\n");this._outlineColor=new THREE.Vector4(0,0,0,1);this._outlineMaterial=new THREE.ShaderMaterial({uniforms:{color:{value:this._outlineColor}},vertexShader:a,fragmentShader:b,depthWrite:false,depthFunc:THREE.LessEqualDepth,polygonOffset:true,polygonOffsetFactor:-4,blending:THREE.NormalBlending,alphaTest:0.01,clipping:true});this._solidWhiteMaterial=new THREE.MeshBasicMaterial({color:0xFFFFFF});};c.prototype.destroy=function(){if(this._defaultNodeHierarchy){this._defaultNodeHierarchy.destroy();this._defaultNodeHierarchy=null;}this._state=null;this._scene=null;S.prototype.destroy.call(this);};c.prototype.setDoubleSided=function(v){this.setProperty("doubleSided",v,true);this._scene.traverse(function(a){if(a.material!==undefined){var b=a.userData;var e=THREE.FrontSide;var m;if(b.originalMaterial){if(b.originalMaterial.userData===undefined){b.originalMaterial.userData={};}m=b.originalMaterial.userData;if(m.originalMaterialSide===undefined){m.originalMaterialSide=b.originalMaterial.side;}e=m.originalMaterialSide;}else{if(a.material.userData===undefined){a.material.userData={};}m=a.material.userData;if(m.originalMaterialSide===undefined){m.originalMaterialSide=a.material.side;}e=m.originalMaterialSide;}a.material.side=v?THREE.DoubleSide:e;}});return this;};c.prototype.setViewStateManager=function(v){this._currentViewStateManager=v;return this;};c.prototype.getViewStateManager=function(){return this._currentViewStateManager;};c.prototype.getId=function(){return this._id;};c.prototype.getDefaultNodeHierarchy=function(){if(!this._defaultNodeHierarchy){this._defaultNodeHierarchy=new N(this);}return this._defaultNodeHierarchy;};function d(b,a){var e=b.min,i=b.max,m=a.elements,j=(e.x+i.x)*0.5,l=(e.y+i.y)*0.5,v=(e.z+i.z)*0.5,w=i.x-j,x=i.y-l,y=i.z-v;var z=m[0]*j+m[4]*l+m[8]*v+m[12];var A=m[1]*j+m[5]*l+m[9]*v+m[13];var B=m[2]*j+m[6]*l+m[10]*v+m[14];var C=Math.abs(m[0]*w)+Math.abs(m[4]*x)+Math.abs(m[8]*y);var D=Math.abs(m[1]*w)+Math.abs(m[5]*x)+Math.abs(m[9]*y);var E=Math.abs(m[2]*w)+Math.abs(m[6]*x)+Math.abs(m[10]*y);e.set(z-C,A-D,B-E);i.set(z+C,A+D,B+E);}THREE.Object3D.prototype._expandBoundingBox=function(b,v){var a=new THREE.Box3();function e(i){var j=i.geometry;if(j!==undefined){if(!j.boundingBox){j.computeBoundingBox();}if(!j.boundingBox.isEmpty()){if(j.boundingBox.min.z===0&&j.boundingBox.max.z===0){return;}a.copy(j.boundingBox);d(a,i.matrixWorld);if(isFinite(a.min.x)&&isFinite(a.min.y)&&isFinite(a.min.z)&&isFinite(a.max.x)&&isFinite(a.max.y)&&isFinite(a.max.z)){b.min.min(a.min);b.max.max(a.max);}}}var l=i.userData.boundingBox;if(l!==undefined&&!l.isEmpty()&&!v){a.copy(l);d(a,i.matrixWorld);b.min.min(a.min);b.max.max(a.max);}}this.updateMatrixWorld();if(v){this.traverseVisible(e);}else{this.traverse(e);}return b;};c.prototype._computeBoundingBox=function(v){var b=new THREE.Box3();if(this._scene){this._scene._expandBoundingBox(b,v);}return b;};c.prototype.getSceneRef=function(){return this._scene;};c.prototype._setState=function(a){this._state=a;};c.prototype.nodeRefToPersistentId=function(a){var b=this._state;if(Array.isArray(a)){if(!b){return[];}var i=[];a.forEach(function(e){i.push(b.object3DToSid(e));});return i;}else{if(!b){return null;}return b.object3DToSid(a);}};c.prototype.persistentIdToNodeRef=function(a){var b=this._state;if(Array.isArray(a)){if(!b){return[];}var e=[];a.forEach(function(i){e.push(b.sidToObject3D(i));});return e;}else{if(!b){return null;}return b.sidToObject3D(a);}};c.prototype.enumerateMaterials=function(){if(!this._defaultNodeHierarchy){return[];}var a=this._defaultNodeHierarchy.createNodeProxy(this._scene);if(a){return a.enumerateMaterials(true);}else{return[];}};var f=0;function g(a,b){var e=a.x-b.x;if(e<-f){return true;}if(e>f){return false;}var i=a.y-b.y;if(i<-f){return true;}if(i>f){return false;}return a.z-b.z<-f;}function h(a,b,e){if(b<e){var i=p(a,b,e);h(a,b,i-1);h(a,i+1,e);}return a;}function p(a,b,e){var j=a[e],l=b;for(var i=b;i<e;i++){if(g(a[i],j)){s(a,i,l);l++;}}s(a,e,l);return l;}function s(a,i,j){if(i!=j){var b=a[i];a[i]=a[j];a[j]=b;}}var k=new THREE.Vector3();function n(a){a.computeBoundingBox();a.boundingBox.getSize(k);f=Math.max(k.x,k.y,k.z)*1e-4;var v=a.vertices,b=v.length,e=a.faces.length;if(b===0||e===0){return;}var i,j;for(i=0;i<b;i++){v[i].index=i;}h(v,0,v.length-1);var l=[],m=[];l.push(v[0]);m[v[0].index]=l.length-1;for(i=1;i<b;i++){if(g(l[l.length-1],v[i])){l.push(v[i]);}m[v[i].index]=l.length-1;}a.vertices=l;for(i=0,e=a.faces.length,j=0;i<e;i++){var w=a.faces[i];var x=a.faces[j];x.a=m[w.a];x.b=m[w.b];x.c=m[w.c];if(x.a!==x.b&&x.b!==x.c&&x.c!==x.a){j++;}}a.faces.length=j;}function O(a,b){THREE.BufferGeometry.call(this);this.type="OutlineGeometry";var m=Math.cos(THREE.Math.DEG2RAD*((b!==undefined)?b:1));var w={},x,y;var z,A=["a","b","c"];var v=new THREE.Vector3();var B;if(a.isBufferGeometry){B=new THREE.Geometry();B.fromBufferGeometry(a);}else{B=a.clone();}n(B);B.computeFaceNormals();var C=B.vertices;var D=B.faces;for(var E=0,l=D.length;E<l;E++){var F=D[E];for(var i=0,j=2;i<3;j=i++){x=F[A[j]];y=F[A[i]];z=Math.min(x,y)+","+Math.max(x,y);if(w[z]===undefined){w[z]={index1:x,index2:y,face1:E,face2:undefined};}else{w[z].face2=E;}}}var G=[];var H=[];var I=[];for(z in w){var e=w[z];if(e.face2===undefined||(D[e.face1].normal.dot(D[e.face2].normal)<=m&&v.copy(C[e.index2]).sub(C[e.index1]).cross(D[e.face1].normal).dot(D[e.face2].normal)>0)){var J=C[e.index1];G.push(J.x,J.y,J.z);J=C[e.index2];G.push(J.x,J.y,J.z);var K=D[e.face1].normal;H.push(K.x,K.y,K.z);H.push(K.x,K.y,K.z);if(e.face2!==undefined){var L=D[e.face2].normal;I.push(L.x,L.y,L.z);I.push(L.x,L.y,L.z);}else{I.push(0,0,0);I.push(0,0,0);}}}this.addAttribute("position",new THREE.Float32BufferAttribute(G,3));this.addAttribute("normal1",new THREE.Float32BufferAttribute(H,3));this.addAttribute("normal2",new THREE.Float32BufferAttribute(I,3));}O.prototype=Object.create(THREE.BufferGeometry.prototype);O.prototype.constructor=O;function o(b){return b.min.x>=b.max.x&&b.min.y>=b.max.y&&b.min.z>=b.max.z;}function r(a){var b=null;if(a.isMesh&&a.geometry&&!o(a.geometry.boundingBox)&&(a.name||a.children.length>0)){b=a.geometry;if(b.isBufferGeometry){b=new THREE.Geometry().fromBufferGeometry(b);}}for(var i=0,l=a.children.length;i<l;i++){var e=a.children[i];if(e.isMesh&&e.geometry&&!o(e.geometry.boundingBox)&&!e.name&&e.children.length===0){if(b===null){b=new THREE.Geometry();}var j=e.geometry;if(j.isBufferGeometry){j=new THREE.Geometry().fromBufferGeometry(j);}b.merge(j,e.matrix);}}return b;}function t(a,b){var e=a.userData;if(e.defaultMaterial===undefined){e.defaultMaterial=e.originalMaterial||a.material;}a.material=b;e.originalMaterial=null;a._vkUpdateMaterialColor();a._vkUpdateMaterialOpacity();}function u(a){var b=a.userData;if(b.defaultMaterial){a.material=b.defaultMaterial;delete b.defaultMaterial;b.originalMaterial=null;a._vkUpdateMaterialColor();a._vkUpdateMaterialOpacity();}}THREE.Object3D.prototype._vkTraverseMeshNodes=function(a){if(this.isSprite||this.isBillboard||this.isDetailView){return;}a(this);var b=this.children;for(var i=0,l=b.length;i<l;i++){b[i]._vkTraverseMeshNodes(a);}};c.prototype._createOutlineGeometry=function(a){if(this._scene){this._scene._vkTraverseMeshNodes(function(b){if(b.isOutline){b.visible=true;}else{if(!b.hasOutline){b.hasOutline=true;var m=r(b);if(m!==null){var e=new O(m);e.boundingBox=new THREE.Box3();var l=new THREE.LineSegments(e,this._outlineMaterial);l.isOutline=true;l.renderOrder=b.renderOrder+0.5;b.add(l);}}if(b.isMesh&&b.material){switch(a){case sap.ui.vk.RenderMode.LineIllustration:t(b,this._solidWhiteMaterial);break;case sap.ui.vk.RenderMode.ShadedIllustration:var i=(b.userData.defaultMaterial||b.userData.originalMaterial||b.material).clone();if(i.emissive){i.color.multiplyScalar(0.5);i.emissive.multiplyScalar(0.5).addScalar(0.5);}else{i.color.multiplyScalar(0.5).addScalar(0.5);}t(b,i);break;default:u(b);break;}}}}.bind(this));}};c.prototype._hideOutlineGeometry=function(){if(this._scene){this._scene._vkTraverseMeshNodes(function(a){if(a.isOutline){a.visible=false;}if(a.isMesh){u(a);}});}};return c;});