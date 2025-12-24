import React, { useState, useEffect, useContext, useRef, useMemo, lazy, Suspense } from 'react';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import AIJobEnhancementModal from './AIJobEnhancementModal';
import axios from 'axios';
import { toast } from 'sonner';
import { Wand2 } from 'lucide-react';

// Lazy load JoditEditor - it's 28MB and only needed for editing
const JoditEditor = lazy(() => import('jodit-react'));

// Loading fallback for editor
const EditorLoading = () => (
  <div className="border rounded-lg p-4 min-h-[300px] flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
      <p className="text-sm text-gray-500">Loading editor...</p>
    </div>
  </div>
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to check if salary value should show currency symbol
const shouldShowCurrency = (value) => {
  if (!value) return false;
  // Check if value contains any digit
  return /\d/.test(value);
};

// Helper function to format salary with currency
const formatSalary = (value, currency) => {
  if (!value) return '';
  if (shouldShowCurrency(value)) {
    const symbol = currency === 'USD' ? '$' : '₹';
    return `${symbol}${value}`;
  }
  return value; // Return as-is for pure text like "Negotiable"
};

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [pendingJobs, setPendingJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [editingJob, setEditingJob] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Pagination state for Manage Jobs
  const [jobsSkip, setJobsSkip] = useState(0);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);
  const JOBS_PER_PAGE = 100;
  
  // Job Creation State
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    salary_min: '',
    salary_max: '',
    currency: 'INR',
    job_type: 'full_time',
    categories: [],
    requirements: [],
    benefits: [],
    is_external: false,
    external_url: ''
  });

  const jobCategories = [
    { value: 'doctors', label: '🩺 Doctors' },
    { value: 'pharmacy', label: '💊 Pharmacy' },
    { value: 'dentist', label: '🦷 Dentist' },
    { value: 'nurses', label: '👩‍⚕️ Nurses' },
    { value: 'physiotherapy', label: '🏃‍♂️ Physiotherapy' },
    { value: 'all', label: '🏥 All Categories' }
  ];

  // Image compression utility
  const compressImage = (file, maxSizeKB = 800) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if image is too large (max dimension 1200px)
          const maxDimension = 1200;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to get under maxSizeKB
          let quality = 0.9;
          const tryCompress = () => {
            canvas.toBlob((blob) => {
              if (blob.size <= maxSizeKB * 1024 || quality <= 0.5) {
                // Create a new File object from the blob
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            }, 'image/jpeg', quality);
          };
          
          tryCompress();
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };
  
  // Blog Creation State
  const [newBlog, setNewBlog] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'healthcare',
    tags: [],
    is_published: false,
    is_featured: false,
    featured_image: null,
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    faqs: []
  });
  
  // Jodit Editor ref and config
  const editor = useRef(null);
  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Write your article content here... Use the toolbar to format with headings, bold, italic, lists, images, and more.',
    minHeight: 400,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough',
      '|', 'ul', 'ol',
      '|', 'font', 'fontsize', 'brush', 'paragraph',
      '|', 'image', 'video', 'table', 'link',
      '|', 'align', 'undo', 'redo',
      '|', 'hr', 'eraser', 'copyformat',
      '|', 'symbol', 'fullsize', 'preview', 'print'
    ],
    removeButtons: ['file', 'about'],
    uploader: {
      url: `${API}/admin/upload-image`,
      insertImageAsBase64URI: false,
      imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      format: 'json',
      method: 'POST',
      prepareData: function (formData) {
        return formData;
      },
      isSuccess: function (resp) {
        return resp && resp.success;
      },
      getMessage: function (resp) {
        return resp.message;
      },
      process: function (resp) {
        return {
          files: [resp.url],
          path: '',
          baseurl: '',
          error: resp.error || null,
          message: resp.message || ''
        };
      },
      error: function (e) {
        console.error('Upload error:', e);
        return e.message || 'Upload failed';
      }
    },
    toolbarAdaptive: false
  }), []);

  // Simplified Jodit config for job descriptions
  const jobDescConfig = useMemo(() => ({
    readonly: false,
    placeholder: 'Write the job description here...',
    minHeight: 300,
    buttons: [
      'bold', 'italic', 'underline',
      '|', 'ul', 'ol',
      '|', 'paragraph',
      '|', 'link',
      '|', 'align', 'undo', 'redo'
    ],
    removeButtons: ['file', 'about', 'video', 'table', 'image'],
    toolbarAdaptive: false,
    uploader: {
      insertImageAsBase64URI: false
    }
  }), []);
  
  // AI Enhancement State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // SEO State
  const [seoSettings, setSeoSettings] = useState({
    page_type: 'home',
    title: '',
    description: '',
    keywords: [],
    og_image: '',
    canonical_url: ''
  });

  useEffect(() => {
    fetchAdminData();
    fetchAllJobs();
  }, [retryCount]);

  /**
   * Retry function for failed API calls
   */
  const retryFetchData = () => {
    if (retryCount < 3) {
      console.log(`🔄 Retrying admin data fetch... Attempt ${retryCount + 1}/3`);
      setError(null);
      setRetryCount(prev => prev + 1);
    } else {
      toast.error('Maximum retry attempts reached. Please refresh the page or contact support.');
    }
  };

  const fetchAdminData = async () => {
    console.log('🔄 Starting fetchAdminData...');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('📡 Making API calls to:', {
        stats: `${API}/admin/stats`,
        jobs: `${API}/admin/jobs/pending`, 
        blogs: `${API}/admin/blog`
      });

      // Make API calls individually for better error tracking
      let statsResponse, jobsResponse, blogResponse;
      
      try {
        console.log('📊 Fetching stats...');
        statsResponse = await axios.get(`${API}/admin/stats`, { headers });
        console.log('✅ Stats loaded:', statsResponse.data);
      } catch (error) {
        console.error('❌ Stats API failed:', error);
        throw new Error(`Stats API failed: ${error.response?.status || 'Network error'}`);
      }

      try {
        console.log('💼 Fetching pending jobs...');
        jobsResponse = await axios.get(`${API}/admin/jobs/pending`, { headers });
        console.log('✅ Jobs loaded:', jobsResponse.data.length, 'jobs');
      } catch (error) {
        console.error('❌ Jobs API failed:', error);
        throw new Error(`Jobs API failed: ${error.response?.status || 'Network error'}`);
      }

      try {
        console.log('📝 Fetching blogs...');
        blogResponse = await axios.get(`${API}/admin/blog`, { headers });
        console.log('✅ Blogs loaded:', blogResponse.data.length, 'blogs');
      } catch (error) {
        console.error('❌ Blogs API failed:', error);
        throw new Error(`Blogs API failed: ${error.response?.status || 'Network error'}`);
      }
      
      // Set data
      setStats(statsResponse.data || {});
      setPendingJobs(jobsResponse.data || []);
      setBlogPosts(blogResponse.data || []);
      
      console.log('🎉 Admin data loaded successfully!');
      setError(null); // Clear any previous errors
      setRetryCount(0); // Reset retry count on success
      
    } catch (error) {
      console.error('💥 Failed to fetch admin data:', error);
      console.error('📋 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      let errorMessage = 'Failed to load admin dashboard data';
      
      if (error.message.includes('No authentication token')) {
        errorMessage = '🔑 Authentication required. Please login again.';
      } else if (error.response?.status === 401) {
        errorMessage = '🔑 Session expired. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = '🚫 Admin access required. Insufficient permissions.';
      } else if (error.response?.status === 404) {
        errorMessage = '🔍 Admin endpoints not found. Check backend configuration.';
      } else if (error.response?.status === 500) {
        errorMessage = '🔧 Server error. Please try again in a few moments.';
      } else if (!error.response) {
        errorMessage = '🌐 Network error. Check your internet connection.';
      } else if (error.response?.data?.detail) {
        errorMessage = `⚠️ ${error.response.data.detail}`;
      } else {
        errorMessage = `❌ ${error.message}`;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.log('✅ fetchAdminData completed');
    }
  };

  const approveJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(`${API}/admin/jobs/${jobId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Job approved successfully!');
      setPendingJobs(prev => prev.filter(job => job.id !== jobId));
      setStats(prev => ({
        ...prev,
        pending_jobs: Math.max(0, prev.pending_jobs - 1),
        approved_jobs: prev.approved_jobs + 1
      }));
    } catch (error) {
      console.error('Failed to approve job:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to approve job';
      toast.error(errorMessage);
    }
  };

  /**
   * Fetch all jobs for management (with pagination)
   */
  const fetchAllJobs = async (loadMore = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (loadMore) {
        setLoadingMoreJobs(true);
      }

      const skip = loadMore ? jobsSkip : 0;
      const response = await axios.get(`${API}/admin/jobs/all?limit=${JOBS_PER_PAGE}&skip=${skip}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const newJobs = response.data || [];
      
      if (loadMore) {
        setAllJobs(prev => [...prev, ...newJobs]);
      } else {
        setAllJobs(newJobs);
      }
      
      // Check if there are more jobs to load
      setHasMoreJobs(newJobs.length === JOBS_PER_PAGE);
      setJobsSkip(skip + newJobs.length);
      
    } catch (error) {
      console.error('Failed to fetch all jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoadingMoreJobs(false);
    }
  };

  /**
   * Load more jobs handler
   */
  const handleLoadMoreJobs = () => {
    fetchAllJobs(true);
  };

  /**
   * Handle job editing
   */
  const handleEditJob = async (job) => {
    setEditingJob({
      ...job,
      requirements: job.requirements || [],
      benefits: job.benefits || []
    });
    setIsEditModalOpen(true);
  };

  /**
   * Save edited job
   */
  const saveEditedJob = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(`${API}/admin/jobs/${editingJob.id}`, editingJob, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Job updated successfully!');
      setIsEditModalOpen(false);
      setEditingJob(null);
      fetchAllJobs(); // Refresh the jobs list
    } catch (error) {
      console.error('Failed to update job:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update job';
      toast.error(errorMessage);
    }
  };

  /**
   * Soft delete a job
   */
  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? It will be soft-deleted and can be restored later.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`${API}/admin/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Job deleted successfully!');
      fetchAllJobs(); // Refresh the jobs list
    } catch (error) {
      console.error('Failed to delete job:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to delete job';
      toast.error(errorMessage);
    }
  };

  const archiveJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to archive this job? The deadline will be marked as over.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/jobs/${jobId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Job archived successfully');
      fetchAllJobs();
    } catch (error) {
      console.error('Error archiving job:', error);
      toast.error(error.response?.data?.detail || 'Failed to archive job');
    }
  };

  const unarchiveJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to unarchive this job?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/jobs/${jobId}/unarchive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Job unarchived successfully');
      fetchAllJobs();
    } catch (error) {
      console.error('Error unarchiving job:', error);
      toast.error(error.response?.data?.detail || 'Failed to unarchive job');
    }
  };

  /**
   * Handle blog editing
   */
  const handleEditBlog = (blog) => {
    // Populate the blog form with existing data
    setNewBlog({
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content,
      category: blog.category || 'healthcare',
      is_published: blog.is_published || false,
      is_featured: blog.is_featured || false,
      seo_title: blog.seo_title || '',
      seo_description: blog.seo_description || '',
      faqs: blog.faqs || [],
      featured_image: null, // Will be set when new image uploaded
      existing_image_url: blog.featured_image || null // Store existing image URL
    });
    
    // Store the blog ID for updating
    setNewBlog(prev => ({ ...prev, id: blog.id }));
    
    // Switch to create blog tab for editing
    document.querySelector('[data-testid="admin-tab-create-blog"]').click();
    
    toast.info('Blog loaded for editing. Make your changes and save.');
  };

  /**
   * Handle blog deletion
   */
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/blog/${blogId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove from local state
      setBlogPosts(prev => prev.filter(blog => blog.id !== blogId));
      toast.success('Blog post deleted successfully!');
    } catch (error) {
      console.error('Failed to delete blog:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handleAIEnhancement = (field, enhancedContent) => {
    if (field === 'description') {
      setNewJob(prev => ({ ...prev, description: enhancedContent }));
    } else if (field === 'requirements') {
      // Parse AI response into array format
      const requirementsArray = enhancedContent.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*|\-\s*|\*\s*/, '').trim())
        .filter(req => req.length > 0);
      setNewJob(prev => ({ ...prev, requirements: requirementsArray }));
    } else if (field === 'benefits') {
      // Parse AI response into array format
      const benefitsArray = enhancedContent.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*|\-\s*|\*\s*/, '').trim())
        .filter(benefit => benefit.length > 0);
      setNewJob(prev => ({ ...prev, benefits: benefitsArray }));
    }
    toast.success(`${field} enhanced with AI suggestions!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
          {retryCount > 0 && (
            <p className="text-sm text-orange-600 mt-2">Retry attempt {retryCount}/3</p>
          )}
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Dashboard Loading Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          
          <div className="space-y-3">
            {retryCount < 3 ? (
              <button
                onClick={retryFetchData}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                🔄 Retry ({retryCount}/3)
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Maximum retries reached</p>
                <button
                  onClick={retryFetchData}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-lg transition-colors"
                >
                  🔄 Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage the HealthCare Jobs platform</p>
        </div>

        <Alert className="mb-6 border-emerald-200 bg-emerald-50" data-testid="admin-notice">
          <AlertDescription className="text-emerald-700">
            You have administrator access to manage jobs, users, and platform settings.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 lg:w-fit">
            <TabsTrigger value="overview" data-testid="admin-tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs" data-testid="admin-tab-jobs">Pending Jobs</TabsTrigger>
            <TabsTrigger value="manage-jobs" data-testid="admin-tab-manage-jobs">Manage Jobs</TabsTrigger>
            <TabsTrigger value="create-job" data-testid="admin-tab-create-job">Create Job</TabsTrigger>
            <TabsTrigger value="blog" data-testid="admin-tab-blog">Blog</TabsTrigger>
            <TabsTrigger value="create-blog" data-testid="admin-tab-create-blog">Create Article</TabsTrigger>
            <TabsTrigger value="seo" data-testid="admin-tab-seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card" data-testid="admin-stat-users">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{stats.total_users || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Registered members</p>
                </CardContent>
              </Card>

              <Card className="card" data-testid="admin-stat-jobs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{stats.total_jobs || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">All job postings</p>
                </CardContent>
              </Card>

              <Card className="card" data-testid="admin-stat-pending">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pending_jobs || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                </CardContent>
              </Card>

              <Card className="card" data-testid="admin-stat-applications">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{stats.total_applications || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Total submissions</p>
                </CardContent>
              </Card>

              <Card className="card" data-testid="admin-stat-blogs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Blog Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{stats.total_blogs || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Articles created</p>
                </CardContent>
              </Card>

              <Card className="card" data-testid="admin-stat-published">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{stats.published_blogs || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Live articles</p>
                </CardContent>
              </Card>
            </div>

            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">System Status</span>
                    <Badge className="bg-emerald-100 text-emerald-700">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">AI Service</span>
                    <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database</span>
                    <Badge className="bg-emerald-100 text-emerald-700">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card className="card" data-testid="pending-jobs-card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                  Pending Job Approvals ({pendingJobs.length})
                </CardTitle>
                <p className="text-gray-600">Review and approve job postings from employers</p>
              </CardHeader>
              <CardContent>
                {pendingJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No jobs pending approval at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4 bg-white" data-testid={`pending-job-${job.id}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800">{job.title}</h4>
                            <p className="text-emerald-600 font-medium">{job.company}</p>
                            <p className="text-gray-600">{job.location}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-700 line-clamp-3">{job.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                            {job.salary_min && (
                              <span className="ml-4">
                                {formatSalary(job.salary_min, job.currency)}
                                {job.salary_max && ` - ${formatSalary(job.salary_max, job.currency)}`}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                            <Button
                              onClick={() => approveJob(job.id)}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              data-testid={`approve-job-${job.id}`}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Jobs Tab */}
          <TabsContent value="manage-jobs" className="space-y-6">
            <Card className="card" data-testid="manage-jobs-card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                  Manage All Jobs ({allJobs.length})
                </CardTitle>
                <p className="text-gray-600">View, edit, and manage all job listings in the system</p>
              </CardHeader>
              <CardContent>
                {allJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No jobs found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow" data-testid={`job-${job.id}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800">{job.title}</h4>
                            <p className="text-emerald-600 font-medium">{job.company}</p>
                            <p className="text-gray-600">{job.location}</p>
                            {job.category && (
                              <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                                {job.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={job.is_approved ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}>
                              {job.is_approved ? 'Approved' : 'Pending'}
                            </Badge>
                            {job.is_archived && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-400">
                                Archived
                              </Badge>
                            )}
                            {job.is_external && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                External
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-700 line-clamp-2">{job.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                            {job.salary_min && (
                              <span className="ml-4">
                                {formatSalary(job.salary_min, job.currency)}
                                {job.salary_max && ` - ${formatSalary(job.salary_max, job.currency)}`}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEditJob(job)}
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              data-testid={`edit-job-${job.id}`}
                            >
                              Edit
                            </Button>
                            {job.is_archived ? (
                              <Button
                                onClick={() => unarchiveJob(job.id)}
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-300 hover:bg-green-50"
                                data-testid={`unarchive-job-${job.id}`}
                              >
                                Unarchive
                              </Button>
                            ) : (
                              <Button
                                onClick={() => archiveJob(job.id)}
                                size="sm"
                                variant="outline"
                                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                data-testid={`archive-job-${job.id}`}
                              >
                                Archive
                              </Button>
                            )}
                            <Button
                              onClick={() => deleteJob(job.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              data-testid={`delete-job-${job.id}`}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Job Modal */}
          {isEditModalOpen && editingJob && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Job</h2>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                      <input
                        type="text"
                        value={editingJob.title}
                        onChange={(e) => setEditingJob(prev => ({...prev, title: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                      <input
                        type="text"
                        value={editingJob.company}
                        onChange={(e) => setEditingJob(prev => ({...prev, company: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <input
                        type="text"
                        value={editingJob.location}
                        onChange={(e) => setEditingJob(prev => ({...prev, location: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categories (Select multiple)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {jobCategories.filter(cat => cat.value !== 'all').map((cat) => (
                          <label key={cat.value} className="flex items-center space-x-2 p-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(editingJob.categories || []).includes(cat.value)}
                              onChange={(e) => {
                                const currentCategories = editingJob.categories || [];
                                if (e.target.checked) {
                                  setEditingJob(prev => ({...prev, categories: [...currentCategories, cat.value]}));
                                } else {
                                  setEditingJob(prev => ({...prev, categories: currentCategories.filter(c => c !== cat.value)}));
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm">{cat.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                      <select
                        value={editingJob.job_type}
                        onChange={(e) => setEditingJob(prev => ({...prev, job_type: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={editingJob.currency || 'INR'}
                        onChange={(e) => setEditingJob(prev => ({...prev, currency: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="INR">₹ INR (Indian Rupee)</option>
                        <option value="USD">$ USD (US Dollar)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
                      <input
                        type="text"
                        value={editingJob.salary_min || ''}
                        onChange={(e) => setEditingJob(prev => ({...prev, salary_min: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g., 50000, Negotiable, Competitive"
                      />
                      <p className="text-xs text-gray-500 mt-1">Can be number or text</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary</label>
                      <input
                        type="text"
                        value={editingJob.salary_max || ''}
                        onChange={(e) => setEditingJob(prev => ({...prev, salary_max: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g., 100000, Based on experience"
                      />
                      <p className="text-xs text-gray-500 mt-1">Can be number or text</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                    <Suspense fallback={<EditorLoading />}>
                      <JoditEditor
                        value={editingJob.description}
                        config={jobDescConfig}
                        onBlur={newContent => setEditingJob(prev => ({...prev, description: newContent}))}
                        onChange={() => {}}
                      />
                    </Suspense>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingJob.is_external}
                        onChange={(e) => setEditingJob(prev => ({...prev, is_external: e.target.checked}))}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">External Job</span>
                    </label>
                    {editingJob.is_external && (
                      <div className="flex-1">
                        <input
                          type="url"
                          value={editingJob.external_url || ''}
                          onChange={(e) => setEditingJob(prev => ({...prev, external_url: e.target.value}))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="https://company.com/apply"
                          pattern="https://.*"
                          title="URL must start with https://"
                        />
                        <p className="text-xs text-gray-500 mt-1">Must start with https://</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                    <Button
                      onClick={() => setIsEditModalOpen(false)}
                      variant="outline"
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveEditedJob}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Job Tab */}
          <TabsContent value="create-job" className="space-y-6">
            <Card className="card" data-testid="admin-create-job">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">🎯 Create New Job Posting</CardTitle>
                <p className="text-gray-600">Add a new healthcare job opportunity directly from CMS</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={newJob.title}
                      onChange={(e) => {
                        // Only allow letters, spaces, and common job title characters
                        const value = e.target.value.replace(/[^a-zA-Z\s\-&.,()]/g, '');
                        setNewJob(prev => ({...prev, title: value}));
                      }}
                      placeholder="e.g. Senior Healthcare Specialist"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                    <input
                      type="text"
                      value={newJob.company}
                      onChange={(e) => {
                        // Only allow letters, spaces, and common company name characters
                        const value = e.target.value.replace(/[^a-zA-Z\s\-&.,()]/g, '');
                        setNewJob(prev => ({...prev, company: value}));
                      }}
                      placeholder="e.g. Healthcare Corp"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => {
                        // Only allow letters, spaces, and location characters
                        const value = e.target.value.replace(/[^a-zA-Z\s\-,./()]/g, '');
                        setNewJob(prev => ({...prev, location: value}));
                      }}
                      placeholder="e.g. New York, NY"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <select
                      value={newJob.job_type}
                      onChange={(e) => setNewJob(prev => ({...prev, job_type: e.target.value}))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={newJob.currency}
                      onChange={(e) => setNewJob(prev => ({...prev, currency: e.target.value}))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="INR">₹ INR (Indian Rupee)</option>
                      <option value="USD">$ USD (US Dollar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
                    <input
                      type="text"
                      value={newJob.salary_min}
                      onChange={(e) => setNewJob(prev => ({...prev, salary_min: e.target.value}))}
                      placeholder="e.g., 75000, Negotiable, Competitive"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Can be number or text like "Negotiable", "Competitive", etc.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary</label>
                    <input
                      type="text"
                      value={newJob.salary_max}
                      onChange={(e) => setNewJob(prev => ({...prev, salary_max: e.target.value}))}
                      placeholder="e.g., 120000, Based on experience"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Can be number or text like "Based on experience", etc.</p>
                  </div>
                </div>

                {/* Job Categories - Multiple Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Categories * (Select multiple)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {jobCategories.map((cat) => (
                      <label key={cat.value} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newJob.categories.includes(cat.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewJob(prev => ({...prev, categories: [...prev.categories, cat.value]}));
                            } else {
                              setNewJob(prev => ({...prev, categories: prev.categories.filter(c => c !== cat.value)}));
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Select one or more categories that best describe this position
                  </p>
                </div>
                
                {/* External Job Configuration */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">🔗 External Job Configuration</h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_external"
                      checked={newJob.is_external}
                      onChange={(e) => setNewJob(prev => ({...prev, is_external: e.target.checked, external_url: e.target.checked ? prev.external_url : ''}))}
                      className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                    <label htmlFor="is_external" className="text-sm font-medium text-gray-700">
                      External/Third-party Job (redirects to external application site)
                    </label>
                  </div>
                  {newJob.is_external && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">External Application URL</label>
                      <input
                        type="url"
                        value={newJob.external_url}
                        onChange={(e) => setNewJob(prev => ({...prev, external_url: e.target.value}))}
                        placeholder="https://example.com/jobs/apply-here"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required={newJob.is_external}
                        pattern="https://.*"
                        title="URL must start with https://"
                      />
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        ⚠️ URL must start with https:// (secure connection required)
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        📋 Users will still fill out lead information before being redirected to this external application site.
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Job Description *</label>
                    <button
                      type="button"
                      onClick={() => setIsAIModalOpen(true)}
                      className="flex items-center space-x-2 px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-sm"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>AI Enhance</span>
                    </button>
                  </div>
                  <Suspense fallback={<EditorLoading />}>
                    <JoditEditor
                      value={newJob.description}
                      config={jobDescConfig}
                      onBlur={newContent => setNewJob(prev => ({...prev, description: newContent}))}
                      onChange={() => {}}
                    />
                  </Suspense>
                </div>
                <Button 
                  onClick={async () => {
                    // Validation
                    const errors = [];
                    
                    // Check required fields
                    if (!newJob.title.trim()) errors.push('Job title is required');
                    if (!newJob.company.trim()) errors.push('Company name is required');
                    if (!newJob.location.trim()) errors.push('Location is required');
                    if (!newJob.description.trim()) errors.push('Job description is required');
                    if (!newJob.categories || newJob.categories.length === 0) errors.push('At least one job category must be selected');
                    
                    // Salary fields can now be text or numbers, so no strict validation needed
                    // Users can enter "Negotiable", "Competitive", or numeric values
                    
                    // External job validation
                    if (newJob.is_external && !newJob.external_url.trim()) {
                      errors.push('External URL is required for external jobs');
                    }
                    
                    if (newJob.is_external && newJob.external_url && !newJob.external_url.match(/^https:\/\/.+/)) {
                      errors.push('Invalid URL. It must start with https://');
                    }
                    
                    if (errors.length > 0) {
                      toast.error(`Please fix the following errors:\n${errors.join('\n')}`);
                      return;
                    }

                    try {
                      await axios.post(`${API}/admin/jobs`, {
                        ...newJob
                      });
                      toast.success('Job posted successfully!');
                      setNewJob({title: '', company: '', location: '', description: '', salary_min: '', salary_max: '', currency: 'INR', job_type: 'full_time', categories: [], requirements: [], benefits: [], is_external: false, external_url: ''});
                      fetchAdminData();
                    } catch (error) {
                      toast.error('Failed to create job: ' + (error.response?.data?.message || error.message));
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
                >
                  🚀 Post Job
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Management Tab */}
          <TabsContent value="blog" className="space-y-6">
            <Card className="card" data-testid="admin-blog-list">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">📝 Blog Management</CardTitle>
                <p className="text-gray-600">Manage all blog posts and articles</p>
              </CardHeader>
              <CardContent>
                {blogPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No blog posts yet</h3>
                    <p className="text-gray-600 mb-4">Create your first article to get started</p>
                    <Button onClick={() => document.querySelector('[data-testid="admin-tab-create-blog"]').click()}>
                      Create First Article
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800">{post.title}</h4>
                            <p className="text-gray-600 mt-1">{post.excerpt.substring(0, 120)}...</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>Category: {post.category}</span>
                              <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge variant={post.is_published ? 'default' : 'outline'}>
                              {post.is_published ? 'Published' : 'Draft'}
                            </Badge>
                            {post.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditBlog(post)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleDeleteBlog(post.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Blog Tab */}
          <TabsContent value="create-blog" className="space-y-6">
            <Card className="card" data-testid="admin-create-blog">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">✍️ Create New Article</CardTitle>
                <p className="text-gray-600">Write and publish healthcare content for your audience</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Article Title</label>
                  <input
                    type="text"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g. Top 10 Healthcare Technology Trends in 2025"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt/Summary</label>
                  <textarea
                    value={newBlog.excerpt}
                    onChange={(e) => setNewBlog(prev => ({...prev, excerpt: e.target.value}))}
                    placeholder="Brief summary of the article content..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Article Content</label>
                  <Suspense fallback={<EditorLoading />}>
                    <JoditEditor
                      ref={editor}
                      value={newBlog.content}
                      config={config}
                      onBlur={newContent => setNewBlog(prev => ({...prev, content: newContent}))}
                    />
                  </Suspense>
                  <p className="text-xs text-gray-500 mt-2">💡 Use the toolbar to format your content with headings, bold, italic, lists, links, images, and more.</p>
                </div>

                {/* Featured Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            toast.error('Please select a valid image file');
                            return;
                          }

                          try {
                            toast.info('Compressing image...');
                            // Compress image to under 800KB
                            const compressedFile = await compressImage(file, 800);
                            console.log(`Original size: ${(file.size / 1024).toFixed(2)}KB, Compressed: ${(compressedFile.size / 1024).toFixed(2)}KB`);
                            toast.success(`Image compressed: ${(compressedFile.size / 1024).toFixed(2)}KB`);
                            setNewBlog(prev => ({...prev, featured_image: compressedFile}));
                          } catch (error) {
                            console.error('Image compression failed:', error);
                            toast.error('Failed to compress image. Please try a different image.');
                          }
                        }
                      }}
                      className="hidden"
                      id="blog-image-upload"
                    />
                    <label 
                      htmlFor="blog-image-upload" 
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      {newBlog.featured_image ? (
                        <div className="space-y-2">
                          <div className="w-20 h-20 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🖼️</span>
                          </div>
                          <p className="text-sm text-emerald-600 font-medium">
                            {newBlog.featured_image.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Click to change image
                          </p>
                        </div>
                      ) : newBlog.existing_image_url ? (
                        <div className="space-y-2">
                          <div className="w-20 h-20 bg-blue-100 rounded-lg overflow-hidden">
                            <img 
                              src={newBlog.existing_image_url} 
                              alt="Current" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-blue-600 font-medium">
                            Current Image
                          </p>
                          <p className="text-xs text-gray-500">
                            Click to upload new image
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📷</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Click to upload featured image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  {newBlog.featured_image && (
                    <button
                      type="button"
                      onClick={() => setNewBlog(prev => ({...prev, featured_image: null}))}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newBlog.category}
                      onChange={(e) => setNewBlog(prev => ({...prev, category: e.target.value}))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="healthcare">Healthcare</option>
                      <option value="careers">Careers</option>
                      <option value="technology">Technology</option>
                      <option value="wellness">Wellness</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                    <input
                      type="text"
                      value={newBlog.seo_title}
                      onChange={(e) => setNewBlog(prev => ({...prev, seo_title: e.target.value}))}
                      placeholder="SEO optimized title (optional)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                  <textarea
                    value={newBlog.seo_description}
                    onChange={(e) => setNewBlog(prev => ({...prev, seo_description: e.target.value}))}
                    placeholder="Meta description for search engines (160 chars max)"
                    rows={2}
                    maxLength={160}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{newBlog.seo_description.length}/160 characters</p>
                </div>
                
                {/* FAQ Section */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">FAQs (Frequently Asked Questions)</label>
                    <button
                      type="button"
                      onClick={() => setNewBlog(prev => ({
                        ...prev,
                        faqs: [...prev.faqs, { question: '', answer: '' }]
                      }))}
                      className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                    >
                      + Add FAQ
                    </button>
                  </div>
                  {newBlog.faqs.map((faq, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">FAQ #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => setNewBlog(prev => ({
                            ...prev,
                            faqs: prev.faqs.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const updatedFaqs = [...newBlog.faqs];
                          updatedFaqs[index].question = e.target.value;
                          setNewBlog(prev => ({ ...prev, faqs: updatedFaqs }));
                        }}
                        placeholder="Question"
                        className="w-full p-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-emerald-500"
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const updatedFaqs = [...newBlog.faqs];
                          updatedFaqs[index].answer = e.target.value;
                          setNewBlog(prev => ({ ...prev, faqs: updatedFaqs }));
                        }}
                        placeholder="Answer"
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                  {newBlog.faqs.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No FAQs added yet. Click "+ Add FAQ" to add questions and answers.</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newBlog.is_published}
                      onChange={(e) => setNewBlog(prev => ({...prev, is_published: e.target.checked}))}
                      className="mr-2"
                    />
                    Publish immediately
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newBlog.is_featured}
                      onChange={(e) => setNewBlog(prev => ({...prev, is_featured: e.target.checked}))}
                      className="mr-2"
                    />
                    Mark as featured
                  </label>
                </div>
                <Button 
                  onClick={async () => {
                    try {
                      // Validation
                      if (!newBlog.title.trim()) {
                        toast.error('Article title is required');
                        return;
                      }
                      if (!newBlog.content.trim()) {
                        toast.error('Article content is required');
                        return;
                      }

                      const token = localStorage.getItem('token');
                      if (!token) {
                        toast.error('Authentication required');
                        return;
                      }

                      // Create FormData for file upload
                      const formData = new FormData();
                      formData.append('title', newBlog.title);
                      formData.append('excerpt', newBlog.excerpt);
                      formData.append('content', newBlog.content);
                      formData.append('category', newBlog.category);
                      formData.append('is_published', newBlog.is_published);
                      formData.append('is_featured', newBlog.is_featured);
                      formData.append('seo_title', newBlog.seo_title);
                      formData.append('seo_description', newBlog.seo_description);
                      formData.append('faqs', JSON.stringify(newBlog.faqs));
                      
                      // Check if we're editing or creating
                      const isEditing = newBlog.id;
                      
                      // Add image only if a new one is selected
                      // When editing, if no new image is uploaded, the existing image will be preserved on backend
                      if (newBlog.featured_image) {
                        formData.append('featured_image', newBlog.featured_image);
                      }
                      const url = isEditing ? `${API}/admin/blog/${newBlog.id}` : `${API}/admin/blog`;
                      const method = isEditing ? 'put' : 'post';

                      await axios({
                        method,
                        url,
                        data: formData,
                        headers: {
                          'Content-Type': 'multipart/form-data',
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      
                      toast.success(
                        isEditing 
                          ? 'Article updated successfully!' 
                          : (newBlog.is_published ? 'Article published successfully!' : 'Article saved as draft!')
                      );
                      
                      // Reset form
                      setNewBlog({
                        title: '', 
                        excerpt: '', 
                        content: '', 
                        category: 'healthcare', 
                        tags: [], 
                        is_published: false, 
                        is_featured: false, 
                        featured_image: null, 
                        seo_title: '', 
                        seo_description: '', 
                        seo_keywords: [],
                        faqs: []
                      });
                      
                      fetchAdminData();
                    } catch (error) {
                      console.error('Blog operation failed:', error);
                      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
                      toast.error('Failed to save article: ' + errorMessage);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
                >
                  {newBlog.id ? '📝 Update Article' : (newBlog.is_published ? '🚀 Publish Article' : '💾 Save as Draft')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Management Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card className="card" data-testid="admin-seo">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">🔍 SEO Management</CardTitle>
                <p className="text-gray-600">Optimize your website for search engines</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Type</label>
                  <select
                    value={seoSettings.page_type}
                    onChange={(e) => setSeoSettings(prev => ({...prev, page_type: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="home">Homepage</option>
                    <option value="jobs">Jobs Page</option>
                    <option value="blog">Blog Page</option>
                    <option value="about">About Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={seoSettings.title}
                    onChange={(e) => setSeoSettings(prev => ({...prev, title: e.target.value}))}
                    placeholder="Jobslly - Future of Healthcare Careers"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    value={seoSettings.description}
                    onChange={(e) => setSeoSettings(prev => ({...prev, description: e.target.value}))}
                    placeholder="Discover healthcare opportunities for doctors, nurses, pharmacists..."
                    rows={3}
                    maxLength={160}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{seoSettings.description.length}/160 characters</p>
                </div>
                <Button 
                  onClick={async () => {
                    try {
                      await axios.post(`${API}/admin/seo`, seoSettings);
                      toast.success('SEO settings updated successfully!');
                    } catch (error) {
                      toast.error('Failed to update SEO settings');
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
                >
                  💾 Update SEO Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Enhancement Modal */}
      <AIJobEnhancementModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        jobData={newJob}
        onApplyEnhancement={handleAIEnhancement}
        backendUrl={BACKEND_URL}
      />
    </div>
  );
};

export default AdminPanel;