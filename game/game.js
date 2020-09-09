"use strict";
Z.game = (function() {
	var FRAMERATE_MIN = 1 / 30,
		FRAMERATE_MAX = 1 / 60;
	
	var _canvas = null,
		_context = null,
		_loop = null,
		_lastFrameTime = 0,
		_seedOverride = "";
	
	// Initialise and start game (called by content loader)
	var start = function(content, restart) {
		// Create player and initialise camera position
		Z.player.initialise(
			content["player"],
			content["controls"],
			content["torch"],
			content["nightvision"]
		);
		Z.actorMap.push(Z.player);
		Z.camera.position = Z.player.position;
		Z.hud.initialise(content["hud"]);
		$("div.infection").removeClass("infected");
		
		// If a seed override value is specified, override the seed defined in world data
		if (_seedOverride) {
			content["world"].seed = _seedOverride;
		}
		
		// Create world and other subsystems
		Z.cellGenerator.initialise(			// If there is no seed, cellGenerator will generate one
			content["world"],				// and store it in content["world"] so it is used again
			content["buildingsprite"],		// if the game is restarted
			content["treesprite"],
			restart
		);
		Z.viewArea.initialise(_canvas.width, _canvas.height);
		Z.spriteGenerator.initialise(restart);
		Z.carSpriteGenerator.initialise(restart);
		Z.zombieGenerator.initialise(
			_canvas.width, _canvas.height,
			content["zombiegenerator"],
			content["zombie"]
		);
		Z.environment.initialise(
			_canvas.width, _canvas.height,
			content["world"]
		);
		Z.sound.initialise(content["sound"]);
		
		// Create UI and map
		Z.statistics.initialise(Z.environment.currentTime, Z.player.position);
		Z.mapGenerator.initialise(content["map"], content["world"], restart);
		Z.ui.initialise();
		Z.ui.initialiseMapPopup(content["map"], content["world"]);
		
		// Wait until initial view area and sprites have been generated before starting the game
		Z.ui.loading(true, "Initialising...");
		var checkViewArea = setInterval(function() {
			if (!Z.cellGenerator.waiting) {
				clearInterval(checkViewArea);
				
				// Start game loop
				_lastFrameTime = new Date() - (FRAMERATE_MAX * 1000);
				Z.game.loop();
				Z.ui.loading(false);
				if (!restart) {
					Z.game.paused = true;	// Game starts paused w/ intro unless restarting
					$(".startbutton").focus();
				}
			}
		}, 100);
	};
	
	return {
		paused: false,
		initialise: function(id, seed) {
			_seedOverride = seed;
			_canvas = $("<canvas id='main'>").appendTo("div.game").get(0);
			$("canvas#main").bind("contextmenu", function(e) { return false; });
			if (_canvas && _canvas.getContext && Z.utilities.supportsWebWorkers()) {
				_context = _canvas.getContext("2d");
				$(window).resize(function() {
					_canvas.width = window.innerWidth;
					_canvas.height = window.innerHeight;
				}).trigger("resize");
				
				// Get a list of content assets from the server and start loading them
				Z.ui.loading(true, "Loading content...");
				$.ajax({
					dataType: "json",
					url: Z.settings.contentPath + id,
					success: function(data) {
						var contentItems = [];
						for (var i = data.items.length; i--;) {
							contentItems.push({
								id: data.items[i].id,
								loader: Z.content.loaders[data.items[i].loader],
								args: data.items[i].args
							});
						}
						Z.content.load(contentItems, start);
					},
					error: function(request, status, error) {
						if (Z.settings.debug) {
							console.log(
								"Error loading main content list (%s): %O, %O",
								status, request, error
							);
						}
					}
				});
			} else {
				Z.ui.error("Browser not supported!");
			}
		},
		loop: function() {
			var now = new Date(),
				elapsedTime = Math.min((now - _lastFrameTime) / 1000, FRAMERATE_MIN);
			if (elapsedTime > FRAMERATE_MAX) {	// Clamp framerate
				_lastFrameTime = now;
				Z.game.update(elapsedTime);
				Z.game.draw();
			}
			_loop = window.requestAnimationFrame(Z.game.loop);
		},
		update: function(elapsedTime) {
			Z.debug.show(Math.floor(1 / elapsedTime), "fps", true);
			if (Z.input.keyPressed(Keys.Escape)) {
				this.paused = !this.paused;
				Z.ui.paused(this.paused);
			}
			if (!this.paused) {
				Z.camera.update(Z.player, _context, _canvas.width, _canvas.height);
				Z.viewArea.update(elapsedTime);
				Z.zombieGenerator.update(elapsedTime);
				Z.actorMap.update(elapsedTime);
				Z.environment.update(elapsedTime);
				Z.hud.update(elapsedTime);
				Z.statistics.update(elapsedTime);
			}
			Z.input.update();
		},
		draw: function() {
			if (this.paused) { return; }
			_context.clearRect(Z.camera.bounds.X, Z.camera.bounds.Y, _canvas.width, _canvas.height);
			Z.viewArea.draw(_context);
			Z.actorMap.draw(_context);
			Z.environment.draw(_context);
			Z.hud.draw(_context);
			Z.debug.draw(_context);
		},
		restart: function() {
			Z.ui.loading(true);
			window.cancelAnimationFrame(_loop);
			Z.actorMap.clear();
			start(Z.content.items, true);
			this.paused = false;
			Z.ui.paused(false);
		}
	};
}());