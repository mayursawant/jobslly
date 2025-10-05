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
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

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

class AIRequest(BaseModel):
    text: str
    job_id: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

# Helper functions
def hash_password(password: str) -> str:
    # Ensure password is not longer than 72 bytes for bcrypt
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

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
    
    return {
        "total_users": total_users,
        "total_jobs": total_jobs,
        "pending_jobs": pending_jobs,
        "total_applications": total_applications
    }

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