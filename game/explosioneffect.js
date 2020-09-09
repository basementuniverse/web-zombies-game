"use strict";
Z.explosionEffect = (function(base) {
	var AMOUNT = 3,
		SCATTER = 5,
		SIZE = 5,
		GLOW_BLUR = 4,
		LIGHT_COLOUR_START = "rgba(255, 255, 255, 0.7)",
		LIGHT_COLOUR_END = "rgba(255, 255, 255, 0)";
	var _effect = Object.create(base);
	_effect.amount = 0;
	_effect.size = "";
	_effect.colour = "";
	_effect.fadeTime = 0;
	_effect.particles = [];
	_effect.create = function(position, target, data) {
		var e = base.create.call(this, target, data.name, data.fadeTime, data.soundEffect);
		e.amount = data.amount || e.amount;
		e.size = data.size || e.size;
		e.colour = data.colour || e.colour;
		e.fadeTime = data.fadeTime || e.fadeTime;
		e.particles = [];
		var offset = null;
		for (var i = AMOUNT; i--;) {
			offset = vec2.norm(vec2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
			offset = vec2.mul(offset, SCATTER);
			e.particles.push({
				position: vec2.add(position, offset),
				size: e.size - Math.floor(Math.random() * SIZE),
				alpha: 1
			});
		}
		return e;
	};
	_effect.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		var delta = this.totalTime / this.fadeTime;
		for (var i = this.particles.length; i--;) {
			this.particles[i].size = Math.lerp(0, this.size, delta);
			this.particles[i].alpha = delta;
		}
	};
	_effect.draw = function(context) {
		for (var i = this.particles.length; i--;) {
			context.save();
			context.globalAlpha = this.particles[i].alpha;
			context.globalCompositeOperation = "lighter";
			context.translate(this.particles[i].position.X, this.particles[i].position.Y);
			var gradient = context.createRadialGradient(
				0, 0, 0, 0, 0,
				Math.floor(this.particles[i].size / 2)
			);
			gradient.addColorStop(0, this.colour);
			gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
			context.fillStyle = gradient;
			context.shadowColor = this.colour;
			context.shadowBlur = GLOW_BLUR;
			context.beginPath();
			context.arc(0, 0, this.particles[i].size / 2, 0, Math.PI * 2, false);
			context.closePath();
			context.fill();
			context.restore();
		}
		this.drawLightMap(Z.environment.lightMapContext);
	};
	_effect.drawLightMap = function(context) {
		if (!Z.settings.dayCycleEnabled) { return; }
		context.save();
		context.globalAlpha = this.particles[0].alpha * Z.environment.getLightLevel();
		context.globalCompositeOperation = "xor";
		context.translate(this.position.X, this.position.Y);
		var gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.size);
		gradient.addColorStop(0, LIGHT_COLOUR_START);
		gradient.addColorStop(1, LIGHT_COLOUR_END);
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(0, 0, this.size, 0, Math.PI * 2, false);
		context.closePath();
		context.fill();
		context.restore();
	};
	return _effect;
}(Z.effect));