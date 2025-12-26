
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

import { API_BASE } from '../config/api';

const API = API_BASE;

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const POSTS_PER_PAGE = 9;

  useEffect(() => {
    fetchFeaturedPosts();
  }, []);

  useEffect(() => {
    // Debounce search to avoid excessive API calls
    const timer = setTimeout(() => {
      fetchPosts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, category, currentPage]);

  const fetchFeaturedPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog?featured_only=true&limit=3`);
      const data = response.data.posts ? response.data.posts : response.data;
      setFeaturedPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch featured posts:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * POSTS_PER_PAGE;

      const params = {
        limit: POSTS_PER_PAGE,
        skip,
        page: currentPage
      };

      if (searchTerm) params.q = searchTerm;
      if (category !== 'all') params.category = category;

      const response = await axios.get(`${API}/blog`, { params });

      // Handle response - supporting new format
      const { posts: newPosts, total, total_pages } = response.data;

      setPosts(newPosts || []);
      setTotalPosts(total || 0);
      setTotalPages(total_pages || 1);
      setError(null);

      // Scroll to top of posts section
      if (currentPage > 1) {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }

    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
      setError('Failed to load articles. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setCurrentPage(1); // Reset to page 1 on filter change
    setSearchTerm(''); // Optional: clear search on category change
  };

  const categories = [
    'all', 'Healthcare Trends', 'Career Development', 'Industry News', 'Medical Licensing'
  ];

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <section className="relative py-20 px-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600">
          <div className="max-w-7xl mx-auto text-center">
            <div className="h-10 w-64 bg-white/20 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-white/20 rounded mx-auto animate-pulse"></div>
          </div>
        </section>
        <div className="py-16 px-4 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white overflow-hidden">
        {/* Background animation elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-40 w-12 h-12 bg-white/15 rounded-full animate-ping"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-white/20 rounded-full border border-white/30">
            <span className="text-white font-semibold text-sm">🧠 Healthcare Knowledge Hub</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Health Hub
          </h1>

          <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
            Stay ahead with the latest healthcare insights, career guidance, and industry trends
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="🔍 Search articles, trends, or topics..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="h-14 pl-12 pr-4 bg-white/95 border-0 text-gray-900 placeholder-gray-500 rounded-2xl shadow-lg focus:ring-0 focus:outline-none"
                data-testid="blog-search-input"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat
                    ? 'bg-white text-teal-700 shadow-md transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Featured Posts */}
          {!searchTerm && category === 'all' && currentPage === 1 && featuredPosts.length > 0 && (
            <section className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Articles</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 mx-auto rounded-full"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {featuredPosts.map((post, index) => (
                  <Link key={post.id} to={`/blogs/${post.slug}`} className="block">
                    <Card className="group bg-white border border-teal-100 hover:border-teal-300 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-2 h-full">
                      <CardContent className="p-0 overflow-hidden rounded-lg">
                        {post.featured_image ? (
                          <div className="h-48 bg-gray-100 rounded-t-lg relative overflow-hidden">
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="h-48 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-t-lg hidden items-center justify-center">
                              <span className="text-6xl opacity-50">{index === 0 ? '🏥' : index === 1 ? '💊' : '🩺'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-t-lg flex items-center justify-center">
                            <span className="text-6xl opacity-50">{index === 0 ? '🏥' : index === 1 ? '💊' : '🩺'}</span>
                          </div>
                        )}
                        <div className="p-6">
                          <Badge className="bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 border-teal-200 text-xs mb-4">
                            ⭐ Featured
                          </Badge>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors line-clamp-2 leading-tight">
                            {post.title}
                          </h3>
                          <div className="flex justify-between items-center mt-auto">
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              📅 {new Date(post.published_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All Posts */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {searchTerm ? `Search Results for "${searchTerm}"` :
                  category !== 'all' ? `${category} Articles` : 'Latest Healthcare Insights'}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto rounded-full"></div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 h-80 animate-pulse"></div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No articles found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">We couldn't find any articles matching your search. Try different keywords.</p>
                <Button onClick={() => { setSearchTerm(''); setCategory('all'); }} className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-xl">
                  🔄 Clear Search
                </Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {posts.map((post, index) => (
                    <Link key={post.id} to={`/blogs/${post.slug}`} className="block">
                      <Card className="group bg-white border border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-1 h-full flex flex-col">
                        <CardContent className="p-0 overflow-hidden rounded-lg flex-1 flex flex-col">
                          {post.featured_image ? (
                            <div className="h-48 bg-gray-100 rounded-t-lg relative overflow-hidden">
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg hidden items-center justify-center">
                                <span className="text-4xl opacity-40">📰</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                              <span className="text-4xl opacity-40">📰</span>
                            </div>
                          )}
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                                {post.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(post.published_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">{post.excerpt}</p>

                            <Button size="sm" className="w-full mt-auto bg-white border border-teal-600 text-teal-600 hover:bg-teal-50">
                              Read Full Article →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="icon"
                      className="w-10 h-10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Page Numbers */}
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
                            variant={currentPage === pageNum ? "default" : "outline"}
                            className={`w-10 h-10 ${currentPage === pageNum ? "bg-teal-600 text-white" : ""}`}
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
                      className="w-10 h-10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Newsletter Signup */}
          <section className="mt-20">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 border-0 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardContent className="p-12 text-center relative">
                <div className="mb-6">
                  <span className="text-5xl">📧</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Stay Ahead in Healthcare</h3>
                <p className="text-teal-100 mb-8 text-lg max-w-2xl mx-auto">
                  Join 75,000+ healthcare professionals getting weekly insights, career tips, and exclusive job opportunities
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email address..."
                    className="flex-1 h-12 bg-white/95 border-0 text-gray-900 placeholder-gray-500 rounded-xl"
                  />
                  <Button className="bg-white text-teal-600 hover:bg-gray-50 font-semibold px-8 h-12 rounded-xl transform hover:scale-105 transition-all duration-300">
                    🚀 Subscribe Free
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Blog;