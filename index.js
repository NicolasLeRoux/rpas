const WebSocketClient = require('websocket').client,
	wrtc = require('wrtc'),
	fs = require('fs'),
	amqp = require('amqplib/callback_api')
	MotorHat = require('motor-hat');

let isOpencvEnabled,
	opencv,
	motorSpec = {
		address: 0X60,
		dcs: [
			'M1',
			'M2'
		]
	},
	motorHat = MotorHat(motorSpec),
	oldDir;

motorHat.init();

let motor01 = motorHat.dcs[0],
	motor02 = motorHat.dcs[1];

// Load opencv
try {
	isOpencvEnable = true;
	opencv = require('opencv');
} catch (err) {
	isOpencvEnable = false;
	console.error('[Error] OpenCV not installed.', err);
}

let ws = new WebSocketClient(),
	wsUrl,
	peerCo,
	videoChannel,
	messageBrokerChannel,
	videoStream = isOpencvEnabled ? new opencv.VideoStream(0) : undefined,
	videoChannels = [],
	isVideoStreamOn = false;

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

if (isOpencvEnabled) {
	videoStream.video.setWidth(430);
	videoStream.video.setHeight(320);
}

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

				videoChannels.push(videoChannel);
				startVideoStream();
			};
			videoChannel.onclose = function () {
				console.info('Video channel closed.');

				videoChannels.splice(videoChannels.indexOf(videoChannel), 1);
			};

			peerCo.ondatachannel = function (event) {
				console.info('Serveur get data channel', event);

				var channel = event.channel;

				channel.onmessage = function (e) {
					console.info('Command channel on message: ', e.data);
					//sendToBroker(e.data);
					commandMotors(JSON.parse(e.data));
				};
				channel.onopen = function () {
					console.info('Command channel on open');
				};
				channel.onclose = function () {
					console.info('Command channel on close');

					stopMotors();
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
	if (!err) {
		conn.createChannel(function (err, ch) {
			messageBrokerChannel = ch;

			ch.assertQueue('pantilthat', {
				durable: false
			});
		});
	} else {
		console.error('[Error] Message broker connection refused.', err);
	}
});

function sendToBroker (obj) {
	if (messageBrokerChannel) {
		messageBrokerChannel.sendToQueue('pantilthat', new Buffer(obj));
	} else {
		console.warn('[Warning] No message broker.');
	}
}

/**
 * Method to command the motor.
 * @param obj A nipple event with the following signature:
 *
 * ```json
 * {
 *     "type": "COMMAND",
 *     "direction": {
 *         "angle":{
 *             "radian": 1.0071326018005804,
 *             "degree": 57.70444749320299
 *         },
 *         "direction": {
 *             "x": "right",
 *             "y": "up",
 *             "angle": "up"
 *         },
 *         "force": 1.0105470320351637
 *     }
 * }
 * ```
 */
function commandMotors (obj) {
	if (!obj.direction.direction) return;

	let direction = obj.direction.direction.y,
		rotation = obj.direction.direction.x,
		force = Math.min(1, obj.direction.force),
		radian = obj.direction.angle.radian,
		motor01Speed,
		motor02Speed;

	if (direction !== oldDir) {
		let dir = direction === 'up' ? 'fwd': 'back';
		motor01.run(dir, (err, res) => {});
		motor01.run(dir, (err, res) => {});
	}

	if (direction === 'up' && rotation === 'right') {
		motor01Speed = force;
		motor02Speed = force * (1 - Math.cos(radian));
	} else if (direction === 'up' && rotation === 'left') {
		motor01Speed = force  * (1 - Math.cos(Math.PI - radian));
		motor02Speed = force;
	} else if (direction === 'down' && rotation === 'right') {
		motor01Speed = force;
		motor02Speed = force  * (1 - Math.cos(2*Math.PI - radian));
	} else if (direction === 'down' && rotation === 'left') {
		motor01Speed = force * (1 - Math.cos(radian - Math.PI));
		motor02Speed = force;
	}

	console.log('Set speed at:', motor01Speed, motor02Speed);

	motor01.setSpeed(motor01Speed, (err, res) => {});
	motor02.setSpeed(motor02Speed, (err, res) => {});

	oldDir = direction;
}

function stopMotors () {
	motor01.stop((err, res) => {
		// TODO
	});
	motor02.stop((err, res) => {
		// TODO
	});
}

function startVideoStream () {
	if (!isVideoStreamOn && isOpencvEnabled) {
		videoStream.on('data', function (matrix) {
			// Ici, trop de data en une seul fois...
			// https://github.com/js-platform/node-webrtc/issues/156
			// Le Buffer est une class node !!!
			var str = matrix.toBuffer({
					ext: '.jpg',
					jpegQuality: 50
				}).toString('base64');

			//console.log('Taille de la chaine: ', str.length);
			videoChannels.forEach((channel) => {
				channel.send(str.slice(0, 50000));
			});
		});

		isVideoStreamOn = true;
		videoStream.read();
	} else {
		fs.readFile('img/Under-construction.jpg', function(err, data) {
			if (err) throw err;
			var str = data.toString('base64');
			videoChannel.send(str.slice(0, 50000))
		});
	}
}

ws.connect(wsUrl, 'echo-protocol');
