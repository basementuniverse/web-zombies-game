"use strict";
Z.dustEffect = (function(base) {
	var DUST_START_SIZE = 3,
		DUST_END_SIZE = 12;
	var _effect = Object.create(base);
	_effect.amount = 0;
	_effect.size = 0;
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
		for (var i = e.amount; i--;) {
			offset = vec2.norm(vec2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
			offset = vec2.mul(offset, e.size);
			e.particles.push({
				position: target,
				startPosition: target,
				endPosition: vec2.add(target, offset),
				size: DUST_START_SIZE,
				alpha: 1
			});
		}
		return e;
	};
	_effect.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		var delta = this.totalTime / this.fadeTime,
			speed = (this.totalTime / this.size) * elapsedTime;
		for (var i = this.particles.length; i--;) {
			this.particles[i].position = vec2(
				Math.lerp(this.particles[i].endPosition.X, this.particles[i].startPosition.X, delta),
				Math.lerp(this.particles[i].endPosition.Y, this.particles[i].startPosition.Y, delta)
			);
			this.particles[i].size = Math.lerp(DUST_END_SIZE, DUST_START_SIZE, delta);
			this.particles[i].alpha = delta;
		}
	};
	_effect.draw = function(context) {
		for (var i = this.particles.length; i--;) {
			context.save();
			context.globalAlpha = this.particles[i].alpha;
			context.fillStyle = this.colour;
			context.beginPath();
			context.arc(
				this.particles[i].position.X, this.particles[i].position.Y,
				this.particles[i].size / 2,
				0, Math.PI * 2, false
			);
			context.closePath();
			context.fill();
			context.restore();
		}
	};
	return _effect;
}(Z.effect));