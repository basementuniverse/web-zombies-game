"use strict";
Z.armourPowerup = (function(base) {
	var _armour = Object.create(base);
	_armour.amount = 0;
	_armour.create = function(position, data) {
		var a = base.create.call(this, position, data);
		a.amount = data.armourAmount || a.amount;
		return a;
	};
	_armour.pickup = function() {
		// Apply armour if player's current armour is lower than maximum
		if (Z.player.armour < Z.player.maxArmour) {
			Z.player.armour = Math.min(Z.player.armour + this.amount, Z.player.maxArmour);
			base.pickup.call(this);
		}
	};
	return _armour;
}(Z.powerup));