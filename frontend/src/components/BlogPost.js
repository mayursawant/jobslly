import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPost();
    fetchRelatedPosts();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      const response = await axios.get(`${API}/blog/${slug}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to fetch blog post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog?limit=3`);
      setRelatedPosts(response.data.filter(p => p.slug !== slug));
    } catch (error) {
      console.error('Failed to fetch related posts:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.seo_title || post.title} - Jobslly Health Hub</title>
        <meta name="description" content={post.seo_description || post.excerpt} />
        <meta name="keywords" content={post.seo_keywords.join(', ')} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "author": {
              "@type": "Organization",
              "name": "Jobslly"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Jobslly",
              "logo": {
                "@type": "ImageObject",
                "url": "https://jobslly-health.preview.emergentagent.com/logo.png"
              }
            },
            "datePublished": post.published_at,
            "dateModified": post.updated_at || post.published_at
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        {/* Hero Section */}
        <section className="relative py-16 px-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white overflow-hidden">
          {/* Background animation elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 left-40 w-12 h-12 bg-white/15 rounded-full animate-ping"></div>
          </div>
          
          <div className="max-w-4xl mx-auto relative">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog')}
              className="mb-6 text-white hover:text-teal-100 hover:bg-white/10 border border-white/20"
            >
              ← Back to Health Hub
            </Button>
            
            <div className="mb-6">
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                {post.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-xl text-teal-100 mb-6">{post.excerpt}</p>
              
              <div className="flex flex-wrap items-center justify-between text-sm text-teal-100">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">📅</span>
                    </div>
                    <span>
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-white/30 text-white bg-white/10">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {post.featured_image && (
              <div className="h-64 md:h-80 bg-white/10 rounded-2xl mb-8 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                <div className="text-6xl opacity-60">🏥</div>
              </div>
            )}
          </div>
        </section>

        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Article Content */}
            <Card className="bg-white shadow-xl border border-gray-100 mb-16 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{
                    color: '#374151',
                    lineHeight: '1.8',
                    fontSize: '18px'
                  }}
                />
              </CardContent>
            </Card>

            {/* Article Actions */}
            <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 mb-16">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <span className="text-4xl mb-4 block">💼</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Start Your Healthcare Career?</h3>
                  <p className="text-gray-600 mb-6">
                    Explore thousands of healthcare opportunities matching your expertise
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/jobs')}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl transform hover:scale-105 transition-all duration-300"
                  >
                    🔍 Browse Healthcare Jobs
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3 rounded-xl transform hover:scale-105 transition-all duration-300"
                  >
                    📝 Create Free Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.slice(0, 3).map((relatedPost) => (
                    <Card key={relatedPost.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                      <CardContent className="p-6">
                        <Badge variant="outline" className="border-white/20 text-gray-300 mb-3">
                          {relatedPost.category}
                        </Badge>
                        <h4 className="font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-gray-300 text-sm line-clamp-3 mb-4">{relatedPost.excerpt}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          Read More
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;