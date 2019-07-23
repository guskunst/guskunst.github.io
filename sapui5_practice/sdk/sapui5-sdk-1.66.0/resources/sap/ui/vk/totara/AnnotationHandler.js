sap.ui.define(["jquery.sap.global","./TotaraUtils"],function(q,T){"use strict";var A=function(){};function a(s,b,c,l,m){l.material=m;s.sceneBuilder.insertLeaderLine(b,c,l);}A.setAnnotation=function(s,c){if(T.checkError(c)){return c;}c.annotations.forEach(function(b){var v=s.contextMap.values();var d=v.next();while(!d.done){var e=d.value;d=v.next();var n=e.annotationNodeMap.get(b.id);if(n){if(b.labelMaterialId){var f=s.sceneBuilder.getMaterial(b.labelMaterialId);if(f){s.sceneBuilder.createImageNote(e.sceneId,n,b,f);}else{var m=s.imageNoteMaterialIdMap.get(b.labelMaterialId);if(!m){m=[];s.imageNoteMaterialIdMap.set(b.labelMaterialId,m);}m.push({sceneId:e.sceneId,nodeId:n,annotation:b});s.materialIdsToRequest.add(b.labelMaterialId);}}else{s.sceneBuilder.createAnnotation(e.sceneId,n,b);var g=b.leaderLines;if(g){for(var i=0,l=g.length;i<l;i++){var h=g[i];var j=s.sceneBuilder.getMaterial(h.materialId);if(j){a(s,e.sceneId,b.id,h,j);}else{var k=s.leaderLineMaterialIdMap.get(h.materialId);if(!k){k=[];s.leaderLineMaterialIdMap.set(h.materialId,k);}k.push({sceneId:e.sceneId,annotationId:b.id,leaderLine:h});s.materialIdsToRequest.add(h.materialId);}}}}}}});};A.updateMaterials=function(s,c){c.materials.forEach(function(m){var l=s.leaderLineMaterialIdMap.get(m.id);if(l){s.leaderLineMaterialIdMap.delete(m.id);m=s.sceneBuilder.getMaterial(m.id);l.forEach(function(b){a(s,b.sceneId,b.annotationId,b.leaderLine,m);});}var i=s.imageNoteMaterialIdMap.get(m.id);if(i){s.imageNoteMaterialIdMap.delete(m.id);m=s.sceneBuilder.getMaterial(m.id);i.forEach(function(b){s.sceneBuilder.createImageNote(b.sceneId,b.nodeId,b.annotation,m);});}});};return A;});
