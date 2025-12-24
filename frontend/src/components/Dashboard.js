import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, isEmployer, isAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Features State
  const [aiText, setAiText] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Job Creation State (for employers)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    salary_min: '',
    salary_max: '',
    job_type: 'full_time',
    requirements: [],
    benefits: []
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      if (user?.role === 'job_seeker') {
        // Fetch applications for job seekers
        // Note: This would need to be implemented in the backend
        setApplications([]);
      } else if (user?.role === 'employer') {
        // Fetch employer's jobs
        const response = await axios.get(`${API}/jobs?limit=100`);
        const employerJobs = response.data.filter(job => job.employer_id === user.id);
        setJobs(employerJobs);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIFeature = async (feature) => {
    if (!aiText.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    setAiLoading(true);
    try {
      let endpoint = '';
      switch (feature) {
        case 'enhance':
          endpoint = '/ai/enhance-job-description';
          break;
        case 'match':
          endpoint = '/ai/match-jobs';
          break;
        case 'analyze':
          endpoint = '/ai/analyze-resume';
          break;
        case 'questions':
          endpoint = '/ai/generate-interview-questions';
          break;
        default:
          return;
      }

      const response = await axios.post(`${API}${endpoint}`, { text: aiText });
      setAiResult(response.data[Object.keys(response.data)[0]]);
      toast.success('AI analysis complete!');
    } catch (error) {
      console.error('AI feature error:', error);
      toast.error('AI service temporarily unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const createJob = async () => {
    try {
      const jobData = {
        ...newJob,
        salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : null,
        salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : null,
        requirements: newJob.requirements.filter(req => req.trim()),
        benefits: newJob.benefits.filter(benefit => benefit.trim())
      };

      await axios.post(`${API}/jobs`, jobData);
      toast.success('Job posted successfully! It will be reviewed by our team.');

      // Reset form
      setNewJob({
        title: '',
        company: '',
        location: '',
        description: '',
        salary_min: '',
        salary_max: '',
        job_type: 'full_time',
        requirements: [],
        benefits: []
      });

      fetchUserData();
    } catch (error) {
      console.error('Job creation error:', error);
      toast.error('Failed to create job posting');
    }
  };

  const addArrayItem = (field, value) => {
    if (value.trim()) {
      setNewJob(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setNewJob(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-gray-600">
            {user?.role === 'job_seeker' && 'Manage your job search and applications'}
            {user?.role === 'employer' && 'Manage your job postings and candidates'}
            {user?.role === 'admin' && 'Admin dashboard with full system access'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-tools" data-testid="tab-ai-tools">AI Tools</TabsTrigger>
            {isEmployer && <TabsTrigger value="post-job" data-testid="tab-post-job">Post Job</TabsTrigger>}
            {user?.role === 'job_seeker' && <TabsTrigger value="applications" data-testid="tab-applications">Applications</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="card" data-testid="stats-card">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user?.role === 'job_seeker' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applications Sent</span>
                        <span className="font-semibold">{applications.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profile Views</span>
                        <span className="font-semibold">12</span>
                      </div>
                    </>
                  )}

                  {user?.role === 'employer' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Jobs</span>
                        <span className="font-semibold">{jobs.filter(job => job.is_approved).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Review</span>
                        <span className="font-semibold">{jobs.filter(job => !job.is_approved).length}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user?.role === 'job_seeker' && (
                    <>
                      <Button className="w-full btn-primary" data-testid="browse-jobs">
                        Browse New Jobs
                      </Button>
                      <Button variant="outline" className="w-full">
                        Update Profile
                      </Button>
                    </>
                  )}

                  {user?.role === 'employer' && (
                    <>
                      <Button
                        className="w-full btn-primary"
                        onClick={() => setActiveTab('post-job')}
                        data-testid="post-new-job"
                      >
                        Post New Job
                      </Button>
                      <Button variant="outline" className="w-full">
                        View Candidates
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Get AI-powered help with your healthcare career
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab('ai-tools')}
                    data-testid="explore-ai-tools"
                  >
                    Explore AI Tools
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {user?.role === 'employer' && jobs.length > 0 ? (
                  <div className="space-y-3">
                    {jobs.slice(0, 5).map(job => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                        </div>
                        <Badge variant={job.is_approved ? 'secondary' : 'outline'}>
                          {job.is_approved ? 'Active' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="ai-tools" className="space-y-6">
            <Card className="card" data-testid="ai-tools-card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">AI-Powered Career Tools</CardTitle>
                <p className="text-gray-600">Use AI to enhance your healthcare career journey</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="ai-input" className="text-sm font-medium text-gray-700">
                    Enter your text for AI analysis
                  </Label>
                  <Textarea
                    id="ai-input"
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    placeholder="Paste your resume, job description, or ask a question..."
                    className="mt-2 form-textarea"
                    rows={6}
                    data-testid="ai-input-text"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {user?.role === 'job_seeker' && (
                    <>
                      <Button
                        onClick={() => handleAIFeature('analyze')}
                        disabled={aiLoading || !aiText.trim()}
                        variant="outline"
                        className="h-auto p-4 text-left"
                        data-testid="ai-analyze-resume"
                      >
                        <div>
                          <div className="font-medium">Resume Analysis</div>
                          <div className="text-sm text-gray-600">Get feedback on your resume</div>
                        </div>
                      </Button>

                      <Button
                        onClick={() => handleAIFeature('match')}
                        disabled={aiLoading || !aiText.trim()}
                        variant="outline"
                        className="h-auto p-4 text-left"
                        data-testid="ai-job-match"
                      >
                        <div>
                          <div className="font-medium">Job Matching</div>
                          <div className="text-sm text-gray-600">Find jobs that match your profile</div>
                        </div>
                      </Button>
                    </>
                  )}

                  {user?.role === 'employer' && (
                    <>
                      <Button
                        onClick={() => handleAIFeature('enhance')}
                        disabled={aiLoading || !aiText.trim()}
                        variant="outline"
                        className="h-auto p-4 text-left"
                        data-testid="ai-enhance-job"
                      >
                        <div>
                          <div className="font-medium">Enhance Job Description</div>
                          <div className="text-sm text-gray-600">Improve your job posting</div>
                        </div>
                      </Button>

                      <Button
                        onClick={() => handleAIFeature('questions')}
                        disabled={aiLoading || !aiText.trim()}
                        variant="outline"
                        className="h-auto p-4 text-left"
                        data-testid="ai-interview-questions"
                      >
                        <div>
                          <div className="font-medium">Interview Questions</div>
                          <div className="text-sm text-gray-600">Generate relevant questions</div>
                        </div>
                      </Button>
                    </>
                  )}
                </div>

                {aiLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
                    <span className="text-gray-600">AI is analyzing your text...</span>
                  </div>
                )}

                {aiResult && (
                  <Card className="bg-emerald-50 border-emerald-200" data-testid="ai-result">
                    <CardHeader>
                      <CardTitle className="text-lg text-emerald-800">AI Analysis Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-800 whitespace-pre-line">{aiResult}</div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Post Job Tab (Employers only) */}
          {isEmployer && (
            <TabsContent value="post-job" className="space-y-6">
              <Card className="card" data-testid="post-job-form">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Post a New Job</CardTitle>
                  <p className="text-gray-600">Create a new job posting for healthcare professionals</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="job-title">Job Title</Label>
                      <Input
                        id="job-title"
                        value={newJob.title}
                        onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Registered Nurse"
                        data-testid="job-title-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="e.g. General Hospital"
                        data-testid="job-company-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g. New York, NY"
                        data-testid="job-location-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="job-type">Job Type</Label>
                      <Select value={newJob.job_type} onValueChange={(value) => setNewJob(prev => ({ ...prev, job_type: value }))}>
                        <SelectTrigger data-testid="job-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="salary-min">Minimum Salary</Label>
                      <Input
                        id="salary-min"
                        type="number"
                        value={newJob.salary_min}
                        onChange={(e) => setNewJob(prev => ({ ...prev, salary_min: e.target.value }))}
                        placeholder="50000"
                        data-testid="job-salary-min-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="salary-max">Maximum Salary</Label>
                      <Input
                        id="salary-max"
                        type="number"
                        value={newJob.salary_max}
                        onChange={(e) => setNewJob(prev => ({ ...prev, salary_max: e.target.value }))}
                        placeholder="80000"
                        data-testid="job-salary-max-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed job description..."
                      rows={6}
                      data-testid="job-description-input"
                    />
                  </div>

                  <Button onClick={createJob} className="btn-primary" data-testid="submit-job">
                    Post Job
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Applications Tab (Job Seekers only) */}
          {user?.role === 'job_seeker' && (
            <TabsContent value="applications">
              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Your Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No applications yet</p>
                      <Button onClick={() => window.location.href = '/jobs'} className="btn-primary">
                        Browse Jobs
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Applications list would go here */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;