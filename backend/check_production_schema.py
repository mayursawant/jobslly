#!/usr/bin/env python3
"""
Check production database schema for category/categories fields
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://developer_db_user:uVNGhnh2jV2BMoJz@jobslly.x1lwomu.mongodb.net/"
DB_NAME = "test_database"  # Replace with actual production DB name if different

async def check_production_schema():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 70)
    print("PRODUCTION DATABASE SCHEMA CHECK")
    print("=" * 70)
    
    # Total jobs
    total_jobs = await db.jobs.count_documents({})
    print(f"\nTotal jobs in production: {total_jobs}")
    
    # Check for old schema: category (string)
    old_schema_count = await db.jobs.count_documents({"category": {"$exists": True, "$type": "string"}})
    print(f"\nJobs with OLD schema 'category' (string): {old_schema_count}")
    
    # Check for new schema: categories (array)
    new_schema_count = await db.jobs.count_documents({"categories": {"$exists": True, "$type": "array"}})
    print(f"Jobs with NEW schema 'categories' (array): {new_schema_count}")
    
    # Check for jobs with BOTH fields
    both_fields = await db.jobs.count_documents({
        "category": {"$exists": True},
        "categories": {"$exists": True}
    })
    print(f"Jobs with BOTH fields: {both_fields}")
    
    # Check for jobs with NEITHER field
    neither_field = await db.jobs.count_documents({
        "category": {"$exists": False},
        "categories": {"$exists": False}
    })
    print(f"Jobs with NEITHER field: {neither_field}")
    
    # Check for jobs with empty categories array
    empty_categories = await db.jobs.count_documents({"categories": {"$size": 0}})
    print(f"Jobs with empty 'categories' array: {empty_categories}")
    
    print("\n" + "=" * 70)
    print("SAMPLE DATA")
    print("=" * 70)
    
    # Show samples of old schema
    if old_schema_count > 0:
        print(f"\nSample jobs with OLD 'category' (string) schema:")
        old_jobs = await db.jobs.find(
            {"category": {"$exists": True, "$type": "string"}},
            {"title": 1, "category": 1, "categories": 1}
        ).limit(3).to_list(length=3)
        for i, job in enumerate(old_jobs, 1):
            print(f"{i}. {job.get('title', 'N/A')}")
            print(f"   category: {job.get('category', 'N/A')}")
            print(f"   categories: {job.get('categories', 'N/A')}")
    
    # Show samples of new schema
    if new_schema_count > 0:
        print(f"\nSample jobs with NEW 'categories' (array) schema:")
        new_jobs = await db.jobs.find(
            {"categories": {"$exists": True, "$type": "array"}},
            {"title": 1, "category": 1, "categories": 1}
        ).limit(3).to_list(length=3)
        for i, job in enumerate(new_jobs, 1):
            print(f"{i}. {job.get('title', 'N/A')}")
            print(f"   category: {job.get('category', 'N/A')}")
            print(f"   categories: {job.get('categories', 'N/A')}")
    
    # Show category distribution for new schema
    if new_schema_count > 0:
        print("\n" + "=" * 70)
        print("CATEGORY DISTRIBUTION (NEW SCHEMA)")
        print("=" * 70)
        
        pipeline = [
            {"$match": {"categories": {"$exists": True, "$type": "array"}}},
            {"$unwind": "$categories"},
            {"$group": {"_id": "$categories", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        
        category_counts = await db.jobs.aggregate(pipeline).to_list(length=None)
        
        for cat in category_counts:
            print(f"  {cat['_id']}: {cat['count']} jobs")
    
    # Show category distribution for old schema
    if old_schema_count > 0:
        print("\n" + "=" * 70)
        print("CATEGORY DISTRIBUTION (OLD SCHEMA)")
        print("=" * 70)
        
        pipeline = [
            {"$match": {"category": {"$exists": True, "$type": "string"}}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        
        category_counts = await db.jobs.aggregate(pipeline).to_list(length=None)
        
        for cat in category_counts:
            print(f"  {cat['_id']}: {cat['count']} jobs")
    
    client.close()
    
    print("\n" + "=" * 70)
    print("RECOMMENDATIONS")
    print("=" * 70)
    
    if old_schema_count > 0:
        print(f"\n⚠️  SCHEMA MISMATCH DETECTED!")
        print(f"   {old_schema_count} jobs still use old 'category' (string) field")
        print(f"   {new_schema_count} jobs use new 'categories' (array) field")
        print(f"\n✅ ACTION REQUIRED: Run migration to convert old schema to new schema")
    elif empty_categories > 0:
        print(f"\n⚠️  EMPTY CATEGORIES DETECTED!")
        print(f"   {empty_categories} jobs have empty 'categories' arrays")
        print(f"\n✅ ACTION REQUIRED: Run category assignment script")
    else:
        print(f"\n✅ DATABASE SCHEMA IS CONSISTENT!")
        print(f"   All {new_schema_count} jobs use the new 'categories' (array) schema")

if __name__ == "__main__":
    asyncio.run(check_production_schema())
