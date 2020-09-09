// http://stackoverflow.com/questions/8405526/javascript-simplex-perlin-noise
var perlin = (function() {
	var lerp = function(a, b, i) { return a * (1 - i) + b * i; };
	var fade = function(t) { return t * t * t * (t * (t * 6 - 15) + 10); };
	var grad = function(hash, x, y, z) {
		// Convert lo 4 bits of hash code into 12 gradient directions
		var h = hash & 15;
		var u = h < 8 ? x : y,
			v = h < 4 ? y : (h == 12 || h == 14) ? x : z;
		return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
	};
	return {
		get: function(position, permutations) {
			var x = position.X, y = position.Y, p = permutations;
			
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
			var a = p[ux    ] + uy, aa = p[a], ab = p[a + 1],
				b = p[ux + 1] + uy, ba = p[b], bb = p[b + 1];

			// Add blended results from the corners
			var result = lerp(
					lerp(grad(p[aa], x, y, 0), grad(p[ba], x - 1, y, 0), u),
					lerp(grad(p[ab], x, y - 1, 0), grad(p[bb], x - 1, y - 1, 0), u),
					v
				);
			return (1 + result) / 2;
		}
	};
}());