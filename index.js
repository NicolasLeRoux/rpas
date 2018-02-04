const WebSocketClient = require('websocket').client,
	wrtc = require('wrtc');

let ws = new WebSocketClient(),
	peerCo,
	videoChannel;

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
		name: 'Drone 001'
	}));
});

const processSocketMessage = function (json, connec) {
	switch (json.action) {
		case 'INIT_PEER_CO':
			var remoteDescription = new wrtc.RTCSessionDescription(json.remoteDescription);
			peerCo = new wrtc.RTCPeerConnection();

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
			console.error('Undefined action...');
	}
};

ws.connect('ws://localhost:3000/', 'echo-protocol');
