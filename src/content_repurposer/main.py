import time
import os
from pathlib import Path
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import prometheus_client
from prometheus_client import Counter, Histogram

from content_repurposer.api.routes import router
from content_repurposer.core.config import settings
from content_repurposer.core.logging import configure_logging, RequestIdMiddleware, get_logger
from content_repurposer.db.base import Base
from content_repurposer.db.session import engine

# Configure logging
configure_logging()
logger = get_logger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Content Repurposer API",
    description="API for repurposing blog content into social media formats",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request ID middleware
app.add_middleware(RequestIdMiddleware)

# Prometheus metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP Requests",
    ["method", "endpoint", "status_code"],
)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP Request Latency",
    ["method", "endpoint"],
)


# Middleware for metrics and logging
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """
    Middleware for collecting metrics and logging requests
    """
    # Get request details
    method = request.method
    path = request.url.path

    # Start timer
    start_time = time.time()

    # Process request
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        logger.exception("Request failed", error=str(e))
        status_code = 500
        response = JSONResponse(
            status_code=status_code,
            content={"detail": "Internal server error"},
        )

    # Record metrics
    duration = time.time() - start_time
    REQUEST_COUNT.labels(method, path, status_code).inc()
    REQUEST_LATENCY.labels(method, path).observe(duration)

    # Log request
    logger.info(
        "Request processed",
        method=method,
        path=path,
        status_code=status_code,
        duration=duration,
        request_id=request.state.request_id if hasattr(request.state, "request_id") else None,
    )

    return response


# Prometheus metrics endpoint
@app.get("/metrics")
async def metrics():
    """
    Endpoint for Prometheus metrics
    """
    return prometheus_client.generate_latest()


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "ok"}


# Include API routes
app.include_router(router, prefix="/api")


# Mount static files directory for serving images
storage_path = Path(os.path.join(os.getcwd(), "storage"))
if not storage_path.exists():
    storage_path = Path(os.path.join(os.getcwd(), "..", "storage"))
if not storage_path.exists():
    storage_path = Path(os.path.join(os.getcwd(), "src", "storage"))
if not storage_path.exists():
    logger.warning(f"Storage directory not found at {storage_path}, creating it")
    storage_path.mkdir(parents=True, exist_ok=True)

logger.info(f"Mounting storage directory: {storage_path}")
app.mount("/storage", StaticFiles(directory=str(storage_path)), name="storage")


# Startup event
@app.on_event("startup")
async def startup_event():
    """
    Startup event handler
    """
    logger.info("Starting application")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event handler
    """
    logger.info("Shutting down application")
