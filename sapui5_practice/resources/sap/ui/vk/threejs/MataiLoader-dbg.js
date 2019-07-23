/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.threejs.MataiLoader.
sap.ui.define([
	"sap/base/Log", "sap/ui/vk/threejs/Billboard", "sap/ui/vk/threejs/Callout",
	"sap/ui/vk/threejs/PerspectiveCamera", "sap/ui/vk/threejs/OrthographicCamera", "sap/ui/vk/threejs/DetailView",
	"../totara/ListMap", "./AnimationHelper", "./Thrustline"
], function(
	Log, Billboard, Callout, PerspectiveCamera, OrthographicCamera, DetailView, ListMap, AnimationHelper, Thrustline
) {
	"use strict";

	var SceneBuilder = function(parentNode, contentResource, resolve, reject) {
		this._id = SceneBuilder._nextId++;
		SceneBuilder.add(this);
		this._parentNode = parentNode;
		this._contentResource = contentResource;
		this._resolve = resolve;
		this._reject = reject;
		this._nodes = new Map();
		this._meshes = new Map();
		this._callouts = new Map();
		this._cameras = new Map();
		this._detailViews = new Map();
		this._materials = new Map();
		this._images = new Map();
		this._viewportGroups = new Map();
		this._modelViews = new Map();
		this._modelViewThumbnails = new Map();
		this._animations = new Map();
		this._animationTracks = new Map();
		this._sequences = new Map();

		this._thrustlines = new Map();

		this._trackIdSequenceNodeMap = new ListMap();

		var topNode = this._parentNode;
		while (topNode.parent) {
			topNode = topNode.parent;
		}
		if (!topNode.userData) {
			topNode.userData = {};
		}
		topNode.userData.animations = this._animations;
		topNode.userData.animationTracks = this._animationTracks;

		topNode.userData.sequences = this._sequences;

		this._animationHelper = new AnimationHelper();
	};

	SceneBuilder._nextId = 1;

	SceneBuilder._map = new Map();
	SceneBuilder.add = function(sceneBuilder) {
		this._map.set(sceneBuilder.getId(), sceneBuilder);
		return this;
	};

	SceneBuilder.getById = function(id) {
		return this._map.get(id);
	};

	SceneBuilder.prototype.getId = function() {
		return this._id;
	};

	SceneBuilder.prototype.setScene = function(info) {
		if (info.result !== 1) {
			this._reject(info.result);
		} else {
			var camera = this._cameras.get(info.cameraRef);
			this._resolve({
				node: this._parentNode,
				camera: camera,
				contentResource: this._contentResource,
				builder: this
			});
		}
	};

	SceneBuilder.prototype.createNode = function(info) {
		var parent = this._nodes.get(info.parentRef) || null;
		var node = new THREE.Group();
		node.name = info.name;
		// node.opacity = info.opacity;
		node.visible = info.visible;
		node.matrix.set(info.matrix[ 0 ], info.matrix[ 4 ], info.matrix[ 8 ], info.matrix[ 12 ],
			info.matrix[ 1 ], info.matrix[ 5 ], info.matrix[ 9 ], info.matrix[ 13 ],
			info.matrix[ 2 ], info.matrix[ 6 ], info.matrix[ 10 ], info.matrix[ 14 ],
			info.matrix[ 3 ], info.matrix[ 7 ], info.matrix[ 11 ], info.matrix[ 15 ]
		);
		node.matrix.decompose(node.position, node.quaternion, node.scale);
		node.userData.metadata = info.metadata;
		node.userData.veids = info.veids;
		(parent || this._parentNode).add(node);
		this._nodes.set(info.nodeRef, node);
	};

	var normals = new Float32Array([
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,

		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,

		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,

		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,

		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,

		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0
	]);

	var indices = new Uint16Array([
		0, 1, 2, 2, 1, 3,
		4, 6, 5, 5, 6, 7,
		8 + 0, 8 + 1, 8 + 2, 8 + 2, 8 + 1, 8 + 3,
		8 + 4, 8 + 6, 8 + 5, 8 + 5, 8 + 6, 8 + 7,
		16 + 0, 16 + 1, 16 + 2, 16 + 2, 16 + 1, 16 + 3,
		16 + 4, 16 + 6, 16 + 5, 16 + 5, 16 + 6, 16 + 7
	]);

	SceneBuilder.prototype.createMesh = function(info) {
		var b = info.boundingBox;
		var vertices = new Float32Array([
			b[0], b[1], b[5],
			b[3], b[1], b[5],
			b[0], b[4], b[5],
			b[3], b[4], b[5],

			b[0], b[1], b[2],
			b[3], b[1], b[2],
			b[0], b[4], b[2],
			b[3], b[4], b[2],

			b[0], b[4], b[5],
			b[3], b[4], b[5],
			b[0], b[4], b[2],
			b[3], b[4], b[2],

			b[0], b[1], b[5],
			b[3], b[1], b[5],
			b[0], b[1], b[2],
			b[3], b[1], b[2],

			b[3], b[1], b[5],
			b[3], b[1], b[2],
			b[3], b[4], b[5],
			b[3], b[4], b[2],

			b[0], b[1], b[5],
			b[0], b[1], b[2],
			b[0], b[4], b[5],
			b[0], b[4], b[2]
		]);

		var geometry = new THREE.BufferGeometry();
		geometry.setIndex(new THREE.BufferAttribute(indices, 1));
		geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
		geometry.addAttribute("normal", new THREE.BufferAttribute(normals, 3));
		var mesh = new THREE.Mesh(geometry, this._materials.get(info.materialRef));
		this._meshes.set(info.meshRef, mesh);

		if (info.matrix) {
			mesh.matrix.set(info.matrix[ 0 ], info.matrix[ 4 ], info.matrix[ 8 ], info.matrix[ 12 ],
				info.matrix[ 1 ], info.matrix[ 5 ], info.matrix[ 9 ], info.matrix[ 13 ],
				info.matrix[ 2 ], info.matrix[ 6 ], info.matrix[ 10 ], info.matrix[ 14 ],
				info.matrix[ 3 ], info.matrix[ 7 ], info.matrix[ 11 ], info.matrix[ 15 ]
			);
			mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
		}
	};

	SceneBuilder.prototype.setMeshGeometry = function(info) {
		var mesh = this._meshes.get(info.meshRef);
		var data = info.data;
		// for (var i = 0, l = data.index.length, maxIndex = data.position.length / 3; i < l; i++) {
		// 	if (data.index[ i ] >= maxIndex) {
		// 		console.error("Incorrect geometry data", info);
		// 		return;
		// 	}
		// }
		var newGeometry = new THREE.BufferGeometry();
		newGeometry.setIndex(new THREE.BufferAttribute(data.index, 1));
		newGeometry.addAttribute("position", new THREE.BufferAttribute(data.position, 3));
		if (data.normal) {
			newGeometry.addAttribute("normal", new THREE.BufferAttribute(data.normal, 3));
		}
		if (data.uv) {
			newGeometry.addAttribute("uv", new THREE.BufferAttribute(data.uv, 2));
		}

		if (info.flags & 1) {
			// replace triangle mesh with polyline mesh
			for (var i = 0, l = mesh.parent.children.length; i < l; i++) {
				if (mesh.parent.children[ i ] === mesh) {
					mesh.parent.children[ i ] = new THREE.LineSegments(newGeometry, new THREE.LineBasicMaterial({ color: mesh.material.color }));
					break;
				}
			}
		} else {
			mesh.geometry.copy(newGeometry);
		}
		if (this._fireSceneUpdated) {
			this._fireSceneUpdated();
		}
	};

	SceneBuilder.prototype.insertMesh = function(nodeRef, meshRef) {
		var node = this._nodes.get(nodeRef);
		var mesh = this._meshes.get(meshRef);
		node.add(mesh.parent ? mesh.clone() : mesh);
	};

	var billboardTextEncodings = [
		sap.ui.vk.BillboardTextEncoding.PlainText,
		sap.ui.vk.BillboardTextEncoding.HtmlText
	];

	var billboardStyles = [
		sap.ui.vk.BillboardStyle.RectangularShape,
		sap.ui.vk.BillboardStyle.CircularShape,
		sap.ui.vk.BillboardStyle.None,
		sap.ui.vk.BillboardStyle.TextGlow
	];

	var billboardBorderLineStyles = [
		sap.ui.vk.BillboardBorderLineStyle.None,
		sap.ui.vk.BillboardBorderLineStyle.Solid,
		sap.ui.vk.BillboardBorderLineStyle.Dash,
		sap.ui.vk.BillboardBorderLineStyle.Dot,
		sap.ui.vk.BillboardBorderLineStyle.DashDot,
		sap.ui.vk.BillboardBorderLineStyle.DashDotDot
	];

	var billboardHorizontalAlignments = [
		sap.ui.vk.BillboardHorizontalAlignment.Left,
		sap.ui.vk.BillboardHorizontalAlignment.Center,
		sap.ui.vk.BillboardHorizontalAlignment.Right
	];

	var leaderLineMarkStyles = [
		sap.ui.vk.LeaderLineMarkStyle.None,
		sap.ui.vk.LeaderLineMarkStyle.Point,
		sap.ui.vk.LeaderLineMarkStyle.Arrow
	];

	function cssColor(color) {
		var hexColor = color.toString(16);
		return "#" + "000000".substring(hexColor.length) + hexColor;
	}

	function checkArray(array) {
		for (var i = 0, l = array.length; i < l; i++) {
			if (!isFinite(array[ i ])) {
				return false;
			}
		}
		return true;
	}

	SceneBuilder.prototype.createTextAnnotation = function(info) {
		if (!checkArray(info.position)) {
			// console.error("Incorrect text annotation position", info);
			return;
		}
		var billboard = new Billboard({
			coordinateSpace: sap.ui.vk.BillboardCoordinateSpace.Viewport,
			renderOrder: 3,
			position: new THREE.Vector3().fromArray(info.position),
			encoding: billboardTextEncodings[info.encoding],
			font: info.font,
			fontSize: info.fontSize,
			fontWeight: Math.min(info.fontWeight, 900),
			fontItalic: info.fontItalic,
			style: billboardStyles[info.style],
			width: info.width,
			height: info.height,
			textColor: cssColor(info.textColor),
			backgroundColor: cssColor(info.backgroundColor),
			backgroundOpacity: info.backgroundOpacity,
			borderColor: cssColor(info.borderColor),
			borderOpacity: info.borderOpacity,
			borderWidth: info.borderWidth,
			borderLineStyle: billboardBorderLineStyles[info.borderLineStyle],
			horizontalAlignment: billboardHorizontalAlignments[info.horizontalAlignment],
			link: info.link
		});
		billboard.setText(info.text);

		var node = this._nodes.get(info.nodeRef);
		(node || this._parentNode).add(billboard._node);

		if (!this._parentNode.userData._vkBillboards) {
			this._parentNode.userData._vkBillboards = [];
		}
		this._parentNode.userData._vkBillboards.push(billboard);
	};

	SceneBuilder.prototype.createImageNote = function(info) {
		var material = this._materials.get(info.materialRef);
		var billboard = new Billboard({
			coordinateSpace: sap.ui.vk.BillboardCoordinateSpace.Screen,
			renderOrder: 2,
			position: new THREE.Vector3().fromArray(info.position),
			width: info.width,
			height: info.height,
			texture: material ? material.emissiveMap : null
		});

		var node = this._nodes.get(info.nodeRef);
		(node || this._parentNode).add(billboard._node);

		if (!this._parentNode.userData._vkBillboards) {
			this._parentNode.userData._vkBillboards = [];
		}
		this._parentNode.userData._vkBillboards.push(billboard);
	};

	SceneBuilder.prototype.createTextNote = function(info) {
		var callout = new Callout({
			anchorNode: this._nodes.get(info.targetNodeRef) || this._parentNode,
			coordinateSpace: sap.ui.vk.BillboardCoordinateSpace.World,
			position: new THREE.Vector3().fromArray(info.position),
			renderOrder: info.alwaysOnTop ? 1 : 0,
			depthTest: !info.alwaysOnTop,
			encoding: billboardTextEncodings[info.encoding],
			font: info.font,
			fontSize: info.fontSize,
			fontWeight: Math.min(info.fontWeight, 900),
			fontItalic: info.fontItalic,
			style: billboardStyles[info.style],
			width: info.width,
			height: info.height,
			textColor: cssColor(info.textColor),
			backgroundColor: cssColor(info.backgroundColor),
			backgroundOpacity: info.backgroundOpacity,
			borderColor: cssColor(info.borderColor),
			borderOpacity: info.borderOpacity,
			borderWidth: info.borderWidth,
			borderLineStyle: billboardBorderLineStyles[info.borderLineStyle],
			horizontalAlignment: billboardHorizontalAlignments[info.horizontalAlignment],
			link: info.link
		});
		callout.setText(info.text);

		var node = this._nodes.get(info.nodeRef);
		this._callouts.set(node, callout);

		(node || this._parentNode).add(callout._node);

		if (!this._parentNode.userData._vkCallouts) {
			this._parentNode.userData._vkCallouts = [];
		}
		this._parentNode.userData._vkCallouts.push(callout);
	};

	SceneBuilder.prototype.insertLeaderLine = function(info) {
		var node = this._nodes.get(info.nodeRef);
		var target = this._nodes.get(info.targetNodeRef) || this._parentNode;
		var material = this._materials.get(info.materialRef);
		var callout = this._callouts.get(node);
		if (callout) {
			var vertices = [];
			for (var i = 0; i < info.points.length; i += 3) {
				vertices.push(new THREE.Vector3().fromArray(info.points, i));
			}
			callout.addLeaderLine(vertices, target, material, leaderLineMarkStyles[info.startPointStyle], leaderLineMarkStyles[info.endPointStyle], info.styleConstant, info.extensionLength);
		}
	};

	SceneBuilder.prototype.createCamera = function(info) {
		var camera = null;
		if (info.projection === "perspective") {
			camera = new PerspectiveCamera();
			camera.setFov(info.fov);
		} else if (info.projection === "orthographic") {
			camera = new OrthographicCamera();
			camera.setZoomFactor(info.orthoZoomFactor);
		}

		if (camera) {
			camera.setNearClipPlane(info.nearClip);
			camera.setFarClipPlane(info.farClip);
			camera.setUsingDefaultClipPlanes(info.autoEvaluateClipPlanes);

			var origin = new THREE.Vector3().fromArray(info.origin);
			var target = new THREE.Vector3().fromArray(info.target).sub(origin);
			var up = new THREE.Vector3().fromArray(info.up).sub(origin);

			camera.setUpDirection(up.toArray());
			camera.setPosition(origin.toArray());
			camera.setTargetDirection(target.toArray());
		}

		this._parentNode.userData.camera = camera;
		this._cameras.set(info.cameraRef, camera);
	};

	SceneBuilder.prototype.insertCamera = function(nodeRef, cameraRef) {
		var node = this._nodes.get(nodeRef);
		var camera = this._cameras.get(cameraRef);
		camera = camera ? camera.getCameraRef() : null;
		if (node && camera) {
			(node || this._parentNode).add(camera.parent ? camera.clone() : camera);
		}
	};

	SceneBuilder.prototype.createViewportGroup = function(info) {
		var parentNode = this._parentNode;
		while (parentNode.parent) {
			parentNode = parentNode.parent;
		}
		var viewportGroup = {
			name: info.name,
			type: info.type,
			description: info.description,
			metadata: info.metadata,
			veids: info.veids,
			modelViews: []
		};
		parentNode.userData.viewportGroups = parentNode.userData.viewportGroups || [];
		parentNode.userData.viewportGroups.push(viewportGroup);
		this._viewportGroups.set(info.viewportGroupRef, viewportGroup);
	};

	SceneBuilder.prototype.insertModelView = function(info) {
		var modelView = {
			name: info.name,
			description: info.description ? "<pre>" + info.description + "</pre>" : info.descripton, // Currently this is plain text so we preserve it's formatting (line breaks)
			camera: this._cameras.get(info.cameraRef),
			type: info.type,
			flyToTime: info.flyToTime,
			preDelay: info.preDelay,
			postDelay: info.postDelay,
			navigationMode: info.navigationMode,
			topColor: info.topColor,
			bottomColor: info.bottomColor,
			renderMethod: info.renderMethod,
			dimension: info.dimension,
			query: info.query,
			metadata: info.metadata,
			veids: info.veids,
			visibleNodes: [],
			highlights: [],
			viewGroupId: info.viewportGroupRef,
			id: info.modelViewRef
		};
		var viewportGroup = this._viewportGroups.get(info.viewportGroupRef);
		if (viewportGroup) {
			viewportGroup.modelViews.push(modelView);
		}
		this._modelViews.set(info.modelViewRef, modelView);
		this._modelViewThumbnails.set(info.thumbnail, modelView);
	};

	SceneBuilder.prototype.setModelViewVisibilitySet = function(info) {
		var modelView = this._modelViews.get(info.modelViewRef);
		var nodeSet = new Set();
		info.visibleNodes.forEach(function(nodeRef) {
			var node = this._nodes.get(nodeRef);
			if (node) {
				while (node && !nodeSet.has(node)) {
					nodeSet.add(node);
					node = node.parent;
				}
			} else {
				// console.warn("Unknown node reference", nodeRef, this._nodes);
			}
		}.bind(this));
		modelView.visibleNodes = Array.from(nodeSet);
	};

	SceneBuilder.prototype.insertModelViewHighlight = function(info) {
		var modelView = this._modelViews.get(info.modelViewRef);
		if (modelView) {
			var highlightNodes = [];
			info.highlightNodes.forEach(function(nodeRef) {
				var node = this._nodes.get(nodeRef);
				if (node) {
					highlightNodes.push(node);
				} else {
					// console.warn("Unknown node reference", nodeRef, this._nodes);
				}
			}.bind(this));

			var highlight = {
				highlightNodes: highlightNodes,
				color1: info.color1,
				color2: info.color2,
				opacity1: info.opacity1,
				opacity2: info.opacity2,
				duration: info.duration,
				cycles: info.cycles
			};

			if (info.duration === 0) {
				highlight.type = "STATIC";
			} else if (info.duration > 0 && info.cycles === 0) {
				highlight.type = "INFINITE";
			} else {
				highlight.type = "FINITE";
			}

			var color1 = [ (info.color1 >>> 16 & 0xff) / 265, (info.color1 >>> 8  & 0xff) / 265, (info.color1 & 0xff) / 265 ];
			var color2 = [ (info.color2 >>> 16 & 0xff) / 265, (info.color2 >>> 8  & 0xff) / 265, (info.color2 & 0xff) / 265 ];
			highlight.colours = [ color1, color2 ];
			highlight.opacities = [ info.opacity1, info.opacity2 ];
			this._animationHelper.addAnimationTracksToHighlight(highlight);
			modelView.highlights.push(highlight);
		}
	};

	SceneBuilder.prototype.createThumbnail = function(info) {
		var modelView = this._modelViewThumbnails.get(info.imageRef);
		if (modelView) {
			modelView.thumbnailData = "data:image/" + "jpeg" + ";base64," + window.btoa(String.fromCharCode.apply(null, info.data));
			if (this._fireThumbnailLoaded) {
				this._fireThumbnailLoaded({ modelView: modelView });
			}
		}
	};

	var detailViewTypes = [
		sap.ui.vk.DetailViewType.DetailView,
		sap.ui.vk.DetailViewType.Cutaway
	];

	var detailViewShapes = [
		sap.ui.vk.DetailViewShape.Box,
		sap.ui.vk.DetailViewShape.Circle,
		sap.ui.vk.DetailViewShape.CircleLine,
		sap.ui.vk.DetailViewShape.CirclePointer,
		sap.ui.vk.DetailViewShape.CircleArrow,
		sap.ui.vk.DetailViewShape.CircleBubbles,
		sap.ui.vk.DetailViewShape.BoxLine,
		sap.ui.vk.DetailViewShape.BoxNoOutline,
		sap.ui.vk.DetailViewShape.SolidPointer,
		sap.ui.vk.DetailViewShape.SolidArrow
	];

	SceneBuilder.prototype.createDetailView = function(info) {
		var detailView = new DetailView({
			name: info.name,
			camera: this._cameras.get(info.cameraRef),
			type: detailViewTypes[info.type],
			shape: detailViewShapes[info.shape],
			borderWidth: info.borderWidth,
			backgroundColor: cssColor(info.backgroundColor),
			borderColor: cssColor(info.borderColor),
			renderOrder: info.renderOrder || 0,
			origin: new THREE.Vector2().fromArray(info.origin),
			size: new THREE.Vector2().fromArray(info.size),
			attachmentPoint: new THREE.Vector3().fromArray(info.attachmentPoint),
			metadata: info.metadata,
			veId: info.veid
		});
		this._detailViews.set(info.detailViewRef, detailView);

		var node = this._nodes.get(info.nodeRef);
		(node || this._parentNode).add(detailView._node);

		if (!this._parentNode.userData._vkDetailViews) {
			this._parentNode.userData._vkDetailViews = [];
		}
		this._parentNode.userData._vkDetailViews.push(detailView);
	};

	SceneBuilder.prototype.createMaterial = function(info) {
		var material;
		var linestyle = info.linestyle;
		if (linestyle.width > 0) {// line material
			material = new THREE.LineBasicMaterial({
				color: new THREE.Color(linestyle.color[ 0 ], linestyle.color[ 1 ], linestyle.color[ 2 ]),
				depthTest: false,
				linewidth: linestyle.width
			});
			material.userData.lineStyle = linestyle;
		} else {// mesh material
			if (info.textures) {
				info.textures.forEach(function(textureInfo) {
					var texture = new THREE.Texture(
						this._images.get(textureInfo.imageRef),
						textureInfo.type === "reflection" ? THREE.SphericalReflectionMapping : THREE.UVMapping,
						textureInfo.repeatX ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping, // wrapS
						textureInfo.repeatY ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping, // wrapT
						textureInfo.filterMode === 1 ? THREE.NearestFilter : THREE.LinearFilter, // magFilter
						textureInfo.filterMode === 1 ? THREE.NearestFilter : THREE.LinearMipMapLinearFilter, // minFilter
						undefined, // default format
						undefined, // default type
						4 // anisotropy
					);
					texture.offset.set(textureInfo.offsetX, textureInfo.offsetX);
					texture.repeat.set(textureInfo.scaleX, textureInfo.scaleY);
					info[ textureInfo.type + "Texture" ] = texture;
					texture.needsUpdate = true;
					texture.influence = textureInfo.amount;
				}, this);
			}

			material = new THREE.MeshPhongMaterial({
				opacity: info.opacity,
				color: new THREE.Color(info.diffuse[ 0 ], info.diffuse[ 1 ], info.diffuse[ 2 ]),
				// Empirical approximation of shininess based on glosiness and specular level
				shininess: info.glossiness * 2 + info.specularLevel * 3,
				emissive: new THREE.Color(info.emissive[ 0 ] + info.ambient[ 0 ] * 0.2, info.emissive[ 1 ] + info.ambient[ 1 ] * 0.2, info.emissive[ 2 ] + info.ambient[ 2 ] * 0.2),
				specular: new THREE.Color(info.specular[ 0 ], info.specular[ 1 ], info.specular[ 2 ]),
				map: info.diffuseTexture ? info.diffuseTexture : null,
				specularMap: info.specularTexture ? info.specularTexture : null,
				emissiveMap: info.emissiveTexture ? info.emissiveTexture : null,
				envMap: info.reflectionTexture ? info.reflectionTexture : null,
				alphaMap: info.opacityTexture ? info.opacityTexture : null,
				bumpMap: info.bumpTexture ? info.bumpTexture : null,
				transparent: info.opacity < 1 || !!info.opacityTexture || (info.diffuseTexture && info.diffuseTexture.image.hasAlpha) || false
			});

			if (material.map) {
				// If map influence is 0 then color will not be changed but if influence is 1 then color will be white which means use 100% texture
				// Interpolate all intermediate values.
				material.color.lerp(new THREE.Color(1, 1, 1), material.map.influence ? material.map.influence : 0);
			}

			if (material.bumpMap) {
				material.bumpScale = material.bumpMap.influence ? material.bumpMap.influence : 0;
			}

			if (material.envMap) {
				material.mapping = THREE.SphericalReflectionMapping;
				material.combine = THREE.AddOperation;
				material.reflectivity = material.envMap.influence ? material.envMap.influence : 0;
			}
		}

		this._materials.set(info.materialRef, material);
	};

	SceneBuilder.prototype.createImage = function(info) {
		// var data = window.btoa(String.fromCharCode.apply(null, info.data)); // doesn't work with big images
		var data = window.btoa(info.data.reduce(function(data, byte) {
			return data + String.fromCharCode(byte);
		}, ""));
		var image = new THREE.ImageLoader().load("data:image/" + info.format + ";base64," + data);
		this._images.set(info.imageRef, image);
		image.hasAlpha = info.format === "png" && info.data[ 25 ] === 6;
	};

	SceneBuilder.prototype.insertThrustline = function(info) {
		var thrustline = this._thrustlines.get(info.thrustlineRef);

		if (!thrustline) {
			var axis = [];
			axis[0] = info.principleAxis[0];
			axis[1] = info.principleAxis[1];
			axis[2] = info.principleAxis[2];
			thrustline = new Thrustline({
				node: this._nodes.get(info.thrustlineRef),
				principleAxis: axis,
				material: this._materials.get(info.material)
			});

			var items = [];
			var basisAxisCount = 0;
			var boundPointCount = 0;
			var count = 0;
			for (var ii = 0; ii < info.itemCount; ii++) {
				var item = {};
				item.target = this._nodes.get(info.targets[ii]);
				item.majorAxisIndex = info.itemMajorAxisesIndices[ii];

				var bi;

				item.basisAxises = [];
				count = basisAxisCount + info.itemBasisAxisesCounts[ii];
				for (bi = basisAxisCount; bi < count; bi++) {
					var basisAxis = {};
					basisAxis.x = info.itemBasisAxisesCoordinates[bi * 3];
					basisAxis.y = info.itemBasisAxisesCoordinates[bi * 3 + 1];
					basisAxis.z = info.itemBasisAxisesCoordinates[bi * 3 + 2];
					item.basisAxises.push(basisAxis);
				}
				basisAxisCount = count;

				item.dimension = {};
				item.dimension.x = info.itemDimensionsCoordinates[ii * 3];
				item.dimension.y = info.itemDimensionsCoordinates[ii * 3 + 1];
				item.dimension.z = info.itemDimensionsCoordinates[ii * 3 + 2];

				item.center = {};
				item.center.x = info.itemCentersCoordinates[ii * 3];
				item.center.y = info.itemCentersCoordinates[ii * 3 + 1];
				item.center.z = info.itemCentersCoordinates[ii * 3 + 2];

				item.boundPoints = [];
				count = boundPointCount + info.itemBoundPointsCounts[ii];
				for (bi = boundPointCount; bi < count; bi++) {
					var point = {};
					point.x = info.itemBoundPointsCoordinates[bi * 3];
					point.y = info.itemBoundPointsCoordinates[bi * 3 + 1];
					point.z = info.itemBoundPointsCoordinates[bi * 3 + 2];
					item.boundPoints.push(point);
				}
				boundPointCount = count;

				items.push(item);
			}

			thrustline.setItems(items);

			var ratioCount = 0;
			var segments = [];
			for (var si = 0; si < info.segmentCount; si++) {
				var segment = {};
				segment.startItemIndex = info.segmentsStartItemIndices[si];
				segment.endItemIndex = info.segmentsEndItemIndices[si];
				segment.startBoundIndex = info.segmentsStartBoundIndices[si];
				segment.endBoundIndex = info.segmentsEndBoundIndices[si];
				segment.ratios = [];
				count = ratioCount + info.segmentRatioCounts[si];
				for (var ri = 0; ri < count; ri++) {
					var ratio = {};
					ratio.x = info.segmentRatiosCoordinates[ri * 2];
					ratio.y = info.segmentRatiosCoordinates[ri * 2 + 1];
					segment.ratios.push(ratio);
				}
				ratioCount = count;
				segments.push(segment);
			}
			thrustline.setSegments(segments);
			this._thrustlines.set(info.thrustlineRef, thrustline);
			if (!this._parentNode.userData._vkThrustlines) {
				this._parentNode.userData._vkThrustlines = [];
			}
			this._parentNode.userData._vkThrustlines.push(thrustline);
		}
	};

	SceneBuilder.prototype.insertAnimationGroup = function(info) {
		var animationClip = this._sequences.get(info.animationGroupRef);
		if (!animationClip){
			var tracks = [];
			animationClip = new THREE.AnimationClip(info.name, -1, tracks);
			if (!animationClip.userData){
				animationClip.userData = {};
			}
			animationClip.userData.startTime = info.startTime;
			animationClip.userData.endTime = info.endTime;
			animationClip.userData.frameRate = info.frameRate;
			animationClip.userData.active = info.active;
			animationClip.userData.cyclic = info.cyclic;
			animationClip.userData.currentTime = info.currentTime;
			animationClip.userData.name = info.name;
			animationClip.userData.animations = [];
			animationClip.userData.nodesEndData = new Map();
			animationClip.userData.nodesStartData = new Map();
			animationClip.userData.nodesStartDataByViewGroupId = new Map();
			this._sequences.set(info.animationGroupRef, animationClip);
		}

		if (info.modelViewRef) {
			var modelView = this._modelViews.get(info.modelViewRef);
			if (modelView) {
				if (!modelView.playbacks) {
					modelView.playbacks = [];
				}
				var playback = {
					sequenceId: info.animationGroupRef,
					playbackSpeed: info.playbackSpeed,
					playbackPreDelay: info.playbackPreDelay,
					playbackPostDelay: info.playbackPostDelay,
					playbackRepeat: info.playbackRepeat,
					playbackReversed: info.playbackReversed
				};
				modelView.playbacks.push(playback);
			}
		}
	};

	SceneBuilder.prototype.insertAnimation = function(info) {
		var animation = this._animations.get(info.animationRef);
		if (!animation){
			animation = {};
			animation.type = info.animationType;
			animation.targetRefs = [];
			animation.targetPivots = [];
			animation.sequenceId = info.animationGroupRef;
			animation.animationTracks = new Set();
			this._animations.set(info.animationRef, animation);
		}

		if (info.animationGroupRef) {
			var animationClip = this._sequences.get(info.animationGroupRef);
			if (!animationClip.userData.animations.includes(info.animationRef)) {
				animationClip.userData.animations.push(info.animationRef);
			}
		}
	};

	SceneBuilder.prototype.insertAnimationTarget = function(info) {
		var animation = this._animations.get(info.animationRef);
		if (animation) {
			if (!animation.targetRefs.includes(info.targetRef)){
				animation.targetRefs.push(info.targetRef);
				animation.targetPivots.push({ x: info.targetPivotX, y: info.targetPivotY, z: info.targetPivotZ });
			}
		}
	};

	SceneBuilder.prototype.insertAnimationTrack = function(info) {
		var animationTrack = this._animationTracks.get(info.animationTrackRef);
		var animationRef = info.animationRef;
		if (!animationTrack){
			delete info.animationRef;
			animationTrack = info;
			this._animationTracks.set(info.animationTrackRef, animationTrack);
		}

		if (!animationRef) {
			return;
		}

		var animation = this._animations.get(animationRef);
		if (!animation || !animation.sequenceId) {
			return;
		}

		if (animation.animationTracks.has(animationTrack.animationTrackRef)) {
			return;
		} else {
			animation.animationTracks.add(animationTrack.animationTrackRef);
		}

		var animationClip = this._sequences.get(animation.sequenceId);

		if (!animationClip) {
			return;
		}
		if (!animationClip.userData) {
			animationClip.userData = {};
		}

		if (!animationClip.userData.tracks) {
			animationClip.userData.tracks = [];
		}

		for (var ti = 0; animation.targetRefs && ti < animation.targetRefs.length; ti++) {
			var targetRef = animation.targetRefs[ti];
			var targetPivot = animation.targetPivots[ti];
			var node = this._nodes.get(targetRef);
			if (!node) {
				continue;
			}

			var pivot;
			if (targetPivot.x !== 0 || targetPivot.y !== 0 || targetPivot.z !== 0) {
				pivot = [ targetPivot.x, targetPivot.y, targetPivot.z ];
			}

			var type = "";
			if (animationTrack.type === 0) { // opacity
				type = "OPACITY";
			} else if (animationTrack.type === 1) {// colur
				type = "COLOUR";
			} else if (animationTrack.type === 3) {// scale
				type = "SCALE";
			} else if (animationTrack.type === 2) {// postion
				type = "TRANSLATE";
			} else if (animationTrack.type === 4) {// rotation
				type = "ROTATE";
			}

			var data = this._trackIdSequenceNodeMap.getOrCreate(info.animationTrackRef);
			data.push({ sequenceId: animation.sequenceId, targetId: targetRef, type: type, pivot: pivot });

			var track = {};
			track.id = info.animationTrackRef;
			var keys, key;
			var ki;

			if (animation.type === 0){
				if (animationTrack.dataType === 0) { // scalar
					if (animationTrack.values.length !== animationTrack.keyCount ||
						animationTrack.times.length !== animationTrack.keyCount){
						continue;
					}

					keys = [];
					for (ki = 0; ki < animationTrack.keyCount; ki++){
						key = {};
						key.time = animationTrack.times[ki];
						if (animationTrack.type === 0) { // opacity
							key.values = [ animationTrack.values[ki] ];
						} else if (animationTrack.type === 3) {// scale
							key.values = [ animationTrack.values[ki], animationTrack.values[ki], animationTrack.values[ki] ];
						}
						keys.push(key);
					}
					track.keys = keys;
				} else if (animationTrack.dataType === 1 || animationTrack.dataType === 3) {

					if (animationTrack.values.length !== 3 * animationTrack.keyCount ||
						animationTrack.times.length !== animationTrack.keyCount){
						continue;
					}

					keys = [];
					for (ki = 0; ki < animationTrack.keyCount; ki++){
						key = {};
						key.time = animationTrack.times[ki];
						key.values = [ animationTrack.values[ki * 3], animationTrack.values[ki * 3 + 1], animationTrack.values[ki * 3 + 2] ];
						keys.push(key);
					}
					track.keys = keys;

				} else if (animationTrack.dataType === 4 || animationTrack.dataType === 5 || animationTrack.dataType === 6) {

					if (animationTrack.values.length !== 4 * animationTrack.keyCount ||
						animationTrack.times.length !== animationTrack.keyCount){
						continue;
					}

					if (animationTrack.dataType === 4) {
						track.type = "angleAxis";
					} else if (animationTrack.dataType === 6) {
						track.type = "euler";
					}

					keys = [];
					for (ki = 0; ki < animationTrack.keyCount; ki++){
						key = {};
						key.time = animationTrack.times[ki];
						key.values = [ animationTrack.values[ki * 4], animationTrack.values[ki * 4 + 1], animationTrack.values[ki * 4 + 2], animationTrack.values[ki * 4 + 3] ];
						keys.push(key);
					}
					track.keys = keys;
				}
			}

			animationClip.userData.tracks.push(track);
		}
	};

	SceneBuilder.prototype.finalizeAnimation = function(animationRef) {
		var animation = this._animations.get(animationRef);
		if (!animation || !animation.sequenceId) {
			return;
		}
		var animationClip = this._sequences.get(animation.sequenceId);

		if (animationClip) {
			if (animationClip.userData && animationClip.userData.tracks) {
				this._animationHelper.insertTracks(animationClip.userData.tracks,
						this._trackIdSequenceNodeMap, this._nodes, this._sequences);
			}
			animationClip.resetDuration();
			animationClip.optimize();
			animationClip.hasOptimized = true;
		}
	};

	SceneBuilder.prototype.finalizePlaybacks = function(info) {

		var viewGroup = this._viewportGroups.get(info.viewportGroupRef);

		for (var vi = 0; vi < viewGroup.modelViews.length; vi++) {
			var modelView = viewGroup.modelViews[vi];
			this._animationHelper.processHighlights(modelView, modelView.id, this._sequences);
		}

		this._animationHelper.setInitialNodePositionsFromSubsequentViews(viewGroup, info.viewportGroupRef, this._modelViews, this._sequences);

		this._animationHelper.setInitialNodePositionsFromPreviousViews(viewGroup, info.viewportGroupRef, this._modelViews, this._sequences);

		this._animationHelper.setInitialNodePositionsFromCurrenetView(viewGroup, info.viewportGroupRef, this._modelViews, this._sequences);
	};

	SceneBuilder.prototype.progress = function(progress) {
		Log.log("reading progress:", progress);
	};

	var onmessage = function(event) {
		var data = event.data;
		if (data.ready) {
			onmessage.resolve();
		} else {
			var sceneBuilder = SceneBuilder.getById(data.sceneBuilderId);
			sceneBuilder[data.method].apply(sceneBuilder, data.args);
		}
	};

	var onerror = function(event) {
		Log.error("Error in WebWorker", event);
	};

	var getWorker = (function() {
		var promise;
		return function() {
			return promise || (promise = new Promise(function(resolve) {
				var worker = new Worker(sap.ui.require.toUrl("sap/ui/vk/threejs/MataiLoaderWorker.js"));
				onmessage.resolve = resolve.bind(null, worker);
				worker.onmessage = onmessage;
				worker.onerror = onerror;
			}));
		};
	})();

	var loadContent = function(buffer, url, parentNode, contentResource, resolve, reject) {
		getWorker().then(function(worker) {
			var sceneBuilder = new SceneBuilder(parentNode, contentResource, resolve, reject);
			worker.postMessage(
				{
					method: "loadSceneFromArrayBuffer",
					sceneBuilderId: sceneBuilder.getId(),
					buffer: buffer,
					fileName: url,
					sourceLocation: "remote"
				},
				[ buffer ]
			);
		});
	};

	return function(parentNode, contentResource) {
		return new Promise(function(resolve, reject) {
			// download contentResource.source
			// pass it to worker
			if (typeof contentResource.getSource() === "string") {
				var url = contentResource.getSource();
				fetch(url)
					.then(function(response) {
						if (response.ok) {
							return response.arrayBuffer();
						}
						throw (new Error(response.statusText));
					})
					.then(function(buffer) {
						loadContent(buffer, url, parentNode, contentResource, resolve, reject);
					})
					.catch(function(err) {
						reject(err);
					});
			} else if (contentResource.getSource() instanceof File) {
				var reader = new FileReader();
				reader.onload = function(e) {
					loadContent(e.target.result, contentResource.getSource().name, parentNode, contentResource, resolve, reject);
				};
				reader.onerror = function(err) {
					reject(err);
				};
				reader.readAsArrayBuffer(contentResource.getSource());
			}
		});
	};
});
