import sys
import os
import traceback
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Add src to path
sys.path.insert(0, os.path.abspath("src"))

from fastapi.testclient import TestClient
from content_repurposer.main import app

# Create test client
client = TestClient(app)

# Test health endpoint
try:
    response = client.get("/health")
    print(f"Health endpoint: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error testing health endpoint: {e}")
    traceback.print_exc()

# Test creating a user
try:
    response = client.post(
        "/api/users",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    print(f"Create user: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error creating user: {e}")
    traceback.print_exc()

# Test login
try:
    response = client.post(
        "/api/auth/token",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    print(f"Login: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error logging in: {e}")
    traceback.print_exc()
