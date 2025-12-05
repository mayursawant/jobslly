"""
Server-Side Meta Tag Injection Middleware
Injects dynamic meta tags into HTML for SEO
"""
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')

async def get_job_meta(db, job_slug):
    """Get meta tags for a job detail page"""
    job = await db.jobs.find_one({
        "slug": job_slug,
        "is_approved": True,
        "is_deleted": {"$ne": True}
    }, {"_id": 0})
    
    if not job:
        return None
    
    # Format: [Job Name] Job at [Company Name] in [Location] | Jobslly
    job_title = job.get('title', 'Job')
    company = job.get('company', 'Top Company')
    location = job.get('location', 'Multiple Locations')
    
    title = f"{job_title} Job at {company} in {location} | Jobslly"
    
    # Format: Apply for the [Job Name] job at [Company Name] in [Location]. View eligibility, salary, skills, and apply online on Jobslly. Get job assistance and expert help to land this role.
    description = f"Apply for the {job_title} job at {company} in {location}. View eligibility, salary, skills, and apply online on Jobslly. Get job assistance and expert help to land this role."
    
    return {
        'title': title,
        'description': description,
        'og_title': f"{job_title} at {company}",
        'og_description': description,
        'og_type': 'article',
        'keywords': f"{job_title}, {company}, {location}, healthcare jobs, medical careers, job opportunities",
        'job_data': job  # Include full job data for server-side rendering
    }

async def get_blog_meta(db, blog_slug):
    """Get meta tags for a blog detail page"""
    blog = await db.blog_posts.find_one({
        "slug": blog_slug,
        "is_published": True
    })
    
    if not blog:
        return None
    
    title = blog.get('seo_title') or f"{blog['title']} | Jobslly Health Hub"
    description = blog.get('seo_description') or blog.get('excerpt', '')[:160]
    
    return {
        'title': title,
        'description': description,
        'og_title': blog['title'],
        'og_description': blog.get('excerpt', ''),
        'og_type': 'article',
        'keywords': ', '.join(blog.get('seo_keywords', []) + [blog.get('category', 'healthcare')])
    }

async def inject_meta_tags(html_content, path):
    """Inject dynamic meta tags into HTML based on path"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    meta_data = None
    
    # Detect page type from path
    if path.startswith('/jobs/') and path != '/jobs/' and path != '/jobs':
        # Job detail page
        slug = path.replace('/jobs/', '').strip('/')
        meta_data = await get_job_meta(db, slug)
    
    elif path.startswith('/blogs/') and path != '/blogs/' and path != '/blogs':
        # Blog detail page
        slug = path.replace('/blogs/', '').strip('/')
        meta_data = await get_blog_meta(db, slug)
    
    client.close()
    
    if not meta_data:
        return html_content
    
    # Replace title
    html_content = re.sub(
        r'<title>.*?</title>',
        f'<title>{meta_data["title"]}</title>',
        html_content
    )
    
    # Replace/add meta description
    if 'description' in meta_data:
        # Try to replace existing
        html_content = re.sub(
            r'<meta name="description" content=".*?" />',
            f'<meta name="description" content="{meta_data["description"]}" />',
            html_content
        )
    
    # Replace/add meta keywords
    if 'keywords' in meta_data:
        html_content = re.sub(
            r'<meta name="keywords" content=".*?" />',
            f'<meta name="keywords" content="{meta_data["keywords"]}" />',
            html_content
        )
    
    # Replace/add OG tags
    html_content = re.sub(
        r'<meta property="og:title" content=".*?" />',
        f'<meta property="og:title" content="{meta_data["og_title"]}" />',
        html_content
    )
    
    html_content = re.sub(
        r'<meta property="og:description" content=".*?" />',
        f'<meta property="og:description" content="{meta_data["og_description"]}" />',
        html_content
    )
    
    html_content = re.sub(
        r'<meta property="og:type" content=".*?" />',
        f'<meta property="og:type" content="{meta_data["og_type"]}" />',
        html_content
    )
    
    return html_content
