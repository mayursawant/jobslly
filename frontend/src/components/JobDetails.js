import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import LeadCollectionModal from './LeadCollectionModal';
import axios from 'axios';
import { toast } from 'sonner';

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

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  
  // Modal states
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  
  // User profile states
  const [userProfile, setUserProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    fetchJobDetails();
    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      // For non-logged-in users, check localStorage
      checkLocalStorageApplied();
    }
  }, [jobId, isAuthenticated]);

  const checkLocalStorageApplied = () => {
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    console.log('🔍 Checking localStorage for job', jobId);
    console.log('📋 Applied jobs in localStorage:', appliedJobs);
    const isApplied = appliedJobs.includes(jobId);
    console.log('✓ Has applied:', isApplied);
    setHasApplied(isApplied);
  };

  const fetchJobDetails = async () => {
    try {
      // Get token if user is logged in
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API}/jobs/${jobId}`, { headers });
      setJob(response.data);
      
      // Check if user has already applied
      if (token && response.data.has_applied !== undefined) {
        // For logged-in users, use backend response
        setHasApplied(response.data.has_applied);
      } else {
        // For non-logged-in users, always check localStorage
        checkLocalStorageApplied();
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch user profile and calculate completion
   */
  const fetchUserProfile = async () => {
    try {
      // FIX: Use 'token' instead of 'access_token'
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUserProfile(response.data);
      // Always use profile_completion from backend for consistency
      const completion = response.data.profile_completion || 0;
      setProfileCompletion(completion);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Profile might not exist yet, set empty state
      setUserProfile({});
      setProfileCompletion(0);
    }
  };

  // Profile completion is now fetched from backend for consistency
  // The backend calculates based on: name, phone, position, experience, location, specialization

  /**
   * Enhanced apply button click handler
   */
  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // Non-logged-in user flow
      setShowLeadModal(true);
      return;
    }
    
    // Logged-in user flow - check profile completion
    if (profileCompletion === 100) {
      // Profile complete - proceed with application
      handleDirectApply();
    } else {
      // Profile incomplete - show completion prompt
      setShowIncompleteProfileModal(true);
    }
  };

  /**
   * Handles direct application for authenticated users with complete profiles
   */
  const handleDirectApply = async () => {
    // Check if it's an external job
    if (job.external_url) {
      // External job - redirect immediately
      window.open(job.external_url, '_blank');
      return;
    }

    // Internal job - submit application
    setApplying(true);
    try {
      // FIX: Use 'token' instead of 'access_token'
      const token = localStorage.getItem('token');
      await axios.post(`${API}/jobs/${jobId}/apply`, {
        cover_letter: coverLetter
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setHasApplied(true);
      setCoverLetter('');
      setShowSuccessModal(true);
    } catch (error) {
      const message = error.response?.data?.detail || 'Application failed';
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  /**
   * Handle lead collection success for non-logged-in users
   */
  const handleLeadCollectionSuccess = () => {
    console.log('Lead collection success callback triggered');
    console.log('Job external URL:', job?.external_url);
    setShowLeadModal(false);
    setHasApplied(true); // Update state to show "Applied" status
    
    if (job?.external_url) {
      // External job - redirect to external URL
      console.log('Redirecting to external URL:', job.external_url);
      window.open(job.external_url, '_blank');
    } else {
      // Internal job - show login prompt
      console.log('Showing login prompt modal for internal job');
      setShowLoginPromptModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          className="mb-6 flex items-center text-emerald-600 hover:text-emerald-700"
          data-testid="back-to-jobs"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card" data-testid="job-details">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-emerald-100 text-emerald-700">
                    {job.job_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-right">
                    {job.salary_min && (
                      <div className="text-lg font-semibold text-emerald-600">
                        {formatSalary(job.salary_min, job.currency)}
                        {job.salary_max && ` - ${formatSalary(job.salary_max, job.currency)}`}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">per year</div>
                  </div>
                </div>
                
                <CardTitle className="text-3xl text-gray-800 mb-2">{job.title}</CardTitle>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
                    </svg>
                    <span className="font-medium text-emerald-600">{job.company}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{job.location}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Job Description</h3>
                  <div className="prose prose-emerald max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                  </div>
                </div>

                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.benefits && job.benefits.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">Benefits</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      {job.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center">
                          <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Card */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Apply for this Position</CardTitle>
              </CardHeader>
              <CardContent>
                {hasApplied ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-emerald-600 mb-2">Application Submitted!</h3>
                    <p className="text-gray-600 text-sm">We'll notify you when the employer reviews your application.</p>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="text-center py-6">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Interested in this position?</h4>
                      <p className="text-gray-600 text-sm">Let us know you're interested and we'll help you apply!</p>
                    </div>
                    <Button 
                      onClick={handleApplyClick}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                      data-testid="apply-now-button"
                    >
                      🚀 Apply Now
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Quick registration required • Takes less than 2 minutes
                    </p>
                  </div>
                ) : user?.role === 'job_seeker' ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cover-letter" className="text-sm font-medium text-gray-700">
                        Cover Letter (Optional)
                      </Label>
                      <Textarea
                        id="cover-letter"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Tell the employer why you're interested in this position..."
                        className="mt-2 form-textarea"
                        rows={4}
                        data-testid="cover-letter-input"
                      />
                    </div>
                    
                    <Button
                      onClick={handleApplyClick}
                      disabled={applying}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                      data-testid="apply-button"
                    >
                      {applying ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Applying...
                        </div>
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600">This position is for job seekers only.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Info */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Posted</div>
                  <div className="font-medium text-gray-800">
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                {job.expires_at && (
                  <div>
                    <div className="text-sm text-gray-500">Application Deadline</div>
                    <div className="font-medium text-gray-800">
                      {new Date(job.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <div className="text-sm text-gray-500">Job Type</div>
                  <div className="font-medium text-gray-800 capitalize">
                    {job.job_type.replace('_', ' ')}
                  </div>
                </div>
                
                {job.salary_min && (
                  <div>
                    <div className="text-sm text-gray-500">Salary Range</div>
                    <div className="font-medium text-gray-800">
                      {job.currency === 'USD' ? '$' : '₹'}{job.salary_min}
                      {job.salary_max && ` - ${job.currency === 'USD' ? '$' : '₹'}${job.salary_max}`}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share section removed */}
          </div>
        </div>

        {/* Lead Collection Modal */}
        <LeadCollectionModal 
          isOpen={showLeadModal}
          onClose={() => setShowLeadModal(false)}
          jobId={jobId}
          jobTitle={job?.title}
          jobExternalUrl={job?.external_url}
          companyName={job?.company}
          onSuccess={handleLeadCollectionSuccess}
        />

        {/* Application Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6">Your application has been submitted and the employer will review it shortly.</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/dashboard');
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  View Applied Jobs
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Continue Browsing Jobs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Incomplete Profile Modal */}
        {showIncompleteProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Incomplete</h3>
              <p className="text-gray-600 mb-4">
                Your profile is {profileCompletion}% complete. Please complete your profile to apply for this job.
              </p>
              
              <div className="bg-gray-100 rounded-lg p-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Profile Completion</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowIncompleteProfileModal(false);
                    navigate('/dashboard');
                    // Switch to profile tab
                    setTimeout(() => {
                      const profileTab = document.querySelector('[data-testid="tab-profile"]');
                      if (profileTab) profileTab.click();
                    }, 100);
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Complete My Profile
                </button>
                <button
                  onClick={() => setShowIncompleteProfileModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Prompt Modal for Internal Jobs */}
        {showLoginPromptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Account Required</h3>
              <p className="text-gray-600 mb-6">Please log in or create an account to apply for this job.</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;