import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, jobsResponse] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/jobs/pending`)
      ]);
      
      setStats(statsResponse.data);
      setPendingJobs(jobsResponse.data);
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

          <TabsContent value="users">
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">User Management</CardTitle>
                <p className="text-gray-600">Manage platform users and their permissions</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">User management features coming soon</p>
                  <div className="text-sm text-gray-400">
                    Current user: {user?.email} ({user?.role})
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;