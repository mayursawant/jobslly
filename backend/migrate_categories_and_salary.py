import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def migrate_jobs():
    """
    Migrate existing jobs to new schema:
    1. Convert category (string) to categories (array)
    2. Convert salary_min and salary_max from int to string
    3. Remove currency field
    """
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🔄 Starting migration...")
    
    # Get all jobs
    jobs = await db.jobs.find({}).to_list(length=None)
    print(f"📊 Found {len(jobs)} jobs to migrate")
    
    migrated_count = 0
    for job in jobs:
        update_fields = {}
        
        # 1. Migrate category to categories
        if 'category' in job and job['category'] is not None:
            # Convert single category to array
            update_fields['categories'] = [job['category']]
            print(f"  - {job.get('title', 'Unknown')}: category '{job['category']}' -> categories {[job['category']]}")
        elif 'category' in job:
            # If category is None, set to empty array
            update_fields['categories'] = []
        elif 'categories' not in job:
            # If neither exists, set to empty array
            update_fields['categories'] = []
        
        # 2. Convert salary_min from int to string
        if 'salary_min' in job and job['salary_min'] is not None:
            if isinstance(job['salary_min'], int):
                update_fields['salary_min'] = str(job['salary_min'])
                print(f"  - {job.get('title', 'Unknown')}: salary_min {job['salary_min']} -> '{str(job['salary_min'])}'")
        
        # 3. Convert salary_max from int to string
        if 'salary_max' in job and job['salary_max'] is not None:
            if isinstance(job['salary_max'], int):
                update_fields['salary_max'] = str(job['salary_max'])
                print(f"  - {job.get('title', 'Unknown')}: salary_max {job['salary_max']} -> '{str(job['salary_max'])}'")
        
        # Apply updates if any
        if update_fields:
            await db.jobs.update_one(
                {"_id": job["_id"]},
                {"$set": update_fields, "$unset": {"category": "", "currency": ""}}
            )
            migrated_count += 1
    
    print(f"\n✅ Migration complete! Updated {migrated_count} jobs")
    
    # Verify the migration
    sample_job = await db.jobs.find_one({})
    if sample_job:
        print(f"\n📋 Sample migrated job:")
        print(f"  - Title: {sample_job.get('title', 'N/A')}")
        print(f"  - Categories: {sample_job.get('categories', [])}")
        print(f"  - Salary Min: {sample_job.get('salary_min', 'N/A')} (type: {type(sample_job.get('salary_min')).__name__})")
        print(f"  - Salary Max: {sample_job.get('salary_max', 'N/A')} (type: {type(sample_job.get('salary_max')).__name__})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_jobs())
