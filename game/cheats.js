"use strict";
Z.cheats = (function() {
	var settings = function(k, v) {
		Z.settings[k] = v === undefined ? !Z.settings[k] : !!v;
	};
	
	return {
		godMode: function(set) {
			settings("godMode", set);
			console.log("God mode " + (Z.settings.godMode ? "enabled" : "disabled"));
		},
		infiniteAmmo: function(set) {
			settings("infiniteAmmo", set);
			console.log("Infinite ammo " + (Z.settings.infiniteAmmo ? "enabled" : "disabled"));
		},
		zombiesEnabled: function(set) {
			settings("zombiesEnabled", set);
			console.log("Zombies " + (Z.settings.zombiesEnabled ? "enabled" : "disabled"));
		},
		zombieAIEnabled: function(set) {
			settings("zombieAIEnabled", set);
			console.log("Zombie AI " + (Z.settings.zombieAIEnabled ? "enabled" : "disabled"));
		},
		giveHealth: function() {
			Z.player.health = Z.player.maxHealth;
			console.log("Player health set to maximum");
		},
		giveArmour: function() {
			Z.player.armour = Z.player.maxArmour;
			console.log("Player armour set to maximum");
		},
		giveSerum: function() {
			Z.player.inventory["serum"] = Z.player.maxInventory["serum"];
			console.log("Player has " + Z.player.inventory["serum"] + " zombie serum vials");
		},
		giveWeapons: function() {
			var weapons = [Z.weapon.create(Z.content.items["weapon_push"])],
				weapon = null;
			for (var i in Z.content.items["player"].defaultWeapons) {
				weapon = Z.weapon.create(Z.content.items[i]);
				weapons.push(weapon);
				Z.player.inventory[weapon.ammoType] = Z.player.maxInventory[weapon.ammoType];
				console.log("Added weapon " + weapon.name);
			}
			Z.player.weapons = weapons;
		}
	};
}());