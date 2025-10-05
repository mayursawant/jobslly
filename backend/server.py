from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
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

# Load environment variables
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="HealthCare Jobs API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

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
    role: str = UserRole.JOB_SEEKER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    company: str
    location: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    job_type: str = "full_time"  # full_time, part_time, contract
    requirements: List[str] = []
    benefits: List[str] = []
    employer_id: str
    is_approved: bool = False
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
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    # Professional Information
    specialization: Optional[str] = None
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
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    specialization: Optional[str] = None
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

# Lead Collection Model
class JobLead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    name: str
    email: str
    phone: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[int] = None
    message: Optional[str] = None
    source: str = "job_application"  # job_application, chatbot, newsletter
    status: str = "new"  # new, contacted, converted, closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobLeadCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[int] = None
    message: Optional[str] = None

class JobCreate(BaseModel):
    title: str
    description: str
    company: str
    location: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    job_type: str = "full_time"
    requirements: List[str] = []
    benefits: List[str] = []

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
    user = User(**user_data.dict(exclude={'password'}))
    user_dict = user.dict()
    user_dict['hashed_password'] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
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
    
    job = Job(**job_data.dict(), employer_id=current_user.id)
    job_dict = job.dict()
    job_dict['created_at'] = job_dict['created_at'].isoformat()
    if job_dict.get('expires_at'):
        job_dict['expires_at'] = job_dict['expires_at'].isoformat()
    
    await db.jobs.insert_one(job_dict)
    return job

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(skip: int = 0, limit: int = 20, approved_only: bool = True):
    query = {"is_approved": True} if approved_only else {}
    jobs = await db.jobs.find(query).skip(skip).limit(limit).to_list(length=None)
    
    for job in jobs:
        if isinstance(job.get('created_at'), str):
            job['created_at'] = datetime.fromisoformat(job['created_at'])
        if job.get('expires_at') and isinstance(job.get('expires_at'), str):
            job['expires_at'] = datetime.fromisoformat(job['expires_at'])
    
    return [Job(**job) for job in jobs]

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if isinstance(job.get('created_at'), str):
        job['created_at'] = datetime.fromisoformat(job['created_at'])
    if job.get('expires_at') and isinstance(job.get('expires_at'), str):
        job['expires_at'] = datetime.fromisoformat(job['expires_at'])
    
    return Job(**job)

# Job Application Routes
@api_router.post("/jobs/{job_id}/apply", response_model=JobApplication)
async def apply_to_job(job_id: str, cover_letter: Optional[str] = None, current_user: User = Depends(get_current_user)):
    # Check if job exists
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing_application = await db.applications.find_one({"job_id": job_id, "applicant_id": current_user.id})
    if existing_application:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    application = JobApplication(
        job_id=job_id,
        applicant_id=current_user.id,
        cover_letter=cover_letter
    )
    
    app_dict = application.dict()
    app_dict['created_at'] = app_dict['created_at'].isoformat()
    
    await db.applications.insert_one(app_dict)
    return application

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
    
    job = Job(**job_data.dict(), employer_id=current_user.id, is_approved=True)
    job_dict = job.dict()
    job_dict['created_at'] = job_dict['created_at'].isoformat()
    if job_dict.get('expires_at'):
        job_dict['expires_at'] = job_dict['expires_at'].isoformat()
    
    await db.jobs.insert_one(job_dict)
    return job

# Blog Management Routes
@api_router.post("/admin/blog", response_model=BlogPost)
async def create_blog_post(blog_data: BlogPostCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Generate slug from title
    slug = blog_data.title.lower().replace(' ', '-').replace('/', '-')
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    
    blog_post = BlogPost(**blog_data.dict(), author_id=current_user.id, slug=slug)
    if blog_data.is_published:
        blog_post.published_at = datetime.now(timezone.utc)
    
    blog_dict = blog_post.dict()
    blog_dict['created_at'] = blog_dict['created_at'].isoformat()
    if blog_dict.get('updated_at'):
        blog_dict['updated_at'] = blog_dict['updated_at'].isoformat()
    if blog_dict.get('published_at'):
        blog_dict['published_at'] = blog_dict['published_at'].isoformat()
    
    await db.blog_posts.insert_one(blog_dict)
    return blog_post

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
async def update_blog_post(post_id: str, blog_data: BlogPostCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing_post = await db.blog_posts.find_one({"id": post_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Update slug if title changed
    slug = blog_data.title.lower().replace(' ', '-').replace('/', '-')
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    
    update_data = blog_data.dict()
    update_data['slug'] = slug
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    if blog_data.is_published and not existing_post.get('is_published'):
        update_data['published_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    updated_post = await db.blog_posts.find_one({"id": post_id})
    if isinstance(updated_post.get('created_at'), str):
        updated_post['created_at'] = datetime.fromisoformat(updated_post['created_at'])
    if updated_post.get('updated_at') and isinstance(updated_post.get('updated_at'), str):
        updated_post['updated_at'] = datetime.fromisoformat(updated_post['updated_at'])
    if updated_post.get('published_at') and isinstance(updated_post.get('published_at'), str):
        updated_post['published_at'] = datetime.fromisoformat(updated_post['published_at'])
    
    return BlogPost(**updated_post)

@api_router.delete("/admin/blog/{post_id}")
async def delete_blog_post(post_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return {"message": "Blog post deleted successfully"}

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
    
    return {"message": "SEO settings updated successfully"}

# Include the router
app.include_router(api_router)

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()