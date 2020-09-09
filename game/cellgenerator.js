"use strict";
Z.cellGenerator = (function() {
	var _worker = null,
		_waiting = [],
		_waitingCount = 0,
		_images = [],
		_buildingSpriteData = null,
		_treeSpriteData = null,
		_treeDensity = 0,
		_treeSize = vec2();
	
	return {
		seed: "",
		waiting: false,
		initialise: function(worldData, buildingSpriteData, treeSpriteData, restart) {
			// If no seed is defined in world data, generate one
			if (!worldData.seed) {
				worldData.seed = ((Math.random() * 100000) + "").substr(0, 5);
			}
			this.seed = worldData.seed;
			_buildingSpriteData = buildingSpriteData;
			_treeSpriteData = treeSpriteData;
			_treeSize = vec2(worldData.treeSize);
			
			// Initialise worker thread
			if (!restart) {
				_worker = new Worker("game/cellgeneratorworker.js");
				_worker.addEventListener("message", function(e) {
					if (e.data.cellData && e.data.position) {
						var hash = Z.utilities.hash(e.data.position);
						if (_waiting[hash]) {
							_waiting[hash](e.data.cellData);
							_waitingCount--;
							Z.cellGenerator.waiting = !!_waitingCount;
						}
					}
				}, false);
				
				// Copy initialisation data to worker thread
				worldData.command = "initialise";
				worldData.cellSize = Z.settings.cellSize;
				_worker.postMessage(worldData);
			}
		},
		loadData: function(callback, path, data) {
			Z.utilities.loadData(function(generatorData) {
				// Count images to load
				var loadCount = 0;
				for (var i in generatorData.imagePaths) {
					if (!generatorData.imagePaths.hasOwnProperty(i)) { continue; }
					loadCount++;
				}
				
				// Load images
				for (var i in generatorData.imagePaths) {
					if (!generatorData.imagePaths.hasOwnProperty(i)) { continue; }
					(function(j) {
						Z.utilities.loadImage(function(image) {
							_images[j] = image;
							if (--loadCount <= 0) {
								callback(generatorData);
							}
						}, generatorData.imagePaths[i]);
					}(i));
				}
			}, path, data);
		},
		getCell: function(position) {
			var cell = Z.cell.create(position),
				hash = Z.utilities.hash(position);
			_worker.postMessage({ command: "generate", position: position });
			_waiting[hash] = function(cellData) {
				Z.cellGenerator.renderCell(cell, cellData);
			};
			_waitingCount++;
			this.waiting = !!_waitingCount;
			return cell;
		},
		renderCell: function(cell, data) {
			cell.biome = data.biome;
			
			// Draw background
			var bg = (cell.biome == Z.biomes.city || cell.biome == Z.biomes.industrial) ?
					"citybg" : "countrybg",
				pattern = cell.backgroundContext.createPattern(_images[bg], "repeat");
			cell.backgroundContext.fillStyle = pattern;
			cell.backgroundContext.fillRect(0, 0, cell.size.X, cell.size.Y);
			
			// Draw road
			if (data.road && data.road != "e") {
				cell.backgroundContext.drawImage(_images[data.road], 0, 0, cell.size.X, cell.size.Y);
			}
			
			// Create buildings
			var b = null;
			for (var i = data.buildings.length; i--;) {
				b = Z.building.create(
					data.buildings[i].position,
					data.buildings[i].size,
					_buildingSpriteData,
					data.buildings[i].spriteSize,
					data.biome
				);
				cell.buildings.push(b);
				Z.actorMap.push(b);
			}
			
			// Create trees
			var t = null;
			for (var i = data.trees.length; i--;) {
				t = Z.tree.create(data.trees[i].position, _treeSize, _treeSpriteData);
				cell.buildings.push(t);
				Z.actorMap.push(t);
			}
			
			// Create powerups
			var p = null;
			for (var i = data.powerups.length; i--;) {
				p = Z.powerup.createType(
					data.powerups[i].position,
					Z.content.items[data.powerups[i].type]
				);
				cell.powerups.push(p);
				Z.actorMap.push(p);
			}
			
			// Create cars
			var c = null;
			for (var i = data.cars.length; i--;) {
				Z.actorMap.push(Z.car.create(
					data.cars[i].position,
					data.cars[i].direction,
					data.cars[i].health,
					data.cars[i].fuel,
					Z.content.items[data.cars[i].type]
				));
			}
		}
	};
}());