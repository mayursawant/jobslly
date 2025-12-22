from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form, Header, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response, PlainTextResponse, RedirectResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as StarletteResponse
from motor.motor_asyncio import AsyncIOMotorClient
import hashlib
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
import os
import logging
import jwt
import uuid
import json
import xml.etree.ElementTree as ET
import subprocess

# Load environment variables
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Helper function to sanitize filenames
def sanitize_filename(filename):
    """Remove/replace characters that cause issues in URLs"""
    # Get the name and extension
    name_parts = filename.rsplit('.', 1)
    if len(name_parts) == 2:
        name, ext = name_parts
    else:
        name = filename
        ext = ''
    
    # Replace spaces and special characters
    name = name.replace(' ', '_')
    name = ''.join(c for c in name if c.isalnum() or c in ('_', '-'))
    
    # Reconstruct filename
    return f"{name}.{ext}" if ext else name

# MongoDB connection
import ssl
mongo_url = os.environ['MONGO_URL']
# Configure SSL/TLS for MongoDB Atlas
client = AsyncIOMotorClient(
    mongo_url,
    tlsAllowInvalidCertificates=True,
    serverSelectionTimeoutMS=30000,
    connectTimeoutMS=30000,
    socketTimeoutMS=30000
)
db = client[os.environ['DB_NAME']]

