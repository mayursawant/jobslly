import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import JobListing from './components/JobListing';
import JobDetails from './components/JobDetails';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
// Removed: CMSLogin and JobSeekerLogin - consolidated to single Login
// import CMSLogin from './components/CMSLogin';
// import JobSeekerLogin from './components/JobSeekerLogin';
// import EmployerLogin from './components/EmployerLogin'; // Removed
import JobSeekerDashboard from './components/JobSeekerDashboard';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import ContactUs from './components/ContactUs';
import NotFound from './components/NotFound';
{/* ChatBot component removed as per user request */}
{/* LeadChatbot removed as per user request */}
import ScrollToTop from './components/ScrollToTop';
import TrailingSlashRedirect from './components/TrailingSlashRedirect';
import Sitemap from './components/Sitemap';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import CookiePolicy from './components/CookiePolicy';
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
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any other app-specific data if needed
    // localStorage.clear(); // Use this if you want to clear ALL localStorage
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    // Clear any session storage
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.href = '/login';
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
            <title>Jobslly - Future of Healthcare Careers | AI-Powered Medical Job Platform</title>
            <meta name="description" content="Find your dream healthcare career at Jobslly. Connect doctors, nurses, pharmacists, dentists, and physiotherapists with top medical institutions. AI-powered job matching, resume optimization, and career advancement tools." />
            <meta name="keywords" content="healthcare jobs, medical careers, doctor jobs, nurse jobs, pharmacy careers, dentist jobs, physiotherapy jobs, AI job matching, healthcare recruitment, medical employment, hospital jobs, clinic jobs" />
            
            {/* Open Graph / Facebook */}
            <meta property="og:title" content="Jobslly - Future of Healthcare Careers" />
            <meta property="og:description" content="AI-powered healthcare job platform connecting medical professionals with leading institutions. Find your next career opportunity today." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://jobslly.com/" />
            <meta property="og:image" content="https://jobslly.com/og-image.jpg" />
            <meta property="og:site_name" content="Jobslly" />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Jobslly - Future of Healthcare Careers" />
            <meta name="twitter:description" content="AI-powered healthcare job platform for medical professionals" />
            <meta name="twitter:image" content="https://jobslly.com/og-image.jpg" />
            
            {/* Additional SEO Meta Tags */}
            <meta name="author" content="Jobslly" />
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow" />
            <link rel="canonical" href="https://jobslly.com/" />
            
            {/* Favicon and App Icons */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            
            {/* Structured Data - Organization */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Jobslly",
                "description": "AI-powered healthcare career platform",
                "url": "https://jobslly.com",
                "logo": "https://jobslly.com/logo.png",
                "sameAs": [
                  "https://linkedin.com/company/jobslly",
                  "https://twitter.com/jobslly"
                ]
              })}
            </script>
            
            {/* Structured Data - WebSite */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Jobslly",
                "description": "Future of Healthcare Careers - AI-Powered Job Platform",
                "url": "https://seo-upload-fixes.preview.emergentagent.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://jobslly.com/jobs?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Jobslly"
                }
              })}
            </script>
            
            {/* Structured Data - LocalBusiness */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "@id": "https://seo-upload-fixes.preview.emergentagent.com",
                "name": "Jobslly",
                "description": "Healthcare job platform connecting medical professionals with opportunities",
                "url": "https://seo-upload-fixes.preview.emergentagent.com",
                "telephone": "+1-800-JOBSLLY",
                "priceRange": "Free",
                "openingHours": "Mo-Su 00:00-24:00",
                "serviceArea": {
                  "@type": "Country",
                  "name": "United States"
                },
                "areaServed": "Worldwide",
                "knowsAbout": [
                  "Healthcare Jobs",
                  "Medical Careers", 
                  "Nursing Jobs",
                  "Doctor Jobs",
                  "Pharmacy Careers",
                  "Dental Jobs",
                  "Physiotherapy Jobs"
                ]
              })}
            </script>
          </Helmet>
          <ScrollToTop />
          <TrailingSlashRedirect />
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Jobs - Support both with and without trailing slash */}
              <Route path="/jobs" element={<JobListing />} />
              <Route path="/jobs/" element={<JobListing />} />
              <Route path="/jobs/:jobId" element={<JobDetails />} />
              <Route path="/jobs/:jobId/" element={<JobDetails />} />
              
              {/* Blogs - Support both with and without trailing slash */}
              <Route path="/blogs" element={<Blog />} />
              <Route path="/blogs/" element={<Blog />} />
              <Route path="/blogs/:slug" element={<BlogPost />} />
              <Route path="/blogs/:slug/" element={<BlogPost />} />
              
              {/* Other pages - Support both with and without trailing slash */}
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/contact-us/" element={<ContactUs />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/sitemap/" element={<Sitemap />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/privacy-policy/" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/terms-of-service/" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/cookies/" element={<CookiePolicy />} />
              
              {/* Auth routes - Support both with and without trailing slash */}
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard/" />} />
              <Route path="/login/" element={!user ? <Login /> : <Navigate to="/dashboard/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard/" />} />
              <Route path="/register/" element={!user ? <Register /> : <Navigate to="/dashboard/" />} />
              
              {/* Redirect old routes to new unified login */}
              <Route path="/job-seeker-login" element={<Navigate to="/login/" replace />} />
              <Route path="/cms-login" element={<Navigate to="/login/" replace />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={user ? (
                user.role === 'job_seeker' ? <JobSeekerDashboard /> : <Dashboard />
              ) : <Navigate to="/login/" />} />
              <Route path="/dashboard/" element={user ? (
                user.role === 'job_seeker' ? <JobSeekerDashboard /> : <Dashboard />
              ) : <Navigate to="/login/" />} />
              <Route path="/admin" element={
                user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/login/" />
              } />
              <Route path="/admin/" element={
                user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/login/" />
              } />
              
              {/* 404 Catch-all Route - Must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          {/* All chatbot components removed as per user request */}
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;