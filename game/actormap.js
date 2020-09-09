"use strict";
Z.actorMap = (function() {
	var UPDATE_BUFFER_AREA = 2,		// Update actors in the viewport plus buffer area (section size)
		DRAW_BUFFER_AREA = 2,		// Draw actors in the viewport plus buffer area
		DISPOSE_BUFFER_AREA = 1200;	// Actors outside this area will be disposed
	
	var _actors = [],				// Current actors in game world
		_map = [],					// Spatial hash map of actors in current world sections
		_collisions = [];			// Actor collisions this frame
	
	// Return a list of sections that the specified actor overlaps
	var getActorSections = function(actor) {
		var sections = [],
			position = actor.position,
			size = actor.size;
		if (actor.type == "car") {
			position = vec2.sub(position, vec2.div(size, 2));
		}
		
		// If this is a large actor (any dimension larger than section size), then get every
		// section covered by actor
		if (Math.max(size.X, size.Y) >= Z.settings.sectionSize) {
			var topLeft = Z.utilities.section(position),
				bottomRight = Z.utilities.section(vec2.add(position, size));
			if (topLeft.X < bottomRight.X && topLeft.Y < bottomRight.Y) {
				for (var x = topLeft.X; x <= bottomRight.X; x++) {
					for (var y = topLeft.Y; y <= bottomRight.Y; y++) {
						sections.push(vec2(x, y));
					}
				}
			} else if (topLeft.X < bottomRight.X) {
				for (var x = topLeft.X; x <= bottomRight.X; x++) {
					sections.push(vec2(x, topLeft.Y));
				}
			} else if (topLeft.Y < bottomRight.Y) {
				for (var y = topLeft.Y; y <= bottomRight.Y; y++) {
					sections.push(vec2(topLeft.X, y));
				}
			} else {
				sections.push(topLeft);
			}
		} else {	// Otherwise get current section and adjacent sections
			var extendRight = false;
			sections.push(Z.utilities.section(position));
			if (position.X + size.X > (sections[0].X + 1) * Z.settings.sectionSize) {
				sections.push(vec2.add(sections[0], vec2(1, 0)));
				extendRight = true;
			}
			if (position.Y + size.Y > (sections[0].Y + 1) * Z.settings.sectionSize) {
				sections.push(vec2.add(sections[0], vec2(0, 1)));
				if (extendRight) {
					sections.push(vec2.add(sections[0], vec2(1, 1)));
				}
			}
		}
		return sections;
	};
	
	// Update actors in the specified section and check for collisions
	var updateSection = function(section, elapsedTime) {
		var result = null,
			actors = _map[Z.utilities.hash(section)] || [];
		
		// Update actors in this section (actors can exist in multiple sections, so make sure we
		// only update actors positioned in this section, not overlapping into this section)
		for (var i = actors.length; i--;) {
			var actorSection = Z.utilities.section(actors[i].position);
			if (vec2.eq(actorSection, section)) {
				actors[i].update(elapsedTime);
			}
		}
		
		// Check actors for collisions
		for (var i = 0, length = actors.length; i < length; i++) {
			for (var j = i + 1; j < length; j++) {
				// Hack - sometimes buildings are spawned on top of each other - this will remove
				// them when found (only one should be removed)
				if (actors[i].type == "building" &&
					actors[j].type == "building" &&
					vec2.eq(actors[i].position, actors[j].position) &&
					!actors[i].dispose) {
					actors[i].dispose = true;
				}
				if (result = Z.collision.checkActors(actors[i], actors[j])) {
					_collisions.push(result);
				}
			}
		}
	};
	
	return {
		map: [],
		zombieCount: 0,
		push: function(actor) {
			_actors.push(actor);
		},
		clear: function() {
			_actors = [];
		},
		update: function(elapsedTime) {
			var zombieCount = 0;
			_map = [];
			_collisions = [];
			
			// Get the sections currently within the screen & buffer area
			var buffer = UPDATE_BUFFER_AREA * Z.settings.sectionSize,
				topLeft = vec2.sub(Z.camera.bounds, buffer),
				bottomRight = vec2.add(vec2.add(Z.camera.size, buffer * 2), topLeft);
			
			// Build spatial hash map
			var sections = null,	// An array of sections that the current actor overlaps
				sectionCount = 0,	// The number of sections this frame
				hash = "";			// The current section hash
			for (var i = _actors.length; i--;) {
				// Check actor is within update range
				if (_actors[i].position.X > topLeft.X && _actors[i].position.X <= bottomRight.X &&
					_actors[i].position.Y > topLeft.Y && _actors[i].position.Y <= bottomRight.Y) {
					sections = getActorSections(_actors[i]);
					for (var j = sections.length; j--;) {
						hash = Z.utilities.hash(sections[j]);
						if (!_map[hash]) {
							_map[hash] = [_actors[i]];
							sectionCount++;
						} else {
							_map[hash].push(_actors[i]);
						}
						
						// Count zombies
						zombieCount++;
					}
					
					// Move actor using moveVector from last frame
					_actors[i].position = vec2.add(_actors[i].position, _actors[i].moveVector);
				}
			}
			this.map = _map;
			this.zombieCount = zombieCount;
			
			// Update actors in the current sections (this populates _collisions)
			var sectionPosition = null;
			for (var i in _map) {
				if (!_map.hasOwnProperty(i)) { continue; }
				sectionPosition = vec2.fromString(i);
				updateSection(sectionPosition, elapsedTime);
			}
			
			// Handle collisions
			for (var i = _collisions.length; i--;) {
				_collisions[i].call(this);
			}
			
			// Remove disposed actors and actors outside of the dispose buffer area
			_actors = _actors.filter(function(a) {
				if (a.dispose) { return false; }
				return (a.type == "building" || a.type == "player") || (
					a.position.X > (Z.camera.bounds.X - DISPOSE_BUFFER_AREA) &&
					a.position.X < (Z.camera.bounds.X + Z.camera.size.X + DISPOSE_BUFFER_AREA) &&
					a.position.Y > (Z.camera.bounds.Y - DISPOSE_BUFFER_AREA) &&
					a.position.Y < (Z.camera.bounds.Y + Z.camera.size.Y + DISPOSE_BUFFER_AREA)
				);
			});
		},
		draw: function(context) {
			// Get the visible screen bounds (plus buffer size)
			var buffer = DRAW_BUFFER_AREA * Z.settings.sectionSize,
				topLeft = vec2.sub(Z.camera.bounds, buffer),
				bottomRight = vec2.add(
					vec2.add(Z.camera.size, buffer * 2),
					topLeft
				),
				actors = [];
			
			// Get a list of actors in visible sections
			for (var i = _actors.length; i--;) {
				if (_actors[i].position.X > topLeft.X && _actors[i].position.X <= bottomRight.X &&
					_actors[i].position.Y > topLeft.Y && _actors[i].position.Y <= bottomRight.Y) {
					actors.push(_actors[i]);
				}
			}
			
			// Sort visible actors
			actors.sort(function(a, b) {
				// If either actor has a non-zero zIndex, sort by zIndex
				if (a.zIndex || b.zIndex) {
					return b.zIndex - a.zIndex;
				}
				
				// Otherwise sort by y-position (from bottom edge)
				var ay = a.position.Y + a.size.Y,
					by = b.position.Y + b.size.Y;
				if (ay == by) {
					return b.position.X - a.position.X;
				}
				return by - ay;
			});
			for (var i = actors.length; i--;) {
				actors[i].draw(context);
			}
		}
	};
}());