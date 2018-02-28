const WebSocketClient = require('websocket').client,
	wrtc = require('wrtc'),
	fs = require('fs'),
	amqp = require('amqplib/callback_api'),
	opencv = require('opencv');

let ws = new WebSocketClient(),
	wsUrl,
	peerCo,
	videoChannel,
	messageBrokerChannel;

// print process.argv
process.argv.forEach(function (val, index, array) {
	switch (val) {
		case '--url':
			wsUrl = array[index + 1];
			break;
		default:
			// Nothing...
	}
});

ws.on('connect', function(connec) {
	connec.on('message', function(message) {
		if (message.type === 'utf8') {
			let json = JSON.parse(message.utf8Data);

			processSocketMessage(json, connec);
		}
	});

	connec.send(JSON.stringify({
		type: 'DRONE',
		action: 'INIT_SOCKET',
		name: `Drone ${Math.random() * (new Date()).getDate()}`,
		geo: '48°52′51.118″N/2°16′1.032″E',
		status: 'Online'
	}));
});

const processSocketMessage = function (json, connec) {
	switch (json.action) {
		case 'INIT_PEER_CO':
			var remoteDescription = new wrtc.RTCSessionDescription(json.remoteDescription);
			peerCo = new wrtc.RTCPeerConnection();

			videoChannel = peerCo.createDataChannel('video', {
				// UPD Semantics
				ordered: false,
				maxRetransmits: 0
			});

			videoChannel.onopen = function () {
				console.info('Video channel opened.');

				/*fs.readFile('img/Sfeir.jpg', function(err, data) {
					if (err) throw err;
					var str = data.toString('base64');
					videoChannel.send(str.slice(0, 50000))
				});*/
				var videoStream = new opencv.VideoStream(0);

				/**
				 * J'obtient ici une image de 480*640 alors que je souhaite
				 * avoir une image de 568*320.
				 */
				videoStream.video.setWidth(430);
				videoStream.video.setHeight(320);
				videoStream.on('data', function (matrix) {
					// Ici, trop de data en une seul fois...
					// https://github.com/js-platform/node-webrtc/issues/156
					// Le Buffer est une class node !!!
					var str = matrix.toBuffer({
							ext: '.jpg',
							jpegQuality: 50
						}).toString('base64');

					//console.log('Taille de la chaine: ', str.length);
					videoChannel.send(str.slice(0, 50000));
				});

				videoStream.read();
			};
			videoChannel.onclose = function () {
				console.info('Video channel closed.');
			};

			peerCo.ondatachannel = function (event) {
				console.info('Serveur get data channel', event);

				var channel = event.channel;

				channel.onmessage = function (e) {
					console.info('Command channel on message: ', e.data);
					sendToBroker(e.data);
				};
				channel.onopen = function () {
					console.info('Command channel on open');
				};
				channel.onclose = function () {
					console.info('Command channel on close');
				};
			};

			peerCo.onicecandidate = function (event) {
				console.info('Client on ICE candidate', event);

				if (event.candidate) {
					connec.send(JSON.stringify(Object.assign(json, {
						type: 'DRONE',
						action: 'RTC_ICE_CANDIDATE',
						candidate: event.candidate
					})));
				}
			};

			peerCo.setRemoteDescription(remoteDescription)
				.then(function() {
					console.log('Create WebRTC answer.');
					return peerCo.createAnswer();
				}).then(answerDesc => {
					console.info('Set WebRTC desc from answer: ', answerDesc);
					return peerCo.setLocalDescription(answerDesc);
				}).then(() => {
					console.info('Set server remote desc from client answer');
					connec.send(JSON.stringify(Object.assign(json, {
						remoteDescription: peerCo.localDescription
					})));
				});

			break;
		case 'RTC_ICE_CANDIDATE':
			console.log('RTC_ICE_CANDIDATE');
			peerCo.addIceCandidate(json.candidate)
				.then(() => {
					console.info('Adding ICE candidate success ! Info: ', json.candidate);
				}).catch(error => {
					console.warn('ICE candidate error: ', error);
				});
			break;
		default:
			console.error('Undefined action... ', {
				action: json.action
			});
	}
};

amqp.connect('amqp://localhost', function (err, conn) {
	conn.createChannel(function (err, ch) {
		messageBrokerChannel = ch;

		ch.assertQueue('pantilthat', {
			durable: false
		});
	});
});

function sendToBroker (obj) {
	messageBrokerChannel.sendToQueue('pantilthat', new Buffer(obj));
}

ws.connect(wsUrl, 'echo-protocol');
