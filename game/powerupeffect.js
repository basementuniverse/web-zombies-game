"use strict";
Z.powerupEffect = (function(base) {
	var START_SCALE = 0.6,
		END_SCALE = 1,
		ICON_OFFSET = vec2(-5, 0),
		TEXT_OFFSET = vec2(20, 0),
		LIGHT_COLOUR = "rgba(255, 255, 255, 0.6)",
		LIGHT_AMOUNT = 30;
	
	var _effect = Object.create(base);
	_effect.distance = 0;
	_effect.font = "";
	_effect.colour = "";
	_effect.text = "";
	_effect.fadeTime = 0;
	_effect.offset = vec2();
	_effect.currentOffset = vec2();
	_effect.currentScale = START_SCALE;
	_effect.spriteOffset = vec2();
	_effect.alpha = 1;
	_effect.sprite = null;
	_effect.create = function(position, target, data) {
		var e = base.create.call(this, target, data.name, data.fadeTime, data.soundEffect);
		e.offset = vec2(data.offset);
		e.font = data.font || e.font;
		e.colour = data.colour || e.colour;
		e.text = data.text || e.text;
		e.fadeTime = data.fadeTime || e.fadeTime;
		e.spriteOffset = data.spriteOffset || e.spriteOffset;
		return e;
	};
	_effect.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		var delta = this.totalTime / this.fadeTime;
		this.alpha = delta;
		this.currentOffset = vec2(
			Math.lerp(this.position.X, this.position.X + this.offset.X, 1 - delta),
			Math.lerp(this.position.Y, this.position.Y + this.offset.Y, 1 - delta)
		);
		this.currentScale = Math.lerp(START_SCALE, END_SCALE, 1 - delta);
	};
	_effect.draw = function(context) {
		context.save();
		context.globalAlpha = this.alpha;
		context.translate(this.currentOffset.X, this.currentOffset.Y);
		context.scale(this.currentScale, this.currentScale);
		
		// Draw sprite image if there is one (manually passed in powerup.js)
		if (this.sprite) {
			var offset = vec2.add(this.spriteOffset, ICON_OFFSET);
			this.sprite.draw(context, offset, vec2());
		}
		context.fillStyle = this.colour;
		context.font = this.font;
		context.textBaseline = "top";
		context.fillText(this.text, TEXT_OFFSET.X * this.currentScale, TEXT_OFFSET.Y);
		context.restore();
		this.drawLightMap(Z.environment.lightMapContext);
	};
	_effect.drawLightMap = function(context) {
		if (!Z.settings.dayCycleEnabled) { return; }
		context.save();
		context.globalAlpha = this.alpha * Z.environment.getLightLevel();
		context.globalCompositeOperation = "xor";
		var offset = vec2.add(this.currentOffset, vec2.div(TEXT_OFFSET, 2));
		context.translate(offset.X, offset.Y);
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