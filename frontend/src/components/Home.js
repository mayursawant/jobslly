import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      {/* Subtle Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Hero Section with Search */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="animate-fade-in-up">
            {/* Gamification Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-8 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full border border-yellow-400/30 backdrop-blur-sm">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-yellow-400 font-medium text-sm">🚀 Level up your healthcare career</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                The Future of
              </span>
              <span className="block text-slate-900 mt-2">
                Healthcare Careers
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-700 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover opportunities for <span className="text-blue-700 font-semibold">Doctors</span>, <span className="text-emerald-700 font-semibold">Pharmacists</span>, <span className="text-indigo-700 font-semibold">Dentists</span>, <span className="text-purple-700 font-semibold">Physiotherapists</span>, and <span className="text-teal-700 font-semibold">Nurses</span>
            </p>

            {/* Advanced Search Bar */}
            <div className="max-w-4xl mx-auto mb-12" data-testid="hero-search-section">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search by specialty, position, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-300 h-14 text-lg rounded-xl focus:bg-white/30 transition-all"
                      data-testid="hero-search-input"
                    />
                  </div>
                  <div className="flex-1 md:flex-initial md:w-64">
                    <Input
                      type="text"
                      placeholder="Location..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-300 h-14 text-lg rounded-xl focus:bg-white/30 transition-all"
                      data-testid="hero-location-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold h-14 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    data-testid="hero-search-button"
                  >
                    🔍 Search Future
                  </Button>
                </div>
              </form>
              
              {/* Quick Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {!isAuthenticated ? (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" data-testid="hero-get-started">
                        🚀 Start Your Journey
                      </Button>
                    </Link>
                    <Link to="/jobs">
                      <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105" data-testid="hero-browse-jobs">
                        🎯 Explore Opportunities
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/jobs">
                      <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" data-testid="hero-find-jobs">
                        🎯 Find Your Next Role
                      </Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105" data-testid="hero-dashboard">
                        📊 Dashboard
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Gamified Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2" data-testid="stats-jobs">
                  {stats.jobs}+
                </div>
                <div className="text-gray-300 font-medium">🎯 Active Opportunities</div>
              </div>
              <div className="text-center animate-slide-in-right" style={{animationDelay: '0.4s'}}>
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2" data-testid="stats-companies">
                  {stats.companies}+
                </div>
                <div className="text-gray-300 font-medium">🏥 Healthcare Partners</div>
              </div>
              <div className="text-center animate-slide-in-right" style={{animationDelay: '0.6s'}}>
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-2" data-testid="stats-professionals">
                  {stats.professionals}k+
                </div>
                <div className="text-gray-300 font-medium">👨‍⚕️ Active Professionals</div>
              </div>
              <div className="text-center animate-slide-in-right" style={{animationDelay: '0.8s'}}>
                <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2" data-testid="stats-applications">
                  {stats.applications}+
                </div>
                <div className="text-gray-300 font-medium">✅ Success Stories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Specializations */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">Choose Your Healthcare Path</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Unlock opportunities across all healthcare specializations with AI-powered matching
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec, index) => (
              <Card key={spec.name} className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer" data-testid={`specialization-${spec.name.toLowerCase()}`}>
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {spec.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{spec.name}</h3>
                  <div className={`text-lg font-semibold bg-gradient-to-r ${spec.color} bg-clip-text text-transparent mb-4`}>
                    {spec.count} Opportunities
                  </div>
                  <div className="h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/40 transition-all duration-300"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">AI-Powered Career Evolution</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Next-generation technology to accelerate your healthcare career journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-500 hover:scale-105" data-testid="feature-matching">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Smart AI Matching</h3>
                <p className="text-gray-300 text-sm">AI analyzes your healthcare expertise to find perfect role matches</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-400 transition-all duration-500 hover:scale-105" data-testid="feature-resume">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Resume Evolution</h3>
                <p className="text-gray-300 text-sm">AI-powered analysis to optimize your healthcare resume</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 hover:border-emerald-400 transition-all duration-500 hover:scale-105" data-testid="feature-interview">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Interview Mastery</h3>
                <p className="text-gray-300 text-sm">AI-generated questions for healthcare interview success</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-500 hover:scale-105" data-testid="feature-assistant">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Career AI Assistant</h3>
                <p className="text-gray-300 text-sm">24/7 intelligent guidance for your healthcare career</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <section className="py-20 px-4" data-testid="featured-jobs-section">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-4">Trending Healthcare Opportunities</h2>
              <p className="text-xl text-gray-300">Discover your next career milestone</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredJobs.slice(0, 6).map((job) => (
                <Card key={job.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer" data-testid={`featured-job-${job.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                        {job.job_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {job.salary_min && (
                        <span className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                          ${job.salary_min.toLocaleString()}+
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">{job.title}</h3>
                    <p className="text-cyan-400 font-medium mb-2">{job.company}</p>
                    <p className="text-gray-300 mb-4 flex items-center">
                      <span className="mr-2">📍</span>
                      {job.location}
                    </p>
                    
                    <p className="text-gray-300 mb-4 line-clamp-3 text-sm">
                      {job.description.substring(0, 120)}...
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.slice(0, 2).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-white/20 text-gray-300">
                          {req}
                        </Badge>
                      ))}
                    </div>

                    <Link to={`/jobs/${job.id}`}>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105" data-testid={`apply-job-${job.id}`}>
                        🎯 Explore Role
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/jobs">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" data-testid="view-all-jobs">
                  🚀 Discover All Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Health Hub Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">🧠 Health Hub</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stay ahead with the latest healthcare insights, career tips, and industry trends
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Sample blog previews - these would be fetched from API */}
            <Card className="group bg-white/5 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400 transition-all duration-500 hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border-emerald-500/30 mb-4">
                  Healthcare Trends
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  AI Revolution in Healthcare: What It Means for Your Career
                </h3>
                <p className="text-gray-300 mb-4 line-clamp-3">
                  Discover how artificial intelligence is transforming healthcare delivery and creating new career opportunities...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">5 min read</span>
                  <Link to="/blog">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/5 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400 transition-all duration-500 hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 mb-4">
                  Career Development
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  Telehealth Opportunities: The Future of Remote Healthcare
                </h3>
                <p className="text-gray-300 mb-4 line-clamp-3">
                  Explore the growing field of telehealth and how healthcare professionals can transition to remote work...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">7 min read</span>
                  <Link to="/blog">
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/5 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400 transition-all duration-500 hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30 mb-4">
                  Industry News
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  Mental Health Careers: Meeting Growing Demand
                </h3>
                <p className="text-gray-300 mb-4 line-clamp-3">
                  Understanding the surge in mental health awareness and the career opportunities it creates...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">6 min read</span>
                  <Link to="/blog">
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/blog">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                🧠 Explore Health Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 backdrop-blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="text-6xl">🚀</span>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Transform Your Healthcare Career?</h2>
          <p className="text-xl text-gray-300 mb-12 opacity-90">
            Join thousands of healthcare professionals who discovered their dream careers through Jobslly
          </p>
          
          {!isAuthenticated ? (
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110" data-testid="cta-join-now">
                🌟 Join the Future - It's Free!
              </Button>
            </Link>
          ) : (
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110" data-testid="cta-explore-opportunities">
                🎯 Explore Your Opportunities
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;