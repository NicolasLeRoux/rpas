#!/usr/bin/env python
import pantilthat
import pika
import json

panAngle = 0
tiltAngle = 0

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='pantilthat')

# pantilthat.servo_enable(1, True)
# pantilthat.servo_enable(2, True)

# pantilthat.servo_enable(1, False)
# pantilthat.servo_enable(2, False)

def callback(ch, method, properties, body):
	global panAngle
	global tiltAngle

	bodyStr = body.decode('utf-8')
	requestParams = json.loads(bodyStr)

	if requestParams['type'] == 'COMMAND':
		direction = requestParams['direction']

		if direction == 'left':
			if tiltAngle < 50:
				tiltAngle = tiltAngle + 5
		elif direction == 'right':
			if tiltAngle > -50:
				tiltAngle = tiltAngle - 5
		elif direction == 'down':
			if panAngle < 50:
				panAngle = panAngle + 5
		elif direction == 'up':
			if panAngle > -50:
				panAngle = panAngle - 5

		move()

def move():
	global panAngle
	global tiltAngle

	pantilthat.pan(panAngle)
	pantilthat.tilt(tiltAngle)

move()

# receive message and complete simulation
channel.basic_consume(callback, queue='pantilthat', no_ack=True)
channel.start_consuming()
