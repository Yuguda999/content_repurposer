import sys
import os
import traceback
import json

# Add src to path
sys.path.insert(0, os.path.abspath("src"))

from fastapi.testclient import TestClient
from content_repurposer.main import app

# Create test client
client = TestClient(app)

# Login to get token
try:
    response = client.post(
        "/api/auth/token",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    print(f"Login: {response.status_code}")
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"Token: {token[:20]}...")
        
        # Test creating content
        try:
            response = client.post(
                "/api/content",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "title": "Test Blog",
                    "content": "This is a test blog post about artificial intelligence. AI is transforming many industries and creating new opportunities for innovation.",
                    "content_types": ["twitter", "instagram"],
                    "metadata": {"tone": "professional"}
                }
            )
            print(f"Create content: {response.status_code}")
            if response.status_code == 200:
                job = response.json()
                print(f"Job ID: {job['id']}")
                print(f"Job Status: {job['status']}")
                
                # Get job details
                try:
                    response = client.get(
                        f"/api/jobs/{job['id']}",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    print(f"Get job: {response.status_code}")
                    if response.status_code == 200:
                        job_details = response.json()
                        print(f"Job Details: {json.dumps(job_details, indent=2)}")
                except Exception as e:
                    print(f"Error getting job: {e}")
                    traceback.print_exc()
        except Exception as e:
            print(f"Error creating content: {e}")
            traceback.print_exc()
    else:
        print(f"Login failed: {response.text}")
except Exception as e:
    print(f"Error logging in: {e}")
    traceback.print_exc()
