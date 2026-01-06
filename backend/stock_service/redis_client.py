import redis
import os
import logging

logger = logging.getLogger(__name__)

class RedisClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisClient, cls).__new__(cls)
            cls._instance.client = None
            cls._instance.connect()
        return cls._instance

    def connect(self):
        host = os.environ.get('REDIS_HOST', 'localhost')
        port = int(os.environ.get('REDIS_PORT', 6379))
        try:
            self.client = redis.Redis(
                host=host,
                port=port,
                decode_responses=True,
                socket_connect_timeout=5
            )
            # Test connection
            self.client.ping()
            logger.info(f"Connected to Redis at {host}:{port}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            self.client = None

    def get_client(self):
        if not self.client:
            self.connect()
        return self.client

redis_client = RedisClient()
