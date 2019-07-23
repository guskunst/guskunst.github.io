/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Billboard class.
sap.ui.define([
	"jquery.sap.global", "../library", "./thirdparty/three", "sap/ui/base/ManagedObject", "../ve/thirdparty/html2canvas"
], function(jQuery, library, threeJs, BaseObject, html2canvas) {
	"use strict";

	/**
	 * Constructor for a new Billboard.
	 *
	 * @class
	 *
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.66.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.threejs.Billboard
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Billboard = BaseObject.extend("sap.ui.vk.threejs.Billboard", /** @lends sap.ui.vk.threejs.Billboard.prototype */ {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: ""
				},
				font: {
					type: "string",
					defaultValue: ""
				},
				fontSize: {
					type: "float",
					defaultValue: 20
				},
				fontWeight: {
					type: "string",
					defaultValue: "normal"
				},
				fontItalic: {
					type: "boolean",
					defaultValue: false
				},
				textColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#fff"
				},
				borderColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#fff"
				},
				borderOpacity: {
					type: "float",
					defaultValue: 1
				},
				backgroundColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#fff"
				},
				backgroundOpacity: {
					type: "float",
					defaultValue: 0.5
				},
				encoding: {
					type: "sap.ui.vk.BillboardTextEncoding",
					defaultValue: sap.ui.vk.BillboardTextEncoding.PlainText
				},
				width: {
					type: "float",
					defaultValue: 100
				},
				height: {
					type: "float",
					defaultValue: 100
				},
				style: {
					type: "sap.ui.vk.BillboardStyle",
					defaultValue: sap.ui.vk.BillboardStyle.None
				},
				borderLineStyle: {
					type: "sap.ui.vk.BillboardBorderLineStyle",
					defaultValue: sap.ui.vk.BillboardBorderLineStyle.Solid
				},
				borderWidth: {
					type: "float",
					defaultValue: 2
				},
				horizontalAlignment: {
					type: "sap.ui.vk.BillboardHorizontalAlignment",
					defaultValue: sap.ui.vk.BillboardHorizontalAlignment.Left
				},
				texture: {
					type: "any", // THREE.Texture
					defaultValue: null
				},
				material: {
					type: "any" // THREE.Material
				},
				link: {
					type: "string",
					defaultValue: ""
				},
				coordinateSpace: {
					type: "sap.ui.vk.BillboardCoordinateSpace",
					defaultValue: sap.ui.vk.BillboardCoordinateSpace.Viewport
				},
				position: {
					type: "any", // THREE.Vector3
					defaultValue: new THREE.Vector3(0, 0, 0)
				},
				renderOrder: {
					type: "int",
					defaultValue: 0
				}
			}
		},

		constructor: function(sId, mSettings, oScope) {
			BaseObject.apply(this, arguments);

			var geometry = new THREE.BufferGeometry();
			geometry.setIndex([ 0, 1, 2, 2, 1, 3 ]);
			geometry.addAttribute("position", new THREE.Float32BufferAttribute([ -0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0 ], 3));
			geometry.addAttribute("normal", new THREE.Float32BufferAttribute([ 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ], 3));
			geometry.addAttribute("uv", new THREE.Float32BufferAttribute([ 0, 0, 1, 0, 0, 1, 1, 1 ], 2));

			var material = new THREE.MeshBasicMaterial({
				map: this.getTexture(),
				depthTest: false,
				depthWrite: false,
				transparent: true,
				alphaTest: 0.05,
				premultipliedAlpha: true,
				side: THREE.DoubleSide
			});
			this.setProperty("material", material, true);
			this._billboard = new THREE.Mesh(geometry, material);
			this._billboard.renderOrder = this.getRenderOrder();

			this._updateTexture();

			this._node = new THREE.Group();
			this._node.add(this._billboard);
			this._node.matrixAutoUpdate = false;
			this._node.isBillboard = true;
			this._node.userData.billboard = this;
		}
	});

	Billboard.prototype.setEncoding = function(value) {
		this.setProperty("encoding", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setText = function(value) {
		this.setProperty("text", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setFont = function(value) {
		this.setProperty("font", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setFontSize = function(value) {
		this.setProperty("fontSize", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setFontWeight = function(value) {
		this.setProperty("fontWeight", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setFontItalic = function(value) {
		this.setProperty("fontItalic", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setStyle = function(value) {
		this.setProperty("style", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setWidth = function(value) {
		this.setProperty("width", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setHeight = function(value) {
		this.setProperty("height", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setTextColor = function(value) {
		this.setProperty("textColor", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setBackgroundColor = function(value) {
		this.setProperty("backgroundColor", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setBackgroundOpacity = function(value) {
		this.setProperty("backgroundOpacity", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setBorderWidth = function(value) {
		this.setProperty("borderWidth", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setBorderLineStyle = function(value) {
		this.setProperty("borderLineStyle", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setBorderColor = function(value) {
		this.setProperty("borderColor", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setBorderOpacity = function(value) {
		this.setProperty("borderOpacity", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setHorizontalAlignment = function(value) {
		this.setProperty("horizontalAlignment", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setLink = function(value) {
		this.setProperty("link", value, true);
		this._updateTexture();
		return this;
	};

	Billboard.prototype.setTexture = function(value) {
		this.setProperty("texture", value, true);
		if (this._billboard) {
			this._billboard.material.map = value;
		}
		return this;
	};

	Billboard.prototype.setMaterial = function(value) {
		this.setProperty("material", value, true);
		if (this._billboard) {
			this._billboard.material = value;
		}
		return this;
	};

	Billboard.prototype.setRenderOrder = function(value) {
		this.setProperty("renderOrder", value, true);
		if (this._billboard) {
			this._billboard.renderOrder = value;
		}
		return this;
	};

	Billboard.prototype._renderBackground = function(ctx, width, height, borderWidth) {
		// ctx.globalAlpha = 0.1;
		// ctx.fillStyle = "#0f0";
		// ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = this.getBackgroundColor();
		ctx.strokeStyle = this.getBorderColor();

		ctx.lineWidth = borderWidth;
		switch (this.getBorderLineStyle()) {
			default:
				ctx.setLineDash([]);
				break;
			case sap.ui.vk.BillboardBorderLineStyle.Dash:
				ctx.setLineDash([ borderWidth * 5, borderWidth ]);
				break;
			case sap.ui.vk.BillboardBorderLineStyle.Dot:
				ctx.setLineDash([ borderWidth * 2, borderWidth ]);
				break;
			case sap.ui.vk.BillboardBorderLineStyle.DashDot:
				ctx.setLineDash([ borderWidth * 5, borderWidth, borderWidth * 2, borderWidth ]);
				break;
			case sap.ui.vk.BillboardBorderLineStyle.DashDotDot:
				ctx.setLineDash([ borderWidth * 5, borderWidth, borderWidth * 2, borderWidth, borderWidth * 2, borderWidth ]);
				break;
		}

		var bw2 = borderWidth / 2;
		if (this.getStyle() === sap.ui.vk.BillboardStyle.RectangularShape) {
			ctx.globalAlpha = this.getBackgroundOpacity();
			if (ctx.globalAlpha > 0) {
				ctx.fillRect(0, 0, width, height);
			}

			ctx.globalAlpha = borderWidth > 0 ? this.getBorderOpacity() : 0;
			if (ctx.globalAlpha > 0) {
				ctx.strokeRect(bw2, bw2, width - borderWidth, height - borderWidth);
			}
		} else if (this.getStyle() === sap.ui.vk.BillboardStyle.CircularShape) {
			var xc = width / 2;
			var yc = height / 2;
			var radius = width / 2;
			ctx.beginPath();
			ctx.arc(xc, yc, radius - bw2, 0, 2 * Math.PI);
			ctx.closePath();

			ctx.globalAlpha = this.getBackgroundOpacity();
			if (ctx.globalAlpha > 0) {
				ctx.fill();
			}

			ctx.globalAlpha = borderWidth > 0 ? this.getBorderOpacity() : 0;
			if (ctx.globalAlpha > 0) {
				ctx.stroke();
			}
		}

		ctx.globalAlpha = 1;
		ctx.setLineDash([]);
	};

	Billboard.prototype._getFont = function(pixelRatio) {
		return (this.getFontItalic() ? "italic " : "") + this.getFontWeight() + " " + (this.getFontSize() * pixelRatio) + "px " + (this.getFont() || "Arial");
	};

	Billboard.prototype._renderPlainText = function(pixelRatio) {
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var fontSize = this.getFontSize() * pixelRatio;
		var font = this._getFont(pixelRatio);
		ctx.font = font;
		var lineSpacing = Math.ceil(fontSize);
		var borderWidth = this.getBorderLineStyle() !== sap.ui.vk.BillboardBorderLineStyle.None ? this.getBorderWidth() * pixelRatio : 0;
		var margin = Math.ceil(fontSize * 0.2 + borderWidth);
		var textLines = this.getText().split("\n");
		var textWidth = 0;
		textLines.forEach(function(text) {
			textWidth = Math.max(textWidth, ctx.measureText(text).width);
		});
		var link = this.getLink();
		if (link.length > 0) {
			textWidth = Math.max(textWidth, ctx.measureText(link).width);
		}
		textWidth = Math.ceil(textWidth * 0.5) * 2;
		var textLineCount = textLines.length + (link.length > 0 ? 1 : 0);
		var textHeight = Math.ceil(lineSpacing * textLineCount * 0.5) * 2;
		var width = textWidth + margin * 2;
		var height = textHeight + margin * 2;
		if (this.getStyle() === sap.ui.vk.BillboardStyle.CircularShape) {
			width = height = Math.max(width, height);
		}
		this._width = width / pixelRatio;
		this._height = height / pixelRatio;

		canvas.width = THREE.Math.ceilPowerOfTwo(width);
		canvas.height = THREE.Math.ceilPowerOfTwo(height);

		this._renderBackground(ctx, width, height, borderWidth);

		ctx.font = font;
		ctx.textAlign = this.getHorizontalAlignment();
		ctx.textBaseline = "middle";
		var a = [ "left", "center", "right" ].indexOf(ctx.textAlign);
		var x = (width + textWidth * (a - 1)) >> 1;
		var y = (height - (textLineCount - 1) * lineSpacing) >> 1;

		// draw shadow
		// ctx.fillStyle = "#000";
		// ctx.globalAlpha = 0.5;
		// ctx.filter = "blur(1px)";
		// for (var i in textLines) {
		// 	ctx.fillText(textLines[ i ], x + 1, y + lineSpacing * i + 1);
		// }

		// draw text
		ctx.fillStyle = this.getTextColor();
		ctx.filter = "blur(0px)";
		for (var i in textLines) {
			ctx.fillText(textLines[ i ], x, y + lineSpacing * i);
		}

		if (link.length > 0) {
			ctx.fillStyle = "#00f";
			ctx.textAlign = "right";
			ctx.textBaseline = "bottom";
			ctx.fillText(link, width - margin, height - margin);
		}

		this._setBillboardTexture(canvas, width, height);
	};

	Billboard.prototype._renderHtmlText = function(pixelRatio) {
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var borderWidth = this.getBorderLineStyle() !== sap.ui.vk.BillboardBorderLineStyle.None ? this.getBorderWidth() * pixelRatio : 0;
		var margin = Math.ceil(borderWidth);
		var width = Math.ceil(this.getWidth() * pixelRatio) + margin * 2;
		var height = Math.ceil(this.getHeight() * pixelRatio) + margin * 2;
		if (this.getStyle() === sap.ui.vk.BillboardStyle.CircularShape) {
			width = height = Math.max(width, height);
		}
		this._width = width / pixelRatio;
		this._height = height / pixelRatio;

		canvas.width = THREE.Math.ceilPowerOfTwo(width);
		canvas.height = THREE.Math.ceilPowerOfTwo(height);

		this._renderBackground(ctx, width, height, borderWidth);

		var link = this.getLink();
		if (link.length > 0) {
			ctx.font = this._getFont(pixelRatio);
			ctx.fillStyle = "#00f";
			ctx.textAlign = "right";
			ctx.textBaseline = "bottom";
			ctx.fillText(link, width - margin, height - margin);
		}

		var iframe = document.createElement("iframe");
		iframe.style.visibility = "hidden";
		iframe.width = (width - margin * 2) / pixelRatio;
		iframe.height = (height - margin * 2) / pixelRatio;
		document.body.appendChild(iframe);

		var doc = iframe.contentDocument || iframe.contentWindow.document;
		doc.open();
		doc.close();
		doc.body.innerHTML = this.getText();

		var htmlCanvas = document.createElement("canvas");
		htmlCanvas.width = iframe.width * pixelRatio;
		htmlCanvas.height = iframe.height * pixelRatio;
		htmlCanvas.style.width = iframe.width + "px";
		htmlCanvas.style.height = iframe.height + "px";
		var context = htmlCanvas.getContext("2d");
		context.scale(pixelRatio, pixelRatio);

		this._billboard.material.visible = false;
		html2canvas(doc.body, {
			canvas: htmlCanvas,
			backgroundColor: null
		}).then(function(htmlCanvas) {
			if (htmlCanvas.width > 0 && htmlCanvas.height > 0) {
				canvas.getContext("2d").drawImage(htmlCanvas, margin, margin);
			}

			setTimeout(this._setBillboardTexture.bind(this, canvas, width, height), 0);

			document.body.removeChild(iframe);
		}.bind(this));
	};

	Billboard.prototype._setBillboardTexture = function(canvas, width, height) {
		var u = width / canvas.width,
			v = height / canvas.height;
		this._billboard.geometry.addAttribute("uv", new THREE.Float32BufferAttribute([ 0, 1 - v, u, 1 - v, 0, 1, u, 1 ], 2));

		var texture = new THREE.CanvasTexture(canvas);
		texture.magFilter = THREE.NearestFilter;
		this._billboard.material.map = texture;
		this._billboard.material.needsUpdate = true;
		this._billboard.material.visible = true;
	};

	Billboard.prototype._updateTexture = function() {
		if (!this._billboard || !this.getText() || this.getTexture()) {
			this._width = this.getWidth();
			this._height = this.getHeight();
			return;
		}

		switch (this.getEncoding()) {
			default:
			case sap.ui.vk.BillboardTextEncoding.PlainText:
				this._renderPlainText(window.devicePixelRatio);
				break;
			case sap.ui.vk.BillboardTextEncoding.HtmlText:
				this._renderHtmlText(window.devicePixelRatio);
				break;
		}
	};

	var pos4 = new THREE.Vector4(),
		axisX = new THREE.Vector3(),
		axisY = new THREE.Vector3();

	Billboard.prototype._update = function(renderer, camera) {
		this._node.matrix.getInverse(this._node.parent.matrixWorld);
		this._node.matrix.decompose(this._node.position, this._node.rotation, this._node.scale);
		this._node.matrixWorld.identity();

		// set billboard rotation
		this._billboard.rotation.copy(camera.rotation);

		var viewportSize = renderer.getSize(),
			srcPosition = this.getPosition(),
			position = this._billboard.position,
			scale = 1;

		if (srcPosition) {
			position.copy(srcPosition);
		} else {
			position.setScalar(0);
		}

		var coordinateSpace = this.getCoordinateSpace();
		if (coordinateSpace === sap.ui.vk.BillboardCoordinateSpace.Screen) {// image note
			position.multiplyScalar(2 / camera.projectionMatrix.elements[ 5 ]);
			position.z = -1;

			scale = (camera.near + camera.far) * 0.5;
			position.multiplyScalar(scale).applyMatrix4(camera.matrixWorld);
		} else if (coordinateSpace === sap.ui.vk.BillboardCoordinateSpace.Viewport) {// text note
			if (viewportSize.width > viewportSize.height) {
				position.x *= viewportSize.height / viewportSize.width;
			} else {
				position.y *= viewportSize.width / viewportSize.height;
			}

			position.unproject(camera);

			// calculate billboard screen position
			pos4.copy(position).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
			var sx = (pos4.x / pos4.w) * 0.5 * viewportSize.width,
				sy = (pos4.y / pos4.w) * 0.5 * viewportSize.height;

			// set billboard scale
			scale = pos4.w * 2 / (viewportSize.width * camera.projectionMatrix.elements[ 0 ]);

			// add per pixel alignment to the billboard
			axisX.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(scale * (Math.round(sx) - sx));
			axisY.setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(scale * (Math.round(sy) - sy));
			position.add(axisX).add(axisY);
		}

		this._billboard.scale.set(this._width * scale, this._height * scale, 1);

		this._billboard.updateMatrixWorld();
	};

	return Billboard;
});
