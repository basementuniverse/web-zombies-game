<?php $id = isset($_GET["id"]) ? $_GET["id"] : ""; ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<title>WebZombies Configuration</title>
	<meta charset="UTF-8">
	<link href="images/favicon.png" rel="shortcut icon" type="image/png">
	<link rel="stylesheet/less" type="text/css" href="styles/main.less">
	<script type="text/javascript" src="common/jquery-1.8.2.min.js"></script>
	<script type="text/javascript" src="common/less-1.3.1.min.js"></script>
	<script type="text/javascript" src="common/vec2.js"></script>
	<script type="text/javascript" src="common/common.js"></script>
	<script type="text/javascript" src="game/main.js"></script>
	<script type="text/javascript" src="game/config.js"></script>
	<script type="text/javascript" src="game/settings.js"></script>
	<script type="text/javascript" src="game/mapgenerator.js"></script>
	<script type="text/javascript" src="game/utilities.js"></script>
	<script type="text/javascript" src="game/ui.js"></script>
	<script type="text/javascript" src="game/sprite.js"></script>
	<script type="text/javascript" src="game/animation.js"></script>
	<script type="text/javascript" src="game/content.js"></script>
	<script type="text/javascript">
	
	$(document).ready(function() {
		Z.config.formCallbacks = {
			// Re-initialise the map generator and re-draw the map
			updateMap: function(input, v, data) {
				Z.mapGenerator.reInitialise(Z.content.items["world"]);
				Z.ui.updateMap();
			},
			
			// Clamp health when maximum health changes
			maxHealth: function(input, v, data) {
				var health = $(".input[data-id=player][data-property=health]").attr("data-max", v);
				health.trigger("change");
			},
			
			// Clamp armour when maximum armour changes
			maxArmour: function(input, v, data) {
				var armour = $(".input[data-id=player][data-property=armour]").attr("data-max", v);
				armour.trigger("change");
			},
			
			// Set max amounts for each inventory type
			maxInventory: function(input, v, data) {
				var max = data["player"]["maxInventory"][$(input).attr("data-arrayindex")];
				$(input).attr("data-max", max);
			},
			
			// Update zombie generation rates for a specified biome
			updateZombieDensity: function(input, value, data) {
				var id = $(input).attr("id"),
					biomeDensity = $(input).attr("data-density"),
					setBiomeDensity = function(biome, density, rates) {
						var v = Math.round(value * density);
						biome.travelRate.max = v;
						if (rates > 1) {
							for (var i = 0; i < rates; i++) {
								biome.rates[i].max = v;
							}
						} else {
							biome.rates[0].max = v;
						}
					};
				switch (id) {
					case "zombiesuburbdensity":
						setBiomeDensity(data["zombiegenerator"].biomes[2], biomeDensity);
						break;
					case "zombiecitydensity":
						setBiomeDensity(data["zombiegenerator"].biomes[3], biomeDensity, 2);
						setBiomeDensity(data["zombiegenerator"].biomes[4], biomeDensity, 2);
						break;
					default:
						setBiomeDensity(data["zombiegenerator"].biomes[0], biomeDensity);
						setBiomeDensity(data["zombiegenerator"].biomes[1], biomeDensity);
						break;
				}
			}
		};
		Z.config.initialise(<?php echo "\"$id\""; ?>);
	});
	
	</script>
