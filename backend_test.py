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
BASE_URL = "https://healthjobs.preview.emergentagent.com/api"
TEST_USER_EMAIL = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
TEST_EMPLOYER_EMAIL = f"testemployer_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "TestPassword123!"

class HealthcareJobsAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.job_seeker_token = None
        self.employer_token = None
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
                if data.get("success"):
                    self.log_result("Job Application Submission", True, f"Application submitted: {data.get('message')}")
                else:
                    self.log_result("Job Application Submission", False, "Success flag not true", data)
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
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Healthcare Jobs API Testing Suite")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run tests in order
        self.test_authentication_flow()
        self.test_job_listings_api()
        self.test_job_details_api()
        self.test_lead_collection_api()
        self.test_job_application_submission()
        self.test_seo_endpoints()
        self.test_application_count_increment()
        
        # Print summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📈 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = HealthcareJobsAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend APIs are working correctly.")
    else:
        print(f"\n⚠️  {tester.results['failed']} test(s) failed. Please review the issues above.")