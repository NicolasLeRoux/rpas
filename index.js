const WebSocketClient = require('websocket').client;

var ws = new WebSocketClient();

ws.on('connect', function(connection) {
	connection.send(JSON.stringify({
		type: 'DRONE'
	}));
});

ws.connect('ws://localhost:3000/', 'echo-protocol');
