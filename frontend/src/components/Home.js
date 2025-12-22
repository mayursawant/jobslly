import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Users, TrendingUp, Globe, ArrowRight, Star, CheckCircle, Heart, Stethoscope, UserPlus, Building2 } from 'lucide-react';
import { MdWork, MdBusiness, MdPeople, MdStar } from 'react-icons/md';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to strip HTML tags from text
const stripHtml = (html) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

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

// Interactive Course Section Component
const InteractiveCourseSection = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const hoverTimeoutRef = React.useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (key) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(key);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Add 250ms delay before hiding
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 250);
  };

  const categories = {
    licensing: {
      title: 'Foreign Licensing Exams',
      icon: '🎓',
      color: 'from-blue-600 to-cyan-600',
      courses: [
        { name: 'AMC Exam Prep for Doctors', emoji: '🩺', url: 'https://academically.com/all-courses/' },
        { name: 'OPRA Exam Prep for Pharmacists', emoji: '💊', url: 'https://academically.com/all-courses/' },
        { name: 'APC Exam Prep for Physio', emoji: '🏃‍♂️', url: 'https://academically.com/all-courses/' },
        { name: 'ADC Exam Prep for Dental', emoji: '🦷', url: 'https://academically.com/all-courses/' }
      ]
    },
    assistance: {
      title: 'Job Assistance Program',
      icon: '💼',
      color: 'from-teal-600 to-emerald-600',
      courses: [
        { name: 'MSL Certification Course', emoji: '🔬', url: 'https://academically.com/job-assistance-course/' },
        { name: 'HEOR Certification Course', emoji: '📊', url: 'https://academically.com/job-assistance-course/' },
        { name: 'Pharmacovigilance Certification Course', emoji: '💉', url: 'https://academically.com/job-assistance-course/' },
        { name: 'Clinical Data Management Certification Course', emoji: '📋', url: 'https://academically.com/job-assistance-course/' }
      ]
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 overflow-hidden">
      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .breathing {
          animation: breathing 3s ease-in-out infinite;
        }
        .course-tile {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .course-tile:nth-child(1) { animation-delay: 0.05s; }
        .course-tile:nth-child(2) { animation-delay: 0.1s; }
        .course-tile:nth-child(3) { animation-delay: 0.15s; }
        .course-tile:nth-child(4) { animation-delay: 0.2s; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ready to Advance Your Healthcare Career?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our wide ranges of courses for your healthcare career growth
          </p>
        </div>

        {/* Interactive Category Blocks - Each with its own hover container */}
        <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
          {Object.entries(categories).map(([key, category]) => {
            const isHovered = hoveredCategory === key;
            const isOtherHovered = hoveredCategory && hoveredCategory !== key;

            return (
              <div
                key={key}
                className="flex-1"
              >
                {/* Parent container that maintains hover for both block and tiles */}
                <div
                  onMouseEnter={() => handleMouseEnter(key)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => isMobile && setHoveredCategory(isHovered ? null : key)}
                  className="relative"
                >
                  {/* Category Block */}
                  <div
                    className={`
                      relative cursor-pointer transition-all ease-out
                      ${!hoveredCategory ? 'breathing' : ''}
                      ${isHovered ? 'md:scale-110 z-10' : ''}
                      ${isOtherHovered ? 'md:scale-90 blur-sm opacity-60' : ''}
                    `}
                    style={{
                      transformOrigin: 'center',
                      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease, filter 0.5s ease'
                    }}
                  >
                    <div className={`
                      relative p-8 rounded-2xl bg-gradient-to-br ${category.color} 
                      text-white shadow-xl hover:shadow-2xl transition-all duration-500
                      ${isHovered ? 'ring-4 ring-white ring-opacity-50' : ''}
                    `}>
                      {/* Animated Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10">
                        <div className="text-6xl mb-4 transform transition-transform duration-300">
                          {category.icon}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">
                          {category.title}
                        </h3>
                        <p className="text-white/80 text-sm">
                          {isHovered ? 'Explore courses below ↓' : 'Hover to explore courses'}
                        </p>
                      </div>

                      {/* Pulse Effect */}
                      {!hoveredCategory && (
                        <div className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* Course Tiles - Appear below when this category is hovered */}
                  {isHovered && (
                    <div className="mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        {category.courses.map((course, index) => (
                          <a
                            key={index}
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="course-tile group"
                          >
                            <Card className="h-full bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-teal-50 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                              <CardContent className="p-5 text-center">
                                <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                                  {course.emoji}
                                </div>
                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight min-h-[40px] flex items-center justify-center">
                                  {course.name}
                                </h4>
                                <div className="mt-3 text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  Learn More →
                                </div>
                              </CardContent>
                            </Card>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [stats] = useState({ jobs: '11K+', companies: '2,000+', applications: '40K+', professionals: '75K+' });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    fetchFeaturedJobs();
    fetchFeaturedBlogs();
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

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await axios.get(`${API}/blog?featured_only=true&limit=3`);
      setFeaturedBlogs(response.data);
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
      // If no featured blogs, fetch latest blogs as fallback
      try {
        const fallbackResponse = await axios.get(`${API}/blog?limit=3`);
        setFeaturedBlogs(fallbackResponse.data);
      } catch (fallbackError) {
        console.error('Error fetching fallback blogs:', fallbackError);
      }
    }
  };


  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(searchLocation)}`);
  };

  const specializations = [
    { icon: '🩺', name: 'Doctors', count: '2,340+', color: 'from-red-500 to-pink-600' },
    { icon: '💊', name: 'Pharmacists', count: '1,890+', color: 'from-green-500 to-emerald-600' },
    { icon: '🦷', name: 'Dentists', count: '1,245+', color: 'from-blue-500 to-cyan-600' },
    { icon: '🏃‍♂️', name: 'Physiotherapists', count: '967+', color: 'from-purple-500 to-indigo-600' },
    { icon: '👩‍⚕️', name: 'Nurses', count: '3,456+', color: 'from-teal-500 to-cyan-600' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-teal-50 via-white to-emerald-50 overflow-hidden">
        {/* ECG Heartbeat Animation */}
        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            10% { transform: scale(1.1); }
            20% { transform: scale(1); }
            30% { transform: scale(1.15); }
            40% { transform: scale(1); }
          }
          @keyframes ecg-line {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.4; box-shadow: 0 0 10px rgba(20, 184, 166, 0.3); }
            50% { opacity: 0.8; box-shadow: 0 0 20px rgba(20, 184, 166, 0.6); }
          }
        `}</style>
        
        {/* Floating Animation Elements with Enhanced Animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Pulsing Circles */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-teal-200 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-200 rounded-full" style={{animation: 'pulse-glow 2s ease-in-out infinite'}}></div>
          <div className="absolute bottom-32 left-20 w-12 h-12 bg-cyan-200 rounded-full opacity-25 animate-ping"></div>
          
          {/* ECG Wave Line */}
          <svg className="absolute bottom-10 left-0 w-full h-20 opacity-10" viewBox="0 0 1000 100">
            <path
              d="M 0 50 L 200 50 L 220 30 L 240 70 L 260 20 L 280 50 L 400 50 L 420 30 L 440 70 L 460 20 L 480 50 L 600 50 L 620 30 L 640 70 L 660 20 L 680 50 L 1000 50"
              stroke="#14B8A6"
              strokeWidth="3"
              fill="none"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              style={{animation: 'ecg-line 3s linear infinite'}}
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full border border-teal-200 shadow-sm">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-teal-700 font-semibold text-sm">🏥 Trusted by 75,000+ Healthcare Professionals</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Explore The Best
                </h1>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Healthcare Jobs
                  </span>
                </h1>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  In Your Dream Country
                </h1>
              </div>
              
              <p className="text-xl text-gray-600 max-w-2xl">
                AI-Powered Job Recommendations • Customised Search Filters • Dedicated Portal for Healthcare Professionals
              </p>

              {/* Advanced Search Bar */}
              <div className="max-w-2xl" data-testid="hero-search-section">
                <form onSubmit={handleSearch} className="relative">
                  <div className="bg-white rounded-2xl shadow-xl border border-teal-100 p-2 hover:shadow-2xl transition-all duration-500">
                    <div className="flex flex-col md:flex-row gap-2">
                      <div className="flex-1 relative">
                        <Input
                          type="text"
                          placeholder="🔍 Search job title, specialty, or keywords..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-0 h-14 text-base focus:ring-0 focus:outline-none pl-4 pr-12"
                          data-testid="hero-search-input"
                        />
                      </div>
                      <div className="md:w-48">
                        <Input
                          type="text"
                          placeholder="📍 Location..."
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          className="border-0 h-14 text-base focus:ring-0 focus:outline-none"
                          data-testid="hero-location-input"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold h-14 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
                        data-testid="hero-search-button"
                      >
                        Search My Job
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick suggestions */}
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="mr-2">Popular Searches:</span>
                    <span className="text-teal-600 hover:text-teal-700 cursor-pointer mr-3 hover:underline">Dentists</span>
                    <span className="text-teal-600 hover:text-teal-700 cursor-pointer mr-3 hover:underline">Pharmacists</span>
                    <span className="text-teal-600 hover:text-teal-700 cursor-pointer hover:underline">Nurses</span>
                  </div>
                </form>
                
                {/* Action Buttons with Staggered Animation */}
                <div className="flex flex-wrap gap-4 mt-8">
                  {!isAuthenticated ? (
                    <>
                      <Link to="/register">
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up" data-testid="hero-get-started" style={{animationDelay: '1s'}}>
                          🚀 Get Started Free
                        </Button>
                      </Link>
                      <Link to="/jobs">
                        <Button variant="outline" className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300 animate-slide-up" data-testid="hero-browse-jobs" style={{animationDelay: '1.2s'}}>
                          Browse 11K+ Jobs
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/jobs">
                        <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300" data-testid="hero-find-jobs">
                          Find Your Dream Job
                        </Button>
                      </Link>
                      <Link to="/dashboard">
                        <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300" data-testid="hero-dashboard">
                          Dashboard
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Healthcare Professionals Image */}
            <div className="relative animate-slide-up" style={{animationDelay: '1.4s'}}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-3xl transform rotate-3 animate-pulse"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-1 transform -rotate-1 hover:rotate-0 transition-transform duration-700">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_a4ce02d4-d988-4bcc-bfe4-80f85b655205/artifacts/67arpex4_jobslly.jpg" 
                    alt="Jobslly - Connect Healthcare Professionals with Opportunities" 
                    className="w-full h-auto rounded-3xl object-cover"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 transform translate-y-2 hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-semibold text-gray-900">Join Healthcare Professionals</p>
                    <p className="text-xs text-teal-600">Your Dream Career Awaits</p>
                    <p className="text-xs text-gray-600 mt-1">Connect with top employers worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Stats with Icons */}
          <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto mt-20 pt-12 border-t border-teal-100">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <MdWork className="text-4xl md:text-5xl text-teal-600 mx-auto mb-2" />
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2" data-testid="stats-jobs">
                {stats.jobs}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Job Vacancy</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <MdBusiness className="text-4xl md:text-5xl text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2" data-testid="stats-companies">
                {stats.companies}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Healthcare Companies</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <MdPeople className="text-4xl md:text-5xl text-cyan-600 mx-auto mb-2" />
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2" data-testid="stats-professionals">
                {stats.professionals}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Active Professionals</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <MdStar className="text-4xl md:text-5xl text-teal-600 mx-auto mb-2" />
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2" data-testid="stats-applications">
                {stats.applications}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Talented Candidates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Browse Jobs by Category</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore diverse choices. Make informed decisions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {specializations.map((spec, index) => (
              <Link 
                key={spec.name} 
                to={`/jobs?category=${spec.name.toLowerCase()}`}
                className="group block"
                data-testid={`specialization-${spec.name.toLowerCase()}`}
              >
                <Card className="bg-white border border-teal-100 hover:border-teal-300 hover:shadow-xl transition-all duration-500 cursor-pointer h-full transform hover:scale-105 hover:-translate-y-2">
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-500 filter group-hover:drop-shadow-lg">
                      {spec.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-base group-hover:text-teal-700 transition-colors">{spec.name}</h3>
                    <div className="text-sm text-teal-600 font-semibold bg-teal-50 px-3 py-1 rounded-full">
                      {spec.count} Jobs
                    </div>
                    <div className="mt-4 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Jobslly Section */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-emerald-50/50"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-stretch">
            {/* Founder Image */}
            <div className="relative h-full min-h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-emerald-200 rounded-3xl transform rotate-2 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-2 transform -rotate-1 h-full">
                <img 
                  src="https://customer-assets.emergentagent.com/job_seo-job-portal-2/artifacts/jk3lamg8_image.png" 
                  alt="Dr. Akram Ahmad - Founder & CEO" 
                  className="w-full h-full rounded-3xl object-cover"
                />
              </div>
            </div>

            {/* About Content */}
            <div className="space-y-8 flex flex-col justify-center h-full min-h-[600px]">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-teal-100 rounded-full">
                  <span className="text-teal-700 font-semibold text-sm">🌍 Global Healthcare Job Portal</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  About Jobslly.com
                </h2>
                <div className="text-xl text-teal-600 font-semibold">
                  Your Gateway to Global Healthcare Careers
                </div>
              </div>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  <span className="font-semibold text-teal-700">Jobslly.com</span> is a specialized global job portal dedicated exclusively to healthcare professionals, created to connect doctors, pharmacists, nurses, and allied health workers with career opportunities worldwide.
                </p>
                <p>
                  The platform is guided by our <span className="font-semibold text-teal-700">Founder & CEO, Dr. Akram Ahmad</span>, PhD (Medicine) from the Faculty of Medicine and Health, The University of Sydney, Australia, a globally recognised academic, healthcare leader, and international career mentor with over <span className="font-semibold text-emerald-700">14 years of experience</span> across India, Malaysia, and Australia.
                </p>
                <p>
                  Alongside Dr. Akram, Jobslly is supported and mentored by senior experts from leading pharma companies, global CROs, hospitals, and top universities, ensuring every opportunity shared is relevant, credible, and aligned with evolving global healthcare talent needs.
                </p>
                <p className="text-xl font-semibold text-teal-700">
                  Our mission is simple: to become the go-to global destination for healthcare jobs, empowering professionals to build meaningful and successful careers across borders.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-teal-50 px-6 py-3 rounded-xl border border-teal-200">
                  <div className="font-semibold text-teal-700">PhD (Medicine)</div>
                  <div className="text-sm text-gray-600">University of Sydney</div>
                </div>
                <div className="bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-200">
                  <div className="font-semibold text-emerald-700">14+ Years</div>
                  <div className="text-sm text-gray-600">Global Experience</div>
                </div>
                <div className="bg-cyan-50 px-6 py-3 rounded-xl border border-cyan-200">
                  <div className="font-semibold text-cyan-700">Expert Network</div>
                  <div className="text-sm text-gray-600">Leading Institutions</div>
                </div>
              </div>
            </div>
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
              {featuredJobs.slice(0, 6).map((job, index) => (
                <Card key={job.id} className="bg-white border border-gray-200 hover:border-teal-400 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-105 group h-full flex flex-col" data-testid={`featured-job-${job.id}`}>
                  <CardContent className="p-6 relative overflow-hidden flex flex-col h-full">
                    {/* Animated Background Gradient on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {job.job_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-1 text-gray-900 hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="text-blue-600 font-medium mb-1 text-sm">{job.company}</p>
                      <p className="text-gray-500 mb-3 flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </p>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                        {stripHtml(job.description).substring(0, 100)}...
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.requirements.slice(0, 2).map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-200 text-gray-600">
                            {req}
                          </Badge>
                        ))}
                      </div>

                      {/* Spacer to push button to bottom */}
                      <div className="flex-grow"></div>

                      <Link to={`/jobs/${job.slug || job.id}`} className="mt-auto">
                        <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium rounded-md group-hover:shadow-lg transition-all duration-300" data-testid={`apply-job-${job.id}`}>
                          View Details →
                        </Button>
                      </Link>
                    </div>
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
            {featuredBlogs.length > 0 ? (
              featuredBlogs.slice(0, 3).map((blog, index) => (
                <Card key={blog.id || index} className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 h-full">
                  {blog.featured_image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={blog.featured_image} 
                        alt={blog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {e.target.style.display='none'}}
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <Badge className="bg-blue-100 text-blue-800 text-xs mb-3">
                      {blog.category || 'Healthcare'}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                      {blog.seo_description || stripHtml(blog.content).substring(0, 150) + '...'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{blog.read_time || '5 min read'}</span>
                      <Link to="/blogs">
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback content if no featured blogs
              <div className="col-span-3 text-center text-gray-500 py-8">
                <p>No featured articles available at the moment.</p>
                <Link to="/blogs">
                  <Button size="sm" className="mt-4" variant="outline">View All Articles</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link to="/blogs">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-md">
                Explore Health Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action - Interactive Courses Section */}
      <InteractiveCourseSection />
    </div>
  );
};

export default Home;