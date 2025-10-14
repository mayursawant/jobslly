#!/usr/bin/env python3
"""
Job Application Tracking System Test Suite
Tests the specific job application flow as requested in the review.
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://healthcare-board.preview.emergentagent.com/api"

class JobApplicationTrackingTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.doctor_token = None
        self.test_job_id = None
        self.different_job_id = None
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
    
    def get_job_ids_from_database(self):
        """Get job IDs from the database for testing"""
        print("🔍 Getting job IDs from database...")
        
        try:
            # First login as doctor to check existing applications
            login_data = {"email": "doctor@gmail.com", "password": "password"}
            login_response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if login_response.status_code == 200:
                temp_token = login_response.json()["access_token"]
                headers = {"Authorization": f"Bearer {temp_token}"}
                
                # Get existing applications
                apps_response = requests.get(f"{self.base_url}/job-seeker/applications", headers=headers)
                applied_job_ids = []
                if apps_response.status_code == 200:
                    apps_data = apps_response.json()
                    applied_job_ids = [app.get('job_id') for app in apps_data.get('applications', [])]
                
                # Get all jobs
                response = requests.get(f"{self.base_url}/jobs?limit=50")
                
                if response.status_code == 200:
                    jobs = response.json()
                    # Find jobs not already applied to
                    available_jobs = [job for job in jobs if job['id'] not in applied_job_ids]
                    
                    if len(available_jobs) >= 2:
                        self.test_job_id = available_jobs[0]["id"]
                        self.different_job_id = available_jobs[1]["id"]
                        self.log_result("Job IDs Retrieved", True, 
                                      f"Got available job IDs: {self.test_job_id[:8]}... and {self.different_job_id[:8]}...")
                        return True
                    elif len(jobs) >= 2:
                        # Fallback to any jobs if needed
                        self.test_job_id = jobs[0]["id"]
                        self.different_job_id = jobs[1]["id"]
                        self.log_result("Job IDs Retrieved", True, 
                                      f"Got job IDs (may have existing applications): {self.test_job_id[:8]}... and {self.different_job_id[:8]}...")
                        return True
                    else:
                        self.log_result("Job IDs Retrieved", False, f"Only {len(jobs)} jobs found, need at least 2")
                        return False
                else:
                    self.log_result("Job IDs Retrieved", False, f"Status: {response.status_code}", response.text)
                    return False
            else:
                self.log_result("Job IDs Retrieved", False, f"Doctor login failed: {login_response.status_code}")
                return False
        
        except Exception as e:
            self.log_result("Job IDs Retrieved", False, f"Exception: {str(e)}")
            return False
    
    def test_get_job_without_auth(self):
        """Test 1: GET /api/jobs/{job_id} without authentication"""
        print("🔓 Testing GET /api/jobs/{job_id} without authentication...")
        
        if not self.test_job_id:
            self.log_result("Job Details Without Auth", False, "No job ID available for testing")
            return
        
        try:
            response = requests.get(f"{self.base_url}/jobs/{self.test_job_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["id", "title", "company", "location", "description"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Check has_applied field
                    if "has_applied" in data:
                        if data["has_applied"] == False:
                            self.log_result("Job Details Without Auth", True, 
                                          f"Job details retrieved successfully, has_applied: {data['has_applied']}")
                        else:
                            self.log_result("Job Details Without Auth", False, 
                                          f"has_applied should be false for non-authenticated requests, got: {data['has_applied']}")
                    else:
                        self.log_result("Job Details Without Auth", False, "has_applied field missing from response")
                else:
                    self.log_result("Job Details Without Auth", False, f"Missing required fields: {missing_fields}")
            else:
                self.log_result("Job Details Without Auth", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Details Without Auth", False, f"Exception: {str(e)}")
    
    def test_doctor_login(self):
        """Test 2: Login as doctor@gmail.com / password"""
        print("🔐 Testing doctor login...")
        
        try:
            login_data = {
                "email": "doctor@gmail.com",
                "password": "password"
            }
            
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.doctor_token = data["access_token"]
                    self.log_result("Doctor Login", True, f"Login successful, token: {data['access_token'][:20]}...")
                    return True
                else:
                    self.log_result("Doctor Login", False, "No access token in response", data)
                    return False
            else:
                self.log_result("Doctor Login", False, f"Status: {response.status_code}", response.text)
                return False
        
        except Exception as e:
            self.log_result("Doctor Login", False, f"Exception: {str(e)}")
            return False
    
    def test_job_application_flow(self):
        """Test 3: Complete job application flow for logged-in user"""
        print("📝 Testing job application flow for logged-in user...")
        
        if not self.doctor_token:
            self.log_result("Job Application Flow", False, "No doctor token available")
            return
        
        if not self.test_job_id:
            self.log_result("Job Application Flow", False, "No job ID available")
            return
        
        headers = {"Authorization": f"Bearer {self.doctor_token}"}
        
        # Step 1: POST /api/jobs/{job_id}/apply with empty application_data {}
        try:
            application_data = {}
            
            response = requests.post(f"{self.base_url}/jobs/{self.test_job_id}/apply", 
                                   json=application_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("Job Application Submission", True, 
                                  f"Application submitted successfully: {data.get('message')}")
                else:
                    self.log_result("Job Application Submission", False, "Success flag not true", data)
                    return
            else:
                self.log_result("Job Application Submission", False, f"Status: {response.status_code}", response.text)
                return
        
        except Exception as e:
            self.log_result("Job Application Submission", False, f"Exception: {str(e)}")
            return
        
        # Step 2: GET /api/jobs/{job_id} with auth token - verify has_applied is now true
        try:
            time.sleep(1)  # Brief delay to ensure database update
            response = requests.get(f"{self.base_url}/jobs/{self.test_job_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "has_applied" in data:
                    if data["has_applied"] == True:
                        self.log_result("Job Applied Status Check", True, 
                                      f"has_applied correctly shows true after application")
                    else:
                        self.log_result("Job Applied Status Check", False, 
                                      f"has_applied should be true after application, got: {data['has_applied']}")
                else:
                    self.log_result("Job Applied Status Check", False, "has_applied field missing from response")
            else:
                self.log_result("Job Applied Status Check", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Applied Status Check", False, f"Exception: {str(e)}")
        
        # Step 3: GET /api/job-seeker/applications - verify the application shows up
        try:
            response = requests.get(f"{self.base_url}/job-seeker/applications", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "applications" in data and "total_applications" in data:
                    applications = data["applications"]
                    total_count = data["total_applications"]
                    
                    # Check if our application is in the list
                    found_application = False
                    for app in applications:
                        if app.get("job_id") == self.test_job_id:
                            found_application = True
                            # Verify job details are included
                            required_fields = ["job_title", "company", "location", "applied_at", "status"]
                            missing_fields = [field for field in required_fields if field not in app]
                            
                            if not missing_fields:
                                self.log_result("Application in List with Job Details", True, 
                                              f"Application found with job details: {app['job_title']} at {app['company']}")
                            else:
                                self.log_result("Application in List with Job Details", False, 
                                              f"Application found but missing job details: {missing_fields}")
                            break
                    
                    if not found_application:
                        self.log_result("Application in List", False, 
                                      f"Application not found in list. Total applications: {total_count}")
                    else:
                        self.log_result("Application in List", True, 
                                      f"Application found in list. Total applications: {total_count}")
                else:
                    self.log_result("Job Seeker Applications API", False, "Missing applications or total_applications in response", data)
            else:
                self.log_result("Job Seeker Applications API", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Seeker Applications API", False, f"Exception: {str(e)}")
    
    def test_lead_application_flow(self):
        """Test 4: Lead application flow"""
        print("👤 Testing lead application flow...")
        
        if not self.different_job_id:
            self.log_result("Lead Application Flow", False, "No different job ID available")
            return
        
        # Generate unique email for this test
        lead_email = f"lead_test_{uuid.uuid4().hex[:8]}@healthcare.com"
        
        # Step 1: POST /api/jobs/{different_job_id}/apply-lead with lead data
        try:
            lead_data = {
                "name": "Dr. Sarah Johnson",
                "email": lead_email,
                "phone": "+1-555-0198",
                "current_position": "Emergency Medicine Physician",
                "experience_years": "8",
                "message": "I am very interested in this position and would like to discuss the opportunity further."
            }
            
            response = requests.post(f"{self.base_url}/jobs/{self.different_job_id}/apply-lead", json=lead_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("Lead Application Submission", True, 
                                  f"Lead application submitted: {data.get('message')}")
                else:
                    self.log_result("Lead Application Submission", False, "Success flag not true", data)
                    return
            else:
                self.log_result("Lead Application Submission", False, f"Status: {response.status_code}", response.text)
                return
        
        except Exception as e:
            self.log_result("Lead Application Submission", False, f"Exception: {str(e)}")
            return
        
        # Step 2: Login with the same email used in lead
        try:
            # First register the user with the lead email
            register_data = {
                "email": lead_email,
                "password": "TestPassword123!",
                "full_name": "Dr. Sarah Johnson",
                "role": "job_seeker"
            }
            
            register_response = requests.post(f"{self.base_url}/auth/register", json=register_data)
            
            if register_response.status_code == 200:
                register_data_response = register_response.json()
                if "access_token" in register_data_response:
                    lead_user_token = register_data_response["access_token"]
                    self.log_result("Lead User Registration", True, "Lead user registered successfully")
                else:
                    self.log_result("Lead User Registration", False, "No access token in registration response")
                    return
            else:
                self.log_result("Lead User Registration", False, f"Registration failed: {register_response.status_code}")
                return
        
        except Exception as e:
            self.log_result("Lead User Registration", False, f"Exception: {str(e)}")
            return
        
        # Step 3: GET /api/job-seeker/applications - verify lead application shows up
        try:
            headers = {"Authorization": f"Bearer {lead_user_token}"}
            time.sleep(2)  # Allow time for lead conversion
            
            response = requests.get(f"{self.base_url}/job-seeker/applications", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "applications" in data and "total_applications" in data:
                    applications = data["applications"]
                    total_count = data["total_applications"]
                    
                    # Check if our lead application is in the list
                    found_lead_application = False
                    for app in applications:
                        if app.get("job_id") == self.different_job_id:
                            found_lead_application = True
                            # Verify it's marked as a lead application
                            app_type = app.get("application_type", "unknown")
                            
                            if app_type in ["lead", "registered"]:  # Could be either depending on conversion
                                self.log_result("Lead Application in List", True, 
                                              f"Lead application found as {app_type}: {app.get('job_title')} at {app.get('company')}")
                            else:
                                self.log_result("Lead Application in List", False, 
                                              f"Lead application found but wrong type: {app_type}")
                            break
                    
                    if not found_lead_application:
                        self.log_result("Lead Application in List", False, 
                                      f"Lead application not found in list. Total applications: {total_count}")
                        # Print all applications for debugging
                        print(f"   Available applications: {[app.get('job_id') for app in applications]}")
                        print(f"   Looking for job_id: {self.different_job_id}")
                else:
                    self.log_result("Lead User Applications API", False, "Missing applications or total_applications in response", data)
            else:
                self.log_result("Lead User Applications API", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Lead User Applications API", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all job application tracking tests"""
        print("🚀 Starting Job Application Tracking System Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Get job IDs first
        if not self.get_job_ids_from_database():
            print("❌ Cannot proceed without job IDs")
            return False
        
        # Test 1: GET job without authentication
        self.test_get_job_without_auth()
        
        # Test 2: Login as doctor
        if not self.test_doctor_login():
            print("❌ Cannot proceed without doctor login")
            return False
        
        # Test 3: Job application flow for logged-in user
        self.test_job_application_flow()
        
        # Test 4: Lead application flow
        self.test_lead_application_flow()
        
        # Print summary
        print("=" * 80)
        print("📊 JOB APPLICATION TRACKING TEST SUMMARY")
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
            print("\n🎉 All job application tracking tests passed!")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = JobApplicationTrackingTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Job application tracking system is working correctly!")
    else:
        print(f"\n⚠️  {tester.results['failed']} test(s) failed. Please review the issues above.")