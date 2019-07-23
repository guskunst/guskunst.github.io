sap.ui.define([
	"jquery.sap.global", "./TotaraUtils"
], function(jQuery, TotaraUtils) {
	"use strict";

	var AnimationHandler = function() {};

	AnimationHandler.setPlayback = function(state, command) {
		if (TotaraUtils.checkError(command)) {
			return command;
		}

		var result = {};

		var sceneId = state.viewIdSceneIdMap.get(command.viewId);

		if (!sceneId) {
			command.error = "Try to extract play backs for unmatching scene";
			return command;
		}

		var sequenceIdSet = new Set();
		for (var ai = 0; ai < command.playbacks.length; ai++){
			var playback = command.playbacks[ai];
			if (playback.id == null) {
				// This is the case when whole playback is sent inline, there are no playbacks, sequences or tracks ids
				// Usually happens with temporary playbacks. Setting initial positions of objects is typical use case
				// We'll create ids here so that scene builder code treats them like any other playback or sequence
				playback.id = command.viewId + "-playback";
				playback.sequence.id = command.viewId + "-cont";
				playback.sequenceId = playback.sequence.id;
				playback.isContinuity = true;
				AnimationHandler.setSequence(state, { sequences: [ playback.sequence ] });
			}
			state.sceneBuilder.insertPlayback(playback, command.viewId, sceneId);
			if (playback.sequenceId) {
				var existingSequence = state.sceneBuilder.getSequence(playback.sequenceId);
				if (existingSequence) {
					// Already received, don't ask for it again
					continue;
				} else {
					// Send it to the queue, to be requested
					sequenceIdSet.add(playback.sequenceId);
					state.sequenceIds.add(playback.sequenceId);
				}
			}
		}

		result.sequenceIdSet = sequenceIdSet;
		result.viewId = command.viewId;
		state.currentViewId = result.viewId;
		return result;
	};

	AnimationHandler.setSequence = function(state, command) {
		if (TotaraUtils.checkError(command)) {
			return command;
		}

		var result = {};
		var trackIdSet = new Set();
		for (var si = 0; si < command.sequences.length; si++){
			var sequence = command.sequences[si];
			var inlineTracks = [];
			if (sequence.nodes) {
				for (var nj = 0; nj < sequence.nodes.length; nj++){
					var seqNode = sequence.nodes[nj];
					if (seqNode.trackId == null) {
						// This is the case when track is provided inline, there is no track id as we don't need to fetch it
						// We will make up id so that scene builder code treats it as any other track
						// This happens with temporary tracks like those used to set continuity
						seqNode.trackId = sequence.id + seqNode.binding + seqNode.sid;
						seqNode.track.id = seqNode.trackId;
						inlineTracks.push(seqNode.track);
					}
				}
			}
			state.sceneBuilder.insertSequence(sequence);
			if (inlineTracks.length > 0) {
				this.setTrack(state, { tracks: inlineTracks });
			}
			if (sequence.nodes) {
				for (var ni = 0; ni < sequence.nodes.length; ni++){
					var node = sequence.nodes[ni];
					if (node.track == null) {
						trackIdSet.add(node.trackId);
						state.trackIds.add(node.trackId);
					}
				}
			}
			state.sequenceIds.delete(sequence.id);
		}

		result.trackIdSet = trackIdSet;
		return result;
	};

	AnimationHandler.setTrack = function(state, command) {
		if (TotaraUtils.checkError(command)) {
			return command;
		}

		var result = {};

		state.sceneBuilder.insertTracks(command.tracks);

        for (var ti = 0; ti < command.tracks.length; ti++) {
            var track = command.tracks[ti];
            state.trackIds.delete(track.id);
        }

		return result;
	};

	AnimationHandler.setHighlightStyle = function(state, command) {
		if (TotaraUtils.checkError(command)) {
			return command;
		}

		var result = {};

		state.sceneBuilder.insertHighlightStyle(command);
		state.highlightStyleIds.delete(command.id);

		result.id = command.id;

		return result;
	};

	return AnimationHandler;
});