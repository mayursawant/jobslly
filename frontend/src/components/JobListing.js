import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const JobListing = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs?limit=50`);
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = jobType === 'all' || job.job_type === jobType;
    
    return matchesSearch && matchesType;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'salary_high':
        return (b.salary_max || 0) - (a.salary_max || 0);
      case 'salary_low':
        return (a.salary_min || 0) - (b.salary_min || 0);
      case 'company':
        return a.company.localeCompare(b.company);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading healthcare opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Healthcare Job Opportunities</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your next career move in healthcare with {jobs.length}+ active positions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full"
                data-testid="job-search-input"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="w-40" data-testid="job-type-filter">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="job-sort-filter">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="salary_high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary_low">Salary: Low to High</SelectItem>
                  <SelectItem value="company">Company A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-center text-gray-600" data-testid="jobs-count">
            Showing {sortedJobs.length} of {jobs.length} positions
          </div>
        </div>

        {/* Job Grid */}
        {sortedJobs.length === 0 ? (
          <div className="text-center py-16" data-testid="no-jobs-message">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <Button onClick={() => {setSearchTerm(''); setJobType('all');}} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="jobs-grid">
            {sortedJobs.map((job) => (
              <Card key={job.id} className="job-card" data-testid={`job-card-${job.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {job.job_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {job.salary_min && (
                      <span className="text-sm font-medium text-emerald-600">
                        ${job.salary_min.toLocaleString()}
                        {job.salary_max && ` - $${job.salary_max.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{job.title}</h3>
                  <p className="text-emerald-600 font-medium mb-2">{job.company}</p>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </p>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {job.description.substring(0, 150)}...
                  </p>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/jobs/${job.id}`} className="flex-1">
                      <Button className="w-full btn-primary" data-testid={`view-job-${job.id}`}>
                        View Details
                      </Button>
                    </Link>
                    
                    {isAuthenticated && user?.role === 'job_seeker' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="px-3"
                        title="Quick Apply"
                        data-testid={`quick-apply-${job.id}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {sortedJobs.length >= 50 && (
          <div className="text-center mt-12">
            <Button onClick={fetchJobs} variant="outline" size="lg">
              Load More Jobs
            </Button>
          </div>
        )}

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <div className="mt-16 text-center p-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Apply?</h2>
            <p className="text-lg mb-6 opacity-90">
              Create your account to apply for jobs and get personalized recommendations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                  Create Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListing;