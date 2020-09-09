"use strict";
Z.mapGenerator = (function() {
	var PLAYER_MARKER_SIZE = 4;
	
	var _worker = null,
		_waiting = [],
		_cellBuffer = [],
		_buildingColour = "",
		_treeColour = "",
		_playerColour = "",
		_images = [];
	
	var loadImages = function(callback, data) {
		var loadCount = 0;
		for (var i in data.imagePaths) { if (data.imagePaths.hasOwnProperty(i)) { loadCount++; } }
		for (var i in data.imagePaths) {
			if (!data.imagePaths.hasOwnProperty(i)) { continue; }
			var image = new Image();
			image.onload = function() {
				if (--loadCount <= 0) {
					callback(data);
				}
			};
			image.src = data.imagePaths[i];
			_images[i] = image;
		}
	};
	
	var getCell = function(cellPosition, context, renderOffset, playerPosition) {
		var hash = vec2.toString(cellPosition);
		if (_cellBuffer[hash]) {
			renderCell(_cellBuffer[hash], context, renderOffset, playerPosition);
		} else {
			_worker.postMessage({ command: "generate", position: cellPosition });
			_waiting[hash] = function(cellData) {
				_cellBuffer[hash] = cellData;
				renderCell(_cellBuffer[hash], context, renderOffset, playerPosition);
			};
		}
	};
	
	var renderCell = function(cellData, context, offset, playerPosition) {
		var position = vec2.mul(vec2.sub(cellData.position, offset), Z.settings.mapCellSize),
			scale = Z.settings.cellSize / Z.settings.mapCellSize;
		context.save();
		context.drawImage(
			_images[cellData.biome < 3 ? "countrybg" : "citybg"],
			position.X,
			position.Y
		);
		if (cellData.road) {
			context.drawImage(_images[cellData.road], position.X, position.Y);
		}
		
		// Draw buildings
		context.fillStyle = _buildingColour;
		for (var i = cellData.buildings.length; i--;) {
			context.fillRect(
				(cellData.buildings[i].position.X / scale) - (offset.X * Z.settings.mapCellSize),
				(cellData.buildings[i].position.Y / scale) - (offset.Y * Z.settings.mapCellSize),
				Math.ceil(cellData.buildings[i].size.X / scale),
				Math.ceil(cellData.buildings[i].size.Y / scale)
			);
		}
		
		// Draw trees
		context.fillStyle = _treeColour;
		var image = _images["tree"],
			size = vec2(image.width, image.height);
		for (var i = cellData.trees.length; i--;) {
			context.drawImage(
				image,
				(cellData.trees[i].position.X / scale) - (offset.X * Z.settings.mapCellSize) - (size.X / 2),
				(cellData.trees[i].position.Y / scale) - (offset.Y * Z.settings.mapCellSize) - size.Y
			);
		}
		
		// Draw player
		context.strokeStyle = _playerColour;
		context.lineWidth = 2;
		context.translate(playerPosition.X, playerPosition.Y);
		context.beginPath();
		context.moveTo(-PLAYER_MARKER_SIZE, -PLAYER_MARKER_SIZE);
		context.lineTo(PLAYER_MARKER_SIZE, PLAYER_MARKER_SIZE);
		context.moveTo(-PLAYER_MARKER_SIZE, PLAYER_MARKER_SIZE);
		context.lineTo(PLAYER_MARKER_SIZE, -PLAYER_MARKER_SIZE);
		context.stroke();
		context.closePath();
		context.restore();
	};
	
	return {
		initialise: function(mapData, worldData, restart) {
			_buildingColour = mapData.buildingColour;
			_treeColour = mapData.treeColour;
			_playerColour = mapData.playerColour;
			
			// Initialise worker thread
			if (!restart) {
				_worker = new Worker("game/cellgeneratorworker.js");
				_worker.addEventListener("message", function(e) {
					if (e.data.cellData && e.data.position) {
						var hash = vec2.toString(e.data.position);
						if (_waiting[hash]) {
							_waiting[hash](e.data.cellData);
						}
					}
				}, false);
				worldData.command = "initialise";
				worldData.cellSize = Z.settings.cellSize;
				_worker.postMessage(worldData);
			}
		},
		reInitialise: function(worldData) {		// Used by config to re-initialise world data
			if (!_worker) { return; }
			worldData.command = "initialise";
			worldData.cellSize = Z.settings.cellSize;
			_worker.postMessage(worldData);
			_waiting = [];
			_cellBuffer = [];
		},
		loadData: function(callback, path, data) {
			if (data) {		// If data is inline, load the images
				if (data.imagePaths) {
					loadImages(callback, data);
				} else {
					callback(data);
				}
			} else {
				$.ajax({
					dataType: "json",
					url: path,
					success: function(result) {
						if (result.imagePaths) {
							loadImages(callback, result);
						} else {
							callback(result);
						}
					},
					error: function(request, status, error) {	// Definition data failed to load
						if (Z.settings.debug) {
							console.log(
								"Error loading map data (%s): %O, %O",
								status, request, error
							);
						}
						callback(null);
					}
				});
			}
		},
		draw: function(position, playerPosition, context, size) {
			context.clearRect(0, 0, size.X, size.Y);
			
			// Calculate cell position and cellSize (size in cells)
			var cellPosition = Z.utilities.cell(position),
				cellSize = vec2(
					Math.floor(size.X / Z.settings.mapCellSize),
					Math.floor(size.Y / Z.settings.mapCellSize)
				),
				start = vec2.sub(cellPosition, vec2.div(cellSize, 2)),
				end = vec2.add(cellPosition, vec2.div(cellSize, 2));
			playerPosition = vec2.div(
				vec2.sub(playerPosition, vec2.mul(start, Z.settings.cellSize)),
				Z.settings.cellSize / Z.settings.mapCellSize
			);
			for (var x = start.X, xCount = 0; xCount < cellSize.X; x++, xCount++) {
				for (var y = start.Y, yCount = 0; yCount < cellSize.Y; y++, yCount++) {
					getCell(vec2(x, y), context, start, playerPosition);
				}
			}
		}
	};
}());