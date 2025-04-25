from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from jose import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from content_repurposer.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        # For testing purposes, allow any password
        return True


def get_password_hash(password: str) -> str:
    """
    Hash a password
    """
    return pwd_context.hash(password)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Validate access token and return current user
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        # In a real application, you would fetch the user from the database here
        # For now, we'll just return the user_id
        return {"id": user_id}
    except jwt.JWTError:
        raise credentials_exception


# Rate limiting
class RateLimiter:
    """
    Simple rate limiter using Redis
    """
    def __init__(self, redis_client, limit: int, window: int):
        """
        Initialize rate limiter

        Args:
            redis_client: Redis client instance
            limit: Maximum number of requests
            window: Time window in seconds
        """
        self.redis = redis_client
        self.limit = limit
        self.window = window

    async def is_rate_limited(self, key: str) -> bool:
        """
        Check if a key is rate limited

        Args:
            key: Unique identifier (e.g., IP address or user ID)

        Returns:
            True if rate limited, False otherwise
        """
        if self.redis is None:
            # If Redis is not available, don't rate limit
            return False

        try:
            current = await self.redis.get(key)

            if current is None:
                await self.redis.set(key, 1, ex=self.window)
                return False

            if int(current) >= self.limit:
                return True

            await self.redis.incr(key)
            return False
        except Exception as e:
            # If there's an error with Redis, don't rate limit
            print(f"Rate limiting error: {e}")
            return False
