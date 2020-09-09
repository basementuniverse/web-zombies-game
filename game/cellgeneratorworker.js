importScripts(
	"../common/seedrandom.js",
	"../common/perlin.js",
	"../common/vec2.js",
	"cellgeneratorsettings.js"
);

var NOISE_SCALE = 24.789,
	ROAD_NOISE_SIZE = 256,
	BUILDING_NOISE_SIZE = 256,
	CENTER = 4, LEFT = 3, RIGHT = 5, TOP = 1, BOTTOM = 7,
	ROADTOP = 0, ROADRIGHT = 1, ROADBOTTOM = 2, ROADLEFT = 3;

var cellSize = 0,
	buildingPlotSize = 0,
	buildingBlockSize = 0,
	forestAmount = 0,
	suburbAmount = 0,
	cityAmount = 0,
	industrialAmount = 0,
	roadOffset = 0,
	highwaySize = 0,
	buildingAmounts = [],
	forestDensity = 0,
	grassTreeAmount = 0,
	powerupRate = null,
	powerupAmounts = [],
	powerupWeight = 0,
	seedRoadTypes = [],
	seedRoadTypeWeights = [],
	buildingSizes = [],
	buildingSizeWeights = [],
	highwayCarAmount = 0,
	carAmounts = [],
	carTypes = [],
	carTypeWeight = 0,
	carStats = {};

var forestPermutations = [],
	cityPermutations1 = [],
	cityPermutations2 = [],
	industrialPermutations = [],
	roadPermutations = [],
	buildingPermutations = [],
	visited = [];

self.addEventListener("message", function(e) {
	if (e.data.command == "initialise") {
		initialise(e.data);
	} else if (e.data.command == "generate" && e.data.position) {
		self.postMessage({
			position: e.data.position,
			cellData: getCell(e.data.position)
		});
	}
}, false);

var initialise = function(data) {
	smath.seedrandom(data.seed || Math.random());
	cellSize = data.cellSize;
	forestAmount = data.forestAmount;
	cityAmount = data.cityAmount;
	industrialAmount = data.industrialAmount;
	suburbAmount = data.suburbAmount;
	highwaySize = data.highwaySize;
	buildingAmounts = data.buildingAmounts;
	forestDensity = data.forestDensity;
	grassTreeAmount = data.grassTreeAmount;
	powerupRate = data.powerupRate;
	powerupAmounts = data.powerupAmounts;
	powerupWeight = 0;
	for (var i in powerupAmounts) {
		if (!powerupAmounts.hasOwnProperty(i)) { continue; }
		powerupWeight += powerupAmounts[i];
	}
	seedRoadTypes = data.seedRoadTypes;
	seedRoadTypeWeights = [];
	for (var i = seedRoadTypes.length; i--;) {
		seedRoadTypeWeights[i] = 0;
		for (var j in seedRoadTypes[i]) {
			if (!seedRoadTypes[i].hasOwnProperty(j)) { continue; }
			seedRoadTypeWeights[i] += seedRoadTypes[i][j];
		}
	}
	buildingSizes = data.buildingSizes;
	buildingSizeWeights = [];
	for (var i = buildingSizes.length; i--;) {
		buildingSizeWeights[i] = 0;
		for (var j in buildingSizes[i]) {
			if (!buildingSizes[i].hasOwnProperty(j)) { continue; }
			buildingSizeWeights[i] += buildingSizes[i][j];
		}
	}
	
	highwayCarAmount = data.highwayCarAmount;
	carAmounts = data.carAmounts;
	carTypes = data.carTypes;
	carStats = data.carStats;
	carTypeWeight = 0;
	for (var i in carTypes) {
		if (!carTypes.hasOwnProperty(i)) { continue; }
		carTypeWeight += carTypes[i];
	}
	
	roadOffset = Math.floor(smath.random() * highwaySize);
	buildingPlotSize = Math.floor(cellSize / 3);
	buildingBlockSize = Math.floor(buildingPlotSize / 5);
	visited = [];
	
	// Initialise perlin noise permutations arrays
	for (var i = 0; i < 256; i++) {
		forestPermutations[256 + i] = forestPermutations[i] = Math.floor(smath.random() * 256);
		cityPermutations1[256 + i] = cityPermutations1[i] = Math.floor(smath.random() * 256);
		cityPermutations2[256 + i] = cityPermutations2[i] = Math.floor(smath.random() * 256);
		industrialPermutations[256 + i] = industrialPermutations[i] = Math.floor(smath.random() * 256);
	}
	
	// Initialise road permutations array
	var length = ROAD_NOISE_SIZE * ROAD_NOISE_SIZE;
	for (var i = 0; i < length; i++) {
		roadPermutations[i] = smath.random();
	}
	
	// Initialise building permutations array
	length = BUILDING_NOISE_SIZE * BUILDING_NOISE_SIZE;
	for (var i = 0; i < length; i++) {
		buildingPermutations[i] = smath.random();
	}
};

