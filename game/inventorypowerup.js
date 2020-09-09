"use strict";
Z.inventoryPowerup = (function(base) {
	var _inventory = Object.create(base);
	_inventory.inventoryType = "";
	_inventory.amount = 0;
	_inventory.inventoryType2 = "";	// Optional secondary inventory type and amount
	_inventory.amount2 = 0;
	_inventory.create = function(position, data) {
		var i = base.create.call(this, position, data);
		i.inventoryType = data.inventoryType || i.inventoryType;
		i.amount = data.inventoryAmount || i.amount;
		if (data.inventoryType2) {
			i.inventoryType2 = data.inventoryType2;
			i.amount2 = data.inventoryAmount2;
		}
		return i;
	};
	_inventory.pickup = function() {
		// Add to inventory (unless full, in which case leave the powerup)
		if (Z.player.addInventory(this.inventoryType, this.amount)) {
			base.pickup.call(this);
		}
		
		// Add secondary inventory type (if there is one)
		if (this.inventoryType2 && Z.player.addInventory(this.inventoryType2, this.amount2)) {
			base.pickup.call(this);
		}
	};
	return _inventory;
}(Z.powerup));