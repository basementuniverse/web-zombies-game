<?php $id = isset($_GET["id"]) ? $_GET["id"] : ""; ?>
<?php $seed = isset($_GET["seed"]) ? $_GET["seed"] : ""; ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<title>WebZombies</title>
	<meta charset="UTF-8">
	<link href="images/favicon.png" rel="shortcut icon" type="image/png">
	<link rel="stylesheet/less" type="text/css" href="styles/main.less">
	<script type="text/javascript" src="common/jquery-1.8.2.min.js"></script>
	<script type="text/javascript" src="common/less-1.3.1.min.js"></script>
	<script type="text/javascript" src="common/vec2.js"></script>
	<script type="text/javascript" src="common/common.js"></script>
	<script type="text/javascript" src="game/main.js"></script>
	<script type="text/javascript" src="game/game.js"></script>
	<script type="text/javascript" src="game/settings.js"></script>
	<script type="text/javascript" src="game/utilities.js"></script>
	<script type="text/javascript" src="game/debug.js"></script>
	<script type="text/javascript" src="game/ui.js"></script>
	<script type="text/javascript" src="game/input.js"></script>
	<script type="text/javascript" src="game/camera.js"></script>
	<script type="text/javascript" src="game/hud.js"></script>
	<script type="text/javascript" src="game/viewarea.js"></script>
	<script type="text/javascript" src="game/mapgenerator.js"></script>
	<script type="text/javascript" src="game/cellgenerator.js"></script>
	<script type="text/javascript" src="game/cell.js"></script>
	<script type="text/javascript" src="game/spritegenerator.js"></script>
	<script type="text/javascript" src="game/sprite.js"></script>
	<script type="text/javascript" src="game/animation.js"></script>
	<script type="text/javascript" src="game/collision.js"></script>
	<script type="text/javascript" src="game/actormap.js"></script>
	<script type="text/javascript" src="game/actor.js"></script>
	<script type="text/javascript" src="game/player.js"></script>
	<script type="text/javascript" src="game/building.js"></script>
	<script type="text/javascript" src="game/tree.js"></script>
	<script type="text/javascript" src="game/zombiegenerator.js"></script>
	<script type="text/javascript" src="game/zombiebrain.js"></script>
	<script type="text/javascript" src="game/zombie.js"></script>
	<script type="text/javascript" src="game/weapon.js"></script>
	<script type="text/javascript" src="game/weaponspread.js"></script>
	<script type="text/javascript" src="game/projectile.js"></script>
	<script type="text/javascript" src="game/noise.js"></script>
	<script type="text/javascript" src="game/powerup.js"></script>
	<script type="text/javascript" src="game/healthpowerup.js"></script>
	<script type="text/javascript" src="game/armourpowerup.js"></script>
	<script type="text/javascript" src="game/weaponpowerup.js"></script>
	<script type="text/javascript" src="game/inventorypowerup.js"></script>
	<script type="text/javascript" src="game/effect.js"></script>
	<script type="text/javascript" src="game/bulleteffect.js"></script>
	<script type="text/javascript" src="game/bloodeffect.js"></script>
	<script type="text/javascript" src="game/dusteffect.js"></script>
	<script type="text/javascript" src="game/explosioneffect.js"></script>
	<script type="text/javascript" src="game/fireeffect.js"></script>
	<script type="text/javascript" src="game/lighteffect.js"></script>
	<script type="text/javascript" src="game/powerupeffect.js"></script>
	<script type="text/javascript" src="game/statistics.js"></script>
	<script type="text/javascript" src="game/environment.js"></script>
	<script type="text/javascript" src="game/torch.js"></script>
	<script type="text/javascript" src="game/nightvision.js"></script>
	<script type="text/javascript" src="game/car.js"></script>
	<script type="text/javascript" src="game/skideffect.js"></script>
	<script type="text/javascript" src="game/carspritegenerator.js"></script>
	<script type="text/javascript" src="game/cheats.js"></script>
	<script type="text/javascript" src="game/sound.js"></script>
	<script type="text/javascript" src="game/content.js"></script>
	<script type="text/javascript">
	
	$(document).ready(function() {
		Z.game.initialise(
			<?php echo !empty($id) ? "\"$id\"" : "\"\""; ?>,	// index.php?id=N
			<?php echo !empty($seed) ? "\"$seed\"" : "\"\""; ?>	// index.php?seed=N
		);
	});
	
	</script>
