"use strict";
var vec2 = function(x, y) {
	if (arguments.length == 1) {
		if (x instanceof Array && x.length > 1) {	// vec2 from array
			return { X: x[0], Y: x[1] };
		} else if (
			x.hasOwnProperty &&
			x.hasOwnProperty("X") &&
			x.hasOwnProperty("Y")) {	// vec2 from vec2 (copy)
			return { X: x.X, Y: x.Y };
		}
		return { X: 0, Y: 0 };						// Arguments incorrect, return [0, 0]
	}
	return { X: x || 0, Y: y || 0 };
};

// Return the length of a vector
vec2.len = function(v) {
	return Math.sqrt(v.X * v.X + v.Y * v.Y);
};

// Returns the angle of the vector in radians
vec2.rad = function(v) {
	return Math.atan2(v.Y, v.X);
};

// Return the dot product of two vectors
vec2.dot = function(v1, v2) {
	return v1.X * v2.X + v1.Y * v2.Y;
};

// Return a normalised vector
vec2.norm = function(v) {
	return vec2.div(v, vec2.len(v));
};

// Return vector v rotated by r radians
vec2.rot = function(v, r) {
	var sinAngle = Math.sin(r),
		cosAngle = Math.cos(r),
		x = cosAngle * v.X - sinAngle * v.Y,
		y = sinAngle * v.X + cosAngle * v.Y;
	return vec2(x, y);
};

// Adds two vectors and returns the result
vec2.add = function(v1, v2) {
	if (v2 instanceof Object) {
		return vec2(v1.X + v2.X, v1.Y + v2.Y);
	} else {
		return vec2(v1.X + v2, v1.Y + v2);
	}
};

// Subtracts two vectors and returns the result
vec2.sub = function(v1, v2) {
	if (v2 instanceof Object) {
		return vec2(v1.X - v2.X, v1.Y - v2.Y);
	} else {
		return vec2(v1.X - v2, v1.Y - v2);
	}
};

// Multiplies two vectors and returns the result
vec2.mul = function(v1, v2) {
	if (v2 instanceof Object) {
		return vec2(v1.X * v2.X, v1.Y * v2.Y);
	} else {
		return vec2(v1.X * v2, v1.Y * v2);
	}
};

// Divides two vectors and returns the result
vec2.div = function(v1, v2) {
	if (v2 instanceof Object) {
		return vec2(v1.X / v2.X, v1.Y / v2.Y);
	} else {
		return vec2(v1.X / v2, v1.Y / v2);
	}
};

// Returns true if the two specified vectors are the same
vec2.eq = function(v1, v2) {
	return (v1.X == v2.X && v1.Y == v2.Y);
};

// Returns a vector from a string like "0,0" or "0, 0"
vec2.fromString = function(s) {
	var values = s.split(",", 2);
	if (values.length == 2 &&
		!isNaN(parseFloat(values[0])) &&
		!isNaN(parseFloat(values[1]))) {
		return vec2(parseFloat(values[0]), parseFloat(values[1]));
	}
	return vec2(0, 0);
};

// Returns a string representation of a vector
//	v:	The vector to return as a string
//	s:	An optional separator string (default is ",")
vec2.toString = function(v, s) {
	return v.X + (s !== undefined ? s : ",") + v.Y;
};