# Helper function to regenerate sitemap
def regenerate_sitemap_async():
    """Trigger sitemap regeneration in background"""
    try:
        print("🔄 Triggering sitemap regeneration...")
        result = subprocess.Popen(
            ['python3', '/app/backend/update_sitemap.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print(f"✓ Sitemap regeneration triggered (PID: {result.pid})")
    except Exception as e:
        print(f"❌ Failed to regenerate sitemap: {e}")
        logger.error(f"Failed to regenerate sitemap: {e}")

# Meta Tag Injection Middleware removed - app now uses pure client-side rendering

# Create the main app
app = FastAPI(title="HealthCare Jobs API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# WWW to non-WWW redirect middleware
class WWWRedirectMiddleware(BaseHTTPMiddleware):
    """
    Middleware to redirect www subdomain to non-www for SEO consistency.
    Returns 301 Permanent Redirect for all www requests.
    """
    async def dispatch(self, request: Request, call_next):
        host = request.headers.get("host", "")
        
        # Check if host starts with www.
        if host.startswith("www."):
            # Remove www. prefix
            new_host = host[4:]
            # Construct new URL with non-www domain
            new_url = f"{request.url.scheme}://{new_host}{request.url.path}"
            if request.url.query:
                new_url += f"?{request.url.query}"
            
            # Return 301 Permanent Redirect
            return RedirectResponse(url=new_url, status_code=301)
        
        # Continue with normal request processing
        response = await call_next(request)
        return response

# Security
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-this')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
security = HTTPBearer()

# AI Integration
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    AI_ENABLED = True
except ImportError:
    AI_ENABLED = False
    print("AI integration not available")

# Models
class UserRole(str):
    JOB_SEEKER = "job_seeker"
    EMPLOYER = "employer" 
    ADMIN = "admin"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: str = UserRole.JOB_SEEKER
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    profile_data: Dict[str, Any] = {}

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = UserRole.JOB_SEEKER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: Optional[str] = None  # SEO-friendly URL slug
    description: str
    company: str
    location: str
    salary_min: Optional[str] = None  # Text field to support "Negotiable", "Competitive", numeric values, etc.
    salary_max: Optional[str] = None  # Text field to support "Negotiable", "Competitive", numeric values, etc.
    currency: str = "INR"  # Currency for salary - INR or USD
    job_type: str = "full_time"  # full_time, part_time, contract
    categories: List[str] = []  # Multiple categories - doctors, pharmacists, dentists, physiotherapists, nurses
    requirements: List[str] = []
    benefits: List[str] = []
    employer_id: str
    is_approved: bool = False
    is_deleted: bool = False  # Soft delete flag
    is_archived: bool = False  # Archive flag - job deadline over
    # Third-party job redirection features
    is_external: bool = False
    external_url: Optional[str] = None
    application_deadline: Optional[datetime] = None
    # Enhanced tracking
    view_count: int = 0
    application_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

# Enhanced User Profile Model
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    # Personal Information
    country_code: Optional[str] = None
    phone: Optional[str] = None
    full_phone: Optional[str] = None  # Combined country code + phone
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    # Professional Information
    specialization: Optional[str] = None
    custom_specialization: Optional[str] = None  # For "other" specialization
    final_specialization: Optional[str] = None  # Processed specialization
    experience_years: Optional[int] = None
    education: List[Dict[str, str]] = []
    certifications: List[str] = []
    skills: List[str] = []
    # Resume and Portfolio
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    # Preferences
    preferred_job_type: List[str] = []
    preferred_locations: List[str] = []
    salary_expectation_min: Optional[int] = None
    salary_expectation_max: Optional[int] = None
    # Tracking
    profile_completion: int = 0  # Percentage
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

class UserProfileUpdate(BaseModel):
    country_code: Optional[str] = None
    phone: Optional[str] = None
    full_phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    specialization: Optional[str] = None
    custom_specialization: Optional[str] = None
    final_specialization: Optional[str] = None
    experience_years: Optional[int] = None
    education: List[Dict[str, str]] = []
    certifications: List[str] = []
    skills: List[str] = []
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    preferred_job_type: List[str] = []
    preferred_locations: List[str] = []
    salary_expectation_min: Optional[int] = None
    salary_expectation_max: Optional[int] = None

# Enhanced Job Seeker Profile Model
class JobSeekerProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str  # Primary identifier
    name: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[str] = None
    location: Optional[str] = None
    specialization: Optional[str] = None
    
    # User engagement data
    user_id: Optional[str] = None  # Link to User model if they register
    total_applications: int = 0
    jobs_applied: List[str] = []  # List of job IDs
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Source tracking
    first_source: str = "direct"  # direct, job_application, lead_collection, registration
    acquisition_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Profile completion and status
    is_registered: bool = False  # True if they created an account
    profile_completion: int = 0  # Percentage based on filled fields
    status: str = "lead"  # lead, registered, active, inactive
    
    # Additional tracking
    resume_uploaded: bool = False
    cover_letters_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobSeekerProfileCreate(BaseModel):
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[str] = None
    location: Optional[str] = None
    specialization: Optional[str] = None
    source: str = "direct"

# Enhanced Lead Collection Model (for backward compatibility)
class JobLead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    job_seeker_id: str  # Link to JobSeekerProfile
    name: str
    email: str
    phone: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[str] = None
    message: Optional[str] = None
    source: str = "job_application"  # job_application, chatbot, newsletter
    status: str = "new"  # new, contacted, converted, closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobLeadCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[str] = None
    message: Optional[str] = None
    job_id: Optional[str] = None

class JobCreate(BaseModel):
    title: str
    description: str
    company: str
    location: str
    salary_min: Optional[str] = None  # Text field to support "Negotiable", "Competitive", numeric values, etc.
    salary_max: Optional[str] = None  # Text field to support "Negotiable", "Competitive", numeric values, etc.
    currency: str = "INR"  # Currency for salary - INR or USD
    job_type: str = "full_time"
    categories: List[str] = []  # Multiple categories
    requirements: List[str] = []
    benefits: List[str] = []
    # Third-party job features
    is_external: bool = False
    external_url: Optional[str] = None
    application_deadline: Optional[datetime] = None
    expires_at: Optional[datetime] = None  # Job expiry date for auto-archiving

class JobApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    applicant_id: str
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    status: str = "pending"  # pending, reviewed, accepted, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    message: str
    response: str
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FAQItem(BaseModel):
    question: str
    answer: str

class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str
    content: str
    featured_image: Optional[str] = None
    author_id: str
    category: str = "healthcare"
    tags: List[str] = []
    is_published: bool = False
    is_featured: bool = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: List[str] = []
    faqs: List[FAQItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    featured_image: Optional[str] = None
    category: str = "healthcare"
    tags: List[str] = []
    is_published: bool = False
    is_featured: bool = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: List[str] = []
    faqs: List[FAQItem] = []

class SEOSettings(BaseModel):
    page_type: str  # home, jobs, blog, etc.
    title: str
    description: str
    keywords: List[str] = []
    og_image: Optional[str] = None
    canonical_url: Optional[str] = None

class AIRequest(BaseModel):
    text: str
    job_id: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

# Helper functions
def hash_password(password: str) -> str:
    # Use SHA256 for simplicity in MVP
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def generate_slug(title: str, company: str = None, location: str = None, job_id: str = None) -> str:
    """Generate SEO-friendly slug from job title, company, location, and job ID"""
    import re
    
    def clean_text(text: str, max_length: int = None) -> str:
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
        
        # Truncate if too long
        if max_length and len(text) > max_length:
            text = text[:max_length].rsplit('-', 1)[0]  # Cut at word boundary
        
        return text
    
    # Clean each component with length limits
    title_slug = clean_text(title, max_length=80)  # Max 80 chars for title
    company_slug = clean_text(company, max_length=50) if company else ""  # Max 50 for company
    location_slug = clean_text(location, max_length=40) if location else ""  # Max 40 for location
    
    # Build slug in format: [job-name]-job-at-[company-name]-in-[location]-[id]
    slug_parts = [title_slug]
    
    if company_slug:
        slug_parts.extend(["job-at", company_slug])
    
    if location_slug:
        slug_parts.extend(["in", location_slug])
    
    # Add job ID at the end for uniqueness (first 8 characters)
    if job_id:
        slug_parts.append(job_id[:8])
    
    slug = "-".join(slug_parts)
    
    # Ensure slug is not empty and not too long (max 200 chars total)
    if not slug:
        slug = f"job-{job_id[:8]}" if job_id else "job"
    elif len(slug) > 200:
        slug = slug[:200].rsplit('-', 1)[0]  # Truncate at word boundary
        # Re-add the ID at the end after truncation
        if job_id:
            slug = f"{slug}-{job_id[:8]}"
    
    return slug

async def ensure_unique_slug(base_slug: str, job_id: str = None) -> str:
    """Ensure slug is unique by appending number if necessary"""
    slug = base_slug
    counter = 1
    
    while True:
        # Check if slug exists (excluding current job if updating)
        query = {"slug": slug}
        if job_id:
            query["id"] = {"$ne": job_id}
        
        existing = await db.jobs.find_one(query)
        if not existing:
            return slug
        
        # Slug exists, append counter
        slug = f"{base_slug}-{counter}"
        counter += 1

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def get_current_user_optional(authorization: str = None):
    """
    Optional authentication - returns User if valid token provided, None otherwise
    """
    if not authorization or not authorization.startswith('Bearer '):
        return None
    
    try:
        token = authorization.replace('Bearer ', '')
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        
        user = await db.users.find_one({"email": email})
        if user is None:
            return None
        return User(**user)
    except:
        return None

async def get_ai_chat():
    if not AI_ENABLED:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=503, detail="AI API key not configured")
    
    return LlmChat(
        api_key=api_key,
        session_id=f"healthcare_jobs_{uuid.uuid4()}",
        system_message="You are an AI assistant for a healthcare job platform. Help with job matching, resume analysis, interview preparation, and lead generation. Be professional and helpful."
    ).with_model("openai", "gpt-4o-mini")

# Authentication Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(**user_data.dict(exclude={'password', 'phone'}))
    user_dict = user.dict()
    user_dict['hashed_password'] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create user profile with phone number if provided
    if user_data.phone:
        profile = UserProfile(
            user_id=user.id,
            phone=user_data.phone
        )
        profile_dict = profile.dict()
        profile_dict['created_at'] = profile_dict['created_at'].isoformat()
        if profile_dict.get('updated_at'):
            profile_dict['updated_at'] = profile_dict['updated_at'].isoformat()
        
        await db.user_profiles.insert_one(profile_dict)
    
    # Create job seeker profile if role is job_seeker
    if user_data.role == "job_seeker":
        try:
            job_seeker_profile = JobSeekerProfile(
                email=user.email,
                name=user.full_name,
                phone=user_data.phone,
                user_id=user.id
            )
            profile_dict = job_seeker_profile.dict()
            profile_dict['created_at'] = profile_dict['created_at'].isoformat()
            profile_dict['updated_at'] = profile_dict['updated_at'].isoformat()
            
            await db.job_seekers.insert_one(profile_dict)
        except Exception as e:
            print(f"Error creating job seeker profile during registration: {e}")
    
    # Create token
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Check if user exists and password is correct
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create or update job seeker profile for registered users
    if user.get("role") in ["job_seeker", "employer"]:  # Don't create profile for admin
        try:
            # Get user profile for additional data
            user_profile = await db.user_profiles.find_one({"user_id": user["id"]})
            
            # Create/update job seeker profile
            profile_data = JobSeekerProfileCreate(
                email=user["email"],
                name=user.get("full_name"),
                phone=user_profile.get("phone") if user_profile else None,
                country_code=user_profile.get("country_code") if user_profile else None,
                current_position=user_profile.get("specialization") if user_profile else None,
                experience_years=str(user_profile.get("experience_years")) if user_profile and user_profile.get("experience_years") else None,
                location=user_profile.get("address") if user_profile else None,
                specialization=user_profile.get("specialization") if user_profile else None,
                source="login"
            )
            
            # Create or update profile
            await create_or_update_job_seeker_profile(profile_data)
            
            # Mark as registered user
            await db.job_seekers.update_one(
                {"email": user["email"]},
                {
                    "$set": {
                        "user_id": user["id"],
                        "is_registered": True,
                        "status": "registered",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Merge lead applications to user account
            # Find all leads for this email that haven't been converted to applications
            leads = await db.job_leads.find({"email": user["email"]}).to_list(length=None)
            for lead in leads:
                # Check if application already exists for this job
                existing_app = await db.applications.find_one({
                    "job_id": lead['job_id'],
                    "applicant_id": user["id"]
                })
                
                if not existing_app:
                    # Create application from lead
                    application = JobApplication(
                        job_id=lead['job_id'],
                        applicant_id=user["id"],
                        cover_letter=lead.get('message', ''),
                        status="pending"
                    )
                    
                    application_dict = application.dict()
                    application_dict['created_at'] = lead.get('created_at', datetime.now(timezone.utc).isoformat())
                    
                    await db.applications.insert_one(application_dict)
            
        except Exception as e:
            # Log error but don't fail login
            print(f"Error creating job seeker profile on login: {e}")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user['email']},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Job Routes
@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to create jobs")
    
    # Validate external URL must be HTTPS
    if job_data.is_external and job_data.external_url:
        if not job_data.external_url.startswith('https://'):
            raise HTTPException(
                status_code=400, 
                detail="Invalid URL. External job URLs must start with https:// for security"
            )
    
    job = Job(**job_data.dict(), employer_id=current_user.id)
    
    # Generate unique slug from title, company, location, and job ID
    base_slug = generate_slug(job.title, job.company, job.location, job.id)
    job.slug = await ensure_unique_slug(base_slug, job.id)
    
    job_dict = job.dict()
    # Keep datetime objects as-is for MongoDB - do NOT convert to isoformat
    # MongoDB natively supports datetime objects and the app expects them for proper sorting
    
    await db.jobs.insert_one(job_dict)
    
    # Auto-regenerate sitemap after new job
    regenerate_sitemap_async()
    
    return job

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(skip: int = 0, limit: int = 20, approved_only: bool = True, category: str = None):
    try:
        query = {"is_approved": True, "is_deleted": {"$ne": True}} if approved_only else {"is_deleted": {"$ne": True}}
        
        # Add category filter if provided (matches ANY category in the categories array)
        if category:
            query["categories"] = category
        
        # Sort: By created_at descending (newest first), then archived jobs at end
        jobs = await db.jobs.find(query, {"_id": 0}).sort([("created_at", -1), ("is_archived", 1)]).skip(skip).limit(limit).to_list(length=None)
        
        print(f"[DEBUG] Found {len(jobs)} jobs from database")
        
        result_jobs = []
        for job in jobs:
            try:
                # Handle datetime fields
                if isinstance(job.get('created_at'), str):
                    job['created_at'] = datetime.fromisoformat(job['created_at'])
                if job.get('expires_at') and isinstance(job.get('expires_at'), str):
                    job['expires_at'] = datetime.fromisoformat(job['expires_at'])
                if job.get('application_deadline') and isinstance(job.get('application_deadline'), str):
                    job['application_deadline'] = datetime.fromisoformat(job['application_deadline'])
                
                # Convert integer salaries to strings for backward compatibility
                if job.get('salary_min') is not None and isinstance(job.get('salary_min'), int):
                    job['salary_min'] = str(job['salary_min'])
                if job.get('salary_max') is not None and isinstance(job.get('salary_max'), int):
                    job['salary_max'] = str(job['salary_max'])
                
                # Create Job instance
                job_instance = Job(**job)
                result_jobs.append(job_instance)
            except Exception as e:
                print(f"[ERROR] Failed to serialize job {job.get('id', 'unknown')}: {e}")
                print(f"[ERROR] Job fields: {list(job.keys())}")
                continue
        
        print(f"[DEBUG] Successfully serialized {len(result_jobs)} jobs")
        return result_jobs
    except Exception as e:
        print(f"[ERROR] get_jobs endpoint failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")


# Map URL slugs to database category values
CATEGORY_DB_MAPPING = {
    "doctor": ["doctors", "doctor"],  # DB has "doctors" (plural)
    "nursing": ["nurses", "nursing"],  # DB has "nurses" (plural)
    "pharmacy": ["pharmacy", "pharmacists"],
    "dentist": ["dentist", "dentists"],
    "physiotherapy": ["physiotherapy", "physiotherapists"],
    "medical-lab-technician": ["medical-lab-technician"],
    "medical-science-liaison": ["medical-science-liaison"],
    "pharmacovigilance": ["pharmacovigilance"],
    "clinical-research": ["clinical-research"],
    "non-clinical-jobs": ["non-clinical-jobs", "all"]
}

# Categories that should filter by job title instead of category field
TITLE_BASED_CATEGORIES = {
    "medical-lab-technician": ["medical lab technician", "mlt", "lab technician"],
    "medical-science-liaison": ["medical science liaison", "msl"],
    "pharmacovigilance": ["pharmacovigilance", "drug safety", "pv specialist", "pv associate"],
    "clinical-research": ["clinical research", "clinical trial", "cra", "crc", "clinical data"],
    "non-clinical-jobs": ["non clinical", "admin", "hr", "manager", "operations", "marketing"]
}

# Category metadata mapping
CATEGORY_METADATA = {
    "doctor": {
        "name": "Doctor Jobs",
        "seo_title": "[Number] Doctor Jobs in India | Latest Openings | Jobslly",
        "meta_description": "Search [Number] doctor jobs across top hospitals and clinics in India. Apply for the latest physician, specialist, and medical officer openings with Jobslly.",
        "h1": "[Number] Doctor Jobs in India – Latest Openings"
    },
    "nursing": {
        "name": "Nursing Jobs",
        "seo_title": "[Number] Nursing Jobs in India | Apply Today | Jobslly",
        "meta_description": "Explore [Number] nursing jobs in leading hospitals and healthcare centers across India. Apply today for staff nurse, GNM, and RN vacancies with Jobslly.",
        "h1": "[Number] Nursing Jobs in India – Latest Openings"
    },
    "pharmacy": {
        "name": "Pharmacy Jobs",
        "seo_title": "[Number] Pharmacy Jobs in India | Latest Pharma Openings | Jobslly",
        "meta_description": "Find [Number] pharmacy jobs in top pharma companies, hospitals, and medical stores across India. Apply for pharmacist and pharma career roles with Jobslly.",
        "h1": "[Number] Pharmacy Jobs in India – Latest Openings"
    },
    "dentist": {
        "name": "Dentist Jobs",
        "seo_title": "[Number] Dentist Jobs in Hospitals & Dental Clinics in India | Jobslly",
        "meta_description": "Browse [number] dentist jobs in hospitals and dental clinics across India. Apply for the latest dental vacancies and grow your career with Jobslly today.",
        "h1": "[Number] Dentist Jobs in India – Latest Openings"
    },
    "physiotherapy": {
        "name": "Physiotherapy Jobs",
        "seo_title": "[Number] Physiotherapy Jobs in Hospitals & Rehab Centers | Jobslly",
        "meta_description": "Explore [number] physiotherapy jobs in hospitals and rehab centers across India. Apply for the latest physiotherapist openings with Jobslly.",
        "h1": "[Number] Physiotherapy Jobs in India – Latest Openings"
    },
    "medical-lab-technician": {
        "name": "Medical Lab Technician",
        "seo_title": "[Number] Medical Lab Technician Jobs in Diagnostic Centers | Jobslly",
        "meta_description": "Find [number] medical lab technician jobs in top diagnostic centers across India. Apply for latest MLT vacancies and start your career today.",
        "h1": "[Number] Medical Lab Technician Jobs in India – Latest Openings"
    },
    "medical-science-liaison": {
        "name": "Medical Science Liaison",
        "seo_title": "[Number] Medical Science Liaison Jobs in Pharma Companies | Jobslly",
        "meta_description": "Discover [number] medical science liaison jobs in leading pharma companies across India. Apply now for MSL roles with Jobslly.",
        "h1": "[Number] Medical Science Liaison Jobs in India – Latest Openings"
    },
    "pharmacovigilance": {
        "name": "Pharmacovigilance",
        "seo_title": "[Number] Pharmacovigilance Jobs in Pharma & CRO Companies | Jobslly",
        "meta_description": "Search [number] pharmacovigilance jobs in pharma and CRO companies across India. Apply for drug safety and PV roles with Jobslly.",
        "h1": "[Number] Pharmacovigilance Jobs in India – Latest Openings"
    },
    "clinical-research": {
        "name": "Clinical Research",
        "seo_title": "[Number] Clinical Research Jobs in CROs & Research Organizations | Jobslly",
        "meta_description": "Browse [number] clinical research jobs in CROs and research organizations across India. Apply for CRA and CRC positions with Jobslly.",
        "h1": "[Number] Clinical Research Jobs in India – Latest Openings"
    },
    "non-clinical-jobs": {
        "name": "Non Clinical Jobs",
        "seo_title": "[Number] Non-Clinical Healthcare Jobs in Hospitals & Corporate | Jobslly",
        "meta_description": "Explore [number] non-clinical healthcare jobs in hospitals and corporate offices across India. Apply for admin, HR, and management roles.",
        "h1": "[Number] Non-Clinical Healthcare Jobs in India – Latest Openings"
    }
}

@api_router.get("/categories")
async def get_all_categories():
    """Get all available job categories with job counts"""
    categories_with_counts = []
    
    for slug, metadata in CATEGORY_METADATA.items():
        # Check if this category uses title-based filtering
        if slug in TITLE_BASED_CATEGORIES:
            # Filter by job title keywords
            title_keywords = TITLE_BASED_CATEGORIES[slug]
            title_regex = "|".join(title_keywords)
            count = await db.jobs.count_documents({
                "title": {"$regex": title_regex, "$options": "i"},
                "is_approved": True,
                "is_deleted": {"$ne": True}
            })
        else:
            # Count jobs in this category using DB mapping
            db_categories = CATEGORY_DB_MAPPING.get(slug, [slug])
            count = await db.jobs.count_documents({
                "categories": {"$in": db_categories},
                "is_approved": True,
                "is_deleted": {"$ne": True}
            })
        
        categories_with_counts.append({
            "slug": slug,
            "name": metadata["name"],
            "job_count": count,
            "seo_title": metadata["seo_title"].replace("[Number]", str(count)).replace("[number]", str(count)),
            "meta_description": metadata["meta_description"].replace("[Number]", str(count)).replace("[number]", str(count)),
            "h1": metadata["h1"].replace("[Number]", str(count)).replace("[Category Name]", metadata["name"].replace(" Jobs", ""))
        })
    
    return categories_with_counts

@api_router.get("/categories/{category_slug}")
async def get_category_jobs(
    category_slug: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    location: str = Query(None),
    job_type: str = Query(None),
    experience: str = Query(None),
    salary_min: int = Query(None),
    salary_max: int = Query(None)
):
    """Get jobs for a specific category with filters and pagination"""
    
    # Validate category exists
    if category_slug not in CATEGORY_METADATA:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Build base query
    query = {
        "is_approved": True,
        "is_deleted": {"$ne": True}
    }
    
    # Check if this category uses title-based filtering
    if category_slug in TITLE_BASED_CATEGORIES:
        # Filter by job title keywords
        title_keywords = TITLE_BASED_CATEGORIES[category_slug]
        title_regex = "|".join(title_keywords)
        query["title"] = {"$regex": title_regex, "$options": "i"}
    else:
        # Get database category values for this slug
        db_categories = CATEGORY_DB_MAPPING.get(category_slug, [category_slug])
        query["categories"] = {"$in": db_categories}
    
    # Add filters
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    if job_type:
        query["job_type"] = job_type
    
    if experience:
        query["experience_years"] = {"$lte": int(experience)}
    
    if salary_min or salary_max:
        salary_query = {}
        if salary_min:
            salary_query["$gte"] = salary_min
        if salary_max:
            salary_query["$lte"] = salary_max
        query["salary_max"] = salary_query
    
    # Get total count for pagination
    total_count = await db.jobs.count_documents(query)
    
    # Get jobs
    jobs = await db.jobs.find(query).sort([("created_at", -1), ("is_archived", 1)]).skip(skip).limit(limit).to_list(length=None)
    
    # Process jobs
    for job in jobs:
        if isinstance(job.get('created_at'), str):
            job['created_at'] = datetime.fromisoformat(job['created_at'])
        if job.get('expires_at') and isinstance(job.get('expires_at'), str):
            job['expires_at'] = datetime.fromisoformat(job['expires_at'])
        
        # Convert integer salaries to strings
        if job.get('salary_min') is not None and isinstance(job.get('salary_min'), int):
            job['salary_min'] = str(job['salary_min'])
        if job.get('salary_max') is not None and isinstance(job.get('salary_max'), int):
            job['salary_max'] = str(job['salary_max'])
    
    # Get category metadata with dynamic count
    metadata = CATEGORY_METADATA[category_slug].copy()
    metadata["seo_title"] = metadata["seo_title"].replace("[Number]", str(total_count)).replace("[number]", str(total_count))
    metadata["meta_description"] = metadata["meta_description"].replace("[Number]", str(total_count)).replace("[number]", str(total_count))
    metadata["h1"] = metadata["h1"].replace("[Number]", str(total_count)).replace("[Category Name]", metadata["name"].replace(" Jobs", ""))
    
    return {
        "category": {
            "slug": category_slug,
            "name": metadata["name"],
            **metadata
        },
        "jobs": [Job(**job) for job in jobs],
        "total_count": total_count,
        "page": skip // limit + 1,
        "total_pages": (total_count + limit - 1) // limit,
        "has_more": skip + limit < total_count
    }

@api_router.get("/jobs/{job_identifier}")
async def get_job(job_identifier: str, authorization: str = Header(None)):
    # Try to find by slug first, then by ID (backward compatibility)
    job = await db.jobs.find_one({"slug": job_identifier, "is_deleted": {"$ne": True}})
    if not job:
        job = await db.jobs.find_one({"id": job_identifier, "is_deleted": {"$ne": True}})
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if isinstance(job.get('created_at'), str):
        job['created_at'] = datetime.fromisoformat(job['created_at'])
    if job.get('expires_at') and isinstance(job.get('expires_at'), str):
        job['expires_at'] = datetime.fromisoformat(job['expires_at'])
    
    # Convert integer salaries to strings for backward compatibility
    if job.get('salary_min') is not None and isinstance(job.get('salary_min'), int):
        job['salary_min'] = str(job['salary_min'])
    if job.get('salary_max') is not None and isinstance(job.get('salary_max'), int):
        job['salary_max'] = str(job['salary_max'])
    
    # Check if user has applied for this job (for logged-in users)
    has_applied = False
    current_user = await get_current_user_optional(authorization)
    
    if current_user:
        # Check in applications collection
        existing_application = await db.applications.find_one({
            "job_id": job['id'],
            "applicant_id": current_user.id
        })
        # Also check in job_leads collection (for users who applied before logging in)
        existing_lead = await db.job_leads.find_one({
            "job_id": job['id'],
            "email": current_user.email
        })
        has_applied = bool(existing_application or existing_lead)
    
    job_response = Job(**job).dict()
    job_response['has_applied'] = has_applied
    return job_response

# Job Application Routes
# (Job application endpoint is implemented further below with enhanced functionality)

# AI Routes
@api_router.post("/ai/enhance-job-description")
async def enhance_job_description(request: AIRequest, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    chat = await get_ai_chat()
    
    message = UserMessage(
        text=f"Please enhance this healthcare job description to be more attractive and comprehensive: {request.text}"
    )
    
    response = await chat.send_message(message)
    return {"enhanced_description": response}

@api_router.post("/ai/match-jobs")
async def match_jobs(request: AIRequest, current_user: User = Depends(get_current_user)):
    chat = await get_ai_chat()
    
    # Get available jobs
    jobs = await db.jobs.find({"is_approved": True}).limit(10).to_list(length=None)
    jobs_text = "\n".join([f"Job {i+1}: {job['title']} at {job['company']} - {job['description'][:200]}..." 
                          for i, job in enumerate(jobs)])
    
    message = UserMessage(
        text=f"Based on this candidate profile: {request.text}\n\nHere are available healthcare jobs:\n{jobs_text}\n\nPlease recommend the top 3 most suitable jobs and explain why they match."
    )
    
    response = await chat.send_message(message)
    return {"recommendations": response}

@api_router.post("/ai/analyze-resume")
async def analyze_resume(request: AIRequest, current_user: User = Depends(get_current_user)):
    chat = await get_ai_chat()
    
    message = UserMessage(
        text=f"Please analyze this healthcare professional's resume and provide feedback on strengths, areas for improvement, and healthcare job recommendations: {request.text}"
    )
    
    response = await chat.send_message(message)
    return {"analysis": response}

@api_router.post("/ai/generate-interview-questions")
async def generate_interview_questions(request: AIRequest, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    chat = await get_ai_chat()
    
    message = UserMessage(
        text=f"Generate 10 relevant interview questions for this healthcare job position: {request.text}"
    )
    
    response = await chat.send_message(message)
    return {"questions": response}

# AI Job Enhancement Routes for Admin CMS
@api_router.post("/ai/enhance-job-description")
async def enhance_job_description(request: AIRequest, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    chat = await get_ai_chat()
    
    message = UserMessage(
        text=f"""Please rewrite and enhance this healthcare job description to be more engaging, professional, and comprehensive. 
        Make it attractive to healthcare professionals while maintaining accuracy and clarity:
        
        Current Job Description: {request.text}
        
        Please provide an enhanced version that includes:
        - Compelling opening statement
        - Clear role responsibilities 
        - Growth opportunities
        - Professional development aspects
        - Impact on patient care/healthcare outcomes
        
        Keep it professional but engaging, around 150-300 words."""
    )
    
    response = await chat.send_message(message)
    return {"enhanced_description": response}

@api_router.post("/ai/suggest-job-requirements")
async def suggest_job_requirements(request: AIRequest, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    chat = await get_ai_chat()
    
    message = UserMessage(
        text=f"""Based on this healthcare job title and description, suggest comprehensive job requirements including:
        - Educational qualifications
        - Professional certifications
        - Years of experience needed
        - Technical skills
        - Soft skills
        - Any specialty-specific requirements
        
        Job Details: {request.text}
        
        Please provide a list of 5-8 specific, realistic requirements for this healthcare position."""
    )
    
    response = await chat.send_message(message)
    return {"suggested_requirements": response}

@api_router.post("/ai/suggest-job-benefits")
async def suggest_job_benefits(request: AIRequest, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    chat = await get_ai_chat()
    
    message = UserMessage(
        text=f"""Suggest attractive and competitive benefits for this healthcare position. Consider the role level, location, and industry standards:
        
        Job Details: {request.text}
        
        Please suggest 6-10 benefits that would be attractive to healthcare professionals, including:
        - Healthcare and insurance benefits
        - Professional development opportunities
        - Financial benefits
        - Work-life balance perks
        - Career advancement opportunities
        
        Make them specific and appealing to healthcare workers."""
    )
    
    response = await chat.send_message(message)
    return {"suggested_benefits": response}

@api_router.post("/ai/job-posting-assistant")
async def job_posting_assistant(request: AIRequest, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    chat = await get_ai_chat()
    
    message = UserMessage(
        text=f"""You are an expert healthcare recruitment assistant. Please help with this job posting question or request:
        
        Question/Request: {request.text}
        
        Please provide helpful, professional advice about:
        - Job posting best practices
        - Healthcare industry standards
        - Salary recommendations
        - Job description writing tips
        - Requirement suggestions
        - Benefits recommendations
        - Any other relevant recruiting guidance
        
        Be specific, actionable, and focused on healthcare roles."""
    )
    
    response = await chat.send_message(message)
    return {"assistant_response": response}

# Chatbot Routes
@api_router.post("/chat")
async def chat_with_bot(request: AIRequest):
    chat = await get_ai_chat()
    
    # Enhanced system message for lead generation
    lead_gen_prompt = f"""
    You are a helpful assistant for HealthCare Jobs platform. Your goals are:
    1. Help visitors find relevant healthcare jobs
    2. Encourage job seekers to register and create profiles
    3. Help employers understand our posting services
    4. Collect contact information when appropriate
    5. Be professional, helpful, and engaging
    
    User message: {request.text}
    
    If this seems like a potential lead (someone interested in jobs or hiring), subtly encourage them to:
    - Register on the platform for personalized job matching
    - Contact us for premium employer services
    - Sign up for job alerts
    """
    
    message = UserMessage(text=lead_gen_prompt)
    response = await chat.send_message(message)
    
    # Save chat message
    chat_msg = ChatMessage(
        session_id=f"anonymous_{uuid.uuid4()}",
        message=request.text,
        response=response
    )
    
    chat_dict = chat_msg.dict()
    chat_dict['created_at'] = chat_dict['created_at'].isoformat()
    
    await db.chat_messages.insert_one(chat_dict)
    
    return {"response": response}

# Admin Routes
@api_router.get("/admin/jobs/pending", response_model=List[Job])
async def get_pending_jobs(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    jobs = await db.jobs.find({"is_approved": False}).to_list(length=None)
    
    for job in jobs:
        if isinstance(job.get('created_at'), str):
            job['created_at'] = datetime.fromisoformat(job['created_at'])
        if job.get('expires_at') and isinstance(job.get('expires_at'), str):
            job['expires_at'] = datetime.fromisoformat(job['expires_at'])
        
        # Convert integer salaries to strings for backward compatibility
        if job.get('salary_min') is not None and isinstance(job.get('salary_min'), int):
            job['salary_min'] = str(job['salary_min'])
        if job.get('salary_max') is not None and isinstance(job.get('salary_max'), int):
            job['salary_max'] = str(job['salary_max'])
    
    return [Job(**job) for job in jobs]

@api_router.put("/admin/jobs/{job_id}/approve")
async def approve_job(job_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.jobs.update_one(
        {"id": job_id},
        {"$set": {"is_approved": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Auto-regenerate sitemap after job approval (now visible in sitemap)
    regenerate_sitemap_async()
    
    return {"message": "Job approved successfully"}

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_jobs = await db.jobs.count_documents({})
    pending_jobs = await db.jobs.count_documents({"is_approved": False})
    total_applications = await db.applications.count_documents({})
    total_blogs = await db.blog_posts.count_documents({})
    published_blogs = await db.blog_posts.count_documents({"is_published": True})
    
    return {
        "total_users": total_users,
        "total_jobs": total_jobs,
        "pending_jobs": pending_jobs,
        "total_applications": total_applications,
        "total_blogs": total_blogs,
        "published_blogs": published_blogs
    }

# Admin Job Creation
@api_router.post("/admin/jobs", response_model=Job)
async def admin_create_job(job_data: JobCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate external URL must be HTTPS
    if job_data.is_external and job_data.external_url:
        if not job_data.external_url.startswith('https://'):
            raise HTTPException(
                status_code=400, 
                detail="Invalid URL. External job URLs must start with https:// for security"
            )
    
    job = Job(**job_data.dict(), employer_id=current_user.id, is_approved=True)
    
    # Generate unique slug from title, company, location, and job ID
    base_slug = generate_slug(job.title, job.company, job.location, job.id)
    job.slug = await ensure_unique_slug(base_slug, job.id)
    
    job_dict = job.dict()
    # Keep datetime objects as-is for MongoDB - do NOT convert to isoformat
    # MongoDB natively supports datetime objects and the app expects them for proper sorting
    
    await db.jobs.insert_one(job_dict)
    
    # Auto-regenerate sitemap after new job
    regenerate_sitemap_async()
    
    return job

# Blog Management Routes
@api_router.post("/admin/blog", response_model=BlogPost)
async def create_blog_post(
    title: str = Form(...),
    excerpt: str = Form(""),
    content: str = Form(...),
    category: str = Form("healthcare"),
    is_published: bool = Form(False),
    is_featured: bool = Form(False),
    seo_title: str = Form(""),
    seo_description: str = Form(""),
    faqs: str = Form("[]"),
    featured_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Generate slug from title
    slug = title.lower().replace(' ', '-').replace('/', '-')
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    
    # Handle featured image upload
    featured_image_url = None
    if featured_image and featured_image.filename:
        try:
            # Read the image file
            contents = await featured_image.read()
            
            # Validate file size (max 1MB for database storage)
            if len(contents) > 1 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Featured image too large. Maximum size is 1MB. Please compress the image.")
            
            # Store as base64 in database
            import base64
            encoded_image = base64.b64encode(contents).decode('utf-8')
            
            # Get file extension
            file_ext = featured_image.filename.split('.')[-1].lower()
            
            # Create data URL for browser display
            mime_type = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp'
            }.get(file_ext, 'image/jpeg')
            
            featured_image_url = f"data:{mime_type};base64,{encoded_image}"
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error processing image: {e}")
            # Continue without image if upload fails
            featured_image_url = None
    
    # Parse FAQs from JSON string
    try:
        faqs_list = json.loads(faqs) if faqs else []
    except:
        faqs_list = []
    
    # Create blog post
    blog_data = {
        "title": title,
        "excerpt": excerpt,
        "content": content,
        "category": category,
        "is_published": is_published,
        "is_featured": is_featured,
        "seo_title": seo_title,
        "seo_description": seo_description,
        "faqs": faqs_list,
        "featured_image": featured_image_url,
        "author_id": current_user.id,
        "slug": slug,
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if is_published:
        blog_data["published_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.blog_posts.insert_one(blog_data)
    
    # Auto-regenerate sitemap after new blog post (if published)
    if is_published:
        regenerate_sitemap_async()
    
    # Return the created blog post
    return BlogPost(**blog_data)

@api_router.get("/admin/blog", response_model=List[BlogPost])
async def get_admin_blog_posts(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    posts = await db.blog_posts.find().sort("created_at", -1).to_list(length=None)
    
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if post.get('updated_at') and isinstance(post.get('updated_at'), str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
        if post.get('published_at') and isinstance(post.get('published_at'), str):
            post['published_at'] = datetime.fromisoformat(post['published_at'])
    
    return [BlogPost(**post) for post in posts]

@api_router.put("/admin/blog/{post_id}", response_model=BlogPost)
async def update_blog_post(
    post_id: str,
    title: str = Form(...),
    excerpt: str = Form(""),
    content: str = Form(...),
    category: str = Form("healthcare"),
    is_published: bool = Form(False),
    is_featured: bool = Form(False),
    seo_title: str = Form(""),
    seo_description: str = Form(""),
    faqs: str = Form("[]"),
    featured_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing_post = await db.blog_posts.find_one({"id": post_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Generate slug from title
    slug = title.lower().replace(' ', '-').replace('/', '-')
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    
    # Handle featured image upload
    featured_image_url = existing_post.get('featured_image')  # Keep existing image
    if featured_image and featured_image.filename:
        try:
            # Read the image file
            contents = await featured_image.read()
            
            # Validate file size (max 1MB for database storage)
            if len(contents) > 1 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Featured image too large. Maximum size is 1MB. Please compress the image.")
            
            # Store as base64 in database
            import base64
            encoded_image = base64.b64encode(contents).decode('utf-8')
            
            # Get file extension
            file_ext = featured_image.filename.split('.')[-1].lower()
            
            # Create data URL for browser display
            mime_type = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp'
            }.get(file_ext, 'image/jpeg')
            
            featured_image_url = f"data:{mime_type};base64,{encoded_image}"
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error processing image: {e}")
            # Keep existing image if upload fails
            featured_image_url = existing_post.get('featured_image')
    
    # Parse FAQs from JSON string
    try:
        faqs_list = json.loads(faqs) if faqs else []
    except:
        faqs_list = []
    
    update_data = {
        "title": title,
        "excerpt": excerpt,
        "content": content,
        "category": category,
        "is_published": is_published,
        "is_featured": is_featured,
        "seo_title": seo_title,
        "seo_description": seo_description,
        "faqs": faqs_list,
        "featured_image": featured_image_url,
        "slug": slug,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if is_published and not existing_post.get('published_at'):
        update_data["published_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    # Auto-regenerate sitemap if blog post is published
    if is_published or existing_post.get('is_published'):
        regenerate_sitemap_async()
    
    updated_post = await db.blog_posts.find_one({"id": post_id})
    if updated_post.get('created_at') and isinstance(updated_post.get('created_at'), str):
        updated_post['created_at'] = datetime.fromisoformat(updated_post['created_at'])
    if updated_post.get('updated_at') and isinstance(updated_post.get('updated_at'), str):
        updated_post['updated_at'] = datetime.fromisoformat(updated_post['updated_at'])
    if updated_post.get('published_at') and isinstance(updated_post.get('published_at'), str):
        updated_post['published_at'] = datetime.fromisoformat(updated_post['published_at'])
    
    return BlogPost(**updated_post)

@api_router.post("/admin/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload image for blog content or featured image"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, WebP and GIF allowed")
    
    # Validate file size (max 500KB for inline images in blog content)
    contents = await file.read()
    if len(contents) > 500 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 500KB for inline images")
    
    # Store as base64 data URL
    import base64
    encoded_image = base64.b64encode(contents).decode('utf-8')
    
    # Get file extension
    file_ext = file.filename.split('.')[-1].lower()
    
    # Create data URL for browser display
    mime_type = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
    }.get(file_ext, 'image/jpeg')
    
    data_url = f"data:{mime_type};base64,{encoded_image}"
    
    return {
        "success": True,
        "url": data_url,
        "filename": file.filename
    }

@api_router.delete("/admin/blog/{post_id}")
async def delete_blog_post(post_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Auto-regenerate sitemap after blog deletion
    regenerate_sitemap_async()
    
    return {"message": "Blog post deleted successfully"}

# Admin Job Management Routes
@api_router.get("/admin/jobs/all", response_model=List[Job])
async def get_all_jobs_admin(
    include_deleted: bool = False,
    current_user: User = Depends(get_current_user)
):
    """Get all jobs for admin management (including soft-deleted if requested)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if not include_deleted:
        query["is_deleted"] = {"$ne": True}
    
    jobs = await db.jobs.find(query).sort("created_at", -1).to_list(length=None)
    
    for job in jobs:
        if isinstance(job.get('created_at'), str):
            job['created_at'] = datetime.fromisoformat(job['created_at'])
        if job.get('expires_at') and isinstance(job.get('expires_at'), str):
            job['expires_at'] = datetime.fromisoformat(job['expires_at'])
        
        # Convert integer salaries to strings for backward compatibility
        if job.get('salary_min') is not None and isinstance(job.get('salary_min'), int):
            job['salary_min'] = str(job['salary_min'])
        if job.get('salary_max') is not None and isinstance(job.get('salary_max'), int):
            job['salary_max'] = str(job['salary_max'])
    
    return [Job(**job) for job in jobs]

@api_router.get("/admin/jobs/{job_id}", response_model=Job)
async def get_job_by_id_admin(job_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific job by ID for editing"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if isinstance(job.get('created_at'), str):
        job['created_at'] = datetime.fromisoformat(job['created_at'])
    if job.get('expires_at') and isinstance(job.get('expires_at'), str):
        job['expires_at'] = datetime.fromisoformat(job['expires_at'])
    
    # Convert integer salaries to strings for backward compatibility
    if job.get('salary_min') is not None and isinstance(job.get('salary_min'), int):
        job['salary_min'] = str(job['salary_min'])
    if job.get('salary_max') is not None and isinstance(job.get('salary_max'), int):
        job['salary_max'] = str(job['salary_max'])
    
    return Job(**job)

@api_router.put("/admin/jobs/{job_id}", response_model=Job)
async def update_job_admin(
    job_id: str,
    job_data: JobCreate,
    current_user: User = Depends(get_current_user)
):
    """Update a job listing"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing_job = await db.jobs.find_one({"id": job_id})
    if not existing_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Validate external URL must be HTTPS
    if job_data.is_external and job_data.external_url:
        if not job_data.external_url.startswith('https://'):
            raise HTTPException(
                status_code=400, 
                detail="Invalid URL. External job URLs must start with https:// for security"
            )
    
    update_data = job_data.dict(exclude_unset=True)
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # DO NOT regenerate slug on edit to preserve existing URLs and SEO
    # The slug is generated only once during job creation
    # This prevents breaking external links, bookmarks, and search engine indexing
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": update_data}
    )
    
    updated_job = await db.jobs.find_one({"id": job_id})
    if isinstance(updated_job.get('created_at'), str):
        updated_job['created_at'] = datetime.fromisoformat(updated_job['created_at'])
    if updated_job.get('expires_at') and isinstance(updated_job.get('expires_at'), str):
        updated_job['expires_at'] = datetime.fromisoformat(updated_job['expires_at'])
    
    # Auto-regenerate sitemap after job update
    regenerate_sitemap_async()
    
    return Job(**updated_job)

@api_router.delete("/admin/jobs/{job_id}")
async def soft_delete_job(job_id: str, current_user: User = Depends(get_current_user)):
    """Soft delete a job (mark as deleted, don't remove from database)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.jobs.update_one(
        {"id": job_id},
        {"$set": {"is_deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Auto-regenerate sitemap after job deletion
    regenerate_sitemap_async()
    

@api_router.post("/admin/jobs/{job_id}/archive")
async def archive_job(job_id: str, current_user: User = Depends(get_current_user)):
    """Archive a job posting (deadline over)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.jobs.update_one(
        {"id": job_id},
        {"$set": {"is_archived": True, "archived_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Auto-regenerate sitemap after job archival
    regenerate_sitemap_async()
    
    return {"message": "Job archived successfully"}

@api_router.post("/admin/jobs/{job_id}/unarchive")
async def unarchive_job(job_id: str, current_user: User = Depends(get_current_user)):
    """Unarchive a job posting"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.jobs.update_one(
        {"id": job_id},
        {"$set": {"is_archived": False}, "$unset": {"archived_at": ""}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Auto-regenerate sitemap after job unarchival
    regenerate_sitemap_async()
    
    return {"message": "Job unarchived successfully"}

    return {"message": "Job deleted successfully"}

@api_router.post("/admin/jobs/{job_id}/restore")
async def restore_job(job_id: str, current_user: User = Depends(get_current_user)):
    """Restore a soft-deleted job"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.jobs.update_one(
        {"id": job_id},
        {"$set": {"is_deleted": False}, "$unset": {"deleted_at": ""}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Auto-regenerate sitemap after job restoration
    regenerate_sitemap_async()
    
    return {"message": "Job restored successfully"}

@api_router.post("/admin/jobs/{job_id}/regenerate-slug")
async def regenerate_job_slug(job_id: str, current_user: User = Depends(get_current_user)):
    """Manually regenerate slug for a job (use cautiously - will change URL)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Generate new slug with job ID
    title = job.get('title', 'Job')
    company = job.get('company', '')
    location = job.get('location', '')
    
    old_slug = job.get('slug', '')
    base_slug = generate_slug(title, company, location, job_id)
    new_slug = await ensure_unique_slug(base_slug, job_id)
    
    # Update the slug
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": {"slug": new_slug, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Regenerate sitemap
    regenerate_sitemap_async()
    
    return {
        "message": "Slug regenerated successfully",
        "old_slug": old_slug,
        "new_slug": new_slug,
        "old_url": f"/jobs/{old_slug}",
        "new_url": f"/jobs/{new_slug}",
        "warning": "Old URL will no longer work. Update any external links."
    }


# Public Blog Routes
@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts(featured_only: bool = False, limit: int = 10, skip: int = 0):
    query = {"is_published": True}
    if featured_only:
        query["is_featured"] = True
    
    posts = await db.blog_posts.find(query).sort("published_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if post.get('updated_at') and isinstance(post.get('updated_at'), str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
        if post.get('published_at') and isinstance(post.get('published_at'), str):
            post['published_at'] = datetime.fromisoformat(post['published_at'])
    
    return [BlogPost(**post) for post in posts]

@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_blog_post_by_slug(slug: str):
    post = await db.blog_posts.find_one({"slug": slug, "is_published": True})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    if isinstance(post.get('created_at'), str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if post.get('updated_at') and isinstance(post.get('updated_at'), str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    if post.get('published_at') and isinstance(post.get('published_at'), str):
        post['published_at'] = datetime.fromisoformat(post['published_at'])
    
    return BlogPost(**post)

# SEO Management Routes
@api_router.get("/admin/seo/{page_type}")
async def get_seo_settings(page_type: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    seo_data = await db.seo_settings.find_one({"page_type": page_type})
    if not seo_data:
        # Return default SEO settings
        return {
            "page_type": page_type,
            "title": "Jobslly - Future of Healthcare Careers",
            "description": "Discover healthcare opportunities for Doctors, Pharmacists, Dentists, Physiotherapists, and Nurses with AI-powered matching.",
            "keywords": ["healthcare jobs", "medical careers", "doctor jobs", "nurse jobs", "pharmacy jobs"],
            "og_image": None,
            "canonical_url": None
        }
    
    return seo_data

@api_router.post("/admin/seo")
async def update_seo_settings(seo_data: SEOSettings, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.seo_settings.update_one(
        {"page_type": seo_data.page_type},
        {"$set": seo_data.dict()},
        upsert=True
    )
    return {"success": True, "message": "SEO settings updated"}

# Database Management Routes (Admin only)
@api_router.delete("/admin/clear-database")
async def clear_database(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Clear all collections
        collections_to_clear = [
            "users", "jobs", "applications", "job_leads", "user_profiles",
            "chat_messages", "blog_posts", "seo_settings", "saved_jobs"
        ]
        
        cleared_collections = []
        for collection_name in collections_to_clear:
            collection = getattr(db, collection_name)
            result = await collection.delete_many({})
            cleared_collections.append(f"{collection_name}: {result.deleted_count} documents")
        
        return {
            "success": True,
            "message": "Database cleared successfully",
            "details": cleared_collections
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing database: {str(e)}")

@api_router.post("/admin/initialize-users")
async def initialize_default_users():
    """Initialize the database with default users"""
    try:
        # Check if users already exist
        existing_users = await db.users.count_documents({})
        if existing_users > 0:
            raise HTTPException(status_code=400, detail="Users already exist in database")
        
        # Create default users
        default_users = [
            {
                "full_name": "Admin User",
                "email": "admin@gmail.com", 
                "password": "password",
                "role": "admin"
            },
            {
                "full_name": "HR Manager",
                "email": "hr@gmail.com",
                "password": "password", 
                "role": "employer"
            },
            {
                "full_name": "Dr. John Smith", 
                "email": "doctor@gmail.com",
                "password": "password",
                "role": "job_seeker"
            }
        ]
        
        created_users = []
        for user_data in default_users:
            # Hash password
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            hashed_password = pwd_context.hash(user_data["password"][:72])
            
            # Create user
            user = User(
                full_name=user_data["full_name"],
                email=user_data["email"],
                hashed_password=hashed_password,
                role=UserRole(user_data["role"]),
                is_verified=True
            )
            
            user_dict = user.dict()
            user_dict['created_at'] = user_dict['created_at'].isoformat()
            
            await db.users.insert_one(user_dict)
            created_users.append(f"{user_data['email']} ({user_data['role']})")
        
        return {
            "success": True,
            "message": "Default users created successfully",
            "users": created_users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating users: {str(e)}")
    
    return {"message": "SEO settings updated successfully"}

# Enhanced User Profile Routes
@api_router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    profile = await db.user_profiles.find_one({"user_id": current_user.id})
    
    if not profile:
        # Create default profile
        default_profile = UserProfile(user_id=current_user.id)
        profile_dict = default_profile.dict()
        profile_dict['created_at'] = profile_dict['created_at'].isoformat()
        if profile_dict.get('updated_at'):
            profile_dict['updated_at'] = profile_dict['updated_at'].isoformat()
        
        await db.user_profiles.insert_one(profile_dict)
        return default_profile
    
    # Convert datetime strings back to datetime objects
    if isinstance(profile.get('created_at'), str):
        profile['created_at'] = datetime.fromisoformat(profile['created_at'])
    if profile.get('updated_at') and isinstance(profile.get('updated_at'), str):
        profile['updated_at'] = datetime.fromisoformat(profile['updated_at'])
    
    return UserProfile(**profile)

@api_router.put("/profile", response_model=UserProfile)
async def update_user_profile(profile_data: UserProfileUpdate, current_user: User = Depends(get_current_user)):
    # Calculate profile completion percentage
    completion_fields = ['phone', 'address', 'specialization', 'experience_years', 'skills']
    filled_fields = 0
    
    # Count filled fields
    if profile_data.phone:
        filled_fields += 1
    if profile_data.address:
        filled_fields += 1
    if profile_data.specialization:
        filled_fields += 1
    if profile_data.experience_years is not None and profile_data.experience_years >= 0:
        filled_fields += 1
    if profile_data.skills and len(profile_data.skills) > 0:
        filled_fields += 1
    
    completion_percentage = int((filled_fields / len(completion_fields)) * 100)
    
    update_data = profile_data.dict(exclude_unset=True)
    update_data['profile_completion'] = completion_percentage
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.user_profiles.update_one(
        {"user_id": current_user.id},
        {"$set": update_data},
        upsert=True
    )
    
    updated_profile = await db.user_profiles.find_one({"user_id": current_user.id})
    if isinstance(updated_profile.get('created_at'), str):
        updated_profile['created_at'] = datetime.fromisoformat(updated_profile['created_at'])
    if updated_profile.get('updated_at') and isinstance(updated_profile.get('updated_at'), str):
        updated_profile['updated_at'] = datetime.fromisoformat(updated_profile['updated_at'])
    
    return UserProfile(**updated_profile)

# Job Seeker Profile Management
@api_router.post("/job-seekers/profile", response_model=JobSeekerProfile)
async def create_or_update_job_seeker_profile(profile_data: JobSeekerProfileCreate):
    """
    Create or update job seeker profile based on email
    """
    # Check if job seeker profile already exists
    existing_profile = await db.job_seekers.find_one({"email": profile_data.email})
    
    if existing_profile:
        # Update existing profile
        update_data = profile_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        update_data["last_activity"] = datetime.now(timezone.utc).isoformat()
        
        await db.job_seekers.update_one(
            {"email": profile_data.email},
            {"$set": update_data}
        )
        
        # Get updated profile
        updated_profile = await db.job_seekers.find_one({"email": profile_data.email})
        return JobSeekerProfile(**updated_profile)
    else:
        # Create new profile
        profile = JobSeekerProfile(
            email=profile_data.email,
            name=profile_data.name,
            phone=profile_data.phone,
            country_code=profile_data.country_code,
            current_position=profile_data.current_position,
            experience_years=profile_data.experience_years,
            location=profile_data.location,
            specialization=profile_data.specialization,
            first_source=profile_data.source
        )
        
        # Calculate profile completion
        profile.profile_completion = calculate_profile_completion(profile)
        
        profile_dict = profile.dict()
        profile_dict['acquisition_date'] = profile_dict['acquisition_date'].isoformat()
        profile_dict['last_activity'] = profile_dict['last_activity'].isoformat()
        profile_dict['created_at'] = profile_dict['created_at'].isoformat()
        profile_dict['updated_at'] = profile_dict['updated_at'].isoformat()
        
        await db.job_seekers.insert_one(profile_dict)
        return profile

def calculate_profile_completion(profile: JobSeekerProfile) -> int:
    """
    Calculate profile completion percentage
    """
    fields_to_check = ['name', 'phone', 'current_position', 'experience_years', 'location', 'specialization']
    filled_fields = 0
    
    for field in fields_to_check:
        if getattr(profile, field) is not None and getattr(profile, field) != "":
            filled_fields += 1
    
    return int((filled_fields / len(fields_to_check)) * 100)

@api_router.get("/job-seekers/profile/{email}", response_model=JobSeekerProfile)
async def get_job_seeker_profile_by_email(email: str):
    """
    Get job seeker profile by email
    """
    profile = await db.job_seekers.find_one({"email": email})
    if not profile:
        raise HTTPException(status_code=404, detail="Job seeker profile not found")
    
    return JobSeekerProfile(**profile)

@api_router.post("/job-seekers/track-application")
async def track_job_application(email: str, job_id: str):
    """
    Track job application for a job seeker
    """
    # Update job seeker profile with application
    await db.job_seekers.update_one(
        {"email": email},
        {
            "$inc": {"total_applications": 1},
            "$addToSet": {"jobs_applied": job_id},
            "$set": {
                "last_activity": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True  # Create if doesn't exist
    )
    
    return {"success": True, "message": "Application tracked successfully"}

# Job Application Endpoint
@api_router.post("/jobs/{job_id}/apply", response_model=Dict)
async def apply_for_job(job_id: str, application_data: dict, current_user: User = Depends(get_current_user)):
    print(f"🎯 Application attempt - Job ID: {job_id}, User ID: {current_user.id}, User Email: {current_user.email}")
    
    # Check if job exists (try slug first, then ID for backward compatibility)
    job = await db.jobs.find_one({"slug": job_id, "is_deleted": {"$ne": True}})
    if not job:
        job = await db.jobs.find_one({"id": job_id, "is_deleted": {"$ne": True}})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Use actual job ID from database, not slug
    actual_job_id = job['id']
    
    # Check if user already applied for this job
    existing_application = await db.applications.find_one({
        "job_id": actual_job_id,
        "applicant_id": current_user.id
    })
    if existing_application:
        print(f"⚠️ Duplicate application detected for user {current_user.id} on job {actual_job_id}")
        raise HTTPException(status_code=400, detail="You have already applied for this job")
    
    # Create job application
    application = JobApplication(
        job_id=actual_job_id,
        applicant_id=current_user.id,
        cover_letter=application_data.get('cover_letter', ''),
        resume_url=application_data.get('resume_url')
    )
    
    application_dict = application.dict()
    application_dict['created_at'] = application_dict['created_at'].isoformat()
    
    print(f"💾 Saving application to database: {application_dict}")
    await db.applications.insert_one(application_dict)
    print(f"✅ Application saved successfully with ID: {application.id}")
    
    # Update job application count
    await db.jobs.update_one(
        {"id": actual_job_id},
        {"$inc": {"application_count": 1}}
    )
    
    return {
        "success": True,
        "message": "Application submitted successfully",
        "application_id": application.id
    }

# Enhanced Job Application with Lead Collection
@api_router.post("/jobs/{job_id}/apply-lead", response_model=Dict)
async def apply_with_lead_collection(job_id: str, lead_data: JobLeadCreate):
    # Check if job exists (try slug first, then ID for backward compatibility)
    job = await db.jobs.find_one({"slug": job_id, "is_deleted": {"$ne": True}})
    if not job:
        job = await db.jobs.find_one({"id": job_id, "is_deleted": {"$ne": True}})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create or update job seeker profile
    profile_data = JobSeekerProfileCreate(
        email=lead_data.email,
        name=lead_data.name,
        phone=lead_data.phone,
        current_position=lead_data.current_position,
        experience_years=lead_data.experience_years,
        source="job_application"
    )
    
    job_seeker_profile = await create_or_update_job_seeker_profile(profile_data)
    
    # Track the application (use actual job ID from database, not slug)
    actual_job_id = job['id']
    await track_job_application(lead_data.email, actual_job_id)
    
    # Create job lead for backward compatibility
    lead = JobLead(
        job_id=actual_job_id,
        job_seeker_id=job_seeker_profile.id,
        name=lead_data.name,
        email=lead_data.email,
        phone=lead_data.phone,
        current_position=lead_data.current_position,
        experience_years=lead_data.experience_years,
        message=lead_data.message
    )
    
    lead_dict = lead.dict()
    lead_dict['created_at'] = lead_dict['created_at'].isoformat()
    
    await db.job_leads.insert_one(lead_dict)
    
    return {
        "success": True,
        "message": "Application submitted successfully! We'll contact you soon.",
        "lead_id": lead.id,
        "job_seeker_id": job_seeker_profile.id
    }

# Job Seeker Dashboard Routes
@api_router.get("/job-seeker/dashboard")
async def get_job_seeker_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail="Job seeker access required")
    
    # Get applications
    applications = await db.applications.find({"applicant_id": current_user.id}).to_list(length=None)
    
    # Get job leads (applications through lead collection)
    leads = await db.job_leads.find({"email": current_user.email}).to_list(length=None)
    
    # Get saved jobs (if any)
    saved_jobs = await db.saved_jobs.find({"user_id": current_user.id}).to_list(length=None) or []
    
    # Get profile completion
    profile = await db.user_profiles.find_one({"user_id": current_user.id})
    profile_completion = profile.get('profile_completion', 0) if profile else 0
    
    # Convert ObjectId to string for JSON serialization
    def clean_document(doc):
        if doc and '_id' in doc:
            doc['_id'] = str(doc['_id'])
        return doc
    
    # Clean applications and leads for JSON serialization
    clean_applications = [clean_document(app) for app in applications] if applications else []
    clean_leads = [clean_document(lead) for lead in leads] if leads else []
    clean_saved_jobs = [clean_document(job) for job in saved_jobs] if saved_jobs else []
    
    return {
        "applications_count": len(applications),
        "leads_count": len(leads),
        "saved_jobs_count": len(saved_jobs),
        "profile_completion": profile_completion,
        "recent_applications": clean_applications[-5:] if clean_applications else [],
        "recent_leads": clean_leads[-5:] if clean_leads else []
    }


# Get Job Seeker Applications with Job Details
@api_router.get("/job-seeker/applications")
async def get_job_seeker_applications(current_user: User = Depends(get_current_user)):
    print(f"📋 Fetching applications for user: {current_user.id}, email: {current_user.email}, role: {current_user.role}")
    
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail="Job seeker access required")
    
    # Get applications from applications collection (logged-in applications)
    applications = await db.applications.find({"applicant_id": current_user.id}).to_list(length=None)
    print(f"💼 Found {len(applications)} applications in applications collection")
    if applications:
        print(f"   Application IDs: {[app['id'] for app in applications]}")
    
    # Get applications from job_leads collection (applied before logging in, matched by email)
    leads = await db.job_leads.find({"email": current_user.email}).to_list(length=None)
    print(f"📧 Found {len(leads)} leads in job_leads collection")
    if leads:
        print(f"   Lead IDs: {[lead['id'] for lead in leads]}")
    
    # Combine and get job details for each application
    all_applications = []
    
    # Process regular applications
    for app in applications:
        job = await db.jobs.find_one({"id": app['job_id'], "is_deleted": {"$ne": True}})
        if job:
            # Skip jobs with missing critical fields
            if not job.get('title') or not job.get('company'):
                print(f"   ⚠️ Skipping application - job has missing title or company. Job ID: {app['job_id']}")
                continue
                
            all_applications.append({
                "id": app['id'],
                "job_id": app['job_id'],
                "job_title": job.get('title'),
                "company": job.get('company'),
                "location": job.get('location', 'Not specified'),
                "job_type": job.get('job_type', 'Not specified'),
                "category": job.get('category', 'General'),
                "applied_at": app['created_at'],
                "status": app.get('status', 'pending'),
                "application_type": "registered"
            })
            print(f"   ✅ Processed application for job: {job.get('title')}")
        else:
            print(f"   ⚠️ Job not found or deleted for application ID: {app['id']}, job_id: {app['job_id']}")
    
    # Process lead applications
    for lead in leads:
        # Check if this lead has already been converted to a regular application
        existing_app = any(app['job_id'] == lead['job_id'] for app in applications)
        if not existing_app:
            job = await db.jobs.find_one({"id": lead['job_id'], "is_deleted": {"$ne": True}})
            if job:
                # Skip jobs with missing critical fields
                if not job.get('title') or not job.get('company'):
                    print(f"   ⚠️ Skipping lead application - job has missing title or company. Job ID: {lead['job_id']}")
                    continue
                    
                all_applications.append({
                    "id": lead['id'],
                    "job_id": lead['job_id'],
                    "job_title": job.get('title'),
                    "company": job.get('company'),
                    "location": job.get('location', 'Not specified'),
                    "job_type": job.get('job_type', 'Not specified'),
                    "category": job.get('category', 'General'),
                    "applied_at": lead['created_at'],
                    "status": "pending",
                    "application_type": "lead"
                })
                print(f"   ✅ Processed lead for job: {job.get('title')}")
            else:
                print(f"   ⚠️ Job not found or deleted for lead ID: {lead['id']}, job_id: {lead['job_id']}")
        else:
            print(f"   ℹ️ Skipping lead {lead['id']} - already converted to application")
    
    # Sort by applied date (most recent first)
    all_applications.sort(key=lambda x: x['applied_at'], reverse=True)
    
    print(f"📊 Total applications to return: {len(all_applications)}")
    
    return {
        "total_applications": len(all_applications),
        "applications": all_applications
    }

# Employer Dashboard Routes
@api_router.get("/employer/dashboard")
async def get_employer_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Employer access required")
    
    # Get employer's jobs
    jobs = await db.jobs.find({"employer_id": current_user.id}).to_list(length=None)
    
    # Get applications for employer's jobs
    job_ids = [job['id'] for job in jobs]
    applications = await db.applications.find({"job_id": {"$in": job_ids}}).to_list(length=None)
    
    # Get leads for employer's jobs
    leads = await db.job_leads.find({"job_id": {"$in": job_ids}}).to_list(length=None)
    
    # Calculate stats
    total_views = sum(job.get('view_count', 0) for job in jobs)
    total_applications = sum(job.get('application_count', 0) for job in jobs)
    
    return {
        "total_jobs": len(jobs),
        "active_jobs": len([j for j in jobs if j.get('is_approved', False)]),
        "pending_jobs": len([j for j in jobs if not j.get('is_approved', False)]),
        "total_applications": total_applications,
        "total_leads": len(leads),
        "total_views": total_views,
        "recent_jobs": jobs[-5:] if jobs else [],
        "recent_applications": applications[-10:] if applications else [],
        "recent_leads": leads[-10:] if leads else []
    }

# Enhanced Job Routes with View Tracking
@api_router.get("/jobs/{job_id}/details", response_model=Job)
async def get_job_with_tracking(job_id: str):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Increment view count
    await db.jobs.update_one(
        {"id": job_id},
        {"$inc": {"view_count": 1}}
    )
    
    # Convert datetime strings
    if isinstance(job.get('created_at'), str):
        job['created_at'] = datetime.fromisoformat(job['created_at'])
    if job.get('expires_at') and isinstance(job.get('expires_at'), str):
        job['expires_at'] = datetime.fromisoformat(job['expires_at'])
    if job.get('application_deadline') and isinstance(job.get('application_deadline'), str):
        job['application_deadline'] = datetime.fromisoformat(job['application_deadline'])
    
    return Job(**job)

# Admin Lead Management
@api_router.get("/admin/leads")
async def get_all_leads(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    leads = await db.job_leads.find().sort("created_at", -1).to_list(length=None)
    
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    
    return leads

# Admin Job Seeker Management
@api_router.get("/admin/job-seekers", response_model=List[JobSeekerProfile])
async def get_all_job_seekers(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    job_seekers = await db.job_seekers.find().sort("created_at", -1).to_list(length=None)
    return [JobSeekerProfile(**seeker) for seeker in job_seekers]

@api_router.get("/admin/job-seekers/stats")
async def get_job_seeker_stats(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get total counts
    total_job_seekers = await db.job_seekers.count_documents({})
    registered_users = await db.job_seekers.count_documents({"is_registered": True})
    leads_only = await db.job_seekers.count_documents({"is_registered": False})
    
    # Get application statistics
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_applications": {"$sum": "$total_applications"},
                "avg_applications_per_user": {"$avg": "$total_applications"}
            }
        }
    ]
    
    app_stats = await db.job_seekers.aggregate(pipeline).to_list(length=1)
    total_applications = app_stats[0]["total_applications"] if app_stats else 0
    avg_applications = round(app_stats[0]["avg_applications_per_user"], 2) if app_stats else 0
    
    # Get top sources
    sources_pipeline = [
        {
            "$group": {
                "_id": "$first_source",
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    
    top_sources = await db.job_seekers.aggregate(sources_pipeline).to_list(length=5)
    
    return {
        "total_job_seekers": total_job_seekers,
        "registered_users": registered_users,
        "leads_only": leads_only,
        "total_applications": total_applications,
        "avg_applications_per_user": avg_applications,
        "top_sources": top_sources,
        "conversion_rate": round((registered_users / total_job_seekers * 100), 2) if total_job_seekers > 0 else 0
    }

# SEO Routes - Robots.txt
@api_router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots_txt():
    """
    Generate robots.txt for search engine crawling
    Allow all public content, disallow auth and private pages
    """
    robots_content = """User-agent: *
Allow: /
Disallow: /login/
Disallow: /register/
Disallow: /student-profiles/

Sitemap: https://jobslly.com/sitemap.xml
"""
    
    return PlainTextResponse(content=robots_content)


# Migration endpoint to generate slugs for existing jobs (admin only)
@api_router.post("/admin/migrate-job-slugs")
async def migrate_job_slugs(current_user: User = Depends(get_current_user)):
    """
    Generate slugs for all existing jobs that do not have one
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Find all jobs without slugs
        jobs_without_slugs = await db.jobs.find({"slug": {"$in": [None, ""]}}).to_list(length=None)
        
        updated_count = 0
        for job in jobs_without_slugs:
            # Generate slug from title, company, location, and job ID
            base_slug = generate_slug(
                job.get('title', 'Job'),
                job.get('company'),
                job.get('location'),
                job.get('id')
            )
            unique_slug = await ensure_unique_slug(base_slug, job['id'])
            
            # Update job with slug
            await db.jobs.update_one(
                {"id": job['id']},
                {"$set": {"slug": unique_slug}}
            )
            updated_count += 1
            print(f"✅ Generated slug '{unique_slug}' for job: {job['title']}")
        
        return {
            "success": True,
            "message": f"Successfully generated slugs for {updated_count} jobs",
            "updated_count": updated_count
        }
    except Exception as e:
        print(f"❌ Error migrating slugs: {e}")
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")


# Contact Form Submission
class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    subject: str
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "new"  # new, read, replied

@api_router.post("/contact-us")
async def submit_contact_form(contact: ContactMessage):
    """
    Submit contact form inquiry
    """
    try:
        print(f"📧 New contact form submission from: {contact.name} ({contact.email})")
        
        # Save to database
        contact_dict = contact.dict()
        await db.contact_messages.insert_one(contact_dict)
        
        print(f"✅ Contact message saved with ID: {contact.id}")
        
        return {
            "success": True,
            "message": "Thank you for contacting us! We'll get back to you within 24 hours.",
            "message_id": contact.id
        }
    except Exception as e:
        print(f"❌ Error saving contact message: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")

# SEO Meta Tags API for dynamic pages
@app.get("/api/seo/meta/{page_type}")
async def get_seo_meta(page_type: str, job_id: str = None, blog_slug: str = None):
    # Create XML root element
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
    
    base_url = 'https://jobslly.com'
    
    # Static pages with trailing slashes for consistency
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
    
    for path, priority, changefreq in static_pages:
        url_elem = ET.SubElement(urlset, "url")
        ET.SubElement(url_elem, "loc").text = f"{base_url}{path}"
        ET.SubElement(url_elem, "lastmod").text = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        ET.SubElement(url_elem, "changefreq").text = changefreq
        ET.SubElement(url_elem, "priority").text = priority
    
    # Dynamic job pages - fully dynamic, auto-updates when jobs are added/updated/deleted
    try:
        # Only include approved, non-deleted, non-expired jobs
        query = {
            "is_approved": True,
            "is_deleted": {"$ne": True}
        }
        
        # Exclude expired jobs
        current_time = datetime.now(timezone.utc)
        query["$or"] = [
            {"expires_at": None},
            {"expires_at": {"$gt": current_time}}
        ]
        
        jobs = await db.jobs.find(query).to_list(length=None)
        
        for job in jobs:
            url_elem = ET.SubElement(urlset, "url")
            
            # Use slug if available, fallback to ID (without trailing slash for job detail pages)
            job_identifier = job.get('slug', job['id'])
            ET.SubElement(url_elem, "loc").text = f"{base_url}/jobs/{job_identifier}"
            
            # Use updated_at if available, fallback to created_at
            lastmod = job.get('updated_at') or job.get('created_at', datetime.now(timezone.utc))
            if isinstance(lastmod, str):
                lastmod = datetime.fromisoformat(lastmod)
            ET.SubElement(url_elem, "lastmod").text = lastmod.strftime('%Y-%m-%d')
            
            # As per requirements
            ET.SubElement(url_elem, "changefreq").text = "daily"
            ET.SubElement(url_elem, "priority").text = "0.80"
            
    except Exception as e:
        logger.error(f"Error fetching jobs for sitemap: {e}")
    
    # Dynamic blog pages - use slugs with trailing slashes
    try:
        blog_posts = await db.blog_posts.find({"is_published": True}).to_list(length=None)
        for post in blog_posts:
            url_elem = ET.SubElement(urlset, "url")
            ET.SubElement(url_elem, "loc").text = f"{base_url}/blogs/{post['slug']}/"
            
            # Use published date or creation date
            lastmod = post.get('published_at') or post.get('created_at', datetime.now(timezone.utc))
            if isinstance(lastmod, str):
                lastmod = datetime.fromisoformat(lastmod)
            ET.SubElement(url_elem, "lastmod").text = lastmod.strftime('%Y-%m-%d')
            ET.SubElement(url_elem, "changefreq").text = "monthly"
            ET.SubElement(url_elem, "priority").text = "0.7"
    except Exception as e:
        logger.error(f"Error fetching blog posts for sitemap: {e}")
    
    # Convert to string
    xml_str = ET.tostring(urlset, encoding='unicode', method='xml')
    xml_formatted = f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_str}'
    
    return Response(content=xml_formatted, media_type="application/xml")

# Dynamic Sitemap.xml at /sitemap.xml - Generated on-demand
@app.get("/sitemap.xml", response_class=Response)
async def get_sitemap_root():
    """
    Serve dynamic sitemap.xml - regenerates on every request for true real-time updates
    For performance, you can add caching with TTL if needed
    """
    import asyncio
    
    # Regenerate sitemap file
    subprocess.run(['python3', '/app/backend/update_sitemap.py'], check=False)
    
    # Read and serve the generated sitemap
    try:
        with open('/app/frontend/public/sitemap.xml', 'r') as f:
            xml_content = f.read()
        return Response(content=xml_content, media_type="application/xml")
    except FileNotFoundError:
        # Fallback: generate inline if file doesn't exist
        urlset = ET.Element("urlset")
        urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
        
        base_url = 'https://jobslly.com'
        static_pages = [
            ('/', '1.0', 'daily'),
            ('/jobs/', '0.9', 'daily'),
            ('/blogs/', '0.8', 'daily'),
        ]
        
        for path, priority, changefreq in static_pages:
            url_elem = ET.SubElement(urlset, "url")
            ET.SubElement(url_elem, "loc").text = f"{base_url}{path}"
            ET.SubElement(url_elem, "lastmod").text = datetime.now(timezone.utc).strftime('%Y-%m-%d')
            ET.SubElement(url_elem, "changefreq").text = changefreq
            ET.SubElement(url_elem, "priority").text = priority
        
        xml_str = ET.tostring(urlset, encoding='unicode', method='xml')
        xml_formatted = f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_str}'
        return Response(content=xml_formatted, media_type="application/xml")

# SEO Meta Tags API for dynamic pages
@app.get("/api/seo/meta/{page_type}")
async def get_seo_meta(page_type: str, job_id: str = None, blog_slug: str = None):
    """
    Get SEO metadata for dynamic pages
    """
    try:
        if page_type == "job" and job_id:
            job = await db.jobs.find_one({"id": job_id, "is_approved": True})
            if job:
                return {
                    "title": f"{job['title']} - {job['company']} | Jobslly Healthcare Jobs",
                    "description": f"Apply for {job['title']} position at {job['company']} in {job['location']}. {job['description'][:150]}...",
                    "keywords": [job['title'], job['company'], job['location'], "healthcare jobs", "medical careers"],
                    "og_image": f"https://jobslly.com/api/og-image/job/{job_id}",
                    "canonical": f"https://jobslly.com/jobs/{job_id}"
                }
        
        elif page_type == "blog" and blog_slug:
            post = await db.blog_posts.find_one({"slug": blog_slug, "is_published": True})
            if post:
                return {
                    "title": post.get('seo_title') or f"{post['title']} | Jobslly Health Hub",
                    "description": post.get('seo_description') or post['excerpt'],
                    "keywords": post.get('seo_keywords', []) + [post['category'], "healthcare", "careers"],
                    "og_image": post.get('featured_image') or f"https://jobslly.com/api/og-image/blog/{blog_slug}",
                    "canonical": f"https://jobslly.com/blog/{blog_slug}"
                }
    
    except Exception as e:
        logger.error(f"Error fetching SEO meta for {page_type}: {e}")
    
    # Default meta tags
    return {
        "title": "Jobslly - Future of Healthcare Careers",
        "description": "Discover healthcare opportunities for doctors, nurses, pharmacists, dentists, and physiotherapists with AI-powered career matching.",
        "keywords": ["healthcare jobs", "medical careers", "doctor jobs", "nurse jobs"],
        "og_image": "https://jobslly.com/og-image-default.jpg",
        "canonical": "https://jobslly.com"
    }

# Include the router
app.include_router(api_router)

# Add WWW to non-WWW redirect middleware (must be added before CORS)
app.add_middleware(WWWRedirectMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Mount static files for production frontend serving
import os.path
frontend_build_path = "/app/frontend/build"

# Check if frontend build exists
if os.path.exists(frontend_build_path):
    # Mount static files (CSS, JS, images, etc.) - only if static directory exists
    static_path = f"{frontend_build_path}/static"
    if os.path.exists(static_path) and os.path.isdir(static_path):
        app.mount("/static", StaticFiles(directory=static_path), name="static")
    
    # Catch-all route for frontend (must be last)
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        """
        Serve React frontend for all non-API routes.
        Pure client-side rendering - no server-side HTML injection.
        """
        # Skip API routes - they're handled by api_router
        if full_path.startswith('api/'):
            raise HTTPException(status_code=404, detail="Not found")
        
        # Return the index.html for all frontend routes
        index_path = f"{frontend_build_path}/index.html"
        
        if os.path.exists(index_path):
            return FileResponse(index_path, media_type="text/html")
        else:
            raise HTTPException(status_code=404, detail="Frontend build not found")

@app.on_event("startup")
async def startup_event():
    """Initialize background tasks on app startup"""
    # Start job expiry scheduler
    from job_scheduler import start_scheduler
    start_scheduler()
    print("✅ Job expiry scheduler started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()