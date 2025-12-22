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
                "url": "https://jobfix-complete.preview.emergentagent.com/logo.png"
              }
            },
            "datePublished": post.published_at,
            "dateModified": post.updated_at || post.published_at
          })}
        </script>
        {/* FAQ Schema for SEO */}
        {post.faqs && post.faqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": post.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        )}
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
              onClick={() => navigate('/blogs')}
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
              <div className="bg-white/10 rounded-2xl mb-8 border border-white/20 backdrop-blur-sm overflow-hidden">
                <img 
                  src={post.featured_image} 
                  alt={post.title}
                  className="w-full h-auto max-h-96 object-contain rounded-2xl"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="h-64 md:h-80 bg-white/10 rounded-2xl hidden items-center justify-center">
                  <div className="text-6xl opacity-60">🏥</div>
                </div>
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
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>

            {/* FAQs Section */}
            {post.faqs && post.faqs.length > 0 && (
              <Card className="bg-white shadow-xl border border-gray-100 mb-16">
                <CardContent className="p-8 md:p-12">
                  <div className="mb-8 text-center">
                    <span className="text-4xl mb-3 block">❓</span>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 mx-auto rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    {post.faqs.map((faq, index) => (
                      <details key={index} className="group bg-teal-50/50 border border-teal-100 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300">
                        <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 flex justify-between items-center hover:bg-teal-50 transition-colors">
                          <span className="flex-1">{faq.question}</span>
                          <svg className="w-5 h-5 text-teal-600 transform transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="px-6 py-4 text-gray-700 bg-white border-t border-teal-100">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">You Might Also Like</h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 mx-auto rounded-full"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedPosts.slice(0, 3).map((relatedPost, index) => (
                    <Card key={relatedPost.id} className="group bg-white border border-teal-100 hover:border-teal-300 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-2">
                      <CardContent className="p-0 overflow-hidden rounded-lg">
                        <div className="h-40 bg-gradient-to-br from-teal-100 to-emerald-100 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-emerald-400/20"></div>
                          <div className="absolute bottom-4 right-4">
                            <div className="text-3xl filter drop-shadow-lg">
                              {relatedPost.category === 'Healthcare Trends' ? '📈' : 
                               relatedPost.category === 'Career Development' ? '🚀' : 
                               relatedPost.category === 'Industry News' ? '📰' : '🏥'}
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <Badge 
                            variant="outline" 
                            className={`text-xs mb-3 border ${
                              relatedPost.category === 'Healthcare Trends' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                              relatedPost.category === 'Career Development' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                              relatedPost.category === 'Industry News' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                              'border-teal-200 text-teal-700 bg-teal-50'
                            }`}
                          >
                            {relatedPost.category}
                          </Badge>
                          <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2 leading-tight">
                            {relatedPost.title}
                          </h4>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">{relatedPost.excerpt}</p>
                          <Button 
                            size="sm" 
                            onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transform hover:scale-105 transition-all duration-300"
                          >
                            📖 Read Article →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Newsletter CTA */}
            <section className="mt-20">
              <Card className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 border-0 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <CardContent className="p-12 text-center relative">
                  <div className="mb-6">
                    <span className="text-5xl">📧</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Get More Healthcare Insights</h3>
                  <p className="text-teal-100 mb-8 text-lg max-w-2xl mx-auto">
                    Join 75,000+ healthcare professionals receiving weekly career tips and job opportunities
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email address..."
                      className="flex-1 h-12 px-4 bg-white/95 border-0 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50"
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
    </>
  );
};

export default BlogPost;