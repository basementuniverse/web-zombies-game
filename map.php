<!DOCTYPE html>
<html lang="en">
<head>
	<title>WebZombies Map</title>
	<meta charset="UTF-8">
	<link href="images/favicon.png" rel="shortcut icon" type="image/png">
	<link rel="stylesheet/less" type="text/css" href="styles/main.less">
	<script type="text/javascript" src="common/jquery-1.8.2.min.js"></script>
	<script type="text/javascript" src="common/less-1.3.1.min.js"></script>
	<script type="text/javascript" src="common/vec2.js"></script>
	<script type="text/javascript" src="common/common.js"></script>
	<script type="text/javascript" src="game/main.js"></script>
	<script type="text/javascript" src="game/settings.js"></script>
	<script type="text/javascript" src="game/mapgenerator.js"></script>
	<script type="text/javascript" src="game/utilities.js"></script>
	<script type="text/javascript" src="game/ui.js"></script>
	<script type="text/javascript" src="game/content.js"></script>
	<script type="text/javascript">
	
	var PLAYER_UPDATE_INTERVAL = 1000,
		MAP_UPDATE_DISTANCE = 75;
	
	var playerPosition = vec2(),
		canvas = null,
		context = null;
	
	$(document).ready(function() {
		if (Z.utilities.supportsLocalStorage()) {
			Z.content.load([{
				id: "map",
				loader: Z.mapGenerator.loadData,
				args: ["", JSON.parse(localStorage.getItem("map"))]
			}], function(content) {
				Z.ui.loading(false);
				Z.mapGenerator.initialise(content["map"], JSON.parse(localStorage.getItem("world")));
				
				// Get map canvas and draw initial area
				canvas = $("canvas#mapcanvas").get(0);
				context = canvas.getContext("2d");
				var scale = Z.settings.mapCellSize * 2;
				$(window).resize(function() {
					canvas.width = Math.ceil(window.innerWidth / scale) * scale;
					canvas.height = Math.ceil(window.innerHeight / scale) * scale;
					updateMap(true);
				}).trigger("resize");
				
				// Update player position every few seconds
				setInterval(function() { updateMap(); }, PLAYER_UPDATE_INTERVAL);
				updateMap(true);
			});
		} else {
			Z.ui.error("Local storage not supported!");
		}
	});
	
	var updateMap = function(skipPositionCheck) {
		if (!canvas || !context) { return; }
		var currentPosition = vec2.fromString(localStorage.getItem("player"));
		if (skipPositionCheck ||
			vec2.len(vec2.sub(playerPosition, currentPosition)) >= MAP_UPDATE_DISTANCE) {
			playerPosition = currentPosition;
			Z.mapGenerator.draw(
				playerPosition,
				playerPosition,
				context,
				vec2(canvas.width, canvas.height)
			);
		}
	};
	
	</script>
</head>
<body class="map">
	<canvas id="mapcanvas"></canvas>
	<div class="loading">
		<img src="images/loading.gif">
		<div>Loading...</div>
	</div>
</body>
</html>