import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select } from './ui/select';
import { MapPin, Briefcase, DollarSign, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract category from URL path
  const pathname = window.location.pathname;
  const category = pathname.split('/jobs/')[1]?.replace(/\/$/, '') || '';
  
  const [categoryData, setCategoryData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    job_type: searchParams.get('job_type') || '',
    experience: searchParams.get('experience') || '',
  });
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const jobsPerPage = 20;

  useEffect(() => {
    fetchCategoryJobs();
  }, [category, currentPage, filters]);

  const fetchCategoryJobs = async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * jobsPerPage;
      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: jobsPerPage.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories/${category}?${queryParams}`);
      if (!response.ok) {
        throw new Error('Category not found');
      }
      const data = await response.json();
      setCategoryData(data.category);
      setJobs(data.jobs);
    } catch (error) {
      console.error('Error fetching category jobs:', error);
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewJobDetails = (slug) => {
    navigate(`/jobs/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return null;
  }

  const totalPages = Math.ceil(categoryData.total_count / jobsPerPage);

  return (
    <>
      <Helmet>
        <title>{categoryData.seo_title}</title>
        <meta name="description" content={categoryData.meta_description} />
        <link rel="canonical" href={`https://jobslly.com/jobs/${category}`} />
        <meta property="og:title" content={categoryData.seo_title} />
        <meta property="og:description" content={categoryData.meta_description} />
        <meta property="og:url" content={`https://jobslly.com/jobs/${category}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryData.h1}</h1>
            <p className="text-lg md:text-xl opacity-90">
              Explore {categoryData.total_count || 0} job opportunities in {categoryData.name.replace(' Jobs', '')}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters Section */}
          <Card className="mb-8 p-6">
            <h2 className="text-xl font-semibold mb-4">Filter Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Bangalore"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Job Type</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.job_type}
                  onChange={(e) => handleFilterChange('job_type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Max Experience (years)</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.location || filters.job_type || filters.experience) && (
              <Button
                onClick={() => {
                  setFilters({ location: '', job_type: '', experience: '' });
                  setSearchParams({});
                }}
                variant="outline"
                className="mt-4"
              >
                Clear All Filters
              </Button>
            )}
          </Card>

          {/* Jobs List */}
          <div className="mb-8">
            <p className="text-gray-600 mb-6">
              Showing {jobs.length} of {categoryData.job_count || 0} jobs
            </p>

            {jobs.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
                <Button
                  onClick={() => {
                    setFilters({ location: '', job_type: '', experience: '' });
                    setSearchParams({});
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => viewJobDetails(job.slug)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                          {job.title}
                        </h3>
                        <p className="text-gray-700 font-medium mb-3">{job.company}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          {job.job_type && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                            </div>
                          )}
                          {(job.salary_min || job.salary_max) && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                {job.salary_min && `₹${parseInt(job.salary_min).toLocaleString()}`}
                                {job.salary_min && job.salary_max && ' - '}
                                {job.salary_max && `₹${parseInt(job.salary_max).toLocaleString()}`}
                                {job.currency && job.currency !== 'INR' && ` ${job.currency}`}
                              </span>
                            </div>
                          )}
                          {job.experience_years !== null && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.experience_years}+ years exp</span>
                            </div>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-gray-600 mt-3 line-clamp-2">
                            {job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {job.is_archived && (
                          <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                            </svg>
                            ARCHIVED
                          </Badge>
                        )}
                        <Button className="whitespace-nowrap">View Details</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
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
                      variant={currentPage === pageNum ? 'default' : 'outline'}
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
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
