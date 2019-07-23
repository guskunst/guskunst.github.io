sap.ui.define(["./RequestCommandGenerator","./CallbackHandler","./SceneStateContext","sap/ui/vk/threejs/SceneBuilder"],function(R,C,S,a){"use strict";var b=function(){this.currentSceneInfo={};this.sceneBuilder=new a();this.contextMap=new Map();this.viewIdSceneIdMap=new Map();this.texturesToUpdate=new Map();this.materialIdsToRequest=new Set();this.materialIdsRequested=new Set();this.geometryIdMaterialIdMap=new Map();this.leaderLineMaterialIdMap=new Map();this.imageNoteMaterialIdMap=new Map();this.thumbnailImageIdAndViewIdSceneIdMap=new Map();this.viewIdAndThumbnailImageIdScneIdMap=new Map();this.requestCommandGenerator=new R();this.trackIds=new Set();this.sequenceIds=new Set();this.highlightStyleIds=new Set();this.onErrorCallbacks=new C();this.onMaterialFinishedCallbacks=new C();this.onImageFinishedCallbacks=new C();this.onSetGeometryCallbacks=new C();this.onSetTrackCallbacks=new C();this.onSetSequenceCallbacks=new C();this.onViewGroupUpdatedCallbacks=new C();this.onViewGroupFinishedCallbacks=new C();this.getContext=function(s){if(!s){return null;}return this.contextMap.get(s);};this.createContext=function(u,p){var c=new S();Object.assign(c,p);c.sceneId=u;c.requestCommandGenerator.setSceneIdAndContext(u,c);if(c.onActiveCamera){c.onActiveCameraCallbacks.attach(c.onActiveCamera);delete c.onActiveCamera;}if(c.onMeshFinished){c.onMeshFinishedCallbacks.attach(c.onMeshFinished);delete c.onMeshFinished;}if(c.onInitialSceneFinished){c.onInitialSceneFinishedCallbacks.attach(c.onInitialSceneFinished);delete c.onInitialSceneFinished;}if(c.onPartialRetrievalFinished){c.onPartialRetrievalFinishedCallbacks.attach(c.onPartialRetrievalFinished);delete c.onPartialRetrievalFinished;}if(c.onViewPartialRetrievalFinished){c.onViewPartialRetrievalFinishedCallbacks.attach(c.onViewPartialRetrievalFinished);delete c.onViewPartialRetrievalFinished;}if(c.onViewFinished){c.onViewFinishedCallbacks.attach(c.onViewFinished);delete c.onViewFinished;}if(c.onSceneCompleted){c.onSceneCompletedCallbacks.attach(c.onSceneCompleted);delete c.onSceneCompleted;}if(c.onProgressChanged){c.setOnProgressChanged(c.onProgressChanged);delete c.onProgressChanged;}this.contextMap.set(u,c);return c;};this.sidToObject3D=function(s){var c=this.contextMap.values();var d=c.next();var n=null;while(!d.done){var e=d.value;d=c.next();n=this.sceneBuilder.getNode(s,e.sceneId);if(n){break;}}return n;};this.object3DToSid=function(o){return this.sceneBuilder.getObjectId(o);};this.dispose=function(){this.currentSceneInfo=null;this.contextMap=null;this.sceneBuilder.clearup();this.sceneBuilder=null;this.texturesToUpdate=null;this.materialIdsToRequest=null;this.materialIdsRequested=null;this.geometryIdMaterialIdMap=null;this.thumbnailImageIdAndViewIdSceneIdMap=null;this.viewIdAndThumbnailImageIdScneIdMap=null;this.trackIds=null;this.sequenceIds=null;this.highlightStyleIds=null;this.onErrorCallbacks=null;this.onMaterialFinishedCallbacks=null;this.onImageFinishedCallbacks=null;this.onSetGeometryCallbacks=null;this.onSetTrackCallbacks=null;this.onSetSequenceCallbacks=null;};this.cleanup=function(){this.currentSceneInfo={};this.contextMap.clear();this.sceneBuilder.cleanup();this.texturesToUpdate.clear();this.materialIdsToRequest.clear();this.materialIdsRequested.clear();this.geometryIdMaterialIdMap.clear();this.viewIdSceneIdMap.clear();this.thumbnailImageIdAndViewIdSceneIdMap.clear();this.viewIdAndThumbnailImageIdScneIdMap.clear();this.trackIds.clear();this.sequenceIds.clear();this.highlightStyleIds.clear();this.requestCommandGenerator.clearContent();};};return b;});
