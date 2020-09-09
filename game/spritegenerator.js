"use strict";
Z.spriteGenerator = (function() {
	var _generateRate = 0,	// Limit the rate at which new permutations are generated (in seconds)
		_generateTime = 0;	// Note: set _generateRate to 0 to disable sprite generation during play
	return {
		types: [],
		initialise: function(restart) {
			for (var i in this.types) {
				if (!this.types.hasOwnProperty(i)) { continue; }
				this.types[i].initialise(restart);
			}
		},
		loadData: function(callback, path, data) {
			Z.utilities.loadData(function(generatorData) {
				_generateRate = generatorData.generateRate;
				var loadCount = generatorData.types.length,
					type = null;
				
				// If there are no types, call callback immediately
				// Note: Sprite generator doesn't return anything to the content manager, instead
				// it initialises itself and keeps all content internally
				if (generatorData.types.length) {
					$(generatorData.types).each(function(i, v) {
						Z.spriteGeneratorType.loadData(function(typeData) {
							if (typeData) {
								type = Z.spriteGeneratorType.create(typeData);
								Z.spriteGenerator.types[type.name] = type;
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
		getSprite: function(type, data, returnHash) {
			var generateNew = false,
				result = null,
				sprite = null;
			if (_generateRate && Z.settings.spriteGeneratorEnabled) {
				generateNew = (new Date().getTime() - _generateTime) >= (_generateRate * 1000);
			}
			result = this.types[type].getSpriteImage(generateNew);
			data.image = result.image;
			sprite = Z.sprite.create(data);
			if (returnHash) {
				sprite.hash = result.hash;
			}
			return sprite;
		},
		resetTimer: function() {
			_generateTime = new Date().getTime();
		}
	};
}());

Z.spriteGeneratorType = (function() {
	return {
		name: "",
		initiallyGenerate: 0,
		layers: [],
		generated: [],
		generatedHashes: [],
		size: vec2(),
		share: [],
		create: function(data) {
			var t = Object.create(this),
				random = null;
			t.name = data.name;
			t.initiallyGenerate = Z.settings.spriteGeneratorEnabled ? data.initiallyGenerate : 1;
			t.layers = data.layers;
			t.size = vec2(data.size);
			t.generated = [];
			t.generatedHashes = [];
			t.share = data.share || [];
			return t;
		},
		initialise: function(restart) {	// Generate initial sprite permutations
			if (!restart && this.share) {
				for (var i = this.share.length; i--;) {
					this.share[i] = Z.spriteGenerator.types[this.share[i]];
				}
			}
			if (this.initiallyGenerate > 0) {
				var random = null,
					result = null;
				for (var i = 0; i < this.initiallyGenerate; i++) {
					random = this.generateRandomHash();
					if (!this.generated[random.hash]) {
						result = this.getSharedHash(random.hash);
						if (result) {	// Hash was found in a shared sprite type
							this.generated[random.hash] = result;
							this.generatedHashes.push(random.hash);
						} else {	// If this hash doesn't exist, create the corresponding sprite
							this.generateSpriteImage(random.hash, random.layers);
						}
					}
				}
			}
		},
		loadData: function(callback, data) {
			var loadCount = data.layers.length,
				layers = [];
			if (data.layers.length) {
				$(data.layers).each(function(i, v) {
					Z.spriteGeneratorLayer.loadData(function(layer) {
						if (layer) {
							layers.push(Z.spriteGeneratorLayer.create(layer));
						}
						if (--loadCount <= 0) {
							layers.sort(function(a, b) { return a.index - b.index; });
							data.layers = layers;
							callback(data);
						}
					}, v);
				});
			} else {
				callback(null);
			}
		},
		getSpriteImage: function(generateNew) {
			var hash = "";
			if (generateNew) {		// Generate a new sprite permutation or return an existing one
				var random = this.generateRandomHash(),
					result = null;
				hash = random.hash;
				
				if (!this.generated[hash]) {
					result = this.getSharedHash(hash);
					if (result) {	// Hash was found in a shared sprite type
						this.generated[hash] = result;
						this.generatedHashes.push(hash);
					} else {	// If this hash doesn't exist, create the corresponding sprite
						this.generateSpriteImage(hash, random.layers);
					}
				}
			} else {	// Return an existing sprite permutation
				var random = Math.floor(Math.random() * this.generatedHashes.length);
				hash = this.generatedHashes[random];
			}
			return { hash: hash, image: this.generated[hash] };
		},
		getSharedHash: function(hash) {
			if (this.share) {
				for (var i = this.share.length; i--;) {
					if (this.share[i].generated[hash]) {
						return this.share[i].generated[hash];
					}
				}
			}
			return false;
		},
		generateRandomHash: function() {
			var result = { hash: "", layers: [] },
				imageIndex = 0;
			for (var i = 0, length = this.layers.length; i < length; i++) {
				if (this.layers[i].images.length > 0 &&
					(this.layers[i].required || Math.random() >= 0.5)) {
					imageIndex = Math.floor(Math.random() * this.layers[i].images.length);
					result.hash += imageIndex + "_";
					result.layers.push(imageIndex);
				} else {
					result.hash += "n_";
					result.layers.push("n");
				}
			}
			return result;
		},
		generateSpriteImage: function(hash, layers) {
			Z.spriteGenerator.resetTimer();
			var canvas = document.createElement("canvas"),
				context = canvas.getContext("2d");
			canvas.width = this.size.X;
			canvas.height = this.size.Y;
			for (var i = 0, length = this.layers.length; i < length; i++) {
				if (layers[i] != "n" && this.layers[i].images[layers[i]]) {
					context.drawImage(
						this.layers[i].images[layers[i]],
						0, 0,
						this.layers[i].images[layers[i]].width,
						this.layers[i].images[layers[i]].height,
						0, 0, this.size.X, this.size.Y);
				}
			}
			this.generated[hash] = canvas;
			this.generatedHashes.push(hash);
		}
	};
}());

Z.spriteGeneratorLayer = (function() {
	return {
		index: 0,
		name: "",
		required: false,
		images: [],
		create: function(data) {
			var l = Object.create(this);
			l.index = data.index;
			l.name = data.name;
			l.required = data.required;
			l.images = data.images || [];
			return l;
		},
		loadData: function(callback, data) {
			var loadCount = data.imagePaths.length,
				images = [];
			if (data.imagePaths.length) {
				$(data.imagePaths).each(function(i, v) {
					Z.utilities.loadImage(function(image) {
						images.push(image);
						if (--loadCount <= 0) {
							data.images = images;
							callback(data);
						}
					}, v);
				});
			} else {
				callback(data);
			}
		}
	};
}());