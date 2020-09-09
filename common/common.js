"use strict";

// Provide IE fallback for console (ignores log request)
var console = console || { log: function () { } };

// Add CSS class to document body if using IE
$(document).ready(function() {
	if (navigator.appVersion.indexOf("MSIE") != -1) {
		var version = parseFloat(navigator.appVersion.split("MSIE")[1]);
		$("body").addClass("ie ie_" + version);
	}
});

// RequestAnimationFrame cross-browser shim
window.requestAnimationFrame = (function() {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 30);
		}
	);
})();

// CancelAnimationFrame cross-browser shim
window.cancelAnimationFrame = (function() {
	return (
		window.cancelAnimationFrame ||
		window.webkitCancelRequestAnimationFrame ||
		window.mozCancelRequestAnimationFrame ||
		window.oCancelRequestAnimationFrame ||
		window.msCancelRequestAnimationFrame ||
		clearTimeout
	);
})();

// Array shuffle function (Fisher-Yates shuffle)
Array.prototype.shuffle = function() {
	var i = this.length, r = 0, swap = null;
	if (!i) { return; }
	while (--i) {
		r = Math.floor(Math.random() * (i + 1));
		swap = this[r];
		this[r] = this[i];
		this[i] = swap;
	}
};

// Trim whitespace from beginning/end of string
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, ""); 
};

// Clamps a value between min and max. If either min or max are undefined, clamp between 0 and 1
//	a:		The value to clamp
//	min:	The minimum value of a
//	max:	The maximum value of a
Math.clamp = function(a, min, max) {
	if (min === undefined) { min = 0; };
	if (max === undefined) { max = 1; };
	return (a < min ? min : (a > max ? max : a));
};

// Does a linear interpolation from a to b and returns the result (scalar, array or vec2)
Math.lerp = function(a, b, i) {
	if (a instanceof Array && b instanceof Array) {				// Lerp array
		var result = [];
		for (var j = Math.min(a.length, b.length); j--;) {
			result[j] = a[j] * (1 - i) + b[j] * i;
		}
		return result;
	} else if (a instanceof Object && b instanceof Object) {	// Lerp vec2
		return vec2(a.X * (1 - i) + b.X * i, a.Y * (1 - i) + b.Y * i);
	} else {
		return a * (1 - i) + b * i;								// Lerp scalar
	}
};

// Convert degrees to radians
Math.radians = function(degrees) {
	return (Math.PI / 180) * degrees;
};

// Convert radians to degrees
Math.degrees = function(radians) {
	return (180 / Math.PI) * radians;
};

// Keyboard keys
var Keys = {
	Up: 38,
	Down: 40,
	Left: 37,
	Right: 39,
	Escape: 27,
	Enter: 13,
	Space: 32,
	Shift: 16,
	Ctrl: 17,
	Num0: 48,
	Num1: 49,
	Num2: 50,
	Num3: 51,
	Num4: 52,
	Num5: 53,
	Num6: 54,
	Num7: 55,
	Num8: 56,
	Num9: 57,
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,
	SquareOpenParen: 219,
	SquareCloseParen: 221,
	Dash: 192,
	Hash: 222
};

// Mouse buttons
var Mouse = {
	Left: 1,
	Middle: 2,
	Right: 3
};