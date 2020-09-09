"use strict";
Z.car = (function() {
	var CAR_BOUNCE_MAX = 1.5,
		CAR_BOUNCE_AMOUNT = 0.5,
		FRONTLEFT = 0,
		FRONTRIGHT = 1,
		BACKLEFT = 2,
		BACKRIGHT = 3,
		STEERING_SNAP = 0.01,
		MINIMUM_DAMAGE_SPEED = 2,
		GIB_DAMAGE_SPEED = 7,
		GIB_DAMAGE_MULTIPLIER = 10,
		FIRE_DAMAGE = 1.5,
		FIRE_RATE = 0.1,
		DAMAGEEFFECT_RATE = 0.1,
		NOISE_DELAY = 0.2,			// Delay between emitting driving noise in seconds
		SOUND_START = 0.2,			// TODO better seamless looping
		SOUND_DELAY = 0.5,			// Delay between playing engine sound effects
		SOUND_MAX_RATE = 4,
		SOUND_MIN_VOLUME = 0.7,
		SOUND_MAX_SPEED = 5,
		SKID_SOUND_DELAY = 0.6,
		SKID_SOUND_THRESHOLD = 0.8;
	
	// Return true if the main or alternate key mapping for a control is currently held down
	var controlDown = function(control) {
		return checkControl(control, Z.player.controls, Z.input.keyDown, Z.input.mouseDown);
	};
	
	// Return true if the main or alternate key mapping for a control has been pressed
	var controlPressed = function(control) {
		return checkControl(control, Z.player.controls, Z.input.keyPressed, Z.input.mouseClicked);
	};
	
	// Check if a main or alternative control mapping has been activated/is currently activated
	//	c:	The list of controls
	//	k:	A function for checking keyboard input
	//	m:	A function for checking mouse input
	var checkControl = function(control, c, k, m) {
		if (c[control]) {
			return (
				k(c[control][0]) || m(c[control][0]) || mouseWheel(c[control][0]) ||
				(c[control].length > 1 && c[control][1] && (
					k(c[control][1]) || m(c[control][1]) || mouseWheel(c[control][1])
				))
			);
		}
		return false;
	};
	
	// Return true if the mouse wheel was scrolled this frame and it matches the specified control
	var mouseWheel = function(control) {
		return (Z.input.mouseWheel > 0 && control == 4) || (Z.input.mouseWheel < 0 && control == 5);
	};
	
	var castHeadlightRay = function(position, origin, direction, range) {
		var result = null,
			target = vec2.add(origin, vec2.mul(direction, range));
		
		// Check maximum torch range
		var v = vec2.sub(origin, target),
			length = vec2.len(v);
		if (range > 0 && length > range) {
			v = vec2.mul(vec2.div(v, length), -range);
			target = vec2.add(origin, v);
		}
		return Z.collision.castRay(origin, target, function(a) {
			return (a.type == "car" && vec2.eq(position, a.position));
		});
	};
	
	return {
		type: "car",
		name: "",
		carType: "",
		position: vec2(),
		direction: vec2(1, 0),
		moveVector: vec2(),
		size: vec2(),
		sprite: null,
		speed: 0,
		throttle: 0,
		brake: 0,
		handbrake: 0,
		steering: 0,
		wheels: [],
		wheelOffsets: [],
		wheelBase: 0,
		wheelSize: vec2(),
		enginePower: 0,
		reversePower: 0,
		steeringSpeed: 0,
		maxSteeringAngle: 0,
		tireGrip: 0,
		tireDrag: 0,
		slipSpeedOffset: 0,
		slipCurve: 0,
		maxHealth: 0,
		maxArmour: 0,
		fuelType: "",
		fuelRate: 0,
		fuelAmount: 0,
		engineNoise: 0,
		noiseTime: 0,
		skidColour: "",
		collisionDamageAmount: 0,
		zombieSkidColour: "",
		zombieSkidLength: 0,
		zombieDamageAmount: 0,
		playerVisible: false,
		doorPositions: [],
		windowPositions: [],
		playerDriving: false,
		fireEffect: null,
		onFire: false,
		fireTime: 0,			// Timer for the fire effect
		fireHealthAmount: 0,
		damageEffect: null,
		damaged: false,
		damageEffectTime: 0,	// Timer for the damaged effect (smoke)
		damageEnginePower: 0,
		damageReversePower: 0,
		damageHealthAmount: 0,
		destroyed: false,
		destroyedEvent: null,
		headlights: false,
		headlightsEnabled: false,
		headlightPositions: [],
		headlightOriginPositions: [],
		headlightTargetPositions: [],
		headlightRange: 0,
		headlightSpread: 0,
		headlightAmount: 0,
		fuelPickupEffect: null,
		engineSoundEffect: "",
		damagedSoundEffect: "",
		collisionSoundEffect: "",
		skidSoundEffect: "",
		engineSoundEffectTime: 0,
		skidSoundEffectTime: 0,
		collide: true,			// True if this actor can collide with other actors
		dispose: false,			// True if this actor should be removed next frame
		zIndex: -1,				// Draw cars below other actors
		create: function(position, direction, health, fuelAmount, data) {
			var c = Object.create(this);
			c.name = data.name || c.name;
			c.carType = data.carType || c.carType;
			c.position = position;
			c.direction = vec2.norm(direction);
			c.size = vec2(data.size);
			c.sprite = Z.carSpriteGenerator.getSprite(c.carType, data.sprite);
			c.sprite.animation = "world";
			c.wheelBase = vec2(data.wheelBase);
			c.wheelSize = vec2(data.wheelSize);
			c.enginePower = data.enginePower || c.enginePower;
			c.reversePower = data.reversePower || c.reversePower;
			c.steeringSpeed = data.steeringSpeed || c.steeringSpeed;
			c.maxSteeringAngle = data.maxSteeringAngle || c.maxSteeringAngle;
			c.tireGrip = data.tireGrip || c.tireGrip;
			c.tireDrag = data.tireDrag || c.tireDrag;
			c.slipSpeedOffset = data.slipSpeedOffset || c.slipSpeedOffset;
			c.slipCurve = data.slipCurve || c.slipCurve;
			c.maxHealth = data.maxHealth || c.maxHealth;
			c.maxArmour = data.maxArmour || c.maxArmour;
			c.health = health < 0 ? c.maxHealth : health;	// -1 for full health
			c.fuelAmount = fuelAmount;
			c.fuelType = data.fuelType || c.fuelType;
			c.fuelRate = data.fuelRate || c.fuelRate;
			c.engineNoise = data.engineNoise || c.engineNoise;
			c.skidColour = data.skidColour || c.skidColour;
			c.collisionDamageAmount = data.collisionDamageAmount || c.collisionDamageAmount;
			c.zombieSkidColour = data.zombieSkidColour || c.zombieSkidColour;
			c.zombieSkidLength = data.zombieSkidLength || c.zombieSkidLength;
			c.zombieDamageAmount = data.zombieDamageAmount || c.zombieDamageAmount;
			c.playerVisible = data.playerVisible || c.playerVisible;
			c.dispose = false;
			
			// Door/window positions
			var doorPositions = [];
			for (var i = 0, length = data.doorPositions.length; i < length; i++) {
				doorPositions.push(vec2(data.doorPositions[i]));
			}
			c.doorPositions = doorPositions;
			var windowPositions = [];
			for (var i = 0, length = data.windowPositions.length; i < length; i++) {
				windowPositions.push(vec2(data.windowPositions[i]));
			}
			c.windowPositions = windowPositions;
			c.fireEffect = data.fireEffect || null;
			c.damageEffect = data.damageEffect || null;
			c.damageEnginePower = data.damageEnginePower || c.damageEnginePower;
			c.damageReversePower = data.damageReversePower || c.damageReversePower;
			c.damageHealthAmount = data.damageHealthAmount || c.damageHealthAmount;
			c.fireHealthAmount = data.fireHealthAmount || c.fireHealthAmount;
			c.destroyed = (c.health <= 0);
			if (c.destroyed) {
				c.sprite.animation = "destroyed";
			}
			c.destroyedEvent = data.destroyedEvent || null;
			c.headlightsEnabled = !!data.headlightsEnabled;
			c.headlightPositions = data.headlightPositions || c.headlightPositions;
			c.headlightRange = data.headlightRange || c.headlightRange;
			c.headlightSpread = data.headlightSpread || c.headlightSpread;
			c.headlightAmount = data.headlightAmount || c.headlightAmount;
			c.fuelPickupEffect = data.fuelPickupEffect || null;
			c.engineSoundEffect = data.engineSoundEffect || c.engineSoundEffect;
			c.damagedSoundEffect = data.damagedSoundEffect || c.damagedSoundEffect;
			c.collisionSoundEffect = data.collisionSoundEffect || c.collisionSoundEffect;
			c.skidSoundEffect = data.skidSoundEffect || c.skidSoundEffect;
			
			// Create wheels
			var wheelOffsets = [],
				wheels = [];
			wheelOffsets[FRONTLEFT] = vec2(c.wheelBase.X, -c.wheelBase.Y);
			wheelOffsets[FRONTRIGHT] = c.wheelBase;
			wheelOffsets[BACKLEFT] = vec2(-c.wheelBase.X, -c.wheelBase.Y);
			wheelOffsets[BACKRIGHT] = vec2(-c.wheelBase.X, c.wheelBase.Y);
			wheels[FRONTLEFT] = Z.wheel.create(c, wheelOffsets[FRONTLEFT]);
			wheels[FRONTRIGHT] = Z.wheel.create(c, wheelOffsets[FRONTRIGHT]);
			wheels[BACKLEFT] = Z.wheel.create(c, wheelOffsets[BACKLEFT]);
			wheels[BACKRIGHT] = Z.wheel.create(c, wheelOffsets[BACKRIGHT]);
			c.wheelOffsets = wheelOffsets;
			c.wheels = wheels;
			return c;
		},
		handleInput: function(elapsedTime) {
			if (this.destroyed) { return; }
			
			// Handbrake
			this.handbrake = controlDown("handbrake") + 0;
			
			// Throttle/brake/reverse
			if (!this.handbrake &&
				(!this.fuelType || Z.settings.infiniteAmmo ||Z.player.inventory[this.fuelType] > 0)) {
				if (controlDown("up")) {
					this.throttle = 1;
				} else if (controlDown("down")) {
					this.throttle = -1;
				}
				if (this.throttle && this.fuelType) {
					Z.player.inventory[this.fuelType] -= this.fuelRate * elapsedTime;
				}
			}
			
			// Steering
			var steeringAmount = this.steeringSpeed * elapsedTime;
			if (controlDown("left")) {
				this.steering -= steeringAmount;
			} else if (controlDown("right")) {
				this.steering += steeringAmount;
			} else if (this.steering) {
				this.steering += (this.steering < 0 ? steeringAmount : -steeringAmount);
			}
			this.steering = Math.clamp(this.steering, -1, 1);
			if (Math.abs(this.steering) < STEERING_SNAP) { this.steering = 0; }
			
			// Headlights
			if (controlPressed("headlights")) {
				this.headlights = !this.headlights;
			}
		},
		update: function(elapsedTime) {
			// Update wheels
			var engine = this.damaged ? this.damageEnginePower : this.enginePower,
				reverse = this.damaged ? this.damageReversePower : this.reversePower,
				drive = this.throttle * (this.throttle > 0 ? engine : reverse),
				steering = vec2.rot(this.direction, Math.radians(this.steering * this.maxSteeringAngle));
			this.wheels[FRONTLEFT].update(drive, this.handbrake, steering, elapsedTime);
			this.wheels[FRONTRIGHT].update(drive, this.handbrake, steering, elapsedTime);
			this.wheels[BACKLEFT].update(drive, this.handbrake, this.direction, elapsedTime);
			this.wheels[BACKRIGHT].update(drive, this.handbrake, this.direction, elapsedTime);
			
			// Calculate new car position and direction from new wheel positions
			var p1 = this.wheels[FRONTLEFT].position,
				p2 = this.wheels[FRONTRIGHT].position,
				p3 = this.wheels[BACKLEFT].position,
				p4 = this.wheels[BACKRIGHT].position,
				newPosition = vec2.div(vec2.add(vec2.add(vec2.add(p1, p2), p3), p4), 4),
				newDirection = vec2.norm(vec2.sub(p2, p4));
			this.speed = vec2.len(vec2.sub(newPosition, this.position));
			this.position = newPosition;
			this.direction = newDirection;
			
			// Constrain wheels to new car position
			var r = vec2.rad(this.direction);
			steering = vec2.rot(this.direction, Math.radians(this.steering * this.maxSteeringAngle));
			this.wheels[FRONTLEFT].position = vec2.add(this.position, vec2.rot(this.wheelOffsets[FRONTLEFT], r));
			this.wheels[FRONTLEFT].direction = steering;
			this.wheels[FRONTRIGHT].position = vec2.add(this.position, vec2.rot(this.wheelOffsets[FRONTRIGHT], r));
			this.wheels[FRONTRIGHT].direction = steering;
			this.wheels[BACKLEFT].position = vec2.add(this.position, vec2.rot(this.wheelOffsets[BACKLEFT], r));
			this.wheels[BACKLEFT].direction = this.direction;
			this.wheels[BACKRIGHT].position = vec2.add(this.position, vec2.rot(this.wheelOffsets[BACKRIGHT], r));
			this.wheels[BACKRIGHT].direction = this.direction;
			
			// Reset controls
			this.throttle = 0;
			this.handbrake = false;
			
			// Headlights
			if (this.headlightsEnabled && this.headlights) {
				this.headlightOriginPositions = [];
				this.headlightTargetPositions = [];
				for (var i = this.headlightPositions.length; i--;) {
					var origin = vec2.add(this.position, vec2.rot(vec2(this.headlightPositions[i]), r)),
						target = castHeadlightRay(this.position, origin, this.direction, this.headlightRange);
					this.headlightOriginPositions.push(origin);
					this.headlightTargetPositions.push(target.position);
				}
			}
			
			// Make engine noise if player is currently driving
			if (this.playerDriving && this.engineNoise && this.noiseTime <= 0) {
				var noise = Z.noise.create(
						vec2.add(this.position, vec2.div(this.size, 2)),
						this.engineNoise
					);
				Z.actorMap.push(noise);
				this.noiseTime = NOISE_DELAY;
			} else {
				this.noiseTime = Math.max(this.noiseTime - elapsedTime, 0);
			}
			
			// Play sound effects if player is currently driving
			if (this.playerDriving) {
				// Engine sound
				if (Z.player.inventory[this.fuelType] > 0 && this.engineSoundEffectTime <= 0) {
					var sound = Z.sound.sounds[this.damaged ? this.damagedSoundEffect : this.engineSoundEffect],
						n = Math.min(SOUND_MAX_SPEED, this.speed) / SOUND_MAX_SPEED;
					if (sound) {
						sound.playbackRate = Math.lerp(1, SOUND_MAX_RATE, n);
						sound.volume = Math.lerp(SOUND_MIN_VOLUME, 1, n);
						sound.currentTime = SOUND_START;
						sound.play();
					}
					this.engineSoundEffectTime = SOUND_DELAY;
				} else {
					this.engineSoundEffectTime = Math.max(this.engineSoundEffectTime - elapsedTime, 0);
				}
				
				// Skid sound
				if (this.wheels[0].slip >= SKID_SOUND_THRESHOLD && this.skidSoundEffectTime <= 0) {
					Z.sound.play(this.skidSoundEffect, this.position, true);
					this.skidSoundEffectTime = SKID_SOUND_DELAY;
				} else {
					this.skidSoundEffectTime = Math.max(this.skidSoundEffectTime - elapsedTime, 0);
				}
			}
			
			// Check if the car is damaged
			if (this.damaged && this.damageEffectTime <= 0) {
				this.damageEffectTime = DAMAGEEFFECT_RATE;
				
				// Create damage effect
				if (this.damageEffect) {
					var effect = Z.effect.createType(this.position, this.position, this.damageEffect);
					if (effect) {	// Make sure the effect type exists
						Z.actorMap.push(effect);
					}
				}
			} else {
				this.damageEffectTime = Math.max(this.damageEffectTime - elapsedTime, 0);
			}
			
			// Check if the car is on fire
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
			
			// Update sprite
			this.sprite.update(elapsedTime);
		},
		handleCollision: function(actor, mtv) {
			if (actor.type == "building" || actor.type == "car") {	// Apply damage to car
				if (this.speed > MINIMUM_DAMAGE_SPEED) {
					this.damage(
						this.position,
						Z.damageType.head,
						this.collisionDamageAmount * this.speed);
					
					// Play collision sound effect
					Z.sound.play(this.collisionSoundEffect, this.position, true);
				}
				
				// Move wheels and recalculate velocity for next frame (so car bounces and loses
				// some energy when hitting obstacles)
				if (!this.playerDriving) { mtv = vec2.mul(mtv, 2); }
				this.wheels[FRONTLEFT].position = vec2.sub(this.wheels[FRONTLEFT].position, mtv);
				this.wheels[FRONTRIGHT].position = vec2.sub(this.wheels[FRONTRIGHT].position, mtv);
				this.wheels[BACKLEFT].position = vec2.sub(this.wheels[BACKLEFT].position, mtv);
				this.wheels[BACKRIGHT].position = vec2.sub(this.wheels[BACKRIGHT].position, mtv);
				var v = vec2.mul(mtv, -1 * CAR_BOUNCE_AMOUNT);		// Limit the bounce amount
				if (vec2.len(v) > CAR_BOUNCE_MAX) {
					v = vec2.mul(vec2.norm(v), CAR_BOUNCE_MAX);
				}
				this.wheels[FRONTLEFT].velocity = v;
				this.wheels[FRONTRIGHT].velocity = v;
				this.wheels[BACKLEFT].velocity = v;
				this.wheels[BACKRIGHT].velocity = v;
			} else if (actor.type == "zombie") {					// Apply damage to zombies
				if (this.speed > MINIMUM_DAMAGE_SPEED) {
					var damage = this.zombieDamageAmount * this.speed;
					actor.damage(
						this.position,
						this.speed > GIB_DAMAGE_SPEED ? Z.damageType.head : Z.damageType.body,
						this.speed > GIB_DAMAGE_SPEED ? damage * GIB_DAMAGE_MULTIPLIER : damage
					);
					
					// Update skid effect if a zombie was killed
					if (actor.headHealth <= 0) {
						var closestWheel = null,
							minDelta = Infinity,
							delta = 0;
						
						// Find closest wheel
						for (var i = this.wheels.length; i--;) {
							delta = vec2.len(vec2.sub(		// Distance between wheel position
								this.wheels[i].position,	// (centered) and zombie center (topleft)
								vec2.add(actor.position, vec2.div(actor.size, 2))
							));
							if (delta < minDelta) {
								minDelta = delta;
								closestWheel = i;
							}
						}
						this.wheels[closestWheel].zombieSkidCounter = this.zombieSkidLength;
					}
				}
			}
		},
		damage: function(position, type, amount) {
			if (this.destroyed) { return; }					// Car is already destroyed
			this.health -= amount;
			if (this.health <= this.damageHealthAmount && this.health > 0) {	// Car is damaged
				this.damaged = true;
			}
			if (this.health <= this.fireHealthAmount && this.health > 0) {		// Car is on fire
				this.onFire = true;
			}
			if (this.health <= 0) {		// Car has been destroyed
				this.destroyed = true;
				this.sprite.animation = "destroyed";
				this.headlightsEnabled = false;
				this.damaged = false;
				this.onFire = false;
				if (this.destroyedEvent) {
					// Create weapon spread to deal damage to actors in range
					if (this.destroyedEvent.spread) {
						var spread = Z.weaponSpread.create(
								this.position,
								this.destroyedEvent.spread,
								this.destroyedEvent.damagePlayer,
								this.destroyedEvent.damageType,
								this.destroyedEvent.damageAmount
							);
						Z.actorMap.push(spread);
					}
					
					// If player is currently driving this car, deal damage to the player
					if (this.playerDriving) {
						Z.player.damage(this.position, Z.damageType.head, this.destroyedEvent.damageAmount);
					}
					
					// Create hit effect
					if (this.destroyedEvent.effect) {
						var effect = Z.effect.createType(this.position, this.position, this.destroyedEvent.effect);
						if (effect) {	// Make sure the effect type exists (createType will return null)
							Z.actorMap.push(effect);
						}
					}
					
					// Make noise
					if (this.destroyedEvent.noise) {
						Z.actorMap.push(Z.noise.create(this.position, this.destroyedEvent.noise));
					}
				}
			}
		},
		draw: function(context) {
			// Wheels
			for (var i = this.wheels.length; i--;) {
				this.wheels[i].draw(context);
			}
			this.sprite.draw(context, this.position, this.direction);
			
			// Headlights
			if (this.headlightsEnabled && this.headlights) {
				this.drawLightMap(Z.environment.lightMapContext);
			}
			
			// Show collision bounding box outline if setting is enabled
			if (Z.settings.showCollisionBox) {
				context.save();
				context.strokeStyle = "#0f0";
				context.translate(this.position.X, this.position.Y);
				context.rotate(vec2.rad(this.direction));
				context.strokeRect(-this.size.X / 2, -this.size.Y / 2, this.size.X, this.size.Y);
				context.restore();
			}
		},
		drawLightMap: function(context) {
			if (!Z.settings.dayCycleEnabled) { return; }
			context.save();
			context.globalCompositeOperation = "xor";
			context.globalAlpha = this.headlightAmount * Z.environment.getLightLevel();
			
			// Draw light beams for each headlight
			var image = Z.content.items["headlight"];
			for (var i = this.headlightOriginPositions.length; i--;) {
				var delta = vec2.sub(this.headlightTargetPositions[i], this.headlightOriginPositions[i]),
					angle = vec2.rad(delta),
					distance = vec2.len(delta);
				context.save();
				context.translate(this.headlightOriginPositions[i].X, this.headlightOriginPositions[i].Y);
				context.rotate(angle);
				context.drawImage(	
					image,
					0, 0,
					image.width, image.height,
					0, -(image.height / 2),
					distance, image.height
				);
				context.restore();
			
				// Draw light spread
				context.save();
				context.globalCompositeOperation = "xor";
				context.translate(this.headlightTargetPositions[i].X, this.headlightTargetPositions[i].Y);
				var gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.headlightSpread / 2);
				gradient.addColorStop(0, "white");
				gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
				context.fillStyle = gradient;
				context.beginPath();
				context.arc(0, 0, this.headlightSpread / 2, 0, Math.PI * 2, false);
				context.closePath();
				context.fill();
				context.restore();
			}
			context.restore();
		}
	};
}());

