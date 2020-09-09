"use strict";
Z.skidEffect = (function(base) {
	var _effect = Object.create(base);
	_effect.alpha = 0;
	_effect.colour = "",
	_effect.velocity = 0;
	_effect.speed = 0;
	_effect.create = function(position, alpha, colour, velocity) {
		var e = base.create.call(this, position, "skid", 1);
		e.alpha = alpha;
		e.colour = colour;
		e.velocity = velocity;
		e.speed = vec2.len(velocity);
		return e;
	};
	_effect.update = function(elapsedTime) {
		Z.viewArea.drawDecal(this);
		this.dispose = true;
	};
	_effect.draw = function(context) {
		context.save();
		context.translate(this.position.X, this.position.Y);
		context.rotate(vec2.rad(vec2.norm(this.velocity)));
		context.globalAlpha = this.alpha;
		context.fillStyle = this.colour;
		context.fillRect(
			-this.speed - 2,
			-2,
			this.speed + 2,
			2
		);
		context.restore();
	};
	return _effect;
}(Z.effect));