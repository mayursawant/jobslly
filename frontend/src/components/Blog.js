import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both in parallel with timeout
        const [postsRes, featuredRes] = await Promise.all([
          axios.get(`${API}/blog?limit=12`, { timeout: 30000 }),
          axios.get(`${API}/blog?featured_only=true&limit=4`, { timeout: 30000 })
        ]);
        setPosts(postsRes.data);
        setFeaturedPosts(featuredRes.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
        setError('Failed to load articles. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Health Hub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700">
            Retry
          </Button>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
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
                                // Fallback to placeholder if image fails to load
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
                          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              📅 {new Date(post.published_at).toLocaleDateString()}
                            </span>
                            <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl px-4 py-2 transform hover:scale-105 transition-all duration-300">
                              Read Article →
                            </Button>
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Healthcare Insights</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto rounded-full"></div>
            </div>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No articles found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">We couldn't find any articles matching your search. Try different keywords or browse our featured content.</p>
                <Button onClick={() => setSearchTerm('')} className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl">
                  🔄 Clear Search & Browse All
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <Link key={post.id} to={`/blogs/${post.slug}`} className="block">
                    <Card className="group bg-white border border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-1 h-full">
                      <CardContent className="p-0 overflow-hidden rounded-lg">
                        {post.featured_image ? (
                          <div className="h-48 bg-gray-100 rounded-t-lg relative overflow-hidden">
                            <img 
                              src={post.featured_image} 
                              alt={post.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg hidden items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-emerald-400/10"></div>
                              <span className="text-5xl opacity-60 relative z-10">
                                {post.category === 'Healthcare Trends' ? '📈' : 
                                 post.category === 'Career Development' ? '🚀' : 
                                 post.category === 'Industry News' ? '📰' : '🏥'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-emerald-400/10"></div>
                            <span className="text-5xl opacity-60 relative z-10">
                              {post.category === 'Healthcare Trends' ? '📈' : 
                               post.category === 'Career Development' ? '🚀' : 
                               post.category === 'Industry News' ? '📰' : '🏥'}
                            </span>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge 
                              variant="outline" 
                              className={`text-xs border ${
                                post.category === 'Healthcare Trends' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                                post.category === 'Career Development' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                post.category === 'Industry News' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                                'border-teal-200 text-teal-700 bg-teal-50'
                              }`}
                            >
                              {post.category}
                            </Badge>
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              📅 {new Date(post.published_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors line-clamp-2 leading-tight">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                          
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-teal-50 text-teal-600 border-teal-200">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Button size="sm" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transform hover:scale-105 transition-all duration-300">
                            📖 Read Full Article →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
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
                <p className="text-xs text-teal-100 mt-4 opacity-80">
                  No spam. Unsubscribe anytime. Join the healthcare community.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Blog;