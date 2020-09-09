"use strict";
Z.carSpriteGenerator = (function() {
	var _generateRate = 0,	// Limit the rate at which new permutations are generated (in seconds)
		_generateTime = 0,	// Note: set _generateRate to 0 to disable sprite generation during play
		_colourMaskAlpha = 0,
		_destroyedColourMaskAlpha = 0;
	return {
		types: [],
		initialise: function(restart) {
			for (var i in this.types) {
				if (!this.types.hasOwnProperty(i)) { continue; }
				this.types[i].initialise(restart, _colourMaskAlpha, _destroyedColourMaskAlpha);
			}
		},
		loadData: function(callback, path, data) {
			Z.utilities.loadData(function(generatorData) {
				_generateRate = generatorData.generateRate;
				_colourMaskAlpha = generatorData.colourMaskAlpha;
				_destroyedColourMaskAlpha = generatorData.destroyedColourMaskAlpha;
				var loadCount = generatorData.types.length,
					type = null;
				
				// If there are no types, call callback immediately
				if (generatorData.types.length) {
					$(generatorData.types).each(function(i, v) {
						Z.carSpriteGeneratorType.loadData(function(typeData) {
							if (typeData) {
								type = Z.carSpriteGeneratorType.create(typeData);
								Z.carSpriteGenerator.types[type.name] = type;
							}
							if (--loadCount <= 0) {
								callback(null);
							}
						}, v);
					});
				} else {
					callback(null);
				}
			}, path, data);
		},
		getSprite: function(type, data) {
			var generateNew = false;
			if (_generateRate && Z.settings.spriteGeneratorEnabled) {
				generateNew = (new Date().getTime() - _generateTime) >= (_generateRate * 1000);
			}
			data.image = this.types[type].getSpriteImage(generateNew);
			return Z.sprite.create(data);
		},
		resetTimer: function() {
			_generateTime = new Date().getTime();
		}
	};
}());

Z.carSpriteGeneratorType = (function() {
	return {
		name: "",
		initiallyGenerate: 0,
		image: null,
		colours: [],
		generated: [],
		generatedColours: [],
		size: vec2(),
		tileSize: vec2(),
		worldOffset: vec2(),
		destroyedOffset: vec2(),
		colourMaskOffset: vec2(),
		colourMaskAlpha: 0,
		destroyedColourMaskAlpha: 0,
		create: function(data) {
			var t = Object.create(this),
				random = null;
			t.name = data.name;
			t.initiallyGenerate = Z.settings.spriteGeneratorEnabled ? data.initiallyGenerate : 1;
			t.image = data.image || null;
			t.colours = data.colours || [];
			t.size = vec2(data.size);
			t.tileSize = vec2(data.tileSize);
			t.worldOffset = vec2(data.worldOffset);
			t.destroyedOffset = vec2(data.destroyedOffset);
			t.colourMaskOffset = vec2(data.colourMaskOffset);
			t.generated = [];
			t.generatedColours = [];
			return t;
		},
		initialise: function(restart, colourMaskAlpha, destroyedColourMaskAlpha) {	
			this.colourMaskAlpha = colourMaskAlpha;
			this.destroyedColourMaskAlpha = destroyedColourMaskAlpha;
			
			// Generate initial sprite permutations
			if (this.initiallyGenerate > 0) {
				var colour = null;
				for (var i = 0; i < this.initiallyGenerate; i++) {
					colour = this.colours[Math.floor(Math.random() * this.colours.length)];
					if (!this.generated[colour]) {
						this.generateSpriteImage(colour);
					}
				}
			}
		},
		loadData: function(callback, data) {
			if (data.imagePath) {
				Z.utilities.loadImage(function(image) {
					data.image = image;
					callback(data);
				}, data.imagePath);
			} else {
				callback(data);
			}
		},
		getSpriteImage: function(generateNew) {
			var hash = "";
			if (generateNew) {		// Generate a new sprite colour or return an existing one
				var colour = this.colours[Math.floor(Math.random() * this.colours.length)];
				if (!this.generated[colour]) {
					this.generateSpriteImage(colour);
				}
			} else {	// Return an existing sprite colour
				colour = this.generatedColours[Math.floor(Math.random() * this.generatedColours.length)];
			}
			return this.generated[colour];
		},
		generateSpriteImage: function(colour) {
			Z.carSpriteGenerator.resetTimer();
			var canvas = document.createElement("canvas"),
				context = canvas.getContext("2d"),
				colourMaskCanvas = document.createElement("canvas"),
				colourMaskContext = colourMaskCanvas.getContext("2d");
			canvas.width = this.size.X;
			canvas.height = this.size.Y;
			colourMaskCanvas.width = this.tileSize.X;
			colourMaskCanvas.height = this.tileSize.Y;
			context.drawImage(this.image, 0, 0);
			colourMaskContext.drawImage(
				this.image,
				this.colourMaskOffset.X, this.colourMaskOffset.Y,
				this.tileSize.X, this.tileSize.Y,
				0, 0,
				this.tileSize.X, this.tileSize.Y
			);
			colourMaskContext.globalCompositeOperation = "source-atop";
			colourMaskContext.fillStyle = colour;
			colourMaskContext.fillRect(0, 0, this.tileSize.X, this.tileSize.Y);
			context.globalAlpha = this.colourMaskAlpha;
			context.drawImage(colourMaskCanvas, this.worldOffset.X, this.worldOffset.Y);
			context.globalAlpha = this.destroyedColourMaskAlpha;
			context.drawImage(colourMaskCanvas, this.destroyedOffset.X, this.destroyedOffset.Y);
			this.generated[colour] = canvas;
			this.generatedColours.push(colour);
		}
	};
}());