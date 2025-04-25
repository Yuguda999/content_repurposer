#!/bin/bash
set -e

# Seed database with test data
echo "Seeding database with test data..."

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies if needed
if ! pip show sqlalchemy > /dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Run seed script
python - << EOF
import asyncio
import os
import sys
from datetime import datetime
import uuid

# Add src to path
sys.path.insert(0, os.path.abspath("src"))

from content_repurposer.db.session import SessionLocal
from content_repurposer.db.models import User, Job, ContentOutput, JobStatus, ContentType
from content_repurposer.core.security import get_password_hash

# Create database session
db = SessionLocal()

try:
    # Create test user if it doesn't exist
    user = db.query(User).filter(User.email == "test@example.com").first()
    if not user:
        print("Creating test user...")
        user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Test User",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create test jobs
    print("Creating test jobs...")
    for i in range(3):
        job = Job(
            user_id=user.id,
            title=f"Test Blog {i+1}",
            original_content=f"This is test blog post {i+1}. It contains some sample content for testing.",
            status=JobStatus.COMPLETED if i < 2 else JobStatus.PENDING,
            metadata={"content_types": ["twitter", "instagram", "linkedin", "facebook", "thumbnail"]},
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Add content outputs for completed jobs
        if i < 2:
            # Twitter
            db.add(ContentOutput(
                job_id=job.id,
                content_type=ContentType.TWITTER,
                content=f"1/ This is a Twitter thread for Test Blog {i+1}.\n\n2/ It contains some sample content for testing.\n\n3/ #testing #sample",
            ))
            
            # Instagram
            db.add(ContentOutput(
                job_id=job.id,
                content_type=ContentType.INSTAGRAM,
                content=f"📝 Test Blog {i+1}\n\nThis is a sample Instagram caption for testing purposes.\n\n#testing #sample",
            ))
            
            # LinkedIn
            db.add(ContentOutput(
                job_id=job.id,
                content_type=ContentType.LINKEDIN,
                content=f"I'm excited to share Test Blog {i+1}!\n\nThis is a sample LinkedIn post for testing purposes.\n\nWhat do you think about this approach? Let me know in the comments!\n\n#testing #sample",
            ))
            
            # Facebook
            db.add(ContentOutput(
                job_id=job.id,
                content_type=ContentType.FACEBOOK,
                content=f"Check out my latest blog post: Test Blog {i+1}!\n\nThis is a sample Facebook post for testing purposes.\n\nLet me know what you think in the comments!\n\n#testing #sample",
            ))
            
            # Thumbnail
            db.add(ContentOutput(
                job_id=job.id,
                content_type=ContentType.THUMBNAIL,
                file_path=f"/storage/thumbnails/sample_{i+1}.png",
            ))
            
            db.commit()
    
    print("Database seeded successfully!")
finally:
    db.close()
EOF

echo "Done!"
