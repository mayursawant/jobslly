#!/usr/bin/env python3
"""
Final Category Filtering Test - Comprehensive verification
"""

import requests
import json

BASE_URL = "https://career-site-revamp.preview.emergentagent.com/api"

def final_category_test():
    print("🎯 FINAL CATEGORY FILTERING TEST")
    print("=" * 50)
    
    # Test all category endpoints with higher limits
    categories = {
        "doctors": 27,
        "pharmacists": 6, 
        "dentists": 3,
        "physiotherapists": 2,
        "nurses": 6
    }
    
    all_passed = True
    
    print("📊 TESTING ALL CATEGORY ENDPOINTS:")
    for category, expected_count in categories.items():
        response = requests.get(f"{BASE_URL}/jobs?category={category}&limit=50")
        
        if response.status_code == 200:
            jobs = response.json()
            actual_count = len(jobs)
            
            # Verify all jobs have the correct category
            valid_jobs = 0
            for job in jobs:
                if category in job.get('categories', []):
                    valid_jobs += 1
            
            if valid_jobs == actual_count and actual_count >= expected_count * 0.8:  # Allow some flexibility
                status = "✅ PASS"
                if category == "physiotherapists":
                    status += " ✨ FIXED"
            else:
                status = "❌ FAIL"
                all_passed = False
            
            print(f"   {status} {category}: {actual_count} jobs (expected ~{expected_count})")
            
            if valid_jobs != actual_count:
                print(f"      ⚠️ {actual_count - valid_jobs} jobs don't have '{category}' category")
        else:
            print(f"   ❌ FAIL {category}: HTTP {response.status_code}")
            all_passed = False
    
    # Test edge cases
    print(f"\n🔍 TESTING EDGE CASES:")
    
    # Test pagination with category
    response = requests.get(f"{BASE_URL}/jobs?category=doctors&skip=0&limit=10")
    if response.status_code == 200 and len(response.json()) == 10:
        print("   ✅ PASS Pagination with category filter")
    else:
        print("   ❌ FAIL Pagination with category filter")
        all_passed = False
    
    # Test invalid category
    response = requests.get(f"{BASE_URL}/jobs?category=invalid_category")
    if response.status_code == 200 and len(response.json()) == 0:
        print("   ✅ PASS Invalid category returns empty list")
    else:
        print("   ❌ FAIL Invalid category handling")
        all_passed = False
    
    # Test job data structure
    response = requests.get(f"{BASE_URL}/jobs?limit=5")
    if response.status_code == 200:
        jobs = response.json()
        if jobs and all('categories' in job and isinstance(job['categories'], list) and len(job['categories']) > 0 for job in jobs):
            print("   ✅ PASS All jobs have non-empty categories array")
        else:
            print("   ❌ FAIL Some jobs missing or have empty categories")
            all_passed = False
    else:
        print("   ❌ FAIL Could not fetch jobs for structure test")
        all_passed = False
    
    # Test multiple categories
    response = requests.get(f"{BASE_URL}/jobs?limit=50")
    if response.status_code == 200:
        jobs = response.json()
        multi_category_jobs = [job for job in jobs if len(job.get('categories', [])) > 1]
        if multi_category_jobs:
            # Test that a multi-category job appears in both filters
            test_job = multi_category_jobs[0]
            job_id = test_job['id']
            categories = test_job['categories']
            
            appears_in_all = True
            for cat in categories:
                cat_response = requests.get(f"{BASE_URL}/jobs?category={cat}&limit=50")
                if cat_response.status_code == 200:
                    cat_jobs = cat_response.json()
                    if not any(job['id'] == job_id for job in cat_jobs):
                        appears_in_all = False
                        break
                else:
                    appears_in_all = False
                    break
            
            if appears_in_all:
                print(f"   ✅ PASS Multi-category jobs appear in all relevant filters")
            else:
                print(f"   ❌ FAIL Multi-category job visibility issue")
                all_passed = False
        else:
            print("   ⚠️ SKIP No multi-category jobs found for testing")
    
    print(f"\n" + "=" * 50)
    if all_passed:
        print("🎉 ALL CATEGORY FILTERING TESTS PASSED!")
        print("✨ Physiotherapists category is now working (was broken before migration)")
        return True
    else:
        print("💥 SOME CATEGORY FILTERING TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = final_category_test()
    exit(0 if success else 1)