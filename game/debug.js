"use strict";
Z.debug = (function() {
	var PADDING = vec2(15, 35),
		LINE_HEIGHT = 14,
		FONT = "8pt Lucida Console, monospace",
		FILL_COLOUR = "white",
		MARKER_FONT = "7pt Lucida Console, monospace",
		MARKER_SIZE = vec2(4, 4),
		MARKER_LABEL_OFFSET = vec2(7, -6);
	
	var _values = [],
		_markers = [];
	
	return {
		// Display a value (with an optional label) in the top left corner of the screen
		show: function(value, name, showLabel) {
			_values[name] = { value: value, showLabel: showLabel };
		},
		
		// Show a value (with an optional marker) at the specified world position
		// 	data:	{ value: "", position: vec2(), showMarker: true, colour: "", name: "" }
		marker: function(data) {
			if (data.name) {
				for (var i = _markers.length; i--;) {
					if (_markers[i].name == data.name) {
						_markers[i] = data;
						return;
					}
				}
			}
			_markers.push(data);
		},
		draw: function(context) {
			// Only draw debug text and markers if debug mode is enabled
			if (!Z.settings.debug) { return; }
			context.save();
			context.font = FONT;
			context.fillStyle = FILL_COLOUR;
			context.textBaseline = "top";
			
			// Draw text values in corner of screen
			context.save();
			context.translate(Z.camera.bounds.X, Z.camera.bounds.Y);
			var y = PADDING.Y, value = "";
			for (var i in _values) {
				if (!_values.hasOwnProperty(i)) { continue; }
				value = (_values[i].showLabel ? (i + ": ") : "") + _values[i].value;
				context.fillText(value, PADDING.X, y);
				y += LINE_HEIGHT;
			}
			context.restore();
			
			// Draw marker values in world space
			context.font = MARKER_FONT;
			for (var i = 0, length = _markers.length; i < length; i++) {
				context.save();
				context.translate(_markers[i].position.X, _markers[i].position.Y);
				context.fillStyle = _markers[i].colour || FILL_COLOUR;
				if (_markers[i].showMarker) {
					context.fillRect(
						-MARKER_SIZE.X / 2, -MARKER_SIZE.Y / 2,
						MARKER_SIZE.X, MARKER_SIZE.Y
					);
				}
				context.fillText(_markers[i].value, MARKER_LABEL_OFFSET.X, MARKER_LABEL_OFFSET.Y);
				context.restore();
			}
			context.restore();
			
			// Reset values and markers ready for next frame
			_values = [];
			_markers = _markers.filter(function(marker) { return marker.name; });
		}
	};
}());