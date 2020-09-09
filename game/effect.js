"use strict";
Z.effect = (function(base) {
	var _effect = Object.create(base);
	_effect.type = "effect";
	_effect.name = "";
	_effect.time = 0;
	_effect.totalTime = 0;
	_effect.zIndex = 1;			// Draw effects on top of other actors
	_effect.soundEffect = "";
	_effect.soundTriggered = false;
	_effect.create = function(position, name, time, soundEffect) {
		var e = base.create.call(this, position, vec2(1, 1), null);
		e.collide = false;
		e.name = name;
		e.time = time;
		e.totalTime = time;
		e.soundEffect = soundEffect || e.soundEffect;
		e.soundTriggered = false;
		return e;
	};
	
	// Return a new effect instance from the specified data
	_effect.createType = function(position, targetPosition, data) {
		var effectTypes = {
			effect_bullet: "bulletEffect",
			effect_blood: "bloodEffect",
			effect_dust: "dustEffect",
			effect_explosion: "explosionEffect",
			effect_fire: "fireEffect",
			effect_light: "lightEffect",
			effect_powerup: "powerupEffect"
		};
		if (effectTypes[data.name] && Z[effectTypes[data.name]]) {
			return Z[effectTypes[data.name]].create(position, targetPosition, data);
		}
		return null;
	};
	_effect.update = function(elapsedTime) {
		// Play sound effect
		if (this.soundEffect && !this.soundTriggered) {
			Z.sound.play(this.soundEffect, this.position, true);
			this.soundTriggered = true;
		}
		
		// Update total elapsed time, dispose if effect has finished playing
		this.totalTime -= elapsedTime;
		if (this.totalTime <= 0) {
			this.dispose = true;
		}
	};
	_effect.draw = function(context) { };
	return _effect;
}(Z.actor));