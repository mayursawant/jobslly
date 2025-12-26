"""
Slug generation utilities for HealthCare Jobs API.
"""
import re
from database import db


def generate_slug(title: str, company: str = None, location: str = None, job_id: str = None) -> str:
    """Generate SEO-friendly slug from job title, company, location, and job ID"""
    
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
    
    title_slug = clean_text(title, max_length=80)
    company_slug = clean_text(company, max_length=50) if company else ""
    location_slug = clean_text(location, max_length=40) if location else ""
    
    slug_parts = [title_slug]
    
    if company_slug:
        slug_parts.extend(["job-at", company_slug])
    
    if location_slug:
        slug_parts.extend(["in", location_slug])
    
    if job_id:
        slug_parts.append(job_id[:8])
    
    slug = "-".join(slug_parts)
    
    if not slug:
        slug = f"job-{job_id[:8]}" if job_id else "job"
    elif len(slug) > 200:
        slug = slug[:200].rsplit('-', 1)[0]
        if job_id:
            slug = f"{slug}-{job_id[:8]}"
    
    return slug


async def ensure_unique_slug(base_slug: str, job_id: str = None) -> str:
    """Ensure slug is unique by appending number if necessary"""
    slug = base_slug
    counter = 1
    
    while True:
        query = {"slug": slug}
        if job_id:
            query["id"] = {"$ne": job_id}
        
        existing = await db.jobs.find_one(query)
        if not existing:
            return slug
        
        slug = f"{base_slug}-{counter}"
        counter += 1
