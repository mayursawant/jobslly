#!/usr/bin/env python3
import asyncio
import requests
import json
from datetime import datetime, timezone

BACKEND_URL = "https://healthjobs.preview.emergentagent.com"
ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJleHAiOjE3NTk2OTUxMzF9.ql52oQJcPSQwvzU1AOpsviKSMmWXF-kWHPSuBjiYuGQ"

def create_request(endpoint, data, token=ADMIN_TOKEN):
    """Helper function to make API requests"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    response = requests.post(f"{BACKEND_URL}/api{endpoint}", 
                           headers=headers, 
                           json=data)
    return response

# HERO Jobs for India
hero_jobs_india = [
    {
        "title": "HERO Healthcare Worker - Emergency Medicine",
        "company": "Apollo Hospitals",
        "location": "Mumbai, India",
        "description": "Join our HERO (Healthcare Emergency Response Operations) team as an emergency medicine specialist. Work with cutting-edge medical technology in India's premier healthcare facility.",
        "salary_min": 1800000,
        "salary_max": 2500000,
        "job_type": "full_time",
        "requirements": ["MBBS with MD Emergency Medicine", "3+ years experience", "BLS/ACLS certified", "Trauma care experience"],
        "benefits": ["Medical Insurance", "Housing Allowance", "International Training", "Performance Bonus"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "HERO Critical Care Nurse",
        "company": "Fortis Healthcare",
        "location": "Bangalore, India", 
        "description": "Be part of our HERO nursing team providing critical care services. Experience advanced medical procedures in a world-class facility.",
        "salary_min": 800000,
        "salary_max": 1200000,
        "job_type": "full_time",
        "requirements": ["BSc Nursing", "ICU experience 2+ years", "Advanced cardiac life support", "Patient care excellence"],
        "benefits": ["Health Coverage", "Professional Development", "Shift Allowance", "Annual Bonus"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "HERO Surgical Technologist",
        "company": "Max Healthcare",
        "location": "Delhi, India",
        "description": "Join our elite HERO surgical team. Support complex surgical procedures with state-of-the-art equipment and advanced techniques.",
        "salary_min": 1200000,
        "salary_max": 1800000,
        "job_type": "full_time", 
        "requirements": ["Diploma in Operation Theatre Technology", "Surgical experience 3+ years", "Sterile technique expertise", "Team collaboration skills"],
        "benefits": ["Medical Benefits", "Training Programs", "Career Growth", "Flexible Hours"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "HERO Radiologic Technologist",
        "company": "Medanta Hospital",
        "location": "Gurgaon, India",
        "description": "Work as a HERO radiology specialist with advanced imaging technology. Support diagnostic and interventional procedures.",
        "salary_min": 1000000,
        "salary_max": 1500000,
        "job_type": "full_time",
        "requirements": ["Diploma in Radiology", "2+ years imaging experience", "CT/MRI certification", "Radiation safety knowledge"],
        "benefits": ["Health Insurance", "Equipment Training", "Professional Growth", "Performance Incentives"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "HERO Pharmacy Director",
        "company": "AIIMS Delhi",
        "location": "New Delhi, India",
        "description": "Lead our HERO pharmacy operations. Manage pharmaceutical services and ensure optimal patient medication outcomes.",
        "salary_min": 2200000,
        "salary_max": 3000000,
        "job_type": "full_time",
        "requirements": ["PharmD or M.Pharm", "Hospital pharmacy experience 5+ years", "Leadership skills", "Clinical pharmacy knowledge"],
        "benefits": ["Government Benefits", "Research Opportunities", "Housing", "Medical Coverage"],
        "is_external": False,
        "external_url": None
    }
]

# MSL Jobs for India and Australia
msl_jobs = [
    {
        "title": "Medical Science Liaison - Oncology",
        "company": "Pfizer India",
        "location": "Mumbai, India",
        "description": "Join as MSL for oncology portfolio. Provide scientific support to healthcare professionals and contribute to medical education.",
        "salary_min": 2500000,
        "salary_max": 3500000,
        "job_type": "full_time",
        "requirements": ["MD/PhD in relevant field", "Clinical experience 3+ years", "Scientific communication skills", "Oncology knowledge"],
        "benefits": ["Global Exposure", "Research Opportunities", "Travel Allowance", "Stock Options"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "Senior MSL - Cardiology",
        "company": "Novartis Pharmaceuticals",
        "location": "Sydney, Australia",
        "description": "Senior MSL position focusing on cardiovascular portfolio. Engage with key opinion leaders and support clinical research.",
        "salary_min": 180000,
        "salary_max": 220000,
        "job_type": "full_time",
        "requirements": ["MD/PhD Cardiology", "MSL experience 2+ years", "Scientific leadership", "Regulatory knowledge"],
        "benefits": ["Superannuation", "Health Coverage", "Flexible Work", "Professional Development"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "MSL - Neuroscience",
        "company": "Roche India",
        "location": "Bangalore, India",
        "description": "Drive medical affairs activities in neuroscience. Support clinical trials and provide scientific insights to healthcare providers.",
        "salary_min": 2800000,
        "salary_max": 3800000,
        "job_type": "full_time",
        "requirements": ["Medical degree with Neurology specialization", "Research background", "Data analysis skills", "Communication excellence"],
        "benefits": ["International Projects", "Learning Budget", "Health Benefits", "Performance Bonus"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "Medical Science Liaison - Immunology", 
        "company": "Johnson & Johnson",
        "location": "Melbourne, Australia",
        "description": "MSL role in immunology and inflammatory diseases. Collaborate with researchers and support product development.",
        "salary_min": 170000,
        "salary_max": 210000,
        "job_type": "full_time",
        "requirements": ["PhD Immunology or related", "Clinical research experience", "Scientific writing", "Stakeholder engagement"],
        "benefits": ["Comprehensive Insurance", "Research Sabbatical", "Innovation Projects", "Global Networking"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "Regional MSL - Infectious Diseases",
        "company": "GSK Australia",
        "location": "Perth, Australia",
        "description": "Regional MSL covering infectious diseases portfolio. Drive scientific excellence and support market access initiatives.",
        "salary_min": 165000,
        "salary_max": 200000,
        "job_type": "full_time",
        "requirements": ["Medical/Scientific degree", "Infectious disease expertise", "Regional travel capability", "Cross-functional collaboration"],
        "benefits": ["Travel Allowance", "Health & Wellness", "Career Advancement", "Stock Purchase Plan"],
        "is_external": False,
        "external_url": None
    }
]

# Australia Doctor Jobs
australia_doctor_jobs = [
    {
        "title": "General Practitioner - Rural Practice",
        "company": "Rural Health Network Australia", 
        "location": "Cairns, Queensland, Australia",
        "description": "Join our rural GP practice serving remote communities. Make a meaningful impact while enjoying work-life balance in tropical Queensland.",
        "salary_min": 280000,
        "salary_max": 350000,
        "job_type": "full_time",
        "requirements": ["MBBS with FRACGP", "Rural medicine experience", "Emergency care skills", "Community engagement"],
        "benefits": ["Relocation Assistance", "Housing Subsidy", "Professional Development", "Flexible Schedule"],
        "is_external": True,
        "external_url": "https://www.seek.com.au/rural-doctor-jobs"
    },
    {
        "title": "Emergency Medicine Consultant",
        "company": "Royal Melbourne Hospital",
        "location": "Melbourne, Victoria, Australia",
        "description": "Consultant position in busy metropolitan emergency department. Lead emergency care and mentor junior doctors.",
        "salary_min": 320000,
        "salary_max": 400000,
        "job_type": "full_time",
        "requirements": ["FACEM certification", "Leadership experience", "Trauma management", "Teaching capabilities"],
        "benefits": ["Public Hospital Benefits", "Research Time", "Conference Funding", "Sabbatical Leave"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "Cardiologist - Interventional",
        "company": "St Vincent's Hospital",
        "location": "Sydney, New South Wales, Australia", 
        "description": "Interventional cardiology position with access to cutting-edge cathlab technology. Join our world-renowned cardiac program.",
        "salary_min": 450000,
        "salary_max": 550000,
        "job_type": "full_time",
        "requirements": ["FRACP with Cardiology subspecialty", "Interventional training", "Research experience", "Innovation mindset"],
        "benefits": ["Research Grants", "International Conferences", "Equipment Access", "Collaborative Environment"],
        "is_external": True,
        "external_url": "https://www.healthjobs.com.au/cardiology-jobs"
    },
    {
        "title": "Psychiatrist - Community Mental Health",
        "company": "Queensland Health",
        "location": "Brisbane, Queensland, Australia",
        "description": "Community psychiatrist role focusing on mental health services. Work with diverse populations and innovative treatment approaches.",
        "salary_min": 290000,
        "salary_max": 360000,
        "job_type": "full_time",
        "requirements": ["FRANZCP qualification", "Community psychiatry experience", "Cultural competency", "Multidisciplinary teamwork"],
        "benefits": ["Government Pension", "Study Leave", "Professional Registration", "Work-Life Balance"],
        "is_external": False,
        "external_url": None
    },
    {
        "title": "Anaesthetist - Private Practice",
        "company": "Sydney Anaesthesia Group",
        "location": "Sydney, New South Wales, Australia",
        "description": "Join our established anaesthesia practice. Work across multiple private hospitals with excellent earning potential.",
        "salary_min": 380000,
        "salary_max": 480000,
        "job_type": "full_time",
        "requirements": ["FANZCA Fellowship", "Private practice experience", "Multi-hospital privileges", "Professional indemnity"],
        "benefits": ["Partnership Track", "Flexible Hours", "High Earning Potential", "Professional Autonomy"],
        "is_external": True,
        "external_url": "https://www.medrecruit.com.au/anaesthetist-jobs"
    }
]

def create_all_jobs():
    print("Creating HERO jobs for India...")
    for job in hero_jobs_india:
        response = create_request("/admin/jobs", job)
        if response.status_code == 200:
            print(f"✅ Created: {job['title']}")
        else:
            print(f"❌ Failed to create {job['title']}: {response.text}")
    
    print("\nCreating MSL jobs...")
    for job in msl_jobs:
        response = create_request("/admin/jobs", job)
        if response.status_code == 200:
            print(f"✅ Created: {job['title']}")
        else:
            print(f"❌ Failed to create {job['title']}: {response.text}")
    
    print("\nCreating Australia doctor jobs...")
    for job in australia_doctor_jobs:
        response = create_request("/admin/jobs", job)
        if response.status_code == 200:
            print(f"✅ Created: {job['title']}")
        else:
            print(f"❌ Failed to create {job['title']}: {response.text}")

if __name__ == "__main__":
    create_all_jobs()