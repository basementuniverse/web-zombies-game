"use strict";
Z.animation = (function() {
	// Return a sprite offset for the specified direction (in sprite sheets, directions should
	// always be on consecutive rows in the same order as in this function)
	var directionOffset = function(direction) {
		var offsets = {
			"0,0":		vec2(0, 0),
			"1,0":		vec2(0, 0),
			"1,1":		vec2(0, 1),
			"0,1":		vec2(0, 2),
			"-1,1":		vec2(0, 3),
			"-1,0":		vec2(0, 4),
			"-1,-1":	vec2(0, 5),
			"0,-1":		vec2(0, 6),
			"1,-1":		vec2(0, 7)
		};
		return offsets[vec2.toString(direction)];
	};
	
	return {
		sprite: null,
		name: "",
		frames: 0,
		frame: 0,
		frameTime: 0,
		frameRate: 1,
		loop: true,
		directions: true,
		rotate: false,
		startOffset: vec2(),
		spriteHeadSize: null,		// An array of sprite head sizes for each frame
		spriteHitSize: null,		// An array of sprite hit box sizes for each frame
		spriteHitOffset: null,		// An array of sprite hit box offsets for each frame
		finishedCallback: null,		// A function to run when the current animation finishes
		create: function(sprite, data) {
			var a = Object.create(this);
			a.sprite = sprite;
			a.name = data.name;						// Required
			a.frames = data.frames || a.frames;
			a.frameRate = data.frameRate || a.frameRate;
			a.frameTime = 1 / a.frameRate;
			a.loop = !!data.loop;
			a.directions = !!data.directions;
			a.rotate = !!data.rotate;
			a.startOffset = vec2(data.startOffset);	// Required
			
			// Animations can have a head size for each frame
			if (data.spriteHeadSize) {
				a.spriteHeadSize = data.spriteHeadSize;
			}
			
			// Animations can have a hit box size and offset for each frame
			if (data.spriteHitSize && data.spriteHitOffset) {
				// Convert hit box sizes to vec2
				var spriteHitSize = [];
				for (var i = 0, length = data.spriteHitSize.length; i < length; i++) {
					spriteHitSize.push(vec2(data.spriteHitSize[i]));
				}
				a.spriteHitSize = spriteHitSize;
				
				// Convert hit box offsets to vec2
				var spriteHitOffset = [];
				for (var i = 0, length = data.spriteHitOffset.length; i < length; i++) {
					spriteHitOffset.push(vec2(data.spriteHitOffset[i]));
				}
				a.spriteHitOffset = spriteHitOffset;
			}
			return a;
		},
		
		// Update the animation frame
		update: function(elapsedTime) {
			if (!this.frames) { return; }
			if (this.frameTime <= 0) {
				this.frameTime = 1 / this.frameRate;
				if (this.frame < this.frames - 1) {
					this.frame++;
				} else {
					if (this.loop) {	// Reset looping animations back to frame 0
						this.frame = 0;
					} else if (this.finishedCallback) {
						// For non-looping animations, check if there is a callback and run it
						this.finishedCallback();
						this.finishedCallback = null;
					}
				}
			}
			this.frameTime = Math.max(this.frameTime - elapsedTime, 0);
		},
		
		// Draw the current animation frame onto the specified context
		draw: function(context, position, direction) {
			if (this.rotate) {
				// Get frame offset for the current animation and frame
				var frameOffset = vec2.mul(
						vec2.add(this.startOffset, vec2(this.frame, 0)),
						this.sprite.tileSize
					);
				
				// Draw the animation frame at the actor position + offset
				context.save();
				context.translate(position.X, position.Y);
				context.rotate(vec2.rad(direction));
				context.drawImage(
					this.sprite.image,
					frameOffset.X, frameOffset.Y,
					this.sprite.tileSize.X, this.sprite.tileSize.Y,
					this.sprite.actorOffset.X, this.sprite.actorOffset.Y,
					this.sprite.tileSize.X, this.sprite.tileSize.Y
				);
				context.restore();
			} else {
				// Get frame offset for the current animation, frame and direction
				var offset = this.directions ? directionOffset(direction) : vec2(),
					frameOffset = vec2.mul(
						vec2.add(vec2.add(this.startOffset, offset), vec2(this.frame, 0)),
						this.sprite.tileSize
					);
				
				// Draw the animation frame at the actor position + offset
				context.save();
				context.translate(
					position.X + this.sprite.actorOffset.X,
					position.Y + this.sprite.actorOffset.Y
				);
				context.drawImage(
					this.sprite.image,
					frameOffset.X, frameOffset.Y,
					this.sprite.tileSize.X, this.sprite.tileSize.Y,
					0, 0,
					this.sprite.tileSize.X, this.sprite.tileSize.Y
				);
				context.restore();
			}
		}
	};
}());