#!/usr/bin/env python3
"""
Migration script to convert string created_at and expires_at fields back to datetime objects.
This fixes jobs created after the initial migration that were incorrectly saved as ISO strings.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

MONGO_URL = os.environ.get('MONGO_URL', "mongodb+srv://developer_db_user:uVNGhnh2jV2BMoJz@jobslly.x1lwomu.mongodb.net/")
DB_NAME = os.environ.get('DB_NAME', "jobslly_database")

async def migrate_string_dates():
    client = AsyncIOMotorClient(
        MONGO_URL,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000
    )
    db = client[DB_NAME]
    
    print("🔍 Finding jobs with string date fields...")
    
    # Get all jobs
    all_jobs = await db.jobs.find({}).to_list(None)
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for job in all_jobs:
        try:
            job_id = job.get('id')
            created_at = job.get('created_at')
            expires_at = job.get('expires_at')
            
            update_fields = {}
            
            # Check if created_at is a string and convert to datetime
            if isinstance(created_at, str):
                try:
                    # Parse ISO format string to datetime
                    dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    update_fields['created_at'] = dt
                except Exception as e:
                    print(f"  ⚠️  Error parsing created_at for job {job.get('title', 'unknown')}: {e}")
                    error_count += 1
                    continue
            
            # Check if expires_at is a string and convert to datetime
            if expires_at and isinstance(expires_at, str):
                try:
                    dt = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
                    update_fields['expires_at'] = dt
                except Exception as e:
                    print(f"  ⚠️  Error parsing expires_at for job {job.get('title', 'unknown')}: {e}")
            
            # Update if needed
            if update_fields:
                await db.jobs.update_one(
                    {'_id': job['_id']},
                    {'$set': update_fields}
                )
                updated_count += 1
                
                if updated_count <= 10:
                    print(f"  ✓ Updated: {job.get('title', 'unknown')[:50]}")
                elif updated_count % 10 == 0:
                    print(f"  ... {updated_count} jobs updated so far")
            else:
                skipped_count += 1
                
        except Exception as e:
            print(f"  ❌ Error updating job {job.get('id', 'unknown')}: {e}")
            error_count += 1
    
    print(f"\n✅ Migration complete!")
    print(f"   Updated: {updated_count} jobs")
    print(f"   Skipped (already datetime): {skipped_count} jobs")
    print(f"   Errors: {error_count} jobs")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(migrate_string_dates())
