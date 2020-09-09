"use strict";

// Global settings
Z.settings = {
	debug: true,						// Enable debug messages
	contentPath: "server/",				// The main content list path
	sectionSize: 200,					// Actor map is divided into squares of this size (in pixels)
	cellSize: 600,						// Background map is divided into squares of this size (in pixels)
	mapCellSize: 16,					// Cell size when drawn on the in-game map
	defaultMapSize: vec2(400, 300),		// Default map popup window size
	godMode: false,						// Enable god mode (no damage, cannot get infected)
	infiniteAmmo: false,				// Enable infinite ammo (weapons with magazines won't need to reload)
	zombiesEnabled: true,				// Enable zombie generator
	zombieAIEnabled: true,				// Enable zombie AI
	spriteGeneratorEnabled: true,		// Enable sprite generator (if false, will only create one of each type)
	dayCycleEnabled: true,				// Enable day/night cycle and lightmap
	shadowsEnabled: true,				// Enable building shadows (day/night cycle must also be enabled)
	showCollisionBox: false,			// Enable collision boundary markers around actors
	audioEnabled: true					// Enable sound effects
};

// Actor damage types
Z.damageType = {
	headBody: 0,			// Head or body damage, depending on hit box collision point
	head: 1,				// Head damage (kills actor when <= 0)
	body: 2,				// Body damage (actor falls then starts regenerating when <= 0)
	push: 3,				// Push (actor falls and immediately gets up when <= 0),
	fire: 4					// Sets zombies on fire
};

// Weapon types
Z.weaponType = {
	rayCast: 0,				// Ray-cast weapon (cast ray from actor, detect actor hit)
	projectile: 1			// Projectile weapon (spawn new actor at actor position)
};

// Zombie AI states
Z.zombieState = {
	idle: 0,				// Standing while looking around randomly
	wander: 1,				// Wandering randomly
	alerted: 2,				// Following current alert position
	excited: 3				// Moving quickly towards player (line of sight)
};

// Power-up types
Z.powerupType = {
	health: 0,				// Restores player health
	armour: 1,				// Restores player armour
	inventory: 2,			// Ammo & other items
	weapon: 3				// Adds weapon (or ammo if player already has weapon)
};

// World biomes
Z.biomes = {
	grass: 0,				// Grassland
	forest: 1,				// Forest
	suburb: 2,				// Suburb
	city: 3,				// City
	industrial: 4			// Industrial
};