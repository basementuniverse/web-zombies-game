"use strict";
Z.collision = (function() {
	var INSIDE = 0,			// Bit codes for Cohen–Sutherland line/AABB algorithm
		LEFT = 1,
		RIGHT = 2,
		BOTTOM = 4,
		TOP = 8;
	
	// Get an actor's collision bounding box
	var getBoundingBox = function(a) {
		var p = a.position,
			s = a.size;
		if (a.type == "car") {
			s = Math.max(s.X, s.Y) / 2;
			return { left: p.X - s, right: p.X + s, top: p.Y - s, bottom: p.Y + s };
		}
		return { left: p.X, right: p.X + s.X, top: p.Y, bottom: p.Y + s.Y };
	};
	
	// Get an actor's ray-cast hit bounding box (return bounding box if there is no hit box)
	var getHitBox = function(a) {
		if (!a.hitBox || (!a.hitBox.size.X && !a.hitBox.size.Y)) {
			return getBoundingBox(a);
		}
		var p = vec2.add(a.position, a.hitBox.offset),
			s = a.hitBox.size;
		return { left: p.X, right: p.X + s.X, top: p.Y, bottom: p.Y + s.Y };
	};
	
	// Get an actor's corner vertices
	var getPoints = function(a) {
		return (a.type == "car") ? getPointsOBB(a) : getPointsAABB(a);
	};
	
	// Get the corner vertices for an OBB
	var getPointsOBB = function(a) {
		var topLeft = vec2.div(vec2(-a.size.X, -a.size.Y), 2),
			topRight = vec2.div(vec2(a.size.X, -a.size.Y), 2),
			bottomRight = vec2.div(vec2(a.size.X, a.size.Y), 2),
			bottomLeft = vec2.div(vec2(-a.size.X, a.size.Y), 2),
			r = vec2.rad(a.direction);
		topLeft = vec2.rot(topLeft, r);
		topRight = vec2.rot(topRight, r);
		bottomRight = vec2.rot(bottomRight, r);
		bottomLeft = vec2.rot(bottomLeft, r);
		return [
			vec2.add(a.position, topLeft), 
			vec2.add(a.position, topRight),
			vec2.add(a.position, bottomRight),
			vec2.add(a.position, bottomLeft)
		];
	};
	
	// Get the corner vertices for an AABB
	var getPointsAABB = function(a) {
		var bottomRight = vec2.add(a.position, a.size);
		return [
			vec2(a.position),
			vec2(bottomRight.X, a.position.Y),
			vec2(bottomRight.X, bottomRight.Y),
			vec2(a.position.X, bottomRight.Y)
		];
	};
	
	// Get a list of edge vectors from a list of points
	var getEdges = function(p) {
		return [
			vec2.sub(p[1], p[0]),
			vec2.sub(p[2], p[1]),
			vec2.sub(p[3], p[2]),
			vec2.sub(p[0], p[3])
		];
	};
	
	// Project a list of points p onto an axis and return the minimum and maximum projection
	var projectPoints = function(axis, p) {
		var min = Infinity,
			max = -Infinity;
		for (var i = p.length; i--;) {
			var dot = vec2.dot(axis, p[i]);
			min = Math.min(min, dot);
			max = Math.max(max, dot);
		}
		return {
			min: min,
			max: max
		};
	};
	
	// Get the bit code for the specified position and box
	var getOutCode = function(position, box) {
		var code = INSIDE;
		code |= (position.X < box.left) ? LEFT : (position.X > box.right) ? RIGHT : 0;
		code |= (position.Y < box.top) ? TOP : (position.Y > box.bottom) ? BOTTOM : 0;
		return code;
	};
	
	// Checks if a line (p1 to p2) intersects an AABB box and returns the closest
	// point to the origin if there is an intersection, otherwise returns false
	var intersectLineAABB = function(p1, p2, box) {
		var origin = vec2(p1.X, p1.Y),
			p1Code = getOutCode(p1, box),
			p2Code = getOutCode(p2, box),
			intersects = false;
		while (true) {
			if (!(p1Code | p2Code)) {		// Both points are in the central (box) region
				intersects = true;
				break;
			} else if (p1Code & p2Code) {	// Both points are outside the central region
				break;
			} else {						// Points intersect central region (inside & outside)
				var i = vec2(),
					outside = p1Code ? p1Code : p2Code;		// Check which point is outside
				
				// Find intersection
				if (outside & TOP) {
					i.X = p1.X + (p2.X - p1.X) * (box.top - p1.Y) / (p2.Y - p1.Y);
					i.Y = box.top;
				} else if (outside & BOTTOM) {
					i.X = p1.X + (p2.X - p1.X) * (box.bottom - p1.Y) / (p2.Y - p1.Y);
					i.Y = box.bottom;
				} else if (outside & RIGHT) {
					i.X = box.right;
					i.Y = p1.Y + (p2.Y - p1.Y) * (box.right - p1.X) / (p2.X - p1.X);
				} else if (outside & LEFT) {
					i.X = box.left;
					i.Y = p1.Y + (p2.Y - p1.Y) * (box.left - p1.X) / (p2.X - p1.X);
				}
				
				// Move the outside point to the intersection position ready for the next pass
				if (outside == p1Code) {
					p1 = i;
					p1Code = getOutCode(p1, box);
				} else {
					p2 = i;
					p2Code = getOutCode(p2, box);
				}
			}
		}
		if (intersects) {	// Line intersects box, so return the closest point to the origin
			var p1d = vec2.sub(origin, p1),
				p2d = vec2.sub(origin, p2);
			return (vec2.len(p1d) < vec2.len(p2d)) ? p1 : p2;
		}
		return false;		// Line doesn't intersect box
	};
	
	return {
		// Check two actors to see if they are colliding. Returns an anonymous function for
		// handling the collision or false if there was no collision
		checkActors: function(a, b) {
			// If either actor is a non-colliding actor, there is no collision
			if (!a.collide || !b.collide) { return false; }
			var aBox = getBoundingBox(a),
				bBox = getBoundingBox(b);
			
			// Check if collision rectangles overlap
			if (!(aBox.right < bBox.left || aBox.bottom < bBox.top ||
				aBox.left > bBox.right || aBox.top > bBox.bottom)) {
				var collision = true,
					aPoints = getPoints(a),
					bPoints = getPoints(b),
					edges = getEdges(aPoints).concat(getEdges(bPoints)),
					aResult = null,
					bResult = null,
					axis = vec2(),
					interval = 0,
					minInterval = Infinity,
					translationAxis = vec2();
				for (var i = edges.length; i--;) {
					axis = vec2.norm(vec2(-edges[i].Y, edges[i].X));
					aResult = projectPoints(axis, aPoints);
					bResult = projectPoints(axis, bPoints);
					interval = aResult.min < bResult.min ? bResult.min - aResult.max : aResult.min - bResult.max;
					if (interval >= 0) {
						collision = false;
						break;
					} else {
						interval = Math.abs(interval);
						if (interval < minInterval) {
							minInterval = interval;
							translationAxis = vec2.mul(axis, aResult.min < bResult.min ? 1 : -1);
						}
					}
				}
				if (collision) {
					var mtv = vec2.mul(translationAxis, minInterval);
					return function() {
						a.handleCollision(b, mtv);
						b.handleCollision(a, vec2.mul(mtv, -1));
					};
				}
			}
			return null;
		},
		
		// Return true if a point p is inside an actor, otherwise return false
		checkPoint: function(p, ignore) {
			var actors = Z.actorMap.map[Z.utilities.hash(Z.utilities.section(p))] || [],
				a = null;
			for (var i = actors.length; i--;) {
				a = getBoundingBox(actors[i]);
				if (p.X > a.left && p.X <= a.right && p.Y > a.top && p.Y <= a.bottom) {
					if (actors[i].type == "car") {
						var delta = vec2.sub(p, actors[i].position),
							s = vec2(actors[i].size, 2);
						vec2.rot(delta, -vec2.rad(actors[i].direction));
						if (delta.X >= -s.X && delta.X < s.X && delta.Y >= -s.Y && delta.Y < s.Y) {
							return ignore ? ignore(actors[i]) : true;
						}
					} else {
						return ignore ? ignore(actors[i]) : true;
					}
				}
			}
			return false;
		},
		
		// Check if a line (origin to target) intersects an actor and return the point of
		// intersection and the actor if there is an intersection
		castRay: function(origin, target, ignore) {
			// Get map sections within origin and target bounding box
			var topLeft = vec2.sub(Z.utilities.section(
					vec2(Math.min(origin.X, target.X), Math.min(origin.Y, target.Y))
				), 1),
				bottomRight = vec2.add(Z.utilities.section(
					vec2(Math.max(origin.X, target.X), Math.max(origin.Y, target.Y))
				), 1);
			
			// Check if any actors in the matching sections intersect the line
			var result = null,
				results = [];
			for (var x = topLeft.X; x < bottomRight.X; x++) {
				for (var y = topLeft.Y; y < bottomRight.Y; y++) {
					var actors = Z.actorMap.map[Z.utilities.hash(vec2(x, y))] || [];
					for (var i = actors.length; i--;) {
						if (ignore && ignore(actors[i])) { continue; }
						
						// Check if this is a colliding actor (player is set to non-colliding when
						// in a car, but should still respond to raycast hits)
						if (!actors[i].collide && !actors[i].type == "player" && !actors[i].inCar) {
							continue;
						}
						
						// Ignore some actor types (like noises or effects - some powerups and
						// projectiles can be hit by weapons)
						if (actors[i].type == "weaponSpread" ||
							actors[i].type == "noise" ||
							actors[i].type == "effect" ||
							(actors[i].type == "car" && actors[i].playerDriving) ||
							(actors[i].type == "powerup" && !actors[i].damagedEvent) ||
							(actors[i].type == "projectile" && !actors[i].rayHit)) {
							continue;
						}
						
						// If actor is a car, rotate origin and target relative to car center
						// and check against car bounding box (as an AABB)
						if (actors[i].type == "car") {
							var p = actors[i].position,
								s = vec2.div(actors[i].size, 2),
								hitBox = { left: -s.X, right: s.X, top: -s.Y, bottom: s.Y },
								r = vec2.rad(actors[i].direction),
								deltaOrigin = vec2.sub(origin, p),
								rotatedOrigin = vec2.rot(deltaOrigin, -r),
								deltaTarget = vec2.sub(target, p),
								rotatedTarget = vec2.rot(deltaTarget, -r);
							if (result = intersectLineAABB(rotatedOrigin, rotatedTarget, hitBox)) {
								results.push({ position: vec2.add(vec2.rot(result, r), p), actor: actors[i] });
							}
						} else {	// Otherwise check the actor's hit box or bounding box
							if (result = intersectLineAABB(origin, target, getHitBox(actors[i]))) {
								results.push({ position: result, actor: actors[i] });
							}
						}
					}
				}
			}
			
			// Find the closest intersecting actor
			var d = vec2(),
				length = 0,
				min = Infinity;
			result = { position: target, actor: null };
			for (var i = results.length; i--;) {
				d = vec2.sub(origin, results[i].position);
				length = vec2.len(d);
				if (length < min) {
					min = length;
					result = results[i];
				}
			}
			return result;
		}
	};
}());