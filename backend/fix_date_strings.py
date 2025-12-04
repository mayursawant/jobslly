#!/usr/bin/env python3
"""
Migration script to convert string created_at dates to datetime objects in MongoDB
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

MONGO_URL = "mongodb+srv://developer_db_user:uVNGhnh2jV2BMoJz@jobslly.x1lwomu.mongodb.net/"
DB_NAME = "jobslly_database"

async def fix_date_fields():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get all jobs with string created_at
    all_jobs = await db.jobs.find({}, {'_id': 1, 'created_at': 1, 'expires_at': 1}).to_list(None)
    
    fixed_count = 0
    error_count = 0
    
    print(f'Found {len(all_jobs)} jobs to check\n')
    
    for job in all_jobs:
        job_id = job['_id']
        updates = {}
        
        # Fix created_at
        created = job.get('created_at')
        if isinstance(created, str):
            try:
                # Parse ISO format string to datetime
                dt = datetime.fromisoformat(created.replace('Z', '+00:00'))
                updates['created_at'] = dt
            except Exception as e:
                print(f'Error parsing created_at for job {job_id}: {e}')
                error_count += 1
                continue
        
        # Fix expires_at if exists
        expires = job.get('expires_at')
        if expires and isinstance(expires, str):
            try:
                dt = datetime.fromisoformat(expires.replace('Z', '+00:00'))
                updates['expires_at'] = dt
            except Exception as e:
                print(f'Warning: Could not parse expires_at for job {job_id}: {e}')
        
        # Update if needed
        if updates:
            await db.jobs.update_one({'_id': job_id}, {'$set': updates})
            fixed_count += 1
            
            if fixed_count % 50 == 0:
                print(f'Fixed {fixed_count} jobs...')
    
    print(f'\n✓ Migration complete!')
    print(f'  Fixed: {fixed_count} jobs')
    print(f'  Errors: {error_count} jobs')
    
    # Verify
    sample = await db.jobs.find_one({'created_at': {'$type': 'string'}})
    if sample:
        print(f'\n⚠️  Warning: Still found jobs with string dates')
    else:
        print(f'\n✓ All created_at fields are now datetime objects')
    
    client.close()

if __name__ == '__main__':
    asyncio.run(fix_date_fields())
