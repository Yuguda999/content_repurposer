import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from content_repurposer.db.models import User
from content_repurposer.core.security import get_password_hash


def test_health_check(client: TestClient):
    """
    Test health check endpoint
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_user(client: TestClient):
    """
    Test user creation
    """
    response = client.post(
        "/api/users",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data


def test_login(client: TestClient, db_session: Session):
    """
    Test user login
    """
    # Create test user
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test User",
    )
    db_session.add(user)
    db_session.commit()
    
    # Test login
    response = client.post(
        "/api/auth/token",
        data={
            "username": "test@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
