import pika
import os
import json
import time

class RabbitMQPublisher:
    def __init__(self):
        self.url = os.getenv('RABBITMQ_URL', 'amqp://user:password@rabbitmq:5672')
        self.connection = None
        self.channel = None
        self._connect()

    def _connect(self):
        retries = 5
        while retries > 0:
            try:
                params = pika.URLParameters(self.url)
                self.connection = pika.BlockingConnection(params)
                self.channel = self.connection.channel()
                # Declare the queue we'll use
                self.channel.queue_declare(queue='stock_events', durable=True)
                print("Successfully connected to RabbitMQ")
                return
            except Exception as e:
                print(f"Failed to connect to RabbitMQ: {e}. Retrying in 5 seconds...")
                retries -= 1
                time.sleep(5)
        print("Could not connect to RabbitMQ after retries.")

    def publish_stock_added(self, stock_data):
        # Ensure connection and channel are open before publishing
        if not self.connection or self.connection.is_closed or not self.channel or self.channel.is_closed:
            print("RabbitMQ connection closed or not initialized, reconnecting...")
            self._connect()
        
        if self.channel:
            message = {
                'event': 'STOCK_ADDED',
                'data': stock_data
            }
            try:
                self.channel.basic_publish(
                    exchange='',
                    routing_key='stock_events',
                    body=json.dumps(message),
                    properties=pika.BasicProperties(
                        delivery_mode=2,  # make message persistent
                    )
                )
                print(f" [x] Sent stock added event: {stock_data}")
            except (pika.exceptions.StreamLostError, pika.exceptions.AMQPConnectionError) as e:
                print(f"Connection lost while publishing: {e}. Reconnecting...")
                self._connect()
                if self.channel:
                    self.channel.basic_publish(
                        exchange='',
                        routing_key='stock_events',
                        body=json.dumps(message),
                        properties=pika.BasicProperties(
                            delivery_mode=2,
                        )
                    )
                    print(f" [x] Sent stock added event after reconnect: {stock_data}")
            except Exception as e:
                print(f"Failed to publish message: {e}")
                raise e

# Singleton instance
publisher = RabbitMQPublisher()
