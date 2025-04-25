import sys
import os
import redis

# Add src to path
sys.path.insert(0, os.path.abspath("src"))

from content_repurposer.core.config import settings

print(f"Redis URL: {settings.CELERY_BROKER_URL}")

try:
    # Try to connect to Redis
    r = redis.Redis.from_url(settings.CELERY_BROKER_URL)
    print(f"Ping Redis: {r.ping()}")
    print("Redis connection successful!")
except Exception as e:
    print(f"Redis connection error: {e}")
    import traceback
    traceback.print_exc()
