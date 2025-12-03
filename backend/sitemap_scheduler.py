#!/usr/bin/env python3
"""
Sitemap Auto-Update Scheduler
Runs continuously and updates sitemap every hour
"""
import time
import asyncio
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')
FRONTEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://jobslly.com').replace('/api', '')

async def generate_sitemap():
    """Generate sitemap XML from database"""
    client = AsyncIOMotorClient(MONGO_URL, tlsAllowInvalidCertificates=True)
    db = client[DB_NAME]
    
    # Fetch all approved, non-deleted jobs
    jobs = await db.jobs.find({
        "is_approved": True,
        "is_deleted": {"$ne": True}
    }).to_list(None)
    
    # Fetch all published blogs
    blogs = await db.blog_posts.find({
        "is_published": True
    }).to_list(None)
    
    client.close()
    
    # Generate XML
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Homepage
    xml_content += f'  <url>\n    <loc>{FRONTEND_URL}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n'
    
    # Static pages
    static_pages = ['/jobs', '/blogs', '/about', '/contact', '/login', '/register']
    for page in static_pages:
        xml_content += f'  <url>\n    <loc>{FRONTEND_URL}{page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
    
    # Job pages
    for job in jobs:
        slug = job.get('slug', job['id'])
        xml_content += f'  <url>\n    <loc>{FRONTEND_URL}/jobs/{slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n'
    
    # Blog pages
    for blog in blogs:
        slug = blog.get('slug', blog['id'])
        xml_content += f'  <url>\n    <loc>{FRONTEND_URL}/blog/{slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n'
    
    xml_content += '</urlset>'
    
    # Write to file
    sitemap_path = '/app/frontend/public/sitemap.xml'
    with open(sitemap_path, 'w') as f:
        f.write(xml_content)
    
    return len(jobs) + len(blogs)

def update_sitemap():
    """Run sitemap update"""
    try:
        print(f"[{datetime.now()}] Starting sitemap update...", flush=True)
        count = asyncio.run(generate_sitemap())
        print(f"[{datetime.now()}] ✓ Sitemap updated with {count} entries", flush=True)
    except Exception as e:
        print(f"[{datetime.now()}] ❌ Error updating sitemap: {e}", flush=True)

if __name__ == "__main__":
    print(f"[{datetime.now()}] Starting sitemap scheduler...", flush=True)
    print("Will update sitemap every hour", flush=True)
    
    # Update immediately on start
    update_sitemap()
    
    while True:
        try:
            # Wait 1 hour (3600 seconds)
            print(f"[{datetime.now()}] Sleeping for 1 hour...", flush=True)
            time.sleep(3600)
            
            # Then update again
            update_sitemap()
        except KeyboardInterrupt:
            print(f"\n[{datetime.now()}] Sitemap scheduler stopped")
            break
        except Exception as e:
            print(f"[{datetime.now()}] ❌ Scheduler error: {e}")
            # Wait 5 minutes before retrying on error
            time.sleep(300)
