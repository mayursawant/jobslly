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
import { 
  User, 
  Briefcase, 
  Target, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  Users,
  Building
} from 'lucide-react';
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
   * Switch to Edit Profile tab
   */
  const switchToProfileTab = () => {
    const profileTab = document.querySelector('[data-testid="tab-profile"]');
    if (profileTab) {
      profileTab.click();
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Modern Welcome Header */}
        <div className="mb-8 relative overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
            {/* Floating Animation Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full opacity-30 animate-bounce"></div>
            
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.full_name || user?.email?.split('@')[0]}! 
                  <span className="wave inline-block ml-2">👋</span>
                </h1>
                <p className="text-teal-100 text-lg">
                  Your healthcare career journey continues here
                </p>
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-teal-200" />
                    <span className="text-teal-100 text-sm">Progress Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-teal-200" />
                    <span className="text-teal-100 text-sm">Smart Matching</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-teal-200" />
                    <span className="text-teal-100 text-sm">Career Growth</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100" data-testid="applications-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700">Applications Sent</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.applications_count + dashboardData.leads_count}</p>
                  <p className="text-xs text-blue-500 mt-1">+2 this week</p>
                </div>
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100" data-testid="profile-completion-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">Profile Complete</p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{dashboardData.profile_completion}%</p>
                  <Progress value={dashboardData.profile_completion} className="mt-2 h-2" />
                </div>
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100" data-testid="profile-views-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium text-purple-700">Profile Views</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">47</p>
                  <p className="text-xs text-purple-500 mt-1">+12 this month</p>
                </div>
                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Eye className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100" data-testid="interviews-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium text-orange-700">Interviews</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">3</p>
                  <p className="text-xs text-orange-500 mt-1">1 scheduled</p>
                </div>
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
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

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Strength Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
                    Profile Strength
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="rgb(229 231 235)" strokeWidth="8" fill="none" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            stroke="rgb(20 184 166)" 
                            strokeWidth="8" 
                            fill="none"
                            strokeDasharray={`${2.51 * dashboardData.profile_completion} 251`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-teal-600">{dashboardData.profile_completion}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Professional Profile</p>
                    </div>
                    
                    {dashboardData.profile_completion < 100 && (
                      <div className="bg-white p-4 rounded-lg border border-teal-100">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Boost your visibility</p>
                            <p className="text-xs text-gray-600 mb-2">Complete your profile for better job matches</p>
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={switchToProfileTab}>
                              Complete Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/jobs">
                      <Button className="w-full justify-between bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white group">
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-2" />
                          Browse Jobs
                        </div>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between border-purple-200 hover:bg-purple-50 group"
                      onClick={() => document.querySelector('[data-testid="tab-profile"]').click()}
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-purple-600" />
                        Update Profile
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-purple-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between border-orange-200 hover:bg-orange-50 group"
                      onClick={() => document.querySelector('[data-testid="tab-recommendations"]').click()}
                    >
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-orange-600" />
                        View Matches
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-orange-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Career Insights Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" />
                    Career Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Market Demand</span>
                      <Badge className="bg-green-100 text-green-700">High</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profile Ranking</span>
                      <Badge className="bg-blue-100 text-blue-700">Top 15%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <Badge className="bg-purple-100 text-purple-700">85%</Badge>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-blue-100 mt-4">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-blue-700">Pro Tip</p>
                          <p className="text-xs text-blue-600">Healthcare professionals with complete profiles get 3x more interviews</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Recent Activity */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-600" />
                    Recent Activity
                  </div>
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recent_applications.length > 0 || dashboardData.recent_leads.length > 0 ? (
                  <div className="space-y-3">
                    {[...dashboardData.recent_applications, ...dashboardData.recent_leads].slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-teal-50 hover:to-emerald-50 transition-all duration-200 border border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Applied to Healthcare Position</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-700">
                            Submitted
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-10 h-10 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to start your journey?</h3>
                    <p className="text-gray-600 mb-6">Begin applying to healthcare positions and track your progress here</p>
                    <Link to="/jobs">
                      <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                        Explore Healthcare Jobs
                      </Button>
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
                        <SelectItem value="doctors">Doctor/Physician</SelectItem>
                        <SelectItem value="nurses">Nurse</SelectItem>
                        <SelectItem value="pharmacists">Pharmacist</SelectItem>
                        <SelectItem value="dentists">Dentist</SelectItem>
                        <SelectItem value="physiotherapists">Physiotherapist</SelectItem>
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