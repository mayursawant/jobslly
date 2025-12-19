#!/usr/bin/env python3
"""Script to update email and phone numbers across the codebase"""
import os
import re

def update_file(filepath, old_patterns, new_values):
    """Update file with new email and phone"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for old_pattern, new_value in zip(old_patterns, new_values):
            content = content.replace(old_pattern, new_value)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"❌ Error updating {filepath}: {e}")
        return False

def main():
    # Patterns to replace
    old_email = "contact@academically.com"
    new_email = "upskill@academically.com"
    old_phone = "08071722349"
    new_phone = "8265903855"
    
    # Files to update
    files_to_update = [
        "/app/frontend/src/components/Footer.js",
        "/app/frontend/src/components/ContactUs.js"
    ]
    
    updated_count = 0
    for filepath in files_to_update:
        if os.path.exists(filepath):
            if update_file(filepath, [old_email, old_phone], [new_email, new_phone]):
                updated_count += 1
        else:
            print(f"⚠️  File not found: {filepath}")
    
    print(f"\n✅ Updated {updated_count} files")

if __name__ == "__main__":
    main()
