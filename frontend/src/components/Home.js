import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Users, TrendingUp, Globe, ArrowRight, Star, CheckCircle, Heart, Stethoscope, UserPlus, Building2 } from 'lucide-react';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({ jobs: 0, companies: 0, applications: 0, professionals: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs?limit=6`);
      setFeaturedJobs(response.data);
      
      // Enhanced stats for healthcare professionals
      setStats({
        jobs: response.data.length * 25,
        companies: Math.floor(response.data.length * 8.5),
        applications: response.data.length * 150,
        professionals: response.data.length * 75
      });
    } catch (error) {
      console.error('Failed to fetch featured jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(searchLocation)}`);
  };

  const specializations = [
    { icon: '🩺', name: 'Doctors', count: '2,340+', color: 'from-red-500 to-pink-600' },
    { icon: '💊', name: 'Pharmacy', count: '1,890+', color: 'from-green-500 to-emerald-600' },
    { icon: '🦷', name: 'Dentist', count: '1,245+', color: 'from-blue-500 to-cyan-600' },
    { icon: '🏃‍♂️', name: 'Physiotherapy', count: '967+', color: 'from-purple-500 to-indigo-600' },
    { icon: '👩‍⚕️', name: 'Nurses', count: '3,456+', color: 'from-teal-500 to-cyan-600' },
    { icon: '🧠', name: 'Mental Health', count: '789+', color: 'from-amber-500 to-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-teal-50 via-white to-emerald-50 overflow-hidden">
        {/* Floating Animation Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-teal-200 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-32 left-20 w-12 h-12 bg-cyan-200 rounded-full opacity-25 animate-ping"></div>
          <div className="absolute bottom-20 right-40 w-14 h-14 bg-green-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Trust Badge with Animation */}
              <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full border border-teal-200 shadow-sm animate-fade-in-up">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-teal-700 font-semibold text-sm">🏥 Trusted by 75,000+ Healthcare Professionals</span>
              </div>

              {/* Main Headline with Staggered Animation */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight animate-slide-up">
                  Explore The Best
                </h1>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Healthcare Jobs
                  </span>
                </h1>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight animate-slide-up" style={{animationDelay: '0.4s'}}>
                  In Your Dream Country
                </h1>
              </div>
              
              <p className="text-xl text-gray-600 max-w-2xl animate-slide-up" style={{animationDelay: '0.6s'}}>
                AI-Powered Job Recommendations • Customised Search Filters • Dedicated Portal for Healthcare Professionals
              </p>

            {/* Clean Search Bar */}
            <div className="max-w-2xl mx-auto mb-8" data-testid="hero-search-section">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex flex-col md:flex-row gap-2 p-2 bg-white rounded-lg border border-gray-200 shadow-lg">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search job title or location"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-0 h-12 text-base focus:ring-0 focus:outline-none"
                      data-testid="hero-search-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 px-8 rounded-md"
                    data-testid="hero-search-button"
                  >
                    Find Jobs
                  </Button>
                </div>
              </form>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {!isAuthenticated ? (
                  <>
                    <Link to="/register">
                      <Button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-md" data-testid="hero-get-started">
                        Get Started Free
                      </Button>
                    </Link>
                    <Link to="/jobs">
                      <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-md" data-testid="hero-browse-jobs">
                        Browse Jobs
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/jobs">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md" data-testid="hero-find-jobs">
                        Find Jobs
                      </Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-3 rounded-md" data-testid="hero-dashboard">
                        Dashboard
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Trust Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-8 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1" data-testid="stats-jobs">
                  {stats.jobs}+
                </div>
                <div className="text-sm text-gray-600">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1" data-testid="stats-companies">
                  {stats.companies}+
                </div>
                <div className="text-sm text-gray-600">Healthcare Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1" data-testid="stats-professionals">
                  {stats.professionals}k+
                </div>
                <div className="text-sm text-gray-600">Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1" data-testid="stats-applications">
                  {stats.applications}+
                </div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Job Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your perfect healthcare role across all specializations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specializations.map((spec, index) => (
              <Link 
                key={spec.name} 
                to={`/jobs?category=${spec.name.toLowerCase()}`}
                className="group block"
                data-testid={`specialization-${spec.name.toLowerCase()}`}
              >
                <Card className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                      {spec.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{spec.name}</h3>
                    <div className="text-xs text-blue-600 font-medium">
                      {spec.count} Jobs
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Jobslly?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced technology and personalized support for your healthcare career growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-testid="feature-matching">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Smart Matching</h3>
              <p className="text-gray-600 text-sm">AI-powered job matching based on your skills and preferences</p>
            </div>

            <div className="text-center" data-testid="feature-resume">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Resume Builder</h3>
              <p className="text-gray-600 text-sm">Professional resume templates designed for healthcare professionals</p>
            </div>

            <div className="text-center" data-testid="feature-interview">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Interview Prep</h3>
              <p className="text-gray-600 text-sm">Practice with healthcare-specific interview questions and tips</p>
            </div>

            <div className="text-center" data-testid="feature-assistant">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Career Guidance</h3>
              <p className="text-gray-600 text-sm">24/7 AI assistant to help guide your healthcare career path</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <section className="py-16 px-4 bg-gray-50" data-testid="featured-jobs-section">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest Jobs</h2>
              <p className="text-lg text-gray-600">Explore the newest opportunities in healthcare</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredJobs.slice(0, 6).map((job) => (
                <Card key={job.id} className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer" data-testid={`featured-job-${job.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {job.job_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {job.salary_min && (
                        <span className="text-sm font-semibold text-green-600">
                          ${job.salary_min.toLocaleString()}+
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1 text-gray-900 hover:text-blue-600 transition-colors">{job.title}</h3>
                    <p className="text-blue-600 font-medium mb-1 text-sm">{job.company}</p>
                    <p className="text-gray-500 mb-3 flex items-center text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {job.location}
                    </p>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                      {job.description.substring(0, 100)}...
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.requirements.slice(0, 2).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-200 text-gray-600">
                          {req}
                        </Badge>
                      ))}
                    </div>

                    <Link to={`/jobs/${job.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md" data-testid={`apply-job-${job.id}`}>
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/jobs">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-md" data-testid="view-all-jobs">
                  View All Jobs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Health Hub Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Health Hub</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest healthcare insights, career tips, and industry trends
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardContent className="p-6">
                <Badge className="bg-green-100 text-green-800 text-xs mb-3">
                  Healthcare Trends
                </Badge>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  AI Revolution in Healthcare: What It Means for Your Career
                </h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                  Discover how artificial intelligence is transforming healthcare delivery and creating new career opportunities...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">5 min read</span>
                  <Link to="/blog">
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardContent className="p-6">
                <Badge className="bg-blue-100 text-blue-800 text-xs mb-3">
                  Career Development
                </Badge>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  Telehealth Opportunities: The Future of Remote Healthcare
                </h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                  Explore the growing field of telehealth and how healthcare professionals can transition to remote work...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">7 min read</span>
                  <Link to="/blog">
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardContent className="p-6">
                <Badge className="bg-purple-100 text-purple-800 text-xs mb-3">
                  Industry News
                </Badge>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  Mental Health Careers: Meeting Growing Demand
                </h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                  Understanding the surge in mental health awareness and the career opportunities it creates...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">6 min read</span>
                  <Link to="/blog">
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/blog">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-md">
                Explore Health Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Advance Your Healthcare Career?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who found their dream jobs through our platform
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-md" data-testid="cta-join-now">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 rounded-md" data-testid="cta-browse-jobs">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-md" data-testid="cta-explore-opportunities">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;