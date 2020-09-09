<!DOCTYPE html>
<html lang="en">
<head>
	<title>About WebZombies</title>
	<meta charset="UTF-8">
	<link href="images/favicon.png" rel="shortcut icon" type="image/png">
	<link rel="stylesheet/less" type="text/css" href="styles/main.less">
	<script type="text/javascript" src="common/jquery-1.8.2.min.js"></script>
	<script type="text/javascript" src="common/less-1.3.1.min.js"></script>
	<script type="text/javascript">
	
	// jQuery toggle visible function with slide and fade effect
	$.fn.fadeSlideToggle = function() {
		if ($(this).is(":visible")) {
			$(this)
			.slideUp("fast")
			.animate(
				{ opacity: 0 },
				{ queue: false, duration: "fast" }
			);
		} else {
			$(this)
			.slideDown("fast")
			.animate(
				{ opacity: 1 },
				{ queue: false, duration: "fast" }
			);
		}
	};
	
	</script>
</head>
<body class="about menuscreen">
	<div class="menu">
		<a href="index.php" class="startbutton"></a>
		<div class="title"></div>
		<hr>
	</div>
	<div class="content">
		<div class="inner">
			<h1>Welcome!</h1>
			<p>
				<img src="images/help/game.png"><br>
				The aim of the game is to stay alive. You are in a massive (near-infinite) world
				full of zombies and there's nothing they'd like more than to make you their lunch, so
				grab some weapons, stock up on ammo and try to avoid becoming a human happy meal!
			</p>
			<h1><a href="javascript:void(0)" class="button_toggle closed" onclick="$('div.howdoiplay').fadeSlideToggle(); $(this).toggleClass('closed')">How do I play?</a></h1>
			<div class="howdoiplay">
				<p>
					Move around using the arrow keys and use the mouse to aim and fire (with the <span class="key">Left mouse button</span>). Hold <span class="key">Shift</span> to
					run.
				</p>
				<p>
					<i>Note: you can also fire using <span class="key">Ctrl</span>. This will fire your weapon
					in the direction you are currently facing.</i>
				</p>
				<p>
					Use the mouse wheel (or <span class="key">Z</span> / <span class="key">X</span> keys) to switch weapons.
				</p>
				<p>
					Headshots will kill zombies instantly and shooting a zombie anywhere else will cause it
					to fall over (if enough damage is dealt). This will slow the zombie down, but it will get up again
					a few seconds later and continue chasing you.
				</p>
				<img src="images/help/bite.png"><br>
				<p>
					Zombies will claw at you when you get close to them. If you get too close, a zombie might bite you. There is a
					chance that zombie attacks will pass on the zombie infection - if this happens, your health will gradually decrease
					until you die. You might even become a zombie yourself! To cure the infection, pick up and use serum vials (press
					<span class="key">C</span> to use zombie serum).
				</p>
				<p>
					<i>Note: armour will prevent you from getting infected and also protect you from damage. Make sure you have plenty
					of armour if you plan on engaging zombies in close-quarter combat!</i>
				</p>
				<img src="images/help/car.png"><br>
				<p>
					You can drive cars as well. This is useful for getting away from zombies quickly, however they can still see
					you (and attack you) when sitting in a car, so it is best to keep moving! To get in/out of a car, stand near the
					car doors and press <span class="key">G</span>. Press <span class="key">Space</span> to use the handbrake, and
					<span class="key">H</span> to switch the headlights on/off.
				</p>
				<p>
					Press <span class="key">Esc</span> at any time to pause the game and access the main menu. From here, you can
					view the map, see current statistics and configure controls.
				</p>
			</div>
			<h1><a href="javascript:void(0)" class="button_toggle closed" onclick="$('div.howdoiconfig').fadeSlideToggle(); $(this).toggleClass('closed')">How can I configure the game world?</a></h1>
			<div class="howdoiconfig">
				<p>
					Pretty much everything in this game can be configured. To do this, press <span class="key">Esc</span> while playing to
					open the main menu and select the <span class="button">Game</span> tab, then click on <span class="button">Create a new game...</span>.
					This will take you to the <a href="config.php">configuration interface</a>.
				</p>
				<h1>World</h1>
				<p>
					The world options allow you to configure the world generator. Enter a new seed value to re-generate the game world (leave this
					value blank to generate a new seed each time the game is loaded). You can also set the amount of forests, suburban areas and cities
					(cities are split into commercial and industrial areas).
				</p>
				<p>
					You can also set the time scale (or disable it completely - this can improve performance on older machines) and the starting time.
				</p>
				<h1>Player</h1>
				<p>
					The player options allow you to set maximum and starting health/armour amounts and the player's starting inventory. You can also
					configure some weapon settings (like damage amount and rate-of-fire) by clicking <span class="button">Inventory...</span>.
				</p>
				<h1>Zombies</h1>
				<p>
					Use these options to configure how much health zombies have. <b>Head health</b> sets how much damage a zombie can take before dying (for good, this time!)
					and <b>Body health</b> sets how much damage a zombie can take before falling over. Zombie health regenerates over time.
				</p>
				<p>
					Use the zombie density sliders to configure how many zombies will spawn in different parts of the world. You might die quite quickly if you
					set these too high...
				</p>
				<h1>Start</h1>
				<p>
					There are three options under this tab:
					<ul>
						<li>
							<span class="button">Start game</span> will start the game using the settings that you have configured.
						</li>
						<li>
							<span class="button">Save config...</span> will save your configuration settings. A unique ID code will be generated so that you
							can return to this configuration at any time in the future. Each time you modify the configuration a new code will be generated.
						</li>
						<li>
							<span class="button">Reset changes</span> will reset configuration options to their default settings. If you are modifying an existing
							world, this button will reset to the saved configuration settings.
						</li>
					</ul>
				</p>
			</div>
			<h1><a href="javascript:void(0)" class="button_toggle closed" onclick="$('div.weaponsandpowerups').fadeSlideToggle(); $(this).toggleClass('closed')">Weapons and Power-ups</a></h1>
			<div class="weaponsandpowerups">
				<p>
					<i>Note: Use the mouse wheel (or <span class="key">Z</span> / <span class="key">X</span> keys) to switch weapons.
					When no weapon is selected, you will only be able to push zombies over.</i>
				</p>
				<p>
					<i>Weapons can also be selected using the number keys. This will cycle through weapons with that number (see below
					to check weapon indexes).</i>
				</p>
				<table>
					<tr>
						<td><img src="images/help/push.png"></td>
						<td>
							<h1>Push</h1>
							<p>
								If you're out of ammo, you can still push zombies over. This stops them from following you
								for a few seconds, but doesn't do any damage. Use as a last resort...
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/health.png"></td>
						<td>
							<h1>Health</h1>
							<p>
								Grab these health packs to replenish your health. Each pack gives you 30 health points.
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/armour.png"></td>
						<td>
							<h1>Armour</h1>
							<p>
								Armour protects you from damage and stops you from getting infected when attacked by zombies.
								If you are going to be fighting zombies in close-quarter combat, make sure you have plenty of armour!
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/serum.png"></td>
						<td>
							<h1>Serum</h1>
							<p>
								If you do get infected, your health will gradually decrease until you are dead. Use these serum vials
								to counteract the infection by pressing <span class="key">C</span>. You can carry a maximum of 5 serum vials.
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/torch.png"></td>
						<td>
							<h1>Torch</h1>
							<p>
								Use the torch to see where you are going at night. Zombies can see you if you have the torch activated
								though, so watch out in built-up areas! Press <span class="key">T</span> to activate/deactivate.
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/nightvision.png"></td>
						<td>
							<h1>Nightvision</h1>
							<p>
								Nightvision goggles allow you to see things in the dark, without alerting zombies to your position. Quite
								useful for stealthy zombie hunting at night. Press <span class="key">N</span> to activate/deactivate.
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/ammo_battery.png"></td>
						<td>
							<h1>Batteries</h1>
							<p>
								Batteries are used by the torch and nightvision goggles.
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/ammo_fuel.png"></td>
						<td>
							<h1>Fuel</h1>
							<p>
								Fuel is used by the chainsaw and flamethrower weapons, and when driving cars. Some cars
								already have fuel in them - get in the vehicle (by pressing <span class="key">G</span> when near
								a door) to collect the fuel.
							</p>
							<p>
								You can shoot fuel canisters to make them explode and set nearby zombies on fire, but make sure you
								aren't standing too close when that happens!
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/cricketbat.png"></td>
						<td>
							<h1>Cricket Bat</h1>
							<p>
								Quite useful when you run out of ammo! Hitting a zombie on the head will generally
								kill the zombie.
							</p>
							<p>
								Shortcut key: <span class="key">1</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/katana.png"></td>
						<td>
							<h1>Katana</h1>
							<p>
								Use this weapon to chop zombies up silently. This weapon doesn't make any noise, so it can
								be very useful at night if you don't want to attract attention (combine with nightvision goggles
								for true stealth zombie-hunting!)
							</p>
							<p>
								Shortcut key: <span class="key">1</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/chainsaw.png"></td>
						<td>
							<h1>Chainsaw</h1>
							<p>
								Excellent for chopping up zombies, but quite loud - it will attract zombies from around the local area.
								Also uses up fuel quite quickly, so use it sparingly!
							</p>
							<p>
								Shortcut key: <span class="key">1</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/pistol.png"></td>
						<td>
							<h1>Pistol</h1>
							<p>
								You start the game with this weapon (and a small amount of ammo). Good when there aren't many zombies
								around, but it's easy to become overwhelmed by crowds of zombies when using this weapon.
							</p>
							<p>
								Shortcut key: <span class="key">2</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/ammo_pistol.png"></td>
						<td>
							<h1>9mm Ammo</h1>
							<p>
								Used by the pistol.
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/shotgun.png"></td>
						<td>
							<h1>Shotgun</h1>
							<p>
								This weapon has a small area of effect, so it can be used to kill multiple zombies at once. Deals a lot
								of damage, but it has quite a low rate of fire and a limited range. Good for close range combat.
							</p>
							<p>
								Shortcut key: <span class="key">3</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/ammo_shotgun.png"></td>
						<td>
							<h1>Shotgun ammo</h1>
							<p>
								Used by the shotgun. There should be plenty of this type of ammo available in the world.
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/assaultrifle.png"></td>
						<td>
							<h1>Assault Rifle</h1>
							<p>
								A good general-purpose weapon for dealing with crowds of zombies.
							</p>
							<p>
								Shortcut key: <span class="key">3</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/machinegun.png"></td>
						<td>
							<h1>Machine Gun</h1>
							<p>
								Eats ammo like popcorn, but deals a lot of damage. Use this weapon to kill crowds of zombies
								very quickly.
							</p>
							<p>
								Shortcut key: <span class="key">4</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/ammo_rifle.png"></td>
						<td>
							<h1>Rifle Ammo</h1>
							<p>
								Used by the assault rifle and machine gun. There should be quite a lot of this type of ammo lying around.
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/flamethrower.png"></td>
						<td>
							<h1>Flamethrower</h1>
							<p>
								The flamethrower uses up fuel very quickly, but is great for igniting large crowds of zombies. Zombies will
								stay on fire until they die, and the fire can quickly spread to other nearby zombies.
							</p>
							<p>
								If you collide with a zombie while it is on fire, you will take a lot of damage so watch out when
								using this weapon!
							</p>
							<p>
								Shortcut key: <span class="key">5</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/rocketlauncher.png"></td>
						<td>
							<h1>Rocket Launcher</h1>
							<p>
								Launches high-explosive rockets that detonate on impact. Make sure you aren't standing too close
								when the rocket explodes! Good for clearing a path through crowds of zombies, though.
							</p>
							<p>
								Shortcut key: <span class="key">5</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/ammo_rocket.png"></td>
						<td>
							<h1>Rockets</h1>
							<p>
								Used by the rocket launcher. You can shoot rocket containers to make them explode.
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/flare.png"></td>
						<td>
							<h1>Flare</h1>
							<p>
								Use flares to light up the night. Zombies can see you when you are standing near a lit flare
								though. Also, when they burn out they will ignite any zombies standing on top of (or very close to) the
								flare.
							</p>
							<p>
								Shortcut key: <span class="key">6</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/molotov.png"></td>
						<td>
							<h1>Molotov</h1>
							<p>
								A bottle of fuel that will explode on impact and ignite any nearby zombies. You can shoot molotovs to
								make them explode.
							</p>
							<p>
								Shortcut key: <span class="key">6</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/grenade.png"></td>
						<td>
							<h1>Grenade</h1>
							<p>
								Grenades do a lot of damage but with a smaller range than rockets. These grenades have a 3 second timer.
								You can shoot grenades to make them explode.
							</p>
							<p>
								Shortcut key: <span class="key">6</span>
							</p>
						</td>
					</tr>
					<tr>
						<td><img src="images/help/mine.png"></td>
						<td>
							<h1>Mine</h1>
							<p>
								Mines deal the same amount of damage as grenades, except that they are triggered when a zombie walks onto them.
								You can shoot mines to make them explode.
							</p>
							<p>
								Shortcut key: <span class="key">6</span>
							</p>
						</td>
					</tr>
				</table>
			</div>
			<h1><a href="javascript:void(0)" class="button_toggle closed" onclick="$('div.credits').fadeSlideToggle(); $(this).toggleClass('closed')">Credits</a></h1>
			<div class="credits">
				<table>
					<tr>
						<td>Game code & graphics</td>
						<td><a href="mailto:webzombies@gordonlarrigan.com">Gordon Larrigan</a></td>
					</tr>
					<tr>
						<td>
							Audio samples<br>
							<span>(from <a href="http://www.freesound.org/" target="_blank">freesound.org</a>)</span>
						</td>
						<td>
							<p>
								<a href="http://www.freesound.org/people/Fr3yr/sounds/100803/" target="_blank">Glock19_magchange</a> by <a href="http://www.freesound.org/people/Fr3yr/" target="_blank">Fr3yr</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/jeseid77/sounds/86246/" target="_blank">Various Shotgun Pumps</a> by <a href="http://www.freesound.org/people/jeseid77/" target="_blank">jeseid77</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/IlDucci/sounds/149795/" target="_blank">Pistols/Handguns manipulated and toyed with</a> by <a href="http://www.freesound.org/people/IlDucci/" target="_blank">IlDucci</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/Rock%20Savage/sounds/81042/" target="_blank">Blood Hitting Window</a> by <a href="http://www.freesound.org/people/Rock%20Savage/" target="_blank">Rock Savage</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/Corsica_S/sounds/91520/" target="_blank">electric_toothbrush_02</a> by <a href="http://www.freesound.org/people/Corsica_S/" target="_blank">Corsica_S</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/soundscalpel.com/sounds/110622/" target="_blank">warfare_gunshots_machine_gun_burst_001</a> by <a href="http://www.freesound.org/people/soundscalpel.com/" target="_blank">soundscalpel.com</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/Superex1110/sounds/77535/" target="_blank">Sharp Explosion, Lots of Debris</a> by <a href="http://www.freesound.org/people/Superex1110/" target="_blank">Superex1110</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/man/sounds/14615/" target="_blank">canon</a> by <a href="http://www.freesound.org/people/man/" target="_blank">man</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/sarge4267/sounds/102733/" target="_blank">explosion3</a> by <a href="http://www.freesound.org/people/sarge4267/" target="_blank">sarge4267</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/lonemonk/sounds/185580/" target="_blank">Chainsaw Start Attempts</a> by <a href="http://www.freesound.org/people/lonemonk/" target="_blank">lonemonk</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/CGEffex/sounds/93136/" target="_blank">Hitting baseball w. wooden bat</a> by <a href="http://www.freesound.org/people/CGEffex/" target="_blank">CGEffex</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/m_O_m/sounds/117771/" target="_blank">cabbage_hit_iron rod_08</a> by <a href="http://www.freesound.org/people/m_O_m/" target="_blank">m_O_m</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/Vosvoy/sounds/123632/" target="_blank">HomemadeFlamethrower_Fire - Loop</a> by <a href="http://www.freesound.org/people/Vosvoy/" target="_blank">Vosvoy</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/19Marsou20/sounds/167280/" target="_blank">MATCH BEING STRUCK 2</a> by <a href="http://www.freesound.org/people/19Marsou20/" target="_blank">19Marsou20</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/Jamius/sounds/41527/" target="_blank">MatchStrike</a> by <a href="http://www.freesound.org/people/Jamius/" target="_blank">Jamius</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/E330/sounds/99444/" target="_blank">click_data_error</a> by <a href="http://www.freesound.org/people/E330/" target="_blank">E330</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/jobro/sounds/33789/" target="_blank">5 beep c</a> by <a href="http://www.freesound.org/people/jobro/" target="_blank">jobro</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/enric592/sounds/185743/" target="_blank">Car motor</a> by <a href="http://www.freesound.org/people/enric592/" target="_blank">enric592</a>
							</p>
							<p>
								<a href="http://www.freesound.org/people/Halleck/sounds/121657/" target="_blank">metal crash 3</a> by <a href="http://www.freesound.org/people/Halleck/" target="_blank">Halleck</a>
							</p>
						</td>
					</tr>
				</table>
			</div>
			<br>
			<h1>More information</h1>
			<div>
				<p>
					If you would like any more information, please get in touch:
					<a href="mailto:info@basementuniverse.com">info@basementuniverse.com</a>
				</p>
			</div>
		</div>
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