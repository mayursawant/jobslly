#!/usr/bin/env python3
"""
Migration script to convert old 'category' field to new 'categories' array field.

This script handles the schema migration from:
  OLD: category (string) - e.g., "doctors"
  NEW: categories (array) - e.g., ["doctors"]

Production database is still using the old schema, which causes filtering issues.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

async def migrate_category_schema():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 70)
    print("CATEGORY SCHEMA MIGRATION")
    print("Converting 'category' (string) to 'categories' (array)")
    print("=" * 70)
    
    # Step 1: Find all jobs with old 'category' field (string)
    jobs_with_old_schema = await db.jobs.find(
        {"category": {"$exists": True, "$type": "string"}},
        {"_id": 1, "id": 1, "title": 1, "category": 1}
    ).to_list(length=None)
    
    print(f"\nFound {len(jobs_with_old_schema)} jobs with old 'category' field (string)")
    
    if len(jobs_with_old_schema) == 0:
        print("\n✓ No jobs found with old schema. All jobs already migrated!")
        
        # Check if there are jobs with empty categories that need assignment
        jobs_empty_cats = await db.jobs.find(
            {"categories": {"$size": 0}},
            {"_id": 1, "title": 1}
        ).to_list(length=None)
        
        if len(jobs_empty_cats) > 0:
            print(f"\n⚠ WARNING: Found {len(jobs_empty_cats)} jobs with empty 'categories' arrays")
            print("These jobs may need category assignment.")
        
        client.close()
        return
    
    # Step 2: Migrate each job from category (string) to categories (array)
    migrated_count = 0
    skipped_count = 0
    error_count = 0
    
    for job in jobs_with_old_schema:
        job_id = job['_id']
        old_category = job.get('category')
        title = job.get('title', 'Unknown')
        
        try:
            # Convert single category string to array
            new_categories = [old_category] if old_category else []
            
            # Update the job: add 'categories' array and remove old 'category' field
            result = await db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {"categories": new_categories},
                    "$unset": {"category": ""}  # Remove old field
                }
            )
            
            if result.modified_count > 0:
                migrated_count += 1
                print(f"✓ Migrated '{title}': '{old_category}' -> {new_categories}")
            else:
                skipped_count += 1
                print(f"⚠ Skipped '{title}' (no changes needed)")
        
        except Exception as e:
            error_count += 1
            print(f"✗ Error migrating '{title}': {str(e)}")
    
    print(f"\n{migrated_count} jobs migrated successfully")
    print(f"{skipped_count} jobs skipped")
    print(f"{error_count} jobs had errors")
    
    # Step 3: Verify migration
    print("\n" + "=" * 70)
    print("VERIFICATION")
    print("=" * 70)
    
    # Check for any remaining old schema jobs
    remaining_old = await db.jobs.count_documents({"category": {"$exists": True, "$type": "string"}})
    print(f"\nJobs with old 'category' field: {remaining_old}")
    
    # Check new schema jobs
    new_schema_jobs = await db.jobs.count_documents({"categories": {"$exists": True}})
    print(f"Jobs with new 'categories' field: {new_schema_jobs}")
    
    # Check for jobs with empty categories
    empty_categories = await db.jobs.count_documents({"categories": {"$size": 0}})
    print(f"Jobs with empty 'categories' array: {empty_categories}")
    
    # Show category distribution
    pipeline = [
        {"$match": {"categories": {"$exists": True}}},
        {"$unwind": "$categories"},
        {"$group": {"_id": "$categories", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    category_counts = await db.jobs.aggregate(pipeline).to_list(length=None)
    
    print("\nCategory distribution:")
    for cat in category_counts:
        print(f"  {cat['_id']}: {cat['count']} jobs")
    
    # Handle empty categories
    if empty_categories > 0:
        print(f"\n⚠ WARNING: {empty_categories} jobs have empty categories arrays")
        print("You may need to run the category assignment script to fix these.")
    
    client.close()
    print("\n" + "=" * 70)
    print("MIGRATION COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    print("\n⚠ IMPORTANT: This script will modify your database!")
    print("It will convert 'category' (string) to 'categories' (array)")
    print("\nPress Ctrl+C to cancel, or wait 3 seconds to continue...")
    
    import time
    try:
        time.sleep(3)
        asyncio.run(migrate_category_schema())
    except KeyboardInterrupt:
        print("\n\nMigration cancelled by user.")
