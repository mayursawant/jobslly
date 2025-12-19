#!/usr/bin/env python3
"""
Auto-archive expired jobs
This script checks for jobs that have passed their expiry date and archives them
Run this as a cron job or scheduled task
"""

import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'jobs')

async def archive_expired_jobs():
    """Archive jobs that have passed their expiry date"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Current time in UTC
        now = datetime.now(timezone.utc)
        
        # Find jobs that are expired but not archived
        query = {
            "expires_at": {"$ne": None, "$lt": now},
            "is_archived": {"$ne": True},
            "is_deleted": {"$ne": True}
        }
        
        expired_jobs = await db.jobs.find(query).to_list(length=None)
        
        if not expired_jobs:
            print(f"✅ No expired jobs to archive at {now.isoformat()}")
            client.close()
            return
        
        # Archive expired jobs
        job_ids = [job["id"] for job in expired_jobs]
        result = await db.jobs.update_many(
            {"id": {"$in": job_ids}},
            {"$set": {"is_archived": True}}
        )
        
        print(f"✅ Archived {result.modified_count} expired jobs at {now.isoformat()}")
        for job in expired_jobs:
            print(f"   - {job.get('title')} (ID: {job.get('id')}, Expired: {job.get('expires_at')})")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error archiving expired jobs: {e}")

async def main():
    """Main entry point"""
    await archive_expired_jobs()

if __name__ == "__main__":
    asyncio.run(main())
