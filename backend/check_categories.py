#!/usr/bin/env python3
"""
Script to check current category values in the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

async def check_categories():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get all unique category values from the jobs collection
    pipeline = [
        {"$unwind": "$categories"},
        {"$group": {"_id": "$categories"}},
        {"$sort": {"_id": 1}}
    ]
    
    unique_categories = await db.jobs.aggregate(pipeline).to_list(length=None)
    
    print("Current unique categories in database:")
    print("=" * 50)
    for cat in unique_categories:
        print(f"  - '{cat['_id']}'")
    
    # Count jobs by category
    print("\n\nJob counts by category:")
    print("=" * 50)
    for cat in unique_categories:
        count = await db.jobs.count_documents({"categories": cat['_id']})
        print(f"  - '{cat['_id']}': {count} jobs")
    
    # Show sample jobs for each category
    print("\n\nSample job titles by category:")
    print("=" * 50)
    for cat in unique_categories:
        jobs = await db.jobs.find(
            {"categories": cat['_id']},
            {"title": 1, "categories": 1}
        ).limit(2).to_list(length=2)
        print(f"\n{cat['_id']}:")
        for job in jobs:
            print(f"  - {job['title']}")
            print(f"    Categories: {job.get('categories', [])}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_categories())
