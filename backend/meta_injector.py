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

def generate_job_jsonld(job):
    """Generate JSON-LD structured data for JobPosting schema (Google Jobs compliant)"""
    import json
    from datetime import datetime
    
    job_title = job.get('title', 'Job Opening')
    company = job.get('company', 'Company')
    location = job.get('location', 'Location')
    description = clean_html_for_meta(job.get('description', 'No description available'))
    salary_min = job.get('salary_min', '')
    salary_max = job.get('salary_max', '')
    currency = job.get('currency', 'INR')
    job_type = job.get('job_type', 'FULL_TIME').upper().replace(' ', '_')
    created_at = job.get('created_at')
    expires_at = job.get('expires_at')
    slug = job.get('slug', '')
    
    # Format salary - only include if numeric
    def is_numeric(val):
        """Check if value is numeric (can be converted to float)"""
        if not val:
            return False
        try:
            float(str(val).replace(',', ''))
            return True
        except (ValueError, AttributeError):
            return False
    
    salary_data = {}
    if (salary_min and is_numeric(salary_min)) or (salary_max and is_numeric(salary_max)):
        salary_data = {
            "@type": "MonetaryAmount",
            "currency": currency
        }
        if salary_min and is_numeric(salary_min) and salary_max and is_numeric(salary_max):
            salary_data["value"] = {
                "@type": "QuantitativeValue",
                "minValue": float(str(salary_min).replace(',', '')),
                "maxValue": float(str(salary_max).replace(',', '')),
                "unitText": "MONTH"
            }
        elif salary_min and is_numeric(salary_min):
            salary_data["value"] = {
                "@type": "QuantitativeValue",
                "value": float(str(salary_min).replace(',', '')),
                "unitText": "MONTH"
            }
    
    # Format dates
    date_posted = created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)
    valid_through = expires_at.isoformat() if expires_at and hasattr(expires_at, 'isoformat') else None
    
    # Build schema
    schema = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job_title,
        "description": description,
        "datePosted": date_posted,
        "hiringOrganization": {
            "@type": "Organization",
            "name": company
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": location,
                "addressCountry": "IN"
            }
        },
        "employmentType": job_type,
        "url": f"https://jobslly.com/jobs/{slug}"
    }
    
    # Add salary if available
    if salary_data:
        schema["baseSalary"] = salary_data
    
    # Add valid through if available
    if valid_through:
        schema["validThrough"] = valid_through
    
    # Add job benefits if available
    benefits = job.get('benefits', [])
    if benefits:
        schema["jobBenefits"] = ", ".join(benefits)
    
    # Add qualifications if available
    requirements = job.get('requirements', [])
    if requirements:
        schema["qualifications"] = " ".join(requirements)
    
    return json.dumps(schema, indent=2)

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
    
    # Format: Apply for the [Job Name] job at [Company Name] in [Location]. View eligibility, salary, skills, and apply online on Jobslly.
    description = f"Apply for the {job_title} job at {company} in {location}. View eligibility, salary, skills, and apply online on Jobslly."
    
    # Generate JSON-LD schema
    jsonld_schema = generate_job_jsonld(job)
    
    job_url = f"https://jobslly.com/jobs/{job.get('slug', '')}"
    
    return {
        'title': title,
        'description': description,
        'og_title': f"{job_title} at {company}",
        'og_description': description,
        'og_type': 'website',
        'og_url': job_url,
        'canonical': job_url,
        'keywords': f"{job_title}, {company}, {location}, healthcare jobs, medical careers, job opportunities",
        'jsonld_schema': jsonld_schema,
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

async def get_category_meta(db, category_slug):
    """Get meta tags for a category page"""
    # Category metadata mapping
    CATEGORY_METADATA = {
        "doctor": {
            "seo_title": "[Number] Doctor Jobs in India | Latest Openings | Jobslly",
            "meta_description": "Search [Number] doctor jobs across top hospitals and clinics in India. Apply for the latest physician, specialist, and medical officer openings with Jobslly.",
        },
        "nursing": {
            "seo_title": "[Number] Nursing Jobs in India | Apply Today | Jobslly",
            "meta_description": "Explore [Number] nursing jobs in leading hospitals and healthcare centers across India. Apply today for staff nurse, GNM, and RN vacancies with Jobslly.",
        },
        "pharmacy": {
            "seo_title": "[Number] Pharmacy Jobs in India | Latest Pharma Openings | Jobslly",
            "meta_description": "Find [Number] pharmacy jobs in top pharma companies, hospitals, and medical stores across India. Apply for pharmacist and pharma career roles with Jobslly.",
        },
        "dentist": {
            "seo_title": "[Number] Dentist Jobs in Hospitals & Dental Clinics in India | Jobslly",
            "meta_description": "Browse [number] dentist jobs in hospitals and dental clinics across India. Apply for the latest dental vacancies and grow your career with Jobslly today.",
        },
        "physiotherapy": {
            "seo_title": "[Number] Physiotherapy Jobs in Hospitals & Rehab Centers | Jobslly",
            "meta_description": "Explore [number] physiotherapy jobs in hospitals and rehab centers across India. Apply for the latest physiotherapist openings with Jobslly.",
        },
        "medical-lab-technician": {
            "seo_title": "[Number] Medical Lab Technician Jobs in Diagnostic Centers | Jobslly",
            "meta_description": "Find [number] medical lab technician jobs in top diagnostic centers across India. Apply for latest MLT vacancies and start your career today.",
        },
        "medical-science-liaison": {
            "seo_title": "[Number] Medical Science Liaison Jobs in Pharma Companies | Jobslly",
            "meta_description": "Discover [number] medical science liaison jobs in leading pharma companies across India. Apply now for MSL roles with Jobslly.",
        },
        "pharmacovigilance": {
            "seo_title": "[Number] Pharmacovigilance Jobs in Pharma & CRO Companies | Jobslly",
            "meta_description": "Search [number] pharmacovigilance jobs in pharma and CRO companies across India. Apply for drug safety and PV roles with Jobslly.",
        },
        "clinical-research": {
            "seo_title": "[Number] Clinical Research Jobs in CROs & Research Organizations | Jobslly",
            "meta_description": "Browse [number] clinical research jobs in CROs and research organizations across India. Apply for CRA and CRC positions with Jobslly.",
        },
        "non-clinical-jobs": {
            "seo_title": "[Number] Non-Clinical Healthcare Jobs in Hospitals & Corporate | Jobslly",
            "meta_description": "Explore [number] non-clinical healthcare jobs in hospitals and corporate offices across India. Apply for admin, HR, and management roles.",
        }
    }
    
    if category_slug not in CATEGORY_METADATA:
        return None
    
    # Get job count for this category
    # Map URL slugs to DB category values
    CATEGORY_DB_MAPPING = {
        "doctor": ["doctors", "doctor"],
        "nursing": ["nurses", "nursing"],
        "pharmacy": ["pharmacy", "pharmacists"],
        "dentist": ["dentist", "dentists"],
        "physiotherapy": ["physiotherapy", "physiotherapists"],
        "medical-lab-technician": ["medical-lab-technician"],
        "medical-science-liaison": ["medical-science-liaison"],
        "pharmacovigilance": ["pharmacovigilance"],
        "clinical-research": ["clinical-research"],
        "non-clinical-jobs": ["non-clinical-jobs", "all"]
    }
    
    TITLE_BASED_CATEGORIES = {
        "medical-lab-technician": ["medical lab technician", "mlt", "lab technician"],
        "medical-science-liaison": ["medical science liaison", "msl"],
        "pharmacovigilance": ["pharmacovigilance", "drug safety", "pv specialist", "pv associate"],
        "clinical-research": ["clinical research", "clinical trial", "cra", "crc", "clinical data"],
        "non-clinical-jobs": ["non clinical", "admin", "hr", "manager", "operations", "marketing"]
    }
    
    # Count jobs
    if category_slug in TITLE_BASED_CATEGORIES:
        title_keywords = TITLE_BASED_CATEGORIES[category_slug]
        title_regex = "|".join(title_keywords)
        count = await db.jobs.count_documents({
            "title": {"$regex": title_regex, "$options": "i"},
            "is_approved": True,
            "is_deleted": {"$ne": True}
        })
    else:
        db_categories = CATEGORY_DB_MAPPING.get(category_slug, [category_slug])
        count = await db.jobs.count_documents({
            "categories": {"$in": db_categories},
            "is_approved": True,
            "is_deleted": {"$ne": True}
        })
    
    metadata = CATEGORY_METADATA[category_slug]
    title = metadata["seo_title"].replace("[Number]", str(count)).replace("[number]", str(count))
    description = metadata["meta_description"].replace("[Number]", str(count)).replace("[number]", str(count))
    
    # Fetch first 20 jobs for SSR
    if category_slug in TITLE_BASED_CATEGORIES:
        title_keywords = TITLE_BASED_CATEGORIES[category_slug]
        title_regex = "|".join(title_keywords)
        jobs_cursor = db.jobs.find({
            "title": {"$regex": title_regex, "$options": "i"},
            "is_approved": True,
            "is_deleted": {"$ne": True}
        }, {"_id": 0}).sort("created_at", -1).limit(20)
    else:
        db_categories = CATEGORY_DB_MAPPING.get(category_slug, [category_slug])
        jobs_cursor = db.jobs.find({
            "categories": {"$in": db_categories},
            "is_approved": True,
            "is_deleted": {"$ne": True}
        }, {"_id": 0}).sort("created_at", -1).limit(20)
    
    jobs_list = await jobs_cursor.to_list(20)
    
    # Generate ItemList JSON-LD schema
    import json
    item_list_elements = []
    for idx, job in enumerate(jobs_list, 1):
        item_list_elements.append({
            "@type": "ListItem",
            "position": idx,
            "url": f"https://jobslly.com/jobs/{job.get('slug', '')}"
        })
    
    jsonld_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": title,
        "description": description,
        "numberOfItems": count,
        "itemListElement": item_list_elements
    }, indent=2)
    
    # Generate SSR HTML content for category page
    category_html = generate_category_html_content(category_slug, title, description, count, jobs_list)
    
    return {
        'title': title,
        'description': description,
        'og_title': title,
        'og_description': description,
        'og_type': 'website',
        'keywords': f"{category_slug.replace('-', ' ')}, healthcare jobs, medical jobs, job opportunities in India",
        'jsonld_schema': jsonld_schema,
        'category_html': category_html,
        'canonical': f"https://jobslly.com/jobs/{category_slug}"
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

def generate_category_html_content(category_slug, title, description, count, jobs_list):
    """Generate server-side rendered HTML content for category pages"""
    
    # Category intro texts
    CATEGORY_INTROS = {
        "doctor": "Find the best doctor jobs across India. Our platform connects medical professionals with top hospitals and healthcare facilities.",
        "nursing": "Explore nursing opportunities in leading hospitals and healthcare centers. Join a community of dedicated nursing professionals.",
        "pharmacy": "Discover pharmacy jobs in top pharmaceutical companies, hospitals, and retail chains across India.",
        "dentist": "Browse dentist job openings in hospitals and dental clinics. Build your dental career with Jobslly.",
        "physiotherapy": "Find physiotherapy jobs in hospitals and rehabilitation centers. Connect with leading healthcare providers.",
        "medical-lab-technician": "Search medical lab technician positions in diagnostic centers and hospitals across India.",
        "medical-science-liaison": "Explore MSL roles in leading pharmaceutical companies. Bridge the gap between science and business.",
        "pharmacovigilance": "Find pharmacovigilance jobs in pharma and CRO companies. Ensure drug safety and patient protection.",
        "clinical-research": "Discover clinical research opportunities in CROs and research organizations across India.",
        "non-clinical-jobs": "Explore non-clinical healthcare roles in administration, HR, marketing, and management."
    }
    
    intro_text = CATEGORY_INTROS.get(category_slug, "Explore the latest job opportunities in this category.")
    category_name = category_slug.replace('-', ' ').title()
    
    # Generate job listing HTML
    jobs_html = ""
    for job in jobs_list:
        job_title = job.get('title', 'Job Opening')
        company = job.get('company', 'Company')
        location = job.get('location', 'Location')
        job_type = job.get('job_type', 'Full Time')
        salary = f"{job.get('salary_min', '')} - {job.get('salary_max', '')}" if job.get('salary_min') else 'Competitive'
        slug = job.get('slug', '')
        description_snippet = clean_html_for_meta(job.get('description', ''))[:150] + '...'
        
        jobs_html += f'''
        <article class="ssr-job-card" itemscope itemtype="https://schema.org/JobPosting">
            <h3 itemprop="title"><a href="/jobs/{slug}">{job_title}</a></h3>
            <div class="job-meta">
                <span itemprop="hiringOrganization" itemscope itemtype="https://schema.org/Organization">
                    <strong itemprop="name">{company}</strong>
                </span>
                <span itemprop="jobLocation" itemscope itemtype="https://schema.org/Place">
                    <span itemprop="address">📍 {location}</span>
                </span>
            </div>
            <div class="job-details">
                <span class="job-type">{job_type}</span>
                <span class="job-salary">💰 {salary}</span>
            </div>
            <p itemprop="description">{description_snippet}</p>
            <a href="/jobs/{slug}" class="apply-link">View Details & Apply →</a>
        </article>
        '''
    
    # Generate breadcrumbs
    breadcrumbs_html = f'''
    <nav class="ssr-breadcrumbs" aria-label="Breadcrumb">
        <ol itemscope itemtype="https://schema.org/BreadcrumbList">
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                <a itemprop="item" href="/">
                    <span itemprop="name">Home</span>
                </a>
                <meta itemprop="position" content="1" />
            </li>
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                <a itemprop="item" href="/jobs">
                    <span itemprop="name">Jobs</span>
                </a>
                <meta itemprop="position" content="2" />
            </li>
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                <span itemprop="name">{category_name} Jobs</span>
                <meta itemprop="position" content="3" />
            </li>
        </ol>
    </nav>
    '''
    
    # Complete SSR content
    ssr_content = f'''
    <div id="ssr-category-content" style="display:none;">
        {breadcrumbs_html}
        <header class="ssr-category-header">
            <h1>{title.replace(" | Jobslly", "")}</h1>
            <p class="category-intro">{description}</p>
            <p class="category-description">{intro_text}</p>
        </header>
        <section class="ssr-job-listings">
            <h2>Latest {category_name} Job Openings</h2>
            {jobs_html}
        </section>
        <style>
            #ssr-category-content {{ display: none; }}
            .ssr-job-card {{ margin-bottom: 20px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }}
            .ssr-job-card h3 {{ margin: 0 0 10px 0; font-size: 18px; }}
            .ssr-job-card h3 a {{ color: #14b8a6; text-decoration: none; }}
            .ssr-job-card .job-meta {{ margin-bottom: 10px; color: #6b7280; }}
            .ssr-job-card .job-details {{ margin-bottom: 10px; }}
            .ssr-job-card .job-type, .ssr-job-card .job-salary {{ margin-right: 15px; font-size: 14px; }}
            .ssr-job-card p {{ color: #4b5563; line-height: 1.6; }}
            .ssr-job-card .apply-link {{ color: #14b8a6; text-decoration: none; font-weight: 600; }}
            .ssr-breadcrumbs ol {{ list-style: none; padding: 0; display: flex; gap: 8px; flex-wrap: wrap; }}
            .ssr-breadcrumbs li:not(:last-child)::after {{ content: " › "; margin-left: 8px; }}
            .ssr-category-header {{ margin-bottom: 30px; }}
            .ssr-category-header h1 {{ font-size: 32px; font-weight: 700; margin-bottom: 15px; }}
            .category-intro {{ font-size: 16px; color: #6b7280; margin-bottom: 10px; }}
            .category-description {{ font-size: 15px; color: #4b5563; line-height: 1.6; }}
        </style>
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
        is_category_page = False
        
        # Detect page type from path
        if path.startswith('/jobs/') and path != '/jobs/' and path != '/jobs':
            slug = path.replace('/jobs/', '').strip('/')
            
            # Check if it's a category page first (these are short slugs without job IDs)
            category_slugs = ["doctor", "nursing", "pharmacy", "dentist", "physiotherapy", 
                            "medical-lab-technician", "medical-science-liaison", 
                            "pharmacovigilance", "clinical-research", "non-clinical-jobs"]
            
            if slug in category_slugs:
                # Category page
                meta_data = await get_category_meta(db, slug)
                is_category_page = True
            else:
                # Job detail page (has a full slug with ID)
                meta_data = await get_job_meta(db, slug)
                is_job_page = True
        
        elif path.startswith('/blogs/') and path != '/blogs/' and path != '/blogs':
            # Blog detail page
            slug = path.replace('/blogs/', '').strip('/')
            meta_data = await get_blog_meta(db, slug)
        
        client.close()
        
    except Exception as e:
        # Log error but don't crash - return original HTML
        import logging
        logging.error(f"Failed to inject meta tags for path {path}: {str(e)}")
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
    
    # Add og:url if available
    if 'og_url' in meta_data:
        og_url = html.escape(meta_data['og_url'])
        # Try to replace existing og:url or add it
        if '<meta property="og:url"' in html_content:
            html_content = re.sub(
                r'<meta property="og:url" content=".*?"[^>]*>',
                f'<meta property="og:url" content="{og_url}"/>',
                html_content,
                count=1
            )
        else:
            # Add before </head>
            html_content = html_content.replace('</head>', f'<meta property="og:url" content="{og_url}"/>\n</head>', 1)
    
    # Add canonical URL
    canonical_url = meta_data.get('canonical', meta_data.get('og_url', ''))
    if canonical_url:
        canonical_url = html.escape(canonical_url)
        if '<link rel="canonical"' in html_content:
            html_content = re.sub(
                r'<link rel="canonical" href=".*?"[^>]*>',
                f'<link rel="canonical" href="{canonical_url}"/>',
                html_content,
                count=1
            )
        else:
            html_content = html_content.replace('</head>', f'<link rel="canonical" href="{canonical_url}"/>\n</head>', 1)
    
    # Add robots meta tag (index, follow for all pages)
    if '<meta name="robots"' not in html_content:
        html_content = html_content.replace('</head>', '<meta name="robots" content="index, follow"/>\n</head>', 1)
    
    # For job pages, inject JSON-LD and SSR content
    if is_job_page and 'job_data' in meta_data:
        # Inject JobPosting JSON-LD schema before </head>
        if 'jsonld_schema' in meta_data:
            jsonld_script = f'<script type="application/ld+json">\n{meta_data["jsonld_schema"]}\n</script>'
            html_content = html_content.replace('</head>', f'{jsonld_script}\n</head>', 1)
        
        # Inject full SSR job content right after <body> tag
        job_html = generate_job_html_content(meta_data['job_data'])
        html_content = html_content.replace('<body>', f'<body>{job_html}', 1)
    
    # For category pages, inject ItemList JSON-LD and SSR content
    elif is_category_page and meta_data:
        # Inject ItemList JSON-LD schema before </head>
        if 'jsonld_schema' in meta_data:
            jsonld_script = f'<script type="application/ld+json">\n{meta_data["jsonld_schema"]}\n</script>'
            html_content = html_content.replace('</head>', f'{jsonld_script}\n</head>', 1)
        
        # Inject SSR category content right after <body> tag
        if 'category_html' in meta_data:
            html_content = html_content.replace('<body>', f'<body>{meta_data["category_html"]}', 1)
    
    return html_content
