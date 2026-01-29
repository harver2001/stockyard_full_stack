import redis
import os
import logging

logger = logging.getLogger(__name__)

class RedisClient:
    """Simple wrapper for Redis client with basic connection health check."""
    def __init__(self):
        self.client = redis.Redis(
            host=os.environ.get('REDIS_HOST', 'localhost'),
            port=int(os.environ.get('REDIS_PORT', 6379)),
            decode_responses=True,
            socket_connect_timeout=5
        )

    def get_client(self):
        """Returns the Redis client if healthy, else None."""
        try:
            self.client.ping()
            return self.client
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            return None

redis_client = RedisClient()
