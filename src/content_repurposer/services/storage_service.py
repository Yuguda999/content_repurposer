import os
import base64
from abc import ABC, abstractmethod
from typing import Optional, BinaryIO, Union
from pathlib import Path
import boto3
from botocore.exceptions import ClientError

from content_repurposer.core.config import settings
from content_repurposer.core.logging import get_logger

logger = get_logger(__name__)


class StorageService(ABC):
    """Abstract base class for storage services"""
    
    @abstractmethod
    async def save_file(self, file_content: Union[str, bytes], file_path: str) -> str:
        """
        Save a file to storage
        
        Args:
            file_content: Content of the file (string or bytes)
            file_path: Path where the file should be saved
            
        Returns:
            URL or path to the saved file
        """
        pass
    
    @abstractmethod
    async def get_file(self, file_path: str) -> bytes:
        """
        Get a file from storage
        
        Args:
            file_path: Path to the file
            
        Returns:
            File content as bytes
        """
        pass
    
    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from storage
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if successful, False otherwise
        """
        pass
    
    async def save_base64_image(self, base64_str: str, file_path: str) -> str:
        """
        Save a base64 encoded image to storage
        
        Args:
            base64_str: Base64 encoded image
            file_path: Path where the image should be saved
            
        Returns:
            URL or path to the saved image
        """
        # Remove data URL prefix if present
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        
        # Decode base64 to bytes
        image_data = base64.b64decode(base64_str)
        
        # Save the image
        return await self.save_file(image_data, file_path)


class LocalStorageService(StorageService):
    """Local file system storage service"""
    
    def __init__(self, base_path: Optional[str] = None):
        """
        Initialize local storage service
        
        Args:
            base_path: Base directory for file storage
        """
        self.base_path = Path(base_path or settings.LOCAL_STORAGE_PATH)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def save_file(self, file_content: Union[str, bytes], file_path: str) -> str:
        """
        Save a file to local storage
        
        Args:
            file_content: Content of the file
            file_path: Path where the file should be saved
            
        Returns:
            Path to the saved file
        """
        full_path = self.base_path / file_path
        
        # Create directory if it doesn't exist
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file
        mode = "wb" if isinstance(file_content, bytes) else "w"
        with open(full_path, mode) as f:
            f.write(file_content)
        
        return str(full_path)
    
    async def get_file(self, file_path: str) -> bytes:
        """
        Get a file from local storage
        
        Args:
            file_path: Path to the file
            
        Returns:
            File content as bytes
        """
        full_path = self.base_path / file_path
        
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        with open(full_path, "rb") as f:
            return f.read()
    
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from local storage
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if successful, False otherwise
        """
        full_path = self.base_path / file_path
        
        if not full_path.exists():
            return False
        
        try:
            full_path.unlink()
            return True
        except Exception as e:
            logger.error("Error deleting file", error=str(e), file_path=file_path)
            return False


class S3StorageService(StorageService):
    """AWS S3 storage service"""
    
    def __init__(
        self,
        bucket_name: Optional[str] = None,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        region: Optional[str] = None,
    ):
        """
        Initialize S3 storage service
        
        Args:
            bucket_name: S3 bucket name
            access_key: AWS access key
            secret_key: AWS secret key
            region: AWS region
        """
        self.bucket_name = bucket_name or settings.S3_BUCKET_NAME
        self.access_key = access_key or settings.S3_ACCESS_KEY
        self.secret_key = secret_key or settings.S3_SECRET_KEY
        self.region = region or settings.S3_REGION
        
        if not self.bucket_name:
            raise ValueError("S3 bucket name is required")
        
        # Initialize S3 client
        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region,
        )
    
    async def save_file(self, file_content: Union[str, bytes], file_path: str) -> str:
        """
        Save a file to S3
        
        Args:
            file_content: Content of the file
            file_path: Path where the file should be saved
            
        Returns:
            S3 URL to the saved file
        """
        try:
            # Convert string to bytes if needed
            if isinstance(file_content, str):
                file_content = file_content.encode("utf-8")
            
            # Upload to S3
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=file_path,
                Body=file_content,
            )
            
            # Return S3 URL
            return f"https://{self.bucket_name}.s3.amazonaws.com/{file_path}"
        except Exception as e:
            logger.error("Error saving file to S3", error=str(e), file_path=file_path)
            raise
    
    async def get_file(self, file_path: str) -> bytes:
        """
        Get a file from S3
        
        Args:
            file_path: Path to the file
            
        Returns:
            File content as bytes
        """
        try:
            response = self.s3.get_object(Bucket=self.bucket_name, Key=file_path)
            return response["Body"].read()
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                raise FileNotFoundError(f"File not found in S3: {file_path}")
            logger.error("Error getting file from S3", error=str(e), file_path=file_path)
            raise
    
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from S3
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.s3.delete_object(Bucket=self.bucket_name, Key=file_path)
            return True
        except Exception as e:
            logger.error("Error deleting file from S3", error=str(e), file_path=file_path)
            return False


def get_storage_service() -> StorageService:
    """
    Factory function to get the appropriate storage service based on configuration
    
    Returns:
        StorageService instance
    """
    storage_type = settings.STORAGE_TYPE.lower()
    
    if storage_type == "s3":
        return S3StorageService()
    elif storage_type == "local":
        return LocalStorageService()
    else:
        logger.warning(f"Unknown storage type: {storage_type}, using local storage")
        return LocalStorageService()
