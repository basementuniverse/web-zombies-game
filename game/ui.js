"use strict";
Z.ui = (function() {
	var SCREEN_SLIDE_SPEED = 150,	// The number of milliseconds for main menu screen transitions
		SCREEN_STATS = 0,
		SCREEN_MAP = 1,
		SCREEN_CONTROLS = 2,
		SCREEN_GAME = 3,
		SCREEN_WORLD = 0,
		SCREEN_PLAYER = 1,
		SCREEN_INVENTORY = 2,
		SCREEN_ZOMBIES = 3,
		SCREEN_START = 4,
		MAP_SCROLL_AMOUNT = 2400,
		MAP_UPDATE_INTERVAL = 0.2;
	
	var _loading = true,
		_paused = false,
		_selected = 0,
		_menuButtons = ["statsbutton", "mapbutton", "controlsbutton", "gamebutton"],
		_menuScreens = ["statsscreen", "mapscreen", "controlsscreen", "gamescreen"],
		_configButtons = [
			"worldbutton",
			"playerbutton",
			"playerbutton",
			"zombiesbutton",
			"startbutton"
		],
		_configScreens = [
			"worldscreen",
			"playerscreen",
			"inventoryscreen",
			"zombiesscreen",
			"startscreen"
		],
		_mapCanvas = null,
		_mapContext = null,
		_mapOffset = vec2(),
		_mapUpdateTimeout = null;
	
	// Resize map canvas and re-draw map
	var resizeMap = function() {
		var scale = Z.settings.mapCellSize * 2,
			config = $("body").hasClass("config"),
			container = config ? ".worldscreen div.inner" : ".mapscreen";
		_mapCanvas.width = Math.ceil($(container).width() / scale) * scale;
		_mapCanvas.height = Math.ceil($(container).height() / scale) * scale;
		
		// Update map/world display
		if ((config && _selected == SCREEN_WORLD) ||
			(!config && _selected == SCREEN_MAP)) {
			Z.ui.updateMap();
		}
	};
	
	// Update statistics display
	var updateStats = function() {
		$(".statsscreen .currenttime")
		.text(Z.utilities.dateString(Z.environment.currentTime));
		$(".statsscreen .alivelabel")
		.text(Z.player.alive ? "You have survived for" : "You survived for");
		$(".statsscreen .alivetime")
		.text(Z.utilities.durationString(Z.statistics.aliveTime));
		$(".statsscreen .distancetravelled")
		.text(Z.utilities.distanceString(Z.statistics.distanceTravelled));
		$(".statsscreen .zombieskilled")
		.text(Z.statistics.zombiesKilled);
		
		var listItem = function(item, size, offset) {
			size = size || item.hudSprite.tileSize;
			offset = offset || vec2();
			var canvas = document.createElement("canvas"),
				context = canvas.getContext("2d");
			canvas.width = size.X;
			canvas.height = size.Y;
			item.hudSprite.draw(context, vec2.add(vec2.mul(item.hudSprite.actorOffset, -1), offset), vec2());
			return $("<div class='item'>").append(canvas).append(item.name);
		};
		
		// Update inventory list (only show torch, nightvision and serum)
		$(".statsscreen .inventory").empty();
		if (Z.player.inventory["torch"] > 0) {
			$(".statsscreen .inventory").append(listItem(Z.torch, null, null));
		}
		if (Z.player.inventory["nightvision"] > 0) {
			$(".statsscreen .inventory").append(listItem(Z.nightVision, null, null));
		}
		if (Z.player.inventory["serum"] > 0) {
			var serumSprite = Z.sprite.create(Z.content.items["hud"].sprite),
				serumName = " zombie virus serum" + (Z.player.inventory["serum"] > 1 ? "s" : "");
			serumSprite.animation = "serum";
			$(".statsscreen .inventory").append(listItem({
				hudSprite: serumSprite,
				name: Z.player.inventory["serum"] + serumName
			}, vec2(50, 50), vec2(15, 15)));
		}
		
		// Update weapons list
		$(".statsscreen .weapons").empty();
		var weaponOffset = vec2();
		for (var i = 0, length = Z.player.weapons.length; i < length; i++) {
			if (Z.player.weapons[i].name == "Push") { continue; }
			
			// Set weapon hud sprite offset
			weaponOffset = vec2();
			if (Z.player.weapons[i].name == "Grenade") {
				weaponOffset = vec2(0, 4); 
			}
			if (Z.player.weapons[i].name == "Mine" ||
				Z.player.weapons[i].name == "Molotov" ||
				Z.player.weapons[i].name == "Flare") {
				weaponOffset = vec2(0, 7);
			}
			$(".statsscreen .weapons").append(listItem(Z.player.weapons[i], null, weaponOffset));
		}
	};
	
	// Displays a full-screen message
	//	text:		The message text
	//	buttons:	An array of buttons - each button should contain the following keys:
	//				text: 		The button label
	//				callback:	A function to call when the button is clicked (optional)
	//				className:	A css classname to add to the button element (optional)
	//	error:		If true, display this message as an error message
	var showMessage = function(text, buttons, error) {
		var buttonBox = $("<div class='buttons'>"),
			messageBox = $("<div class='message'>")
				.append($("<div class='messagetext'>").html(text))
				.append(buttonBox),
			button = null;
		
		// Error message
		if (error) {
			messageBox.addClass("error");
		}
		
		// Add buttons
		for (var i = 0, length = buttons.length; i < length; i++) {
			button = $("<a class='button'>")
			.attr("href", "javascript:void(0)")
			.text(buttons[i].text);
			if (buttons[i].className) {
				button.addClass(buttons[i].className);
			}
			(function(callback) {
				button.click(function() {
					messageBox.fadeOut("fast", function() {
						$(this).remove();
					});
					if (callback) {
						callback();
					}
				});
			}(buttons[i].callback));
			buttonBox.append(button);
		}
		
		$("body").append(messageBox.hide());
		messageBox.fadeIn("fast");
	};
	
	// Update controls settings
	var updateControls = function() {
		$(".controlsscreen td a.mainkey").each(function(i, v) {
			$(v).text(Z.utilities.inputString(Z.player.controls[$(v).attr("data-control")][0]));
		});
		$(".controlsscreen td a.alternatekey").each(function(i, v) {
			if (Z.player.controls[$(v).attr("data-control")].length > 1 &&
				Z.player.controls[$(v).attr("data-control")][1]) {
				$(v)
				.removeClass("nokey")
				.text(Z.utilities.inputString(Z.player.controls[$(v).attr("data-control")][1]));
			} else {
				$(v).addClass("nokey").text("None");
			}
		});
	};
	
	return {
		initialise: function() {
			_mapCanvas = $("canvas#mapcanvas").get(0);
			if (_mapCanvas && _mapCanvas.getContext && Z.utilities.supportsWebWorkers()) {
				_mapContext = _mapCanvas.getContext("2d");
				$(window).resize(function() {
					$(".content").css({		// Resize all menu screens
						width: (window.innerWidth - 20) + "px",
						height: (window.innerHeight - 62) + "px"
					});
					resizeMap();
				}).trigger("resize");
			} else {
				Z.ui.error("Browser not supported!");
			}
			
			// Initialise audio enabled/disabled buttons
			if (Z.settings.audioEnabled) {
				$(".audioenabledbutton").addClass("active");
			}
		},
		
		// Initialise map popup (get map, world and player data data from local storage)
		initialiseMapPopup: function(mapData, worldData) {
			if (Z.utilities.supportsLocalStorage()) {
				if (!worldData.seed) {
					worldData.seed = Z.cellGenerator.seed;
				}
				localStorage.setItem("map", JSON.stringify(mapData));
				localStorage.setItem("world", JSON.stringify(worldData));
				localStorage.setItem("player", vec2.toString(Z.player.position));
				
				// Initialise map popup button
				$("a.mappopupbutton").off("click").click(function() {
					var width = Z.settings.defaultMapSize.X,
						height = Z.settings.defaultMapSize.Y;
					window.open("map.php", "", "width=" + width + ", height=" + height);
					return false;
				});
			} else if (Z.settings.debug) {
				console.log("Local storage not supported, the map won't work properly!");
			}
		},
		
		// Display a message with an ok button
		message: function(text, callback) {
			showMessage(text, [{ text: "Ok", classname: "okbutton", callback: callback }], false);
		},
		
		// Display an error message (without buttons)
		error: function(text) {
			showMessage(text, [], true);
		},
		
		// Display a prompt with two buttons
		prompt: function(text, yesText, yesCallback, noText, noCallback) {
			showMessage(text, [
				{ text: yesText, classname: "okbutton", callback: yesCallback },
				{ text: noText, classname: "cancelbutton", callback: noCallback }
			], false);
		},
		
		// Enable/disable game audio and update buttons accordingly
		toggleAudio: function() {
			Z.settings.audioEnabled = !Z.settings.audioEnabled;
			$(".audioenabledbutton").toggleClass("active", Z.settings.audioEnabled);
		},
		
		// Update the map popup to display the specified position
		updateMapPopup: function(position) {
			if (Z.utilities.supportsLocalStorage()) {
				localStorage.setItem("player", vec2.toString(position));
			}
		},
		
		// Update the in-game map display
		updateMap: function() {
			clearTimeout(_mapUpdateTimeout);
			_mapUpdateTimeout = setTimeout(function() {
				Z.mapGenerator.draw(
					vec2.add(Z.player.position, vec2.mul(_mapOffset, MAP_SCROLL_AMOUNT)),
					Z.player.position,
					_mapContext,
					vec2(_mapCanvas.width, _mapCanvas.height)
				);
			}, MAP_UPDATE_INTERVAL * 1000);
		},
		
		// Scroll the map in the specified direction
		scrollMap: function(x, y, center) {
			_mapOffset = center ? vec2() : vec2.add(_mapOffset, vec2(x, y));
			this.updateMap();
		},
		
		// Change a control setting (updates world data definition and player)
		setControl: function(control, alternate) {
			$(".setcontrol").fadeIn("fast");
			var button = this;
			Z.input.controlChanged = function(input) {
				Z.input.controlChanged = null;
				if (input != Keys.Escape) {
					// Update control in both world content and player data (so it takes effect
					// immediately and retains settings if the player restarts the game)
					Z.content.items["controls"][control][alternate ? 1 : 0] = input;
					Z.player.controls[control][alternate ? 1 : 0] = input;
					
					// Update button text
					var className = (alternate ? "alternatekey" : "mainkey");
					$(".controlsscreen td a[data-control=" + control + "]." + className)
					.removeClass("nokey")
					.text(Z.utilities.inputString(input));
				} else {	// If escape was pressed, reset keyboard state so the game stays paused
					Z.input.update();
					if (alternate) {	// Escape will remove alternate key mappings
						Z.content.items["controls"][control][1] = null;
						Z.player.controls[control][1] = null;
						$(".controlsscreen td a[data-control=" + control + "].alternatekey")
						.addClass("nokey").text("None");
					}
				}
				$(".setcontrol").fadeOut("fast");
			};
		},
		
		// Show or hide the loading screen
		loading: function(show, message) {
			if (show != _loading) {
				$(".loading")[show ? "fadeIn" : "fadeOut"](show ? "fast" : "slow");
				_loading = show;
			}
			$(".loading div").text(show ? message : "");
		},
		
		// Show or hide the paused/main menu screen
		paused: function(show) {
			if (show != _paused) {
				if (show) {
					// Select default menu button and screen
					_selected = SCREEN_STATS;
					this.screen(_selected, true);
					updateStats();
					updateControls();
					
					// Show paused/main menu screen
					$(".paused").fadeIn("fast");
				} else {
					$(".paused").fadeOut("slow");
				}
				_paused = show;
			}
			
			// Hide intro screen (in case player pauses while it is displayed)
			$("div.intro").remove();
		},
		
		closeIntro: function() {
			$("div.intro").fadeOut("fast", function() { $("div.intro").remove(); });
			Z.game.paused = false;
		},
		
		// Changes and animates the main menu and config menu screens
		screen: function(index, instant) {
			var config = $("body").hasClass("config"),
				buttons = config ? _configButtons : _menuButtons,
				screens = config ? _configScreens : _menuScreens;
			
			// Update buttons
			$(".menu a").removeClass("selected");
			$(".menu a." + buttons[index]).addClass("selected");
			
			// Update screens
			if (index == _selected || instant) {
				$(".content").css({ left: "-100%" });
				$(".content." + screens[index]).css({ left: "0%" });
			} else {
				// Slide current screen off
				var direction = index < _selected ? "100%" : "-100%",
					opposite = index < _selected ? "-100%" : "100%";
				$(".content." + screens[_selected])
				.animate({ left: direction }, SCREEN_SLIDE_SPEED);
				
				// Make sure new screen is in position and slide on
				$(".content." + screens[index])
				.css({ left: opposite })
				.animate({ left: "0%" }, SCREEN_SLIDE_SPEED);
				_selected = index;
				
				// If on the map screen, resize and update map display
				if ((config && _selected == SCREEN_WORLD) ||
					(!config && _selected == SCREEN_MAP)) {
					setTimeout(Z.ui.updateMap, SCREEN_SLIDE_SPEED + 100);	// Wait for CSS animation
				}
			}
		},
		
		// Toggle the world controls box on the world config screen
		worldControls: function() {
			if ($(".worldcontrolsexpandcontainer").hasClass("collapsed")) {
				$(".worldcontrols").fadeIn("fast");
				$(".worldcontrolsexpandcontainer").removeClass("collapsed");
			} else {
				$(".worldcontrols").fadeOut("fast");
				$(".worldcontrolsexpandcontainer").addClass("collapsed");
			}
		}
	};
}());