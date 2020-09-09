"use strict";
Z.healthPowerup = (function(base) {
	var _health = Object.create(base);
	_health.amount = 0;
	_health.create = function(position, data) {
		var h = base.create.call(this, position, data);
		h.amount = data.healthAmount || h.amount;
		return h;
	};
	_health.pickup = function() {
		// Apply health if player's current health is lower than maximum
		if (Z.player.health < Z.player.maxHealth) {
			Z.player.health = Math.min(Z.player.health + this.amount, Z.player.maxHealth);
			base.pickup.call(this);
		}
	};
	return _health;
}(Z.powerup));