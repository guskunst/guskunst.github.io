/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/vk/threejs/thirdparty/three",
	"sap/ui/vk/threejs/SceneBuilder"
], function(
	jQuery,
	three,
	SceneBuilder
) {
	"use strict";

	QUnit.test("SceneBuilder", function(assert) {
		var done = assert.async();

		var nativeScene = new THREE.Scene();
		var node = new THREE.Group();
		nativeScene.add(node);

		var sceneBuilder = new SceneBuilder();
		var sceneId = "166";
		var rootNodeId = "1";
		sceneBuilder.setRootNode(node, rootNodeId, sceneId);

		var node1 = new THREE.Group();
		nativeScene.add(node1);
		sceneBuilder.setRootNode(node1, "1001", "167");


		var cameraInfo = {
							aspect: 1,
							far: 200000,
							fov: 0.5236,
							id: "10802",
							near: 1,
							origin: [ -464.0531, -873.888, -178.129 ],
							ortho: false,
							target: [ -527.1015, -173.308, -784.8607 ],
							up: [ -0.0981, 0.9836, -0.1514 ],
							zoom: 1
						};
		var camera = sceneBuilder.createCamera(cameraInfo, sceneId);
		var nativeCamera = camera.getCameraRef();
		assert.ok(nativeCamera.far === 200000 && nativeCamera.near === 1 &&
					nativeCamera.type === "PerspectiveCamera" &&
					nativeCamera.position.x === cameraInfo.origin[0] &&
					nativeCamera.position.y === cameraInfo.origin[1] &&
					nativeCamera.position.z === cameraInfo.origin[2],
					"creation of camera");

		var nodeInfo1 = {
							children: [ 1, 4, 6 ],
							name: "root",
							parent: "1",
							sid: "25046"
						};
		var parentId1 = "1";
		var resutl1 = sceneBuilder.createNode(nodeInfo1, parentId1, sceneId);
		assert.ok(resutl1.idOfGeometriesToUpdate.size === 0 &&
				!resutl1.needSetSubmesh && !resutl1.needUpdateMaterial, "creation of node 1");

		var nodeInfo2 = {
							materialId: "2732",
							name: "assy",
							sid: "25047",
							transform: [ 0.5736, 0, -0.8192, 0, 0, 1, 0, 0, 0.8192, 0, 0.5736, 0, -637.2498, -938.7576, -446.2174, 1 ]
						};
		var parentId2 = "25046";
		var resutl2 = sceneBuilder.createNode(nodeInfo2, parentId2, sceneId);
						assert.ok(resutl2.idOfGeometriesToUpdate.size === 0 &&
								!resutl2.needSetSubmesh && !resutl2.needUpdateMaterial, "creation of node 2");
		var nodeInfo3 = {
							materialId: "2732",
							name: "part1",
							sid: "25048"
						};
		var parentId3 = "25047";
		var resutl3 = sceneBuilder.createNode(nodeInfo3, parentId3, sceneId);
		assert.ok(resutl3.idOfGeometriesToUpdate.size === 0 &&
				!resutl3.needSetSubmesh && !resutl3.needUpdateMaterial, "creation of node 3");

		var nodeInfo4 = {
							materialId: "2732",
							meshId: "9303",
							name: "Root",
							sid: "25049"
						};
		var parentId4 = "25048";
		var resutl4 = sceneBuilder.createNode(nodeInfo4, parentId4, sceneId);
		assert.ok(resutl4.idOfGeometriesToUpdate.size === 0 &&
					resutl4.needSetSubmesh && resutl4.needUpdateMaterial, "creation of node 4");

		var nodeInfo5 = {
							materialId: "2734",
							name: "part2",
							sid: "25050",
							transform: [ 0.682, 0, -0.7314, 0, 0, 1, 0, 0, 0.7314, 0, 0.682, 0, -588.1596, -927.9636, -499.916, 1 ]
						};
		var parentId5 = "25046";
		var resutl5 = sceneBuilder.createNode(nodeInfo5, parentId5, sceneId);
		assert.ok(resutl5.idOfGeometriesToUpdate.size === 0 &&
				!resutl5.needSetSubmesh && !resutl5.needUpdateMaterial, "creation of node 5");


		var nodeInfo6 = {
							materialId: "2734",
							meshId: "9302",
							name: "Root",
							sid: "25051"
						};
		var parentId6 = "25050";
		var resutl6 = sceneBuilder.createNode(nodeInfo6, parentId6, sceneId);
		assert.ok(resutl6.idOfGeometriesToUpdate.size === 0 &&
				resutl6.needSetSubmesh && resutl6.needUpdateMaterial, "creation of node 6");

		var nodeInfo7 = {
							materialId: "2734",
							name: "part3",
							sid: "25052",
							transform: [ 0.454, 0, -0.891, 0, 0, 1, 0, 0, 0.891, 0, 0.454, 0, -670.9324, -927.9636, -381.6974, 1 ]
						};
		var parentId7 = "25046";
		var resutl7 = sceneBuilder.createNode(nodeInfo7, parentId7, sceneId);
		assert.ok(resutl7.idOfGeometriesToUpdate.size === 0 &&
				!resutl7.needSetSubmesh && !resutl7.needUpdateMaterial, "creation of node 7");

		var nodeInfo8 = {
							materialId: "2734",
							meshId: "9302",
							name: "Root",
							sid: "25053"
						};
		var parentId8 = "25052";
		var resutl8 = sceneBuilder.createNode(nodeInfo8, parentId8, sceneId);
		assert.ok(resutl8.idOfGeometriesToUpdate.size === 0 &&
				resutl8.needSetSubmesh && !resutl8.needUpdateMaterial, "creation of node 8");

		var materialInfo1 = {
							ambientColour: [ 0.11764705926179886, 0.11764705926179886, 0.11764705926179886, 1 ],
							diffuseColour: [ 0.8980392217636108, 0.42352941632270813, 0.4745098054409027, 1 ],
							emissiveColour: [ 0, 0, 0, 1 ],
							glossiness: 0.20000000298023224,
							id: "2732",
							opacity: 1,
							specularColour: [ 0.7529411911964417, 0.7529411911964417, 0.7529411911964417, 1 ],
							specularLevel: 0.4000000059604645
							};
		var resMaterial1 = sceneBuilder.createMaterial(materialInfo1);
		var material1 = sceneBuilder.getMaterial(materialInfo1.id);
		assert.ok(resMaterial1.length === 0 &&
					material1.color.r === materialInfo1.diffuseColour[0] &&
					material1.color.g === materialInfo1.diffuseColour[1] &&
					material1.color.b === materialInfo1.diffuseColour[2] &&
					material1.specular.r === materialInfo1.specularColour[0] &&
					material1.specular.g === materialInfo1.specularColour[1] &&
					material1.specular.b === materialInfo1.specularColour[2], "creation of material 1");

		var materialInfo2 = {
							ambientColour: [ 0.11764705926179886, 0.11764705926179886, 0.11764705926179886, 1 ],
							diffuseColour: [ 0.8980392217636108, 0.45098039507865906, 0, 1 ],
							emissiveColour: [ 0, 0, 0, 1 ],
							glossiness: 0.20000000298023224,
							id: "2734",
							opacity: 1,
							specularColour: [ 0.7529411911964417, 0.7529411911964417, 0.7529411911964417, 1 ],
							specularLevel: 0.4000000059604645
							};
		var resMaterial2 = sceneBuilder.createMaterial(materialInfo2);
		var material2 = sceneBuilder.getMaterial(materialInfo2.id);
		assert.ok(resMaterial2.length === 0 &&
					material2.color.r === materialInfo2.diffuseColour[0] &&
					material2.color.g === materialInfo2.diffuseColour[1] &&
					material2.color.b === materialInfo2.diffuseColour[2] &&
					material2.specular.r === materialInfo2.specularColour[0] &&
					material2.specular.g === materialInfo2.specularColour[1] &&
					material2.specular.b === materialInfo2.specularColour[2], "creation of material 2");

		var materialInfo3 = {
							ambientColour: [ 0.11764705926179886, 0.11764705926179886, 0.11764705926179886, 1 ],
							diffuseColour: [ 0.7529411911964417, 0.7529411911964417, 0.7529411911964417, 1 ],
							emissiveColour: [ 0, 0, 0, 1 ],
							glossiness: 0.20000000298023224,
							id: "2735",
							opacity: 1,
							specularColour: [ 0.7529411911964417, 0.7529411911964417, 0.7529411911964417, 1 ],
							specularLevel: 0.4000000059604645
							};
		var resMaterial3 = sceneBuilder.createMaterial(materialInfo3);
		var material3 = sceneBuilder.getMaterial(materialInfo3.id);
		assert.ok(resMaterial3.length === 0 &&
					material3.color.r === materialInfo3.diffuseColour[0] &&
					material3.color.g === materialInfo3.diffuseColour[1] &&
					material3.color.b === materialInfo3.diffuseColour[2] &&
					material3.specular.r === materialInfo3.specularColour[0] &&
					material3.specular.g === materialInfo3.specularColour[1] &&
					material3.specular.b === materialInfo3.specularColour[2], "creation of material 3");

		var meshId1 = "9302";
		var lod11 = 	{
					boundingBox: [ -9.399999618530273, -9.399999618530273, 0, 9.399999618530273, 9.399999618530273, 1.9500000476837158 ],
					id: "12129"
					};
		var lod12 =  {
					boundingBox: [ -9.399999618530273, -9.399999618530273, 0, 9.399999618530273, 9.399999618530273, 1.9500000476837158 ],
					data: "A///7j9fd+4zVXf/P927rzPdu6r/X927z1Xdu8z/7q/Pd+6qzHf/7jNVd+7z9Xf/M927qvPdu/r/Vd27zPXdu/z/7qrMd+76/Hc=",
					id: "12130",
					type: "box"
					};
		var submeshInfo1 = 	{
							id: "9533",
							lods: [ lod11, lod12 ],
							materialId: "2735"
							};
		var submeshRes1 = sceneBuilder.setSubmesh(meshId1, submeshInfo1);
		assert.ok(!submeshRes1.needUpdataMaterial &&
					submeshRes1.geometryIdToRequest === lod11.id, "creation of submesh 1");

		var meshId2 = "9303";
		var lod21 = {
						boundingBox: [ -104.8785400390625, 1.649999976158142, 0, 104.8785400390625, 455.5480041503906, 13.888444900512695 ],
						id: "12131"
					};
		var lod22 = {
						boundingBox: [ -104.8785400390625, 1.649999976158142, 0, 104.8785400390625, 455.5480041503906, 13.888444900512695 ],
						data: "Az+7In9fM/f1d78Rr/sz+qpf//X/Va//+v8RMxEiMyI=",
						id: "12132",
						type: "box"
					};
		var submeshInfo2 = 	{
							id: "9534",
							lods: [ lod21, lod22 ],
							materialId: "2735"
							};
		var submeshRes2 = sceneBuilder.setSubmesh(meshId2, submeshInfo2);
		assert.ok(!submeshRes2.needUpdataMaterial &&
					submeshRes2.geometryIdToRequest === lod21.id, "creation of submesh 2");

		var ressn = sceneBuilder.attachSubMeshesToNode(nodeInfo4.sid, sceneId);
		assert.ok(ressn.idOfGeometriesToUpdate.size === 1 &&
					!ressn.needSetSubmesh, "submesh is attached to node");

		var resms = sceneBuilder.applyNodeMaterialToSubmeshes(nodeInfo4.sid, sceneId);
		assert.ok(!resms.needUpdateMaterial, "node matrial is applied to submush");

		var normals1 = new Float32Array([
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

		var indices1 = new Uint16Array([
			0, 1, 2, 2, 1, 3,
			4, 6, 5, 5, 6, 7,
			8 + 0, 8 + 1, 8 + 2, 8 + 2, 8 + 1, 8 + 3,
			8 + 4, 8 + 6, 8 + 5, 8 + 5, 8 + 6, 8 + 7,
			16 + 0, 16 + 1, 16 + 2, 16 + 2, 16 + 1, 16 + 3,
			16 + 4, 16 + 6, 16 + 5, 16 + 5, 16 + 6, 16 + 7
		]);

		var getVerticesFromBoundingBox = function(b) {
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
			return vertices;
		};

		var boundingBox1 = [ -9.399999618530273, -9.399999618530273, 0, 9.399999618530273, 9.399999618530273, 1.9500000476837158 ];
		var vertices1 = getVerticesFromBoundingBox(boundingBox1);

		var data1 = { indices: indices1, normals: normals1, points: vertices1 };

		var geoInfo1 = {
						data: data1,
						id: "12129",
						isPolyline: false,
						isPositionQuantized: false
					  };

		sceneBuilder.setGeometry(geoInfo1);

		var geo1 = sceneBuilder.getGeometry(geoInfo1.id);

		assert.ok(geo1, "creation of geometry 1");

		var boundingBox2 = [ -104.8785400390625, 1.649999976158142, 0, 104.8785400390625, 455.5480041503906, 13.888444900512695 ];
		var vertices2 = getVerticesFromBoundingBox(boundingBox2);

		var data2 = { indices: indices1, normals: normals1, points: vertices2 };

		var geoInfo2 = {
						data: data2,
						id: "12131",
						isPolyline: false,
						isPositionQuantized: false
					  };

		sceneBuilder.setGeometry(geoInfo2);

		var geo2 = sceneBuilder.getGeometry(geoInfo2.id);

		assert.ok(geo2, "creation of geometry 2");

		sceneBuilder.updateGeometryInNode(nodeInfo4.sid, geoInfo2.id, sceneId);

		var childIds = sceneBuilder.getChildNodeIds(nodeInfo4.sid, sceneId, true);
		var childNode = sceneBuilder.getSubmesh(childIds[0]);
		assert.ok(geo2 === childNode.geometry, "node geometry is updated");

		var node4 = sceneBuilder.getNode(nodeInfo4.sid);
		var nodeId4 = sceneBuilder.getObjectId(node4);
		assert.ok(nodeId4 === nodeInfo4.sid, "node id is checked");

		var newNodeInfo4 = {
			materialId: "2734",
			meshId: "9303",
			name: "Root",
			sid: "25049"
		};

		var resun = sceneBuilder.updateMaterialInNode(newNodeInfo4, sceneId);
		assert.ok(!resun.needUpdateMaterial && resun.nodeUpdated, "node material is updated");

		sceneBuilder.remove(nodeId4);
		node4 = sceneBuilder.getNode(nodeInfo4.sid);
		assert.ok(!node4, "node is removed");

		done();
	});

	QUnit.done(function() {
		jQuery("#content").hide();
	});
});
