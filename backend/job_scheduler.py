"""
Background scheduler for periodic tasks
Runs auto-archive job daily at midnight
"""

import asyncio
from datetime import datetime, timezone, time
from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'jobs')

async def archive_expired_jobs():
    """Archive jobs that have passed their expiry date"""
    try:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        now = datetime.now(timezone.utc)
        
        # Find expired jobs that are not archived
        query = {
            "expires_at": {"$ne": None, "$lt": now},
            "is_archived": {"$ne": True},
            "is_deleted": {"$ne": True}
        }
        
        expired_jobs = await db.jobs.find(query).to_list(length=None)
        
        if expired_jobs:
            job_ids = [job["id"] for job in expired_jobs]
            result = await db.jobs.update_many(
                {"id": {"$in": job_ids}},
                {"$set": {"is_archived": True}}
            )
            
            print(f"✅ [JOB SCHEDULER] Archived {result.modified_count} expired jobs at {now.isoformat()}")
        else:
            print(f"✅ [JOB SCHEDULER] No expired jobs to archive at {now.isoformat()}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ [JOB SCHEDULER] Error archiving expired jobs: {e}")

async def scheduler_task():
    """Background task that runs daily at midnight"""
    print("✅ [JOB SCHEDULER] Started - Will check for expired jobs daily at midnight")
    
    while True:
        try:
            # Get current time
            now = datetime.now(timezone.utc)
            
            # Calculate seconds until next midnight UTC
            tomorrow = now.replace(hour=0, minute=0, second=0, microsecond=0)
            if now.hour >= 0:
                # Already past midnight today, schedule for tomorrow
                from datetime import timedelta
                tomorrow = tomorrow + timedelta(days=1)
            
            seconds_until_midnight = (tomorrow - now).total_seconds()
            
            print(f"⏰ [JOB SCHEDULER] Next check in {seconds_until_midnight/3600:.1f} hours at {tomorrow.isoformat()}")
            
            # Sleep until midnight
            await asyncio.sleep(seconds_until_midnight)
            
            # Run the archive task
            await archive_expired_jobs()
            
        except Exception as e:
            print(f"❌ [JOB SCHEDULER] Error in scheduler: {e}")
            # Sleep for 1 hour before retrying
            await asyncio.sleep(3600)

def start_scheduler():
    """Start the background scheduler"""
    asyncio.create_task(scheduler_task())
