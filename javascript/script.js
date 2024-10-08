// Game Configuration
var config = {
	type: Phaser.AUTO, //Automatically uses WebGL or Canvas based on browser support
	width: 800, //Game width
	height: 600, //Game height
	physics: {
		default: 'arcade', //Use arcade physics
		arcade: {
			debug: false,
			fps: 60, //Show physics debugging info
			gravity: {y: 0} //No gravity (2D top-down)
		}
	},
	scene: {
		preload: preload, //Load assets
		create: create, //Initialize game objects
		update: update //Game loop
	}
};

//Create the Phaser Game instance
var game = new Phaser.Game(config)

var ball;
var playerPaddle;
var aiPaddle;
var cursors;
var playerScoreText;
var aiScoreText;
var playerScore = 0;
var aiScore = 0;

//Preload function to load game assets (sounds or images)
function preload(){
}

//Create function to initialize the game
function create(){
	
	//Add paddles (rectangles)
	playerPaddle = this.add.rectangle(50, config.height / 2, 20, 100, 0xffffff);
	aiPaddle = this.add.rectangle(750, config.height / 2, 20, 100, 0xffffff);
	
	//Enable physics for paddles
	this.physics.add.existing(playerPaddle, false); //true makes it static (non-movable)
	this.physics.add.existing(aiPaddle, false);
	
	//Create ball
	ball = this.add.circle(config.width / 2, config.height / 2, 10, 0xffffff)
	this.physics.add.existing(ball); //Makes ball a physics object
	
	//Give ball an initial velocity
	ball.body.setVelocity(200, 200);
	ball.body.setBounce(1, 1); //Ball bounces off surfaces
	ball.body.setCollideWorldBounds(true, 1, 1); //Ball bounces off walls
	
	//Allow the ball to collide with paddles
	this.physics.add.collider(ball, playerPaddle, null, null, this);
	this.physics.add.collider(ball, aiPaddle, null, null, this);
	
	//Enable cursor keys for player movement
	cursors = this.input.keyboard.createCursorKeys();
	
	//Create score display
	playerScoreText = this.add.text(320, 20, 'Player: 0', { fontSize: '32px', fill: '#fff' });
	aiScoreText = this.add.text(430, 20, 'AI: 0', {fontSize: '32px', fill: '#fff'});
	
	//Make paddles immovable
	playerPaddle.body.immovable = true;
	aiPaddle.body.immovable = true;
}

//Update function for game logic
function update() {
	//Move player paddle with up/down keys
	if (cursors.up.isDown) {
		playerPaddle.body.setVelocityY(-200);
	}
	else if (cursors.down.isDown) {
		playerPaddle.body.setVelocityY(200);
	}
	else {
		playerPaddle.body.setVelocityY(0);
	}
	
	if (cursors.right.isDown) {
		playerPaddle.body.setVelocityX(200);
	}
	else {
		playerPaddle.body.setVelocityX(0);
	}
	
	//Restrict player paddle movement to within game bounds
	playerPaddle.y = Phaser.Math.Clamp(playerPaddle.y, playerPaddle.height / 2, config.height - playerPaddle.height / 2);
	
	//Simple AI: Move the AI paddle towards the ball
	if (ball.y + 10 > aiPaddle.y + aiPaddle.height / 2) {
		aiPaddle.body.setVelocityY(200);
	}
	else if (ball.y - 10 < aiPaddle.y - aiPaddle.height / 2) {
		aiPaddle.body.setVelocityY(-200);
	}
	else {
		aiPaddle.body.setVelocityY(0);
	}
	
	//Ensures AI paddle to stay within bounds
	aiPaddle.y = Phaser.Math.Clamp(aiPaddle.y, aiPaddle.height / 2, config.height - aiPaddle.height / 2);
	
	//Check if ball goes off left or right side to score points
	if (ball.x <= 0 + 10) {
		resetBall();
		aiScore++;
		aiScoreText.setText('AI: ' + aiScore);
	}
	else if (ball.x >= config.width - 10) {
		resetBall();
		playerScore++;
		playerScoreText.setText('Player: ' + playerScore);
	}
}

//Reset ball position and velocity
function resetBall() {
	ball.setPosition(config.width / 2, config.height / 2);
	ball.body.setVelocity(200 * Phaser.Math.Between(-1, 1), 200 * Phaser.Math.Between(-1, 1)); //Random direction
}
