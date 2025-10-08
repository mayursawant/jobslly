import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const Sitemap = () => {
  const siteStructure = [
    {
      category: 'Main Pages',
      links: [
        { name: 'Home', path: '/', description: 'Main landing page with healthcare job search' },
        { name: 'Job Opportunities', path: '/jobs', description: 'Browse all healthcare job listings' },
        { name: 'Health Hub (Blog)', path: '/blog', description: 'Healthcare insights and career advice' },
        { name: 'About Us', path: '/about', description: 'Learn about Jobslly and our mission' },
      ]
    },
    {
      category: 'Job Categories',
      links: [
        { name: 'Doctor Jobs', path: '/jobs?category=doctors', description: 'Medical physician opportunities' },
        { name: 'Nursing Jobs', path: '/jobs?category=nurses', description: 'Registered nurse positions' },
        { name: 'Pharmacy Jobs', path: '/jobs?category=pharmacy', description: 'Pharmacist and pharmacy tech roles' },
        { name: 'Dentist Jobs', path: '/jobs?category=dentist', description: 'Dental professional opportunities' },
        { name: 'Physiotherapy Jobs', path: '/jobs?category=physiotherapy', description: 'Physical therapy positions' },
      ]
    },
    {
      category: 'User Account',
      links: [
        { name: 'Sign In', path: '/login', description: 'Login to your healthcare professional account' },
        { name: 'Create Account', path: '/register', description: 'Register as a healthcare professional' },
        { name: 'Dashboard', path: '/dashboard', description: 'Manage your profile and applications' },
      ]
    },
    {
      category: 'Resources',
      links: [
        { name: 'Career Guidance', path: '/blog?category=career', description: 'Professional development articles' },
        { name: 'Industry News', path: '/blog?category=news', description: 'Latest healthcare industry updates' },
        { name: 'Healthcare Trends', path: '/blog?category=trends', description: 'Emerging trends in healthcare' },
      ]
    },
    {
      category: 'Legal & Support',
      links: [
        { name: 'Privacy Policy', path: '/privacy-policy', description: 'How we protect your data' },
        { name: 'Terms of Service', path: '/terms-of-service', description: 'Platform usage terms and conditions' },
        { name: 'Contact Us', path: '/contact', description: 'Get in touch with our support team' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Sitemap</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Navigate through all pages and sections of the Jobslly healthcare job platform
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {siteStructure.map((section, index) => (
            <Card key={index} className="bg-white border border-teal-100 hover:border-teal-300 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-teal-700 flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  {section.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="border-l-2 border-teal-100 pl-4 hover:border-teal-300 transition-colors">
                      <Link 
                        to={link.path}
                        className="block group"
                      >
                        <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                          {link.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {link.description}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center p-8 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Healthcare Job?</h2>
          <p className="text-teal-100 mb-6 text-lg">
            Join thousands of healthcare professionals who found their perfect career match
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs">
              <button className="bg-white text-teal-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-xl transform hover:scale-105 transition-all duration-300">
                Browse Jobs Now
              </button>
            </Link>
            <Link to="/register">
              <button className="border-2 border-white text-white hover:bg-white hover:text-teal-600 font-semibold px-8 py-3 rounded-xl transform hover:scale-105 transition-all duration-300">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;