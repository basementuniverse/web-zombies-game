"use strict";
Z.sprite = (function() {
	return {
		image: null,
		tileSize: vec2(),				// Size of each sprite sheet tile
		actorOffset: vec2(),			// Tile offset from actor position
		baseSpriteHitSize: vec2(),
		spriteHitSize: vec2(),			// Ray-cast hit box size
		baseSpriteHitOffset: vec2(),
		spriteHitOffset: vec2(),		// Ray-cast hit box offset from actor position
		baseSpriteHeadSize: 0,
		spriteHeadSize: 0,				// Head height (pixel height from top of sprite hit offset)
		spriteBarrelOffset: null,		// Barrel offset position (from top left of sprite tile)
		animations: [],
		animation: "idle",				// Default animation is always "idle"
		previousAnimation: "",			// Previously played animation (used when animation changes)
		create: function(data) {
			var s = Object.create(this);
			s.image = data.image;						// Required
			s.tileSize = vec2(data.tileSize);			// Required
			s.actorOffset = vec2(data.actorOffset);		// Required
			
			// Check if sprite has a hit box and head size
			if (data.spriteHitSize && data.spriteHitOffset) {
				s.baseSpriteHitSize = vec2(data.spriteHitSize);
				s.spriteHitSize = vec2(data.spriteHitSize);
				s.baseSpriteHitOffset = vec2(data.spriteHitOffset);
				s.spriteHitOffset = vec2(data.spriteHitOffset);
				if (data.spriteHeadSize) {
					s.baseSpriteHeadSize = data.spriteHeadSize;
					s.spriteHeadSize = data.spriteHeadSize;
				}
			}
			
			// Check if sprite has a barrel offset position (for weapon sprites)
			if (data.spriteBarrelOffset) {
				s.spriteBarrelOffset = data.spriteBarrelOffset;
			}
			
			// Create sprite animations
			var animations = [];
			for (var i = 0, length = data.animations.length; i < length; i++) {
				animations[data.animations[i].name] = Z.animation.create(s, data.animations[i]);
			}
			s.animations = animations;
			return s;
		},
		
		// Loads sprite data (with an additional image property containing the image data) from the
		// server (for when multiple instances of a sprite are created from a single definition)
		loadData: function(callback, path, data) {
			if (data) {		// If data is inline, load the image
				if (data.imagePath) {
					Z.utilities.loadImage(function(image) {
						data.image = image;
						callback(data);
					}, data.imagePath);
				} else {
					callback(data);
				}
			} else {
				$.ajax({
					dataType: "json",
					url: path,
					success: function(result) {
						// When data has loaded, load image referenced in data (some sprites don't
						// have an imagePath, specifically those that use Z.spriteGenerator)
						if (result.imagePath) {
							Z.utilities.loadImage(function(image) {
								result.image = image;
								callback(result);
							}, result.imagePath);
						} else {
							callback(result);
						}
					},
					error: function(request, status, error) {	// Definition data failed to load
						if (Z.settings.debug) {
							console.log(
								"Error loading sprite data (%s): %O, %O",
								status, request, error
							);
						}
						callback(null);
					}
				});
			}
		},
		update: function(elapsedTime) {
			// If animation has changed, reset to frame 0
			if (this.animation != this.previousAnimation) {
				this.animations[this.animation].frame = 0;
				this.previousAnimation = this.animation;
			}
			
			// Update current animation
			if (this.animations[this.animation]) {
				this.animations[this.animation].update(elapsedTime);
			}
			
			// If animation has animated sprite head size, get the current frame's head size
			if (this.animations[this.animation].spriteHeadSize) {
				var frame = this.animations[this.animation].frame;
				this.spriteHeadSize = this.animations[this.animation].spriteHeadSize[frame];
			} else {
				this.spriteHeadSize = this.baseSpriteHeadSize;
			}
			
			// If animation has animated sprite hit size and offset, get the current frame's values
			if (this.animations[this.animation].spriteHitSize &&
				this.animations[this.animation].spriteHitOffset) {
				var frame = this.animations[this.animation].frame;
				this.spriteHitSize = this.animations[this.animation].spriteHitSize[frame];
				this.spriteHitOffset = this.animations[this.animation].spriteHitOffset[frame];
			} else {
				this.spriteHitSize = this.baseSpriteHitSize;
				this.spriteHitOffset = this.baseSpriteHitOffset;
			}
		},
		draw: function(context, position, direction) {
			if (this.image && this.animations[this.animation]) {
				this.animations[this.animation].draw(context, position, direction);
			}
		}
	};
}());