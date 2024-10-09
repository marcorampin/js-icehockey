//Need to make a class for field lines (only rectangles across the field)
//Maybe include a multiplayer (wasd vs arrows)
//Find a way to make the text centered (scores)
//Find if it's possible to use two circles and simulate the collision with them instead of paddles
//Update the canva size when the window is resized (from old project, maybe Haiku or quote generator)
//Check if other variables are needed

//Screen size
const winWidth = window.innerWidth * 0.9;
const winHeight = window.innerHeight * 0.9;

// Game Configuration
var config = {
	type: Phaser.AUTO, //Automatically uses WebGL or Canvas based on browser support
	width: winWidth, //Game width
	height: winHeight, //Game height
	physics: {
		default: 'arcade', //Use arcade physics
		arcade: {
			debug: false,
			fps: 120, //Show physics debugging info
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


const width_canva = winWidth;
const height_canva = winHeight;
var ball;
var player;
var opponent;
var cursors;
var playerScoreText;
var opponentScoreText;
var playerScore = 0;
var opponentScore = 0;
const init_vel = width_canva / 5;
const bounce_eff = 1.1;
const paddle_xside = width_canva / 15;
const paddle_width = 20;
const paddle_height = height_canva / 5;
var divisor;
const ball_radius = 10;

class Paddle {
	//gives the selected characteristics
	constructor(pos_x, pos_y, width, height, color) {
	this.pos_x = pos_x;
	this.pos_y = pos_y;
	this.width = width;
	this.height = height;
	this.color = color;
	}
	
	//enable physics for paddles
	set_physics(scene) {
	this.paddle = scene.add.rectangle(this.pos_x, this.pos_y, this.width, this.height, this.color)
	scene.physics.add.existing(this.paddle, false);
	 this.paddle.body.immovable = true;
	 this.paddle.body.setCollideWorldBounds(true, 1, 1); //Restricts paddles within game bounds
	}
	
	//decide movements
	moveUp() {
		this.paddle.body.setVelocityY(-init_vel * 1.5);
	}
	
	moveDown() {
		this.paddle.body.setVelocityY(init_vel * 1.5);
	}
	
	stop(axis) {
	if (axis == 'y') {
		this.paddle.body.setVelocityY(0);
		}
	else if (axis == 'x') {
			this.paddle.body.setVelocityX(0);
		}
	}
	
	moveRight() {
		this.paddle.body.setVelocityX(init_vel * 1.5);
	}
	
	moveLeft() {
		this.paddle.body.setVelocityX(-init_vel * 1.5);
	}
}

class Ball {	
	constructor(pos_x, pos_y, radius, color) {
		this.pos_x = pos_x;
		this.pos_y = pos_y;
		this.radius = radius;
		this.color = color;
	}
	
	set_physics(scene) {
	this.ball = scene.add.circle(this.pos_x, this.pos_y, this.radius, this.color)
	scene.physics.add.existing(this.ball);
	this.ball.body.setBounce(bounce_eff, bounce_eff); //X and Y bounce efficiency
	this.ball.body.setCollideWorldBounds(true, 1, 1); //Ball bounces of walls
	}
	
	randomNum() {
		let num = Math.random();
		if (num > 0.5) {
			return num * 0.5 + 0.5;
		}
		else {
			return num * -0.5 - 0.5;
		}
	}
	
	setVelocity() {
		let x_vel = this.randomNum();
		let y_vel = this.randomNum();
		this.ball.body.setVelocity(init_vel * x_vel, init_vel * y_vel); //Random direction
	}
	
	//Resets ball position and velocity after scoring
	resetBall() {
	this.ball.setPosition(this.pos_x, this.pos_y);
	this.setVelocity()
	}
}

//Preload function to load game assets (sounds or images)
function preload(){
}

//Create function to initialize the game
function create(){	
	//Add paddles (rectangles)
	player = new Paddle(paddle_xside, height_canva / 2, paddle_width, paddle_height, 0xffffff);
	player.set_physics(this);
	opponent = new Paddle(width_canva - paddle_xside, height_canva / 2, paddle_width, paddle_height, 0xffffff);
	opponent.set_physics(this);
	
	//Create ball
	sphere = new Ball(width_canva / 2, height_canva / 2, ball_radius, 0xffffff)
	sphere.set_physics(this); //Makes ball a physics object
	
	//Add division in the middle of the field
	divisor = new Paddle(width_canva / 2, height_canva / 2, 5, height_canva, 0xffffff)
	divisor.set_physics(this);
	
	//Give ball an initial velocity
	sphere.setVelocity();
	
	//Allow the ball to collide with paddles
	this.physics.add.collider(sphere.ball, player.paddle, null, null, this);
	this.physics.add.collider(sphere.ball, opponent.paddle, null, null, this);
	
	//Enable cursor keys for player movement
	cursors = this.input.keyboard.createCursorKeys();
	
	//Create score display
	playerScoreText = this.add.text(width_canva * 0.20, 20, 'Player: 0', { fontSize: '30px', fill: '#fff' });
	opponentScoreText = this.add.text(width_canva * 0.60, 20, 'Opponent: 0', {fontSize: '30px', fill: '#fff'});
}

//Update function for game logic
function update() {
	//Move player paddle with up/down keys
	if (cursors.up.isDown) {
		player.moveUp();
	}
	else if (cursors.down.isDown) {
		player.moveDown();
	}
	else {
		player.stop('y');
	}
	
	if (cursors.right.isDown) {
		player.moveRight();
	}
	else if (cursors.left.isDown) {
		player.moveLeft();
	}
	else {
		player.stop('x');
	}
	//Simple AI: Move the AI paddle towards the ball
	if (sphere.ball.y + ball_radius > opponent.paddle.y + opponent.height / 4) {
		opponent.moveDown();
	}
	else if (sphere.ball.y - ball_radius < opponent.paddle.y - opponent.height / 4) {
		opponent.moveUp();
	}
	else {
		opponent.stop('y');
	}
	
	//Adds bounds to the divisor
	player.paddle.x = Phaser.Math.Clamp(player.paddle.x, player.width / 2, width_canva / 2 - player.width / 2);
	opponent.paddle.x = Phaser.Math.Clamp(opponent.paddle.x, width_canva / 2 + opponent.width / 2, width_canva - opponent.width / 2);	
	
	//Check if ball goes off left or right side to score points
	if (sphere.ball.x <= 0 + ball_radius * 2) {
		sphere.resetBall();
		opponentScore++;
		opponentScoreText.setText('Opponent: ' + opponentScore);
	}
	else if (sphere.ball.x >= width_canva - (ball_radius * 2)) {
		sphere.resetBall();
		playerScore++;
		playerScoreText.setText('Player: ' + playerScore);
	}
}
