"use strict";
Z.projectile = (function(base) {
	var _projectile = Object.create(base);
	_projectile.type = "projectile";
	_projectile.distance = 0;
	_projectile.direction = vec2(1, 0);
	_projectile.distanceCovered = 0;
	_projectile.moveDirection = vec2();
	_projectile.speed = 0;
	_projectile.noise = 0;
	_projectile.rayHit = true;				// Set to false to ignore ray-cast hits
	_projectile.triggerStopped = false;
	_projectile.triggerContact = false;
	_projectile.triggerDamage = false;
	_projectile.triggerTime = 0;
	_projectile.elapsedTime = 0;
	_projectile.spread = 0;
	_projectile.damagePlayer = true;
	_projectile.damageType = 0;
	_projectile.damageAmount = 0;
	_projectile.hitEffect = null;
	_projectile.zombieHitEffect = null;
	_projectile.effect = null;
	_projectile.create = function(
		position,
		distance,
		direction,
		spread,
		damagePlayer,
		damageType,
		damageAmount,
		hitEffect,
		data
	) {
		var p = base.create.call(this, position, vec2(data.size), data.sprite);
		p.sprite.animation = "projectile";
		p.distance = distance;
		p.moveDirection = direction;
		p.direction = Z.utilities.direction(vec2(), direction);
		p.speed = data.speed || p.speed;
		p.noise = data.noise || p.noise;
		p.rayHit = !!data.rayHit;
		p.triggerStopped = !!data.triggerStopped;
		p.triggerContact = !!data.triggerContact;
		p.triggerDamage = !!data.triggerDamage;
		p.triggerTime = data.triggerTime || p.triggerTime;
		p.spread = spread;
		p.damagePlayer = damagePlayer;
		p.damageType = damageType;
		p.damageAmount = damageAmount;
		p.hitEffect = hitEffect;
		
		// Create projectile effect if there is one
		if (data.effect) {
			p.effect = Z.effect.createType(position, position, data.effect);
			if (p.effect) {	// Make sure the effect type exists (createType will return null)
				Z.actorMap.push(p.effect);
			}
		}
		return p;
	};
	_projectile.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		this.moveVector = vec2.mul(this.moveDirection, this.speed * elapsedTime);
		this.direction = this.moveDirection;
		
		// Move the projectile effect if there is one
		if (this.effect) {
			this.effect.position = vec2(this.position.X, this.position.Y);
		}
		
		// Check if the projectile has reached the maximum distance
		if (this.distanceCovered >= this.distance) {
			if (this.triggerStopped) {	// Detonate if this projectile is triggered when stopped
				this.detonate();
			} else {					// Otherwise stop movement
				this.speed = 0;
			}
		}
		this.distanceCovered += this.speed * elapsedTime;
		
		// Check if the projectile timer has reached it's detonation time
		if (this.triggerTime && this.elapsedTime > this.triggerTime) {
			this.detonate();
		}
		this.elapsedTime += elapsedTime;
	};
	_projectile.detonate = function() {
		if (this.spread) {
			var spread = Z.weaponSpread.create(
					this.position,
					this.spread,
					this.damagePlayer,
					this.damageType,
					this.damageAmount
				);
			Z.actorMap.push(spread);
		}
		
		// Remove projectile effect if there is one
		if (this.effect) {
			this.effect.dispose = true;
		}
		
		// Create hit effect
		if (this.hitEffect) {
			var effect = Z.effect.createType(this.position, this.position, this.hitEffect);
			if (effect) {	// Make sure the effect type exists (createType will return null)
				Z.actorMap.push(effect);
			}
		}
		
		// Make detonation noise
		if (this.noise) {
			Z.actorMap.push(Z.noise.create(this.position, this.noise));
		}
		this.dispose = true;
	};
	_projectile.damage = function() {	// Detonate when damaged
		if (this.triggerDamage) {
			this.detonate();
		}
	};
	_projectile.handleCollision = function(actor, mtv) {
		if (actor.type == "player" || (actor.type == "car" && actor.playerDriving)) { return; }
		if (actor.type != "weaponSpread" &&
			actor.type != "noise" &&
			actor.type != "powerup" &&
			actor.type != "projectile") {
			if (this.triggerContact) {		// Detonate if this projectile is triggered by contact
				this.detonate();
			} else {	// Otherwise stop movement
				this.speed = 0;
			}
		}
	};
	return _projectile;
}(Z.actor));