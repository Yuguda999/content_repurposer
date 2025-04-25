from typing import Any, Callable, Optional, TypeVar, cast
import json
import functools
import inspect
import hashlib

import redis.asyncio as redis

from content_repurposer.core.logging import get_logger

logger = get_logger(__name__)

T = TypeVar("T")


class RedisCache:
    """Redis cache utility"""
    
    def __init__(self, redis_client: redis.Redis, prefix: str = "cache:", ttl: int = 3600):
        """
        Initialize Redis cache
        
        Args:
            redis_client: Redis client
            prefix: Key prefix
            ttl: Time to live in seconds
        """
        self.redis = redis_client
        self.prefix = prefix
        self.ttl = ttl
    
    async def get(self, key: str) -> Optional[str]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        try:
            return await self.redis.get(f"{self.prefix}{key}")
        except Exception as e:
            logger.error("Error getting from cache", error=str(e), key=key)
            return None
    
    async def set(self, key: str, value: str, ttl: Optional[int] = None) -> bool:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (overrides default)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            return await self.redis.set(
                f"{self.prefix}{key}",
                value,
                ex=ttl if ttl is not None else self.ttl,
            )
        except Exception as e:
            logger.error("Error setting cache", error=str(e), key=key)
            return False
    
    async def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            return bool(await self.redis.delete(f"{self.prefix}{key}"))
        except Exception as e:
            logger.error("Error deleting from cache", error=str(e), key=key)
            return False
    
    def cached(
        self,
        key_prefix: str,
        ttl: Optional[int] = None,
        key_builder: Optional[Callable[..., str]] = None,
    ) -> Callable[[Callable[..., T]], Callable[..., T]]:
        """
        Decorator for caching function results
        
        Args:
            key_prefix: Prefix for cache key
            ttl: Time to live in seconds (overrides default)
            key_builder: Function to build cache key from arguments
            
        Returns:
            Decorated function
        """
        def decorator(func: Callable[..., T]) -> Callable[..., T]:
            @functools.wraps(func)
            async def wrapper(*args: Any, **kwargs: Any) -> T:
                # Build cache key
                if key_builder:
                    cache_key = key_builder(*args, **kwargs)
                else:
                    # Default key builder
                    arg_str = json.dumps(
                        [str(arg) for arg in args] + 
                        [f"{k}:{v}" for k, v in sorted(kwargs.items())],
                        sort_keys=True,
                    )
                    cache_key = f"{key_prefix}:{hashlib.md5(arg_str.encode()).hexdigest()}"
                
                # Try to get from cache
                cached_value = await self.get(cache_key)
                if cached_value:
                    try:
                        return cast(T, json.loads(cached_value))
                    except json.JSONDecodeError:
                        # If not JSON, return as is
                        return cast(T, cached_value)
                
                # Call function
                result = await func(*args, **kwargs) if inspect.iscoroutinefunction(func) else func(*args, **kwargs)
                
                # Cache result
                try:
                    serialized = json.dumps(result) if not isinstance(result, str) else result
                    await self.set(cache_key, serialized, ttl)
                except (TypeError, json.JSONDecodeError) as e:
                    logger.warning("Could not cache result", error=str(e), key=cache_key)
                
                return result
            
            return wrapper
        
        return decorator
