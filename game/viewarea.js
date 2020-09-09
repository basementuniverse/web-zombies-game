"use strict";
Z.viewArea = (function() {
	var UPDATE_BUFFER_AREA = 200,	// Cells will be generated to cover the screen plus this area
		CELL_BUFFER_SIZE = 16;		// Cell buffer size depends on screen size + this value
	
	var _cells = [],				// Current cells in update area (updated every frame)
		_cellBuffer = [],			// All visited cells (up to _cellBufferSize)
		_cellBufferSize = 0,
		_cellBufferMaxSize = 0;
	
	// Populate _cells with cells within topLeft and bottomRight from the cell buffer (or generate
	// the cell if it isn't in the buffer)
	var createViewArea = function(topLeft, bottomRight) {
		var position = null,
			hash = "",
			cell = null;
		for (var x = topLeft.X; x < bottomRight.X; x++) {
			for (var y = topLeft.Y; y < bottomRight.Y; y++) {
				position = vec2(x, y);
				hash = Z.utilities.hash(position);
				if (_cellBuffer[hash]) {
					_cells.push(_cellBuffer[hash]);
				} else {
					cell = Z.cellGenerator.getCell(position);
					_cells.push(cell);
					_cellBuffer[hash] = cell;
					_cellBufferSize++;
				}
			}
		}
		
		// If the buffer has gone over it's limit, remove the furthest cell
		if (_cellBufferSize > _cellBufferMaxSize) {
			var current = Z.utilities.cell(Z.camera.position),
				max = -1,
				delta = 0,
				hash = "";
			for (var i in _cellBuffer) {
				if (!_cellBuffer.hasOwnProperty(i)) { continue; }
				if (_cellBuffer[i]) {
					delta = vec2.len(vec2.sub(current, _cellBuffer[i].position));
					if (delta > max) {
						max = delta;
						hash = i;
					}
				}
			}
			if (hash) {
				_cellBuffer[hash].dispose();
				delete _cellBuffer[hash];
				_cellBufferSize--;
			}
		}
	};
	
	return {
		currentBiome: 0,
		initialise: function(width, height) {
			_cellBuffer = [];
			_cellBufferSize = 0;
			var topLeft = Z.utilities.cell(
					vec2.sub(
						vec2.sub(Z.camera.position, vec2(width / 2, height / 2)),
						UPDATE_BUFFER_AREA
					)
				),
				bottomRight = Z.utilities.cell(
					vec2.add(
						vec2.add(Z.camera.position, vec2(width, height)),
						UPDATE_BUFFER_AREA
					)
				);
			bottomRight = vec2.add(bottomRight, 1);
			createViewArea(topLeft, bottomRight);
		},
		update: function(elapsedTime) {
			_cells = [];
			
			// Calculate maximum buffer size from screen size + border area
			var size = vec2.div(vec2.add(Z.camera.size, UPDATE_BUFFER_AREA * 2), Z.settings.cellSize);
			_cellBufferMaxSize = (Math.ceil(size.X) * Math.ceil(size.Y)) + CELL_BUFFER_SIZE;
			
			// Get the visible screen bounds (plus buffer area)
			var topLeft = Z.utilities.cell(vec2.sub(Z.camera.bounds, UPDATE_BUFFER_AREA)),
				bottomRight = Z.utilities.cell(
					vec2.add(
						Z.camera.bounds,
						vec2.add(Z.camera.size, UPDATE_BUFFER_AREA)
					)
				);
			bottomRight = vec2.add(bottomRight, 1);
			createViewArea(topLeft, bottomRight);
			
			// Update current biome in view area
			var playerCellPosition = vec2(
					Math.floor(Z.player.position.X / Z.settings.cellSize),
					Math.floor(Z.player.position.Y / Z.settings.cellSize)
				);
			if (_cellBuffer[Z.utilities.hash(playerCellPosition)]) {
				this.currentBiome = _cellBuffer[Z.utilities.hash(playerCellPosition)].biome;
			}
		},
		draw: function(context) {
			for (var i = _cells.length; i--;) {
				_cells[i].draw(context);
			}
		},
		drawDecal: function(actor) {
			var hash = Z.utilities.hash(Z.utilities.cell(actor.position)),
				context = null;
			if (_cellBuffer[hash]) {
				context = _cellBuffer[hash].decalsContext;
				context.save();
				context.translate(-_cellBuffer[hash].bounds.X, -_cellBuffer[hash].bounds.Y);
				actor.draw(context);
				context.restore();
			}
		}
	};
}());