"use strict";
Z.actor = (function() {
	return {
		type: "",					// Actor type ("player", "zombie", etc.)
		position: vec2(),			// Top left position for collision box (and sprite anchor point)
		size: vec2(),				// Actor collision box size (from position)
		direction: vec2(1, 0),		// Current facing direction (facing right by default)
		collide: true,				// True if this actor can collide with other actors
		hitBox: null,				// Ray-casting hit box
		sprite: null,				// Animated sprite
		moveVector: vec2(),			// Movement this frame
		dispose: false,				// True if this actor should be removed next frame
		zIndex: 0,					// Order by this when drawing (if 0, use y-position)
		create: function(position, size, sprite) {
			var a = Object.create(this);
			a.position = position;
			a.direction = vec2(1, 0);
			a.size = size;
			
			// Check if this actor has a sprite
			if (sprite) {
				a.sprite = sprite;
				
				// Check if the sprite has a ray-casting hit box
				if (sprite.spriteHitSize && sprite.spriteHitOffset) {
					a.hitBox = { offset: sprite.spriteHitOffset, size: sprite.spriteHitSize };
				}
			}
			return a;
		},
		update: function(elapsedTime) {
			this.moveVector = vec2();
			
			// Update sprite if one exists
			if (this.sprite) {
				this.sprite.update(elapsedTime);
				
				// Update sprite hit box if one exists
				if (this.sprite.spriteHitSize && this.sprite.spriteHitOffset) {
					this.hitBox = {
						offset: this.sprite.spriteHitOffset,
						size: this.sprite.spriteHitSize
					};
				}
			}
		},
		handleCollision: function(actor, mtv) {
			this.position = vec2.sub(this.position, mtv);
		},
		damage: function(position, type, amount) { },
		draw: function(context) {
			if (this.sprite) {
				this.sprite.draw(context, this.position, this.direction);
			}
			
			// Show collision bounding box outline if setting is enabled
			if (Z.settings.showCollisionBox) {
				context.save();
				context.strokeStyle = "#0f0";
				context.translate(this.position.X, this.position.Y);
				context.strokeRect(0, 0, this.size.X, this.size.Y);
				context.restore();
			}
		}
	};
}());