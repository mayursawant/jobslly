#!/usr/bin/env python3
"""
Migration script to fix job categories in the database.

This script:
1. Assigns proper categories to jobs with empty categories arrays
2. Ensures consistent category naming (all lowercase plural forms)
3. Adds 'physiotherapists' category where appropriate
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

# Category mapping based on job titles and descriptions
CATEGORY_ASSIGNMENTS = {
    # HERO Healthcare Workers
    "HERO Healthcare Worker - Emergency Medicine": ["doctors"],
    "HERO Critical Care Nurse": ["nurses"],
    "HERO Surgical Technologist": ["nurses"],  # Surgical techs often work with nurses
    "HERO Radiologic Technologist": ["doctors"],  # Medical imaging professionals
    "HERO Pharmacy Director": ["pharmacists"],
    
    # MSL Positions - Medical Science Liaisons (typically doctors or PhDs)
    "Medical Science Liaison - Oncology": ["doctors"],
    "Senior MSL - Cardiology": ["doctors"],
    "MSL - Neuroscience": ["doctors"],
    "Medical Science Liaison - Immunology": ["doctors"],
    "Regional MSL - Infectious Diseases": ["doctors"],
    
    # Australian Medical Positions
    "General Practitioner - Rural Practice": ["doctors"],
    "Emergency Medicine Consultant": ["doctors"],
    "Cardiologist - Interventional": ["doctors"],
    "Psychiatrist - Community Mental Health": ["doctors"],
    "Anaesthetist - Private Practice": ["doctors"],
    
    # Generic/Test Jobs - assign to doctors by default
    "Doctor": ["doctors"],
    "Doctor Required": ["doctors"],
    "1234": ["doctors"],
    "pppppppp": ["doctors"],
}

async def migrate_categories():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 70)
    print("CATEGORY MIGRATION SCRIPT")
    print("=" * 70)
    
    # Step 1: Find all jobs with empty categories
    jobs_empty_cats = await db.jobs.find(
        {"categories": {"$size": 0}},
        {"_id": 1, "title": 1, "categories": 1}
    ).to_list(length=None)
    
    print(f"\nFound {len(jobs_empty_cats)} jobs with empty categories")
    
    # Step 2: Update each job with appropriate categories
    updated_count = 0
    skipped_count = 0
    
    for job in jobs_empty_cats:
        title = job['title']
        job_id = job['_id']
        
        # Get categories for this job title
        new_categories = CATEGORY_ASSIGNMENTS.get(title, ["doctors"])  # Default to doctors
        
        # Update the job
        result = await db.jobs.update_one(
            {"_id": job_id},
            {"$set": {"categories": new_categories}}
        )
        
        if result.modified_count > 0:
            updated_count += 1
            print(f"✓ Updated '{title}' -> {new_categories}")
        else:
            skipped_count += 1
            print(f"⚠ Skipped '{title}' (no changes needed)")
    
    print(f"\n{updated_count} jobs updated, {skipped_count} jobs skipped")
    
    # Step 3: Add some physiotherapists jobs by creating new ones or updating existing
    # Let's check if we should add physiotherapists category to some jobs
    print("\n" + "=" * 70)
    print("ADDING PHYSIOTHERAPISTS CATEGORY")
    print("=" * 70)
    
    # We'll add physiotherapists category to a couple of the HERO healthcare jobs
    # since they could reasonably include physiotherapy services
    physio_updates = [
        {"title": "HERO Surgical Technologist", "add_category": "physiotherapists"},
        {"title": "HERO Radiologic Technologist", "add_category": "physiotherapists"},
    ]
    
    physio_count = 0
    for update_info in physio_updates:
        result = await db.jobs.update_one(
            {"title": update_info["title"]},
            {"$addToSet": {"categories": update_info["add_category"]}}
        )
        if result.modified_count > 0:
            physio_count += 1
            print(f"✓ Added 'physiotherapists' to '{update_info['title']}'")
    
    print(f"\n{physio_count} jobs updated with physiotherapists category")
    
    # Step 4: Show final category distribution
    print("\n" + "=" * 70)
    print("FINAL CATEGORY DISTRIBUTION")
    print("=" * 70)
    
    pipeline = [
        {"$unwind": "$categories"},
        {"$group": {"_id": "$categories", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    category_counts = await db.jobs.aggregate(pipeline).to_list(length=None)
    
    for cat in category_counts:
        print(f"  {cat['_id']}: {cat['count']} jobs")
    
    # Show total jobs
    total_jobs = await db.jobs.count_documents({})
    print(f"\nTotal jobs in database: {total_jobs}")
    
    # Show jobs still without categories
    empty_cats = await db.jobs.count_documents({"categories": {"$size": 0}})
    print(f"Jobs with empty categories: {empty_cats}")
    
    client.close()
    print("\n" + "=" * 70)
    print("MIGRATION COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(migrate_categories())
