"use strict";
Z.config = (function() {
	var FADER_LENGTH = 120,
		FADER_TRACK_PADDING = 4;
	
	// Initialise and start the configuration manager
	var start = function(content) {
		Z.ui.loading(true, "Initialising...");
		
		// Initialise player (this is used for map positioning)
		Z.player = { position: vec2(content["player"].startingPosition) };
		
		// Create abstract zombie generator for setting simple zombie densities
		var z = content["zombiegenerator"];
		content["zombiegenerator_config"] = [
			z.biomes[0].rates[0].max / z.biomes[0].rates[0].rate,
			z.biomes[2].rates[0].max / z.biomes[2].rates[0].rate,
			z.biomes[3].rates[0].max / z.biomes[3].rates[0].rate
		];
		
		// Create selector controls
		$(".input.selector").each(function(i, v) {
			var input = null;
			if ($(v).attr("data-input") && (input = $(".input#" + $(v).attr("data-input")))) {
				$(v).click(function() {
					var values = $(v).children(".option"),
						selectedIndex = values.index($(v).children(".option.selected"));
					if (selectedIndex == -1) {
						values.eq(0).addClass("selected");
						selectedIndex = 0;
					}
					selectedIndex = selectedIndex >= (values.length - 1) ? 0 : selectedIndex + 1;
					values.removeClass("selected").eq(selectedIndex).addClass("selected");
					input.val(values.eq(selectedIndex).attr("data-value"));
					input.trigger("change");
				});
			}
		});
		
		// Create fader controls
		$(".input.fader").each(function(i, v) {
			$(v).remove("span.value, span.unit");
			var unitText = $(v).attr("data-showunit"),
				track = $("<div class='track'>"),
				bar = $("<div class='bar'>"),
				showValue = $("<span class='value'>");
			$(v).empty().append(track.append(bar));
			if ($(v).attr("data-showvalue")) {
				$(v).append(showValue).append($("<span class='unit'>").text(unitText));
			}
			
			// Link to hidden input
			var input = null;
			if ($(v).attr("data-input") && (input = $(".input#" + $(v).attr("data-input")))) {
				var drag = false,		// Add fader elements and event handlers
					update = function(e) {
						var offset = track.offset(),
							max = parseInt(input.attr("data-max")),
							scale = max / FADER_LENGTH;
						input.val((e.clientX - offset.left - FADER_TRACK_PADDING) * scale);
						input.trigger("change");
					};
				track
				.mousedown(function(e) { drag = true; update(e); })
				.mouseup(function() { drag = false; })
				.mouseout(function() { drag = false; })
				.mousemove(function(e) { if (drag) { update(e); } });
			}
		});
		
		// Initialise fields using content data
		$(".input").each(function(i, v) {
			var id = $(v).attr("data-id"),
				property = $(v).attr("data-property"),
				arrayIndex = $(v).attr("data-arrayindex") || null;
			if (content[id] && content[id].hasOwnProperty(property)) {
				$(v)
				.val(arrayIndex ? content[id][property][arrayIndex] : content[id][property])								// Set input value from world config data
				.change(function() {					// Update world config data when changed
					var value = $(this).val(),
						min = parseFloat($(this).attr("data-min")) || 0,
						max = parseFloat($(this).attr("data-max")) || Infinity;
					if ($(this).hasClass("number")) {	// Numeric value
						if (isNaN(parseFloat(value))) {	// Reset non-numeric values back to default
							if (arrayIndex) {
								value = content[id][property][arrayIndex];
							} else {
								value = content[id][property];
							}
							$(v).val(value);
						} else {						// Clamp numeric values using min and max
							value = Math.clamp(parseFloat(value), min, max);
							if (arrayIndex) {
								content[id][property][arrayIndex] = value;
							} else {
								content[id][property] = value;
							}
							$(v).val($(this).attr("data-round") ?
								Math.round(value) :
								Math.round(value * 10000) / 10000);
						}
					} else if ($(this).hasClass("bool")) {	// Boolean value
						if (arrayIndex) {
							content[id][property][arrayIndex] = (value == "true");
						} else {
							content[id][property] = (value == "true");
						}
					} else {								// String value
						if (arrayIndex) {
							content[id][property][arrayIndex] = value;
						} else {
							content[id][property] = value;
						}
					}
					
					// Call data-change callback if there is one
					var change = $(this).attr("data-change");
					if (change && Z.config.formCallbacks[change]) {
						Z.config.formCallbacks[change](this, value, content);
					}
					
					// Update selector control if there is one
					var selector = null;
					if (selector = $(".input.selector[data-input=" + $(this).attr("id") + "]")) {
						selector.children(".option").removeClass("selected");
						selector.find(".option[data-value='" + value + "']").addClass("selected");
					}
					
					// Update fader control if there is one
					var fader = null;
					if (fader = $(".input.fader[data-input=" + $(this).attr("id") + "]")) {
						var max = parseInt($(this).attr("data-max")),
							scale = FADER_LENGTH / max,
							precision = 1 / (parseFloat(fader.attr("data-precision")) || 1),
							valueScale = parseFloat(fader.attr("data-scale")) || 1;
						fader.find(".bar").css({
							width: Math.round(value * scale) + "px"
						});
						fader.find(".value").text(
							Math.round((value * valueScale) * precision) / precision
						);
					}
				}).trigger("change");
			}
		});
		
		// Initialise interface and map generator (for world screen)
		Z.ui.initialise();
		Z.mapGenerator.initialise(content["map"], content["world"]);
		Z.ui.loading(false);
	};
	
	return {
		contentItemData: [],
		formCallbacks: [],
		initialise: function(id) {
			// Get a list of content assets from the server and start loading them
			Z.ui.loading(true, "Loading content...");
			Z.config.contentItemData = [];
			$.ajax({
				dataType: "json",
				url: Z.settings.contentPath + id,
				success: function(data) {
					var contentItems = [];
					for (var i = data.items.length; i--;) {
						// Keep track of loader and loader arguments for use when saving content
						Z.config.contentItemData[data.items[i].id] = {
							loader: data.items[i].loader,
							path: data.items[i].args[0]
						};
						
						// Skip image items - these can't be configured
						if (data.items[i].loader == "image") { continue; }
						
						// Don't override map data loader (this is used for the map preview
						// and can't be configured)
						if (data.items[i].id == "map") {
							contentItems.push({
								id: data.items[i].id,
								loader: Z.content.loaders[data.items[i].loader],
								args: data.items[i].args
							});
						} else {	// Load item with generic json loader
							contentItems.push({
								id: data.items[i].id,
								loader: Z.utilities.loadConfigData,
								args: data.items[i].args
							});
						}
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
		},
		saveConfig: function(startImmediately) {
			Z.ui.loading(true, "Saving world config...");
			
			// Get world config data
			var content = { items: [] };
			for (var i in Z.config.contentItemData) {
				if (!Z.config.contentItemData.hasOwnProperty(i)) { continue; }
				content.items.push({
					id: i,
					loader: Z.config.contentItemData[i].loader,
					args: [
						Z.config.contentItemData[i].path,
						Z.content.items[i]
					]
				});
			}
			
			// Save to server
			$.ajax({
				dataType: "json",
				cache: false,
				type: "POST",
				url: Z.settings.contentPath,
				data: JSON.stringify(content),
				success: function(result) {
					if (startImmediately) {		// Start playing the saved config immediately
						window.location.href = result.id;
					} else {					// Prompt with saved config id
						var url = "basementuniverse.com/zombies/";
						Z.ui.loading(false);
						Z.ui.prompt(
							"Your world config has been saved!<br><br>The URL to play it is:<br>" +
							"<a href=\"" + result.id + "\">" +
							"<pre>" + url + "<b>" + result.id + "</b></pre></a>",
							"Play now", function() {
								window.location.href = result.id;
							},
							"Resume editing", null
						);
					}
				}
			});
		}
	};
}());