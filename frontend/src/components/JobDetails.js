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

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  
  // Lead collection modal state
  const [showLeadModal, setShowLeadModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      // Use the tracking endpoint to increment view count
      const response = await axios.get(`${API}/jobs/${jobId}/details`);
      setJob(response.data);
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the apply button click
   * If user is not authenticated, shows lead collection modal
   * If authenticated, proceeds with application
   */
  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // Show lead collection modal for unauthenticated users
      setShowLeadModal(true);
      return;
    }
    
    // For authenticated users, proceed with application
    handleDirectApply();
  };

  /**
   * Handles direct application for authenticated users
   */
  const handleDirectApply = async () => {
    setApplying(true);
    try {
      await axios.post(`${API}/jobs/${jobId}/apply`, {
        cover_letter: coverLetter
      });
      
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setCoverLetter('');
    } catch (error) {
      const message = error.response?.data?.detail || 'Application failed';
      toast.error(message);
    } finally {
      setApplying(false);
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
                        ${job.salary_min.toLocaleString()}
                        {job.salary_max && ` - $${job.salary_max.toLocaleString()}`}
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
                    <p className="text-gray-600 mb-4">Please login to apply for this position</p>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => navigate('/login')} 
                        className="w-full btn-primary"
                        data-testid="login-to-apply"
                      >
                        Login to Apply
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/register')} 
                        className="w-full"
                      >
                        Create Account
                      </Button>
                    </div>
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
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full btn-primary"
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
                      ${job.salary_min.toLocaleString()}
                      {job.salary_max && ` - $${job.salary_max.toLocaleString()}`}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Job */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Share this Job</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1" data-testid="share-linkedin">
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" data-testid="share-twitter">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" data-testid="share-email">
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;