// http://stackoverflow.com/questions/8405526/javascript-simplex-perlin-noise
var fade = function(t) { return t * t * t * (t * (t * 6 - 15) + 10); };
var grad = function(hash, x, y, z) {
	// Convert lo 4 bits of hash code into 12 gradient directions
	var h = hash & 15;
	var u = h < 8 ? x : y,
		v = h < 4 ? y : (h == 12 || h == 14) ? x : z;
	return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
};
var perlin = function(x, y) {
	// Find unit square that contains point
	var ux = Math.floor(x) & 255,
		uy = Math.floor(y) & 255;
	
	// Find relative x,y of point in square
	x -= Math.floor(x);
	y -= Math.floor(y);
	
	// Compute fade curves for each of x, y
	var u = fade(x),
		v = fade(y);
	
	// Hash coordinates of the corners
	var a = _p[ux    ] + uy, aa = _p[a], ab = _p[a + 1],
		b = _p[ux + 1] + uy, ba = _p[b], bb = _p[b + 1];

	// Add blended results from the corners
	var result = Math.lerp(
			Math.lerp(grad(_p[aa], x, y, 0), grad(_p[ba], x - 1, y, 0), u),
			Math.lerp(grad(_p[ab], x, y - 1, 0), grad(_p[bb], x - 1, y - 1, 0), u),
			v
		);
	return (1 + result) / 2;
};