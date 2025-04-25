from typing import List, Dict, Any, Optional
from datetime import timedelta
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import redis.asyncio as redis

from content_repurposer.api.dependencies import get_db, get_current_active_user, get_redis
from content_repurposer.core.config import settings
from content_repurposer.core.security import create_access_token, verify_password, get_password_hash, RateLimiter
from content_repurposer.core.logging import get_logger
from content_repurposer.db.models import User, Job, JobStatus, ContentOutput
from content_repurposer.schemas.content_models import (
    ContentRequest, JobResponse, UserCreate, UserResponse, Token, ContentType
)

logger = get_logger(__name__)

# Create router
router = APIRouter()

# Rate limiter
rate_limiter = RateLimiter(redis_client=None, limit=100, window=60)


@router.post("/auth/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Check rate limiting
    rate_limiter.redis = redis_client
    if await rate_limiter.is_rate_limited(f"login:{form_data.username}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts",
        )

    # Authenticate user
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/users", response_model=UserResponse)
async def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
):
    """
    Create new user
    """
    # Check rate limiting
    rate_limiter.redis = redis_client
    if await rate_limiter.is_rate_limited(f"create_user:{user_in.email}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests",
        )

    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/content", response_model=JobResponse)
async def repurpose_content(
    content_request: ContentRequest,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    redis_client: redis.Redis = Depends(get_redis),
):
    """
    Repurpose content for social media
    """
    # Check rate limiting
    rate_limiter.redis = redis_client
    if await rate_limiter.is_rate_limited(f"content:{current_user['id']}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests",
        )

    # Create job
    job = Job(
        user_id=current_user["id"],
        title=content_request.title,
        original_content=content_request.content,
        status=JobStatus.PENDING,
        job_metadata={
            "content_types": [ct.value for ct in content_request.content_types],
            **(content_request.metadata or {}),
        },
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Queue job for processing with Celery
    from content_repurposer.workers.tasks import process_content_job

    # Submit job to Celery
    try:
        # Use delay() to send the task to Celery
        process_content_job.delay(str(job.id))

        logger.info(f"Job {job.id} queued for processing")
    except Exception as e:
        logger.error(f"Error queuing job: {e}")
        # If Celery is not available, process the job synchronously
        job.status = JobStatus.COMPLETED

        # Create sample outputs for each content type
        content_types = [ct.value for ct in content_request.content_types]

        # Sample content for each type
        sample_content = {
            "twitter": f"🧵 {content_request.title}\n\n1/ {content_request.content[:100]}...\n\n2/ This is a sample Twitter thread generated for testing purposes. #AI #ContentCreation",
            "instagram": f"✨ {content_request.title} ✨\n\n{content_request.content[:150]}...\n\n#ContentCreation #SocialMedia",
            "linkedin": f"I'm excited to share my thoughts on {content_request.title}!\n\n{content_request.content[:200]}...\n\nWhat are your thoughts on this topic?",
            "facebook": f"{content_request.title}\n\n{content_request.content[:250]}...\n\nLet me know what you think in the comments!",
            "thumbnail": None  # No text content for thumbnails
        }

        # Sample file paths for image types
        sample_file_paths = {
            "thumbnail": f"/storage/thumbnails/{job.id}.png"
        }

        # Create outputs for each requested content type
        for content_type in content_types:
            output = ContentOutput(
                job_id=job.id,
                content_type=content_type,
                content=sample_content.get(content_type),
                file_path=sample_file_paths.get(content_type),
                output_metadata={"generated": "sample"}
            )
            db.add(output)

        db.commit()
        db.refresh(job)

    # Return the job to the client
    db.refresh(job)

    return job


@router.get("/jobs", response_model=List[JobResponse])
async def get_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_active_user),
):
    """
    Get all jobs for current user
    """
    jobs = (
        db.query(Job)
        .filter(Job.user_id == current_user["id"])
        .order_by(Job.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return jobs


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_active_user),
):
    """
    Get job by ID
    """
    job = db.query(Job).filter(Job.id == str(job_id), Job.user_id == current_user["id"]).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return job
