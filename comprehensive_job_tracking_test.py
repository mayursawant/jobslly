#!/usr/bin/env python3
"""
Comprehensive Job Application Tracking Test
Detailed verification of all requirements from the review request.
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://career-site-revamp.preview.emergentagent.com/api"

class ComprehensiveJobTrackingTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.doctor_token = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": [],
            "detailed_results": {}
        }
    
    def log_result(self, test_name, success, message="", response_data=None):
        """Log test results with detailed information"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response_data and isinstance(response_data, dict):
            print(f"   Response keys: {list(response_data.keys())}")
        
        # Store detailed results
        self.results["detailed_results"][test_name] = {
            "success": success,
            "message": message,
            "response_data": response_data
        }
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
        print()
    
    def test_requirement_1_get_job_without_auth(self):
        """
        Requirement 1: Test GET /api/jobs/{job_id} without authentication
        - Pick any job ID from the database
        - Test that the endpoint returns job details without requiring auth
        - Verify has_applied field is present and false for non-authenticated requests
        """
        print("📋 REQUIREMENT 1: GET /api/jobs/{job_id} without authentication")
        
        # Get a job ID from database
        try:
            jobs_response = requests.get(f"{self.base_url}/jobs?limit=1")
            if jobs_response.status_code != 200:
                self.log_result("Get Job ID", False, f"Failed to get jobs: {jobs_response.status_code}")
                return
            
            jobs = jobs_response.json()
            if not jobs:
                self.log_result("Get Job ID", False, "No jobs found in database")
                return
            
            job_id = jobs[0]["id"]
            self.log_result("Get Job ID", True, f"Selected job ID: {job_id}")
            
        except Exception as e:
            self.log_result("Get Job ID", False, f"Exception: {str(e)}")
            return
        
        # Test GET without authentication
        try:
            response = requests.get(f"{self.base_url}/jobs/{job_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify job details are returned
                required_fields = ["id", "title", "company", "location", "description"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Job Details Returned", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Job Details Returned", True, f"All required fields present")
                
                # Verify has_applied field
                if "has_applied" not in data:
                    self.log_result("has_applied Field Present", False, "has_applied field missing")
                elif data["has_applied"] != False:
                    self.log_result("has_applied Field Value", False, f"Expected False, got {data['has_applied']}")
                else:
                    self.log_result("has_applied Field Correct", True, "has_applied is False for non-authenticated request")
                
                # Store job details for verification
                self.results["detailed_results"]["job_details_without_auth"] = data
                
            else:
                self.log_result("GET Job Without Auth", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("GET Job Without Auth", False, f"Exception: {str(e)}")
    
    def test_requirement_2_logged_in_user_flow(self):
        """
        Requirement 2: Test job application flow for logged-in user
        - Login as doctor@gmail.com / password
        - Get a job ID
        - POST /api/jobs/{job_id}/apply with empty application_data {}
        - Verify application is created successfully
        - GET /api/jobs/{job_id} with auth token - verify has_applied is now true
        - GET /api/job-seeker/applications - verify the application shows up in the list with job details
        """
        print("👨‍⚕️ REQUIREMENT 2: Job application flow for logged-in user")
        
        # Step 1: Login as doctor@gmail.com / password
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
                    self.log_result("Doctor Login", True, "Successfully logged in as doctor@gmail.com")
                else:
                    self.log_result("Doctor Login", False, "No access token in response", data)
                    return
            else:
                self.log_result("Doctor Login", False, f"Status: {response.status_code}", response.text)
                return
        
        except Exception as e:
            self.log_result("Doctor Login", False, f"Exception: {str(e)}")
            return
        
        # Step 2: Get a job ID (find one not already applied to)
        try:
            headers = {"Authorization": f"Bearer {self.doctor_token}"}
            
            # Get existing applications
            apps_response = requests.get(f"{self.base_url}/job-seeker/applications", headers=headers)
            applied_job_ids = []
            if apps_response.status_code == 200:
                apps_data = apps_response.json()
                applied_job_ids = [app.get('job_id') for app in apps_data.get('applications', [])]
            
            # Get available jobs
            jobs_response = requests.get(f"{self.base_url}/jobs?limit=50")
            if jobs_response.status_code != 200:
                self.log_result("Get Available Job", False, f"Failed to get jobs: {jobs_response.status_code}")
                return
            
            jobs = jobs_response.json()
            available_jobs = [job for job in jobs if job['id'] not in applied_job_ids]
            
            if not available_jobs:
                self.log_result("Get Available Job", False, "No available jobs to apply to")
                return
            
            test_job = available_jobs[0]
            job_id = test_job["id"]
            self.log_result("Get Available Job", True, f"Selected job: {test_job['title']} (ID: {job_id})")
            
        except Exception as e:
            self.log_result("Get Available Job", False, f"Exception: {str(e)}")
            return
        
        # Step 3: POST /api/jobs/{job_id}/apply with empty application_data {}
        try:
            application_data = {}
            
            response = requests.post(f"{self.base_url}/jobs/{job_id}/apply", 
                                   json=application_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("Apply for Job", True, f"Application successful: {data.get('message')}")
                    self.results["detailed_results"]["application_response"] = data
                else:
                    self.log_result("Apply for Job", False, "Success flag not true", data)
                    return
            else:
                self.log_result("Apply for Job", False, f"Status: {response.status_code}", response.text)
                return
        
        except Exception as e:
            self.log_result("Apply for Job", False, f"Exception: {str(e)}")
            return
        
        # Step 4: GET /api/jobs/{job_id} with auth token - verify has_applied is now true
        try:
            time.sleep(1)  # Brief delay for database update
            response = requests.get(f"{self.base_url}/jobs/{job_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "has_applied" in data:
                    if data["has_applied"] == True:
                        self.log_result("has_applied After Application", True, "has_applied correctly shows true")
                        self.results["detailed_results"]["job_after_application"] = data
                    else:
                        self.log_result("has_applied After Application", False, f"Expected True, got {data['has_applied']}")
                else:
                    self.log_result("has_applied After Application", False, "has_applied field missing")
            else:
                self.log_result("has_applied After Application", False, f"Status: {response.status_code}")
        
        except Exception as e:
            self.log_result("has_applied After Application", False, f"Exception: {str(e)}")
        
        # Step 5: GET /api/job-seeker/applications - verify application shows up with job details
        try:
            response = requests.get(f"{self.base_url}/job-seeker/applications", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "applications" in data and "total_applications" in data:
                    applications = data["applications"]
                    total_count = data["total_applications"]
                    
                    # Find our application
                    found_application = None
                    for app in applications:
                        if app.get("job_id") == job_id:
                            found_application = app
                            break
                    
                    if found_application:
                        self.log_result("Application in List", True, f"Application found in list (total: {total_count})")
                        
                        # Verify job details are included
                        required_job_fields = ["job_title", "company", "location", "applied_at", "status"]
                        missing_fields = [field for field in required_job_fields if field not in found_application]
                        
                        if not missing_fields:
                            self.log_result("Job Details in Application", True, 
                                          f"All job details present: {found_application['job_title']} at {found_application['company']}")
                        else:
                            self.log_result("Job Details in Application", False, f"Missing fields: {missing_fields}")
                        
                        self.results["detailed_results"]["application_with_job_details"] = found_application
                    else:
                        self.log_result("Application in List", False, f"Application not found (total: {total_count})")
                        
                    self.results["detailed_results"]["all_applications"] = data
                else:
                    self.log_result("Applications API Response", False, "Missing applications or total_applications", data)
            else:
                self.log_result("Applications API Response", False, f"Status: {response.status_code}")
        
        except Exception as e:
            self.log_result("Applications API Response", False, f"Exception: {str(e)}")
    
    def test_requirement_3_lead_application_flow(self):
        """
        Requirement 3: Test lead application flow
        - POST /api/jobs/{different_job_id}/apply-lead with lead data (name, email, phone, etc.)
        - Verify lead is created
        - Login with the same email used in lead
        - GET /api/job-seeker/applications - verify lead application shows up in the list
        """
        print("👤 REQUIREMENT 3: Lead application flow")
        
        # Step 1: Get a different job ID
        try:
            jobs_response = requests.get(f"{self.base_url}/jobs?limit=50")
            if jobs_response.status_code != 200:
                self.log_result("Get Job for Lead", False, f"Failed to get jobs: {jobs_response.status_code}")
                return
            
            jobs = jobs_response.json()
            if len(jobs) < 2:
                self.log_result("Get Job for Lead", False, "Need at least 2 jobs for testing")
                return
            
            # Use second job for lead application
            lead_job = jobs[1]
            lead_job_id = lead_job["id"]
            self.log_result("Get Job for Lead", True, f"Selected job for lead: {lead_job['title']} (ID: {lead_job_id})")
            
        except Exception as e:
            self.log_result("Get Job for Lead", False, f"Exception: {str(e)}")
            return
        
        # Step 2: POST /api/jobs/{job_id}/apply-lead with comprehensive lead data
        lead_email = f"lead_comprehensive_{uuid.uuid4().hex[:8]}@healthcare.com"
        
        try:
            lead_data = {
                "name": "Dr. Michael Chen",
                "email": lead_email,
                "phone": "+1-555-0199",
                "current_position": "Cardiologist",
                "experience_years": "12",
                "message": "I am very interested in this cardiology position and would like to discuss the opportunity in detail."
            }
            
            response = requests.post(f"{self.base_url}/jobs/{lead_job_id}/apply-lead", json=lead_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("Lead Application Submission", True, f"Lead created: {data.get('message')}")
                    self.results["detailed_results"]["lead_response"] = data
                else:
                    self.log_result("Lead Application Submission", False, "Success flag not true", data)
                    return
            else:
                self.log_result("Lead Application Submission", False, f"Status: {response.status_code}", response.text)
                return
        
        except Exception as e:
            self.log_result("Lead Application Submission", False, f"Exception: {str(e)}")
            return
        
        # Step 3: Register/Login with the same email used in lead
        try:
            # Register the user
            register_data = {
                "email": lead_email,
                "password": "LeadTest123!",
                "full_name": "Dr. Michael Chen",
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
        
        # Step 4: GET /api/job-seeker/applications - verify lead application shows up
        try:
            headers = {"Authorization": f"Bearer {lead_user_token}"}
            time.sleep(2)  # Allow time for lead conversion
            
            response = requests.get(f"{self.base_url}/job-seeker/applications", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "applications" in data and "total_applications" in data:
                    applications = data["applications"]
                    total_count = data["total_applications"]
                    
                    # Find the lead application
                    found_lead_application = None
                    for app in applications:
                        if app.get("job_id") == lead_job_id:
                            found_lead_application = app
                            break
                    
                    if found_lead_application:
                        app_type = found_lead_application.get("application_type", "unknown")
                        self.log_result("Lead Application in List", True, 
                                      f"Lead application found as {app_type}: {found_lead_application.get('job_title')}")
                        self.results["detailed_results"]["lead_application_in_list"] = found_lead_application
                    else:
                        self.log_result("Lead Application in List", False, 
                                      f"Lead application not found (total: {total_count})")
                        # Debug info
                        print(f"   Looking for job_id: {lead_job_id}")
                        print(f"   Found applications for jobs: {[app.get('job_id') for app in applications]}")
                    
                    self.results["detailed_results"]["lead_user_applications"] = data
                else:
                    self.log_result("Lead Applications API", False, "Missing applications or total_applications", data)
            else:
                self.log_result("Lead Applications API", False, f"Status: {response.status_code}")
        
        except Exception as e:
            self.log_result("Lead Applications API", False, f"Exception: {str(e)}")
    
    def generate_detailed_report(self):
        """Generate a detailed report of all test results"""
        print("\n" + "=" * 100)
        print("📊 COMPREHENSIVE TEST REPORT")
        print("=" * 100)
        
        print(f"\n📈 OVERALL RESULTS:")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        total_tests = self.results['passed'] + self.results['failed']
        if total_tests > 0:
            print(f"📊 Success Rate: {(self.results['passed'] / total_tests * 100):.1f}%")
        
        print(f"\n🔍 DETAILED FINDINGS:")
        
        # Requirement 1 Analysis
        print(f"\n1️⃣ GET /api/jobs/{{job_id}} WITHOUT AUTHENTICATION:")
        job_details = self.results["detailed_results"].get("job_details_without_auth")
        if job_details:
            print(f"   ✓ Job ID: {job_details.get('id')}")
            print(f"   ✓ Title: {job_details.get('title')}")
            print(f"   ✓ Company: {job_details.get('company')}")
            print(f"   ✓ has_applied: {job_details.get('has_applied')}")
            print(f"   ✓ Response size: {len(str(job_details))} characters")
        
        # Requirement 2 Analysis
        print(f"\n2️⃣ LOGGED-IN USER APPLICATION FLOW:")
        app_response = self.results["detailed_results"].get("application_response")
        if app_response:
            print(f"   ✓ Application ID: {app_response.get('application_id')}")
            print(f"   ✓ Success: {app_response.get('success')}")
            print(f"   ✓ Message: {app_response.get('message')}")
        
        job_after_app = self.results["detailed_results"].get("job_after_application")
        if job_after_app:
            print(f"   ✓ has_applied after application: {job_after_app.get('has_applied')}")
        
        app_in_list = self.results["detailed_results"].get("application_with_job_details")
        if app_in_list:
            print(f"   ✓ Application in list: {app_in_list.get('job_title')} at {app_in_list.get('company')}")
            print(f"   ✓ Application status: {app_in_list.get('status')}")
            print(f"   ✓ Application type: {app_in_list.get('application_type')}")
        
        # Requirement 3 Analysis
        print(f"\n3️⃣ LEAD APPLICATION FLOW:")
        lead_response = self.results["detailed_results"].get("lead_response")
        if lead_response:
            print(f"   ✓ Lead ID: {lead_response.get('lead_id')}")
            print(f"   ✓ Job Seeker ID: {lead_response.get('job_seeker_id')}")
            print(f"   ✓ Success: {lead_response.get('success')}")
        
        lead_in_list = self.results["detailed_results"].get("lead_application_in_list")
        if lead_in_list:
            print(f"   ✓ Lead application in list: {lead_in_list.get('job_title')}")
            print(f"   ✓ Application type: {lead_in_list.get('application_type')}")
        
        # Error Summary
        if self.results['errors']:
            print(f"\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        print(f"\n🎯 CONCLUSION:")
        if self.results['failed'] == 0:
            print("   🎉 All job application tracking requirements are working correctly!")
            print("   ✅ The system properly handles both authenticated and unauthenticated users")
            print("   ✅ Lead collection and conversion flow is functional")
            print("   ✅ Application tracking with job details is working")
        else:
            print(f"   ⚠️  {self.results['failed']} requirement(s) need attention")
    
    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🚀 Starting Comprehensive Job Application Tracking Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Test all requirements
        self.test_requirement_1_get_job_without_auth()
        self.test_requirement_2_logged_in_user_flow()
        self.test_requirement_3_lead_application_flow()
        
        # Generate detailed report
        self.generate_detailed_report()
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = ComprehensiveJobTrackingTester()
    success = tester.run_comprehensive_tests()
    
    if success:
        print("\n🎉 All comprehensive tests passed! Job application tracking system is fully functional.")
    else:
        print(f"\n⚠️  Some tests failed. Please review the detailed report above.")