"use strict";
Z.zombieGenerator = (function() {
	var INITIAL_BORDER = 100,		// Initial zombie-free border around the player
		BORDER_SIZE = 300,			// Zombies will be created this far from the edge of the screen
		ACTOR_LIMIT = 200;			// The default actor limit
	
	var _zombieData = null,
		_initialWanderChance = 0,
		_initialDensity = 0,
		_cellTimeReset = 0,
		_cellTravelReduction = 0,
		_currentCell = vec2(),
		_timeInCell = 0,
		_biomes = [],
		_currentRate = { rate: 1 },
		_rateTime = 0,
		_currentTravelRate = { min: 0, max: 0 },
		_actorLimit = ACTOR_LIMIT,
		_createAmount = 0;
	
	// Add a zombie to the game world in a random location off the screen
	var createZombie = function() {
		if (!Z.settings.zombiesEnabled) { return; }
		var size = vec2(_zombieData.size),
			topLeft = Z.camera.bounds,
			bottomRight = vec2.add(Z.camera.bounds, Z.camera.size),
			tb = Z.player.moveVector.Y > 0 ?	// If player is moving, use move vector to decide
				true :							// which side of the screen to create zombies on
				(Z.player.moveVector.Y < 0 ? false : Math.random() >= 0.5),
			lr = Z.player.moveVector.X > 0 ?
				true :
				(Z.player.moveVector.X < 0 ? false : Math.random() >= 0.5),
			box = {
				left: lr ? bottomRight.X : topLeft.X - BORDER_SIZE,
				right: lr ? bottomRight.X + BORDER_SIZE : topLeft.X - size.X,
				top: tb ? bottomRight.Y : topLeft.Y - BORDER_SIZE,
				bottom: tb ? bottomRight.Y + BORDER_SIZE : topLeft.Y - size.Y
			},
			zombie = Z.zombie.create(
				vec2(
					box.left + (Math.random() * (box.right - box.left)),
					box.top + (Math.random() * (box.bottom - box.top))
				),
				Z.utilities.randomDirection(),
				Math.random() >= _initialWanderChance ?
					Z.zombieState.idle : Z.zombieState.wander,
				_zombieData
			);
		Z.actorMap.push(zombie);
	};
	
	return {
		initialise: function(width, height, generatorData, zombieData) {
			_initialWanderChance = generatorData.initialWanderChance || _initialWanderChance;
			_initialDensity = generatorData.initialDensity || _initialDensity;
			_cellTimeReset = generatorData.cellTimeReset || _cellTimeReset;
			_cellTravelReduction = generatorData.cellTravelReduction || _cellTravelReduction;
			_biomes = generatorData.biomes || [];
			_zombieData = zombieData;
			_currentCell = Z.utilities.cell(Z.player.position);
			_actorLimit = generatorData.actorLimit || _actorLimit;
			
			// Sort rates (highest time first)
			for (var i = _biomes.length; i--;) {
				_biomes[i].rates.sort(function(a, b) { return b.time - a.time; });
			}
			
			// Create zombies on initial screen area
			var topLeft = vec2.sub(Z.camera.position, vec2(width / 2, height / 2)),
				bottomRight = vec2.add(Z.camera.position, vec2(width, height)),
				initialBorder = {
					left: Z.player.position.X - INITIAL_BORDER / 2,
					right: Z.player.position.X + INITIAL_BORDER / 2,
					top: Z.player.position.Y - INITIAL_BORDER / 2,
					bottom: Z.player.position.Y + INITIAL_BORDER / 2
				},
				total = _initialDensity * (
					(Math.floor(width / Z.settings.cellSize) + 1) *
					(Math.floor(height / Z.settings.cellSize) + 1)
				);
			
			// Zombie initial density is per world cell
			if (Z.settings.zombiesEnabled) {
				for (var i = total; i--;) {
					var zombie = Z.zombie.create(
							vec2(
								topLeft.X + (Math.random() * (bottomRight.X - topLeft.X)),
								topLeft.Y + (Math.random() * (bottomRight.Y - topLeft.Y))
							),
							Z.utilities.randomDirection(),
							Math.random() >= _initialWanderChance ?
								Z.zombieState.idle : Z.zombieState.wander,
							_zombieData
						);
					if (!(zombie.position.X > initialBorder.left &&
						zombie.position.X < initialBorder.right &&
						zombie.position.Y > initialBorder.top &&
						zombie.position.Y < initialBorder.bottom)) {
						Z.actorMap.push(zombie);
					}
				}
			}
		},
		update: function(elapsedTime) {
			// If player is dead, don't create any more zombies
			if (!Z.player.alive) { return; }
			
			// Track player cell movement and modify time in cell accordingly
			var cell = Z.utilities.cell(Z.player.position);
			if (!vec2.eq(cell, _currentCell)) {
				_timeInCell = Math.max(_timeInCell - _cellTravelReduction, 0);
				_currentCell = cell;
			} else {
				_timeInCell += elapsedTime;
				if (_timeInCell >= _cellTimeReset) {
					_timeInCell = 0;
				}
			}
			
			// Create 1 zombie per frame
			if (_createAmount > 0) {
				createZombie();
				_createAmount--;
			}
			
			// Tick every 1 second or using current zombie refresh rate
			if (_currentRate && _currentRate.rate && _rateTime <= 0) {
				_currentTravelRate = _biomes[Z.viewArea.currentBiome].travelRate;
				
				// Create zombies without exceeding the actor limit (roughly)
				if (_currentRate.max && Z.actorMap.zombieCount < _actorLimit) {
					var amount = _currentRate.min + Math.floor(Math.random() *
							(_currentRate.max - _currentRate.min));
					
					// If the player is moving, add the travel rate
					if (_currentTravelRate.max &&
						(Z.player.moveVector.X || Z.player.moveVector.Y)) {
						amount += _currentTravelRate.min + Math.floor(Math.random() *
							(_currentTravelRate.max - _currentTravelRate.min));
					}
					_createAmount += amount;
				}
				
				// See if the next zombie rate is available
				var rates = _biomes[Z.viewArea.currentBiome].rates;
				for (var i = 0, length = rates.length; i < length; i++) {
					if (_timeInCell >= rates[i].time) {
						_currentRate = rates[i];
						break;
					}
				}
				_rateTime = _currentRate.rate;
			} else {
				_rateTime = Math.max(_rateTime - elapsedTime, 0);
			}
		}
	};
}());