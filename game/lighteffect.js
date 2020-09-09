"use strict";
Z.lightEffect = (function(base) {
	var _effect = Object.create(base);
	_effect.spread = 0;
	_effect.startColour = "";
	_effect.endColour = "";
	_effect.worldStartColour = "";
	_effect.worldEndColour = "";
	_effect.waitTime = 0;
	_effect.fadeTime = 0;
	_effect.alpha = 1;
	_effect.create = function(position, target, data) {
		var e = base.create.call(
			this,
			target,
			data.name,
			data.time + data.fadeTime,
			data.soundEffect
		);
		e.spread = data.spread || e.spread;
		e.startColour = data.startColour || e.startColour;
		e.endColour = data.endColour || e.endColour;
		e.worldStartColour = data.worldStartColour || e.worldStartColour;
		e.worldEndColour = data.worldEndColour || e.worldEndColour;
		e.waitTime = data.time || e.waitTime;
		e.fadeTime = data.fadeTime || e.fadeTime;
		e.alpha = 1;
		return e;
	};
	_effect.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		if (this.totalTime < this.fadeTime) {
			this.alpha = this.totalTime / this.fadeTime;
		}
		
		// If this effect is near the player, set nearLightSource to true
		if (vec2.len(vec2.sub(this.position, Z.player.position)) < this.spread) {
			Z.player.nearLightSource = true;
		}
	};
	_effect.draw = function(context) {
		this.drawLightMap(Z.environment.lightMapContext);
		if (this.worldStartColour && this.worldEndColour) {
			context.save();
			context.globalAlpha = Z.environment.getLightLevel();
			context.translate(this.position.X, this.position.Y);
			var gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.spread);
			gradient.addColorStop(0, this.worldStartColour);
			gradient.addColorStop(1, this.worldEndColour);
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(0, 0, this.spread, 0, Math.PI * 2, false);
			context.closePath();
			context.fill();
			context.restore();
		}
	};
	_effect.drawLightMap = function(context) {
		if (!Z.settings.dayCycleEnabled) { return; }
		context.save();
		context.globalAlpha = this.alpha * Z.environment.getLightLevel();
		context.globalCompositeOperation = "xor";
		context.translate(this.position.X, this.position.Y);
		var gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.spread);
		gradient.addColorStop(0, this.startColour);
		gradient.addColorStop(1, this.endColour);
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(0, 0, this.spread, 0, Math.PI * 2, false);
		context.closePath();
		context.fill();
		context.restore();
	};
	return _effect;
}(Z.effect));