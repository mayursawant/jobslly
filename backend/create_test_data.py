import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid

async def create_test_data():
    """Create test jobs with currency field"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/job_platform')
    client = AsyncIOMotorClient(mongo_url)
    db = client.get_database()
    
    # Create test jobs with different currencies
    test_jobs = [
        {
            "id": str(uuid.uuid4()),
            "title": "Senior Cardiologist - Mumbai",
            "slug": "senior-cardiologist-mumbai",
            "description": "Looking for an experienced Cardiologist to join our team in Mumbai.",
            "company": "Apollo Hospitals",
            "location": "Mumbai, India",
            "salary_min": 1500000,
            "salary_max": 2500000,
            "currency": "INR",
            "job_type": "full_time",
            "category": "doctors",
            "requirements": ["MD in Cardiology", "5+ years experience"],
            "benefits": ["Health Insurance", "Retirement Benefits"],
            "employer_id": "test-employer-1",
            "is_approved": True,
            "is_deleted": False,
            "is_external": False,
            "external_url": None,
            "application_deadline": None,
            "view_count": 0,
            "application_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Registered Nurse - New York",
            "slug": "registered-nurse-new-york",
            "description": "Seeking compassionate RN for our New York facility.",
            "company": "Mount Sinai Hospital",
            "location": "New York, USA",
            "salary_min": 75000,
            "salary_max": 95000,
            "currency": "USD",
            "job_type": "full_time",
            "category": "nurses",
            "requirements": ["BSN degree", "RN license", "2+ years experience"],
            "benefits": ["Health Insurance", "401k", "PTO"],
            "employer_id": "test-employer-2",
            "is_approved": True,
            "is_deleted": False,
            "is_external": False,
            "external_url": None,
            "application_deadline": None,
            "view_count": 0,
            "application_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Pharmacist - Delhi",
            "slug": "pharmacist-delhi",
            "description": "Join our pharmacy team in Delhi.",
            "company": "Max Healthcare",
            "location": "Delhi, India",
            "salary_min": 500000,
            "salary_max": 800000,
            "currency": "INR",
            "job_type": "full_time",
            "category": "pharmacy",
            "requirements": ["B.Pharm", "Valid license"],
            "benefits": ["Medical Benefits", "Performance Bonus"],
            "employer_id": "test-employer-3",
            "is_approved": True,
            "is_deleted": False,
            "is_external": False,
            "external_url": None,
            "application_deadline": None,
            "view_count": 0,
            "application_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": None
        }
    ]
    
    # Insert test jobs
    result = await db.jobs.insert_many(test_jobs)
    print(f"✅ Created {len(result.inserted_ids)} test jobs with currency field")
    
    # Verify
    for job in test_jobs:
        print(f"  - {job['title']}: {job['currency']} {job['salary_min']:,} - {job['salary_max']:,}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_data())
