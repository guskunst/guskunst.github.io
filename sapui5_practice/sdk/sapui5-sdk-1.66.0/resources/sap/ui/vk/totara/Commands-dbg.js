
sap.ui.define([
], function() {
	"use strict";

	var Commands = function() { };

	Commands.setStreamingToken = "setStreamingToken";
	Commands.setCamera = "setCamera";
	Commands.notifyFinishedTree = "notifyFinishedTree";
	Commands.notifyFinishedMaterial = "notifyFinishedMaterial";
	Commands.notifyFinishedImage = "notifyFinishedImage";
	Commands.notifyFinishedMesh = "notifyFinishedMesh";
	Commands.notifyFinishedGeometry = "notifyFinishedGeometry";
	Commands.setMesh = "setMesh";
	Commands.setAnnotation = "setAnnotation";
	Commands.setMaterial = "setMaterial";
	Commands.setGeometry = "setGeometry";
	Commands.setImage = "setImage";
	Commands.notifyError = "notifyError";
	//
	Commands.setTree = "setTree";
	Commands.setTreeNode = "setTreeNode";
	//
	Commands.requestScene = "requestScene";
	Commands.getTree = "getTree";
	Commands.getMesh = "getMesh";
	Commands.getAnnotation = "getAnnotation";
	Commands.getMaterial = "getMaterial";
	Commands.getGeometry = "getGeometry";
	Commands.getImage = "getImage";
	Commands.addClientLog = "addClientLog";
	Commands.timestamp = "timestamp";
	// view related
	Commands.getView = "getView";
	Commands.getDynamicView = "getDynamicView";
	Commands.setView = "setView";
	Commands.setViewNode = "setViewNode";
	Commands.notifyFinishedView = "notifyFinishedView";

	Commands.setPlayback = "setPlayback";
	Commands.getSequence = "getSequence";
	Commands.setSequence = "setSequence";
	Commands.getTrack = "getTrack";
	Commands.setTrack = "setTrack";

	Commands.setViewGroup = "setViewGroup";
	Commands.getViewGroups = "getViewGroups";

	Commands.getHighlightStyle = "getHighlightStyle";
	Commands.setHighlightStyle = "setHighlightStyle";

	return Commands;
});
