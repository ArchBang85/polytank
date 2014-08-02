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

var maxVelocity= 30;
var minVelocity = 15;


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
		this.game.load.image('background', 'assets/background2.png');
		this.game.load.image('tank', 'assets/tank.png');
		this.game.load.image('block', 'assets/block.png');
		this.game.load.image('debris', 'assets/debris.png');

		
		// Load animations
		this.game.load.spritesheet('tankSprite', 'assets/tank_strip.png', 16, 16, 10);
		this.game.load.spritesheet('rightSquirt', 'assets/squirtsprites.png', 24, 24, 24);
		this.game.load.spritesheet('leftSquirt', 'assets/squirtspriteinverted.png', 24, 24, 24);
		this.game.load.spritesheet('upSquirt', 'assets/squirtspriteup.png', 24, 24, 24);
		// load sounds
		
		this.game.load.audio('music1', 'assets/s1.wav');
		
	},

	create: function() {
		// called after preload
		//this.game.stage.smoothed = false
		//sscaleUp();
	
	    this.world.setBounds(-40,0,220,144);
		game.camera.x = 0;
		game.camera.y = 0;
		
		this.ground = this.game.add.sprite(-screenW/2, 0, 'background');
		//this.ground.body.gravity.y = -15;
		 
		this.blocks = game.add.group();
		this.blocks.createMultiple(32, 'block');
		
		// create timer to create blocks
		this.timer = this.game.time.events.loop(4500, this.add_blocks, this);
		
		// Create container for debris
		this.debris = game.add.group();
		this.debris.createMultiple(32, 'debris');
		this.debris.setAll('outOfBoundsKill', true);
		this.debris.setAll('checkWorldBounds', true);
		
		
		this.tank = this.game.add.sprite(this.game.world.centerX, 50, 'tankSprite');
		this.tank.anchor.setTo(0.5, 0.5);
		//this.tankSprite.scale.set(1);
		 
		this.tank.animations.add('fly');
		//console.log(this.tank.animations);
		this.tank.animations.play('fly', 20, true);
		
		//This allows your sprite to collide with the world bounds like they were rigid objects
        //pineapple.body.collideWorldBounds=true;
        //pineapple.body.gravity.x = game.rnd.integerInRange(-50, 50);
        //pineapple.body.gravity.y = 100 + Math.random() * 100;
        //pineapple.body.bounce.setTo(0.9, 0.9);
		
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
		
		//var a_key = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
		//a_key.onDown.add(this.squirt, this);
		
		var a_key = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
		a_key.onDown.add(this.squirt, this);
		
		
		
		this.score = 0;
		var style = { font: "30px Arial", fill: "#ffffff" };
		this.label_Score = this.game.add.text(20, 20, "0", style);
		
		this.music1 = this.game.add.audio('music1');
		// this.music1.play();
		//this.cursors = this.game.input.keyboard.createCursorKeys();
		

		},
		
    update: function() {
		// Function called 60 times per second
		
		if (this.tank.inWorld == false)
			this.restart_game();
			
		this.game.physics.overlap(this.tank, this.blocks, this.restart_game, null, this);
		 
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
		{
		
			this.tank.body.x -= 1;
			//console.log("left is down");
			
			if(this.tank.body.x < 40 && this.tank.body.x > -40)
			{
				this.game.camera.x -= 1;
			}
		}
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
		{
			this.tank.body.x += 1;
			//console.log("right is down");
			if(this.tank.body.x < 180 && this.tank.body.x > 100)
			{
				this.game.camera.x += 1;
			}
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
			this.tank.body.velocity.y -= 0.4;
		}
		if(this.tank.body.velocity.y < 0)
		{
			this.tank.body.velocity.y += 0.4;
		}
		
		
		

		
    },
	
	squirt: function() {
		// Check if left or right or rear
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
			// moving left so add squirt to right
			console.log('squirting right');
			squirt = this.game.add.sprite(this.tank.body.x + 26, this.tank.body.y + 8, 'rightSquirt');
			squirt.anchor.setTo(0.5, 0.5);	
			squirt.animations.add('squirt');
			squirt.animations.getAnimation('squirt').killOnComplete = true;
			squirt.animations.play('squirt', 20, false); 
		}
		else if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
		{
			// moving right so add squirt to left
			console.log('squirting left');
			squirt = this.game.add.sprite(this.tank.body.x - 16, this.tank.body.y + 8, 'leftSquirt');
			squirt.anchor.setTo(0.5, 0.5);	
			squirt.animations.add('squirt');
			squirt.animations.getAnimation('squirt').killOnComplete = true;
			squirt.animations.play('squirt', 20, false); 
			
		}
		else
		{
			// up squirt
			console.log('squirting up');
			squirt = this.game.add.sprite(this.tank.body.x + 8, this.tank.body.y - 12, 'upSquirt');
			squirt.anchor.setTo(0.5, 0.5);	
			squirt.animations.add('squirt');
			squirt.animations.getAnimation('squirt').killOnComplete = true;
			squirt.animations.play('squirt', 20, false); 
		}
		
	
/* 		squirt = this.game.add.sprite(this.tank.body.x + 24, this.tank.body.y + 8, 'rightSquirt');
		squirt.anchor.setTo(0.5, 0.5);
		
		squirt.animations.add('squirt');
		squirt.animations.getAnimation('squirt').killOnComplete = true;
		squirt.animations.play('squirt', 20, false); */
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
	
		if(this.tank.body.y > 20)
		{
			var boost = Math.floor((maxVelocity - minVelocity)* Math.random()) + minVelocity;
			this.tank.body.velocity.y -= boost;
		}
	},
	
	moveDown: function() {
		if(this.tank.body.y < 120)
		{
			var boost = Math.floor((maxVelocity - minVelocity)* Math.random()) + minVelocity;
			this.tank.body.velocity.y += boost;
		}
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
		this.score += 1;
		this.label_Score.content = this.score;
		
		var hole = Math.floor(Math.random() * 7) +1;
		
		for (var i = 0; i < 8; i++)
			if (i != hole && i != hole +1)
				this.add_one_block(i*20, screenH);
				console.log("adding block to " + i * 20 + ", " + 0);
	},
	
	game_title: function() {
		this.music1.stop();
		this.game.time.events.remove(this.timer);
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
		// Start the main state
		this.game.state.start('main');
	
	},
	
	
};


// Add and start the 'main' state to start the game
game.state.add('title', title_state);
game.state.add('main', main_state);  
game.state.start('title'); 