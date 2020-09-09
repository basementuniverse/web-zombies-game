"use strict";
Z.utilities = (function() {
	var MONTH_NAMES = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];
	
	return {
		// Return true if the browser supports local storage
		supportsLocalStorage: function() {
			try {
				return "localStorage" in window && window["localStorage"] !== null;
			} catch (e) {
				return false;
			}
		},
		
		// Return true if the browser supports web workers
		supportsWebWorkers: function() {
			return !!window.Worker;
		},
		
		// Return a date string like "hh:mm(am/pm) d monthname yyyy"
		dateString: function(d) {
			var minute = d.getMinutes(),
				hour = d.getHours(),
				m = hour >= 12 ? "pm" : "am",
				day = d.getDate(),
				month = MONTH_NAMES[d.getMonth()],
				year = d.getFullYear(),
				pad = function(n) {
					return n < 10 ? ("0" + n) : n;
				};
			return (
				pad(hour > 12 ? (hour - 12) : hour) + ":" + pad(minute) + m + ", " +
				day + " " + month + " " + year
			);
		},
		
		// Return a duration string like "m months, d days, h hours, m minutes, s seconds"
		durationString: function(d) {
			var second = 1000,
				minute = 60 * second,
				hour = 60 * minute,
				day = 24 * hour,
				month = 30 * day,
				s = [];
			if (d > month) {
				var months = Math.floor(d / month);
				s.push(months + " months");
				d -= month * months;
			}
			if (d > day) {
				var days = Math.floor(d / day);
				s.push(days + " days");
				d -= day * days;
			}
			if (d > hour) {
				var hours = Math.floor(d / hour);
				s.push(hours + " hours");
				d -= hour * hours;
			}
			if (d > minute) {
				var minutes = Math.floor(d / minute);
				s.push(minutes + " minutes");
				d -= minute * minutes;
			}
			s.push(Math.round(d / second) + " seconds");
			return s.join(", ");
		},
		
		// Return a string like "k kilometers" or "m meters"
		distanceString: function(d) {
			if (d >= 1000) {
				return (Math.round((d / 1000) * 10) / 10) + " kilometres";
			}
			return Math.round(d) + " metres";
		},
		
		// Return a string representation of an input control (e.g. 'Up arrow', 'Left mouse')
		inputString: function(i) {
			if (i == Mouse.Left) { return "Left mouse button"; }
			if (i == Mouse.Middle) { return "Middle mouse button"; }
			if (i == Mouse.Right) { return "Right mouse button"; }
			if (i == 4) { return "Mouse wheel up"; }
			if (i == 5) { return "Mouse wheel down"; }
			for (var j in Keys) {
				if (Keys.hasOwnProperty(j) && i == Keys[j]) { return j; }
			}
			return String.fromCharCode(i).toUpperCase();
		},
		
		// Takes an array (with 3 or 4 elements) and returns a CSS colour string
		arrayToColour: function(a) {
			if (a.length > 3) {
				return "rgba(" +
					Math.clamp(Math.round(a[0]), 0, 255) + ", " +
					Math.clamp(Math.round(a[1]), 0, 255) + ", " +
					Math.clamp(Math.round(a[2]), 0, 255) + ", " +
					Math.clamp(Math.round(a[3] * 100) / 100) + ")";
			} else {
				return "rgb(" +
					Math.clamp(Math.round(a[0]), 0, 255) + ", " +
					Math.clamp(Math.round(a[1]), 0, 255) + ", " +
					Math.clamp(Math.round(a[2]), 0, 255) + ")";
			}
		},
		
		// Return a string from a position for use as a spatial hash
		hash: function(position) {
			return vec2.toString(position);
		},
		
		// Return the section position for the specified world position
		section: function(position) {
			var section = vec2.div(position, Z.settings.sectionSize);
			section.X = Math.floor(section.X);
			section.Y = Math.floor(section.Y);
			return section;
		},
		
		// Return the cell position for the specified world position
		cell: function(position) {
			var cell = vec2.div(position, Z.settings.cellSize);
			cell.X = Math.floor(cell.X);
			cell.Y = Math.floor(cell.Y);
			return cell;
		},
		
		// Return an 8-direction unit vector from the angle between a and b
		direction: function(a, b) {
			// Get direction in range 0 to 1
			var r = (0.5 + (vec2.rad(vec2.sub(b, a)) / (Math.PI * 2))) - 0.0625;
			r = (r < 0) ? (r + 1) : r;	// Offset by 1/16th circle (this centers the segments)
			if (r > 0.875) { return vec2(-1, 0); }
			if (r > 0.75) { return vec2(-1, 1); }
			if (r > 0.625) { return vec2(0, 1); }
			if (r > 0.5) { return vec2(1, 1); }
			if (r > 0.375) { return vec2(1, 0); }
			if (r > 0.25) { return vec2(1, -1); }
			if (r > 0.125) { return vec2(0, -1); }
			return vec2(-1, -1);
		},
		
		// Return a random direction vector
		randomDirection: function() {
			var directions = [
				vec2(0, -1),
				vec2(1, -1),
				vec2(1, 0),
				vec2(1, 1),
				vec2(0, 1),
				vec2(-1, 1),
				vec2(-1, 0),
				vec2(-1, -1)
			];
			return directions[Math.floor(Math.random() * 8)];
		},
		
		// Load game object data from the server. Callback argument will be game object data with
		// an additional property (data.sprite) that contains the sprite data (note: not a sprite
		// instance - the sprite still needs to be instantiated in actor.create)
		loadData: function(callback, path, data) {
			if (data) {		// If data is inline, check for a sprite to load (might also be inline)
				if (data.spritePath) {
					Z.sprite.loadData(function(sprite) {
						data.sprite = sprite;
						callback(data);
					}, data.spritePath, data.spriteData);
				} else {
					callback(data);
				}
			} else {		// Otherwise load data from the server
				$.ajax({
					dataType: "json",
					url: path,
					success: function(result) {
						// When data has loaded, check if there is a sprite to load as well
						if (result.spritePath) {
							Z.sprite.loadData(function(sprite) {
								result.sprite = sprite;
								callback(result);
							}, result.spritePath, null);
						} else {	// Otherwise just call the callback without loading a sprite
							callback(result);
						}
					},
					error: function(request, status, error) {	// Definition data failed to load
						if (Z.settings.debug) {
							console.log(
								"Error loading game object data (%s): %O, %O",
								status, request, error
							);
						}
						callback(null);
					}
				});
			}
		},
		
		// Load game object JSON data from the server (specialised for config screen - doesn't load
		// sprite images)
		loadConfigData: function(callback, path, data) {
			if (data) {		// If data is inline, check for a sprite to load (might also be inline)
				if (data.spritePath) {
					Z.utilities.loadData(function(sprite) {
						data.spriteData = sprite;
						callback(data);
					}, data.spritePath, data.spriteData);
				} else {
					callback(data);
				}
			} else {		// Otherwise load data from the server
				$.ajax({
					dataType: "json",
					url: path,
					success: function(result) {
						// When data has loaded, check if there is a sprite to load as well
						if (result.spritePath) {
							Z.utilities.loadData(function(sprite) {
								result.spriteData = sprite;
								callback(result);
							}, result.spritePath, null);
						} else {	// Otherwise just call the callback without loading a sprite
							callback(result);
						}
					},
					error: function(request, status, error) {	// Definition data failed to load
						if (Z.settings.debug) {
							console.log(
								"Error loading game object data (%s): %O, %O",
								status, request, error
							);
						}
						callback(null);
					}
				});
			}
		},
		
		// Load an image and call callback (with the image as the only argument) when it is done
		loadImage: function(callback, path) {
			var image = new Image();
			image.onload = function() {
				callback(image);
			};
			image.onerror = function() {
				if (Z.settings.debug) {
					console.log("Error loading image: " + path);
				}
				callback(null);
			};
			image.src = path;
		},
		
		// Load an audio file and call callback (with the audio file as the only argument) when it is done
		loadAudio: function(callback, path) {
			var audio = new Audio();
			$(audio).bind("canplaythrough", function() {
				$(audio).off("canplaythrough");		// Prevent callback being called multiple times
				callback(audio);
			});
			audio.onerror = function() {
				if (Z.settings.debug) {
					console.log("Error loading audio: " + path);
				}
				callback(null);
			};
			audio.src = path;
		}
	};
}());