Z.wheel = (function() {
	var SKID_ALPHA = 0.25,
		SKID_SPEED_THRESHOLD = 1,
		SKID_HANDBRAKE_AMOUNT = 0.2,
		SKID_AMOUNT_MULTIPLIER = 3.65,
		SKID_FADE_TIME = 0.5;
	
	// Calculate slip curve based on the current speed and slip amount (difference between current
	// wheel direction and velocity direction)
	var slip = function(grip, drag, speed, slipSpeedOffset, slipAmount, slipCurve) {
		return Math.lerp(
			grip,
			drag,
			Math.clamp(Math.pow(Math.max(speed - slipSpeedOffset, 0) * slipAmount, slipCurve))
		);
	};
	
	return {
		position: vec2(),
		direction: vec2(1, 0),
		size: vec2(),
		velocity: vec2(),
		speed: 0,
		slip: 0,
		tireGrip: 0,
		tireDrag: 0,
		slipSpeedOffset: 0,
		slipCurve: 0,
		skidColour: "",
		zombieSkidColour: "",
		zombieSkidLength: 0,
		zombieSkidCounter: 0,
		sprite: null,
		create: function(car, offset) {
			var w = Object.create(this),
				o = vec2.rot(offset, vec2.rad(car.direction));
			w.position = vec2.add(car.position, o);
			w.direction = car.direction;
			w.size = car.wheelSize;
			w.tireGrip = car.tireGrip;
			w.tireDrag = car.tireDrag;
			w.slipSpeedOffset = car.slipSpeedOffset;
			w.slipCurve = car.slipCurve;
			w.skidColour = car.skidColour;
			w.zombieSkidColour = car.zombieSkidColour;
			w.zombieSkidLength = car.zombieSkidLength;
			w.zombieSkidCounter = 0;
			w.sprite = car.sprite;
			return w;
		},
		update: function(drive, handbrake, direction, elapsedTime) {
			this.direction = direction;
			this.velocity = vec2.add(this.velocity, vec2.mul(this.direction, drive * elapsedTime));
			
			// Transform velocity local to tire direction
			var r = vec2.rad(this.direction),
				v = vec2.rot(this.velocity, -r),
				d = Math.abs(vec2.dot(this.direction, vec2.norm(this.velocity))),
				s = slip(this.tireGrip, this.tireDrag, this.speed, this.slipSpeedOffset, 1 - d, this.slipCurve);
			
			// Apply lateral and longitudinal grip to tire (if handbrake is active, use lateral
			// grip for both components)
			v.X *= handbrake ? s : this.tireDrag;
			v.Y *= s;
			
			// Rotate velocity back to world space
			this.velocity = vec2.rot(v, r);
			this.speed = vec2.len(this.velocity);
			
			// Calculate skid mark amount
			this.slip = handbrake ?
				Math.clamp(this.speed * SKID_HANDBRAKE_AMOUNT) :
				Math.clamp(this.speed > SKID_SPEED_THRESHOLD ? ((1 - d) * SKID_AMOUNT_MULTIPLIER) : 0);
			this.position = vec2.add(this.position, this.velocity);
			if (this.zombieSkidCounter > 0) {
				this.zombieSkidCounter -= elapsedTime;
			}
		},
		draw: function(context) {
			var current = this.sprite.animation;
			this.sprite.animation = "wheel";
			this.sprite.draw(context, this.position, this.direction);
			this.sprite.animation = current;
			
			// Draw skid mark decals
			if (this.slip * SKID_ALPHA > 0.05) {
				var skidColour = this.skidColour;
				if (this.zombieSkidCounter > 0) {
					skidColour = Math.lerp(
						skidColour,
						this.zombieSkidColour,
						Math.clamp(this.zombieSkidCounter / SKID_FADE_TIME)
					);
				}
				Z.actorMap.push(Z.skidEffect.create(
					this.position,
					this.slip * SKID_ALPHA,
					Z.utilities.arrayToColour(skidColour),
					this.velocity
				));
			}
		}
	};
}());