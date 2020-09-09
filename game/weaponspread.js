"use strict";
Z.weaponSpread = (function(base) {
	var WEAPON_SPREAD_TIME = 0.2;
	
	var _spread = Object.create(base);
	_spread.type = "weaponSpread";
	_spread.damagePlayer = true;
	_spread.damageType = 0;
	_spread.damageAmount = 0;
	_spread.time = 0;
	_spread.create = function(position, size, damagePlayer, damageType, damageAmount) {
		var s = base.create.call(this, vec2.sub(position, size / 2), vec2(size, size), null);
		
		// Head/body damage type is changed to body damage type
		s.damagePlayer = damagePlayer;
		s.damageType = damageType;// == Z.damageType.headBody ? Z.damageType.body : damageType;
		s.damageAmount = damageAmount;
		s.time = WEAPON_SPREAD_TIME;
		return s;
	};
	_spread.update = function(elapsedTime) {
		this.time -= elapsedTime;
		if (this.time <= 0) {
			this.dispose = true;
		}
	};
	
	// Apply damage to all actors that collide with this
	_spread.handleCollision = function(actor, mtv) {
		if (!this.damagePlayer &&
			(actor.type == "player" || (actor.type == "car" && actor.playerDriving))) {
			return;
		}
		
		// Damage falls to 0 at edge of spread range
		var position = vec2.add(this.position, vec2.div(this.size, 2)),
			delta = vec2.len(vec2.sub(position, actor.position)),
			damage = Math.lerp(this.damageAmount, 0, delta / (this.size.X / 2));
		actor.damage(position, this.damageType, damage);
		this.dispose = true;
	};
	
	// Bug - weapon spreads sometimes don't dispose properly, so check again during draw phase
	_spread.draw = function(context) {
		if (this.time <= 0) {
			this.dispose = true;
		}
	};
	return _spread;
}(Z.actor));