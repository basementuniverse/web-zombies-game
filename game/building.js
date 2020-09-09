"use strict";
Z.building = (function(base) {
	var SHADOW_ALPHA = 0.1,
		SHADOW_TOP_Y_OFFSET = 40,
		MAX_SHADOW_LENGTH = 100;
	var _building = Object.create(base);
	_building.type = "building";
	_building.create = function(position, size, spriteData, spriteSize, biome) {
		var b = base.create.call(
				this,
				position,
				size,
				Z.spriteGenerator.getSprite("building_" + biome, spriteData, true)
			);
		b.sprite.size = vec2.div(size, 10);
		b.sprite.animation = vec2.toString(spriteSize);
		return b;
	};
	_building.update = function(elapsedTime) {
		base.update.apply(this, arguments);
		this.hitBox = { offset: vec2(0, 0), size: vec2.sub(this.size, vec2(0, 15)) };
	};
	_building.handleCollision = function(actor, mtv) { };
	_building.draw = function(context) {
		if (Z.settings.shadowsEnabled) {	// Draw shadow
			var corner0 = vec2(this.position.X, this.position.Y + SHADOW_TOP_Y_OFFSET),
				corner1 = vec2(this.position.X + this.size.X, this.position.Y + SHADOW_TOP_Y_OFFSET),
				corner2 = vec2.add(this.position, this.size),
				corner3 = vec2(this.position.X, this.position.Y + this.size.Y),
				corners = null,
				delta = vec2.mul(
					Z.environment.sunDirection,
					(1 - Z.environment.sunCurrentHeight) * MAX_SHADOW_LENGTH
				);
			
			// Select which three corners to draw a shadow around depending on the light direction
			// (will draw a filled path from corners[0] through [1] to [2], then back around to [0]
			// with the shadow length/direction offset)
			if (Z.environment.sunDirection.X > 0) {
				corners = Z.environment.sunDirection.Y > 0 ?
					[corner1, corner2, corner3] : [corner0, corner1, corner2];
			} else {
				corners = Z.environment.sunDirection.Y > 0 ?
					[corner2, corner3, corner0] : [corner3, corner0, corner1];
			}
			context.save();
			context.globalAlpha = SHADOW_ALPHA * Z.environment.lightLevel;
			context.fillStyle = "black";
			context.beginPath();
			context.moveTo(corners[0].X, corners[0].Y);
			context.lineTo(corners[1].X, corners[1].Y);
			context.lineTo(corners[2].X, corners[2].Y);
			context.lineTo(corners[2].X + delta.X, corners[2].Y + delta.Y);
			context.lineTo(corners[1].X + delta.X, corners[1].Y + delta.Y);
			context.lineTo(corners[0].X + delta.X, corners[0].Y + delta.Y);
			context.closePath();
			context.fill();
			
			// Fill bounding rectangle (for building sprites that don't completely cover their
			// bounding rectangle)
			context.fillRect(this.position.X, this.position.Y, this.size.X, this.size.Y);
			context.restore();
		}
		base.draw.call(this, context);
	};
	return _building;
}(Z.actor));