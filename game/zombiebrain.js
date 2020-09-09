"use strict";
Z.zombieBrain = (function() {
	var OBSTACLE_DISTANCE = 20,	// Avoid obstacles at this distance around the zombie
		IDLE_DISTANCE = 50,		// Switch back to idle/wander when target + IDLE_DISTANCE is reached
		VISIBLE_DISTANCE = 60,	// Zombies can see player in the dark within this range
		DIR_FORWARD = 0,
		DIR_LEFT = 1,
		DIR_RIGHT = 2,
		DIR_BACKWARD = 3;
	
	// Return true if there is an obstacle in front of, next to or behind the zombie
	var checkObstacle = function(position, size, direction, turnDirection) {
		var p = vec2.add(position, vec2.div(size, 2)),
			d = turn(direction, turnDirection),
			s = Math.max(size.X, size.Y) / 2,
			p1 = null,
			p2 = null,
			ignore = function(a) {
				return !(a.type == "car" && a.playerDriving);
			};
		
		// Check 2 points offset from zombie position (for checking min/max bounds)
		p1 = vec2.sub(p, vec2.mul(turn(d, DIR_LEFT), s));
		p2 = vec2.sub(p, vec2.mul(turn(d, DIR_RIGHT), s));
		return (
			Z.collision.checkPoint(vec2.add(p1, vec2.mul(d, OBSTACLE_DISTANCE)), ignore) ||
			Z.collision.checkPoint(vec2.add(p2, vec2.mul(d, OBSTACLE_DISTANCE)), ignore)
		);
	};
	
	// Rotate a vector by the specified direction (either left, right or backwards)
	var turn = function(v, direction) {
		if (direction == DIR_LEFT) {		return vec2(v.Y, -v.X); }
		if (direction == DIR_RIGHT) {		return vec2(-v.Y, v.X); }
		if (direction == DIR_BACKWARD) {	return vec2.mul(v, -1); }
		return v;
	};
		
	return {
		state: 0,
		zombie: null,
		moveVector: vec2(),
		direction: vec2(),
		attack: false,
		target: null,
		idleTime: 0,
		animation: "idle",
		lastUpdateTime: 0,
		create: function(zombie, state) {
			var z = Object.create(this);
			z.zombie = zombie;
			z.state = state;
			return z;
		},
		alert: function(position) {
			if (this.state != Z.zombieState.excited) {
				this.state = Z.zombieState.alerted;
				this.target = position;
				this.idleTime = Math.random() * this.zombie.idleTime;
			}
		},
		update: function(elapsedTime) {
			if (!Z.settings.zombieAIEnabled) { return; }
			var z = this.zombie;
			
			// Check brain update rate timer
			this.lastUpdateTime = Math.max(this.lastUpdateTime - elapsedTime, 0);
			if (this.lastUpdateTime > 0) {	// Waiting for next update, so return for now
				return;
			} else {						// Do update and set next update time based on state
				this.lastUpdateTime = z.brainUpdateRate[this.state];
			}
			
			// Set state, move vector and direction
			if (z.dead || z.fallen) {								// Zombie is dead/fallen over
				this.moveVector = vec2();
				this.direction = z.direction;
			} else {
				// Only check line of sight if the zombie is facing the right direction - if zombie
				// has los to the player, transition to excited state.
				var zCenter = vec2.add(z.position, vec2.div(z.size, 2)),
					pCenter = vec2.add(Z.player.position, vec2.div(Z.player.size, 2)),
					los = false;
				
				// Vectors not normalized so only approx dot product, but good enough
				// Note: if environment light level is lower than a certain amount, zombies can only
				// see player if the torch is activated or if player is within a certain range of the
				// zombie or a light source
				if (vec2.dot(z.direction, Z.utilities.direction(zCenter, pCenter)) >= 0) {
					var result = Z.collision.castRay(zCenter, pCenter, function(a) {
						return (a.type == "zombie");
					});
					if (result.actor && 
						result.actor.type == "player" &&
						!result.actor.isZombie &&
						(!result.actor.inCar || result.actor.inCar.playerVisible) &&
						(
							Z.environment.lightLevel > z.lightLevel ||
							Z.player.torchActivated ||
							Z.player.nearLightSource ||
							vec2.len(vec2.sub(Z.player.position, z.position)) <= VISIBLE_DISTANCE
						)
					) {
						this.state = Z.zombieState.excited;
						this.speed = z.runSpeed;
						los = true;
					}
				}
				
				// If zombie is excited but los is lost, go back to alerted state and follow
				// last known player position
				if (!los && this.state == Z.zombieState.excited) {
					this.state = Z.zombieState.alerted;
					this.target = vec2(Z.player.position.X, Z.player.position.Y);
					this.idleTime = Math.random() * this.zombie.idleTime;
				}
				
				// Check current AI state
				this.idleTime = Math.max(this.idleTime - elapsedTime, 0);
				if (this.state == Z.zombieState.idle) {				// Idle state
					// Stand still facing the current direction
					this.target = null;
					this.moveVector = vec2();
					this.direction = z.direction;
					this.animation = "idle";
				} else if (this.state == Z.zombieState.wander) {	// Wandering state
					// Walk in the current direction
					this.target = null;
					this.moveVector = z.direction;
					this.direction = z.direction;
					this.speed = this.zombie.walkSpeed;
					this.animation = "walk";
				} else if (this.state == Z.zombieState.alerted) {	// Alerted state
					// Walk towards the target position
					var direction = Z.utilities.direction(z.position, this.target);
					this.moveVector = direction;
					this.direction = direction;
					this.speed = this.zombie.walkSpeed;
					this.animation = "walk";
					
					// If target position has been reached or if idle timeout has been reached,
					// switch back to random wander or idle state
					var tl = vec2.sub(this.target, IDLE_DISTANCE),
						br = vec2.add(this.target, IDLE_DISTANCE);
					if (this.idleTime <= 0 ||
						(z.position.X > tl.X && z.position.X < br.X &&
						z.position.Y > tl.Y && z.position.Y < br.Y)) {
						this.state = Math.random() > 0.5 ?
							Z.zombieState.idle : Z.zombieState.wander;
					}
				} else if (this.state == Z.zombieState.excited) {	// Excited state
					// Walk towards the player's current position
					var direction = Z.utilities.direction(z.position, Z.player.position);
					this.moveVector = direction;
					this.direction = direction;
					this.speed = this.zombie.runSpeed;
					this.animation = "run";
				}
				
				// If zombie cannot move forward, check left and right (in random order) then
				// check backwards, otherwise stop and face a random direction
				if (this.moveVector.X || this.moveVector.Y) {
					if (checkObstacle(z.position, z.size, z.direction, DIR_FORWARD)) {
						var directions = [DIR_LEFT, DIR_RIGHT];
						directions.shuffle();
						if (!checkObstacle(z.position, z.size, z.direction, directions[0])) {
							this.moveVector = turn(this.moveVector, directions[0]);
							this.direction = this.moveVector;
						} else if (!checkObstacle(z.position, z.size, z.direction, directions[1])) {
							this.moveVector = turn(this.moveVector, directions[1]);
							this.direction = this.moveVector;
						} else if (!checkObstacle(z.position, z.size, z.direction, DIR_BACKWARD)) {
							this.moveVector = turn(this.moveVector, DIR_BACKWARD);
							this.direction = this.moveVector;
						} else {
							this.moveVector = vec2();
							this.direction = Z.utilities.randomDirection();
							this.animation = "idle";
						}
					}
				}
				
				// If zombie is within attack range of player and has line of sight, stop movement
				// and attack player
				var tl = vec2.sub(Z.player.position, z.weapons[0].maxRange),
					br = vec2.add(Z.player.position, z.weapons[0].maxRange);
				if (los &&
					z.position.X > tl.X && z.position.X < br.X &&
					z.position.Y > tl.Y && z.position.Y < br.Y) {
					var direction = Z.utilities.direction(z.position, Z.player.position);
					this.moveVector = vec2();
					this.direction = direction;
					this.attack = true;
				} else {
					this.attack = false;
				}
			}
		}
	};
}());