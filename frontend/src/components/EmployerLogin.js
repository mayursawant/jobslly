/**
 * EmployerLogin Component
 * 
 * Purpose: Dedicated login interface for healthcare employers and HR managers
 * Features:
 * - Employer-specific branding and messaging
 * - Direct routing to employer dashboard after login
 * - Professional hiring-focused design
 * - Form validation and error handling
 * 
 * Usage: Accessed via /employer-login route
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

const EmployerLogin = () => {
  // Component state management
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Context and navigation hooks
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  /**
   * Handles employer login form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back! Ready to find great talent?');
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
   * Handles form input changes
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Employer-themed background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <Card className="glass-strong shadow-2xl border-emerald-200/50 relative overflow-hidden" data-testid="employer-login-form">
          {/* Emerald gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          
          <CardHeader className="text-center pb-6">
            {/* Business/Hiring icon */}
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl text-white">🏥</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Healthcare Employer Login
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Access your hiring dashboard and find exceptional talent
            </p>
            <div className="mt-3">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                🏢 For Employers
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Error display */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50" data-testid="employer-login-error">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Corporate Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-200"
                  placeholder="hr@hospital.com"
                  data-testid="employer-email-input"
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
                  className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-200"
                  placeholder="Enter your password"
                  data-testid="employer-password-input"
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="employer-login-submit-btn"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Logging In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🎯</span>
                    Access Hiring Dashboard
                  </div>
                )}
              </Button>
            </form>

            {/* Registration and alternative options */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                New employer partner?{' '}
                <Link 
                  to="/register" 
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors underline"
                  data-testid="employer-register-link"
                >
                  Register your organization →
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                Looking for a job?{' '}
                <Link 
                  to="/job-seeker-login" 
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  data-testid="job-seeker-login-link"
                >
                  Job Seeker Login
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            {/* <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium mb-2 flex items-center">
                <span className="mr-2">🔑</span>
                Demo Account:
              </p>
              <div className="text-xs text-emerald-600 space-y-1 font-mono">
                <p><strong>Email:</strong> hr@hospital.com</p>
                <p><strong>Password:</strong> password123</p>
              </div>
            </div> */}

            {/* Premium features callout */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">🌟 Employer Benefits</h4>
              <ul className="text-xs text-emerald-600 space-y-1">
                <li>• AI-powered candidate matching</li>
                <li>• Advanced analytics dashboard</li>
                <li>• Resume database access</li>
                <li>• Priority job posting</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerLogin;