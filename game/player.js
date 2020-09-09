"use strict";
Z.player = (function(base) {
	var NOISE_DELAY = 0.2,			// Delay between emitting running noise in seconds
		ZOMBIE_DELAY = 10,
		ZOMBIE_WANDER_SPEED = 20,
		ZOMBIE_WANDER_TIME = 20,
		DEFAULT_GIB_AMOUNT = -500,
		MAP_UPDATE_TIME = 1,		// Rate that map position will be updated (in seconds)
		CAR_RANGE = 20,				// Player must be within this distance of a car's side to get in
		FIREPASTTARGET_RANGE = 100,
		FIREPASTTARGET_CAROFFSET = vec2(0, -10);
	
	// Return true if the main or alternate key mapping for a control is currently held down
	//	1 = left mouse button
	//	2 = middle mouse button
	//	3 = right mouse button
	//	4 = mouse wheel up
	//	5 = mouse wheel down
	//	6+ = charcode
	var controlDown = function(control) {
		return checkControl(control, Z.player.controls, "keyDown", "mouseDown");
	};
	
	// Return true if the main or alternate key mapping for a control has been pressed
	var controlPressed = function(control) {
		return checkControl(control, Z.player.controls, "keyPressed", "mouseClicked");
	};
	
	// Check if a main or alternative control mapping has been activated/is currently activated
	//	c:	The list of controls
	//	k:	A function for checking keyboard input
	//	m:	A function for checking mouse input
	var checkControl = function(control, c, k, m) {
		if (c[control]) {
			return (
				Z.input[k](c[control][0]) ||
				Z.input[m](c[control][0]) ||
				mouseWheel(c[control][0]) ||
				(c[control].length > 1 && c[control][1] && (
					Z.input[k](c[control][1]) ||
					Z.input[m](c[control][1]) ||
					mouseWheel(c[control][1])
				))
			);
		}
		return false;
	};
	
	// Return true if the mouse wheel was scrolled this frame and it matches the specified control
	var mouseWheel = function(control) {
		return (Z.input.mouseWheel > 0 && control == 4) || (Z.input.mouseWheel < 0 && control == 5);
	};
	
	// Cycle through available weapons in order of weapon index within a certain range
	//	weapons:	The current list of weapons
	//	weapon:		The current weapon index
	//	start:		The minimum weapon index to match
	//	end:		The maximum weapon index to match
	var cycleWeapons = function(weapons, weapon, start, end) {
		var current = (weapons[weapon].index >= start && weapons[weapon].index <= end),
			cycle = [];
		for (var i = 0, length = weapons.length; i < length; i++) {
			if (weapons[i].index >= start && weapons[i].index <= end) {
				cycle.push(i);
			}
		}
		if (!cycle.length) { return weapon; }
		if (current) {
			var index = $.inArray(weapon, cycle);
			return index > -1 ?
				(index >= (cycle.length - 1) ? cycle[0] : cycle[index + 1]) :
				weapon;
		}
		return cycle[0];
	};
	
	var _player = base.create(vec2(), vec2(), null);
	_player.controls = null;
	_player.type = "player";
	_player.inCar = null;					// A reference to the car the player is in, or null
	_player.walkSpeed = 0;
	_player.runSpeed = 0;
	_player.health = 0;
	_player.maxHealth = 0;
	_player.armour = 0;
	_player.maxArmour = 0;
	_player.infected = false;
	_player.infectionRate = 0;
	_player.inventory = [],					// Items currently held by player
	_player.maxInventory = null;			// Maximum inventory amount for each inventory type
	_player.weapons = [],					// Weapons currently held by the player
	_player.weapon = 0;						// Current selected weapon index
	_player.moving = false;
	_player.running = false;
	_player.runningNoise = 0;
	_player.noiseTime = 0;
	_player.alive = true;
	_player.attacking = false;
	_player.isZombie = false;
	_player.deadTime = 0;
	_player.deadWanderTime = 0;
	_player.zombieWanderDirection = vec2(1, 0);
	_player.torchActivated = false;
	_player.nightVisionActivated = false;
	_player.mapUpdateTime = 0;
	_player.useSerumSoundEffect = "";
	_player.gibbed = false;
	_player.gibAmount = 0;
	_player.gibEffect = null;
	_player.nearLightSource = false;
	_player.initialise = function(data, controls, torchData, nightVisionData) {
		this.position = vec2(data.startingPosition);
		this.size = vec2(data.size);
		this.walkSpeed = data.walkSpeed;
		this.runSpeed = data.runSpeed;
		this.health = data.health;
		this.maxHealth = data.maxHealth;
		this.armour = data.armour;
		this.maxArmour = data.maxArmour;
		this.infected = !!data.infected;
		this.infectionRate = data.infectionRate;
		this.runningNoise = data.runningNoise;
		this.maxInventory = data.maxInventory;
		this.controls = controls;
		this.useSerumSoundEffect = data.useSerumSoundEffect || "";
		this.gibAmount = data.gibAmount || DEFAULT_GIB_AMOUNT;
		this.gibEffect = data.gibEffect || null;
		
		// Re-initialise some variables (for when the player restarts the game)
		this.type = "player";
		this.alive = true;
		this.attacking = false;
		if (this.inCar) {
			this.inCar.playerDriving = false;
		}
		this.inCar = null;
		this.collide = true;
		this.isZombie = false;
		this.deadTime = 0;
		this.deadWanderTime = 0;
		this.torchActivated = false;
		this.nightVisionActivated = false;
		this.weapon = 0;
		this.gibbed = false;
		
		// Create sprite and ray-casting hit box
		this.sprite = Z.sprite.create(data.sprite);
		this.hitBox = { offset: this.sprite.spriteHitOffset, size: this.sprite.spriteHitSize };
		
		// Add default inventory and check against maximum carry amounts
		var inventory = [];
		if (data.defaultInventory) {
			for (var i in data.defaultInventory) {
				if (!data.defaultInventory.hasOwnProperty(i)) { continue; }
				inventory[i] = data.defaultInventory[i];
			}
			this.inventory = inventory;
			for (var i in this.maxInventory) {
				if (!this.maxInventory.hasOwnProperty(i)) { continue; }
				if (this.inventory[i]) {
					this.inventory[i] = Math.min(this.inventory[i], this.maxInventory[i]);
				}
			}
		}
		
		// Add push weapon and any other default weapons
		this.weapons = [];
		this.weapons.push(Z.weapon.create(Z.content.items["weapon_push"]));
		if (data.defaultWeapons) {
			var weapon = null;
			for (var i in data.defaultWeapons) {
				if (!data.defaultWeapons.hasOwnProperty(i)) { continue; }
				if (data.defaultWeapons[i] || (
						// For some projectile weapons, the ammo is the actual weapon (eg. grenades)
						// so add the weapon if the player has this ammo in default inventory
						Z.content.items[i].ammoIsWeapon &&
						this.inventory[Z.content.items[i].ammoType] > 0
					)) {
					weapon = Z.weapon.create(Z.content.items[i]);
					weapon.update(0, this);	// Update weapon so that it reloads
					this.weapons.push(weapon);
				}
			}
		}
		
		// Sort weapons
		this.weapons.sort(function(a, b) { return a.index - b.index; });
		Z.torch.initialise(torchData);
		Z.nightVision.initialise(nightVisionData);
	};
	_player.handleInput = function(elapsedTime) {
		if (!this.inCar) {
			var speed = this.walkSpeed,
				animation = "idle";
			
			// Check if player is running
			if (controlDown("run")) {
				this.running = true;
				speed = this.runSpeed;
			} else {
				this.running = false;
			}
			
			// Check player movement - each property in controls object is an array with 1 or 2
			// elements (for the main & alternative keyboard mapping)
			this.moving = false;
			if (controlDown("left")) {
				this.moveVector.X -= 1;
				this.moving = true;
				animation = this.running ? "run" : "walk";
			} else if (controlDown("right")) {
				this.moveVector.X += 1;
				this.moving = true;
				animation = this.running ? "run" : "walk";
			}
			if (controlDown("up")) {
				this.moveVector.Y -= 1;
				this.moving = true;
				animation = this.running ? "run" : "walk";
			} else if (controlDown("down")) {
				this.moveVector.Y += 1;
				this.moving = true;
				animation = this.running ? "run" : "walk";
			}
			this.moveVector = vec2.mul(vec2.norm(this.moveVector), speed);
			
			// Modify animation depending on equipped weapon (use idlearmed, walkarmed or runarmed)
			if (this.weapons[this.weapon].useWeaponAnimation) {
				animation += "armed";
			}
			
			// Set animation (if not already playing the push attack animation)
			if (this.sprite.animation != "push") {
				this.sprite.animation = animation;
			}
			
			// Get in a car if one is nearby (use closest car in range)
			if (controlPressed("getincar")) {
				var p = vec2.add(this.position, vec2.div(this.size, 2)),
					range = (Math.max(this.size.X, this.size.Y) / 2) + CAR_RANGE,
					topLeft = Z.utilities.section(vec2.sub(p, range)),
					bottomRight = Z.utilities.section(vec2.add(p, range)),
					minDelta = Infinity,
					closestCar = null;
				for (var x = topLeft.X; x <= bottomRight.X; x++) {
					for (var y = topLeft.Y; y <= bottomRight.Y; y++) {
						var actors = Z.actorMap.map[Z.utilities.hash(vec2(x, y))] || [];
						for (var i = actors.length; i--;) {
							if (actors[i].type == "car" && !actors[i].destroyed) {
								var r = vec2.rad(actors[i].direction);
								for (var j = actors[i].doorPositions.length; j--;) {
									var doorPosition = vec2.add(
											actors[i].position,
											vec2.rot(actors[i].doorPositions[j], r)
										),
										delta = vec2.len(vec2.sub(p, doorPosition));
									if (delta < minDelta) {
										minDelta = delta;
										closestCar = actors[i];
									}
								}
							}
						}
					}
				}
				if (closestCar && minDelta < range) {
					this.inCar = closestCar;
					this.inCar.playerDriving = true;
					this.collide = false;
					
					// If car has any fuel, add it to player inventory
					if (this.inCar.fuelAmount) {
						// Play pickup effect
						if (this.inCar.fuelPickupEffect) {
							var powerup = Z.powerup.createType(
									vec2(),
									Z.content.items["powerup_" + this.inCar.fuelType]
								),
								effect = Z.effect.createType(
									this.position,
									this.position,
									this.inCar.fuelPickupEffect
								);
							effect.sprite = powerup.sprite;
							effect.text = "+" + Math.max(this.inCar.fuelAmount, 1);
							if (effect) {	// Make sure the effect type exists
								Z.actorMap.push(effect);
							}
						}
						this.addInventory(this.inCar.fuelType, this.inCar.fuelAmount);
						this.inCar.fuelAmount = 0;
					}
				}
			}
		} else {
			// Get out of car (if currently in car)
			if (controlPressed("getincar")) {
				// Stop car engine sound
				var sound = Z.sound.sounds[this.inCar.damaged ? this.inCar.damagedSoundEffect : this.inCar.engineSoundEffect];
				if (sound) {
					sound.pause();
				}
				
				// Remove player from car
				var r = vec2.rad(this.inCar.direction);
				this.inCar.playerDriving = false;
				this.collide = true;
				this.position = vec2.add(
					this.inCar.position,
					vec2.rot(this.inCar.doorPositions[0], r)
				);
				this.inCar = null;
			}
		}
		
		// Check if player is attacking
		// If mouse was used to attack, target is mouse position otherwise fire past mouse
		// position (weapons can choose to do this even if mouse was used)
		this.attacking = false;
		var target = null,
			firePastTarget = false;
		if (Z.input.mouseDown(this.controls["attack"][0]) ||
			Z.input.mouseDown(this.controls["attack"][1])) {
			this.attacking = true;
			target = Z.input.mouseWorldPosition;
		} else if (Z.input.keyDown(this.controls["attack"][0]) ||
			Z.input.keyDown(this.controls["attack"][1])) {
			this.attacking = true;
			firePastTarget = true;
			if (this.inCar) {	// If firing from a car using keyboard, fire in the car's direction
				target = vec2.add(
					vec2.add(this.inCar.position, FIREPASTTARGET_CAROFFSET),
					vec2.mul(this.inCar.direction, FIREPASTTARGET_RANGE)
				);
			} else {
				target = vec2.add(
					Z.player.position,
					vec2.mul(Z.player.direction, FIREPASTTARGET_RANGE)
				);
			}
		}
		if (this.attacking) {
			this.attack(target, firePastTarget);
		}
		
		// Cycle weapons
		if (controlPressed("lastweapon")) {
			this.weapon -= (this.weapon > 0) ? 1 : -this.weapons.length + 1;
		} else if (controlPressed("nextweapon")) {
			this.weapon += (this.weapon < this.weapons.length - 1) ? 1 : -this.weapon;
		}
		
		// Weapon shortcuts
		var start = 0;
		for (var k = 1; k < 10; k++) {
			if (Z.input.keyPressed(Keys["Num" + k])) {
				start = (k - 1) * 10;
				this.weapon = cycleWeapons(this.weapons, this.weapon, start, start + 9);
			}
		}
		
		// Reload weapon
		if (controlPressed("reload")) {
			this.weapons[this.weapon].reload();
		}
		
		// Use serum
		if (controlPressed("serum") && this.infected && this.inventory["serum"] > 0) {
			this.inventory["serum"]--;
			this.infect(false);
			Z.sound.play(this.useSerumSoundEffect);		// Play serum sound effect
		}
		
		// Activate/deactivate torch
		if (controlPressed("torch") && this.inventory["torch"] > 0) {
			Z.sound.play(this.torchActivated ?			// Play activate/deactivate sound effect
				Z.torch.deactivateSoundEffect : Z.torch.activateSoundEffect);
			this.nightVisionActivated = false;			// Torch/nightvision are mutually exclusive
			this.torchActivated = !this.torchActivated;
		}
		
		// Activate/deactivate nightvision
		if (controlPressed("nightvision") && this.inventory["nightvision"] > 0) {
			Z.sound.play(this.nightVisionActivated ?	// Play activate/deactivate sound effect
				Z.nightVision.deactivateSoundEffect : Z.nightVision.activateSoundEffect);
			this.torchActivated = false;				// Torch/nightvision are mutually exclusive
			this.nightVisionActivated = !this.nightVisionActivated;
		}
	};
	_player.infect = function(infected) {
		if (this.infected && !infected) {
			$("div.infection").removeClass("infected");
		}
		if (!this.infected && infected) {
			$("div.infection").addClass("infected");
		}
		this.infected = infected;
	};
	_player.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		this.nearLightSource = false;
		if (this.alive) {
			this.handleInput(elapsedTime);
			if (this.inCar) {
				this.inCar.handleInput(elapsedTime);
			}
			
			// Get current direction from move vector (if attacking, direction will already have
			// been set to attacking direction)
			if (!this.attacking && (this.moveVector.X || this.moveVector.Y)) {
				this.direction.X = (this.moveVector.X < 0) ? -1 : ((this.moveVector.X > 0) ? 1 : 0);
				this.direction.Y = (this.moveVector.Y < 0) ? -1 : ((this.moveVector.Y > 0) ? 1 : 0);
				if (!this.direction.X && !this.direction.Y) {
					this.direction = vec2(1, 0);
				}
			}
			this.moveVector = vec2.mul(this.moveVector, elapsedTime);
			
			// Make running noise if currently moving
			if (this.running && (this.moveVector.X || this.moveVector.Y) &&
				this.runningNoise && this.noiseTime <= 0) {
				var noise = Z.noise.create(
						vec2.add(this.position, vec2.div(this.size, 2)),
						this.runningNoise
					);
				Z.actorMap.push(noise);
				this.noiseTime = NOISE_DELAY;
			} else {
				this.noiseTime = Math.max(this.noiseTime - elapsedTime, 0);
			}
			
			// Update current weapon
			this.weapons[this.weapon].animation = "player";
			this.weapons[this.weapon].update(elapsedTime, this);
			
			// Sort weapons
			this.weapons.sort(function(a, b) { return a.index - b.index; });
			
			// Update torch (if player has one in inventory)
			if (this.inventory["torch"] > 0) {
				Z.torch.update(elapsedTime);
				if (this.torchActivated && Z.torch.batteryType && Z.torch.batteryRate) {
					if (this.inventory[Z.torch.batteryType] <= 0) {
						this.torchActivated = false;
						Z.sound.play(Z.torch.deactivateSoundEffect);
					} else {
						this.inventory[Z.torch.batteryType] -= Z.torch.batteryRate * elapsedTime;
					}
				}
			}
			
			// Update nightvision (if player has nightvision in inventory)
			if (this.inventory["nightvision"] > 0) {
				Z.nightVision.update(elapsedTime);
				if (this.nightVisionActivated &&
					Z.nightVision.batteryType &&
					Z.nightVision.batteryRate
				) {
					if (this.inventory[Z.nightVision.batteryType] <= 0) {
						this.nightVisionActivated = false;
						Z.sound.play(Z.nightVision.deactivateSoundEffect);
					} else {
						this.inventory[Z.nightVision.batteryType] -= Z.nightVision.batteryRate * elapsedTime;
					}
				}
			}
			
			// If infected, deplete health
			if (this.infected) {
				this.health -= (this.infectionRate * elapsedTime);
			}
			
			// Die if health reaches 0
			if (this.health <= 0) {
				this.alive = false;
				this.sprite.animation = "death";
			}
		} else {
			// Press space to restart game when player dies
			if (Z.input.keyPressed(Keys.Space)) {
				Z.game.restart();
			}
			
			// Join us...
			if (this.infected && !this.inCar && this.deadTime > ZOMBIE_DELAY && !this.gibbed) {
				this.type = "zombie";
				this.isZombie = true;
				this.sprite.animation = "walk";
				this.weapon = 0;
				this.direction = this.zombieWanderDirection;
				this.moveVector = vec2.mul(
					this.zombieWanderDirection,
					ZOMBIE_WANDER_SPEED * elapsedTime
				);
				
				// Change direction randomly every few seconds
				if (this.deadWanderTime <= 0) {
					this.zombieWanderDirection = Z.utilities.randomDirection();
					this.deadWanderTime = ZOMBIE_WANDER_TIME;
				}
				this.deadWanderTime -= elapsedTime;
			}
			this.deadTime += elapsedTime;
		}
		
		// Check if player was gibbed
		if (this.health <= this.gibAmount && !this.gibbed) {
			this.gibbed = true;
			this.type = "meatychunks";
			if (this.gibEffect) {
				var effect = Z.effect.createType(this.position, this.position, this.gibEffect);
				if (effect) {	// Make sure the effect type exists
					Z.actorMap.push(effect);
				}
			}
		}
		
		// Position player if currently driving a car
		if (this.inCar) {
			this.position = this.inCar.position;
		}
		
		// Update map position
		if (this.mapUpdateTime <= 0) {
			Z.ui.updateMapPopup(this.position);
			this.mapUpdateTime = MAP_UPDATE_TIME;
		} else {
			this.mapUpdateTime = Math.max(this.mapUpdateTime - elapsedTime, 0);
		}
	};
	_player.handleCollision = function(actor, mtv) {
		if (actor.type != "weaponSpread" &&
			actor.type != "noise" &&
			actor.type != "powerup" &&
			actor.type != "projectile") {
			base.handleCollision.call(this, actor, mtv);
		}
	};
	_player.attack = function(target, firePastTarget) {
		this.direction = Z.utilities.direction(this.position, target);
		this.weapons[this.weapon].fire(
			this.position,
			this.direction,
			this.size,
			target,
			firePastTarget,
			this.inCar
		);
		
		// If pushing, play push animation and reset to idle when finished
		if (this.weapon == 0 && this.sprite.animation != "push") {
			var p = this;
			this.sprite.animations["push"].finishedCallback = function() {
				p.sprite.animation = "idle";
			};
			this.sprite.animation = "push";
		}
	};
	_player.damage = function(position, type, amount) {
		if (Z.settings.godMode) { return; }
		if (type != Z.damageType.push) {
			amount = Math.abs(amount);
			if (this.armour > amount) {
				this.armour = Math.max(this.armour - amount, 0);
			} else if (this.armour > 0) {
				this.health -= (amount - this.armour);	// Health can drop below zero
				this.armour = 0;
			} else {
				this.health -= amount;
			}
			this.armour = Math.clamp(this.armour, 0, this.maxArmour);
		}
	};
	
	// Add an item to player inventory and return true, or return false if inventory is full
	_player.addInventory = function(type, amount) {
		if (this.inventory[type] && this.inventory[type] >= this.maxInventory[type]) {
			return false;
		}
		this.inventory[type] = Math.min(
			(this.inventory[type] || 0) + amount,
			this.maxInventory[type]
		);
		return true;
	};
	_player.draw = function(context) {
		if (this.gibbed) { return; }
		if (!this.inCar) {
			base.draw.call(this, context);
			if (this.alive || this.isZombie) {	// Draw nightvision even if player is a zombie
				if (this.inventory["nightvision"] > 0 && this.nightVisionActivated) {
					Z.nightVision.draw(context);
				}
			}
			if (this.alive) {
				if (this.weapon > 0) {	// Draw weapon
					this.weapons[this.weapon].sprite.draw(context, this.position, this.direction);
				}
				if (this.inventory["torch"] > 0 && this.torchActivated) {	// Draw torch
					Z.torch.draw(context);
					Z.torch.drawLightMap(Z.environment.lightMapContext);
				}
			}
		}
	};
	return _player;
}(Z.actor));