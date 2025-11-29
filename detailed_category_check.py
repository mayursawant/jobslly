#!/usr/bin/env python3
"""
Detailed Category Check - Verify exact job counts and category distribution
"""

import requests
import json

BASE_URL = "https://seo-upload-fixes.preview.emergentagent.com/api"

def check_detailed_categories():
    print("🔍 DETAILED CATEGORY ANALYSIS")
    print("=" * 50)
    
    # Get all jobs
    response = requests.get(f"{BASE_URL}/jobs?limit=100")
    if response.status_code != 200:
        print(f"❌ Failed to fetch jobs: {response.status_code}")
        return
    
    jobs = response.json()
    print(f"📊 Total jobs found: {len(jobs)}")
    
    # Analyze categories
    category_distribution = {}
    jobs_with_empty_categories = []
    jobs_with_multiple_categories = []
    
    for job in jobs:
        job_id = job.get('id', 'unknown')
        job_title = job.get('title', 'unknown')
        categories = job.get('categories', [])
        
        if not categories:
            jobs_with_empty_categories.append(f"{job_id}: {job_title}")
        elif len(categories) > 1:
            jobs_with_multiple_categories.append(f"{job_id}: {job_title} -> {categories}")
        
        for category in categories:
            if category not in category_distribution:
                category_distribution[category] = []
            category_distribution[category].append(f"{job_id}: {job_title}")
    
    print(f"\n📋 CATEGORY DISTRIBUTION:")
    for category, job_list in sorted(category_distribution.items()):
        print(f"   {category}: {len(job_list)} jobs")
        for job_info in job_list[:3]:  # Show first 3 jobs
            print(f"      • {job_info}")
        if len(job_list) > 3:
            print(f"      ... and {len(job_list) - 3} more")
    
    if jobs_with_empty_categories:
        print(f"\n❌ JOBS WITH EMPTY CATEGORIES ({len(jobs_with_empty_categories)}):")
        for job_info in jobs_with_empty_categories:
            print(f"   • {job_info}")
    else:
        print(f"\n✅ NO JOBS WITH EMPTY CATEGORIES")
    
    if jobs_with_multiple_categories:
        print(f"\n🔄 JOBS WITH MULTIPLE CATEGORIES ({len(jobs_with_multiple_categories)}):")
        for job_info in jobs_with_multiple_categories:
            print(f"   • {job_info}")
    
    # Test each category filter
    print(f"\n🔍 CATEGORY FILTER VERIFICATION:")
    expected_categories = ["doctors", "pharmacists", "dentists", "physiotherapists", "nurses"]
    
    for category in expected_categories:
        response = requests.get(f"{BASE_URL}/jobs?category={category}")
        if response.status_code == 200:
            filtered_jobs = response.json()
            expected_count = len(category_distribution.get(category, []))
            actual_count = len(filtered_jobs)
            
            status = "✅" if actual_count == expected_count else "⚠️"
            print(f"   {status} {category}: {actual_count} filtered vs {expected_count} expected")
            
            if actual_count != expected_count:
                print(f"      Mismatch detected! Investigating...")
                filtered_ids = set(job['id'] for job in filtered_jobs)
                expected_ids = set(job_id.split(':')[0] for job_id in category_distribution.get(category, []))
                
                missing_in_filter = expected_ids - filtered_ids
                extra_in_filter = filtered_ids - expected_ids
                
                if missing_in_filter:
                    print(f"      Missing from filter: {missing_in_filter}")
                if extra_in_filter:
                    print(f"      Extra in filter: {extra_in_filter}")
        else:
            print(f"   ❌ {category}: Failed to fetch ({response.status_code})")
    
    # Special focus on physiotherapists (the previously broken category)
    print(f"\n✨ PHYSIOTHERAPISTS CATEGORY ANALYSIS:")
    physio_jobs = category_distribution.get('physiotherapists', [])
    if physio_jobs:
        print(f"   ✅ SUCCESS: Found {len(physio_jobs)} physiotherapists jobs!")
        for job_info in physio_jobs:
            print(f"      • {job_info}")
        
        # Test the filter specifically
        response = requests.get(f"{BASE_URL}/jobs?category=physiotherapists")
        if response.status_code == 200:
            filtered_physio = response.json()
            print(f"   ✅ Filter working: Returns {len(filtered_physio)} jobs")
        else:
            print(f"   ❌ Filter broken: Status {response.status_code}")
    else:
        print(f"   ❌ STILL BROKEN: No physiotherapists jobs found")

if __name__ == "__main__":
    check_detailed_categories()