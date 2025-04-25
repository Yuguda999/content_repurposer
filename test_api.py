import sys
import os
import requests
import json

# Test the health endpoint
try:
    response = requests.get("http://localhost:8000/health")
    print(f"Health endpoint: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error accessing health endpoint: {e}")

# Test creating a user
try:
    response = requests.post(
        "http://localhost:8000/api/users",
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

# Test login
try:
    response = requests.post(
        "http://localhost:8000/api/auth/token",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    print(f"Login: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        
        # Test creating content
        try:
            response = requests.post(
                "http://localhost:8000/api/content",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "title": "Test Blog",
                    "content": "This is a test blog post.",
                    "content_types": ["twitter", "instagram"],
                    "metadata": {"tone": "professional"}
                }
            )
            print(f"Create content: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"Error creating content: {e}")
except Exception as e:
    print(f"Error logging in: {e}")
