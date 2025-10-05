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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBlogPosts();
    fetchFeaturedPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog?limit=12`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog?featured_only=true&limit=3`);
      setFeaturedPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch featured posts:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Health Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Health Hub</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl">
              Stay updated with the latest healthcare trends, career insights, and professional development tips
            </p>

            {/* Search Bar */}
            <div className="max-w-xl">
              <Input
                type="text"
                placeholder="Search articles, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12"
                data-testid="blog-search-input"
              />
            </div>
          </div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="mb-20">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Featured Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <Card key={post.id} className="group bg-white/5 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400 transition-all duration-500 hover:scale-105 cursor-pointer">
                    <CardContent className="p-0">
                      {post.featured_image && (
                        <div className="h-48 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-t-lg"></div>
                      )}
                      <div className="p-6">
                        <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border-emerald-500/30 mb-4">
                          Featured
                        </Badge>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                          <Link to={`/blog/${post.slug}`}>
                            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white">
                              Read More
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* All Posts */}
          <section>
            <h2 className="text-4xl font-bold text-white mb-8 text-center">Latest Articles</h2>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search criteria</p>
                <Button onClick={() => setSearchTerm('')} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 cursor-pointer">
                    <CardContent className="p-0">
                      {post.featured_image && (
                        <div className="h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-t-lg"></div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="border-white/20 text-gray-300">
                            {post.category}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-300 mb-4 line-clamp-3 text-sm">{post.excerpt}</p>
                        
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-white/5 text-gray-400">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Link to={`/blog/${post.slug}`}>
                          <Button size="sm" className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
                            Read Article →
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Newsletter Signup */}
          <section className="mt-20 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
                <p className="text-gray-300 mb-6">Get the latest healthcare career insights delivered to your inbox</p>
                <div className="flex gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                  <Button className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white px-8">
                    Subscribe
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