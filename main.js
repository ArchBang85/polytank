  ////   ////
// POLYTANK //
// ARCHBANG //
//  GBJAM3  //
//   2014   //
  ////  ////

// 
// 
// 

// Initialize Phaser, and creates a 160x144px GBJAM game
var screenW = 160; //160
var screenH = 144; //144

var game = new Phaser.Game(screenW, screenH, Phaser.AUTO, 'game_div');

var death = true; // set to false for invulnerability debug

var lateral_speed = 0.8;
var vertical_speed = 1.3;

var maxVelocity= 30;
var minVelocity = 15;

var junkMaxVelocity = 20;
var junkMinVelocity = 6;

var explosionTimer = 0;
var explosionRate = 50;

var squirtRate = 1000;
var nextSquirt = 0;

var livingJunk = [];
var debrisTimer = 0;
var energySpitTimer = 0;

//game.world.setBounds(-80, 0, 240, 1000);

//Phaser.StageScaleMode.EXACT_FIT = 0;
function scaleUp() {
	// Doubling the size
	// Tie this to a toggle?
			this.game.stage.scale.minWidth = this.screenW * 2;
			this.game.stage.scale.minHeight = this.screenH * 2;
			this.game.stage.scale.setSize();

}

// Create title screen
var title_state = {

	preload: function() {
		this.game.load.image('background', 'assets/title_background.png'); 
		// remember the spritesheet as well for breathing animations etc
	},
	
	create: function() {
		this.background = this.game.add.sprite(0, 0, 'background');
		
		// Enable actions on the image
		this.background.inputEnabled = true;
		
		this.background.events.onInputDown.add(this.listener, this);
		scaleUp();
		//this.scaleUp();
	
	},
	
	update: function() {
	
	},
	
	listener: function() {
	
		this.game.state.start('main');
	
	},
	
}

var saveScreen_state = {

	preload: function() {
	
	},
	
	create: function() {
	
	},
	
	update: function() {
	
	},

}

var endScreen_state = {

	preload: function() {
	
	},
	
	create: function() {
	
	},
	
	update: function() {
	
	},

}

