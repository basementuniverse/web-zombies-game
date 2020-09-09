"use strict";
Z.zombie = (function(base) {
	var HEAD_REGEN_THRESHOLD = 30,
		BODY_REGEN_STANDUP = 50,
		WEAPON_CLAW = 0,
		WEAPON_BITE = 1,
		FIRE_DAMAGE = 2,
		FIRE_RATE = 0.1,
		DEFAULT_GIB_AMOUNT = -500,
		DEFAULT_BRAIN_UPDATE_RATE = 1;
	
	var _zombie = Object.create(base);
	_zombie.type = "zombie";
	_zombie.brain = null;
	_zombie.walkSpeed = 0;
	_zombie.runSpeed = 0;
	_zombie.headHealth = 0;
	_zombie.maxHeadHealth = 0;
	_zombie.bodyHealth = 0;
	_zombie.maxBodyHealth = 0;
	_zombie.regenerationRate = 0;
	_zombie.pushed = false;
	_zombie.fallDelay = 0;
	_zombie.fallen = false;
	_zombie.fallTime = 0;
	_zombie.idleTime = 0;
	_zombie.dead = false;
	_zombie.attacking = false;
	_zombie.weapon = 0;
	_zombie.weapons = [];
	_zombie.clawInfectionChance = 0;
	_zombie.biteInfectionChance = 0;
	_zombie.onFire = false;
	_zombie.fireTime = 0;
	_zombie.fireEffect = null;
	_zombie.gibEffect = null;
	_zombie.gibAmount = 0;
	_zombie.lightLevel = 0;
	_zombie.brainUpdateRate = [];
	_zombie.create = function(position, direction, state, data) {
		var z = base.create.call(
				this,
				position,
				vec2(data.size),
				Z.spriteGenerator.getSprite("zombie", data.sprite)
			);
		z.brain = Z.zombieBrain.create(z, state);	// Zombie AI
		z.direction = direction;
		z.walkSpeed = data.walkSpeed || z.walkSpeed;
		z.runSpeed = data.runSpeed || z.runSpeed;
		z.headHealth = data.headHealth || z.headHealth;
		z.maxHeadHealth = data.headHealth || z.maxHeadHealth;
		z.bodyHealth = data.bodyHealth || z.bodyHealth;
		z.maxBodyHealth = data.bodyHealth || z.maxBodyHealth;
		z.fallDelay = data.fallDelay || z.fallDelay;
		z.idleTime = data.idleTime || z.idleTime;
		z.regenerationRate = data.regenerationRate || z.regenerationRate;
		z.clawInfectionChance = data.clawInfectionChance || z.clawInfectionChance;
		z.biteInfectionChance = data.biteInfectionChance || z.biteInfectionChance;
		z.fireEffect = data.fireEffect || null;
		z.gibEffect = data.gibEffect || null;
		z.gibAmount = data.gibAmount || DEFAULT_GIB_AMOUNT;
		z.lightLevel = data.lightLevel || 0;
		z.brainUpdateRate = data.brainUpdateRate || [
			DEFAULT_BRAIN_UPDATE_RATE,
			DEFAULT_BRAIN_UPDATE_RATE,
			DEFAULT_BRAIN_UPDATE_RATE,
			DEFAULT_BRAIN_UPDATE_RATE
		];
		
		// Add default weapons (claw and bite)
		var weapons = [];
		weapons.push(
			Z.weapon.create(Z.content.items["weapon_claw"]),
			Z.weapon.create(Z.content.items["weapon_bite"])
		);
		z.weapons = weapons;
		return z;
	};
	_zombie.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		if (!this.dead) {
			var zombie = this;
			
			// Update animation (if not currently attacking or fallen over)
			if (!this.attacking && !this.fallen) {
				this.sprite.animation = this.brain.animation;
			}
			
			// Check if the zombie is on fire
			if (this.onFire && this.fireTime <= 0) {
				this.fireTime = FIRE_RATE;
				this.damage(this.position, Z.damageType.head, FIRE_DAMAGE);
				
				// Create fire effect
				if (this.fireEffect) {
					var effect = Z.effect.createType(this.position, this.position, this.fireEffect);
					if (effect) {	// Make sure the effect type exists
						Z.actorMap.push(effect);
					}
				}
			} else {
				this.fireTime = Math.max(this.fireTime - elapsedTime, 0);
			}
			
			// Check if zombie has been knocked over (due to body health or push)
			if ((this.bodyHealth <= 0 || this.pushed) && !this.fallen) {
				this.fallen = true;
				this.sprite.animation = "falldown";
				var animation = this.sprite.animations["falldown"];
				this.fallTime = animation.frames * (1 / animation.frameRate) + this.fallDelay;
			}
			this.pushed = false;
			
			if (!this.onFire) {
				// Regenerate body health
				this.bodyHealth = Math.min(
					this.bodyHealth + (this.regenerationRate * elapsedTime),
					this.maxBodyHealth
				);
				
				// If body health is at maximum, regenerate head health
				if (this.bodyHealth == this.maxBodyHealth && this.headHealth >= HEAD_REGEN_THRESHOLD) {
					this.headHealth = Math.min(
						this.headHealth + (this.regenerationRate * elapsedTime),
						this.maxHeadHealth
					);
				}
			}
			
			// Zombie will get up after fallDelay (providing body health has regenerated enough)
			if (this.fallen) {
				if (this.fallTime <= 0 && this.bodyHealth >= BODY_REGEN_STANDUP) {
					this.sprite.animation = "getup";
					this.sprite.animations["getup"].finishedCallback = function() {
						zombie.fallen = false;
						zombie.sprite.animation = "idle";
					};
				} else {
					this.fallTime = Math.max(this.fallTime - elapsedTime, 0);
				}
			}
			
			// Check if the zombie has died
			if (this.headHealth <= 0) {
				this.dead = true;
				Z.statistics.zombiesKilled++;
				
				// Play death animation and remove zombie when finished
				this.sprite.animation = this.fallen ? "falldeath" : "death";
				this.sprite.animations[this.sprite.animation].finishedCallback = function() {
					zombie.dispose = true;
					
					// Draw zombie onto decals canvas
					Z.viewArea.drawDecal(zombie);
				};
			}
			
			// Update zombie AI
			this.brain.update(elapsedTime);
			this.moveVector = vec2.mul(vec2.norm(this.brain.moveVector), this.brain.speed * elapsedTime);
			if (this.fallen) { this.moveVector = vec2(); }
			this.direction = (this.brain.direction.X || this.brain.direction.Y) ?
				this.brain.direction : this.direction;
			if (this.brain.attack && !this.fallen) {	// Attack target if one is in range
				this.attack();
			} else {								// Stop attacking when there are no targets
				this.attacking = false;
			}
			
			// Update current weapon
			this.weapons[this.weapon].update(elapsedTime, this);
		} else {
			this.attacking = false;
		}
		
		// Check if zombie was gibbed
		if (this.headHealth <= this.gibAmount || this.bodyHealth <= this.gibAmount) {
			this.dispose = true;
			if (this.gibEffect) {
				var effect = Z.effect.createType(this.position, this.position, this.gibEffect);
				if (effect) {	// Make sure the effect type exists
					Z.actorMap.push(effect);
				}
			}
		}
	};
	_zombie.handleCollision = function(actor, mtv) {
		if (actor.type != "weaponSpread" &&
			actor.type != "noise" &&
			actor.type != "powerup" &&
			actor.type != "projectile") {
			base.handleCollision.call(this, actor, mtv);
		}
		
		// If on fire, deal extra damage to the player or set other zombies on fire
		if (this.onFire) {
			if (actor.type == "player") {
				Z.player.damage(this.position, Z.damageType.fire, FIRE_DAMAGE);
			} else if (actor.type == "zombie") {
				actor.onFire = true;
			}
		}
	};
	_zombie.attack = function() {
		var zCenter = vec2.add(this.position, vec2.div(this.size, 2)),
			pCenter = vec2.add(Z.player.position, vec2.div(Z.player.size, 2)),
			distance = vec2.len(vec2.sub(pCenter, zCenter));
		if (!this.attacking) {
			this.attacking = true;
			
			// If within biting range, use bite weapon otherwise use claw weapon
			if (distance <= this.weapons[WEAPON_BITE].maxRange) {
				this.weapon = WEAPON_BITE;
				this.sprite.animation = "bite";
			} else {
				this.weapon = WEAPON_CLAW;
				this.sprite.animation = "claw";
			}
			
			// Remove attacking status when animation finishes
			var z = this;
			this.sprite.animations[this.sprite.animation].finishedCallback = function() {
				z.attacking = false;
				z.biting = false;
				z.sprite.animation = "idle";
				
				// End attack if this is a non-automatic weapon
				if (!z.weapons[z.weapon].automatic) {
					z.brain.attack = false;
				}
			}
		}
		
		// Fire selected weapon (ie. claw or bite player)
		this.weapons[this.weapon].fire(zCenter, this.direction, this.size, pCenter);
		
		// Chance to infect player (only if not wearing armour or in a vehicle)
		if (!Z.settings.godMode && Z.player.alive && Z.player.armour <= 0 && !Z.player.inCar &&
			Math.random() < (this.weapon == WEAPON_CLAW ?
				this.clawInfectionChance : this.biteInfectionChance)) {
			Z.player.infect(true);
		}
	};
	
	// Handle damage being dealt to a zombie
	//	position:	The collision world position
	//	type:		The type of damage dealt by the weapon
	//	amount:		The amount of damage
	_zombie.damage = function(position, type, amount) {
		var headDamage = 0,
			bodyDamage = 0;
		if (type == Z.damageType.headBody) {
			// Check if the hit position was a headshot
			var headHeight = this.position.Y + this.hitBox.offset.Y + this.sprite.spriteHeadSize;
			if (position.Y < headHeight) {
				headDamage = amount;
			} else {
				bodyDamage = amount;
			}
		} else if (type == Z.damageType.head) {
			headDamage = amount;
		} else if (type == Z.damageType.body) {
			if (amount > this.bodyHealth) {		// Body damage spills over into head damage
				headDamage = amount - this.bodyHealth;
				bodyDamage = this.bodyHealth;
			} else {
				bodyDamage = amount;
			}
		} else if (type == Z.damageType.push) {
			bodyDamage = amount;
			this.pushed = true;
		} else if (type == Z.damageType.fire) {
			bodyDamage = amount;
			this.onFire = true;
		}
		this.headHealth -= headDamage;	// Head health can go below 0 (no chance to regen)
		this.bodyHealth = Math.max(this.bodyHealth - bodyDamage, 0);
		this.brain.alert(position);
	};
	return _zombie;
}(Z.actor));