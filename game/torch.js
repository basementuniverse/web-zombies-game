"use strict";
Z.torch = (function() {
	var SPREAD_OFFSET = vec2(-20, 0);
	return {
		name: "",
		size: vec2(),
		batteryType: "",
		batteryRate: 0,
		maxRange: 0,
		spread: 0,
		amount: 0,
		sprite: null,
		hudSprite: null,
		lightImage: null,
		barrelPosition: vec2(),
		targetPosition: vec2(),
		activateSoundEffect: "",
		deactivateSoundEffect: "",
		initialise: function(data) {
			this.name = data.name;
			this.size = vec2(data.size);
			this.batteryType = data.batteryType || "";
			this.batteryRate = data.batteryRate || 0;
			this.maxRange = data.maxRange || 0;
			this.spread = data.spread || 0;
			this.amount = data.amount || 0;
			this.activateSoundEffect = data.activateSoundEffect || "";
			this.deactivateSoundEffect = data.deactivateSoundEffect || "";
			if (data.sprite) {
				this.sprite = Z.sprite.create(data.sprite);
				this.sprite.animation = "player";
				this.hudSprite = Z.sprite.create(data.sprite);
				this.hudSprite.animation = "hud";
			}
			this.lightImage = data.lightImage;
		},
		loadData: function(callback, path, data) {
			Z.utilities.loadData(function(result) {
				// When data has loaded, load light image
				if (result.lightImagePath) {
					Z.utilities.loadImage(function(image) {
						result.lightImage = image;
						callback(result);
					}, result.lightImagePath);
				} else {
					callback(result);
				}
			}, path, data);
		},
		update: function(elapsedTime) {
			var origin = (this.sprite && this.sprite.spriteBarrelOffset) ?
					vec2.add(
						vec2.add(Z.player.position, this.sprite.actorOffset),
						vec2(this.sprite.spriteBarrelOffset[vec2.toString(Z.player.direction)])
					) : vec2.add(Z.player.position, vec2.div(Z.player.size, 2)),
				target = Z.input.mouseWorldPosition,
				result = null;
			
			// Check maximum torch range
			var v = vec2.sub(origin, target),
				length = vec2.len(v);
			if (this.maxRange > 0 && length > this.maxRange) {
				v = vec2.mul(vec2.div(v, length), -this.maxRange);
				target = vec2.add(origin, v);
			}
			
			// Cast ray
			result = Z.collision.castRay(origin, target, function(a) {
				return (a.type == "player");
			});
			this.barrelPosition = origin;
			this.targetPosition = result.position;
		},
		draw: function(context) {
			if (this.sprite) {
				this.sprite.draw(context, Z.player.position, Z.player.direction);
			}
		},
		drawLightMap: function(context) {
			if (!Z.settings.dayCycleEnabled) { return; }
			context.save();
			context.globalCompositeOperation = "xor";
			context.globalAlpha = this.amount * Z.environment.getLightLevel();
			
			// Draw light beam
			var delta = vec2.sub(this.targetPosition, this.barrelPosition),
				angle = vec2.rad(delta),
				distance = vec2.len(delta);
			context.save();
			context.translate(this.barrelPosition.X, this.barrelPosition.Y);
			context.rotate(angle);
			context.drawImage(	
				this.lightImage,
				0, 0,
				this.lightImage.width, this.lightImage.height,
				0, -(this.lightImage.height / 2),
				distance, this.lightImage.height
			);
			context.restore();
			
			// Draw light spread
			context.save();
			context.globalCompositeOperation = "xor";
			context.translate(this.targetPosition.X, this.targetPosition.Y);
			var gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.spread / 2);
			gradient.addColorStop(0, "white");
			gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(0, 0, this.spread / 2, 0, Math.PI * 2, false);
			context.closePath();
			context.fill();
			context.restore();
			context.restore();
		}
	};
}());