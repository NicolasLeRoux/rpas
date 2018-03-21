const WebSocketClient = require('websocket').client,
	wrtc = require('wrtc'),
	fs = require('fs'),
	amqp = require('amqplib/callback_api');

let isOpencvEnabled,
    opencv;

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
        fs.readFile('img/Sfeir.jpg', function(err, data) {
            if (err) throw err;
            var str = data.toString('base64');
            videoChannel.send(str.slice(0, 50000))
        });
    }
}

ws.connect(wsUrl, 'echo-protocol');
