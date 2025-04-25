import asyncio
from typing import Dict, List, Optional, Any, Union
import uuid

from celery import Task
from sqlalchemy.orm import Session

from content_repurposer.core.logging import get_logger
from content_repurposer.db.session import SessionLocal
from content_repurposer.db.models import Job, JobStatus
from content_repurposer.services.orchestrator import ContentOrchestrator
from content_repurposer.workers.celery_app import celery_app

logger = get_logger(__name__)


class AsyncTask(Task):
    """Base class for async Celery tasks"""

    def run_async(self, *args, **kwargs):
        """Run the task asynchronously"""
        return asyncio.run(self._run_async(*args, **kwargs))

    async def _run_async(self, *args, **kwargs):
        """Async implementation to be overridden by subclasses"""
        raise NotImplementedError()


@celery_app.task(
    bind=True,
    base=AsyncTask,
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3, 'countdown': 60},
    rate_limit='10/m'
)
def process_content_job(self, job_id: str) -> Dict[str, Any]:
    """
    Process a content repurposing job

    Args:
        job_id: ID of the job to process

    Returns:
        Dictionary with job status and ID
    """
    logger.info("Processing content job", job_id=job_id)

    # Create database session
    db = SessionLocal()

    try:
        # Get job from database
        job = db.query(Job).filter(Job.id == job_id).first()

        if not job:
            logger.error("Job not found", job_id=job_id)
            return {"status": "error", "message": "Job not found", "job_id": job_id}

        # Update job status to processing if it's still pending
        if job.status == JobStatus.PENDING:
            job.status = JobStatus.PROCESSING
            db.commit()
            db.refresh(job)

        # Create orchestrator
        orchestrator = ContentOrchestrator()

        # Process job
        try:
            result = asyncio.run(orchestrator.process_job(job, db))

            return {
                "status": "success",
                "job_id": str(result.id),
                "job_status": result.status.value,
            }
        except Exception as process_error:
            # If this is a retry, increment retry count
            retry_count = job.job_metadata.get("retry_count", 0) if job.job_metadata else 0

            if retry_count < 3:  # Max retries
                # Update retry count
                if not job.job_metadata:
                    job.job_metadata = {}

                job.job_metadata["retry_count"] = retry_count + 1
                job.status = JobStatus.PENDING  # Reset to pending for retry
                job.error_message = f"Retry {retry_count + 1}/3: {str(process_error)}"
                db.commit()

                # Raise exception to trigger retry
                raise process_error
            else:
                # Max retries reached, mark as failed
                job.status = JobStatus.FAILED
                job.error_message = f"Failed after {retry_count} retries: {str(process_error)}"
                db.commit()

                logger.error(
                    "Job failed after max retries",
                    error=str(process_error),
                    job_id=job_id,
                    retry_count=retry_count
                )

                return {
                    "status": "error",
                    "message": f"Failed after {retry_count} retries: {str(process_error)}",
                    "job_id": job_id
                }
    except Exception as e:
        logger.error("Error processing job", error=str(e), job_id=job_id)

        # Update job status to failed if it exists
        try:
            job = db.query(Job).filter(Job.id == job_id).first()
            if job:
                job.status = JobStatus.FAILED
                job.error_message = str(e)
                db.commit()
        except Exception as db_error:
            logger.error("Error updating job status", error=str(db_error), job_id=job_id)

        # Re-raise the exception to trigger Celery retry
        raise
    finally:
        db.close()
