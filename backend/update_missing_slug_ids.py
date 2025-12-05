#!/usr/bin/env python3
"""
Migration script to update job slugs that are missing the job ID suffix.
Adds the job ID (first 8 chars) to slugs that don't already have it.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import re
import os

MONGO_URL = os.environ.get('MONGO_URL', "mongodb+srv://developer_db_user:uVNGhnh2jV2BMoJz@jobslly.x1lwomu.mongodb.net/")
DB_NAME = os.environ.get('DB_NAME', "jobslly_database")

def clean_text(text: str, max_length: int = None) -> str:
    """Clean and convert text to slug format"""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    text = text.strip('-')
    
    if max_length and len(text) > max_length:
        text = text[:max_length].rsplit('-', 1)[0]
    
    return text

def generate_new_slug(title: str, company: str, location: str, job_id: str) -> str:
    """Generate new SEO-friendly slug with job ID"""
    
    # Clean each component
    title_slug = clean_text(title, max_length=80)
    company_slug = clean_text(company) if company else ""
    location_slug = clean_text(location) if location else ""
    
    # Build slug in format: [job-name]-job-at-[company-name]-in-[location]-[id]
    slug_parts = [title_slug]
    
    if company_slug:
        slug_parts.extend(["job-at", company_slug])
    
    if location_slug:
        slug_parts.extend(["in", location_slug])
    
    # Add ID at the end for uniqueness (first 8 chars)
    slug_parts.append(job_id[:8])
    
    slug = "-".join(slug_parts)
    
    # Ensure slug is not empty
    if not slug:
        slug = f"job-{job_id[:8]}"
    elif len(slug) > 200:
        # Truncate and re-add ID
        slug = slug[:200].rsplit('-', 1)[0]
        slug = f"{slug}-{job_id[:8]}"
    
    return slug

async def migrate_slugs():
    client = AsyncIOMotorClient(
        MONGO_URL,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000
    )
    db = client[DB_NAME]
    
    print("🔍 Finding jobs with slugs missing job IDs...")
    
    # Get all jobs
    all_jobs = await db.jobs.find({}).to_list(None)
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for job in all_jobs:
        try:
            job_id = job.get('id')
            if not job_id:
                print(f"  ⚠️  Job has no ID, skipping: {job.get('title', 'unknown')}")
                error_count += 1
                continue
            
            title = job.get('title', 'Job')
            company = job.get('company', '')
            location = job.get('location', '')
            old_slug = job.get('slug', '')
            
            # Check if slug already contains the job ID (first 8 chars)
            job_id_short = job_id[:8]
            if job_id_short in old_slug:
                skipped_count += 1
                continue
            
            # Generate new slug with ID
            new_slug = generate_new_slug(title, company, location, job_id)
            
            # Update the slug
            await db.jobs.update_one(
                {'_id': job['_id']},
                {'$set': {'slug': new_slug}}
            )
            
            updated_count += 1
            
            # Show first 10 examples
            if updated_count <= 10:
                print(f"  ✓ Updated: {title[:40]}")
                print(f"    Old: {old_slug[:70]}")
                print(f"    New: {new_slug[:70]}\n")
            elif updated_count % 10 == 0:
                print(f"  ... {updated_count} jobs updated so far")
        
        except Exception as e:
            print(f"  ❌ Error updating job {job.get('id', 'unknown')}: {e}")
            error_count += 1
    
    print(f"\n✅ Migration complete!")
    print(f"   Updated: {updated_count} jobs")
    print(f"   Skipped (already have ID): {skipped_count} jobs")
    print(f"   Errors: {error_count} jobs")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(migrate_slugs())
