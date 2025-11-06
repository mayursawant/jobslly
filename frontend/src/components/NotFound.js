import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Home, Briefcase, BookOpen, Mail, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <Card className="border-teal-200 shadow-2xl">
          <CardContent className="p-12 text-center">
            {/* 404 Animation */}
            <div className="mb-8">
              <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 animate-pulse">
                404
              </div>
              <div className="text-2xl font-semibold text-gray-700 mt-4">
                Page Not Found
              </div>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                Oops! The page you're looking for seems to have taken a coffee break. 
                Let's get you back on track.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              <Link to="/">
                <Card className="border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-6">
                    <Home className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">Home</h3>
                    <p className="text-sm text-gray-600">
                      Return to homepage
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/jobs">
                <Card className="border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-6">
                    <Briefcase className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">Browse Jobs</h3>
                    <p className="text-sm text-gray-600">
                      Explore healthcare opportunities
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/blogs">
                <Card className="border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-6">
                    <BookOpen className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">Health Hub</h3>
                    <p className="text-sm text-gray-600">
                      Read healthcare articles
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/contact">
                <Card className="border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-6">
                    <Mail className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">Contact Us</h3>
                    <p className="text-sm text-gray-600">
                      Get in touch with our team
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="border-teal-300 text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Link to="/jobs" className="w-full sm:w-auto">
                <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Search Jobs
                </Button>
              </Link>
            </div>

            {/* Helpful Tip */}
            <div className="mt-8 p-4 bg-teal-50 border border-teal-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-teal-800">
                💡 <strong>Tip:</strong> If you followed a link from another site, 
                it might be outdated. Try searching for what you need!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
