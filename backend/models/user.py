"""
User models for HealthCare Jobs API.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Dict, Any
from datetime import datetime, timezone
import uuid


class UserRole(str):
    """User role constants"""
    JOB_SEEKER = "job_seeker"
    EMPLOYER = "employer"
    ADMIN = "admin"


class User(BaseModel):
    """User model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: str = UserRole.JOB_SEEKER
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    profile_data: Dict[str, Any] = {}


class UserCreate(BaseModel):
    """User creation model"""
    email: EmailStr
    password: str
    full_name: str
    phone: str = None
    role: str = UserRole.JOB_SEEKER


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT Token model"""
    access_token: str
    token_type: str
