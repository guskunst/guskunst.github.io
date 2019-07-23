/* eslint-disable no-console */
console.log("MataiLoaderWorker started.");

var scriptDirectory = self.location.href.slice(0, self.location.href.lastIndexOf("/") + 1);

self.importScripts(scriptDirectory + "thirdparty/matai.js");

sap.ve.matai.createRuntime({
	prefixURL: scriptDirectory + "thirdparty/"
}).then(function(matai) {
	"use strict";

	console.log("MataiLoaderWorker runtime created.");

	function SceneBuilderProxy(sceneBuilderId) {
		this.sceneBuilderId = sceneBuilderId;
	}

	SceneBuilderProxy.prototype.setScene = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "setScene",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.createNode = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createNode",
			args: [ info ]
		}, [ info.matrix.buffer ]);
	};

	SceneBuilderProxy.prototype.createMesh = function(info) {
		var transferable = [
			info.boundingBox.buffer
		];
		if (info.matrix) {
			transferable.push(info.matrix.buffer);
		}
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createMesh",
			args: [ info ]
		}, transferable);
	};

	SceneBuilderProxy.prototype.setMeshGeometry = function(info) {
		var transferable = [
			info.data.index.buffer,
			info.data.position.buffer
		];
		if (info.data.normal) {
			transferable.push(info.data.normal.buffer);
		}
		if (info.data.uv) {
			transferable.push(info.data.uv.buffer);
		}
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "setMeshGeometry",
			args: [ info ]
		}, transferable);
	};

	SceneBuilderProxy.prototype.insertMesh = function(nodeRef, meshRef) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertMesh",
			args: [ nodeRef, meshRef ]
		});
	};

	SceneBuilderProxy.prototype.createTextAnnotation = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createTextAnnotation",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.createTextNote = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createTextNote",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.createImageNote = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createImageNote",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.insertLeaderLine = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertLeaderLine",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.createCamera = function(info) {
		var transferable = [
			info.origin.buffer,
			info.up.buffer,
			info.target.buffer
		];
		if (info.matrix) {
			transferable.push(info.matrix.buffer);
		}
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createCamera",
			args: [ info ]
		}, transferable);
	};

	SceneBuilderProxy.prototype.insertCamera = function(nodeRef, cameraRef) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertCamera",
			args: [ nodeRef, cameraRef ]
		});
	};

	SceneBuilderProxy.prototype.createViewportGroup = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createViewportGroup",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.finalizePlaybacks = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "finalizePlaybacks",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.insertModelView = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertModelView",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.setModelViewVisibilitySet = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "setModelViewVisibilitySet",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.insertModelViewHighlight = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertModelViewHighlight",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.createThumbnail = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createThumbnail",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.createDetailView = function(info) {
		var transferable = [
			info.origin.buffer,
			info.size.buffer
		];
		if (info.attachmentPoint) {
			transferable.push(info.attachmentPoint.buffer);
		}
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createDetailView",
			args: [ info ]
		}, transferable);
	};

	SceneBuilderProxy.prototype.createMaterial = function(info) {
		var transferable = [
			info.ambient.buffer,
			info.diffuse.buffer,
			info.specular.buffer,
			info.emissive.buffer
		];
		if (info.linestyle) {
			transferable.push(
				info.linestyle.color.buffer,
				info.linestyle.dashPattern.buffer
			);
		}
		if (info.textures) {
			info.textures.forEach(function(texture) {
				transferable.push(texture.matrix.buffer);
			});
		}
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createMaterial",
			args: [ info ]
		}, transferable);
	};

	SceneBuilderProxy.prototype.createImage = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "createImage",
			args: [ info ]
		}, [ info.data.buffer ]);
	};

	SceneBuilderProxy.prototype.progress = function(progress) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "progress",
			args: [ progress ]
		});
	};

	SceneBuilderProxy.prototype.insertThrustline = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertThrustline",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.insertAnimationGroup = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertAnimationGroup",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.insertAnimation = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertAnimation",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.insertAnimationTarget = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertAnimationTarget",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.insertAnimationTrack = function(info) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "insertAnimationTrack",
			args: [ info ]
		});
	};

	SceneBuilderProxy.prototype.finalizeAnimation = function(animationRef) {
		self.postMessage({
			sceneBuilderId: this.sceneBuilderId,
			method: "finalizeAnimation",
			args: [ animationRef ]
		});
	};

	self.onmessage = function(event) {
		var data = event.data;
		switch (data.method) {
			case "loadSceneFromArrayBuffer":
				var proxy = new SceneBuilderProxy(data.sceneBuilderId);
				matai.loadSceneFromArrayBuffer(proxy, data.buffer, data.fileName, null /* password */, data.sourceLocation);
				break;

			default:
				break;
		}
	};

	self.postMessage({ ready: true });

	console.log("MataiLoaderWorker initialized.");
});

console.log("MataiLoaderWorker starting runtime.");
/* eslint-enable no-console */
