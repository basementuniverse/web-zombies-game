"use strict";
Z.sound = (function() {
	return {
		sounds: [],
		initialise: function(data) {
			this.sounds = data;
		},
		loadData: function(callback, path, data) {
			// Audio not available for Safari (Windows) unless QuickTime is installed
			if ("Audio" in window && Audio !== undefined) {
				Z.utilities.loadData(function(soundData) {
					var loadCount = soundData.sounds.length,
						audio = new Audio(),
						format = "",
						sounds = [];
					
					// Find first supported audio format
					for (var i = soundData.formats.length; i--;) {
						if (audio.canPlayType(soundData.formats[i])) {
							format = soundData.formats[i];
							break;
						}
					}
					
					// Load audio files
					if (format && loadCount) {
						$(soundData.sounds).each(function(i, v) {
							Z.utilities.loadAudio(function(sound) {
								sounds[v.name] = sound;
								
								// If finished loading, callback and pass all loaded sounds
								if (--loadCount <= 0) {
									callback(sounds);
								}
							}, v.soundPath[format]);
						});
					} else {	// No formats supported or no sound files found
						Z.settings.audioEnabled = false;
						if (!format && Z.settings.debug) {
							console.log("Audio format not supported. Sound has been disabled");
						}
						callback(null);
					}
				}, path, data);
			} else {
				callback(null);
			}
		},
		
		// Start playing a sound sample
		//	name:		The name of the sound to play
		//	position:	The world position of the actor that played the sound
		//	reTrigger:	Stop and restart the sound if already playing
		play: function(name, position, reTrigger) {
			// If sound has a position, check that position is on screen
			if (position &&
				(position.X < Z.camera.bounds.X || position.X > Z.camera.bounds.X + Z.camera.size.X ||
				position.Y < Z.camera.bounds.Y || position.Y > Z.camera.bounds.Y + Z.camera.size.Y)) {
				return;
			}
			
			// Play sound if it exists
			if (Z.settings.audioEnabled && name && this.sounds[name]) {
				if (reTrigger) {
					this.sounds[name].pause();
					this.sounds[name].currentTime = 0;
				}
				this.sounds[name].play();
			}
		}
	};
}());