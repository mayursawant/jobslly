#!/usr/bin/env python3
"""
Fix inconsistent category names in production database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://developer_db_user:uVNGhnh2jV2BMoJz@jobslly.x1lwomu.mongodb.net/"
DB_NAME = "jobslly_database"

# Mapping of incorrect -> correct category names
CATEGORY_FIXES = {
    'dentist': 'dentists',
    'pharmacy': 'pharmacists',
    'physiotherapy': 'physiotherapists',
    'nurse': 'nurses',
    'doctor': 'doctors'
}

async def fix_categories():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 70)
    print("FIXING CATEGORY NAMES IN PRODUCTION")
    print("=" * 70)
    
    # Get all jobs
    all_jobs = await db.jobs.find({}).to_list(length=None)
    
    fixed_count = 0
    
    for job in all_jobs:
        job_id = job['_id']
        old_categories = job.get('categories', [])
        
        # Fix category names
        new_categories = []
        changed = False
        
        for cat in old_categories:
            if cat in CATEGORY_FIXES:
                new_categories.append(CATEGORY_FIXES[cat])
                changed = True
                print(f"✓ Fixing: '{cat}' → '{CATEGORY_FIXES[cat]}' in job '{job.get('title', 'N/A')}'")
            else:
                new_categories.append(cat)
        
        # Remove duplicates while preserving order
        new_categories = list(dict.fromkeys(new_categories))
        
        # Update if changed
        if changed or new_categories != old_categories:
            await db.jobs.update_one(
                {"_id": job_id},
                {"$set": {"categories": new_categories}}
            )
            fixed_count += 1
    
    print(f"\n{fixed_count} jobs updated")
    
    # Verify results
    print("\n" + "=" * 70)
    print("VERIFICATION - Category distribution after fix:")
    print("=" * 70)
    
    query = {"is_approved": True, "is_deleted": {"$ne": True}}
    active_jobs = await db.jobs.find(query).to_list(length=None)
    
    category_counts = {}
    for job in active_jobs:
        categories = job.get('categories', [])
        for cat in categories:
            if cat:
                category_counts[cat] = category_counts.get(cat, 0) + 1
    
    for cat, count in sorted(category_counts.items()):
        print(f"  '{cat}': {count} jobs")
    
    client.close()
    print("\n✅ Category standardization complete!")

if __name__ == "__main__":
    asyncio.run(fix_categories())
