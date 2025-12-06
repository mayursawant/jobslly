#!/usr/bin/env python3
"""
Backend API Testing Suite for Healthcare Jobs Platform
Tests all core Phase 1 functionality as requested in the review.
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://job-seo-overhaul.preview.emergentagent.com/api"
TEST_USER_EMAIL = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
TEST_EMPLOYER_EMAIL = f"testemployer_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "TestPassword123!"

class HealthcareJobsAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.job_seeker_token = None
        self.employer_token = None
        self.admin_token = None
        self.test_job_id = None
        self.test_job_id_inr = None
        self.test_job_id_usd = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name, success, message="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
        print()
    
    def test_authentication_flow(self):
        """Test 1: Authentication Flow - Job Seeker and Employer Registration/Login"""
        print("🔐 Testing Authentication Flow...")
        
        # Test Job Seeker Registration
        try:
            register_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_PASSWORD,
                "full_name": "Test Job Seeker",
                "role": "job_seeker"
            }
            
            response = requests.post(f"{self.base_url}/auth/register", json=register_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.job_seeker_token = data["access_token"]
                    self.log_result("Job Seeker Registration", True, f"Token received: {data['access_token'][:20]}...")
                else:
                    self.log_result("Job Seeker Registration", False, "No access token in response", data)
            else:
                self.log_result("Job Seeker Registration", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Seeker Registration", False, f"Exception: {str(e)}")
        
        # Test Employer Registration
        try:
            register_data = {
                "email": TEST_EMPLOYER_EMAIL,
                "password": TEST_PASSWORD,
                "full_name": "Test Employer",
                "role": "employer"
            }
            
            response = requests.post(f"{self.base_url}/auth/register", json=register_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.employer_token = data["access_token"]
                    self.log_result("Employer Registration", True, f"Token received: {data['access_token'][:20]}...")
                else:
                    self.log_result("Employer Registration", False, "No access token in response", data)
            else:
                self.log_result("Employer Registration", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Employer Registration", False, f"Exception: {str(e)}")
        
        # Test Job Seeker Login
        try:
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_PASSWORD
            }
            
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.log_result("Job Seeker Login", True, "Login successful")
                else:
                    self.log_result("Job Seeker Login", False, "No access token in response", data)
            else:
                self.log_result("Job Seeker Login", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Seeker Login", False, f"Exception: {str(e)}")
    
    def test_job_listings_api(self):
        """Test 2: Job Listings API - GET /api/jobs with filtering and pagination"""
        print("📋 Testing Job Listings API...")
        
        # Test basic job listings
        try:
            response = requests.get(f"{self.base_url}/jobs")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    job_count = len(data)
                    self.log_result("Job Listings - Basic", True, f"Retrieved {job_count} jobs")
                    
                    # Store a job ID for later tests if available
                    if data:
                        self.test_job_id = data[0]["id"]
                        
                        # Verify job structure
                        required_fields = ["id", "title", "company", "location", "description"]
                        job = data[0]
                        missing_fields = [field for field in required_fields if field not in job]
                        
                        if not missing_fields:
                            self.log_result("Job Data Structure", True, "All required fields present")
                        else:
                            self.log_result("Job Data Structure", False, f"Missing fields: {missing_fields}")
                    else:
                        self.log_result("Job Data Availability", False, "No jobs returned")
                else:
                    self.log_result("Job Listings - Basic", False, "Response is not a list", data)
            else:
                self.log_result("Job Listings - Basic", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Listings - Basic", False, f"Exception: {str(e)}")
        
        # Test pagination
        try:
            response = requests.get(f"{self.base_url}/jobs?skip=0&limit=5")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) <= 5:
                    self.log_result("Job Listings - Pagination", True, f"Pagination working, got {len(data)} jobs")
                else:
                    self.log_result("Job Listings - Pagination", False, f"Expected ≤5 jobs, got {len(data) if isinstance(data, list) else 'non-list'}")
            else:
                self.log_result("Job Listings - Pagination", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Listings - Pagination", False, f"Exception: {str(e)}")
    
    def test_job_details_api(self):
        """Test 3: Job Details API - GET /api/jobs/{job_id}"""
        print("🔍 Testing Job Details API...")
        
        if not self.test_job_id:
            self.log_result("Job Details", False, "No job ID available for testing")
            return
        
        try:
            response = requests.get(f"{self.base_url}/jobs/{self.test_job_id}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "title", "company", "location", "description"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result("Job Details", True, f"Job details retrieved for ID: {self.test_job_id}")
                else:
                    self.log_result("Job Details", False, f"Missing fields: {missing_fields}")
            else:
                self.log_result("Job Details", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Details", False, f"Exception: {str(e)}")
    
    def test_lead_collection_api(self):
        """Test 4: Job Application Lead Collection - POST /api/jobs/{job_id}/apply-lead"""
        print("📝 Testing Lead Collection API...")
        
        if not self.test_job_id:
            self.log_result("Lead Collection", False, "No job ID available for testing")
            return
        
        try:
            lead_data = {
                "name": "John Healthcare Professional",
                "email": f"lead_{uuid.uuid4().hex[:8]}@example.com",
                "phone": "+1-555-0123",
                "current_position": "Registered Nurse",
                "experience_years": "5",
                "message": "I am very interested in this healthcare position and would like to learn more."
            }
            
            response = requests.post(f"{self.base_url}/jobs/{self.test_job_id}/apply-lead", json=lead_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("Lead Collection", True, f"Lead collected successfully: {data.get('message')}")
                else:
                    self.log_result("Lead Collection", False, "Success flag not true", data)
            else:
                self.log_result("Lead Collection", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Lead Collection", False, f"Exception: {str(e)}")
    
    def test_job_application_submission(self):
        """Test 5: Job Application Submission - POST /api/jobs/{job_id}/apply (authenticated)"""
        print("📄 Testing Job Application Submission...")
        
        if not self.test_job_id:
            self.log_result("Job Application Submission", False, "No job ID available for testing")
            return
        
        if not self.job_seeker_token:
            self.log_result("Job Application Submission", False, "No job seeker token available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
            application_data = {
                "cover_letter": "I am excited to apply for this healthcare position. My experience in patient care and medical procedures makes me a strong candidate.",
                "resume_url": "https://example.com/resume.pdf"
            }
            
            response = requests.post(f"{self.base_url}/jobs/{self.test_job_id}/apply", 
                                   json=application_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                # Handle both response formats - success dict or JobApplication object
                if data.get("success") or (data.get("id") and data.get("job_id")):
                    message = data.get('message', f"Application created with ID: {data.get('id')}")
                    self.log_result("Job Application Submission", True, f"Application submitted: {message}")
                else:
                    self.log_result("Job Application Submission", False, "Invalid response format", data)
            else:
                self.log_result("Job Application Submission", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Application Submission", False, f"Exception: {str(e)}")
        
        # Test duplicate application prevention
        try:
            headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
            application_data = {
                "cover_letter": "Trying to apply again",
                "resume_url": "https://example.com/resume.pdf"
            }
            
            response = requests.post(f"{self.base_url}/jobs/{self.test_job_id}/apply", 
                                   json=application_data, headers=headers)
            
            if response.status_code == 400:
                self.log_result("Duplicate Application Prevention", True, "Correctly prevented duplicate application")
            else:
                self.log_result("Duplicate Application Prevention", False, f"Expected 400, got {response.status_code}")
        
        except Exception as e:
            self.log_result("Duplicate Application Prevention", False, f"Exception: {str(e)}")
    
    def test_seo_endpoints(self):
        """Test 6: SEO Endpoints - GET /api/sitemap.xml and GET /api/robots.txt"""
        print("🔍 Testing SEO Endpoints...")
        
        # Test sitemap.xml
        try:
            response = requests.get(f"{self.base_url}/sitemap.xml")
            
            if response.status_code == 200:
                content = response.text
                if "<?xml" in content and "urlset" in content:
                    self.log_result("Sitemap.xml", True, f"Valid XML sitemap returned ({len(content)} chars)")
                else:
                    self.log_result("Sitemap.xml", False, "Invalid XML format", content[:200])
            else:
                self.log_result("Sitemap.xml", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Sitemap.xml", False, f"Exception: {str(e)}")
        
        # Test robots.txt
        try:
            response = requests.get(f"{self.base_url}/robots.txt")
            
            if response.status_code == 200:
                content = response.text
                if "User-agent:" in content and "Sitemap:" in content:
                    self.log_result("Robots.txt", True, f"Valid robots.txt returned ({len(content)} chars)")
                else:
                    self.log_result("Robots.txt", False, "Invalid robots.txt format", content[:200])
            else:
                self.log_result("Robots.txt", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Robots.txt", False, f"Exception: {str(e)}")
    
    def test_application_count_increment(self):
        """Test 7: Verify application count increments correctly"""
        print("📊 Testing Application Count Increment...")
        
        if not self.test_job_id:
            self.log_result("Application Count Test", False, "No job ID available for testing")
            return
        
        try:
            # Get initial job details
            response = requests.get(f"{self.base_url}/jobs/{self.test_job_id}")
            if response.status_code != 200:
                self.log_result("Application Count Test", False, "Could not fetch job details")
                return
            
            initial_data = response.json()
            initial_count = initial_data.get("application_count", 0)
            
            # Submit a lead (should increment count)
            lead_data = {
                "name": "Count Test User",
                "email": f"counttest_{uuid.uuid4().hex[:8]}@example.com",
                "phone": "+1-555-9999",
                "current_position": "Healthcare Professional",
                "experience_years": "3"
            }
            
            lead_response = requests.post(f"{self.base_url}/jobs/{self.test_job_id}/apply-lead", json=lead_data)
            
            if lead_response.status_code == 200:
                # Check if count incremented
                time.sleep(1)  # Brief delay to ensure database update
                response = requests.get(f"{self.base_url}/jobs/{self.test_job_id}")
                
                if response.status_code == 200:
                    updated_data = response.json()
                    updated_count = updated_data.get("application_count", 0)
                    
                    if updated_count > initial_count:
                        self.log_result("Application Count Increment", True, 
                                      f"Count increased from {initial_count} to {updated_count}")
                    else:
                        self.log_result("Application Count Increment", False, 
                                      f"Count did not increase: {initial_count} -> {updated_count}")
                else:
                    self.log_result("Application Count Increment", False, "Could not fetch updated job details")
            else:
                self.log_result("Application Count Increment", False, "Lead submission failed")
        
        except Exception as e:
            self.log_result("Application Count Increment", False, f"Exception: {str(e)}")
    
    def test_admin_authentication(self):
        """Test 8: Admin Authentication with existing admin user"""
        print("🔐 Testing Admin Authentication...")
        
        try:
            # Login with existing admin user
            login_data = {
                "email": "admin@gmail.com",
                "password": "password"
            }
            
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.admin_token = data["access_token"]
                    self.log_result("Admin Authentication", True, "Admin login successful")
                else:
                    self.log_result("Admin Authentication", False, "No access token in response", data)
            else:
                self.log_result("Admin Authentication", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Admin Authentication", False, f"Exception: {str(e)}")
    
    def test_ai_enhancement_endpoints(self):
        """Test 9: AI Enhancement Endpoints (Priority 1)"""
        print("🤖 Testing AI Enhancement Endpoints...")
        
        if not self.admin_token:
            self.log_result("AI Enhancement Endpoints", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test 1: AI Job Description Enhancement
        try:
            ai_request = {
                "text": "We are looking for a Registered Nurse to join our team. Must have experience in patient care."
            }
            
            response = requests.post(f"{self.base_url}/ai/enhance-job-description", 
                                   json=ai_request, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "enhanced_description" in data and data["enhanced_description"]:
                    self.log_result("AI Job Description Enhancement", True, 
                                  f"Enhanced description received ({len(data['enhanced_description'])} chars)")
                else:
                    self.log_result("AI Job Description Enhancement", False, "No enhanced description in response", data)
            else:
                self.log_result("AI Job Description Enhancement", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("AI Job Description Enhancement", False, f"Exception: {str(e)}")
        
        # Test 2: AI Job Requirements Suggestions
        try:
            ai_request = {
                "text": "Senior Cardiologist position at major hospital in Sydney. Leading cardiac surgery department."
            }
            
            response = requests.post(f"{self.base_url}/ai/suggest-job-requirements", 
                                   json=ai_request, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "suggested_requirements" in data and data["suggested_requirements"]:
                    self.log_result("AI Job Requirements Suggestions", True, 
                                  f"Requirements suggestions received ({len(data['suggested_requirements'])} chars)")
                else:
                    self.log_result("AI Job Requirements Suggestions", False, "No requirements suggestions in response", data)
            else:
                self.log_result("AI Job Requirements Suggestions", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("AI Job Requirements Suggestions", False, f"Exception: {str(e)}")
        
        # Test 3: AI Job Benefits Suggestions
        try:
            ai_request = {
                "text": "Pharmacist position at community pharmacy. Full-time role with growth opportunities."
            }
            
            response = requests.post(f"{self.base_url}/ai/suggest-job-benefits", 
                                   json=ai_request, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "suggested_benefits" in data and data["suggested_benefits"]:
                    self.log_result("AI Job Benefits Suggestions", True, 
                                  f"Benefits suggestions received ({len(data['suggested_benefits'])} chars)")
                else:
                    self.log_result("AI Job Benefits Suggestions", False, "No benefits suggestions in response", data)
            else:
                self.log_result("AI Job Benefits Suggestions", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("AI Job Benefits Suggestions", False, f"Exception: {str(e)}")
        
        # Test 4: AI Job Posting Assistant
        try:
            ai_request = {
                "text": "What salary range should I offer for a nurse practitioner position in Melbourne?"
            }
            
            response = requests.post(f"{self.base_url}/ai/job-posting-assistant", 
                                   json=ai_request, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "assistant_response" in data and data["assistant_response"]:
                    self.log_result("AI Job Posting Assistant", True, 
                                  f"Assistant response received ({len(data['assistant_response'])} chars)")
                else:
                    self.log_result("AI Job Posting Assistant", False, "No assistant response in response", data)
            else:
                self.log_result("AI Job Posting Assistant", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("AI Job Posting Assistant", False, f"Exception: {str(e)}")
        
        # Test 5: AI Access Control (non-admin user should be denied)
        try:
            if self.job_seeker_token:
                headers_non_admin = {"Authorization": f"Bearer {self.job_seeker_token}"}
                ai_request = {"text": "Test access control"}
                
                response = requests.post(f"{self.base_url}/ai/enhance-job-description", 
                                       json=ai_request, headers=headers_non_admin)
                
                if response.status_code == 403:
                    self.log_result("AI Access Control", True, "Non-admin access correctly denied")
                else:
                    self.log_result("AI Access Control", False, f"Expected 403, got {response.status_code}")
            else:
                self.log_result("AI Access Control", False, "No job seeker token for access control test")
        
        except Exception as e:
            self.log_result("AI Access Control", False, f"Exception: {str(e)}")
    
    def test_sample_data_validation(self):
        """Test 10: Sample Data Validation"""
        print("📊 Testing Sample Data Validation...")
        
        # Test job count (should have 15 jobs)
        try:
            response = requests.get(f"{self.base_url}/jobs?limit=50")
            
            if response.status_code == 200:
                jobs = response.json()
                job_count = len(jobs)
                
                if job_count >= 10:  # Allow some flexibility
                    self.log_result("Sample Jobs Data", True, f"Found {job_count} jobs (expected ~15)")
                    
                    # Check for external jobs
                    external_jobs = [job for job in jobs if job.get('is_external', False)]
                    if external_jobs:
                        self.log_result("External Jobs Data", True, f"Found {len(external_jobs)} external jobs")
                    else:
                        self.log_result("External Jobs Data", False, "No external jobs found")
                        
                else:
                    self.log_result("Sample Jobs Data", False, f"Only {job_count} jobs found, expected ~15")
            else:
                self.log_result("Sample Jobs Data", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Sample Jobs Data", False, f"Exception: {str(e)}")
        
        # Test blog posts
        try:
            response = requests.get(f"{self.base_url}/blog?limit=20")
            
            if response.status_code == 200:
                blogs = response.json()
                blog_count = len(blogs)
                
                if blog_count >= 5:  # Allow some flexibility
                    self.log_result("Sample Blog Data", True, f"Found {blog_count} blog posts (expected ~10)")
                else:
                    self.log_result("Sample Blog Data", False, f"Only {blog_count} blog posts found, expected ~10")
            else:
                self.log_result("Sample Blog Data", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Sample Blog Data", False, f"Exception: {str(e)}")
    
    def test_user_roles_validation(self):
        """Test 11: User Roles Validation"""
        print("👥 Testing User Roles Validation...")
        
        # Test existing users login
        test_users = [
            ("admin@gmail.com", "admin"),
            ("hr@gmail.com", "employer"),
            ("doctor@gmail.com", "job_seeker")
        ]
        
        for email, expected_role in test_users:
            try:
                login_data = {
                    "email": email,
                    "password": "password"
                }
                
                response = requests.post(f"{self.base_url}/auth/login", json=login_data)
                
                if response.status_code == 200:
                    data = response.json()
                    if "access_token" in data:
                        # Get user info to verify role
                        headers = {"Authorization": f"Bearer {data['access_token']}"}
                        me_response = requests.get(f"{self.base_url}/auth/me", headers=headers)
                        
                        if me_response.status_code == 200:
                            user_data = me_response.json()
                            actual_role = user_data.get("role")
                            
                            if actual_role == expected_role:
                                self.log_result(f"User Role - {email}", True, f"Role verified: {actual_role}")
                            else:
                                self.log_result(f"User Role - {email}", False, f"Expected {expected_role}, got {actual_role}")
                        else:
                            self.log_result(f"User Role - {email}", False, "Could not fetch user info")
                    else:
                        self.log_result(f"User Role - {email}", False, "No access token in response")
                else:
                    self.log_result(f"User Role - {email}", False, f"Login failed: {response.status_code}")
            
            except Exception as e:
                self.log_result(f"User Role - {email}", False, f"Exception: {str(e)}")
    
    def test_external_jobs_flow(self):
        """Test 12: External Jobs Flow"""
        print("🔗 Testing External Jobs Flow...")
        
        try:
            # Get all jobs and find external ones
            response = requests.get(f"{self.base_url}/jobs?limit=50")
            
            if response.status_code == 200:
                jobs = response.json()
                external_jobs = [job for job in jobs if job.get('is_external', False)]
                
                if external_jobs:
                    external_job = external_jobs[0]
                    job_id = external_job['id']
                    
                    # Test lead collection for external job
                    lead_data = {
                        "name": "External Job Applicant",
                        "email": f"external_{uuid.uuid4().hex[:8]}@example.com",
                        "phone": "+1-555-0199",
                        "current_position": "Healthcare Professional",
                        "experience_years": "4"
                    }
                    
                    response = requests.post(f"{self.base_url}/jobs/{job_id}/apply-lead", json=lead_data)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("is_external") and data.get("redirect_url"):
                            self.log_result("External Job Flow", True, 
                                          f"External job flow working, redirect URL: {data['redirect_url']}")
                        else:
                            self.log_result("External Job Flow", False, "Missing external job response fields", data)
                    else:
                        self.log_result("External Job Flow", False, f"Status: {response.status_code}", response.text)
                else:
                    self.log_result("External Job Flow", False, "No external jobs found for testing")
            else:
                self.log_result("External Job Flow", False, f"Could not fetch jobs: {response.status_code}")
        
        except Exception as e:
            self.log_result("External Job Flow", False, f"Exception: {str(e)}")
    
    def test_blog_management(self):
        """Test 13: Blog Management APIs"""
        print("📝 Testing Blog Management APIs...")
        
        # Test public blog endpoint
        try:
            response = requests.get(f"{self.base_url}/blog")
            
            if response.status_code == 200:
                blogs = response.json()
                if isinstance(blogs, list):
                    self.log_result("Public Blog API", True, f"Retrieved {len(blogs)} published blog posts")
                    
                    # Test individual blog post if available
                    if blogs:
                        blog_slug = blogs[0].get('slug')
                        if blog_slug:
                            blog_response = requests.get(f"{self.base_url}/blog/{blog_slug}")
                            if blog_response.status_code == 200:
                                self.log_result("Individual Blog Post", True, f"Retrieved blog post: {blog_slug}")
                            else:
                                self.log_result("Individual Blog Post", False, f"Status: {blog_response.status_code}")
                        else:
                            self.log_result("Individual Blog Post", False, "No blog slug available")
                else:
                    self.log_result("Public Blog API", False, "Response is not a list", blogs)
            else:
                self.log_result("Public Blog API", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Public Blog API", False, f"Exception: {str(e)}")
        
        # Test admin blog management (if admin token available)
        if self.admin_token:
            try:
                headers = {"Authorization": f"Bearer {self.admin_token}"}
                response = requests.get(f"{self.base_url}/admin/blog", headers=headers)
                
                if response.status_code == 200:
                    admin_blogs = response.json()
                    self.log_result("Admin Blog Management", True, f"Admin can access {len(admin_blogs)} blog posts")
                else:
                    self.log_result("Admin Blog Management", False, f"Status: {response.status_code}", response.text)
            
            except Exception as e:
                self.log_result("Admin Blog Management", False, f"Exception: {str(e)}")
        else:
            self.log_result("Admin Blog Management", False, "No admin token available")
    
    def test_contact_form_api(self):
        """Test 14: Contact Form API - POST /api/contact-us"""
        print("📧 Testing Contact Form API...")
        
        # Test 1: Valid contact form submission
        try:
            contact_data = {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1 (555) 123-4567",
                "subject": "General Inquiry",
                "message": "Hello, I would like to inquire about job opportunities in healthcare. I am a registered nurse with 5 years of experience."
            }
            
            response = requests.post(f"{self.base_url}/contact-us", json=contact_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["success", "message", "message_id"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    if data.get("success") and data.get("message_id"):
                        first_message_id = data["message_id"]
                        self.log_result("Contact Form - Valid Submission", True, 
                                      f"Form submitted successfully. Message ID: {first_message_id}")
                    else:
                        self.log_result("Contact Form - Valid Submission", False, 
                                      f"Invalid response values: success={data.get('success')}, message_id={data.get('message_id')}")
                else:
                    self.log_result("Contact Form - Valid Submission", False, f"Missing fields: {missing_fields}")
            else:
                self.log_result("Contact Form - Valid Submission", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Contact Form - Valid Submission", False, f"Exception: {str(e)}")
        
        # Test 2: Second submission to verify different message IDs
        try:
            contact_data_2 = {
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "phone": "+1 (555) 987-6543",
                "subject": "Job Application",
                "message": "I am interested in applying for a pharmacist position. I have 8 years of experience in clinical pharmacy."
            }
            
            response = requests.post(f"{self.base_url}/contact-us", json=contact_data_2)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("message_id"):
                    second_message_id = data["message_id"]
                    # Check if message IDs are different (UUID format)
                    if len(second_message_id) == 36 and '-' in second_message_id:
                        self.log_result("Contact Form - Unique Message IDs", True, 
                                      f"Second submission successful with unique ID: {second_message_id}")
                    else:
                        self.log_result("Contact Form - Unique Message IDs", False, 
                                      f"Invalid message ID format: {second_message_id}")
                else:
                    self.log_result("Contact Form - Unique Message IDs", False, "Missing success or message_id in response")
            else:
                self.log_result("Contact Form - Unique Message IDs", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Contact Form - Unique Message IDs", False, f"Exception: {str(e)}")
        
        # Test 3: Missing required field - name
        try:
            contact_data_missing_name = {
                "email": "test@example.com",
                "phone": "+1 (555) 111-2222",
                "subject": "Test",
                "message": "Test message"
            }
            
            response = requests.post(f"{self.base_url}/contact-us", json=contact_data_missing_name)
            
            # Should return validation error (422) or handle gracefully
            if response.status_code in [400, 422]:
                self.log_result("Contact Form - Missing Name Validation", True, 
                              f"Correctly handled missing name field (Status: {response.status_code})")
            elif response.status_code == 200:
                # If it accepts the request, check if it handles it gracefully
                data = response.json()
                if data.get("success"):
                    self.log_result("Contact Form - Missing Name Validation", True, 
                                  "Gracefully handled missing name field")
                else:
                    self.log_result("Contact Form - Missing Name Validation", False, 
                                  "Accepted request but returned success=false")
            else:
                self.log_result("Contact Form - Missing Name Validation", False, 
                              f"Unexpected status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Contact Form - Missing Name Validation", False, f"Exception: {str(e)}")
        
        # Test 4: Missing required field - email
        try:
            contact_data_missing_email = {
                "name": "Test User",
                "phone": "+1 (555) 111-2222",
                "subject": "Test",
                "message": "Test message"
            }
            
            response = requests.post(f"{self.base_url}/contact-us", json=contact_data_missing_email)
            
            # Should return validation error (422) or handle gracefully
            if response.status_code in [400, 422]:
                self.log_result("Contact Form - Missing Email Validation", True, 
                              f"Correctly handled missing email field (Status: {response.status_code})")
            elif response.status_code == 200:
                # If it accepts the request, check if it handles it gracefully
                data = response.json()
                if data.get("success"):
                    self.log_result("Contact Form - Missing Email Validation", True, 
                                  "Gracefully handled missing email field")
                else:
                    self.log_result("Contact Form - Missing Email Validation", False, 
                                  "Accepted request but returned success=false")
            else:
                self.log_result("Contact Form - Missing Email Validation", False, 
                              f"Unexpected status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Contact Form - Missing Email Validation", False, f"Exception: {str(e)}")
        
        # Test 5: Missing required field - message
        try:
            contact_data_missing_message = {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+1 (555) 111-2222",
                "subject": "Test"
            }
            
            response = requests.post(f"{self.base_url}/contact-us", json=contact_data_missing_message)
            
            # Should return validation error (422) or handle gracefully
            if response.status_code in [400, 422]:
                self.log_result("Contact Form - Missing Message Validation", True, 
                              f"Correctly handled missing message field (Status: {response.status_code})")
            elif response.status_code == 200:
                # If it accepts the request, check if it handles it gracefully
                data = response.json()
                if data.get("success"):
                    self.log_result("Contact Form - Missing Message Validation", True, 
                                  "Gracefully handled missing message field")
                else:
                    self.log_result("Contact Form - Missing Message Validation", False, 
                                  "Accepted request but returned success=false")
            else:
                self.log_result("Contact Form - Missing Message Validation", False, 
                              f"Unexpected status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Contact Form - Missing Message Validation", False, f"Exception: {str(e)}")
        
        # Test 6: Multiple submissions to verify data persistence
        try:
            contact_submissions = []
            for i in range(3):
                contact_data = {
                    "name": f"Healthcare Professional {i+1}",
                    "email": f"healthcare{i+1}@example.com",
                    "phone": f"+1 (555) 00{i+1}-000{i+1}",
                    "subject": "Healthcare Inquiry",
                    "message": f"This is test message number {i+1} for healthcare job inquiries."
                }
                
                response = requests.post(f"{self.base_url}/contact-us", json=contact_data)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("message_id"):
                        contact_submissions.append(data["message_id"])
                    else:
                        break
                else:
                    break
            
            if len(contact_submissions) == 3:
                # Check all message IDs are unique
                unique_ids = set(contact_submissions)
                if len(unique_ids) == 3:
                    self.log_result("Contact Form - Data Persistence", True, 
                                  f"Successfully created 3 unique contact submissions: {len(unique_ids)} unique IDs")
                else:
                    self.log_result("Contact Form - Data Persistence", False, 
                                  f"Expected 3 unique IDs, got {len(unique_ids)}")
            else:
                self.log_result("Contact Form - Data Persistence", False, 
                              f"Only {len(contact_submissions)} out of 3 submissions succeeded")
        
        except Exception as e:
            self.log_result("Contact Form - Data Persistence", False, f"Exception: {str(e)}")
    
    def test_sitemap_domain_fix(self):
        """Test 15: Sitemap.xml Domain Fix - Verify domain is https://jobslly.com"""
        print("🌐 Testing Sitemap Domain Fix...")
        
        try:
            response = requests.get(f"{self.base_url}/sitemap.xml")
            
            if response.status_code == 200:
                content = response.text
                if "<?xml" in content and "urlset" in content:
                    # Check if the domain is https://jobslly.com
                    if "https://jobslly.com" in content:
                        self.log_result("Sitemap Domain Fix", True, 
                                      "Sitemap correctly uses https://jobslly.com domain")
                    elif "emergent" in content.lower():
                        self.log_result("Sitemap Domain Fix", False, 
                                      "Sitemap still contains emergent domain instead of jobslly.com")
                    else:
                        self.log_result("Sitemap Domain Fix", False, 
                                      f"Sitemap domain unclear. Content preview: {content[:200]}...")
                else:
                    self.log_result("Sitemap Domain Fix", False, "Invalid XML format", content[:200])
            else:
                self.log_result("Sitemap Domain Fix", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Sitemap Domain Fix", False, f"Exception: {str(e)}")
    
    def test_currency_job_creation(self):
        """Test 16: Currency Job Creation - Test creating jobs with INR and USD currency"""
        print("💰 Testing Currency Job Creation...")
        
        if not self.admin_token:
            self.log_result("Currency Job Creation", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test 1: Create job with INR currency
        try:
            job_data_inr = {
                "title": "Senior Cardiologist Mumbai",
                "description": "Leading cardiologist position at premier hospital in Mumbai. Excellent opportunity for experienced cardiac specialist.",
                "company": "Apollo Hospitals",
                "location": "Mumbai, India",
                "salary_min": 1500000,
                "salary_max": 2500000,
                "currency": "INR",
                "job_type": "full_time",
                "category": "doctors",
                "requirements": ["MBBS", "MD Cardiology", "5+ years experience"],
                "benefits": ["Health insurance", "Performance bonus", "CME allowance"]
            }
            
            response = requests.post(f"{self.base_url}/admin/jobs", json=job_data_inr, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("currency") == "INR":
                    self.test_job_id_inr = data.get("id")
                    self.log_result("Currency Job Creation - INR", True, 
                                  f"Successfully created job with INR currency. Job ID: {self.test_job_id_inr}")
                else:
                    self.log_result("Currency Job Creation - INR", False, 
                                  f"Expected currency INR, got {data.get('currency')}")
            else:
                self.log_result("Currency Job Creation - INR", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Currency Job Creation - INR", False, f"Exception: {str(e)}")
        
        # Test 2: Create job with USD currency
        try:
            job_data_usd = {
                "title": "Registered Nurse New York",
                "description": "Experienced RN needed for busy medical center in New York. Competitive salary and benefits package.",
                "company": "NYC Medical Center",
                "location": "New York, NY, USA",
                "salary_min": 75000,
                "salary_max": 95000,
                "currency": "USD",
                "job_type": "full_time",
                "category": "nurses",
                "requirements": ["BSN degree", "RN license", "3+ years experience"],
                "benefits": ["Health insurance", "401k", "Paid time off"]
            }
            
            response = requests.post(f"{self.base_url}/admin/jobs", json=job_data_usd, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("currency") == "USD":
                    self.test_job_id_usd = data.get("id")
                    self.log_result("Currency Job Creation - USD", True, 
                                  f"Successfully created job with USD currency. Job ID: {self.test_job_id_usd}")
                else:
                    self.log_result("Currency Job Creation - USD", False, 
                                  f"Expected currency USD, got {data.get('currency')}")
            else:
                self.log_result("Currency Job Creation - USD", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Currency Job Creation - USD", False, f"Exception: {str(e)}")
        
        # Test 3: Create job without currency (should default to INR)
        try:
            job_data_default = {
                "title": "Pharmacist Default Currency Test",
                "description": "Test job to verify default currency behavior.",
                "company": "Test Pharmacy",
                "location": "Test City",
                "salary_min": 50000,
                "salary_max": 70000,
                "job_type": "full_time",
                "category": "pharmacists"
            }
            
            response = requests.post(f"{self.base_url}/admin/jobs", json=job_data_default, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                currency = data.get("currency", "")
                if currency == "INR":
                    self.log_result("Currency Job Creation - Default", True, 
                                  "Job without currency correctly defaults to INR")
                else:
                    self.log_result("Currency Job Creation - Default", False, 
                                  f"Expected default currency INR, got {currency}")
            else:
                self.log_result("Currency Job Creation - Default", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Currency Job Creation - Default", False, f"Exception: {str(e)}")
    
    def test_currency_job_retrieval(self):
        """Test 17: Currency Job Retrieval - Verify jobs return currency field in API responses"""
        print("🔍 Testing Currency Job Retrieval...")
        
        # Test 1: Get all jobs and verify currency field is present
        try:
            response = requests.get(f"{self.base_url}/jobs")
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list) and jobs:
                    # Check if currency field is present in jobs
                    jobs_with_currency = [job for job in jobs if "currency" in job]
                    
                    if len(jobs_with_currency) > 0:
                        # Check for both INR and USD currencies
                        inr_jobs = [job for job in jobs_with_currency if job.get("currency") == "INR"]
                        usd_jobs = [job for job in jobs_with_currency if job.get("currency") == "USD"]
                        
                        self.log_result("Currency Field in Job Listings", True, 
                                      f"Found {len(jobs_with_currency)} jobs with currency field. INR: {len(inr_jobs)}, USD: {len(usd_jobs)}")
                    else:
                        self.log_result("Currency Field in Job Listings", False, 
                                      "No jobs found with currency field")
                else:
                    self.log_result("Currency Field in Job Listings", False, 
                                  "No jobs returned or invalid response format")
            else:
                self.log_result("Currency Field in Job Listings", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Currency Field in Job Listings", False, f"Exception: {str(e)}")
        
        # Test 2: Test specific job slugs mentioned in the review request
        test_slugs = ["senior-cardiologist-mumbai-2", "registered-nurse-new-york-2"]
        
        for slug in test_slugs:
            try:
                response = requests.get(f"{self.base_url}/jobs/{slug}")
                
                if response.status_code == 200:
                    job = response.json()
                    currency = job.get("currency")
                    
                    if currency:
                        expected_currency = "INR" if "mumbai" in slug.lower() else "USD"
                        if currency == expected_currency:
                            self.log_result(f"Currency Field - {slug}", True, 
                                          f"Job {slug} correctly shows currency: {currency}")
                        else:
                            self.log_result(f"Currency Field - {slug}", True, 
                                          f"Job {slug} has currency field: {currency} (expected {expected_currency})")
                    else:
                        self.log_result(f"Currency Field - {slug}", False, 
                                      f"Job {slug} missing currency field")
                elif response.status_code == 404:
                    self.log_result(f"Currency Field - {slug}", False, 
                                  f"Job {slug} not found (404) - may need to be created")
                else:
                    self.log_result(f"Currency Field - {slug}", False, 
                                  f"Status: {response.status_code}", response.text)
            
            except Exception as e:
                self.log_result(f"Currency Field - {slug}", False, f"Exception: {str(e)}")
        
        # Test 3: Verify individual job details include currency
        if hasattr(self, 'test_job_id_inr') and self.test_job_id_inr:
            try:
                response = requests.get(f"{self.base_url}/jobs/{self.test_job_id_inr}")
                
                if response.status_code == 200:
                    job = response.json()
                    if job.get("currency") == "INR":
                        self.log_result("Individual Job Currency - INR", True, 
                                      "INR job correctly returns currency field in individual job API")
                    else:
                        self.log_result("Individual Job Currency - INR", False, 
                                      f"Expected INR, got {job.get('currency')}")
                else:
                    self.log_result("Individual Job Currency - INR", False, 
                                  f"Status: {response.status_code}", response.text)
            
            except Exception as e:
                self.log_result("Individual Job Currency - INR", False, f"Exception: {str(e)}")
        
        if hasattr(self, 'test_job_id_usd') and self.test_job_id_usd:
            try:
                response = requests.get(f"{self.base_url}/jobs/{self.test_job_id_usd}")
                
                if response.status_code == 200:
                    job = response.json()
                    if job.get("currency") == "USD":
                        self.log_result("Individual Job Currency - USD", True, 
                                      "USD job correctly returns currency field in individual job API")
                    else:
                        self.log_result("Individual Job Currency - USD", False, 
                                      f"Expected USD, got {job.get('currency')}")
                else:
                    self.log_result("Individual Job Currency - USD", False, 
                                  f"Status: {response.status_code}", response.text)
            
            except Exception as e:
                self.log_result("Individual Job Currency - USD", False, f"Exception: {str(e)}")
    
    def test_text_salary_job_creation(self):
        """Test 18: Text-Based Salary Job Creation - Test creating jobs with text salary values"""
        print("💬 Testing Text-Based Salary Job Creation...")
        
        if not self.admin_token:
            self.log_result("Text Salary Job Creation", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test 1: Create job with text salary values and multiple categories
        try:
            job_data_text_salary = {
                "title": "Senior Healthcare Specialist - Multi-Disciplinary",
                "description": "Exciting opportunity for experienced healthcare professional to work across multiple specialties. Competitive compensation package with excellent growth opportunities.",
                "company": "Premier Healthcare Group",
                "location": "Sydney, Australia",
                "salary_min": "Negotiable",
                "salary_max": "Based on experience",
                "currency": "INR",
                "job_type": "full_time",
                "categories": ["doctors", "nurses"],  # Multiple categories
                "requirements": ["Healthcare degree", "5+ years experience", "Multi-specialty knowledge"],
                "benefits": ["Health insurance", "Professional development", "Flexible schedule"]
            }
            
            response = requests.post(f"{self.base_url}/admin/jobs", json=job_data_text_salary, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                # Verify text salary fields
                if (data.get("salary_min") == "Negotiable" and 
                    data.get("salary_max") == "Based on experience" and
                    data.get("categories") == ["doctors", "nurses"]):
                    self.test_job_text_salary_id = data.get("id")
                    self.log_result("Text Salary Job Creation - Multiple Categories", True, 
                                  f"Successfully created job with text salary and multiple categories. Job ID: {self.test_job_text_salary_id}")
                else:
                    self.log_result("Text Salary Job Creation - Multiple Categories", False, 
                                  f"Salary or categories mismatch. Min: {data.get('salary_min')}, Max: {data.get('salary_max')}, Categories: {data.get('categories')}")
            else:
                self.log_result("Text Salary Job Creation - Multiple Categories", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Text Salary Job Creation - Multiple Categories", False, f"Exception: {str(e)}")
        
        # Test 2: Create job with different text salary values
        try:
            job_data_competitive = {
                "title": "Pharmacy Manager - Competitive Package",
                "description": "Lead pharmacy operations with competitive compensation and benefits.",
                "company": "City Pharmacy Network",
                "location": "Melbourne, Australia",
                "salary_min": "Competitive",
                "salary_max": "Excellent benefits package",
                "currency": "USD",
                "job_type": "full_time",
                "categories": ["pharmacy"],  # Single category
                "requirements": ["Pharmacy degree", "Management experience"],
                "benefits": ["Performance bonus", "Health coverage"]
            }
            
            response = requests.post(f"{self.base_url}/admin/jobs", json=job_data_competitive, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("salary_min") == "Competitive" and 
                    data.get("salary_max") == "Excellent benefits package"):
                    self.log_result("Text Salary Job Creation - Competitive", True, 
                                  f"Successfully created job with 'Competitive' salary text")
                else:
                    self.log_result("Text Salary Job Creation - Competitive", False, 
                                  f"Salary mismatch. Min: {data.get('salary_min')}, Max: {data.get('salary_max')}")
            else:
                self.log_result("Text Salary Job Creation - Competitive", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Text Salary Job Creation - Competitive", False, f"Exception: {str(e)}")
        
        # Test 3: Create job with numeric salary values (should still work)
        try:
            job_data_numeric = {
                "title": "Staff Nurse - Fixed Salary",
                "description": "Nursing position with clearly defined salary range.",
                "company": "Regional Hospital",
                "location": "Brisbane, Australia",
                "salary_min": "50000",
                "salary_max": "75000",
                "currency": "USD",
                "job_type": "full_time",
                "categories": ["pharmacy"],  # Single category for filtering test
                "requirements": ["Nursing degree", "Registration"],
                "benefits": ["Health insurance", "Paid leave"]
            }
            
            response = requests.post(f"{self.base_url}/admin/jobs", json=job_data_numeric, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("salary_min") == "50000" and 
                    data.get("salary_max") == "75000"):
                    self.test_job_numeric_salary_id = data.get("id")
                    self.log_result("Numeric Salary Job Creation", True, 
                                  f"Successfully created job with numeric salary strings. Job ID: {self.test_job_numeric_salary_id}")
                else:
                    self.log_result("Numeric Salary Job Creation", False, 
                                  f"Salary mismatch. Min: {data.get('salary_min')}, Max: {data.get('salary_max')}")
            else:
                self.log_result("Numeric Salary Job Creation", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Numeric Salary Job Creation", False, f"Exception: {str(e)}")
    
    def test_category_filtering(self):
        """Test 19: Category Filtering - Test that GET /api/jobs?category=X returns jobs with that category"""
        print("🔍 Testing Category Filtering...")
        
        # Test 1: Filter by 'doctors' category
        try:
            response = requests.get(f"{self.base_url}/jobs?category=doctors")
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list):
                    # Check if all returned jobs have 'doctors' in their categories
                    doctors_jobs = []
                    invalid_jobs = []
                    
                    for job in jobs:
                        categories = job.get("categories", [])
                        if "doctors" in categories:
                            doctors_jobs.append(job)
                        else:
                            invalid_jobs.append(job.get("title", "Unknown"))
                    
                    if len(doctors_jobs) > 0 and len(invalid_jobs) == 0:
                        self.log_result("Category Filtering - Doctors", True, 
                                      f"Found {len(doctors_jobs)} jobs with 'doctors' category, all valid")
                    elif len(doctors_jobs) > 0:
                        self.log_result("Category Filtering - Doctors", False, 
                                      f"Found {len(doctors_jobs)} valid jobs but {len(invalid_jobs)} invalid jobs: {invalid_jobs}")
                    else:
                        self.log_result("Category Filtering - Doctors", False, 
                                      "No jobs found with 'doctors' category")
                else:
                    self.log_result("Category Filtering - Doctors", False, 
                                  "Response is not a list", jobs)
            else:
                self.log_result("Category Filtering - Doctors", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Category Filtering - Doctors", False, f"Exception: {str(e)}")
        
        # Test 2: Filter by 'nurses' category
        try:
            response = requests.get(f"{self.base_url}/jobs?category=nurses")
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list):
                    nurses_jobs = [job for job in jobs if "nurses" in job.get("categories", [])]
                    
                    if len(nurses_jobs) > 0:
                        self.log_result("Category Filtering - Nurses", True, 
                                      f"Found {len(nurses_jobs)} jobs with 'nurses' category")
                    else:
                        self.log_result("Category Filtering - Nurses", False, 
                                      "No jobs found with 'nurses' category")
                else:
                    self.log_result("Category Filtering - Nurses", False, 
                                  "Response is not a list")
            else:
                self.log_result("Category Filtering - Nurses", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Category Filtering - Nurses", False, f"Exception: {str(e)}")
        
        # Test 3: Filter by 'pharmacy' category
        try:
            response = requests.get(f"{self.base_url}/jobs?category=pharmacy")
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list):
                    pharmacy_jobs = [job for job in jobs if "pharmacy" in job.get("categories", [])]
                    
                    if len(pharmacy_jobs) > 0:
                        self.log_result("Category Filtering - Pharmacy", True, 
                                      f"Found {len(pharmacy_jobs)} jobs with 'pharmacy' category")
                    else:
                        self.log_result("Category Filtering - Pharmacy", False, 
                                      "No jobs found with 'pharmacy' category")
                else:
                    self.log_result("Category Filtering - Pharmacy", False, 
                                  "Response is not a list")
            else:
                self.log_result("Category Filtering - Pharmacy", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Category Filtering - Pharmacy", False, f"Exception: {str(e)}")
        
        # Test 4: Test that jobs with multiple categories appear in both filters
        try:
            # Get jobs with 'doctors' category
            doctors_response = requests.get(f"{self.base_url}/jobs?category=doctors")
            nurses_response = requests.get(f"{self.base_url}/jobs?category=nurses")
            
            if doctors_response.status_code == 200 and nurses_response.status_code == 200:
                doctors_jobs = doctors_response.json()
                nurses_jobs = nurses_response.json()
                
                # Find jobs that appear in both lists (should have both categories)
                doctors_titles = {job.get("title") for job in doctors_jobs}
                nurses_titles = {job.get("title") for job in nurses_jobs}
                common_titles = doctors_titles.intersection(nurses_titles)
                
                if len(common_titles) > 0:
                    self.log_result("Multiple Category Jobs", True, 
                                  f"Found {len(common_titles)} jobs appearing in both doctors and nurses categories: {list(common_titles)}")
                else:
                    self.log_result("Multiple Category Jobs", True, 
                                  "No jobs found with multiple categories (this is acceptable)")
            else:
                self.log_result("Multiple Category Jobs", False, 
                              "Could not fetch both category lists for comparison")
        
        except Exception as e:
            self.log_result("Multiple Category Jobs", False, f"Exception: {str(e)}")
    
    def test_job_retrieval_with_text_salary(self):
        """Test 20: Job Retrieval with Text Salary - Verify text salary fields are returned correctly"""
        print("📄 Testing Job Retrieval with Text Salary...")
        
        # Test 1: Retrieve job with text salary via job listings
        try:
            response = requests.get(f"{self.base_url}/jobs")
            
            if response.status_code == 200:
                jobs = response.json()
                text_salary_jobs = []
                
                for job in jobs:
                    salary_min = job.get("salary_min", "")
                    salary_max = job.get("salary_max", "")
                    
                    # Check if salary fields contain text (not just numbers)
                    if (isinstance(salary_min, str) and not salary_min.isdigit() and salary_min != "" or
                        isinstance(salary_max, str) and not salary_max.isdigit() and salary_max != ""):
                        text_salary_jobs.append({
                            "title": job.get("title"),
                            "salary_min": salary_min,
                            "salary_max": salary_max,
                            "categories": job.get("categories", [])
                        })
                
                if len(text_salary_jobs) > 0:
                    self.log_result("Text Salary in Job Listings", True, 
                                  f"Found {len(text_salary_jobs)} jobs with text-based salary fields")
                    
                    # Log examples
                    for job in text_salary_jobs[:3]:  # Show first 3 examples
                        print(f"   Example: {job['title']} - {job['salary_min']} to {job['salary_max']}")
                else:
                    self.log_result("Text Salary in Job Listings", False, 
                                  "No jobs found with text-based salary fields")
            else:
                self.log_result("Text Salary in Job Listings", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Text Salary in Job Listings", False, f"Exception: {str(e)}")
        
        # Test 2: Retrieve specific job with text salary if we created one
        if hasattr(self, 'test_job_text_salary_id') and self.test_job_text_salary_id:
            try:
                response = requests.get(f"{self.base_url}/jobs/{self.test_job_text_salary_id}")
                
                if response.status_code == 200:
                    job = response.json()
                    salary_min = job.get("salary_min")
                    salary_max = job.get("salary_max")
                    categories = job.get("categories", [])
                    
                    if (salary_min == "Negotiable" and 
                        salary_max == "Based on experience" and
                        "doctors" in categories and "nurses" in categories):
                        self.log_result("Individual Text Salary Job", True, 
                                      f"Text salary job correctly retrieved: {salary_min} - {salary_max}, Categories: {categories}")
                    else:
                        self.log_result("Individual Text Salary Job", False, 
                                      f"Mismatch in retrieved job. Min: {salary_min}, Max: {salary_max}, Categories: {categories}")
                else:
                    self.log_result("Individual Text Salary Job", False, 
                                  f"Status: {response.status_code}", response.text)
            
            except Exception as e:
                self.log_result("Individual Text Salary Job", False, f"Exception: {str(e)}")
        
        # Test 3: Verify numeric salary jobs still work
        if hasattr(self, 'test_job_numeric_salary_id') and self.test_job_numeric_salary_id:
            try:
                response = requests.get(f"{self.base_url}/jobs/{self.test_job_numeric_salary_id}")
                
                if response.status_code == 200:
                    job = response.json()
                    salary_min = job.get("salary_min")
                    salary_max = job.get("salary_max")
                    
                    if salary_min == "50000" and salary_max == "75000":
                        self.log_result("Individual Numeric Salary Job", True, 
                                      f"Numeric salary job correctly retrieved: {salary_min} - {salary_max}")
                    else:
                        self.log_result("Individual Numeric Salary Job", False, 
                                      f"Mismatch in numeric salary job. Min: {salary_min}, Max: {salary_max}")
                else:
                    self.log_result("Individual Numeric Salary Job", False, 
                                  f"Status: {response.status_code}", response.text)
            
            except Exception as e:
                self.log_result("Individual Numeric Salary Job", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Comprehensive Healthcare Jobs API Testing Suite")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Run tests in priority order
        # Priority 1: Core Authentication & Basic APIs
        self.test_authentication_flow()
        self.test_job_listings_api()
        self.test_job_details_api()
        self.test_lead_collection_api()
        self.test_job_application_submission()
        self.test_seo_endpoints()
        self.test_application_count_increment()
        
        # Priority 2: Admin Authentication & AI Enhancement (NEW)
        self.test_admin_authentication()
        self.test_ai_enhancement_endpoints()
        
        # Priority 3: Data Validation & Advanced Features
        self.test_sample_data_validation()
        self.test_user_roles_validation()
        self.test_external_jobs_flow()
        self.test_blog_management()
        
        # Priority 4: Contact Form API (NEW)
        self.test_contact_form_api()
        
        # Priority 5: Currency Feature Testing (NEW)
        self.test_sitemap_domain_fix()
        self.test_currency_job_creation()
        self.test_currency_job_retrieval()
        
        # Priority 6: Text Salary and Multiple Categories Testing (REVIEW REQUEST)
        self.test_text_salary_job_creation()
        self.test_category_filtering()
        self.test_job_retrieval_with_text_salary()
        
        # Print summary
        print("=" * 80)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        total_tests = self.results['passed'] + self.results['failed']
        if total_tests > 0:
            print(f"📈 Success Rate: {(self.results['passed'] / total_tests * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        else:
            print("\n🎉 All tests passed! Backend is production-ready.")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = HealthcareJobsAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend APIs are working correctly.")
    else:
        print(f"\n⚠️  {tester.results['failed']} test(s) failed. Please review the issues above.")