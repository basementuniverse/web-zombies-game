"use strict";
Z.camera = (function() {
	var EASE_AMOUNT = 0.09;		// How fast the camera eases towards the target position
	return {
		position: vec2(),
		size: vec2(),
		bounds: vec2(),
		update: function(player, context, width, height) {
			// Get difference between current and target position
			var target = player.position,
				delta = vec2.sub(target, this.position);
			this.position = vec2.add(this.position, vec2.mul(delta, EASE_AMOUNT));
			
			// Get the screen size and camera bounds in world coords
			this.size = vec2(width, height);
			this.bounds = vec2.sub(this.position, vec2.div(this.size, 2));
			
			// Reset context transforms and translate to camera position
			var translate = vec2.sub(vec2.div(this.size, 2), this.position);
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.translate(translate.X, translate.Y);
		}
	};
}());