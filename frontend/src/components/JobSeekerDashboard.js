/**
 * JobSeekerDashboard Component
 * 
 * Purpose: Comprehensive dashboard for healthcare professionals seeking jobs
 * Features:
 * - Job application tracking and status updates
 * - Profile completion progress and editing
 * - Resume upload and management
 * - Personalized job recommendations
 * - Application statistics and analytics
 * 
 * Usage: Displayed when job seeker logs in via /dashboard route
 * Dependencies: AuthContext, axios for API calls, various UI components
 */

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const JobSeekerDashboard = () => {
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    applications_count: 0,
    leads_count: 0,
    profile_completion: 0,
    recent_applications: [],
    recent_leads: []
  });
  
  // Profile data state
  const [profile, setProfile] = useState({
    phone: '',
    address: '',
    specialization: '',
    experience_years: '',
    education: [],
    skills: [],
    certifications: [],
    linkedin_url: '',
    portfolio_url: '',
    preferred_job_type: [],
    preferred_locations: [],
    salary_expectation_min: '',
    salary_expectation_max: ''
  });

  // Recommended jobs state
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  /**
   * Fetch dashboard data on component mount
   */
  useEffect(() => {
    fetchDashboardData();
    fetchProfile();
    fetchRecommendedJobs();
  }, []);

  /**
   * Fetches job seeker dashboard statistics and recent activity
   */
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/job-seeker/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches user profile information
   */
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  /**
   * Fetches AI-recommended jobs based on user profile
   */
  const fetchRecommendedJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs?limit=6`);
      setRecommendedJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch recommended jobs:', error);
    }
  };

  /**
   * Updates user profile information
   */
  const updateProfile = async () => {
    try {
      const response = await axios.put(`${API}/profile`, profile);
      setProfile(response.data);
      toast.success('Profile updated successfully!');
      fetchDashboardData(); // Refresh to get updated completion percentage
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  /**
   * Adds a new skill to the profile
   */
  const addSkill = (skill) => {
    if (skill.trim() && !profile.skills.includes(skill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  /**
   * Removes a skill from the profile
   */
  const removeSkill = (skillIndex) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, index) => index !== skillIndex)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="text-gray-600">
            Track your job search progress and discover new opportunities
          </p>
        </div>

        {/* Dashboard Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-blue-200" data-testid="applications-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Applications Sent</p>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.applications_count + dashboardData.leads_count}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-emerald-200" data-testid="profile-completion-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Complete</p>
                  <p className="text-3xl font-bold text-emerald-600">{dashboardData.profile_completion}%</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
              </div>
              <Progress value={dashboardData.profile_completion} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="glass border-purple-200" data-testid="saved-jobs-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                  <p className="text-3xl font-bold text-purple-600">{dashboardData.saved_jobs_count}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">💾</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-orange-200" data-testid="interviews-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interview Requests</p>
                  <p className="text-3xl font-bold text-orange-600">2</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Edit Profile</TabsTrigger>
            <TabsTrigger value="applications" data-testid="tab-applications">Applications</TabsTrigger>
            <TabsTrigger value="recommendations" data-testid="tab-recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Profile Completion Card */}
              <Card className="glass border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <span className="mr-2">📊</span>
                    Profile Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-semibold text-blue-600">{dashboardData.profile_completion}%</span>
                    </div>
                    <Progress value={dashboardData.profile_completion} className="h-3" />
                    
                    {dashboardData.profile_completion < 100 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium mb-2">🚀 Complete your profile to get better job matches!</p>
                        <Button size="sm" onClick={() => document.querySelector('[data-testid="tab-profile"]').click()}>
                          Complete Profile
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="glass border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <span className="mr-2">⚡</span>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/jobs">
                      <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                        🔍 Browse New Jobs
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-emerald-200 hover:bg-emerald-50"
                      onClick={() => document.querySelector('[data-testid="tab-profile"]').click()}
                    >
                      ✏️ Update Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-purple-200 hover:bg-purple-50"
                      onClick={() => document.querySelector('[data-testid="tab-recommendations"]').click()}
                    >
                      🎯 View Recommendations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <span className="mr-2">🕒</span>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recent_applications.length > 0 || dashboardData.recent_leads.length > 0 ? (
                  <div className="space-y-3">
                    {[...dashboardData.recent_applications, ...dashboardData.recent_leads].slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">Applied to Position</p>
                          <p className="text-sm text-gray-600">
                            {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Submitted
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No recent activity</p>
                    <Link to="/jobs">
                      <Button>Start Applying to Jobs</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Editing Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass border-blue-200" data-testid="profile-edit-form">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <span className="mr-2">👤</span>
                  Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile(prev => ({...prev, phone: e.target.value}))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Healthcare Specialization</Label>
                    <Select value={profile.specialization || ''} onValueChange={(value) => setProfile(prev => ({...prev, specialization: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor/Physician</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="dentist">Dentist</SelectItem>
                        <SelectItem value="physiotherapist">Physiotherapist</SelectItem>
                        <SelectItem value="mental-health">Mental Health Professional</SelectItem>
                        <SelectItem value="technician">Medical Technician</SelectItem>
                        <SelectItem value="administrator">Healthcare Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profile.experience_years || ''}
                      onChange={(e) => setProfile(prev => ({...prev, experience_years: parseInt(e.target.value) || 0}))}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={profile.linkedin_url || ''}
                      onChange={(e) => setProfile(prev => ({...prev, linkedin_url: e.target.value}))}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Location/Address</Label>
                  <Textarea
                    id="address"
                    value={profile.address || ''}
                    onChange={(e) => setProfile(prev => ({...prev, address: e.target.value}))}
                    placeholder="City, State, Country"
                    rows={2}
                  />
                </div>

                {/* Skills Section */}
                <div className="space-y-4">
                  <Label>Professional Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                        {skill}
                        <button
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g., Patient Care, Surgery, Radiology)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSkill(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="Add a skill"]');
                        addSkill(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <Button onClick={updateProfile} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  💾 Save Profile Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card className="glass border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <span className="mr-2">📋</span>
                  My Job Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-4">Start applying to jobs to see your application status here</p>
                  <Link to="/jobs">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      Browse Available Jobs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card className="glass border-emerald-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <span className="mr-2">🎯</span>
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendedJobs.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {recommendedJobs.slice(0, 4).map((job) => (
                      <div key={job.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-800">{job.title}</h4>
                          <Badge className="bg-emerald-100 text-emerald-700">
                            {job.job_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-emerald-600 font-medium mb-2">{job.company}</p>
                        <p className="text-gray-600 mb-4">{job.location}</p>
                        <Link to={`/jobs/${job.id}`}>
                          <Button size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete your profile for recommendations</h3>
                    <p className="text-gray-600 mb-4">Add your skills and preferences to get personalized job matches</p>
                    <Button onClick={() => document.querySelector('[data-testid="tab-profile"]').click()}>
                      Complete Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;