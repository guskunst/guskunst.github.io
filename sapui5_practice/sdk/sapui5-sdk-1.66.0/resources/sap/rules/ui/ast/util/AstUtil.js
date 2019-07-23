sap.ui.define(function () {
	"use strict";

	function AstUtil() {};
	AstUtil.prototype.HashSet = function () {
		var set = {};
		this.add = function (key) {
			set[key] = true;
		};
		this.remove = function (key) {
			delete set[key];
		};
		this.clear = function () {
			set = {};
		};
		this.contains = function (key) {
			return set.hasOwnProperty(key);
		};
	};
	return AstUtil;
}, true);