</head>
<body class="game">
	<div class="game"></div>
	<div class="infection"></div>
	<div class="intro">
		<div class="title"></div>
		<a href="javascript:Z.ui.toggleAudio()" class="audioenabledbutton"></a>
		<hr>
		<p>
			Welcome to WebZombies!
		</p>
		<p>
			A zombie virus has swept the globe, and now 99% of the human population is trying
			to eat your brains!
		</p>
		<p>
			You should probably try not to let that happen.
		</p>
		<div class="intromenu">
			<a href="javascript:Z.ui.closeIntro()" class="startbutton"></a>
			<a href="config.php?id=<?php echo $id; ?>" class="newworldbutton"></a>
		</div>
		<p class="bottom">
			<i>Note: press Escape at any time to pause the game and access the main menu.</i>
		</p>
	</div>
	<div class="paused menuscreen">
		<div class="menu">
			<a href="javascript:Z.ui.screen(3)" class="gamebutton"></a>
			<a href="javascript:Z.ui.screen(2)" class="controlsbutton"></a>
			<a href="javascript:Z.ui.screen(1)" class="mapbutton"></a>
			<a href="javascript:Z.ui.screen(0)" class="statsbutton"></a>
			<div class="title"></div>
			<hr>
		</div>
		<a href="javascript:Z.ui.toggleAudio()" class="audioenabledbutton"></a>
		<div class="content statsscreen">
			<div class="inner">
				<table>
					<tr>
						<td>Current date/time</td>
						<td><span class="currenttime"></span></td>
					</tr>
					<tr>
						<td class="alivelabel">You have survived for</td>
						<td><span class="alivetime"></span></td>
					</tr>
					<tr>
						<td>Distance travelled</td>
						<td><span class="distancetravelled"></span></td>
					</tr>
					<tr>
						<td>Zombies killed</td>
						<td><span class="zombieskilled"></span></td>
					</tr>
					<tr>
						<td>Inventory</td>
						<td><span class="inventory"></span></td>
					</tr>
					<tr>
						<td>Weapons</td>
						<td><span class="weapons"></span></td>
					</tr>
				</table>
			</div>
		</div>
		<div class="content mapscreen">
			<div class="inner">
				<a href="javascript:Z.ui.scrollMap(0, -1)" title="Scroll up" class="scrollmap up"></a>
				<a href="javascript:Z.ui.scrollMap(0, 1)" title="Scroll down" class="scrollmap down"></a>
				<a href="javascript:Z.ui.scrollMap(-1, 0)" title="Scroll left" class="scrollmap left"></a>
				<a href="javascript:Z.ui.scrollMap(1, 0)" title="Scroll right" class="scrollmap right"></a>
				<canvas id="mapcanvas"></canvas>
				<div class="mapcontrols">
					<a href="javascript:Z.ui.scrollMap(0, 0, true)"
						title="Center map on player"
						class="centermapbutton"></a>
					<a href="javascript:void(0)"
						title="Open map in a new window"
						class="mappopupbutton"></a>
				</div>
			</div>
		</div>
		<div class="content controlsscreen">
			<div class="inner">
				<table>
					<tr>
						<td colspan="2" class="description">
							Click on a button to set the main or alternative input for that control.
						</td>
					</tr>
					<tr>
						<td>Move up</td>
						<td>
							<a href="javascript:Z.ui.setControl('up')" data-control="up" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('up', true)" data-control="up" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Move down</td>
						<td>
							<a href="javascript:Z.ui.setControl('down')" data-control="down" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('down', true)" data-control="down" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Move left</td>
						<td>
							<a href="javascript:Z.ui.setControl('left')" data-control="left" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('left', true)" data-control="left" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Move right</td>
						<td>
							<a href="javascript:Z.ui.setControl('right')" data-control="right" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('right', true)" data-control="right" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Run</td>
						<td>
							<a href="javascript:Z.ui.setControl('run')" data-control="run" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('run', true)" data-control="run" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Attack</td>
						<td>
							<a href="javascript:Z.ui.setControl('attack')" data-control="attack" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('attack', true)" data-control="attack" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Last weapon</td>
						<td>
							<a href="javascript:Z.ui.setControl('lastweapon')" data-control="lastweapon" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('lastweapon', true)" data-control="lastweapon" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Next weapon</td>
						<td>
							<a href="javascript:Z.ui.setControl('nextweapon')" data-control="nextweapon" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('nextweapon', true)" data-control="nextweapon" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Reload</td>
						<td>
							<a href="javascript:Z.ui.setControl('reload')" data-control="reload" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('reload', true)" data-control="reload" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Use serum</td>
						<td>
							<a href="javascript:Z.ui.setControl('serum')" data-control="serum" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('serum', true)" data-control="serum" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Torch</td>
						<td>
							<a href="javascript:Z.ui.setControl('torch')" data-control="torch" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('torch', true)" data-control="torch" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Night vision</td>
						<td>
							<a href="javascript:Z.ui.setControl('nightvision')" data-control="nightvision" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('nightvision', true)" data-control="nightvision" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Get in/out car</td>
						<td>
							<a href="javascript:Z.ui.setControl('getincar')" data-control="getincar" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('getincar', true)" data-control="getincar" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Car handbrake</td>
						<td>
							<a href="javascript:Z.ui.setControl('handbrake')" data-control="handbrake" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('handbrake', true)" data-control="handbrake" class="alternatekey"></a>
						</td>
					</tr>
					<tr>
						<td>Car headlights</td>
						<td>
							<a href="javascript:Z.ui.setControl('headlights')" data-control="headlights" class="mainkey"></a>
							<a href="javascript:Z.ui.setControl('headlights', true)" data-control="headlights" class="alternatekey"></a>
						</td>
					</tr>
				</table>
			</div>
		</div>
		<div class="content gamescreen">
			<div class="inner">
				<div class="gamemenu">
					<a href="javascript:(function() { Z.game.paused = false; Z.ui.paused(false); }())" class="returnbutton"></a>
					<a href="javascript:Z.game.restart()" class="restartbutton"></a>
					<a href="config.php?id=<?php echo $id; ?>" class="newworldbutton"></a>
					<a href="about.php" class="aboutbutton"></a>
				</div>
			</div>
		</div>
	</div>
	<div class="setcontrol"><div>Press a key (or <b>Escape</b> to cancel/clear the current key mapping)</div></div>
	<div class="loading">
		<img src="images/loading.gif">
		<div>Loading...</div>
	</div>
	<script>
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
		
		ga('create', 'UA-7572914-2', 'auto');
		ga('send', 'pageview');
	</script>
</body>
</html>