import os
from typing import Optional, Dict, Any, List
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = False
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    ALGORITHM: str = "HS256"

    # OpenAI Settings
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4.1"
    # Use DALL-E 3 for higher quality images
    OPENAI_IMAGE_MODEL: str = "dall-e-3"
    OPENAI_IMAGE_SIZE: str = "1024x1024"
    OPENAI_IMAGE_QUALITY: str = "high"  # Valid values: low, medium, high, auto

    # Storage Settings
    STORAGE_TYPE: str = "local"  # local, s3, gcs
    S3_BUCKET_NAME: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_REGION: Optional[str] = None
    LOCAL_STORAGE_PATH: str = "./storage"

    # Redis Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # Database Settings
    DATABASE_URL: str

    # Celery Settings
    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None

    @validator("CELERY_BROKER_URL", pre=True)
    def assemble_broker_url(cls, v: Optional[str], values: Dict[str, Any]) -> str:
        if v:
            return v
        if values.get('REDIS_PASSWORD'):
            return f"redis://:{values.get('REDIS_PASSWORD')}@{values.get('REDIS_HOST')}:{values.get('REDIS_PORT')}/{values.get('REDIS_DB')}"
        else:
            return f"redis://{values.get('REDIS_HOST')}:{values.get('REDIS_PORT')}/{values.get('REDIS_DB')}"

    @validator("CELERY_RESULT_BACKEND", pre=True)
    def assemble_backend_url(cls, v: Optional[str], values: Dict[str, Any]) -> str:
        if v:
            return v
        return values.get('CELERY_BROKER_URL', '')

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create global settings instance
settings = Settings()
