"use strict";
Z.powerup = (function(base) {
	var _powerup = Object.create(base);
	_powerup.type = "powerup";
	_powerup.name = "";
	_powerup.damagedEvent = null;
	_powerup.pickupEffect = null;
	_powerup.zIndex = -2;		// Draw powerups below other actors (including cars)
	_powerup.create = function(position, data) {
		var p = base.create.call(this, position, vec2(data.size), Z.sprite.create(data.sprite));
		p.name = data.name;		// Required
		p.sprite.animation = "world";
		if (data.damagedEvent) {		// Parameters for responding to damage
			p.damagedEvent = data.damagedEvent;
		}
		if (data.pickupEffect) {		// Visual effect played when powerup is picked up
			p.pickupEffect = data.pickupEffect;
		}
		return p;
	};
	
	// Return a new powerup instance from the specified data
	_powerup.createType = function(position, data) {
		switch (data.type) {
			case Z.powerupType.health: return Z.healthPowerup.create(position, data);
			case Z.powerupType.armour: return Z.armourPowerup.create(position, data);
			case Z.powerupType.inventory: return Z.inventoryPowerup.create(position, data);
			case Z.powerupType.weapon: return Z.weaponPowerup.create(position, data);
			default: return null;
		}
	};
	
	_powerup.damage = function(position, type, amount) {
		if (this.damagedEvent) {
			// Create weapon spread to deal damage to actors in range
			if (this.damagedEvent.spread) {
				var spread = Z.weaponSpread.create(
						this.position,
						this.damagedEvent.spread,
						this.damagedEvent.damagePlayer,
						this.damagedEvent.damageType,
						this.damagedEvent.damageAmount
					);
				Z.actorMap.push(spread);
			}
			
			// Create hit effect
			if (this.damagedEvent.effect) {
				var effect = Z.effect.createType(this.position, this.position, this.damagedEvent.effect);
				if (effect) {	// Make sure the effect type exists (createType will return null)
					Z.actorMap.push(effect);
				}
			}
			
			// Make noise
			if (this.damagedEvent.noise) {
				Z.actorMap.push(Z.noise.create(this.position, this.damagedEvent.noise));
			}
			this.dispose = true;
		}
	};
	
	// Handle player collision (apply power-up and remove this actor)
	_powerup.handleCollision = function(actor, mtv) {
		if (actor.type == "building") {		// Separate from buildings
			this.position.X = actor.position.X - 30;
		} else if (actor.type == "player" ||	// Player can pick up powerups when in a car
			(actor.type == "car" && actor.playerDriving)) {
			this.pickup();
		}
	};
	
	// Called when this power-up is picked up by the player
	_powerup.pickup = function() {
		// Create powerup visual effect
		if (this.pickupEffect) {
			var effect = Z.effect.createType(this.position, this.position, this.pickupEffect);
			effect.sprite = this.sprite;
			effect.text = "+" + Math.max(this.amount, 1);
			if (effect) {	// Make sure the effect type exists
				Z.actorMap.push(effect);
			}
		}
		
		// Remove powerup from world
		this.dispose = true;
	};
	return _powerup;
}(Z.actor));