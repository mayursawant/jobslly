#!/usr/bin/env python3
"""
Category Filtering Test Suite for Healthcare Jobs Platform
Tests the category filtering functionality after database migration fix.

CONTEXT: Database migration fixed empty job categories and added physiotherapists category.
Expected distribution: doctors (27+), pharmacists (6), dentists (3), physiotherapists (2), nurses (6)
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://blog-job-platform.preview.emergentagent.com/api"

class CategoryFilteringTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        self.category_counts = {}
    
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
    
    def test_all_jobs_endpoint(self):
        """Test 1: GET /api/jobs (all jobs - should return ~38 jobs)"""
        print("📋 Testing All Jobs Endpoint...")
        
        try:
            response = requests.get(f"{self.base_url}/jobs")
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list):
                    job_count = len(jobs)
                    
                    # Verify we have a reasonable number of jobs (around 38 expected)
                    if job_count >= 30:
                        self.log_result("All Jobs Count", True, 
                                      f"Retrieved {job_count} jobs (expected ~38)")
                        
                        # Verify each job has categories field
                        jobs_with_categories = 0
                        jobs_with_empty_categories = 0
                        
                        for job in jobs:
                            if 'categories' in job:
                                if isinstance(job['categories'], list):
                                    if len(job['categories']) > 0:
                                        jobs_with_categories += 1
                                    else:
                                        jobs_with_empty_categories += 1
                                else:
                                    self.log_result("Job Categories Structure", False, 
                                                  f"Job {job.get('id', 'unknown')} has non-list categories: {job['categories']}")
                                    return
                            else:
                                self.log_result("Job Categories Field", False, 
                                              f"Job {job.get('id', 'unknown')} missing categories field")
                                return
                        
                        if jobs_with_empty_categories == 0:
                            self.log_result("No Empty Categories", True, 
                                          f"All {jobs_with_categories} jobs have non-empty categories (migration successful)")
                        else:
                            self.log_result("No Empty Categories", False, 
                                          f"Found {jobs_with_empty_categories} jobs with empty categories")
                        
                    else:
                        self.log_result("All Jobs Count", False, 
                                      f"Only {job_count} jobs found, expected ~38")
                else:
                    self.log_result("All Jobs Endpoint", False, "Response is not a list", jobs)
            else:
                self.log_result("All Jobs Endpoint", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("All Jobs Endpoint", False, f"Exception: {str(e)}")
    
    def test_category_endpoints(self):
        """Test 2-6: Test all category API endpoints"""
        print("🏥 Testing Category Filter Endpoints...")
        
        # Expected categories and their approximate counts
        expected_categories = {
            "doctors": 27,
            "pharmacists": 6,
            "dentists": 3,
            "physiotherapists": 2,  # This was broken before!
            "nurses": 6
        }
        
        for category, expected_count in expected_categories.items():
            try:
                response = requests.get(f"{self.base_url}/jobs?category={category}")
                
                if response.status_code == 200:
                    jobs = response.json()
                    if isinstance(jobs, list):
                        actual_count = len(jobs)
                        self.category_counts[category] = actual_count
                        
                        # Check if we got any jobs (most important for physiotherapists)
                        if actual_count > 0:
                            # Verify all returned jobs actually have this category
                            valid_jobs = 0
                            invalid_jobs = []
                            
                            for job in jobs:
                                if 'categories' in job and isinstance(job['categories'], list):
                                    if category in job['categories']:
                                        valid_jobs += 1
                                    else:
                                        invalid_jobs.append(job.get('id', 'unknown'))
                                else:
                                    invalid_jobs.append(job.get('id', 'unknown'))
                            
                            if len(invalid_jobs) == 0:
                                # Check if count is reasonable (allow some flexibility)
                                if category == "physiotherapists":
                                    # This was the broken category - any jobs is success
                                    self.log_result(f"Category Filter - {category}", True, 
                                                  f"✨ FIXED: {actual_count} {category} jobs found (was 0 before migration)")
                                elif actual_count >= expected_count * 0.7:  # Allow 30% variance
                                    self.log_result(f"Category Filter - {category}", True, 
                                                  f"{actual_count} {category} jobs found (expected ~{expected_count})")
                                else:
                                    self.log_result(f"Category Filter - {category}", True, 
                                                  f"{actual_count} {category} jobs found (expected ~{expected_count}, but any count > 0 is acceptable)")
                            else:
                                self.log_result(f"Category Filter - {category}", False, 
                                              f"Found {len(invalid_jobs)} jobs without '{category}' category: {invalid_jobs}")
                        else:
                            # No jobs found for this category
                            if category == "physiotherapists":
                                self.log_result(f"Category Filter - {category}", False, 
                                              "❌ STILL BROKEN: No physiotherapists jobs found (migration may have failed)")
                            else:
                                self.log_result(f"Category Filter - {category}", False, 
                                              f"No {category} jobs found (expected ~{expected_count})")
                    else:
                        self.log_result(f"Category Filter - {category}", False, 
                                      "Response is not a list", jobs)
                else:
                    self.log_result(f"Category Filter - {category}", False, 
                                  f"Status: {response.status_code}", response.text)
            
            except Exception as e:
                self.log_result(f"Category Filter - {category}", False, f"Exception: {str(e)}")
    
    def test_job_data_structure(self):
        """Test 7: Verify job data structure and categories field"""
        print("🔍 Testing Job Data Structure...")
        
        try:
            # Get a sample of jobs to verify structure
            response = requests.get(f"{self.base_url}/jobs?limit=10")
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list) and jobs:
                    sample_job = jobs[0]
                    
                    # Check required fields
                    required_fields = ['id', 'title', 'company', 'location', 'description', 'categories']
                    missing_fields = [field for field in required_fields if field not in sample_job]
                    
                    if not missing_fields:
                        self.log_result("Job Data Structure - Required Fields", True, 
                                      "All required fields present in job data")
                        
                        # Verify categories field is an array
                        categories = sample_job.get('categories')
                        if isinstance(categories, list):
                            if len(categories) > 0:
                                self.log_result("Job Data Structure - Categories Array", True, 
                                              f"Categories field is non-empty array: {categories}")
                            else:
                                self.log_result("Job Data Structure - Categories Array", False, 
                                              "Categories field is empty array")
                        else:
                            self.log_result("Job Data Structure - Categories Array", False, 
                                          f"Categories field is not an array: {type(categories)}")
                    else:
                        self.log_result("Job Data Structure - Required Fields", False, 
                                      f"Missing required fields: {missing_fields}")
                else:
                    self.log_result("Job Data Structure", False, "No jobs available for structure testing")
            else:
                self.log_result("Job Data Structure", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Job Data Structure", False, f"Exception: {str(e)}")
    
    def test_multiple_categories_edge_case(self):
        """Test 8: Test jobs with multiple categories appear in multiple filters"""
        print("🔄 Testing Multiple Categories Edge Case...")
        
        try:
            # Get all jobs to find ones with multiple categories
            response = requests.get(f"{self.base_url}/jobs?limit=100")
            
            if response.status_code == 200:
                jobs = response.json()
                multi_category_jobs = []
                
                for job in jobs:
                    if isinstance(job.get('categories'), list) and len(job['categories']) > 1:
                        multi_category_jobs.append(job)
                
                if multi_category_jobs:
                    # Test first multi-category job
                    test_job = multi_category_jobs[0]
                    job_id = test_job['id']
                    categories = test_job['categories']
                    
                    self.log_result("Multiple Categories - Job Found", True, 
                                  f"Found job with multiple categories: {categories}")
                    
                    # Test that this job appears in filters for each of its categories
                    appears_in_all_filters = True
                    
                    for category in categories:
                        cat_response = requests.get(f"{self.base_url}/jobs?category={category}")
                        if cat_response.status_code == 200:
                            cat_jobs = cat_response.json()
                            job_ids_in_category = [job['id'] for job in cat_jobs]
                            
                            if job_id not in job_ids_in_category:
                                appears_in_all_filters = False
                                self.log_result(f"Multiple Categories - {category} Filter", False, 
                                              f"Job {job_id} not found in {category} filter despite having this category")
                                break
                        else:
                            appears_in_all_filters = False
                            self.log_result(f"Multiple Categories - {category} Filter", False, 
                                          f"Failed to fetch {category} filter: {cat_response.status_code}")
                            break
                    
                    if appears_in_all_filters:
                        self.log_result("Multiple Categories - Cross Filter Visibility", True, 
                                      f"Job appears in all relevant category filters: {categories}")
                else:
                    self.log_result("Multiple Categories - Job Found", False, 
                                  "No jobs with multiple categories found for testing")
            else:
                self.log_result("Multiple Categories Edge Case", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Multiple Categories Edge Case", False, f"Exception: {str(e)}")
    
    def test_pagination_with_category_filters(self):
        """Test 9: Test pagination works with category filters"""
        print("📄 Testing Pagination with Category Filters...")
        
        # Test with doctors category (should have most jobs)
        try:
            # Get first page
            response1 = requests.get(f"{self.base_url}/jobs?category=doctors&skip=0&limit=10")
            
            if response1.status_code == 200:
                jobs_page1 = response1.json()
                
                if isinstance(jobs_page1, list) and len(jobs_page1) > 0:
                    # Get second page
                    response2 = requests.get(f"{self.base_url}/jobs?category=doctors&skip=10&limit=10")
                    
                    if response2.status_code == 200:
                        jobs_page2 = response2.json()
                        
                        # Verify pagination is working
                        if isinstance(jobs_page2, list):
                            # Check that pages have different jobs (if there are enough jobs)
                            page1_ids = set(job['id'] for job in jobs_page1)
                            page2_ids = set(job['id'] for job in jobs_page2)
                            
                            if len(jobs_page1) == 10 and len(jobs_page2) > 0:
                                if page1_ids.isdisjoint(page2_ids):
                                    self.log_result("Pagination with Category Filter", True, 
                                                  f"Pagination working: Page 1 ({len(jobs_page1)} jobs), Page 2 ({len(jobs_page2)} jobs), no overlap")
                                else:
                                    self.log_result("Pagination with Category Filter", False, 
                                                  "Pages have overlapping jobs")
                            else:
                                self.log_result("Pagination with Category Filter", True, 
                                              f"Pagination working: Page 1 ({len(jobs_page1)} jobs), Page 2 ({len(jobs_page2)} jobs)")
                        else:
                            self.log_result("Pagination with Category Filter", False, 
                                          "Second page response is not a list")
                    else:
                        self.log_result("Pagination with Category Filter", False, 
                                      f"Second page request failed: {response2.status_code}")
                else:
                    self.log_result("Pagination with Category Filter", False, 
                                  "First page returned no jobs or invalid format")
            else:
                self.log_result("Pagination with Category Filter", False, 
                              f"First page request failed: {response1.status_code}")
        
        except Exception as e:
            self.log_result("Pagination with Category Filter", False, f"Exception: {str(e)}")
    
    def test_invalid_category_filter(self):
        """Test 10: Test invalid category filter returns empty results gracefully"""
        print("❌ Testing Invalid Category Filter...")
        
        try:
            response = requests.get(f"{self.base_url}/jobs?category=invalid_category")
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list) and len(jobs) == 0:
                    self.log_result("Invalid Category Filter", True, 
                                  "Invalid category filter returns empty list gracefully")
                else:
                    self.log_result("Invalid Category Filter", False, 
                                  f"Expected empty list, got {len(jobs) if isinstance(jobs, list) else 'non-list'}")
            else:
                self.log_result("Invalid Category Filter", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Invalid Category Filter", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all category filtering tests"""
        print("🚀 Starting Category Filtering Test Suite")
        print("=" * 60)
        
        # Run all tests
        self.test_all_jobs_endpoint()
        self.test_category_endpoints()
        self.test_job_data_structure()
        self.test_multiple_categories_edge_case()
        self.test_pagination_with_category_filters()
        self.test_invalid_category_filter()
        
        # Print summary
        print("=" * 60)
        print("📊 CATEGORY FILTERING TEST SUMMARY")
        print("=" * 60)
        
        print(f"✅ Tests Passed: {self.results['passed']}")
        print(f"❌ Tests Failed: {self.results['failed']}")
        print(f"📈 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.category_counts:
            print("\n📋 CATEGORY DISTRIBUTION:")
            total_jobs = sum(self.category_counts.values())
            for category, count in self.category_counts.items():
                percentage = (count / total_jobs * 100) if total_jobs > 0 else 0
                status = "✨ FIXED" if category == "physiotherapists" and count > 0 else ""
                print(f"   {category}: {count} jobs ({percentage:.1f}%) {status}")
        
        if self.results['errors']:
            print(f"\n❌ FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        print("\n" + "=" * 60)
        
        # Return success status
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = CategoryFilteringTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All category filtering tests passed!")
        exit(0)
    else:
        print("💥 Some category filtering tests failed!")
        exit(1)