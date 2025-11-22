import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def add_currency_field():
    """
    Add currency field to all existing jobs (default to INR)
    """
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🔄 Adding currency field to all jobs...")
    
    # Update all jobs that don't have a currency field
    result = await db.jobs.update_many(
        {"currency": {"$exists": False}},
        {"$set": {"currency": "INR"}}
    )
    
    print(f"✅ Updated {result.modified_count} jobs with default currency 'INR'")
    
    # Verify
    total_jobs = await db.jobs.count_documents({})
    jobs_with_currency = await db.jobs.count_documents({"currency": {"$exists": True}})
    
    print(f"📊 Total jobs: {total_jobs}")
    print(f"📊 Jobs with currency field: {jobs_with_currency}")
    
    # Show sample
    sample_job = await db.jobs.find_one({})
    if sample_job:
        print(f"\n📋 Sample job:")
        print(f"  - Title: {sample_job.get('title', 'N/A')}")
        print(f"  - Currency: {sample_job.get('currency', 'N/A')}")
        print(f"  - Salary: {sample_job.get('salary_min', 'N/A')} - {sample_job.get('salary_max', 'N/A')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_currency_field())
