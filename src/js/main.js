var WIDTH = 50;
var HEIGHT = 50;
var squareSize = 10;

var stage = new PIXI.Stage(0x666666, true);

stage.interactive = true;
stage.buttonMode = true;
stage.defaultCursor = 'none';

// create a renderer instance
var renderer = PIXI.autoDetectRenderer(WIDTH * squareSize, HEIGHT * squareSize);

// add the renderer view element to the DOM
document.getElementById('stage').appendChild(renderer.view);

// create a texture from an image path
var bunnyTexture = PIXI.Texture.fromImage("img/bunny.png");
var squareTexture = PIXI.Texture.fromImage("img/square-black.png");
var scopeTexture = PIXI.Texture.fromImage("img/scope.png");

// Inititalize matrix of empty squares
var matrix = [];
for (var row = 0; row < HEIGHT; row++) {
	matrix[row] = [];
	for (var col = 0; col < WIDTH; col++) {
		matrix[row][col] = 0;
	};
};

// Randomly filled squares
for (var row = 1; row < HEIGHT - 1; row++) {
	for (var col = 1; col < WIDTH - 1; col++) {
		matrix[row][col] = (Math.random() > 0.7) ? 1 : 0;
	};
};

var grid = new PF.Grid(WIDTH, HEIGHT, matrix);
var finder = new PF.AStarFinder({allowDiagonal: false});

function placeSquare(x, y)
{
	// create our little square friend..
	var square = new PIXI.Sprite(squareTexture);

	// center the squares anchor point
	square.anchor.x = 0.5;
	square.anchor.y = 0.5;

	// move the sprite to its designated position
	square.position.x = x * squareSize + squareSize / 2;
	square.position.y = y * squareSize + squareSize / 2;

	// add it to the stage
	stage.addChild(square);
}

function createBunny(x, y)
{
	// create our little bunny friend..
	var bunny = new PIXI.Sprite(bunnyTexture);

	// center the bunnys anchor point
	bunny.anchor.x = 0.5;
	bunny.anchor.y = 0.5;

	// move the sprite to its designated position
	bunny.position.x = x * squareSize + squareSize / 2;
	bunny.position.y = y * squareSize + squareSize / 2;

	// bunny.scale.x = bunny.scale.y = 0.25;

	// add it to the stage
	stage.addChild(bunny);

	// Setup how our bunny moves between points
	bunny.animation = {};
	bunny.animation.startX = bunny.position.x;
	bunny.animation.startY = bunny.position.y;
	bunny.animation.endX = bunny.position.x;
	bunny.animation.endY = bunny.position.y;
	bunny.animation.startTime = 0;
	bunny.animation.duration = 0;

	bunny.animate = function(now) {
		if (bunny.animation.duration > 0) {
			var t = (now - bunny.animation.startTime) / bunny.animation.duration;
			if (t > 0) {
				var x = bunny.animation.startX + t * (bunny.animation.endX - bunny.animation.startX);
				var y = bunny.animation.startY + t * (bunny.animation.endY - bunny.animation.startY);
				bunny.position.x = x;
				bunny.position.y = y;
			} else {
				bunny.position.x = bunny.animation.endX;
				bunny.position.y = bunny.animation.endY;
			}			
		}
	}

	// Set up path finding and main movements between nodes
	bunny.path = finder.findPath(x, y, 49, y, grid.clone());
	bunny.progress = 0;

	bunny.NextAction = 0
	bunny.move = function(now) {
		if (now > bunny.NextAction) {
			bunny.NextAction = now + 250;
			bunny.progress++;
			var coords = bunny.path[bunny.progress];
			if (coords) {
				bunny.animation.startX = bunny.position.x;
				bunny.animation.startY = bunny.position.y;
				bunny.animation.endX = coords[0] * squareSize + squareSize / 2;
				bunny.animation.endY = coords[1] * squareSize + squareSize / 2;
				bunny.animation.startTime = now;
				bunny.animation.duration = 250;
			} else {
				bunny.animation.duration = 0;
			}			
		}
	}

	bunny.testClick = function(x, y, radius) {
		var dist = Math.sqrt(Math.pow(Math.abs(x - bunny.position.x), 2) + Math.pow(Math.abs(y - bunny.position.y), 2));
		if (dist <= radius) {
			bunny.remove();
		}
	}

	bunny.remove = function() {
		stage.removeChild(bunny);
		var index = bunnies.indexOf(bunny);
		delete bunnies[index];
	}

	return bunny;
}

// Instantiate our bunnies
var bunnies = [];
for (var i = 0; i < 50; i++) {
	bunnies[i] = createBunny(0, i);
};

// Draw our terrain to the map
for (var row = 0; row < HEIGHT; row++) {
	for (var col = 0; col < WIDTH; col++) {
		if (matrix[row][col] === 1) {
			placeSquare(col, row);
		}
	};
};

// Remove bunnies on click
stage.mousedown = stage.touchstart = function(data)
{
	data.originalEvent.preventDefault();
	var clickOrigin = data.getLocalPosition(stage);

	bunnies.forEach(function(bunny){
		bunny.testClick(clickOrigin.x, clickOrigin.y, 11);
	});
};

var scope = new PIXI.Sprite(scopeTexture);
scope.anchor.x = 0.5;
scope.anchor.y = 0.5;

stage.mousemove = stage.touchmove = function(data) {
	var newPosition = data.getLocalPosition(stage);
	scope.position.x = newPosition.x;
	scope.position.y = newPosition.y;
}
stage.addChild(scope);

// Our primary loop
function draw() {
	requestAnimationFrame(draw);
	var now = new Date().getTime();

	bunnies.forEach(function(bunny){
		bunny.animate(now);
		bunny.move(now);
	});

	renderer.render(stage);
}

// Kick the whole thing off
requestAnimFrame(draw);