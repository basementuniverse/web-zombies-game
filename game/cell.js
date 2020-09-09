"use strict";
Z.cell = (function() {
	return {
		position: vec2(),
		size: vec2(),
		bounds: vec2(),
		biome: 0,
		backgroundCanvas: null,
		backgroundContext: null,
		decalsCanvas: null,
		decalsContext: null,
		buildings: [],
		powerups: [],
		create: function(position) {
			var c = Object.create(this);
			c.position = position;
			c.size = vec2(Z.settings.cellSize, Z.settings.cellSize);
			c.bounds = vec2.mul(position, Z.settings.cellSize);
			c.buildings = [];
			c.powerups = [];
			
			// Initialise canvas for drawing background layer (roads, grass etc.)
			c.backgroundCanvas = document.createElement("canvas");
			c.backgroundCanvas.width = c.size.X;
			c.backgroundCanvas.height = c.size.Y;
			c.backgroundContext = c.backgroundCanvas.getContext("2d");
			
			// Initialise decals canvas (for drawing dead zombies, blood effects, etc.)
			c.decalsCanvas = document.createElement("canvas");
			c.decalsCanvas.width = c.size.X + Z.settings.sectionSize;
			c.decalsCanvas.height = c.size.Y + Z.settings.sectionSize;
			c.decalsContext = c.decalsCanvas.getContext("2d");
			return c;
		},
		dispose: function() {
			for (var i = this.buildings.length; i--;) {
				this.buildings[i].dispose = true;
			}
			for (var i = this.powerups.length; i--;) {
				this.powerups[i].dispose = true;
			}
		},
		
		// Draw background and decals contexts onto main context
		draw: function(context) {
			context.save();
			context.translate(this.bounds.X, this.bounds.Y);
			context.drawImage(this.backgroundCanvas, 0, 0, this.size.X, this.size.Y);
			context.drawImage(
				this.decalsCanvas,
				0, 0,
				this.decalsCanvas.width, this.decalsCanvas.height
			);
			context.restore();
		}
	};
}());