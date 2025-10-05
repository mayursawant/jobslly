import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fillDemoCredentials = (email, password) => {
    setFormData({
      email: email,
      password: password
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-lg border border-gray-200" data-testid="login-form">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600">
              Sign in to your healthcare career portal
            </p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50" data-testid="login-error">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-teal-500 h-12 rounded-lg"
                  placeholder="Enter your email"
                  data-testid="email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-teal-500 h-12 rounded-lg"
                  placeholder="Enter your password"
                  data-testid="password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-lg py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  data-testid="register-link"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
              <p className="text-sm text-teal-700 font-semibold mb-3 flex items-center">
                <span className="mr-2">🎮</span>
                Demo Accounts for Testing:
              </p>
              <div className="text-sm text-gray-700 space-y-2">
                <div 
                  className="flex justify-between items-center bg-white p-2 rounded border cursor-pointer hover:bg-teal-50 hover:border-teal-300 transition-colors duration-200"
                  onClick={() => fillDemoCredentials('doctor@gmail.com', 'password')}
                >
                  <span>🩺 <strong>Doctor:</strong> doctor@gmail.com</span>
                  <span className="text-teal-600 font-mono">password</span>
                </div>
                <div 
                  className="flex justify-between items-center bg-white p-2 rounded border cursor-pointer hover:bg-teal-50 hover:border-teal-300 transition-colors duration-200"
                  onClick={() => fillDemoCredentials('hr@gmail.com', 'password')}
                >
                  <span>🏥 <strong>Employer:</strong> hr@gmail.com</span>
                  <span className="text-teal-600 font-mono">password</span>
                </div>
                <div 
                  className="flex justify-between items-center bg-white p-2 rounded border cursor-pointer hover:bg-teal-50 hover:border-teal-300 transition-colors duration-200"
                  onClick={() => fillDemoCredentials('admin@gmail.com', 'password')}
                >
                  <span>⚡ <strong>Admin:</strong> admin@gmail.com</span>
                  <span className="text-teal-600 font-mono">password</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Click any credential to auto-fill the form
              </p>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Need CMS access?{' '}
                <Link 
                  to="/cms-login" 
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors underline"
                  data-testid="cms-login-link"
                >
                  CMS Portal →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;