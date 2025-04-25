import logging
import sys
import time
from typing import Any, Dict, Optional

import structlog
from structlog.types import Processor

from content_repurposer.core.config import settings


def configure_logging() -> None:
    """Configure structured logging for the application"""
    
    # Set up timestamp processor
    timestamper = structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S")
    
    shared_processors: list[Processor] = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.PositionalArgumentsFormatter(),
        timestamper,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]
    
    if settings.DEBUG:
        # Pretty printing for development
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True)
        ]
    else:
        # JSON formatting for production
        processors = shared_processors + [
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer()
        ]
    
    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Set log level based on DEBUG setting
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    logging.basicConfig(
        format="%(message)s",
        level=log_level,
        stream=sys.stdout,
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Get a structured logger with the given name"""
    return structlog.get_logger(name)


# Request ID middleware for FastAPI
class RequestIdMiddleware:
    """Middleware to add request_id to each request context"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        
        # Generate a unique request ID
        request_id = f"req_{int(time.time() * 1000)}"
        
        # Add request_id to the scope state
        if "state" not in scope:
            scope["state"] = {}
        scope["state"]["request_id"] = request_id
        
        # Continue processing the request
        return await self.app(scope, receive, send)
