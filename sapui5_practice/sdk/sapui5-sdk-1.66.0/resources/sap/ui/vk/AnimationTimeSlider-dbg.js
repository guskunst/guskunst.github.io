/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.threejs.AnimationTimeSlider
sap.ui.define([
	"jquery.sap.global", "sap/m/Slider", "./AnimationTimeSliderRenderer"
], function(jQuery, Slider, AnimationTimeSliderRenderer) {
	"use strict";

	/**
	 * Constructor for a new slider for animation time.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Shows the progress of playing playbacks in a view. The slider may be dragged to a certain time point.
	 * @extends sap.m.Slider
	 *
	 * @author SAP SE
	 * @version 1.66.0
	 *
	 * @constructor
	 * @private
	 * @since 1.65.00
	 * @alias sap.ui.vk.AnimationTimeSlider
	 */
	var AnimationTimeSlider = Slider.extend("sap.ui.vk.AnimationTimeSlider", /** @lends sap.ui.vk.AnimationTimeSlider.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			associations: {
				viewport: {
					type: "sap.ui.vk.threejs.Viewport"
				}
			}
		}
	});


	AnimationTimeSlider.prototype.init = function() {
		if (Slider.prototype.init) {
			Slider.prototype.init.call(this);
		}

		this._playbackDurations = [];
		this._startTime = 0;
		this._currentPlaybackIndex = -1;
		this._totalDuration = 0;

		this._liveValueChange = false;
		this._liveValueChangeDone = false;

		this._currentLiveValue = -1;
		this._currentRestartPlaybackIndex = -1;

		this._previousValue = 0;
		this._currentValue = 0;

		this._pause = false;
		this._pauseDone = false;

		this.attachChange(function(event) {
			this._currentLiveValue = event.getParameter("value");
			this._liveValueChangeDone = true;
			this._liveValueChange = false;
			this._setCurrentRestartPlaybackIndex();
			if (this.getViewport()){
				var viewport = sap.ui.getCore().byId(this.getViewport());
				viewport.setShouldRenderFrame();
			}
		});

		this.attachLiveChange(function(event) {
			this._currentLiveValue = event.getParameter("value");
			this._liveValueChange = true;
			this._liveValueChangeDone = false;
			this._setCurrentRestartPlaybackIndex();
			if (this.getViewport()){
				var viewport = sap.ui.getCore().byId(this.getViewport());
				viewport.setShouldRenderFrame();
			}
		});
	};

	AnimationTimeSlider.prototype._setCurrentRestartPlaybackIndex = function() {
		var accumulatedTime = 0;
		var timeValue = this._totalDuration * this._currentLiveValue / 100;
		var pi;
		for (pi = 0; pi < this._playbackDurations.length; pi++){
			accumulatedTime += this._playbackDurations[pi];
			if (timeValue < accumulatedTime) {
				this._currentRestartPlaybackIndex = pi;
				break;
			}
		}
	};

	/**
	 * Set durations of playbacks defined in a view, this function is used to link the slider to animation defined
	 * in a view, and should be called before other functions
	 *
	 * @param {float[]} timeIntervals array of durations of playbacks defined in a view
	 * @returns {void}
	 * @private
	 */
	AnimationTimeSlider.prototype.setPlaybackTimeIntervals = function(timeIntervals) {

		if (!timeIntervals || !timeIntervals.length) {
			return;
		}

		this._playbackDurations = [];
		this._totalDuration = 0;

		for (var ti = 0; ti < timeIntervals.length; ti++) {
			var time = timeIntervals[ti];
			this._playbackDurations.push(time);
			this._totalDuration += time;
		}

		this._liveValueChange = false;
		this._liveValueChangeDone = false;

		this._currentLiveValue = -1;
		this._currentRestartPlaybackIndex = -1;

		this._previousValue = 0;
		this._currentValue = 0;

		this._pause = false;
		this._pauseDone = false;

		this.setValue(0);
		this.setStep(0.1);
	};

	/**
	 * Reset parameters when starting a new playback, this function should be called when a playback is initiated
	 *
	 * @param {int} playbackIndex the index of starting playback
	 * @returns {void}
	 * @private
	 */
	AnimationTimeSlider.prototype.startPlayback = function(playbackIndex) {

		this._startTime = Date.now();
		this._currentPlaybackIndex = playbackIndex;

		var previousPlaybackDuration = 0;
		for (var pi = 0; pi < this._currentPlaybackIndex; pi++){
			previousPlaybackDuration += this._playbackDurations[pi];
		}
		this._previousValue = 100 * previousPlaybackDuration / this._totalDuration;

		this.setProgress(true);
	};

	/**
	 * Called with animated properties need to be updated, usually in rendering loop.
	 * The returned object contains two values: time difference between current and previous update,
	 * and the index of new playback when the current time is not within the time interval of current playback
	 *
	 *
	 * @returns {object} result contains two components: delta - time difference, restartPlaybackIndex - index of new playback,  -1 if continue with current playback
	 *
	 * @private
	 */
	AnimationTimeSlider.prototype.getCurrentStatus = function() {
		var result = {};

		var currentTime = Date.now();
		var pi, previousPlaybackDuration;
		var currentValue;
		var maxCurrentValue = 100;

		if (!this._liveValueChange && !this._liveValueChangeDone && !this._pause && !this._pauseDone) {

			previousPlaybackDuration = 0;
			for (pi = 0; pi < this._currentPlaybackIndex; pi++){
				previousPlaybackDuration += this._playbackDurations[pi];
			}
			currentValue = 100 * (previousPlaybackDuration + (currentTime - this._startTime) / 1000) / this._totalDuration;
			maxCurrentValue = 100 * (previousPlaybackDuration + this._playbackDurations[this._currentPlaybackIndex]) / this._totalDuration;
			if (maxCurrentValue < currentValue) {
				this.setValue(maxCurrentValue);
			} else {
				this.setValue(currentValue);
			}
		} else if (this._liveValueChange || this._liveValueChangeDone) {

			if (this._currentRestartPlaybackIndex !== this._currentPlaybackIndex || this._currentLiveValue < this._previousValue) {
				result.delta = 0;
				result.restartPlaybackIndex = this._currentRestartPlaybackIndex;
				return result;
			}

			currentValue = this._currentLiveValue;

			if (this._liveValueChangeDone) {
				this._liveValueChangeDone = false;

				previousPlaybackDuration = 0;
				for (pi = 0; pi < this._currentPlaybackIndex; pi++){
					previousPlaybackDuration += this._playbackDurations[pi];
				}

				this._startTime =  currentTime - (currentValue * this._totalDuration / 100 - previousPlaybackDuration) * 1000;
			}
		} else {  // pause or pauseDone
			currentValue = this._previousValue;
			if (this._pauseDone) {
				this._pauseDone = false;

				previousPlaybackDuration = 0;
				for (pi = 0; pi < this._currentPlaybackIndex; pi++){
					previousPlaybackDuration += this._playbackDurations[pi];
				}

				this._startTime =  currentTime - (currentValue * this._totalDuration / 100 - previousPlaybackDuration) * 1000;
			}
		}

		if (currentValue > maxCurrentValue && maxCurrentValue) {
			result.delta = this._playbackDurations[this._currentPlaybackIndex] * 2;
			currentValue = maxCurrentValue;
		} else {
			result.delta = this._totalDuration * (currentValue - this._previousValue) / 100;
		}
		result.restartPlaybackIndex = -1;
		this._previousValue = currentValue;

		return result;
	};

	/**
	 * Pause animation
	 *
	 * @returns {void}
	 * @private
	 */
	AnimationTimeSlider.prototype.pause = function() {
		this._pause = true;
	};

	/**
	 * Resume animation playing
	 *
	 * @returns {void}
	 * @private
	 */
	AnimationTimeSlider.prototype.resume = function() {
		this._pause = false;
		this._pauseDone = true;
		if (this.getViewport()){
			var viewport = sap.ui.getCore().byId(this.getViewport());
			viewport.setShouldRenderFrame();
		}
	};

	/**
	 * Toggle pause status of animation
	 *
	 * @returns {void}
	 * @private
	 */
	AnimationTimeSlider.prototype.togglePauseStatus = function() {
		if (this._pause) {
			this._pause = false;
			this._pauseDone = true;
			if (this.getViewport()){
				var viewport = sap.ui.getCore().byId(this.getViewport());
				viewport.setShouldRenderFrame();
			}
		} else {
			this._pause = true;
		}
	};

	return AnimationTimeSlider;

}, /* bExport= */ true);
