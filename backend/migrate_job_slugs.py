#!/usr/bin/env python3
"""
Migration script to update all job slugs to new SEO format:
[job-name]-job-at-[company-name]-in-[location]-[id]
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import re
import os

MONGO_URL = "mongodb+srv://developer_db_user:uVNGhnh2jV2BMoJz@jobslly.x1lwomu.mongodb.net/"
DB_NAME = "jobslly_database"

def generate_new_slug(title: str, company: str, location: str, job_id: str) -> str:
    """Generate new SEO-friendly slug"""
    
    def clean_text(text: str) -> str:
        """Clean and convert text to slug format"""
        if not text:
            return ""
        # Convert to lowercase
        text = text.lower()
        # Remove special characters, keep only alphanumeric, spaces, and hyphens
        text = re.sub(r'[^a-z0-9\s-]', '', text)
        # Replace spaces and multiple hyphens with single hyphen
        text = re.sub(r'[\s-]+', '-', text)
        # Remove leading/trailing hyphens
        text = text.strip('-')
        return text
    
    # Clean each component
    title_slug = clean_text(title)
    company_slug = clean_text(company) if company else ""
    location_slug = clean_text(location) if location else ""
    
    # Build slug in format: [job-name]-job-at-[company-name]-in-[location]-[id]
    slug_parts = [title_slug]
    
    if company_slug:
        slug_parts.extend(["job-at", company_slug])
    
    if location_slug:
        slug_parts.extend(["in", location_slug])
    
    # Add ID at the end for uniqueness
    slug_parts.append(job_id[:8])  # Use first 8 chars of ID
    
    slug = "-".join(slug_parts)
    
    # Ensure slug is not empty
    if not slug:
        slug = f"job-{job_id[:8]}"
    
    return slug

async def migrate_slugs():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get all jobs
    all_jobs = await db.jobs.find({}, {'_id': 1, 'id': 1, 'title': 1, 'company': 1, 'location': 1, 'slug': 1}).to_list(None)
    
    print(f'Found {len(all_jobs)} jobs to update\n')
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for job in all_jobs:
        try:
            job_id = job.get('id')
            title = job.get('title', 'Job')
            company = job.get('company', '')
            location = job.get('location', '')
            old_slug = job.get('slug', '')
            
            # Generate new slug
            new_slug = generate_new_slug(title, company, location, job_id)
            
            # Check if slug needs updating
            if old_slug == new_slug:
                skipped_count += 1
                continue
            
            # Update the slug
            await db.jobs.update_one(
                {'_id': job['_id']},
                {'$set': {'slug': new_slug}}
            )
            
            updated_count += 1
            
            if updated_count % 50 == 0:
                print(f'Updated {updated_count} jobs...')
            
            # Show first 10 examples
            if updated_count <= 10:
                print(f'  {title[:40]:<40}')
                print(f'    Old: {old_slug}')
                print(f'    New: {new_slug}\n')
        
        except Exception as e:
            print(f'Error updating job {job.get("id", "unknown")}: {e}')
            error_count += 1
    
    print(f'\n✓ Migration complete!')
    print(f'  Updated: {updated_count} jobs')
    print(f'  Skipped (already correct): {skipped_count} jobs')
    print(f'  Errors: {error_count} jobs')
    
    client.close()

if __name__ == '__main__':
    asyncio.run(migrate_slugs())
