"use strict";
Z.weaponPowerup = (function(base) {
	var _weapon = Object.create(base);
	_weapon.weaponData = null;
	_weapon.amount = 0;
	_weapon.create = function(position, data) {
		var weaponData = Z.content.items[data.weapon],
			w = null;
		data.sprite = weaponData.sprite;
		data.name = weaponData.name;
		data.size = weaponData.size;
		w = base.create.call(this, position, data);
		w.weaponData = weaponData;
		w.amount = data.ammoAmount || w.amount;
		w.pickupEffect.spriteOffset = vec2.sub(vec2(
			(-w.sprite.tileSize.X / 2) + (w.weaponData.size[0] / 2),
			(-w.sprite.tileSize.Y / 2) + (w.weaponData.size[1] / 2)
		), w.sprite.actorOffset);
		return w;
	};
	
	// Called when this power-up is picked up by the player
	_weapon.pickup = function() {
		var exists = false;
		for (var i = Z.player.weapons.length; i--;) {
			if (Z.player.weapons[i].name == this.weaponData.name) {
				exists = true;
				break;
			}
		}
		
		// Add ammo to player unless it is at maximum
		if (Z.player.addInventory(this.weaponData.ammoType, this.amount)) {
			base.pickup.call(this);
		}
		
		// Add weapon to player if not already holding it
		if (!exists) {
			var weapon = Z.weapon.create(this.weaponData);
			Z.player.weapons.push(weapon);
			
			// Sort player's weapons
			Z.player.weapons.sort(function(a, b) { return a.index - b.index; });
			
			// Switch to the new weapon
			for (var i = Z.player.weapons.length; i--;) {
				if (Z.player.weapons[i].name == weapon.name) {
					Z.player.weapon = i;
					break;
				}
			}
			base.pickup.call(this);
		}
	};
	_weapon.draw = function(context) {
		if (this.sprite) {
			var offset = vec2(
				(-this.sprite.tileSize.X / 2) + (this.weaponData.size[0] / 2),
				(-this.sprite.tileSize.Y / 2) + (this.weaponData.size[1] / 2)
			);
			offset = vec2.sub(offset, this.sprite.actorOffset);
			this.sprite.draw(context, vec2.add(this.position, offset), this.direction);
		}
		if (Z.settings.showCollisionBox) {
			context.save();
			context.strokeStyle = "#0f0";
			context.translate(this.position.X, this.position.Y);
			context.strokeRect(0, 0, this.size.X, this.size.Y);
			context.restore();
		}
	};
	return _weapon;
}(Z.powerup));