import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const CMSLogin = () => {
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
      toast.success('CMS Access Granted!');
      navigate('/admin');
    } catch (error) {
      const message = error.response?.data?.detail || 'Access denied. Invalid CMS credentials.';
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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <Card className="glass-strong shadow-2xl border-red-500/30 relative overflow-hidden" data-testid="cms-login-form">
          {/* Neon accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-gradient"></div>
          
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              CMS Access Portal
            </CardTitle>
            <p className="text-gray-300 mt-2 flex items-center justify-center">
              <Badge className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border-red-500/30">
                🔒 Administrative Access
              </Badge>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Demo: admin@gmail.com / password
            </p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-500/50 bg-red-500/10 backdrop-blur-sm" data-testid="cms-login-error">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="cms-login-form">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Administrator Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-red-500/50 focus:ring-red-500/20 h-12"
                  placeholder="admin@jobslly.com"
                  data-testid="cms-email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Access Key
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-red-500/50 focus:ring-red-500/20 h-12"
                  placeholder="Enter your access key"
                  data-testid="cms-password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                data-testid="cms-login-submit-btn"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Access CMS Dashboard
                  </div>
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20 backdrop-blur-sm">
              <p className="text-sm text-red-400 font-medium mb-2 flex items-center">
                <span className="mr-2">🔑</span>
                Demo CMS Access:
              </p>
              <div className="text-xs text-red-300 space-y-1 font-mono">
                <p><strong>Email:</strong> admin@gmail.com</p>
                <p><strong>Password:</strong> password</p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center">
                <span className="mr-1">🛡️</span>
                Secured by Jobslly Security Protocol
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-full opacity-60 animate-float"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full opacity-60 animate-float" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  );
};

export default CMSLogin;