/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.threejs.SceneBuilder.
sap.ui.define([
	"jquery.sap.global", "./thirdparty/three", "sap/ui/vk/View"
], function(
	jQuery, three, View, Billboard
) {
	"use strict";

	/**
	 * Provides help functions for processing animation data.
	 *
	 * Constructor for a new SceneBuilder
	 *
	 * @pivate
	 * @author SAP SE
	 * @version 1.66.0
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationHelper = function() {
	};

	AnimationHelper.prototype._getChildNodesWithMaterial = function(pnode, children) {
		for (var cni = 0; pnode.children && cni < pnode.children.length; cni++) {
			var child = pnode.children[cni];
			if (child && child.material && child.material.color){
				children.push(child);
			}
			this._getChildNodesWithMaterial(child, children);
		}
	};

	AnimationHelper.prototype._cloneKeyFrameTrack = function(track) {  // if latest three.js is used, KeyFrameTrack's clone function should be used

		var times = THREE.AnimationUtils.arraySlice(track.times, 0);
		var values = THREE.AnimationUtils.arraySlice(track.values, 0);

		var TypedKeyframeTrack = track.constructor;
		var clonedTrack = new TypedKeyframeTrack(track.name, times, values);

		clonedTrack.createInterpolant = track.createInterpolant;

		return clonedTrack;
	};

	AnimationHelper.prototype._cloneAnimationClip = function(clip) { // if latest three.js is used, AnimationClip's clone function should be used

		var tracks = [];

		for (var i = 0; clip.tracks && i < clip.tracks.length; i++) {

			tracks.push(this._cloneKeyFrameTrack(clip.tracks[ i ]));
		}

		return new THREE.AnimationClip(clip.name, clip.duration, tracks);
	};

	AnimationHelper.prototype.addAnimationTracksToHighlight = function(highlight) {

		var duration = highlight.duration;
		if (!highlight.cycles) {
			highlight.cycles = 0;
		} else {
			duration /= 2;
		}

		var needOpacityTrack = false;
		var oi;
		for (oi = 0; highlight.opacities && oi < highlight.opacities.length; oi++) {
			if (highlight.opacities[oi] !== 1) {
				needOpacityTrack = true;
				break;
			}
		}
		var opacityTrack;
		var key, ki, timeInterval;
		if (needOpacityTrack){
			opacityTrack = {};
			opacityTrack.keys = [];
			timeInterval = highlight.duration / highlight.opacities.length;
			for (ki = 0; ki < highlight.cycles + 1; ki++) {
				for (oi = 0; oi < highlight.opacities.length; oi++) {
					key = {};
					key.values = [ highlight.opacity1 ];
					key.time = timeInterval * (ki *  highlight.opacities.length + oi);
					opacityTrack.keys.push(key);
					if (highlight.type === "STATIC") {
						break;
					}
				}
				if (highlight.type === "STATIC") {
					break;
				}
			}
			opacityTrack.data = {};
			opacityTrack.data.type = "OPACITY";
			opacityTrack.data.highlight = highlight;
			highlight.duration = opacityTrack.keys[opacityTrack.keys.length - 1].time;
		}

		var needColorTrack = false;
		var ci;
		for (ci = 0; highlight.colours && ci < highlight.colours.length; ci++) {
			var c = highlight.colours[ci];
			if (c[0] !== 0 || c[1] !== 0 || c[2] !== 0) {
				needColorTrack = true;
				break;
			}
		}
		var colorTrack;
		if (needColorTrack) {

			if (highlight.type === "INFINITE" && highlight.colours.length === 1) {
				var additionalColor = [ 0, 0, 0, 1 ];
				highlight.colours.push(additionalColor);
			}

			colorTrack = {};
			colorTrack.keys = [];
			timeInterval = highlight.duration / highlight.colours.length;
			for (ki = 0; ki < highlight.cycles + 1; ki++) {
				for (ci = 0; ci < highlight.colours.length; ci++) {
					key = {};
					var color = highlight.colours[ci];
					key.values = [ color[0], color[1], color[2] ];
					key.time = timeInterval * (ki *  highlight.opacities.length + ci);
					colorTrack.keys.push(key);
					if (highlight.type === "STATIC") {
						break;
					}
				}
				if (highlight.type === "STATIC") {
					break;
				}
			}
			colorTrack.data = {};
			colorTrack.data.type = "COLOR";
			colorTrack.data.highlight = highlight;
			highlight.duration = colorTrack.keys[colorTrack.keys.length - 1].time;
		}

		if (colorTrack) {
			highlight.colorTrack = colorTrack;
		}

		if (opacityTrack) {
			highlight.opacityTrack = opacityTrack;
		}
	};

	AnimationHelper.prototype.processHighlights = function(view, viewId, sequences) {
		if (!view.highlights ||  !view.highlights.length) {
			return;
		}

		var playbacks = view.playbacks;
		if (!playbacks && view.getPlaybacks) {
			playbacks = view.getPlaybacks();
		}

		var playback;

		var needNewPlaybackForHighlight = false;
		if (!playbacks || !playbacks.length) {
			needNewPlaybackForHighlight = true;
		}

		var maxDuration = 0;
		var hi;
		var highlight;
		var hasInfiniteHighlight = false;
		for (hi = 0; hi < view.highlights.length; hi++) {
			highlight = view.highlights[hi];
			if (maxDuration < highlight.duration) {
				maxDuration = highlight.duration;
			}

			if (highlight.type === "INFINITE") {
				if (playbacks && playbacks.length > 0) {
					playback = playbacks[playbacks.length - 1];
				}
				if (!playback || !playback.isInfinite) {
					needNewPlaybackForHighlight = true;
				}
				hasInfiniteHighlight = true;
			}
		}

		for (var pi = 0; playbacks && pi < playbacks.length; pi++){
			playback = playbacks[pi];
			var clip = sequences.get(playback.sequenceId);
			if (clip) {
				if (!clip.userData) {
					clip.userData = {};
				}
				clip.userData.maxDuration = maxDuration;
			}
		}

		if (needNewPlaybackForHighlight) {
			var animationClip = sequences.get(viewId);
			if (!animationClip){
				var tracks = [];
				animationClip = new THREE.AnimationClip("Highlights", -1, tracks);
				if (!animationClip.userData){
					animationClip.userData = {};
				}
				animationClip.userData.startTime = 0;
				animationClip.userData.endTime = maxDuration;
				animationClip.userData.frameRate = 0;
				animationClip.userData.active = true;
				animationClip.userData.currentTime = 0;
				animationClip.userData.name = "";
				animationClip.userData.animations = [];
				animationClip.userData.nodesEndData = new Map();
				animationClip.userData.nodesStartData = new Map();
				animationClip.userData.nodesStartDataByViewGroupId = new Map();
				sequences.set(viewId, animationClip);

				if (!playbacks) {
					playbacks = [];
				}

				playback = {
					sequenceId: viewId,
					playbackSpeed: 0,
					playbackPreDelay: 0,
					playbackPostDelay: 0,
					playbackRepeat: 0,
					playbackReversed: false,
					duration: maxDuration
				};

				if (hasInfiniteHighlight) {
					playback.isInfinite = true;
				}

				playbacks.push(playback);

				if (view.setPlaybacks) {
					view.setPlaybacks(playbacks);
				} else {
					view.playbacks = playbacks;
				}
			}
		}
		for (hi = 0; hi < view.highlights.length; hi++) {
			highlight = view.highlights[hi];
			this.processHighlight(highlight, view, viewId, sequences);
		}
	};

	AnimationHelper.prototype.processHighlight = function(highlight, view, viewId, sequences) {
		if (!highlight || (!highlight.opacityTrack && !highlight.colorTrack)) {
			return;
		}

		var playbacks = view.playbacks;
		if (!playbacks && view.getPlaybacks) {
			playbacks = view.getPlaybacks();
		}

		var start = 0;
		var end = 1;
		if (playbacks[0].isContinuity && playbacks.length > 1) {
			start = 1;
			end = 2;
		}

		if (highlight.type !== "FINITE") {
			end = playbacks.length;
		}

		for (var pi = start; pi < end; pi++) {
			var playback = playbacks[pi];
			var clip = sequences.get(playback.sequenceId);

			if (!clip) {
				continue;
			}

			// Two views may share the same sequence, but have different highlights
			// we have to clone animation clips, and add highlight tracks to the cloned clips
			if (playback.sequenceId !== viewId) {
				playback.sequenceId = playback.sequenceId + "-" + viewId + "-withHighlight";
				var clonedClip = this._cloneAnimationClip(clip);
				clonedClip.userData = {};
				if (clip.userData) {
					if (clip.userData.maxDuration !== undefined) {
						clonedClip.userData.maxDuration = clip.userData.maxDuration;
					}

					if (clip.userData.cyclic !== undefined) {
						clonedClip.userData.cyclic = clip.userData.cyclic;
					}

					if (clip.userData.endTime !== undefined) {
						clonedClip.userData.endTime = clip.userData.endTime;
					}

					if (clip.userData.frameRate !== undefined) {
						clonedClip.userData.frameRate = clip.userData.frameRate;
					}

					var entries, next, mapKey, mapValue;

					clonedClip.userData.nodesEndData = new Map();
					if (clip.userData.nodesEndData) {
						entries = clip.userData.nodesEndData.entries();
						next = entries.next();
						while (!next.done) {
							mapKey = next.value[0];
							mapValue = next.value[1];
							clonedClip.userData.nodesEndData.set(mapKey, mapValue);
							next = entries.next();
						}
					}

					clonedClip.userData.nodesStartData = new Map();
					if (clip.userData.nodesStartData) {
						entries = clip.userData.nodesStartData.entries();
						next = entries.next();
						while (!next.done) {
							mapKey = next.value[0];
							mapValue = next.value[1];
							clonedClip.userData.nodesStartData.set(mapKey, mapValue);
							next = entries.next();
						}
					}
				}

				sequences.set(playback.sequenceId, clonedClip);
				clip = clonedClip;
			}

			if (clip) {
				if (!clip.userData) {
					clip.userData = {};
				}
				if (!clip.userData.highlights) {
					clip.userData.highlights = new Map();
				}
			} else {
				continue;
			}

			clip.resetDuration();
			var maxDuration = clip.duration;
			if (playback.duration && playback.duration > maxDuration) {
				maxDuration = playback.duration;
			} else if (clip.userData && clip.userData.maxDuration && maxDuration < clip.userData.maxDuration) {
				maxDuration = clip.userData.maxDuration;
			}

			var lastkey, endkey;
			for (var hi = 0; highlight.highlightNodes && hi < highlight.highlightNodes.length; hi++){
				var node = highlight.highlightNodes[hi];
				var storedHighlight = clip.userData.highlights.get(node);
				if (storedHighlight) {
					continue;
				} else {
					clip.userData.highlights.set(node, highlight);
				}

				if (highlight.opacityTrack) {
					this.insertSingleTrack(clip, highlight.opacityTrack, node);
				}

				if (highlight.colorTrack) {

					// for non-tatic highlight, extra final key frame is used for reseting the node color to its original
					var resetEndColor = false;
					if (highlight.colorTrack.keys.length > 1 && highlight.type !== "INFINITE") {
						resetEndColor = true;
					}

					var nodesWithMaterial = [];
					if (node.material && node.material.color) {
						nodesWithMaterial.push(node);
					} else {
						this._getChildNodesWithMaterial(node, nodesWithMaterial);
					}

					for (var ni = 0; ni < nodesWithMaterial.length; ni++) {
						var mNode = nodesWithMaterial[ni];
						var ci, key;
						var cTrack = {};
						cTrack.keys = [];
						cTrack.data = highlight.colorTrack.data;
						var startTime = 0.0;
						if (resetEndColor) { // for reversed playback, set to original color at the end
							var firstkey = {};
							startTime = 0.05;
							firstkey.time = 0.0;
							firstkey.values = [ mNode.material.color.r, mNode.material.color.g, mNode.material.color.b ];
							cTrack.keys.push(firstkey);
						}
						for (ci = 0; ci < highlight.colorTrack.keys.length; ci++) {
							key  = {};
							key.values = highlight.colorTrack.keys[ci].values;
							key.time = highlight.colorTrack.keys[ci].time + startTime;
							cTrack.keys.push(key);
						}
						if (resetEndColor) { // for not reversed playback, set to original color at the end
							lastkey = cTrack.keys[cTrack.keys.length - 1];
							endkey = {};
							endkey.time = lastkey.time + 0.05;
							endkey.values = [ mNode.material.color.r, mNode.material.color.g, mNode.material.color.b ];
							cTrack.keys.push(endkey);
						}

						if (highlight.type === "INFINITE") {

							var timeInterval = 0.05;
							if (cTrack.keys.length > 1) {
								timeInterval = cTrack.keys[cTrack.keys.length - 1].time - cTrack.keys[cTrack.keys.length - 2].time;
							}
							startTime = cTrack.keys[cTrack.keys.length - 1].time + timeInterval;
							var endTime = startTime;
							while (endTime < maxDuration) {
								for (ci = 0; ci < highlight.colorTrack.keys.length; ci++) {
									key  = {};
									key.values = highlight.colorTrack.keys[ci].values;
									key.time = highlight.colorTrack.keys[ci].time + startTime;
									cTrack.keys.push(key);
									endTime = key.time;
									if (endTime >= maxDuration) {
										break;
									}
								}

								startTime = endTime + timeInterval;
							}
						}

						if (highlight.type === "STATIC") {
							lastkey = cTrack.keys[cTrack.keys.length - 1];
							endkey = {};
							endkey.time = maxDuration;
							endkey.values = [ lastkey.values[0], lastkey.values[1],  lastkey.values[2] ];
							cTrack.keys.push(endkey);
						}

						this.insertSingleTrack(clip, cTrack, mNode);
					}

				}
			}
			clip.resetDuration();
			clip.userData.hasHighlight = true;
		}
	};

	AnimationHelper.prototype._getMatrixFromEulerRotationAngles = function(x, y, z, order) {
		var getMatrixFromEulerRotationAngle = function(angle,  axis) {
			var c = Math.cos(angle);
			var s = Math.sin(angle);

			var m11 = 1;
			var m12 = 0;
			var m13 = 0;
			var m14 = 0;

			var m21 = 0;
			var m22 = 1;
			var m23 = 0;
			var m24 = 0;

			var m31 = 0;
			var m32 = 0;
			var m33 = 1;
			var m34 = 0;

			if (axis === "X") {
				m22 = c;
				m23 = -s;
				m32 = s;
				m33 = c;
			} else if (axis === "Y") {
				m11 = c;
				m13 = s;
				m31 = -s;
				m33 = c;
			} else {
				m11 = c;
				m12 = -s;
				m21 = s;
				m22 = c;
			}
			var m = new THREE.Matrix4();
			m.set(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, 0, 0, 0, 1);
			return m;
		};

		order = Math.round(order);
		var angle;
		var rm = new THREE.Matrix4();
		var m0;
		for (var oi = 0; oi < 3; oi++){
			if (oi === 0) {
				angle = x;
			} else if (oi === 1) {
				angle = y;
			} else {
				angle = z;
			}
			if ((order >> (oi * 2) & 3) === 0) {
				m0 = getMatrixFromEulerRotationAngle(angle, "X");
				rm.multiply(m0);
			} else if ((order >> (oi * 2) & 3) === 1) {
				m0 = getMatrixFromEulerRotationAngle(angle, "Y");
				rm.multiply(m0);
			} else if ((order >> (oi * 2) & 3) === 2) {
				m0 = getMatrixFromEulerRotationAngle(angle, "Z");
				rm.multiply(m0);
			}
		}
		return rm;
	};

	AnimationHelper.prototype._getRotationMatrix = function(index1, index2, rotationTrack, blendFactor) {

		var x, y, z;
		var rkey1, rkey2;
		if (rotationTrack.type === "euler") {

			if (index1 === index2) {
				rkey1 = rotationTrack.keys[index1];
				return this._getMatrixFromEulerRotationAngles(rkey1.values[0], rkey1.values[1], rkey1.values[2], rkey1.values[3]);
			}

			rkey1 = rotationTrack.keys[index1];
			rkey2 = rotationTrack.keys[index2];

			var order = rkey1.values[3];
			x = rkey1.values[0] * (1 - blendFactor) + rkey1.values[0] * blendFactor;
			y = rkey1.values[1] * (1 - blendFactor) + rkey1.values[1] * blendFactor;
			z = rkey1.values[2] * (1 - blendFactor) + rkey1.values[2] * blendFactor;
			return this._getMatrixFromEulerRotationAngles(x, y, z, order);
		} else if (rotationTrack.type === "angleAxis") {
			var rm1 = new THREE.Matrix4();

			var angle, axis, tempRm;
			for (var ri = 0; ri <= index1; ri++) {
				x = rotationTrack.keys[ri].values[0];
				y = rotationTrack.keys[ri].values[1];
				z = rotationTrack.keys[ri].values[2];
				angle = rotationTrack.keys[ri].values[3];
				axis = new THREE.Vector3(x, y, z);
				tempRm = new THREE.Matrix4();
				tempRm.makeRotationAxis(axis, angle);
				rm1.premultiply(tempRm);
			}

			if (index1 === index2) {
				return rm1;
			}

			rkey2 = rotationTrack.keys[index2];
			x = rkey2.values[0];
			y = rkey2.values[1];
			z = rkey2.values[2];
			angle = rkey2.values[3] * blendFactor;

			axis = new THREE.Vector3(x, y, z);
			var rm2 = new THREE.Matrix4();
			rm2.makeRotationAxis(axis, angle);

			rm2.multiply(rm1);
			return rm2;
		} else {
			var quat;

			if (index1 === index2) {
				rkey1 = rotationTrack.keys[index1];
				quat = new THREE.Quaternion(rkey1.values[0], rkey1.values[1], rkey1.values[2], rkey1.values[3]);
			}
			var rm = new THREE.Matrix4();

			if (quat) {
				rm.makeRotationFromQuaternion(quat);
				return rm;
			}

			rkey1 = rotationTrack.keys[index1];
			rkey2 = rotationTrack.keys[index2];

			var EPSILON = 0.001;
			var beta;         		// complementary interp parameter
			var theta;          	// angle between A and B
			var phi;        		// theta plus spins
			var bFlip;    			// use negation of B?
			var x1 = rkey1.values[0];
			var y1 = rkey1.values[1];
			var z1 = rkey1.values[2];
			var w1 = rkey1.values[3];
			var x2 = rkey2.values[0];
			var y2 = rkey2.values[1];
			var z2 = rkey2.values[2];
			var w2 = rkey2.values[3];

			var cost;
			var sint;

			cost = x1 * x2 + y1 * y2 + z1 * z2 + w1 * w2;

			// if B is on opposite hemisphere from A, use -B instead

			if (cost < 0.0) {
				cost = -cost;
				bFlip = true;
			} else {
				bFlip = false;
			}

			if (cost > 1.0) {
				cost = 1.0;
			}

			// if B is (within precision limits) the same as A,
			// * just linear interpolate between A and B.
			// * Can't do spins, since we don't know what direction to spin.

			if ((1.0 - cost) < EPSILON) {
				beta = 1.0 - blendFactor;
			} else {// normal case
				theta = Math.acos(cost);
				phi = theta;
				sint = Math.sin(theta);
				beta = Math.sin(theta - blendFactor * phi) / sint;
				blendFactor = Math.sin(blendFactor * phi) / sint;
			}

			if (bFlip) {
				blendFactor = -blendFactor;
			}

			// interpolate
			x = beta * x1 + blendFactor * x2;
			y = beta * y1 + blendFactor * y2;
			z = beta * z1 + blendFactor * z2;
			var w = beta * w1 + blendFactor * w2;

			quat = new THREE.Quaternion(x, y, z, w);
			rm.makeRotationFromQuaternion(quat);
			return rm;
		}
	};

	AnimationHelper.prototype._getScaleMatrix = function(skey1, skey2, blendFactor) {
		var xs = 1, ys = 1, zs = 1;
		if (skey1 && !skey2) {
			xs = skey1.values[0];
			ys = skey1.values[1];
			zs = skey1.values[2];
		} else if (!skey1 && skey2) {
			xs = skey2.values[0];
			ys = skey2.values[1];
			zs = skey2.values[2];
		} else if (skey1 && skey2) {
			xs = skey1.values[0] * (1 - blendFactor) + skey2.values[0] * blendFactor;
			ys = skey1.values[1] * (1 - blendFactor) + skey2.values[1] * blendFactor;
			zs = skey1.values[2] * (1 - blendFactor) + skey2.values[2] * blendFactor;
		}

		var sm = new THREE.Matrix4();
		sm.makeScale(xs, ys, zs);
		return sm;
	};

	AnimationHelper.prototype._getTranslateMatrix = function(pkey1, pkey2, blendFactor) {
		var x = 0, y = 0, z = 0;
		if (pkey1 && !pkey2) {
			x = pkey1.values[0];
			y = pkey1.values[1];
			z = pkey1.values[2];
		} else if (!pkey1 && pkey2) {
			x = pkey2.values[0];
			y = pkey2.values[1];
			z = pkey2.values[2];
		} else if (pkey1 && pkey2) {
			x = pkey1.values[0] * (1 - blendFactor) + pkey2.values[0] * blendFactor;
			y = pkey1.values[1] * (1 - blendFactor) + pkey2.values[1] * blendFactor;
			z = pkey1.values[2] * (1 - blendFactor) + pkey2.values[2] * blendFactor;
		}

		var tm = new THREE.Matrix4();
		tm.makeTranslation(x, y, z);
		return tm;
	};

	AnimationHelper.prototype.insertTracksWithPivot = function(animationClip, positionTrack, scaleTrack, rotationTrack, pivot, node) {

		if (node.children && node.children.length) {
			var needZeroPivot = true;
			var offsetName = node.name + " offset geometry"; // streaming object matrix
			for (var ci = 0; ci < node.children.length; ci++) {
				var child = node.children[ci];
				if ((child.name === offsetName && child.type === "Group") || child.isMesh) {
					var pv = new THREE.Vector3(pivot[0], pivot[1], pivot[2]);
					pv.applyMatrix4(child.matrix);
					pivot[0] = pv.x;
					pivot[1] = pv.y;
					pivot[2] = pv.z;
					needZeroPivot = false;
					break;
				}
			}
			if (needZeroPivot) {
				pivot[0] = 0.0;
				pivot[1] = 0.0;
				pivot[2] = 0.0;
			}
		}

		var stepN = 1;
		var startTime = 0;
		var lastTime = 0;

		if (rotationTrack) {
			if (lastTime < rotationTrack.keys[rotationTrack.keys.length - 1].time) {
				lastTime = rotationTrack.keys[rotationTrack.keys.length - 1].time;
			}

			if (startTime > rotationTrack.keys[0].time) {
				startTime = rotationTrack.keys[0].time;
			}
			if (stepN < rotationTrack.keys.length) {
				stepN = rotationTrack.keys.length;
			}
		}

		if (positionTrack) {
			if (lastTime < positionTrack.keys[positionTrack.keys.length - 1].time) {
				lastTime = positionTrack.keys[positionTrack.keys.length - 1].time;
			}

			if (startTime > positionTrack.keys[0].time) {
				startTime = positionTrack.keys[0].time;
			}
			if (stepN < positionTrack.keys.length) {
				stepN = positionTrack.keys.length;
			}
		}

		if (scaleTrack) {
			if (lastTime < scaleTrack.keys[scaleTrack.keys.length - 1].time) {
				lastTime = scaleTrack.keys[scaleTrack.keys.length - 1].time;
			}

			if (startTime > scaleTrack.keys[0].time) {
				startTime = scaleTrack.keys[0].time;
			}
			if (stepN < scaleTrack.keys.length) {
				stepN = scaleTrack.keys.length;
			}
		}

		var maxPeriod = lastTime -  startTime;

		var ki;
		if (rotationTrack && rotationTrack.keys.length > 1) {
			if (rotationTrack.type === "angleAxis") {
				var maxAngle = 0.0;
				for (ki = 1; ki < rotationTrack.keys.length; ki++) {
					if (maxAngle < rotationTrack.keys[ki].values[3]) {
						maxAngle = rotationTrack.keys[ki].values[3];
					}
				}
				var rStep = 3.1416 / 12;
				var rn = Math.ceil((rotationTrack.keys.length - 1) * maxAngle / rStep);
				if (rn > stepN) {
					stepN = rn;
				}
			} else {
				stepN = 4 * rotationTrack.keys.length;
			}
		}

		var timeStep = maxPeriod / stepN;

		var name = node.uuid;
		var times = [];
		var pvalues = [];
		var qvalues = [];
		var svalues = [];

		var mt1 = new THREE.Matrix4();
		var mt2 = new THREE.Matrix4();
		mt1.makeTranslation(pivot[0], pivot[1], pivot[2]);
		mt2.makeTranslation(-pivot[0], -pivot[1], -pivot[2]);

		var rotationMatrix = new THREE.Matrix4();
		var scaleMatrix = new THREE.Matrix4();
		var positionMatrix = new THREE.Matrix4();

		var t1, t2, si;

		for (si = 0; si <= stepN; si++) {
			var currentTime = startTime + si * timeStep;
			var index1 = 0;
			var index2 = 0;
			var blendFactor = 0;
			if (rotationTrack) {
				if (currentTime <= rotationTrack.keys[0].time) {
					index1 = 0;
					index2 = 0;
				} else if (currentTime >= rotationTrack.keys[rotationTrack.keys.length - 1].time){
					if (rotationTrack.keys.length > 1) {
						blendFactor = 1;
					}
					index1 = rotationTrack.keys.length - 1;
					index2 = rotationTrack.keys.length - 1;
				} else {
					for (ki = 0; ki < rotationTrack.keys.length - 1; ki++) {
						t1 = rotationTrack.keys[ki].time;
						t2 = rotationTrack.keys[ki + 1].time;
						if (currentTime >= t1 && currentTime <= t2){
							blendFactor = (currentTime - t1) / (t2 - t1);
							index1 = ki;
							index2 = ki + 1;
							break;
						}
					}
				}

				rotationMatrix = this._getRotationMatrix(index1, index2, rotationTrack, blendFactor);
			}

			var skey1 = null;
			var skey2 = null;
			blendFactor = 0;
			if (scaleTrack) {
				if (currentTime <= scaleTrack.keys[0].time) {
					skey1 = scaleTrack.keys[0];
				} else if (currentTime >= scaleTrack.keys[scaleTrack.keys.length - 1].time){
					skey2 = scaleTrack.keys[scaleTrack.keys.length - 1];
				} else {
					for (ki = 0; ki < scaleTrack.keys.length - 1; ki++) {
						t1 = scaleTrack.keys[ki].time;
						t2 = scaleTrack.keys[ki + 1].time;
						if (currentTime >= t1 && currentTime <= t2){
							skey1 = scaleTrack.keys[ki];
							skey2 = scaleTrack.keys[ki + 1];
							blendFactor = (currentTime - t1) / (t2 - t1);
							break;
						}
					}
				}

				scaleMatrix = this._getScaleMatrix(skey1, skey2, blendFactor);
			}

			var pkey1 = null;
			var pkey2 = null;
			blendFactor = 0;
			if (positionTrack) {
				if (currentTime <= positionTrack.keys[0].time) {
					pkey1 = positionTrack.keys[0];
				} else if (currentTime >= positionTrack.keys[positionTrack.keys.length - 1].time){
					pkey2 = positionTrack.keys[positionTrack.keys.length - 1];
				} else {
					for (ki = 0; ki < positionTrack.keys.length - 1; ki++) {
						t1 = positionTrack.keys[ki].time;
						t2 = positionTrack.keys[ki + 1].time;
						if (currentTime >= t1 && currentTime <= t2){
							pkey1 = positionTrack.keys[ki];
							pkey2 = positionTrack.keys[ki + 1];
							blendFactor = (currentTime - t1) / (t2 - t1);
							break;
						}
					}
				}

				positionMatrix = this._getTranslateMatrix(pkey1, pkey2, blendFactor);
			}
			var m = new THREE.Matrix4();
			// m.multiply(mt1);
			m.multiply(positionMatrix);
			m.multiply(scaleMatrix);
			m.multiply(rotationMatrix);
			m.multiply(mt2);

			var quat = new THREE.Quaternion();
			var posi = new THREE.Vector3();
			var scal = new THREE.Vector3();
			m.decompose(posi, quat, scal);

			qvalues.push(quat.x);
			qvalues.push(quat.y);
			qvalues.push(quat.z);
			qvalues.push(quat.w);
			pvalues.push(posi.x);
			pvalues.push(posi.y);
			pvalues.push(posi.z);
			svalues.push(scal.x);
			svalues.push(scal.y);
			svalues.push(scal.z);
			times.push(currentTime);
		}

		var nodeEndData = {};
		var nodeStartData = {};

		var scaleVector = new THREE.Vector3(svalues[svalues.length - 3], svalues[svalues.length - 2], svalues[svalues.length - 1]);
		nodeEndData.scale = scaleVector;
		var scaleVector1 = new THREE.Vector3(svalues[0], svalues[1], svalues[2]);
		nodeStartData.scale = scaleVector1;

		var currentQuaternion = new THREE.Quaternion(qvalues[qvalues.length - 4], qvalues[qvalues.length - 3], qvalues[qvalues.length - 2], qvalues[qvalues.length - 1]);
		nodeEndData.quaternion  = currentQuaternion;
		var currentQuaternion1 = new THREE.Quaternion(qvalues[0], qvalues[1], qvalues[2], qvalues[3]);
		nodeStartData.quaternion  = currentQuaternion1;

		var positionVector = new THREE.Vector3(pvalues[pvalues.length - 3], pvalues[pvalues.length - 2], pvalues[pvalues.length - 1]);
		nodeEndData.position = positionVector;
		var positionVector1 = new THREE.Vector3(pvalues[0], pvalues[1], pvalues[2]);
		nodeStartData.position = positionVector1;

		animationClip.userData.nodesEndData.set(node, nodeEndData);
		animationClip.userData.nodesStartData.set(node, nodeStartData);

		var sname = name + ".scale";
		var skeyframeTrack = new THREE.VectorKeyframeTrack(sname, times, svalues);
		skeyframeTrack.userData = {};
		skeyframeTrack.userData.originalValue = node.scale.clone();
		if (scaleTrack) {
			skeyframeTrack.userData.info = scaleTrack;
			skeyframeTrack.userData.type = scaleTrack.data.type;
		}
		if (scaleTrack && scaleTrack.interpolationType === 1) {
			skeyframeTrack.setInterpolation(THREE.InterpolateSmooth);
		} else {
			skeyframeTrack.setInterpolation(THREE.InterpolateLinear);
		}
		// skeyframeTrack.setInterpolation(THREE.InterpolateDiscrete);
		skeyframeTrack.userData.targetNode = node;
		animationClip.tracks.push(skeyframeTrack);

		var qname = name + ".quaternion";
		var qkeyframeTrack = new THREE.QuaternionKeyframeTrack(qname, times, qvalues);
		qkeyframeTrack.userData = {};
		qkeyframeTrack.userData.originalValue = node.quaternion.clone();
		if (rotationTrack) {
			qkeyframeTrack.userData.info = rotationTrack;
			qkeyframeTrack.userData.type = rotationTrack.data.type;
		}
		if (rotationTrack && rotationTrack.interpolationType === 1) {
			qkeyframeTrack.setInterpolation(THREE.InterpolateSmooth);
		} else {
			qkeyframeTrack.setInterpolation(THREE.InterpolateLinear);
		}
		// qkeyframeTrack.setInterpolation(THREE.InterpolateDiscrete);
		qkeyframeTrack.userData.targetNode = node;
		animationClip.tracks.push(qkeyframeTrack);

		var pname = name + ".position";
		var pkeyframeTrack = new THREE.VectorKeyframeTrack(pname, times, pvalues);
		pkeyframeTrack.userData = {};
		pkeyframeTrack.userData.originalValue = node.position.clone();
		if (positionTrack) {
			pkeyframeTrack.userData.info = positionTrack;
			pkeyframeTrack.userData.type = positionTrack.data.type;
		}
		if (positionTrack && positionTrack.interpolationType === 1) {
			pkeyframeTrack.setInterpolation(THREE.InterpolateSmooth);
		} else {
			pkeyframeTrack.setInterpolation(THREE.InterpolateLinear);
		}
		// pkeyframeTrack.setInterpolation(THREE.InterpolateDiscrete);
		pkeyframeTrack.userData.targetNode = node;
		animationClip.tracks.push(pkeyframeTrack);
	};

	AnimationHelper.prototype.insertSingleTrack = function(animationClip, track, node) {

		var name = node.uuid;
		var originalValue;
		var times = [];
		var values = [];
		var ki, vi;
		var keyframeTrack;
		var key;
		var m, m0;
		var quaternion;
		var nodeEndData, nodeStartData;
		if (track.data.type === "TRANSLATE"){

			name += ".position";
			originalValue = node.position.clone();

			for (ki = 0; ki < track.keys.length; ki++){
				key = track.keys[ki];
				times.push(key.time);
				if (key.values.length === 3) {
					for (vi = 0; vi < 3; vi++) {
						values.push(key.values[vi]);
					}
				}
			}

			if (times.length * 3 !== values.length) {
				return;
			}

			nodeEndData = animationClip.userData.nodesEndData.get(node);
			if (!nodeEndData) {
				nodeEndData = {};
				animationClip.userData.nodesEndData.set(node, nodeEndData);
			}

			nodeStartData = animationClip.userData.nodesStartData.get(node);
			if (!nodeStartData) {
				nodeStartData = {};
				animationClip.userData.nodesStartData.set(node, nodeStartData);
			}

			var positionVector = new THREE.Vector3(values[values.length - 3], values[values.length - 2], values[values.length - 1]);
			nodeEndData.position = positionVector;

			var positionVector1 = new THREE.Vector3(values[0], values[1], values[2]);
			nodeStartData.position = positionVector1;

			keyframeTrack = new THREE.VectorKeyframeTrack(name, times, values);

		} else if (track.data.type === "SCALE") {
			name += ".scale";
			originalValue = node.scale.clone();

			for (ki = 0; ki < track.keys.length; ki++){
				key = track.keys[ki];
				times.push(key.time);
				if (key.values.length === 1) {
					values.push(key.values[0]);
					values.push(key.values[0]);
					values.push(key.values[0]);
				} else if (key.values.length === 3) {
					for (vi = 0; vi < 3; vi++) {
						values.push(key.values[vi]);
					}
				}
			}

			if (times.length * 3 !== values.length) {
				return;
			}

			nodeEndData = animationClip.userData.nodesEndData.get(node);
			if (!nodeEndData) {
				nodeEndData = {};
				animationClip.userData.nodesEndData.set(node, nodeEndData);
			}

			nodeStartData = animationClip.userData.nodesStartData.get(node);
			if (!nodeStartData) {
				nodeStartData = {};
				animationClip.userData.nodesStartData.set(node, nodeStartData);
			}

			var scaleVector = new THREE.Vector3(values[values.length - 3], values[values.length - 2], values[values.length - 1]);
			nodeEndData.scale = scaleVector;

			var scaleVector1 = new THREE.Vector3(values[0], values[1], values[2]);
			nodeStartData.scale = scaleVector1;

			keyframeTrack = new THREE.VectorKeyframeTrack(name, times, values);
		} else if (track.data.type === "ROTATE") {
			name += ".quaternion";
			originalValue = node.quaternion.clone();

			if (track.type === "euler") {
				for (ki = 0; ki < track.keys.length; ki++){
					key = track.keys[ki];
					times.push(key.time);
					m = this._getMatrixFromEulerRotationAngles(key.values[0], key.values[1], key.values[2], key.values[3]);
					quaternion = new THREE.Quaternion();
					quaternion.setFromRotationMatrix(m);
					values.push(quaternion.x);
					values.push(quaternion.y);
					values.push(quaternion.z);
					values.push(quaternion.w);
				}
			} else if (track.type === "angleAxis") {
				var firstKey = track.keys[0];
				times.push(firstKey.time);
				var time = firstKey.time;
				var x = firstKey.values[0];
				var y = firstKey.values[1];
				var z = firstKey.values[2];
				var angle = firstKey.values[3];

				var axis = new THREE.Vector3(x, y, z);
				m = new THREE.Matrix4();
				m.makeRotationAxis(axis, angle);

				quaternion = new THREE.Quaternion();
				quaternion.setFromRotationMatrix(m);
				values.push(quaternion.x);
				values.push(quaternion.y);
				values.push(quaternion.z);
				values.push(quaternion.w);

				for (ki = 1; ki < track.keys.length; ki++){
					key = track.keys[ki];
					var previousTime = time;
					time = key.time;
					x = key.values[0];
					y = key.values[1];
					z = key.values[2];
					angle = key.values[3];

					var miniStep = 3.1416 / 12;
					var stepN = angle / miniStep;
					if (stepN < 4) {
						stepN = 4;
					}
					var stepInterval = angle / stepN;
					var timeInterval = (time - previousTime) / stepN;
					for (var si = 1; si <= stepN; si++) {
						var wInterpolant = si * stepInterval;
						var tInterpolant = previousTime + timeInterval * si;

						times.push(tInterpolant);

						axis = new THREE.Vector3(x, y, z);
						m0 = new THREE.Matrix4();
						m0.makeRotationAxis(axis, wInterpolant);
						m0.multiply(m);

						quaternion = new THREE.Quaternion();
						quaternion.setFromRotationMatrix(m0);
						values.push(quaternion.x);
						values.push(quaternion.y);
						values.push(quaternion.z);
						values.push(quaternion.w);
					}
					m = m0;
				}
			} else {
				for (ki = 0; ki < track.keys.length; ki++){
					key = track.keys[ki];
					times.push(key.time);

					if (key.values.length === 4) {
						for (vi = 0; vi < 4; vi++) {
							values.push(key.values[vi]);
						}
					}
				}
			}

			if (times.length * 4 !== values.length) {
				return;
			}

			nodeEndData = animationClip.userData.nodesEndData.get(node);
			if (!nodeEndData) {
				nodeEndData = {};
				animationClip.userData.nodesEndData.set(node, nodeEndData);
			}

			nodeStartData = animationClip.userData.nodesStartData.get(node);
			if (!nodeStartData) {
				nodeStartData = {};
				animationClip.userData.nodesStartData.set(node, nodeStartData);
			}

			var currentQuaternion = new THREE.Quaternion(values[values.length - 4], values[values.length - 3], values[values.length - 2], values[values.length - 1]);
			nodeEndData.quaternion  = currentQuaternion;

			var currentQuaternion1 = new THREE.Quaternion(values[0], values[1], values[2], values[3]);
			nodeStartData.quaternion  = currentQuaternion1;

			keyframeTrack = new THREE.QuaternionKeyframeTrack(name, times, values);
		} else if (track.data.type === "OPACITY" || track.data.type === "COLOR") {

			var nodesWithMaterial = [];
			if (node.material && node.material.color) {
				nodesWithMaterial.push(node);
			}
			this._getChildNodesWithMaterial(node, nodesWithMaterial);
			for (var ni = 0; ni < nodesWithMaterial.length; ni++) {
				var n = nodesWithMaterial[ni];
				if (n.material && n.material.opacity){
					if (!n.userData) {
						n.userData = {};
					}
					n.userData.originalMaterial = n.material;
					n.material = n.material.clone();
					if (track.data.type === "OPACITY") {
						name = n.uuid + ".material.opacity";
						originalValue = n.material.opacity;
						n.material.transparent = true;
					} else {
						name = n.uuid + ".material.color";
						originalValue = n.userData.originalMaterial.color;
					}
				} else {
					continue;
				}

				for (ki = 0; ki < track.keys.length; ki++){
					key = track.keys[ki];
					times.push(key.time);
					if (track.data.type === "OPACITY") {
						values.push(key.values[0]);
					} else {
						values.push(key.values[0]);
						values.push(key.values[1]);
						values.push(key.values[2]);
					}
				}

				var nodeEndData1 = animationClip.userData.nodesEndData.get(n);
				if (!nodeEndData1) {
					nodeEndData1 = {};
				}

				var nodeStartData1 = animationClip.userData.nodesStartData.get(n);
				if (!nodeStartData1) {
					nodeStartData1 = {};
				}

				if (track.data.type === "OPACITY") {
					if (track.data.highlight) {
						nodeEndData1.opacity = n.material.opacity;
					} else {
						nodeEndData1.opacity = values[values.length - 1];
					}
				} else if (track.data.type === "COLOR") {
					if (track.data.highlight) {
						nodeEndData1.color = n.userData.originalMaterial.color.clone();
					} else {
						nodeEndData1.color = new THREE.Color(values[values.length - 3],
															values[values.length - 2],
																values[values.length - 1]);
					}
				}
				animationClip.userData.nodesEndData.set(n, nodeEndData1);

				if (track.data.type === "OPACITY") {
					if (track.data.highlight) {
						nodeStartData1.opacity = n.material.opacity;
					} else {
						nodeStartData1.opacity = values[0];
					}
				} else if (track.data.type === "COLOR") {
					if (track.data.highlight) {
						nodeStartData1.color = n.userData.originalMaterial.color.clone();
					} else {
						nodeStartData1.color = new THREE.Color(values[0], values[1], values[2]);
					}
				}

				animationClip.userData.nodesStartData.set(n, nodeStartData1);

				if (track.data.type === "OPACITY") {
					keyframeTrack = new THREE.NumberKeyframeTrack(name, times, values);
				} else {
					keyframeTrack = new THREE.ColorKeyframeTrack(name, times, values);
				}

				keyframeTrack.userData = {};
				keyframeTrack.userData.originalValue = originalValue;
				keyframeTrack.userData.info = track;
				keyframeTrack.userData.type = track.data.type;
				keyframeTrack.userData.targetNode = n;

				if (track.interpolationType === 1) {
					keyframeTrack.setInterpolation(THREE.InterpolateSmooth);
				} else {
					keyframeTrack.setInterpolation(THREE.InterpolateLinear);
				}

				animationClip.tracks.push(keyframeTrack);
			}
			return;
		} else {
			return;
		}
		keyframeTrack.userData = {};
		keyframeTrack.userData.originalValue = originalValue;
		keyframeTrack.userData.info = track;
		keyframeTrack.userData.type = track.data.type;
		keyframeTrack.userData.targetNode = node;

		if (track.interpolationType === 1) {
			keyframeTrack.setInterpolation(THREE.InterpolateSmooth);
		} else {
			keyframeTrack.setInterpolation(THREE.InterpolateLinear);
		}

		animationClip.tracks.push(keyframeTrack);
	};


	AnimationHelper.prototype.insertTracks = function(tracks, trackIdSequenceNodeMap, nodes, sequences) {
		var sequenceIdNodeTrackMap = new Map();

		var track, node, trackArray;
		var ti, di;
		for (ti = 0; ti < tracks.length; ti++) {
			track = tracks[ti];
			var trackData = trackIdSequenceNodeMap.get(track.id);
			if (!trackData || !trackData.length) {
				continue;
			}
			for (di = 0; di < trackData.length; di++) {
				node = nodes.get(trackData[di].targetId);
				if (!node) {
					continue;
				}
				var NodeTrackMap = sequenceIdNodeTrackMap.get(trackData[di].sequenceId);
				if (!NodeTrackMap) {
					NodeTrackMap = new Map();
				}

				trackArray = NodeTrackMap.get(node);
				if (!trackArray) {
					trackArray = [];
				}
				track.data = trackData[di];
				trackArray.push(track);
				NodeTrackMap.set(node, trackArray);
				sequenceIdNodeTrackMap.set(trackData[di].sequenceId, NodeTrackMap);
			}
			trackIdSequenceNodeMap.delete(track.id);
		}

		var entries = sequenceIdNodeTrackMap.entries();
		var next = entries.next();
		while (!next.done) {
			var sequenceId = next.value[0];
			var nodeTrackMap = next.value[1];
			next = entries.next();

			var animationClip = sequences.get(sequenceId);
			if (!animationClip) {
				continue;
			}

			var nodeEntries = nodeTrackMap.entries();
			var nextNode = nodeEntries.next();
			while (!nextNode.done) {
				node = nextNode.value[0];
				trackArray = nextNode.value[1];
				nextNode = nodeEntries.next();

				var pivot = null;

				for (ti = 0; ti < trackArray.length; ti++) {
					track = trackArray[ti];
					if (track.data.pivot) {
						pivot = track.data.pivot;
						break;
					}
				}

				if (!pivot) {
					for (ti = 0; ti < trackArray.length; ti++) {
						track = trackArray[ti];
						this.insertSingleTrack(animationClip, track, node);
					}
				} else {
					var positionTrack;
					var scaleTrack;
					var rotationTrack;

					for (ti = 0; ti < trackArray.length; ti++) {
						track = trackArray[ti];
						if (track.data.type === "TRANSLATE") {
							positionTrack = track;
						} else if (track.data.type === "ROTATE") {
							rotationTrack = track;
						} else if (track.data.type === "SCALE") {
							scaleTrack = track;
						} else {
							this.insertSingleTrack(animationClip, track, node);
						}
					}
					this.insertTracksWithPivot(animationClip, positionTrack, scaleTrack, rotationTrack, pivot, node);
				}
			}
		}
		return this;
	};

	// The node initial positions in a view should not be affected by the animations of the subsequent views
	// This function is to reset the node initial positions which may be changed by those animations
	AnimationHelper.prototype.setInitialNodePositionsFromSubsequentViews = function(viewGroup, viewGroupId, views, sequences, onlyCheckHighlight) {

		var viewsInViewGroup = [];
		if (viewGroup.views) {
			viewsInViewGroup = viewGroup.views;   // totara
		} else if (viewGroup.modelViews) {
			viewsInViewGroup = viewGroup.modelViews; // matai
		}

		if (!viewGroup || !viewsInViewGroup.length) {
			return;
		}

		var animationClip, nodeData, nextEntry;

		var currentNodeData = new Map();

		for (var vi = viewsInViewGroup.length - 1; vi > 0; vi--) {
			var subsequentView;
			if (viewsInViewGroup[vi].id) {
				subsequentView = views.get(viewsInViewGroup[vi].id);  // totara
			} else {
				subsequentView = viewsInViewGroup[vi]; // matai
			}

			var subsequentPlaybacks;
			if (subsequentView) {
				subsequentPlaybacks = subsequentView.playbacks; // matai
				if (!subsequentPlaybacks && subsequentView.getPlaybacks) {
					subsequentPlaybacks = subsequentView.getPlaybacks(); // totara
				}
			}

			if (!subsequentPlaybacks) {
				continue;
			}

			var currentView;
			if (viewsInViewGroup[vi - 1].id) {
				currentView = views.get(viewsInViewGroup[vi - 1].id);
			} else {
				currentView = viewsInViewGroup[vi - 1];
			}

			if (!currentView) {
				continue;
			}

			for (var pi = subsequentPlaybacks.length - 1; pi >= 0; pi--) {
				var subsequentPlayback = subsequentPlaybacks[pi];

				if (subsequentPlayback) {
					if (subsequentPlayback.isContinuity) {
						continue;
					}
					animationClip = sequences.get(subsequentPlayback.sequenceId);
					if (animationClip) {

						if (onlyCheckHighlight && !(animationClip.userData && animationClip.userData.hasHighlight)) {
							continue;
						}
						if (!subsequentPlayback.playbackReversed) {
							nodeData = animationClip.userData.nodesStartData.entries();
						} else {
							nodeData = animationClip.userData.nodesEndData.entries();
						}
						nextEntry = nodeData.next();
						while (!nextEntry.done) {
							currentNodeData.set(nextEntry.value[0], nextEntry.value[1]);
							nextEntry = nodeData.next();
						}
					}
				}
			}

			if (!currentView.userData) {
				currentView.userData = {};
			}

			if (!currentView.userData.nodeStartDataByAnimation) {
				currentView.userData.nodeStartDataByAnimation = new Map();
			}

			nodeData = currentNodeData.entries();
			nextEntry = nodeData.next();
			while (!nextEntry.done) {
				currentView.userData.nodeStartDataByAnimation.set(nextEntry.value[0], nextEntry.value[1]);
				nextEntry = nodeData.next();
			}
		}
	};

	// The node initial positions in a view should be the positions that are changed by the animations of the previous views
	// This function is to reset the node initial positions to those changed positions
	AnimationHelper.prototype.setInitialNodePositionsFromPreviousViews = function(viewGroup, viewGroupId, views, sequences, onlyCheckHighlight) {

		var viewsInViewGroup = [];
		if (viewGroup.views) {
			viewsInViewGroup = viewGroup.views;   // totara
		} else if (viewGroup.modelViews) {
			viewsInViewGroup = viewGroup.modelViews; // matai
		}

		if (!viewGroup || !viewsInViewGroup.length) {
			return;
		}

		var animationClip, nodeData, nextEntry;

		var currentNodeData = new Map();

		for (var vi = 0; vi < viewsInViewGroup.length - 1; vi++) {
			var previousView;
			if (viewsInViewGroup[vi].id) {
				previousView = views.get(viewsInViewGroup[vi].id);  // totara
			} else {
				previousView = viewsInViewGroup[vi]; // matai
			}

			var previousPlaybacks;
			if (previousView) {
				previousPlaybacks = previousView.playbacks; // matai
				if (!previousPlaybacks && previousView.getPlaybacks) {
					previousPlaybacks = previousView.getPlaybacks(); // totara
				}
			}

			if (!previousPlaybacks) {
				continue;
			}

			var currentView;
			if (viewsInViewGroup[vi + 1].id) {
				currentView = views.get(viewsInViewGroup[vi + 1].id);
			} else {
				currentView = viewsInViewGroup[vi + 1];
			}

			if (!currentView) {
				continue;
			}

			for (var pi = 0; pi < previousPlaybacks.length; pi++) {
				var previousPlayback = previousPlaybacks[pi];

				if (previousPlayback) {
					if (previousPlayback.isContinuity) {
						continue;
					}
					animationClip = sequences.get(previousPlayback.sequenceId);
					if (animationClip) {

						if (onlyCheckHighlight && !(animationClip.userData && animationClip.userData.hasHighlight)) {
							continue;
						}

						if (!previousPlayback.playbackReversed) {
							nodeData = animationClip.userData.nodesEndData.entries();
						} else {
							nodeData = animationClip.userData.nodesStartData.entries();
						}
						nextEntry = nodeData.next();
						while (!nextEntry.done) {
							currentNodeData.set(nextEntry.value[0], nextEntry.value[1]);
							nextEntry = nodeData.next();
						}
					}
				}
			}

			if (!currentView.userData) {
				currentView.userData = {};
			}

			if (!currentView.userData.nodeStartDataByAnimation) {
				currentView.userData.nodeStartDataByAnimation = new Map();
			}

			nodeData = currentNodeData.entries();
			nextEntry = nodeData.next();
			while (!nextEntry.done) {
				currentView.userData.nodeStartDataByAnimation.set(nextEntry.value[0], nextEntry.value[1]);
				nextEntry = nodeData.next();
			}
		}
	};

	// if a view contains multiple playbacks, the initial state of a node at the start of
	// view activation should be the state of the node at start of the first
	// playback which changes the node properties
	AnimationHelper.prototype.setInitialNodePositionsFromCurrenetView = function(viewGroup, viewGroupId, views, sequences, onlyCheckHighlight) {

		var viewsInViewGroup = [];
		if (viewGroup.views) {
			viewsInViewGroup = viewGroup.views;
		} else if (viewGroup.modelViews) {
			viewsInViewGroup = viewGroup.modelViews;
		}

		if (!viewGroup || !viewsInViewGroup.length) {
			return;
		}

		var nodeData, nextEntry;

		for (var vi = 0; vi < viewsInViewGroup.length; vi++) {
			var currentView;
			if (viewsInViewGroup[vi].id) {
				currentView = views.get(viewsInViewGroup[vi].id);
			} else {
				currentView = viewsInViewGroup[vi];
			}

			if (!currentView) {
				continue;
			}

			var currentPlaybackIndex = 0;
			var currentPlaybacks = null;
			if (currentView) {
				currentPlaybacks = currentView.playbacks;
				if (!currentPlaybacks && currentView.getPlaybacks) {
					currentPlaybacks = currentView.getPlaybacks();
				}

				if (currentPlaybacks && currentPlaybacks.length) {
					if (currentPlaybacks[0].isContinuity) {
						currentPlaybackIndex = 1;
					}
				}
			}

			if (!currentPlaybacks || !currentPlaybacks.length) {
				continue;
			}

			if (!currentView.userData) {
				currentView.userData = {};
			}

			if (!currentView.userData.nodeStartDataByAnimation) {
				currentView.userData.nodeStartDataByAnimation = new Map();
			}

			for (var cpi = currentPlaybacks.length - 1; cpi >= currentPlaybackIndex; cpi--) {
				var pb = currentPlaybacks[cpi];

				var clip = sequences.get(pb.sequenceId);
				if (clip) {

					if (onlyCheckHighlight && !(clip.userData && clip.userData.hasHighlight)) {
						continue;
					}

					if (pb.playbackReversed) {
						nodeData = clip.userData.nodesEndData.entries();
					} else {
						nodeData = clip.userData.nodesStartData.entries();
					}
					nextEntry = nodeData.next();
					while (!nextEntry.done) {
						currentView.userData.nodeStartDataByAnimation.set(nextEntry.value[0], nextEntry.value[1]);
						nextEntry = nodeData.next();
					}
				}
			}
		}
	};

	return AnimationHelper;
});
