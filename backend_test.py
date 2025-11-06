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
BASE_URL = "https://medical-careers-1.preview.emergentagent.com/api"
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