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
import { API_BASE } from '../config/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API = API_BASE;

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

const JobListing = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const JOBS_PER_PAGE = 20;

  // Filter state
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
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [category, jobType, searchTerm]);

  useEffect(() => {
    fetchJobs();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, category, jobType, sortBy]); // searchTerm is handled via explicit search or debounce, but for now we'll trigger on debounce if we had it.
  // Actually, searching on every keypress is bad. Let's rely on a separate search trigger or debounce. 
  // For simplicity matching previous behavior, we might assume user presses Enter or just types. 
  // Ideally, add a debounce in a real app, but here we can add it to deps for instant feedback if backend is fast.
  // To avoid spamming backend, let's use a timeout for search term

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500); // 500ms debounce for search
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const skip = (currentPage - 1) * JOBS_PER_PAGE;
      const params = {
        skip,
        limit: JOBS_PER_PAGE,
      };

      if (searchTerm) params.q = searchTerm;
      if (category !== 'all') params.category = category;
      if (jobType !== 'all') params.job_type = jobType;

      // Note: sortBy is handled on client-side or we need to add backend support.
      // The current backend implementation sorts by date/archived.
      // We will fetch sorted results from backend (default) or implementing sort query param later.
      // For now, sorting logic was client-side on the full list. 
      // With pagination, sorting MUST be server-side.
      // Our new endpoint doesn't support 'sort' param yet, it defaults to Newest.
      // We'll stick to Newest (default) for now as it's the most common use case.
      // If client-side sort is needed, it only works on the current page which is weird.

      const response = await axios.get(`${API}/jobs/search`, { params });

      const { jobs: newJobs, total, total_pages } = response.data;

      setJobs(newJobs);
      setTotalJobs(total);
      setTotalPages(total_pages);

    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Client-side sorting for the *current page* (less ideal but keeps the functionality somewhat)
  // Or better, we just accept that 'Newest' is the standard for paginated feeds.
  const sortedJobs = [...jobs].sort((a, b) => {
    // ALWAYS keep archived jobs at the bottom
    if (a.is_archived && !b.is_archived) return 1;
    if (!a.is_archived && b.is_archived) return -1;

    switch (sortBy) {
      case 'salary_high':
        return (parseFloat(b.salary_max) || 0) - (parseFloat(a.salary_max) || 0);
      case 'salary_low':
        return (parseFloat(a.salary_min) || 0) - (parseFloat(b.salary_min) || 0);
      case 'company':
        return a.company.localeCompare(b.company);
      default:
        // Already sorted by date in backend
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
          </div>

          {/* Filter Bar Skeleton */}
          <div className="mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="h-12 w-full bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-12 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Job Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-6 w-20 bg-blue-100 rounded animate-pulse"></div>
                      <div className="h-5 w-24 bg-green-100 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-100 rounded ml-auto animate-pulse"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-5 w-40 bg-blue-100 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-100 rounded mb-3 animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-100 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-100 rounded mb-3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${category === cat.value
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
            <Button onClick={() => { setSearchTerm(''); setJobType('all'); setCategory('all'); }} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">Showing {sortedJobs.length} of {totalJobs} jobs</p>
            </div>

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
                          {job.is_archived && (
                            <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                              </svg>
                              ARCHIVED
                            </Badge>
                          )}
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
                          {stripHtml(job.description).substring(0, 200)}...
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

            {/* Numbered Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="icon"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    // Simple pagination logic to show 5 pages around current
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className={currentPage === pageNum ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="icon"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
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