var getCell = function(position) {
	var cells = [],
		offsets = [
			vec2(-1, -1), vec2(0, -1), vec2(1, -1),
			vec2(-1,  0), vec2(0,  0), vec2(1,  0),
			vec2(-1,  1), vec2(0,  1), vec2(1,  1)
		];
	
	// Get cell and surrounding cells
	for (var i = 0; i < 9; i++) {
		cells.push(cellData(vec2.add(position, offsets[i])));
	}
	
	// Match road pattern if this is a non-seed-road tile
	if ((Math.abs(position.X) + Math.abs(position.Y)) % 2 == 0) {
		cells[CENTER].road = roadPattern(cells);
	}
	
	// Create buildings, trees and powerups
	var buildings = [],
		building = null,
		trees = [],
		powerups = [],
		cars = [],
		carChance = (
				cells[CENTER].road == "v_h" ||
				cells[CENTER].road == "h_h" ||
				cells[CENTER].road == "cross_h"
			) ? highwayCarAmount : carAmounts[cells[CENTER].biome],
		plots = buildingPlots[cells[CENTER].road],
		plot = vec2(),
		n = 0;
	if (plots) {	// Cells are divided into 3*3 building plots
		for (var y = 0; y < 3; y++) {
			for (var x = 0; x < 3; x++) {
				plot = vec2(x, y);
				if (plots[n]) {		// Check if this building plot can have buildings in it
					building = randomBuilding(position, cells[CENTER].biome, plot);
					if (building) {		// Place building here
						buildings.push(building);
					} else if (cells[CENTER].biome == biomes.forest) {	// Otherwise place a forest
						var treeCount = Math.floor(Math.random() * forestDensity);
						for (var i = treeCount; i--;) {
							trees.push(randomTree(position, plot));
						}
					} else if (			// Otherwise place random sparse trees
						(cells[CENTER].biome == biomes.grass || cells[CENTER].biome == biomes.suburb) &&
						Math.random() <= grassTreeAmount
					) {
						trees.push(randomTree(position, plot));
					}
				} else {			// If this is an empty plot, randomly create cars
					if (Math.random() < carChance) {
						cars.push(randomCar(position, plot));
					}
				}
				n++;
			}
		}
	}
	
	// Create powerups
	for (var n = powerupRate.count; n--;) {
		if (Math.random() <= powerupRate.chance) {
			powerups.push(randomPowerup(position));
		}
	}
	return {
		position: position,
		biome: cells[CENTER].biome,
		road: cells[CENTER].road,
		buildings: buildings,
		trees: trees,
		powerups: powerups,
		cars: cars
	};
};

