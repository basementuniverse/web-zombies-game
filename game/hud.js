"use strict";
Z.hud = (function() {
	var _elements = [];
	return {
		initialise: function(data) {
			var element = null;
			for (var i = data.elements.length; i--;) {
				element = Z.hudElement.create(data.elements[i], data.sprite);
				_elements[element.name] = element;
			}
		},
		update: function(elapsedTime) {
			// Health and armour
			_elements["health"].value = Z.player.health;
			_elements["armour"].value = Z.player.armour;
			
			// Infected warning
			_elements["infected"].value = (Z.player.alive && Z.player.infected) ? "Infected" : "";
			
			// Dead warning
			_elements["dead"].value = Z.player.alive ?
				"" :
				("You are " + (Z.player.isZombie ? "(un)" : "") + "dead! Press Space to restart");
			
			// Serum count
			_elements["serum"].value = Z.player.inventory["serum"] || 0;
			
			// Fuel
			_elements["fuel"].value = Z.player.inCar ?
				(Z.player.inventory[Z.player.inCar.fuelType] || "0") : 0;
			
			// Weapon and ammo
			var weapon = Z.player.weapons[Z.player.weapon];
			_elements["weapon"].sprite = weapon.hudSprite;
			_elements["weapon"].value = Z.player.weapon;
			if (weapon.ammoType) {
				if (weapon.magazineSize > 1) {
					_elements["ammo"].value = weapon.magazine;
					_elements["ammo"].maxValue = Z.player.inventory[weapon.ammoType] || 0;
				} else {
					_elements["ammo"].value = Math.min(
						Z.player.maxInventory[weapon.ammoType],
						weapon.magazine + Z.player.inventory[weapon.ammoType]
					);
					_elements["ammo"].maxValue = 0;
				}
			} else {
				_elements["ammo"].value = 0;
				_elements["ammo"].maxValue = 0;
			}
			
			// Reloading warning (don't display if player is dead)
			_elements["reloading"].value =
				(Z.player.alive && weapon.ammoType && weapon.reloading) ? "Reloading" : "";
			
			// Torch/nightvision and battery
			_elements["torch"].sprite = Z.torch.hudSprite;
			_elements["torch"].value = Z.player.torchActivated;
			_elements["nightvision"].sprite = Z.nightVision.hudSprite;
			_elements["nightvision"].value = Z.player.nightVisionActivated;
			if (Z.player.torchActivated && Z.torch.batteryType) {
				_elements["battery"].value = Z.player.inventory[Z.torch.batteryType] || 0;
			} else if (Z.player.nightVisionActivated && Z.nightVision.batteryType) {
				_elements["battery"].value = Z.player.inventory[Z.nightVision.batteryType] || 0;
			} else {
				_elements["battery"].value = 0;
			}
			
			// Update elements
			for (var i in _elements) {
				if (!_elements.hasOwnProperty(i)) { continue; }
				_elements[i].update(elapsedTime);
			}
		},
		draw: function(context) {
			for (var i in _elements) {
				if (!_elements.hasOwnProperty(i)) { continue; }
				_elements[i].draw(context);
			}
		}
	};
}());

Z.hudElement = (function() {
	return {
		name: "",
		position: vec2(),
		align: vec2(),
		textAlign: "left",
		size: vec2(),
		visibleEmpty: true,		// True if this element should be visible when the value is 0
		animation: "",
		font: "",
		colours: [],
		value: 0,
		maxValue: 0,
		sprite: null,
		create: function(data, spriteData) {
			var e = Object.create(this);
			e.name = data.name;					// Required
			e.position = vec2(data.position);	// Required
			e.align = data.align ? vec2(data.align) : vec2(-1, -1);
			e.textAlign = data.textAlign || e.textAlign;
			e.size = vec2(data.size);			// Required
			e.visibleEmpty = !!data.visibleEmpty;
			e.font = data.font || "";
			e.colours = data.colours || [];
			e.colours.sort(function(a, b) { return a.value - b.value; });
			
			// Create a sprite if this element uses one
			if (spriteData && data.animation) {
				e.sprite = Z.sprite.create(spriteData);
				e.sprite.animation = data.animation;
			}
			return e;
		},
		update: function(elapsedTime) {
			if (this.sprite) {
				this.sprite.update(elapsedTime);
			}
		},
		draw: function(context) {
			// Only draw if visible when empty
			if (!this.visibleEmpty && !this.value && !this.maxValue) { return; }
			context.save();
			context.setTransform(1, 0, 0, 1, Z.camera.size.X / 2, Z.camera.size.Y / 2);
			
			// Calculate screen position
			var offset = vec2.mul(this.align, vec2.div(Z.camera.size, 2));
			if (this.align.X > 0 && this.textAlign == "left") { offset.X -= this.size.X; }
			if (this.align.Y > 0) { offset.Y -= this.size.Y + this.position.Y; }
			offset = vec2.sub(offset, vec2.mul(this.position, this.align));
			if (this.align.X == 0) { offset.X += this.position.X; }	// Position if centered
			if (this.align.Y == 0) { offset.Y += this.position.Y; }
			context.translate(offset.X, offset.Y);
			
			// If there is a sprite for this element, draw the sprite
			if (this.sprite) {
				this.sprite.draw(context, vec2(), vec2(1, 0));
			}
			
			// Get the correct colour depending on the current value
			var colour = "",
				value = "";
			if (isNaN(parseFloat(this.value))) {
				value = this.value;
				colour = this.colours[0].colour;
			} else {
				value = Math.round(Math.max(this.value, 0));	// Clamp value above 0 if numeric
				for (var i = 0, length = this.colours.length; i < length; i++) {
					if (this.value <= this.colours[i].value) {
						colour = this.colours[i].colour;
						break;
					}
				}
				
				// Add max value if available
				if (this.maxValue) {
					value += " / " + this.maxValue;
				}
			}
			context.fillStyle = colour;
			context.textBaseline = "middle";
			context.textAlign = this.textAlign;
			context.font = this.font;
			context.fillText(value, this.sprite ? this.sprite.tileSize.X / 2 : 0, 0);
			context.restore();
		}
	};
}());