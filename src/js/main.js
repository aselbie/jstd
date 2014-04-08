var stage = new PIXI.Stage(0xFFFFFF, true);
var renderer = PIXI.autoDetectRenderer(1000, 1000);

function setIntervalWithContext(code,delay,context){
	return setInterval(function(){
		code.call(context)
	},delay) 
}

var queue = {
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
				queue.removeEvent(value.id);
			}
		});
	},

	startQueue: function() {
		this.interval = setIntervalWithContext(this.processQueue, 33, this);
	},

	pauseQueue: function() {
		clearInterval(this.interval);
	},

	init: function() {
		this.startQueue();
	},
};
queue.init();

var grid = {
	element: document.getElementById('grid'),
	movers: [],
	moverCounter: 0,
	width: 50,
	height: 50,

	drawGrid: function() {
		for (var i = this.width * this.height; i > 0; i--) {
			var cell = document.createElement('div');
			cell.className = 'cell';
			this.element.appendChild(cell);
		};
	},

	init: function() {
		this.element.appendChild(renderer.view);

		requestAnimFrame( animate );

		var square = new PIXI.Graphics();
		stage.addChild(square);
		square.beginFill(0x000000);
		square.drawRect(0,0,100,100);
		square.endFill();
		square.lineWidth = 1;
		square.lineColor = 'red';

		square.interactive = true;

		console.log(square);

		// stage.addChild(rect);

		function animate() {

			requestAnimFrame( animate );

			// just for fun, lets rotate mr rabbit a little
			// bunny.rotation += 0.1;

			// render the stage   
			renderer.render(stage);
		}
	},

	addMover: function() {
		var id = this.moverCounter;
		this.moverCounter++;

		this.movers[id] = {
			id: id,
			element: document.createElement('div'),
			x: 0,
			y: 0,

			automate: function() {
				this.randomMove();
				queue.addEvent(this.automate, 500, this);
			},

			randomMove: function() {
				var deltaX = Math.round(Math.random() * 2) - 1;
				var deltaY = Math.round(Math.random()* 2) - 1;
				if ((deltaX + this.x) < 0) { deltaX = 0; };
				if ((deltaX + this.x) >= grid.width) { deltaX = 0; };
				if ((deltaY + this.y) < 0) { deltaY = 0; };
				if ((deltaY + this.y) >= grid.width) { deltaY = 0; };

				this.move(deltaX,deltaY);
			},

			randomPosition: function() {
				var initialX = Math.round(Math.random() * grid.width);
				var initialY = Math.round(Math.random() * grid.height);
				this.move(initialX,initialY);
			},

			move: function(deltaX, deltaY) {
				this.x += deltaX;
				this.y += deltaY;
				this.element.style.left = this.x * (100 / grid.width) + '%';
				this.element.style.top = this.y * (100 / grid.height) + '%';		
			},

			init: function() {
				this.element.className = 'mover';
				grid.element.appendChild(this.element);
				this.randomPosition();
				this.automate();
			}

		};
		grid.movers[id].init();
		
	}

};
grid.init();