</head>
<body class="config menuscreen">
	<div class="menu">
		<a href="javascript:Z.ui.screen(4)" class="startbutton"></a>
		<a href="javascript:Z.ui.screen(3)" class="zombiesbutton"></a>
		<a href="javascript:Z.ui.screen(1)" class="playerbutton"></a>
		<a href="javascript:Z.ui.screen(0)" class="worldbutton selected"></a>
		<div class="title"></div>
		<hr>
	</div>
	<div class="content worldscreen">
		<div class="inner">
			<a href="javascript:Z.ui.scrollMap(0, -1)" title="Scroll up" class="scrollmap up"></a>
			<a href="javascript:Z.ui.scrollMap(0, 1)" title="Scroll down" class="scrollmap down"></a>
			<a href="javascript:Z.ui.scrollMap(-1, 0)" title="Scroll left" class="scrollmap left"></a>
			<a href="javascript:Z.ui.scrollMap(1, 0)" title="Scroll right" class="scrollmap right"></a>
			<canvas id="mapcanvas"></canvas>
			<div class="mapcontrols">
				<a href="javascript:Z.ui.scrollMap(0, 0, true)"
					title="Center map on player starting position"
					class="centermapbutton"></a>
			</div>
			<div class="worldcontrolsexpandcontainer">
				<a href="javascript:Z.ui.worldControls()" class="worldcontrolsexpand"></a>
			</div>
			<div class="worldcontrols">
				<h1>Seed</h1>
				<input type="text" class="input" data-id="world" data-property="seed" data-change="updateMap">
				<p>
					The world generator seed value. If this is left blank, a new random seed
					will be used each time the game is loaded.
				</p>
				<div class="spacer"></div>
				<h1>Forests</h1>
				<div>
					<img src="images/biome_min.png">
					<input type="hidden" id="worldforestamount" class="input number"
						data-id="world"
						data-property="forestAmount"
						data-min="0"
						data-max="1"
						data-change="updateMap">
					<div class="input fader icons" data-input="worldforestamount"></div>
					<img src="images/forest_max.png">
				</div>
				<h1>Suburbs</h1>
				<div>
					<img src="images/biome_min.png">
					<input type="hidden" id="worldsuburbamount" class="input number"
						data-id="world"
						data-property="suburbAmount"
						data-min="0"
						data-max="1"
						data-change="updateMap">
					<div class="input fader icons" data-input="worldsuburbamount"></div>
					<img src="images/suburb_max.png">
				</div>
				<h1>Cities</h1>
				<div>
					<img src="images/biome_min.png">
					<input type="hidden" id="worldcityamount" class="input number"
						data-id="world"
						data-property="cityAmount"
						data-min="0"
						data-max="1"
						data-change="updateMap">
					<div class="input fader icons" data-input="worldcityamount"></div>
					<img src="images/city_max.png">
				</div>
				<h1>Industrial areas</h1>
				<div>
					<img src="images/city_max.png">
					<input type="hidden" id="worldindustrialamount" class="input number"
						data-id="world"
						data-property="industrialAmount"
						data-min="0"
						data-max="1"
						data-change="updateMap">
					<div class="input fader icons" data-input="worldindustrialamount"></div>
					<img src="images/industrial_max.png">
				</div>
				<div class="spacer"></div>
				<h1>Highways</h1>
				<input type="hidden" id="worldhighwaysize" class="input number"
					data-id="world"
					data-property="highwaySize"
					data-min="0"
					data-max="64"
					data-change="updateMap"
					data-round="true">
				<div class="input selector" data-input="worldhighwaysize">
					<div class="option" data-value="4">250 metres</div>
					<div class="option" data-value="8">500 metres</div>
					<div class="option" data-value="16">1 kilometre</div>
					<div class="option" data-value="32">2 kilometres</div>
					<div class="option" data-value="64">4 kilometres</div>
					<div class="option" data-value="0">Disabled</div>
				</div>
				<p>
					The distance between highways. Highways can be turned off by selecting
					<b>Disabled</b>.
				</p>
				<div class="spacer"></div>
				<h1>Powerups</h1>
				<div>
					<input type="hidden" id="worldpowerups" class="input number"
						data-id="world"
						data-property="powerupRate"
						data-arrayindex="count"
						data-min="0"
						data-max="10"
						data-round="true">
					<div class="input fader powerups" data-input="worldpowerups"></div>
				</div>
				<p>
					The amount of powerups generated in the world.
				</p>
				<div class="spacer"></div>
				<h1>Timescale</h1>
				<input type="hidden" id="worldtimescale" class="input number"
					data-id="world"
					data-property="timeScale"
					data-min="0"
					data-max="1440">
				<div class="input selector" data-input="worldtimescale">
					<div class="option" data-value="1">1 day (realtime)</div>
					<div class="option" data-value="24">1 hour</div>
					<div class="option" data-value="48">30 minutes</div>
					<div class="option" data-value="72">20 minutes</div>
					<div class="option" data-value="144">10 minutes</div>
					<div class="option" data-value="288">5 minutes</div>
					<div class="option" data-value="1440">1 minute</div>
					<div class="option" data-value="0">Disabled</div>
				</div>
				<p>
					Each day in the game world will last this amount of time.
					The day/night cycle can be turned off by selecting <b>Disabled</b>.
				</p>
				<div class="spacer"></div>
				<h1>Starting time</h1>
				<input type="hidden" id="worldstartingtime" class="input"
					data-id="world"
					data-property="startingTime">
				<div class="input selector" data-input="worldstartingtime">
					<div class="option" data-value="09:00">Morning</div>
					<div class="option" data-value="12:00">Midday</div>
					<div class="option" data-value="17:00">Evening</div>
					<div class="option" data-value="00:00">Midnight</div>
				</div>
				<p>
					The time will be set to this when the game starts.
				</p>
			</div>
		</div>
	</div>
	<div class="content playerscreen">
		<div class="inner">
			<table>
				<tr>
					<td>
						<h1>Starting health</h1>
						<p>The player's starting health.</p>
					</td>
					<td>
						<input type="hidden" id="playerhealth" class="input number"
							data-id="player"
							data-property="health"
							data-min="1"
							data-max="">
						<div class="input fader"
							data-input="playerhealth"
							data-showvalue="true"
							data-precision="1"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Maximum health</h1>
						<p>The player's health cannot go above this amount.</p>
					</td>
					<td>
						<input type="text" class="input number"
							data-id="player"
							data-property="maxHealth"
							data-min="1"
							data-max="1000"
							data-change="maxHealth">
					</td>
				</tr>
				<tr>
					<td>
						<h1>Starting armour</h1>
						<p>The amount of armour the player will start the game with.</p>
					</td>
					<td>
						<input type="hidden" id="playerarmour" class="input number"
							data-id="player"
							data-property="armour"
							data-min="0"
							data-max="">
						<div class="input fader"
							data-input="playerarmour"
							data-showvalue="true"
							data-precision="1"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Maximum armour</h1>
						<p>
							The maximum amount of armour the player can wear (armour protects the
							player from both damage and infection).
						</p>
					</td>
					<td>
						<input type="text" class="input number"
							data-id="player"
							data-property="maxArmour"
							data-min="1"
							data-max="1000"
							data-change="maxArmour">
					</td>
				</tr>
				<tr>
					<td>
						<h1>Walking speed</h1>
						<p>The player's speed while walking.</p>
					</td>
					<td>
						<input type="hidden" id="playerwalkspeed" class="input number"
							data-id="player"
							data-property="walkSpeed"
							data-min="10"
							data-max="400">
						<div class="input fader"
							data-input="playerwalkspeed"
							data-showvalue="true"
							data-showunit=" m/s"
							data-precision="0.1"
							data-scale="0.1"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Running speed</h1>
						<p>The player's speed while running.</p>
					</td>
					<td>
						<input type="hidden" id="playerrunspeed" class="input number"
							data-id="player"
							data-property="runSpeed"
							data-min="10"
							data-max="400">
						<div class="input fader"
							data-input="playerrunspeed"
							data-showvalue="true"
							data-showunit=" m/s"
							data-precision="0.1"
							data-scale="0.1"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Running noise</h1>
						<p>
							Zombies within this distance of the player will be alerted when the
							player runs.
						</p>
					</td>
					<td>
						<input type="hidden" id="playerrunningnoise" class="input number"
							data-id="player"
							data-property="runningNoise"
							data-min="0"
							data-max="600">
						<div class="input fader"
							data-input="playerrunningnoise"
							data-showvalue="true"
							data-showunit=" meters"
							data-precision="0.1"
							data-scale="0.1"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Inventory</h1>
						<p>Modify the player's starting inventory and weapons.</p>
					</td>
					<td>
						<a href="javascript:Z.ui.screen(2)">Inventory...</a>
					</td>
				</tr>
			</table>
		</div>
	</div>
	<div class="content inventoryscreen">
		<div class="inner">
			<table>
				<tr>
					<td>
						<h1>Return</h1>
						<p>Return to player settings</p>
					</td>
					<td>
						<a href="javascript:Z.ui.screen(1)">Player settings...</a>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Zombie virus serum</h1>
						<p>
							The amount of zombie virus serum vials in your inventory when the game starts.
							Use these (by pressing <b>C</b>) to cure yourself when you get infected.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventoryserum" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="serum"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventoryserum"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Fuel</h1>
						<p>
							The amount of fuel in your inventory when the game starts. Fuel is used
							by the chainsaw and flamethrower weapons, and also when driving a vehicle.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventoryfuel" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_fuel"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventoryfuel"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Batteries</h1>
						<p>
							The amount of batteries in your inventory when the game starts. 
							Batteries are used for the torch and night vision goggles.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventorybatteries" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_battery"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="1">
						<div class="input fader"
							data-input="inventorybatteries"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>9mm ammo</h1>
						<p>
							The amount of 9mm ammo in your inventory when the game starts. This is
							used by the pistol.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventory9mm" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_9mm"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventory9mm"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Shotgun ammo</h1>
						<p>
							The amount of shotgun ammo in your inventory when the game starts. This
							is used by the shotgun.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventoryshotgun" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_shotgun"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventoryshotgun"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Rifle ammo</h1>
						<p>
							The amount of rifle ammo in your inventory when the game starts. This
							is used by the assault rifle and machinegun.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventoryrifle" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_rifle"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventoryrifle"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Rockets</h1>
						<p>
							The number of rockets in your inventory when the game starts. These are
							used by the rocket launcher.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventoryrocket" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_rocket"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventoryrocket"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Flares</h1>
						<p>
							The number of flares in your inventory when the game starts. These can
							be used as an alternate light source when it is dark.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventoryflare" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_flare"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventoryflare"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Molotov</h1>
						<p>
							The number of molotovs in your inventory when the game starts.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventorymolotov" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_molotov"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventorymolotov"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Grenades</h1>
						<p>
							The number of grenades in your inventory when the game starts.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventorygrenade" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_grenade"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventorygrenade"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Mines</h1>
						<p>
							The number of mines in your inventory when the game starts.
						</p>
					</td>
					<td>
						<input type="hidden" id="inventorymine" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="ammo_mine"
							data-min="0"
							data-max=""
							data-change="maxInventory"
							data-round="true">
						<div class="input fader"
							data-input="inventorymine"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Torch</h1>
						<p>Start the game with a torch in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playertorch" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="torch">
						<div class="input selector" data-input="playertorch">
							<div class="option" data-value="0">No</div>
							<div class="option" data-value="1">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Torch size</h1>
						<p>The size of the torch light.</p>
					</td>
					<td>
						<input type="hidden" id="torchspread" class="input number"
							data-id="torch"
							data-property="spread"
							data-min="20"
							data-max="300">
						<div class="input fader"
							data-input="torchspread"
							data-showvalue="true"
							data-showunit=" meters"
							data-precision="0.1"
							data-scale="0.05"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Torch range</h1>
						<p>
							The maximum range of the torch light.
						</p>
					</td>
					<td>
						<input type="hidden" id="torchmaxrange" class="input number"
							data-id="torch"
							data-property="maxRange"
							data-min="20"
							data-max="1000">
						<div class="input fader"
							data-input="torchmaxrange"
							data-showvalue="true"
							data-showunit=" meters"
							data-precision="0.1"
							data-scale="0.05"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Torch battery rate</h1>
						<p>The rate at which batteries will be consumed when the torch is active.</p>
					</td>
					<td>
						<input type="hidden" id="torchbatteryrate" class="input number"
							data-id="torch"
							data-property="batteryRate"
							data-min="0"
							data-max="2">
						<div class="input fader"
							data-input="torchbatteryrate"
							data-showvalue="true"
							data-showunit=" per second"
							data-precision="0.1"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Night vision goggles</h1>
						<p>Start the game with night vision goggles in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playernightvision" class="input number"
							data-id="player"
							data-property="defaultInventory"
							data-arrayindex="nightvision">
						<div class="input selector" data-input="playernightvision">
							<div class="option" data-value="0">No</div>
							<div class="option" data-value="1">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Night vision colour</h1>
						<p>The colour of the night vision goggles overlay.</p>
					</td>
					<td>
						<input type="hidden" id="nightvisioncolour" class="input"
							data-id="nightvision"
							data-property="colour">
						<div class="input selector" data-input="nightvisioncolour">
							<div class="option" data-value="rgba(0, 255, 0, 0.5)">Green</div>
							<div class="option" data-value="rgba(255, 0, 0, 0.5)">Red</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Night vision battery rate</h1>
						<p>
							The rate at which batteries will be consumed when the night vision 
							goggles are active.
						</p>
					</td>
					<td>
						<input type="hidden" id="nightvisionbatteryrate" class="input number"
							data-id="nightvision"
							data-property="batteryRate"
							data-min="0"
							data-max="2">
						<div class="input fader"
							data-input="nightvisionbatteryrate"
							data-showvalue="true"
							data-showunit=" per second"
							data-precision="0.1"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Cricket bat</h1>
						<p>Start the game with a cricket bat in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playercricketbat" class="input bool"
							data-id="player"
							data-property="defaultWeapons"
							data-arrayindex="weapon_cricketbat">
						<div class="input selector" data-input="playercricketbat">
							<div class="option" data-value="false">No</div>
							<div class="option" data-value="true">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Cricket bat damage</h1>
						<p>The amount of damage dealt by the cricket bat.</p>
					</td>
					<td>
						<input type="hidden" id="cricketbatdamage" class="input number"
							data-id="weapon_cricketbat"
							data-property="damageAmount"
							data-min="1"
							data-max="1000"
							data-round="true">
						<div class="input fader" data-input="cricketbatdamage"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Katana</h1>
						<p>Start the game with a katana in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playerkatana" class="input bool"
							data-id="player"
							data-property="defaultWeapons"
							data-arrayindex="weapon_katana">
						<div class="input selector" data-input="playerkatana">
							<div class="option" data-value="false">No</div>
							<div class="option" data-value="true">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Katana damage</h1>
						<p>The amount of damage dealt by the katana.</p>
					</td>
					<td>
						<input type="hidden" id="katanadamage" class="input number"
							data-id="weapon_katana"
							data-property="damageAmount"
							data-min="1"
							data-max="1000"
							data-round="true">
						<div class="input fader" data-input="katanadamage"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Chainsaw</h1>
						<p>Start the game with a chainsaw in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playerchainsaw" class="input bool"
							data-id="player"
							data-property="defaultWeapons"
							data-arrayindex="weapon_chainsaw">
						<div class="input selector" data-input="playerchainsaw">
							<div class="option" data-value="false">No</div>
							<div class="option" data-value="true">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Chainsaw damage</h1>
						<p>The amount of damage dealt by the chainsaw.</p>
					</td>
					<td>
						<input type="hidden" id="chainsawdamage" class="input number"
							data-id="weapon_chainsaw"
							data-property="damageAmount"
							data-min="1"
							data-max="1000"
							data-round="true">
						<div class="input fader" data-input="chainsawdamage"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Pistol</h1>
						<p>Start the game with a pistol in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playerpistol" class="input bool"
							data-id="player"
							data-property="defaultWeapons"
							data-arrayindex="weapon_pistol">
						<div class="input selector" data-input="playerpistol">
							<div class="option" data-value="false">No</div>
							<div class="option" data-value="true">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Pistol damage</h1>
						<p>The amount of damage dealt by the pistol.</p>
					</td>
					<td>
						<input type="hidden" id="pistoldamage" class="input number"
							data-id="weapon_pistol"
							data-property="damageAmount"
							data-min="1"
							data-max="1000"
							data-round="true">
						<div class="input fader" data-input="pistoldamage"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Pistol magazine size</h1>
						<p>The number of bullets in each pistol magazine.</p>
					</td>
					<td>
						<input type="hidden" id="pistolmagazinesize" class="input number"
							data-id="weapon_pistol"
							data-property="magazineSize"
							data-min="1"
							data-max="100"
							data-round="true">
						<div class="input fader"
							data-input="pistolmagazinesize"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Shotgun</h1>
						<p>Start the game with a shotgun in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playershotgun" class="input bool"
							data-id="player"
							data-property="defaultWeapons"
							data-arrayindex="weapon_shotgun">
						<div class="input selector" data-input="playershotgun">
							<div class="option" data-value="false">No</div>
							<div class="option" data-value="true">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Shotgun damage</h1>
						<p>The amount of damage dealt by the shotgun.</p>
					</td>
					<td>
						<input type="hidden" id="shotgundamage" class="input number"
							data-id="weapon_shotgun"
							data-property="damageAmount"
							data-min="1"
							data-max="1000"
							data-round="true">
						<div class="input fader" data-input="shotgundamage"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Shotgun damage spread amount</h1>
						<p>Zombies within this area of a shotgun blast will also be damaged.</p>
					</td>
					<td>
						<input type="hidden" id="shotgunspread" class="input number"
							data-id="weapon_shotgun"
							data-property="spread"
							data-min="1"
							data-max="300"
							data-round="true">
						<div class="input fader"
							data-input="shotgunspread"
							data-showvalue="true"
							data-showunit=" meters"
							data-precision="0.1"
							data-scale="0.05"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Shotgun maximum range</h1>
						<p>
							The maximum effective range of the shotgun. Set this to 0 for unlimited
							range.
						</p>
					</td>
					<td>
						<input type="hidden" id="shotgunrange" class="input number"
							data-id="weapon_shotgun"
							data-property="maxRange"
							data-min="1"
							data-max="1000"
							data-round="true">
						<div class="input fader"
							data-input="shotgunrange"
							data-showvalue="true"
							data-showunit=" meters"
							data-precision="0.1"
							data-scale="0.05"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Shotgun magazine size</h1>
						<p>The number of bullets in each shotgun magazine.</p>
					</td>
					<td>
						<input type="hidden" id="shotgunmagazinesize" class="input number"
							data-id="weapon_shotgun"
							data-property="magazineSize"
							data-min="1"
							data-max="100"
							data-round="true">
						<div class="input fader"
							data-input="shotgunmagazinesize"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Assault rifle</h1>
						<p>Start the game with an assault rifle in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playerassaultrifle" class="input bool"
							data-id="player"
							data-property="defaultWeapons"
							data-arrayindex="weapon_assaultrifle">
						<div class="input selector" data-input="playerassaultrifle">
							<div class="option" data-value="false">No</div>
							<div class="option" data-value="true">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Assault rifle damage</h1>
						<p>The amount of damage dealt by the assault rifle.</p>
					</td>
					<td>
						<input type="hidden" id="assaultrifledamage" class="input number"
							data-id="weapon_assaultrifle"
							data-property="damageAmount"
							data-min="1"
							data-max="1000"
							data-round="true">
						<div class="input fader" data-input="assaultrifledamage"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Assault rifle magazine size</h1>
						<p>The number of bullets in each assault rifle magazine.</p>
					</td>
					<td>
						<input type="hidden" id="assaultriflemagazinesize" class="input number"
							data-id="weapon_assaultrifle"
							data-property="magazineSize"
							data-min="1"
							data-max="100"
							data-round="true">
						<div class="input fader"
							data-input="assaultriflemagazinesize"
							data-showvalue="true"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Assault rifle rate of fire</h1>
						<p>The number of bullets fired per second by the assault rifle.</p>
					</td>
					<td>
						<input type="hidden" id="assaultriflerateoffire" class="input number"
							data-id="weapon_assaultrifle"
							data-property="rateOfFire"
							data-min="1"
							data-max="60"
							data-round="true">
						<div class="input fader"
							data-input="assaultriflerateoffire"
							data-showvalue="true"
							data-showunit=" per second"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Machine gun</h1>
						<p>Start the game with a machine gun in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playermachinegun" class="input bool"
							data-id="player"
							data-property="defaultWeapons"
							data-arrayindex="weapon_machinegun">
						<div class="input selector" data-input="playermachinegun">
							<div class="option" data-value="false">No</div>
							<div class="option" data-value="true">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Machine gun damage</h1>
						<p>The amount of damage dealt by the machine gun.</p>
					</td>
					<td>
						<input type="hidden" id="machinegundamage" class="input number"
							data-id="weapon_machinegun"
							data-property="damageAmount"
							data-min="1"
							data-max="1000"
							data-round="true">
						<div class="input fader" data-input="machinegundamage"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Machine gun rate of fire</h1>
						<p>The number of bullets fired per second by the machine gun.</p>
					</td>
					<td>
						<input type="hidden" id="machinegunrateoffire" class="input number"
							data-id="weapon_machinegun"
							data-property="rateOfFire"
							data-min="1"
							data-max="60"
							data-round="true">
						<div class="input fader"
							data-input="machinegunrateoffire"
							data-showvalue="true"
							data-showunit=" per second"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Flamethrower</h1>
						<p>Start the game with a flamethrower in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playerflamethrower" class="input bool"
							data-id="player"
							data-property="defaultWeapons"
							data-arrayindex="weapon_flamethrower">
						<div class="input selector" data-input="playerflamethrower">
							<div class="option" data-value="false">No</div>
							<div class="option" data-value="true">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Flamethrower damage</h1>
						<p>
							The amount of damage dealt by the flamethrower. <i>Note - zombies that
							are on fire will take continuous damage from the fire.</i>
						</p>
					</td>
					<td>
						<input type="hidden" id="flamethrowerdamage" class="input number"
							data-id="weapon_flamethrower"
							data-property="damageAmount"
							data-min="1"
							data-max="1000"
							data-round="true">
						<div class="input fader" data-input="flamethrowerdamage"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Rocket launcher</h1>
						<p>Start the game with a rocket launcher in your inventory.</p>
					</td>
					<td>
						<input type="hidden" id="playerrocketlauncher" class="input bool"
							data-id="player"
							data-property="defaultWeapons"
							data-arrayindex="weapon_rocketlauncher">
						<div class="input selector" data-input="playerrocketlauncher">
							<div class="option" data-value="false">No</div>
							<div class="option" data-value="true">Yes</div>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Rocket launcher damage</h1>
						<p>The amount of damage dealt by rockets.</p>
					</td>
					<td>
						<input type="hidden" id="rocketlauncherdamage" class="input number"
							data-id="weapon_rocketlauncher"
							data-property="damageAmount"
							data-min="1"
							data-max="1200"
							data-round="true">
						<div class="input fader" data-input="rocketlauncherdamage"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Rocket launcher damage spread amount</h1>
						<p>Zombies within this area of a rocket explosion will also be damaged.</p>
					</td>
					<td>
						<input type="hidden" id="rocketlauncherspread" class="input number"
							data-id="weapon_rocketlauncher"
							data-property="spread"
							data-min="1"
							data-max="400"
							data-round="true">
						<div class="input fader"
							data-input="rocketlauncherspread"
							data-showvalue="true"
							data-showunit=" meters"
							data-precision="0.1"
							data-scale="0.05"></div>
					</td>
				</tr>
			</table>
		</div>
	</div>
	<div class="content zombiesscreen">
		<div class="inner">
			<table>
				<tr>
					<td>
						<h1>Initial density</h1>
						<p>The number of zombies to create when the game starts.</p>
					</td>
					<td>
						<input type="text" class="input number"
							data-id="zombiegenerator"
							data-property="initialDensity"
							data-min="0"
							data-max="100">
					</td>
				</tr>
				<tr>
					<td>
						<h1>Countryside density</h1>
						<p>The number of zombies to create in the countryside.</p>
					</td>
					<td>
						<input type="hidden" id="zombiecountrydensity" class="input number"
							data-id="zombiegenerator_config"
							data-property="0"
							data-min="0"
							data-max="15"
							data-change="updateZombieDensity"
							data-density="3">
						<div class="input fader" data-input="zombiecountrydensity"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Suburban density</h1>
						<p>The number of zombies to create in the suburbs.</p>
					</td>
					<td>
						<input type="hidden" id="zombiesuburbdensity" class="input number"
							data-id="zombiegenerator_config"
							data-property="1"
							data-min="0"
							data-max="15"
							data-change="updateZombieDensity"
							data-density="5">
						<div class="input fader" data-input="zombiesuburbdensity"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>City density</h1>
						<p>The number of zombies to create inside cities.</p>
					</td>
					<td>
						<input type="hidden" id="zombiecitydensity" class="input number"
							data-id="zombiegenerator_config"
							data-property="2"
							data-min="0"
							data-max="15"
							data-change="updateZombieDensity"
							data-density="6.6">
						<div class="input fader" data-input="zombiecitydensity"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Walking speed</h1>
						<p>Zombie speed while walking.</p>
					</td>
					<td>
						<input type="hidden" id="zombiewalkspeed" class="input number"
							data-id="zombie"
							data-property="walkSpeed"
							data-min="1"
							data-max="400">
						<div class="input fader"
							data-input="zombiewalkspeed"
							data-showvalue="true"
							data-showunit=" m/s"
							data-precision="0.1"
							data-scale="0.1"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Running speed</h1>
						<p>Zombie speed while running (ie. when they are alerted by the player).</p>
					</td>
					<td>
						<input type="hidden" id="zombierunspeed" class="input number"
							data-id="zombie"
							data-property="runSpeed"
							data-min="1"
							data-max="400">
						<div class="input fader"
							data-input="zombierunspeed"
							data-showvalue="true"
							data-showunit=" m/s"
							data-precision="0.1"
							data-scale="0.1"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Head health</h1>
						<p>The amount of damage a zombie can take before dying.</p>
					</td>
					<td>
						<input type="text" class="input number"
							data-id="zombie"
							data-property="headHealth"
							data-min="1"
							data-max="10000">
					</td>
				</tr>
				<tr>
					<td>
						<h1>Body health</h1>
						<p>The amount of damage a zombie can take before falling over.</p>
					</td>
					<td>
						<input type="text" class="input number"
							data-id="zombie"
							data-property="bodyHealth"
							data-min="1"
							data-max="10000">
					</td>
				</tr>
				<tr>
					<td>
						<h1>Regeneration rate</h1>
						<p>Zombie health will regenerate at this rate.</p>
					</td>
					<td>
						<input type="hidden" id="zombieregenerationrate" class="input number"
							data-id="zombie"
							data-property="regenerationRate"
							data-min="0"
							data-max="100">
						<div class="input fader"
							data-input="zombieregenerationrate"
							data-showvalue="true"
							data-showunit=" per second"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Claw infection chance</h1>
						<p>The chance of infecting the player when using the claw attack.</p>
					</td>
					<td>
						<input type="hidden" id="zombieclawinfectionchance" class="input number"
							data-id="zombie"
							data-property="clawInfectionChance"
							data-min="0"
							data-max="1">
						<div class="input fader" data-input="zombieclawinfectionchance"></div>
					</td>
				</tr>
				<tr>
					<td>
						<h1>Bite infection chance</h1>
						<p>The chance of infecting the player when using the bite attack.</p>
					</td>
					<td>
						<input type="hidden" id="zombiebiteinfectionchance" class="input number"
							data-id="zombie"
							data-property="biteInfectionChance"
							data-min="0"
							data-max="1">
						<div class="input fader" data-input="zombiebiteinfectionchance"></div>
					</td>
				</tr>
			</table>
		</div>
	</div>
	<div class="content startscreen">
		<div class="inner">
				<div class="startmenu">
					<a href="javascript:Z.config.saveConfig(true)" class="startbutton"></a>
					<a href="javascript:Z.config.saveConfig()" class="savebutton"></a>
					<!--<a href="config_old.php" class="advancedbutton"></a>-->
					<a href="javascript:Z.config.initialise(<?php echo "'$id'"; ?>)" class="resetbutton"></a>
				</div>
			</div>
	</div>
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