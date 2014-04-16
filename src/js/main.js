function setIntervalWithContext(code,delay,context){
	return setInterval(function(){
		code.call(context)
	},delay) 
}

var bunny = PIXI.Texture.fromImage("bunny.png");
var game = {};

game.WIDTH = 1000;
game.HEIGHT = 1000;
game.stage = new PIXI.Stage(0xEFEFEF, true);
game.renderer = PIXI.autoDetectRenderer(game.WIDTH, game.HEIGHT);

game.actionQueue = {
	events: {},
	interval: null,
	eventCounter: 0,

	addEvent: function(e, delay, context) {
		var id = this.eventCounter;
		this.eventCounter++;

		this.events[id] = {
			id: id,
			timestamp: Date.now() + delay,
			e: e,
			context: context
		};
	},

	removeEvent: function(id) {
		delete this.events[id];
	},

	processQueue: function() {
		var timestamp = Date.now();
		_.each(this.events, function(value, key, list) {
			if(value.timestamp <= timestamp) {
				value.e.apply(value.context);
				game.actionQueue.removeEvent(value.id);
			}
		});
	},

	startQueue: function() {
		this.interval = setIntervalWithContext(this.processQueue, 100, this);
	},

	pauseQueue: function() {
		clearInterval(this.interval);
	},

	init: function() {
		this.startQueue();
	},
};
game.actionQueue.init();

game.animationQueue = {
	events: [],
	lastFrameTS: Date.now(),
	play: true,

	addEvent: function(event, params, context) {
		var eventArray = [];
		eventArray['event'] = event;
		eventArray['params'] = params;
		eventArray['context'] = context;
		this.events.push(eventArray);
	},

	removeEvent: function(id) {
		delete this.events[id];
	},

	processQueue: function() {
		var thisFrameTS = Date.now();
		var timeDelta = thisFrameTS - game.animationQueue.lastFrameTS;
		game.animationQueue.lastFrameTS = thisFrameTS;

		var animate = game.animationQueue.events.shift();
		if (animate) {
			animate['params']['timeDelta'] = timeDelta;
			animate['event'].call(animate['context'], animate['params']);
		};

		if (game.animationQueue.play) {
			requestAnimFrame(game.animationQueue.processQueue);
		}
		
		game.renderer.render(game.stage);
	},

	start: function() {
		this.play = true;
		requestAnimFrame(this.processQueue);
	},

	pause: function() {
		this.play = false;
	},

	init: function() {
		this.start();
	},
};
game.animationQueue.init();


game.grid = {
	element: document.getElementById('grid'),
	movers: [],
	moverCounter: 0,
	width: 50,
	height: 50,
	squareWidth: game.WIDTH / this.width,
	squareHeight: game.HEIGHT / this.height,

	init: function() {
		this.element.appendChild(game.renderer.view);
		this.addMover();
	},

	addMover: function() {
		var id = game.grid.moverCounter;
		this.moverCounter++;

		this.movers[id] = {
			id: id,
			sprite: new PIXI.Sprite(bunny),
			x: 0,
			y: 0,

			automateRandom: function() {
				this.randomMove();
				game.actionQueue.addEvent(this.automateRandom, 2000, this);
			},

			randomMove: function() {
				var x = Math.random() * 800 + 100;
				var y = Math.random() * 800 + 100;
				this.moveTo(x, y, 2000);
			},

			moveTo: function(x, y, speed) {
				var params = [];

				params['startX'] = this.x;
				params['endX'] = x;

				params['startY'] = this.y;
				params['endY'] = y;

				params['goalTime'] = Date.now() + speed;

				game.animationQueue.addEvent(this.animateSpriteTo, params, this);

				this.x = x;
				this.y = y;
			},

			animateSpriteTo: function(params) {
				var remainingTime = params['goalTime'] - Date.now();
				var xDistanceRemaining = params['endX'] - params['startX'];
				var yDistanceRemaining = params['endY'] - params['startY'];

				var framesToCompletion = Math.round(remainingTime / params['timeDelta']);
				var xDistancePerFrame = xDistanceRemaining / framesToCompletion;
				var yDistancePerFrame = yDistanceRemaining / framesToCompletion;

				if (framesToCompletion <= 1) {
					this.positionSprite(params['endX'], params['endY']);					
				} else {
					params['startX'] = params['startX'] + xDistancePerFrame;
					params['startY'] = params['startY'] + yDistancePerFrame;
					this.positionSprite(params['startX'], params['startY']);
					game.animationQueue.addEvent(this.animateSpriteTo, params, this);
				}

			},

			positionSprite: function(x, y) {
				this.sprite.position.x = x;
				this.sprite.position.y = y;
			},

			init: function() {
				this.sprite.anchor.x = 0.5;
				this.sprite.anchor.y = 0.5;
				this.positionSprite(200,200);
				this.automateRandom();
				this.sprite.setInteractive(true);
				game.stage.addChild(this.sprite);
			}

		};
		game.grid.movers[id].init();
	}

};
game.grid.init();