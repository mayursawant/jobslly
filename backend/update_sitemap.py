#!/usr/bin/env python3
"""
Auto-update sitemap.xml when jobs are added/updated/deleted
This script should be called after any job database operation
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import xml.etree.ElementTree as ET
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')

async def update_sitemap():
    """Generate and save sitemap.xml to frontend public folder"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
    
    base_url = 'https://jobslly.com'
    
    # Static pages
    static_pages = [
        ('/', '1.0', 'daily'),
        ('/jobs/', '0.9', 'daily'),
        ('/blogs/', '0.8', 'daily'),
        ('/login/', '0.7', 'weekly'),
        ('/register/', '0.7', 'weekly'),
        ('/dashboard/', '0.6', 'weekly'),
        ('/contact-us/', '0.7', 'weekly'),
        ('/privacy-policy/', '0.5', 'monthly'),
        ('/terms-of-service/', '0.5', 'monthly'),
        ('/cookies/', '0.5', 'monthly'),
        ('/sitemap/', '0.5', 'monthly'),
    ]
    
    # Category pages
    category_pages = [
        ('/jobs/doctor', '0.9', 'daily'),
        ('/jobs/nursing', '0.9', 'daily'),
        ('/jobs/pharmacy', '0.9', 'daily'),
        ('/jobs/dentist', '0.9', 'daily'),
        ('/jobs/physiotherapy', '0.9', 'daily'),
        ('/jobs/medical-lab-technician', '0.9', 'daily'),
        ('/jobs/medical-science-liaison', '0.9', 'daily'),
        ('/jobs/pharmacovigilance', '0.9', 'daily'),
        ('/jobs/clinical-research', '0.9', 'daily'),
        ('/jobs/non-clinical-jobs', '0.9', 'daily'),
    ]
    
    static_pages.extend(category_pages)
    
    for path, priority, changefreq in static_pages:
        url_elem = ET.SubElement(urlset, "url")
        ET.SubElement(url_elem, "loc").text = f"{base_url}{path}"
        ET.SubElement(url_elem, "lastmod").text = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        ET.SubElement(url_elem, "changefreq").text = changefreq
        ET.SubElement(url_elem, "priority").text = priority
    
    # Dynamic job pages
    query = {
        "is_approved": True,
        "is_deleted": {"$ne": True},
        "$or": [
            {"expires_at": None},
            {"expires_at": {"$gt": datetime.now(timezone.utc)}}
        ]
    }
    
    jobs = await db.jobs.find(query).to_list(length=None)
    
    for job in jobs:
        url_elem = ET.SubElement(urlset, "url")
        job_identifier = job.get('slug', job['id'])
        ET.SubElement(url_elem, "loc").text = f"{base_url}/jobs/{job_identifier}"
        
        lastmod = job.get('updated_at') or job.get('created_at', datetime.now(timezone.utc))
        if isinstance(lastmod, str):
            lastmod = datetime.fromisoformat(lastmod)
        ET.SubElement(url_elem, "lastmod").text = lastmod.strftime('%Y-%m-%d')
        ET.SubElement(url_elem, "changefreq").text = "daily"
        ET.SubElement(url_elem, "priority").text = "0.80"
    
    # Blog pages
    blog_posts = await db.blog_posts.find({"is_published": True}).to_list(length=None)
    for post in blog_posts:
        url_elem = ET.SubElement(urlset, "url")
        ET.SubElement(url_elem, "loc").text = f"{base_url}/blogs/{post['slug']}/"
        
        lastmod = post.get('published_at') or post.get('created_at', datetime.now(timezone.utc))
        if isinstance(lastmod, str):
            lastmod = datetime.fromisoformat(lastmod)
        ET.SubElement(url_elem, "lastmod").text = lastmod.strftime('%Y-%m-%d')
        ET.SubElement(url_elem, "changefreq").text = "monthly"
        ET.SubElement(url_elem, "priority").text = "0.7"
    
    client.close()
    
    # Format and save
    xml_str = ET.tostring(urlset, encoding='unicode', method='xml')
    xml_formatted = f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_str}'
    
    # Write sitemap to both public and build directories
    sitemap_path_public = '/app/frontend/public/sitemap.xml'
    sitemap_path_build = '/app/frontend/build/sitemap.xml'
    
    with open(sitemap_path_public, 'w') as f:
        f.write(xml_formatted)
    
    # Also copy to build directory for production serving
    try:
        with open(sitemap_path_build, 'w') as f:
            f.write(xml_formatted)
    except Exception as e:
        print(f"Note: Could not write to build directory: {e}")
    
    return len(jobs)

if __name__ == "__main__":
    job_count = asyncio.run(update_sitemap())
    print(f"✓ Sitemap updated with {job_count} jobs")