var cellData = function(position) {
	var hash = vec2.toString(position);
	if (visited[hash]) {
		return visited[hash];
	} else {
		var result = { biome: biomes.grass, road: "e" },
			p = vec2.div(position, NOISE_SCALE),
			city = perlin.get(p, cityPermutations1),
			forest = perlin.get(p, forestPermutations);
		
		// Get biome
		if (city < cityAmount || perlin.get(p, cityPermutations2) < cityAmount) {
			result.biome = (perlin.get(p, industrialPermutations) < industrialAmount) ?
				biomes.industrial : biomes.city;
		} else if (city < suburbAmount) {
			result.biome = biomes.suburb;
		} else if (forest < forestAmount) {
			result.biome = biomes.forest;
		}
		
		var modX = (Math.abs(position.X) + roadOffset) % highwaySize,
			modY = (Math.abs(position.Y) + roadOffset) % highwaySize;
		
		// If a grass cell is within 2 cells of a highway, change it to suburb
		if ((modX <= 2 || modX >= highwaySize - 2 || modY <= 2 || modY >= highwaySize - 2) &&
			result.biome == biomes.grass) {
			result.biome = biomes.suburb;
		}
		
		// Get road
		if ((Math.abs(position.X) + Math.abs(position.Y)) % 2 == 1) {
			var modX = (Math.abs(position.X) + roadOffset) % highwaySize,
				modY = (Math.abs(position.Y) + roadOffset) % highwaySize;
			// Check if there is a seed road at this cell (ie. within one cell of a highway
			// or inside a city/suburb)
			if ((modX == 1 || modX == highwaySize - 1 || modY == 1 || modY == highwaySize - 1) ||
				(result.biome != biomes.grass && result.biome != biomes.forest)) {
				result.road = randomRoadType(position, result.biome);
			}
			
			// Check if there is a highway at this cell
			if (modX == 0 && modY == 0) {
				result.road = "cross_h";
			} else if (modX == 0) {
				result.road = "v_h";
			} else if (modY == 0) {
				result.road = "h_h";
			}
		}
		visited[hash] = result;
		return result;
	}
};

// Return a random road type for the specified position and biome
var randomRoadType = function(position, biome) {
	var check = function(i) {
			if (i < 0) {
				return ROAD_NOISE_SIZE - (Math.abs(i + 1) % ROAD_NOISE_SIZE) - 1;
			}
			return i % ROAD_NOISE_SIZE;
		},
		x = check(position.X),
		y = check(position.Y);
	return seededRoadType(biome, roadPermutations[x + y * ROAD_NOISE_SIZE]);
};

// Return a weighted seed road type for the specified biome and (seeded) random value
var seededRoadType = function(biome, r) {
	var w = 0;
	for (var i in seedRoadTypes[biome]) {
		if (!seedRoadTypes[biome].hasOwnProperty(i)) { continue; }
		w += seedRoadTypes[biome][i] / seedRoadTypeWeights[biome];
		if (w >= r) {
			w = i;
			break;
		}
	}
	return w;
};

// Check surrounding roads and return the correct road type for the center cell
var roadPattern = function(cells) {
	var check = function(i, c, r1, r2) {
		if (!cells[c] || !cells[c].road) {
			return !roadPatterns[i][r1];
		} else {
			return (
				(!cells[c].road && !roadPatterns[i][r1]) ||
				roadPatterns[cells[c].road][r2] == roadPatterns[i][r1]
			);
		}
	};
	for (var i in roadPatterns) {
		if (!roadPatterns.hasOwnProperty(i)) { continue; }
		if (check(i, TOP, ROADTOP, ROADBOTTOM) &&
			check(i, RIGHT, ROADRIGHT, ROADLEFT) &&
			check(i, BOTTOM, ROADBOTTOM, ROADTOP) &&
			check(i, LEFT, ROADLEFT, ROADRIGHT)) {
			return i;
		}
	}
	return null;
};

