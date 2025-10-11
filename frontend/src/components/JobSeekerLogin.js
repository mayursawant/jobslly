/**
 * JobSeekerLogin Component
 * 
 * Purpose: Dedicated login interface for healthcare professionals seeking jobs
 * Features:
 * - Job seeker-specific branding and messaging
 * - Direct routing to job seeker dashboard after login
 * - Professional healthcare-focused design
 * - Form validation and error handling
 * 
 * Usage: Accessed via /job-seeker-login route
 * Dependencies: AuthContext for authentication, axios for API calls
 */

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const JobSeekerLogin = () => {
  // Component state for form data and UI states
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Authentication context and navigation hook
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  /**
   * Handles form submission for job seeker login
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back! Ready to find your dream job?');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles input field changes
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Light Futuristic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <Card className="glass-strong shadow-2xl border-blue-200/50 relative overflow-hidden" data-testid="job-seeker-login-form">
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <CardHeader className="text-center pb-6">
            {/* Professional icon for healthcare workers */}
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl text-white">👩‍⚕️</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Healthcare Professional Login
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Access your career dashboard and find your next opportunity
            </p>
            <div className="mt-3">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                🎯 For Job Seekers
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50" data-testid="login-error">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Professional Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  placeholder="doctor@hospital.com"
                  data-testid="email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  placeholder="Enter your password"
                  data-testid="password-input"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Logging In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Access My Dashboard
                  </div>
                )}
              </Button>
            </form>

            {/* Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                New to healthcare careers?{' '}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors underline"
                  data-testid="register-link"
                >
                  Create your profile →
                </Link>
              </p>
            </div>

            {/* Alternative Login Options */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Looking to hire?{' '}
                <Link 
                  to="/employer-login" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  data-testid="employer-login-link"
                >
                  Employer Login
                </Link>
              </p>
            </div>

            {/* Demo credentials for testing */}
            {/* <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-2 flex items-center">
                <span className="mr-2">🔑</span>
                Demo Account:
              </p>
              <div className="text-xs text-blue-600 space-y-1 font-mono">
                <p><strong>Email:</strong> test@nurse.com</p>
                <p><strong>Password:</strong> password123</p>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobSeekerLogin;