"use strict";
Z.noise = (function(base) {
	var NOISE_TIME = 0.2;		// Noise will self-dispose after this number of seconds
	
	var _noise = Object.create(base);
	_noise.type = "noise";
	_noise.time = 0;
	_noise.create = function(position, size) {
		var n = base.create.call(this, vec2.sub(position, size / 2), vec2(size, size), null);
		n.time = NOISE_TIME;
		return n;
	};
	
	// Remove this actor after a short delay
	_noise.update = function(elapsedTime) {
		this.time -= elapsedTime;
		if (this.time <= 0) {
			this.dispose = true;
		}
	};
	
	// Alert zombies in collision range of this noise
	_noise.handleCollision = function(actor, mtv) {
		if (actor.type == "zombie") {
			actor.brain.alert(vec2.add(this.position, vec2.div(this.size, 2)));
		}
	};
	
	// Bug - noises sometimes don't dispose properly, so check again during draw phase
	_noise.draw = function(context) {
		if (this.time <= 0) {
			this.dispose = true;
		}
	};
	return _noise;
}(Z.actor));