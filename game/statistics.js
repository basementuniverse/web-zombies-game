"use strict";
Z.statistics = (function() {
	var DISTANCE_SCALE = 10;	// Distance travelled (in pixels) will be divided by this (to show
								// as meters in statistics - ie. 10 pixels ~= 1 meter)
	var _startTime = 0,
		_startPosition = vec2();
	
	return {
		aliveTime: 0,
		distanceTravelled: 0,
		zombiesKilled: 0,
		initialise: function(startTime, startPosition) {
			_startTime = new Date(startTime.getTime());
			_startPosition = startPosition;
			this.zombiesKilled = 0;
		},
		update: function(elapsedTime) {
			if (Z.player.alive) {
				this.aliveTime = Z.environment.currentTime.getTime() - _startTime.getTime();
			}
			this.distanceTravelled = vec2.len(vec2.sub(Z.player.position, _startPosition)) / DISTANCE_SCALE;
		}
	};
}());