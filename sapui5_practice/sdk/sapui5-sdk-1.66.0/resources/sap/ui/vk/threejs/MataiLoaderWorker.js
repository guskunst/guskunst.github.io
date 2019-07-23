console.log("MataiLoaderWorker started.");var scriptDirectory=self.location.href.slice(0,self.location.href.lastIndexOf("/")+1);self.importScripts(scriptDirectory+"thirdparty/matai.js");sap.ve.matai.createRuntime({prefixURL:scriptDirectory+"thirdparty/"}).then(function(m){"use strict";console.log("MataiLoaderWorker runtime created.");function S(s){this.sceneBuilderId=s;}S.prototype.setScene=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"setScene",args:[i]});};S.prototype.createNode=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createNode",args:[i]},[i.matrix.buffer]);};S.prototype.createMesh=function(i){var t=[i.boundingBox.buffer];if(i.matrix){t.push(i.matrix.buffer);}self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createMesh",args:[i]},t);};S.prototype.setMeshGeometry=function(i){var t=[i.data.index.buffer,i.data.position.buffer];if(i.data.normal){t.push(i.data.normal.buffer);}if(i.data.uv){t.push(i.data.uv.buffer);}self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"setMeshGeometry",args:[i]},t);};S.prototype.insertMesh=function(n,a){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertMesh",args:[n,a]});};S.prototype.createTextAnnotation=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createTextAnnotation",args:[i]});};S.prototype.createTextNote=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createTextNote",args:[i]});};S.prototype.createImageNote=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createImageNote",args:[i]});};S.prototype.insertLeaderLine=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertLeaderLine",args:[i]});};S.prototype.createCamera=function(i){var t=[i.origin.buffer,i.up.buffer,i.target.buffer];if(i.matrix){t.push(i.matrix.buffer);}self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createCamera",args:[i]},t);};S.prototype.insertCamera=function(n,c){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertCamera",args:[n,c]});};S.prototype.createViewportGroup=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createViewportGroup",args:[i]});};S.prototype.finalizePlaybacks=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"finalizePlaybacks",args:[i]});};S.prototype.insertModelView=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertModelView",args:[i]});};S.prototype.setModelViewVisibilitySet=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"setModelViewVisibilitySet",args:[i]});};S.prototype.insertModelViewHighlight=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertModelViewHighlight",args:[i]});};S.prototype.createThumbnail=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createThumbnail",args:[i]});};S.prototype.createDetailView=function(i){var t=[i.origin.buffer,i.size.buffer];if(i.attachmentPoint){t.push(i.attachmentPoint.buffer);}self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createDetailView",args:[i]},t);};S.prototype.createMaterial=function(i){var t=[i.ambient.buffer,i.diffuse.buffer,i.specular.buffer,i.emissive.buffer];if(i.linestyle){t.push(i.linestyle.color.buffer,i.linestyle.dashPattern.buffer);}if(i.textures){i.textures.forEach(function(a){t.push(a.matrix.buffer);});}self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createMaterial",args:[i]},t);};S.prototype.createImage=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"createImage",args:[i]},[i.data.buffer]);};S.prototype.progress=function(p){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"progress",args:[p]});};S.prototype.insertThrustline=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertThrustline",args:[i]});};S.prototype.insertAnimationGroup=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertAnimationGroup",args:[i]});};S.prototype.insertAnimation=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertAnimation",args:[i]});};S.prototype.insertAnimationTarget=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertAnimationTarget",args:[i]});};S.prototype.insertAnimationTrack=function(i){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"insertAnimationTrack",args:[i]});};S.prototype.finalizeAnimation=function(a){self.postMessage({sceneBuilderId:this.sceneBuilderId,method:"finalizeAnimation",args:[a]});};self.onmessage=function(e){var d=e.data;switch(d.method){case"loadSceneFromArrayBuffer":var p=new S(d.sceneBuilderId);m.loadSceneFromArrayBuffer(p,d.buffer,d.fileName,null,d.sourceLocation);break;default:break;}};self.postMessage({ready:true});console.log("MataiLoaderWorker initialized.");});console.log("MataiLoaderWorker starting runtime.");
