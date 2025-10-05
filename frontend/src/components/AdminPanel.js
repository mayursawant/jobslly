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
    requirements: [],
    benefits: [],
    is_external: false,
    external_url: ''
  });
  
  // Blog Creation State
  const [newBlog, setNewBlog] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'healthcare',
    tags: [],
    is_published: false,
    is_featured: false,
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      value={newJob.title}
                      onChange={(e) => setNewJob(prev => ({...prev, title: e.target.value}))}
                      placeholder="e.g. Senior Cardiologist"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={newJob.company}
                      onChange={(e) => setNewJob(prev => ({...prev, company: e.target.value}))}
                      placeholder="e.g. City Medical Center"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => setNewJob(prev => ({...prev, location: e.target.value}))}
                      placeholder="e.g. New York, NY"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob(prev => ({...prev, description: e.target.value}))}
                    placeholder="Detailed job description and responsibilities..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <Button 
                  onClick={async () => {
                    try {
                      await axios.post(`${API}/admin/jobs`, {
                        ...newJob,
                        salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : null,
                        salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : null
                      });
                      toast.success('Job posted successfully!');
                      setNewJob({title: '', company: '', location: '', description: '', salary_min: '', salary_max: '', job_type: 'full_time', requirements: [], benefits: [], is_external: false, external_url: ''});
                      fetchAdminData();
                    } catch (error) {
                      toast.error('Failed to create job');
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
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300">Delete</Button>
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
                      await axios.post(`${API}/admin/blog`, newBlog);
                      toast.success(newBlog.is_published ? 'Article published successfully!' : 'Article saved as draft!');
                      setNewBlog({title: '', excerpt: '', content: '', category: 'healthcare', tags: [], is_published: false, is_featured: false, seo_title: '', seo_description: '', seo_keywords: []});
                      fetchAdminData();
                    } catch (error) {
                      toast.error('Failed to create article');
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
                >
                  {newBlog.is_published ? '🚀 Publish Article' : '💾 Save as Draft'}
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
    </div>
  );
};

export default AdminPanel;