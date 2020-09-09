"use strict";
Z.nightVision = (function() {
	return {
		name: "",
		size: vec2(),
		batteryType: "",
		batteryRate: 0,
		colour: "",
		amount: 0,
		sprite: null,
		hudSprite: null,
		activateSoundEffect: "",
		deactivateSoundEffect: "",
		initialise: function(data) {
			this.name = data.name;
			this.size = vec2(data.size);
			this.batteryType = data.batteryType || "";
			this.batteryRate = data.batteryRate || 0;
			this.colour = data.colour || "";
			this.amount = data.amount || 0;
			this.activateSoundEffect = data.activateSoundEffect || "";
			this.deactivateSoundEffect = data.deactivateSoundEffect || "";
			if (data.sprite) {
				this.sprite = Z.sprite.create(data.sprite);
				this.sprite.animation = "idle";
				this.hudSprite = Z.sprite.create(data.sprite);
				this.hudSprite.animation = "hud";
			}
		},
		update: function(elapsedTime) {
			if (this.sprite) {
				if (Z.player.moving) {
					this.sprite.animation = Z.player.running ? "run" : "walk";
				} else {
					this.sprite.animation = "idle";
				}
				this.sprite.update(elapsedTime);
			}
		},
		draw: function(context) {
			if (this.sprite) {
				this.sprite.draw(context, Z.player.position, Z.player.direction);
			}
		},
		drawOverlay: function(context) {
			context.save();
			context.globalCompositeOperation = "lighter";
			context.fillStyle = this.colour;
			context.fillRect(Z.camera.bounds.X, Z.camera.bounds.Y, Z.camera.size.X, Z.camera.size.Y);
			context.restore();
		}
	};
}());