// Return a randomly generated building (or null if building chance for this cell and plot position
// is below building amount for this biome)
var randomBuilding = function(position, biome, plot) {
	var check = function(i) {
			if (i < 0) {
				return BUILDING_NOISE_SIZE - (Math.abs(i + 1) % BUILDING_NOISE_SIZE) - 1;
			}
			return i % BUILDING_NOISE_SIZE;
		},
		p = vec2(position.X || 15, position.Y || 54);	// Offset zero by some random amount
	
	// Get random building size
	p = vec2.mul(p, vec2.add(plot, 1));
	var x = check(p.X), x2 = check(p.X + 5), x3 = check(p.X + 10), x4 = check(p.X + 15),
		y = check(p.Y), y2 = check(p.Y + 5), y3 = check(p.Y + 10), y4 = check(p.Y + 15),
		i = buildingPermutations[x + y * BUILDING_NOISE_SIZE];
	if (i <= buildingAmounts[biome]) {
		var i2 = buildingPermutations[x2 + y2 * BUILDING_NOISE_SIZE],
			i3 = buildingPermutations[x3 + y3 * BUILDING_NOISE_SIZE],
			i4 = buildingPermutations[x4 + y4 * BUILDING_NOISE_SIZE],
			size = randomBuildingSize(biome, i2),
			offset = vec2(
				Math.floor(i3 * (5 - size.X)),
				Math.floor(i4 * (5 - size.Y))
			);
		
		// Get world pixel position from cell position
		var plotOffset = vec2.add(vec2.mul(plot, buildingPlotSize), -1),
			worldPosition = vec2.add(vec2.mul(position, cellSize), plotOffset);
		worldPosition = vec2.add(worldPosition, vec2.mul(offset, buildingBlockSize));
		return {
			position: worldPosition,
			size: vec2.mul(size, buildingBlockSize),
			spriteSize: size
		};
	} else {
		return null;
	}
};

var randomBuildingSize = function(biome, r) {
	var w = 0;
	for (var i in buildingSizes[biome]) {
		if (!buildingSizes[biome].hasOwnProperty(i)) { continue; }
		w += buildingSizes[biome][i] / buildingSizeWeights[biome];
		if (w >= r) {
			w = i;
			break;
		}
	}
	return vec2.fromString(w);
};

var randomTree = function(position, plot) {
	var plotOffset = vec2.mul(plot, buildingPlotSize),
		worldPosition = vec2.add(vec2.mul(position, cellSize), plotOffset);
	worldPosition = vec2.add(
		worldPosition,
		vec2(Math.random() * buildingPlotSize, Math.random() * buildingPlotSize)
	);
	return {
		position: worldPosition
	};
};

var randomPowerup = function(position) {
	var r = Math.random(),
		w = 0;
	for (var i in powerupAmounts) {		// Select a powerup
		if (!powerupAmounts.hasOwnProperty(i)) { continue; }
		w += powerupAmounts[i] / powerupWeight;
		if (w >= r) {
			w = i;
			break;
		}
	}
	
	// Get random world position
	var worldPosition = vec2.add(
		vec2.mul(position, cellSize),
		vec2(Math.random() * cellSize, Math.random() * cellSize)
	);
	return {
		position: worldPosition,
		type: w
	};
};

var randomCar = function(position, plot) {
	var r = Math.random(),
		w = 0;
	for (var i in carTypes) {		// Select a car type
		if (!carTypes.hasOwnProperty(i)) { continue; }
		w += carTypes[i] / carTypeWeight;
		if (w >= r) {
			w = i;
			break;
		}
	}
	
	// Get random world position
	var plotOffset = vec2.mul(plot, buildingPlotSize),
		worldPosition = vec2.add(vec2.mul(position, cellSize), plotOffset);
	worldPosition = vec2.add(
		worldPosition,
		vec2(Math.random() * buildingPlotSize, Math.random() * buildingPlotSize)
	);
	
	// Random direction
	var direction = vec2.norm(vec2((Math.random() * 2) - 1, (Math.random() * 2) - 1));
	
	// Get random health/fuel
	var health = 0,
		fuel = 0;
	if (Math.random() < carStats.destroyedChance) {
		health = Math.round(carStats.minHealth + (Math.random() * (carStats.maxHealth - carStats.minHealth)));
		if (Math.random() < carStats.fuelChance) {
			fuel = Math.round(carStats.minFuel + (Math.random() * (carStats.maxFuel - carStats.minFuel)));
		}
	}
	return {
		position: worldPosition,
		direction: direction,
		type: w,
		health: health,
		fuel: fuel
	};
};