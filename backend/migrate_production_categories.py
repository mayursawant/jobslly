#!/usr/bin/env python3
"""
Production Category Migration Script

PROBLEMS FOUND:
- 26 jobs have None/null values in categories arrays
- Inconsistent naming: "pharmacy" vs "pharmacists", "dentist" vs "dentists", etc.
- Inconsistent casing: "Doctors" vs "doctors"

SOLUTION:
1. Remove None/null values from categories arrays
2. Standardize category names to match frontend expectations
3. Assign default category to jobs with empty categories after cleanup
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://developer_db_user:uVNGhnh2jV2BMoJz@jobslly.x1lwomu.mongodb.net/"
DB_NAME = "jobslly_database"

# Category standardization mapping
CATEGORY_MAPPING = {
    # Capitalize variations
    "Doctors": "doctors",
    "Nurses": "nurses",
    "Dentists": "dentists",
    "Pharmacists": "pharmacists",
    "Physiotherapists": "physiotherapists",
    
    # Singular to plural
    "pharmacy": "pharmacists",
    "dentist": "dentists",
    "physiotherapy": "physiotherapists",
    "doctor": "doctors",
    "nurse": "nurses",
    
    # Already correct (keep as-is)
    "doctors": "doctors",
    "pharmacists": "pharmacists",
    "dentists": "dentists",
    "physiotherapists": "physiotherapists",
    "nurses": "nurses"
}

async def migrate_production_categories():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 70)
    print("PRODUCTION CATEGORY MIGRATION")
    print("=" * 70)
    
    # Step 1: Get all jobs with categories
    all_jobs = await db.jobs.find({}, {"_id": 1, "id": 1, "title": 1, "categories": 1, "is_deleted": 1}).to_list(length=None)
    
    print(f"\nTotal jobs in database: {len(all_jobs)}")
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    # Track what changes were made
    changes_summary = {
        "removed_none": 0,
        "standardized": 0,
        "assigned_default": 0
    }
    
    for job in all_jobs:
        job_id = job['_id']
        title = job.get('title', 'Unknown')
        old_categories = job.get('categories', [])
        is_deleted = job.get('is_deleted', False)
        
        try:
            # Skip if no categories field
            if 'categories' not in job:
                continue
            
            # Step 1: Remove None values and standardize
            new_categories = []
            had_none = False
            had_changes = False
            
            for cat in old_categories:
                if cat is None or cat == "":
                    had_none = True
                    changes_summary["removed_none"] += 1
                    continue
                
                # Standardize the category name
                standardized_cat = CATEGORY_MAPPING.get(cat, cat)
                
                if standardized_cat != cat:
                    had_changes = True
                    changes_summary["standardized"] += 1
                
                # Avoid duplicates
                if standardized_cat not in new_categories:
                    new_categories.append(standardized_cat)
            
            # Step 2: If categories is now empty, assign a default based on title
            if len(new_categories) == 0:
                title_lower = title.lower()
                
                # Try to infer category from title
                if any(word in title_lower for word in ['doctor', 'physician', 'medical', 'surgeon']):
                    new_categories = ['doctors']
                elif any(word in title_lower for word in ['nurse', 'nursing']):
                    new_categories = ['nurses']
                elif any(word in title_lower for word in ['pharma', 'chemist']):
                    new_categories = ['pharmacists']
                elif any(word in title_lower for word in ['dental', 'dentist']):
                    new_categories = ['dentists']
                elif any(word in title_lower for word in ['physio', 'therapy']):
                    new_categories = ['physiotherapists']
                else:
                    # Default to doctors for healthcare jobs
                    new_categories = ['doctors']
                
                changes_summary["assigned_default"] += 1
                had_changes = True
            
            # Step 3: Update if there were any changes
            if had_none or had_changes:
                result = await db.jobs.update_one(
                    {"_id": job_id},
                    {"$set": {"categories": new_categories}}
                )
                
                if result.modified_count > 0:
                    updated_count += 1
                    deleted_tag = " (DELETED)" if is_deleted else ""
                    print(f"✓ Updated '{title}'{deleted_tag}")
                    print(f"  Old: {old_categories}")
                    print(f"  New: {new_categories}")
                else:
                    skipped_count += 1
            else:
                skipped_count += 1
        
        except Exception as e:
            error_count += 1
            print(f"✗ Error updating '{title}': {str(e)}")
    
    print(f"\n" + "=" * 70)
    print("MIGRATION SUMMARY")
    print("=" * 70)
    print(f"Jobs updated: {updated_count}")
    print(f"Jobs skipped (no changes needed): {skipped_count}")
    print(f"Jobs with errors: {error_count}")
    print(f"\nChanges breakdown:")
    print(f"  - Removed None values: {changes_summary['removed_none']}")
    print(f"  - Standardized names: {changes_summary['standardized']}")
    print(f"  - Assigned default categories: {changes_summary['assigned_default']}")
    
    # Verify the results
    print(f"\n" + "=" * 70)
    print("POST-MIGRATION VERIFICATION")
    print("=" * 70)
    
    # Check for remaining None values
    jobs_with_none = await db.jobs.count_documents({"categories": None})
    print(f"\nJobs with None in categories: {jobs_with_none}")
    
    # Check for empty categories
    empty_categories = await db.jobs.count_documents({"categories": {"$size": 0}})
    print(f"Jobs with empty categories array: {empty_categories}")
    
    # Show new category distribution (active jobs only)
    pipeline = [
        {"$match": {"categories": {"$exists": True, "$type": "array"}, "is_deleted": {"$ne": True}}},
        {"$unwind": "$categories"},
        {"$group": {"_id": "$categories", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    category_counts = await db.jobs.aggregate(pipeline).to_list(length=None)
    
    print(f"\nCategory distribution (active jobs):")
    for cat in category_counts:
        print(f"  {cat['_id']}: {cat['count']} jobs")
    
    client.close()
    
    print(f"\n" + "=" * 70)
    print("MIGRATION COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    print("\n⚠️  IMPORTANT: This will modify your PRODUCTION database!")
    print("=" * 70)
    print("Changes to be made:")
    print("  1. Remove None/null values from categories")
    print("  2. Standardize category names:")
    print("     - 'pharmacy' → 'pharmacists'")
    print("     - 'dentist' → 'dentists'")
    print("     - 'physiotherapy' → 'physiotherapists'")
    print("     - 'Doctors' → 'doctors'")
    print("  3. Assign default categories to empty arrays")
    print("=" * 70)
    print("\nPress Ctrl+C to cancel, or wait 5 seconds to continue...")
    
    import time
    try:
        time.sleep(5)
        asyncio.run(migrate_production_categories())
    except KeyboardInterrupt:
        print("\n\nMigration cancelled by user.")
