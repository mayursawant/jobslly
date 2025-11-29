#!/usr/bin/env python3
"""
Blog Image Upload Functionality Testing Suite
Tests the comprehensive blog image upload functionality as requested in the review.

Test Requirements:
1. Image Upload Endpoint Test (POST /api/admin/upload-image)
2. Blog Creation with Featured Image (POST /api/admin/blog)
3. Blog Update with Featured Image (PUT /api/admin/blog/{id})
4. Retrieve Blog and Verify Image URL (GET /api/blog/{slug})
"""

import requests
import json
import uuid
import os
import io
from PIL import Image
import time

# Configuration
BASE_URL = "https://seo-upload-fixes.preview.emergentagent.com/api"
ADMIN_EMAIL = "developerAdmin@academically.com"
ADMIN_PASSWORD = "password"

class BlogImageUploadTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.admin_token = None
        self.test_blog_id = None
        self.test_image_url = None
        self.test_image_filename = None
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
    
    def create_test_image(self, size=(100, 100), format='JPEG'):
        """Create a small test image in memory"""
        # Create a simple colored image
        img = Image.new('RGB', size, color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format=format)
        img_bytes.seek(0)
        return img_bytes
    
    def create_large_test_image(self, size=(2000, 2000), format='JPEG'):
        """Create a large test image (>5MB) for size validation testing"""
        img = Image.new('RGB', size, color='blue')
        img_bytes = io.BytesIO()
        # Use high quality to increase file size
        img.save(img_bytes, format=format, quality=100)
        img_bytes.seek(0)
        return img_bytes
    
    def test_admin_authentication(self):
        """Test 1: Admin Authentication"""
        print("🔐 Testing Admin Authentication...")
        
        try:
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.admin_token = data["access_token"]
                    self.log_result("Admin Authentication", True, f"Admin login successful")
                else:
                    self.log_result("Admin Authentication", False, "No access token in response", data)
            else:
                self.log_result("Admin Authentication", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Admin Authentication", False, f"Exception: {str(e)}")
    
    def test_image_upload_endpoint(self):
        """Test 2: Image Upload Endpoint - POST /api/admin/upload-image"""
        print("📤 Testing Image Upload Endpoint...")
        
        if not self.admin_token:
            self.log_result("Image Upload Endpoint", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test 1: Valid image upload
        try:
            test_image = self.create_test_image()
            files = {
                'file': ('test_image.jpg', test_image, 'image/jpeg')
            }
            
            response = requests.post(f"{self.base_url}/admin/upload-image", 
                                   files=files, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["success", "url", "filename"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    if data.get("success") and data.get("url") and data.get("filename"):
                        self.test_image_url = data["url"]
                        self.test_image_filename = data["filename"]
                        self.log_result("Image Upload - Valid Image", True, 
                                      f"Image uploaded successfully. URL: {self.test_image_url}, Filename: {self.test_image_filename}")
                    else:
                        self.log_result("Image Upload - Valid Image", False, 
                                      f"Invalid response values: success={data.get('success')}, url={data.get('url')}, filename={data.get('filename')}")
                else:
                    self.log_result("Image Upload - Valid Image", False, f"Missing fields: {missing_fields}")
            else:
                self.log_result("Image Upload - Valid Image", False, f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Image Upload - Valid Image", False, f"Exception: {str(e)}")
        
        # Test 2: Verify file exists on disk
        if self.test_image_filename:
            try:
                file_path = f"/app/frontend/public/uploads/{self.test_image_filename}"
                if os.path.exists(file_path):
                    file_size = os.path.getsize(file_path)
                    self.log_result("Image Upload - File Exists on Disk", True, 
                                  f"File exists at {file_path} with size {file_size} bytes")
                else:
                    self.log_result("Image Upload - File Exists on Disk", False, 
                                  f"File not found at {file_path}")
            except Exception as e:
                self.log_result("Image Upload - File Exists on Disk", False, f"Exception: {str(e)}")
        
        # Test 3: Image size validation (should reject >5MB)
        try:
            large_image = self.create_large_test_image()
            # Check if the image is actually large enough
            large_image_size = len(large_image.getvalue())
            
            if large_image_size > 5 * 1024 * 1024:  # 5MB
                files = {
                    'file': ('large_test_image.jpg', large_image, 'image/jpeg')
                }
                
                response = requests.post(f"{self.base_url}/admin/upload-image", 
                                       files=files, headers=headers)
                
                if response.status_code == 400:
                    data = response.json()
                    if "too large" in data.get("detail", "").lower() or "5mb" in data.get("detail", "").lower():
                        self.log_result("Image Upload - Size Validation", True, 
                                      f"Correctly rejected large image ({large_image_size} bytes): {data.get('detail')}")
                    else:
                        self.log_result("Image Upload - Size Validation", True, 
                                      f"Rejected large image with status 400: {data.get('detail')}")
                else:
                    self.log_result("Image Upload - Size Validation", False, 
                                  f"Expected 400 for large image, got {response.status_code}")
            else:
                self.log_result("Image Upload - Size Validation", False, 
                              f"Test image not large enough ({large_image_size} bytes), need >5MB")
        
        except Exception as e:
            self.log_result("Image Upload - Size Validation", False, f"Exception: {str(e)}")
        
        # Test 4: Invalid file type validation
        try:
            # Create a text file disguised as an image
            text_content = b"This is not an image file"
            files = {
                'file': ('fake_image.txt', io.BytesIO(text_content), 'text/plain')
            }
            
            response = requests.post(f"{self.base_url}/admin/upload-image", 
                                   files=files, headers=headers)
            
            if response.status_code == 400:
                data = response.json()
                if "invalid file type" in data.get("detail", "").lower() or "only" in data.get("detail", "").lower():
                    self.log_result("Image Upload - File Type Validation", True, 
                                  f"Correctly rejected invalid file type: {data.get('detail')}")
                else:
                    self.log_result("Image Upload - File Type Validation", True, 
                                  f"Rejected invalid file type with status 400: {data.get('detail')}")
            else:
                self.log_result("Image Upload - File Type Validation", False, 
                              f"Expected 400 for invalid file type, got {response.status_code}")
        
        except Exception as e:
            self.log_result("Image Upload - File Type Validation", False, f"Exception: {str(e)}")
    
    def test_blog_creation_with_featured_image(self):
        """Test 3: Blog Creation with Featured Image - POST /api/admin/blog"""
        print("📝 Testing Blog Creation with Featured Image...")
        
        if not self.admin_token:
            self.log_result("Blog Creation with Featured Image", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test 1: Create blog with featured image upload
        try:
            test_image = self.create_test_image()
            
            # Prepare form data
            form_data = {
                'title': 'Test Blog Post with Featured Image',
                'excerpt': 'This is a test blog post to verify featured image functionality',
                'content': 'This blog post tests the featured image upload functionality. The image should be stored as a file path, not base64.',
                'category': 'healthcare',
                'is_published': 'true',
                'is_featured': 'false',
                'seo_title': 'Test Blog SEO Title',
                'seo_description': 'Test blog SEO description for image upload testing',
                'faqs': '[]'
            }
            
            files = {
                'featured_image': ('blog_featured_image.jpg', test_image, 'image/jpeg')
            }
            
            response = requests.post(f"{self.base_url}/admin/blog", 
                                   data=form_data, files=files, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                featured_image = data.get("featured_image")
                
                if featured_image:
                    # Verify it's a file path (starts with /uploads/) not base64
                    if featured_image.startswith("/uploads/") and not featured_image.startswith("data:"):
                        self.test_blog_id = data.get("id")
                        self.log_result("Blog Creation - Featured Image Path", True, 
                                      f"Blog created with file path featured image: {featured_image}")
                        
                        # Verify the image file exists
                        image_file_path = f"/app/frontend/public{featured_image}"
                        if os.path.exists(image_file_path):
                            self.log_result("Blog Creation - Image File Exists", True, 
                                          f"Featured image file exists at: {image_file_path}")
                        else:
                            self.log_result("Blog Creation - Image File Exists", False, 
                                          f"Featured image file not found at: {image_file_path}")
                    else:
                        self.log_result("Blog Creation - Featured Image Path", False, 
                                      f"Featured image is not a file path: {featured_image[:100]}...")
                else:
                    self.log_result("Blog Creation - Featured Image Path", False, 
                                  "No featured_image field in response")
            else:
                self.log_result("Blog Creation - Featured Image Path", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Blog Creation - Featured Image Path", False, f"Exception: {str(e)}")
        
        # Test 2: Create blog without featured image (should work)
        try:
            form_data = {
                'title': 'Test Blog Post without Featured Image',
                'excerpt': 'This is a test blog post without featured image',
                'content': 'This blog post tests creation without featured image.',
                'category': 'healthcare',
                'is_published': 'true',
                'is_featured': 'false'
            }
            
            response = requests.post(f"{self.base_url}/admin/blog", 
                                   data=form_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                featured_image = data.get("featured_image")
                
                if featured_image is None or featured_image == "":
                    self.log_result("Blog Creation - No Featured Image", True, 
                                  "Blog created successfully without featured image")
                else:
                    self.log_result("Blog Creation - No Featured Image", True, 
                                  f"Blog created with featured_image: {featured_image}")
            else:
                self.log_result("Blog Creation - No Featured Image", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Blog Creation - No Featured Image", False, f"Exception: {str(e)}")
    
    def test_blog_update_with_featured_image(self):
        """Test 4: Blog Update with Featured Image - PUT /api/admin/blog/{id}"""
        print("✏️ Testing Blog Update with Featured Image...")
        
        if not self.admin_token:
            self.log_result("Blog Update with Featured Image", False, "No admin token available")
            return
        
        if not self.test_blog_id:
            self.log_result("Blog Update with Featured Image", False, "No test blog ID available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test 1: Update blog with new featured image
        try:
            # Get current blog data first
            current_response = requests.get(f"{self.base_url}/admin/blog", headers=headers)
            if current_response.status_code != 200:
                self.log_result("Blog Update - Get Current Data", False, "Could not fetch current blog data")
                return
            
            blogs = current_response.json()
            current_blog = None
            for blog in blogs:
                if blog.get("id") == self.test_blog_id:
                    current_blog = blog
                    break
            
            if not current_blog:
                self.log_result("Blog Update - Find Blog", False, f"Could not find blog with ID: {self.test_blog_id}")
                return
            
            old_featured_image = current_blog.get("featured_image")
            
            # Create new test image
            new_test_image = self.create_test_image(size=(150, 150))
            
            # Prepare update form data
            form_data = {
                'title': current_blog.get('title', '') + ' - Updated',
                'excerpt': current_blog.get('excerpt', ''),
                'content': current_blog.get('content', '') + '\n\nThis blog has been updated with a new featured image.',
                'category': current_blog.get('category', 'healthcare'),
                'is_published': 'true',
                'is_featured': str(current_blog.get('is_featured', False)).lower(),
                'seo_title': current_blog.get('seo_title', ''),
                'seo_description': current_blog.get('seo_description', ''),
                'faqs': json.dumps(current_blog.get('faqs', []))
            }
            
            files = {
                'featured_image': ('updated_blog_image.jpg', new_test_image, 'image/jpeg')
            }
            
            response = requests.put(f"{self.base_url}/admin/blog/{self.test_blog_id}", 
                                  data=form_data, files=files, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                new_featured_image = data.get("featured_image")
                
                if new_featured_image:
                    # Verify it's a different file path than before
                    if (new_featured_image.startswith("/uploads/") and 
                        new_featured_image != old_featured_image and
                        not new_featured_image.startswith("data:")):
                        
                        self.log_result("Blog Update - New Featured Image", True, 
                                      f"Blog updated with new featured image: {new_featured_image}")
                        
                        # Verify the new image file exists
                        new_image_file_path = f"/app/frontend/public{new_featured_image}"
                        if os.path.exists(new_image_file_path):
                            self.log_result("Blog Update - New Image File Exists", True, 
                                          f"New featured image file exists at: {new_image_file_path}")
                        else:
                            self.log_result("Blog Update - New Image File Exists", False, 
                                          f"New featured image file not found at: {new_image_file_path}")
                        
                        # Check if old image was replaced (optional - depends on implementation)
                        if old_featured_image and old_featured_image.startswith("/uploads/"):
                            old_image_file_path = f"/app/frontend/public{old_featured_image}"
                            if not os.path.exists(old_image_file_path):
                                self.log_result("Blog Update - Old Image Cleanup", True, 
                                              "Old featured image file was cleaned up")
                            else:
                                self.log_result("Blog Update - Old Image Cleanup", True, 
                                              "Old featured image file still exists (acceptable)")
                    else:
                        self.log_result("Blog Update - New Featured Image", False, 
                                      f"Featured image not properly updated. Old: {old_featured_image}, New: {new_featured_image}")
                else:
                    self.log_result("Blog Update - New Featured Image", False, 
                                  "No featured_image field in update response")
            else:
                self.log_result("Blog Update - New Featured Image", False, 
                              f"Status: {response.status_code}", response.text)
        
        except Exception as e:
            self.log_result("Blog Update - New Featured Image", False, f"Exception: {str(e)}")
    
    def test_blog_retrieval_and_image_url(self):
        """Test 5: Retrieve Blog and Verify Image URL - GET /api/blog/{slug}"""
        print("🔍 Testing Blog Retrieval and Image URL...")
        
        if not self.test_blog_id:
            self.log_result("Blog Retrieval and Image URL", False, "No test blog ID available")
            return
        
        # Test 1: Get blog by slug and verify image URL
        try:
            # First, get the blog slug from admin endpoint
            if not self.admin_token:
                self.log_result("Blog Retrieval - Get Slug", False, "No admin token available")
                return
            
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            admin_response = requests.get(f"{self.base_url}/admin/blog", headers=headers)
            
            if admin_response.status_code != 200:
                self.log_result("Blog Retrieval - Get Slug", False, "Could not fetch admin blog data")
                return
            
            blogs = admin_response.json()
            test_blog = None
            for blog in blogs:
                if blog.get("id") == self.test_blog_id:
                    test_blog = blog
                    break
            
            if not test_blog:
                self.log_result("Blog Retrieval - Find Test Blog", False, f"Could not find test blog with ID: {self.test_blog_id}")
                return
            
            blog_slug = test_blog.get("slug")
            if not blog_slug:
                self.log_result("Blog Retrieval - Get Slug", False, "Test blog has no slug")
                return
            
            # Now test public blog retrieval
            public_response = requests.get(f"{self.base_url}/blog/{blog_slug}")
            
            if public_response.status_code == 200:
                public_blog = public_response.json()
                featured_image = public_blog.get("featured_image")
                
                if featured_image:
                    # Verify it's a file path (starts with /uploads/) not base64
                    if featured_image.startswith("/uploads/") and not featured_image.startswith("data:"):
                        self.log_result("Blog Retrieval - Image URL Format", True, 
                                      f"Blog retrieved with correct image URL format: {featured_image}")
                        
                        # Verify the image is accessible (file exists)
                        image_file_path = f"/app/frontend/public{featured_image}"
                        if os.path.exists(image_file_path):
                            self.log_result("Blog Retrieval - Image File Accessible", True, 
                                          f"Featured image file is accessible at: {image_file_path}")
                        else:
                            self.log_result("Blog Retrieval - Image File Accessible", False, 
                                          f"Featured image file not accessible at: {image_file_path}")
                    else:
                        self.log_result("Blog Retrieval - Image URL Format", False, 
                                      f"Featured image URL is not in correct format: {featured_image[:100]}...")
                else:
                    self.log_result("Blog Retrieval - Image URL Format", False, 
                                  "Blog has no featured_image field")
            else:
                self.log_result("Blog Retrieval - Public Access", False, 
                              f"Status: {public_response.status_code}", public_response.text)
        
        except Exception as e:
            self.log_result("Blog Retrieval - Image URL Format", False, f"Exception: {str(e)}")
        
        # Test 2: Verify image URL pattern matches expected format
        try:
            # Get all published blogs and check their image URLs
            response = requests.get(f"{self.base_url}/blog?limit=10")
            
            if response.status_code == 200:
                blogs = response.json()
                blogs_with_images = [blog for blog in blogs if blog.get("featured_image")]
                
                if blogs_with_images:
                    valid_image_urls = 0
                    invalid_image_urls = 0
                    
                    for blog in blogs_with_images:
                        featured_image = blog.get("featured_image")
                        if featured_image.startswith("/uploads/") and not featured_image.startswith("data:"):
                            valid_image_urls += 1
                        else:
                            invalid_image_urls += 1
                    
                    if invalid_image_urls == 0:
                        self.log_result("Blog Image URL Pattern Validation", True, 
                                      f"All {valid_image_urls} blog images use correct file path format")
                    else:
                        self.log_result("Blog Image URL Pattern Validation", False, 
                                      f"Found {invalid_image_urls} blogs with invalid image URLs out of {len(blogs_with_images)} total")
                else:
                    self.log_result("Blog Image URL Pattern Validation", True, 
                                  "No published blogs with featured images found (acceptable)")
            else:
                self.log_result("Blog Image URL Pattern Validation", False, 
                              f"Could not fetch published blogs: {response.status_code}")
        
        except Exception as e:
            self.log_result("Blog Image URL Pattern Validation", False, f"Exception: {str(e)}")
    
    def test_no_419_errors(self):
        """Test 6: Verify No 419 Errors in Image Operations"""
        print("🚫 Testing for 419 Errors...")
        
        if not self.admin_token:
            self.log_result("No 419 Errors Test", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test multiple image uploads to ensure no 419 errors
        try:
            upload_success_count = 0
            upload_419_errors = 0
            
            for i in range(3):
                test_image = self.create_test_image(size=(80 + i*10, 80 + i*10))
                files = {
                    'file': (f'test_image_{i}.jpg', test_image, 'image/jpeg')
                }
                
                response = requests.post(f"{self.base_url}/admin/upload-image", 
                                       files=files, headers=headers)
                
                if response.status_code == 200:
                    upload_success_count += 1
                elif response.status_code == 419:
                    upload_419_errors += 1
                
                # Small delay between uploads
                time.sleep(0.5)
            
            if upload_419_errors == 0:
                self.log_result("No 419 Errors - Image Upload", True, 
                              f"All {upload_success_count} image uploads completed without 419 errors")
            else:
                self.log_result("No 419 Errors - Image Upload", False, 
                              f"Found {upload_419_errors} 419 errors out of 3 upload attempts")
        
        except Exception as e:
            self.log_result("No 419 Errors - Image Upload", False, f"Exception: {str(e)}")
        
        # Test multiple blog creations with images
        try:
            blog_success_count = 0
            blog_419_errors = 0
            
            for i in range(2):
                test_image = self.create_test_image(size=(90 + i*5, 90 + i*5))
                
                form_data = {
                    'title': f'419 Error Test Blog {i+1}',
                    'excerpt': f'Test blog {i+1} for 419 error verification',
                    'content': f'This is test blog {i+1} to verify no 419 errors occur during blog creation with images.',
                    'category': 'healthcare',
                    'is_published': 'true'
                }
                
                files = {
                    'featured_image': (f'blog_test_image_{i}.jpg', test_image, 'image/jpeg')
                }
                
                response = requests.post(f"{self.base_url}/admin/blog", 
                                       data=form_data, files=files, headers=headers)
                
                if response.status_code == 200:
                    blog_success_count += 1
                elif response.status_code == 419:
                    blog_419_errors += 1
                
                # Small delay between blog creations
                time.sleep(1)
            
            if blog_419_errors == 0:
                self.log_result("No 419 Errors - Blog Creation", True, 
                              f"All {blog_success_count} blog creations completed without 419 errors")
            else:
                self.log_result("No 419 Errors - Blog Creation", False, 
                              f"Found {blog_419_errors} 419 errors out of 2 blog creation attempts")
        
        except Exception as e:
            self.log_result("No 419 Errors - Blog Creation", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all blog image upload tests"""
        print("🚀 Starting Blog Image Upload Functionality Tests...")
        print("=" * 60)
        
        # Run tests in sequence
        self.test_admin_authentication()
        self.test_image_upload_endpoint()
        self.test_blog_creation_with_featured_image()
        self.test_blog_update_with_featured_image()
        self.test_blog_retrieval_and_image_url()
        self.test_no_419_errors()
        
        # Print summary
        print("=" * 60)
        print("📊 BLOG IMAGE UPLOAD TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📈 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        print("\n🎯 KEY FINDINGS:")
        if self.results['failed'] == 0:
            print("   • All blog image upload functionality working correctly")
            print("   • Images stored as file paths, not base64")
            print("   • No 419 errors detected")
            print("   • File size validation working (5MB limit)")
            print("   • Image files properly saved to /app/frontend/public/uploads/")
        else:
            print("   • Some blog image upload functionality issues detected")
            print("   • Check failed tests above for details")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = BlogImageUploadTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All blog image upload tests passed!")
    else:
        print("\n⚠️  Some blog image upload tests failed. Check the details above.")