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

#pantilthat.pan(panAngle)
#pantilthat.tilt(tiltAngle)

# pantilthat.servo_enable(1, False)
# pantilthat.servo_enable(2, False)

def callback(ch, method, properties, body):
	requestParams = json.loads(body.decode('utf-8'))

	print(requestParams)

# receive message and complete simulation
channel.basic_consume(callback, queue='pantilthat', no_ack=True)
channel.start_consuming()
