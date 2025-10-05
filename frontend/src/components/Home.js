import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({ jobs: 0, companies: 0, applications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs?limit=6`);
      setFeaturedJobs(response.data);
      
      // Mock some stats for demonstration
      setStats({
        jobs: response.data.length * 10,
        companies: Math.floor(response.data.length * 2.5),
        applications: response.data.length * 50
      });
    } catch (error) {
      console.error('Failed to fetch featured jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 to-teal-100/40"></div>
        
        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient-primary">Healthcare</span>
              <br />
              <span className="text-gray-800">Career Opportunities</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect talented healthcare professionals with leading medical institutions. 
              AI-powered matching for the perfect career fit.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {!isAuthenticated ? (
                <>
                  <Link to="/register">
                    <Button size="lg" className="btn-primary text-lg px-8 py-4 animate-pulse-glow" data-testid="hero-get-started">
                      Get Started Today
                    </Button>
                  </Link>
                  <Link to="/jobs">
                    <Button variant="outline" size="lg" className="btn-secondary text-lg px-8 py-4" data-testid="hero-browse-jobs">
                      Browse Jobs
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/jobs">
                    <Button size="lg" className="btn-primary text-lg px-8 py-4" data-testid="hero-find-jobs">
                      Find Your Next Role
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="lg" className="btn-secondary text-lg px-8 py-4" data-testid="hero-dashboard">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                <div className="text-4xl font-bold text-emerald-600 mb-2" data-testid="stats-jobs">{stats.jobs}+</div>
                <div className="text-gray-600">Active Jobs</div>
              </div>
              <div className="text-center animate-slide-in-right" style={{animationDelay: '0.4s'}}>
                <div className="text-4xl font-bold text-emerald-600 mb-2" data-testid="stats-companies">{stats.companies}+</div>
                <div className="text-gray-600">Healthcare Partners</div>
              </div>
              <div className="text-center animate-slide-in-right" style={{animationDelay: '0.6s'}}>
                <div className="text-4xl font-bold text-emerald-600 mb-2" data-testid="stats-applications">{stats.applications}+</div>
                <div className="text-gray-600">Successful Placements</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">AI-Powered Healthcare Recruitment</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets healthcare expertise to deliver unmatched career opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="card group hover:border-emerald-200" data-testid="feature-matching">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Smart Job Matching</h3>
                <p className="text-gray-600">AI analyzes your skills and preferences to find perfect healthcare roles</p>
              </CardContent>
            </Card>

            <Card className="card group hover:border-emerald-200" data-testid="feature-resume">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 100 2v1a1 1 0 100 2v1a1 1 0 100 2v1a1 1 0 100 2v1a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 4.5a.5.5 0 000 1h7a.5.5 0 000-1h-7z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Resume Analysis</h3>
                <p className="text-gray-600">Get AI-powered feedback to optimize your healthcare resume</p>
              </CardContent>
            </Card>

            <Card className="card group hover:border-emerald-200" data-testid="feature-interview">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Interview Prep</h3>
                <p className="text-gray-600">AI-generated questions specific to healthcare positions</p>
              </CardContent>
            </Card>

            <Card className="card group hover:border-emerald-200" data-testid="feature-assistant">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Career Assistant</h3>
                <p className="text-gray-600">24/7 AI chatbot for career guidance and job search support</p>
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
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Healthcare Opportunities</h2>
              <p className="text-xl text-gray-600">Discover your next career move in healthcare</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredJobs.slice(0, 6).map((job) => (
                <Card key={job.id} className="job-card" data-testid={`featured-job-${job.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {job.job_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {job.salary_min && (
                        <span className="text-sm font-medium text-emerald-600">
                          ${job.salary_min.toLocaleString()}+
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{job.title}</h3>
                    <p className="text-emerald-600 font-medium mb-2">{job.company}</p>
                    <p className="text-gray-600 mb-4">{job.location}</p>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {job.description.substring(0, 120)}...
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.slice(0, 2).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>

                    <Link to={`/jobs/${job.id}`}>
                      <Button className="w-full btn-primary" data-testid={`apply-job-${job.id}`}>
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/jobs">
                <Button size="lg" className="btn-primary" data-testid="view-all-jobs">
                  View All Jobs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Healthcare Career?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of healthcare professionals who found their dream jobs through our platform
          </p>
          
          {!isAuthenticated ? (
            <Link to="/register">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-4" data-testid="cta-join-now">
                Join Now - It's Free
              </Button>
            </Link>
          ) : (
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-4" data-testid="cta-explore-opportunities">
                Explore Opportunities
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;