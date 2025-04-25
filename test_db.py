import sys
import os

# Add src to path
sys.path.insert(0, os.path.abspath("src"))

from content_repurposer.db.session import engine, SessionLocal
from content_repurposer.db.models import User, Job, ContentOutput, Base

# Create tables
Base.metadata.create_all(bind=engine)

# Create a session
db = SessionLocal()

try:
    # Create a test user
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        full_name="Test User",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    print(f"Created user: {user.id}, {user.email}")
    
    # Query the user
    user = db.query(User).filter(User.email == "test@example.com").first()
    print(f"Queried user: {user.id}, {user.email}")
    
    # Create a test job
    job = Job(
        user_id=user.id,
        title="Test Job",
        original_content="Test content",
        status="pending",
        job_metadata={"test": "metadata"},
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    print(f"Created job: {job.id}, {job.title}")
    
    # Query the job
    job = db.query(Job).filter(Job.title == "Test Job").first()
    print(f"Queried job: {job.id}, {job.title}")
    
    # Create a test content output
    output = ContentOutput(
        job_id=job.id,
        content_type="twitter",
        content="Test content",
        output_metadata={"test": "metadata"},
    )
    db.add(output)
    db.commit()
    db.refresh(output)
    
    print(f"Created output: {output.id}, {output.content_type}")
    
    # Query the output
    output = db.query(ContentOutput).filter(ContentOutput.content_type == "twitter").first()
    print(f"Queried output: {output.id}, {output.content_type}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
