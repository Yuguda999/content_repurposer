import sys
import os
import requests
import json
import time

# Add src to path
sys.path.insert(0, os.path.abspath("src"))

# Test the health endpoint
try:
    response = requests.get("http://localhost:8001/health")
    print(f"Health endpoint: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error accessing health endpoint: {e}")

# Test creating a user
try:
    response = requests.post(
        "http://localhost:8001/api/users",
        json={
            "email": "test2@example.com",
            "password": "password123",
            "full_name": "Test User 2"
        }
    )
    print(f"Create user: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error creating user: {e}")

# Test login
try:
    response = requests.post(
        "http://localhost:8001/api/auth/token",
        data={
            "username": "test2@example.com",
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
                "http://localhost:8001/api/content",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "title": "AI in Healthcare",
                    "content": "Artificial intelligence is revolutionizing healthcare by improving diagnostics, treatment planning, and patient care. Machine learning algorithms can analyze medical images with remarkable accuracy, often outperforming human specialists in detecting certain conditions.",
                    "content_types": ["twitter", "instagram", "thumbnail"],
                    "metadata": {"tone": "professional", "hashtags": ["AI", "Healthcare", "Technology"]}
                }
            )
            print(f"Create content: {response.status_code}")
            print(f"Response: {response.text}")

            if response.status_code == 200:
                job_id = response.json()["id"]
                print(f"Job ID: {job_id}")

                # Poll for job completion
                max_attempts = 10
                attempt = 0
                while attempt < max_attempts:
                    attempt += 1
                    time.sleep(2)  # Wait 2 seconds between polls

                    try:
                        response = requests.get(
                            f"http://localhost:8001/api/jobs/{job_id}",
                            headers={"Authorization": f"Bearer {token}"}
                        )
                        print(f"Poll job (attempt {attempt}): {response.status_code}")

                        if response.status_code == 200:
                            job = response.json()
                            print(f"Job status: {job['status']}")

                            if job["status"] in ["completed", "failed"]:
                                print(f"Job details: {json.dumps(job, indent=2)}")
                                break
                    except Exception as e:
                        print(f"Error polling job: {e}")

                # Get final job details
                try:
                    response = requests.get(
                        f"http://localhost:8001/api/jobs/{job_id}",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    print(f"Final job details: {response.status_code}")
                    if response.status_code == 200:
                        job = response.json()
                        print(f"Job details: {json.dumps(job, indent=2)}")
                except Exception as e:
                    print(f"Error getting job details: {e}")
        except Exception as e:
            print(f"Error creating content: {e}")
except Exception as e:
    print(f"Error logging in: {e}")
