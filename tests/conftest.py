import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from content_repurposer.db.base import Base
from content_repurposer.db.session import get_db
from content_repurposer.main import app


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    """
    Test client fixture
    """
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create test client
    with TestClient(app) as client:
        yield client
    
    # Drop tables
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """
    Database session fixture
    """
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
    
    # Drop tables
    Base.metadata.drop_all(bind=engine)
