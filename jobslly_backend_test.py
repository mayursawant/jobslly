#!/usr/bin/env python3
"""
Jobslly Backend API Testing Suite - Focused Testing
Tests the newly implemented backend endpoints and fixes for Jobslly platform
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration

BASE_URL = "https://jobslly.com/api"

class JobsllyBackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.admin_token = None
        self.job_seeker_token = None
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
    
    def authenticate_admin(self):
        """Authenticate as admin user"""
        try:
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
                    return True
                else:
                    self.log_result("Admin Authentication", False, "No access token in response", data)
                    return False
            else:
                self.log_result("Admin Authentication", False, f"Status: {response.status_code}", response.text)
                return False
        
        except Exception as e:
            self.log_result("Admin Authentication", False, f"Exception: {str(e)}")
            return False
    
    def authenticate_job_seeker(self):
        """Authenticate as job seeker user"""
        try:
            login_data = {
                "email": "doctor@gmail.com",
                "password": "password"
            }
            
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.job_seeker_token = data["access_token"]
                    self.log_result("Job Seeker Authentication", True, "Job seeker login successful")
                    return True
                else:
                    self.log_result("Job Seeker Authentication", False, "No access token in response", data)
                    return False
            else:
                self.log_result("Job Seeker Authentication", False, f"Status: {response.status_code}", response.text)
                return False
        
        except Exception as e:
            self.log_result("Job Seeker Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_job_seeker_dashboard_api(self):
        """Test 1: Job Seeker Dashboard API Fix - GET /api/job-seeker/dashboard"""
        print("📊 Testing Job Seeker Dashboard API...")
        
        if not self.job_seeker_token:
            self.log_result("Job Seeker Dashboard API", False, "No job seeker token available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
            response = requests.get(f"{self.base_url}/job-seeker/dashboard", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["applications_count", "profile_completion"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    profile_completion = data.get("profile_completion", 0)
                    self.log_result("Job Seeker Dashboard API", True, 
                                  f"Dashboard data loaded successfully. Profile completion: {profile_completion}%")
                else:
                    self.log_result("Job Seeker Dashboard API", False, f"Missing fields: {missing_fields}", data)
            elif response.status_code == 401:
                self.log_result("Job Seeker Dashboard API", False, "Authentication failed - token may be invalid")
            elif response.status_code == 403:
                self.log_result("Job Seeker Dashboard API", False, "Access denied - user may not have job_seeker role")
            else:
                self.log_result("Job Seeker Dashboard API", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Seeker Dashboard API", False, f"Exception: {str(e)}")
    
    def test_profile_api(self):
        """Test 2: Profile Update API - GET /api/profile and PUT /api/profile"""
        print("👤 Testing Profile API...")
        
        if not self.job_seeker_token:
            self.log_result("Profile API", False, "No job seeker token available")
            return
        
        headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
        
        # Test GET profile
        try:
            response = requests.get(f"{self.base_url}/profile", headers=headers)
            
            if response.status_code == 200:
                profile_data = response.json()
                self.log_result("GET Profile API", True, f"Profile data retrieved successfully")
                
                # Test PUT profile update
                try:
                    update_data = {
                        "phone": "+1-555-0123",
                        "specialization": "Cardiology",
                        "experience_years": 5,
                        "skills": ["Patient Care", "Medical Procedures", "Emergency Response"],
                        "address": "123 Healthcare St, Medical City"
                    }
                    
                    response = requests.put(f"{self.base_url}/profile", json=update_data, headers=headers)
                    
                    if response.status_code == 200:
                        updated_profile = response.json()
                        profile_completion = updated_profile.get("profile_completion", 0)
                        
                        if profile_completion > 0:
                            self.log_result("PUT Profile API", True, 
                                          f"Profile updated successfully. Profile completion: {profile_completion}%")
                        else:
                            self.log_result("PUT Profile API", False, "Profile completion not calculated correctly")
                    else:
                        self.log_result("PUT Profile API", False, f"Status: {response.status_code}", response.text)
                
                except Exception as e:
                    self.log_result("PUT Profile API", False, f"Exception: {str(e)}")
            
            else:
                self.log_result("GET Profile API", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("GET Profile API", False, f"Exception: {str(e)}")
    
    def test_admin_jobs_get_all(self):
        """Test 3: Admin Jobs Management - Get All Jobs - GET /api/admin/jobs/all"""
        print("📋 Testing Admin Get All Jobs API...")
        
        if not self.admin_token:
            self.log_result("Admin Get All Jobs", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test without include_deleted parameter
        try:
            response = requests.get(f"{self.base_url}/admin/jobs/all", headers=headers)
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list):
                    self.log_result("Admin Get All Jobs (Default)", True, 
                                  f"Retrieved {len(jobs)} jobs (deleted jobs excluded by default)")
                    
                    # Store a job ID for later tests
                    if jobs:
                        self.test_job_id = jobs[0]["id"]
                    
                    # Test with include_deleted=true
                    try:
                        response = requests.get(f"{self.base_url}/admin/jobs/all?include_deleted=true", headers=headers)
                        
                        if response.status_code == 200:
                            all_jobs = response.json()
                            if isinstance(all_jobs, list):
                                self.log_result("Admin Get All Jobs (Include Deleted)", True, 
                                              f"Retrieved {len(all_jobs)} jobs (including deleted)")
                            else:
                                self.log_result("Admin Get All Jobs (Include Deleted)", False, "Response is not a list")
                        else:
                            self.log_result("Admin Get All Jobs (Include Deleted)", False, 
                                          f"Status: {response.status_code}", response.text)
                    
                    except Exception as e:
                        self.log_result("Admin Get All Jobs (Include Deleted)", False, f"Exception: {str(e)}")
                
                else:
                    self.log_result("Admin Get All Jobs (Default)", False, "Response is not a list", jobs)
            elif response.status_code == 403:
                self.log_result("Admin Get All Jobs (Default)", False, "Access denied - user may not have admin role")
            else:
                self.log_result("Admin Get All Jobs (Default)", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Admin Get All Jobs (Default)", False, f"Exception: {str(e)}")
    
    def test_admin_jobs_get_single(self):
        """Test 4: Admin Jobs Management - Get Single Job - GET /api/admin/jobs/{job_id}"""
        print("🔍 Testing Admin Get Single Job API...")
        
        if not self.admin_token:
            self.log_result("Admin Get Single Job", False, "No admin token available")
            return
        
        if not self.test_job_id:
            self.log_result("Admin Get Single Job", False, "No job ID available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/jobs/{self.test_job_id}", headers=headers)
            
            if response.status_code == 200:
                job = response.json()
                required_fields = ["id", "title", "company", "location", "description"]
                missing_fields = [field for field in required_fields if field not in job]
                
                if not missing_fields:
                    self.log_result("Admin Get Single Job", True, 
                                  f"Job details retrieved successfully for ID: {self.test_job_id}")
                else:
                    self.log_result("Admin Get Single Job", False, f"Missing fields: {missing_fields}")
            elif response.status_code == 404:
                self.log_result("Admin Get Single Job", False, "Job not found")
            elif response.status_code == 403:
                self.log_result("Admin Get Single Job", False, "Access denied - user may not have admin role")
            else:
                self.log_result("Admin Get Single Job", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Admin Get Single Job", False, f"Exception: {str(e)}")
    
    def test_admin_jobs_update(self):
        """Test 5: Admin Jobs Management - Update Job - PUT /api/admin/jobs/{job_id}"""
        print("✏️ Testing Admin Update Job API...")
        
        if not self.admin_token:
            self.log_result("Admin Update Job", False, "No admin token available")
            return
        
        if not self.test_job_id:
            self.log_result("Admin Update Job", False, "No job ID available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # First get the current job data
            get_response = requests.get(f"{self.base_url}/admin/jobs/{self.test_job_id}", headers=headers)
            
            if get_response.status_code != 200:
                self.log_result("Admin Update Job", False, "Could not retrieve job for update test")
                return
            
            current_job = get_response.json()
            
            # Update job data
            update_data = {
                "title": f"Updated {current_job.get('title', 'Job Title')}",
                "description": "This job description has been updated via API testing",
                "company": current_job.get("company", "Test Company"),
                "location": current_job.get("location", "Test Location"),
                "salary_min": 60000,
                "salary_max": 80000,
                "job_type": "full_time",
                "category": "doctors",
                "requirements": ["Updated requirement 1", "Updated requirement 2"],
                "benefits": ["Updated benefit 1", "Updated benefit 2"]
            }
            
            response = requests.put(f"{self.base_url}/admin/jobs/{self.test_job_id}", 
                                  json=update_data, headers=headers)
            
            if response.status_code == 200:
                updated_job = response.json()
                if updated_job.get("title") == update_data["title"]:
                    self.log_result("Admin Update Job", True, 
                                  f"Job updated successfully. New title: {updated_job.get('title')}")
                else:
                    self.log_result("Admin Update Job", False, "Job update did not persist correctly")
            elif response.status_code == 404:
                self.log_result("Admin Update Job", False, "Job not found")
            elif response.status_code == 403:
                self.log_result("Admin Update Job", False, "Access denied - user may not have admin role")
            else:
                self.log_result("Admin Update Job", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Admin Update Job", False, f"Exception: {str(e)}")
    
    def test_admin_jobs_soft_delete(self):
        """Test 6: Admin Jobs Management - Soft Delete - DELETE /api/admin/jobs/{job_id}"""
        print("🗑️ Testing Admin Soft Delete Job API...")
        
        if not self.admin_token:
            self.log_result("Admin Soft Delete Job", False, "No admin token available")
            return
        
        if not self.test_job_id:
            self.log_result("Admin Soft Delete Job", False, "No job ID available for testing")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test soft delete
        try:
            response = requests.delete(f"{self.base_url}/admin/jobs/{self.test_job_id}", headers=headers)
            
            if response.status_code == 200:
                self.log_result("Admin Soft Delete Job", True, "Job soft deleted successfully")
                
                # Verify job is excluded from public listings
                try:
                    public_response = requests.get(f"{self.base_url}/jobs/{self.test_job_id}")
                    
                    if public_response.status_code == 404:
                        self.log_result("Soft Delete Verification (Public)", True, 
                                      "Deleted job correctly excluded from public listings")
                    else:
                        self.log_result("Soft Delete Verification (Public)", False, 
                                      f"Deleted job still accessible publicly: {public_response.status_code}")
                
                except Exception as e:
                    self.log_result("Soft Delete Verification (Public)", False, f"Exception: {str(e)}")
                
                # Test restore functionality
                try:
                    restore_response = requests.post(f"{self.base_url}/admin/jobs/{self.test_job_id}/restore", 
                                                   headers=headers)
                    
                    if restore_response.status_code == 200:
                        self.log_result("Admin Restore Job", True, "Job restored successfully")
                        
                        # Verify job is back in public listings
                        try:
                            public_response = requests.get(f"{self.base_url}/jobs/{self.test_job_id}")
                            
                            if public_response.status_code == 200:
                                self.log_result("Restore Verification (Public)", True, 
                                              "Restored job correctly available in public listings")
                            else:
                                self.log_result("Restore Verification (Public)", False, 
                                              f"Restored job not accessible publicly: {public_response.status_code}")
                        
                        except Exception as e:
                            self.log_result("Restore Verification (Public)", False, f"Exception: {str(e)}")
                    
                    else:
                        self.log_result("Admin Restore Job", False, f"Status: {restore_response.status_code}")
                
                except Exception as e:
                    self.log_result("Admin Restore Job", False, f"Exception: {str(e)}")
            
            elif response.status_code == 404:
                self.log_result("Admin Soft Delete Job", False, "Job not found")
            elif response.status_code == 403:
                self.log_result("Admin Soft Delete Job", False, "Access denied - user may not have admin role")
            else:
                self.log_result("Admin Soft Delete Job", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Admin Soft Delete Job", False, f"Exception: {str(e)}")
    
    def test_public_jobs_api(self):
        """Test 7: Public Jobs API - GET /api/jobs (verify deleted jobs excluded, only approved jobs)"""
        print("🌐 Testing Public Jobs API...")
        
        try:
            response = requests.get(f"{self.base_url}/jobs")
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list):
                    # Check that all jobs are approved and not deleted
                    approved_jobs = [job for job in jobs if job.get("is_approved", False)]
                    deleted_jobs = [job for job in jobs if job.get("is_deleted", False)]
                    
                    if len(approved_jobs) == len(jobs):
                        self.log_result("Public Jobs API (Approved Only)", True, 
                                      f"All {len(jobs)} jobs are approved")
                    else:
                        self.log_result("Public Jobs API (Approved Only)", False, 
                                      f"Found {len(jobs) - len(approved_jobs)} unapproved jobs in public listing")
                    
                    if len(deleted_jobs) == 0:
                        self.log_result("Public Jobs API (Deleted Excluded)", True, 
                                      "No deleted jobs found in public listing")
                    else:
                        self.log_result("Public Jobs API (Deleted Excluded)", False, 
                                      f"Found {len(deleted_jobs)} deleted jobs in public listing")
                
                else:
                    self.log_result("Public Jobs API", False, "Response is not a list", jobs)
            else:
                self.log_result("Public Jobs API", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Public Jobs API", False, f"Exception: {str(e)}")
    
    def test_authentication_and_authorization(self):
        """Test 8: Authentication and Authorization"""
        print("🔐 Testing Authentication and Authorization...")
        
        # Test 401 errors for missing tokens
        try:
            response = requests.get(f"{self.base_url}/job-seeker/dashboard")
            
            if response.status_code == 401:
                self.log_result("Authentication (401 for missing token)", True, 
                              "Correctly returns 401 for missing authentication token")
            else:
                self.log_result("Authentication (401 for missing token)", False, 
                              f"Expected 401, got {response.status_code}")
        
        except Exception as e:
            self.log_result("Authentication (401 for missing token)", False, f"Exception: {str(e)}")
        
        # Test 403 errors for non-admin accessing admin endpoints
        if self.job_seeker_token:
            try:
                headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
                response = requests.get(f"{self.base_url}/admin/jobs/all", headers=headers)
                
                if response.status_code == 403:
                    self.log_result("Authorization (403 for non-admin)", True, 
                                  "Correctly returns 403 for non-admin accessing admin endpoint")
                else:
                    self.log_result("Authorization (403 for non-admin)", False, 
                                  f"Expected 403, got {response.status_code}")
            
            except Exception as e:
                self.log_result("Authorization (403 for non-admin)", False, f"Exception: {str(e)}")
        else:
            self.log_result("Authorization (403 for non-admin)", False, "No job seeker token for testing")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Jobslly Backend API Testing Suite")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Authenticate users first
        admin_auth_success = self.authenticate_admin()
        job_seeker_auth_success = self.authenticate_job_seeker()
        
        if not admin_auth_success:
            print("⚠️ Admin authentication failed - some tests will be skipped")
        
        if not job_seeker_auth_success:
            print("⚠️ Job seeker authentication failed - some tests will be skipped")
        
        print()
        
        # Run the specific tests requested
        self.test_job_seeker_dashboard_api()
        self.test_profile_api()
        self.test_admin_jobs_get_all()
        self.test_admin_jobs_get_single()
        self.test_admin_jobs_update()
        self.test_admin_jobs_soft_delete()
        self.test_public_jobs_api()
        self.test_authentication_and_authorization()
        
        # Print summary
        print("=" * 80)
        print("📊 JOBSLLY BACKEND TEST SUMMARY")
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
            print("\n🎉 All tests passed! Backend endpoints are working correctly.")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = JobsllyBackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All Jobslly backend tests passed!")
    else:
        print(f"\n⚠️  {tester.results['failed']} test(s) failed. Please review the issues above.")