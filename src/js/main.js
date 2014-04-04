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

	removeEvent: function() {
		return;
	},

	processQueue: function() {
		var timestamp = Date.now();
		_.each(this.events, function(value, key, list) {
			if(value.timestamp <= timestamp) {
				value.e.apply(value.context);
				delete queue.events[value.id];
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
		this.drawGrid();
		this.addMover();
		this.addMover();
		this.addMover();
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
