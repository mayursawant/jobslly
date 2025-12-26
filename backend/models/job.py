"""
Job models for HealthCare Jobs API.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class Job(BaseModel):
    """Job listing model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: Optional[str] = None
    description: str
    company: str
    location: str
    salary_min: Optional[str] = None
    salary_max: Optional[str] = None
    currency: str = "INR"
    job_type: str = "full_time"
    categories: List[str] = []
    requirements: List[str] = []
    benefits: List[str] = []
    employer_id: str
    is_approved: bool = False
    is_deleted: bool = False
    is_archived: bool = False
    is_external: bool = False
    external_url: Optional[str] = None
    application_deadline: Optional[datetime] = None
    view_count: int = 0
    application_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None


class JobCreate(BaseModel):
    """Job creation model"""
    title: str
    description: str
    company: str
    location: str
    salary_min: Optional[str] = None
    salary_max: Optional[str] = None
    currency: str = "INR"
    job_type: str = "full_time"
    categories: List[str] = []
    requirements: List[str] = []
    benefits: List[str] = []
    is_external: bool = False
    external_url: Optional[str] = None
    application_deadline: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class JobApplication(BaseModel):
    """Job application model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    applicant_id: str
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class JobLead(BaseModel):
    """Job lead/application model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    job_seeker_id: str
    name: str
    email: str
    phone: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[str] = None
    message: Optional[str] = None
    source: str = "job_application"
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class JobLeadCreate(BaseModel):
    """Job lead creation model"""
    name: str
    email: str
    phone: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[str] = None
    message: Optional[str] = None
    job_id: Optional[str] = None


class ChatMessage(BaseModel):
    """Chat message model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    message: str
    response: str
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AIRequest(BaseModel):
    """AI request model"""
    text: str
    job_id: Optional[str] = None
