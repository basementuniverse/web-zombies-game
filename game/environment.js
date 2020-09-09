"use strict";
Z.environment = (function() {
	var MINUTES_PER_DAY = 1440;
	
	var _lightMapCanvas = null;
	
	// Return a colour string like "rgba(0, 0, 0, 1)" from an array of rgba values
	var colour = function(values) {
		return "rgba(" + Math.floor(values[0]) + ", " +
			Math.floor(values[1]) + ", " +
			Math.floor(values[2]) + ", " +
			(Math.round(values[3] * 100) / 100) + ")";
	};
	
	// Return indexes and interpolation value for a from the specified time (spreads array elements
	// over a 24 hour period and returns the previous/next indexes and interpolation value)
	var timeIndex = function(time, a) {
		var minutes = time.getMinutes(),
			hours = time.getHours(),
			length = a.length,
			n = (minutes + hours * 60) / MINUTES_PER_DAY * length,
			start = Math.floor(n),
			end = (start < length - 1) ? start + 1 : 0;
		n -= start;
		return { start: start, end: end, n: n };
	};
	
	return {
		timeScale: 0,
		currentTime: new Date(),
		ambientLight: [],
		sunHeight: [],
		sunStartDirection: [],
		sunDirection: vec2(),
		sunCurrentHeight: 0,
		lightLevel: 0,
		lightMapContext: null,
		initialise: function(width, height, data) {
			this.timeScale = data.timeScale;
			if (data.startingTime) {
				var regex = /[0-9].:[0-9]./;
				if (regex.test(data.startingTime)) {
					this.currentTime = new Date();
					var t = data.startingTime.split(":");
					this.currentTime.setHours(t[0], t[1]);
				} else {
					this.currentTime = new Date(data.startingTime);
				}
			}
			this.ambientLight = data.ambientLight || [];
			if (this.ambientLight.length && this.timeScale) {
				_lightMapCanvas = document.createElement("canvas");
				_lightMapCanvas.width = width;
				_lightMapCanvas.height = height;
				this.lightMapContext = _lightMapCanvas.getContext("2d");
			} else {	// If no light stops defined or timescale is 0, disable day/night cycle
				Z.settings.dayCycleEnabled = false;
			}
			
			// Get sun settings
			this.sunHeight = data.sunHeight || [];
			this.sunStartDirection = vec2(data.sunStartDirection);
		},
		update: function(elapsedTime) {
			var time = this.currentTime.getTime() + (elapsedTime * 1000 * this.timeScale);
			this.currentTime.setTime(time);
			if (Z.settings.dayCycleEnabled) {
				// Update canvas size and clear it ready for drawing ambient light
				_lightMapCanvas.width = Z.camera.size.X;
				_lightMapCanvas.height = Z.camera.size.Y;
				var translate = vec2.sub(vec2.div(Z.camera.size, 2), Z.camera.position);
				this.lightMapContext.setTransform(1, 0, 0, 1, 0, 0);
				this.lightMapContext.translate(translate.X, translate.Y);
				this.lightMapContext.clearRect(
					Z.camera.bounds.X, Z.camera.bounds.Y,
					Z.camera.size.X, Z.camera.size.Y
				);
				
				// Get current ambient light colour and level
				var ambientIndex = timeIndex(this.currentTime, this.ambientLight),
					ambientValues = Math.lerp(
						this.ambientLight[ambientIndex.start],
						this.ambientLight[ambientIndex.end],
						ambientIndex.n
					),
					ambient = colour(ambientValues);
				this.lightLevel = 1 - ambientValues[3];
				if (ambientValues[3] > 0) {		// Draw ambient light colour onto the lightmap
					this.lightMapContext.save();
					this.lightMapContext.translate(Z.camera.bounds.X, Z.camera.bounds.Y);
					this.lightMapContext.fillStyle = ambient;
					this.lightMapContext.fillRect(0, 0, Z.camera.size.X, Z.camera.size.Y);
					this.lightMapContext.restore();
				}
				if (Z.settings.shadowsEnabled) {	// Get sun settings (for building/tree shadows)
					var sunIndex = timeIndex(this.currentTime, this.sunHeight),
						minutes = this.currentTime.getMinutes(),
						hours = this.currentTime.getHours(),
						n = (minutes + hours * 60) / MINUTES_PER_DAY;
					this.sunCurrentHeight = Math.lerp(
						this.sunHeight[sunIndex.start],
						this.sunHeight[sunIndex.end],
						sunIndex.n
					);
					this.sunDirection = vec2.rot(this.sunStartDirection, -Math.lerp(0, Math.PI, n));
				}
			} else {
				this.lightLevel = 1;
			}
		},
		draw: function(context) {
			if (Z.settings.dayCycleEnabled) {
				context.save();
				if (Z.player.nightVisionActivated) {
					context.globalAlpha = 1 - Z.nightVision.amount;
				}
				context.drawImage(_lightMapCanvas, Z.camera.bounds.X, Z.camera.bounds.Y);
				context.restore();
			}
			if (Z.player.nightVisionActivated) {
				Z.nightVision.drawOverlay(context);
			}
		},
		
		// When drawing lights onto the lightmap, multiply alpha by this to get correct light level
		getLightLevel: function() {
			return Math.clamp(1.1 - this.lightLevel, 0.2, 1);
		}
	};
}());