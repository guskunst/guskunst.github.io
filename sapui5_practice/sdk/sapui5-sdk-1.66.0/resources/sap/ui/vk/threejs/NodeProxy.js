/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../NodeProxy","./Material"],function(N,M){"use strict";var a=N.extend("sap.ui.vk.threejs.NodeProxy",{metadata:{},constructor:function(n,o){N.call(this);this._object3D=o;this._nodeHierarchy=n;}});a.prototype.destroy=function(){this._object3D=null;N.prototype.destroy.call(this);};a.prototype.getNodeHierarchy=function(){return this._nodeHierarchy;};a.prototype.getNodeRef=function(){return this._object3D;};a.prototype.getNodeId=function(){return this._object3D;};a.prototype.getVeId=function(){if(this._object3D.userData.treeNode){return this._object3D.userData.treeNode.sid;}else{return null;}};a.prototype.getMaterialId=function(){var r=this._object3D;if(this._object3D&&!this._object3D.geometry){if(this._object3D.children.length===1&&this._object3D.children[0].geometry&&(this._object3D.children[0].name===""||this._object3D.children[0].name===undefined)){r=this._object3D.children[0];}}if(r.material!==undefined&&r.material.userData!==undefined&&r.material.userData.materialId!==undefined){return r.material.userData.materialId;}else if(r.userData.originalMaterial!==undefined&&r.userData.originalMaterial.userData!==undefined&&r.userData.originalMaterial.userData.materialId!==undefined){return r.userData.originalMaterial.userData.materialId;}return undefined;};a.prototype.getName=function(){return this._object3D.name||("<"+this._object3D.type+">");};a.prototype._updateAncestorsBoundingBox=function(){var p=this._object3D.parent;while(p){if(p.userData.boundingBox!==undefined){p._vkCalculateObjectOrientedBoundingBox();}p=p.parent;}};a.prototype.getLocalMatrix=function(){return sap.ui.vk.TransformationMatrix.convertTo4x3(this._object3D.matrix.elements);};a.prototype.setLocalMatrix=function(v){if(v){var o=this._object3D;o.matrix.fromArray(sap.ui.vk.TransformationMatrix.convertTo4x4(v));o.matrix.decompose(o.position,o.quaternion,o.scale);o.updateMatrixWorld(true);this._updateAncestorsBoundingBox();}this.setProperty("localMatrix",v,true);return this;};a.prototype.setLocalMatrixNotUpdatingBBox=function(v){if(v){var o=this._object3D;o.matrix.fromArray(sap.ui.vk.TransformationMatrix.convertTo4x4(v));o.matrix.decompose(o.position,o.quaternion,o.scale);o.updateMatrixWorld(true);}this.setProperty("localMatrix",v,true);return this;};a.prototype.getWorldMatrix=function(){return sap.ui.vk.TransformationMatrix.convertTo4x3(this._object3D.matrixWorld.elements);};a.prototype.setWorldMatrix=function(v){if(v){var o=this._object3D;o.matrixWorld.fromArray(sap.ui.vk.TransformationMatrix.convertTo4x4(v));if(o.parent){o.matrix.multiplyMatrices(new THREE.Matrix4().getInverse(o.parent.matrixWorld),o.matrixWorld);}else{o.matrix.copy(o.matrixWorld);}o.matrix.decompose(o.position,o.quaternion,o.scale);o.updateMatrixWorld(true);this._updateAncestorsBoundingBox();}this.setProperty("worldMatrix",v,true);return this;};a.prototype.getOpacity=function(){return this._object3D.userData.opacity;};a.prototype.setOpacity=function(v){var b=this._nodeHierarchy.getScene().getViewStateManager();if(b){b.setOpacity(this._object3D,v);}else{this._object3D._vkSetOpacity(v);}this.setProperty("opacity",v,true);return this;};a.prototype.getTintColorABGR=function(){return this._object3D.userData.tintColor;};a.prototype.setTintColorABGR=function(v){var b=this._nodeHierarchy.getScene().getViewStateManager();if(b){b.setTintColor(this._object3D,v);}else{this._object3D._vkSetTintColor(v);}this.setProperty("tintColorABGR",v,true);this.setProperty("tintColor",sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(v)),true);return this;};a.prototype.getTintColor=function(){return sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(this._object3D.userData.tintColor));};a.prototype.setTintColor=function(v){var b=sap.ui.vk.colorToABGR(sap.ui.vk.cssColorToColor(v));var c=this._nodeHierarchy.getScene().getViewStateManager();if(c){c.setOpacity(this._object3D,b);}else{this._object3D._vkSetTintColor(b);}this.setProperty("tintColorABGR",b,true);this.setProperty("tintColor",v,true);return this;};a.prototype.getNodeMetadata=function(){return this._object3D.userData.metadata;};a.prototype.getHasChildren=function(){return this._object3D.children.length>0;};a.prototype.getClosed=function(){return!!this._object3D.userData.closed;};a.prototype.assignMaterial=function(v){var s=function(m,n){var b;if(m.userData){b=m.userData.materialId;n.userData.materialId=b;}if(n.material!==undefined){if(n.userData.highlightColor!==undefined){if(n.userData.originalMaterial.side){m.side=n.userData.originalMaterial.side;}n.userData.originalMaterial=m;m.userData.materialUsed++;n.material=m.clone();var c=sap.ui.vk.abgrToColor(n.userData.highlightColor);n.material.color.lerp(new THREE.Color(c.red/255.0,c.green/255.0,c.blue/255.0),c.alpha);if(m.userData.defaultHighlightingEmissive){n.material.emissive.copy(m.userData.defaultHighlightingEmissive);}if(m.userData.defaultHighlightingSpecular){n.material.specular.copy(m.userData.defaultHighlightingSpecular);}}else{if(n.material.side){m.side=n.material.side;}n.material=m;m.userData.materialUsed++;delete n.userData.originalMaterial;}if(n.userData.opacity){if(!n.userData.originalMaterial){n.userData.originalMaterial=m;n.material=m.clone();}n.material.opacity*=n.userData.opacity;n.material.transparent=n.material.opacity<0.99;}}};s(v.getMaterialRef(),this._object3D);if(!this._object3D.children){return this;}this._object3D.children.forEach(function(c){if(!c){return;}s(v.getMaterialRef(),c);});return this;};a.prototype.enumerateMaterials=function(r){var c=function(n,f,r){if(n){if(n.userData.originalMaterial){f.add(n.userData.originalMaterial);}else if(n.material){f.add(n.material);}if(n.children){n.children.forEach(function(g){if(g){if(r){c(g,f,r);}else if(g.userData.originalMaterial){f.add(g.userData.originalMaterial);}else if(g.material){f.add(g.material);}}});}}};var m=new Set();c(this._object3D,m,r);var b=[];m.forEach(function(v){b.push(v);});var d=[];for(var i=0;i<b.length;i++){var e=new M();e.setMaterialRef(b[i]);d.push(e);}return d;};a.prototype.replaceMaterials=function(m,b){var c=m.getMaterialRef();var d=b.getMaterialRef();if(this._object3D.userData.originalMaterial&&this._object3D.userData.originalMaterial===c){this._object3D.userData.originalMaterial=d;}else if(this._object3D.material&&this._object3D.material===c){this._object3D.material=d;}if(!this._object3D.children){return this;}this._object3D.children.forEach(function(e){if(e&&e.userData.originalMaterial&&e.userData.originalMaterial===c){e.userData.originalMaterial=d;}else if(e&&e.material&&e.material===c){e.material=d;}});return this;};return a;});