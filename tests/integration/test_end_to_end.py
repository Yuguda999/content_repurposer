import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from content_repurposer.db.models import User, Job, JobStatus, ContentType
from content_repurposer.core.security import get_password_hash, create_access_token


@pytest.fixture
def test_user(db_session: Session):
    """
    Create a test user and return the user object and access token
    """
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test User",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    access_token = create_access_token(subject=str(user.id))
    
    return {"user": user, "token": access_token}


def test_create_job(client: TestClient, test_user):
    """
    Test job creation
    """
    response = client.post(
        "/api/content",
        json={
            "title": "Test Blog",
            "content": "This is a test blog post.",
            "content_types": ["twitter", "instagram"],
            "metadata": {"tone": "professional"},
        },
        headers={"Authorization": f"Bearer {test_user['token']}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Blog"
    assert data["status"] == "pending"
    assert "id" in data


def test_get_jobs(client: TestClient, test_user, db_session: Session):
    """
    Test getting jobs for a user
    """
    # Create test jobs
    for i in range(3):
        job = Job(
            user_id=test_user["user"].id,
            title=f"Test Blog {i}",
            original_content=f"This is test blog post {i}.",
            status=JobStatus.PENDING,
        )
        db_session.add(job)
    db_session.commit()
    
    # Test API
    response = client.get(
        "/api/jobs",
        headers={"Authorization": f"Bearer {test_user['token']}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["title"] == "Test Blog 2"  # Most recent first


def test_get_job(client: TestClient, test_user, db_session: Session):
    """
    Test getting a specific job
    """
    # Create test job
    job = Job(
        user_id=test_user["user"].id,
        title="Test Blog",
        original_content="This is a test blog post.",
        status=JobStatus.PENDING,
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    
    # Test API
    response = client.get(
        f"/api/jobs/{job.id}",
        headers={"Authorization": f"Bearer {test_user['token']}"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(job.id)
    assert data["title"] == "Test Blog"
    assert data["status"] == "pending"
