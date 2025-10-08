import React, { useState, useEffect, useContext } from 'react';
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [pendingJobs, setPendingJobs] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Job Creation State
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    salary_min: '',
    salary_max: '',
    job_type: 'full_time',
    category: 'doctors',
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
    seo_keywords: []
  });
  
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
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, jobsResponse, blogResponse] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/jobs/pending`),
        axios.get(`${API}/admin/blog`)
      ]);
      
      setStats(statsResponse.data);
      setPendingJobs(jobsResponse.data);
      setBlogPosts(blogResponse.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const approveJob = async (jobId) => {
    try {
      await axios.put(`${API}/admin/jobs/${jobId}/approve`);
      toast.success('Job approved successfully!');
      setPendingJobs(prev => prev.filter(job => job.id !== jobId));
      setStats(prev => ({
        ...prev,
        pending_jobs: prev.pending_jobs - 1
      }));
    } catch (error) {
      console.error('Failed to approve job:', error);
      toast.error('Failed to approve job');
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
      featured_image: null // Can't edit existing image directly
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
      const token = localStorage.getItem('access_token');
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-fit">
            <TabsTrigger value="overview" data-testid="admin-tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs" data-testid="admin-tab-jobs">Jobs</TabsTrigger>
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
                                ${job.salary_min.toLocaleString()}
                                {job.salary_max && ` - $${job.salary_max.toLocaleString()}`}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
                    <input
                      type="number"
                      value={newJob.salary_min}
                      onChange={(e) => setNewJob(prev => ({...prev, salary_min: e.target.value}))}
                      placeholder="75000"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary</label>
                    <input
                      type="number"
                      value={newJob.salary_max}
                      onChange={(e) => setNewJob(prev => ({...prev, salary_max: e.target.value}))}
                      placeholder="120000"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Job Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Category *</label>
                  <select
                    value={newJob.category}
                    onChange={(e) => setNewJob(prev => ({...prev, category: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    {jobCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    💡 Select "All Categories" if the job is suitable for multiple healthcare specializations
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
                      />
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
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob(prev => ({...prev, description: e.target.value}))}
                    placeholder="Detailed job description and responsibilities..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
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
                    
                    // Validate salary fields (only numeric)
                    const salaryMinNum = newJob.salary_min ? parseFloat(newJob.salary_min) : 0;
                    const salaryMaxNum = newJob.salary_max ? parseFloat(newJob.salary_max) : 0;
                    
                    if (newJob.salary_min && isNaN(salaryMinNum)) {
                      errors.push('Minimum salary must be a valid number');
                    }
                    if (newJob.salary_max && isNaN(salaryMaxNum)) {
                      errors.push('Maximum salary must be a valid number');
                    }
                    
                    // Check salary range logic
                    if (salaryMinNum > 0 && salaryMaxNum > 0 && salaryMaxNum < salaryMinNum) {
                      errors.push('Maximum salary cannot be less than minimum salary');
                    }
                    
                    // External job validation
                    if (newJob.is_external && !newJob.external_url.trim()) {
                      errors.push('External URL is required for external jobs');
                    }
                    
                    if (newJob.is_external && newJob.external_url && !newJob.external_url.match(/^https?:\/\/.+/)) {
                      errors.push('External URL must be a valid URL starting with http:// or https://');
                    }
                    
                    if (errors.length > 0) {
                      toast.error(`Please fix the following errors:\n${errors.join('\n')}`);
                      return;
                    }

                    try {
                      await axios.post(`${API}/admin/jobs`, {
                        ...newJob,
                        salary_min: salaryMinNum > 0 ? parseInt(salaryMinNum) : null,
                        salary_max: salaryMaxNum > 0 ? parseInt(salaryMaxNum) : null
                      });
                      toast.success('Job posted successfully!');
                      setNewJob({title: '', company: '', location: '', description: '', salary_min: '', salary_max: '', job_type: 'full_time', category: 'doctors', requirements: [], benefits: [], is_external: false, external_url: ''});
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
                  <textarea
                    value={newBlog.content}
                    onChange={(e) => setNewBlog(prev => ({...prev, content: e.target.value}))}
                    placeholder="Write your full article content here... (HTML supported)"
                    rows={12}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 HTML tags supported: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;</p>
                </div>

                {/* Featured Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Image must be less than 5MB');
                            return;
                          }
                          
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            toast.error('Please select a valid image file');
                            return;
                          }

                          setNewBlog(prev => ({...prev, featured_image: file}));
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

                      const token = localStorage.getItem('access_token');
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
                      
                      // Add image if selected
                      if (newBlog.featured_image) {
                        formData.append('featured_image', newBlog.featured_image);
                      }

                      // Check if we're editing or creating
                      const isEditing = newBlog.id;
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
                        seo_keywords: []
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