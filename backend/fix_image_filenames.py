#!/usr/bin/env python3
"""
Migration script to fix image filenames with spaces in the database
Renames actual files and updates database references
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')

def sanitize_filename(filename):
    """Remove/replace characters that cause issues in URLs"""
    if not filename:
        return filename
    
    # Get the name and extension
    name_parts = filename.rsplit('.', 1)
    if len(name_parts) == 2:
        name, ext = name_parts
    else:
        name = filename
        ext = ''
    
    # Replace spaces and special characters
    name = name.replace(' ', '_')
    name = ''.join(c for c in name if c.isalnum() or c in ('_', '-'))
    
    # Reconstruct filename
    return f"{name}.{ext}" if ext else name

async def fix_image_filenames():
    """Fix all blog post image filenames that contain spaces"""
    client = AsyncIOMotorClient(MONGO_URL, tlsAllowInvalidCertificates=True)
    db = client[DB_NAME]
    
    updated_count = 0
    error_count = 0
    
    # Get all blog posts with images
    blogs = await db.blog_posts.find({'featured_image': {'$exists': True, '$ne': None}}).to_list(None)
    
    print(f"Found {len(blogs)} blog posts with images")
    
    for blog in blogs:
        featured_image = blog.get('featured_image', '')
        
        # Only process /uploads/ paths (not base64)
        if not featured_image or not featured_image.startswith('/uploads/'):
            continue
        
        # Extract filename from path
        filename = featured_image.replace('/uploads/', '')
        
        # Check if filename needs sanitization (has spaces or special chars)
        if ' ' in filename or any(c in filename for c in ['(', ')', '[', ']', '{', '}', '&', '!', '@', '#', '$', '%', '^']):
            # Generate new sanitized filename
            # Keep the UUID prefix, sanitize the rest
            parts = filename.split('_', 1)
            if len(parts) == 2:
                uuid_part, original_name = parts
                sanitized_name = sanitize_filename(original_name)
                new_filename = f"{uuid_part}_{sanitized_name}"
            else:
                new_filename = sanitize_filename(filename)
            
            old_path = f"/app/frontend/public/uploads/{filename}"
            new_path = f"/app/frontend/public/uploads/{new_filename}"
            new_url = f"/uploads/{new_filename}"
            
            # Check if old file exists
            if os.path.exists(old_path):
                try:
                    # Rename the file
                    os.rename(old_path, new_path)
                    
                    # Update database
                    await db.blog_posts.update_one(
                        {'id': blog['id']},
                        {'$set': {'featured_image': new_url}}
                    )
                    
                    print(f"✅ Fixed: {filename} -> {new_filename}")
                    updated_count += 1
                    
                except Exception as e:
                    print(f"❌ Error renaming {filename}: {e}")
                    error_count += 1
            else:
                print(f"⚠️  File not found: {old_path}")
                # Still update DB to point to the sanitized name (in case file was manually renamed)
                await db.blog_posts.update_one(
                    {'id': blog['id']},
                    {'$set': {'featured_image': new_url}}
                )
                error_count += 1
    
    client.close()
    
    print(f"\n✓ Migration complete!")
    print(f"  Updated: {updated_count}")
    print(f"  Errors: {error_count}")
    
    return updated_count

if __name__ == "__main__":
    count = asyncio.run(fix_image_filenames())
    print(f"\n✓ Fixed {count} image filenames")
