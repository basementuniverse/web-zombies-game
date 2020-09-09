"use strict";
Z.fireEffect = (function(base) {
	var START_SIZE = 10,
		END_SIZE = 25,
		IMAGE_START_SIZE = 0.5,
		IMAGE_END_SIZE = 2,
		IMAGE_ROTATE_AMOUNT = 0.1,
		SPEED = 0.5,
		UP = vec2(0, -1),
		AMOUNT = 3,
		LIGHT_COLOUR = "rgba(255, 255, 255, 0.5)",
		LIGHT_AMOUNT = 5;
	var _effect = Object.create(base);
	_effect.spread = 0;
	_effect.colour = "";
	_effect.image = "";
	_effect.useImage = false;
	_effect.light = false;
	_effect.fadeTime = 0;
	_effect.particles = [];
	_effect.create = function(position, target, data) {
		var e = base.create.call(this, target, data.name, data.fadeTime, data.soundEffect);
		e.spread = data.spread || e.spread;
		
		// Fire effect can either use a colour-filled circle or an image
		e.useImage = false;
		if (data.colour) {
			e.colour = data.colour;
		} else if (data.image) {
			e.image = Z.content.items[data.image];
			e.useImage = true;
		}
		e.light = !!data.light;
		e.fadeTime = data.fadeTime || e.fadeTime;
		e.particles = [];
		var velocity = null,
			offset = null;
		for (var i = AMOUNT; i--;) {
			velocity = vec2.norm(vec2((Math.random() - 0.5) * 2, -Math.random()));
			velocity = vec2.mul(velocity, SPEED);
			offset = vec2.norm(vec2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
			offset = vec2.mul(offset, e.spread);
			e.particles.push({
				position: vec2.add(target, offset),
				velocity: velocity,
				size: e.useImage ? IMAGE_START_SIZE : START_SIZE,
				alpha: 1
			});
		}
		return e;
	};
	_effect.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		var delta = this.totalTime / this.fadeTime,
			startSize = this.useImage ? IMAGE_START_SIZE : START_SIZE,
			endSize = this.useImage ? IMAGE_END_SIZE : END_SIZE;
		for (var i = this.particles.length; i--;) {
			this.particles[i].velocity = vec2.add(this.particles[i].velocity, vec2.mul(UP, elapsedTime));
			this.particles[i].position = vec2.add(this.particles[i].position, this.particles[i].velocity);
			this.particles[i].size = Math.lerp(endSize, startSize, delta);
			this.particles[i].alpha = delta;
		}
	};
	_effect.draw = function(context) {
		for (var i = this.particles.length; i--;) {
			context.save();
			context.globalAlpha = this.particles[i].alpha;
			if (this.useImage) {	// Draw flame image
				context.translate(this.particles[i].position.X, this.particles[i].position.Y);
				context.scale(this.particles[i].size, this.particles[i].size);
				context.rotate(this.particles[i].alpha * Math.PI * 2 * IMAGE_ROTATE_AMOUNT);
				context.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
			} else {				// Draw coloured circle
				context.fillStyle = this.colour;
				context.beginPath();
				context.arc(
					this.particles[i].position.X,
					this.particles[i].position.Y,
					this.particles[i].size / 2, 0, Math.PI * 2, false
				);
				context.closePath();
				context.fill();
			}
			context.restore();
		}
		if (this.light) {
			this.drawLightMap(Z.environment.lightMapContext);
		}
	};
	_effect.drawLightMap = function(context) {
		if (!Z.settings.dayCycleEnabled) { return; }
		context.save();
		context.globalAlpha = this.particles[0].alpha * Z.environment.getLightLevel();
		context.globalCompositeOperation = "xor";
		context.translate(this.position.X, this.position.Y);
		var gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.spread * LIGHT_AMOUNT);
		gradient.addColorStop(0, LIGHT_COLOUR);
		gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(0, 0, this.spread * LIGHT_AMOUNT, 0, Math.PI * 2, false);
		context.closePath();
		context.fill();
		context.restore();
	};
	return _effect;
}(Z.effect));