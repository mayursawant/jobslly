"""
Blog models for HealthCare Jobs API.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class FAQItem(BaseModel):
    """FAQ item model"""
    question: str
    answer: str


class BlogPost(BaseModel):
    """Blog post model"""
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


class BlogPostSummary(BaseModel):
    """Lightweight blog post model for listings"""
    id: str
    title: str
    slug: str
    excerpt: str
    featured_image: Optional[str] = None
    author_id: str
    category: str = "healthcare"
    tags: List[str] = []
    is_published: bool = False
    is_featured: bool = False
    created_at: datetime
    published_at: Optional[datetime] = None


class BlogPostCreate(BaseModel):
    """Blog post creation model"""
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
    """SEO settings model"""
    page_type: str
    title: str
    description: str
    keywords: List[str] = []
    og_image: Optional[str] = None
    canonical_url: Optional[str] = None
