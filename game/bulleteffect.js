"use strict";
Z.bulletEffect = (function(base) {
	var FLASH_BLUR = 3,
		LIGHT_COLOUR = "rgba(255, 255, 255, 0.3)",
		LIGHT_AMOUNT = 50;
	var _effect = Object.create(base);
	_effect.start = vec2();
	_effect.end = vec2();
	_effect.flashColour = "";
	_effect.flashSize = 0;
	_effect.flashFadeTime = 0;
	_effect.flashAlpha = 1;
	_effect.trailColour = "";
	_effect.trailWidth = 0;
	_effect.trailFadeTime = 0;
	_effect.spreadRays = 0;
	_effect.spreadAmount = 0;
	_effect.rays = [];
	_effect.create = function(start, end, data) {
		var e = base.create.call(
			this,
			start,
			data.name,
			Math.max(data.flashFadeTime, data.trailFadeTime || 0),
			data.soundEffect
		);
		e.start = start;
		e.end = end;
		e.flashColour = data.flashColour || e.flashColour;
		e.flashSize = data.flashSize || e.flashSize;
		e.flashFadeTime = data.flashFadeTime || e.flashFadeTime;
		if (data.trailColour && data.trailFadeTime && data.trailWidth) {
			var rays = [];
			e.trailColour = data.trailColour || e.trailColour;
			e.trailWidth = data.trailWidth || e.trailWidth;
			e.trailFadeTime = data.trailFadeTime || e.trailFadeTime;
			rays.push({ start: e.start, end: e.end, alpha: 1 });
			e.spreadRays = data.spreadRays || e.spreadRays;
			e.spreadAmount = data.spreadAmount || e.spreadAmount;
			for (var i = e.spreadRays; i--;) {
				rays.push({
					start: e.start,
					end: vec2(
						e.end.X + Math.floor(Math.random() * e.spreadAmount),
						e.end.Y + Math.floor(Math.random() * e.spreadAmount)
					),
					alpha: 1
				});
			}
			e.rays = rays;
		}
		return e;
	};
	_effect.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		this.flashAlpha = this.totalTime / this.flashFadeTime;
		var trailDelta = Math.clamp(this.totalTime / this.trailFadeTime);
		for (var i = this.rays.length; i--;) {
			this.rays[i].start = vec2(
				Math.lerp(this.rays[i].end.X, this.start.X, trailDelta),
				Math.lerp(this.rays[i].end.Y, this.start.Y, trailDelta)
			);
			this.rays[i].alpha = trailDelta;
		}
	};
	_effect.draw = function(context) {
		context.save();
		context.globalCompositeOperation = "lighter";
		
		// Draw flash
		context.save();
		context.translate(this.start.X, this.start.Y);
		context.globalAlpha = this.flashAlpha;
		context.fillStyle = this.flashColour;
		context.shadowColor = this.flashColour;
		context.shadowBlur = FLASH_BLUR;
		context.beginPath();
		context.arc(0, 0, this.flashSize / 2, 0, Math.PI * 2, false);
		context.closePath();
		context.fill();
		context.restore();
		
		// Draw trails
		for (var i = this.rays.length; i--;) {
			context.save();
			context.globalAlpha = this.rays[i].alpha;
			context.strokeStyle = this.trailColour;
			context.lineWidth = this.trailWidth;
			context.beginPath();
			context.moveTo(this.rays[i].start.X, this.rays[i].start.Y);
			context.lineTo(this.rays[i].end.X, this.rays[i].end.Y);
			context.stroke();
			context.closePath();
			context.restore();
		}
		context.restore();
		this.drawLightMap(Z.environment.lightMapContext);
	};
	_effect.drawLightMap = function(context) {
		if (!Z.settings.dayCycleEnabled) { return; }
		context.save();
		context.globalAlpha = this.flashAlpha * Z.environment.getLightLevel();
		context.globalCompositeOperation = "xor";
		context.translate(this.start.X, this.start.Y);
		var gradient = context.createRadialGradient(0, 0, 0, 0, 0, LIGHT_AMOUNT);
		gradient.addColorStop(0, LIGHT_COLOUR);
		gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(0, 0, LIGHT_AMOUNT, 0, Math.PI * 2, false);
		context.closePath();
		context.fill();
		context.restore();
	};
	return _effect;
}(Z.effect));