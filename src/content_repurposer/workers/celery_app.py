from celery import Celery
from celery.signals import setup_logging

from content_repurposer.core.config import settings
from content_repurposer.core.logging import configure_logging

# Create Celery app
celery_app = Celery(
    "content_repurposer",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_track_started=True,
)

# Import tasks to ensure they're registered
import content_repurposer.workers.tasks


# Set up logging
@setup_logging.connect
def setup_celery_logging(*args, **kwargs):
    configure_logging()
