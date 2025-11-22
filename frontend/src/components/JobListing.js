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

const JobListing = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'doctors', label: '🩺 Doctors' },
    { value: 'pharmacists', label: '💊 Pharmacists' },
    { value: 'dentists', label: '🦷 Dentists' },
    { value: 'physiotherapists', label: '🏃‍♂️ Physiotherapists' },
    { value: 'nurses', label: '👩‍⚕️ Nurses' }
  ];

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
    
    // Updated to work with categories array (matches if category is in the array)
    const matchesCategory = category === 'all' || 
                           (job.categories && Array.isArray(job.categories) && job.categories.includes(category)) ||
                           (job.category && job.category.toLowerCase() === category); // Backward compatibility
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'salary_high':
        // Convert text to numbers for sorting, treat non-numeric as 0
        const bMax = parseFloat(b.salary_max) || 0;
        const aMax = parseFloat(a.salary_max) || 0;
        return bMax - aMax;
      case 'salary_low':
        // Convert text to numbers for sorting, treat non-numeric as 0
        const aMin = parseFloat(a.salary_min) || 0;
        const bMin = parseFloat(b.salary_min) || 0;
        return aMin - bMin;
      case 'company':
        return a.company.localeCompare(b.company);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading healthcare opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
          <p className="text-gray-600">
            {jobs.length}+ healthcare positions available
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-4 mb-4">
              {/* Search Input */}
              <Input
                type="text"
                placeholder="Search by job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12"
                data-testid="job-search-input"
              />
              
              {/* Category Box Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        category === cat.value
                          ? 'bg-teal-600 text-white shadow-md transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                      data-testid={`category-filter-${cat.value}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Filters */}
              <div className="flex gap-3 flex-wrap">
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="w-40 h-12" data-testid="job-type-filter">
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
                  <SelectTrigger className="w-40 h-12" data-testid="job-sort-filter">
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
            <div className="text-sm text-gray-600" data-testid="jobs-count">
              Showing {sortedJobs.length} of {jobs.length} positions
            </div>
          </div>
        </div>

        {/* Job Grid */}
        {sortedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200" data-testid="no-jobs-message">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <Button onClick={() => {setSearchTerm(''); setJobType('all'); setCategory('all');}} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4" data-testid="jobs-grid">
            {sortedJobs.map((job) => (
              <Card key={job.id} className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200" data-testid={`job-card-${job.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {job.job_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {job.salary_min && (
                          <span className="text-sm font-semibold text-green-600">
                            {formatSalary(job.salary_min, job.currency)}
                            {job.salary_max && ` - ${formatSalary(job.salary_max, job.currency)}`}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto md:ml-0">
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-1 text-gray-900 hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="text-blue-600 font-medium mb-2">{job.company}</p>
                      <p className="text-gray-500 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </p>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {job.description.substring(0, 200)}...
                      </p>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.requirements.slice(0, 4).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-gray-200 text-gray-600">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 4 && (
                            <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                              +{job.requirements.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:ml-6 md:flex-shrink-0">
                      <Link to={`/jobs/${job.slug || job.id}`}>
                        <Button className="w-full md:w-32 bg-blue-600 hover:bg-blue-700 text-white" data-testid={`view-job-${job.id}`}>
                          View Details
                        </Button>
                      </Link>
                    </div>
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
          <div className="mt-12 p-8 bg-blue-600 rounded-lg text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Apply?</h2>
            <p className="text-lg mb-6 text-blue-100">
              Create your account to apply for jobs and get personalized recommendations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Started Free
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