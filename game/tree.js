"use strict";
Z.tree = (function(base) {
	var _tree = Object.create(base);
	_tree.type = "building";	// Trees identify as buildings (helps some edge cases)
	_tree.create = function(position, size, spriteData) {
		var t = base.create.call(this, position, size, Z.sprite.create(spriteData));
		t.direction = Z.utilities.randomDirection();
		t.sprite.animation = "idle";
		return t;
	};
	_tree.handleCollision = function(actor, mtv) { };
	return _tree;
}(Z.actor));