// Creates a new 'main' state that will contain the game
var main_state = {

    preload: function() { 
		// loading all the assets/background
		this.game.load.image('background', 'assets/test.png');
		this.game.load.image('tank', 'assets/tank.png');
		this.game.load.image('block', 'assets/block.png');
		this.game.load.image('debris', 'assets/debris.png');
		this.game.load.image('junk', 'assets/washingMachine.png');
		this.game.load.image('energySpit', 'assets/debris2.png'); // should be an animation
			
		// Load animations
		this.game.load.spritesheet('tankSprite', 'assets/tank_strip.png', 16, 16, 10);
		this.game.load.spritesheet('rightSquirt', 'assets/squirtsprites.png', 24, 24, 24);
		this.game.load.spritesheet('leftSquirt', 'assets/squirtspriteinverted.png', 24, 24, 24);
		this.game.load.spritesheet('upSquirt', 'assets/squirtspriteup.png', 24, 24, 24);
		this.game.load.spritesheet('downSquirt', 'assets/squirtspritedown.png', 24, 24, 24);
		this.game.load.spritesheet('energyWave', 'assets/energyWave2.png', 250, 24, 1);
		this.game.load.spritesheet('coin', 'assets/CoinSpin.png', 9, 9, 6);
		
		// load sounds
		this.game.load.audio('music1', 'assets/s2.wav');
		
	},

	create: function() {
		// called after preload
		//scaleUp();
	
	    this.world.setBounds(-40,0,250,144);
		game.camera.x = 0;
		game.camera.y = 0;
		
		this.ground = this.game.add.sprite(-40, 0, 'background');
		this.ground.body.gravity.y = -1; // speed of the background scrolling
		
		this.lethals = game.add.group();
		
		// create blocks
		this.blocks = game.add.group(parent = this.lethals);
		this.blocks.createMultiple(32, 'block');
		
		// create timers //
		//this.timer = this.game.time.events.loop(4500, this.add_blocks, this);
		this.junkTimer = this.game.time.events.loop(7000, this.add_junk, this);
		//this.coinTimer1 = this.game.time.events.loop(3000, this.add_coins, this);		
		
		// create junk - destroy player on contact
		this.junks = game.add.group(parent = this.lethals);
		this.junks.createMultiple(32, 'junk');
		//this.junks.add.sprite('debris');
		//this.junk.setAll('outOfBoundsKill', true);
		//this.junk.setAll('checkWorldBounds', true);		
		
		// Create container for debris
		this.debris = game.add.group(parent = this.lethals);
		this.debris.createMultiple(32, 'debris');
		this.debris.setAll('outOfBoundsKill', true);
		this.debris.setAll('checkWorldBounds', true);
		
		// The energy wave occasionally spits some energy
		this.energySpits = game.add.group(parent = this.lethals);
		this.energySpits.createMultiple(32, 'energySpit');
		this.energySpits.setAll('outOfBoundsKill', true);
		this.energySpits.setAll('checkWorldBounds', true);
		
		this.tank = this.game.add.sprite(this.game.world.centerX, 25, 'tankSprite');
		this.tank.body.velocity.y = 30;
		this.tank.anchor.setTo(0.5, 0.5);	 
		this.tank.animations.add('fly');
		this.tank.animations.play('fly', 20, true);
		
		// Add chasing energywave
		this.energyWave = this.game.add.sprite(-40, -10, 'energyWave');
		this.energyWave.animations.add('wave');
		this.energyWave.animations.play('wave', 1, true);
		
/* 		var coinGroup = game.add.group();
		var coinFrameNames = Phaser.Animation.generateFrameNames('coin', 0, 4, '', 1);
		
		for (var i = 0; i < 6; i++)
		{
			coinSprite = coinGroup.create(10*i, game.rnd.integerInRange(10,40), 'coin', 'coin00');
		}
		
		coinGroup.callAll('animations.add', 'animations', 'spin', coinFrameNames, 8, true, false);
		coinGroup.callAll('play', null, 'swim');
		
		this.coins = game.add.group();
		this.coins.createMultiple(32, 'coin'); */	
	
		var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		space_key.onDown.add(this.jump, this);

		var right_key = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		right_key.onDown.add(this.moveRight, this);

		var left_key = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		left_key.onDown.add(this.moveLeft, this);
		//left_key.isDown.add(this.cameraLeft, this);
		
		var up_key = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
		up_key.onDown.add(this.moveUp, this);
		
		var down_key = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
		down_key.onDown.add(this.moveDown, this);	
		
		//var b_key = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
		//b_key.onDown.add(this.squirt, this);
		
		// make sure the key has to have some kind of firing rate
		var a_key = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
		a_key.onDown.add(this.squirt, this);
			
		//this.score = 0;
		//var style = { font: "30px Arial", fill: "#ffffff" };
		//this.label_Score = this.game.add.text(20, 20, "0", style);
		
		this.music1 = this.game.add.audio('music1');
		this.music1.play();

		},
		
    update: function() {
		
		// How to increment difficulty as the level progresses? Time plus multiplier
		
		// Function called 60 times per second
		
		if (this.tank.inWorld == false)
			this.restart_game();
		
		if(death)
		{
			this.game.physics.overlap(this.tank, this.lethals, this.restart_game, null, this);
		}
		
		// this.game.physics.overlap(this.tank, this.blocks, this.restart_game, null, this);
		// this.game.physics.overlap(this.tank, this.junks, this.restart_game, null, this);
		// this.game.physics.overlap(this.tank, this.energyWave, this.restart_game, null, this);
		// this.game.physics.overlap(this.tank, this.debris, this.restart_game, null, this); 
		 
		// Debris launching timer
		
		if (game.time.now > debrisTimer)
		{
			this.add_one_debris();
			debrisTimer = game.time.now + game.rnd.integerInRange(2000, 4000);
		}
		
		// Debris launching timer
		
		if (game.time.now > energySpitTimer)
		{
			this.add_one_energySpit();
			energySpitTimer = game.time.now + game.rnd.integerInRange(2000, 4000);
		}		
		 
		 
		// CONTROLS //
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
		{
		
			this.tank.body.x -= lateral_speed;
			//console.log("left is down");
			
			if(this.tank.body.x < 80 && this.tank.body.x > -40)
			{
				this.game.camera.x -= 1;
			}
		}
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
		{
			this.tank.body.x += lateral_speed;
			
			//console.log("right is down");
			if(this.tank.body.x < 200 && this.tank.body.x > 80)
			{
				this.game.camera.x += 1;
			}
		}
		
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.UP))
		{
			this.tank.body.y -= vertical_speed;
		}
		
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
		{
			this.tank.body.y += vertical_speed;
		}
		
		// reduce player lateral velocity through inertia
		if(this.tank.body.velocity.x > 0)
		{
			this.tank.body.velocity.x -= 0.8;
		}
		if(this.tank.body.velocity.x < 0)
		{
			this.tank.body.velocity.x += 0.8;
		}
		// reduce player vertical velocity through inertia
		if(this.tank.body.velocity.y > 0)
		{
			this.tank.body.velocity.y -= 0.7;
		}
		if(this.tank.body.velocity.y < 0)
		{
			this.tank.body.velocity.y += 0.7;
		}
		
    },
	
	squirt: function() {
	
		// Check if the cooldown is over
		if(game.time.now > nextSquirt)
		{
			
			nextSquirt = game.time.now + squirtRate;
			
			// Check if left or right or rear
			if(this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
				// moving left so add squirt to right
				// console.log('squirting right');
				squirt = this.game.add.sprite(this.tank.body.x + 26, this.tank.body.y + 8, 'rightSquirt');
				squirt.anchor.setTo(0.5, 0.5);
				squirt.animations.add('squirt');
				squirt.animations.getAnimation('squirt').killOnComplete = true;
				squirt.animations.play('squirt', 20, false); 
			}
			else if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
			{
				// moving right so add squirt to left
				// console.log('squirting left');
				squirt = this.game.add.sprite(this.tank.body.x - 2, this.tank.body.y + 8, 'leftSquirt');
				squirt.anchor.setTo(0.5, 0.5);	
				squirt.animations.add('squirt');
				squirt.animations.getAnimation('squirt').killOnComplete = true;
				squirt.animations.play('squirt', 20, false); 
				
			}
			else if(this.game.input.keyboard.isDown(Phaser.Keyboard.UP))
			{
				// down squirt
				// console.log('squirting down');
				squirt = this.game.add.sprite(this.tank.body.x + 8, this.tank.body.y + 24, 'downSquirt');
				squirt.anchor.setTo(0.5, 0.5);	
				squirt.animations.add('squirt');
				squirt.animations.getAnimation('squirt').killOnComplete = true;
				squirt.animations.play('squirt', 20, false); 
			}		
			else		
			{
				// up squirt
				// console.log('squirting up');
				squirt = this.game.add.sprite(this.tank.body.x + 8, this.tank.body.y - 12, 'upSquirt');
				squirt.anchor.setTo(0.5, 0.5);	
				squirt.animations.add('squirt');
				squirt.animations.getAnimation('squirt').killOnComplete = true;
				squirt.animations.play('squirt', 20, false); 
			}
			// Figure out what to do once the squirt has blown up
			// There should be an explosion function that checks nearby objects and shunts them away if they are too close
			// Creates a timed event after which the explosion occurs. Adjust the modifier if the animation changes etc.

			this.game.time.events.add(Phaser.Timer.SECOND * 0.3, this.explosion, this);
		}
	},
	
	explosion: function() {
		//game.physics.enable(squirt, Phaser.Physics.ARCADE);
		//squirt.body.setSize(20, 20);
		x_dif = squirt.body.x - this.tank.body.x;
		y_dif = squirt.body.y - this.tank.body.y;
			
		// check if explosion is close enough to player
		blast_radius = 28;
		if(Math.sqrt(x_dif * x_dif + y_dif * y_dif) < blast_radius)
		{
				
			// check which side the explosion is on
			
			y_boost = 0;
			x_boost = 0;
			boost_level = 45;				
			
			if(x_dif > 8)
			{
				x_boost = -boost_level;
			} 
			else if(x_dif < -8) 
			{
				x_boost = boost_level;
			}
			
			if(y_dif > 8)
			{
				y_boost = -boost_level; 
			}
			else if (y_dif < -6)
			{
				y_boost = boost_level;
			}
			
			this.tank.body.velocity.y += y_boost;
			this.tank.body.velocity.x += x_boost;
		}
		
		// Check all lethals
		
		this.lethals.forEachAlive(function (child) 
			{
				t = child;			
				this.game.physics.overlap(squirt, child, this.destruction, null, this);
		
			}, this);		
	},
		
		// Check all living junk
		/* this.junks.forEachAlive(function (collateral) { 
		c = collateral;
		console.log(collateral.body.x + " " + squirt.body.x)
		x_dif = squirt.body.x - collateral.body.x;
		y_dif = squirt.body.y - collateral.body.y;

		// check if explosion is close enough to enemy
		blast_radius = 32;
		if(Math.sqrt(x_dif * x_dif + y_dif * y_dif) < blast_radius)
		{
			this.game.time.events.add(Phaser.Timer.SECOND * 0.5, this.destruction, this);
		}
		}, this);
		
		// Check all living debris
		this.debris.forEachAlive(function (collateral) { 
		
		c = collateral;
		x_dif = squirt.body.x - c.body.x;
		y_dif = squirt.body.y - c.body.y;

		// check if explosion is close enough to enemy
		blast_radius = 34;
		if(Math.sqrt(x_dif * x_dif + y_dif * y_dif) < blast_radius)
		{
			this.game.time.events.add(Phaser.Timer.SECOND * 0.54, this.destruction, this);
		}
		}, this); */
	
	
	destruction: function() {
		t.kill();
	},

	cameraLeft: function() {
		this.game.camera.x -= 5;
	},
	
	moveLeft: function() {
	
/* 		var boost = Math.floor((maxVelocity - minVelocity)* Math.random()) + minVelocity;
		
	
		this.tank.body.velocity.x -= boost;
		console.log("moving left by " + boost); */
	},
	
	moveRight: function() {
		
	/* 	var boost = Math.floor((maxVelocity - minVelocity)* Math.random()) + minVelocity;
		this.tank.body.velocity.x += boost;
		console.log("moving right by " + boost); */

	},
	
	moveUp: function() {
	
		//if(this.tank.body.y > 20)
		//{
		//	var boost = Math.floor((maxVelocity - minVelocity)* Math.random()) + minVelocity;
		//	this.tank.body.velocity.y -= boost;
		//}
	},
	
	moveDown: function() {
		//if(this.tank.body.y < 120 && this.tank.body.y > 10)
		//{
		//	var boost = Math.floor((maxVelocity - minVelocity)* Math.random()) + minVelocity;
		//	this.tank.body.velocity.y += boost;
		//}
	},
		
	
	jump: function() {
		// add velocity
		//this.tank.body.velocity.y = -35;
		this.tank.body.velocity.x = 25;
	},
	
	add_one_block: function(x, y) {
		// Get the first dead block
		var block = this.blocks.getFirstDead();
		
		// Set the new position 
		block.reset(x, y);
		
		// Add velocity to the pipe and make it move up
		block.body.velocity.y = -20;
		
		// Kill the block when it's not visible anymore
		block.outOfBoundsKill = true;
	},
	
	add_blocks: function() {
		//this.score += 1;
		//this.label_Score.content = this.score;
		
		var hole = Math.floor(Math.random() * 7) + 1;
		
		for (var i = 0; i < 8; i++)
			if (i != hole && i != hole +1)
				this.add_one_block(i*20, screenH);
				console.log("adding block to " + i * 20 + ", " + 0);
	},
	
	add_one_debris: function(){
	
		// Add one piece of debris at a time from all living junk
		deb = this.debris.getFirstExists(false);
		
		livingJunk.length = 0;
		
		this.junks.forEachAlive(function(j){
			livingJunk.push(j);
		});
	
		if (deb && livingJunk.length > 0)
		{
			var random=game.rnd.integerInRange(0, livingJunk.length-1);
			var debrisLauncher = livingJunk[random];
			
			deb.reset(debrisLauncher.body.x, debrisLauncher.body.y);
			// grant random velocity
			deb.body.velocity.y = -game.rnd.integerInRange(7, 45);
			deb.body.velocity.x = game.rnd.integerInRange(-5, 5);
		
		}
	
	
		//var deb = this.debris.getFirstDead();
		
		//deb.reset(x, y);
		//deb.body.velocity.y = -30;
	},
	
	// Also have things shoot out from the energy wave
	add_one_energySpit: function(){
		
		var energySpit = this.energySpits.getFirstDead();
		
		
		x = game.rnd.integerInRange(-20, screenW + 20);
		energySpit.reset(x, -5);
		
		y_vel = game.rnd.integerInRange(7,50);
		
		energySpit.body.velocity.y = y_vel;
		
		
	},
	
	add_one_junk: function(x, y){
	
		var junk = this.junks.getFirstDead();
		
		// set new position
		junk.reset(x, y);
		// add velocity 
		
		y_vel = Math.floor((junkMaxVelocity - junkMinVelocity)* Math.random()) + junkMinVelocity;
		x_vel = Math.floor((junkMaxVelocity - junkMinVelocity)* Math.random()) + junkMinVelocity;
		x_direction = 1;
		


		junk.body.velocity.y = -y_vel; // randomise
		
		if(Math.random() > 0.5)
		{
			x_direction = -1;
		}
		
		if(junk.body.x < 10)
		{
			x_direction = 1;
		}
		
		if(junk.body.x > 150)
		{
			x_direction = -1;
		}
		
		junk.body.velocity.x += x_vel * x_direction; // randomise and take position into account
		// kill when out of bounds
		junk.outOfBoundsKill = true;
	},
	
	add_junk: function() {
		
		var spot = Math.floor(Math.random() * 10) + 1;
		
		this.add_one_junk(spot * 20, screenH);
		// console.log('adding junk to ' + spot * 20 + ', ' + 0);
	
	
	},
		
	changeDirection: function(){
			
		
	},
	
	
	// Add something positive to pick up
	// maybe a special function for the B-button when sufficiently many have been gotten
	add_one_coin: function(x, y){
		
		var coin = this.coins.getFirstDead();
		
		coin.reset(x, y);	
		coin.body.velocity.y = -10;
		
		coin.animations.add('spin');
		coin.animations.play('spin', 8, true);
		
		coin.outOfBoundsKill = true;
	
	},
	
	add_coins: function(){
		// Needs a counter that inverts the lateral velocity 
		//this.game.time.events.add(Phaser.Timer.SECOND * 0.3, this.explosion, this);
		var start_x = Math.floor((140 - 20)* Math.random()) + 20
	
		for (var i = 0; i < 6; i++)
		{
			this.add_one_coin(start_x + i * 2, screenH + i * 11);
		}
		//this.coinSpin = this.game.add.sprite(20, 20, 'coin');
		//this.coinSpin.animations.add('spin');
		//this.coinSpin.animations.play('spin', 8, true);
	},
	
	game_title: function() {
		this.music1.stop();
		this.game.time.events.remove(this.timer);
		this.game.time.events.remove(this.junkTimer);
		this.game.time.events.remove(this.coinTimer1);
		// Start the title
		this.game.state.start('title');
	
	},
	
	debrisHitsPlayer: function(player, debris) {
	
		debris.kill();
		
		// display end
		
		// restart level
	
	
	},
	
	restart_game: function() {
	
		this.music1.stop();
		this.game.time.events.remove(this.timer);
		this.game.time.events.remove(this.junkTimer);
		this.game.time.events.remove(this.coinTimer1);
		// Start the main state
		this.game.state.start('main');
	
	},
	
	render: function() {
	
	},
	
	
};

// Add and start the 'main' state to start the game
game.state.add('title', title_state);
game.state.add('main', main_state);  
game.state.start('title'); 

//http://www.beepbox.co/#4s9k5l0e4t6a7g0fj7i0r1w4111f0000d2111c0000h0000v0100o3210b08000000110000000000000000000000p21rFxX00G7lk257lk2Itlg8aBC7kVmln9F1p80KAaqWWgTnRRSMwVx1s38OXrLMk1jfxcfGaac6PNlkgl6kP7gGCsi0000