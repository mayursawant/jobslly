import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def migrate_currency():
    """Add default currency field to all existing jobs"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/job_platform')
    client = AsyncIOMotorClient(mongo_url)
    db = client.get_database()
    
    # Update all jobs that don't have a currency field
    result = await db.jobs.update_many(
        {"currency": {"$exists": False}},
        {"$set": {"currency": "INR"}}
    )
    
    print(f"✅ Migration complete! Updated {result.modified_count} jobs with default currency 'INR'")
    
    # Verify the update
    total_jobs = await db.jobs.count_documents({})
    jobs_with_currency = await db.jobs.count_documents({"currency": {"$exists": True}})
    
    print(f"📊 Total jobs: {total_jobs}")
    print(f"📊 Jobs with currency field: {jobs_with_currency}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_currency())
