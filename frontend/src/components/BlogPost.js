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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading article...</p>
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
                "url": "https://careerheal.preview.emergentagent.com/logo.png"
              }
            },
            "datePublished": post.published_at,
            "dateModified": post.updated_at || post.published_at
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative py-24 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog')}
              className="mb-8 text-emerald-400 hover:text-emerald-300 hover:bg-white/5"
            >
              ← Back to Health Hub
            </Button>

            {/* Article Header */}
            <Card className="glass-strong border-emerald-500/30 mb-8">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border-emerald-500/30 mb-4">
                    {post.category}
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {post.title}
                  </h1>
                  <p className="text-xl text-gray-300 mb-6">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div>
                      Published {new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-white/20 text-gray-400">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {post.featured_image && (
                  <div className="h-64 md:h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl mb-8"></div>
                )}
              </CardContent>
            </Card>

            {/* Article Content */}
            <Card className="glass-strong border-white/10 mb-12">
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{
                    color: '#e5e7eb',
                    lineHeight: '1.8'
                  }}
                />
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