import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import JobListing from './components/JobListing';
import JobDetails from './components/JobDetails';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import CMSLogin from './components/CMSLogin';
import JobSeekerLogin from './components/JobSeekerLogin';
import EmployerLogin from './components/EmployerLogin';
import JobSeekerDashboard from './components/JobSeekerDashboard';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import ChatBot from './components/ChatBot';
import { Toaster } from './components/ui/sonner';
import { Helmet } from 'react-helmet';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await fetchUser();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await fetchUser();
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const authValue = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isEmployer: user?.role === 'employer',
    isAdmin: user?.role === 'admin'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Helmet>
            <title>Jobslly - Future of Healthcare Careers</title>
            <meta name="description" content="Discover healthcare opportunities for Doctors, Pharmacists, Dentists, Physiotherapists, and Nurses with AI-powered matching and career advancement tools." />
            <meta name="keywords" content="healthcare jobs, medical careers, doctor jobs, nurse jobs, pharmacy careers, dentist jobs, physiotherapy jobs, AI job matching" />
            <meta property="og:title" content="Jobslly - Future of Healthcare Careers" />
            <meta property="og:description" content="Next-generation healthcare job platform with AI-powered career matching" />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <link rel="canonical" href="https://careerheal.preview.emergentagent.com/" />
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Jobslly",
                "description": "Future of Healthcare Careers",
                "url": "https://careerheal.preview.emergentagent.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://careerheal.preview.emergentagent.com/jobs?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              })}
            </script>
          </Helmet>
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<JobListing />} />
              <Route path="/jobs/:jobId" element={<JobDetails />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/job-seeker-login" element={!user ? <JobSeekerLogin /> : <Navigate to="/dashboard" />} />
              <Route path="/employer-login" element={!user ? <EmployerLogin /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
              <Route path="/cms-login" element={!user ? <CMSLogin /> : <Navigate to="/admin" />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={user ? (
                user.role === 'job_seeker' ? <JobSeekerDashboard /> : <Dashboard />
              ) : <Navigate to="/job-seeker-login" />} />
              <Route path="/admin" element={
                user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/cms-login" />
              } />
            </Routes>
          </main>
          <ChatBot />
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;