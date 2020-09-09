"use strict";
Z.weapon = (function() {
	var FIRE_OFFSCREEN_BORDER = 100;	// Distance beyond the visible screen that firePastTarget
										// weapons will target
	// Place an effect in the game world
	var createEffect = function(position, targetPosition, data) {
		if (data) {			// Make sure that an effect is defined in the weapon
			var effect = Z.effect.createType(position, targetPosition, data);
			if (effect) {	// Make sure the effect type exists (createType will return null)
				Z.actorMap.push(effect);
			}
		}
	};
	
	return {
		name: "",
		type: 0,
		index: 0,
		sprite: null,
		hudSprite: null,			// Duplicate instance of weapon sprite for use in HUD
		size: vec2(),
		automatic: false,
		rateOfFire: 1,
		ammoType: "",
		ammoIsWeapon: false,		// True if having ammo should count as having the weapon
		magazine: 0,				// Current magazine rounds
		magazineSize: 1,			// Number of rounds in a magazine
		maxRange: 0,
		firePastTarget: false,
		spread: 0,					// The number of pixels to spread damage around the target
		damagePlayer: true,			// True if this weapon should damage the player
		damageType: 0,
		damageAmount: 1,
		firing: false,
		released: false,
		lastFired: 0,
		reloading: false,
		reloadTime: 0,
		reloadElapsedTime: 0,
		barrelPosition: vec2(),
		targetPosition: null,
		noise: 0,
		projectile: null,
		castEffect: null,
		hitEffect: null,
		zombieHitEffect: null,
		useWeaponAnimation: false,
		fireSoundEffect: "",
		fireSoundEffectReTrigger: true,
		fireSoundEffectStart: "",
		fireSoundEffectEnd: "",
		fireEmptySoundEffect: "",
		reloadSoundEffect: "",
		create: function(data) {
			var w = Object.create(this);
			if (data.sprite) {
				w.sprite = Z.sprite.create(data.sprite);
				w.sprite.animation = "player";
				w.hudSprite = Z.sprite.create(data.sprite);
				w.hudSprite.animation = "hud";
			}
			w.name = data.name;			// Required
			w.type = data.type || w.type;
			w.index = data.index || w.index;
			w.size = vec2(data.size);	// Required
			w.automatic = !!data.automatic;
			w.rateOfFire = data.rateOfFire || w.rateOfFire;
			w.ammoType = data.ammoType || w.ammoType;
			w.ammoIsWeapon = !!data.ammoIsWeapon || w.ammoIsWeapon;
			w.magazineSize = data.magazineSize || w.magazineSize;
			w.maxRange = data.maxRange || w.maxRange;
			w.firePastTarget = !!data.firePastTarget;
			w.spread = data.spread || w.spread;
			w.damagePlayer = !!data.damagePlayer;
			w.damageType = data.damageType || w.damageType;
			w.damageAmount = data.damageAmount || w.damageAmount;
			w.noise = data.noise || w.noise;
			w.reloadTime = data.reloadTime || w.reloadTime;
			w.useWeaponAnimation = !!data.useWeaponAnimation;
			w.fireSoundEffect = data.fireSoundEffect || w.fireSoundEffect;
			
			// Re-trigger fire sound effect for every shot fired or loop sound while firing
			// (defaults to true: re-trigger for every shot)
			if (data.fireSoundEffectReTrigger !== undefined) {
				w.fireSoundEffectReTrigger = !!data.fireSoundEffectReTrigger;
			} else {
				w.fireSoundEffectReTrigger = true;
			}
			w.fireEmptySoundEffect = data.fireEmptySoundEffect || w.fireEmptySoundEffect;
			w.reloadSoundEffect = data.reloadSoundEffect || w.reloadSoundEffect;
			
			// If this is a projectile weapon, get projectile properties
			if (data.type == Z.weaponType.projectile && data.projectile) {
				w.projectile = data.projectile;
				w.projectile.sprite = Z.sprite.create(data.sprite);
			}
			
			// If this weapon has effects, get effect properties
			w.castEffect = data.castEffect || null;
			w.hitEffect = data.hitEffect || null;
			w.zombieHitEffect = data.zombieHitEffect || null;
			
			// If player has enough ammo, make sure the weapon is initially loaded
			if (Z.player.inventory[w.ammoType] > 0) {
				w.reload(true);
			}
			return w;
		},
		fire: function(position, direction, size, target, firePastTarget, car) {
			if (car) { 	// If in a car, fire from closest car window
				var r = vec2.rad(car.direction),
					closestWindow = vec2(),
					minDelta = Infinity;
				for (var i = car.windowPositions.length; i--;) {
					var windowPosition = vec2.add(car.position, vec2.rot(car.windowPositions[i], r)),
						delta = vec2.len(vec2.sub(target, windowPosition));
					if (delta < minDelta) {
						closestWindow = windowPosition;
						minDelta = delta;
					}
				}
				this.barrelPosition = closestWindow;
			} else {
				var offset = (this.sprite && this.sprite.spriteBarrelOffset) ?
						vec2.add(
							vec2.add(position, this.sprite.actorOffset),
							vec2(this.sprite.spriteBarrelOffset[vec2.toString(direction)])
						) : vec2.add(position, vec2.div(size, 2));
				this.barrelPosition = offset;
			}
			
			// If firing past target, move the target to an off-screen position
			if (this.firePastTarget || firePastTarget) {
				var offScreenRange = (Math.max(Z.camera.size.X, Z.camera.size.Y) / 2) + FIRE_OFFSCREEN_BORDER;
				this.targetPosition = vec2.add(
					this.barrelPosition,
					vec2.mul(vec2.norm(vec2.sub(target, position)), offScreenRange)
				);
			} else {
				this.targetPosition = target;
			}
			this.firing = true;
		},
		reload: function(instant) {		// instant: reload without delay or sound effect
			if (this.sprite && this.magazineSize && this.magazine < this.magazineSize) {
				this.reloading = true;
				this.reloadElapsedTime = instant ? 0 : this.reloadTime;
				this.sprite.animation = "reload";
				
				// Play reload sound effect
				if (!instant) {
					Z.sound.play(this.reloadSoundEffect);
				}
			}
		},
		update: function(elapsedTime, actor) {
			if (this.firing &&
				(	// Either no ammo type to deplete, or magazine-less weapon (using ammo directly
					// from player inventory), or magazine has ammo and is not reloading.
					// Check rate of fire timing and whether weapon is automatic/semi-automatic
					!this.ammoType ||
					(!this.magazineSize && Z.player.inventory[this.ammoType] > 0) ||
					(!this.reloading && this.magazine > 0)
				) && this.lastFired <= 0 && (this.released || this.automatic)
			) {
				// Check that target position is in weapon range (limit range if over)
				var v = vec2.sub(this.barrelPosition, this.targetPosition),
					length = vec2.len(v),
					result = null;
				if (this.maxRange > 0 && length > this.maxRange) {
					v = vec2.mul(vec2.div(v, length), -this.maxRange);
					this.targetPosition = vec2.add(this.barrelPosition, v);
				}
				
				// Cast ray and check for actor hit
				result = Z.collision.castRay(this.barrelPosition, this.targetPosition, function(a) {
					return (a.type == actor.type);
				});
				this.targetPosition = result.position;
				
				// Cast effect
				createEffect(this.barrelPosition, this.targetPosition, this.castEffect);
				
				// If this is a ray-cast weapon, apply damage to hit actor and create weapon spread
				if (this.type == Z.weaponType.rayCast) {
					if (result.actor) {
						if (!(result.actor.type == "player" && !this.damagePlayer)) {
							result.actor.damage(
								this.targetPosition,
								this.damageType,
								this.damageAmount
							);
						}
						
						// Zombie hit effect
						if (result.actor.type == "zombie" || result.actor.type == "player") {
							createEffect(
								this.barrelPosition,
								this.targetPosition,
								this.zombieHitEffect
							);
						}
					}
					
					// Hit effect (only if zombie wasn't hit)
					if (!result.actor || result.actor.type != "zombie") {
						createEffect(this.barrelPosition, this.targetPosition, this.hitEffect);
					}
					
					// If weapon has a spread value, apply damage to actors in range
					if (this.spread) {
						var spread = Z.weaponSpread.create(
								this.targetPosition,
								this.spread,
								this.damagePlayer,
								this.damageType,
								this.damageAmount
							);
						Z.actorMap.push(spread);
					}
				} else if (this.type == Z.weaponType.projectile) {
					// Otherwise create projectile
					var v = vec2.sub(this.targetPosition, this.barrelPosition),
						distance = vec2.len(v),
						direction = vec2.div(v, distance),
						projectile = Z.projectile.create(
							this.barrelPosition,
							distance,
							direction,
							this.spread,
							this.damagePlayer,
							this.damageType,
							this.damageAmount,
							this.hitEffect,
							this.projectile);
					Z.actorMap.push(projectile);
				}
				
				// Deplete current magazine
				if (this.ammoType && !Z.settings.infiniteAmmo) {
					if (this.magazineSize) {
						this.magazine--;
					} else {
						Z.player.inventory[this.ammoType]--;
					}
				}
				
				// Special handling for no ammo type...
				if (!this.ammoType) {
					this.magazine--;
				}
				
				// Make weapon noise
				if (this.noise) {
					Z.actorMap.push(Z.noise.create(this.barrelPosition, this.noise));
				}
				
				// Play fire sound effect
				Z.sound.play(this.fireSoundEffect, null, this.fireSoundEffectReTrigger);
				
				// Set new target position
				this.targetPosition = result.position;
				this.lastFired = 1 / this.rateOfFire;
				this.released = false;
			} else {		// Check if weapon is firing but empty
				if (this.firing &&
					this.lastFired <= 0 &&
					this.released &&
					!this.reloading) {
					Z.sound.play(this.fireEmptySoundEffect, null, true);
					this.lastFired = 1 / this.rateOfFire;
				} else {	// Reduce rate-of-fire timer
					this.lastFired = Math.max(this.lastFired - elapsedTime, 0);
				}
				this.targetPosition = null;
				this.released = !this.firing;
			}
			
			// Reload if magazine is empty
			if (this.ammoType && !this.magazine && !this.reloading &&
				Z.player.inventory[this.ammoType] > 0) {
				this.reload();
			} else if (!this.ammoType && this.magazineSize > 0 && !this.reloading) {
				this.reload();	// Special handling for weapons that use the reload animation every
			}					// time they fire but use no ammo type (eg. cricket bat)
			this.firing = false;
			
			// If currently reloading, check if reload is finished - refill magazine and
			// deplete ammo in player inventory
			if (this.reloading) {
				if (this.reloadElapsedTime <= 0) {
					if (this.ammoType) {
						var required = this.magazineSize - this.magazine;
						if (Z.player.inventory[this.ammoType] > required) {
							Z.player.inventory[this.ammoType] -= required;
							this.magazine = this.magazineSize;
						} else {	// Not enough ammo to fill the magazine
							this.magazine += Z.player.inventory[this.ammoType];
							Z.player.inventory[this.ammoType] = 0;
						}
					} else {
						this.magazine = this.magazineSize;
					}
					this.reloading = false;
					this.sprite.animation = "player";
				} else {
					this.reloadElapsedTime = Math.max(this.reloadElapsedTime - elapsedTime, 0);
				}
			}
			
			// Update weapon sprite
			if (this.sprite) {
				this.sprite.update(elapsedTime);
			}
		}
	};
}());