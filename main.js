var http = require('http');
var sockjs = require('sockjs');
var node_static = require('node-static');

// 1. Echo sockjs server
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};

var sockjs_echo = sockjs.createServer(sockjs_opts);

var connections = [];
sockjs_echo.on('connection', function(conn) {
	connections.push(conn);
    conn.on('data', function(message) {
    	for (var i = 0; i < connections.length; i++) {
    		connections[i].write(message);
    	};
    });
	conn.on('close', function() {
		connections.splice(connections.indexOf(conn), 1);
	});
});

// 2. Static files server
var static_directory = new node_static.Server(__dirname + '/public');

// 3. Usual http stuff
var server = http.createServer();
server.addListener('request', function(req, res) {
    static_directory.serve(req, res);
});
server.addListener('upgrade', function(req,res){
    res.end();
});

sockjs_echo.installHandlers(server, {prefix:'/echo'});

console.log(' [*] Listening on 127.0.0.1:8080' );
server.listen(8080, '127.0.0.1');