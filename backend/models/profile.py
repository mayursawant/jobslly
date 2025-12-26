"""
Profile models for HealthCare Jobs API.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timezone
import uuid


class UserProfile(BaseModel):
    """User profile model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
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
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    preferred_job_type: List[str] = []
    preferred_locations: List[str] = []
    salary_expectation_min: Optional[int] = None
    salary_expectation_max: Optional[int] = None
    profile_completion: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None


class UserProfileUpdate(BaseModel):
    """User profile update model"""
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


class JobSeekerProfile(BaseModel):
    """Job seeker profile model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[str] = None
    location: Optional[str] = None
    specialization: Optional[str] = None
    user_id: Optional[str] = None
    total_applications: int = 0
    jobs_applied: List[str] = []
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    first_source: str = "direct"
    acquisition_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_registered: bool = False
    profile_completion: int = 0
    status: str = "lead"
    resume_uploaded: bool = False
    cover_letters_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class JobSeekerProfileCreate(BaseModel):
    """Job seeker profile creation model"""
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    current_position: Optional[str] = None
    experience_years: Optional[str] = None
    location: Optional[str] = None
    specialization: Optional[str] = None
    source: str = "direct"
