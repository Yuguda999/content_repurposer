import asyncio
import functools
import random
from typing import Any, Callable, List, Optional, Type, TypeVar, cast

from content_repurposer.core.logging import get_logger

logger = get_logger(__name__)

T = TypeVar("T")


def async_retry(
    retries: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: Optional[List[Type[Exception]]] = None,
):
    """
    Retry decorator for async functions
    
    Args:
        retries: Maximum number of retries
        delay: Initial delay between retries in seconds
        backoff: Backoff multiplier
        exceptions: List of exceptions to catch (defaults to Exception)
    """
    if exceptions is None:
        exceptions = [Exception]
    
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            retry_count = 0
            current_delay = delay
            
            while True:
                try:
                    return await func(*args, **kwargs)
                except tuple(exceptions) as e:
                    retry_count += 1
                    
                    if retry_count > retries:
                        logger.error(
                            "Max retries exceeded",
                            function=func.__name__,
                            error=str(e),
                            retry_count=retry_count,
                        )
                        raise
                    
                    # Add jitter to avoid thundering herd
                    jitter = random.uniform(0.8, 1.2)
                    sleep_time = current_delay * jitter
                    
                    logger.warning(
                        "Retrying function",
                        function=func.__name__,
                        error=str(e),
                        retry_count=retry_count,
                        sleep_time=sleep_time,
                    )
                    
                    await asyncio.sleep(sleep_time)
                    current_delay *= backoff
        
        return wrapper
    
    return decorator


def sync_retry(
    retries: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: Optional[List[Type[Exception]]] = None,
):
    """
    Retry decorator for synchronous functions
    
    Args:
        retries: Maximum number of retries
        delay: Initial delay between retries in seconds
        backoff: Backoff multiplier
        exceptions: List of exceptions to catch (defaults to Exception)
    """
    if exceptions is None:
        exceptions = [Exception]
    
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            retry_count = 0
            current_delay = delay
            
            while True:
                try:
                    return func(*args, **kwargs)
                except tuple(exceptions) as e:
                    retry_count += 1
                    
                    if retry_count > retries:
                        logger.error(
                            "Max retries exceeded",
                            function=func.__name__,
                            error=str(e),
                            retry_count=retry_count,
                        )
                        raise
                    
                    # Add jitter to avoid thundering herd
                    jitter = random.uniform(0.8, 1.2)
                    sleep_time = current_delay * jitter
                    
                    logger.warning(
                        "Retrying function",
                        function=func.__name__,
                        error=str(e),
                        retry_count=retry_count,
                        sleep_time=sleep_time,
                    )
                    
                    time.sleep(sleep_time)
                    current_delay *= backoff
        
        return wrapper
    
    return decorator
