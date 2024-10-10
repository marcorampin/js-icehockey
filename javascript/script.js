//Find a way to make the text centered (scores)

//Screen size
let winWidth = window.innerWidth * 0.9;
let winHeight = window.innerHeight * 0.9;

var ball;
var player;
var opponent;
var cursors;
var playerScoreText;
var opponentScoreText;
var playerScore = 0;
var opponentScore = 0;
let init_vel = winWidth / 5;
const bounce_eff = 1.1;
let paddle_xside = winWidth / 15;
let paddle_width = 20;
let paddle_height = winHeight / 5;
var divisor;
const ball_radius = 10;
let keyW;
let keyD;
let keyS;
let keyA;
let keyM;
let multiplayer = true;
let boxUpper = winHeight / 2 - winHeight / 6;
let boxLower = winHeight / 2 + winHeight / 6;

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
	this.paddle = scene.add.rectangle(this.pos_x, this.pos_y, this.width, this.height, this.color);
	}
}

class Player {
	constructor(pos_x, pos_y, radius, color){
		this.pos_x = pos_x;
		this.pos_y = pos_y;
		this.radius = radius;
		this.color = color;
	}
	
	set_physics(scene) {
		this.paddle = scene.add.circle(this.pos_x, this.pos_y, this.radius, this.color);
		scene.physics.add.existing(this.paddle);
		this.paddle.body.setCircle(this.radius); // Set the shape to a circle
		this.paddle.body.setBounce(bounce_eff, bounce_eff);
		this.paddle.body.setCollideWorldBounds(true, 1, 1);
		this.paddle.body.immovable = true;
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
		this.ball = scene.add.circle(this.pos_x, this.pos_y, this.radius, this.color);
		scene.physics.add.existing(this.ball);
		this.ball.body.setBounce(bounce_eff, bounce_eff); //X and Y bounce efficiency
		this.ball.body.setCollideWorldBounds(true, 1, 1); //Ball bounces of walls
		this.ball.body.maxSpeed = this.pos_x * 4;
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

function goalBoxesCreation(x_init, x_fin, scene) {
	verticalLine = new Paddle(x_init, winHeight / 2, 5, boxLower - boxUpper, 0xffffff);
	upperHorLine = new Paddle((Math.max(x_init, x_fin) + Math.min(x_fin, x_init)) / 2, boxUpper, Math.abs(x_init - x_fin), 5, 0xffffff);
	lowerHorLine = new Paddle((Math.max(x_init, x_fin) + Math.min(x_fin, x_init)) / 2, boxLower, Math.abs(x_init - x_fin), 5, 0xffffff);
	verticalLine.set_physics(scene);
	upperHorLine.set_physics(scene);
	lowerHorLine.set_physics(scene);
}


//Preload function to load game assets (sounds or images)
function preload(){
}

//Create function to initialize the game
function create(){	
	//Add paddles (rectangles)
	player = new Player(paddle_xside, winHeight / 2, winHeight / 20, 0xffffff);
	player.set_physics(this);
	opponent = new Player(winWidth - paddle_xside, winHeight / 2, winHeight / 20, 0xffffff);
	opponent.set_physics(this);
	
	//Create ball
	sphere = new Ball(winWidth / 2, winHeight / 2, ball_radius, 0xffffff);
	sphere.set_physics(this); //Makes ball a physics object
	
	//Add division in the middle of the field
	divisor = new Paddle(winWidth / 2, winHeight / 2, 5, winHeight, 0xffffff);
	divisor.set_physics(this);
	
	//Add goalbox
	playerGoalBox = goalBoxesCreation(winWidth * 0.1, 0, this);
	opponentGoalBox = goalBoxesCreation(winWidth * 0.9, winWidth, this);
	
	//Give ball an initial velocity
	sphere.setVelocity();
	
	//Allow the ball to collide with paddles
	this.physics.add.collider(sphere.ball, player.paddle, null, null, this);
	this.physics.add.collider(sphere.ball, opponent.paddle, null, null, this);
	
	//Enable cursor keys for player movement
	cursors = this.input.keyboard.createCursorKeys();
	keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
	keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
	keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
	keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
	keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
	
	//Create score display
	playerScoreText = this.add.text(winWidth * 0.20, 20, 'Player: 0', { fontSize: '30px', fill: '#fff' });
	opponentScoreText = this.add.text(winWidth * 0.60, 20, 'Opponent: 0', {fontSize: '30px', fill: '#fff'});
}

//Update function for game logic
function update() {

	if (Phaser.Input.Keyboard.JustDown(keyM)) {
   	 multiplayer = !multiplayer; // Toggle multiplayer mode
	}
	
	//Move player paddle with up/down keys
	if (keyW.isDown) {
		player.moveUp();
	}
	else if (keyS.isDown) {
		player.moveDown();
	}
	else {
		player.stop('y');
	}
	
	if (keyD.isDown) {
		player.moveRight();
	}
	else if (keyA.isDown) {
		player.moveLeft();
	}
	else {
		player.stop('x');
	}
	
	if (multiplayer) {
		if (cursors.up.isDown) {
			opponent.moveUp();
		}
		else if (cursors.down.isDown) {
			opponent.moveDown();
		}
		else {
			opponent.stop('y');
		}
	
		if (cursors.right.isDown) {
			opponent.moveRight();
		}
		else if (cursors.left.isDown) {
			opponent.moveLeft();
		}
		else {
			opponent.stop('x');
		}
	}
	else {
		//Simple AI: Move the AI paddle towards the ball
		if ((sphere.ball.y > opponent.paddle.y + opponent.radius / 2) && (sphere.ball.y > boxUpper - opponent.radius) && (sphere.ball.y < boxLower + opponent.radius)) {
			opponent.moveDown();
		}
		else if ((sphere.ball.y < opponent.paddle.y - opponent.radius / 2) && (sphere.ball.y < boxLower + opponent.radius) && (sphere.ball.y > boxUpper - opponent.radius)) {
			opponent.moveUp();
		}
		else {
			opponent.stop('y');
		}
		
		if (sphere.ball.body.velocity.x > init_vel) {
			sphere.ball.body.setDragX(170);
		}
		else {
			sphere.ball.body.setDragX(0);
		}
	}
	
	
	//Adds bounds for paddles to not go over the middle field
	player.paddle.x = Phaser.Math.Clamp(player.paddle.x, 0, winWidth / 2 - player.radius);
	opponent.paddle.x = Phaser.Math.Clamp(opponent.paddle.x, winWidth / 2 + opponent.radius, winWidth);	
	
	//Check if ball goes off left or right side to score points
	if ((sphere.ball.x <= 0 + ball_radius * 2) && (sphere.ball.y > winHeight / 2 - winHeight / 6) && (sphere.ball.y < winHeight / 2 + winHeight / 6)) {
		sphere.resetBall();
		opponentScore++;
		opponentScoreText.setText('Opponent: ' + opponentScore);
	}
	else if ((sphere.ball.x >= winWidth - (ball_radius * 2)) && (sphere.ball.y > winHeight / 2 - winHeight / 6) && (sphere.ball.y < winHeight / 2 + winHeight / 6)) {
		sphere.resetBall();
		playerScore++;
		playerScoreText.setText('Player: ' + playerScore);
	}
}

//Function to get window size
function updateWindowSize() {
    location.reload();
}

window.addEventListener('resize', updateWindowSize);
