from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from uuid import UUID

from pydantic import BaseModel, Field, EmailStr


class ContentType(str, Enum):
    """Content type enum"""
    TWITTER = "twitter"
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"
    FACEBOOK = "facebook"
    THUMBNAIL = "thumbnail"


class JobStatus(str, Enum):
    """Job status enum"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ContentRequest(BaseModel):
    """Request model for content repurposing"""
    title: str = Field(..., description="Title of the blog post")
    content: str = Field(..., description="Original blog content to repurpose")
    content_types: List[ContentType] = Field(
        ...,
        description="Types of content to generate"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata for content generation"
    )


class ContentOutput(BaseModel):
    """Output model for generated content"""
    id: UUID
    content_type: ContentType
    content: Optional[str] = None
    file_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    output_metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    """Response model for job status"""
    id: UUID
    title: str
    status: JobStatus
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    job_metadata: Optional[Dict[str, Any]] = None
    outputs: List[ContentOutput] = []

    class Config:
        from_attributes = True


class JobCreate(BaseModel):
    """Model for creating a new job"""
    title: str
    original_content: str
    job_metadata: Optional[Dict[str, Any]] = None


class UserCreate(BaseModel):
    """Model for creating a new user"""
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    """Response model for user data"""
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """Token payload model"""
    sub: Optional[str] = None
    exp: Optional[int] = None
