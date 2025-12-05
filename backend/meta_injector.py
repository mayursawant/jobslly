"""
Server-Side Meta Tag Injection Middleware
Injects dynamic meta tags into HTML for SEO
"""
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import html

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')

def clean_html_for_meta(text):
    """Remove HTML tags and decode entities for meta descriptions"""
    if not text:
        return ""
    
    # Decode HTML entities (e.g., &lt; to <, &quot; to ")
    text = html.unescape(text)
    
    # Remove all HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove extra whitespace and newlines
    text = re.sub(r'\s+', ' ', text)
    
    # Trim
    text = text.strip()
    
    return text

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

def generate_job_html_content(job):
    """Generate server-side rendered HTML for job content (SEO-friendly)"""
    # Clean and escape all text fields to prevent HTML injection
    job_title = html.escape(job.get('title', 'Job Opening'))
    company = html.escape(job.get('company', 'Company'))
    location = html.escape(job.get('location', 'Location'))
    
    # For description, if it contains HTML, keep it; otherwise escape it
    description = job.get('description', 'No description available')
    # Description might already be HTML formatted (from rich text editor), so we keep it as-is
    # But we should at least decode any double-encoded entities
    description = html.unescape(description) if description else 'No description available'
    
    salary_min = job.get('salary_min', '')
    salary_max = job.get('salary_max', '')
    currency = job.get('currency', 'INR')
    job_type = job.get('job_type', 'full_time').replace('_', ' ').title()
    
    # Format salary
    salary_text = ''
    if salary_min and salary_max:
        salary_text = f"{currency} {salary_min} - {salary_max}"
    elif salary_min:
        salary_text = f"{currency} {salary_min}+"
    elif salary_max:
        salary_text = f"Up to {currency} {salary_max}"
    else:
        salary_text = "Competitive Salary"
    
    # Get categories/skills
    categories = job.get('categories', [])
    skills_html = ''
    if categories:
        skills_html = '<div class="job-skills"><h3>Categories</h3><ul>'
        for cat in categories:
            skills_html += f'<li>{cat}</li>'
        skills_html += '</ul></div>'
    
    # Get requirements
    requirements = job.get('requirements', [])
    requirements_html = ''
    if requirements:
        requirements_html = '<div class="job-requirements"><h3>Requirements</h3><ul>'
        for req in requirements:
            requirements_html += f'<li>{req}</li>'
        requirements_html += '</ul></div>'
    
    # Get benefits
    benefits = job.get('benefits', [])
    benefits_html = ''
    if benefits:
        benefits_html = '<div class="job-benefits"><h3>Benefits</h3><ul>'
        for benefit in benefits:
            benefits_html += f'<li>{benefit}</li>'
        benefits_html += '</ul></div>'
    
    # Generate full HTML (hidden but crawlable)
    ssr_content = f'''
    <div id="ssr-job-content" style="display:none;" itemscope itemtype="https://schema.org/JobPosting">
        <h1 itemprop="title">{job_title}</h1>
        <div class="job-company" itemprop="hiringOrganization" itemscope itemtype="https://schema.org/Organization">
            <span itemprop="name">{company}</span>
        </div>
        <div class="job-location" itemprop="jobLocation" itemscope itemtype="https://schema.org/Place">
            <span itemprop="address">{location}</span>
        </div>
        <div class="job-salary" itemprop="baseSalary">
            <span>{salary_text}</span>
        </div>
        <div class="job-type">
            <span itemprop="employmentType">{job_type}</span>
        </div>
        <div class="job-description" itemprop="description">
            <h2>Job Description</h2>
            <p>{description}</p>
        </div>
        {skills_html}
        {requirements_html}
        {benefits_html}
        <div class="job-apply">
            <a href="/jobs/{job.get('slug', '')}" class="apply-button">Apply Now</a>
        </div>
    </div>
    '''
    return ssr_content

async def inject_meta_tags(html_content, path):
    """Inject dynamic meta tags and SSR content into HTML based on path"""
    # Create MongoDB client with proper connection settings
    if not MONGO_URL or not DB_NAME:
        return html_content
    
    try:
        client = AsyncIOMotorClient(
            MONGO_URL,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
            socketTimeoutMS=30000
        )
        db = client[DB_NAME]
        
        meta_data = None
        is_job_page = False
        
        # Detect page type from path
        if path.startswith('/jobs/') and path != '/jobs/' and path != '/jobs':
            # Job detail page
            slug = path.replace('/jobs/', '').strip('/')
            meta_data = await get_job_meta(db, slug)
            is_job_page = True
        
        elif path.startswith('/blogs/') and path != '/blogs/' and path != '/blogs':
            # Blog detail page
            slug = path.replace('/blogs/', '').strip('/')
            meta_data = await get_blog_meta(db, slug)
        
        client.close()
        
    except Exception as e:
        # Log error but don't crash - return original HTML
        return html_content
    
    if not meta_data:
        return html_content
    
    # Escape all meta data to prevent HTML/quote issues in attributes
    safe_title = html.escape(meta_data["title"])
    safe_description = html.escape(meta_data["description"])
    safe_keywords = html.escape(meta_data["keywords"])
    safe_og_title = html.escape(meta_data["og_title"])
    safe_og_description = html.escape(meta_data["og_description"])
    
    # Replace title
    html_content = re.sub(
        r'<title>.*?</title>',
        f'<title>{safe_title}</title>',
        html_content,
        count=1
    )
    
    # Replace existing meta description (handles both spaced and minified formats)
    html_content = re.sub(
        r'<meta name="description" content=".*?"[^>]*>',
        f'<meta name="description" content="{safe_description}"/>',
        html_content,
        count=1
    )
    
    # Replace existing meta keywords
    html_content = re.sub(
        r'<meta name="keywords" content=".*?"[^>]*>',
        f'<meta name="keywords" content="{safe_keywords}"/>',
        html_content,
        count=1
    )
    
    # Replace existing OG tags
    html_content = re.sub(
        r'<meta property="og:title" content=".*?"[^>]*>',
        f'<meta property="og:title" content="{safe_og_title}"/>',
        html_content,
        count=1
    )
    
    html_content = re.sub(
        r'<meta property="og:description" content=".*?"[^>]*>',
        f'<meta property="og:description" content="{safe_og_description}"/>',
        html_content,
        count=1
    )
    
    html_content = re.sub(
        r'<meta property="og:type" content=".*?"[^>]*>',
        f'<meta property="og:type" content="{html.escape(meta_data["og_type"])}"/>',
        html_content,
        count=1
    )
    
    # Replace Twitter card tags
    html_content = re.sub(
        r'<meta name="twitter:title" content=".*?"[^>]*>',
        f'<meta name="twitter:title" content="{safe_og_title}"/>',
        html_content,
        count=1
    )
    
    html_content = re.sub(
        r'<meta name="twitter:description" content=".*?"[^>]*>',
        f'<meta name="twitter:description" content="{safe_og_description}"/>',
        html_content,
        count=1
    )
    
    # For job pages, inject server-side rendered content
    if is_job_page and 'job_data' in meta_data:
        job_html = generate_job_html_content(meta_data['job_data'])
        # Inject SSR content right after <body> tag
        html_content = html_content.replace('<body>', f'<body>{job_html}', 1)
    
    return html_content
