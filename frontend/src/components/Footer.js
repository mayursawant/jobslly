import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube,
  Calendar,
  BookOpen,
  Briefcase,
  Users,
  Heart
} from 'lucide-react';

const Footer = () => {
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [jobCategories] = useState([
    { name: 'Doctor Jobs', path: '/jobs?category=doctor', count: '150+' },
    { name: 'Nursing Jobs', path: '/jobs?category=nursing', count: '200+' },
    { name: 'Pharmacy Jobs', path: '/jobs?category=pharmacy', count: '75+' },
    { name: 'Allied Health', path: '/jobs?category=allied', count: '100+' },
    { name: 'Healthcare Technology', path: '/jobs?category=technology', count: '50+' },
    { name: 'MSL Jobs', path: '/jobs?category=msl', count: '25+' }
  ]);

  useEffect(() => {
    // Fetch recent blog posts for footer
    const fetchRecentBlogs = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog?limit=4`);
        if (response.ok) {
          const blogs = await response.json();
          setRecentBlogs(blogs);
        }
      } catch (error) {
        console.error('Failed to fetch recent blogs:', error);
      }
    };

    fetchRecentBlogs();
  }, []);

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Success Stories', path: '/success-stories' },
    { name: 'Employer Services', path: '/employers' },
    { name: 'Job Seeker Guide', path: '/job-seekers' },
    { name: 'Career Resources', path: '/resources' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Help Center', path: '/help' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'Sitemap', path: '/sitemap' }
  ];

  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: 'https://www.facebook.com/academically.australia',
      color: 'hover:text-blue-600'
    },
    { 
      name: 'X', 
      icon: Twitter, 
      url: 'https://x.com/AcademicallyAus',
      color: 'hover:text-gray-400'
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      url: 'https://in.linkedin.com/company/academicallyglobal',
      color: 'hover:text-blue-700'
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      url: 'https://www.instagram.com/academically.global/?igsh=dnJnaWR2ZW9raTV4#',
      color: 'hover:text-pink-600'
    },
    { 
      name: 'YouTube', 
      icon: Youtube, 
      url: 'https://www.youtube.com/@DrAkramAhmad',
      color: 'hover:text-red-600'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Company Information */}
          <div className="space-y-4">
            <div className="mb-6">
              <img 
                src="/jobslly-logo.png" 
                alt="Jobslly Logo" 
                className="h-16 w-auto object-contain"
              />
              <p className="text-sm text-gray-400 mt-2">by Academically Global</p>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting healthcare professionals worldwide with their dream careers. 
              Find opportunities in medicine, nursing, pharmacy, and allied health across the globe.
            </p>
            
            <div className="space-y-3">
              {/* Australia Address */}
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-200 mb-1">Australia:</div>
                  <span className="text-gray-300">Suite 207A/30 Campbell St, Blacktown NSW 2148</span>
                </div>
              </div>
              
              {/* India Address */}
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-200 mb-1">India:</div>
                  <span className="text-gray-300">Plot A2, IT Park, Sahastradhara Rd, Doon IT Park, Sidcul, Dehradun, Uttarakhand 248001</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">08071722349</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">contact@academically.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a 
                  href="https://academicallyglobal.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-emerald-400 transition-colors"
                >
                  www.academicallyglobal.com
                </a>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="pt-4">
              <p className="text-sm font-medium text-gray-300 mb-3">Follow Us</p>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 bg-gray-800 rounded-lg transition-all transform hover:scale-110 ${social.color}`}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links section removed */}

          {/* Job Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span>Job Categories</span>
            </h4>
            <ul className="space-y-2">
              {jobCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.path}
                    className="text-gray-300 hover:text-emerald-400 transition-colors text-sm block py-1 flex items-center justify-between group"
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-gray-500 group-hover:text-emerald-400">
                      {category.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <Link
                to="/jobs"
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center space-x-2"
              >
                <span>View All Jobs</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Recent Blog Posts */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Latest Articles</span>
            </h4>
            <div className="space-y-3">
              {recentBlogs.length > 0 ? (
                recentBlogs.map((blog) => (
                  <Link
                    key={blog.id}
                    to={`/blog/${blog.slug}`}
                    className="block group"
                  >
                    <h5 className="text-sm font-medium text-gray-300 group-hover:text-emerald-400 transition-colors leading-tight line-clamp-2">
                      {blog.title}
                    </h5>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-gray-400 text-sm">
                  <p>• Healthcare Career Trends 2025</p>
                  <p>• International Job Opportunities</p>
                  <p>• Professional Development Tips</p>
                  <p>• Salary & Benefits Guide</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <Link
                to="/blog"
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center space-x-2"
              >
                <span>Read All Articles</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Links Bar */}
      <div className="border-t border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-6 text-xs text-gray-400">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link
                    to={link.path}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-gray-600">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-gray-900 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <p className="text-xs text-gray-400 text-center md:text-left">
              © {currentYear} Jobslly by Academically Global. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 text-center md:text-right">
              Empowering healthcare careers worldwide 🌍 | 
              <span className="ml-1">Built with ❤️ for healthcare professionals</span>
            </p>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-all transform hover:scale-110 z-50"
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;